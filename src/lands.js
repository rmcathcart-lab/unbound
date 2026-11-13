/* ===================== LANDS: one designed layout per land =====================
 * Every land gets its own shape, not a re-roll of the same template. Each blueprint below starts from a single
 * spatial idea (its topology) and then applies the same level-design habits:
 *   - a readable big idea: hub, climb, maze, grid, loop around a landmark, spine, hourglass, twin forts, rings, canyon;
 *   - landmarks for finding your way, and the boss door shown early but reached late (foreshadowing);
 *   - loops back towards the bonfire (the Dark Souls shortcut habit) so exploring never means a long walk back;
 *   - a difficulty gradient: Beginning creatures near the fire, Progressing further out, Mastery on the risky
 *     branches and near the end; the Gate Key at the end of a guarded dead end (lock and key);
 *   - every dead end pays: a chest or a lost page waits at the end of side passages (risk / reward);
 *   - pacing: open areas (long sightlines, you are seen) alternate with tight passages (cover, ambush).
 * The same seed per land means every student walks the same land.
 * LandMaps.build(L, env) -> the map object Overworld expects, or null if the land has no blueprint. */
var LandMaps = (function () {
  'use strict';
  var G, SOLID, WALL, WATER, GROUND, GROUND2, PATH, DECO, GATE, FIRE, EDGE;

  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- a carving kit ---------- */
  function Kit(W, H, fill, r) {
    var t = new Uint8Array(W * H).fill(fill), k = { W: W, H: H, t: t, r: r };
    k.inb = function (x, y) { return x >= 1 && y >= 1 && x < W - 1 && y < H - 1; };
    k.get = function (x, y) { x = Math.round(x); y = Math.round(y); return (x < 0 || y < 0 || x >= W || y >= H) ? EDGE : t[y * W + x]; };
    k.set = function (x, y, v) { x = Math.round(x); y = Math.round(y); if (k.inb(x, y)) t[y * W + x] = v; };
    k.floor = function (x, y) { var v = k.get(x, y); return !SOLID[v] || v === GATE; };
    k.rect = function (x, y, w, h, v) { for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) k.set(xx, yy, v); };
    k.frame = function (x, y, w, h, v) { for (var xx = x; xx < x + w; xx++) { k.set(xx, y, v); k.set(xx, y + h - 1, v); } for (var yy = y; yy < y + h; yy++) { k.set(x, yy, v); k.set(x + w - 1, yy, v); } };
    // smooth value noise for organic edges
    k.noise = function (scale) {
      var gw = Math.ceil(W / scale) + 2, gh = Math.ceil(H / scale) + 2, grid = []; for (var i = 0; i < gw * gh; i++) grid.push(r());
      return function (x, y) { var gx = x / scale, gy = y / scale, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0; var a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1]; var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy; };
    };
    var nz = k.noise(4);
    // ellipse; rough > 0 roughens the rim with noise
    k.ell = function (cx, cy, rx, ry, v, rough, only) {
      rough = rough || 0;
      for (var y = Math.floor(cy - ry - 2); y <= Math.ceil(cy + ry + 2); y++) for (var x = Math.floor(cx - rx - 2); x <= Math.ceil(cx + rx + 2); x++) {
        var dx = (x - cx) / rx, dy = (y - cy) / ry, d = dx * dx + dy * dy, thr = 1 + (nz(x, y) - 0.5) * rough;
        if (d <= thr && (!only || only(k.get(x, y)))) k.set(x, y, v);
      }
    };
    k.disc = function (cx, cy, rad, v, rough, only) { k.ell(cx, cy, rad, rad, v, rough, only); };
    // a thick straight stroke of width w tiles
    k.seg = function (x0, y0, x1, y1, w, v, only) {
      var len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(len * 3)), lo = -Math.floor((w - 1) / 2), hi = lo + w - 1;
      for (var i = 0; i <= n; i++) { var px = Math.round(x0 + (x1 - x0) * i / n), py = Math.round(y0 + (y1 - y0) * i / n);
        for (var oy = lo; oy <= hi; oy++) for (var ox = lo; ox <= hi; ox++) if (!only || only(k.get(px + ox, py + oy))) k.set(px + ox, py + oy, v); }
    };
    // a road through points; wob > 0 makes it meander (midpoint displacement, seeded)
    k.road = function (pts, w, v, wob, only) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], b = pts[i], len = Math.hypot(b.x - a.x, b.y - a.y), n = wob ? Math.max(1, Math.round(len / 5)) : 1, nx = -(b.y - a.y) / (len || 1), ny = (b.x - a.x) / (len || 1);
        for (var j = 1; j <= n; j++) { var f = j / n, o = (j < n && wob) ? (r() - 0.5) * 2 * wob * Math.sin(Math.PI * f) : 0; out.push({ x: a.x + (b.x - a.x) * f + nx * o, y: a.y + (b.y - a.y) * f + ny * o }); }
      }
      for (var s = 1; s < out.length; s++) k.seg(out[s - 1].x, out[s - 1].y, out[s].x, out[s].y, w, v, only);
      return out;
    };
    k.ring = function (cx, cy, r0, r1, v) { for (var y = Math.floor(cy - r1 - 1); y <= cy + r1 + 1; y++) for (var x = Math.floor(cx - r1 - 1); x <= cx + r1 + 1; x++) { var d = Math.hypot(x - cx, y - cy); if (d >= r0 && d <= r1) k.set(x, y, v); } };
    // speckle: random tiles in a box become v
    k.scatter = function (x, y, w, h, v, p, only) { for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) if (r() < p && (!only || only(k.get(xx, yy)))) k.set(xx, yy, v); };
    // clumps: n blobs of radius ~rad of v, only over tiles accepted by `only`
    k.clumps = function (x, y, w, h, n, rad, v, only) { for (var i = 0; i < n; i++) k.disc(x + r() * w, y + r() * h, rad * (0.6 + r() * 0.7), v, 0.8, only); };
    // cellular-automaton caves inside a box: walls where `mask` is true get re-rolled, then smoothed
    k.cave = function (x, y, w, h, p, iters, keep) {
      var xx, yy, i;
      for (yy = y; yy < y + h; yy++) for (xx = x; xx < x + w; xx++) if (!keep || !keep(xx, yy)) k.set(xx, yy, r() < p ? WALL : GROUND);
      for (i = 0; i < iters; i++) {
        var nt = t.slice();
        for (yy = y; yy < y + h; yy++) for (xx = x; xx < x + w; xx++) { if (keep && keep(xx, yy)) continue; var c = 0; for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) if (k.get(xx + ox, yy + oy) === WALL || k.get(xx + ox, yy + oy) === EDGE) c++; if (k.inb(xx, yy)) nt[yy * W + xx] = c >= 5 ? WALL : GROUND; }
        t.set(nt);
      }
    };
    k.isWall = function (v) { return v === WALL; }; k.isFloorV = function (v) { return !SOLID[v]; }; k.notWater = function (v) { return v !== WATER; };
    return k;
  }

  /* ---------- the boss chamber: a walled room with one gate ---------- */
  function bossRoom(k, x, y, w, h, side, floorV) {
    k.rect(x, y, w, h, floorV || GROUND);
    var gate;
    if (side === 'S') gate = { x: x + Math.floor(w / 2), y: y + h };
    else if (side === 'N') gate = { x: x + Math.floor(w / 2), y: y - 1 };
    else if (side === 'W') gate = { x: x - 1, y: y + Math.floor(h / 2) };
    else gate = { x: x + w, y: y + Math.floor(h / 2) };
    var room = { x: x, y: y, w: w, h: h, gate: gate, side: side };
    room.boss = { x: x + Math.floor(w / 2) + (side === 'W' ? 1 : side === 'E' ? -1 : 0), y: y + Math.floor(h / 2) + (side === 'N' ? 1 : side === 'S' ? -1 : 0) };
    // the approach: three tiles of floor straight out from the gate, two wide
    var dx = side === 'E' ? 1 : side === 'W' ? -1 : 0, dy = side === 'S' ? 1 : side === 'N' ? -1 : 0;
    room.front = { x: gate.x + dx * 3, y: gate.y + dy * 3 };
    for (var i = 1; i <= 3; i++) { k.set(gate.x + dx * i, gate.y + dy * i, PATH); k.set(gate.x + dx * i + (dy ? 1 : 0), gate.y + dy * i + (dx ? 1 : 0), PATH); }
    return room;
  }
  function sealBoss(k, b) { // re-wall the rim (later carving may have nicked it), clear the floor, then set the gate
    for (var yy = b.y; yy < b.y + b.h; yy++) for (var xx = b.x; xx < b.x + b.w; xx++) if (SOLID[k.get(xx, yy)]) k.set(xx, yy, GROUND);
    k.frame(b.x - 1, b.y - 1, b.w + 2, b.h + 2, WALL);
    k.set(b.gate.x, b.gate.y, GATE);
    var dx = b.side === 'E' ? 1 : b.side === 'W' ? -1 : 0, dy = b.side === 'S' ? 1 : b.side === 'N' ? -1 : 0;
    for (var i = 1; i <= 2; i++) if (SOLID[k.get(b.gate.x + dx * i, b.gate.y + dy * i)]) k.set(b.gate.x + dx * i, b.gate.y + dy * i, PATH);
  }

  /* ---------- finishing: seal, connect, decorate, measure, populate ---------- */
  function finish(L, k, bp, th) {
    var W = k.W, H = k.H, t = k.t, r = k.r, i, x, y;
    for (x = 0; x < W; x++) { t[x] = EDGE; t[(H - 1) * W + x] = EDGE; } for (y = 0; y < H; y++) { t[y * W] = EDGE; t[y * W + W - 1] = EDGE; }
    sealBoss(k, bp.bossRoom);
    var sp = bp.spawn;
    for (y = sp.y - 1; y <= sp.y + 1; y++) for (x = sp.x - 1; x <= sp.x + 2; x++) if (SOLID[k.get(x, y)] && k.inb(x, y)) k.set(x, y, GROUND);
    // reachability from the fire (the gate counts as open); carve a link to anything that must be reachable but is not
    function flood() { var d = new Int32Array(W * H).fill(-1), q = [sp.x, sp.y], h = 0; d[sp.y * W + sp.x] = 0; while (h < q.length) { var qx = q[h++], qy = q[h++], dq = d[qy * W + qx]; for (var n = 0; n < 4; n++) { var nx = qx + (n === 0 ? 1 : n === 1 ? -1 : 0), ny = qy + (n === 2 ? 1 : n === 3 ? -1 : 0); if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; var tv = t[ny * W + nx]; if (SOLID[tv] && tv !== GATE) continue; if (d[ny * W + nx] >= 0) continue; d[ny * W + nx] = dq + 1; q.push(nx, ny); } } return d; }
    var dist = flood();
    function link(p) { // walk from p to the nearest reached tile, carving a 2-wide path
      var best = null, bd = 1e9; for (i = 0; i < W * H; i++) if (dist[i] >= 0) { var ix = i % W, iy = (i / W) | 0, dd = Math.abs(ix - p.x) + Math.abs(iy - p.y); if (dd < bd) { bd = dd; best = { x: ix, y: iy }; } }
      if (best) k.seg(p.x, p.y, best.x, best.y, 2, PATH, function (v) { return v !== GATE && v !== EDGE; });
      sealBoss(k, bp.bossRoom); dist = flood();
    }
    var must = [bp.bossRoom.front].concat(bp.areas.map(function (a) { return { x: Math.round(a.x), y: Math.round(a.y) }; }), bp.nooks, bp.key ? [bp.key] : []);
    must.forEach(function (p) { if (k.floor(p.x, p.y) && dist[p.y * W + p.x] >= 0) return; if (!k.floor(p.x, p.y)) k.rect(p.x, p.y, 2, 2, GROUND); if (dist[p.y * W + p.x] < 0) link(p); });
    // floor that cannot be reached becomes wall (no unreachable clearings showing through the fog)
    if (bp.fillPockets !== false) { var b0 = bp.bossRoom; for (i = 0; i < W * H; i++) { var px0 = i % W, py0 = (i / W) | 0; if (dist[i] < 0 && !SOLID[t[i]] && !(px0 >= b0.x && px0 < b0.x + b0.w && py0 >= b0.y && py0 < b0.y + b0.h)) t[i] = WALL; } }
    // floor texture and decoration (decoration never on roads)
    for (i = 0; i < W * H; i++) if (t[i] === GROUND) { var rv = r(); if (rv < (th.decoP || 0.06)) t[i] = DECO; else if (rv < 0.26) t[i] = GROUND2; }
    k.set(sp.x, sp.y, FIRE); k.set(sp.x + 1, sp.y, GROUND);
    dist = flood();
    // populate
    var used = [{ x: sp.x, y: sp.y, pad: 9 }], lairs = [];
    function ok(px, py, pad) { if (!k.inb(px, py)) return false; var v = k.get(px, py); if (SOLID[v] || v === FIRE || dist[py * W + px] < 0) return false; var b = bp.bossRoom; if (px >= b.x - 1 && px <= b.x + b.w && py >= b.y - 1 && py <= b.y + b.h) return false; return !used.some(function (u) { return Math.abs(u.x - px) <= Math.max(pad, u.pad || 0) && Math.abs(u.y - py) <= Math.max(pad, u.pad || 0); }); }
    function freeIn(a, pad) {
      for (var tries = 0; tries < 200; tries++) { var ang = r() * Math.PI * 2, rr = Math.sqrt(r()), px = Math.round(a.x + Math.cos(ang) * (a.rx || 2) * rr), py = Math.round(a.y + Math.sin(ang) * (a.ry || a.rx || 2) * rr); if (ok(px, py, pad)) return { x: px, y: py }; }
      for (var rad = 1; rad < 14; rad++) for (var oy = -rad; oy <= rad; oy++) for (var ox = -rad; ox <= rad; ox++) { var qx = Math.round(a.x) + ox, qy = Math.round(a.y) + oy; if (ok(qx, qy, pad)) return { x: qx, y: qy }; }
      return null;
    }
    var byLevel = { BEG: [], PRG: [], MAS: [] }; L.creatures.forEach(function (c) { byLevel[c.level].push(c); });
    var counts = bp.counts || { BEG: 3, PRG: 3, MAS: 2 };
    ['BEG', 'PRG', 'MAS'].forEach(function (tier) {
      var pool = bp.areas.filter(function (a) { return a.tier === tier; }); if (!pool.length) pool = bp.areas;
      var slot = 0;
      byLevel[tier].forEach(function (c) {
        for (var n = 0; n < counts[tier]; n++) {
          var a = pool[slot++ % pool.length], p = freeIn(a, 2);
          if (!p) continue; p.kind = 'creature'; p.ref = c; p.n = n; used.push(p); lairs.push(p);
        }
      });
    });
    function spot(p) { if (ok(p.x, p.y, 1)) return { x: p.x, y: p.y }; return freeIn({ x: p.x, y: p.y, rx: 2, ry: 2 }, 1); }
    var keyP = null, chests = [], pages = [], nooks = bp.nooks.slice(), pi = 0;
    if (!bp.bare) { keyP = spot(bp.key) || freeIn(bp.areas[bp.areas.length - 1], 1); keyP.kind = 'key'; used.push(keyP); } // a bare land (the final one) has no key, chests or pages
    function nextSpot() { while (nooks.length) { var p = spot(nooks.shift()); if (p) return p; } var a = bp.areas[(pi++ * 5 + 3) % bp.areas.length]; return freeIn(a, 1); }
    for (i = 0; i < (bp.bare ? 0 : bp.nChests || 9); i++) { var cp = nextSpot(); if (!cp) continue; cp.kind = 'chest'; cp.n = i; used.push(cp); chests.push(cp); }
    for (i = 0; i < (bp.bare ? 0 : bp.nPages || 5); i++) { var pp = nextSpot(); if (!pp) continue; pp.kind = 'page'; pp.n = i; used.push(pp); pages.push(pp); }
    var b = bp.bossRoom;
    (bp.braziers || []).forEach(function (p) { if (k.get(p.x, p.y) === DECO || k.get(p.x, p.y) === GROUND2) k.set(p.x, p.y, GROUND); });
    if (bp.props) for (i = 0; i < W * H; i++) if (t[i] === DECO) t[i] = GROUND; // hand-placed scenery only
    return { v2: true, layout: 'v5', w: W, h: H, tiles: t, spawn: { x: sp.x, y: sp.y }, lairs: lairs, gate: b.gate, boss: { x: b.boss.x, y: b.boss.y, kind: 'boss', ref: L.boss }, key: keyP, chests: chests, pages: pages, theme: th, rooms: [], dist: dist, lanes: [], name: bp.name, braziers: bp.braziers || [], props: bp.props || null };
  }

  /* =====================================================================
   * The blueprints. Coordinates are in tiles. Each returns
   *   { name, spawn, bossRoom, areas: [{x, y, rx, ry, tier}], key, nooks: [points for chests and pages] }
   * ===================================================================== */
  var BP = {};

  /* L1 · The Hollow Fields — FIELDS AND HEDGEROWS.
   * A patchwork of dead fields walled by hedgerows of tall dead wheat. Each field is a clearing; gaps in the hedges
   * join neighbouring fields (a spanning tree plus a few extra gaps, so there are loops). A cart track runs from the
   * bonfire in the south-west corner through the middle of the farm, and a flooded irrigation ditch cuts across it
   * with two plank bridges. The miller's hill sits in the north-east corner behind its gate. Harder creatures live
   * farther from the fire, measured in fields walked. */
  BP.L1 = function (k) {
    var r = k.r, W = k.W, H = k.H, NX = 6, NY = 4, CW = 13, CH = 13, ox = 3, oy = 2;
    k.rect(1, 1, W - 2, H - 2, WALL);
    var cells = [], i;
    for (var gy = 0; gy < NY; gy++) for (var gx = 0; gx < NX; gx++) {
      var c = { id: gy * NX + gx, gx: gx, gy: gy };
      var w = 8 + Math.floor(r() * 3), h = 7 + Math.floor(r() * 3);
      c.rm = { x: ox + gx * CW + 1 + Math.floor(r() * (CW - w - 1)), y: oy + gy * CH + 1 + Math.floor(r() * (CH - h - 1)), w: w, h: h };
      c.cx = c.rm.x + Math.floor(w / 2); c.cy = c.rm.y + Math.floor(h / 2); cells.push(c);
    }
    var spawnCell = (NY - 1) * NX, bossCell = NX - 1;
    // fields: rough-edged clearings (some corners left standing as uncut wheat)
    cells.forEach(function (c) { if (c.id === bossCell) return; var m = c.rm; k.rect(m.x, m.y, m.w, m.h, GROUND); for (var q = 0; q < 2; q++) k.disc(m.x + (r() < 0.5 ? 0 : m.w - 1), m.y + (r() < 0.5 ? 0 : m.h - 1), 1.4, WALL, 0.8); if (r() < 0.6) k.clumps(m.x + 2, m.y + 2, m.w - 4, m.h - 4, 1, 1.0, WALL); });
    // gaps in the hedges: spanning tree + extra loops
    var parent = {}, find = function (a) { while (parent[a] != null && parent[a] !== a) a = parent[a]; return a; };
    var edges = []; cells.forEach(function (c) { if (c.id === bossCell) return; if (c.gx < NX - 1 && c.id + 1 !== bossCell) edges.push([c, cells[c.id + 1]]); if (c.gy < NY - 1) edges.push([c, cells[c.id + NX]]); });
    edges.sort(function () { return r() - 0.5; }); var used = [], spare = [];
    edges.forEach(function (e) { var a = find(e[0].id), b = find(e[1].id); if (a !== b) { parent[a] = b; used.push(e); } else spare.push(e); });
    used = used.concat(spare.slice(0, 4));
    function gapRoad(a, b) { if (r() < 0.5) { k.seg(a.cx, a.cy, b.cx, a.cy, 2, GROUND, k.isWall); k.seg(b.cx, a.cy, b.cx, b.cy, 2, GROUND, k.isWall); } else { k.seg(a.cx, a.cy, a.cx, b.cy, 2, GROUND, k.isWall); k.seg(a.cx, b.cy, b.cx, b.cy, 2, GROUND, k.isWall); } }
    used.forEach(function (e) { gapRoad(e[0], e[1]); });
    // the cart track: bonfire -> middle of the farm -> the miller's hill (drawn over fields and gaps as PATH)
    var fire = { x: cells[spawnCell].rm.x + 2, y: cells[spawnCell].cy };
    var boss = bossRoom(k, ox + (NX - 1) * CW + 1, oy + 1, 11, 9, 'S');
    var mid1 = cells[2 * NX + 2], mid2 = cells[NX + 4];
    k.road([fire, { x: mid1.cx, y: fire.y }, { x: mid1.cx, y: mid1.cy }, { x: mid2.cx, y: mid1.cy }, { x: mid2.cx, y: mid2.cy }, { x: boss.front.x, y: mid2.cy }, boss.front], 2, PATH, 1.2);
    // the irrigation ditch: a band of water across the farm, crossed by the track and one more plank bridge
    var dy0 = oy + 2 * CH - 1, nz = k.noise(5);
    for (var x = 2; x < W - 2; x++) { var yy = dy0 + Math.round((nz(x, 3) - 0.5) * 4); for (var t2 = 0; t2 < 2; t2++) { var v = k.get(x, yy + t2); if (v === GROUND) k.set(x, yy + t2, WATER); } }
    for (var y = 2; y < H - 2; y++) for (x = 2; x < W - 2; x++) if (k.get(x, y) === WATER && (k.get(x, y - 1) === PATH || k.get(x, y + 1) === PATH)) k.set(x, y, PATH);
    var bx = cells[2 * NX + 4].cx; for (y = dy0 - 3; y < dy0 + 5; y++) for (var bb = 0; bb < 2; bb++) if (k.get(bx + bb, y) === WATER) k.set(bx + bb, y, PATH);
    // graph distance from the bonfire's field decides the tier of each field
    var adj = {}; used.forEach(function (e) { (adj[e[0].id] = adj[e[0].id] || []).push(e[1].id); (adj[e[1].id] = adj[e[1].id] || []).push(e[0].id); });
    var gd = {}; gd[spawnCell] = 0; var q = [spawnCell]; while (q.length) { var n = q.shift(); (adj[n] || []).forEach(function (m) { if (gd[m] == null) { gd[m] = gd[n] + 1; q.push(m); } }); }
    var rooms = cells.filter(function (c) { return c.id !== spawnCell && c.id !== bossCell; }).sort(function (a, b) { return (gd[a.id] || 0) - (gd[b.id] || 0); });
    var areas = rooms.map(function (c, j) { return { x: c.cx, y: c.cy, rx: Math.floor(c.rm.w / 2) - 1, ry: Math.floor(c.rm.h / 2) - 1, tier: j < 8 ? 'BEG' : j < 15 ? 'PRG' : 'MAS' }; });
    var far = rooms[rooms.length - 1], nooks = [];
    rooms.forEach(function (c) { var deg = (adj[c.id] || []).length; if (deg === 1) { nooks.push({ x: c.rm.x + 1, y: c.rm.y + 1 }); nooks.push({ x: c.rm.x + c.rm.w - 2, y: c.rm.y + c.rm.h - 2 }); } });
    rooms.forEach(function (c) { nooks.push({ x: c.rm.x + c.rm.w - 2, y: c.rm.y + 1 }); });
    return { name: 'fields and hedgerows', spawn: fire, bossRoom: boss, areas: areas, key: { x: far.rm.x + 1, y: far.rm.y + far.rm.h - 2 }, nooks: nooks };
  };
  /* L2 · The Salt Wastes — THE CRUST FLATS.
   * A dead sea bed: wide open salt flats (long sightlines, you are seen) cut into lanes by three crystal pressure
   * ridges that run across the way west, each broken by a few gaps. Brine pools and crystal outcrops dot the lanes.
   * The caravan track wanders from the bonfire in the south-west to the Brine Queen's palace in the north-east,
   * crossing each ridge at a gap. A walled crystal garden in the far north-west, with one way in, hides the key. */
  BP.L2 = function (k) {
    var r = k.r, W = k.W, H = k.H, isG = function (v) { return v === GROUND; };
    k.rect(1, 1, W - 2, H - 2, GROUND);
    var ridges = [[{ x: 22, y: 2 }, { x: 27, y: 22 }, { x: 33, y: 40 }, { x: 36, y: H - 2 }], [{ x: 44, y: 2 }, { x: 49, y: 20 }, { x: 53, y: 38 }, { x: 58, y: H - 2 }], [{ x: 62, y: 16 }, { x: 67, y: 32 }, { x: 72, y: H - 2 }]];
    var lines = ridges.map(function (p) { return k.road(p, 3, WALL, 2.5); });
    var gaps = [];
    var _g = 0; lines.forEach(function (ln, j) { [0.22, 0.55, 0.86].forEach(function (f, q) { if (j === 2 && q === 0) return; var pt = ln[Math.floor(f * (ln.length - 1))]; k.disc(pt.x, pt.y, 2.2, GROUND); gaps.push(pt); }); });
    // brine pools and crystal outcrops in the lanes
    k.clumps(6, 6, W - 12, H - 12, 9, 2.4, WATER, isG);
    k.clumps(4, 4, W - 8, H - 8, 34, 1.9, WALL, isG);
    // short spurs off the ridges: the lanes become a loose maze of crystal
    lines.forEach(function (ln) { for (var q = 2; q < ln.length - 2; q += 9) { var p0 = ln[q], dx = (r() < 0.5 ? -1 : 1) * (4 + r() * 6); k.road([p0, { x: p0.x + dx, y: p0.y + (r() - 0.5) * 6 }], 2, WALL, 1); } });
    // the crystal garden: a walled ring in the far north-west with one gap facing south-east; the key waits inside
    k.disc(11, 11, 7, GROUND); k.ring(11, 11, 7, 8.6, WALL); k.disc(16, 16, 1.8, GROUND);
    var fire = { x: 7, y: H - 8 };
    var boss = bossRoom(k, W - 17, 3, 13, 9, 'S');
    k.road([fire, { x: 18, y: 46 }, gaps[2], { x: 42, y: 40 }, gaps[4], { x: 60, y: 30 }, gaps[6], { x: boss.front.x, y: 24 }, boss.front], 2, PATH, 2);
    k.disc(fire.x, fire.y, 3, GROUND, 0.4);
    var nooks = [{ x: 4, y: 26 }, { x: 14, y: 30 }, { x: 4, y: 40 }, { x: 18, y: 56 }, { x: 30, y: 6 }, { x: 38, y: 14 }, { x: 28, y: 52 }, { x: 44, y: 56 }, { x: 52, y: 8 }, { x: 58, y: 48 }, { x: 64, y: 56 }, { x: 78, y: 40 }, { x: 80, y: 54 }, { x: 74, y: 20 }, { x: 40, y: 30 }, { x: 8, y: 8 }, { x: 14, y: 6 }];
    return {
      name: 'salt flats', spawn: fire, bossRoom: boss,
      areas: [
        { x: 12, y: 44, rx: 4, tier: 'BEG' }, { x: 22, y: 54, rx: 4, tier: 'BEG' }, { x: 10, y: 28, rx: 4, tier: 'BEG' },
        { x: 36, y: 18, rx: 4, tier: 'PRG' }, { x: 42, y: 46, rx: 4, tier: 'PRG' }, { x: 40, y: 32, rx: 3, tier: 'PRG' },
        { x: 56, y: 12, rx: 4, tier: 'MAS' }, { x: 64, y: 46, rx: 4, tier: 'MAS' }, { x: 76, y: 32, rx: 3, tier: 'MAS' }
      ],
      key: { x: 10, y: 10 }, nooks: nooks
    };
  };

  /* L3 · The Deep Quarry — THE SPIRAL PIT.
   * Three terraces cut in rings around the pit, each lower than the last, with Old Moraine's hall in the bottom.
   * Two ramps join each terrace to the next, never at the same angle, so you walk part of every ring on the way
   * down (and can always climb back by the other ramp). Stonecutters' niches bite into the walls; a flooded
   * cutting fills one side of the top terrace. A mine tunnel runs from the top terrace into the north-east
   * corner of the mountain, and the key waits at its end. Difficulty rises with depth. */
  BP.L3 = function (k) {
    var r = k.r, W = k.W, H = k.H, cx = Math.floor(W / 2), cy = Math.floor(H / 2), D = Math.PI / 180;
    function at(deg, rad) { return { x: Math.round(cx + rad * Math.cos(deg * D)), y: Math.round(cy - rad * Math.sin(deg * D)) }; }
    k.rect(1, 1, W - 2, H - 2, WALL);
    k.ring(cx, cy, 29, 33, GROUND); k.ring(cx, cy, 21, 25, GROUND); k.ring(cx, cy, 13, 17, GROUND);
    // ramps: radial cuts through the walls between terraces
    function ramp(deg, r0, r1) { k.road([at(deg, r0), at(deg, r1)], 3, PATH, 0); }
    ramp(20, 31, 23); ramp(300, 31, 23); ramp(120, 23, 15); ramp(200, 23, 15);
    // a worn track around each terrace
    [31, 23, 15].forEach(function (rad, j) { var pts = []; for (var a = 0; a <= 360; a += 15) pts.push(at(a, rad)); for (var q = 1; q < pts.length; q++) if (r() < 0.55) k.seg(pts[q - 1].x, pts[q - 1].y, pts[q].x, pts[q].y, 1, PATH, function (v) { return v === GROUND; }); });
    // stonecutters' niches cut outward from each terrace (the dead ends that pay)
    var nooks = [];
    [[60, 33], [100, 33], [160, 33], [210, 33], [290, 33], [340, 33], [80, 25], [180, 25], [300, 25], [40, 17], [150, 17], [200, 17]].forEach(function (n) { var outer = n[1] === 33, a = at(n[0], n[1] + 1), b = at(n[0], n[1] + (outer ? 3 : 1.5)); k.seg(a.x, a.y, b.x, b.y, outer ? 2 : 1, GROUND); k.disc(b.x, b.y, outer ? 1.6 : 0.8, GROUND); nooks.push(b); }); // inner niches stay shallow so they never break into the terrace above
    // a flooded cutting on the top terrace, and rubble heaps for cover
    var pool = at(250, 31); k.disc(pool.x, pool.y, 3.2, WATER, 0.6, function (v) { return v === GROUND; });
    [[45, 31], [230, 31], [10, 23], [200, 23], [100, 15], [290, 15]].forEach(function (h) { var p = at(h[0], h[1]); k.disc(p.x, p.y, 1.1, WALL, 0.5, function (v) { return v === GROUND; }); });
    // Old Moraine's hall at the bottom, its gate facing north onto the lowest terrace
    var boss = bossRoom(k, cx - 6, cy - 4, 12, 8, 'N');
    k.road([boss.front, at(90, 15)], 2, PATH, 0);
    // the mine tunnel: from the top terrace into the north-east corner
    var t0 = at(45, 33); k.road([t0, { x: W - 9, y: 9 }, { x: W - 6, y: 5 }], 2, GROUND, 1); k.disc(W - 6, 5, 2, GROUND);
    var fire = at(180, 31);
    k.disc(fire.x, fire.y, 2.6, GROUND, 0.3);
    return {
      name: 'spiral pit', spawn: fire, bossRoom: boss,
      areas: [
        { x: at(140, 31).x, y: at(140, 31).y, rx: 2, tier: 'BEG' }, { x: at(240, 31).x, y: at(240, 31).y, rx: 2, tier: 'BEG' }, { x: at(80, 31).x, y: at(80, 31).y, rx: 2, tier: 'BEG' },
        { x: at(60, 23).x, y: at(60, 23).y, rx: 2, tier: 'PRG' }, { x: at(170, 23).x, y: at(170, 23).y, rx: 2, tier: 'PRG' }, { x: at(290, 23).x, y: at(290, 23).y, rx: 2, tier: 'PRG' },
        { x: at(30, 15).x, y: at(30, 15).y, rx: 2, tier: 'MAS' }, { x: at(160, 15).x, y: at(160, 15).y, rx: 2, tier: 'MAS' }, { x: at(260, 15).x, y: at(260, 15).y, rx: 2, tier: 'MAS' }
      ],
      key: { x: W - 6, y: 5 }, nooks: nooks.concat([at(20, 31), at(260, 23), at(120, 23)])
    };
  };

  /* L4 · The Hollowdeep Mines — THE BRANCHING SEAMS.
   * Underground, under the mountain. Ore chambers lie at three depths, each one a rough-walled cavern, joined by
   * winding miners' tunnels. The old rail line is the spine: it zigzags down from the entry shaft at the top-left,
   * through a chamber on every level, to the Lantern King's crystal hall at the bottom-right, so the way down is
   * always findable. An underground river crosses the mines halfway down; the rails bridge it once and a plank
   * crossing a second time (the loop back). Side galleries end in dead ends that pay; the key waits in a flooded
   * gallery in the far bottom-left. Difficulty rises with depth. */
  BP.L4 = function (k) {
    var r = k.r, W = k.W, H = k.H, isW = k.isWall, isG = function (v) { return v === GROUND; };
    k.rect(1, 1, W - 2, H - 2, WALL);
    var ch = [[10, 8, 6, 4], [30, 8, 7, 4], [52, 9, 7, 4], [72, 10, 6, 4],
              [16, 24, 7, 4], [38, 23, 7, 5], [62, 25, 7, 4],
              [11, 41, 6, 4], [31, 42, 7, 4], [52, 43, 6, 4], [70, 40, 5, 4],
              [24, 54, 6, 3], [44, 55, 6, 3]];
    ch.forEach(function (c) { k.ell(c[0], c[1], c[2], c[3], GROUND, 0.9); });
    // miners' tunnels between neighbouring chambers (not every pair: a branching tree plus a few loops)
    [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [9, 10], [7, 8], [7, 11], [8, 11], [9, 12], [11, 12]].forEach(function (e) {
      var a = ch[e[0]], b = ch[e[1]]; k.road([{ x: a[0], y: a[1] }, { x: b[0], y: b[1] }], 2, GROUND, 2.5, isW);
    });
    // crystal pillars inside the chambers (cover, and something to walk around)
    ch.forEach(function (c, i) { if (i % 2 === 0) k.clumps(c[0] - c[2] + 2, c[1] - c[3] + 1, 2 * c[2] - 4, 2 * c[3] - 2, 1, 1.0, WALL, isG); });
    // the Lantern King's crystal hall, bottom-right, its gate facing west
    var boss = bossRoom(k, W - 17, H - 14, 13, 10, 'W');
    var fire = { x: 7, y: 6 };
    // the rail line: the spine down through every level
    k.road([fire, { x: 30, y: 9 }, { x: 52, y: 10 }, { x: 64, y: 16 }, { x: 62, y: 25 }, { x: 38, y: 24 }, { x: 18, y: 26 }, { x: 13, y: 33 }, { x: 11, y: 41 }, { x: 31, y: 43 }, { x: 52, y: 44 }, { x: boss.front.x - 2, y: 47 }, boss.front], 2, PATH, 1.2);
    // the underground river, meandering across the middle; it only floods rock and cave floor, so the rails bridge it
    var nzr = k.noise(7);
    for (var x = 2; x < W - 2; x++) { var yy = 33 + Math.round((nzr(x, 2) - 0.5) * 6); for (var d = 0; d < 3; d++) { var v = k.get(x, yy + d); if (v === WALL || v === GROUND) k.set(x, yy + d, WATER); } }
    // a plank crossing further east: the loop back up
    for (var y = 28; y < 40; y++) for (var bb = 0; bb < 2; bb++) { var tv = k.get(58 + bb, y); if (tv === WATER || tv === WALL) k.set(58 + bb, y, PATH); }
    k.road([{ x: 62, y: 25 }, { x: 58, y: 29 }], 2, PATH, 0); k.road([{ x: 58, y: 39 }, { x: 52, y: 43 }], 2, PATH, 0);
    // side galleries: short dead-end drifts off the chambers (the dead ends that pay)
    var nooks = [];
    [[10, 8, -1, 1], [30, 8, 0, -1], [52, 9, 0, -1], [72, 10, 1, -1], [16, 24, -1, -1], [38, 23, 0, 1], [62, 25, 1, 1], [70, 40, 1, -1], [31, 42, 0, 1], [44, 55, 1, 0], [24, 54, -1, 0], [52, 43, 0, -1]].forEach(function (g) {
      var len = 5 + Math.floor(r() * 4), ex = g[0] + g[2] * (len + 5), ey = g[1] + g[3] * (len + 2);
      ex = Math.max(3, Math.min(W - 4, ex)); ey = Math.max(3, Math.min(H - 4, ey));
      k.road([{ x: g[0], y: g[1] }, { x: ex, y: ey }], 2, GROUND, 1.5, function (v) { return v === WALL; });
      k.disc(ex, ey, 1.5, GROUND, 0.5, function (v) { return v === WALL; }); nooks.push({ x: ex, y: ey });
    });
    // the flooded gallery with the key: bottom-left, off the deepest western chamber
    k.road([{ x: 11, y: 41 }, { x: 6, y: 49 }, { x: 6, y: H - 6 }], 2, GROUND, 1, isW); k.disc(6, H - 6, 2.4, GROUND);
    k.clumps(3, H - 12, 8, 5, 3, 1.1, WATER, isG);
    k.disc(fire.x, fire.y, 2.6, GROUND, 0.3);
    return {
      name: 'branching seams', spawn: fire, bossRoom: boss,
      areas: [
        { x: 30, y: 8, rx: 4, ry: 2, tier: 'BEG' }, { x: 52, y: 9, rx: 4, ry: 2, tier: 'BEG' }, { x: 72, y: 10, rx: 3, ry: 2, tier: 'BEG' }, { x: 16, y: 24, rx: 4, ry: 2, tier: 'BEG' },
        { x: 38, y: 23, rx: 4, ry: 3, tier: 'PRG' }, { x: 62, y: 25, rx: 4, ry: 2, tier: 'PRG' }, { x: 11, y: 41, rx: 3, ry: 2, tier: 'PRG' }, { x: 70, y: 40, rx: 3, ry: 2, tier: 'PRG' },
        { x: 31, y: 42, rx: 4, ry: 2, tier: 'MAS' }, { x: 52, y: 43, rx: 3, ry: 2, tier: 'MAS' }, { x: 24, y: 54, rx: 3, ry: 2, tier: 'MAS' }, { x: 44, y: 55, rx: 3, ry: 2, tier: 'MAS' }
      ],
      key: { x: 6, y: H - 6 }, nooks: nooks
    };
  };

  /* L5 · Cogwright's Ruin — THE GEAR CITY.
   * A fallen city laid out on a grid: streets between the ruined blocks of workshops. The grand avenue runs from the
   * south gate (the bonfire) straight at the Cogwright's workshop in the north, so the boss is in view from the
   * start, but a toppled clock tower blocks it halfway and you have to find a way round through the side streets.
   * The central plaza holds a giant broken gear, the landmark you keep passing. A canal runs along one street with
   * two bridges. Some blocks have collapsed (short cuts); a few have hollow courtyards with a single door (the dead
   * ends that pay), and the key waits in the walled courtyard in the far north-west. */
  BP.L5 = function (k) {
    var r = k.r, W = k.W, H = k.H, isW = k.isWall, isG = function (v) { return v === GROUND; };
    k.rect(1, 1, W - 2, H - 2, WALL);
    var XS = [5, 19, 33, 43, 53, 67, 80], YS = [5, 17, 29, 41, 53];
    // streets (width 3), a few segments left buried in rubble so the grid is not a free run
    var blocked = { 'v,1,1': 1, 'v,5,2': 1, 'h,0,3': 1, 'h,4,1': 1, 'v,2,3': 1, 'h,2,5': 1 };
    XS.forEach(function (x, i) { for (var j = 0; j < YS.length - 1; j++) if (!blocked['v,' + i + ',' + j]) k.seg(x, YS[j], x, YS[j + 1], 3, GROUND); });
    YS.forEach(function (y, j) { for (var i = 0; i < XS.length - 1; i++) if (!blocked['h,' + j + ',' + i]) k.seg(XS[i], y, XS[i + 1], y, 3, GROUND); });
    // the grand avenue: x = 43, from the south gate to the workshop; the fallen clock tower lies across it at y 31-38
    var fire = { x: 43, y: H - 5 };
    var boss = bossRoom(k, 36, 3, 15, 9, 'S');
    k.road([fire, { x: 43, y: 41 }], 4, PATH, 0); k.road([{ x: 43, y: 28 }, boss.front], 4, PATH, 0);
    k.rect(39, 31, 9, 8, WALL); // the toppled tower
    // the plaza with the broken gear, just east of the avenue
    k.disc(60, 35, 7.5, GROUND); k.ring(60, 35, 3, 4.6, WALL);
    for (var a = 0; a < 360; a += 45) { var gx = Math.round(60 + 5.6 * Math.cos(a * Math.PI / 180)), gy = Math.round(35 + 5.6 * Math.sin(a * Math.PI / 180)); k.set(gx, gy, WALL); }
    k.disc(60, 35, 1.6, GROUND); k.seg(60, 31, 60, 33, 1, GROUND); // a way into the hub of the gear
    // the canal along the street at y = 41, west of the avenue, with two bridges
    for (var x = 2; x < 41; x++) for (var d = -1; d <= 1; d++) if (k.get(x, 41 + d) === GROUND) k.set(x, 41 + d, WATER);
    [12, 26].forEach(function (bx) { for (var y = 39; y <= 43; y++) for (var q = 0; q < 2; q++) k.set(bx + q, y, PATH); });
    // collapsed blocks: rubble you can pick your way through (short cuts between streets)
    [[26, 23], [72, 11], [12, 47], [74, 47], [26, 9]].forEach(function (c) { k.ell(c[0], c[1], 4.5, 3.2, GROUND, 1.0); k.clumps(c[0] - 4, c[1] - 3, 8, 6, 3, 0.9, WALL, isG); });
    // hollow courtyards with one door (dead ends that pay)
    var nooks = [];
    function court(x, y, w, h, door) { k.rect(x, y, w, h, GROUND); var dx = door === 'N' ? x + (w >> 1) : door === 'S' ? x + (w >> 1) : door === 'W' ? x - 1 : x + w, dy = door === 'N' ? y - 1 : door === 'S' ? y + h : y + (h >> 1); k.seg(dx, dy, dx + (door === 'W' ? -2 : door === 'E' ? 2 : 0), dy + (door === 'N' ? -2 : door === 'S' ? 2 : 0), 2, GROUND); nooks.push({ x: x + 1, y: y + 1 }); nooks.push({ x: x + w - 2, y: y + h - 2 }); }
    court(9, 21, 6, 5, 'S'); court(58, 45, 6, 5, 'N'); court(71, 21, 6, 5, 'W'); court(23, 45, 6, 5, 'E'); court(57, 9, 5, 5, 'S');
    // the key: a walled courtyard in the far north-west with its only door facing east
    k.rect(8, 8, 7, 6, GROUND); k.seg(15, 11, 17, 11, 2, GROUND);
    // steam pools (scalding water) in a few streets for cover and variety
    k.clumps(4, 4, W - 8, H - 8, 6, 1.4, WATER, isG);
    k.disc(fire.x, fire.y, 2.6, GROUND, 0.3);
    nooks = nooks.concat([{ x: 3, y: 57 }, { x: 82, y: 57 }, { x: 82, y: 4 }, { x: 3, y: 30 }, { x: 82, y: 30 }]);
    return {
      name: 'gear city', spawn: fire, bossRoom: boss,
      areas: [
        { x: 33, y: 53, rx: 3, tier: 'BEG' }, { x: 53, y: 53, rx: 3, tier: 'BEG' }, { x: 19, y: 53, rx: 3, tier: 'BEG' }, { x: 67, y: 53, rx: 3, tier: 'BEG' },
        { x: 19, y: 29, rx: 3, tier: 'PRG' }, { x: 60, y: 35, rx: 5, tier: 'PRG' }, { x: 80, y: 41, rx: 2, tier: 'PRG' }, { x: 5, y: 41, rx: 2, tier: 'PRG' },
        { x: 19, y: 5, rx: 3, tier: 'MAS' }, { x: 67, y: 17, rx: 3, tier: 'MAS' }, { x: 33, y: 17, rx: 3, tier: 'MAS' }, { x: 80, y: 5, rx: 2, tier: 'MAS' }
      ],
      key: { x: 10, y: 10 }, nooks: nooks
    };
  };

  /* L6 · The Sheer Stair — THE SWITCHBACKS.
   * A cliff face climbed by six long ledges, one above the other, joined by stairs that turn back at alternate ends:
   * every flight is a rise over a run. The bonfire is at the foot of the cliff (bottom-left) and the Summit Bell's
   * gate is at the very top, seen from below the whole way up. Ledges are narrow where the cliff pinches in and widen
   * into landings; spurs over the drop are the dead ends that pay. A waterfall spills down the middle of the cliff
   * (stepping stones on every ledge). An old ladder joins the second ledge to the fourth on the right: the short cut
   * back down. On the fourth ledge a rope bridge crosses the drop to a pinnacle where the key waits.
   * Difficulty rises with height: two ledges per tier. */
  BP.L6 = function (k) {
    var r = k.r, W = k.W, H = k.H, isW = k.isWall, isG = function (v) { return v === GROUND; };
    k.rect(1, 1, W - 2, H - 2, WALL);
    var LY = [H - 7, H - 19, H - 31, H - 43, H - 55, H - 66], X0 = 6, X1 = W - 14, nzl = k.noise(6);
    // the ledges: rough bands, wider at landings
    LY.forEach(function (y, i) { for (var x = X0; x <= X1; x++) { var th = 2 + Math.round(nzl(x, i * 9) * 2.4); k.seg(x, y - th, x, y + 1, 1, GROUND); } k.ell(X0 + 3, y - 1, 5, 3.4, GROUND, 0.6); k.ell(X1 - 2, y - 1, 5, 3.4, GROUND, 0.6); });
    // stairs between ledges, alternating right / left ends (PATH, the cut steps)
    for (var i = 0; i < LY.length - 1; i++) { var right = i % 2 === 0, sx = right ? X1 - 2 : X0 + 3; k.road([{ x: sx, y: LY[i] - 1 }, { x: sx + (right ? -3 : 3), y: Math.round((LY[i] + LY[i + 1]) / 2) }, { x: sx, y: LY[i + 1] - 1 }], 3, PATH, 0); }
    // the worn path along each ledge
    LY.forEach(function (y) { k.road([{ x: X0 + 2, y: y - 1 }, { x: X1 - 2, y: y - 1 }], 1, PATH, 0.6); });
    // the summit: the bell's gate at the top, reached from the end of the top ledge
    var boss = bossRoom(k, Math.floor(W / 2) - 8, 2, 15, 7, 'S');
    k.road([{ x: X0 + 3, y: LY[5] - 1 }, { x: boss.front.x - 6, y: LY[5] - 3 }, boss.front], 3, PATH, 0);
    // the waterfall down the middle of the cliff: water falls over the rock between ledges, stepping stones on each ledge
    var wx = Math.floor(W / 2) - 1;
    for (var y = 10; y < H - 3; y++) for (var q = 0; q < 2; q++) { var v = k.get(wx + q, y); if (v === WALL) k.set(wx + q, y, WATER); else if (v === GROUND && y % 2 === 0) k.set(wx + q, y, WATER); }
    // the old ladder: ledge 2 to ledge 4 on the right, a short cut back down (1 wide)
    k.seg(X1 - 7, LY[1] - 2, X1 - 7, LY[3] - 1, 1, PATH);
    // spurs over the drop (dead ends that pay)
    var nooks = [];
    [[14, 0, -1], [30, 1, 1], [46, 1, 1], [20, 2, 1], [40, 2, -1], [12, 3, 1], [44, 3, -1], [26, 4, -1], [48, 4, 1], [20, 5, 1]].forEach(function (s) {
      var x0 = s[0], y0 = LY[s[1]] + (s[2] > 0 ? 1 : -3), y1 = y0 + s[2] * 4; k.seg(x0, y0, x0 + 2, y1, 2, GROUND, isW); k.disc(x0 + 2, y1, 1.4, GROUND, 0.4, isW); nooks.push({ x: x0 + 2, y: y1 });
    });
    // the rope bridge and the pinnacle with the key, east of the fourth ledge
    var py = LY[3] - 4; k.seg(X1, LY[3] - 1, W - 6, py, 1, PATH); k.disc(W - 5, py, 2.2, GROUND, 0.3);
    var fire = { x: X0 + 2, y: LY[0] - 1 };
    k.disc(fire.x, fire.y, 2.4, GROUND, 0.3);
    function on(i, f) { return { x: Math.round(X0 + 4 + (X1 - X0 - 8) * f), y: LY[i] - 1, rx: 4, ry: 1 }; }
    var areas = [];
    [[0, 0.45, 'BEG'], [0, 0.85, 'BEG'], [1, 0.25, 'BEG'], [1, 0.7, 'BEG'], [2, 0.3, 'PRG'], [2, 0.75, 'PRG'], [3, 0.2, 'PRG'], [3, 0.65, 'PRG'], [4, 0.3, 'MAS'], [4, 0.8, 'MAS'], [5, 0.4, 'MAS'], [5, 0.85, 'MAS']].forEach(function (a) { var p = on(a[0], a[1]); p.tier = a[2]; areas.push(p); });
    return { name: 'switchbacks', spawn: fire, bossRoom: boss, areas: areas, key: { x: W - 5, y: py }, nooks: nooks };
  };

  /* L7 · The Waystone Hills — STRAIGHT ROADS OVER ROUND HILLS.
   * Rolling hilltops (round clearings) joined by long, perfectly straight old roads, each at its own slope: the land is
   * a graph of lines. Open meadows break up the gorse between them, a stream wanders across the whole map and the roads
   * ford it, and at every crossing stands a waystone. The ring of stones sits on the highest hill in the north-east,
   * in sight from the middle of the map. The key waits on a lone hill past the Mastery hills in the south-east. */
  BP.L7 = function (k) {
    var W = k.W, H = k.H, isW = k.isWall, nz = k.noise(7), x, y;
    k.rect(1, 1, W - 2, H - 2, WALL);
    // open meadows where the noise is high (gorse elsewhere)
    for (y = 3; y < H - 3; y++) for (x = 3; x < W - 3; x++) if (nz(x, y) > 0.64) k.set(x, y, GROUND);
    var N = { A: [8, 56], B: [24, 49], C: [42, 55], D: [12, 35], E: [32, 34], F: [52, 42], G: [66, 54], H: [22, 17], I: [44, 21], J: [64, 30], K: [74, 60] };
    var RAD = { A: 5, B: 6.5, C: 6.5, D: 6.5, E: 7.5, F: 6.5, G: 6, H: 6.5, I: 7.5, J: 6.5, K: 3.5 };
    Object.keys(N).forEach(function (n) { k.disc(N[n][0], N[n][1], RAD[n], GROUND, 0.5); });
    // the stream, west to east, wandering
    k.road([{ x: 2, y: 44 }, { x: 20, y: 42 }, { x: 38, y: 46 }, { x: 56, y: 36 }, { x: 78, y: 40 }], 2, WATER, 4);
    // the old roads: straight, three wide, fording the stream
    [['A', 'B'], ['B', 'C'], ['A', 'D'], ['B', 'E'], ['D', 'E'], ['C', 'F'], ['F', 'G'], ['E', 'F'], ['D', 'H'], ['E', 'I'], ['H', 'I'], ['I', 'J'], ['F', 'J'], ['G', 'K']].forEach(function (e) {
      var p = N[e[0]], q = N[e[1]]; k.seg(p[0], p[1], q[0], q[1], e[1] === 'K' ? 2 : 3, PATH);
    });
    // the ring of stones on the highest hill
    var boss = bossRoom(k, 58, 3, 15, 10, 'S');
    k.seg(N.J[0], N.J[1], boss.front.x, boss.front.y, 3, PATH);
    k.disc(boss.front.x, boss.front.y + 1, 2.5, GROUND, 0.3);
    // hollows off the hills: little dead ends that pay
    var nooks = [];
    [[2, 26, 'D', -1, 0], [6, 10, 'H', 0, -1], [34, 8, 'I', 0, -1], [40, 62, 'C', 0, 1], [26, 60, 'B', 0, 1], [54, 52, 'F', 0, 1], [76, 22, 'J', 1, 0], [48, 30, 'E', 1, -1], [14, 48, 'B', -1, 0], [58, 60, 'G', 0, 1]].forEach(function (s) {
      var c = N[s[2]]; k.seg(c[0], c[1], s[0], s[1], 2, GROUND, isW); k.disc(s[0], s[1], 1.6, GROUND, 0.4); nooks.push({ x: s[0], y: s[1] });
    });
    function at(n, tier, rx) { return { x: N[n][0], y: N[n][1], rx: rx || 4, ry: rx || 4, tier: tier }; }
    var areas = [at('B', 'BEG'), at('C', 'BEG'), at('D', 'BEG'), at('E', 'PRG', 5), at('F', 'PRG'), at('H', 'PRG'), at('I', 'MAS', 5), at('J', 'MAS'), at('G', 'MAS')];
    return { name: 'the waystone roads', spawn: { x: N.A[0], y: N.A[1] }, bossRoom: boss, areas: areas, key: { x: N.K[0], y: N.K[1] }, nooks: nooks };
  };

  /* L8 · The Crossroads — TWO LINES AND A MARKET.
   * A walled market town laid out on a street grid, cut by two great roads that run corner to corner at different
   * slopes and cross in the market square in the middle of the map. The bonfire is in the west where both roads
   * enter; the tollhouse stands on the north edge at the foot of the mountain road, reached by a lane from the square.
   * Beginning creatures in the western streets, Progressing around the square, Mastery in the east and the north.
   * The key is in a walled yard at the far east end, between where the two roads leave the map. */
  BP.L8 = function (k) {
    var W = k.W, H = k.H, r = k.r, x, y, isW = k.isWall;
    k.rect(1, 1, W - 2, H - 2, WALL);
    // the street grid: lanes every 8 tiles each way, a few segments missing (blocks merge), two wide
    var XS = [], YS = []; for (x = 6; x < W - 4; x += 8) XS.push(x); for (y = 6; y < H - 4; y += 8) YS.push(y);
    YS.forEach(function (yy) { for (var i = 0; i < XS.length - 1; i++) if (r() > 0.22) k.rect(XS[i], yy, XS[i + 1] - XS[i] + 2, 2, GROUND); });
    XS.forEach(function (xx) { for (var j = 0; j < YS.length - 1; j++) if (r() > 0.22) k.rect(xx, YS[j], 2, YS[j + 1] - YS[j] + 2, GROUND); });
    // a few courtyards (open blocks)
    for (var c = 0; c < 7; c++) { var bx = XS[1 + Math.floor(r() * (XS.length - 3))], by = YS[Math.floor(r() * (YS.length - 1))]; k.rect(bx + 2, by + 2, 6, 6, GROUND); }
    // the two great roads, corner to corner, crossing at the market
    var M = { x: 48, y: 33 };
    k.seg(4, 54, 92, 12, 4, PATH); k.seg(4, 12, 92, 54, 4, PATH);
    // the market square, with stalls (2x2 blocks) in rows
    k.ell(M.x, M.y, 11, 7, GROUND, 0.2);
    [[-7, -4], [-3, -4], [3, -4], [7, -4], [-7, 3], [-3, 3], [3, 3], [7, 3]].forEach(function (o) { if (Math.abs(o[0]) > 2) k.rect(M.x + o[0], M.y + o[1], 2, 1, WALL); });
    k.seg(4, 54, 92, 12, 2, PATH); k.seg(4, 12, 92, 54, 2, PATH);          // the roads stay clear through the square
    // the bonfire at the west, between the two roads' starts
    var fire = { x: 7, y: 33 }; k.disc(fire.x, fire.y, 3, GROUND, 0.3); k.seg(fire.x, fire.y, 6, 14, 2, PATH); k.seg(fire.x, fire.y, 6, 52, 2, PATH);
    // the tollhouse on the north edge, the lane up from the square
    var boss = bossRoom(k, M.x - 7, 2, 15, 8, 'S');
    k.seg(M.x, M.y - 6, boss.front.x, boss.front.y, 3, PATH);
    // the east yard with the key, walled, one gap
    k.rect(W - 9, 28, 6, 10, GROUND); k.seg(W - 9, 33, W - 14, 33, 2, GROUND);
    // the river along the south edge, under a bridge on each road
    k.road([{ x: 2, y: H - 5 }, { x: 30, y: H - 4 }, { x: 60, y: H - 6 }, { x: W - 2, y: H - 4 }], 2, WATER, 2, isW);
    var nooks = [];
    [[3, 4], [14, 3], [30, 3], [66, 3], [84, 3], [92, 7], [3, 60], [20, 59], [44, 59], [70, 59], [88, 60], [92, 40]].forEach(function (p) {
      var bx = Math.max(2, Math.min(W - 3, p[0])), by = Math.max(2, Math.min(H - 3, p[1])); k.disc(bx, by, 1.5, GROUND, 0.3); nooks.push({ x: bx, y: by });
    });
    function A(px, py, tier, rx) { return { x: px, y: py, rx: rx || 5, ry: 4, tier: tier }; }
    var areas = [A(16, 20, 'BEG'), A(18, 44, 'BEG'), A(26, 32, 'BEG'), A(38, 22, 'PRG'), A(40, 44, 'PRG'), A(M.x, M.y, 'PRG', 8), A(58, 22, 'PRG'),
      A(66, 44, 'MAS'), A(74, 22, 'MAS'), A(80, 46, 'MAS'), A(64, 14, 'MAS')];
    return { name: 'the market streets', spawn: fire, bossRoom: boss, areas: areas, key: { x: W - 6, y: 33 }, nooks: nooks };
  };

  /* L9 · The Gate of Lorebound — THE MOUNTAIN ROAD (the finale).
   * No creatures, no key, no treasure: a bonfire on a ledge, then one road climbing north between the peaks over a sea
   * of cloud far below, lined both sides with braziers. Two round landings break the climb, and the great door of
   * Lorebound is in sight from the very first step. Short, straight and grand: the walk is the ceremony. */
  BP.L9 = function (k) {
    var W = k.W, H = k.H, cx = (W - 1) / 2, y, braziers = [];
    k.rect(1, 1, W - 2, H - 2, WALL);
    k.rect(3, 15, W - 6, 58, WATER);                                     // the drop: cloud and cold air on either side of the road
    function road(y0, y1) { k.rect(cx - 2, y0, 5, y1 - y0 + 1, PATH); for (y = y0; y <= y1; y++) { k.set(cx - 3, y, WALL); k.set(cx + 3, y, WALL); } }
    function landing(yc, half, hgt) {
      var x0 = cx - half, x1 = cx + half, y0 = yc - hgt, y1 = yc + hgt;
      k.rect(x0, y0, x1 - x0 + 1, y1 - y0 + 1, GROUND); k.frame(x0 - 1, y0 - 1, x1 - x0 + 3, y1 - y0 + 3, WALL);
      k.rect(cx - 2, y0 - 1, 5, y1 - y0 + 3, PATH);
      return { x0: x0 - 1, x1: x1 + 1, y0: y0 - 1, y1: y1 + 1 };
    }
    var fire = { x: cx, y: 68 };
    var t0 = landing(68, 6, 3);
    k.rect(cx - 2, t0.y1, 5, 1, WALL);
    k.rect(t0.x0 + 1, t0.y0 + 2, t0.x1 - t0.x0 - 1, t0.y1 - t0.y0 - 2, GROUND);
    var l1 = landing(49, 5, 3), l2 = landing(30, 5, 3);
    road(l1.y1 + 1, t0.y0 - 1); road(l2.y1 + 1, l1.y0 - 1); road(15, l2.y0 - 1);
    var boss = bossRoom(k, cx - 8, 3, 17, 11, 'S');
    k.rect(cx - 2, 15, 5, 3, PATH);
    [[l1.y1 + 2, t0.y0 - 2], [l2.y1 + 2, l1.y0 - 2], [16, l2.y0 - 2]].forEach(function (seg) { for (y = seg[0]; y <= seg[1]; y += 4) braziers.push({ x: cx - 3, y: y }, { x: cx + 3, y: y }); });
    [t0, l1, l2].forEach(function (P) { braziers.push({ x: P.x0, y: P.y0 }, { x: P.x1, y: P.y0 }); if (P !== t0) braziers.push({ x: P.x0, y: P.y1 }, { x: P.x1, y: P.y1 }); });
    braziers.forEach(function (p) { if (k.get(p.x, p.y) !== WALL) k.set(p.x, p.y, GROUND); });
    return { name: 'the mountain road', spawn: fire, bossRoom: boss, bare: true, fillPockets: true, braziers: braziers, props: [],
      areas: [{ x: cx, y: 49, rx: 2, tier: 'BEG' }, { x: cx, y: 30, rx: 2, tier: 'PRG' }], key: null, nooks: [] };
  };

  /* The Proving Grounds: the tutorial, off the world map. Five small rooms in a loop: the bonfire, a chest and a page,
   * a sleeping rat (strike first), a waking wisp with the gate key, and the training boss behind its gate. */
  BP.T0 = function (k) {
    k.rect(1, 1, k.W - 2, k.H - 2, WALL);
    k.ell(9, 28, 6, 4, GROUND, 0.3);                     // A: the bonfire
    k.seg(9, 24, 9, 19, 3, PATH);                        // up to B
    k.ell(9, 14, 6, 4, GROUND, 0.3);                     // B: chest and page
    k.seg(15, 14, 21, 14, 3, PATH);                      // across to C
    k.ell(26, 14, 5, 4, GROUND, 0.3);                    // C: the sleeping rat
    k.seg(26, 18, 26, 23, 3, PATH);                      // down to D
    k.ell(26, 28, 6, 4, GROUND, 0.3);                    // D: the wisp and the key
    k.seg(31, 14, 33, 14, 3, PATH);                      // C to the gate's approach
    var boss = bossRoom(k, 37, 9, 9, 9, 'W');            // the training boss, gate on the west wall facing C
    return { name: 'the proving grounds', spawn: { x: 8, y: 29 }, bossRoom: boss, fillPockets: true,
      areas: [{ x: 27, y: 13, rx: 1, tier: 'BEG' }, { x: 28, y: 28, rx: 2, tier: 'BEG' }],
      counts: { BEG: 1, PRG: 1, MAS: 1 }, nChests: 1, nPages: 1,
      key: { x: 22, y: 30 }, nooks: [{ x: 5, y: 13 }, { x: 13, y: 13 }] };
  };

  var SIZES = { T0: [48, 36], L1: [84, 56], L2: [84, 60], L3: [76, 76], L4: [84, 62], L5: [86, 62], L6: [64, 78], L7: [80, 64], L8: [96, 64], L9: [45, 76] };

  function build(L, env) {
    var bpf = BP[L.id]; if (!bpf) return null;
    G = env.G; SOLID = env.SOLID; WALL = G.WALL; WATER = G.WATER; GROUND = G.GROUND; GROUND2 = G.GROUND2; PATH = G.PATH; DECO = G.DECO; GATE = G.GATE; FIRE = G.FIRE; EDGE = G.EDGE;
    var sz = SIZES[L.id] || [84, 56], r = rng(hash('unbound:' + L.id + ':v5'));
    var k = Kit(sz[0], sz[1], WALL, r), bp = bpf(k, L);
    return finish(L, k, bp, env.theme || {});
  }
  return { build: build, has: function (id) { return !!BP[id]; }, LAYOUT: 'v5' };
})();
