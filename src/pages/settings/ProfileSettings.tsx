import React, { useState, useEffect } from 'react';
import { Save, Edit3, ShieldCheck, Github, User, Mail, Building, Calendar } from 'lucide-react';
import { SettingsNav } from '../../components/settings/SettingsLayout';
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

const ProfileSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
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
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
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
        setError('Failed to load profile');
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
      await api.auth.updateProfile(editData);
      setUserData(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Navigation */}
        <SettingsNav />

        {/* Profile Content with transition */}
        <div className="mt-6 transition-opacity duration-150">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Success/Error Messages */}
              {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
                  {success}
                </div>
              )}
              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header with Avatar */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {userData?.github_avatar_url || userData?.avatar ? (
                          <img
                            src={userData.github_avatar_url || userData.avatar}
                            alt={userData.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-semibold">
                            {userData?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {userData?.name || 'Unknown User'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">{userData?.email}</p>
                        {userData?.github_username && (
                          <a
                            href={userData.github_profile_url || `https://github.com/${userData.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            <Github className="w-4 h-4" />
                            @{userData.github_username}
                          </a>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <User className="w-4 h-4" />
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{userData?.name || '-'}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Mail className="w-4 h-4" />
                        Email Address
                      </label>
                      <p className="text-gray-900 dark:text-white">{userData?.email || '-'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Building className="w-4 h-4" />
                        Organization
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.organization || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, organization: e.target.value }))}
                          placeholder="Your company or team"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">{userData?.organization || '-'}</p>
                      )}
                    </div>

                    {/* Member Since */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Calendar className="w-4 h-4" />
                        Member Since
                      </label>
                      <p className="text-gray-900 dark:text-white">{formatDate(userData?.createdAt)}</p>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {saveLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    Security
                  </h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Change your password or enable two-factor authentication
                      </p>
                    </div>
                    <button 
                      disabled
                      title="Coming soon"
                      className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-not-allowed opacity-60"
                    >
                      Change Password
                    </button>
                  </div>

                  {userData?.github_id && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                          <Github className="w-4 h-4" />
                          GitHub Connected
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Signed in with GitHub as @{userData.github_username}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        Connected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
