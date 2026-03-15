import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  HelpCircle,
  X,
  Check,
  ChevronDown,
  Lock,
  Globe,
  GitBranch,
  List,
  MoreHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import new components
import EmptyStateGuide from '../components/visualization/EmptyStateGuide';
import ShareButton from '../components/sharing/ShareButton';
import { PlanTreeView } from '../components/tree/PlanTreeView';
import { getNextStatus } from '../components/tree/StatusBadge';
import VisibilityToggle from '../components/plans/VisibilityToggle';
import GitHubRepoBadge from '../components/github/GitHubRepoBadge';
import PlanBreadcrumb from '../components/plan/PlanBreadcrumb';
import { DecisionBadge, DecisionPanel, DecisionDetailModal } from '../components/decisions';

import { useAgentRequestEvents } from '../hooks/useAgentRequests';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFocusNavigation } from '../hooks/useFocusNavigation';
import { useViewPresence } from '../contexts/PresenceContext';
import { PresenceIndicator } from '../components/presence/PresenceIndicator';

// Import existing components
import { useUI } from '../contexts/UIContext';
import { usePlan } from '../hooks/usePlans';
import { planService } from '../services/api';
import { useNodes, useNode } from '../hooks/useNodes';
import { usePlanEvents } from '../hooks/useWebSocket';
import { NodeType, NodeStatus, Decision, PlanStatus } from '../types';

// Import detail components
import UnifiedNodeDetails from '../components/details/UnifiedNodeDetails';

// Import WebSocket status indicator
import WebSocketStatus from '../components/websocket/WebSocketStatus';
import { useDependencies, useCriticalPath } from '../hooks/useDependencies';
import { useBottlenecks } from '../hooks/useBottlenecks';

// Lazy-load dependency graph (heavy React Flow component)
const DependencyGraph = React.lazy(() => import('../components/visualization/DependencyGraph'));

