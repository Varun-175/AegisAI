import React, { useState, useEffect } from 'react';
import { NavTab } from './types.js';
import { Sidebar } from './components/Sidebar.js';
import { Header } from './components/Header.js';
import { DashboardView } from './components/DashboardView.js';
import { JournalView } from './components/JournalView.js';
import { ConversationsView } from './components/ConversationsView.js';
import { MemoryVaultView } from './components/MemoryVaultView.js';
import { PrivacyGuardianView } from './components/PrivacyGuardianView.js';
import { PolicyView } from './components/PolicyView.js';
import { PrivacyTestbenchView } from './components/PrivacyTestbenchView.js';
import { InsightsView } from './components/InsightsView.js';
import { SecurityView } from './components/SecurityView.js';
import { SettingsView } from './components/SettingsView.js';
import { CommandPalette } from './components/CommandPalette.js';
import { AuthScreen } from './components/AuthScreen.js';
import { ProfileModal } from './components/ProfileModal.js';
import { APIKeysModal } from './components/APIKeysModal.js';
import { api } from './api.js';
import {
  UserProfile,
  GovernanceStats,
  Memory,
  JournalConversation,
  MemoryDuration,
} from './types.js';
import { Shield, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [candidates, setCandidates] = useState<Memory[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [conversations, setConversations] = useState<JournalConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [apiKeysModalOpen, setApiKeysModalOpen] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    initApp();

    // Global Cmd+K / Ctrl+K keyboard shortcut listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initApp = async () => {
    setAuthChecking(true);
    try {
      // 1. Authenticate / verify session
      const sessionRes = await api.getSession();
      if (sessionRes?.user) {
        setUser(sessionRes.user);
        // 2. Load core user state
        await refreshState();
      } else {
        setUser(null);
      }
    } catch (err) {
      // Unauthenticated state
      setUser(null);
    } finally {
      setAuthChecking(false);
      setInitialLoaded(true);
    }
  };

  const handleLoginSuccess = async (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setAuthChecking(false);
    await refreshState();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setStats(null);
      setCandidates([]);
      setMemories([]);
      setConversations([]);
      setActiveConvId(null);
    }
  };

  const refreshState = async () => {
    try {
      const [statsRes, candRes, memRes, convRes] = await Promise.all([
        api.getStats(),
        api.getCandidates(),
        api.getMemories('all'),
        api.getConversations(),
      ]);

      setStats(statsRes);
      setCandidates(candRes.candidates);
      setMemories(memRes.memories);
      setConversations(convRes.conversations);

      if (!activeConvId && convRes.conversations.length > 0) {
        setActiveConvId(convRes.conversations[0].id);
      }
    } catch (err) {
      console.error('Error refreshing state:', err);
    }
  };

  const handleNewJournalEntry = async () => {
    try {
      const res = await api.createConversation();
      setConversations((prev) => [res.conversation, ...prev]);
      setActiveConvId(res.conversation.id);
      setCurrentTab('journal');
      await refreshState();
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await api.deleteConversation(id);
      const remaining = conversations.filter((c) => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
      }
      await refreshState();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleUpdateConversationTitle = async (id: string, newTitle: string) => {
    try {
      const res = await api.updateConversationTitle(id, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: res.conversation.title } : c))
      );
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  const handleGenerateIntelligence = async (id: string) => {
    try {
      await api.generateIntelligence(id);
      setCurrentTab('insights');
    } catch (err) {
      console.error('Failed to generate intelligence:', err);
    }
  };

  const handleApproveCandidate = async (
    id: string,
    updates?: { purpose?: string; expirationPolicy?: MemoryDuration }
  ) => {
    try {
      await api.approveMemory(id, updates);
      await refreshState();
    } catch (err) {
      console.error('Failed to approve candidate:', err);
    }
  };

  const handleIgnoreCandidate = async (id: string) => {
    try {
      await api.deleteMemory(id);
      await refreshState();
    } catch (err) {
      console.error('Failed to ignore candidate:', err);
    }
  };

  const handlePurgeComplete = async () => {
    setActiveConvId(null);
    await refreshState();
    setCurrentTab('dashboard');
  };

  // 1. Initial Session Verification Screen
  if (authChecking && !initialLoaded) {
    return (
      <div className="h-screen w-screen bg-[#080a0f] bg-ambient-grid flex flex-col items-center justify-center space-y-4 select-none">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-sky-500/10 border border-teal-500/30 flex items-center justify-center shadow-lg shadow-teal-500/10">
          <Shield className="w-6 h-6 text-teal-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
          <span>Restoring secure governance session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated Public Gateway Screen
  if (!user) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 3. Authenticated Private Control Plane Shell
  return (
    <div className="h-screen w-screen flex bg-[#080a0f] bg-ambient-grid font-sans text-slate-200 overflow-hidden select-none">
      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(tab) => setCurrentTab(tab)}
        onNewJournalEntry={handleNewJournalEntry}
        onExportData={() => {
          window.location.href = api.getFullExportUrl();
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        user={user}
        pendingCandidatesCount={candidates.length}
        onOpenAuthModal={() => setProfileModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#080a0f]/80 backdrop-blur-sm">
        {/* Header Bar */}
        <Header
          currentTab={currentTab}
          stats={stats}
          user={user}
          onNewJournalEntry={handleNewJournalEntry}
          onOpenAuditLogs={() => setCurrentTab('security')}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenAuthModal={() => setProfileModalOpen(true)}
          onOpenAPIKeys={() => setApiKeysModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic View Display */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              candidates={candidates}
              onApproveCandidate={handleApproveCandidate}
              onIgnoreCandidate={handleIgnoreCandidate}
              onNavigate={(tab) => setCurrentTab(tab)}
              onNewJournalEntry={handleNewJournalEntry}
            />
          )}

          {currentTab === 'journal' && (
            <JournalView
              conversations={conversations}
              activeConversationId={activeConvId}
              onSelectConversation={(id) => setActiveConvId(id)}
              onNewConversation={handleNewJournalEntry}
              onDeleteConversation={handleDeleteConversation}
              onRefreshData={refreshState}
            />
          )}

          {currentTab === 'conversations' && (
            <ConversationsView
              conversations={conversations}
              activeConversationId={activeConvId}
              onSelectConversation={(id) => {
                setActiveConvId(id);
                setCurrentTab('journal');
              }}
              onNewConversation={handleNewJournalEntry}
              onUpdateTitle={handleUpdateConversationTitle}
              onDeleteConversation={handleDeleteConversation}
              onGenerateIntelligence={handleGenerateIntelligence}
            />
          )}

          {currentTab === 'vault' && (
            <MemoryVaultView
              memories={memories}
              onRefresh={refreshState}
            />
          )}

          {currentTab === 'privacy' && <PrivacyGuardianView />}

          {currentTab === 'policies' && <PolicyView onNavigateToTab={(tab) => setCurrentTab(tab)} />}

          {currentTab === 'testbench' && <PrivacyTestbenchView />}

          {currentTab === 'insights' && <InsightsView />}

          {currentTab === 'security' && (
            <SecurityView
              user={user}
              onRefreshUser={initApp}
              onLogout={handleLogout}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView onPurgeSuccess={handlePurgeComplete} />
          )}
        </div>
      </main>

      {/* User Profile & Security Card Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        stats={stats}
        onNavigate={(tab) => setCurrentTab(tab)}
        onRefreshUser={initApp}
        onLogout={handleLogout}
      />

      {/* API Keys & Provider Connection Modal */}
      <APIKeysModal
        isOpen={apiKeysModalOpen}
        onClose={() => setApiKeysModalOpen(false)}
      />
    </div>
  );
}
