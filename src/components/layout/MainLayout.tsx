import React from 'react';
import { Outlet } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';

const MainLayout: React.FC = () => {
  const { state, toggleDarkMode } = useUI();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top navbar */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Agent Planner</span>
            </div>
            <div className="flex items-center">
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
