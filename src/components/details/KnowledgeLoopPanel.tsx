import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { coherenceService } from '../../services/api';
import { BarChart3, AlertTriangle, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';

interface PlanHealthPanelProps {
  planId: string;
  goalId?: string;
}

/**
 * Plan Health Panel — shows quality score breakdown, coherence issues,
 * and staleness indicator. Replaces the old Knowledge Loop start/stop UI.
 */
const KnowledgeLoopPanel: React.FC<PlanHealthPanelProps> = ({ planId, goalId }) => {
  const queryClient = useQueryClient();

  // Fetch coherence issues
  const { data: coherence } = useQuery(
    ['plan-coherence', planId],
    () => coherenceService.getPlanCoherence(planId),
    { staleTime: 30000 }
  );

  // Run coherence check mutation
  const checkMutation = useMutation(
    () => coherenceService.runCheck(planId, goalId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['plan-coherence', planId]);
        queryClient.invalidateQueries(['plan', planId]);
      },
    }
  );

  const quality = checkMutation.data?.quality;
  const issueCount = coherence?.count || 0;
  const issues = coherence?.issues || [];

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Plan Health</span>
          {issueCount > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {issueCount} issue{issueCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={() => checkMutation.mutate()}
          disabled={checkMutation.isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
          title="Re-evaluate plan quality"
        >
          {checkMutation.isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          {checkMutation.isLoading ? 'Checking...' : 'Evaluate'}
        </button>
      </div>

      {/* Quality Breakdown (shows after evaluation) */}
      {quality && (
        <div className="px-4 py-3 space-y-2">
          {/* Overall score */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Quality</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {Math.round(quality.score * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quality.score >= 0.7 ? 'bg-emerald-500' :
                quality.score >= 0.4 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.round(quality.score * 100)}%` }}
            />
          </div>

          {/* Sub-scores */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            {[
              { label: 'Coverage', value: quality.coverage },
              { label: 'Specificity', value: quality.specificity },
              { label: 'Ordering', value: quality.ordering },
              { label: 'Knowledge', value: quality.completeness },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-gray-400 dark:text-gray-500">{label}</span>
                <span className={`font-medium ${
                  value >= 0.7 ? 'text-emerald-600 dark:text-emerald-400' :
                  value >= 0.4 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                }`}>
                  {Math.round(value * 100)}%
                </span>
              </div>
            ))}
          </div>

          {/* Rationale */}
          {quality.rationale && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
              {quality.rationale}
            </p>
          )}
        </div>
      )}

      {/* Coherence Issues */}
      {issues.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
          {issues.slice(0, 3).map((issue: any) => (
            <div key={issue.node_id} className="flex items-start gap-2 text-[11px]">
              {issue.coherence_status === 'contradiction_detected' ? (
                <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate block">
                  {issue.title}
                </span>
                <span className="text-gray-400 dark:text-gray-500">
                  {issue.coherence_status === 'contradiction_detected' ? 'Contradicted' : 'Stale beliefs'}
                </span>
              </div>
            </div>
          ))}
          {issues.length > 3 && (
            <p className="text-[10px] text-gray-400">+{issues.length - 3} more</p>
          )}
        </div>
      )}

      {/* No issues state */}
      {issueCount === 0 && !quality && (
        <div className="px-4 py-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle className="w-3.5 h-3.5" />
          Click Evaluate to assess plan quality
        </div>
      )}

      {issueCount === 0 && quality && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            No coherence issues
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeLoopPanel;
