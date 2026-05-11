import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Kicker,
  cn,
} from '../components/v1';
import { usePublicBlueprints } from '../hooks/useBlueprints';
import type { Blueprint, BlueprintScope, BlueprintTier } from '../types';

/**
 * Public Blueprint catalog — workspace-first gallery with editorial shelves.
 *
 * IA per advisor brief:
 *   1. Hero
 *   2. Featured Blueprints (tier='featured', up to 5)
 *   3. All Blueprints library with filters (audience / use-case / tier)
 *   4. Experimental / Community section
 *
 * Phase 2 (deferred): "Browse by Use Case" + "Browse by Audience" tile grids.
 * The single-page anchor IA matches the advisor's wireframe with less URL
 * surface to maintain at this stage.
 */

const Explore: React.FC = () => {
  const { data, isLoading, error } = usePublicBlueprints({ limit: 200 });
  const all = data?.blueprints ?? [];

  const featured = useMemo(() => all.filter((b) => b.tier === 'featured').sort(byForkCountDesc), [all]);
  const experimental = useMemo(() => all.filter((b) => b.tier === 'experimental'), [all]);
  const example = useMemo(() => all.filter((b) => b.tier === 'example'), [all]);
  // Library = everything except experimental (those get their own clearly-separated
  // section so they don't dilute the catalog).
  const library = useMemo(() => all.filter((b) => b.tier !== 'experimental'), [all]);

  const body = (
    <>
      <Hero />
      {isLoading && <Card pad={32}><p className="text-center text-[13px] text-text-sec">Loading the catalog…</p></Card>}
      {error ? <Card pad={32}><p className="text-center text-[13px] text-red">Failed to load public blueprints.</p></Card> : null}
      {!isLoading && !error && featured.length > 0 && (
        <FeaturedShelf items={featured} />
      )}
      {!isLoading && !error && example.length > 0 && (
        <ExampleNote items={example} />
      )}
      {!isLoading && !error && (
        <Library items={library} totalCount={all.length} />
      )}
      {!isLoading && !error && experimental.length > 0 && (
        <ExperimentalSection items={experimental} />
      )}
    </>
  );
  return <div className="mx-auto max-w-[1180px] px-6 py-10 sm:px-9">{body}</div>;
};

// ─── Hero ─────────────────────────────────────────────────────────

const Hero: React.FC = () => (
  <header className="mb-12">
    <Kicker className="mb-2">◆ Explore</Kicker>
    <h1 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-text sm:text-[40px]">
      Start from a proven blueprint
    </h1>
    <p className="mt-3 max-w-[64ch] text-[14px] leading-[1.55] text-text-sec sm:text-[15px]">
      Fork a reusable operating model for product launches, migrations, AI agent
      projects, and team transformation. Each Blueprint forks into a live
      workspace with structure, agent hints, and dependencies preconfigured.
    </p>
    <div className="mt-7 flex flex-wrap items-center gap-3">
      <a
        href="#featured"
        className="rounded-md bg-amber px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90"
      >
        Browse featured →
      </a>
      <a
        href="#library"
        className="rounded-md border border-border bg-surface px-5 py-2.5 font-medium text-text transition-colors hover:bg-surface-hi"
      >
        Explore all blueprints
      </a>
    </div>
  </header>
);

// ─── Featured shelf ───────────────────────────────────────────────

const FeaturedShelf: React.FC<{ items: Blueprint[] }> = ({ items }) => (
  <section id="featured" className="mb-14 scroll-mt-6">
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <Kicker className="block">Featured</Kicker>
        <h2 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.025em] text-text sm:text-[26px]">
          Proven operating models, hand-picked
        </h2>
      </div>
      <a href="#library" className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-text">
        See all →
      </a>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((b) => <FeaturedCard key={b.id} bp={b} />)}
    </div>
  </section>
);

