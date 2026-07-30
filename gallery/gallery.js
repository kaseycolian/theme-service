/* =============================================================================
   gallery.js — THE component gallery template. Single source of truth.

   Two pages render this, and nothing else renders a component sheet:

     themes/preview.html          once, as the finished theme (heading base 2)
     discovery/draft-N/index.html once per candidate palette (heading base 3)

   That is the whole point of the file: a card designed for one page appears on
   the other with no second edit. Layout lives in gallery.css; the components
   themselves are themes/components.css + themes/effects.css, so nothing here
   carries a color.

   Plain classic script — no ESM, no fetch, no dependencies — so it works from
   file:// (the discovery drafts) and under a strict CSP (external, never inline;
   see the MV3 note in skill/references/applying-themes.md).
   ============================================================================= */
(function () {
  'use strict';

  /* One symbol library for the whole document, injected by mount() or by the
     discovery render loop. <symbol> resolves by id, so 16 galleries can all
     point their <use href="#ac-icon-…"> at these three; the icons inherit
     currentColor, so every copy still paints in its own palette.

     `hidden` alone does NOT hide it: the UA rule that turns [hidden] into
     display:none declares an HTML default namespace, so its bare selectors skip
     elements in the SVG namespace and the sprite keeps SVG's default 300x150
     intrinsic box. gallery.css carries the real `.sprite { display: none }`. */
  var SPRITE = [
    '<svg class="sprite" hidden aria-hidden="true" focusable="false">',
    '  <symbol id="ac-icon-rocket" viewBox="0 0 16 16">',
    '    <path d="M8 1.5c2.5 1.4 4 4 4 6.6L10 11H6L4 8.1C4 5.5 5.5 2.9 8 1.5Z" fill="none"',
    '          stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
    '    <circle cx="8" cy="6.5" r="1.4" fill="currentColor"/>',
    '    <path d="M6 11.5 5 14.5l3-1.5 3 1.5-1-3" fill="none" stroke="currentColor"',
    '          stroke-width="1.4" stroke-linejoin="round"/>',
    '  </symbol>',
    '  <symbol id="ac-icon-flask" viewBox="0 0 16 16">',
    '    <path d="M6.5 1.5v4L2.8 12A1.5 1.5 0 0 0 4.1 14.5h7.8A1.5 1.5 0 0 0 13.2 12L9.5 5.5v-4"',
    '          fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
    '    <path d="M5.5 1.5h5M4.8 9.5h6.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    '  </symbol>',
    '  <symbol id="ac-icon-laptop" viewBox="0 0 16 16">',
    '    <rect x="2.5" y="3.5" width="11" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.4"/>',
    '    <path d="M1 12.5h14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    '  </symbol>',
    '</svg>',
  ].join('\n');

  /* The swatch dropdown is the one card whose CONTENT depends on where it is
     rendered, so its option rows are an input rather than markup in the body
     below. Default = the built-in theme families, for the preview page. The
     discovery page passes its own palette's four accents instead, because a
     fixed set of hexes would look identical in all 16 sections and prove
     nothing. */
  var BUILTIN_SWATCH_OPTIONS = [
    '<option value="rink" data-dropdown-swatch="#ff2ec4,#5bff3a,#3ceaff,#b57fff" selected>Rink Classic</option>',
    '<option value="midnight" data-dropdown-swatch="#f060c4,#54ffc4,#5cc8ff,#a888f5">Midnight Arcade</option>',
    '<option value="hot" data-dropdown-swatch="#ff3ec8,#6bff45,#22e0ff,#cf7bff">Hot Neon</option>',
    '<option value="synthwave" data-dropdown-swatch="#ff5d8f,#ffb03a,#4ad8ff,#c17bff">Synthwave Sunset</option>',
    '<option value="acid" data-dropdown-swatch="#ff4de0,#c6ff2e,#38f0ff,#b98cff">Acid Arcade</option>',
  ].join('\n              ');

  /* ---------------------------------------------------------------------------
     html({ sfx, heading, swatches }) -> the six <section class="cat"> blocks.

       sfx      suffix for every id / for / radio name and the in-page anchors.
                '' on a page with one gallery; the palette id in discovery, where
                16 copies share one document and duplicate ids would break both
                <label for> and the dropdown's aria-labelledby.
       heading  rank for .cat-title. 2 where the page <h1> is the page title
                (preview), 3 where an <h2> already names the palette (discovery).
                The Inputs sub-head follows at heading + 1.
       swatches "#hex,#hex,#hex,#hex" for the accent-swatch card, or null for the
                built-in theme list above.
     ------------------------------------------------------------------------- */
  function html(options) {
    var o = options || {};
    var sfx = o.sfx ? String(o.sfx) : '';
    var q = sfx ? '-' + sfx : '';              // id suffix
    var h = Number(o.heading) || 2;            // .cat-title rank
    var hs = h + 1;                            // .sub-head rank
    var here = sfx ? '#' + sfx : '#';          // "link to this page" target
    var swatchOptions = o.swatches
      ? '<option value="all" data-dropdown-swatch="' + o.swatches + '" selected>Pink · green · blue · purple</option>'
      : BUILTIN_SWATCH_OPTIONS;

    /* Every category is built through this, so the id / aria-labelledby /
       heading-rank contract holds by construction rather than by 6 careful
       copies. Slugs are the anchors preview.html's .cat-nav links. */
    function cat(slug, title, note, body) {
      return `
    <section class="cat" id="cat-${slug}${q}" aria-labelledby="h-${slug}${q}">
      <div class="cat-head">
        <h${h} class="cat-title" id="h-${slug}${q}">${title}</h${h}>
        <p class="cat-note">${note}</p>
      </div>
      ${body}
    </section>`;
    }

    return [

      /* ================= Typography ================= */
      cat('typography', 'Typography', 'Each rank carries its own accent and glow.', `
      <div class="cat-grid">
        <div class="block">
          <div class="block-title">Headings</div>
          <div class="t-h1">Skating Rink</div>
          <div class="t-h2">Neon Nights</div>
          <div class="t-h3">Section heading</div>
          <div class="t-h4">Sub label</div>
        </div>
        <div class="block">
          <div class="block-title">Body, links, mono</div>
          <p class="t-body">Body copy at a comfortable reading size. The quick brown fox
          jumps over the lazy dog.</p>
          <p><a href="${here}" class="t-link">An inline link</a> inside a paragraph.</p>
          <p class="t-muted">Muted secondary text for hints and metadata.</p>
          <p class="t-mono">https://example.com/mono/path?value=123</p>
        </div>
      </div>`),

      /* ================= Buttons ================= */
      cat('buttons', 'Buttons', 'Every fill carries its matching --on-* text color.', `
      <div class="cat-grid">
        <div class="block">
          <div class="block-title">Solid — one per accent</div>
          <div class="row">
            <button class="btn btn-solid a-pink">Pink</button>
            <button class="btn btn-solid a-green">Green</button>
            <button class="btn btn-solid a-blue">Blue</button>
            <button class="btn btn-solid a-purple">Purple</button>
          </div>
          <div class="row">
            <button class="btn btn-solid a-blue"><span class="spinner"></span>Loading</button>
            <button class="btn btn-solid a-pink" disabled>Disabled</button>
          </div>
        </div>
        <div class="block">
          <div class="block-title">Outline</div>
          <div class="row">
            <button class="btn btn-outline a-pink">Pink</button>
            <button class="btn btn-outline a-green">Green</button>
            <button class="btn btn-outline a-blue">Blue</button>
            <button class="btn btn-outline a-purple">Purple</button>
          </div>
        </div>
        <div class="block">
          <div class="block-title">Ghost &amp; icon</div>
          <div class="row">
            <button class="btn btn-ghost">Ghost</button>
            <button class="btn btn-ghost" disabled>Disabled</button>
          </div>
          <div class="row">
            <button class="btn-icon" aria-label="Settings">&#9881;</button>
            <button class="btn-icon" aria-label="Add">+</button>
            <button class="btn-icon" aria-label="Delete" disabled>&#215;</button>
          </div>
          <p class="hint">Hover, press and tab to these for hover / active / focus.</p>
        </div>
      </div>`),

      /* ================= Inputs =================
         The one category big enough to want an internal divider: the six
         enhanced-select variants sit under their own sub-head. */
      cat('inputs', 'Inputs', 'Focus, hover and disabled states all come from tokens.', `
      <div class="cat-grid">
        <div class="block">
          <div class="block-title">Text</div>
          <label class="field">
            <span class="field-label">Base URL</span>
            <input class="input" type="text" placeholder="https://example.com">
          </label>
          <label class="field">
            <span class="field-label">Notes</span>
            <textarea class="textarea" placeholder="Longer text…"></textarea>
          </label>
        </div>

        <div class="block">
          <div class="block-title">Input group, native select, disabled</div>
          <label class="field">
            <span class="field-label sub">Route name</span>
            <div class="input-group">
              <input class="input" type="text" placeholder="my-route">
              <button class="btn-icon" aria-label="Saved routes" title="Saved routes">&#9662;</button>
            </div>
          </label>
          <label class="field">
            <span class="field-label">Format</span>
            <select class="select"><option>Markdown</option><option>HTML</option><option>Plain text</option></select>
          </label>
          <label class="field">
            <span class="field-label">Disabled</span>
            <input class="input" type="text" value="Read only" disabled>
          </label>
        </div>

        <div class="block">
          <div class="block-title">Radios, checkboxes, switches</div>
          <div class="row" role="radiogroup" aria-label="Scope">
            <label class="choice"><input type="radio" name="scope${q}" checked>Whole page</label>
            <label class="choice"><input type="radio" name="scope${q}">Selection</label>
            <label class="choice"><input type="radio" name="scope${q}" disabled>Disabled</label>
          </div>
          <div class="row">
            <label class="choice"><input type="checkbox" checked>Include hidden</label>
            <label class="choice"><input type="checkbox">Strip styles</label>
            <label class="choice"><input type="checkbox" disabled>Disabled</label>
          </div>
          <div class="row">
            <label class="switch"><input type="checkbox" checked><span class="track"><span class="thumb"></span></span>Enabled</label>
            <label class="switch"><input type="checkbox"><span class="track"><span class="thumb"></span></span>Off</label>
            <label class="switch"><input type="checkbox" disabled><span class="track"><span class="thumb"></span></span>Disabled</label>
          </div>
        </div>
      </div>

      <h${hs} class="sub-head">Select — list organizations</h${hs}>

      <div class="cat-grid">
        <!-- 1 · plain: no decoration at all -->
        <div class="block">
          <div class="block-title">Plain</div>
          <div class="field">
            <label class="field-label" for="dd-plain${q}">Export format</label>
            <select id="dd-plain${q}" data-dropdown>
              <option value="md" selected>Markdown</option>
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
              <option value="txt">Plain text</option>
            </select>
          </div>
        </div>

        <!-- 2 · icons + a second line of text per row -->
        <div class="block">
          <div class="block-title">Icons + secondary text</div>
          <div class="field">
            <label class="field-label" for="dd-env${q}">Environment</label>
            <select id="dd-env${q}" data-dropdown>
              <option value="prod" data-dropdown-icon="ac-icon-rocket" data-dropdown-secondary="app.example.com" selected>Production</option>
              <option value="staging" data-dropdown-icon="ac-icon-flask" data-dropdown-secondary="staging.example.com">Staging</option>
              <option value="local" data-dropdown-icon="ac-icon-laptop" data-dropdown-secondary="localhost:3000">Local</option>
            </select>
          </div>
        </div>

        <!-- 3 · hierarchy via <optgroup>, plus an unavailable option. The
             disabled one stays in the list rather than being dropped from it. -->
        <div class="block">
          <div class="block-title">Grouped + unavailable row</div>
          <div class="field">
            <label class="field-label" for="dd-region${q}">Region</label>
            <select id="dd-region${q}" data-dropdown>
              <optgroup label="Americas">
                <option value="us-east">US East</option>
                <option value="us-west">US West</option>
                <option value="sa-east" disabled>South America (at capacity)</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="eu-west" selected>EU West</option>
                <option value="eu-north">EU North</option>
              </optgroup>
              <optgroup label="Asia Pacific">
                <option value="ap-south">AP South</option>
                <option value="ap-northeast">AP Northeast</option>
              </optgroup>
            </select>
          </div>
        </div>

        <!-- 4 · color swatches — the header's theme picker in miniature -->
        <div class="block">
          <div class="block-title">Color swatches</div>
          <div class="field">
            <label class="field-label" for="dd-palette${q}">Accent order</label>
            <select id="dd-palette${q}" data-dropdown>
              ${swatchOptions}
            </select>
          </div>
        </div>

        <!-- 5 · the state everyone forgets to design. Say what is missing. -->
        <div class="block">
          <div class="block-title">Empty state</div>
          <div class="field">
            <label class="field-label" for="dd-empty${q}">Saved filter</label>
            <select id="dd-empty${q}" data-dropdown data-dropdown-empty-text="No saved filters yet"></select>
          </div>
        </div>

        <!-- 6 · disabled -->
        <div class="block">
          <div class="block-title">Disabled</div>
          <div class="field">
            <label class="field-label" for="dd-locked${q}">Plan</label>
            <select id="dd-locked${q}" data-dropdown disabled>
              <option value="team" selected>Team (contact sales to change)</option>
            </select>
          </div>
        </div>
      </div>`),

      /* ================= Feedback ================= */
      cat('feedback', 'Feedback', 'Status never rides on hue alone — each pairs color with a glyph or a word.', `
      <div class="cat-grid">
        <div class="block">
          <div class="block-title">Notices</div>
          <div class="notice info"><span class="icon">&#9432;</span><span>Heads up — this is an informational message.</span></div>
          <div class="notice success"><span class="icon">&#10003;</span><span>Success — your file was saved.</span></div>
          <div class="notice warn"><span class="icon">&#9888;</span><span>Warning — double-check this value.</span></div>
          <div class="notice error"><span class="icon">&#10007;</span><span>Error — something went wrong.</span></div>
        </div>
        <div class="block">
          <div class="block-title">Badges, chips, tooltip, status</div>
          <div class="row">
            <span class="badge">New</span>
            <span class="badge solid">Beta</span>
            <button class="chip-toggle" aria-pressed="true">Filter A</button>
            <button class="chip-toggle" aria-pressed="false">Filter B</button>
          </div>
          <div class="row">
            <span class="tip" tabindex="0" aria-label="Tooltip demo"><span class="badge">Hover me</span><span class="tip-body" role="tooltip">Tooltip text</span></span>
          </div>
          <div class="row">
            <span class="status ok">&#10003; Ready</span>
            <span class="status err">&#10007; Failed</span>
            <span class="status mut">Idle</span>
          </div>
        </div>
      </div>`),

      /* ================= Surfaces ================= */
      cat('surfaces', 'Surfaces', 'Tabs, grouped fields, the result readout and the gradient scrollbar.', `
      <div class="cat-grid">
        <div class="block">
          <div class="block-title">Tabs</div>
          <div class="tabs" role="tablist">
            <button class="tab" role="tab" aria-selected="true">Overview</button>
            <button class="tab" role="tab" aria-selected="false">Details</button>
            <button class="tab" role="tab" aria-selected="false">History</button>
          </div>
        </div>
        <div class="block">
          <div class="block-title">Grouped fields</div>
          <div class="group">
            <span class="field-label">Grouped fields</span>
            <input class="input" type="text" placeholder="Field in a group">
          </div>
        </div>
        <div class="block">
          <div class="block-title">Result readout</div>
          <div class="result">
            <div class="result-label">Result</div>
            <div class="result-url">https://app.example.com/generated/route?id=42</div>
          </div>
        </div>
        <div class="block">
          <div class="block-title">Scroll area — gradient scrollbar in Chrome/Edge</div>
          <div class="panel scrollbox fx-scroll" tabindex="0">
            <p class="t-body">Scroll me — the thumb is a pink→purple→blue gradient.</p>
            <p class="t-body">Line 2</p><p class="t-body">Line 3</p><p class="t-body">Line 4</p>
            <p class="t-body">Line 5</p><p class="t-body">Line 6</p><p class="t-body">Line 7</p>
            <p class="t-body">Line 8</p>
          </div>
        </div>
      </div>`),

      /* ================= App recreations =================
         The tokens doing real work, not posing as a swatch sheet. Both frames
         are miniatures of the two apps this theme system was extracted from. */
      cat('apps', 'App recreations', 'The palette doing real work, not posing as a swatch sheet.', `
      <div class="cat-grid wide">
        <div class="block">
          <div class="block-title">URL Maker — from chrome-extension-url-maker</div>
          <div class="app-frame fx-grid">
            <div class="app-head"><span class="app-title">URL Maker</span><span class="badge">v2</span></div>
            <div class="app-body">
              <label class="field"><span class="field-label">Base URL</span><input class="input" type="text" value="https://app.example.com"></label>
              <label class="field"><span class="field-label sub">Route</span>
                <div class="input-group"><input class="input" type="text" value="dashboard"><button class="btn-icon" aria-label="History">&#9662;</button></div>
              </label>
              <div class="result"><div class="result-label">Generated URL</div><div class="result-url">https://app.example.com/dashboard</div></div>
            </div>
            <div class="app-foot">
              <button class="btn btn-solid a-blue">Create</button>
              <button class="btn btn-solid a-green">Create &amp; Go</button>
            </div>
          </div>
        </div>

        <div class="block">
          <div class="block-title">Page to Markdown — from download-webpage-content</div>
          <div class="app-frame">
            <div class="app-head fx-bar-top"><span class="app-title">Page → Markdown</span></div>
            <div class="app-body">
              <div class="row" role="radiogroup" aria-label="Extraction scope">
                <label class="choice"><input type="radio" name="pm${q}" checked>Whole page</label>
                <label class="choice"><input type="radio" name="pm${q}">Main content</label>
              </div>
              <label class="choice"><input type="checkbox">Include hidden elements</label>
            </div>
            <div class="app-preview fx-scroll">
              <h1>Extracted Title</h1>
              <p>Rendered markdown preview with a <a href="${here}">link</a> and inline text.</p>
              <h2>Section</h2>
              <p>Paragraph under a section heading.</p>
              <pre>const theme = "neon";
console.log(theme);</pre>
              <blockquote>A blockquote, tinted with the purple accent.</blockquote>
              <hr>
              <h3>Footnotes</h3>
              <p>Trailing content below the divider.</p>
            </div>
            <div class="app-foot fx-bar-bottom">
              <button class="btn btn-outline a-pink">Copy</button>
              <button class="btn btn-outline a-green">Download</button>
            </div>
          </div>
        </div>
      </div>`),

    ].join('\n');
  }

  /* ---------------------------------------------------------------------------
     Mounting. A page declares a host:

       <div id="gallery" data-gallery data-gallery-heading="2"></div>

     and loads this file AFTER it (or with defer). Optional attributes:
     data-gallery-suffix, data-gallery-swatches, data-gallery-heading.

     Load this BEFORE themes/dropdown.js: whether we mount synchronously (host
     already parsed) or on DOMContentLoaded (script in <head>), the gallery's six
     [data-dropdown] selects are in the DOM before dropdown.js's own
     DOMContentLoaded pass runs, so it enhances them with no extra call.
     ------------------------------------------------------------------------- */
  function mount(host) {
    if (!host || host.getAttribute('data-gallery-mounted')) return;
    host.innerHTML = SPRITE + html({
      sfx: host.getAttribute('data-gallery-suffix') || '',
      heading: host.getAttribute('data-gallery-heading') || 2,
      swatches: host.getAttribute('data-gallery-swatches') || null,
    });
    host.setAttribute('data-gallery-mounted', '');
  }

  function mountAll() {
    var hosts = document.querySelectorAll('[data-gallery]');
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  var api = { html: html, SPRITE: SPRITE, mount: mount, mountAll: mountAll };

  if (typeof window !== 'undefined') {
    window.ThemeGallery = api;
    mountAll();                                             // host already parsed?
    document.addEventListener('DOMContentLoaded', mountAll); // idempotent, see mount()
  }
  // Lets a Node script (a future pre-render step) require this same file.
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
