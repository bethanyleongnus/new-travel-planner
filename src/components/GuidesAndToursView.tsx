import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  Sparkles,
  Ticket,
  MapPin,
  Users,
  Send,
  X,
  Compass
} from 'lucide-react';
import { TravelGuide, TourItem, TourInquiryResponse } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface GuidesAndToursViewProps {
  currentDestination?: string;
}

export const GuidesAndToursView: React.FC<GuidesAndToursViewProps> = ({
  currentDestination = 'Kyoto, Japan'
}) => {
  const [destination, setDestination] = useState<string>(currentDestination);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'guides' | 'tours'>('guides');

  // Guides state
  const [guides, setGuides] = useState<TravelGuide[]>([]);
  const [isLoadingGuides, setIsLoadingGuides] = useState<boolean>(false);
  const [selectedGuide, setSelectedGuide] = useState<TravelGuide | null>(null);

  // Tours state
  const [tours, setTours] = useState<TourItem[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState<boolean>(false);

  // Tour Booking Modal state
  const [inquiryTour, setInquiryTour] = useState<TourItem | null>(null);
  const [travelerName, setTravelerName] = useState<string>('Alex Morgan');
  const [travelerEmail, setTravelerEmail] = useState<string>('alex.morgan@example.com');
  const [preferredDate, setPreferredDate] = useState<string>('2026-10-16');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);
  const [inquiryConfirmation, setInquiryConfirmation] = useState<TourInquiryResponse | null>(null);

  // Load guides (using MCP tool: search_guides)
  const fetchGuides = async () => {
    try {
      setIsLoadingGuides(true);
      const res = await McpClientService.searchGuides({
        destination,
        query: searchQuery
      });
      setGuides(res.guides || []);
    } catch (err: any) {
      alert(`Guide search failed: ${err.message}`);
    } finally {
      setIsLoadingGuides(false);
    }
  };

  // Load tours (using MCP tool: get_tour_availability)
  const fetchTours = async () => {
    try {
      setIsLoadingTours(true);
      const res = await McpClientService.getTourAvailability({
        destination
      });
      setTours(res.tours || []);
    } catch (err: any) {
      alert(`Tour availability failed: ${err.message}`);
    } finally {
      setIsLoadingTours(false);
    }
  };

  useEffect(() => {
    fetchGuides();
    fetchTours();
  }, [destination]);

  // Handle tour inquiry submission (using MCP tool: submit_tour_inquiry)
  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryTour) return;

    try {
      setIsSubmittingInquiry(true);
      const res = await McpClientService.submitTourInquiry({
        tour_id: inquiryTour.id,
        tour_title: inquiryTour.title,
        destination,
        traveler_name: travelerName,
        email: travelerEmail,
        preferred_date: preferredDate,
        travelers_count: travelersCount,
        special_requests: specialRequests
      });
      setInquiryConfirmation(res);
    } catch (err: any) {
      alert(`Tour inquiry failed: ${err.message}`);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tools: search_guides & get_tour_availability</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Travel Guides & Guided Experiences
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Curated editorial guides and verified local tours in {destination}
          </p>
        </div>

        {/* Destination & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Destination"
          />
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchGuides()}
              placeholder="Search guides (e.g. food, temples)..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('guides')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'guides'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curated Travel Guides ({guides.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tours')}
          className={`pb-3 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'tours'
              ? 'border-b-2 border-emerald-600 dark:border-emerald-400 text-emerald-700 dark:text-emerald-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Guided Tours & Experiences ({tours.length})</span>
        </button>
      </div>

      {/* Guides Section */}
      {activeTab === 'guides' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                    {guide.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {guide.readTimeMinutes} min read
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 mb-2 leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {guide.summary}
                </p>

                {/* Highlights */}
                <div className="space-y-1 mb-4">
                  {guide.highlights.map((hl, i) => (
                    <div key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedGuide(guide)}
                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 transition cursor-pointer"
              >
                Read Complete Field Guide
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tours Section */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 mb-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span>{tour.rating}</span>
                        <span className="text-slate-400 font-normal">({tour.reviewCount} reviews)</span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">
                        {tour.title}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-slate-900">
                        ${tour.pricePerPerson}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">
                        per person
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {tour.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {tour.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> {tour.destination}
                    </span>
                  </div>

                  {/* Included list */}
                  <div className="p-3 bg-slate-50 rounded-xl mb-4 text-[11px] text-slate-700 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400 block mb-1">
                      Experience Includes:
                    </span>
                    {tour.included.map((inc, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{inc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dates availability status */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Upcoming Available Dates:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tour.availability.map((avail, aIdx) => (
                        <span
                          key={aIdx}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                            avail.status === 'few_left'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {avail.date}: {avail.availableSlots} slots left
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInquiryTour(tour);
                    setInquiryConfirmation(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Inquire & Reserve Dates</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[85vh] overflow-y-auto relative shadow-2xl">
            <button
              onClick={() => setSelectedGuide(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-2 inline-block">
              {selectedGuide.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif mb-2">
              {selectedGuide.title}
            </h2>
            <div className="text-xs text-slate-400 mb-4 flex items-center gap-2">
              <span>Destination: {selectedGuide.destination}</span>
              <span>•</span>
              <span>{selectedGuide.readTimeMinutes} min reading time</span>
            </div>

            <div className="prose text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 mb-6">
              <p className="font-medium text-slate-900 bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedGuide.summary}
              </p>
              <p>{selectedGuide.content}</p>

              <h4 className="font-bold text-slate-900 text-sm mt-4">Key Takeaways & Highlights:</h4>
              <ul className="space-y-1.5 list-disc pl-5">
                {selectedGuide.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedGuide(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}

      {/* Tour Inquiry Booking Modal */}
      {inquiryTour && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl">
            <button
              onClick={() => {
                setInquiryTour(null);
                setInquiryConfirmation(null);
              }}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {inquiryConfirmation ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-serif">
                  Booking Inquiry Confirmed!
                </h3>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-mono font-bold">
                  Confirmation Code: {inquiryConfirmation.confirmationCode}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {inquiryConfirmation.message}
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 text-left space-y-1">
                  <div><strong>Tour:</strong> {inquiryConfirmation.tourTitle}</div>
                  <div><strong>Date:</strong> {inquiryConfirmation.preferredDate}</div>
                  <div><strong>Travelers:</strong> {inquiryConfirmation.travelersCount} guests</div>
                  <div><strong>Estimated Total:</strong> {inquiryConfirmation.estimatedTotal}</div>
                </div>
                <button
                  onClick={() => {
                    setInquiryTour(null);
                    setInquiryConfirmation(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>MCP Tool: submit_tour_inquiry</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  Reserve Tour Experience
                </h3>
                <p className="text-xs text-slate-500">
                  {inquiryTour.title} (${inquiryTour.pricePerPerson} / person)
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Primary Traveler Name
                  </label>
                  <input
                    type="text"
                    required
                    value={travelerName}
                    onChange={(e) => setTravelerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={travelerEmail}
                    onChange={(e) => setTravelerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Travelers Count
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={travelersCount}
                      onChange={(e) => setTravelersCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Dietary or Accessibility Requests
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="e.g. Vegetarian diet, step-free access needed..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingInquiry}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingInquiry ? 'Submitting Inquiry...' : 'Submit Tour Booking Inquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
