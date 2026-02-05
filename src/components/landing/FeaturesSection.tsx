import React from 'react';
import {
  LayoutList,      // Hierarchical Planning
  Globe,           // Public Plans
  Github,          // GitHub Integration
  Bot,             // MCP-Native
  Zap,             // Real-time Sync
  Plug             // REST API
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const features: Feature[] = [
  {
    title: 'Hierarchical Planning',
    description: 'Organize work into plans, phases, tasks, and milestones. Each node supports metadata, acceptance criteria, and agent instructions for complete project structure.',
    icon: LayoutList,
    color: 'blue'
  },
  {
    title: 'Public Plans & Collaboration',
    description: 'Share plans publicly for transparency and community visibility. Control edit permissions with GitHub committer status. Perfect for open source projects.',
    icon: Globe,
    color: 'green'
  },
  {
    title: 'GitHub Integration',
    description: 'Sign in with GitHub OAuth for seamless authentication. Link plans to repositories with automatic permission detection based on commit history.',
    icon: Github,
    color: 'gray'
  },
  {
    title: 'MCP-Native',
    description: 'AI agents interact directly via Model Context Protocol. Tools for creating plans, updating nodes, searching, and batch operations without custom integration.',
    icon: Bot,
    color: 'purple'
  },
  {
    title: 'Real-time Sync',
    description: 'WebSocket connections sync changes instantly across all clients. See who\'s viewing nodes, typing indicators, and live updates from AI agents and team members.',
    icon: Zap,
    color: 'amber'
  },
  {
    title: 'REST API',
    description: 'Complete REST API with authentication, RLS policies, and OpenAPI documentation. Query plans, nodes, and logs programmatically from any platform.',
    icon: Plug,
    color: 'indigo'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Core Capabilities
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to plan, collaborate, and execute with your team and AI agents
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              color={feature.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
