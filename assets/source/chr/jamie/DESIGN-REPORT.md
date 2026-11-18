# Jamie · Phase 1A character review

**Last Light · Roth Studios · Oak Hollow, August 2011**  
**Status** — Base design submitted for Grayson Roth’s visual approval.

## What to judge

Read the straight-on neutral portrait beside the slight smile. Jamie’s left mouth corner rises first, the lower lid tightens and the cheek lifts with it. The round cheek pads, softened jaw, button nose, brown eyes and worn blue cap carry his identity across the studio views and the evening portrait. Light freckles, the side-swept crop and the left sleeve placement of the small hole are proposals for this review.

## Construction

The starting asset imported as 10,752 vertices and 14,182 triangles. Welding coincident import seams left 7,093 vertices in one closed connected component. Blender found zero boundary edges, zero nonmanifold edges, consistent edge winding and positive signed volume. The original UV set was present. The source had no skin, armature, animation or texture images. The surface around the eyes and lips had concentric contours, but the triangular eye fills and skin seams needed work for close-up views.

The editable body retains 7,093 control vertices. It has 6,287 quads and 1,608 triangles before modifiers. Cranium scaling, cheek volume, nose and ear proportions, the mouth corners, shoulders, stance and hand positions were adjusted. The underlying figure is scaled to the proposed 1.55 m crown height, with a metric scene, +Z up and −Y forward. The Phase 0A shared child joint positions informed scale and silhouette. Bicycle contact and animation compatibility remain untested at this visual checkpoint.

The blue cap has six panels, a back opening and adjustment strap over the forehead, a curved rear visor and a pale embroidered front badge. The separate cropped groom combines an underlayer, directional locks, fringe and fine hairs. The shirt has a rib neckband, set-in sleeves, double hem stitching and a small actual opening in Jamie’s left sleeve. Khaki-olive shorts, ribbed socks and canvas sneakers with suede overlays, foxing, eyelets and tied laces complete the summer kit.

## Opening the source

Open `chr.jamie.a12.blend` in Blender 5.2.2 LTS. The active scene is `REF`. The file opens on the three-quarter portrait camera. Seven authored image maps are packed, with matching PNGs in `textures/`.

- To see the uncapped haircut, hide the collection beginning `05 • Cap` in the viewport. Also disable its render visibility for an uncapped render.
- The body has a neutral basis and one review smile under Object Data Properties → Shape Keys. The body’s wardrobe mask can be disabled for mesh editing.
- Eight numbered cameras preserve the views. The embedded Text Editor script **Re-render the eight review cameras.py** recreates the set in a new `review-renders` directory beside the scene and restores the original review state on exit. The evening view uses its own light and street collections and a static pose cage.
- The original PNGs are 880 × 1100, rendered with Cycles, 60 samples and denoising on an NVIDIA GeForce RTX 4060 Ti. The contact sheet arranges those images by subject.

## Foundation

Repository `GRothIsMonkey/Last_light` · branch `codex/astra-phase1a-jamie-sketchfab-redesign` · accepted foundation `0fbb3ecb70669a04bcf6adbb5bc11fed5403797d`.

The design uses the Final Art Bible, Character Canon, Blender Pipeline, Asset Production Plan, Visual QA Acceptance, Art Approval Register and the Jamie entry in `dist/cast.js` at that revision. The model is an editable art-review source. Production rigging, runtime export, animation and in-game QA are pending separate approval.

