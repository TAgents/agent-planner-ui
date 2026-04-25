# 03 — Component inventory

Two buckets: **shared chrome** (build first; everything depends on these) and **screen-specific** (build per screen).

## Shared chrome (build first)

### `<AppShell>`
The 56px-wide left rail with 4 nav items (Mission, Goals, Plans, Knowledge) plus a footer slot. See `shared.jsx`. Items render as 36px square monogram tiles; active item has amber left-border accent (3px) and `surface-hi` background.

```ts
type AppShellProps = {
  active: 'mission' | 'goals' | 'plans' | 'know';
  children: ReactNode; // main content
};
```

### `<Card>`
Surface with 1px border + 10px radius. Padding is parameterized.

```ts
type CardProps = {
  pad?: number | 0; // 0 = no padding (for cards that contain rows with their own padding)
  children: ReactNode;
  className?: string;
};
```

### `<Pill>`
Tiny rounded chip with semantic color. Uses `<color>-soft` background + `<color>` foreground.

```ts
type PillProps = {
  color: 'amber' | 'emerald' | 'red' | 'violet' | 'slate';
  children: ReactNode;
};
```

### `<SectionHead>`
The mono-uppercase kicker + display-weight title pattern used above every section.

```ts
type SectionHeadProps = {
  kicker?: string;     // e.g. "◆ Next up"
  title: string;       // e.g. "Suggested by your agents"
  right?: ReactNode;   // optional right-aligned slot (Pill, count, button)
};
```

### `<Mono>`
Inline span that renders mono-family text. Pass `style` for size/tracking/case. (In real codebase, prefer Tailwind `font-mono uppercase tracking-[0.18em]` — `<Mono>` exists in the design only because tokens are inline-styled.)

### `<StatusDot>`
6–10px filled circle. Optional outer pulsing ring for "live" agents.

```ts
type StatusDotProps = {
  color: string;        // direct color value
  ring?: boolean;       // shows pulsing ring
  ringColor?: string;
  size?: number;        // default 8
};
```

### `<ProposedChip>`
Small marker indicating "this UI shows a proposed/computed value, not yet a real backend field." Uses violet. Place inline next to the affected element. Important — see data model doc.

### Theming hook
A `useTheme()` returning the resolved token bag is fine, but in the real codebase prefer Tailwind's `dark:` variants against the CSS-var tokens defined in `02-design-tokens.md`.

---

## Screen-specific components

### Mission Control

- **`<BDIDial>`** *(proposed)* — radial gauge of cross-goal "coherence." Three concentric arcs (beliefs / desires / intentions). Show with `<ProposedChip>`. Until the backend exposes a coherence score, render with computed contradiction-count / stale-belief-count. See `04-data-model-mapping.md`.
- **`<DecisionRow>`** — single row in the "Awaiting your call" queue. Avatar + agent · plan + decision title + urgency pill + age + action buttons.
- **`<GoalConstellationCard>`** — goal card with health pulse + 7-day velocity sparkline + activity timestamp.

### Strategic Overview

- **`<AttentionSpectrum>`** — horizontal heatline with 5 buckets (Stale / Needs input / In motion / Finish line / Done), proportional widths.
- **`<NextUpRow>`** — numbered task with mode chip (research/plan/execute) and "unblocks N" hint.
- **`<PortfolioPlanRow>`** — compact plan row with title + tether + progress bar + percentage + meta.

### Plans Index

- **`<PlanRow>`** — full-width plan row with status spine (3px left bar), title, public/stale/decisions chips, goal tether, agents-live indicator, segmented progress bar (done/doing/blocked stacked), and inline counts.

### Goal Detail

- **`<GoalCompass>`** *(proposed)* — large circular diagram with goal at center and 4 cardinal axes (Beliefs / Desires / Intentions / Constraints). Wrap with `<ProposedChip>`.
- **`<TensionHotspots>`** — list of detected tensions (contradictions, stale beliefs).
- **`<CriticalPathSubway>`** — horizontal "subway map" showing the critical path through the plan.
- **`<BeliefsTab>`** *(proposed expansion)* — list of structured beliefs derived from `briefing.knowledge`.

### Plan Tree

- **`<PlanTreeRow>`** — indented tree row with status glyph, title, type chip, agent assignee.
- **`<PlanDetailPanel>`** — right-side details panel with tabs (`details` / `comments` / `logs`). Uses real event kinds: `log_added`, `status_change`, `comment`.

### Knowledge — three lenses

- **`<KnowledgeHeader>`** — shared tab bar across the three Knowledge variants. Title + tab strip (Coverage / Timeline / Graph).
- **Coverage:**
  - `<CoverageGauge>` — circular percentage gauge with stat
  - `<CoveragePlanCard>` — plan with task-by-task knowledge status (covered/gap/conflict/stale)
- **Timeline:**
  - `<TimelineItem>` — episode card on a vertical rail; agent attribution; entity-extraction chips (subject-relation-object); contradiction callout
- **Graph:**
  - `<GraphCanvas>` — pannable SVG with positioned entity nodes + edges. For real codebase, use **`react-flow`** or **`d3-force`** — not hand-positioned coordinates. Cross-plan entities get an amber dashed ring; contradiction edges are red dashed.
  - `<EntityInspector>` — right rail with entity title, connections list, recent facts list.

### Settings

