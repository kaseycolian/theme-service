/* =============================================================================
   build-final.mjs — promote a selected draft into the FINALIZED source of truth.
   Reads tools/palettes/draft-<n>.mjs (default draft 2), re-validates AA, and emits:
     themes/theme.css          :root default (auto dark/light) + every [data-theme] block
     themes/tokens.json        structured mirror of every theme's tokens
     themes/themes.index.json  registry (families, modes, default) for the add-theme flow
     VERSION                    repo version stamp (root)

   Run:  node tools/build-final.mjs            # validate + report
         node tools/build-final.mjs --write    # + write the files
         node tools/build-final.mjs 2 --write  # explicit source draft

   Theme ids are clean `<family>-<mode>` (e.g. rink-classic-dark). The default family
   renders on :root, dark by default, switching to its light variant under
   `prefers-color-scheme: light` when no explicit data-theme is set.
   ============================================================================= */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { contrastRatio, round2 } from './contrast-checker/contrast.mjs';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '0.2.0';
const DEFAULT_FAMILY = 'rink-classic';

const srcDraft = process.argv.find(a => /^\d+$/.test(a)) || '3';
const { palettes: P } = await import(`./palettes/draft-${srcDraft}.mjs`);

// token key -> CSS custom property
const VARMAP = {
  bg:'--bg', panel:'--bg-panel', elevated:'--bg-elevated', text:'--text', muted:'--text-muted',
  border:'--border', borderStrong:'--border-strong', focus:'--focus-ring',
  pink:'--accent-pink', onPink:'--on-pink', green:'--accent-green', onGreen:'--on-green',
  blue:'--accent-blue', onBlue:'--on-blue', purple:'--accent-purple', onPurple:'--on-purple',
};
const accents = ['pink', 'green', 'blue', 'purple'];
const cap = a => a[0].toUpperCase() + a.slice(1);

// Derive finalized metadata from a draft id like "dark-01-rink-classic".
function meta(draftId, p) {
  const m = draftId.match(/^(?:dark|light)-\d+-(.+)$/);
  const familyPart = m ? m[1] : draftId;
  const noBg = familyPart.endsWith('-no-background');
  const family = noBg ? familyPart.slice(0, -'-no-background'.length) : familyPart;
  // Finalized id keeps mode adjacent to family, with the modifier last: rink-classic-dark-no-background
  const id = `${family}-${p.mode}${noBg ? '-no-background' : ''}`;
  return { id, family, mode: p.mode, label: p.label, noBg };
}

