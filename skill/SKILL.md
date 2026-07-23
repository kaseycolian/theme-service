---
name: theme-service
description: Apply, update, or extend the "neon skating rink" theme system in any repo. Use when the user wants to add consistent dark/light theming to a project (new or existing), give an app a theme selector with all the brand themes, wire up theme.css, re-sync a repo to the latest theme-service version, or add a new theme. Triggers on "apply the theme service", "add the themes", "add a theme selector", "theme this app", "update themes to latest", "add a new theme".
---

# Theme Service — apply & maintain consistent themes across repos

This skill injects a shared, WCAG AA 2.2 neon theme system into any project and keeps it in sync.
The **source of truth** is the `theme-service` repo's `themes/` folder: `theme.css` (color tokens for
every theme), `effects.css` (glow/grid/scrollbar recipes), `components.css` (opt-in component classes),
plus `tokens.json` and `themes.index.json`. All themes are pre-validated to pass AA in every state.

## Step 0 — Locate the theme-service source (do this first)

Find the source repo, in this order:
1. Read the machine-local config `~/.claude/theme-service.local.json` → `{ "repo": "<abs path>" }`.
2. If missing, this skill lives at `~/.claude/skills/theme-service/` (symlink/junction into the repo's
   `skill/`); its real parent directory is the repo. Resolve it, or check the repo's `AGENTS.md`.
3. If you still can't find it, tell the user to run the installer (`install/install.ps1` on Windows,
   `install/install.sh` on macOS/Linux) from their clone, or ask for the repo path.

Confirm the source has `themes/theme.css`, `themes/effects.css`, `themes/components.css`,
`themes/themes.index.json`, and a top-level `VERSION`. Everything you copy comes from `themes/`.

## Step 1 — Identify the task

| User intent | Go to |
|-------------|-------|
| Add theming to a **new** project, or a project with **no** theme system yet | `references/applying-themes.md` → "New / greenfield" |
| Add theming + a **theme selector** to an **existing** app (keep its components, make them render every theme) | `references/applying-themes.md` → "Existing project" |
| **Update** a repo that already uses these themes to the latest version | `references/updating-themes.md` |
| **Add a new theme** to the theme-service itself (from a palette, or guided) | `references/adding-a-theme.md` |

## Step 2 — Detect the target stack (before applying)

Look for: `angular.json` → **Angular**; `package.json` with `react`/`react-dom` → **React**; otherwise
plain `index.html` + CSS → **Vanilla**. This decides where files go and how the selector is wired.
Each reference has a section per stack. When unsure, ask the user.

## Step 3 — Apply, then verify

Follow the relevant reference exactly. Always finish with the **verification** it lists, and check the
result against `references/wcag-checklist.md` (focus / hover / active / disabled / expanded states,
motion-off, and contrast). Run the standalone checker in `tools/contrast-checker/` if you introduce or
recolor any pairs.

## Core rules (apply everywhere)

- **Vendor, don't hardlink.** Copy the theme CSS **into** the target repo (e.g. `src/theme/` or
  `assets/theme/`) so it survives being cloned on another machine. Never reference an absolute path to
  the theme-service repo from app code.
- **Record the version.** Write the theme-service `VERSION` you copied into the app as
  `<theme-dir>/THEME-SERVICE.md` (or a `themes.lock` line). The update flow relies on it.
- **Default theme = Rink Classic**, dark by default, light under `prefers-color-scheme: light`. Any
  theme is forced with `data-theme="<id>"` on the root element; `data-motion="off"` disables animation.
- **Keep it lightweight & build-step-free.** Plain CSS custom properties; no new dependencies.
- **Preserve the app's existing markup/structure.** For existing apps you map their colors onto the
  tokens — you don't rewrite their components.
- **Never invent colors.** Only use the tokens/themes from the source. If a needed role has no token,
  flag it (it may warrant `references/adding-a-theme.md`) rather than hardcoding.
