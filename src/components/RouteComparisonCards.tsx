import { motion } from 'framer-motion';
import { Clock, IndianRupee, Shield, Leaf, Zap, ChevronRight } from 'lucide-react';
import { RouteOption } from '@/lib/evData';
import { cn } from '@/lib/utils';

interface RouteComparisonCardsProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onSelectRoute: (route: RouteOption) => void;
}

const RouteComparisonCards = ({ routes, selectedRoute, onSelectRoute }: RouteComparisonCardsProps) => {
  const getRouteIcon = (type: RouteOption['type']) => {
    switch (type) {
      case 'fastest': return <Clock className="w-5 h-5" />;
      case 'cheapest': return <IndianRupee className="w-5 h-5" />;
      case 'safest': return <Shield className="w-5 h-5" />;
      case 'greenest': return <Leaf className="w-5 h-5" />;
    }
  };

  const getRouteColor = (type: RouteOption['type']) => {
    switch (type) {
      case 'fastest': return 'from-primary to-blue-500';
      case 'cheapest': return 'from-success to-emerald-500';
      case 'safest': return 'from-warning to-amber-500';
      case 'greenest': return 'from-green-500 to-teal-500';
    }
  };

  const getRiskBadge = (risk: RouteOption['riskLevel']) => {
    switch (risk) {
      case 'safe': return { color: 'bg-success/20 text-success border-success/30', label: 'Low Risk' };
      case 'caution': return { color: 'bg-warning/20 text-warning border-warning/30', label: 'Caution' };
      case 'danger': return { color: 'bg-danger/20 text-danger border-danger/30', label: 'High Risk' };
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin"
    >
      {routes.map((route, index) => {
        const isSelected = selectedRoute?.id === route.id;
        const riskBadge = getRiskBadge(route.riskLevel);

        return (
          <motion.button
            key={route.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectRoute(route)}
            className={cn(
              "flex-shrink-0 w-64 glass-card rounded-xl p-4 text-left transition-all duration-300 group",
              isSelected 
                ? "ring-2 ring-primary border-primary/50 bg-card/90" 
                : "hover:bg-card/80 hover:border-white/20"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                getRouteColor(route.type)
              )}>
                {getRouteIcon(route.type)}
              </div>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full border",
                riskBadge.color
              )}>
                {riskBadge.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground mb-1">{route.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{route.description}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="glass-card rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Time</div>
                <div className="font-semibold text-sm">{formatTime(route.totalTime)}</div>
              </div>
              <div className="glass-card rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Distance</div>
                <div className="font-semibold text-sm">{route.totalDistance} km</div>
              </div>
              <div className="glass-card rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Cost</div>
                <div className="font-semibold text-sm text-success">₹{route.totalCost}</div>
              </div>
              <div className="glass-card rounded-lg p-2">
                <div className="text-xs text-muted-foreground">Stops</div>
                <div className="font-semibold text-sm flex items-center gap-1">
                  <Zap className="w-3 h-3 text-primary" />
                  {route.chargingStops}
                </div>
              </div>
            </div>

            {/* Green Impact */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-success">
                <Leaf className="w-3 h-3" />
                <span>{route.co2Saved}kg CO₂ saved</span>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isSelected && "translate-x-1 text-primary"
              )} />
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default RouteComparisonCards;
