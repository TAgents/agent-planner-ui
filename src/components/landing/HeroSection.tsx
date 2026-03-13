import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="AgentPlanner" className="w-10 h-10 rounded-lg" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              AgentPlanner
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded uppercase">
              Alpha
            </span>
          </div>

          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Structured planning backend for AI agents.
            Hierarchical plans, dependency tracking, knowledge graph, and real-time sync — accessible via MCP or REST API.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/api/api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Terminal className="w-4 h-4" />
              API Docs
            </a>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1 px-4 py-2.5 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Explore public plans
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
