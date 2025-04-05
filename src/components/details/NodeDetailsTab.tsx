import React from 'react';
import { PlanNode, NodeStatus } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/planUtils';

interface NodeDetailsTabProps {
  node: PlanNode;
  onStatusChange: (newStatus: NodeStatus) => void; // Callback to update status
}

const NodeDetailsTab: React.FC<NodeDetailsTabProps> = ({ node, onStatusChange }) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
        <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
          {node.description || <span className="italic text-gray-400">No description provided.</span>}
        </p>
      </div>

      {/* Context */}
      {node.context && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Context</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {node.context}
          </p>
        </div>
      )}

      {/* Agent Instructions */}
      {node.agent_instructions && (
         <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Agent Instructions</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {node.agent_instructions}
          </p>
        </div>
      )}

      {/* Acceptance Criteria */}
      {node.acceptance_criteria && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Acceptance Criteria</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
            {node.acceptance_criteria}
          </p>
        </div>
      )}

      {/* Status Update */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Update Status</h3>
        <div className="flex flex-wrap gap-2">
          {(['not_started', 'in_progress', 'completed', 'blocked'] as NodeStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              disabled={node.status === status}
              className={`px-2 py-1 text-xs rounded-md border disabled:cursor-not-allowed disabled:opacity-70 ${
                node.status === status
                  ? 'bg-blue-600 text-white border-blue-600' // Active state
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {getStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Metadata (Optional display) */}
       {node.metadata && Object.keys(node.metadata).length > 0 && (
         <div>
           <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Metadata</h3>
           <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
             {JSON.stringify(node.metadata, null, 2)}
           </pre>
         </div>
       )}

    </div>
  );
};

export default NodeDetailsTab; 