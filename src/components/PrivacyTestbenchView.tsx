import React, { useState, useEffect } from 'react';
import { PrivacyFinding, PrivacyTestCase } from '../types.js';
import { api } from '../api.js';
import {
  FlaskConical,
  Play,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Terminal,
} from 'lucide-react';

export const PrivacyTestbenchView: React.FC = () => {
  const [testCases, setTestCases] = useState<PrivacyTestCase[]>([]);
  const [inputText, setInputText] = useState(
    'I am deploying our backend to https://api.internal.corp using Google Cloud API key AIzaSyD9x8K1m7P4Q0v3N2L5X6Z7Y8A9B0C1D2 and email security-lead@aegisai.internal.'
  );
  const [findings, setFindings] = useState<PrivacyFinding[]>([]);
  const [redactedText, setRedactedText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  useEffect(() => {
    loadTestCases();
    runScan(inputText);
  }, []);

  const loadTestCases = async () => {
    try {
      const res = await api.getPrivacyTestCases();
      setTestCases(res.testCases);
    } catch (err) {
      console.error('Failed to load test cases:', err);
    }
  };

  const runScan = async (textToScan: string) => {
    if (!textToScan.trim()) {
      setFindings([]);
      setRedactedText('');
      return;
    }
    setIsScanning(true);
    try {
      const result = await api.scanPrivacy(textToScan);
      setFindings(result.findings);
      setRedactedText(result.redactedVersion);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (tc: PrivacyTestCase) => {
    setSelectedPresetId(tc.id);
    setInputText(tc.sampleText);
    runScan(tc.sampleText);
  };

  const handleCopyRedacted = () => {
    navigator.clipboard.writeText(redactedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categoryColors: Record<string, string> = {
    credentials: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    financial: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    pii: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    contact: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    health: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    identifier: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span>Privacy Guardian Testbench</span>
            <span className="text-[10px] text-teal-400 font-mono font-semibold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              INTERCEPTION BENCHMARK
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Screen test vectors against AegisAI&rsquo;s multi-category interception engine. Validate deterministic regex patterns, inspect severity classification, and test sanitization before server-side model invocation.
          </p>
        </div>
      </div>

      {/* Preset Test Case Chips */}
      {testCases.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Pre-Configured Detection Benchmarks</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {testCases.map((tc) => {
              const isSelected = selectedPresetId === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => handleSelectPreset(tc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 shadow-sm shadow-teal-500/10 font-semibold'
                      : 'bg-[#0d1117] text-slate-400 border-white/[0.07] hover:text-slate-200 hover:border-white/[0.15]'
                  }`}
                >
                  <span>{tc.title}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#161b22] text-slate-400 font-mono uppercase border border-white/[0.05]">
                    {tc.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Scan Lab: Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Textarea */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span>Raw Input Payload</span>
              </span>
              <button
                onClick={() => {
                  setInputText('');
                  setFindings([]);
                  setRedactedText('');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                runScan(e.target.value);
              }}
              rows={8}
              placeholder="Paste raw journal text containing potential credentials, PII, or confidential numbers..."
              className="w-full bg-[#05080f] border border-white/[0.07] rounded-xl p-3.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-teal-500/50 transition-colors leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
            <span className="text-[11px] text-slate-500 font-mono">
              {inputText.length} chars • {findings.length} findings
            </span>
            <button
              onClick={() => runScan(inputText)}
              disabled={isScanning}
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-teal-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isScanning ? 'Scanning...' : 'Execute Scan'}</span>
            </button>
          </div>
        </div>

        {/* Right: Sanitized / Redacted Output */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>Sanitized Representation</span>
                <span className="text-[10px] text-emerald-400 font-mono">(Ready for Gemini)</span>
              </span>
              <button
                onClick={handleCopyRedacted}
                disabled={!redactedText}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded bg-[#161b22] border border-white/[0.05]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="w-full h-44 bg-[#05080f] border border-white/[0.07] rounded-xl p-3.5 text-xs text-emerald-400/90 font-mono overflow-y-auto leading-relaxed select-all">
              {redactedText || <span className="text-slate-600 italic font-sans">No input to sanitize</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.05] text-xs">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold text-[11px]">Pre-Execution Interception of Sensitive Tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Findings Breakdown Table */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Detected Sensitive Findings ({findings.length})</span>
          </h3>
          {findings.length === 0 && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Clean Payload</span>
            </span>
          )}
        </div>

        {findings.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            No privacy risks detected in the current text payload.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-slate-500 uppercase tracking-wider text-[10px] font-mono">
                  <th className="pb-3 px-2">Category</th>
                  <th className="pb-3 px-2">Severity</th>
                  <th className="pb-3 px-2">Target Match</th>
                  <th className="pb-3 px-2">Position</th>
                  <th className="pb-3 px-2">Enforcement Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {findings.map((f, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-medium ${
                          categoryColors[f.category] || 'text-slate-400 bg-slate-800 border-slate-700'
                        }`}
                      >
                        {f.category}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          f.severity === 'critical'
                            ? 'text-rose-400'
                            : f.severity === 'high'
                            ? 'text-amber-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {f.severity}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-200">
                      &ldquo;{f.match}&rdquo;
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">
                      [{f.startIndex}..{f.endIndex}]
                    </td>
                    <td className="py-3 px-2 text-slate-400">
                      {f.severity === 'critical' ? 'Mandatory Redact / Block' : 'Inspect & Redact'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

