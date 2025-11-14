import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  Search,
  Filter,
  ChevronUp,
  Layers,
  Eye,
  EyeOff,
  MessageSquare,
  Paperclip,
  Calendar,
  MoreVertical,
  Plus,
  Edit2,
  Trash2,
  Copy,
  X
} from 'lucide-react';
import { PlanNode, NodeStatus } from '../../types';

interface ImprovedTreeNavigationProps {
  nodes: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeStatusChange?: (nodeId: string, status: NodeStatus) => void;
  onNodeCreate?: (parentId: string | null) => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  viewMode?: 'compact' | 'detailed';
}

interface TreeNodeProps {
  node: PlanNode;
  children: PlanNode[];
  level: number;
  selectedNodeId?: string | null;
  expandedNodes: Set<string>;
  onNodeSelect: (nodeId: string) => void;
  onToggleExpand: (nodeId: string) => void;
  onStatusChange?: (nodeId: string, status: NodeStatus) => void;
  onNodeCreate?: (parentId: string | null) => void;
  onNodeEdit?: (nodeId: string) => void;
  onNodeDelete?: (nodeId: string) => void;
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  allNodes: PlanNode[];
  viewMode: 'compact' | 'detailed';
}

// Utility functions
const getStatusIcon = (status: string, size: string = 'w-4 h-4') => {
  switch (status) {
    case 'completed': 
      return <CheckCircle className={`${size} text-green-500`} />;
    case 'in_progress': 
      return <Clock className={`${size} text-blue-500 animate-pulse`} />;
    case 'blocked': 
      return <AlertCircle className={`${size} text-red-500`} />;
    default: 
      return <Circle className={`${size} text-gray-400`} />;
  }
};

const getNodeIcon = (type: string, isExpanded: boolean, size: string = 'w-4 h-4') => {
  switch (type) {
    case 'root':
      return isExpanded ? 
        <FolderOpen className={`${size} text-purple-600`} /> : 
        <Folder className={`${size} text-purple-600`} />;
    case 'phase': 
      return isExpanded ? 
        <FolderOpen className={`${size} text-indigo-500`} /> : 
        <Folder className={`${size} text-indigo-500`} />;
    case 'milestone': 
      return <Flag className={`${size} text-purple-500`} />;
    default: 
      return <FileText className={`${size} text-gray-500`} />;
  }
};

const highlightText = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? 
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">{part}</mark> : 
          part
      )}
    </>
  );
};

const calculateProgress = (node: PlanNode, allNodes: PlanNode[]): number => {
  const children = allNodes.filter(n => n.parent_id === node.id);
  if (children.length === 0) {
    return node.status === 'completed' ? 100 : node.status === 'in_progress' ? 50 : 0;
  }
  
  const completedCount = children.filter(c => c.status === 'completed').length;
  return Math.round((completedCount / children.length) * 100);
};

