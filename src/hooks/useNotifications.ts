import { useQuery, useQueryClient } from 'react-query';
import { useCallback } from 'react';
import { dashboardApi } from '../services/api';
import { useWebSocketEvent } from './useWebSocket';
import { AGENT_EVENTS, DECISION_EVENTS } from '../types/websocket';

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

// Fetch pending notifications using the batch dashboard endpoint
async function fetchPendingNotifications(): Promise<NotificationSummary> {
  const pending = await dashboardApi.getPending(20);

  const decisions: NotificationItem[] = pending.decisions.map(d => ({
    id: d.id,
    type: 'decision',
    plan_id: d.plan_id,
    plan_title: d.plan_title,
    title: d.title,
    urgency: d.urgency as 'blocking' | 'can_continue',
    created_at: d.created_at,
  }));

  const agentRequests: NotificationItem[] = pending.agent_requests.map(r => ({
    id: r.id,
    type: 'agent_request',
    plan_id: r.plan_id,
    plan_title: r.plan_title,
    title: r.task_title,
    request_type: r.request_type,
    created_at: r.requested_at,
  }));

  return {
    decisions,
    agentRequests,
    totalCount: pending.total,
    hasUrgent: pending.decisions.some(d => d.urgency === 'blocking'),
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
  useWebSocketEvent(DECISION_EVENTS.REQUESTED, invalidateNotifications, [invalidateNotifications]);
  useWebSocketEvent(DECISION_EVENTS.RESOLVED, invalidateNotifications, [invalidateNotifications]);

  // Agent request events
  useWebSocketEvent(AGENT_EVENTS.REQUESTED, invalidateNotifications, [invalidateNotifications]);
  useWebSocketEvent(AGENT_EVENTS.RESPONSE, invalidateNotifications, [invalidateNotifications]);
}
