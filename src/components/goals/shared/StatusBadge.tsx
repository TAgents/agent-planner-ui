import React from 'react';
import { TrendingUp, Check, AlertCircle, X } from 'lucide-react';

type GoalStatus = 'active' | 'achieved' | 'at_risk' | 'abandoned';

interface StatusBadgeProps {
  status: GoalStatus | string;
  size?: 'sm' | 'md';
}

const getStatusStyle = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case 'achieved':
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case 'at_risk':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
    case 'abandoned':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }
};

const getStatusIcon = (status: string): React.ReactNode => {
  const iconClass = 'w-3 h-3';
  switch (status) {
    case 'active':
      return <TrendingUp className={iconClass} />;
    case 'achieved':
      return <Check className={iconClass} />;
    case 'at_risk':
      return <AlertCircle className={iconClass} />;
    default:
      return <X className={iconClass} />;
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span 
      className={`rounded-full font-medium flex items-center gap-1 ${sizeClasses} ${getStatusStyle(status)}`}
      role="status"
      aria-label={`Status: ${status.replace('_', ' ')}`}
    >
      {getStatusIcon(status)}
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;
