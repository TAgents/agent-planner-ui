import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CoherenceDial, Kicker, Pill } from '../components/v1';
import { useCoherence } from '../hooks/useDashboard';

/**
 * Insights — secondary surface for BDI coherence + contradictions.
 *
 * Lives outside Mission Control by design: the dial is sophisticated and
 * rewards a slower read, so it doesn't belong in the dashboard hero where
 * the user is asking "what should I do next?". Mission Control links here
 * via a single "Coherence: NN →" hint instead.
 */
const Insights: React.FC = () => {
  const coherence = useCoherence();
  // Mirror the derivation Mission Control used when the dial lived there.
  // Signal source-of-truth is `/coherence/summary`; the three sub-scores are
  // computed client-side so the dial can tell sub-stories instead of all
  // three matching the overall coherence number.
  const contradictions = coherence.data?.signals?.contradictions ?? 0;
  const blockedRatio = coherence.data?.signals?.blocked_task_ratio ?? 0;
  const pendingDecisions = coherence.data?.signals?.pending_decisions ?? 0;
  const beliefs = Math.max(0, 1 - Math.min(1, contradictions / 15));
  const desires = coherence.data ? coherence.data.score : 0;
  const intentions = Math.max(0, 1 - blockedRatio - Math.min(0.4, pendingDecisions * 0.05));

  return (
    <div className="mx-auto max-w-[1080px] px-6 py-10 sm:px-9">
      <header className="mb-8">
        <Kicker className="mb-2">◆ Insights</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Coherence & beliefs
        </h1>
        <p className="mt-1 text-[13px] leading-[1.5] text-text-sec">
          A slower read on how aligned your beliefs, desires, and intentions are.
          Useful once you've been in the product for a few days — not the first thing
          you need on a Monday morning.
        </p>
      </header>

      <Card pad={28}>
        {coherence.data ? (
          <div className="flex flex-wrap items-start gap-10">
            <CoherenceDial
              score={coherence.data.score}
              beliefs={beliefs}
              desires={desires}
              intentions={intentions}
              size={240}
              centerLabel={
                <div className="flex flex-col items-center">
                  <span className="font-display text-[44px] font-bold tracking-[-0.03em] text-text leading-none">
                    {Math.round(coherence.data.score * 100)}
                  </span>
                  <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                    Coherence
                  </span>
                </div>
              }
            />
            <div className="min-w-[260px] flex-1 space-y-4">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  Belief · Desire · Intention
                </span>
                <p className="mt-2 text-[13px] leading-[1.55] text-text-sec">
                  Coherence rolls up three signals: how strong your beliefs are
                  (knowledge backing tasks), how clear your desires are (goal
                  definition), and how committed your intentions are (planned and
                  in-flight work).
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <BdiLegend label="Beliefs" pct={Math.round(beliefs * 100)} dot="bg-violet" />
                <BdiLegend label="Desires" pct={Math.round(desires * 100)} dot="bg-amber" />
                <BdiLegend label="Intentions" pct={Math.round(intentions * 100)} dot="bg-emerald" />
              </div>
              {contradictions > 0 && (
                <div className="rounded-md border border-amber/30 bg-amber/[0.06] px-3 py-2.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber">
                    △ {contradictions} contradiction{contradictions === 1 ? '' : 's'} detected
                  </span>
                  <p className="mt-1 text-[12px] text-text-sec">
                    Review on{' '}
                    <Link to="/app/knowledge/coverage" className="text-amber underline">
                      Knowledge Coverage
                    </Link>{' '}— contradictions usually mean two facts disagree about the same thing.
                  </p>
                </div>
              )}
              <div className="pt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                <Pill color="slate">{coherence.data.formula_version || 'starter'}</Pill>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-text-sec">Computing coherence…</p>
        )}
      </Card>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 text-[12.5px] text-text-sec">
        <Link
          to="/app/dashboard"
          className="rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-amber"
        >
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">← Back</span>
          <div className="mt-1 text-text">Mission Control</div>
        </Link>
        <Link
          to="/app/knowledge/coverage"
          className="rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-amber"
        >
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">Knowledge</span>
          <div className="mt-1 text-text">Coverage by plan</div>
        </Link>
        <Link
          to="/app/goals"
          className="rounded-md border border-border bg-surface px-4 py-3 transition-colors hover:border-amber"
        >
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">Desires</span>
          <div className="mt-1 text-text">Goals dashboard</div>
        </Link>
      </div>
    </div>
  );
};

const BdiLegend: React.FC<{ label: string; pct: number; dot: string }> = ({ label, pct, dot }) => (
  <div className="rounded-md border border-border bg-bg p-3">
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-muted">{label}</span>
    </div>
    <div className="mt-1.5 font-display text-[22px] font-bold tracking-[-0.025em] text-text">
      {pct}
    </div>
  </div>
);

export default Insights;
