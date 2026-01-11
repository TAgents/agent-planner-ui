import React, { useState, useEffect, useCallback } from 'react';
import { X, Github, Link as LinkIcon, AlertCircle, Search, Star, Lock, Globe, Loader2 } from 'lucide-react';
import api, { githubService } from '../../services/api';

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  description: string | null;
  html_url: string;
  private: boolean;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
}

interface GitHubRepoLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  currentRepo?: {
    owner: string;
    name: string;
    url?: string;
    fullName?: string;
  } | null;
  onLinked: () => void;
}

const GitHubRepoLinkModal: React.FC<GitHubRepoLinkModalProps> = ({
  isOpen,
  onClose,
  planId,
  currentRepo,
  onLinked,
}) => {
  const [owner, setOwner] = useState(currentRepo?.owner || '');
  const [name, setName] = useState(currentRepo?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub connection state
  const [isGitHubConnected, setIsGitHubConnected] = useState<boolean | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Repo search state
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepoList, setShowRepoList] = useState(false);

  // Check GitHub connection on mount
  useEffect(() => {
    if (!isOpen) return;

    const checkConnection = async () => {
      setCheckingConnection(true);
      try {
        const status = await githubService.checkConnection();
        setIsGitHubConnected(status.connected);
      } catch (err) {
        console.error('Error checking GitHub connection:', err);
        setIsGitHubConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkConnection();
  }, [isOpen]);

  // Load user's repos when connected
  useEffect(() => {
    if (!isGitHubConnected || !isOpen) return;

    const loadRepos = async () => {
      setLoadingRepos(true);
      try {
        const result = await githubService.listRepos();
        setRepos(result.repos || []);
      } catch (err) {
        console.error('Error loading repos:', err);
      } finally {
        setLoadingRepos(false);
      }
    };

    loadRepos();
  }, [isGitHubConnected, isOpen]);

  // Filter repos based on search
  const filteredRepos = useCallback(() => {
    if (!searchQuery.trim()) return repos;
    const query = searchQuery.toLowerCase();
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(query) ||
      repo.full_name.toLowerCase().includes(query) ||
      repo.description?.toLowerCase().includes(query)
    );
  }, [repos, searchQuery]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.plans.linkGitHubRepo(planId, owner, name);
      onLinked();
      onClose();
    } catch (err: any) {
      console.error('Failed to link repository:', err);
      setError(err.message || 'Failed to link repository');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRepo = (repo: GitHubRepo) => {
    setOwner(repo.owner);
    setName(repo.name);
    setShowRepoList(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setOwner('');
    setName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="bg-gray-900 dark:bg-white rounded-full p-2">
              <Github className="w-5 h-5 text-white dark:text-gray-900" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Link GitHub Repository
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* GitHub Connection Status */}
        {checkingConnection ? (
          <div className="mb-4 flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span className="text-sm text-gray-500">Checking GitHub connection...</span>
          </div>
        ) : isGitHubConnected ? (
          <>
            {/* Repo Search/Select */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select from your repositories
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowRepoList(true);
                  }}
                  onFocus={() => setShowRepoList(true)}
                  placeholder="Search your repositories..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                />
              </div>

              {/* Repo List */}
              {showRepoList && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
                  {loadingRepos ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                      <span className="text-sm text-gray-500">Loading repositories...</span>
                    </div>
                  ) : filteredRepos().length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-500">
                      {searchQuery ? 'No repositories found' : 'No repositories available'}
                    </div>
                  ) : (
                    filteredRepos().map((repo) => (
                      <button
                        key={repo.id}
                        type="button"
                        onClick={() => handleSelectRepo(repo)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {repo.full_name}
                              </span>
                              {repo.private ? (
                                <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              ) : (
                                <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {repo.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                            {repo.language && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {repo.language}
                              </span>
                            )}
                            {repo.stargazers_count > 0 && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <Star className="w-3 h-3" />
                                {repo.stargazers_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative flex items-center my-4">
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
              <span className="px-3 text-xs text-gray-500 dark:text-gray-400 uppercase">or enter manually</span>
              <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            </div>
          </>
        ) : (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>GitHub not connected.</strong> Sign in with GitHub to access your repositories,
              or enter repository details manually below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto">
          <div>
            <label
              htmlFor="owner"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Repository Owner
            </label>
            <input
              id="owner"
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="facebook"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              GitHub username or organization name
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Repository Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="react"
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The name of the repository
            </p>
          </div>

          {owner && name && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repository URL:</p>
              <a
                href={`https://github.com/${owner}/${name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
              >
                <Github className="w-4 h-4 mr-1" />
                {owner}/{name}
              </a>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !owner || !name}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              <span>{loading ? 'Linking...' : 'Link Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubRepoLinkModal;
