import { PlanNode, FlowNode, FlowEdge, NodeStatus, NodeType, EdgeType } from '../types';
import { Network, ListChecks, Goal, Calendar, AlertTriangle } from 'lucide-react';
import React from 'react';

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
 * Gets the appropriate icon component for a node type
 * @param nodeType Node type
 * @returns Lucide icon component or null
 */
export const getNodeTypeIcon = (nodeType: NodeType): React.FC<React.SVGProps<SVGSVGElement>> | null => {
  switch (nodeType) {
    case 'phase':
      return Network;
    case 'task':
      return ListChecks;
    case 'milestone':
      return Goal;
    case 'root':
      return ListChecks;
    default:
      return null;
  }
};

/**
 * Determines the status of a due date
 * @param dateString ISO date string (optional)
 * @returns 'overdue' | 'upcoming' | 'none'
 */
export const getDueDateStatus = (dateString: string | undefined | null): 'overdue' | 'upcoming' | 'none' => {
  if (!dateString) return 'none';
  const dueDate = new Date(dateString);
  const now = new Date();
  dueDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  if (dueDate < now) {
    return 'overdue';
  }
  const sevenDaysFromNow = new Date(now);
  sevenDaysFromNow.setDate(now.getDate() + 7);
  if (dueDate <= sevenDaysFromNow) {
    return 'upcoming';
  }

  return 'none';
};

/**
 * Gets the icon and color for due date status
 * @param status Due date status
 * @returns Object with Icon component and Tailwind color class, or null
 */
export const getDueDateIconAndColor = (status: 'overdue' | 'upcoming' | 'none'): { Icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string } | null => {
  switch (status) {
    case 'overdue':
      return { Icon: AlertTriangle, color: 'text-red-500 dark:text-red-400' };
    case 'upcoming':
      return { Icon: Calendar, color: 'text-yellow-500 dark:text-yellow-400' };
    default:
      return null;
  }
};

/**
 * Transforms plan nodes into React Flow nodes
 * @param nodes Array of plan nodes
 * @returns Array of React Flow nodes
 */
export const transformToFlowNodes = (nodes: PlanNode[]): FlowNode[] => {
  if (!nodes || !Array.isArray(nodes)) return [];
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Transforming nodes to flow format:', nodes);
  }
  
  return nodes.map((node, index) => {
    if (!node || !node.id) {
      console.warn('Invalid node found:', node);
      return null;
    }
    
    const level = node.parent_id ? 2 : 1;
    const x = 200 + (index % 3) * 300;
    const y = 100 + level * 150;
    
    const status = node.status || 'not_started';
    const nodeType = node.node_type || 'task';
    const borderColor = getNodeBorderColor(status as NodeStatus);
    const backgroundColor = getNodeBackgroundColor(status as NodeStatus);
    
    return {
      id: node.id,
      type: nodeType,
      data: {
        label: node.title || 'Untitled Node',
        node: node,
      },
      position: { x, y },
      style: {
        background: backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
      },
    };
  }).filter(Boolean) as FlowNode[];
};

/**
 * Creates React Flow edges from parent-child relationships
 * @param nodes Array of plan nodes
 * @returns Array of React Flow edges
 */
