import React, { useState, useEffect } from 'react';
import { Bot, X, ChevronDown, Loader2, Tag } from 'lucide-react';
import api from '../../services/api';

interface Agent {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  capability_tags?: string[];
}

interface AgentAssignmentProps {
  planId: string;
  nodeId: string;
  assignedAgentId?: string | null;
  onAssigned?: () => void;
}

const AgentAssignment: React.FC<AgentAssignmentProps> = ({ planId, nodeId, assignedAgentId, onAssigned }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (assignedAgentId) {
      // Fetch agent info
      loadAssignedAgent();
    } else {
      setAssignedAgent(null);
    }
  }, [assignedAgentId]);

  const loadAssignedAgent = async () => {
    try {
      const result = await api.nodes.getSuggestedAgents(planId, nodeId);
      const agent = result.agents.find((a: Agent) => a.id === assignedAgentId);
      if (agent) setAssignedAgent(agent);
    } catch (err) {
      // silent
    }
  };

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const result = await api.nodes.getSuggestedAgents(planId, nodeId);
      setAgents(result.agents || []);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) loadSuggestions();
  };

  const handleAssign = async (agentId: string) => {
    try {
      setAssigning(true);
      await api.nodes.assignAgent(planId, nodeId, agentId);
      const agent = agents.find(a => a.id === agentId);
      if (agent) setAssignedAgent(agent);
      setIsOpen(false);
      onAssigned?.();
    } catch (err) {
      // silent
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    try {
      setAssigning(true);
      await api.nodes.unassignAgent(planId, nodeId);
      setAssignedAgent(null);
      onAssigned?.();
    } catch (err) {
      // silent
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 text-sm">
        <Bot className="w-4 h-4 text-purple-500" />
        <span className="text-gray-500 dark:text-gray-400 font-medium">Agent:</span>
        
        {assignedAgent ? (
          <div className="flex items-center gap-2">
            <span className="text-gray-900 dark:text-white font-medium">
              {assignedAgent.name || assignedAgent.email}
            </span>
            {assignedAgent.capability_tags && assignedAgent.capability_tags.length > 0 && (
              <div className="flex gap-1">
                {assignedAgent.capability_tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={handleUnassign}
              disabled={assigning}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Unassign agent"
            >
              {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
            </button>
          </div>
        ) : (
          <button
            onClick={handleOpen}
            className="flex items-center gap-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            <span>Assign agent</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No agents with capability tags found
            </div>
          ) : (
            agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => handleAssign(agent.id)}
                disabled={assigning || agent.id === assignedAgentId}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {agent.name || agent.email}
                </div>
                {agent.capability_tags && agent.capability_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {agent.capability_tags.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AgentAssignment;
