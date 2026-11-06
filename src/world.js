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
  },
  { id: 'L2', unit: 2, name: 'The Salt Wastes', subject: 'Exponents', open: true, explore: 2, banner: 'banner-l2',
    blurb: 'The bed of a sea that dried up a thousand years ago. What was left behind keeps growing: crystals that double, then double again, until the whole plain glitters with powers. Learn the laws of the salt and cross it.',
    outcomes: { AN3L: 'AN3 · Exponent laws, zero and negative exponents', AN3R: 'AN3 · Scientific notation and rational exponents' },
    creatures: [
      { id: 'saltmite', name: 'Salt Mite', outcome: 'AN3', group: 'AN3L', level: 'BEG', sigil: 'saltmite', gen: 'AN3L_BEG', flavor: 'Every time it moults, it leaves two copies of itself behind. Count them by their exponents; counting them one at a time is how the caravans got lost.' },
      { id: 'strider', name: 'Crust Strider', outcome: 'AN3', group: 'AN3L', level: 'PRG', sigil: 'strider', gen: 'AN3L_PRG', flavor: 'It wades through the salt on legs like stilts, stacking crystal on crystal on its back. Raise a bracket to a power and it raises everything inside.' },
      { id: 'colossus', name: 'Salt Colossus', outcome: 'AN3', group: 'AN3L', level: 'MAS', sigil: 'colossus', gen: 'AN3L_MAS', flavor: 'A giant of fused salt blocks. Whatever it divides it also flips, and it hides one exponent in every question. Find it.' },
      { id: 'scarab', name: 'Glass Scarab', outcome: 'AN3', group: 'AN3R', level: 'BEG', sigil: 'scarab', gen: 'AN3R_BEG', flavor: 'Its shell holds more grains of salt than there are stars. It only ever writes the number one way: something times ten to the something.' },
      { id: 'mirage', name: 'Mirage Wraith', outcome: 'AN3', group: 'AN3R', level: 'PRG', sigil: 'mirage', gen: 'AN3R_PRG', flavor: 'Half there and half not, like an exponent that is half a power and half a root. It shimmers between the two forms and dares you to say which is which.' },
      { id: 'serpent', name: 'Brine Serpent', outcome: 'AN3', group: 'AN3R', level: 'MAS', sigil: 'serpent', gen: 'AN3R_MAS', flavor: 'The last living thing of the old sea, coiled in its last pool. Its scales are fractions, and every one of them is negative.' }
    ],
    boss: { id: 'boss2', name: 'Halora, the Brine Queen', level: 'BOSS', sigil: 'halora', gens: ['AN3L_PRG', 'AN3R_PRG', 'AN3L_MAS', 'AN3R_MAS'], title: 'Saltbreaker',
      flavor: 'She ruled the sea when it was water, and she rules the salt it left. Her crystal palace is sealed until every creature of the Wastes has fallen at least once. Inside: four questions, and four hundred Lore.' }
  },
  { id: 'L3', unit: 3, name: 'The Deep Quarry', subject: 'Polynomial Operations', open: true, explore: 2, banner: 'banner-l3',
    blurb: 'A pit cut terrace by terrace into the mountain, deeper every year, until the stonecutters dug too far and something dug back. Every block here is a term; every wall is a sum of them. Climb down.',
    outcomes: { AN4A: 'AN4 · Terms, like terms, adding, subtracting and multiplying by a monomial', AN4B: 'AN4 · Two binomials, special products and binomial × trinomial' },
    creatures: [
      { id: 'chipling', name: 'Chipling', outcome: 'AN4', group: 'AN4A', level: 'BEG', sigil: 'chipling', gen: 'AN4A_BEG', flavor: 'A heap of chips with a chisel and a grudge. It sorts every stone into piles of the same kind, and bites anyone who mixes them up.' },
      { id: 'mason', name: 'Mason Wight', outcome: 'AN4', group: 'AN4A', level: 'PRG', sigil: 'mason', gen: 'AN4A_PRG', flavor: 'He laid the quarry\'s first wall and never stopped working. He takes a whole row of blocks away in one stroke, and every sign flips when he does.' },
      { id: 'titan', name: 'Slab Titan', outcome: 'AN4', group: 'AN4A', level: 'MAS', sigil: 'titan', gen: 'AN4A_MAS', flavor: 'Stacked from the biggest slabs ever cut here. It multiplies everything it touches, and it remembers the one coefficient you forgot.' },
      { id: 'twinbat', name: 'Twinwing Bat', outcome: 'AN4', group: 'AN4B', level: 'BEG', sigil: 'twinbat', gen: 'AN4B_BEG', flavor: 'Two heads, two shrieks, one hunger. First, Outside, Inside, Last: it bites in that order, every time.' },
      { id: 'crane', name: 'Crane Golem', outcome: 'AN4', group: 'AN4B', level: 'PRG', sigil: 'crane', gen: 'AN4B_PRG', flavor: 'The old lifting crane walked off its post one night. It hauls brackets up and squares them, and it never forgets the middle term.' },
      { id: 'hydra', name: 'Stone Hydra', outcome: 'AN4', group: 'AN4B', level: 'MAS', sigil: 'hydra', gen: 'AN4B_MAS', flavor: 'Three heads on one body, like a trinomial on a binomial. Cut off one and you have to deal with all six products at once.' }
    ],
    boss: { id: 'boss3', name: 'Old Moraine, the Pit Foreman', level: 'BOSS', sigil: 'moraine', gens: ['AN4A_PRG', 'AN4B_PRG', 'AN4A_MAS', 'AN4B_MAS'], title: 'Pitbreaker',
      flavor: 'He ran the quarry for three hundred years and never let a single stone leave without counting it. His gate at the bottom of the pit opens when every creature of the Quarry has fallen at least once. Down there: four questions, and four hundred Lore.' }
  },
  { id: 'L4', unit: 4, name: 'The Hollowdeep Mines', subject: 'Factoring', open: true, explore: 2, banner: 'banner-l4',
    blurb: 'Under the mountain the old miners followed the ore down and down, splitting every vein into the pieces it was made from. Their lanterns still burn in the dark. Find what each seam was multiplied from, and you will find your way through.',
    outcomes: { AN5A: 'AN5 · Common factors and trinomials x² + bx + c', AN5B: 'AN5 · Special products, ax² + bx + c and solving by factoring' },
    creatures: [
      { id: 'glowgrub', name: 'Glowgrub', outcome: 'AN5', group: 'AN5A', level: 'BEG', sigil: 'glowgrub', gen: 'AN5A_BEG', flavor: 'It eats the ore and glows with whatever the ore had in common. Pull the shared part out of every bite and it goes dark.' },
      { id: 'kobold', name: 'Pickhand Kobold', outcome: 'AN5', group: 'AN5A', level: 'PRG', sigil: 'kobold', gen: 'AN5A_PRG', flavor: 'A small miner with a big pick and a bigger temper. It splits every trinomial into two brackets, and it never mixes up a product with a sum.' },
      { id: 'troll', name: 'Deepdelver Troll', outcome: 'AN5', group: 'AN5A', level: 'MAS', sigil: 'troll', gen: 'AN5A_MAS', flavor: 'It carries the lantern of the last miner it met. First it takes out what is common; then it breaks what is left in two. In that order, every time.' },
      { id: 'shardmoth', name: 'Shardmoth', outcome: 'AN5', group: 'AN5B', level: 'BEG', sigil: 'shardmoth', gen: 'AN5B_BEG', flavor: 'Its wings are two perfect squares of crystal with nothing between them. It flutters straight at your lantern.' },
      { id: 'shambler', name: 'Fungal Shambler', outcome: 'AN5', group: 'AN5B', level: 'PRG', sigil: 'shambler', gen: 'AN5B_PRG', flavor: 'Mushrooms grow on it in pairs: always two caps, always the same two. It splits the middle of anything it eats.' },
      { id: 'burrower', name: 'Ironjaw Burrower', outcome: 'AN5', group: 'AN5B', level: 'MAS', sigil: 'burrower', gen: 'AN5B_MAS', flavor: 'It chews through rock until it hits zero, then it stops. Every tunnel it digs ends at a solution.' }
    ],
    boss: { id: 'boss4', name: 'Dask, the Lantern King', level: 'BOSS', sigil: 'dask', gens: ['AN5A_PRG', 'AN5B_PRG', 'AN5A_MAS', 'AN5B_MAS'], title: 'Deepbreaker',
      flavor: 'The first miner, crowned by the last. His lantern holds the only light at the bottom of the mountain, and he will not share it. His crystal hall is sealed until every creature of the Mines has fallen at least once. Inside: four questions, and four hundred Lore.' }
  },
  { id: 'L5', unit: 5, name: "Cogwright's Ruin", subject: 'Relations and Functions', open: true, explore: 2, banner: 'banner-l5',
    blurb: 'A city of brass built by one inventor, who made a machine for everything: put something in, and something comes out. The machines still run, though the city has fallen around them. Learn what each one does to its input.',
    outcomes: { RF2: 'RF1 · RF2 · RF4 · RF5 · Relations: graphs, patterns, intercepts, domain and range', RF8: 'RF1 · RF2 · RF8 · Functions: the function test, function notation and real-world graphs' },
    creatures: [
      { id: 'cogmite', name: 'Cogmite', outcome: 'RF2', group: 'RF2', level: 'BEG', sigil: 'cogmite', gen: 'RF2_BEG', flavor: 'A gear on legs. It scuttles across the workshop floor in perfect grid squares, and it always knows which quadrant it is in.' },
      { id: 'jackal', name: 'Brass Jackal', outcome: 'RF2', group: 'RF2', level: 'PRG', sigil: 'jackal', gen: 'RF2_PRG', flavor: 'It runs its patrol the same way every night, one more lap each time. Tell it where the pattern starts and how much it grows.' },
      { id: 'pknight', name: 'Piston Knight', outcome: 'RF2', group: 'RF2', level: 'MAS', sigil: 'pknight', gen: 'RF2_MAS', flavor: 'The city guard, built to stand at the edges of things. It knows exactly which end of the line it may step on, and which it may not.' },
      { id: 'sparkbottle', name: 'Spark Bottle', outcome: 'RF8', group: 'RF8', level: 'BEG', sigil: 'sparkbottle', gen: 'RF8_BEG', flavor: 'Put a number in the bottle and lightning comes out. One input, one bolt. Never two.' },
      { id: 'mantis', name: 'Clockwork Mantis', outcome: 'RF8', group: 'RF8', level: 'PRG', sigil: 'mantis', gen: 'RF8_PRG', flavor: 'It reads the graph the way it hunts: perfectly still, waiting for the exact input that gives the output it wants.' },
      { id: 'behemoth', name: 'Steam Behemoth', outcome: 'RF8', group: 'RF8', level: 'MAS', sigil: 'behemoth', gen: 'RF8_MAS', flavor: 'The great engine of the city, still keeping its log of every hour: when it climbed, when it fell, and how fast.' }
    ],
    boss: { id: 'boss5', name: 'The Cogwright', level: 'BOSS', sigil: 'cogwright', gens: ['RF2_PRG', 'RF8_PRG', 'RF2_MAS', 'RF8_MAS'], title: 'Gearbreaker',
      flavor: 'The inventor became his own greatest machine, and forgot what he used to be. His workshop at the heart of the Ruin is locked until every creature of the city has fallen at least once. Inside: four questions, and four hundred Lore.' }
  },
  { id: 'L6', unit: 6, name: 'The Sheer Stair', subject: 'Characteristics of Linear Relations', open: true, explore: 2, banner: 'banner-l6',
    blurb: 'A stairway cut into the face of the mountain, switchback over switchback, so steep the builders measured every flight by its rise and its run. Nobody remembers who rang the bell at the top. Climb up and find out.',
    outcomes: { RF3D: 'RF3 · The Pythagorean theorem, length, distance and midpoint', RF3S: 'RF3 · Slope: rise over run, parallel and perpendicular' },
    creatures: [
      { id: 'ledgeling', name: 'Ledgeling', outcome: 'RF3', group: 'RF3D', level: 'BEG', sigil: 'ledgeling', gen: 'RF3D_BEG', flavor: 'A rock lizard that runs straight across and straight up, never on the slant. It knows the length of every ledge by counting its own steps.' },
      { id: 'roc', name: 'Cliff Roc', outcome: 'RF3', group: 'RF3D', level: 'PRG', sigil: 'roc', gen: 'RF3D_PRG', flavor: 'It never flies the stairs. It flies straight from landing to landing, the hypotenuse every time, and it is waiting for you halfway.' },
      { id: 'pilgrim', name: 'Hollow Pilgrim', outcome: 'RF3', group: 'RF3D', level: 'MAS', sigil: 'pilgrim', gen: 'RF3D_MAS', flavor: 'He made it exactly halfway up. Now he stands at the midpoint forever, asking every climber where the other end must be.' },
      { id: 'snail', name: 'Scree Snail', outcome: 'RF3', group: 'RF3S', level: 'BEG', sigil: 'snail', gen: 'RF3S_BEG', flavor: 'It climbs so slowly you can measure its slope: so far up, so far across. Its silver trail is a perfectly straight line.' },
      { id: 'stalker', name: 'Rope Stalker', outcome: 'RF3', group: 'RF3S', level: 'PRG', sigil: 'stalker', gen: 'RF3S_PRG', flavor: 'It strings its ropes between three pitons and checks, every time, that all three lie on one line.' },
      { id: 'yeti', name: 'Avalanche Yeti', outcome: 'RF3', group: 'RF3S', level: 'MAS', sigil: 'yeti', gen: 'RF3S_MAS', flavor: 'It comes down the mountain the fastest way, the steepest slope there is. Its two paths are always parallel, or meet at a right angle.' }
    ],
    boss: { id: 'boss6', name: 'Ysolde of the Summit Bell', level: 'BOSS', sigil: 'ysolde', gens: ['RF3D_PRG', 'RF3S_PRG', 'RF3D_MAS', 'RF3S_MAS'], title: 'Stairbreaker',
      flavor: 'She keeps the bell at the top of the Stair, and rings it once for every climber who makes it. It has not rung in a long time. The summit gate opens when every creature of the Stair has fallen at least once. At the top: four questions, and four hundred Lore.' }
  }
];
/* Lands still to come, shown fogged on the world map until they are built (ids match WM_DEFS regions). */
var LANDS_SOON = { L7: 'The Waystone Hills', L8: 'The Crossroads' };
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
