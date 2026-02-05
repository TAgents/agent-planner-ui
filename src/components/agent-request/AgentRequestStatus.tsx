import React, { useState } from 'react';
import { Clock, Bot, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentRequest } from '../../hooks/useAgentRequests';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { AgentResponsePanel } from './AgentResponsePanel';

interface AgentRequestStatusProps {
  request: AgentRequest;
  showExpanded?: boolean;
}

export const AgentRequestStatus: React.FC<AgentRequestStatusProps> = ({
  request,
  showExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showExpanded);

  const getStatusDisplay = () => {
    switch (request.status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Waiting for agent...',
          className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
          animate: true,
        };
      case 'in_progress':
        return {
          icon: Bot,
          text: 'Agent working...',
          className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
          animate: true,
        };
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Agent responded',
          className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
          animate: false,
        };
      case 'failed':
        return {
          icon: XCircle,
          text: 'Request failed',
          className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
          animate: false,
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown status',
          className: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20',
          animate: false,
        };
    }
  };

  const status = getStatusDisplay();
  const Icon = status.icon;
  const hasResponse = request.status === 'completed' && request.response;
  const hasError = request.status === 'failed' && request.error;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => (hasResponse || hasError) && setIsExpanded(!isExpanded)}
        disabled={!hasResponse && !hasError}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
          ${status.className}
          ${(hasResponse || hasError) ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
          transition-all
        `}
      >
        <Icon className={`w-3.5 h-3.5 ${status.animate ? 'animate-pulse' : ''}`} />
        <span>{status.text}</span>
        <span className="text-opacity-60">
          {formatDistanceToNow(request.created_at)}
        </span>
        {(hasResponse || hasError) && (
          isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {isExpanded && hasResponse && (
        <AgentResponsePanel request={request} />
      )}

      {isExpanded && hasError && (
        <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">
            {request.error}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentRequestStatus;
