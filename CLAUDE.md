# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The repository root (`../CLAUDE.md`) describes the broader Talking Agents monorepo and shared architecture. This file is the frontend-specific guide.

## What this is

`agent-planner-ui` is the **React web interface** for AgentPlanner. CRA (react-scripts 5) + React 18 + TypeScript + Tailwind + React Query. License BUSL-1.1. Talks to `agent-planner` over REST + WebSocket.

## Commands

```bash
npm start                       # dev server on http://localhost:3001
npm run build                   # production build (CRA → build/)
npm test                        # interactive watch mode (CRA default)
npm test -- --watchAll=false    # one-shot run, CI-style
npm test -- MyComponent         # filter by filename pattern
```

No lint script — CRA's `eslintConfig` (`react-app`, `react-app/jest`) runs inline with the build.

### Production image

`Dockerfile.prod` builds a static bundle and serves it via Nginx. `REACT_APP_API_URL` is a **build-time** arg — bake it in at `docker build --build-arg REACT_APP_API_URL=...`. Changing it later requires a rebuild.

## Design system

When touching UI, read these (in repo root): `DESIGN_GUIDELINES.md`, `DESIGN_QUICK_REFERENCE.md`, `DESIGN_REFERENCE.md`. Tailwind config in `tailwind.config.js`.

**Agent-first dashboard contract** (from the monorepo vision): the UI is for human *oversight and steering*, not manual plan/task editing.
- Goal and Plan detail pages must **not** surface Edit / Link / New buttons — agents do that work.
- Default to read-only views with **Approve / Redirect** actions for human steering.
- Dashboard surfaces: Decision Queue, Goal Health (`on_track` / `at_risk` / `stale`), Agent Activity.
- `CreatePlan` is a goal-setting flow, not a form for building tree structure manually.

## Architecture

### Routing (`src/App.tsx`)

Three groups: public marketing routes, auth routes (`/login`, `/register`), and protected app routes under `/app/*`. Auth gating is centralized — don't add per-page redirects.

### State

- **Server state → React Query.** Configured with `refetchOnWindowFocus: false`, `retry: 1`. Query keys include `userId` so cache separates per user.
- **Local UI state → `UIContext`** (`src/contexts/UIContext.tsx`) using a Redux-style reducer: sidebar, dark mode, node details panel.
- **WebSocket → `WebSocketContext`** with exponential backoff (max 10 attempts, capped at 30s) and 30s ping/pong keepalive. Event-based subscription pattern.
- **Presence → `PresenceContext`** layered on top of the WebSocket.

### Derived metrics — server computes, UI renders

Progress, status counts, health, blocked %, etc. are computed once on the server
and returned as fields (`plan.rollup`, `goal.health`, `workspace.progressPct`).
**Components never recompute a metric from the raw node/goal list.** For the rare
live-compute case (e.g. before `plan.rollup` loads), use a pure selector in
`src/selectors/` that mirrors the server formula. A ratchet test
(`src/__tests__/noClientMetricMath.test.ts`) fails the build on new ad-hoc math.
Full rules: `docs/DERIVED_METRICS.md`.

### API services (`src/services/`)

`api.ts` is the axios instance + interceptors + shared `request()`. Request interceptor injects JWT from `localStorage['auth_session']`. Response interceptor on 401 redirects to `/login`.

Domain services live in their own files — import directly:
- `plans.service.ts`, `nodes.service.ts`, `decisions.service.ts`, `knowledge.service.ts`, `goals.service.ts`, `integrations.service.ts`, `workspaces.service.ts`, `blueprints.service.ts`, `onboarding.service.ts`.

Small concerns (auth, comments, activity, search, tokens) stay inline in `api.ts`. `api.ts` also re-exports the domain services for backward compatibility — **new code should import from the domain file directly**, not via `api.ts`.

### Hooks (`src/hooks/`)

Custom hooks wrap React Query: `usePlans`, `useNodes`, `useGoals`, `useDependencies`, `useGraphitiKnowledge`, `useAuth`, `useWebSocket`, `useDecisions`, `useAgentRequests`, etc. Components should call these — don't call services directly from JSX.

### Components — feature-organized

`components/plans/`, `goals/`, `visualization/`, `tree/`, `details/`, `layout/`, `auth/`, `common/`, `decisions/`, `github/`, `presence/`.

**Node details panel** is the most complex area — read these before editing:
- `UnifiedNodeDetails.tsx` (~600-line orchestration shell)
- `NodeDetailsLogs.tsx`, `NodeDetailsAgent.tsx`
- `NodeDetailsPrimitives.tsx` (shared sub-components — reuse, don't duplicate)
- `NodeDependenciesTab.tsx`, `NodeKnowledgeTab.tsx`, `AgentContextPanel.tsx`

The panel is **read-only by default** with approve/redirect actions — see the agent-first contract above.

**Dependency visualization** uses `@xyflow/react`. `DependencyGraph.tsx` renders a DAG with custom nodes, critical-path highlighting, impact-analysis overlay, and an add-dependency modal. Tree view also shows dependency indicators.

**Knowledge graph views** use `@xyflow/react` for the entity graph (`KnowledgeGraph.tsx`) plus a timeline (`KnowledgeTimeline.tsx`); per-task knowledge lives in `NodeKnowledgeTab.tsx`. All powered by `useGraphitiKnowledge.ts`.

## Environment

- `REACT_APP_API_URL` — default `http://localhost:3000`. CRA inlines `REACT_APP_*` at build time. Restart `npm start` after editing `.env.local`.
