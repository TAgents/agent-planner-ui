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

// Activity Types
export interface Activity {
  id: string;
  type: string;
  user_id: string;
  plan_id?: string;
  node_id?: string;
  timestamp: string;
  details?: string;
  metadata?: Record<string, any>;
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
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'guest';
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
