# Theme Service

A lightweight, framework-agnostic theme system for consistent branding — a "90s skating rink"
neon aesthetic — across many apps (vanilla JS/CSS, Angular, React). The source of truth is plain
**CSS custom properties** (with a JSON mirror), so it drops into any stack with **no build step**.
Every theme passes **WCAG AA 2.2** in all states.

Ships with **16 themes** (5 families × dark/light, plus "No Background" variants). Default is
**Rink Classic** (dark, auto-light by OS). See them in `themes/preview.html`.

---

## Two ways to use it

You can use everything **as-is** without touching the theme-creation process — or opt into the full
guided workflow to add and change themes. Pick your path:

### Path 1 — Use the themes as-is

Install once, then apply the existing themes to any repo on your machine. No palette/creation work.

1. **Clone** this repo anywhere.
2. **Install** — two modes. Both link the skill into `~/.claude/skills` and write a machine-local
   pointer to this repo (nothing is written *inside* the repo):
   ```sh
   npm run install-all         # install the skill AND build the themes (recommended)
   npm run install-no-themes    # install the skill only — don't generate any themes
   # (the platform scripts install/install.ps1 · install/install.sh still link the skill)
   ```
   The theme files (`themes/theme.css`, `tokens.json`, …) are **build output**, not committed —
   `install-all` produces them; run `npm run build-themes` any time to (re)generate. Re-run install
   to refresh the link.
3. **Apply to any repo.** Open that repo in Claude Code (or another agent) and say:
   > Use the theme-service skill to add multi-theme support + a theme selector to this app, mapping
   > the existing components onto the theme tokens; build it and confirm every theme renders and
   > passes WCAG AA.

   The agent vendors the theme CSS, wires a theme picker (all 16 themes), and maps the app's existing
   components onto the tokens — existing markup untouched. Full prompts & per-case variants:
   **[USAGE.md](USAGE.md)**.

Later, to pull in updates after you (or an upstream) change the themes:
> Update this repo to the latest theme-service version.

**Using a non-Claude agent?** You can skip the skill install entirely — point your agent at
[`AGENTS.md`](AGENTS.md) in this repo. It mirrors the skill's instructions and the detailed how-tos in
`skill/references/`, so any agent can apply/update/create themes by following it.

### Path 2 — Create or edit themes

Add new themes or restyle existing ones using the same guided process this repo was built with —
provide your own palette, have the agent recommend one, or design an entirely new aesthetic. It stays
AA-validated and consistent, so new themes are reusable across all your apps.

Full walkthrough & prompts: **[CREATING-THEMES.md](CREATING-THEMES.md)**. In short, tell your agent:
> Use the theme-service skill to add a new theme — &lt;paste a palette&gt; / guide me to one / design a new
> theme family called "&lt;name&gt;". Validate AA, regenerate, and bump the version.

You don't have to choose Path 2 to use the service — Path 1 is complete on its own.

---

## Own your copy: your themes + my updates

This repo is the **origin**. Fork or clone it and it becomes **your** source of truth.

- **Your themes live in `tools/palettes/local.mjs`** (shipped empty). Add themes there, run
  `npm run build-themes`, and **commit** — they persist. **Git-local is enough; GitHub is optional**
  (add your own remote only to back up / sync across machines / share). The origin never edits
  `local.mjs`, so your themes are never touched by updates.
- **Pull my updates without losing your themes.** The generated `themes/` aren't committed and your
  `local.mjs` is origin-untouched, so syncing is conflict-free:
  ```sh
  # one-time: point at this origin
  npm run update-from-origin -- --set-upstream https://github.com/kaseycolian/theme-service.git
  npm run update-from-origin        # fetch + merge my latest  (or  -- --tag vX.Y.Z)
  npm run build-themes              # rebuild incl. my built-in themes
  npm run build-themes:mine         # …or rebuild with ONLY your themes
  ```
  An agent-driven update **asks** whether to include my built-in themes. **Nothing is ever
  auto-deleted** — themes are removed only when you ask. Your machine's install/update log lives in
  `~/.claude/theme-service.local.json` (never committed) for you and agents to review.
- **"Which repo is my source"** is a machine-local pointer (`~/.claude/theme-service.local.json`,
  gitignored, never in commit history). Change it by re-running the installer from the clone you want,
  or `node install/install.mjs --source <path>`.

---

## What's in the box

```
themes/            The distributable themes. effects.css, components.css, preview.html, README.md are
                   committed; theme.css / tokens.json / themes.index.json / theme-init.js /
                   theme-select.js are BUILD OUTPUT (gitignored) — run `npm run build-themes`.
tools/             build-final.mjs (build themes/), build-palettes.mjs (discovery drafts),
                   release.mjs (version + tag), update-from-origin.mjs (pull origin updates),
                   palettes/ (draft-*.mjs = built-in source; local.mjs = YOUR themes),
                   contrast-checker/ (standalone WCAG library + CLI)
skill/             The Claude Code skill (SKILL.md + references/) — how agents apply/update/add themes
AGENTS.md          Agent-agnostic mirror of the skill (for non-Claude agents)
discovery/         Palette-selection playground (draft-1/2/3) — reference for how themes were chosen
install/           install.mjs (cross-platform) / install.ps1 / install.sh — link the skill + write
                   the machine-local pointer (~/.claude/theme-service.local.json)
package.json       scripts: install-all, install-no-themes, build-themes, build-themes:mine,
                   update-from-origin, release, validate (no dependencies)
USAGE.md           How to ask an agent to APPLY the themes to a repo
CREATING-THEMES.md How to CREATE or EDIT themes (Path 2)
ARCHITECTURE.md    How it all fits: the layers, token contract, theming mechanism, framework wiring
CHANGELOG.md  VERSION   (VERSION is the single source of truth; `npm run release` bumps + tags it)
```

## The themes

16 themes across 5 families, each in dark + light, several with a grid-off "(No Background)" variant:
`rink-classic`, `midnight-arcade`, `hot-neon`, `synthwave-sunset`, `acid-arcade`. Default is
**Rink Classic**. Theme ids are `<family>-<mode>` (e.g. `synthwave-sunset-dark`) and
`<family>-<mode>-no-background` for the grid-off variants.

**Consume them** (vanilla): include the CSS and set `data-theme` on `<html>` (or nothing for the
auto default). Full integration notes — including Angular/React and the CSP-safe selector helpers —
are in [`themes/README.md`](themes/README.md).

## Explore the themes

- **`themes/preview.html`** — the finalized themes with a live switcher (open in a browser).
- **`discovery/index.html`** — the draft playground: every candidate palette rendered with the full
  component gallery, side by side, with computed AA ratios. Reference for the creation process.

## Build / validate / release (tooling)

```sh
npm run build-themes           # build themes/ (built-in + your local.mjs themes)
npm run build-themes:mine      # build themes/ with ONLY your local themes (exclude built-ins)
npm run validate               # AA-check the built-in palette source (no write)
npm run release minor -- --note "what changed"   # bump VERSION + CHANGELOG + git tag vX.Y.Z
```

The generators **refuse to write if any pair fails WCAG AA** (your own `local.mjs` themes are validated
too). The standalone checker is in [`tools/contrast-checker/`](tools/contrast-checker/) (library + CLI,
usable in any project).

**Versioning:** `VERSION` is the single source of truth (`build-final.mjs` reads it). `npm run release`
bumps it, prepends a `CHANGELOG.md` entry, commits, and creates the git tag `vX.Y.Z` (push with
`git push --follow-tags`). Additive theme/token changes → minor; token renames/removals or a
default-theme change → major. Consuming apps record the version they vendored and use the update flow.
