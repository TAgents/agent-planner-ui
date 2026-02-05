import React, { useState } from 'react';
import { X, Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { useCreateAgentRequest } from '../../hooks/useAgentRequests';

interface AskAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  taskId: string;
  taskTitle: string;
}

type RequestType = 'execute' | 'review' | 'plan' | 'custom';

export const AskAgentModal: React.FC<AskAgentModalProps> = ({
  isOpen,
  onClose,
  planId,
  taskId,
  taskTitle,
}) => {
  const [requestType, setRequestType] = useState<RequestType>('custom');
  const [prompt, setPrompt] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [error, setError] = useState<string | null>(null);

  const createRequest = useCreateAgentRequest(planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requestType === 'custom' && !prompt.trim()) {
      setError('Please enter a prompt for your custom request');
      return;
    }

    try {
      await createRequest.mutateAsync({
        taskId,
        data: {
          request_type: requestType,
          prompt: prompt.trim() || undefined,
          priority,
        },
      });
      onClose();
      setPrompt('');
      setRequestType('custom');
      setPriority('normal');
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ask Agent
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Task context */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Task</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {taskTitle}
            </p>
          </div>

          {/* Request type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="execute">Execute - Start working on this task</option>
              <option value="review">Review - Review current work</option>
              <option value="plan">Plan - Help break down this task</option>
              <option value="custom">Custom - Send custom prompt</option>
            </select>
          </div>

          {/* Custom prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {requestType === 'custom' ? 'Prompt (required)' : 'Additional Instructions (optional)'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder={
                requestType === 'custom'
                  ? "What would you like the agent to do?"
                  : "Any specific instructions or context..."
              }
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={priority === 'normal'}
                  onChange={() => setPriority('normal')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Normal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={priority === 'urgent'}
                  onChange={() => setPriority('urgent')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Urgent</span>
              </label>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createRequest.isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createRequest.isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskAgentModal;
