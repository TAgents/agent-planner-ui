import React, { useState, useMemo } from 'react';
import { X, GitBranch, Search, ArrowRight } from 'lucide-react';
import { PlanNode, DependencyType, Dependency } from '../../types';

interface AddDependencyModalProps {
  nodes: PlanNode[];
  existingDependencies: Dependency[];
  onAdd: (sourceId: string, targetId: string, type: DependencyType) => void;
  onClose: () => void;
  /** If provided, pre-selects this node as the source */
  preselectedSourceId?: string;
}

const dependencyTypeConfig: Record<DependencyType, { label: string; description: string; color: string }> = {
  blocks: {
    label: 'Blocks',
    description: 'Source must complete before target can start',
    color: 'text-red-600 dark:text-red-400',
  },
  requires: {
    label: 'Requires',
    description: 'Target requires output from source',
    color: 'text-blue-600 dark:text-blue-400',
  },
  relates_to: {
    label: 'Relates to',
    description: 'Informational relationship between nodes',
    color: 'text-gray-600 dark:text-gray-400',
  },
};

const AddDependencyModal: React.FC<AddDependencyModalProps> = ({
  nodes,
  existingDependencies,
  onAdd,
  onClose,
  preselectedSourceId,
}) => {
  const [sourceId, setSourceId] = useState<string>(preselectedSourceId || '');
  const [targetId, setTargetId] = useState<string>('');
  const [depType, setDepType] = useState<DependencyType>('blocks');
  const [searchSource, setSearchSource] = useState('');
  const [searchTarget, setSearchTarget] = useState('');

  // Filter out root nodes
  const selectableNodes = useMemo(
    () => nodes.filter(n => n.node_type !== 'root'),
    [nodes]
  );

  // Check for existing dependency between source and target
  const existingDep = useMemo(() => {
    if (!sourceId || !targetId) return null;
    return existingDependencies.find(
      d =>
        (d.source_node_id === sourceId && d.target_node_id === targetId) ||
        (d.source_node_id === targetId && d.target_node_id === sourceId)
    );
  }, [sourceId, targetId, existingDependencies]);

  const isSelfLoop = sourceId && targetId && sourceId === targetId;
  const canSubmit = sourceId && targetId && !isSelfLoop && !existingDep;

  const filteredSourceNodes = useMemo(() => {
    if (!searchSource) return selectableNodes;
    const term = searchSource.toLowerCase();
    return selectableNodes.filter(n => n.title.toLowerCase().includes(term));
  }, [selectableNodes, searchSource]);

  const filteredTargetNodes = useMemo(() => {
    if (!searchTarget) return selectableNodes;
    const term = searchTarget.toLowerCase();
    return selectableNodes.filter(n => n.title.toLowerCase().includes(term));
  }, [selectableNodes, searchTarget]);

  const sourceNode = selectableNodes.find(n => n.id === sourceId);
  const targetNode = selectableNodes.find(n => n.id === targetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onAdd(sourceId, targetId, depType);
    onClose();
  };

  const nodeTypeLabel = (type: string) => {
    switch (type) {
      case 'phase': return 'Phase';
      case 'task': return 'Task';
      case 'milestone': return 'Milestone';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Dependency
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            {/* Source Node */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Source Node
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                The node that blocks, is required by, or relates to the target.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mt-2 max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {filteredSourceNodes.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { setSourceId(n.id); setSearchSource(''); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      sourceId === n.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase w-16 flex-shrink-0">
                      {nodeTypeLabel(n.node_type)}
                    </span>
                    <span className="truncate">{n.title}</span>
                  </button>
                ))}
                {filteredSourceNodes.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No nodes found
                  </div>
                )}
              </div>
            </div>

            {/* Visual connector */}
            {sourceNode && (
              <div className="flex items-center justify-center gap-3 text-sm">
                <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                  {sourceNode.title}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className={`px-3 py-1.5 rounded-lg truncate max-w-[140px] ${
                  targetNode
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    : 'bg-gray-50 dark:bg-gray-750 text-gray-400 dark:text-gray-500 border border-dashed border-gray-300 dark:border-gray-600'
                }`}>
                  {targetNode ? targetNode.title : 'Select target...'}
                </div>
              </div>
            )}

            {/* Target Node */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Target Node
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                The node that depends on or is related to the source.
              </p>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mt-2 max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {filteredTargetNodes.map(n => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => { setTargetId(n.id); setSearchTarget(''); }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                      targetId === n.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : sourceId === n.id
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    disabled={sourceId === n.id}
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 uppercase w-16 flex-shrink-0">
                      {nodeTypeLabel(n.node_type)}
                    </span>
                    <span className="truncate">{n.title}</span>
                  </button>
                ))}
                {filteredTargetNodes.length === 0 && (
                  <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    No nodes found
                  </div>
                )}
              </div>
            </div>

            {/* Dependency Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Dependency Type
              </label>
              <div className="space-y-2">
                {(Object.entries(dependencyTypeConfig) as [DependencyType, typeof dependencyTypeConfig['blocks']][]).map(
                  ([type, config]) => (
                    <label
                      key={type}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        depType === type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name="depType"
                        value={type}
                        checked={depType === type}
                        onChange={() => setDepType(type)}
                        className="mt-0.5"
                      />
                      <div>
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {config.description}
                        </p>
                      </div>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Validation messages */}
            {isSelfLoop && (
              <p className="text-sm text-red-600 dark:text-red-400">
                A node cannot depend on itself.
              </p>
            )}
            {existingDep && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                A dependency already exists between these two nodes.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Add Dependency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDependencyModal;
