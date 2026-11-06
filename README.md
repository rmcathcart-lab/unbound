# Lorebound: Unbound

A practice RPG for **Math 15**, and the prequel to [Lorebound](https://github.com/rmcathcart-lab/lorebound) (Math 10C).
Each unit of the course is a land on the road west to Lorebound. Every creature asks one question at one outcome and level
(Beginning, Progressing, Mastery); a wrong answer is a death, and Lore you carry can be lost.

Play: https://rmcathcart-lab.github.io/unbound/ · Teacher's Ledger: https://rmcathcart-lab.github.io/unbound/ledger/

## Lands
| # | Land | Unit | Status |
|---|------|------|--------|
| 1 | The Hollow Fields | Number (AN1, AN2) | built |
| 2–8 | Salt Wastes, Deep Quarry, Hollowdeep Mines, Cogwright's Ruin, Sheer Stair, Waystone Hills, Crossroads | Units 2–8 | on the map, not built yet |

## Building
`python3 build.py` writes `dist/web/` (the page plus `art/`), `dist/unbound.html` and the standalone file.
Question checks: `node tests/test_gens.js 400`. Smoke test: `python3 tests/shot_smoke.py`.

Art: creature portraits, sprite sheets, the land banner, title, terrain textures, props and the world map were generated with
Canva (style references from Lorebound's art) and packed with `tools/pack_sheet.py`, `tools/make_terrain.py` and
`tools/make_worldmap.py`. The engine, heroes, camp, gear and items come from Lorebound. Nothing student-related is ever committed.