export const createFlowEdges = (nodes: PlanNode[]): FlowEdge[] => {
  if (!nodes || !Array.isArray(nodes)) return [];

  const edges: FlowEdge[] = [];
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // Process parent-child relationships (hierarchical)
  nodes.forEach(node => {
    if (node && node.id && node.parent_id) {
      const parentNode = nodeMap.get(node.parent_id);
      const targetNode = nodeMap.get(node.id);

      if (parentNode && targetNode) {
        // Determine edge type - for now, all parent-child edges are 'hierarchical'
        const edgeType: EdgeType = 'hierarchical';
        
        edges.push({
          id: `e-${node.parent_id}-${node.id}`,
          source: node.parent_id,
          target: node.id,
          animated: targetNode.status === 'in_progress',
          style: getEdgeStyleByType(edgeType),
          type: 'default', // 'default', 'straight', 'step', 'smoothstep', 'bezier'
          markerEnd: getEdgeMarkerByType(edgeType),
          data: {
            type: edgeType
          }
        });
      } else {
        console.warn(`Edge creation skipped: Parent ${node.parent_id} or Target ${node.id} not found in nodeMap`);
      }
    }
  });
  
  // Add additional edge types based on node metadata or other properties
  // This is a sample implementation - in a real app, these would be determined by actual relationships
  
  // Sample: Add dependency edges for milestone nodes (incoming dependencies)
  const milestones = nodes.filter(node => node.node_type === 'milestone');
  
  milestones.forEach(milestone => {
    // Find tasks that this milestone might depend on (this is just a sample logic)
    // In a real app, this would come from actual dependency data in the nodes
    const potentialDependencies = nodes.filter(node => 
      node.node_type === 'task' && 
      node.id !== milestone.id && 
      node.parent_id === milestone.parent_id
    );
    
    // Create a dependency edge from one sample task to the milestone
    if (potentialDependencies.length > 0) {
      const sampleTask = potentialDependencies[0];
      const edgeType: EdgeType = 'dependency';
      
      edges.push({
        id: `dep-${sampleTask.id}-${milestone.id}`,
        source: sampleTask.id,
        target: milestone.id,
        style: getEdgeStyleByType(edgeType),
        type: 'default',
        markerEnd: getEdgeMarkerByType(edgeType),
        animated: false,
        data: {
          type: edgeType
        },
        label: 'Depends On',
        labelStyle: { fill: '#ef4444', fontWeight: 500, fontSize: 10 }
      });
    }
  });
  
  // Sample: Add sequence edges between consecutive tasks
  const tasks = nodes.filter(node => node.node_type === 'task')
    .sort((a, b) => a.order_index - b.order_index);
  
  for (let i = 0; i < tasks.length - 1; i++) {
    // Only connect tasks with the same parent
    if (tasks[i].parent_id === tasks[i+1].parent_id) {
      const edgeType: EdgeType = 'sequence';
      
      edges.push({
        id: `seq-${tasks[i].id}-${tasks[i+1].id}`,
        source: tasks[i].id,
        target: tasks[i+1].id,
        style: getEdgeStyleByType(edgeType),
        type: 'default',
        markerEnd: getEdgeMarkerByType(edgeType),
        animated: false,
        data: {
          type: edgeType
        }
      });
    }
  }
  
  // Sample: Add reference edges between related nodes
  // This could be based on node content, keywords, etc.
  
  // For demonstration, add a reference edge between the first and last node
  if (nodes.length >= 2) {
    const firstNode = nodes[0];
    const lastNode = nodes[nodes.length - 1];
    
    // Only add if they're not already connected
    if (firstNode.id !== lastNode.id && 
        firstNode.parent_id !== lastNode.id && 
        lastNode.parent_id !== firstNode.id) {
      
      const edgeType: EdgeType = 'reference';
      
      edges.push({
        id: `ref-${firstNode.id}-${lastNode.id}`,
        source: firstNode.id,
        target: lastNode.id,
        style: getEdgeStyleByType(edgeType),
        type: 'default', 
        markerEnd: getEdgeMarkerByType(edgeType),
        animated: false,
        data: {
          type: edgeType
        },
        label: 'References',
        labelStyle: { fill: '#3b82f6', fontWeight: 500, fontSize: 10 }
      });
    }
  }

  return edges;
};

/**
 * Formats a date string or Date object in a user-friendly format
 * @param dateInput ISO date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (dateInput: string | Date): string => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
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

/**
 * Get edge styles for different connection types
 * @param type Edge type
 * @returns Style object for edge
 */
export const getEdgeStyleByType = (type: EdgeType): Record<string, any> => {
  switch (type) {
    case 'hierarchical':
      return { stroke: '#9ca3af', strokeWidth: 1.5 }; // Default gray
    case 'dependency':
      return { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }; // Red dashed
    case 'reference':
      return { stroke: '#3b82f6', strokeWidth: 1.5, strokeDasharray: '3,3' }; // Blue dotted
    case 'sequence':
      return { stroke: '#10b981', strokeWidth: 2 }; // Green solid
    default:
      return { stroke: '#9ca3af', strokeWidth: 1.5 };
  }
};

/**
 * Get marker end (arrow) for edge based on type
 * @param type Edge type
 * @returns Marker end definition
 */
export const getEdgeMarkerByType = (type: EdgeType): string => {
  switch (type) {
    case 'hierarchical':
      return 'arrow'; // Simple arrow
    case 'dependency':
      return 'arrowclosed'; // Filled arrow
    case 'sequence':
      return 'arrowclosed'; // Filled arrow
    case 'reference':
      return 'none'; // No arrow
    default:
      return 'arrow';
  }
};

/**
 * Get human-readable label for edge type
 * @param type Edge type
 * @returns User-friendly label
 */
export const getEdgeTypeLabel = (type: EdgeType): string => {
  switch (type) {
    case 'hierarchical':
      return 'Parent-Child';
    case 'dependency':
      return 'Depends On';
    case 'reference':
      return 'References';
    case 'sequence':
      return 'Followed By';
    default:
      return 'Connection';
  }
};