- **`<SettingsRail>`** — left-rail section list with active highlight.
- **`<AgentRow>`** — connected agent with via-chip (mcp/rest), live-status dot.
- **`<MCPSetupCard>`** — code snippet card with client-tab selector and copy button.
- **`<TokenRow>`** — API token row with permission chips.

### Auth

- **`<AuthSplitLayout>`** — 1.1fr / 1fr two-column layout with manifesto on left, form on right. Reused for login.
- **`<SSOButton>`** — full-width SSO button with monogram tile.
- **`<Field>`** — labeled input with hint slot.

### Connection flow (Onboarding + /connect/* + Settings → Integrations)

All of these share `connect-shared.jsx`. Every connection-related screen composes from the same primitives — onboarding wizard, the five `/connect/<client>` pages, and the Integrations panel are the same parts in different arrangements.

- **`<StepCard>`** — numbered step with title, optional subtitle, and slotted content. `state` is `'done' | 'active' | 'pending'`. Done steps collapse content; pending steps render dimmed without content. Number rail is amber for active, emerald-checkmark for done, muted for pending.
  ```ts
  type StepCardProps = {
    n: number;
    title: string;
    subtitle?: string;
    state: 'done' | 'active' | 'pending';
    children?: ReactNode;
  };
  ```
- **`<TokenBlock>`** — single-line API token display with key glyph + monospace token + Copy button. Used in Onboarding step 2, every `/connect/<client>` page, and the inline expand row of Settings → Integrations.
  ```ts
  type TokenBlockProps = { token: string; label?: string | null };
  ```
- **`<SnippetBlock>`** — multi-line code block with optional comment header, language hint, and floating Copy button. `lines` is `Array<string | { text, color?, indent? }>` — pass `color: t.amber` on the line containing the inlined token so it stands out.
  ```ts
  type SnippetBlockProps = {
    comment?: string;
    language?: 'shell' | 'js';
    lines: Array<string | { text: string; color?: string; indent?: number }>;
  };
  ```
- **`<TestPanel>`** — inline result of pressing "Test connection". Three states: `idle` (renders nothing), `success` (emerald panel with 4 briefing stat cards + `↳ briefing() · 142ms · via Claude Desktop` provenance line), `error` (red panel with plain-English title, expandable `<details>` for technical, Retry / Get help actions).
  ```ts
  type TestPanelProps = {
    state: 'idle' | 'success' | 'error';
    briefing?: Array<{ label: string; value: string; sub?: string }>;
    error?: { title: string; plain: string; technical: string };
  };
  ```
- **`<ClientTile>`** — picker tile for a client. Used in onboarding Step 1 and the landing-page Works-with strip. Has `compact` mode for the strip.
  ```ts
  type ClientTileProps = {
    glyph: string;       // 1–3 char monogram
    name: string;        // "Claude Desktop"
    sub: string;         // "One-click .mcpb"
    recommended?: boolean; // amber "Easiest" badge
    active?: boolean;
    compact?: boolean;
  };
  ```
- **`<PrimaryButton>` / `<GhostButton>`** — the canonical button primitives used across the connect flow. PrimaryButton is amber-on-bg; GhostButton is bordered transparent. `large` prop for hero CTAs.
- **`<ConnectPageShell>`** *(in `screen-connect-others.jsx`)* — page chrome shared by the four developer-leaning `/connect/<client>` pages: top bar, header (monogram + kicker + title + subline), children slot, alt-clients footer strip. Filters the current client out of the footer automatically.
  ```ts
  type ConnectPageShellProps = {
    glyph: string;
    kicker: string;
    title: string;
    subtitle: string;
    currentClient: 'claude-desktop' | 'claude-code' | 'cursor' | 'openclaw' | 'chatgpt';
    children: ReactNode;
  };
  ```
- **`<ConnectionRow>`** *(Settings → Integrations)* — single row in the active-connections table. Renders 6-column grid (token / last call / status / origin / 7-day calls / actions). When `c.expanded`, renders an inline detail row beneath with recent tool calls + actions stack.
- **`<InstallBand>`** *(landing page)* — second hero band with 60-second install pitch on the left and Works-with strip on the right.

### Public Plan / Explore

- **`<PublicTopBar>`** — slim public header with "Fork" and "Sign in" actions.
- **`<PlanShape>`** — sparkline-of-bars representing the "shape" of a plan (depth/branching density).
- **`<FeaturedPlanCard>`** — editorial 2-up card for plan-of-the-week.

---

## Components to **drop / replace** from current codebase

Cross-reference your existing source:

| Current component | Disposition |
|---|---|
| `Dashboard.tsx` | Replace with new Mission Control layout. |
| `GoalDetail.tsx` | Replace; reuse data fetching, replace render tree. |
| `PlanVisualizationEnhanced.tsx` | Replace with new Plan Tree. The right detail panel uses `details/comments/logs` tabs against real event kinds. |
| Existing plans list | Replace with `PlansList` layout (status-spine rows). |
| Existing landing page | Replace. |
| Existing auth | Replace shell; keep auth provider integration. |
| Settings → MCP tab (snippet card) | **Replace with Settings → Integrations** (active-connections table) + per-client `/connect/*` pages. The single-snippet card was a stopgap; the new surface is the source of truth. |
| Any "first-run modal" or post-signup redirect | Replace with the new Onboarding wizard, which soft-locks the dashboard until `briefing()` succeeds. |
