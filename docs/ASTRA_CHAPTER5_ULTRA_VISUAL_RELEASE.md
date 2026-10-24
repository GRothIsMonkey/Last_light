# Chapter Five — Astra reconstruction playtest

This is a human playtest candidate, not final visual approval. Chapter Six has not been started.

## Source and scope

- Accepted source: `claude/chapter5-gameplay-story-repair`, `d4de9abd16fa184f1861335a6e4d8100ce31f1e2`. The remote source ref was verified unchanged before publication.
- Working branch: `codex/astra-chapter5-ultra-visual-reconstruction`.
- Final game runtime: `95a7e432d01c42c03c5079e585bce6a2a4cc7635`. The full gameplay suite and matched views used `4bf39029b29fc01b91584217f6d2d99dbfe81cf7`; the only subsequent game change fixes shirt sleeves separating during folding. That final change has a focused geometry regression and fresh rendered interaction review.
- Linear descendants of the accepted repair; no merge into `main`, no force push, no change to accepted ancestors.
- Command-line GitHub authentication was unavailable. The connected GitHub API published the milestone trees in order; their tree hashes were checked against local Git before the local branch adopted the published commits. The original unpublished local commits remain on `codex/astra-chapter5-local-checkpoint`.

## What changed

| Area | Implemented reconstruction |
| --- | --- |
| Forest | Four original branching tree prototypes replace the individual old canopies. Bark, root flares, irregular branch cards, mixed crowns, height/colour variation, wind, three levels of detail and distance culling. 6,060 trees share approximately 3.15 MB of prototype and instance buffers. |
| Ground and roads | Metre-scaled gravel, asphalt, concrete, stone, wood, painted timber and roofing shaders; broken grass/litter/shore blends; individual leaf shapes; fern, dry-grass and twig clusters. Road geometry and its accepted collision stay in place. |
| Camp architecture | Roof fascia, exposed rafter ends, porch braces, gutters, downpipes, brackets, wall-base wear, interior roof ties, trim, pegs and enamel cups. Cabin paint varies by building. Office, lodge, cabin, washhouse, maintenance shed and pump-house silhouettes retain their interactive openings. |
| Public park | Material changes to paving, dock boards, railings and fixtures; construction details on applicable shelter/restroom/booth geometry, maintenance panels and ventilation. Existing recreation layout and activities remain. |
| Garage | Workbench, pegboard tools, shelving, labelled bins, wall framing, overhead-door rails, motor and cord. Dressing is merged by material and remains Chapter Five only. |
| Reservoir | Moving surface normals, view-dependent sky colour, Fresnel response and shallow transparency reveal the bed. Shore collision, wading and stone-skip physics are preserved. The sky itself is unchanged. |
| Jamie, Sam and player | New lofted torso, limbs, pelvis and head meshes; orbital contours, irises, hair shapes, nose/ears, shirt seams, separate curled fingers, and detailed shoes. Rounded limb ends overlap at joints. Dynamic mouths and brows remain active. Earlier-chapter meshes/materials are restored on exit. |
| Hero props | Rounded fabric backpacks with stitched edges, straps, buckles, handles, pockets and hinged openings; ribbed flashlight bodies, lens rims and switches; bottles, a shaped sock, and camera screws, grip and wrist loop. |
| Physical presentation | Accepted hand sockets and IK are retained. Alex's shirt folds through vertex deformation during the existing hand-to-bag sequence. The first-person flashlight uses the same detailed design as the packing-table supply, with exact restoration outside Chapter Five. |
| Horror | The same physical double persists into pursuit, follows the player's recorded route, looks toward the player and uses restrained asymmetric movement. A porch acceleration, lodge-door strike, service-route intake disturbance and final gate slam accompany the existing impossible lights. No extra dynamic lights are created mid-sequence. |

## Owl escape

1. The existing recognition and real-Jamie reaction precede the double leaving Owl. Its motion accelerates briefly near the porch, with a spatial cue; RUN follows the threatening approach.
2. The double remains in the scene. It first clears Owl, uses a navigable connection to the first player trail point, then follows the actual trail. It does not teleport on camera turns. Speed responds to distance; inside approximately 2.25 metres it stops advancing and produces a proximity cue; the player can move closer (0.70 metres observed in the natural simulation). This is a tension encounter, **not a lethal enemy or a new death/retry system**.
3. Route A can trigger a physical lodge-door strike and light change within 25 metres of the lodge. The shortest automated route did not enter that trigger radius. At the camp gate, Sam holds the latch and Jamie watches the approaching double. The objective asks the player to approach and press **F** to pull. The reach animation moves the existing gate, whose collision continues to follow its angle.
4. After crossing, the gate strikes shut and all camp lights extinguish. The double is removed under this boundary blackout, not at RUN. Route C preserves the service road and dam, its intake disturbance, the distant bell and the blackout.
5. A short shore recovery conversation follows. After a little walking, or 24 seconds stationary, a fade explicitly announces **“A few minutes later · Pine Ridge parking lot”**. The three boys rejoin at the rack. The old 190–300 metres of empty return walking are no longer required.
6. The shirt, exhausted relief, impossible campfire photograph, final light across the reservoir and Chapter Five ending remain.

