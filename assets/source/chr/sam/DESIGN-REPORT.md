# Sam · Phase 1A visual approval

**Last Light · Roth Studios · August 2011 · Age 12**
**Status** — Submitted to Grayson Roth for visual review.

## The comparison

Open [the matched faces](review/comparison/02-faces-front.png) and [the full-body lineup](review/comparison/01-lineup-front.png). Jamie stands on the left and Sam on the right. Both appear in a single Blender render for each view, with neutral expressions, one orthographic camera, one AgX exposure, shared directional lights and a common ground plane. Each model retains its authored scale. The face view preserves their height difference.

Sam’s long cheek-to-chin line, lower cheek volume and straight nasal bridge carry his identity in profile. From the front, the narrower jaw, closer-set dark eyes, flatter brows and quieter lip line distinguish him from Jamie. The inner brow has a small asymmetry. The slight smile lifts one corner and tightens the lower lid. His smaller frame and the slight forward carry of his neck remain visible in the full-body lineup.

The complexion revision sets one warm medium-brown range for his face, neck, arms and legs. The nose and ears carry a little more warmth, with lighter variation across the cheekbones and darker pigmentation near the lids. The comparison uses one exposure for both boys. The complexion difference comes from Sam’s material maps.

| Neutral-model measurement | Jamie | Sam |
|---|---:|---:|
| Ground to anatomical crown, excluding hair and cap | 1.550 m | 1.497 m |
| Horizontal spacing between the modelled iris centres | 61 mm | 53 mm |
| Horizontal span between the highest points of the two sleeve-setting seams | 311 mm | 270 mm |

The shoulder measurement follows the worn shirts. All three measurements use the saved model geometry in metres.

## Silhouette and summer kit

The near-black brown shag opens above one brow, sweeps across the other and hangs longer behind the ears. In the full-body views, the sage-teal henley reads first, followed by its cream trim and the dark blue-gray shorts. Three small buttons, shallow flap pockets and woven stays on the gray trail runners provide detail at closer distances.

The proposed stature follows the canon’s 1.50 m target. The specific fringe length, neckline, pocket design, degree of facial reserve and final family resemblance remain open for art direction. Jamie’s accepted Phase 1A scene supplied the comparison benchmark.

## Editable source

[Open Sam’s Blender project](chr.sam.a12.blend). It opens in the metric `REF` scene on the three-quarter camera. The body has 7,093 control vertices. Its original UV layout, editable surface, neutral basis and **Review • quiet smile** shape key remain available. Hair, eyes, clothing and shoes are separate components. All eight authored PNG textures are packed and also included in [textures](textures/). The licensed, unmodified GLB is in [source](source/). [Source attribution and modification history](PROVENANCE.md)

The eight numbered cameras cover full body front, side and three-quarter, neutral face front, profile and three-quarter, the slight smile, and a golden-hour driveway portrait. The [contact sheet](review/Sam-contact-sheet.png) presents those eight views. Their [original PNGs](review/renders/) are 880 × 1100, rendered in Blender 5.2.2 LTS with Cycles, 60 samples and denoising on an NVIDIA GeForce RTX 4060 Ti.

The embedded Blender text **Re-render the eight review cameras.py** recreates the studies and restores the original review state. The evening view uses a static presentation pose and the garage set. The [comparison script](review/recreate-comparison.py) accepts the Jamie and Sam scenes plus an output directory. Its two companion renders use 64 samples.

## Review boundary

The neutral studies and matched lineup establish Sam’s appearance at rest. The fringe still reads as grouped locks in a tight profile. Its behaviour in motion, eye performance during dialogue and the transition into a smile need a later performance pass. Production topology, runtime material budgets, texture baking, LODs, skinning, full expressions, bike contact and gameplay lighting remain unvalidated. The scene contains no armature or animation actions.

This checkpoint starts directly from the accepted Phase 0A foundation, `0fbb3ecb70669a04bcf6adbb5bc11fed5403797d`, on `codex/astra-phase1a-sam-character-design`. The summer colours and proportions follow the Jamie and Sam entries in `dist/cast.js` and the Character Canon. Sam’s visual approval is the next decision.
