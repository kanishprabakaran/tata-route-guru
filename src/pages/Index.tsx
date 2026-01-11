import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Play } from 'lucide-react';
import EVMap from '@/components/EVMap';
import RoutePanel, { RoutePlanParams } from '@/components/RoutePanel';
import RouteComparisonCards from '@/components/RouteComparisonCards';
import TimelineView from '@/components/TimelineView';
import ChargingStationDrawer from '@/components/ChargingStationDrawer';
import AIAssistant from '@/components/AIAssistant';
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

const Index = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const routePath = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.stops.map(stop => [stop.lat, stop.lng] as [number, number]);
  }, [selectedRoute]);

  const handlePlanRoute = async (params: RoutePlanParams) => {
    setIsLoading(true);
    
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

    // Generate mock routes
    const baseDistance = Math.round(Math.sqrt(
      Math.pow((dest.lat - origin.lat) * 111, 2) + 
      Math.pow((dest.lng - origin.lng) * 85, 2)
    ));

    const routes: RouteOption[] = [
      {
        id: 'fastest',
        type: 'fastest',
        name: 'Fastest Route',
        description: 'Minimum travel time with fast chargers only',
        totalDistance: baseDistance,
        totalTime: Math.round(baseDistance * 1.2),
        totalCost: Math.round(baseDistance * 0.8),
        chargingStops: 2,
        co2Saved: Math.round(baseDistance * 0.12),
        fuelSaved: Math.round(baseDistance * 0.06),
        greenScore: 85,
        riskLevel: 'caution',
        stops: [
          {
            id: 'start',
            type: 'start',
            name: params.origin,
            lat: origin.lat,
            lng: origin.lng,
            arrivalBattery: params.startBattery,
            departureBattery: params.startBattery,
            distance: 0,
            eta: 'Now',
          },
          {
            id: 'cs1',
            type: 'charging',
            name: 'Tata Power EZ Charge - Mathura',
            lat: 27.4924,
            lng: 77.6737,
            arrivalBattery: 18,
            departureBattery: 80,
            chargeTime: 35,
            station: mockChargingStations[0],
            distance: Math.round(baseDistance * 0.35),
            eta: '2:30 PM',
          },
          {
            id: 'cs2',
            type: 'charging',
            name: 'Fortum Charge - Gwalior',
            lat: 26.2183,
            lng: 78.1828,
            arrivalBattery: 22,
            departureBattery: 75,
            chargeTime: 28,
            station: mockChargingStations[2],
            distance: Math.round(baseDistance * 0.35),
            eta: '5:15 PM',
          },
          {
            id: 'dest',
            type: 'destination',
            name: params.destination,
            lat: dest.lat,
            lng: dest.lng,
            arrivalBattery: params.arrivalTarget,
            departureBattery: params.arrivalTarget,
            distance: Math.round(baseDistance * 0.30),
            eta: '7:45 PM',
          },
        ],
      },
      {
        id: 'cheapest',
        type: 'cheapest',
        name: 'Cheapest Route',
        description: 'Lower charging costs with budget-friendly stations',
        totalDistance: baseDistance + 15,
        totalTime: Math.round(baseDistance * 1.4),
        totalCost: Math.round(baseDistance * 0.55),
        chargingStops: 3,
        co2Saved: Math.round(baseDistance * 0.12),
        fuelSaved: Math.round(baseDistance * 0.06),
        greenScore: 90,
        riskLevel: 'safe',
        stops: [
          {
            id: 'start',
            type: 'start',
            name: params.origin,
            lat: origin.lat,
            lng: origin.lng,
            arrivalBattery: params.startBattery,
            departureBattery: params.startBattery,
            distance: 0,
            eta: 'Now',
          },
          {
            id: 'cs1',
            type: 'charging',
            name: 'EESL Charging Hub - Agra',
            lat: 27.1767,
            lng: 78.0081,
            arrivalBattery: 25,
            departureBattery: 85,
            chargeTime: 40,
            station: mockChargingStations[1],
            distance: Math.round(baseDistance * 0.3),
            eta: '2:00 PM',
          },
          {
            id: 'dest',
            type: 'destination',
            name: params.destination,
            lat: dest.lat,
            lng: dest.lng,
            arrivalBattery: params.arrivalTarget + 5,
            departureBattery: params.arrivalTarget + 5,
            distance: Math.round(baseDistance * 0.7),
            eta: '6:30 PM',
          },
        ],
      },
      {
        id: 'safest',
        type: 'safest',
        name: 'Safest Route',
        description: 'Extra buffer with reliable stations only',
        totalDistance: baseDistance + 25,
        totalTime: Math.round(baseDistance * 1.6),
        totalCost: Math.round(baseDistance * 0.9),
        chargingStops: 3,
        co2Saved: Math.round(baseDistance * 0.12),
        fuelSaved: Math.round(baseDistance * 0.06),
        greenScore: 88,
        riskLevel: 'safe',
        stops: [
          {
            id: 'start',
            type: 'start',
            name: params.origin,
            lat: origin.lat,
            lng: origin.lng,
            arrivalBattery: params.startBattery,
            departureBattery: params.startBattery,
            distance: 0,
            eta: 'Now',
          },
          {
            id: 'cs1',
            type: 'charging',
            name: 'Tata Power EZ Charge - Mathura',
            lat: 27.4924,
            lng: 77.6737,
            arrivalBattery: 35,
            departureBattery: 95,
            chargeTime: 45,
            station: mockChargingStations[0],
            distance: Math.round(baseDistance * 0.25),
            eta: '1:45 PM',
          },
          {
            id: 'cs2',
            type: 'charging',
            name: 'Fortum Charge - Gwalior',
            lat: 26.2183,
            lng: 78.1828,
            arrivalBattery: 40,
            departureBattery: 90,
            chargeTime: 35,
            station: mockChargingStations[2],
            distance: Math.round(baseDistance * 0.35),
            eta: '4:30 PM',
          },
          {
            id: 'cs3',
            type: 'charging',
            name: 'Tata Power - Bhopal Highway',
            lat: 23.2599,
            lng: 77.4126,
            arrivalBattery: 35,
            departureBattery: 80,
            chargeTime: 30,
            station: mockChargingStations[4],
            distance: Math.round(baseDistance * 0.25),
            eta: '6:45 PM',
          },
          {
            id: 'dest',
            type: 'destination',
            name: params.destination,
            lat: dest.lat,
            lng: dest.lng,
            arrivalBattery: params.arrivalTarget + 10,
            departureBattery: params.arrivalTarget + 10,
            distance: Math.round(baseDistance * 0.15),
            eta: '8:30 PM',
          },
        ],
      },
    ];

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
        currentStop={selectedRoute?.stops[0] || null}
        nextStop={selectedRoute?.stops[1] || null}
        distanceToNext={selectedRoute?.stops[1]?.distance || 0}
        etaToNext={selectedRoute?.stops[1]?.eta || ''}
        currentBattery={75}
        totalProgress={25}
      />

      {/* AI Assistant */}
      <AIAssistant
        onAction={(action) => {
          toast({
            title: "AI Assistant",
            description: `Action: ${action.type}`,
          });
        }}
      />
    </div>
  );
};

export default Index;
