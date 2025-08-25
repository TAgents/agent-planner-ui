import React from 'react';
import { ChevronDown, Eye, Edit, Shield } from 'lucide-react';

interface PermissionSelectorProps {
  value: 'viewer' | 'editor' | 'admin';
  onChange: (value: 'viewer' | 'editor' | 'admin') => void;
  disabled?: boolean;
}

const PermissionSelector: React.FC<PermissionSelectorProps> = ({ value, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const permissions = [
    {
      value: 'viewer' as const,
      label: 'Viewer',
      description: 'Can view and comment',
      icon: Eye,
      color: 'blue'
    },
    {
      value: 'editor' as const,
      label: 'Editor',
      description: 'Can edit and manage nodes',
      icon: Edit,
      color: 'yellow'
    },
    {
      value: 'admin' as const,
      label: 'Admin',
      description: 'Can manage users and settings',
      icon: Shield,
      color: 'green'
    }
  ];

  const currentPermission = permissions.find(p => p.value === value);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected 
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        : 'hover:bg-blue-50 dark:hover:bg-blue-900/50',
      yellow: isSelected 
        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        : 'hover:bg-yellow-50 dark:hover:bg-yellow-900/50',
      green: isSelected 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'hover:bg-green-50 dark:hover:bg-green-900/50'
    };
    return colors[color as keyof typeof colors];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } dark:bg-gray-700 dark:text-white`}
      >
        {currentPermission && (
          <>
            <currentPermission.icon className="w-4 h-4" />
            <span className="font-medium">{currentPermission.label}</span>
          </>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {permissions.map((permission) => {
              const Icon = permission.icon;
              const isSelected = value === permission.value;
              
              return (
                <button
                  key={permission.value}
                  onClick={() => {
                    onChange(permission.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 flex items-start gap-3 transition-colors ${
                    getColorClasses(permission.color, isSelected)
                  }`}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {permission.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {permission.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionSelector;
