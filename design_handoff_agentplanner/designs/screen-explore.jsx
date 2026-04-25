// Explore — community-published plans browse surface.
// Bold treatment: editorial layout — a featured "plan of the week", then a faceted
// list grouped by category, with author + recency + plan-shape thumbnail.

function Explore({ theme = 'dark' }) {
  const t = useT(theme);

  const featured = {
    title: 'Shipping a research preview in 6 weeks',
    author: 'Anthropic · Sarah K.',
    desc: 'How a small team plans a ship: hypothesis → constraints → milestones, with reasoning logs from the planning agent we used.',
    forks: 142, stars: 1130, nodes: 38, beliefs: 211, updated: '2d ago',
  };

  const categories = [
    { id: 'all', label: 'All', n: 312, active: true },
    { id: 'shipping', label: 'Shipping & ops', n: 87 },
    { id: 'research', label: 'Research', n: 64 },
    { id: 'go-to-market', label: 'Go-to-market', n: 41 },
    { id: 'agentic', label: 'Agentic workflows', n: 78 },
    { id: 'personal', label: 'Personal', n: 42 },
  ];

  const plans = [
    { author: 'OpenAI Cookbook', title: 'Multi-agent code review with shared beliefs', cat: 'agentic', shape: [4,3,5,4,2,3,4,5,3,4], stars: 824, forks: 87, updated: '4d ago' },
    { author: 'Linear · Eng', title: 'Quarterly planning, agent-augmented', cat: 'shipping', shape: [3,4,5,5,4,3,2,3,4,5], stars: 612, forks: 64, updated: '1w ago' },
    { author: 'Vercel · DevRel', title: 'GTM rollout for AI SDK 4.0', cat: 'go-to-market', shape: [2,3,3,4,5,5,4,3,2,3], stars: 488, forks: 51, updated: '3d ago' },
    { author: 'Andrej @ solo', title: 'Build a small video model — research log', cat: 'research', shape: [1,2,2,3,3,4,3,2,3,2], stars: 2104, forks: 312, updated: 'today' },
    { author: 'Replit · Agents', title: 'Coordinating 3 agents on a refactor', cat: 'agentic', shape: [4,5,3,4,5,4,3,4,5,3], stars: 391, forks: 44, updated: '5d ago' },
    { author: 'Stripe · Atlas', title: 'Incorporation → first revenue (template)', cat: 'shipping', shape: [2,3,3,3,4,4,4,5,4,3], stars: 273, forks: 198, updated: '2w ago' },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', overflow: 'auto', background: t.bg }}>

        {/* Top bar */}
        <div style={{
          padding: '14px 36px',
          display: 'flex', alignItems: 'center', gap: 14,
          borderBottom: `1px solid ${t.border}`,
          background: t.surface,
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: t.amber, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontDisplay, fontSize: 14, fontWeight: 700, letterSpacing: '-0.04em' }}>◆</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 700, letterSpacing: '-0.02em' }}>AgentPlanner</div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {['Mission', 'Plans', 'Knowledge', 'Explore'].map((l, i) => (
              <div key={i} style={{
                padding: '5px 10px', borderRadius: 5,
                fontSize: 12, color: l === 'Explore' ? t.text : t.textMuted, fontWeight: l === 'Explore' ? 600 : 500,
                background: l === 'Explore' ? t.surfaceHi : 'transparent',
                cursor: 'pointer', fontFamily: fontDisplay, letterSpacing: '-0.01em',
              }}>{l}</div>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 7,
            border: `1px solid ${t.border}`, background: t.bg, width: 280,
          }}>
            <span style={{ color: t.textMuted, fontSize: 12 }}>⌕</span>
            <span style={{ color: t.textMuted, fontSize: 12, fontFamily: fontBody }}>Search 312 published plans…</span>
          </div>
        </div>

        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 32px 48px' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 6, display: 'block' }}>
              ◇ Explore
            </Mono>
            <div style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 700, letterSpacing: '-0.035em', textWrap: 'balance', marginBottom: 4 }}>
              How others <span style={{ color: t.amber }}>plan with their agents</span>
            </div>
            <div style={{ fontSize: 13, color: t.textSec }}>312 plans published this month. Fork any to your workspace.</div>
          </div>

          {/* Featured */}
          <Card theme={theme} pad={0} style={{ overflow: 'hidden', marginBottom: 28, background: t.surface, border: `1px solid ${t.border}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 220 }}>
              {/* Plan-shape visual */}
              <div style={{
                position: 'relative',
                background: `linear-gradient(135deg, ${t.surfaceHi}, ${t.surface})`,
                borderRight: `1px solid ${t.border}`,
                padding: 28,
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                overflow: 'hidden',
              }}>
                <Mono style={{ fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.amber, fontWeight: 700 }}>
                  ◆ Plan of the week
                </Mono>
                {/* big shape */}
                <PlanShape theme={theme} shape={[3,5,4,6,7,5,4,6,5,7,6,4]} h={90} />
                <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.06em' }}>
                  38 nodes · 211 beliefs · 4 agents
                </Mono>
              </div>
              {/* Body */}
              <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
                <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.1em', marginBottom: 8 }}>{featured.author}</Mono>
                <div style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, color: t.text, marginBottom: 10, textWrap: 'balance' }}>
                  {featured.title}
                </div>
                <div style={{ fontSize: 13, color: t.textSec, lineHeight: 1.55, marginBottom: 18 }}>
                  {featured.desc}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: t.textMuted, marginBottom: 16 }}>
                  <span><span style={{ color: t.text, fontWeight: 600, fontFamily: fontMono }}>{featured.stars}</span> stars</span>
                  <span><span style={{ color: t.text, fontWeight: 600, fontFamily: fontMono }}>{featured.forks}</span> forks</span>
                  <span style={{ color: t.borderHi }}>·</span>
                  <span>updated {featured.updated}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <button style={{ padding: '8px 14px', borderRadius: 7, background: t.text, color: t.bg, border: 'none', cursor: 'pointer', fontFamily: fontDisplay, fontSize: 12, fontWeight: 600 }}>
                    Open plan →
                  </button>
                  <button style={{ padding: '8px 14px', borderRadius: 7, background: 'transparent', color: t.textSec, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: fontDisplay, fontSize: 12, fontWeight: 600 }}>
                    Fork to workspace
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button key={c.id} style={{
                padding: '5px 11px', borderRadius: 6,
                border: 'none', cursor: 'pointer',
                background: c.active ? t.text : 'transparent',
                color: c.active ? t.bg : t.textSec,
                fontFamily: fontBody, fontSize: 11.5, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                {c.label}
                <span style={{ fontFamily: fontMono, fontSize: 9, opacity: 0.7 }}>{c.n}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <Mono style={{ fontSize: 10, color: t.textMuted }}>Sort: Trending ▾</Mono>
          </div>

          {/* Plan grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {plans.map((p, i) => (
              <Card key={i} theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                {/* header strip with shape */}
                <div style={{
                  background: t.surfaceHi,
                  padding: '10px 14px 8px',
                  borderBottom: `1px solid ${t.border}`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <PlanShape theme={theme} shape={p.shape} h={26} compact />
                  <Mono style={{ fontSize: 9, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 'auto' }}>
                    {p.cat.replace('-', ' ')}
                  </Mono>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                    {p.author}
                  </Mono>
                  <div style={{ fontFamily: fontDisplay, fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.25, color: t.text, marginBottom: 10, textWrap: 'balance' }}>
                    {p.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: t.textMuted }}>
                    <span><span style={{ color: t.text, fontFamily: fontMono, fontWeight: 600 }}>{p.stars}</span> ★</span>
                    <span><span style={{ color: t.text, fontFamily: fontMono, fontWeight: 600 }}>{p.forks}</span> forks</span>
                    <span style={{ color: t.borderHi }}>·</span>
                    <span>{p.updated}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Footer CTA */}
          <Card theme={theme} pad={20} style={{ marginTop: 28, textAlign: 'center', background: t.surface }}>
            <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 6, display: 'block' }}>◆ Share what you're building</Mono>
            <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Publish a plan to inspire other teams
            </div>
            <div style={{ fontSize: 12, color: t.textSec, marginBottom: 12 }}>
              Your beliefs and reasoning logs come along — readers see how decisions were actually made.
            </div>
            <button style={{ padding: '8px 16px', borderRadius: 7, background: t.amber, color: t.bg, border: 'none', cursor: 'pointer', fontFamily: fontDisplay, fontSize: 12.5, fontWeight: 700 }}>
              Publish a plan →
            </button>
          </Card>

        </div>
      </div>
    </ArtboardFrame>
  );
}

function PlanShape({ theme, shape, h, compact }) {
  const t = useT(theme);
  // A horizontal sparkline-of-bars expressing the plan's "shape" — branching density per column.
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: compact ? 2 : 3, height: h, flex: compact ? 1 : 'unset' }}>
      {shape.map((v, i) => (
        <div key={i} style={{
          width: compact ? 4 : 8,
          height: `${(v / 8) * 100}%`,
          background: i === Math.floor(shape.length / 2) ? t.amber : t.borderHi,
          borderRadius: 1,
        }} />
      ))}
    </div>
  );
}

Object.assign(window, { Explore });
