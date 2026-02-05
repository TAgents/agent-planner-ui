import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, Building2, Webhook, User, Settings as SettingsIcon } from 'lucide-react';

interface SettingsTab {
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const settingsTabs: SettingsTab[] = [
  { path: '/app/settings', label: 'API Tokens', icon: Key },
  { path: '/app/settings/organization', label: 'Organizations', icon: Building2 },
  { path: '/app/settings/integrations', label: 'Integrations', icon: Webhook },
  { path: '/app/settings/profile', label: 'Profile', icon: User },
];

/**
 * Shared navigation component for all settings pages
 */
export const SettingsNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-4 overflow-x-auto">
        {settingsTabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

interface SettingsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

/**
 * Consistent layout wrapper for all settings pages
 */
const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <SettingsIcon className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>

        {/* Navigation Tabs */}
        <SettingsNav />

        {/* Page Content */}
        <div className="mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
