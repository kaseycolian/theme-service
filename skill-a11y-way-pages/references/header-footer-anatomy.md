# Anatomy of the header, footer and brand assets

What the furniture is made of, so you can **rebuild** it in a repo whose stack looks nothing like the
source rather than copy-pasting markup that doesn't fit. Read this before Path B or Path C in
`applying-header-footer.md`.

Everything here is plain CSS custom properties and classic scripts. No framework, no build step, no
dependencies, no inline JS.

---

## The token contract

Both pieces consume only these, and define none of them. If the target repo has them, the furniture
works; if it doesn't, stop and run the **`theme-service` skill** first.

| Role | Tokens | Comes from |
|---|---|---|
| Surfaces | `--bg` · `--bg-panel` · `--bg-elevated` | `theme.css` |
| Text | `--text` · `--text-muted` | `theme.css` |
| Lines | `--border` · `--border-strong` | `theme.css` |
| Focus | `--focus-ring` | `theme.css` |
| Accents | `--accent-pink` · `--accent-green` · `--accent-blue` · `--accent-purple` (+ `--on-*`) | `theme.css` |
| Glow scale | `--glow-strength` (1 dark / ~0.35 light) | `theme.css` |
| Motion gate | `--motion` (1 or 0) · `--dur` | `effects.css` / `components.css` |
| Ready-made glows | `--bglow-blue`, `--tglow-*`, … | `effects.css` |
| Type + shape | `--font-ui` · `--font-mono` · `--radius` · `--radius-sm` · `--radius-pill` | `components.css` |

**If a repo doesn't vendor `components.css`** (a component library reasonably won't — it would collide
on class names), the shape/type tokens are missing. Check whether the repo defines the same names
itself before assuming they're absent; `a11y-component-examples` does exactly this in
`src/library/tokens/tokens.css`. If they genuinely aren't there, define the seven of them once in the
furniture's own stylesheet with the same names and semantics — never rename them.

**Theming mechanism:** `data-theme="<id>"` on the root element selects a theme; absent falls back to
`:root` (Rink Classic dark, auto-light under `prefers-color-scheme: light`). `data-motion="off"` on
the root disables animation. Both are set pre-paint by the external `theme-init.js`.

---

## Header — four zones, always in this DOM order

```
brand ....... who this is        (identity)
page nav .... where you are      (a two-stop segmented control)
motion ...... a preference       (quiet, lowest priority)
theme ....... the product itself (loudest, always reachable)
```

The responsive rules only ever **re-flow** these four, never reorder them, so tab order always matches
reading order (SC 2.4.3). Reference markup: `docs/overview.html`, `themes/preview.html` — byte-identical
except which `.pagenav-seg` carries `aria-current="page"`. Styles: `assets/site-header.css`.

| Part | Class | What it must keep |
|---|---|---|
| Skip link | `.skip-link` | **First element in `<body>`.** Off-screen via `transform`, not `display:none` — it must be focusable. Targets `#main`. |
| Rail | `.site-header` | `position: sticky; top: 0`. Glass surface. The lit tube is a `::after` on the **bottom** edge. |
| Inner | `.hdr-inner` | `max-width: 1600px`, `padding: 11px clamp(16px, 3vw, 32px)`, flex row. |
| Brand | `.brand` > `.brand-mark` + `.brand-name` | An `<a>` with an `aria-label` naming the lockup; the `<img>` inside is `alt=""` so the mark isn't announced twice. |
| Page nav | `.pagenav` > `.pagenav-seg` | `<nav aria-label="Pages">`. The current page is a `<span>` with `aria-current="page"`, **not** a link. Current state is a lifted chip + full-contrast text, never color alone. |
| Motion | `.motion` (uses shipped `.switch`) | A real `<label>` wrapping a real checkbox with `[data-motion-toggle]`. Keeps the 44×24 switch geometry. |
| Theme console | `.theme-console` > `.tc-cap` + `.tc-lamps` + `<select data-theme-select>` | A `<div>`, **not** a `<label>` — once `dropdown.js` enhances it the real control is a `<button>`, which a wrapping label would neither name nor focus. `.tc-cap` is the accessible name via `aria-labelledby`, so below 620px it is **clipped, not `display:none`** — a name pointing at a hidden element resolves to nothing. |

Breakpoints: **1080px** two-row grid (`brand | nav` / `motion | theme`), **620px** drop the tagline and
clip the cap, **400px** mark only.

**Adapting the header.** The page nav assumes a small number of top-level pages. A repo with many
pages, or one that already has real navigation, should keep its own and take only the brand, motion
and theme zones — ask, don't assume (question 4 of the brand interview).

---

## Footer — two zones

```
lede ........ who this is, why it exists, where the code is  (a masthead)
index ....... the products, cross-linked                     (a nav)
```

Reference markup: same two pages, byte-identical. Styles: `assets/site-footer.css`.

