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
   - Copy `themes.index.json` too — the selector reads it to list themes.
3. **Record the version.** Create `<vendor>/THEME-SERVICE.md` containing the copied `VERSION`
   (from the source repo root) and the date, e.g. `theme-service v0.1.0 — applied 2026-07-23`.
   This is what `updating-themes.md` diffs against later.
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

### Anti-flash bootstrap (put this inline in `<head>`, before stylesheets render content)
```html
<script>
  try {
    var t = localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    if (localStorage.getItem('motion') === 'off') document.documentElement.setAttribute('data-motion','off');
  } catch (e) {}
</script>
```

### Vanilla JS selector
```html
<select id="theme-select" class="select" aria-label="Theme"></select>
<script type="module">
  // themes.index.json copied alongside your theme CSS:
  const idx = await fetch(new URL('./theme/themes.index.json', import.meta.url)).then(r => r.json());
  const sel = document.getElementById('theme-select');
  sel.append(new Option('Auto (default)', ''));
  for (const t of idx.themes) sel.append(new Option(`${t.label} · ${t.mode}`, t.id));
  sel.value = localStorage.getItem('theme') || '';
  sel.addEventListener('change', () => {
    const id = sel.value;
    if (id) { document.documentElement.setAttribute('data-theme', id); localStorage.setItem('theme', id); }
    else { document.documentElement.removeAttribute('data-theme'); localStorage.removeItem('theme'); }
  });
</script>
```
(If `fetch` won't run over `file://`, inline the `themes[]` list instead.)

### Angular
- Add the vendored CSS to `angular.json` `styles[]` (or `@import` them in `src/styles.css`):
  `"src/theme/theme.css", "src/theme/effects.css", "src/theme/components.css"`.
- Put the anti-flash bootstrap in `src/index.html` `<head>`.
- Create a tiny service that sets the attribute via `Renderer2`/`DOCUMENT`:
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

### React
- Import the CSS once at the app root: `import './theme/theme.css'; import './theme/effects.css'; import './theme/components.css';`
- Put the anti-flash bootstrap in `index.html` `<head>` (Vite/CRA/Next `_document`).
- A minimal hook/provider:
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
  (`colors: { pink: 'var(--accent-pink)' }`), or inline styles.

---

## Verification (all paths)
1. App loads with **Rink Classic** default (dark, or light if OS prefers light).
2. Selector lists **every** theme; switching re-skins the whole UI; choice persists across reload
   with **no flash** of the previous theme.
3. Keyboard-tab shows a visible focus ring on every control (`--focus-ring`).
4. `data-motion="off"` (or the reduce-motion control / OS setting) stops transitions & glow pulses.
5. Any app-specific color pairs pass `tools/contrast-checker/` at AA. Walk `wcag-checklist.md`.
6. Update `<vendor>/THEME-SERVICE.md` with the version + date applied.
