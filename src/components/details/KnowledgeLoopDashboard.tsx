/**
 * KnowledgeLoopDashboard — Agent-driven iterative plan improvement.
 *
 * Observability panel: humans watch, agents execute.
 * "Request" creates loop record + agent request. Agent picks it up via MCP.
 * Panel polls status every 5s while running.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  RefreshCw,
  Loader2,
  CheckCircle,
  Square,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { knowledgeLoopService } from '../../services/knowledge.service';

interface KnowledgeLoopDashboardProps {
  planId: string;
}

const formatTimeAgo = (date: string): string => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    idle: { label: 'Idle', color: 'text-gray-400 dark:text-gray-500', icon: <Square className="w-2.5 h-2.5" /> },
    running: { label: 'Running', color: 'text-blue-500 dark:text-blue-400', icon: <Loader2 className="w-2.5 h-2.5 animate-spin" /> },
    converged: { label: 'Converged', color: 'text-emerald-500 dark:text-emerald-400', icon: <CheckCircle className="w-2.5 h-2.5" /> },
    stopped: { label: 'Stopped', color: 'text-amber-500 dark:text-amber-400', icon: <Square className="w-2.5 h-2.5" /> },
  };
  const { label, color, icon } = config[status] || config.idle;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-medium ${color}`}>
      {icon} {label}
    </span>
  );
};

const QualityChart: React.FC<{ scores: number[] }> = ({ scores }) => {
  if (!scores.length) return null;
  const max = Math.max(...scores, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {scores.map((score, i) => (
        <div
          key={i}
          className="flex-1 min-w-[4px] max-w-[12px] rounded-t-sm bg-blue-400 dark:bg-blue-500 transition-all"
          style={{ height: `${(score / max) * 100}%` }}
          title={`Iteration ${i + 1}: ${(score * 100).toFixed(0)}%`}
        />
      ))}
    </div>
  );
};

const KnowledgeLoopDashboard: React.FC<KnowledgeLoopDashboardProps> = ({ planId }) => {
  const queryClient = useQueryClient();
  const [showLog, setShowLog] = useState(false);

  const { data, isLoading } = useQuery(
    ['knowledge-loop-status', planId],
    () => knowledgeLoopService.getStatus(planId),
    {
      refetchInterval: (data) => data?.status === 'running' ? 5000 : false,
      enabled: !!planId,
    }
  );

  const startMutation = useMutation(
    () => knowledgeLoopService.start(planId),
    {
      onSuccess: () => queryClient.invalidateQueries(['knowledge-loop-status', planId]),
    }
  );

  const stopMutation = useMutation(
    () => knowledgeLoopService.stop(planId),
    {
      onSuccess: () => queryClient.invalidateQueries(['knowledge-loop-status', planId]),
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 text-xs text-gray-400 dark:text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading loop status...
      </div>
    );
  }

  const status = data?.status || 'idle';
  const isIdle = status === 'idle';
  const isRunning = status === 'running';
  const isDone = status === 'converged' || status === 'stopped';
  const iterations = data?.iterations || [];
  const scores = data?.quality_progression || [];
  const qualityBefore = data?.quality_before;
  const qualityAfter = data?.quality_after;
  const qualityDelta = qualityBefore != null && qualityAfter != null
    ? qualityAfter - qualityBefore
    : null;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Knowledge Loop</span>
          <StatusBadge status={status} />
        </div>

        <div className="flex items-center gap-1">
          {isIdle && (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isLoading}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded transition-colors disabled:opacity-50"
            >
              {startMutation.isLoading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RefreshCw className="w-2.5 h-2.5" />}
              Request
            </button>
          )}
          {isRunning && (
            <button
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isLoading}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors disabled:opacity-50"
            >
              <Square className="w-2.5 h-2.5" /> Stop
            </button>
          )}
          {isDone && (
            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isLoading}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Run Again
            </button>
          )}
        </div>
      </div>

      {/* Idle state */}
      {isIdle && (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
          An agent will evaluate and iteratively improve plan quality.
        </p>
      )}

      {/* Running — waiting for agent */}
      {isRunning && iterations.length === 0 && (
        <div className="flex items-center gap-2 py-1">
          <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
          <span className="text-[11px] text-gray-500 dark:text-gray-400">Waiting for agent...</span>
        </div>
      )}

      {/* Progress (running or done with iterations) */}
      {(isRunning || isDone) && iterations.length > 0 && (
        <div className="space-y-2">
          {/* Stats row */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-2.5 h-2.5" />
              {data?.iterations_completed}/{data?.max_iterations}
            </span>
            {data?.started_at && (
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatTimeAgo(data.started_at)}
              </span>
            )}
            {qualityDelta != null && (
              <span className={`flex items-center gap-1 font-medium ${qualityDelta >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                <TrendingUp className="w-2.5 h-2.5" />
                {qualityDelta >= 0 ? '+' : ''}{(qualityDelta * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {/* Quality chart */}
          {scores.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                <span>Quality: {(scores[0] * 100).toFixed(0)}%</span>
                <span>{(scores[scores.length - 1] * 100).toFixed(0)}%</span>
              </div>
              <QualityChart scores={scores} />
            </div>
          )}

          {/* Latest iteration rationale */}
          {iterations.length > 0 && iterations[iterations.length - 1].rationale && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic truncate">
              Latest: "{iterations[iterations.length - 1].rationale}"
            </p>
          )}

          {/* Iteration log (collapsible) */}
          {iterations.length > 0 && (
            <div>
              <button
                onClick={() => setShowLog(!showLog)}
                className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showLog ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Iteration log ({iterations.length})
              </button>

              {showLog && (
                <div className="mt-1.5 space-y-1.5 ml-1 border-l-2 border-gray-100 dark:border-gray-800 pl-2">
                  {iterations.map((iter: any, i: number) => (
                    <div key={i} className="text-[10px]">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">#{i + 1}</span>
                        <span className={`font-mono ${
                          iter.quality_score >= 0.7 ? 'text-emerald-500' :
                          iter.quality_score >= 0.4 ? 'text-amber-500' : 'text-red-500'
                        }`}>
                          {(iter.quality_score * 100).toFixed(0)}%
                        </span>
                        {iter.created_at && (
                          <span className="text-gray-400 dark:text-gray-500">{formatTimeAgo(iter.created_at)}</span>
                        )}
                      </div>
                      {iter.rationale && (
                        <p className="text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{iter.rationale}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {startMutation.isError && (
        <div className="flex items-center gap-1.5 text-[11px] text-red-500">
          <AlertCircle className="w-3 h-3" />
          {(startMutation.error as any)?.message || 'Failed to start loop'}
        </div>
      )}
    </div>
  );
};

export default KnowledgeLoopDashboard;
