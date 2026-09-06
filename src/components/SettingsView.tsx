import React, { useState, useEffect } from 'react';
import { UserPreferences, MemoryDuration } from '../types.js';
import { api } from '../api.js';
import {
  Sliders,
  Shield,
  Clock,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Save,
  RefreshCw,
  Database,
  Key,
  Server,
  Cloud,
  Cpu,
  FileJson,
  CheckCircle2,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SettingsViewProps {
  onPurgeSuccess: () => void;
}

type SettingsTab = 'governance' | 'privacy' | 'infrastructure' | 'portability';

export const SettingsView: React.FC<SettingsViewProps> = ({ onPurgeSuccess }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('governance');
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [purgeInput, setPurgeInput] = useState('');
  const [purging, setPurging] = useState(false);

  // BYOK Provider Testing State
  const [testProvider, setTestProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [testApiKey, setTestApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testConnectionResult, setTestConnectionResult] = useState<any | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const res = await api.getUserPreferences();
      setPreferences(res.preferences);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;
    setSaving(true);
    try {
      const res = await api.updateUserPreferences(preferences);
      setPreferences(res.preferences);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to update preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExecutePurge = async () => {
    if (purgeInput !== 'DELETE') return;
    setPurging(true);
    try {
      await api.purgeAllData();
      setShowPurgeConfirm(false);
      setPurgeInput('');
      onPurgeSuccess();
    } catch (err) {
      console.error('Purge error:', err);
    } finally {
      setPurging(false);
    }
  };

  if (!preferences) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center p-8 text-slate-400 bg-[#080a0f]">
        <RefreshCw className="w-6 h-6 animate-spin mb-3 text-teal-400" />
        <span className="text-xs font-mono tracking-wider text-slate-300">Loading Google Cloud Governance Policies...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full overflow-y-auto bg-[#080a0f] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Google Cloud Breadcrumb & Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="text-slate-400 hover:text-slate-200 transition-colors">AegisAI</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-400 hover:text-slate-200 transition-colors">Organization Policies</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-teal-300 font-semibold">Governance & Security</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-sm">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
                Policy & Governance Settings
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-teal-300 font-mono font-semibold bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                GCP ENFORCED
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Configure memory retention boundaries, real-time Privacy Guardian inspection, and Google Cloud infrastructure policies.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            id="btn-settings-save-top"
            className="self-start sm:self-auto bg-gradient-to-r from-teal-400 to-teal-300 hover:from-teal-300 hover:to-teal-200 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 shrink-0"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-950" />
            )}
            <span>{saveSuccess ? 'Policies Saved' : 'Save Changes'}</span>
          </button>
        </div>

        {/* Tab Navigation (Google Cloud Console Style) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.08] scrollbar-none">
          <button
            onClick={() => setActiveTab('governance')}
            id="tab-settings-governance"
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'governance'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Memory Retention & Lifecycle</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            id="tab-settings-privacy"
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Guardian & DLP Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            id="tab-settings-infrastructure"
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'infrastructure'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Google Cloud Infrastructure</span>
          </button>

          <button
            onClick={() => setActiveTab('portability')}
            id="tab-settings-portability"
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'portability'
                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Portability & Erasure</span>
          </button>
        </div>

        {/* TAB 1: Memory Governance */}
        {activeTab === 'governance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0d121c] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Default Retention & Candidate Engine</h3>
                    <p className="text-[11px] text-slate-400">Specify lifecycle bounds for facts proposed during journal conversations.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Active Enforcer
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Default Suggested Retention</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <select
                    value={preferences.defaultRetentionPolicy}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultRetentionPolicy: e.target.value as MemoryDuration,
                      })
                    }
                    className="w-full bg-[#080b11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-400 font-medium cursor-pointer"
                  >
                    <option value="1_day">1 Day (Ephemeral Session)</option>
                    <option value="7_days">7 Days (Weekly Sprint)</option>
                    <option value="30_days">30 Days (Standard Month)</option>
                    <option value="project">Project Scope (Scoped to Active Project)</option>
                    <option value="forever">Indefinite (Manual Revocation Only)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Default lifetime suggested when Gemini extracts a new fact candidate from your journal entries.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <span>Candidate Extraction Sensitivity</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <select
                    value={preferences.candidateSensitivity}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        candidateSensitivity: e.target.value as 'conservative' | 'balanced' | 'aggressive',
                      })
                    }
                    className="w-full bg-[#080b11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-teal-400 font-medium cursor-pointer"
                  >
                    <option value="conservative">Conservative (High confidence explicit preferences only)</option>
                    <option value="balanced">Balanced (Preferences, goals, and workflows)</option>
                    <option value="aggressive">Aggressive (Broad contextual observations)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Governs model heuristics when identifying memorable statements during multi-turn conversations.
                  </span>
                </div>
              </div>

              {/* Zero-Trust Architecture Guarantee Card */}
              <div className="bg-[#080b11] border border-emerald-500/25 rounded-xl p-4.5 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0 mt-0.5">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">Guaranteed Memory Expiration at Retrieval</span>
                    <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold">
                      SERVER-ENFORCED
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Expired and revoked memories are filtered out on the backend before the Gemini prompt is constructed. Correctness does not depend on background workers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Privacy Guardian */}
        {activeTab === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0d121c] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Pre-Transmission Interception Engine</h3>
                    <p className="text-[11px] text-slate-400">Configure real-time inspection for PII, API tokens, and secret identifiers.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                  Pre-Scan Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Default Interception Workflow
                  </label>
                  <select
                    value={preferences.defaultPrivacyAction === 'blocked' ? 'blocked' : 'inspect'}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        defaultPrivacyAction: e.target.value as 'blocked' | 'inspect',
                      })
                    }
                    className="w-full bg-[#080b11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 font-medium cursor-pointer"
                  >
                    <option value="inspect">Prompt User for Consent (Inspect, Redact, or Allow)</option>
                    <option value="blocked">Strict Blocking (Refuse transmission if findings detected)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Prompts with detected findings are never silently modified or sent to Gemini without your explicit choice.
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Audit Logging Detail Level
                  </label>
                  <select
                    value={preferences.auditDetailLevel}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        auditDetailLevel: e.target.value as 'minimal' | 'standard' | 'verbose',
                      })
                    }
                    className="w-full bg-[#080b11] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-400 font-medium cursor-pointer"
                  >
                    <option value="standard">Standard (Category, timestamp, SHA-256 hash)</option>
                    <option value="verbose">Verbose (Includes candidate identifiers & count)</option>
                    <option value="minimal">Minimal (High-level actions only)</option>
                  </select>
                  <span className="text-[11px] text-slate-400 leading-relaxed block">
                    Raw journal text is never written to audit trails regardless of logging level.
                  </span>
                </div>
              </div>

              {/* Protected Categories Overview */}
              <div className="bg-[#080b11] border border-white/[0.07] rounded-xl p-4.5 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 block font-mono">
                  Guarded Entity Classes:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Email & Contacts</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Phone Numbers (E.164)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>API Keys & Bearer Tokens</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>SSN & National IDs</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Credit Cards & IBAN</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Private Cryptographic Keys</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Cloud Run & Secret Manager */}
        {activeTab === 'infrastructure' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0d121c] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Google Cloud Enterprise Architecture</h3>
                    <p className="text-[11px] text-slate-400">Zero-trust security boundaries, Cloud Run container configuration, and Secret Manager integration.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  dev-tutorial=cloud-run-ai-challenge
                </span>
              </div>

              {/* Infrastructure Spec Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#080b11] border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Backend Runtime</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-teal-400" />
                      Google Cloud Run
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Stateless, auto-scaling containerized microservice running on Google Cloud container infrastructure.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#080b11] border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Secret Security</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      Cloud Secret Manager
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Gemini API keys and runtime credentials are injected strictly server-side and never exposed to the client browser.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#080b11] border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">Data Isolation</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      Cloud Firestore (UID-Scoped)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    User data is isolated strictly under <code className="text-teal-300 font-mono">/users/&#123;uid&#125;</code> subcollections with authenticated access rules.
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#080b11] border border-white/[0.07] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">AI Foundation Model</span>
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" />
                      Gemini 2.5 Flash / Pro
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Multi-turn reasoning with separated system instructions, governed memory injection, and candidate synthesis.
                  </div>
                </div>
              </div>

              {/* BYOK Live Connection Testbench */}
              <div className="border-t border-white/[0.08] pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                      BYOK Live Connection Testbench
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Zero-Trust Container Proxy
                  </span>
                </div>

                <div className="p-4 bg-[#080b11] border border-white/[0.08] rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Target Provider</label>
                      <select
                        value={testProvider}
                        onChange={(e) => {
                          setTestProvider(e.target.value as any);
                          setTestConnectionResult(null);
                        }}
                        className="w-full bg-[#0d121c] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 font-mono"
                      >
                        <option value="gemini">Google Gemini 2.5 API</option>
                        <option value="openai">OpenAI API (GPT-4o)</option>
                        <option value="claude">Anthropic Claude (3.5 Sonnet)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                        API Token / Key (Leave empty for default runtime key)
                      </label>
                      <input
                        type="password"
                        value={testApiKey}
                        onChange={(e) => setTestApiKey(e.target.value)}
                        placeholder={
                          testProvider === 'gemini'
                            ? 'AIzaSy... (Default Cloud Run Secret Manager key)'
                            : testProvider === 'openai'
                            ? 'sk-proj-...'
                            : 'sk-ant-...'
                        }
                        className="w-full bg-[#0d121c] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono"
                      />
                    </div>
                  </div>

                  {testConnectionResult && (
                    <div
                      className={`p-3 rounded-lg border text-xs ${
                        testConnectionResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span>{testConnectionResult.provider} Test Result</span>
                        <span className="font-mono text-[10px] opacity-80">
                          {testConnectionResult.latencyMs}ms latency
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90">{testConnectionResult.message}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[10px] text-slate-400 font-mono">
                      Keys are proxied strictly through server-side TLS endpoints.
                    </p>
                    <button
                      onClick={async () => {
                        setTestingConnection(true);
                        setTestConnectionResult(null);
                        try {
                          const res = await api.testProviderKey(testProvider, testApiKey);
                          setTestConnectionResult(res);
                        } catch (err: any) {
                          setTestConnectionResult({
                            success: false,
                            provider: testProvider,
                            message: err.message || 'Connection ping failed.',
                            latencyMs: 100,
                          });
                        } finally {
                          setTestingConnection(false);
                        }
                      }}
                      disabled={testingConnection}
                      id="btn-settings-test-connection"
                      className="px-4 py-2 bg-gradient-to-r from-teal-400 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                    >
                      {testingConnection ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing Ping...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Test Provider Connection</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Data Portability & Nuclear Purge */}
        {activeTab === 'portability' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-[#0d121c] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Data Portability & Erasure Rights</h3>
                    <p className="text-[11px] text-slate-400">Download your full encrypted personal archive or exercise complete right-to-be-forgotten erasure.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  GDPR / CCPA Compliant
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Personal Archive */}
                <div className="p-5 bg-[#080b11] border border-white/[0.07] rounded-xl space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-white font-bold text-xs">
                      <FileJson className="w-4 h-4 text-teal-400" />
                      <span>Download Full JSON Archive</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Export all private journal sessions, approved memories, candidate states, and governance preferences in an open, structured JSON format.
                    </p>
                  </div>
                  <a
                    href={api.getFullExportUrl()}
                    download
                    id="btn-settings-export-json"
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/[0.08] shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-400" />
                    <span>Export Full Archive (.json)</span>
                  </a>
                </div>

                {/* Nuclear Purge */}
                <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Nuclear Wipe (Forget Everything)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Permanently and irreversibly purges all conversations, memories, candidates, and resets security audit activity.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPurgeConfirm(true)}
                    id="btn-settings-purge-nuclear"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm shadow-rose-600/20 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge All Personal Records</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showPurgeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0d1117] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Permanent Purge</h3>
                  <p className="text-[11px] text-slate-400">This action is permanent and irreversible.</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This will permanently destroy all conversations, messages, and memory records associated with your UID.
              </p>
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">
                  Type <strong className="text-rose-400 font-mono">DELETE</strong> to confirm:
                </span>
                <input
                  type="text"
                  value={purgeInput}
                  onChange={(e) => setPurgeInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-[#05080f] border border-white/[0.1] rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowPurgeConfirm(false);
                    setPurgeInput('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecutePurge}
                  disabled={purgeInput !== 'DELETE' || purging}
                  className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow cursor-pointer"
                >
                  {purging ? 'Purging...' : 'Permanently Purge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
