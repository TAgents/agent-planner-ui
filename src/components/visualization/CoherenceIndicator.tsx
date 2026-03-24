import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { CoherenceStatus } from '../../types';

interface CoherenceIndicatorProps {
  status?: CoherenceStatus;
  showLabel?: boolean;
}

const config: Record<string, { icon: typeof CheckCircle; label: string; classes: string }> = {
  coherent: {
    icon: CheckCircle,
    label: 'Coherent',
    classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  stale_beliefs: {
    icon: AlertCircle,
    label: 'Stale',
    classes: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  contradiction_detected: {
    icon: XCircle,
    label: 'Conflict',
    classes: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  },
};

const CoherenceIndicator: React.FC<CoherenceIndicatorProps> = ({ status, showLabel = false }) => {
  if (!status || status === 'unchecked') return null;

  const cfg = config[status];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0 ${cfg.classes}`}
      title={`Coherence: ${cfg.label}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {showLabel && <span>{cfg.label}</span>}
    </span>
  );
};

export default CoherenceIndicator;
