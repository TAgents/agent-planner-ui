import React, { useState, useEffect } from 'react';
import { useTokens } from '../hooks/useTokens';
import { TokenPermission } from '../types';
import { Key, Copy, Eye, EyeOff, Trash2, AlertCircle, Check, X, Bug } from 'lucide-react';
import api from '../services/api';

const Settings: React.FC = () => {
  const { 
    tokens, 
    loading, 
    error, 
    newToken, 
    createToken, 
    revokeToken, 
    clearNewToken,
    fetchTokens 
  } = useTokens();
  
  // Debug logging to see what's happening
  console.log('Tokens in Settings component:', tokens);
  console.log('Loading state:', loading);
  console.log('Error state:', error);
  console.log('New token:', newToken);
  
  // Ensure tokens are fetched when component mounts
  React.useEffect(() => {
    console.log('Settings component mounted, fetching tokens...');
    fetchTokens();
  }, [fetchTokens]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<TokenPermission[]>(['read']);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Available permissions
  const availablePermissions: TokenPermission[] = ['read', 'write', 'admin'];

  // Handle creating a new token
  const handleCreateToken = async () => {
    try {
      console.log('Creating token in Settings component with name:', tokenName);
      const result = await createToken(tokenName, selectedPermissions);
      console.log('Token creation result:', result);
      
      setOpenCreateDialog(false);
      setTokenName('');
      setSelectedPermissions(['read']);
      
      // Force refresh the token list
      console.log('Manually refreshing token list after creation');
      fetchTokens();
      
      showNotification('Token created successfully', 'success');
    } catch (err: any) {
      console.error('Error creating token in Settings component:', err);
      showNotification(`Failed to create token: ${err.message}`, 'error');
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permission: TokenPermission) => {
    setSelectedPermissions(prevPermissions => {
      if (prevPermissions.includes(permission)) {
        return prevPermissions.filter(p => p !== permission);
      } else {
        return [...prevPermissions, permission];
      }
    });
  };

  // Handle token revocation confirmation
  const handleConfirmRevoke = (tokenId: string) => {
    setTokenToRevoke(tokenId);
    setOpenConfirmDialog(true);
  };

  // Handle actual token revocation
  const handleRevokeToken = async () => {
    if (tokenToRevoke) {
      try {
        await revokeToken(tokenToRevoke);
        showNotification('Token revoked successfully', 'success');
      } catch (err: any) {
        showNotification(`Failed to revoke token: ${err.message}`, 'error');
      }
    }
    setOpenConfirmDialog(false);
    setTokenToRevoke(null);
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Copy token to clipboard
  const copyTokenToClipboard = () => {
    if (newToken?.token) {
      navigator.clipboard.writeText(newToken.token)
        .then(() => {
          setTokenCopied(true);
          showNotification('Token copied to clipboard', 'success');
        })
        .catch(() => {
          showNotification('Failed to copy token to clipboard', 'error');
        });
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  // Get permission badge color
  const getPermissionColor = (permission: TokenPermission) => {
    switch (permission) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'write':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'read':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

        {/* API Tokens Section */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">API Tokens</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTokens()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Refresh List
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.debug.debugTokens();
                    showNotification('Debug tokens API called, check console logs', 'success');
                  } catch (err) {
                    showNotification('Debug API call failed', 'error');
                  }
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              >
                <Bug className="h-4 w-4 mr-1" /> Debug
              </button>
              <button
                onClick={() => setOpenCreateDialog(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Token
              </button>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              API tokens allow external applications like Claude Desktop to access the planning system on your behalf.
              These tokens don't expire unless revoked, making them perfect for long-running applications.
            </p>

            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tokens...</p>
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-gray-600 dark:text-gray-400">You haven't created any API tokens yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tokens.map((token) => (
                      <tr key={token.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {token.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(token.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(token.last_used)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-1">
                            {token.permissions.map((permission) => (
                              <span 
                                key={permission} 
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleConfirmRevoke(token.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 focus:outline-none"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Token Dialog */}
      {openCreateDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setOpenCreateDialog(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all sm:max-w-lg">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New API Token</h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label htmlFor="tokenName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Token Name
                </label>
                <input
                  type="text"
                  id="tokenName"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Claude Desktop MCP"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  required
                />
              </div>
              <fieldset className="mb-4">
                <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</legend>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center">
                      <input
                        id={`permission-${permission}`}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={selectedPermissions.includes(permission)}
                        onChange={() => handlePermissionChange(permission)}
                      />
                      <label htmlFor={`permission-${permission}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {permission}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setOpenCreateDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCreateToken}
                disabled={!tokenName.trim()}
              >
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Revoke Dialog */}
      {openConfirmDialog && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setOpenConfirmDialog(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Revoke API Token</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Are you sure you want to revoke this token? This action cannot be undone.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400">
                Any applications using this token will no longer be able to access the API.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setOpenConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleRevokeToken}
              >
                Revoke Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Token Dialog */}
      {newToken && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={clearNewToken}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 shadow-xl transform transition-all">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Save Your New API Token</h3>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md flex">
                <AlertCircle className="h-5 w-5 text-yellow-800 dark:text-yellow-200 flex-shrink-0 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    This token will only be shown once!
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Copy this token now and store it securely. You won't be able to see it again.
                  </p>
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md flex justify-between items-center mb-6">
                <code className="flex-grow text-sm font-mono whitespace-pre-wrap break-all dark:text-white">
                  {tokenCopied ? '••••••••••••••••••••••••••••••••••••••••••••••••••••••••' : newToken.token}
                </code>
                <button
                  onClick={copyTokenToClipboard}
                  className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 focus:outline-none"
                  title={tokenCopied ? "Copied!" : "Copy to clipboard"}
                >
                  {tokenCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <h4 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">How to use this token</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Configure your MCP server with this token:
              </p>

              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1">In your .env file:</h5>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm font-mono mb-4 overflow-x-auto">
                {`USER_API_TOKEN=${tokenCopied ? '••••••••••••••••••••' : newToken.token?.substring(0, 25) + '...'}`}
              </pre>

              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-1">In your claude_desktop_config.json:</h5>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-sm font-mono overflow-x-auto">
{`"mcpServers": {
  "planning-system-mcp": {
    "command": "node",
    "args": ["/path/to/agent-planner-mcp/src/index.js"],
    "env": {
      "USER_API_TOKEN": "${tokenCopied ? '•••••••••••••••••••••••' : newToken.token?.substring(0, 25) + '...'}"
    }
  }
}`}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={clearNewToken}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                {notification.type === 'success' ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setNotification(null)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
