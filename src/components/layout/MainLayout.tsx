import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Moon, Sun, LogOut } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';
import api from '../../services/api';

const MainLayout: React.FC = () => {
  const { state, toggleDarkMode } = useUI();
  const navigate = useNavigate();
  
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
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Planner</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="flex items-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-1 hidden sm:inline">Logout</span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
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
