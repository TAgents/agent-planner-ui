/**
 * Custom hooks for WebSocket functionality
 *
 * These hooks provide convenient ways to subscribe to WebSocket events
 * with automatic cleanup and TypeScript support.
 */

import { useEffect, useCallback } from 'react';
import { useWebSocket as useWebSocketContext } from '../contexts/WebSocketContext';
import {
  EventType,
  EventHandler,
  WebSocketMessage,
  PLAN_EVENTS,
  NODE_EVENTS,
  COLLABORATION_EVENTS,
  COLLABORATOR_EVENTS,
  PRESENCE_EVENTS
} from '../types/websocket';

/**
 * Re-export the context hook for convenience
 */
export { useWebSocketContext as useWebSocket };

/**
 * Hook to subscribe to a specific WebSocket event
 * Automatically handles cleanup when component unmounts
 *
 * @example
 * ```tsx
 * useWebSocketEvent('node.created', (message) => {
 *   console.log('Node created:', message.payload);
 * });
 * ```
 */
export function useWebSocketEvent<T = any>(
  eventType: EventType,
  handler: EventHandler<T>,
  dependencies: any[] = []
) {
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handler);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, subscribe, ...dependencies]);
}

/**
 * Hook to subscribe to multiple WebSocket events at once
 *
 * @example
 * ```tsx
 * useWebSocketEvents({
 *   'node.created': (message) => console.log('Created:', message.payload),
 *   'node.updated': (message) => console.log('Updated:', message.payload),
 *   'node.deleted': (message) => console.log('Deleted:', message.payload)
 * });
 * ```
 */
export function useWebSocketEvents(
  handlers: Record<EventType, EventHandler>,
  dependencies: any[] = []
) {
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    const unsubscribers = Object.entries(handlers).map(([eventType, handler]) =>
      subscribe(eventType as EventType, handler)
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, ...dependencies]);
}

/**
 * Hook to subscribe to all plan-related events for a specific plan
 *
 * @example
 * ```tsx
 * usePlanEvents(planId, {
 *   onPlanUpdated: (message) => console.log('Plan updated'),
 *   onNodeCreated: (message) => console.log('Node created'),
 *   onNodeUpdated: (message) => console.log('Node updated')
 * });
 * ```
 */
