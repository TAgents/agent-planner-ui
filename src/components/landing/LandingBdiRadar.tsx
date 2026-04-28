import React from 'react';

/**
 * Decorative BDI radar for the landing hero — three concentric rings
 * (Intentions/Beliefs/Desires) with axis dots, faint marker lines, and
 * a "plan / LOOP" center. Pure SVG, theme-aware via CSS vars so it
 * reads in both light and dark mode without a JS toggle.
 */
const LandingBdiRadar: React.FC<{ className?: string }> = ({ className }) => {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const radii = [size / 2 - 30, size / 2 - 70, size / 2 - 110];
  const angles = [-90, 30, 150]; // Intentions (top), Beliefs (right), Desires (left)
  const labels = ['Intentions', 'Beliefs', 'Desires'];

  // Convert axis angle (degrees from 12 o'clock) → cartesian.
  const polar = (angleDeg: number, r: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label="BDI architecture: three concentric rings showing intentions, beliefs, and desires orbiting a plan loop"
    >
      {/* Concentric rings — Intentions outer, Desires inner */}
      <circle
        cx={cx}
        cy={cy}
        r={radii[0]}
        fill="none"
        stroke="rgb(var(--violet))"
        strokeOpacity={0.5}
        strokeWidth={1.4}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radii[1]}
        fill="none"
        stroke="rgb(var(--amber))"
        strokeOpacity={0.55}
        strokeWidth={1.4}
      />
      <circle
        cx={cx}
        cy={cy}
        r={radii[2]}
        fill="none"
        stroke="rgb(var(--emerald))"
        strokeOpacity={0.55}
        strokeWidth={1.4}
      />

      {/* Faint orbital glow on the bottom-right of the outermost ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radii[0]}
        fill="none"
        stroke="rgb(var(--violet))"
        strokeOpacity={0.15}
        strokeWidth={6}
      />

      {/* Axis dots — one per ring at its labeled angle */}
      {radii.map((r, i) => {
        const p = polar(angles[i], r);
        const colors = ['rgb(var(--violet))', 'rgb(var(--amber))', 'rgb(var(--emerald))'];
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={6} fill={colors[i]} />
            <circle cx={p.x} cy={p.y} r={11} fill="none" stroke={colors[i]} strokeOpacity={0.4} />
          </g>
        );
      })}

      {/* Axis labels (uppercase, mono) */}
      {radii.map((r, i) => {
        const labelOffset = 22;
        const p = polar(angles[i], r + labelOffset);
        const anchor = angles[i] === -90 ? 'middle' : angles[i] < 90 ? 'start' : 'end';
        return (
          <text
            key={`l-${i}`}
            x={p.x}
            y={p.y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontFamily="var(--font-mono, ui-monospace)"
            fontSize="10.5"
            letterSpacing="2.4"
            fill="rgb(var(--text-muted))"
            style={{ textTransform: 'uppercase' }}
          >
            {labels[i]}
          </text>
        );
      })}

      {/* Connecting threads from outer ring inward — implies the BDI loop */}
      <path
        d={`M ${polar(angles[0], radii[0]).x} ${polar(angles[0], radii[0]).y}
            L ${cx} ${cy}
            L ${polar(angles[1], radii[1]).x} ${polar(angles[1], radii[1]).y}
            L ${cx} ${cy}
            L ${polar(angles[2], radii[2]).x} ${polar(angles[2], radii[2]).y}`}
        fill="none"
        stroke="rgb(var(--text-muted))"
        strokeOpacity={0.2}
        strokeWidth={0.8}
        strokeDasharray="2 4"
      />

      {/* Center plate */}
      <circle cx={cx} cy={cy} r={48} fill="rgb(var(--bg))" stroke="rgb(var(--border))" strokeWidth={1.4} />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-display, system-ui)"
        fontSize="22"
        fontWeight="700"
        fill="rgb(var(--text))"
        letterSpacing="-0.02em"
      >
        plan
      </text>
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontFamily="var(--font-mono, ui-monospace)"
        fontSize="9"
        letterSpacing="3"
        fill="rgb(var(--text-muted))"
      >
        LOOP
      </text>
    </svg>
  );
};

export default LandingBdiRadar;
