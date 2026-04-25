# 01 — Screen specs

One section per screen. Each entry covers: **purpose**, **layout**, **key elements**, **interactions**, **states**, and a **fidelity note** flagging anything that needs decisions during implementation.

Refer to `designs/AgentPlanner.html` for visual ground truth and `04-data-model-mapping.md` for the data behind each element.

---

## 1. Landing (`screen-landing.jsx`)

**Purpose:** Marketing front door. One scrolling page selling the "agents that share your plans" thesis.

**Layout:**
- Slim public top bar (logo · `Product / Plans / Docs` · `Sign in` + amber `Get started` CTA)
- Hero: kicker `◆ AI-FIRST AGENT COORDINATION`, headline, sub-copy, two CTAs
- Three-column principles ("Plans, not chats" / "Beliefs over context" / "Coordinate, don't orchestrate")
- Sample plan-tree preview (static rendering of a Plan Tree row stack — reuse `PlanRow` style)
- Quote / testimonial block
- Footer with diamond mark + sitemap

**Key copy:** see source for exact strings; treat them as final.

**Interactions:** purely scroll + CTA clicks. No app state.

**States:** desktop only at handoff fidelity. Implementer should add a mobile breakpoint.

**Fidelity note:** No real screenshots — the in-page plan preview is composed from app primitives. Keep it that way; don't drop in a marketing illustration.

---

## 2. Auth (`screen-auth.jsx`)

**Purpose:** Sign up / log in.

**Layout:** Two-column split (1.1fr / 1fr).
- Left: dark manifesto panel — diamond logo, tagline, three-line value prop, small "live" agent ticker.
- Right: form panel — title, three SSO buttons (Google / GitHub / SAML) over an `or continue with email` divider, email + password fields, primary `Create account` button, secondary "already have an account" link.

**Interactions:** standard auth.

**States:** signup is the default. Login reuses the same shell with one fewer field and swapped copy.

**Fidelity note:** Confirm SAML availability with backend before shipping the SSO row. If unavailable, drop to Google + GitHub only.

---

## 3. Mission Control (`screen-mission.jsx`)

**Purpose:** "What needs me right now?" — the daily landing page after login. Replaces `Dashboard.tsx`.

**Layout:** AppShell rail + main column.
- **Top strip:** title `Mission Control` + theme toggle + `Awaiting your call (N)` pill.
- **BDI Coherence Dial** (proposed) — radial gauge with three concentric arcs (Beliefs / Desires / Intentions). Wrapped in `<ProposedChip>`.
- **Decisions queue** — `Awaiting your call` list of `<DecisionRow>`s.
- **Goal constellation** — grid of `<GoalConstellationCard>`s with title, type chip, progress bar, health pulse, 7-day velocity sparkline (proposed), last-activity timestamp, contradictions count.
- **Today's pulse** — narrow column with recent agent activity.

**Interactions:**
- Click decision → opens decision modal (reuse existing).
- Click goal card → routes to Goal Detail.
- Dial is presentational; tooltip on hover explains coherence score.

**States:**
- Empty (no goals) — large empty state with `Create your first goal` CTA.
- All-clear (zero decisions) — decisions queue collapses to a single positive line.

**Fidelity note:** The BDI Dial is **proposed**. Until backend exposes a coherence score, render computed: green if no contradictions and no stale beliefs >7d, amber otherwise. See `04-data-model-mapping.md`.

---

## 4. Strategic Overview (`screen-portfolio.jsx`)

**Purpose:** Cross-portfolio view: "where is attention concentrated, and what should I do next?"

**Layout:**
- **Attention spectrum** — horizontal heatline with 5 buckets (Stale / Needs input / In motion / Finish line / Done) sized proportionally.
- **Next up** — numbered list of suggested next actions with mode chip (research/plan/execute) and "unblocks N" hint.
- **Portfolio plans** — compact rows: title + goal tether + progress bar + meta.
- **Goals alignment list** — secondary right column.

**Interactions:** click any spectrum bucket to filter Plans Index. Click a Next-up row to open the task.

**States:** empty portfolio rolls up into a single "all caught up" line.

