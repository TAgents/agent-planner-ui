import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QuickConnectCard from './QuickConnectCard';
import { getSession } from '../../services/api-client';

type HeroPath = 'agent' | 'human';

/** localStorage key the ChatDock drains on mount — carries a question typed
 *  on the public landing through the login flow into the real chat. */
export const LANDING_CHAT_DRAFT_KEY = 'ap-chat-landing-draft';

const AGENT_STEPS = [
  { title: 'Pick your client', desc: 'Claude, Cursor, ChatGPT, OpenClaw — anything MCP.' },
  { title: 'Add AgentPlanner to it', desc: 'One paste. The snippet is ready on the right.' },
  { title: 'Test the connection', desc: 'Your agent calls briefing() and starts working.' },
];

const SUGGESTIONS = [
  'How are my goals doing?',
  'What should I focus on next?',
  'Create a goal and a plan to reach it',
];

/**
 * Hero — centered headline over a Human/Agents toggle. Humans (the default)
 * get one big Lovable-style prompt box that carries the question through
 * sign-in into the real chat; agents get the steps rail + the interactive
 * quick-connect card.
 */
const HeroSection: React.FC = () => {
  const [path, setPath] = useState<HeroPath>('human');
  const [ask, setAsk] = useState('');
  const navigate = useNavigate();

  // The landing composer is functional: the question is stashed and the
  // ChatDock picks it up right after sign-in (or immediately, if a session
  // already exists).
  const submitAsk = (e: React.FormEvent) => {
    e.preventDefault();
    const text = ask.trim();
    if (!text) return;
    try {
      localStorage.setItem(LANDING_CHAT_DRAFT_KEY, text);
    } catch {
      /* ignore */
    }
    navigate(getSession() ? '/app/dashboard' : '/login');
  };

  return (
    <section className="bp-grid-faint relative border-b border-border">
      <div className="mx-auto max-w-[1180px] px-6 pb-16 pt-14 sm:px-9 md:pt-16">
        {/* Centered headline */}
        <div className="landing-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border-hi bg-surface px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-sec">
            <span aria-hidden className="h-[6px] w-[6px] rounded-full bg-amber" />
            Operating system for repeatable work
          </span>
          <h1 className="mt-6 font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.01em] text-text sm:text-[58px]">
            Define goals and plans.
            <br />
            <span className="text-amber">Agents implement.</span>
          </h1>
        </div>

        {/* Path toggle */}
        <div className="landing-fade-up landing-delay-1 mt-8 flex justify-center">
          <div className="flex gap-1 rounded-xl border border-border-hi bg-surface p-1" role="tablist" aria-label="How are you arriving?">
            {(
              [
                { id: 'human', label: '◯ Human' },
                { id: 'agent', label: '⚙ Agents' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={path === t.id}
                onClick={() => setPath(t.id)}
                className={`rounded-lg px-5 py-2 text-[13px] font-medium transition-colors ${
                  path === t.id ? 'bg-amber text-bg' : 'text-text-sec hover:text-text'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Agent path — steps rail + quick connect */}
        {path === 'agent' && (
          <div className="landing-fade-up mt-10 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <ol className="list-none">
              {AGENT_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] border-amber bg-surface font-mono text-[11px] font-bold text-amber">
                      {i + 1}
                    </span>
                    {i < AGENT_STEPS.length - 1 && (
                      <span aria-hidden className="w-px flex-1 bg-border-hi" style={{ minHeight: 26 }} />
                    )}
                  </div>
                  <div className="pb-6 pt-1">
                    <div className="font-display text-[15px] font-semibold tracking-[-0.01em] text-text">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-[12px] leading-[1.5] text-text-muted">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
            <QuickConnectCard />
          </div>
        )}

        {/* Human path (default) — one big Lovable-style prompt box. The
            question is carried through sign-in into the real chat. */}
        {path === 'human' && (
          <div className="landing-fade-up mx-auto mt-10 max-w-[760px]">
            <form
              onSubmit={submitAsk}
              className="rounded-2xl border border-border-hi bg-surface p-2 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.7)] transition-colors focus-within:border-amber/60"
            >
              <textarea
                value={ask}
                onChange={(e) => setAsk(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={3}
                autoFocus
                placeholder="Ask anything about your work — goals, plans, decisions, blockers…"
                aria-label="Ask the assistant"
                className="w-full resize-none bg-transparent px-3.5 py-3 text-[15px] leading-[1.6] text-text outline-none placeholder:text-text-muted"
              />
              <div className="flex items-center justify-between gap-3 px-2 pb-1.5">
                <span className="hidden font-mono text-[10px] text-text-muted sm:inline">
                  Your agents keep the memory current underneath.
                </span>
                <button
                  type="submit"
                  disabled={!ask.trim()}
                  className="ml-auto rounded-lg bg-amber px-5 py-2 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Send ↑
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setAsk(s)}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12px] text-text-sec transition-colors hover:border-border-hi hover:text-text"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
