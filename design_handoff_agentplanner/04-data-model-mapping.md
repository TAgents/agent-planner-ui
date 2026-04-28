# 04 — Data model mapping

The single most important doc in this handoff. Every UI element below is annotated **Real**, **Proposed**, or **New surface**:

- **Real** — maps directly to existing fields in your codebase. Ship freely.
- **Proposed** — UI shows a **computed or new** value the backend doesn't currently expose. Marked with `<ProposedChip>` in the designs. Either compute client-side from existing data, or add backend endpoint, or feature-flag and ship later.
- **New surface** — a screen that didn't exist; data may exist or may need new endpoints.

References below use the actual codebase types as of the conversation. Confirm field names against current `types/` and adjust if they've drifted.

---

## Mission Control (replaces `Dashboard.tsx`)

| UI element | Status | Source |
|---|---|---|
| Goal cards (title, type, progress) | Real | `Goal.title`, `Goal.type`, computed progress from plan nodes |
| Health (`on_track` / `at_risk` / `stale`) | Real | Goal health enum |
| 7-day velocity sparkline | **Proposed** | Aggregate `node.status_change` events per day. New endpoint or client compute. |
| BDI Coherence Dial (cross-goal) | **Proposed** | Computed: `coherent` if no contradictions and no stale beliefs >7d; `stale_beliefs` if any stale; `contradiction_detected` if conflicting facts. Mark with `<ProposedChip>`. |
| Decisions queue | Real | Existing pending-decision data |
| "Awaiting your call" pill | Real | Count of decisions where `urgency` ∈ {blocking, can_continue} and `assignee = user` |

## Strategic Overview (new surface)

| UI element | Status | Source |
|---|---|---|
| Attention spectrum buckets | Real | Bucket plans by computed status: stale = `last_updated > 5d`, needs-input = pending decisions, finish-line = `progress > 65%`, etc. |
| Next-up suggestions | **Proposed** | Requires "what should I do next?" agent endpoint. Or compute: tasks where `status=todo`, `unblocks_count > 0`, sorted by depth × urgency. |
| Goal alignment list | Real | Existing goal + plan relationships |

## Plans Index (replaces existing plans list)

| UI element | Status | Source |
|---|---|---|
| Plan rows | Real | `Plan.title`, `Plan.status`, `Plan.updated_at`, node counts |
| Goal tether (`↳ Ship Atlas v2.0`) | Real | `Plan.goal_id → Goal.title` |
| Segmented progress (done/doing/blocked) | Real | Aggregate `Plan.nodes[].status` |
| Pending-decisions pill | Real | Count of pending decisions on plan |
| Stale flag | **Computed** | `now - updated_at > 5d` |
| Public flag | Real | `Plan.is_public` |
| Live agents indicator | Real | Active sessions per plan |

## Goal Detail (replaces `GoalDetail.tsx`)

| UI element | Status | Source |
|---|---|---|
| Title, type, progress, health, briefing | Real | `Goal.*` |
| Goal Compass (Beliefs/Desires/Intentions/Constraints axes) | **Proposed** | Layered visualization of `briefing.knowledge` — facts, sub-goals, plan intentions, constraints. Mark with `<ProposedChip>`. |
| Tension Hotspots | **Proposed** | Detected from `briefing.knowledge.contradictions` (if exposed) and stale-fact heuristic. |
| Critical-Path Subway | **Proposed** | Computed longest-path through the plan DAG. |
| Beliefs tab | **Proposed expansion** | Structured view of `briefing.knowledge.facts`. Header chip says "Proposed". |
| Plans tab | Real | Plans linked to goal |
| Activity tab | Real | `event_log` filtered to goal |

## Plan Tree (replaces `PlanVisualizationEnhanced.tsx`)

| UI element | Status | Source |
|---|---|---|
| Tree rows | Real | `Plan.nodes[]` with parent_id |
| Status glyphs / chips | Real | `node.status` |
| Type chips (`milestone`/`task`/`subtask`) | Real | `node.type` |
| **Right detail panel tabs:** `details` / `comments` / `logs` | Real | These are the canonical tabs from your existing event taxonomy. |
| Logs tab uses real event kinds: `log_added`, `status_change`, `comment` | Real | `event_log.event_kind` enum |
| Assignee / Dependencies / Knowledge gap fields | Real | Existing node fields |

**Removed from earlier proposals:** belief/coherence chips on tree rows (was metaphor leak — gone in current design).

## Knowledge — Coverage (new surface, partly proposed)

| UI element | Status | Source |
|---|---|---|
| Per-goal coverage % | **Proposed** | `(tasks_with_supporting_facts / total_tasks)` — compute from `briefing.knowledge.facts[].linked_task_ids`. |
| Per-task knowledge status (covered/gap/conflict/stale) | **Proposed** | Coverage roll-up. Requires backend aggregation or client compute. |
| Sample facts | Real | `briefing.knowledge.facts[].text` |

## Knowledge — Timeline (new surface, mostly real)

| UI element | Status | Source |
|---|---|---|
| Episode entries (time, name, agent, plan, content) | Real | `episodes[]` (already in model) |
| Entity-extraction chips (subj-rel-obj triples) | **Proposed** | Requires entity extraction pipeline. Hide until shipped. |
| Cross-plan flag | **Computed** | Episode references multiple plans |
| Contradiction marker | **Proposed** | Requires fact-conflict detection |

## Knowledge — Graph (new surface, fully proposed)

| UI element | Status | Source |
|---|---|---|
| Entity nodes | **Proposed** | Requires entity extraction (NER on episodes / facts) |
| Edges with relation labels | **Proposed** | Requires relation extraction |
| Cross-plan ring | **Proposed** | Computed from entity → episode → plan_id |
| Contradiction edges | **Proposed** | Requires conflict detection |

