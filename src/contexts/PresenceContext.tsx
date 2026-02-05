import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from './WebSocketContext';
import { useAuth } from '../hooks/useAuth';
import { PRESENCE_EVENTS } from '../types/websocket';

export interface Viewer {
  id: string;
  name: string;
  avatar_url?: string | null;
  is_agent?: boolean;
}

interface PresenceState {
  // Map of "resource_type:resource_id" -> viewers
  viewers: Record<string, Viewer[]>;
  // Current presence being tracked
  currentPresence: { resourceType: string; resourceId: string } | null;
}

interface PresenceContextType {
  // Get viewers for a specific resource
  getViewers: (resourceType: string, resourceId: string) => Viewer[];
  // Set current presence (when entering a view)
  setPresence: (resourceType: string, resourceId: string) => void;
  // Clear presence (when leaving a view)
  clearPresence: () => void;
  // Check if presence is enabled
  isEnabled: boolean;
}

const PresenceContext = createContext<PresenceContextType | null>(null);

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isConnected, subscribe, send } = useWebSocket();
  const [state, setState] = useState<PresenceState>({
    viewers: {},
    currentPresence: null,
  });
  
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabled = isConnected && isAuthenticated;

  // Send presence.join message
  const sendJoin = useCallback((resourceType: string, resourceId: string) => {
    send({
      type: 'presence.join',
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }, [send]);

  // Send presence.leave message
  const sendLeave = useCallback((resourceType: string, resourceId: string) => {
    send({
      type: 'presence.leave',
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }, [send]);

  // Send presence.heartbeat message
  const sendHeartbeat = useCallback((resourceType: string, resourceId: string) => {
    send({
      type: 'presence.heartbeat',
      resource_type: resourceType,
      resource_id: resourceId,
    });
  }, [send]);

  // Set presence for a resource
  const setPresence = useCallback((resourceType: string, resourceId: string) => {
    if (!isEnabled) return;
    
    // Clear previous presence if any
    if (state.currentPresence) {
      sendLeave(state.currentPresence.resourceType, state.currentPresence.resourceId);
    }

    // Clear existing heartbeat
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    // Join new resource
    sendJoin(resourceType, resourceId);
    
    // Update state
    setState(prev => ({
      ...prev,
      currentPresence: { resourceType, resourceId },
    }));

    // Start heartbeat
    heartbeatRef.current = setInterval(() => {
      sendHeartbeat(resourceType, resourceId);
    }, HEARTBEAT_INTERVAL);
  }, [isEnabled, state.currentPresence, sendJoin, sendLeave, sendHeartbeat]);

  // Clear presence
  const clearPresence = useCallback(() => {
    if (!isEnabled || !state.currentPresence) return;

    sendLeave(state.currentPresence.resourceType, state.currentPresence.resourceId);
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    setState(prev => ({
      ...prev,
      currentPresence: null,
    }));
  }, [isEnabled, state.currentPresence, sendLeave]);

  // Get viewers for a resource
  const getViewers = useCallback((resourceType: string, resourceId: string): Viewer[] => {
    const key = `${resourceType}:${resourceId}`;
    return state.viewers[key] || [];
  }, [state.viewers]);

  // Subscribe to presence updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = subscribe(PRESENCE_EVENTS.PRESENCE_UPDATE, (message: any) => {
      const { resource_type, resource_id, viewers } = message;
      if (!resource_type || !resource_id) return;
      
      const key = `${resource_type}:${resource_id}`;
      setState(prev => ({
        ...prev,
        viewers: {
          ...prev.viewers,
          [key]: viewers || [],
        },
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, []);

  // Clear presence when disconnected
  useEffect(() => {
    if (!isConnected && state.currentPresence) {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      setState(prev => ({
        ...prev,
        currentPresence: null,
      }));
    }
  }, [isConnected, state.currentPresence]);

  return (
    <PresenceContext.Provider 
      value={{ 
        getViewers, 
        setPresence, 
        clearPresence,
        isEnabled,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
};

// Hook to track presence for a specific view
export const useViewPresence = (resourceType: string, resourceId: string | undefined) => {
  const { setPresence, clearPresence, getViewers, isEnabled } = usePresence();

  useEffect(() => {
    if (!resourceId || !isEnabled) return;
    
    setPresence(resourceType, resourceId);
    
    return () => {
      clearPresence();
    };
  }, [resourceType, resourceId, setPresence, clearPresence, isEnabled]);

  const viewers = resourceId ? getViewers(resourceType, resourceId) : [];
  
  return { viewers, isEnabled };
};

export default PresenceContext;
