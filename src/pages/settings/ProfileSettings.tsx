import React, { useState, useEffect, useCallback } from 'react';
import { Save, Edit3, Github, Lock, Loader2 } from 'lucide-react';
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => { loadUserData(); }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const response = await api.auth.getProfile();
      if (response?.data) {
        setUserData({
          id: response.data.id || 'unknown',
          email: response.data.email || '',
          name: response.data.name || 'User',
          organization: response.data.organization,
          createdAt: response.data.created_at,
          avatar: response.data.avatar_url,
          github_id: response.data.github_id,
          github_username: response.data.github_username,
          github_avatar_url: response.data.github_avatar_url,
          github_profile_url: response.data.github_profile_url,
        });
      }
    } catch {
      try {
        const sessionStr = localStorage.getItem('auth_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          setUserData({
            id: session.user?.id || 'unknown',
            email: session.user?.email || '',
            name: session.user?.user_metadata?.name || 'User',
            organization: session.user?.user_metadata?.organization,
            createdAt: session.user?.created_at,
            avatar: session.user?.user_metadata?.avatar_url,
          });
        }
      } catch { setError('Failed to load profile'); }
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    setError(null);
    try {
      await api.auth.updateProfile(editData);
      setUserData(prev => prev ? { ...prev, ...editData } : null);
      setIsEditing(false);
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally { setSaveLoading(false); }
  };

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { setError('Fill all password fields'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords don\'t match'); return; }
    if (newPassword.length < 8) { setError('Min 8 characters'); return; }
    setPasswordLoading(true);
    setError(null);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setSuccess('Password changed');
      setShowChangePassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally { setPasswordLoading(false); }
  }, [currentPassword, newPassword, confirmPassword]);

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SettingsNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Feedback */}
            {success && (
              <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">{success}</p>
              </div>
            )}
            {error && (
              <div className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Profile card */}
            <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {userData?.github_avatar_url || userData?.avatar ? (
                    <img
                      src={userData.github_avatar_url || userData.avatar}
                      alt={userData.name}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-white dark:text-gray-900 text-xs font-semibold">
                      {userData?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{userData?.name}</span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{userData?.email}</p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => { setIsEditing(true); setEditData({ name: userData?.name, organization: userData?.organization }); setError(null); }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                )}
              </div>

              <div className="p-4">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Name</label>
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">Organization</label>
                        <input
                          type="text"
                          value={editData.organization || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, organization: e.target.value }))}
                          placeholder="Company or team"
                          className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setIsEditing(false); setError(null); }} className="px-3 py-1.5 text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saveLoading}
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        {saveLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Organization</p>
                      <p className="text-xs text-gray-900 dark:text-white">{userData?.organization || <span className="text-gray-400 italic">Not set</span>}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">Member since</p>
                      <p className="text-xs text-gray-900 dark:text-white">{formatDate(userData?.createdAt)}</p>
                    </div>
                    {userData?.github_username && (
                      <div>
                        <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">GitHub</p>
                        <a
                          href={userData.github_profile_url || `https://github.com/${userData.github_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-900 dark:text-white hover:text-blue-500 transition-colors flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" />
                          @{userData.github_username}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200/80 dark:border-gray-800/80">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">Password</span>
                </div>
                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  {showChangePassword ? 'Cancel' : 'Change'}
                </button>
              </div>

              {showChangePassword && (
                <div className="px-4 pb-4 space-y-2">
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password (min 8)"
                      className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 dark:text-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={handleChangePassword}
                      disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword || passwordLoading}
                      className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 transition-colors"
                    >
                      {passwordLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      Update Password
                    </button>
                  </div>
                </div>
              )}

              {userData?.github_id && !showChangePassword && (
                <div className="px-4 pb-3 flex items-center gap-2">
                  <Github className="w-3 h-3 text-gray-400" />
                  <span className="text-[11px] text-gray-500">GitHub connected as @{userData.github_username}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded font-medium">Connected</span>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
