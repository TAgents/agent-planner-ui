import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Card,
  GhostButton,
  Pill,
  PrimaryButton,
  SectionHead,
} from '../components/v1';
import { Link } from 'react-router-dom';
import {
  useGraphitiEntitySearchMutation,
  useGraphitiFactSearchMutation,
  useEpisodeTaskLinks,
  useGraphitiEpisodes,
} from '../hooks/useGraphitiKnowledge';
import type { GraphitiEntity, GraphitiFact, GraphitiEpisode } from '../services/knowledge.service';
import KnowledgeHeader from '../components/knowledge/KnowledgeHeader';

type GraphState = {
  entities: GraphitiEntity[];
  facts: GraphitiFact[];
  query: string;
};

/**
 * Knowledge — Graph lens (Phase 5 task 257be237). The third surface in
 * the Timeline / Coverage / Graph trio. Search-driven: a query
 * triggers parallel entity + fact searches in Graphiti; entities
 * become react-flow nodes, facts become labeled edges.
 *
 * Default view: on mount the canvas seeds itself from recent episodes
 * (a semantic query built from their titles) so the graph shows the
 * org's recent knowledge instead of an empty "enter a topic" prompt.
 * Typing a query refines/zooms; Clear returns to the recent-activity view.
 */
const KnowledgeGraphV1: React.FC = () => {
  const [draftQuery, setDraftQuery] = useState('');
  const [state, setState] = useState<GraphState>({ entities: [], facts: [], query: '' });
  const [selected, setSelected] = useState<string | null>(null);
  // True while the canvas shows the auto-seeded recent-activity graph
  // (no explicit user query). Drives the "recent activity" header label.
  const [defaultMode, setDefaultMode] = useState(false);
  const [didAutoLoad, setDidAutoLoad] = useState(false);

  const entitySearch = useGraphitiEntitySearchMutation();
  const factSearch = useGraphitiFactSearchMutation();
  // Recent episodes seed the default graph. Small page — just enough to
  // build a representative semantic query from their titles.
  const recentEpisodes = useGraphitiEpisodes(15);

  const runSearch = async (q: string, isDefault = false) => {
    if (!q) return;
    setSelected(null);
    setDefaultMode(isDefault);
    const [er, fr] = await Promise.allSettled([
      entitySearch.mutateAsync({ query: q, maxResults: 30 }),
      factSearch.mutateAsync({ query: q, maxResults: 60 }),
    ]);
    // useGraphitiEntitySearchMutation already unwraps to { entities: [...], group_id }.
    // useGraphitiFactSearchMutation already unwraps to { facts: [...], group_id, method }.
    setState({
      query: q,
      entities: er.status === 'fulfilled' ? (er.value as any)?.entities || [] : [],
      facts: fr.status === 'fulfilled' ? (fr.value as any)?.facts || [] : [],
    });
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    runSearch(draftQuery.trim(), false);
  };

  // Auto-seed the default graph once recent episodes are available. The
  // seed query is the distinct significant words from recent episode
  // titles — a cheap proxy for "what this org has been working on".
  useEffect(() => {
    if (didAutoLoad) return;
    const episodes = recentEpisodes.data?.episodes;
    if (!episodes || episodes.length === 0) return;
    const words = Array.from(
      new Set(
        episodes
          .map((ep: GraphitiEpisode) => ep.name || '')
          .join(' ')
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w: string) => w.length > 3),
      ),
    ).slice(0, 12);
    setDidAutoLoad(true);
    if (words.length > 0) runSearch(words.join(' '), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentEpisodes.data, didAutoLoad]);

  const isLoading = entitySearch.isLoading || factSearch.isLoading;
  const isSeeding = recentEpisodes.isLoading || (!didAutoLoad && !state.query);

  // Build the graph node set from the UNION of entity-search results and
  // the endpoints of every fact. Entity search (search_nodes) and fact
  // search (search_memory_facts) are independent Graphiti queries, so a
  // fact's endpoints are usually NOT among the searched entities. Drawing
  // only searched entities — and requiring both endpoints to be in that
  // set — filtered out nearly every edge, leaving isolated islands. Facts
  // carry source_node_name / target_node_name, so endpoints not returned
  // by the entity search still get a real label.
  const graphNodes = useMemo(() => {
    const map = new Map<
      string,
      { id: string; name: string; entity_type?: string; summary?: string; fromSearch: boolean }
    >();
    for (const e of state.entities) {
      if (!e.uuid) continue;
      map.set(e.uuid, {
        id: e.uuid,
        name: e.name || 'Entity',
        entity_type: e.entity_type,
        summary: e.summary,
        fromSearch: true,
      });
    }
    for (const f of state.facts) {
      if (f.source_node_uuid && !map.has(f.source_node_uuid)) {
        map.set(f.source_node_uuid, { id: f.source_node_uuid, name: f.source_node_name || 'Entity', fromSearch: false });
      }
      if (f.target_node_uuid && !map.has(f.target_node_uuid)) {
        map.set(f.target_node_uuid, { id: f.target_node_uuid, name: f.target_node_name || 'Entity', fromSearch: false });
      }
    }
    return map;
  }, [state.entities, state.facts]);

  // Position nodes in a circle. No physics simulation; this is enough at
  // MVP scale and avoids a force-layout dependency.
  const nodes = useMemo<Node[]>(() => {
    const radius = 280;
    const cx = 360;
    const cy = 280;
    const list = Array.from(graphNodes.values()).slice(0, 40);
    if (list.length === 0) return [];
    return list.map((e, i, arr) => {
      const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
      const isSelected = selected === e.id;
      return {
        id: e.id,
        position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
        data: {
          label: e.name || 'Entity',
        },
        style: {
          padding: '8px 12px',
          borderRadius: 999,
          // Searched entities get a solid border; fact-only endpoints a
          // dimmer dashed one so the canvas distinguishes the two.
          border: `1.5px ${e.fromSearch ? 'solid' : 'dashed'} ${
            isSelected ? 'rgb(var(--amber))' : e.fromSearch ? 'rgb(var(--border-hi))' : 'rgb(var(--border))'
          }`,
          background: isSelected ? 'rgb(var(--amber-soft))' : 'rgb(var(--surface))',
          color: e.fromSearch ? 'rgb(var(--text))' : 'rgb(var(--text-sec))',
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        sourcePosition: 'right' as any,
        targetPosition: 'left' as any,
      };
    });
  }, [graphNodes, selected]);

  const edges = useMemo<Edge[]>(() => {
    const nodeIds = new Set(Array.from(graphNodes.keys()).slice(0, 40));
    return state.facts
      .filter((f) => f.source_node_uuid && f.target_node_uuid)
      .filter((f) => nodeIds.has(f.source_node_uuid as string) && nodeIds.has(f.target_node_uuid as string))
      .map((f, i) => ({
        id: `${f.uuid || i}`,
        source: f.source_node_uuid as string,
        target: f.target_node_uuid as string,
        label: f.name || '',
        labelStyle: {
          fontFamily: 'JetBrains Mono, ui-monospace, monospace',
          fontSize: 8,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fill: 'rgb(var(--text-muted))',
        },
        style: { stroke: 'rgb(var(--border-hi))', strokeWidth: 1.2 },
      }));
  }, [graphNodes, state.facts]);

  const selectedNode = selected ? graphNodes.get(selected) || null : null;
  const selectedFacts = selected
    ? state.facts.filter(
        (f) => f.source_node_uuid === selected || f.target_node_uuid === selected,
      )
    : [];

  // Resolve plan/task tethers for EVERY episode referenced by the current
  // facts in one round-trip. Each link carries its episode_id + plan_id, so
  // we can (a) attribute an entity → plans for the cross-plan header stat,
  // and (b) scope the inspector's "Linked tasks" panel to the selected node.
  const allEpisodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const f of state.facts) for (const id of f.episodes || []) set.add(id);
    return Array.from(set);
  }, [state.facts]);
  const linksQ = useEpisodeTaskLinks(allEpisodeIds);

  // episode_id → set of plan_ids it links into.
  const episodePlans = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const l of linksQ.data?.links || []) {
      if (!l.episode_id) continue;
      if (!map.has(l.episode_id)) map.set(l.episode_id, new Set());
      map.get(l.episode_id)!.add(l.plan_id);
    }
    return map;
  }, [linksQ.data]);

  // Episode UUIDs referenced by the selected entity's facts.
  const entityEpisodeIds = useMemo(() => {
    const set = new Set<string>();
    for (const f of selectedFacts) {
      for (const id of f.episodes || []) set.add(id);
    }
    return set;
  }, [selectedFacts]);

  // Group the selected entity's episode→task links by node so the same task
  // appears once even if multiple episodes mention the entity.
  const linkedTasks = useMemo(() => {
    const byNode = new Map<
      string,
      { node_id: string; node_title: string; plan_id: string; plan_title: string; episode_count: number }
    >();
    for (const l of linksQ.data?.links || []) {
      if (l.episode_id && !entityEpisodeIds.has(l.episode_id)) continue;
      const cur = byNode.get(l.node_id);
      if (cur) cur.episode_count += 1;
      else
        byNode.set(l.node_id, {
          node_id: l.node_id,
          node_title: l.node_title,
          plan_id: l.plan_id,
          plan_title: l.plan_title,
          episode_count: 1,
        });
    }
    return Array.from(byNode.values()).sort((a, b) => b.episode_count - a.episode_count);
  }, [linksQ.data, entityEpisodeIds]);

  // Cross-plan entities: count graph nodes whose facts' episodes span more
  // than one plan. Drives the "N cross-plan" header stat (previously always
  // "—" because it keyed on a non-existent entity_id field).
  const crossPlanCount = useMemo(() => {
    let count = 0;
    for (const node of graphNodes.values()) {
      const plans = new Set<string>();
      for (const f of state.facts) {
        if (f.source_node_uuid !== node.id && f.target_node_uuid !== node.id) continue;
        for (const ep of f.episodes || []) {
          for (const p of episodePlans.get(ep) || []) plans.add(p);
        }
      }
      if (plans.size > 1) count++;
    }
    return count;
  }, [graphNodes, state.facts, episodePlans]);

  return (
    <div className="flex h-full flex-col">
      <KnowledgeHeader
        stats={[
          { value: graphNodes.size || '—', label: 'entities' },
          { value: crossPlanCount || '—', label: 'cross-plan', tone: 'amber' },
        ]}
        search={draftQuery}
        onSearchChange={setDraftQuery}
        searchPlaceholder="Search entities…"
      />
      <div className="flex-1 overflow-auto bg-bg">
        <div className="mx-auto max-w-[1200px] px-6 py-8 sm:px-9">

      <form onSubmit={submit} className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Topic, entity, or fact…"
          className="min-w-[260px] flex-1 rounded-md border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-text-muted focus:outline-none"
        />
        <PrimaryButton onClick={() => submit()} disabled={!draftQuery.trim() || isLoading}>
          {isLoading ? 'Searching…' : 'Search'}
        </PrimaryButton>
        {state.query && !defaultMode && (
          <GhostButton
            onClick={() => {
              // Return to the auto-seeded recent-activity view rather than
              // an empty canvas. Re-arming didAutoLoad re-fires the seed effect.
              setDraftQuery('');
              setSelected(null);
              setState({ entities: [], facts: [], query: '' });
              setDidAutoLoad(false);
            }}
          >
            Clear
          </GhostButton>
        )}
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          Layout: radial
        </span>
      </form>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card pad={0} className="overflow-hidden">
          <div className="border-b border-border px-[18px] py-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
              ◇{' '}
              {nodes.length > 0
                ? `${defaultMode ? 'recent activity · ' : ''}${graphNodes.size} entities · ${edges.length} facts`
                : isSeeding || isLoading
                ? 'mapping…'
                : 'idle'}
            </span>
          </div>
          <div style={{ height: 540 }}>
            {nodes.length === 0 ? (
              <div className="flex h-full items-center justify-center px-6 text-center text-[12.5px] text-text-muted">
                {isSeeding || isLoading
                  ? 'Mapping recent knowledge…'
                  : state.query
                  ? 'No entities matched. Try a broader topic.'
                  : 'No knowledge recorded yet. As agents add learnings, the graph fills in here.'}
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={(_, n) => setSelected(n.id)}
                onPaneClick={() => setSelected(null)}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background color="rgb(var(--border))" gap={24} />
                <Controls position="bottom-right" />
              </ReactFlow>
            )}
          </div>
        </Card>

        <Card pad={20}>
          <SectionHead
            kicker="◆ Entity"
            title={selectedNode?.name || 'Pick a node'}
            right={selectedNode ? <Pill color="violet">{selectedNode.entity_type || 'entity'}</Pill> : null}
          />
          {!selectedNode ? (
            <p className="text-[12.5px] text-text-sec">
              Click any node in the graph to see its summary, type, and the facts touching it.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedNode.summary && (
                <p className="text-[12.5px] leading-[1.55] text-text-sec">{selectedNode.summary}</p>
              )}
              <div>
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                  Recent facts
                </span>
                {selectedFacts.length === 0 ? (
                  <p className="text-[11.5px] text-text-muted">No facts in this neighborhood.</p>
                ) : (
                  <ul className="flex flex-col divide-y divide-border">
                    {selectedFacts.slice(0, 8).map((f) => (
                      <li key={f.uuid} className="py-2 text-[12px]">
                        {f.name && (
                          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-text-muted">
                            {f.name}
                          </span>
                        )}
                        <p className="mt-1 leading-[1.5] text-text-sec">{f.fact}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Linked tasks — entity → facts → episodes → episode_node_links */}
              <div>
                <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.16em] text-text-muted">
                  Linked tasks
                </span>
                {linksQ.isLoading ? (
                  <p className="text-[11.5px] text-text-muted">Resolving tethers…</p>
                ) : linkedTasks.length === 0 ? (
                  <p className="text-[11.5px] text-text-muted">
                    No plan tasks reference this entity yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {linkedTasks.slice(0, 6).map((t) => (
                      <li key={t.node_id}>
                        <Link
                          to={`/app/plans/${t.plan_id}?node=${t.node_id}`}
                          className="flex items-center justify-between gap-2 rounded border border-border bg-surface px-2 py-1 transition-colors hover:border-amber"
                          title={`${t.episode_count} episode${t.episode_count === 1 ? '' : 's'} reference this entity`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[12px] font-medium text-text">
                              {t.node_title}
                            </span>
                            <span className="block truncate font-mono text-[9.5px] uppercase tracking-[0.06em] text-text-muted">
                              {t.plan_title}
                            </span>
                          </span>
                          <span className="font-mono text-[10px] tabular-nums text-text-sec">
                            ×{t.episode_count}
                          </span>
                        </Link>
                      </li>
                    ))}
                    {linkedTasks.length > 6 && (
                      <li className="font-mono text-[10px] text-text-muted">
                        +{linkedTasks.length - 6} more
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphV1;
