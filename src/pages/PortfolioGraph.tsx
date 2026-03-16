import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  Panel,
  BackgroundVariant,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Circle,
  Loader,
  ExternalLink,
  RefreshCw,
  Network,
} from 'lucide-react';
import { usePlans } from '../hooks/usePlans';
import { useQuery } from 'react-query';
import { dependencyService, CrossPlanEdge } from '../services/api';
import { Plan } from '../types';

// --- Plan Node (cluster) ---

interface PlanNodeData {
  plan: Plan;
  crossPlanEdgeCount: number;
  [key: string]: unknown;
}

const planStatusConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  active: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  completed: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  draft: { color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
  archived: { color: 'text-gray-400 dark:text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', dot: 'bg-gray-400' },
};

function PlanClusterNode({ data }: NodeProps<Node<PlanNodeData>>) {
  const plan = data.plan;
  const config = planStatusConfig[plan.status] || planStatusConfig.draft;

  return (
    <div className={`rounded-xl border-2 ${config.border} ${config.bg} shadow-md min-w-[240px] max-w-[320px] transition-all hover:shadow-lg`}>
      <Handle type="target" position={Position.Top} className="!bg-gray-300 dark:!bg-gray-600 !w-3 !h-3 !border-0" />
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 font-medium">
            {plan.status}
          </span>
        </div>
        <Link
          to={`/app/plans/${plan.id}`}
          className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
        >
          {plan.title}
        </Link>
        {plan.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{plan.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-gray-500">
          {typeof plan.progress === 'number' && (
            <div className="flex items-center gap-1.5 flex-1">
              <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${plan.progress}%` }}
                />
              </div>
              <span>{plan.progress}%</span>
            </div>
          )}
          {data.crossPlanEdgeCount > 0 && (
            <span className="flex items-center gap-1 text-blue-500 dark:text-blue-400">
              <Network className="w-3 h-3" />
              {data.crossPlanEdgeCount}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 dark:!bg-gray-600 !w-3 !h-3 !border-0" />
    </div>
  );
}

// --- Task Node (shown when plan is expanded) ---

interface TaskNodeData {
  label: string;
  status: string;
  nodeType: string;
  planTitle: string;
  [key: string]: unknown;
}

const taskStatusIcons: Record<string, React.ElementType> = {
  not_started: Circle,
  in_progress: Loader,
  completed: CheckCircle,
  blocked: AlertTriangle,
};

const taskStatusColors: Record<string, string> = {
  not_started: 'text-gray-400',
  in_progress: 'text-amber-500',
  completed: 'text-emerald-500',
  blocked: 'text-red-500',
};

function CrossPlanTaskNode({ data }: NodeProps<Node<TaskNodeData>>) {
  const StatusIcon = taskStatusIcons[data.status] || Circle;
  const color = taskStatusColors[data.status] || 'text-gray-400';

  return (
    <div className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm min-w-[180px] max-w-[240px]">
      <Handle type="target" position={Position.Top} className="!bg-gray-300 dark:!bg-gray-600 !w-2 !h-2 !border-0" />
      <div className="flex items-center gap-2">
        <StatusIcon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
        <div className="min-w-0 flex-1">
          <div className="text-[9px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{data.planTitle}</div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">{data.label}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-gray-300 dark:!bg-gray-600 !w-2 !h-2 !border-0" />
    </div>
  );
}

const nodeTypes = {
  planCluster: PlanClusterNode,
  crossPlanTask: CrossPlanTaskNode,
};

// --- Edge styling ---

const edgeTypeStyles: Record<string, { stroke: string; strokeDasharray?: string; animated: boolean }> = {
  blocks: { stroke: '#ef4444', animated: true },
  requires: { stroke: '#3b82f6', strokeDasharray: '8 4', animated: false },
  relates_to: { stroke: '#9ca3af', strokeDasharray: '4 4', animated: false },
};

// --- Layout ---

type ViewMode = 'plans' | 'tasks';

function layoutPlanNodes(plans: Plan[], edges: CrossPlanEdge[], viewMode: ViewMode): { nodes: Node[]; edges: Edge[] } {
  if (viewMode === 'plans') {
    return layoutPlanLevel(plans, edges);
  }
  return layoutTaskLevel(plans, edges);
}

function layoutPlanLevel(plans: Plan[], crossPlanEdges: CrossPlanEdge[]): { nodes: Node[]; edges: Edge[] } {
  // Count edges per plan
  const edgeCounts = new Map<string, number>();
  for (const e of crossPlanEdges) {
    edgeCounts.set(e.source_plan_id, (edgeCounts.get(e.source_plan_id) || 0) + 1);
    edgeCounts.set(e.target_plan_id, (edgeCounts.get(e.target_plan_id) || 0) + 1);
  }

  // Find unique plan IDs involved in cross-plan edges
  const connectedPlanIds = new Set<string>();
  for (const e of crossPlanEdges) {
    connectedPlanIds.add(e.source_plan_id);
    connectedPlanIds.add(e.target_plan_id);
  }

  // Layout: connected plans first, then unconnected
  const connected = plans.filter(p => connectedPlanIds.has(p.id));
  const unconnected = plans.filter(p => !connectedPlanIds.has(p.id));

  const COLS = 3;
  const X_GAP = 380;
  const Y_GAP = 200;

  const nodes: Node[] = [];
  const allPlans = [...connected, ...unconnected];

  allPlans.forEach((plan, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    nodes.push({
      id: `plan-${plan.id}`,
      type: 'planCluster',
      position: { x: col * X_GAP, y: row * Y_GAP },
      data: {
        plan,
        crossPlanEdgeCount: edgeCounts.get(plan.id) || 0,
      },
    });
  });

  // Edges between plan clusters (aggregate)
  const planEdgeMap = new Map<string, { count: number; types: Set<string> }>();
  for (const e of crossPlanEdges) {
    const key = `${e.source_plan_id}->${e.target_plan_id}`;
    const existing = planEdgeMap.get(key) || { count: 0, types: new Set<string>() };
    existing.count++;
    existing.types.add(e.dependency_type);
    planEdgeMap.set(key, existing);
  }

  const edges: Edge[] = [];
  for (const [key, val] of planEdgeMap) {
    const [srcPlanId, tgtPlanId] = key.split('->');
    const primaryType = val.types.has('blocks') ? 'blocks' : val.types.has('requires') ? 'requires' : 'relates_to';
    const style = edgeTypeStyles[primaryType] || edgeTypeStyles.relates_to;

    edges.push({
      id: `plan-edge-${key}`,
      source: `plan-${srcPlanId}`,
      target: `plan-${tgtPlanId}`,
      type: 'smoothstep',
      animated: style.animated,
      style: { stroke: style.stroke, strokeWidth: Math.min(val.count + 1, 4), strokeDasharray: style.strokeDasharray },
      markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke, width: 16, height: 16 },
      label: val.count > 1 ? `${val.count} deps` : undefined,
      labelStyle: { fill: '#6b7280', fontSize: 10 },
      labelBgStyle: { fill: 'white', fillOpacity: 0.8 },
    });
  }

  return { nodes, edges };
}

function layoutTaskLevel(plans: Plan[], crossPlanEdges: CrossPlanEdge[]): { nodes: Node[]; edges: Edge[] } {
  // Show individual task nodes involved in cross-plan dependencies
  const taskNodes = new Map<string, { id: string; title: string; status: string; planId: string; planTitle: string }>();

  for (const e of crossPlanEdges) {
    const srcPlan = plans.find(p => p.id === e.source_plan_id);
    const tgtPlan = plans.find(p => p.id === e.target_plan_id);
    taskNodes.set(e.source_node_id, {
      id: e.source_node_id,
      title: e.source_title,
      status: e.source_status,
      planId: e.source_plan_id,
      planTitle: srcPlan?.title || 'Unknown Plan',
    });
    taskNodes.set(e.target_node_id, {
      id: e.target_node_id,
      title: e.target_title,
      status: e.target_status,
      planId: e.target_plan_id,
      planTitle: tgtPlan?.title || 'Unknown Plan',
    });
  }

  // Group by plan for layout
  const planGroups = new Map<string, typeof taskNodes extends Map<any, infer V> ? V[] : never>();
  for (const task of taskNodes.values()) {
    const group = planGroups.get(task.planId) || [];
    group.push(task);
    planGroups.set(task.planId, group);
  }

  const nodes: Node[] = [];
  let colOffset = 0;
  const X_GAP = 280;
  const Y_GAP = 100;

  for (const [, tasks] of planGroups) {
    tasks.forEach((task, row) => {
      nodes.push({
        id: `task-${task.id}`,
        type: 'crossPlanTask',
        position: { x: colOffset * X_GAP, y: row * Y_GAP },
        data: {
          label: task.title,
          status: task.status,
          nodeType: 'task',
          planTitle: task.planTitle,
        },
      });
    });
    colOffset++;
  }

  const edges: Edge[] = crossPlanEdges.map(e => {
    const style = edgeTypeStyles[e.dependency_type] || edgeTypeStyles.relates_to;
    return {
      id: `cross-edge-${e.id}`,
      source: `task-${e.source_node_id}`,
      target: `task-${e.target_node_id}`,
      type: 'smoothstep',
      animated: style.animated,
      style: { stroke: style.stroke, strokeWidth: 2, strokeDasharray: style.strokeDasharray },
      markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke, width: 14, height: 14 },
    };
  });

  return { nodes, edges };
}

// --- Main component ---

function PortfolioGraphInner() {
  const [viewMode, setViewMode] = useState<ViewMode>('plans');
  const [showCompleted, setShowCompleted] = useState(false);

  // Fetch all plans (active/draft by default, all when showCompleted is toggled)
  const { plans, isLoading: plansLoading } = usePlans(1, 100, showCompleted ? undefined : 'active,draft');

  const planIds = useMemo(() => (plans || []).map((p: Plan) => p.id), [plans]);

  // Fetch cross-plan dependencies
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try { userId = JSON.parse(sessionStr).user?.id || 'anonymous'; } catch { /* */ }
  }

  const { data: crossPlanData, isLoading: depsLoading, refetch } = useQuery(
    ['crossPlanDeps', userId, ...planIds],
    () => dependencyService.listCrossPlanDependencies(planIds),
    {
      enabled: planIds.length >= 2,
      staleTime: 30000,
    }
  );

  const crossPlanEdges: CrossPlanEdge[] = crossPlanData?.edges || [];
  const isLoading = plansLoading || depsLoading;

  const { nodes: flowNodes, edges: flowEdges } = useMemo(
    () => layoutPlanNodes(plans || [], crossPlanEdges, viewMode),
    [plans, crossPlanEdges, viewMode]
  );

  const handleRefresh = useCallback(() => refetch(), [refetch]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading portfolio...</span>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Network className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-medium">No plans yet</p>
        <p className="text-sm mt-1">Create plans and add cross-plan dependencies to see them here.</p>
        <Link to="/app/plans/create" className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          Create Plan
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e5e7eb" />
        <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-sm" />

        <Panel position="top-left" className="!m-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Portfolio Dependencies</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{(plans || []).length} plans</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-blue-500">{crossPlanEdges.length} cross-plan edges</span>
            </div>
          </div>
        </Panel>

        <Panel position="top-right" className="!m-3">
          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex overflow-hidden">
              <button
                onClick={() => setViewMode('plans')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'plans' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                Plans
              </button>
              <button
                onClick={() => setViewMode('tasks')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'tasks' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              >
                Tasks
              </button>
            </div>
            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              Show completed
            </label>
            <button
              onClick={handleRefresh}
              className="p-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-gray-500 hover:text-gray-700 dark:text-gray-400"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </Panel>

        <Panel position="bottom-left" className="!m-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm px-3 py-2">
            <div className="flex items-center gap-4 text-[10px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-red-500" />
                <span>blocks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-blue-500" style={{ borderTop: '2px dashed' }} />
                <span>requires</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-0.5 bg-gray-400" style={{ borderTop: '2px dotted' }} />
                <span>relates to</span>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function PortfolioGraph() {
  return (
    <ReactFlowProvider>
      <PortfolioGraphInner />
    </ReactFlowProvider>
  );
}
