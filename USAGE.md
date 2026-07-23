# Using the theme-service in another repo

How to ask an agent (Claude Code or otherwise) to apply or maintain these themes. The skill is
installed globally, so naming it in your request loads the full instructions automatically.

## The default request (copy-paste)

> **Use the theme-service skill to add multi-theme support + a theme selector to this app, mapping
> the existing components onto the theme tokens; build it and confirm every theme renders and passes
> WCAG AA.**

That's the recommended one-liner for an existing app. It routes the agent through the skill's
"existing project" path: locate the source, detect the stack, vendor the CSS, map the app's colors
onto the tokens, add the CSP-safe theme selector, and verify accessibility.

## Other cases

| Goal | Say |
|------|-----|
| **New / greenfield app** | "Set up theming from the theme-service in this project — use the component classes and add a theme selector. Follow the theme-service skill." |
| **Update to the latest version** | "Update this repo to the latest theme-service version." |
| **Add a new theme to the service** | "Add a new theme to the theme-service" (then provide a palette, or ask it to guide you). |

## Tips that make it go smoothly

- **Name the skill** ("theme-service skill") so the agent loads the instructions instead of improvising.
- **State the stack** if it isn't obvious ("this is a React app" / "vanilla JS" / "Angular").
- **Ask it to verify in the real runtime** ("build it and confirm the selector populates and themes
  switch") — a `file://` preview can hide CSP issues.
- **For a browser extension, say so**: "it's a Manifest V3 extension — no inline scripts." (MV3/strict
  CSP blocks inline scripts, which silently breaks an inline theme selector; the skill ships external
  `theme-init.js` / `theme-select.js` for exactly this.)
- **Work on a branch** if you want to review first: "do this on a new branch."

## What to expect when it's done

- Theme CSS vendored under `src/theme/` or `assets/theme/`, plus a `THEME-SERVICE.md` recording the
  applied version.
- A working theme dropdown, default **Rink Classic** (dark, or light under `prefers-color-scheme`),
  with the choice persisted.
- Existing components re-skinned by every theme, with no structural rewrite, all passing WCAG AA 2.2.

## Other machines

The skill finds the source via `~/.claude/theme-service.local.json`, written by the installer on this
machine. On a new computer, clone the theme-service repo and run `install/install.ps1` (Windows) or
`install/install.sh` (macOS/Linux) once.
