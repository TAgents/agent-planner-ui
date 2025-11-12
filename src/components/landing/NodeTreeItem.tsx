import React from 'react';
import { DemoNode } from './demoPlansData';
import { StatusBadge } from './StatusBadge';

interface NodeTreeItemProps {
  node: DemoNode;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  depth?: number;
  expandedNodes: Set<string>;
}

export const NodeTreeItem: React.FC<NodeTreeItemProps> = ({
  node,
  isExpanded,
  onToggle,
  depth = 0,
  expandedNodes
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const indentClass = depth === 0 ? '' : `ml-${Math.min(depth * 6, 12)}`;

  return (
    <div className={indentClass}>
      <div
        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md transition-colors ${
          hasChildren ? 'cursor-pointer' : ''
        }`}
        onClick={() => hasChildren && onToggle(node.id)}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren && (
          <span
            className={`text-gray-400 text-sm transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          >
            ▶
          </span>
        )}

        {/* Status Icon */}
        <StatusBadge status={node.status} />

        {/* Title */}
        <span
          className={`font-medium ${
            node.type === 'phase'
              ? 'text-gray-900 text-base'
              : node.type === 'task'
              ? 'text-gray-800 text-sm'
              : 'text-gray-700 text-sm'
          } flex-grow`}
        >
          {node.title}
        </span>

        {/* Assignment */}
        {node.assignedTo && (
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
            @{node.assignedTo}
          </span>
        )}

        {/* MCP Badge */}
        {node.isMCP && (
          <span
            className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded flex items-center gap-1"
            title="AI Agent via Model Context Protocol"
          >
            <span>🤖</span>
            <span className="hidden md:inline">MCP</span>
          </span>
        )}

        {/* Due Date */}
        {node.dueDate && (
          <span className="text-xs text-gray-500 hidden lg:inline">
            {node.dueDate}
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <NodeTreeItem
              key={child.id}
              node={child}
              isExpanded={expandedNodes.has(child.id)}
              onToggle={onToggle}
              depth={depth + 1}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};
