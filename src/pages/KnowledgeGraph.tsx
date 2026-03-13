import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  Node,
  Edge,
  Position,
  MarkerType,
  Handle,
  NodeProps,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  Globe,
  Tag,
  Zap,
} from 'lucide-react';
import {
  useGraphitiStatus,
  useGraphitiEntitySearchMutation,
  useGraphitiFactSearchMutation,
} from '../hooks/useGraphitiKnowledge';
import { GraphitiEntity, GraphitiFact } from '../services/api';

// --- Custom Entity Node ---

interface EntityNodeData {
  label: string;
  entity: GraphitiEntity;
  connectionCount: number;
  isCrossPlan: boolean;
  [key: string]: unknown;
}

function EntityNode({ data }: NodeProps<Node<EntityNodeData>>) {
  const entity = data.entity;
  const isCrossPlan = data.isCrossPlan;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 shadow-sm min-w-[160px] max-w-[240px] transition-shadow hover:shadow-lg ${
        isCrossPlan
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-600 ring-2 ring-amber-300 dark:ring-amber-700 ring-offset-1'
          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-blue-400 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-blue-400 !w-2 !h-2" />
      <div className="flex items-start gap-2">
        <Globe className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isCrossPlan ? 'text-amber-500' : 'text-blue-500'}`} />
        <div className="min-w-0 flex-1">
          {entity.entity_type && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {entity.entity_type}
            </div>
          )}
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={data.label}>
            {data.label}
          </div>
          {entity.summary && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
              {entity.summary}
            </div>
          )}
          {isCrossPlan && (
            <div className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded text-[10px] font-medium">
              <Zap className="w-3 h-3" />
              Cross-plan
            </div>
          )}
          {data.connectionCount > 0 && (
            <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              {data.connectionCount} connection{data.connectionCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

// --- Layout helpers ---

function layoutNodes(entities: GraphitiEntity[], facts: GraphitiFact[]): { nodes: Node[]; edges: Edge[] } {
  // Build connection map to identify cross-plan entities
  const entityConnections: Record<string, Set<string>> = {};
  const groupIds = new Set<string>();

  entities.forEach(e => {
    if (e.group_id) groupIds.add(e.group_id);
  });

  facts.forEach(f => {
    if (f.source_node_uuid) {
      if (!entityConnections[f.source_node_uuid]) entityConnections[f.source_node_uuid] = new Set();
      if (f.target_node_uuid) entityConnections[f.source_node_uuid].add(f.target_node_uuid);
    }
    if (f.target_node_uuid) {
      if (!entityConnections[f.target_node_uuid]) entityConnections[f.target_node_uuid] = new Set();
      if (f.source_node_uuid) entityConnections[f.target_node_uuid].add(f.source_node_uuid);
    }
  });

  // Build entity name -> uuid lookup
  const nameToUuid: Record<string, string> = {};
  entities.forEach(e => {
    nameToUuid[e.name] = e.uuid;
  });

  // Determine cross-plan entities (entities that appear in facts linking different source/target names)
  const crossPlanEntities = new Set<string>();
  if (groupIds.size > 1) {
    // If multiple groups exist, entities shared across groups are cross-plan
    const entityGroups: Record<string, Set<string>> = {};
    entities.forEach(e => {
      if (!entityGroups[e.uuid]) entityGroups[e.uuid] = new Set();
      if (e.group_id) entityGroups[e.uuid].add(e.group_id);
    });
    Object.entries(entityGroups).forEach(([uuid, groups]) => {
      if (groups.size > 1) crossPlanEntities.add(uuid);
    });
  }
  // Also mark entities with many connections as potentially cross-plan
  Object.entries(entityConnections).forEach(([uuid, connections]) => {
    if (connections.size >= 3) crossPlanEntities.add(uuid);
  });

  // Position nodes in a force-directed-like grid
  const cols = Math.max(3, Math.ceil(Math.sqrt(entities.length)));
  const spacingX = 300;
  const spacingY = 180;

  const nodes: Node[] = entities.map((entity, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    // Add jitter to avoid rigid grid
    const jitterX = (Math.sin(i * 2.1) * 40);
    const jitterY = (Math.cos(i * 3.7) * 30);

    return {
      id: entity.uuid,
      type: 'entity',
      position: {
        x: col * spacingX + jitterX,
        y: row * spacingY + jitterY,
      },
      data: {
        label: entity.name,
        entity,
        connectionCount: entityConnections[entity.uuid]?.size || 0,
        isCrossPlan: crossPlanEntities.has(entity.uuid),
      },
    };
  });

  // Build edges from facts
  const entityUuids = new Set(entities.map(e => e.uuid));
  const edgeMap = new Map<string, Edge>();

  facts.forEach(fact => {
    // Try direct UUID mapping first
    let sourceId = fact.source_node_uuid;
    let targetId = fact.target_node_uuid;

    // Fall back to name-based lookup
    if (!sourceId && fact.source_node_name) sourceId = nameToUuid[fact.source_node_name];
    if (!targetId && fact.target_node_name) targetId = nameToUuid[fact.target_node_name];

    if (sourceId && targetId && entityUuids.has(sourceId) && entityUuids.has(targetId) && sourceId !== targetId) {
      const edgeKey = `${sourceId}-${targetId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          id: `edge-${fact.uuid}`,
          source: sourceId,
          target: targetId,
          animated: false,
          label: fact.fact.length > 60 ? fact.fact.substring(0, 57) + '...' : fact.fact,
          labelStyle: { fontSize: 10, fill: '#9ca3af' },
          style: { stroke: '#6b7280', strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: '#6b7280',
          },
          type: 'default',
        });
      }
    }
  });

  return { nodes, edges: Array.from(edgeMap.values()) };
}

