import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FileText, Activity, Brain, Code2, GitBranch, Cpu, Pencil, X, Calendar, Clock, Edit3 } from 'lucide-react';
import { PlanNode, NodeStatus, NodeType, TaskMode, User as UserType } from '../../types';
import { useNodeLogs } from '../../hooks/useNodeLogs';
import { useCollaborators } from '../../hooks/useCollaborators';
import { useNodeAssignments } from '../../hooks/useNodeAssignments';
import { useNodeInstructions } from '../../hooks/useNodeInstructions';
import { formatDate } from '../../utils/dateUtils';
import NodeDependenciesTab from './NodeDependenciesTab';
import NodeKnowledgeTab from './NodeKnowledgeTab';
import AgentContextPanel from './AgentContextPanel';
import NodeDetailsLogs from './NodeDetailsLogs';
import NodeDetailsAgent from './NodeDetailsAgent';
import {
  ActivityFilter,
  UnifiedActivity,
  LogType,
  formatTimeAgo,
  NodeTypeIcon,
  StatusBadge,
  TaskModeBadge,
  ActionsMenu,
  UnifiedAssignmentSelector,
  CollapsibleSection,
  InlineEditField,
  InlineSelect,
} from './NodeDetailsPrimitives';

// Types
interface UnifiedNodeDetailsProps {
  node: PlanNode;
  planId: string;
  currentUser: UserType;
  activeUsers?: UserType[];
  typingUsers?: UserType[];
  onStatusChange: (status: NodeStatus) => void;
  onLogAdd?: (content: string, logType: string, tags?: string[]) => void;
  onActivityReact?: (activityId: string, emoji: string) => void;
  onActivityReply?: (activityId: string, text: string) => void;
  onAssignUser?: (userId: string) => void;
  onUnassignUser?: (userId: string) => void;
  onClose?: () => void;
  /** All nodes in the plan, for dependency picker */
  allNodes?: PlanNode[];
  onUpdateNode?: (nodeId: string, data: Partial<PlanNode>) => Promise<void>;
}

