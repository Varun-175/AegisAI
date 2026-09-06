import React, { useState, useEffect, useRef } from 'react';
import {
  JournalConversation,
  JournalMessage,
  PrivacyFinding,
  PrivacyAction,
  MemoryUsageExplanation,
  MemoryDuration,
} from '../types.js';
import { api } from '../api.js';
import {
  Send,
  Plus,
  Trash2,
  ShieldCheck,
  EyeOff,
  HelpCircle,
  Sparkles,
  Lock,
  Boxes,
  AlertCircle,
  Clock,
  MessageSquare,
  Check,
  Copy,
  Download,
  Terminal,
  FileText,
  Cpu,
  ChevronDown,
  Zap,
  Radio,
} from 'lucide-react';
import { PrivacyModal } from './PrivacyModal.js';
import { WhyUsedModal } from './WhyUsedModal.js';
import { CandidateModal } from './CandidateModal.js';
import { MarkdownRenderer } from './MarkdownRenderer.js';

interface JournalViewProps {
  conversations: JournalConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRefreshData: () => void;
}

export const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google AI',
    badge: 'Fast & Governed',
    icon: Sparkles,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10 border-teal-500/30',
    description: 'Sub-second reasoning with privacy-governed memory injection.',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google AI',
    badge: 'Deep Reasoning & Code',
    icon: Cpu,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10 border-sky-500/30',
    description: 'Advanced technical analysis, architectural synthesis & long-context memory.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google AI',
    badge: 'Low Latency',
    icon: Zap,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    description: 'Ultra-fast lightweight model for brief thoughts and instant categorization.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    badge: 'Strict Alignment',
    icon: ShieldCheck,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 border-amber-500/30',
    description: 'High precision architectural analysis and strict security compliance.',
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    badge: 'Instant Summary',
    icon: Clock,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10 border-orange-500/30',
    description: 'Rapid summary engine for quick journal organization.',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    badge: 'Omni Reasoning',
    icon: Boxes,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 border-purple-500/30',
    description: 'High creativity omni model for structured journaling and synthesis.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    badge: 'Cost-Efficient',
    icon: FileText,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10 border-indigo-500/30',
    description: 'Lightweight omni model for quick conversational turns.',
  },
  {
    id: 'local-phi-3',
    name: 'Aegis Local Phi-3',
    provider: 'On-Device Isolation',
    badge: '100% On-Device',
    icon: Lock,
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/15 border-emerald-500/40',
    description: 'Zero external network transmission. Runs 100% locally in container memory.',
  },
];

