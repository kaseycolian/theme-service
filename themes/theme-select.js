/* theme-service v0.2.0 — theme-select.js  (GENERATED; theme list mirrors themes.index.json)
   Populates and wires any <select data-theme-select> and any [data-motion-toggle] checkbox.
   Load via <script src="theme/theme-select.js"></script> (NOT inline — MV3/strict CSP blocks inline).
   Markup you provide:  <select data-theme-select aria-label="Theme"></select>
                        <input type="checkbox" data-motion-toggle> Reduce motion  (optional)
   For React/Angular, prefer the framework's own provider (see the skill) instead of this file. */
(function () {
  var THEMES = [{"id":"","label":"Auto (Rink Classic)"},{"id":"rink-classic-dark","label":"Rink Classic · Dark"},{"id":"rink-classic-dark-no-background","label":"Rink Classic (No Background) · Dark"},{"id":"midnight-arcade-dark","label":"Midnight Arcade · Dark"},{"id":"midnight-arcade-dark-no-background","label":"Midnight Arcade (No Background) · Dark"},{"id":"hot-neon-dark","label":"Hot Neon · Dark"},{"id":"hot-neon-dark-no-background","label":"Hot Neon (No Background) · Dark"},{"id":"synthwave-sunset-dark","label":"Synthwave Sunset · Dark"},{"id":"acid-arcade-dark","label":"Acid Arcade · Dark"},{"id":"rink-classic-light","label":"Rink Classic · Light"},{"id":"rink-classic-light-no-background","label":"Rink Classic (No Background) · Light"},{"id":"midnight-arcade-light","label":"Midnight Arcade · Light"},{"id":"midnight-arcade-light-no-background","label":"Midnight Arcade (No Background) · Light"},{"id":"acid-arcade-light","label":"Acid Arcade · Light"},{"id":"acid-arcade-light-no-background","label":"Acid Arcade (No Background) · Light"},{"id":"hot-neon-light","label":"Hot Neon · Light"},{"id":"synthwave-sunset-light","label":"Synthwave Sunset · Light"}];
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
