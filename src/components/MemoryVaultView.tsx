import React, { useState } from 'react';
import { Memory, MemoryDuration, MemoryStatus } from '../types.js';
import { api } from '../api.js';
import {
  Boxes,
  Plus,
  Trash2,
  AlertOctagon,
  Clock,
  Bookmark,
  Check,
  Search,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
  X,
  History,
  Activity,
  FileText,
  Calendar,
} from 'lucide-react';
import { CandidateModal } from './CandidateModal.js';

interface MemoryVaultViewProps {
  memories: Memory[];
  onRefresh: () => void;
}

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = ({
  memories,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Memory | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectedMemory, setInspectedMemory] = useState<Memory | null>(null);

  // New Memory creation form state
  const [newContent, setNewContent] = useState('');
  const [newPurpose, setNewPurpose] = useState('Contextual Coding & Reasoning');
  const [newPolicy, setNewPolicy] = useState<MemoryDuration>('30_days');

  // Filter logic
  const filteredMemories = memories.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.content.toLowerCase().includes(q) ||
        m.purpose.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = async (id: string, updates?: { purpose?: string; expirationPolicy?: MemoryDuration }) => {
    try {
      await api.approveMemory(id, updates);
      onRefresh();
      if (inspectedMemory?.id === id) {
        setInspectedMemory(null);
      }
    } catch (err) {
      console.error('Failed to approve memory:', err);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this memory? It will immediately be excluded from all future Gemini turns.')) {
      return;
    }
    try {
      await api.revokeMemory(id, 'User manually revoked via Memory Vault');
      onRefresh();
      if (inspectedMemory?.id === id) {
        setInspectedMemory(null);
      }
    } catch (err) {
      console.error('Failed to revoke memory:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently purge this memory from storage? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteMemory(id);
      onRefresh();
      if (inspectedMemory?.id === id) {
        setInspectedMemory(null);
      }
    } catch (err) {
      console.error('Failed to delete memory:', err);
    }
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      const res = await api.addCandidate({
        content: newContent.trim(),
        purpose: newPurpose.trim(),
        expirationPolicy: newPolicy,
      });

      // User can immediately approve or keep as candidate
      await api.approveMemory(res.candidate.id);
      setNewContent('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create memory:', err);
    }
  };

  const getStatusBadge = (status: MemoryStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Active & Approved</span>
          </span>
        );
      case 'candidate':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Candidate (Pending)</span>
          </span>
        );
      case 'revoked':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Revoked (Excluded)</span>
          </span>
        );
      case 'expired':
        return (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/[0.08] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Policy Expired</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6 relative bg-[#080a0f]">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
              MEMORY GOVERNANCE PLANE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {memories.length} TOTAL MANAGED DIRECTIVES
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1.5 font-display">
            Memory Vault & Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Every memory requires explicit user authorization, purpose limitation, and strict expiration governance. Revoked memories are immediately excluded from model prompts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          id="btn-vault-add-memory"
          className="bg-teal-400 hover:bg-teal-300 text-slate-950 text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2 self-start shadow-sm shadow-teal-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Governed Memory</span>
        </button>
      </div>

      {/* Memory Lifecycle Guide Strip */}
      <div className="bg-[#0d1117]/80 border border-white/[0.07] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-slate-200">Lifecycle Pipeline:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">1. Candidate</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">2. User Consent</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">3. Active Context</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/[0.08]">4. Expiration / Revocation</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d1117]/80 border border-white/[0.07] p-3 rounded-xl shadow-md">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Records' },
            { id: 'approved', label: 'Approved & Active' },
            { id: 'candidate', label: 'Candidates Pending' },
            { id: 'revoked', label: 'Revoked (Excluded)' },
            { id: 'expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter memories or purposes..."
            className="w-full bg-[#080a0f] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="bg-[#0d1117]/40 border border-white/[0.07] rounded-xl p-12 text-center space-y-3">
          <Boxes className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-white">No Governed Memories Found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or add a new governed memory to your vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => {
            const isApproved = mem.status === 'approved';
            const isCandidate = mem.status === 'candidate';
            const isRevoked = mem.status === 'revoked';

            return (
              <div
                key={mem.id}
                id={`memory-vault-card-${mem.id}`}
                onClick={() => setInspectedMemory(mem)}
                className={`bg-[#0d1117]/80 border rounded-xl p-5 relative overflow-hidden flex flex-col justify-between space-y-4 transition-all cursor-pointer group shadow-sm ${
                  isApproved
                    ? 'border-white/[0.08] hover:border-teal-500/30 hover:bg-[#131822]'
                    : isCandidate
                    ? 'border-amber-500/30 hover:border-amber-500/50 hover:bg-[#131822]'
                    : 'border-white/[0.06] opacity-80'
                }`}
              >
                {/* Top Row: Status + ID */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(mem.status)}
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300 transition-colors">
                      {mem.id}
                    </span>
                  </div>

                  {/* Memory Content */}
                  <p className="text-sm text-slate-200 font-serif italic leading-relaxed pt-1">
                    &ldquo;{mem.content}&rdquo;
                  </p>
                </div>

                {/* Metadata block */}
                <div className="space-y-2 text-xs border-t border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <Bookmark className="w-3 h-3 text-teal-400" />
                      Authorized Purpose:
                    </span>
                    <span className="text-slate-200 font-medium truncate max-w-[200px]">
                      {mem.purpose}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3 h-3 text-sky-400" />
                      Expiration Policy:
                    </span>
                    <span className="text-slate-300 capitalize text-[11px] font-mono">
                      {mem.expirationPolicy.replace('_', ' ')}
                      {mem.expiresAt && ` (${new Date(mem.expiresAt).toLocaleDateString()})`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Created: {new Date(mem.createdAt).toLocaleDateString()}</span>
                    <span>Consultations: {mem.useCount || 0} times</span>
                  </div>

                  {mem.revokedAt && (
                    <div className="text-[10px] text-rose-300 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                      Revoked on {new Date(mem.revokedAt).toLocaleString()}: &ldquo;{mem.revocationReason || 'Revoked by user'}&rdquo;
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div
                  className="flex items-center justify-between border-t border-white/[0.06] pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setInspectedMemory(mem)}
                    className="text-[11px] text-teal-300 hover:text-teal-200 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-2">
                    {isCandidate && (
                      <>
                        <button
                          onClick={() => handleDelete(mem.id)}
                          className="text-[11px] px-2.5 py-1 bg-[#131822] hover:bg-slate-800 text-slate-300 rounded-lg border border-white/[0.08] transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => setSelectedCandidate(mem)}
                          className="text-[11px] px-3 py-1 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      </>
                    )}

                    {isApproved && (
                      <>
                        <button
                          onClick={() => handleRevoke(mem.id)}
                          id={`btn-revoke-${mem.id}`}
                          className="text-[11px] px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-lg border border-amber-500/30 transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                          title="Immediately stop Gemini from using this memory"
                        >
                          <AlertOctagon className="w-3 h-3 text-amber-300" />
                          <span>Revoke</span>
                        </button>

                        <button
                          onClick={() => handleDelete(mem.id)}
                          className="text-[11px] p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/[0.05] rounded-lg transition-colors cursor-pointer"
                          title="Permanently Purge Memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {(isRevoked || mem.status === 'expired') && (
                      <>
                        <button
                          onClick={() => handleApprove(mem.id)}
                          className="text-[11px] px-2.5 py-1 bg-[#131822] hover:bg-slate-800 text-slate-300 rounded-lg border border-white/[0.08] transition-colors cursor-pointer"
                        >
                          Re-activate
                        </button>
                        <button
                          onClick={() => handleDelete(mem.id)}
                          className="text-[11px] px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 rounded-lg border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Purge</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resource Inspector Drawer */}
      {inspectedMemory && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0d1117] border-l border-white/[0.08] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-teal-300 font-bold">
                  RESOURCE INSPECTOR
                </span>
                <h3 className="text-sm font-bold text-white font-mono">{inspectedMemory.id}</h3>
              </div>
              <button
                onClick={() => setInspectedMemory(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Status & Eligibility
                </span>
                <div className="flex items-center justify-between p-3 bg-[#131822] border border-white/[0.07] rounded-xl">
                  {getStatusBadge(inspectedMemory.status)}
                  <span className="text-xs text-slate-400 font-mono">
                    {inspectedMemory.status === 'approved' ? 'Eligible for Prompts' : 'Excluded from Context'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Governed Memory Directive
                </span>
                <div className="p-4 bg-[#131822] border border-white/[0.07] rounded-xl text-xs text-slate-200 font-serif italic leading-relaxed">
                  &ldquo;{inspectedMemory.content}&rdquo;
                </div>
              </div>

              <div className="space-y-3 p-4 bg-[#131822]/60 border border-white/[0.07] rounded-xl text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-teal-400" />
                    Authorized Purpose:
                  </span>
                  <span className="text-slate-200 font-medium">{inspectedMemory.purpose}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    Expiration Policy:
                  </span>
                  <span className="text-slate-200 font-mono capitalize">
                    {inspectedMemory.expirationPolicy.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    Expiration Timestamp:
                  </span>
                  <span className="text-slate-300 font-mono">
                    {inspectedMemory.expiresAt ? new Date(inspectedMemory.expiresAt).toLocaleString() : 'Permanent'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    Source Conversation:
                  </span>
                  <span className="text-slate-300 font-mono truncate max-w-[180px]">
                    {inspectedMemory.sourceConversationId}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-400" />
                    Consultation Count:
                  </span>
                  <span className="text-slate-200 font-mono">{inspectedMemory.useCount || 0} times</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.07] space-y-2">
            {inspectedMemory.status === 'approved' && (
              <button
                onClick={() => handleRevoke(inspectedMemory.id)}
                className="w-full py-2.5 px-4 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Revoke Memory (Exclude Immediately)</span>
              </button>
            )}

            <button
              onClick={() => handleDelete(inspectedMemory.id)}
              className="w-full py-2.5 px-4 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Permanently Purge Memory</span>
            </button>
          </div>
        </div>
      )}

      {/* Ingest Memory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white font-display">Ingest Governed Memory</h3>
                  <p className="text-xs text-slate-400">
                    Proactively add an authorized directive or preference to your vault.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Memory Directive</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g. Always format SQL schemas in snake_case and exclude sample passwords from test outputs."
                  className="w-full bg-[#080a0f] border border-white/[0.08] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Authorized Purpose</label>
                <input
                  type="text"
                  value={newPurpose}
                  onChange={(e) => setNewPurpose(e.target.value)}
                  placeholder="e.g. Database Architecture Guidelines"
                  className="w-full bg-[#080a0f] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Expiration Policy</label>
                <select
                  value={newPolicy}
                  onChange={(e) => setNewPolicy(e.target.value as MemoryDuration)}
                  className="w-full bg-[#080a0f] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
                >
                  <option value="1_day">1 Day (Temporary task context)</option>
                  <option value="7_days">7 Days (Sprint / weekly policy)</option>
                  <option value="30_days">30 Days (Standard monthly policy)</option>
                  <option value="project">Project Duration (90 days)</option>
                  <option value="forever">Forever (Until explicitly revoked)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.07]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-[#131822] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-md transition-colors cursor-pointer"
                >
                  Store in Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Modal for existing candidate */}
      <CandidateModal
        isOpen={Boolean(selectedCandidate)}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onApprove={(id, updates) => {
          handleApprove(id, updates);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
};
