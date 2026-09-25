import React, { useState, useEffect } from 'react';
import {
  Luggage,
  CheckCircle2,
  Circle,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Shirt,
  Sparkle,
  Cpu,
  FileText,
  HeartPulse,
  Package
} from 'lucide-react';
import { PackingListResponse, PackingItem } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface PackingListViewProps {
  currentDestination?: string;
  durationDays?: number;
}

export const PackingListView: React.FC<PackingListViewProps> = ({
  currentDestination = 'Kyoto, Japan',
  durationDays = 5
}) => {
  const [destination, setDestination] = useState<string>(currentDestination);
  const [duration, setDuration] = useState<number>(durationDays);
  const [season, setSeason] = useState<string>('Autumn');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [packingData, setPackingData] = useState<PackingListResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCat, setNewItemCat] = useState<PackingItem['category']>('clothing');

  const fetchPackingList = async (destToUse = destination, durToUse = duration) => {
    try {
      setIsLoading(true);
      const res = await McpClientService.generatePackingList({
        destination: destToUse,
        duration_days: durToUse,
        season_or_month: season,
        activities: ['Sightseeing', 'Historic walking', 'Local dining']
      });
      setPackingData(res);
    } catch (err: any) {
      alert(`Failed to generate packing list: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackingList(currentDestination, durationDays);
  }, [currentDestination, durationDays]);

  // Flatten all items for total count and active category filtering
  const allItems: PackingItem[] = packingData
    ? [
        ...packingData.categories.clothing,
        ...packingData.categories.toiletries,
        ...packingData.categories.electronics,
        ...packingData.categories.documents,
        ...packingData.categories.health,
        ...packingData.categories.essentials
      ]
    : [];

  const totalItems = allItems.length;
  const packedItems = allItems.filter((i) => i.packed).length;
  const packedPercentage = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Toggle item packed status
  const handleToggleItem = (itemId: string) => {
    if (!packingData) return;
    const updateCategory = (list: PackingItem[]) =>
      list.map((item) => (item.id === itemId ? { ...item, packed: !item.packed } : item));

    setPackingData({
      ...packingData,
      categories: {
        clothing: updateCategory(packingData.categories.clothing),
        toiletries: updateCategory(packingData.categories.toiletries),
        electronics: updateCategory(packingData.categories.electronics),
        documents: updateCategory(packingData.categories.documents),
        health: updateCategory(packingData.categories.health),
        essentials: updateCategory(packingData.categories.essentials)
      }
    });
  };

  // Add custom item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !packingData) return;

    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCat,
      quantity: 1,
      packed: false,
      essential: false
    };

    setPackingData({
      ...packingData,
      categories: {
        ...packingData.categories,
        [newItemCat]: [newItem, ...packingData.categories[newItemCat]]
      }
    });

    setNewItemName('');
  };

  const categoryIcons: Record<string, any> = {
    clothing: Shirt,
    toiletries: Sparkle,
    electronics: Cpu,
    documents: FileText,
    health: HeartPulse,
    essentials: Package
  };

  const getFilteredItems = (): { category: string; items: PackingItem[] }[] => {
    if (!packingData) return [];
    if (activeCategory === 'all') {
      return [
        { category: 'clothing', items: packingData.categories.clothing },
        { category: 'toiletries', items: packingData.categories.toiletries },
        { category: 'electronics', items: packingData.categories.electronics },
        { category: 'documents', items: packingData.categories.documents },
        { category: 'health', items: packingData.categories.health },
        { category: 'essentials', items: packingData.categories.essentials }
      ];
    }
    const cat = activeCategory as keyof typeof packingData.categories;
    return [{ category: activeCategory, items: packingData.categories[cat] || [] }];
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Generation Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tool: generate_packing_list</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Smart Packing Assistant
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Climate-adapted checklist for {destination} ({duration} days, {season})
          </p>
        </div>

        {/* Adjust controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Destination"
          />
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Spring">Spring</option>
            <option value="Summer">Summer</option>
            <option value="Autumn">Autumn</option>
            <option value="Winter">Winter</option>
          </select>
          <button
            onClick={() => fetchPackingList()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>
        </div>
      </div>

      {/* Progress & Packing Statistics Bar */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
              Luggage Checklist Progress
            </span>
            <div className="text-2xl font-extrabold mt-0.5">
              {packedItems} <span className="text-slate-400 font-normal text-sm">of {totalItems} items packed ({packedPercentage}%)</span>
            </div>
          </div>
          <div className="text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            {packedItems === totalItems && totalItems > 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready for departure!
              </span>
            ) : (
              <span>{totalItems - packedItems} items remaining</span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-400 h-full transition-all duration-300"
            style={{ width: `${packedPercentage}%` }}
          />
        </div>
      </div>

      {/* Special Climate & Destination Tips */}
      {packingData?.specialRecommendations && packingData.specialRecommendations.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Destination-Specific Packing Advice</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packingData.specialRecommendations.map((rec, i) => (
              <div key={i} className="text-xs text-amber-800 dark:text-amber-200 bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-amber-200/60 dark:border-amber-800/50">
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'clothing', 'toiletries', 'electronics', 'documents', 'health', 'essentials'].map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Add Custom Item Input */}
      <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 transition-colors">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom packing item (e.g. Travel pillow, camera lens)..."
          className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={newItemCat}
          onChange={(e) => setNewItemCat(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="clothing">Clothing</option>
          <option value="toiletries">Toiletries</option>
          <option value="electronics">Electronics</option>
          <option value="documents">Documents</option>
          <option value="health">Health</option>
          <option value="essentials">Essentials</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </form>

      {/* Items Checklist Grouped */}
      <div className="space-y-5">
        {getFilteredItems().map(({ category, items }) => {
          const Icon = categoryIcons[category] || Package;
          if (items.length === 0) return null;
          return (
            <div key={category} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="capitalize">{category}</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">({items.filter(i => i.packed).length}/{items.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      item.packed
                        ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 line-through'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-500/50 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                    >
                      {item.packed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm font-medium ${item.packed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.name}
                        </span>
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            ×{item.quantity}
                          </span>
                        )}
                        {item.essential && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60">
                            Essential
                          </span>
                        )}
                      </div>
                      {item.reason && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {item.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
