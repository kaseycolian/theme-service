# Applying themes to a project

Goal: the target app renders **any** theme from the theme-service and lets the user pick one, with
a default of Rink Classic (dark, auto-light by OS). Everything stays WCAG AA 2.2.

There are two paths. Read the one that matches the project, then the stack section, then verify.

---

## Common setup (both paths)

1. **Choose a vendor folder** in the target repo for the copied theme files:
   - Vanilla: `assets/theme/` (or next to existing CSS).
   - Angular: `src/theme/`.
   - React: `src/theme/`.
2. **Copy from the source `themes/`** into that folder:
   - Always: `theme.css` (color tokens for all themes).
   - Almost always: `effects.css` (glow/grid/scrollbar recipes — the neon identity).
   - **New projects only** (or existing apps adopting our components): `components.css`.
   - **Vanilla / extension / any non-framework app:** also copy `theme-init.js` and `theme-select.js`
     (the CSP-safe selector helpers — see "The theme selector" below). React/Angular apps use their
     own provider instead and don't need these.
   - Copy `themes.index.json` too (registry reference).
3. **Record the version + leave instructions for future agents.** Create `<vendor>/THEME-SERVICE.md`
   with the copied `VERSION`, the date, and a short "for agents" block so anyone (human or agent)
   working in this repo later follows the same rules. Use this template:

   ```markdown
   # Theme Service

   This app's theming comes from the shared **theme-service** — version `<VERSION>`, applied `<DATE>`.
   The files in this folder are vendored copies of the source of truth; do not hand-edit generated
   token files, and do not hardcode colors — consume the theme tokens (`var(--…)`).

   ## For agents working in this repo
   Use the **theme-service skill** (or its `AGENTS.md`) for any theme work here — don't improvise. Default request:
   > Use the theme-service skill to update this app's themes / add a theme, mapping the existing
   > components onto the theme tokens; build it and confirm every theme renders and passes WCAG AA.
   Rules: keep everything WCAG AA 2.2 · default theme is Rink Classic · the selector must use the
   **external** `theme-init.js` / `theme-select.js` (never inline scripts — MV3/strict CSP blocks them).
   To pull upstream changes: "Update this repo to the latest theme-service version."
   ```

   The `VERSION` line is also what `updating-themes.md` diffs against later.
4. **Load order matters:** `theme.css` → `effects.css` → `components.css`.

The default theme applies with **no** `data-theme`. Force one with `data-theme="<id>"` on the root
`<html>` element. Theme ids come from `themes.index.json` (`themes[].id`), e.g.
`rink-classic-dark`, `synthwave-sunset-light`.

---

## Path A — New / greenfield project

Use the component classes directly; the app inherits the full look for free.

1. Include all three CSS files (order above).
2. Build UI with the component classes: `.btn.btn-solid.a-pink`, `.btn-outline`, `.btn-ghost`,
   `.btn-icon`, `.input`, `.textarea`, `.select`, `.field`/`.field-label`, `.drop`/`.drop-toggle`/
   `.drop-panel`, `.choice`, `.switch`, `.notice.{info,success,warn,error}`, `.badge`, `.chip-toggle`,
   `.tabs`/`.tab`, `.result`, `.t-h1..t-h4`/`.t-body`/`.t-muted`/`.t-link`, and effect classes
   `.fx-grid`, `.fx-scroll`, `.fx-bar-top`/`.fx-bar-bottom`. (See the source `themes/preview.html`
   and `discovery/draft-2/index.html` for a full gallery of every class + state.)
3. Add the **theme selector** (below) and the **motion toggle** (optional).
4. Verify against `wcag-checklist.md`.

---

## Path B — Existing project (extend to multi-theme, keep existing components)

The app already has its own markup and CSS. You will **not** rewrite its components. Instead you
make its existing styles consume theme tokens, so every theme re-skins the current UI. Steps:

### B1. Audit the app's current colors
Find hardcoded colors (hex/rgb/hsl/named) in the app's CSS/SCSS/styled-components/inline styles.
Group them by role: page background, card/panel surfaces, popovers/menus, primary text, secondary/
muted text, borders/dividers, control borders, focus outlines, links, primary action/brand color,
success, error/danger, info, warning.

