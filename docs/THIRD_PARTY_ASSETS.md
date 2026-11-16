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
