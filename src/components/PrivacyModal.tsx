import React from 'react';
import { PrivacyFinding } from '../types.js';
import { ShieldAlert, EyeOff, Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  findings: PrivacyFinding[];
  originalText: string;
  onAllow: () => void;
  onRedact: () => void;
  onBlock: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  findings,
  originalText,
  onAllow,
  onRedact,
  onBlock,
}) => {
  if (!isOpen) return null;

  const severityColor: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white">Privacy Guardian Review</h3>
            <p className="text-xs text-slate-400">
              Potential sensitive data detected before submission to model endpoints. AegisAI gives you total control.
            </p>
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {findings.map((f, i) => (
            <div
              key={f.id || i}
              className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      severityColor[f.severity] || severityColor.medium
                    }`}
                  >
                    {f.severity}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{f.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-mono">{f.category}</span>
              </div>

              <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-xs font-mono text-amber-300 break-all">
                "{f.match}"
              </div>

              <p className="text-[11px] text-slate-400 italic leading-tight">
                {f.suggestion}
              </p>
            </div>
          ))}
        </div>

        {/* User Choice Explanation */}
        <p className="text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
          <strong>Your decision is respected:</strong> Redaction masks matching values with <code className="text-sky-400">[REDACTED: CATEGORY]</code> before transmission. Choosing Allow transmits your exact text. Choosing Block cancels submission completely.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onBlock}
            id="btn-privacy-block"
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Block & Edit</span>
          </button>

          <button
            onClick={onAllow}
            id="btn-privacy-allow"
            className="px-4 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 rounded-md border border-amber-500/30 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Allow As-Is</span>
          </button>

          <button
            onClick={onRedact}
            id="btn-privacy-redact"
            className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-md shadow-lg shadow-sky-500/10 transition-colors flex items-center gap-1.5"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Redact & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
