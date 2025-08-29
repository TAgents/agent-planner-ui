import React from 'react';
import { TrendingUp, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import usePlanProgress from '../../hooks/usePlanProgress';

interface PlanProgressProps {
  planId: string;
  className?: string;
}

const PlanProgress: React.FC<PlanProgressProps> = ({ planId, className = '' }) => {
  const { data: progress, isLoading, error } = usePlanProgress(planId);

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <TrendingUp className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Plan Progress</h3>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Progress data not available
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Plan Progress
        </h3>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Overall Completion
          </span>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Math.round(progress.completion_percentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progress.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {progress.total_nodes}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            nodes
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
              Completed
            </span>
          </div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-300">
            {progress.completed_nodes}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            nodes
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
              In Progress
            </span>
          </div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {progress.in_progress_nodes}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            nodes
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">
              Blocked
            </span>
          </div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-300">
            {progress.blocked_nodes}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            nodes
          </div>
        </div>
      </div>

      {/* Progress Insights */}
      {progress.completion_percentage > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {progress.blocked_nodes > 0 && (
              <span className="text-red-600 dark:text-red-400">
                {progress.blocked_nodes} blocked item{progress.blocked_nodes !== 1 ? 's' : ''} need attention
              </span>
            )}
            {progress.blocked_nodes === 0 && progress.in_progress_nodes > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                {progress.in_progress_nodes} item{progress.in_progress_nodes !== 1 ? 's' : ''} in progress
              </span>
            )}
            {progress.blocked_nodes === 0 && progress.in_progress_nodes === 0 && progress.completed_nodes === progress.total_nodes && (
              <span className="text-green-600 dark:text-green-400">
                🎉 All tasks completed!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanProgress;