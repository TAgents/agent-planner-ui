import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Plus,
  Send,
  Square,
  Trash2,
  Sparkles,
  Loader2,
  History,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { PrimaryButton, Kicker, cn } from '../v1';
import { useUI } from '../../contexts/UIContext';
import { useConversations, useConversationMessages } from '../../hooks/useConversations';
import { conversationService, type ChatMessage } from '../../services/conversations.service';
import { streamChat } from '../../hooks/useChatStream';
import {
  md,
  relTime,
  ToolChip,
  AssistantHeader,
  UserBubble,
  ConfirmCard,
  MessageRow,
} from './ChatPrimitives';

const MIN_W = 320;
const MAX_W = 560;
const ACTIVE_KEY = 'ap-chat-active';

/**
 * Persistent assistant dock. Lives in the app shell to the right of the nav
 * rail and is available on every screen. Unlike the old full-page Chat, the
 * active conversation is internal state (persisted to localStorage) rather than
 * the route, so it survives navigation between Mission / Goals / Knowledge / etc.
 */
const ChatDock: React.FC = () => {
  const { state, setChatDockOpen, setChatDockWidth } = useUI();
  const { open, width } = state.chatDock;

  const [activeId, setActiveId] = useState<string | undefined>(() => {
    try {
      return localStorage.getItem(ACTIVE_KEY) || undefined;
    } catch {
      return undefined;
    }
  });
  const setActive = useCallback((id: string | undefined) => {
    setActiveId(id);
    try {
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const { conversations, createConversation, deleteConversation, refetch: refetchConversations } = useConversations();
  const { messages, refetch: refetchMessages } = useConversationMessages(activeId);

  const [historyOpen, setHistoryOpen] = useState(false);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [streamEvents, setStreamEvents] = useState<any[]>([]);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  // The in-flight stream and the conversation it belongs to. Lets us cancel it
  // (Stop button, unmount) and detect a switch to a *different* conversation —
  // the transient stream state must never render into another thread.
  const abortRef = useRef<AbortController | null>(null);
  const streamCidRef = useRef<string | null>(null);
  const qc = useQueryClient();

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Cancel any in-flight stream when the dock unmounts (e.g. logout).
  useEffect(() => () => abortRef.current?.abort(), []);

  // Reset transient turn state when switching conversations. A send may set
  // activeId itself (new-conversation flow) — that's the stream's own thread,
  // so leave it alone; switching to any *other* thread cancels the stream.
  useEffect(() => {
    if (sendingRef.current && streamCidRef.current === activeId) return;
    if (sendingRef.current) abortRef.current?.abort();
    setError(null);
    setPendingUser(null);
    setStreamText('');
    setStreamEvents([]);
  }, [activeId]);

  const scrollToBottom = useCallback(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamText, streamEvents, pendingUser, activeId, open, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    let cid = activeId;
    if (!cid) {
      try {
        const conv = await createConversation.mutateAsync(undefined);
        cid = conv.id;
        setActive(cid);
      } catch (e: any) {
        // Surface the failure — a silently restored draft reads as a dead send button.
        setError(e?.response?.data?.error || e?.message || 'Could not start a conversation');
        setInput(text); // restore the draft so the message isn't lost
        return;
      }
    }

    sendingRef.current = true;
    streamCidRef.current = cid!;
    const controller = new AbortController();
    abortRef.current = controller;
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
    }, controller.signal);

    // Refetch by the stream's own conversation key — activeId may have moved on.
    await qc.invalidateQueries(['conversation', cid, 'messages']);
    refetchConversations();
    setStreaming(false);
    setPendingUser(null);
    setStreamText('');
    setStreamEvents([]);
    if (turn.error) {
      setError(turn.error);
      setInput(text);
    }
    sendingRef.current = false;
    streamCidRef.current = null;
    abortRef.current = null;
  }, [input, streaming, activeId, createConversation, setActive, qc, refetchConversations]);

  const onConfirm = useCallback(
    async (actionId: string, approve: boolean) => {
      if (!activeId) return;
      try {
        await conversationService.confirmAction(activeId, actionId, approve);
      } finally {
        await refetchMessages();
      }
    },
    [activeId, refetchMessages],
  );

  const onDelete = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      await deleteConversation.mutateAsync(id);
      if (id === activeId) setActive(undefined);
    },
    [deleteConversation, activeId, setActive],
  );

  // Drag-to-resize the dock width (desktop only). Persists on release.
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = e.clientX - resizeRef.current.startX;
      const next = Math.min(MAX_W, Math.max(MIN_W, resizeRef.current.startW + delta));
      setChatDockWidth(next);
    };
    const onUp = () => {
      resizeRef.current = null;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [setChatDockWidth]);
  const startResize = (e: React.MouseEvent) => {
    resizeRef.current = { startX: e.clientX, startW: width };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  const showEmptyThread = (!activeId || (messages.length === 0 && !streaming && !pendingUser)) && !error;

  // ── Collapsed: slim rail on desktop, floating launcher on mobile ──────────
  if (!open) {
    return (
      <>
        <div className="hidden h-full w-11 flex-shrink-0 flex-col items-center gap-3 border-r border-border bg-surface py-3 lg:flex">
          <button
            type="button"
            onClick={() => setChatDockOpen(true)}
            aria-label="Open assistant"
            title="Open assistant"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-sec transition-colors hover:bg-surface-hi hover:text-text"
          >
            <PanelLeftOpen size={18} strokeWidth={2} />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-soft text-amber">
            <Sparkles size={16} />
          </span>
          <span
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted"
            style={{ writingMode: 'vertical-rl' }}
          >
            Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={() => setChatDockOpen(true)}
          aria-label="Open assistant"
          className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-amber text-bg shadow-lg transition-transform hover:scale-105 lg:hidden"
        >
          <Sparkles size={20} />
        </button>
      </>
    );
  }

  // ── Open: full column (inline on desktop, overlay on mobile) ──────────────
  return (
    <>
      {/* Mobile scrim */}
      <button
        type="button"
        aria-label="Close assistant"
        onClick={() => setChatDockOpen(false)}
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
      />

      <aside
        style={{ width }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex max-w-[88vw] flex-shrink-0 flex-col border-r border-border bg-bg',
          'lg:static lg:z-auto lg:max-w-none',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-amber-soft text-amber">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <Kicker className="truncate">◆ Assistant</Kicker>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => {
                setActive(undefined);
                setHistoryOpen(false);
              }}
              aria-label="New chat"
              title="New chat"
              className="rounded-md p-1.5 text-text-sec transition-colors hover:bg-surface-hi hover:text-text"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setHistoryOpen((v) => !v)}
                aria-label="Conversation history"
                aria-expanded={historyOpen}
                title="History"
                className={cn(
                  'rounded-md p-1.5 transition-colors hover:bg-surface-hi hover:text-text',
                  historyOpen ? 'bg-surface-hi text-text' : 'text-text-sec',
                )}
              >
                <History className="h-4 w-4" />
              </button>
              {historyOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    onClick={() => setHistoryOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 top-full z-20 mt-1 max-h-[60vh] w-[240px] overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-xl">
                    {conversations.length === 0 && (
                      <p className="px-2 py-3 text-center text-[12px] text-text-muted">No conversations yet.</p>
                    )}
                    {conversations.map((c: any) => (
                      <div
                        key={c.id}
                        className={cn(
                          'group flex w-full items-center gap-2 rounded-md transition-colors',
                          c.id === activeId ? 'bg-surface-hi text-text' : 'text-text-sec hover:bg-surface-hi/60 hover:text-text',
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActive(c.id);
                            setHistoryOpen(false);
                          }}
                          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-[13px]"
                        >
                          <span className="min-w-0 flex-1 truncate">{c.title || 'New chat'}</span>
                          <span className="font-mono text-[9.5px] text-text-muted group-hover:hidden group-focus-within:hidden">
                            {relTime(c.updated_at)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => onDelete(c.id, e)}
                          aria-label="Delete conversation"
                          title="Delete conversation"
                          className="hidden pr-2.5 text-text-muted hover:text-red focus-visible:block group-focus-within:block group-hover:block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setChatDockOpen(false)}
              aria-label="Collapse assistant"
              title="Collapse"
              className="rounded-md p-1.5 text-text-sec transition-colors hover:bg-surface-hi hover:text-text"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Thread */}
        <div ref={threadRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-4 py-5">
            {showEmptyThread ? (
              <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-soft text-amber">
                  <Sparkles className="h-6 w-6" />
                </span>
                <h2 className="font-display text-[19px] font-bold tracking-[-0.02em] text-text">
                  What can I do for you?
                </h2>
                <p className="mt-2 max-w-[34ch] text-[13px] text-text-sec">
                  Ask me to find, create, or change anything — plans, goals, tasks, workspaces. I take real actions on
                  your behalf and ask before deleting things.
                </p>
                <div className="mt-5 flex flex-col gap-2">
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

                {error && (
                  <li className="flex items-start gap-2 rounded-lg border border-red/40 bg-red/10 px-3.5 py-2.5 text-[13px] text-red">
                    <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Composer */}
        <div data-tour="chat-composer" className="border-t border-border bg-bg px-3 py-3">
          <div className="flex items-end gap-2">
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
              placeholder="Message the assistant…"
              className="max-h-[160px] min-h-[44px] flex-1 resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text placeholder:text-text-muted focus:border-amber focus:outline-none"
            />
            <PrimaryButton
              onClick={streaming ? stopStreaming : handleSend}
              disabled={!streaming && !input.trim()}
              aria-label={streaming ? 'Stop generating' : 'Send message'}
              title={streaming ? 'Stop generating' : 'Send'}
              className="h-[44px] w-[44px] !p-0"
            >
              {streaming ? <Square className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            </PrimaryButton>
          </div>
        </div>

        {/* Resize handle (desktop only) */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize assistant"
          onMouseDown={startResize}
          className="absolute inset-y-0 right-0 hidden w-1.5 translate-x-1/2 cursor-col-resize lg:block"
        >
          <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-colors hover:bg-amber/60" />
        </div>
      </aside>
    </>
  );
};

export default ChatDock;
