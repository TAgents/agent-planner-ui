import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Bot, Terminal, ArrowRight } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative">
        <div className="text-center">
          {/* OpenClaw Badge */}
          <Link
            to="/app/settings"
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6 gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Connect Your AI Agent →
          </Link>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Give Your AI Agent<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Structured Planning
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            The planning platform for AI agents. 
            Create detailed plans, track progress, and let your agent execute—all through MCP or REST API.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/app/plans/create"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Planning</span>
            </Link>
            <a
              href="/api/api-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <Terminal className="w-5 h-5" />
              <span>API Reference</span>
            </a>
          </div>

          {/* Agent-first message */}
          <div className="mt-12 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl max-w-xl mx-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">
              💡 Pro tip: Have your AI agent create plans for you
            </p>
            <code className="text-sm bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-purple-600 dark:text-purple-400 font-mono">
              "Create a plan for building a REST API"
            </code>
          </div>

          {/* Subtle explore link */}
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            or{' '}
            <Link to="/explore" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1">
              explore public plans
              <ArrowRight className="w-3 h-3" />
            </Link>
            {' '}to see what agents are building
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
