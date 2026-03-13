import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Folder,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverEvent,
} from '@dnd-kit/core';
import { PlanNode, NodeStatus, NodeType, Dependency } from '../../types';
import { TreeNodeItem } from './TreeNodeItem';
import { InlineTaskInput } from './InlineTaskInput';

interface PlanTreeViewProps {
  nodes: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeStatusChange?: (nodeId: string, status: NodeStatus) => void;
  onNodeCreate?: (parentId: string | null) => void;
  onNodeCreateInline?: (parentId: string, title: string, nodeType: NodeType) => Promise<void>;
  onNodeMove?: (nodeId: string, newParentId: string | null, newOrderIndex?: number) => void;
  /** Plan dependencies for showing indicators on tree nodes */
  dependencies?: Dependency[];
  className?: string;
}

export const PlanTreeView: React.FC<PlanTreeViewProps> = ({
  nodes,
  selectedNodeId,
  onNodeSelect,
  onNodeStatusChange,
  onNodeCreate,
  onNodeCreateInline,
  onNodeMove,
  dependencies = [],
  className = ''
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const initialExpanded = new Set<string>();
    // Expand all phase and root nodes by default
    nodes.forEach((node) => {
      if (node.node_type === 'phase' || node.node_type === 'root') {
        initialExpanded.add(node.id);
      }
    });
    return initialExpanded;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Inline task creation state
  const [addingToNodeId, setAddingToNodeId] = useState<string | null>(null);

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    })
  );

  // Build hierarchical structure
  const buildTree = useCallback((parentId: string | null = null): PlanNode[] => {
    return nodes
      .filter(node => node.parent_id === parentId || (parentId === null && (!node.parent_id || node.node_type === 'root')))
      .sort((a, b) => {
        // Sort by order_index if available, otherwise by creation date
        if (a.order_index !== undefined && b.order_index !== undefined) {
          return a.order_index - b.order_index;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }, [nodes]);

  const rootNodes = useMemo(() => buildTree(null), [buildTree]);

  // Get children for a node
  const getChildren = useCallback((nodeId: string): PlanNode[] => {
    return buildTree(nodeId);
  }, [buildTree]);

  // Filter nodes based on search and filters
  const filterNode = useCallback((node: PlanNode): boolean => {
    const matchesSearch = !searchTerm ||
      node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.description && node.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
    const matchesType = typeFilter === 'all' || node.node_type === typeFilter;

    return Boolean(matchesSearch && matchesStatus && matchesType);
  }, [searchTerm, statusFilter, typeFilter]);

  // Compute dependency counts per node (upstream = things blocking me, downstream = things I block)
  const depCounts = useMemo(() => {
    const upstream = new Map<string, number>();
    const downstream = new Map<string, number>();
    for (const dep of dependencies) {
      // target_node_id has an upstream dependency (source blocks target)
      upstream.set(dep.target_node_id, (upstream.get(dep.target_node_id) || 0) + 1);
      // source_node_id has a downstream dependent
      downstream.set(dep.source_node_id, (downstream.get(dep.source_node_id) || 0) + 1);
    }
    return { upstream, downstream };
  }, [dependencies]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: nodes.length,
    completed: nodes.filter(n => n.status === 'completed').length,
    inProgress: nodes.filter(n => n.status === 'in_progress').length,
    blocked: nodes.filter(n => n.status === 'blocked').length,
    notStarted: nodes.filter(n => n.status === 'not_started').length,
  }), [nodes]);

  const progress = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Drag validation - check if drop is valid
  const canDrop = useCallback((draggedNodeId: string, targetNodeId: string | null): boolean => {
    if (!onNodeMove) return false;
    if (draggedNodeId === targetNodeId) return false;

    const draggedNode = nodes.find(n => n.id === draggedNodeId);
    const targetNode = targetNodeId ? nodes.find(n => n.id === targetNodeId) : null;

    if (!draggedNode) return false;

    // Can't drop onto itself or its descendants
    if (targetNode) {
      let currentNode: PlanNode | null = targetNode;
      while (currentNode) {
        if (currentNode.id === draggedNodeId) return false;
        const parentId: string | undefined = currentNode.parent_id;
        currentNode = nodes.find((n): n is PlanNode => n.id === parentId) || null;
      }
    }

    // Validation rules based on node types
    if (targetNode) {
      // Phase can contain tasks and milestones (not other phases)
      if (targetNode.node_type === 'phase' && draggedNode.node_type === 'phase') {
        return false;
      }
      // Tasks and milestones can't contain children
      if (targetNode.node_type === 'task' || targetNode.node_type === 'milestone') {
        return false;
      }
    }

    return true;
  }, [nodes, onNodeMove]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Handle drag over (for visual feedback)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id as string | null;
    setOverId(overId);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over || !onNodeMove) return;

    const draggedNodeId = active.id as string;
    const targetNodeId = over.id as string;

    // Validate the drop
    if (!canDrop(draggedNodeId, targetNodeId)) {
      console.log('Invalid drop operation');
      return;
    }

    // Calculate the new parent and order
    const targetNode = nodes.find(n => n.id === targetNodeId);
    const newParentId = targetNode ? targetNode.id : null;

    // Get siblings at the new parent level to calculate order
    const siblings = nodes.filter(n => n.parent_id === newParentId);
    const newOrderIndex = siblings.length;

    console.log('Moving node:', { draggedNodeId, newParentId, newOrderIndex });
    onNodeMove(draggedNodeId, newParentId, newOrderIndex);
  }, [nodes, onNodeMove, canDrop]);

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);

  // Expand/Collapse all
  const handleExpandAll = useCallback(() => {
    const allNodeIds = new Set<string>();
    nodes.forEach(n => allNodeIds.add(n.id));
    setExpandedNodes(allNodeIds);
  }, [nodes]);

  const handleCollapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Auto-expand to show selected node
  useEffect(() => {
    if (selectedNodeId) {
      const nodesToExpand = new Set<string>();
      let currentNode: PlanNode | undefined = nodes.find(n => n.id === selectedNodeId);

      while (currentNode?.parent_id) {
        nodesToExpand.add(currentNode.parent_id);
        const parentId: string = currentNode.parent_id;
        currentNode = nodes.find((n): n is PlanNode => n.id === parentId);
      }

      if (nodesToExpand.size > 0) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          nodesToExpand.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    }
  }, [selectedNodeId, nodes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && searchTerm) {
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm]);

  // Render tree recursively
  const renderTree = useCallback((node: PlanNode, depth: number = 0): React.ReactNode => {
    const children = getChildren(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNodeId === node.id;
    const hasChildren = children.length > 0;
    const isDragging = activeId === node.id;
    const isDropTarget = overId === node.id && canDrop(activeId || '', node.id);

    // Apply filters
    if (!filterNode(node) && children.every(child => !filterNode(child))) {
      return null;
    }

    // Check if this node can have children (phases and root can)
    const canHaveChildren = node.node_type === 'phase' || node.node_type === 'root';
    const isAddingHere = addingToNodeId === node.id;

    // Handler for starting inline add
    const handleAddChild = canHaveChildren && onNodeCreateInline 
      ? (parentId: string) => {
          setAddingToNodeId(parentId);
          // Ensure the node is expanded so we can see the input
          if (!expandedNodes.has(parentId)) {
            setExpandedNodes(prev => new Set([...prev, parentId]));
          }
        }
      : undefined;

    // Handler for submitting inline task
    const handleInlineSubmit = async (title: string) => {
      if (onNodeCreateInline && addingToNodeId) {
        await onNodeCreateInline(addingToNodeId, title, 'task');
      }
    };

    return (
      <div key={node.id}>
        <TreeNodeItem
          node={node}
          hasChildren={hasChildren || isAddingHere}
          isExpanded={isExpanded || isAddingHere}
          onToggle={handleToggleExpand}
          depth={depth}
          isSelected={isSelected}
          onSelect={onNodeSelect}
          onStatusChange={onNodeStatusChange}
          onAddChild={handleAddChild}
          isDragging={isDragging}
          isDropTarget={isDropTarget}
          canDrag={!!onNodeMove}
          upstreamCount={depCounts.upstream.get(node.id) || 0}
          downstreamCount={depCounts.downstream.get(node.id) || 0}
        />
        {/* Inline task input - shown when adding to this node */}
        {isAddingHere && (
          <InlineTaskInput
            onSubmit={handleInlineSubmit}
            onCancel={() => setAddingToNodeId(null)}
            placeholder="New task title... (Enter to add, Esc to cancel)"
            depth={depth + 1}
          />
        )}
        {/* Render children recursively with animation */}
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            {children.map(child => renderTree(child, depth + 1))}
          </motion.div>
        )}
      </div>
    );
  }, [expandedNodes, selectedNodeId, getChildren, filterNode, handleToggleExpand, onNodeSelect, onNodeStatusChange, activeId, overId, canDrop, onNodeMove, addingToNodeId, onNodeCreateInline, depCounts]);

  // Get active node for drag overlay
  const activeNode = activeId ? nodes.find(n => n.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`plan-tree-view flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
        {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        {/* Top row: title + actions */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Plan Structure
            </h3>
            <span className="text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
              {stats.total} nodes
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleExpandAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Expand All"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              title="Collapse All"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded-md transition-colors ${
                showFilters || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'
              }`}
              title="Filters"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2.5">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes... (⌘F)"
            className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg
              focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
              dark:bg-gray-800 dark:text-white placeholder-gray-400
              transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5
                hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 mb-2.5 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50"
          >
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600
                  rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/50
                  dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 dark:border-gray-600
                  rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500/50
                  dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="phase">Phases</option>
                <option value="task">Tasks</option>
                <option value="milestone">Milestones</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Condensed Stats + Segmented Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.completed}</span>
              <span className="mx-1">/</span>
              <span>{stats.total} done</span>
              {stats.inProgress > 0 && (
                <span className="text-amber-500 dark:text-amber-400 ml-1.5">{stats.inProgress} active</span>
              )}
              {stats.blocked > 0 && (
                <span className="text-red-500 dark:text-red-400 ml-1.5">{stats.blocked} blocked</span>
              )}
            </span>
            <span className="text-[11px] font-semibold tabular-nums text-gray-600 dark:text-gray-300">{progress}%</span>
          </div>
          {/* Segmented progress bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
            {stats.completed > 0 && (
              <motion.div
                className="h-full bg-emerald-500 dark:bg-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.completed / stats.total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            )}
            {stats.inProgress > 0 && (
              <motion.div
                className="h-full bg-amber-400 dark:bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              />
            )}
            {stats.blocked > 0 && (
              <motion.div
                className="h-full bg-red-400 dark:bg-red-400"
                initial={{ width: 0 }}
                animate={{ width: `${(stats.blocked / stats.total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Tree View */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {rootNodes.length > 0 ? (
          <div className="space-y-0.5">
            {rootNodes.map(node => renderTree(node, 0))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Folder className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">No nodes in this plan yet</p>
            {onNodeCreate && (
              <button
                onClick={() => onNodeCreate(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Node
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Drag Overlay - Shows the dragged item */}
      <DragOverlay dropAnimation={null}>
        {activeNode && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl opacity-80 border-2 border-blue-500">
            <TreeNodeItem
              node={activeNode}
              hasChildren={false}
              isExpanded={false}
              onToggle={() => {}}
              depth={0}
              isSelected={false}
              onSelect={() => {}}
              isDragging={true}
              isDropTarget={false}
              canDrag={false}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};