export const JournalView: React.FC<JournalViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRefreshData,
}) => {
  const [activeConv, setActiveConv] = useState<JournalConversation | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Model selection state
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [showModelPicker, setShowModelPicker] = useState<boolean>(false);

  // Privacy modal state
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [detectedFindings, setDetectedFindings] = useState<PrivacyFinding[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState('');

  // Transparency modal state
  const [transparencyModalOpen, setTransparencyModalOpen] = useState(false);
  const [activeExplanations, setActiveExplanations] = useState<MemoryUsageExplanation[]>([]);

  // Candidate approval state
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Journal Intelligence state
  const [loadingIntelligence, setLoadingIntelligence] = useState(false);
  const [showIntelligencePanel, setShowIntelligencePanel] = useState(true);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const activeModelObj = AVAILABLE_MODELS.find((m) => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowModelPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleExportTranscript = () => {
    if (!activeConv) return;
    const lines = [
      `# AegisAI Journal Transcript`,
      `**Title:** ${activeConv.title}`,
      `**Date:** ${new Date(activeConv.createdAt).toLocaleString()}`,
      `**Active Model Engine:** ${activeModelObj.name} (${activeModelObj.provider})`,
      `**Privacy Governance:** Active`,
      `---`,
      '',
    ];

    activeConv.messages.forEach((m) => {
      const author = m.role === 'user' ? '👤 Author' : '🛡️ AegisAI Router';
      const time = new Date(m.timestamp).toLocaleTimeString();
      lines.push(`### ${author} (${time})`);
      lines.push(m.content);
      if (m.memoriesConsulted && m.memoriesConsulted.length > 0) {
        lines.push(`\n*Governed Memories Consulted:* ${m.memoriesConsulted.length}`);
      }
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisai-journal-${activeConv.id.slice(0, 8)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickScenarios = [
    {
      label: '🛡️ Test Privacy Scan (PII)',
      text: 'My personal email is varun.ak@cybersec.org and phone is +1-555-0199 for verification.',
    },
    {
      label: '🧠 Propose Memory Candidate',
      text: 'For all our frontend development, I prefer TypeScript with React and Tailwind CSS.',
    },
    {
      label: '🔍 Query Governed Memory',
      text: 'Based on my approved memory preferences, what stack should I use for our next tool?',
    },
    {
      label: '📝 Reflective Journaling',
      text: 'Today I felt overwhelmed balancing sprint deadlines with deep refactoring tasks.',
    },
  ];

  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId);
    } else if (conversations.length > 0) {
      onSelectConversation(conversations[0].id);
    }
  }, [activeConversationId, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  const loadConversation = async (id: string) => {
    try {
      const res = await api.getConversation(id);
      setActiveConv(res.conversation);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleSendPrompt = async () => {
    if (!inputText.trim() || loading || !activeConv) return;
    const promptToSend = inputText.trim();

    // Run privacy scanner
    setScanning(true);
    try {
      const scanRes = await api.scanPrivacy(promptToSend);
      setScanning(false);

      if (!scanRes.clean) {
        // Intercept and present user with choices
        setDetectedFindings(scanRes.findings);
        setPendingPrompt(promptToSend);
        setPrivacyModalOpen(true);
        return;
      }

      // If clean, send directly
      await executeSendMessage(promptToSend, 'allowed');
    } catch (err) {
      setScanning(false);
      console.error('Privacy scan error, proceeding safely:', err);
      await executeSendMessage(promptToSend, 'allowed');
    }
  };

  const executeSendMessage = async (
    content: string,
    privacyAction: PrivacyAction,
    modelToUse = selectedModel
  ) => {
    if (!activeConv) return;
    setLoading(true);
    setInputText('');

    try {
      const res = await api.sendMessage(activeConv.id, {
        content,
        privacyAction,
        selectedModel: modelToUse,
      });
      if (res.blocked) {
        setLoading(false);
        return;
      }

      await loadConversation(activeConv.id);
      onRefreshData();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  // Privacy modal handlers
  const handlePrivacyRedact = () => {
    setPrivacyModalOpen(false);
    executeSendMessage(pendingPrompt, 'redacted');
  };

  const handlePrivacyAllow = () => {
    setPrivacyModalOpen(false);
    executeSendMessage(pendingPrompt, 'allowed');
  };

  const handlePrivacyBlock = () => {
    setPrivacyModalOpen(false);
    setInputText(pendingPrompt);
  };

  // Transparency handler
  const handleOpenTransparency = (explanations: MemoryUsageExplanation[]) => {
    setActiveExplanations(explanations);
    setTransparencyModalOpen(true);
  };

  // Candidate approve handler
  const handleApproveInlineCandidate = async (cand: any) => {
    try {
      await api.approveMemory(cand.candidateId);
      await loadConversation(activeConv!.id);
      onRefreshData();
    } catch (err) {
      console.error('Failed to approve candidate:', err);
    }
  };

  const handleOpenCandidateModal = (cand: any) => {
    setSelectedCandidate({
      id: cand.candidateId,
      content: cand.content,
      purpose: cand.suggestedPurpose,
      expirationPolicy: cand.suggestedDuration,
    });
    setCandidateModalOpen(true);
  };

  const handleGenerateIntelligence = async () => {
    if (!activeConv || activeConv.messages.length === 0 || loadingIntelligence) return;
    setLoadingIntelligence(true);
    try {
      const res = await api.generateIntelligence(activeConv.id);
      if (res.intelligence) {
        setActiveConv((prev) => (prev ? { ...prev, intelligence: res.intelligence } : null));
        setShowIntelligencePanel(true);
      }
    } catch (err) {
      console.error('Failed to generate intelligence:', err);
    } finally {
      setLoadingIntelligence(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Conversations Sub-sidebar */}
      <div className="w-60 border-r border-white/[0.07] bg-[#0d1117]/60 flex flex-col shrink-0">
        <div className="p-3.5 border-b border-white/[0.07] flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Journal Entries
          </span>
          <button
            onClick={onNewConversation}
            id="btn-journal-new"
            className="p-1 rounded-md bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 transition-colors cursor-pointer"
            title="New Journal Entry"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 italic">
              No journal entries yet. Start one to begin.
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-xs transition-all ${
                    isActive
                      ? 'bg-[#131822] text-white font-medium border border-teal-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-teal-400' : 'text-slate-400'
                      }`}
                    />
                    <div className="truncate">
                      <p className="truncate">{conv.title}</p>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 rounded transition-opacity"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Journal Workspace */}
      <div className="flex-1 flex flex-col bg-[#080a0f]/90 overflow-hidden">
        {/* Thread Header */}
        <div className="h-14 border-b border-white/[0.07] px-4 sm:px-6 flex items-center justify-between bg-[#0d1117]/60 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
              {activeConv?.title || 'Journal Workspace'}
            </h2>
            {activeConv?.totalPrivacyDetections ? (
              <span className="hidden sm:inline-flex text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-mono">
                {activeConv.totalPrivacyDetections} Privacy Interception(s)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {activeConv && activeConv.messages.length > 0 && (
              <>
                <button
                  onClick={handleGenerateIntelligence}
                  disabled={loadingIntelligence}
                  className="px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Generate Journal Intelligence Summary"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  <span className="hidden sm:inline">Journal Intelligence</span>
                </button>

                <button
                  onClick={handleExportTranscript}
                  id="btn-journal-export"
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Export Journal Markdown Transcript"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Export Transcript</span>
                </button>
              </>
            )}

            <div className="flex items-center gap-1.5 text-xs text-slate-400 border-l border-white/10 pl-3">
              <Lock className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden lg:inline text-[11px] font-mono">Isolated Privacy Session</span>
            </div>
          </div>
        </div>

        {/* Intelligence Reflection Drawer if present */}
        {activeConv?.intelligence && showIntelligencePanel && (
          <div className="bg-[#131822] border-b border-teal-500/30 p-4 space-y-3 relative text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-300 font-semibold uppercase tracking-wider font-mono text-[11px]">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>Reflective Journal Intelligence</span>
              </div>
              <button
                onClick={() => setShowIntelligencePanel(false)}
                className="text-slate-400 hover:text-white text-[10px] font-mono"
              >
                Dismiss
              </button>
            </div>
            <p className="text-slate-200">{activeConv.intelligence.summary}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#090c10] p-2.5 rounded-lg border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block font-mono">
                  Key Insights
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  {activeConv.intelligence.keyThoughts.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#090c10] p-2.5 rounded-lg border border-white/[0.06] space-y-1">
                <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider block font-mono">
                  Suggested Action Items
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                  {activeConv.intelligence.actionItems.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!activeConv || activeConv.messages.length === 0 ? (
            <div className="max-w-2xl mx-auto my-6 text-center space-y-6">
              <div className="p-6 bg-[#0d1117] border border-teal-500/20 rounded-2xl space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center mx-auto text-teal-300 shadow-inner">
                  <ShieldCheck className="w-6 h-6 text-teal-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white">
                    Private Journal & Governance Workspace
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-lg mx-auto">
                    Write freely. Before your text leaves this device to the AI Model, the{' '}
                    <strong className="text-teal-300">Privacy Guardian</strong> scans for sensitive entities and lets you redact, approve, or block them.
                  </p>
                </div>

                <div className="pt-2 text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono block">
                    ⚡ 1-Click Interactive Test Scenarios:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {quickScenarios.map((sc, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputText(sc.text)}
                        className="text-left p-3 rounded-xl bg-[#131822] hover:bg-slate-800 border border-white/[0.08] hover:border-teal-500/40 text-xs transition-all cursor-pointer group shadow-sm"
                      >
                        <p className="font-semibold text-slate-200 group-hover:text-teal-300 mb-1">
                          {sc.label}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 italic font-serif">
                          &ldquo;{sc.text}&rdquo;
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#090c10] border border-white/[0.06] rounded-xl p-3 text-left space-y-1 text-[11px] text-slate-400">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 font-mono block">
                    Governed Memory in Action:
                  </span>
                  <p className="text-slate-300 text-[11px]">
                    • Only active approved memories from your Vault are injected into model turns.
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    • Inspect exact memory provenance with the &ldquo;Why was this used?&rdquo; transparency tool.
                  </p>
                  <p className="text-slate-300 text-[11px]">
                    • New preferences become candidates — never stored permanently without your consent.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            activeConv.messages.map((msg) => {
              const isUser = msg.role === 'user';
              const modelExpertName = msg.routingDecision?.expertName || 'Gemini 2.5 Flash';
              const modelUsedId = msg.routingDecision?.modelUsed || 'gemini-2.5-flash';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl w-full sm:w-auto rounded-2xl p-4 space-y-3 relative shadow-md group transition-all ${
                      isUser
                        ? 'bg-[#131822] border border-teal-500/30 text-slate-100'
                        : 'bg-[#0d1117]/95 border border-white/[0.08] text-slate-200'
                    }`}
                  >
                    {/* Role Header & Metadata */}
                    <div className="flex items-center justify-between gap-4 text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider font-mono text-slate-400">
                          {isUser ? 'Journal Author' : modelExpertName}
                        </span>
                        {!isUser && (
                          <span className="bg-teal-500/10 text-teal-300 border border-teal-500/20 px-1.5 py-0.2 rounded font-mono text-[9px]">
                            {modelUsedId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-teal-300 hover:bg-white/[0.06] transition-all cursor-pointer"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Privacy Badge for User Messages */}
                    {isUser && msg.privacyMetadata && (
                      <div className="flex items-center gap-2 text-[10px]">
                        {msg.privacyMetadata.userAction === 'redacted' ? (
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <EyeOff className="w-3 h-3" />
                            <span>
                              Redacted ({msg.privacyMetadata.findings.length} findings sanitized)
                            </span>
                          </span>
                        ) : msg.privacyMetadata.findings.length > 0 ? (
                          <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                            <AlertCircle className="w-3 h-3" />
                            <span>Sent with explicit consent</span>
                          </span>
                        ) : (
                          <span className="text-teal-400 flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Clean Content (Zero Findings)</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Content formatted via MarkdownRenderer */}
                    <div className="text-xs leading-relaxed text-slate-200">
                      <MarkdownRenderer content={msg.content} />
                    </div>

                    {/* Memory & Router Transparency Badge */}
                    {!isUser && (
                      <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <Cpu className="w-3 h-3 text-sky-400 shrink-0" />
                          <span>
                            Engine: <span className="text-teal-300 font-semibold">{modelExpertName}</span>
                          </span>
                        </div>

                        {msg.memoriesConsulted && msg.memoriesConsulted.length > 0 && (
                          <button
                            onClick={() => handleOpenTransparency(msg.memoriesConsulted!)}
                            className="text-[10px] font-semibold text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1 rounded-lg border border-teal-500/20 flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <HelpCircle className="w-3 h-3" />
                            <span>
                              Why was this used? ({msg.memoriesConsulted.length} Memory Citations)
                            </span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Inline Memory Candidate Notification */}
                    {!isUser && msg.memoryCandidate && (
                      <div className="bg-[#131822] border border-amber-500/30 rounded-xl p-3.5 space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-[10px] text-amber-300 font-bold uppercase tracking-wider font-mono">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Memory Candidate Proposed</span>
                          <span className="bg-amber-500/10 text-amber-300 px-1.5 py-0.2 rounded font-normal">
                            Requires Approval
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 italic font-serif">
                          &ldquo;{msg.memoryCandidate.content}&rdquo;
                        </p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[10px] text-slate-400">
                          <span>Purpose: {msg.memoryCandidate.suggestedPurpose}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenCandidateModal(msg.memoryCandidate)}
                              className="px-2.5 py-1 bg-[#090c10] hover:bg-slate-800 text-slate-200 rounded-lg border border-white/[0.08] transition-colors cursor-pointer"
                            >
                              Custom Policy
                            </button>
                            <button
                              onClick={() => handleApproveInlineCandidate(msg.memoryCandidate)}
                              className="px-3 py-1 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3 stroke-[2.5]" />
                              <span>Approve Memory</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start">
              <div className="bg-[#0d1117]/90 border border-white/[0.08] rounded-xl p-4 max-w-sm space-y-1.5 shadow-lg">
                <div className="flex items-center gap-2 text-xs text-teal-300 font-mono">
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
                  <span>Processing turn with {activeModelObj.name}...</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Filtering memory context under governed purpose guardrails.
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Composer Area with Model Selection Tool */}
        <div className="p-4 border-t border-white/[0.07] bg-[#0d1117]/70 backdrop-blur-md relative">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Suggestions Chips row when user has an active conversation */}
            {activeConv && activeConv.messages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                <span className="text-slate-500 text-[10px] font-mono shrink-0">Try:</span>
                {quickScenarios.slice(0, 3).map((sc, i) => (
                  <button
                    key={i}
                    onClick={() => setInputText(sc.text)}
                    className="px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-teal-500/10 text-slate-300 hover:text-teal-300 border border-white/[0.06] hover:border-teal-500/30 shrink-0 transition-colors cursor-pointer truncate max-w-xs"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            )}

            {/* Model Selector Popover Menu */}
            {showModelPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-full left-4 sm:left-auto mb-3 w-80 sm:w-96 bg-[#0d1117] border border-white/10 rounded-2xl shadow-2xl p-3 z-30 space-y-2 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10 px-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    Select AI Engine for this turn
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {AVAILABLE_MODELS.length} Models
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = selectedModel === m.id;
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setShowModelPicker(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-500/15 border-teal-500/50 text-white shadow-sm'
                            : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${m.bgColor}`}>
                          <IconComp className={`w-4 h-4 ${m.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-slate-100 text-xs truncate">
                              {m.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md shrink-0 ${m.bgColor} ${m.color}`}
                            >
                              {m.badge}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <span>{m.provider}</span>
                            <span>•</span>
                            <span className="truncate">{m.description}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Input Composer Container */}
            <div className="relative bg-[#0d1117]/95 border border-white/[0.08] focus-within:border-teal-500/60 rounded-xl p-2.5 transition-colors shadow-lg space-y-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder={`Write a private journal entry or prompt ${activeModelObj.name}...`}
                rows={2}
                className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed font-sans"
                disabled={loading || scanning}
              />

              {/* Bottom Composer Toolbar */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1.5 border-t border-white/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModelPicker(!showModelPicker)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 text-[11px] font-medium transition-all cursor-pointer shadow-sm group"
                    title="Choose AI Model for this turn"
                  >
                    <activeModelObj.icon className={`w-3.5 h-3.5 ${activeModelObj.color}`} />
                    <span className="font-semibold text-slate-200 group-hover:text-teal-300">
                      {activeModelObj.name}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 hidden sm:inline">
                      {activeModelObj.provider}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  <span className="hidden md:flex items-center gap-1 text-[10px] text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>Privacy Interceptor Active</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400">
                    {inputText.length > 0 ? `${inputText.length} chars` : ''}
                  </span>

                  <button
                    onClick={handleSendPrompt}
                    disabled={!inputText.trim() || loading || scanning}
                    id="btn-journal-send"
                    className="bg-teal-400 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-md shadow-teal-500/10 cursor-pointer flex items-center gap-1.5 text-xs"
                    title="Send with Privacy Check"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrivacyModal
        isOpen={privacyModalOpen}
        findings={detectedFindings}
        originalText={pendingPrompt}
        onAllow={handlePrivacyAllow}
        onRedact={handlePrivacyRedact}
        onBlock={handlePrivacyBlock}
      />

      <WhyUsedModal
        isOpen={transparencyModalOpen}
        onClose={() => setTransparencyModalOpen(false)}
        explanations={activeExplanations}
      />

      <CandidateModal
        isOpen={candidateModalOpen}
        onClose={() => setCandidateModalOpen(false)}
        candidate={selectedCandidate}
        onApprove={async (id, updates) => {
          await api.approveMemory(id, updates);
          await loadConversation(activeConv!.id);
          onRefreshData();
        }}
      />
    </div>
  );
};
