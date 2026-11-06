/* ===================== SPRITES =====================
 * Pixel art for the overworld, from two public-domain (CC0) packs embedded as PNG data URIs:
 *   0x72 "16x16 DungeonTileset II" v1.7 (characters, chests, crypt tiles)  — ART_IMG['sheet-dt'], frames in DT_DEFS
 *   Kenney "Roguelike/RPG pack" (terrain, trees, graves, props)             — ART_IMG['sheet-kenney'], 16px tiles on a 17px grid
 * The Kenney sheet is bright and cheerful, so a darkened, desaturated, land-tinted copy is built per theme at load.
 */
(function () {
  if (!window.ART_IMG || !ART_IMG['sheet-dt'] || !ART_IMG['sheet-kenney'] || !window.Overworld) return;
  var dt = new Image(), ken = new Image(), loaded = 0;
  /* HD painted sprites (ChatGPT starter pack, packed by tools/pack_hd.py): smooth-scaled, drawn at device resolution */
  var HD = window.HD_DEFS, hd = new Image(), hdp = new Image(), hdOK = false, propOK = false, propTinted = {};
  var HD_CREATURE = {}; // every creature now has its own painted sheet (SP.actor); kept for older stand-in mappings
  var PROP_SIZE = { living_tree: 0.1, dead_tree: 0.1, mossy_boulders: 0.075, ferns: 0.06, stone_wall: 0.08, wall_corner: 0.08, wall_ruin: 0.08, oak_doorway: 0.08, chest_closed: 0.068, chest_open: 0.068, barrel: 0.07, crate: 0.064, brazier_lit: 0.085, brazier_unlit: 0.08, grave_marker: 0.072, signpost: 0.07 }; // logical px per source px
  var PROPS = { marsh: ['dead_tree', 'dead_tree', 'mossy_boulders', 'grave_marker', 'ferns'], fen: ['dead_tree', 'mossy_boulders', 'ferns', 'dead_tree'], forest: ['living_tree', 'living_tree', 'dead_tree', 'mossy_boulders', 'ferns'], thorn: ['living_tree', 'dead_tree', 'mossy_boulders', 'wall_ruin', 'signpost'],
    volcano: ['dead_tree', 'mossy_boulders', 'brazier_unlit', 'wall_ruin'], crypt: ['wall_ruin', 'grave_marker', 'barrel', 'crate', 'brazier_unlit', 'wall_corner'], coast: ['wall_ruin', 'barrel', 'crate', 'dead_tree', 'mossy_boulders'], wild: ['living_tree', 'mossy_boulders'] };
  function hdName(ch, anim) {
    if (!hdOK || !HD.chars[ch] || !HD.chars[ch].anims[anim]) return null;
    var nm = 'hd:' + ch + ':' + anim; if (!SP.defs[nm]) { var c = HD.chars[ch], a = c.anims[anim]; SP.defs[nm] = { img: hd, hd: true, scale: c.scale, fps: a.fps, frames: a.frames.map(function (f) { return { x: f[0], y: f[1], w: f[2], h: f[3], ax: f[4], ay: f[5] }; }) }; }
    return nm;
  }
  function propDef(name, img) { var f = HD.props[name]; return { img: img || hdp, hd: true, scale: PROP_SIZE[name] / HD.propScale, fps: 1, frames: [{ x: f[0], y: f[1], w: f[2], h: f[3], ax: f[4], ay: f[5] }] }; }
  function tintImage(img, tint, mix, mul) { // same treatment as the Kenney terrain, gentler: painted props are already dark
    var cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; var cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
    var id = cx.getImageData(0, 0, cv.width, cv.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var r = d[i], g = d[i + 1], b = d[i + 2], gr = 0.3 * r + 0.59 * g + 0.11 * b; d[i] = Math.min(255, (gr * mix + r * (1 - mix)) * mul * tint[0]); d[i + 1] = Math.min(255, (gr * mix + g * (1 - mix)) * mul * tint[1]); d[i + 2] = Math.min(255, (gr * mix + b * (1 - mix)) * mul * tint[2]); }
    cx.putImageData(id, 0, 0); return cv;
  }
  function propSheet(th) { if (propTinted[th]) return propTinted[th]; var t = TINTS[th] || TINTS.wild; propTinted[th] = tintImage(hdp, t[0].map(function (v) { return 0.45 + v * 0.55; }), t[1] * 0.5, Math.min(1, t[2] + 0.3)); return propTinted[th]; }
  if (HD && ART_IMG['sheet-hd']) { hd.onload = function () { hdOK = true; }; hd.src = ART_IMG['sheet-hd']; }
  if (HD && ART_IMG['sheet-hdprops']) { hdp.onload = function () { propOK = true; }; hdp.src = ART_IMG['sheet-hdprops']; }
  var SP = Overworld.SP, tinted = {}, tintCache = {};
  function K(c, r) { return [c * 17, r * 17, 16, 16]; }
  function kdef(img, cells, fps) { return { img: img, frames: cells.map(function (c) { return { x: c[0], y: c[1], w: c[2], h: c[3] }; }), fps: fps || 4 }; }
  function ddef(name, fps, scale) { var fr = DT_DEFS[name]; if (!fr) return null; return { img: dt, frames: fr.map(function (f) { return { x: f[0], y: f[1], w: f[2], h: f[3] }; }), fps: fps || 8, scale: scale || 1 }; }

  /* per-theme darkened Kenney sheet */
  function makeTinted(key, tint, mix, mul) {
    var cv = document.createElement('canvas'); cv.width = ken.width; cv.height = ken.height; var cx = cv.getContext('2d');
    cx.drawImage(ken, 0, 0); var id = cx.getImageData(0, 0, cv.width, cv.height), d = id.data;
    for (var i = 0; i < d.length; i += 4) { if (!d[i + 3]) continue; var r = d[i], g = d[i + 1], b = d[i + 2], gr = 0.3 * r + 0.59 * g + 0.11 * b; r = (gr * mix + r * (1 - mix)) * mul * tint[0]; g = (gr * mix + g * (1 - mix)) * mul * tint[1]; b = (gr * mix + b * (1 - mix)) * mul * tint[2]; d[i] = Math.min(255, r); d[i + 1] = Math.min(255, g); d[i + 2] = Math.min(255, b); }
    cx.putImageData(id, 0, 0); tinted[key] = cv; return cv;
  }
  var TINTS = { citadel: [[0.8, 0.78, 0.74], 0.5, 0.6], spire: [[0.7, 0.72, 0.85], 0.5, 0.58], frost: [[0.85, 0.92, 1.0], 0.55, 0.75], marsh: [[0.72, 0.8, 0.8], 0.45, 0.62], forest: [[0.62, 0.8, 0.62], 0.35, 0.66], volcano: [[0.95, 0.7, 0.62], 0.4, 0.62], crypt: [[0.62, 0.6, 0.7], 0.5, 0.5], wild: [[0.75, 0.78, 0.72], 0.4, 0.62], fen: [[0.62, 0.78, 0.9], 0.5, 0.58], coast: [[0.66, 0.8, 0.86], 0.45, 0.6], thorn: [[0.9, 0.78, 0.58], 0.4, 0.62] };

  /* terrain tables per theme: Kenney cells (col,row), or 0x72 names prefixed with 'dt:' */
  var TERRAIN = {
    marsh: { wallBase: '#0a0e0c', ground: [K(0, 16), K(1, 16), K(0, 16), K(5, 1)], path: [K(6, 0), K(6, 1)], water: [K(0, 0), K(1, 0), K(0, 1), K(1, 1)], waterRaw: false,
      wall: [{ base: K(27, 11), top: K(27, 9) }, { base: K(27, 11), top: K(27, 9) }, { base: K(18, 10) }, { base: K(18, 11) }, { base: K(15, 11) }], deco: [K(51, 11), K(52, 11), K(53, 11), K(49, 9), K(53, 9), K(22, 10)] },
    forest: { wallBase: '#09100a', ground: [K(5, 0), K(5, 1), K(0, 16), K(1, 16), K(0, 16)], path: [K(6, 0), K(6, 1)], water: [K(0, 0), K(1, 0), K(0, 1), K(1, 1)],
      wall: [{ base: K(13, 9) }, { base: K(13, 10) }, { base: K(13, 11) }, { base: K(15, 9) }, { base: K(15, 10) }, { base: K(16, 10) }, { base: K(16, 11) }, { base: K(18, 9) }, { base: K(18, 11) }, { base: K(23, 10) }], deco: [K(48, 2), K(48, 3), K(48, 5), K(19, 9), K(25, 11), K(22, 11), K(28, 10)] },
    volcano: { wallBase: '#120c0a', ground: [K(6, 0), K(6, 1), K(6, 0), K(7, 0)], path: [K(8, 0), K(8, 1)], water: [K(0, 18), K(1, 18), K(0, 19), K(1, 19)], waterRaw: true,
      wall: [{ base: K(5, 16) }, { base: K(6, 16) }, { base: K(8, 16) }, { base: K(5, 18) }, { base: K(6, 18) }, { base: K(8, 18) }, { base: K(9, 16) }], deco: [K(49, 9), K(9, 0), K(9, 1), K(49, 9)] },
    crypt: { wallBase: '#15131a', ground: ['dt:floor_1', 'dt:floor_2', 'dt:floor_3', 'dt:floor_4', 'dt:floor_5', 'dt:floor_1', 'dt:floor_1'], path: ['dt:floor_8', 'dt:floor_7'], water: ['dt:hole'], wall: 'dtwall', deco: ['dt:skull', 'dt:crate', K(49, 9), K(51, 11)] },
    wild: { ground: [K(5, 0), K(5, 1), K(0, 16)], path: [K(6, 0)], water: [K(0, 0), K(1, 0)], wall: [{ base: K(13, 9) }, { base: K(16, 10) }], deco: [K(49, 9)] }
  };
  TERRAIN.citadel = TERRAIN.crypt; TERRAIN.spire = TERRAIN.volcano; TERRAIN.frost = TERRAIN.marsh; TERRAIN.fen = TERRAIN.marsh; TERRAIN.thorn = TERRAIN.forest; TERRAIN.coast = Object.assign({}, TERRAIN.volcano, { water: TERRAIN.marsh.water, waterRaw: false, wallBase: '#0b1014' }); // new lands reuse the tile sets with their own tints
  function cell(src, name) { if (typeof src === 'string') { var f = DT_DEFS[src.slice(3)]; return f ? { img: dt, x: f[0][0], y: f[0][1], w: f[0][2], h: f[0][3] } : null; } return { img: name, x: src[0], y: src[1], w: src[2], h: src[3] }; }
  function h2(a, b) { var h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

  function drawCell(ctx, c, x, y, sheet) { if (!c) return false; ctx.drawImage(c.img === dt ? dt : sheet, c.x, c.y, c.w, c.h, x, y + 16 - c.h, c.w, c.h); return true; }

  /* called by the overworld for every visible tile; return true when drawn */
  SP.tiles = function (ctx, th, t, tx, ty, x, y, tiles) {
    var TS = terrainFor(th.name); if (TS) return drawTerrainTile(ctx, TS, t, tx, ty, x, y, tiles);
    if (TSET[th.name] && window.TERRAIN_DEFS && TERRAIN_DEFS[TSET[th.name]]) { ctx.fillStyle = '#0c0a10'; ctx.fillRect(x, y, 16, 16); return true; } // the land's painted set is still loading: dark, not the old placeholder tiles
    var G = Overworld.G, MW = Overworld.MW, tab = TERRAIN[th.name] || TERRAIN.wild, sheet = tinted[th.name] || tinted.wild, raw = ken, r = h2(tx, ty);
    var ground = tab.ground[Math.floor(r * tab.ground.length)];
    if (t === G.WALL || t === G.EDGE) { ctx.fillStyle = tab.wallBase || '#0b0e0c'; ctx.fillRect(x, y, 16, 16); }   // solid ground under thickets/rock: unmistakably not walkable
    else drawCell(ctx, cell(ground, sheet), x, y, sheet);
    if (t === G.GROUND || t === G.GROUND2) return true;
    if (t === G.PATH) { drawCell(ctx, cell(tab.path[Math.floor(r * tab.path.length)], sheet), x, y, sheet); return true; }
    if (t === G.WATER) { var fr = tab.water, f = fr[(Math.floor(Overworld.time() * 1.5) + Math.floor(r * 2)) % fr.length]; var c = cell(f, tab.waterRaw ? raw : sheet); if (c && c.img !== dt) { ctx.drawImage(tab.waterRaw ? raw : sheet, c.x, c.y, 16, 16, x, y, 16, 16); } else drawCell(ctx, c, x, y, sheet); return true; }
    if (t === G.DECO && fernAt(th, tx, ty)) return true;
    if (t === G.DECO) { drawCell(ctx, cell(tab.deco[Math.floor(r * tab.deco.length)], sheet), x, y, sheet); return true; }
    if (t === G.WALL || t === G.EDGE) {
      if (tab.wall === 'dtwall') { var below = ty + 1 < Overworld.MH ? tiles[(ty + 1) * MW + tx] : G.WALL; var solidBelow = below === G.WALL || below === G.EDGE; drawCell(ctx, cell(solidBelow ? 'dt:wall_top_mid' : 'dt:wall_mid'), x, y, sheet); return true; }
      var w = tab.wall[Math.floor(r * tab.wall.length)];
      drawCell(ctx, cell(w.base, sheet), x, y, sheet);
      if (w.top) { var above = ty > 0 ? tiles[(ty - 1) * MW + tx] : 0; if (above !== G.WALL && above !== G.EDGE) drawCell(ctx, cell(w.top, sheet), x, y - 16, sheet); }
      return true;
    }
    if ((t === G.GATE || t === G.GATE_OPEN) && SP.hasDoorArt()) { drawCell(ctx, cell(tab.path[0], sheet), x, y, sheet); return true; } // the painted door is drawn as an entity (overworld.js)
    if (t === G.GATE || t === G.GATE_OPEN) { var open = Overworld.gateOpen(); var d = DT_DEFS[open ? 'doors_leaf_open' : 'doors_leaf_closed'][0]; ctx.drawImage(dt, d[0], d[1], d[2], d[3], x - 8, y - 16, 32, 32); return true; }
    if (t === G.FIRE && propOK) return true;
    if (t === G.FIRE) { var ff = Math.floor(Overworld.time() * 6) % 2 ? K(13, 0) : K(14, 0); ctx.drawImage(raw, ff[0], ff[1], 16, 16, x, y, 16, 16); return true; }
    return true;
  };

  /* creature and item sprite names */
  var CREATURE = { toad: 'tiny_slug', heron: 'angel', naga: 'lizard_f', lantern: 'wogol', wraith: 'doc', hydra: 'big_demon',
    crab: 'tiny_zombie', sailor: 'zombie', kraken: 'ogre', harpy: 'imp', brineknight: 'ice_zombie', siren: 'elf_f',
    goat: 'goblin', holdsentry: 'orc_warrior', briargolem: 'muddy', raven: 'chort', archer: 'elf_m', warden: 'masked_orc',
    rat: 'tiny_zombie', skeleton: 'skelet', wight: 'zombie', wisp: 'angel', knight: 'ice_zombie', lich: 'necromancer',
    imp: 'imp', hound: 'chort', wyrm: 'lizard_m', sprite: 'wogol', golem: 'muddy', drake: 'lizard_f',
    thornling: 'slug', mosswight: 'swampy', treant: 'orc_shaman', barksprite: 'goblin', shade: 'doc', rootbound: 'ogre',
    gatewarden: 'knight_f', sapper: 'dwarf_m', twinblade: 'knight_m', messenger: 'elf_m', quartermaster: 'dwarf_f', siegegolem: 'big_zombie',
    gargoyle: 'chort', stairwarden: 'masked_orc', stormwyvern: 'lizard_m', stormwisp: 'angel', astrolabe: 'wogol', skyseer: 'wizzard_f',
    rimewolf: 'goblin', icetrapper: 'elf_f', glacierwight: 'ice_zombie', frostmite: 'tiny_slug', cairnkeeper: 'orc_shaman', icecolossus: 'ogre',
    scarab: 'tiny_slug', ghoul: 'zombie', reliquary: 'chest_mimic_open', spider: 'skelet', cryptknight: 'masked_orc', sentinel: 'big_zombie' };
  var BOSS = { L1: ['necromancer', 2], L2: ['big_demon', 1], L3: ['big_zombie', 1.5], L4: ['skelet', 2.5], L5: ['wizzard_f', 2], L6: ['knight_f', 2], L7: ['orc_warrior', 2], L8: ['knight_m', 2.2], L9: ['wizzard_m', 2.2], L10: ['big_demon', 1.3] };
  function animName(base, moving) { if (DT_DEFS[base + '_idle_anim']) return base + (moving ? '_run_anim' : '_idle_anim'); if (DT_DEFS[base + '_anim']) return base + '_anim'; return base; }
  SP.defs = {};
  function def(name) { if (SP.defs[name]) return SP.defs[name]; var d = ddef(name, 8); if (d) SP.defs[name] = d; return d; }
  SP.nameFor = function (e, L) {
    if (e.kind === 'hero' && hdOK) { var hn = hdName(e.cls === 'sorcerer' ? 'wizard' : 'knight', e.moving ? 'walk' : 'idle'); if (hn) { if (e.stage > 1) { var hk = hn + ':s' + e.stage, hdd = SP.defs[hn]; if (!SP.defs[hk]) SP.defs[hk] = Object.assign({}, hdd, { tint: e.stage === 3 ? 'rgba(255,200,80,.30)' : 'rgba(140,210,255,.26)' }); return hk; } return hn; } }
    if (e.kind === 'creature' && hdOK && HD_CREATURE[e.ref.id]) { var cmv = e.moving || (e.tx != null && Math.hypot(e.tx - e.x, e.ty - e.y) > 1); var cn = hdName(HD_CREATURE[e.ref.id], cmv ? 'walk' : 'idle'); if (cn) return cn; }
    if (e.kind === 'chest' && propOK) { if (!SP.defs['hdp:chest']) SP.defs['hdp:chest'] = propDef('chest_closed'); return 'hdp:chest'; }
    if (e.kind === 'hero') { var base = e.cls === 'sorcerer' ? 'wizzard_m' : 'knight_m'; var nm = animName(base, e.moving); var d = def(nm); if (d && e.stage > 1) { var key = nm + ':s' + e.stage; if (!SP.defs[key]) SP.defs[key] = { img: d.img, frames: d.frames, fps: d.fps, tint: e.stage === 3 ? 'rgba(255,200,80,.42)' : 'rgba(140,210,255,.38)' }; return key; } return nm; }
    if (e.kind === 'creature') { var b = CREATURE[e.ref.sigil] || CREATURE[e.ref.id] || 'skelet'; var mv = e.moving || (e.tx != null && Math.hypot(e.tx - e.x, e.ty - e.y) > 1); var an = animName(b, mv); def(an); return an; }
    if (e.kind === 'boss') { var bb = BOSS[L.id] || ['big_zombie', 1]; var bn = animName(bb[0], false); var bd = def(bn); if (bd && bb[1] !== 1) { var bk = bn + ':x' + bb[1]; if (!SP.defs[bk]) SP.defs[bk] = { img: bd.img, frames: bd.frames, fps: 6, scale: bb[1], tint: L.id === 'L4' ? 'rgba(255,200,80,.3)' : null }; return bk; } return bn; }
    if (e.kind === 'chest') { if (!SP.defs.chest) SP.defs.chest = { img: dt, frames: [{ x: DT_DEFS.chest_full_open_anim[0][0], y: DT_DEFS.chest_full_open_anim[0][1], w: 16, h: 16 }], fps: 1, anchorBottom: false }; return 'chest'; }
    if (e.kind === 'page' && window.ART_IMG && ART_IMG['ui-lorebook-page']) { if (!SP.defs['ui:page']) SP.defs['ui:page'] = { hd: true, img: SP.ui('ui-lorebook-page', true), scale: 17 / 128, frames: [{ x: 0, y: 0, w: 128, h: 128, ax: 64, ay: 116 }], fps: 1 }; return 'ui:page'; }
    if (e.kind === 'page') { if (!SP.defs.page) SP.defs.page = kdef(ken, [K(44, 15)], 1); return 'page'; }
    if (e.kind === 'key' && window.ART_IMG && ART_IMG['ui-key']) { if (!SP.defs['ui:key']) SP.defs['ui:key'] = { hd: true, img: SP.ui('ui-key', true), scale: 15 / 96, frames: [{ x: 0, y: 0, w: 96, h: 93, ax: 48, ay: 88 }], fps: 1 }; return 'ui:key'; }
    if (e.kind === 'key') { if (!SP.defs.key) SP.defs.key = { img: keyImg(), frames: [{ x: 0, y: 0, w: 8, h: 14 }], fps: 1 }; return 'key'; }
    return null;
  };
  /* painted UI icons used on the map (ART_IMG 'ui-*'): one Image each, returned once it has loaded (raw: return it at once) */
  var uiCache = {};
  SP.ui = function (k, raw) { var im = uiCache[k]; if (!im) { if (!window.ART_IMG || !ART_IMG[k]) return null; im = uiCache[k] = new Image(); im.src = ART_IMG[k]; } return raw || (im.complete && im.naturalWidth) ? im : null; };
  SP.hasDoorArt = function () { return !!(window.ART_IMG && ART_IMG['ui-boss-door-closed'] && ART_IMG['ui-boss-door-open']); };
  function keyImg() { var cv = document.createElement('canvas'); cv.width = 8; cv.height = 14; var c = cv.getContext('2d'); c.fillStyle = '#b8862b'; c.fillRect(1, 0, 6, 6); c.fillRect(3, 6, 2, 8); c.fillRect(5, 11, 2, 1); c.fillRect(5, 13, 2, 1); c.fillStyle = '#ffd27a'; c.fillRect(2, 1, 4, 4); c.fillRect(3, 6, 1, 7); c.fillStyle = '#3a2a10'; c.fillRect(3, 2, 2, 2); return cv; }

  /* ---------- actors: painted creatures (one sheet each) and the hero, with idle / walk / attack / death ---------- */
  var actorCache = {}, scratch = null;
  function fo(f) { return { x: f[0], y: f[1], w: f[2], h: f[3], ax: f[4], ay: f[5] }; }
  SP.actor = function (id) { // 'hero:knight' | 'hero:wizard' | 'cr:<sigil>'
    if (actorCache[id]) return actorCache[id];
    var d = null;
    if (id.indexOf('hero:') === 0) {
      var c = hdOK && HD && HD.chars[id.slice(5)];
      if (c) { d = { img: hd, scale: c.scale, anims: {} }; Object.keys(c.anims).forEach(function (k) { var a = c.anims[k]; d.anims[k] = { fps: a.fps, loop: k === 'idle' || k === 'walk', frames: a.frames.map(fo) }; }); }
    } else {
      var nm = id.slice(3), cd = window.CREATURE_DEFS && CREATURE_DEFS[nm];
      if (cd && ART_IMG['cr-' + nm]) {
        var img = new Image(); img.src = ART_IMG['cr-' + nm];
        d = { img: img, scale: cd.scale, anims: {}, label: cd.label };
        Object.keys(cd.anims).forEach(function (k) { var a = cd.anims[k]; d.anims[k] = { fps: a.fps, loop: a.loop !== false, frames: a.frames.map(function (i) { return fo(cd.frames[i]); }) }; });
      }
    }
    if (d) actorCache[id] = d; return d;
  };
  SP.actorFor = function (e) { // the actor id for an overworld entity
    if (e.kind === 'hero') return SP.heroActorId(e.cls, e.stage);
    if ((e.kind === 'creature' || e.kind === 'boss' || e.kind === 'corpse') && e.ref) { var own = 'cr:' + (e.ref.sigil || e.ref.id); return (e.ref.stand && !SP.actor(own)) ? 'cr:' + e.ref.stand : own; } // stand-in sprite until its own is packed
    if (e.kind === 'fire') return 'cr:bonfire';
    return null;
  };
  /* the hero's sprite: its own painted sheet for this class and stage if packed (cr-hero-<class>-<stage>), else the starter knight / wizard */
  SP.heroActorId = function (cls, stage) {
    var own = 'hero-' + (cls || 'knight') + '-' + (stage || 1);
    if (window.CREATURE_DEFS && CREATURE_DEFS[own] && ART_IMG['cr-' + own]) return 'cr:' + own;
    return 'hero:' + (cls === 'sorcerer' ? 'wizard' : 'knight');
  };
  SP.animLength = function (d, anim) { var a = d && d.anims[anim]; return a ? a.frames.length / a.fps : 0; };
  /* draw an actor with its feet at (x, y). o: { mul (extra scale), tint (css colour laid over the body), flash (0..1 red hurt flash), alpha } */
  SP.drawActor = function (ctx, d, anim, t, x, y, flip, o) {
    o = o || {}; var a = d.anims[anim] || d.anims.idle; if (!a || !d.img.complete || !d.img.naturalWidth) return false;
    var n = a.frames.length, i = Math.floor(t * a.fps); i = a.loop ? ((i % n) + n) % n : Math.max(0, Math.min(n - 1, i));
    var f = a.frames[i], s = d.scale * (o.mul || 1), img = d.img, sx = f.x, sy = f.y;
    if (o.tint || o.flash) { // colour the body only (source-atop on a scratch canvas)
      scratch = scratch || document.createElement('canvas'); if (scratch.width < f.w || scratch.height < f.h) { scratch.width = Math.max(scratch.width, f.w); scratch.height = Math.max(scratch.height, f.h); }
      var sc = scratch.getContext('2d'); sc.clearRect(0, 0, scratch.width, scratch.height); sc.globalCompositeOperation = 'source-over'; sc.drawImage(d.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
      sc.globalCompositeOperation = 'source-atop'; if (o.tint) { sc.fillStyle = o.tint; sc.fillRect(0, 0, f.w, f.h); } if (o.flash) { sc.fillStyle = 'rgba(255,60,40,' + (0.55 * o.flash) + ')'; sc.fillRect(0, 0, f.w, f.h); }
      img = scratch; sx = 0; sy = 0;
    }
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = SP.q; if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, sx, sy, f.w, f.h, -f.ax * s, y - f.ay * s, f.w * s, f.h * s); }
    else ctx.drawImage(img, sx, sy, f.w, f.h, x - f.ax * s, y - f.ay * s, f.w * s, f.h * s);
    ctx.restore(); return true;
  };

  /* ---------- painted terrain per land (tools/pack_terrain.py) ---------- */
  var TSET = { marsh: 'L1', volcano: 'L2', forest: 'L3', crypt: 'L4', fen: 'L5', coast: 'L6', thorn: 'L7', citadel: 'L8', spire: 'L9', frost: 'L10', throne: 'L11' }, terr = {};
  var TTINT = {}; // a land without its own set can borrow one, recoloured: { theme: 'rgba(...)' }
  SP.q = 'high'; // image smoothing quality for painted art; the overworld lowers it on slow devices
  SP.terrainReady = function (name) { return !!terrainFor(name); };
  /* a soft round glow, drawn once and reused (radial gradients rebuilt every frame are costly on slow devices) */
  var glowCache = {};
  SP.glow = function (key, r, stops) { var c = glowCache[key]; if (c) return c; c = document.createElement('canvas'); c.width = c.height = Math.ceil(r * 2 * 4); var g = c.getContext('2d'), R4 = r * 4, gr = g.createRadialGradient(R4, R4, 0, R4, R4, R4);
    stops.forEach(function (st) { gr.addColorStop(st[0], st[1]); }); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height); glowCache[key] = c; return c; };
  function terrainFor(th) {
    var id = TSET[th]; if (!id || !window.TERRAIN_DEFS || !TERRAIN_DEFS[id]) return null;
    var t = terr[th]; if (t) return t.ready ? t : null;
    var def = TERRAIN_DEFS[id], n = id.slice(1), tint = TTINT[th]; t = terr[th] = { def: def, ready: false, tiles: [], props: new Image(), propsOK: false };
    var im = new Image(); im.onload = function () { // one canvas per tile, so smoothing never bleeds from the neighbouring tile in the atlas
      var edges = {}; Object.keys(def.edgeByMask).forEach(function (k) { edges[def.edgeByMask[k]] = 1; });
      def.frames.forEach(function (f, i) { var c = document.createElement('canvas'); c.width = f[2]; c.height = f[3]; var cx = c.getContext('2d'); cx.drawImage(im, f[0], f[1], f[2], f[3], 0, 0, f[2], f[3]);
        if (tint) { cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = tint; cx.fillRect(0, 0, f[2], f[3]); cx.globalCompositeOperation = 'source-over'; }
        if (edges[i] && id !== 'L11') { cx.globalCompositeOperation = 'multiply'; cx.fillStyle = 'rgb(92,88,100)'; cx.fillRect(0, 0, f[2], f[3]); } // impassable ground sits clearly darker than the paths you can walk
        t.tiles.push(c); });
      t.ready = true; };
    im.src = ART_IMG['tr-l' + n];
    var pim = new Image(); pim.onload = function () { if (!tint) { t.props = pim; t.propsOK = true; return; } var c = document.createElement('canvas'); c.width = pim.width; c.height = pim.height; var cx = c.getContext('2d'); cx.drawImage(pim, 0, 0); cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = tint; cx.fillRect(0, 0, c.width, c.height); t.props = c; t.propsOK = true; };
    pim.src = ART_IMG['tr-l' + n + '-props'];
    return null;
  }
  SP.terrainFor = terrainFor;
  function isWallT(tt) { var G = Overworld.G; return tt === G.WALL || tt === G.EDGE; }
  /* a terrain tile shrunk once to k device pixels per world pixel (16k square) with high-quality smoothing */
  function scaledTile(ts, i, k) {
    var sc = ts.scaled || (ts.scaled = {}); if (sc.k !== k) { ts.scaled = sc = { k: k }; }
    var c = sc[i]; if (c) return c; c = document.createElement('canvas'); c.width = c.height = Math.round(16 * k);
    var g = c.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(ts.tiles[i], 0, 0, c.width, c.height); return (sc[i] = c);
  }
  function drawTerrainTile(ctx, ts, t, tx, ty, x, y, tiles) {
    var G = Overworld.G, MW = Overworld.MW, MH = Overworld.MH, def = ts.def, r = h2(tx, ty);
    var k = SP.tileK || 0; if (!k) { ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = SP.q; }
    function put(i) { ctx.drawImage(k ? scaledTile(ts, i, k) : ts.tiles[i], x, y, 16, 16); } // pre-shrunk to the screen's size: a plain copy
    if (t === G.WALL || t === G.EDGE) {
      var at = function (dx, dy) { var nx = tx + dx, ny = ty + dy; return nx < 0 || ny < 0 || nx >= MW || ny >= MH || isWallT(tiles[ny * MW + nx]); };
      var m = (at(0, -1) ? 1 : 0) | (at(1, 0) ? 2 : 0) | (at(0, 1) ? 4 : 0) | (at(-1, 0) ? 8 : 0);
      put(def.edgeByMask[m]); ctx.imageSmoothingEnabled = false; return true;
    }
    if (t === G.WATER) { var lf = def.liquid; put(lf[Math.floor(Overworld.time() * (def.liquidFps || 4)) % lf.length]); ctx.imageSmoothingEnabled = false; return true; }
    put(t === G.PATH ? def.path : def.ground[Math.floor(r * def.ground.length)]);
    ctx.imageSmoothingEnabled = false;
    if ((t === G.GATE || t === G.GATE_OPEN) && (SP.hasDoorArt() || (def === (window.TERRAIN_DEFS || {}).L11 && SP.actor('cr:gate11')))) return true; // the throne-room gate is drawn as a sprite, in front of the walls
    if (t === G.GATE || t === G.GATE_OPEN) { var open = Overworld.gateOpen(); var d = DT_DEFS[open ? 'doors_leaf_open' : 'doors_leaf_closed'][0]; ctx.drawImage(dt, d[0], d[1], d[2], d[3], x - 8, y - 16, 32, 32); }
    return true;
  }
  SP.landProp = function (ctx, thName, i, x, y, flip) { var TS = terrainFor(thName); if (!TS || !TS.propsOK) return false; landProp(ctx, TS, i, x, y, flip); return true; };
  function landProp(ctx, ts, i, x, y, flip) { var p = ts.def.props[i], f = p.f; drawHD(ctx, { img: ts.props, scale: ts.def.propScale, frames: [{ x: f[0], y: f[1], w: f[2], h: f[3], ax: f[4], ay: f[5] }] }, 0, x, y, flip); }

  /* HD corpse: the last frame of the creature's death animation */
  SP.corpseFor = function (e) { var c = e.ref && HD_CREATURE[e.ref.id]; return c ? hdName(c, 'death') : null; };

  /* painted props along the edges of rooms and corridors, drawn after the tiles and before creatures */
  var WALK = {}; [0, 1, 2, 5, 7, 8].forEach(function (t) { WALK[t] = 1; });
  function fernAt(th, tx, ty) { return propOK && (th.name === 'forest' || th.name === 'thorn' || th.name === 'fen' || th.name === 'marsh') && h2(tx * 3 + 7, ty * 5 + 1) < 0.35; }
  SP.overlay = function (ctx, th, x0, y0, x1, y1, camx, camy, tiles, seen, t) {
    var TS = terrainFor(th.name);
    if (TS) return landOverlay(ctx, TS, th, x0, y0, x1, y1, camx, camy, tiles, seen, t);
    if (!propOK) return; var G = Overworld.G, MW = Overworld.MW, MH = Overworld.MH, list = PROPS[th.name] || PROPS.wild, sheet = propSheet(th.name);
    for (var ty = Math.max(0, y0 - 1); ty <= Math.min(MH - 1, y1 + 2); ty++) for (var tx = Math.max(0, x0 - 2); tx <= Math.min(MW - 1, x1 + 2); tx++) {
      var i = ty * MW + tx, tt = tiles[i]; if (!seen[i]) continue;
      var x = tx * 16 - camx + 8, y = ty * 16 - camy + 15;
      if (tt === G.FIRE) { // the bonfire: a lit brazier with a breathing glow
        var gl = 0.55 + Math.sin(t * 5.3) * 0.08 + Math.sin(t * 13.1) * 0.05, g = ctx.createRadialGradient(x, y - 10, 1, x, y - 10, 30);
        g.addColorStop(0, 'rgba(255,170,80,' + (0.38 * gl) + ')'); g.addColorStop(1, 'rgba(255,120,40,0)'); ctx.fillStyle = g; ctx.fillRect(x - 30, y - 40, 60, 60);
        if (!SP.actor('cr:bonfire')) drawHD(ctx, propDef('brazier_lit'), 0, x, y, false); continue;
      }
      if (tt === G.DECO && fernAt(th, tx, ty)) { drawHD(ctx, propDef('ferns', sheet), 0, x, y, h2(tx, ty * 3) < 0.5); continue; }
      if (tt !== G.WALL || ty + 1 >= MH || !WALK[tiles[i + MW]]) continue;            // only walls with open ground in front of them
      if (h2(tx * 11 + 3, ty * 7 + 5) > 0.2) continue;
      if (tx > 0 && tiles[i - 1] === G.WALL && WALK[tiles[i - 1 + MW]] && h2((tx - 1) * 11 + 3, ty * 7 + 5) <= 0.2) continue; // no two props side by side
      var nm = list[Math.floor(h2(tx * 5 + 1, ty * 9 + 2) * list.length)];
      drawHD(ctx, propDef(nm, sheet), 0, x, y, h2(tx * 2, ty * 2 + 9) < 0.5);
    }
  };
  /* contact shadows where walls meet open ground, so the edge of the walkable area reads at a glance (tiles x0..x1, y0..y1) */
  function contactShadows(ctx, tiles, seen, x0, y0, x1, y1, camx, camy) {
    var MW = Overworld.MW, MH = Overworld.MH;
    for (var ty = Math.max(0, y0); ty <= Math.min(MH - 1, y1); ty++) for (var tx = Math.max(0, x0); tx <= Math.min(MW - 1, x1); tx++) {
      var i = ty * MW + tx, tt = tiles[i]; if (!seen[i] || !WALK[tt]) continue;
      var x = tx * 16 - camx, y = ty * 16 - camy, g;
      if (ty > 0 && isWallT(tiles[i - MW])) { g = ctx.createLinearGradient(0, y, 0, y + 7); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 16, 7); }
      if (tx > 0 && isWallT(tiles[i - 1])) { g = ctx.createLinearGradient(x, 0, x + 5, 0); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y, 5, 16); }
      if (tx < MW - 1 && isWallT(tiles[i + 1])) { g = ctx.createLinearGradient(x + 16, 0, x + 11, 0); g.addColorStop(0, 'rgba(0,0,0,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x + 11, y, 5, 16); }
      if (ty < MH - 1 && isWallT(tiles[i + MW])) { g = ctx.createLinearGradient(0, y + 16, 0, y + 12); g.addColorStop(0, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x, y + 12, 16, 4); }
    }
  }
  SP.contactShadows = function (ctx, tiles, seen, x0, y0, x1, y1, ox, oy) { if (SP.terrainReady((Overworld.run() || { map: { theme: {} } }).map.theme.name)) contactShadows(ctx, tiles, seen, x0, y0, x1, y1, ox, oy); };
  function landOverlay(ctx, TS, th, x0, y0, x1, y1, camx, camy, tiles, seen, t) {
    var G = Overworld.G, MW = Overworld.MW, MH = Overworld.MH, props = TS.def.props, tall = [], flat = [], wet = [];
    props.forEach(function (p, i) { if (p.water) wet.push(i); else if (p.flat) flat.push(i); else tall.push(i); });
    if (!flat.length) flat = []; if (!tall.length) tall = flat;
    // 1. contact shadows where walls meet open ground (the overworld bakes these into its terrain cache instead)
    if (!(Overworld.run() || {}).chunked) contactShadows(ctx, tiles, seen, x0, y0, x1 + 1, y1 + 1, camx, camy);
    var ty, tx, i, tt, x, y;
    if (!TS.propsOK) return;
    var run = Overworld.run && Overworld.run(), fixed = run && run.map && run.map.props;
    if (fixed) { // a hand-dressed land: only the bonfire glow and the flat pieces here; tall ones are y-sorted with the actors
      for (var fi = 0; fi < fixed.length; fi++) { var fp = fixed[fi]; if (!fp.flat || !seen[fp.y * MW + fp.x]) continue; landProp(ctx, TS, fp.i, fp.x * 16 - camx + 8, fp.y * 16 - camy + 15, fp.flip); }
    }
    // 2. scenery: tall pieces along the faces of walls, flat ones on scattered ground, lily pads on water
    for (ty = Math.max(0, y0 - 1); ty <= Math.min(MH - 1, y1 + 3); ty++) for (tx = Math.max(0, x0 - 2); tx <= Math.min(MW - 1, x1 + 2); tx++) {
      i = ty * MW + tx; tt = tiles[i]; if (!seen[i]) continue;
      x = tx * 16 - camx + 8; y = ty * 16 - camy + 15;
      if (tt === G.FIRE) { var gl = 0.55 + Math.sin(t * 5.3) * 0.08 + Math.sin(t * 13.1) * 0.05; ctx.save(); ctx.globalAlpha = 0.38 * gl; ctx.imageSmoothingEnabled = true; ctx.drawImage(SP.glow('bonfire', 30, [[0, 'rgba(255,170,80,1)'], [1, 'rgba(255,120,40,0)']]), x - 30, y - 40, 60, 60); ctx.restore(); if (propOK && !SP.actor('cr:bonfire')) drawHD(ctx, propDef('brazier_lit'), 0, x, y, false); continue; }
      if (fixed) continue;
      if (tt === G.DECO && flat.length) { if (h2(tx * 3 + 7, ty * 5 + 1) < (flat.length > 1 ? 0.6 : 0.22)) landProp(ctx, TS, flat[Math.floor(h2(tx, ty * 7) * flat.length)], x, y, h2(tx, ty * 3) < 0.5); continue; }
      if (tt === G.WATER && wet.length) { if (h2(tx * 13 + 1, ty * 3 + 4) < 0.07) landProp(ctx, TS, wet[0], x, y - 3, h2(tx, ty) < 0.5); continue; }
      if (tt !== G.WALL || ty + 1 >= MH || !WALK[tiles[i + MW]]) continue;
      if (h2(tx * 11 + 3, ty * 7 + 5) > 0.22) continue;
      if (tx > 0 && tiles[i - 1] === G.WALL && WALK[tiles[i - 1 + MW]] && h2((tx - 1) * 11 + 3, ty * 7 + 5) <= 0.22) continue;
      landProp(ctx, TS, tall[Math.floor(h2(tx * 5 + 1, ty * 9 + 2) * tall.length)], x, y, h2(tx * 2, ty * 2 + 9) < 0.5);
    }
  }
  function drawHD(ctx, d, fi, x, y, flip) { var f = d.frames[fi], s = d.scale; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = SP.q;
    if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(d.img, f.x, f.y, f.w, f.h, -f.ax * s, y - f.ay * s, f.w * s, f.h * s); } else ctx.drawImage(d.img, f.x, f.y, f.w, f.h, x - f.ax * s, y - f.ay * s, f.w * s, f.h * s);
    ctx.restore(); }
  SP.drawHD = drawHD;

  /* tinted frame cache (hero stages, golden boss) */
  SP.tintedFrame = function (d, fi) {
    var key = (d.img === dt ? 'dt' : d.img === hd ? 'hd' : 'k') + ':' + fi + ':' + d.frames[fi].x + ':' + d.frames[fi].y + ':' + d.tint, c = tintCache[key]; if (c) return c;
    var f = d.frames[fi], cv = document.createElement('canvas'); cv.width = f.w; cv.height = f.h; var cx = cv.getContext('2d');
    cx.drawImage(d.img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h); cx.globalCompositeOperation = 'source-atop'; cx.fillStyle = d.tint; cx.fillRect(0, 0, f.w, f.h);
    tintCache[key] = cv; return cv;
  };

  function ready() {
    if (++loaded < 2) return;
    Object.keys(TINTS).forEach(function (k) { makeTinted(k, TINTS[k][0], TINTS[k][1], TINTS[k][2]); });
    SP.img = dt; SP.ready = true;
  }
  dt.onload = ready; ken.onload = ready; dt.src = ART_IMG['sheet-dt']; ken.src = ART_IMG['sheet-kenney'];
})();
