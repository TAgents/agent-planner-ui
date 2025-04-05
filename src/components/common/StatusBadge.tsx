import React from 'react';
import { PlanStatus, NodeStatus } from '../../types';

interface StatusBadgeProps {
  status: PlanStatus | NodeStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm',
  };

  const getStatusClasses = (status: PlanStatus | NodeStatus) => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft':
      case 'not_started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'archived':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatStatus = (status: PlanStatus | NodeStatus) => {
    return status
      .replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`font-medium rounded-full ${sizeClasses[size]} ${getStatusClasses(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
