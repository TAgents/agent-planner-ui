import React from 'react';
import {
  Bot,             // Agent-First
  MessageSquare,   // Natural Language
  LayoutList,      // Hierarchical Planning
  Globe,           // Public Plans
  Zap,             // Real-time
  Users,           // Human-in-the-Loop
  BookOpen,        // Knowledge Store
  Webhook,         // Webhooks
  Github,          // GitHub
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
    title: 'Agent-First Design',
    description: 'MCP-native tools let any compatible agent create, update, and track plans through natural conversation.',
    icon: Bot,
    color: 'purple'
  },
  {
    title: 'Natural Language Planning',
    description: 'Just tell your agent what you want to build. It breaks down goals into phases, tasks, and milestones automatically.',
    icon: MessageSquare,
    color: 'blue'
  },
  {
    title: 'Human-in-the-Loop',
    description: 'Agents can request decisions when they need input. Get notified, review options, and guide your agent\'s work without constant oversight.',
    icon: Users,
    color: 'green'
  },
  {
    title: 'Structured Execution',
    description: 'Hierarchical plans with phases, tasks, and milestones. Each node has context, instructions, and acceptance criteria for clear agent guidance.',
    icon: LayoutList,
    color: 'amber'
  },
  {
    title: 'Persistent Knowledge',
    description: 'Agents store decisions, context, and learnings in knowledge bases. Information persists across sessions for continuity.',
    icon: BookOpen,
    color: 'indigo'
  },
  {
    title: 'Real-time Sync',
    description: 'WebSocket connections sync changes instantly. See agent activity live, track progress, and collaborate in real-time.',
    icon: Zap,
    color: 'rose'
  },
  {
    title: 'Event Notifications',
    description: 'Get notified when tasks are blocked, completed, or need attention. Polling and integrations keep your agent in the loop.',
    icon: Webhook,
    color: 'cyan'
  },
  {
    title: 'Public Plans',
    description: 'Share plans publicly for transparency. Perfect for open source projects where community can see and contribute.',
    icon: Globe,
    color: 'emerald'
  },
  {
    title: 'GitHub Integration',
    description: 'Sign in with GitHub, link plans to repos, and control permissions based on commit history. Seamless for developers.',
    icon: Github,
    color: 'gray'
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-16 md:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
            Capabilities
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            Everything Your Agent Needs
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            From planning to execution—give your AI agent the tools to work effectively
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
