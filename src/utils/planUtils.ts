import { PlanNode, FlowNode, FlowEdge, NodeStatus, NodeType } from '../types';

/**
 * Calculates the progress percentage of a plan based on node statuses
 * @param nodes Array of plan nodes
 * @returns Progress percentage (0-100)
 */
export const calculatePlanProgress = (nodes: PlanNode[]): number => {
  if (!nodes.length) return 0;
  
  const totalNodes = nodes.length;
  const completedNodes = nodes.filter(node => node.status === 'completed').length;
  
  return Math.round((completedNodes / totalNodes) * 100);
};

/**
 * Gets the status color based on node status
 * @param status Node status
 * @returns Tailwind color class
 */
export const getStatusColor = (status: NodeStatus): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in_progress':
      return 'bg-blue-500';
    case 'blocked':
      return 'bg-red-500';
    case 'not_started':
    default:
      return 'bg-gray-400';
  }
};

/**
 * Gets the status background color for nodes
 * @param status Node status
 * @returns Background color for node
 */
export const getNodeBackgroundColor = (status: NodeStatus): string => {
  switch (status) {
    case 'completed':
      return '#f0fff4'; // Light green
    case 'in_progress':
      return '#f0f9ff'; // Light blue
    case 'blocked':
      return '#fff1f2'; // Light red
    case 'not_started':
    default:
      return '#f9fafb'; // Light gray
  }
};

/**
 * Gets the status border color for nodes
 * @param status Node status
 * @returns Border color for node
 */
export const getNodeBorderColor = (status: NodeStatus): string => {
  switch (status) {
    case 'completed':
      return '#10b981'; // Green
    case 'in_progress':
      return '#3b82f6'; // Blue
    case 'blocked':
      return '#ef4444'; // Red
    case 'not_started':
    default:
      return '#9ca3af'; // Gray
  }
};

/**
 * Transforms plan nodes into React Flow nodes
 * @param nodes Array of plan nodes
 * @returns Array of React Flow nodes
 */
export const transformToFlowNodes = (nodes: PlanNode[]): FlowNode[] => {
  // Add some debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Transforming nodes to flow format:', nodes);
  }
  
  // This is a simplified implementation
  // In a real app, you would need a proper layout algorithm
  if (!nodes || !Array.isArray(nodes)) return [];
  
  return nodes.map((node, index) => {
    if (!node || !node.id) {
      console.warn('Invalid node found:', node);
      return null;
    }
    
    // Improved positioning logic with fixed positions
    // This ensures nodes are always visible in the viewport
    const level = node.parent_id ? 2 : 1;
    const x = 200 + (index % 3) * 300;
    const y = 100 + level * 100;
    
    // Custom styling based on node type and status
    const status = node.status || 'not_started';
    const nodeType = node.node_type || 'task';
    
    const borderColor = getNodeBorderColor(status as NodeStatus);
    const backgroundColor = getNodeBackgroundColor(status as NodeStatus);
    
    return {
      id: node.id,
      type: nodeType, // Assuming we have custom node types registered
      data: {
        label: node.title || 'Untitled Node',
        node: node,
      },
      position: { x, y },
      style: {
        background: backgroundColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '4px',
        width: nodeType === 'milestone' ? 220 : 200,
      },
    };
  }).filter(Boolean) as FlowNode[]; // Filter out any null nodes
};

/**
 * Creates React Flow edges from parent-child relationships
 * @param nodes Array of plan nodes
 * @returns Array of React Flow edges
 */
export const createFlowEdges = (nodes: PlanNode[]): FlowEdge[] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  // Add debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Creating flow edges from nodes:', nodes);
  }
  
  const edges: FlowEdge[] = [];
  const nodeIds = new Set(nodes.map(node => node.id));
  
  nodes.forEach(node => {
    if (node && node.id && node.parent_id) {
      // Only create edges if both source and target nodes exist
      if (nodeIds.has(node.parent_id)) {
        edges.push({
          id: `e-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          animated: node.status === 'in_progress',
          style: { stroke: '#888', strokeWidth: 1.5 },
        });
      } else {
        console.warn(`Parent node ${node.parent_id} not found for node ${node.id}`);
      }
    }
  });
  
  return edges;
};

/**
 * Formats a date string in a user-friendly format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Generates a human-readable label for a node type
 * @param nodeType Node type
 * @returns User-friendly label
 */
export const getNodeTypeLabel = (nodeType: NodeType): string => {
  switch (nodeType) {
    case 'root':
      return 'Root';
    case 'phase':
      return 'Phase';
    case 'task':
      return 'Task';
    case 'milestone':
      return 'Milestone';
    default:
      return 'Node';
  }
};

/**
 * Generates a human-readable label for a node status
 * @param status Node status
 * @returns User-friendly label
 */
export const getStatusLabel = (status: NodeStatus): string => {
  return status.replace('_', ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
