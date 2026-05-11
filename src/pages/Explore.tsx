import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Kicker,
  cn,
} from '../components/v1';
import { usePublicBlueprints } from '../hooks/useBlueprints';
import type { Blueprint, BlueprintScope } from '../types';

type Tab = 'all' | BlueprintScope;
const TABS: { id: Tab; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'plan',      label: 'Plan' },
];

function relativeTime(iso?: string | null): string {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

/**
 * Public Blueprint catalog. Anyone can browse — no auth required. Fork
 * action on each card routes to /public/blueprints/:id, where logged-in
 * users get the fork modal and anonymous users see a sign-in prompt.
 */
const Explore: React.FC = () => {
  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<string | null>(null);
  const { data, isLoading, error } = usePublicBlueprints({ limit: 200 });
  const all = data?.blueprints ?? [];

  const counts: Record<Tab, number> = useMemo(() => ({
    all:       all.length,
    workspace: all.filter((b) => b.scope === 'workspace').length,
    plan:      all.filter((b) => b.scope === 'plan').length,
  }), [all]);

  const categories = useMemo(() => {
    const m = new Map<string, number>();
    for (const b of all) {
      const cat = b.tags?.[0];
      if (!cat) continue;
      m.set(cat, (m.get(cat) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [all]);

  const filtered = useMemo(() => {
    let rows = tab === 'all' ? all : all.filter((b) => b.scope === tab);
    if (category) rows = rows.filter((b) => (b.tags ?? [])[0] === category);
    return rows;
  }, [all, tab, category]);

  const totalForks = all.reduce((acc, b) => acc + (b.forkCount || 0), 0);
  const mostForked = all.reduce<Blueprint | null>((best, b) => (
    !best || (b.forkCount || 0) > (best.forkCount || 0) ? b : best
  ), null);

  return (
    <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">
      <>
        <header className="mb-7">
        <Kicker className="mb-2">◆ Explore</Kicker>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
          Reusable operating models
        </h1>
        <p className="mt-1 max-w-[64ch] text-[13px] leading-[1.55] text-text-sec">
          Browse public Blueprints from the community. Fork one into your workspace to
          spin up a new plan with the structure preconfigured — no blank page.
        </p>
      </header>

      <Hero totalCount={all.length} totalForks={totalForks} mostForked={mostForked} cats={categories.length} />

      <div className="mt-6 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-lg border border-border bg-surface p-[3px]">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-[5px] px-3 py-1.5 text-[12px] transition-colors',
                  on ? 'bg-surface-hi font-semibold text-text' : 'font-medium text-text-sec hover:text-text',
                )}
              >
                {t.label}
                <span className="font-mono text-[9.5px] text-text-muted">{counts[t.id]}</span>
              </button>
            );
          })}
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Category:</span>
            <Chip on={category === null} onClick={() => setCategory(null)}>All</Chip>
            {categories.map(([cat, count]) => (
              <Chip key={cat} on={category === cat} onClick={() => setCategory(cat)}>
                <span className="capitalize">{cat}</span>
                <span className="ml-1 font-mono text-[9px] text-text-muted">{count}</span>
              </Chip>
            ))}
          </div>
        )}
      </div>

      {isLoading && <Card pad={32}><p className="text-center text-[13px] text-text-sec">Loading the catalog…</p></Card>}
      {error && <Card pad={32}><p className="text-center text-[13px] text-red">Failed to load public blueprints.</p></Card>}
      {!isLoading && !error && filtered.length === 0 && (
        <Card pad={32}>
          {tab !== 'all' || category ? (
            <p className="text-center text-[13px] text-text-sec">
              No public blueprints match the filters.{' '}
              <button
                type="button"
                onClick={() => { setTab('all'); setCategory(null); }}
                className="text-amber underline"
              >Clear filters</button>.
            </p>
          ) : (
            <p className="text-center text-[13px] text-text-sec">
              No public blueprints yet. The catalog will fill as creators publish.
            </p>
          )}
        </Card>
      )}
      {!isLoading && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => <BlueprintCard key={b.id} bp={b} />)}
        </div>
      ) : null}
      </>
    </div>
  );
};

const Hero: React.FC<{
  totalCount: number;
  totalForks: number;
  mostForked: Blueprint | null;
  cats: number;
}> = ({ totalCount, totalForks, mostForked, cats }) => {
  const cells = [
    { l: 'Public blueprints', v: String(totalCount), sub: 'forkable structures' },
    { l: 'Total forks',       v: String(totalForks), sub: 'across the catalog' },
    { l: 'Categories',        v: String(cats), sub: 'distinct tags' },
    { l: 'Most forked',       v: mostForked?.title ?? '—',
      sub: mostForked ? `${mostForked.forkCount}× forks` : 'no forks yet' },
  ];
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-4">
      {cells.map((c, i) => (
        <div key={c.l} className={cn('px-[22px] py-[18px]', i > 0 && 'md:border-l border-border')}>
          <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">{c.l}</div>
          <div className="font-display text-[22px] font-semibold leading-tight tracking-[-0.025em] text-text">{c.v}</div>
          <div className="mt-1 text-[11px] text-text-muted">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode }> = ({ on, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
      on
        ? 'border-amber bg-amber/[0.12] text-text'
        : 'border-border bg-surface text-text-sec hover:border-border-hi hover:text-text',
    )}
  >
    {children}
  </button>
);

const BlueprintCard: React.FC<{ bp: Blueprint }> = ({ bp }) => {
  const isWs = bp.scope === 'workspace';
  const scopeLabel = isWs ? 'Workspace · BP' : 'Plan · BP';
  const scopeAccent = isWs ? 'border-amber/50 text-amber' : 'border-violet/50 text-violet';
  const scopeBar = isWs ? 'bg-amber' : 'bg-violet';
  const nodeCount = bp.payload?.nodes?.length ?? 0;
  return (
    <Link
      to={`/public/blueprints/${bp.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-hi"
    >
      <div className="relative h-[88px] border-b border-border bg-gradient-to-br from-surface-hi to-surface">
        <div className="absolute left-4 top-3.5 flex items-center gap-1.5">
          <span className={cn(
            'rounded border bg-bg px-1.5 py-[3px] font-mono text-[9px] font-bold uppercase tracking-[0.14em]',
            scopeAccent,
          )}>{scopeLabel}</span>
          {bp.tags && bp.tags[0] && (
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">{bp.tags[0]}</span>
          )}
        </div>
        <div className="absolute right-4 top-3.5 flex items-center gap-1 rounded border border-border bg-bg px-2 py-[3px] font-mono text-[9.5px] text-text-sec">
          <span className="font-bold text-amber">{bp.forkCount}×</span>
          <span>forks</span>
        </div>
        <div className={cn('absolute inset-x-0 bottom-0 h-0.5 opacity-60', scopeBar)} />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="font-display text-[16px] font-semibold tracking-[-0.02em] text-text">{bp.title}</div>
        {bp.description && (
          <div className="line-clamp-3 text-[12px] leading-snug text-text-sec">{bp.description}</div>
        )}
        <div className="mt-1 flex gap-3">
          <span className="font-mono text-[10px] text-text-muted">{nodeCount} node{nodeCount !== 1 ? 's' : ''}</span>
          <span className="font-mono text-[10px] text-text-muted">v{bp.version}</span>
        </div>
      </div>
    </Link>
  );
};

export default Explore;
