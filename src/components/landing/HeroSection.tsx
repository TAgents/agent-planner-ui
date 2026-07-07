import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

/**
 * Hero — layout from the "AgentPlanner Flow v2" design, drawn in the current
 * design language: centered headline over a path toggle that splits the page
 * by who is arriving. Agents (the primary audience) get a steps rail and the
 * interactive quick-connect card; humans get the workspace-as-conversation
 * framing and a chat preview.
 */
const HeroSection: React.FC = () => {
  const [path, setPath] = useState<HeroPath>('agent');
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
                { id: 'agent', label: '⚙ Connect an agent' },
                { id: 'human', label: '◯ I’m human — open chat' },
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

        {/* Human path — workspace as a conversation + chat preview */}
        {path === 'human' && (
          <div className="landing-fade-up mt-10 grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
            <div>
              <h2 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] text-text">
                Your workspace,
                <br />
                as a conversation.
              </h2>
              <p className="mt-3 max-w-[36ch] text-[13px] leading-[1.6] text-text-sec">
                Ask what&rsquo;s blocked. Approve decisions. Steer plans. Your agents keep the
                memory current underneath.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link
                  to="/login"
                  className="rounded-lg bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
                >
                  Open chat →
                </Link>
                <button
                  type="button"
                  onClick={() => setPath('agent')}
                  className="text-[12px] text-text-muted underline underline-offset-4 transition-colors hover:text-text-sec"
                >
                  Connecting an agent?
                </button>
              </div>
            </div>

            {/* Chat preview — the composer is live: submit carries the
                question through sign-in into the real chat. */}
            <div className="overflow-hidden rounded-xl border border-border-hi bg-surface">
              <div className="flex items-center gap-2 border-b border-border bg-surface-hi px-4 py-2.5">
                <span aria-hidden className="h-[6px] w-[6px] animate-pulse rounded-full bg-emerald" />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-sec">
                  Chat · your workspace
                </span>
              </div>
              <div className="flex flex-col gap-3 p-4">
                <div className="flex gap-2.5">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-violet/20 font-mono text-[9px] font-bold text-violet">
                    ap
                  </span>
                  <p className="max-w-[340px] rounded-xl rounded-tl-sm border border-border bg-bg px-3 py-2.5 text-[12px] leading-[1.55] text-text">
                    Atlas launch is <span className="text-emerald">on track</span>. One decision is
                    waiting on you.
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span aria-hidden className="h-6 w-6 flex-shrink-0" />
                  <div className="max-w-[340px] rounded-xl border border-amber/40 bg-bg px-3 py-2.5">
                    <p className="text-[12px] font-semibold text-text">
                      Ship v0.9 with the fallback parser?
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      <span className="rounded-md bg-emerald px-3 py-1 text-[10.5px] font-semibold text-bg">Approve</span>
                      <span className="rounded-md border border-border-hi px-3 py-1 text-[10.5px] text-text-sec">Hold</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={submitAsk} className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-bg py-1.5 pl-3.5 pr-1.5 transition-colors focus-within:border-amber/60">
                  <input
                    value={ask}
                    onChange={(e) => setAsk(e.target.value)}
                    placeholder="Ask anything — it lands in your chat…"
                    aria-label="Ask the assistant"
                    className="flex-1 bg-transparent text-[12px] text-text outline-none placeholder:text-text-muted"
                  />
                  <button
                    type="submit"
                    disabled={!ask.trim()}
                    className="rounded-md bg-amber px-3 py-1.5 text-[11px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    Send ↑
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
