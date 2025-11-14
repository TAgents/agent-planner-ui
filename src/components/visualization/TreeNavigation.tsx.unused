import React, { useState } from 'react';
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
  Circle
} from 'lucide-react';
import { PlanNode } from '../../types';

interface TreeNavigationProps {
  nodes: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
}

interface TreeNodeProps {
  node: PlanNode;
  children: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  level: number;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
    case 'in_progress': return <Clock className="w-3.5 h-3.5 text-blue-500" />;
    case 'blocked': return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    default: return <Circle className="w-3.5 h-3.5 text-gray-400" />;
  }
};

const getNodeIcon = (type: string, isExpanded: boolean) => {
  switch (type) {
    case 'phase': 
      return isExpanded ? 
        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" /> : 
        <Folder className="w-3.5 h-3.5 text-indigo-500" />;
    case 'milestone': 
      return <Flag className="w-3.5 h-3.5 text-purple-500" />;
    default: 
      return <FileText className="w-3.5 h-3.5 text-gray-500" />;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ 
  node, 
  children, 
  selectedNodeId, 
  onNodeSelect, 
  level 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = children.length > 0;
  
  return (
    <div>
      <div
        className={`
          flex items-center gap-1 py-1 px-2 rounded-md cursor-pointer transition-colors
          ${selectedNodeId === node.id 
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onNodeSelect(node.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? 
              <ChevronDown className="w-3 h-3" /> : 
              <ChevronRight className="w-3 h-3" />
            }
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {getNodeIcon(node.node_type, isExpanded)}
          <span className="text-xs font-medium truncate flex-1">
            {node.title}
          </span>
          {getStatusIcon(node.status)}
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              children={children.filter(n => n.parent_id === child.id)}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeNavigation: React.FC<TreeNavigationProps> = ({ 
  nodes, 
  selectedNodeId, 
  onNodeSelect 
}) => {
  // Build tree structure
  const rootNodes = nodes.filter(n => !n.parent_id || n.node_type === 'root');
  
  const getChildren = (parentId: string): PlanNode[] => {
    return nodes.filter(n => n.parent_id === parentId);
  };
  
  // Calculate statistics
  const stats = {
    total: nodes.length,
    completed: nodes.filter(n => n.status === 'completed').length,
    inProgress: nodes.filter(n => n.status === 'in_progress').length,
    blocked: nodes.filter(n => n.status === 'blocked').length,
  };
  
  const progress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;
  
  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header with stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Plan Structure
        </h3>
        
        {/* Progress bar */}
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
        
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-semibold text-green-600 dark:text-green-400">
              {stats.completed}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Done</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              {stats.inProgress}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Active</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600 dark:text-red-400">
              {stats.blocked}
            </div>
            <div className="text-gray-500 dark:text-gray-400">Blocked</div>
          </div>
        </div>
      </div>
      
      {/* Tree view */}
      <div className="flex-1 overflow-y-auto p-2">
        {rootNodes.length > 0 ? (
          rootNodes.map(node => (
            <TreeNode
              key={node.id}
              node={node}
              children={getChildren(node.id)}
              selectedNodeId={selectedNodeId}
              onNodeSelect={onNodeSelect}
              level={0}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            No nodes in this plan yet
          </div>
        )}
      </div>
    </div>
  );
};

export default TreeNavigation;
