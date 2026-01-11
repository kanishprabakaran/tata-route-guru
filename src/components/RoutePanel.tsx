import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Battery, Zap, Clock, IndianRupee, Leaf, AlertTriangle, ChevronDown, Car, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { tataEVs, indianCities, TataEV } from '@/lib/evData';

interface RoutePanelProps {
  onPlanRoute: (params: RoutePlanParams) => void;
  isLoading?: boolean;
}

export interface RoutePlanParams {
  origin: string;
  destination: string;
  vehicle: TataEV;
  startBattery: number;
  minSafetyBattery: number;
  arrivalTarget: number;
  maxDetour: number;
}

const RoutePanel = ({ onPlanRoute, isLoading }: RoutePanelProps) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<TataEV>(tataEVs[0]);
  const [startBattery, setStartBattery] = useState(80);
  const [minSafetyBattery, setMinSafetyBattery] = useState(15);
  const [arrivalTarget, setArrivalTarget] = useState(20);
  const [maxDetour, setMaxDetour] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = () => {
    if (!origin || !destination) return;
    onPlanRoute({
      origin,
      destination,
      vehicle: selectedVehicle,
      startBattery,
      minSafetyBattery,
      arrivalTarget,
      maxDetour,
    });
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel rounded-2xl p-5 space-y-5 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
          <Zap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">EV Route Planner</h1>
          <p className="text-xs text-muted-foreground">Optimized for Tata EVs</p>
        </div>
      </div>

      {/* Route Inputs */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary glow-primary" />
          <Select value={origin} onValueChange={setOrigin}>
            <SelectTrigger className="pl-9 bg-secondary/50 border-border/50 h-11">
              <SelectValue placeholder="Starting point" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {indianCities.map(city => (
                <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-success rounded-full" />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-success glow-success" />
          <Select value={destination} onValueChange={setDestination}>
            <SelectTrigger className="pl-9 bg-secondary/50 border-border/50 h-11">
              <SelectValue placeholder="Destination" />
            </SelectTrigger>
            <SelectContent className="glass-panel border-border/50">
              {indianCities.map(city => (
                <SelectItem key={city.name} value={city.name}>{city.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground flex items-center gap-2">
          <Car className="w-4 h-4" /> Select Vehicle
        </Label>
        <Select 
          value={selectedVehicle.id} 
          onValueChange={(id) => setSelectedVehicle(tataEVs.find(v => v.id === id) || tataEVs[0])}
        >
          <SelectTrigger className="bg-secondary/50 border-border/50 h-12">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedVehicle.name}</span>
                <span className="text-xs text-muted-foreground">{selectedVehicle.range}km range</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="glass-panel border-border/50">
            {tataEVs.map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{vehicle.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {vehicle.batteryCapacity}kWh • {vehicle.range}km • {vehicle.fastChargeRate}kW DC
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Battery Settings */}
      <div className="space-y-4 glass-card rounded-xl p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Battery className="w-4 h-4" /> Start Battery
            </Label>
            <span className="text-sm font-semibold text-primary">{startBattery}%</span>
          </div>
          <Slider
            value={[startBattery]}
            onValueChange={([v]) => setStartBattery(v)}
            min={10}
            max={100}
            step={5}
            className="py-2"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available range</span>
          <span className="font-medium text-success">
            ~{Math.round(selectedVehicle.range * (startBattery / 100))} km
          </span>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <Settings2 className="w-4 h-4" />
          <span>Advanced Settings</span>
          <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Min Safety Battery</Label>
                    <span className="text-sm font-semibold text-warning">{minSafetyBattery}%</span>
                  </div>
                  <Slider
                    value={[minSafetyBattery]}
                    onValueChange={([v]) => setMinSafetyBattery(v)}
                    min={5}
                    max={30}
                    step={5}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Arrival Target</Label>
                    <span className="text-sm font-semibold text-success">{arrivalTarget}%</span>
                  </div>
                  <Slider
                    value={[arrivalTarget]}
                    onValueChange={([v]) => setArrivalTarget(v)}
                    min={10}
                    max={50}
                    step={5}
                    className="py-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">Max Detour</Label>
                    <span className="text-sm font-semibold text-primary">{maxDetour} km</span>
                  </div>
                  <Slider
                    value={[maxDetour]}
                    onValueChange={([v]) => setMaxDetour(v)}
                    min={5}
                    max={50}
                    step={5}
                    className="py-2"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan Route Button */}
      <Button
        variant="gradient"
        size="xl"
        className="w-full"
        onClick={handleSubmit}
        disabled={!origin || !destination || isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Planning Route...
          </div>
        ) : (
          <>
            <Navigation className="w-5 h-5" />
            Plan Route
          </>
        )}
      </Button>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="glass-card rounded-lg p-3 text-center">
          <Zap className="w-4 h-4 mx-auto text-primary mb-1" />
          <div className="text-xs text-muted-foreground">Fast Charge</div>
          <div className="text-sm font-semibold">{selectedVehicle.fastChargeRate}kW</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <Battery className="w-4 h-4 mx-auto text-success mb-1" />
          <div className="text-xs text-muted-foreground">Battery</div>
          <div className="text-sm font-semibold">{selectedVehicle.batteryCapacity}kWh</div>
        </div>
        <div className="glass-card rounded-lg p-3 text-center">
          <Leaf className="w-4 h-4 mx-auto text-success mb-1" />
          <div className="text-xs text-muted-foreground">Efficiency</div>
          <div className="text-sm font-semibold">{selectedVehicle.efficiency}km/kWh</div>
        </div>
      </div>
    </motion.div>
  );
};

export default RoutePanel;
