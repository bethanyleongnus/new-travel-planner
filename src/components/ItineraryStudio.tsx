import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  Tag,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Wand2,
  RefreshCw,
  Lightbulb,
  Layers,
  ArrowRight,
  Luggage,
  CloudSun
} from 'lucide-react';
import { Itinerary, ActivityItem } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';
import { getDestinationVisual } from '../data/destinationGraphics.ts';

interface ItineraryStudioProps {
  currentItinerary: Itinerary | null;
  setCurrentItinerary: (itinerary: Itinerary) => void;
  onNavigateToTab: (tab: 'packing' | 'budget' | 'weather' | 'tours' | 'expert' | 'trips') => void;
}

const DESTINATION_PRESETS = [
  { name: 'Kyoto, Japan', label: 'Kyoto', tag: 'Temples & Tea' },
  { name: 'Paris, France', label: 'Paris', tag: 'Art & Bistro' },
  { name: 'Rome, Italy', label: 'Rome', tag: 'Ancient History' },
  { name: 'Amalfi Coast, Italy', label: 'Amalfi', tag: 'Coastal Drama' },
  { name: 'Tokyo, Japan', label: 'Tokyo', tag: 'Modern & Neon' },
  { name: 'Barcelona, Spain', label: 'Barcelona', tag: 'Gaudi & Tapas' },
  { name: 'Swiss Alps, Switzerland', label: 'Swiss Alps', tag: 'Alpine Peaks' },
  { name: 'Bali, Indonesia', label: 'Bali', tag: 'Spiritual Retreat' }
];

const MODIFICATION_PROMPTS = [
  'Add more authentic local ramen spots on Day 2',
  'Make Day 3 a more relaxed, slow-paced morning',
  'Swap afternoon museum for a scenic sunset photo viewpoint',
  'Include a hands-on culinary or artisan craft workshop',
  'Prioritize budget street food over sit-down restaurants'
];

