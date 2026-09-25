import {
  Itinerary,
  PackingListResponse,
  WeatherInsights,
  CostEstimate,
  TravelGuide,
  TourItem,
  TourInquiryResponse,
  ExpertAnswer,
  SavedTripSummary,
  McpToolMeta,
  ServerStatus
} from '../types/travel.ts';

const LOCAL_STORAGE_TRIPS_KEY = 'plantrip_saved_trips_v1';

export class McpClientService {
  /**
   * Fetch server status & MCP connection
   */
  static async getStatus(): Promise<ServerStatus> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        status: 'online',
        server: 'plantrip-mcp-server',
        version: '1.0.0',
        toolsCount: 14,
        hasPlantripKey: false,
        protocol: 'model-context-protocol/1.0',
        uptime: 0
      };
    }
  }

  /**
   * Fetch list of registered MCP tools
   */
  static async getTools(): Promise<McpToolMeta[]> {
    try {
      const res = await fetch('/api/mcp/tools');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.tools || [];
    } catch {
      return [
        { name: 'create_itinerary', description: 'Create a new travel itinerary' },
        { name: 'get_itinerary_status', description: 'Poll generation status' },
        { name: 'get_itinerary', description: 'Retrieve complete itinerary' },
        { name: 'modify_itinerary', description: 'Modify with natural language' },
        { name: 'list_user_trips', description: 'List saved trips' },
        { name: 'save_itinerary', description: "Save to user's trips" },
        { name: 'delete_trip', description: 'Remove from saved trips' },
        { name: 'generate_packing_list', description: 'AI packing list' },
        { name: 'ask_travel_expert', description: 'Travel Q&A' },
        { name: 'get_weather_insights', description: 'Weather/climate info' },
        { name: 'estimate_trip_cost', description: 'Budget breakdown' },
        { name: 'search_guides', description: 'Search travel guides' },
        { name: 'get_tour_availability', description: 'Check tour dates' },
        { name: 'submit_tour_inquiry', description: 'Tour booking inquiry' }
      ];
    }
  }

  /**
   * Execute raw MCP tool call by name
   */
  static async callTool<T = any>(tool: string, args: Record<string, any> = {}): Promise<T> {
    const res = await fetch('/api/mcp/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tool, arguments: args })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `Failed to execute ${tool}`);
    }
    const data = await res.json();
    return data.result as T;
  }

  // ================= 14 SPECIALIZED TOOL WRAPPERS =================

  // 1. create_itinerary
  static async createItinerary(params: {
    destination: string;
    duration_days?: number;
    start_date?: string;
    budget?: 'budget' | 'moderate' | 'luxury';
    travel_style?: 'cultural' | 'foodie' | 'adventure' | 'relaxed' | 'family' | 'romantic' | 'solo';
    travelers?: number;
    interests?: string[];
    notes?: string;
  }): Promise<{ status: string; itinerary_id: string; message: string; itinerary?: Itinerary }> {
    return this.callTool('create_itinerary', params);
  }

  // 2. get_itinerary_status
  static async getItineraryStatus(itinerary_id: string): Promise<{
    itinerary_id: string;
    status: string;
    progress: number;
    message: string;
  }> {
    return this.callTool('get_itinerary_status', { itinerary_id });
  }

  // 3. get_itinerary
  static async getItinerary(itinerary_id: string): Promise<{
    itinerary: Itinerary | null;
    found: boolean;
    message: string;
  }> {
    return this.callTool('get_itinerary', { itinerary_id });
  }

  // 4. modify_itinerary
  static async modifyItinerary(itinerary_id: string, modification_request: string): Promise<{
    success: boolean;
    itinerary: Itinerary;
    message: string;
  }> {
    return this.callTool('modify_itinerary', { itinerary_id, modification_request });
  }

  // 5. list_user_trips
  static async listUserTrips(): Promise<SavedTripSummary[]> {
    try {
      const result = await this.callTool<{ trips: SavedTripSummary[] }>('list_user_trips', {});
      const serverTrips = result?.trips || [];

      // Merge with localStorage for persistent client experience without database
      const localStr = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (localStr) {
        try {
          const localTrips: SavedTripSummary[] = JSON.parse(localStr);
          const map = new Map<string, SavedTripSummary>();
          serverTrips.forEach(t => map.set(t.id, t));
          localTrips.forEach(t => map.set(t.id, t));
          return Array.from(map.values());
        } catch {
          // ignore parsing error
        }
      }
      return serverTrips;
    } catch {
      return [];
    }
  }

  // 6. save_itinerary
  static async saveItinerary(itinerary: Itinerary, title?: string): Promise<{ success: boolean; trip_id: string; message: string }> {
    const result = await this.callTool('save_itinerary', { itinerary, title });

    // Store summary in localStorage
    try {
      const existing = await this.listUserTrips();
      const updated = [
        {
          id: itinerary.id,
          title: title || itinerary.title,
          destination: itinerary.destination,
          durationDays: itinerary.durationDays,
          startDate: itinerary.startDate,
          budgetTier: itinerary.budgetTier,
          travelStyle: itinerary.travelStyle,
          travelersCount: itinerary.travelersCount,
          totalCost: itinerary.totalEstimatedCost,
          heroImage: itinerary.destination.toLowerCase().includes('japan') || itinerary.destination.toLowerCase().includes('kyoto')
            ? 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80'
            : itinerary.destination.toLowerCase().includes('paris')
            ? 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80'
            : 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1200&q=80',
          createdAt: new Date().toISOString()
        },
        ...existing.filter(t => t.id !== itinerary.id)
      ];
      localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(updated));
      localStorage.setItem(`plantrip_full_${itinerary.id}`, JSON.stringify(itinerary));
    } catch {
      // ignore
    }

    return result;
  }

  // 7. delete_trip
  static async deleteTrip(trip_id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.callTool('delete_trip', { trip_id });
    try {
      const localStr = localStorage.getItem(LOCAL_STORAGE_TRIPS_KEY);
      if (localStr) {
        const localTrips: SavedTripSummary[] = JSON.parse(localStr);
        const filtered = localTrips.filter(t => t.id !== trip_id);
        localStorage.setItem(LOCAL_STORAGE_TRIPS_KEY, JSON.stringify(filtered));
        localStorage.removeItem(`plantrip_full_${trip_id}`);
      }
    } catch {
      // ignore
    }
    return result;
  }

  // 8. generate_packing_list
  static async generatePackingList(params: {
    destination: string;
    duration_days?: number;
    season_or_month?: string;
    activities?: string[];
    travelers_type?: string;
  }): Promise<PackingListResponse> {
    return this.callTool('generate_packing_list', params);
  }

  // 9. ask_travel_expert
  static async askTravelExpert(params: {
    question: string;
    destination: string;
    travel_context?: string;
  }): Promise<ExpertAnswer> {
    return this.callTool('ask_travel_expert', params);
  }

  // 10. get_weather_insights
  static async getWeatherInsights(params: {
    destination: string;
    month?: string | number;
  }): Promise<WeatherInsights> {
    return this.callTool('get_weather_insights', params);
  }

  // 11. estimate_trip_cost
  static async estimateTripCost(params: {
    destination: string;
    duration_days?: number;
    travel_style?: 'budget' | 'moderate' | 'luxury';
    travelers?: number;
  }): Promise<CostEstimate> {
    return this.callTool('estimate_trip_cost', params);
  }

  // 12. search_guides
  static async searchGuides(params: {
    query?: string;
    destination?: string;
    category?: string;
  }): Promise<{ guides: TravelGuide[]; count: number }> {
    return this.callTool('search_guides', params);
  }

  // 13. get_tour_availability
  static async getTourAvailability(params: {
    destination?: string;
    tour_type?: string;
    date?: string;
  }): Promise<{ tours: TourItem[]; destination: string }> {
    return this.callTool('get_tour_availability', params);
  }

  // 14. submit_tour_inquiry
  static async submitTourInquiry(params: {
    tour_id?: string;
    tour_title?: string;
    destination?: string;
    traveler_name: string;
    email: string;
    preferred_date: string;
    travelers_count: number;
    special_requests?: string;
  }): Promise<TourInquiryResponse> {
    return this.callTool('submit_tour_inquiry', params);
  }

  // 15. askChatbot (queries MCP tools with conversational AI concierge)
  static async askChatbot(params: {
    message: string;
    destination?: string;
    durationDays?: number;
    budgetTier?: 'budget' | 'moderate' | 'luxury';
  }): Promise<{
    success: boolean;
    reply: string;
    mcpToolUsed: string;
    mcpToolArgs: Record<string, any>;
    mcpData: any;
    destination: string;
    suggestions: string[];
  }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Chatbot request failed');
    }
    return await res.json();
  }
}
