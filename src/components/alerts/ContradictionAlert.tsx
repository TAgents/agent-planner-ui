import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface Contradiction {
  id: string;
  fact_a: string;
  fact_b: string;
}

interface ContradictionAlertProps {
  contradictions: Contradiction[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
}

const ContradictionAlert: React.FC<ContradictionAlertProps> = ({
  contradictions,
  onDismiss,
  onDismissAll,
}) => {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleContradictions = contradictions.filter(c => !dismissedIds.has(c.id));

  if (visibleContradictions.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
    onDismiss?.(id);
  };

  const handleDismissAll = () => {
    setDismissedIds(new Set(contradictions.map(c => c.id)));
    onDismissAll?.();
  };

  return (
    <div className="space-y-2">
      {visibleContradictions.map(contradiction => (
        <div
          key={contradiction.id}
          className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          role="alert"
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="flex-1 text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">Knowledge contradiction: </span>
            <span className="text-amber-700 dark:text-amber-300">
              {contradiction.fact_a}
            </span>
            <span className="text-amber-500 dark:text-amber-400 mx-1.5">vs</span>
            <span className="text-amber-700 dark:text-amber-300">
              {contradiction.fact_b}
            </span>
          </p>
          <button
            onClick={() => handleDismiss(contradiction.id)}
            className="p-0.5 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded transition-colors flex-shrink-0"
            aria-label="Dismiss contradiction"
          >
            <X className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          </button>
        </div>
      ))}
      {visibleContradictions.length > 1 && (
        <button
          onClick={handleDismissAll}
          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
        >
          Dismiss all
        </button>
      )}
    </div>
  );
};

export default ContradictionAlert;
