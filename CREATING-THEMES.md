# Creating & editing themes (Path 2)

Add new themes or restyle existing ones with the same guided process this repo was built with. You
don't need to know the internals — an agent (Claude Code, via the installed **theme-service skill**,
or any agent following [`AGENTS.md`](AGENTS.md)) drives it. Everything stays **WCAG AA 2.2**: the
generators refuse to write if any color pair fails.

> Prerequisite: you've cloned the repo (and, for Claude, run the installer — see the README Path 1).
> Theme work happens **inside this repo**, then you commit the result.

There are three ways in. All end the same way: validated palettes → regenerated `themes/` → a version
bump. Pick whichever matches what you have.

---

## A. You already have a palette

Best when you know the colors you want (a brand palette, a screenshot you're matching, a variant of an
existing theme). Give the agent the colors; it fills in any missing roles, validates AA, and adds it.

> Use the theme-service skill to add a new theme from this palette: &lt;paste hexes / describe the
> colors&gt;. Base it on &lt;existing theme&gt; if it's a variant. Validate AA, regenerate the finalized
> themes, and bump the version.

A full theme needs values for these roles (the agent derives any you don't provide, in-family):
background / panel / elevated surfaces, primary + muted text, border + strong border, focus ring,
four accents (pink/green/blue/purple) and the text color that sits **on** each accent fill. See any
entry in [`tools/palettes/draft-2.mjs`](tools/palettes/draft-2.mjs) for the exact shape.

## B. Let the agent recommend a palette (guided)

Best when you have a *vibe* but not exact colors. The agent proposes a coherent palette from a short
brief and iterates with you — the same socratic process used for the originals.

> Use the theme-service skill to guide me through creating a new theme. I want a vibe like
> &lt;1–2 sentences: mood, era, must-have hues&gt;. Propose a palette, iterate with me, then validate AA
> and add it.

## C. Design an entirely new theme style / family

Best when you want a distinct new look — a fresh aesthetic, not just another palette. This is the
original discovery process: explore candidates side-by-side, pick winners, finalize. By default new
themes stay in the retro-neon brand family for cross-app consistency, **but you can ask for a new
aesthetic** if you want a separate style available in the picker.

> Use the theme-service skill to design a new theme family called "&lt;name&gt;". &lt;Describe the aesthetic /
> inspiration&gt;. Build the candidates as a new discovery draft so I can compare them, then finalize the
> ones I pick and bump the version.

The agent will: build a new `discovery/draft-N/` you can open in a browser to compare, let you tweak,
then finalize your picks into `themes/`.

---

## What happens under the hood (reference)

The skill follows [`skill/references/adding-a-theme.md`](skill/references/adding-a-theme.md). The
manual workflow, if you want to drive it yourself:

1. **Edit the palette source.** Add palette object(s) to the draft that the finalizer sources
   (`tools/palettes/draft-3.mjs`), or start a new `tools/palettes/draft-N.mjs` for a fresh
   exploration. Reuse the token shape from existing entries; set a clear `label`/`group`. Optional
   per-theme background strength via `grid` (0 = off, 0.22 = subdued, ~0.40 = pronounced).
2. **Validate AA.** `node tools/build-palettes.mjs <N>` reports every pair; fix any failure. Watch the
   contrast ceilings (deep purple/green as *small* text on dark, and any accent as small text on
   light, are bounded — use `tools/contrast-checker/` to find the deepest passing value).
3. **Review (optional).** `node tools/build-palettes.mjs <N> --write` then open
   `discovery/draft-<N>/index.html` to compare candidates side-by-side.
4. **Finalize.** `node tools/build-final.mjs --write` regenerates `themes/` (`theme.css`,
   `tokens.json`, `themes.index.json`, and the selector helpers — the theme list flows into
   `theme-select.js` automatically). To change the flagship default, set `DEFAULT_FAMILY` in
   `tools/build-final.mjs`.
5. **Bump the version** (`VERSION` via `build-final.mjs`) and add a `CHANGELOG.md` entry. Minor bump
   for additive themes; major for token renames/removals or a default change.
6. **Commit.** Your new/changed themes are now the source of truth.

## Rolling changes out to your apps

Once a theme is added or changed here, bring any app up to date with the update flow — no manual
re-theming:

> Update this repo to the latest theme-service version.

Apps with a data-driven selector show new themes automatically. See
[`skill/references/updating-themes.md`](skill/references/updating-themes.md).
