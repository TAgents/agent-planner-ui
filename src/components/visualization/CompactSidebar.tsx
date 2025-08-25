import React, { useState } from 'react';
import { 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity,
  BarChart3,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { formatDate, getStatusLabel } from '../../utils/planUtils';
import { Plan, PlanNode, Activity as ActivityType } from '../../types';

interface CompactSidebarProps {
  plan: Plan;
  nodes: PlanNode[];
  activities: ActivityType[];
  isActivityLoading: boolean;
  onClose: () => void;
}

const CompactSidebar: React.FC<CompactSidebarProps> = ({
  plan,
  nodes,
  activities,
  isActivityLoading,
  onClose,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  // Calculate stats
  const stats = {
    total: nodes.length,
    completed: nodes.filter(n => n.status === 'completed').length,
    inProgress: nodes.filter(n => n.status === 'in_progress').length,
    notStarted: nodes.filter(n => n.status === 'not_started').length,
    blocked: nodes.filter(n => n.status === 'blocked').length,
  };

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <aside className="w-80 bg-white dark:bg-gray-800 shadow-md overflow-y-auto border-l border-gray-200 dark:border-gray-700 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Plan Insights
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            title="Close"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Compact Stats Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{progress}%</span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
            plan.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            plan.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Collapsible Sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Quick Stats Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('stats')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Quick Stats</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'stats' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'stats' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completed}</span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">In Progress</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.inProgress}</span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Not Started</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.notStarted}</span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Blocked</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.blocked}</span>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('activity')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Recent Activity</span>
              {activities.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                  {activities.length}
                </span>
              )}
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'activity' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'activity' && (
            <div className="mt-3">
              {isActivityLoading ? (
                <div className="text-center py-3">
                  <div className="spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : activities.length > 0 ? (
                <ul className="space-y-2">
                  {activities.slice(0, 3).map((activity) => (
                    <li key={activity.id} className="text-xs border border-gray-100 dark:border-gray-700 rounded-lg p-2.5 bg-gray-50 dark:bg-gray-700">
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {activity.content || `Activity ${activity.id}`}
                      </p>
                      <div className="flex justify-between text-gray-500 dark:text-gray-400 mt-1">
                        <span>{activity.user?.name || 'System'}</span>
                        <span>{formatDate(activity.created_at)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-3">
                  No recent activity
                </p>
              )}
            </div>
          )}
        </div>

        {/* Plan Details Section */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('details')}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 -m-2 p-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Plan Details</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === 'details' ? 'rotate-90' : ''}`} />
          </button>
          
          {expandedSection === 'details' && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created</span>
                <span className="text-gray-900 dark:text-white">{formatDate(plan.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-gray-900 dark:text-white">{formatDate(plan.updated_at)}</span>
              </div>
              {plan.description && (
                <div className="pt-2">
                  <p className="text-gray-600 dark:text-gray-400 mb-1">Description</p>
                  <p className="text-gray-900 dark:text-white">{plan.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CompactSidebar;
