# WCAG AA 2.2 verification checklist

Run through this after applying, updating, or adding a theme. The theme tokens are pre-validated, so
most failures come from **app-specific** color pairs or missing interactive states.

## Contrast (use `tools/contrast-checker/`)
- [ ] Body text vs its background ≥ **4.5:1** (normal), large/bold ≥ **3:1**.
- [ ] Muted/secondary/placeholder text ≥ **4.5:1** on every surface it appears on.
- [ ] Accent-colored text (labels, links, notice text) ≥ **4.5:1** on its surface.
- [ ] Text on filled accent buttons (`--on-*` on `--accent-*`) ≥ **4.5:1**.
- [ ] Focus ring, control borders, and UI-component boundaries ≥ **3:1** vs adjacent colors.
- [ ] Check in **every theme** the app offers, both dark and light.

## Interactive states — every control, every theme
For buttons, inputs, selects, the custom dropdown, radios/checkboxes, switches, chips, tabs, links:
- [ ] **Default** — legible, correct token colors.
- [ ] **Hover** — visible change; still AA.
- [ ] **Active/pressed** — visible; press transform present (and gone when motion off).
- [ ] **Focus-visible** — a clear ring (`--focus-ring`), not conveyed by color alone; keyboard-reachable.
- [ ] **Disabled** — visibly muted, `not-allowed`, not mistakable for enabled.
- [ ] **Expanded** (dropdown/accordion/tabs) — `aria-expanded`/`aria-selected` reflected visually.

## Motion
- [ ] OS `prefers-reduced-motion: reduce` stops transitions, press transforms, and glow pulses.
- [ ] Manual `data-motion="off"` on the root does the same, independent of the OS setting.

## Non-color signalling
- [ ] State isn't communicated by color alone (icons/text/shape accompany success/error/etc.).
- [ ] Selected/pressed states have a non-color indicator (underline, ring, fill + label).

## Theme switching
- [ ] Selector lists every theme; switching re-skins the whole UI with the existing structure intact.
- [ ] Choice persists across reload with **no flash** of the previous theme (anti-flash bootstrap).
