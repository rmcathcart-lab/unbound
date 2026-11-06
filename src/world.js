/* ===================== WORLD DATA ===================== */
var LEVELS = {
  BEG: { name: 'Beginning', short: 'BEG', lore: 20, time: 60, color: 'var(--beg)' },
  PRG: { name: 'Progressing', short: 'PRG', lore: 45, time: 150, color: 'var(--prg)' },
  MAS: { name: 'Mastery', short: 'MAS', lore: 100, time: 240, color: 'var(--mas)' },
  BOSS: { name: 'Boss', short: 'BOSS', lore: 400, time: 240, color: 'var(--boss)' },
  FINAL: { name: 'Final boss', short: 'FINAL', lore: 1500, time: 240, color: 'var(--boss)' }
};

var LANDS = [
  { id: 'L1', unit: 1, name: 'The Hollow Fields', subject: 'Number', open: true, explore: 2, banner: 'banner-l1',
    blurb: 'Dead fields at the eastern edge of the world, where every harvest failed and the things left behind kept counting. Factor what they hoard, root out what they hide, and take the road west.',
    outcomes: { AN1: 'Factors, multiples, perfect squares and cubes', AN2: 'Real numbers and radicals' },
    creatures: [
      { id: 'tallyhusk', name: 'Tallyhusk', outcome: 'AN1', level: 'BEG', sigil: 'tallyhusk', gen: 'AN1_BEG', flavor: 'It counts what the fields have lost. Every notch on its board is a harvest that never came in, and it cannot stop counting.' },
      { id: 'grindstone', name: 'Grindstone Golem', outcome: 'AN1', level: 'PRG', sigil: 'grindstone', gen: 'AN1_PRG', flavor: 'Built from the millstones of a mill that ground nothing for forty years. Whatever it catches, it grinds down to primes.' },
      { id: 'thresher', name: 'Flail Thresher', outcome: 'AN1', level: 'MAS', sigil: 'thresher', gen: 'AN1_MAS', flavor: 'Six arms, six flails, one rhythm. It only strikes when every flail lands at once, on the lowest common beat.' },
      { id: 'hcrow', name: 'Hollow Crow', outcome: 'AN2', level: 'BEG', sigil: 'hcrow', gen: 'AN2_BEG', flavor: 'It drops out of the grey sky straight at your face, and pecks at a number until it learns what it is made of. It can taste the difference between rational and not.' },
      { id: 'roothag', name: 'Root Hag', outcome: 'AN2', level: 'PRG', sigil: 'roothag', gen: 'AN2_PRG', flavor: 'She keeps her roots in the cauldron, square and cube alike, and pulls the perfect ones out by the neck.' },
      { id: 'unreckoned', name: 'The Unreckoned', outcome: 'AN2', level: 'MAS', sigil: 'unreckoned', gen: 'AN2_MAS', flavor: 'Its veils never end and never repeat. Many have tried to measure it exactly. Only a radical comes close.' }
    ],
    boss: { id: 'boss1', name: 'Grist, the Hollow Miller', level: 'BOSS', sigil: 'miller', gens: ['AN1_PRG', 'AN2_PRG', 'AN1_MAS', 'AN2_MAS'], title: 'Millbreaker',
      flavor: 'The miller ground the last harvest of the Fields into dust and kept grinding. His gate on the hill is sealed until every creature of the Fields has fallen at least once. Behind it: four questions, and four hundred Lore.' }
  }
];
/* Lands still to come, shown fogged on the world map until they are built (ids match WM_DEFS regions). */
var LANDS_SOON = { L2: 'The Salt Wastes', L3: 'The Deep Quarry', L4: 'The Hollowdeep Mines', L5: "Cogwright's Ruin", L6: 'The Sheer Stair', L7: 'The Waystone Hills', L8: 'The Crossroads' };
/* The tutorial: a small land off the world map where nothing is kept. New heroes start here; the Rules page reopens it. */
var TUTORIAL = { id: 'T0', unit: 0, name: 'The Proving Grounds', subject: 'How to play', open: true, explore: 2, tutorial: true, banner: 'title',
  blurb: 'A fenced yard behind the first bonfire where new heroes learn the ways of the road. Nothing here is kept, and nothing here can truly kill you.',
  outcomes: { TUT: 'How to play' },
  creatures: [
    { id: 't-rat', name: 'Training Crow', outcome: 'Training', level: 'BEG', sigil: 'hcrow', gen: 'TUT_A', asleep: true, flavor: 'Fast asleep on a fence post. Walk right up to it.' },
    { id: 't-wisp', name: 'Training Husk', outcome: 'Training', level: 'BEG', sigil: 'tallyhusk', gen: 'TUT_B', flavor: 'Wide awake, and it will come for you the moment it sees you.' }
  ],
  boss: { id: 't-boss', name: 'The Proving Golem', level: 'BOSS', sigil: 'grindstone', gens: ['TUT_C', 'TUT_D'], title: '',
    flavor: 'A training golem of stacked practice stones. Two questions in a row, the way every boss asks several.' }
};

