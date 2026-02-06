import React, { Suspense } from 'react';
import { Link, NavLink, useLocation, Outlet } from 'react-router-dom';
import { Key, Building2, Webhook, User, ArrowLeft } from 'lucide-react';
import { SettingsPageSkeleton } from './SettingsPage';

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
 * Settings navigation link - handles active/pending states without flash
 */
const SettingsLink: React.FC<{ to: string; icon: React.FC<{ className?: string }>; children: React.ReactNode }> = ({ 
  to, 
  icon: Icon,
  children 
}) => {
  return (
    <NavLink
      to={to}
      end={to === '/app/settings'}
      className={({ isActive, isPending }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
          isPending 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            : isActive
              ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white font-medium border border-gray-200 dark:border-gray-700'
              : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {children}
    </NavLink>
  );
};

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

/**
 * Settings layout with fixed sidebar - content scrolls internally
 * Use this for a more structured settings experience
 */
export const SettingsSidebarLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - fixed width, doesn't resize */}
      <aside className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="h-full overflow-y-auto">
          {/* Back to app */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link 
              to="/app" 
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
          </div>
          
          <nav className="p-4 space-y-6">
            {/* Account Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
                Account
              </h3>
              <div className="space-y-1">
                <SettingsLink to="/app/settings/profile" icon={User}>
                  Profile
                </SettingsLink>
              </div>
            </div>
            
            {/* Organization Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
                Organization
              </h3>
              <div className="space-y-1">
                <SettingsLink to="/app/settings/organization" icon={Building2}>
                  Members & Teams
                </SettingsLink>
              </div>
            </div>
            
            {/* Developer Section */}
            <div>
              <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">
                Developer
              </h3>
              <div className="space-y-1">
                <SettingsLink to="/app/settings" icon={Key}>
                  API Tokens
                </SettingsLink>
                <SettingsLink to="/app/settings/integrations" icon={Webhook}>
                  Integrations
                </SettingsLink>
              </div>
            </div>
          </nav>
        </div>
      </aside>
      
      {/* Content area - fixed, scrolls internally */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 min-h-full">
          <Suspense fallback={<SettingsPageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
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
            <Link to="/app" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
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
        <div className="mt-6 transition-opacity duration-150">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
