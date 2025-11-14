import React from 'react';
import { CodeBlock } from './CodeBlock';
import { StepCard } from './StepCard';

export const GettingStartedSection: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: 'Sign in to your account',
      description: 'Sign in with GitHub or create an account with email. GitHub integration syncs your permissions automatically.',
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

              {/* Step 1: Sign-in Button */}
              {step.showButton && (
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
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