**Fidelity note:** Next-up is **proposed** — needs either an agent endpoint or a heuristic ranker. See `04-data-model-mapping.md`.

---

## 5. Plans Index (`screen-plans-list.jsx`)

**Purpose:** All plans, filterable. Replaces existing plans list.

**Layout:**
- Top bar: title + filter pills (`All / Active / Stale / Public / Mine`) + sort + new-plan button.
- Stack of `<PlanRow>`s. Each row: status spine (3px left bar), title + chips (public/stale/decisions count), goal tether (`↳ Ship Atlas v2.0`), agents-live indicator, segmented progress bar (done / doing / blocked stacked), inline counts.

**Interactions:** click row → Plan Tree. Hover reveals quick actions (open / share / archive). Filter pills are mutually exclusive within their group.

**States:**
- Empty workspace — illustration + `Create your first plan`.
- No matches for filter — inline message + clear-filter link.

**Fidelity note:** Stale flag is computed (`now - updated_at > 5d`) — confirm threshold with PM.

---

## 6. Goal Detail (`screen-goal-detail.jsx`)

**Purpose:** Single goal: briefing, plans, beliefs, activity. Replaces `GoalDetail.tsx`.

**Layout:**
- **Header:** title + type chip + progress + health pill. **No** "stale beliefs" pill in header (was there in earlier iterations — removed).
- **Tabs:** `Overview / Plans / Beliefs (proposed) / Activity`.
- **Overview:**
  - Briefing card (left, ~60%): goal description + structured briefing fields.
  - Goal Compass (right, proposed): circular diagram with 4 cardinal axes — Beliefs / Desires / Intentions / Constraints. Wrapped in `<ProposedChip>`.
  - Tension Hotspots list (proposed): contradictions and stale beliefs detected from `briefing.knowledge`.
  - Critical-Path Subway (proposed): horizontal subway-map of the longest path through the plan DAG.
- **Plans tab:** linked plans, reuse `<PlanRow>`.
- **Beliefs tab (proposed):** structured view of `briefing.knowledge.facts` with `<ProposedChip>` in the tab header.
- **Activity tab:** event log filtered to this goal.

**Interactions:**
- Compass axes are clickable → scroll to relevant section.
- Tension hotspot rows expand to show source facts.

**States:** zero-plan goal shows briefing + `Create plan` CTA only; Compass renders with reduced detail.

**Fidelity note:** Compass / Tensions / Subway are **all proposed**. Ship Briefing + Plans + Activity tabs in phase 1; gate the rest behind backend work. See `05-build-order.md`.

---

## 7. Plan Tree (`screen-plan-tree.jsx`)

**Purpose:** Single plan, full hierarchy + detail panel. Replaces `PlanVisualizationEnhanced.tsx`.

**Layout:**
- **Top bar:** plan title + status chip + goal tether + "agents live" indicator + share/settings.
- **Two-column body:**
  - Left: indented tree of `<PlanTreeRow>`s. Each row: status glyph, title, type chip (`milestone/task/subtask`), agent assignee. **No** belief/coherence chips on rows (removed in current iteration).
  - Right: detail panel with tabs `details / comments / logs` (real backend tabs). 
    - `details` — assignee, dependencies, knowledge gap, description.
    - `comments` — threaded comments.
    - `logs` — chronological list of events using real event kinds: `log_added`, `status_change`, `comment`.

**Interactions:** click row → loads detail panel. Drag to reorder (existing). Keyboard arrows to navigate tree.

**States:** empty plan shows "Add your first task" CTA in tree column.

**Fidelity note:** **The `details / comments / logs` tab labels and event-kind enum are load-bearing** — verify these match your current schema before building. Earlier design iterations referenced a fictional "Reasoning trace" tab; that has been removed.

---

## 8. Knowledge — Coverage (`screen-knowledge-coverage.jsx`)

**Purpose:** "Where is my agents' knowledge thin?" — coverage gauge per goal/plan.

**Layout:**
- Knowledge header with tabs: `Coverage / Timeline / Graph`.
- Per-goal cards, each with:
  - Coverage gauge (circular percentage)
  - Plan list, each plan showing per-task knowledge status (covered / gap / conflict / stale) as colored dots.
