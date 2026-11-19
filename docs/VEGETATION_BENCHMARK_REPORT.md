# Prologue vegetation & old oak benchmark — report

Branch `claude/prologue-vegetation-old-oak-benchmark`, started from `bc2044153aaf64642b1a2ff9e7fa454767edd26f` (the repaired
houses). Nothing is merged into `main`. The approved game is unchanged without `?vegetation`.

**Evidence and its limits (VISUAL-QA-ACCEPTANCE §1).** Blender renders here are offline Cycles renders (rank 6, **not the
game**). In-game captures are the shipped renderer under **software WebGL** (Chromium + ANGLE SwiftShader, rank 3, **not a
GPU**); review cameras are labelled. No real-GPU frame time has been measured and no human review has happened yet — those
are the next step (ranks 1–2). Every performance number below is a software-renderer or file number.

## 1. What was built

| | |
|---|---|
| **The old oak** (`lm.old-oak`) | Reconstructed from kungphil's laser scan: the scan's real branch architecture and crown (19.8 m tall, crown 25.8 × 28.2 m, trunk 1.26 m at chest height), one massive trunk with root flare and buttresses, the swing limb on the game's swing pivot, the healed `AR` carving at ending.js's height facing the swing, a dead stub on the field side. LOD0 81.6k / LOD1 15.4k / LOD2 2.8k triangles; 2048² plated white-oak bark (original), 2048² oak leaves (graded twig photo), 512² carving. |
| **Street trees** (`veg.street-trees`) | 44 variants, 7 species: maple ×8, oak ×6, ash ×6 (branch architectures recovered from Jungle Jim's collection), birch ×6, white pine ×6, spruce ×6, young street tree ×6 (grown); one leaf atlas, one shared bark (tinted per species) and a birch bark. |
| **Shrubs** (`veg.shrubs`) | 18: LOLIPOP's 15 bushes with their LOD chain, clipped globes and hedge blocks, flowering perennials. |
| **Ground** (`veg.ground`) | Lawn clumps of real curved blades (with card LODs), long grass, meadow and dry tufts, weeds, seed stalks, Queen Anne's lace / chicory, black-eyed Susans, clover. |
| **In the game** | `?vegetation` (works with `?bikes&houses`): the authored set stands exactly where the procedural trees, bed shrubs and lookout grass stood, the lawn gets blades near the camera and broad colour variation, the lookout gets its meadow and a worn patch under the swing. `K` swaps authored/procedural in the same frame, `L` forces LODs, `U` steps the wind. |

## 2. The four supplied models (Stage A)

Full inspection: [qa/vegetation/stageA/README.md](qa/vegetation/stageA/README.md) and renders `qa/vegetation/stageA/A*.jpg`.
Licensing, hashes and every modification: [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md) (the four originals are kept byte
for byte as the owner's split parts with `manifest.json` and `reconstruct.py` under
`assets/source/vegetation/third-party/sketchfab-originals/`).

| Source | What it really is | How it is used |
|---|---|---|
| 200 year old oak tree (kungphil) | a 4.6 M-point coloured **laser scan**, no surfaces | measured source of the oak's architecture and crown (no point or colour ships) |
| Realistic Trees Collection (Jungle Jim) | 7 EZ-Tree trees at ~10× scale; 5 unique textures (one bark photo, oak/ash/pine twig photos) | oak and ash skeletons; twig photos in the leaf atlases; bark photo as micro-detail |
| Bush models pack (LOLIPOP) | 15 game bushes with LOD0/1/2 + billboards | geometry, LOD chain and atlas of every shrub |
| Grass And Bush (Ali haghshenas) | 4 cards on an atlas that is mostly props; 4 plant sprites | the 4 sprites in the lookout meadow |

No asset was substituted. Where a supplied file could not provide something (the scan has no surfaces; the collection has no
maple or birch; the grass pack has no lawn), the gap was filled by original work, said so here and in THIRD_PARTY_ASSETS.md.

## 3. The old oak (Stage B)

**From points to a tree.** `oak_skeleton.py` voxelizes the 4.6 M points (8 cm, 985k voxels), links neighbouring voxels into a
graph, measures each voxel's geodesic distance from the trunk base (Dijkstra) and slices those distances into level sets; each
slice's connected clusters become skeleton nodes joined to the cluster below (27,534 nodes in 84 slices). Radii follow the pipe
model, calibrated on the trunk measured in the scan (r = 0.63 m at 1.3 m). The trunk centre was measured from horizontal slices:
vertical to 3 m, then forking at 3.3–4.3 m into five scaffold limbs; the "low" limbs the skeleton showed leaving at 0.8 and 1.4 m
are a fused second stem on the trunk's surface and were modelled as a buttress lobe with the limbs socketed where they really
separate.

**Fitting it to the lookout without breaking it.** The scan was turned 56° about the vertical (chosen by scoring all bearings
against the story layout): the flattest scaffold limb lands 15° from the swing's bearing; the long ground-sweeping limb points
to the open side, away from every story mark, and reads in profile from the cul-de-sac; another heavy low limb reaches over the
approach. `tools/assets/oak-site.mjs` dumps the lookout from the game itself (a 48 × 48 m ground grid, the swing pivot exactly as
ambient.js computes it, the carving, the bench, the chalk, where the old bike lies, where Alex sits, where the friends stand), so
the tree is built on the real ground and around the real marks:

- **the swing limb**: reshaped near the trunk only — it leaves the trunk at ~3.5 m and runs over the pivot with its centre at
  4.60 m (rope top 4.37 m, limb radius 0.26–0.32 m: the rope wraps the limb), blending back into its scanned path by 7.5 m, so
  the crown silhouette is the scan's; nothing hangs into the rope's or the tire's path (a 1 m column under the pivot and the
  tire's swept volume are kept clear). In the game the stand-in cylinder limb of ambient.js is hidden while the authored oak shows;
- **the carving**: the trunk is a little flatter and smoother where the letters are; a 0.40 m patch of the trunk surface
  carries the `AR` (ending.js's own strokes, wobbled and widened by decades, swollen callus lips, weathered grey wood in the
  grooves) at 1.34–1.50 m above the trunk ground, centred on the bearing that faces the swing — exactly where ending.js puts its
  line carving (hidden while the authored oak shows);
- **story marks**: buttresses are kept small on the story side; surface roots only on the open side; no wood or leaves between
  0.12 and 1.9 m above the old bike's place, Alex's place against the trunk, the bench, the chalk, the swing's patch or where the
  friends stand (checked in the game).

**Canonical identity across chapters.** One tree, one file (`lm.old-oak.glb`). The Prologue's summer state ships now. The
material carries what the later states need without new geometry: the shader's `uSeason` uniform (0 summer → 1 October) tints
the leaves per card, the leaf colour can be pushed to a dark silhouette or ash grey through the same per-card data, and the
bark's dead-wood channel can grey limbs if the story approves damage (Chapter Eight's state is CDA A-29b; no limb was broken or
removed). Wind is already the game's own breeze and scales for the storm chapters (`setWind`).

