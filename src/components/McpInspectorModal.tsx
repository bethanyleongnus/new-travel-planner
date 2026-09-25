import React, { useState, useEffect } from 'react';
import {
  Terminal,
  X,
  Play,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Code,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { McpToolMeta, ServerStatus } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface McpInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverStatus: ServerStatus | null;
}

const DEFAULT_TOOL_ARGS: Record<string, any> = {
  create_itinerary: { destination: 'Kyoto, Japan', duration_days: 4, budget: 'moderate', travel_style: 'cultural', travelers: 2 },
  get_itinerary_status: { itinerary_id: 'trip_kyoto_demo_01' },
  get_itinerary: { itinerary_id: 'trip_kyoto_demo_01' },
  modify_itinerary: { itinerary_id: 'trip_kyoto_demo_01', modification_request: 'Add a ramen tasting on Day 2 evening' },
  list_user_trips: {},
  save_itinerary: { itinerary: { id: 'trip_kyoto_demo_01', title: 'Kyoto Journey', destination: 'Kyoto, Japan' } },
  delete_trip: { trip_id: 'sample_to_delete' },
  generate_packing_list: { destination: 'Kyoto, Japan', duration_days: 4, season_or_month: 'Autumn' },
  ask_travel_expert: { question: 'Is tipping customary here?', destination: 'Kyoto, Japan' },
  get_weather_insights: { destination: 'Kyoto, Japan', month: 'October' },
  estimate_trip_cost: { destination: 'Kyoto, Japan', duration_days: 4, travel_style: 'moderate', travelers: 2 },
  search_guides: { destination: 'Kyoto, Japan', query: 'food' },
  get_tour_availability: { destination: 'Kyoto, Japan', date: '2026-10-15' },
  submit_tour_inquiry: { tour_id: 'tour-1', destination: 'Kyoto, Japan', traveler_name: 'Alex Morgan', email: 'alex@example.com', preferred_date: '2026-10-16', travelers_count: 2 }
};

export const McpInspectorModal: React.FC<McpInspectorModalProps> = ({
  isOpen,
  onClose,
  serverStatus
}) => {
  const [tools, setTools] = useState<McpToolMeta[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('create_itinerary');
  const [argsJson, setArgsJson] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputJson, setOutputJson] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      McpClientService.getTools().then((list) => {
        setTools(list);
        if (list.length > 0 && !selectedTool) {
          setSelectedTool(list[0].name);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTool && DEFAULT_TOOL_ARGS[selectedTool]) {
      setArgsJson(JSON.stringify(DEFAULT_TOOL_ARGS[selectedTool], null, 2));
    } else {
      setArgsJson('{}');
    }
    setOutputJson(null);
    setErrorMsg(null);
  }, [selectedTool]);

  if (!isOpen) return null;

  const handleRunTool = async () => {
    try {
      setIsRunning(true);
      setErrorMsg(null);
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(argsJson);
      } catch {
        throw new Error('Arguments must be valid JSON');
      }

      const res = await McpClientService.callTool(selectedTool, parsedArgs);
      setOutputJson(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
      setOutputJson(null);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyOutput = () => {
    if (!outputJson) return;
    navigator.clipboard.writeText(outputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Model Context Protocol (MCP) Inspector</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                  plantrip-mcp-server v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Direct JSON-RPC interface to test all 14 travel planning tools
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-400 font-mono text-[11px]">14 Tools Registered</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body content: Two column layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left tools list */}
          <div className="w-full md:w-72 border-r border-slate-800 overflow-y-auto p-3 space-y-1 bg-slate-950/60 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 block">
              Registered MCP Tools (14)
            </span>
            {tools.map((t) => {
              const isSelected = selectedTool === t.name;
              return (
                <button
                  key={t.name}
                  onClick={() => setSelectedTool(t.name)}
                  className={`w-full p-2.5 rounded-xl text-left transition cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <span className="font-mono text-xs font-bold truncate">{t.name}</span>
                  <span className={`text-[10px] line-clamp-1 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {t.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right tool execution panel */}
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono text-sm font-bold text-emerald-400">
                  tool: {selectedTool}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tools.find((t) => t.name === selectedTool)?.description}
                </p>
              </div>

              <button
                onClick={handleRunTool}
                disabled={isRunning}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-500/20"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Tool Call</span>
                  </>
                )}
              </button>
            </div>

            {/* Arguments Editor */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-400 flex items-center justify-between">
                <span>Input Arguments (JSON):</span>
                <span className="text-[10px] text-slate-500">Edit payload before running</span>
              </label>
              <textarea
                rows={5}
                value={argsJson}
                onChange={(e) => setArgsJson(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-slate-700 rounded-xl text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-mono">
                Error: {errorMsg}
              </div>
            )}

            {/* Result output */}
            <div className="flex-1 flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Execution Response (JSON-RPC Output):</span>
                {outputJson && (
                  <button
                    onClick={handleCopyOutput}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Response'}</span>
                  </button>
                )}
              </div>
              <div className="flex-1 min-h-[160px] p-3 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-300 overflow-auto">
                {outputJson ? (
                  <pre className="text-emerald-400/90 whitespace-pre-wrap">{outputJson}</pre>
                ) : (
                  <span className="text-slate-600 italic">
                    Click &quot;Run Tool Call&quot; to execute this MCP tool and inspect live JSON-RPC data...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