const FeaturedCard: React.FC<{ bp: Blueprint }> = ({ bp }) => {
  const isWs = bp.scope === 'workspace';
  return (
    <Link
      to={`/public/blueprints/${bp.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-amber"
    >
      <div className={cn(
        'relative h-2 w-full',
        bp.tier === 'example' ? 'bg-emerald' : 'bg-amber',
      )} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <TierBadge tier={bp.tier ?? 'community'} />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
            {isWs ? 'Workspace · BP' : 'Plan · BP'}
          </span>
          <span className="ml-auto font-mono text-[10px] text-text-muted">
            <span className="font-bold text-amber">{bp.forkCount}×</span> forks
          </span>
        </div>
        <div className="font-display text-[18px] font-semibold leading-tight tracking-[-0.02em] text-text">
          {bp.title}
        </div>
        {bp.outcome && (
          <div className="text-[13px] leading-[1.55] text-text-sec">{bp.outcome}</div>
        )}
        {!bp.outcome && bp.description && (
          <div className="line-clamp-3 text-[13px] leading-[1.55] text-text-sec">{bp.description}</div>
        )}

        <TagRow audience={bp.audience} useCase={bp.useCase} duration={bp.durationLabel} />

        {bp.whyFork && (
          <div className="mt-1 rounded-md border border-dashed border-border bg-bg p-2.5 text-[11.5px] leading-[1.5] text-text-sec">
            <span className="font-mono uppercase tracking-[0.12em] text-amber">Why fork →</span>{' '}
            {bp.whyFork}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-mono text-[10px] text-text-muted">
            {bp.payload?.nodes?.length ?? 0} nodes · v{bp.version}
          </span>
          <span className="rounded-md bg-amber px-3 py-1.5 text-[11.5px] font-semibold text-bg transition-opacity group-hover:opacity-90">
            Fork blueprint →
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── Example note (NordLogistics-style) ───────────────────────────

const ExampleNote: React.FC<{ items: Blueprint[] }> = ({ items }) => (
  <section className="mb-12 rounded-xl border border-dashed border-emerald bg-emerald/[0.06] p-5">
    <div className="flex items-center gap-2">
      <span className="rounded bg-emerald/[0.18] px-2 py-[3px] font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-emerald">
        Example
      </span>
      <span className="font-display text-[14px] font-semibold tracking-[-0.01em] text-text">
        Illustrative blueprint — not a real customer case study
      </span>
    </div>
    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {items.map((b) => (
        <Link
          key={b.id}
          to={`/public/blueprints/${b.id}`}
          className="rounded-md border border-border bg-surface p-3 transition-colors hover:border-emerald"
        >
          <div className="font-display text-[14px] font-semibold tracking-[-0.015em] text-text">{b.title}</div>
          {b.outcome && <div className="mt-1 line-clamp-2 text-[12px] text-text-sec">{b.outcome}</div>}
        </Link>
      ))}
    </div>
  </section>
);

// ─── Library (full searchable list with filters) ──────────────────

type AudienceFilter = string;
type UseCaseFilter = string;

const Library: React.FC<{ items: Blueprint[]; totalCount: number }> = ({ items, totalCount }) => {
  const [audience, setAudience] = useState<AudienceFilter | 'any'>('any');
  const [useCase, setUseCase] = useState<UseCaseFilter | 'any'>('any');
  const [scope, setScope] = useState<BlueprintScope | 'any'>('any');
  const [query, setQuery] = useState('');

  const audiences = useMemo(() => collectFacet(items, 'audience'), [items]);
  const useCases = useMemo(() => collectFacet(items, 'useCase'), [items]);

  const filtered = useMemo(() => {
    let rows = items;
    if (audience !== 'any') rows = rows.filter((b) => (b.audience ?? []).includes(audience));
    if (useCase !== 'any') rows = rows.filter((b) => (b.useCase ?? []).includes(useCase));
    if (scope !== 'any') rows = rows.filter((b) => b.scope === scope);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        (b.outcome ?? '').toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q),
      );
    }
    return rows;
  }, [items, audience, useCase, scope, query]);

  return (
    <section id="library" className="mb-14 scroll-mt-6">
      <div className="mb-5">
        <Kicker className="block">All blueprints</Kicker>
        <h2 className="mt-1 font-display text-[22px] font-semibold tracking-[-0.025em] text-text sm:text-[26px]">
          The full library
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">{totalCount} public blueprints — filter to find one for your work.</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={query} onChange={setQuery} />
        <FilterSelect label="Audience" value={audience} onChange={setAudience} options={[['any', 'Any'], ...audiences.map(([k]) => [k, prettify(k)] as [string, string])]} />
        <FilterSelect label="Use case" value={useCase} onChange={setUseCase} options={[['any', 'Any'], ...useCases.map(([k]) => [k, prettify(k)] as [string, string])]} />
        <FilterSelect label="Scope" value={scope} onChange={(v) => setScope(v as any)} options={[['any', 'Any'], ['plan', 'Plan'], ['workspace', 'Workspace']]} />
      </div>

      {filtered.length === 0 ? (
        <Card pad={32}>
          <p className="text-center text-[13px] text-text-sec">
            No blueprints match your filters.{' '}
            <button
              type="button"
              onClick={() => { setAudience('any'); setUseCase('any'); setScope('any'); setQuery(''); }}
              className="text-amber underline"
            >Clear filters</button>.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => <LibraryCard key={b.id} bp={b} />)}
        </div>
      )}
    </section>
  );
};

const LibraryCard: React.FC<{ bp: Blueprint }> = ({ bp }) => (
  <Link
    to={`/public/blueprints/${bp.id}`}
    className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-border-hi"
  >
    <div className="flex items-center gap-2">
      <TierBadge tier={bp.tier ?? 'community'} />
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-muted">
        {bp.scope === 'workspace' ? 'Workspace · BP' : 'Plan · BP'}
      </span>
      <span className="ml-auto font-mono text-[10px] text-text-muted">
        <span className="font-bold text-amber">{bp.forkCount}×</span> forks
      </span>
    </div>
    <div className="font-display text-[15px] font-semibold leading-tight tracking-[-0.015em] text-text">
      {bp.title}
    </div>
    {bp.outcome && (
      <div className="line-clamp-2 text-[12px] leading-[1.5] text-text-sec">{bp.outcome}</div>
    )}
    {!bp.outcome && bp.description && (
      <div className="line-clamp-2 text-[12px] leading-[1.5] text-text-sec">{bp.description}</div>
    )}
    <TagRow audience={bp.audience} useCase={bp.useCase} duration={bp.durationLabel} compact />
  </Link>
);

// ─── Experimental ─────────────────────────────────────────────────

const ExperimentalSection: React.FC<{ items: Blueprint[] }> = ({ items }) => (
  <section className="border-t border-dashed border-border pt-9">
    <div className="mb-4">
      <Kicker className="block">Experimental / Community</Kicker>
      <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
        Labs and niche experiments
      </h2>
      <p className="mt-1 text-[12.5px] text-text-sec">
        Unusual blueprints from the community. Treat as inspiration, not as the main story.
      </p>
    </div>
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      {items.map((b) => (
        <Link
          key={b.id}
          to={`/public/blueprints/${b.id}`}
          className="flex items-start gap-3 rounded-md border border-dashed border-border bg-surface/50 p-3 transition-colors hover:border-border-hi"
        >
          <span className="rounded bg-surface-hi px-1.5 py-[2px] font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-text-muted">
            EXP
          </span>
          <div className="min-w-0">
            <div className="truncate font-display text-[13px] font-semibold tracking-[-0.01em] text-text">{b.title}</div>
            {(b.outcome || b.description) && (
              <div className="mt-0.5 line-clamp-2 text-[11.5px] text-text-muted">{b.outcome || b.description}</div>
            )}
          </div>
        </Link>
      ))}
    </div>
  </section>
);

// ─── Shared primitives ────────────────────────────────────────────

const TIER_META: Record<BlueprintTier, { label: string; cls: string }> = {
  featured:     { label: 'Featured',     cls: 'bg-amber text-bg' },
  community:    { label: 'Community',    cls: 'bg-surface-hi text-text-sec border border-border' },
  experimental: { label: 'Experimental', cls: 'bg-violet/[0.15] text-violet border border-violet/30' },
  example:      { label: 'Example',      cls: 'bg-emerald/[0.18] text-emerald border border-emerald/30' },
};

const TierBadge: React.FC<{ tier: BlueprintTier }> = ({ tier }) => {
  const m = TIER_META[tier] ?? TIER_META.community;
  return (
    <span className={cn(
      'rounded px-1.5 py-[2px] font-mono text-[8.5px] font-bold uppercase tracking-[0.12em]',
      m.cls,
    )}>{m.label}</span>
  );
};

const TagRow: React.FC<{
  audience?: string[];
  useCase?: string[];
  duration?: string | null;
  compact?: boolean;
}> = ({ audience, useCase, duration, compact }) => {
  const aud = (audience ?? []).slice(0, compact ? 1 : 2);
  const uc = (useCase ?? []).slice(0, compact ? 1 : 2);
  if (aud.length === 0 && uc.length === 0 && !duration) return null;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {aud.map((a) => (
        <span key={a} className="rounded bg-amber/[0.10] px-1.5 py-[2px] font-mono text-[9.5px] tracking-[0.04em] text-amber">
          {prettify(a)}
        </span>
      ))}
      {uc.map((u) => (
        <span key={u} className="rounded bg-surface-hi px-1.5 py-[2px] font-mono text-[9.5px] tracking-[0.04em] text-text-sec">
          {prettify(u)}
        </span>
      ))}
      {duration && (
        <span className="ml-auto font-mono text-[9.5px] text-text-muted">{duration}</span>
      )}
    </div>
  );
};

const SearchInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <label className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] focus-within:border-amber">
    <span className="text-text-muted">⌕</span>
    <input
      type="search"
      placeholder="Search blueprints…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[200px] bg-transparent text-text placeholder:text-text-muted outline-none"
    />
  </label>
);

const FilterSelect: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}> = ({ label, value, onChange, options }) => {
  const active = value !== 'any';
  return (
    <label className={cn(
      'inline-flex items-center gap-1.5 rounded-md border bg-surface pl-2.5 pr-1.5 text-[11.5px]',
      active ? 'border-amber text-text' : 'border-border text-text-sec',
    )}>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-1.5 pr-1 outline-none"
      >
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </label>
  );
};

function collectFacet(items: Blueprint[], key: 'audience' | 'useCase'): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const b of items) {
    for (const v of b[key] ?? []) m.set(v, (m.get(v) ?? 0) + 1);
  }
  return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
}

function prettify(s: string): string {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function byForkCountDesc(a: Blueprint, b: Blueprint): number {
  return (b.forkCount || 0) - (a.forkCount || 0);
}

export default Explore;
