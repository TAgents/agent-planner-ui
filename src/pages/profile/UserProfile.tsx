import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Shield, Save, X, Edit3, Lock, ShieldCheck } from 'lucide-react';
import AvatarUpload from '../../components/auth/AvatarUpload';
import api from '../../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  organization?: string;
  createdAt?: string;
  avatar?: string;
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
        setUserData(prev => prev ? { ...prev, ...response.data } : null);
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
            <ShieldCheck className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header with Avatar */}
          <div className="relative">
            {/* Background Gradient */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600"></div>
            
            {/* Avatar and Basic Info */}
            <div className="relative -mt-16 px-8 pb-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
                {/* Avatar Upload Component */}
                <div className="relative z-10">
                  <AvatarUpload 
                    currentAvatar={userData?.avatar}
                    onAvatarChange={handleAvatarChange}
                    size="xl"
                    userName={userData?.name}
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 text-center sm:text-left pb-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {userData?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {userData?.email}
                  </p>
                  {userData?.organization && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {userData.organization}
                    </p>
                  )}
                </div>

                {/* Edit Profile Button */}
                <div className="pb-4">
                  {!isEditing ? (
                    <button
                      onClick={handleEdit}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saveLoading ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editData.name || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                    {userData?.name}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  Email Address
                </label>
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                  {userData?.email}
                </div>
              </div>

              {/* Organization */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  Organization
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="organization"
                    value={editData.organization || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your organization"
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  />
                ) : (
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                    {userData?.organization || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  Member Since
                </label>
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-gray-900 dark:text-white">
                  {userData?.createdAt 
                    ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings Section */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Security Settings
            </h3>
            
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <Lock className="w-4 h-4" />
                <span className="font-medium">Change Password</span>
              </button>
              
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-medium">Enable Two-Factor Authentication</span>
              </button>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Keep your account secure by using a strong password and enabling two-factor authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
