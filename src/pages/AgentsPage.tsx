import React from 'react';
import { useQuery } from 'react-query';
import { agentService } from '../services/agentService';

interface Agent {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'unhealthy';
  capabilities: Array<{
    name: string;
    description: string;
  }>;
  metadata?: {
    lastHeartbeat?: string;
    registeredAt?: string;
  };
}

const AgentsPage: React.FC = () => {
  const {
    data: agents,
    isLoading,
    error,
    refetch,
  } = useQuery<Agent[]>('agents', () => agentService.getAgents(), {
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Agents</h3>
          <p className="text-red-600">
            Failed to load agents. Make sure the Agent Registry is running on port 5000.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasAgents = agents && agents.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agents</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            View agents that have worked on your plans
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Empty State */}
      {!hasAgents && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Agents Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Agents will appear here once they start working on your plans. Make sure the Agent
              Registry is running and agents have been registered.
            </p>
          </div>
        </div>
      )}

      {/* Agents Grid */}
      {hasAgents && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {agent.id.substring(0, 8)}...
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    agent.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : agent.status === 'unhealthy'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {/* Agent URL */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">URL:</span> {agent.url}
                </p>
              </div>

              {/* Capabilities */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Capabilities:
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities && agent.capabilities.length > 0 ? (
                    agent.capabilities.slice(0, 3).map((cap: any, idx) => {
                      // Handle malformed capability data where name might be an object
                      const capName = typeof cap.name === 'string' ? cap.name : (cap.name?.name || 'Unknown');
                      const capDesc = typeof cap.description === 'string' ? cap.description : (cap.name?.description || '');

                      return (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded"
                          title={capDesc}
                        >
                          {capName}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400">No capabilities</span>
                  )}
                  {agent.capabilities && agent.capabilities.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      +{agent.capabilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Last Seen */}
              {agent.metadata?.lastHeartbeat && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last seen:{' '}
                    {new Date(agent.metadata.lastHeartbeat).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {hasAgents && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Agents</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{agents.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Agents</p>
            <p className="text-2xl font-bold text-green-600">
              {agents.filter((a) => a.status === 'active').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unhealthy Agents</p>
            <p className="text-2xl font-bold text-red-600">
              {agents.filter((a) => a.status === 'unhealthy').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;
