# AgentPlanner UI

[![License: BUSL-1.1](https://img.shields.io/badge/License-BUSL--1.1-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org)

The React web interface for [AgentPlanner](https://agentplanner.io) — a collaborative planning platform where humans and AI agents work together on hierarchical plans.

> **Cloud version:** [agentplanner.io](https://agentplanner.io) — sign up free, no setup required.  
> **Self-hosting:** See below. Requires the [agent-planner](https://github.com/TAgents/agent-planner) backend.

## Features

- **Plan view** — hierarchical task tree with drag-and-drop reordering and dependency graph visualization
- **Goal dashboard** — health cards (`on_track`, `at_risk`, `stale`), briefings, and bottleneck detection
- **Decision queue** — review and resolve agent-to-human handoffs
- **Activity stream** — real-time feed of agent actions via WebSocket
- **Knowledge graph** — explore entities, facts, and relationships extracted by agents
- **Agent management** — create and manage agent identities and permissions
- **Context viewer** — inspect the 4-layer progressive context agents receive
- **Organization workspace** — multi-tenant support with invite-based collaboration
- **MCP setup wizard** — guided setup for Claude Desktop, Claude Code, Cursor, and Windsurf

## Self-Hosting

### Prerequisites

- Node.js 16+
- A running [agent-planner](https://github.com/TAgents/agent-planner) backend

### Development

```bash
git clone https://github.com/TAgents/agent-planner-ui.git
cd agent-planner-ui

npm install

# Point to your backend
cp .env.example .env.local
# Edit .env.local: set REACT_APP_API_URL=http://localhost:3000

npm start   # Runs on http://localhost:3001
```

### Production (Docker)

```bash
# Build image — set API URL at build time
docker build \
  --build-arg REACT_APP_API_URL=https://your-api.example.com \
  -f Dockerfile.prod \
  -t agent-planner-ui .

docker run -p 80:80 agent-planner-ui
```

The production image uses Nginx to serve the static build.

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3000` |

### Available Scripts

```bash
npm start        # Development server (hot reload)
npm run build    # Production build
npm test         # Run tests
```

## Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **@xyflow/react** for dependency graph visualization
- **@dnd-kit** for drag-and-drop
- **WebSocket** for real-time collaboration and presence

## Project Structure

```
src/
├── pages/          # Route-level page components
├── components/     # Reusable UI components
│   └── v1/         # v1 redesign — shared chrome primitives (see Design System)
├── contexts/       # React context providers (auth, org, plan)
├── hooks/          # Custom React hooks
├── services/       # API client and WebSocket service
├── types/          # TypeScript type definitions
└── utils/          # Helper utilities
```

## Design System

The UI is mid-migration to a v1 redesign defined in
[`design_handoff_agentplanner/`](./design_handoff_agentplanner/). The
canonical source for tokens, components, and motion is
[02-design-tokens.md](./design_handoff_agentplanner/02-design-tokens.md)
and [03-component-inventory.md](./design_handoff_agentplanner/03-component-inventory.md);
this section is the ergonomics guide for working in the codebase.

### Tokens

Semantic colors are defined as space-separated rgb triplets on `:root`
(light) and `.dark` (dark) in [`src/index.css`](./src/index.css), and
exposed as Tailwind utilities via `rgb(var(--token) / <alpha-value>)`
in [`tailwind.config.js`](./tailwind.config.js):

| Token group | Usage |
|---|---|
| `bg`, `surface`, `surface-hi` | App background → cards → hover/nested |
| `border`, `border-hi` | 1px borders, stronger dividers |
| `text`, `text-sec`, `text-muted` | Primary, secondary, tertiary text |
| `amber` (DEFAULT + `amber-soft`) | Brand accent + tinted background |
| `emerald`, `red`, `violet`, `slate` (DEFAULT + `*-soft`) | Status semantic accents |

Use them in JSX as `bg-surface`, `text-text-sec`, `border-border`,
`bg-amber-soft text-amber`, etc.

### Migration policy: tokens

The legacy `--ob-*` variables and the existing color scales (e.g.
`bg-amber-500`, `dark:bg-gray-800`, `text-violet-600`) **still work** —
do not bulk-rename. The new tokens are added alongside via Tailwind's
`DEFAULT` key, and the `extend.colors` deep-merge preserves Tailwind's
default `emerald`/`red`/`violet`/`slate` scales. New v1 surfaces should
prefer the semantic tokens; legacy pages migrate page-by-page.

### Chrome primitives — `src/components/v1/`

| Primitive | Purpose |
|---|---|
| `<AppShell>` | 56px left rail with brand tile + 4 monogram nav items |
| `<Card>` | Surface + 1px border + 10px radius, parameterized padding |
| `<Pill>` | Rounded chip in `amber`/`emerald`/`red`/`violet`/`slate` (uses `*-soft` background) |
| `<Kicker>` | Mono uppercase `tracking-[0.18em]` kicker label |
| `<SectionHead>` | `kicker + title + right-slot` pattern above sections |
| `<StatusDot>` | Filled circle, optional pulsing ring for "live" agent states |
| `<StatusSpine>` | Row card with 3px colored left bar (Plans index pattern) |
| `<ProposedChip>` | Dashed amber pill marking design-only / not-yet-real fields |
| `<TokenBlock>` | API token row with ⚿ glyph + Copy button (onboarding, /connect/*) |

```tsx
import { AppShell, Card, Pill, SectionHead, Kicker } from 'components/v1';

<AppShell active="plans">
  <Card pad={20}>
    <SectionHead kicker="◆ Next up" title="Active plans" right={<Pill color="amber">3</Pill>} />
    {/* ... */}
  </Card>
</AppShell>
```

### Fonts

`Space Grotesk` is the v1 type pair (display + body) alongside
`JetBrains Mono` for kickers and metadata. All four families load via
the Google Fonts `<link>` in [`public/index.html`](./public/index.html).
Tailwind's `font-display` and `font-body` resolve to Space Grotesk first
with the legacy `Bricolage Grotesque` / `Figtree` as fallback during
the migration window.

### Migration policy: components

New v1 surfaces import from `components/v1`; legacy pages keep their
existing components. Don't delete legacy chrome until the consuming
pages migrate. See
[`design_handoff_agentplanner/05-build-order.md`](./design_handoff_agentplanner/05-build-order.md)
for the phased rollout.

## Related Projects

- **[agent-planner](https://github.com/TAgents/agent-planner)** — backend API (Node.js, PostgreSQL)
- **[agent-planner-mcp](https://github.com/TAgents/agent-planner-mcp)** — MCP server for AI agent integration

## Contributing

Issues and PRs welcome. Please open an issue first for significant changes.

## License

Business Source License 1.1 — see [LICENSE](LICENSE) for details.  
Source is freely available; production SaaS use requires a commercial license.  
The license converts to open source after the change date specified in the LICENSE file.

Cloud-hosted version available at [agentplanner.io](https://agentplanner.io).
