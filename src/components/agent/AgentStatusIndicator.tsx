import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { agentStatusApi } from '../../services/api';

interface AgentStatus {
  id: string;
  name: string;
  email: string;
  capability_tags: string[];
  status: string;
  last_seen_at: string | null;
  current_task_id: string | null;
}

interface AgentStatusIndicatorProps {
  planId: string;
  compact?: boolean;
}

const STATUS_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  active: { dot: 'bg-green-500', text: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  online: { dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  idle: { dot: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  offline: { dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
};

const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({ planId, compact = false }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStatuses = useCallback(async () => {
    try {
      const result = await agentStatusApi.getPlanAgentStatuses(planId);
      setAgents(result.agents || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    loadStatuses();
    const interval = setInterval(loadStatuses, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [loadStatuses]);

  if (loading) {
    return compact ? null : (
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
      </div>
    );
  }

  if (agents.length === 0) return null;

  if (compact) {
    // Just show dots for active agents
    const activeAgents = agents.filter(a => a.status !== 'offline');
    if (activeAgents.length === 0) return null;

    return (
      <div className="flex items-center gap-1" title={`${activeAgents.length} agent${activeAgents.length !== 1 ? 's' : ''} active`}>
        {activeAgents.slice(0, 3).map(agent => (
          <div key={agent.id} className="relative" title={`${agent.name || agent.email}: ${agent.status}`}>
            <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Bot className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${STATUS_COLORS[agent.status]?.dot || STATUS_COLORS.offline.dot}`} />
          </div>
        ))}
        {activeAgents.length > 3 && (
          <span className="text-xs text-gray-500">+{activeAgents.length - 3}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Bot className="w-3.5 h-3.5" />
        <span>Agents</span>
      </div>
      {agents.map(agent => {
        const colors = STATUS_COLORS[agent.status] || STATUS_COLORS.offline;
        return (
          <div key={agent.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${colors.bg}`}>
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${colors.dot}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {agent.name || agent.email}
              </div>
              <div className={`text-[10px] ${colors.text}`}>
                {agent.status}
                {agent.last_seen_at && agent.status !== 'offline' && (
                  <> · {timeAgo(agent.last_seen_at)}</>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default AgentStatusIndicator;
