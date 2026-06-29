/**
 * GUARDRAIL — derived metrics are server fields; the UI must not recompute them.
 *
 * This is the convention enforcer for the canonical-derivations rule (see
 * docs/DERIVED_METRICS.md + agent-planner/docs/DERIVATIONS_AUDIT.md). It scans
 * pages + components for the "count nodes to derive a metric" idiom
 * (`.filter(... === 'completed')`, ad-hoc `calculate*Progress`) and fails if any
 * appears outside src/selectors — the one place client-side mirrors are allowed.
 *
 * If this test fails: don't compute progress/health/counts in a component. Read
 * the server field (plan.rollup, goal.health, workspace.progressPct), or — for a
 * genuine live-compute case — add/use a selector in src/selectors.
 */
import * as fs from 'fs';
import * as path from 'path';

const SRC = path.resolve(__dirname, '..');
const SCAN_DIRS = ['pages', 'components'];

// The forbidden idioms. Bar-width ratios like `stats.completed / total` are
// fine (they render a server count) — these target deriving the metric itself.
const FORBIDDEN: Array<{ re: RegExp; why: string }> = [
  { re: /\.filter\([^)]*===\s*['"]completed['"]\s*\)/, why: "counting completed nodes — read plan.rollup or use src/selectors" },
  { re: /(?:export\s+)?(?:const|function)\s+calculate\w*Progress/, why: "ad-hoc progress helper — belongs in src/selectors" },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe('guardrail: no client-side metric math outside src/selectors', () => {
  const files = SCAN_DIRS.flatMap((d) => {
    const dir = path.join(SRC, d);
    return fs.existsSync(dir) ? walk(dir) : [];
  });

  it('scans a non-trivial number of files (sanity)', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('finds no forbidden derived-metric computation in pages/components', () => {
    const violations: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      for (const { re, why } of FORBIDDEN) {
        const lines = src.split('\n');
        lines.forEach((line, i) => {
          if (re.test(line)) {
            violations.push(`${path.relative(SRC, file)}:${i + 1} — ${why}\n    ${line.trim()}`);
          }
        });
      }
    }
    if (violations.length) {
      throw new Error(
        `Derived metrics must come from the server (or src/selectors), not be ` +
        `recomputed in components:\n\n${violations.join('\n')}\n`
      );
    }
  });
});
