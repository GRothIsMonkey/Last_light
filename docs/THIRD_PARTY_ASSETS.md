# Third-party assets

## The creature in Chapter Three

"Smily horror monster" (https://skfb.ly/6W6ut) by Bento is licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/).

- Title: Smily horror monster
- Author: Bento (https://sketchfab.com/gostbento)
- Source: https://sketchfab.com/3d-models/smily-horror-monster-3d3fc31eddaa409a8f2df564823154e1 (short link https://skfb.ly/6W6ut)
- License: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/
- Modified/optimized for use in Last Light (changes listed below). The author does not endorse Last Light or this use.

### Files

| File | What it is |
|---|---|
| `assets/source/creature/smily_horror_monster.glb` | The original file as supplied, byte for byte (12,943,960 bytes, SHA-256 `85c2969d61e1c0bcad4934be43a070be4d80384d6924455f509e11584def0529`). Never edited. Its embedded `asset.extras` (title, author, license, source) are intact. Not loaded by the game. |
| `dist/assets/creature/creature.glb` | The runtime copy the game loads (2,583,500 bytes, SHA-256 `e86b69df95ce1a96519f0eb720f3dc58cb15d07f3848e35c5f8891047add51b3`). |
| `tools/creature/repack_glb.py` | The script that made the runtime copy from the original (`python3 tools/creature/repack_glb.py <original> <runtime>`, needs Pillow). |

### What the original contains (inspected before use)

glTF 2.0 binary, generator Sketchfab-16.52.0. One skinned mesh with one primitive: 13,205 vertices, 23,820 triangles (positions, normals, tangents, two UV sets, joints, weights, 32-bit indices). One material ("Material.001", double-sided, metalness 0): base colour, occlusion/roughness/metalness (one texture), normal map; three embedded 2048 × 2048 PNGs (2.96, 3.80 and 4.79 MB). A 55-node hierarchy (Sketchfab root matrices, an FBX −90° X rotation, an armature at scale 100) and one skin of 46 joints. One animation, "Armature|ArmatureAction", 3.25 s, linear, 53 channels: an idle (jaw, hands, fingers, a little arm movement; no body or root motion). Modelled in centimetres, on all fours, facing about +Z (turned about 11°).

### Conversions made for Last Light

In the runtime copy only:

- the three textures re-encoded from PNG to JPEG: base colour kept at 2048 × 2048 (quality 88), the occlusion/roughness/metalness texture and the normal map resized to 1024 × 1024 (quality 90 and 94; no chroma subsampling for those two). 11.5 MB of textures become 1.2 MB;
- the binary chunk rebuilt around the new images (every other buffer view copied unchanged);
- a note added to `asset.extras` (`lastLightRuntime`) saying what was changed and where the original is. The original `asset.extras` (title, author, license, source) are kept.

Unchanged: the geometry (all 23,820 triangles; it was not decimated), the skin and skeleton, the animation, the material and its parameters.

At load time (`dist/creature-asset.js`, `dist/creature.js`), without changing the file: the model is turned to face exactly along its heading, scaled from centimetres to metres × 1.35, and set with its lowest point on the ground; the idle clip plays, and its limbs, spine and head are moved procedurally on top of it (its gait, rearing, clawing, looking), since the file has no locomotion. The material gets the same small "catch light" shader addition as the other figures in the drain (a little more of its own colour where a flashlight beam lands on it from far off).

The monster's design was not changed.

## Chapter Seven

Chapter Seven adds **no third-party assets**. Its places, people, props, paper, the hunter's stand-in and its sounds are
all generated at runtime by the game's own code (`dist/chapter7*.js`, `dist/audio.js`). The hunter's adapter can load a
replacement `.glb` later; any such model must be recorded here first (source, author, licence, SHA-256), as
`docs/CHAPTER7_CREATURE_ASSET_GUIDE.md` requires.

## The asset pipeline (Phase 0A)

**Runtime code.** Three files from three.js **r160** (npm `three@0.160.0`, the same release as the vendored `dist/three.module.js`, which is byte-identical to that package's `build/three.module.js`), MIT licence, already covered by `dist/THREE-LICENSE.txt` (shipped in every package):

| File in `dist/` | Original in `three@0.160.0` | Changed | SHA-256 of the original |
|---|---|---|---|
| `three-addons-gltf-loader.js` | `examples/jsm/loaders/GLTFLoader.js` | only its two import specifiers (`'three'` → `'./three.module.js'`, `'../utils/BufferGeometryUtils.js'` → `'./three-addons-buffer-geometry-utils.js'`) | `d073b438e6a07e1359741dd5d6c76c953420cc0d4fd84eb1bdde94315540e6a3` |
| `three-addons-buffer-geometry-utils.js` | `examples/jsm/utils/BufferGeometryUtils.js` | only its import specifier | `9be041e96308775d00e2695cc607645b9a9b64fd7c0e759dd8f7c00a8d92becb` |
| `three-addons-skeleton-utils.js` | `examples/jsm/utils/SkeletonUtils.js` | only its import specifier | `83748c5072a5ce96e9d68d8efda908a1f1a06c0b5fd2618edc3e54a361a8fd5b` |

`diff` against the package shows only the import lines. GLTFLoader mentions an example CDN address in a code comment; it makes no request by itself, and the game gives it only bytes already in memory.

**The test model.** `dist/assets/tst/tst.pipeline-probe.glb` and its source `assets/source/tst/pipeline-probe/` are **original** (generated by `tools/blender/build_pipeline_probe.py`; see its `PROVENANCE.md`). No third-party content. Embedded in the offline package only when it is built with `PLAYTEST_MODELS=1`.

**Development tools, not distributed** (never in `dist/` or a package): Blender (GPL; any copy, or the `bpy` module from PyPI) runs the export scripts on the artist's computer; the Khronos glTF Validator (npm `gltf-validator`, Apache-2.0) is used by `tools/assets/validate-glb.mjs` when installed. Models exported by Blender are not covered by Blender's licence (Blender's output belongs to its author).

## Typefaces in the menus

The title screen and menus use two typefaces, embedded in `dist/fonts.css` as Latin-subset WOFF2 data (taken unmodified from the `@fontsource/cormorant-garamond` and `@fontsource/karla` 5.3.0 packages), so the game never fetches a font and works offline.

| Typeface | Weights embedded | Copyright | Licence |
|---|---|---|---|
| Cormorant Garamond | 300, 300 italic, 500, 500 italic | Copyright 2015 The Cormorant Project Authors (github.com/CatharsisFonts/Cormorant) | SIL Open Font License 1.1 |
| Karla | 400, 600 | Copyright 2019 The Karla Project Authors (github.com/googlefonts/karla) | SIL Open Font License 1.1 |

The fonts are not sold on their own and are not renamed. The licence text follows, as the licence requires.

```
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL


-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
```

## Jamie's BMX: components from a Sketchfab BMX (Phase 1 bicycle benchmark)

"Bmx Bike" (https://skfb.ly/oUoKB) by Mitchell is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).

- Title: Bmx Bike
- Author: Mitchell (https://sketchfab.com/MitchellBr)
- Source: https://sketchfab.com/3d-models/bmx-bike-62efadd576304b38808149e2558d8d8a (short link https://skfb.ly/oUoKB)
- License: CC BY 4.0, http://creativecommons.org/licenses/by/4.0/ (checked on the model page on 2026-11-18: "CC Attribution", downloadable; the author's description adds no further terms)
- Supplied by the creative director as a starting point for `bike.jamie`. Modified for Last Light (changes listed below). The author does not endorse Last Light or this use.

### Files

| File | What it is |
|---|---|
| `assets/source/bike/third-party/sketchfab-bmx-bike-mitchell/bmx_bike.glb` | The original file as supplied, byte for byte (24,913,704 bytes, SHA-256 `11f3c4b640a7f7d89bb70b38e9a20c6e9370cbc47b2e8e55246117e2f013c950`). Never edited. Its embedded `asset.extras` (title, author, license, source) are intact. Not loaded by the game. |
| `dist/assets/bike/bike.jamie.glb` | Jamie's bike: original Last Light work that incorporates the modified geometry listed below (size and SHA-256 in `docs/qa/bikes-phase1/validate-bike.jamie.json`). Its `extras.ll_license` carries this attribution. |
| `tools/blender/bikes/source_bmx.py` | The script that takes the components from the original and fits them to Jamie's bike. |

### What the original contains (inspected before use)

glTF 2.0 binary, generator Sketchfab-16.14.0, extension `KHR_materials_specular`. 28 meshes (one primitive each), 118,300 triangles, 60.3k vertices; 2 materials ("Bmx_Bike", "Bmx_Wheels", double-sided) with six embedded 2048 × 2048 textures (base colour JPEG, ORM/normal PNG, 23.4 MB together). No skins, no animation. Modelled in units of about 1.7 mm (its 20-inch wheels are 299 units across), facing −Y with Z up after import. A modern freestyle BMX: frame, fork, two-piece bars, grips, top-load stem, pivotal seat, 3-piece cranks, a 36-tooth guard sprocket, platform pedals, four pegs, a rear U-brake with its lever and cable, chain, spoked wheels. **Its textures carry real brand marks** (a frame maker's logo and decals, a tyre maker's name), which the art bible forbids reproducing.

### What Last Light uses, and how it was changed

Geometry only, of seven components: the guard sprocket, the two platform pedals, the pivotal seat, the top-load stem (its three pieces), the brake lever assembly (bracket, blade, barrel adjuster) and the two U-brake arms. For each: converted to metres (× 0.0017), merged, planar-dissolved and decimated (sprocket 816 → 640 triangles, pedals 548 → 300 each, seat 3,776 → 900, stem 6,604 → 960, lever 2,820 → 520, U-brake 1,732 → 760; further for LOD1/LOD2), given new UVs in Jamie's texture atlases, re-textured by Last Light's own finish library (`tools/blender/bikes/bike_textures.py`: no source texture is used anywhere), and moved onto Jamie's riding anchors from `dist/rig.js` (the stem re-angled from the source's 20.5° head angle to the game's 16.4°). Measured from the geometry: the sprocket has 36 teeth, so Jamie's chain and rear cog (16 teeth) were built to match it.

Not used: the source frame, fork, bars, grips, cranks, pegs, wheels, tyres, chain, bolts and cable, and none of its six textures. Those were rebuilt with the same kit as the other three bikes (`tools/blender/bikes/`), so all four bikes share one construction and material language; the source frame could not be used at all, because its proportions do not fit Jamie's anchors (wheelbase/wheel-radius 3.88 against the game's 3.31).

The other three bikes (`bike.sam`, `bike.alex`, `bike.player`) contain **no third-party content**.

### Tools and fonts (not distributed as such)

Blender 5.0.1 (the `bpy` module from PyPI) and Pillow build the bikes; the decal and tyre lettering is rendered into the textures with DejaVu fonts (Bitstream Vera / DejaVu licence, which allows this). The brand names on the bikes (REDTAIL, NORTHLINE, Cloverdale, EASTWIND; tyres DURALINE) are invented for Last Light.

## The Prologue's vegetation: four Sketchfab sources (vegetation benchmark, `?vegetation`)

Four models supplied by the creative director, each licensed under **Creative Commons Attribution 4.0**
(https://creativecommons.org/licenses/by/4.0/). Identity verified from each file's own embedded metadata (glTF
`asset.extras`: title, author, license, source), which matches the supplied `CREDITS.md`. The authors do not endorse
Last Light or this use. Nothing was scattered raw: every asset was rebuilt on the vegetation kit
(`tools/blender/vegetation/`), and what each contributes is listed below.

**Required notices (as shown in the final credits, `dist/final-credits.js`):**

- "200 year old oak tree" (https://skfb.ly/6vqWJ) by kungphil is licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Adapted for Last Light.
- "Realistic Trees Collection" (https://skfb.ly/pDzJR) by Jungle Jim is licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Adapted for Last Light.
- "Bush models pack (gameready, LODs)" (https://skfb.ly/pLE8N) by LOLIPOP is licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Adapted for Last Light.
- "Grass And Bush - Mobile GameReady" (https://skfb.ly/6WTVC) by Ali haghshenas is licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). Adapted for Last Light.

### Files

| File | What it is |
|---|---|
| `assets/source/vegetation/third-party/sketchfab-originals/*.glb.part00N` | The four originals as supplied, byte for byte, in the owner's split parts (the oak, 129.8 MB, is over GitHub's per-file limit). Never edited. `python3 reconstruct.py` (beside them) rebuilds the four files and checks every part's and every file's SHA-256 against `manifest.json`. `CREDITS.md` is the owner's credit list. Not loaded by the game. |
| `dist/assets/veg/lm.old-oak.glb` | The old oak (runtime): 6,556,112 bytes, SHA-256 `4a947c087d3e76dee74af8442c7e8755afda3812525bb916fe8897e579405154` (the benchmark's final files; `docs/VEGETATION_BENCHMARK_REPORT.md` lists them too). |
| `dist/assets/veg/veg.street-trees.glb` | 44 street-tree variants: 16,693,312 bytes, SHA-256 `134dde67bc4110fd3038f7893129c1ceab692e3132afab122e0a327e8c4db54d`. |
| `dist/assets/veg/veg.shrubs.glb` | 18 shrubs: 2,898,248 bytes, SHA-256 `2e0baf6c09e19dfa1237b6484cfb061ca1feeecc140a6752b75a777c72e5555e`. |
| `dist/assets/veg/veg.ground.glb` | 13 ground plants: 725,212 bytes, SHA-256 `48ea0331638e9cb3c90a0d18cab93a7071b3c74cfe68025e01232b2ed4102599`. |
| `dist/assets/veg/veg.lawn.glb` | The lawn and ground repair's textures and blade tile: **original work for Last Light, no third-party content** (generated by `tools/blender/vegetation/lawn_kit.py`; listed here only so the vegetation files are complete). |
| `assets/source/vegetation/{oak,street,shrubs,ground}/*.blend` | The Blender sources (scene EXPORT), with their runtime textures beside them. |

### 1. "200 year old oak tree" — kungphil

- Source: https://sketchfab.com/3d-models/200-year-old-oak-tree-337641cb274845b39f7944aa880ff686 (short link https://skfb.ly/6vqWJ); author https://sketchfab.com/kungphil.
- Original: `200_year_old_oak_tree.glb`, 129,820,864 bytes, SHA-256 `d6fc4186d2ae517ecfaacaa58ae3696641b08d3297ede0ad3d3654cb38b8d714`, generator Sketchfab-12.68.0.
- What it contains (inspected before use): **a coloured terrestrial laser scan, not a mesh** — 4,635,119 points (glTF POINTS; POSITION + COLOR_0; one unlit material; no faces, normals, UVs or textures), node name `oak_RGB_2cm.ply`. A real open-grown oak, 19.8 m tall, crown 25.8 × 28.2 m, trunk 1.26 m at chest height, scanned in leaf.
- Incorporated: **measurements, not geometry or textures.** The points were voxelized and skeletonized (`oak_skeleton.py`: geodesic level sets, pipe-model radii); the skeleton gives the oak's whole branch architecture and the scan's foliage voxels place its leaf cards. Kept: the trunk size and its fork at 3.3–4.3 m, every scaffold limb's path, the low limb that sweeps nearly to the ground, the crown's extent and gaps.
- Modified: turned 56° about the vertical to fit the lookout; the swing limb reshaped near the trunk to run over the game's swing pivot (blending back into its scanned path by 7.5 m); the trunk rebuilt as one stem with root flare and buttresses; surface roots, a dead stub, the healed AR carving added; bark, leaves and carving textures are not from this file (see 2 and the original bark). No point, colour or texture of the scan is in the runtime file.

### 2. "Realistic Trees Collection" — Jungle Jim

- Source: https://sketchfab.com/3d-models/realistic-trees-collection-fe67c886eebf4bcb988d7c45e69995ad (https://skfb.ly/pDzJR); author https://sketchfab.com/jungle_jim.
- Original: `realistic_trees_collection.glb`, 42,333,844 bytes, SHA-256 `773324d3894dbc10468b062c1519e701b8e3415773af2d7f666224eddc128f72`, generator Sketchfab-17.17.0.
- What it contains: 7 EZ-Tree trees (127,462 tris; modelled at ≈10× real size): 3 oaks and 3 ash-type trees with twig cards, 1 small pine. 14 materials over 5 unique textures: a photographic mossy oak bark (+ normal, 1024², not quite seamless), an oak twig photo, a pinnate (ash) twig photo, a pine sprig (1024² RGBA, alpha-BLEND).
- Incorporated: **geometry as skeletons** — the six oak and ash branch meshes, recovered ring by ring (`ez_skeleton.py`), are the branch architectures of the oak and ash street trees (re-scaled to 9.5–12.5 m, re-meshed; three further variants pruned on one side, bent and leaning). **Textures** — the oak, ash and pine twig photos (colour under the transparent pixels padded, graded to one late-August palette, cropped and re-packed into the leaf atlases of the hero oak and the street trees); the bark photo, high-passed and made seamless, as micro-detail inside the original barks. The collection's own meshes, UVs and materials are not in the runtime files.

### 3. "Bush models pack (gameready, LODs)" — LOLIPOP

- Source: https://sketchfab.com/3d-models/bush-models-pack-gameready-lods-f2d9ffd3e6a94cf0b9464ccd66a4c2f8 (https://skfb.ly/pLE8N); author https://sketchfab.com/lolipop_1707.
- Original: `bush_models_pack_gameready_lods.glb`, 8,048,292 bytes, SHA-256 `73aeab6e1b792965fe270e6a9985866c46b5214a522df0c42d2a38c163e8f7b6`, generator Sketchfab-17.17.0.
- What it contains: 15 bushes (5 big, 5 medium, 5 small) with LOD0/LOD1/LOD2 and a billboard each (23,301 tris); a branch-and-leaf atlas (1024², alpha-BLEND), a bark strip (128×1024), per-bush billboard textures; a checker floor and a human scale figure.
- Incorporated: **geometry and the LOD chain** of all 15 bushes (positions, normals, UVs, indices as supplied, re-centred), and the **branch atlas** (graded, re-packed with three colour variants). Not used: the billboards and their textures, the bark strip (the shared street bark is used), the floor and the figure.
- Modified: leaves alpha-tested instead of blended; occlusion and wind baked per vertex; trimmed globes and hedge blocks made by clipping the pack's own leaf layers into an envelope (with the next-coarser layer turned for density); low flowering perennials with an original flower layer on the atlas.

### 4. "Grass And Bush - Mobile GameReady" — Ali haghshenas

- Source: https://sketchfab.com/3d-models/grass-and-bush-mobile-gameready-8a6b8a18cbf74de8961c3a042d4edf9f (https://skfb.ly/6WTVC); author https://sketchfab.com/alihaghshenas821.
- Original: `grass_and_bush_-_mobile_gameready.glb`, 1,833,488 bytes, SHA-256 `d0ba3260cd912908f9b241e1500bdcc6121b9ca87aceaa881d5595dc07233259`, generator Sketchfab-12.68.0.
- What it contains: 4 cards (20 tris) on one 1024² atlas that is mostly not vegetation (hay bale, saguaro cactus, crate, barrel, chain, planks) plus four plant sprites: a seeded green grass tuft and a dry grass tuft (both stored upside down), a juniper-like sprig and a dried seed stalk.
- Incorporated: **those four sprites only** (cropped, turned upright, graded, packed into the ground atlas); they dress the lookout meadow (tall and dry tufts, seed stalks, groundcover). The cards, the other sprites and the original material are not used. Lawn blades, wildflowers and clover are original.
