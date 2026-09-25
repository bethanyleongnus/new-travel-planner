# MASTER PROMPT · Travel Planner App (PlanTrip / Voyager)
## Expose a Compliant MCP Server Endpoint Inside the App

> **Instructions**: Paste into the chat panel of the travel planner project in Google AI Studio (Build mode).

---

### ROLE
You are a senior full-stack developer working in this existing Vite + React + Express project, **PlanTrip AI Travel Planner** (Voyager Travels). It already has `server.ts`, which the AI Studio preview runs with `tsx` on port 3000, and an `api/` folder at the project root, which Vercel runs as serverless functions.

---

### GOAL
Establish a fully compliant, production-ready Model Context Protocol (MCP) server directly inside this app at `/api/mcp` supporting Streamable HTTP and JSON-RPC 2.0 (protocol `2024-11-05` / `2025-11-25`), serving all 14 travel planning tools, and ensuring external MCP clients (Claude Code, MCP Inspector, Cursor, Gemini SDK) and the internal UI establish a successful, verified MCP connection.

---

### OUTPUT

#### 1) Dependencies & Runtime
- Ensure `@modelcontextprotocol/sdk` is installed at `^1.30.1` and `zod` at `^4.6.5`.
- Do not use standalone web-request-only wrappers; implement one unified `(req, res)` handler that both the Express dev server (`server.ts`) and Vercel serverless functions (`api/`) execute.
- Keep package dependencies clean and ensure `package.json` scripts point `dev` to `"tsx server.ts"` and `start` to `"node server.ts"`.

#### 2) Directory Structure & Route Isolation
- House server-side MCP engines, mock dataset stores, and tool logic in `mcp/` (or `api/_lib/` if serverless private routing is required). Prefix any private helpers in `api/` with an underscore (e.g. `api/_lib/`) so Vercel does not expose them as individual endpoints.
- Provide `api/mcp.ts` and `api/health.ts` exporting default `handler(req, res)` so that Vercel routes `/api/mcp` and `/api/health` directly without URL rewrites.
- Ensure `vercel.json` provides fallback rewrites for `/api/mcp`, `/api/health`, and single-page application routing:
  ```json
  {
    "framework": "vite",
    "rewrites": [
      { "source": "/api/mcp", "destination": "/api/mcp.ts" },
      { "source": "/api/health", "destination": "/api/health.ts" },
      { "source": "/api/(.*)", "destination": "/api/index.ts" },
      { "source": "/((?!api/).*)", "destination": "/index.html" }
    ]
  }
  ```

#### 3) MCP Tools Suite (14 Specialized Tools)
Ensure every tool validates inputs using Zod schemas and returns structured, deterministic data:
1. `create_itinerary` `{ destination, duration_days?, start_date?, budget?, travel_style?, travelers?, interests?, notes? }`
2. `get_itinerary_status` `{ itinerary_id }`
3. `get_itinerary` `{ itinerary_id }`
4. `modify_itinerary` `{ itinerary_id, modification_request }`
5. `list_user_trips` `{}`
6. `save_itinerary` `{ itinerary, title? }`
7. `delete_trip` `{ trip_id }`
8. `generate_packing_list` `{ destination, duration_days?, season_or_month?, activities?, travelers_type? }`
9. `ask_travel_expert` `{ question, destination, travel_context? }`
10. `get_weather_insights` `{ destination, month? }`
11. `estimate_trip_cost` `{ destination, duration_days?, travel_style?, travelers? }`
12. `search_guides` `{ query?, destination?, category? }`
13. `get_tour_availability` `{ destination?, tour_type?, date? }`
14. `submit_tour_inquiry` `{ tour_id?, tour_title?, destination?, traveler_name, email, preferred_date, travelers_count, special_requests? }`

#### 4) Endpoint Architecture (`/api/mcp`)
Implement `mcpEndpointHandler(req, res)` with the following protocol guarantees:
- **Origin & Security**: If an `Origin` header is present, verify it matches `Host` or `X-Forwarded-Host`, or reject untrusted cross-origin RPC execution with a JSON-RPC error.
- **GET `/api/mcp`**: Answer 200 with server metadata:
  - `SERVER_INFO` (`{ name: "plantrip-mcp-server", title: "PlanTrip AI Travel Planner MCP", version: "1.0.0" }`)
  - `status: "online"`, `healthy: true`, `mcpConnected: true`
  - `protocolVersion: "2024-11-05"`
  - `toolsCount: 14`
  - Full tool manifest array and connection instructions
- **Non-POST/GET methods**: Answer 405 with header `Allow: POST, GET` and JSON-RPC error code `-32000` (`"Method not allowed. Send MCP messages with POST."`).
- **POST `/api/mcp`**: Read and validate JSON-RPC 2.0 payload:
  - `"initialize"`: Answer with `protocolVersion: "2024-11-05"`, `capabilities: { tools: { listChanged: false } }`, and `serverInfo`.
  - `"notifications/initialized"` or `"initialized"`: Answer 200/202 with `{ jsonrpc: "2.0", id: null, result: {} }`.
  - `"ping"`: Answer with `{ jsonrpc: "2.0", id, result: {} }`.
  - `"tools/list"`: Return the array of all 14 tools with name, description, and `inputSchema`.
  - `"tools/call"`: Execute the requested tool from the registry. Format returns as `{ content: [{ type: "text", text: JSON.stringify(output, null, 2) }], structuredContent: output }`. When a tool is not found, return code `-32601`.

