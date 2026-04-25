// Settings → Integrations
// New canonical home for everything connection-related. Tabs across the top
// (Active connections + one tab per client). Active connections is hybrid:
// dense table by default with an inline detail-row for the selected token.
// Polling every 10s suggested via subtle live dots in real implementation.

function SettingsIntegrations({ theme = 'dark' }) {
  const t = useT(theme);

  // Sidebar — same as Settings, with "Integrations" active
  const sections = [
    { id: 'profile', label: 'Profile', desc: 'Personal info' },
    { id: 'org', label: 'Organization', desc: 'Acme Robotics' },
    { id: 'integrations', label: 'Integrations', desc: '4 connections', active: true },
    { id: 'tokens', label: 'API tokens', desc: '3 active' },
    { id: 'notifications', label: 'Notifications', desc: 'Email · Slack' },
    { id: 'billing', label: 'Billing', desc: 'Team plan · $99/mo' },
    { id: 'danger', label: 'Danger zone', desc: '' },
  ];

  const tabs = [
    { id: 'active', label: 'Active connections', count: 4, active: true },
    { id: 'claude-desktop', label: 'Claude Desktop', glyph: 'CD' },
    { id: 'claude-code', label: 'Claude Code', glyph: 'CC' },
    { id: 'cursor', label: 'Cursor', glyph: 'C' },
    { id: 'openclaw', label: 'OpenClaw', glyph: 'OC' },
    { id: 'chatgpt', label: 'ChatGPT', glyph: 'GPT' },
  ];

  const connections = [
    {
      name: 'default',
      status: 'live',
      lastSeen: '5 min ago',
      lastTool: 'briefing()',
      origin: 'Claude Desktop · macOS',
      ip: '73.92.22.108',
      calls7d: 142,
      perms: ['admin'],
      created: 'Aug 12',
      expanded: true,
    },
    { name: 'qa-agent-prod', status: 'live', lastSeen: '2 min ago', lastTool: 'queue_decision()', origin: 'OpenClaw VM · prod-1', ip: '10.0.4.12', calls7d: 487, perms: ['read', 'write'], created: 'Sep 03' },
    { name: 'cursor-marcus-laptop', status: 'idle', lastSeen: '4h ago', lastTool: 'list_plans()', origin: 'Cursor · macOS', ip: '73.92.22.108', calls7d: 28, perms: ['read', 'write'], created: 'Sep 10' },
    { name: 'ci-github-actions', status: 'idle', lastSeen: '2 days ago', lastTool: 'briefing()', origin: 'GitHub Actions runner', ip: '40.114.95.32', calls7d: 8, perms: ['read'], created: 'Jul 03' },
    { name: 'unused-token', status: 'never', lastSeen: 'never', lastTool: '—', origin: '—', ip: '—', calls7d: 0, perms: ['read'], created: 'Sep 18' },
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
            <div style={{ maxWidth: 940 }}>

              {/* Header */}
              <div style={{ marginBottom: 22 }}>
                <Mono style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.textMuted, marginBottom: 4, display: 'block' }}>
                  Integrations
                </Mono>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
                      Connected agents
                    </div>
                    <div style={{ fontSize: 12, color: t.textSec, marginTop: 4 }}>
                      4 connected · 1 idle · 1 token never used
                    </div>
                  </div>
                  <PrimaryButton theme={theme}>+ Connect a new agent</PrimaryButton>
                </div>
              </div>

              {/* Tabs */}
              <div style={{
                display: 'flex', gap: 0, marginBottom: 22,
                borderBottom: `1px solid ${t.border}`,
              }}>
                {tabs.map((tab) => {
                  const isActive = tab.active;
                  return (
                    <div key={tab.id} style={{
                      padding: '10px 16px', cursor: 'pointer',
                      borderBottom: isActive ? `2px solid ${t.amber}` : '2px solid transparent',
                      marginBottom: -1,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      {tab.glyph && (
                        <span style={{
                          width: 18, height: 18, borderRadius: 4,
                          background: isActive ? t.amber : t.surfaceHi,
                          color: isActive ? t.bg : t.textSec,
                          fontFamily: fontDisplay, fontSize: 9, fontWeight: 700, letterSpacing: '-0.04em',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {tab.glyph}
                        </span>
                      )}
                      <span style={{
                        fontFamily: fontDisplay, fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                        color: isActive ? t.text : t.textSec, letterSpacing: '-0.01em',
                      }}>
                        {tab.label}
                      </span>
                      {tab.count !== undefined && (
                        <Mono style={{
                          fontSize: 9.5, padding: '1px 6px', borderRadius: 999,
                          background: isActive ? t.amberSoft : t.surfaceHi,
                          color: isActive ? t.amber : t.textMuted,
                          letterSpacing: '0.04em',
                        }}>
                          {tab.count}
                        </Mono>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Live polling indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: t.emerald,
                    boxShadow: `0 0 0 4px ${t.emerald}22`,
                    animation: 'pulse 2s infinite',
                  }} />
                  <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    Live · refreshes every 10s
                  </Mono>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{
                    fontFamily: fontMono, fontSize: 10, color: t.textMuted,
                    padding: '4px 10px', borderRadius: 5,
                    background: t.surface, border: `1px solid ${t.border}`, cursor: 'pointer',
                  }}>
                    Filter: All
                  </span>
                  <span style={{
                    fontFamily: fontMono, fontSize: 10, color: t.textMuted,
                    padding: '4px 10px', borderRadius: 5,
                    background: t.surface, border: `1px solid ${t.border}`, cursor: 'pointer',
                  }}>
                    Sort: Last seen
                  </span>
                </div>
              </div>

              {/* Connections table */}
              <Card theme={theme} pad={0} style={{ overflow: 'hidden' }}>
                {/* Column headers */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.6fr 1.4fr 1.2fr 1.4fr 0.9fr 90px',
                  gap: 14, padding: '10px 18px',
                  borderBottom: `1px solid ${t.border}`,
                  background: t.surfaceHi,
                }}>
                  {['Token', 'Last call', 'Status', 'Origin', '7-day calls', ''].map((h, i) => (
                    <Mono key={i} style={{ fontSize: 9, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 600 }}>
                      {h}
                    </Mono>
                  ))}
                </div>

                {/* Rows */}
                {connections.map((c, i) => (
                  <ConnectionRow
                    key={c.name} theme={theme} c={c}
                    last={i === connections.length - 1}
                  />
                ))}
              </Card>

              <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.12em' }}>
                  Telemetry powered by tool_calls table · last 90 days
                </Mono>
                <span style={{
                  fontSize: 11, color: t.textSec, cursor: 'pointer',
                  textDecoration: 'underline', textUnderlineOffset: 3,
                }}>
                  Manage API tokens →
                </span>
              </div>

            </div>
          </div>
        </div>
      </AppShell>
    </ArtboardFrame>
  );
}

function ConnectionRow({ theme, c, last }) {
  const t = useT(theme);
  const statusColor = c.status === 'live' ? t.emerald : c.status === 'idle' ? t.textMuted : t.red;
  const statusLabel = c.status === 'live' ? 'Live' : c.status === 'idle' ? 'Idle' : 'Never used';

  return (
    <div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1.4fr 1.2fr 1.4fr 0.9fr 90px',
        gap: 14, padding: '14px 18px',
        borderBottom: c.expanded || !last ? `1px solid ${t.border}` : 'none',
        alignItems: 'center',
        background: c.expanded ? t.surfaceHi : 'transparent',
      }}>
        {/* Token name + perms */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mono style={{ fontSize: 12, color: t.text, fontWeight: 600 }}>
              {c.name}
            </Mono>
            {c.perms.map((p) => {
              const pc = p === 'admin' ? t.red : p === 'write' ? t.amber : t.emerald;
              return (
                <span key={p} style={{
                  padding: '1px 5px', borderRadius: 3,
                  background: pc + '22', color: pc,
                  fontFamily: fontMono, fontSize: 8.5, fontWeight: 600,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>{p}</span>
              );
            })}
          </div>
          <Mono style={{ fontSize: 10, color: t.textMuted, marginTop: 2, display: 'block' }}>
            created {c.created}
          </Mono>
        </div>

        {/* Last call */}
        <div>
          <Mono style={{ fontSize: 11.5, color: c.status === 'never' ? t.textMuted : t.textSec }}>
            {c.lastTool}
          </Mono>
          <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 2 }}>
            {c.lastSeen}
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', background: statusColor,
            boxShadow: c.status === 'live' ? `0 0 0 4px ${t.emerald}22` : 'none',
            animation: c.status === 'live' ? 'pulse 2s infinite' : 'none',
            flexShrink: 0,
          }} />
          <Mono style={{ fontSize: 10.5, color: statusColor, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            {statusLabel}
          </Mono>
        </div>

        {/* Origin */}
        <div style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ fontSize: 11.5, color: t.textSec, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {c.origin}
          </div>
          <Mono style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>
            {c.ip}
          </Mono>
        </div>

        {/* 7-day calls */}
        <div>
          <div style={{ fontFamily: fontDisplay, fontSize: 16, fontWeight: 700, color: c.calls7d ? t.text : t.textMuted, letterSpacing: '-0.02em' }}>
            {c.calls7d}
          </div>
          <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.08em' }}>
            calls
          </Mono>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <span style={{
            padding: '4px 9px', borderRadius: 5,
            background: 'transparent', border: `1px solid ${t.border}`,
            color: t.textSec, fontFamily: fontBody, fontSize: 10.5, fontWeight: 500, cursor: 'pointer',
          }}>
            ⋯
          </span>
        </div>
      </div>

      {/* Expanded inline detail row */}
      {c.expanded && (
        <div style={{
          padding: '16px 18px 18px',
          borderBottom: !last ? `1px solid ${t.border}` : 'none',
          background: t.surfaceHi,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 18 }}>

            {/* Recent calls */}
            <div>
              <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Recent tool calls
              </Mono>
              <div style={{
                background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8,
                overflow: 'hidden',
              }}>
                {[
                  { time: '5 min ago', tool: 'briefing', args: '{}', ms: 142 },
                  { time: '7 min ago', tool: 'list_plans', args: '{ "status": "active" }', ms: 88 },
                  { time: '11 min ago', tool: 'get_plan', args: '{ "id": "plan_atlas_v2" }', ms: 64 },
                  { time: '14 min ago', tool: 'queue_decision', args: '{ "plan_id": "...", ... }', ms: 102 },
                ].map((row, i, arr) => (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '110px 1fr 60px',
                    gap: 10, padding: '8px 12px',
                    borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
                    alignItems: 'center',
                  }}>
                    <Mono style={{ fontSize: 10, color: t.textMuted }}>{row.time}</Mono>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <Mono style={{ fontSize: 11, color: t.text, fontWeight: 600 }}>{row.tool}</Mono>
                      <Mono style={{ fontSize: 10, color: t.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.args}
                      </Mono>
                    </div>
                    <Mono style={{ fontSize: 10, color: t.textMuted, textAlign: 'right' }}>{row.ms}ms</Mono>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div>
              <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Actions
              </Mono>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={{
                  padding: '8px 12px', borderRadius: 7, textAlign: 'left',
                  background: t.surface, border: `1px solid ${t.border}`,
                  color: t.text, fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                  Rotate token →
                </button>
                <button style={{
                  padding: '8px 12px', borderRadius: 7, textAlign: 'left',
                  background: t.surface, border: `1px solid ${t.border}`,
                  color: t.text, fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                  Test connection
                </button>
                <button style={{
                  padding: '8px 12px', borderRadius: 7, textAlign: 'left',
                  background: t.surface, border: `1px solid ${t.border}`,
                  color: t.text, fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                  Edit permissions
                </button>
                <button style={{
                  padding: '8px 12px', borderRadius: 7, textAlign: 'left',
                  background: 'transparent', border: `1px solid ${t.red}55`,
                  color: t.red, fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>
                  Revoke
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

window.SettingsIntegrations = SettingsIntegrations;
