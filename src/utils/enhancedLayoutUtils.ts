import dagre from '@dagrejs/dagre';
import { Node, Edge } from 'reactflow';

interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeSpacing?: number;
  rankSpacing?: number;
  animate?: boolean;
}

/**
 * Enhanced layout algorithm for better tree visualization
 */
export const getEnhancedTreeLayout = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
) => {
  const {
    direction = 'TB',
    nodeSpacing = 100,
    rankSpacing = 150,
    animate = true
  } = options;

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure the layout
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    ranker: 'network-simplex', // Better for complex graphs
    acyclicer: 'greedy',
    align: 'UL', // Align to upper-left for cleaner look
  });

  // Group nodes by type for better sizing
  const nodeDimensions = {
    root: { width: 320, height: 100 },
    phase: { width: 280, height: 120 },
    task: { width: 240, height: 80 },
    milestone: { width: 200, height: 60 },
    default: { width: 240, height: 80 }
  };

  // Add nodes to the graph with appropriate dimensions
  nodes.forEach((node) => {
    const nodeType = node.type || 'default';
    const dimensions = nodeDimensions[nodeType as keyof typeof nodeDimensions] || nodeDimensions.default;
    
    dagreGraph.setNode(node.id, {
      width: dimensions.width,
      height: dimensions.height,
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Perform the layout
  dagre.layout(dagreGraph);

  // Apply the computed positions back to the nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Center the node position
    const nodeType = node.type || 'default';
    const dimensions = nodeDimensions[nodeType as keyof typeof nodeDimensions] || nodeDimensions.default;
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - dimensions.width / 2,
        y: nodeWithPosition.y - dimensions.height / 2,
      },
      // Add animation class if enabled
      className: animate ? 'transition-all duration-500' : '',
    };
  });

  // Enhanced edge styling based on connection type
  const layoutedEdges = edges.map((edge) => {
    const edgeType = edge.data?.type || 'hierarchical';
    
    // Different styles for different edge types
    const edgeStyles = {
      hierarchical: {
        stroke: '#9ca3af',
        strokeWidth: 2,
        strokeDasharray: '0',
      },
      dependency: {
        stroke: '#3b82f6',
        strokeWidth: 2,
        strokeDasharray: '5,5',
      },
      reference: {
        stroke: '#10b981',
        strokeWidth: 1,
        strokeDasharray: '2,4',
      },
      sequence: {
        stroke: '#f59e0b',
        strokeWidth: 2,
        strokeDasharray: '0',
      },
    };

    const style = edgeStyles[edgeType as keyof typeof edgeStyles] || edgeStyles.hierarchical;

    return {
      ...edge,
      type: 'smoothstep', // Use smooth step edges for better appearance
      animated: edgeType === 'dependency' || edge.animated,
      style: {
        ...style,
        ...edge.style,
      },
      labelStyle: {
        fontSize: 11,
        fontWeight: 500,
        fill: '#6b7280',
      },
    };
  });

  return { nodes: layoutedNodes, edges: layoutedEdges };
};

/**
 * Calculate optimal viewport for initial view
 */
export const getOptimalViewport = (nodes: Node[]) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 };
  }

  // Find bounds of all nodes
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  nodes.forEach((node) => {
    minX = Math.min(minX, node.position.x);
    maxX = Math.max(maxX, node.position.x + 300); // Approximate width
    minY = Math.min(minY, node.position.y);
    maxY = Math.max(maxY, node.position.y + 100); // Approximate height
  });

  // Calculate center and zoom
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const width = maxX - minX;
  const height = maxY - minY;
  
  // Calculate zoom to fit (with some padding)
  const padding = 100;
  const viewportWidth = window.innerWidth - 400; // Account for sidebar
  const viewportHeight = window.innerHeight - 200; // Account for header
  
  const zoomX = viewportWidth / (width + padding);
  const zoomY = viewportHeight / (height + padding);
  const zoom = Math.min(Math.max(0.3, Math.min(zoomX, zoomY)), 1.5);

  return {
    x: viewportWidth / 2 - centerX * zoom,
    y: viewportHeight / 2 - centerY * zoom,
    zoom,
  };
};

/**
 * Group nodes by their parent for hierarchical display
 */
export const groupNodesByParent = (nodes: Node[]) => {
  const groups: { [key: string]: Node[] } = {};
  
  nodes.forEach((node) => {
    const parentId = node.data?.node?.parent_id || 'root';
    if (!groups[parentId]) {
      groups[parentId] = [];
    }
    groups[parentId].push(node);
  });
  
  return groups;
};

/**
 * Calculate node statistics for display
 */
export const calculateNodeStats = (nodes: Node[]) => {
  const stats = {
    total: nodes.length,
    byStatus: {
      completed: 0,
      in_progress: 0,
      not_started: 0,
      blocked: 0,
    },
    byType: {
      phase: 0,
      task: 0,
      milestone: 0,
      root: 0,
    },
    progress: 0,
  };

  nodes.forEach((node) => {
    const status = node.data?.node?.status || 'not_started';
    const type = node.data?.node?.node_type || node.type || 'task';
    
    if (stats.byStatus[status as keyof typeof stats.byStatus] !== undefined) {
      stats.byStatus[status as keyof typeof stats.byStatus]++;
    }
    
    if (stats.byType[type as keyof typeof stats.byType] !== undefined) {
      stats.byType[type as keyof typeof stats.byType]++;
    }
  });

  // Calculate overall progress
  if (stats.total > 0) {
    stats.progress = Math.round((stats.byStatus.completed / stats.total) * 100);
  }

  return stats;
};

/**
 * Create a mini-map configuration
 */
export const getMiniMapConfig = () => ({
  nodeStrokeColor: (node: Node) => {
    const status = node.data?.node?.status;
    if (status === 'completed') return '#10b981';
    if (status === 'in_progress') return '#3b82f6';
    if (status === 'blocked') return '#ef4444';
    return '#9ca3af';
  },
  nodeColor: (node: Node) => {
    const status = node.data?.node?.status;
    if (status === 'completed') return '#d1fae5';
    if (status === 'in_progress') return '#dbeafe';
    if (status === 'blocked') return '#fee2e2';
    return '#f3f4f6';
  },
  maskColor: 'rgba(0, 0, 0, 0.1)',
});

/**
 * Generate breadcrumb path for a node
 */
export const getNodePath = (nodeId: string, nodes: Node[]): string[] => {
  const path: string[] = [];
  let currentNode = nodes.find(n => n.id === nodeId);
  
  while (currentNode) {
    path.unshift(currentNode.data?.label || currentNode.id);
    const parentId = currentNode.data?.node?.parent_id;
    currentNode = parentId ? nodes.find(n => n.id === parentId) : undefined;
  }
  
  return path;
};
