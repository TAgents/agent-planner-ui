import React from 'react';
import {
  Bot,
  LayoutList,
  Globe,
  Zap,
  Users,
  BookOpen,
  Webhook,
  GitBranch,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  label: string;
  detail: string;
}

const features: Feature[] = [
  { icon: Bot, label: 'MCP-native', detail: 'Any MCP-compatible agent can create, update, and track plans.' },
  { icon: LayoutList, label: 'Hierarchical plans', detail: 'Phases, tasks, milestones with dependencies and critical path analysis.' },
  { icon: BookOpen, label: 'Knowledge graph', detail: 'Temporal knowledge via Graphiti — entities, facts, and contradictions.' },
  { icon: Users, label: 'Human-in-the-loop', detail: 'Agents request decisions. You review and approve via UI or notifications.' },
  { icon: Zap, label: 'Real-time sync', detail: 'WebSocket updates, live progress tracking, multi-agent collaboration.' },
  { icon: GitBranch, label: 'RPI chains', detail: 'Research → Plan → Implement workflows with auto-compacted context.' },
  { icon: Webhook, label: 'Notifications', detail: 'Slack, webhooks, email. Get notified on blocks, completions, decisions.' },
  { icon: Globe, label: 'Public plans', detail: 'Share plans publicly for open-source transparency.' },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 max-w-2xl">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
          What it does
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {features.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <f.icon className="w-4 h-4 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{f.label}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
