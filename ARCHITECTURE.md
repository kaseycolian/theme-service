# Architecture

How the theme-service fits together, for developers and agents. This is the durable reference; the
task-oriented how-tos are in `skill/references/`.

## Layers (a value flows down, never up)

```
tools/palettes/draft-<n>.mjs      ← palette SOURCE (hand-authored hex values)
        │  node tools/build-palettes.mjs <n> --write   (validates AA)
        ▼
discovery/draft-<n>/               ← review playground (per-draft: index.html, styles/, palettes/, data/)
        │  (user picks the winning palettes)
        │  node tools/build-final.mjs --write           (validates AA, refuses on failure)
        ▼
themes/                            ← SOURCE OF TRUTH (generated)
  theme.css  tokens.json  themes.index.json
  effects.css  components.css  preview.html
        │  (vendored/copied into each app; version recorded)
        ▼
consuming apps                     ← include theme.css+effects.css+components.css, set data-theme
```

Never hand-edit generated files (`themes/theme.css`, `tokens.json`, `themes.index.json`, and the
`discovery/*/palettes/*.css`). Edit the palette source and regenerate.

## Token contract

Each theme is a flat set of CSS custom properties. Colors (per theme, in `theme.css`):

`--bg --bg-panel --bg-elevated` (surfaces, ascending elevation) · `--text --text-muted` ·
`--border --border-strong` · `--focus-ring` · four accents `--accent-{pink,green,blue,purple}` each
with an on-fill text color `--on-{pink,green,blue,purple}`. Plus `color-scheme` and `--glow-strength`
(1 dark / 0.35 light).

Structural tokens (theme-independent, in `components.css` `:root`): `--font-ui --font-mono
--radius --radius-sm --radius-pill --dur --press-y --press-s`. Effect recipe tokens (in `effects.css`
`:root`): `--motion`, `--grid-line-*`, `--tglow-*` / `--tglow-*-sm` (heading vs small-text glow),
`--bglow-*` / `--bglow-*-hi` (box glow, normal/hover).

## Theming mechanism

- `:root` carries the **default** theme (Rink Classic dark). A `prefers-color-scheme: light` media
  query swaps `:root:not([data-theme])` to Rink Classic light — so "do nothing" gives auto dark/light.
- Any theme is forced by `data-theme="<family>-<mode>"` on the root element (more specific than
  `:root`, so it wins). Ten ids: `{rink-classic, midnight-arcade, hot-neon, synthwave-sunset,
  acid-arcade}-{dark, light}`.
- Motion: `--motion` (1/0) gates all transitions (`--dur`) and press transforms (`--press-*`). It
  flips to 0 under `prefers-reduced-motion: reduce` **or** `data-motion="off"` on the root. No blanket
  `!important` reset is used, so a host app's own animations are untouched.
- Glow/grid/scrollbar are derived from the accent tokens via `color-mix`, scaled by `--glow-strength`,
  so light themes automatically render restrained bloom.

## Framework wiring (same CSS, three stacks)

- **Vanilla:** link the three files; set `data-theme` on `<html>`.
- **Angular:** add files to `angular.json` `styles[]`; a small `ThemeService` sets `data-theme` via
  `Renderer2`. Custom properties pierce view-encapsulation/Shadow DOM.
- **React:** import the CSS at the app root; set `data-theme` from a context/provider. Tokens work in
  CSS Modules, styled-components, Tailwind (`var()`), or inline styles.
- `tokens.json` mirrors every value for non-CSS tooling (Style Dictionary, Tailwind config, RN, …).

## Distribution & versioning

- `skill/` installs into `~/.claude/skills/theme-service` (junction on Windows, symlink elsewhere) via
  `install/`. The installer writes `~/.claude/theme-service.local.json` (repo path) **outside** the
  repo — no machine paths are ever committed. `AGENTS.md` mirrors the skill for non-Claude agents.
- Apps **vendor** a copy of the theme CSS and record the `VERSION`; the update flow diffs that against
  the repo `VERSION` to propagate changes. `CHANGELOG.md` documents each version.

## Public-git safety

Only CSS/JSON/HTML/JS/docs and installer scripts. No secrets, credentials, usernames, email, or
absolute home paths in committed files. `.gitignore` excludes local config and `.claude/`.
