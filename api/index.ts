import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { MCP_TOOLS_REGISTRY, MCP_TOOLS_METADATA } from '../mcp/plantrip-server.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json());

// Chatbot AI Concierge endpoint: queries MCP tools and formats answers
apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      message = '',
      destination: fallbackDestination = 'Kyoto, Japan',
      durationDays = 4,
      budgetTier = 'moderate'
    } = req.body;

    if (!message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const lowerMsg = message.toLowerCase();

    // 1. Detect destination from query or fallback
    let targetDest = fallbackDestination;
    if (lowerMsg.includes('kyoto')) targetDest = 'Kyoto, Japan';
    else if (lowerMsg.includes('tokyo')) targetDest = 'Tokyo, Japan';
    else if (lowerMsg.includes('paris')) targetDest = 'Paris, France';
    else if (lowerMsg.includes('bali')) targetDest = 'Bali, Indonesia';
    else if (lowerMsg.includes('rome')) targetDest = 'Rome, Italy';
    else if (lowerMsg.includes('alps') || lowerMsg.includes('swiss') || lowerMsg.includes('switzerland')) targetDest = 'Swiss Alps, Switzerland';
    else if (lowerMsg.includes('amalfi')) targetDest = 'Amalfi Coast, Italy';
    else if (lowerMsg.includes('barcelona')) targetDest = 'Barcelona, Spain';

    // Extract days if specified (e.g., "5 days", "3-day")
    const daysMatch = message.match(/(\d+)\s*(?:days?|-day)/i);
    const parsedDays = daysMatch ? parseInt(daysMatch[1], 10) : durationDays;

    // 2. Resolve target MCP tool based on query intent
    let selectedTool = 'ask_travel_expert';
    let toolArgs: Record<string, any> = {};
    let suggestions: string[] = [];

    if (lowerMsg.includes('pack') || lowerMsg.includes('clothes') || lowerMsg.includes('clothing') || lowerMsg.includes('luggage') || lowerMsg.includes('suitcase') || lowerMsg.includes('bring')) {
      selectedTool = 'generate_packing_list';
      toolArgs = { destination: targetDest, duration_days: parsedDays };
      suggestions = [
        `What is the weather like in ${targetDest}?`,
        `Estimate trip cost for ${parsedDays} days in ${targetDest}`,
        `Recommend top guided tours in ${targetDest}`
      ];
    } else if (lowerMsg.includes('cost') || lowerMsg.includes('budget') || lowerMsg.includes('how much') || lowerMsg.includes('price') || lowerMsg.includes('expense') || lowerMsg.includes('afford')) {
      selectedTool = 'estimate_trip_cost';
      toolArgs = {
        destination: targetDest,
        duration_days: parsedDays,
        budget_tier: lowerMsg.includes('luxury') ? 'luxury' : lowerMsg.includes('budget') ? 'budget' : budgetTier
      };
      suggestions = [
        `What should I pack for ${targetDest}?`,
        `Show me a 4-day itinerary for ${targetDest}`,
        `Find authentic local tours in ${targetDest}`
      ];
    } else if (lowerMsg.includes('weather') || lowerMsg.includes('rain') || lowerMsg.includes('temp') || lowerMsg.includes('climate') || lowerMsg.includes('season') || lowerMsg.includes('forecast')) {
      selectedTool = 'get_weather_insights';
      let month = 'October';
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      for (const m of months) {
        if (lowerMsg.includes(m.toLowerCase())) {
          month = m;
          break;
        }
      }
      toolArgs = { destination: targetDest, month };
      suggestions = [
        `What should I pack for ${month} in ${targetDest}?`,
        `Plan a relaxing itinerary for ${targetDest}`,
        `Is ${month} a good time to visit?`
      ];
    } else if (lowerMsg.includes('tour') || lowerMsg.includes('guide') || lowerMsg.includes('excursion') || lowerMsg.includes('activities to book') || lowerMsg.includes('guided')) {
      selectedTool = 'search_guides';
      toolArgs = { destination: targetDest };
      suggestions = [
        `Estimate the budget for ${targetDest}`,
        `Generate packing list for ${targetDest}`,
        `Customs and etiquette for ${targetDest}`
      ];
    } else if (lowerMsg.includes('plan') || lowerMsg.includes('itinerary') || lowerMsg.includes('day trip') || lowerMsg.includes('schedule') || lowerMsg.includes('create trip')) {
      selectedTool = 'create_itinerary';
      toolArgs = {
        destination: targetDest,
        duration_days: parsedDays,
        budget: budgetTier,
        travel_style: lowerMsg.includes('food') ? 'foodie' : lowerMsg.includes('relax') ? 'relaxed' : 'cultural'
      };
      suggestions = [
        `What should I pack for this trip?`,
        `What is the total estimated budget?`,
        `Local tips & hidden spots in ${targetDest}`
      ];
    } else {
      selectedTool = 'ask_travel_expert';
      toolArgs = {
        destination: targetDest,
        question: message
      };
      suggestions = [
        `What pass or transit card do I need for ${targetDest}?`,
        `What are common tourist scams in ${targetDest}?`,
        `What is the dining etiquette in ${targetDest}?`
      ];
    }

    // 3. Execute MCP Tool
    const handler = MCP_TOOLS_REGISTRY[selectedTool];
    if (!handler) {
      throw new Error(`MCP tool ${selectedTool} not found`);
    }

    const toolResult = await handler(toolArgs);

    // 4. Generate AI response (using Gemini if key available, else curated concierge formatting)
    let aiReply = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = `You are PlanTrip AI Concierge, a calm, friendly, and knowledgeable travel assistant.
The traveler asked: "${message}"
Active destination: ${targetDest}
We executed the Model Context Protocol (MCP) tool: "${selectedTool}"
Tool arguments: ${JSON.stringify(toolArgs)}
Tool output: ${JSON.stringify(toolResult)}

Write a relaxing, warm, concise response (2-3 short paragraphs max).
- Welcome the traveler warmly and reference their destination.
- Summarize the most important findings from the MCP data (costs, weather highlights, packing advice, or itinerary highlights).
- Highlight 1-2 thoughtful local tips or mindful recommendations.
- Keep the tone serene, encouraging, and user-friendly.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        aiReply = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini chat generation fallback:', geminiErr?.message);
      }
    }

    // Fallback response formatting if Gemini didn't answer or key wasn't provided
    if (!aiReply) {
      if (selectedTool === 'generate_packing_list') {
        const totalItems = Object.values(toolResult.categories || {}).flat().length;
        aiReply = `I've prepared a comprehensive, weather-tailored packing checklist for ${targetDest} covering ${parsedDays} days. We've organized ${totalItems} recommended items across clothing, toiletries, tech, and travel documents to ensure you travel light and prepared.`;
      } else if (selectedTool === 'estimate_trip_cost') {
        const total = toolResult.totalCost ?? toolResult.totalEstimate ?? 1850;
        const daily = toolResult.costPerDayPerPerson ?? toolResult.estimatedDailyPerPerson ?? 180;
        aiReply = `Here is your detailed budget breakdown for ${parsedDays} days in ${targetDest} (${toolResult.travelStyle || 'moderate'} tier). The estimated total comes to ${toolResult.currencySymbol || '$'}${Number(total).toLocaleString()} ($${daily}/day per person), including accommodations, local transit, food, and sightseeing.`;
      } else if (selectedTool === 'get_weather_insights') {
        aiReply = `Here are the latest climate and weather insights for ${targetDest} in ${toolArgs.month || 'Autumn'}. Expect pleasant average highs around ${toolResult.averageHighC}°C (${toolResult.averageHighF}°F) with a ${toolResult.rainfallChance} chance of rain. ${toolResult.clothingRecommendation}`;
      } else if (selectedTool === 'create_itinerary') {
        aiReply = `I've crafted a curated ${parsedDays}-day itinerary for ${targetDest}. It balances iconic cultural landmarks with scenic nature walks and authentic culinary gems so you can explore at a peaceful, enriching pace.`;
      } else if (selectedTool === 'search_guides') {
        aiReply = `I found top-rated local guided experiences in ${targetDest}. These vetted local experts offer deep cultural insights, private access, and authentic insider perspectives.`;
      } else {
        const expertAnswer = toolResult?.answer || 'Here is the local travel advice for your query.';
        aiReply = `${expertAnswer}\n\nKey Takeaways:\n• ${toolResult?.keyTakeaways?.join('\n• ') || 'Plan ahead for peak attractions.'}`;
      }
    }

    return res.json({
      success: true,
      reply: aiReply,
      mcpToolUsed: selectedTool,
      mcpToolArgs: toolArgs,
      mcpData: toolResult,
      destination: targetDest,
      suggestions
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err?.message || 'Chatbot query failed'
    });
  }
});


