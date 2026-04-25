// Connect pages for the developer-leaning clients. They all share a template
// (top bar, header, steps, alt-clients footer) — this file defines the four
// variants: Claude Code, Cursor, OpenClaw, ChatGPT.

function ConnectPageShell({ theme, glyph, kicker, title, subtitle, children, currentClient }) {
  const t = useT(theme);
  const others = [
    { id: 'claude-desktop', label: 'Claude Desktop' },
    { id: 'claude-code', label: 'Claude Code' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'openclaw', label: 'OpenClaw' },
    { id: 'chatgpt', label: 'ChatGPT' },
  ].filter(c => c.id !== currentClient);

  return (
    <ArtboardFrame theme={theme} padded={false}>
      <div style={{ height: '100%', overflow: 'auto' }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px', borderBottom: `1px solid ${t.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6, background: t.amber, color: t.bg,
              fontFamily: fontDisplay, fontWeight: 700, fontSize: 13, letterSpacing: '-0.04em',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>ap</div>
            <Display style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>AgentPlanner</Display>
            <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', marginLeft: 6 }}>
              · Connect
            </Mono>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: t.textSec }}>
            <span style={{ cursor: 'pointer' }}>Other clients</span>
            <span style={{ cursor: 'pointer' }}>Docs</span>
          </div>
        </div>

        <div style={{ padding: '36px 28px 60px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: t.surfaceHi, color: t.text,
                border: `1px solid ${t.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, letterSpacing: '-0.04em',
              }}>{glyph}</div>
              <div>
                <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'block' }}>
                  ◆ {kicker}
                </Mono>
                <Display style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
                  {title}
                </Display>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: t.textSec, lineHeight: 1.6, marginTop: 8, marginBottom: 28 }}>
              {subtitle}
            </p>

            {children}

            {/* Footer alt clients */}
            <div style={{
              marginTop: 18, paddingTop: 22, borderTop: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <Mono style={{ fontSize: 10, color: t.textMuted, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Using a different agent?
              </Mono>
              <div style={{ display: 'flex', gap: 8 }}>
                {others.map((c) => (
                  <span key={c.id} style={{
                    padding: '5px 11px', borderRadius: 6,
                    background: t.surface, border: `1px solid ${t.border}`,
                    fontFamily: fontBody, fontSize: 11, color: t.textSec, cursor: 'pointer',
                  }}>
                    {c.label} →
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </ArtboardFrame>
  );
}

// ---- BRIEFING DATA shared across the connect pages -----------
const _briefing = [
  { label: 'Goals', value: '6', sub: '4 active · 2 paused' },
  { label: 'Plans', value: '12', sub: '3 in motion' },
  { label: 'Decisions', value: '0', sub: 'Awaiting you' },
  { label: 'Beliefs', value: '847', sub: 'Across all goals' },
];

// ============================================================
// CLAUDE CODE
// ============================================================
function ConnectClaudeCode({ theme = 'dark' }) {
  const t = useT(theme);

  return (
    <ConnectPageShell
      theme={theme} glyph="CC" kicker="Two paths"
      title="Connect Claude Code"
      subtitle="Per-project recommended — keeps the connection scoped to one repo. Use Global if you want every Claude Code session to see your workspace."
      currentClient="claude-code"
    >
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <div style={{
          padding: '10px 16px', borderRadius: 8,
          background: t.surfaceHi, border: `1px solid ${t.amber}`,
          display: 'flex', alignItems: 'center', gap: 10,
          flex: 1, cursor: 'pointer',
        }}>
          <span style={{
            width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${t.amber}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.amber }} />
          </span>
          <div>
            <Display style={{ fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', display: 'block' }}>
              Per-project
            </Display>
            <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 1 }}>
              Recommended · writes <Mono style={{ fontSize: 10, color: t.textSec }}>.mcp.json</Mono>
            </div>
          </div>
        </div>
        <div style={{
          padding: '10px 16px', borderRadius: 8,
          background: t.surface, border: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', gap: 10,
          flex: 1, cursor: 'pointer',
        }}>
          <span style={{
            width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${t.borderHi}`, flexShrink: 0,
          }} />
          <div>
            <Display style={{ fontSize: 13, fontWeight: 600, color: t.textSec, letterSpacing: '-0.01em', display: 'block' }}>
              Global
            </Display>
            <div style={{ fontSize: 10.5, color: t.textMuted, marginTop: 1 }}>
              All sessions · edits Claude Desktop config
            </div>
          </div>
        </div>
      </div>

      <StepCard theme={theme} n={1} title="Run setup in your project root"
        subtitle="This writes .mcp.json with the token already filled in."
        state="active"
      >
        <SnippetBlock
          theme={theme}
          comment="run from your project root"
          lines={[
            { text: 'npx agent-planner-mcp setup \\', color: t.text },
            { text: '--token ap_live_8f3a92c4d1e7b6a8f9c2e5d3', color: t.text, indent: 1 },
          ]}
        />
      </StepCard>

      <StepCard theme={theme} n={2} title="Restart your Claude Code session"
        subtitle="Or run /mcp reload from inside it."
        state="active"
      >
        <SnippetBlock
          theme={theme}
          lines={[{ text: '/mcp reload', color: t.text }]}
        />
      </StepCard>

      <StepCard theme={theme} n={3} title="Test the connection"
        subtitle="Asks Claude Code to fetch your briefing."
        state="success"
      >
        <button style={{
          padding: '11px 18px', borderRadius: 8,
          background: t.emerald, color: t.bg, border: 'none',
          fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>✓</span> Test connection
        </button>
        <TestPanel theme={theme} state="success" briefing={_briefing} />
      </StepCard>
    </ConnectPageShell>
  );
}

// ============================================================
// CURSOR / VS CODE / WINDSURF / CLINE
// ============================================================
function ConnectCursor({ theme = 'dark' }) {
  const t = useT(theme);

  return (
    <ConnectPageShell
      theme={theme} glyph="C" kicker="One snippet, four editors"
      title="Connect Cursor, VS Code, Windsurf or Cline"
      subtitle="Same MCP server, different config files. Paste the snippet in the location below for your editor."
      currentClient="cursor"
    >
      <StepCard theme={theme} n={1} title="Add this to your MCP config"
        subtitle="The token is already inlined — no edits needed."
        state="active"
      >
        <SnippetBlock
          theme={theme}
          language="js"
          lines={[
            { text: '{', color: t.text },
            { text: '"mcpServers": {', color: t.text, indent: 1 },
            { text: '"agentplanner": {', color: t.text, indent: 2 },
            { text: '"command": "npx",', color: t.text, indent: 3 },
            { text: '"args": ["-y", "agent-planner-mcp"],', color: t.text, indent: 3 },
            { text: '"env": {', color: t.text, indent: 3 },
            { text: '"API_URL": "https://agentplanner.io/api",', color: t.text, indent: 4 },
            { text: '"USER_API_TOKEN": "ap_live_8f3a92c4d1e7b6a8f9c2e5d3"', color: t.amber, indent: 4 },
            { text: '}', color: t.text, indent: 3 },
            { text: '}', color: t.text, indent: 2 },
            { text: '}', color: t.text, indent: 1 },
            { text: '}', color: t.text },
          ]}
        />
      </StepCard>

      <StepCard theme={theme} n={2} title="Where the config lives"
        subtitle={null}
        state="active"
      >
        <div style={{
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10,
          overflow: 'hidden',
        }}>
          {[
            { name: 'Cursor', path: '~/.cursor/mcp.json' },
            { name: 'VS Code', path: '.vscode/mcp.json', tag: 'per-project' },
            { name: 'Windsurf', path: '~/.codeium/windsurf/mcp_config.json' },
            { name: 'Cline', path: 'VS Code extension settings → MCP servers' },
          ].map((row, i, arr) => (
            <div key={row.name} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px',
              borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none',
            }}>
              <Display style={{ fontSize: 12.5, fontWeight: 600, color: t.text, letterSpacing: '-0.01em', minWidth: 90 }}>
                {row.name}
              </Display>
              <Mono style={{ flex: 1, fontSize: 11, color: t.textSec }}>
                {row.path}
              </Mono>
              {row.tag && (
                <Pill theme={theme} color="slate">{row.tag}</Pill>
              )}
            </div>
          ))}
        </div>
      </StepCard>

      <StepCard theme={theme} n={3} title="Test the connection"
        subtitle="Restart your editor first if you just edited the config."
        state="success"
      >
        <button style={{
          padding: '11px 18px', borderRadius: 8,
          background: t.emerald, color: t.bg, border: 'none',
          fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>✓</span> Test connection
        </button>
        <TestPanel theme={theme} state="success" briefing={_briefing} />
      </StepCard>
    </ConnectPageShell>
  );
}

// ============================================================
// OPENCLAW — different test model: poll for first incoming call
// ============================================================
function ConnectOpenClaw({ theme = 'dark' }) {
  const t = useT(theme);

  // This page demonstrates the "waiting for first call" state — different
  // from the briefing-success pattern.
  return (
    <ConnectPageShell
      theme={theme} glyph="OC" kicker="Skill model"
      title="Connect OpenClaw"
      subtitle="OpenClaw runs your agent on its own VM, so we wait for it to call us instead of calling out. Three commands, then watch for the first call."
      currentClient="openclaw"
    >
      <StepCard theme={theme} n={1} title="Install the skill"
        subtitle={null} state="active"
      >
        <SnippetBlock
          theme={theme}
          comment="on your OpenClaw VM"
          lines={[{ text: 'openclaw skills install agentplanner', color: t.text }]}
        />
      </StepCard>

      <StepCard theme={theme} n={2} title="Set the token as a secret"
        subtitle={null} state="active"
      >
        <SnippetBlock
          theme={theme}
          lines={[
            { text: 'openclaw secrets set AP_TOKEN \\', color: t.text },
            { text: 'ap_live_8f3a92c4d1e7b6a8f9c2e5d3', color: t.amber, indent: 1 },
          ]}
        />
      </StepCard>

      <StepCard theme={theme} n={3} title="Restart the agent"
        subtitle={null} state="active"
      >
        <SnippetBlock
          theme={theme}
          lines={[{ text: 'openclaw agent restart', color: t.text }]}
        />
      </StepCard>

      <StepCard theme={theme} n={4} title="Watch for the first call"
        subtitle="We'll mark this connected once your agent makes any call. Up to 60 seconds."
        state="active"
      >
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: t.amberSoft, border: `1px solid ${t.amber}55`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: t.amber,
              animation: 'pulse 1.6s infinite',
            }} />
            <Display style={{ fontSize: 13, fontWeight: 600, color: t.amber, letterSpacing: '-0.01em' }}>
              Waiting for first call…
            </Display>
          </div>
          <div style={{ flex: 1 }} />
          <Mono style={{ fontSize: 10.5, color: t.textSec, letterSpacing: '0.1em' }}>
            00:24 / 01:00
          </Mono>
        </div>

        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 8, background: t.surface, border: `1px solid ${t.border}` }}>
          <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Recent inbound calls (this token)
          </Mono>
          <div style={{ fontSize: 11.5, color: t.textMuted, fontStyle: 'italic' }}>
            No calls yet. They'll appear here as soon as your agent reaches us.
          </div>
        </div>
      </StepCard>
    </ConnectPageShell>
  );
}

