import React from 'react';
import {
  Bot,
  LayoutList,
  Zap,
  Users,
  BookOpen,
  GitBranch,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

const c = {
  surface: '#16140f',
  raised: '#1e1b15',
  border: '#2a261e',
  borderSubtle: '#1f1c16',
  text: '#ede8df',
  textMuted: '#6b6354',
  amber: '#d4a24e',
};

interface Feature {
  icon: LucideIcon;
  label: string;
  detail: string;
}

const features: Feature[] = [
  { icon: Bot, label: 'Persistent context', detail: 'Decisions, research, and rationale stored in a temporal knowledge graph. Available to every agent, every session.' },
  { icon: LayoutList, label: 'Structured coordination', detail: 'Goals, tasks, and dependency edges that every MCP-connected client reads from and writes to.' },
  { icon: BookOpen, label: 'Knowledge that compounds', detail: 'Graphiti-backed temporal graph with entity extraction, fact tracking, and contradiction detection across sessions.' },
  { icon: Users, label: 'Human oversight', detail: 'Decision queues, goal health metrics, and a full audit trail of what was decided and why.' },
  { icon: GitBranch, label: 'Research-to-implementation', detail: 'RPI chains with automatic context compaction. Research output flows into downstream implementation context.' },
  { icon: Zap, label: 'Multi-agent coordination', detail: 'Task claims, real-time sync, and shared state. Multiple agents work the same plan without conflicts.' },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-10 md:py-16" style={{ borderTop: `1px solid ${c.borderSubtle}` }}>
      <div className="max-w-[1080px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-10 landing-fade-up landing-delay-6">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em]" style={{ color: c.textMuted }}>
            Capabilities
          </span>
          <span className="font-mono text-[0.65rem]" style={{ color: c.textMuted }}>
            What it solves
          </span>
        </div>

        {/* Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 rounded-xl overflow-hidden landing-fade-up landing-delay-7"
          style={{ border: `1px solid ${c.borderSubtle}`, gap: '1px', background: c.borderSubtle }}
        >
          {features.map((f) => (
            <div
              key={f.label}
              className="group px-6 py-5 md:px-8 md:py-6 transition-colors duration-200 cursor-default"
              style={{ background: c.surface }}
              onMouseEnter={(e) => { e.currentTarget.style.background = c.raised; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = c.surface; }}
            >
              <f.icon
                className="w-5 h-5 mb-3 transition-all duration-200 group-hover:-translate-y-px"
                style={{ color: c.textMuted }}
                onMouseEnter={() => {}}
              />
              <div className="font-display text-[0.95rem] font-semibold mb-1" style={{ color: c.text, letterSpacing: '-0.01em' }}>
                {f.label}
              </div>
              <div className="text-[0.8rem] leading-relaxed" style={{ color: c.textMuted }}>
                {f.detail}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
