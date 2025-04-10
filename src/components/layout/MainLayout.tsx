import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Moon, Sun, LogOut, Settings as SettingsIcon, Home } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import api from '../../services/api';

const MainLayout: React.FC = () => {
  const { state, toggleDarkMode } = useUI();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      // Clear the session from localStorage
      localStorage.removeItem('supabase_session');
      
      // Call the logout endpoint
      await api.auth.logout();
      
      // Navigate to the login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we still want to clear local storage and redirect
      navigate('/login');
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navbar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Planner</span>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                to="/settings"
                className="flex items-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                title="Settings"
              >
                <SettingsIcon className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Settings</span>
              </Link>
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
