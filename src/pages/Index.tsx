import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Play } from 'lucide-react';
import EVMap from '@/components/EVMap';
import RoutePanel, { RoutePlanParams } from '@/components/RoutePanel';
import RouteComparisonCards from '@/components/RouteComparisonCards';
import TimelineView from '@/components/TimelineView';
import ChargingStationDrawer from '@/components/ChargingStationDrawer';
import AIAssistant, { AIAction } from '@/components/AIAssistant';
import NavigationMode from '@/components/NavigationMode';
import { Button } from '@/components/ui/button';
import { 
  ChargingStation, 
  RouteOption, 
  RouteStop, 
  mockChargingStations, 
  indianCities 
} from '@/lib/evData';
import { useToast } from '@/hooks/use-toast';

const VEHICLE_SPECS = {
  usableBatteryKWh: 45,
  consumptionKWhPerKm: 0.16,
  maxChargingPowerKW: 60,
  minReserveSocPct: 15,
  targetArrivalSocPct: 20,
  avgSpeedKmh: 70,
};

const NAV_SIM_SPEED_MULTIPLIER = 1000;

type RouteMode = 'fastest' | 'cheapest' | 'safest';

const MODE_CONFIG = {
  fastest: {
    reserveSocPct: 12,
    chargeTargetPct: 0,
    timeWeight: 1,
    costWeight: 0.05,
    riskWeight: 0.1,
    powerWeight: 0.2,
  },
  cheapest: {
    reserveSocPct: 15,
    chargeTargetPct: 85,
    timeWeight: 0.2,
    costWeight: 1,
    riskWeight: 0.1,
    powerWeight: 0.05,
  },
  safest: {
    reserveSocPct: 25,
    chargeTargetPct: 90,
    timeWeight: 0.4,
    costWeight: 0.1,
    riskWeight: 1,
    powerWeight: 0.1,
  },
} as const;

type RouteNode = {
  id: string;
  type: 'origin' | 'destination' | 'station';
  name: string;
  lat: number;
  lng: number;
  station?: ChargingStation;
};

type GraphEdge = {
  to: number;
  distanceKm: number;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const haversineKm = (a: RouteNode, b: RouteNode) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
};

const haversineCoordsKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * earthRadiusKm * Math.asin(Math.min(1, Math.sqrt(h)));
};

const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes)) return '--';
  if (minutes < 1) return 'Arriving';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
};

const buildInstruction = (currentStop: RouteStop | null, nextStop: RouteStop | null) => {
  if (!currentStop || !nextStop) return 'Ready to navigate';
  if (nextStop.type === 'destination') {
    return `Continue to ${nextStop.name}`;
  }
  if (nextStop.type === 'charging') {
    return `Proceed to ${nextStop.name} for charging`;
  }
  return `Head towards ${nextStop.name}`;
};

const formatEta = (minutesFromNow: number) => {
  const eta = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return eta.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
};

const buildGraph = (
  nodes: RouteNode[],
  maxEdgeKm: number,
  startEdgeKm: number,
  originIndex: number
) => {
  const edges: GraphEdge[][] = Array.from({ length: nodes.length }, () => []);
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = 0; j < nodes.length; j += 1) {
      if (i === j) continue;
      const distance = haversineKm(nodes[i], nodes[j]);
      const limit = i === originIndex ? startEdgeKm : maxEdgeKm;
      if (distance <= limit) {
        edges[i].push({ to: j, distanceKm: distance });
      }
    }
  }
  return edges;
};

const getRiskScore = (station?: ChargingStation) => {
  if (!station) return 0;
  const availabilityRatio = station.total > 0 ? station.available / station.total : 0;
  const ratingRisk = 1 - station.rating / 5;
  const availabilityRisk = 1 - availabilityRatio;
  const statusRisk = station.status === 'offline' ? 1 : station.status === 'busy' ? 0.4 : 0;
  return ratingRisk * 0.5 + availabilityRisk * 0.3 + statusRisk * 0.2;
};

const getAveragePrice = (nodes: RouteNode[]) => {
  const prices = nodes
    .map((node) => node.station?.pricePerKwh)
    .filter((value): value is number => value !== undefined);
  if (prices.length === 0) return 0;
  return prices.reduce((sum, value) => sum + value, 0) / prices.length;
};

