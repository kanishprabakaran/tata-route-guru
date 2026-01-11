import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Star, Clock, MapPin, Plus, Heart, Ban, RefreshCw, Wifi, Coffee, ShowerHead } from 'lucide-react';
import { ChargingStation } from '@/lib/evData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChargingStationDrawerProps {
  station: ChargingStation | null;
  isOpen: boolean;
  onClose: () => void;
  onAddAsStop: (station: ChargingStation) => void;
  onPrefer: (station: ChargingStation) => void;
  onAvoidOperator: (operator: string) => void;
  onShowAlternatives: (station: ChargingStation) => void;
}

const ChargingStationDrawer = ({
  station,
  isOpen,
  onClose,
  onAddAsStop,
  onPrefer,
  onAvoidOperator,
  onShowAlternatives,
}: ChargingStationDrawerProps) => {
  if (!station) return null;

  const getStatusColor = (status: ChargingStation['status']) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'busy': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-danger text-danger-foreground';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'restroom': return <ShowerHead className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass-panel rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
          >
            {/* Handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                station.status === 'available' ? 'gradient-success glow-success' :
                station.status === 'busy' ? 'gradient-warning glow-warning' :
                'gradient-danger glow-danger'
              )}>
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">{station.name}</h2>
                <p className="text-sm text-muted-foreground">{station.operator}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full capitalize",
                    getStatusColor(station.status)
                  )}>
                    {station.status}
                  </span>
                  <div className="flex items-center gap-1 text-warning">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-sm font-medium">{station.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="glass-card rounded-xl p-3 text-center">
                <Zap className="w-5 h-5 mx-auto text-primary mb-1" />
                <div className="text-sm font-semibold">{station.maxPower}kW</div>
                <div className="text-xs text-muted-foreground">Max Power</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-success">₹{station.pricePerKwh}</div>
                <div className="text-xs text-muted-foreground">per kWh</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary">{station.available}</div>
                <div className="text-xs text-muted-foreground">/ {station.total} Free</div>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <div className="text-xs text-muted-foreground">~30 min</div>
              </div>
            </div>

            {/* Charger Types */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Charger Types</h3>
              <div className="flex flex-wrap gap-2">
                {station.chargerTypes.map((type) => (
                  <span key={type} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {station.amenities.map((amenity) => (
                  <span key={amenity} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground">
                    {getAmenityIcon(amenity)}
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={() => onAddAsStop(station)}
              >
                <Plus className="w-5 h-5" />
                Add as Charging Stop
              </Button>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onPrefer(station)}
                >
                  <Heart className="w-4 h-4" />
                  Prefer
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onAvoidOperator(station.operator)}
                >
                  <Ban className="w-4 h-4" />
                  Avoid
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onShowAlternatives(station)}
                >
                  <RefreshCw className="w-4 h-4" />
                  Alternatives
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChargingStationDrawer;
