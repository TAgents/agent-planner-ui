import React, { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';

interface ChannelToggle {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const [channels, setChannels] = useState<ChannelToggle[]>([
    {
      id: 'email-decisions',
      label: 'Decision queue email',
      description: 'When an agent surfaces a decision that needs your call.',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'email-stale',
      label: 'Stale-goal digest',
      description: 'Weekly summary of goals that have not progressed.',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'slack-decisions',
      label: 'Slack — decision pings',
      description: 'Posts to your active channel when a decision lands.',
      icon: MessageSquare,
      enabled: false,
    },
    {
      id: 'slack-completions',
      label: 'Slack — completion summary',
      description: 'End-of-day digest of what agents finished.',
      icon: MessageSquare,
      enabled: false,
    },
  ]);

  const toggle = (id: string) =>
    setChannels((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={Bell}
        title="Notifications"
        subtitle="Pick how AgentPlanner reaches you when an agent needs steering."
      />

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-[12px] uppercase tracking-[0.18em] text-text-sec">
              Channels
            </span>
          </div>
          <span className="text-[11px] text-text-sec">{channels.filter((c) => c.enabled).length} enabled</span>
        </div>
        <ul className="divide-y divide-border">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.id} className="flex items-start gap-3 px-4 py-3">
                <Icon className="mt-1 h-3.5 w-3.5 text-text-sec" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-text">{c.label}</div>
                  <div className="text-[11px] text-text-sec">{c.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(c.id)}
                  role="switch"
                  aria-checked={c.enabled}
                  className={[
                    'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
                    c.enabled ? 'bg-emerald' : 'bg-surface-hi border border-border',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-bg shadow transition-transform',
                      c.enabled ? 'translate-x-4' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border px-4 py-2.5 text-[11px] text-text-sec">
          Channel preferences sync to your active organization. You can override per-plan from the plan settings.
        </div>
      </div>
    </section>
  );
};

interface SectionHeaderProps {
  icon: React.FC<{ className?: string }>;
  title: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-1 h-4 w-4 text-text-sec" />
    <div>
      <h1 className="font-display text-[18px] font-semibold tracking-tight text-text">{title}</h1>
      <p className="text-[12px] text-text-sec">{subtitle}</p>
    </div>
  </div>
);

export default NotificationsSettings;
