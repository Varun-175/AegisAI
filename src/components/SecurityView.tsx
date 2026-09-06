import React, { useState, useEffect } from 'react';
import { AuditLogEntry, UserProfile, AuditVerificationResult } from '../types.js';
import { api } from '../api.js';
import {
  ShieldCheck,
  Lock,
  Download,
  Key,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  RefreshCw,
  LogIn,
  CheckCircle,
  Hash,
  Fingerprint,
  Shield,
  Layers,
} from 'lucide-react';

interface SecurityViewProps {
  user: UserProfile | null;
  onRefreshUser: () => void;
  onLogout?: () => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  user,
  onRefreshUser,
  onLogout,
}) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showSwitchUser, setShowSwitchUser] = useState(false);

  // Cryptographic Chain Verification State
  const [verification, setVerification] = useState<AuditVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(100);
      setLogs(res.logs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyChain = async () => {
    setVerifying(true);
    try {
      const result = await api.verifyAuditChain();
      setVerification(result);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const handleSwitchGoogleUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;

    try {
      await api.loginWithGoogle(googleEmail.trim(), googleName.trim() || undefined);
      setShowSwitchUser(false);
      setGoogleEmail('');
      setGoogleName('');
      onRefreshUser();
      loadLogs();
      setVerification(null);
    } catch (err) {
      console.error('Failed to switch Google identity:', err);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    return true;
  });

  const getSeverityBadge = (sev: AuditLogEntry['severity']) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[9px] font-bold border border-rose-500/20">
            CRITICAL
          </span>
        );
      case 'warn':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[9px] font-bold border border-amber-500/20">
            WARN
          </span>
        );
      case 'info':
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-mono text-[9px] border border-teal-500/20">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Security Center & Cryptographic Audit</span>
            <span className="text-[10px] text-teal-400 font-mono font-semibold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 tracking-wider">
              ZERO-TRUST CONSOLE
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Strict server-side UID isolation, zero client credential exposure, and SHA-256 hash-chained audit log integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleVerifyChain}
            disabled={verifying}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-teal-500/15"
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>{verifying ? 'Verifying Chain...' : 'Verify Hash Chain'}</span>
          </button>

          <a
            href={api.getExportAuditUrl()}
            download
            id="btn-export-audit"
            className="bg-[#161b22] hover:bg-[#1f242c] text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-white/[0.07] shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export (JSON)</span>
          </a>
        </div>
      </div>

      {/* Cryptographic Chain Verification Result Banner */}
      {verification && (
        <div
          className={`border rounded-2xl p-6 space-y-4 shadow-xl transition-all ${
            verification.isValid
              ? 'bg-emerald-950/15 border-emerald-500/40 shadow-emerald-500/5'
              : 'bg-rose-950/15 border-rose-500/40 shadow-rose-500/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl border ${verification.isValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {verification.isValid ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {verification.isValid
                    ? 'Cryptographic Hash Chain Integrity Verified'
                    : 'Integrity Anomaly Detected'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {verification.details}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#05080f] text-emerald-400 border border-emerald-500/30 font-semibold">
              {verification.totalEntries} Chain Links Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-mono border-t border-white/[0.05]">
            <div className="p-3 bg-[#05080f] rounded-xl border border-white/[0.07] flex flex-col space-y-0.5">
              <span className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider">Root Genesis Hash</span>
              <span className="text-teal-400 truncate">{verification.rootHash}</span>
            </div>
            <div className="p-3 bg-[#05080f] rounded-xl border border-white/[0.07] flex flex-col space-y-0.5">
              <span className="text-slate-500 uppercase text-[9px] font-semibold tracking-wider">Latest Node Hash</span>
              <span className="text-teal-400 truncate">{verification.latestHash}</span>
            </div>
          </div>
        </div>
      )}

      {/* Security Architecture Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600"></div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">UID Isolation</span>
          </div>
          <p className="text-xs text-slate-300 font-mono truncate bg-[#05080f] p-2 rounded-lg border border-white/[0.05]">
            {user?.uid || 'usr_gv_default'}
          </p>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            All conversations, memories, and audit logs are partitioned strictly on the server by this verified UID. Client-claimed UIDs are completely disregarded.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-sky-600"></div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Key className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Gemini Server-Side</span>
          </div>
          <div className="bg-[#05080f] p-2 rounded-lg border border-white/[0.05]">
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Zero Browser Key Exposure</span>
            </p>
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
            Calls to Gemini 2.5 Flash are dispatched exclusively via authenticated Express backend routes. Browser JavaScript never touches GEMINI_API_KEY.
          </p>
        </div>

        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <User className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Google Sign-In</span>
          </div>
          <p className="text-xs text-slate-300 truncate bg-[#05080f] p-2 rounded-lg border border-white/[0.05]">
            {user?.email || 'Authenticated User'}
          </p>
          <div className="flex items-center gap-3 mt-2.5">
            <button
              onClick={() => setShowSwitchUser(!showSwitchUser)}
              id="btn-switch-identity"
              className="text-[11px] text-teal-400 hover:text-teal-300 font-medium underline flex items-center gap-1"
            >
              <span>Switch / Test Account</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                id="btn-security-logout"
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium underline flex items-center gap-1"
              >
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Switch User Panel */}
      {showSwitchUser && (
        <div className="bg-[#0d1117] border border-white/[0.1] rounded-2xl p-6 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LogIn className="w-4 h-4 text-teal-400" />
              <span>Sign In with Google Account</span>
            </h3>
            <button
              onClick={() => setShowSwitchUser(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/[0.05]"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Sign in with an alternative Google account to test multi-user partition isolation. Each UID receives its own isolated memory vault and journal threads.
          </p>
          <form onSubmit={handleSwitchGoogleUser} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              placeholder="e.g. security-lead@enterprise.com"
              className="bg-[#05080f] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500/50 flex-1 font-mono"
              required
            />
            <input
              type="text"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              placeholder="Display Name (optional)"
              className="bg-[#05080f] border border-white/[0.07] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500/50 sm:w-48 font-medium"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl transition-all whitespace-nowrap shadow"
            >
              Sign In with Google
            </button>
          </form>
        </div>
      )}

      {/* Activity Audit Trail */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Cryptographic Activity Audit Trail ({filteredLogs.length})
            </h3>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {['all', 'auth', 'memory', 'privacy', 'gemini', 'journal'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors font-medium ${
                  filterCategory === cat
                    ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={loadLogs}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/[0.05] ml-1 transition-colors"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.07] text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-3">Hash Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                    No activity entries found for this category filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-200 whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 text-slate-400 uppercase font-mono text-[10px]">
                      {log.category}
                    </td>
                    <td className="py-3 px-3 text-slate-300 leading-snug">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono text-[10px] whitespace-nowrap">
                      {log.entryHash ? (
                        <span className="flex items-center gap-1 text-slate-400 font-mono" title={log.entryHash}>
                          <Hash className="w-3 h-3 text-teal-400" />
                          <span>{log.entryHash.slice(0, 8)}...</span>
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

