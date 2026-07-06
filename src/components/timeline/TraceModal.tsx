import React, { useEffect } from 'react';
import { TraceView } from './TraceView';

export interface TraceModalProps {
  correlationId: string;
  onClose: () => void;
}

/**
 * Modal wrapper around TraceView — opens the full Execution Trace for one run
 * in context (from a "view trace" affordance on any timeline entry). Closes on
 * backdrop click or Escape.
 */
export const TraceModal: React.FC<TraceModalProps> = ({ correlationId, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl min-w-0 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 text-xl leading-none text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          ×
        </button>
        <div className="max-h-[80vh] overflow-y-auto p-5">
          <TraceView correlationId={correlationId} />
        </div>
      </div>
    </div>
  );
};

export default TraceModal;