**This entire screen is gated on backend NLP work.** Ship Coverage and Timeline first; Graph last.

## Onboarding wizard (real)

| UI element | Status | Source |
|---|---|---|
| Pre-generated workspace token | Real | Issued at signup; scope = workspace, perms = `admin` |
| Step 1 client tiles | Real | Static list of 5 clients; "Easiest" badge is editorial |
| Step 2 download URL | Real | `https://releases.agentplanner.io/agent-planner.mcpb` (signed) |
| Step 3 "Test connection" | Real | Calls `briefing()` through the user's just-installed client. Renders the same payload Mission Control uses. |
| Briefing stat cards (Goals/Plans/Decisions/Beliefs) | Real | Counts already in `briefing()` response |
| `↳ briefing() · 142ms · via Claude Desktop` provenance | Real | `tool_calls.duration_ms`, `tool_calls.client_label` |
| Error → plain-English copy table | **New mapping** | See below |

**Error copy table** (load-bearing — write these once and reuse across onboarding + every `/connect/*` page):

| Backend code | Plain title | Plain copy |
|---|---|---|
| `auth/invalid_token` | "We didn't recognize that token" | Double-check you pasted the whole token (it starts with `ap_live_`). |
| `network/timeout` | "Your agent didn't reach us" | Looks like a network or firewall issue. We waited 10 seconds and didn't hear back. |
| `mcp/version_mismatch` | "Your client is too old" | Update Claude Desktop to v0.9 or later, then try again. |
| `auth/revoked` | "This token was revoked" | Generate a new token in Settings → Integrations. |
| `unknown` | "Something went wrong" | (Show technical details by default; offer Get help.) |

## /connect/* pages (real)

| UI element | Status | Source |
|---|---|---|
| Token shown in snippets / `<TokenBlock>` | Real | Same workspace token issued at signup; user can override via `?token=` query if revisiting from email |
| `.mcpb` filename + version + size | Real | Latest signed release metadata from `/api/releases/mcpb/latest` |
| Cursor/VS Code/Windsurf/Cline config paths | Real (static) | Hard-coded — match each editor's docs |
| OpenClaw "Waiting for first call" countdown | Real | Polls `/api/integrations/inbound-calls?token=…&since=<ts>` every 2s for 60s |
| ChatGPT MCP server URL + bearer header | Real | `https://agentplanner.io/mcp` + `Authorization: Bearer <token>` |

## Settings → Integrations (real)

| UI element | Status | Source |
|---|---|---|
| Connection rows | Real | `tool_calls` table grouped by `token_id`, latest row per token |
| Status (`live` / `idle` / `never_used`) | **Computed** | `live` if `last_seen < 10m`, `idle` if `< 30d`, else `never_used` |
| Last tool + relative time | Real | `tool_calls.tool_name`, `tool_calls.created_at` |
| Origin (client label + IP) | Real | `tool_calls.user_agent` parsed to label, `tool_calls.ip` |
| 7-day call count | Real | `count(tool_calls) where created_at > now - 7d` |
| Permission chips (`read` / `write` / `admin`) | Real | `api_tokens.scopes[]` |
| Recent tool calls expand panel | Real | Last 4–10 rows from `tool_calls` for this token |
| Live polling (10s) | **New** | Cheap endpoint that returns deltas via `?since=<ts>` |
| Rotate / Test / Edit permissions / Revoke actions | Real | Existing token CRUD + new test endpoint |

## Settings (real)

| UI element | Status | Source |
|---|---|---|
| Connected agents (name, via, live status, plans) | Real | Existing agent / session data |
| MCP setup snippet | Real | Static template + injected API key |
| API tokens | Real | Existing token CRUD |

## Auth (real)

| UI element | Status | Source |
|---|---|---|
| Email + password | Real | Existing auth |
| SSO (Google, GitHub, SAML) | Real or planned | Confirm SAML status |
| Workspace creation on signup | Real | Existing org flow |

## Public Plan (real)

| UI element | Status | Source |
|---|---|---|
| Read-only plan tree | Real | Existing public render |
| Recent beliefs digest | Real | Public-flagged subset of `briefing.knowledge.facts` |
| Fork to workspace | **New** | Needs duplicate-plan endpoint |

## Explore (new surface)

| UI element | Status | Source |
|---|---|---|
| Featured plan + grid | **New** | Needs publishing infra: public catalog, star/fork counts, categories |
| Categories | **New** | New taxonomy on plans |
| Star/fork counts | **New** | New aggregations |

**The entire Explore page depends on a publishing/catalog system.** Defer to phase 3 — see `05-build-order.md`.

---

## Summary — Proposed elements that need backend work

Only these blocks aren't ready to ship today:

1. BDI Coherence Dial (Mission Control)
2. Goal Compass + Tension Hotspots + Subway (Goal Detail)
3. 7-day velocity sparkline (Mission Control + Goal cards)
4. Knowledge Coverage roll-up (Knowledge → Coverage)
5. Entity extraction → Knowledge Graph (Knowledge → Graph)
6. Fact-conflict detection (Timeline contradictions, Coverage `conflict` state)
7. Plan publishing + catalog (Explore)
8. Plan forking (Public + Explore actions)
9. **Live status delta endpoint** for Settings → Integrations (10s polling)
10. **OpenClaw inbound-call polling endpoint** (60s wait window)
11. **`.mcpb` release metadata endpoint** (`/api/releases/mcpb/latest`)
12. **Test-connection endpoint** that round-trips a `briefing()` through the user's just-installed client

Everything else maps to your existing schema.
