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

MEASUREMENTS

## 8. Gameplay captures and before/after (Stage E)

CAPTURES

## 9. Regression tests (Stage F)

REGRESSION

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
- **Package size.** The four runtime files are 25.8 MB (normals, occlusion and wind packed into bytes; WebP textures); base64 in
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
- **Presentation vs game.** The Blender renders add Cycles-only leaf translucency and bark moss on top of the exported materials;
  the game's vegetation shader approximates both. Judge the game captures for the final look.

## 12. How to see it, how to rebuild it

- **Served:** `npx serve dist` (or any static server), open `index.html?vegetation` or `index.html?bikes&houses&vegetation`.
- **Offline:** `PLAYTEST_MENU=1 PLAYTEST_MODELS=1 node tools/package-playtest.mjs <folder>`, then open
  `<folder>/Last-Light-Playtest.html?bikes&houses&vegetation` (instructions: `tools/vegetation-playtest-readme.txt`).
- **Rebuild** (bpy 5.0.1, numpy, scipy, Pillow): `node tools/assets/oak-site.mjs`; `python tools/blender/vegetation/oak_skeleton.py`;
  `python tools/blender/vegetation/veg_textures.py`; `oak_build.py`, `street_build.py`, `shrub_build.py`, `ground_build.py`;
  `python tools/blender/vegetation/glb_pack.py dist/assets/veg/*.glb`; validate with `node tools/assets/validate-glb.mjs <glb> --profile veg`.
  Renders: `oak_render.py`, `street_render.py`, `shrub_render.py`, `scene_renders.py street grass`. Measurements:
  `python3 tools/blender/vegetation/veg_measure.py`. Browser checks: `node tests/vegetation-browser.mjs`.
