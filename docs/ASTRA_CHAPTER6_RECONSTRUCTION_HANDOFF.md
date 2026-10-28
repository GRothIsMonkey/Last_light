# Chapter Six — Astra visual reconstruction

Source: `claude/chapter6-someone-was-here`, exact commit `7fdfc2a6354e6f1d2c5f6f4de17d5b485fa44073`.
Working branch: `codex/astra-chapter6-visual-reconstruction`.

This is a human playtest candidate. Automated progression checks cannot approve the character appeal, grief, or fear the chapter is meant to produce.

## Implemented changes

| Area | Reconstruction |
| --- | --- |
| Morning | A connected bathroom and kitchen within the existing house footprint. Running tap, toothbrush, spoon, cereal and milk have physical states. The player walks to each station, presses F to start, holds F to wash/brush/eat, and can press S to interrupt. Curtains open by hand. The bedroom has shelves, books, rounded bedding and chair surfaces, sockets and furniture fittings. Interior daylight is reduced and cooled; the front window captures the actual street. |
| Shirt | A world-space cloth mesh with gravity, inertia, structural/shear/bend constraints, hand pins, table contact and a guided fold. The shirt settles on the table, lifts at two hand contacts, hangs during the father's hesitation, folds, transfers between both adults, then lowers into an open paper evidence bag. The backpack is moved to the side before unpacking. |
| Characters | Reversible head, torso, limb, hand and shoe geometry for the boys, first-person body, Reyes, Alex's dad and Chapter Six adults. Continuous facial contours and hair surfaces, inset eyes, gaze, blink, mouth and brow motion; clothing seams, collar/pockets, shoe laces and separate curled fingers. Head pitch is corrected locally for Chapter Six adults. Firefighter equipment remains visible. |
| Jamie's double | The same reconstructed model and materials as real Jamie. No blinking or body sway, restrained mouth asymmetry, delayed head tracking. A darker foyer with stairs, runner, banister and a small lamp frames the figure. The existing lamp disappearance cue now actually cuts the lamp. |
| Works | Additional runoff/mineral staining, conduit clamps, anchor bolts, greasy gate guides, damp patches beyond 2B, ripples where runoff enters floodwater, and local lamp glints on the wet surface. The landing stays dry before flooding so the wet footprint clue retains its meaning. |
| Aftermath | A curved blanket wraps Jamie’s shoulders and lap, with a small rescue stool supporting his seated pose beside the cruiser. Both are removed when leaving Chapter Six. |
| Framing | The shirt scene has its own local fill light, corrected adult eyelines, physical hand poses and cleared hands. Foyer contrast separates the double from the background. Industrial light pools and wet detail support the existing grille, double-Sam, gate and rescue staging. |

## Preserved structure

Sam's call, the garage conversation, the oak, Jamie's doorway, Briarwood, the records and plan, supervised works visit, helmet, repeated radio voice, wet prints, Alex's grille charge, broken brake and locking pin, both Sams, gate slam, Sam's disappearance, rescue, Reyes's testimony, radio voice and ending are retained. Main dialogue and chapter order are retained. The morning routine is optional and interruptible; it does not create a new progression gate or prevent answering Sam.

No accepted source branch, `main`, vault, or Chapter Seven is changed. The reconstruction is a linear descendant of the specified source.

## Isolation and shared changes

The new home, foyer, weathering and cloth belong to Chapter Six. Character geometry/materials and original head-detail visibility are saved and restored, including first-person head layers. The added garage lamp detaches on exit. Earlier chapters retain their own appearances.

Two shared-system stability changes are intentionally small:

- `chapter1.js` invokes an optional Chapter Six callback after shared actors and companions are posed. This gives cloth pins their final hand positions and prevents the shared actor update from overwriting the reconstruction's acting.
- `faces.js` initializes expression width to one instead of zero. The original zero produced a non-finite mouth mesh before the first expression update. Existing expression targets and dialogue timing are unchanged.

## Code map and provenance

- `chapter6-models.js`: reversible cast meshes, expressions, gaze and contact shading.
- `chapter6-cloth.js`: cloth simulation, pins, table contact and fold guide.
- `chapter6-domestic.js`: bathroom, kitchen and their prop states.
- `chapter6-atmosphere.js`: foyer and industrial dressing.
- `chapter6.js`, `chapter6-home.js`, `chapter6-cast.js`, `chapter6-works.js`, `chapter6-props.js`: integration and staging.
- `tests/chapter6-reconstruction-checks.mjs` and its browser runner: morning input/navigation, cloth contacts/continuity, identity/blink and exact restoration checks.

All new geometry and procedural textures are authored in the repository. No external character pack, paid asset or downloaded photograph is introduced. Existing third-party creature assets and attribution are unchanged.

## Remaining limits for human review

Characters still use procedural stylized meshes and the accepted segmented IK skeleton. They are not production-scanned or fully skinned human models. Fingers have a fixed curl; some extreme poses can expose limb seams or intersections. Mouth motion follows the existing text/timing system, not recorded phoneme animation.

The shirt is a small constraint simulation with guided folding, not a general cloth engine. It has table contact and hand constraints; it does not provide full body or cloth self-collision. The evidence bag is staged paper geometry. Check the pickup, contact, transfer and insertion at normal play speed.

The window is a cached view, the bathroom mirror is frosted, and water highlights approximate lighting rather than reflecting the entire scene. Low quality retains the game's limited shadowing. Rain, dialogue and sound timing remain the accepted chapter's systems.

A continuous human playthrough on a real GPU, with audio, is still required. Judge whether the home feels personal, whether the father's scene earns sympathy, whether the double reads as Jamie and feels wrong, and whether the disappearance and aftermath land emotionally. Software browser checks do not establish hardware frame rate or artistic approval.

## Validation

See `CHAPTER6_RECONSTRUCTION_TEST_REPORT.md` and `docs/qa/chapter6-reconstruction/` for final results and evidence boundaries.
