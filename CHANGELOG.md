# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

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
