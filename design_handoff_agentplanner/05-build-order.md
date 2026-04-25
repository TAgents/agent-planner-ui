# 05 — Build order

A recommended phasing. Each phase is independently shippable. Total estimate is for one full-stack engineer working with Claude Code.

---

## Phase 0 — Foundation (3–5 days)

**Goal:** Set up tokens, theming, and shared chrome so every subsequent phase is just composition.

1. Add Tailwind tokens + CSS vars from `02-design-tokens.md`. Wire dark/light class toggle.
2. Load Space Grotesk + JetBrains Mono.
3. Build shared chrome components from `03-component-inventory.md`:
   - `<AppShell>`, `<Card>`, `<Pill>`, `<SectionHead>`, `<Mono>`, `<StatusDot>`, `<ProposedChip>`
4. Replace existing primary `<Button>` styles to match (text on amber for primary, ghost for secondary).
5. Set up Storybook entries for the chrome components (optional but worth it).

**Ship gate:** chrome renders cleanly in both themes; existing pages still work because nothing's been rewired yet.

---

## Phase 1 — Connection flow (1–1.5 weeks)

**Goal:** Get every new user to a working agent connection. **Do this first** — every other in-app surface is downstream of "did the user actually connect an agent?". The visual primitives (`StepCard`, `TokenBlock`, `SnippetBlock`, `TestPanel`, `ClientTile`) are reused across onboarding, all five `/connect/*` pages, and Settings → Integrations.

1. **`connect-shared` primitives** from `03-component-inventory.md` (StepCard, TokenBlock, SnippetBlock, TestPanel, ClientTile, PrimaryButton, GhostButton).
2. **Test-connection endpoint** that round-trips a `briefing()` and returns either the payload or a structured error matching the **error copy table** in `04-data-model-mapping.md`.
3. **`.mcpb` release metadata endpoint** (`/api/releases/mcpb/latest`).
4. **Onboarding wizard** — soft-locks dashboard until `briefing()` succeeds. The "Skip for now" path leaves a persistent `Connect an agent` banner at the top of every in-app page.
5. **/connect/claude-desktop** (lead path).
6. **/connect/claude-code** + **/connect/cursor** + **/connect/chatgpt** — same shell, different snippets.
7. **/connect/openclaw** — needs the inbound-call polling endpoint.
8. **Marketing landing's `InstallBand`** — second hero with Works-with strip linking into the `/connect/*` pages.

**Ship gate:** new users can sign up and have a working agent connection in under 60 seconds. Activation is measurable.

---

## Phase 2 — Structural wins (1.5–2 weeks)

**Goal:** Replace the in-app surfaces that map cleanly to existing data. No proposed BDI features yet.

1. **Plans Index** — `<PlanRow>` + filter pills + sort. Replaces existing plans list.
2. **Plan Tree** — replaces `PlanVisualizationEnhanced.tsx`. Critical: detail panel uses real `details / comments / logs` tabs against `event_kind` enum.
3. **Settings → Integrations** — active connections table with 10s live polling. **This replaces the old Settings → MCP snippet card entirely.** Per-client tabs embed the `/connect/<client>` content from Phase 1.
4. **Settings (rest)** — Profile, Org, Tokens, Notifications, Billing, Danger zone. Mostly visual re-skin.
5. **Auth** — split layout, SSO buttons, workspace-creation form. Keep auth provider integration.
6. **Mission Control (without dial)** — goal cards, decisions queue, today's pulse. **Skip the BDI Coherence Dial for now** — leave a placeholder card.
7. **Goal Detail (without compass)** — header, briefing, plans tab, activity tab. **Skip Goal Compass + Tension Hotspots + Subway** — leave placeholder.

**Ship gate:** all in-app pages have new visuals. Existing functionality preserved. Beliefs/coherence not yet visible.

---

## Phase 3 — Knowledge as a real feature (1–1.5 weeks + backend)

**Goal:** Make `briefing.knowledge` first-class. This is where the BDI metaphor earns its keep.

