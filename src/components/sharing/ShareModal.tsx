import React, { useState, useEffect } from 'react';
import { X, Mail, Check, UserPlus, Users, Trash2 } from 'lucide-react';
import { useCollaborators } from '../../hooks/useCollaborators';

interface ShareModalProps {
  planId: string;
  planTitle: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ planId, planTitle, onClose }) => {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  const { 
    collaborators, 
    isLoading, 
    addCollaborator, 
    removeCollaborator,
  } = useCollaborators(planId);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (inviteSuccess) {
      const timer = setTimeout(() => setInviteSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [inviteSuccess]);

  const handleInvite = async () => {
    if (!email.trim()) {
      setInviteError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInviteError('Please enter a valid email address');
      return;
    }

    // Check if email is already added
    const existingCollaborator = collaborators.find(c => c.email?.toLowerCase() === email.toLowerCase());
    if (existingCollaborator) {
      setInviteError('This person already has access to the plan');
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    try {
      await addCollaborator({
        email: email.trim(),
        role: 'viewer' // Default to viewer role for simplicity
      });
      
      setEmail('');
      setInviteSuccess(true);
    } catch (error: any) {
      setInviteError(error.message || 'Failed to add collaborator');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await removeCollaborator(userId);
    } catch (error: any) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInviting) {
      handleInvite();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Share Plan
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Add people to collaborate on "{planTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add collaborator by email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setInviteError(null);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  autoFocus
                />
              </div>
              <button
                onClick={handleInvite}
                disabled={isInviting || !email.trim()}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                {isInviting ? 'Adding...' : 'Add'}
              </button>
            </div>
            
            {/* Error/Success Messages */}
            {inviteError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {inviteError}
              </p>
            )}
            
            {inviteSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                <Check className="w-4 h-4" />
                Collaborator added successfully!
              </p>
            )}
          </div>

          {/* Collaborators List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                People with access
              </h3>
              {collaborators.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {collaborators.length} {collaborators.length === 1 ? 'person' : 'people'}
                </span>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : collaborators.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collaborators.map((collaborator) => {
                  // Handle different data structures from the API
                  const userData = collaborator.user || collaborator;
                  const userEmail = userData.email || collaborator.email;
                  const userName = userData.name || collaborator.name;
                  const userId = userData.id || collaborator.user_id || collaborator.id;
                  const initial = userEmail?.[0]?.toUpperCase() || userName?.[0]?.toUpperCase() || '?';
                  
                  return (
                    <div
                      key={collaborator.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {initial}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {userName || userEmail || 'Unknown User'}
                          </p>
                          {userName && userEmail && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {userEmail}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Role: {collaborator.role || 'viewer'}
                          </p>
                        </div>
                      </div>
                      {userId !== localStorage.getItem('user_id') && (
                        <button
                          onClick={() => handleRemoveCollaborator(userId)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                          aria-label="Remove collaborator"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No collaborators yet
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add people to start collaborating
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
