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
  Target,
  BookOpen,
  Home,
  Network,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlans } from '../../hooks/usePlans';
import { Plan, PlanStatus } from '../../types';
import NotificationBell from './NotificationBell';
import ThemeToggle from '../common/ThemeToggle';

interface AppSidebarProps {
  className?: string;
  variant?: 'full' | 'simplified' | 'public';
  isOpen?: boolean;
  onClose?: () => void;
}

const statusColors: Record<PlanStatus, string> = {
  draft: 'bg-gray-400 dark:bg-gray-500',
  active: 'bg-amber-500',
  completed: 'bg-emerald-500',
  archived: 'bg-gray-300 dark:bg-gray-600',
};

const statusBorderColors: Record<PlanStatus, string> = {
  draft: 'border-l-gray-300 dark:border-l-gray-600',
  active: 'border-l-amber-400',
  completed: 'border-l-emerald-400',
  archived: 'border-l-gray-300 dark:border-l-gray-600',
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
  const { plans, isLoading } = usePlans(1, 20, undefined, showPlans);

  // Filter and sort plans: active first, then drafts, exclude archived/completed
  const filteredPlans = useMemo((): Plan[] => {
    if (!plans) return [];

    // Exclude archived and completed plans from sidebar
    const visiblePlans = plans.filter((p: Plan) =>
      p.status !== 'archived' && p.status !== 'completed'
    );

    // Sort: active plans first, then drafts, then by updated_at descending
    const sorted = [...visiblePlans].sort((a, b) => {
      const statusOrder: Record<string, number> = { active: 0, draft: 1 };
      const aOrder = statusOrder[a.status] ?? 2;
      const bOrder = statusOrder[b.status] ?? 2;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    if (!searchQuery.trim()) return sorted.slice(0, 10);
    return sorted
      .filter((plan: Plan) =>
        plan.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 10);
  }, [plans, searchQuery]);

  const isActive = (path: string) => {
    const pathname = location.pathname.replace(/\/+$/, '') || '/'; // normalize trailing slash
    if (path === '/app/plans') return pathname === '/app/plans';
    if (path === '/explore') return pathname === '/explore' || pathname.startsWith('/explore/');
    return pathname.startsWith(path);
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

  // Primary nav items (most used)
  const primaryNav = [
    { to: '/app', label: 'Home', icon: Home, isActiveFn: () => location.pathname === '/app' || location.pathname === '/app/dashboard' },
    { to: '/app/plans', label: 'Plans', icon: FolderKanban, isActiveFn: () => isActive('/app/plans') },
    { to: '/app/goals', label: 'Goals', icon: Target, isActiveFn: () => isActive('/app/goals') },
  ];

  // Secondary nav items (less used)
  const secondaryNav = [
    { to: '/app/portfolio', label: 'Portfolio', icon: Network, isActiveFn: () => isActive('/app/portfolio') },
    { to: '/app/knowledge', label: 'Knowledge', icon: BookOpen, isActiveFn: () => isActive('/app/knowledge') },
    { to: '/explore', label: 'Explore', icon: Compass, isActiveFn: () => isActive('/explore'), alwaysShow: true },
    { to: '/app/settings', label: 'Settings', icon: Settings, isActiveFn: () => isActive('/app/settings') },
  ];

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
          w-56 h-screen flex flex-col
          bg-white dark:bg-gray-950
          border-r border-gray-200/80 dark:border-gray-800/80
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${className}
        `}
      >
        {/* Header — compact */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800/60">
          <Link to="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <img
              src="/logo.png"
              alt="Agent Planner"
              className="w-6 h-6 rounded-md"
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
              Agent Planner
            </span>
          </Link>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 -mr-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* New Plan — quieter, ghost style */}
        <div className="px-2.5 pt-2.5 pb-1">
          <Link
            to={isAuthenticated ? "/app/plans/create" : "/login"}
            onClick={handleNavClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Plan</span>
          </Link>
        </div>

        {/* Search — only when showing plans */}
        {showPlans && (
          <div className="px-2.5 py-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Plans List */}
        {showPlans && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1">
              <h3 className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                Plans
              </h3>
            </div>

            <nav className="px-2 space-y-0.5">
              {isLoading ? (
                <div className="px-2 py-3">
                  <div className="animate-pulse space-y-1.5">
                    <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                    <div className="h-7 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
                  </div>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="px-2 py-3 text-xs text-gray-400 dark:text-gray-500">
                  {searchQuery ? 'No plans found' : 'No plans yet'}
                </div>
              ) : (
                filteredPlans.map((plan) => (
                  <Link
                    key={plan.id}
                    to={`/app/plans/${plan.id}`}
                    onClick={handleNavClick}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all border-l-2 ${
                      isPlanActive(plan.id)
                        ? `bg-gray-100 dark:bg-gray-800/80 ${statusBorderColors[plan.status]}`
                        : `border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:${statusBorderColors[plan.status]}`
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        statusColors[plan.status]
                      }`}
                      title={plan.status}
                    />
                    <span className={`text-xs truncate flex-1 ${
                      isPlanActive(plan.id)
                        ? 'font-medium text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                    }`} title={plan.title}>{plan.title}</span>
                    {typeof plan.progress === 'number' && plan.progress > 0 && (
                      <span className="text-[9px] tabular-nums text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {plan.progress}%
                      </span>
                    )}
                  </Link>
                ))
              )}

              {/* View All Plans */}
              {plans && plans.length > 10 && (
                <Link
                  to="/app/plans"
                  onClick={handleNavClick}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
                >
                  <span>View all</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </nav>
          </div>
        )}

        {/* Spacer when not showing plans */}
        {!showPlans && <div className="flex-1" />}

        {/* Navigation */}
        <div className="border-t border-gray-100 dark:border-gray-800/60">
          {/* Primary nav */}
          {isAuthenticated && (
            <nav className="px-2 pt-2 pb-1 space-y-0.5">
              {primaryNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors ${
                    item.isActiveFn()
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Secondary nav — smaller, muted */}
          <nav className="px-2 pb-2 pt-0.5 space-y-0.5">
            {secondaryNav
              .filter(item => item.alwaysShow || isAuthenticated)
              .map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-2.5 px-2.5 py-1 rounded-md transition-colors ${
                    item.isActiveFn()
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{item.label}</span>
                </Link>
              ))}
          </nav>

          {/* User Section — for authenticated users */}
          {isAuthenticated && (
            <div className="px-2.5 py-2 border-t border-gray-100 dark:border-gray-800/60">
              <div className="flex items-center gap-2">
                <Link
                  to="/app/settings/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-2 flex-1 min-w-0 px-1 py-1 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300">
                        {(userName || userEmail || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-px -right-px w-2 h-2 bg-emerald-500 border border-white dark:border-gray-950 rounded-full" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {userName || userEmail || 'User'}
                  </span>
                </Link>

                {/* Compact utility row */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <ThemeToggle size="sm" />
                  <NotificationBell />
                  <button
                    onClick={handleSignOut}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sign In Section — for public/unauthenticated users */}
          {!isAuthenticated && (
            <div className="px-2.5 py-2 border-t border-gray-100 dark:border-gray-800/60 space-y-1.5">
              <div className="flex items-center justify-between px-1 mb-1">
                <ThemeToggle size="sm" />
              </div>
              <Link
                to="/login"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors font-medium"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-1.5 w-full px-2.5 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors font-medium"
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
