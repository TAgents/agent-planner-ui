// Plan Types
export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type PlanVisibility = 'public' | 'private';

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: PlanStatus;
  owner_id: string;
  visibility?: PlanVisibility;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  progress?: number; // Calculated client-side
  // GitHub integration fields
  github_repo_owner?: string | null;
  github_repo_name?: string | null;
  // BDI quality assessment
  quality_score?: number | null;
  quality_assessed_at?: string | null;
  quality_rationale?: string | null;
  coherence_checked_at?: string | null;
}

// Node Types
export type NodeType = 'root' | 'phase' | 'task' | 'milestone';
export type NodeStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'plan_ready';
export type TaskMode = 'free' | 'research' | 'plan' | 'implement';
export type CoherenceStatus = 'coherent' | 'stale_beliefs' | 'contradiction_detected' | 'unchecked';

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
  metadata?: Record<string, any>;
  comment_count?: number;
  log_count?: number;
  assigned_agent_id?: string;
  assigned_agent_at?: string;
  assigned_agent_by?: string;
  task_mode?: TaskMode;
  // BDI fields
  coherence_status?: CoherenceStatus;
  quality_score?: number | null;
  quality_assessed_at?: string | null;
  quality_rationale?: string | null;
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

// Dependency Types
export type DependencyType = 'blocks' | 'requires' | 'relates_to';

export interface Dependency {
  id: string;
  source_node_id: string;
  target_node_id: string;
  dependency_type: DependencyType;
  weight: number;
  metadata?: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at?: string;
  source_title?: string;
  node_title?: string;
}

export interface CriticalPathResult {
  path: Array<{ node_id: string; title: string; status: string; node_type: string }>;
  total_weight: number;
  length: number;
}

export interface ImpactAnalysis {
  scenario: string;
  source_node_id: string;
  affected_count: number;
  direct: Array<{ node_id: string; title: string; status: string; node_type: string }>;
  transitive: Array<{ node_id: string; title: string; status: string; node_type: string; depth: number }>;
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

export interface AppSidebarState {
  isCollapsed: boolean;
}

export interface NodeDetailsState {
  isOpen: boolean;
  selectedNodeId: string | null;
}

// Decision Types
export type DecisionStatus = 'pending' | 'resolved' | 'cancelled' | 'expired';
export type DecisionUrgency = 'blocking' | 'can_continue';

export interface DecisionOption {
  id: string;
  title: string;
  description?: string;
  pros?: string[];
  cons?: string[];
  is_recommended?: boolean;
}

export interface Decision {
  id: string;
  plan_id: string;
  node_id?: string;
  title: string;
  context: string;
  options?: DecisionOption[];
  urgency: DecisionUrgency;
  status: DecisionStatus;
  decision?: string;
  rationale?: string;
  selected_option_id?: string;
  requested_by: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
  requester?: {
    id: string;
    name: string;
    email?: string;
  };
  resolver?: {
    id: string;
    name: string;
    email?: string;
  };
}
