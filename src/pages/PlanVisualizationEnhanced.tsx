import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from 'react-query';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  HelpCircle,
  X,
  Settings,
  MessageSquare as MessageSquareIcon,
} from 'lucide-react';

// Import new components
import EmptyStateGuide from '../components/visualization/EmptyStateGuide';
import OnboardingTour from '../components/visualization/OnboardingTour';
import ShareButton from '../components/sharing/ShareButton';
import { PlanTreeView } from '../components/tree/PlanTreeView';
import { getNextStatus } from '../components/tree/StatusBadge';
import VisibilityToggle from '../components/plans/VisibilityToggle';
import GitHubRepoBadge from '../components/github/GitHubRepoBadge';
import PlanBreadcrumb from '../components/plan/PlanBreadcrumb';
import { DecisionBadge, DecisionPanel, DecisionDetailModal } from '../components/decisions';
import { PlanSettingsModal } from '../components/plan/PlanSettingsModal';
import PlanChatPanel from '../components/chat/PlanChatPanel';
import AgentStatusIndicator from '../components/agent/AgentStatusIndicator';
import { useAgentRequestEvents } from '../hooks/useAgentRequests';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useFocusNavigation } from '../hooks/useFocusNavigation';
import { useViewPresence } from '../contexts/PresenceContext';
import { PresenceIndicator } from '../components/presence/PresenceIndicator';

// Import existing components
import { useUI } from '../contexts/UIContext';
import { usePlan } from '../hooks/usePlans';
import { useNodes, useNode } from '../hooks/useNodes';
import { usePlanActivity } from '../hooks/usePlanActivity';
import { usePlanEvents } from '../hooks/useWebSocket';
import { NodeType, NodeStatus, Decision } from '../types';

// Import detail components
import UnifiedNodeDetails from '../components/details/UnifiedNodeDetails';

// Import WebSocket status indicator
import WebSocketStatus from '../components/websocket/WebSocketStatus';

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

