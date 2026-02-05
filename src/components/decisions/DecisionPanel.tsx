import React from 'react';
import { X, AlertTriangle, Clock, HelpCircle } from 'lucide-react';
import { useDecisions, Decision } from '../../hooks/useDecisions';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface DecisionPanelProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectDecision: (decision: Decision) => void;
}

const DecisionCard: React.FC<{
  decision: Decision;
  onClick: () => void;
}> = ({ decision, onClick }) => {
  const isBlocking = decision.urgency === 'blocking';
  
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-3 rounded-lg border-2 transition-all
        hover:shadow-md hover:-translate-y-0.5
        ${isBlocking 
          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
          : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20'
        }
      `}
    >
      <div className="flex items-start gap-2">
        <div className={`p-1 rounded ${isBlocking ? 'bg-red-100 dark:bg-red-800' : 'bg-amber-100 dark:bg-amber-800'}`}>
          {isBlocking ? (
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          ) : (
            <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {decision.title}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {decision.context}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(decision.created_at)}</span>
            {decision.requester && (
              <>
                <span>•</span>
                <span>by {decision.requester.name}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  planId,
  isOpen,
  onClose,
  onSelectDecision,
}) => {
  // Only poll decisions when panel is open to avoid redundant requests
  // (DecisionBadge already polls for counts)
  const { data: decisions, isLoading } = useDecisions(planId, 'pending', { enabled: isOpen });

  if (!isOpen) return null;

  const blockingDecisions = decisions?.filter(d => d.urgency === 'blocking') || [];
  const canContinueDecisions = decisions?.filter(d => d.urgency === 'can_continue') || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 max-w-full bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pending Decisions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading decisions...</p>
            </div>
          ) : decisions?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">All caught up!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                No pending decisions right now.
              </p>
            </div>
          ) : (
            <>
              {/* Blocking decisions */}
              {blockingDecisions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                      Blocking ({blockingDecisions.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {blockingDecisions.map(decision => (
                      <DecisionCard
                        key={decision.id}
                        decision={decision}
                        onClick={() => onSelectDecision(decision)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Can continue decisions */}
              {canContinueDecisions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                      Can Continue ({canContinueDecisions.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {canContinueDecisions.map(decision => (
                      <DecisionCard
                        key={decision.id}
                        decision={decision}
                        onClick={() => onSelectDecision(decision)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default DecisionPanel;
