# Adding a new theme to the theme-service

Three entry points: the user **provides a palette**, wants a **guided recommendation**, or wants to
**design a whole new theme style/family**. All end the same way: a new AA-validated palette in the
source, regenerated finals, a version bump.

**Consistency vs. flexibility:** default to the existing brand family (retro-neon — a dark base +
off-white text + four neon accents, or the light equivalent with saturated solids and low glow) so
all apps read as one brand. But the user may explicitly ask for a **new aesthetic / new family** (a
distinct style available alongside the neon ones) — support that too. Either way: keep the same
**token contract** (all roles below defined) and pass **WCAG AA 2.2** in every state. When the ask is
a broad new style rather than a single palette, use Option 3 (a fresh discovery draft to review
side-by-side) rather than adding blind.

## Option 1 — User provides a palette
Collect (or infer) the full token set for the mode(s) they want. A theme needs values for:
`bg, panel, elevated, text, muted, border, borderStrong, focus, pink, onPink, green, onGreen,
blue, onBlue, purple, onPurple` (see any entry in `tools/palettes/draft-2.mjs`). If they give only a
few colors, derive the rest in-family (deep base + light text for dark; light paper + deep saturated
accents + white `on*` for light).

## Option 2 — Guided recommendation (socratic)
Walk the same process used to design the originals: ask for a vibe/color story (1–2 sentences),
mode(s), and any must-have hues; propose a coherent palette; iterate. Default to the retro-neon
family so apps read as one brand — unless the user explicitly wants a new aesthetic (then confirm the
direction, still keeping the token contract + AA).

## Option 3 — Design a whole new theme style / family
For a distinct new look (not just another palette): build the candidates as a **new discovery draft**
so the user can compare side-by-side before committing. Create `tools/palettes/draft-<n>.mjs` with the
candidate palettes, generate + review, iterate, then finalize the picks. This is the original
discovery→finalize flow; it supports either brand-consistent variants or a deliberately new aesthetic.

## Then, for any option
1. **Add the palette object(s)** to the palette source. For a new candidate round (Option 3), create a
   new `tools/palettes/draft-<n>.mjs`; to add directly to the finalized set, add to the draft that
   `tools/build-final.mjs` sources (currently `draft-3.mjs`) using the same key shape
   (`<mode>-NN-<family>`), giving a clear `label` and `group`. Optional per-theme background strength
   via a `grid` field (0 = off, 0.22 = subdued default, ~0.40 = pronounced).
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
