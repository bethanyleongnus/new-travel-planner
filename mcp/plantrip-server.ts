import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  createItineraryTool,
  getItineraryStatusTool,
  getItineraryTool,
  modifyItineraryTool,
  listUserTripsTool,
  saveItineraryTool,
  deleteTripTool,
  generatePackingListTool,
  askTravelExpertTool,
  getWeatherInsightsTool,
  estimateTripCostTool,
  searchGuidesTool,
  getTourAvailabilityTool,
  submitTourInquiryTool
} from './tools.ts';

// Initialize Model Context Protocol server instance
export const mcpServer = new McpServer({
  name: 'plantrip-mcp-server',
  version: '1.0.0'
});

// Tool 1: create_itinerary
mcpServer.tool(
  'create_itinerary',
  'Create a new travel itinerary with daily activities, costs, and routes',
  {
    destination: z.string().describe('Travel destination (e.g., "Kyoto, Japan", "Paris, France")'),
    duration_days: z.number().optional().describe('Number of days for the trip (default 4)'),
    start_date: z.string().optional().describe('Start date in YYYY-MM-DD format'),
    budget: z.enum(['budget', 'moderate', 'luxury']).optional().describe('Budget category'),
    travel_style: z.enum(['cultural', 'foodie', 'adventure', 'relaxed', 'family', 'romantic', 'solo']).optional().describe('Style of travel'),
    travelers: z.number().optional().describe('Number of travelers in the party'),
    interests: z.array(z.string()).optional().describe('Special interests like temples, gastronomy, photography'),
    notes: z.string().optional().describe('Any custom preferences or dietary constraints')
  },
  async (args) => {
    const result = await createItineraryTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 2: get_itinerary_status
mcpServer.tool(
  'get_itinerary_status',
  'Poll generation status of an in-progress itinerary',
  {
    itinerary_id: z.string().describe('The ID of the itinerary being generated')
  },
  async (args) => {
    const result = await getItineraryStatusTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 3: get_itinerary
mcpServer.tool(
  'get_itinerary',
  'Retrieve complete itinerary details including day-by-day plans, maps, and local tips',
  {
    itinerary_id: z.string().describe('The ID of the itinerary to retrieve')
  },
  async (args) => {
    const result = await getItineraryTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 4: modify_itinerary
mcpServer.tool(
  'modify_itinerary',
  'Modify an existing itinerary with natural language instructions',
  {
    itinerary_id: z.string().describe('The ID of the itinerary to adjust'),
    modification_request: z.string().describe('Natural language modification request (e.g. "Add more ramen spots on day 2")')
  },
  async (args) => {
    const result = await modifyItineraryTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 5: list_user_trips
mcpServer.tool(
  'list_user_trips',
  'List saved trips and itineraries',
  {},
  async () => {
    const result = await listUserTripsTool();
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 6: save_itinerary
mcpServer.tool(
  'save_itinerary',
  "Save an itinerary to user's saved trips collection",
  {
    itinerary: z.any().describe('The itinerary object to save'),
    title: z.string().optional().describe('Optional custom title')
  },
  async (args) => {
    const result = await saveItineraryTool(args as any);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 7: delete_trip
mcpServer.tool(
  'delete_trip',
  'Remove a trip from saved trips collection',
  {
    trip_id: z.string().describe('The unique identifier of the trip to delete')
  },
  async (args) => {
    const result = await deleteTripTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 8: generate_packing_list
mcpServer.tool(
  'generate_packing_list',
  'Generate an AI packing list tailored to destination, climate, duration, and planned activities',
  {
    destination: z.string().describe('Travel destination'),
    duration_days: z.number().optional().describe('Length of stay in days'),
    season_or_month: z.string().optional().describe('Current season or month of travel'),
    activities: z.array(z.string()).optional().describe('List of planned activities (e.g. hiking, fine dining)'),
    travelers_type: z.string().optional().describe('Travel party demographic')
  },
  async (args) => {
    const result = await generatePackingListTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 9: ask_travel_expert
mcpServer.tool(
  'ask_travel_expert',
  'Travel Q&A for insider recommendations, etiquette, scams to avoid, transit passes, and tips',
  {
    question: z.string().describe('Travel question or advice requested'),
    destination: z.string().describe('Destination city or region'),
    travel_context: z.string().optional().describe('Extra context such as traveling with kids, dietary needs, etc.')
  },
  async (args) => {
    const result = await askTravelExpertTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 10: get_weather_insights
mcpServer.tool(
  'get_weather_insights',
  'Weather, historical climate info, rainfall risks, and clothing suggestions',
  {
    destination: z.string().describe('Target destination'),
    month: z.union([z.string(), z.number()]).optional().describe('Month name or number')
  },
  async (args) => {
    const result = await getWeatherInsightsTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 11: estimate_trip_cost
mcpServer.tool(
  'estimate_trip_cost',
  'Detailed budget breakdown across accommodation, dining, transport, activities, and contingency',
  {
    destination: z.string().describe('Destination name'),
    duration_days: z.number().optional().describe('Trip duration in days'),
    travel_style: z.enum(['budget', 'moderate', 'luxury']).optional().describe('Style/comfort tier'),
    travelers: z.number().optional().describe('Count of travelers')
  },
  async (args) => {
    const result = await estimateTripCostTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 12: search_guides
mcpServer.tool(
  'search_guides',
  'Search travel guides, neighborhood breakdowns, and hidden gem articles',
  {
    query: z.string().optional().describe('Search query'),
    destination: z.string().optional().describe('Destination filter'),
    category: z.string().optional().describe('Category filter: culture, food, transport, practical')
  },
  async (args) => {
    const result = await searchGuidesTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 13: get_tour_availability
mcpServer.tool(
  'get_tour_availability',
  'Check tour dates and slot availability for guided experiences',
  {
    destination: z.string().optional().describe('Destination filter'),
    tour_type: z.string().optional().describe('Type or theme of tour'),
    date: z.string().optional().describe('Target date in YYYY-MM-DD')
  },
  async (args) => {
    const result = await getTourAvailabilityTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Tool 14: submit_tour_inquiry
mcpServer.tool(
  'submit_tour_inquiry',
  'Submit tour booking inquiry and receive confirmation code',
  {
    tour_id: z.string().optional().describe('ID of the tour'),
    tour_title: z.string().optional().describe('Title of the tour'),
    destination: z.string().optional().describe('Destination city'),
    traveler_name: z.string().describe('Primary traveler name'),
    email: z.string().describe('Contact email address'),
    preferred_date: z.string().describe('Preferred tour date'),
    travelers_count: z.number().describe('Number of participants'),
    special_requests: z.string().optional().describe('Dietary or accessibility notes')
  },
  async (args) => {
    const result = await submitTourInquiryTool(args);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Registry of tool handlers for direct execution by API endpoints
export const MCP_TOOLS_REGISTRY: Record<string, (args: any) => Promise<any>> = {
  create_itinerary: createItineraryTool,
  get_itinerary_status: getItineraryStatusTool,
  get_itinerary: getItineraryTool,
  modify_itinerary: modifyItineraryTool,
  list_user_trips: listUserTripsTool,
  save_itinerary: saveItineraryTool,
  delete_trip: deleteTripTool,
  generate_packing_list: generatePackingListTool,
  ask_travel_expert: askTravelExpertTool,
  get_weather_insights: getWeatherInsightsTool,
  estimate_trip_cost: estimateTripCostTool,
  search_guides: searchGuidesTool,
  get_tour_availability: getTourAvailabilityTool,
  submit_tour_inquiry: submitTourInquiryTool
};

export const MCP_TOOLS_METADATA = [
  { name: 'create_itinerary', description: 'Create a new travel itinerary with daily activities, costs, and routes' },
  { name: 'get_itinerary_status', description: 'Poll generation status of an in-progress itinerary' },
  { name: 'get_itinerary', description: 'Retrieve complete itinerary details including day-by-day plans, maps, and local tips' },
  { name: 'modify_itinerary', description: 'Modify an existing itinerary with natural language instructions' },
  { name: 'list_user_trips', description: 'List saved trips and itineraries' },
  { name: 'save_itinerary', description: "Save an itinerary to user's saved trips collection" },
  { name: 'delete_trip', description: 'Remove a trip from saved trips collection' },
  { name: 'generate_packing_list', description: 'Generate an AI packing list tailored to destination, climate, duration, and planned activities' },
  { name: 'ask_travel_expert', description: 'Travel Q&A for insider recommendations, etiquette, scams to avoid, transit passes, and tips' },
  { name: 'get_weather_insights', description: 'Weather, historical climate info, rainfall risks, and clothing suggestions' },
  { name: 'estimate_trip_cost', description: 'Detailed budget breakdown across accommodation, dining, transport, activities, and contingency' },
  { name: 'search_guides', description: 'Search travel guides, neighborhood breakdowns, and hidden gem articles' },
  { name: 'get_tour_availability', description: 'Check tour dates and slot availability for guided experiences' },
  { name: 'submit_tour_inquiry', description: 'Submit tour booking inquiry and receive confirmation code' }
];

// If executed directly via CLI/stdio
async function main() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  process.stderr.write('PlanTrip MCP server running on stdio transport.\n');
}

if (process.argv[1]?.includes('plantrip-server')) {
  main().catch((err) => {
    process.stderr.write(`PlanTrip MCP Server failed to start: ${err.message}\n`);
    process.exit(1);
  });
}
