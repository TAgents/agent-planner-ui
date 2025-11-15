import React, { useState, useEffect } from 'react';
import { Save, X, Edit3, ShieldCheck, Github } from 'lucide-react';
import AvatarUpload from '../../components/auth/AvatarUpload';
import api from '../../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  organization?: string;
  createdAt?: string;
  avatar?: string;
  github_id?: string;
  github_username?: string;
  github_avatar_url?: string;
  github_profile_url?: string;
}

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // Try to get user data from the API first
      const response = await api.auth.getProfile();
      if (response && response.data) {
        setUserData({
          id: response.data.id || 'unknown',
          email: response.data.email || 'unknown@example.com',
          name: response.data.name || 'User',
          organization: response.data.organization,
          createdAt: response.data.created_at,
          avatar: response.data.avatar_url,
          github_id: response.data.github_id,
          github_username: response.data.github_username,
          github_avatar_url: response.data.github_avatar_url,
          github_profile_url: response.data.github_profile_url,
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error loading user data from API, falling back to local session:', err);
      // Fallback to session data
      try {
        const sessionStr = localStorage.getItem('auth_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          setUserData({
            id: session.user?.id || 'unknown',
            email: session.user?.email || 'unknown@example.com',
            name: session.user?.user_metadata?.name || 'User',
            organization: session.user?.user_metadata?.organization,
            createdAt: session.user?.created_at,
            avatar: session.user?.user_metadata?.avatar_url,
          });
        }
      } catch (localErr) {
        console.error('Error loading user data from local session:', localErr);
        setError('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: userData?.name,
      organization: userData?.organization,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setError(null);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.auth.updateProfile(editData);
      if (response && response.data) {
        // Map response fields to match userData interface
        setUserData(prev => prev ? {
          ...prev,
          name: response.data.name || prev.name,
          organization: response.data.organization || prev.organization,
          avatar: response.data.avatar_url || prev.avatar,
        } : null);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      setUserData(prev => prev ? { ...prev, avatar: avatarUrl } : null);
    } catch (err: any) {
      console.error('Failed to update avatar:', err);
      setError(err.message || 'Failed to update avatar');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage your profile information
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
            <X className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
            <ShieldCheck className="w-4 h-4 mr-2" />
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">

          {/* Avatar Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-6">
              <AvatarUpload
                currentAvatar={userData?.avatar}
                onAvatarChange={handleAvatarChange}
                size="lg"
                userName={userData?.name}
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userData?.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {userData?.email}
                </p>
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="p-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your name"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                  {userData?.name}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                {userData?.email}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization (Optional)
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="organization"
                  value={editData.organization || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your organization"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                  {userData?.organization || 'Not specified'}
                </div>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member Since
              </label>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-500 dark:text-gray-400">
                {userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Connected Accounts */}
        {userData?.github_username && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Connected Accounts
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-gray-900 dark:bg-white rounded-lg p-2">
                  <Github className="w-5 h-5 text-white dark:text-gray-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      GitHub
                    </span>
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                      Connected
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    @{userData.github_username}
                  </p>
                </div>
              </div>
              {userData.github_profile_url && (
                <a
                  href={userData.github_profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  View
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