var FINAL_ID = 'L9'; // no final land yet

/* Gear: five branches, three tiers. Tier 2 needs tier 1 and level 3; tier 3 needs tier 2, level 6 and a boss kill. */
var GEAR = [
  { id: 'boots', branch: 'Swiftness', tier: 1, name: 'Roadwalker Boots', cost: 120,
    desc: 'You walk 12% faster in every land. Creatures do not.' },
  { id: 'cloak', branch: 'Swiftness', tier: 2, name: 'Hedge Cloak', cost: 280, needs: 'boots',
    desc: 'Creatures only notice you from five tiles away instead of six and a half. Sneak past the ones you are not ready for.' },
  { id: 'ghost', branch: 'Swiftness', tier: 3, name: "Fogwalker's Step", cost: 550, needs: 'cloak', boss: true,
    desc: 'Another 8% of speed, and anything chasing you gives up after one second out of sight instead of two and a half.' },
  { id: 'sundial', branch: 'Patience', tier: 1, name: 'Candle Clock', cost: 100,
    desc: 'Every question clock runs 20% longer.' },
  { id: 'lichglass', branch: 'Patience', tier: 2, name: 'Brass Water-clock', cost: 260, needs: 'sundial',
    desc: 'Every question clock runs 40% longer (replaces the candle clock\'s 20%).' },
  { id: 'stillness', branch: 'Patience', tier: 3, name: 'Stopped Millwheel', cost: 520, needs: 'lichglass', boss: true,
    desc: 'Every question clock runs 75% longer. Time is a suggestion.' },
  { id: 'shield', branch: 'Ward', tier: 1, name: 'Barrel-lid Shield', cost: 120, charges: 1, recharge: 60,
    desc: 'Absorbs one death. When a wrong answer would kill you, the shield splinters instead: no Lore lost, but the creature stands.', use: 'Recharge at any bonfire.' },
  { id: 'satchel', branch: 'Ward', tier: 2, name: "Waymarker's Pouch", cost: 300, needs: 'shield',
    desc: 'When you die you keep a quarter of the Lore you were carrying. The rest drops where you fell.' },
  { id: 'phoenix', branch: 'Ward', tier: 3, name: 'Dawnember Sigil', cost: 600, needs: 'satchel', boss: true, charges: 1, recharge: 200,
    desc: 'If you die while Lore still lies on the ground, the sigil burns and that Lore joins your new pile instead of vanishing forever.', use: 'Recharge at any bonfire.' },
  { id: 'lantern', branch: 'Insight', tier: 1, name: 'Tallow Lantern', cost: 100,
    desc: 'Reveal a hint during any fight. A fight where you used the lantern is worth three quarters of its Lore.' },
  { id: 'tome', branch: 'Insight', tier: 2, name: 'Road Almanac', cost: 250, needs: 'lantern',
    desc: 'Opens to a fully worked example of the same kind of problem, with different numbers. A fight where you read the almanac is worth half its Lore.' },
  { id: 'sight', branch: 'Insight', tier: 3, name: "Crow's Eye", cost: 500, needs: 'tome', boss: true, charges: 1, recharge: 150,
    desc: 'When a wrong answer would kill you, see the future and take one more attempt at the same question.', use: 'Recharge at any bonfire.' },
  { id: 'blade', branch: 'Greed', tier: 1, name: 'Whetted Sickle', cost: 150,
    desc: 'Every kill is worth 25% more Lore.' },
  { id: 'mark', branch: 'Greed', tier: 2, name: "Poacher's Tally", cost: 350, needs: 'blade',
    desc: 'Progressing and Mastery creatures are worth 50% more Lore on top of the blade.' },
  { id: 'crown', branch: 'Greed', tier: 3, name: 'Briar Crown', cost: 700, needs: 'mark', boss: true,
    desc: 'Bosses are worth double. Your win streak now adds 10% per kill (up to +100%) instead of 5% (up to +50%).' },
  /* Regalia: cosmetic only. Nothing here helps in a fight; it changes how your hero is shown. */
  { id: 'frame_ember', branch: 'Regalia', tier: 1, name: 'Copper Wayframe', cost: 150, cosmetic: true, frame: 'ember',
    desc: 'Your portrait is set in a frame of hammered copper that glows like coals.' },
  { id: 'frame_lore', branch: 'Regalia', tier: 2, name: 'Lamplit Frame', cost: 350, cosmetic: true, frame: 'lore',
    desc: 'Your portrait is hung with little lamps from Old Wick\'s shrine, burning the pale blue of banked Lore.' },
  { id: 'frame_gold', branch: 'Regalia', tier: 3, name: 'Bonegilt Frame', cost: 800, cosmetic: true, frame: 'gold', boss: true,
    desc: 'Gold set with carved bone and antler: the prize of a slain boss. Needs a boss kill.' }
];

