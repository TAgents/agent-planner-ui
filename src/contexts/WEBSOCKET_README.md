# WebSocket Client Implementation

This directory contains the WebSocket client implementation for real-time collaboration in the Agent Planner UI.

## Overview

The WebSocket client connects to the backend WebSocket server at `ws://localhost:3000/ws/collaborate` (or the configured API URL) and enables real-time synchronization of:

- Plan updates (create, update, delete, status changes)
- Node updates (create, update, delete, move, status changes)
- Collaboration events (comments, logs, artifacts, assignments)
- Collaborator management (add, remove, role changes)
- User presence (join/leave plan, typing indicators)

## Architecture

### Components

1. **WebSocketContext.tsx** - React Context Provider that manages WebSocket connection
2. **useWebSocket.ts** - Custom hooks for easy WebSocket usage
3. **websocket.ts** - TypeScript type definitions matching backend schema

### Features

- **Automatic Connection**: Connects on mount using JWT from localStorage
- **Auto-Reconnect**: Exponential backoff reconnection (1s, 2s, 4s, 8s... up to 30s)
- **Connection Lifecycle**: CONNECTING → CONNECTED → DISCONNECTED/RECONNECTING
- **Ping/Pong Keepalive**: Sends ping every 30 seconds to keep connection alive
- **Event Subscription**: Subscribe to specific event types with automatic cleanup
- **Plan Filtering**: Hooks automatically filter events by plan ID
- **Error Handling**: Graceful error handling with console logging
- **TypeScript Support**: Full type definitions for all events and payloads

## Setup

### 1. Wrap Your App with WebSocketProvider

Add the WebSocketProvider to your App component:

```tsx
// src/App.tsx
import { WebSocketProvider } from './contexts/WebSocketContext';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <WebSocketProvider>
          <BrowserRouter>
            {/* Your routes */}
          </BrowserRouter>
        </WebSocketProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}
```

### 2. Use WebSocket Hooks in Components

```tsx
import { useWebSocket, useWebSocketEvent, usePlanEvents } from '../hooks/useWebSocket';
import { NODE_EVENTS } from '../types/websocket';

function PlanView({ planId }) {
  const { isConnected, status } = useWebSocket();

  // Subscribe to specific events
  useWebSocketEvent(NODE_EVENTS.CREATED, (message) => {
    console.log('Node created:', message.payload);
    // Update UI, invalidate queries, etc.
  });

  // Or subscribe to multiple plan events at once
  usePlanEvents(planId, {
    onNodeCreated: (message) => {
      console.log('Node created:', message.payload);
    },
    onNodeUpdated: (message) => {
      console.log('Node updated:', message.payload);
    },
    onNodeDeleted: (message) => {
      console.log('Node deleted:', message.payload);
    }
  });

  return (
    <div>
      <div>Connection Status: {status}</div>
      {/* Your plan view */}
    </div>
  );
}
```

## Available Hooks

### useWebSocket()

Get WebSocket connection state and methods:

```tsx
const { status, isConnected, subscribe, send, lastMessage } = useWebSocket();
```

**Returns:**
- `status: ConnectionStatus` - Current connection status
- `isConnected: boolean` - True if connected
- `subscribe: (eventType, handler) => unsubscribe` - Subscribe to events
- `send: (message) => void` - Send a message
- `lastMessage: WebSocketMessage | null` - Last received message

### useWebSocketEvent(eventType, handler)

Subscribe to a specific event type:

```tsx
useWebSocketEvent('node.created', (message) => {
  console.log('Node created:', message.payload);
});
```

### usePlanEvents(planId, handlers)

Subscribe to all plan-related events with automatic plan filtering:

```tsx
usePlanEvents(planId, {
  onNodeCreated: (message) => {
    // Only called for nodes in this plan
  },
  onNodeUpdated: (message) => {
    // Only called for nodes in this plan
  },
  onCommentAdded: (message) => {
    // Only called for comments in this plan
  }
});
```

**Available handlers:**
- `onPlanUpdated`
- `onPlanDeleted`
- `onPlanStatusChanged`
- `onNodeCreated`
- `onNodeUpdated`
- `onNodeDeleted`
- `onNodeMoved`
- `onNodeStatusChanged`
- `onCommentAdded`
- `onLogAdded`
- `onArtifactAdded`
- `onCollaboratorAdded`
- `onUserAssigned`

### usePresenceEvents(planId, handlers)

Subscribe to presence events:

```tsx
usePresenceEvents(planId, {
  onUserJoinedPlan: (message) => {
    console.log('User joined:', message.payload.userName);
  },
  onUserLeftPlan: (message) => {
    console.log('User left:', message.payload.userName);
  }
});
```

### useWebSocketStatus()

Get just the connection status:

```tsx
const { status, isConnected } = useWebSocketStatus();
```

### useWebSocketSend()

Get the send function:

```tsx
const sendMessage = useWebSocketSend();

sendMessage({ type: 'custom_event', payload: { foo: 'bar' } });
```

## Event Types

All event types are defined in `src/types/websocket.ts`:

### Plan Events
- `plan.created`
- `plan.updated`
- `plan.deleted`
- `plan.status_changed`

### Node Events
- `node.created`
- `node.updated`
- `node.deleted`
- `node.moved`
- `node.status_changed`

### Collaboration Events
- `collaboration.user_assigned`
- `collaboration.user_unassigned`
- `collaboration.comment_added`
- `collaboration.comment_updated`
- `collaboration.comment_deleted`
- `collaboration.log_added`
- `collaboration.artifact_added`
- `collaboration.artifact_deleted`
- `collaboration.label_added`
- `collaboration.label_removed`

