import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  Position,
  MarkerType,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Circle,
  Loader,
  Zap,
  Plus,
  Search,
} from 'lucide-react';
import { PlanNode, Dependency, DependencyType, NodeStatus } from '../../types';
import AddDependencyModal from './AddDependencyModal';
import ImpactAnalysisOverlay from './ImpactAnalysisOverlay';

// --- Custom Node Component ---

interface TaskNodeData {
  label: string;
  node: PlanNode;
  isOnCriticalPath: boolean;
  isImpactHighlighted: boolean;
  dependencyCount: number;
  onNodeClick?: (nodeId: string) => void;
  onImpactAnalysis?: (nodeId: string, title: string) => void;
  [key: string]: unknown;
}

const statusConfig: Record<NodeStatus, { icon: React.ElementType; color: string; bg: string; border: string; accent: string }> = {
  not_started: { icon: Circle, color: 'text-gray-400', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', accent: 'border-l-gray-300 dark:border-l-gray-600' },
  in_progress: { icon: Loader, color: 'text-amber-500', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', accent: 'border-l-amber-400 dark:border-l-amber-500' },
  completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', accent: 'border-l-emerald-400 dark:border-l-emerald-500' },
  blocked: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', accent: 'border-l-red-400 dark:border-l-red-500' },
  plan_ready: { icon: Circle, color: 'text-violet-500', bg: 'bg-white dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', accent: 'border-l-violet-400 dark:border-l-violet-500' },
};

const nodeTypeLabels: Record<string, string> = {
  phase: 'Phase',
  task: 'Task',
  milestone: 'Milestone',
  root: 'Plan',
};

function TaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
  const node = data.node;
  const config = statusConfig[node.status] || statusConfig.not_started;
  const StatusIcon = config.icon;

  return (
    <div
      className={`px-4 py-3 rounded-xl border ${config.border} border-l-[3px] ${config.accent} ${config.bg} shadow-sm min-w-[200px] max-w-[280px] cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5 ${data.isOnCriticalPath ? 'ring-2 ring-amber-400/60 ring-offset-1 dark:ring-offset-gray-900' : ''} ${data.isImpactHighlighted ? 'ring-2 ring-red-400/60 ring-offset-1 animate-pulse' : ''}`}
      onClick={() => data.onNodeClick?.(node.id)}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-300 dark:!bg-gray-600 !w-2 !h-2 !border-0" />
      <div className="flex items-start gap-2.5">
        <StatusIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium mb-0.5">
            {nodeTypeLabels[node.node_type] || node.node_type}
          </div>
          <div className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-snug" title={data.label}>
            {data.label}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            {data.dependencyCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                <GitBranch className="w-3 h-3" />
                <span>{data.dependencyCount}</span>
              </div>
            )}
            {data.onImpactAnalysis && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onImpactAnalysis?.(node.id, data.label);
                }}
                className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                title="Analyze impact"
              >
                <Search className="w-3 h-3" />
                <span>Impact</span>
              </button>
            )}
          </div>
        </div>
      </div>
      {data.isOnCriticalPath && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
          <Zap className="w-3 h-3" />
          <span>Critical path</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 dark:!bg-gray-600 !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = {
  taskNode: TaskNode,
};

// --- Edge Styles ---

const edgeStyleByType: Record<DependencyType, { stroke: string; strokeDasharray?: string; animated: boolean; label: string }> = {
  blocks: { stroke: '#ef4444', animated: true, label: 'blocks' },
  requires: { stroke: '#6366f1', strokeDasharray: '6 4', animated: false, label: 'requires' },
  relates_to: { stroke: '#94a3b8', strokeDasharray: '3 3', animated: false, label: 'relates to' },
};

// --- Layout Algorithm (simple layered/Sugiyama-like) ---

function layoutNodes(
  nodes: PlanNode[],
  dependencies: Dependency[]
): { id: string; position: { x: number; y: number } }[] {
  if (nodes.length === 0) return [];

  // Build adjacency - source blocks target, so source comes before target
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // Only include nodes that are tasks, phases, or milestones (skip root)
  const relevantNodes = nodes.filter(n => n.node_type !== 'root');
  const relevantIds = new Set(relevantNodes.map(n => n.id));

  for (const n of relevantNodes) {
    inDegree.set(n.id, 0);
    adjacency.set(n.id, []);
  }

  for (const dep of dependencies) {
    if (!relevantIds.has(dep.source_node_id) || !relevantIds.has(dep.target_node_id)) continue;
    adjacency.get(dep.source_node_id)?.push(dep.target_node_id);
    inDegree.set(dep.target_node_id, (inDegree.get(dep.target_node_id) || 0) + 1);
  }

  // Topological sort to assign layers
  const layers: string[][] = [];
  const layerOf = new Map<string, number>();
  const queue: string[] = [];

  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  // Nodes with dependencies get layered by topological order
  const visited = new Set<string>();
  let currentLayer = 0;
  while (queue.length > 0) {
    const layerNodes = [...queue];
    queue.length = 0;
    if (!layers[currentLayer]) layers[currentLayer] = [];

    for (const nodeId of layerNodes) {
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      layers[currentLayer].push(nodeId);
      layerOf.set(nodeId, currentLayer);

      for (const child of adjacency.get(nodeId) || []) {
        const newDeg = (inDegree.get(child) || 1) - 1;
        inDegree.set(child, newDeg);
        if (newDeg === 0) queue.push(child);
      }
    }
    currentLayer++;
  }

  // Place unvisited nodes (no dependencies) in a separate layer
  for (const n of relevantNodes) {
    if (!visited.has(n.id)) {
      if (!layers[currentLayer]) layers[currentLayer] = [];
      layers[currentLayer].push(n.id);
      layerOf.set(n.id, currentLayer);
    }
  }

  // Assign positions
  const NODE_WIDTH = 240;
  const NODE_HEIGHT = 120;
  const HORIZONTAL_GAP = 60;
  const VERTICAL_GAP = 40;

  const positions: { id: string; position: { x: number; y: number } }[] = [];

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    if (!layer) continue;
    const totalWidth = layer.length * NODE_WIDTH + (layer.length - 1) * HORIZONTAL_GAP;
    const startX = -totalWidth / 2;

    for (let i = 0; i < layer.length; i++) {
      positions.push({
        id: layer[i],
        position: {
          x: startX + i * (NODE_WIDTH + HORIZONTAL_GAP),
          y: layerIdx * (NODE_HEIGHT + VERTICAL_GAP),
        },
      });
    }
  }

  return positions;
}

