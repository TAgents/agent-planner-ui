import React from 'react';
import { FileText, Bot, CheckCircle, ArrowRight } from 'lucide-react';

export const SocialProofSection: React.FC = () => {
  const steps = [
    {
      icon: FileText,
      emoji: '📝',
      title: 'Describe',
      description: 'Tell your agent what to build. Describe your project goals in natural language.',
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Bot,
      emoji: '🤖',
      title: 'AI Plans',
      description: 'Your agent breaks it into structured phases and tasks automatically.',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: CheckCircle,
      emoji: '✅',
      title: 'Execute',
      description: 'Track progress, approve results, and let agents execute step by step.',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            How It Works
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From idea to execution in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Arrow between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 z-10">
                  <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                </div>
              )}
              
              <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <span className="text-3xl">{step.emoji}</span>
              </div>
              <h3 className={`text-lg font-semibold ${step.color} mb-2`}>
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
