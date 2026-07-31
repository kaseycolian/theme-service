# Changelog

All notable changes to the theme-service. Apps record the version they vendored and use this log
(plus `updating-themes.md`) to migrate. Versioning: minor bump for additive themes/tokens, major for
breaking token renames/removals or a default-theme change.

## Unreleased

**The mobile header keeps saying which A11Y Way site you are on.** The site header dropped
`.brand-tag` at 620px and all of `.brand-name` at 400px, so on a phone every sibling site rendered
the same wordmark — and under 400px the same bare mark. The tag is the only part of the lockup that
differs between the Component Guide and Themes, so the responsive rules were spending the
*distinguishing* half of the identity to keep the *shared* half. Nothing in the brand zone is hidden
for space any more. Header height is unchanged at every width; no token changed.

- **`assets/site-header.css`** — below 620px `.brand-name` becomes a column: wordmark over tag, mark
  to its left. Stacked, the lockup takes the width of its longer line instead of the sum of both,
  which is what buys the room to keep the tag. It costs no height because `.pagenav` already makes
  that row 36px. `.brand-dot` (a separator for a horizontal lockup) hides; `.brand-tag` picks up the
  `.tc-cap` voice — mono, 10px, tracked out, uppercase — so the header has one treatment for small
  labels. The 400px block no longer hides anything: it steps type and gutters down and keeps both
  lines to 320px.
- **New `.seg-tail`** — below 620px the page nav sheds its redundant word (`Preview Themes` →
  `Preview`; the tag beside it already says "Themes"). **Clipped, not removed**, like `.tc-cap`, so
  the accessible name stays `Preview Themes` at every width. Verified against the a11y tree, not
  `innerText`. The label is wrapped in a **`.seg-label`** so the whole thing is one flex item:
  `.pagenav-seg` is an `inline-flex`, and left as two items the word breaks twice — flex strips each
  item's whitespace (rendering `PreviewThemes`) and the accessible-name algorithm inserts its own
  separator between the blockified items, so a `gap` or `&nbsp;` fix yields a double space in the
  announced name. One item, tail inline, is ordinary text flow.
- **Both pages lost the brand's `aria-label`.** It existed as the fallback name for the widths where
  the words were hidden. With the words always on screen the link names itself from its own content
  (`The A11Y Way Themes`, the separator being `aria-hidden`), so the accessible name can no longer
  drift from the rendered one. Markup change only in `docs/overview.html` and `themes/preview.html`;
  no href changed, so `tools/assemble-site.mjs` string matching is unaffected.
- **The page nav now drops under the brand on its own, with no breakpoint.** Below 620px `.hdr-inner`
  is a wrapping flex row and `.pagenav` is `flex: none`, so it keeps its width and the line breaks
  rather than the pill being crushed. This replaces the old failure: pinned to the right of a `1fr`
  track, the nav overflowed *leftward under the brand* once it outgrew the track — the two silently
  overlapped and no scrollbar ever appeared, so `scrollWidth` reported clean the whole time.
  Critically, the width where that starts depends on the **rendered font**, not the viewport:
  `--font-ui` falls back `"Trebuchet MS"` → `"Segoe UI"` → `Verdana`, and measured, the collision
  moves from 324px on Trebuchet to **364px on Verdana** — so phones were overlapping at 320 *and*
  360 while a Windows browser looked fine, and any px breakpoint would have been tuned to the wrong
  machine. Wrapping asks whether it actually fits, so it is right on untested fonts and widths too.