Measured escape durations from RUN to recovery were **57.7 seconds for Route A and 68.3 seconds for Route C in Chromium**, followed by **9.4 seconds** to the lot/final scene. The natural simulation measured Route A at 58.8 seconds, compared with 146 seconds in the accepted repair. These exclude the earlier recognition scene. The conditional lodge-door and intake scares were not exercised by those route lines.

Normal gate interaction is the intended route. A repeated hint appears after 18 seconds; after 55 seconds a recovery opening prevents an interaction softlock. The existing route recovery is bounded at 75 seconds stuck or 210 seconds total. Checkpoints still restart at coherent scene beginnings, and the boundary DEV scene places the pursuer on the approach behind the player.

## Verification and performance

The completed full simulation passed **758 checks** (real Three.js geometry, mocked renderer/DOM). The segmented Chromium checks passed **13 for Route A and 11 for Route C**, with no JavaScript errors or shader warnings. These cover the runtime before the last shirt-only fix. Final shirt validation passed six geometry checks and completed 29 fresh gear/interaction captures without errors; all recorded runtime hashes match the final source. Chapters 0–4's checks, saves, all 37 Chapter Five DEV scenes, companion behavior and a natural Route C replay passed in the full suite.

An environment reset lost the uncommitted raw full-suite and successful browser reports. `docs/qa/chapter5-astra/validation-summary.json` explicitly preserves the completed tool results as a summary, not a recreated raw log. The **17 matched before/after views** survived and their runtime hashes match the capture commit. The final gear report contains hashes for the final runtime. See the comparison gallery and `TEST_REPORT.md` for the evidence boundaries.

Across the 17 matched Low-quality views, the reconstructed game draws **285–483 calls and 277,316–537,880 triangles**. Camp clearing: 261 → 390 draws and 548,409 → 449,216 triangles. Park: 264 → 383 draws and 607,515 → 388,876 triangles. Garage: 299 → 378 draws and 455,598 → 483,094 triangles. Detail adds draw calls; this is not a blanket performance improvement. Static allocated world geometry is 2,190 batches / 3,671,371 triangles.

Most capture heap snapshots are 1.03–1.09 GB, with one 1.67 GB sample. Segmented browser heap samples were 1,698 MiB after split/Owl, 987 MiB after Route A, and 990 MiB after Route C. These are not retained-heap or peak process-memory bounds. Medium and High camp smoke captures also completed without errors (390 draws / 449,216 triangles).

All rendering uses **Chromium / ANGLE SwiftShader software rendering**. No real-GPU frame-rate claim is made. Audio was muted; events were exercised, not listened to. A single continuous real-GPU playthrough remains for human review.

The first full attempt hit an inherited 2,000-mesh ceiling even though the accepted repair documented 2,259. The current count is 2,190; the test ceiling now uses that accepted baseline. An OOM-killed browser attempt is retained separately and is not counted as a pass. A segmented Route C test-driver corner-cut was corrected without changing game collision or route logic.

## Private playtest

[Open the private playtest](https://last-light-chapter5-astra.graysonroth30.chatgpt.site). The site remains owner-private. Exact source and deployment identifiers are in `docs/qa/chapter5-astra/publication.json`.

The managed cloud browser loaded the preview page but has WebGL disabled. Actual rendering was checked in the separate Chromium/SwiftShader browser. The hosted HTML, game modules, stylesheet and creature GLB returned HTTP 200 and matched the final local runtime byte-for-byte (seven resources). See `hosted-verification.json`; this verifies hosted delivery, not a hosted GPU playthrough.

## Asset provenance and maintenance

Every new model, shader, procedural texture and synthesized sound was authored in this repository. No external photograph, texture, character, model pack or paid asset was introduced. There are no new licence obligations. Existing creature assets and their attribution files are unchanged.

- `pine-materials.js`: world-scaled material patterns; batching preserves shader hooks in `world.js`.
- `pine-forest.js`: shared geometry and instancing; tree centres still come from `pine-plan.js`.
- `pine-detail.js`: architecture dressing and undergrowth. Added camp fence meshes have matching plan solids.
- `chapter5-models.js`: reversible mesh/material swaps, preserving the accepted skeleton and pose interface.
- `chapter5-props.js`: locally generated hero props, garage dressing and shirt deformation.
- `chapter5.js` / `chapter5-presence.js`: pursuit, gate roles, recovery transition and double performance.

## Remaining visual limits and playtest priorities

This is a substantial procedural-art reconstruction, **not photorealistic character production**. Faces, hair and clothing remain visibly stylized at close range. Fingers have a fixed curl rather than full finger animation; secondary cloth, walking, pedalling and sitting still use the accepted IK animation system. The shirt fold is procedural rather than cloth simulation. Backpack straps and limb joints can still show small intersections during extreme poses.

Foliage uses alpha cards; branch patterns and LOD changes can be visible. Water reflects an approximation of sky colour, not scene objects, and does not provide physical refraction. Park lawns and some architecture remain visibly simple. Existing flat stones, some small packaging, playground geometry and background vehicles were retained. Low settings do not gain real-time sun shadows. Synthetic audio and text-timed expressions remain provisional.

Please play the garage, a daylight ride and shoreline visit, Owl, **both escape routes**, the gate interaction and final photograph. Judge visual cohesion, route readability, whether the double feels threatening, whether the gate hand contact reads clearly, and performance on the actual computer. The automated escape timing is a reference, not a claim about human pacing or how frightening the scene feels.

No Chapter Six work should begin until this playtest is approved.
