import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  PieChart,
  RefreshCw,
  Sparkles,
  Hotel,
  UtensilsCrossed,
  Train,
  Ticket,
  ShoppingBag,
  Lightbulb,
  Users
} from 'lucide-react';
import { CostEstimate } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface CostEstimatorViewProps {
  currentDestination?: string;
  durationDays?: number;
}

export const CostEstimatorView: React.FC<CostEstimatorViewProps> = ({
  currentDestination = 'Kyoto, Japan',
  durationDays = 5
}) => {
  const [destination, setDestination] = useState<string>(currentDestination);
  const [duration, setDuration] = useState<number>(durationDays);
  const [style, setStyle] = useState<'budget' | 'moderate' | 'luxury'>('moderate');
  const [travelers, setTravelers] = useState<number>(2);
  const [costData, setCostData] = useState<CostEstimate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchEstimate = async () => {
    try {
      setIsLoading(true);
      const res = await McpClientService.estimateTripCost({
        destination,
        duration_days: duration,
        travel_style: style,
        travelers
      });
      setCostData(res);
    } catch (err: any) {
      alert(`Cost estimation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimate();
  }, [destination, duration, style, travelers]);

  const categoryIcons: Record<string, any> = {
    'Accommodation': Hotel,
    'Dining': UtensilsCrossed,
    'Transport': Train,
    'Activities': Ticket,
    'Contingency': ShoppingBag
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tool: estimate_trip_cost</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Trip Budget & Cost Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data-driven expense estimates across lodging, dining, transit, and experiences
          </p>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Destination"
          />
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Days:</span>
            <input
              type="number"
              min={1}
              max={21}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
              className="w-12 text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
            />
          </div>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as any)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="budget">Budget</option>
            <option value="moderate">Moderate</option>
            <option value="luxury">Luxury</option>
          </select>
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              min={1}
              max={10}
              value={travelers}
              onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
              className="w-10 text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {costData && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Total Estimated Cost
              </span>
              <div className="text-3xl font-extrabold mt-1">
                {costData.currencySymbol}{costData.totalCost.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                For {costData.travelersCount} travelers ({costData.durationDays} days in {costData.destination})
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Cost Per Person
              </span>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {costData.currencySymbol}{costData.costPerPerson.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                All inclusive baseline per adult traveler
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Daily Cost Per Traveler
              </span>
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {costData.currencySymbol}{costData.costPerDayPerPerson.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ day</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Covers lodging, meals, transit & attractions
              </p>
            </div>
          </div>

          {/* Ratio bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Budget Allocation Distribution</span>
            </h3>

            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              <div style={{ width: '42%' }} className="bg-indigo-500 h-full" title="Accommodation (42%)" />
              <div style={{ width: '28%' }} className="bg-emerald-500 h-full" title="Dining (28%)" />
              <div style={{ width: '16%' }} className="bg-amber-500 h-full" title="Activities (16%)" />
              <div style={{ width: '9%' }} className="bg-sky-500 h-full" title="Transit (9%)" />
              <div style={{ width: '5%' }} className="bg-purple-500 h-full" title="Contingency (5%)" />
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Lodging 42%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dining 28%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Activities 16%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Transit 9%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Souvenirs 5%</span>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Expense Category Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {costData.breakdown.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {item.category}
                      </h4>
                      <span className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                        {costData.currencySymbol}{item.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                      {item.description}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Pro Saving Hack:</strong> {item.tipsToSave}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saving Tips Banner */}
          {costData.savingTips && costData.savingTips.length > 0 && (
            <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider mb-2">
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Local Cost-Saving Recommendations</span>
              </div>
              <ul className="space-y-1.5">
                {costData.savingTips.map((tip, i) => (
                  <li key={i} className="text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};
