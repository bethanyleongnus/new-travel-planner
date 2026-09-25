import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Sun,
  Droplets,
  Shirt,
  Sparkles,
  Award,
  AlertCircle,
  RefreshCw,
  Compass
} from 'lucide-react';
import { WeatherInsights } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface WeatherInsightsViewProps {
  currentDestination?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const WeatherInsightsView: React.FC<WeatherInsightsViewProps> = ({
  currentDestination = 'Kyoto, Japan'
}) => {
  const [destination, setDestination] = useState<string>(currentDestination);
  const [selectedMonth, setSelectedMonth] = useState<string>('October');
  const [useFahrenheit, setUseFahrenheit] = useState<boolean>(false);
  const [weather, setWeather] = useState<WeatherInsights | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWeather = async () => {
    try {
      setIsLoading(true);
      const res = await McpClientService.getWeatherInsights({
        destination,
        month: selectedMonth
      });
      setWeather(res);
    } catch (err: any) {
      alert(`Weather lookup failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [destination, selectedMonth]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tool: get_weather_insights</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Weather & Climate Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historical climate trends, rainfall probability, and clothing recommendations
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Destination"
          />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* C / F toggle */}
          <button
            onClick={() => setUseFahrenheit(!useFahrenheit)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            {useFahrenheit ? '°F Units' : '°C Units'}
          </button>
        </div>
      </div>

      {weather && (
        <>
          {/* Main Weather Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Temperature */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4" /> Avg Temperature
                </span>
                <div className="text-3xl font-extrabold mt-2">
                  {useFahrenheit ? `${weather.averageHighF}°F` : `${weather.averageHighC}°C`}
                </div>
                <div className="text-xs text-amber-100 mt-1">
                  Low of {useFahrenheit ? `${weather.averageLowF}°F` : `${weather.averageLowC}°C`}
                </div>
              </div>
              <div className="text-[11px] bg-black/15 px-2.5 py-1 rounded-lg mt-4 inline-block font-medium">
                Season: {weather.seasonType}
              </div>
            </div>

            {/* Precipitation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4 text-sky-500" /> Rain Risk
                </span>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {weather.rainfallChance}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  ~{weather.rainfallMm} mm monthly average
                </div>
              </div>
              <div className="text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 rounded-lg mt-4 font-medium border border-sky-100 dark:border-sky-800/50">
                Light occasional showers
              </div>
            </div>

            {/* Sunshine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-500" /> Sunshine Hours
                </span>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {weather.sunshineHoursPerDay}h <span className="text-sm font-normal text-slate-500 dark:text-slate-400">/ day</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Humidity: {weather.humidity}
                </div>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg mt-4 font-medium border border-amber-100 dark:border-amber-800/50">
                Crisp daylight for photography
              </div>
            </div>

            {/* Traveler Rating */}
            <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Travel Score
                </span>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {weather.travelerSuitabilityRating} <span className="text-base text-slate-400 font-normal">/ 10</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1">
                  Ideal travel conditions
                </div>
              </div>
              <div className="text-[11px] text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg mt-4">
                Peak aesthetic season
              </div>
            </div>
          </div>

          {/* What to Wear Guidance */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
              <Shirt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Attire for {weather.destination} in {weather.month}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {weather.clothingRecommendation}
            </p>
          </div>

          {/* Key Climate Advice */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Key Climate Notes & Recommendations</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {weather.keyAdvice.map((adv, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/50 text-xs text-emerald-950 dark:text-emerald-200 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
