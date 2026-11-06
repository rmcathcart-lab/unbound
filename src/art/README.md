# Lorebound art

Every painted image in the game, at full resolution, named exactly as the game uses it. Portraits are 1088×1456, land banners 1680×944, items and the bonfire 1264×1264. All were generated in Canva (links below).

## Brief for making overworld sprites from these pictures

The game's overworld is top-down, about 3/4 view, 16-px tiles. A creature on screen is roughly 1.5–2 tiles tall. For each creature below, make a sprite sheet **based on its portrait** (same creature, same colours and silhouette), in the same format as the fantasy starter pack:

- `sheets/<file name without .jpg>.png`: transparent background, 4 rows × 6 frames: **idle, walk, attack, death**. The last death frame is the corpse left on the ground.
- `metadata/<same name>.json`: `frames` (each with `rect` {x,y,w,h} and `anchor` {x,y} = the point on the ground between the feet), `animations` (idle/walk/attack/death with frame lists and fps), and `suggestedDisplayScale` (0.5 = the size of the knight; 0.4 small creature; 0.75 large; bosses 1.0–1.2).
- Facing south-east; the game mirrors it for west.
- Painterly dark-fantasy style that matches the portraits: muted, desaturated, one accent colour per land.

**Painted terrain sets** (one per land, based on its banner): seamless 16-px-grid ground tiles (3–4 variants), a path tile, water/lava (2–4 animation frames), and the impassable edge (thicket, rock, wall) as tiles that join up, plus 6–10 standalone props (like `world_props.png`). Same JSON atlas style as the props.

## Lands, creatures and file names

