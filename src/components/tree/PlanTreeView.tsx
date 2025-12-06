import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
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
import { PlanNode, NodeStatus } from '../../types';
import { TreeNodeItem } from './TreeNodeItem';

interface PlanTreeViewProps {
  nodes: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeStatusChange?: (nodeId: string, status: NodeStatus) => void;
  onNodeCreate?: (parentId: string | null) => void;
  onNodeMove?: (nodeId: string, newParentId: string | null, newOrderIndex?: number) => void;
  className?: string;
}

export const PlanTreeView: React.FC<PlanTreeViewProps> = ({
  nodes,
  selectedNodeId,
  onNodeSelect,
  onNodeStatusChange,
  onNodeCreate,
  onNodeMove,
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

    return (
      <div key={node.id}>
        <TreeNodeItem
          node={node}
          hasChildren={hasChildren}
          isExpanded={isExpanded}
          onToggle={handleToggleExpand}
          depth={depth}
          isSelected={isSelected}
          onSelect={onNodeSelect}
          onStatusChange={onNodeStatusChange}
          isDragging={isDragging}
          isDropTarget={isDropTarget}
          canDrag={!!onNodeMove}
        />
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
  }, [expandedNodes, selectedNodeId, getChildren, filterNode, handleToggleExpand, onNodeSelect, onNodeStatusChange, activeId, overId, canDrop, onNodeMove]);

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
      <div className={`plan-tree-view flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
        {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Plan Structure
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpandAll}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Expand All"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Collapse All"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded transition-colors ${
                showFilters || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Filters"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search nodes... (⌘F)"
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white
              transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1
                hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-2 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600
                  rounded focus:outline-none focus:ring-2 focus:ring-blue-500
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
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600
                  rounded focus:outline-none focus:ring-2 focus:ring-blue-500
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

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
            <span className="font-medium">Overall Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Done</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Active</div>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="font-semibold text-gray-600 dark:text-gray-400">
              {stats.notStarted}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Pending</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="font-semibold text-red-600 dark:text-red-400">
              {stats.blocked}
            </div>
            <div className="text-gray-500 dark:text-gray-400 text-[10px]">Blocked</div>
          </div>
        </div>
      </div>

      {/* Tree View - Optimized for performance */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {rootNodes.length > 0 ? (
          <div className="space-y-1">
            {rootNodes.map(node => renderTree(node, 0))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-300 dark:text-gray-600 text-5xl mb-3">📁</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No nodes in this plan yet</p>
            {onNodeCreate && (
              <button
                onClick={() => onNodeCreate(null)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create First Node
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {nodes.length > 0 && (
        <div className="flex-shrink-0 p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
          {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'} total
        </div>
      )}
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
