import { useQuery } from 'react-query';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  version?: string;
}

export interface WorkflowStep {
  name: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  startedAt?: string;
  finishedAt?: string;
  output?: any;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflowName: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  startedAt: string;
  finishedAt?: string;
  steps?: WorkflowStep[];
  triggeredBy?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowEvent {
  id: string;
  key: string;
  payload?: any;
  createdAt: string;
}

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000';

async function fetchApi(path: string) {
  const sessionStr = localStorage.getItem('auth_session');
  let token: string | null = null;
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      token = session.access_token || session.accessToken || session;
    } catch { token = sessionStr; }
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/workflows${path}`, { headers });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
  return res.json();
}

export function useWorkflowTemplates() {
  return useQuery<WorkflowTemplate[]>('workflow-templates', async () => {
    const data = await fetchApi('/templates');
    // Hatchet returns { workflows: { rows: [...] } } or { workflows: [...] }
    const raw = data.workflows;
    const list = Array.isArray(raw) ? raw : (raw?.rows || []);
    return list.map((w: any) => ({
      id: w.id || w.metadata?.id || '',
      name: w.name,
      description: w.description,
      version: w.version,
    }));
  });
}

export function useWorkflowRuns(filters?: { status?: string; limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));
  const qs = params.toString();

  return useQuery<WorkflowRun[]>(['workflow-runs', filters], async () => {
    const data = await fetchApi(`/runs${qs ? `?${qs}` : ''}`);
    const rows = data.rows || data || [];
    // Hatchet rows have metadata.id instead of top-level id
    return rows.map((r: any) => ({
      id: r.id || r.metadata?.id || r.workflowRunExternalId || r.taskExternalId || '',
      workflowName: r.workflowName || '',
      status: (r.status || 'pending').toLowerCase(),
      startedAt: r.startedAt || r.createdAt || r.metadata?.createdAt || '',
      finishedAt: r.finishedAt || r.metadata?.updatedAt,
      steps: r.steps,
      triggeredBy: r.triggeredBy,
      metadata: r.metadata,
    }));
  }, { refetchInterval: 10000, refetchIntervalInBackground: false });
}

export function useWorkflowRun(runId: string | null) {
  return useQuery<WorkflowRun>(['workflow-run', runId], async () => {
    if (!runId) throw new Error('No run ID');
    const r: any = await fetchApi(`/runs/${runId}`);
    return {
      id: r.id || r.metadata?.id || r.workflowRunExternalId || '',
      workflowName: r.workflowName || '',
      status: (r.status || 'pending').toLowerCase(),
      startedAt: r.startedAt || r.createdAt || r.metadata?.createdAt || '',
      finishedAt: r.finishedAt || r.metadata?.updatedAt,
      steps: r.steps,
      triggeredBy: r.triggeredBy,
      metadata: r.metadata,
    };
  }, { enabled: !!runId, refetchInterval: 5000, refetchIntervalInBackground: false });
}

export function useWorkflowEvents(filters?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));
  const qs = params.toString();

  return useQuery<WorkflowEvent[]>('workflow-events', async () => {
    const data = await fetchApi(`/events${qs ? `?${qs}` : ''}`);
    const rows = data.rows || data || [];
    return rows.map((e: any) => ({
      id: e.id || e.metadata?.id || '',
      key: e.key || '',
      payload: e.payload,
      createdAt: e.createdAt || e.metadata?.createdAt || '',
    }));
  }, { refetchInterval: 15000, refetchIntervalInBackground: false });
}