1. **Knowledge — Timeline** — episodes already exist. Render the chronological view, agent attribution, day grouping. Hide entity-extraction chips and contradiction markers until backend is ready.
2. **Knowledge — Coverage** — needs backend aggregation: `(tasks_with_facts / total_tasks)` per goal/plan. Build endpoint, then UI.
3. **Marketing Landing** — greenfield, builds in parallel with backend work.
4. **Public Plan** — read-only render. Reuses Plan Tree and Beliefs digest.

**Backend work in parallel:**
- Coverage aggregation endpoint
- Stale-fact detection (>5d without referencing episode)
- Optional: simple fact-conflict detection (two facts about same entity with different values)

**Ship gate:** users can see their agents' beliefs and where coverage is thin.

---

## Phase 4 — Strategic surfaces + proposed BDI (2–3 weeks)

**Goal:** Ship the proposed elements that distinguish AgentPlanner.

1. **Strategic Overview** — attention spectrum, next-up, finish-line/needs-input/stale buckets. Most data is real.
2. **BDI Coherence Dial** — wire up to coherence-score computation. Land in Mission Control.
3. **Goal Compass** — wire up `briefing.knowledge` axes in Goal Detail.
4. **7-day velocity sparkline** — aggregate from `status_change` events.
5. **Tension Hotspots + Critical-Path Subway** — Goal Detail. Subway needs longest-path computation.

**Ship gate:** the metaphor is visible end-to-end.

---

## Phase 5 — Network effects (3–4 weeks, mostly backend)

**Goal:** Make plans something people share and discover.

1. **Plan publishing infrastructure** — public catalog, slugs, snapshots.
2. **Plan forking** — duplicate plan into another workspace.
3. **Explore** — catalog browse with categories, featured plan, star/fork counts.
4. **Knowledge — Graph** — entity extraction (NER + relation extraction) on episodes and facts. Use react-flow for layout. Inspector rail.

**Ship gate:** fully realized vision.

---

## What to skip (for now)

Things in the designs you can defer indefinitely:

- The Knowledge Graph view if entity extraction is not on the roadmap. Coverage + Timeline cover most user needs.
- Light theme if your users are dev tools / engineering audience. Dark-only is acceptable but **build with tokens** so you can light-mode later for free.
- The Explore page if you don't have publishing infra. Public plan view alone is fine.

---

## Risks / things to watch

1. **The BDI metaphor is load-bearing in the visual system but proposed in the data model.** If Phase 3 slips, the dial/compass become permanent placeholders. Be honest with stakeholders about what's real.
2. **The `<ProposedChip>` pattern** is your safety valve — anywhere you ship UI for not-yet-real data, mark it. Users tolerate "Coming soon" chips; they don't tolerate broken-looking dials.
3. **Plan Tree event taxonomy.** The redesign hard-codes `details / comments / logs` tabs and `log_added / status_change / comment` event kinds. **Verify these match your current schema before building** — earlier iterations of the design used a fictional "Reasoning trace" tab that has been removed but may linger in older comments.
4. **Light/dark parity.** Light mode was added late; some of the more elaborate SVG components (BDI Dial, Goal Compass, Knowledge Graph) were tuned for dark. Test each in light mode and adjust contrast as needed.
5. **No icon library committed.** The designs use Unicode glyphs as a deliberate choice. If you adopt Lucide or similar, **keep the glyph for the kicker `◆`** — it's brand. Icons elsewhere are fine.

---

## Recommended Claude Code prompts

When you start, paste this README into your Claude Code session and say:

> Read the design handoff in `design_handoff_agentplanner/`. We're starting Phase 0. Read the existing codebase to understand current Tailwind config, theming, and component patterns. Then propose a concrete diff for adding the design tokens from `02-design-tokens.md` without breaking existing screens. Don't write code yet — show me the plan.

Then work phase-by-phase. Each phase, paste the relevant sections from `04-data-model-mapping.md` so Claude Code knows what's real vs proposed.
