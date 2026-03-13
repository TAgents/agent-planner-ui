import React from 'react';
import { Check, RotateCw, Circle, AlertTriangle, ClipboardCheck } from 'lucide-react';
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
    blocked: 'in_progress',  // Unblock → resume
    plan_ready: 'completed'  // Approve → complete
  };
  return transitions[current] || 'not_started';
};

// Get tooltip text for next status
const getNextStatusLabel = (current: NodeStatus): string => {
  const labels: Record<NodeStatus, string> = {
    not_started: 'Start',
    in_progress: 'Complete',
    completed: 'Reopen',
    blocked: 'Unblock',
    plan_ready: 'Approve'
  };
  return labels[current] || 'Change status';
};

type StatusStyle = {
  Icon: React.FC<{ className?: string }>;
  bg: string;
  text: string;
  label: string;
  ring?: string;
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  compact = false,
  onClick,
  disabled = false
}) => {
  const styles: Record<NodeStatus, StatusStyle> = {
    completed: {
      Icon: Check,
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      label: 'Completed'
    },
    in_progress: {
      Icon: RotateCw,
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      label: 'In Progress',
      ring: 'ring-amber-400/40 dark:ring-amber-400/20'
    },
    not_started: {
      Icon: Circle,
      bg: 'bg-gray-50 dark:bg-gray-500/10',
      text: 'text-gray-400 dark:text-gray-500',
      label: 'Not Started'
    },
    blocked: {
      Icon: AlertTriangle,
      bg: 'bg-red-50 dark:bg-red-500/10',
      text: 'text-red-500 dark:text-red-400',
      label: 'Blocked'
    },
    plan_ready: {
      Icon: ClipboardCheck,
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      text: 'text-violet-600 dark:text-violet-400',
      label: 'Plan Ready'
    }
  };

  const style = styles[status] || styles.not_started;
  const { Icon } = style;
  const isInteractive = onClick && !disabled;
  const tooltip = isInteractive
    ? `${style.label} - Click to ${getNextStatusLabel(status)}`
    : style.label;

  const handleClick = (e: React.MouseEvent) => {
    if (!isInteractive) return;
    e.stopPropagation();
    onClick();
  };

  const baseClasses = `inline-flex items-center justify-center rounded-md text-xs font-medium transition-all duration-150 ${style.bg} ${style.text}`;
  const interactiveClasses = isInteractive
    ? 'cursor-pointer hover:ring-2 hover:ring-offset-1 hover:ring-blue-400/60 dark:hover:ring-blue-400/40 dark:hover:ring-offset-gray-900 active:scale-90'
    : '';
  const pulseClass = status === 'in_progress' ? 'animate-[pulse_3s_ease-in-out_infinite]' : '';
  const sizeClasses = compact ? 'w-5 h-5' : 'gap-1.5 px-2 py-0.5';

  if (compact) {
    return (
      <span
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onClick={handleClick}
        onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
        className={`${baseClasses} ${interactiveClasses} ${pulseClass} ${sizeClasses}`}
        title={tooltip}
      >
        <Icon className="w-3 h-3" />
      </span>
    );
  }

  return (
    <span
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`${baseClasses} ${interactiveClasses} ${pulseClass} ${sizeClasses}`}
      title={tooltip}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{style.label}</span>
    </span>
  );
};

// Export helper for external use
export { getNextStatus };
