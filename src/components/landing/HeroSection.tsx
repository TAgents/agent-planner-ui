import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlayCircle } from 'react-icons/fi';

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-32">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">AP</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Agent Planner IO
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#setup" className="text-gray-600 hover:text-indigo-600 transition-colors">
              Setup
            </a>
            <Link
              to="/login"
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Get Started
            </Link>
          </motion.div>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></span>
                Now with MCP Support for Claude Desktop & Code
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Plan Smarter with{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Agents
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed"
            >
              Agent Planner IO is a collaborative planning system that enables seamless
              interaction between humans and AI agents via MCP (Model Context Protocol).
              Create, manage, and execute complex plans with your AI team.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Planning Free
                {React.createElement(FiArrowRight as any, { className: "ml-2" })}
              </Link>
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-lg font-semibold hover:border-indigo-400 transition-colors">
                {React.createElement(FiPlayCircle as any, { className: "mr-2" })}
                Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex items-center space-x-6 text-sm text-gray-600"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                5-minute setup
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-8 shadow-2xl">
              {/* Placeholder for actual product screenshot or illustration */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-indigo-100 to-purple-100 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="h-24 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200"></div>
                    <div className="h-24 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200"></div>
                  </div>
                  <div className="h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200 mt-4"></div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">AI Agent Active</span>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4"
                animate={{
                  y: [0, 10, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">5 Tasks Completed</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
