import React from 'react';

interface StatusBadgeProps {
  status: 'completed' | 'in_progress' | 'not_started';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    completed: {
      icon: '✓',
      bg: 'bg-green-50',
      text: 'text-green-700',
      label: 'Completed'
    },
    in_progress: {
      icon: '⟳',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      label: 'In Progress'
    },
    not_started: {
      icon: '○',
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      label: 'Not Started'
    }
  };

  const style = styles[status];

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
