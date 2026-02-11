import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Check, X, Loader2, MessageSquare, Clock, Send } from 'lucide-react';
import { handoffApi } from '../../services/api';
import api from '../../services/api';

interface Handoff {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  context?: string;
  reason?: string;
  notes?: string;
  created_at: string;
  resolved_at?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  capability_tags?: string[];
}

interface HandoffPanelProps {
  planId: string;
  nodeId: string;
}

const HandoffPanel: React.FC<HandoffPanelProps> = ({ planId, nodeId }) => {
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [reason, setReason] = useState('');
  const [context, setContext] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHandoffs();
  }, [planId, nodeId]);

  const loadHandoffs = async () => {
    try {
      setLoading(true);
      const data = await handoffApi.getForNode(planId, nodeId);
      setHandoffs(data || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const result = await api.nodes.getSuggestedAgents(planId, nodeId);
      setAgents(result.agents || []);
    } catch (err) {
      // silent
    }
  };

  const handleOpenForm = () => {
    setShowForm(true);
    loadAgents();
  };

  const handleSubmit = async () => {
    if (!selectedAgent) return;
    try {
      setSubmitting(true);
      await handoffApi.create(planId, nodeId, {
        to_agent_id: selectedAgent,
        reason: reason || undefined,
        context: context || undefined,
      });
      setShowForm(false);
      setSelectedAgent('');
      setReason('');
      setContext('');
      loadHandoffs();
    } catch (err) {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const handleRespond = async (handoffId: string, action: 'accepted' | 'rejected') => {
    try {
      await handoffApi.respond(handoffId, action);
      loadHandoffs();
    } catch (err) {
      // silent
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    accepted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading handoffs...
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-indigo-500" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Handoffs</h4>
          {handoffs.length > 0 && (
            <span className="text-xs text-gray-500">({handoffs.length})</span>
          )}
        </div>
        {!showForm && (
          <button
            onClick={handleOpenForm}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            + New Handoff
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-3">
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select target agent...</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>
                {a.name || a.email} {a.capability_tags?.length ? `(${a.capability_tags.join(', ')})` : ''}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason for handoff..."
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <textarea
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Context / notes for the receiving agent..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAgent || submitting}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Send Handoff
            </button>
          </div>
        </div>
      )}

      {handoffs.length === 0 && !showForm ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic">No handoffs for this task</p>
      ) : (
        <div className="space-y-2">
          {handoffs.map(h => (
            <div key={h.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[h.status]}`}>
                  {h.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(h.created_at).toLocaleDateString()}
                </span>
              </div>
              {h.reason && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  <strong>Reason:</strong> {h.reason}
                </p>
              )}
              {h.context && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-start gap-1">
                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {h.context}
                </p>
              )}
              {h.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                  Response: {h.notes}
                </p>
              )}
              {h.status === 'pending' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRespond(h.id, 'accepted')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded hover:bg-green-200"
                  >
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button
                    onClick={() => handleRespond(h.id, 'rejected')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded hover:bg-red-200"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HandoffPanel;
