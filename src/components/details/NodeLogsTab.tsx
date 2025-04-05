import React, { useState } from 'react';
import { useNodeLogs } from '../../hooks/useNodeLogs';
import { Log } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { Info, AlertTriangle, CheckCircle, Lightbulb, History } from 'lucide-react'; // Icons for log types

interface NodeLogsTabProps {
  planId: string;
  nodeId: string;
}

const getLogIcon = (logType: Log['log_type']) => {
    switch(logType) {
        case 'progress': return History;
        case 'reasoning': return Lightbulb;
        case 'challenge': return AlertTriangle;
        case 'decision': return CheckCircle;
        default: return Info;
    }
}

const NodeLogsTab: React.FC<NodeLogsTabProps> = ({ planId, nodeId }) => {
  const { logs, isLoading, error, addLogEntry, isAddingLog } = useNodeLogs(planId, nodeId);
  const [newLogContent, setNewLogContent] = useState('');
  const [newLogType, setNewLogType] = useState<Log['log_type']>('reasoning');

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogContent.trim()) return;
    addLogEntry({ content: newLogContent, log_type: newLogType }, {
        onSuccess: () => {
            setNewLogContent('');
            setNewLogType('reasoning'); // Reset type
        }
    });
  };

  if (isLoading) return <div className="p-4 text-center">Loading logs...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading logs.</div>;

  return (
    <div className="space-y-4">
      {/* Add Log Form */}
       <form onSubmit={handleAddLog} className="mt-4 space-y-2 p-3 border rounded dark:border-gray-600">
         <h4 className="text-xs font-medium mb-2">Add Log Entry</h4>
         <textarea
            value={newLogContent}
            onChange={(e) => setNewLogContent(e.target.value)}
            rows={3}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            placeholder="Log content..."
            disabled={isAddingLog}
         />
         <div className="flex items-center justify-between">
            <select
                value={newLogType}
                onChange={(e) => setNewLogType(e.target.value as Log['log_type'])}
                disabled={isAddingLog}
                className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 text-xs"
            >
                <option value="progress">Progress</option>
                <option value="reasoning">Reasoning</option>
                <option value="challenge">Challenge</option>
                <option value="decision">Decision</option>
            </select>
             <button
                type="submit"
                disabled={isAddingLog || !newLogContent.trim()}
                className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs"
            >
                {isAddingLog ? 'Adding...' : 'Add Log'}
            </button>
         </div>
      </form>

      {/* Logs List */}
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-6 border-t pt-4 dark:border-gray-700">
        Existing Logs ({logs.length})
      </h3>
      {logs.length > 0 ? (
        <ul className="space-y-3">
          {logs.map((log: Log) => {
            const LogIcon = getLogIcon(log.log_type);
            return (
                <li key={log.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm">
                  <div className="flex items-start space-x-2 mb-1">
                     <LogIcon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0"/>
                     <p className="text-gray-800 dark:text-gray-200 flex-grow">{log.content}</p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between items-center pl-6">
                     <span className='font-medium'>{log.user?.name || 'System/Unknown'} ({log.log_type})</span>
                     <span>{formatDate(log.created_at)}</span>
                  </div>
                </li>
            )
            })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No logs yet.</p>
      )}
    </div>
  );
};

export default NodeLogsTab;