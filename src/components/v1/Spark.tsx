import React from 'react';

export type SparkProps = {
  /** Numeric series. Defaults render at width 60 × height 18. */
  values: number[];
  /** Stroke color. Defaults to amber via CSS var. */
  color?: string;
  width?: number;
  height?: number;
  /** Stroke width in px. */
  strokeWidth?: number;
  className?: string;
};

/**
 * Tiny SVG polyline sparkline — 60×18 default. No chart library; the
 * design uses these as inline density indicators on goal/plan cards.
 * Pass at least 2 points or the line collapses to a dot.
 */
export function Spark({
  values,
  color = 'rgb(var(--amber) / 1)',
  width = 60,
  height = 18,
  strokeWidth = 1.4,
  className,
}: SparkProps) {
  if (!values || values.length === 0) {
    return <svg width={width} height={height} className={className} aria-hidden />;
  }

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const pts = values
    .map((v, i) => {
      const x = values.length === 1 ? width / 2 : (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