// Tree Node Component
const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  children, 
  level,
  selectedNodeId, 
  expandedNodes,
  onNodeSelect, 
  onToggleExpand,
  onStatusChange,
  onNodeCreate,
  onNodeEdit,
  onNodeDelete,
  searchTerm,
  statusFilter,
  typeFilter,
  allNodes,
  viewMode
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const hasChildren = children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedNodeId === node.id;
  const nodeRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to selected node
  useEffect(() => {
    if (isSelected && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isSelected]);
  
  // Filter logic
  const matchesSearch = !searchTerm || 
    node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
  const matchesStatus = statusFilter === 'all' || node.status === statusFilter;
  const matchesType = typeFilter === 'all' || node.node_type === typeFilter;
  
  // Show node if it matches or if any of its children match
  const shouldShowNode = matchesSearch && matchesStatus && matchesType;
  const hasMatchingChildren = children.some(child => {
    const childMatches = (!searchTerm || 
      child.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || child.status === statusFilter) &&
      (typeFilter === 'all' || child.node_type === typeFilter);
    return childMatches;
  });
  
  if (!shouldShowNode && !hasMatchingChildren) {
    return null;
  }
  
  const progress = calculateProgress(node, allNodes);
  
  return (
    <div className="tree-node-container">
      <div
        ref={nodeRef}
        className={`
          tree-node flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer
          transition-all duration-200 group
          ${isSelected 
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 shadow-sm ring-1 ring-blue-400' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          ${node.status === 'blocked' ? 'border-l-2 border-red-500' : ''}
          ${!shouldShowNode ? 'opacity-50' : ''}
        `}
        style={{ 
          paddingLeft: `${level * 20 + 8}px`,
          opacity: node.status === 'completed' ? 0.8 : 1
        }}
        onClick={() => shouldShowNode && onNodeSelect(node.id)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowStatusMenu(false);
        }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(node.id);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? 
              <ChevronDown className="w-3.5 h-3.5" /> : 
              <ChevronRight className="w-3.5 h-3.5" />
            }
          </button>
        ) : (
          <div className="w-5" />
        )}
        
        {/* Node Icon */}
        <div className="flex-shrink-0">
          {getNodeIcon(node.node_type, isExpanded)}
        </div>
        
        {/* Node Content */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {/* Title */}
          <span className={`
            font-medium truncate flex-1
            ${node.node_type === 'root' ? 'text-base font-semibold' : ''}
            ${node.node_type === 'phase' ? 'text-sm font-semibold' : ''}
            ${node.node_type === 'task' ? 'text-sm' : ''}
            ${node.node_type === 'milestone' ? 'text-sm italic' : ''}
          `}>
            {highlightText(node.title, searchTerm)}
          </span>
          
          {/* Progress Bar for Phases */}
          {node.node_type === 'phase' && hasChildren && viewMode === 'detailed' && (
            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  progress === 100 ? 'bg-green-500' :
                  progress > 0 ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            {/* Status Icon */}
            {getStatusIcon(node.status, 'w-3.5 h-3.5')}
            
            {/* Due Date */}
            {node.due_date && viewMode === 'detailed' && (
              <div className="flex items-center gap-0.5">
                <Calendar className="w-3 h-3" />
                <span className="hidden lg:inline">
                  {new Date(node.due_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
            
            {/* Comments/Artifacts */}
            {viewMode === 'detailed' && (
              <>
                {(node.comment_count ?? 0) > 0 && (
                  <div className="flex items-center gap-0.5">
                    <MessageSquare className="w-3 h-3" />
                    <span>{node.comment_count}</span>
                  </div>
                )}
                {(node.artifact_count ?? 0) > 0 && (
                  <div className="flex items-center gap-0.5">
                    <Paperclip className="w-3 h-3" />
                    <span>{node.artifact_count}</span>
                  </div>
                )}
              </>
            )}
            
            {/* Quick Actions */}
            {showActions && onStatusChange && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusMenu(!showStatusMenu);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    title="Change Status"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                  
                  {showStatusMenu && (
                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        {(['not_started', 'in_progress', 'completed', 'blocked'] as NodeStatus[]).map(status => (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStatusChange(node.id, status);
                              setShowStatusMenu(false);
                            }}
                            className={`
                              w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700
                              flex items-center gap-2
                              ${node.status === status ? 'bg-gray-50 dark:bg-gray-700' : ''}
                            `}
                          >
                            {getStatusIcon(status, 'w-3 h-3')}
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="tree-children">
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              children={allNodes.filter(n => n.parent_id === child.id)}
              level={level + 1}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onNodeSelect={onNodeSelect}
              onToggleExpand={onToggleExpand}
              onStatusChange={onStatusChange}
              onNodeCreate={onNodeCreate}
              onNodeEdit={onNodeEdit}
              onNodeDelete={onNodeDelete}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              allNodes={allNodes}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Component
const ImprovedTreeNavigation: React.FC<ImprovedTreeNavigationProps> = ({ 
  nodes, 
  selectedNodeId, 
  onNodeSelect,
  onNodeStatusChange,
  onNodeCreate,
  onNodeEdit,
  onNodeDelete,
  viewMode = 'detailed'
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Build tree structure
  const rootNodes = nodes.filter(n => !n.parent_id || n.node_type === 'root');
  
  // Calculate statistics
  const stats = useMemo(() => ({
    total: nodes.length,
    completed: nodes.filter(n => n.status === 'completed').length,
    inProgress: nodes.filter(n => n.status === 'in_progress').length,
    blocked: nodes.filter(n => n.status === 'blocked').length,
  }), [nodes]);
  
  const progress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
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
      let currentNode = nodes.find(n => n.id === selectedNodeId);
      
      while (currentNode?.parent_id) {
        nodesToExpand.add(currentNode.parent_id);
        currentNode = nodes.find(n => n.id === currentNode?.parent_id);
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
  
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Plan Structure
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExpandAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Expand All"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Collapse All"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1 rounded ${
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
            className="w-full pl-9 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5
                hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="space-y-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                  rounded focus:outline-none focus:ring-1 focus:ring-blue-500 
                  dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 
                  rounded focus:outline-none focus:ring-1 focus:ring-blue-500 
                  dark:bg-gray-800 dark:text-white"
              >
                <option value="all">All</option>
                <option value="phase">Phases</option>
                <option value="task">Tasks</option>
                <option value="milestone">Milestones</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Done</div>
          </div>
          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <div className="font-semibold text-red-600 dark:text-red-400">
              {stats.blocked}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Blocked</div>
          </div>
        </div>
      </div>
      
      {/* Tree View */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {rootNodes.length > 0 ? (
          rootNodes.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              children={nodes.filter(n => n.parent_id === node.id)}
              level={0}
              selectedNodeId={selectedNodeId}
              expandedNodes={expandedNodes}
              onNodeSelect={onNodeSelect}
              onToggleExpand={handleToggleExpand}
              onStatusChange={onNodeStatusChange}
              onNodeCreate={onNodeCreate}
              onNodeEdit={onNodeEdit}
              onNodeDelete={onNodeDelete}
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              allNodes={nodes}
              viewMode={viewMode}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            <Folder className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>No nodes in this plan yet</p>
            {onNodeCreate && (
              <button
                onClick={() => onNodeCreate(null)}
                className="mt-3 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                  transition-colors flex items-center gap-1 mx-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                Create First Node
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedTreeNavigation;