**No boxes.** This is the rule that keeps the footer from reading as a generic card tray. The header
is a rail of type and one lit edge; the footer is drawn to the same brief so the two bracket the page
as one frame. Structure comes from **rules and space** — the 2px tube along the top, and a 1px rule
above each product. Nothing here has a panel background, a border box or a chip. If a target's brand
genuinely wants cards, that's a deliberate deviation to record in `A11Y-WAY-PAGES.md`, not a default.

| Part | Class | What it must keep |
|---|---|---|
| Slab | `.site-footer` | Direct child of `<body>` = the page's **one** `contentinfo`. Not sticky. Lit tube is a `::before` on the **top** edge. |
| Inner | `.ftr-inner` | Same `max-width` and `clamp()` padding as `.hdr-inner`, so footer content lines up with header content at every width. One column; two at **1080px** (`minmax(240px, 330px)` lede + `1fr` index) — the same width the header drops to two rows, and the width below which the index no longer has room to run two products beside a 330px lede. |
| Lede | `.ftr-lede` > `.ftr-brand` + `.ftr-mission` + `.ftr-src` | The lockup restated, **not as a link** — the header's already goes home, so a second one only adds a tab stop to the same destination. |
| Lockup | `.ftr-brand` > `img.brand-mark.ftr-mark` + `.ftr-wordmark` | Keep the `brand-mark` class: `brand-mark-theme.js` re-colors every `img.brand-mark` on the page. `.ftr-mark` sizes and lights it locally so this file stands alone. Wordmark repeats `.brand-title`'s size, weight and tracking verbatim. |
| Mission | `.ftr-mission` | The only prose here set in `--text`, and a step larger than the descriptions. It is the reason the site exists, so it outranks the index rather than being filed into a meta bar. |
| Source | `.ftr-src` | Tertiary, so no button and no pill — a labelled mark with `min-height: 32px` to clear SC 2.5.8. The glyph picks up a `drop-shadow` glow on hover, the one place the footer borrows the header's glow rather than its rules. |
| Index | `.ftr-family` | A `<nav>` with an `aria-label` and **no visible caption**: the lede beside it is the visible name, so a third label over two items is furniture. Never a heading — the furniture must not add entries to the host page's heading outline. |
| Rows | `.ftr-links` > `li` > `a.ftr-link` | CSS grid, `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`. The `min(…, 100%)` is what stops a 320px viewport overflowing — keep it. |
| The row rule | `.ftr-link::before` | 1px, `top: 0`, fading out over the last third. **This is the hover affordance** — see idiom 2 below. |
| Current product | `a.ftr-link[aria-current="true"]` + `.ftr-here` | `aria-current="true"`, not `"page"`: this marks the current item **in a set** (the product you're inside), which stays true across every page of that site. Its rule sits half-lit at rest, and "You are here" is real text beside a lit dot — never color alone. |
| External marker | `.ftr-ext` | An `aria-hidden="true"` glyph beside the name. The link text already names the destination. |

Breakpoints: both grids collapse on their own; **880px** splits lede from index, **620px** tightens
the rail, **400px** steps the name size down. No breakpoint does the column collapse — that's
deliberate, so the footer survives container widths nobody anticipated.

---

## The five shared idioms

Copy these, in whatever syntax the target uses. They're what make the two pieces read as one system.

**1. Glass surface** — flat first so an engine without `color-mix()` keeps an opaque panel:
```css
background: var(--bg-panel);
background: color-mix(in srgb, var(--bg-panel) 88%, transparent);
-webkit-backdrop-filter: blur(10px) saturate(1.15);
backdrop-filter: blur(10px) saturate(1.15);
```

**2. The lit tube, at two sizes** — a 2px pink→purple→blue ramp with a glow that scales with the
theme. The header draws it on its bottom edge at `90deg`; the footer mirrors it to its top edge at
`270deg`, so the two bracket the page. Same mirroring `effects.css` uses for
`.fx-bar-top`/`.fx-bar-bottom` (135°/315°). It re-colors with the theme, which makes it a readout as
well as a rule.

The footer then repeats the idea one size down, as the thing each product reacts to — this is the
whole hover affordance, and the reason the rows need no card:

```css
.ftr-link::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--border);                                  /* flat fallback */
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--border-strong) 45%, var(--border)) 62%, transparent);
  transition: background var(--dur) ease, box-shadow var(--dur) ease;
}
.ftr-link[aria-current]::before {   /* half-lit at rest — MUST precede :hover */
  background: linear-gradient(90deg,
    color-mix(in srgb, var(--accent-blue) 45%, var(--border)) 62%, transparent);
}
.ftr-link:hover::before, .ftr-link:focus-visible::before {
  background: linear-gradient(90deg, var(--accent-blue) 62%, transparent);
  box-shadow: 0 0 calc(9px * var(--glow-strength))
              color-mix(in srgb, var(--accent-blue) 60%, transparent);
}
```

Two details that are easy to lose. The rule **fades out** rather than stopping square: the track is
wider than the text over it, so a full-bleed rule advertises the empty half, and the fade gives the
lit state somewhere to go. And the `[aria-current]` rule must come **before** the hover rules —
they're the same specificity, so source order is what lets hover win on the current item.

**3. Focus ring** — `outline: 3px solid var(--focus-ring); outline-offset: 2px` on `:focus-visible`.
Never removed, never replaced with a box-shadow that a forced-colors mode would drop.

**4. Motion gating** — every transition duration is `var(--dur)`, which is
`calc(var(--motion) * 0.15s)`. `--motion` goes to 0 under `[data-motion="off"]` **and** under
`prefers-reduced-motion`, so both the in-page toggle and the OS setting collapse animation for free.
Never write a raw `0.15s`.

**5. Forced colors** — anything drawn with a `background` disappears in Windows High Contrast, because
HCM replaces backgrounds with system colors. Every such boundary needs a `CanvasText` outline or
border putting it back:
```css
@media (forced-colors: active) {
  .site-footer { border-top: 1px solid CanvasText; }
  .site-footer::before { display: none; }   /* the tube is a background; it's gone anyway */
  .ftr-link::before { display: none; }      /* and so is every row rule */
  .ftr-link { border-top: 1px solid CanvasText; }
  .ftr-here::before { outline: 1px solid CanvasText; outline-offset: -1px; }
}
```
This one bites harder in a footer built from rules than in one built from cards: **every** boundary
the index has is a painted 1px background, so without the swap the whole structure vanishes and the
two products run together. Outlines rather than borders where the box geometry matters — they sit
outside the box, so the spacing the glow and gaps were tuned around is untouched.

---

## Contrast strategy — why accents never carry text

Accent colors as **small text** are contrast-bound on the light themes (see the source repo's
`skill/references/adding-a-theme.md`). So:

- Text is `--text` or `--text-muted` only. Both are AA-validated against every surface by the theme
  build, so **using them introduces no new color pair to check**.
- Accents appear on **borders and glows**, which need 3:1 rather than 4.5:1.
- Hover therefore changes the border, the glow and the underline — never the text color. That also
  keeps every state signal from being carried by color alone.

Follow this and the furniture inherits the theme build's validation instead of needing its own. Break
it and you must run `tools/contrast-checker/` against every theme the repo offers.

---

## Brand assets

Two SVGs, each with a sibling script that re-colors it per theme.

| File | What it is |
|---|---|
| `assets/brand-mark.svg` | The 'A' bridge lockup mark, 200×200. Strokes read `var(--accent-pink)` / `var(--accent-green)` with brand-color fallbacks baked in, so the file also stands alone. |
| `assets/brand-mark-theme.js` | Re-colors the header mark. Loaded `defer` from `<head>`. |
| `assets/favicon.svg` | The tab icon. Uses its own `--a11y-theme-*` properties. |
| `assets/favicon-theme.js` | Re-colors the favicon. Loaded `defer` from `<head>`. |

**Why the scripts exist:** a browser renders an `<img>` and a favicon in an **isolated document**, so
the page's custom properties never reach them and the baked-in fallbacks always win. Each script reads
the resolved tokens off `<html>`, stamps them onto a copy of the SVG, and hands over a `data:` URI.
Both re-run on `data-theme` changes via a `MutationObserver`.

**Why `<img>` and not `<svg><use href="brand-mark.svg#brand-mark">`:** an external `<use>` is a
cross-origin reference that browsers block on `file://` — the mark then renders as nothing at all.
Both source pages are meant to open from disk. In a repo that is **always served over http**, inlining
the SVG is better: it follows the theme with no JS at all, and you can drop `brand-mark-theme.js`.
Decide this per repo and record which you chose.

**Both scripts are progressive enhancement.** The static `<link rel="icon">` and the plain `<img>`
already show the marks in brand colors; the scripts only upgrade them. Any failure (CSP, `file://`
fetch block, parse error) degrades to the static asset.

**CSP note:** the generated icon and mark are `data:` URIs, so a strict policy needs `img-src data:`.
Both scripts are external files — nothing here is an inline script.

**A repo with its own logo** keeps it. Take the *treatment* (the size, the glow filter, the hover lift,
the `alt=""`-plus-labelled-link pattern) and point it at their asset. Ask first — question 2.

---

## Browser and device support

Every flourish is decorative and has a fallback. Non-negotiable: **320px to ultrawide, no horizontal
scroll; reflow at 200% and 400% zoom; Chromium, Gecko and WebKit.**

| Feature | Status | Without it |
|---|---|---|
| Custom properties, `clamp()`, flex, grid | universal | — |
| `color-mix()` | widely available since 2023 | declare a flat color first; the surface goes opaque |
| `backdrop-filter` | needs the `-webkit-` prefix for Safari — always pair them | surface is opaque; nothing lost |
| `@media (forced-colors)` | Chromium + Firefox | Safari has no HCM; normal styles already meet contrast |
| `:has()` | Baseline 2023 | used by the header's theme console only. The footer avoids it entirely |
| `MutationObserver`, `fetch`, `DOMParser` | universal | the static SVGs stand as-is |

Verified on the source pages with real engines: Chromium, Firefox, WebKit desktop, and WebKit at
390×844 (iPhone).
