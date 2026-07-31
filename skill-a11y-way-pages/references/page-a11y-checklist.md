# Page furniture checklist — the gate

Walk this before calling any header/footer/favicon work done. For token-level contrast thresholds see
the theme-service skill's `wcag-checklist.md`; this covers what the furniture itself is responsible
for.

## Landmarks and structure

- [ ] Exactly **one** `banner` (a `<header>` that is a direct child of `<body>`), and exactly one
      `contentinfo` (`<footer>`, same). Not nested inside `<main>` or each other.
- [ ] Exactly one `<main>`, with the id the skip link targets.
- [ ] Every `<nav>` has an **accessible name**, and no two on the page share one.
- [ ] The furniture added **no headings** to the page's outline. Section captions in the header and
      footer are `<p>` + a named `<nav>`, not `<h2>`.
- [ ] `aria-current` on the current item — `="page"` for the page nav, `="true"` for the footer's
      current product (current item in a set, which stays true across that site's pages).
- [ ] The current page's nav segment is **not a link**.

## Keyboard

- [ ] The skip link is the **first focusable element in the document** and moves focus to `<main>`.
- [ ] It is off-screen by transform/clip, **not** `display:none` or `visibility:hidden` — those
      remove it from the tab order entirely.
- [ ] Tab order matches reading order at **every** breakpoint. Responsive rules re-flow the zones;
      they must never reorder them.
- [ ] Visible focus on every interactive element: 3px, `--focus-ring`, `outline-offset: 2px`.
- [ ] The focus indicator has ≥3:1 contrast against what's behind it, in every theme.
- [ ] No focus trap; nothing focusable is hidden from view while focused.

## Targets and pointer

- [ ] Every link and control is **≥24×24 CSS px** (SC 2.5.8), or has 24px of clear spacing.
- [ ] Verified at 320px, where padding is tightest.
- [ ] No hover-only affordance — everything reachable by hover is reachable by focus.

## Color and contrast

- [ ] Text is `--text` or `--text-muted` only. If so, **no new pair exists** and the theme build's
      validation covers it.
- [ ] Any pair you did introduce checked with `tools/contrast-checker/`: normal text ≥4.5:1, large
      (≥24px, or ≥18.66px bold) ≥3:1, borders/focus/UI boundaries ≥3:1.
- [ ] Checked in **every** theme the repo offers, dark and light.
- [ ] No state is signalled by color alone — hover and current also change border, glow, underline
      or a text badge.
- [ ] When measuring in a live browser, **transitions were allowed to settle** before reading
      `getComputedStyle`. Mid-transition reads return interpolated colors and produce false failures.

## Motion

- [ ] Every transition duration derives from `var(--dur)` / `var(--motion)`. No raw `0.15s`.
- [ ] `[data-motion="off"]` collapses all furniture animation to instant.
- [ ] OS `prefers-reduced-motion: reduce` does the same, with no attribute set.

## Forced colors (Windows High Contrast)

- [ ] Every boundary drawn with a `background` (the lit tube, the footer's row rules, chips, dots) has
      a `CanvasText` outline or border restoring it under `@media (forced-colors: active)`.
- [ ] Decorative backgrounds that can't survive are explicitly hidden rather than left as gaps.
- [ ] Walked the footer's structure specifically: it is built from painted 1px rules rather than
      boxes, so **every** boundary it has is one HCM replaces. Without the swap the index loses its
      structure entirely and the products run together.
- [ ] Text and controls remain readable and distinguishable in both HCM themes.

## Sizes and engines

- [ ] **No horizontal scroll** at 320, 360, 400, 620, 768, 900, 1080, 1440, 2560px.
- [ ] Content reflows at **200% and 400%** zoom with nothing lost or overlapping (SC 1.4.10).
- [ ] Renders correctly in **Chromium, Gecko and WebKit** — including a mobile WebKit viewport.
- [ ] Every progressive enhancement has a fallback that was actually exercised:
      `color-mix()` (flat color declared first), `backdrop-filter` (`-webkit-` prefix paired), and the
      SVG themer scripts (static asset stands if they fail).

## Screen reader

- [ ] Landmarks announce as banner / navigation / main / contentinfo.
- [ ] The brand link announces its full name once, not twice (the `<img>` inside is `alt=""`).
- [ ] The theme control announces with its name and current value; its label is **clipped, not
      hidden**, at narrow widths — an `aria-labelledby` pointing at a `display:none` element resolves
      to nothing.
- [ ] Decorative glyphs (external-link arrows, lamps, swatches) are `aria-hidden="true"`.
- [ ] The current product / current page is announced as current.

## Links

- [ ] No `target="_blank"` unless the user explicitly asked (SC 3.2.5 — unrequested new windows).
- [ ] External links are marked visually, and the marker adds nothing to announce.
- [ ] Every link's accessible name makes sense read out of context.

## Design fidelity

Not accessibility, but the reason this furniture is worth copying rather than reinventing.

- [ ] **No boxes in the footer.** Structure is rules and space — no panel backgrounds, border boxes
      or chips. A tray of rounded cards is the exact generic look this system exists to avoid.
- [ ] Header and footer read as **one frame**: the same lockup, the same lit edge mirrored, the same
      focus ring, the same glow scaling.
- [ ] Type carries the hierarchy. There are three tiers in the footer (lockup, mission, index) and
      they are visibly different sizes, not one size with different colors.
- [ ] Hover changes the border, the rule, the glow or an underline — never the text color.
- [ ] One decorative idea repeated at two scales beats several competing ones. Adding a flourish?
      Take one away.

## Bookkeeping

- [ ] `A11Y-WAY-PAGES.md` written (first apply) or a **new** dated History entry appended.
- [ ] Deliberate deviations recorded with their reasons.
- [ ] In a repo with duplicated markup, the blocks are still byte-identical across pages.
- [ ] No theme file was created, edited or deleted by this work.
