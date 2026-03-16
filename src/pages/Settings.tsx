import { useState, useEffect } from 'react';
import { useTokens } from '../hooks/useTokens';
import { TokenPermission } from '../types';
import { Key, Copy, Trash2, AlertCircle, Check, X, ChevronDown } from 'lucide-react';
import { SettingsNav } from '../components/settings/SettingsLayout';
import { McpSetupBlock } from '../components/common/McpSetupBlock';

// Compute API URL once
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return window.location.origin.replace('3001', '3000');
  if (hostname.includes('agentplanner.io')) return 'https://agentplanner.io/api';
  return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
};

const API_URL = getApiUrl();

const permColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  write: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  read: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
};

const Settings: React.FC = () => {
  const { tokens, loading, error, newToken, createToken, revokeToken, clearNewToken, fetchTokens } = useTokens();

  useEffect(() => { fetchTokens(); }, [fetchTokens]);

  // Get active org name for display
  const activeOrgId = localStorage.getItem('active_org_id');
  const session = JSON.parse(localStorage.getItem('auth_session') || '{}');
  const orgs: { id: string; name: string }[] = session.user?.organizations || [];
  const activeOrg = orgs.find(o => o.id === activeOrgId);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<TokenPermission[]>(['read']);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [showSetup, setShowSetup] = useState(true);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateToken = async () => {
    try {
      await createToken(tokenName, selectedPermissions);
      setOpenCreateDialog(false);
      setTokenName('');
      setSelectedPermissions(['read']);
      fetchTokens();
      showNotification('Token created', 'success');
    } catch (err: any) {
      showNotification(`Failed: ${err.message}`, 'error');
    }
  };

  const handleRevokeToken = async () => {
    if (tokenToRevoke) {
      try {
        await revokeToken(tokenToRevoke);
        showNotification('Token revoked', 'success');
      } catch (err: any) {
        showNotification(`Failed: ${err.message}`, 'error');
      }
    }
    setOpenConfirmDialog(false);
    setTokenToRevoke(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => showNotification(`${label} copied`, 'success'));
  };

  const copyTokenToClipboard = () => {
    if (newToken?.token) {
      navigator.clipboard.writeText(newToken.token).then(() => {
        setTokenCopied(true);
        showNotification('Token copied', 'success');
      });
    }
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : 'Never';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SettingsNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">

        {/* AI Integration — collapsible */}
        <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80 mb-4">
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="w-full flex items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-xs font-semibold text-gray-900 dark:text-white">AI Integration Setup</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showSetup ? 'rotate-180' : ''}`} />
          </button>

          {showSetup && (
            <div className="px-4 pb-4">
              <McpSetupBlock
                apiUrl={API_URL}
                clients={['claude-code', 'claude-desktop', 'chatgpt', 'editors', 'gemini']}
                onCreateToken={() => setOpenCreateDialog(true)}
                showDocs
                showClaudeCodeHint
                showChatGptHint
                bare
              />
            </div>
          )}
        </div>

        {/* API Tokens */}
        <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-semibold text-gray-900 dark:text-white">API Tokens</h2>
              {activeOrg && <span className="text-[11px] text-gray-400 ml-1">{activeOrg.name}</span>}
              <span className="text-[10px] text-gray-400 tabular-nums">{tokens.length}</span>
            </div>
            <button
              onClick={() => setOpenCreateDialog(true)}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
            >
              + New
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
              </div>
            ) : tokens.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">No tokens yet</p>
            ) : (
              <div className="space-y-1.5">
                {tokens.map((token) => (
                  <div key={token.id} className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-900 dark:text-white">{token.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{formatDate(token.created_at)}</span>
                        {token.last_used && (
                          <span className="text-[10px] text-gray-400">· used {formatDate(token.last_used)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {token.permissions.map((p) => (
                        <span key={p} className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${permColors[p] || 'bg-gray-100 text-gray-600'}`}>
                          {p}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => { setTokenToRevoke(token.id); setOpenConfirmDialog(true); }}
                      className="p-1 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Token Modal */}
      {openCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenCreateDialog(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm mx-4 shadow-xl border border-gray-200/80 dark:border-gray-800/80">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Create Token</h3>
            </div>
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Token name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                autoFocus
              />
              <fieldset>
                <legend className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">Permissions</legend>
                <div className="flex gap-3">
                  {(['read', 'write', 'admin'] as TokenPermission[]).map((p) => (
                    <label key={p} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-3 w-3 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                        checked={selectedPermissions.includes(p)}
                        onChange={() => setSelectedPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      />
                      <span className="capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/60 flex justify-end gap-2">
              <button onClick={() => setOpenCreateDialog(false)} className="px-3 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                Cancel
              </button>
              <button
                onClick={handleCreateToken}
                disabled={!tokenName.trim()}
                className="px-3 py-1.5 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirm Modal */}
      {openConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpenConfirmDialog(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg w-full max-w-xs mx-4 shadow-xl border border-gray-200/80 dark:border-gray-800/80">
            <div className="p-4">
              <p className="text-xs text-gray-900 dark:text-white font-medium mb-1">Revoke this token?</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Applications using it will lose access.</p>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/60 flex justify-end gap-2">
              <button onClick={() => setOpenConfirmDialog(false)} className="px-3 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                Cancel
              </button>
              <button
                onClick={handleRevokeToken}
                className="px-3 py-1.5 text-[11px] font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Token Modal */}
      {newToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={clearNewToken} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg w-full max-w-md mx-4 shadow-xl border border-gray-200/80 dark:border-gray-800/80">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/60">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white">Save Your Token</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800/40 rounded-md">
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">This token won't be shown again.</p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-md px-3 py-2 border border-gray-200 dark:border-gray-800">
                <code className="flex-1 text-[11px] font-mono text-gray-900 dark:text-white break-all">
                  {tokenCopied ? '••••••••••••••••••••••••••••••••' : newToken.token}
                </code>
                <button onClick={copyTokenToClipboard} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0">
                  {tokenCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* Quick setup with new token */}
              <div className="bg-gray-50 dark:bg-gray-800/30 rounded-md p-3">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Quick Setup</p>
                <McpSetupBlock
                  apiUrl={API_URL}
                  token={newToken.token}
                  clients={['claude-code', 'claude-desktop', 'chatgpt', 'editors', 'gemini']}
                  bare
                />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800/60 flex justify-end">
              <button onClick={clearNewToken} className="px-3 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md shadow-lg border text-xs font-medium ${
          notification.type === 'success'
            ? 'bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          {notification.type === 'success' ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
          {notification.message}
          <button onClick={() => setNotification(null)} className="ml-1 opacity-50 hover:opacity-100">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;
