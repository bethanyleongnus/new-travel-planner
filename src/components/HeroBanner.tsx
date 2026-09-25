import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  MapPin,
  ArrowRight,
  Send,
  CloudSun,
  ShieldCheck,
  Luggage,
  Coins,
  Bot
} from 'lucide-react';
import { DESTINATION_GRAPHICS, RELAXING_TRAVEL_QUOTES } from '../data/destinationGraphics.ts';

interface HeroBannerProps {
  currentDestination?: string;
  onSelectDestination: (destName: string) => void;
  onOpenChatWithQuery: (query: string) => void;
  onOpenChatDrawer: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentDestination = 'Kyoto, Japan',
  onSelectDestination,
  onOpenChatWithQuery,
  onOpenChatDrawer
}) => {
  const [quickQuery, setQuickQuery] = useState('');
  const quote = RELAXING_TRAVEL_QUOTES[0];

  const popularDestinations = [
    DESTINATION_GRAPHICS['Kyoto, Japan'],
    DESTINATION_GRAPHICS['Tokyo, Japan'],
    DESTINATION_GRAPHICS['Paris, France'],
    DESTINATION_GRAPHICS['Bali, Indonesia'],
    DESTINATION_GRAPHICS['Rome, Italy'],
    DESTINATION_GRAPHICS['Swiss Alps, Switzerland']
  ];

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuery.trim()) return;
    onOpenChatWithQuery(quickQuery);
    setQuickQuery('');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm transition-all mb-8">
      {/* Background Graphic Ambient Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-15 overflow-hidden">
        <img
          src="/src/assets/images/travel_hero_banner_1790322037526.jpg"
          alt="Serene travel landscape"
          className="w-full h-full object-cover object-center filter blur-[1px] transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/90 dark:to-transparent" />
      </div>

      <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-10">
        <div className="max-w-3xl">
          {/* Subtle Tagline */}
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Travel Studio</span>
            <span aria-hidden="true">·</span>
            <span>14 Model Context Protocol Tools</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Concierge</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-serif leading-[1.15]">
            Where will your mindful journey take you?
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Craft serene itineraries, calculate comprehensive budgets, prepare weather-smart packing lists, and consult your dedicated AI Travel Concierge.
          </p>

          {/* Quick Chatbot Search Input */}
          <form onSubmit={handleQuerySubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ask Concierge: &quot;What should I pack for 5 days in Tokyo?&quot; or &quot;Budget for Paris&quot;..."
                className="w-full pl-11 pr-4 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
              />
              <Bot className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Ask MCP Concierge</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prompt chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Quick queries:</span>
            <button
              type="button"
              onClick={() => onOpenChatWithQuery('What should I pack for 4 days in Kyoto in Autumn?')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer underline decoration-dotted"
            >
              🎒 Kyoto packing list
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenChatWithQuery('Estimate trip cost for 5 days in Paris for 2 people')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer underline decoration-dotted"
            >
              💰 Paris budget
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onOpenChatWithQuery('What is the weather and best time to visit Bali?')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer underline decoration-dotted"
            >
              🌦️ Bali weather
            </button>
          </div>
        </div>

        {/* Visual Destination Quick-Swapper */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Inspiration Destinations</span>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Select to load destination details
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {popularDestinations.map((dest) => {
              const isSelected = currentDestination?.toLowerCase().includes(dest.name.split(',')[0].toLowerCase());
              return (
                <button
                  key={dest.name}
                  onClick={() => onSelectDestination(dest.name)}
                  className={`group relative overflow-hidden rounded-2xl text-left transition-all p-2.5 cursor-pointer border ${
                    isSelected
                      ? 'border-emerald-600 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-600 dark:ring-emerald-400'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="relative h-20 w-full rounded-xl overflow-hidden mb-2">
                    <img
                      src={dest.thumbnail}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2 text-white">
                      <p className="text-xs font-semibold truncate leading-tight">{dest.name.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="truncate">{dest.badge}</span>
                    <span className="font-mono text-[10px]">{dest.country}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
