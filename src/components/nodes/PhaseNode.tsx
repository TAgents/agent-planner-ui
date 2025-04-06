import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getStatusColor } from '../../utils/planUtils';
import { PlanNode } from '../../types';

const PhaseNode: React.FC<NodeProps> = ({ data, selected }) => {
  const node: PlanNode = data.node;
  
  // Add defensive checks
  if (!node) {
    console.error('PhaseNode: No node data provided');
    return (
      <>
        <Handle type="target" position={Position.Top} />
        <div className="p-3 shadow-sm bg-red-50 border border-red-200 rounded">
          <div className="text-red-500 font-medium">Invalid Node</div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </>
    );
  }
  
  // Use fallback values for required properties
  const title = node.title || 'Untitled Phase';
  const status = node.status || 'not_started';
  
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className={`p-4 rounded min-w-[200px] ${selected ? 'bg-blue-200 border-4 border-blue-600 shadow-xl dark:bg-blue-800 dark:border-blue-400' : 'bg-blue-50 border border-blue-200 shadow-sm dark:bg-blue-900 dark:border-blue-700'}`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 mr-2 rounded-full ${getStatusColor(status)}`}></div>
          <div className="font-medium text-blue-800">{title}</div>
        </div>
        <div className="text-xs text-blue-500 mt-1">Phase</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default memo(PhaseNode);