const dijkstra = (
  nodes: RouteNode[],
  edges: GraphEdge[][],
  startIndex: number,
  endIndex: number,
  mode: RouteMode,
  reserveOverridePct?: number | null
) => {
  const distances = Array(nodes.length).fill(Number.POSITIVE_INFINITY);
  const previous = Array(nodes.length).fill(-1);
  const visited = Array(nodes.length).fill(false);
  distances[startIndex] = 0;

  const config = MODE_CONFIG[mode];
  const reserveSocPct = reserveOverridePct ?? config.reserveSocPct;
  const reserveEnergy =
    (reserveSocPct / 100) * VEHICLE_SPECS.usableBatteryKWh;
  const maxLegEnergy =
    VEHICLE_SPECS.usableBatteryKWh - reserveEnergy;
  const maxLegDistance =
    maxLegEnergy / VEHICLE_SPECS.consumptionKWhPerKm;

  for (let step = 0; step < nodes.length; step += 1) {
    let current = -1;
    let best = Number.POSITIVE_INFINITY;
    for (let i = 0; i < nodes.length; i += 1) {
      if (!visited[i] && distances[i] < best) {
        best = distances[i];
        current = i;
      }
    }
    if (current === -1 || current === endIndex) break;
    visited[current] = true;

    edges[current].forEach((edge) => {
      if (edge.distanceKm > maxLegDistance) return;
      const energyNeeded = edge.distanceKm * VEHICLE_SPECS.consumptionKWhPerKm;
      const driveTime = (edge.distanceKm / VEHICLE_SPECS.avgSpeedKmh) * 60;
      const chargingPower = Math.min(
        VEHICLE_SPECS.maxChargingPowerKW,
        nodes[current].station?.maxPower ?? VEHICLE_SPECS.maxChargingPowerKW
      );
      const chargingTime =
        nodes[current].type === 'station'
          ? (energyNeeded / chargingPower) * 60
          : 0;
      const monetaryCost =
        nodes[current].type === 'station' && nodes[current].station
          ? energyNeeded * nodes[current].station.pricePerKwh
          : 0;
      const riskScore =
        getRiskScore(nodes[current].station) + getRiskScore(nodes[edge.to].station);
      const powerPenalty =
        nodes[current].type === 'station'
          ? (VEHICLE_SPECS.maxChargingPowerKW - chargingPower) / VEHICLE_SPECS.maxChargingPowerKW
          : 0;

      const edgeCost =
        config.timeWeight * (driveTime + chargingTime) +
        config.costWeight * monetaryCost +
        config.riskWeight * riskScore * 120 +
        config.powerWeight * powerPenalty * 60;

      const alt = distances[current] + edgeCost;
      if (alt < distances[edge.to]) {
        distances[edge.to] = alt;
        previous[edge.to] = current;
      }
    });
  }

  const path: number[] = [];
  let node = endIndex;
  while (node !== -1) {
    path.unshift(node);
    node = previous[node];
  }
  return path.length > 1 ? path : [];
};