export const ItineraryStudio: React.FC<ItineraryStudioProps> = ({
  currentItinerary,
  setCurrentItinerary,
  onNavigateToTab
}) => {
  // Trip creator form state
  const [destination, setDestination] = useState<string>(currentItinerary?.destination || 'Kyoto, Japan');
  const [durationDays, setDurationDays] = useState<number>(currentItinerary?.durationDays || 4);
  const [budgetTier, setBudgetTier] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [travelStyle, setTravelStyle] = useState<'cultural' | 'foodie' | 'adventure' | 'relaxed' | 'family' | 'romantic' | 'solo'>('cultural');
  const [travelers, setTravelers] = useState<number>(2);
  const [startDate, setStartDate] = useState<string>('2026-10-15');

  // Generation status state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatusText, setGenerationStatusText] = useState<string>('');

  // Natural language modification state
  const [modPrompt, setModPrompt] = useState<string>('');
  const [isModifying, setIsModifying] = useState<boolean>(false);

  // Active day accordion state
  const [expandedDay, setExpandedDay] = useState<number>(1);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Handle Create Itinerary using MCP tools: create_itinerary -> get_itinerary_status -> get_itinerary
  const handleGenerateItinerary = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(20);
      setGenerationStatusText('Calling MCP tool: create_itinerary...');

      const createRes = await McpClientService.createItinerary({
        destination,
        duration_days: durationDays,
        start_date: startDate,
        budget: budgetTier,
        travel_style: travelStyle,
        travelers
      });

      setGenerationProgress(55);
      setGenerationStatusText('Polling generation status via get_itinerary_status...');

      const itineraryId = createRes.itinerary_id;

      // Poll status
      await new Promise(r => setTimeout(r, 450));
      const statusRes = await McpClientService.getItineraryStatus(itineraryId);

      setGenerationProgress(80);
      setGenerationStatusText('Retrieving complete itinerary via get_itinerary...');

      // Fetch final itinerary
      if (createRes.itinerary) {
        setCurrentItinerary(createRes.itinerary);
      } else {
        const fullRes = await McpClientService.getItinerary(itineraryId);
        if (fullRes.itinerary) {
          setCurrentItinerary(fullRes.itinerary);
        }
      }

      setGenerationProgress(100);
      setGenerationStatusText('Itinerary generation complete!');
      setExpandedDay(1);
    } catch (err: any) {
      alert(`Itinerary generation failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Natural Language Modification using MCP tool: modify_itinerary
  const handleModifyItinerary = async (promptToUse?: string) => {
    const text = promptToUse || modPrompt;
    if (!text.trim() || !currentItinerary) return;

    try {
      setIsModifying(true);
      const modRes = await McpClientService.modifyItinerary(currentItinerary.id, text);
      if (modRes.itinerary) {
        setCurrentItinerary(modRes.itinerary);
        setSavedSuccessMsg(`Itinerary updated: "${text}"`);
        setTimeout(() => setSavedSuccessMsg(null), 4000);
        setModPrompt('');
      }
    } catch (err: any) {
      alert(`Modification failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsModifying(false);
    }
  };

  // Handle Save Itinerary using MCP tool: save_itinerary
  const handleSaveTrip = async () => {
    if (!currentItinerary) return;
    try {
      const res = await McpClientService.saveItinerary(currentItinerary);
      setSavedSuccessMsg(res.message || 'Trip successfully saved to your collection!');
      setTimeout(() => setSavedSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  // Export / Print
  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    if (!currentItinerary) return;
    let md = `# ${currentItinerary.title}\n\n`;
    md += `**Destination**: ${currentItinerary.destination} | **Duration**: ${currentItinerary.durationDays} Days | **Estimated Cost**: ${currentItinerary.totalEstimatedCost}\n\n`;
    md += `## Highlights\n` + currentItinerary.highlights.map(h => `- ${h}`).join('\n') + '\n\n';

    currentItinerary.days.forEach(d => {
      md += `### ${d.theme}\n`;
      d.activities.forEach(a => {
        md += `* **[${a.timeSlot.toUpperCase()}] ${a.title}** (${a.duration} • ${a.estimatedCost})\n  ${a.description}\n  *Tip: ${a.tips || 'None'}*\n`;
      });
      md += '\n';
    });

    navigator.clipboard.writeText(md);
    setSavedSuccessMsg('Itinerary copied to clipboard as Markdown!');
    setTimeout(() => setSavedSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {savedSuccessMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl border border-slate-700 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      {/* Hero Trip Builder Card */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-500/30">
            <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Itinerary Studio • Connected to PlanTrip MCP</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-serif mb-3">
            Where would you like to travel next?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Generate an intricately timed, day-by-day travel itinerary with local dining, entrance costs, and transit routes. Refine anything with natural language.
          </p>

          {/* Destination Quick Presets */}
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Popular Destinations:
            </span>
            <div className="flex flex-wrap gap-2">
              {DESTINATION_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => setDestination(p.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    destination === p.name
                      ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-400/40'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                  }`}
                >
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-slate-400 text-[10px] ml-1.5">({p.tag})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Builder Form Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Destination Input */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Destination City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Duration
                </label>
                <span className="text-xs font-bold text-emerald-400">{durationDays} Days</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Budget Tier */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Budget Tier
              </label>
              <select
                value={budgetTier}
                onChange={(e) => setBudgetTier(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="budget">Budget (Hostels & Street Food)</option>
                <option value="moderate">Moderate (Boutique & Bistros)</option>
                <option value="luxury">Luxury (5-Star & Fine Dining)</option>
              </select>
            </div>

            {/* Travel Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Travel Style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="cultural">Cultural Heritage</option>
                <option value="foodie">Culinary & Foodie</option>
                <option value="relaxed">Relaxed & Leisure</option>
                <option value="adventure">Adventure & Outdoors</option>
                <option value="romantic">Romantic Getaway</option>
                <option value="family">Family Friendly</option>
                <option value="solo">Solo Exploration</option>
              </select>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Travelers
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateItinerary}
                disabled={isGenerating || !destination.trim()}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-md shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Planning Trip...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Generate Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div className="bg-slate-800/80 rounded-xl p-4 border border-emerald-500/30 animate-pulse">
              <div className="flex justify-between items-center text-xs font-medium text-emerald-400 mb-2">
                <span>{generationStatusText}</span>
                <span>{generationProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Current Itinerary View */}
      {currentItinerary ? (
        <div className="space-y-6">
          {/* Visual Destination Hero Graphic Card */}
          {(() => {
            const visual = getDestinationVisual(currentItinerary.destination);
            return (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <div className="h-44 sm:h-56 w-full relative overflow-hidden">
                  <img
                    src={visual.heroImage}
                    alt={visual.name}
                    className="w-full h-full object-cover object-center filter brightness-[0.88] dark:brightness-[0.75]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
                        <span>{visual.badge}</span>
                        <span aria-hidden="true">·</span>
                        <span>{visual.country}</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif text-white">
                        {currentItinerary.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl line-clamp-2">
                        {visual.tagline} — {visual.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 text-xs">
                        <span className="text-slate-300 text-[10px] block">Best Season</span>
                        <span className="font-semibold text-emerald-300">{visual.bestMonths}</span>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur border border-white/20 text-xs">
                        <span className="text-slate-300 text-[10px] block">Est. Cost</span>
                        <span className="font-bold text-white">{currentItinerary.totalEstimatedCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Header summary & action buttons */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  {currentItinerary.budgetTier} tier
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentItinerary.travelStyle} style</span>
                <span aria-hidden="true">·</span>
                <span>{currentItinerary.travelersCount} Travelers</span>
                <span aria-hidden="true">·</span>
                <span>{currentItinerary.durationDays} Days</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 font-serif">
                {currentItinerary.destination}
              </h3>
            </div>

            {/* Quick action tool buttons */}
            <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto">
              <button
                onClick={handleSaveTrip}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                title="Save itinerary with MCP save_itinerary tool"
              >
                <Bookmark className="w-4 h-4" />
                <span>Save Trip</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                title="Copy itinerary as markdown"
              >
                <Share2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Copy MD</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                title="Print or save as PDF"
              >
                <Printer className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* Quick links banner to other MCP tools for this trip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigateToTab('packing')}
              className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 text-left hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 transition flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Luggage className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Smart Packing List</div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Customized for {currentItinerary.durationDays} days</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToTab('budget')}
              className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 text-left hover:bg-teal-100/70 dark:hover:bg-teal-900/40 transition flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-teal-950 dark:text-teal-200">Cost & Budget Breakdown</div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400">Per-person & daily items</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateToTab('weather')}
              className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200/70 dark:border-sky-800/60 text-left hover:bg-sky-100/70 dark:hover:bg-sky-900/40 transition flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950 dark:text-sky-200">Weather Insights</div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-400">Forecast & clothing tips</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Natural Language Itinerary Modifier Bar */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Modify Itinerary with Natural Language (MCP Tool: modify_itinerary)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={modPrompt}
                onChange={(e) => setModPrompt(e.target.value)}
                placeholder="e.g. Add a cooking workshop on Day 2, or make Day 3 more relaxed..."
                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                onKeyDown={(e) => e.key === 'Enter' && handleModifyItinerary()}
              />
              <button
                onClick={() => handleModifyItinerary()}
                disabled={isModifying || !modPrompt.trim()}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 dark:bg-emerald-600 text-white hover:bg-slate-800 dark:hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isModifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Modifying...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 text-emerald-400" />
                    <span>Apply Modification</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Suggestions:</span>
              {MODIFICATION_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleModifyItinerary(prompt)}
                  disabled={isModifying}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  + {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Highlights & Tips Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Trip Highlights</span>
              </div>
              <ul className="space-y-2">
                {currentItinerary.highlights.map((h, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Local Insider Advice</span>
              </div>
              <ul className="space-y-2">
                {currentItinerary.localTips.map((tip, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Day by Day Itinerary Timeline */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>Day-by-Day Schedule</span>
              </h3>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Click any day to expand activities
              </div>
            </div>

            <div className="space-y-3">
              {currentItinerary.days.map((day) => {
                const isExpanded = expandedDay === day.dayNumber;
                return (
                  <div
                    key={day.dayNumber}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
                  >
                    {/* Day Header Accordion Toggle */}
                    <button
                      onClick={() => setExpandedDay(isExpanded ? 0 : day.dayNumber)}
                      className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition cursor-pointer ${
                        isExpanded
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700'
                          : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {day.dayNumber}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            {day.theme}
                          </h4>
                          {day.daySummary && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {day.daySummary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {day.estimatedDayCost && (
                          <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Est. {day.estimatedDayCost}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Day Activities List */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 space-y-5 bg-white dark:bg-slate-900">
                        {day.activities.map((act, actIdx) => (
                          <div
                            key={act.id || actIdx}
                            className="relative pl-6 sm:pl-8 border-l-2 border-slate-100 dark:border-slate-800 pb-5 last:pb-0"
                          >
                            {/* Time slot pin */}
                            <span
                              className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 shadow-xs ${
                                act.timeSlot === 'morning'
                                  ? 'bg-amber-400'
                                  : act.timeSlot === 'afternoon'
                                  ? 'bg-sky-500'
                                  : 'bg-indigo-600'
                              }`}
                            />

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="uppercase text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {act.timeSlot}
                                </span>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {act.duration}
                                </span>
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                                  <DollarSign className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  {act.estimatedCost}
                                </span>
                              </div>

                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {act.location}
                              </span>
                            </div>

                            <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-1">
                              {act.title}
                            </h5>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-2.5">
                              {act.description}
                            </p>

                            {act.tips && (
                              <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                <span><strong>Insider Tip:</strong> {act.tips}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">No Itinerary Loaded</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Select a destination above and click &quot;Generate Itinerary&quot; to build an intelligent, day-by-day plan using the PlanTrip MCP tools.
          </p>
        </div>
      )}
    </div>
  );
};
