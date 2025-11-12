import React from 'react';

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  children?: React.ReactNode;
  isLast?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
  number,
  title,
  description,
  children,
  isLast = false
}) => {
  return (
    <div className="relative">
      {/* Step Indicator */}
      <div className="flex gap-4 md:gap-6">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg hover:shadow-xl transition-shadow duration-200">
            {number}
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 ${isLast ? '' : 'pb-8 md:pb-12'}`}>
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-base text-gray-600 mb-4 leading-relaxed">
            {description}
          </p>

          {/* Code Block or Additional Content */}
          {children}
        </div>
      </div>

      {/* Connector Line (except for last step) */}
      {!isLast && (
        <div className="absolute left-6 top-14 w-0.5 h-full bg-gray-300 -z-10" />
      )}
    </div>
  );
};
