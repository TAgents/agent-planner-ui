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
  Sidebar, 
  MessageSquare, 
  FileText,
  ChevronRight,
  MoreHorizontal,
  Eye,
  BarChart3,
  Calendar,
  Users,
  AlertCircle,
  Tag,
  GitBranch,
  Keyboard,
  Share2,
} from 'lucide-react';
import ShareButton from '../components/sharing/ShareButton';

import { useUI } from '../contexts/UIContext';
import { usePlan } from '../hooks/usePlans';
import { useNodes, useNode } from '../hooks/useNodes';
import { usePlanActivity } from '../hooks/usePlanActivity';
import { formatDate, getStatusColor, getStatusLabel, getNodeTypeLabel, getEdgeStyleByType, getEdgeTypeLabel } from '../utils/planUtils';
import { NodeType, NodeStatus, Activity, EdgeType } from '../types';
import { getLayoutedElements } from '../utils/layoutUtils';

// Import custom node components
import PhaseNode from '../components/nodes/PhaseNode';
import TaskNode from '../components/nodes/TaskNode';
import MilestoneNode from '../components/nodes/MilestoneNode';

// Import placeholder/actual Tab components
import NodeDetailsTab from '../components/details/NodeDetailsTab';
import NodeCommentsTab from '../components/details/NodeCommentsTab';
import NodeLogsTab from '../components/details/NodeLogsTab';
import NodeArtifactsTab from '../components/details/NodeArtifactsTab';

// Custom node types with fallback to TaskNode for any unknown types
const nodeTypes = {
  root: TaskNode,    // Using TaskNode as a fallback for root nodes
  phase: PhaseNode,
  task: TaskNode,
  milestone: MilestoneNode,
  // Add a default node type to handle any unexpected node types
  default: TaskNode,
};

// Connection legend component
interface ConnectionLegendProps {
  show: boolean;
}

