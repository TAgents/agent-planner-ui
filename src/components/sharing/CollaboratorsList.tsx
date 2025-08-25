import React from 'react';
import { Trash2, Crown, MoreVertical, Users } from 'lucide-react';
import PermissionSelector from './PermissionSelector';

interface Collaborator {
  id: string;
  email: string;
  name?: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  avatar?: string;
  created_at?: string;
}

interface CollaboratorsListProps {
  collaborators: Collaborator[];
  currentUserId: string;
  onRemove: (userId: string) => void;
  onRoleChange: (userId: string, newRole: 'viewer' | 'editor' | 'admin') => void;
}

const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  collaborators,
  currentUserId,
  onRemove,
  onRoleChange
}) => {
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

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

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'editor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'viewer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Ensure collaborators is always an array
  const collaboratorsList = Array.isArray(collaborators) ? collaborators : [];
  
  const sortedCollaborators = [...collaboratorsList].sort((a, b) => {
    // Owner first
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    
    // Then by role hierarchy
    const roleOrder = { admin: 1, editor: 2, viewer: 3 };
    const aOrder = roleOrder[a.role as keyof typeof roleOrder] || 4;
    const bOrder = roleOrder[b.role as keyof typeof roleOrder] || 4;
    
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-2">
      {sortedCollaborators.map((collaborator) => {
        const isCurrentUser = collaborator.id === currentUserId;
        const isOwner = collaborator.role === 'owner';
        
        return (
          <div
            key={collaborator.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {collaborator.avatar ? (
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name || collaborator.email}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(collaborator.name, collaborator.email)
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {collaborator.name || collaborator.email}
                    {isCurrentUser && ' (You)'}
                  </p>
                  {isOwner && (
                    <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                {collaborator.name && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {collaborator.email}
                  </p>
                )}
              </div>
            </div>

            {/* Role and Actions */}
            <div className="flex items-center gap-2">
              {isOwner ? (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass('owner')}`}>
                  Owner
                </span>
              ) : (
                <>
                  {isCurrentUser ? (
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(collaborator.role)}`}>
                      {collaborator.role.charAt(0).toUpperCase() + collaborator.role.slice(1)}
                    </span>
                  ) : (
                    <PermissionSelector
                      value={collaborator.role as 'viewer' | 'editor' | 'admin'}
                      onChange={(newRole) => onRoleChange(collaborator.id, newRole)}
                      disabled={isCurrentUser}
                    />
                  )}
                  
                  {!isCurrentUser && (
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === collaborator.id ? null : collaborator.id)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      
                      {menuOpenId === collaborator.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                          <button
                            onClick={() => {
                              onRemove(collaborator.id);
                              setMenuOpenId(null);
                            }}
                            className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove access
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
      
      {collaboratorsList.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>No collaborators yet</p>
          <p className="text-sm mt-1">Invite people to start collaborating</p>
        </div>
      )}
    </div>
  );
};

export default CollaboratorsList;
