import React from 'react';
import { cn } from './cn';

export type SubwayStation = {
  id: string;
  title: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'plan_ready' | string;
  /** Optional href; when set, station tile is rendered as an <a>. */
  href?: string;
};

export type CriticalPathSubwayProps = {
  stations: SubwayStation[];
  /** Render compact (smaller stations, no titles) for sidebar use. */
  compact?: boolean;
  className?: string;
};

const STATION_COLOR: Record<string, string> = {
  not_started: 'rgb(var(--slate) / 1)',
  in_progress: 'rgb(var(--amber) / 1)',
  completed: 'rgb(var(--emerald) / 1)',
  blocked: 'rgb(var(--red) / 1)',
  plan_ready: 'rgb(var(--violet) / 1)',
};

const STATION_GLYPH: Record<string, string> = {
  not_started: '○',
  in_progress: '◐',
  completed: '✓',
  blocked: '⚠',
  plan_ready: '◇',
};

/**
 * Critical-Path Subway — horizontal subway-map of the longest-path
 * stations. Each station is a colored disc with a status glyph, joined
 * by a thin line; in compact mode titles drop and the stations shrink
 * to fit a sidebar slot.
 *
 * Pure SVG-on-text composition; no chart library.
 */
export function CriticalPathSubway({ stations, compact, className }: CriticalPathSubwayProps) {
  if (stations.length === 0) {
    return (
      <p className={cn('text-[12.5px] text-text-muted', className)}>
        No critical path detected — add a {`"blocks"`} dependency to surface one.
      </p>
    );
  }

  const dotSize = compact ? 14 : 22;
  const gap = compact ? 16 : 32;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <ol
        className="flex items-start"
        style={{ gap }}
      >
        {stations.map((s, i) => {
          const color = STATION_COLOR[s.status] || STATION_COLOR.not_started;
          const glyph = STATION_GLYPH[s.status] || '○';
          const Tag = (s.href ? 'a' : 'div') as React.ElementType;
          const props = s.href ? { href: s.href } : {};
          return (
            <li key={s.id} className="relative flex flex-col items-center" style={{ minWidth: dotSize + 40 }}>
              {i > 0 && (
                <span
                  className="absolute top-[10px] right-[calc(50%+12px)] h-[1.5px]"
                  style={{
                    width: gap,
                    background: 'rgb(var(--border-hi))',
                  }}
                />
              )}
              <Tag
                {...props}
                title={s.title}
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-full border-2 font-mono font-bold transition-transform',
                  s.href ? 'cursor-pointer hover:scale-110' : '',
                )}
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderColor: color,
                  background: 'rgb(var(--surface))',
                  color,
                  fontSize: compact ? 8 : 11,
                }}
              >
                {glyph}
              </Tag>
              {!compact && (
                <span className="mt-2 max-w-[120px] truncate text-center font-display text-[11px] font-semibold tracking-[-0.01em] text-text">
                  {s.title}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
