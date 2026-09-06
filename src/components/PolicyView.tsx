import React, { useState } from 'react';
import { PolicyRule } from '../types.js';
import {
  Scale,
  ShieldCheck,
  Cpu,
  Boxes,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Sparkles,
  Zap,
  ArrowRight,
  Key,
} from 'lucide-react';

interface PolicyViewProps {
  onNavigateToTab?: (tab: any) => void;
}

export const PolicyView: React.FC<PolicyViewProps> = ({ onNavigateToTab }) => {
  const [policies, setPolicies] = useState<PolicyRule[]>([
    {
      id: 'pol_privacy_firewall',
      name: 'Zero-Trust Privacy Firewall Enforcement',
      category: 'privacy',
      description: 'Pre-screen all outbound prompts for PII, API keys, and bearer tokens. Mandate Redact/Block approval prior to AI transmission.',
      enabled: true,
      priority: 1,
    },
    {
      id: 'pol_memory_consent',
      name: 'Explicit Memory Consent & Purpose Binding',
      category: 'memory',
      description: 'Candidate memories are strictly candidate-isolated until explicitly approved with an assigned operational purpose.',
      enabled: true,
      priority: 1,
    },
    {
      id: 'pol_expert_routing',
      name: 'Least-Privilege Intelligent Expert Router',
      category: 'expert',
      description: 'Automatically route requests across specialized Experts (Gemini Reasoning, Claude Security, Local Execution) based on prompt sensitivity.',
      enabled: true,
      priority: 2,
    },
    {
      id: 'pol_multi_expert_synthesis',
      name: 'Multi-Expert Consensus & Explainability',
      category: 'expert',
      description: 'Synthesize multi-model perspectives for complex technical prompts while attaching explicit "Why this model?" and "Why this memory?" reasoning.',
      enabled: true,
      priority: 2,
    },
    {
      id: 'pol_instant_revocation',
      name: 'Real-Time Memory Revocation ("Forget")',
      category: 'retention',
      description: 'Purge revoked memories instantly from all model context assembly routines and retrieve zero revoked records.',
      enabled: true,
      priority: 1,
    },
    {
      id: 'pol_audit_ledger',
      name: 'SHA-256 Cryptographic Hash-Chained Audit',
      category: 'privacy',
      description: 'Append SHA-256 linked entries for every security event, memory approval, and policy change to prevent tamper attempts.',
      enabled: true,
      priority: 1,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'constitution' | 'experts' | 'audit'>('constitution');

  const togglePolicy = (id: string) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#080a0f] overflow-y-auto">
      {/* Policy Engine Header */}
      <header className="px-6 py-6 border-b border-white/[0.08] bg-[#090d16]/80 backdrop-blur-xl shrink-0 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Policy Engine & AI Constitution</h1>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono text-teal-300 uppercase">
                  Active Governance
                </span>
              </div>
              <p className="text-xs text-slate-400">
                User-defined rules governing memory access, model routing, expert delegation, and privacy limits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab?.('journal')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Launch AI Workspace</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6 w-full">
        {/* Policy Flow Diagram Card */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-teal-400">
              <Cpu className="w-4 h-4" />
              <span>AegisAI Execution Pipeline</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              6 Core Policies Enforced
            </span>
          </div>

          {/* Flow Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-teal-400 uppercase font-semibold">1. Privacy Firewall</div>
              <div className="text-xs font-bold text-slate-200">Pre-Scan & Redaction</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Pushes zero raw secrets to external models.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-amber-400 uppercase font-semibold">2. Memory Governance</div>
              <div className="text-xs font-bold text-slate-200">Purpose & Expiration</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Injects approved active memories only.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-sky-400 uppercase font-semibold">3. Policy Engine</div>
              <div className="text-xs font-bold text-slate-200">AI Constitution Check</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Verifies permission & privacy boundaries.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-indigo-400 uppercase font-semibold">4. Expert Router</div>
              <div className="text-xs font-bold text-slate-200">Gemini / Claude / Local</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">Selects expert model for execution.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1">
              <div className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">5. Synthesis & Audit</div>
              <div className="text-xs font-bold text-slate-200">Explainability + Ledger</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">SHA-256 chain log & attribution pill.</p>
            </div>
          </div>
        </div>

        {/* AI Constitution Rules List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Active Governance Rules ({policies.filter((p) => p.enabled).length}/{policies.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className={`p-5 rounded-2xl border transition-all ${
                  policy.enabled
                    ? 'bg-[#0d121f] border-teal-500/25 shadow-lg shadow-teal-500/5'
                    : 'bg-[#0a0d16] border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          policy.enabled ? 'bg-teal-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      <h3 className="text-sm font-bold text-white">{policy.name}</h3>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{policy.description}</p>
                  </div>

                  <button
                    onClick={() => togglePolicy(policy.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold cursor-pointer transition-all shrink-0 ${
                      policy.enabled
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : 'bg-white/[0.05] text-slate-400 border border-white/[0.08]'
                    }`}
                  >
                    {policy.enabled ? 'Enforced' : 'Disabled'}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="capitalize">Category: {policy.category}</span>
                  <span className="text-teal-400">Priority {policy.priority} Enforcement</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert & Router Capability Matrix */}
        <div className="p-6 rounded-2xl bg-[#0d121f] border border-white/[0.08] space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Configured AI Experts & Models</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300 font-mono">Gemini Expert</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">Active</span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">Reasoning & General Intelligence</div>
              <p className="text-[11px] text-slate-400">Handles deep multi-turn chat, synthesis, and creative reflections.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 font-mono">Claude Expert</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-300 border border-sky-500/20">Standby</span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">Security & Structural Analysis</div>
              <p className="text-[11px] text-slate-400">Specialized in code audits, policy evaluation, and vulnerability checks.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono">Local / Fast Expert</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20">Ready</span>
              </div>
              <div className="text-xs text-slate-300 font-semibold">Isolated Rapid Execution</div>
              <p className="text-[11px] text-slate-400">High-speed execution for offline processing and sensitive tokens.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
