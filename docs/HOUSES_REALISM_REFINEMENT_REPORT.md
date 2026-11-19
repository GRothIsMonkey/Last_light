# Last Light: the Prologue's Houses, realism refinement (final architectural art pass)

Branch `claude/prologue-house-architecture-realism-refinement`, continuing the house benchmark `53b76413cbb101ab36f544b3c9561f0d3cbca1f0` (not started over: the same kit, the same twelve houses on the same plans, the same `?houses` integration and tests). Not merged into `main`. **Awaiting creative-director approval (ART-APPROVAL-REGISTER A-53).** Nothing in the story uses these houses; they still appear only with `?houses`.

**Evidence and its limits (VISUAL-QA-ACCEPTANCE §1).** Blender renders here are offline Cycles renders (**not the game**). In-game captures are the shipped renderer under **software WebGL** (Chromium + SwiftShader, **not a GPU**); review cameras are labelled. No real-GPU measurement and no human review has happened yet.

**About Jamie and Sam.** The brief asks to close the gap with the new Jamie and Sam character models. **Their asset files are not in this workspace** (no character GLB, blend or render of the new models exists in the repository or the session), so **no direct side-by-side with the characters was made**. The reference used was the one character render attached to the brief (two kids at golden hour: soft skin and fabric shading, contact shadows, subtle colour variation, no hard CG edges), the art bible (`docs/art/ENVIRONMENT-STYLE-GUIDE.md`) and the benchmark's own reviewed screenshots. What that render does that the first houses did not — occlusion where surfaces meet, light that falls off softly, materials with micro-variation and real roughness response — is what this pass targets. A check with the real characters in one frame is the first thing the review should do (§8).

## 1. What changed, and why (A → B → C)

**A** is the game's procedural houses (`houses.js`), **B** the first benchmark (`53b7641`, kept byte for byte), **C** this pass. Every C change is in the kit (`tools/blender/houses/`) or in the house-only runtime treatment (`dist/house-assets.js`); the game's sky, sun, fog, tone mapping and post-processing are untouched.

### 1.1 Light where surfaces meet (the biggest single gap)

The game has no ambient occlusion and no bounce light, so in B every eave, porch ceiling, window reveal and ground line was as bright as an open wall: the houses read as clean CG. C **bakes it into the vertices** (`house_bake.py`, HOUSE-KIT §8): large faces are tessellated (≈1 m walls, 1.4 m roofs), then each point casts 28 / 14 / 8 rays (LOD0 / 1 / 2) into the hemisphere against the house and the ground. Result, visible in both renderers: soffits and porch ceilings darken toward the wall, walls darken softly into the ground and under eaves, window reveals and door recesses have depth, rooms behind glass fall off toward their corners, garage door panels sit in their frames. Rays near-parallel to a wall and hits closer than 18 cm are ignored, so trim and shutters don't leave grey halos.

### 1.2 Materials (texture library v2, still one shared library)

