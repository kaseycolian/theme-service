# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

## 1.0.0 — 2026-07-29

**BREAKING** — the dropdown's class names, data attributes and JS global are renamed. Nothing else
changed, and no token was touched.

### What broke

`dropdown.css` + `dropdown.js` arrived in 0.4.0 carrying the naming of the library they were ported
from (**a11y-component-examples**), which made them the only files here using an `ac-` prefix,
`data-ac-*` hooks and a `window.AC` global while `components.css` uses bare `.btn` / `.input` /
`.field`. That prefix exists upstream specifically to avoid colliding with those names, so it had no
reason to travel here.

If you vendored 0.4.0 and use these two files, apply this mapping to your markup and CSS. It is
mechanical and total — there is no behavior change hiding in it:

| 0.4.0 | 1.0.0 |
| --- | --- |
| `.ac-dropdown` | `.dropdown` |
| `.ac-dropdown__toggle`, `__panel`, `__list`, `__option`, `__value`, `__caret`, `__text`, `__primary`, `__secondary`, `__icon`, `__swatch`, `__check`, `__empty`, `__native`, `__group`, `__group-label` | same part names with a single hyphen: `.dropdown-toggle`, `.dropdown-panel`, … |
| `.ac-dropdown--disabled` / `.ac-dropdown--up` | `.dropdown-disabled` / `.dropdown-up` |
| `data-ac-dropdown` | `data-dropdown` |
| `data-ac-anchor`, `data-ac-icon`, `data-ac-swatch`, `data-ac-secondary`, `data-ac-empty-text` | `data-dropdown-anchor`, `data-dropdown-icon`, … |
| `window.AC.createDropdown(el)` | `window.ThemeService.createDropdown(el)` |
| `select._acDropdown` | `select._dropdown` |

`.dropdown` is a **different component** from the long-standing `.drop` in `components.css`, not a
rename of it. `.drop` is unchanged; nothing styles a bare `.drop*` selector.

If you regenerate `theme-select.js` (`npm run build-themes`) you get the new hooks automatically —
the generator emits `data-dropdown-swatch` / `data-dropdown-secondary` and re-enhances through
`window.ThemeService`. A stale hand-copied `theme-select.js` is the failure to watch for: the picker
still switches themes but silently stops rendering swatches.

### Not a drop-in re-copy from upstream any more

Porting an upstream fix now means translating identifiers rather than copying the file. `dropdown.js`
carries the full mapping in its header, and both it and `themes/README.md` no longer claim the
line-for-line parity they used to — that claim was false the moment the names changed.

### Also in this release

- **Fix** — `-webkit-user-select` added to the trigger. Without it, a slow double-click in Safari
  selected the value text instead of reopening the panel.
- `forced-color-adjust: none` in the forced-colors block is documented as a deliberate false-positive
  for linters that flag it as Safari-unsupported: the whole `@media (forced-colors: active)` block
  never matches in Safari, and removing the property would break the focused-row cue on Windows
  High Contrast.
- `npm run release` refuses to run on a dirty tree (it commits only `VERSION` + `CHANGELOG.md`, so it
  was able to tag a commit that did not contain the work), requires `--note`, and confirms the bump
  rule and version transition before writing. `--allow-dirty` and `--yes` override.

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