const PlanVisualizationEnhanced: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state: uiState, toggleSidebar, openNodeDetails, closeNodeDetails } = useUI();
  const queryClient = useQueryClient();
  
  // Data fetching
  const { plan, isLoading: isPlanLoading } = usePlan(planId || '');
  const {
    nodes: planNodes,
    isLoading: isNodesLoading,
    createNode,
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
  usePlanActivity(planId || '', 1, 5);

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
      console.error('Error parsing session:', e);
      return 'anonymous';
    }
  }, []);

  // Check if current user is the plan owner
  const isOwner = useMemo(() => {
    if (!plan) return false;
    const currentUserId = getUserId();
    return plan.owner_id === currentUserId;
  }, [plan, getUserId]);

  // Subscribe to real-time WebSocket updates for this plan
  usePlanEvents(planId || null, {
    onNodeCreated: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['nodes', userId, planId]);
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Node created - refreshing nodes');
    }, [planId, queryClient, getUserId]),

    onNodeUpdated: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['nodes', userId, planId]);
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Node updated - refreshing nodes');
    }, [planId, queryClient, getUserId]),

    onNodeDeleted: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['nodes', userId, planId]);
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Node deleted - refreshing nodes');
    }, [planId, queryClient, getUserId]),

    onNodeMoved: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['nodes', userId, planId]);
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Node moved - refreshing nodes');
    }, [planId, queryClient, getUserId]),

    onNodeStatusChanged: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['nodes', userId, planId]);
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Node status changed - refreshing nodes');
    }, [planId, queryClient, getUserId]),

    onPlanUpdated: useCallback(() => {
      const userId = getUserId();
      queryClient.invalidateQueries(['plan', userId, planId]);
      console.log('[WebSocket] Plan updated - refreshing plan');
    }, [planId, queryClient, getUserId]),

    onCommentAdded: useCallback(() => {
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Comment added - refreshing activity');
    }, [planId, queryClient]),

    onLogAdded: useCallback(() => {
      queryClient.invalidateQueries(['planActivity', planId]);
      console.log('[WebSocket] Log added - refreshing activity');
    }, [planId, queryClient]),
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

  // UI state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setActiveDetailTab] = useState<'details' | 'comments' | 'logs'>('details');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  
  // Decision UI state
  const [showDecisionPanel, setShowDecisionPanel] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Handle activity actions
  const handleLogAdd = useCallback((content: string, logType: string, tags?: string[]) => {
    console.log('Adding log:', content, 'Type:', logType, 'Tags:', tags);
    // The hook will handle the API call
  }, []);

  // Handle visibility change
  const handleVisibilityChange = useCallback((newVisibility: 'public' | 'private') => {
    console.log('Visibility changed to:', newVisibility);
    // Invalidate plan query to refresh the plan data
    const userId = getUserId();
    queryClient.invalidateQueries(['plan', userId, planId]);
  }, [planId, queryClient, getUserId]);

  // Scroll to top when plan loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planId]);

  // Check if this is a new user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('agent_planner_tour_completed');
    const hasSkippedTour = localStorage.getItem('agent_planner_tour_skipped');
    
    if (!hasSeenTour && !hasSkippedTour && planNodes.length === 0) {
      setShowOnboarding(true);
    }
  }, [planNodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to close node details
      if (e.key === 'Escape') {
        if (uiState.nodeDetails.isOpen) {
          closeNodeDetails();
          return;
        }
        if (showHelp) {
          setShowHelp(false);
          return;
        }
        if (isCreatingNode) {
          setIsCreatingNode(false);
          return;
        }
      }

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Help
      if (e.key === '?') {
        setShowHelp(!showHelp);
      }

      // Quick actions
      if (e.key === 'n' || e.key === 'N') {
        setIsCreatingNode(true);
      }
      if (e.key === 's' || e.key === 'S') {
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showHelp, toggleSidebar, uiState.nodeDetails.isOpen, closeNodeDetails, isCreatingNode]);


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
        else if (showSettingsModal) setShowSettingsModal(false);
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

          // Invalidate and refetch activity-related queries for the updated node
          queryClient.invalidateQueries(['nodeLogs', planId, nodeId]);
          queryClient.invalidateQueries(['nodeArtifacts', planId, nodeId]);
          queryClient.invalidateQueries(['nodeComments', planId, nodeId]);
          queryClient.invalidateQueries(['nodeAssignments', planId, nodeId]);
          queryClient.invalidateQueries(['planActivity', planId]);

          // If this node is currently selected, also invalidate its specific queries
          if (nodeId === uiState.nodeDetails.selectedNodeId) {
            // Force immediate refetch for better UX
            queryClient.refetchQueries(['nodeLogs', planId, nodeId]);
            queryClient.refetchQueries(['nodeArtifacts', planId, nodeId]);
          }

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
  if (!plan) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Plan not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The requested plan doesn't exist or you don't have access.</p>
          <Link to="/app/plans" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Enhanced Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link to="/app/plans" className="p-2 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate" title={plan.title}>
              {plan.title}
            </h1>
            
            {/* Show active viewers */}
            {planViewers.length > 0 && (
              <div className="hidden sm:block">
                <PresenceIndicator viewers={planViewers} maxVisible={3} size="sm" />
                <AgentStatusIndicator planId={planId || ''} compact />
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Visibility Toggle - hidden on mobile */}
            <div className="hidden sm:block">
              <VisibilityToggle
                planId={planId || ''}
                currentVisibility={plan.visibility || 'private'}
                isOwner={isOwner}
                onVisibilityChange={handleVisibilityChange}
              />
            </div>

            {/* GitHub Repository Badge - hidden on mobile */}
            <div className="hidden md:block">
              <GitHubRepoBadge
                planId={planId || ''}
                owner={plan.github_repo_owner}
                name={plan.github_repo_name}
                isOwner={isOwner}
                onLinked={() => {
                  const userId = getUserId();
                  queryClient.invalidateQueries(['plan', userId, planId]);
                }}
                variant="compact"
              />
            </div>

            <div data-tour="share-button">
              <ShareButton
                planId={planId || ''}
                planTitle={plan.title}
                variant="compact"
              />
            </div>

            {/* Decision Badge - shows pending decisions count */}
            <DecisionBadge
              planId={planId || ''}
              onClick={() => setShowDecisionPanel(true)}
            />

            {/* Chat button */}
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${showChat ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
              title="Plan Chat"
            >
              <MessageSquareIcon className="w-5 h-5" />
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Plan Settings"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>

            {/* WebSocket connection status indicator - hidden on mobile */}
            <div className="hidden sm:flex px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Real-time updates">
              <WebSocketStatus showDetails={false} />
            </div>

            {/* Fullscreen button - hidden on mobile (most mobile browsers don't support it well) */}
            <button
              onClick={toggleFullScreen}
              className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            
            {/* Help button - hidden on mobile (keyboard shortcuts aren't relevant) */}
            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Help (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation - shows when a node is selected */}
      {uiState.nodeDetails.selectedNodeId && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
        {/* Tree View - Takes remaining space with independent scrolling */}
        <div className="flex-1 min-w-0 overflow-hidden border-r border-gray-200 dark:border-gray-700">
          {planNodes.length === 0 && !isPlanLoading && !isNodesLoading ? (
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
              className="h-full"
            />
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
        {uiState.sidebar.isOpen && uiState.nodeDetails.isOpen && selectedNode && (
          <aside className="hidden md:flex flex-col flex-shrink-0 w-[480px] lg:w-[560px] xl:w-[640px] border-l border-gray-200 dark:border-gray-700 shadow-md overflow-hidden">
            <UnifiedNodeDetails
              node={selectedNode}
              planId={planId || ''}
              currentUser={{ id: '1', name: 'Current User', email: 'user@example.com', role: 'user' }}
              activeUsers={[]}
              onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)}
              onLogAdd={handleLogAdd}
              onActivityReact={(activityId, emoji) => console.log('React:', activityId, emoji)}
              onActivityReply={(activityId, text) => console.log('Reply:', activityId, text)}
              onClose={closeNodeDetails}
            />
          </aside>
        )}

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
                onLogAdd={handleLogAdd}
                onActivityReact={(activityId, emoji) => console.log('React:', activityId, emoji)}
                onActivityReply={(activityId, text) => console.log('Reply:', activityId, text)}
                onClose={closeNodeDetails}
              />
            </div>
          </div>
        )}
      </div>

      {/* Onboarding Tour */}
      <OnboardingTour 
        isVisible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />

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

      {/* Plan Settings Modal */}
      <PlanSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        planId={planId || ''}
        planTitle={plan.title}
      />

      {/* Chat Panel - Fixed right side overlay */}
      {showChat && (
        <div className="fixed right-0 top-14 bottom-0 z-30 shadow-xl">
          <PlanChatPanel
            planId={planId || ''}
            isOpen={showChat}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
};

export default PlanVisualizationEnhanced;
