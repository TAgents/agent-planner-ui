import React, { useState } from 'react';
import { Info, Eye, EyeOff, Bot, Target, FileText } from 'lucide-react';
import { useNodeContext } from '../../hooks/useNodeContext';

interface NodeContextProps {
  planId: string;
  nodeId: string;
  className?: string;
}

const NodeContext: React.FC<NodeContextProps> = ({ planId, nodeId, className = '' }) => {
  const { data: context, isLoading, error } = useNodeContext(planId, nodeId);
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-blue-200 dark:bg-blue-700 rounded"></div>
            <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-full"></div>
            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !context) {
    return null;
  }

  const hasContext = context.description || context.context || context.agent_instructions || context.acceptance_criteria;

  if (!hasContext) {
    return null;
  }

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Node Context
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            {isExpanded ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {context.description && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                    Description
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {context.description}
                </p>
              </div>
            )}

            {context.context && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                    Additional Context
                  </h4>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  {context.context}
                </p>
              </div>
            )}

            {context.agent_instructions && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                    Agent Instructions
                  </h4>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded p-3">
                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed font-mono">
                    {context.agent_instructions}
                  </p>
                </div>
              </div>
            )}

            {context.acceptance_criteria && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide">
                    Acceptance Criteria
                  </h4>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                  <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                    {context.acceptance_criteria}
                  </p>
                </div>
              </div>
            )}

            {/* Show metadata if available */}
            {context.metadata && Object.keys(context.metadata).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-2">
                  Metadata
                </h4>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
                    {JSON.stringify(context.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {!isExpanded && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Click to view detailed context information
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeContext;