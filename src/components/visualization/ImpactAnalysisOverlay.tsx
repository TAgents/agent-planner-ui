import React, { useState } from 'react';
import { X, AlertTriangle, ArrowDown, Loader, Zap } from 'lucide-react';
import { ImpactAnalysis } from '../../types';
import { useImpactAnalysis } from '../../hooks/useDependencies';

interface ImpactAnalysisOverlayProps {
  planId: string;
  nodeId: string;
  nodeTitle: string;
  onClose: () => void;
  /** Called when user clicks an impacted node to navigate to it */
  onNodeClick?: (nodeId: string) => void;
}

const scenarioConfig = {
  block: { label: 'Blocked', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  delay: { label: 'Delayed', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  remove: { label: 'Removed', icon: X, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' },
};

const ImpactAnalysisOverlay: React.FC<ImpactAnalysisOverlayProps> = ({
  planId,
  nodeId,
  nodeTitle,
  onClose,
  onNodeClick,
}) => {
  const [scenario, setScenario] = useState<'block' | 'delay' | 'remove'>('block');
  const { impact, isLoading, error } = useImpactAnalysis(planId, nodeId, scenario);

  const config = scenarioConfig[scenario];

  return (
    <div className="absolute top-2 right-2 z-20 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            Impact Analysis
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Source node */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">If this node is...</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{nodeTitle}</p>
      </div>

      {/* Scenario selector */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          {(Object.entries(scenarioConfig) as [keyof typeof scenarioConfig, typeof scenarioConfig['block']][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setScenario(key)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  scenario === key
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cfg.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-5 h-5 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Analyzing impact...</span>
          </div>
        ) : error ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">Failed to load impact analysis</p>
          </div>
        ) : impact ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Summary */}
            <div className="px-4 py-3">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                <config.icon className="w-3 h-3" />
                {impact.affected_count} node{impact.affected_count !== 1 ? 's' : ''} affected
              </div>
            </div>

            {/* Direct dependencies */}
            {impact.direct && impact.direct.length > 0 && (
              <div className="px-4 py-3">
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Directly Blocked ({impact.direct.length})
                </h5>
                <div className="space-y-1.5">
                  {impact.direct.map((node) => (
                    <button
                      key={node.node_id}
                      onClick={() => onNodeClick?.(node.node_id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <ArrowDown className="w-3 h-3 text-red-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {node.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {node.node_type} &middot; {node.status.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Transitive dependencies */}
            {impact.transitive && impact.transitive.length > 0 && (
              <div className="px-4 py-3">
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Transitively Affected ({impact.transitive.length})
                </h5>
                <div className="space-y-1.5">
                  {impact.transitive.map((node) => (
                    <button
                      key={node.node_id}
                      onClick={() => onNodeClick?.(node.node_id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: Math.min(node.depth, 3) }).map((_, i) => (
                          <ArrowDown key={i} className="w-2.5 h-2.5 text-amber-400" />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {node.title}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {node.node_type} &middot; depth {node.depth}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No impact */}
            {impact.affected_count === 0 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No other nodes would be affected.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ImpactAnalysisOverlay;
