import React from 'react';

/**
 * The signature element of the landing page: the product's ontology rendered
 * as an actual working drawing — "FIG. 01" on a drafting sheet. A Blueprint
 * (dashed = not yet live) forks into a live Workspace (solid ink) holding a
 * Goal, a Plan with phases, agents on duty and a queued human decision; a
 * dashed return path closes the loop ("save as blueprint"). A real
 * engineering title block sits at the bottom.
 *
 * Pure inline SVG on token colors, so it flips to a true cyanotype in dark
 * mode. On load the sheet draws itself in one orchestrated sequence
 * (bp-draw / bp-ink / bp-stamp in index.css); prefers-reduced-motion renders
 * it fully drawn.
 */
const OntologyDiagram: React.FC = () => {
  const phases: Array<{ label: string; pct: number; agent?: boolean }> = [
    { label: 'Strategy', pct: 100 },
    { label: 'Pricing', pct: 100 },
    { label: 'Launch assets', pct: 62, agent: true },
    { label: 'Distribution', pct: 18 },
  ];

  const trackX = 388;
  const trackW = 82;

  return (
    <div className="bp-grid relative overflow-hidden rounded-lg border border-border-hi bg-surface shadow-[0_16px_48px_-24px_rgb(var(--text)/0.35)]">
      <svg
        viewBox="0 0 560 500"
        className="block h-auto w-full"
        role="img"
        aria-label="Figure 1: a reusable Blueprint forks into a live Workspace containing a goal, a plan with phases, and agents; the workspace can be saved back as a blueprint."
      >
        {/* registration crosshairs */}
        <g className="bp-ink stroke-text/40" strokeWidth="1">
          {[
            [20, 20],
            [540, 20],
            [20, 480],
            [540, 480],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <line x1={x - 6} y1={y} x2={x + 6} y2={y} />
              <line x1={x} y1={y - 6} x2={x} y2={y + 6} />
            </g>
          ))}
        </g>

        {/* ── Blueprint stack (dashed = reusable, not live) ── */}
        <g className="bp-ink bp-d1">
          <text x="28" y="54" className="fill-violet font-mono text-[10px] font-semibold" style={{ letterSpacing: '0.16em' }}>
            BLUEPRINT
          </text>
          <text x="28" y="68" className="fill-text-muted font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            REUSABLE MODEL
          </text>
          {/* stacked copies, back to front */}
          <rect x="40" y="96" width="120" height="88" rx="4" className="fill-none stroke-violet/30" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="34" y="90" width="120" height="88" rx="4" className="fill-surface/80 stroke-violet/50" strokeWidth="1" strokeDasharray="4 4" />
          <rect x="28" y="84" width="120" height="88" rx="4" className="fill-surface stroke-violet" strokeWidth="1.25" strokeDasharray="5 4" />
          {/* line work inside the front sheet */}
          <rect x="40" y="96" width="56" height="6" rx="1" className="fill-violet/50" />
          <g className="stroke-text/25" strokeWidth="2" strokeLinecap="round">
            <line x1="40" y1="116" x2="128" y2="116" />
            <line x1="40" y1="128" x2="112" y2="128" />
            <line x1="40" y1="140" x2="124" y2="140" />
            <line x1="40" y1="152" x2="100" y2="152" />
          </g>
        </g>

        {/* ── fork arrow ── */}
        <g className="bp-ink bp-d2">
          <text x="164" y="118" className="fill-amber font-mono text-[8px] font-semibold" style={{ letterSpacing: '0.18em' }}>
            FORK
          </text>
          <line x1="156" y1="128" x2="222" y2="128" className="stroke-amber" strokeWidth="1.25" strokeDasharray="5 4" />
          <path d="M 222 123.5 L 231 128 L 222 132.5 Z" className="fill-amber" />
        </g>

        {/* ── Workspace (solid ink = live) — draws its own outline ── */}
        <rect
          x="236"
          y="44"
          width="296"
          height="330"
          rx="6"
          pathLength={100}
          className="bp-draw bp-d2 fill-amber/[0.04] stroke-amber"
          strokeWidth="1.5"
        />

        {/* workspace header */}
        <g className="bp-ink bp-d3">
          <text x="252" y="72" className="fill-amber font-mono text-[9px] font-semibold" style={{ letterSpacing: '0.18em' }}>
            WORKSPACE
          </text>
          <circle cx="490" cy="68" r="3.5" className="bp-pulse fill-amber" />
          <text x="500" y="71" className="fill-amber font-mono text-[8px] font-semibold" style={{ letterSpacing: '0.14em' }}>
            LIVE
          </text>
          <text x="252" y="93" className="fill-text font-display text-[17px] font-semibold" style={{ letterSpacing: '0.01em' }}>
            Growth Engine
          </text>
          <text x="252" y="107" className="fill-text-muted font-mono text-[8px]" style={{ letterSpacing: '0.08em' }}>
            FORKED FROM — PRODUCT LAUNCH V3
          </text>

          {/* goal bar */}
          <rect x="252" y="118" width="264" height="30" rx="4" className="fill-emerald/[0.14] stroke-emerald/40" strokeWidth="1" />
          <text x="262" y="137" className="fill-emerald font-mono text-[8px] font-bold" style={{ letterSpacing: '0.14em' }}>
            GOAL
          </text>
          <text x="298" y="137.5" className="fill-text font-body text-[11px] font-medium">
            Ship publicly
          </text>
          <text x="506" y="137" textAnchor="end" className="fill-emerald font-mono text-[10px] font-medium">
            68%
          </text>
        </g>

        {/* plan block */}
        <g className="bp-ink bp-d4">
          <rect x="252" y="160" width="264" height="150" rx="4" className="fill-surface stroke-border-hi" strokeWidth="1" />
          <text x="262" y="181" className="fill-text-sec font-mono text-[8.5px] font-semibold" style={{ letterSpacing: '0.12em' }}>
            PLAN — LAUNCH PLAN
          </text>
          <text x="506" y="181" textAnchor="end" className="fill-text-muted font-mono text-[8px]" style={{ letterSpacing: '0.08em' }}>
            4 PHASES
          </text>
          {phases.map((p, i) => {
            const y = 205 + i * 26;
            return (
              <g key={p.label}>
                <text x="262" y={y} className="fill-text font-body text-[10.5px]">
                  {p.label}
                </text>
                {p.agent && <circle cx="374" cy={y - 3.5} r="3" className="bp-pulse fill-emerald" />}
                <rect x={trackX} y={y - 7} width={trackW} height="4" rx="2" className="fill-surface-hi" />
                <rect x={trackX} y={y - 7} width={(p.pct / 100) * trackW} height="4" rx="2" className="fill-amber" />
                <text x="506" y={y - 1} textAnchor="end" className="fill-text-muted font-mono text-[8.5px]">
                  {p.pct}%
                </text>
              </g>
            );
          })}
        </g>

        {/* agents + decision queue */}
        <g className="bp-ink bp-d5">
          <circle cx="257" cy="330" r="3" className="bp-pulse fill-emerald" />
          <text x="267" y="333" className="fill-text-sec font-mono text-[8.5px]" style={{ letterSpacing: '0.1em' }}>
            2 AGENTS ON DUTY — PLANNER, REVIEWER
          </text>
          <circle cx="257" cy="348" r="3" className="fill-red" />
          <text x="267" y="351" className="fill-text-sec font-mono text-[8.5px]" style={{ letterSpacing: '0.1em' }}>
            1 DECISION QUEUED FOR A HUMAN
          </text>
        </g>

        {/* return path: save the live workspace back as a blueprint */}
        <g className="bp-ink bp-d5">
          <path
            d="M 320 374 L 320 402 L 88 402 L 88 196"
            className="fill-none stroke-text-muted"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path d="M 83.5 198 L 88 189 L 92.5 198 Z" className="fill-text-muted" />
          <text x="140" y="396" className="fill-text-muted font-mono text-[8px]" style={{ letterSpacing: '0.16em' }}>
            SAVE AS BLUEPRINT
          </text>
        </g>

        {/* ── title block ── */}
        <g className="bp-stamp bp-d5">
          <rect x="16" y="430" width="528" height="54" className="fill-surface stroke-text/50" strokeWidth="1" />
          <line x1="16" y1="457" x2="544" y2="457" className="stroke-text/30" strokeWidth="1" />
          <line x1="310" y1="430" x2="310" y2="484" className="stroke-text/30" strokeWidth="1" />
          <line x1="424" y1="430" x2="424" y2="484" className="stroke-text/30" strokeWidth="1" />

          <text x="24" y="447" className="fill-text font-mono text-[9px] font-semibold" style={{ letterSpacing: '0.08em' }}>
            FIG. 01 — BLUEPRINT → LIVE WORKSPACE
          </text>
          <text x="318" y="447" className="fill-text-sec font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            SCALE — 1:1
          </text>
          <text x="432" y="447" className="fill-text-sec font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            REV — 2026.05
          </text>
          <text x="24" y="474" className="fill-text-sec font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            DRAWN BY — HUMANS + AGENTS
          </text>
          <text x="318" y="474" className="fill-text-sec font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            AGENTPLANNER
          </text>
          <text x="432" y="474" className="fill-text-sec font-mono text-[8px]" style={{ letterSpacing: '0.1em' }}>
            SHEET — 01 / 01
          </text>
        </g>
      </svg>
    </div>
  );
};

export default OntologyDiagram;
