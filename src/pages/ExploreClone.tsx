import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, GhostButton, Kicker, PrimaryButton } from '../components/v1';
import { request } from '../services/api-client';

type ForkResponse = { plan: { id: string; title: string } };

/**
 * /explore/clone/:sourceId — auto-calls POST /plans/:id/fork and
 * redirects to the new plan tree on success. Renders an explanation
 * of what's about to happen + a Cancel + Retry pair so users coming
 * from /public/plans/:id "Fork" CTA can confirm before consuming a
 * write.
 */
const ExploreClone: React.FC = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<'idle' | 'forking' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [autoStart, setAutoStart] = useState(true);

  const startFork = async () => {
    if (!sourceId) return;
    setState('forking');
    setError(null);
    try {
      const res = await request<ForkResponse>({
        url: `/plans/${sourceId}/fork`,
        method: 'post',
        data: {},
      });
      navigate(`/app/plans/${res.plan.id}`);
    } catch (err: any) {
      setError(err?.message || 'Fork failed');
      setState('error');
    }
  };

  useEffect(() => {
    if (autoStart && sourceId) {
      setAutoStart(false);
      void startFork();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, sourceId]);

  if (!sourceId) {
    return (
      <div className="mx-auto max-w-[600px] px-6 py-16">
        <Card pad={20}>
          <p className="font-display text-base font-semibold">No plan to fork</p>
          <p className="mt-2 text-sm text-text-sec">
            Browse the catalog and pick a plan to fork.
          </p>
          <div className="mt-4">
            <Link to="/explore" className="font-mono text-[10px] uppercase tracking-[0.14em] text-amber underline">
              Explore plans →
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[600px] px-6 py-16">
      <Card pad={28} className="text-center">
        <Kicker className="mb-2">◆ Forking a plan</Kicker>
        <h1 className="font-display text-[22px] font-bold tracking-[-0.03em] text-text">
          {state === 'forking' && 'Cloning into your workspace…'}
          {state === 'idle' && 'Ready to fork'}
          {state === 'error' && 'Could not fork'}
        </h1>
        <p className="mt-3 text-[13px] leading-[1.55] text-text-sec">
          {state === 'forking' &&
            'We\u2019re copying every node + dependency edge. The forked plan starts in draft / private and you\u2019ll be redirected to it once ready.'}
          {state === 'idle' && 'A deep copy will be created in your workspace. The original stays untouched.'}
          {state === 'error' && (error || 'Something went wrong. Try again, or open a support ticket.')}
        </p>
        {state === 'error' && (
          <div className="mt-5 flex justify-center gap-3">
            <PrimaryButton onClick={startFork}>Try again</PrimaryButton>
            <GhostButton onClick={() => navigate(-1)}>Cancel</GhostButton>
          </div>
        )}
        {state === 'forking' && (
          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            ↳ POST /plans/{sourceId.slice(0, 8)}…/fork
          </p>
        )}
      </Card>
    </div>
  );
};

export default ExploreClone;
