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
      { id: 'hcrow', name: 'Hollow Crow', outcome: 'AN2', level: 'BEG', sigil: 'hcrow', gen: 'AN2_BEG', flavor: 'It pecks at a number until it learns what it is made of. It can taste the difference between rational and not.' },
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
  { id: 'boots', branch: 'Swiftness', tier: 1, name: 'Furrow-strider Boots', cost: 120,
    desc: 'You walk 12% faster in every land. Creatures do not.' },
  { id: 'cloak', branch: 'Swiftness', tier: 2, name: 'Cloak of Reeds', cost: 280, needs: 'boots',
    desc: 'Creatures only notice you from five tiles away instead of six and a half. Sneak past the ones you are not ready for.' },
  { id: 'ghost', branch: 'Swiftness', tier: 3, name: 'Ghost Step', cost: 550, needs: 'cloak', boss: true,
    desc: 'Another 8% of speed, and anything chasing you gives up after one second out of sight instead of two and a half.' },
  { id: 'sundial', branch: 'Patience', tier: 1, name: 'Pocket Sundial', cost: 100,
    desc: 'Every question clock runs 20% longer.' },
  { id: 'lichglass', branch: 'Patience', tier: 2, name: "Lich's Hourglass", cost: 260, needs: 'sundial',
    desc: 'Every question clock runs 40% longer (replaces the sundial\'s 20%).' },
  { id: 'stillness', branch: 'Patience', tier: 3, name: 'Stillness', cost: 520, needs: 'lichglass', boss: true,
    desc: 'Every question clock runs 75% longer. Time is a suggestion.' },
  { id: 'shield', branch: 'Ward', tier: 1, name: 'Bone Shield', cost: 120, charges: 1, recharge: 60,
    desc: 'Absorbs one death. When a wrong answer would kill you, the shield shatters instead: no Lore lost, but the creature stands.', use: 'Recharge at any bonfire.' },
  { id: 'satchel', branch: 'Ward', tier: 2, name: "Lorekeeper's Satchel", cost: 300, needs: 'shield',
    desc: 'When you die you keep a quarter of the Lore you were carrying. The rest drops where you fell.' },
  { id: 'phoenix', branch: 'Ward', tier: 3, name: 'Phoenix Sigil', cost: 600, needs: 'satchel', boss: true, charges: 1, recharge: 200,
    desc: 'If you die while Lore still lies on the ground, the sigil burns and that Lore joins your new pile instead of vanishing forever.', use: 'Recharge at any bonfire.' },
  { id: 'lantern', branch: 'Insight', tier: 1, name: 'Lantern of Hints', cost: 100,
    desc: 'Reveal a hint during any fight. A fight where you used the lantern is worth three quarters of its Lore.' },
  { id: 'tome', branch: 'Insight', tier: 2, name: "Scholar's Tome", cost: 250, needs: 'lantern',
    desc: 'Opens to a fully worked example of the same kind of problem, with different numbers. A fight where you read the tome is worth half its Lore.' },
  { id: 'sight', branch: 'Insight', tier: 3, name: 'Second Sight', cost: 500, needs: 'tome', boss: true, charges: 1, recharge: 150,
    desc: 'When a wrong answer would kill you, see the future and take one more attempt at the same question.', use: 'Recharge at any bonfire.' },
  { id: 'blade', branch: 'Greed', tier: 1, name: 'Runed Blade', cost: 150,
    desc: 'Every kill is worth 25% more Lore.' },
  { id: 'mark', branch: 'Greed', tier: 2, name: "Hunter's Mark", cost: 350, needs: 'blade',
    desc: 'Progressing and Mastery creatures are worth 50% more Lore on top of the blade.' },
  { id: 'crown', branch: 'Greed', tier: 3, name: 'Crown of Ash', cost: 700, needs: 'mark', boss: true,
    desc: 'Bosses are worth double. Your win streak now adds 10% per kill (up to +100%) instead of 5% (up to +50%).' },
  /* Regalia: cosmetic only. Nothing here helps in a fight; it changes how your hero is shown. */
  { id: 'frame_ember', branch: 'Regalia', tier: 1, name: 'Ember-gilt Frame', cost: 150, cosmetic: true, frame: 'ember',
    desc: 'Your portrait is set in a frame of smouldering bronze.' },
  { id: 'frame_lore', branch: 'Regalia', tier: 2, name: 'Lore-light Frame', cost: 350, cosmetic: true, frame: 'lore',
    desc: 'Your portrait glows with the pale blue light of banked Lore.' },
  { id: 'frame_gold', branch: 'Regalia', tier: 3, name: 'Frame of the Archlich', cost: 800, cosmetic: true, frame: 'gold', boss: true,
    desc: 'Gold and bone, torn from the throne of a slain boss. Needs a boss kill.' }
];

