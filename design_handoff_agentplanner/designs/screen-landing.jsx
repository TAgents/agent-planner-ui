// Landing — bold typographic hero with BDI loop animation as concentric arcs.

function Landing({ theme = 'dark' }) {
  const t = useT(theme);
  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* Background dot grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
          <defs>
            <pattern id={`dot-${theme}`} width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill={t.border} />
            </pattern>
            <radialGradient id={`mask-${theme}`} cx="50%" cy="35%" r="55%">
              <stop offset="0%" stopColor="black" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <mask id={`m-${theme}`}>
              <rect width="100%" height="100%" fill={`url(#mask-${theme})`} />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill={`url(#dot-${theme})`} mask={`url(#m-${theme})`} />
        </svg>

        {/* Amber glow */}
        <div style={{
          position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 400, borderRadius: '50%',
          background: `radial-gradient(ellipse, ${t.amberSoft}, transparent 60%)`,
          pointerEvents: 'none',
        }} />

        {/* Top nav */}
        <div style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 36px', borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7, background: t.amber, color: t.bg,
              fontFamily: fontDisplay, fontWeight: 700, fontSize: 16, letterSpacing: '-0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>ap</div>
            <Display style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>AgentPlanner</Display>
            <Pill theme={theme} color="amber" style={{ marginLeft: 6 }}>Alpha</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 12, color: t.textSec }}>
            <span>Docs</span>
            <span>Explore</span>
            <span>API</span>
            <button style={{
              padding: '7px 16px', background: t.amber, color: t.bg, border: 'none', borderRadius: 8,
              fontWeight: 600, fontSize: 12, fontFamily: fontBody,
            }}>Get started →</button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ position: 'relative', padding: '70px 36px 30px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <Mono style={{ fontSize: 10, color: t.amber, letterSpacing: '0.22em', display: 'block', marginBottom: 16 }}>
              ◆ AI-FIRST AGENT COORDINATION
            </Mono>
            <Display style={{ fontSize: 64, fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.04em', display: 'block' }}>
              Plans your agents
              <br />
              actually <span style={{ color: t.amber, fontStyle: 'italic' }}>remember.</span>
            </Display>
            <p style={{ fontSize: 16, color: t.textSec, lineHeight: 1.6, marginTop: 22, maxWidth: 460 }}>
              Hierarchical plans, explicit beliefs and intentions, and a temporal knowledge graph your agents share across sessions, tools, and teammates.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 28 }}>
              <button style={{
                padding: '12px 22px', background: t.amber, color: t.bg, border: 'none', borderRadius: 10,
                fontWeight: 600, fontSize: 13.5, fontFamily: fontBody,
              }}>Get started →</button>
              <button style={{
                padding: '12px 22px', background: 'transparent', color: t.text, border: `1px solid ${t.border}`, borderRadius: 10,
                fontWeight: 500, fontSize: 13.5, fontFamily: fontBody,
              }}>$ install mcp</button>
            </div>
            <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 10.5, color: t.textMuted }}>Connects to</span>
              {['Claude Desktop', 'Claude Code', 'Cursor', 'Windsurf'].map((p) => (
                <Mono key={p} style={{ fontSize: 10.5, color: t.textSec }}>{p}</Mono>
              ))}
            </div>
          </div>

          {/* BDI loop visual */}
          <BDILoop theme={theme} />
        </div>

        {/* 3-column feature row */}
        <div style={{ position: 'relative', padding: '20px 36px 28px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { glyph: 'B', name: 'Beliefs', color: t.violet, t: 'Temporal knowledge graph', sub: 'Facts with valid_from/valid_to. Stale beliefs flagged. Contradictions surfaced.' },
            { glyph: 'D', name: 'Desires', color: t.amber, t: 'Goals with structure', sub: 'Outcomes, metrics, constraints, principles. Quality-scored against BDI rubric.' },
            { glyph: 'I', name: 'Intentions', color: t.emerald, t: 'Plans agents commit to', sub: 'Hierarchical task trees, dependency graph, decision handoffs to humans.' },
          ].map((f) => (
            <div key={f.name} style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, padding: 18, position: 'relative', overflow: 'hidden' }}>
              <span style={{
                position: 'absolute', top: -10, right: -10,
                fontFamily: fontDisplay, fontWeight: 700, fontSize: 90, color: f.color, opacity: 0.08,
                letterSpacing: '-0.06em', lineHeight: 1,
              }}>{f.glyph}</span>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: f.color, color: t.bg,
                fontFamily: fontDisplay, fontWeight: 700, fontSize: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>{f.glyph}</div>
              <Mono style={{ fontSize: 9.5, color: f.color, letterSpacing: '0.2em' }}>{f.name.toUpperCase()}</Mono>
              <Display style={{ fontSize: 17, fontWeight: 600, marginTop: 4, display: 'block' }}>{f.t}</Display>
              <p style={{ fontSize: 11.5, color: t.textSec, lineHeight: 1.55, marginTop: 6 }}>{f.sub}</p>
            </div>
          ))}
        </div>

        {/* Install band — second hero, drives users into a working install */}
        <InstallBand theme={theme} />
      </div>
    </ArtboardFrame>
  );
}

