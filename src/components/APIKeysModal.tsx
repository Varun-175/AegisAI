import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Lock,
  ExternalLink,
  Cpu,
  X,
  Sparkles,
  Database,
  Radio,
} from 'lucide-react';
import { api } from '../api.js';

interface APIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APIKeysModal: React.FC<APIKeysModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'claude'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: 'connected' | 'unauthorized' | 'error';
    provider: string;
    message: string;
    latencyMs: number;
    details?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testProviderKey(provider, apiKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'unauthorized',
        provider: provider === 'gemini' ? 'Google Gemini' : provider === 'openai' ? 'OpenAI' : 'Anthropic Claude',
        message: err.message || 'Failed to establish secure proxy handshakes.',
        latencyMs: 120,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-white/[0.12] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
        
        {/* Top Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-sky-400 to-amber-300"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>AI Provider & API Key Connection</span>
                <span className="text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  BYOK SECURE PROXY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure your custom API tokens and test live connectivity through AegisAI's server-side proxy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Select Provider */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono block">
            1. Select AI Orchestration Provider
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => {
                setProvider('gemini');
                setTestResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                provider === 'gemini'
                  ? 'bg-teal-500/15 border-teal-500/40 text-white shadow-lg shadow-teal-500/10'
                  : 'bg-[#06080e] border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <Cpu className={`w-4 h-4 ${provider === 'gemini' ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className="text-[9px] font-mono text-teal-300 font-bold bg-teal-500/20 px-1.5 py-0.5 rounded">
                  RECOMMENDED
                </span>
              </div>
              <div>
                <span className="text-xs font-bold block">Google Gemini</span>
                <span className="text-[10px] text-slate-400 block font-mono">2.5 Flash / Pro</span>
              </div>
            </button>

            <button
              onClick={() => {
                setProvider('openai');
                setTestResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                provider === 'openai'
                  ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-lg shadow-sky-500/10'
                  : 'bg-[#06080e] border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <Sparkles className={`w-4 h-4 ${provider === 'openai' ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className="text-[9px] font-mono text-sky-300 font-bold bg-sky-500/20 px-1.5 py-0.5 rounded">
                  GPT-4o
                </span>
              </div>
              <div>
                <span className="text-xs font-bold block">OpenAI</span>
                <span className="text-[10px] text-slate-400 block font-mono">Custom Key</span>
              </div>
            </button>

            <button
              onClick={() => {
                setProvider('claude');
                setTestResult(null);
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                provider === 'claude'
                  ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
                  : 'bg-[#06080e] border-white/[0.07] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <Radio className={`w-4 h-4 ${provider === 'claude' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded">
                  3.5 SONNET
                </span>
              </div>
              <div>
                <span className="text-xs font-bold block">Anthropic</span>
                <span className="text-[10px] text-slate-400 block font-mono">Claude 3.5</span>
              </div>
            </button>
          </div>
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              2. Enter API Token / Secret Key
            </label>
            <a
              href={
                provider === 'gemini'
                  ? 'https://aistudio.google.com/app/apikey'
                  : provider === 'openai'
                  ? 'https://platform.openai.com/api-keys'
                  : 'https://console.anthropic.com/settings/keys'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Get {provider === 'gemini' ? 'Gemini' : provider === 'openai' ? 'OpenAI' : 'Anthropic'} Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                provider === 'gemini'
                  ? 'AIzaSy... (Leave empty to use server Cloud Run default)'
                  : provider === 'openai'
                  ? 'sk-proj-...'
                  : 'sk-ant-...'
              }
              className="w-full bg-[#06080e] border border-white/[0.12] rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono tracking-wider"
            />
            <div className="absolute right-3 top-3 flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-white/[0.06]">
              <Lock className="w-2.5 h-2.5 text-emerald-400" />
              <span>Server-Side Proxy Isolated</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            API keys are never stored in browser local storage or committed to repository code. Handshakes occur strictly via AegisAI container proxies.
          </p>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-xs animate-in fade-in duration-150 ${
              testResult.success
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold">{testResult.provider} Connection Test</span>
                <span className="font-mono text-[10px] bg-white/[0.08] px-2 py-0.5 rounded font-semibold">
                  Latency: {testResult.latencyMs}ms
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">{testResult.message}</p>
              {testResult.details && (
                <div className="text-[10px] font-mono bg-black/40 p-2 rounded border border-white/10 text-slate-300 mt-1 overflow-x-auto">
                  {testResult.details}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust Policy Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing}
              id="btn-test-api-key-modal"
              className="px-5 py-2 bg-gradient-to-r from-teal-400 to-sky-400 hover:from-teal-300 hover:to-sky-300 text-slate-950 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Pinging API Endpoint...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test Connection & Ping</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
