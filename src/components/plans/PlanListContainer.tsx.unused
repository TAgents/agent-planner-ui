import React, { useState } from 'react';
import { Plan } from '../../types';
import { usePlans } from '../../hooks/usePlans';
import { Loader } from 'lucide-react';
import { PlanCard } from './PlanCard';

interface PlanListContainerProps {
  filter?: 'all' | 'public' | 'private' | 'mine';
  sortBy?: 'recent' | 'title' | 'progress';
}

// Loading skeleton component
const PlanListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Title skeleton */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

          {/* Progress skeleton */}
          <div className="mb-3">
            <div className="flex justify-between mb-2">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Footer skeleton */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// Empty state component
const EmptyState: React.FC<{ filter: string }> = ({ filter }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {filter === 'all' ? 'No Plans Yet' : 'No Plans Found'}
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-8">
        {filter === 'all'
          ? 'Create your first plan to organize projects, track progress, and collaborate with your team.'
          : `No ${filter} plans found. Try adjusting your filters.`}
      </p>

      {filter === 'all' && (
        <a
          href="/app/plans/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Plan
        </a>
      )}
    </div>
  );
};

// Error state component
const ErrorState: React.FC<{ error: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
      <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Failed to Load Plans
      </h3>

      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {error.message || 'An unexpected error occurred while loading your plans.'}
      </p>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Try Again
      </button>
    </div>
  );
};

export const PlanListContainer: React.FC<PlanListContainerProps> = ({
  filter = 'all',
  sortBy = 'recent',
}) => {
  // Use React Query hook for data fetching
  const { plans, isLoading, error, refetch } = usePlans();

  // Filter and sort plans based on props
  const filteredAndSortedPlans = React.useMemo(() => {
    let filtered = [...plans];

    // Apply filter
    switch (filter) {
      case 'public':
        filtered = filtered.filter((p: Plan) => p.metadata?.is_public === true);
        break;
      case 'private':
        filtered = filtered.filter((p: Plan) => !p.metadata?.is_public);
        break;
      case 'mine':
        // Already filtered by owner via API/RLS
        break;
      case 'all':
      default:
        // Show all accessible plans
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'progress':
        filtered.sort((a, b) => (b.progress || 0) - (a.progress || 0));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        break;
    }

    return filtered;
  }, [plans, filter, sortBy]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PlanListSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState error={error as Error} onRetry={() => refetch()} />
      </div>
    );
  }

  // Empty state
  if (!filteredAndSortedPlans || filteredAndSortedPlans.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState filter={filter} />
      </div>
    );
  }

  // Success state - render plan cards
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPlans.map((plan: Plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

export default PlanListContainer;
