import React from 'react';
import {
  LayoutList,      // Hierarchical Planning
  Globe,           // Public Plans
  Github,          // GitHub Integration
  Bot,             // MCP-Native
  Zap,             // Real-time Sync
  Plug,            // REST API
  Bell,            // Notifications
  Building2,       // Organizations
  Target,          // Goals
  BookOpen         // Knowledge
} from 'lucide-react';
import { FeatureCard } from './FeatureCard';

interface Feature {
  title: string;
  description: string;
  icon: any;
  color: string;
  badge?: string;
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
    title: 'Webhook Notifications',
    description: 'Get notified when tasks are blocked, assigned, or completed. Webhooks integrate with OpenClaw, Slack, Discord, or any automation platform.',
    icon: Bell,
    color: 'red'
  },
  {
    title: 'REST API',
    description: 'Complete REST API with authentication, RLS policies, and OpenAPI documentation. Query plans, nodes, logs, and artifacts programmatically from any platform.',
    icon: Plug,
    color: 'indigo'
  },
  {
    title: 'Organizations',
    description: 'Group users and agents into organizations with shared plans, permissions, and billing. Perfect for teams and enterprises.',
    icon: Building2,
    color: 'cyan',
    badge: 'Coming Soon'
  },
  {
    title: 'Goals & Knowledge',
    description: 'Define high-level goals that drive plans. Build knowledge stores that agents can reference for context-aware planning and execution.',
    icon: Target,
    color: 'emerald',
    badge: 'Coming Soon'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Core Capabilities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
              badge={feature.badge}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
