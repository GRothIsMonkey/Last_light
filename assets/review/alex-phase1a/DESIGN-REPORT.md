# Last Light · Alex

Roth Studios · Phase 1A targeted refinement · Visual approval pending

**Alex-before-and-after.png** compares the original and refined neutral portrait, three-quarter portrait and hair profile. Each column uses the same camera and lighting for both rows. For the profile, both versions were rendered with a slightly wider frame to show the nape.

## What changed

**Eyes.** The upper lids cover more of the green-hazel irises. The lower lids curve into the cheeks and sit at slightly different heights. Both eyes look just off centre, towards the same point. In the earlier model, two visible surfaces contributed competing pupil edges and reflections. A single curved corneal surface now carries the visible iris and catches the studio light. The centre of the visible opening decreased from approximately 10.5 mm to 8 mm.

**Face and expression.** A softer transition from the nasal wings into the cheeks preserves Alex’s short button nose. The lower lip now meets the upper lip in depth, and the mouth corners settle into the surrounding cheek. The listening smile lifts one corner a little more than the other, with a small response in the cheek pads and lower lids. Local warmth across the cheeks, lips and inner eye corners sits over the existing light complexion and freckles. The upper ears were tucked inward by up to 3 mm.

**Hair.** The existing chestnut fibres follow broad S-shaped bends across the crown and temple. Neighbouring strands gather into locks of differing widths, then separate at the fringe and nape. Shorter inner hairs lie closer to the temple beneath the exterior wave. All 74,142 roots retain their previous positions.

**Cast and wardrobe.** Jamie and Sam use the exact model and texture files from checkpoint `85891d7be184`. Alex wears the same gold three-button polo, cream collar, olive shorts and dark shoes, with the same stance and scale. The full-body lineups show Jamie on the left, Sam in the middle and Alex on the right.

## Review files

| File or folder | Contents |
|---|---|
| `Alex-before-and-after.png` | Three matched portrait and silhouette comparisons |
| `Alex-review-sheet.png` and `renders/` | Eight full-resolution Blender views, including the listening smile and August evening |
| `Cast-lineups.png` and `comparison/` | Same-scale front, side and three-quarter group views, a face comparison and detail renders |
| `models/alex/` | Editable packed Blender scene, separate texture maps and source credit |
| `source/child.glb` | Original anatomical starting mesh by gelmi.com.br |
| `VERIFICATION.md` and `SHA256SUMS.txt` | Scene checks and recovery manifest |

To render again in Blender 5.2.2 LTS, run `blender -b -P render-alex.py -- all` or `blender -b -P render-lineups.py` from this folder. The Alex scene also includes an eight-camera render script in its Text Editor.

Local branch `codex/astra-phase1a-alex-character-design-fix1` continues from `85891d7be184`. Review Alex’s resting gaze and listening smile, the amount of wave in profile, and his place in the three-boy lineup.