Blender renders (golden hour unless named): `qa/vegetation/oak/B1_front.jpg` … `B8_dusk.jpg` — front, side, three-quarter,
trunk and carving, the swing limb, the canopy against the sky, golden hour, the dusk silhouette.

## 4. Street trees, shrubs, grass (Stage C)

**One kit for everything** (`veg_mesh.py`): skeleton → chains → bark tubes (resampled by radius, parallel-transport frames,
seamless bark UVs, a collar where big limbs leave the trunk) + twig cards at the twigs (every card hangs from a twig node:
nothing floats), baked canopy occlusion in COLOR_0 (a foliage density grid ray-marched over the upper hemisphere) and the wind
data in `_WIND`. **One texture library** (`veg_textures.py`) with **one grade**: every leaf, photographed or original, is moved
to the same late-August palette (a little tired, never neon); colour under transparent pixels is padded so mips never pull in a
matte; barks are original (plated white oak, grey furrowed broadleaf, paper birch) with the collection's bark photo as micro-detail.

**Street trees.** Oak and ash: the three oak and three ash branch meshes of the collection recovered ring by ring
(`ez_skeleton.py`: EZ-Tree's UVs mark the rings), scaled to 9.5–12.5 m, re-meshed with the kit; three more of each made by real
reshaping (one side pruned back, as owners do near a house; limbs bent; a lean). Maple (opposite branching, ascending scaffolds,
oval crown), birch (2–3 stem clump, weeping twigs), white pine (open tiers, upturned tips), spruce (dense whorls, conical) and
young staked street trees: grown by a species-parameterised branching model. Every variant is a different tree; in the game the
variant is chosen so that no neighbour within 30 m shares it, with a random rotation and a ±6 % size jitter on top.

**Shrubs.** LOLIPOP's bushes keep their geometry and LOD chain; leaves alpha-tested (not blended); trimmed globes and hedge
blocks are the pack's own leaf layers pulled into a clipped envelope with a turned second layer for density; flowering
perennials get an original flower layer. In the game each house's beds get one planting style (clipped, natural or mixed) —
some families clip, some don't.

**Grass.** Near the camera the lawn is real geometry: clumps of curved blades every ~0.36 m within ~10 m (crossed cards to
~22 m, thinning and shrinking to nothing at the edge so there is no line), the ground material beyond. Per lot: mowing stripes on
some, clover on others, a ragged unedged rim along the walk on the untidy ones, a dry tone here and there; walks, porches,
houses, beds and trunks are left clear. The lawn material itself (both lawn materials of streets.js, via a uniform that
switches off with `K`) gains broad colour variation and late-August dry patches. The lookout: tall meadow, dry tufts, seed
stalks, Queen Anne's lace, chicory and black-eyed Susans beyond the field fence; longer grass and clover on the knoll; the trodden
way from the stop, the bench, the chalk, the trunk, the old bike's place and a worn dirt patch under the swing left open.

Blender renders: `qa/vegetation/street/C9_street_tree_lineup.jpg`, `qa/vegetation/shrubs/C10_shrub_lineup.jpg`,
`qa/vegetation/ground/C11_grass_close_up.jpg`, `C11b_meadow_close_up.jpg`, `qa/vegetation/street/C12_completed_street.jpg`,
`C12b_completed_street_reverse.jpg`.

## 5. Wind and the shared vegetation shader

`dist/vegetation-assets.js` gives every tree, shrub and plant the same material treatment on top of three.js's standard
material: COLOR_0 occlusion; a vertex wind from `_WIND` — trunk sway growing with height², branch sway by flex with a phase per
scaffold limb plus a per-tree seed, a gentle cross-wind component, leaf flutter by the card's stem-to-tip weight — in a world
direction that stays the same whatever each instance's rotation; leaf back-light when the sun is behind the leaves; ±6 % hue
jitter per card; bark moss in patches and grey dead wood from `_WIND.w`; alpha coverage kept with distance (the cut-out alpha is
scaled by the mip level, so crowns do not thin out). The wind runs on **the game's own breeze**: the `time` and `gust` uniforms of
ambient.js's foliage (read through its own shader hook), so authored and procedural vegetation move together and the storm
chapters can raise it (`setWind`). Calm by default; no new weather event was added. Shadows are cast by LOD0/LOD1 trees with an
alpha-tested depth material (dappled shadows on roads, lawns and porches) and by LOD0 shrubs.

## 6. Integration (Stage D)

- `world.js` `buildWorld(scene,{vegetation:true})` (only with `?vegetation`): records every tree within 95 m of Oak Hollow
  Drive (kind, size, LOD, position, rotation), every foundation-bed shrub and flower (baked centre), and bakes them and the
  lookout's old cone grass into batches and shadow proxies of their own (zones `vg:*`), the way `?houses` splits its lots. The
  hooks in vegetation.js, houses.js, props.js are inert without the option: **the default world is baked identically** (same
  merged meshes, vertices, shadow proxies and geometry hash as `bc20441`; checked in Node and with the house suite's world check).
- `vegetation-benchmark.js` mounts `vegetation-assets.js` (the four files through asset-library.js: served dist or the offline
  package's embedded bytes, never a network). `K`/`L`/`U` (checked against every binding: unused). A DEV label says what loaded;
  on failure nothing is substituted.
- Placement is the plan's: positions, collisions, obstacles, pads, the swing, the bench, the chalk, doors, story triggers,
  dialogue, saves and animations are untouched. The oak stands on `LOOKOUT.oak` (0 mm, rotation −heading). Street-tree crowns are
  kept to the recorded crown size and clear of the nearest house; far background trees are grounded on the visible land.
- Scope: the Prologue's street and what is seen from it (Oak Hollow Drive, the side streets near their junctions, back yards,
  the lookout and the field beyond). Other chapters' areas are untouched. The flag is a DEV benchmark: it stays on if one plays on
  into later chapters on the same street (their own vegetation logic is unchanged).
- Credits: the four authors are in the final credits roll (`final-credits.js`); the title menu's Credits panel is unchanged
  (main-menu boundary) — add them there when the vegetation ships beyond the DEV flag.

## 7. Measurements

All numbers are file data or the shipped renderer under **software WebGL** (Chromium + ANGLE SwiftShader) — **not GPU
timings**; frame time on real hardware is still to be measured. Source: `docs/qa/vegetation/measurements.md` / `.json` (written
by `veg_measure.py` from the build stats, the validator reports and `browser/report.json`).

### Files: the supplied originals and the optimized runtime files

| Original (CC BY 4.0) | Bytes | Runtime file | Bytes | Validator |
|---|---|---|---|---|
| `200_year_old_oak_tree.glb` | 129,820,864 | `dist/assets/veg/lm.old-oak.glb` | 6,556,112 | ok; Khronos 0 errors, 4 warnings |
| `realistic_trees_collection.glb` | 42,333,844 | `dist/assets/veg/veg.street-trees.glb` | 16,693,312 | ok; Khronos 0 errors, 120 warnings |
| `bush_models_pack_gameready_lods.glb` | 8,048,292 | `dist/assets/veg/veg.shrubs.glb` | 2,898,248 | ok; Khronos 0 errors, 0 warnings |
| `grass_and_bush_-_mobile_gameready.glb` | 1,833,488 | `dist/assets/veg/veg.ground.glb` | 725,212 | ok; Khronos 0 errors, 0 warnings |

Runtime total 26,872,884 bytes (25.63 MB); the offline package embeds them base64 (+33 %).

### Triangles by asset and LOD (LOD0 / LOD1 / LOD2)

**The old oak (lm.old-oak):** 81,632 / 15,413 / 2,826 (LOD0: 53,684 bark, 10,566 leaf cards, 968 carving).

| Species | Variants | LOD0 min–max (mean) | LOD1 mean | LOD2 mean | Height (m) | Crown radius (m) | Branch architecture |
|---|---|---|---|---|---|---|---|
| maple | 8 | 7,251–10,677 (9,884) | 2,158 | 270 | 11.6–14.1 | 4.5–6.0 | grown (species model) |
| oak | 6 | 3,592–17,521 (8,734) | 2,237 | 282 | 10.4–12.2 | 4.0–5.4 | Jungle Jim collection skeletons (3) + reshaped (3) |
| ash | 6 | 2,961–11,995 (6,949) | 1,538 | 195 | 9.7–12.3 | 4.0–5.1 | Jungle Jim collection skeletons (3) + reshaped (3) |
| birch | 6 | 2,422–3,651 (2,918) | 684 | 57 | 8.9–11.2 | 2.0–2.9 | grown (species model) |
| white pine | 6 | 6,592–10,146 (8,274) | 1,816 | 238 | 10.5–12.0 | 3.1–3.8 | grown (species model) |
| spruce | 6 | 4,916–8,594 (7,431) | 1,529 | 298 | 9.9–12.6 | 2.7–3.5 | grown (species model) |
| young | 6 | 406–508 (456) | 87 | 15 | 4.1–4.6 | 1.1–1.4 | grown (species model) |

| Shrub family | Variants | LOD0 / LOD1 / LOD2 (mean) | Size w × d × h (m, typical) |
|---|---|---|---|
| natural.big | 5 | 2,709 / 1,238 / 636 | 1.44 × 1.52 × 1.66 |
| natural.medium | 5 | 679 / 349 / 215 | 0.72 × 0.53 × 0.99 |
| natural.small | 5 | 213 / 115 / 54 | 0.71 × 0.72 × 0.58 |
| globe | 3 | 3,401 / 1,512 / 915 | 0.87 × 0.74 × 0.93 |
| hedge | 2 | 3,300 / 1,506 / 897 | 1.16 × 0.84 × 0.87 |
| flowering | 3 | 227 / 119 / 56 | 0.53 × 0.54 × 0.43 |

| Ground plant | LOD0 / LOD1 |
|---|---|
| grass.lawn.1 | 116 / 4 |
| grass.lawn.2 | 100 / 4 |
| grass.lawn.3 | 132 / 4 |
| grass.long.1 | 100 / 4 |
| grass.long.2 | 84 / 4 |
| meadow.tall.1 | 6 / 4 |
| meadow.tall.2 | 6 / 4 |
| meadow.dry.1 | 6 / 4 |
| weed.groundcover.1 | 4 / 2 |
| weed.seedstalk.1 | 4 / 2 |
| flower.lace.1 | 4 / 2 |
| flower.susan.1 | 4 / 2 |
| weed.clover.1 | 2 / 2 |

### In the game (Chromium + ANGLE SwiftShader: software rendering, not a GPU)

Loaded in **1476 ms** in the page (wall clock incl. the page's own start: 1510 ms); 26,872,884 bytes; **9 materials**, **14 textures** (~128 MB GPU texture memory, uncompressed RGBA8 + mips estimate); 386 street trees (42 variants in use; species {'maple': 159, 'birch': 11, 'spruce': 50, 'young': 16, 'ash': 39, 'pine': 56, 'oak': 55}), 553 shrubs and perennials, 12487 lookout meadow plants.

| Same frame (camera recorded) | Draw calls authored / procedural | Triangles authored / procedural | Vegetation triangles (authored) |
|---|---|---|---|
| G01-prologue-start-street | 579 / 484 | 948,257 / 766,286 | 281,951 |
| G04-shrubs-driveways-porches | 329 / 214 | 764,927 / 513,048 | 363,477 |
| G04b-jamies-house | 466 / 351 | 914,082 / 688,621 | 320,394 |
| G05-grass-beside-sidewalk | 686 / 598 | 1,363,339 / 1,124,802 | 344,699 |
| G03-street-trees | 608 / 525 | 1,046,013 / 841,287 | 333,648 |
| G06-the-lookout | 237 / 156 | 565,119 / 177,869 | 474,843 |
| G07-oak-from-the-cul-de-sac | 241 / 163 | 557,252 / 174,174 | 479,517 |
| G07b-oak-silhouette-from-124m | 328 / 222 | 545,067 / 295,381 | 345,404 |
| G10-dusk-looking-home | 474 / 384 | 1,030,358 / 707,775 | 498,972 |
| G02-group-bicycle-ride | 537 / 454 | 953,699 / 782,376 | 271,998 |
| G08-oak-close-up-carving | 155 / 74 | 675,082 / 120,422 | 632,855 |
| G08b-oak-close-up-up-the-trunk | 145 / 73 | 668,855 / 130,868 | 632,859 |
| G09-the-tire-swing | 167 / 97 | 685,389 / 147,269 | 634,635 |
| G09b-the-other-bike | 160 / 84 | 680,313 / 129,205 | 636,587 |
| G03b-street-trees-beside-the-new-houses | 427 / 322 | 831,485 / 621,418 | 312,836 |
| G04c-yards-with-the-new-houses | 284 / 170 | 662,037 / 384,802 | 347,099 |
| G02b-group-ride-with-authored-bikes-and-houses | 508 / 414 | 1,111,022 / 878,897 | 347,099 |

Offline package with every model embedded (PLAYTEST_MODELS=1): 141,026,424 bytes; the vegetation loads from the embedded bytes with no network.

**Reading the same-frame table.** The authored set adds about 80–115 draw calls in street views (instancing is per variant, LOD
and material, while the procedural set was merged into world batches) and stays far below the Medium budget of 800 calls in every
view (worst: 686, the sidewalk view). The extra triangles are mostly the near lawn blades (~3,000–3,500 clumps within ~22 m) and,
at the lookout, the meadow (12,487 plants) and the oak's LOD0; the heaviest measured frame is still the sidewalk view at 1.36 M
triangles, which the procedural game already draws 1.12 M of. Loading: 26.9 MB in 1.2–1.5 s from a local server (software path;
decoding the WebP textures is part of that).

**Placement and stability (checked in the game, `browser/report.json`):** the oak on `LOOKOUT.oak` with 0 mm and 0° error; the
swing limb's underside 9 cm below the rope top, nothing in the rope's path (0 ray hits); the carving at the game's letter height
(3.134 m world) and bearing (0 error); every story mark clear; 129 sampled trees, the worst 5 mm from the ground; no crown in a
house; the LOD sweep stable along the street (no flicker in the sweep); forced LODs 0/1/2 switch all 386 trees; wind time advances
with the game's breeze and scales with `U`.

## 8. Gameplay captures and before/after (Stage E)

Every pair is **one frame, one camera**: the benchmark's `K` mode is switched between two renders without moving anything
(the camera pose is recorded in `browser/report.json`; `sameCamera` is checked). Cameras are the game's own riding and walking
cameras placed with the QA hook — they are review cameras, not a human's playthrough. Software WebGL (SwiftShader), 1600 × 900,
Medium profile. Captures are in `docs/qa/vegetation/browser/` (SHA-256 of each in `report.json`).

| Capture | What to look at | Same camera | Files (authored · procedural) |
|---|---|---|---|
| G01-prologue-start-street | the Prologue's starting street | yes | [G01-prologue-start-street--authored.jpg](qa/vegetation/browser/G01-prologue-start-street--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G01-prologue-start-street--procedural.jpg) |
| G04-shrubs-driveways-porches | beds and shrubs at a porch and driveway | yes | [G04-shrubs-driveways-porches--authored.jpg](qa/vegetation/browser/G04-shrubs-driveways-porches--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G04-shrubs-driveways-porches--procedural.jpg) |
| G04b-jamies-house | Jamie's house: the red chair on the porch, the beds | yes | [G04b-jamies-house--authored.jpg](qa/vegetation/browser/G04b-jamies-house--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G04b-jamies-house--procedural.jpg) |
| G05-grass-beside-sidewalk | grass beside the sidewalk, from the riding camera | yes | [G05-grass-beside-sidewalk--authored.jpg](qa/vegetation/browser/G05-grass-beside-sidewalk--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G05-grass-beside-sidewalk--procedural.jpg) |
| G03-street-trees | street trees down Oak Hollow Drive | yes | [G03-street-trees--authored.jpg](qa/vegetation/browser/G03-street-trees--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G03-street-trees--procedural.jpg) |
| G06-the-lookout | the lookout from the stop | yes | [G06-the-lookout--authored.jpg](qa/vegetation/browser/G06-the-lookout--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G06-the-lookout--procedural.jpg) |
| G07-oak-from-the-cul-de-sac | the old oak from the cul-de-sac | yes | [G07-oak-from-the-cul-de-sac--authored.jpg](qa/vegetation/browser/G07-oak-from-the-cul-de-sac--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G07-oak-from-the-cul-de-sac--procedural.jpg) |
| G07b-oak-silhouette-from-124m | the oak readable by silhouette at 124 m | yes | [G07b-oak-silhouette-from-124m--authored.jpg](qa/vegetation/browser/G07b-oak-silhouette-from-124m--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G07b-oak-silhouette-from-124m--procedural.jpg) |
| G10-dusk-looking-home | evening: looking back down the street from the lookout | yes | [G10-dusk-looking-home--authored.jpg](qa/vegetation/browser/G10-dusk-looking-home--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G10-dusk-looking-home--procedural.jpg) |
| G02-group-bicycle-ride | the group ride (the friends riding beside) | yes | [G02-group-bicycle-ride--authored.jpg](qa/vegetation/browser/G02-group-bicycle-ride--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G02-group-bicycle-ride--procedural.jpg) |
| G08-oak-close-up-carving | the healed AR in the bark (after the colour-under-alpha fix; the evening light leaves this side of the trunk in shade, as for the procedural trunk) | yes | [G08-oak-close-up-carving--authored.jpg](qa/vegetation/browser/G08-oak-close-up-carving--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G08-oak-close-up-carving--procedural.jpg) |
| G08b-oak-close-up-up-the-trunk | under the oak, looking up the trunk into the limbs | yes | [G08b-oak-close-up-up-the-trunk--authored.jpg](qa/vegetation/browser/G08b-oak-close-up-up-the-trunk--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G08b-oak-close-up-up-the-trunk--procedural.jpg) |
| G09-the-tire-swing | the rope on the oak's own limb, the worn patch, the old bike | yes | [G09-the-tire-swing--authored.jpg](qa/vegetation/browser/G09-the-tire-swing--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G09-the-tire-swing--procedural.jpg) |
| G09b-the-other-bike | the other bike under the oak after the call (release test view) | yes | [G09b-the-other-bike--authored.jpg](qa/vegetation/browser/G09b-the-other-bike--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G09b-the-other-bike--procedural.jpg) |
| G03b-street-trees-beside-the-new-houses (`?bikes&houses&vegetation`) | street trees beside the authored houses (?bikes&houses&vegetation) | yes | [G03b-street-trees-beside-the-new-houses--authored.jpg](qa/vegetation/browser/G03b-street-trees-beside-the-new-houses--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G03b-street-trees-beside-the-new-houses--procedural.jpg) |
| G04c-yards-with-the-new-houses (`?bikes&houses&vegetation`) | yards, beds and lawns at the authored houses | yes | [G04c-yards-with-the-new-houses--authored.jpg](qa/vegetation/browser/G04c-yards-with-the-new-houses--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G04c-yards-with-the-new-houses--procedural.jpg) |
| G02b-group-ride-with-authored-bikes-and-houses (`?bikes&houses&vegetation`) | the group ride with the authored bikes, houses and vegetation | yes | [G02b-group-ride-with-authored-bikes-and-houses--authored.jpg](qa/vegetation/browser/G02b-group-ride-with-authored-bikes-and-houses--authored.jpg) · [procedural.jpg](qa/vegetation/browser/G02b-group-ride-with-authored-bikes-and-houses--procedural.jpg) |

Also: `P01-offline-package-oak-from-the-cul-de-sac.jpg` — the offline package (`PLAYTEST_MODELS=1`, opened from `file://` with the
browser offline) showing the oak from the embedded bytes. Blender renders of the same assets (rank 6, not the game) are listed in
§3 and §4.

**What the review found and fixed (Stage E).** (1) The first in-game run showed the inside walls of every trunk: the bark tubes
were wound inward (Cycles hid it); the kit now winds outward, with a signed-volume check. (2) The `AR` carving drew as a black
square: the bark material ignored the decal's cut-out, and the colour under its transparent pixels was black (Pillow resizes
RGBA premultiplied) — the same black made dark fringes on shrub leaves; both fixed (`glb_pack.py` re-encodes every cut-out image
from padded colour). (3) Far background trees floated where the procedural trees stood on hidden terrain: they are now grounded
on the visible land (worst 5 mm). (4) Lawn blades grew over walks and porches: the lawn now asks the game's own blocked-space
map. (5) The lawn's first blades read as dark weeds: lighter blade palette, crossed cards in the clumps.

## 9. Regression tests (Stage F)

Every suite was run **alone** (one browser at a time) on the final files (the run of `tests/vegetation-browser.mjs` started at
`7391152` with the carving fix already in the working tree — the files it tested are those committed in `7ff9ea1`; the others ran
at `c310d4a`/`91ab87d`, whose game files are the same). Software WebGL throughout. Reports in `docs/qa/vegetation/regression/`.

| Suite | Result | Accepted before | What it shows here |
|---|---|---|---|
| `node tests/vegetation-browser.mjs` (A–D) | **46 passed, 0 failed** (`browser/report.json`) | new | A: without `?vegetation` nothing of the benchmark is fetched, no `vg:` zones or records exist and the world is baked as accepted (379 shadow proxies; Node: identical geometry hash); B: the checks in §7, 17 same-frame pairs, the whole Prologue played to Chapter One with the flag on, no page errors; C: `?bikes&houses&vegetation` together; D: the `PLAYTEST_MODELS=1` package places the vegetation from embedded bytes with the browser offline (no request), and the default package fails loudly (label in red, procedural vegetation stays, nothing substituted) |
| `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs` | **818 passed** (`verify-quick.log`) | 818 | the gameplay, story and chapter state checks; the one difference is the already-known `2/alex-bike` DEV-switching difference, reported and not asserted, exactly as before this work |
| world bake check (Node, vs `bc20441`) | **5/5** (`world-bake-check.json`) | — | default world: 2,197 batches, 3,672,619 triangles, 2,371,203 shadow triangles — identical to the accepted build; `?houses` regroups the same triangle set |
| `node tests/house-browser.mjs` | **30 passed, 0 failed** (`regression-house-browser.json`) | 30 | the authored houses unchanged |
| `SHOTS=0 node tests/bike-browser.mjs` | **29 passed, 0 failed** (`regression-bike-browser.json`) | 29 | the approved bikes unchanged |
| `node tests/pipeline-browser.mjs` | **36 passed, 0 failed** (`regression-pipeline-browser.json`) | 36 | the Phase 0A pipeline (lab, game, offline packages) unchanged |
| `node tests/main-menu-browser.mjs` on the complete default package (`PLAYTEST_MENU=1 PLAYTEST_CHAPTER=final`, opened from disk) | **96 passed, 0 failed** (`regression-main-menu-package.json`) | 96 | the title screen, menus and whole-game package unchanged; no JavaScript errors; no network requests |

**Boundaries kept:** no story, dialogue, audio, music, main menu, sky/lighting, roads, bikes, houses, Chapter Eight destruction or
Astra's character work was changed; nothing merged into `main`. The only edits outside the new files are the inert recording hooks
(world.js, vegetation.js, houses.js, props.js, ambient.js's limb name), the flag in game.js, four registrations in
asset-library.js and the four authors in the final credits roll.

## 10. Budgets: justified exceptions

- **The old oak LOD0 is 81.6k triangles** against the plan's 40–60k: it is one instance in the whole game, drawn in three draw
  calls, the most important landmark, seen up close (the carving, the swing) and in silhouette at dusk; LOD1 (15.4k) takes over
  beyond 85 m and LOD2 (2.8k) beyond 210 m. Its textures are the hero sizes the plan allows (2048² bark and leaves).
- A few street-tree variants exceed the 15k LOD0 target (the largest collection oak 17.5k); the species means are 0.5–9.9k. LOD0
  is drawn only within ~34 m (a handful of trees in any view).
- Shrub globes and hedges are 3.3–3.4k at LOD0 (target 3k) because a clipped shrub must read as a solid mass of leaves.

## 11. Known limitations and next steps

- **No real GPU.** Every frame and timing here is software rendering (SwiftShader). Frame rate, GPU memory and frame time need a
  run on the Phase 0 reference hardware (A-45). GPU texture memory is an estimate (~128 MB for all vegetation, uncompressed RGBA8 +
  mips; the oak alone ~72 MB with its 2048² bark and leaves); KTX2 (L-7) would cut it several times; the oak's bark normal could
  drop to 1024² if the hardware run asks for it.
- **Draw calls.** Instancing is per variant, LOD and material: the street views draw ~100 more calls than the procedural set
  (which was merged into world batches), within the Medium budget (≤ 800) in every measured view. A later three.js `BatchedMesh`
  with instances (r166+) could collapse the trees to a handful of calls.
- **Package size.** The four runtime files are 26.9 MB (25.6 MiB; normals, occlusion and wind packed into bytes; WebP textures); base64 in
  the offline package adds a third.
- **Species spread (needs approval).** The procedural generic `maple` is spread over maple (60 %), oak (22 %) and ash (18 %), and
  `pine` over white pine and spruce, by position (art bible §5.1 species language). Positions and sizes are unchanged; if you prefer
  maples everywhere the mapping is one line (`SPECIES_OF` in vegetation-assets.js).
- **Near grass** grows on Oak Hollow Drive's lawns (front, side and the curb strip, to 34 m from the centre line); the side
  streets and deep back yards keep the improved lawn material without blades.
- **LOD switches** are instant with 10 % hysteresis (no cross-fade); the lawn ring is rebuilt every ~1 m of movement and fades to
  nothing at its edge.
- **The tire swing (pre-existing).** The pivot is 2.45 m from the trunk's centre and the pendulum may reach ±0.75 rad, so a hard
  push toward the trunk can bring the tire near it — true of the procedural trunk too; the swing's behaviour was kept exactly.
- **Later chapters.** The oak is built to be the same tree everywhere, and its summer state is the only one validated. With the
  flag on, the authored set stays if one plays on: Chapter Eight's cuts do not damage the authored trees, the Chapter Six and
  Aftermath II "look at the carving" cameras aim ~0.4 m below the letters (they were written for the procedural trunk), and Alex's
  sitting place against the trunk (Chapter Eight) should be re-checked against the thicker trunk (radius 0.65 m at chest height vs
  0.49). None of this changes without the flag; it is the to-do list for shipping the oak beyond the Prologue.
- **Credits** are in the final credits roll; the title menu's Credits panel was not touched (main-menu boundary).
- **DEV labels with all three flags.** The vegetation label stacks under the bike and house labels; the house benchmark's own
  label still overlaps the bike label (pre-existing in `?bikes&houses`, house-benchmark.js was not touched).
- **Presentation vs game.** The Blender renders add Cycles-only leaf translucency and bark moss on top of the exported materials;
  the game's vegetation shader approximates both. Judge the game captures for the final look.

## 12. How to see it, how to rebuild it

- **Served:** `npx serve dist` (or any static server), open `index.html?vegetation` or `index.html?bikes&houses&vegetation`.
- **Offline:** `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>`, then open
  `<folder>/Last-Light-Playtest.html?bikes&houses&vegetation` (instructions: `tools/vegetation-playtest-readme.txt`).
  The delivered ZIP `Last-Light-Vegetation-Benchmark.zip` (69,188,493 bytes, SHA-256
  `8254c1dfccc05c1a6cdd1b0f853a0fa06ac78efc5d9434e0eb50a743a7703073`; not committed — `release/` is ignored) holds that
  `Last-Light-Playtest.html` (141,026,728 bytes, built at `ec10d29`, clean tree: the whole game with the title menu, the bikes,
  houses and vegetation embedded), START-HERE.txt, VEGETATION-README.txt, THIRD_PARTY_ASSETS.md, THREE-LICENSE.txt and the
  package manifest (every source hash). The two lab pages the packager also writes are left out (not needed here). Checked
  after extracting: opened from disk with the browser offline, `?qa&bikes&houses&vegetation` loads all three benchmarks with
  **no network request** and no page error.
- **Rebuild** (bpy 5.0.1, numpy, scipy, Pillow): `node tools/assets/oak-site.mjs`; `python tools/blender/vegetation/oak_skeleton.py`;
  `python tools/blender/vegetation/veg_textures.py`; `oak_build.py`, `street_build.py`, `shrub_build.py`, `ground_build.py`;
  `python tools/blender/vegetation/glb_pack.py dist/assets/veg/*.glb`; validate with `node tools/assets/validate-glb.mjs <glb> --profile veg`.
  Renders: `oak_render.py`, `street_render.py`, `shrub_render.py`, `scene_renders.py street grass`. Measurements:
  `python3 tools/blender/vegetation/veg_measure.py`. Browser checks: `node tests/vegetation-browser.mjs`.

**Final runtime files** (the benchmark's; THIRD_PARTY_ASSETS.md lists them too):

| File | | Bytes | SHA-256 |
|---|---|---|---|
| `dist/assets/veg/lm.old-oak.glb` | the old oak | 6,556,112 | `4a947c087d3e76dee74af8442c7e8755afda3812525bb916fe8897e579405154` |
| `dist/assets/veg/veg.street-trees.glb` | 44 street trees | 16,693,312 | `134dde67bc4110fd3038f7893129c1ceab692e3132afab122e0a327e8c4db54d` |
| `dist/assets/veg/veg.shrubs.glb` | 18 shrubs | 2,898,248 | `2e0baf6c09e19dfa1237b6484cfb061ca1feeecc140a6752b75a777c72e5555e` |
| `dist/assets/veg/veg.ground.glb` | 13 ground plants | 725,212 | `48ea0331638e9cb3c90a0d18cab93a7071b3c74cfe68025e01232b2ed4102599` |
