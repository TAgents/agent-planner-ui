import React, { useState, useEffect } from 'react';
import { Bot, Tag, ArrowRightLeft, ListTodo, Activity, Clock, Loader2, Users } from 'lucide-react';
import { dashboardApi } from '../services/api';

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  capability_tags: string[];
}

const AgentDashboard: React.FC = () => {
  const [data, setData] = useState<{
    agents: AgentInfo[];
    assignments: any[];
    handoffs: any[];
    recentActivity: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await dashboardApi.getAgentActivity();
      setData(result);
    } catch (err) {
      setError('Failed to load agent activity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-500 py-12">{error || 'Failed to load data'}</div>
    );
  }

  const pendingHandoffs = data.handoffs.filter(h => h.status === 'pending');
  const activeAssignments = data.assignments.filter(a => a.status === 'in_progress');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Bot className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Monitor agent assignments, handoffs, and activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Active Agents" value={data.agents.length} color="purple" />
        <StatCard icon={<ListTodo className="w-5 h-5" />} label="Assigned Tasks" value={data.assignments.length} color="blue" />
        <StatCard icon={<Activity className="w-5 h-5" />} label="In Progress" value={activeAssignments.length} color="green" />
        <StatCard icon={<ArrowRightLeft className="w-5 h-5" />} label="Pending Handoffs" value={pendingHandoffs.length} color="yellow" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Agents Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-500" />
            Agents
          </h2>
          {data.agents.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No agents with capability tags found</p>
          ) : (
            <div className="space-y-3">
              {data.agents.map(agent => {
                const agentTasks = data.assignments.filter(a => a.assigned_agent_id === agent.id);
                return (
                  <div key={agent.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                        {agent.name || agent.email}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {agent.capability_tags.map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agentTasks.length} assigned task{agentTasks.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Assignments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-500" />
            Current Assignments
          </h2>
          {data.assignments.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No agent assignments yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.assignments.map(assignment => (
                <div key={assignment.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {assignment.title}
                    </span>
                    <StatusBadge status={assignment.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {assignment.plans?.title || 'Unknown plan'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Handoffs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
            Recent Handoffs
          </h2>
          {data.handoffs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No handoffs yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.handoffs.map(handoff => (
                <div key={handoff.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {handoff.plan_nodes?.title || 'Task'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      handoff.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      handoff.status === 'accepted' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {handoff.status}
                    </span>
                  </div>
                  {handoff.reason && (
                    <p className="text-xs text-gray-500 mt-1">{handoff.reason}</p>
                  )}
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(handoff.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-500" />
            Recent Activity
          </h2>
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No recent activity from agents</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.recentActivity.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{log.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                      {log.log_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    not_started: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    blocked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${colors[status] || colors.not_started}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default AgentDashboard;
