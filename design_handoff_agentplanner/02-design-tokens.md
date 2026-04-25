# 02 — Design tokens

All values are taken directly from `designs/shared.jsx`. Define them once (Tailwind theme extension or CSS custom properties) and reference everywhere.

## Color tokens

The system has a **single saturated accent (amber)** plus three semantic accents (emerald / red / violet). Everything else is warm-neutral grayscale. Both themes are defined.

### Dark theme

| Token | Hex / value | Usage |
|---|---|---|
| `bg` | `#0e0c0a` | App background |
| `surface` | `#16140f` | Cards, panels, top bars |
| `surface-hi` | `#1e1b15` | Hover state, nested surfaces, segmented progress track |
| `border` | `#2a261e` | Default 1px borders |
| `border-hi` | `#3a3528` | Stronger borders, dividers between rows in dense lists |
| `text` | `#ede8df` | Primary text |
| `text-sec` | `#a09882` | Secondary / supporting text |
| `text-muted` | `#6b6354` | Tertiary, mono labels, timestamps |
| `amber` | `#d4a24e` | The only saturated accent. Brand, CTAs, hero numbers. |
| `amber-soft` | `rgba(212,162,78,0.15)` | Amber tint for backgrounds / glows |
| `emerald` | `#5ba89a` | On-track, done, healthy |
| `emerald-soft` | `rgba(91,168,154,0.18)` | Emerald tint |
| `red` | `#c94a4a` | Blocked, contradiction, danger, stale (>5d) |
| `red-soft` | `rgba(201,74,74,0.16)` | Red tint |
| `violet` | `#8a7cb8` | Beliefs / knowledge / agents (semantic, not "AI gradient") |
| `violet-soft` | `rgba(138,124,184,0.18)` | Violet tint |
| `slate` | `#4a4438` | Inactive, idle, neutral progress |

### Light theme

| Token | Hex / value |
|---|---|
| `bg` | `#fafaf7` |
| `surface` | `#ffffff` |
| `surface-hi` | `#f4f2ec` |
| `border` | `#e8e4dc` |
| `border-hi` | `#d4cfc5` |
| `text` | `#16140f` |
| `text-sec` | `#5a5448` |
| `text-muted` | `#8a8474` |
| `amber` | `#b8882e` |
| `amber-soft` | `rgba(184,136,46,0.12)` |
| `emerald` | `#3d7a6e` |
| `emerald-soft` | `rgba(61,122,110,0.12)` |
| `red` | `#b03838` |
| `red-soft` | `rgba(176,56,56,0.10)` |
| `violet` | `#5d4f8a` |
| `violet-soft` | `rgba(93,79,138,0.12)` |
| `slate` | `#a09882` |

### Tailwind config snippet

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-hi': 'rgb(var(--surface-hi) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        'border-hi': 'rgb(var(--border-hi) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        'text-sec': 'rgb(var(--text-sec) / <alpha-value>)',
        'text-muted': 'rgb(var(--text-muted) / <alpha-value>)',
        amber: 'rgb(var(--amber) / <alpha-value>)',
        emerald: 'rgb(var(--emerald) / <alpha-value>)',
        red: 'rgb(var(--red) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
        slate: 'rgb(var(--slate) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
};
```

```css
/* globals.css */
:root {
  --bg: 250 250 247;       /* #fafaf7 */
  --surface: 255 255 255;
  --surface-hi: 244 242 236;
  /* ...etc all light values as space-separated rgb */
}
.dark {
  --bg: 14 12 10;
  --surface: 22 20 15;
  --surface-hi: 30 27 21;
  /* ...etc all dark values */
}
```

## Typography

**Type pair:** Space Grotesk (display + body) + JetBrains Mono (metadata, code, kickers).

| Role | Family | Weight | Size | Tracking | Use |
|---|---|---|---|---|---|
| Hero numeral | display | 700 | 28–44px | `-0.04em` | Big stats on Mission Control / Coverage gauge |
| Page title | display | 700 | 26–32px | `-0.035em` to `-0.03em` | Screen headers |
| Section title | display | 700 | 18–22px | `-0.02em` | Card section heads |
| Card / row title | display | 600 | 13–14px | `-0.01em` | Plan rows, list items |
| Body | body | 400–500 | 12–14px | normal | Paragraph copy |
| Body strong | body | 600 | 12–13px | normal | Labels, button text |
| Mono kicker | mono | 700 | 9–10px | `0.18em–0.22em`, **uppercase** | Section kickers (`◆ NEXT UP`) |
| Mono label | mono | 500–600 | 9–11px | `0.06em–0.16em` | Metadata, timestamps, status pills |
| Mono value | mono | 600–700 | 9–12px | normal | Numbers in dense rows |

Letter-spacing tightens with size. Mono is **always uppercase** when used as a kicker, **always lowercase** when used as inline metadata.

## Spacing

Standard 4px grid. Common values:

- Card padding: `14`, `16`, `18`, `20px` (denser → bigger)
- Card-to-card gap: `8`, `10`, `12`, `18px`
- Section vertical gap: `22–28px`
- Screen padding: `24–36px` horizontal; max content width `760–1080px`

## Radii

- Pills / tiny chips: `3–5px`
- Buttons / inputs / small cards: `6–8px`
- Cards: `10px`
- Avatars / dots: `50%`

## Borders

Almost always `1px solid` against `border` token. Stronger dividers use `border-hi`. No double-borders, no shadow stacks. **Shadows are not used** in the design — depth is conveyed through tone shifts (`bg → surface → surface-hi`).

## Iconography

The design uses **glyphs, not icon libraries**. The vocabulary:

| Glyph | Meaning |
|---|---|
| `◆` | Section kicker / brand mark |
| `◇` | Light-weight kicker |
| `◐` | In-progress / pending / "doing" |
| `◯` `○` | Empty / not yet started |
| `✓` | Done |
| `✕` | Contradiction / removed |
| `⚠` | Blocked / warning |
| `↳` | Tether (e.g., "plan ↳ goal") |
| `→` | Navigation / next |
| `▾` | Disclosure / dropdown |
| `⌕` | Search |
| `≡` `▦` | List / grid view toggle |

When implementing in the real codebase you may swap glyphs for proper icons (Lucide etc.), but **keep the mono uppercase kicker pattern** — it's load-bearing.

## Animation

Minimal. The only animations in the designs:

- `pulse` keyframe on live status dots (2s infinite, opacity + scale)
- Hover transitions: `0.15s` ease-out, opacity/background only
- Screen transitions: TBD by codebase (nothing prescribed)

## Status color mapping

A single canonical mapping used everywhere:

| Status | Color | Glyph |
|---|---|---|
| `done` / `completed` / `on_track` / `coherent` / `live` | `emerald` | `✓` |
| `doing` / `at_risk` / `stale_beliefs` / `pending` / `needs attention` | `amber` | `◐` |
| `blocked` / `contradiction_detected` / `stale` (>5d) / `danger` | `red` | `⚠` / `✕` |
| `todo` / `idle` / `unchecked` / `neutral` | `slate` / `text-muted` | `○` |
| `belief` / `knowledge` / `agent` / `cross-plan` | `violet` | (no glyph) |
