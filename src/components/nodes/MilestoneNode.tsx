import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getStatusColor } from '../../utils/planUtils';
import { PlanNode } from '../../types';

const MilestoneNode: React.FC<NodeProps> = ({ data }) => {
  const node: PlanNode = data.node;
  
  // Add defensive checks
  if (!node) {
    console.error('MilestoneNode: No node data provided');
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
  const title = node.title || 'Untitled Milestone';
  const status = node.status || 'not_started';
  
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="p-4 shadow-md bg-purple-50 border-2 border-purple-200 rounded min-w-[220px]">
        <div className="flex items-center">
          <div className={`w-4 h-4 mr-2 rounded-full ${getStatusColor(status)}`}></div>
          <div className="font-medium text-purple-800">{title}</div>
        </div>
        <div className="text-xs text-purple-500 mt-1">Milestone</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default memo(MilestoneNode);
