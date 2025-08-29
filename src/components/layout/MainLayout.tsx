import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings as SettingsIcon, Home, User/*, Users */ } from 'lucide-react';
import { useQueryClient } from 'react-query';
import { useUI } from '../../contexts/UIContext';
import api from '../../services/api';

const MainLayout: React.FC = () => {
  const { state, toggleDarkMode } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const handleLogout = async () => {
    try {
      // Clear the session from localStorage
      localStorage.removeItem('auth_session');
      localStorage.removeItem('supabase_session');
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Call the logout endpoint
      await api.auth.logout();
      
      // Navigate to the login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear local storage and redirect
      queryClient.clear();
      navigate('/login');
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navbar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link 
              to="/plans" 
              className="flex items-center hover:opacity-80 transition-opacity duration-200"
              title="Back to Plans"
            >
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Planner</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                to="/plans"
                className={`flex items-center p-2 rounded-lg transition duration-200 border ${
                  location.pathname === '/plans' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                title="Plans"
              >
                <Home className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">My Plans</span>
              </Link>
              {/* Shared tab hidden - functionality not fully implemented
              <Link
                to="/shared"
                className={`flex items-center p-2 rounded-lg transition duration-200 border ${
                  location.pathname === '/shared' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                title="Shared Plans"
              >
                <Users className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Shared</span>
              </Link> */}
              <Link
                to="/profile"
                className={`flex items-center p-2 rounded-lg transition duration-200 border ${
                  location.pathname === '/profile'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                title="Profile"
              >
                <User className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Profile</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center p-2 rounded-lg transition duration-200 border ${
                  location.pathname === '/settings'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                title="Settings"
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Settings</span>
              </Link>
              
              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />
              
              <button
                onClick={handleLogout}
                className="flex items-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              >
                {state.darkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-12 items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Agent Planner
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
