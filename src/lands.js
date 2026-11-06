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

  /* L4 · Shattered Crypts — THE GRID OF VAULTS.
   * A true dungeon: chambers on a grid joined by straight corridors, the shape of a Zelda dungeon. The rooms form
   * a branching tree with a few extra corridors added to make loops. A pillared great hall in the middle is the
   * landmark you keep passing through. Some chambers have collapsed into rubble and open pits. Leaf rooms (dead
   * ends) hold the treasure; the farthest one holds the key. The vault door is in the far corner. */
  BP.L4 = function (k) {
    var r = k.r, W = k.W, H = k.H, CW = 15, CH = 13, NX = 5, NY = 4, ox = 2, oy = 3, i, x, y;
    var cells = [];
    for (y = 0; y < NY; y++) for (x = 0; x < NX; x++) cells.push({ gx: x, gy: y, id: y * NX + x });
    var hall = function (c) { return (c.gx === 1 || c.gx === 2) && (c.gy === 1 || c.gy === 2); };
    var bossCell = NX * NY - 1;
    // the room in each cell
    cells.forEach(function (c) {
      if (c.id === bossCell) return;
      var w = 7 + Math.floor(r() * 5), h = 5 + Math.floor(r() * 4), cx = ox + c.gx * CW + Math.floor(CW / 2), cy = oy + c.gy * CH + Math.floor(CH / 2);
      if (hall(c)) return;
      c.rm = { x: cx - Math.floor(w / 2) + Math.floor((r() - 0.5) * 3), y: cy - Math.floor(h / 2) + Math.floor((r() - 0.5) * 3), w: w, h: h };
      c.cx = c.rm.x + Math.floor(w / 2); c.cy = c.rm.y + Math.floor(h / 2);
      k.rect(c.rm.x, c.rm.y, w, h, GROUND);
    });
    // the great hall: four cells merged, with rows of pillars
    var hx = ox + CW + 2, hy = oy + CH + 2, hw = 2 * CW - 4, hh = 2 * CH - 4;
    k.rect(hx, hy, hw, hh, GROUND);
    for (y = hy + 3; y < hy + hh - 2; y += 4) for (x = hx + 3; x < hx + hw - 2; x += 4) k.rect(x, y, 1, 1, WALL);
    cells.forEach(function (c) { if (hall(c)) { c.cx = ox + c.gx * CW + Math.floor(CW / 2); c.cy = oy + c.gy * CH + Math.floor(CH / 2); c.hall = true; } });
    // corridors: a random spanning tree over the grid (the hall counts as one node), plus a few loops
    var node = function (c) { return c.hall ? 'H' : c.id; };
    var parent = {}, find = function (a) { while (parent[a] != null && parent[a] !== a) a = parent[a]; return a; };
    var edges = [];
    cells.forEach(function (c) { if (c.id === bossCell) return; if (c.gx < NX - 1 && c.id + 1 !== bossCell) edges.push([c, cells[c.id + 1]]); if (c.gy < NY - 1 && c.id + NX !== bossCell) edges.push([c, cells[c.id + NX]]); });
    edges = edges.filter(function (e) { return node(e[0]) !== node(e[1]); }).sort(function () { return r() - 0.5; });
    var deg = {}, used = [], spare = [];
    edges.forEach(function (e) { var a = find(node(e[0])), b = find(node(e[1])); if (a !== b) { parent[a] = b; used.push(e); } else spare.push(e); });
    used = used.concat(spare.slice(0, 4));
    function corridor(a, b) { var mx = r() < 0.5; if (mx) { k.seg(a.cx, a.cy, b.cx, a.cy, 2, PATH, k.isWall); k.seg(b.cx, a.cy, b.cx, b.cy, 2, PATH, k.isWall); } else { k.seg(a.cx, a.cy, a.cx, b.cy, 2, PATH, k.isWall); k.seg(a.cx, b.cy, b.cx, b.cy, 2, PATH, k.isWall); } }
    used.forEach(function (e) { corridor(e[0], e[1]); deg[node(e[0])] = (deg[node(e[0])] || 0) + 1; deg[node(e[1])] = (deg[node(e[1])] || 0) + 1; });
    // collapsed chambers: rubble and pits
    [cells[3], cells[10], cells[16]].forEach(function (c) { if (!c.rm) return; k.clumps(c.rm.x, c.rm.y, c.rm.w, c.rm.h, 2, 1.3, WALL); k.disc(c.rm.x + c.rm.w - 2, c.rm.y + 1, 1.3, WATER); });
    // the vault, entered from the west, through the chamber beside it
    var bc = cells[bossCell], bx = ox + bc.gx * CW + 3, by = oy + bc.gy * CH + 2;
    var boss = bossRoom(k, bx, by, 11, 8, 'W', GROUND);
    var left = cells[bossCell - 1]; k.seg(boss.front.x, boss.front.y, left.cx, boss.front.y, 2, PATH, k.isWall); k.seg(left.cx, boss.front.y, left.cx, left.cy, 2, PATH, k.isWall);
    // grid distance from the chapel (cell 0) to grade the rooms
    var adj = {}; used.forEach(function (e) { var a = node(e[0]), b = node(e[1]); (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); });
    var gd = { 0: 0 }, q = [0]; while (q.length) { var n = q.shift(); (adj[n] || []).forEach(function (m) { if (gd[m] == null) { gd[m] = gd[n] + 1; q.push(m); } }); }
    var rooms = cells.filter(function (c) { return c.id !== 0 && c.id !== bossCell && !c.hall; });
    var areas = [], leaves = [];
    rooms.forEach(function (c) { var d = gd[node(c)] || 3; areas.push({ x: c.cx, y: c.cy, rx: Math.floor(c.rm.w / 2) - 1, ry: Math.floor(c.rm.h / 2) - 1, tier: d <= 2 ? 'BEG' : d <= 4 ? 'PRG' : 'MAS', d: d }); if ((deg[node(c)] || 0) <= 1) leaves.push(c); });
    areas.push({ x: hx + hw / 2, y: hy + hh / 2, rx: hw / 2 - 2, ry: hh / 2 - 2, tier: 'PRG' });
    // make sure every tier has somewhere to live
    ['BEG', 'PRG', 'MAS'].forEach(function (tr, ti) { if (!areas.some(function (a) { return a.tier === tr; })) { var srt = areas.slice().sort(function (a, b) { return (a.d || 0) - (b.d || 0); }); srt[ti === 0 ? 0 : srt.length - 1].tier = tr; } });
    leaves.sort(function (a, b) { return (gd[node(b)] || 0) - (gd[node(a)] || 0); });
    var keyRoom = leaves[0] || rooms[rooms.length - 1];
    var nooks = [];
    leaves.slice(1).forEach(function (c) { nooks.push({ x: c.rm.x + 1, y: c.rm.y + 1 }); nooks.push({ x: c.rm.x + c.rm.w - 2, y: c.rm.y + c.rm.h - 2 }); });
    rooms.forEach(function (c) { nooks.push({ x: c.rm.x + c.rm.w - 2, y: c.rm.y + 1 }); });
    var c0 = cells[0], fire = { x: c0.cx - 1, y: c0.cy };
    return { name: 'grid of vaults', spawn: fire, bossRoom: boss, areas: areas, key: { x: keyRoom.cx, y: keyRoom.cy }, nooks: nooks };
  };

  /* L5 · Mirrorfen — THE MIRRORED LAKE.
   * The whole fen is mirrored left to right across a still black lake. The Mirror Queen holds the island in the
   * middle, always in view, reached by one causeway from the far (north) shore. You start on the south shore and
   * must walk all the way round, east or west: the two shores look alike, but what lives on them does not.
   * Sandbars run out to small islets, which are dead ends with treasure. */
  BP.L5 = function (k) {
    var r = k.r, W = k.W, H = k.H, cx = (W - 1) / 2, cy = 25;
    k.rect(1, 1, W - 2, H - 2, GROUND);
    var nz = k.noise(5), x, y;
    for (y = 1; y < H - 1; y++) for (x = 1; x < W / 2; x++) { var e = Math.min(x, y, H - 1 - y); if (e < 2 + nz(x, y) * 4) k.set(x, y, WALL); }
    k.ell(cx, cy, 25, 15, WATER, 0.25);
    // west half detail (mirrored later): reed beds, side ponds, an islet with a sandbar
    k.clumps(3, 3, cx - 6, H - 6, 10, 1.5, WALL, function (v) { return v === GROUND; });
    k.disc(8, 12, 3, WATER, 0.7); k.disc(10, 44, 2.5, WATER, 0.7);
    k.disc(28, 13, 3, GROUND, 0.5); k.road([{ x: 28, y: 13 }, { x: 22, y: 9 }], 2, GROUND, 0);
    k.disc(26, 37, 3, GROUND, 0.5); k.road([{ x: 26, y: 37 }, { x: 20, y: 43 }], 2, GROUND, 0);
    // the shore road: from the south bank round the west side to the north bank
    k.road([{ x: cx, y: 50 }, { x: 22, y: 47 }, { x: 13, y: 36 }, { x: 11, y: 22 }, { x: 18, y: 8 }, { x: cx, y: 5 }], 2, PATH, 2, k.notWater);
    k.road([{ x: 13, y: 36 }, { x: 4, y: 30 }, { x: 4, y: 20 }, { x: 11, y: 22 }], 2, PATH, 1, k.notWater);
    // mirror the west half onto the east
    for (y = 0; y < H; y++) for (x = 0; x < W / 2; x++) k.t[y * W + (W - 1 - x)] = k.t[y * W + x];
    // the island and the Queen's hall; one causeway from the north shore
    k.ell(cx, cy, 9, 6, GROUND, 0.3);
    var boss = bossRoom(k, Math.round(cx) - 6, cy - 3, 12, 6, 'N');
    k.seg(boss.front.x, boss.front.y, boss.front.x, 5, 2, PATH);
    var fire = { x: Math.round(cx) - 1, y: 51 };
    return {
      name: 'mirrored lake', spawn: fire, bossRoom: boss,
      areas: [
        { x: 20, y: 46, rx: 3, tier: 'BEG' }, { x: 12, y: 34, rx: 3, tier: 'BEG' }, { x: 6, y: 25, rx: 2, tier: 'BEG' },
        { x: W - 21, y: 46, rx: 3, tier: 'PRG' }, { x: W - 13, y: 34, rx: 3, tier: 'PRG' }, { x: W - 12, y: 20, rx: 3, tier: 'PRG' },
        { x: 18, y: 8, rx: 3, tier: 'MAS' }, { x: W - 19, y: 8, rx: 3, tier: 'MAS' }, { x: cx, y: 6, rx: 3, ry: 1, tier: 'MAS' }
      ],
      key: { x: W - 29, y: 13 },
      nooks: [{ x: 28, y: 13 }, { x: 26, y: 37 }, { x: W - 27, y: 37 }, { x: 5, y: 47 }, { x: W - 6, y: 47 }, { x: 4, y: 6 }, { x: W - 5, y: 6 }, { x: 9, y: 16 }, { x: W - 10, y: 16 }, { x: 30, y: 50 }, { x: W - 31, y: 50 }, { x: 4, y: 38 }, { x: W - 5, y: 38 }, { x: 34, y: 4 }]
    };
  };

  /* L6 · The Drowned Causeway — THE SPINE ACROSS THE SEA.
   * One long stone causeway runs from the western beach to the sunken fort in the east. It is broken in two
   * places, where you must drop onto the sandbar that runs beside it and climb back up (a ladder of two parallel
   * routes joined by rungs). Islets hang off the causeway north and south like the bones of a fish; the further
   * east, the deadlier. The Gate Key lies on the last islet, at the end of a long sandbar. */
  BP.L6 = function (k) {
    var r = k.r, W = k.W, H = k.H;
    k.rect(1, 1, W - 2, H - 2, WATER);
    var beach = { x: 9, y: 22 };
    k.ell(beach.x, beach.y, 7, 11, GROUND, 0.5);
    k.ell(W - 13, 22, 11, 13, GROUND, 0.4);
    var spine = k.road([{ x: 8, y: 22 }, { x: 24, y: 18 }, { x: 40, y: 24 }, { x: 56, y: 19 }, { x: 72, y: 25 }, { x: W - 20, y: 21 }], 3, PATH, 2);
    // breaks in the causeway, and the sandbar that gets you round them
    k.rect(33, 14, 4, 14, WATER); k.rect(63, 14, 4, 14, WATER);
    k.road([{ x: 28, y: 22 }, { x: 30, y: 30 }, { x: 40, y: 31 }, { x: 42, y: 26 }], 2, GROUND, 1);
    k.road([{ x: 58, y: 22 }, { x: 60, y: 30 }, { x: 70, y: 32 }, { x: 72, y: 27 }], 2, GROUND, 1);
    // fishbone islets
    var isl = [{ x: 20, y: 7, t: 'BEG' }, { x: 22, y: 35, t: 'BEG' }, { x: 46, y: 8, t: 'PRG' }, { x: 50, y: 36, t: 'PRG' }, { x: 74, y: 9, t: 'MAS' }, { x: 84, y: 38, t: 'MAS' }];
    var spineAt = function (x) { var best = spine[0]; spine.forEach(function (p) { if (Math.abs(p.x - x) < Math.abs(best.x - x)) best = p; }); return best; };
    isl.forEach(function (s) { k.ell(s.x, s.y, 5, 4, GROUND, 0.6); var sp = spineAt(s.x); k.road([s, { x: sp.x, y: sp.y }], 2, GROUND, 1.5); k.clumps(s.x - 5, s.y - 4, 10, 8, 2, 1.1, WALL, function (v) { return v === GROUND; }); });
    k.road([{ x: 84, y: 38 }, { x: 78, y: 41 }], 2, GROUND, 0); k.disc(77, 41, 1.5, GROUND);
    // rocks and wrecks on the beaches
    k.clumps(3, 12, 10, 20, 3, 1.2, WALL, function (v) { return v === GROUND; });
    var boss = bossRoom(k, W - 15, 17, 11, 9, 'W');
    k.road([{ x: W - 20, y: 21 }, boss.front], 3, PATH, 0);
    k.frame(W - 18, 13, 16, 17, WALL); k.rect(W - 18, 19, 1, 6, PATH);
    var fire = { x: beach.x - 2, y: beach.y };
    return {
      name: 'causeway spine', spawn: fire, bossRoom: boss,
      areas: [
        { x: 20, y: 7, rx: 3, tier: 'BEG' }, { x: 22, y: 35, rx: 3, tier: 'BEG' }, { x: 26, y: 20, rx: 3, ry: 1, tier: 'BEG' },
        { x: 46, y: 8, rx: 3, tier: 'PRG' }, { x: 50, y: 36, rx: 3, tier: 'PRG' }, { x: 36, y: 31, rx: 3, ry: 1, tier: 'PRG' },
        { x: 74, y: 9, rx: 3, tier: 'MAS' }, { x: 84, y: 38, rx: 3, tier: 'MAS' }, { x: 66, y: 32, rx: 3, ry: 1, tier: 'MAS' }
      ],
      key: { x: 77, y: 41 },
      nooks: [{ x: 17, y: 5 }, { x: 25, y: 37 }, { x: 43, y: 6 }, { x: 53, y: 38 }, { x: 77, y: 7 }, { x: 4, y: 14 }, { x: 4, y: 30 }, { x: 31, y: 31 }, { x: 69, y: 33 }, { x: W - 8, y: 31 }, { x: W - 8, y: 12 }, { x: 22, y: 9 }, { x: 48, y: 10 }, { x: 47, y: 37 }]
    };
  };

  /* L7 · Slopes of Thornhold — THE HOURGLASS.
   * A wide, open, thorny slope at the bottom (choose your own way between the briars), squeezed through a single
   * fortified pass in the ridge, then opening again onto the plateau and the ruins of Thornhold, with the keep at
   * the top. Everyone must go through the pass, which makes it a chokepoint. A hidden goat trail far to the east is
   * the secret second way up, and the shortcut back down. */
  BP.L7 = function (k) {
    var r = k.r, W = k.W, H = k.H, x, y;
    k.rect(1, 1, W - 2, H - 2, GROUND);
    var nz = k.noise(5); for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) { var e = Math.min(x, y, W - 1 - x, H - 1 - y); if (e < 2 + nz(x, y) * 3) k.set(x, y, WALL); }
    // the ridge
    var rz = k.noise(6); for (y = 30; y < 46; y++) for (x = 1; x < W - 1; x++) if (y > 33 + rz(x, 0) * 3 && y < 42 + rz(x, 9) * 3) k.set(x, y, WALL);
    // briar thickets on the slope (cover), fewer on the plateau
    k.clumps(4, 46, W - 8, H - 52, 22, 1.7, WALL, function (v) { return v === GROUND; });
    k.clumps(4, 4, W - 8, 26, 6, 1.4, WALL, function (v) { return v === GROUND; });
    // the pass and its gatehouse
    var px = 36; k.rect(px, 30, 4, 17, PATH); k.rect(px - 5, 44, 14, 6, GROUND); k.rect(px - 4, 30, 3, 3, WALL); k.rect(px + 5, 30, 3, 3, WALL); k.rect(px - 4, 44, 3, 2, WALL); k.rect(px + 5, 44, 3, 2, WALL);
    // the goat trail: long and narrow, winding up the far east of the ridge
    k.road([{ x: 66, y: 52 }, { x: 70, y: 44 }, { x: 64, y: 38 }, { x: 69, y: 31 }, { x: 62, y: 25 }], 2, PATH, 1.5);
    // ruins on the plateau: broken walls
    [[8, 14, 14, 10], [44, 12, 12, 9], [24, 20, 10, 7], [52, 24, 12, 6]].forEach(function (b) { k.frame(b[0], b[1], b[2], b[3], WALL); for (var g = 0; g < 3; g++) { var side = Math.floor(r() * 4), gx = b[0] + 2 + Math.floor(r() * (b[2] - 4)), gy = b[1] + 2 + Math.floor(r() * (b[3] - 4)); if (side === 0) k.rect(gx, b[1], 2, 1, GROUND); else if (side === 1) k.rect(gx, b[1] + b[3] - 1, 2, 1, GROUND); else if (side === 2) k.rect(b[0], gy, 1, 2, GROUND); else k.rect(b[0] + b[2] - 1, gy, 1, 2, GROUND); } });
    // the keep (boss) at the top, and the old road through the ruins
    var boss = bossRoom(k, 31, 3, 14, 7, 'S');
    k.road([{ x: 38, y: 30 }, { x: 34, y: 22 }, { x: 40, y: 16 }, boss.front], 2, PATH, 1);
    k.road([{ x: 38, y: 28 }, { x: 14, y: 26 }, { x: 15, y: 19 }], 2, PATH, 1); k.road([{ x: 40, y: 27 }, { x: 62, y: 25 }, { x: 50, y: 17 }], 2, PATH, 1);
    // a ruined watchtower in the north-west corner holds the key
    k.frame(3, 3, 8, 7, WALL); k.rect(3, 6, 1, 2, GROUND); k.road([{ x: 15, y: 17 }, { x: 4, y: 7 }], 2, PATH, 1);
    // the old road up the slope
    var fire = { x: 10, y: H - 8 };
    k.road([fire, { x: 24, y: 62 }, { x: 30, y: 54 }, { x: 37, y: 48 }], 2, PATH, 3);
    k.road([{ x: 24, y: 62 }, { x: 50, y: 64 }, { x: 66, y: 52 }], 2, PATH, 3);
    return {
      name: 'hourglass pass', spawn: fire, bossRoom: boss,
      areas: [
        { x: 24, y: 60, rx: 5, tier: 'BEG' }, { x: 46, y: 62, rx: 6, tier: 'BEG' }, { x: 16, y: 52, rx: 5, tier: 'BEG' },
        { x: 38, y: 47, rx: 4, ry: 2, tier: 'PRG' }, { x: 60, y: 56, rx: 4, tier: 'PRG' }, { x: 15, y: 19, rx: 4, tier: 'PRG' },
        { x: 50, y: 16, rx: 4, tier: 'MAS' }, { x: 29, y: 23, rx: 3, tier: 'MAS' }, { x: 58, y: 27, rx: 4, ry: 2, tier: 'MAS' }
      ],
      key: { x: 6, y: 6 },
      nooks: [{ x: 10, y: 16 }, { x: 46, y: 14 }, { x: 26, y: 22 }, { x: 54, y: 26 }, { x: 64, y: 8 }, { x: 4, y: 40 }, { x: 70, y: 66 }, { x: 4, y: 58 }, { x: 33, y: 47 }, { x: 43, y: 47 }, { x: 68, y: 38 }, { x: 22, y: 8 }, { x: 56, y: 44 }, { x: 30, y: 68 }]
    };
  };

  /* L8 · Twin Citadels — TWO STRONGHOLDS AND A CHASM.
   * Two walled citadels face each other across a bottomless chasm, joined by a single bridge. You start in the
   * siege trenches below the western citadel. The Twin Kings' throne room stands on a rock pillar in the chasm,
   * and its door opens only from the western citadel's battlements, but the key is deep inside the EASTERN
   * citadel. Every student has to take both strongholds and cross the bridge twice. */
  BP.L8 = function (k) {
    var r = k.r, W = k.W, H = k.H, x, y;
    k.rect(1, 1, W - 2, H - 2, GROUND);
    var nz = k.noise(5); for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) { var e = Math.min(x, y, W - 1 - x, H - 1 - y); if (e < 2 + nz(x, y) * 3) k.set(x, y, WALL); }
    // the chasm
    var cz = k.noise(4); for (y = 1; y < H - 1; y++) for (x = 40; x < 56; x++) if (x > 43 + cz(0, y) * 3 && x < 51 + cz(5, y) * 3) k.set(x, y, WATER);
    k.rect(40, 30, 16, 3, PATH); // the bridge
    // west citadel: curtain wall, corner towers, inner keep; gate in the south wall, battlements stair to the north door
    var A = { x: 5, y: 3, w: 34, h: 22 };
    k.frame(A.x, A.y, A.w, A.h, WALL); k.frame(A.x + 1, A.y + 1, A.w - 2, A.h - 2, WALL);
    [[A.x, A.y], [A.x + A.w - 4, A.y], [A.x, A.y + A.h - 4], [A.x + A.w - 4, A.y + A.h - 4]].forEach(function (p) { k.rect(p[0], p[1], 4, 4, WALL); });
    k.rect(A.x + 15, A.y + A.h - 2, 3, 2, PATH);              // south gate
    k.frame(A.x + 10, A.y + 6, 13, 9, WALL); k.rect(A.x + 15, A.y + 14, 3, 1, PATH); k.rect(A.x + 22, A.y + 9, 1, 3, PATH); // inner keep
    k.frame(A.x + 25, A.y + 5, 6, 6, WALL); k.rect(A.x + 25, A.y + 7, 1, 2, PATH);  // armoury
    // east citadel: lower and longer, a barracks maze inside
    var B = { x: 58, y: 34, w: 34, h: 24 };
    k.frame(B.x, B.y, B.w, B.h, WALL); k.frame(B.x + 1, B.y + 1, B.w - 2, B.h - 2, WALL);
    [[B.x, B.y], [B.x + B.w - 4, B.y], [B.x, B.y + B.h - 4], [B.x + B.w - 4, B.y + B.h - 4]].forEach(function (p) { k.rect(p[0], p[1], 4, 4, WALL); });
    k.rect(B.x + 6, B.y, 3, 2, PATH);                          // north gate, facing the bridge landing
    for (var i = 0; i < 4; i++) { var bx = B.x + 5 + i * 7; k.rect(bx, B.y + 5, 1, 14, WALL); k.rect(bx, B.y + (i % 2 ? 6 : 15), 1, 3, GROUND); }  // barracks rows
    k.rect(B.x + 4, B.y + 12, 26, 1, WALL); k.rect(B.x + 9 + Math.floor(r() * 3), B.y + 12, 2, 1, GROUND); k.rect(B.x + 23, B.y + 12, 2, 1, GROUND);
    // siege trenches in the south-west field: zig-zag earthworks
    for (var j = 0; j < 4; j++) { var ty = 32 + j * 6; k.road([{ x: 4, y: ty }, { x: 14, y: ty + 2 }, { x: 24, y: ty }, { x: 34, y: ty + 2 }], 1, WALL, 0); k.rect(8 + (j % 2) * 18, ty - 1, 3, 4, GROUND); }
    k.clumps(4, 30, 34, 28, 5, 1.2, WATER, function (v) { return v === GROUND; });  // flooded shell craters
    // ruined siege camp north-east: tents
    for (i = 0; i < 7; i++) k.rect(60 + Math.floor(r() * 26), 6 + Math.floor(r() * 18), 3, 2, WALL);
    // the throne room on its pillar; its door is on the west citadel's north-east battlement
    k.rect(40, 3, 16, 12, GROUND);
    var boss = bossRoom(k, 42, 4, 12, 8, 'W');
    k.frame(40, 2, 17, 13, WATER); k.rect(55, 2, 2, 13, WATER);
    k.road([{ x: boss.gate.x - 1, y: boss.gate.y }, { x: A.x + A.w - 6, y: 8 }], 2, PATH, 0); k.rect(A.x + A.w - 2, 7, 2, 3, PATH);
    var fire = { x: 8, y: 54 };
    k.road([fire, { x: 20, y: 44 }, { x: A.x + 16, y: A.y + A.h + 1 }], 2, PATH, 2);
    k.road([{ x: 22, y: 31 }, { x: 40, y: 31 }], 2, PATH, 0); k.road([{ x: 56, y: 31 }, { x: B.x + 7, y: B.y - 1 }], 2, PATH, 1); k.road([{ x: 56, y: 31 }, { x: 72, y: 20 }], 2, PATH, 2);
    return {
      name: 'twin citadels', spawn: fire, bossRoom: boss,
      areas: [
        { x: 12, y: 46, rx: 4, tier: 'BEG' }, { x: 28, y: 40, rx: 4, tier: 'BEG' }, { x: 30, y: 52, rx: 4, tier: 'BEG' },
        { x: A.x + 6, y: A.y + 17, rx: 3, tier: 'PRG' }, { x: A.x + 16, y: A.y + 10, rx: 3, tier: 'PRG' }, { x: 70, y: 16, rx: 6, tier: 'PRG' },
        { x: B.x + 8, y: B.y + 8, rx: 3, tier: 'MAS' }, { x: B.x + 22, y: B.y + 18, rx: 3, tier: 'MAS' }, { x: B.x + 27, y: B.y + 7, rx: 2, tier: 'MAS' }
      ],
      key: { x: B.x + 29, y: B.y + 19 },
      nooks: [{ x: A.x + 4, y: A.y + 4 }, { x: A.x + 28, y: A.y + 7 }, { x: A.x + 4, y: A.y + 18 }, { x: B.x + 4, y: B.y + 4 }, { x: B.x + 10, y: B.y + 18 }, { x: B.x + 17, y: B.y + 6 }, { x: 88, y: 6 }, { x: 62, y: 26 }, { x: 4, y: 30 }, { x: 36, y: 57 }, { x: 4, y: 4 }, { x: A.x + 13, y: A.y + 9 }, { x: B.x + 30, y: B.y + 4 }, { x: 86, y: 28 }]
    };
  };

  /* L9 · Sundered Spire — THE RINGS OF THE TOWER.
   * A round tower seen from above: an outer ring, a middle ring and the observatory at the core. The ways
   * between the rings are staggered, so you walk round each ring to find the next way in, spiralling inward
   * (a classic Metroid/Zelda tower trick). Then the tower has been split by lightning: a bottomless crack runs
   * through every ring, and only some of the crossings still have bridges. */
  BP.L9 = function (k) {
    var r = k.r, W = k.W, H = k.H, cx = 39, cy = 39, i;
    var P = function (rad, deg) { var a = deg * Math.PI / 180; return { x: Math.round(cx + Math.cos(a) * rad), y: Math.round(cy + Math.sin(a) * rad) }; };
    k.ring(cx, cy, 30.5, 34, GROUND);             // outer ring
    k.ring(cx, cy, 17.5, 20.5, GROUND);           // middle ring
    // chambers between the rings (outer band) and inside the middle ring (inner band)
    var outerCh = [20, 70, 160, 200, 250, 340], innerCh = [0, 120, 230];
    var ch = [];
    outerCh.forEach(function (d) { var p = P(25.5, d); k.disc(p.x, p.y, 3.2, GROUND, 0.3); ch.push({ p: p, d: d, band: 'outer' }); var o = P(30, d); k.seg(p.x, p.y, o.x, o.y, 2, PATH); });
    innerCh.forEach(function (d) { var p = P(13, d); k.disc(p.x, p.y, 3, GROUND, 0.3); ch.push({ p: p, d: d, band: 'inner' }); var o = P(17.5, d); k.seg(p.x, p.y, o.x, o.y, 2, PATH); });
    // spokes: outer -> middle only at the north and the east-south-east; middle -> core only at the south
    [[270, 30.5, 20.5], [20, 30.5, 20.5]].forEach(function (s) { var a = P(s[1], s[0]), b = P(s[2], s[0]); k.seg(a.x, a.y, b.x, b.y, 2, PATH); });
    // two outer chambers also reach in to the middle ring: extra loops
    [160, 340].forEach(function (d) { var a = P(25.5, d), b = P(20.5, d); k.seg(a.x, a.y, b.x, b.y, 2, PATH); });
    // the entrance hall and the bonfire, below the tower
    k.rect(cx - 4, cy + 33, 9, 5, GROUND); var fire = { x: cx - 2, y: cy + 35 };
    // the core: the observatory, entered from the south
    var boss = bossRoom(k, cx - 5, cy - 5, 11, 9, 'S');
    k.seg(boss.front.x, boss.front.y, cx, cy + 17.5, 2, PATH);
    // the lightning crack, north-east to south-west; bridges only at some crossings
    var crack = k.road([{ x: 66, y: 4 }, { x: 52, y: 22 }, { x: 46, y: 30 }, { x: 30, y: 46 }, { x: 22, y: 60 }, { x: 10, y: 74 }], 3, WATER, 2);
    sealBoss(k, boss);
    // re-lay bridges where the crack cuts the rings: outer ring north-east (bridge), middle ring north-east (broken), outer ring south-west (bridge), middle ring south-west (bridge)
    function bridgeNear(rad, deg) { for (var dd = -12; dd <= 12; dd += 1) { var p = P(rad, deg + dd); if (k.get(p.x, p.y) === WATER) { k.ring(cx, cy, rad - 1.5, rad + 1.5, PATH); return; } } }
    // simpler: put explicit bridges by re-carving short arcs of the ring over the crack
    function arc(rad, d0, d1, w) { for (var d = d0; d <= d1; d += 1) { var p = P(rad, d); k.rect(p.x - 1, p.y - 1, w, w, PATH); } }
    arc(32.2, 290, 320, 3); arc(32.2, 110, 140, 3); arc(19, 110, 140, 3);
    // the key: in the inner chamber that sits beyond the broken middle-ring crossing
    var keyCh = ch.filter(function (c) { return c.band === 'inner' && c.d === 0; })[0];
    var nooks = ch.filter(function (c) { return c !== keyCh; }).map(function (c) { return { x: c.p.x, y: c.p.y }; });
    [45, 135, 225, 315, 290, 100].forEach(function (d) { var p = P(32.5, d); nooks.push(p); });
    [90, 200, 300].forEach(function (d) { nooks.push(P(19, d)); });
    return {
      name: 'rings of the tower', spawn: fire, bossRoom: boss,
      areas: [
        { x: P(32, 90).x, y: P(32, 90).y - 1, rx: 4, ry: 1, tier: 'BEG' }, { x: P(25.5, 160).x, y: P(25.5, 160).y, rx: 2, tier: 'BEG' }, { x: P(32, 180).x, y: P(32, 180).y, rx: 1, ry: 4, tier: 'BEG' },
        { x: P(25.5, 250).x, y: P(25.5, 250).y, rx: 2, tier: 'PRG' }, { x: P(32, 270).x, y: P(32, 270).y, rx: 4, ry: 1, tier: 'PRG' }, { x: P(25.5, 340).x, y: P(25.5, 340).y, rx: 2, tier: 'PRG' },
        { x: P(19, 270).x, y: P(19, 270).y, rx: 4, ry: 1, tier: 'MAS' }, { x: P(13, 120).x, y: P(13, 120).y, rx: 2, tier: 'MAS' }, { x: P(13, 230).x, y: P(13, 230).y, rx: 2, tier: 'MAS' }
      ],
      key: keyCh.p, nooks: nooks
    };
  };

  /* L10 · The Frozen Reach — THE FROZEN LAKE AND THE CANYON.
   * A vast open snowfield wrapped round a great frozen lake (a ring road with the lake as the hole in the middle),
   * with one narrow ice bridge straight across it: the bold shortcut. Long sightlines on the snow mean creatures
   * spot you early. North of it all, a cliff wall; the only way to the Winter Wyrm is a long, narrow, winding
   * canyon with ice caves off its sides: wide-open space first, then a tight finale. */
  BP.L10 = function (k) {
    var r = k.r, W = k.W, H = k.H, x, y;
    k.rect(1, 1, W - 2, H - 2, GROUND);
    var nz = k.noise(5); for (y = 1; y < H - 1; y++) for (x = 1; x < W - 1; x++) { var e = Math.min(x, y, W - 1 - x, H - 1 - y); if (e < 2 + nz(x, y) * 4) k.set(x, y, WALL); }
    // the cliff wall across the north
    var cz = k.noise(7); for (y = 1; y < 22; y++) for (x = 1; x < W - 1; x++) if (y < 14 + cz(x, 0) * 6) k.set(x, y, WALL);
    // the frozen lake and its ice bridge
    k.ell(42, 40, 22, 12, WATER, 0.35);
    k.disc(36, 39, 2.5, GROUND, 0.4);
    k.road([{ x: 42, y: 54 }, { x: 37, y: 40 }, { x: 44, y: 26 }], 2, PATH, 1);
    // ice crags and cairn fields on the snow
    k.clumps(4, 22, W - 8, H - 26, 16, 1.6, WALL, function (v) { return v === GROUND; });
    k.scatter(70, 24, 24, 16, WALL, 0.05, function (v) { return v === GROUND; });
    // the ring road round the lake
    k.road([{ x: 86, y: 57 }, { x: 60, y: 58 }, { x: 22, y: 56 }, { x: 10, y: 42 }, { x: 16, y: 26 }, { x: 44, y: 24 }, { x: 70, y: 28 }, { x: 80, y: 44 }, { x: 86, y: 57 }], 2, PATH, 2, k.notWater);
    // the canyon: from the north shore up into the cliffs, long and winding, ice caves off its sides
    var can = k.road([{ x: 30, y: 23 }, { x: 28, y: 15 }, { x: 38, y: 9 }, { x: 52, y: 13 }, { x: 62, y: 6 }, { x: 74, y: 10 }, { x: 80, y: 6 }], 2, GROUND, 1.5);
    var caves = [[34, 11, 0, -1], [52, 13, 0, 1], [62, 6, -1, 0], [44, 10, 0, -1]];
    var nooks = [];
    caves.forEach(function (c) { var ex = c[0] + c[2] * 5, ey = c[1] + c[3] * 4; k.seg(c[0], c[1], ex, ey, 2, GROUND); k.disc(ex, ey, 1.8, GROUND); nooks.push({ x: ex, y: ey }); });
    var boss = bossRoom(k, 85, 2, 11, 9, 'W');
    k.road([{ x: 80, y: 6 }, boss.front], 2, GROUND, 0);
    var fire = { x: 86, y: 57 };
    k.disc(fire.x, fire.y, 3, GROUND);
    return {
      name: 'frozen lake and canyon', spawn: fire, bossRoom: boss,
      areas: [
        { x: 70, y: 56, rx: 4, tier: 'BEG' }, { x: 52, y: 58, rx: 4, tier: 'BEG' }, { x: 80, y: 42, rx: 4, tier: 'BEG' },
        { x: 26, y: 55, rx: 4, tier: 'PRG' }, { x: 12, y: 40, rx: 3, tier: 'PRG' }, { x: 66, y: 28, rx: 4, tier: 'PRG' },
        { x: 18, y: 26, rx: 3, tier: 'MAS' }, { x: 38, y: 10, rx: 2, tier: 'MAS' }, { x: 70, y: 9, rx: 2, tier: 'MAS' }, { x: 36, y: 39, rx: 1, tier: 'MAS' }
      ],
      key: { x: 4, y: 26 },
      nooks: nooks.concat([{ x: 36, y: 39 }, { x: 94, y: 26 }, { x: 94, y: 44 }, { x: 4, y: 58 }, { x: 46, y: 62 }, { x: 60, y: 22 }, { x: 22, y: 34 }, { x: 74, y: 46 }, { x: 8, y: 50 }, { x: 54, y: 30 }])
    };
  };

  /* L11 · The Purloined Throne — THE ROAD THROUGH THE FIRE (the finale).
   * No creatures, no key, no treasure: a bonfire on a ledge, then one road climbing north across a sea of lava,
   * lined both sides with standing pillars like an avenue of statues. Two round landings break the climb, and the
   * throne room's gate is in sight from the very first step. Short, straight and grand: the walk is the ceremony. */
  BP.L11 = function (k) {
    // a processional, mirror-symmetric about x = cx: bonfire terrace, road, landing, road, landing, road, gate
    var W = k.W, H = k.H, cx = (W - 1) / 2, x, y, braziers = [], props = [];
    k.rect(1, 1, W - 2, H - 2, WALL);
    k.rect(3, 15, W - 6, 58, WATER);                                     // the lava sea, square to the road
    function road(y0, y1) { k.rect(cx - 2, y0, 5, y1 - y0 + 1, PATH); for (y = y0; y <= y1; y++) { k.set(cx - 3, y, WALL); k.set(cx + 3, y, WALL); } }
    function platform(yc, half, hgt) { // a walled square landing with the road running through it
      var x0 = cx - half, x1 = cx + half, y0 = yc - hgt, y1 = yc + hgt;
      k.rect(x0, y0, x1 - x0 + 1, y1 - y0 + 1, GROUND); k.frame(x0 - 1, y0 - 1, x1 - x0 + 3, y1 - y0 + 3, WALL);
      k.rect(cx - 2, y0 - 1, 5, y1 - y0 + 3, PATH);                       // openings top and bottom, the road through the middle
      return { x0: x0 - 1, x1: x1 + 1, y0: y0 - 1, y1: y1 + 1 };
    }
    var fire = { x: cx, y: 68 };
    var t0 = platform(68, 6, 3);                                          // the bonfire terrace (road ends on its north edge)
    k.rect(cx - 2, t0.y1, 5, 1, WALL);                                    // closed to the south
    k.rect(t0.x0 + 1, t0.y0 + 2, t0.x1 - t0.x0 - 1, t0.y1 - t0.y0 - 2, GROUND); // the road stops at the terrace's north edge; the fire sits mid-terrace
    var l1 = platform(49, 5, 3), l2 = platform(30, 5, 3);
    road(l1.y1 + 1, t0.y0 - 1); road(l2.y1 + 1, l1.y0 - 1); road(15, l2.y0 - 1);
    var boss = bossRoom(k, cx - 8, 3, 17, 11, 'S');
    k.rect(cx - 2, 15, 5, 3, PATH);
    // braziers on the parapets, every four rows, mirrored; and on each landing's four corners
    [[l1.y1 + 2, t0.y0 - 2], [l2.y1 + 2, l1.y0 - 2], [16, l2.y0 - 2]].forEach(function (seg) { for (y = seg[0]; y <= seg[1]; y += 4) braziers.push({ x: cx - 3, y: y }, { x: cx + 3, y: y }); });
    [t0, l1, l2].forEach(function (P) { braziers.push({ x: P.x0, y: P.y0 }, { x: P.x1, y: P.y0 }); if (P !== t0) braziers.push({ x: P.x0, y: P.y1 }, { x: P.x1, y: P.y1 }); });
    // hand-placed scenery (prop index into the land's set; mirrored pairs): 0 pillar, 1 kneeling scholar, 2 crowned head,
    // 3 banner, 4 crowns and scrolls, 5 obelisk, 6 lectern, 7 bones
    function pair(i, dx, y, flatOnGround) { props.push({ i: i, x: cx - dx, y: y, flip: false, flat: !!flatOnGround }, { i: i, x: cx + dx, y: y, flip: true, flat: !!flatOnGround }); }
    pair(0, 7, 2); pair(0, 4, 2); pair(3, 2, 2);                          // throne room: pillars and banners on the north wall
    pair(5, 8, 13); pair(4, 3, 6, true); pair(7, 6, 10, true);            // obelisks at the south corners, crowns and bones on the floor
    pair(1, 6, l1.y0); pair(1, 6, l2.y0);                                 // kneeling scholars on the landings' north parapets
    pair(6, 4, l1.y0 + 2, true); pair(6, 4, l2.y0 + 2, true);             // lecterns on the landings
    pair(5, 6, t0.y0); pair(2, 4, t0.y0 + 2, true);                       // obelisks over the terrace, a fallen crowned head either side
    braziers.forEach(function (p) { if (k.get(p.x, p.y) !== WALL) k.set(p.x, p.y, GROUND); });
    return { name: 'the processional', spawn: fire, bossRoom: boss, bare: true, fillPockets: true, braziers: braziers, props: props,
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

  var SIZES = { T0: [48, 36], L11: [45, 76], L1: [84, 56], L2: [84, 60], L3: [76, 76], L4: [79, 57], L5: [88, 56], L6: [104, 44], L7: [76, 72], L8: [96, 62], L9: [78, 78], L10: [100, 66] };

  function build(L, env) {
    var bpf = BP[L.id]; if (!bpf) return null;
    G = env.G; SOLID = env.SOLID; WALL = G.WALL; WATER = G.WATER; GROUND = G.GROUND; GROUND2 = G.GROUND2; PATH = G.PATH; DECO = G.DECO; GATE = G.GATE; FIRE = G.FIRE; EDGE = G.EDGE;
    var sz = SIZES[L.id] || [84, 56], r = rng(hash('unbound:' + L.id + ':v5'));
    var k = Kit(sz[0], sz[1], WALL, r), bp = bpf(k, L);
    return finish(L, k, bp, env.theme || {});
  }
  return { build: build, has: function (id) { return !!BP[id]; }, LAYOUT: 'v5' };
})();
