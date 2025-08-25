import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeDragHandler,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  ArrowLeft, 
  Maximize, 
  Minimize, 
  Save, 
  Plus, 
  Filter, 
  Sidebar as SidebarIcon, 
  HelpCircle,
  Settings2,
  X,
} from 'lucide-react';

// Import new simplified components
import ViewControls, { ViewMode } from '../components/visualization/ViewControls';
import EmptyStateGuide from '../components/visualization/EmptyStateGuide';
import CompactSidebar from '../components/visualization/CompactSidebar';
import OnboardingTour from '../components/visualization/OnboardingTour';
import ShareButton from '../components/sharing/ShareButton';

// Import existing components
import { useUI } from '../contexts/UIContext';
import { usePlan } from '../hooks/usePlans';
import { useNodes, useNode } from '../hooks/useNodes';
import { usePlanActivity } from '../hooks/usePlanActivity';
import { formatDate, getStatusColor, getStatusLabel, getNodeTypeLabel } from '../utils/planUtils';
import { NodeType, NodeStatus, PlanNode } from '../types';
import { getLayoutedElements } from '../utils/layoutUtils';

// Import node components
import PhaseNode from '../components/nodes/PhaseNode';
import TaskNode from '../components/nodes/TaskNode';
import MilestoneNode from '../components/nodes/MilestoneNode';

// Import detail tabs
import NodeDetailsTab from '../components/details/NodeDetailsTab';
import NodeCommentsTab from '../components/details/NodeCommentsTab';
import NodeLogsTab from '../components/details/NodeLogsTab';
import NodeArtifactsTab from '../components/details/NodeArtifactsTab';

const nodeTypes = {
  root: TaskNode,
  phase: PhaseNode,
  task: TaskNode,
  milestone: MilestoneNode,
  default: TaskNode,
};

