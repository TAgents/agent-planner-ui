/**
 * planExport — render a plan + its node tree into a portable document
 * (Markdown or Word) and trigger a client-side download. Pure string building
 * over data the Plan detail page already has in hand (plan + flat node list);
 * no network calls.
 *
 * Export is a read action, so it stays compatible with the agent-first
 * read-only contract for plan pages.
 */
import type { Plan, PlanNode, NodeStatus, NodeType } from '../types';
import { getStatusLabel, getNodeTypeLabel, formatDate } from './planUtils';

const STATUS_GLYPH: Record<NodeStatus, string> = {
  not_started: '○',
  in_progress: '◐',
  completed: '✓',
  blocked: '⚠',
  plan_ready: '◇',
};

/** Container node types render as headings/bullets; leaf work as checkboxes. */
const isCheckable = (type: NodeType): boolean => type === 'task' || type === 'milestone';

/** Depth-first order matching the tree view: children sorted by created_at. */
function orderedRows(nodes: PlanNode[]): Array<{ node: PlanNode; depth: number }> {
  const byParent = new Map<string | null, PlanNode[]>();
  for (const n of nodes) {
    const key = (n.parent_id as string | undefined) || null;
    const arr = byParent.get(key) || [];
    arr.push(n);
    byParent.set(key, arr);
  }
  for (const arr of Array.from(byParent.values())) {
    arr.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  }
  const out: Array<{ node: PlanNode; depth: number }> = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const n of byParent.get(parentId) || []) {
      out.push({ node: n, depth });
      walk(n.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** Rows to render (drop the synthetic root) plus the depth to subtract so its
 *  children sit at the top level. Shared by every export format. */
function renderRows(nodes: PlanNode[]): { rows: Array<{ node: PlanNode; depth: number }>; baseDepth: number } {
  const all = orderedRows(nodes);
  const hasRoot = all.some((r) => r.node.node_type === 'root');
  return { rows: all.filter((r) => r.node.node_type !== 'root'), baseDepth: hasRoot ? 1 : 0 };
}

/** Metadata entries as label/value pairs — read straight off server fields
 *  (rollup), never recomputed here. Shared by Markdown + Word. */
function metaEntries(plan: Plan): Array<{ label: string; value: string }> {
  const meta: Array<{ label: string; value: string }> = [];
  meta.push({ label: 'Status', value: getStatusLabel(plan.status as NodeStatus) });
  const pct = plan.rollup?.progress_pct ?? plan.progress;
  if (typeof pct === 'number') {
    const done = plan.rollup?.completed_work ?? plan.stats?.done;
    const total = plan.rollup?.total_work ?? plan.stats?.total;
    meta.push({
      label: 'Progress',
      value:
        typeof done === 'number' && typeof total === 'number'
          ? `${pct}% (${done}/${total} done)`
          : `${pct}%`,
    });
  }
  if (plan.visibility) meta.push({ label: 'Visibility', value: String(plan.visibility) });
  if (plan.created_at) meta.push({ label: 'Created', value: formatDate(plan.created_at) });
  return meta;
}

/** Inline tags shown after a checkable node: status · mode · due. */
function nodeTags(node: PlanNode): string[] {
  const tags: string[] = [getStatusLabel(node.status)];
  if (node.task_mode && node.task_mode !== 'free') tags.push(`mode: ${node.task_mode}`);
  if (node.due_date) tags.push(`due ${formatDate(node.due_date)}`);
  return tags;
}

/** Indent a multi-line block so it nests under a Markdown list item. */
function indentBlock(text: string, pad: string): string {
  return text
    .trim()
    .split('\n')
    .map((line) => (line.trim() ? `${pad}${line}` : ''))
    .join('\n');
}

/* ─────────────────────────────── Activity ─────────────────────────────── */

/** One activity entry under a node — a log (progress / reasoning / decision /
 *  challenge) or a comment. Built by the caller from the plan timeline so both
 *  kinds land in the export, not just logs. */
export interface NodeLogEntry {
  id: string;
  /** Used to group entries by task. */
  node_id?: string;
  /** Distinguishes a log from a comment in the rendered label. */
  kind?: 'log' | 'comment' | 'event';
  content: string;
  log_type?: 'progress' | 'reasoning' | 'challenge' | 'decision' | string;
  created_at: string;
  actor_type?: string | null;
  user?: { id?: string; name?: string; email?: string } | null;
}

/** Node id → that node's activity entries. Built by the caller from the timeline. */
export type LogsByNode = Record<string, NodeLogEntry[]>;

/** Full date+time (with year) for a log timestamp — logs deserve more precision
 *  than the month/day formatDate used for plan metadata. */
function formatLogTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Entries oldest→newest so a node's activity reads as a narrative. */
function orderedLogs(logs: NodeLogEntry[]): NodeLogEntry[] {
  return [...logs].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
}

/** Short header for one entry: when · who · type (e.g. "comment" or "progress"). */
function logLabel(log: NodeLogEntry): string {
  const actor =
    log.user?.name ||
    (log.actor_type ? log.actor_type[0].toUpperCase() + log.actor_type.slice(1) : 'System');
  const type = log.kind === 'comment' ? 'comment' : log.log_type || log.kind;
  const parts = [formatLogTime(log.created_at), actor];
  if (type) parts.push(type);
  return parts.join(' · ');
}

/** Render one log as a Markdown list item at the given indent. */
function logMarkdown(log: NodeLogEntry, pad: string): string {
  const lines = [`${pad}- _${logLabel(log)}_`];
  const body = (log.content || '').trim();
  if (body) {
    lines.push('');
    lines.push(indentBlock(body, `${pad}  `));
    lines.push('');
  }
  return lines.join('\n');
}

/* ─────────────────────────────── Markdown ─────────────────────────────── */

/** Build the Markdown document for a plan and its nodes. Pass `logsByNode` (each
 *  node's full logs) to embed the whole activity context under every task. */
export function planToMarkdown(plan: Plan, nodes: PlanNode[], logsByNode: LogsByNode = {}): string {
  const lines: string[] = [];

  lines.push(`# ${plan.title || 'Untitled Plan'}`);
  lines.push('');

  if (plan.description && plan.description.trim()) {
    lines.push(plan.description.trim());
    lines.push('');
  }

  lines.push(metaEntries(plan).map((m) => `**${m.label}:** ${m.value}`).join(' · '));
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Structure');
  lines.push('');

  const { rows, baseDepth } = renderRows(nodes);

  if (rows.length === 0) {
    lines.push('_No tasks yet._');
    lines.push('');
  }

  for (const { node, depth } of rows) {
    const level = Math.max(0, depth - baseDepth);
    const pad = '  '.repeat(level);
    const glyph = STATUS_GLYPH[node.status] || '•';

    let head: string;
    if (isCheckable(node.node_type)) {
      const box = node.status === 'completed' ? '[x]' : '[ ]';
      head = `${pad}- ${box} ${glyph} ${node.title}`;
      head += ` — ${nodeTags(node).map((t, i) => (i === 0 ? `_${t}_` : t)).join(' · ')}`;
    } else {
      // phase / other container
      head = `${pad}- ${glyph} **${node.title}** _(${getNodeTypeLabel(node.node_type)})_`;
    }
    lines.push(head);

    if (node.description && node.description.trim()) {
      lines.push('');
      lines.push(indentBlock(node.description, `${pad}  `));
      lines.push('');
    }

    const nodeLogs = logsByNode[node.id];
    if (nodeLogs && nodeLogs.length) {
      const ordered = orderedLogs(nodeLogs);
      lines.push('');
      lines.push(`${pad}  **Activity** (${ordered.length})`);
      lines.push('');
      for (const log of ordered) lines.push(logMarkdown(log, `${pad}  `));
      lines.push('');
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`_Exported from AgentPlanner${plan.id ? ` · plan ${plan.id}` : ''}._`);
  lines.push('');

  return lines.join('\n');
}

/* ───────────────────────────────── Word ───────────────────────────────── */

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Description text → escaped HTML paragraphs (blank line separates paragraphs). */
function descHtml(text: string): string {
  return text
    .trim()
    .split(/\n{2,}/)
    .map((p) => `<p class="desc">${esc(p.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('');
}

/** Render a node's logs as an HTML activity block. */
function activityHtml(logs: NodeLogEntry[], marginLeft: number): string {
  const items = logs
    .map((log) => {
      const body = (log.content || '').trim();
      const bodyHtml = body ? `<div class="log-body">${esc(body).replace(/\n/g, '<br/>')}</div>` : '';
      return `<div class="log"><span class="log-head">${esc(logLabel(log))}</span>${bodyHtml}</div>`;
    })
    .join('\n');
  return `<div class="activity" style="margin-left:${marginLeft}px"><div class="activity-label">Activity (${logs.length})</div>${items}</div>`;
}

/** Build a Word-openable HTML document (.doc) for a plan and its nodes. Word,
 *  Google Docs and LibreOffice all open HTML saved with a .doc extension. Pass
 *  `logsByNode` to embed each node's full activity context. */
export function planToWordHtml(plan: Plan, nodes: PlanNode[], logsByNode: LogsByNode = {}): string {
  const { rows, baseDepth } = renderRows(nodes);

  const items = rows
    .map(({ node, depth }) => {
      const level = Math.max(0, depth - baseDepth);
      const indent = 18 + level * 22; // px left padding per depth
      const glyph = STATUS_GLYPH[node.status] || '•';

      let title: string;
      let tags = '';
      if (isCheckable(node.node_type)) {
        const box = node.status === 'completed' ? '☑' : '☐';
        title = `<span class="box">${box}</span> <span class="glyph">${glyph}</span> ${esc(node.title)}`;
        tags = ` <span class="tags">— ${esc(nodeTags(node).join(' · '))}</span>`;
      } else {
        title = `<span class="glyph">${glyph}</span> <strong>${esc(node.title)}</strong> <span class="type">(${esc(getNodeTypeLabel(node.node_type))})</span>`;
      }

      const desc = node.description && node.description.trim() ? descHtml(node.description) : '';
      const nodeLogs = logsByNode[node.id];
      const activity = nodeLogs && nodeLogs.length ? activityHtml(orderedLogs(nodeLogs), 22) : '';
      return `<div class="node" style="margin-left:${indent}px">${title}${tags}${desc}${activity}</div>`;
    })
    .join('\n');

  const metaRow = metaEntries(plan)
    .map((m) => `<strong>${esc(m.label)}:</strong> ${esc(m.value)}`)
    .join(' &nbsp;·&nbsp; ');

  const desc = plan.description && plan.description.trim() ? `<p class="lead">${esc(plan.description.trim()).replace(/\n/g, '<br/>')}</p>` : '';

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"/>
<title>${esc(plan.title || 'Untitled Plan')}</title>
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
  h1 { font-size: 20pt; margin: 0 0 6pt; }
  .lead { color: #333; margin: 0 0 10pt; }
  .meta { color: #555; font-size: 10pt; margin: 0 0 12pt; }
  hr { border: none; border-top: 1px solid #ccc; margin: 12pt 0; }
  h2 { font-size: 13pt; margin: 0 0 8pt; }
  .node { margin: 4pt 0; }
  .box { font-size: 12pt; }
  .glyph { color: #888; }
  .type { color: #888; font-style: italic; }
  .tags { color: #666; font-style: italic; font-size: 9.5pt; }
  .desc { color: #333; margin: 2pt 0 4pt 22px; }
  .activity { margin: 4pt 0 8pt; }
  .activity-label { color: #555; font-size: 9.5pt; font-weight: bold; margin: 4pt 0 2pt; }
  .log { margin: 2pt 0; padding-left: 8px; border-left: 2px solid #e5e5e5; }
  .log-head { color: #777; font-size: 9pt; font-style: italic; }
  .log-body { color: #333; font-size: 10pt; margin: 1pt 0 3pt; }
  .footer { color: #888; font-size: 9pt; font-style: italic; margin-top: 14pt; }
</style>
</head>
<body>
<h1>${esc(plan.title || 'Untitled Plan')}</h1>
${desc}
<p class="meta">${metaRow}</p>
<hr/>
<h2>Structure</h2>
${items || '<p><em>No tasks yet.</em></p>'}
<hr/>
<p class="footer">Exported from AgentPlanner${plan.id ? ` · plan ${esc(plan.id)}` : ''}.</p>
</body>
</html>`;
}

/* ─────────────────────────────── Download ─────────────────────────────── */

/** Slugify a title into a safe filename stem, with the given extension. */
export function planFilename(plan: Plan, ext = 'md'): string {
  const slug = (plan.title || 'plan')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug || 'plan'}.${ext}`;
}

/** Trigger a browser download of a text file. */
export function downloadTextFile(filename: string, content: string, mime = 'text/markdown'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Convenience: build + download a plan's Markdown in one call. */
export function exportPlanAsMarkdown(plan: Plan, nodes: PlanNode[], logsByNode: LogsByNode = {}): void {
  downloadTextFile(planFilename(plan, 'md'), planToMarkdown(plan, nodes, logsByNode), 'text/markdown');
}

/** Convenience: build + download a plan as a Word-openable .doc in one call. */
export function exportPlanAsWord(plan: Plan, nodes: PlanNode[], logsByNode: LogsByNode = {}): void {
  downloadTextFile(planFilename(plan, 'doc'), planToWordHtml(plan, nodes, logsByNode), 'application/msword');
}
