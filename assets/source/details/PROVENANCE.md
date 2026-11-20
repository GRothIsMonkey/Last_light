# Prologue neighborhood details — source provenance

Benchmark `?details` (branch `claude/prologue-neighborhood-details-benchmark`). This file records, for every runtime file in
`dist/assets/details/`:
- what it is made from;
- where that came from;
- under which licence.

Credits: `docs/THIRD_PARTY_ASSETS.md`. Hashes of every file here: `SHA256SUMS`.

## No new third-party models

The brief allows no new Sketchfab assets, and none was used. Every mesh in `details.kit.glb` is original Last Light work,
built from scratch by `tools/blender/details/build_details.py` (Blender 5.1.2 as a Python module) from dimensions of the
real objects (MUTCD sign sizes, a 2 in square sign post, a 22 in kettle grill, a 12 ft trampoline and so on). The kit reuses
the street-props kit's mesh and UV helpers (`tools/blender/streetprops/build_props.py`). No geometry from any third-party
model is in it.

## Textures

`tools/blender/details/details_textures.py` generates every texture procedurally, with numpy and Pillow and fixed seeds:
- T1-11 siding, shingles, webbing, the trampoline mat, ball surfaces, the kiddie pool's print, the laundry;
- galvanized steel, aluminium, plastics and paints;
- the chain link, netting and swing-chain cut-outs;
- the sign faces and backs.

The script draws on two inputs:

| Input | Source | Licence | Used for | Changes |
|---|---|---|---|---|
| The `wood_grey` tile of the street-props atlas (`assets/source/street/textures/props_albedo.jpg`, `props_normal.png`, `props_orm.png`) | "Wooden Fence" by DmitriyGDS (sketchfab.com/DmitriyGDS) · https://skfb.ly/6rNUp; original byte for byte in `assets/source/street/third-party/sketchfab-originals/wooden_fence.glb` (see `assets/source/street/PROVENANCE.md`) | CC BY 4.0 (already credited by the street-props benchmark) | the lookout field fence's posts and rails | the street props' weathered-grey grade, copied unchanged into this atlas (512², its normal and roughness) |
| Overpass SemiBold and Bold (`fonts/overpass-latin-600-normal.woff`, `fonts/overpass-latin-700-normal.woff`) | The Overpass Project Authors (https://github.com/RedHatOfficial/Overpass), from the npm package `@fontsource/overpass@5.1.0` | SIL Open Font License 1.1 (`fonts/OFL-LICENSE.txt`) | the legends of the street signs, rasterized into `details_signs.jpg` | none to the font. The game does not ship the font itself; it ships only images of the lettering. |

## Runtime files (`dist/assets/details/`)

| File | Made by | From |
|---|---|---|
| `details.kit.glb` | `build_details.py` | original geometry |
| `details_albedo.jpg`, `details_orm.png`, `details_normal.png` | `details_textures.py` | procedural; plus the `wood_grey` tile above |
| `details_cutout.png` | `details_textures.py` | procedural |
| `details_signs.jpg` | `details_textures.py` | procedural; lettering in Overpass |

`assets/source/details/textures/` holds the same five files and `details_atlas.json`: the tile rectangles and the source of
each tile. `details.kit.blend` is the editable Blender scene, and `build-stats.json` holds the triangle counts per piece and
LOD, the attachment table and the contact points.
