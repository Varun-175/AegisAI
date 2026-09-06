import React, { useState } from 'react';
import { UserProfile, GovernanceStats, NavTab } from '../types.js';
import { api } from '../api.js';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Copy,
  Check,
  Boxes,
  BookOpen,
  Eye,
  Download,
  Activity,
  Fingerprint,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Key,
  X,
  Sparkles,
} from 'lucide-react';
import { AegisAILogo } from './AegisAILogo.js';
import { UserAvatar } from './UserAvatar.js';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  stats: GovernanceStats | null;
  onNavigate: (tab: NavTab) => void;
  onRefreshUser: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  onNavigate,
  onRefreshUser,
  onLogout,
}) => {
  const [copiedUid, setCopiedUid] = useState(false);
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [chainResult, setChainResult] = useState<string | null>(null);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [switching, setSwitching] = useState(false);

  if (!isOpen || !user) return null;

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleVerifyChain = async () => {
    setVerifyingChain(true);
    setChainResult(null);
    try {
      const res = await api.verifyAuditChain();
      if (res.isValid) {
        setChainResult(`Verified: ${res.totalEntries} hash-linked audit records are intact.`);
      } else {
        setChainResult(`Warning: Integrity mismatch detected.`);
      }
    } catch (err) {
      setChainResult('Verification request failed.');
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleSwitchAccount = async (email: string, name?: string) => {
    setSwitching(true);
    try {
      await api.loginWithGoogle(email, name);
      onRefreshUser();
      setShowAccountSwitcher(false);
      setCustomEmail('');
      setCustomName('');
      onClose();
    } catch (err) {
      console.error('Account switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl bg-[#090d16] border border-white/[0.12] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8)] overflow-hidden z-10 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Rim Glow */}
        <div className="h-1 w-full bg-gradient-to-r from-teal-400 via-sky-400 to-amber-400 shrink-0" />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0d121f]/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <AegisAILogo size="xs" variant="icon-only" glow={false} />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Account & Governance Profile</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
                  VERIFIED OAUTH
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* User Identity Card */}
          <div className="p-5 rounded-2xl bg-[#111726]/90 border border-white/[0.08] relative overflow-hidden space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar with Status Ring */}
                <UserAvatar user={user} size="lg" showStatus={true} />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {user.displayName || 'Architect'}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                      <UserCheck className="w-3 h-3 text-teal-400" />
                      <span>Google Account</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    {user.email || 'user@example.com'}
                  </p>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-400 font-mono">UID:</span>
                    <code className="text-[10px] font-mono text-teal-300/90 bg-[#070b14] px-2 py-0.5 rounded border border-white/[0.06] truncate max-w-[200px]">
                      {user.uid}
                    </code>
                    <button
                      onClick={handleCopyUid}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/[0.08] transition-colors"
                      title="Copy Verified UID"
                    >
                      {copiedUid ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security Tier Badge */}
              <div className="sm:text-right space-y-1">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 font-mono">
                  <Lock className="w-3 h-3 text-teal-400" />
                  <span>Governed Vault</span>
                </span>
                <p className="text-[10px] text-slate-400">
                  Partition: SHA-256 Chained
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Governance Telemetry */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
              YOUR GOVERNANCE TELEMETRY
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div
                onClick={() => {
                  onNavigate('vault');
                  onClose();
                }}
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-teal-500/40 rounded-xl transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-400">
                  <Boxes className="w-4 h-4" />
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-lg font-extrabold text-white">
                  {stats?.activeMemoriesCount ?? 0}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Active Memories</p>
              </div>

              <div
                onClick={() => {
                  onNavigate('journal');
                  onClose();
                }}
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-teal-500/40 rounded-xl transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-400">
                  <BookOpen className="w-4 h-4" />
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-lg font-extrabold text-white">
                  {stats?.totalConversationsCount ?? 0}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Journal Threads</p>
              </div>

              <div
                onClick={() => {
                  onNavigate('privacy');
                  onClose();
                }}
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-teal-500/40 rounded-xl transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-lg font-extrabold text-white">
                  {stats?.privacyViolationsIntercepted ?? 0}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">PII Intercepted</p>
              </div>

              <div
                onClick={() => {
                  onNavigate('vault');
                  onClose();
                }}
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-amber-400/40 rounded-xl transition-all cursor-pointer group space-y-1"
              >
                <div className="flex items-center justify-between text-slate-400 group-hover:text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-lg font-extrabold text-amber-300">
                  {stats?.pendingCandidatesCount ?? 0}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Candidates</p>
              </div>
            </div>
          </div>

          {/* Quick Security & Integrity Actions */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">
              QUICK SECURITY ACTIONS
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Verify Audit Chain */}
              <button
                onClick={handleVerifyChain}
                disabled={verifyingChain}
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-teal-500/30 rounded-xl text-left transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Verify Hash Chain</span>
                    {verifyingChain && <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Verify SHA-256 cryptographic link integrity.
                  </p>
                </div>
              </button>

              {/* Export Full Vault */}
              <a
                href={api.getFullExportUrl()}
                download
                className="p-3 bg-[#111726]/80 hover:bg-[#161f33] border border-white/[0.08] hover:border-teal-500/30 rounded-xl text-left transition-all flex items-start gap-3 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:bg-sky-500/20 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Export Data Vault</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-sky-400" />
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Download full JSON backup of memories & logs.
                  </p>
                </div>
              </a>
            </div>

            {chainResult && (
              <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-xs text-teal-300 font-mono">
                {chainResult}
              </div>
            )}
          </div>

          {/* Google OAuth & Account Switcher Drawer */}
          <div className="space-y-2 pt-1 border-t border-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                GOOGLE OAUTH & IDENTITY
              </span>
              <button
                type="button"
                onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                className="text-[11px] text-teal-400 hover:text-teal-300 font-medium cursor-pointer"
              >
                {showAccountSwitcher ? 'Close Switcher' : 'Switch Google Account →'}
              </button>
            </div>

            {showAccountSwitcher && (
              <div className="p-4 bg-[#0c101c] rounded-2xl border border-white/[0.08] space-y-3 animate-in fade-in duration-200">
                <p className="text-xs text-slate-400">
                  Switch to an alternative Google account to test per-user UID isolation:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchAccount('alex.engineer@google.com', 'Alex Rivera')}
                    disabled={switching}
                    className="p-2 bg-[#111726] hover:bg-[#182238] border border-white/[0.08] hover:border-teal-500/40 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white">Alex Rivera</p>
                    <p className="text-[10px] text-teal-400 font-mono">alex.engineer@google.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchAccount('sarah.lead@google.com', 'Sarah Chen')}
                    disabled={switching}
                    className="p-2 bg-[#111726] hover:bg-[#182238] border border-white/[0.08] hover:border-teal-500/40 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <p className="text-xs font-bold text-white">Sarah Chen</p>
                    <p className="text-[10px] text-amber-300 font-mono">sarah.lead@google.com</p>
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customEmail.trim()) {
                      handleSwitchAccount(customEmail.trim(), customName.trim() || undefined);
                    }
                  }}
                  className="space-y-2 pt-2 border-t border-white/[0.06]"
                >
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="Enter custom Google email..."
                      className="flex-1 bg-[#111726] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={switching}
                      className="px-4 py-1.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {switching ? 'Switching...' : 'Switch'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Primary Prominent Logout Button */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#070a12] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Session ID: {user.uid.slice(0, 16)}...</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onNavigate('settings');
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-semibold rounded-xl border border-white/[0.08] transition-colors cursor-pointer"
            >
              Preferences
            </button>

            {/* High-Impact Logout Button */}
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              id="btn-profile-card-logout"
              className="flex-1 sm:flex-none px-5 py-2 bg-gradient-to-r from-rose-500/20 to-red-600/20 hover:from-rose-500/30 hover:to-red-600/30 text-rose-300 hover:text-rose-200 border border-rose-500/40 hover:border-rose-400/60 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sign Out of AegisAI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
