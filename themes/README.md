# Finalized Themes — Source of Truth

This folder is the **canonical theme system**. Apps consume these files; everything is
generated/validated from the palette source and is WCAG AA 2.2 compliant in every state.

## Files

| File | What it is |
|------|-----------|
| `theme.css` | All color tokens. `:root` = the default theme (**Rink Classic**, dark, auto-switching to light under `prefers-color-scheme: light`). Every theme is also a `[data-theme="<id>"]` block. **Generated** — do not hand-edit. |
| `effects.css` | Neon glow / grid / gradient-scrollbar recipes, as tokens. Motion-gated. |
| `components.css` | Opt-in class-based component styles (buttons, inputs, dropdown, switch, notices, tabs, …) with full focus/hover/active/disabled/expanded states. |
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
