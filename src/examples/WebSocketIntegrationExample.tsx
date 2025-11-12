/**
 * WebSocket Integration Examples
 *
 * This file demonstrates various patterns for integrating WebSocket
 * functionality into React components.
 */

import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import {
  useWebSocket,
  useWebSocketEvent,
  usePlanEvents,
  usePresenceEvents,
  useWebSocketStatus
} from '../hooks/useWebSocket';
import {
  NODE_EVENTS,
  PLAN_EVENTS,
  COLLABORATION_EVENTS,
  NodePayload,
  CommentPayload
} from '../types/websocket';

// ============================================================================
// Example 1: Simple Event Subscription
// ============================================================================

export function SimpleEventExample({ planId }: { planId: string }) {
  const [lastUpdate, setLastUpdate] = useState<string>('');

  // Subscribe to node creation events
  useWebSocketEvent(NODE_EVENTS.CREATED, (message) => {
    const node = message.payload as NodePayload;
    setLastUpdate(`Node created: ${node.title} by ${message.metadata.userName}`);
  });

  return (
    <div className="p-4 bg-blue-50 rounded">
      <h3 className="font-semibold">Last Update:</h3>
      <p>{lastUpdate || 'Waiting for updates...'}</p>
    </div>
  );
}

// ============================================================================
// Example 2: React Query Integration
// ============================================================================

export function ReactQueryIntegrationExample({ planId }: { planId: string }) {
  const queryClient = useQueryClient();

  usePlanEvents(planId, {
    // Invalidate query when node is created
    onNodeCreated: () => {
      queryClient.invalidateQueries(['plans', planId, 'nodes']);
    },

    // Optimistically update cache when node is updated
    onNodeUpdated: (message) => {
      const node = message.payload as NodePayload;
      queryClient.setQueryData(['plans', planId, 'nodes'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((n: any) => (n.id === node.id ? { ...n, ...node } : n))
        };
      });
    },

    // Remove node from cache when deleted
    onNodeDeleted: (message) => {
      const { id } = message.payload as { id: string };
      queryClient.setQueryData(['plans', planId, 'nodes'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((n: any) => n.id !== id)
        };
      });
    }
  });

  return <div>React Query integration active</div>;
}

// ============================================================================
// Example 3: Activity Feed
// ============================================================================

interface Activity {
  id: string;
  message: string;
  timestamp: string;
  type: 'node' | 'comment' | 'collaborator';
}

