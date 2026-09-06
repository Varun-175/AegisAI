import React, { useState } from 'react';
import { UserProfile, NavTab } from '../types.js';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Boxes,
  Sparkles,
  ShieldCheck,
  FlaskConical,
  Scale,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cpu,
} from 'lucide-react';
import { AegisAILogo } from './AegisAILogo.js';
import { UserAvatar } from './UserAvatar.js';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: UserProfile | null;
  pendingCandidatesCount: number;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  user,
  pendingCandidatesCount,
  onOpenAuthModal,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups: {
    title: string;
    items: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[];
  }[] = [
    {
      title: 'WORKSPACE',
      items: [
        {
          id: 'dashboard',
          label: 'Trust Center',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'journal',
          label: 'AI Journal & Experts',
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          id: 'conversations',
          label: 'Conversations',
          icon: <MessageSquare className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'MEMORY GOVERNANCE',
      items: [
        {
          id: 'vault',
          label: 'Memory Vault',
          icon: <Boxes className="w-4 h-4" />,
          badge: pendingCandidatesCount > 0 ? pendingCandidatesCount : undefined,
        },
        {
          id: 'insights',
          label: 'Insights & Reflection',
          icon: <Sparkles className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'GOVERNANCE & POLICY',
      items: [
        {
          id: 'policies',
          label: 'Policy Engine',
          icon: <Scale className="w-4 h-4" />,
        },
        {
          id: 'privacy',
          label: 'Privacy Firewall',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          id: 'testbench',
          label: 'Privacy Testbench',
          icon: <FlaskConical className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'SECURITY & CONTROL',
      items: [
        {
          id: 'security',
          label: 'Audit Ledger',
          icon: <Activity className="w-4 h-4" />,
        },
        {
          id: 'settings',
          label: 'Preferences',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`border-r border-white/[0.08] bg-[#090d16]/95 backdrop-blur-2xl flex flex-col shrink-0 select-none transition-all duration-300 z-30 shadow-2xl relative ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 border-b border-white/[0.08] flex items-center ${
          collapsed ? 'px-2 justify-center relative' : 'px-4 justify-between'
        }`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center justify-center gap-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="p-1 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-center shrink-0"
              title="AegisAI — Governance Plane"
            >
              <AegisAILogo size="sm" variant="icon-only" glow={true} />
            </button>
            <button
              onClick={() => setCollapsed(false)}
              className="p-0.5 text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
              title="Expand sidebar"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group min-w-0"
              title="AegisAI — AI Governance Plane"
            >
              <div className="shrink-0">
                <AegisAILogo size="sm" variant="icon-only" glow={true} />
              </div>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold tracking-tight text-white font-sans">
                    Aegis<span className="text-teal-400 font-semibold">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  AI Governance Plane
                </span>
              </div>
            </div>

            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Navigation List grouped by Category */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1.5 block font-mono">
                {group.title}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center cursor-pointer ${
                    collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } text-xs font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`transition-colors shrink-0 ${
                        isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 shadow-sm shrink-0">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Account & Profile Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#060911]/90">
        <div
          className={`flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div
            onClick={onOpenAuthModal}
            className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
            title="Open Profile & Governance Card"
          >
            <UserAvatar user={user} size="md" showStatus={true} />

            {!collapsed && (
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-xs font-semibold text-slate-200 truncate hover:text-teal-300 transition-colors">
                  {user?.displayName || 'User Workspace'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'Protected Session'}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              {onLogout && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  id="btn-sidebar-quick-logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onOpenAuthModal}
                className="p-1 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                title="Profile Options"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
