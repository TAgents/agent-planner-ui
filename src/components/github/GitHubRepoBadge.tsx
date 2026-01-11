import React, { useState } from 'react';
import { Github, ExternalLink, Link2, Unlink } from 'lucide-react';
import GitHubRepoLinkModal from './GitHubRepoLinkModal';

interface GitHubRepoBadgeProps {
  planId: string;
  owner?: string | null;
  name?: string | null;
  isOwner?: boolean;
  onLinked?: () => void;
  variant?: 'compact' | 'full';
  showUnlink?: boolean;
}

const GitHubRepoBadge: React.FC<GitHubRepoBadgeProps> = ({
  planId,
  owner,
  name,
  isOwner = false,
  onLinked,
  variant = 'compact',
  showUnlink = false,
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);

  const hasRepo = owner && name;
  const repoUrl = hasRepo ? `https://github.com/${owner}/${name}` : null;

  const handleLinkClick = () => {
    if (hasRepo && repoUrl) {
      window.open(repoUrl, '_blank', 'noopener,noreferrer');
    } else if (isOwner) {
      setShowLinkModal(true);
    }
  };

  const handleLinked = () => {
    onLinked?.();
    setShowLinkModal(false);
  };

  if (variant === 'compact') {
    if (!hasRepo && !isOwner) return null;

    return (
      <>
        <button
          onClick={handleLinkClick}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm transition-colors ${
            hasRepo
              ? 'bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
          title={hasRepo ? `View ${owner}/${name} on GitHub` : 'Link GitHub repository'}
        >
          <Github className="w-4 h-4" />
          {hasRepo ? (
            <>
              <span className="max-w-[120px] truncate">{owner}/{name}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </>
          ) : (
            <>
              <Link2 className="w-3 h-3" />
              <span>Link Repo</span>
            </>
          )}
        </button>

        <GitHubRepoLinkModal
          isOpen={showLinkModal}
          onClose={() => setShowLinkModal(false)}
          planId={planId}
          currentRepo={hasRepo ? { owner: owner!, name: name! } : null}
          onLinked={handleLinked}
        />
      </>
    );
  }

  // Full variant - shows more details
  return (
    <>
      <div className={`flex items-center gap-3 p-3 rounded-lg border ${
        hasRepo
          ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          : 'bg-gray-50 border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-600'
      }`}>
        <div className={`p-2 rounded-lg ${
          hasRepo
            ? 'bg-gray-900 dark:bg-white'
            : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          <Github className={`w-5 h-5 ${
            hasRepo
              ? 'text-white dark:text-gray-900'
              : 'text-gray-500 dark:text-gray-400'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          {hasRepo ? (
            <>
              <a
                href={repoUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1"
              >
                {owner}/{name}
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400">Linked GitHub repository</p>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No repository linked</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOwner ? 'Link a GitHub repo to enable integrations' : 'Owner has not linked a repository'}
              </p>
            </>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-2">
            {hasRepo && showUnlink && (
              <button
                onClick={() => setShowLinkModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Change linked repository"
              >
                <Unlink className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {hasRepo ? 'Change' : 'Link Repository'}
            </button>
          </div>
        )}
      </div>

      <GitHubRepoLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        planId={planId}
        currentRepo={hasRepo ? { owner: owner!, name: name! } : null}
        onLinked={handleLinked}
      />
    </>
  );
};

export default GitHubRepoBadge;
