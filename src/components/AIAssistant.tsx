import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Zap, Route, Battery, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
}

interface AIAction {
  type: 'switch_mode' | 'adjust_battery' | 'add_stop' | 'remove_stop' | 'prefer_operator' | 'avoid_operator';
  label: string;
  params?: Record<string, any>;
}

interface AIAssistantProps {
  onAction?: (action: AIAction) => void;
}

const AIAssistant = ({ onAction }: AIAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your EV journey assistant. I can help you plan routes, find charging stations, and optimize your trip. What would you like to do?",
      timestamp: new Date(),
      actions: [
        { type: 'switch_mode', label: 'Find cheapest route', params: { mode: 'cheapest' } },
        { type: 'switch_mode', label: 'Find safest route', params: { mode: 'safest' } },
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate AI response
    setTimeout(() => {
      const responses = getAIResponse(input);
      setMessages(prev => [...prev, responses]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (query: string): Message => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('cheap') || lowerQuery.includes('cost') || lowerQuery.includes('save money')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I can optimize for the cheapest route! This prioritizes stations with lower electricity rates. The trade-off is slightly longer travel time as we may take detours to find better prices.",
        timestamp: new Date(),
        actions: [
          { type: 'switch_mode', label: 'Switch to Cheapest Route', params: { mode: 'cheapest' } },
        ]
      };
    }
    
    if (lowerQuery.includes('fast') || lowerQuery.includes('quick') || lowerQuery.includes('hurry')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Got it! I'll optimize for the fastest route with minimal charging stops. I'll use high-power DC fast chargers along the highway for quick top-ups.",
        timestamp: new Date(),
        actions: [
          { type: 'switch_mode', label: 'Switch to Fastest Route', params: { mode: 'fastest' } },
        ]
      };
    }

    if (lowerQuery.includes('safe') || lowerQuery.includes('worry') || lowerQuery.includes('range anxiety')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Safety first! I'll plan a route with extra charging buffer at each stop, ensuring you never drop below 20% battery. This means more frequent, shorter charging stops.",
        timestamp: new Date(),
        actions: [
          { type: 'switch_mode', label: 'Switch to Safest Route', params: { mode: 'safest' } },
          { type: 'adjust_battery', label: 'Set minimum battery to 25%', params: { minBattery: 25 } },
        ]
      };
    }

    if (lowerQuery.includes('tata power') || lowerQuery.includes('charger') || lowerQuery.includes('station')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I found several Tata Power charging stations along your route. They offer reliable DC fast charging at ₹18/kWh. Would you like me to prefer Tata Power stations?",
        timestamp: new Date(),
        actions: [
          { type: 'prefer_operator', label: 'Prefer Tata Power', params: { operator: 'Tata Power' } },
          { type: 'avoid_operator', label: 'Avoid EESL', params: { operator: 'EESL' } },
        ]
      };
    }

    if (lowerQuery.includes('add') || lowerQuery.includes('stop')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I can add a charging stop for you. Which station would you like to add? You can also tap on any station on the map to add it to your route.",
        timestamp: new Date(),
      };
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: "I understand you're looking for help with your EV journey. I can help you:\n\n• Switch between route modes (Fastest, Cheapest, Safest)\n• Adjust battery targets and safety margins\n• Add or remove charging stops\n• Prefer or avoid specific operators\n\nJust tell me what you need!",
      timestamp: new Date(),
    };
  };

  const handleAction = (action: AIAction) => {
    onAction?.(action);
    
    // Add confirmation message
    const confirmations: Record<AIAction['type'], string> = {
      switch_mode: `Switching to ${action.params?.mode} route mode...`,
      adjust_battery: `Setting battery target to ${action.params?.minBattery}%...`,
      add_stop: 'Adding charging stop to your route...',
      remove_stop: 'Removing charging stop from your route...',
      prefer_operator: `Preferring ${action.params?.operator} stations...`,
      avoid_operator: `Avoiding ${action.params?.operator} stations...`,
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
                  <h3 className="font-semibold text-foreground">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Route planning & optimization</p>
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
                  </div>
                </motion.div>
              ))}

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
                  placeholder="Ask me anything..."
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
              
              {/* Quick Suggestions */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {['Find cheapest route', 'Add charging stop', 'Avoid range anxiety'].map((suggestion) => (
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
