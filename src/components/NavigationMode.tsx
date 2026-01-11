import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, X, Battery, Clock, MapPin, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { RouteStop } from '@/lib/evData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavigationModeProps {
  isActive: boolean;
  onClose: () => void;
  currentStop: RouteStop | null;
  nextStop: RouteStop | null;
  distanceToNext: number;
  etaToNext: string;
  currentBattery: number;
  totalProgress: number;
  instruction: string;
}

const NavigationMode = ({
  isActive,
  onClose,
  currentStop,
  nextStop,
  distanceToNext,
  etaToNext,
  currentBattery,
  totalProgress,
  instruction,
}: NavigationModeProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const getBatteryColor = (percentage: number) => {
    if (percentage >= 50) return 'text-success';
    if (percentage >= 25) return 'text-warning';
    return 'text-danger';
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Top Navigation Bar */}
        <div className="glass-panel border-b border-border/30">
          <div className="max-w-3xl mx-auto p-4">
            {/* Close and Controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Current Instruction */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 glow-primary">
                <Navigation className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">{instruction}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {distanceToNext} km • {etaToNext}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                className="h-full bg-gradient-to-r from-primary to-success"
              />
            </div>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 glass-panel border-t border-border/30"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full py-2 flex items-center justify-center"
          >
            <ChevronUp className={cn(
              "w-5 h-5 text-muted-foreground transition-transform",
              showDetails && "rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-3">
                  {/* Next Stop Info */}
                  {nextStop && (
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-warning flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-warning-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{nextStop.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Arrive at {nextStop.arrivalBattery}% • Charge for {nextStop.chargeTime}min
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-2 px-4 pb-4">
            <div className="glass-card rounded-xl p-3 text-center">
              <Battery className={cn("w-5 h-5 mx-auto mb-1", getBatteryColor(currentBattery))} />
              <div className="text-lg font-bold">{currentBattery}%</div>
              <div className="text-xs text-muted-foreground">Battery</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{etaToNext}</div>
              <div className="text-xs text-muted-foreground">ETA</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <MapPin className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-lg font-bold">{distanceToNext}</div>
              <div className="text-xs text-muted-foreground">km left</div>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <Navigation className="w-5 h-5 mx-auto mb-1 text-success" />
              <div className="text-lg font-bold">{Math.round(totalProgress)}%</div>
              <div className="text-xs text-muted-foreground">Progress</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NavigationMode;
