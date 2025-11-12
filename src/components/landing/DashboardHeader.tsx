import React from 'react';
import { DemoPlan } from './demoPlansData';
import { formatStars, formatTimeAgo } from './formatters';

interface DashboardHeaderProps {
  plan: DemoPlan;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ plan }) => {
  return (
    <div className="border-b-2 border-gray-200 p-4 md:p-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Top Row: Title and Public Badge */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
        <div className="flex-grow">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1.5 leading-tight">
            {plan.title}
          </h3>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">{plan.description}</p>
        </div>

        {/* Public Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border-2 border-blue-200 whitespace-nowrap self-start hover:bg-blue-100 transition-colors duration-200 cursor-help"
          title="This is a public plan - anyone can view it"
        >
          <span>🔓</span>
          <span>Public</span>
        </span>
      </div>

      {/* Second Row: GitHub Info and Progress */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* GitHub Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* GitHub Repo Link */}
          <a
            href={plan.githubRepo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>
              {plan.githubRepo.owner}/{plan.githubRepo.name}
            </span>
          </a>

          {/* Stars */}
          <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
            <span>⭐</span>
            <span>
              {formatStars(plan.githubRepo.stars)}
            </span>
          </span>

          {/* Sync Status */}
          <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
            <span>✓</span>
            <span className="hidden sm:inline">Synced with GitHub</span>
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-32 md:w-40 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full"
                style={{ width: `${plan.progress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {plan.completedTasks}/{plan.totalTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Third Row: Activity */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm" />
          <span className="leading-relaxed">
            Last updated {formatTimeAgo(plan.lastUpdated)} by{' '}
            <a
              href={`https://github.com/${plan.lastUpdatedBy}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors duration-200"
            >
              @{plan.lastUpdatedBy}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};
