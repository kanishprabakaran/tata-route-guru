import { motion } from 'framer-motion';
import { MapPin, Zap, Flag, Battery, Clock, ArrowRight } from 'lucide-react';
import { RouteStop } from '@/lib/evData';
import { cn } from '@/lib/utils';

interface TimelineViewProps {
  stops: RouteStop[];
  isVisible: boolean;
}

const TimelineView = ({ stops, isVisible }: TimelineViewProps) => {
  const getBatteryColor = (percentage: number) => {
    if (percentage >= 50) return 'text-success';
    if (percentage >= 25) return 'text-warning';
    return 'text-danger';
  };

  const getBatteryBg = (percentage: number) => {
    if (percentage >= 50) return 'bg-success';
    if (percentage >= 25) return 'bg-warning';
    return 'bg-danger';
  };

  if (!isVisible || stops.length === 0) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-4 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin"
    >
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Journey Timeline
      </h2>

      <div className="space-y-1">
        {stops.map((stop, index) => {
          const isStart = stop.type === 'start';
          const isDestination = stop.type === 'destination';
          const isCharging = stop.type === 'charging';
          const isLast = index === stops.length - 1;

          return (
            <div key={stop.id} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-5 top-12 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-border to-border/30" />
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "relative glass-card rounded-xl p-4",
                  isStart && "border-l-2 border-l-primary",
                  isDestination && "border-l-2 border-l-success",
                  isCharging && "border-l-2 border-l-warning"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "absolute -left-[3px] top-4 w-10 h-10 rounded-full flex items-center justify-center z-10",
                  isStart && "gradient-primary",
                  isDestination && "gradient-success",
                  isCharging && "gradient-warning"
                )}>
                  {isStart && <MapPin className="w-5 h-5 text-primary-foreground" />}
                  {isDestination && <Flag className="w-5 h-5 text-success-foreground" />}
                  {isCharging && <Zap className="w-5 h-5 text-warning-foreground" />}
                </div>

                <div className="pl-12">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{stop.name}</h3>
                      <p className="text-xs text-muted-foreground">{stop.eta}</p>
                    </div>
                    {stop.distance > 0 && (
                      <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                        +{stop.distance} km
                      </span>
                    )}
                  </div>

                  {/* Battery Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Battery className={cn("w-4 h-4", getBatteryColor(stop.arrivalBattery))} />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Arrive: </span>
                        <span className={cn("font-semibold", getBatteryColor(stop.arrivalBattery))}>
                          {stop.arrivalBattery}%
                        </span>
                      </div>
                    </div>

                    {isCharging && (
                      <>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-sm">
                          <span className="text-muted-foreground">Depart: </span>
                          <span className={cn("font-semibold", getBatteryColor(stop.departureBattery))}>
                            {stop.departureBattery}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Charging Info */}
                  {isCharging && stop.chargeTime && (
                    <div className="mt-3 glass-card rounded-lg p-3 bg-warning/5 border-warning/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Charge for</span>
                        <span className="font-semibold text-warning">{stop.chargeTime} min</span>
                      </div>
                      {stop.station && (
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{stop.station.operator}</span>
                          <span className="text-success">₹{stop.station.pricePerKwh}/kWh</span>
                        </div>
                      )}
                      {/* Charging Progress Bar Animation */}
                      <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="h-full bg-gradient-to-r from-warning via-success to-warning bg-[length:200%_100%] animate-charging"
                        />
                      </div>
                    </div>
                  )}

                  {/* Battery Bar */}
                  <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getBatteryBg(isCharging ? stop.departureBattery : stop.arrivalBattery))}
                      style={{ width: `${isCharging ? stop.departureBattery : stop.arrivalBattery}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default TimelineView;
