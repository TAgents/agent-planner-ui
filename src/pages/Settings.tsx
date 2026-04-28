import { useState, useEffect } from 'react';
import { useTokens } from '../hooks/useTokens';
import { TokenPermission } from '../types';
import { Key, Copy, Check, X, AlertCircle, MoreHorizontal } from 'lucide-react';
import { McpSetupBlock } from '../components/common/McpSetupBlock';

const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return window.location.origin.replace('3001', '3000');
  if (hostname.includes('agentplanner.io')) return 'https://agentplanner.io/api';
  return window.location.origin.replace('agent-planner-ui', 'agent-planner-api');
};

const API_URL = getApiUrl();

const permClass: Record<string, string> = {
  admin: 'bg-red/15 text-red',
  write: 'bg-amber/15 text-amber',
  read: 'bg-emerald/15 text-emerald',
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

  const formatRelative = (d: string | null) => {
    if (!d) return 'never';
    const ms = Date.now() - new Date(d).getTime();
    const min = Math.floor(ms / 60000);
    if (min < 1) return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const formatCreated = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

  // The token endpoint returns camelCase from Drizzle's projected DAL while the
  // documented (Swagger) shape is snake_case. Read both so the UI works
  // regardless of which one the deployed API ships.
  const tokenLastUsed = (t: any): string | null => t.last_used ?? t.lastUsed ?? null;
  const tokenCreatedAt = (t: any): string | null => t.created_at ?? t.createdAt ?? null;

  return (
    <>
    <section className="flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <Key className="mt-1 h-4 w-4 text-text-sec" />
        <div className="flex-1">
          <h1 className="font-display text-[18px] font-semibold tracking-tight text-text">API tokens</h1>
          <p className="text-[12px] text-text-sec">
            Programmatic access for agents, CI, and integrations
            {activeOrg ? ` · ${activeOrg.name}` : ''}.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[12px] uppercase tracking-[0.18em] text-text-sec">
              Tokens
            </span>
            <span className="text-[11px] tabular-nums text-text-sec">{tokens.length}</span>
          </div>
          <button
            onClick={() => setOpenCreateDialog(true)}
            className="rounded-md border border-border bg-surface-hi px-2.5 py-1 text-[11px] font-medium text-text transition-colors hover:bg-bg"
          >
            + New token
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-3 flex items-center gap-2 rounded-md border border-red/40 bg-red/10 px-3 py-2 text-[11px] text-red">
            <AlertCircle className="h-3 w-3" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-text" />
          </div>
        ) : tokens.length === 0 ? (
          <p className="px-4 py-8 text-center text-[12px] text-text-sec">
            No tokens yet — create one to connect an agent or CI job.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {tokens.map((token) => (
              <li key={token.id} className="group flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border bg-surface-hi text-text-sec">
                  <Key className="h-3 w-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium text-text">{token.name}</div>
                  <div className="mt-0.5 truncate text-[11px] text-text-sec">
                    created {formatCreated(tokenCreatedAt(token))}
                    {tokenLastUsed(token) && ` · last used ${formatRelative(tokenLastUsed(token)!)}`}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {token.permissions.map((p) => (
                    <span
                      key={p}
                      className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${
                        permClass[p] || 'bg-surface-hi text-text-sec'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setTokenToRevoke(token.id);
                    setOpenConfirmDialog(true);
                  }}
                  className="rounded p-1 text-text-sec opacity-0 transition-opacity hover:text-red group-hover:opacity-100"
                  aria-label="Revoke token"
                  title="Revoke token"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[11px] text-text-sec">
        Need to wire a client? Head to{' '}
        <a href="/app/settings/agents" className="text-text underline underline-offset-2">
          Agents &amp; integrations
        </a>{' '}
        for ready-made config snippets per MCP client.
      </p>
    </section>

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
                  clients={['claude-code', 'claude-desktop', 'chatgpt', 'cursor', 'windsurf', 'cline', 'gemini']}
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
    </>
  );
};

export default Settings;
