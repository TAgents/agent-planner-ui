# UI Migration — backend v1 consolidation + roadmap

Running checklist of UI changes needed to catch up with the backend after the
API v1 consolidation (PR #53) and the follow-on roadmap (access-control audit,
ring-2 dedup, ring-3 BDI demotion). **Deferred by design** — the backend +
MCP are being pushed to their end state first so the UI migrates once against
a stable surface. Do NOT start these until the backend work settles.

Each item: what broke, why, and the intended fix.

## Broken now (from merged PR #53 Phase-5 deletions)

- [ ] **Goal evaluations** — `src/hooks/useGoalsV2.ts` `useGoalEvaluations`
  (GET) and `useAddEvaluation` (POST) call `/goals/:id/evaluations`, which was
  deleted. The goal object still embeds an `evaluations` array (read sites in
  `GoalsV2.tsx`, `GoalDetailV1.tsx` rely on `goal.evaluations`). **Fix:** drop
  the two hooks; read evaluations from the goal object only. Verify the goal
  GET still returns `evaluations` embedded (it did pre-deletion).
- [ ] **Node search** — `src/services/api.ts` (~line 374) calls
  `/plans/:id/nodes/search`, deleted. **Fix:** remove the call / switch to
  `/search/plan/:plan_id` or global `/search`.

## Pending (will be added as roadmap backend changes land)

- **Ring-2 (dep-type validation):** if any UI code POSTs node→node dependencies
  with a type other than `blocks`/`relates_to` (e.g. `requires`), it now gets a
  400. Legacy aliases are auto-mapped server-side, so this only bites if the UI
  sends a truly unknown type. `achieves` was **held** (not removed) — no UI
  change needed for goal achievers/progress. Assignment vs claims is unchanged
  in behavior (assignment was already advisory) — no UI break.
- **Ring-3 (vocabulary, SHIPPED on backend):** the API responses changed:
  - Goal responses no longer include `goal_type: 'desire'|'intention'` — use
    the `committed: boolean` field instead. Affects `GoalV2` type + any UI
    reading `goal.goalType`/`goal_type` (GoalDetailV1, GoalsV2, portfolio).
    Portfolio stats `desires`/`intentions` → `committed`/`aspirational`.
  - `coherence_status` values are now plain language: `coherent→ok`,
    `stale_beliefs→outdated`, `contradiction_detected→contradicted`,
    `unchecked` unchanged. A `coherence_message` (human string) is also
    returned. Any UI rendering raw `coherence_status` values or BDI labels
    must map to the new vocabulary. The node-list `?coherence_status=` filter
    accepts the new values (and still the old ones).
  - Claim responses: `belief_snapshot` → `context_snapshot`.

## Optional future work (not breakage)

- Migrate UI service calls from internal routes to `/v1` (not required — the
  internal routes remain the UI's supported contract indefinitely).
