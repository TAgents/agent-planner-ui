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
          {artifacts.map((artifact: any) => (
            <li key={artifact.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm flex justify-between items-center">
              <div className="flex items-center space-x-2 overflow-hidden">
                <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="flex-grow overflow-hidden">
                  <p className="text-gray-800 dark:text-gray-200 font-medium truncate" title={artifact.name}>{artifact.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={artifact.content_type}>{artifact.content_type}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Added by {artifact.user?.name || artifact.created_by || 'Unknown'} on {formatDate(artifact.created_at || new Date())}
                  </p>
                </div>
              </div>
              <button
                className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0"
                title={`Download ${artifact.name}`}
                onClick={() => {
                  if (artifact.url.startsWith('file://') || !artifact.url.startsWith('http')) {
                    const fileName = artifact.name;
                    console.log(`Initiating download for ${fileName}`);
                    
                    // Create download indicator
                    const downloadingToast = document.createElement('div');
                    downloadingToast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white py-2 px-4 rounded shadow-lg z-50';
                    downloadingToast.innerText = `Downloading ${fileName}...`;
                    document.body.appendChild(downloadingToast);
                    
                    // Create a direct download approach
                    const handleDirectDownload = () => {
                      try {
                        // Use a direct link with new window to bypass React Router
                        const apiBaseUrl = 'http://localhost:3000';
                        const downloadUrl = `${apiBaseUrl}/download/${encodeURIComponent(fileName)}`;
                        console.log(`Opening simple download URL: ${downloadUrl}`);
                        
                        // Create a link element
                        const a = document.createElement('a');
                        a.href = downloadUrl;
                        a.download = fileName; // Set download attribute
                        a.target = '_blank'; // Open in new tab/window
                        a.rel = 'noopener noreferrer';
                        
                        // Add Authorization header via a custom attribute for debugging
                        const token = localStorage.getItem('auth_token');
                        if (token) {
                          a.setAttribute('data-auth', token);
                        }
                        
                        // Click the link
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        
                        // Close the download toast after a delay
                        setTimeout(() => {
                          if (document.body.contains(downloadingToast)) {
                            document.body.removeChild(downloadingToast);
                            
                            // Show completion toast
                            const successToast = document.createElement('div');
                            successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded shadow-lg z-50';
                            successToast.innerText = `Download initiated for ${fileName}`;
                            document.body.appendChild(successToast);
                            setTimeout(() => {
                              if (document.body.contains(successToast)) {
                                document.body.removeChild(successToast);
                              }
                            }, 3000);
                          }
                        }, 2000);
                        
                        return true;
                      } catch (error) {
                        console.error('Error with direct download:', error);
                        return false;
                      }
                    };
                    
                    // Try the direct download approach first
                    if (handleDirectDownload()) {
                      console.log('Direct download initiated successfully');
                      return; // Exit if direct download worked
                    }
                    
                    // Try the direct approach with fetch as a fallback
                    const fallbackUrl = `http://localhost:3000/download/${encodeURIComponent(fileName)}`;
                    console.log(`Trying fetch fallback: ${fallbackUrl}`);
                    
                    fetch(fallbackUrl, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                      }
                    })
                    .then(response => {
                      console.log('Download response:', response.status, response.statusText, response.headers.get('Content-Type'));
                      if (!response.ok) {
                        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                      }
                      return response.blob();
                    })
                    .then(blob => {
                      console.log('Downloaded blob:', blob.type, 'size:', blob.size);
                      
                      // Remove download indicator
                      document.body.removeChild(downloadingToast);
                      
                      // Create success toast
                      const successToast = document.createElement('div');
                      successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded shadow-lg z-50';
                      successToast.innerText = `${fileName} downloaded successfully!`;
                      document.body.appendChild(successToast);
                      setTimeout(() => document.body.removeChild(successToast), 3000);
                      
                      // Create download link for the blob
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = fileName;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                    })
                    .catch(error => {
                      console.error('Download error:', error.message);
                      
                      // Remove downloading indicator
                      if (document.body.contains(downloadingToast)) {
                        document.body.removeChild(downloadingToast);
                      }
                      
                      // Create error indicator
                      const errorToast = document.createElement('div');
                      errorToast.className = 'fixed bottom-4 right-4 bg-red-600 text-white py-2 px-4 rounded shadow-lg z-50';
                      errorToast.innerText = `Error: ${error.message}`;
                      document.body.appendChild(errorToast);
                      setTimeout(() => document.body.removeChild(errorToast), 5000);
                    });
                  } else {
                    // For external URLs, open in new tab
                    window.open(artifact.url, '_blank');
                  }
                }}
              >
                <LinkIcon className="w-4 h-4"/>
              </button>
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