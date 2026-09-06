import React, { useState } from 'react';
import { JournalConversation } from '../types.js';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

interface ConversationsViewProps {
  conversations: JournalConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onGenerateIntelligence: (id: string) => void;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onUpdateTitle,
  onDeleteConversation,
  onGenerateIntelligence,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startEdit = (c: JournalConversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      onUpdateTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span>Journal Conversations</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              ({conversations.length} total)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Every conversation is partitioned strictly to your verified UID. Inspect transcripts, generate reflections, or manage history.
          </p>
        </div>

        <button
          onClick={onNewConversation}
          id="btn-new-conversation-threads"
          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-teal-500/15"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Thread</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter conversations by title or message content..."
          className="w-full bg-[#0d1117] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 transition-colors shadow-sm"
        />
      </div>

      {/* Conversations Grid / List */}
      {filtered.length === 0 ? (
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-12 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No matching conversations found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm ? 'Try a different search query' : 'Start your first private journal thread'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((conv) => {
            const isEditing = editingId === conv.id;
            const isActive = activeConversationId === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                className={`bg-[#0d1117] border rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-white/[0.15] shadow-lg ${
                  isActive ? 'border-teal-500/40 shadow-teal-500/5 ring-1 ring-teal-500/30' : 'border-white/[0.07]'
                }`}
              >
                <div>
                  {/* Title & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-[#161b22] text-xs text-white px-2.5 py-1.5 rounded-lg border border-teal-500/40 focus:outline-none flex-1 font-medium"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(conv.id)}
                          className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-slate-400 hover:bg-white/[0.05] rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="text-sm font-semibold text-white line-clamp-1 flex-1 tracking-tight">
                        {conv.title}
                      </h3>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(conv)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors"
                          title="Rename thread"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteConversation(conv.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Delete thread"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Metadata pill */}
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mb-3">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-teal-400/80 font-semibold">{conv.messages.length} messages</span>
                  </div>

                  {/* Message excerpt */}
                  <p className="text-xs text-slate-400 line-clamp-2 italic font-serif leading-relaxed mb-4">
                    {lastMsg ? `"${lastMsg.content.slice(0, 120)}..."` : 'No messages yet in this journal thread.'}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between gap-2">
                  <button
                    onClick={() => onGenerateIntelligence(conv.id)}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors font-medium px-2 py-1 rounded hover:bg-purple-500/10"
                    title="Generate reflection intelligence"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Intelligence</span>
                  </button>

                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-teal-500/10"
                  >
                    <span>Open in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

