# Updating a repo to the latest theme-service

Use when a project already consumes these themes and the theme-service has changed (new colors,
new components, new themes, tweaks). Goal: bring the app up to the current version with minimal,
correct changes — and never regress accessibility.

## 1. Determine both versions
- **App version:** read `<vendor>/THEME-SERVICE.md` (or `themes.lock`) in the target repo.
- **Source version:** read `VERSION` at the theme-service repo root (locate it per `SKILL.md` Step 0).
- If they match and no files differ, there's nothing to do — say so.

## 2. See what changed in the source
Compare the app's vendored copies against the source `themes/` files:
- `theme.css` — token **values** changed? New `[data-theme]` **blocks** (new themes)? Token names
  added/removed (contract change)?
- `effects.css` / `components.css` — recipe or component changes.
- `themes.index.json` — new families/themes (the selector must pick these up).
- Read the source `CHANGELOG.md` for a summary of what changed and any migration notes.

## 3. Apply the update
- **Re-copy** the changed files into the app's vendor folder (`theme.css`, `effects.css`,
  `components.css` as applicable, and `themes.index.json`).
- **New themes:** no code change needed if the selector is data-driven off `themes.index.json` — they
  appear automatically. If the selector was hardcoded, add the new ids/labels.
- **New tokens** (contract additions): if the app maps colors manually (existing-project path), wire
  any newly relevant token into the app's styles where appropriate. Existing mappings keep working.
- **Renamed/removed tokens** (rare, and a breaking change → major version bump): find the old name in
  the app and repoint it to the replacement noted in the CHANGELOG.
- **Default/flagship theme changed:** if `themes.index.json.default` changed and the app relied on the
  auto default, confirm that's the intended new look; otherwise pin the old one with `data-theme`.

## 4. Re-verify
- Switch through every theme; the existing components still render correctly and legibly.
- Re-run `tools/contrast-checker/` on any app-specific color pairs. Walk `wcag-checklist.md`.
- Confirm motion-off still works and no theme flashes on load.

## 5. Record it
Update `<vendor>/THEME-SERVICE.md` with the new version + date. Summarize what changed for the user
(themes added, tokens changed, any manual repoints you made).