const buildRouteOption = (
  mode: RouteMode,
  nodes: RouteNode[],
  path: number[],
  startBatteryPct: number,
  arrivalTargetPct: number,
  reserveOverridePct?: number | null
): RouteOption => {
  const config = MODE_CONFIG[mode];
  const reservePct = reserveOverridePct ?? config.reserveSocPct;
  const reserveEnergy =
    (reservePct / 100) * VEHICLE_SPECS.usableBatteryKWh;
  const avgPrice = getAveragePrice(nodes);
  const stops: RouteStop[] = [];

  let currentBatteryPct = startBatteryPct;
  let totalDistance = 0;
  let totalTime = 0;
  let totalCost = 0;
  let totalRisk = 0;

  for (let i = 0; i < path.length; i += 1) {
    const node = nodes[path[i]];
    if (i === 0) {
      stops.push({
        id: 'start',
        type: 'start',
        name: node.name,
        lat: node.lat,
        lng: node.lng,
        arrivalBattery: currentBatteryPct,
        departureBattery: currentBatteryPct,
        distance: 0,
        eta: formatEta(0),
      });
      continue;
    }

    const prevNode = nodes[path[i - 1]];
    const distanceKm = haversineKm(prevNode, node);
    const energyNeeded = distanceKm * VEHICLE_SPECS.consumptionKWhPerKm;
    const energyNeededPct = (energyNeeded / VEHICLE_SPECS.usableBatteryKWh) * 100;

    let departureBatteryPct = currentBatteryPct;
    let chargeTime = 0;
    if (prevNode.type === 'station') {
      const targetDeparturePct = Math.min(
        100,
        ((energyNeeded + reserveEnergy) / VEHICLE_SPECS.usableBatteryKWh) * 100
      );
      let desiredDeparturePct = targetDeparturePct;
      if (mode === 'cheapest' && prevNode.station) {
        if (prevNode.station.pricePerKwh <= avgPrice) {
          desiredDeparturePct = Math.max(desiredDeparturePct, config.chargeTargetPct);
        }
      } else if (mode === 'safest') {
        desiredDeparturePct = Math.max(desiredDeparturePct, config.chargeTargetPct);
      }

      if (desiredDeparturePct > departureBatteryPct) {
        const chargingPower = Math.min(
          VEHICLE_SPECS.maxChargingPowerKW,
          prevNode.station?.maxPower ?? VEHICLE_SPECS.maxChargingPowerKW
        );
        const energyToAddKwh =
          ((desiredDeparturePct - departureBatteryPct) / 100) *
          VEHICLE_SPECS.usableBatteryKWh;
        chargeTime = (energyToAddKwh / chargingPower) * 60;
        totalCost += energyToAddKwh * (prevNode.station?.pricePerKwh ?? 0);
        departureBatteryPct = desiredDeparturePct;
      }
    }

    const arrivalBatteryPct = Math.max(0, departureBatteryPct - energyNeededPct);
    const driveTime = (distanceKm / VEHICLE_SPECS.avgSpeedKmh) * 60;
    totalDistance += distanceKm;
    totalTime += driveTime + chargeTime;
    totalRisk += getRiskScore(prevNode.station);

    const stopType = node.type === 'destination' ? 'destination' : 'charging';
    const etaMinutes = totalTime;
    const arrivalTarget = node.type === 'destination'
      ? Math.max(arrivalTargetPct, reservePct)
      : reservePct;

    stops.push({
      id: node.id,
      type: stopType,
      name: node.name,
      lat: node.lat,
      lng: node.lng,
      arrivalBattery: Math.round(arrivalBatteryPct),
      departureBattery: Math.round(
        node.type === 'destination' ? Math.max(arrivalBatteryPct, arrivalTarget) : departureBatteryPct
      ),
      chargeTime: chargeTime > 0 ? Math.round(chargeTime) : undefined,
      station: node.station,
      distance: Math.round(distanceKm),
      eta: formatEta(etaMinutes),
    });

    currentBatteryPct = arrivalBatteryPct;
  }

  const chargingStops = stops.filter((stop) => stop.type === 'charging').length;
  const riskLevel = totalRisk / Math.max(1, chargingStops) > 0.6 ? 'danger' : totalRisk > 0.35 ? 'caution' : 'safe';
  const roundedDistance = Math.round(totalDistance);

  return {
    id: mode,
    type: mode,
    name: mode === 'fastest' ? 'Fastest Route' : mode === 'cheapest' ? 'Cheapest Route' : 'Safest Route',
    description:
      mode === 'fastest'
        ? 'Minimum travel time with optimal charging'
        : mode === 'cheapest'
        ? 'Lowest energy cost with affordable charging stops'
        : 'Extra safety buffer with reliable stations',
    totalDistance: roundedDistance,
    totalTime: Math.round(totalTime),
    totalCost: Math.round(totalCost),
    chargingStops,
    co2Saved: Math.round(roundedDistance * 0.12),
    fuelSaved: Math.round(roundedDistance * 0.06),
    greenScore: mode === 'cheapest' ? 92 : mode === 'safest' ? 88 : 85,
    stops,
    riskLevel,
  };
};

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navCurrentStop, setNavCurrentStop] = useState<RouteStop | null>(null);
  const [navNextStop, setNavNextStop] = useState<RouteStop | null>(null);
  const [navDistanceToNext, setNavDistanceToNext] = useState(0);
  const [navEtaToNext, setNavEtaToNext] = useState('');
  const [navBattery, setNavBattery] = useState(0);
  const [navProgress, setNavProgress] = useState(0);
  const [navInstruction, setNavInstruction] = useState('Ready to navigate');
  const navigationTimerRef = useRef<number | null>(null);
  const [aiHelpOpen, setAiHelpOpen] = useState(false);
  const [aiHelpText, setAiHelpText] = useState('');
  const [routeStatus, setRouteStatus] = useState<'found' | 'not_found' | null>(null);
  const [lastPlanParams, setLastPlanParams] = useState<RoutePlanParams | null>(null);
  const [preferOperator, setPreferOperator] = useState<string | null>(null);
  const [avoidedOperators, setAvoidedOperators] = useState<string[]>([]);
  const [minChargerPower, setMinChargerPower] = useState<number | null>(null);
  const [reserveOverridePct, setReserveOverridePct] = useState<number | null>(null);
  const [arrivalTargetOverride, setArrivalTargetOverride] = useState<number | null>(null);

  const routePath = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.stops.map(stop => [stop.lat, stop.lng] as [number, number]);
  }, [selectedRoute]);

  useEffect(() => {
    if (navigationTimerRef.current) {
      window.clearInterval(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    if (!isNavigating || !selectedRoute || selectedRoute.stops.length < 2) {
      return;
    }

    const stops = selectedRoute.stops;
    const segmentDistances = stops.slice(1).map((stop, index) =>
      haversineCoordsKm(stops[index], stop)
    );
    const totalDistance = segmentDistances.reduce((sum, value) => sum + value, 0);
    const speedKmh = VEHICLE_SPECS.avgSpeedKmh * NAV_SIM_SPEED_MULTIPLIER;
    const tickSeconds = 1;

    let segmentIndex = 0;
    let distanceIntoSegment = 0;
    let traveledDistance = 0;
    let pauseSeconds = 0;
    let currentBatteryPct = stops[0].arrivalBattery;

    const updateDerivedState = () => {
      const currentStop = stops[segmentIndex];
      const nextStop = stops[segmentIndex + 1] ?? null;
      const remainingSegment = Math.max(0, segmentDistances[segmentIndex] - distanceIntoSegment);
      const etaMinutes = remainingSegment / speedKmh * 60;

      setNavCurrentStop(currentStop ?? null);
      setNavNextStop(nextStop);
      setNavDistanceToNext(Math.round(remainingSegment));
      setNavEtaToNext(formatDuration(etaMinutes));
      setNavBattery(Math.max(0, Math.round(currentBatteryPct)));
      setNavProgress(totalDistance > 0 ? (traveledDistance / totalDistance) * 100 : 0);
      setNavInstruction(buildInstruction(currentStop ?? null, nextStop));
    };

    updateDerivedState();

    navigationTimerRef.current = window.setInterval(() => {
      if (pauseSeconds > 0) {
        pauseSeconds -= tickSeconds;
        updateDerivedState();
        return;
      }

      const distanceThisTick = (speedKmh / 3600) * tickSeconds;
      traveledDistance += distanceThisTick;
      distanceIntoSegment += distanceThisTick;
      currentBatteryPct -=
        (distanceThisTick * VEHICLE_SPECS.consumptionKWhPerKm / VEHICLE_SPECS.usableBatteryKWh) * 100;

      if (distanceIntoSegment >= segmentDistances[segmentIndex]) {
        const arrivedStop = stops[segmentIndex + 1];
        if (!arrivedStop) {
          setNavProgress(100);
          setNavBattery(Math.max(0, Math.round(currentBatteryPct)));
          setNavInstruction('Arrived at destination');
          setIsNavigating(false);
          return;
        }

        segmentIndex += 1;
        distanceIntoSegment = 0;
        currentBatteryPct = arrivedStop.arrivalBattery;

        if (arrivedStop.type === 'charging' && arrivedStop.chargeTime) {
          pauseSeconds = Math.round((arrivedStop.chargeTime * 60) / NAV_SIM_SPEED_MULTIPLIER);
          currentBatteryPct = arrivedStop.departureBattery;
        }

        if (segmentIndex >= segmentDistances.length) {
          setNavProgress(100);
          setNavBattery(Math.max(0, Math.round(currentBatteryPct)));
          setNavInstruction(`Arrived at ${arrivedStop.name}`);
          setIsNavigating(false);
          return;
        }
      }

      updateDerivedState();
    }, tickSeconds * 1000);

    return () => {
      if (navigationTimerRef.current) {
        window.clearInterval(navigationTimerRef.current);
        navigationTimerRef.current = null;
      }
    };
  }, [isNavigating, selectedRoute]);

  const handlePlanRoute = async (
    params: RoutePlanParams,
    overrides?: {
      reserveOverridePct?: number | null;
      arrivalTargetOverride?: number | null;
      preferOperator?: string | null;
      avoidedOperators?: string[];
      minChargerPower?: number | null;
    }
  ) => {
    setIsLoading(true);
    setLastPlanParams(params);
    setRouteStatus(null);
    
    // Simulate route calculation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const origin = indianCities.find(c => c.name === params.origin);
    const dest = indianCities.find(c => c.name === params.destination);

    if (!origin || !dest) {
      toast({
        title: "Error",
        description: "Please select valid origin and destination",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const effectiveMinPower = overrides?.minChargerPower ?? minChargerPower;
    const effectiveAvoidedOperators = overrides?.avoidedOperators ?? avoidedOperators;
    const effectivePreferOperator = overrides?.preferOperator ?? preferOperator;
    const effectiveReserveOverride = overrides?.reserveOverridePct ?? reserveOverridePct;
    const effectiveArrivalTargetOverride = overrides?.arrivalTargetOverride ?? arrivalTargetOverride;

    let filteredStations = mockChargingStations.filter((station) => {
      if (effectiveMinPower && station.maxPower < effectiveMinPower) return false;
      if (effectiveAvoidedOperators.includes(station.operator)) return false;
      return true;
    });

    if (effectivePreferOperator) {
      const preferred = filteredStations.filter((station) => station.operator === effectivePreferOperator);
      if (preferred.length > 0) {
        filteredStations = preferred;
      }
    }

    const nodes: RouteNode[] = [
      {
        id: 'origin',
        type: 'origin',
        name: params.origin,
        lat: origin.lat,
        lng: origin.lng,
      },
      ...filteredStations.map((station) => ({
        id: station.id,
        type: 'station' as const,
        name: station.name,
        lat: station.lat,
        lng: station.lng,
        station,
      })),
      {
        id: 'destination',
        type: 'destination',
        name: params.destination,
        lat: dest.lat,
        lng: dest.lng,
      },
    ];

    const originIndex = 0;
    const destinationIndex = nodes.length - 1;
    const maxEdgeKm =
      (VEHICLE_SPECS.usableBatteryKWh *
        (1 - VEHICLE_SPECS.minReserveSocPct / 100)) /
      VEHICLE_SPECS.consumptionKWhPerKm;
    const startRangeKm = Math.max(
      0,
      (VEHICLE_SPECS.usableBatteryKWh *
        (Math.max(params.startBattery, VEHICLE_SPECS.minReserveSocPct) / 100 -
          VEHICLE_SPECS.minReserveSocPct / 100)) /
        VEHICLE_SPECS.consumptionKWhPerKm
    );

    const edges = buildGraph(nodes, maxEdgeKm, startRangeKm, originIndex);

    const fastestPath = dijkstra(
      nodes,
      edges,
      originIndex,
      destinationIndex,
      'fastest',
      effectiveReserveOverride
    );
    const cheapestPath = dijkstra(
      nodes,
      edges,
      originIndex,
      destinationIndex,
      'cheapest',
      effectiveReserveOverride
    );
    const safestPath = dijkstra(
      nodes,
      edges,
      originIndex,
      destinationIndex,
      'safest',
      effectiveReserveOverride
    );

    const effectiveArrivalTarget = effectiveArrivalTargetOverride ?? params.arrivalTarget;
    const routes: RouteOption[] = [
      buildRouteOption('fastest', nodes, fastestPath, params.startBattery, effectiveArrivalTarget, effectiveReserveOverride),
      buildRouteOption('cheapest', nodes, cheapestPath, params.startBattery, effectiveArrivalTarget, effectiveReserveOverride),
      buildRouteOption('safest', nodes, safestPath, params.startBattery, effectiveArrivalTarget, effectiveReserveOverride),
    ].filter((route) => route.stops.length > 1);

    if (routes.length === 0) {
      setRouteStatus('not_found');
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      const fallbackTips = [
        'Increase start battery by 10-20 percent.',
        'Reduce reserve buffer or arrival target.',
        'Choose a shorter origin/destination pair.',
        'Try cheapest mode to allow longer detours.',
      ];

      const prompt = [
        'Suggest 3-5 concise fixes for a failed EV route plan.',
        `Origin: ${params.origin}. Destination: ${params.destination}.`,
        `Start battery: ${params.startBattery} percent.`,
        `Arrival target: ${params.arrivalTarget} percent.`,
        `Vehicle usable battery: ${VEHICLE_SPECS.usableBatteryKWh} kWh.`,
        `Consumption: ${VEHICLE_SPECS.consumptionKWhPerKm} kWh/km.`,
        'Return plain text bullet points.',
      ].join(' ');

      let suggestionText = '';
      if (apiKey) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );
          if (response.ok) {
            const data = await response.json();
            suggestionText =
              data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          }
        } catch (error) {
          suggestionText = '';
        }
      }

      if (!suggestionText) {
        suggestionText = fallbackTips.map((tip) => `- ${tip}`).join('\n');
      }

      setAiHelpText(suggestionText);
      setAiHelpOpen(true);
      toast({
        title: "No route found",
        description: "Try increasing the start battery or lowering the reserve buffer. AI tips are ready.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    setRouteStatus('found');
    setRouteOptions(routes);
    setSelectedRoute(routes[0]);
    setIsLoading(false);

    toast({
      title: "Routes calculated!",
      description: `Found ${routes.length} optimized routes for your journey`,
    });
  };

  const handleStationClick = (station: ChargingStation) => {
    setSelectedStation(station);
    setIsDrawerOpen(true);
  };

  const handleAddAsStop = (station: ChargingStation) => {
    toast({
      title: "Stop added!",
      description: `${station.name} has been added to your route`,
    });
    setIsDrawerOpen(false);
  };

  const handleAiAction = (action: AIAction) => {
    const replan = (
      override?: Partial<RoutePlanParams>,
      overrides?: {
        reserveOverridePct?: number | null;
        arrivalTargetOverride?: number | null;
        preferOperator?: string | null;
        avoidedOperators?: string[];
        minChargerPower?: number | null;
      }
    ) => {
      if (!lastPlanParams) return;
      handlePlanRoute({ ...lastPlanParams, ...override }, overrides);
    };

    switch (action.type) {
      case 'switch_mode': {
        const mode = action.params?.mode as RouteMode | undefined;
        const match = mode ? routeOptions.find(route => route.type === mode) : null;
        if (match) {
          setSelectedRoute(match);
          toast({ title: "Route updated", description: `Switched to ${match.name}` });
        }
        return;
      }
      case 'adjust_battery': {
        if (action.params?.reserveSocPct !== undefined) {
          const nextReserve = action.params.reserveSocPct as number;
          setReserveOverridePct(nextReserve);
          replan(undefined, { reserveOverridePct: nextReserve });
        }
        if (action.params?.arrivalTarget !== undefined) {
          const nextArrival = action.params.arrivalTarget as number;
          setArrivalTargetOverride(nextArrival);
          replan({ arrivalTarget: nextArrival }, { arrivalTargetOverride: nextArrival });
          return;
        }
        return;
      }
      case 'set_min_power': {
        if (action.params?.minPower !== undefined) {
          const nextMinPower = action.params.minPower as number;
          setMinChargerPower(nextMinPower);
          replan(undefined, { minChargerPower: nextMinPower });
        }
        return;
      }
      case 'prefer_operator': {
        const operator = action.params?.operator as string | undefined;
        if (operator) {
          setPreferOperator(operator);
          setAvoidedOperators(prev => prev.filter(item => item !== operator));
          replan(undefined, { preferOperator: operator });
        }
        return;
      }
      case 'avoid_operator': {
        const operator = action.params?.operator as string | undefined;
        if (operator) {
          const nextAvoided = avoidedOperators.includes(operator)
            ? avoidedOperators
            : [...avoidedOperators, operator];
          setAvoidedOperators(nextAvoided);
          if (preferOperator === operator) setPreferOperator(null);
          replan(undefined, { avoidedOperators: nextAvoided });
        }
        return;
      }
      case 'add_stop': {
        const referenceStop = navCurrentStop ?? selectedRoute?.stops[0] ?? null;
        const stations = mockChargingStations.filter((station) => station.maxPower >= 60);
        if (!referenceStop || stations.length === 0) {
          toast({ title: "No station suggestion", description: "Try selecting a route first." });
          return;
        }
        const nearest = stations
          .map((station) => ({
            station,
            distance: haversineCoordsKm(referenceStop, station),
          }))
          .sort((a, b) => a.distance - b.distance)[0]?.station;
        if (nearest) {
          setSelectedStation(nearest);
          setIsDrawerOpen(true);
          toast({ title: "Suggested station", description: nearest.name });
        }
        return;
      }
      default:
        return;
    }
  };

  const handleStartNavigation = () => {
    if (!selectedRoute) return;
    setIsNavigating(true);
    toast({
      title: "Navigation started",
      description: "Follow the directions on your screen",
    });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* AI Help Panel */}
      {aiHelpOpen && (
        <div className="absolute top-24 left-4 z-30 w-96">
          <div className="glass-panel border border-border/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold">AI Suggestions</h3>
                <p className="text-xs text-muted-foreground">
                  Tips to make your route feasible
                </p>
              </div>
              <button
                onClick={() => setAiHelpOpen(false)}
                className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                ✕
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm text-foreground">
              {aiHelpText}
            </pre>
          </div>
        </div>
      )}

      {!aiHelpOpen && aiHelpText && (
        <div className="absolute top-24 left-4 z-30">
          <button
            onClick={() => setAiHelpOpen(true)}
            className="glass-panel border border-border/40 rounded-full px-4 py-2 text-sm font-semibold shadow-lg hover:bg-secondary/40 transition-colors"
          >
            AI Help
          </button>
        </div>
      )}
      {/* Map Layer */}
      <EVMap
        stations={mockChargingStations}
        routeStops={selectedRoute?.stops || []}
        onStationClick={handleStationClick}
        routePath={routePath}
      />

      {/* Left Panel - Route Planning */}
      <div className="absolute top-4 left-4 z-20 w-80">
        <RoutePanel onPlanRoute={handlePlanRoute} isLoading={isLoading} />
      </div>

      {/* Right Panel - Timeline */}
      <AnimatePresence>
        {selectedRoute && (
          <div className="absolute top-4 right-4 z-20 w-80">
            <TimelineView stops={selectedRoute.stops} isVisible={!!selectedRoute} />
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Panel - Route Comparison */}
      <AnimatePresence>
        {routeOptions.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="max-w-4xl mx-auto">
              <RouteComparisonCards
                routes={routeOptions}
                selectedRoute={selectedRoute}
                onSelectRoute={setSelectedRoute}
              />
              
              {/* Start Navigation Button */}
              {selectedRoute && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 flex justify-center"
                >
                  <Button
                    variant="gradient"
                    size="xl"
                    className="px-12"
                    onClick={handleStartNavigation}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Navigation
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Charging Station Drawer */}
      <ChargingStationDrawer
        station={selectedStation}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAddAsStop={handleAddAsStop}
        onPrefer={(station) => {
          toast({ title: "Preference saved", description: `${station.operator} stations will be prioritized` });
          setIsDrawerOpen(false);
        }}
        onAvoidOperator={(operator) => {
          toast({ title: "Preference saved", description: `${operator} stations will be avoided` });
          setIsDrawerOpen(false);
        }}
        onShowAlternatives={(station) => {
          toast({ title: "Finding alternatives...", description: "Searching for nearby stations" });
          setIsDrawerOpen(false);
        }}
      />

      {/* Navigation Mode Overlay */}
      <NavigationMode
        isActive={isNavigating}
        onClose={() => setIsNavigating(false)}
        currentStop={navCurrentStop}
        nextStop={navNextStop}
        distanceToNext={navDistanceToNext}
        etaToNext={navEtaToNext}
        currentBattery={navBattery}
        totalProgress={navProgress}
        instruction={navInstruction}
      />

      {/* AI Assistant */}
      <AIAssistant
        onAction={handleAiAction}
        routeOptions={routeOptions}
        selectedRoute={selectedRoute}
        currentStop={navCurrentStop}
        nextStop={navNextStop}
        currentBattery={navBattery}
        isNavigating={isNavigating}
        routeStatus={routeStatus}
      />
    </div>
  );
};

export default Index;
