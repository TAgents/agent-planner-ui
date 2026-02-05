import React, { useState } from 'react';
import { Bot } from 'lucide-react';

export interface Viewer {
  id: string;
  name: string;
  avatar_url?: string | null;
  is_agent?: boolean;
}

interface PresenceIndicatorProps {
  viewers: Viewer[];
  maxVisible?: number;
  size?: 'sm' | 'md';
}

// Avatar component with error handling
const ViewerAvatar: React.FC<{
  viewer: Viewer;
  sizeClasses: string;
  iconSize: string;
}> = ({ viewer, sizeClasses, iconSize }) => {
  const [imgError, setImgError] = useState(false);
  
  const showFallback = !viewer.avatar_url || imgError;
  
  return (
    <div
      className={`
        ${sizeClasses} rounded-full border-2 border-white dark:border-gray-900
        flex items-center justify-center overflow-hidden
        ${viewer.is_agent 
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
          : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
        }
      `}
      title={`${viewer.name}${viewer.is_agent ? ' (Agent)' : ''}`}
    >
      {!showFallback ? (
        <img 
          src={viewer.avatar_url!} 
          alt={viewer.name}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : viewer.is_agent ? (
        <Bot className={iconSize} />
      ) : (
        <span className="font-medium">
          {viewer.name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
};

/**
 * Shows avatars of active viewers
 * Displays stacked avatars with overflow indicator
 */
export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  viewers,
  maxVisible = 3,
  size = 'sm',
}) => {
  if (!viewers || viewers.length === 0) {
    return null;
  }

  const visibleViewers = viewers.slice(0, maxVisible);
  const overflowCount = viewers.length - maxVisible;

  const sizeClasses = size === 'sm' 
    ? 'w-6 h-6 text-xs' 
    : 'w-8 h-8 text-sm';
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleViewers.map((viewer, index) => (
          <div key={viewer.id} style={{ zIndex: maxVisible - index }}>
            <ViewerAvatar 
              viewer={viewer} 
              sizeClasses={sizeClasses} 
              iconSize={iconSize} 
            />
          </div>
        ))}
        
        {overflowCount > 0 && (
          <div
            className={`
              ${sizeClasses} rounded-full border-2 border-white dark:border-gray-900
              bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300
              flex items-center justify-center font-medium
            `}
            title={`${overflowCount} more viewer${overflowCount !== 1 ? 's' : ''}`}
          >
            +{overflowCount}
          </div>
        )}
      </div>
      
      {/* Optional: "viewing" label */}
      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
        viewing
      </span>
    </div>
  );
};
