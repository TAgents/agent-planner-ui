import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  BookOpen,
  Map,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { nodeViewService } from '../../services/api';

// ============================================================================
// Types
// ============================================================================

interface AgentContextPanelProps {
  nodeId: string;
  planId: string;
}

interface AgentViewResponse {
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    node_type: string;
    task_mode?: string;
    agent_instructions?: string;
    recent_logs?: Array<{
      id: string;
      content: string;
      log_type: string;
      created_at: string;
    }>;
  };
  neighborhood?: {
    parent?: { id: string; title: string; node_type: string };
    siblings?: Array<{ id: string; title: string; status: string }>;
    upstream_dependencies?: Array<{ id: string; title: string; status: string; dependency_type: string }>;
    downstream_dependencies?: Array<{ id: string; title: string; status: string; dependency_type: string }>;
  };
  knowledge?: {
    facts?: Array<{ fact: string; source_node_name?: string; target_node_name?: string }>;
    contradictions?: Array<{ fact: string; created_at: string }>;
  };
  extended?: {
    plan_title?: string;
    plan_description?: string;
    ancestry?: Array<{ id: string; title: string; node_type: string }>;
    linked_goals?: Array<{ id: string; title: string; status: string }>;
  };
  token_estimates?: {
    task?: number;
    neighborhood?: number;
    knowledge?: number;
    extended?: number;
    total?: number;
  };
}

// ============================================================================
// Helpers
// ============================================================================

const estimateTokens = (text: string): number => {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
};

const formatTokenCount = (count: number): string => {
  if (count >= 1000) {
    return `~${(count / 1000).toFixed(1)}k`;
  }
  return `~${count}`;
};

// ============================================================================
// CollapsibleSection sub-component
// ============================================================================

