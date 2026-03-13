import React, { useState } from 'react';
import { CodeBlock } from './CodeBlock';

export const SocialProofSection: React.FC = () => {
  const [configTab, setConfigTab] = useState<'claude-code' | 'claude-desktop' | 'openclaw'>('claude-code');

  const claudeCodeConfig = `claude mcp add agent-planner npx agent-planner-mcp \\
  -e API_URL=https://agentplanner.io/api \\
  -e USER_API_TOKEN=your_api_token_here`;

  const claudeDesktopConfig = `{
  "mcpServers": {
    "agent-planner": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "https://agentplanner.io/api",
        "USER_API_TOKEN": "your_api_token_here"
      }
    }
  }
}`;

  const openclawConfig = `# openclaw config
tools:
  - name: agent-planner
    type: mcp
    command: npx
    args: ["-y", "agent-planner-mcp"]
    env:
      API_URL: https://agentplanner.io/api
      USER_API_TOKEN: your_api_token_here`;

  const tabs = [
    { key: 'claude-code' as const, label: 'Claude Code', lang: 'bash' },
    { key: 'claude-desktop' as const, label: 'Claude Desktop', lang: 'json' },
    { key: 'openclaw' as const, label: 'OpenClaw', lang: 'yaml' },
  ];

  const configs = { 'claude-code': claudeCodeConfig, 'claude-desktop': claudeDesktopConfig, openclaw: openclawConfig };

  return (
    <section className="py-10 md:py-14 bg-gray-50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700/50">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Connect your agent
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          1. <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</a> and generate an API token in{' '}
          <a href="/app/settings" className="text-blue-600 dark:text-blue-400 hover:underline">Settings</a>.
          <br />
          2. Add the MCP server to your agent:
        </p>

        <div className="flex gap-1 mb-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setConfigTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                configTab === tab.key
                  ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <CodeBlock
          code={configs[configTab]}
          language={tabs.find(t => t.key === configTab)!.lang}
        />

        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
          Then ask your agent: <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">"Create a plan for building a REST API"</code>
        </p>
      </div>
    </section>
  );
};

export default SocialProofSection;
