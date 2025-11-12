import React from 'react';
import { NodeStatus } from '../../types';

interface StatusBadgeProps {
  status: NodeStatus;
  compact?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, compact = false }) => {
  const styles = {
    completed: {
      icon: '✓',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-400',
      label: 'Completed'
    },
    in_progress: {
      icon: '⟳',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-700 dark:text-amber-400',
      label: 'In Progress'
    },
    not_started: {
      icon: '○',
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      label: 'Not Started'
    },
    blocked: {
      icon: '⚠',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-400',
      label: 'Blocked'
    }
  };

  const style = styles[status];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-medium ${style.bg} ${style.text}`}
        title={style.label}
      >
        {style.icon}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}
      title={style.label}
    >
      <span>{style.icon}</span>
      <span className="hidden sm:inline">{style.label}</span>
    </span>
  );
};
