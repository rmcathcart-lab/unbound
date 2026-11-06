/* ===================== WORLD MAP =====================
 * The painted world (tools/pack_worldmap.py → WM_DEFS + art wm-*) shown full screen as stacked layers:
 * a base painting, then one transparent layer per land in paint order. Hovering a land (or tapping it on a
 * touch screen) lifts that layer a little and shows its name; the land the hero is in is always labelled.
 * Locked lands are drawn grey. An invisible SVG of simplified land outlines on top does the hit testing.
 */
var WorldMap = (function () {
  var D = (typeof WM_DEFS !== 'undefined') ? WM_DEFS : null;
  var ORDER = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];
  function art(k) { return (typeof ART_IMG !== 'undefined' && ART_IMG[k]) || ''; }
  function pct(v, of) { return (100 * v / of).toFixed(3) + '%'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var live = null; // the mounted map: { onResize }

  /* opts: { lands: [{ id, name, sub, status, cleared, fresh, locked }], current: 'L3', dropped: 'L2' | null,
   *         heroNode: <element drawn above the current land's card>, onEnter: function (id) {} } */
  function build(opts) {
    unmount();
    var root = document.createElement('div'); root.className = 'atlas-screen';
    if (!D) { root.textContent = 'The map is missing.'; return root; }
    var info = {}; (opts.lands || []).forEach(function (l) { info[l.id] = l; });
    var sea = document.createElement('div'); sea.className = 'atlas-sea'; if (art('wm-base')) sea.style.backgroundImage = 'url(' + art('wm-base') + ')'; root.appendChild(sea);
    var scroll = document.createElement('div'); scroll.className = 'atlas-scroll'; root.appendChild(scroll);
    var atlas = document.createElement('div'); atlas.className = 'atlas'; scroll.appendChild(atlas);
    var base = document.createElement('img'); base.className = 'atlas-base'; base.alt = ''; base.src = art('wm-base'); base.draggable = false; atlas.appendChild(base);
    var pieces = {}, labels = {}, regions = {};
    D.regions.forEach(function (r) { regions[r.id] = r; });
    D.order.forEach(function (id, i) {
      var r = regions[id], l = info[id] || { locked: true };
      var im = document.createElement('img'); im.className = 'atlas-piece' + (l.locked ? ' locked' : '') + (id === opts.current ? ' current' : '');
      im.alt = ''; im.draggable = false; im.src = art('wm-' + id.toLowerCase()); im.setAttribute('data-land', id);
      im.style.left = pct(r.x, D.w); im.style.top = pct(r.y, D.h); im.style.width = pct(r.w, D.w); im.style.height = pct(r.h, D.h); im.style.zIndex = 2 + i;
      im.style.transformOrigin = pct(r.lx - r.x, r.w) + ' ' + pct(r.ly - r.y, r.h);
      atlas.appendChild(im); pieces[id] = im;
    });
    // hit layer: one outline per land; open lands are buttons, locked ones only show their name
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'atlas-hit'); svg.setAttribute('viewBox', '0 0 ' + D.w + ' ' + D.h); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'World map');
    var ids = ORDER.concat(D.order.filter(function (id) { return ORDER.indexOf(id) < 0; })); // keyboard order follows the land numbers
    ids.forEach(function (id) {
      var r = regions[id]; if (!r) return; var l = info[id] || { locked: true };
      var p = document.createElementNS(NS, 'path'); p.setAttribute('d', r.path); p.setAttribute('fill-rule', 'evenodd');
      p.setAttribute('class', 'mnode' + (l.locked ? ' locked' : ' open') + (l.fresh ? ' fresh' : '') + (id === opts.current ? ' current' : ''));
      p.setAttribute('data-land', id); p.setAttribute('aria-label', (l.name || r.name) + (l.locked ? ', locked' : ''));
      p.setAttribute('role', l.locked ? 'img' : 'button'); p.setAttribute('tabindex', l.locked ? '-1' : '0');
      svg.appendChild(p);
    });
    atlas.appendChild(svg);
    // labels: only the current land's is shown until a land is hovered or tapped
    D.regions.forEach(function (r) {
      var l = info[r.id] || { name: r.name, sub: 'Farther down the road', status: 'Not yet reached', locked: true };
      var lb = document.createElement('div'); lb.className = 'atlas-label' + (l.locked ? ' locked' : '') + (r.id === opts.current ? ' current show' : '');
      lb.style.left = pct(r.lx, D.w); lb.style.top = pct(r.ly, D.h); lb.setAttribute('data-land', r.id);
      lb.innerHTML =
        '<span class="nm">' + esc(l.name) + '</span>' + (l.sub ? '<span class="sb">' + esc(l.sub) + '</span>' : '') +
        (l.status ? '<span class="st' + (l.cleared ? ' cleared' : '') + '">' + l.status + '</span>' : '') +
        (l.locked ? '' : '<span class="tap">Tap again to travel</span>');
      if (r.id === opts.current && opts.heroNode) { var here = document.createElement('span'); here.className = 'here'; here.appendChild(opts.heroNode); lb.insertBefore(here, lb.firstChild); }
      atlas.appendChild(lb); labels[r.id] = lb;
    });
    if (opts.dropped && regions[opts.dropped]) { var dr = regions[opts.dropped], orb = document.createElement('div'); orb.className = 'atlas-drop'; orb.title = 'Your lost Lore lies here'; orb.style.left = pct(dr.lx, D.w); orb.style.top = pct(dr.ly, D.h); atlas.appendChild(orb); }
    var hint = document.createElement('div'); hint.className = 'atlas-hint';
    hint.innerHTML = '<span class="mouse">Hover over a land to see its name. Click to travel there.</span><span class="touch">Tap a land to see its name. Tap again to travel there.</span> Grey lands are still locked.';
    root.appendChild(hint);

    var hover = null, lastPointer = 'mouse', downAt = 0;
    function setHover(id) {
      if (hover === id) return;
      if (hover) { if (pieces[hover]) pieces[hover].classList.remove('lift'); if (labels[hover]) { labels[hover].classList.remove('hot'); if (hover !== opts.current) labels[hover].classList.remove('show'); } }
      hover = id;
      if (id) { root.classList.add('used'); if (pieces[id]) pieces[id].classList.add('lift'); if (labels[id]) labels[id].classList.add('show', 'hot'); }
      root.classList.toggle('hovering', !!id);
    }
    function enter(id) { var l = info[id]; if (!l || l.locked) return; if (opts.onEnter) opts.onEnter(id); }
    svg.addEventListener('pointerdown', function (e) { lastPointer = e.pointerType || 'mouse'; downAt = Date.now(); });
    svg.addEventListener('pointerover', function (e) { if (e.pointerType === 'touch') return; if (e.pointerType === 'mouse') lastPointer = 'mouse'; var t = e.target.closest && e.target.closest('.mnode'); setHover(t ? t.getAttribute('data-land') : null); });
    svg.addEventListener('pointerleave', function (e) { if (e.pointerType !== 'touch') setHover(null); });
    svg.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.mnode'), id = t && t.getAttribute('data-land');
      if (!id) { setHover(null); return; }
      if (lastPointer !== 'mouse' && lastPointer !== 'pen' && hover !== id) { setHover(id); root.classList.add('touched'); return; } // first tap shows the land
      enter(id);
    });
    svg.addEventListener('focusin', function (e) { if (Date.now() - downAt < 800) return; var t = e.target.closest && e.target.closest('.mnode'); if (t) setHover(t.getAttribute('data-land')); });
    svg.addEventListener('keydown', function (e) { var t = e.target.closest && e.target.closest('.mnode'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); enter(t.getAttribute('data-land')); } });

    var centred = false;
    function fit() {
      if (!root.isConnected) return;
      var hud = document.querySelector('.hud'), top = hud && !hud.hidden ? Math.max(0, hud.getBoundingClientRect().bottom) : 0;
      root.style.top = top + 'px';
      var aw = root.clientWidth || window.innerWidth, ah = window.innerHeight - top, s = Math.min(aw / D.w, ah / D.h);
      if (aw / ah < 1.05) s = Math.max(s, ah / D.h); // portrait phone: fill the height and pan sideways
      var w = Math.round(D.w * s), h = Math.round(D.h * s);
      atlas.style.width = w + 'px'; atlas.style.height = h + 'px';
      atlas.style.marginLeft = Math.max(0, Math.round((aw - w) / 2)) + 'px'; atlas.style.marginTop = Math.max(0, Math.round((ah - h) / 2)) + 'px';
      root.classList.toggle('pan', w > aw + 2);
      root.style.setProperty('--u', (w / 1000).toFixed(4)); // labels scale with the map
      if (w > aw + 2 && !centred) { var cr = regions[opts.current] || regions.L1; scroll.scrollLeft = Math.max(0, cr.lx * s - aw / 2); }
      centred = true;
    }
    function onResize() { centred = centred && true; fit(); }
    window.addEventListener('resize', onResize);
    live = { onResize: onResize };
    requestAnimationFrame(fit); setTimeout(fit, 80);
    return root;
  }
  function unmount() { if (!live) return; window.removeEventListener('resize', live.onResize); live = null; }
  return { build: build, unmount: unmount, ORDER: ORDER };
})();
if (typeof module !== 'undefined') module.exports = WorldMap;
