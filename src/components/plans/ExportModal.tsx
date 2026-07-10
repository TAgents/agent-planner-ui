/**
 * ExportModal — a centered dialog on the plan detail header that lets a user take
 * a plan out of the system as a portable file (Markdown or Word). Both formats
 * are rendered client-side from data the page already holds; export is a read
 * action, so this respects the agent-first read-only plan-page contract.
 *
 * Follows the same pattern as the Move / Save-as-Blueprint affordances: a header
 * GhostButton opens this centered modal, and the format is chosen inside it.
 */
import React, { useState } from 'react';
import { GhostButton, Kicker, PrimaryButton } from '../v1';
import type { Plan, PlanNode } from '../../types';
import { exportPlanAsMarkdown, exportPlanAsWord, LogsByNode, NodeLogEntry } from '../../utils/planExport';
import { request } from '../../services/api-client';

type ExportFormat = 'markdown' | 'word';

/** Flatten a hierarchical node tree (each node may carry a `children` array)
 *  into a flat list, matching the shape the exporter walks. */
function flattenNodes(nodes: any[]): PlanNode[] {
  const out: PlanNode[] = [];
  const walk = (arr: any[]) => {
    for (const n of arr || []) {
      if (!n) continue;
      const { children, ...rest } = n;
      out.push(rest as PlanNode);
      if (Array.isArray(children) && children.length) walk(children);
    }
  };
  walk(nodes);
  return out;
}

/** Fetch the plan's full node rows. The tree-list endpoint the page uses strips
 *  description / agent_instructions for payload size; `include_details=true`
 *  switches the API to the full node serializer so the export can show each
 *  task's explanation. */
async function fetchDetailedNodes(planId: string): Promise<PlanNode[]> {
  const res = await request<any>({
    method: 'GET',
    url: `/plans/${planId}/nodes`,
    params: { include_root: 'true', include_details: 'true' },
  });
  return flattenNodes(Array.isArray(res) ? res : []);
}

/** Fetch a plan's full activity — logs AND comments — from the unified timeline
 *  and group it into a { nodeId → entries } map, so the export embeds the whole
 *  context under each task. Pages until the timeline is exhausted. */
async function fetchLogsByNode(planId: string): Promise<LogsByNode> {
  const out: LogsByNode = {};
  const limit = 200;
  for (let offset = 0; offset < 20000; offset += limit) {
    const page = await request<any>({
      method: 'GET',
      url: `/timeline`,
      params: { plan_id: planId, kind: 'log,comment', limit, offset },
    });
    const entries: any[] = Array.isArray(page?.entries) ? page.entries : [];
    for (const e of entries) {
      if (!e.node_id) continue;
      const mapped: NodeLogEntry = {
        id: e.id,
        node_id: e.node_id,
        kind: e.kind,
        content: e.content,
        log_type: e.entry_type,
        created_at: e.created_at,
        actor_type: e.actor_type,
        user: e.actor_name ? { name: e.actor_name } : null,
      };
      (out[e.node_id] ||= []).push(mapped);
    }
    if (!page?.pagination?.has_more) break;
  }
  return out;
}

const ExportModal: React.FC<{
  plan: Plan;
  nodes: PlanNode[];
  onClose: () => void;
}> = ({ plan, nodes, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setBusy(true);
    // The tree-list nodes the page hands in omit description/agent_instructions
    // (the list endpoint strips them). Fetch the full node rows and the activity
    // log in parallel so the export carries each task's explanation and history;
    // fall back to whatever we have rather than failing the download.
    let exportNodes: PlanNode[] = nodes || [];
    let logsByNode: LogsByNode = {};
    if (plan.id) {
      const [detailed, logs] = await Promise.all([
        fetchDetailedNodes(plan.id).catch(() => [] as PlanNode[]),
        fetchLogsByNode(plan.id).catch(() => ({} as LogsByNode)),
      ]);
      if (detailed.length) exportNodes = detailed;
      logsByNode = logs;
    }
    try {
      const fn = format === 'word' ? exportPlanAsWord : exportPlanAsMarkdown;
      fn(plan, exportNodes, logsByNode);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to export plan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-border bg-surface p-6"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Kicker className="block">Export</Kicker>
        <h2 className="mt-1 font-display text-[18px] font-semibold tracking-[-0.02em] text-text">
          Download this plan
        </h2>
        <p className="mt-1 text-[12.5px] text-text-sec">
          Exports the whole plan — phases, tasks, dependencies, and the complete
          activity log (every task's logs and comments). The file is generated
          locally in your browser and downloaded straight to your device — nothing
          is uploaded.
        </p>

        <label className="mt-4 block">
          <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">Format</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            className="mt-1.5 w-full rounded-md border border-border bg-bg px-3 py-2 text-[13px] text-text outline-none focus:border-amber"
          >
            <option value="markdown">Markdown — .md</option>
            <option value="word">Word — .doc</option>
          </select>
        </label>

        {error && (
          <div className="mt-3 rounded-md border border-red bg-red/[0.08] px-3 py-2 text-[12px] text-red">
            {error}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose} disabled={busy}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={busy}>
            {busy ? 'Exporting…' : 'Export'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
