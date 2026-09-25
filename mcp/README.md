# PlanTrip MCP Server

A Model Context Protocol (MCP) server providing AI agents (like Claude Desktop, Cursor, or custom LLM clients) with access to PlanTrip travel planning tools.

Repository: [klabianco/plantrip-mcp-server](https://github.com/klabianco/plantrip-mcp-server)

## Available Tools

| Tool | Description |
|---|---|
| `create_itinerary` | Create a new travel itinerary with daily activities, costs, and routes |
| `get_itinerary_status` | Poll generation status of an in-progress itinerary |
| `get_itinerary` | Retrieve complete itinerary details |
| `modify_itinerary` | Modify an existing itinerary with natural language instructions |
| `list_user_trips` | List saved trips and itineraries |
| `save_itinerary` | Save an itinerary to user's saved trips collection |
| `delete_trip` | Remove a trip from saved trips collection |
| `generate_packing_list` | Generate an AI packing list tailored to destination, climate, and activities |
| `ask_travel_expert` | Travel Q&A for insider recommendations, etiquette, scams to avoid, and transit passes |
| `get_weather_insights` | Weather, historical climate info, rainfall risks, and clothing suggestions |
| `estimate_trip_cost` | Detailed budget breakdown across accommodation, dining, transport, activities |
| `search_guides` | Search travel guides, neighborhood breakdowns, and hidden gem articles |
| `get_tour_availability` | Check tour dates and slot availability for guided experiences |
| `submit_tour_inquiry` | Submit tour booking inquiry and receive confirmation code |

## Claude Desktop Configuration

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "plantrip": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp/plantrip-server.ts"],
      "env": {
        "PLANTRIP_API_KEY": "YOUR_API_KEY_HERE"
      }
    }
  }
}
```

## Running Directly

```bash
PLANTRIP_API_KEY="your-key" npx tsx mcp/plantrip-server.ts
```
