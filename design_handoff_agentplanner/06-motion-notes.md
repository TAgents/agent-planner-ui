# 06 — Motion notes

Animation guidance for the implementing engineer. Split into **load-bearing** (the metaphor breaks without it), **polish**, and **don't animate**.

The static designs in `designs/` deliberately don't show motion — this doc is the spec.

---

## Tone

- **Easing:** `cubic-bezier(0.2, 0.8, 0.2, 1)` (soft ease-out) almost everywhere. Use linear only for ambient breathing loops.
- **Durations:**
  - UI transitions (hover, tab switch, expand/collapse): **120–240ms**
  - Entrance animations (sparkline draw-in, row reveal): **300–500ms**
  - Ambient breathing loops: **4–6s**
- **Feel:** crisp and quiet. No bounce, no spring overshoot, no scale-up-on-hover. The product is a planning tool, not a toy.
- **Reduced motion:** wrap all non-essential motion in `@media (prefers-reduced-motion: reduce)` and disable. Load-bearing animations (the dial breathing, agent live indicator) should degrade to a static state, not vanish entirely.

---

## Load-bearing motion

These animations exist because the metaphor doesn't read as alive without them. Don't ship the proposed BDI surfaces without these.

### BDI Coherence Dial (Mission Control)

- **Breathing:** each of the three arcs (Beliefs / Desires / Intentions) animates stroke-opacity on a 4–6s sine loop, slightly out of phase with each other (offset ~1.5s). Range: 0.7 → 1.0 → 0.7.
- **Contradiction event:** when a contradiction lands, the relevant arc pulses red once — opacity to 1, color crossfades to `--red`, returns to its semantic color over ~600ms.
- **Score change:** if the coherence score changes, the dial's outer ring redraws via stroke-dasharray over 400ms.

Without breathing, the dial reads as a static infographic and the "live agents thinking" promise falls flat.

### Goal Compass axes (Goal Detail)

- **New fact landing:** when `briefing.knowledge.facts` gains an entry, the corresponding axis (Beliefs / Desires / Intentions / Constraints) extends ~8% beyond its resting length, then settles over 700ms with the soft ease-out.
- **Tension hotspot detection:** if a contradiction is detected, the contradicting axis briefly tints red (300ms in, 600ms out).
- **Idle state:** very subtle — axes have a 6s breathing on length (±2%), all in phase. Just enough that the diagram doesn't feel frozen.

### Live agent indicator (`<StatusDot ring>`)

- The pulsing ring is a real CSS animation: outer ring scales from 1.0 → 1.6 with opacity 0.6 → 0 over 1.6s, infinite. Make sure it's `transform: scale()` + `opacity`, not `width/height` (cheaper, no layout).
- When agent goes offline, ring fades out over 200ms.

---

## Polish motion

These make the product feel built. Skip if time-pressed.

### Plan Tree

- **Row expand/collapse:** height transition + chevron rotate, 180ms. Use `grid-template-rows: 0fr → 1fr` trick, not `max-height`.
- **Selection:** detail panel content crossfades when active row changes (120ms out, 120ms in).

### Decisions queue (Mission Control)

- **Resolved decision:** slide right + fade out over 280ms when a decision is dismissed/answered. Adjacent rows reflow over the same duration.
- **New decision arrives:** slide in from top with 240ms ease-out.

### Mission Control sparklines

- **Mount:** stroke-dasharray draw-in over 600ms, once per session (stash `mounted` flag in sessionStorage so they don't redraw on every navigation).
- **Update:** new data point appears with a brief dot pulse at the end of the line.

### Tabs (Goal Detail, Knowledge, Settings)

- Tab content crossfade, 120ms. Active tab underline slides between tabs, 200ms.

### Toasts / inline feedback

- Slide in from bottom-right + fade, 200ms. Auto-dismiss after 4s with a 300ms fade out.

### Theme toggle

- Theme switch should crossfade `--bg`, `--surface`, `--text` etc. via CSS transition on those vars, 200ms. Avoid full-page fade — it's disorienting.

---

## Don't animate

- **Page-level route transitions.** They'll fight Next.js's router and add latency. Let pages snap in.
- **Hover states beyond color/opacity.** No scale, no translate, no shadow grow. Color-only.
- **Knowledge Graph nodes on first paint.** Let react-flow / d3-force settle naturally. No custom intro animation.
- **Plan Tree row hover.** The row already responds to selection; hover should be a 1-frame background shift, no transition.
- **Buttons on click.** Native `:active` state is fine. Don't add scale-down or ripple.
- **Skeleton loaders.** Use a static shimmer if you must, but prefer just rendering the empty state. Most of these surfaces load fast enough that loaders feel performative.

---

## Implementation notes

- **Prefer CSS to JS** for ambient loops (breathing, pulse rings). Use `requestAnimationFrame` only for data-driven animations (dial score changes, axis extensions).
- **Animate transforms and opacity only** on hot paths. Width/height/top/left animations cause layout thrash.
- **GPU-accelerate** the dial and compass with `will-change: transform, opacity` on the animated SVG groups. Remove `will-change` after animation completes.
- **Don't use Framer Motion for the load-bearing pieces.** The BDI Dial and Compass are SVG with stroke-dasharray and stroke-opacity tweens — Framer adds bundle weight without benefit. Keep Framer for polish (decision queue exits, tab crossfades) where its declarative API earns its keep.

---

## Quick checklist for the engineer

When implementing a new screen, before considering it done:

- [ ] Does anything described as "live" actually move? (Dial, Compass, agent indicators)
- [ ] Do tab switches and expand/collapse feel responsive (≤200ms)?
- [ ] Does `prefers-reduced-motion` degrade the screen gracefully?
- [ ] Are hover states color-only, no transform?
- [ ] Are sparklines and progress bars drawing in on first mount?
- [ ] Is the theme toggle crossfading, not snapping?

Hit those six and the motion will read as intentional.
