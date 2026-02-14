import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, Webhook, User } from 'lucide-react';

interface SettingsTab {
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const settingsTabs: SettingsTab[] = [
  { path: '/app/settings', label: 'API Tokens', icon: Key },
  { path: '/app/settings/integrations', label: 'Integrations', icon: Webhook },
  { path: '/app/settings/profile', label: 'Profile', icon: User },
];

/**
 * Shared navigation component for all settings pages (horizontal tabs)
 */
export const SettingsNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
      <nav className="flex gap-4 overflow-x-auto">
        {settingsTabs.map((tab) => {
          const isActive = tab.path === '/app/settings' 
            ? location.pathname === tab.path
            : location.pathname.startsWith(tab.path);
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

export default SettingsNav;