### L1 · Barrow Marches
Banner: `title.jpg` — swampy barrow-field of graves, fog and dead trees.  https://www.canva.com/M/MAHWoIlcKmE

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `rat.jpg` | Bone Rat | Beginning | pixel placeholder | https://www.canva.com/M/MAHWoM4IsKs |
| `skeleton.jpg` | Gravedigger | Progressing | pixel placeholder | https://www.canva.com/M/MAHWoD19qJk |
| `wight.jpg` | Wight Lord | Mastery | pixel placeholder | https://www.canva.com/M/MAHWoEkYVjU |
| `wisp.jpg` | Marsh Wisp | Beginning | pixel placeholder | https://www.canva.com/M/MAHWoDpBjDI |
| `knight.jpg` | Hollow Knight | Progressing | HD skeleton (stand-in) | https://www.canva.com/M/MAHWoG8ZePw |
| `lich.jpg` | Barrow Lich | Mastery | pixel placeholder | https://www.canva.com/M/MAHWoHl-kBs |
| `boss.jpg` | Vessarion, Archlich of the Marches (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHWoAXEsMs |

### L2 · Ember Peaks
Banner: `banner-l2.jpg` — volcanic ash slopes, cooled lava rock, lava pools.  https://www.canva.com/M/MAHWyZDZmXk

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `imp.jpg` | Cinder Imp | Beginning | pixel placeholder | https://www.canva.com/M/MAHWydMw6qM |
| `hound.jpg` | Magma Hound | Progressing | pixel placeholder | https://www.canva.com/M/MAHWydQewEY |
| `wyrm.jpg` | Ash Wyrm | Mastery | pixel placeholder | https://www.canva.com/M/MAHWycMB8NU |
| `sprite.jpg` | Ember Sprite | Beginning | pixel placeholder | https://www.canva.com/M/MAHWye5qYuA |
| `golem.jpg` | Obsidian Golem | Progressing | pixel placeholder | https://www.canva.com/M/MAHWyaZ-Fy0 |
| `drake.jpg` | Pyroclast Drake | Mastery | pixel placeholder | https://www.canva.com/M/MAHWyTxm-Kg |
| `boss2.jpg` | Ignathar, the Furnace King (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHWyeA0_Bw |

### L3 · Whispering Weald
Banner: `banner-l3.jpg` — dark old-growth forest, moss, roots, thickets.  https://www.canva.com/M/MAHWzaagKh4

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `thornling.jpg` | Thornling | Beginning | pixel placeholder | https://www.canva.com/M/MAHWzYfu1y4 |
| `mosswight.jpg` | Moss Wight | Progressing | pixel placeholder | https://www.canva.com/M/MAHWzfASTJU |
| `treant.jpg` | Elder Treant | Mastery | pixel placeholder | https://www.canva.com/M/MAHWzX49lXg |
| `barksprite.jpg` | Bark Sprite | Beginning | HD goblin (stand-in) | https://www.canva.com/M/MAHWzQ7dA7s |
| `shade.jpg` | Weald Shade | Progressing | pixel placeholder | https://www.canva.com/M/MAHWzTYOSyk |
| `rootbound.jpg` | Rootbound Horror | Mastery | HD troll (stand-in) | https://www.canva.com/M/MAHWzXctAG4 |
| `boss3.jpg` | The Hollow Oak (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHWzReucXk |

### L4 · Shattered Crypts
Banner: `banner-l4.jpg` — underground crypt: flagstone floors, broken walls, bone piles, pits.  https://www.canva.com/M/MAHWzZaUKNw

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `scarab.jpg` | Bone Scarab | Beginning | pixel placeholder | https://www.canva.com/M/MAHWzTnFngk |
| `ghoul.jpg` | Crypt Ghoul | Progressing | pixel placeholder | https://www.canva.com/M/MAHWzfwBpQE |
| `reliquary.jpg` | Living Reliquary | Mastery | pixel placeholder | https://www.canva.com/M/MAHWzdqPiy4 |
| `spider.jpg` | Tomb Spider | Beginning | pixel placeholder | https://www.canva.com/M/MAHWzcq2VyI |
| `cryptknight.jpg` | Crypt Knight | Progressing | HD skeleton (stand-in) | https://www.canva.com/M/MAHWzXbSe1g |
| `sentinel.jpg` | Ossuary Sentinel | Mastery | pixel placeholder | https://www.canva.com/M/MAHWzZBWBd0 |
| `boss4.jpg` | Vaultkeeper Ossirion (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHWzWRjcIE |

### L5 · Mirrorfen
Banner: `banner-l5.jpg` — still, glassy fen: reflective black water, reeds, pale mist.  https://www.canva.com/M/MAHW6MJFTCw

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `toad.jpg` | Fen Toad | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6El5Dsk |
| `heron.jpg` | Mirror Heron | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6DQbRfs |
| `naga.jpg` | Glass Naga | Mastery | pixel placeholder | https://www.canva.com/M/MAHW6MVQB5Y |
| `lantern.jpg` | Bog Lantern | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6FkUxxA |
| `wraith.jpg` | Reflection Wraith | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6CRtjis |
| `hydra.jpg` | Fen Hydra | Mastery | pixel placeholder | https://www.canva.com/M/MAHW6DjhMRw |
| `boss5.jpg` | Ilyra, the Mirror Queen (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHW6Msu9M0 |

### L6 · The Drowned Causeway
Banner: `banner-l6.jpg` — sunken stone causeway, tidal water, wet rock, kelp, wreckage.  https://www.canva.com/M/MAHW6NhJpmQ

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `crab.jpg` | Tide Crab | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6DWWP0A |
| `sailor.jpg` | Drowned Sailor | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6J4d960 |
| `kraken.jpg` | Kelp Kraken | Mastery | pixel placeholder | https://www.canva.com/M/MAHW6KOCOo4 |
| `harpy.jpg` | Gull Harpy | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6Oxsj2c |
| `brineknight.jpg` | Brine Knight | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6Pyrqss |
| `siren.jpg` | Abyssal Siren | Mastery | pixel placeholder | https://www.canva.com/M/MAHW6JrOjnQ |
| `boss6.jpg` | Admiral Veyle, the Drowned (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHW6MC8Yds |

### L7 · Slopes of Thornhold
Banner: `banner-l7.jpg` — thorny highland slopes, briar thickets, fortress ruins.  https://www.canva.com/M/MAHW6HdK_Hk

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `goat.jpg` | Thorn Goat | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6IujnCM |
| `holdsentry.jpg` | Hold Sentry | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6Oazd8E |
| `briargolem.jpg` | Briar Golem | Mastery | HD troll (stand-in) | https://www.canva.com/M/MAHW6PcCsa8 |
| `raven.jpg` | Hill Raven | Beginning | pixel placeholder | https://www.canva.com/M/MAHW6LsdLfM |
| `archer.jpg` | Thornhold Archer | Progressing | pixel placeholder | https://www.canva.com/M/MAHW6PsD9dM |
| `warden.jpg` | Warden of the Pass | Mastery | pixel placeholder | https://www.canva.com/M/MAHW6NjHIbc |
| `boss7.jpg` | Lord Bramblehart of Thornhold (boss) | BOSS | pixel placeholder | https://www.canva.com/M/MAHW6FKQGcA |

### L8 · Twin Citadels
Banner: `banner-l8.jpg` — two dark citadels on facing cliffs, joined by one bridge over a misty chasm; banners, battlements, bare rock.  https://www.canva.com/M/MAHW__9cMrE

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `gatewarden.jpg` | Gate Warden | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_2G-XXM |
| `sapper.jpg` | Siege Sapper | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_1qqoKg |
| `twinblade.jpg` | Twinblade Paladin | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_-KBRWE |
| `messenger.jpg` | Banner Messenger | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_5tyAVE |
| `quartermaster.jpg` | The Quartermaster | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_8QuCu8 |
| `siegegolem.jpg` | Siege Golem | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_6SihLk |
| `boss8.jpg` | Aurel and Vaun, the Twin Kings (boss) | BOSS | painted (cr-) | https://www.canva.com/M/MAHW_--_1r4 |

### L9 · Sundered Spire
Banner: `banner-l9.jpg` — a tower split in two by lightning, high above a sea of cloud; carved stone, brass astronomical fittings, storm sky.  https://www.canva.com/M/MAHW_-oaA9Y

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `gargoyle.jpg` | Spire Gargoyle | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_6nVeIQ |
| `stairwarden.jpg` | Stair Warden | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_5U0D8s |
| `stormwyvern.jpg` | Storm Wyvern | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_5KKAEM |
| `stormwisp.jpg` | Storm Wisp | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_xqXerM |
| `astrolabe.jpg` | Astrolabe Construct | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_9lArts |
| `skyseer.jpg` | The Skyseer | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_2-L9TU |
| `boss9.jpg` | Orrin, the Sundered Astronomer (boss) | BOSS | painted (cr-) | https://www.canva.com/M/MAHW_yS69FQ |

### L10 · The Frozen Reach
Banner: `banner-l10.jpg` — frozen tundra under an aurora: snowfields, a frozen sea, stone cairns, ice crags, a lone peak.  https://www.canva.com/M/MAHW_3V6P9s

| file | creature | level | overworld sprite now | Canva |
|---|---|---|---|---|
| `rimewolf.jpg` | Rime Wolf | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_7bVi14 |
| `icetrapper.jpg` | Ice Trapper | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_1mFAm8 |
| `glacierwight.jpg` | Glacier Wight | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_2GYuLc |
| `frostmite.jpg` | Frost Mite | Beginning | painted (cr-) | https://www.canva.com/M/MAHW_8ubnC8 |
| `cairnkeeper.jpg` | Cairn Keeper | Progressing | painted (cr-) | https://www.canva.com/M/MAHW_2N7Kk8 |
| `icecolossus.jpg` | Ice Colossus | Mastery | painted (cr-) | https://www.canva.com/M/MAHW_9N5EkY |
| `boss10.jpg` | Hjalmvor, the Winter Wyrm (boss) | BOSS | painted (cr-) | https://www.canva.com/M/MAHW_3p3Ntc |

### Hero, bonfire, title, map and items

| file | what | Canva |
|---|---|---|
| `hero-knight-1.jpg` | Knight, stage 1 | https://www.canva.com/M/MAHWyE538DY |
| `hero-knight-2.jpg` | Knight, stage 2 | https://www.canva.com/M/MAHWyJz9AXM |
| `hero-knight-3.jpg` | Knight, stage 3 | https://www.canva.com/M/MAHWyLh0A4A |
| `hero-sorcerer-1.jpg` | Sorcerer, stage 1 | https://www.canva.com/M/MAHWyEPv1Ek |
| `hero-sorcerer-2.jpg` | Sorcerer, stage 2 | https://www.canva.com/M/MAHWyH21avw |
| `hero-sorcerer-3.jpg` | Sorcerer, stage 3 | https://www.canva.com/M/MAHWyJ2z4TM |
| `hero-ranger-1.jpg` | Ranger, stage 1 (Wayfarer) | https://www.canva.com/M/MAHXBbxH6oo |
| `hero-ranger-2.jpg` | Ranger, stage 2 (Warden of the Weald) | https://www.canva.com/M/MAHXBUWkUG4 |
| `hero-ranger-3.jpg` | Ranger, stage 3 (Lorebound Huntmaster) | https://www.canva.com/M/MAHXBQU9-28 |
| `hero-rogue-1.jpg` | Rogue, stage 1 (Cutpurse) | https://www.canva.com/M/MAHXBUaBtrA |
| `hero-rogue-2.jpg` | Rogue, stage 2 (Shadowblade) | https://www.canva.com/M/MAHXBcFS2Fo |
| `hero-rogue-3.jpg` | Rogue, stage 3 (Nightglass Phantom) | https://www.canva.com/M/MAHXBWujlGo |
| `fire.jpg` | Bonfire | https://www.canva.com/M/MAHWoEr4MBg |
| `title.jpg` | Title screen / Land 1 banner | https://www.canva.com/M/MAHWoIlcKmE |
| `item-hourglass.jpg` | Hourglass Shard | https://www.canva.com/M/MAHW5YWTxCc |
| `item-lens.jpg` | Scholar's Lens | https://www.canva.com/M/MAHW5UyW82U |
| `item-smoke.jpg` | Smoke Pellet | https://www.canva.com/M/MAHW5SM08x0 |
| `item-draught.jpg` | Ember Draught | https://www.canva.com/M/MAHW5b5tJ4s |
| `item-wisp.jpg` | Wisp in a Jar | https://www.canva.com/M/MAHW5S8vbjo |
| `item-feather.jpg` | Phoenix Feather | https://www.canva.com/M/MAHW5fOmEzk |

### Hero sprites (cr-hero-<class>-<stage>.webp)
Ryan's "Lorebound Hero Sprites, All Classes" pack (ChatGPT/Codex, from the 12 portraits in `Lorebound Game/Hero sprites - all classes/`), packed with `python3 tools/pack_creatures.py <pack> 96 400 80 --merge`. The high cap (400) keeps all three stages of a class at the same scale even when a staff or halo makes a stage taller. The game picks the sheet for the hero's class and current stage (SP.heroActorId).

### Bonfire camp tiles and UI icons

| file | what | Canva |
|---|---|---|
| `camp-forge.jpg` | The Forge (blacksmith) | https://www.canva.com/M/MAHXBEkCyMQ |
| `camp-legacy.jpg` | Imbue Lore into Legacy (the mathematician guide) | https://www.canva.com/M/MAHXBP9jD4M |
| `camp-merchant.jpg` | The Merchant (shack and merchant) | https://www.canva.com/M/MAHXBEVYk0o |
| `camp-lorebook.jpg` | Lorebook | https://www.canva.com/M/MAHXBGMAXwM |
| `camp-bestiary.jpg` | Bestiary (trophy hall) | https://www.canva.com/M/MAHXBCGpA7I |
| `camp-chronicle.jpg` | Chronicle (scroll and war table) | https://www.canva.com/M/MAHXBNLYzis |
| `camp-rules.jpg` | Rules (rune monolith) | https://www.canva.com/M/MAHXBPj3pDg |
| `ui-sound-on.png`, `ui-sound-off.png` | Bronze handbell sound toggle (ChatGPT "Sound Toggle Icons" pack, 64-px exports) | — |

## Pixel sheets (CC0)

| file | source |
|---|---|
| `sheet-dt.png` | 0x72 16x16 DungeonTileset II v1.7 — https://0x72.itch.io/dungeontileset-ii |
| `sheet-kenney.png` | Kenney Roguelike/RPG pack — https://kenney.nl/assets/roguelike-rpg-pack |

## HD painted sprites (sheet-hd.webp, sheet-hdprops.webp)
Made by Ryan with ChatGPT ("fantasy starter pack": knight, wizard, skeleton, goblin, troll, 16 world props), packed by `tools/pack_hd.py <pack folder> [extra character names]`.
Used for: the hero (knight / wizard for the Sorcerer), Hollow Knight + Crypt Knight (skeleton), Bark Sprite (goblin), Rootbound Horror + Briar Golem (troll), chests, the bonfire brazier, and props along room edges.

### Format the packer expects for new characters
- `sheets/<name>.png`: transparent PNG, one row per animation: idle ×6, walk ×6, attack ×6, death ×6 (last death frame = the corpse).
- `metadata/<name>.json`: `{ "frames": [{ "name", "rect": {x,y,w,h}, "anchor": {x,y} }...], "animations": { "idle": {"frames":[0..5],"fps":5}, "walk": {...}, "attack": {...}, "death": {...} }, "suggestedDisplayScale": 0.5 }` — anchor = the point between the feet, in rect coordinates; suggestedDisplayScale 0.5 = knight-sized.
- Facing south-east (the game mirrors it for west).
- Then map the creature id to the sheet name in `HD_CREATURE` (src/sprites.js).


## Lands 8–10 expansion and bonfire shrine
Made by Ryan with ChatGPT/Codex ("Lorebound Lands 8–10 Expansion": 21 creatures, terrain sets l8–l10; "Lorebound Bonfire Sprite": a six-frame bonfire shrine).
- `python3 tools/pack_creatures.py <pack> 96 124 80 --merge` adds them to the existing creature_defs.js.
- `python3 tools/pack_terrain.py <pack> --lands 8,9,10` adds terrain sets without touching L1–L7.
- `python3 tools/pack_fire.py <bonfire pack> 38 5` → `cr-bonfire.webp` + a `bonfire` actor (drawn at every bonfire).

## Painted creature and terrain pack (cr-*.webp, tr-*.webp)
Made by Ryan with ChatGPT/Codex from the portraits and banners above ("Lorebound Creatures and Terrain" pack: 49 creatures × idle/walk/attack/death, 7 terrain sets with 8 props each).
- `tools/pack_creatures.py <pack folder> [Hk] [Hmax] [quality]` → `cr-<sigil>.webp` + `src/creature_defs.js` (trimmed frames, anchors, animation lists). Current build: Hk 96, Hmax 124, quality 80, alpha 55.
- `tools/pack_terrain.py <pack folder>` → `tr-l<N>.webp` (24 painted 64-px tiles: ground ×4, path, liquid ×3, 16 joining edges by N=1/E=2/S=4/W=8 mask) + `tr-l<N>-props.webp` + `src/terrain_defs.js`.
- The hero still uses the starter pack's knight / wizard (`sheet-hd.webp`, `tools/pack_hd.py <starter pack>`); chests and the bonfire brazier come from the starter props.


## Gear art (bonfire Gear section)

| file | Canva |
|---|---|
| `gear-boots.jpg` | https://www.canva.com/M/MAHW_p_Xhjc |
| `gear-cloak.jpg` | https://www.canva.com/M/MAHW_ka8eEM |
| `gear-ghost.jpg` | https://www.canva.com/M/MAHW_qy2EdM |
| `gear-sundial.jpg` | https://www.canva.com/M/MAHW_m6AGsU |
| `gear-lichglass.jpg` | https://www.canva.com/M/MAHW_nJ8qCo |
| `gear-stillness.jpg` | https://www.canva.com/M/MAHW_hYDelY |
| `gear-shield.jpg` | https://www.canva.com/M/MAHW_uABmqY |
| `gear-satchel.jpg` | https://www.canva.com/M/MAHW_mirR1A |
| `gear-phoenix.jpg` | https://www.canva.com/M/MAHW_t8q7bU |
| `gear-lantern.jpg` | https://www.canva.com/M/MAHW_tFa3s0 |
| `gear-tome.jpg` | https://www.canva.com/M/MAHW_jrV-Zo |
| `gear-sight.jpg` | https://www.canva.com/M/MAHW_hMoV5s |
| `gear-blade.jpg` | https://www.canva.com/M/MAHW_n6yICg |
| `gear-mark.jpg` | https://www.canva.com/M/MAHW_v-sE2M |
| `gear-crown.jpg` | https://www.canva.com/M/MAHW_nnI9rY |
| `gear-frame_ember.jpg` | https://www.canva.com/M/MAHW_s10iS0 |
| `gear-frame_lore.jpg` | https://www.canva.com/M/MAHW_uCBhRM |
| `gear-frame_gold.jpg` | https://www.canva.com/M/MAHW_gE7lhk |


### World map (layered)

ChatGPT's layered world map (3840 × 2560 master, one transparent piece per land, exact masks and outlines), packed by
`tools/pack_worldmap.py <extracted pack folder>`:

| file | what |
|---|---|
| `wm-base.webp` | the whole painting at 2400 × 1600, the bottom layer |
| `wm-l1.webp` … `wm-l10.webp` | one transparent layer per land, cut from the same downscaled painting (mask dilated 2 px so no seam shows) |
| `wm-final-boss.webp` | the unnamed western fortress land; always shown grey and sealed |
| `../worldmap_defs.js` | `WM_DEFS`: each layer's box, its label point and a simplified SVG outline used for hovering and clicking |

The old single-image map (`map.jpg`, Canva MAHWokZzOq0) is retired.

### The Purloined Throne (final land)

| file | what | source |
|---|---|---|
| `boss11.jpg` | The Hollow Lord (final boss) portrait | https://www.canva.com/M/MAHXGJjA1fQ |
| `banner-l11.jpg` | The Purloined Throne: lava road to the needle fortress | https://www.canva.com/M/MAHXGL6mIGM |
| `throne-knight.jpg` | victory splash: the Knight on the throne | https://www.canva.com/M/MAHXGAyEjCQ |
| `throne-sorcerer.jpg` | victory splash: the Sorcerer on the throne | https://www.canva.com/M/MAHXGARx51I |
| `throne-ranger.jpg` | victory splash: the Ranger on the throne | https://www.canva.com/M/MAHXGGQheYc |
| `throne-rogue.jpg` | victory splash: the Rogue on the throne | https://www.canva.com/M/MAHXGN1lmQk |

Still to come from ChatGPT (brief in the Mac folder "Final land - The Purloined Throne"): `cr-boss11` (until then the overworld
uses the Archlich as a stand-in), terrain `tr-l11` + props, and the animated `cr-brazier` (braziers on the road appear once it exists).

### Items added later

| file | item | source |
|---|---|---|
| `item-cinder.jpg` | Cinder of Return (permanent, every Satchel) | https://www.canva.com/M/MAHXGBwohao |
| `item-homeward.jpg` | Homeward Ember (Merchant) | https://www.canva.com/M/MAHXGD5xsp0 |
| `ui-satchel-closed.png`, `ui-satchel-open.png` | HUD Satchel button (ChatGPT "Satchel Icons" pack, 64 px) | ChatGPT |

### The Purloined Throne pack (ChatGPT)

Ryan's "Lorebound — The Purloined Throne" pack: `cr-boss11.webp` (The Hollow Lord, `pack_creatures.py <only boss11> 96 150 80 --merge`,
about 79 game px tall), `cr-brazier.webp` (`tools/pack_anim_prop.py <pack> brazier 24 5`, 1.5 tiles, 8 fps; drawn at every brazier
point of BP.L11 with staggered phases), `cr-gate11.webp` (`pack_anim_prop.py <pack> gate11 32 5`, sealed / open, drawn as a y-sorted
sprite on the throne-room gate), `tr-l11.webp` + `tr-l11-props.webp` (`pack_terrain.py <pack> --lands 11`; theme 'throne').
