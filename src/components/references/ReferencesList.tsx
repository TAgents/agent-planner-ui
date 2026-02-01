import React from 'react';
import { Link as LinkIcon, Plus } from 'lucide-react';
import { ReferenceCard, ReferenceType, ReferenceStatus } from './ReferenceCard';
import { Artifact } from '../../types';

export interface Reference {
  id: string;
  title: string;
  url: string;
  refType: ReferenceType;
  status?: ReferenceStatus;
  externalId?: string;
  addedAt?: string;
}

interface ReferencesListProps {
  artifacts: Artifact[];
  onDeleteReference?: (id: string) => void;
  onAddReference?: () => void;
  readOnly?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Converts an artifact with content_type="reference" to a Reference object
 */
const artifactToReference = (artifact: Artifact): Reference => {
  const metadata = artifact.metadata || {};
  return {
    id: artifact.id,
    title: artifact.name,
    url: artifact.url,
    refType: (metadata.ref_type as ReferenceType) || 'other',
    status: (metadata.status as ReferenceStatus) || null,
    externalId: metadata.external_id as string | undefined,
    addedAt: metadata.added_at as string || artifact.created_at
  };
};

/**
 * Filters artifacts to get only references (content_type="reference")
 */
export const filterReferences = (artifacts: Artifact[]): Artifact[] => {
  return artifacts.filter(a => a.content_type === 'reference');
};

/**
 * Filters artifacts to get only non-reference files
 */
export const filterFiles = (artifacts: Artifact[]): Artifact[] => {
  return artifacts.filter(a => a.content_type !== 'reference');
};

export const ReferencesList: React.FC<ReferencesListProps> = ({
  artifacts,
  onDeleteReference,
  onAddReference,
  readOnly = false,
  collapsed = false,
  onToggleCollapse
}) => {
  const referenceArtifacts = filterReferences(artifacts);
  const references = referenceArtifacts.map(artifactToReference);
  
  if (references.length === 0 && readOnly) {
    return null; // Don't show empty section in read-only mode
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            References
          </h3>
          {references.length > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded">
              {references.length}
            </span>
          )}
        </div>
        
        {!readOnly && onAddReference && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddReference();
            }}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400
                       hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>
      
      {/* Content */}
      {!collapsed && (
        <div className="px-4 pb-4">
          {references.length === 0 ? (
            <div className="text-center py-6">
              <LinkIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No references yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                References link this task to external resources like PRs, issues, or documents
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {references.map((ref) => (
                <ReferenceCard
                  key={ref.id}
                  {...ref}
                  onDelete={onDeleteReference}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferencesList;
