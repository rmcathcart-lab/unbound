/* ===================== OVERWORLD =====================
 * A walkable pixel-art map for each land. The hero walks (WASD / arrows / touch stick), fog lifts as they
 * explore, creatures lurk at lairs and start the normal battle when challenged, and the land is littered with
 * chests (Lore), lost pages and the key that opens the boss gate.
 *
 * Overworld.mount(container, { land, state, onBattle(creature, isBoss), onBonfire(), onSave() })
 * Overworld.unmount()
 * Map layout is generated from a seed per land so every student gets the same world; progress (explored fog,
 * opened chests, pages, key, position) lives in state.world[landId].
 */
var Overworld = (function () {
  var T = 16, MW = 56, MH = 40, REACH = 32;              // REACH: how close (px) a creature must be to strike it first (2 tiles)                       // tile size; map size in tiles (set per map on mount; v1 maps are 56x40)
  var G = { GROUND: 0, GROUND2: 1, PATH: 2, WALL: 3, WATER: 4, DECO: 5, GATE: 6, GATE_OPEN: 7, FIRE: 8, EDGE: 9 };
  var SOLID = { 3: 1, 4: 1, 6: 1, 9: 1 };

  /* ---------- seeded random ---------- */
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

  /* ---------- themes (what the tiles look like until sprite sheets are in; sprite names when they are) ---------- */
  var THEMES = {
    T0: null, // the tutorial (The Proving Grounds) borrows the Barrow Marches, set below
    L1: { name: 'marsh', ground: ['#2b3a2b', '#263426'], path: '#4a4030', wall: 'tree-dead', water: '#1b2b3a', deco: ['grave', 'bones', 'reed'], wallDensity: 0.30, waterDensity: 0.07 },
    L2: { name: 'volcano', ground: ['#3a2a24', '#33241f'], path: '#5a4a3a', wall: 'rock', water: '#c84a1e', deco: ['ember', 'bones', 'rock-small'], wallDensity: 0.32, waterDensity: 0.08, lava: true },
    L3: { name: 'forest', ground: ['#243a22', '#1f331e'], path: '#4a3c2a', wall: 'tree', water: '#1f3340', deco: ['mushroom', 'stump', 'fern'], wallDensity: 0.38, waterDensity: 0.04 },
    L4: { name: 'crypt', ground: ['#2d2a2e', '#282529'], path: '#3a3438', wall: 'wall', water: '#101018', deco: ['bones', 'coffin', 'skull'], wallDensity: 0.34, waterDensity: 0.03, indoor: true },
    L5: { name: 'fen', ground: ['#243036', '#1f2a30'], path: '#4a4a3a', wall: 'tree-dead', water: '#1b3340', deco: ['reed', 'bones'], wallDensity: 0.3, waterDensity: 0.12 },
    L6: { name: 'coast', ground: ['#2a3034', '#252b2f'], path: '#5a5648', wall: 'rock', water: '#1a3a4a', deco: ['bones', 'rock-small'], wallDensity: 0.32, waterDensity: 0.14 },
    L7: { name: 'thorn', ground: ['#34301f', '#2e2a1c'], path: '#5a4e34', wall: 'tree', water: '#1f3340', deco: ['stump', 'rock-small'], wallDensity: 0.36, waterDensity: 0.03 },
    L8: { name: 'citadel', ground: ['#2e2c2a', '#292725'], path: '#4a4640', wall: 'wall', water: '#14181e', deco: ['rock-small', 'bones'], wallDensity: 0.34, waterDensity: 0.04 },
    L9: { name: 'spire', ground: ['#2a2a32', '#25252d'], path: '#46444e', wall: 'rock', water: '#151a28', deco: ['rock-small', 'bones'], wallDensity: 0.34, waterDensity: 0.05 },
    L11: { name: 'throne', ground: ['#2a2230', '#251e2b'], path: '#4a4050', wall: 'rock', water: '#b8441e', deco: ['ember', 'bones'], wallDensity: 0.3, waterDensity: 0.1, lava: true, decoP: 0.03 },
    L10: { name: 'frost', ground: ['#3a4048', '#343a42'], path: '#5a6068', wall: 'rock', water: '#2a4458', deco: ['rock-small', 'bones'], wallDensity: 0.32, waterDensity: 0.1 },
    def: { name: 'wild', ground: ['#2e342c', '#293026'], path: '#4a4030', wall: 'tree', water: '#1b2b3a', deco: ['rock-small', 'bones'], wallDensity: 0.3, waterDensity: 0.05 }
  };
  THEMES.T0 = THEMES.L1;
  function themeFor(L) { return THEMES[L.id] || THEMES.def; }

  /* ---------- map generation ---------- */
  function noise2(r, w, h, scale) { // value noise on a coarse grid, bilinear
    var gw = Math.ceil(w / scale) + 2, gh = Math.ceil(h / scale) + 2, grid = [];
    for (var i = 0; i < gw * gh; i++) grid.push(r());
    return function (x, y) {
      var gx = x / scale, gy = y / scale, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
      var a = grid[y0 * gw + x0], b = grid[y0 * gw + x0 + 1], c = grid[(y0 + 1) * gw + x0], d = grid[(y0 + 1) * gw + x0 + 1];
      var sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
      return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
    };
  }
  function generate(L) {
    if (typeof LandMaps !== 'undefined' && LandMaps.has(L.id)) { var lm = LandMaps.build(L, { G: G, SOLID: SOLID, theme: themeFor(L) }); if (lm) return lm; }
    if (L.explore === 2) return generateV2(L);
    MW = 56; MH = 40;
    var r = rng(hash('unbound:' + L.id + ':v1')), th = themeFor(L);
    var tiles = new Uint8Array(MW * MH), x, y, i;
    var idx = function (x, y) { return y * MW + x; };
    var inb = function (x, y) { return x >= 0 && y >= 0 && x < MW && y < MH; };
    for (i = 0; i < tiles.length; i++) tiles[i] = r() < 0.18 ? G.GROUND2 : G.GROUND;
    for (x = 0; x < MW; x++) { tiles[idx(x, 0)] = G.EDGE; tiles[idx(x, 1)] = G.WALL; tiles[idx(x, MH - 1)] = G.EDGE; tiles[idx(x, MH - 2)] = G.WALL; }
    for (y = 0; y < MH; y++) { tiles[idx(0, y)] = G.EDGE; tiles[idx(1, y)] = G.WALL; tiles[idx(MW - 1, y)] = G.EDGE; tiles[idx(MW - 2, y)] = G.WALL; }
    // points of interest
    var pois = [], spawn = { x: 5, y: Math.floor(MH / 2) };
    function far(p, minD) { if (Math.hypot(p.x - spawn.x, p.y - spawn.y) < minD) return false; for (var k = 0; k < pois.length; k++) if (Math.hypot(p.x - pois[k].x, p.y - pois[k].y) < minD) return false; return true; }
    function pickPoint(minD, xmin, xmax) { for (var tries = 0; tries < 400; tries++) { var p = { x: xmin + Math.floor(r() * (xmax - xmin)), y: 4 + Math.floor(r() * (MH - 8)) }; if (far(p, minD)) return p; } return { x: xmin + 2, y: 4 + Math.floor(r() * (MH - 8)) }; }
    var lairs = [];
    L.creatures.forEach(function (c, k) { var p = pickPoint(9, 10, MW - 10); p.kind = 'creature'; p.ref = c; pois.push(p); lairs.push(p); });
    var gate = { x: MW - 7, y: 6 + Math.floor(r() * (MH - 12)), kind: 'gate' }; pois.push(gate);
    var keyP = pickPoint(10, 8, MW - 12); keyP.kind = 'key'; pois.push(keyP);
    var chests = []; for (i = 0; i < 7; i++) { var cp = pickPoint(6, 8, MW - 8); cp.kind = 'chest'; cp.n = i; pois.push(cp); chests.push(cp); }
    var pages = []; for (i = 0; i < 5; i++) { var pp = pickPoint(6, 6, MW - 6); pp.kind = 'page'; pp.n = i; pois.push(pp); pages.push(pp); }
    // paths: spawn -> each lair -> gate, jittered L-shapes
    var onPath = new Uint8Array(MW * MH);
    function carve(a, b) {
      var cx = a.x, cy = a.y, horizFirst = r() < 0.5;
      while (cx !== b.x || cy !== b.y) {
        onPath[idx(cx, cy)] = 1;
        if (r() < 0.12) { var jx = cx + (r() < 0.5 ? -1 : 1), jy = cy; if (inb(jx, jy) && jx > 2 && jx < MW - 3) onPath[idx(jx, jy)] = 1; }
        if (horizFirst ? cx !== b.x : (cy === b.y && cx !== b.x)) cx += cx < b.x ? 1 : -1;
        else if (cy !== b.y) cy += cy < b.y ? 1 : -1;
        else cx += cx < b.x ? 1 : -1;
      }
      onPath[idx(cx, cy)] = 1;
    }
    var order = lairs.slice().sort(function (a, b) { return a.x - b.x; });
    var prev = spawn; order.forEach(function (p) { carve(prev, p); prev = p; }); carve(prev, gate);
    carve(spawn, keyP); chests.forEach(function (c) { carve(lairs[Math.floor(r() * lairs.length)], c); });
    // obstacles and water from noise, never on paths or near POIs
    var nz = noise2(r, MW, MH, 5), wz = noise2(r, MW, MH, 7);
    var near = new Uint8Array(MW * MH);
    pois.concat([spawn]).forEach(function (p) { for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) if (inb(p.x + dx, p.y + dy)) near[idx(p.x + dx, p.y + dy)] = 1; });
    for (y = 2; y < MH - 2; y++) for (x = 2; x < MW - 2; x++) {
      i = idx(x, y); if (onPath[i] || near[i]) { if (onPath[i]) tiles[i] = G.PATH; continue; }
      var nv = nz(x, y), wv = wz(x, y);
      if (wv > 1 - th.waterDensity * 1.6) tiles[i] = G.WATER;
      else if (nv > 1 - th.wallDensity) tiles[i] = G.WALL;
      else if (r() < 0.06) tiles[i] = G.DECO;
    }
    // thin any 1-wide dead-end pockets: make sure every POI is reachable (BFS), else carve straight
    function reachable() {
      var seen = new Uint8Array(MW * MH), q = [spawn.x, spawn.y]; seen[idx(spawn.x, spawn.y)] = 1;
      while (q.length) { var qx = q.shift(), qy = q.shift(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = qx + d[0], ny = qy + d[1]; if (!inb(nx, ny)) return; var j = idx(nx, ny); if (seen[j] || SOLID[tiles[j]]) return; seen[j] = 1; q.push(nx, ny); }); }
      return seen;
    }
    var seen = reachable();
    pois.forEach(function (p) { if (!seen[idx(p.x, p.y)]) { var cx = spawn.x, cy = spawn.y; while (cx !== p.x || cy !== p.y) { if (cx !== p.x) cx += cx < p.x ? 1 : -1; else cy += cy < p.y ? 1 : -1; var j = idx(cx, cy); if (SOLID[tiles[j]] && tiles[j] !== G.EDGE) tiles[j] = G.PATH; } } });
    tiles[idx(spawn.x, spawn.y)] = G.FIRE;
    // gate: a wall segment with the gate tile in it, boss room behind
    for (y = gate.y - 3; y <= gate.y + 3; y++) for (x = gate.x; x < MW - 2; x++) if (inb(x, y)) tiles[idx(x, y)] = (x === gate.x && y === gate.y) ? G.GATE : (x === gate.x || y === gate.y - 3 || y === gate.y + 3) ? G.WALL : G.PATH;
    for (y = gate.y - 2; y <= gate.y + 2; y++) for (x = gate.x + 1; x < MW - 2; x++) tiles[idx(x, y)] = G.PATH;
    var bossP = { x: Math.min(MW - 4, gate.x + 4), y: gate.y, kind: 'boss', ref: L.boss };
    return { w: MW, h: MH, tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th };
  }


  /* ---------- map generation v2: a designed land, built the way "cyclic dungeon generation" builds levels ----------
   * (after Unexplored / Joris Dormans, and the Dark Souls habit of loops and shortcuts):
   *   1. One big cycle: bonfire -> goal (boss gate), split into two arcs. The LONG SAFE WAY runs across the top through
   *      five clearings (Beginning creatures, then Progressing); the SHORT DANGEROUS WAY runs along the bottom through
   *      three clearings guarded by Mastery creatures. Both arrive at the antechamber in front of the boss door.
   *   2. A landmark in the middle, the Crossing (a big clearing with water), links the two arcs: the shortcut home.
   *   3. Minor cycles: short detour loops hung off the arcs, and a few cross-links.
   *   4. Lock and key: the Gate Key lies at the end of a guarded dead end off the far end of the land.
   *   5. Dead ends: winding treasure lanes off the clearings, with a chest or a page at the end.
   * Corridors are 2-wide winding paths; everything else is solid. Same seed per land, so every student gets the same land. */
  function generateV2(L) {
    var r = rng(hash('unbound:' + L.id + ':v4')), th = themeFor(L);
    var W = 84, H = 56, tiles = new Uint8Array(W * H), x, y, i;
    var idx = function (x, y) { return y * W + x; }, inb = function (x, y) { return x > 1 && y > 1 && x < W - 2 && y < H - 2; };
    for (i = 0; i < tiles.length; i++) tiles[i] = G.WALL;
    for (x = 0; x < W; x++) { tiles[idx(x, 0)] = G.EDGE; tiles[idx(x, H - 1)] = G.EDGE; } for (y = 0; y < H; y++) { tiles[idx(0, y)] = G.EDGE; tiles[idx(W - 1, y)] = G.EDGE; }
    var rooms = [];
    function room(cx, cy, w, h, tag) {
      var rm = { w: w, h: h, tag: tag }; rm.x = Math.max(2, Math.min(W - w - 3, Math.round(cx - w / 2))); rm.y = Math.max(2, Math.min(H - h - 3, Math.round(cy - h / 2)));
      for (var t = 0; t < 30; t++) { var clash = rooms.some(function (b) { return rm.x < b.x + b.w + 2 && rm.x + rm.w + 2 > b.x && rm.y < b.y + b.h + 2 && rm.y + rm.h + 2 > b.y; }); if (!clash) break; rm.y += (t % 2 ? -1 : 1) * (t + 1); rm.y = Math.max(2, Math.min(H - h - 3, rm.y)); }
      rm.cx = rm.x + Math.floor(rm.w / 2); rm.cy = rm.y + Math.floor(rm.h / 2); rm.id = rooms.length; rooms.push(rm); return rm;
    }
    var jit = function (n) { return Math.floor((r() - 0.5) * 2 * n); };
    var midY = Math.floor(H / 2);
    var start = room(8, midY + jit(4), 9, 7, 'start');
    var boss = room(W - 7, midY + jit(3), 8, 6, 'boss');
    var ante = room(W - 18, boss.cy + jit(2), 7, 6, 'ante');
    var safe = [], danger = [], nSafe = 5, nDanger = 3;
    for (i = 0; i < nSafe; i++) safe.push(room(20 + (W - 44) * i / (nSafe - 1) + jit(2), 13 + jit(3), 5 + Math.floor(r() * 5), 4 + Math.floor(r() * 3), 'safe'));
    for (i = 0; i < nDanger; i++) danger.push(room(24 + (W - 48) * i / (nDanger - 1) + jit(3), H - 13 + jit(2), 6 + Math.floor(r() * 4), 4 + Math.floor(r() * 3), 'danger'));
    var cross = room(Math.floor(W / 2) + jit(3), midY + jit(3), 10, 7, 'cross');
    var loops = [];
    loops.push(room((safe[1].cx + safe[2].cx) / 2, 3, 5, 3, 'loop'));          // minor cycle above the safe arc
    loops.push(room((safe[3].cx + safe[4].cx) / 2, 3, 5, 3, 'loop'));
    loops.push(room((danger[0].cx + danger[1].cx) / 2, H - 4, 6, 3, 'loop')); // minor cycle below the dangerous arc
    rooms.forEach(function (rm) { for (y = rm.y; y < rm.y + rm.h; y++) for (x = rm.x; x < rm.x + rm.w; x++) if (inb(x, y)) tiles[idx(x, y)] = r() < 0.2 ? G.GROUND2 : G.GROUND; });
    // winding 2-wide corridors
    function corridor(a, b) {
      var cx = a.x, cy = a.y, steps = 0;
      function put(px, py) { if (inb(px, py) && tiles[idx(px, py)] === G.WALL) tiles[idx(px, py)] = G.PATH; }
      while ((cx !== b.x || cy !== b.y) && steps++ < 900) {
        put(cx, cy); put(cx + 1, cy); put(cx, cy + 1); put(cx + 1, cy + 1);
        var dx = b.x - cx, dy = b.y - cy, rr = r();
        if (rr < 0.6) { if (Math.abs(dx) > Math.abs(dy) || dy === 0) cx += dx > 0 ? 1 : -1; else cy += dy > 0 ? 1 : -1; }
        else if (rr < 0.92) { if (dx !== 0) cx += dx > 0 ? 1 : -1; else cy += dy > 0 ? 1 : -1; }
        else { var sd = Math.floor(r() * 4), nx = cx + (sd === 0 ? 1 : sd === 1 ? -1 : 0), ny = cy + (sd === 2 ? 1 : sd === 3 ? -1 : 0); if (inb(nx, ny) && inb(nx + 1, ny + 1)) { cx = nx; cy = ny; } }
      }
      put(cx, cy); put(cx + 1, cy); put(cx, cy + 1); put(cx + 1, cy + 1);
    }
    var C = function (rm) { return { x: rm.cx, y: rm.cy }; };
    var chain = [start].concat(safe, [ante]); for (i = 0; i < chain.length - 1; i++) corridor(C(chain[i]), C(chain[i + 1]));
    chain = [start].concat(danger, [ante]); for (i = 0; i < chain.length - 1; i++) corridor(C(chain[i]), C(chain[i + 1]));
    corridor(C(safe[2]), C(cross)); corridor(C(cross), C(danger[1]));                     // the Crossing: shortcut between the arcs
    corridor(C(safe[1]), C(loops[0])); corridor(C(loops[0]), C(safe[2]));                 // minor cycles
    corridor(C(safe[3]), C(loops[1])); corridor(C(loops[1]), C(safe[4]));
    corridor(C(danger[0]), C(loops[2])); corridor(C(loops[2]), C(danger[1]));
    if (r() < 0.7) corridor(C(safe[0]), C(cross));                                          // an extra cross-link
    // boss door: the ante joins the boss room through a single gate in a wall
    var gate = { x: boss.x - 1, y: boss.cy };
    for (y = boss.y - 1; y <= boss.y + boss.h; y++) if (inb(boss.x - 1, y)) tiles[idx(boss.x - 1, y)] = G.WALL;
    corridor(C(ante), { x: gate.x - 2, y: gate.y }); tiles[idx(gate.x - 1, gate.y)] = G.PATH; tiles[idx(gate.x - 2, gate.y)] = G.PATH; tiles[idx(gate.x, gate.y)] = G.GATE;
    // water in the landmarks and decoration
    [cross, start].forEach(function (rm) { if (rm === start) return; var wx = rm.x + 1, wy = rm.y + rm.h - 3; for (y = wy; y < wy + 2; y++) for (x = wx; x < wx + 3; x++) tiles[idx(x, y)] = G.WATER; });
    safe.concat(danger).forEach(function (rm) { if (rm.w >= 7 && rm.h >= 5 && r() < 0.5) { var wx = rm.x + (r() < 0.5 ? 0 : rm.w - 2), wy = rm.y + (r() < 0.5 ? 0 : rm.h - 2); for (y = wy; y < wy + 2; y++) for (x = wx; x < wx + 2; x++) tiles[idx(x, y)] = G.WATER; } });
    // dead ends: winding treasure lanes off the clearings (never breaking into another open area)
    var lanes = [];
    function lane(from, len, prefer) { for (var attempt = 0; attempt < 8; attempt++) { var got = laneTry(from, len, attempt === 0 ? prefer : null); if (got) return got; } return null; }
    function laneTry(from, len, prefer) {
      var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]], d = prefer || dirs[Math.floor(r() * 4)];
      var px, py; // first 2x2 block just outside the room edge
      if (d[0] === 1) { px = from.x + from.w; py = from.y + Math.floor(r() * (from.h - 1)); }
      else if (d[0] === -1) { px = from.x - 2; py = from.y + Math.floor(r() * (from.h - 1)); }
      else if (d[1] === 1) { px = from.x + Math.floor(r() * (from.w - 1)); py = from.y + from.h; }
      else { px = from.x + Math.floor(r() * (from.w - 1)); py = from.y - 2; }
      var blocks = [], mine = {}, turns = 0;
      // the room tiles the first block leans on must be walkable (not a pool)
      var rx = d[0] === 1 ? px - 1 : px + 2, ry = d[1] === 1 ? py - 1 : py + 2, e1 = d[0] ? [rx, py] : [px, ry], e2 = d[0] ? [rx, py + 1] : [px + 1, ry];
      if (tiles[idx(e1[0], e1[1])] === G.WATER && tiles[idx(e2[0], e2[1])] === G.WATER) return null;
      function inRoom(tx, ty) { return tx >= from.x && tx < from.x + from.w && ty >= from.y && ty < from.y + from.h; }
      function ok(bx, by) { // the block is solid, and nothing open touches it except the room (at the start) and the last few blocks of this lane
        for (var oy = -1; oy <= 2; oy++) for (var ox = -1; ox <= 2; ox++) {
          var tx = bx + ox, ty = by + oy, inner = ox >= 0 && ox <= 1 && oy >= 0 && oy <= 1;
          if (inner && !inb(tx, ty)) return false; if (!inb(tx, ty)) continue;
          var t = tiles[idx(tx, ty)]; if (t === G.WALL) continue;
          if (inner) { if (mine[tx + ',' + ty] != null) continue; return false; }
          if (blocks.length < 2 && inRoom(tx, ty)) continue;
          var m = mine[tx + ',' + ty]; if (m != null && m >= blocks.length - 3) continue;
          return false;
        }
        return true;
      }
      function perp(dd) { return dd[0] ? [0, r() < 0.5 ? 1 : -1] : [r() < 0.5 ? 1 : -1, 0]; }
      while (blocks.length < len && turns < 8) {
        if (ok(px, py)) {
          var bi = blocks.length; blocks.push({ x: px, y: py });
          [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (o) { tiles[idx(px + o[0], py + o[1])] = G.PATH; mine[(px + o[0]) + ',' + (py + o[1])] = bi; });
          if (r() < 0.18) d = perp(d);
          px += d[0]; py += d[1];
        } else {
          turns++; if (!blocks.length) return null;
          d = perp(d); var lb = blocks[blocks.length - 1]; px = lb.x + d[0]; py = lb.y + d[1];
        }
      }
      if (blocks.length < 4) { blocks.forEach(function (bk) { [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(function (o) { tiles[idx(bk.x + o[0], bk.y + o[1])] = G.WALL; }); }); return null; }
      var lb2 = blocks[blocks.length - 1], end = { x: lb2.x + Math.floor(r() * 2), y: lb2.y + Math.floor(r() * 2), from: from.tag }; lanes.push(end); return end;
    }
    [safe[0], safe[1], safe[3], safe[4], danger[0], danger[2], cross, ante].forEach(function (rm) { lane(rm, 8 + Math.floor(r() * 9)); });
    var keyEnd = lane(danger[2], 12 + Math.floor(r() * 6), [0, -1]) || lane(ante, 10, [0, 1]) || lane(safe[4], 10, [0, 1]);
    for (i = 0; i < tiles.length; i++) if (tiles[i] === G.GROUND && r() < 0.07) tiles[i] = G.DECO;
    var spawn = { x: start.cx, y: start.cy }; tiles[idx(spawn.x, spawn.y)] = G.FIRE;
    // walking distance from the fire (also proves everything is reachable)
    var DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]], dist = new Int32Array(W * H).fill(-1), q = [spawn.x, spawn.y]; dist[idx(spawn.x, spawn.y)] = 0;
    while (q.length) { var qx = q.shift(), qy = q.shift(), dq = dist[idx(qx, qy)]; DIRS.forEach(function (d) { var nx = qx + d[0], ny = qy + d[1]; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return; var t2 = tiles[idx(nx, ny)]; if (SOLID[t2] && t2 !== G.GATE) return; if (dist[idx(nx, ny)] >= 0) return; dist[idx(nx, ny)] = dq + 1; q.push(nx, ny); }); }
    var bossP = { x: boss.cx + 1, y: boss.cy, kind: 'boss', ref: L.boss };
    function freeIn(rm, avoid) { for (var t = 0; t < 80; t++) { var fx = rm.x + Math.floor(r() * rm.w), fy = rm.y + Math.floor(r() * rm.h), ti = idx(fx, fy); if (SOLID[tiles[ti]] || tiles[ti] === G.FIRE || tiles[ti] === G.WATER || dist[ti] < 0) continue; if (avoid.some(function (p) { return Math.abs(p.x - fx) < 2 && Math.abs(p.y - fy) < 2; })) continue; return { x: fx, y: fy }; } return { x: rm.cx, y: rm.cy }; }
    var used = [spawn], lairs = [], byLevel = { BEG: [], PRG: [], MAS: [] };
    L.creatures.forEach(function (c) { byLevel[c.level].push(c); });
    function put(c, rm, n) { var p = freeIn(rm, used); p.kind = 'creature'; p.ref = c; p.n = n; used.push(p); lairs.push(p); }
    // the long safe way: Beginning creatures first, Progressing later; the Crossing is guarded; the short dangerous way is Mastery
    byLevel.BEG.forEach(function (c, k) { put(c, safe[0], 0); put(c, safe[1], 1); put(c, k === 0 ? loops[0] : safe[2], 2); });
    byLevel.PRG.forEach(function (c, k) { put(c, safe[3], 0); put(c, k === 0 ? safe[4] : loops[1], 1); put(c, k === 0 ? cross : ante, 2); });
    byLevel.MAS.forEach(function (c, k) { put(c, danger[k === 0 ? 0 : 1], 0); put(c, k === 0 ? danger[2] : loops[2], 1); });
    // key, chests, pages: lane ends first, then clearings
    var keyP = keyEnd ? { x: keyEnd.x, y: keyEnd.y, kind: 'key' } : (function () { var p = freeIn(danger[2], used); return { x: p.x, y: p.y, kind: 'key' }; })(); used.push(keyP);
    var ends = lanes.filter(function (e) { return e !== keyEnd; }).sort(function () { return r() - 0.5; });
    var fill = safe.concat(danger, loops, [cross]);
    var chests = [], pages = [];
    for (i = 0; i < 9; i++) { var cp = ends.length ? ends.shift() : freeIn(fill[Math.floor(r() * fill.length)], used); cp = { x: cp.x, y: cp.y, kind: 'chest', n: i }; used.push(cp); chests.push(cp); }
    for (i = 0; i < 5; i++) { var pp = ends.length ? ends.shift() : freeIn(fill[(i * 3 + 1) % fill.length], used); pp = { x: pp.x, y: pp.y, kind: 'page', n: i }; used.push(pp); pages.push(pp); }
    return { v2: true, w: W, h: H, tiles: tiles, spawn: spawn, lairs: lairs, gate: gate, boss: bossP, key: keyP, chests: chests, pages: pages, theme: th, rooms: rooms, dist: dist, lanes: lanes };
  }

  /* ---------- sprites (filled in by Overworld.useSprites once a sheet is loaded) ---------- */
  var SP = { ready: false, img: null, defs: {} };
  function useSprites(img, defs) { SP.img = img; SP.defs = defs; SP.ready = !!img; }

  /* ---------- runtime ---------- */
  var R = null; // current run: { L, S, map, cv, ctx, scale, vw, vh, player, ents, keys, raf, ... }
  function worldState(S, L) { S.world = S.world || {}; var w = S.world[L.id]; if (!w) { w = S.world[L.id] = { seen: '', chests: [], pages: [], key: false, pos: null, dead: [] }; } return w; }
  var seenCache = {}; // land id -> Uint8Array (kept out of the saved state; the state holds a packed bitset)
  function seenArr(w, id) {
    var a = seenCache[id]; if (a && a.length === MW * MH) return a;
    a = seenCache[id] = new Uint8Array(MW * MH);
    if (w.seen) { try { var s = atob(w.seen); for (var i = 0; i < a.length; i++) a[i] = (s.charCodeAt(i >> 3) >> (i & 7)) & 1; } catch (e) {} }
    return a;
  }
  function packSeen(w, id) { var a = seenArr(w, id), bytes = new Array(Math.ceil(a.length / 8)).fill(0); for (var i = 0; i < a.length; i++) if (a[i]) bytes[i >> 3] |= 1 << (i & 7); w.seen = btoa(String.fromCharCode.apply(null, bytes)); }

  function mount(container, opts) {
    unmount();
    var L = opts.land, S = opts.state, map = generate(L); MW = map.w; MH = map.h; API.MW = MW; API.MH = MH;
    var w = worldState(S, L);
    if (map.layout && w.layout !== map.layout) { // the land was redrawn: old fog, position and corpses no longer fit it
      w.layout = map.layout; w.seen = ''; w.pos = null; w.dead = []; w.deadAt = {}; w.fightAt = null; delete seenCache[L.id];
    }
    var seen = seenArr(w, L.id);
    var cv = document.createElement('canvas'); cv.className = 'ow-canvas'; cv.tabIndex = 0;
    var wrap = document.createElement('div'); wrap.className = 'ow-wrap'; wrap.appendChild(cv);
    var hint = document.createElement('div'); hint.className = 'ow-hint'; wrap.appendChild(hint);
    if (opts.title) { // spawn splash: banner art + land name, then it fades and the world is revealed
      var tt = document.createElement('div'); tt.className = 'ow-title' + (opts.title.img ? ' art' : '');
      tt.innerHTML = (opts.title.img ? '<div class="ow-title-img" style="background-image:url(' + opts.title.img + ')"></div>' : '') + '<div class="ow-title-text"><div class="eyebrow">' + opts.title.sub + '</div><h1>' + opts.title.name + '</h1>' + (opts.title.line ? '<p>' + opts.title.line + '</p>' : '') + '</div>';
      wrap.appendChild(tt);
      var hold = opts.title.img ? 3200 : 2600;
      setTimeout(function () { tt.classList.add('gone'); if (R) R.frozen = false; }, hold); setTimeout(function () { if (tt.parentNode) tt.parentNode.removeChild(tt); }, hold + 1100);
    }
    if (opts.fullscreen) wrap.classList.add('full');
    var stick = document.createElement('div'); stick.className = 'ow-stick'; stick.innerHTML = '<div class="ow-stick-knob"></div>'; wrap.appendChild(stick);
    var act = document.createElement('button'); act.type = 'button'; act.className = 'ow-act'; act.textContent = '⚔'; wrap.appendChild(act);
    container.appendChild(wrap);
    var ret = opts.returnFrom || null, fireAt = { x: (map.spawn.x + 1) * T + T / 2 + 6, y: map.spawn.y * T + T / 2 + 2 };
    if (ret && map.v2) {
      if (ret.outcome === 'won' && ret.inst != null && ret.inst >= 0 && !ret.isBoss) { var dk = ret.ref.id + '#' + ret.inst; if (w.dead.indexOf(dk) < 0) w.dead.push(dk); w.deadAt = w.deadAt || {}; if (w.fightAt && w.fightAt.key === dk) w.deadAt[dk] = { x: w.fightAt.x, y: w.fightAt.y }; }
      if (ret.outcome === 'won' && ret.isBoss) w.bossDead = true; // the boss lies where it fell until the hero next rests
      if (ret.outcome === 'died') { w.dead = []; w.deadAt = {}; w.bossDead = false; w.pos = fireAt; }
    }
    var start = w.pos || fireAt;
    if (w.pos) { var stx = Math.floor(w.pos.x / T), sty = Math.floor(w.pos.y / T); if (stx < 0 || sty < 0 || stx >= MW || sty >= MH || SOLID[map.tiles[sty * MW + stx]] || map.tiles[sty * MW + stx] === G.FIRE) start = fireAt; }
    // a boss has just fallen: a fire kindles in its room, so the hero need not walk the whole land back to rest.
    // It lasts until the hero next rests at a bonfire (the camp screen clears it: game.js).
    var well = opts.well ? wellSpot(map) : null; // the duelling well: beside the land's bonfire once its boss has fallen
    var kindled = false;
    if (w.campfire && !walkable(map, w.campfire.x, w.campfire.y)) delete w.campfire;
    if (ret && ret.isBoss && ret.outcome === 'won' && !w.campfire) { var cf = campSpot(map, start, well); if (cf) { w.campfire = cf; kindled = true; } }
    var vista = !!(map.theme && map.theme.name === 'throne'); if (vista) for (var si = 0; si < seen.length; si++) seen[si] = 1; // the processional is in view from the first step
    var braz = {}, brazOK = !!(SP.actor && SP.actor('cr:brazier')); if (brazOK) (map.braziers || []).forEach(function (b) { braz[b.y * map.w + b.x] = 1; });
    (map.props || []).forEach(function (q) { if (!q.flat) braz[q.y * map.w + q.x] = 1; }); // tall scenery is solid
    if (w.campfire) braz[w.campfire.y * map.w + w.campfire.x] = 1;
    if (well) braz[well.y * map.w + well.x] = 1;
    R = { well: well, vista: vista, braz: braz, brazOK: brazOK, container: container, L: L, S: S, w: w, map: map, seen: seen, cv: cv, ctx: cv.getContext('2d'), wrap: wrap, hint: hint, stick: stick, act: act, opts: opts,
      player: { x: start.x, y: start.y, vx: 0, vy: 0, dir: 1, moving: false, anim: 0, clock: 0, act: null }, keys: {}, stickVec: null, t: 0, last: 0, raf: 0, near: null, toast: null, toastT: 0, frozen: false };
    R.ctx.imageSmoothingEnabled = false;
    R.ents = buildEntities(map, S, L, w); R.contactCool = 1.5;
    if (ret && map.v2 && ret.outcome === 'won' && ret.inst != null) { var jk = ret.ref.id + '#' + ret.inst; R.ents.forEach(function (e) { if (e.kind === 'corpse' && e.key === jk) { e.dieT0 = 0.15; var fa = w.fightAt; e.dir = fa && start.x < e.x ? -1 : 1; } }); }
    if (ret && map.v2 && ret.outcome === 'won' && ret.isBoss) R.ents.forEach(function (e) { if (e.kind === 'corpse' && e.boss) e.dieT0 = 0.15; }); // the boss's death plays as you come back
    if (ret && map.v2 && ret.outcome !== 'died' && ret.inst != null) { R.ents.forEach(function (e) { if (e.kind === 'creature' && e.ref.id === ret.ref.id && e.n === ret.inst) { e.stun = 3; e.state = 'idle'; } }); }
    if (ret && map.v2 && ret.outcome === 'died' && !opts.title) say('You wake at the bonfire. The dead have risen again.');
    var wellNews = !!(well && !w.wellSeen); if (wellNews) w.wellSeen = true; // the first time the well is there, say so
    if (kindled) { say('A fire kindles where the boss fell. Rest at it to return to the bonfire.'); persist(); }
    if (wellNews) { var wr = R; if (!kindled && !opts.title) say('A Duelling Well has risen beside the bonfire.'); else setTimeout(function () { if (R === wr) say('A Duelling Well has risen beside the bonfire.'); }, 3700); persist(); }
    if (opts.title) R.frozen = true; // hold still while the splash shows
    layout(); window.addEventListener('resize', layout);
    bindInput();
    reveal(); R.last = performance.now(); R.raf = requestAnimationFrame(frame);
    setTimeout(function () { try { cv.focus({ preventScroll: true }); } catch (e) {} }, 30);
    return wrap;
  }
  function walkable(map, x, y) { if (x < 1 || y < 1 || x >= map.w - 1 || y >= map.h - 1) return false; var t = map.tiles[y * map.w + x]; return !SOLID[t] && t !== G.GATE && t !== G.FIRE; }
  function wellSpot(map) { // an open tile 2-4 steps from the land's bonfire, clear of the hero's waking spot and of anything else on the map
    var fx = map.spawn.x, fy = map.spawn.y, ax = fx + 1, ay = fy, best = null, bestD = 1e9, taken = {};
    (map.props || []).concat(map.braziers || [], map.lairs || [], map.chests || [], map.pages || [], map.key ? [map.key] : []).forEach(function (q) { taken[q.y * map.w + q.x] = 1; });
    for (var y = fy - 4; y <= fy + 4; y++) for (var x = fx - 4; x <= fx + 4; x++) {
      var cheb = Math.max(Math.abs(x - fx), Math.abs(y - fy)); if (cheb < 2 || taken[y * map.w + x] || !walkable(map, x, y)) continue;
      if (Math.max(Math.abs(x - ax), Math.abs(y - ay)) < 2) continue; // not on top of where the hero wakes
      var open = true; for (var oy = -1; oy <= 1 && open; oy++) for (var ox = -1; ox <= 1; ox++) if (!walkable(map, x + ox, y + oy) || taken[(y + oy) * map.w + x + ox]) { open = false; break; }
      if (!open) continue;
      var d = Math.hypot(x - fx, y - fy) + (x > fx ? 0.4 : 0) + (Math.abs(x - fx) <= 1 && y < fy ? 1.5 : 0) /* beside the fire, not behind its tall flames */ + 0.01 * (x + y * 0.5); if (d < bestD) { bestD = d; best = { x: x, y: y }; }
    }
    return best;
  }
  function campSpot(map, start, well) { // an open tile 2-3 steps from the boss, all eight neighbours walkable, close to where the hero stands
    var bx = map.boss.x, by = map.boss.y, sx = Math.floor(start.x / T), sy = Math.floor(start.y / T), best = null, bestD = 1e9, taken = {};
    (map.props || []).concat(map.braziers || []).forEach(function (q) { taken[q.y * map.w + q.x] = 1; });
    (map.lairs || []).forEach(function (q) { taken[q.y * map.w + q.x] = 1; });
    if (well) for (var wy = -1; wy <= 1; wy++) for (var wx = -1; wx <= 1; wx++) taken[(well.y + wy) * map.w + well.x + wx] = 1;
    for (var y = by - 3; y <= by + 3; y++) for (var x = bx - 3; x <= bx + 3; x++) {
      var cheb = Math.max(Math.abs(x - bx), Math.abs(y - by)); if (cheb < 2 || taken[y * map.w + x] || !walkable(map, x, y)) continue;
      var open = true; for (var oy = -1; oy <= 1 && open; oy++) for (var ox = -1; ox <= 1; ox++) if (!walkable(map, x + ox, y + oy)) { open = false; break; }
      if (!open) continue;
      var d = Math.hypot(x - sx, y - sy); if (d < 1.5) continue; d += cheb * 0.3;
      if (d < bestD) { bestD = d; best = { x: x, y: y }; }
    }
    return best;
  }
  function unmount() {
    if (!R) return; cancelAnimationFrame(R.raf); window.removeEventListener('resize', layout); window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp);
    persist(); if (R.wrap.parentNode) R.wrap.parentNode.removeChild(R.wrap); R = null;
  }
  function persist() { if (!R) return; R.w.pos = { x: R.player.x, y: R.player.y }; packSeen(R.w, R.L.id); if (R.opts.onSave) R.opts.onSave(); }

  function buildEntities(map, S, L, w) {
    var ents = [];
    w.dead = w.dead || [];
    map.lairs.forEach(function (p, k) {
      var key = p.ref.id + '#' + (p.n || 0), base = { ref: p.ref, key: key, n: p.n || 0, x: p.x * T + T / 2, y: p.y * T + T / 2, hx: p.x, hy: p.y, dir: 1, anim: Math.random() * 10, clock: Math.random() * 3, level: p.ref.level };
      if (map.v2 && w.dead.indexOf(key) >= 0) { base.kind = 'corpse'; var at = w.deadAt && w.deadAt[key]; if (at) { base.x = at.x; base.y = at.y; } ents.push(base); return; }
      base.kind = 'creature'; base.wander = 0; base.state = 'idle'; base.lost = 0; base.stun = 0; ents.push(base);
    });
    if (map.v2 && w.bossDead) ents.push({ kind: 'corpse', boss: true, key: 'boss', ref: map.boss.ref, x: map.boss.x * T + T / 2, y: map.boss.y * T + T / 2, dir: -1, anim: 0 });
    else ents.push({ kind: 'boss', ref: map.boss.ref, x: map.boss.x * T + T / 2, y: map.boss.y * T + T / 2, dir: -1, anim: 0 });
    if (!w.key && map.key) ents.push({ kind: 'key', x: map.key.x * T + T / 2, y: map.key.y * T + T / 2, anim: 0 });
    map.chests.forEach(function (c) { if (w.chests.indexOf(c.n) < 0) ents.push({ kind: 'chest', n: c.n, x: c.x * T + T / 2, y: c.y * T + T / 2, anim: 0 }); });
    map.pages.forEach(function (c) { if (w.pages.indexOf(c.n) < 0) ents.push({ kind: 'page', n: c.n, x: c.x * T + T / 2, y: c.y * T + T / 2, anim: 0 }); });
    return ents;
  }

  function layout() {
    if (!R) return;
    var cw, ch, scale, vw, vh;
    if (R.opts.fullscreen) {
      var hud = document.getElementById('hud'), top = hud && !hud.hidden ? hud.getBoundingClientRect().bottom : 0;
      cw = window.innerWidth; ch = window.innerHeight - top; R.wrap.style.top = top + 'px';
      scale = cw >= 2200 ? 4 : cw >= 1000 ? 3 : 2;
      vw = Math.max(10, Math.floor(cw / (T * scale))); vh = Math.max(8, Math.floor(ch / (T * scale)));
    } else {
      cw = (R.container && R.container.clientWidth ? R.container.clientWidth - 22 : 0) || 800; scale = cw >= 1240 ? 3 : 2;
      vw = Math.min(26, Math.floor(cw / (T * scale))); vh = Math.max(9, Math.min(15, Math.round(vw * 0.6)));
    }
    var dpr = Math.min(GFX.level >= 1 ? 1 : 2, window.devicePixelRatio || 1); // slow devices draw at 1x (see GFX)
    R.scale = scale; R.vw = vw; R.vh = vh; R.dpr = dpr; R.k = scale * dpr; R.lw = vw * T; R.lh = vh * T;
    // backing store at device resolution: the world is drawn through an integer-ish transform (nearest-neighbour, so pixel art stays crisp)
    // while text is drawn at full resolution instead of being blown up with the pixels
    R.cv.width = Math.round(vw * T * R.k); R.cv.height = Math.round(vh * T * R.k); R.cv.style.width = (vw * T * scale) + 'px'; R.cv.style.height = (vh * T * scale) + 'px';
    R.ctx.imageSmoothingEnabled = false;
    R.chunks = {}; R.dark = null; // caches depend on the size and resolution
    SP.q = GFX.level >= 2 ? 'low' : GFX.level >= 1 ? 'medium' : 'high';
  }
  /* Graphics level, chosen by watching the frame rate: 0 = sharp (up to 2x pixels), 1 = 1x pixels, 2 = 1x pixels and
   * cheaper image smoothing. A device that drops to a level starts there next time (localStorage lorebound:gfx). */
  var GFX = { level: 0, ft: [], checked: 0 };
  try { GFX.level = Math.max(0, Math.min(2, Number(localStorage.getItem('unbound:gfx')) || 0)); } catch (e) {}
  function gfxWatch(dtMs) {
    if (!R || R.frozen || document.visibilityState !== 'visible') return;
    if (!GFX.ft.length) GFX.t0 = performance.now(); GFX.ft.push(dtMs); if (GFX.ft.length < 90 && !(GFX.ft.length >= 6 && performance.now() - GFX.t0 > 2500)) return;
    var a = GFX.ft.slice().sort(function (x, y) { return x - y; }), med = a[a.length >> 1]; GFX.ft = [];
    if (med > 26 && GFX.level < 2) { GFX.level++; try { localStorage.setItem('unbound:gfx', GFX.level); } catch (e) {} layout(); }
  }

  /* ---------- terrain cache ----------
   * The ground does not change between frames, so it is painted once per 8x8-tile chunk into its own canvas (with the
   * contact shadows) and each frame just copies the visible chunks. Water, the bonfire and the gate are drawn live.
   * A chunk is repainted when fog lifts inside it. */
  var CH = 8, LIVE = {}; LIVE[4] = 1; LIVE[6] = 1; LIVE[7] = 1; LIVE[8] = 1;
  function chunkK() { return R.k; } // drawn 1:1, so copying a chunk never resamples
  function buildChunk(cx, cy) {
    var k = chunkK(), c = R.chunks[cx + ',' + cy]; if (!c) { c = R.chunks[cx + ',' + cy] = { cv: document.createElement('canvas') }; c.cv.width = c.cv.height = Math.ceil(CH * T * k); }
    var g = c.cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.cv.width, c.cv.height); g.setTransform(k, 0, 0, k, 0, 0); g.imageSmoothingEnabled = false;
    var th = R.map.theme, x0 = cx * CH, y0 = cy * CH; SP.tileK = Number.isInteger(k) ? k : 0;
    for (var y = y0; y < Math.min(MH, y0 + CH); y++) for (var x = x0; x < Math.min(MW, x0 + CH); x++) { var i = y * MW + x; if (!R.seen[i] || LIVE[R.map.tiles[i]]) continue; drawTile(g, x, y, R.map.tiles[i], (x - x0) * T, (y - y0) * T, th); }
    if (SP.contactShadows) SP.contactShadows(g, R.map.tiles, R.seen, x0, y0, Math.min(MW, x0 + CH) - 1, Math.min(MH, y0 + CH) - 1, x0 * T, y0 * T);
    c.dirty = false; c.k = k; c.used = R.t;
    var keys = Object.keys(R.chunks), cap = (Math.ceil(R.vw / CH) + 3) * (Math.ceil(R.vh / CH) + 3); if (keys.length > cap) { keys.sort(function (a, b) { return R.chunks[a].used - R.chunks[b].used; }); keys.slice(0, keys.length - cap).forEach(function (key) { delete R.chunks[key]; }); }
    return c;
  }
  function seenChanged(x, y) { R.seenVer = (R.seenVer || 0) + 1; var c = R.chunks && R.chunks[Math.floor(x / CH) + ',' + Math.floor(y / CH)]; if (c) c.dirty = true; }
  function darkLayer() { // the night around the hero (soft vignette + far fog) as a small sprite drawn 1:1 on the hero; beyond it the dark is even
    if (R.dark && R.dark.k === R.k) return R.dark;
    var r = T * 7.6, k = R.k, n = Math.ceil(r * 2 * k), c = document.createElement('canvas'); c.width = c.height = n;
    var g = c.getContext('2d'), m = n / 2, gr = g.createRadialGradient(m, m, T * 2 * k, m, m, T * 7.5 * k);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, n, n);
    if (!R.vista) { var g2 = g.createRadialGradient(m, m, T * 6.6 * k, m, m, T * 7.4 * k); g2.addColorStop(0, 'rgba(0,0,0,0)'); g2.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = g2; g.fillRect(0, 0, n, n); }
    return (R.dark = { cv: c, n: n, k: k, out: R.vista ? 'rgba(0,0,0,.55)' : 'rgba(0,0,0,.7525)' }); // .7525 = .55 and .45 stacked
  }
  function drawDark(ctx, hx, hy) {
    var d = darkLayer(), W = R.cv.width, H = R.cv.height, x = Math.round(hx * R.k - d.n / 2), y = Math.round(hy * R.k - d.n / 2);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(d.cv, x, y); ctx.fillStyle = d.out;
    if (y > 0) ctx.fillRect(0, 0, W, y); if (y + d.n < H) ctx.fillRect(0, y + d.n, W, H - y - d.n);
    var y0 = Math.max(0, y), y1 = Math.min(H, y + d.n); if (x > 0) ctx.fillRect(0, y0, x, y1 - y0); if (x + d.n < W) ctx.fillRect(x + d.n, y0, W - x - d.n, y1 - y0);
    ctx.restore();
  }
  function minimapImage() { // explored tiles, redrawn only when more of the land is seen
    if (R.mm && R.mm.ver === R.seenVer) return R.mm.cv;
    var c = (R.mm && R.mm.cv) || document.createElement('canvas'); c.width = MW; c.height = MH; var g = c.getContext('2d'), th = R.map.theme, img = g.createImageData(MW, MH), d = img.data;
    var COL = {}; function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
    COL.wall = rgb('#3a3a3a'); COL.water = rgb(th.lava ? '#a0401a' : '#1f3550'); COL.path = rgb('#6a5a40'); COL.gate = rgb('#d6a860'); COL.ground = rgb('#4a5a44');
    for (var i = 0; i < MW * MH; i++) { if (!R.seen[i]) continue; var tt = R.map.tiles[i], col = tt === G.WALL || tt === G.EDGE ? COL.wall : tt === G.WATER ? COL.water : tt === G.PATH ? COL.path : tt === G.GATE ? COL.gate : COL.ground; d[i * 4] = col[0]; d[i * 4 + 1] = col[1]; d[i * 4 + 2] = col[2]; d[i * 4 + 3] = 255; }
    g.putImageData(img, 0, 0); R.mm = { cv: c, ver: R.seenVer }; return c;
  }

  /* ---------- input ---------- */
  var KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
  function onKey(e) {
    if (!R || R.frozen) return; var tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    var k = KEYMAP[e.code]; if (k) { R.keys[k] = true; e.preventDefault(); return; }
    if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); interact(); }
  }
  function onKeyUp(e) { if (!R) return; var k = KEYMAP[e.code]; if (k) R.keys[k] = false; }
  function bindInput() {
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
    R.act.onclick = function () { interact(); };
    var st = R.stick, knob = st.firstChild, active = false, cx = 0, cy = 0;
    function setVec(x, y) { var dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy), m = 34; if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; R.stickVec = d < 6 ? null : { x: dx / m, y: dy / m }; }
    st.addEventListener('touchstart', function (e) { var t = e.changedTouches[0], b = st.getBoundingClientRect(); cx = b.left + b.width / 2; cy = b.top + b.height / 2; active = true; setVec(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    st.addEventListener('touchmove', function (e) { if (!active) return; var t = e.changedTouches[0]; setVec(t.clientX, t.clientY); e.preventDefault(); }, { passive: false });
    var end = function (e) { active = false; R.stickVec = null; knob.style.transform = ''; if (e) e.preventDefault(); };
    st.addEventListener('touchend', end, { passive: false }); st.addEventListener('touchcancel', end, { passive: false });
    R.cv.addEventListener('click', function () { try { R.cv.focus({ preventScroll: true }); } catch (e) {} });
  }

  /* ---------- simulation ---------- */
  function solidAt(px, py) { var tx = Math.floor(px / T), ty = Math.floor(py / T); if (tx < 0 || ty < 0 || tx >= MW || ty >= MH) return true; var t = R.map.tiles[ty * MW + tx]; if (R.braz[ty * MW + tx]) return true; if (t === G.GATE) return !gateOpen(); if (t === G.FIRE) return true; return !!SOLID[t]; }
  function blocked(x, y) { // feet hitbox 10x6 around (x, y+4)
    return solidAt(x - 5, y + 1) || solidAt(x + 5, y + 1) || solidAt(x - 5, y + 7) || solidAt(x + 5, y + 7);
  }
  function gateOpen() { return !!((R.w.key || !R.map.key) && R.opts.bossOpen && R.opts.bossOpen()); } // a land with no key (the final land) has an open gate
  function frame(now) {
    if (!R) return;
    var raw = now - R.last, dt = Math.max(0, Math.min(50, raw)) / 1000; R.last = now; R.t += dt; if (R.t > 4) gfxWatch(raw);
    if (!R.frozen) step(dt);
    if (!R) return;
    draw();
    R.raf = requestAnimationFrame(frame);
  }
  function step(dt) {
    var p = R.player, dx = 0, dy = 0, k = R.keys;
    if (k.left) dx -= 1; if (k.right) dx += 1; if (k.up) dy -= 1; if (k.down) dy += 1;
    if (R.stickVec) { dx = R.stickVec.x; dy = R.stickVec.y; }
    var d = Math.hypot(dx, dy); if (d > 1) { dx /= d; dy /= d; }
    p.clock += dt;
    if (R.cut) { R.cut.t -= dt; if (R.cut.t <= 0) { var cf = R.cut.fn; R.cut = null; cf(); } return; } // a short attack before a fight
    if (p.act && p.act.free) { if (R.t >= p.act.end) p.act = null; else { dx = 0; dy = 0; d = 0; } }
    var speed = R.opts.heroSpeed || 58; p.moving = d > 0.05;
    if (p.moving) {
      if (Math.abs(dx) > 0.2) p.dir = dx < 0 ? -1 : 1;
      var nx = p.x + dx * speed * dt, ny = p.y + dy * speed * dt;
      if (!blocked(nx, p.y)) p.x = nx; if (!blocked(p.x, ny)) p.y = ny;
      p.anim += dt * 8; if (window.Sfx) Sfx.play('step');
    } else p.anim += dt * 4;
    if (Math.floor(p.x / T) !== p.tx || Math.floor(p.y / T) !== p.ty) { p.tx = Math.floor(p.x / T); p.ty = Math.floor(p.y / T); reveal(); }
    // creatures: wander, see, chase (slower than the hero), give up
    if (R.contactCool > 0) R.contactCool -= dt;
    R.ents.forEach(function (e) {
      if (!R) return; // a contact fight unmounted the world mid-loop
      e.anim += dt * 6; e.clock = (e.clock || 0) + dt;
      if (e.kind !== 'creature') return;
      if (R.map.v2) {
        if (e.stun > 0) { e.stun -= dt; return; }
        if (e.blind > 0) e.blind -= dt; if (e.alert > 0) e.alert -= dt;
        var pdx = p.x - e.x, pdy = p.y - e.y, pd = Math.hypot(pdx, pdy), nearFire = Math.hypot(p.x - (R.map.spawn.x * T + T / 2), p.y - (R.map.spawn.y * T + T / 2)) < 6 * T;
        var sees = !e.ref.asleep && !nearFire && !(e.blind > 0) && ((pd < (R.opts.sightTiles || 6.5) * T && lineOfSight(e.x, e.y, p.x, p.y)) || e.alert > 0);
        if (sees) { if (e.state !== 'chase' && window.Sfx) Sfx.play('alert'); e.state = 'chase'; e.lost = 0; } else if (e.state === 'chase') { e.lost += dt; if (e.lost > (R.opts.loseAfter || 2.5)) { e.state = 'home'; } }
        if (e.state === 'chase') {
          if (pd < 11 && R.contactCool <= 0 && !(p.act && p.act.free)) { /* a hero mid-swing is not ambushed: the swing lands instead (below) */ R.contactCool = 2; R.w.fightAt = { key: e.key, x: e.x, y: e.y }; persist(); e.dir = pdx < 0 ? -1 : 1; p.dir = -e.dir; cutscene(e, 'creature', function () { if (R && R.opts.onBattle) R.opts.onBattle(e.ref, false, e.n, 'creature'); }); return; }
          var cs = (e.level === 'MAS' ? 46 : e.level === 'PRG' ? 44 : 40) * dt, mx = e.x + pdx / (pd || 1) * cs, my = e.y + pdy / (pd || 1) * cs;
          if (!blocked(mx, e.y)) e.x = mx; if (!blocked(e.x, my)) e.y = my; e.dir = pdx < 0 ? -1 : 1; e.moving = true; return;
        }
        if (e.state === 'home') { var hx = e.hx * T + T / 2, hy = e.hy * T + T / 2, hdx = hx - e.x, hdy = hy - e.y, hd = Math.hypot(hdx, hdy); if (hd < 2) { e.state = 'idle'; } else { var hs = 30 * dt; var nx3 = e.x + hdx / hd * hs, ny3 = e.y + hdy / hd * hs; if (!blocked(nx3, e.y)) e.x = nx3; if (!blocked(e.x, ny3)) e.y = ny3; e.dir = hdx < 0 ? -1 : 1; e.moving = true; return; } }
        e.moving = false;
        if (e.ref.asleep) return; // the tutorial's sleeper stays put until struck
      }
      e.wander -= dt;
      if (e.wander <= 0) { e.wander = 1.5 + Math.random() * 3; var ang = Math.random() * Math.PI * 2, dist = Math.random() * 1.6 * T; e.tx = e.hx * T + T / 2 + Math.cos(ang) * dist; e.ty = e.hy * T + T / 2 + Math.sin(ang) * dist; }
      if (e.tx != null) { var ex = e.tx - e.x, ey = e.ty - e.y, ed = Math.hypot(ex, ey); if (ed > 1) { var sp = 14 * dt; var nx2 = e.x + ex / ed * sp, ny2 = e.y + ey / ed * sp; if (!blocked(nx2, ny2)) { e.x = nx2; e.y = ny2; e.dir = ex < 0 ? -1 : 1; } else e.tx = null; } }
    });
    if (!R) return;
    // pickups and proximity
    R.near = null;
    for (var i = R.ents.length - 1; i >= 0; i--) {
      var e = R.ents[i], dd = Math.hypot(e.x - p.x, e.y - p.y);
      if (e.kind === 'key' && dd < 10) { R.w.key = true; R.ents.splice(i, 1); if (window.Sfx) Sfx.play('pickup'); say('You found the Gate Key. The boss door will open once every creature here has been slain.'); persist(); continue; }
      if (e.kind === 'page' && dd < 10) { R.w.pages.push(e.n); R.ents.splice(i, 1); persist(); if (R.opts.onPage) R.opts.onPage(e.n); if (!R) return; continue; }
      if (e.kind === 'chest' && dd < 12) { R.w.chests.push(e.n); R.ents.splice(i, 1); persist(); var msg = R.opts.onChest ? R.opts.onChest(e.n) : null; if (!R) return; if (msg) say(msg); continue; }
      if ((e.kind === 'creature' || e.kind === 'boss') && dd < REACH && (!R.near || dd < R.near.d)) R.near = { e: e, d: dd };
    }
    // a swing that was a moment early still lands: if a creature comes into reach while the blade is moving, it is a first strike
    if (p.act && p.act.free && !R.cut) { var hit = null; R.ents.forEach(function (e) { if (e.kind === 'creature') { var hd = Math.hypot(e.x - p.x, e.y - p.y); if (hd < REACH && (!hit || hd < hit.d)) hit = { e: e, d: hd }; } });
      if (hit) { p.act = null; R.near = hit; interact(); return; } }
    var gx = R.map.gate.x * T + T / 2, gy = R.map.gate.y * T + T / 2;
    if (!R.near && Math.hypot(gx - p.x, gy - p.y) < 20 && !gateOpen()) R.near = { gate: true, d: 0 };
    var fx = R.map.spawn.x * T + T / 2, fy = R.map.spawn.y * T + T / 2;
    if (!R.near && Math.hypot(fx - p.x, fy - p.y) < 18) R.near = { fire: true, d: 0 };
    if (!R.near && R.well && Math.hypot(R.well.x * T + T / 2 - p.x, R.well.y * T + T / 2 - p.y) < 22) R.near = { well: true, d: 0 };
    var cf = R.w.campfire; if (!R.near && cf && Math.hypot(cf.x * T + T / 2 - p.x, cf.y * T + T / 2 - p.y) < 20) R.near = { fire: true, temp: true, d: 0 };
    updateHint();
    if (R.toastT > 0) R.toastT -= dt;
  }
  function say(msg) { R.toast = msg; R.toastT = 3.5; }
  function updateHint() {
    var h = '';
    if (R.near && R.near.e) { var e = R.near.e; h = e.kind === 'boss' ? 'Challenge <b>' + e.ref.name + '</b> — <kbd>E</kbd> or ⚔' : 'Strike <b>' + e.ref.name + '</b> (' + e.ref.level + ') first: +20 s — <kbd>E</kbd> or ⚔'; }
    else if (R.near && R.near.gate) h = R.w.key ? 'The gate is sealed until every creature in this land has been slain.' : 'A sealed gate. It needs a key — search the land.';
    else if (R.near && R.near.well) h = 'Look into the <b>Duelling Well</b> — <kbd>E</kbd> or ⚔';
    else if (R.near && R.near.temp) h = 'Rest at the <b>boss-room fire</b>. It burns out once you rest — <kbd>E</kbd> or ⚔';
    else if (R.near && R.near.fire) h = 'Rest at the <b>bonfire</b> — <kbd>E</kbd> or ⚔';
    if (h !== R.hintHtml) { R.hintHtml = h; R.hint.innerHTML = h; R.hint.style.opacity = h ? 1 : 0; }
    R.act.classList.toggle('on', !!(R.near && (R.near.e || R.near.fire || R.near.well)));
  }
  function interact() {
    if (!R) return;
    if (R.near && R.near.well) { persist(); if (R.opts.onWell) R.opts.onWell(); return; }
    if (!R.near || (!R.near.e && !R.near.fire)) { swing(); return; }
    if (R.near.fire) { persist(); if (R.opts.onBonfire) R.opts.onBonfire(R.near.temp ? { temp: true } : undefined); return; }
    if (!R.near.e) return;
    var e = R.near.e; persist();
    if (R.cut) return;
    R.player.dir = e.x < R.player.x ? -1 : 1; if (e.kind === 'creature') { e.dir = -R.player.dir; e.state = 'idle'; e.tx = null; }
    if (e.kind === 'boss') cutscene(e, 'hero', function () { if (R && R.opts.onBattle) R.opts.onBattle(e.ref, true); });
    else { R.w.fightAt = { key: e.key, x: e.x, y: e.y }; persist(); cutscene(e, 'hero', function () { if (R && R.opts.onBattle) R.opts.onBattle(e.ref, false, e.n, 'hero'); }); }
  }
  /* a swing at nothing: purely for the feel of it. The hero plants their feet for the length of the attack. */
  function swing() {
    var p = R.player; if (R.cut || (p.act && p.act.free)) return;
    var d = SP.actor && SP.actor(SP.actorFor({ kind: 'hero', cls: R.opts.heroClass, stage: R.opts.heroStage })), len = d ? SP.animLength(d, 'attack') : 0;
    if (!len) return;
    p.act = { anim: 'attack', t0: R.t, free: true, end: R.t + len };
    if (window.Sfx) Sfx.play('swing');
  }
  /* the opening blow: whoever started the fight plays its attack, then the battle screen takes over */
  function cutscene(e, who, fn) {
    var p = R.player, d = SP.actor && SP.actor(who === 'hero' ? SP.actorFor({ kind: 'hero', cls: R.opts.heroClass, stage: R.opts.heroStage }) : SP.actorFor(e));
    var len = d ? Math.min(0.75, SP.animLength(d, 'attack')) : 0;
    if (!len) { fn(); return; }
    if (who === 'hero') p.act = { anim: 'attack', t0: R.t }; else e.act = { anim: 'attack', t0: R.t };
    if (window.Sfx) Sfx.play('strike');
    R.keys = {}; R.stickVec = null; R.cut = { t: len, fn: function () { p.act = null; e.act = null; fn(); } };
  }
  function lineOfSight(x0, y0, x1, y1) { // tile-stepping ray; blocked by solid tiles
    var steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 6), last = -1;
    for (var i = 1; i < steps; i++) { var t = i / steps, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t, ti = Math.floor(py / T) * MW + Math.floor(px / T); if (ti === last) continue; last = ti; var tt = R.map.tiles[ti]; if (SOLID[tt] || tt === G.GATE) return false; }
    return true;
  }
  function reveal() {
    var p = R.player, tx = Math.floor(p.x / T), ty = Math.floor(p.y / T), rad = 6;
    for (var y = ty - rad; y <= ty + rad; y++) for (var x = tx - rad; x <= tx + rad; x++) if (x >= 0 && y >= 0 && x < MW && y < MH && (x - tx) * (x - tx) + (y - ty) * (y - ty) <= rad * rad + 1 && !R.seen[y * MW + x]) { R.seen[y * MW + x] = 1; seenChanged(x, y); }
  }

  /* ---------- drawing ---------- */
  function draw() {
    var ctx = R.ctx, p = R.player, th = R.map.theme, cvw = R.lw, cvh = R.lh;
    ctx.setTransform(R.k, 0, 0, R.k, 0, 0); ctx.imageSmoothingEnabled = false;
    var camx = Math.round(Math.max(0, Math.min(MW * T - cvw, p.x - cvw / 2))), camy = Math.round(Math.max(0, Math.min(MH * T - cvh, p.y - cvh / 2)));
    R.camx = camx; R.camy = camy;
    ctx.fillStyle = '#07060a'; ctx.fillRect(0, 0, cvw, cvh);
    var x0 = Math.floor(camx / T), y0 = Math.floor(camy / T), x1 = Math.min(MW - 1, x0 + R.vw + 1), y1 = Math.min(MH - 1, y0 + R.vh + 1);
    R.chunked = !!(SP.ready && SP.terrainReady && SP.terrainReady(th.name)); SP.tileK = Number.isInteger(R.k) ? R.k : 0; // whole-number scales get pre-shrunk tiles
    if (R.chunked) { // copy the cached ground, then draw the few live tiles (water, bonfire, gate)
      ctx.imageSmoothingEnabled = chunkK() < R.k;
      for (var cy = Math.floor(y0 / CH); cy <= Math.floor(y1 / CH); cy++) for (var cx = Math.floor(x0 / CH); cx <= Math.floor(x1 / CH); cx++) {
        var ck = R.chunks[cx + ',' + cy]; if (!ck || ck.dirty || ck.k !== chunkK()) ck = buildChunk(cx, cy); ck.used = R.t;
        ctx.drawImage(ck.cv, cx * CH * T - camx, cy * CH * T - camy, ck.cv.width / R.k, ck.cv.height / R.k);
      }
      ctx.imageSmoothingEnabled = false;
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) { var i = y * MW + x; if (R.seen[i] && LIVE[R.map.tiles[i]]) drawTile(ctx, x, y, R.map.tiles[i], x * T - camx, y * T - camy, th); }
    } else for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
      var i = y * MW + x; if (!R.seen[i]) continue;
      drawTile(ctx, x, y, R.map.tiles[i], x * T - camx, y * T - camy, th);
    }
    if (SP.ready && SP.overlay) SP.overlay(ctx, th, x0, y0, x1, y1, camx, camy, R.map.tiles, R.seen, R.t);
    // entities sorted by y
    var list = R.ents.slice(); if (R.brazOK) (R.map.braziers || []).forEach(function (b, bi) { list.push({ kind: 'brazier', x: b.x * T + T / 2, y: b.y * T + T / 2 + 4, seed: bi }); });
    if (R.map.props) R.map.props.forEach(function (q) { if (!q.flat) list.push({ kind: 'prop', x: q.x * T + T / 2, y: q.y * T + T - 1, p: q }); });
    if (R.map.theme && R.map.theme.name === 'throne' && SP.actor && SP.actor('cr:gate11')) list.push({ kind: 'gate11', x: R.map.gate.x * T + T / 2, y: R.map.gate.y * T + T });
    else if (SP.hasDoorArt && SP.hasDoorArt()) list.push({ kind: 'door', x: R.map.gate.x * T + T / 2, y: R.map.gate.y * T + 1 }); // sorts behind a hero walking through it
    if (R.well) list.push({ kind: 'well', x: R.well.x * T + T / 2, y: R.well.y * T + T / 2 + 4 });
    if (R.w.campfire) list.push({ kind: 'campfire', x: R.w.campfire.x * T + T / 2, y: R.w.campfire.y * T + T / 2 + 4 });
    list.push({ kind: 'fire', x: R.map.spawn.x * T + T / 2, y: R.map.spawn.y * T + T / 2, dir: 1, clock: R.t });
    list.push({ kind: 'hero', x: p.x, y: p.y, dir: p.dir, moving: p.moving && !R.cut, anim: p.anim, clock: p.clock, act: p.act, cls: R.opts.heroClass || 'knight', stage: R.opts.heroStage || 1 });
    list.sort(function (a, b) { return a.y - b.y; });
    list.forEach(function (e) { if (e.kind !== 'hero' && !R.seen[Math.floor(e.y / T) * MW + Math.floor(e.x / T)]) return; if (e.kind === 'corpse') drawCorpse(ctx, e, e.x - camx, e.y - camy); else drawEnt(ctx, e, e.x - camx, e.y - camy); });
    // dropped lore marker
    if (R.S.dropped && R.S.dropped.land === R.L.id) { var de = R.ents.filter(function (e) { return e.ref && e.ref.id === R.S.dropped.creature && (R.S.dropped.inst == null || e.n === R.S.dropped.inst); })[0]; if (de) { var gx = de.x - camx, gy = de.y - camy - 14 + Math.sin(R.t * 4) * 1.5; ctx.fillStyle = '#8fd3ff'; ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(143,211,255,.35)'; ctx.beginPath(); ctx.arc(gx, gy, 5, 0, 7); ctx.fill(); } }
    // fog: seen-but-far tiles darkened, unseen black (already black), soft light around hero
    drawDark(ctx, p.x - camx, p.y - camy);
    // brazier light burns through the dark: warm pools along the road wherever it has been seen
    if (R.brazOK && R.map.braziers && R.map.braziers.length) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      R.map.braziers.forEach(function (b, bi) { if (!R.seen[b.y * MW + b.x]) return; var bx = b.x * T + T / 2 - camx, by = b.y * T - 6 - camy; if (bx < -60 || by < -60 || bx > cvw + 60 || by > cvh + 60) return;
        var fl = 0.75 + Math.sin(R.t * 7.3 + bi * 1.7) * 0.12 + Math.sin(R.t * 13.1 + bi) * 0.08; ctx.globalAlpha = fl; ctx.imageSmoothingEnabled = true;
        ctx.drawImage(SP.glow('brazier', T * 3.2, [[0, 'rgba(255,150,60,.34)'], [0.5, 'rgba(255,100,30,.12)'], [1, 'rgba(255,90,20,0)']]), bx - T * 3.2, by - T * 3.2, T * 6.4, T * 6.4); });
      ctx.restore();
    }
    if (R.w.campfire) { var cfp = R.w.campfire, cbx = cfp.x * T + T / 2 - camx, cby = cfp.y * T - 8 - camy, cfl = 0.8 + Math.sin(R.t * 6.1) * 0.12 + Math.sin(R.t * 11.7) * 0.08;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = cfl; ctx.imageSmoothingEnabled = true;
      ctx.drawImage(SP.glow('campfire', T * 4.2, [[0, 'rgba(255,160,70,.42)'], [0.5, 'rgba(255,110,40,.15)'], [1, 'rgba(255,90,20,0)']]), cbx - T * 4.2, cby - T * 4.2, T * 8.4, T * 8.4); ctx.restore(); }
    // minimap (explored tiles only)
    if (cvw >= 300) {
    var mx = cvw - MW - 4, my = 4; ctx.fillStyle = 'rgba(10,8,12,.75)'; ctx.fillRect(mx - 2, my - 2, MW + 4, MH + 4);
    ctx.drawImage(minimapImage(), mx, my);
    R.ents.forEach(function (e) { if (!R.seen[Math.floor(e.y / T) * MW + Math.floor(e.x / T)]) return; if (e.kind === 'creature' || e.kind === 'boss') { ctx.fillStyle = e.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[e.ref.level]; ctx.fillRect(mx + Math.floor(e.x / T), my + Math.floor(e.y / T), 1, 1); } else if (e.kind === 'corpse') { ctx.fillStyle = '#555'; ctx.fillRect(mx + Math.floor(e.x / T), my + Math.floor(e.y / T), 1, 1); } });
    ctx.fillStyle = '#ff9a3c'; ctx.fillRect(mx + R.map.spawn.x, my + R.map.spawn.y, 1, 1); if (R.w.campfire) ctx.fillRect(mx + R.w.campfire.x, my + R.w.campfire.y, 1, 1); if (R.well) { ctx.fillStyle = '#5aaaff'; ctx.fillRect(mx + R.well.x, my + R.well.y, 1, 1); }
    ctx.fillStyle = Math.floor(R.t * 3) % 2 ? '#ffffff' : '#e8dcc0'; ctx.fillRect(mx + Math.floor(p.x / T), my + Math.floor(p.y / T), 1, 1);
    }
    if (R.opts.fullscreen) {
      if (R.t < 8) { var ht = ('ontouchstart' in window) ? 'Drag the stick to walk  ·  tap the sword to act' : 'WASD / arrows to walk  ·  E to fight, open, rest'; ctx.globalAlpha = Math.min(1, 8 - R.t); label(ctx, cvw * R.scale - 8, cvh * R.scale - 8, ht, '#c9bca0', 'right', 'rgba(10,8,12,.7)'); ctx.globalAlpha = 1; }
    }
    // name tags for nearby creature
    if (R.near && R.near.e) { var ne = R.near.e; tag(ctx, ne.x - camx, ne.y - camy - 16, ne.ref.name, ne.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[ne.ref.level] || '#e8dcc0'); }
    if (R.toastT > 0 && R.toast) label(ctx, cvw * R.scale / 2, 22 + (R.hintHtml ? 36 * (R.cv.height / (R.cv.getBoundingClientRect().height || R.cv.height)) : 0), R.toast, '#e8dcc0', 'center', 'rgba(10,8,12,.85)');
  }
  var LEVEL_COLORS = { BEG: '#7fb069', PRG: '#6f9be0', MAS: '#b07be8', BOSS: '#d8433a' };
  function tag(ctx, x, y, text, color) { label(ctx, x * R.scale, Math.max(14, y * R.scale), text, color, 'center', 'rgba(10,8,12,.8)', true); }
  /* crisp text: drawn in CSS pixels at device resolution (x, y in CSS px of the canvas; y = text baseline). */
  function label(ctx, x, y, text, color, align, bg, clamp) {
    ctx.save(); ctx.setTransform(R.dpr, 0, 0, R.dpr, 0, 0); ctx.imageSmoothingEnabled = true;
    var fs = R.scale >= 3 ? 14 : 12; ctx.font = '600 ' + fs + 'px "Segoe UI", Helvetica, Arial, sans-serif';
    var w = ctx.measureText(text).width + 12, h = fs + 8, W = R.lw * R.scale;
    var left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    if (clamp) left = Math.max(2, Math.min(W - w - 2, left));
    left = Math.round(left); var top = Math.round(y - fs - 4);
    ctx.fillStyle = bg; ctx.fillRect(left, top, Math.round(w), h);
    ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(text, left + 6, top + fs + 1);
    ctx.restore();
  }

  function spr(name) { return SP.ready && SP.defs[name]; }
  function drawSprite(ctx, name, x, y, frameT, flip) { // x,y = feet centre
    var d = spr(name); if (!d) return false;
    var n = d.frames.length, fi = ((Math.floor(frameT * (d.fps || 8)) % n) + n) % n, f = d.frames[fi]; if (!f) { if (!SP._warned) { SP._warned = 1; console.warn('bad frame', name, frameT, fi, d.frames.length); } return false; }
    if (d.hd) { var img2 = d.img, sx2 = f.x, sy2 = f.y; if (d.tint && SP.tintedFrame) { img2 = SP.tintedFrame(d, fi); sx2 = 0; sy2 = 0; } SP.drawHD(ctx, { img: img2, scale: d.scale, frames: [{ x: sx2, y: sy2, w: f.w, h: f.h, ax: f.ax, ay: f.ay }] }, 0, x, y + 5, flip); return true; }
    var sc = d.scale || 1, w = f.w * sc, h = f.h * sc;
    var dx = Math.round(x - w / 2), dy = Math.round(d.anchorBottom === false ? y - h / 2 : y + 6 - h);
    var img = d.img || SP.img, sx = f.x, sy = f.y;
    if (d.tint && SP.tintedFrame) { img = SP.tintedFrame(d, fi); sx = 0; sy = 0; }
    ctx.save(); if (flip) { ctx.translate(dx + w, dy); ctx.scale(-1, 1); ctx.drawImage(img, sx, sy, f.w, f.h, 0, 0, w, h); } else ctx.drawImage(img, sx, sy, f.w, f.h, dx, dy, w, h); ctx.restore();
    return true;
  }
  function drawTile(ctx, tx, ty, t, x, y, th) {
    var v = ((tx * 7 + ty * 13) % 5);
    if (SP.ready && SP.tiles && SP.tiles(ctx, th, t, tx, ty, x, y, R.map.tiles)) return;
    // placeholder art
    ctx.fillStyle = th.ground[t === G.GROUND2 ? 1 : 0]; ctx.fillRect(x, y, T, T);
    if (t === G.PATH) { ctx.fillStyle = th.path; ctx.fillRect(x, y, T, T); ctx.fillStyle = 'rgba(0,0,0,.08)'; if (v < 2) ctx.fillRect(x + 3 + v * 5, y + 6, 2, 2); }
    else if (t === G.WALL || t === G.EDGE) {
      if (th.indoor) { ctx.fillStyle = '#4a4450'; ctx.fillRect(x, y, T, T); ctx.fillStyle = '#2a2630'; ctx.fillRect(x, y + 12, T, 4); ctx.fillStyle = '#5c5566'; ctx.fillRect(x + 1, y + 1, 6, 4); ctx.fillRect(x + 9, y + 1, 6, 4); ctx.fillRect(x + 1, y + 7, 14, 4); }
      else if (th.wall === 'rock') { ctx.fillStyle = '#4a3a34'; ctx.fillRect(x + 1, y + 2, 14, 13); ctx.fillStyle = '#6a5048'; ctx.fillRect(x + 3, y + 3, 7, 5); ctx.fillStyle = '#2a1e1a'; ctx.fillRect(x + 2, y + 12, 12, 3); }
      else { var dead = th.wall === 'tree-dead'; ctx.fillStyle = dead ? '#3a3328' : '#17301a'; ctx.beginPath(); ctx.arc(x + 8, y + 7, 7, 0, 7); ctx.fill(); ctx.fillStyle = dead ? '#4c4334' : '#245a2b'; ctx.beginPath(); ctx.arc(x + 6, y + 5, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#2a1c10'; ctx.fillRect(x + 7, y + 12, 2, 4); }
    }
    else if (t === G.WATER) { var ph = Math.sin(R.t * 2 + tx + ty) > 0; ctx.fillStyle = th.water; ctx.fillRect(x, y, T, T); ctx.fillStyle = th.lava ? '#ffb347' : 'rgba(255,255,255,.12)'; ctx.fillRect(x + (ph ? 3 : 8), y + 5, 4, 1); ctx.fillRect(x + (ph ? 9 : 2), y + 11, 3, 1); }
    else if (t === G.DECO) { ctx.fillStyle = 'rgba(232,220,192,.35)'; ctx.fillRect(x + 5, y + 9, 2, 5); ctx.fillRect(x + 9, y + 7, 2, 7); }
    else if (t === G.GATE || t === G.GATE_OPEN) { var open = gateOpen(); ctx.fillStyle = '#4a4450'; ctx.fillRect(x, y, T, T); ctx.fillStyle = open ? '#0a0810' : '#7a5a2a'; ctx.fillRect(x + 3, y + 2, 10, 14); if (!open) { ctx.fillStyle = '#d6a860'; ctx.fillRect(x + 7, y + 8, 2, 3); } }
    else if (t === G.FIRE) { ctx.fillStyle = '#3a3030'; ctx.fillRect(x + 3, y + 10, 10, 4); var fl = 2 + Math.sin(R.t * 9) * 1.5; ctx.fillStyle = '#ff9a3c'; ctx.fillRect(x + 6, y + 10 - fl - 2, 4, fl + 2); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x + 7, y + 10 - fl, 2, fl); }
    else if (t === G.GROUND2) { ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x + v * 3, y + v * 2, 2, 1); }
  }
  function drawCorpse(ctx, e, x, y) {
    var cid = SP.actorFor && SP.actorFor(e), cd = cid && SP.actor(cid);
    if (cd && SP.drawActor(ctx, cd, 'death', e.dieT0 != null ? R.t - e.dieT0 : 99, x, y + 5, e.dir < 0, { alpha: 0.92 })) return;
    ctx.fillStyle = 'rgba(60,20,30,.55)'; ctx.beginPath(); ctx.ellipse(x, y + 5, 9, 3.5, 0, 0, 7); ctx.fill();
    var hdc = SP.ready && SP.corpseFor && SP.corpseFor(e); if (hdc && spr(hdc)) { ctx.save(); ctx.globalAlpha = 0.85; drawSprite(ctx, hdc, x, y + 1, 0, e.dir < 0); ctx.restore(); return; }
    var name = SP.ready && SP.nameFor ? SP.nameFor({ kind: 'creature', ref: e.ref, tx: null, x: 0, y: 0 }, R.L) : null, d = name && spr(name);
    if (!d) { ctx.fillStyle = '#3a3030'; ctx.fillRect(x - 6, y, 12, 4); return; }
    var f = d.frames[0]; ctx.save(); ctx.translate(x, y + 3); ctx.rotate(e.dir < 0 ? Math.PI / 2 : -Math.PI / 2); ctx.globalAlpha = 0.8; ctx.drawImage(d.img || SP.img, f.x, f.y, f.w, f.h, -f.w / 2, -f.h + 2, f.w, f.h); ctx.restore();
  }
  function drawEnt(ctx, e, x, y) {
    var aid = SP.actorFor && SP.actorFor(e), ad = aid && SP.actor(aid);
    if (ad) {
      var big = e.kind === 'boss', moving = e.moving || (e.kind === 'creature' && e.tx != null && Math.hypot(e.tx - e.x, e.ty - e.y) > 1);
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 5, big ? 14 : 7, big ? 5 : 2.6, 0, 0, 7); ctx.fill();
      var an = e.act ? e.act.anim : moving ? 'walk' : 'idle', at = e.act ? R.t - e.act.t0 : (e.clock || 0);
      var tint = e.kind === 'hero' && e.stage > 1 && aid.indexOf('cr:') !== 0 ? (e.stage === 3 ? 'rgba(255,200,80,.22)' : 'rgba(140,210,255,.2)') : null;
      if (SP.drawActor(ctx, ad, an, at, x, y + 5, e.dir < 0, { tint: tint })) return;
      if (aid.indexOf('cr:') === 0) return; // its painted sheet is still loading: draw nothing rather than the old placeholder sprite
    }
    if (e.kind === 'gate11') { var gd = SP.actor('cr:gate11'); if (gd) SP.drawActor(ctx, gd, gateOpen() ? 'open' : 'sealed', 0, x, y, false, {}); return; }
    if (e.kind === 'door') { var di = SP.ui(gateOpen() ? 'ui-boss-door-open' : 'ui-boss-door-closed'); if (di) { var DS = 44; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(di, Math.round(x - DS / 2), Math.round(y - 1 + T - DS * 0.89), DS, DS); ctx.restore(); } return; }
    if (e.kind === 'well') { // the duelling well: painted art when it arrives (ART_IMG['ui-well']), a drawn stand-in until then
      var wi = SP.ui && SP.ui('ui-well'); if (wi) { var WS = 38; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 12, 4, 0, 0, 7); ctx.fill(); ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(wi, x - WS / 2, y + 6 - WS * 0.95, WS, WS); ctx.restore(); return; } // ground anchor at 95% of the frame
      var gl = 0.5 + Math.sin(R.t * 2.2) * 0.2;
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y + 3, 10, 3.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#5b5560'; ctx.fillRect(x - 9, y - 7, 18, 9); ctx.fillStyle = '#433e48'; for (var sx = -9; sx < 9; sx += 6) ctx.fillRect(x + sx + ((Math.floor(sx / 6) & 1) ? 3 : 0), y - 3, 1, 5);
      ctx.fillStyle = '#6e6874'; ctx.beginPath(); ctx.ellipse(x, y - 7, 9, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(70,150,220,' + (0.55 + gl * 0.4) + ')'; ctx.beginPath(); ctx.ellipse(x, y - 7, 6.5, 2, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#5a3d22'; ctx.fillRect(x - 9, y - 21, 2, 14); ctx.fillRect(x + 7, y - 21, 2, 14); ctx.fillRect(x - 10, y - 22, 20, 2);
      ctx.fillStyle = '#7a5530'; ctx.beginPath(); ctx.moveTo(x - 12, y - 21); ctx.lineTo(x, y - 27); ctx.lineTo(x + 12, y - 21); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#b8a07a'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x, y - 11); ctx.stroke(); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(x - 1.5, y - 12, 3, 3);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; var wg = ctx.createRadialGradient(x, y - 7, 1, x, y - 7, 16); wg.addColorStop(0, 'rgba(90,170,255,' + (0.35 * gl) + ')'); wg.addColorStop(1, 'rgba(90,170,255,0)'); ctx.fillStyle = wg; ctx.fillRect(x - 16, y - 23, 32, 32); ctx.restore();
      return; }
    if (e.kind === 'campfire') { // the boss-room fire: a tall brazier like the ones along the processional
      ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(x, y + 2, 7, 2.6, 0, 0, 7); ctx.fill();
      var cbd = SP.actor && SP.actor('cr:brazier'); if (cbd && SP.drawActor(ctx, cbd, 'idle', R.t, x, y + 1, false, { mul: 1.3 })) return;
      var cfh = 3 + Math.sin(R.t * 9) * 1.5; ctx.fillStyle = '#3a3030'; ctx.fillRect(x - 4, y - 2, 8, 4); ctx.fillStyle = '#ff9a3c'; ctx.fillRect(x - 2, y - 4 - cfh, 4, cfh + 2); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 1, y - 3 - cfh, 2, cfh); return; }
    if (e.kind === 'prop') { if (SP.landProp) SP.landProp(ctx, R.map.theme.name, e.p.i, x, y, e.p.flip); return; }
    if (e.kind === 'brazier') { var bd = SP.actor('cr:brazier'); if (bd) SP.drawActor(ctx, bd, 'idle', R.t + e.seed * 0.37, x, y + 1, false, {}); return; }
    var name = SP.ready && SP.nameFor ? SP.nameFor(e, R.L) : null;
    if (name) { if (e.kind === 'hero' || e.kind === 'creature' || e.kind === 'boss') { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, e.kind === 'boss' ? 10 : 6, e.kind === 'boss' ? 4 : 2.5, 0, 0, 7); ctx.fill(); }
      else if (e.kind === 'key' || e.kind === 'page') { y += Math.sin(e.anim) * 1.5; }
      if (drawSprite(ctx, name, x, y, e.anim, e.dir < 0)) return; }
    // placeholders
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + 6, 6, 2.5, 0, 0, 7); ctx.fill();
    if (e.kind === 'hero') { var bob = e.moving ? Math.round(Math.sin(e.anim * 2) * 1) : 0; ctx.fillStyle = '#d6a860'; ctx.fillRect(x - 4, y - 10 + bob, 8, 12); ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 3, y - 14 + bob, 6, 5); }
    else if (e.kind === 'creature' || e.kind === 'boss') { var c = e.kind === 'boss' ? '#d8433a' : LEVEL_COLORS[e.ref.level]; var s = e.kind === 'boss' ? 10 : 7, bb = Math.sin(e.anim) * 1; ctx.fillStyle = c; ctx.fillRect(x - s / 2, y - s + bb, s, s + 2); ctx.fillStyle = '#0d0b0a'; ctx.fillRect(x - 2, y - s + 3 + bb, 1, 1); ctx.fillRect(x + 1, y - s + 3 + bb, 1, 1); }
    else if (e.kind === 'chest') { ctx.fillStyle = '#7a5a2a'; ctx.fillRect(x - 5, y - 4, 10, 8); ctx.fillStyle = '#d6a860'; ctx.fillRect(x - 5, y - 1, 10, 1); ctx.fillRect(x - 1, y - 1, 2, 3); }
    else if (e.kind === 'key') { var kb = Math.sin(e.anim) * 1.5; ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 1, y - 8 + kb, 2, 8); ctx.fillRect(x - 3, y - 9 + kb, 6, 3); ctx.fillRect(x + 1, y - 2 + kb, 2, 1); }
    else if (e.kind === 'page') { var pb = Math.sin(e.anim) * 1.5; ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 3, y - 7 + pb, 6, 8); ctx.fillStyle = '#7a6a50'; ctx.fillRect(x - 2, y - 5 + pb, 4, 1); ctx.fillRect(x - 2, y - 3 + pb, 4, 1); }
  }

  /* ---------- public ---------- */
  function freeze(on) { if (R) { R.frozen = !!on; R.keys = {}; R.stickVec = null; } }
  function nudgeAway(ref, inst) { // after a battle, step the hero back from the creature so they don't instantly re-engage
    if (!R) return; var e = R.ents.filter(function (x) { return x.ref && x.ref.id === ref.id && (inst == null || x.n === inst); })[0]; if (!e) return;
    var dx = R.player.x - e.x, dy = R.player.y - e.y, d = Math.hypot(dx, dy) || 1; var nx = e.x + dx / d * 30, ny = e.y + dy / d * 30; if (!blocked(nx, ny)) { R.player.x = nx; R.player.y = ny; }
  }
  function alarm(tilesR) { if (!R) return; R.ents.forEach(function (e) { if (e.kind === 'creature' && Math.hypot(e.x - R.player.x, e.y - R.player.y) < (tilesR || 14) * T) { e.alert = 5; e.stun = 0; } }); }
  function smoke() { if (!R) return; R.ents.forEach(function (e) { if (e.kind === 'creature') { e.blind = 8; e.alert = 0; if (e.state === 'chase') e.state = 'home'; } }); }
  function revealAll() { if (!R) return; for (var i = 0; i < R.seen.length; i++) if (!SOLID[R.map.tiles[i]] || R.map.tiles[i] === G.GATE) R.seen[i] = 1; R.chunks = {}; R.seenVer = (R.seenVer || 0) + 1; persist(); }
  function announce(msg) { if (R) say(msg); }
  function counts() { if (!R) return null; var alive = 0, dead = 0; R.ents.forEach(function (e) { if (e.kind === 'creature') alive++; else if (e.kind === 'corpse') dead++; }); return { alive: alive, dead: dead }; }
  function warpHome() { // carried back to this land's bonfire: anything chasing loses the scent
    if (!R) return false; var m = R.map, T2 = T;
    R.player.x = (m.spawn.x + 1) * T2 + T2 / 2 + 6; R.player.y = m.spawn.y * T2 + T2 / 2 + 2; R.player.moving = false;
    R.ents.forEach(function (e) { if (e.kind === 'creature') { e.alert = 0; e.blind = 3; if (e.state === 'chase') e.state = 'home'; } });
    R.contactCool = 2; persist(); return true;
  }
  var API = { warpHome: warpHome, alarm: alarm, smoke: smoke, revealAll: revealAll, announce: announce, counts: counts, mount: mount, unmount: unmount, useSprites: useSprites, freeze: freeze, nudgeAway: nudgeAway, generate: generate, T: T, MW: MW, MH: MH, G: G, SP: SP, run: function () { return R; }, time: function () { return R ? R.t : 0; }, gateOpen: function () { return R ? gateOpen() : false; } };
  return API;
})();