- Right rail: list of detected gaps and conflicts.

**Interactions:** click gap → opens task in Plan Tree. Click conflict → opens Tensions section in Goal Detail.

**States:** zero-knowledge state shows `Your agents haven't logged any beliefs yet`.

**Fidelity note:** Coverage roll-up is **proposed** — needs aggregation endpoint. See `04-data-model-mapping.md`.

---

## 9. Knowledge — Timeline (`screen-knowledge-timeline.jsx`)

**Purpose:** Chronological feed of agent reasoning episodes.

**Layout:**
- Knowledge tabs.
- Vertical timeline with day-grouped episodes. Each episode card: timestamp, agent attribution, plan reference, content excerpt, optional entity-extraction chips (subj-rel-obj triples), optional contradiction marker.
- Right rail: filter by agent / plan / episode type.

**Interactions:** click episode → expand to full content. Click plan reference → routes.

**States:** empty timeline = `No episodes yet`.

**Fidelity note:** Entity-extraction chips and contradiction markers are **proposed** (need NLP pipeline). The episode list itself is real and ready to ship today.

---

## 10. Knowledge — Graph (`screen-knowledge-graph.jsx`)

**Purpose:** Entity-relation graph derived from episodes and facts.

**Layout:**
- Knowledge tabs.
- Pannable canvas with positioned entity nodes + labeled edges. Cross-plan entities have an amber dashed ring; contradiction edges are red dashed.
- Right rail: entity inspector (title, connections list, recent facts).

**Interactions:** pan/zoom, click node → inspector, drag to reposition.

**States:** empty graph = `Run an agent to populate the graph`.

**Fidelity note:** **This entire screen is gated on backend NLP work** (entity + relation extraction). Phase 4. Use **react-flow** or **d3-force** for layout — do not hand-position. The hand-positioned design is a visual reference only.

---

## 11. Settings (`screen-settings.jsx`)

**Purpose:** Workspace configuration: agents, MCP setup, API tokens.

**Layout:**
- Left rail: section list (Workspace / Agents / MCP / Tokens / Members / Billing).
- Right pane: section content.
- **Agents:** list of connected agents with via-chip (mcp/rest), live-status dot, plans count, last-active.
- **MCP:** code snippet card with client-tab selector (Claude Desktop / Cursor / etc.) + copy button. Static template + injected API key.
- **Tokens:** rows with token name, permissions chips, created date, revoke action.

**Interactions:** standard CRUD. Copy button toasts.

**States:** standard.

**Fidelity note:** Mostly real; this is a re-skin of existing surfaces. **The MCP-snippet card from earlier iterations has been superseded by the dedicated `/connect/<client>` pages and the new Settings → Integrations panel** (specs 14–20). Settings still owns Profile, Org, Tokens, Notifications, Billing, Danger zone — just hand connection setup off to those pages.

---

## 14. Onboarding wizard (`screen-onboarding.jsx`)

**Purpose:** First-run experience after signup. Soft-locks the dashboard until the user has connected an agent and proven it works with a successful `briefing()` call. The dashboard skeleton renders behind a translucent veil so the user can see what they're unlocking.

**Layout:** Single-page, centered (max 720px). Three numbered `<StepCard>`s on a vertical rail.
- **Header:** kicker `◆ WELCOME TO AGENTPLANNER`, headline "Connect your first agent", value-prop subline, `Skip for now →` link top-right.
- **Progress strip** above the steps — three pills with status dots (done / active / pending).
- **Step 1 — Choose your agent.** Tile picker (`<ClientTile>`) with five clients; "Easiest" amber badge on Claude Desktop. Once chosen, collapses to a compact "Claude Desktop · Change" tile.
- **Step 2 — Install + paste token.** Two side-by-side cards: download `.mcpb` (left) and `<TokenBlock>` with copy button (right). Hint about the pre-filled API URL.
- **Step 3 — Run a test call.** "Test connection" button → on success, `<TestPanel>` renders the briefing payload (Goals/Plans/Decisions/Beliefs counts in 4 stat cards). Footer with `Open dashboard →` primary CTA.

