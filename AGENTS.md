# AGENTS.md — Theme Service (for any AI agent)

This repo is a shared, framework-agnostic **theme system** ("90s skating rink" neon) used to keep
consistent dark/light branding across many apps. It's model-agnostic: Claude Code loads it as a skill
(`skill/SKILL.md`), and any other agent (Copilot, GPT, Gemini, …) can follow **this file**. The
detailed, non-agent-specific procedures live in `skill/references/` and are shared by both.

## What's here

- `themes/` — the distributable themes (all AA-validated). `effects.css`, `components.css`,
  `preview.html`, `README.md` are committed; `theme.css`, `tokens.json`, `themes.index.json`,
  `theme-init.js`, `theme-select.js` are **build output** (gitignored) — produced by
  `npm run build-themes`. Default = **Rink Classic**, auto dark/light.
- `VERSION` — the theme-service version (single source of truth; `npm run release` bumps + tags it).
- `tools/` — `build-final.mjs` (build `themes/`), `build-palettes.mjs` (discovery drafts),
  `release.mjs` (version + tag), `update-from-origin.mjs` (pull origin updates), `palettes/`
  (`draft-*.mjs` = built-in source; `local.mjs` = a fork's own themes), `contrast-checker/`.
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
   - **Update** a consuming app to the latest version → `skill/references/updating-themes.md`.
   - **Add a new theme** to this repo → `skill/references/adding-a-theme.md`.
   - **Update this theme-service fork/clone from its origin** (keep the user's themes) →
     `skill/references/updating-from-origin.md`.
3. **Verify** with `skill/references/wcag-checklist.md` and the checker in `tools/contrast-checker/`.

## Non-negotiables

- **Confirm before changing (existing apps).** Ask the user the Step 0 questions in
  `skill/references/applying-themes.md`: component **styling depth** (colors-only vs full restyle),
  **fonts** (replace vs keep), any **existing selector** (replace vs wire-in; keep vs delete old
  themes), and **selector placement**. Don't restyle components or replace fonts without opt-in.
- **Keep the tracking log.** Every themed repo has a `THEME-SERVICE.md` (version + decisions + dated
  History). Check for it first — if present, the repo is already themed: read it and follow
  `skill/references/updating-themes.md` instead of re-applying. Always append a History entry.
- **Vendor** the theme CSS into the target repo (copy into `src/theme/` or `assets/theme/`); never
  hardcode an absolute path to this repo in app code.
- **Default** = Rink Classic (dark, auto-light by OS). Force a theme with `data-theme="<id>"` on
  `<html>`; disable animation with `data-motion="off"`.
- **Preserve** the target app's existing markup/structure by default — map its colors onto the tokens.
  Only migrate components to the `components.css` classes if the user opted into a full restyle, and
  then keep every existing behavior/handler/ARIA intact.
- **Adding/creating themes happens in the SOURCE repo** (from the config), not the app repo. A fork's
  own themes go in `tools/palettes/local.mjs`; run `npm run build-themes` (merges built-ins + local) and
  **commit in the source repo** (git-local persists; GitHub optional). Never hand-edit the generated
  `themes/` files.
- **Publishing to the live site (origin repo only).** The GitHub Pages home (`docs/overview.html`)
  links a live "Built-In Themes" preview (`themes/preview.html`) that renders the built `theme.css`.
  `.github/workflows/pages.yml` auto-detects the **highest-numbered `discovery/draft-N`** and builds
  themes from it — finalizing a new draft as the highest `draft-N` makes it the live preview on the
  next push to `main`, no extra publish step. Convention: highest `draft-N` = the latest finalized set.
- **Never auto-delete or overwrite a user's themes.** Their themes live in `local.mjs` (origin never
  touches it); rebuilding only regenerates. Remove a theme only on explicit request. When updating a
  fork from origin, follow `updating-from-origin.md` and **ask before including built-in themes**.
- **Only use tokens/themes from `themes/`.** Never invent colors. Keep everything AA 2.2 and
  dependency-free. This repo is public — never add secrets or machine-specific paths.
