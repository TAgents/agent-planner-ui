/**
 * Timeline Service — the unified events + logs + comments spine.
 * One read path (GET /timeline) + the comment write path.
 */
import { request } from './api-client';

// ── Types ──────────────────────────────────────────────────

export type TimelineKind = 'event' | 'log' | 'comment';
export type ActorType = 'human' | 'agent' | 'system';
export type SubjectType = 'node' | 'plan' | 'goal' | 'workspace' | 'org';

export interface TimelineProvenance {
  surface?: 'ui' | 'mcp' | 'api' | 'cron';
  client_label?: string | null;
  ip?: string | null;
  token_id?: string | null;
  work_mode?: 'shadow' | 'suggest' | 'assist' | 'autonomous';
  policy_id?: string | null;
  model?: string | null;
  runtime?: string | null;
  prompt_hash?: string | null;
}

export interface TimelineEntry {
  id: string;
  created_at: string;
  kind: TimelineKind;
  entry_type: string;
  subject_type: SubjectType;
  subject_id: string;
  node_id: string | null;
  plan_id: string | null;
  goal_id: string | null;
  workspace_id: string | null;
  org_id: string | null;
  actor_type: ActorType | null;
  actor_id: string | null;
  actor_name: string | null;
  content: string | null;
  payload: Record<string, any>;
  provenance: TimelineProvenance;
  correlation_id: string | null;
  parent_id: string | null;
  tags: string[];
  edited_at: string | null;
  deleted_at: string | null;
}

export interface TimelineQuery {
  planId?: string;
  goalId?: string;
  workspaceId?: string;
  nodeId?: string;
  subjectType?: SubjectType;
  subjectId?: string;
  kind?: TimelineKind | TimelineKind[];
  entryType?: string;
  actorId?: string;
  correlationId?: string;
  limit?: number;
  offset?: number;
}

export interface TimelinePage {
  entries: TimelineEntry[];
  pagination: { limit: number; offset: number; total: number; has_more: boolean };
}

export interface TraceResponse {
  correlation_id: string;
  entries: TimelineEntry[];
}

function toParams(q: TimelineQuery): Record<string, any> {
  const p: Record<string, any> = {};
  if (q.planId) p.plan_id = q.planId;
  if (q.goalId) p.goal_id = q.goalId;
  if (q.workspaceId) p.workspace_id = q.workspaceId;
  if (q.nodeId) p.node_id = q.nodeId;
  if (q.subjectType) p.subject_type = q.subjectType;
  if (q.subjectId) p.subject_id = q.subjectId;
  if (q.kind) p.kind = Array.isArray(q.kind) ? q.kind.join(',') : q.kind;
  if (q.entryType) p.entry_type = q.entryType;
  if (q.actorId) p.actor_id = q.actorId;
  if (q.correlationId) p.correlation_id = q.correlationId;
  if (q.limit != null) p.limit = q.limit;
  if (q.offset != null) p.offset = q.offset;
  return p;
}

export const timelineService = {
  getTimeline: (q: TimelineQuery): Promise<TimelinePage> =>
    request<TimelinePage>({ method: 'GET', url: '/timeline', params: toParams(q) }),

  getTrace: (correlationId: string): Promise<TraceResponse> =>
    request<TraceResponse>({ method: 'GET', url: `/timeline/traces/${correlationId}` }),

  addComment: (input: { subject_type: SubjectType; subject_id: string; content: string; comment_type?: ActorType }): Promise<TimelineEntry> =>
    request<TimelineEntry>({ method: 'POST', url: '/timeline/comments', data: input }),

  editComment: (id: string, content: string): Promise<TimelineEntry> =>
    request<TimelineEntry>({ method: 'PATCH', url: `/timeline/comments/${id}`, data: { content } }),

  deleteComment: (id: string): Promise<void> =>
    request<void>({ method: 'DELETE', url: `/timeline/comments/${id}` }),
};

export default timelineService;
