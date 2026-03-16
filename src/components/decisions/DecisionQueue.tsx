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
  ChevronDown,
  ChevronUp,
  Star,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface DecisionOption {
  option: string;
  pros?: string[];
  cons?: string[];
  recommendation?: boolean;
}

export interface PendingDecision {
  node_id: string;
  plan_id: string;
  title: string;
  plan_title: string;
  type: 'plan_ready' | 'agent_request';
  agent_request_message?: string;
  created_at: string;
  context_summary?: string;
  options?: DecisionOption[];
}

interface DecisionQueueProps {
  decisions: PendingDecision[];
  onApprove?: (decision: PendingDecision, selectedOption?: string) => void;
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
// OptionCard Sub-component
// ============================================================================

const OptionCard: React.FC<{
  option: DecisionOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
}> = ({ option, index, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full text-left rounded-lg border p-3 transition-all duration-150 ${
      selected
        ? 'border-emerald-400 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 ring-1 ring-emerald-400/30'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
    }`}
  >
    <div className="flex items-start gap-2 mb-1.5">
      <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 ${
        selected
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
      }`}>
        {selected ? '✓' : index + 1}
      </span>
      <span className="text-sm font-medium text-gray-900 dark:text-white flex-1">
        {option.option}
      </span>
      {option.recommendation && (
        <span className="flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
          <Star className="w-2.5 h-2.5" /> Recommended
        </span>
      )}
    </div>

    {(option.pros?.length || option.cons?.length) ? (
      <div className="ml-7 grid grid-cols-2 gap-2 mt-2">
        {option.pros && option.pros.length > 0 && (
          <div>
            {option.pros.map((pro, i) => (
              <div key={i} className="flex items-start gap-1 text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">
                <ThumbsUp className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{pro}</span>
              </div>
            ))}
          </div>
        )}
        {option.cons && option.cons.length > 0 && (
          <div>
            {option.cons.map((con, i) => (
              <div key={i} className="flex items-start gap-1 text-[11px] text-gray-600 dark:text-gray-400 mb-0.5">
                <ThumbsDown className="w-2.5 h-2.5 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{con}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ) : null}
  </button>
);

// ============================================================================
// DecisionCard Sub-component
// ============================================================================

const DecisionCard: React.FC<{
  decision: PendingDecision;
  onApprove?: (decision: PendingDecision, selectedOption?: string) => void;
  onRedirect?: (decision: PendingDecision, instructions: string) => void;
}> = ({ decision, onApprove, onRedirect }) => {
  const [expanded, setExpanded] = useState(false);
  const [showRedirectInput, setShowRedirectInput] = useState(false);
  const [redirectText, setRedirectText] = useState('');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    // Pre-select the recommended option
    decision.options?.findIndex(o => o.recommendation) ?? null
  );

  const ageDays = getAgeDays(decision.created_at);
  const borderColor = ageDays > 1 ? 'border-l-red-400' : 'border-l-amber-400';
  const hasOptions = decision.options && decision.options.length > 0;
  const hasContent = decision.agent_request_message || hasOptions;

  const handleRedirectSubmit = () => {
    if (redirectText.trim() && onRedirect) {
      onRedirect(decision, redirectText.trim());
      setRedirectText('');
      setShowRedirectInput(false);
    }
  };

  const handleApprove = () => {
    const selectedOption = selectedOptionIndex !== null && decision.options
      ? decision.options[selectedOptionIndex]?.option
      : undefined;
    onApprove?.(decision, selectedOption);
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
      {/* Collapsed header — always visible, clickable to expand */}
      <button
        onClick={() => hasContent && setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start justify-between gap-2"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {decision.title}
            </span>
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
          <div className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
            <span>{decision.plan_title}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {safeFormatDate(decision.created_at)}
            </span>
            {hasOptions && (
              <>
                <span>·</span>
                <span>{decision.options!.length} options</span>
              </>
            )}
          </div>
        </div>
        {hasContent && (
          <span className="flex-shrink-0 p-1 text-gray-400 dark:text-gray-500">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50 pt-3 space-y-3">
          {/* Full context */}
          {decision.agent_request_message && (
            <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-100 dark:border-gray-700/50 whitespace-pre-wrap">
              {decision.agent_request_message}
            </div>
          )}

          {/* Options */}
          {hasOptions && (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Select an option
              </p>
              {decision.options!.map((opt, i) => (
                <OptionCard
                  key={i}
                  option={opt}
                  index={i}
                  selected={selectedOptionIndex === i}
                  onSelect={() => setSelectedOptionIndex(i)}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <Link
              to={`/app/plans/${decision.plan_id}${decision.node_id ? `?node=${decision.node_id}` : ''}`}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              View in plan →
            </Link>

            <div className="flex items-center gap-2">
              {!showRedirectInput && (
                <>
                  <button
                    onClick={() => setShowRedirectInput(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 rounded-md transition-colors"
                  >
                    <CornerDownRight className="w-3 h-3" />
                    Redirect
                  </button>
                  <button
                    onClick={handleApprove}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-md transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {hasOptions && selectedOptionIndex !== null
                      ? `Approve #${selectedOptionIndex + 1}`
                      : 'Approve'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Redirect input */}
          {showRedirectInput && (
            <div className="flex items-center gap-2">
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
      )}

      {/* Quick actions when collapsed — only if no options to review */}
      {!expanded && !hasOptions && (
        <div className="px-4 pb-3 flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(true); setShowRedirectInput(true); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/50 rounded-md transition-colors"
          >
            <CornerDownRight className="w-3 h-3" />
            Redirect
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onApprove?.(decision); }}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 rounded-md transition-colors"
          >
            <CheckCircle className="w-3 h-3" />
            Approve
          </button>
        </div>
      )}
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
