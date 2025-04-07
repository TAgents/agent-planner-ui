// Plan Types
export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: PlanStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  progress?: number; // Calculated client-side
}

// Node Types
export type NodeType = 'root' | 'phase' | 'task' | 'milestone';
export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface PlanNode {
  id: string;
  plan_id: string;
  parent_id?: string;
  title: string;
  description?: string;
  node_type: NodeType;
  status: NodeStatus;
  order_index: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  context?: string;
  agent_instructions?: string;
  acceptance_criteria?: string;
  metadata?: Record<string, any>;
  comment_count?: number;
  log_count?: number;
  artifact_count?: number;
}

// Comment Types
export type CommentType = 'human' | 'agent' | 'system';

export interface Comment {
  id: string;
  node_id: string;
  user_id: string;
  content: string;
  comment_type: CommentType;
  created_at: string;
}

// Log Types
export interface Log {
  id: string;
  plan_node_id: string;
  user_id: string;
  content: string;
  log_type: 'progress' | 'reasoning' | 'challenge' | 'decision';
  created_at: string;
  metadata?: Record<string, any>;
  tags?: string[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Artifact Types
export interface Artifact {
  id: string;
  plan_node_id: string;
  name: string;
  content_type: string;
  url: string;
  created_at: string;
  created_by: string;
  metadata?: Record<string, any>;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Activity Types
export interface Activity {
  id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    name: string;
  };
}

// Edge Types for semantic connections
export type EdgeType = 'hierarchical' | 'dependency' | 'reference' | 'sequence';

export interface EdgeProperties {
  type: EdgeType;
  label?: string;
  description?: string;
}

// React Flow Types
export interface FlowNode {
  id: string;
  type: string;
  data: {
    label: string;
    node: PlanNode;
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
  style?: Record<string, any>;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: {
    type: EdgeType;
    label?: string;
  };
  type?: string;
  markerEnd?: string;
  labelStyle?: Record<string, any>;
  label?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'guest';
}

// API Token Types
export type TokenPermission = 'read' | 'write' | 'admin';

export interface ApiToken {
  id: string;
  name: string;
  permissions: TokenPermission[];
  created_at: string;
  last_used: string | null;
  token?: string; // Only included when first created
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// UI State Types
export interface SidebarState {
  isOpen: boolean;
  activeTab: 'overview' | 'activity' | 'search';
}

export interface NodeDetailsState {
  isOpen: boolean;
  selectedNodeId: string | null;
}
