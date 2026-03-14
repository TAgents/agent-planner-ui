import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle,
  CornerDownRight,
  Clock,
  Bot,
  ShieldCheck,
  Inbox,
  X,
  Send,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface PendingDecision {
  node_id: string;
  plan_id: string;
  title: string;
  plan_title: string;
  type: 'plan_ready' | 'agent_request';
  agent_request_message?: string;
  created_at: string;
  context_summary?: string;
}

interface DecisionQueueProps {
  decisions: PendingDecision[];
  onApprove?: (decision: PendingDecision) => void;
  onRedirect?: (decision: PendingDecision, instructions: string) => void;
}

// ============================================================================
// Helpers
// ============================================================================

const getAgeDays = (dateStr: string): number => {
  try {
    const created = new Date(dateStr);
    if (isNaN(created.getTime())) return 0;
    return (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  } catch {
    return 0;
  }
};

const safeFormatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '';
  }
};

// ============================================================================
// DecisionCard Sub-component
// ============================================================================

const DecisionCard: React.FC<{
  decision: PendingDecision;
  onApprove?: (decision: PendingDecision) => void;
  onRedirect?: (decision: PendingDecision, instructions: string) => void;
}> = ({ decision, onApprove, onRedirect }) => {
  const [showRedirectInput, setShowRedirectInput] = useState(false);
  const [redirectText, setRedirectText] = useState('');

  const ageDays = getAgeDays(decision.created_at);
  const borderColor = ageDays > 1
    ? 'border-l-red-400'
    : 'border-l-amber-400';

  const handleRedirectSubmit = () => {
    if (redirectText.trim() && onRedirect) {
      onRedirect(decision, redirectText.trim());
      setRedirectText('');
      setShowRedirectInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRedirectSubmit();
    }
    if (e.key === 'Escape') {
      setShowRedirectInput(false);
      setRedirectText('');
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-l-[3px] ${borderColor} overflow-hidden`}
    >
      <div className="p-4">
        {/* Header: title + plan name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/app/plans/${decision.plan_id}?node=${decision.node_id}`}
              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate block"
            >
              {decision.title}
            </Link>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate block mt-0.5">
              {decision.plan_title}
            </span>
          </div>

          {/* Badge */}
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
              decision.type === 'agent_request'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}
          >
            {decision.type === 'agent_request' ? (
              <><Bot className="w-3 h-3" /> Agent Request</>
            ) : (
              <><ShieldCheck className="w-3 h-3" /> Review Required</>
            )}
          </span>
        </div>

        {/* Message / description */}
        {decision.type === 'agent_request' && decision.agent_request_message ? (
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 bg-gray-50 dark:bg-gray-900/50 rounded p-2 border border-gray-100 dark:border-gray-700/50">
            {decision.agent_request_message}
          </p>
        ) : decision.type === 'plan_ready' ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Review required before implementation
          </p>
        ) : null}

        {decision.context_summary && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-3 line-clamp-2">
            {decision.context_summary}
          </p>
        )}

        {/* Timestamp + actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {safeFormatDate(decision.created_at)}
          </span>

          <div className="flex items-center gap-2">
            {!showRedirectInput && (
              <>
                <button
                  onClick={() => setShowRedirectInput(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 rounded-md transition-colors"
                >
                  <CornerDownRight className="w-3 h-3" />
                  Redirect
                </button>
                <button
                  onClick={() => onApprove?.(decision)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 rounded-md transition-colors"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>

        {/* Redirect input */}
        {showRedirectInput && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              value={redirectText}
              onChange={(e) => setRedirectText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New instructions for the agent..."
              autoFocus
              className="flex-1 px-2.5 py-1.5 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <button
              onClick={handleRedirectSubmit}
              disabled={!redirectText.trim()}
              className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setShowRedirectInput(false); setRedirectText(''); }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// DecisionQueue Component
// ============================================================================

const DecisionQueue: React.FC<DecisionQueueProps> = ({
  decisions,
  onApprove,
  onRedirect,
}) => {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-10">
        <Inbox className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No decisions pending
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Agents are operating autonomously
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decisions.map((decision) => (
        <DecisionCard
          key={`${decision.plan_id}-${decision.node_id}`}
          decision={decision}
          onApprove={onApprove}
          onRedirect={onRedirect}
        />
      ))}
    </div>
  );
};

export default DecisionQueue;
