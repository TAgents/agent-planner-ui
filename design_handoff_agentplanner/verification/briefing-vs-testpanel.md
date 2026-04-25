# Verification — `briefing()` shape vs onboarding TestPanel

Phase 6 task `a65a7f2c-0fd7-4c9a-88ac-172c8fb479a7`. Run before the
onboarding wizard's soft-lock ships, so the TestPanel "stat cards"
have data to render.

## What TestPanel expects

Per `designs/connect-shared.jsx` (lines 132–177) and the four
`/connect/*` design files, the success-state TestPanel renders a
4-column grid of cards, one per item in:

```ts
briefing: Array<{ label: string; value: string; sub?: string }>
```

The reference designs (`screen-onboarding.jsx` line 17,
`screen-connect-claude-desktop.jsx` line 8) use these four cards:

| Label | Value (mock) | Sub |
|---|---|---|
| Goals | `6` | `4 active · 2 paused` |
| Plans | `12` | `3 in motion` |
| Decisions | `0` | `Awaiting you` |
| Beliefs | `847` | `Across all goals` |

## What `briefing()` actually returns

Source: `agent-planner-mcp/src/tools/bdi/beliefs.js` `briefingHandler`,
which fans out to four API calls and composes the result:

```ts
{
  goal_health: {
    summary: { on_track, at_risk, stale, total },     // → "Goals" card
    goals: Array<{ id, title, health, ... }>
  },
  pending_decisions: Array<...>,                       // → "Decisions" card
  pending_agent_requests: Array<...>,
  my_tasks: { in_progress, blocked, recently_completed },
  recent_activity: Array<episode>,                     // last N hours of episodes
  top_recommendation,
  coherence_pending,
  meta: { partial, failures }
}
```

## Mapping each card

| Card | Source | Notes |
|---|---|---|
| **Goals** | `goal_health.summary.total` | ✅ Present. Sub: `${on_track} on track · ${at_risk} at risk` (mock said "active · paused" but those statuses don't exist in the data model — substitute health buckets which agents already understand). |
| **Plans** | ❌ **Not in briefing** | Available via `GET /dashboard` → `active_plans_count`, but briefing doesn't include it. |
| **Decisions** | `pending_decisions.length` | ✅ Present. Sub: `Awaiting you` (literal). |
| **Beliefs** | ❌ **Not in briefing** | `recent_activity.length` is *recent* episodes only (last 24h default); not a total. The `/dashboard` summary has `knowledge_entries_count` but it's hardcoded to `0` in `dashboard.routes.js:63`. Total entity count requires a Graphiti `find_entities`/graph-search call. |

So **2 of the 4 cards have no data path** through `briefing()` today.

## Decision needed

We have two reasonable resolutions; both unblock onboarding but pick
different design directions. Queued as decision (see `queue_decision`
output in this task) — morning review picks A or B.

- **A — Extend briefing()** to include `plans_count`
  (`active_plans_count` from `/dashboard`) and `beliefs_count`
  (Graphiti total entity count, or sum of `goal_health.goals[].knowledge_count`
  if we add it). Onboarding stays a single round-trip; briefing's
  contract grows by 2 numeric fields.
- **B — TestPanel fans out** with 1–2 extra calls (`/dashboard/summary`
  for `active_plans_count`, `/knowledge/episodes` or
  `find_entities` for beliefs total). briefing() stays lean; the
  onboarding network footprint grows.

**Recommendation: A.** briefing() is the *single read* for mission
control state — onboarding is part of mission control. Two cheap
aggregates don't materially affect the response size, and it keeps
the design's "single round-trip success state" intact. (The agent
side already calls briefing first; reusing the same payload for the
human-facing onboarding panel is the point.)

## Pre-check: provenance footer

The TestPanel design ends with:
```
↳ briefing() · 142ms · via Claude Desktop
```

- `briefing()` — literal label, fine.
- `142ms` — needs the API to expose its own server-time, OR the client
  measures `performance.now()` start-finish around the call. Client-side
  timing is fine and matches what users care about (round-trip).
- `via Claude Desktop` — comes from `MCP_CLIENT_LABEL` env var on the
  MCP server (added in `feat/ui-redesign-v1-mcp@2d30d49`). When the
  call is made directly from the web UI (no MCP), this footer should
  read `via web` or be omitted.

No backend changes needed for the provenance line; it composes from
client state.

## Test matrix for the five `/connect/*` panels

Once the briefing extension lands, smoke each panel under three
conditions:

1. **Empty workspace** — fresh user, 0 goals, 0 plans, 0 episodes.
   Expect cards `0 / 0 / 0 / 0` rendered without `NaN` or `undefined`.
2. **Steady state** — user with ≥1 of each. Cards show real values.
3. **Partial failure** — Graphiti unavailable so `beliefs_count` is
   missing. Expect the card to show a `—` placeholder, not crash.

Defer the actual smoke test to the Phase 1 onboarding implementation
task; this verification doc captures the contract assumptions.