// Help Modal Component
const HelpModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">N</kbd> Add Node
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">S</kbd> Toggle Sidebar
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">+</kbd> Zoom In
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">-</kbd> Zoom Out
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">0</kbd> Fit View
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">?</kbd> Show Help
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PlanVisualizationSimplified: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state: uiState, toggleSidebar, openNodeDetails, closeNodeDetails } = useUI();
  
  // Data fetching
  const { plan, isLoading: isPlanLoading } = usePlan(planId || '');
  const { 
    nodes: planNodes, 
    flowNodes: initialFlowNodes, 
    flowEdges, 
    isLoading: isNodesLoading,
    createNode,
    updateNodeStatus,
    deleteNode,
  } = useNodes(planId || '');
  const { node: selectedNode, isLoading: isSelectedNodeLoading } = useNode(
    planId || '',
    uiState.nodeDetails.selectedNodeId || ''
  );
  const { activities: recentActivities, isLoading: isActivityLoading } = usePlanActivity(planId || '', 1, 5);

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Simplified view state
  const [activeView, setActiveView] = useState<ViewMode>('overview');
  const [showLabels, setShowLabels] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'comments' | 'logs' | 'artifacts'>('details');
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  
  const reactFlowInstance = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(1);

  // Check if this is a new user
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('agent_planner_tour_completed');
    const hasSkippedTour = localStorage.getItem('agent_planner_tour_skipped');
    
    if (!hasSeenTour && !hasSkippedTour && planNodes.length === 0) {
      setShowOnboarding(true);
    }
  }, [planNodes]);

  // Keyboard shortcuts - simplified
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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
      
      // Zoom
      if (e.key === '+' || e.key === '=') {
        reactFlowInstance.current?.zoomIn();
      }
      if (e.key === '-') {
        reactFlowInstance.current?.zoomOut();
      }
      if (e.key === '0') {
        reactFlowInstance.current?.fitView({ padding: 0.2 });
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showHelp, toggleSidebar]);

  // Update nodes with view state
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    
    const updatedNodes = nodes.map(node => {
      const isSelected = uiState.nodeDetails.isOpen && uiState.nodeDetails.selectedNodeId === node.id;
      
      return {
        ...node,
        selected: isSelected,
        data: {
          ...node.data,
          activeView,
          currentZoom,
          showLabels,
          showProgress,
          showDependencies,
        }
      };
    });
    
    setNodes(updatedNodes);
  }, [activeView, currentZoom, showLabels, showProgress, showDependencies, uiState.nodeDetails]);

  // Layout and positioning
  useEffect(() => {
    if (initialFlowNodes && initialFlowNodes.length > 0 && planId) {
      const storageKey = `planLayout_${planId}`;
      let savedPositions: { [key: string]: { x: number; y: number } } = {};

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          savedPositions = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Failed to parse stored positions:", e);
      }

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        JSON.parse(JSON.stringify(initialFlowNodes)),
        flowEdges
      );

      const finalNodes = layoutedNodes.map(node => {
        const savedPos = savedPositions[node.id];
        return savedPos ? { ...node, position: savedPos } : node;
      });

      setNodes(finalNodes);
      
      // Apply edge visibility based on showDependencies
      const visibleEdges = layoutedEdges.map(edge => ({
        ...edge,
        hidden: !showDependencies && edge.type !== 'hierarchical',
      }));
      setEdges(visibleEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [initialFlowNodes, flowEdges, setNodes, setEdges, planId, showDependencies]);

  // Save position on drag
  const handleNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    if (!planId || !node.position) return;
    
    const storageKey = `planLayout_${planId}`;
    let savedPositions: { [key: string]: { x: number; y: number } } = {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        savedPositions = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored positions:", e);
    }

    savedPositions[node.id] = node.position;
    localStorage.setItem(storageKey, JSON.stringify(savedPositions));
  }, [planId]);

  // Handle connections
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveDetailTab('details');
    setNodes((nodes) => nodes.map(n => ({ ...n, selected: n.id === node.id })));
    if (!uiState.sidebar.isOpen) {
      toggleSidebar();
    }
    openNodeDetails(node.id);
  }, [uiState.sidebar.isOpen, toggleSidebar, openNodeDetails, setNodes]);

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

  // Create node
  const handleCreateNode = () => {
    setIsCreatingNode(true);
  };

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

  // Handle status change
  const handleStatusChange = (nodeId: string, newStatus: NodeStatus) => {
    if (!planId) return;
    updateNodeStatus.mutate({ nodeId, status: newStatus });
  };

  // Handle node deletion
  const handleNodeDelete = (nodeId: string) => {
    if (!planId) return;
    deleteNode.mutate(nodeId, {
      onSuccess: () => closeNodeDetails()
    });
  };

  // Loading state
  if (isPlanLoading || isNodesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Plan not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The requested plan doesn't exist or you don't have access.</p>
          <Link to="/plans" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Simplified Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 h-14 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Link to="/plans" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">
              {plan.title}
            </h1>
          </div>

          {/* Center section - View Controls */}
          <div data-tour="view-controls">
            <ViewControls
              activeView={activeView}
              onViewChange={setActiveView}
              showLabels={showLabels}
              showProgress={showProgress}
              showDependencies={showDependencies}
              onToggleLabels={() => setShowLabels(!showLabels)}
              onToggleProgress={() => setShowProgress(!showProgress)}
              onToggleDependencies={() => setShowDependencies(!showDependencies)}
            />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <div data-tour="share-button">
              <ShareButton 
                planId={planId || ''}
                planTitle={plan.title}
                variant="compact"
              />
            </div>
            
            <button 
              onClick={toggleFullScreen}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            
            <button 
              onClick={() => setShowHelp(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Help (?)"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            
            <button 
              onClick={toggleSidebar}
              className={`p-2 rounded-lg transition-colors ${
                uiState.sidebar.isOpen 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Toggle Sidebar (S)"
            >
              <SidebarIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          {/* Show empty state if no nodes */}
          {nodes.length === 0 && !isPlanLoading && !isNodesLoading ? (
            <EmptyStateGuide 
              planTitle={plan.title}
              onCreateFirstNode={handleCreateNode}
            />
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              onNodeDragStop={handleNodeDragStop}
              onInit={(instance) => {
                reactFlowInstance.current = instance;
              }}
              onMove={(event, viewport) => {
                if (viewport.zoom !== currentZoom) {
                  setCurrentZoom(viewport.zoom);
                }
              }}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.1}
              maxZoom={2}
              fitView={true}
              fitViewOptions={{ padding: 0.2 }}
              style={{ background: '#f9fafb' }}
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap 
                nodeStrokeColor={(n) => {
                  if (n.selected) return '#3b82f6';
                  return '#e5e7eb';
                }}
                nodeColor={(n) => {
                  if (n.selected) return '#dbeafe';
                  return '#ffffff';
                }}
                pannable
                zoomable
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
              
              {/* Simplified Add Node Button */}
              <Panel position="top-right" className="space-y-2">
                <button 
                  onClick={handleCreateNode}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
                  data-tour="add-node"
                >
                  <Plus className="w-4 h-4" />
                  Add Node
                </button>
              </Panel>
              
              {/* Node creation form */}
              {isCreatingNode && (
                <Panel position="top-center" className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96">
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
                </Panel>
              )}
            </ReactFlow>
          )}
        </div>

        {/* Sidebar */}
        {uiState.sidebar.isOpen && (
          <>
            {uiState.nodeDetails.isOpen && selectedNode ? (
              // Node Details Panel
              <aside className="w-96 bg-white dark:bg-gray-800 shadow-md overflow-y-auto border-l border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {selectedNode.title}
                    </h2>
                    <button
                      onClick={closeNodeDetails}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Status and Type */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedNode.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedNode.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      selectedNode.status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusLabel(selectedNode.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {getNodeTypeLabel(selectedNode.node_type)}
                    </span>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                    {(['details', 'comments', 'logs', 'artifacts'] as const).map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setActiveDetailTab(tab)} 
                        className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                          activeDetailTab === tab 
                            ? 'border-b-2 border-blue-500 text-blue-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div>
                    {activeDetailTab === 'details' && (
                      <NodeDetailsTab 
                        node={selectedNode} 
                        onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)} 
                        onDelete={() => handleNodeDelete(selectedNode.id)} 
                      />
                    )}
                    {activeDetailTab === 'comments' && <NodeCommentsTab planId={planId!} nodeId={selectedNode.id} />}
                    {activeDetailTab === 'logs' && <NodeLogsTab planId={planId!} nodeId={selectedNode.id} />}
                    {activeDetailTab === 'artifacts' && <NodeArtifactsTab planId={planId!} nodeId={selectedNode.id} />}
                  </div>
                </div>
              </aside>
            ) : (
              // Compact Sidebar for Plan Overview
              <CompactSidebar
                plan={plan}
                nodes={planNodes}
                activities={recentActivities}
                isActivityLoading={isActivityLoading}
                onClose={toggleSidebar}
              />
            )}
          </>
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
    </div>
  );
};

export default PlanVisualizationSimplified;
