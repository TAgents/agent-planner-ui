import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Terminal,
  Key,
  Settings,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Monitor,
  Code2,
  Sparkles,
  ExternalLink,
  Info,
  Zap
} from 'lucide-react';

const MCPSetupGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedSection, setExpandedSection] = useState<'desktop' | 'code' | null>('desktop');

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const claudeDesktopConfig = `{
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
}`;

  const claudeCodeSetup = `npx -y agent-planner-mcp setup`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 mb-8 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Terminal className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              What is MCP?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              The <strong>Model Context Protocol (MCP)</strong> lets Claude connect directly to Agent Planner.
              Create, manage, and track plans through natural conversation in Claude Desktop or Claude Code.
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-500" />
          Prerequisites
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>API Token</strong> —
                <Link to="/app/settings" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                  Get yours from Settings
                </Link>
              </span>
            </li>
            <li className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Node.js 18+</strong> installed on your system
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Option A: Claude Desktop */}
      <div className="mb-6">
        <button
          onClick={() => setExpandedSection(expandedSection === 'desktop' ? null : 'desktop')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Monitor className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white">Option A: Claude Desktop</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use MCP in the Claude Desktop app</p>
            </div>
          </div>
          {expandedSection === 'desktop' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'desktop' && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">Get your API Token</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Go to Settings and create a new API token.
                  </p>
                  <Link
                    to="/app/settings"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Settings className="w-4 h-4" />
                    Open Settings
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">Locate your config file</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Find <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">claude_desktop_config.json</code>:
                  </p>
                  <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• <strong>macOS:</strong> <code className="text-xs">~/Library/Application Support/Claude/</code></li>
                    <li>• <strong>Windows:</strong> <code className="text-xs">%APPDATA%\Claude\</code></li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Add this configuration</h5>
                  <div className="relative group">
                    <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm">
                      <code className="text-green-400 font-mono">{claudeDesktopConfig}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(claudeDesktopConfig, 1)}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === 1 ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Replace "your_token_here" with your actual API token
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-1">Restart Claude Desktop</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Completely quit and reopen Claude Desktop. You should now see "planning-system" in your MCP tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Option B: Claude Code */}
      <div className="mb-8">
        <button
          onClick={() => setExpandedSection(expandedSection === 'code' ? null : 'code')}
          className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Code2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 dark:text-white">Option B: Claude Code (CLI)</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use MCP with Claude Code in your terminal</p>
            </div>
          </div>
          {expandedSection === 'code' ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'code' && (
          <div className="mt-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Run the setup wizard</h5>
                  <div className="relative group">
                    <pre className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto text-sm">
                      <code className="text-green-400 font-mono">{claudeCodeSetup}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(claudeCodeSetup, 2)}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {copiedIndex === 2 ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    The wizard will guide you through entering your API token.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Available Commands</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-blue-600 dark:text-blue-400">/create-plan</code>
                      <span className="text-gray-600 dark:text-gray-400">— Interactive plan builder</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-blue-600 dark:text-blue-400">/execute-plan</code>
                      <span className="text-gray-600 dark:text-gray-400">— Autonomous task executor</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-mono text-blue-600 dark:text-blue-400">/plan-status</code>
                      <span className="text-gray-600 dark:text-gray-400">— Real-time status reporter</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example Prompts */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Example Prompts
        </h3>
        <div className="grid gap-3">
          {[
            {
              icon: Zap,
              color: 'blue',
              title: 'Create a project plan',
              prompt: '"Create a plan for building a REST API with phases for design, implementation, and testing"'
            },
            {
              icon: Code2,
              color: 'purple',
              title: 'Break down tasks',
              prompt: '"Add detailed tasks to my \'Website Redesign\' plan for the frontend implementation phase"'
            },
            {
              icon: Check,
              color: 'green',
              title: 'Track progress',
              prompt: '"Show me all in-progress tasks and add a log entry for today\'s progress"'
            }
          ].map((example, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 bg-${example.color}-100 dark:bg-${example.color}-900 rounded-lg flex-shrink-0`}>
                  <example.icon className={`w-4 h-4 text-${example.color}-600 dark:text-${example.color}-400`} />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{example.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-1">{example.prompt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documentation Link */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Need more details? Check out the full documentation.
            </span>
          </div>
          <a
            href="https://github.com/tagents/agent-planner-mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View on GitHub
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MCPSetupGuide;
