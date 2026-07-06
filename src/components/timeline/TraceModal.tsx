import React, { useEffect } from 'react';
import { TraceView } from './TraceView';
import { IconButton } from '../v1';

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
        className="relative w-full min-w-0 max-w-2xl rounded-xl border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-3 top-3 z-10">
          <IconButton onClick={onClose} aria-label="Close">×</IconButton>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-5">
          <TraceView correlationId={correlationId} />
        </div>
      </div>
    </div>
  );
};

export default TraceModal;