#### 5) Tool Annotations & Payloads
- Tag read-only tools (`get_weather_insights`, `estimate_trip_cost`, `search_guides`, `ask_travel_expert`) with annotations:
  `{ readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }`.
- State-modifying tools (`save_itinerary`, `delete_trip`, `submit_tour_inquiry`) declare appropriate destructive/idempotent hints.
- Return descriptive error objects with `isError: true` when inputs fail validation or resources are not found.

#### 6) Express & Serverless Integration (`server.ts` & `api/index.ts`)
- In `server.ts`, mount `apiRouter` at `/api` before `vite.middlewares`.
- Provide a robust SPA fallback in `server.ts` so non-API navigation routes (e.g., `/saved-trips`, `/itinerary`) serve transformed `index.html` rather than returning 404.
- Attach an Express error-handling middleware for `/api` that converts JSON parse errors into 400 with code `-32700`, and malformed requests into code `-32600` as JSON-RPC responses.

#### 7) MCP Client Service (`src/services/mcpClient.ts`)
- Implement `McpClientService` communicating with `/api/mcp`.
- Measure live round-trip latency (ms) for every call.
- Fallback gracefully between JSON-RPC 2.0 `/api/mcp` and direct POST `/api/mcp/call` for maximum compatibility across environments.
- Provide `getStatus()`, `getTools()`, `callTool(name, args)`, and reactive connection state tracking.

#### 8) UI & MCP Inspector Integration
- Ensure the Header and MCP Inspector modal reflect live connection status (`"online"` / `"offline"`), active protocol version (`"model-context-protocol/1.0"`), and live measured latency.
- The MCP Inspector modal should allow inspecting registered tool schemas, triggering test tool calls, and viewing the raw JSON-RPC request and response payloads.
- AI Concierge Drawer (`/api/chat`) resolves traveler queries by invoking the appropriate MCP tool handler and formatting a conversational summary.

---

### GUARDRAILS
- Do not hardcode external or dead worker URLs; all calls must resolve locally to `/api/mcp`.
- Never expose sensitive tokens or private keys in status or tools responses.
- Maintain existing responsive Tailwind CSS layout and color palette across all views.
- Keep the dev server running on port 3000.

---

### CONTEXT
Running in Google AI Studio preview via `tsx server.ts` on port 3000, and deployable to Vercel via the `api/` directory. MCP clients (Claude Code, MCP Inspector, Gemini SDK) connect directly to `https://{domain}/api/mcp` using Streamable HTTP or JSON-RPC 2.0.

---
---

# REFERENCE TEMPLATE: Original Master Prompt Pattern

For documentation and architectural provenance, the template pattern upon which the travel prompt was adapted:

```markdown
MASTER PROMPT · Food-safety app · replace the dead MCP server with a real one inside the app
Paste into the chat panel of the food-safety project in Google AI Studio (Build mode).

ROLE: You are a senior full-stack developer working in this existing Vite + React project, NutriSafe ToxiScan. It already has server.ts, which the AI Studio preview runs, and an api/ folder at the project root, which Vercel runs.

GOAL: Replace the offline remote MCP server with a real MCP server inside this app at /api/mcp that serves the bundled demo dataset, and make every screen get its data through that server and say plainly where the data comes from.

OUTPUT:
 1) Add @modelcontextprotocol/sdk at exactly version 1.30.1 and zod at ^4.6.5, and raise the esbuild devDependency to ^0.27.0, which Vite 8 needs. Do not use mcp-handler or @modelcontextprotocol/server: they are built for Web Request handlers, and this app needs one (req, res) handler that both Express and Vercel run. Keep bun.lock as the only lockfile; never add package-lock.json.
 2) Move api/mcp-engine.js and api/ingredients-data.js into api/_lib/ and update every import, including the ones in src/. Vercel turns every file in api/ into a public address unless its folder or file name starts with an underscore.
 3) In api/_lib/mcp-engine.js and api/_lib/ingredients-data.js, make the data say only what is true and make every lookup return null unless exactly one record fits...
 4) Create api/_lib/mcp-server.js exporting MCP_PATH ("/api/mcp"), SERVER_INFO ({ name: "nutrisafe-food-mcp", title: "NutriSafe Food Safety MCP (demo dataset)", version: "3.0.0" }), DATASET (the three record counts and the demo sentence below) and async function mcpHandler(req, res)...
 5) Register five tools with server.registerTool...
 6) Make api/mcp.js one line: export { mcpHandler as default } from './_lib/mcp-server.js'. In server.ts, add app.use('/api', express.json({ limit: '1mb' })), then app.all(['/api/mcp', '/api'], mcpHandler)...
 7) Rewrite src/services/mcpClient.ts as a real MCP client for /api/mcp...
 8) On every screen: delete each catch block that falls back to bundled data, and show the error or "no match" sentence instead...

GUARDRAILS: Read-only tools only: nothing that writes, sends, deletes or spends. No database and no login. Never create a variable whose name starts with VITE_. This server needs no API key; remove MCP_SERVER_KEY from the code and the docs. Keep the existing layout and styling, and keep every existing screen working.

CONTEXT: Deployed on Vercel from GitHub; Vercel installs packages with bun because bun.lock is in the repository, and would switch to npm if a package-lock.json appeared. The old server at https://food-mcp-server.rootsbybenda.workers.dev/mcp is offline (Cloudflare error 1042) and must not be called. MCP clients such as Claude Code, the MCP Inspector 2.8.0 and the Gemini SDK's mcpToTool will connect to https://{domain}/api/mcp over Streamable HTTP, protocol 2025-11-25.
```
