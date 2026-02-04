import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { PlanNode } from '../../types';

interface PlanBreadcrumbProps {
  planId: string;
  planTitle: string;
  nodes: PlanNode[];
  selectedNodeId?: string | null;
  onNodeSelect: (nodeId: string) => void;
  className?: string;
}

export const PlanBreadcrumb: React.FC<PlanBreadcrumbProps> = ({
  planId,
  planTitle,
  nodes,
  selectedNodeId,
  onNodeSelect,
  className = ''
}) => {
  // Build breadcrumb path from root to selected node
  const breadcrumbPath = useMemo(() => {
    if (!selectedNodeId) return [];
    
    // Create a map for faster lookups
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    const path: PlanNode[] = [];
    let currentId: string | undefined = selectedNodeId;
    
    // Walk up the tree to build path (max 20 levels to prevent infinite loops)
    for (let i = 0; i < 20 && currentId; i++) {
      const node = nodeMap.get(currentId);
      if (!node || node.node_type === 'root') break;
      
      path.unshift(node);
      currentId = node.parent_id;
    }
    
    return path;
  }, [nodes, selectedNodeId]);

  // Don't show breadcrumb if no node is selected
  if (!selectedNodeId || breadcrumbPath.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center text-sm overflow-hidden ${className}`}
    >
      <ol className="flex items-center gap-1 min-w-0">
        {/* Plans link */}
        <li className="flex items-center flex-shrink-0">
          <Link 
            to="/app/plans" 
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plans</span>
          </Link>
        </li>

        <li className="flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </li>

        {/* Plan title */}
        <li className="flex items-center min-w-0">
          <button
            onClick={() => {
              // Deselect current node to show plan overview
              // This could also navigate to the plan root
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 truncate max-w-[100px] sm:max-w-[150px] transition-colors"
            title={planTitle}
          >
            {planTitle}
          </button>
        </li>

        {/* Path nodes */}
        {breadcrumbPath.map((node, index) => {
          const isLast = index === breadcrumbPath.length - 1;
          
          return (
            <React.Fragment key={node.id}>
              <li className="flex-shrink-0">
                <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </li>
              <li className="flex items-center min-w-0">
                {isLast ? (
                  // Current node - not clickable, styled differently
                  <span 
                    className="font-medium text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]"
                    title={node.title}
                  >
                    {node.title}
                  </span>
                ) : (
                  // Ancestor node - clickable
                  <button
                    onClick={() => onNodeSelect(node.id)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 truncate max-w-[80px] sm:max-w-[120px] transition-colors"
                    title={node.title}
                  >
                    {node.title}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default PlanBreadcrumb;