// ============================================================
// CHATGPT
// ============================================================
function ConnectChatGPT({ theme = 'dark' }) {
  const t = useT(theme);

  return (
    <ConnectPageShell
      theme={theme} glyph="GPT" kicker="HTTP MCP"
      title="Connect ChatGPT"
      subtitle="In a custom GPT, add AgentPlanner as an MCP server using the HTTP endpoint and bearer token below."
      currentClient="chatgpt"
    >
      <StepCard theme={theme} n={1} title="MCP server URL"
        subtitle="Paste this into the GPT builder's MCP servers field."
        state="active"
      >
        <SnippetBlock
          theme={theme}
          lines={[{ text: 'https://agentplanner.io/mcp', color: t.text }]}
        />
      </StepCard>

      <StepCard theme={theme} n={2} title="Authentication"
        subtitle="Bearer token, scoped to your workspace."
        state="active"
      >
        <div style={{ marginBottom: 8 }}>
          <Mono style={{ fontSize: 9.5, color: t.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Header
          </Mono>
          <SnippetBlock
            theme={theme}
            lines={[{ text: 'Authorization: Bearer ap_live_8f3a92c4d1e7b6a8f9c2e5d3', color: t.text }]}
          />
        </div>
      </StepCard>

      <StepCard theme={theme} n={3} title="Test the connection"
        subtitle="Run any tool from your custom GPT — we'll show the call here when it arrives."
        state="success"
      >
        <button style={{
          padding: '11px 18px', borderRadius: 8,
          background: t.emerald, color: t.bg, border: 'none',
          fontFamily: fontBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 13 }}>✓</span> Test connection
        </button>
        <TestPanel theme={theme} state="success" briefing={_briefing} />
      </StepCard>
    </ConnectPageShell>
  );
}

Object.assign(window, { ConnectClaudeCode, ConnectCursor, ConnectOpenClaw, ConnectChatGPT });
