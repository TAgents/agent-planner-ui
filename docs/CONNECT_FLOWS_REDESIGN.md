# Connect Flows — Integration UX Redesign

**Status**: design brief, ready for Claude Design handoff
**Author**: design spec
**Date**: 2026-04-25
**Scope**: agentplanner.io homepage hero + agent-planner-ui in-product onboarding + Settings → Integrations

## The problem

A new user landing on AgentPlanner today goes through this:
1. Hears about AP somewhere
2. Lands on agentplanner.io
3. Signs up
4. Sees an empty dashboard
5. Tries to figure out how to connect their agent
6. Goes to GitHub README OR Settings → API Tokens
7. Copies a token
8. Reads how to install for their client
9. Pastes JSON / installs `.mcpb` / runs `npx`
10. Tries something and hopes it works

**Steps 4-10 are where users churn.** The dashboard is empty because no agent is connected. No agent will be connected without effort. The effort happens *off-site* (Claude Desktop install dialog, terminal, GitHub README, etc.). Every transition out of agentplanner.io is a churn risk.

The redesign should collapse 4-10 into a single in-product flow that ends with a working agent — proven, not just configured.

## The principle that guides every screen

**Never leave the user in "did it work?"**

Every config flow ends with a "Test connection" button that calls `briefing()` from the user's just-configured client and shows the response. Until that button shows green, onboarding isn't done. The dashboard is locked behind it.

This is the single most important design constraint. Every other choice flows from it.

## Three surfaces, three jobs

### Surface 1: agentplanner.io landing (sales funnel)

**Job**: convince + funnel into a working install.

**Hero swap**: replace "Sign up" CTA with **"Install in Claude Desktop"** as the primary button. The button:
- Triggers a direct download of `agent-planner.mcpb` from GitHub releases (`https://github.com/TAgents/agent-planner-mcp/releases/latest/download/agent-planner.mcpb`)
- After download, the page transitions to a "Now: paste this token" state requiring sign-up to generate the token

**Sub-CTA** below the hero: "Or sign up first" (link to `/signup`) for users who prefer the traditional flow.

**Works with strip**, immediately below the hero:

```
┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Claude      │ Claude      │ OpenClaw    │ Cursor /    │ ChatGPT     │
│ Desktop     │ Code        │             │ VS Code     │             │
│ One-click   │ One command │ One install │ One snippet │ Custom GPT  │
│ .mcpb       │ npx setup   │ skill add   │ JSON config │ HTTP MCP    │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

Each card is a link to the matching `/connect/<client>` page (see Surface 2).

**Why this matters**: most agent products require an account before you see anything. AP's `.mcpb` genuinely works the moment you install (after pasting a token). Make the hero CTA reflect that 30-second install reality.

### Surface 2: In-product onboarding (Step 0 of the dashboard)

**Job**: ship a working agent before the user sees plans.

**The empty-dashboard rule**: when a new user lands on the dashboard with zero successful tool calls in the last 7 days, **do not show plans**. Show a Connect Claude wizard instead. Offer a "skip for now" link, but default to the wizard.

**Wizard structure** (3 steps, single-page progressive disclosure):

```
Step 1 — Which agent are you connecting?

  [ Claude Desktop ]  [ Claude Code ]  [ OpenClaw ]
  [ Cursor ]          [ Other MCP ]

  Recommended for non-developers: Claude Desktop (no terminal needed)

Step 2 — Connect

  [Per-client UI; see "Per-client pages" below]

Step 3 — Test connection

  [Big green button] "Run a test call"
  → calls briefing() with the just-generated token
  → shows live response: "✓ Connected — 6 goals, 0 pending decisions"
  → On failure, shows the actual error and a "Retry" button + "Get help" link
