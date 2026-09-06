import React, { useState } from 'react';
import { NavTab, GovernanceStats, UserProfile } from '../types.js';
import {
  Plus,
  Command,
  Search,
  Bell,
  Shield,
  LogOut,
  ChevronDown,
  Cloud,
  CheckCircle2,
  Lock,
  ExternalLink,
  Server,
  Layers,
  Key,
} from 'lucide-react';
import { AegisAILogo } from './AegisAILogo.js';
import { UserAvatar } from './UserAvatar.js';

interface HeaderProps {
  currentTab: NavTab;
  stats: GovernanceStats | null;
  user?: UserProfile | null;
  onNewJournalEntry: () => void;
  onOpenAuditLogs: () => void;
  onOpenCommandPalette: () => void;
  onOpenAuthModal?: () => void;
  onOpenAPIKeys?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  stats,
  user,
  onNewJournalEntry,
  onOpenAuditLogs,
  onOpenCommandPalette,
  onOpenAuthModal,
  onOpenAPIKeys,
  onLogout,
}) => {
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const titles: Record<NavTab, string> = {
    dashboard: 'Trust Center',
    journal: 'Journal',
    conversations: 'Conversations',
    vault: 'Memory Vault',
    privacy: 'Privacy Guardian',
    testbench: 'Privacy Testbench',
    insights: 'Insights & Reflection',
    security: 'Security & Audit',
    policies: 'Policy Engine',
    settings: 'Preferences',
  };

  const pendingCount = stats?.pendingCandidatesCount || 0;

  return (
    <header className="h-16 border-b border-white/[0.08] flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#090d16]/90 backdrop-blur-2xl shrink-0 z-20 select-none">
      {/* Left: Google Cloud Project Selector & Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Google Cloud Project Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            id="btn-header-project-selector"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111724] hover:bg-[#162032] border border-white/[0.08] hover:border-teal-500/40 text-xs text-slate-200 transition-all cursor-pointer group shadow-sm"
            title="Google Cloud Project & Runtime Context"
          >
            <div className="w-4 h-4 rounded-md bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-[10px] font-bold text-teal-300">
              <Cloud className="w-2.5 h-2.5" />
            </div>
            <span className="font-mono text-xs font-semibold text-slate-200 group-hover:text-teal-300 transition-colors truncate max-w-[130px] sm:max-w-[180px]">
              aegis-ai-prod
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200 transition-transform duration-150" />
          </button>

          {/* Project Details Dropdown */}
          {showProjectMenu && (
            <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl bg-[#0d121c] border border-white/[0.1] shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  GCP Runtime Context
                </span>
                <span className="text-[9px] font-mono text-teal-300 bg-teal-500/15 px-2 py-0.5 rounded-full border border-teal-500/30">
                  Cloud Run
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Project ID:</span>
                  <span className="font-mono text-slate-200">aegis-ai-apac-2026</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Region:</span>
                  <span className="font-mono text-slate-200">asia-southeast1</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-slate-400">Model Engine:</span>
                  <span className="font-mono text-purple-300">gemini-2.5-flash</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Secret Manager:</span>
                  <span className="font-mono text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Synchronized
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowProjectMenu(false)}
                className="w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11px] text-slate-300 text-center font-medium transition-colors"
              >
                Close Inspector
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />

        {/* Current View Title */}
        <h1 className="text-sm sm:text-base font-semibold tracking-tight text-white font-display truncate">
          {titles[currentTab] || 'Trust Center'}
        </h1>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[10px] font-mono text-teal-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
          <span>Privacy Boundary Active</span>
        </div>
      </div>

      {/* Right: Omnibar Search, Notifications, Primary Action, Profile Card */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Universal Search Bar Trigger */}
        <button
          onClick={onOpenCommandPalette}
          id="btn-header-command-palette"
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-[#111724]/90 border border-white/[0.08] text-xs text-slate-400 hover:text-slate-200 hover:border-teal-500/30 transition-all shadow-inner w-56 lg:w-72 justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 transition-colors shrink-0" />
            <span className="text-slate-400 text-xs truncate">Search memories, journals...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/[0.06] rounded border border-white/[0.08] shrink-0">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        {/* API Keys Connection Button */}
        <button
          onClick={onOpenAPIKeys}
          id="btn-header-api-keys"
          className="p-2 rounded-xl text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 border border-teal-500/20 hover:border-teal-500/40 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Connect & Test API Keys"
        >
          <Key className="w-4 h-4" />
          <span className="hidden xl:inline">API Keys</span>
        </button>

        {/* Notifications / Activity Bell */}
        <button
          onClick={onOpenAuditLogs}
          id="btn-header-notifications"
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all cursor-pointer"
          title="Security & Audit Notifications"
        >
          <Bell className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#090d16]" />
          )}
        </button>

        {/* Primary Action Button: New Entry */}
        <button
          onClick={onNewJournalEntry}
          id="btn-header-new-entry"
          className="bg-gradient-to-r from-teal-400 to-teal-300 hover:from-teal-300 hover:to-teal-200 text-slate-950 text-xs font-bold px-3.5 sm:px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Entry</span>
        </button>

        {/* User Profile Avatar Card Trigger */}
        <button
          onClick={onOpenAuthModal}
          id="btn-header-profile"
          className="p-1 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-teal-500/30 transition-all cursor-pointer shrink-0 ml-0.5 flex items-center gap-2 group"
          title="Open Profile & Governance Card"
        >
          <UserAvatar user={user} size="md" showStatus={true} />
        </button>
      </div>
    </header>
  );
};