- **Siding**: convex laps with a real butt shadow at each course, staggered lap seams, faint wood-grain emboss, slight wave between studs, a little chalk on the high faces. Low-frequency tone drift per house (±2.5 %), so a long wall is never one flat value.
- **Brick**: four body tones plus flashed (darker) ends, per-brick jitter and tilt, pits and specks, **tooled, recessed mortar** with its own occlusion; drift ±5 % per house.
- **Shingles**: keyways, a slight sag per course, granules with darker and lighter clusters, a few worn tab edges, faint vertical streaks; drift ±7.5 % per house, and roofs a little greyer and chalkier the older the house.
- **Concrete**: broom lines, exposed fines and aggregate, pinholes, soft curing stains, a few stones; **paint**: orange-peel, satin sheen that varies, grain under the paint, paint a little darker in the low spots.
- **Weathering, restrained** (scaled by each family's upkeep: fresh / average / tired): rain splash at the foot of walls, faint streaks under sills, one sun-faded exposure, chalky roofs on older houses. No grime, nothing broken, nothing neglected.
- **In the game** (house-only, reversible): the ORM occlusion channel is used as `aoMap` (mortar, laps and keyways stay dark at grazing angles); anisotropic filtering raised to 16× (B used 4×, which blurred siding and roofs into a smear beyond 15 m); a 1.35× normal scale on siding and shingles so courses read under the game's flatter light; each house gets its own roughness factor by upkeep (fresh paint satin, tired paint chalkier).

### 1.3 Windows

- **Glass**: each pane is very slightly out of plane (±2 mm at the corners) and tinted a little differently, so reflections break pane by pane like real old glass instead of one mirror. In the game the glass now reflects a **street horizon** (roofs and trees against the golden sky, a scoped PMREM for these windows only) with a Fresnel ramp: dark and transparent face-on, reflective at grazing angles.
- **Depth**: frame depth and the recess are now shaded by the bake (head and jamb darker, sill catches light); room boxes behind the glass fall off into their corners.
- **Rooms that read as real, and vary**: every room card is mirrored and shifted per window, so neighbouring windows never show the same furniture in the same place; each household has a habit (curtains, blinds, mixed) applied room by room.
- **Dusk**: the interior atlas now has a painted **emissive** layer (lamp pools on the walls, ceiling and floor; light through blinds, fabric and sheers), so at night a lit room has a lamp's falloff instead of a flat glow. Rooms still come on house by house with the game's own evening (`glassLit` `uP` / `uNight` / `uDim`).

### 1.4 Roofs, siding, brick, concrete and wood details

Step flashing where a garage roof meets the house wall; painted steps now have **treads with a nosing, darker risers and side stringers**; the shingle and siding textures above.

### 1.5 Less uniformity between houses (families, not chaos)

A second random stream per house (`rnd2`) adds habits **without changing any choice approved in B** (storm doors, garage lites, chairs, colours stay exactly as they were):

| Habit | Options |
|---|---|
| Window treatments | curtains / blinds / mixed household |
| Porch light | black carriage lantern, brass carriage lantern, jelly-jar fixture |
| Garage door | raised short panels, long panels, ribbed steel |
| Porch life | chairs, a bench, a second planter, nothing |
| Upkeep | fresh / average / tired: paint roughness, roof fade, splash, sill streaks |
| Front-gable accent | plain / lighter / darker gable |

The **car house** (story) and the **hoop house** (story) get the same treatment with the most care at the riding camera: the car house's porch (lantern, door, steps, railings, the shadow of the porch roof), its working garage door (still the authored door the van comes home to); the hoop house's brick front, garage, stoop and hip roof.

## 2. Same-camera comparisons

All in `docs/qa/houses-realism/`.

### 2.1 Blender (offline Cycles, **not the game**), B vs C

`tools/blender/houses/render_compare.py` builds each version **with its own kit code, textures and plans** (B from a worktree of `53b7641`, C from this branch) and renders them with the same cameras, the same golden-hour sun and sky, the same samples. A cannot be rendered in Blender: the procedural houses are runtime geometry and shaders in `houses.js` (see the game captures).

| View | File |
|---|---|
| The Prologue's starting street (the eight houses that open the ride, both sides) | `blender/compare--street--B-vs-C.jpg` |
| The hoop house | `blender/compare--hoop--B-vs-C.jpg` |
| The car house, and its porch close | `blender/compare--car--B-vs-C.jpg`, `compare--car-porch--B-vs-C.jpg` |
| A representative colonial (R8, across from the start), and a window close | `blender/compare--colonial--B-vs-C.jpg`, `compare--colonial-window--B-vs-C.jpg` |
| A ranch (the first house of the ride, Lm21) | `blender/compare--ranch--B-vs-C.jpg` |
| A Cape Cod (L37) | `blender/compare--cape--B-vs-C.jpg` |
| **Dusk**: the starting street at blue hour, the rooms' lamps on (B's and C's own room atlases and lamps) | `blender/compare--street-blue-hour-lamps--B-vs-C.jpg` |
| All eight on one sheet | `sheet--blender--B-vs-C.jpg` |

Single frames are `blender/<view>--B-benchmark.jpg` and `blender/<view>--C-refined.jpg`.

### 2.2 In the game (software WebGL), A vs B vs C in the same frame

`node tests/house-browser.mjs` captures every view three times from the same camera at the same moment (H): `browser/<view>--C-refined.jpg`, `--B-benchmark.jpg`, `--A-procedural.jpg`.

| What | Files (`browser/`) |
|---|---|
| **Riding camera**, the real ride: the Prologue start, looking left, looking right, the street ahead, the hoop house, the car house, the car house and the house across | `prologue-start--riding-camera--{A,B,C}…`, `prologue-start-left--…`, `prologue-start-right--…`, `prologue-street-ahead--…`, `hoop-house--riding-camera--…`, `car-house--riding-camera--…`, `car-house-and-across--riding-camera--…` |
| **Review cameras** (labelled): car-house porch, car-house garage open (the working door), the colonial across from the start, the first ranch, the hoop house, a cape, a front-gable, a window close up | `car-house-porch--review-camera--…`, `car-house-garage-open--…`, `colonial-across-start--…`, `ranch-start--…`, `hoop-house--review-camera--…`, `cape-start--…`, `front-gable-start--…`, `window-depth--…` |
| **Rooms' lamps** forced on (V) under the Prologue's light at d 30 (still golden there; in the ride they come on house by house with the evening progress), C and B; for true dusk see the Blender blue-hour pair above | `prologue-start-left--riding-camera--room-lamps-on--C-refined.jpg`, `--B-benchmark.jpg` |
| **With the bikes** (`?bikes&houses`): the group ride; the review camera in C, B, A | `bikes-and-houses--riding-camera.jpg`, `bikes-and-houses--review-camera--{C-refined,B-benchmark-same-frame,A-procedural-same-frame}.jpg` |
| **Offline package** | `package-offline-game-prologue-houses.jpg`, `package-default-houses-fail-loudly.jpg` |
| **Contact sheets** (in `docs/qa/houses-realism/`) | `sheet--game--riding-camera--A-B-C.jpg`, `sheet--game--review-camera--A-B-C.jpg` |

What the game frames show, honestly: at the riding camera C is a clear step from A and a visible but quieter step from B — the
gain is in the eaves, porch ceilings and ground lines (now in shadow), window reveals and door recesses (depth), the roofs
(granular, varied, no longer a flat slate) and the garage doors (panels in their frames). It is most visible at 10–25 m
and on the story houses' porches; at 40 m+ B and C converge (LOD1/LOD2, soft occlusion). The Blender pairs show the same
direction with more contrast, because Cycles adds its own occlusion and bounce to both.

## 3. Performance and memory

### 3.1 The file

| | B (first benchmark) | C (this pass) | Change |
|---|---:|---:|---:|
| GLB size | 18,798,284 B | 18,742,396 B | −0.3 % |
| of which textures | 7,503,383 B | 6,226,674 B | −17 % |
| Textures | 17 × 1024² | 13 × 1024² + 4 × 512² (concrete normal and ORM, paint normal, room emissive: fine detail that never reaches 1024² on screen) | |
| **GPU texture estimate** (RGBA8 + mips, all resident) | **90.7 MB** | **74.7 MB** | **−16 MB (−18 %)** |
| + glass reflection map (PMREM, C only) | — | ≈ 6 MB | net ≈ −10 MB |
| Materials | 10 | 10 shared (+ per-house clones of 4 for upkeep roughness: same programs and textures) | |
| Triangles, all LODs | 120,131 | 146,092 | +22 % |
| Vertices, all LODs | 235,135 | 259,079 | +10 % |
| Validation | 0 errors; Khronos 0 errors, 126 warnings (no tangents, on purpose) | 0 errors; Khronos 0 errors, 126 warnings | |

The extra triangles are the bake's tessellation (it needs vertices to hold the shading) plus the new details (stair nosings and stringers, flashing, lanterns, the ribbed and long-panel garage doors).

| House | LOD0 B → C | LOD1 B → C | LOD2 B → C |
|---|---:|---:|---:|
| lotLm21 | 5,116 → 6,434 | 2,115 → 2,395 | 441 → 507 |
| lotRm21 | 7,977 → 9,522 | 3,411 → 3,911 | 597 → 710 |
| lotL8 | 6,132 → 7,922 | 3,000 → 3,549 | 609 → 730 |
| lotR8 | 6,237 → 8,018 | 3,368 → 3,828 | 580 → 689 |
| lotL37 | 6,121 → 7,424 | 3,002 → 3,362 | 652 → 731 |
| lotR37 | 4,857 → 6,160 | 2,656 → 3,150 | 604 → 675 |
| lotL66 | 9,001 → 10,740 | 3,613 → 4,203 | 617 → 726 |
| lotR66 | 7,016 → 8,799 | 2,968 → 3,655 | 569 → 692 |
| hoop | 4,474 → 6,042 | 2,327 → 2,701 | 375 → 487 |
| lotR153 | 4,480 → 5,784 | 2,177 → 2,515 | 375 → 455 |
| car | 9,033 → 10,890 | 3,455 → 4,109 | 621 → 752 |
| lotR530 | 7,393 → 9,046 | 3,247 → 3,751 | 575 → 688 |
| **all twelve** | **77,837 → 96,781** (+24%) | **35,339 → 41,129** (+16%) | **6,615 → 7,842** (+19%) |

Against the budgets: every ordinary house stays inside the 6–10k background budget except `lotL66` (10,740, 7 % over the warning target: a two-storey colonial with a full porch); the validator's house profile now warns at 10k and fails at 12k. Story houses (car 10,890, hoop 6,042) are far below their 20–35k budget. LOD1 2.4–4.2k, LOD2 0.45–0.75k.

### 3.2 In the game (same frames, renderer.info, shadows included, software WebGL)

| Frame (riding camera) | Draw calls C / B / A | Triangles C / B / A |
|---|---|---|
| Prologue start | 484 / 486 / 463 | 755k / 762k / 774k |
| Start, looking left | 239 / 240 / 231 | 429k / 430k / 434k |
| Start, looking right | 436 / 436 / 428 | 828k / 824k / 826k |
| Street ahead | 490 / 490 / 468 | 768k / 763k / 772k |
| Hoop house | 243 / 244 / 240 | 610k / 612k / 611k |
| Car house | 252 / 253 / 268 | 648k / 648k / 647k |
| Car house and across | 316 / 316 / 322 | 563k / 561k / 562k |
| *Review: car-house porch* | 537 / 537 / 508 | 856k / 853k / 854k |
| `?bikes&houses`, group ride (C) | 483 | 777k |

**C costs what B cost**: the same draw calls (±1) in every frame, and within ±1 % of B's triangles (the extra tessellation sits mostly in LOD0, which only the nearest houses use). Both stay within a few percent of the procedural houses (A) they replace. The per-house upkeep materials are clones of four shared materials: same shader programs, same textures, no extra draw calls.

**Load** (served, software): 455 ms in the page for C (read 112 ms, parse with image decode 182 ms); B, loaded only when H first asks for it, 506 ms. **The refined treatment in numbers**: 45 materials with an occlusion map, anisotropy 16× (the renderer's maximum here), 44 per-house upkeep clones, one glass environment shared by every window. **GPU texture memory** for the houses drops from ≈ 90.7 MB (B) to ≈ 74.7 MB (C); the street-horizon glass reflection adds one PMREM render target (three.js r160 default: 768 × 1024 half-float, ≈ 6 MB), so the **net** saving is ≈ 10 MB. When B is also loaded (only after H reaches it in this DEV comparison) both sets are resident; the production swap would ship only one.

## 4. Regression

| Suite | Result |
|---|---|
| `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs` | **818 passed, exit 0**, identical to the accepted baseline (818) with the same known `2/alex-bike` DEV difference (`docs/qa/houses-realism/regression-verify-quick.json`) |
| `node tests/house-world-check.mjs <5f13784 dist>` | **5 passed, 0 failed**: the default world is baked identically (2,197 batches, 3,672,619 triangles, 2,371,203 shadow-proxy triangles); `?houses` only regroups (`world-bake-check.json`) |
| `node tests/house-browser.mjs` (final run, alone) | **29 passed, 0 failed** (`browser/house-browser-report.json`): default game fetches nothing of the benchmark; twelve houses at 0.000 mm on their plans; nothing on the street, curb, strip or sidewalk; every house inside the plan's riding obstacle; footprints within the plan; the car house's authored garage door moves with the panel world.js animates (garage opens), procedural slab and footing hidden; the hoop where the kid shoots; three LODs; the refined treatment present on C only; B loads on demand at 0 mm; H shows exactly one of C/B/A; lamps on/off; the Prologue rides on before and after cycling H; `?bikes&houses` both load and the group ride goes on; offline package places the houses from embedded bytes with no network; the default package fails loudly and substitutes nothing |
| `PARTS=D node tests/house-browser.mjs` (offline packages, rerun with the new offline-H check) | **7 passed, 0 failed** (`browser/house-browser-report--package-rerun.json`): both house sets embedded and hashed; in the offline game H reaches B (from the embedded bytes) and A and comes back to C; no network request |
| `node tests/pipeline-browser.mjs` (Phase 0A: lab, game, offline packages) | **36 passed, 0 failed**, as accepted (`regression-pipeline-browser.json`) |
| `SHOTS=0 node tests/bike-browser.mjs` (bike benchmark) | **29 passed, 0 failed**, as accepted (`regression-bike-browser.json`) |
| `node tests/main-menu-browser.mjs` on the default complete package (`PLAYTEST_MENU=1 PLAYTEST_CHAPTER=final`, opened from disk) | **96 passed, 0 failed**, as accepted (`regression-main-menu-package.json`) |
| `node tools/assets/validate-glb.mjs dist/assets/house/house.prologue.glb --profile house` (with the Khronos validator) | **0 errors**; Khronos 0 errors, 126 warnings (no tangents, on purpose); warnings: `lotL66` LOD0 10,740 and LOD1 4,203 above the ordinary targets (`validate-house.prologue.v2.json`) |

What this covers from the brief: the default game unchanged (bake identical, nothing fetched, verify 818, menu 96); the house preview, the bike benchmark and the combined preview work; the twelve houses on their plans (0 mm); no collision changes (pads, obstacles and footprints come from the plans and are checked against them); the rooms' lamps follow the evening and V; the car house's garage opens with the authored door; the Prologue rides on; asset validation passes.

## 5. How to see it

- **Served:** `python3 -m http.server 8000 --directory dist`, open `http://localhost:8000/?houses` (or `?bikes&houses`) and start the ride.
  - **H**: C refined → B first benchmark (loaded on first use) → A procedural → C …, in the same frame.
  - **G**: LOD auto / 0 / 1 / 2.
  - **V**: rooms' lamps follow the evening / on / off.
  - A DEV label says which set is showing and what loaded.
- **Offline:** `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>`, then open `<folder>/Last-Light-Playtest.html?houses` (≈ 105 MB: both house sets and the four bikes embedded). H works offline too.
- **Rebuild** (bpy 5.0.1 venv's Python): `python tools/blender/houses/house_textures.py`, `python tools/blender/houses/interior_atlas.py`, `python tools/blender/houses/build_houses.py -- --houses all` (bakes by default).
- **Comparison renders:** `python tools/blender/houses/render_compare.py -- --kit <worktree of 53b7641>/tools/blender/houses --label B-benchmark --out <dir>`, then the same with this branch's kit and `--label C-refined`.
- **Recover the first benchmark:** it is untouched at `53b7641` and, byte for byte, in `dist/assets/house/house.prologue.v1.glb` (H shows it). To make it the default again, point `HOUSE_ASSET` in `dist/house-benchmark.js` at `house.prologue.v1` with `refined:false`.

## 6. Files changed in this pass

| File | Change |
|---|---|
| `tools/blender/houses/house_bake.py` (new) | baked vertex shading: tessellation, occlusion, upkeep weathering, macro variation |
| `tools/blender/houses/house_textures.py` | texture library v2 (siding, brick, shingles, concrete, paint); fine maps at 512² |
| `tools/blender/houses/interior_atlas.py` | painted emissive (lamp pools, blinds, fabric, sheers); `--reuse` |
| `tools/blender/houses/house_kit.py` | `tessellate`, per-corner colours |
| `tools/blender/houses/house_parts.py` | jittered panes; mirrored/shifted room cards; long-panel and ribbed garage doors; jelly-jar lantern; stair treads, risers, stringers |
| `tools/blender/houses/house_build.py` | family habits (second random stream), sill records for the bake, flashing |
| `tools/blender/houses/build_houses.py`, `render_gallery.py` | bake step, version 2 |
| `tools/blender/houses/render_compare.py` (new) | same-camera B/C renders, each version with its own kit |
| `assets/source/house/**` | textures v2, `.blend`, build stats |
| `dist/assets/house/house.prologue.glb` | the refined set (version 2) |
| `dist/assets/house/house.prologue.v1.glb` (new) | the first benchmark, byte for byte (asset id `house.prologue.v1`) |
| `dist/house-assets.js` | house-only refined treatment (aoMap, anisotropy, normal scale, upkeep roughness, street-horizon glass); `showOwn` / `setProcedural` for three-way compare |
| `dist/house-benchmark.js` | H cycles C → B → A; B loads on first use |
| `dist/asset-library.js` | `house.prologue.v1` registered (file asset id `house.prologue`) |
| `tools/assets/validate-glb.mjs` | house profile: ordinary houses warn at 10k, fail at 12k LOD0 |
| `tests/house-browser.mjs` | A/B/C captures, refined-treatment, B-loading, exclusive-mode, lamp and offline-H checks |
| docs | this report; HOUSE-KIT §8–9; approval register A-53; provenance; README; pipeline note |

**Not changed:** the story, dialogue, roads, route, lots and placements, collisions and pads, the car house's working garage door and every other door interaction, the four bikes, Jamie, Sam and every other character, vegetation, the sky and global lighting, fog, post-processing, audio, the main menu, Chapter Eight, saves. Without `?houses` the game is unchanged (§4).

## 7. Known limits

- **Software WebGL only.** No frame time or GPU memory was measured on a real GPU; the GPU texture figure is an estimate (uncompressed RGBA8 + mips). KTX2 (L-7) would cut it several times.
- **A is not in the Blender comparison**: the procedural houses only exist at runtime. A appears in every game comparison.
- **Vertex baking has a resolution**: occlusion is stored on a ≈1 m grid (2 m at LOD1), so it is soft by design; hairline contact shadows come from the normal and occlusion maps, not the bake.
- **`lotL66` LOD0 is 10,740 triangles**, 7 % over the ordinary warning target.
- **Glass** is still alpha-blended with a Fresnel term and a scoped reflection, not refractive or screen-space reflective.
- **Shadows in the game are much weaker than in the Blender renders, and that is the game's global lighting, deferred to the
  lighting phase (decision 2026-11-19).** Measured in the running Prologue at the captures' light (sun elevation ≈ 10°):
  - the sun runs roughly along the street, so the six right-side houses face away from it (front N·L −0.38 to −0.75): their
    fronts are entirely in shade and can show no cast shadow; the left side gets it at a glancing angle (N·L 0.38–0.45,
    the car house 0.73);
  - on a sunlit front the sun is only ≈ 0.9–1.7× the hemisphere fill, so a shadow removes at most about half the light;
  - one 2048² shadow map covers 120 × 120 m (≈ 5.9 cm per texel, PCF-soft, normal bias 2.3 cm): fine parts cast a smudge
    or nothing;
  - house side: each house casts from its LOD1 shell (no balusters or fine trim), and the baked occlusion is soft by design.

  The Blender comparison views were lit with a sun chosen per view to rake across the facades, so they show what the houses
  can look like, not what the current game light delivers. The fixes (sun/fill balance, a near shadow cascade, SSAO /
  contact shadows) are global and belong to the lighting pass; at that point the houses can also cast from LOD0 when near.
- **Interiors** are a card plus a room box per window: convincing from the street, flat from very close.
- **No direct comparison with the new Jamie and Sam models** (their files are not in this workspace).

## 8. For the review

1. Open `?houses` (or `?bikes&houses`) and ride the first 150 m; press **H** on the car house, the hoop house and the first eight houses to see C, B and A in the same frame.
2. **With the new Jamie and Sam in the same frame** (their branch), judge whether the houses now sit in the same world. This was not possible here.
3. Approve, or name what to push further (more occlusion, more weathering, more variety, a different glass response). Vegetation and the other environment phases have **not** been started.
