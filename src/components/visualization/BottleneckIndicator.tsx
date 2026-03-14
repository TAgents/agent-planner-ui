import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BottleneckNode } from '../../hooks/useBottlenecks';

interface BottleneckIndicatorProps {
  nodeId: string;
  bottlenecks: BottleneckNode[];
}

const BottleneckIndicator: React.FC<BottleneckIndicatorProps> = ({ nodeId, bottlenecks }) => {
  const bottleneck = bottlenecks.find(b => b.node_id === nodeId);
  if (!bottleneck) return null;

  const downstreamCount = bottleneck.downstream_count || bottleneck.blocked_tasks || 0;

  return (
    <span
      className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 flex-shrink-0"
      title={`Bottleneck: blocks ${downstreamCount} downstream task${downstreamCount !== 1 ? 's' : ''}`}
    >
      <AlertTriangle className="w-2.5 h-2.5" />
      {downstreamCount}
    </span>
  );
};

export default BottleneckIndicator;
