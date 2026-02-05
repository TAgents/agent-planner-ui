import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Compass,
  Settings,
  LogOut,
  ChevronRight,
  LogIn,
  FolderKanban,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlans } from '../../hooks/usePlans';
import { Plan, PlanStatus } from '../../types';
import NotificationBell from './NotificationBell';

interface AppSidebarProps {
  className?: string;
  variant?: 'full' | 'simplified' | 'public';
  isOpen?: boolean;
  onClose?: () => void;
}

const statusColors: Record<PlanStatus, string> = {
  draft: 'bg-gray-400',
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  archived: 'bg-amber-500',
};

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  className = '', 
  variant = 'full',
  isOpen = true,
  onClose 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userName, userEmail, signOut, isAuthenticated } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const showPlans = variant === 'full' && isAuthenticated;

  // Fetch plans only for full variant when authenticated
  const { plans, isLoading } = usePlans(1, 20);

  // Filter and sort plans (newest first by updated_at)
  const filteredPlans = useMemo((): Plan[] => {
    if (!plans) return [];
    
    // Sort by updated_at descending (newest first)
    const sorted = [...plans].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    if (!searchQuery.trim()) return sorted.slice(0, 10);
    return sorted
      .filter((plan: Plan) =>
        plan.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [plans, searchQuery]);

  const isActive = (path: string) => {
    if (path === '/app/plans' && location.pathname === '/app/plans') return true;
    if (path !== '/app/plans' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isPlanActive = (planId: string) => {
    return location.pathname === `/app/plans/${planId}`;
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
    onClose?.();
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          w-64 h-screen flex flex-col 
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <img
              src="/logo.png"
              alt="Agent Planner"
              className="w-7 h-7 rounded-lg"
            />
            <span className="font-semibold text-gray-900 dark:text-white">
              Agent Planner
            </span>
          </Link>
          
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* New Plan Button */}
        <div className="p-3">
          <Link
            to={isAuthenticated ? "/app/plans/ai-create" : "/login"}
            onClick={handleNavClick}
            className="flex items-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Plan</span>
          </Link>
        </div>

        {/* Search - only when showing plans */}
        {showPlans && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500"
              />
            </div>
          </div>
        )}

        {/* Plans List - only when showing plans */}
        {showPlans && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                My Plans
              </h3>
            </div>

            <nav className="px-2 space-y-1">
              {isLoading ? (
                <div className="px-3 py-4">
                  <div className="animate-pulse space-y-2">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No plans found' : 'No plans yet'}
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    to={`/app/plans/${plan.id}`}
                    onClick={handleNavClick}
                    className={`flex flex-col gap-1 px-3 py-2 rounded-lg transition-colors ${
                      isPlanActive(plan.id)
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          statusColors[plan.status]
                        }`}
                        title={plan.status}
                      />
                      <span className="text-sm truncate flex-1" title={plan.title}>{plan.title}</span>
                      {typeof plan.progress === 'number' && plan.progress > 0 && (
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {plan.progress}%
                        </span>
                      )}
                    </div>
                    {/* Mini progress bar */}
                    {typeof plan.progress === 'number' && plan.progress > 0 && (
                      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
                          style={{ width: `${plan.progress}%` }}
                        />
                      </div>
                    )}
                  </Link>
                ))
              )}

              {/* View All Plans */}
              {plans && plans.length > 10 && (
                <Link
                  to="/app/plans"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <span>View all plans</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Spacer when not showing plans */}
        {!showPlans && <div className="flex-1" />}

        {/* Bottom Navigation */}
        <div className="border-t border-gray-200 dark:border-gray-800">
          <nav className="p-2 space-y-1">
            {/* My Plans - only for authenticated users */}
            {isAuthenticated && (
              <Link
                to="/app/plans"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/app/plans')
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FolderKanban className="w-5 h-5" />
                <span className="text-sm">My Plans</span>
              </Link>
            )}

            <Link
              to="/explore"
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/explore')
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-sm">Explore</span>
            </Link>

            {/* Settings - only for authenticated users */}
            {isAuthenticated && (
              <Link
                to="/app/settings"
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/app/settings')
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-sm">Settings</span>
              </Link>
            )}
          </nav>

          {/* User Section - for authenticated users */}
          {isAuthenticated && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              {/* Notification Bell - Desktop only (mobile has it in header) */}
              <div className="hidden md:flex items-center justify-between mb-2 px-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  Notifications
                </span>
                <NotificationBell />
              </div>
              
              <Link
                to="/app/profile"
                onClick={handleNavClick}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                      {(userName || userEmail || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {userName || userEmail || 'User'}
                  </p>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-2 py-2 mt-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Sign In Section - for public/unauthenticated users */}
          {!isAuthenticated && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
              >
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
