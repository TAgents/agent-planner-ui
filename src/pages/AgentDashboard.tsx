import React, { useState, useEffect } from 'react';
import { Bot, Tag, ArrowRightLeft, ListTodo, Activity, Clock, Loader2, Users, Plus, X } from 'lucide-react';
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
  const [showRegisterModal, setShowRegisterModal] = useState(false);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Activity</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor agent assignments, handoffs, and activity</p>
          </div>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Register Agent
        </button>
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
            <div className="text-center py-12 px-4">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your AI team members</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
                Register and manage AI agents. Assign them tasks, track their work, and review their output.
              </p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
              >
                + Register Your First Agent
              </button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                💡 Tip: Connect via MCP or REST API
              </p>
            </div>
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

      {/* Register Agent Modal */}
      {showRegisterModal && (
        <RegisterAgentModal onClose={() => setShowRegisterModal(false)} onSuccess={() => { setShowRegisterModal(false); loadData(); }} />
      )}
    </div>
  );
};

const RegisterAgentModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: '',
    role: 'executor',
    description: '',
    connectionMethod: 'mcp',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/agents/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: form.name.trim(),
          capability_tags: [form.role],
          description: form.description.trim(),
          connection_method: form.connectionMethod,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to register agent');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full mx-4 shadow-xl border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Register an Agent</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Planner Pro"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="planner">Planner</option>
              <option value="executor">Executor</option>
              <option value="reviewer">Reviewer</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[80px]"
              placeholder="What does this agent do?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Connection Method</label>
            <div className="space-y-2">
              {[
                { value: 'mcp', label: 'MCP Server', desc: 'npx agent-planner-mcp' },
                { value: 'rest', label: 'REST API', desc: 'Use token auth' },
                { value: 'openclaw', label: 'OpenClaw', desc: 'Task dispatch' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                  <input
                    type="radio"
                    name="connectionMethod"
                    value={opt.value}
                    checked={form.connectionMethod === opt.value}
                    onChange={e => setForm({ ...form, connectionMethod: e.target.value })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim() || submitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Registering…' : 'Register'}
          </button>
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
