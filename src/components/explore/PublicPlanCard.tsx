import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

export interface PublicPlanCardProps {
  plan: {
    id: string;
    title: string;
    description?: string;
    owner: {
      name: string;
      github_username?: string;
      avatar_url?: string;
    };
    github_repo_owner?: string;
    github_repo_name?: string;
    updated_at: string;
    task_count: number;
    completed_count: number;
    completion_percentage: number;
    star_count: number;
    view_count?: number;
    is_starred?: boolean;
  };
}

export const PublicPlanCard: React.FC<PublicPlanCardProps> = ({ plan }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isStarred, setIsStarred] = useState(plan.is_starred || false);
  const [starCount, setStarCount] = useState(plan.star_count);
  const [isStarring, setIsStarring] = useState(false);

  const handleClick = () => {
    navigate(`/public/plans/${plan.id}`);
  };

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isStarring) return;

    setIsStarring(true);

    try {
      if (isStarred) {
        const response = await api.plans.unstarPlan(plan.id);
        setIsStarred(false);
        setStarCount(response.star_count);
      } else {
        const response = await api.plans.starPlan(plan.id);
        setIsStarred(true);
        setStarCount(response.star_count);
      }
    } catch (error) {
      console.error('Error starring/unstarring plan:', error);
    } finally {
      setIsStarring(false);
    }
  };

  const truncateDescription = (text?: string, maxLength: number = 150) => {
    if (!text) return 'No description provided';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getAvatarUrl = () => {
    if (plan.owner.avatar_url) {
      return plan.owner.avatar_url;
    }
    // Fallback to GitHub avatar if username is available
    if (plan.owner.github_username) {
      return `https://github.com/${plan.owner.github_username}.png`;
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <div
      onClick={handleClick}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow cursor-pointer group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Header with Public Badge */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 pr-2">
          {plan.title}
        </h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 flex-shrink-0">
          Public
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
        {truncateDescription(plan.description)}
      </p>

      {/* Owner Info */}
      <div className="flex items-center mb-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={plan.owner.name}
            className="w-8 h-8 rounded-full mr-2"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium mr-2">
            {plan.owner.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {plan.owner.name}
          </p>
          {plan.owner.github_username && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              @{plan.owner.github_username}
            </p>
          )}
        </div>
      </div>

      {/* GitHub Link (if available) */}
      {plan.github_repo_owner && plan.github_repo_name && (
        <div className="mb-4">
          <a
            href={`https://github.com/${plan.github_repo_owner}/${plan.github_repo_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            {plan.github_repo_owner}/{plan.github_repo_name}
          </a>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {plan.completion_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${plan.completion_percentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          {plan.completed_count} of {plan.task_count} tasks completed
        </p>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          {/* Star Button */}
          <button
            onClick={handleStar}
            disabled={isStarring}
            className={`flex items-center transition-colors ${
              isStarred
                ? 'text-yellow-500 hover:text-yellow-600'
                : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500'
            } ${isStarring ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title={isAuthenticated ? (isStarred ? 'Unstar plan' : 'Star plan') : 'Sign in to star'}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill={isStarred ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={isStarred ? "0" : "2"}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{starCount}</span>
          </button>

          {/* View Count (if available) */}
          {plan.view_count !== undefined && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{plan.view_count}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-xs">
          Updated {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default PublicPlanCard;
