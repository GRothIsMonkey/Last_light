# Last Light: Phase 1, the Prologue's Houses (architecture benchmark)

Branch `claude/prologue-house-architecture-benchmark`, from the four-bike benchmark `5f13784dce5605b937bc57622d95a7b0a4cc6035`. Not merged into `main`. **Awaiting creative-director approval (ART-APPROVAL-REGISTER A-51, A-52).** Nothing in the story uses these houses: they appear only with `?houses` in the game, and the production swap waits for approval. Astra's characters and branches were not touched; the bicycles were not changed.

**Evidence and its limits (VISUAL-QA-ACCEPTANCE §1).** This report contains Blender renders (rank 6: offline Cycles, **not the game**), in-game captures from the shipped renderer under **software WebGL** (rank 3: Chromium + ANGLE SwiftShader, **not a GPU**), labelled review-camera captures (rank 4) and automated checks (rank 5). **No real-GPU measurement and no human review has happened yet** (ranks 1–2). Every frame time or cost figure below is a software-renderer figure; no GPU frame rate is claimed.

## 1. What was built

**A reusable house kit** (`tools/blender/houses/`, conventions in [art/HOUSE-KIT.md](art/HOUSE-KIT.md)), built with Blender 5.0.1 (the `bpy` module, headless), that turns any of the game's lot plans into an authored house at three levels of detail:

- **Walls** with real openings and 10 cm reveals; vinyl lap siding with corner boards and a starter course; brick veneer fronts and brick wainscots with rowlock caps and returns; an exposed concrete foundation that runs below grade.
- **Windows** built as windows: a frame inside the reveal, upper and lower sashes on their own tracks, glass recessed 3–9 cm, grilles (6/6, 6/1, 2/2, 1/1) chosen per house and per room, flat or brick-mould casing with a head cap, a sill with horns and an apron, louvred or panel shutters where the palette gives a house shutters, mulled picture windows on ranches. Behind every window there is a **room**: a back wall rendered from a modelled 2011 room (eight rooms: two living rooms, dining room, kitchen, bedroom, a kid's room, a stair hall, a den), side walls, floor and ceiling at true depth (parallax), the inside face of the wall around the opening, and per window curtains (pleated, tinted), blinds at a set height or neither. Rooms light up at dusk on the game's own evening schedule, house by house.
- **Doors**: six-panel, craftsman (panels and three lites) and flush slabs with raised panels, knob, deadbolt and kick plate; aluminium storm doors on some houses; a colonial crosshead; carriage lanterns.
- **Garages**: sectional doors (four sections, joint grooves, raised short panels, top-row lites on some, a dark garage behind them), trim, coach lights, the side service door and window; the car house's garage is a real room (opener rail and light, steel shelving with bins, workbench and pegboard, water heater, steps and door into the house) behind a working door.
- **Porches, stoops, porticos**: framed decks with boards, lattice skirts, painted steps, square or turned posts with bases and caps or craftsman tapered columns on brick piers, 0.9 m railings with balusters at 105 mm, shed roofs with beam, fascia, ceiling, gutter and wall flashing; concrete stoops with iron rails and gabled hoods on brackets; porticos with round columns.
- **Front gables** with a band board at the plate and, on some houses, the gable in an accent tone. **Roofs**: gable (with per-side overhangs, so a garage roof dies into a house wall cleanly) and hip; shingle courses, drip edge, fascia, sloped vented soffits, rake boards and rake soffits, ridge and hip caps, louvred gable vents; **K-style gutters** with end caps on every eave and **downspouts** with offsets, straps, elbows and splash blocks at the corners; brick **chimneys** (exterior with shoulders and weatherings, or interior) with crowns and flues; **dormers** with real windows and rooms on the capes.
- **Life and services**: the electric service bracket exactly where the game's power drop ends on the house (furniture.js), the cable down to the meter, a gas meter, hose bibs with coiled hoses, dryer vents, AC condensers on pads with line sets (where the procedural houses had them), house numbers (invented addresses), coir mats, porch chairs and planters on some porches, and the **driveway hoops the game already has** (read from the real world build: the hoop house's, and the two random ones at lots −21 and 37).
- **One texture library** for every house, synthesized from measurements (no photographs): double-4" vinyl lap siding with butt shadow lines and staggered panel laps, modular brick with 10 mm recessed mortar and per-brick colour, three-tab asphalt shingles with keyways and a granule blend, broom-finished concrete, painted wood; plus the interior atlas. Ten materials, seventeen 1024² textures, shared by all twelve houses; each house's own colours (walls, roof, door, shutters, garage door, trim) ride on the vertices, so the game's canonical palette colours come back exactly.

