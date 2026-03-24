import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  CheckCircle, Circle, AlertTriangle, ChevronDown, ChevronRight,
  Loader2, BookOpen, Layers, ArrowRight
} from 'lucide-react';
import { graphitiService } from '../services/api';

const KnowledgeCoverageTab: React.FC = () => {
  const { data, isLoading, error } = useQuery(
    'knowledge-coverage-map',
    () => graphitiService.getCoverageMap(),
    { staleTime: 30000 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Building coverage map...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">Knowledge graph not available</p>
      </div>
    );
  }

  const { topics, unlinked_tasks, stats } = data;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex items-center gap-6 px-1 py-2">
        <Stat label="Facts" value={stats.total_facts} />
        <Stat label="Entities" value={stats.total_entities} />
        <Stat label="Tasks covered" value={`${stats.covered_tasks}/${stats.total_tasks}`} />
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                stats.coverage_pct >= 80 ? 'bg-emerald-500' :
                stats.coverage_pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${stats.coverage_pct}%` }}
            />
          </div>
          <span className={`text-xs font-bold ${
            stats.coverage_pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
            stats.coverage_pct >= 50 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {stats.coverage_pct}%
          </span>
        </div>
      </div>

      {/* Topic groups */}
      {topics.map((topic: any, i: number) => (
        <TopicGroup key={i} topic={topic} />
      ))}

      {/* No topics */}
      {topics.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          No knowledge entities found. Add episodes to build the knowledge graph.
        </div>
      )}

      {/* Uncovered tasks */}
      {unlinked_tasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-500/30 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 dark:bg-amber-500/10 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Tasks without knowledge ({unlinked_tasks.length})
            </span>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {unlinked_tasks.map((task: any) => (
              <div key={task.task_id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <Circle className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                <Link
                  to={`/app/plans/${task.plan_id}?node=${task.task_id}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                >
                  {task.task_title}
                </Link>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto">
                  {task.plan_title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Topic Group ──────────────────────────────────────────────

const TopicGroup: React.FC<{ topic: any }> = ({ topic }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        )}
        <Layers className="w-4 h-4 text-violet-500 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 truncate">
          {topic.entity.name}
        </span>
        {topic.entity.entity_type && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex-shrink-0">
            {topic.entity.entity_type}
          </span>
        )}
        <span className="text-xs text-gray-400 flex-shrink-0">
          {topic.facts.length} fact{topic.facts.length !== 1 ? 's' : ''}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
          {topic.facts.map((fact: any, i: number) => (
            <div key={i} className="px-4 py-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {fact.fact}
                  </p>
                  {fact.linked_tasks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {fact.linked_tasks.map((task: any) => (
                        <Link
                          key={task.task_id}
                          to={`/app/plans/${task.plan_id}?node=${task.task_id}`}
                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                          {task.task_title}
                          <span className="text-blue-400 dark:text-blue-500">({task.plan_title})</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {fact.linked_tasks.length === 0 && (
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 italic">
                      No tasks linked to this fact
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}</span>
    <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default KnowledgeCoverageTab;
