import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PlanNode, NodeStatus } from '../../types';
import { StatusBadge, getNextStatus } from './StatusBadge';
import {
  GripVertical, Plus, ArrowUp, ArrowDown, ChevronRight,
  Layers, CheckSquare, Flag, FolderOpen, Folder,
  Bot, MessageSquare
} from 'lucide-react';
import BottleneckIndicator from '../visualization/BottleneckIndicator';
import CoherenceIndicator from '../visualization/CoherenceIndicator';
import { BottleneckNode } from '../../hooks/useBottlenecks';

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
  /** Number of upstream (blocking) dependencies */
  upstreamCount?: number;
  /** Number of downstream (blocked by this) dependencies */
  downstreamCount?: number;
  /** Bottleneck analysis data */
  bottlenecks?: BottleneckNode[];
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
  canDrag = true,
  upstreamCount = 0,
  downstreamCount = 0,
  bottlenecks = [],
}) => {
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
  const isPhaseOrRoot = node.node_type === 'phase' || node.node_type === 'root';

  const getNodeTypeStyle = () => {
    switch (node.node_type) {
      case 'root':
        return 'text-gray-900 dark:text-white text-sm font-semibold tracking-tight';
      case 'phase':
        return 'text-gray-900 dark:text-gray-100 text-sm font-semibold tracking-tight';
      case 'task':
        return 'text-gray-700 dark:text-gray-300 text-sm';
      case 'milestone':
        return 'text-gray-600 dark:text-gray-400 text-sm font-medium';
      default:
        return 'text-gray-700 dark:text-gray-300 text-sm';
    }
  };

  // Get Lucide icon for node type
  const getNodeTypeIcon = () => {
    const iconClass = 'w-4 h-4 flex-shrink-0';
    switch (node.node_type) {
      case 'root':
        return <Folder className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
      case 'phase':
        return hasChildren && isExpanded
          ? <FolderOpen className={`${iconClass} text-blue-500 dark:text-blue-400`} />
          : <Layers className={`${iconClass} text-blue-500 dark:text-blue-400`} />;
      case 'task':
        return <CheckSquare className={`${iconClass} text-gray-400 dark:text-gray-500`} />;
      case 'milestone':
        return <Flag className={`${iconClass} text-amber-500 dark:text-amber-400`} />;
      default:
        return <CheckSquare className={`${iconClass} text-gray-400 dark:text-gray-500`} />;
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
      data-node-id={node.id}
      className={`
        group flex items-center gap-2 py-1.5 px-3 rounded-lg transition-all duration-150 cursor-pointer
        border-l-2
        ${isSelected
          ? 'bg-blue-50/80 dark:bg-blue-500/10 border-l-blue-500 dark:border-l-blue-400'
          : isPhaseOrRoot
            ? 'border-l-transparent hover:bg-gray-50/80 dark:hover:bg-white/[0.03] hover:border-l-gray-300 dark:hover:border-l-gray-600'
            : 'border-l-transparent hover:bg-gray-50/60 dark:hover:bg-white/[0.02]'
        }
        ${node.status === 'blocked' ? '!border-l-red-500 dark:!border-l-red-400' : ''}
        ${isDragging ? 'opacity-40 scale-[0.98]' : ''}
        ${isOver && isDropTarget ? 'ring-1 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5' : ''}
        ${isOver && !isDropTarget ? 'ring-1 ring-red-500/50 bg-red-50/50 dark:bg-red-500/5' : ''}
      `}
      style={style}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
    >
      {/* Drag Handle */}
      {canDrag && (
        <div
          {...listeners}
          {...attributes}
          className={`drag-handle flex-shrink-0 cursor-grab active:cursor-grabbing transition-opacity duration-150 ${
            isHovered ? 'opacity-60' : 'opacity-0'
          }`}
          title="Drag to move"
        >
          <GripVertical className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600" />
        </div>
      )}

      {/* Expand/Collapse Arrow */}
      {hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
          className="flex-shrink-0 p-0.5 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          </motion.div>
        </button>
      ) : (
        <div className="w-4" />
      )}

      {/* Node Type Icon */}
      {getNodeTypeIcon()}

      {/* Status Badge */}
      <StatusBadge
        status={node.status}
        compact
        onClick={onStatusChange ? () => onStatusChange(node.id, getNextStatus(node.status)) : undefined}
      />

      {/* Task Mode Badge */}
      {node.task_mode && node.task_mode !== 'free' && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${
            node.task_mode === 'research'
              ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400'
              : node.task_mode === 'plan'
              ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
          }`}
          title={`Task mode: ${node.task_mode}`}
        >
          {node.task_mode === 'research' ? 'R' : node.task_mode === 'plan' ? 'P' : 'I'}
        </span>
      )}

      {/* Title */}
      <span className={`${getNodeTypeStyle()} flex-grow truncate`} title={node.title}>
        {node.title}
      </span>

      {/* Bottleneck Indicator */}
      {bottlenecks.length > 0 && (
        <BottleneckIndicator nodeId={node.id} bottlenecks={bottlenecks} />
      )}

      {/* BDI Coherence Indicator */}
      <CoherenceIndicator status={node.coherence_status} />

      {/* Agent Indicator */}
      {node.assigned_agent_id && (
        <span className="flex items-center gap-0.5 flex-shrink-0" title="Agent assigned">
          <Bot className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
        </span>
      )}

      {/* Dependency Indicators */}
      {(upstreamCount > 0 || downstreamCount > 0) && (
        <div className="flex items-center gap-0.5 flex-shrink-0" title={`${upstreamCount} upstream, ${downstreamCount} downstream dependencies`}>
          {upstreamCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
              <ArrowUp className="w-2.5 h-2.5" />
              {upstreamCount}
            </span>
          )}
          {downstreamCount > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
              <ArrowDown className="w-2.5 h-2.5" />
              {downstreamCount}
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      {node.due_date && (
        <span className="text-[11px] text-gray-400 dark:text-gray-500 hidden lg:inline flex-shrink-0 tabular-nums">
          {formatDate(node.due_date)}
        </span>
      )}

      {/* Comment count */}
      {(node.comment_count ?? 0) > 0 && (
        <div className="flex items-center gap-0.5 text-[11px] text-gray-400 dark:text-gray-500 flex-shrink-0">
          <MessageSquare className="w-3 h-3" />
          <span>{node.comment_count}</span>
        </div>
      )}

      {/* Add Child Button */}
      {canAddChildren && onAddChild && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddChild(node.id);
          }}
          className={`
            p-0.5 rounded-md transition-all duration-150 flex-shrink-0
            text-gray-400 hover:text-blue-500 hover:bg-blue-50
            dark:hover:text-blue-400 dark:hover:bg-blue-500/10
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}
          title="Add task"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      )}
    </motion.div>
  );
};
