import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUI } from '../../contexts/UIContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  showLabel = false,
  size = 'md' 
}) => {
  const { state, toggleDarkMode } = useUI();
  const isDark = state.darkMode;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        ${buttonSizes[size]}
        flex items-center gap-2
        rounded-lg
        text-gray-600 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-800
        hover:text-gray-900 dark:hover:text-white
        transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
        ${className}
      `}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className={sizeClasses[size]} />
      ) : (
        <Moon className={sizeClasses[size]} />
      )}
      {showLabel && (
        <span className="text-sm">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
