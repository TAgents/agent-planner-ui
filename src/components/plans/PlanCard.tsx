import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plan } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { Lock, Unlock, Github, TrendingUp } from 'lucide-react';

interface PlanCardProps {
  plan: Plan & {
    metadata?: {
      is_public?: boolean;
      github_repo_owner?: string;
      github_repo_name?: string;
      view_count?: number;
    };
  };
}

/**
 * PlanCard component displays a plan with public/private badge, progress, and GitHub link
 * Matches the landing page DashboardHeader design system
 */
export const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const navigate = useNavigate();

  // Extract metadata
  const isPublic = plan.metadata?.is_public || false;
  const githubOwner = plan.metadata?.github_repo_owner;
  const githubName = plan.metadata?.github_repo_name;
  const hasGithubRepo = githubOwner && githubName;

  // Calculate progress - default to 0 if not set
  const progress = plan.progress || 0;

  // Format last updated timestamp
  const lastUpdated = formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true });

  const handleCardClick = () => {
    navigate(`/app/plans/${plan.id}`);
  };

  const handleGithubClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (hasGithubRepo) {
      window.open(`https://github.com/${githubOwner}/${githubName}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
    >
      {/* Header with public/private badge and GitHub link */}
      <div className="flex items-start justify-between mb-4">
        {/* Public/Private Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border-2 whitespace-nowrap ${
            isPublic
              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
              : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
          }`}
          title={isPublic ? 'This is a public plan - anyone can view it' : 'This is a private plan'}
        >
          {isPublic ? (
            <>
              <Unlock className="w-4 h-4" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Private</span>
            </>
          )}
        </span>

        {/* GitHub Repo Link (if public) */}
        {isPublic && hasGithubRepo && (
          <button
            onClick={handleGithubClick}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium transition-colors duration-200 group/github"
            title={`View ${githubOwner}/${githubName} on GitHub`}
          >
            <Github className="w-4 h-4" />
            <span className="hidden sm:inline group-hover/github:underline">
              {githubOwner}/{githubName}
            </span>
          </button>
        )}
      </div>

      {/* Plan Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
        {plan.title}
      </h3>

      {/* Plan Description */}
      {plan.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {plan.description}
        </p>
      )}

      {/* Progress Section */}
      <div className="space-y-3">
        {/* Progress Bar with Label */}
        <div>
          <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="font-medium">Progress</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Last Activity and Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Updated {lastUpdated}</span>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              plan.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : plan.status === 'completed'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : plan.status === 'draft'
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Hover Effect Indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  );
};

export default PlanCard;
