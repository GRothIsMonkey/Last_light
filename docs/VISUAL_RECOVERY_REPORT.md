# Last Light — Chapter Eight and Aftermath I visual recovery

This release candidate combines the completed Astra full-game art branch with Claude's complete Aftermath I, then reconstructs the catastrophe, persistent town damage, shelter population, adult faces and quieter departure scenes. It preserves the Prologue through Chapter Eight and Aftermath I. It does not add Aftermath II or the 2026 ending.

## Source and history

- Repository: GRothIsMonkey/Last_light.
- Release branch: `codex/astra-chapter8-aftermath1-visual-recovery`.
- Astra parent: `148aac3e4550f7ab358f41f3237cb024c4af9bec`.
- Claude Aftermath I parent: `13e0830ecef6cf90b207644942ccf25111c6f48c`.
- Integration commit: `567a562239496f94ddfdf70db75d59b8718ab7e2`, with both parents retained.
- Recoverable art milestones: `48c9995274372144962e3e2d482f2f1597b4a059` and `df760c20062c23dc0486303eff4d1e8bca0f29b7`.
- The downloadable package's `manifest.json` identifies its exact final source commit and SHA-256 hashes of every packaged runtime module. Main was not merged or changed.

## Major visual changes

### Presence and catastrophe sky

The skyline Presence has a continuous arched body, asymmetrical planted limbs, hanging pleural membranes, a descending hollow throat, dorsal seams and a ribbed underside. Its world scale is increased from 52 to 138, with additional body-axis scaling, and it stands farther beyond the town. Its body and planted limbs dominate views above houses and utility poles. From some street angles the enlarged organism extends beyond the screen; looking up is necessary to inspect its upper anatomy. The catastrophe view distance is extended to retain the enlarged distant anatomy. Matched captures exposed an intermediate apparent-scale regression; the final scale was increased again before release. Upper-body deformation is restrained and the feet stay planted. The existing attack reaches are anchored to the transformed body; the gameplay strike retains its original role.

The underground Presence now uses continuous tapered feelers instead of rows of visible spherical segments. Its existing movement, interaction triggers and story behavior remain intact.

A moving, layered cloud shader creates deep charcoal folds, crimson illumination and a furnace-colored horizon. Catastrophe intensity drives the sky and the scene's fog and lighting. The unnatural atmosphere recedes after sealing; the town's physical damage remains.

### Physical destruction and continuity

Fifteen authored lots share one deterministic damage map. Thirteen are damaged on the surface reveal, and two more collapse with the existing across-street strike. The work removes real roof, wall and garage triangles from merged scenery and its shadow proxies, then adds exposed framing, broken roof sections, room fragments, insulation, debris, damaged cars and charred surfaces. It is not only rubble placed around intact building shells.

The same damaged lots remain in September. October clears two shells to exposed foundations while leaving the other damaged structures and the established restricted routes. Named houses required by the story remain accessible. Damage geometry resets when replaying earlier chapters. Completed wreckage is cached and batched by material, with distance culling.

The existing trench, roadway failures, rescue routes and action sequence remain. The new damage expands the visible neighborhood destruction; it does not make every house collapse or introduce a general destruction-physics simulation.

### Shelter and adults

Ninety-six additional people occupy the shelter's bleachers, floor family groups, medical area, corridor and exterior. These supplement the existing story and shelter characters. The background crowd uses ten instanced mesh batches, child/adult proportions, varied clothes, seated and exhausted poses, head turns and small breathing movements. Two volunteers walk economical loops. Close dialogue actors remain fully rigged.

School dressing adds timber roof structure, cinderblock joints, conduits, open bleachers, corridor chairs, blankets, belongings and supply boxes. Existing cots, information boards, emergency vehicles and narrative staging are preserved.

Adults receive a continuous sculpted head surface, fitted eyes, shaped cheeks and nose, orbital detail, fitted hair and ponytails, continuous shirt torsos and dynamic lips. Tears are thin three-dimensional trails, with restrained redness and wetness. Their existing gestures and interaction attachment points remain.

### Grief and the final everyday scenes

Hair surfaces are fitted to the actual skull cross-section to remove visible scalp clipping. Jamie’s coat is enlarged and given a broader raised drape so the body is covered. Head-relative hand placement improves face-covering grief poses. Seated poses have less symmetrical hand placement and weight. Existing Jamie CPR and Alex hand/embrace interactions retain their contact mechanics. Tears, faces and the catastrophe remain present around the tragedy.

