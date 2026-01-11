import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RouteOption, RouteStop } from '@/lib/evData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  cards?: AICard[];
}

interface AICard {
  id: string;
  title: string;
  body: string;
  tone?: 'info' | 'warn' | 'success';
}

export interface AIAction {
  type:
    | 'switch_mode'
    | 'adjust_battery'
    | 'add_stop'
    | 'remove_stop'
    | 'prefer_operator'
    | 'avoid_operator'
    | 'set_min_power';
  label: string;
  params?: Record<string, any>;
}

export interface AIAssistantProps {
  onAction?: (action: AIAction) => void;
  routeOptions?: RouteOption[];
  selectedRoute?: RouteOption | null;
  currentStop?: RouteStop | null;
  nextStop?: RouteStop | null;
  currentBattery?: number;
  isNavigating?: boolean;
  routeStatus?: 'found' | 'not_found' | null;
}

const AIAssistant = ({
  onAction,
  routeOptions = [],
  selectedRoute = null,
  currentStop = null,
  nextStop = null,
  currentBattery = 0,
  isNavigating = false,
  routeStatus = null,
}: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "UNIT EV-ASSIST ONLINE. Ready to optimize your trip. Select a command or describe your goal.",
      timestamp: new Date(),
      actions: [
        { type: 'switch_mode', label: 'Switch to Cheapest', params: { mode: 'cheapest' } },
        { type: 'switch_mode', label: 'Switch to Safest', params: { mode: 'safest' } },
        { type: 'set_min_power', label: 'Use only 60kW+', params: { minPower: 60 } },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastRouteStatusRef = useRef<'found' | 'not_found' | null>(null);
  const lastLowBatteryRef = useRef(false);
  const lastCrowdedStopRef = useRef<string | null>(null);
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const pushAssistantMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      }
    ]);
  };

  const getModeLabel = (mode?: string) => {
    if (!mode) return 'route';
    return mode === 'fastest' ? 'fastest' : mode === 'cheapest' ? 'cheapest' : 'safest';
  };

  const buildDiffCard = (target: RouteOption, base: RouteOption): AICard | null => {
    const timeDiff = target.totalTime - base.totalTime;
    const costDiff = target.totalCost - base.totalCost;
    const timeText = timeDiff === 0 ? 'same time' : timeDiff > 0 ? `+${timeDiff} min` : `${Math.abs(timeDiff)} min faster`;
    const costText = costDiff === 0 ? 'same cost' : costDiff > 0 ? `+Rs ${costDiff}` : `save Rs ${Math.abs(costDiff)}`;
    return {
      id: `${target.id}-diff`,
      title: `${target.name} vs ${base.name}`,
      body: `${timeText}, ${costText}.`,
      tone: timeDiff > 0 ? 'info' : 'success',
    };
  };

  const buildRouteCards = () => {
    const cards: AICard[] = [];
    if (nextStop) {
      cards.push({
        id: 'next-stop',
        title: 'Next stop',
        body: `${nextStop.name} - arrive at ${nextStop.arrivalBattery}%`,
        tone: nextStop.type === 'charging' ? 'info' : 'success',
      });
    }

    if (selectedRoute && routeOptions.length > 1) {
      const cheapest = routeOptions.find(route => route.type === 'cheapest');
      const fastest = routeOptions.find(route => route.type === 'fastest');
      if (selectedRoute.type !== 'cheapest' && cheapest) {
        const diff = buildDiffCard(cheapest, selectedRoute);
        if (diff) cards.push(diff);
      }
      if (selectedRoute.type !== 'fastest' && fastest) {
        const diff = buildDiffCard(fastest, selectedRoute);
        if (diff) cards.push(diff);
      }
    }

    if (selectedRoute?.stops?.[1]?.arrivalBattery !== undefined &&
      selectedRoute.stops[1].arrivalBattery < 25) {
      cards.push({
        id: 'buffer-warning',
        title: 'Low buffer warning',
        body: 'Arrival battery is under 25%. Consider a safer mode or higher reserve.',
        tone: 'warn',
      });
    }

    return cards;
  };

  const buildWhyText = () => {
    if (!selectedRoute) return 'No active route selected.';
    const summary = `${selectedRoute.name}: ${selectedRoute.totalTime} min, Rs ${selectedRoute.totalCost}, ${selectedRoute.chargingStops} stops.`;
    if (!routeOptions.length) return summary;

    const cheapest = routeOptions.find(route => route.type === 'cheapest');
    const fastest = routeOptions.find(route => route.type === 'fastest');
    if (selectedRoute.type === 'fastest' && cheapest) {
      const timeDiff = cheapest.totalTime - selectedRoute.totalTime;
      const costDiff = selectedRoute.totalCost - cheapest.totalCost;
      return `${summary} Cheaper alternative saves Rs ${Math.max(0, costDiff)} but adds ${Math.max(0, timeDiff)} min.`;
    }
    if (selectedRoute.type === 'cheapest' && fastest) {
      const timeDiff = selectedRoute.totalTime - fastest.totalTime;
      const costDiff = fastest.totalCost - selectedRoute.totalCost;
      return `${summary} Faster alternative saves ${Math.max(0, timeDiff)} min but adds Rs ${Math.max(0, costDiff)}.`;
    }
    return summary;
  };

  const getQuickActionsFromQuery = (query: string): AIAction[] => {
    const lowerQuery = query.toLowerCase();
    const actions: AIAction[] = [];

    if (lowerQuery.includes('cheapest') || lowerQuery.includes('cheap') || lowerQuery.includes('cost')) {
      actions.push({ type: 'switch_mode', label: 'Switch to Cheapest', params: { mode: 'cheapest' } });
    }
    if (lowerQuery.includes('fastest') || lowerQuery.includes('fast') || lowerQuery.includes('quick')) {
      actions.push({ type: 'switch_mode', label: 'Switch to Fastest', params: { mode: 'fastest' } });
    }
    if (lowerQuery.includes('safest') || lowerQuery.includes('safe')) {
      actions.push({ type: 'switch_mode', label: 'Switch to Safest', params: { mode: 'safest' } });
    }
    if (lowerQuery.includes('reserve 10') || lowerQuery.includes('lower reserve')) {
      actions.push({ type: 'adjust_battery', label: 'Lower reserve to 10%', params: { reserveSocPct: 10 } });
    }
    if (lowerQuery.includes('arrival 25') || lowerQuery.includes('soc 25')) {
      actions.push({ type: 'adjust_battery', label: 'Keep arrival SOC >= 25%', params: { arrivalTarget: 25 } });
    }
    if (lowerQuery.includes('60kw') || lowerQuery.includes('60 kw') || lowerQuery.includes('fast charger')) {
      actions.push({ type: 'set_min_power', label: 'Use only 60kW+', params: { minPower: 60 } });
    }
    if (lowerQuery.includes('avoid chargezone')) {
      actions.push({ type: 'avoid_operator', label: 'Avoid ChargeZone', params: { operator: 'ChargeZone' } });
    }
    if (lowerQuery.includes('prefer tata')) {
      actions.push({ type: 'prefer_operator', label: 'Prefer Tata Power', params: { operator: 'Tata Power' } });
    }
    if (lowerQuery.includes('add stop') || lowerQuery.includes('nearest charger')) {
      actions.push({ type: 'add_stop', label: 'Add nearest fast charger', params: { strategy: 'nearest_fast' } });
    }

    return actions.slice(0, 4);
  };

  const getFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('cheap') || lowerQuery.includes('cost')) {
      return 'MODE CHEAPEST RECOMMENDED. Expect lower cost with longer travel time.';
    }
    if (lowerQuery.includes('fast') || lowerQuery.includes('quick')) {
      return 'MODE FASTEST RECOMMENDED. High-power stations prioritized.';
    }
    if (lowerQuery.includes('safe') || lowerQuery.includes('buffer')) {
      return 'MODE SAFEST RECOMMENDED. Higher reserve and safer buffer applied.';
    }
    return 'QUERY RECEIVED. I can switch modes, adjust SOC targets, and apply station constraints.';
  };

  useEffect(() => {
    if (!routeStatus || routeStatus === lastRouteStatusRef.current) {
      return;
    }

    lastRouteStatusRef.current = routeStatus;

    if (routeStatus === 'found') {
      const cards = buildRouteCards();
      const actions: AIAction[] = [];
      if (selectedRoute?.type !== 'cheapest') {
        actions.push({ type: 'switch_mode', label: 'Switch to Cheapest', params: { mode: 'cheapest' } });
      }
      if (selectedRoute?.type !== 'fastest') {
        actions.push({ type: 'switch_mode', label: 'Switch to Fastest', params: { mode: 'fastest' } });
      }
      actions.push(
        { type: 'adjust_battery', label: 'Lower reserve to 10%', params: { reserveSocPct: 10 } },
        { type: 'adjust_battery', label: 'Keep arrival SOC >= 25%', params: { arrivalTarget: 25 } },
        { type: 'set_min_power', label: 'Use only 60kW+', params: { minPower: 60 } }
      );

      pushAssistantMessage({
        role: 'assistant',
        content: `ROUTE COMPUTED. Mode: ${getModeLabel(selectedRoute?.type)}. Select an optimization or keep current plan.`,
        actions,
        cards,
      });
    }

    if (routeStatus === 'not_found') {
      pushAssistantMessage({
        role: 'assistant',
        content: 'ROUTE FAILURE. I can relax constraints or adjust SOC targets.',
        actions: [
          { type: 'adjust_battery', label: 'Lower reserve to 10%', params: { reserveSocPct: 10 } },
          { type: 'adjust_battery', label: 'Keep arrival SOC >= 20%', params: { arrivalTarget: 20 } },
          { type: 'set_min_power', label: 'Use only 40kW+', params: { minPower: 40 } },
        ],
      });
    }
  }, [routeStatus, selectedRoute, routeOptions, nextStop]);

  useEffect(() => {
    if (!isNavigating || currentBattery <= 0) return;
    const isLow = currentBattery <= 25;
    if (isLow && !lastLowBatteryRef.current) {
      lastLowBatteryRef.current = true;
      pushAssistantMessage({
        role: 'assistant',
        content: 'LOW BATTERY WARNING. Recommend nearest fast charger or safer buffer.',
        actions: [
          { type: 'add_stop', label: 'Add nearest fast charger', params: { strategy: 'nearest_fast' } },
          { type: 'switch_mode', label: 'Switch to Safest', params: { mode: 'safest' } },
        ],
      });
    }
    if (!isLow) {
      lastLowBatteryRef.current = false;
    }
  }, [isNavigating, currentBattery]);

  useEffect(() => {
    if (!nextStop?.station) return;
    const availableRatio = nextStop.station.total > 0
      ? nextStop.station.available / nextStop.station.total
      : 1;
    const isCrowded = nextStop.station.status === 'busy' || availableRatio <= 0.25;
    if (isCrowded && lastCrowdedStopRef.current !== nextStop.id) {
      lastCrowdedStopRef.current = nextStop.id;
      pushAssistantMessage({
        role: 'assistant',
        content: `CROWDED STOP DETECTED at ${nextStop.name}. Recommend an alternative fast charger.`,
        actions: [
          { type: 'add_stop', label: 'Add nearest fast charger', params: { strategy: 'nearest_fast' } },
          { type: 'switch_mode', label: 'Switch to Fastest', params: { mode: 'fastest' } },
        ],
      });
    }
  }, [nextStop]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const actions = getQuickActionsFromQuery(input);
    let responseText = '';

    if (geminiKey) {
      try {
        const contextLines = [
          `Current route: ${selectedRoute ? selectedRoute.name : 'none'}.`,
          `Battery: ${currentBattery} percent.`,
          currentStop ? `Current stop: ${currentStop.name}.` : 'Current stop: unknown.',
          nextStop ? `Next stop: ${nextStop.name}.` : 'Next stop: unknown.',
          routeOptions.length ? `Available modes: ${routeOptions.map(route => route.type).join(', ')}.` : '',
        ].filter(Boolean);

        const prompt = [
          'You are EV-ASSIST, a concise robot navigator.',
          'Respond in 1-3 short sentences.',
          'Be direct, helpful, and confident.',
          'User query:',
          input,
          'Context:',
          contextLines.join(' '),
        ].join('\n');

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
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
          responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        }
      } catch (error) {
        responseText = '';
      }
    }

    if (!responseText) {
      responseText = getFallbackResponse(input);
    }

    pushAssistantMessage({
      role: 'assistant',
      content: responseText,
      actions,
    });

    setIsTyping(false);
  };

  const handleAction = (action: AIAction) => {
    onAction?.(action);
    
    // Add confirmation message
    const confirmations: Record<AIAction['type'], string> = {
      switch_mode: `Switching to ${action.params?.mode} route mode...`,
      adjust_battery: action.params?.arrivalTarget
        ? `Setting arrival SOC to ${action.params.arrivalTarget}%...`
        : `Setting reserve buffer to ${action.params?.reserveSocPct ?? 'custom'}%...`,
      add_stop: 'Adding charging stop to your route...',
      remove_stop: 'Removing charging stop from your route...',
      prefer_operator: `Preferring ${action.params?.operator} stations...`,
      avoid_operator: `Avoiding ${action.params?.operator} stations...`,
      set_min_power: `Filtering chargers below ${action.params?.minPower}kW...`,
    };

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: confirmations[action.type] || 'Done!',
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full gradient-primary glow-primary flex items-center justify-center shadow-2xl",
          isOpen && "hidden"
        )}
      >
        <MessageCircle className="w-6 h-6 text-primary-foreground" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-success-foreground" />
        </span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-40 w-96 h-[32rem] glass-panel rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">EV-ASSIST</h3>
                  <p className="text-xs text-muted-foreground">Autonomous route co-pilot</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'glass-card rounded-bl-sm'
                  )}>
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    
                    {/* Quick Actions */}
                    {message.actions && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {message.actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(action)}
                            className="text-xs px-3 py-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {message.cards && (
                      <div className="mt-3 space-y-2">
                        {message.cards.map((card) => (
                          <div
                            key={card.id}
                            className={cn(
                              "rounded-xl border border-border/40 bg-secondary/20 p-3 text-xs",
                              card.tone === 'warn' && "border-warning/50 bg-warning/10",
                              card.tone === 'success' && "border-success/50 bg-success/10"
                            )}
                          >
                            <div className="font-semibold text-foreground">{card.title}</div>
                            <div className="text-muted-foreground mt-1">{card.body}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {showWhy && selectedRoute && (
                <div className="glass-card rounded-xl border border-border/40 p-3 text-xs">
                  <div className="font-semibold text-foreground">Why this route?</div>
                  <div className="text-muted-foreground mt-1">{buildWhyText()}</div>
                </div>
              )}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs">AI is thinking...</span>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Enter command..."
                  className="flex-1 bg-secondary/50 border-border/50"
                />
                <Button
                  variant="gradient"
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={() => setShowWhy(prev => !prev)}
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  {showWhy ? 'Hide route rationale' : 'Why this route?'}
                </button>
                <div className="text-xs text-muted-foreground">
                  {geminiKey ? 'AI online' : 'AI offline'}
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {[
                  'Switch to cheapest',
                  'Lower reserve to 10%',
                  'Use only 60kW+ chargers',
                  'Prefer Tata Power',
                  'Avoid ChargeZone',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
