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
async function fetchPendingNotifications(): Promise<NotificationSummary> {
  // Check if user is authenticated
  const sessionStr = localStorage.getItem('auth_session');
  if (!sessionStr) {
    return {
      decisions: [],
      agentRequests: [],
      totalCount: 0,
      hasUrgent: false,
    };
  }

  try {
    // Get all plans the user has access to using the API client
    const plansData = await planService.getPlans(1, 20);
    const plans = Array.isArray(plansData) ? plansData : (plansData?.plans || []);
    
    // For each plan, fetch pending decisions and agent requests
    const decisions: NotificationItem[] = [];
    const agentRequests: NotificationItem[] = [];
    
    // Limit to first 10 plans to avoid too many requests
    const plansToCheck = plans.slice(0, 10);
    
    await Promise.all(plansToCheck.map(async (plan: { id: string; title: string }) => {
      try {
        // Fetch pending decisions
        const planDecisions = await decisionsApi.list(plan.id, { status: 'pending' });
        if (Array.isArray(planDecisions)) {
          planDecisions.forEach((d) => {
            decisions.push({
              id: d.id,
              type: 'decision',
              plan_id: plan.id,
              plan_title: plan.title,
              title: d.title,
              urgency: d.urgency,
              created_at: d.created_at,
            });
          });
        }
        
        // Fetch pending agent requests (if endpoint exists)
        try {
          const planRequests = await agentRequestApi.listForPlan(plan.id, 'pending');
          if (Array.isArray(planRequests)) {
            planRequests.forEach((r) => {
              agentRequests.push({
                id: r.id,
                type: 'agent_request',
                plan_id: plan.id,
                plan_title: plan.title,
                title: r.prompt || `${r.request_type} request`,
                request_type: r.request_type,
                created_at: r.created_at,
              });
            });
          }
        } catch {
          // Agent requests endpoint might not exist yet - silently skip
        }
      } catch (err) {
        // Silently skip plans where fetching fails (might not have access)
        console.debug(`Could not fetch notifications for plan ${plan.id}`);
      }
    }));
    
    const hasUrgent = decisions.some(d => d.urgency === 'blocking');
    
    return {
      decisions,
      agentRequests,
      totalCount: decisions.length + agentRequests.length,
      hasUrgent,
    };
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return {
      decisions: [],
      agentRequests: [],
      totalCount: 0,
      hasUrgent: false,
    };
  }
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