// --- Main Graph Component (inner, needs ReactFlowProvider) ---

function KnowledgeGraphInner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: statusData, isLoading: statusLoading } = useGraphitiStatus();
  const entitySearch = useGraphitiEntitySearchMutation();
  const factSearch = useGraphitiFactSearchMutation();

  const isSearching = entitySearch.isLoading || factSearch.isLoading;

  const handleSearch = useCallback(async () => {
    const query = searchInput.trim();
    if (!query) return;
    setSearchQuery(query);
    setHasSearched(true);

    try {
      const [entityResult, factResult] = await Promise.all([
        entitySearch.mutateAsync({ query, maxResults: 30 }),
        factSearch.mutateAsync({ query, maxResults: 50 }),
      ]);

      const { nodes: newNodes, edges: newEdges } = layoutNodes(
        entityResult.entities,
        factResult.facts
      );

      setNodes(newNodes);
      setEdges(newEdges);
    } catch {
      // Errors are handled by mutation state
    }
  }, [searchInput, entitySearch, factSearch, setNodes, setEdges]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!statusData?.available) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Graph Unavailable</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          The Graphiti temporal knowledge graph service needs to be configured and running to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Graph</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Explore entities and relationships in the temporal knowledge graph
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entities and facts..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchInput.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Graph area */}
      <div className="flex-1">
        {!hasSearched ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Globe className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Search to explore the knowledge graph
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
              Enter a topic, entity name, or concept to discover related entities and their relationships.
              Cross-plan entities are highlighted with an amber border.
            </p>
          </div>
        ) : nodes.length === 0 && !isSearching ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No results found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try a different search query to find entities in the knowledge graph.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            className="bg-gray-50 dark:bg-gray-900"
          >
            <Controls className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg !shadow-lg" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" className="dark:!opacity-20" />
            <MiniMap
              nodeColor={(node) => {
                const data = node.data as EntityNodeData;
                return data?.isCrossPlan ? '#f59e0b' : '#3b82f6';
              }}
              className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !rounded-lg"
            />
            <Panel position="top-right">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Entity ({nodes.length})
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    Cross-plan
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-6 h-0.5 bg-gray-400" />
                    Fact ({edges.length})
                  </span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

// --- Wrapper with Provider ---

const KnowledgeGraph: React.FC = () => (
  <ReactFlowProvider>
    <KnowledgeGraphInner />
  </ReactFlowProvider>
);

export default KnowledgeGraph;
