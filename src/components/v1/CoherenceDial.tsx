import React from 'react';
import { cn } from './cn';

export type CoherenceDialProps = {
  /** Score in [0, 1]. */
  score: number;
  /** Per-axis sub-scores in [0, 1] for the 3 concentric arcs (B/D/I). Optional. */
  beliefs?: number;
  desires?: number;
  intentions?: number;
  /** Center label override (defaults to percentage). */
  centerLabel?: React.ReactNode;
  /** Sublabel under the percentage. */
  caption?: React.ReactNode;
  size?: number;
  className?: string;
};

const colorForScore = (score: number): string => {
  if (score >= 0.8) return 'rgb(var(--emerald) / 1)';
  if (score >= 0.5) return 'rgb(var(--amber) / 1)';
  return 'rgb(var(--red) / 1)';
};

/**
 * BDI Coherence Dial — three concentric arcs (beliefs / desires /
 * intentions) wrapped around a center percentage. When per-axis
 * sub-scores aren't passed, all three arcs draw at the overall score.
 *
 * SVG-only, no animation library; entrance is a simple stroke-dashoffset
 * transition so the arcs draw in.
 */
export function CoherenceDial({
  score,
  beliefs,
  desires,
  intentions,
  centerLabel,
  caption,
  size = 180,
  className,
}: CoherenceDialProps) {
  const clamped = Math.max(0, Math.min(1, score));
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 6;

  // Outer→inner: beliefs (largest), desires, intentions (smallest).
  const radii = [size / 2 - stroke * 2, size / 2 - stroke * 5, size / 2 - stroke * 8];
  const ringValues = [
    typeof beliefs === 'number' ? beliefs : clamped,
    typeof desires === 'number' ? desires : clamped,
    typeof intentions === 'number' ? intentions : clamped,
  ].map((v) => Math.max(0, Math.min(1, v)));

  const color = colorForScore(clamped);
  const display =
    centerLabel ?? `${Math.round(clamped * 100)}%`;

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {radii.map((r, i) => {
          const c = 2 * Math.PI * r;
          const offset = c * (1 - ringValues[i]);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                stroke="rgb(var(--surface-hi))"
                strokeWidth={stroke}
                fill="none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={color}
                strokeWidth={stroke}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
                opacity={1 - i * 0.18}
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-[32px] font-bold tracking-[-0.04em] text-text">
          {display}
        </span>
        {caption && (
          <span className="mt-[2px] font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