### B2. Map each role to a token
Replace hardcoded values with `var(--token)` using this mapping (do not change layout, only colors):

| App role | Token |
|----------|-------|
| Page / body background (base) | `--bg` |
| Card / panel / raised surface | `--bg-panel` |
| Popover / menu / modal / dropdown surface | `--bg-elevated` |
| Primary body text | `--text` |
| Secondary / placeholder / disabled text | `--text-muted` |
| Subtle divider / hairline border | `--border` |
| Visible control border (input/button outline) | `--border-strong` |
| Focus outline / ring | `--focus-ring` |
| Primary action / brand accent | `--accent-pink` (or the closest accent to the brand hue) |
| Links / informational | `--accent-blue` |
| Success / confirm | `--accent-green` |
| Secondary accent / warning | `--accent-purple` |
| Text placed **on** a filled accent button | `--on-pink` / `--on-green` / `--on-blue` / `--on-purple` (match the fill) |

Semantic states: success→green, error/danger→pink, info→blue, warning→purple. (This brand uses
purple for warning rather than amber; if the app truly needs a distinct amber warning, note it — a
per-theme amber exists only in some themes, so keep warning on `--accent-purple` for cross-theme
consistency, or raise `adding-a-theme.md`.)

Notes:
- The tokens are defined on `:root` and `[data-theme]`, so the app's existing selectors keep working —
  they just read `var(--…)` now.
- For translucent fills/tints, use `color-mix(in srgb, var(--accent-x) N%, transparent)` or
  `color-mix(in srgb, var(--accent-x) N%, var(--bg-panel))` (opaque) instead of rgba literals.
- You usually only need `theme.css` (+ `effects.css` if you want the glow) for this path;
  `components.css` is optional and only if the app adopts our component classes.

### B3. Ensure a themeable root
Confirm the mapped variables resolve: since they live on `:root`, any element can read them. If the
app scopes styles oddly (e.g. shadow DOM in Angular), `theme.css` on `:root` still cascades in
(custom properties pierce shadow boundaries).

### B4. Add the theme selector + persistence (below), listing **all** themes.

### B5. Verify each theme renders
Load the app, switch through every theme, and confirm text/controls stay legible and the layout is
unchanged. The tokens are AA by construction, but **app-specific color pairs you created must be
re-checked** with `tools/contrast-checker/` (e.g. `node cli.mjs "<fg>" "<bg>" --min 4.5`). Check the
states in `wcag-checklist.md`.

---

## The theme selector (all stacks)

Requirements:
- Lists **all** themes from `themes.index.json` (`themes[]`), labeled `"<family label> · <Mode>"`,
  plus a default/"Auto" option (no `data-theme` → Rink Classic by OS).
- On change: set `document.documentElement.setAttribute('data-theme', id)` (or remove it for Auto).
- **Persist** to `localStorage` and **re-apply before first paint** to avoid a flash of the wrong theme.
- Optionally include a "Reduce motion" control that toggles `data-motion="off"` on `<html>`.

> **CRITICAL — no inline scripts.** Do **not** put the bootstrap or selector logic in an inline
> `<script>…</script>`. **Manifest V3 browser extensions and any strict-CSP site block inline
> scripts**, so the selector silently won't populate (a common failure). Always load JS from
> **external files** (`<script src="…">`). The theme-service ships two ready-made, CSP-safe helpers
> for exactly this — use them for vanilla/extension apps.

### Vanilla / browser-extension / any non-framework app (use the shipped helpers)
You vendored `theme-init.js` and `theme-select.js` in the common setup. Wire them with two
`<script src>` tags and a marked `<select>` — no inline JS, no fetch, works under MV3 CSP:

