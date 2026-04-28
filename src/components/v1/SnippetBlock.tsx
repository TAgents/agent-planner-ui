import React, { useCallback, useMemo, useState } from 'react';
import { cn } from './cn';

export type SnippetLine = string | { text: string; color?: string; indent?: number };

export type SnippetBlockProps = {
  /** Header comment (rendered above lines, prefixed with `# ` or `// `). */
  comment?: string;
  language?: 'shell' | 'js';
  /**
   * Either strings or `{text, color?, indent?}`. Pass `color: 'amber'`
   * (or any token name) to highlight a single line — typically the
   * one containing the inlined API token.
   */
  lines: SnippetLine[];
  className?: string;
};

const COLOR_CLASS: Record<string, string> = {
  amber: 'text-amber',
  emerald: 'text-emerald',
  red: 'text-red',
  violet: 'text-violet',
  text: 'text-text',
  'text-sec': 'text-text-sec',
  'text-muted': 'text-text-muted',
};

/**
 * Multi-line monospace code block with a Copy button overlaid in the
 * top-right. Used in /connect/* setup snippets and onboarding.
 * See design_handoff_agentplanner/designs/connect-shared.jsx.
 */
export function SnippetBlock({ comment, language = 'shell', lines, className }: SnippetBlockProps) {
  const [copied, setCopied] = useState(false);
  const plain = useMemo(
    () =>
      lines
        .map((ln) => (typeof ln === 'string' ? ln : `${' '.repeat((ln.indent || 0) * 2)}${ln.text}`))
        .join('\n'),
    [lines],
  );

  const onCopy = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    navigator.clipboard.writeText(plain).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {},
    );
  }, [plain]);

  return (
    <div
      className={cn(
        'relative rounded-lg border border-border bg-bg pr-16',
        'px-[14px] py-3 font-mono text-[11.5px] leading-[1.7] text-text-sec',
        className,
      )}
    >
      {comment && (
        <div className="mb-1 text-text-muted">
          <span className="opacity-70">{language === 'shell' ? '# ' : '// '}</span>
          {comment}
        </div>
      )}
      {lines.map((ln, i) => {
        const obj = typeof ln === 'string' ? { text: ln } : ln;
        const indent = obj.indent || 0;
        const colorClass = obj.color && COLOR_CLASS[obj.color];
        return (
          <div
            key={i}
            style={indent ? { paddingLeft: indent * 14 } : undefined}
            className={colorClass || 'text-text'}
          >
            {obj.text}
          </div>
        );
      })}
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Snippet copied' : 'Copy snippet'}
        className={cn(
          'absolute right-[10px] top-[10px] rounded-[5px] border border-border bg-surface',
          'px-[10px] py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-text-sec',
          'transition-colors duration-150 hover:bg-surface-hi hover:text-text',
        )}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
