import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  Link2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Send,
  CheckCircle,
  Tag,
} from 'lucide-react';
import {
  useGraphitiFactSearch,
  useGraphitiEntitySearch,
  useCreateGraphitiEpisode,
  useGraphitiStatus,
} from '../../hooks/useGraphitiKnowledge';
import { GraphitiFact, GraphitiEntity } from '../../services/knowledge.service';

interface NodeKnowledgeTabProps {
  nodeTitle: string;
  planId: string;
  nodeId: string;
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const NodeKnowledgeTab: React.FC<NodeKnowledgeTabProps> = ({ nodeTitle, planId, nodeId }) => {
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [learningContent, setLearningContent] = useState('');
  const [learningName, setLearningName] = useState('');
  const [factsExpanded, setFactsExpanded] = useState(true);
  const [entitiesExpanded, setEntitiesExpanded] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Check Graphiti availability
  const { data: statusData, isLoading: statusLoading } = useGraphitiStatus();

  // Search for facts related to the task title
  const {
    data: factData,
    isLoading: factsLoading,
  } = useGraphitiFactSearch(statusData?.available ? nodeTitle : null, 10);

  // Search for related entities
  const {
    data: entityData,
    isLoading: entitiesLoading,
  } = useGraphitiEntitySearch(statusData?.available ? nodeTitle : null, 10);

  // Record learning mutation
  const createEpisode = useCreateGraphitiEpisode();

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleRecordLearning = async () => {
    if (!learningContent.trim()) return;
    const name = learningName.trim() || `Learning from: ${nodeTitle}`;
    const content = `[Task: ${nodeTitle}] ${learningContent}`;
    try {
      await createEpisode.mutateAsync({ content, name });
      setLearningContent('');
      setLearningName('');
      setShowRecordForm(false);
      setSuccessMessage('Learning recorded successfully');
    } catch {
      // Error handled by mutation
    }
  };

  if (statusLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="ml-2 text-[11px] text-gray-500 dark:text-gray-400">Checking knowledge graph...</span>
      </div>
    );
  }

  if (!statusData?.available) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-[11px] text-gray-500 dark:text-gray-400">Knowledge graph not available</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">Graphiti service needs to be configured</p>
      </div>
    );
  }

  const facts = factData?.facts || [];
  const entities = entityData?.entities || [];

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
      {/* Success message */}
      {successMessage && (
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-[11px] text-green-700 dark:text-green-400">
          <CheckCircle className="w-3 h-3 flex-shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Record Learning Button / Form */}
      {!showRecordForm ? (
        <div className="flex justify-end">
          <button
            onClick={() => setShowRecordForm(true)}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Record
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-blue-500" />
              Record Learning
            </h4>
            <button
              onClick={() => setShowRecordForm(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-[10px]"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            placeholder="Title (optional)"
            value={learningName}
            onChange={e => setLearningName(e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-[11px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <textarea
            placeholder="What did you learn from this task?"
            value={learningContent}
            onChange={e => setLearningContent(e.target.value)}
            rows={3}
            className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded text-[11px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleRecordLearning}
            disabled={!learningContent.trim() || createEpisode.isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[11px] rounded hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {createEpisode.isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Save
          </button>
          {createEpisode.isError && (
            <p className="text-[10px] text-red-500">Failed to record learning. Please try again.</p>
          )}
        </div>
      )}

      {/* Related Facts */}
      <div className="border border-gray-200/80 dark:border-gray-800/80 rounded-lg overflow-hidden">
        <button
          onClick={() => setFactsExpanded(!factsExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-3 h-3 text-blue-500" />
            Related Facts
            {facts.length > 0 && (
              <span className="px-1 py-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[10px]">
                {facts.length}
              </span>
            )}
          </span>
          {factsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {factsExpanded && (
          <div className="px-3 pb-3 space-y-0">
            {factsLoading ? (
              <div className="flex items-center gap-2 py-3 text-[11px] text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching knowledge graph...
              </div>
            ) : facts.length === 0 ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 py-2">No related facts found</p>
            ) : (
              facts.map((fact: GraphitiFact) => (
                <FactCard key={fact.uuid} fact={fact} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Related Entities */}
      <div className="border border-gray-200/80 dark:border-gray-800/80 rounded-lg overflow-hidden">
        <button
          onClick={() => setEntitiesExpanded(!entitiesExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3 h-3 text-purple-500" />
            Related Entities
            {entities.length > 0 && (
              <span className="px-1 py-0 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-[10px]">
                {entities.length}
              </span>
            )}
          </span>
          {entitiesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {entitiesExpanded && (
          <div className="px-3 pb-3 space-y-0">
            {entitiesLoading ? (
              <div className="flex items-center gap-2 py-3 text-[11px] text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Searching entities...
              </div>
            ) : entities.length === 0 ? (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 py-2">No related entities found</p>
            ) : (
              entities.map((entity: GraphitiEntity) => (
                <EntityCard key={entity.uuid} entity={entity} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components

const FactCard: React.FC<{ fact: GraphitiFact }> = ({ fact }) => (
  <div className="py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0">
    <p className="text-xs text-gray-800 dark:text-gray-200">{fact.fact}</p>
    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
      {fact.created_at && (
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {formatDate(fact.created_at)}
        </span>
      )}
      {fact.source_node_name && fact.target_node_name && (
        <span className="flex items-center gap-1">
          <Link2 className="w-2.5 h-2.5" />
          {fact.source_node_name} &rarr; {fact.target_node_name}
        </span>
      )}
    </div>
  </div>
);

const EntityCard: React.FC<{ entity: GraphitiEntity }> = ({ entity }) => (
  <div className="py-2 border-b border-gray-100 dark:border-gray-800/60 last:border-b-0">
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-900 dark:text-white">{entity.name}</span>
      {entity.entity_type && (
        <span className="inline-flex items-center gap-0.5 px-1 py-0 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-[10px]">
          <Tag className="w-2.5 h-2.5" />
          {entity.entity_type}
        </span>
      )}
    </div>
    {entity.summary && (
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{entity.summary}</p>
    )}
  </div>
);

export default NodeKnowledgeTab;