const ConnectionLegend: React.FC<ConnectionLegendProps> = ({ show }) => {
  if (!show) return null;
  
  // Define all edge types to display in the legend
  const edgeTypes: EdgeType[] = ['hierarchical', 'dependency', 'reference', 'sequence'];
  
  return (
    <Panel position="bottom-left" className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm max-w-xs z-10">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection Types</h3>
      <div className="space-y-2">
        {edgeTypes.map(type => {
          const style = getEdgeStyleByType(type);
          return (
            <div key={type} className="flex items-center">
              <div className="w-12 flex-shrink-0">
                <div
                  className="h-0.5 w-full" 
                  style={{
                    backgroundColor: style.stroke,
                    height: `${Math.max(1, (style.strokeWidth as number || 1) / 2)}px`,
                    borderBottom: style.strokeDasharray ? `1px ${style.strokeDasharray}` : 'none'
                  }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                {getEdgeTypeLabel(type)}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};

// Helper function to create localStorage key
const getStorageKey = (planId: string | undefined): string => `planLayout_${planId || 'unknown'}`;

// Enable debug mode for diagnosing UI rendering issues
const DEBUG_MODE = false;

// Set global debug flag for hooks to use
if (typeof window !== 'undefined') {
  window.DEBUG_ENABLED = DEBUG_MODE;
}

const PlanVisualization: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const { state: uiState, toggleSidebar: origToggleSidebar, toggleNodeDetails, openNodeDetails, closeNodeDetails: origCloseNodeDetails } = useUI();
  
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
    deleteNode,
  } = useNodes(planId || '');

  // Fetch selected node details
  const { node: selectedNode, isLoading: isSelectedNodeLoading } = useNode(
    planId || '',
    uiState.nodeDetails.selectedNodeId || ''
  );

  // Fetch Plan Activity for the Overview sidebar
  const { activities: recentActivities, isLoading: isActivityLoading } = usePlanActivity(planId || '', 1, 5); // Fetch latest 5

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Create wrapped versions of the UI context functions that also update node selection
  const toggleSidebar = useCallback(() => {
    origToggleSidebar();
    // If closing the sidebar, deselect all nodes
    if (uiState.sidebar.isOpen) {
      // We're toggling from open to closed
      setNodes((nodes) => nodes.map(node => ({ ...node, selected: false })));
    }
  }, [origToggleSidebar, uiState.sidebar.isOpen, setNodes]);
  
  const closeNodeDetails = useCallback(() => {
    origCloseNodeDetails();
    // Deselect all nodes when closing details
    setNodes((nodes) => nodes.map(node => ({ ...node, selected: false })));
  }, [origCloseNodeDetails, setNodes]);
  
  // State for Node Details Tabs
  const [activeDetailTab, setActiveDetailTab] = useState<'details' | 'comments' | 'logs' | 'artifacts'>('details');

  // State for connection legend visibility
  const [showConnectionLegend, setShowConnectionLegend] = useState<boolean>(true);
  
  // Information Layers state
  const [activeLayer, setActiveLayer] = useState<'overview' | 'progress' | 'timeline' | 'resources' | 'risks'>('overview');
  const [showLabels, setShowLabels] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const reactFlowInstance = useRef<any>(null);
  const [currentZoom, setCurrentZoom] = useState(1);
  
  // Layer definitions
  const layers = [
    { id: 'overview', label: 'Overview', icon: Eye, description: 'Basic node structure and status' },
    { id: 'progress', label: 'Progress', icon: BarChart3, description: 'Completion status and metrics' },
    { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Dates and deadlines' },
    { id: 'resources', label: 'Resources', icon: Users, description: 'Assignments and workload' },
    { id: 'risks', label: 'Risks', icon: AlertCircle, description: 'Blockers and issues' },
  ];

  // Local state for node creation
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [newNodeType, setNewNodeType] = useState<NodeType>('task');
  const [newNodeParentId, setNewNodeParentId] = useState<string | null>(null);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

  // Logging effect for component re-renders - ONLY in DEBUG_MODE
  useEffect(() => {
    if (DEBUG_MODE) {
      console.log('--- PlanVisualization Re-render ---');
      console.log('Sidebar State:', uiState.sidebar);
      console.log('Node Details State:', uiState.nodeDetails);
      console.log('Selected Node Data:', selectedNode);
      console.log('Is Selected Node Loading:', isSelectedNodeLoading);
      
      // Explicitly check conditions for displaying node details
      console.log('Should show node details?', 
        uiState.sidebar.isOpen && 
        uiState.nodeDetails.isOpen && 
        uiState.nodeDetails.selectedNodeId && 
        selectedNode !== null
      );
    }
  }, [uiState.sidebar, uiState.nodeDetails, selectedNode, isSelectedNodeLoading]);

  // Logging effect for sidebar state - ONLY in DEBUG_MODE
  useEffect(() => {
    if (DEBUG_MODE) {
      if (uiState.sidebar.isOpen) {
        console.log(`Rendering Sidebar. Node Selected: ${!!(uiState.nodeDetails.isOpen && selectedNode)}`);
      } else {
        console.log('Sidebar is closed.');
      }
    }
  }, [uiState.sidebar.isOpen, uiState.nodeDetails.isOpen, selectedNode]);

  // Logging effect for node details panel - ONLY in DEBUG_MODE
  useEffect(() => {
    if (DEBUG_MODE) {
      if (uiState.nodeDetails.isOpen && selectedNode) {
        console.log(`RENDERING NODE DETAILS PANEL for node: ${selectedNode.id}`);
      }
    }
  }, [uiState.nodeDetails.isOpen, selectedNode]);
  
  // Force sidebar open when node details are open
  useEffect(() => {
    if (uiState.nodeDetails.isOpen && !uiState.sidebar.isOpen) {
      console.log('Node details are open but sidebar is closed - forcing sidebar open');
      // Use the toggleSidebar function instead of setSidebarOpen which doesn't exist
      toggleSidebar();
    }
  }, [uiState.nodeDetails.isOpen, uiState.sidebar.isOpen, toggleSidebar]);
  
  // Force node details to close if selected node is not found
  useEffect(() => {
    if (uiState.nodeDetails.isOpen && uiState.nodeDetails.selectedNodeId && 
        !isSelectedNodeLoading && !selectedNode) {
      console.log('Selected node not found - closing node details panel');
      closeNodeDetails();
    }
  }, [uiState.nodeDetails.isOpen, uiState.nodeDetails.selectedNodeId, isSelectedNodeLoading, selectedNode, closeNodeDetails]);

  // Logging effect for plan overview panel - ONLY in DEBUG_MODE
  useEffect(() => {
    if (DEBUG_MODE) {
      if (uiState.sidebar.isOpen && !uiState.nodeDetails.isOpen) {
        console.log('RENDERING PLAN OVERVIEW PANEL');
      }
    }
  }, [uiState.sidebar.isOpen, uiState.nodeDetails.isOpen]);
  
  // Keyboard shortcuts for layer switching
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Layer shortcuts (1-5)
      if (e.key >= '1' && e.key <= '5') {
        const layerIndex = parseInt(e.key) - 1;
        if (layers[layerIndex]) {
          setActiveLayer(layers[layerIndex].id as any);
        }
      }
      
      // Toggle shortcuts
      if (e.key === 'l' || e.key === 'L') {
        setShowLabels(!showLabels);
      }
      if (e.key === 'p' || e.key === 'P') {
        setShowProgress(!showProgress);
      }
      if (e.key === 'd' || e.key === 'D') {
        setShowDependencies(!showDependencies);
      }
      
      // Zoom shortcuts
      if (e.key === '+' || e.key === '=') {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.zoomIn();
        }
      }
      if (e.key === '-' || e.key === '_') {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.zoomOut();
        }
      }
      if (e.key === '0') {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ padding: 0.2 });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLabels, showProgress, showDependencies, layers]);
  
  // Effect to update node styles when a node is selected or deselected
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;
    
    const updatedNodes = nodes.map(node => {
      // Check if this node is the selected one
      const isSelected = uiState.nodeDetails.isOpen && 
                        uiState.nodeDetails.selectedNodeId === node.id;
      
      // Apply a highlight style to the selected node
      return {
        ...node,
        selected: isSelected, // This will trigger the ReactFlow built-in selection styling
        className: isSelected ? 'selected-node' : '',
        style: {
          ...node.style,
          // Add a glow effect and border to the selected node
          boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.7)' : undefined,
          borderWidth: isSelected ? '2px' : undefined,
          borderColor: isSelected ? '#3b82f6' : undefined,
          borderStyle: isSelected ? 'solid' : undefined,
          zIndex: isSelected ? 1000 : undefined, // Bring selected node to front
        },
        // Pass layer and view information to nodes
        data: {
          ...node.data,
          activeLayer,
          currentZoom,
          showLabels,
          showProgress,
          showDependencies,
        }
      };
    });
    
    setNodes(updatedNodes);
  }, [nodes, setNodes, uiState.nodeDetails.isOpen, uiState.nodeDetails.selectedNodeId, activeLayer, currentZoom, showLabels, showProgress]);
  
  // Effect to handle edge visibility based on showDependencies
  useEffect(() => {
    setEdges((edges) => 
      edges.map(edge => ({
        ...edge,
        hidden: !showDependencies && edge.type !== 'hierarchical',
        style: {
          ...edge.style,
          opacity: showDependencies ? 1 : (edge.type === 'hierarchical' ? 0.5 : 0),
        }
      }))
    );
  }, [showDependencies, setEdges]);
  
  // Add a pulsing animation style for selected nodes
  useEffect(() => {
    // Create a style element if it doesn't exist
    let styleElement = document.getElementById('node-selection-animation');
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'node-selection-animation';
      document.head.appendChild(styleElement);
    }
    
    // Define the animation
    styleElement.textContent = `
      @keyframes pulse-border {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
      .selected-node {
        animation: pulse-border 2s infinite;
      }
    `;
    
    // Cleanup
    return () => {
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

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
      
      // Apply edge visibility based on showDependencies
      const visibleEdges = layoutedEdges.map(edge => ({
        ...edge,
        hidden: !showDependencies && edge.type !== 'hierarchical', // Hide non-hierarchical edges when dependencies are off
      }));
      setEdges(visibleEdges);

    } else {
      // Handle empty case
      setNodes([]);
      setEdges([]);
      console.log('No initial flow nodes to layout or no planId.');
    }
  }, [initialFlowNodes, flowEdges, setNodes, setEdges, planId, showDependencies]);

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
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node.id);
    setActiveDetailTab('details'); // Reset to details tab on new selection
    
    // Update UI to mark this node as selected
    const updatedNodes = nodes.map(n => ({
      ...n,
      selected: n.id === node.id,
    }));
    setNodes(updatedNodes);
    
    // Ensure sidebar is open when selecting a node
    if (!uiState.sidebar.isOpen) {
      toggleSidebar();
    }
    
    // Open node details with the selected node ID
    openNodeDetails(node.id);
    
    console.log('After openNodeDetails - UI state:', {
      sidebarOpen: uiState.sidebar.isOpen,
      nodeDetailsOpen: uiState.nodeDetails.isOpen,
      selectedNodeId: uiState.nodeDetails.selectedNodeId
    });
  }, [uiState.sidebar.isOpen, toggleSidebar, openNodeDetails, setActiveDetailTab, nodes, setNodes]);

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

  // Handle node deletion
  const handleNodeDelete = (nodeId: string) => {
    if (!planId) return;
    
    deleteNode.mutate(nodeId, {
      onSuccess: () => {
        // Close the node details panel after successful deletion
        closeNodeDetails();
      }
    });
  };

  // Calculate progress
  const progress = useMemo(() => { // Memoize calculation
    if (!planNodes || !planNodes.length) return 0;
    const totalNodes = planNodes.length;
    const completedNodes = planNodes.filter(node => node.status === 'completed').length;
    return Math.round((completedNodes / totalNodes) * 100);
  }, [planNodes]); // Recalculate only when planNodes change

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
      <header className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-md z-10 border-b border-blue-100 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/plans" className="text-gray-600 hover:text-blue-700 dark:text-gray-300 dark:hover:text-blue-400 bg-white dark:bg-gray-700 p-2 rounded-lg shadow-sm transition duration-200 border border-gray-200 dark:border-gray-600">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="ml-4 flex items-center">
                <span className="h-8 w-8 flex items-center justify-center bg-blue-500 text-white rounded-lg shadow-sm mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white"><span className="text-blue-600 dark:text-blue-400">Plan:</span> {plan.title}</h1>
              </div>
            </div>
            
            {/* Layer Controls */}
            <div className="flex items-center gap-4">
              {/* Layer selector */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {layers.map((layer) => (
                  <button
                    key={layer.id}
                    onClick={() => setActiveLayer(layer.id as any)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                      ${activeLayer === layer.id ? 
                        'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' : 
                        'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                      }
                    `}
                    title={layer.description}
                  >
                    <layer.icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{layer.label}</span>
                  </button>
                ))}
              </div>

              {/* View toggles */}
              <div className="flex items-center gap-1 border-l pl-3 border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowLabels(!showLabels)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showLabels ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle labels (L)"
                >
                  <Tag className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowProgress(!showProgress)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showProgress ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle progress bars (P)"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDependencies(!showDependencies)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showDependencies ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title="Toggle dependencies (D)"
                >
                  <GitBranch className="w-4 h-4" />
                </button>
                
                {/* Keyboard shortcuts help */}
                <div className="relative ml-2">
                  <button
                    onMouseEnter={() => setShowKeyboardHelp(true)}
                    onMouseLeave={() => setShowKeyboardHelp(false)}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Keyboard shortcuts"
                  >
                    <Keyboard className="w-4 h-4" />
                  </button>
                  
                  {showKeyboardHelp && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
                      <h4 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">Keyboard Shortcuts</h4>
                      <div className="space-y-2 text-xs">
                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Layers:</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">1</kbd> Overview</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">2</kbd> Progress</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">3</kbd> Timeline</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">4</kbd> Resources</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">5</kbd> Risks</div>
                        </div>
                        
                        <div className="font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">Toggles:</div>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">L</kbd> Toggle labels</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">P</kbd> Toggle progress</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">D</kbd> Toggle dependencies</div>
                        </div>
                        
                        <div className="font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">Zoom:</div>
                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">+</kbd> Zoom in</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">-</kbd> Zoom out</div>
                          <div><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">0</kbd> Fit to view</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ShareButton 
                planId={planId || ''}
                planTitle={plan.title}
                variant="compact"
              />
              <button 
                onClick={toggleFullScreen}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600 transition duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setShowConnectionLegend(!showConnectionLegend)}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600 transition duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
                title="Toggle connection legend"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-600 hover:text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600 transition duration-200 shadow-sm border border-gray-200 dark:border-gray-600">
                <Save className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-600 transition duration-200 shadow-sm border border-gray-200 dark:border-gray-600"
                title="Toggle Sidebar"
                data-testid="sidebar-toggle"
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
            data-testid="react-flow-canvas"
            /* Set selected nodes based on sidebar selection */
            selectNodesOnDrag={false} /* Disable default drag selection behavior */
            nodesFocusable={true}
            /* Customize the selected state based on the selected node ID */
            defaultEdgeOptions={{ focusable: false }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            
            {/* Connection Legend */}
            <ConnectionLegend show={showConnectionLegend} />
            
            {/* Layer Information Panel */}
            <Panel position="bottom-left" className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm max-w-xs" style={{ bottom: showConnectionLegend ? '160px' : '20px' }}>
              <div className="flex items-center gap-2 mb-2">
                {(() => {
                  const activeLayerData = layers.find(l => l.id === activeLayer);
                  if (!activeLayerData) return null;
                  const IconComponent = activeLayerData.icon;
                  return (
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded">
                      <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  );
                })()}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {layers.find(l => l.id === activeLayer)?.label} View
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {layers.find(l => l.id === activeLayer)?.description}
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Zoom:</span>
                  <span>{Math.round(currentZoom * 100)}%</span>
                  {currentZoom < 0.5 && <span className="text-orange-600">(Minimal)</span>}
                  {currentZoom >= 0.5 && currentZoom < 0.8 && <span className="text-blue-600">(Compact)</span>}
                  {currentZoom >= 0.8 && <span className="text-green-600">(Detailed)</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-medium">Active toggles:</span>
                  <div className="flex gap-1">
                    {showLabels && <Tag className="w-3 h-3 text-blue-600" />}
                    {showProgress && <BarChart3 className="w-3 h-3 text-blue-600" />}
                    {showDependencies && <GitBranch className="w-3 h-3 text-blue-600" />}
                  </div>
                </div>
              </div>
            </Panel>
            
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
            
            <Panel position="top-right" className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 space-y-2">
              <button 
                onClick={handleCreateNode}
                className="flex items-center justify-center w-full p-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 dark:border-blue-800 dark:text-blue-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-200"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Node
              </button>
              <button className="flex items-center justify-center w-full p-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 dark:border-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition duration-200">
                <Filter className="w-4 h-4 mr-1" />
                Filter
              </button>
            </Panel>
            
            {/* Node creation form */}
            {isCreatingNode && (
              <Panel position="top-center" className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-96">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create New Node</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Node Type</label>
                    <select 
                      value={newNodeType}
                      onChange={(e) => setNewNodeType(e.target.value as NodeType)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter node title"
                      id="new-node-title"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => setIsCreatingNode(false)}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        const titleInput = document.getElementById('new-node-title') as HTMLInputElement;
                        submitNewNode(titleInput.value);
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>

        {/* Right sidebar for plan overview or node details */}
        {uiState.sidebar.isOpen && (
          <aside className="w-80 bg-white dark:bg-gray-800 shadow-md overflow-y-auto border-l border-gray-200 dark:border-gray-700 flex-shrink-0 rounded-tl-lg" data-sidebar="true">
            {uiState.nodeDetails.isOpen && uiState.nodeDetails.selectedNodeId ? (
              <div className="p-4" data-node-details="true" key={`node-details-${uiState.nodeDetails.selectedNodeId}`}>
                {isSelectedNodeLoading ? (
                  <div className="text-center p-4">
                    <div className="spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto shadow"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading node details...</p>
                  </div>
                ) : selectedNode ? (
                  <>
                    {/* Header with Close Button */}
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate" title={selectedNode.title}>
                        {selectedNode.title}
                      </h2>
                      <button
                        onClick={closeNodeDetails}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition duration-200"
                        title="Close Details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Basic Info (Status, Type) - Shown above tabs */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shadow-sm ${
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

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                      <button 
                        onClick={() => setActiveDetailTab('details')} 
                        className={`px-4 py-2.5 text-sm font-medium transition duration-200 ${
                          activeDetailTab === 'details' 
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('comments')} 
                        className={`px-4 py-2.5 text-sm font-medium transition duration-200 ${
                          activeDetailTab === 'comments' 
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Comments
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('logs')} 
                        className={`px-4 py-2.5 text-sm font-medium transition duration-200 ${
                          activeDetailTab === 'logs' 
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Logs
                      </button>
                      <button 
                        onClick={() => setActiveDetailTab('artifacts')} 
                        className={`px-4 py-2.5 text-sm font-medium transition duration-200 ${
                          activeDetailTab === 'artifacts' 
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                        }`}
                      >
                        Artifacts
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div>
                      {activeDetailTab === 'details' && <NodeDetailsTab node={selectedNode} onStatusChange={(newStatus) => handleStatusChange(selectedNode.id, newStatus)} onDelete={() => handleNodeDelete(selectedNode.id)} />}
                      {activeDetailTab === 'comments' && <NodeCommentsTab planId={planId!} nodeId={selectedNode.id} />}
                      {activeDetailTab === 'logs' && <NodeLogsTab planId={planId!} nodeId={selectedNode.id} />}
                      {activeDetailTab === 'artifacts' && <NodeArtifactsTab planId={planId!} nodeId={selectedNode.id} />}
                    </div>
                  </>
                ) : (
                  // Properly handle node not found case without setTimeout
                  <div className="text-center p-4">
                    <div className="spinner w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Node not found, returning to overview...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4" data-overview="true">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Plan Overview</h2>
                {isPlanLoading ? (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm flex items-center justify-center">
                    <div className="spinner w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3 shadow"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading overview...</p>
                  </div>
                ) : plan ? (
                  <div className="space-y-6">
                    {/* Progress */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Progress</h3>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 shadow-inner">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{progress}% Complete</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                      <div className="mt-2">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${
                          plan.status === 'active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          plan.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          plan.status === 'draft' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {getStatusLabel(plan.status)}
                        </span>
                      </div>
                    </div>

                    {/* Node Counts */}
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

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</h3>
                      {isActivityLoading ? (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading activity...</div>
                      ) : recentActivities.length > 0 ? (
                        <ul className="mt-2 space-y-3">
                          {recentActivities.map((activity: Activity) => (
                            <li key={activity.id} className="text-sm border border-gray-100 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 last:border-b-0 shadow-sm">
                              <p className="text-gray-900 dark:text-white font-medium truncate" title={activity.content || `Activity ${activity.id}`}>
                                {activity.content || `Activity ${activity.id}`}
                              </p>
                              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                                <span>{activity.user?.name || 'System/Unknown'}</span>
                                <span>{formatDate(activity.created_at)}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">No recent activity found.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>Error loading plan overview.</div>
                )}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default PlanVisualization;
