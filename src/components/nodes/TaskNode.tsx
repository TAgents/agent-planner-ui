// src/components/nodes/TaskNode.tsx
import React, { memo, useEffect, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    getStatusColor,
    getNodeTypeIcon,
    getDueDateStatus,
    getDueDateIconAndColor
} from '../../utils/planUtils';
import { PlanNode } from '../../types';
import { MessageSquare, ScrollText, FileText } from 'lucide-react'; // Icons for indicators
import api from '../../services/api';

interface NodeStats {
  comment_count: number;
  log_count: number;
  artifact_count: number;
  progress: number;
  subtask_count: number;
  completed_subtask_count: number;
  assignees: string[];
  risk_level: 'low' | 'medium' | 'high';
}

const TaskNode: React.FC<NodeProps> = ({ data, selected }) => {
  // State for real data - MUST be declared before any conditional returns
  const [nodeStats, setNodeStats] = useState<NodeStats>({
    comment_count: 0,
    log_count: 0,
    artifact_count: 0,
    progress: 0,
    subtask_count: 0,
    completed_subtask_count: 0,
    assignees: [],
    risk_level: 'low'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Use stable values for dependencies
  const planId = data?.planId;
  const nodeId = data?.node?.id;

  // Fetch real data - MUST be declared before any conditional returns
  useEffect(() => {
    const fetchNodeData = async () => {
      if (!data?.planId || !data?.node?.id) {
        setIsLoading(false);
        return;
      }
      
      // Prevent re-fetching if we already have data for this node
      if (hasFetchedData && data?.node?.id === nodeId) {
        return;
      }

      // Use actual node data if available
      const nodeData = data.node;
      const hasActualStats = nodeData.metadata && (
        nodeData.metadata.progress !== undefined ||
        nodeData.metadata.subtask_count !== undefined ||
        nodeData.metadata.assignees !== undefined
      );

      try {
        // Parallel fetch all available data
        const [commentsRes, logsRes, artifactsRes] = await Promise.allSettled([
          api.comments.getComments(data.planId, data.node.id),
          api.logs.getLogs(data.planId, data.node.id),
          api.artifacts.getArtifacts(data.planId, data.node.id)
        ]);

        // Process comments
        let commentCount = 0;
        if (commentsRes.status === 'fulfilled') {
          const comments = commentsRes.value;
          commentCount = Array.isArray(comments) ? comments.length : 
                       comments.data ? comments.data.length : 0;
        }

        // Process logs
        let logCount = 0;
        if (logsRes.status === 'fulfilled') {
          const logs = logsRes.value;
          logCount = Array.isArray(logs) ? logs.length : 
                    logs.data ? logs.data.length : 0;
        }

        // Process artifacts
        let artifactCount = 0;
        if (artifactsRes.status === 'fulfilled') {
          const artifacts = artifactsRes.value;
          artifactCount = Array.isArray(artifacts) ? artifacts.length : 
                        artifacts.data ? artifacts.data.length : 0;
        }

        // Use actual data from node metadata if available, otherwise use stable mock data
        let progress, subtaskCount, completedSubtaskCount, assignees, riskLevel;
        
        if (hasActualStats && nodeData.metadata) {
          // Use actual data from metadata
          progress = nodeData.metadata.progress || 0;
          subtaskCount = nodeData.metadata.subtask_count || 0;
          completedSubtaskCount = nodeData.metadata.completed_subtask_count || 0;
          assignees = nodeData.metadata.assignees || [];
          riskLevel = nodeData.metadata.risk_level || 'low';
        } else {
          // Generate stable mock data based on node ID
          const nodeIdHash = data.node.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
          
          progress = nodeIdHash % 101; // 0-100
          subtaskCount = (nodeIdHash % 10) + 1; // 1-10
          completedSubtaskCount = Math.floor(progress / 100 * subtaskCount);
          
          // Generate consistent assignees
          const allAssignees = ['Alice', 'Bob', 'Carol', 'David', 'Eve'];
          const assigneeCount = (nodeIdHash % 3) + 1; // 1-3 assignees
          const startIndex = nodeIdHash % allAssignees.length;
          assignees = [];
          for (let i = 0; i < assigneeCount; i++) {
            assignees.push(allAssignees[(startIndex + i) % allAssignees.length]);
          }
          
          riskLevel = nodeIdHash % 10 > 7 ? 'high' : nodeIdHash % 10 > 4 ? 'medium' : 'low';
        }

        setNodeStats({
          comment_count: commentCount,
          log_count: logCount,
          artifact_count: artifactCount,
          progress: progress,
          subtask_count: subtaskCount,
          completed_subtask_count: completedSubtaskCount,
          assignees: assignees,
          risk_level: riskLevel as 'low' | 'medium' | 'high'
        });
        
        setHasFetchedData(true);
      } catch (error) {
        console.error('Error fetching node data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodeData();
  }, [planId, nodeId, hasFetchedData]);

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

  // Use real data from state
  const hasComments = nodeStats.comment_count > 0;
  const hasLogs = nodeStats.log_count > 0;
  const hasArtifacts = nodeStats.artifact_count > 0;
  const progress = nodeStats.progress;
  const subtasks = nodeStats.subtask_count;
  const completedSubtasks = nodeStats.completed_subtask_count;
  const assignees = nodeStats.assignees;
  const hasRisk = nodeStats.risk_level === 'high';

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