/* The keepers of every bonfire on the road west. Each greets the hero with one of their lines when their page opens.
 * Tamsin Coalbrook, the road-smith: apprenticed in the Hollowdeep Mines until the deep shafts went quiet; now hauls her forge on a
 *   wagon behind a mule called Ingot, hammering scrap into gear for anyone walking toward Lorebound (the Cart Forge).
 * Old Wick, the lamplighter: has lit the lanterns along the road for longer than anyone remembers; blind, he sees people by the Lore
 *   they carry, and lights a lamp of Legacy for each hero (the Lamp Shrine, a waystone ringed with lanterns).
 * Nettle, the peddler: carries her whole shop on her back in a pack of a hundred little drawers, taller than she is; claims to have
 *   walked to Lorebound and back three times (Nettle's Pack, set down on a milestone by the fire). */
var KEEPERS = {
  gear: { name: 'Tamsin', role: 'the road-smith', lines: [
    'Measure twice, hammer once. Then check your units.',
    'I learned the trade a mile under the Hollowdeep. Up here, at least the sparks have somewhere to go.',
    'Ingot does not like the road either. Pay me, not the mule.',
    'Every edge I make runs straight from tip to hilt. The shortest distance between two points, as it should be.'] },
  level: { name: 'Old Wick', role: 'the lamplighter', lines: [
    'I cannot see your face, child, but I can see your Lore. It flickers like a candle in a draught.',
    'Every lamp on this road is someone who kept going. Yours is waiting for a flame.',
    'Lore you carry can be lost. Lore you give the lamp stays lit.',
    'Sixty years of lighting lamps, and I have never once lost count. Count with me.'] },
  shop: { name: 'Nettle', role: 'the peddler', lines: [
    'A hundred drawers, and I know what is in every one. Do not touch the drawer that hums.',
    'Three times to Lorebound and back, and I still sell Homing Wicks at cost. Nearly at cost.',
    'Exact change, please. I do not round, and I do not cut coins into fractions.',
    'Buy an Owl-glass before the fight, dear, not after it. After is too late.'] }
};

/* Character level: bought with Lore at a bonfire. Every level adds +3% Lore from kills, +3% question time and a little speed. */
var LEVEL = {
  max: 30,
  cost: function (lv) { return 60 * lv + 15 * lv * lv; },          // Lore to go from level lv to lv + 1
  lorePct: 3, timePct: 3, speed: 1,
  titles: [[1, 'Wanderer'], [5, 'Delver'], [10, 'Pathfinder'], [15, 'Warden of the Lands'], [20, 'Lorekeeper'], [25, 'Mythic']],
  crown: 'Lord of Lore',                                           // above every rung: earned by slaying the final boss, at any level
  gate: { 2: 3, 3: 6 }                                             // gear tier -> level required
};

