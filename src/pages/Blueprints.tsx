import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  GhostButton,
  Kicker,
  PrimaryButton,
  TopBar,
  cn,
} from '../components/v1';
import { useBlueprints } from '../hooks/useBlueprints';
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

const Blueprints: React.FC = () => {
  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<string | null>(null);
  const { data, isLoading, error } = useBlueprints();
  const all = data?.blueprints ?? [];

  const counts: Record<Tab, number> = useMemo(() => ({
    all:       all.length,
    workspace: all.filter((b) => b.scope === 'workspace').length,
    plan:      all.filter((b) => b.scope === 'plan').length,
  }), [all]);

  // Distinct categories from each blueprint's first tag, with row counts.
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

  const totals = useMemo(() => {
    const totalForks = all.reduce((acc, b) => acc + (b.forkCount || 0), 0);
    const ws = all.filter((b) => b.scope === 'workspace').length;
    const pl = all.filter((b) => b.scope === 'plan').length;
    let mostForked: Blueprint | null = null;
    for (const b of all) {
      if (!mostForked || (b.forkCount || 0) > (mostForked.forkCount || 0)) mostForked = b;
    }
    return { totalForks, ws, pl, mostForked };
  }, [all]);

  return (
    <div className="flex h-full flex-col">
      <TopBar
        kicker="Blueprints"
        title="Reusable operating models"
        subtitle="Save what works once, then fork it into any workspace as a ready-to-run plan."
        actions={(
          <div className="flex items-center gap-2">
            <GhostButton onClick={() => alert('Public discovery coming soon.')}>Browse community</GhostButton>
            <PrimaryButton onClick={() => alert('Create a Blueprint by saving an existing plan.')}>Create Blueprint</PrimaryButton>
          </div>
        )}
      />
      <div className="flex flex-1 flex-col gap-[18px] overflow-auto bg-bg p-6">
        <React.Fragment>
          <Hero totals={totals} totalCount={all.length} />
          <Filters
            tab={tab} setTab={setTab} counts={counts}
            categories={categories} category={category} setCategory={setCategory}
          />
          {isLoading && <Empty>Loading blueprints…</Empty>}
          {error ? <Empty tone="error">Failed to load blueprints.</Empty> : null}
          {!isLoading && !error && filtered.length === 0 && (
            <Empty>
              {category || tab !== 'all'
                ? <>No blueprints match your filters. <button type="button" onClick={() => { setCategory(null); setTab('all'); }} className="text-amber underline">Clear filters</button>.</>
                : <>No blueprints yet. Open a plan and choose <span className="text-amber">Save as Blueprint</span> to capture its structure.</>}
            </Empty>
          )}
          {!isLoading && filtered.length > 0 && <Grid items={filtered} />}
        </React.Fragment>
      </div>
    </div>
  );
};

const Hero: React.FC<{
  totals: { totalForks: number; ws: number; pl: number; mostForked: Blueprint | null };
  totalCount: number;
}> = ({ totals, totalCount }) => {
  const cells = [
    { l: 'Total blueprints', v: String(totalCount), sub: `${totals.ws} workspace · ${totals.pl} plan` },
    { l: 'Total forks',      v: String(totals.totalForks), sub: 'across all blueprints' },
    { l: 'Time saved',       v: '—', sub: 'requires fork × est. plan time' },
    { l: 'Most forked',      v: totals.mostForked ? totals.mostForked.title : '—',
      sub: totals.mostForked ? `${totals.mostForked.forkCount}× forks` : 'no forks yet' },
  ];
  return (
    <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-border bg-surface">
      {cells.map((c, i) => (
        <div key={c.l} className={cn('px-[22px] py-[18px]', i > 0 && 'border-l border-border')}>
          <div className="mb-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-muted">{c.l}</div>
          <div className="font-display text-[24px] font-semibold leading-tight tracking-[-0.025em] text-text">{c.v}</div>
          <div className="mt-1 text-[11px] text-text-muted">{c.sub}</div>
        </div>
      ))}
    </div>
  );
};

const Filters: React.FC<{
  tab: Tab; setTab: (t: Tab) => void; counts: Record<Tab, number>;
  categories: Array<[string, number]>;
  category: string | null;
  setCategory: (c: string | null) => void;
}> = ({ tab, setTab, counts, categories, category, setCategory }) => (
  <div className="flex flex-wrap items-center gap-3">
    <div className="flex items-center rounded-lg border border-border bg-surface p-[3px]">
      {/* Hide the Workspace-scope tab until workspace-scope blueprints exist
          (v1 is plan-scope only, so it was always an empty "Workspace 0"). */}
      {TABS.filter((t) => t.id !== 'workspace' || counts.workspace > 0).map((t) => {
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
        <CategoryChip label="All" count={null} on={category === null} onClick={() => setCategory(null)} />
        {categories.map(([cat, count]) => (
          <CategoryChip key={cat} label={cat} count={count} on={category === cat} onClick={() => setCategory(cat)} />
        ))}
      </div>
    )}
  </div>
);

const CategoryChip: React.FC<{
  label: string;
  count: number | null;
  on: boolean;
  onClick: () => void;
}> = ({ label, count, on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] transition-colors',
      on
        ? 'border-amber bg-amber/[0.12] text-text'
        : 'border-border bg-surface text-text-sec hover:border-border-hi hover:text-text',
    )}
  >
    <span className="capitalize">{label}</span>
    {count !== null && <span className="font-mono text-[9px] text-text-muted">{count}</span>}
  </button>
);

const Grid: React.FC<{ items: Blueprint[] }> = ({ items }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {items.map((b) => <BlueprintCard key={b.id} bp={b} />)}
  </div>
);

const BlueprintCard: React.FC<{ bp: Blueprint }> = ({ bp }) => {
  const isWs = bp.scope === 'workspace';
  const scopeLabel = isWs ? 'Workspace · BP' : 'Plan · BP';
  const scopeAccent = isWs ? 'border-amber/50 text-amber' : 'border-violet/50 text-violet';
  const scopeBar = isWs ? 'bg-amber' : 'bg-violet';
  const nodeCount = bp.payload?.nodes?.length ?? 0;
  // Both scopes fork into a target workspace; use one verb consistent with the
  // page intro instead of "Add" vs "Fork".
  const ctaLabel = 'Fork into workspace →';

  return (
    <Link
      to={`/app/blueprints/${bp.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-hi"
    >
      {/* stamp / cover */}
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
          <span className="font-mono text-[10px] text-text-muted">{bp.visibility}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10px] text-text-muted">updated {relativeTime(bp.updatedAt)}</span>
          <span className={cn(
            'rounded-md px-2.5 py-1 text-[11px] font-semibold',
            isWs ? 'bg-amber text-bg' : 'bg-violet text-bg',
          )}>{ctaLabel}</span>
        </div>
      </div>
    </Link>
  );
};

const Empty: React.FC<{ children: React.ReactNode; tone?: 'error' }> = ({ children, tone }) => (
  <Card className={cn('p-8 text-center text-[13px]', tone === 'error' ? 'text-red' : 'text-text-sec')}>
    {children}
  </Card>
);

export default Blueprints;
