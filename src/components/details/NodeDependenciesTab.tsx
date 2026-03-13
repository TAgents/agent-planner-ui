import React, { useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  GitBranch,
  Loader,
  AlertTriangle,
  Plus,
  Trash2,
  Link2,
} from 'lucide-react';
import { Dependency, DependencyType, PlanNode } from '../../types';
import { useNodeDependencies, useDependencies } from '../../hooks/useDependencies';

interface NodeDependenciesTabProps {
  planId: string;
  nodeId: string;
  nodeTitle: string;
  /** All nodes in the plan, used for the add dependency UI */
  allNodes?: PlanNode[];
}

const depTypeLabels: Record<DependencyType, { label: string; color: string }> = {
  blocks: { label: 'blocks', color: 'text-red-600 dark:text-red-400' },
  requires: { label: 'requires', color: 'text-blue-600 dark:text-blue-400' },
  relates_to: { label: 'relates to', color: 'text-gray-600 dark:text-gray-400' },
};

const DependencyItem: React.FC<{
  dep: Dependency;
  direction: 'upstream' | 'downstream';
  onDelete?: (depId: string) => void;
  resolvedTitle?: string;
}> = ({ dep, direction, onDelete, resolvedTitle }) => {
  const typeConfig = depTypeLabels[dep.dependency_type] || depTypeLabels.blocks;
  const rawTitle = direction === 'upstream' ? dep.source_title : dep.node_title;
  const title = rawTitle || resolvedTitle || (direction === 'upstream' ? dep.source_node_id : dep.target_node_id);

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0 group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
      {direction === 'upstream' ? (
        <ArrowUp className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-800 dark:text-gray-200 truncate">
          {title}
        </p>
        <p className={`text-[10px] ${typeConfig.color}`}>
          {direction === 'upstream'
            ? `${typeConfig.label} this node`
            : `this node ${typeConfig.label}`}
        </p>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(dep.id)}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all"
          title="Remove dependency"
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      )}
    </div>
  );
};

const NodeDependenciesTab: React.FC<NodeDependenciesTabProps> = ({
  planId,
  nodeId,
  nodeTitle,
  allNodes = [],
}) => {
  const { upstream, downstream, isLoading, error } = useNodeDependencies(planId, nodeId);
  const { createDependency, deleteDependency } = useDependencies(planId);

  const resolveNodeName = (nodeId: string) => {
    const node = allNodes.find(n => n.id === nodeId);
    return node?.title || nodeId.slice(0, 8) + '...';
  };

  // Quick-add dependency state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddDirection, setQuickAddDirection] = useState<'upstream' | 'downstream'>('upstream');
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedDepType, setSelectedDepType] = useState<DependencyType>('blocks');

  const handleDelete = (depId: string) => {
    if (window.confirm('Remove this dependency?')) {
      deleteDependency.mutate(depId);
    }
  };

  const handleQuickAdd = () => {
    if (!selectedTargetId) return;

    if (quickAddDirection === 'upstream') {
      // Selected node blocks this node
      createDependency.mutate({
        source_node_id: selectedTargetId,
        target_node_id: nodeId,
        dependency_type: selectedDepType,
      });
    } else {
      // This node blocks selected node
      createDependency.mutate({
        source_node_id: nodeId,
        target_node_id: selectedTargetId,
        dependency_type: selectedDepType,
      });
    }

    setShowQuickAdd(false);
    setSelectedTargetId('');
    setSelectedDepType('blocks');
  };

  // Filter available nodes for quick-add (exclude self and root nodes)
  const availableNodes = allNodes.filter(n => n.id !== nodeId && n.node_type !== 'root');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-5 h-5 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading dependencies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-8 text-center">
        <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load dependencies</p>
      </div>
    );
  }

  const totalDeps = upstream.length + downstream.length;

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300">
            {totalDeps} {totalDeps === 1 ? 'dependency' : 'dependencies'}
          </span>
        </div>
        <button
          onClick={() => { setShowQuickAdd(!showQuickAdd); setQuickAddDirection('upstream'); }}
          className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Quick-add form */}
      {showQuickAdd && (
        <div className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200/80 dark:border-gray-800/80 space-y-2">
          <div className="flex gap-1.5">
            <button
              onClick={() => setQuickAddDirection('upstream')}
              className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                quickAddDirection === 'upstream'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ArrowUp className="w-3 h-3 inline mr-1" />
              Blocks me
            </button>
            <button
              onClick={() => setQuickAddDirection('downstream')}
              className={`flex-1 px-2 py-1 text-[11px] font-medium rounded transition-colors ${
                quickAddDirection === 'downstream'
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <ArrowDown className="w-3 h-3 inline mr-1" />
              I block
            </button>
          </div>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="">Select a node...</option>
            {availableNodes.map(n => (
              <option key={n.id} value={n.id}>{n.title}</option>
            ))}
          </select>
          <select
            value={selectedDepType}
            onChange={(e) => setSelectedDepType(e.target.value as DependencyType)}
            className="w-full px-2 py-1 text-[11px] border border-gray-200 dark:border-gray-700 rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="blocks">Blocks</option>
            <option value="requires">Requires</option>
            <option value="relates_to">Relates to</option>
          </select>
          <div className="flex gap-1.5">
            <button
              onClick={handleQuickAdd}
              disabled={!selectedTargetId || createDependency.isLoading}
              className="flex-1 px-2 py-1 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 rounded transition-colors"
            >
              {createDependency.isLoading ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowQuickAdd(false)}
              className="px-2 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Upstream (Blocks me) */}
      <div>
        <h5 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <ArrowUp className="w-3 h-3 text-red-400" />
          Blocks this node ({upstream.length})
        </h5>
        {upstream.length > 0 ? (
          <div>
            {upstream.map(dep => (
              <DependencyItem
                key={dep.id}
                dep={dep}
                direction="upstream"
                onDelete={handleDelete}
                resolvedTitle={resolveNodeName(dep.source_node_id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-5">
            No upstream blockers
          </p>
        )}
      </div>

      {/* Downstream (I block) */}
      <div>
        <h5 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3 text-blue-400" />
          Blocked by this node ({downstream.length})
        </h5>
        {downstream.length > 0 ? (
          <div>
            {downstream.map(dep => (
              <DependencyItem
                key={dep.id}
                dep={dep}
                direction="downstream"
                onDelete={handleDelete}
                resolvedTitle={resolveNodeName(dep.target_node_id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic pl-5">
            No downstream dependents
          </p>
        )}
      </div>

      {/* Empty state */}
      {totalDeps === 0 && !showQuickAdd && (
        <div className="text-center py-6">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">
            No dependencies defined
          </p>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="text-[11px] text-blue-500 dark:text-blue-400 hover:underline"
          >
            + Add first dependency
          </button>
        </div>
      )}
    </div>
  );
};

export default NodeDependenciesTab;
