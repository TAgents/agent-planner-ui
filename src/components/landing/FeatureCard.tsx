import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon: Icon,
  color
}) => {
  // Color mappings for Tailwind classes (light and dark mode)
  const colorClasses = {
    blue: {
      border: 'border-blue-300 dark:border-blue-700',
      bg: 'bg-blue-100 dark:bg-blue-900/50',
      text: 'text-blue-600 dark:text-blue-400',
      hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
    },
    green: {
      border: 'border-green-300 dark:border-green-700',
      bg: 'bg-green-100 dark:bg-green-900/50',
      text: 'text-green-600 dark:text-green-400',
      hover: 'group-hover:text-green-600 dark:group-hover:text-green-400'
    },
    gray: {
      border: 'border-gray-300 dark:border-gray-600',
      bg: 'bg-gray-100 dark:bg-gray-700',
      text: 'text-gray-600 dark:text-gray-300',
      hover: 'group-hover:text-gray-600 dark:group-hover:text-gray-300'
    },
    purple: {
      border: 'border-purple-300 dark:border-purple-700',
      bg: 'bg-purple-100 dark:bg-purple-900/50',
      text: 'text-purple-600 dark:text-purple-400',
      hover: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
    },
    amber: {
      border: 'border-amber-300 dark:border-amber-700',
      bg: 'bg-amber-100 dark:bg-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      hover: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
    },
    indigo: {
      border: 'border-indigo-300 dark:border-indigo-700',
      bg: 'bg-indigo-100 dark:bg-indigo-900/50',
      text: 'text-indigo-600 dark:text-indigo-400',
      hover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="group relative p-6 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl dark:hover:shadow-blue-900/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
      {/* Icon with colored background */}
      <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