// --- Auto-fit wrapper: re-fits view when container resizes ---

function AutoFitReactFlowInner({ children, ...props }: any) {
  const { fitView } = useReactFlow();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [fitView]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <ReactFlow {...props}>
        {children}
      </ReactFlow>
    </div>
  );
}

function AutoFitReactFlow({ children, ...props }: any) {
  return (
    <ReactFlowProvider>
      <AutoFitReactFlowInner {...props}>{children}</AutoFitReactFlowInner>
    </ReactFlowProvider>
  );
}

// --- Main Component ---

interface DependencyGraphProps {
  planId?: string;
  nodes: PlanNode[];
  dependencies: Dependency[];
  criticalPathNodeIds?: Set<string>;
  onNodeClick?: (nodeId: string) => void;
  onCreateDependency?: (sourceId: string, targetId: string, type: DependencyType) => void;
  onDeleteDependency?: (depId: string) => void;
  isLoading?: boolean;
  className?: string;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({
  planId,
  nodes,
  dependencies,
  criticalPathNodeIds = new Set(),
  onNodeClick,
  onCreateDependency,
  onDeleteDependency,
  isLoading = false,
  className = '',
}) => {
  const [showLegend, setShowLegend] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [impactNode, setImpactNode] = useState<{ id: string; title: string } | null>(null);
  // Track impacted node IDs for highlighting
  const [impactedNodeIds, setImpactedNodeIds] = useState<Set<string>>(new Set());

  const handleImpactAnalysis = useCallback((nodeId: string, title: string) => {
    setImpactNode({ id: nodeId, title });
  }, []);

  // Count dependencies per node
  const depCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dep of dependencies) {
      counts.set(dep.source_node_id, (counts.get(dep.source_node_id) || 0) + 1);
      counts.set(dep.target_node_id, (counts.get(dep.target_node_id) || 0) + 1);
    }
    return counts;
  }, [dependencies]);

  // Compute layout positions
  const positions = useMemo(
    () => layoutNodes(nodes, dependencies),
    [nodes, dependencies]
  );
  const positionMap = useMemo(
    () => new Map(positions.map(p => [p.id, p.position])),
    [positions]
  );

  // Build React Flow nodes
  const initialNodes: Node<TaskNodeData>[] = useMemo(() => {
    return nodes
      .filter(n => n.node_type !== 'root')
      .map(n => {
        const pos = positionMap.get(n.id) || { x: 0, y: 0 };
        return {
          id: n.id,
          type: 'taskNode',
          position: pos,
          data: {
            label: n.title,
            node: n,
            isOnCriticalPath: criticalPathNodeIds.has(n.id),
            isImpactHighlighted: impactedNodeIds.has(n.id),
            dependencyCount: depCountMap.get(n.id) || 0,
            onNodeClick,
            onImpactAnalysis: planId ? handleImpactAnalysis : undefined,
          },
        };
      });
  }, [nodes, positionMap, criticalPathNodeIds, impactedNodeIds, depCountMap, onNodeClick, planId, handleImpactAnalysis]);

  // Build React Flow edges from dependencies
  const initialEdges: Edge[] = useMemo(() => {
    return dependencies.map(dep => {
      const style = edgeStyleByType[dep.dependency_type] || edgeStyleByType.blocks;
      const isCritical =
        criticalPathNodeIds.has(dep.source_node_id) &&
        criticalPathNodeIds.has(dep.target_node_id);

      return {
        id: dep.id,
        source: dep.source_node_id,
        target: dep.target_node_id,
        animated: style.animated,
        label: style.label,
        labelStyle: { fontSize: 10, fill: '#6b7280' },
        labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        style: {
          stroke: isCritical ? '#f59e0b' : style.stroke,
          strokeWidth: isCritical ? 2.5 : 1.5,
          strokeDasharray: style.strokeDasharray,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#f59e0b' : style.stroke,
          width: 16,
          height: 16,
        },
        data: { depId: dep.id, dependencyType: dep.dependency_type },
      };
    });
  }, [dependencies, criticalPathNodeIds]);

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync when data changes
  React.useEffect(() => {
    setFlowNodes(initialNodes);
  }, [initialNodes, setFlowNodes]);

  React.useEffect(() => {
    setFlowEdges(initialEdges);
  }, [initialEdges, setFlowEdges]);

  // Handle edge click (for deletion)
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (!onDeleteDependency) return;
      const depId = String(edge.data?.depId || edge.id);
      const depType = String(edge.data?.dependencyType || 'blocks');
      if (window.confirm(`Delete this "${depType}" dependency?`)) {
        onDeleteDependency(depId);
      }
    },
    [onDeleteDependency]
  );

  const handleAddDependency = useCallback(
    (sourceId: string, targetId: string, type: DependencyType) => {
      onCreateDependency?.(sourceId, targetId, type);
    },
    [onCreateDependency]
  );

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading dependency graph...</p>
        </div>
      </div>
    );
  }

  if (dependencies.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center max-w-sm">
          <GitBranch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
            No dependencies yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Dependencies show relationships between tasks. Create your first dependency to visualize the graph.
          </p>
          {onCreateDependency && nodes.filter(n => n.node_type !== 'root').length >= 2 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Dependency
            </button>
          )}
        </div>
        {showAddModal && (
          <AddDependencyModal
            nodes={nodes}
            existingDependencies={dependencies}
            onAdd={handleAddDependency}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`h-full w-full relative ${className}`}>
      <AutoFitReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={0.8} color="#d1d5db" className="dark:!bg-gray-950" />
        <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-sm !rounded-lg" />

        {/* Legend Panel */}
        {showLegend && (
          <Panel position="top-right" className="!m-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Legend</span>
                <button
                  onClick={() => setShowLegend(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-red-500" />
                  <span className="text-gray-600 dark:text-gray-400">Blocks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6', height: 0 }} />
                  <span className="text-gray-600 dark:text-gray-400">Requires</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-gray-400" style={{ borderTop: '2px dotted #9ca3af', height: 0 }} />
                  <span className="text-gray-600 dark:text-gray-400">Relates to</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-gray-200 dark:border-gray-600">
                  <div className="w-3 h-3 rounded ring-2 ring-amber-400 bg-amber-50" />
                  <span className="text-gray-600 dark:text-gray-400">Critical path</span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {!showLegend && (
          <Panel position="top-right" className="!m-2">
            <button
              onClick={() => setShowLegend(true)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Legend
            </button>
          </Panel>
        )}

        {/* Stats panel + Add dependency button */}
        <Panel position="top-left" className="!m-2">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-[11px]">
            <div className="flex items-center gap-2.5">
              <span className="text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-gray-200">{dependencies.length}</strong> deps
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-500 dark:text-gray-400">
                <strong className="text-gray-800 dark:text-gray-200">{nodes.filter(n => n.node_type !== 'root').length}</strong> nodes
              </span>
              {criticalPathNodeIds.size > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <Zap className="w-3 h-3" />
                    <strong>{criticalPathNodeIds.size}</strong> critical
                  </span>
                </>
              )}
              {onCreateDependency && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-md transition-colors ml-1"
                  title="Add dependency"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              )}
            </div>
          </div>
        </Panel>
      </AutoFitReactFlow>

      {/* Impact Analysis Overlay */}
      {impactNode && planId && (
        <ImpactAnalysisOverlay
          planId={planId}
          nodeId={impactNode.id}
          nodeTitle={impactNode.title}
          onClose={() => {
            setImpactNode(null);
            setImpactedNodeIds(new Set());
          }}
          onNodeClick={onNodeClick}
        />
      )}

      {/* Add Dependency Modal */}
      {showAddModal && (
        <AddDependencyModal
          nodes={nodes}
          existingDependencies={dependencies}
          onAdd={handleAddDependency}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};

export default DependencyGraph;
