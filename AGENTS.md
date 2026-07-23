# AGENTS.md — Theme Service (for any AI agent)

This repo is a shared, framework-agnostic **theme system** ("90s skating rink" neon) used to keep
consistent dark/light branding across many apps. It's model-agnostic: Claude Code loads it as a skill
(`skill/SKILL.md`), and any other agent (Copilot, GPT, Gemini, …) can follow **this file**. The
detailed, non-agent-specific procedures live in `skill/references/` and are shared by both.

## What's here

- `themes/` — **source of truth** (all generated + AA-validated):
  `theme.css` (color tokens for every theme; `:root` = default **Rink Classic**, auto dark/light),
  `effects.css` (neon glow/grid/scrollbar), `components.css` (opt-in component classes),
  `tokens.json`, `themes.index.json` (registry), `preview.html` (switcher/demo), `README.md`.
- `VERSION` — the theme-service version apps record when they vendor the CSS.
- `tools/` — `build-palettes.mjs` (draft generator), `build-final.mjs` (finalizer → `themes/`),
  `palettes/` (palette source), `contrast-checker/` (standalone WCAG library + CLI).
- `discovery/` — palette-selection playground (drafts). Not consumed by apps.
- `skill/` — the Claude skill; `skill/references/*.md` are the shared how-to docs.
- `ARCHITECTURE.md` — how it all fits, the token contract, and framework wiring.

## How to use it in another repo

1. **Locate this repo.** If you're on a machine where it's installed, `~/.claude/theme-service.local.json`
   holds `{ "repo": "<path>" }`. Otherwise ask the user for the clone path.
2. **Pick the task and follow the matching reference** (these are the same docs the Claude skill uses):
   - Add themes to a **new** app → `skill/references/applying-themes.md` (New / greenfield).
   - Add themes + a **theme selector** to an **existing** app, keeping its components and making them
     render every theme → `skill/references/applying-themes.md` (Existing project). It contains the
     color-role → token mapping table, the selector snippets (vanilla/Angular/React), and the
     anti-flash bootstrap.
   - **Update** an app to the latest version → `skill/references/updating-themes.md`.
   - **Add a new theme** to this repo → `skill/references/adding-a-theme.md`.
3. **Verify** with `skill/references/wcag-checklist.md` and the checker in `tools/contrast-checker/`.

## Non-negotiables

- **Vendor** the theme CSS into the target repo (copy into `src/theme/` or `assets/theme/`); never
  hardcode an absolute path to this repo in app code. Record the copied `VERSION` in the app.
- **Default** = Rink Classic (dark, auto-light by OS). Force a theme with `data-theme="<id>"` on
  `<html>`; disable animation with `data-motion="off"`.
- **Preserve** the target app's existing markup/structure — map its colors onto the tokens, don't
  rewrite its components.
- **Only use tokens/themes from `themes/`.** Never invent colors. Keep everything AA 2.2 and
  dependency-free. This repo is public — never add secrets or machine-specific paths.
