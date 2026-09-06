import React, { useState, useEffect } from 'react';
import { InsightsOverview } from '../types.js';
import { api } from '../api.js';
import {
  Sparkles,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Tag,
  HelpCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  BrainCircuit,
  MessageCircleQuestion,
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const [insights, setInsights] = useState<InsightsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.getInsightsOverview();
      setInsights(res.insights);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActionItem = (text: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [text]: !prev[text],
    }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <span className="text-xs font-mono">Synthesizing Reflection Intelligence...</span>
        </div>
      </div>
    );
  }

  const overview = insights?.latestIntelligence;

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <span>Journal Intelligence & Reflections</span>
            <span className="text-[10px] text-purple-400 font-mono font-semibold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              SYNTHESIS ENGINE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Synthesized themes, key thought patterns, and action items extracted from your private journal conversations.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-white/[0.07] bg-[#0d1117] hover:bg-[#161b22] transition-colors"
          title="Refresh intelligence"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Card: Reflection Question */}
      {overview?.reflectionQuestion && (
        <div className="bg-gradient-to-r from-purple-950/30 via-[#0d1117] to-indigo-950/30 border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">
                Core Reflection Question
              </span>
              <p className="text-base sm:text-lg text-white font-serif italic leading-relaxed">
                &ldquo;{overview.reflectionQuestion}&rdquo;
              </p>
              <p className="text-[11px] text-slate-400 pt-1">
                Prompted from your latest reflections to spur clarity and thoughtful direction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2-Column Bento: Executive Summary & Mindset Interpretation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive Summary (2 cols) */}
        <div className="lg:col-span-2 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Latest Synthesis Overview</span>
            </h3>
            {overview?.generatedAt && (
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(overview.generatedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-serif">
            {overview?.summary || 'No conversations logged yet. Write in your journal to generate reflections.'}
          </p>

          {/* Key Thoughts List */}
          {overview?.keyThoughts && overview.keyThoughts.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.05]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                Key Thoughts & Deductions
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {overview.keyThoughts.map((thought, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                    <span>{thought}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mindset & AI Interpretation Notice (1 col) */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
              Focus & Mindset Signal
            </h3>

            <div className="p-3.5 bg-[#05080f] rounded-xl border border-white/[0.07] text-xs text-purple-300/90 leading-relaxed italic font-serif">
              {overview?.moodInterpretation || 'Analytical and focused on system craftsmanship.'}
            </div>

            <div className="p-3.5 bg-amber-500/[0.04] border border-amber-500/20 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Non-Diagnostic Notice
              </span>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                AegisAI strictly labels emotional or focus trends as assistive AI interpretations. It does not provide medical, clinical, or psychological diagnoses.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.05] flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Isolated Pre-Screened AI Processing</span>
          </div>
        </div>
      </div>

      {/* Action Items & Recurring Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Items */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-emerald-400" />
            <span>Extracted Action Items</span>
          </h3>

          {insights?.actionItems && insights.actionItems.length > 0 ? (
            <div className="space-y-2">
              {insights.actionItems.map((item, idx) => {
                const isDone = completedActions[item];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleActionItem(item)}
                    className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      isDone
                        ? 'bg-[#05080f] border-white/[0.03] text-slate-500 line-through'
                        : 'bg-[#05080f] border-white/[0.07] text-slate-200 hover:border-white/[0.15]'
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isDone ? 'text-emerald-500' : 'text-slate-600'
                      }`}
                    />
                    <span className="text-xs font-medium">{item}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No action items currently pending.</p>
          )}
        </div>

        {/* Recurring Themes */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" />
            <span>Recurring Topics & Themes</span>
          </h3>

          {insights?.themes && insights.themes.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {insights.themes.map((theme, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium font-mono flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Themes will populate as you journal.</p>
          )}
        </div>
      </div>
    </div>
  );
};

