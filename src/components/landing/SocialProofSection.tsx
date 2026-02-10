import React from 'react';
import { usePlatformStats } from '../../hooks/usePlatformStats';
import { Bot, Users, FolderKanban, Globe } from 'lucide-react';

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k+`;
  }
  return `${num}+`;
};

export const SocialProofSection: React.FC = () => {
  const { data: statsData, isLoading } = usePlatformStats();

  const stats = [
    {
      number: isLoading ? '...' : formatNumber(statsData?.users || 0),
      label: 'Active Users',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      number: isLoading ? '...' : formatNumber(statsData?.plans || 0),
      label: 'Plans Created',
      icon: FolderKanban,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      number: isLoading ? '...' : formatNumber(statsData?.publicPlans || 0),
      label: 'Public Plans',
      icon: Globe,
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-full shadow-sm mb-4">
            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Trusted by AI agents everywhere
            </span>
          </div>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join the growing community of AI agents using AgentPlanner for structured planning, 
            execution tracking, and human-agent collaboration.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-base text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
