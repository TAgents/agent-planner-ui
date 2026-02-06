import React from 'react';

interface SettingsPageProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Wrapper component for all settings pages.
 * Ensures consistent header style and max-width across all settings.
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  title, 
  description, 
  children 
}) => {
  return (
    <div className="max-w-2xl">
      {/* Header - ALWAYS present, ALWAYS same style */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

interface SettingsCardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger';
}

/**
 * Card component for grouping related settings.
 */
export const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  children, 
  variant = 'default' 
}) => {
  const borderColor = variant === 'danger' 
    ? 'border-red-200 dark:border-red-800' 
    : 'border-gray-200 dark:border-gray-700';
  
  const titleColor = variant === 'danger'
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-900 dark:text-white';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-6 ${borderColor}`}>
      {title && (
        <h2 className={`font-semibold mb-4 ${titleColor}`}>
          {variant === 'danger' && '⚠️ '}{title}
        </h2>
      )}
      {children}
    </div>
  );
};

interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  children: React.ReactNode;
}

/**
 * Form field wrapper with label and optional description.
 */
export const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  description, 
  required, 
  children 
}) => {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
};

interface ToggleSettingProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle setting with label and description.
 */
export const ToggleSetting: React.FC<ToggleSettingProps> = ({ 
  label, 
  description, 
  checked, 
  onChange,
  disabled = false
}) => {
  return (
    <label className={`flex items-start justify-between py-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <div className="pr-4">
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked 
            ? 'bg-blue-600' 
            : 'bg-gray-200 dark:bg-gray-700'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};

/**
 * Skeleton loader for settings pages - prevents white flash during navigation.
 */
export const SettingsPageSkeleton: React.FC = () => {
  return (
    <div className="max-w-2xl animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-64 mt-2" />
      </div>
      
      {/* Card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
      
      {/* Second card skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
