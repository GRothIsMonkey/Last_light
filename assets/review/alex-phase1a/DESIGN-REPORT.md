# Last Light · Alex

Roth Studios · Phase 1A visual approval

## Review

Start with **Alex-review-sheet.png** for the eight solo views. Open **Cast-lineups.png** to see Jamie, Sam and Alex from the front, side and three-quarter angle, plus a closer facial comparison. The boys appear in that order throughout. **Alex-details.png** shows the groom and clothing. **Sam-hair-comparison.png** pairs the previous and revised groom using the same camera.

The full-resolution solo frames are in `renders/`. The group views and detail renders are in `comparison/`. The evening frame uses the Blender street set and low sun. Each solo master is 880 × 1100.

## Alex

The gold shirt and olive shorts carry through the outfit described in the game. The cast palette and character canon also informed the three-button polo, cream trim, white socks, dark shoes, green-hazel eyes and swept medium-brown hair. The proposed 1.54 m height gives Alex a position between Jamie and Sam in the studio lineup. The design references are `docs/art/CHARACTER-CANON.md`, section 3.4, and the `alex` entry in `dist/cast.js` in the Last Light repository.

Alex has wide-set eyes, soft arched brows, a short button nose, rounded cheek pads and a tapered lower face. Fine freckles cross the bridge of his nose. His warm peach complexion, side part and loose chestnut waves are visible in the neutral portrait. The expression view lifts the corners of his mouth and his cheeks with an editable shape key. The asymmetry is intentionally slight.

The neutral body uses the corrected arm anatomy from the previous checkpoint. Its relaxed elbow angles, wrists and curled fingers carry through to each solo view. The shirt has a fitted upper yoke, a separate turned collar, sewn sleeve openings and a button placket. The olive shorts have a joined rise, slant pockets and hem stitching. Light socks break the silhouette above the dark canvas shoes.

## Sam and Jamie

Sam’s existing shag was lifted slightly at the crown and eased outward at the temples. The displacement follows the existing locks, with a small increase in fibre roughness variation. The before-and-after sheet uses an elevated three-quarter camera so the crown and hairline can be read together.

The package includes the approved Jamie scene for the group comparison. Its SHA-256 matches the prior checkpoint exactly. The comparison renderer places all three characters on the same ground plane at unit scale. The cameras use orthographic projection and the directional studio lights illuminate each position equally.

## Editable source and recovery

| Item | Location |
|---|---|
| Alex scene, external textures and credit | `models/alex/` |
| Sam scene, external textures and credit | `models/sam/` |
| Approved Jamie comparison source | `models/jamie/` |
| Original credited anatomical source | `source/child.glb` |
| File hashes and scene checks | `SHA256SUMS.txt` and `VERIFICATION.md` |

Open the packed scenes in Blender 5.2.2 LTS. Alex’s character collections separate anatomy, eyes and brows, hair, and wardrobe. His neutral body retains the original per-vertex A-pose reference. Run the embedded text **Render the eight approval cameras.py** to render the set from Blender. From the package directory, the two commands below recreate the solo views and the matched group and detail views.

```sh
blender -b -P render-alex.py -- all
blender -b -P render-lineups.py
```

This checkpoint is on local branch `codex/astra-phase1a-alex-character-design`. The local review archive contains these files and relative texture paths.

## Approval requested

Review Alex’s facial identity and resting expression beside Jamie and Sam, the sweep and wave in his hair, and the fit of his polo and shorts in the full-body views. Review the small change to Sam in the paired hair detail. This handoff ends at visual approval.
