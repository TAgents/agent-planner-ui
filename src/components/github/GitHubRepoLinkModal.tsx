import React, { useState } from 'react';
import { X, Github, Link as LinkIcon, AlertCircle } from 'lucide-react';
import api from '../../services/api';

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

  const handleClear = () => {
    setOwner('');
    setName('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
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

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex justify-end space-x-3 mt-6">
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
              <LinkIcon className="w-4 h-4" />
              <span>{loading ? 'Linking...' : 'Link Repository'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GitHubRepoLinkModal;