export function ActivityFeedExample({ planId }: { planId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);

  const addActivity = (message: string, type: Activity['type']) => {
    const activity: Activity = {
      id: Date.now().toString(),
      message,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10
  };

  usePlanEvents(planId, {
    onNodeCreated: (msg) => {
      const node = msg.payload as NodePayload;
      addActivity(
        `${msg.metadata.userName} created "${node.title}"`,
        'node'
      );
    },
    onNodeUpdated: (msg) => {
      const node = msg.payload as NodePayload;
      addActivity(
        `${msg.metadata.userName} updated "${node.title}"`,
        'node'
      );
    },
    onCommentAdded: (msg) => {
      const comment = msg.payload as CommentPayload;
      addActivity(
        `${msg.metadata.userName} added a comment`,
        'comment'
      );
    },
    onCollaboratorAdded: (msg) => {
      addActivity(
        `${msg.metadata.userName} joined the plan`,
        'collaborator'
      );
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          activities.map(activity => (
            <div
              key={activity.id}
              className="flex items-start gap-2 text-sm border-l-2 border-blue-500 pl-3 py-1"
            >
              <span className="text-gray-500">{activity.timestamp}</span>
              <span className="text-gray-700">{activity.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 4: Presence Indicators
// ============================================================================

interface ActiveUser {
  userId: string;
  userName: string;
  status: 'active' | 'away';
}

export function PresenceIndicatorExample({ planId }: { planId: string }) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  usePresenceEvents(planId, {
    onUserJoinedPlan: (msg) => {
      const { userId, userName } = msg.payload as any;
      setActiveUsers(prev => [
        ...prev.filter(u => u.userId !== userId),
        { userId, userName: userName || 'Unknown', status: 'active' }
      ]);
    },
    onUserLeftPlan: (msg) => {
      const { userId } = msg.payload as any;
      setActiveUsers(prev => prev.filter(u => u.userId !== userId));
    },
    onPresenceUpdate: (msg) => {
      const { userId, status } = msg.payload as any;
      setActiveUsers(prev =>
        prev.map(u => (u.userId === userId ? { ...u, status } : u))
      );
    }
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Active Users</h3>
      <div className="space-y-2">
        {activeUsers.length === 0 ? (
          <p className="text-gray-500 text-sm">No active users</p>
        ) : (
          activeUsers.map(user => (
            <div key={user.userId} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  user.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm text-gray-700">{user.userName}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Example 5: Connection Status Banner
// ============================================================================

export function ConnectionStatusBanner() {
  const { status, isConnected } = useWebSocketStatus();

  if (isConnected) {
    return null; // Don't show anything when connected
  }

  const getMessage = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to real-time updates...';
      case 'reconnecting':
        return 'Reconnecting to real-time updates...';
      case 'error':
        return 'Connection error. Some features may be unavailable.';
      case 'disconnected':
        return 'Disconnected from real-time updates.';
      default:
        return '';
    }
  };

  const getColor = () => {
    switch (status) {
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <div className={`border-b ${getColor()} px-4 py-2 text-sm text-center`}>
      {getMessage()}
    </div>
  );
}

// ============================================================================
// Example 6: Typing Indicators
// ============================================================================

export function TypingIndicatorExample({ planId, nodeId }: { planId: string; nodeId: string }) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  usePresenceEvents(planId, {
    onTypingStart: (msg) => {
      if (msg.payload.nodeId === nodeId) {
        setTypingUsers(prev => new Set([...prev, msg.metadata.userName || msg.metadata.userId]));
      }
    },
    onTypingStop: (msg) => {
      if (msg.payload.nodeId === nodeId) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(msg.metadata.userName || msg.metadata.userId);
          return next;
        });
      }
    }
  });

  if (typingUsers.size === 0) {
    return null;
  }

  const names = Array.from(typingUsers);
  const message =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing...`
      : `${names.length} people are typing...`;

  return (
    <div className="text-sm text-gray-500 italic px-4 py-2">
      {message}
    </div>
  );
}

// ============================================================================
// Example 7: Complete Plan View Integration
// ============================================================================

export function CompletePlanViewExample({ planId }: { planId: string }) {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<string[]>([]);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(0, -1));
    }, 5000);
  };

  // Subscribe to all plan events
  usePlanEvents(planId, {
    onNodeCreated: (msg) => {
      queryClient.invalidateQueries(['plans', planId, 'nodes']);
      addNotification(`New node: ${msg.payload.title}`);
    },
    onNodeUpdated: (msg) => {
      queryClient.invalidateQueries(['plans', planId, 'nodes']);
      addNotification(`Updated: ${msg.payload.title}`);
    },
    onNodeDeleted: (msg) => {
      queryClient.invalidateQueries(['plans', planId, 'nodes']);
      addNotification('Node deleted');
    },
    onCommentAdded: (msg) => {
      queryClient.invalidateQueries(['plans', planId, 'nodes', msg.payload.nodeId, 'comments']);
      addNotification(`${msg.metadata.userName} commented`);
    },
    onLogAdded: (msg) => {
      queryClient.invalidateQueries(['plans', planId, 'nodes', msg.payload.nodeId, 'logs']);
      addNotification(`${msg.metadata.userName} added a log`);
    }
  });

  return (
    <div>
      <ConnectionStatusBanner />

      {/* Notifications */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {notifications.map((notification, i) => (
          <div
            key={i}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg animate-slide-in"
          >
            {notification}
          </div>
        ))}
      </div>

      {/* Your plan view content */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <div className="col-span-2">
          {/* Main plan content */}
        </div>
        <div className="space-y-4">
          <PresenceIndicatorExample planId={planId} />
          <ActivityFeedExample planId={planId} />
        </div>
      </div>
    </div>
  );
}
