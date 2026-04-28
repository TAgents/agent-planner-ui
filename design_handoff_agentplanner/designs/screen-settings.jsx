// Settings — account, agents, integrations, tokens
// Bold treatment: a left-rail of settings sections with a "connected agents" hero,
// then API tokens, MCP setup, and org switcher.

function Settings({ theme = 'dark' }) {
  const t = useT(theme);

  const sections = [
    { id: 'profile', label: 'Profile', desc: 'Personal info' },
    { id: 'org', label: 'Organization', desc: 'Acme Robotics', active: true },
    { id: 'agents', label: 'Agents & integrations', desc: '4 connected' },
    { id: 'tokens', label: 'API tokens', desc: '3 active' },
    { id: 'notifications', label: 'Notifications', desc: 'Email · Slack' },
    { id: 'billing', label: 'Billing', desc: 'Team plan · $99/mo' },
    { id: 'danger', label: 'Danger zone', desc: '' },
  ];

  const agents = [
    { id: 1, name: 'Claude (MCP) — laptop', via: 'mcp', status: 'live', last: '2m ago', plans: 7, color: t.amber },
    { id: 2, name: 'researcher-β — pgvector audit', via: 'rest', status: 'live', last: 'just now', plans: 1, color: t.violet },
    { id: 3, name: 'planner-α — Atlas release', via: 'rest', status: 'idle', last: '4h ago', plans: 3, color: t.emerald },
    { id: 4, name: 'ChatGPT (MCP)', via: 'mcp', status: 'idle', last: 'yesterday', plans: 2, color: t.amber },
  ];

  const tokens = [
    { name: 'Claude Desktop — Marcus', perms: ['admin'], created: 'Aug 12', used: '2m ago' },
    { name: 'CI/CD — GitHub Actions', perms: ['read', 'write'], created: 'Jul 03', used: '3h ago' },
    { name: 'Read-only dashboard', perms: ['read'], created: 'Jun 21', used: '8d ago' },
  ];

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <AppShell theme={theme} active="mission">
        <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>

          {/* Left rail */}
          <div style={{
            width: 240, borderRight: `1px solid ${t.border}`, background: t.surface,
            padding: '24px 0', flexShrink: 0,
          }}>
            <div style={{ padding: '0 20px 16px' }}>
              <Mono style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4, display: 'block' }}>
                ◇ Settings
              </Mono>
              <div style={{ fontFamily: fontDisplay, fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Acme Robotics</div>
              <div style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>Marcus Sutton · Owner</div>
            </div>

            <div style={{ padding: '0 8px' }}>
              {sections.map((s) => {
                const isActive = s.active;
                return (
                  <div key={s.id} style={{
                    padding: '10px 12px', borderRadius: 7, marginBottom: 2, cursor: 'pointer',
                    background: isActive ? t.surfaceHi : 'transparent',
                    borderLeft: isActive ? `2px solid ${t.amber}` : `2px solid transparent`,
                  }}>
                    <div style={{ fontFamily: fontDisplay, fontSize: 13, fontWeight: 600, color: isActive ? t.text : t.textSec, letterSpacing: '-0.01em' }}>
                      {s.label}
                    </div>
                    {s.desc && <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>{s.desc}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main */}
          <div style={{ flex: 1, overflow: 'auto', padding: '28px 36px 40px' }}>
            <div style={{ maxWidth: 760 }}>

              {/* Header */}
              <div style={{ marginBottom: 22 }}>
                <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4, display: 'block' }}>
                  Organization
                </Mono>
                <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  Acme Robotics
                </div>
                <div style={{ fontSize: 12, color: t.textSec, marginTop: 4 }}>
                  3 members · 4 agents · 7 plans · created July 2024
                </div>
              </div>

              {/* Connected agents — hero */}
              <SectionHead theme={theme} kicker="◆ Agents & integrations" title="Connected agents"
                right={<button style={{ padding: '5px 11px', borderRadius: 6, background: t.text, color: t.bg, border: 'none', cursor: 'pointer', fontFamily: fontDisplay, fontSize: 11, fontWeight: 600 }}>+ Connect</button>}
              />
              <Card theme={theme} pad={0} style={{ overflow: 'hidden', marginBottom: 24 }}>
                {agents.map((a, i) => (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    borderBottom: i < agents.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: a.color + '22', color: a.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: fontDisplay, fontSize: 15, fontWeight: 700, letterSpacing: '-0.04em',
                      flexShrink: 0,
                    }}>
                      {a.via === 'mcp' ? 'M' : 'R'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 13.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
                        {a.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3, fontSize: 11, color: t.textMuted }}>
                        <Mono style={{ fontSize: 9.5, padding: '1px 5px', borderRadius: 3, background: t.surfaceHi, color: t.textSec, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          {a.via}
                        </Mono>
                        <span>active on {a.plans} plan{a.plans > 1 ? 's' : ''}</span>
                        <span style={{ color: t.borderHi }}>·</span>
                        <span>last seen {a.last}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: a.status === 'live' ? t.emerald : t.textMuted,
                        animation: a.status === 'live' ? 'pulse 2s infinite' : 'none',
                      }} />
                      <Mono style={{ fontSize: 10, color: a.status === 'live' ? t.emerald : t.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {a.status}
                      </Mono>
                    </div>
                  </div>
                ))}
              </Card>

              {/* MCP quick setup */}
              <SectionHead theme={theme} kicker="◆ Quick setup" title="Configure your MCP client" />
              <Card theme={theme} pad={16} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  {['Claude Desktop', 'Claude Code', 'ChatGPT', 'Cursor', 'Windsurf'].map((c, i) => (
                    <div key={i} style={{
                      padding: '5px 11px', borderRadius: 5,
                      background: i === 0 ? t.text : 'transparent',
                      color: i === 0 ? t.bg : t.textSec,
                      border: i === 0 ? 'none' : `1px solid ${t.border}`,
                      fontFamily: fontBody, fontSize: 11, fontWeight: 600,
                      cursor: 'pointer',
                    }}>{c}</div>
                  ))}
                </div>
                <div style={{
                  background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
                  padding: '12px 14px',
                  fontFamily: fontMono, fontSize: 11, color: t.textSec, lineHeight: 1.6,
                  position: 'relative',
                }}>
                  <span style={{ color: t.textMuted }}>{`// ~/Library/Application Support/Claude/config.json`}</span><br/>
                  <span style={{ color: t.text }}>{`{`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 14 }}>{`"mcpServers": {`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 28 }}>{`"agentplanner": {`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 42 }}>{`"command": "npx",`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 42 }}>{`"args": ["@agentplanner/mcp"],`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 42 }}>{`"env": { "API_KEY": "`}<span style={{ color: t.amber }}>ap_••••••••</span>{`" }`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 28 }}>{`}`}</span><br/>
                  <span style={{ color: t.text, paddingLeft: 14 }}>{`}`}</span><br/>
                  <span style={{ color: t.text }}>{`}`}</span>
                  <button style={{
                    position: 'absolute', top: 12, right: 12,
                    padding: '3px 8px', borderRadius: 4,
                    background: t.surface, border: `1px solid ${t.border}`,
                    color: t.textSec, fontFamily: fontMono, fontSize: 10, cursor: 'pointer',
                  }}>Copy</button>
                </div>
              </Card>

              {/* API tokens */}
              <SectionHead theme={theme} kicker="◆ API tokens" title="Programmatic access"
                right={<button style={{ padding: '5px 11px', borderRadius: 6, background: 'transparent', color: t.textSec, border: `1px solid ${t.border}`, cursor: 'pointer', fontFamily: fontDisplay, fontSize: 11, fontWeight: 600 }}>+ New token</button>}
              />
              <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                {tokens.map((tk, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: i < tokens.length - 1 ? `1px solid ${t.border}` : 'none',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 5,
                      background: t.surfaceHi, color: t.textMuted,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, flexShrink: 0,
                    }}>⚿</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: fontDisplay, fontSize: 12.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em' }}>
                        {tk.name}
                      </div>
                      <Mono style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
                        created {tk.created} · last used {tk.used}
                      </Mono>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {tk.perms.map((p) => {
                        const c = p === 'admin' ? t.red : p === 'write' ? t.amber : t.emerald;
                        return (
                          <span key={p} style={{
                            padding: '2px 7px', borderRadius: 3,
                            background: c + '22', color: c,
                            fontFamily: fontMono, fontSize: 9, fontWeight: 600,
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                          }}>{p}</span>
                        );
                      })}
                    </div>
                    <span style={{ color: t.textMuted, fontSize: 14, cursor: 'pointer' }}>⋯</span>
                  </div>
                ))}
              </Card>

            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

Object.assign(window, { Settings });
