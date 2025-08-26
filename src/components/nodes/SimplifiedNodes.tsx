import React from 'react';
import { Handle, Position } from 'reactflow';
import { 
  Folder, 
  FileText, 
  Flag, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  PlayCircle,
  Users,
  Calendar,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { PlanNode } from '../../types';

interface BaseNodeProps {
  data: {
    label: string;
    node: PlanNode;
    showLabels?: boolean;
    showProgress?: boolean;
    activeView?: string;
  };
  selected?: boolean;
}

// Color schemes for different node types and statuses
const getNodeColors = (type: string, status: string) => {
  // Status colors take priority
  if (status === 'completed') {
    return {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-300 dark:border-green-700',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-900 dark:text-green-100',
      badge: 'bg-green-100 dark:bg-green-800'
    };
  }
  
  if (status === 'in_progress') {
    return {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-400 dark:border-blue-600',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      badge: 'bg-blue-100 dark:bg-blue-800'
    };
  }
  
  if (status === 'blocked') {
    return {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-300 dark:border-red-700',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      badge: 'bg-red-100 dark:bg-red-800'
    };
  }
  
  // Default colors by type
  switch (type) {
    case 'phase':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-300 dark:border-indigo-700',
        icon: 'text-indigo-600 dark:text-indigo-400',
        text: 'text-indigo-900 dark:text-indigo-100',
        badge: 'bg-indigo-100 dark:bg-indigo-800'
      };
    case 'milestone':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-300 dark:border-purple-700',
        icon: 'text-purple-600 dark:text-purple-400',
        text: 'text-purple-900 dark:text-purple-100',
        badge: 'bg-purple-100 dark:bg-purple-800'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-300 dark:border-gray-600',
        icon: 'text-gray-600 dark:text-gray-400',
        text: 'text-gray-900 dark:text-gray-100',
        badge: 'bg-gray-100 dark:bg-gray-700'
      };
  }
};

// Get icon for node type
const getNodeIcon = (type: string, status: string) => {
  if (status === 'completed') return CheckCircle;
  if (status === 'in_progress') return PlayCircle;
  if (status === 'blocked') return AlertCircle;
  
  switch (type) {
    case 'phase': return Folder;
    case 'milestone': return Flag;
    case 'task': return FileText;
    default: return FileText;
  }
};

// Simplified Phase Node
export const SimplifiedPhaseNode: React.FC<BaseNodeProps> = ({ data, selected }) => {
  const colors = getNodeColors('phase', data.node.status);
  const Icon = getNodeIcon('phase', data.node.status);
  
  // Count child nodes if available
  const childCount = data.node.metadata?.child_count || 0;
  const completedCount = data.node.metadata?.completed_child_count || 0;
  const progress = childCount > 0 ? Math.round((completedCount / childCount) * 100) : 0;
  
  return (
    <div className={`
      relative min-w-[280px] rounded-xl shadow-sm transition-all duration-200
      ${colors.bg} ${colors.border} border-2
      ${selected ? 'shadow-lg ring-2 ring-blue-400 scale-105' : 'hover:shadow-md'}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${colors.badge}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${colors.text} line-clamp-2`}>
              {data.label}
            </h3>
            {data.node.description && data.showLabels && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {data.node.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        {data.showProgress && childCount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>{completedCount}/{childCount} tasks</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Metadata badges */}
        {data.showLabels && (
          <div className="flex items-center gap-2 mt-3">
            {data.node.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(data.node.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {data.node.comment_count && data.node.comment_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-3 h-3" />
                <span>{data.node.comment_count}</span>
              </div>
            )}
            {data.node.artifact_count && data.node.artifact_count > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Paperclip className="w-3 h-3" />
                <span>{data.node.artifact_count}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// Simplified Task Node
export const SimplifiedTaskNode: React.FC<BaseNodeProps> = ({ data, selected }) => {
  const colors = getNodeColors('task', data.node.status);
  const Icon = getNodeIcon('task', data.node.status);
  
  return (
    <div className={`
      relative min-w-[240px] rounded-lg shadow-sm transition-all duration-200
      ${colors.bg} ${colors.border} border
      ${selected ? 'shadow-lg ring-2 ring-blue-400 scale-105' : 'hover:shadow-md'}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="p-3">
        <div className="flex items-start gap-2">
          <Icon className={`w-4 h-4 ${colors.icon} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium text-sm ${colors.text} line-clamp-2`}>
              {data.label}
            </h3>
            {data.node.description && data.showLabels && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                {data.node.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Quick stats */}
        {data.showLabels && (
          <div className="flex items-center gap-3 mt-2">
            {data.node.due_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(data.node.due_date).toLocaleDateString()}</span>
              </div>
            )}
            {((data.node.comment_count || 0) + (data.node.artifact_count || 0)) > 0 && (
            <div className="flex items-center gap-2">
            {(data.node.comment_count || 0) > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-3 h-3" />
                    <span>{data.node.comment_count}</span>
                  </div>
                )}
                {(data.node.artifact_count || 0) > 0 && (
                  <div className="flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                    <Paperclip className="w-3 h-3" />
                    <span>{data.node.artifact_count}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// Simplified Milestone Node
export const SimplifiedMilestoneNode: React.FC<BaseNodeProps> = ({ data, selected }) => {
  const colors = getNodeColors('milestone', data.node.status);
  const Icon = getNodeIcon('milestone', data.node.status);
  
  return (
    <div className={`
      relative min-w-[200px] rounded-full shadow-sm transition-all duration-200
      ${colors.bg} ${colors.border} border-2
      ${selected ? 'shadow-lg ring-2 ring-purple-400 scale-105' : 'hover:shadow-md'}
    `}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.icon} flex-shrink-0`} />
          <h3 className={`font-semibold text-sm ${colors.text} line-clamp-1`}>
            {data.label}
          </h3>
        </div>
        
        {data.node.due_date && data.showLabels && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-2">
            <Calendar className="w-3 h-3" />
            <span>{new Date(data.node.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

// Root node (simplified)
export const SimplifiedRootNode: React.FC<BaseNodeProps> = ({ data, selected }) => {
  const colors = getNodeColors('phase', data.node.status);
  const Icon = Folder;
  
  return (
    <div className={`
      relative min-w-[320px] rounded-2xl shadow-md transition-all duration-200
      bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30
      border-2 border-indigo-400 dark:border-indigo-600
      ${selected ? 'shadow-xl ring-2 ring-indigo-400 scale-105' : 'hover:shadow-lg'}
    `}>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">
              {data.label}
            </h2>
            {data.node.description && (
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                {data.node.description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};
