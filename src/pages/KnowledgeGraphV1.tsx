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
  Kicker,
  Pill,
  PrimaryButton,
  SectionHead,
} from '../components/v1';
import {
  useGraphitiEntitySearchMutation,
  useGraphitiFactSearchMutation,
} from '../hooks/useGraphitiKnowledge';
import type { GraphitiEntity, GraphitiFact } from '../services/knowledge.service';

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
 * No auto-load on mount (Graphiti search isn't free). User picks a
 * topic, the canvas renders, click a node to populate the inspector.
 */
const KnowledgeGraphV1: React.FC = () => {
  const [draftQuery, setDraftQuery] = useState('');
  const [state, setState] = useState<GraphState>({ entities: [], facts: [], query: '' });
  const [selected, setSelected] = useState<string | null>(null);

  const entitySearch = useGraphitiEntitySearchMutation();
  const factSearch = useGraphitiFactSearchMutation();

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = draftQuery.trim();
    if (!q) return;
    setSelected(null);
    const [er, fr] = await Promise.allSettled([
      entitySearch.mutateAsync({ query: q, maxResults: 30 }),
      factSearch.mutateAsync({ query: q, maxResults: 60 }),
    ]);
    // useGraphitiEntitySearchMutation already unwraps to { entities: [...], group_id }.
    // useGraphitiFactSearchMutation already unwraps to { facts: [...], group_id, method }.
    // Earlier shape `entities.nodes` / `results.facts` was the raw bridge response —
    // re-reading it here always produced `[]`.
    setState({
      query: q,
      entities: er.status === 'fulfilled' ? (er.value as any)?.entities || [] : [],
      facts: fr.status === 'fulfilled' ? (fr.value as any)?.facts || [] : [],
    });
  };

  const isLoading = entitySearch.isLoading || factSearch.isLoading;

  // Position entities in a circle + a center hub if there's a clear
  // query-matching entity. No physics simulation; this is enough at
  // MVP scale and avoids a force-layout dependency.
  const nodes = useMemo<Node[]>(() => {
    const radius = 280;
    const cx = 360;
    const cy = 280;
    if (state.entities.length === 0) return [];
    return state.entities.slice(0, 24).map((e, i, arr) => {
      const angle = (i / arr.length) * 2 * Math.PI - Math.PI / 2;
      const isSelected = selected === e.uuid;
      return {
        id: e.uuid,
        position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
        data: {
          label: e.name || 'Entity',
        },
        style: {
          padding: '8px 12px',
          borderRadius: 999,
          border: `1.5px solid ${isSelected ? 'rgb(var(--amber))' : 'rgb(var(--border-hi))'}`,
          background: isSelected ? 'rgb(var(--amber-soft))' : 'rgb(var(--surface))',
          color: 'rgb(var(--text))',
          fontFamily: 'Space Grotesk, system-ui, sans-serif',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        sourcePosition: 'right' as any,
        targetPosition: 'left' as any,
      };
    });
  }, [state.entities, selected]);

  const edges = useMemo<Edge[]>(() => {
    const entityIds = new Set(state.entities.map((e) => e.uuid));
    return state.facts
      .filter((f) => f.source_node_uuid && f.target_node_uuid)
      .filter((f) => entityIds.has(f.source_node_uuid as string) && entityIds.has(f.target_node_uuid as string))
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
  }, [state.entities, state.facts]);

  const selectedEntity = state.entities.find((e) => e.uuid === selected) || null;
  const selectedFacts = selectedEntity
    ? state.facts.filter(
        (f) =>
          f.source_node_uuid === selectedEntity.uuid ||
          f.target_node_uuid === selectedEntity.uuid,
      )
    : [];

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10 sm:px-9">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <Kicker className="mb-2">◆ Knowledge</Kicker>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.035em] text-text">
            Graph
          </h1>
          <p className="mt-1 text-[13px] text-text-sec">
            Entities and the facts that connect them. Search a topic to render the local neighborhood.
          </p>
        </div>
      </header>

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
        {state.query && (
          <GhostButton
            onClick={() => {
              setDraftQuery('');
              setState({ entities: [], facts: [], query: '' });
              setSelected(null);
            }}
          >
            Clear
          </GhostButton>
        )}
      </form>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card pad={0} className="overflow-hidden">
          <div className="border-b border-border px-[18px] py-3">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-text-muted">
              ◇ {state.query ? `${state.entities.length} entities · ${state.facts.length} facts` : 'idle'}
            </span>
          </div>
          <div style={{ height: 540 }}>
            {state.entities.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[12.5px] text-text-muted">
                Enter a topic above to render the graph.
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={(_, n) => setSelected(n.id)}
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
            title={selectedEntity?.name || 'Pick a node'}
            right={selectedEntity ? <Pill color="violet">{selectedEntity.entity_type || 'entity'}</Pill> : null}
          />
          {!selectedEntity ? (
            <p className="text-[12.5px] text-text-sec">
              Click any node in the graph to see its summary, type, and the facts touching it.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedEntity.summary && (
                <p className="text-[12.5px] leading-[1.55] text-text-sec">{selectedEntity.summary}</p>
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
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default KnowledgeGraphV1;
