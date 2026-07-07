/**
 * Chat starters — kickoff messages that hand a create-flow to the assistant.
 *
 * Agent-first contract: the UI never collects structure through forms. The
 * human states intent in one sentence; the assistant runs the refinement
 * protocol encoded here (classify, make it measurable, propose structure,
 * ask at most a couple of clarifying questions) and then uses its tools to
 * create the object — so what lands in the workspace is already well-formed.
 *
 * Each starter contains one [bracketed placeholder]; the dock selects it on
 * insert so the user's first keystroke replaces it with their own words.
 */

export const GOAL_STARTER = `Help me create a well-formed goal.

What I want to achieve: [describe the outcome in your own words]

Before creating anything, refine it with me: classify the goal type (outcome, metric, constraint or principle), draft 2–4 measurable success criteria — each with a metric and a target — and flag anything vague. Ask me at most two clarifying questions if something important is missing. Then create the goal in the right workspace and show me what you made.`;

export const PLAN_STARTER = `Help me plan a piece of work.

The work: [describe what needs to get done, and why]

Ask me which goal this serves — or propose one if none fits. Then draft a phased task tree: concrete tasks with clear completion criteria, dependencies between the tasks that block each other, and research → plan → implement chains wherever the approach is still uncertain. Create it as an inactive draft plan linked to the goal, and walk me through the structure before anything is activated.`;

/**
 * Range of the first [placeholder] in a starter (inclusive of brackets),
 * so the composer can pre-select it for overwrite-on-type.
 */
export function placeholderRange(text: string): [number, number] | null {
  const start = text.indexOf('[');
  if (start === -1) return null;
  const end = text.indexOf(']', start + 1);
  if (end === -1) return null;
  return [start, end + 1];
}
