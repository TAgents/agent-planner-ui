/* Markdown element overrides receive their content via {...props}, which the
   static a11y linter can't see — content is always present at runtime. */
/* eslint-disable jsx-a11y/anchor-has-content, jsx-a11y/heading-has-content */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { GhostButton, PrimaryButton, cn } from '../v1';
import type { ChatMessage } from '../../services/conversations.service';

/** Relative "3m / 2h / 4d" timestamp for conversation rows. */
export function relTime(iso?: string): string {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Markdown element styling (no @tailwindcss/typography in this app).
export const md = {
  p: (p: any) => <p className="mb-2 last:mb-0" {...p} />,
  ul: (p: any) => <ul className="mb-2 list-disc pl-5" {...p} />,
  ol: (p: any) => <ol className="mb-2 list-decimal pl-5" {...p} />,
  li: (p: any) => <li className="mb-0.5" {...p} />,
  a: (p: any) => <a className="text-amber underline underline-offset-2" target="_blank" rel="noreferrer" {...p} />,
  strong: (p: any) => <strong className="font-semibold text-text" {...p} />,
  h1: (p: any) => <h3 className="mb-1 mt-2 font-display text-[15px] font-bold text-text" {...p} />,
  h2: (p: any) => <h3 className="mb-1 mt-2 font-display text-[14px] font-bold text-text" {...p} />,
  h3: (p: any) => <h4 className="mb-1 mt-2 font-display text-[13px] font-semibold text-text" {...p} />,
  code: ({ inline, children, ...props }: any) =>
    inline ? (
      <code className="rounded bg-surface-hi px-1 py-0.5 font-mono text-[12px]" {...props}>
        {children}
      </code>
    ) : (
      <pre className="my-2 overflow-x-auto rounded-md border border-border bg-surface-hi p-3">
        <code className="font-mono text-[12px] leading-relaxed" {...props}>
          {children}
        </code>
      </pre>
    ),
};

export const ToolChip: React.FC<{ status: string; label: string }> = ({ status, label }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
      status === 'error'
        ? 'border-red bg-red/10 text-red'
        : status === 'running'
          ? 'border-border bg-surface text-text-sec'
          : 'border-emerald/40 bg-emerald-soft text-emerald',
    )}
  >
    {status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
    {label}
  </span>
);

/** The assistant's `ap` mark — anchors every agent turn (Flow v2 chat anatomy). */
export const AssistantAvatar: React.FC = () => (
  <span
    aria-label="Assistant"
    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-violet/20 font-mono text-[10px] font-bold text-violet"
  >
    ap
  </span>
);

/** Three pulsing dots — the agent is thinking / streaming hasn't produced text yet. */
export const TypingDots: React.FC = () => (
  <span className="inline-flex items-center gap-1.5 py-1" aria-label="Assistant is thinking">
    {[0, 0.2, 0.4].map((delay) => (
      <span
        key={delay}
        className="h-[5px] w-[5px] animate-pulse rounded-full bg-text-muted"
        style={{ animationDelay: `${delay}s` }}
      />
    ))}
  </span>
);

export const UserBubble: React.FC<{ content: string }> = ({ content }) => (
  <li className="flex justify-end">
    <div className="max-w-[85%] whitespace-pre-wrap rounded-xl rounded-tr-sm border border-amber/25 bg-amber-soft px-3.5 py-2.5 text-[13.5px] leading-[1.55] text-text">
      {content}
    </div>
  </li>
);

export const ConfirmCard: React.FC<{
  action: { id: string; description: string; status: string; result?: string };
  onConfirm: (actionId: string, approve: boolean) => void;
}> = ({ action, onConfirm }) => {
  if (action.status === 'done') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-emerald/40 bg-emerald-soft px-2.5 py-1 text-[12px] text-emerald">
        <Check className="h-3.5 w-3.5" /> {action.result || 'Done'}
      </div>
    );
  }
  if (action.status === 'cancelled') {
    return <div className="mt-2 text-[12px] text-text-muted">Cancelled — {action.description}</div>;
  }
  if (action.status === 'error') {
    return <div className="mt-2 text-[12px] text-red">Failed — {action.result || action.description}</div>;
  }
  return (
    <div className="mt-2 rounded-xl border border-amber/40 bg-surface px-3.5 py-3">
      <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.18em] text-amber">
        ◆ Pending decision
      </span>
      <span className="flex items-center gap-2 text-[13px] font-semibold text-text">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber" />
        {action.description}?
      </span>
      <div className="mt-2.5 flex items-center gap-2">
        <PrimaryButton onClick={() => onConfirm(action.id, true)}>Approve</PrimaryButton>
        <GhostButton onClick={() => onConfirm(action.id, false)}>Hold</GhostButton>
      </div>
    </div>
  );
};

export const MessageRow: React.FC<{
  message: ChatMessage;
  onConfirm: (actionId: string, approve: boolean) => void;
}> = ({ message, onConfirm }) => {
  if (message.role === 'user') return <UserBubble content={message.content} />;

  const toolEvents: any[] = message.metadata?.tool_events || [];
  const pending: any[] = message.metadata?.pending_actions || [];
  return (
    <li className="flex gap-2.5">
      <AssistantAvatar />
      <div className="min-w-0 flex-1">
        {toolEvents.filter((e) => e.type === 'tool').length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {toolEvents
              .filter((e) => e.type === 'tool')
              .map((e, i) => (
                <ToolChip key={i} status={e.status} label={e.summary || e.name} />
              ))}
          </div>
        )}
        {message.content && (
          <div className="rounded-xl rounded-tl-sm border border-border bg-surface px-3.5 py-2.5 text-[13.5px] leading-[1.6] text-text">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={md as any}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {pending.map((a) => (
          <ConfirmCard key={a.id} action={a} onConfirm={onConfirm} />
        ))}
      </div>
    </li>
  );
};
