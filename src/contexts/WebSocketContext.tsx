import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { ConnectionStatus, EventType, WebSocketMessage, EventHandler } from '../types/websocket';

// ============================================================================
// Context Types
// ============================================================================

interface WebSocketContextValue {
  status: ConnectionStatus;
  isConnected: boolean;
  subscribe: (eventType: EventType, handler: EventHandler) => () => void;
  send: (message: any) => void;
  lastMessage: WebSocketMessage | null;
}

// ============================================================================
// Context Creation
// ============================================================================

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

// ============================================================================
// WebSocket Provider Component
// ============================================================================

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url: customUrl
}) => {
  // State
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const eventHandlersRef = useRef<Map<EventType, Set<EventHandler>>>(new Map());
  const shouldReconnectRef = useRef<boolean>(true);

  // Configuration
  const MAX_RECONNECT_ATTEMPTS = 10;
  const INITIAL_RECONNECT_DELAY = 1000; // 1 second
  const MAX_RECONNECT_DELAY = 30000; // 30 seconds
  const PING_INTERVAL = 30000; // 30 seconds

  /**
   * Get JWT token from localStorage
   */
  const getToken = useCallback((): string | null => {
    const sessionStr = localStorage.getItem('auth_session');
    if (!sessionStr) {
      console.warn('[WebSocket] No auth_session found in localStorage');
      return null;
    }

    try {
      const session = JSON.parse(sessionStr);
      const token = session.access_token || session.accessToken;
      if (!token) {
        console.warn('[WebSocket] No token found in session. Session keys:', Object.keys(session));
      }
      return token;
    } catch (error) {
      console.error('[WebSocket] Failed to parse session:', error);
      return null;
    }
  }, []);

  /**
   * Calculate exponential backoff delay
   */
  const getReconnectDelay = useCallback((): number => {
    const exponentialDelay = INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
    return Math.min(exponentialDelay, MAX_RECONNECT_DELAY);
  }, []);

  /**
   * Start ping/pong keepalive
   */
  const startPingInterval = useCallback(() => {
    // Clear existing interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }

    // Send ping every 30 seconds
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Sending ping');
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, PING_INTERVAL);
  }, []);

  /**
   * Stop ping interval
   */
  const stopPingInterval = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  /**
   * Dispatch message to event handlers
   */
  const dispatchMessage = useCallback((message: WebSocketMessage) => {
    console.log('[WebSocket] Dispatching message:', message.type);

    // Store last message
    setLastMessage(message);

    // Get handlers for this event type
    const handlers = eventHandlersRef.current.get(message.type);
    if (handlers && handlers.size > 0) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[WebSocket] Error in handler for ${message.type}:`, error);
        }
      });
    } else {
      console.log(`[WebSocket] No handlers registered for event: ${message.type}`);
    }
  }, []);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    // Don't reconnect if we shouldn't
    if (!shouldReconnectRef.current) {
      console.log('[WebSocket] Reconnection disabled, skipping connect');
      return;
    }

    // Get token
    const token = getToken();
    if (!token) {
      console.error('[WebSocket] Cannot connect: No authentication token');
      setStatus(ConnectionStatus.ERROR);
      return;
    }

    // Build WebSocket URL
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const wsUrl = customUrl || apiUrl.replace(/^http/, 'ws') + '/ws/collaborate';
    const urlWithToken = `${wsUrl}?token=${token}`;

    console.log('[WebSocket] Connecting to:', wsUrl);
    setStatus(ConnectionStatus.CONNECTING);

    try {
      // Create WebSocket connection
      const ws = new WebSocket(urlWithToken);
      wsRef.current = ws;

      // Connection opened
      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setStatus(ConnectionStatus.CONNECTED);
        reconnectAttemptsRef.current = 0;
        startPingInterval();
      };

      // Message received
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage;
          console.log('[WebSocket] Message received:', message.type);

          // Handle pong response
          if (message.type === 'pong') {
            console.log('[WebSocket] Pong received');
            return;
          }

          // Dispatch to handlers
          dispatchMessage(message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error, event.data);
        }
      };

      // Connection closed
      ws.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        stopPingInterval();

        // Don't reconnect if token is expired/invalid (code 4001) - user needs to refresh/re-login
        if (event.code === 4001) {
          console.log('[WebSocket] Token expired - not reconnecting. Refresh the page to reconnect.');
          setStatus(ConnectionStatus.DISCONNECTED);
          return;
        }

        if (shouldReconnectRef.current && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          setStatus(ConnectionStatus.RECONNECTING);
          const delay = getReconnectDelay();
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.log('[WebSocket] Not reconnecting');
          setStatus(ConnectionStatus.DISCONNECTED);
        }
      };

      // Connection error
      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setStatus(ConnectionStatus.ERROR);
      };

    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
      setStatus(ConnectionStatus.ERROR);
    }
  }, [customUrl, getToken, getReconnectDelay, startPingInterval, stopPingInterval, dispatchMessage]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    console.log('[WebSocket] Disconnecting');
    shouldReconnectRef.current = false;

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Stop ping interval
    stopPingInterval();

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus(ConnectionStatus.DISCONNECTED);
  }, [stopPingInterval]);

  /**
   * Subscribe to an event type
   */
  const subscribe = useCallback((eventType: EventType, handler: EventHandler): (() => void) => {
    console.log(`[WebSocket] Subscribing to event: ${eventType}`);

    // Get or create handler set for this event type
    let handlers = eventHandlersRef.current.get(eventType);
    if (!handlers) {
      handlers = new Set();
      eventHandlersRef.current.set(eventType, handlers);
    }

    // Add handler
    handlers.add(handler);

    // Return unsubscribe function
    return () => {
      console.log(`[WebSocket] Unsubscribing from event: ${eventType}`);
      const handlers = eventHandlersRef.current.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  /**
   * Send a message through WebSocket
   */
  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Sending message:', message);
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message: Connection not open');
    }
  }, []);

  // ============================================================================
  // Lifecycle
  // ============================================================================

  // Connect on mount
  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    // Disconnect on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Reconnect when token changes
  useEffect(() => {
    const handleAuthChange = () => {
      console.log('[WebSocket] Auth changed, reconnecting');
      disconnect();
      setTimeout(() => {
        shouldReconnectRef.current = true;
        connect();
      }, 1000);
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [connect, disconnect]);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: WebSocketContextValue = {
    status,
    isConnected: status === ConnectionStatus.CONNECTED,
    subscribe,
    send,
    lastMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access WebSocket context
 * @throws Error if used outside WebSocketProvider
 */
export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
