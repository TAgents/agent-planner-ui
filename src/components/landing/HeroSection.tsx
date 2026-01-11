import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center">
          {/* AI Badge */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-1.5" />
            AI-Powered Planning
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            AI-Powered Planning for Your Ideas
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
            Let AI create plans from your ideas. Implement the plan with your AI tools.
            Or let our Agents implement them.
          </p>

          {/* Main CTA */}
          <Link
            to="/app/plans/ai-create"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start Planning</span>
          </Link>

          {/* Subtle explore link */}
          <p className="mt-8 text-sm text-gray-500">
            or{' '}
            <Link to="/explore" className="text-blue-600 hover:text-blue-800 hover:underline">
              explore public plans
            </Link>
            {' '}to see examples
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
