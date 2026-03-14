import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  Bot,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Activity,
  ArrowUpRight,
  Zap,
} from 'lucide-react';
import { useWebSocket } from '../../contexts/WebSocketContext';
import {
  NODE_EVENTS,
  COLLABORATION_EVENTS,
  AGENT_EVENTS,
  EventType,
  WebSocketMessage,
} from '../../types/websocket';

// ============================================================================
// Types
// ============================================================================

export interface ActivityItem {
  id: string;
  type: 'status_change' | 'log_added' | 'agent_requested' | 'task_completed' | 'knowledge_added';
  message: string;
  plan_title: string;
  plan_id: string;
  node_title?: string;
  node_id?: string;
  timestamp: string;
  actor_type?: 'agent' | 'human' | 'system';
}

interface AgentActivityStreamProps {
  initialActivities: ActivityItem[];
  maxItems?: number;
  goalFilter?: string;
}

// ============================================================================
// Helpers
// ============================================================================

const typeConfig: Record<ActivityItem['type'], {
  icon: React.FC<{ className?: string }>;
  color: string;
  dotColor: string;
}> = {
  status_change: {
    icon: ArrowUpRight,
    color: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  log_added: {
    icon: Activity,
    color: 'text-blue-500',
    dotColor: 'bg-blue-500',
  },
  agent_requested: {
    icon: AlertCircle,
    color: 'text-amber-500',
    dotColor: 'bg-amber-500',
  },
  task_completed: {
    icon: CheckCircle,
    color: 'text-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  knowledge_added: {
    icon: BookOpen,
    color: 'text-purple-500',
    dotColor: 'bg-purple-500',
  },
};

const actorIcon: Record<string, React.FC<{ className?: string }>> = {
  agent: Bot,
  system: Zap,
};

const safeFormatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Maps a WebSocket message into an ActivityItem if relevant,
 * otherwise returns null.
 */
const wsMessageToActivity = (msg: WebSocketMessage): ActivityItem | null => {
  const { type, payload, metadata } = msg;

  switch (type) {
    case NODE_EVENTS.STATUS_CHANGED: {
      const isCompleted = payload?.newStatus === 'completed';
      return {
        id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: isCompleted ? 'task_completed' : 'status_change',
        message: isCompleted
          ? `Task completed: ${payload?.title || 'Untitled'}`
          : `Status changed to ${payload?.newStatus || 'unknown'}`,
        plan_title: '',
        plan_id: metadata?.planId || '',
        node_id: payload?.id,
        node_title: payload?.title,
        timestamp: metadata?.timestamp || new Date().toISOString(),
        actor_type: metadata?.userName ? 'human' : 'system',
      };
    }

    case COLLABORATION_EVENTS.LOG_ADDED: {
      return {
        id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'log_added',
        message: `Log: ${(payload?.content || '').slice(0, 120)}`,
        plan_title: '',
        plan_id: metadata?.planId || '',
        node_id: payload?.nodeId,
        timestamp: metadata?.timestamp || new Date().toISOString(),
        actor_type: metadata?.userName ? 'human' : 'agent',
      };
    }

    case AGENT_EVENTS.REQUESTED: {
      return {
        id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: 'agent_requested',
        message: `Agent assistance requested`,
        plan_title: '',
        plan_id: metadata?.planId || '',
        node_id: payload?.nodeId,
        timestamp: metadata?.timestamp || new Date().toISOString(),
        actor_type: 'human',
      };
    }

    default:
      return null;
  }
};

// ============================================================================
// AgentActivityStream Component
// ============================================================================

const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({
  initialActivities,
  maxItems = 20,
  goalFilter,
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const listRef = useRef<HTMLDivElement>(null);
  const { subscribe } = useWebSocket();

  // Keep activities synced with initialActivities prop changes
  useEffect(() => {
    setActivities(initialActivities);
  }, [initialActivities]);

  // Auto-scroll to top on new items
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [activities.length]);

  // Subscribe to WebSocket events
  const handleWsMessage = useCallback(
    (msg: WebSocketMessage) => {
      const item = wsMessageToActivity(msg);
      if (!item) return;

      setActivities((prev) => {
        const updated = [item, ...prev];
        return updated.slice(0, maxItems);
      });
    },
    [maxItems],
  );

  useEffect(() => {
    const unsubs: Array<() => void> = [];

    const relevantEvents: EventType[] = [
      NODE_EVENTS.STATUS_CHANGED,
      COLLABORATION_EVENTS.LOG_ADDED,
      AGENT_EVENTS.REQUESTED,
    ];

    for (const eventType of relevantEvents) {
      unsubs.push(subscribe(eventType, handleWsMessage));
    }

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [subscribe, handleWsMessage]);

  // Apply goal filter if provided
  const filteredActivities = goalFilter
    ? activities.filter((a) => a.plan_id === goalFilter)
    : activities;

  if (filteredActivities.length === 0) {
    return (
      <div className="text-center py-10">
        <Activity className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="overflow-y-auto max-h-[500px]">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-0">
          {filteredActivities.map((item) => {
            const config = typeConfig[item.type] || typeConfig.status_change;
            const Icon = item.actor_type && actorIcon[item.actor_type]
              ? actorIcon[item.actor_type]
              : config.icon;

            return (
              <div
                key={item.id}
                className="relative flex items-start gap-3 py-2.5 px-1 group"
              >
                {/* Icon dot */}
                <div
                  className={`relative z-10 flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 group-hover:border-gray-300 dark:group-hover:border-gray-600 transition-colors`}
                >
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.plan_title && (
                      <Link
                        to={`/app/plans/${item.plan_id}${item.node_id ? `?node=${item.node_id}` : ''}`}
                        className="text-[10px] text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors truncate max-w-[160px]"
                      >
                        {item.plan_title}
                        {item.node_title ? ` / ${item.node_title}` : ''}
                      </Link>
                    )}
                    <span className="text-[10px] text-gray-300 dark:text-gray-600 flex-shrink-0">
                      {safeFormatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AgentActivityStream;