// Main Component
const UnifiedNodeDetails: React.FC<UnifiedNodeDetailsProps> = ({
  node,
  planId,
  currentUser,
  activeUsers = [],
  typingUsers = [],
  onStatusChange,
  onLogAdd,
  onActivityReact,
  onActivityReply,
  onAssignUser,
  onUnassignUser,
  onClose,
  allNodes = [],
  onUpdateNode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'instructions' | 'agent-context' | 'dependencies' | 'knowledge'>('overview');
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [assignedUser, setAssignedUser] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showRedirectInput, setShowRedirectInput] = useState(false);
  const [redirectText, setRedirectText] = useState('');

  // Reset tab and edit mode when node changes
  React.useEffect(() => {
    setActiveTab('overview');
    setIsEditMode(false);
    setShowRedirectInput(false);
    setRedirectText('');
  }, [node.id]);

  // Fetch logs from API
  const { logs, isLoading: logsLoading, addLogEntry, refetch: refetchLogs } = useNodeLogs(node.plan_id || planId, node.id);

  // Refetch logs when node changes or status updates
  React.useEffect(() => {
    if (node.id) {
      refetchLogs();
    }
  }, [node.id, node.status, refetchLogs]);

  // Fetch collaborators for assignment
  const { collaborators } = useCollaborators(planId);

  // Handle agent instructions updates
  const { updateInstructions } = useNodeInstructions(planId, node.id);

  // Fetch and manage node assignments
  const {
    assignments,
    isLoading: assignmentsLoading,
    assignUser: assignUserToNode,
    unassignUser: unassignUserFromNode,
    isAssigning,
    isUnassigning
  } = useNodeAssignments(planId, node.id);

  // Set assigned user from assignments when they load
  React.useEffect(() => {
    if (assignments && assignments.length > 0 && collaborators.length > 0) {
      const assignment = assignments[0];
      const user = collaborators.find(c => {
        const userData = c.user || c;
        return (userData.id || c.id) === assignment.user_id;
      });

      if (user) {
        const userData = user.user || user;
        setAssignedUser({
          id: assignment.user_id,
          name: userData.name,
          email: userData.email
        });
      }
    } else if (assignments && assignments.length === 0) {
      setAssignedUser(null);
    }
  }, [assignments, collaborators]);

  // Calculate progress
  const progress = node.status === 'completed' ? 100 :
                   node.status === 'in_progress' ? 50 : 0;

  // Convert logs to unified activities
  const activities: UnifiedActivity[] = React.useMemo(() => {
    return logs.map(log => ({
      id: log.id,
      nodeId: node.id,
      type: 'log' as const,
      actor: {
        id: log.user?.id || log.user_id,
        name: log.user?.name || 'Unknown User',
        email: log.user?.email,
        avatar: undefined
      },
      timestamp: new Date(log.created_at),
      data: {
        content: log.content,
        logType: log.log_type,
        tags: log.tags
      }
    })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [logs, node.id]);

  // Filter activities based on current filter
  const filteredActivities = React.useMemo(() => {
    if (activityFilter === 'all') return activities;
    if (activityFilter === 'logs') return activities.filter(a => a.type === 'log');
    return activities;
  }, [activities, activityFilter]);

  // Handle log addition
  const handleLogAdd = (content: string, logType: string, tags?: string[]) => {
    addLogEntry({
      content,
      log_type: logType,
      ...(tags && tags.length > 0 && { tags }),
    });
  };

  // Handle assignment
  const handleAssign = async (userId: string) => {
    try {
      await assignUserToNode(userId);
      const user = collaborators.find(c => {
        const userData = c.user || c;
        return (userData.id || c.id) === userId;
      });

      if (user) {
        const userData = user.user || user;
        setAssignedUser({
          id: userId,
          name: userData.name,
          email: userData.email
        });
      }

      onAssignUser?.(userId);
    } catch (error) {
      console.error('Failed to assign user:', error);
    }
  };

  const handleUnassign = async () => {
    if (assignedUser) {
      try {
        await unassignUserFromNode(assignedUser.id);
        setAssignedUser(null);
        onUnassignUser?.(assignedUser.id);
      } catch (error) {
        console.error('Failed to unassign user:', error);
      }
    }
  };

  // Action handlers
  const handleCopyId = () => {
    navigator.clipboard.writeText(node.id);
    alert('Node ID copied to clipboard');
  };

  const handleFieldUpdate = async (field: string, value: any) => {
    if (!onUpdateNode) return;
    await onUpdateNode(node.id, { [field]: value });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this node?')) {
      console.log('Delete node:', node.id);
      // TODO: Implement delete
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 min-w-0 overflow-hidden">
      {/* COMPACT HEADER */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <NodeTypeIcon nodeType={node.node_type} />
            {onUpdateNode && isEditMode ? (
              <InlineEditField
                value={node.title}
                placeholder="Untitled"
                onSave={(val) => handleFieldUpdate('title', val)}
                className="flex-1 min-w-0"
                readClassName="text-sm font-semibold text-gray-900 dark:text-white truncate"
                editClassName=""
              />
            ) : (
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={node.title}>
                {node.title}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1">
            <StatusBadge status={node.status} onChange={onStatusChange} nodeId={node.id} />
            {node.node_type === 'task' && (
              <TaskModeBadge
                mode={node.task_mode}
                onChange={onUpdateNode ? (val) => handleFieldUpdate('task_mode', val) : undefined}
                nodeId={node.id}
              />
            )}
            {onUpdateNode && (
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`p-1 rounded-md transition-colors duration-150 ${
                  isEditMode
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
                title={isEditMode ? 'Exit edit mode' : 'Edit mode'}
                aria-label={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            <ActionsMenu
              onCopyId={handleCopyId}
              onDelete={handleDelete}
            />
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-150 md:hidden"
                title="Close (ESC)"
                aria-label="Close details panel"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* APPROVE/REDIRECT ACTIONS for plan_ready nodes */}
      {node.status === 'plan_ready' && onUpdateNode && (
        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <button
              onClick={() => onStatusChange('not_started')}
              className="px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setShowRedirectInput(!showRedirectInput)}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Redirect
            </button>
          </div>
          {showRedirectInput && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={redirectText}
                onChange={(e) => setRedirectText(e.target.value)}
                placeholder="Enter new direction for this task..."
                className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-y min-h-[60px]"
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={async () => {
                    if (redirectText.trim()) {
                      await handleFieldUpdate('agent_instructions', redirectText.trim());
                      onStatusChange('not_started');
                      setRedirectText('');
                      setShowRedirectInput(false);
                    }
                  }}
                  className="px-2 py-1 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowRedirectInput(false); setRedirectText(''); }}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPACT METADATA BAR */}
      <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
        {/* Progress Bar */}
        <div className="mb-1.5">
          <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 mb-1">
            <span className="font-medium">Progress</span>
            <span className="font-semibold tabular-nums text-gray-600 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-500 dark:to-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Assignment and Due Date */}
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 dark:text-gray-500">Assigned to:</span>
            <UnifiedAssignmentSelector
              assignedUser={assignedUser}
              collaborators={collaborators}
              onAssignUser={handleAssign}
              onUnassignUser={handleUnassign}
              isLoading={assignmentsLoading}
              isUpdating={isAssigning || isUnassigning}
            />
          </div>
          {node.due_date && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>Due: {formatDate(node.due_date)}</span>
            </div>
          )}
        </div>

      </div>

      {/* TABBED CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Tab Navigation */}
        <div className="px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'activity'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Activity className="w-3 h-3" />
              <span>Activity</span>
              {activities.length > 0 && (
                <span className="ml-0.5 px-1 py-0 bg-gray-200 dark:bg-gray-700 rounded-full text-[10px] tabular-nums">
                  {activities.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 relative whitespace-nowrap flex-shrink-0 ${
                activeTab === 'instructions'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Code2 className="w-3 h-3" />
              <span>Instructions</span>
              {node.agent_instructions && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full" />
              )}
            </button>
            {node.node_type === 'task' && (
              <button
                onClick={() => setActiveTab('agent-context')}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'agent-context'
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Agent Context</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'dependencies'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <GitBranch className="w-3 h-3" />
              <span>Dependencies</span>
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'knowledge'
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Brain className="w-3 h-3" />
              <span>Knowledge</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="flex-1 overflow-y-auto p-3 flex flex-col min-w-0">
            <div className="flex-1 space-y-2">
              {/* Description */}
              {onUpdateNode && isEditMode ? (
                <InlineEditField
                  value={node.description || ''}
                  placeholder="Add a description..."
                  onSave={(val) => handleFieldUpdate('description', val)}
                  multiline
                  className=""
                  readClassName="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed"
                />
              ) : node.description ? (
                <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-relaxed" style={{ overflowWrap: 'anywhere' }}>
                  {node.description}
                </p>
              ) : (
                <p className="text-[11px] text-gray-400 dark:text-gray-500 italic">No description</p>
              )}

              {/* Due date */}
              {onUpdateNode && isEditMode ? (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-400 dark:text-gray-500">Due:</span>
                  <input
                    type="date"
                    value={node.due_date ? new Date(node.due_date).toISOString().split('T')[0] : ''}
                    onChange={async (e) => {
                      const val = e.target.value ? new Date(e.target.value).toISOString() : null;
                      await handleFieldUpdate('due_date', val);
                    }}
                    className="bg-transparent border-none text-[11px] text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 focus:outline-none"
                  />
                </div>
              ) : node.due_date ? (
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>Due: {formatDate(node.due_date)}</span>
                </div>
              ) : null}

              {/* Compact metadata row with inline dropdowns */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 pt-1">
                {onUpdateNode && isEditMode ? (
                  <InlineSelect
                    value={node.node_type}
                    options={[
                      { value: 'phase', label: 'Phase' },
                      { value: 'task', label: 'Task' },
                      { value: 'milestone', label: 'Milestone' },
                    ]}
                    onSave={(val) => handleFieldUpdate('node_type', val)}
                  />
                ) : (
                  <span className="capitalize">{node.node_type}</span>
                )}
                {onUpdateNode && isEditMode && node.node_type === 'task' ? (
                  <InlineSelect
                    value={node.task_mode || 'free'}
                    options={[
                      { value: 'free', label: 'Free' },
                      { value: 'research', label: 'Research' },
                      { value: 'plan', label: 'Plan' },
                      { value: 'implement', label: 'Implement' },
                    ]}
                    onSave={(val) => handleFieldUpdate('task_mode', val)}
                  />
                ) : node.task_mode && node.task_mode !== 'free' ? (
                  <span className="capitalize">{node.task_mode}</span>
                ) : null}
                {node.created_at && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDate(node.created_at)}
                  </span>
                )}
              </div>
            </div>

            {/* Ghost-style action buttons at bottom */}
            <div className="flex gap-1.5 pt-3 mt-auto border-t border-gray-100 dark:border-gray-800/60">
              <button
                onClick={() => {
                  setActivityFilter('logs');
                  setActiveTab('activity');
                }}
                className="px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Add Log
              </button>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <NodeDetailsLogs
            activities={filteredActivities}
            isLoading={logsLoading}
            onLogAdd={handleLogAdd}
          />
        )}

        {activeTab === 'instructions' && (
          <NodeDetailsAgent
            node={node}
            onUpdate={updateInstructions}
          />
        )}

        {activeTab === 'agent-context' && (
          <div className="flex-1 overflow-y-auto p-3">
            <AgentContextPanel nodeId={node.id} planId={planId} />
          </div>
        )}

        {activeTab === 'dependencies' && (
          <NodeDependenciesTab
            planId={planId}
            nodeId={node.id}
            nodeTitle={node.title}
            allNodes={allNodes}
          />
        )}

        {activeTab === 'knowledge' && (
          <NodeKnowledgeTab
            nodeTitle={node.title}
            planId={planId}
            nodeId={node.id}
          />
        )}

      </div>
    </div>
  );
};

export default UnifiedNodeDetails;