```

After step 3 succeeds, redirect to the dashboard with the now-real briefing data rendered. The first thing the user sees in their AP dashboard is the live briefing they just successfully fetched. That's the moment the product clicks.

### Surface 3: Settings → Integrations (steady state)

**Job**: manage + trust.

This is where users go when:
- They want to add another client
- They're debugging "is my agent still connected?"
- They're rotating tokens

**Layout**: tabs by client, plus an "Active connections" panel.

```
┌─────────────────────────────────────────────────────────────┐
│ Tabs: [ Claude Desktop ] [ Claude Code ] [ OpenClaw ]       │
│       [ Cursor ] [ ChatGPT ] [ Active connections ]         │
└─────────────────────────────────────────────────────────────┘
```

**Each client tab**: same UI as the matching `/connect/<client>` page. One source of truth. Pre-filled snippets, copy buttons, test connection button.

**Active connections panel**: a table of all tokens with their last-call telemetry:

```
Token name           Last seen    Last tool       Origin            Actions
─────────────────────────────────────────────────────────────────────────────
default              5 min ago    briefing        Claude Desktop    [ Rotate ]
qa-agent-prod        2 days ago   queue_decision  OpenClaw VM       [ Revoke ]
my-mac-claude-code   never        —               —                 [ Revoke ]
```

This is the trust layer. Users need to *see* that their connections are alive.

## Per-client pages (specifications)

Each lives at `/connect/<client>` and is also embedded in the matching Settings → Integrations tab.

### `/connect/claude-desktop` — the simplest, lead with this

```
┌─────────────────────────────────────────────────────────────┐
│  Connect Claude Desktop                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Step 1 of 3 — Download the extension                       │
│                                                             │
│   ┌──────────────────────────────────┐                     │
│   │  📥 Download agent-planner.mcpb  │  ← big button       │
│   └──────────────────────────────────┘                     │
│                                                             │
│  Step 2 of 3 — Double-click the file you just downloaded    │
│                                                             │
│   Claude Desktop will open and prompt for your API token.   │
│   Paste this:                                               │
│                                                             │
│   ┌──────────────────────────────────────────┐             │
│   │  ap_xxxx...xxxx                  [Copy]  │             │
│   └──────────────────────────────────────────┘             │
│                                                             │
│   API URL is pre-filled: https://agentplanner.io/api        │
│                                                             │
│  Step 3 of 3 — Test it                                      │
│                                                             │
│   ┌──────────────────────────┐                             │
│   │  ✓ Test connection       │  ← runs briefing()           │
│   └──────────────────────────┘                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Token is auto-generated when the user lands on the page — never "go to Settings → Tokens to make one."

### `/connect/claude-code`

Two paths because Claude Code has two config locations. Default-promoted is per-project.

```
┌─────────────────────────────────────────────────────────────┐
│  Connect Claude Code                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ◉ Per-project (recommended)                                 │
│  ◯ Global (Claude Desktop config)                            │
│                                                              │
│  ── Per-project ──────────────────────────────────────────   │
│                                                              │
│  Run this in your project root:                              │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │  npx agent-planner-mcp setup --token \   │  [Copy]      │
│   │    ap_xxxx...xxxx                        │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
│  This writes .mcp.json with the token already filled in.     │
│                                                              │
│  Step 3 — Test                                               │
│   [ Test connection ]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

For the "Global" path, show the JSON snippet pre-filled with the token, with a copy button. Same Test step.

### `/connect/openclaw`

OpenClaw has its own skill model. Surface a 3-line install:

```
┌─────────────────────────────────────────────────────────────┐
│  Connect OpenClaw                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  On your OpenClaw VM (or any agent host):                    │
│                                                              │
│  1. Install the skill                                        │
│   ┌──────────────────────────────────────────┐              │
│   │  openclaw skills install agentplanner    │  [Copy]      │
│   └──────────────────────────────────────────┘              │
│                                                              │
│  2. Set the token                                            │
│   ┌──────────────────────────────────────────┐              │
│   │  openclaw secrets set AP_TOKEN \         │  [Copy]      │
│   │    ap_xxxx...xxxx                        │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
│  3. Restart the agent                                        │
│   ┌──────────────────────────────────────────┐              │
│   │  openclaw agent restart                  │  [Copy]      │
│   └──────────────────────────────────────────┘              │
│                                                              │
│  Step 4 — Verify                                             │
│   [ I see this token in Active connections ]   ← button     │
│   AgentPlanner waits up to 60s for the agent's first call.  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

The Test step here works differently — instead of AP calling the agent, AP polls its `tool_calls` log waiting for the first call from this token.

### `/connect/cursor` (also covers VS Code, Windsurf, Cline)

One snippet works for all four. Single page, single copy button.