**Twelve houses on Oak Hollow Drive** (the Phase One area, d −21…530), assembled by that kit from the game's own plans:

| House | Lot | Style | Roof | Entry | Garage | Notes |
|---|---|---|---|---|---|---|
| `house.lotLm21` | left, d −19 | ranch | side gable | porch 7.2 m | — | the first house of the ride, on the left |
| `house.lotRm21` | right, d −20 | front-gable | front gable | porch 6.4 m | single, right | brick wainscot, interior chimney, shutters, **driveway hoop** |
| `house.lotL8` | left, d 9 | front-gable | front gable | porch 6.9 m | single | brick wainscot, exterior chimney |
| `house.lotR8` | right, d 9 | colonial | side gable | stoop + hood | double | |
| `house.lotL37` | left, d 40 | cape | side gable, 3 dormers | stoop | single | interior chimney, shutters |
| `house.lotR37` | right, d 39 | cape | side gable, 3 dormers | stoop | single | **driveway hoop** |
| `house.lotL66` | left, d 69 | colonial | side gable | porch 7.0 m | single | interior chimney, shutters |
| `house.lotR66` | right, d 67 | front-gable | front gable | porch 6.3 m | double | brick wainscot |
| `house.hoop` | left, d 153 | ranch | **hip**, over house and garage | stoop | double | **the hoop house**: full brick front, the kid's hoop |
| `house.lotR153` | right, d 154 | ranch | side gable | stoop | single | across from the hoop house |
| `house.car` | left, d 522 | colonial | side gable | porch 6.9 m | double, **working door** | **the car house** (story): brick wainscot, exterior chimney, shutters, the garage the van parks in |
| `house.lotR530` | right, d 531 | front-gable | front gable | porch 6.3 m | single | across from the car house; brick wainscot, shutters |

All four architectural families are represented (3 ranch, 3 colonial, 2 cape, 4 front-gable), on hip, side-gable and front-gable roofs, with porches, porticos and stoops, single and double garages, brick and siding.

**What the plan fixes, and is kept exactly** (checked, §5): the lot and setback, the footprint, the front door and the porch floor height (the walkable pads), the porch width and depth and the number of steps (the riding obstacle ends at `stepFront + 0.3`), the garage side, width and front line, the car house's door size, the hoops, every palette colour, brick use, chimney type, dormer count, the AC and the service-drop point. **What the kit changes, on purpose** (A-52): roof pitches follow the style guide (colonial 7/12, front-gable 8/12, ranch 5/12, cape as planned), windows are placed by rooms, and ranch garages sit under the house's own roof at full depth; capes, colonials and front-gables get a lower garage roof that dies into the house wall.

## 2. How (one art team, one kit)

```
dist/houses.js planLots  →  tools/assets/house-plans.mjs  →  tools/blender/houses/plans.json
house_textures.py (library) · interior_atlas.py (rooms, Cycles) · build_houses.py (12 houses × 3 LODs, ≈ 6 s)
→  assets/source/house/prologue/house.prologue.blend  →  dist/assets/house/house.prologue.glb (ll_export.py)
→  validate-glb.mjs --profile house  →  dist/house-assets.js + dist/house-benchmark.js (?houses)
```

