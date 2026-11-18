# Provenance: the Prologue house kit and houses (`house.prologue`)

| | |
|---|---|
| What | Twelve houses of Oak Hollow Drive (Prologue architecture benchmark), three LODs each, built from one modular kit; the shared texture library; the interior atlas |
| Made by | Generated entirely by the scripts in `tools/blender/houses/` (Blender 5.0.1 as the `bpy` module, Python 3.11; numpy, SciPy, Pillow) for Last Light (Roth Studios), November 2026 |
| Inputs | The game's own lot plans (`dist/houses.js planLots`, `dist/layout.js`, `dist/palette.js`), dumped by `tools/assets/house-plans.mjs`; dimensions from `docs/art/ENVIRONMENT-STYLE-GUIDE.md` §2.2 |
| Third-party content | **None.** No photographs, scans, purchased or downloaded models, textures or fonts. Every texture is synthesized (`house_textures.py`) or rendered from rooms modelled in the same script (`interior_atlas.py`). House numbers are drawn as simple segment digits. |
| Brands | None. No product names, logos or real addresses appear. Addresses are invented (400 + 4 × lot index; even on the left side, odd on the right). |
| AI-generated images | None used as input or as evidence. |
| Licence | Original work for Last Light (Roth Studios) (`extras.ll_license`). |

## Files

| File | Made by |
|---|---|
| `kit/textures/house.kit__{siding,brick,roof,concrete,paint}_{basecolor.jpg,normal.png,orm.png}` | `house_textures.py` (authored 2048², written 1024²) |
| `kit/textures/house.kit__interior_{basecolor,emissive}.jpg` | `interior_atlas.py` (8 rooms rendered with Cycles at 512² each, strips painted; written 1024²) |
| `kit/textures/library.json` | the set's file list and mean colours (used for the vertex-colour tints) |
| `prologue/house.prologue.blend` | `build_houses.py`: scene EXPORT (the twelve houses, all LODs, the car house's garage door) |
| `prologue/build-stats.json` | triangles per house and LOD at build time |
| `../../dist/assets/house/house.prologue.glb` | `tools/blender/ll_export.py` from the EXPORT scene (vertex colours on, no tangents: see the report) |

Rebuild everything from nothing: `python tools/blender/houses/house_textures.py && python tools/blender/houses/interior_atlas.py && python tools/blender/houses/build_houses.py -- --houses all` (with the bpy venv's Python).
