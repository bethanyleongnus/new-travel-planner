import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Terminal,
  MapPin,
  Luggage,
  DollarSign,
  CloudSun,
  Compass,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { McpClientService } from '../services/mcpClient.ts';
import { Itinerary, CostEstimate, PackingListResponse, WeatherInsights } from '../types/travel.ts';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  mcpToolUsed?: string;
  mcpToolArgs?: Record<string, any>;
  mcpData?: any;
  suggestions?: string[];
}

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  currentDestination?: string;
  onLoadItinerary?: (itinerary: Itinerary) => void;
  onNavigateToTab?: (tab: 'itinerary' | 'packing' | 'budget' | 'weather' | 'tours' | 'expert' | 'trips') => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  currentDestination = 'Kyoto, Japan',
  onLoadItinerary,
  onNavigateToTab,
  initialQuery,
  onClearInitialQuery
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMcpDetails, setExpandedMcpDetails] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello, traveler! I am your PlanTrip AI Concierge. I can coordinate itineraries, generate packing lists, calculate trip costs, analyze weather, and answer local customs questions directly via our 14 Model Context Protocol (MCP) tools.\n\nHow can I help you plan your journey to ${currentDestination}?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        `What should I pack for 4 days in ${currentDestination}?`,
        `Estimate trip cost for 5 days in ${currentDestination}`,
        `What is the weather like in ${currentDestination}?`,
        `Give me a 3-day itinerary for ${currentDestination}`
      ]
    }
  ]);

  // Handle external query injected via hero banner
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      onOpen();
      handleSend(initialQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  }, [initialQuery]);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const toggleMcpDetails = (msgId: string) => {
    setExpandedMcpDetails((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await McpClientService.askChatbot({
        message: q,
        destination: currentDestination
      });

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mcpToolUsed: res.mcpToolUsed,
        mcpToolArgs: res.mcpToolArgs,
        mcpData: res.mcpData,
        suggestions: res.suggestions
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `I encountered an issue executing the tool query: ${err?.message || 'Server error'}. Please try asking in a different way or check your connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. Ask me anything about itineraries, packing, costs, or local tips for ${currentDestination}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          `What should I pack for 4 days in ${currentDestination}?`,
          `Estimate trip cost for 5 days in ${currentDestination}`,
          `What is the weather like in ${currentDestination}?`
        ]
      }
    ]);
  };

  // Render rich card for MCP tool output
  const renderMcpCard = (msg: ChatMessage) => {
    if (!msg.mcpData || !msg.mcpToolUsed) return null;
    const { mcpToolUsed, mcpData } = msg;

    // 1. Packing List Output
    if (mcpToolUsed === 'generate_packing_list' && mcpData.categories) {
      const packing = mcpData as PackingListResponse;
      const allItems = Object.values(packing.categories).flat();
      return (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Luggage className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Packing Checklist ({allItems.length} items)</span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('packing')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <span>View Full List</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {allItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-[11px]"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">{item.name}</span>
              </div>
            ))}
          </div>
          {allItems.length > 6 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              + {allItems.length - 6} more items categorized by clothing, toiletries & tech
            </p>
          )}
        </div>
      );
    }

    // 2. Cost Estimate Output
    if (mcpToolUsed === 'estimate_trip_cost' && mcpData.totalEstimate) {
      const cost = mcpData as CostEstimate;
      return (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Estimated Total: {cost.currencySymbol}{(cost.totalCost || 0).toLocaleString()}</span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('budget')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <span>Budget Tool</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {cost.breakdown?.slice(0, 4).map((item) => (
              <div key={item.category} className="space-y-0.5">
                <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>{item.category}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {cost.currencySymbol}{item.amount} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3. Weather Insights Output
    if (mcpToolUsed === 'get_weather_insights' && mcpData.averageHighC !== undefined) {
      const weather = mcpData as WeatherInsights;
      return (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span>Weather for {weather.destination} ({weather.month})</span>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('weather')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-[11px] font-medium cursor-pointer"
              >
                <span>Insights</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Avg High</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{weather.averageHighC}°C</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Avg Low</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{weather.averageLowC}°C</span>
            </div>
            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Rain Chance</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{weather.rainfallChance}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
            "{weather.clothingRecommendation}"
          </p>
        </div>
      );
    }

    // 4. Itinerary Output
    if (mcpToolUsed === 'create_itinerary' && mcpData.itinerary) {
      const itin = mcpData.itinerary as Itinerary;
      return (
        <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{itin.title} ({itin.durationDays} Days)</span>
            </div>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{itin.totalEstimatedCost}</span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            {itin.highlights?.slice(0, 2).map((h, i) => (
              <span key={i} className="block">• {h}</span>
            ))}
          </p>

          {onLoadItinerary && (
            <button
              onClick={() => {
                onLoadItinerary(itin);
                if (onNavigateToTab) onNavigateToTab('itinerary');
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>Load this Itinerary into Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Floating Trigger Dock Button when Drawer is Closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          aria-label="Open PlanTrip AI Concierge"
          className="fixed bottom-6 right-6 z-50 group flex items-center gap-3 px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-slate-700/50 dark:border-slate-200/50"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold leading-tight">AI Concierge</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">14 MCP Tools</p>
          </div>
        </button>
      )}

      {/* Slide-over Drawer / Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[640px] max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    PlanTrip Concierge
                  </h3>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                    <Terminal className="w-2.5 h-2.5" />
                    MCP Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-500" />
                  <span className="truncate">{currentDestination}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <button
                onClick={clearChat}
                title="Clear Chat History"
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Restore window size' : 'Expand window'}
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                title="Close Concierge"
                className="p-1.5 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm'
                    }`}
                  >
                    {/* Tool Badge indicator */}
                    {isAssistant && msg.mcpToolUsed && (
                      <div className="mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                        <span className="flex items-center gap-1 font-semibold">
                          <Terminal className="w-3 h-3" />
                          MCP: {msg.mcpToolUsed}
                        </span>
                        {msg.mcpToolArgs && (
                          <button
                            onClick={() => toggleMcpDetails(msg.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Args</span>
                            {expandedMcpDetails[msg.id] ? (
                              <ChevronUp className="w-2.5 h-2.5" />
                            ) : (
                              <ChevronDown className="w-2.5 h-2.5" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Tool Arguments expansion */}
                    {isAssistant && msg.mcpToolArgs && expandedMcpDetails[msg.id] && (
                      <pre className="mb-2 p-2 bg-slate-900 text-emerald-400 rounded-lg text-[10px] font-mono overflow-x-auto">
                        {JSON.stringify(msg.mcpToolArgs, null, 2)}
                      </pre>
                    )}

                    {/* Message Body */}
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Render Interactive Card for MCP tool output */}
                    {isAssistant && renderMcpCard(msg)}
                  </div>

                  <span className="mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">
                    {msg.timestamp}
                  </span>

                  {/* Prompt Suggestions */}
                  {isAssistant && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition-colors cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1.5 font-mono text-[11px]">Querying MCP Server...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about packing, budget, weather, or custom plans..."
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
              <span>Powered by PlanTrip MCP & AI Studio</span>
              <span>100% In-Memory Session</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
