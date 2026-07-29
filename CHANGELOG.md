# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

## 0.4.0 — 2026-07-29

Themed dropdown component, plus `--glow-strength` finally applying per theme.

- **New `themes/dropdown.css` + `themes/dropdown.js`** — a progressively enhanced `<select>`,
  styled entirely from tokens. Supports plain / icon / color-swatch / secondary-text / grouped
  (`<optgroup>`) / empty / disabled lists via `data-ac-*` attributes on the markup. Additive and
  opt-in: without the script a plain `<select>` still renders and still works, so vendoring these
  two files is optional. The site header's theme picker now uses it.
- **Fix — `--glow-strength` was pinned to `1` for every theme.** `effects.css` declared it inside a
  `:root` block as a fallback for being loaded without `theme.css`. `:root` and `[data-theme="…"]`
  have identical specificity, and every page loads `effects.css` second, so the fallback won on
  source order and the 8 light themes' `0.35` had never taken effect. Now declared as
  `:where(:root)`, which loses to any theme.
  **Visible change for consuming apps:** every glow built on `effects.css` (headings, borders,
  fills, scrollbar) is dialed back on the **light** themes — which is what those themes always
  specified. Dark themes render identically. No token values changed, so AA results are unchanged.
- `tools/build-palettes.mjs` now emits `--glow-strength` per palette, so the discovery pages gate
  glow the same way the built themes do.
- `themes/preview.html` reorganized into component categories (`section.cat` > `.cat-grid` >
  `.block`), and `discovery/draft-3` rebuilt on the same system so a specimen designed on one page
  drops into the other unchanged.
- `discovery/draft-3` contrast report regenerated: it was stale at **19** pairs per palette against
  the checker's **26** (the `--bg-elevated` pairs added for the dropdown panel were missing from the
  committed data). All 16 themes remain **AA at 26/26**.

## 0.3.0 — 2026-07-24

Forkable/updatable service: fork-local themes (local.mjs), conflict-free upstream sync (update-from-origin) with opt-in built-ins, two install modes, and release tagging. Generated theme files are now build output (gitignored). No consuming-app token changes.

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
