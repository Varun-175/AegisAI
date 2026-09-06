import React from 'react';
import { GovernanceStats, Memory, MemoryDuration, NavTab } from '../types.js';
import {
  Shield,
  CheckCircle,
  Boxes,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Clock,
  MessageSquare,
  FlaskConical,
  Activity,
  Plus,
  BookOpen,
  ChevronRight,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { AegisAILogo } from './AegisAILogo.js';

interface DashboardViewProps {
  stats: GovernanceStats | null;
  candidates: Memory[];
  onApproveCandidate: (id: string, updates?: { purpose?: string; expirationPolicy?: MemoryDuration }) => void;
  onIgnoreCandidate: (id: string) => void;
  onNavigate: (tab: NavTab) => void;
  onNewJournalEntry: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  candidates,
  onApproveCandidate,
  onIgnoreCandidate,
  onNavigate,
  onNewJournalEntry,
}) => {
  const activeCount = stats?.activeMemoriesCount ?? 0;
  const pendingCount = candidates.length;
  const revokedCount = stats?.revokedMemoriesCount ?? 0;
  const expiredCount = stats?.expiredMemoriesCount ?? 0;
  const totalTracked = activeCount + pendingCount + revokedCount + expiredCount;

  // Donut chart calculations
  const totalForChart = totalTracked > 0 ? totalTracked : 1;
  const activePercent = totalTracked > 0 ? Math.round((activeCount / totalForChart) * 100) : 0;
  const pendingPercent = totalTracked > 0 ? Math.round((pendingCount / totalForChart) * 100) : 0;
  const expiredPercent = totalTracked > 0 ? Math.round((expiredCount / totalForChart) * 100) : 0;
  const revokedPercent = totalTracked > 0 ? Math.round((revokedCount / totalForChart) * 100) : 0;

  // Circumference for SVG circle with r=38 -> 2 * PI * 38 ≈ 238.76
  const circumference = 238.76;
  const activeStroke = (activeCount / totalForChart) * circumference;
  const pendingStroke = (pendingCount / totalForChart) * circumference;
  const expiredStroke = (expiredCount / totalForChart) * circumference;
  const revokedStroke = (revokedCount / totalForChart) * circumference;

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 relative bg-[#080a0f]">
      {/* 1. Hero Region */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0d131f] via-[#0b101b] to-[#121927] border border-white/[0.08] p-6 lg:p-8 overflow-hidden shadow-2xl">
        {/* Subtle Ambient Glows */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            {/* Active Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>TRUST BOUNDARY ACTIVE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Your AI, your boundaries.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              A safer, more intentional way to work with Gemini. Every memory requires explicit authorization, purpose governance, and immediate revocation control.
            </p>
          </div>

          {/* Right Hero Quote Card with AegisAI Seal */}
          <div className="hidden lg:flex items-center gap-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 max-w-sm backdrop-blur-md">
            <AegisAILogo size="md" variant="icon-only" glow={true} />
            <div className="space-y-1">
              <p className="text-xs text-slate-300 italic font-serif leading-relaxed">
                &ldquo;Technology should amplify your judgment, not replace it.&rdquo;
              </p>
              <p className="text-[10px] text-teal-400 font-mono font-semibold">
                — AegisAI Core Constitution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Memories */}
        <div
          onClick={() => onNavigate('vault')}
          className="bg-[#0d1117]/80 hover:bg-[#111722] border border-white/[0.08] hover:border-teal-500/40 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Memories</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white font-mono tracking-tight group-hover:text-teal-300 transition-colors">
              {activeCount}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">In Gemini&apos;s context</p>
          </div>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => onNavigate('vault')}
          className="bg-[#0d1117]/80 hover:bg-[#111722] border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pending Review</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-400 font-mono tracking-tight">
              {pendingCount}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Requires your decision</p>
          </div>
        </div>

        {/* Privacy Interceptions */}
        <div
          onClick={() => onNavigate('privacy')}
          className="bg-[#0d1117]/80 hover:bg-[#111722] border border-white/[0.08] hover:border-rose-500/40 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Privacy Interceptions</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-400 font-mono tracking-tight">
              {stats?.totalPrivacyInterceptions ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Blocked before reaching Gemini</p>
          </div>
        </div>

        {/* Total Conversations */}
        <div
          onClick={() => onNavigate('conversations')}
          className="bg-[#0d1117]/80 hover:bg-[#111722] border border-white/[0.08] hover:border-sky-500/40 rounded-2xl p-5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Conversations</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-sky-300 font-mono tracking-tight">
              {stats?.totalConversations ?? 0}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">With transparency trail</p>
          </div>
        </div>
      </div>

      {/* 3. Top Row Bento: Pending Decisions (2/3) + Memory Lifecycle Donut (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Decisions (8 cols) */}
        <div className="lg:col-span-8 bg-[#0d1117]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-white tracking-tight">
                  Pending Memory Decisions
                </h2>
                {candidates.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                    {candidates.length} new
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Gemini detected potential facts. You decide what is retained.
              </p>
            </div>

            <button
              onClick={() => onNavigate('vault')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {candidates.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">All Proposed Facts Reviewed</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  No candidate memories are currently awaiting approval. Write in your journal or chat to propose new governed directives.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {candidates.slice(0, 3).map((cand) => (
                <div
                  key={cand.id}
                  id={`candidate-row-${cand.id}`}
                  className="bg-[#111724]/90 border border-white/[0.08] hover:border-white/20 rounded-xl p-4 space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-serif italic leading-relaxed">
                        &ldquo;{cand.content}&rdquo;
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                          {cand.purpose}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/[0.05] text-slate-400 border border-white/[0.08] font-mono">
                          {cand.expirationPolicy.replace('_', ' ')}
                        </span>
                        <span className="text-slate-500">
                          {new Date(cand.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onIgnoreCandidate(cand.id)}
                        id={`btn-dash-reject-${cand.id}`}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#090d16] hover:bg-slate-800 border border-white/[0.08] rounded-xl transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onApproveCandidate(cand.id)}
                        id={`btn-dash-approve-${cand.id}`}
                        className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memory Lifecycle Donut (4 cols) */}
        <div className="lg:col-span-4 bg-[#0d1117]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div className="border-b border-white/[0.07] pb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">Memory Lifecycle</h2>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across governance states</p>
          </div>

          <div className="flex flex-col items-center justify-center py-2 relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#161f30"
                  strokeWidth="8"
                />

                {/* Active Segment (Teal) */}
                {activeCount > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#2dd4bf"
                    strokeWidth="8"
                    strokeDasharray={`${activeStroke} ${circumference}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                  />
                )}

                {/* Pending Segment (Amber) */}
                {pendingCount > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#facc15"
                    strokeWidth="8"
                    strokeDasharray={`${pendingStroke} ${circumference}`}
                    strokeDashoffset={`-${activeStroke}`}
                    strokeLinecap="round"
                  />
                )}

                {/* Revoked Segment (Rose) */}
                {revokedCount > 0 && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="8"
                    strokeDasharray={`${revokedStroke} ${circumference}`}
                    strokeDashoffset={`-${activeStroke + pendingStroke}`}
                    strokeLinecap="round"
                  />
                )}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-2xl font-extrabold text-white font-mono leading-none">
                  {totalTracked}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider mt-1">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-white/[0.07]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span className="text-slate-300">Active ({activeCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300">Pending ({pendingCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span className="text-slate-300">Expired ({expiredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300">Revoked ({revokedCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row Bento: 3 Equal Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Recent Activity */}
        <div className="bg-[#0d1117]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Activity</h2>
            <button
              onClick={() => onNavigate('security')}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View Audit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-slate-200 font-medium">Memory Governance boundary online</p>
                <p className="text-[10px] text-slate-400 font-mono">System initialized</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-slate-200 font-medium">Privacy Guardian active & ready</p>
                <p className="text-[10px] text-slate-400 font-mono">Real-time scan enabled</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-slate-200 font-medium">Cryptographic audit log verified</p>
                <p className="text-[10px] text-slate-400 font-mono">SHA-256 hash intact</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.07]">
            <button
              onClick={() => onNavigate('security')}
              className="w-full py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-teal-400" />
              <span>Full Audit Trail</span>
            </button>
          </div>
        </div>

        {/* Column 2: Privacy Guardian Status */}
        <div className="bg-[#0d1117]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">Privacy Guardian</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              Active
            </span>
          </div>

          <div className="py-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-200">No Recent Critical Leaks</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your inputs are inspected locally before reaching the model. Credentials and PII are stopped at the boundary.
            </p>
          </div>

          <div className="pt-2 border-t border-white/[0.07]">
            <button
              onClick={() => onNavigate('testbench')}
              className="w-full py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Run Privacy Testbench</span>
            </button>
          </div>
        </div>

        {/* Column 3: Quick Actions */}
        <div className="bg-[#0d1117]/80 border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="border-b border-white/[0.07] pb-3">
            <h2 className="text-sm font-bold text-white tracking-tight">Quick Actions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Frequent privacy & writing workflows</p>
          </div>

          <div className="space-y-2">
            <button
              onClick={onNewJournalEntry}
              className="w-full p-3 rounded-xl bg-[#111724]/90 hover:bg-[#161f30] border border-white/[0.08] hover:border-teal-500/30 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                    New Journal Entry
                  </span>
                  <span className="text-[10px] text-slate-400">Start a private reflection</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </button>

            <button
              onClick={() => onNavigate('testbench')}
              className="w-full p-3 rounded-xl bg-[#111724]/90 hover:bg-[#161f30] border border-white/[0.08] hover:border-teal-500/30 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <FlaskConical className="w-4 h-4 text-sky-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                    Test Privacy Input
                  </span>
                  <span className="text-[10px] text-slate-400">Check what would be blocked</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </button>

            <button
              onClick={() => onNavigate('vault')}
              className="w-full p-3 rounded-xl bg-[#111724]/90 hover:bg-[#161f30] border border-white/[0.08] hover:border-teal-500/30 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Boxes className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white block">
                    Open Memory Vault
                  </span>
                  <span className="text-[10px] text-slate-400">Review and manage memories</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 text-center pt-1 font-mono">
            Zero-knowledge model isolation enabled
          </div>
        </div>
      </div>
    </div>
  );
};

