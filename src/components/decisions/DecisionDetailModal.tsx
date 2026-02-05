import React, { useState } from 'react';
import { X, AlertTriangle, Check, Star, Loader2 } from 'lucide-react';
import { Decision, useResolveDecision, useCancelDecision } from '../../hooks/useDecisions';
import { formatDateTime } from '../../utils/dateUtils';

interface DecisionDetailModalProps {
  decision: Decision;
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  onDecisionMade?: () => void;
}

export const DecisionDetailModal: React.FC<DecisionDetailModalProps> = ({
  decision,
  planId,
  isOpen,
  onClose,
  onDecisionMade,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(
    decision.options?.find(o => o.is_recommended)?.id
  );
  const [decisionText, setDecisionText] = useState('');
  const [rationale, setRationale] = useState('');
  
  const resolveDecision = useResolveDecision(planId);
  const cancelDecision = useCancelDecision(planId);

  const isBlocking = decision.urgency === 'blocking';
  const hasOptions = decision.options && decision.options.length > 0;

  const handleResolve = async () => {
    if (!decisionText.trim()) return;
    
    try {
      await resolveDecision.mutateAsync({
        decisionId: decision.id,
        data: {
          decision: decisionText,
          rationale: rationale || undefined,
          selected_option_id: selectedOptionId,
        },
      });
      onDecisionMade?.();
      onClose();
    } catch (error) {
      console.error('Failed to resolve decision:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await cancelDecision.mutateAsync(decision.id);
      onDecisionMade?.();
      onClose();
    } catch (error) {
      console.error('Failed to cancel decision:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isBlocking ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {isBlocking ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-sm">?</span>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {decision.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requested {formatDateTime(decision.created_at)}
                  {decision.requester && ` by ${decision.requester.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Context */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Context
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {decision.context}
            </p>
          </div>

          {/* Options (if any) */}
          {hasOptions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
                Options
              </h3>
              <div className="space-y-3">
                {decision.options!.map(option => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOptionId(option.id)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedOptionId === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                        ${selectedOptionId === option.id
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }
                      `}>
                        {selectedOptionId === option.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.title}
                          </span>
                          {option.is_recommended && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                              <Star className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                        </div>
                        {option.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {option.description}
                          </p>
                        )}
                        {(option.pros?.length || option.cons?.length) && (
                          <div className="flex gap-4 mt-2 text-xs">
                            {option.pros && option.pros.length > 0 && (
                              <div>
                                <span className="text-green-600 dark:text-green-400 font-medium">Pros:</span>
                                <ul className="mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                                  {option.pros.map((pro, i) => (
                                    <li key={i}>+ {pro}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {option.cons && option.cons.length > 0 && (
                              <div>
                                <span className="text-red-600 dark:text-red-400 font-medium">Cons:</span>
                                <ul className="mt-1 space-y-0.5 text-gray-600 dark:text-gray-400">
                                  {option.cons.map((con, i) => (
                                    <li key={i}>- {con}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decision Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Your Decision *
            </label>
            <textarea
              value={decisionText}
              onChange={(e) => setDecisionText(e.target.value)}
              placeholder="What did you decide?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          {/* Rationale Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Rationale <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Why did you make this decision? (helps with future reference)"
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={handleCancel}
            disabled={cancelDecision.isLoading}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelDecision.isLoading ? 'Cancelling...' : 'Cancel Request'}
          </button>
          <button
            onClick={handleResolve}
            disabled={!decisionText.trim() || resolveDecision.isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resolveDecision.isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit Decision
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionDetailModal;
