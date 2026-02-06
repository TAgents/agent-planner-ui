import React from 'react';

/**
 * Skeleton loader for settings pages - prevents white flash during navigation.
 */
export const SettingsPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-72 mt-2" />
      </div>
      
      {/* Nav skeleton */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex gap-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-28" />
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-24" />
          <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-20" />
        </div>
      </div>
      
      {/* Content skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      
      {/* Second card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPageSkeleton;