### Collaborator Events
- `collaborator.added`
- `collaborator.removed`
- `collaborator.role_changed`

### Presence Events
- `user_joined_plan`
- `user_left_plan`
- `user_joined_node`
- `user_left_node`
- `typing_start`
- `typing_stop`
- `presence_update`
- `active_users`
- `node_viewers`

## Message Structure

All WebSocket messages follow this structure:

```typescript
{
  type: 'node.created',           // Event type
  payload: {                       // Event-specific data
    id: 'node-uuid',
    planId: 'plan-uuid',
    title: 'My Task',
    status: 'in_progress',
    // ... more fields
  },
  metadata: {                      // Common metadata
    userId: 'user-uuid',
    userName: 'Jane Smith',
    timestamp: '2025-11-11T10:30:00.000Z',
    planId: 'plan-uuid',
    version: '1.0.0'
  }
}
```

## Integration with React Query

Use WebSocket events to invalidate React Query caches:

```tsx
import { useQueryClient } from 'react-query';
import { usePlanEvents } from '../hooks/useWebSocket';

function PlanView({ planId }) {
  const queryClient = useQueryClient();

  usePlanEvents(planId, {
    onNodeCreated: () => {
      // Invalidate nodes query to refetch
      queryClient.invalidateQueries(['plans', planId, 'nodes']);
    },
    onNodeUpdated: (message) => {
      // Update specific node in cache
      queryClient.setQueryData(['plans', planId, 'nodes'], (old: any) => {
        return old.map((node: any) =>
          node.id === message.payload.id ? message.payload : node
        );
      });
    },
    onNodeDeleted: (message) => {
      // Remove node from cache
      queryClient.setQueryData(['plans', planId, 'nodes'], (old: any) => {
        return old.filter((node: any) => node.id !== message.payload.id);
      });
    }
  });

  return <div>{/* Your UI */}</div>;
}
```

## Configuration

The WebSocket client uses environment variables:

```bash
# .env
REACT_APP_API_URL=http://localhost:3000
```

The WebSocket URL is automatically constructed from the API URL:
- HTTP → WS
- HTTPS → WSS
- Path: `/ws/collaborate`
- Auth: `?token=${jwt}`

## Connection Lifecycle

1. **CONNECTING** - Attempting to establish connection
2. **CONNECTED** - Successfully connected, receiving events
3. **DISCONNECTED** - Connection closed, not attempting to reconnect
4. **RECONNECTING** - Connection lost, attempting to reconnect
5. **ERROR** - Connection error occurred

## Reconnection Strategy

The client uses exponential backoff for reconnection:

- Initial delay: 1 second
- Delay doubles after each attempt: 2s, 4s, 8s, 16s...
- Maximum delay: 30 seconds
- Maximum attempts: 10
- After 10 failed attempts, stops trying

## Debugging

Enable WebSocket logging by checking the browser console:

```
[WebSocket] Connecting to: ws://localhost:3000/ws/collaborate
[WebSocket] Connected successfully
[WebSocket] Message received: node.created
[WebSocket] Dispatching message: node.created
[WebSocket] Subscribing to event: node.created
```

## Example: Real-time Plan Updates

```tsx
import React, { useState } from 'react';
import { usePlanEvents, useWebSocketStatus } from '../hooks/useWebSocket';

function PlanDashboard({ planId }) {
  const [activities, setActivities] = useState<string[]>([]);
  const { isConnected } = useWebSocketStatus();

  usePlanEvents(planId, {
    onNodeCreated: (message) => {
      setActivities(prev => [
        `${message.metadata.userName} created node: ${message.payload.title}`,
        ...prev
      ]);
    },
    onNodeUpdated: (message) => {
      setActivities(prev => [
        `${message.metadata.userName} updated node: ${message.payload.title}`,
        ...prev
      ]);
    },
    onCommentAdded: (message) => {
      setActivities(prev => [
        `${message.metadata.userName} added a comment`,
        ...prev
      ]);
    }
  });

  return (
    <div>
      <div>
        Connection: {isConnected ? '✅ Connected' : '❌ Disconnected'}
      </div>
      <div>
        <h3>Recent Activity</h3>
        {activities.map((activity, i) => (
          <div key={i}>{activity}</div>
        ))}
      </div>
    </div>
  );
}
```

## Testing

To test WebSocket functionality:

1. Start the backend server: `cd agent-planner && npm run dev`
2. Start the frontend: `cd agent-planner-ui && npm start`
3. Open two browser windows with the same plan
4. Make changes in one window
5. Observe real-time updates in the other window

## Troubleshooting

### Connection not establishing

- Check that backend is running on correct port
- Verify `REACT_APP_API_URL` environment variable
- Check browser console for WebSocket errors
- Ensure JWT token is valid in localStorage

### Events not firing

- Check that you're subscribed to the correct event type
- Verify plan ID matches between subscription and event
- Check browser console for handler errors
- Ensure component hasn't unmounted (handlers auto-cleanup)

### Connection keeps dropping

- Check network stability
- Verify backend WebSocket server is running
- Check for proxy/firewall issues
- Increase ping interval if needed

## Future Enhancements

Potential improvements:

- [ ] Message queue for offline support
- [ ] Optimistic updates with rollback
- [ ] Binary message support for large payloads
- [ ] Compression for message data
- [ ] Custom reconnection strategies
- [ ] Connection health monitoring
- [ ] Metrics and analytics

## Related Files

- Backend WebSocket implementation: `/agent-planner/src/websocket/`
- Backend message schema: `/agent-planner/src/websocket/message-schema.js`
- Backend integration guide: `/agent-planner/src/websocket/INTEGRATION_GUIDE.md`
