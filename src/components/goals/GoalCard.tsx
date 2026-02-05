import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Calendar,
  FolderKanban,
  BookOpen,
  ChevronRight,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
} from 'lucide-react';
import { Goal, SuccessMetric } from '../../services/api';
import StatusBadge from './shared/StatusBadge';
import { 
  calculateOverallProgress, 
  calculateMetricProgress, 
  isMetricComplete,
  MAX_VISIBLE_METRICS 
} from '../../utils/goalHelpers';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
  onArchive?: (goalId: string) => void;
}

// Metric card component
const MetricCard: React.FC<{ metric: SuccessMetric }> = ({ metric }) => {
  const progress = calculateMetricProgress(metric);
  const complete = isMetricComplete(metric);

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={metric.metric}>
        {metric.metric}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-lg font-bold ${complete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {metric.current}
        </span>
        <span className="text-gray-400 dark:text-gray-500 text-sm">/ {metric.target}</span>
        <span className="text-gray-400 dark:text-gray-500 text-xs">{metric.unit}</span>
      </div>
      <div 
        className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${metric.metric}: ${Math.round(progress)}% complete`}
      >
        <div
          className={`h-full rounded-full transition-all ${complete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Dropdown menu component with accessibility
const DropdownMenu: React.FC<{
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}> = ({ onEdit, onArchive, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  const handleAction = useCallback((action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    setIsOpen(false);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Goal actions"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20"
          role="menu"
          aria-orientation="vertical"
        >
          {onEdit && (
            <button
              onClick={handleAction(onEdit)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              role="menuitem"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
          {onArchive && (
            <button
              onClick={handleAction(onArchive)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              role="menuitem"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleAction(onDelete)}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              role="menuitem"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onArchive }) => {
  const overallProgress = calculateOverallProgress(goal.success_metrics);
  const hasMetrics = goal.success_metrics && goal.success_metrics.length > 0;

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
      aria-labelledby={`goal-title-${goal.id}`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" aria-hidden="true" />
            <Link
              to={`/app/goals/${goal.id}`}
              id={`goal-title-${goal.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {goal.title}
            </Link>
            <StatusBadge status={goal.status} />
          </div>
          {goal.description && (
            <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{goal.description}</p>
          )}
          {goal.organization && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <span aria-hidden="true">🏢</span>
              {goal.organization.name}
            </p>
          )}
        </div>
        <DropdownMenu
          onEdit={onEdit ? () => onEdit(goal) : undefined}
          onArchive={onArchive ? () => onArchive(goal.id) : undefined}
          onDelete={onDelete ? () => onDelete(goal.id) : undefined}
        />
      </div>

      {/* Progress Bar */}
      {hasMetrics && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500 dark:text-gray-400">Overall Progress</span>
            <span className="font-medium text-gray-900 dark:text-white">{overallProgress}%</span>
          </div>
          <div 
            className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={overallProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Overall progress: ${overallProgress}%`}
          >
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {hasMetrics && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {goal.success_metrics.slice(0, MAX_VISIBLE_METRICS).map((metric, i) => (
            <MetricCard key={metric.metric || i} metric={metric} />
          ))}
        </div>
      )}

      {/* Footer: Linked Items */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
          <Link
            to={`/app/goals/${goal.id}?tab=plans`}
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
          >
            <FolderKanban className="w-4 h-4" aria-hidden="true" />
            {goal.linked_plans_count || 0} plans
          </Link>
          <Link
            to={`/app/goals/${goal.id}?tab=knowledge`}
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            {goal.knowledge_entries_count || 0} knowledge
          </Link>
          {goal.time_horizon && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <time dateTime={goal.time_horizon}>
                {new Date(goal.time_horizon).toLocaleDateString()}
              </time>
            </span>
          )}
        </div>
        <Link
          to={`/app/goals/${goal.id}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View details <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

export default GoalCard;
