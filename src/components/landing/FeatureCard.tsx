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
  // Color mappings for Tailwind classes
  const colorClasses = {
    blue: {
      border: 'border-blue-300',
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      hover: 'group-hover:text-blue-600'
    },
    green: {
      border: 'border-green-300',
      bg: 'bg-green-100',
      text: 'text-green-600',
      hover: 'group-hover:text-green-600'
    },
    gray: {
      border: 'border-gray-300',
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      hover: 'group-hover:text-gray-600'
    },
    purple: {
      border: 'border-purple-300',
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      hover: 'group-hover:text-purple-600'
    },
    amber: {
      border: 'border-amber-300',
      bg: 'bg-amber-100',
      text: 'text-amber-600',
      hover: 'group-hover:text-amber-600'
    },
    indigo: {
      border: 'border-indigo-300',
      bg: 'bg-indigo-100',
      text: 'text-indigo-600',
      hover: 'group-hover:text-indigo-600'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <div className="group relative p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
      {/* Icon with colored background */}
      <div className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg ${colors.bg} ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed text-sm md:text-base">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
