import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Calendar,
  FolderKanban,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Check,
  AlertCircle,
  X,
  Building2,
  MoreVertical,
  Edit,
  Archive,
  Trash2,
} from 'lucide-react';
import { SuccessMetric } from '../../hooks/useGoals';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    status: string;
    time_horizon?: string;
    organization?: { id: string; name: string };
    success_metrics?: SuccessMetric[];
    linked_plans_count?: number;
    knowledge_entries_count?: number;
  };
  onEdit?: (goal: any) => void;
  onDelete?: (goalId: string) => void;
  onArchive?: (goalId: string) => void;
}

// Calculate overall progress from metrics
const calculateOverallProgress = (metrics?: SuccessMetric[]): number => {
  if (!metrics?.length) return 0;
  const total = metrics.reduce((sum, m) => {
    const target = parseFloat(m.target) || 0;
    const current = parseFloat(m.current) || 0;
    const progress = target > 0 ? (current / target) * 100 : 0;
    return sum + Math.min(progress, 100);
  }, 0);
  return Math.round(total / metrics.length);
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = () => {
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

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-3 h-3" />;
      case 'achieved':
        return <Check className="w-3 h-3" />;
      case 'at_risk':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <X className="w-3 h-3" />;
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle()}`}>
      {getStatusIcon()}
      {status.replace('_', ' ')}
    </span>
  );
};

// Metric card component
const MetricCard: React.FC<{ metric: SuccessMetric }> = ({ metric }) => {
  const target = parseFloat(metric.target) || 0;
  const current = parseFloat(metric.current) || 0;
  const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = progress >= 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
      <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={metric.metric}>
        {metric.metric}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-lg font-bold ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
          {metric.current}
        </span>
        <span className="text-gray-400 dark:text-gray-500 text-sm">/ {metric.target}</span>
        <span className="text-gray-400 dark:text-gray-500 text-xs">{metric.unit}</span>
      </div>
      <div className="mt-1.5 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Dropdown menu component
const DropdownMenu: React.FC<{
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}> = ({ onEdit, onArchive, onDelete }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
            {onArchive && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onArchive();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onArchive }) => {
  const overallProgress = calculateOverallProgress(goal.success_metrics);
  const hasMetrics = goal.success_metrics && goal.success_metrics.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Target className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <Link
              to={`/app/goals/${goal.id}`}
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
              <Building2 className="w-3 h-3" />
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
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
          {goal.success_metrics!.slice(0, 4).map((metric, i) => (
            <MetricCard key={i} metric={metric} />
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
            <FolderKanban className="w-4 h-4" />
            {goal.linked_plans_count || 0} plans
          </Link>
          <Link
            to={`/app/goals/${goal.id}?tab=knowledge`}
            className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {goal.knowledge_entries_count || 0} knowledge
          </Link>
          {goal.time_horizon && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(goal.time_horizon).toLocaleDateString()}
            </span>
          )}
        </div>
        <Link
          to={`/app/goals/${goal.id}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          View details <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default GoalCard;
