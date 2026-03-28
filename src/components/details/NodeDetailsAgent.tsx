/**
 * NodeDetailsAgent — Agent Instructions tab extracted from UnifiedNodeDetails.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Code2, Save, Check, Copy, Edit3 } from 'lucide-react';
import { PlanNode } from '../../types';

const formatTimeAgo = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

export interface NodeDetailsAgentProps {
  node: PlanNode;
  onUpdate?: (instructions: string) => Promise<void>;
  readOnly?: boolean;
}

const NodeDetailsAgent: React.FC<NodeDetailsAgentProps> = ({ node, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [instructions, setInstructions] = useState(node.agent_instructions || '');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInstructions(node.agent_instructions || '');
    setIsEditing(false);
  }, [node.id, node.agent_instructions]);

  useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [instructions, isEditing]);

  const handleSave = async () => {
    if (!onUpdate) return;
    setIsSaving(true);
    try {
      await onUpdate(instructions);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save agent instructions:', error);
      alert('Failed to save agent instructions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setInstructions(node.agent_instructions || '');
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(instructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (!instructions && !isEditing) {
      return (
        <div className="py-8 text-center text-gray-400 dark:text-gray-500">
          <p className="text-[11px] italic">No instructions defined</p>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-1 text-[11px] text-blue-500 dark:text-blue-400 hover:underline"
            >
              + Add
            </button>
          )}
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">Editing Instructions</span>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter instructions for AI agents..."
            className="w-full px-3 py-2 text-xs font-mono border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white resize-none"
            style={{ minHeight: '200px' }}
          />

          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || instructions === node.agent_instructions}
              className="px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center gap-1.5 transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded relative transition-colors"
            title="Copy to clipboard"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-500 dark:text-green-400" />
                <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-gray-800 dark:bg-gray-700 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg">
                  Copied!
                </span>
              </>
            ) : (
              <Copy className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          {!readOnly && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Edit instructions"
              aria-label="Edit instructions"
            >
              <Edit3 className="w-3 h-3 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        <pre className="text-xs whitespace-pre-wrap font-mono text-gray-700 dark:text-gray-300 leading-relaxed max-h-[600px] overflow-y-auto">
          {instructions}
        </pre>

        {node.updated_at && (
          <div className="text-[10px] text-gray-400 dark:text-gray-500">
            Last updated: {formatTimeAgo(node.updated_at)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-3 sm:p-4">
      {renderContent()}
    </div>
  );
};

export default NodeDetailsAgent;
