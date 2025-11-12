import React from 'react';
import { CodeBlock } from './CodeBlock';
import { StepCard } from './StepCard';

export const GettingStartedSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Sign in with GitHub',
      description: 'Connect your GitHub account to create and manage plans. Your permissions sync automatically.',
      code: null,
      language: null,
      showButton: true
    },
    {
      number: 2,
      title: 'Install MCP Server',
      description: 'Run the Agent Planner MCP server to enable AI agent integration with Claude.',
      code: 'npx -y agent-planner-mcp',
      language: 'bash',
      showButton: false
    },
    {
      number: 3,
      title: 'Configure Claude Desktop',
      description: 'Add the Agent Planner MCP server to your Claude Desktop configuration file.',
      code: `{
  "mcpServers": {
    "planning-system": {
      "command": "npx",
      "args": ["-y", "agent-planner-mcp"],
      "env": {
        "API_URL": "https://api.agentplanner.io",
        "USER_API_TOKEN": "your_api_token_here"
      }
    }
  }
}`,
      language: 'json',
      showButton: false
    },
    {
      number: 4,
      title: 'Start Planning with AI',
      description: 'Tell Claude to create your first plan. The agent will use MCP tools to interact with Agent Planner.',
      code: `Create a plan for "Build REST API" with phases for design, implementation, and testing. Add tasks to the implementation phase: set up Express server, add authentication, create database models.`,
      language: 'text',
      showButton: false
    }
  ];

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Getting Started
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Set up Agent Planner in minutes and start collaborating with AI agents
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
              {step.code && (
                <CodeBlock
                  code={step.code}
                  language={step.language || 'text'}
                />
              )}

              {/* Step 1: GitHub Sign-in Button */}
              {step.showButton && (
                <a
                  href="/auth/github"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Sign in with GitHub
                </a>
              )}
            </StepCard>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-12 md:mt-16 p-6 md:p-8 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
          <p className="text-base md:text-lg text-gray-700 mb-4 leading-relaxed">
            Need help? Check out our documentation or join our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/docs"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              View Documentation
            </a>
            <a
              href="https://github.com/talkingagents/agent-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GettingStartedSection;
