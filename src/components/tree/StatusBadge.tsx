import React from 'react';
import { NodeStatus } from '../../types';

interface StatusBadgeProps {
  status: NodeStatus;
  compact?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

// Get the next status in the cycle
const getNextStatus = (current: NodeStatus): NodeStatus => {
  const transitions: Record<NodeStatus, NodeStatus> = {
    not_started: 'in_progress',
    in_progress: 'completed',
    completed: 'not_started',
    blocked: 'in_progress'  // Unblock → resume
  };
  return transitions[current] || 'not_started';
};

// Get tooltip text for next status
const getNextStatusLabel = (current: NodeStatus): string => {
  const labels: Record<NodeStatus, string> = {
    not_started: 'Start',
    in_progress: 'Complete',
    completed: 'Reopen',
    blocked: 'Unblock'
  };
  return labels[current] || 'Change status';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  compact = false,
  onClick,
  disabled = false
}) => {
  const styles: Record<NodeStatus, { icon: string; bg: string; text: string; label: string }> = {
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

  const style = styles[status] || styles.not_started;
  const isInteractive = onClick && !disabled;
  const tooltip = isInteractive 
    ? `${style.label} - Click to ${getNextStatusLabel(status)}`
    : style.label;

  const handleClick = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation(); // Don't trigger row selection
    onClick();
  };

  const baseClasses = `inline-flex items-center justify-center rounded text-xs font-medium transition-all ${style.bg} ${style.text}`;
  const interactiveClasses = isInteractive 
    ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400 dark:hover:ring-blue-500 active:scale-95' 
    : '';
  const sizeClasses = compact ? 'w-5 h-5' : 'gap-1 px-2 py-0.5';

  if (compact) {
    return (
      <span
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
        className={`${baseClasses} ${interactiveClasses} ${sizeClasses}`}
        title={tooltip}
      >
        {style.icon}
      </span>
    );
  }

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`${baseClasses} ${interactiveClasses} ${sizeClasses}`}
      title={tooltip}
    >
      <span>{style.icon}</span>
      <span className="hidden sm:inline">{style.label}</span>
    </span>
  );
};

// Export helper for external use
export { getNextStatus };
