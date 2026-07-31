/* theme-service — assemble-site.mjs
 *
 * Builds the GitHub Pages site tree (`_site/`) with clean, extension-less URLs:
 *
 *     /          -> the overview page   (docs/overview.html)
 *     /preview/  -> the themes preview  (themes/preview.html)
 *     /themes/*  -> the built theme assets (theme.css, *.js, ...)
 *
 * The source HTML files keep their `.html` links so they still open correctly
 * from the local filesystem; this script rewrites those links for the deployed
 * layout WITHOUT modifying the sources. Run `node tools/build-final.mjs <N> --write`
 * first so the generated theme assets exist under themes/.
 *
 * Every rewrite is an exact-string replace that fails loudly if the token is
 * absent — so a future edit that moves an asset link can't silently ship broken
 * URLs; the deploy (and the local dry-run) will error instead.
 */
import { readFileSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';

function rewrite(source, label, replacements) {
  let out = source;
  for (const [from, to] of replacements) {
    if (!out.includes(from)) {
      console.error(`ASSEMBLE FAIL: ${label}: expected to find ${JSON.stringify(from)} — source layout drifted?`);
      process.exit(1);
    }
    out = out.split(from).join(to);
  }
  return out;
}

// Fresh tree
rmSync('_site', { recursive: true, force: true });
mkdirSync('_site/preview', { recursive: true });

// Overview -> _site/index.html (site root). It lives in docs/, so its assets are
// referenced as ../themes/…; from the root they become themes/…
const home = rewrite(readFileSync('docs/overview.html', 'utf8'), 'docs/overview.html', [
  ['href="overview.html"', 'href="./"'],  // brand self-link -> site root
  ['../themes/preview.html', 'preview/'], // CTA -> clean preview URL (must precede the generic themes/ rewrite)
  ['../themes/', 'themes/'],              // asset links (css/js)
  ['../assets/', 'assets/'],              // favicon + its themer
]);
writeFileSync('_site/index.html', home);

// Preview -> _site/preview/index.html (/preview/). It lives in themes/, so its
// assets are same-dir (theme.css); from /preview/ they become ../themes/…
const preview = rewrite(readFileSync('themes/preview.html', 'utf8'), 'themes/preview.html', [
  ['href="../docs/overview.html"', 'href="../"'], // back link -> home
  ['src="theme-init.js"', 'src="../themes/theme-init.js"'],
  ['href="theme.css"', 'href="../themes/theme.css"'],
  ['href="effects.css"', 'href="../themes/effects.css"'],
  ['href="components.css"', 'href="../themes/components.css"'],
  ['href="dropdown.css"', 'href="../themes/dropdown.css"'],
  ['src="dropdown.js"', 'src="../themes/dropdown.js"'],
  ['src="theme-select.js"', 'src="../themes/theme-select.js"'],
]);
writeFileSync('_site/preview/index.html', preview);

// Theme assets (skip preview.html — it's already served at /preview/)
cpSync('themes', '_site/themes', {
  recursive: true,
  filter: (src) => !src.endsWith('preview.html'),
});

// The shared component gallery (gallery.js + gallery.css), which the preview page
// renders after its page head. No rewrite needed: preview.html lives in themes/ and
// links ../gallery/…, which resolves to the repo root here and to _site/gallery/
// from /preview/ — the same place either way.
cpSync('gallery', '_site/gallery', { recursive: true });

// Site assets (favicon + brand mark + the scripts that re-color them per theme).
// Served from
// /assets/ for both pages: the home page's ../assets/ was rewritten above, and
// /preview/ resolves ../assets/ to the same place.
// (skip full-resolution image sources — they're gitignored, so they don't exist
// in CI; excluding them keeps a local dry-run identical to the real deploy)
cpSync('assets', '_site/assets', {
  recursive: true,
  filter: (src) => !src.endsWith('header-image.png'),
});

// Sanity: the load-bearing files must exist
for (const f of ['_site/index.html', '_site/preview/index.html', '_site/themes/theme.css', '_site/themes/theme-init.js',
                 '_site/themes/dropdown.css', '_site/themes/dropdown.js',
                 '_site/gallery/gallery.js', '_site/gallery/gallery.css',
                 '_site/assets/favicon.svg', '_site/assets/favicon-theme.js',
                 '_site/assets/brand-mark.svg', '_site/assets/brand-mark-theme.js',
                 '_site/assets/site-header.css', '_site/assets/site-footer.css']) {
  if (!existsSync(f)) {
    console.error(`ASSEMBLE FAIL: missing ${f}`);
    process.exit(1);
  }
}

console.log('SITE OK — clean URLs: / (overview), /preview/ (preview)');
