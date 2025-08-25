import React, { useState, useEffect } from 'react';
import { User, Mail, Building, Calendar, Shield, Camera, Save, X } from 'lucide-react';

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
      // Get user data from localStorage session
      const sessionStr = localStorage.getItem('auth_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // In a real app, you'd fetch this from an API endpoint
        setUserData({
          id: session.user?.id || 'unknown',
          email: session.user?.email || 'unknown@example.com',
          name: session.user?.user_metadata?.name || 'User',
          organization: session.user?.user_metadata?.organization,
          createdAt: session.user?.created_at,
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user profile');
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
      // TODO: Implement API call to update user profile
      // await api.users.updateProfile(userData.id, editData);
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                {userData?.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full shadow-lg">
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
          <div className="mx-6 mt-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mx-6 mt-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
            {success}
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
              >
                <Shield className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
        </div>

        {/* Security Section */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Security Settings
          </h3>
          <div className="space-y-4">
            <button className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              Change Password
            </button>
            <button className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ml-0 md:ml-2">
              Enable Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
