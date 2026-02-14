import React from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  Copy,
  BookOpen,
} from 'lucide-react';
import { SettingsNav } from '../../components/settings/SettingsLayout';

const IntegrationsSettings: React.FC = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect AgentPlanner with external services and AI agents
          </p>
        </div>

        <SettingsNav />

        {/* OpenClaw Setup Guide */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                OpenClaw Setup Guide
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Connect your OpenClaw agent to receive real-time updates
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Add the AgentPlanner skill
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Install the AgentPlanner skill in your OpenClaw workspace:
                </p>
                <div className="mt-2 bg-gray-900 dark:bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-100 flex items-center justify-between">
                  <code>skills/agent-planner/SKILL.md</code>
                  <button
                    onClick={() => copyToClipboard('skills/agent-planner/SKILL.md')}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Set your API token
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Add your AgentPlanner API token as an environment variable:
                </p>
                <div className="mt-2 bg-gray-900 dark:bg-gray-950 rounded-lg p-3 font-mono text-sm text-gray-100">
                  <code>AGENTPLANNER_TOKEN=your_token_here</code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <Link to="/app/settings" className="text-blue-600 hover:underline">
                    Create an API token here →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <a
              href="https://docs.openclaw.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              View OpenClaw Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettings;
