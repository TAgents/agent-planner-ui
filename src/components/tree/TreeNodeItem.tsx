import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PlanNode, NodeStatus } from '../../types';
import { StatusBadge } from './StatusBadge';
import { GripVertical, Plus } from 'lucide-react';

interface TreeNodeItemProps {
  node: PlanNode;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  depth: number;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onStatusChange?: (nodeId: string, status: NodeStatus) => void;
  onAddChild?: (parentId: string) => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  canDrag?: boolean;
}

export const TreeNodeItem: React.FC<TreeNodeItemProps> = ({
  node,
  hasChildren,
  isExpanded,
  onToggle,
  depth,
  isSelected,
  onSelect,
  onStatusChange,
  onAddChild,
  isDragging = false,
  isDropTarget = false,
  canDrag = true
}) => {
  // Check if this node type can have children added
  const canAddChildren = node.node_type === 'phase' || node.node_type === 'root';
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Setup draggable
  const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
    id: node.id,
    disabled: !canDrag,
  });

  // Setup droppable
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: node.id,
  });

  // Auto-scroll to selected node
  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);

  // Calculate indentation
  const indentPx = depth * 24;

  // Get node type specific styling
  const getNodeTypeStyle = () => {
    switch (node.node_type) {
      case 'root':
        return 'text-gray-900 dark:text-white text-base font-semibold';
      case 'phase':
        return 'text-gray-900 dark:text-white text-base font-semibold';
      case 'task':
        return 'text-gray-800 dark:text-gray-200 text-sm';
      case 'milestone':
        return 'text-gray-700 dark:text-gray-300 text-sm italic';
      default:
        return 'text-gray-800 dark:text-gray-200 text-sm';
    }
  };

  // Get icon for node type
  const getNodeTypeIcon = () => {
    switch (node.node_type) {
      case 'root':
        return '📁';
      case 'phase':
        return hasChildren && isExpanded ? '📂' : '📁';
      case 'task':
        return '📄';
      case 'milestone':
        return '🏁';
      default:
        return '📄';
    }
  };

  // Format date
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return null;
    }
  };

  // Combine refs using callback ref pattern
  const setRefs = useCallback((element: HTMLDivElement | null) => {
    // Use a mutable object instead of directly assigning to nodeRef.current
    if (element) {
      (nodeRef as any).current = element;
    }
    setDragRef(element);
    setDropRef(element);
  }, [setDragRef, setDropRef]);

  // Apply transform from drag
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    paddingLeft: `${indentPx + 12}px`
  } : {
    paddingLeft: `${indentPx + 12}px`
  };

  return (
    <motion.div
      ref={setRefs}
      className={`
        flex items-center gap-2 py-2 px-3 rounded-lg transition-all cursor-pointer
        ${isSelected
          ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-400 dark:ring-blue-600'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        ${node.status === 'blocked' ? 'border-l-4 border-red-500' : ''}
        ${isDragging ? 'opacity-50' : ''}
        ${isOver && isDropTarget ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''}
        ${isOver && !isDropTarget ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : ''}
      `}
      style={style}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Drag Handle */}
      {canDrag && (
        <div
          {...listeners}
          {...attributes}
          className={`drag-handle flex-shrink-0 cursor-grab active:cursor-grabbing transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      )}

      {/* Expand/Collapse Arrow */}
      {hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className="flex-shrink-0 text-gray-400 text-sm transition-transform duration-200 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-block"
          >
            ▶
          </motion.span>
        </button>
      ) : (
        <div className="w-4" />
      )}

      {/* Node Type Icon */}
      <span className="text-base flex-shrink-0" role="img" aria-label={node.node_type}>
        {getNodeTypeIcon()}
      </span>

      {/* Status Badge */}
      <StatusBadge status={node.status} compact />

      {/* Title */}
      <span className={`${getNodeTypeStyle()} flex-grow truncate`}>
        {node.title}
      </span>

      {/* Assignee - TODO: Add when assignment feature is implemented */}

      {/* MCP Badge - Show if this node has MCP-related metadata */}
      {node.metadata && (node.metadata as any).isMCP && (
        <span
          className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded flex items-center gap-1 flex-shrink-0"
          title="AI Agent via Model Context Protocol"
        >
          <span>🤖</span>
          <span className="hidden md:inline">MCP</span>
        </span>
      )}

      {/* Due Date */}
      {node.due_date && (
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline flex-shrink-0">
          {formatDate(node.due_date)}
        </span>
      )}

      {/* Activity indicators */}
      {(node.comment_count ?? 0) > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          <span className="flex items-center gap-0.5" title={`${node.comment_count} comments`}>
            💬 {node.comment_count}
          </span>
        </div>
      )}

      {/* Add Child Button - only show for phases/root on hover */}
      {canAddChildren && onAddChild && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          className={`
            p-1 rounded transition-all flex-shrink-0
            text-gray-400 hover:text-blue-600 hover:bg-blue-50 
            dark:hover:text-blue-400 dark:hover:bg-blue-900/30
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};
