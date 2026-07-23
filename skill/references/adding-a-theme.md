# Adding a new theme to the theme-service

Two entry points: the user **provides a palette**, or they want a **guided recommendation**. Both end
at the same place: a new AA-validated palette in the source, regenerated finals, a version bump.

Every theme must stay in the same brand family (retro-neon: a dark base + off-white text + four neon
accents, or the light equivalent with saturated solids and low glow) and pass WCAG AA 2.2.

## Option 1 — User provides a palette
Collect (or infer) the full token set for the mode(s) they want. A theme needs values for:
`bg, panel, elevated, text, muted, border, borderStrong, focus, pink, onPink, green, onGreen,
blue, onBlue, purple, onPurple` (see any entry in `tools/palettes/draft-2.mjs`). If they give only a
few colors, derive the rest in-family (deep base + light text for dark; light paper + deep saturated
accents + white `on*` for light).

## Option 2 — Guided recommendation (socratic)
Walk the same process used to design the originals: ask for a vibe/color story (1–2 sentences),
mode(s), and any must-have hues; propose a coherent palette; iterate. Keep it unmistakably in the
retro-neon family so all apps still read as one brand.

## Then, for either option
1. **Add the palette object(s)** to the palette source. For a new candidate round, add to a new
   `tools/palettes/draft-<n>.mjs`; to add directly to the finalized set, add to the draft that
   `tools/build-final.mjs` sources (currently `draft-2.mjs`) using the same key shape
   (`<mode>-NN-<family>`), giving a clear `label` and `group`.
2. **Validate AA** — run `node tools/build-palettes.mjs <n>` (or the finalizer's report). Fix any
   failing pair. Remember the ceilings: deep purple/green as **small text** on dark, and any accent as
   small text on light, are contrast-bound; adjust luminance until ≥4.5 (use `tools/contrast-checker/`
   to find the deepest passing value). The generator **refuses to write** while anything fails.
3. **Regenerate**:
   - Discovery preview (optional review): `node tools/build-palettes.mjs <n> --write` → open
     `discovery/draft-<n>/index.html`.
   - Finalize into the source of truth: `node tools/build-final.mjs --write` → updates
     `themes/theme.css`, `tokens.json`, `themes.index.json`.
4. **Bump the version** in `tools/build-final.mjs` (`VERSION`) — minor bump for additive themes — and
   add a `CHANGELOG.md` entry describing what was added.
5. **Verify** in `themes/preview.html` (the new theme appears in the switcher and renders correctly),
   then walk `wcag-checklist.md`.
6. Downstream apps pick up the new theme by running the **update flow** (`updating-themes.md`); a
   data-driven selector shows it automatically.

## Changing the default/flagship theme
Set `DEFAULT_FAMILY` in `tools/build-final.mjs` to the family you want on `:root`, re-run
`node tools/build-final.mjs --write`, bump the version, and note it in the CHANGELOG (apps relying on
the auto default will change appearance — call this out).
