// src/components/details/NodeArtifactsTab.tsx
import React, { useState } from 'react';
import { useNodeArtifacts } from '../../hooks/useNodeArtifacts';
import { Artifact } from '../../types';
import { formatDate } from '../../utils/planUtils';
import { Paperclip, Link as LinkIcon, Trash2, AlertTriangle, Info, X } from 'lucide-react';
import API_CONFIG from '../../config/api.config';

// Helper function to intelligently format file paths for display
const formatFilePath = (path: string): string => {
  if (!path) return '';
  
  // For URLs, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // For file paths, truncate the middle
  const parts = path.split('/');
  if (parts.length <= 3) return path;
  
  // Extract first part and last 2 parts
  const firstPart = parts[0] || '';
  const lastParts = parts.slice(-2).join('/');
  
  return `${firstPart}/.../${lastParts}`;
};

interface NodeArtifactsTabProps {
  planId: string;
  nodeId: string;
}

const NodeArtifactsTab: React.FC<NodeArtifactsTabProps> = ({ planId, nodeId }) => {
  const { 
    artifacts, 
    isLoading, 
    error, 
    addArtifact, 
    isAddingArtifact, 
    deleteArtifact, 
    isDeletingArtifact 
  } = useNodeArtifacts(planId, nodeId);

  // State for the form
  const [name, setName] = useState('');
  const [contentType, setContentType] = useState('');
  const [url, setUrl] = useState('');
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [artifactToDelete, setArtifactToDelete] = useState<Artifact | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check for duplicate names when the name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    
    // Check for duplicates only if we have a non-empty name
    if (newName.trim() && artifacts) {
      const isDuplicate = artifacts.some(artifact => 
        artifact.name.toLowerCase() === newName.toLowerCase()
      );
      setShowDuplicateWarning(isDuplicate);
    } else {
      setShowDuplicateWarning(false);
    }
  };

  const handleAddArtifact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contentType.trim() || !url.trim()) return;

    // Add file location to metadata if it's not already in the URL
    const metadata: Record<string, any> = {};
    if (!url.includes('://')) {
      metadata.fileLocation = url;
    }

    addArtifact({ 
      name, 
      content_type: contentType, 
      url, 
      metadata 
    }, {
      onSuccess: () => {
        // Clear form
        setName('');
        setContentType('');
        setUrl('');
        setShowDuplicateWarning(false);
      }
    });
  };

  const handleDeleteClick = (artifact: Artifact) => {
    setArtifactToDelete(artifact);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (artifactToDelete) {
      deleteArtifact(artifactToDelete.id, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setArtifactToDelete(null);
        }
      });
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setArtifactToDelete(null);
  };

  const handleDownload = (artifact: Artifact) => {
    console.log(`Initiating download for ${artifact.name}`);
    
    // Extract file path from artifact URL or metadata
    let filePath = artifact.url;
    
    if (artifact.metadata?.fileLocation) {
      filePath = artifact.metadata.fileLocation;
    } else if (!filePath.startsWith('http')) {
      // For local files that don't have a http prefix
      if (filePath.startsWith('file://')) {
        filePath = filePath.substring(7); // Remove file:// prefix
      }
    }
    
    // Create download indicator
    const downloadingToast = document.createElement('div');
    downloadingToast.className = 'fixed bottom-4 right-4 bg-blue-600 text-white py-2 px-4 rounded shadow-lg z-50';
    downloadingToast.innerText = `Downloading ${artifact.name}...`;
    document.body.appendChild(downloadingToast);
    
    // For external URLs, open in a new tab
    if (artifact.url.startsWith('http') && !artifact.url.includes(window.location.hostname)) {
      window.open(artifact.url, '_blank');
      
      // Remove downloading indicator after a delay
      setTimeout(() => {
        if (document.body.contains(downloadingToast)) {
          document.body.removeChild(downloadingToast);
        }
      }, 2000);
      
      return;
    }
    
    // For local files, use the API endpoint
    const apiBaseUrl = API_CONFIG.BASE_URL;
    
    // Try direct access first if we're in development
    if (process.env.NODE_ENV === 'development') {
      try {
        let directFilePath = filePath;
        
        // Extract relative path for docs
        if (filePath.includes('/docs/')) {
          const docsIndex = filePath.indexOf('/docs/') + 6; // +6 to skip '/docs/'
          directFilePath = filePath.substring(docsIndex);
        } else if (filePath.includes('docs/')) {
          const docsIndex = filePath.indexOf('docs/') + 5; // +5 to skip 'docs/'
          directFilePath = filePath.substring(docsIndex);
        } else {
          // Use basename as a fallback
          directFilePath = filePath.split('/').pop() || '';
        }
        
        console.log(`Trying direct file access: ${directFilePath}`);
        
        // Use the direct file access endpoint
        const directUrl = `${apiBaseUrl}/files/${directFilePath}`;
        window.open(directUrl, '_blank');
        
        // Remove downloading indicator after a delay
        setTimeout(() => {
          if (document.body.contains(downloadingToast)) {
            document.body.removeChild(downloadingToast);
          }
        }, 2000);
        
        return;
      } catch (e) {
        console.error('Error with direct file access, falling back to download API:', e);
      }
    }
    
    // Ensure the filename has the proper extension
    let fileName = artifact.name;
    const fileExtension = getFileExtensionFromPath(filePath);
    const fileContentType = artifact.content_type;
    
    // If file doesn't have extension, try to add one based on content type or file path
    if (!fileName.includes('.')) {
      if (fileExtension) {
        fileName = `${fileName}.${fileExtension}`;
      } else if (fileContentType === 'text/markdown') {
        fileName = `${fileName}.md`;
      } else if (fileContentType === 'application/json') {
        fileName = `${fileName}.json`;
      } else if (fileContentType === 'text/plain') {
        fileName = `${fileName}.txt`;
      }
    }
    
    console.log(`Download path: ${filePath}`);
    console.log(`Download filename: ${fileName}`);
    
    // Construct the download URL with proper query parameters
    const downloadUrl = `${apiBaseUrl}/download?path=${encodeURIComponent(filePath)}&filename=${encodeURIComponent(fileName)}`;
    
    // Get the auth token
    const sessionStr = localStorage.getItem('supabase_session');
    let authToken = '';
    
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.access_token) {
          authToken = session.access_token;
        }
      } catch (e) {
        console.error('Failed to parse session', e);
      }
    }
    
    // Use fetch API to download with proper authentication
    fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      return response.blob();
    })
    .then(blob => {
      // Remove download indicator
      if (document.body.contains(downloadingToast)) {
        document.body.removeChild(downloadingToast);
      }
      
      // Create success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded shadow-lg z-50';
      successToast.innerText = `${artifact.name} downloaded successfully!`;
      document.body.appendChild(successToast);
      setTimeout(() => {
        if (document.body.contains(successToast)) {
          document.body.removeChild(successToast);
        }
      }, 3000);
      
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
      setTimeout(() => {
        if (document.body.contains(errorToast)) {
          document.body.removeChild(errorToast);
        }
      }, 5000);
    });
  };
  
  // Helper function to extract file extension from path
  const getFileExtensionFromPath = (path: string): string => {
    if (!path) return '';
    
    // Extract filename from path
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    
    // Extract extension
    const extensionMatch = filename.match(/\.([^.]+)$/);
    return extensionMatch ? extensionMatch[1] : '';
  };

  if (isLoading) return <div className="p-4 text-center">Loading artifacts...</div>;
  if (error) return <div className="p-4 text-red-600">Error loading artifacts.</div>;

  return (
    <div className="space-y-4">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
            </div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete the artifact "<strong>{artifactToDelete?.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeletingArtifact}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingArtifact ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Artifact Form */}
      <form onSubmit={handleAddArtifact} className="mt-4 space-y-3 p-4 border border-blue-100 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 shadow-sm">
        <h4 className="text-sm font-medium mb-2 text-blue-700 dark:text-blue-400">Add New Artifact</h4>
        <div>
          <label htmlFor="artifactName" className="text-xs sr-only">Name</label>
          <input 
            type="text" 
            id="artifactName" 
            value={name} 
            onChange={handleNameChange} 
            placeholder="Artifact Name" 
            required 
            className={`w-full p-2 border rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
              showDuplicateWarning 
                ? 'border-yellow-500 dark:bg-gray-700 dark:border-yellow-500' 
                : 'dark:bg-gray-700 dark:border-gray-600'
            }`} 
            disabled={isAddingArtifact} 
          />
          {showDuplicateWarning && (
            <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              An artifact with this name already exists. Consider using a different name.
            </div>
          )}
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
            className="w-full p-2 border rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 dark:bg-gray-700 dark:border-gray-600" 
            disabled={isAddingArtifact}
          />
        </div>
        <div>
          <label htmlFor="artifactUrl" className="text-xs sr-only">URL</label>
          <input 
            type="text" 
            id="artifactUrl" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="URL or File Path" 
            required 
            className="w-full p-2 border rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 dark:bg-gray-700 dark:border-gray-600" 
            disabled={isAddingArtifact}
          />
        </div>
        <div className="text-right">
          <button
            type="submit"
            disabled={isAddingArtifact || !name.trim() || !contentType.trim() || !url.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 text-sm font-medium transition duration-200 focus:ring-2 focus:outline-none focus:ring-blue-500 focus:ring-offset-2"
          >
            {isAddingArtifact ? 'Adding...' : 'Add Artifact'}
          </button>
        </div>
      </form>

      {/* Artifacts List */}
      <div className="flex items-center justify-between mt-6 border-t pt-4 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Existing Artifacts ({artifacts.length})
        </h3>
        {artifacts.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            Click <LinkIcon className="inline-block w-3 h-3 mx-1" /> to download
          </span>
        )}
      </div>
      {artifacts.length > 0 ? (
        <ul className="space-y-2">
          {artifacts.map((artifact: Artifact) => (
            <li key={artifact.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm hover:shadow-md transition duration-200">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2 overflow-hidden">
                  <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-grow overflow-hidden">
                    <p className="text-gray-800 dark:text-gray-200 font-medium truncate" title={artifact.name}>{artifact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={artifact.content_type}>{artifact.content_type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      <span className="font-medium">ID:</span> <span className="font-mono">{artifact.id}</span>
                    </p>
                    
                    {/* File location information */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="font-medium">Location:</span> 
                      <span className="font-mono truncate inline-block max-w-[300px]" title={artifact.metadata?.fileLocation || artifact.url}>
                        {formatFilePath(artifact.metadata?.fileLocation || artifact.url)}
                      </span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(artifact.metadata?.fileLocation || artifact.url)}
                        className="ml-1 text-blue-500 hover:text-blue-700 inline-flex items-center"
                        title="Copy file path"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </button>
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Added by {artifact.user?.name || artifact.created_by || 'Unknown'} on {formatDate(artifact.created_at || new Date())}
                    </p>
                  </div>
                </div>
                <div className="flex ml-2 space-x-2">
                  <button
                    className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0"
                    title={`Download ${artifact.name}`}
                    onClick={() => handleDownload(artifact)}
                  >
                    <LinkIcon className="w-4 h-4"/>
                  </button>
                  <button
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex-shrink-0"
                    title={`Delete ${artifact.name}`}
                    onClick={() => handleDeleteClick(artifact)}
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              </div>
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