import React from 'react';

export type StatusDotProps = {
  /** Direct color value (hex, rgb, or CSS var). */
  color: string;
  size?: number;
  /** Pulsing outer ring used for "live agent" indicators. */
  ring?: boolean;
  ringColor?: string;
  className?: string;
};

export function StatusDot({ color, size = 8, ring = false, ringColor, className }: StatusDotProps) {
  const ringHex = ringColor || color;
  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: ring ? `0 0 0 4px ${ringHex}33` : 'none',
        flexShrink: 0,
      }}
    />
  );
}
