import React, { useState } from 'react';
import { Memory, MemoryDuration } from '../types.js';
import { Boxes, X, Check, Clock, Bookmark } from 'lucide-react';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Memory | null;
  onApprove: (id: string, updates: { purpose: string; expirationPolicy: MemoryDuration }) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  candidate,
  onApprove,
}) => {
  if (!isOpen || !candidate) return null;

  const [purpose, setPurpose] = useState(candidate.purpose || 'Contextual Coding Assistant');
  const [duration, setDuration] = useState<MemoryDuration>(candidate.expirationPolicy || '30_days');

  const durations: { id: MemoryDuration; label: string; desc: string }[] = [
    { id: '1_day', label: '1 Day', desc: 'Auto-purges after 24 hours' },
    { id: '7_days', label: '7 Days', desc: 'Short sprint retention' },
    { id: '30_days', label: '30 Days', desc: 'Standard monthly policy' },
    { id: 'project', label: 'Project', desc: '90-day milestone duration' },
    { id: 'forever', label: 'Forever', desc: 'Persistent until explicitly revoked' },
  ];

  const handleConfirm = () => {
    onApprove(candidate.id, { purpose, expirationPolicy: duration });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Approve Memory Candidate</h3>
              <p className="text-xs text-slate-400">
                Grant durable context authority with purpose & expiration limits.
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

        {/* Memory Content Preview */}
        <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider block mb-1">
            Memory Content
          </span>
          <p className="text-xs text-slate-200 font-serif italic leading-relaxed">
            "{candidate.content}"
          </p>
        </div>

        {/* Purpose Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-sky-400" />
            <span>Authorized Purpose</span>
          </label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="e.g. Contextual Coding Assistant, Security Guardrail"
          />
          <p className="text-[11px] text-slate-500">
            Gemini will only consult this memory to fulfill this specified purpose.
          </p>
        </div>

        {/* Duration Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supported Expiration Policy</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {durations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDuration(d.id)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  duration === d.id
                    ? 'bg-sky-500/10 border-sky-500/50 text-white shadow-sm'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{d.label}</span>
                  {duration === d.id && <Check className="w-3.5 h-3.5 text-sky-400" />}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-md shadow-lg shadow-sky-500/10 transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirm & Store Memory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
