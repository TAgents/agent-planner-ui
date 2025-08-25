import React from 'react';

interface Collaborator {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
}

interface CollaboratorAvatarsProps {
  collaborators: Collaborator[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const CollaboratorAvatars: React.FC<CollaboratorAvatarsProps> = ({
  collaborators,
  maxDisplay = 3,
  size = 'md',
  showTooltip = true
}) => {
  const displayUsers = collaborators.slice(0, maxDisplay);
  const remainingCount = Math.max(0, collaborators.length - maxDisplay);

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : '?';
  };

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-800 relative group`}
          style={{ zIndex: maxDisplay - index }}
          title={showTooltip ? (user.name || user.email) : undefined}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || user.email}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getInitials(user.name, user.email)
          )}
          
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {user.name || user.email}
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-bold border-2 border-white dark:border-gray-800`}
          title={showTooltip ? `${remainingCount} more collaborator${remainingCount > 1 ? 's' : ''}` : undefined}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default CollaboratorAvatars;