- Three details make that layout hold, all load-bearing: a generated `.hdr-inner::before`
  (`flex: 0 0 100%`, `order: 3`) forces the break between the two groups, without which "Reduce
  motion" rides up beside the nav from ~520px; `margin-top: -8px` on the switch and console cancels
  the row-gap that break is charged on *both* sides of (a negative margin on the break itself does
  nothing — Chrome floors a flex line's cross size at 0); and `flex: 1 1 0` on the console keeps its
  ~316px content width out of the line-breaking maths, which otherwise pushed it to a fourth row
  under ~420px. `order` is used only to position the break — 1, 2, 4, 5 is DOM order untouched, so
  tab order still matches reading order. Verified reproducing the grid's geometry to the pixel: both
  rows centre on 28 and 72 as before, and the unwrapped header is still exactly 100px.
- **Skill docs updated** so sibling sites inherit this on their next sync — `header-footer-anatomy.md`
  (breakpoints, the brand row, the two re-cut traps), `applying-header-footer.md` (the tag is the
  differentiator and is never dropped for space), `page-a11y-checklist.md` (name + tag legible at
  320px; shortened labels must be clipped and name-stable).

**The footer's lede lies down on tablets and small laptops.** Between 620px and 1080px the footer is
a single column, and the lede kept its column shape there — three stacked rows down the left edge
with most of the rail empty beside them. The narrow measure causing it is inherited from the
two-column layout above 1080px, where it is doing real work; below that it only made the footer tall.

- **`assets/site-footer.css`** — a new `@media (min-width: 621px) and (max-width: 1079.98px)` block
  turns `.ftr-lede` into a full-width band: `flex-direction: row`, `.ftr-mission` drops its `32ch`
  measure and takes the slack, `.ftr-src` loses the 3px optical nudge that centred it under the text
  above.
- **The mission is re-typed inside the band, and only there** — `--font-mono` 12.5px `--text-muted`,
  anchored by a 1px `border-left`. Laying it down was not enough on its own: it kept the treatment it
  earns above 1080px, where it is the lede's hero statement in a narrow column, and on a rail beside a
  13px wordmark and a 12.5px link that made it the loudest thing in the footer with nothing holding
  it. Mono/muted is the voice the system already uses for descriptors (`.tc-cap`, the header's
  `.brand-tag`), so the demotion is a borrow rather than a new idea, and the wordmark is untouched.
  **No new color pair** — `--text-muted` here is already AA-validated by the theme build and
  `.ftr-desc` runs it at this exact size. The rule uses `align-self: stretch` so it spans the band's
  full height instead of one line of text, and it is a real border, not a painted pseudo-element:
  HCM keeps borders and replaces backgrounds, so unlike the footer's other rules it needs no
  `forced-colors` patch — verified resolving to `CanvasText`.
- **Footer vertical padding tightened at every width** — `.ftr-inner` 42/46px → 30/34px with the gap
  34px → 26px, and the phone override 32/36px → 24/28px with gap 28px → 22px. The +4px bottom-heavy
  asymmetry is preserved: the slab ends the page, so an even split reads top-heavy. The horizontal
  `clamp(16px, 3vw, 32px)` is untouched — that is the shared rail geometry that lines footer content
  up with header content, and it is the *only* thing `.ftr-inner` shares with `.hdr-inner` (the
  vertical values are independent, so changing the header's padding needs no footer change).
- Measured on both pages against the pre-band baseline: the footer goes **358px → 222px** in the band
  (lede 136.5px → 32px, mission on one line from ~840px up and two below), **233.5px → 209.5px** at
  ≥1080px and **309.6px → 287.6px** at 620px. Asserted from `getComputedStyle`, not by eye, that the
  re-typing is scoped to the band: at 400, 620, 1080, 1200 and 1440px the mission still computes to
  `--font-ui` at `--text`. No horizontal overflow at any width on either page.
- Reading order is untouched (the three parts run left to right in DOM order), and only the lede
  changes: the index keeps its `auto-fit` grid, so the two products still collapse on their own. The
  `<p>` becomes a flex box to re-centre its text inside the stretched rule box — no markup changed,
  on either page.
- The block lives in the Responsive section at the foot of the file **by necessity, not tidiness** —
  it overrides `.ftr-mission`'s measure cap at equal specificity, so source order is the only thing
  that decides it. Placed beside the other `.ftr-lede` rules it silently does nothing.
- Corrected in `header-footer-anatomy.md` while documenting the band: the footer breakpoint list said
  **880px** split the lede from the index. It has been 1080px.

**One component gallery, rendered by both pages.** `themes/preview.html` and
`discovery/draft-N/index.html` each carried their own hand-maintained copy of the component sheet, in
two dialects, and had drifted: the preview page never got the App-recreation frames or the richer
button/input/tabs cards. Both now render `gallery/gallery.js` + `gallery/gallery.css`, so a card added
once appears on both. No token changed and nothing an app vendors changed behaviour.

- **New `gallery/`** — `gallery.js` (the markup, a classic script exposing `window.ThemeGallery`;
  works from `file://` and under a strict CSP), `gallery.css` (its layout), `README.md` (how to add a
  card or a category). Not vendored by consuming apps.
- `themes/preview.html` now mounts the gallery into `<div id="gallery" data-gallery>` after its page
  head; its own `<style>` keeps only page chrome. It gained the **App recreations** category (plus a
  `.cat-nav` entry) and richer Buttons/Inputs/Surfaces cards. Header and page head are unchanged.
- `discovery/draft-3/` **lost its CSS/JS forks**: it now links `themes/effects.css`,
  `themes/components.css` and `themes/dropdown.{css,js}` directly instead of stale copies under
  `styles/` + `scripts/` (both folders deleted). The discovery page therefore shows exactly what an
  app gets, and finalizing a draft no longer needs a rescoping step.
- `themes/effects.css` derives its glow/grid tokens on `:root, [data-palette]` rather than `:root`
  alone, and its motion-off rules reach `[data-palette]` descendants. Custom properties compute where
  they are declared, so this is what lets one file serve both the app path (`:root` + `theme.css`) and
  the discovery page (a different palette per section, nothing on `:root`). **Inert for consuming
  apps** — no app has a `[data-palette]` attribute.
- **A11y — the discovery page's 96 component regions had 6 names between them.** Every
  `section.cat` was named by its own `<h3>`, so a screen-reader user moving by region heard
  "Typography", "Buttons", … sixteen times over with nothing to say which palette they were in. The
  gallery takes an optional `name` and labels each region **"`<Category>` for `<theme>`"**; discovery
  passes the palette's visible label *and* group (`"Typography for Rink Classic, Faithful · Dark"`)
  because the labels alone repeat — dark and light are each "Rink Classic". `themes/preview.html`
  renders one gallery, so it omits `name` and keeps pointing at its own visible headings.
- Renamed while moving into the shared stylesheet: `.preview` → `.app-preview`,
  `.app-head .title` → `.app-title` (both were too generic for a shared file). They only ever existed
  on the discovery page.
- `tools/assemble-site.mjs` copies `gallery/` into `_site/gallery/` (no link rewrite needed —
  `../gallery/…` resolves the same from `themes/preview.html` and `/preview/`);
  `tools/serve-site.mjs` watches it.

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
  `.block`), and `discovery/draft-3` rebuilt on the same system so a component designed on one page
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
