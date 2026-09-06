import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  PlusCircle,
  Boxes,
  ShieldCheck,
  FlaskConical,
  Sparkles,
  Activity,
  Settings,
  Download,
  Trash2,
  X,
  ArrowRight,
  Command,
} from 'lucide-react';
import { NavTab } from '../types.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  onNewJournalEntry: () => void;
  onExportData: () => void;
}

interface PaletteCommand {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onNewJournalEntry,
  onExportData,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: PaletteCommand[] = [
    {
      id: 'new-entry',
      label: 'New Journal Entry',
      category: 'Actions',
      icon: <PlusCircle className="w-4 h-4 text-sky-400" />,
      shortcut: 'N',
      action: () => {
        onNewJournalEntry();
        onClose();
      },
    },
    {
      id: 'go-dashboard',
      label: 'Open AI Trust Center (Overview)',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      shortcut: 'G O',
      action: () => {
        onNavigate('dashboard');
        onClose();
      },
    },
    {
      id: 'go-journal',
      label: 'Open Journal Workspace',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      shortcut: 'G J',
      action: () => {
        onNavigate('journal');
        onClose();
      },
    },
    {
      id: 'go-conversations',
      label: 'Browse Conversations & Threads',
      category: 'Navigation',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      shortcut: 'G C',
      action: () => {
        onNavigate('conversations');
        onClose();
      },
    },
    {
      id: 'go-vault',
      label: 'Open Memory Vault & Candidates',
      category: 'Navigation',
      icon: <Boxes className="w-4 h-4 text-amber-400" />,
      shortcut: 'G V',
      action: () => {
        onNavigate('vault');
        onClose();
      },
    },
    {
      id: 'go-privacy',
      label: 'Open Privacy Guardian',
      category: 'Navigation',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      shortcut: 'G P',
      action: () => {
        onNavigate('privacy');
        onClose();
      },
    },
    {
      id: 'go-testbench',
      label: 'Open Privacy Testbench',
      category: 'Navigation',
      icon: <FlaskConical className="w-4 h-4 text-cyan-400" />,
      shortcut: 'G T',
      action: () => {
        onNavigate('testbench');
        onClose();
      },
    },
    {
      id: 'go-insights',
      label: 'Open Insights & Reflection Intelligence',
      category: 'Navigation',
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
      shortcut: 'G I',
      action: () => {
        onNavigate('insights');
        onClose();
      },
    },
    {
      id: 'go-security',
      label: 'Open Security & Cryptographic Audit Trail',
      category: 'Navigation',
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      shortcut: 'G S',
      action: () => {
        onNavigate('security');
        onClose();
      },
    },
    {
      id: 'go-settings',
      label: 'Open Settings & Governance Controls',
      category: 'Navigation',
      icon: <Settings className="w-4 h-4 text-slate-400" />,
      shortcut: 'G ,',
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },
    {
      id: 'export-data',
      label: 'Export Full Personal Archive (JSON)',
      category: 'Data Portability',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      shortcut: 'E',
      action: () => {
        onExportData();
        onClose();
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl shadow-slate-950 overflow-hidden flex flex-col">
        {/* Command Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search AegisAI..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching commands found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 text-white'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="p-1 rounded bg-slate-800/80 border border-slate-700/50">
                      {cmd.icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{cmd.label}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cmd.shortcut && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-sky-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with &uarr; &darr;</span>
          <span>Press Enter to select • Esc to close</span>
        </div>
      </div>
    </div>
  );
};