**Interactions:**
- Steps progressively reveal — Step 2 is hidden/dimmed until Step 1 is done.
- "Test connection" hits `/api/agents/test` (or equivalent) and renders one of three states: idle / success / error. Error has plain-English title, expandable technical details, and Retry / Get help actions.
- "Skip for now" routes to dashboard but the lock veil persists — a "Connect an agent" banner stays at the top of every in-app page until cleared.

**States:**
- Step 1 active (no client picked) — only Step 1 is interactive.
- Step 2 active — token visible.
- Step 3 success — green panel with briefing.
- Step 3 error — red panel with retry.

**Fidelity note:** The token shown is generated server-side at signup and tied to the workspace. Do not let users paste their own. The error panel's plain-English copy is load-bearing — see `04-data-model-mapping.md` for the error→copy table.

---

## 15. /connect/claude-desktop (`screen-connect-claude-desktop.jsx`)

**Purpose:** Single-purpose install page for the lead path. Bookmarkable, linkable, embedded into Settings → Integrations as a tab. Same content the wizard uses, but standalone.

**Layout:** Top bar (logo + Connect kicker + Other clients / Docs links), large header with monogram tile + headline + subline, three `<StepCard>`s.
- **Step 1:** Download `.mcpb` card with file metadata (`v0.9.2 · 2.4 MB · macOS / Windows · signed`) and primary download button.
- **Step 2:** "Double-click the file" — `<TokenBlock>` + a dashed-border hint card explaining the pre-filled API URL.
- **Step 3:** "Test the connection" — emerald button + inline `<TestPanel>` success state with briefing.
- **Footer:** "Using a different agent?" strip linking to the four other `/connect/*` pages.

**Interactions:** identical to wizard Step 3.

**States:** standalone idle (before test), success, error (mirrors onboarding error state).

**Fidelity note:** This page is referenced from the marketing landing's `Install in Claude Desktop` CTA — direct link without requiring signup-first if user has a token in URL hash.

---

## 16. /connect/claude-code (in `screen-connect-others.jsx`)

**Purpose:** Per-project (recommended) or global setup for Claude Code.

**Layout:** Same shell as 15. Mode selector at top — two pills (`Per-project` selected, `Global` alternative). Steps:
- **Step 1:** `<SnippetBlock>` with `npx agent-planner-mcp setup --token …` (token inlined, amber).
- **Step 2:** `/mcp reload` snippet for in-session refresh.
- **Step 3:** Test + briefing panel.

**Interactions:** Mode pills swap the snippets. Per-project writes `.mcp.json` to project root; Global edits the user's Claude Desktop config.

**Fidelity note:** Both modes call the same MCP server — the only difference is config location. Confirm the npx package name is correct before shipping.

---

## 17. /connect/cursor (in `screen-connect-others.jsx`)

**Purpose:** One snippet, four editors (Cursor / VS Code / Windsurf / Cline).

**Layout:**
- **Step 1:** Multi-line JSON `<SnippetBlock>` showing the full `mcpServers` config with the token highlighted in amber.
- **Step 2:** Path table — four rows (editor name + config path + optional `per-project` tag).
- **Step 3:** Test + briefing.

**Fidelity note:** Don't fork this into four separate pages. Single page with a path table is the explicit design choice — the JSON is identical across editors.

---

## 18. /connect/openclaw (in `screen-connect-others.jsx`)

**Purpose:** OpenClaw runs the agent on its own VM, so the test model is different — we can't round-trip a `briefing()` because we can't initiate the call. Instead, we wait for the agent's first inbound call.

**Layout:** Four steps:
- **Step 1:** `openclaw skills install agentplanner`
- **Step 2:** `openclaw secrets set AP_TOKEN <token>`
- **Step 3:** `openclaw agent restart`
- **Step 4:** "Watch for first call" — amber pulsing pill with "Waiting for first call… 00:24 / 01:00" countdown, plus an empty "Recent inbound calls (this token)" panel that fills as calls arrive.

**Interactions:** Polls `/api/integrations/inbound-calls?token=…` every 2s for 60s, then offers a Retry. Marks connected on first call.

