import React, { useState } from 'react';
import { PrivacyFinding } from '../types.js';
import { api } from '../api.js';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  CreditCard,
  UserCheck,
  Phone,
  HeartPulse,
  Fingerprint,
  EyeOff,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export const PrivacyGuardianView: React.FC = () => {
  const [testText, setTestText] = useState(
    'Please review my backup script for database db-01. The master password is secret_token_xyz99881122 and my developer email is dev@company.com. Also Dr. Aris prescribed 20mg of lisinopril.'
  );
  const [scanning, setScanning] = useState(false);
  const [findings, setFindings] = useState<PrivacyFinding[]>([]);
  const [redactedText, setRedactedText] = useState('');
  const [hasScanned, setHasScanned] = useState(false);

  const sampleSnippets = [
    {
      label: 'Credentials & API Keys',
      text: 'Deploying our microservice: export GEMINI_API_KEY="AIzaSyA89482918491829482194812" and admin token bearer: a1b2c3d4e5f6g7h8i9j0k1.',
    },
    {
      label: 'Health & Medical',
      text: 'Had my annual cardiology checkup. Blood pressure is 145/95, diagnosed with stage 1 hypertension and prescribed 10mg of amlodipine.',
    },
    {
      label: 'Financial & PII',
      text: 'Processing customer reimbursement. Card: 4532890123456789, expiration 08/28. SSN: 123-45-6789 for tax record.',
    },
    {
      label: 'Clean Query',
      text: 'How do I implement memory-safe streaming buffers in Go 1.22 using io.Pipe and goroutines?',
    },
  ];

  const handleScan = async (textToScan = testText) => {
    if (!textToScan.trim()) return;
    setScanning(true);
    try {
      const res = await api.scanPrivacy(textToScan);
      setFindings(res.findings);
      setRedactedText(res.redactedVersion);
      setHasScanned(true);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  const categories = [
    {
      id: 'credentials',
      name: 'Credentials & Secrets',
      icon: <Key className="w-4 h-4 text-rose-400" />,
      desc: 'API keys, bearer tokens, passwords, private keys, authentication secrets.',
      standard: 'Zero-Trust Policy',
      accent: 'border-rose-500/20 bg-rose-500/[0.03]',
      badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'financial',
      name: 'Financial Data',
      icon: <CreditCard className="w-4 h-4 text-amber-400" />,
      desc: 'Credit/debit card numbers (Luhn check), IBANs, cryptocurrency addresses.',
      standard: 'PCI-DSS Compliance',
      accent: 'border-amber-500/20 bg-amber-500/[0.03]',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: 'pii',
      name: 'Personally Identifiable (PII)',
      icon: <UserCheck className="w-4 h-4 text-sky-400" />,
      desc: 'Social Security Numbers (SSN), passport numbers, national ID numbers.',
      standard: 'GDPR / Privacy Shield',
      accent: 'border-sky-500/20 bg-sky-500/[0.03]',
      badge: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'contact',
      name: 'Contact Information',
      icon: <Phone className="w-4 h-4 text-emerald-400" />,
      desc: 'Personal emails, phone numbers, and physical residential street addresses.',
      standard: 'Anti-Correlation',
      accent: 'border-emerald-500/20 bg-emerald-500/[0.03]',
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'health',
      name: 'Health & Medical Records',
      icon: <HeartPulse className="w-4 h-4 text-rose-400" />,
      desc: 'Clinical condition diagnoses, medication dosages, biometric and therapeutic references.',
      standard: 'HIPAA Guardrails',
      accent: 'border-rose-500/20 bg-rose-500/[0.03]',
      badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      id: 'identifier',
      name: 'Private Identifiers',
      icon: <Fingerprint className="w-4 h-4 text-indigo-400" />,
      desc: 'Internal IPv4 addresses (RFC 1918), corporate employee IDs, enterprise badges.',
      standard: 'Topology Cloaking',
      accent: 'border-indigo-500/20 bg-indigo-500/[0.03]',
      badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
  ];

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span>Privacy Guardian</span>
            <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 tracking-wider">
              PRE-EXECUTION BARRIER
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic and semantic interception before any prompt leaves the container. Zero silent transmission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1117] border border-white/[0.07] text-[11px] text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Policy: Pre-Flight Interception</span>
          </div>
        </div>
      </div>

      {/* Live Scanner Testbench Card */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-xl p-6 space-y-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Live Privacy Scanner Testbench
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulate prompt analysis to inspect categorized findings and verify sanitization.
              </p>
            </div>
          </div>
          {/* Sample Snippet Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Presets:</span>
            {sampleSnippets.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTestText(s.text);
                  handleScan(s.text);
                }}
                className="text-[10px] px-2.5 py-1 rounded-md bg-[#161b22] hover:bg-[#1f242c] text-slate-300 transition-colors border border-white/[0.07] font-medium"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-3">
          <textarea
            rows={3}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type or paste text to test privacy pattern detection..."
            className="w-full bg-[#05080f] border border-white/[0.07] rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors font-mono leading-relaxed"
          />

          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-mono">
              {testText.length} characters • 6 active detectors
            </span>
            <button
              onClick={() => handleScan()}
              disabled={scanning || !testText.trim()}
              id="btn-privacy-run-scan"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
              <span>{scanning ? 'Analyzing Text...' : 'Run Privacy Scan'}</span>
            </button>
          </div>
        </div>

        {/* Findings and Redaction Preview */}
        {hasScanned && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/[0.07] pt-5">
            {/* Detected Findings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Detections ({findings.length})</span>
                </span>
                {findings.length === 0 ? (
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    CLEAN - ZERO SENSITIVE DATA
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                    INTERCEPTED
                  </span>
                )}
              </div>

              {findings.length === 0 ? (
                <div className="bg-[#05080f] p-5 rounded-xl border border-white/[0.07] text-center text-xs text-slate-400 space-y-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                  <p className="text-slate-200 font-medium">No sensitive patterns detected</p>
                  <p className="text-[11px] text-slate-500">Payload complies with Zero-Trust pre-flight guardrails.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {findings.map((f, i) => (
                    <div
                      key={i}
                      className="bg-[#05080f] border border-white/[0.07] rounded-lg p-3 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{f.label}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-bold border border-rose-500/20">
                          {f.severity}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300 bg-[#161b22] p-2 rounded border border-white/[0.07] break-all">
                        {f.match}
                      </div>
                      <p className="text-[10px] text-slate-400 italic">{f.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Redacted Version Preview */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-teal-400" />
                <span>Masked / Sanitized Payload</span>
              </span>

              <div className="bg-[#05080f] border border-white/[0.07] rounded-xl p-3.5 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap min-h-[140px] max-h-52 overflow-y-auto select-all">
                {redactedText || testText}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6 Core Categories Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-400" />
            <span>Protected Category Guardrails</span>
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">6 Classifications Monitored</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`border rounded-xl p-4 space-y-3 bg-[#0d1117] transition-all hover:border-white/[0.15] ${cat.accent}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#161b22] border border-white/[0.07]">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-white">{cat.name}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Standard:</span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${cat.badge}`}>
                  {cat.standard}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

