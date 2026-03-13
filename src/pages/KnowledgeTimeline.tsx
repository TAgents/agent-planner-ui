import React, { useState, useMemo } from 'react';
import {
  Clock,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Tag,
  Link2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  useGraphitiStatus,
  useGraphitiEpisodes,
} from '../hooks/useGraphitiKnowledge';
import { GraphitiEpisode } from '../services/api';

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
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode }) => {
  const [expanded, setExpanded] = useState(false);
  const entityEdges = episode.entity_edges || [];
  const hasEntities = entityEdges.length > 0;
  const contentPreview = episode.content?.length > 200
    ? episode.content.substring(0, 200) + '...'
    : episode.content;

  return (
    <div className="relative pl-8 pb-6">
      {/* Timeline connector */}
      <div className="absolute left-3 top-2 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      <div className="absolute left-1.5 top-2 w-3 h-3 rounded-full bg-blue-500 dark:bg-blue-400 border-2 border-white dark:border-gray-900 z-10" />

      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {episode.name || 'Untitled Episode'}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(episode.created_at)}
              </span>
              {episode.source_description && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {episode.source_description}
                </span>
              )}
            </div>
          </div>
          {hasEntities && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <Link2 className="w-3 h-3" />
              {entityEdges.length} relation{entityEdges.length !== 1 ? 's' : ''}
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-wrap break-words">
          {expanded ? episode.content : contentPreview}
        </p>
        {!expanded && episode.content?.length > 200 && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
          >
            Show more
          </button>
        )}

        {/* Entity extractions */}
        {expanded && hasEntities && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
              Extracted Relations
            </h5>
            <div className="space-y-1.5">
              {entityEdges.map((edge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-1.5"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200">{edge.source_entity_name}</span>
                  <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium">
                    {edge.relation_type}
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{edge.target_entity_name}</span>
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

  const episodes = episodeData?.episodes || [];

  // Filter episodes
  const filteredEpisodes = useMemo(() => {
    if (!filterText.trim()) return episodes;
    const lower = filterText.toLowerCase();
    return episodes.filter(
      ep =>
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!statusData?.available) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Timeline Unavailable</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          The Graphiti temporal knowledge graph service needs to be configured and running.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Knowledge Timeline</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Chronological view of knowledge episodes and entity extractions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => refetch()}
                disabled={episodesLoading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-gray-500 ${episodesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter episodes..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={maxEpisodes}
              onChange={e => setMaxEpisodes(Number(e.target.value))}
              className="px-3 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm"
            >
              <option value={20}>Last 20</option>
              <option value={50}>Last 50</option>
              <option value={100}>Last 100</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredEpisodes.length} episode{filteredEpisodes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="container mx-auto px-4 py-4">
        {episodesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading episodes...</p>
          </div>
        ) : groupedEpisodes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No episodes found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filterText ? 'Try a different filter term.' : 'Knowledge episodes will appear here as they are recorded.'}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {groupedEpisodes.map(([dateKey, eps]) => (
              <div key={dateKey} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    {formatDateHeading(eps[0].created_at)}
                  </h2>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {eps.length} episode{eps.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {eps.map(episode => (
                  <EpisodeCard key={episode.uuid} episode={episode} />
                ))}
              </div>
            ))}

            {episodes.length >= maxEpisodes && (
              <div className="text-center py-4">
                <button
                  onClick={() => setMaxEpisodes(prev => prev + 50)}
                  className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium"
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
