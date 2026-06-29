import React from 'react';
import { cn } from './cn';

export type GoalCompassAxis = {
  /** Axis label, e.g. "Plans" / "Criteria" / "Reviews" / "Links". */
  label: string;
  /** Numeric count surfaced on the axis. */
  count: number;
  /** Color override; defaults to violet. */
  color?: string;
  /** Tooltip / sublabel. */
  sub?: string;
};

export type GoalCompassProps = {
  /** Center title (typically truncated goal name). */
  centerLabel: React.ReactNode;
  /** 3–6 labeled axes, placed evenly around the circle starting at the top. */
  axes: GoalCompassAxis[];
  size?: number;
  className?: string;
};

/**
 * Goal Compass — radial SVG with the goal at center and N evenly-spaced
 * labeled axes (starting at the top, clockwise).
 *
 * Per-axis radial line length scales with count (log-bounded so a
 * single mega-axis doesn't squash the others), with a small dot at
 * the line tip + count label outboard.
 */
export function GoalCompass({ centerLabel, axes, size = 220, className }: GoalCompassProps) {
  const cx = size / 2;
  const cy = size / 2;
  const innerR = 26;
  const outerR = size / 2 - 28;

  const max = Math.max(1, ...axes.map((a) => a.count));
  const lengthFor = (n: number) => {
    const t = Math.log10(1 + n) / Math.log10(1 + max);
    return innerR + (outerR - innerR) * Math.max(0.08, t);
  };

  // Evenly space N axes around the circle, first one at the top (−90°).
  const n = Math.max(1, axes.length);
  const positions = axes.map((_, i) => {
    const angle = (-90 + (i * 360) / n) * (Math.PI / 180);
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    return {
      dx,
      dy,
      anchor: (dx > 0.3 ? 'start' : dx < -0.3 ? 'end' : 'middle') as 'start' | 'end' | 'middle',
      baseline: (dy > 0.3 ? 'hanging' : dy < -0.3 ? 'auto' : 'middle') as 'hanging' | 'auto' | 'middle',
      labelOffset: dy < -0.3 ? -8 : dy > 0.3 ? 12 : 0,
    };
  });

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Concentric grid for visual structure */}
        {[0.33, 0.66, 1].map((t) => (
          <circle
            key={t}
            cx={cx}
            cy={cy}
            r={innerR + (outerR - innerR) * t}
            stroke="rgb(var(--surface-hi))"
            strokeWidth={1}
            fill="none"
            opacity={0.5}
          />
        ))}
        {/* Light radial guide to each axis */}
        {positions.map((pos, i) => (
          <line
            key={`guide-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + pos.dx * outerR}
            y2={cy + pos.dy * outerR}
            stroke="rgb(var(--border))"
            strokeWidth={1}
            opacity={0.5}
          />
        ))}

        {axes.map((axis, i) => {
          const pos = positions[i];
          const len = lengthFor(axis.count);
          const tipX = cx + pos.dx * len;
          const tipY = cy + pos.dy * len;
          const stroke = axis.color || 'rgb(var(--violet) / 1)';
          return (
            <g key={axis.label}>
              <line
                x1={cx + pos.dx * innerR}
                y1={cy + pos.dy * innerR}
                x2={tipX}
                y2={tipY}
                stroke={stroke}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <circle cx={tipX} cy={tipY} r={4} fill={stroke} />
              <text
                x={cx + pos.dx * (outerR + 4)}
                y={cy + pos.dy * (outerR + 4) + (pos.labelOffset || 0)}
                textAnchor={pos.anchor}
                dominantBaseline={pos.baseline}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', fill: 'rgb(var(--text-muted))' }}
              >
                {axis.label}
              </text>
              <text
                x={cx + pos.dx * (outerR - 6)}
                y={cy + pos.dy * (outerR - 6) + (pos.labelOffset ? pos.labelOffset / 2 : 0)}
                textAnchor={pos.anchor === 'middle' ? 'middle' : pos.anchor}
                dominantBaseline={pos.baseline === 'hanging' ? 'auto' : pos.baseline}
                style={{ fontFamily: 'ui-sans-serif, system-ui', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', fill: 'rgb(var(--text))' }}
              >
                {axis.count}
              </text>
            </g>
          );
        })}

        {/* Center disc + label */}
        <circle cx={cx} cy={cy} r={innerR} fill="rgb(var(--surface))" stroke="rgb(var(--border-hi))" strokeWidth={1} />
      </svg>
      <div className="absolute flex max-w-[60%] flex-col items-center text-center">
        <span className="line-clamp-2 font-display text-[11px] font-semibold leading-[1.2] tracking-[-0.01em] text-text">
          {centerLabel}
        </span>
      </div>
    </div>
  );
}