function InstallBand({ theme }) {
  const t = useT(theme);
  const clients = [
    { glyph: 'CD', name: 'Claude Desktop', sub: 'One-click .mcpb', recommended: true },
    { glyph: 'CC', name: 'Claude Code', sub: 'One npx command' },
    { glyph: 'OC', name: 'OpenClaw', sub: 'One skill add' },
    { glyph: 'C',  name: 'Cursor / VS Code', sub: 'One JSON snippet' },
    { glyph: 'GPT', name: 'ChatGPT', sub: 'HTTP MCP' },
  ];

  return (
    <div style={{
      position: 'relative',
      borderTop: `1px solid ${t.border}`,
      background: theme === 'dark' ? `linear-gradient(180deg, ${t.bg} 0%, ${t.surface} 100%)` : t.surfaceHi,
    }}>
      <div style={{ padding: '32px 36px 28px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28, alignItems: 'center' }}>
        {/* Left: pitch + primary CTA */}
        <div>
          <Mono style={{ fontSize: 10, color: t.amber, letterSpacing: '0.22em', display: 'block', marginBottom: 10 }}>
            ◆ 60-second install
          </Mono>
          <Display style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', display: 'block' }}>
            Install in Claude Desktop.
            <br />
            <span style={{ color: t.textSec }}>No terminal required.</span>
          </Display>
          <p style={{ fontSize: 13, color: t.textSec, lineHeight: 1.6, marginTop: 12, maxWidth: 380 }}>
            Download the extension, paste your token, see your briefing. Other clients in the strip below.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <button style={{
              padding: '12px 20px', background: t.amber, color: t.bg, border: 'none', borderRadius: 9,
              fontWeight: 600, fontSize: 13, fontFamily: fontBody,
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 13 }}>↓</span> Install in Claude Desktop
            </button>
            <span style={{ fontSize: 11.5, color: t.textMuted, cursor: 'pointer' }}>
              Or sign up first →
            </span>
          </div>
        </div>

        {/* Right: works-with strip */}
        <div>
          <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 10, display: 'block' }}>
            Works with the agents you already use
          </Mono>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {clients.map((c) => (
              <div key={c.name} style={{
                position: 'relative',
                background: t.surface, border: `1px solid ${c.recommended ? t.amber : t.border}`,
                borderRadius: 9, padding: '12px 10px',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
                cursor: 'pointer',
              }}>
                {c.recommended && (
                  <span style={{
                    position: 'absolute', top: -7, right: 8,
                    padding: '1.5px 7px', borderRadius: 999,
                    background: t.amber, color: t.bg,
                    fontFamily: fontMono, fontSize: 8, fontWeight: 700,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>
                    Easiest
                  </span>
                )}
                <div style={{
                  width: 26, height: 26, borderRadius: 6,
                  background: c.recommended ? t.amber : t.surfaceHi,
                  color: c.recommended ? t.bg : t.text,
                  border: c.recommended ? 'none' : `1px solid ${t.border}`,
                  fontFamily: fontDisplay, fontSize: 11, fontWeight: 700, letterSpacing: '-0.04em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{c.glyph}</div>
                <div>
                  <Display style={{ fontSize: 11.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
                    {c.name}
                  </Display>
                  <div style={{ fontSize: 10, color: t.textMuted, marginTop: 1 }}>{c.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BDILoop({ theme }) {
  const t = useT(theme);
  const cx = 200, cy = 200;
  function polar(r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const arcPath = (r, a1, a2) => {
    const p1 = polar(r, a1), p2 = polar(r, a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  };
  return (
    <div style={{ position: 'relative', height: 380 }}>
      <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }}>
        {/* Faint outer ring */}
        <circle cx={cx} cy={cy} r="170" fill="none" stroke={t.border} strokeDasharray="2 6" />

        {/* Three thick arcs - B, D, I */}
        <path d={arcPath(140, 20, 130)} stroke={t.violet} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={arcPath(140, 140, 250)} stroke={t.amber} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d={arcPath(140, 260, 370)} stroke={t.emerald} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Inner arcs */}
        <path d={arcPath(105, 30, 120)} stroke={t.violet} strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <path d={arcPath(105, 150, 240)} stroke={t.amber} strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
        <path d={arcPath(105, 270, 360)} stroke={t.emerald} strokeWidth="1.5" strokeOpacity="0.5" fill="none" />

        {/* Labels */}
        <g>
          {[
            { p: polar(180, 75), c: t.violet, l: 'BELIEFS' },
            { p: polar(180, 195), c: t.amber, l: 'DESIRES' },
            { p: polar(180, 315), c: t.emerald, l: 'INTENTIONS' },
          ].map((x) => (
            <text key={x.l} x={x.p.x} y={x.p.y} textAnchor="middle" style={{ fontFamily: fontMono, fontSize: 10, fill: x.c, letterSpacing: '0.22em', fontWeight: 600 }}>
              {x.l}
            </text>
          ))}
        </g>

        {/* Connection nodes */}
        {[75, 195, 315].map((d, i) => {
          const colors = [t.violet, t.amber, t.emerald];
          const p = polar(140, d);
          return (
            <g key={d}>
              <circle cx={p.x} cy={p.y} r="9" fill={t.bg} stroke={colors[i]} strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="3" fill={colors[i]} />
            </g>
          );
        })}

        {/* Center core */}
        <circle cx={cx} cy={cy} r="44" fill={t.bg} stroke={t.amber} strokeWidth="1.5" />
        <text x={cx} y={cy - 4} textAnchor="middle" style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, fill: t.text, letterSpacing: '-0.03em' }}>
          plan
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontFamily: fontMono, fontSize: 8.5, fill: t.textMuted, letterSpacing: '0.22em' }}>
          LOOP
        </text>

        {/* Subtle radii from center to ring nodes */}
        {[75, 195, 315].map((d) => {
          const p = polar(140, d);
          const inner = polar(44, d);
          return <line key={d} x1={inner.x} y1={inner.y} x2={p.x} y2={p.y} stroke={t.border} strokeWidth="1" />;
        })}
      </svg>

      {/* Floating fact pills */}
      <div style={{ position: 'absolute', top: 14, left: 0, fontSize: 10, color: t.textMuted, fontFamily: fontMono, opacity: 0.7 }}>
        ◆ 2,431 facts
      </div>
      <div style={{ position: 'absolute', top: 30, right: 0, fontSize: 10, color: t.textMuted, fontFamily: fontMono, opacity: 0.7 }}>
        ◆ 47 plans live
      </div>
      <div style={{ position: 'absolute', bottom: 24, left: 30, fontSize: 10, color: t.textMuted, fontFamily: fontMono, opacity: 0.7 }}>
        ◆ 12 agents working
      </div>
    </div>
  );
}

window.Landing = Landing;
