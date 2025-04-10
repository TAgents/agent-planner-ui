import React, { useState } from 'react';
import { PlanNode, NodeStatus } from '../../types';
import { formatDate, getStatusLabel } from '../../utils/planUtils';
import { Trash2, Copy } from 'lucide-react';

interface NodeDetailsTabProps {
  node: PlanNode;
  onStatusChange: (newStatus: NodeStatus) => void; // Callback to update status
  onDelete?: () => void; // Optional callback to delete the node
}

const NodeDetailsTab: React.FC<NodeDetailsTabProps> = ({ node, onStatusChange, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="space-y-6">
      {/* Node ID */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Node ID</h3>
        <div className="mt-1 flex items-center">
          <code className="text-xs bg-gray-100 dark:bg-gray-900 p-1 rounded font-mono overflow-auto flex-grow">
            {node.id}
          </code>
          <button 
            onClick={() => copyToClipboard(node.id)}
            className="ml-2 text-blue-500 hover:text-blue-700 p-1"
            title="Copy node ID"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </button>
        </div>
      </div>

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

      {/* Delete Node Button (if callback provided and not root node) */}
      {onDelete && node.node_type === 'root' && (
        <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400">
          Cannot delete root node
        </div>
      )}

      {onDelete && node.node_type !== 'root' && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDeleteClick}
            className="flex items-center justify-center w-full py-2 px-4 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:text-red-400 dark:border-red-700 dark:hover:bg-gray-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Are you sure you want to delete "{node.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NodeDetailsTab;