/* Consumables: found in chests, bought at the bonfire (Provisions), carried in the Satchel. */
var ITEMS = [
  { id: 'hourglass', name: 'Slow Sand', cost: 60, where: 'battle', weight: 25, art: 'item-hourglass',
    desc: 'Pour it out during a fight: +60 seconds on the clock.', flavor: 'Sand from the bottom of the Salt Wastes. It has never once been in a hurry.' },
  { id: 'lens', name: 'Owl-glass', cost: 90, where: 'battle', weight: 20, art: 'item-lens',
    desc: 'Hold it to the question in front of you: a hint, with no cost to the Lore you earn.', flavor: 'An old owl looked through it for forty years. Some of the owl stayed in the glass.' },
  { id: 'smoke', name: 'Chaff Bomb', cost: 70, where: 'world', weight: 20, art: 'item-smoke',
    desc: 'Crush it in a land: everything chasing you loses you at once and stays blind for a few seconds.', flavor: 'Chaff and ash from the Hollow Fields, tied tight. One crush and the air is full of harvest.' },
  { id: 'draught', name: 'Quench Tonic', cost: 150, where: 'auto', weight: 15, art: 'item-draught',
    desc: 'Carried into a fight, it is drunk the instant a wrong answer would kill you: you survive, keep your Lore, and the creature stands. One use.', flavor: 'Tamsin brews it in her quenching bucket. It tastes like a hot horseshoe, and it is drunk whether you want it or not.' },
  { id: 'wisp', name: 'Firefly Jar', cost: 120, where: 'world', weight: 12, art: 'item-wisp',
    desc: 'Open it in a land: the fireflies fly the whole labyrinth and draw every path on your minimap.', flavor: 'They light every turn of the labyrinth for you, then wander home.' },
  { id: 'homeward', name: 'Homing Wick', cost: 120, where: 'world', weight: 10, art: 'item-homeward',
    desc: 'Blow on it in any land and it carries you back to that land\'s bonfire, with every scrap of your Lore.', flavor: 'A wick from one of Old Wick\'s lamps. It always finds its way back to the fire. Nettle swears every one is her last.' },
  { id: 'cinder', name: 'Last-light Cinder', cost: 0, where: 'world', weight: 0, permanent: true, art: 'item-cinder',
    desc: 'Crush it in any land to wake at that land\'s bonfire. All the Lore you carry burns away for good. It never runs out.', flavor: 'Every hero is given one. Most are too proud to use it.' },
  { id: 'feather', name: 'Firecrow Feather', cost: 200, where: 'auto', weight: 8, art: 'item-feather',
    desc: 'If you die while Lore already lies on the ground, the feather burns instead of that Lore: it joins your new pile. One use.', flavor: 'Dropped by a crow that flew too close to a bonfire. Still warm.' }
];

/* What a chest holds is fixed per chest (same for every student) but unknown until opened. */
var CHEST_ODDS = { lore: 50, item: 32, trap: 18 };
var TRAPS = [
  { id: 'mimic', weight: 40, name: 'Mimic', desc: 'The chest has teeth.' },
  { id: 'leech', weight: 35, name: 'Lore-leech', desc: 'Black moths pour out and eat part of your Lore.' },
  { id: 'alarm', weight: 25, name: 'Alarm', desc: 'A shriek. Everything nearby knows where you are.' }
];

/* Hero classes. Each has one small edge (perk; applied in game.js): Knight 10% to survive a wrong answer, Sorcerer 20% to be
 * shown the hint for free, Ranger 50% more time on the clock, Rogue accepts the right value in the wrong form. Portraits: hero-<class>-<stage>.jpg. Overworld sprites: hero:<class> once its painted sheet is packed; until then the ranger and rogue borrow the knight's. Stage 1 at the start; stage 2 once any tier-2 gear is owned; stage 3 once tier-3 gear is owned and a boss is slain. */
var CLASSES = [
  { id: 'knight', name: 'Squire', blurb: 'A dented helm, a quilted coat and a sword that is mostly a promise. Starts as a farm-road squire; ends as a knight-errant with an ember-lit blade.', stages: ['Squire', 'Sworn Squire', 'Knight-Errant'], perk: 'A shield that parries: a 1 in 10 chance that a killing blow (a wrong answer or the clock) is turned aside and does not kill you.' },
  { id: 'sorcerer', name: 'Apprentice', blurb: 'A borrowed robe, a crooked stick and a single spark. Starts as a hedge apprentice; ends as a journeyman mage with runes circling one hand.', stages: ['Apprentice', 'Hedge Adept', 'Journeyman Mage'], perk: 'Quick study: a 1 in 5 chance that the hint for a question appears on its own, free.' },
  { id: 'ranger', name: 'Bandit', blurb: 'A scarf over the face, a short bow and nothing to lose. Starts as a hedge-row bandit; ends as an outlaw captain whose arrows glow.', stages: ['Bandit', 'Hedge Bandit', 'Outlaw Captain'], perk: 'Patient aim: 50% more time on the clock for every question.' },
  { id: 'rogue', name: 'Vagabond', blurb: 'A holed cloak, a chipped knife and quick hands. Starts as a road vagabond; ends as a shadow with twin daggers that glint violet.', stages: ['Vagabond', 'Road Vagabond', 'Shadow Vagabond'], perk: 'A kill is a kill: the right value counts even when it is written in the wrong form.' }
];
if (typeof module !== 'undefined') module.exports = { LEVELS: LEVELS, LANDS: LANDS, GEAR: GEAR, CLASSES: CLASSES, LEVEL: LEVEL, ITEMS: ITEMS, CHEST_ODDS: CHEST_ODDS, TRAPS: TRAPS };
