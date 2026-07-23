# Theme Service

A lightweight, framework-agnostic theme system for keeping consistent branding — a
"90s skating rink" neon aesthetic — across many apps (vanilla JS/CSS, Angular, React).
The source of truth is plain **CSS custom properties** (with a JSON mirror), so it drops
into any stack with no build step.

## Status

**Released — v0.1.1.** The finalized source of truth lives in [`themes/`](themes/) (10 themes across
5 families × dark/light; default **Rink Classic**). A global Claude Code skill ([`skill/`](skill/)) +
[`AGENTS.md`](AGENTS.md) apply/update/extend the themes in any repo. `discovery/` holds the palette
drafts used to choose them (reference only).

## Applying it to another repo

See **[USAGE.md](USAGE.md)** for the copy-paste request and per-case prompts. The short version —
tell your agent:

> Use the theme-service skill to add multi-theme support + a theme selector to this app, mapping the
> existing components onto the theme tokens; build it and confirm every theme renders and passes WCAG AA.

## Open the discovery page

Open `discovery/index.html` directly in a browser (no server needed):

```
# from the repo root
start discovery/index.html      # Windows
open discovery/index.html       # macOS
```

It renders all 12 candidate palettes (3 faithful + 3 fresh, each in dark & light), each
showing the full component gallery in that theme. Every color pair is WCAG AA 2.2 validated —
use **Show contrast ratios** to inspect the measured numbers, **Disable animations** to test the
reduced-motion path, and Tab through controls to see focus rings.

## Layout (Phase 1)

```
discovery/
  index.html            # the palette + component gallery playground
  styles/
    effects.css         # neon glow / grid / gradient recipes (token-driven)
    components.css       # every component + all interactive states
  palettes/*.css         # 12 palette token files (generated; AA-validated)
  data/contrast.{json,js} # computed AA contrast report (generated)

tools/
  build-palettes.mjs     # regenerates palettes + contrast data (node tools/build-palettes.mjs --write)
  contrast-checker/       # standalone, dependency-free WCAG contrast checker (library + CLI)
```

## Regenerate palettes

```
node tools/build-palettes.mjs           # validate only (reports AA pass/fail)
node tools/build-palettes.mjs --write    # regenerate palette CSS + contrast data
```

The generator refuses to write if any palette fails AA. See `tools/contrast-checker/README.md`
for the standalone checker.
