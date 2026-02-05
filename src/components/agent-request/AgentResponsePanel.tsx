import React from 'react';
import { Play, Eye, Lightbulb, MessageSquare, Clock, Bot } from 'lucide-react';
import { AgentRequest } from '../../hooks/useAgentRequests';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface AgentResponsePanelProps {
  request: AgentRequest;
}

const requestTypeLabels: Record<string, { label: string; icon: React.ElementType }> = {
  execute: { label: 'Execution Request', icon: Play },
  review: { label: 'Review Request', icon: Eye },
  plan: { label: 'Planning Request', icon: Lightbulb },
  custom: { label: 'Custom Request', icon: MessageSquare },
};

export const AgentResponsePanel: React.FC<AgentResponsePanelProps> = ({ request }) => {
  const typeInfo = requestTypeLabels[request.request_type] || requestTypeLabels.custom;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <TypeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {typeInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatDistanceToNow(request.created_at)}</span>
          </div>
        </div>
        
        {/* Original prompt if custom */}
        {request.prompt && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-600">
            <span className="font-medium">Prompt: </span>
            {request.prompt}
          </div>
        )}
      </div>

      {/* Response */}
      <div className="p-3 bg-white dark:bg-gray-900">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Agent Response
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {request.response ? (
                request.response
              ) : (
                <p className="text-gray-500 italic">No response content</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completed timestamp */}
      {request.completed_at && (
        <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Completed {formatDistanceToNow(request.completed_at)}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentResponsePanel;
