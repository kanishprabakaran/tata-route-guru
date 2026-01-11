import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ChargingStation, RouteStop } from '@/lib/evData';

interface EVMapProps {
  center?: [number, number];
  zoom?: number;
  stations?: ChargingStation[];
  routeStops?: RouteStop[];
  onStationClick?: (station: ChargingStation) => void;
  routePath?: [number, number][];
}

const EVMap = ({ 
  center = [23.0, 79.0], 
  zoom = 5,
  stations = [],
  routeStops = [],
  onStationClick,
  routePath = []
}: EVMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = L.map(mapContainer.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when stations change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add charging station markers
    stations.forEach(station => {
      const statusColor = station.status === 'available' ? '#22c55e' : 
                          station.status === 'busy' ? '#eab308' : '#ef4444';
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, ${statusColor}, ${statusColor}dd);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px ${statusColor}66;
            border: 2px solid rgba(255,255,255,0.2);
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([station.lat, station.lng], { icon })
        .addTo(mapRef.current!);

      marker.on('click', () => {
        onStationClick?.(station);
      });

      markersRef.current.push(marker);
    });

    // Add route stop markers
    routeStops.forEach((stop, index) => {
      const isStart = stop.type === 'start';
      const isDestination = stop.type === 'destination';
      const color = isStart ? '#3b82f6' : isDestination ? '#22c55e' : '#06b6d4';
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${isStart || isDestination ? 40 : 32}px;
            height: ${isStart || isDestination ? 40 : 32}px;
            background: linear-gradient(135deg, ${color}, ${color}dd);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px ${color}66;
            border: 3px solid rgba(255,255,255,0.3);
            font-weight: bold;
            color: white;
            font-size: ${isStart || isDestination ? 14 : 12}px;
          ">
            ${isStart ? 'A' : isDestination ? 'B' : index}
          </div>
        `,
        iconSize: [isStart || isDestination ? 40 : 32, isStart || isDestination ? 40 : 32],
        iconAnchor: [isStart || isDestination ? 20 : 16, isStart || isDestination ? 20 : 16],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon })
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [stations, routeStops, onStationClick]);

  // Update route path
  useEffect(() => {
    if (!mapRef.current) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (routePath.length >= 2) {
      routeLayerRef.current = L.polyline(routePath, {
        color: '#06b6d4',
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(mapRef.current);

      // Add glow effect
      L.polyline(routePath, {
        color: '#06b6d4',
        weight: 12,
        opacity: 0.2,
        smoothFactor: 1,
      }).addTo(mapRef.current);

      mapRef.current.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [50, 50],
      });
    }
  }, [routePath]);

  return (
    <div ref={mapContainer} className="absolute inset-0 w-full h-full z-0" />
  );
};

export default EVMap;
