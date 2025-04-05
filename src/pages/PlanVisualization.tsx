import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  Sidebar, 
  MessageSquare, 
  FileText,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

import { useUI } from '../contexts/UIContext';
import { usePlan } from '../hooks/usePlans';
import { useNodes, useNode } from '../hooks/useNodes';
import { formatDate, getStatusColor, getStatusLabel, getNodeTypeLabel } from '../utils/planUtils';
import { NodeType, NodeStatus } from '../types';
import { getLayoutedElements } from '../utils/layoutUtils';

// Import custom node components
import PhaseNode from '../components/nodes/PhaseNode';
import TaskNode from '../components/nodes/TaskNode';
import MilestoneNode from '../components/nodes/MilestoneNode';

// Custom node types with fallback to TaskNode for any unknown types
const nodeTypes = {
  root: TaskNode,    // Using TaskNode as a fallback for root nodes
  phase: PhaseNode,
  task: TaskNode,
  milestone: MilestoneNode,
  // Add a default node type to handle any unexpected node types
  default: TaskNode,
};

// Helper function to create localStorage key
const getStorageKey = (planId: string | undefined): string => `planLayout_${planId || 'unknown'}`;

const PlanVisualization: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state: uiState, toggleSidebar, toggleNodeDetails, openNodeDetails, closeNodeDetails } = useUI();
  
  // Fetch plan data
  const { plan, isLoading: isPlanLoading } = usePlan(planId || '');
  
  // Fetch nodes data
  const { 
    nodes: planNodes, 
    flowNodes: initialFlowNodes, 
    flowEdges, 
    isLoading: isNodesLoading,
    createNode,
    updateNodeStatus,
  } = useNodes(planId || '');

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Local state for node creation
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);

  // Fetch selected node details
  const { node: selectedNode } = useNode(
    planId || '',
    uiState.nodeDetails.selectedNodeId || ''
  );

  // Effect to load layout and apply stored positions
  useEffect(() => {
    if (initialFlowNodes && initialFlowNodes.length > 0 && planId) {
      console.log('Applying layout and stored positions...');
      const storageKey = getStorageKey(planId);
      let savedPositions: { [key: string]: { x: number; y: number } } = {};

      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          savedPositions = JSON.parse(stored);
          console.log(`Loaded ${Object.keys(savedPositions).length} positions from localStorage.`);
        }
      } catch (e) {
        console.error("Failed to parse stored positions:", e);
        savedPositions = {}; // Reset if parsing fails
      }

      // 1. Calculate initial layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        // Create a deep copy to avoid modifying the hook's return value directly
        JSON.parse(JSON.stringify(initialFlowNodes)),
        flowEdges
      );

      // 2. Apply saved positions *over* the calculated layout
      const finalNodes = layoutedNodes.map(node => {
        const savedPos = savedPositions[node.id];
        if (savedPos) {
          console.log(`Applying saved position for node ${node.id}:`, savedPos);
          return {
            ...node,
            position: savedPos, // Override with saved position
            // Ensure position is absolute for React Flow when applying stored positions
            positionAbsolute: savedPos,
          };
        }
        return node; // Keep calculated layout position
      });

      setNodes(finalNodes);
      setEdges(layoutedEdges); // Edges usually don't change position based on node drag

    } else {
      // Handle empty case
      setNodes([]);
      setEdges([]);
      console.log('No initial flow nodes to layout or no planId.');
    }
  }, [initialFlowNodes, flowEdges, setNodes, setEdges, planId]);

  // Handler for saving position when dragging stops
  const handleNodeDragStop: NodeDragHandler = useCallback((event, node) => {
    if (!planId || !node.position) return; // Need planId and position

    console.log(`Node ${node.id} drag stopped at:`, node.position);
    const storageKey = getStorageKey(planId);
    let savedPositions: { [key: string]: { x: number; y: number } } = {};

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        savedPositions = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse stored positions before saving:", e);
      savedPositions = {}; // Reset if parsing fails
    }

    // Update the position for the dragged node
    savedPositions[node.id] = node.position;

    try {
      localStorage.setItem(storageKey, JSON.stringify(savedPositions));
      console.log(`Saved position for node ${node.id} to localStorage.`);
    } catch (e) {
      console.error("Failed to save positions to localStorage:", e);
      // Handle potential storage quota errors if necessary
    }
  }, [planId]); // Recreate this function if planId changes

  // Handle node connections
  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    openNodeDetails(node.id);
  };

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen
  const toggleFullScreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle create node
  const handleCreateNode = () => {
    setIsCreatingNode(true);
  };

  // Submit new node
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
    
    updateNodeStatus.mutate({
      nodeId,
      status: newStatus,
    });
  };

  // Calculate progress
  const calculateProgress = () => {
    if (!planNodes.length) return 0;
    
    const totalNodes = planNodes.length;
    const completedNodes = planNodes.filter(node => node.status === 'completed').length;
    
    return Math.round((completedNodes / totalNodes) * 100);
  };

  // Loading state
  if (isPlanLoading || isNodesLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading plan...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!plan) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Plan not found</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">The requested plan does not exist or you don't have access to it.</p>
          <Link to="/plans" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Back to plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/plans" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">{plan.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleFullScreen}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
              >
                <Sidebar className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area with React Flow */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onNodeDragStop={handleNodeDragStop}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            fitView={true}
            fitViewOptions={{ padding: 0.2 }}
            style={{ background: '#f9fafb' }}
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            
            {/* Debug overlay when no nodes are present */}
            {nodes.length === 0 && !isPlanLoading && !isNodesLoading && (
              <Panel position="top-center" className="bg-red-50 border-2 border-red-300 rounded-lg p-6 max-w-lg text-center shadow-lg">
                <h3 className="text-lg font-bold text-red-700 mb-2">No Nodes Found</h3>
                <p className="text-sm text-red-600 mb-4">
                  This plan doesn't have any nodes yet or there was an issue loading them.
                </p>
                <div className="bg-white p-4 rounded border border-red-200 mb-4 text-left overflow-auto max-h-40">
                  <p className="text-xs font-mono">Plan ID: {planId}</p>
                  <p className="text-xs font-mono">Plan title: {plan?.title}</p>
                  <p className="text-xs font-mono">ReactFlow Nodes Count: {nodes.length}</p>
                </div>
                <button
                  onClick={handleCreateNode}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                >
                  Create First Node
                </button>
              </Panel>
            )}
            
            <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md space-y-2">
              <button 
                onClick={handleCreateNode}
                className="flex items-center justify-center w-full p-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md dark:text-blue-400 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Node
              </button>
              <button className="flex items-center justify-center w-full p-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </button>
            </Panel>
            
            {/* Node creation form */}
            {isCreatingNode && (
              <Panel position="top-center" className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-md w-96">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Node</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node Type</label>
                    <select 
                      value={newNodeType}
                      onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="phase">Phase</option>
                      <option value="task">Task</option>
                      <option value="milestone">Milestone</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Node</label>
                    <select 
                      value={newNodeParentId || ''}
                      onChange={(e) => setNewNodeParentId(e.target.value || null)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">No Parent (Root Level)</option>
                      {planNodes.map(node => (
                        <option key={node.id} value={node.id}>{node.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input 
                      type="text" 
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter node title"
                      id="new-node-title"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setIsCreatingNode(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        const titleInput = document.getElementById('new-node-title') as HTMLInputElement;
                        submitNewNode(titleInput.value);
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right sidebar for plan overview */}
        {uiState.sidebar.isOpen && (
          <div className="w-64 bg-white dark:bg-gray-800 shadow-md overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plan Overview</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</h3>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{calculateProgress()}% Complete</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      plan.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      plan.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      plan.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Nodes</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Total</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{planNodes.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {planNodes.filter(node => node.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {planNodes.filter(node => node.status === 'in_progress').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Not Started</span>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {planNodes.filter(node => node.status === 'not_started').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Blocked</span>
                      <span className="text-sm font-medium text-red-600 dark:text-red-400">
                        {planNodes.filter(node => node.status === 'blocked').length}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</h3>
                  <div className="mt-2 space-y-3">
                    {/* This would be populated with actual activity data */}
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Node status updated</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">2 hours ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">Comment added</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">4 hours ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">New node created</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Yesterday at 3:45 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Node details panel */}
        {uiState.nodeDetails.isOpen && selectedNode && (
          <div className="w-80 bg-white dark:bg-gray-800 shadow-md overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">{selectedNode.title}</h2>
                <button 
                  onClick={closeNodeDetails} 
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedNode.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedNode.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    selectedNode.status === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {getStatusLabel(selectedNode.status)}
                  </span>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {getNodeTypeLabel(selectedNode.node_type)}
                  </span>
                </div>
                
                <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <span>Created {formatDate(selectedNode.created_at)}</span>
                  <span className="mx-1">•</span>
                  <span>Updated {formatDate(selectedNode.updated_at)}</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {selectedNode.description || 'No description provided.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedNode.id, 'not_started')}
                      className={`px-2 py-1 text-xs rounded-md ${
                        selectedNode.status === 'not_started'
                          ? 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Not Started
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedNode.id, 'in_progress')}
                      className={`px-2 py-1 text-xs rounded-md ${
                        selectedNode.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedNode.id, 'completed')}
                      className={`px-2 py-1 text-xs rounded-md ${
                        selectedNode.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Completed
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedNode.id, 'blocked')}
                      className={`px-2 py-1 text-xs rounded-md ${
                        selectedNode.status === 'blocked'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Blocked
                    </button>
                  </div>
                </div>

                {selectedNode.acceptance_criteria && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Acceptance Criteria</h3>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedNode.acceptance_criteria}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Comments</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      Add Comment
                    </button>
                  </div>
                  <div className="mt-2 space-y-3">
                    {/* This would be populated with actual comments */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-xs font-medium text-gray-900 dark:text-white">
                            User
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Yesterday at 2:30 PM
                          </p>
                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            Example comment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Artifacts</h3>
                    <button className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                      Add Artifact
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {/* This would be populated with actual artifacts */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md flex items-center">
                      <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">example_file.md</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanVisualization;
