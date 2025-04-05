// src/components/nodes/TaskNode.tsx
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
    getStatusColor,
    getNodeTypeIcon,
    getDueDateStatus,
    getDueDateIconAndColor
} from '../../utils/planUtils';
import { PlanNode } from '../../types';
import { MessageSquare, ScrollText, FileText } from 'lucide-react'; // Icons for indicators

const TaskNode: React.FC<NodeProps> = ({ data }) => {
  // Add defensive check for node data
  if (!data || !data.node) {
    console.error('TaskNode: Invalid or missing node data provided in props:', data);
    // Render a fallback error node
    return (
      <>
        <Handle type="target" position={Position.Top} isConnectable={false} />
        <div className="p-3 shadow-sm bg-red-100 border-2 border-red-400 rounded-lg min-w-[150px]">
          <div className="text-red-700 font-semibold">Error: Invalid Node Data</div>
        </div>
        <Handle type="source" position={Position.Bottom} isConnectable={false} />
      </>
    );
  }

  const node: PlanNode = data.node;
  const title = node.title || 'Untitled Task';
  const status = node.status || 'not_started';
  const NodeTypeIcon = getNodeTypeIcon(node.node_type);
  const dueDateStatus = getDueDateStatus(node.due_date);
  const DueDateInfo = getDueDateIconAndColor(dueDateStatus);

  // Placeholder for content indicators - replace with real data later
  const hasComments = false; // TODO: Replace with real data, e.g., node.comment_count > 0
  const hasLogs = false; // TODO: Replace with real data, e.g., node.log_count > 0
  const hasArtifacts = false; // TODO: Replace with real data, e.g., node.artifact_count > 0

  return (
    <>
      {/* Handles should allow connections */}
      <Handle type="target" position={Position.Top} id="top" isConnectable={true} />
      <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={true} />
      {/* Optional: Add left/right handles if needed */}
      {/* <Handle type="target" position={Position.Left} id="left" isConnectable={true} /> */}
      {/* <Handle type="source" position={Position.Right} id="right" isConnectable={true} /> */}

      {/* Node Content - Use background/border from style prop */}
      <div className="p-3 rounded-md shadow-sm min-w-[180px] text-gray-900 dark:text-white">
        {/* Top Row: Status, Type Icon, Due Date */}
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center">
                <div className={`w-3 h-3 mr-2 rounded-full ${getStatusColor(status)}`}></div>
                {NodeTypeIcon && <NodeTypeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
           </div>
           {DueDateInfo && (
             <div className={`flex items-center ${DueDateInfo.color}`}>
               <DueDateInfo.Icon className="w-4 h-4" />
             </div>
           )}
        </div>

        {/* Middle Row: Title */}
        <div className="font-semibold text-sm mb-2 break-words">
            {title}
        </div>

        {/* Bottom Row: Node Type Text, Indicators */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{node.node_type.charAt(0).toUpperCase() + node.node_type.slice(1)}</span>
            <div className="flex space-x-1.5">
                {/* TODO: Replace 'true' with actual checks like node.comment_count > 0 */}
                {hasComments && <div title="Has comments"><MessageSquare className="w-3 h-3" /></div>}
                {hasLogs && <div title="Has logs"><ScrollText className="w-3 h-3" /></div>}
                {hasArtifacts && <div title="Has artifacts"><FileText className="w-3 h-3" /></div>}
            </div>
        </div>
      </div>
    </>
  );
};

export default memo(TaskNode);