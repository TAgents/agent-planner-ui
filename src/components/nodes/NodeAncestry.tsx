import React from 'react';
import { MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNodeAncestry } from '../../hooks/useNodeContext';

interface NodeAncestryProps {
  planId: string;
  nodeId: string;
  className?: string;
  onNavigateToNode?: (nodeId: string) => void;
}

const NodeAncestry: React.FC<NodeAncestryProps> = ({ 
  planId, 
  nodeId, 
  className = '',
  onNavigateToNode 
}) => {
  const { data: ancestry, isLoading, error } = useNodeAncestry(planId, nodeId);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        </div>
      </div>
    );
  }

  if (error || !ancestry || ancestry.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      
      {ancestry.map((node: any, index: number) => (
        <React.Fragment key={node.id}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          )}
          
          <button
            onClick={() => onNavigateToNode?.(node.id)}
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate ${
              index === ancestry.length - 1
                ? 'text-gray-900 dark:text-white font-medium cursor-default'
                : 'text-gray-500 dark:text-gray-400 hover:underline'
            }`}
            disabled={index === ancestry.length - 1}
          >
            {node.title}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default NodeAncestry;