import React, { useState } from 'react';
import { Globe, Lock, Loader, Info } from 'lucide-react';
import { PlanVisibility } from '../../types';
import { planService } from '../../services/api';

interface VisibilityToggleProps {
  planId: string;
  currentVisibility: PlanVisibility;
  isOwner: boolean;
  onVisibilityChange?: (newVisibility: PlanVisibility) => void;
}

const VisibilityToggle: React.FC<VisibilityToggleProps> = ({
  planId,
  currentVisibility,
  isOwner,
  onVisibilityChange,
}) => {
  const [visibility, setVisibility] = useState<PlanVisibility>(currentVisibility);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleVisibilityClick = () => {
    if (!isOwner || isUpdating) return;
    setShowTooltip(false);
    setShowConfirmDialog(true);
  };

  const handleConfirmVisibilityChange = async () => {
    setShowConfirmDialog(false);

    const newVisibility: PlanVisibility = visibility === 'public' ? 'private' : 'public';
    const previousVisibility = visibility;

    // Optimistic update
    setVisibility(newVisibility);
    setIsUpdating(true);

    try {
      await planService.updatePlanVisibility(planId, newVisibility);

      // Show success notification
      setNotification({
        type: 'success',
        message: `Plan is now ${newVisibility}`,
      });

      // Call callback if provided
      if (onVisibilityChange) {
        onVisibilityChange(newVisibility);
      }

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to update visibility:', error);

      // Revert optimistic update
      setVisibility(previousVisibility);

      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to update visibility. Please try again.',
      });

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // If not owner, just show read-only badge
  if (!isOwner) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {visibility === 'public' ? (
          <>
            <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public</span>
          </>
        ) : (
          <>
            <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Private</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={handleVisibilityClick}
        disabled={isUpdating}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
          ${visibility === 'public'
            ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800'
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
          }
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={visibility === 'public' ? 'Make plan private' : 'Make plan public'}
      >
        {isUpdating ? (
          <Loader className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
        ) : visibility === 'public' ? (
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}

        <span className={`text-sm font-medium ${
          visibility === 'public'
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {visibility === 'public' ? 'Public' : 'Private'}
        </span>

        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </button>

      {/* Tooltip */}
      {showTooltip && !isUpdating && (
        <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="text-sm space-y-2">
            <div className="font-semibold text-gray-900 dark:text-white">
              {visibility === 'public' ? 'Public Plan' : 'Private Plan'}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {visibility === 'public' ? (
                <>
                  Anyone with the link can view this plan. You and your collaborators can edit it.
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Click to make private
                  </div>
                </>
              ) : (
                <>
                  Only you and collaborators you've invited can view and edit this plan.
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Click to make public
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification */}
      {notification && (
        <div className={`
          absolute top-full left-0 mt-2 z-50 px-4 py-2 rounded-lg shadow-lg border
          animate-slide-down
          ${notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }
        `}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-sm font-medium whitespace-nowrap">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowConfirmDialog(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              {visibility === 'public' ? (
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              ) : (
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {visibility === 'public' ? 'Make Plan Private?' : 'Make Plan Public?'}
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {visibility === 'public' ? (
                'This plan will no longer be visible to others. Only you and your collaborators will be able to access it.'
              ) : (
                'This plan will be visible to anyone with the link. Others will be able to view and explore your plan.'
              )}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVisibilityChange}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  visibility === 'public'
                    ? 'bg-gray-600 hover:bg-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {visibility === 'public' ? 'Make Private' : 'Make Public'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisibilityToggle;
