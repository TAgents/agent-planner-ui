/**
 * PlanPulse — compact one-line plan health bar.
 *
 * "Do I need to do anything right now?"
 * Shows: health dot, pending decisions, knowledge gaps, blocked tasks, agent activity.
 * Agents drive, humans steer — this tells the human whether to steer or keep scrolling.
 */
import React from 'react';
import { useQuery } from 'react-query';
import {
  AlertTriangle,
  CheckCircle,
  Circle,
  MessageSquare,
  BookOpen,
  Ban,
  Activity,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api-client';

interface PlanPulseProps {
  planId: string;
}

interface PulseData {
  pendingDecisions: number;
  blockingDecisions: number;
  blockedTasks: number;
  knowledgeGaps: number;
  lastActivityAgo: string | null;
  lastActivityDays: number | null;
  totalTasks: number;
  completedTasks: number;
}

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const daysSince = (dateStr: string): number => {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
};

async function fetchPulseData(planId: string): Promise<PulseData> {
  const [decisionsRes, nodesRes, progressRes] = await Promise.all([
    api.get(`/plans/${planId}/decisions`, { params: { status: 'pending' } }).catch(() => ({ data: { data: [] } })),
    api.get(`/plans/${planId}/nodes`, { params: { flat: 'true', include_details: 'true' } }).catch(() => ({ data: [] })),
    api.get(`/plans/${planId}/progress`).catch(() => ({ data: { total: 0, completed: 0, blocked: 0 } })),
  ]);

  const decisions = Array.isArray(decisionsRes.data) ? decisionsRes.data : decisionsRes.data?.data || [];
  const nodes = Array.isArray(nodesRes.data) ? nodesRes.data : [];
  const progress = progressRes.data;

  const pendingDecisions = decisions.length;
  const blockingDecisions = decisions.filter((d: any) => d.urgency === 'blocking').length;

  // Knowledge gaps: nodes with stale_beliefs or contradiction_detected coherence status
  const knowledgeGaps = nodes.filter((n: any) =>
    n.coherence_status === 'stale_beliefs' || n.coherence_status === 'contradiction_detected'
  ).length;

  // Last activity: most recent updated_at across all nodes
  const timestamps = nodes
    .map((n: any) => n.updated_at)
    .filter(Boolean)
    .sort()
    .reverse();
  const lastActivity = timestamps[0] || null;

  return {
    pendingDecisions,
    blockingDecisions,
    blockedTasks: progress.blocked || 0,
    knowledgeGaps,
    lastActivityAgo: lastActivity ? formatTimeAgo(lastActivity) : null,
    lastActivityDays: lastActivity ? daysSince(lastActivity) : null,
    totalTasks: progress.total || 0,
    completedTasks: progress.completed || 0,
  };
}

type HealthLevel = 'green' | 'yellow' | 'red';

function computeHealth(data: PulseData): { level: HealthLevel; label: string } {
  // Red: blocking decisions OR blocked tasks OR no activity 7+ days
  if (data.blockingDecisions > 0 || data.blockedTasks > 0) {
    return { level: 'red', label: 'Needs attention' };
  }
  if (data.lastActivityDays != null && data.lastActivityDays >= 7) {
    return { level: 'red', label: 'Stale' };
  }

  // Yellow: non-blocking decisions OR knowledge gaps OR inactive 3+ days
  if (data.pendingDecisions > 0 || data.knowledgeGaps > 0) {
    return { level: 'yellow', label: 'Needs input' };
  }
  if (data.lastActivityDays != null && data.lastActivityDays >= 3) {
    return { level: 'yellow', label: 'Inactive' };
  }

  // Green
  return { level: 'green', label: 'On track' };
}

const healthColors: Record<HealthLevel, { dot: string; text: string; bg: string }> = {
  green: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
  },
  yellow: {
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
  },
  red: {
    dot: 'bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/10',
  },
};

const PlanPulse: React.FC<PlanPulseProps> = ({ planId }) => {
  const { data, isLoading } = useQuery(
    ['plan-pulse', planId],
    () => fetchPulseData(planId),
    {
      enabled: !!planId,
      refetchInterval: 30000, // refresh every 30s
      staleTime: 10000,
    }
  );

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 py-1.5 text-[11px] text-gray-400 dark:text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
    );
  }

  const health = computeHealth(data);
  const colors = healthColors[health.level];

  const signals: Array<{ icon: React.ReactNode; text: string; show: boolean }> = [
    {
      icon: <MessageSquare className="w-3 h-3" />,
      text: `${data.pendingDecisions} decision${data.pendingDecisions !== 1 ? 's' : ''} pending${data.blockingDecisions > 0 ? ` (${data.blockingDecisions} blocking)` : ''}`,
      show: data.pendingDecisions > 0,
    },
    {
      icon: <BookOpen className="w-3 h-3" />,
      text: `${data.knowledgeGaps} knowledge gap${data.knowledgeGaps !== 1 ? 's' : ''}`,
      show: data.knowledgeGaps > 0,
    },
    {
      icon: <Ban className="w-3 h-3" />,
      text: `${data.blockedTasks} blocked`,
      show: data.blockedTasks > 0,
    },
    {
      icon: <Activity className="w-3 h-3" />,
      text: data.lastActivityAgo ? `Active ${data.lastActivityAgo}` : 'No activity yet',
      show: true,
    },
  ];

  const visibleSignals = signals.filter(s => s.show);

  return (
    <div className="flex items-center gap-3 py-1.5">
      {/* Health indicator */}
      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${colors.bg}`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot} ${health.level === 'red' ? 'animate-pulse' : ''}`} />
        <span className={`text-[11px] font-medium ${colors.text}`}>{health.label}</span>
      </div>

      {/* Signal pills */}
      <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        {visibleSignals.map((signal, i) => (
          <span key={i} className="flex items-center gap-1">
            {signal.icon}
            {signal.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PlanPulse;
