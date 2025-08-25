import React, { useState, useEffect } from 'react';
import { X, Mail, Link, Settings, Users, Copy, Check, Shield, UserPlus } from 'lucide-react';
import { useCollaborators } from '../../hooks/useCollaborators';
import PermissionSelector from './PermissionSelector';
import CollaboratorsList from './CollaboratorsList';
import ShareLinkGenerator from './ShareLinkGenerator';
import api from '../../services/api';

interface ShareModalProps {
  planId: string;
  planTitle: string;
  onClose: () => void;
}

type TabType = 'people' | 'link' | 'settings';

const ShareModal: React.FC<ShareModalProps> = ({ planId, planTitle, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('people');
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  
  const { collaborators, isLoading, refetch } = useCollaborators(planId);

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

    setIsInviting(true);
    setInviteError(null);

    try {
      await api.plans.addCollaborator(planId, {
        email: email.trim(),
        role: selectedRole
      });
      
      setEmail('');
      setSelectedRole('viewer');
      setInviteSuccess(true);
      refetch();
    } catch (error: any) {
      setInviteError(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    try {
      await api.plans.removeCollaborator(planId, userId);
      refetch();
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    try {
      await api.plans.updateCollaboratorRole(planId, userId, newRole);
      refetch();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isInviting) {
      handleInvite();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Share "{planTitle}"
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Invite people to collaborate on this plan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'people'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            People
            {activeTab === 'people' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'link'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Link className="w-4 h-4" />
            Link
            {activeTab === 'link' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
            {activeTab === 'settings' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'people' && (
            <div>
              {/* Invite Form */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add people by email
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <PermissionSelector
                    value={selectedRole}
                    onChange={setSelectedRole}
                  />
                  <button
                    onClick={handleInvite}
                    disabled={isInviting || !email.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </button>
                </div>
                
                {inviteError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {inviteError}
                  </p>
                )}
                
                {inviteSuccess && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Invitation sent successfully!
                  </p>
                )}
              </div>

              {/* Collaborators List */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  People with access
                </h3>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <CollaboratorsList
                    collaborators={collaborators}
                    onRemove={handleRemoveCollaborator}
                    onRoleChange={handleUpdateRole}
                    currentUserId={localStorage.getItem('user_id') || ''}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <ShareLinkGenerator planId={planId} />
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Sharing Settings
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Require approval for editors
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          New editors must be approved before they can make changes
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Allow viewers to comment
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          People with view access can add comments to the plan
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                  Stop sharing this plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
