// src/components/details/NodeArtifactsTab.tsx
import React, { useState } from 'react';
import { useNodeArtifacts } from '../../hooks/useNodeArtifacts';
import { Artifact } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { Paperclip, Link as LinkIcon } from 'lucide-react';

interface NodeArtifactsTabProps {
  planId: string;
  nodeId: string;
}

const NodeArtifactsTab: React.FC<NodeArtifactsTabProps> = ({ planId, nodeId }) => {
  const { artifacts, isLoading, error, addArtifact, isAddingArtifact } = useNodeArtifacts(planId, nodeId);

  // State for the form
  const [name, setName] = useState('');
  const [contentType, setContentType] = useState('');
  const [url, setUrl] = useState('');

  const handleAddArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contentType.trim() || !url.trim()) return;
    addArtifact({ name, content_type: contentType, url }, {
        onSuccess: () => {
            // Clear form
            setName('');
            setContentType('');
            setUrl('');
        }
    });
  };

  if (isLoading) return <div className="p-4 text-center">Loading artifacts...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading artifacts.</div>;

  return (
    <div className="space-y-4">
      {/* Add Artifact Form */}
      <form onSubmit={handleAddArtifact} className="mt-4 space-y-3 p-3 border rounded dark:border-gray-600">
        <h4 className="text-xs font-medium mb-2">Add Artifact</h4>
        <div>
          <label htmlFor="artifactName" className="text-xs sr-only">Name</label>
          <input 
            type="text" 
            id="artifactName" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            placeholder="Artifact Name" 
            required 
            className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" 
            disabled={isAddingArtifact} 
          />
        </div>
        <div>
          <label htmlFor="artifactContentType" className="text-xs sr-only">Content Type</label>
          <input 
            type="text" 
            id="artifactContentType" 
            value={contentType} 
            onChange={e => setContentType(e.target.value)} 
            placeholder="Content Type (e.g., text/markdown)" 
            required 
            className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" 
            disabled={isAddingArtifact}
          />
        </div>
        <div>
          <label htmlFor="artifactUrl" className="text-xs sr-only">URL</label>
          <input 
            type="url" 
            id="artifactUrl" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="URL" 
            required 
            className="w-full p-1.5 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm" 
            disabled={isAddingArtifact}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={isAddingArtifact || !name.trim() || !contentType.trim() || !url.trim()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-xs"
          >
            {isAddingArtifact ? 'Adding...' : 'Add Artifact'}
          </button>
        </div>
      </form>

      {/* Artifacts List */}
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-6 border-t pt-4 dark:border-gray-700">
        Existing Artifacts ({artifacts.length})
      </h3>
      {artifacts.length > 0 ? (
        <ul className="space-y-2">
          {artifacts.map((artifact: Artifact) => (
            <li key={artifact.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm flex justify-between items-center">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-grow overflow-hidden">
                  <p className="text-gray-800 dark:text-gray-200 font-medium truncate" title={artifact.name}>{artifact.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={artifact.content_type}>{artifact.content_type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Added by {artifact.user?.name || 'Unknown'} on {formatDate(artifact.created_at)}
                  </p>
                </div>
              </div>
              <a 
                href={artifact.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0" 
                title={artifact.url}
              >
                <LinkIcon className="w-4 h-4"/>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No artifacts yet.</p>
      )}
    </div>
  );
};

export default NodeArtifactsTab;