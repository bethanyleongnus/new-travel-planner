import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Calendar,
  DollarSign,
  MapPin,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  Users,
  Compass
} from 'lucide-react';
import { SavedTripSummary, Itinerary } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface SavedTripsViewProps {
  onLoadTrip: (itinerary: Itinerary) => void;
  onNavigateToPlanner: () => void;
}

export const SavedTripsView: React.FC<SavedTripsViewProps> = ({
  onLoadTrip,
  onNavigateToPlanner
}) => {
  const [trips, setTrips] = useState<SavedTripSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTrips = async () => {
    try {
      setIsLoading(true);
      const list = await McpClientService.listUserTrips();
      setTrips(list);
    } catch (err: any) {
      alert(`Failed to load saved trips: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleDelete = async (tripId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove "${title}"?`)) return;
    try {
      await McpClientService.deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleOpenTrip = async (tripId: string) => {
    // Check if full trip is in localStorage
    const localFull = localStorage.getItem(`plantrip_full_${tripId}`);
    if (localFull) {
      try {
        const fullItinerary: Itinerary = JSON.parse(localFull);
        onLoadTrip(fullItinerary);
        onNavigateToPlanner();
        return;
      } catch {
        // fall through to get_itinerary
      }
    }

    try {
      const res = await McpClientService.getItinerary(tripId);
      if (res.itinerary) {
        onLoadTrip(res.itinerary);
        onNavigateToPlanner();
      } else {
        alert('Could not retrieve full itinerary details.');
      }
    } catch (err: any) {
      alert(`Load failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tools: list_user_trips & delete_trip</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Saved Trips & Itineraries
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse and manage all upcoming travel plans you have crafted
          </p>
        </div>

        <button
          onClick={onNavigateToPlanner}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Plan a New Trip</span>
        </button>
      </div>

      {/* Trips Gallery */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading saved trips...</p>
        </div>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
            >
              {/* Trip Hero Header Image */}
              <div className="h-44 relative overflow-hidden bg-slate-800">
                <img
                  src={
                    trip.heroImage ||
                    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/80 backdrop-blur-xs text-white">
                    {trip.durationDays} Days • {trip.travelStyle}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1 leading-snug line-clamp-1">
                    {trip.destination}
                  </h3>
                </div>
              </div>

              {/* Trip details */}
              <div className="p-5 space-y-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                  {trip.title}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.startDate || 'Upcoming'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trip.travelersCount} Travelers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{trip.totalCost}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="capitalize">{trip.budgetTier} Tier</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenTrip(trip.id)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open in Studio</span>
                  </button>

                  <button
                    onClick={() => handleDelete(trip.id, trip.title)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
                    title="Remove from saved trips"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
          <FolderHeart className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">No Saved Trips Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Head to the Itinerary Planner to create and save your personalized travel itineraries!
          </p>
          <button
            onClick={onNavigateToPlanner}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Generate First Trip</span>
          </button>
        </div>
      )}
    </div>
  );
};