**Fidelity note:** This is the only `/connect/` page that doesn't end with a green `<TestPanel>` — the success state is "we saw a call from your agent." Style it identically (emerald panel, briefing-equivalent stats) once the call arrives.

---

## 19. /connect/chatgpt (in `screen-connect-others.jsx`)

**Purpose:** Custom GPT setup via HTTP MCP.

**Layout:** Three steps:
- **Step 1:** MCP server URL — `https://agentplanner.io/mcp` in a `<SnippetBlock>`.
- **Step 2:** Authorization header `Bearer <token>`.
- **Step 3:** Test + briefing.

**Fidelity note:** ChatGPT custom-GPT MCP support is the dependency here — confirm the spec URL is current.

---

## 20. Settings → Integrations (`screen-settings-integrations.jsx`)

**Purpose:** Steady-state connection management. The trust layer — answers "what tokens exist? where are they being used? are they alive?". Replaces the older Settings → MCP tab entirely.

**Layout:**
- Settings rail unchanged; **Integrations** is one section in it (4 connections shown in description).
- **Top bar:** "Connected agents" title + "4 connected · 1 idle · 1 token never used" subline + amber `+ Connect a new agent` primary button.
- **Tabs:** `Active connections` (default, with count chip) + one tab per client (`Claude Desktop / Claude Code / Cursor / OpenClaw / ChatGPT`). Per-client tabs render the same content as the corresponding `/connect/<client>` page, embedded.
- **Live indicator strip:** pulsing emerald dot + "LIVE · refreshes every 10s" + filter/sort controls right.
- **Connections table** (`<Card pad={0}>`):
  - Column headers: Token / Last call / Status / Origin / 7-day calls / (actions).
  - Each row: token name + permission chips (read/write/admin) + created date; last tool name + relative time; status (Live + pulse / Idle / Never used); origin client + IP; 7-day call count; `⋯` action menu.
  - **Selected row expands inline** with two-column detail: recent tool calls table (time/tool/args/ms) + actions stack (Rotate token / Test / Edit permissions / Revoke).

**Interactions:**
- Click row → expand inline (only one expanded at a time).
- Filter pill cycles through `All / Live / Idle / Never used`.
- Sort dropdown: Last seen / Created / Calls (7d).
- `+ Connect a new agent` opens the same flow as the onboarding wizard, scoped to a fresh token.
- Per-client tab → embedded `/connect/<client>` page.

**States:**
- Empty (no tokens) — single row with `Connect your first agent` CTA.
- All-idle — strip changes to "0 live · N idle".
- Token revoked — row stays for 7 days with `revoked` chip, then disappears.

**Fidelity note:** **Polling is bandwidth-cheap because the API only returns deltas** — implement with `If-Modified-Since` or a simple `?since=<ts>` query. Don't burn the user's mobile data on a full table refetch every 10s.

---

## 12. Public Plan (`screen-public.jsx`)

**Purpose:** Read-only public view of a published plan.

**Layout:**
- Public top bar (logo + `Fork` + `Sign in`).
- Plan header with title, owner, last updated, fork count.
- Read-only plan tree (simplified rows — no agent indicators, no decisions).
- Right column: recent beliefs digest (public-flagged subset of `briefing.knowledge.facts`).

**Interactions:** `Fork` → if logged in, duplicates plan into your workspace; else routes to signup with intent. Tree is non-interactive.

**States:** unpublished plan returns 404.

**Fidelity note:** Forking endpoint is **new** — needs duplicate-plan API. Read-only render reuses Plan Tree primitives.

---

## 13. Explore (`screen-explore.jsx`)

**Purpose:** Discovery surface for public plans. Marketing-flavored.

**Layout:**
- Public top bar.
- Hero: featured plan-of-the-week (large editorial card).
- Category strip (chips).
- Grid of plan cards: title, owner, plan-shape sparkline, star/fork counts, category chip.

**Interactions:** filter by category, click plan → Public Plan view.

**States:** empty catalog (early days) — show curated "Try one of these" defaults.

**Fidelity note:** **Entire screen depends on publishing/catalog infra** (slugs, snapshots, star/fork counts, categories). Phase 4. See `05-build-order.md`.
