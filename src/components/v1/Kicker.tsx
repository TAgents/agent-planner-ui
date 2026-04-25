import React from 'react';
import { cn } from './cn';

export type KickerProps = {
  className?: string;
  children: React.ReactNode;
};

/**
 * Mono-uppercase kicker label used above section titles
 * (e.g. "◆ NEXT UP", "◇ ACTIVITY"). The kicker pattern is load-bearing
 * in the v1 redesign — see design_handoff_agentplanner/02-design-tokens.md.
 */
export function Kicker({ className, children }: KickerProps) {
  return (
    <div
      className={cn(
        'font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-text-muted',
        className,
      )}
    >
      {children}
    </div>
  );
}
