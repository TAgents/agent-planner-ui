# Overnight Run — UI Redesign v1

Runbook for an autonomous Claude Code session working through the v1 UI redesign overnight. Read this first, then start.

## What you're doing

Implementing the v1 UI redesign defined in `design_handoff_agentplanner/`. Source of truth for tasks is the AgentPlanner plan **`25a5979e-e83d-4ed9-b5f8-bca35000ce9c`** ("AgentPlanner UI Redesign Implementation"). It has 7 phases × 35 tasks. Phase 0 is the entry point.

You have access to AgentPlanner via the `agent-planner` MCP server (config in `/Users/michmalk/dev/talkingagents/.mcp.json`). The v1.0 surface is live — you can `claim_next_task`, `update_task`, `extend_intention`, `queue_decision`, etc.

## Where work happens

| Task type | Repo | Branch |
|---|---|---|
| Frontend (most tasks) | `agent-planner-ui` | **`feat/ui-redesign-v1`** (this branch) |
| Backend endpoints / schema | `agent-planner` | Create `feat/ui-redesign-v1-backend` off main |
| MCP additions (rare) | `agent-planner-mcp` | Create `feat/ui-redesign-v1-mcp` off main |
| Devops / deploy | `agent-planner-devops` | Don't touch overnight |

Confirm you're on the right branch before each commit. If you create a new branch in `agent-planner` or `agent-planner-mcp`, push it but do NOT merge to main.

## Loop

```
1. mcp__agent-planner__briefing — check workspace state
2. mcp__agent-planner__claim_next_task({ scope: { plan_id: "25a5979e-4ed9-4ed9-b5f8-bca35000ce9c" } })
   → if no claimable task in this plan, look at Phase 0 first;
     work in dependency order if any are encoded
3. update_task(status='in_progress')
4. Do the work. Run tests. Commit early and often.
5. update_task(status='completed', log_message=<one-line summary>,
               add_learning=<key insight if non-obvious>)
6. Repeat until: morning, hit a blocker, or no claimable tasks left.
```

Suggested first task: **`25bd97ab-db14-4db4-8a53-5acb48675b36`** — "Add Space Grotesk font + extend Tailwind config with new design tokens." It's the smallest viable first slice; everything else in Phase 0 builds on it.

## Stop and queue_decision when

- Architecture choice with no clear right answer (e.g., "should X be a hook or a context?")
- Backwards-compat ambiguity (existing component used by both old and new UI — cut over or fork?)
- Anything that affects users in production (deploy, publish, public URL, env var)
- Tests fail and the root cause requires intuition you don't have
- A task description doesn't match the actual codebase state (the plan was written before the work; reality may have moved)

Use the queue, don't guess:
```
queue_decision({
  plan_id: "25a5979e...",
  node_id: <current task id>,
  title: "<short framing>",
  context: "<what you tried, what's ambiguous>",
  options: [{label: "A", description: "..."}, ...],
  smallest_input_needed: "pick A or B",
  recommendation: "<your preference + 1-line reason>",
  urgency: "normal"
})
```

Then move on to the next claimable task. The decision will surface at morning briefing.

## Hard rules — DO NOT

- Push to `main` on any repo
- Open or merge a PR
- Run `./deploy.sh` (production deploy)
- `npm publish`, `gh release create`, or any external action
- Delete or hard-modify existing UI components without an explicit task asking for it
- `git rebase` shared branches or `git push --force`
- Commit secrets, tokens, or anything from `.env*`
- Skip pre-commit hooks (`--no-verify`)
- Hard-delete any plan/node via REST (use `delete_plan` / `delete_node` MCP tools — they soft-archive)

## Reasonable defaults

- **Commit cadence:** logical chunks, not "one giant commit at end." Each task ideally → 1-3 commits.
- **Test before commit:** `npm test` (frontend) or `npx jest <relevant suite>` (backend). If a test was passing and now fails, fix or revert before committing.
- **Lint:** if `npm run lint` exists, run it. Fix violations.
- **Push cadence:** push the branch every few commits so morning review can see progress incrementally.
- **Status:** if you need to pause a task mid-work (e.g., needs decision), set status back to `not_started` and release the claim, OR set to `blocked` with a log explaining what's blocking.

## Reference docs in the repo

- `design_handoff_agentplanner/README.md` — handoff overview
- `design_handoff_agentplanner/01-screen-specs.md` — per-screen specs
- `design_handoff_agentplanner/02-design-tokens.md` — colors/type/spacing tokens (Phase 0 reference)
- `design_handoff_agentplanner/03-component-inventory.md` — shared chrome components to build (Phase 0 reference)
- `design_handoff_agentplanner/04-data-model-mapping.md` — Real / Proposed / New surface labels per UI element (most critical doc)
- `design_handoff_agentplanner/05-build-order.md` — phased rollout
- `design_handoff_agentplanner/06-motion-notes.md` — animation spec
- `design_handoff_agentplanner/designs/*.jsx` — React reference implementations (mocks, NOT production code — read for shape, don't copy verbatim)

The PRE-existing `CONNECT_FLOWS_REDESIGN.md` at repo root is the original brief that prompted the design handoff. Worth reading once for context, but `design_handoff_agentplanner/` is what you implement against.

## End-of-session checklist

Before the session ends (run out of time, hit a blocker, all tasks done):

1. All claimed tasks have a final status (`completed`, `blocked`, or claim released)
2. All branches pushed
3. Open questions captured via `queue_decision`
4. Final `add_learning` with a one-paragraph summary:
   - Tasks completed
   - Tasks blocked + why
   - Decisions queued
   - Anything surprising about the codebase that future sessions should know

Token / context budget: if you're approaching context limits, do the end-of-session checklist early rather than mid-task.

## Safety net

If you make a mistake on this branch, it's recoverable — `git reflog` and `git reset --hard origin/feat/ui-redesign-v1` if needed. Don't panic, don't `--force` push to recover, ask for human input via `queue_decision`.

Good luck. Make rent.
