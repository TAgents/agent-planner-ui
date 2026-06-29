import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Send,
  Trash2,
  Sparkles,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { GhostButton, PrimaryButton, Kicker, cn } from '../components/v1';
import { useConversations, useConversationMessages } from '../hooks/useConversations';
import { conversationService, type ChatMessage } from '../services/conversations.service';
import { streamChat } from '../hooks/useChatStream';

function relTime(iso?: string): string {
  if (!iso) return '';
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

// Markdown element styling (no @tailwindcss/typography in this app).
const md = {
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

const ToolChip: React.FC<{ status: string; label: string }> = ({ status, label }) => (
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

const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { conversations, createConversation, deleteConversation, refetch: refetchConversations } = useConversations();
  const { messages, refetch: refetchMessages } = useConversationMessages(conversationId);

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamEvents, setStreamEvents] = useState<any[]>([]);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  // Reset transient turn state when switching conversations — but never while a
  // send is mid-flight (the create-then-navigate flow changes the id in-place).
  useEffect(() => {
    if (sendingRef.current) return;
    setError(null);
    setPendingUser(null);
    setStreamText('');
    setStreamEvents([]);
  }, [conversationId]);

  const scrollToBottom = useCallback(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, streamEvents, pendingUser, conversationId, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    let cid = conversationId;
    if (!cid) {
      try {
        const conv = await createConversation.mutateAsync(undefined);
        cid = conv.id;
        navigate(`/app/chat/${cid}`, { replace: true });
      } catch {
        setInput(text); // restore the draft so the message isn't lost
        return;
      }
    }

    sendingRef.current = true;
    setStreaming(true);
    setPendingUser(text);
    setStreamText('');
    setStreamEvents([]);
    setError(null);

    const turn = { error: null as string | null };
    await streamChat(cid!, text, {
      onToken: (d) => setStreamText((t) => t + d),
      onToolCall: (e) => setStreamEvents((ev) => [...ev, { kind: 'tool', status: 'running', name: e.name }]),
      onToolResult: (e) =>
        setStreamEvents((ev) => {
          const next = [...ev];
          // upgrade the last running chip for this tool
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].kind === 'tool' && next[i].name === e.name && next[i].status === 'running') {
              next[i] = { kind: 'tool', status: e.status, name: e.name, summary: e.summary };
              return next;
            }
          }
          return [...next, { kind: 'tool', status: e.status, name: e.name, summary: e.summary }];
        }),
      onConfirm: (a) => setStreamEvents((ev) => [...ev, { kind: 'confirm', ...a }]),
      onConversation: () => refetchConversations(),
      onMessage: () => {},
      onError: (msg) => {
        turn.error = msg;
      },
      onDone: () => {},
    });

    await refetchMessages();
    refetchConversations();
    setStreaming(false);
    setPendingUser(null);
    setStreamText('');
    setStreamEvents([]);
    if (turn.error) {
      setError(turn.error);
      setInput(text); // restore the draft for a retry
    }
    sendingRef.current = false;
  }, [input, streaming, conversationId, createConversation, navigate, refetchMessages, refetchConversations]);

  const onConfirm = useCallback(
    async (actionId: string, approve: boolean) => {
      if (!conversationId) return;
      try {
        await conversationService.confirmAction(conversationId, actionId, approve);
      } finally {
        await refetchMessages();
      }
    },
    [conversationId, refetchMessages],
  );

  const onDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await deleteConversation.mutateAsync(id);
      if (id === conversationId) navigate('/app/chat', { replace: true });
    },
    [deleteConversation, conversationId, navigate],
  );

  const showEmptyThread =
    !conversationId || (messages.length === 0 && !streaming && !pendingUser && !error);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          type="button"
          onClick={() => navigate('/app/chat')}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] font-medium text-text transition-colors hover:bg-surface-hi"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 && (
          <p className="px-2 py-4 text-center text-[12px] text-text-muted">No conversations yet.</p>
        )}
        {conversations.map((c: any) => (
          <Link
            key={c.id}
            to={`/app/chat/${c.id}`}
            className={cn(
              'group flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors',
              c.id === conversationId ? 'bg-surface-hi text-text' : 'text-text-sec hover:bg-surface-hi/60 hover:text-text',
            )}
          >
            <span className="min-w-0 flex-1 truncate">{c.title || 'New chat'}</span>
            <span className="font-mono text-[9.5px] text-text-muted group-hover:hidden">{relTime(c.updated_at)}</span>
            <button
              type="button"
              onClick={(e) => onDelete(c.id, e)}
              aria-label="Delete conversation"
              className="hidden text-text-muted hover:text-red group-hover:block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full">
      <aside className="hidden w-[260px] flex-shrink-0 border-r border-border md:block">{sidebar}</aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile conversation switcher */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
          <button
            type="button"
            onClick={() => navigate('/app/chat')}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] text-text-sec"
          >
            <Plus className="h-3.5 w-3.5" /> New
          </button>
          <select
            value={conversationId || ''}
            onChange={(e) => navigate(e.target.value ? `/app/chat/${e.target.value}` : '/app/chat')}
            className="min-w-0 flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-[12px] text-text"
          >
            <option value="">New chat…</option>
            {conversations.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.title || 'New chat'}
              </option>
            ))}
          </select>
        </div>

        {/* Thread */}
        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
            {showEmptyThread ? (
              <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-soft text-amber">
                  <Sparkles className="h-6 w-6" />
                </span>
                <Kicker className="mb-2">◆ Assistant</Kicker>
                <h1 className="font-display text-[24px] font-bold tracking-[-0.03em] text-text">
                  What can I do for you?
                </h1>
                <p className="mt-2 max-w-[42ch] text-[13px] text-text-sec">
                  Ask me to find, create, or change anything — plans, goals, tasks, workspaces. I take real actions on
                  your behalf and ask before deleting things.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {['How are my goals doing?', 'What should I focus on next?', 'Create a goal and a plan to reach it'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setInput(s)}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-text-sec transition-colors hover:bg-surface-hi hover:text-text"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-5">
                {messages.map((m: ChatMessage) => (
                  <MessageRow key={m.id} message={m} onConfirm={onConfirm} />
                ))}

                {/* In-flight optimistic turn */}
                {pendingUser !== null && <UserBubble content={pendingUser} />}
                {streaming && (
                  <li>
                    <AssistantHeader />
                    {streamEvents.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {streamEvents
                          .filter((e) => e.kind === 'tool')
                          .map((e, i) => (
                            <ToolChip key={i} status={e.status} label={e.summary || e.name} />
                          ))}
                      </div>
                    )}
                    <div className="text-[14px] leading-relaxed text-text-sec">
                      {streamText ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={md as any}>
                          {streamText}
                        </ReactMarkdown>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-text-muted">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
                        </span>
                      )}
                    </div>
                    {streamEvents
                      .filter((e) => e.kind === 'confirm')
                      .map((a) => (
                        <ConfirmCard key={a.id} action={{ ...a, status: 'pending' }} onConfirm={onConfirm} />
                      ))}
                  </li>
                )}

                {/* Turn-level error (e.g. AI not configured, network failure) */}
                {error && (
                  <li className="flex items-start gap-2 rounded-lg border border-red/40 bg-red/10 px-3.5 py-2.5 text-[13px] text-red">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Composer */}
        <div data-tour="chat-composer" className="border-t border-border bg-bg px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-[760px] items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder="Message the assistant…  (Enter to send, Shift+Enter for newline)"
              className="max-h-[160px] min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
            <PrimaryButton
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="h-[44px] w-[44px] !p-0"
            >
              {streaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssistantHeader: React.FC = () => (
  <div className="mb-1.5 flex items-center gap-1.5">
    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-soft text-amber">
      <Sparkles className="h-3 w-3" />
    </span>
    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Assistant</span>
  </div>
);

const UserBubble: React.FC<{ content: string }> = ({ content }) => (
  <li className="flex justify-end">
    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-surface-hi px-3.5 py-2.5 text-[14px] text-text">
      {content}
    </div>
  </li>
);

const ConfirmCard: React.FC<{
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
    <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber/50 bg-amber-soft px-3.5 py-2.5">
      <span className="flex items-center gap-2 text-[13px] text-text">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber" />
        {action.description}?
      </span>
      <div className="flex items-center gap-2">
        <GhostButton onClick={() => onConfirm(action.id, false)}>Cancel</GhostButton>
        <PrimaryButton onClick={() => onConfirm(action.id, true)}>Confirm</PrimaryButton>
      </div>
    </div>
  );
};

const MessageRow: React.FC<{
  message: ChatMessage;
  onConfirm: (actionId: string, approve: boolean) => void;
}> = ({ message, onConfirm }) => {
  if (message.role === 'user') return <UserBubble content={message.content} />;

  const toolEvents: any[] = message.metadata?.tool_events || [];
  const pending: any[] = message.metadata?.pending_actions || [];
  return (
    <li>
      <AssistantHeader />
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
        <div className="text-[14px] leading-relaxed text-text-sec">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={md as any}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}
      {pending.map((a) => (
        <ConfirmCard key={a.id} action={a} onConfirm={onConfirm} />
      ))}
    </li>
  );
};

export default Chat;
