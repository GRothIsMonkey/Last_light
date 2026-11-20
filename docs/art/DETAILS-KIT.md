# Neighborhood-details kit — model-to-game mapping

Part of the Prologue neighborhood-details benchmark (`?details`; report:
[../DETAILS_RECONSTRUCTION_REPORT.md](../DETAILS_RECONSTRUCTION_REPORT.md)). It covers how each remaining procedural detail of
the Prologue maps to an authored piece, the frame each piece is modelled in, and how to rebuild everything. It follows the
street-props kit ([STREET-PROPS-KIT.md](STREET-PROPS-KIT.md)): same conventions, same shading, same method.

## Conventions

- Every piece is modelled in the local frame of the procedural object it stands for (x right, y up, the object's +z). The
  game places it with the recorded group's world matrix and nothing else. Blender holds it as (x, −z, y); the glTF export
  maps it back (`G()`).
- Node names keep their dots in Blender (`toy.wagon.lod0`); three.js drops them on load, and the loader looks names up
  through `PropertyBinding.sanitizeNodeName`.
- The GLB carries geometry, UVs and material *names* only. The game builds the materials from the atlases in
  `dist/assets/details/`:

  | Material | Built from | Used for |
  |---|---|---|
  | `dt_A` | the details atlas | almost everything |
  | `dt_cut` | cut-outs | chain link at u ≥ 100, enclosure netting at u ≥ 200, swing chain at u ≥ 300; each tile repeats on its own |
  | `dt_sign` | the sign atlas | sign faces |
  | `dt_water` | — | the kiddie pools' water |

- Per-instance attributes:
  - `iTint`: linear RGB for the atlas's paint mask. It carries the recorded colours of the shed walls and roofs, the
    lawn-chair webbing, the kid's bike frames and the scooter stems.
  - `iVar`: seed, age, unused, and soil. Soil (0 or 1) controls whether dirt shows at the object's foot: none for what
    lies flat in the grass or stands on a porch or deck.
- Atlas pixel rectangles (origin top-left) are listed in `assets/source/details/textures/details_atlas.json`. Every masked
  region (`maskLevel` there) is levelled to 0.46 linear, the street props' level, so that tint × albedo × 2 returns the
  recorded colour.
- The root node's extras hold two tables:
  - `dt_attach`: hose exit, bib outlet and height, sprinkler head pivot, post top, blade size, plate offset.
  - `dt_contacts`: each piece's lowest points.

## Pieces and placement

| Recorded (W.dt) | Built in | Pieces | Placement | LOD distances (m) |
|---|---|---|---|---|
| `signs` (5 assemblies, 9 plates) | `furniture.js` | `sign.post`, `sign.anchor`, `sign.bracket` (junctions), `sign.blade.<NAME>` ×3, `sign.stop`, `sign.speed`, `sign.children`, `sign.outlet` | post: the post group, lowered so its top is the recorded height; plates: post × turn(recorded) × up(recorded); blades: post × up × turn | 40 / 110 / 320 |
| `chairs` (56 on Oak Hollow: 48 porch, 8 lawn) | `props.js`, `houses.js` | `chair.lawn` (green: folding aluminium, woven webbing), `chair.resin` (white lawn chairs, porch pairs) | lawn chairs: the chair group, settled on the lawn; porch chairs: mapped through the house's draped frame as the bake maps the house, turned half a turn; none on a story home, a house-benchmark lot or Old Mill Road | 22 / 55 / 170 |
| `grills` (32 on Oak Hollow) | `houses.js` | `grill` (22 in kettle) | mapped through the house's draped frame (`P.toWorld`, the same ground) as the bake maps the house; on a patio, raised to the slab's top | 22 / 55 / 170 |
| `toys` (24) | `props.js` | `toy.bigwheel`, `toy.wagon`, `toy.scooter`, `toy.kidbike`, `toy.basketball`, `toy.playball` | the toy group, settled; balls: centre at ground + radius | 18 / 45 / 140 |
| `pools` (5) | `props.js` | `pool.kiddie`, `pool.water` | the pool group, levelled | 25 / 70 / 200 |
| `hoses` (32 recorded; 21 seen) | `props.js` | `hose.coil`, `hose.bib` + a generated hose run | coil at the record, turned to face its bib; bib on the nearest clear wall (found by a ray); coils the old formula put inside a house left out | 18 / 45 / 140 |
| `sprinklers` (4) | `ambient.js` | `sprinkler.base` (on the root), `sprinkler.head` (on the game's turning head) + a hose run | the game's own groups; the jet untouched | — |
| `trampolines` (23), `swings` (19) | `props.js` | `trampoline` + `trampoline.net`, `swing` | the group, levelled (high-side feet sink a little) | 35 / 90 / 280 |
| `sheds` (9 + 36 behind the rear fences) | `props.js`, `background.js` | `shed` + `shed.roof`, `shed.small` + `shed.small.roof` | the group (walls and roof tinted with the recorded colours) | 35 / 90 / 280 |
| `clotheslines` (6) | `props.js` | `clothesline` | the group, levelled | 35 / 90 / 280 |
| `fences` (8 creek runs: 56 bays, 64 posts) | `props.js` `fenceRun` on Briarwood's frame | `fence.chain` (unit bay), `post.chain` | each bay sheared between its two posts on the frame's ground (as the street props do on Oak Hollow) | 18 / 52 / 190 |
| `fieldFence` (14 posts, 28 rails) | `props.js` | `ff.post`, `ff.rail` (unit rail along x) | posts at the recorded knoll heights; each rail stretched between its recorded ends | 18 / 52 / 190 |

## Rebuild (deterministic)

```
pip install bpy==5.1.2 numpy pillow                          # Blender 5.1 as a Python module (or blender --background --python)
python3 tools/blender/details/details_textures.py           # atlases -> assets/source/details/textures/
python3 tools/blender/details/build_details.py              # -> details.kit.blend + dist/assets/details/details.kit.glb
cp assets/source/details/textures/details_{albedo.jpg,orm.png,normal.png,cutout.png,signs.jpg} dist/assets/details/
python3 tools/blender/details/render_details.py docs/qa/details/blender   # optional Blender inspection renders
```

The texture script reads three things:
- the vendored Overpass font (`assets/source/details/fonts/`);
- the street-props atlas's weathered fence-wood tile, `wood_grey`, from DmitriyGDS's CC BY 4.0 "Wooden Fence", for the
  lookout's rails;
- its own fixed seeds.

`build_details.py` reuses the street-props kit's mesh and UV helpers (`tools/blender/streetprops/build_props.py`), pointed at
this kit's atlas.
