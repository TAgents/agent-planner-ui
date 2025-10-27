import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const setupSteps = [
  {
    number: 1,
    title: 'Sign Up & Create API Token',
    description: 'Register for free and generate your API token from the Settings page.',
    command: null,
  },
  {
    number: 2,
    title: 'Install via npx',
    description: 'No installation needed! The MCP server runs directly via npx.',
    command: 'npx -y agent-planner-mcp',
  },
  {
    number: 3,
    title: 'Configure Claude Desktop',
    description: 'Add the configuration to your claude_desktop_config.json file:',
    command: `{
  "mcpServers": {
    "planning-system": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "https://api.agentplanner.io",
        "USER_API_TOKEN": "your_token_here"
      }
    }
  }
}`,
  },
  {
    number: 4,
    title: 'Start Planning with AI',
    description: 'Restart Claude Desktop and start collaborating with AI on your plans!',
    command: null,
  },
];

const MCPSetupSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="setup" className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Setup - 5 Minutes
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get Started with{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MCP Integration
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect Agent Planner to Claude Desktop in just a few steps. No complex setup required!
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          {setupSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="mb-8 last:mb-0"
            >
              <div className="flex gap-6">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>

                  {step.command && (
                    <div className="bg-gray-900 rounded-lg p-4 relative group">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-400 font-mono">Terminal</span>
                      </div>
                      <pre className="text-sm text-green-400 font-mono overflow-x-auto">
                        <code>{step.command}</code>
                      </pre>
                      <button
                        onClick={() => navigator.clipboard.writeText(step.command || '')}
                        className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < setupSteps.length - 1 && (
                <div className="ml-6 h-8 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Example Prompts Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
              Example Prompts to Get Started
            </h3>
            <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
              Try these prompts in Claude Desktop to create and manage your plans:
            </p>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Prompt 1 */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Create a New Project Plan</h4>
                    <p className="text-sm text-gray-700 italic">
                      "Create a plan for building a REST API for a todo application with phases for design, implementation, testing, and deployment"
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt 2 */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Break Down a Complex Task</h4>
                    <p className="text-sm text-gray-700 italic">
                      "Add tasks to my 'Website Redesign' plan for the implementation phase. Include frontend, backend, and database work"
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt 3 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Track Progress</h4>
                    <p className="text-sm text-gray-700 italic">
                      "Show me all in-progress tasks in my 'Q1 Launch' plan and add a log entry to track today's progress"
                    </p>
                  </div>
                </div>
              </div>

              {/* Prompt 4 */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Search & Analyze</h4>
                    <p className="text-sm text-gray-700 italic">
                      "Search all my plans for tasks related to 'authentication' and give me a summary of what's completed"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-indigo-900 font-semibold mb-1">Pro Tip:</p>
                  <p className="text-sm text-indigo-800">
                    You can ask Claude to create hierarchical plans with phases, tasks, and milestones. It can also help you track progress, add logs, manage artifacts, and search across all your plans!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to start planning with AI?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join developers and teams using Agent Planner to collaborate with AI agents via the Model Context Protocol.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </Link>
              <a
                href="https://github.com/tagents/agent-planner-mcp"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-all"
              >
                View on GitHub
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Open source MCP server</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>5-minute setup</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MCPSetupSection;