// ---------- AA validation (same matrix as the draft generator) ----------
function checksFor(p) {
  const c = [];
  const add = (fg, bg, min) => c.push({ min, ratio: round2(contrastRatio(p[fg], p[bg])) });
  add('text','bg',4.5); add('text','panel',4.5); add('muted','bg',4.5); add('muted','panel',4.5);
  for (const a of accents) { add(a,'bg',4.5); add(a,'panel',4.5); add('on'+cap(a),a,4.5); }
  add('focus','bg',3.0); add('focus','panel',3.0); add('borderStrong','panel',3.0);
  return c;
}
let failures = 0;
for (const [id, p] of Object.entries(P)) {
  const bad = checksFor(p).filter(x => x.ratio < x.min).length;
  if (bad) { failures += bad; console.log(`FAIL ${id} — ${bad}`); }
}
console.log(`Finalizing draft ${srcDraft}: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);

// ---------- Assemble finalized model ----------
const themes = {};        // id -> { meta, tokens{cssVar:value}, glow }
for (const [draftId, p] of Object.entries(P)) {
  const mt = meta(draftId, p);
  const tokens = {};
  for (const [k, v] of Object.entries(VARMAP)) tokens[v] = p[k];
  themes[mt.id] = { ...mt, colorScheme: p.mode, glow: p.mode === 'light' ? '0.35' : '1', grid: p.grid, tokens };
}
const families = {};
for (const t of Object.values(themes)) {
  families[t.family] ??= { family: t.family, label: t.label.replace(/ \(No Background\)$/, '') };
  // The primary dark/light for a family is the WITH-background variant, not the no-bg one.
  if (!t.noBg) families[t.family][t.mode] = t.id;
}
const defDark = families[DEFAULT_FAMILY].dark;
const defLight = families[DEFAULT_FAMILY].light;

// ---------- Emit ----------
if (process.argv.includes('--write')) {
  if (failures !== 0) { console.error('Refusing to write: fix contrast failures first.'); process.exit(1); }
  mkdirSync(join(REPO, 'themes'), { recursive: true });

  const block = (sel, t, indent = '') => {
    const lines = Object.entries(t.tokens).map(([v, val]) => `${indent}  ${v}: ${val};`);
    const gridLine = t.grid !== undefined ? `\n${indent}  --fx-grid-opacity: ${t.grid};` : '';
    return `${indent}${sel} {\n${indent}  color-scheme: ${t.colorScheme};\n${indent}  --glow-strength: ${t.glow};${gridLine}\n${lines.join('\n')}\n${indent}}`;
  };

  let css = `/* =============================================================================
   Theme Service — finalized themes. v${VERSION}. Source: draft-${srcDraft}.
   GENERATED by tools/build-final.mjs — do not edit by hand; edit the palette source
   and regenerate. Pair with effects.css + components.css.

   Usage: include theme.css (+ effects.css + components.css). With no data-theme,
   the default (${families[DEFAULT_FAMILY].label}) renders — dark, or light under
   prefers-color-scheme: light. Force any theme with <html data-theme="<id>">.
   Theme ids: ${Object.keys(themes).join(', ')}.
   ============================================================================= */\n\n`;

  css += `/* Default theme (${families[DEFAULT_FAMILY].label}) — auto dark/light by OS preference. */\n`;
  css += block(':root', themes[defDark]) + '\n\n';
  css += `@media (prefers-color-scheme: light) {\n`;
  css += block(':root:not([data-theme])', themes[defLight], '  ') + '\n}\n\n';

  css += `/* All themes — force with data-theme="<id>". */\n`;
  for (const t of Object.values(themes)) css += block(`[data-theme="${t.id}"]`, t) + '\n\n';
  writeFileSync(join(REPO, 'themes/theme.css'), css);

  const tokensJson = {
    version: VERSION, source: `draft-${srcDraft}`,
    default: { family: DEFAULT_FAMILY, dark: defDark, light: defLight },
    themes: Object.fromEntries(Object.values(themes).map(t =>
      [t.id, { label: t.label, family: t.family, mode: t.mode, colorScheme: t.colorScheme, glowStrength: Number(t.glow),
        ...(t.grid !== undefined ? { gridOpacity: t.grid } : {}), tokens: t.tokens }])),
  };
  writeFileSync(join(REPO, 'themes/tokens.json'), JSON.stringify(tokensJson, null, 2) + '\n');

  const index = {
    version: VERSION,
    default: { family: DEFAULT_FAMILY, dark: defDark, light: defLight },
    families: Object.values(families),
    themes: Object.values(themes).map(t => ({ id: t.id, label: t.label, family: t.family, mode: t.mode })),
  };
  writeFileSync(join(REPO, 'themes/themes.index.json'), JSON.stringify(index, null, 2) + '\n');

  // ---- CSP-safe helper scripts (external files — work in MV3 extensions & strict-CSP sites) ----
  const themeInit =
`/* theme-service v${VERSION} — theme-init.js
   Applies the saved (or ?theme= / ?motion=) theme BEFORE first paint, so there's no flash.
   Load in <head> via <script src="theme/theme-init.js"></script> (NOT inline — inline is blocked
   by Manifest V3 / strict CSP). CSP-safe. */
(function () {
  try {
    var p = new URLSearchParams(location.search);
    var t = p.get('theme') || localStorage.getItem('theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    if ((p.get('motion') || localStorage.getItem('motion')) === 'off')
      document.documentElement.setAttribute('data-motion', 'off');
  } catch (e) {}
})();
`;
  writeFileSync(join(REPO, 'themes/theme-init.js'), themeInit);

  const selectList = [{ id: '', label: `Auto (${families[DEFAULT_FAMILY].label})` }]
    .concat(Object.values(themes).map(t => ({ id: t.id, label: `${t.label} · ${t.mode[0].toUpperCase()}${t.mode.slice(1)}` })));
  const themeSelect =
`/* theme-service v${VERSION} — theme-select.js  (GENERATED; theme list mirrors themes.index.json)
   Populates and wires any <select data-theme-select> and any [data-motion-toggle] checkbox.
   Load via <script src="theme/theme-select.js"></script> (NOT inline — MV3/strict CSP blocks inline).
   Markup you provide:  <select data-theme-select aria-label="Theme"></select>
                        <input type="checkbox" data-motion-toggle> Reduce motion  (optional)
   For React/Angular, prefer the framework's own provider (see the skill) instead of this file. */
(function () {
  var THEMES = ${JSON.stringify(selectList)};
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var root = document.documentElement;
    var saved = '';
    try { saved = localStorage.getItem('theme') || ''; } catch (e) {}
    document.querySelectorAll('select[data-theme-select]').forEach(function (sel) {
      if (!sel.options.length) THEMES.forEach(function (t) { sel.add(new Option(t.label, t.id)); });
      // Reflect whatever is actually applied (data-theme wins over the stored value, e.g. ?theme=).
      sel.value = root.getAttribute('data-theme') || saved || '';
      sel.addEventListener('change', function () {
        var id = sel.value;
        if (id) { root.setAttribute('data-theme', id); try { localStorage.setItem('theme', id); } catch (e) {} }
        else { root.removeAttribute('data-theme'); try { localStorage.removeItem('theme'); } catch (e) {} }
      });
    });
    document.querySelectorAll('[data-motion-toggle]').forEach(function (cb) {
      cb.checked = root.getAttribute('data-motion') === 'off';
      cb.addEventListener('change', function () {
        if (cb.checked) { root.setAttribute('data-motion', 'off'); try { localStorage.setItem('motion', 'off'); } catch (e) {} }
        else { root.removeAttribute('data-motion'); try { localStorage.removeItem('motion'); } catch (e) {} }
      });
    });
  });
})();
`;
  writeFileSync(join(REPO, 'themes/theme-select.js'), themeSelect);

  writeFileSync(join(REPO, 'VERSION'), VERSION + '\n');
  console.log(`\nWrote themes/theme.css, tokens.json, themes.index.json, theme-init.js, theme-select.js (v${VERSION}, ${Object.keys(themes).length} themes) + VERSION`);
}