const CollapsibleSection: React.FC<{
  title: string;
  icon: React.FC<{ className?: string }>;
  tokenCount?: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}> = ({ title, icon: Icon, tokenCount, defaultExpanded = true, children }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
          {title}
        </span>
        {tokenCount !== undefined && tokenCount > 0 && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums flex-shrink-0">
            {formatTokenCount(tokenCount)} tokens
          </span>
        )}
      </button>
      {expanded && (
        <div className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-400 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Loading Skeleton
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3 animate-pulse">
    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50">
          <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="px-3 py-2.5 space-y-2">
          <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// AgentContextPanel Component
// ============================================================================

const AgentContextPanel: React.FC<AgentContextPanelProps> = ({ nodeId, planId }) => {
  // Get user ID for query key
  const sessionStr = localStorage.getItem('auth_session');
  let userId = 'anonymous';
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr);
      userId = session.user?.id || session.user?.email || 'anonymous';
    } catch (e) {
      // ignore
    }
  }

  const { data, isLoading, error } = useQuery<AgentViewResponse>(
    ['agentView', userId, nodeId],
    () => nodeViewService.getAgentView(nodeId, 4),
    {
      enabled: !!nodeId,
      staleTime: 30000,
    },
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Failed to load agent context
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  const { task, neighborhood, knowledge, extended, token_estimates } = data;

  // Calculate totals — use API estimates if available, else rough estimate
  const taskTokens = token_estimates?.task || estimateTokens(
    JSON.stringify(task),
  );
  const neighborhoodTokens = token_estimates?.neighborhood || estimateTokens(
    JSON.stringify(neighborhood || {}),
  );
  const knowledgeTokens = token_estimates?.knowledge || estimateTokens(
    JSON.stringify(knowledge || {}),
  );
  const extendedTokens = token_estimates?.extended || estimateTokens(
    JSON.stringify(extended || {}),
  );
  const totalTokens = token_estimates?.total || (taskTokens + neighborhoodTokens + knowledgeTokens + extendedTokens);

  return (
    <div className="space-y-3">
      {/* Token summary */}
      <div className="flex items-center gap-2 px-1">
        <Cpu className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Agent context: <span className="font-medium text-gray-700 dark:text-gray-300 tabular-nums">{formatTokenCount(totalTokens)} tokens</span>
        </span>
      </div>

      {/* Layer 1: Task Focus */}
      <CollapsibleSection
        title="Task Focus"
        icon={Target}
        tokenCount={taskTokens}
      >
        <div>
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {task.title}
          </span>
          {task.task_mode && (
            <span className="ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {task.task_mode}
            </span>
          )}
        </div>
        {task.description && (
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            {task.description}
          </p>
        )}
        {task.agent_instructions && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded p-2">
            <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Instructions</span>
            <p className="text-blue-800 dark:text-blue-300 mt-0.5">{task.agent_instructions}</p>
          </div>
        )}
        {task.recent_logs && task.recent_logs.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recent Logs ({task.recent_logs.length})
            </span>
            <div className="mt-1 space-y-1">
              {task.recent_logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1.5 border border-gray-100 dark:border-gray-700/50"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`inline-flex px-1 py-0 rounded text-[9px] font-medium ${
                      log.log_type === 'decision'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : log.log_type === 'challenge'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : log.log_type === 'reasoning'
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                    }`}>
                      {log.log_type}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                    {log.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* Layer 2: Neighborhood */}
      <CollapsibleSection
        title="Neighborhood"
        icon={Users}
        tokenCount={neighborhoodTokens}
      >
        {neighborhood?.parent && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Parent</span>
            <p className="text-gray-700 dark:text-gray-300 mt-0.5">
              {neighborhood.parent.title}
              <span className="text-gray-400 dark:text-gray-500 ml-1">({neighborhood.parent.node_type})</span>
            </p>
          </div>
        )}

        {neighborhood?.siblings && neighborhood.siblings.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Siblings ({neighborhood.siblings.length})
            </span>
            <ul className="mt-1 space-y-0.5">
              {neighborhood.siblings.map((s) => (
                <li key={s.id} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    s.status === 'completed' ? 'bg-emerald-500' :
                    s.status === 'in_progress' ? 'bg-amber-500' :
                    s.status === 'blocked' ? 'bg-red-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{s.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {neighborhood?.upstream_dependencies && neighborhood.upstream_dependencies.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Upstream Dependencies ({neighborhood.upstream_dependencies.length})
            </span>
            <ul className="mt-1 space-y-0.5">
              {neighborhood.upstream_dependencies.map((d) => (
                <li key={d.id} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    d.status === 'completed' ? 'bg-emerald-500' :
                    d.status === 'blocked' ? 'bg-red-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{d.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">({d.dependency_type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {neighborhood?.downstream_dependencies && neighborhood.downstream_dependencies.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Downstream Dependencies ({neighborhood.downstream_dependencies.length})
            </span>
            <ul className="mt-1 space-y-0.5">
              {neighborhood.downstream_dependencies.map((d) => (
                <li key={d.id} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    d.status === 'completed' ? 'bg-emerald-500' :
                    d.status === 'blocked' ? 'bg-red-500' :
                    'bg-gray-300 dark:bg-gray-600'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{d.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">({d.dependency_type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!neighborhood?.parent && (!neighborhood?.siblings || neighborhood.siblings.length === 0) && (
          <p className="text-gray-400 dark:text-gray-500 italic">No neighborhood data available</p>
        )}
      </CollapsibleSection>

      {/* Layer 3: Knowledge */}
      <CollapsibleSection
        title="Knowledge"
        icon={BookOpen}
        tokenCount={knowledgeTokens}
      >
        {knowledge?.facts && knowledge.facts.length > 0 ? (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Facts ({knowledge.facts.length})
            </span>
            <ul className="mt-1 space-y-1">
              {knowledge.facts.map((f, i) => (
                <li
                  key={i}
                  className="bg-gray-50 dark:bg-gray-900/50 rounded px-2 py-1.5 border border-gray-100 dark:border-gray-700/50"
                >
                  <p className="text-gray-600 dark:text-gray-400">{f.fact}</p>
                  {(f.source_node_name || f.target_node_name) && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {f.source_node_name}{f.source_node_name && f.target_node_name ? ' \u2192 ' : ''}{f.target_node_name}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 italic">No knowledge facts available</p>
        )}

        {knowledge?.contradictions && knowledge.contradictions.length > 0 && (
          <div className="mt-2">
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Contradictions ({knowledge.contradictions.length})
            </span>
            <ul className="mt-1 space-y-1">
              {knowledge.contradictions.map((c, i) => (
                <li
                  key={i}
                  className="bg-amber-50 dark:bg-amber-900/20 rounded px-2 py-1.5 border border-amber-200 dark:border-amber-800/40"
                >
                  <p className="text-amber-800 dark:text-amber-300">{c.fact}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CollapsibleSection>

      {/* Layer 4: Extended */}
      <CollapsibleSection
        title="Extended"
        icon={Map}
        tokenCount={extendedTokens}
      >
        {extended?.plan_title && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</span>
            <p className="text-gray-700 dark:text-gray-300 mt-0.5 font-medium">{extended.plan_title}</p>
            {extended.plan_description && (
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{extended.plan_description}</p>
            )}
          </div>
        )}

        {extended?.ancestry && extended.ancestry.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ancestry Path</span>
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              {extended.ancestry.map((a, i) => (
                <React.Fragment key={a.id}>
                  {i > 0 && <span className="text-gray-300 dark:text-gray-600 text-[10px]">/</span>}
                  <span className="text-gray-600 dark:text-gray-400">
                    {a.title}
                    <span className="text-gray-400 dark:text-gray-500 ml-0.5 text-[10px]">({a.node_type})</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {extended?.linked_goals && extended.linked_goals.length > 0 && (
          <div>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Linked Goals ({extended.linked_goals.length})
            </span>
            <ul className="mt-1 space-y-0.5">
              {extended.linked_goals.map((g) => (
                <li key={g.id} className="flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-blue-500 flex-shrink-0" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{g.title}</span>
                  <span className={`text-[10px] flex-shrink-0 ${
                    g.status === 'completed' ? 'text-emerald-500' :
                    g.status === 'active' ? 'text-amber-500' :
                    'text-gray-400 dark:text-gray-500'
                  }`}>
                    {g.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!extended?.plan_title && (!extended?.ancestry || extended.ancestry.length === 0) && (
          <p className="text-gray-400 dark:text-gray-500 italic">No extended context available</p>
        )}
      </CollapsibleSection>
    </div>
  );
};

export default AgentContextPanel;
