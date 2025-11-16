import React from 'react';
import { usePlatformStats } from '../../hooks/usePlatformStats';

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
      label: 'Active Users'
    },
    {
      number: isLoading ? '...' : formatNumber(statsData?.plans || 0),
      label: 'Plans Created'
    },
    {
      number: isLoading ? '...' : formatNumber(statsData?.publicPlans || 0),
      label: 'Public Plans'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Planning in public with trusted teams
          </h2>
          <p className="text-base text-gray-600">
            Join developers and project managers using Agent Planner
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <div className="text-base text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Projects Note */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Used by open source teams and growing fast
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
