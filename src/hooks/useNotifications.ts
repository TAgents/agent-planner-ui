import { useQuery, useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { decisionsApi, agentRequestApi, planService } from '../services/api';
import { useWebSocketEvent } from './useWebSocket';
import { AGENT_EVENTS } from '../types/websocket';

// Types
export interface NotificationItem {
  id: string;
  type: 'decision' | 'agent_request';
  plan_id: string;
  plan_title: string;
  title: string;
  urgency?: 'blocking' | 'can_continue';
  request_type?: string;
  created_at: string;
}

export interface NotificationSummary {
  decisions: NotificationItem[];
  agentRequests: NotificationItem[];
  totalCount: number;
  hasUrgent: boolean;
}

// Fetch pending notifications across all accessible plans
// DISABLED: This was causing 21+ API calls per fetch (1 plans + 10 decisions + 10 agent requests)
// which triggered rate limiting and broke the site.
// TODO: Re-enable when backend has a batch notifications endpoint
async function fetchPendingNotifications(): Promise<NotificationSummary> {
  // Return empty to avoid rate limiting
  return {
    decisions: [],
    agentRequests: [],
    totalCount: 0,
    hasUrgent: false,
  };
}

// Hook for fetching pending notifications
export function usePendingNotifications() {
  return useQuery(
    ['notifications', 'pending'],
    fetchPendingNotifications,
    {
      refetchInterval: 60000, // Poll every 60s as fallback
      staleTime: 30000, // Consider data stale after 30s
      retry: false, // Don't retry on failure
    }
  );
}

// Hook for WebSocket-based notification updates
export function useNotificationEvents() {
  const queryClient = useQueryClient();
  
  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries(['notifications', 'pending']);
  }, [queryClient]);

  // Decision events
  useWebSocketEvent('decision.requested' as any, invalidateNotifications, [invalidateNotifications]);
  useWebSocketEvent('decision.resolved' as any, invalidateNotifications, [invalidateNotifications]);
  
  // Agent request events
  useWebSocketEvent(AGENT_EVENTS.REQUESTED, invalidateNotifications, [invalidateNotifications]);
  useWebSocketEvent(AGENT_EVENTS.RESPONSE, invalidateNotifications, [invalidateNotifications]);
}
