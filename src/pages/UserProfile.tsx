import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Shield, Camera, Save, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  name: string;
  organization?: string;
  createdAt?: string;
  avatar?: string;
  avatar_url?: string;
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
    setError(null);
    
    try {
      // First try to get from API
      const response = await api.auth.getProfile();
      console.log('Profile API response:', response);
      
      if (response && response.data) {
        setUserData({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name || 'User',
          organization: response.data.organization,
          createdAt: response.data.created_at,
          avatar_url: response.data.avatar_url,
        });
      } else {
        // Fallback to localStorage if API fails
        const sessionStr = localStorage.getItem('auth_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          setUserData({
            id: session.user?.id || 'unknown',
            email: session.user?.email || 'unknown@example.com',
            name: session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'User',
            organization: session.user?.user_metadata?.organization,
            createdAt: session.user?.created_at,
          });
        }
      }
    } catch (err: any) {
      console.error('Error loading user data:', err);
      
      // Try to get basic data from localStorage as fallback
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          setUserData({
            id: session.user?.id || 'unknown',
            email: session.user?.email || 'unknown@example.com',
            name: session.user?.user_metadata?.name || session.user?.email?.split('@')[0] || 'User',
            organization: session.user?.user_metadata?.organization,
            createdAt: session.user?.created_at,
          });
        } catch (parseErr) {
          setError('Failed to load user profile. Please try refreshing the page.');
        }
      } else {
        setError('No user session found. Please login again.');
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
    setSuccess(null);
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Saving profile with data:', editData);
      
      const response = await api.auth.updateProfile({
        name: editData.name || userData?.name || '',
        organization: editData.organization || '',
        avatar_url: userData?.avatar_url || ''
      });
      
      console.log('Update profile response:', response);
      
      if (response && response.data) {
        // Update local state with the response data
        setUserData(prev => prev ? { 
          ...prev, 
          name: response.data.name || editData.name || prev.name,
          organization: response.data.organization || editData.organization || prev.organization
        } : null);
        
        // Also update the session in localStorage if needed
        const sessionStr = localStorage.getItem('auth_session');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session.user && session.user.user_metadata) {
              session.user.user_metadata.name = response.data.name || editData.name;
              session.user.user_metadata.organization = response.data.organization || editData.organization;
              localStorage.setItem('auth_session', JSON.stringify(session));
            }
          } catch (e) {
            console.error('Failed to update session storage:', e);
          }
        }
        
        setIsEditing(false);
        setSuccess('Profile updated successfully! ✓');
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
      
      // Don't exit edit mode on error so user can try again
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData && !loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load profile</p>
          <button 
            onClick={loadUserData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center">
                {userData?.avatar_url ? (
                  <img 
                    src={userData.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{userData?.name}</h1>
              <p className="text-blue-100">{userData?.email}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mx-6 mt-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Information */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile Information
            </h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  disabled={saveLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {userData?.name}
                </p>
              )}
            </div>

            {/* Email Field (Read-only) */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {userData?.email}
              </p>
            </div>

            {/* Organization Field */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Building className="w-4 h-4 mr-2" />
                Organization
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="organization"
                  value={editData.organization || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your organization"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                  {userData?.organization || 'Not specified'}
                </p>
              )}
            </div>

            {/* Member Since */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Member Since
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {userData?.createdAt 
                  ? new Date(userData.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Saving indicator */}
          {saveLoading && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="inline-block w-4 h-4 animate-spin mr-2" />
                Updating your profile...
              </p>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Change Password
            </button>
            <button className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ml-0 md:ml-2 transition-colors">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