export function usePlanEvents(
  planId: string | null,
  handlers: {
    onPlanUpdated?: (message: WebSocketMessage) => void;
    onPlanDeleted?: (message: WebSocketMessage) => void;
    onPlanStatusChanged?: (message: WebSocketMessage) => void;
    onNodeCreated?: (message: WebSocketMessage) => void;
    onNodeUpdated?: (message: WebSocketMessage) => void;
    onNodeDeleted?: (message: WebSocketMessage) => void;
    onNodeMoved?: (message: WebSocketMessage) => void;
    onNodeStatusChanged?: (message: WebSocketMessage) => void;
    onCommentAdded?: (message: WebSocketMessage) => void;
    onLogAdded?: (message: WebSocketMessage) => void;
    onCollaboratorAdded?: (message: WebSocketMessage) => void;
    onUserAssigned?: (message: WebSocketMessage) => void;
  }
) {
  const { subscribe, send } = useWebSocketContext();

  useEffect(() => {
    if (!planId) return;

    // Join the plan room
    console.log('[usePlanEvents] Joining plan room:', planId);
    send({ type: 'join_plan', planId });

    const unsubscribers: Array<() => void> = [];

    // Helper to create filtered handler
    const createFilteredHandler = (handler: (message: WebSocketMessage) => void) => {
      return (message: WebSocketMessage) => {
        // Only call handler if message is for this plan
        if (message.metadata.planId === planId) {
          handler(message);
        }
      };
    };

    // Subscribe to plan events
    if (handlers.onPlanUpdated) {
      unsubscribers.push(
        subscribe(PLAN_EVENTS.UPDATED, createFilteredHandler(handlers.onPlanUpdated))
      );
    }
    if (handlers.onPlanDeleted) {
      unsubscribers.push(
        subscribe(PLAN_EVENTS.DELETED, createFilteredHandler(handlers.onPlanDeleted))
      );
    }
    if (handlers.onPlanStatusChanged) {
      unsubscribers.push(
        subscribe(PLAN_EVENTS.STATUS_CHANGED, createFilteredHandler(handlers.onPlanStatusChanged))
      );
    }

    // Subscribe to node events
    if (handlers.onNodeCreated) {
      unsubscribers.push(
        subscribe(NODE_EVENTS.CREATED, createFilteredHandler(handlers.onNodeCreated))
      );
    }
    if (handlers.onNodeUpdated) {
      unsubscribers.push(
        subscribe(NODE_EVENTS.UPDATED, createFilteredHandler(handlers.onNodeUpdated))
      );
    }
    if (handlers.onNodeDeleted) {
      unsubscribers.push(
        subscribe(NODE_EVENTS.DELETED, createFilteredHandler(handlers.onNodeDeleted))
      );
    }
    if (handlers.onNodeMoved) {
      unsubscribers.push(
        subscribe(NODE_EVENTS.MOVED, createFilteredHandler(handlers.onNodeMoved))
      );
    }
    if (handlers.onNodeStatusChanged) {
      unsubscribers.push(
        subscribe(NODE_EVENTS.STATUS_CHANGED, createFilteredHandler(handlers.onNodeStatusChanged))
      );
    }

    // Subscribe to collaboration events
    if (handlers.onCommentAdded) {
      unsubscribers.push(
        subscribe(COLLABORATION_EVENTS.COMMENT_ADDED, createFilteredHandler(handlers.onCommentAdded))
      );
    }
    if (handlers.onLogAdded) {
      unsubscribers.push(
        subscribe(COLLABORATION_EVENTS.LOG_ADDED, createFilteredHandler(handlers.onLogAdded))
      );
    }
    if (handlers.onUserAssigned) {
      unsubscribers.push(
        subscribe(COLLABORATION_EVENTS.USER_ASSIGNED, createFilteredHandler(handlers.onUserAssigned))
      );
    }

    // Subscribe to collaborator events
    if (handlers.onCollaboratorAdded) {
      unsubscribers.push(
        subscribe(COLLABORATOR_EVENTS.ADDED, createFilteredHandler(handlers.onCollaboratorAdded))
      );
    }

    // Cleanup
    return () => {
      // Leave the plan room
      console.log('[usePlanEvents] Leaving plan room:', planId);
      send({ type: 'leave_plan', planId });

      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, subscribe, send]);
}

/**
 * Hook to subscribe to presence events for a plan
 *
 * @example
 * ```tsx
 * usePresenceEvents(planId, {
 *   onUserJoined: (message) => console.log('User joined'),
 *   onUserLeft: (message) => console.log('User left')
 * });
 * ```
 */
export function usePresenceEvents(
  planId: string | null,
  handlers: {
    onUserJoinedPlan?: (message: WebSocketMessage) => void;
    onUserLeftPlan?: (message: WebSocketMessage) => void;
    onUserJoinedNode?: (message: WebSocketMessage) => void;
    onUserLeftNode?: (message: WebSocketMessage) => void;
    onTypingStart?: (message: WebSocketMessage) => void;
    onTypingStop?: (message: WebSocketMessage) => void;
    onPresenceUpdate?: (message: WebSocketMessage) => void;
    onActiveUsers?: (message: WebSocketMessage) => void;
  }
) {
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    if (!planId) return;

    const unsubscribers: Array<() => void> = [];

    // Helper to create filtered handler
    const createFilteredHandler = (handler: (message: WebSocketMessage) => void) => {
      return (message: WebSocketMessage) => {
        // Only call handler if message is for this plan
        if (message.metadata.planId === planId) {
          handler(message);
        }
      };
    };

    // Subscribe to presence events
    if (handlers.onUserJoinedPlan) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.USER_JOINED_PLAN, createFilteredHandler(handlers.onUserJoinedPlan))
      );
    }
    if (handlers.onUserLeftPlan) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.USER_LEFT_PLAN, createFilteredHandler(handlers.onUserLeftPlan))
      );
    }
    if (handlers.onUserJoinedNode) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.USER_JOINED_NODE, createFilteredHandler(handlers.onUserJoinedNode))
      );
    }
    if (handlers.onUserLeftNode) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.USER_LEFT_NODE, createFilteredHandler(handlers.onUserLeftNode))
      );
    }
    if (handlers.onTypingStart) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.TYPING_START, createFilteredHandler(handlers.onTypingStart))
      );
    }
    if (handlers.onTypingStop) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.TYPING_STOP, createFilteredHandler(handlers.onTypingStop))
      );
    }
    if (handlers.onPresenceUpdate) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.PRESENCE_UPDATE, createFilteredHandler(handlers.onPresenceUpdate))
      );
    }
    if (handlers.onActiveUsers) {
      unsubscribers.push(
        subscribe(PRESENCE_EVENTS.ACTIVE_USERS, createFilteredHandler(handlers.onActiveUsers))
      );
    }

    // Cleanup
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, subscribe]);
}

/**
 * Hook to get WebSocket connection status
 *
 * @example
 * ```tsx
 * const { isConnected, status } = useWebSocketStatus();
 *
 * return (
 *   <div>
 *     Status: {status}
 *     {isConnected && <span>Connected!</span>}
 *   </div>
 * );
 * ```
 */
export function useWebSocketStatus() {
  const { status, isConnected } = useWebSocketContext();
  return { status, isConnected };
}

/**
 * Hook to send WebSocket messages
 *
 * @example
 * ```tsx
 * const sendMessage = useWebSocketSend();
 *
 * const handleClick = () => {
 *   sendMessage({ type: 'custom_event', payload: { foo: 'bar' } });
 * };
 * ```
 */
export function useWebSocketSend() {
  const { send } = useWebSocketContext();
  return useCallback(send, [send]);
}