// Enhanced Help Modal Component with keyboard shortcuts
const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      name: 'Navigation',
      shortcuts: [
        { key: 'j', description: 'Move to next task' },
        { key: 'k', description: 'Move to previous task' },
        { key: 'Enter', description: 'Open task details' },
        { key: '/', description: 'Focus search' },
      ],
    },
    {
      name: 'Actions',
      shortcuts: [
        { key: 'Space', description: 'Toggle task status' },
        { key: 'e', description: 'Edit focused task' },
        { key: 'n', description: 'New task in current phase' },
        { key: 'Shift+N', description: 'New phase' },
      ],
    },
    {
      name: 'General',
      shortcuts: [
        { key: 'Esc', description: 'Close modal/panel' },
        { key: '?', description: 'Show this help' },
        { key: 's', description: 'Toggle sidebar' },
        { key: 'f', description: 'Toggle fullscreen' },
      ],
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 id="help-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Keyboard Shortcuts
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Close help"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-5">
          {shortcutGroups.map((group) => (
            <div key={group.name}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                {group.name}
              </h4>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-800 dark:text-gray-200 font-mono text-xs">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">?</kbd> anytime to show this help
        </p>
      </div>
    </div>
  );
};

// Plan Status Badge - inline dropdown for changing plan status
const PlanStatusBadge: React.FC<{
  status: PlanStatus;
  isOwner: boolean;
  onStatusChange: (status: PlanStatus) => void;
}> = ({ status, isOwner, onStatusChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig: Record<PlanStatus, { dot: string; bg: string; text: string; label: string }> = {
    draft: { dot: 'bg-gray-400', bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Draft' },
    active: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', label: 'Active' },
    completed: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', label: 'Completed' },
    archived: { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', label: 'Archived' },
  };

  const config = statusConfig[status] || statusConfig.draft;
  const statuses: PlanStatus[] = ['draft', 'active', 'completed', 'archived'];

  return (
    <div className="relative">
      <button
        onClick={() => isOwner && setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${config.bg} ${config.text} ${
          isOwner ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
        }`}
        title={isOwner ? 'Change plan status' : `Plan status: ${config.label}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
        {isOwner && <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {isOpen && isOwner && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[120px]">
            {statuses.map((s) => {
              const sc = statusConfig[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    onStatusChange(s);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    s === status ? 'font-medium' : ''
                  } ${sc.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {sc.label}
                  {s === status && <Check className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const PlanVisualizationEnhanced: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state: uiState, toggleSidebar, openNodeDetails, closeNodeDetails } = useUI();
  const queryClient = useQueryClient();
  
  // Data fetching
  const { plan, isLoading: isPlanLoading, error: planError, refetch: refetchPlan } = usePlan(planId || '');
  const {
    nodes: planNodes,
    isLoading: isNodesLoading,
    createNode,
    updateNode,
    updateNodeStatus,
    moveNode,
    refetch: refetchNodes,
  } = useNodes(planId || '');
  const { node: selectedNodeFromAPI, refetch: refetchSelectedNode } = useNode(
    planId || '',
    uiState.nodeDetails.selectedNodeId || ''
  );

  // Get the selected node - prefer selectedNodeFromAPI which has full details (description, context, etc.)
  // The planNodes list only has basic fields (id, title, status, etc.)
  const selectedNode = useMemo(() => {
    if (!uiState.nodeDetails.selectedNodeId) return null;
    const nodeFromList = planNodes.find(n => n.id === uiState.nodeDetails.selectedNodeId);
    // Merge: use API response for detailed fields, but nodeFromList for real-time status updates
    if (selectedNodeFromAPI && nodeFromList) {
      return {
        ...selectedNodeFromAPI,
        // Keep status from nodeFromList as it may be more up-to-date from WebSocket updates
        status: nodeFromList.status,
      };
    }
    return selectedNodeFromAPI || nodeFromList;
  }, [planNodes, selectedNodeFromAPI, uiState.nodeDetails.selectedNodeId]);

  // Track presence for this plan (shows who is viewing)
  const { viewers: planViewers } = useViewPresence('plan', planId);

  // Get user ID for query keys (matching useNodes implementation)
  const getUserId = useCallback(() => {
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) return 'anonymous';
    try {
      const session = JSON.parse(sessionStr);
      return session.user?.id || session.user?.email || 'anonymous';
    } catch (e) {
      return 'anonymous';
    }
  }, []);
  // Cache the user ID so WebSocket handlers don't re-parse localStorage on every event
  const userId = useMemo(() => getUserId(), [getUserId]);

  // Check if current user is the plan owner
  const isOwner = useMemo(() => {
    if (!plan) return false;
    return plan.owner_id === userId;
  }, [plan, userId]);

  // Subscribe to real-time WebSocket updates for this plan
  const handleNodeEvent = useCallback(() => {
    queryClient.invalidateQueries(['nodes', userId, planId]);
    queryClient.invalidateQueries(['planActivity', planId]);
  }, [planId, queryClient, userId]);

  const handleActivityEvent = useCallback(() => {
    queryClient.invalidateQueries(['planActivity', planId]);
  }, [planId, queryClient]);

  usePlanEvents(planId || null, {
    onNodeCreated: handleNodeEvent,
    onNodeUpdated: handleNodeEvent,
    onNodeDeleted: handleNodeEvent,
    onNodeMoved: handleNodeEvent,
    onNodeStatusChanged: handleNodeEvent,

    onPlanUpdated: useCallback(() => {
      queryClient.invalidateQueries(['plan', userId, planId]);
    }, [planId, queryClient, userId]),

    onCommentAdded: handleActivityEvent,
    onLogAdded: handleActivityEvent,
  });

  // Subscribe to agent request WebSocket events
  useAgentRequestEvents(planId || '');

  // Keyboard focus navigation
  const {
    focusedId,
    focusedNode,
    focusNext,
    focusPrev,
  } = useFocusNavigation(planNodes, {
    onFocusChange: (nodeId) => {
      if (nodeId) {
        openNodeDetails(nodeId);
      }
    },
  });

  // View mode: tree (default) or dependencies
  const [viewMode, setViewMode] = useState<'tree' | 'dependencies'>('tree');

  // Dependency data
  const {
    dependencies,
    isLoading: isDepsLoading,
    createDependency,
    deleteDependency,
  } = useDependencies(planId || '');

  const { criticalPath } = useCriticalPath(planId || '', viewMode === 'dependencies');

  // Bottleneck analysis
  const { data: bottlenecks = [] } = useBottlenecks(planId || '');

  const criticalPathNodeIds = useMemo(() => {
    if (!criticalPath?.path) return new Set<string>();
    return new Set(criticalPath.path.map((n: any) => n.node_id));
  }, [criticalPath]);

  const handleDeleteDependency = useCallback((depId: string) => {
    deleteDependency.mutate(depId);
  }, [deleteDependency]);

  const handleCreateDependency = useCallback((sourceId: string, targetId: string, type: 'blocks' | 'requires' | 'relates_to') => {
    createDependency.mutate({
      source_node_id: sourceId,
      target_node_id: targetId,
      dependency_type: type,
    });
  }, [createDependency]);

  // UI state
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setActiveDetailTab] = useState<'details' | 'comments' | 'logs'>('details');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  
  // Decision UI state
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Overflow menu state
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);
  
  // Handle visibility change
  const handleVisibilityChange = useCallback((newVisibility: 'public' | 'private') => {
    queryClient.invalidateQueries(['plan', userId, planId]);
  }, [planId, queryClient, userId]);

  // Scroll to top when plan loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planId]);


  // Handle node selection (from tree)
  const handleNodeSelect = useCallback((nodeId: string) => {
    setActiveDetailTab('details');
    if (!uiState.sidebar.isOpen) {
      toggleSidebar();
    }
    openNodeDetails(nodeId);
  }, [uiState.sidebar.isOpen, toggleSidebar, openNodeDetails]);

  // Fullscreen handling
  const toggleFullScreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Create node handler (defined before keyboard shortcuts so it's available)
  const handleCreateNode = useCallback(() => {
    setIsCreatingNode(true);
  }, []);

  // Keyboard shortcuts for plan view
  useKeyboardShortcuts([
    // Navigation
    { key: 'j', action: focusNext, description: 'Next task' },
    { key: 'k', action: focusPrev, description: 'Previous task' },
    { 
      key: 'Enter', 
      action: () => {
        if (focusedId) openNodeDetails(focusedId);
      },
      description: 'Open task details' 
    },
    // Actions
    { 
      key: ' ', 
      action: () => {
        if (focusedNode) {
          const nextStatus = getNextStatus(focusedNode.status);
          updateNodeStatus.mutate({ nodeId: focusedNode.id, status: nextStatus });
        }
      },
      description: 'Toggle status' 
    },
    { 
      key: 'n', 
      action: () => {
        // Add task to current phase or root
        const parentId = focusedNode?.node_type === 'phase' 
          ? focusedNode.id 
          : focusedNode?.parent_id;
        if (parentId) {
          setNewNodeParentId(parentId);
          setNewNodeType('task');
          handleCreateNode();
        }
      },
      description: 'New task' 
    },
    { 
      key: 'n', 
      shift: true,
      action: () => {
        // Find root and add phase
        const root = planNodes.find(n => n.node_type === 'root');
        if (root) {
          setNewNodeParentId(root.id);
          setNewNodeType('phase');
          handleCreateNode();
        }
      },
      description: 'New phase' 
    },
    // General
    { 
      key: 'Escape', 
      action: () => {
        if (showHelp) setShowHelp(false);
        else if (showDecisionPanel) setShowDecisionPanel(false);
        else if (selectedDecision) setSelectedDecision(null);
        else if (uiState.nodeDetails.isOpen) closeNodeDetails();
      },
      description: 'Close' 
    },
    { key: '?', action: () => setShowHelp(true), description: 'Help' },
    { key: 's', action: toggleSidebar, description: 'Toggle sidebar' },
    { key: 'f', action: toggleFullScreen, description: 'Fullscreen' },
  ], !!plan);

  const submitNewNode = (title: string) => {
    if (!planId) return;
    
    createNode.mutate({
      plan_id: planId,
      parent_id: newNodeParentId || undefined,
      title,
      node_type: newNodeType,
      status: 'not_started',
    }, {
      onSuccess: () => {
        setIsCreatingNode(false);
        setNewNodeType('task');
        setNewNodeParentId(null);
      }
    });
  };

  // Inline node creation (for quick add from tree view)
  const handleInlineNodeCreate = useCallback(async (parentId: string, title: string, nodeType: NodeType) => {
    if (!planId) return;
    
    return new Promise<void>((resolve, reject) => {
      createNode.mutate({
        plan_id: planId,
        parent_id: parentId,
        title,
        node_type: nodeType,
        status: 'not_started',
      }, {
        onSuccess: () => {
          resolve();
        },
        onError: (error) => {
          reject(error);
        }
      });
    });
  }, [planId, createNode]);

  // Handle status change
  const handleStatusChange = useCallback((nodeId: string, newStatus: NodeStatus) => {
    if (!planId) return;

    // Update via API
    updateNodeStatus.mutate(
      { nodeId, status: newStatus },
      {
        onSuccess: () => {
          // Refetch to ensure all data is in sync
          refetchNodes();
          if (nodeId === uiState.nodeDetails.selectedNodeId) {
            refetchSelectedNode();
          }

          // Invalidate activity-related queries for the updated node
          queryClient.invalidateQueries(['nodeLogs', planId, nodeId]);
          queryClient.invalidateQueries(['nodeArtifacts', planId, nodeId]);
          queryClient.invalidateQueries(['nodeComments', planId, nodeId]);
          queryClient.invalidateQueries(['nodeAssignments', planId, nodeId]);
          queryClient.invalidateQueries(['planActivity', planId]);

          console.log(`Status updated successfully for node ${nodeId}, refreshing activity view`);
        },
        onError: (error) => {
          console.error('Failed to update status:', error);
          // Refetch on error
          refetchNodes();
        }
      }
    );
  }, [planId, updateNodeStatus, refetchNodes, refetchSelectedNode, uiState.nodeDetails.selectedNodeId, queryClient]);

  // Handle node move (drag & drop)
  const handleNodeMove = useCallback((nodeId: string, newParentId: string | null, newOrderIndex?: number) => {
    if (!planId) return;

    console.log('handleNodeMove called:', { nodeId, newParentId, newOrderIndex });

    moveNode.mutate(
      { nodeId, parentId: newParentId, orderIndex: newOrderIndex },
      {
        onSuccess: () => {
          console.log('Node moved successfully');
          refetchNodes();
        },
        onError: (error) => {
          console.error('Failed to move node:', error);
          // Could add toast notification here
        }
      }
    );
  }, [planId, moveNode, refetchNodes]);

  // Progress calculation for header ring
  const headerProgress = useMemo(() => {
    if (planNodes.length === 0) return 0;
    const completed = planNodes.filter(n => n.status === 'completed').length;
    return Math.round((completed / planNodes.length) * 100);
  }, [planNodes]);

  // Loading state
  if (isPlanLoading || isNodesLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your plan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (planError || !plan) {
    const statusCode = (planError as any)?.response?.status || (planError as any)?.status;
    let errorTitle = 'Failed to load plan';
    let errorMessage = 'Please try again.';
    if (statusCode === 403) {
      errorTitle = 'Access denied';
      errorMessage = "You don't have access to this plan. Ask the owner to share it with you.";
    } else if (statusCode === 404 || !planError) {
      errorTitle = 'Plan not found';
      errorMessage = "The requested plan doesn't exist.";
    }
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">{errorTitle}</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{errorMessage}</p>
          <Link to="/app/plans" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Compact Header */}
      <header className="bg-white dark:bg-gray-900 z-10 border-b border-gray-200 dark:border-gray-800">
        <div className="px-3 sm:px-4 h-12 flex items-center justify-between gap-2">
          {/* Left section */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link to="/app/plans" className="p-1.5 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0">
              <ArrowLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </Link>

            {/* Progress Ring */}
            <div className="flex-shrink-0" title={`${headerProgress}% complete`}>
              <svg width="24" height="24" viewBox="0 0 24 24" className="transform -rotate-90">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-100 dark:text-gray-800" />
                <circle
                  cx="12" cy="12" r="10" fill="none" strokeWidth="2"
                  strokeDasharray={`${headerProgress * 0.628} 62.8`}
                  strokeLinecap="round"
                  className="text-emerald-500 dark:text-emerald-400 transition-all duration-700"
                />
              </svg>
            </div>

            <h1 className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={plan.title}>
              {plan.title}
            </h1>

            {/* View mode toggle */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('tree')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Tree view"
              >
                <List className="w-3.5 h-3.5" />
                Tree
              </button>
              <button
                onClick={() => { setViewMode('dependencies'); closeNodeDetails(); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-150 ${
                  viewMode === 'dependencies'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Dependency graph"
              >
                <GitBranch className="w-3.5 h-3.5" />
                Dependencies
                {dependencies.length > 0 && (
                  <span className="ml-0.5 px-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] tabular-nums">
                    {dependencies.length}
                  </span>
                )}
              </button>
            </div>

            {/* Show active viewers */}
            {planViewers.length > 0 && (
              <div className="hidden sm:block">
                <PresenceIndicator viewers={planViewers} maxVisible={3} size="sm" />
              </div>
            )}
          </div>

          {/* Right section — primary actions + overflow */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Plan Status Badge */}
            <PlanStatusBadge
              status={(plan.status as PlanStatus) || 'draft'}
              isOwner={isOwner}
              onStatusChange={async (status) => {
                try {
                  await planService.updatePlan(planId || '', { status });
                  refetchPlan();
                } catch (err: any) {
                  console.error('Failed to update plan status:', err);
                  const statusCode = err?.response?.status || err?.status;
                  if (statusCode === 403) {
                    alert('Only the plan owner can change this plan\'s status.');
                  } else {
                    alert('Failed to update plan status. Please try again.');
                  }
                }
              }}
            />

            {/* Decision Badge */}
            <DecisionBadge
              planId={planId || ''}
              onClick={() => setShowDecisionPanel(true)}
            />

            <div data-tour="share-button">
              <ShareButton
                planId={planId || ''}
                planTitle={plan.title}
                variant="compact"
              />
            </div>

            {/* Overflow menu for secondary actions */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowOverflowMenu(!showOverflowMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
              <AnimatePresence>
                {showOverflowMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowOverflowMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                    >
                      {/* Visibility toggle as menu item */}
                      <VisibilityToggle
                        planId={planId || ''}
                        currentVisibility={plan.visibility || 'private'}
                        isOwner={isOwner}
                        onVisibilityChange={handleVisibilityChange}
                        variant="menuItem"
                      />
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      {/* GitHub Repo Link */}
                      <div className="px-1">
                        <GitHubRepoBadge
                          planId={planId || ''}
                          owner={plan.github_repo_owner}
                          name={plan.github_repo_name}
                          isOwner={isOwner}
                          onLinked={() => {
                            queryClient.invalidateQueries(['plan', userId, planId]);
                          }}
                          variant="compact"
                        />
                      </div>
                      <button
                        onClick={() => { toggleFullScreen(); setShowOverflowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      </button>
                      <button
                        onClick={() => { setShowHelp(true); setShowOverflowMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <HelpCircle className="w-3.5 h-3.5" /> Keyboard Shortcuts
                      </button>
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
                      <div className="px-3 py-1.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <WebSocketStatus showDetails={false} />
                        <span>Real-time</span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation - shows when a node is selected */}
      {uiState.nodeDetails.selectedNodeId && (
        <div className="px-4 py-1.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <PlanBreadcrumb
            planId={planId || ''}
            planTitle={plan.title}
            nodes={planNodes}
            selectedNodeId={uiState.nodeDetails.selectedNodeId}
            onNodeSelect={handleNodeSelect}
          />
        </div>
      )}

      {/* Main Content - Split Pane Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Main view area - Tree or Dependency Graph */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {viewMode === 'tree' ? (
            // Tree View
            planNodes.length === 0 && !isPlanLoading && !isNodesLoading ? (
              <EmptyStateGuide
                planTitle={plan.title}
                onCreateFirstNode={handleCreateNode}
              />
            ) : (
              <PlanTreeView
                nodes={planNodes}
                selectedNodeId={uiState.nodeDetails.selectedNodeId}
                onNodeSelect={handleNodeSelect}
                onNodeStatusChange={handleStatusChange}
                onNodeCreate={() => handleCreateNode()}
                onNodeCreateInline={handleInlineNodeCreate}
                onNodeMove={handleNodeMove}
                dependencies={dependencies}
                bottlenecks={bottlenecks}
                className="h-full"
              />
            )
          ) : (
            // Dependency Graph View
            <React.Suspense fallback={<div className="flex items-center justify-center h-full text-gray-400">Loading graph...</div>}>
              <DependencyGraph
                planId={planId}
                nodes={planNodes}
                dependencies={dependencies}
                criticalPathNodeIds={criticalPathNodeIds}
                onNodeClick={handleNodeSelect}
                onDeleteDependency={handleDeleteDependency}
                onCreateDependency={handleCreateDependency}
                isLoading={isDepsLoading}
                className="h-full"
              />
            </React.Suspense>
          )}
        </div>

        {/* Node creation modal */}
        {isCreatingNode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Node</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={newNodeType}
                    onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="phase">Phase</option>
                    <option value="task">Task</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent</label>
                  <select
                    value={newNodeParentId || ''}
                    onChange={(e) => setNewNodeParentId(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">No Parent (Root)</option>
                    {planNodes.map(node => (
                      <option key={node.id} value={node.id}>{node.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter node title"
                    id="new-node-title"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsCreatingNode(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const titleInput = document.getElementById('new-node-title') as HTMLInputElement;
                      if (titleInput.value) {
                        submitNewNode(titleInput.value);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop & Tablet (Fixed width split pane) */}
        <AnimatePresence mode="wait">
          {uiState.sidebar.isOpen && uiState.nodeDetails.isOpen && selectedNode && (
            <motion.aside
              key="detail-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="hidden md:flex flex-col flex-shrink-0 w-[320px] lg:w-[380px] xl:w-[420px] border-l border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <UnifiedNodeDetails
                node={selectedNode}
                planId={planId || ''}
                currentUser={{ id: '1', name: 'Current User', email: 'user@example.com', role: 'user' }}
                activeUsers={[]}
                onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)}
                onClose={closeNodeDetails}
                allNodes={planNodes}
                onUpdateNode={async (nodeId, data) => {
                  await updateNode.mutateAsync({ nodeId, data });
                  refetchSelectedNode();
                }}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Node Details Modal - Mobile Only */}
        {uiState.nodeDetails.isOpen && selectedNode && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={closeNodeDetails}
            />

            {/* Modal Content */}
            <div className="relative w-full h-[90vh] sm:h-[85vh] sm:max-w-2xl sm:rounded-t-xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden animate-slide-up">
              <UnifiedNodeDetails
                node={selectedNode}
                planId={planId || ''}
                currentUser={{ id: '1', name: 'Current User', email: 'user@example.com', role: 'user' }}
                activeUsers={[]}
                onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)}
                onClose={closeNodeDetails}
                allNodes={planNodes}
                onUpdateNode={async (nodeId, data) => {
                  await updateNode.mutateAsync({ nodeId, data });
                  refetchSelectedNode();
                }}
              />
            </div>
          </div>
        )}
      </div>


      {/* Help Modal */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Decision Panel */}
      <DecisionPanel
        planId={planId || ''}
        isOpen={showDecisionPanel}
        onClose={() => setShowDecisionPanel(false)}
        onSelectDecision={(decision) => {
          setSelectedDecision(decision);
          setShowDecisionPanel(false);
        }}
      />

      {/* Decision Detail Modal */}
      {selectedDecision && (
        <DecisionDetailModal
          decision={selectedDecision}
          planId={planId || ''}
          isOpen={!!selectedDecision}
          onClose={() => setSelectedDecision(null)}
          onDecisionMade={() => {
            setSelectedDecision(null);
          }}
        />
      )}


    </div>
  );
};

export default PlanVisualizationEnhanced;
