import React, { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { StepCard } from './StepCard';
import { Bot, Key, Terminal, MessageSquare } from 'lucide-react';

export const GettingStartedSection: React.FC = () => {
  const [configTab, setConfigTab] = useState<'openclaw' | 'claude-desktop' | 'claude-code'>('openclaw');

  const openclawConfig = `# In your OpenClaw config (config.yaml)
tools:
  - name: agent-planner
    type: mcp
    command: npx
    args: ["-y", "agent-planner-mcp"]
    env:
      API_URL: https://api.agentplanner.io
      USER_API_TOKEN: your_api_token_here`;

  const claudeDesktopConfig = `{
  "mcpServers": {
    "agent-planner": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "https://api.agentplanner.io",
        "USER_API_TOKEN": "your_api_token_here"
      }
    }
  }
}`;

  const claudeCodeConfig = `claude mcp add agent-planner npx agent-planner-mcp \\
  -e API_URL=https://api.agentplanner.io \\
  -e USER_API_TOKEN=your_api_token_here`;

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign in with GitHub or email. Your agent will use your account to create and manage plans.',
      icon: Bot,
      showButton: true,
      showTabs: false
    },
    {
      number: 2,
      title: 'Generate an API Token',
      description: 'Go to Settings → API Tokens and create a new token with read/write permissions. Keep it secure!',
      icon: Key,
      showButton: false,
      showTabs: false
    },
    {
      number: 3,
      title: 'Configure Your Agent',
      description: 'Add the AgentPlanner MCP server to your agent\'s tools. Works with OpenClaw, Claude Desktop, or any MCP-compatible client.',
      icon: Terminal,
      showButton: false,
      showTabs: true
    },
    {
      number: 4,
      title: 'Start Planning',
      description: 'Ask your agent to create a plan. It will break down your goals into structured phases and tasks.',
      icon: MessageSquare,
      code: `"Create a plan for building a mobile app with phases 
for design, development, and launch"`,
      showButton: false,
      showTabs: false
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
            5 Minutes to Setup
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Get Your Agent Planning
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            Connect AgentPlanner to your AI agent and start creating structured plans
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-0">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            >
              {/* Configuration Tabs for Step 3 */}
              {step.showTabs && (
                <>
                  <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <button
                      onClick={() => setConfigTab('openclaw')}
                      className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                        configTab === 'openclaw'
                          ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      OpenClaw
                    </button>
                    <button
                      onClick={() => setConfigTab('claude-desktop')}
                      className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                        configTab === 'claude-desktop'
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Claude Desktop
                    </button>
                    <button
                      onClick={() => setConfigTab('claude-code')}
                      className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                        configTab === 'claude-code'
                          ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Claude Code
                    </button>
                  </div>
                  <CodeBlock 
                    code={configTab === 'openclaw' ? openclawConfig : configTab === 'claude-desktop' ? claudeDesktopConfig : claudeCodeConfig} 
                    language={configTab === 'claude-code' ? 'bash' : configTab === 'openclaw' ? 'yaml' : 'json'} 
                  />
                </>
              )}

              {/* Code example for Step 4 */}
              {step.code && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">Example prompt:</p>
                  <code className="text-sm text-purple-800 dark:text-purple-200 font-mono">
                    {step.code}
                  </code>
                </div>
              )}

              {/* Sign in button for Step 1 */}
              {step.showButton && (
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4"
                >
                  Get Started
                </a>
              )}
            </StepCard>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800">
          <Bot className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Ready to connect your agent?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Choose your platform below and follow the configuration guide.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Bot className="w-5 h-5" />
            Start for Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedSection;
