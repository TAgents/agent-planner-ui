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
├── contexts/       # React context providers (auth, org, plan)
├── hooks/          # Custom React hooks
├── services/       # API client and WebSocket service
├── types/          # TypeScript type definitions
└── utils/          # Helper utilities
```

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
