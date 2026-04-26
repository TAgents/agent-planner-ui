import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, Plug, User, Building2, Cable } from 'lucide-react';

interface SettingsTab {
  path: string;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const settingsTabs: SettingsTab[] = [
  { path: '/app/settings', label: 'Tokens', icon: Key },
  { path: '/app/settings/connections', label: 'Connections', icon: Cable },
  { path: '/app/settings/integrations', label: 'Integrations', icon: Plug },
  { path: '/app/settings/organizations', label: 'Organizations', icon: Building2 },
  { path: '/app/settings/profile', label: 'Profile', icon: User },
];

/**
 * Shared header + nav for all settings pages
 */
export const SettingsNav: React.FC = () => {
  const location = useLocation();

  return (
    <div className="border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm px-4 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center gap-4 py-2.5">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <nav className="flex items-center gap-1 ml-2">
          {settingsTabs.map((tab) => {
            const isActive = tab.path === '/app/settings'
              ? location.pathname === tab.path
              : location.pathname.startsWith(tab.path);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsNav;