```
┌─────────────────────────────────────────────────────────────┐
│  Connect Cursor / VS Code / Windsurf / Cline                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Add this to your MCP config file:                           │
│                                                              │
│   ┌──────────────────────────────────────────┐              │
│   │  {                                        │              │
│   │    "mcpServers": {                        │              │
│   │      "agentplanner": {                    │              │
│   │        "command": "npx",                  │              │
│   │        "args": ["-y", "agent-planner-mcp"]│  [Copy all]  │
│   │        "env": {                           │              │
│   │          "API_URL": "...",                │              │
│   │          "USER_API_TOKEN": "ap_xxx..."    │              │
│   │        }                                  │              │
│   │      }                                    │              │
│   │    }                                      │              │
│   │  }                                        │              │
│   └──────────────────────────────────────────┘              │
│                                                              │
│  Where the config lives:                                     │
│  • Cursor: ~/.cursor/mcp.json                                │
│  • VS Code: .vscode/mcp.json (per-project)                   │
│  • Windsurf: ~/.codeium/windsurf/mcp_config.json             │
│  • Cline: VS Code extension settings                         │
│                                                              │
│  [ Test connection ]                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### `/connect/chatgpt` (if applicable)

If MCP support in ChatGPT custom GPTs is real, surface the HTTP endpoint:

```
URL: https://agentplanner.io/mcp
Auth: Bearer ap_xxxx...xxxx
```

If not, hide this tab.

## Backend support needed

Three small endpoints to enable the design:

### 1. `POST /api/setup/test-connection`

```ts
input: { token: string }
output: {
  ok: boolean,
  briefing?: <briefing response>,
  error?: { type, message }
}
```

Server calls `briefing()` with the supplied token, returns the result.

### 2. `GET /api/integrations/connections`

```ts
output: {
  connections: [{
    token_id: string,
    token_name: string,
    last_seen_at: ISO8601 | null,
    last_tool_name: string | null,
    last_tool_args_summary: string | null,
    origin_user_agent: string | null,
    origin_ip: string | null,
    call_count_7d: number
  }]
}
```

Reads from the `tool_calls` table that lands as part of the metrics infrastructure (deliverable A of the metrics plan). **This endpoint dovetails with that work** — the connection telemetry comes from the same source.

### 3. `GET /api/setup/snippets/:client`

```ts
input: client = 'claude-desktop' | 'claude-code' | 'openclaw' | 'cursor' | 'chatgpt'
output: {
  snippet: string,           // pre-filled JSON / shell command
  setup_steps: string[],     // human-readable steps
  download_url?: string,     // for claude-desktop
  test_endpoint: string      // /api/setup/test-connection
}
```

Token used in the snippet is auto-generated server-side per request, optionally named after the client.

## Key UX rules — checklist for design review

- [ ] Token is auto-generated on page load. Never "click to make a token."
- [ ] Every config snippet has a Copy button. Never "edit this with your token."
- [ ] Every setup page ends with a Test connection button that proves it worked.
- [ ] Test connection failure shows the *actual* error from `briefing()`, not a generic "something went wrong."
- [ ] Active connections panel shows last-call telemetry per token — users need to see liveness.
- [ ] The dashboard is locked behind a successful first connection. Empty states are wizards, not blank pages.
- [ ] Per-client pages exist as `/connect/<client>` routes — bookmarkable, linkable, embeddable in docs.

## What this redesign deprecates

- The current Settings → API Tokens page (becomes a sub-view of Active connections)
- The README-as-onboarding pattern (README still exists for technical users, but the in-product flow is canonical)
- The "go to GitHub releases to find the .mcpb" detour (the download lives on `/connect/claude-desktop` and the homepage hero)

## What this dovetails with

- **Metrics plan deliverable A** — the `tool_calls` / `module_metrics` table powers the Active connections panel
- **MCP Ecosystem Distribution plan task** — "Add download button on agentplanner.io" is a subset of this design (the homepage hero CTA)
- **BDI v0.9.0 surface** — Test connection calls `briefing()`, which is the canonical "is the connection alive" probe

## What I'd hand to Claude Design

For the design tool, the priority specs (in order):

1. **Onboarding wizard** that ends with a working agent — empty-dashboard state, 3-step flow, Test connection button. **This is the highest-impact screen.**
2. **`/connect/claude-desktop`** — the easiest path, the one most users will use. Lead with this in the design output.
3. **Settings → Integrations** with Active connections panel — the trust/observability layer.
4. **Homepage hero CTA swap** — "Install in Claude Desktop" as primary, "Sign up" as secondary. Plus the Works with strip.
5. **`/connect/<client>` pages** for the other four clients — same template, client-specific snippets.

If the design tool can only deliver one screen well, prioritize the onboarding wizard. If two, add `/connect/claude-desktop`. The rest follow the same template.

## What I'd ask the design tool to avoid

- Generic "developer setup" aesthetic. AP's audience includes non-developers (the .mcpb path).
- Long instructional copy. Every step should fit in a glance.
- "Coming soon" tabs. If a client integration isn't real, hide it.
- Token in plain code blocks without a copy button. Every code snippet needs a one-click copy.
- "Documentation" links as primary CTAs. Documentation is fallback, not foreground.
