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
