# Finalized Themes

Apps consume these files. They're validated to WCAG AA 2.2 in every state. The token/registry/helper
files are **build output** — run `npm run build-themes` from the repo root to (re)generate them
(they're gitignored, not committed, so forks can pull origin updates conflict-free). The
hand-authored `effects.css`, `components.css`, and `preview.html` are committed. Source of truth =
the palette files (`tools/palettes/draft-*.mjs` built-in + `local.mjs` yours).

## Files

| File | What it is |
|------|-----------|
| `theme.css` | All color tokens. `:root` = the default theme (**Rink Classic**, dark, auto-switching to light under `prefers-color-scheme: light`). Every theme is also a `[data-theme="<id>"]` block. **Generated** — do not hand-edit. |
| `effects.css` | Neon glow / grid / gradient-scrollbar recipes, as tokens. Motion-gated. |
| `components.css` | Opt-in class-based component styles (buttons, inputs, dropdown, switch, notices, tabs, …) with full focus/hover/active/disabled/expanded states. |
| `dropdown.css` + `dropdown.js` | The **accessible dropdown / listbox** — a themed port of the `dropdown` component from the a11y-component-examples library. Optional; include both or neither. See "Accessible dropdown" below. |
| `tokens.json` | Structured mirror of every theme's tokens (for tooling / non-CSS consumers). |
| `themes.index.json` | Registry: families, modes, and the default — drives theme pickers and the add-theme flow. |
| `theme-init.js` | **External** (CSP-safe) script: applies the saved/`?theme=` theme before first paint. Load in `<head>`. |
| `theme-select.js` | **External** (CSP-safe, generated) script: populates & wires any `<select data-theme-select>` + `[data-motion-toggle]`. |
| `preview.html` | Live theme switcher + usage example. Open it in a browser. |

## Use it in an app

1. Include the three stylesheets (order matters: theme → effects → components):

   ```html
   <link rel="stylesheet" href="theme.css">
   <link rel="stylesheet" href="effects.css">
   <link rel="stylesheet" href="components.css">
   ```

2. Do nothing else and you get **Rink Classic**, dark by default and light when the OS
   prefers light. To force a specific theme, set `data-theme` on the root element:

   ```html
   <html data-theme="synthwave-sunset-dark">
   ```

3. Use the component classes in markup: `.btn.btn-solid.a-pink`, `.input`, `.field-label`,
   `.notice.success`, `.drop`, `.switch`, `.tab`, etc. (see `preview.html`). Or just consume the
   tokens (`var(--accent-pink)`, `var(--bg)`, …) in your own CSS.

4. **Disable animations** (beyond OS `prefers-reduced-motion`): set `data-motion="off"` on the
   root element. All transitions, press effects, and glow pulses stop.

Available theme ids: `rink-classic-{dark,light}`, `midnight-arcade-{dark,light}`,
`hot-neon-{dark,light}`, `synthwave-sunset-{dark,light}`, `acid-arcade-{dark,light}`.

## Theme selector (vanilla / extensions)

Two external scripts do it all — **never** inline them (Manifest V3 / strict CSP block inline
scripts, which silently leaves the dropdown empty):

```html
<head>
  <script src="theme-init.js"></script>   <!-- applies saved/?theme= theme before paint -->
  <link rel="stylesheet" href="theme.css">
  <link rel="stylesheet" href="effects.css">
</head>
<body>
  <select data-theme-select aria-label="Theme"></select>
  <label><input type="checkbox" data-motion-toggle> Reduce motion</label>
  <script src="theme-select.js"></script>  <!-- fills + wires the selector/toggle -->
</body>
```

`theme-select.js` is generated with the theme list baked in (mirrors `themes.index.json`) and
persists the choice. React/Angular use their own provider instead — see the skill's
`applying-themes.md`.

Options are emitted **grouped by family** (`<optgroup>`), each carrying `data-ac-swatch` (that
theme's four accents) and `data-ac-secondary` (its id). A plain `<select>` ignores those two
attributes and just shows the label — so the snippet above is unchanged. To render them, add
`data-ac-dropdown` and load `dropdown.js`:

```html
<span id="theme-cap">Theme</span>
<select data-theme-select data-ac-dropdown aria-labelledby="theme-cap"></select>
<script src="dropdown.js"></script>
<script src="theme-select.js"></script>
```

Either script order works. Without `data-ac-dropdown` nothing changes, so an app that vendored an
earlier version keeps its native control through an update.

## Accessible dropdown (`dropdown.css` + `dropdown.js`)

A themed port of the `dropdown` component from the **a11y-component-examples** library, kept
line-for-line with upstream so fixes there port straight across — only the skin is ours. It is the
control the theme picker in `preview.html`'s header uses.

It **progressively enhances a real `<select>`**. The native element stays in the DOM as the value
store, so `.value`, `.selectedIndex`, `change` listeners and form submission keep working — you can
drop it onto an existing form and nothing downstream needs to know.

```html
<div class="field">
  <label class="field-label" for="region">Region</label>
  <select id="region" data-ac-dropdown>
    <optgroup label="Americas">
      <option value="us-east">US East</option>
      <option value="sa-east" disabled>South America (at capacity)</option>
    </optgroup>
  </select>
</div>
```

Anything with `[data-ac-dropdown]` is enhanced on `DOMContentLoaded`. Per-option decoration, all
optional:

| Attribute | Renders | In the accessible name? |
| --------- | ------- | ----------------------- |
| `data-ac-icon="<symbol id>"` | `<use href="#id">` from an SVG sprite | No — `aria-hidden` decoration |
| `data-ac-swatch="#hex,#hex,…"` | a color strip | No — `aria-hidden` decoration |
| `data-ac-secondary="text"` | a muted second line | **Yes** — it is content, not filler |
| `data-ac-empty-text="…"` | the empty-state message | — |

One attribute goes on the `<select>` rather than an option:

| Attribute | Effect |
| --------- | ------ |
| `data-ac-anchor="<css selector>"` | Size and align the open panel to the nearest matching **ancestor** instead of to the trigger |

Use it when the trigger sits inside a group — a label cap, an addon, an icon rail — so that what
the user reads as "the control" is the whole group. Without it the panel starts partway across the
group and looks detached. The site header does exactly this
(`data-ac-anchor=".theme-console"`), which is why its list spans the cap and the lamps too. It is
opt-in: with no attribute the panel matches the trigger, the way a native `<select>` behaves.

Supports plain lists, icons, swatches, secondary text, `<optgroup>` hierarchies, disabled options,
and the empty state. Keyboard: `↓`/`↑` (wrapping), `Home`/`End`, `Enter`/`Space`, `Esc`, `Tab`, and
type-ahead. When open, DOM focus moves onto the option itself rather than using
`aria-activedescendant`, because the latter is unreliable on VoiceOver for iOS and TalkBack.

The panel is `position: fixed` and promoted to the **top layer** via the Popover API, so an ancestor
with `overflow: hidden` or a `transform` cannot clip it. It re-anchors on scroll/resize and flips
above the trigger when there is more room there. It takes its width and left edge from its anchor
(the trigger, or `data-ac-anchor` — see above), so the anchor's width is what sizes the list.

```js
const dd = AC.createDropdown(el, { emptyText: 'Nothing saved yet', anchor: groupEl });
dd.rebuild();  // after you change the options — the rows are not observed
dd.sync();     // after you set select.value programmatically
dd.destroy();  // unbinds and restores the native <select>
```

Idempotent — a second call on the same element returns the existing instance. `<select multiple>`
is deliberately left native (different keyboard model and ARIA contract).

**Gotchas.** Give it a real label (`<label for>`, `aria-labelledby`, or `aria-label`); the script
forwards whichever it finds, along with `aria-describedby`. Call `rebuild()` after changing options.
A label pointing at a `display: none` element resolves to an empty name — if you hide a label
responsively, clip it instead. Prefer `<label for>` over a wrapping `<label>`, since the enhanced
control is a `<button>`.

## Framework notes

- **Vanilla:** link the CSS, toggle `data-theme` on `<html>`. Done.
- **Angular:** add the three files to `angular.json` `styles[]`; a small `ThemeService` sets
  `data-theme` via `Renderer2`. Tokens pierce view-encapsulation (custom properties cascade
  through Shadow DOM).
- **React:** import the CSS once at the app root; set `data-theme` from a context/provider.
  Tokens work in CSS Modules, styled-components, Tailwind (`var()`), or inline styles.

## Regenerate

Never edit `theme.css` / `tokens.json` / `themes.index.json` by hand — edit the palette
source and rebuild:

```
node tools/build-final.mjs --write       # from the current selected draft (draft-2)
```

The finalizer re-validates every color pair against WCAG AA and refuses to write on any failure.
