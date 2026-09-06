import React from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Parse lines into blocks
  const parseBlocks = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeLines: string[] = [];
    let blockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block start/end
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Finish code block
          const codeString = codeLines.join('\n');
          const currentIdx = blockIndex++;
          elements.push(
            <div
              key={`code-${currentIdx}`}
              className="my-3 rounded-xl overflow-hidden bg-[#070a12] border border-white/[0.08] shadow-lg font-mono text-[11px]"
            >
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#0f1422] border-b border-white/[0.06] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-[10px] font-semibold text-slate-300 uppercase">
                    {codeLanguage || 'code'}
                  </span>
                </div>
                <button
                  onClick={() => copyCode(codeString, currentIdx)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-teal-300 transition-colors px-2 py-0.5 rounded hover:bg-white/[0.06] cursor-pointer"
                >
                  {copiedIndex === currentIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-teal-300/90 leading-relaxed font-mono">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          codeLines = [];
          codeLanguage = '';
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().replace('```', '').trim();
          codeLines = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      // Empty lines
      if (!line.trim()) {
        elements.push(<div key={`empty-${blockIndex++}`} className="h-2" />);
        continue;
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h4
            key={`h4-${blockIndex++}`}
            className="text-xs font-bold text-teal-300 uppercase tracking-wider mt-3 mb-1 font-display"
          >
            {formatInline(line.substring(4))}
          </h4>
        );
        continue;
      }

      if (line.startsWith('## ')) {
        elements.push(
          <h3
            key={`h3-${blockIndex++}`}
            className="text-sm font-bold text-white tracking-tight mt-3 mb-1.5 font-display"
          >
            {formatInline(line.substring(3))}
          </h3>
        );
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h2
            key={`h2-${blockIndex++}`}
            className="text-base font-extrabold text-white tracking-tight mt-4 mb-2 font-display"
          >
            {formatInline(line.substring(2))}
          </h2>
        );
        continue;
      }

      // Blockquote
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote
            key={`quote-${blockIndex++}`}
            className="my-2 border-l-2 border-teal-400/60 bg-teal-500/[0.04] px-3 py-1.5 rounded-r-lg text-slate-300 italic font-serif"
          >
            {formatInline(line.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Bullet list item
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        elements.push(
          <div key={`bullet-${blockIndex++}`} className="flex items-start gap-2 my-1 text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span className="leading-relaxed">{formatInline(itemText)}</span>
          </div>
        );
        continue;
      }

      // Numbered list item
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        elements.push(
          <div key={`num-${blockIndex++}`} className="flex items-start gap-2 my-1 text-slate-200">
            <span className="text-[10px] font-mono font-bold text-teal-400 mt-0.5 shrink-0 bg-teal-500/10 px-1.5 py-0.2 rounded">
              {numMatch[1]}
            </span>
            <span className="leading-relaxed">{formatInline(numMatch[2])}</span>
          </div>
        );
        continue;
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${blockIndex++}`} className="my-1 leading-relaxed text-slate-200">
          {formatInline(line)}
        </p>
      );
    }

    return elements;
  };

  // Parse inline styles (bold, code, redaction tags)
  const formatInline = (text: string): React.ReactNode => {
    // Check for REDACTED patterns
    const parts = text.split(/(\[.*?REDACTED\]|`.*?`|\*\*.*?\*\*|\*.*?\*)/g);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.includes('REDACTED]')) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
          >
            🛡️ {part}
          </span>
        );
      }

      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return (
          <code
            key={index}
            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#070b14] text-teal-300 border border-white/[0.08]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
        return (
          <strong key={index} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={index} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  return <div className={`space-y-0.5 text-xs ${className}`}>{parseBlocks(content)}</div>;
};