- **The game's plans are the source of truth.** `house-plans.mjs` runs the game's own planner (and, for the hoops, the game's own world build) for the lots listed in `dist/house-lots.js`, the one list both the game and the Blender build read.
- **One kit, one library.** Every house is assembled by the same functions; the four styles differ by rules (pitch, window types, porch kind, garage roof), not by separate models. Each house's components are batched per material (one mesh per house per LOD, up to ten primitives).
- **Three LODs**: LOD0 full; LOD1 one glass plane, flat room cards 0.45 m deep, rails without balusters, no small props; LOD2 massing with window cards. Switched per house by camera distance (48 m / 115 m, with hysteresis).
- **In the game** (`house-assets.js`): each house is placed exactly as the procedural house is (`P.toWorld`, `P.worldRot`; checked against the plan at the footprint corners) and **every vertex is draped** onto the terrain under it (the same 1 m grid world.js uses), so nothing floats or sinks on a sloping lot. One shadow caster per house (its LOD1 shell, position only, on the shadow layer), like the world's own shadow proxies. Glass is a dark tinted pane that turns into a reflection of the sky at grazing angles (Fresnel), over the room behind it. The house materials get the bike benchmark's scoped golden-hour environment (A-47), following the hemisphere light as the evening falls; without it three.js darkens semi-gloss paint and vinyl at grazing angles. Rooms and porch lights follow the procedural windows' own schedule (`glassLit` uniforms `uP`, `uNight`, `uDim`), staggered house by house.
- **Comparison**: with `?houses`, `world.js` bakes these twelve lots' procedural architecture into batches and shadow proxies of their own (the yard — beds, decks, walks — stays with the street), so **H** swaps authored and procedural in the same frame, from the same camera. **G** forces a LOD, **V** forces the rooms' lamps on/off. Without `?houses` nothing changes (§6).
- **Story pieces kept working**: the car house's working garage door is the authored door, hung under the very group `world.js` animates (the van still comes home and the door still opens and closes); the procedural slab and the live garage footing are hidden in authored mode. The hoop house's hoop is on the plan's board and rim, where the kid shoots.

## 3. Measured

### 3.1 The file (`node tools/assets/validate-glb.mjs dist/assets/house/house.prologue.glb --profile house`; `docs/qa/houses-phase1/validate-house.prologue.json`)

| House | Role | LOD0 | LOD1 | LOD2 |
|---|---|---|---|---|
| `house.car` | story | 9,033 (+300 door) | 3,455 (+36) | 621 (+4) |
| `house.hoop` | story | 4,474 | 2,327 | 375 |
| `house.lotL66` | ordinary | 9,001 | 3,613 | 617 |
| `house.lotRm21` | ordinary | 7,977 | 3,411 | 597 |
| `house.lotR530` | ordinary | 7,393 | 3,247 | 575 |
| `house.lotR66` | ordinary | 7,016 | 2,968 | 569 |
| `house.lotR8` | ordinary | 6,237 | 3,368 | 580 |
| `house.lotL8` | ordinary | 6,132 | 3,000 | 609 |
| `house.lotL37` | ordinary | 6,121 | 3,002 | 652 |
| `house.lotLm21` | ordinary | 5,116 | 2,115 | 441 |
| `house.lotR37` | ordinary | 4,857 | 2,656 | 604 |
| `house.lotR153` | ordinary | 4,480 | 2,177 | 375 |
| **All twelve houses** | | **77,837** | **35,339** | **6,615** |

(The car house's working garage door is a separate node: 300 / 36 / 4 triangles.) **0 errors**; Khronos glTF Validator 2.0.0-dev.3.10: **0 errors**, 126 warnings, all `MESH_PRIMITIVE_GENERATED_TANGENT_SPACE` (tangents are deliberately not exported: §7). File **18,798,284 bytes** (7.5 MB of it textures); 120,131 triangles and 235,135 vertices over all LODs; 10 materials; 17 textures at 1024², estimated **≈ 91 MB GPU** if all are resident uncompressed (RGBA8 + mips; KTX2, L-7, would cut it several times), shared by every house.

**Against the budgets** (Asset plan §9): every ordinary house is inside the 6–10k background budget or below it (4.5–9.0k); LOD1 2.1–3.6k (one house 3% above the 3.5k warning target), LOD2 0.4–0.65k. **The two story houses are well under the 20–35k story budget** (9.3k and 4.5k): their detail is in construction (reveals, sashes, trims, rooms behind glass), not in polygon density. There is room to add (modelled shingle courses on story roofs, crown mouldings, a second porch light) if the review asks for more.

### 3.2 In the browser (`node tests/house-browser.mjs` → **25 passed, 0 failed**; software WebGL)

| Check | Result |
|---|---|
| Without `?houses` | none of `house-assets.js`, `house-benchmark.js` or the GLB is fetched; no benchmark batches exist; no errors |
| Load | twelve houses, no errors; 443 ms in the page (read 130 ms, parse with image decode 194 ms), served, software |
| Placement | every house on its plan: **0.000 mm** error at the footprint corners (all twelve) |
| Street and sidewalk | no authored vertex closer than **10.5 m** to the centre line (the sidewalk ends at 7.85 m) |
| Riding obstacle | every house ends inside the plan's obstacle (front ≤ `stepFront + 0.3`), e.g. the car house 7.11 ≤ 7.71 m |
| Footprints | within the plan's house + garage width plus eaves, chimneys and AC pads |
| Car house | the working garage door is the authored one (3 LODs under the game's panel); it moves 1.36 m with the panel at 80 % open; procedural slab and footing hidden |
| Hoop house | the rim the kid shoots at is the plan's |
| LOD | 77,837 / 35,339 / 6,615 triangles at LOD0 / 1 / 2 for all twelve |
| Riding | 8 s of pedalling from the start: 30.1 m, still riding; after **H** and back, the ride continues |
| `?bikes&houses` | both load (12 houses, 4 bikes); the group ride goes on with the authored bikes past the authored houses |
| Offline package (`PLAYTEST_MODELS=1`) | 80.1 MB; `?houses` places the twelve houses from the embedded bytes with the browser offline, no network request, no errors |
| Default package | 12.6 MB; `?houses` says **FAILED** ("not embedded"), keeps the procedural houses, substitutes nothing |

**Cost in the same frame** (renderer.info, shadows included, software WebGL; authored vs procedural, H):

| Frame | Draw calls | Triangles |
|---|---|---|
| Prologue start, riding camera | 484 vs 462 | 748k vs 766k |
| Start, looking left | 238 vs 230 | 427k vs 430k |
| Start, looking right | 436 vs 428 | 824k vs 826k |
| Street ahead | 490 vs 468 | 763k vs 772k |
| Hoop house | 243 vs 240 | 608k vs 611k |
| Car house | 252 vs 268 | 646k vs 647k |
| Car house and across | 316 vs 322 | 561k vs 562k |
| `?bikes&houses`, group ride | 483 | 773k |

The authored houses cost **−16 to +22 draw calls** and slightly **fewer** triangles than the procedural houses they replace in these frames (LODs; one shadow caster per house). Each house is drawn as up to ten primitives (one per material) per LOD; rooms and porch lights are per-house material clones (same shader program, shared textures) so they can light up one after another.

### 3.3 The world without the flag (`node tests/house-world-check.mjs <accepted dist>`; `docs/qa/houses-phase1/world-bake-check.json`)

Built in Node from the real world builder, against `git archive 5f13784 dist`: **identical** — 2,197 batches, 3,672,619 triangles, the same positions per batch, 2,371,203 shadow-proxy triangles. With `?houses`: the **same triangle set**, only regrouped; twelve lots with batches and shadow proxies of their own; shadow-casting triangles unchanged in total.

## 4. Art review

**Does it rise to the bikes?** At the riding camera and from the sidewalk, yes, clearly more than the procedural houses: windows now have depth (frames, sashes on two tracks, grilles, casings, sills), rooms with furniture, curtains and blinds behind the glass instead of flat brown rectangles; roofs have real overhangs with fascia, soffits, rakes, gutters and downspouts; porches have boards, lattice, posts with bases and caps, balusters; siding shows its courses and laps, brick its mortar. In the same frames (H) the difference is unmistakable at 10–25 m and still visible at 40 m (the shadow lines under eaves and porch roofs, the window reveals).

**Does it feel like one neighbourhood, by one team?** Yes: one kit and one library, the game's own palette and lots. The twelve houses are distinct in silhouette (hip ranch, long side-gable ranches, two-storey colonials, three-dormer capes, tall front-gables), entry (porch, stoop, portico), garage (single, double, under the house roof or its own), material (siding, brick front, brick wainscot), trim (shutters or not, louvred or panel), roof colour and upkeep. Restrained variation in upkeep: some trim and roofs a little faded and chalky, others fresh.

**2011, ordinary, lived in, not decayed.** Vinyl siding, builder colonials, aluminium storm doors, carriage lanterns, AC condensers, meters, hose reels, porch chairs, planters, basketball hoops, a garage with shelving and a water heater. No overt wear, nothing broken, no horror.

**Golden hour.** In Blender the low sun rakes the siding courses and throws porch and eave shadows across the facades; in the game the same houses take the Prologue's sun, shadows and fog, and their rooms come on with the evening.

**Known compromises.**
- Story houses are far below their triangle budget (detail by construction); more can be added on request.
- Interiors are a card plus a room box per window, not furnished rooms: convincing from the street, flat from very close.
- Front-gable houses and colonials get a lower side-gable garage roof even where `houses.js` drew a front-gable one (no valley against the house wall).
- The procedural yard (shrub beds, back decks, walks) stays as it is; beds can sit close to a downspout or splash block here and there.
- The game draws no environment map; the house materials borrow the bike benchmark's scoped sky (A-47).
- Glass in the game is alpha-blended with a Fresnel term, not refractive.

## 5. Images

All in `docs/qa/houses-phase1/`. **Blender renders are offline Cycles renders, not the game.** Game captures are **software WebGL**; review cameras are labelled.

| What | Files |
|---|---|
| **Blender** — the hero (the car house): front ¾ at golden hour and in neutral light, front elevation, side, rear ¾, roof detail, a window and the room behind it, the porch, the garage open | `blender/hero-car--*.jpg` |
| **Blender** — the four styles | `blender/style-ranch--hoop-house.jpg`, `style-colonial.jpg`, `style-cape.jpg`, `style-front-gable.jpg`; `blender/hoop-house--hoop-and-garage.jpg` |
| **Blender** — lineups at one scale | `blender/lineup--six-houses-a.jpg`, `lineup--six-houses-b.jpg` |
| **Blender** — the street at golden hour and at blue hour with the rooms' lamps (the eight lots that open the ride, on a straight street) | `blender/street--golden-hour.jpg`, `street--blue-hour-lamps.jpg` |
| **Game** — riding camera, authored / procedural same frame: the start, left, right, street ahead, the hoop house, the car house, the car house and across | `browser/<view>--riding-camera--authored.jpg` / `--procedural-same-frame.jpg` |
| **Game** — review cameras, same frame: car-house porch, car-house garage open, the colonial across from the start, the hoop house, a cape, a front-gable, window depth | `browser/<view>--review-camera--authored.jpg` / `--procedural-same-frame.jpg` |
| **Game** — rooms' lamps on (V) | `browser/prologue-start-left--riding-camera--room-lamps-on.jpg` |
| **Game** — with the bikes (`?bikes&houses`) | `browser/bikes-and-houses--riding-camera.jpg`, `--review-camera.jpg`, `--review-camera--procedural-houses-same-frame.jpg` |
| **Game** — offline packages | `browser/package-offline-game-prologue-houses.jpg`, `package-default-houses-fail-loudly.jpg` |

## 6. How to see it

- **In the game (served):** `python3 -m http.server 8000 --directory dist`, open `http://localhost:8000/?houses` (or `?bikes&houses`), start the ride. **H** authored ↔ procedural, **G** LOD auto/0/1/2, **V** rooms' lamps follow the evening / on / off. A DEV label says what loaded.
- **Offline:** `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>`, then open `<folder>/Last-Light-Playtest.html?houses`. Without `PLAYTEST_MODELS=1` the package says the houses FAILED and keeps the procedural ones.
- **Rebuild:** with the bpy 5.0.1 venv's Python: `python tools/blender/houses/house_textures.py`, `python tools/blender/houses/interior_atlas.py`, `python tools/blender/houses/build_houses.py -- --houses all`; gallery `python tools/blender/houses/render_gallery.py`. Plans: `node tools/assets/house-plans.mjs`.
- **Tests:** `node tests/house-browser.mjs`, `node tests/house-world-check.mjs <accepted dist>`, `GLTF_VALIDATOR_DIR=<dir with gltf-validator> node tools/assets/validate-glb.mjs dist/assets/house/house.prologue.glb --profile house`.

## 7. Changes to existing files

| File | Change | Without `?houses` |
|---|---|---|
| `dist/world.js` | `buildWorld(scene, opts)`: `opts.splitHouses` gives the named lots' procedural architecture batches and shadow proxies of their own | not called with options: the bake is identical (§3.3) |
| `dist/houses.js` | yard pieces (beds, back deck/patio, walks) tagged `userData.yard` | tagging only; nothing drawn differently (§3.3) |
| `dist/game.js` | `?houses` flag: build the world with the split, then import `house-benchmark.js`; a static import of the data module `house-lots.js` (the lot list, 1 KB) | the world is built as before; the benchmark is never imported |
| `dist/asset-library.js` | `house.prologue` registered | — |
| `tools/assets/validate-glb.mjs` | `house` profile | — |
| New | `dist/house-lots.js`, `dist/house-assets.js`, `dist/house-benchmark.js`, `dist/assets/house/house.prologue.glb`, `tools/assets/house-plans.mjs`, `tools/blender/houses/*`, `assets/source/house/*`, `tests/house-browser.mjs`, `tests/house-world-check.mjs`, docs | — |

Not changed: the story, dialogue, the route, the lots and roads, collisions and pads (all still come from the plans), the bicycles, the characters, the menu, audio, the sky, vegetation, every other chapter.

**Tangents.** The house GLB carries no tangents: its tiling materials use world-metre planar UVs (never mirrored), and three.js derives the tangent frame per pixel. This keeps the file smaller; the Khronos validator reports it as a warning.

## 8. Regression

| Suite | Result |
|---|---|
| `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs` | **818 passed, exit 0** — identical to the accepted baseline (818), same known `2/alex-bike` DEV difference (`docs/qa/houses-phase1/regression-verify-quick.json`) |
| `node tests/house-world-check.mjs <5f13784 dist>` | **5 passed, 0 failed** (default bake identical; `?houses` regroups only) |
| `node tests/house-browser.mjs` (final run, alone) | **25 passed, 0 failed** (`docs/qa/houses-phase1/browser/house-browser-report.json`). Two earlier runs made while Blender was rendering stopped on a screenshot timeout after their checks had passed; the screenshot timeout is now 180 s |
| `node tests/pipeline-browser.mjs` (Phase 0A: lab, game, offline packages) | **36 passed, 0 failed** — identical to Phase 0A (36) (`docs/qa/houses-phase1/regression-pipeline-browser.json`). A first run alongside a Blender render stopped on a screenshot timeout ("waiting for fonts", CPU saturated) after all its checks had passed; rerun alone |
| `node tests/bike-browser.mjs` (bike benchmark) | **29 passed, 0 failed** — as accepted (`regression-bike-browser.json`) |
| `node tests/main-menu-browser.mjs` on the default complete package (`PLAYTEST_MENU=1 PLAYTEST_CHAPTER=final`, opened from disk) | **96 passed, 0 failed** — as accepted (`regression-main-menu-package.json`) |

## 9. Not verified, and what comes next

- **No real GPU.** Every frame here is software rendering. Frame time, GPU memory and the cost of the full set (four detailed bikes, four authored children, trees, these houses) need a run on the Phase 0 reference hardware (A-45).
- **No human review yet** (A-51, A-52). Review in the game with `?houses`, H to compare.
- **Not done (on purpose, awaiting approval):** the rest of the lots (the kit builds any plan in seconds), side streets, Jamie's, Sam's and Alex's houses (outside this area; their working doors, windows and rooms need the same treatment the car house's garage got), damage states for Chapter Eight, KTX2 texture compression, impostors for the far ring.
- **Blender:** built with Blender 5.0.1 as a headless module; the `.blend` opens in the Blender application (scene EXPORT), which was not itself run here.
