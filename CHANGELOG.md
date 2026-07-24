# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

## 0.2.0 — 2026-07-23

Per-theme background strength + "(No Background)" variants.

- New per-theme token **`--fx-grid-opacity`** controls the retro checkerboard backdrop
  (`0` = off, `0.22` = subdued default, `0.40` = pronounced). `effects.css` now reads it:
  `.fx-grid::before { opacity: var(--fx-grid-opacity, 0.22) }`.
- **6 new themes (16 total)** — "(No Background)" variants (grid off, solid bg) for:
  `rink-classic-{dark,light}`, `midnight-arcade-{dark,light}`, `hot-neon-dark`, `acid-arcade-light`.
  Ids follow `<family>-<mode>-no-background`.
- The three faithful **dark** themes (`rink-classic-dark`, `midnight-arcade-dark`, `hot-neon-dark`)
  now render a **more pronounced grid (0.40)** — a small visual change if the app uses `.fx-grid`.
  All other themes unchanged. No color/token-value changes → AA results identical.
- Sourced from `discovery/draft-3`. Additive — new themes appear automatically in data-driven
  selectors (`theme-select.js` regenerated with all 16) after the update flow.

## 0.1.1 — 2026-07-23

Selector integration hardened for strict-CSP / Manifest V3 contexts.

- Added **`themes/theme-init.js`** and **`themes/theme-select.js`** — external, CSP-safe helper
  scripts. `theme-init.js` applies the saved/`?theme=` theme before first paint; `theme-select.js`
  (generated with the theme list baked in) populates and wires any `<select data-theme-select>` and
  `[data-motion-toggle]`, persisting to `localStorage`.
- Skill (`applying-themes.md`) rewritten to use external scripts and warn that **inline scripts are
  blocked by MV3/strict CSP** (a theme dropdown silently failing to populate is the tell). Verification
  now requires testing in the real runtime, not just a `file://` preview.
- No token/theme value changes — purely additive; safe update for all apps.

## 0.1.0 — 2026-07-23

Initial finalized release.

- **10 themes** across 5 families × dark/light: Rink Classic, Midnight Arcade, Hot Neon,
  Synthwave Sunset, Acid Arcade.
- **Default:** Rink Classic — dark on `:root`, auto-light via `prefers-color-scheme`.
- `themes/theme.css`, `tokens.json`, `themes.index.json`, `effects.css`, `components.css`,
  `preview.html` — generated from `tools/palettes/draft-2.mjs` via `tools/build-final.mjs`.
- All color pairs validated WCAG AA 2.2 (contrast, focus/hover/active/disabled/expanded states,
  motion-off two ways).
- Distribution: Claude skill (`skill/`) + `AGENTS.md` + installers (`install/`); standalone WCAG
  contrast checker (`tools/contrast-checker/`).
