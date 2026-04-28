# Handoff: AgentPlanner — full UI redesign

## Overview

This bundle is a hi-fi design proposal for **AgentPlanner**, a planning surface where humans and AI agents share goals, plans, and beliefs. It covers the full product surface — marketing landing, auth, in-app screens, sharing, and discovery — with a coherent visual system and a strong central metaphor (the "BDI" lens: Beliefs / Desires / Intentions).

The redesign was authored against the real codebase (`agent-planner-frontend`) so most of it maps 1:1 to existing types, fields, and components. A few elements (the BDI Coherence dial, Goal Compass, Belief ledger) are **proposed** new features built on top of the existing `briefing.knowledge` payload — they are clearly labeled as such throughout the designs and in this README.

## About the design files

The files in `designs/` are **design references**, not production code. They are React components rendered through Babel-in-browser into a static HTML canvas, with hand-rolled tokens and ad-hoc layout. The task is to **recreate these designs in the existing AgentPlanner frontend** (Next.js + React + Tailwind + Radix + the project's existing component library), using the codebase's established patterns. Do not paste the JSX as-is.

Open `designs/AgentPlanner.html` in a browser to see all screens side-by-side on a pannable canvas. There is a Tweaks panel for theme/font/section toggles.

## Fidelity

**High-fidelity.** Pixel-precise layouts, final typography, real copy, accurate spacing, color tokens defined for both dark and light. Every screen is rendered in both themes. The visual language is intentional and should be preserved:

- Warm-neutral palette (off-black `#0e0c0a` / off-white `#fafaf7`) with **amber** as the only saturated accent
- Typographic hierarchy uses display + mono pairing (Space Grotesk + JetBrains Mono is the chosen pair; see Tokens)
- Diamond glyph `◆` used as a structural marker for kickers/section heads
- Heavy use of monospaced labels in tiny, wide-tracked uppercase for metadata
- Status semantics: emerald = healthy / on-track, amber = needs attention, red = blocked / contradiction, violet = beliefs / knowledge

## What's in the bundle

```
design_handoff_agentplanner/
├── README.md                    ← you are here
├── 01-screen-specs.md           ← detailed spec per screen
├── 02-design-tokens.md          ← colors, fonts, spacing, shadows
├── 03-component-inventory.md    ← new + reused components, with prop signatures
├── 04-data-model-mapping.md     ← every UI element → backend field; proposed-vs-real
├── 05-build-order.md            ← phased rollout, effort estimates, dependencies
├── 06-motion-notes.md           ← animation spec: load-bearing vs polish vs don't-animate
└── designs/
    ├── AgentPlanner.html        ← open this in a browser to see everything
    ├── design-canvas.jsx        ← canvas chrome (ignore)
    ├── tweaks-panel.jsx         ← tweaks chrome (ignore)
    ├── shared.jsx               ← TOKENS, AppShell, primitives, useT(), Card, Pill, etc.
    ├── connect-shared.jsx       ← StepCard, TokenBlock, SnippetBlock, TestPanel, ClientTile, PrimaryButton/GhostButton
    ├── screen-landing.jsx       ← incl. InstallBand (60-second install band + Works-with strip)
    ├── screen-auth.jsx
    ├── screen-onboarding.jsx              ← post-signup wizard
    ├── screen-connect-claude-desktop.jsx  ← /connect/claude-desktop
    ├── screen-connect-others.jsx          ← /connect/{claude-code, cursor, openclaw, chatgpt}
    ├── screen-mission.jsx
    ├── screen-portfolio.jsx
    ├── screen-plans-list.jsx
    ├── screen-goal-detail.jsx
    ├── screen-plan-tree.jsx
    ├── screen-knowledge-coverage.jsx
    ├── screen-knowledge-timeline.jsx
    ├── screen-knowledge-graph.jsx
    ├── screen-settings.jsx
    ├── screen-settings-integrations.jsx   ← active connections + per-client tabs
    ├── screen-public.jsx
    └── screen-explore.jsx
```

## Screens at a glance

The product surface, top of funnel → bottom:

**Pre-app (marketing + activation)**

| # | Screen | Status | Notes |
|---|---|---|---|
| 1 | **Landing** | Greenfield | Marketing site. Now ends with `InstallBand` — a 60-second install pitch + Works-with strip linking into `/connect/*`. |
| 2 | **Auth (signup)** | Real | Replaces existing auth flow. Login uses same shell. |
| 14 | **Onboarding wizard** | Real | Soft-locks dashboard until `briefing()` succeeds. 3 steps. |
| 15 | **/connect/claude-desktop** | Real | Lead install path — `.mcpb` + paste + test. |
| 16 | **/connect/claude-code** | Real | Per-project (`.mcp.json`) or global. One npx command. |
| 17 | **/connect/cursor** (also VS Code, Windsurf, Cline) | Real | One JSON snippet, four config locations. |
| 18 | **/connect/openclaw** | Real | Skill model. Polls for first inbound call instead of round-tripping. |
| 19 | **/connect/chatgpt** | Real | HTTP MCP — server URL + bearer token. |

**In-app**

| # | Screen | Status | Notes |
|---|---|---|---|
| 3 | **Mission Control** | Real + proposed | Replaces `Dashboard.tsx`. BDI dial is proposed. |
| 4 | **Strategic Overview** | Real | New surface. All data exists; aggregations are new. |
| 5 | **Plans Index** | Real | Replaces existing plans list. |
| 6 | **Goal Detail** | Real + proposed | Replaces `GoalDetail.tsx`. Goal Compass is proposed. |
| 7 | **Plan Tree** | Real | Replaces `PlanVisualizationEnhanced.tsx`. |
| 8 | **Knowledge — Coverage** | Real + proposed | `briefing.knowledge` exists; coverage roll-up is proposed. |
| 9 | **Knowledge — Timeline** | Real | Episodes already exist. |
| 10 | **Knowledge — Graph** | Proposed | Requires entity extraction (new). |
| 11 | **Settings** | Real | Profile, Org, Tokens, Notifications, Billing, Danger zone. |
| 20 | **Settings → Integrations** | Real | Active connections table (live polling) + per-client tabs. Replaces older Settings → MCP tab. |

**Public**

| # | Screen | Status | Notes |
|---|---|---|---|
| 12 | **Public Plan** | Real | Read-only sharing surface. |
| 13 | **Explore** | New | Needs publishing/forking infra. |

See `04-data-model-mapping.md` for the field-by-field reconciliation. See `05-build-order.md` for a recommended phasing.

## Critical guidance for the implementing engineer

1. **Build the connection flow first.** Onboarding wizard + the five `/connect/*` pages + Settings → Integrations are Phase 1 in `05-build-order.md`. Every other in-app surface assumes a connected agent. The shared primitives in `connect-shared.jsx` (StepCard, TokenBlock, SnippetBlock, TestPanel, ClientTile) carry that whole funnel.
2. **Use the existing codebase's primitives.** Tailwind, Radix, the project's `Button`, `Card`, `Tabs`, etc. Do not import `shared.jsx` style objects — re-express them as Tailwind classes against the tokens in `02-design-tokens.md`.
3. **The visual language matters.** The amber-on-warm-neutral palette and the mono-uppercase metadata kickers are load-bearing. Don't drift toward generic shadcn defaults.
4. **Mind the proposed-vs-real boundary.** Anything labeled "Proposed" in the designs is a new feature, not a re-skin. Ship the structural wins first; gate proposed features behind backend work. See `04-data-model-mapping.md`.
5. **Build the shared chrome first.** `AppShell` (rail nav), `Card`, `Pill`, `SectionHead`, `Mono` label primitive, `StatusDot`. Every screen depends on these.
6. **Tabs in Knowledge are 3 separate routes,** not lazy panels — Coverage / Timeline / Graph each have distinct layouts and toolbars.
7. **Both dark and light themes must work.** The current product is dark-only; light-mode parity is part of this redesign.
8. **Settings → Integrations replaces the old MCP snippet card.** Don't ship both. The active-connections table (with 10s polling) is the source of truth for "what tokens exist and are they alive?".

## Asset notes

No images are used in the designs — every visual is CSS, SVG, or composed from typography. Avatars are rendered as monogram circles. The diamond logo `◆` is rendered as a glyph; if you want a real mark, the closest equivalent is a 45°-rotated rounded square in `--amber`.

Fonts are Google Fonts: Space Grotesk (display + body) and JetBrains Mono (mono). The codebase already loads these — confirm before adding.

## How to read the JSX files

Each `screen-*.jsx` is a single function component plus local sub-components. Theme is passed as a `theme="dark" | "light"` prop and resolved via `useT(theme)` to a token object. Inline styles read from those tokens. **Translation pattern:**

```jsx
// Design source:
<div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 10 }}>

// Target (Tailwind + CSS vars):
<div className="bg-surface border border-border rounded-[10px]">
```

Define the tokens once in your Tailwind config (see `02-design-tokens.md`) and let the existing dark/light class-toggle drive theming.