// Status check (Never exposes any API key or secret token)
apiRouter.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    server: 'plantrip-mcp-server',
    version: '1.0.0',
    toolsCount: MCP_TOOLS_METADATA.length,
    hasPlantripKey: Boolean(process.env.PLANTRIP_API_KEY),
    protocol: 'model-context-protocol/1.0',
    uptime: process.uptime()
  });
});

// List all 14 MCP tools
apiRouter.get('/mcp/tools', (_req: Request, res: Response) => {
  res.json({
    tools: MCP_TOOLS_METADATA
  });
});

// Call any MCP tool by name
apiRouter.post('/mcp/call', async (req: Request, res: Response) => {
  try {
    const { tool, arguments: toolArgs = {} } = req.body;
    if (!tool || typeof tool !== 'string') {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const handler = MCP_TOOLS_REGISTRY[tool];
    if (!handler) {
      return res.status(404).json({ error: `Tool "${tool}" not found in MCP registry` });
    }

    const result = await handler(toolArgs);
    return res.json({
      success: true,
      tool,
      result
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Tool execution failed'
    });
  }
});

// Model Context Protocol JSON-RPC 2.0 handler (for MCP HTTP/SSE clients)
apiRouter.post('/mcp/rpc', async (req: Request, res: Response) => {
  const { jsonrpc = '2.0', id = 1, method, params = {} } = req.body;

  if (method === 'initialize') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'plantrip-mcp-server', version: '1.0.0' }
      }
    });
  }

  if (method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id,
      result: {
        tools: MCP_TOOLS_METADATA.map(t => ({
          name: t.name,
          description: t.description,
          inputSchema: { type: 'object', properties: {} }
        }))
      }
    });
  }

  if (method === 'tools/call') {
    const { name, arguments: toolArgs = {} } = params;
    const handler = MCP_TOOLS_REGISTRY[name];
    if (!handler) {
      return res.status(404).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Tool "${name}" not found` }
      });
    }

    try {
      const output = await handler(toolArgs);
      return res.json({
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }]
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err?.message || 'Internal tool error' }
      });
    }
  }

  return res.status(400).json({
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method "${method}" not implemented` }
  });
});

// Convenient direct endpoint: POST /api/tools/:name
apiRouter.post('/tools/:name', async (req: Request, res: Response) => {
  const toolName = req.params.name;
  const handler = MCP_TOOLS_REGISTRY[toolName];
  if (!handler) {
    return res.status(404).json({ error: `Tool "${toolName}" not found` });
  }

  try {
    const result = await handler(req.body);
    return res.json({ success: true, tool: toolName, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Failed' });
  }
});

// Fallback for unmatched /api routes
apiRouter.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    availableEndpoints: ['/api/status', '/api/mcp/tools', '/api/mcp/call', '/api/mcp/rpc', '/api/chat', '/api/tools/:name']
  });
});

// Export default handler for Vercel Serverless Function entry (/api)
const app = express();
app.use(express.json());

// Handle both with /api prefix and without /api prefix for Vercel proxy compatibility
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback for unmatched API routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `API route not found: ${req.method} ${req.url}`,
    availableEndpoints: ['/api/status', '/api/mcp/tools', '/api/mcp/call', '/api/mcp/rpc', '/api/tools/:name']
  });
});

export default function handler(req: any, res: any) {
  return app(req, res);
}

