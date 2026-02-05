import React from 'react';
import { HelpCircle } from 'lucide-react';
import { usePendingDecisionCount } from '../../hooks/useDecisions';

interface DecisionBadgeProps {
  planId: string;
  onClick?: () => void;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ planId, onClick }) => {
  const { data: counts, isLoading } = usePendingDecisionCount(planId);

  if (isLoading || !counts || counts.total === 0) {
    return null;
  }

  const hasBlocking = counts.blocking > 0;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-medium
        transition-all hover:scale-105 active:scale-95
        ${hasBlocking 
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        }
      `}
      title={`${counts.total} pending decision${counts.total !== 1 ? 's' : ''} (${counts.blocking} blocking)`}
    >
      <HelpCircle className="w-4 h-4" />
      <span>{counts.total}</span>
      {hasBlocking && (
        <span className="text-xs">!</span>
      )}
    </button>
  );
};

export default DecisionBadge;
