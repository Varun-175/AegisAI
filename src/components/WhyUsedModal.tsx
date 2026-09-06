import React from 'react';
import { MemoryUsageExplanation } from '../types.js';
import { HelpCircle, X, Shield, Clock, Bookmark, ArrowRight } from 'lucide-react';

interface WhyUsedModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanations: MemoryUsageExplanation[];
}

export const WhyUsedModal: React.FC<WhyUsedModalProps> = ({
  isOpen,
  onClose,
  explanations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Memory Transparency Inspector</h3>
              <p className="text-xs text-slate-400">
                Audited disclosure of governed memories injected into Gemini's context window.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {explanations.map((exp, idx) => (
            <div
              key={exp.memoryId || idx}
              className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500"></div>

              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-sky-400 font-bold">Memory ID: {exp.memoryId}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded capitalize">
                  Policy: {exp.expirationPolicy.replace('_', ' ')}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-xs text-slate-200 font-serif italic">
                "{exp.memoryContent}"
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                    <Bookmark className="w-3 h-3 text-sky-400" />
                    Authorized Purpose
                  </span>
                  <p className="text-slate-300 font-medium">{exp.purpose}</p>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    Expiration Status
                  </span>
                  <p className="text-slate-300 font-medium">
                    {exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : 'Active (Forever / Project)'}
                  </p>
                </div>
              </div>

              <div className="bg-sky-500/5 border border-sky-500/15 p-3 rounded-lg text-xs space-y-1">
                <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                  Relationship to this conversation
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {exp.relationshipToQuery}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            Close Transparency Log
          </button>
        </div>
      </div>
    </div>
  );
};
