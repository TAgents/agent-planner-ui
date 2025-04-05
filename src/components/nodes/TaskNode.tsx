import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { getStatusColor } from '../../utils/planUtils';
import { PlanNode } from '../../types';

const TaskNode: React.FC<NodeProps> = ({ data }) => {
  const node: PlanNode = data.node;
  
  // Add defensive checks
  if (!node) {
    console.error('TaskNode: No node data provided');
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
  const title = node.title || 'Untitled Task';
  const status = node.status || 'not_started';
  
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="p-3 shadow-sm bg-white border border-gray-200 rounded min-w-[150px]">
        <div className="flex items-center">
          <div className={`w-3 h-3 mr-2 rounded-full ${getStatusColor(status)}`}></div>
          <div className="font-medium">{title}</div>
        </div>
        <div className="text-xs text-gray-500 mt-1">Task</div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default memo(TaskNode);
