/**
 * WebSocket Message Schema Types
 *
 * TypeScript type definitions for WebSocket messages matching the backend schema.
 * Schema Version: 1.0.0
 */

// ============================================================================
// Connection Status
// ============================================================================

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// ============================================================================
// Event Type Constants
// ============================================================================

export const CONNECTION_EVENTS = {
  CONNECTION: 'connection',
  PING: 'ping',
  PONG: 'pong',
  ERROR: 'error'
} as const;

export const PLAN_EVENTS = {
  CREATED: 'plan.created',
  UPDATED: 'plan.updated',
  DELETED: 'plan.deleted',
  STATUS_CHANGED: 'plan.status_changed'
} as const;

export const NODE_EVENTS = {
  CREATED: 'node.created',
  UPDATED: 'node.updated',
  DELETED: 'node.deleted',
  MOVED: 'node.moved',
  STATUS_CHANGED: 'node.status_changed'
} as const;

export const COLLABORATION_EVENTS = {
  USER_ASSIGNED: 'collaboration.user_assigned',
  USER_UNASSIGNED: 'collaboration.user_unassigned',
  COMMENT_ADDED: 'collaboration.comment_added',
  COMMENT_UPDATED: 'collaboration.comment_updated',
  COMMENT_DELETED: 'collaboration.comment_deleted',
  LOG_ADDED: 'collaboration.log_added',
  LABEL_ADDED: 'collaboration.label_added',
  LABEL_REMOVED: 'collaboration.label_removed'
} as const;

export const COLLABORATOR_EVENTS = {
  ADDED: 'collaborator.added',
  REMOVED: 'collaborator.removed',
  ROLE_CHANGED: 'collaborator.role_changed'
} as const;

export const PRESENCE_EVENTS = {
  USER_JOINED_PLAN: 'user_joined_plan',
  USER_LEFT_PLAN: 'user_left_plan',
  USER_JOINED_NODE: 'user_joined_node',
  USER_LEFT_NODE: 'user_left_node',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  PRESENCE_UPDATE: 'presence_update',
  ACTIVE_USERS: 'active_users',
  NODE_VIEWERS: 'node_viewers'
} as const;

export const AGENT_EVENTS = {
  REQUESTED: 'agent.requested',
  RESPONSE: 'agent.response',
  FAILED: 'agent.failed'
} as const;

export const EVENT_TYPES = {
  ...CONNECTION_EVENTS,
  ...PLAN_EVENTS,
  ...NODE_EVENTS,
  ...COLLABORATION_EVENTS,
  ...COLLABORATOR_EVENTS,
  ...PRESENCE_EVENTS,
  ...AGENT_EVENTS
} as const;

// Extract all event type values
export type EventType =
  | typeof CONNECTION_EVENTS[keyof typeof CONNECTION_EVENTS]
  | typeof PLAN_EVENTS[keyof typeof PLAN_EVENTS]
  | typeof NODE_EVENTS[keyof typeof NODE_EVENTS]
  | typeof COLLABORATION_EVENTS[keyof typeof COLLABORATION_EVENTS]
  | typeof COLLABORATOR_EVENTS[keyof typeof COLLABORATOR_EVENTS]
  | typeof PRESENCE_EVENTS[keyof typeof PRESENCE_EVENTS]
  | typeof AGENT_EVENTS[keyof typeof AGENT_EVENTS];

// ============================================================================
// Message Structure Types
// ============================================================================

export interface MessageMetadata {
  userId: string;
  userName?: string | null;
  timestamp: string;
  planId: string;
  version?: string;
}

export interface WebSocketMessage<T = any> {
  type: EventType;
  payload: T;
  metadata: MessageMetadata;
}

// ============================================================================
// Payload Types
// ============================================================================

export interface PlanPayload {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  ownerId: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface NodePayload {
  id: string;
  planId: string;
  parentId?: string | null;
  nodeType: 'root' | 'phase' | 'task' | 'milestone';
  title: string;
  description?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  orderIndex?: number;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, any>;
}

export interface NodeMovePayload {
  nodeId: string;
  oldParentId?: string;
  newParentId?: string;
  oldOrderIndex?: number;
  newOrderIndex?: number;
}

export interface StatusChangePayload {
  id: string;
  oldStatus: string;
  newStatus: string;
}

export interface AssignmentPayload {
  nodeId: string;
  userId: string;
  userName?: string;
}

export interface CommentPayload {
  id: string;
  nodeId: string;
  userId: string;
  userName?: string;
  content: string;
  commentType: 'human' | 'agent' | 'system';
  createdAt: string;
  updatedAt?: string;
}

export interface LogPayload {
  id: string;
  nodeId: string;
  userId: string;
  userName?: string;
  content: string;
  logType: 'progress' | 'reasoning' | 'challenge' | 'decision';
  tags?: string[];
  createdAt: string;
}

export interface ArtifactPayload {
  id: string;
  nodeId: string;
  name: string;
  contentType: string;
  url: string;
  createdBy: string;
  createdAt: string;
}

export interface LabelPayload {
  id: string;
  nodeId: string;
  label: string;
}

export interface CollaboratorPayload {
  id: string;
  planId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  role: 'viewer' | 'editor' | 'admin';
  oldRole?: string;
}

export interface PresencePayload {
  userId: string;
  userName?: string;
  planId?: string;
  nodeId?: string;
  status?: 'active' | 'away';
  users?: Array<{
    userId: string;
    userName: string;
    status: string;
  }>;
}

// ============================================================================
// Typed Message Types
// ============================================================================

export type PlanCreatedMessage = WebSocketMessage<PlanPayload>;
export type PlanUpdatedMessage = WebSocketMessage<PlanPayload>;
export type PlanDeletedMessage = WebSocketMessage<{ id: string }>;
export type PlanStatusChangedMessage = WebSocketMessage<StatusChangePayload>;

export type NodeCreatedMessage = WebSocketMessage<NodePayload>;
export type NodeUpdatedMessage = WebSocketMessage<NodePayload>;
export type NodeDeletedMessage = WebSocketMessage<{ id: string; planId: string }>;
export type NodeMovedMessage = WebSocketMessage<NodeMovePayload>;
export type NodeStatusChangedMessage = WebSocketMessage<StatusChangePayload>;

export type UserAssignedMessage = WebSocketMessage<AssignmentPayload>;
export type UserUnassignedMessage = WebSocketMessage<AssignmentPayload>;
export type CommentAddedMessage = WebSocketMessage<CommentPayload>;
export type CommentUpdatedMessage = WebSocketMessage<CommentPayload>;
export type CommentDeletedMessage = WebSocketMessage<{ id: string; nodeId: string }>;
export type LogAddedMessage = WebSocketMessage<LogPayload>;
export type ArtifactAddedMessage = WebSocketMessage<ArtifactPayload>;
export type ArtifactDeletedMessage = WebSocketMessage<{ id: string; nodeId: string }>;
export type LabelAddedMessage = WebSocketMessage<LabelPayload>;
export type LabelRemovedMessage = WebSocketMessage<{ id: string; nodeId: string }>;

export type CollaboratorAddedMessage = WebSocketMessage<CollaboratorPayload>;
export type CollaboratorRemovedMessage = WebSocketMessage<{ id: string; planId: string; userId: string }>;
export type CollaboratorRoleChangedMessage = WebSocketMessage<CollaboratorPayload>;

export type PresenceMessage = WebSocketMessage<PresencePayload>;

// ============================================================================
// Event Handler Types
// ============================================================================

export type EventHandler<T = any> = (message: WebSocketMessage<T>) => void;

export interface EventSubscription {
  unsubscribe: () => void;
}