```html
<head>
  <!-- Applies the saved/deep-linked theme before first paint (no flash). MUST be external. -->
  <script src="theme/theme-init.js"></script>
  <link rel="stylesheet" href="theme/theme.css">
  <link rel="stylesheet" href="theme/effects.css">
  <link rel="stylesheet" href="popup.css"><!-- your app's own styles -->
</head>
<body>
  <!-- Anywhere in your UI. theme-select.js finds it by the data-theme-select attribute
       and fills it with all themes + an "Auto" option. -->
  <select data-theme-select aria-label="Theme"></select>
  <!-- Optional motion toggle: -->
  <label><input type="checkbox" data-motion-toggle> Reduce motion</label>

  <!-- ...your app... -->

  <!-- Populates + wires the selector/toggle. MUST be external (defer/end-of-body both fine). -->
  <script src="theme/theme-select.js"></script>
</body>
```
That's the whole integration. `theme-select.js` is generated with the current theme list baked in
(mirrors `themes.index.json`), persists to `localStorage`, and reflects `?theme=<id>` deep-links.
No build step needed. **Browser extension note:** the theme files sit inside the package (`theme/…`),
so they load as `'self'` under the default MV3 CSP; if the app uses a bundler, make sure its build
copies the `theme/` folder into the output (e.g. an esbuild/webpack copy step).

### Angular
- Add the vendored CSS to `angular.json` `styles[]` (or `@import` in `src/styles.css`):
  `"src/theme/theme.css", "src/theme/effects.css", "src/theme/components.css"`.
- For pre-paint theming, load `theme-init.js` via `src/index.html` `<head>` with
  `<script src="theme-init.js"></script>` (external — never inline), or set the attribute in an
  `APP_INITIALIZER`.
- Manage switching with a service (this is already external code, so it's CSP-safe):
```ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private root = inject(DOCUMENT).documentElement;
  themes = /* import themes.index.json */ THEMES.themes;
  set(id: string | null) {
    if (id) { this.root.setAttribute('data-theme', id); localStorage.setItem('theme', id); }
    else { this.root.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
  }
  setMotion(off: boolean) { off ? this.root.setAttribute('data-motion','off') : this.root.removeAttribute('data-motion'); }
}
```
- Bind a `<select>` in a settings/header component to `ThemeService.set(...)`, options from `themes`.
  (You don't need `theme-select.js` — the service is your selector wiring.)

### React
- Import the CSS once at the app root: `import './theme/theme.css'; import './theme/effects.css'; import './theme/components.css';`
- For pre-paint theming, load `theme-init.js` as an external script in `index.html` `<head>`
  (Vite/CRA/Next `_document`) — not an inline script.
- Manage switching with a hook/provider (external code, CSP-safe):
```tsx
import themesIndex from './theme/themes.index.json';
function useTheme() {
  const [id, setId] = useState(() => localStorage.getItem('theme') || '');
  useEffect(() => {
    const r = document.documentElement;
    if (id) { r.setAttribute('data-theme', id); localStorage.setItem('theme', id); }
    else { r.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
  }, [id]);
  return { id, setId, themes: themesIndex.themes };
}
// render <select value={id} onChange={e=>setId(e.target.value)}> with a "" Auto option + themes.map(...)
```
- Tokens are consumable from CSS Modules, styled-components (`var(--accent-pink)`), Tailwind
  (`colors: { pink: 'var(--accent-pink)' }`), or inline styles. (No `theme-select.js` needed — the
  hook is your selector wiring.)

---

## Verification (all paths)
1. App loads with **Rink Classic** default (dark, or light if OS prefers light).
2. Selector lists **every** theme; switching re-skins the whole UI; choice persists across reload
   with **no flash** of the previous theme. **Test in the real runtime** (the actual extension via
   `chrome://extensions` → Load unpacked, or the served app), not just a `file://` preview — inline
   scripts that work in a plain file will be **blocked by MV3/CSP** in the real app, leaving the
   selector empty. If the dropdown is empty, you have an inline-script/CSP problem (use the external
   `theme-select.js`). Open the console and check for CSP violation errors.
3. Keyboard-tab shows a visible focus ring on every control (`--focus-ring`).
4. `data-motion="off"` (or the reduce-motion control / OS setting) stops transitions & glow pulses.
5. Any app-specific color pairs pass `tools/contrast-checker/` at AA. Walk `wcag-checklist.md`.
6. Update `<vendor>/THEME-SERVICE.md` with the version + date applied.
