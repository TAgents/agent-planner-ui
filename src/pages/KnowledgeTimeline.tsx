import React, { useState, useMemo } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Link2,
  Calendar,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  useGraphitiStatus,
  useGraphitiEpisodes,
  useDeleteEpisode,
} from '../hooks/useGraphitiKnowledge';
import { GraphitiEpisode } from '../services/knowledge.service';

// --- Helpers ---

function formatDateHeading(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function getDateKey(dateStr: string): string {
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return 'unknown';
  }
}

// --- Episode Card ---

interface EpisodeCardProps {
  episode: GraphitiEpisode;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onDelete, isDeleting }) => {
  const [expanded, setExpanded] = useState(false);
  const entityEdges = episode.entity_edges || [];
  const hasEntities = entityEdges.length > 0;
  const contentPreview = episode.content?.length > 150
    ? episode.content.substring(0, 150) + '...'
    : episode.content;

  const showSource = episode.source_description &&
    episode.source_description !== 'AgentPlanner knowledge entry';

  return (
    <div className="relative pl-6 pb-4">
      {/* Timeline connector */}
      <div className="absolute left-[9px] top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-800" />
      <div className="absolute left-1 top-2.5 w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-gray-50 dark:border-gray-950 z-10" />

      <div className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3 hover:border-blue-300 dark:hover:border-blue-800 transition-colors relative">
        {/* Delete button */}
        <button
          onClick={() => {
            if (window.confirm('Delete this episode?')) {
              onDelete(episode.uuid);
            }
          }}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
          title="Delete episode"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-2 pr-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate flex-1">
            {episode.name || 'Untitled Episode'}
          </h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            {hasEntities && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
              >
                <Link2 className="w-3 h-3" />
                {entityEdges.length}
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
            <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
              {formatTime(episode.created_at)}
            </span>
          </div>
        </div>

        {/* Source (only if non-default) */}
        {showSource && (
          <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400 dark:text-gray-500">
            <FileText className="w-3 h-3" />
            {episode.source_description}
          </div>
        )}

        {/* Content preview */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 whitespace-pre-wrap break-words leading-relaxed">
          {expanded ? episode.content : contentPreview}
        </p>
        {!expanded && episode.content?.length > 150 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
          >
            Show more
          </button>
        )}

        {/* Entity extractions */}
        {expanded && hasEntities && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="space-y-1">
              {entityEdges.map((edge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded px-2 py-1"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-300">{edge.source_entity_name}</span>
                  <span className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[10px]">
                    {edge.relation_type}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{edge.target_entity_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Timeline Page ---

const KnowledgeTimeline: React.FC = () => {
  const [filterText, setFilterText] = useState('');
  const [maxEpisodes, setMaxEpisodes] = useState(50);

  const { data: statusData, isLoading: statusLoading } = useGraphitiStatus();
  const { data: episodeData, isLoading: episodesLoading, refetch } = useGraphitiEpisodes(maxEpisodes, statusData?.available === true);
  const deleteMutation = useDeleteEpisode();

  const episodes: GraphitiEpisode[] = (episodeData?.episodes || []) as GraphitiEpisode[];

  // Filter episodes
  const filteredEpisodes = useMemo(() => {
    if (!filterText.trim()) return episodes;
    const lower = filterText.toLowerCase();
    return episodes.filter(
      (ep: GraphitiEpisode) =>
        ep.name?.toLowerCase().includes(lower) ||
        ep.content?.toLowerCase().includes(lower) ||
        ep.source_description?.toLowerCase().includes(lower)
    );
  }, [episodes, filterText]);

  // Group by date
  const groupedEpisodes = useMemo(() => {
    const groups: Record<string, GraphitiEpisode[]> = {};
    const sortedEps = [...filteredEpisodes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    sortedEps.forEach(ep => {
      const key = getDateKey(ep.created_at);
      if (!groups[key]) groups[key] = [];
      groups[key].push(ep);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredEpisodes]);

  if (statusLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!statusData?.available) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950">
        <AlertCircle className="w-10 h-10 text-gray-400 mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Timeline Unavailable</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          The Graphiti knowledge graph service needs to be configured and running.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Compact toolbar */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter episodes..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-xs transition-all"
            />
          </div>
          <select
            value={maxEpisodes}
            onChange={e => setMaxEpisodes(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs"
          >
            <option value={20}>Last 20</option>
            <option value={50}>Last 50</option>
            <option value={100}>Last 100</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={episodesLoading}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${episodesLoading ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 tabular-nums">
            {filteredEpisodes.length} episode{filteredEpisodes.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {episodesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">Loading episodes...</p>
          </div>
        ) : groupedEpisodes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">No episodes found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filterText ? 'Try a different filter term.' : 'Knowledge episodes will appear here as they are recorded.'}
            </p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {groupedEpisodes.map(([dateKey, eps]) => (
              <div key={dateKey} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {formatDateHeading(eps[0].created_at)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    {eps.length}
                  </span>
                </div>
                {eps.map(episode => (
                  <EpisodeCard
                    key={episode.uuid}
                    episode={episode}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    isDeleting={deleteMutation.isLoading && deleteMutation.variables === episode.uuid}
                  />
                ))}
              </div>
            ))}

            {episodes.length >= maxEpisodes && (
              <div className="text-center py-3">
                <button
                  onClick={() => setMaxEpisodes(prev => prev + 50)}
                  className="px-3 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors font-medium"
                >
                  Load more episodes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeTimeline;
