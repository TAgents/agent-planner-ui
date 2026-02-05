import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, Play, Eye, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { useCreateAgentRequest, useTaskAgentRequests } from '../../hooks/useAgentRequests';
import { AskAgentModal } from './AskAgentModal';
import { AgentRequestStatus } from './AgentRequestStatus';

interface AskAgentButtonProps {
  planId: string;
  taskId: string;
  taskTitle: string;
  compact?: boolean;
}

const requestTypes = [
  { id: 'execute', label: 'Start this task', icon: Play, description: 'Request agent to execute the task' },
  { id: 'review', label: 'Review this task', icon: Eye, description: 'Request agent to review current work' },
  { id: 'plan', label: 'Help me plan this', icon: Lightbulb, description: 'Request agent to break down the task' },
  { id: 'custom', label: 'Custom request...', icon: MessageSquare, description: 'Send a custom prompt' },
] as const;

export const AskAgentButton: React.FC<AskAgentButtonProps> = ({
  planId,
  taskId,
  taskTitle,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: requests, isLoading: loadingRequests } = useTaskAgentRequests(planId, taskId);
  const createRequest = useCreateAgentRequest(planId);

  // Find the most recent pending/in_progress request
  const activeRequest = requests?.find(r => r.status === 'pending' || r.status === 'in_progress');
  const latestCompletedRequest = requests?.find(r => r.status === 'completed');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRequestType = async (type: typeof requestTypes[number]['id']) => {
    if (type === 'custom') {
      setShowModal(true);
      setIsOpen(false);
      return;
    }

    try {
      await createRequest.mutateAsync({
        taskId,
        data: { request_type: type },
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to create agent request:', error);
    }
  };

  // If there's an active request, show status instead of button
  if (activeRequest) {
    return <AgentRequestStatus request={activeRequest} />;
  }

  // If there's a completed request, show option to view or make new request
  if (latestCompletedRequest && !compact) {
    return (
      <div className="flex items-center gap-2">
        <AgentRequestStatus request={latestCompletedRequest} />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="New request"
          >
            <Bot className="w-4 h-4" />
          </button>
          {isOpen && (
            <DropdownMenu
              requestTypes={requestTypes}
              onSelect={handleRequestType}
              isLoading={createRequest.isLoading}
            />
          )}
        </div>
        <AskAgentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          planId={planId}
          taskId={taskId}
          taskTitle={taskTitle}
        />
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={createRequest.isLoading || loadingRequests}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            bg-indigo-50 dark:bg-indigo-900/30 
            text-indigo-700 dark:text-indigo-300
            hover:bg-indigo-100 dark:hover:bg-indigo-900/50
            border border-indigo-200 dark:border-indigo-700
            transition-colors text-sm font-medium
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {createRequest.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
          {!compact && <span>Ask Agent</span>}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <DropdownMenu
            requestTypes={requestTypes}
            onSelect={handleRequestType}
            isLoading={createRequest.isLoading}
          />
        )}
      </div>

      <AskAgentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        planId={planId}
        taskId={taskId}
        taskTitle={taskTitle}
      />
    </>
  );
};

// Dropdown menu component
const DropdownMenu: React.FC<{
  requestTypes: typeof requestTypes;
  onSelect: (type: typeof requestTypes[number]['id']) => void;
  isLoading: boolean;
}> = ({ requestTypes, onSelect, isLoading }) => (
  <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
    {requestTypes.map((type) => {
      const Icon = type.icon;
      return (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          disabled={isLoading}
          className="w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50"
        >
          <Icon className="w-4 h-4 mt-0.5 text-gray-500 dark:text-gray-400" />
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {type.label}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {type.description}
            </div>
          </div>
        </button>
      );
    })}
  </div>
);

export default AskAgentButton;
