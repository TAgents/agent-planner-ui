# Derived metrics: server computes, the UI renders

**The rule:** every derived metric (progress %, status counts, health, blocked %,
attainment, linked-plan count, critical path) is computed **once on the server**
and returned as a field. The UI renders that field. Components never recompute a
metric from the raw node/goal list.

This exists because the same metric computed in two places drifts. The canonical
example: a plan once read **68%** on the Plans index (server counted all nodes)
and **100%** in the plan tree (client counted only work nodes). One disease, many
symptoms. Full history: `agent-planner/docs/DERIVATIONS_AUDIT.md`.

## Where each metric lives

| Metric | Server source | UI field |
|---|---|---|
| Plan progress / counts / blocked % / phase roll-up / critical path | `planRollup.service.js` | `plan.rollup` (+ `plan.progress`, `plan.stats` projected from it) |
| Goal health / execution % / attainment / linked-plan count | `goalRollup.service.js` (goal dashboard) | `goal.health`, `goal._dash.*` |
| Workspace progress | `workspaces.dal.mjs` | `workspace.progressPct` |
| Workspace health | ⚠️ not yet server-side — see DERIVATIONS_AUDIT.md | (client stopgap; to be fixed) |

**Canonical denominator for any "progress":** work nodes only —
`node_type IN ('task','milestone')`. Root and phases are structure, never counted.

## What the UI may do

- **Render** server fields directly. ✅
- **Presentation ratios** over server counts — e.g. a segmented-bar segment width
  `stats.completed / stats.total * 100`. ✅ (rendering, not deriving the metric)
- **Live-compute via `src/selectors`** for the narrow cases where the server
  field isn't available yet (e.g. before `plan.rollup` loads). The selector MUST
  mirror the server formula exactly. ✅

## What the UI must NOT do

- Compute a metric inline in a component: `nodes.filter(n => n.status === 'completed').length / nodes.length`. ❌
- Add a `calculate*Progress` helper outside `src/selectors`. ❌
- Read one surface's number from the server and another's from a client recompute
  (that's how surfaces drift). ❌

## Enforcement

- **`src/selectors/`** is the only home for client-side metric mirrors.
- **`src/__tests__/noClientMetricMath.test.ts`** is a ratchet: it scans
  `pages/` + `components/` for the forbidden idioms and fails the build if a new
  one appears. Run with `npm test` (CRA/react-scripts — `npx jest` can't parse
  the TS and will throw a confusing SyntaxError).