/* The keepers of every bonfire. Each greets the hero with one of their lines when their page opens. */
var KEEPERS = {
  gear: { name: 'Bram', role: 'the blacksmith', lines: [
    'Measure twice, forge once. Then measure again, because you rounded.',
    'Steel is only iron that showed its work.',
    'Bring me Lore and I will bring you an edge. Bring me excuses and I will bring you a broom.',
    'Every blade here is balanced like an equation: what comes off one side comes off the other.'] },
  level: { name: 'Odile', role: 'keeper of Legacy', lines: [
    'Every level is a sum you have already paid. I only write down the total.',
    'Lore you carry can be lost. Lore you give to me becomes part of you.',
    'Hold still. The constellations are fussy about their order of operations.',
    'Every Mythic I have known began at level one.'] },
  shop: { name: 'Pell', role: 'the merchant', lines: [
    'Everything is for sale and every price is exact. I do not do estimates.',
    'Homeward Embers! Get them while they last. They always last. I have crates of them.',
    'No refunds, no haggling, no negative numbers.',
    'A wise hero buys a Lens before the fight, not after it.'] }
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
  { id: 'hourglass', name: 'Hourglass Shard', cost: 60, where: 'battle', weight: 25, art: 'item-hourglass',
    desc: 'Turn it over during a fight: +60 seconds on the clock.', flavor: 'Sand from a lich\'s hourglass. It runs slower than it should.' },
  { id: 'lens', name: "Scholar's Lens", cost: 90, where: 'battle', weight: 20, art: 'item-lens',
    desc: 'Hold it to the question in front of you: a hint, with no cost to the Lore you earn.', flavor: 'Ground from the spectacles of a scholar who read the whole Lorebook and understood a third of it.' },
  { id: 'smoke', name: 'Smoke Pellet', cost: 70, where: 'world', weight: 20, art: 'item-smoke',
    desc: 'Crush it in a land: everything chasing you loses you at once and stays blind for a few seconds.', flavor: 'Chaff and ash, wrapped in a dead leaf.' },
  { id: 'draught', name: 'Ember Draught', cost: 150, where: 'auto', weight: 15, art: 'item-draught',
    desc: 'Carried into a fight, it is drunk the instant a wrong answer would kill you: you survive, keep your Lore, and the creature stands. One use.', flavor: 'Bram brews it in his quenching trough. It tastes like a forge, and it is drunk whether you want it or not.' },
  { id: 'wisp', name: 'Wisp in a Jar', cost: 120, where: 'world', weight: 12, art: 'item-wisp',
    desc: 'Open it in a land: the wisp flies the whole labyrinth and draws every path on your minimap.', flavor: 'It is not happy in there. It will be happier out.' },
  { id: 'homeward', name: 'Homeward Ember', cost: 120, where: 'world', weight: 10, art: 'item-homeward',
    desc: 'Breathe on it in any land and it carries you back to that land\'s bonfire, with every scrap of your Lore.', flavor: 'A coal from a bonfire that remembers where it was lit. Pell swears every one is his last.' },
  { id: 'cinder', name: 'Cinder of Return', cost: 0, where: 'world', weight: 0, permanent: true, art: 'item-cinder',
    desc: 'Crush it in any land to wake at that land\'s bonfire. All the Lore you carry burns away for good. It never runs out.', flavor: 'Every hero is given one. Most are too proud to use it.' },
  { id: 'feather', name: 'Phoenix Feather', cost: 200, where: 'auto', weight: 8, art: 'item-feather',
    desc: 'If you die while Lore already lies on the ground, the feather burns instead of that Lore: it joins your new pile. One use.', flavor: 'Still warm.' }
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
  { id: 'knight', name: 'Knight', blurb: 'Steel, patience and a chipped sword. Starts in battered armour; ends in black and gold with a blade of Lore-light.', stages: ['Hollow Knight', 'Ashen Knight', 'Champion of the Fields'], perk: 'A blade that parries: a 1 in 10 chance that a killing blow (a wrong answer or the clock) is turned aside and does not kill you.' },
  { id: 'sorcerer', name: 'Sorcerer', blurb: 'A hood, a crooked staff and a single spark. Starts in threadbare robes; ends as an archmage in a circle of burning numbers.', stages: ['Apprentice', 'Adept of the Road', 'Archmage of Lore'], perk: 'Arcane insight: a 1 in 5 chance that the hint for a question appears on its own, free.' },
  { id: 'ranger', name: 'Ranger', blurb: 'A hood, a plain longbow and a long road. Starts as a ragged wayfarer; ends with a rune-carved bow and arrows of Lore-light.', stages: ['Wayfarer', 'Warden of the Weald', 'Huntmaster of the Road'], perk: 'Patient aim: 50% more time on the clock for every question.' },
  { id: 'rogue', name: 'Rogue', blurb: 'A mask, a knife and quick hands. Starts as a street cutpurse; ends as a phantom whose twin blades burn with Lore-light.', stages: ['Cutpurse', 'Shadowblade', 'Nightglass Phantom'], perk: 'A kill is a kill: the right value counts even when it is written in the wrong form.' }
];
if (typeof module !== 'undefined') module.exports = { LEVELS: LEVELS, LANDS: LANDS, GEAR: GEAR, CLASSES: CLASSES, LEVEL: LEVEL, ITEMS: ITEMS, CHEST_ODDS: CHEST_ODDS, TRAPS: TRAPS };
