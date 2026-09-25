import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Lightbulb,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { ExpertAnswer } from '../types/travel.ts';
import { McpClientService } from '../services/mcpClient.ts';

interface TravelExpertViewProps {
  currentDestination?: string;
}

const PRESET_QUESTIONS = [
  'Is tipping customary in local restaurants and taxis?',
  'What rechargeable transit pass or train card should I buy?',
  'Which neighborhood is best to stay for first-time visitors?',
  'What are the most common tourist traps or scams to avoid?',
  'What dining or shrine etiquette rules should I follow?'
];

export const TravelExpertView: React.FC<TravelExpertViewProps> = ({
  currentDestination = 'Kyoto, Japan'
}) => {
  const [destination, setDestination] = useState<string>(currentDestination);
  const [question, setQuestion] = useState<string>('Is tipping customary in local restaurants and taxis?');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answerData, setAnswerData] = useState<ExpertAnswer | null>({
    question: 'Is tipping customary in local restaurants and taxis?',
    destination: 'Kyoto, Japan',
    answer: 'In Kyoto and across Japan, tipping is not customary and in fact can lead to polite confusion or discomfort, as world-class hospitality (Omotenashi) is considered an inherent standard of professional service. High-end dining establishments may include an automatic 10%-15% service charge directly on your bill.',
    keyTakeaways: [
      'Never leave loose cash on restaurant tables or bar counters',
      'Check the bill breakdown for pre-included service charges',
      'Expressing gratitude with "Gochisosama deshita" (thank you for the meal) is warmly welcomed'
    ],
    localInsiderTips: [
      'At traditional counters, place cash on the provided small tray rather than handing it directly to the cashier',
      'Taxi doors open and close automatically via driver levers—do not pull them manually'
    ],
    warningsOrScamsToAvoid: [
      'Be cautious of touts in nightlife alleys inviting tourists into bars with hidden seating fees'
    ],
    suggestedFollowUpQuestions: [
      'What rechargeable transit pass should I buy upon arrival?',
      'Which neighborhood is best for a first-time visitor?'
    ]
  });

  const handleAsk = async (qToAsk?: string) => {
    const q = qToAsk || question;
    if (!q.trim()) return;

    try {
      setIsLoading(true);
      const res = await McpClientService.askTravelExpert({
        question: q,
        destination
      });
      setAnswerData(res);
      setQuestion(q);
    } catch (err: any) {
      alert(`Expert query failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Controller */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>MCP Tool: ask_travel_expert</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif">
            Local Travel Concierge & Q&A
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time advisory on customs, transit passes, scams, and neighborhood advice
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Destination"
          />
        </div>
      </div>

      {/* Query Bar */}
      <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
        <label className="block text-xs font-semibold text-slate-300">
          Ask any specific question about traveling in {destination}:
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="e.g. Can I use credit cards everywhere? How does the metro work?"
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleAsk()}
            disabled={isLoading || !question.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4 text-slate-950" />
            )}
            <span>Consult Expert</span>
          </button>
        </div>

        {/* Quick Question Shortcuts */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Frequently Asked Topics:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_QUESTIONS.map((pq) => (
              <button
                key={pq}
                onClick={() => handleAsk(pq)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer text-left"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Answer Display */}
      {answerData && (
        <div className="space-y-5">
          {/* Main Answer Block */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Expert Verdict for {answerData.destination}</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">
              {answerData.question}
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              {answerData.answer}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Takeaways */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Key Practical Takeaways</span>
              </div>
              <ul className="space-y-2">
                {answerData.keyTakeaways.map((item, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Insider Tips */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Local Insider Tips</span>
              </div>
              <ul className="space-y-2">
                {answerData.localInsiderTips.map((tip, i) => (
                  <li key={i} className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Scams & Warnings */}
          {answerData.warningsOrScamsToAvoid && answerData.warningsOrScamsToAvoid.length > 0 && (
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-950 dark:text-rose-300 uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Tourist Pitfalls & Scams to Watch Out For</span>
              </div>
              <ul className="space-y-1.5">
                {answerData.warningsOrScamsToAvoid.map((warn, i) => (
                  <li key={i} className="text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 mt-1.5 shrink-0" />
                    <span>{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Follow-Ups */}
          {answerData.suggestedFollowUpQuestions && answerData.suggestedFollowUpQuestions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5">
                Suggested Follow-Up Inquiries:
              </span>
              <div className="flex flex-wrap gap-2">
                {answerData.suggestedFollowUpQuestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleAsk(sug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition cursor-pointer"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