The old oak has a taller, broader landmark silhouette. October's kitchen has warmer, more localized evening illumination and a draped blanket. The moving truck gains an open cargo interior, packed furniture, boxes, rails, straps and a ramp. The departure car gains gauges, radio/CD details, vents, headrests, handles, buckles and a mirror pane. The mirror is not a live reflection.

The previous Astra boys, skeletal hunters, bunker dressing and earlier-chapter art remain integrated. This recovery primarily extends those systems; it does not replace the entire game with newly imported photorealistic assets.

## Story and state preserved

All four boys reunite after the rescues. Containment destabilizes and the Presence enters Oak Hollow. Jamie and Alex remain permanently dead. Sam and the protagonist survive, and the Presence is sealed. Chapter Eight still ends with the bicycle ride and continues into Aftermath I.

Aftermath I retains the shelter, families, nurse, testimony, county list, escorted return, bicycles, porch, bedroom, vigil, memorial, chain repair, October move, packing, notebook, goodbye and final drive. Cap possession choices, checkpoints, dialogue and saves remain part of the completed chapter.

## Automated verification

| Suite | Passed | What it exercises |
|---|---:|---|
| Chapter Seven | 94 | Full input-driven chapter progression and hunter regression |
| Chapter Eight | 35 | Full rescues, truth, catastrophe, deaths, seal and final ride |
| Aftermath I | 58 | Full progression, interactions, cap state and chapter completion |
| Art regression | 55 | Character/creature geometry and art invariants |
| Recovery state | 16 | Shared damage map, real triangle cuts, October cleanup, crowd, replay and expressions |
| Character contacts | 65 | CPR contact over time, oak embrace and grief on a direct final-ride start |

All listed suites passed. The progression runs use the actual simulation with a mocked renderer; the scene images use a separate actual WebGL renderer. Chapter Eight was rerun after the final skyline scale and cloth corrections. Chapter Seven and Aftermath I passed before the final scalp fitting. Art, state and contact checks were rerun after the scalp fitting. The corrected cloth was also inspected in the actual renderer. All runtime modules passed JavaScript syntax checks. Packaged module/hash/import validation is recorded separately in the downloadable release.

## Visual evidence

`Before-and-After.html` contains 30 matched before/after scene pairs. The captures show actual game scenes rendered by the shipped Three.js WebGL renderer under Mesa/ANGLE software WebGL. They use the real scene graph, shaders, materials, lights, shadows and story states. They are not model turntables, generated concept art or browser screenshots.

The comparison baseline is integration commit `567a562`: the prior Astra art plus Claude Aftermath I, before this recovery. Matching scene entries and camera definitions are used. A label identifies a review camera versus the normal player view. Some close-up images use review cameras so faces and contact points can be inspected. The gallery does not overlay the browser HUD; recorded captions and scene states accompany the images.

The selected after views measured 115–1557 draw calls and 109,444–1,717,215 triangles. Warm software frames ranged from 143 to 494 ms (median 263 ms). These are CPU renderer observations, not hardware FPS. Per-scene counts and image hashes are recorded in `render-summary.json`.

The available preview browser displayed the title/DEV screen but could not create a WebGL context. Consequently browser gameplay, hardware GPU performance, pointer lock and audio have not been verified here. Actual software WebGL scene rendering was available and inspected separately.

## Remaining limitations and human review

This is still a stylized procedural 3D game. Faces, hair, clothes, hands, roofs, vegetation and animation can visibly reveal that construction. The improvement is substantial in sky composition, structural damage, persistent ruins and crowd density; it is not photorealism. Some underground angles remain extremely dark, and facial detail is much less readable at distance.

Background evacuees use economical looped poses, not individual full simulations. Smoke and cloud depth are shader/particle effects rather than true volumetrics. Building collapses are authored animations, not unrestricted physics. The WebGL 1 software backend also resizes some non-power-of-two textures, so fine text can differ from a WebGL 2 browser. Native software rendering is slow and its timings are not hardware frame-rate estimates. Shader compilation and scene initialization can be expensive. A full hardware performance claim would be premature.

Human playtesting remains needed for:

1. The complete Chapter Eight escape, particularly looking up at the Presence while moving through ruins.
2. Hunter stalking, close attacks and flashlight readability in the containment wing.
3. Jamie's CPR/covering sequence, Alex's hand/embrace, and Sam on the final ride, with sound enabled.
4. Crowded shelter navigation and the two families' grief scenes.
5. September and October damage continuity while walking the original routes.
6. Vigil, memorial, packing, goodbye and final car ride, including the cap variants and resumed saves.
7. A full Prologue-to-Aftermath playthrough on an ordinary desktop GPU, including pointer lock and audio.

See the packaged QA results for automated checks and per-scene measured software rendering observations. Passing those checks does not substitute for the human review above.
