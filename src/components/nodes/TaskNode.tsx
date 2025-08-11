// src/components/nodes/TaskNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    getStatusColor,
    getNodeTypeIcon,
    getDueDateStatus,
    getDueDateIconAndColor
} from '../../utils/planUtils';
import { PlanNode } from '../../types';
import { MessageSquare, ScrollText, FileText } from 'lucide-react'; // Icons for indicators

const TaskNode: React.FC<NodeProps> = ({ data, selected }) => {
  // Add defensive check for node data
  if (!data || !data.node) {
    console.error('TaskNode: Invalid or missing node data provided in props:', data);
    // Render a fallback error node
    return (
      <>
        <Handle type="target" position={Position.Top} isConnectable={false} />
        <div className="p-3 shadow-sm bg-red-100 border-2 border-red-400 rounded-lg min-w-[150px]">
          <div className="text-red-700 font-semibold">Error: Invalid Node Data</div>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={false} />
      </>
    );
  }

  const node: PlanNode = data.node;
  const title = node.title || 'Untitled Task';
  const status = node.status || 'not_started';
  const NodeTypeIcon = getNodeTypeIcon(node.node_type);
  const dueDateStatus = getDueDateStatus(node.due_date);
  const DueDateInfo = getDueDateIconAndColor(dueDateStatus);

  // Layer and view settings from parent
  const activeLayer = data.activeLayer || 'overview';
  const currentZoom = data.currentZoom || 1;
  const showLabels = data.showLabels !== false;
  const showProgress = data.showProgress !== false;
  const showDependencies = data.showDependencies !== false;

  // Placeholder for content indicators - replace with real data later
  const hasComments = false; // TODO: Replace with real data, e.g., node.comment_count > 0
  const hasLogs = false; // TODO: Replace with real data, e.g., node.log_count > 0
  const hasArtifacts = false; // TODO: Replace with real data, e.g., node.artifact_count > 0
  
  // Calculate progress (mock data for now)
  const progress = Math.floor(Math.random() * 100);
  const subtasks = Math.floor(Math.random() * 10) + 1;
  const completedSubtasks = Math.floor(progress / 100 * subtasks);
  const assignees = ['Alice', 'Bob', 'Carol'].slice(0, Math.floor(Math.random() * 3) + 1);
  const hasRisk = Math.random() > 0.7;

  // Render different content based on zoom level
  if (currentZoom < 0.5) {
    // Minimal view - just a colored dot
    return (
      <>
        <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
        <div className={`w-4 h-4 rounded-full ${getStatusColor(status)} ${selected ? 'ring-4 ring-blue-500' : ''}`} />
      </>
    );
  }

  if (currentZoom < 0.8) {
    // Compact view - title and progress only
    return (
      <>
        <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
        <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
        <div className={`p-2 rounded-lg min-w-[120px] ${selected ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'} shadow-sm`}>
          <div className="flex items-center gap-1 mb-1">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
            {showLabels && <h3 className="text-xs font-medium truncate">{title}</h3>}
          </div>
          {showProgress && activeLayer !== 'risks' && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  // Full view with layer-specific content
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
      
      <div className={`p-3 rounded-lg min-w-[200px] max-w-[280px] ${selected ? 'bg-blue-100 border-2 border-blue-500 shadow-xl dark:bg-blue-800' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'} transition-all duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
            {NodeTypeIcon && <NodeTypeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
            {showLabels && <h3 className="font-semibold text-sm truncate">{title}</h3>}
          </div>
          {activeLayer === 'risks' && hasRisk && (
            <div className="text-red-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
        </div>

        {/* Layer-specific content */}
        {activeLayer === 'overview' && (
          <>
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {completedSubtasks}/{subtasks}
              </span>
              {DueDateInfo && (
                <span className={`flex items-center gap-1 ${DueDateInfo.color}`}>
                  <DueDateInfo.Icon className="w-3 h-3" />
                  <span className="text-xs">Due</span>
                </span>
              )}
            </div>
            {showProgress && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      progress === 100 ? 'bg-green-500' :
                      progress > 70 ? 'bg-blue-500' :
                      progress > 30 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {activeLayer === 'progress' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Completion</span>
              <span className="text-lg font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{completedSubtasks} done</span>
              <span>{subtasks - completedSubtasks} left</span>
            </div>
          </div>
        )}

        {activeLayer === 'timeline' && (
          <div className="space-y-2">
            {DueDateInfo && (
              <div className={`flex items-center gap-2 text-sm ${DueDateInfo.color}`}>
                <DueDateInfo.Icon className="w-4 h-4" />
                <span>
                  {dueDateStatus === 'overdue' ? 'Overdue' : 
                   dueDateStatus === 'upcoming' ? 'Due Soon' : 
                   'On Track'}
                </span>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {node.due_date ? `Due: ${new Date(node.due_date).toLocaleDateString()}` : 'No due date'}
            </div>
          </div>
        )}

        {activeLayer === 'resources' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs text-gray-600">Assignees</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {assignees.map((person, i) => (
                <span 
                  key={i} 
                  className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                >
                  {person}
                </span>
              ))}
            </div>
            <div className="text-xs text-gray-500">
              Workload: {subtasks} subtasks
            </div>
          </div>
        )}

        {activeLayer === 'risks' && (
          <div className="space-y-2">
            {hasRisk ? (
              <>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium text-red-600">High Risk</span>
                </div>
                <p className="text-xs text-gray-600">
                  Behind schedule, may impact dependencies
                </p>
              </>
            ) : (
              <p className="text-sm text-green-600">No risks identified</p>
            )}
          </div>
        )}

        {/* Indicators */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500">{node.node_type}</span>
          <div className="flex space-x-1.5">
            {hasComments && <MessageSquare className="w-3 h-3 text-gray-400" />}
            {hasLogs && <ScrollText className="w-3 h-3 text-gray-400" />}
            {hasArtifacts && <FileText className="w-3 h-3 text-gray-400" />}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(TaskNode);