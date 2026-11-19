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
