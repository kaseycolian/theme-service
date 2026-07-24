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
2. **Install the skill** (links it into `~/.claude/skills` and records this repo's location so agents
   can find it — nothing is written inside the repo):
   ```sh
   npm run install-skill          # cross-platform (Node) — the easy one-liner
   # or run the platform script directly:
   #   Windows:      pwsh -File install/install.ps1
   #   macOS/Linux:  bash install/install.sh
   ```
   Re-run any time to refresh (e.g. after moving the repo). All three do the same thing.
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

## What's in the box

```
themes/            SOURCE OF TRUTH (generated, AA-validated) — theme.css, tokens.json,
                   themes.index.json, effects.css, components.css, theme-init.js,
                   theme-select.js, preview.html, README.md
skill/             The Claude Code skill (SKILL.md + references/) — how agents apply/update/add themes
AGENTS.md          Agent-agnostic mirror of the skill (for non-Claude agents)
tools/             build-palettes.mjs (draft generator), build-final.mjs (finalizer),
                   palettes/ (palette source), contrast-checker/ (standalone WCAG library + CLI)
discovery/         Palette-selection playground (draft-1/2/3) — reference for how themes were chosen
install/           install.mjs (npm run install-skill) / install.ps1 / install.sh — link the
                   skill + write the machine-local repo pointer
package.json       npm scripts: install-skill, validate, build-themes (no dependencies)
USAGE.md           How to ask an agent to APPLY the themes to a repo
CREATING-THEMES.md How to CREATE or EDIT themes (Path 2)
ARCHITECTURE.md    How it all fits: the layers, token contract, theming mechanism, framework wiring
CHANGELOG.md  VERSION
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

## Regenerate / validate (Path 2 tooling)

```sh
node tools/build-palettes.mjs 3            # validate a discovery draft's palettes (AA report)
node tools/build-palettes.mjs 3 --write     # regenerate a draft's palette CSS + contrast data
node tools/build-final.mjs --write          # regenerate the finalized themes/ from the source draft
```

The generators **refuse to write if any pair fails WCAG AA**. The standalone checker is in
[`tools/contrast-checker/`](tools/contrast-checker/) (library + CLI, usable in any project).

Versioning: additive theme/token changes bump the minor version; token renames/removals or a
default-theme change bump the major. Apps record the version they vendored and use `CHANGELOG.md` +
the update flow to migrate.
