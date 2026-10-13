# Last Light — Chapter Four Astra final art polish

## Provenance and delivery

- Accepted source: `claude/chapter4-horror-revision`, exactly `f0120badfcbd60d3f1dcf7e837650a5c61088f90`.
- Astra branch: `codex/astra-chapter4-final-polish`, created directly from that commit.
- Final runtime commit: `39b6ce7a9d8f7f617de9403d4f206aa22af38ed1`.
- Test-driver commit: `58ee6cdefba1921caf2b8a33b9acfe2372795b2f`. Subsequent delivery work contains validation-driver memory controls, captures and documentation; the game runtime is unchanged. The reports contain SHA-256 hashes of every top-level runtime file.
- The final delivery SHA is printed in `START_HERE.txt` in the portable package and in the delivery message. Inside the restored repository, `git rev-parse HEAD` resolves it exactly. A commit cannot contain its own hash; this document records the final runtime identity separately from its documentation commit.
- GitHub push authentication was unavailable (`could not read Username for https://github.com`). The fallback preserves the exact tested commits in a standalone repository with a real `.git` directory and full branch history; no replacement GitHub commits were created.
- No merge to `main`, no changes to the source or earlier release branches, and no Chapter Five content.

## Scope and preserved behavior

The accepted Chapter Four story and gameplay remain authoritative. `chapter4.js`, `town-plan.js`, `companions.js`, `creature.js`, `creature-asset.js`, `footage.js`, the caption/UI files and the creature assets are unchanged. The five escape routes, companion recovery, adaptive captions, Alex's theater dialogue and stillness, Pine Ridge clue, DEV starts, camera freedom, and all creature locomotion/IK and fear staging are retained.

`chapter3-art.js` only exports its existing head and shirt geometry helpers. Their implementation is unchanged. The Chapter Four photo actors and apparent Alex reuse those established identities. No creature model, animation, movement, trigger, route, fail state, or progression code is modified.

## Visual changes

| Area | Changes |
|---|---|
| Main Street | Layered cornices, pilasters, stone sills, window reveals, blinds/curtains, window air conditioners, street numbers, awning seams and warm shop lamps across 27 facades. Fourteen shop-window displays add foreground stock, flowers, electronics and ordinary business detail. |
| Materials and street surfaces | Chapter Four-specific brick mortar, masonry grain, plaster, worn asphalt, concrete joints, carpet pile and linoleum tiles. Detail uses derivative filtering. Fixed reversed curb-face winding that exposed a bright gap beside the street; restored glass that opaque trim or door panels had covered. |
| Library | Books project in front of the shelf carcasses and have individual spines, shelf lips and labels. Added ceiling grid, wood counter panels, computers, paper stacks, books, filing details, research signs, microfilm knobs and dated reel boxes. Existing walkways and furniture collision footprints remain unchanged. |
| Lantern Video | Restored all movie cases, original illustrated fictional covers and posters, shelf edges and rental headers, burgundy wall band, ceiling grid, counter returns/forms and a clearer checkout wall. Restored missing signage without changing the footage or its timing. |
| TV shop | More physical window stock, VCR/DVD repair detail, speaker slots, layered shop facade and practical illumination. The impossible camera views, framing logic and recognition gates remain the accepted version. |
| Lyric | Terracotta relief, bronze trim, box-office panel, threshold tiles and new poster artwork. Fixed theater poster UVs incorrectly sampling the lettering atlas. Added warm marquee-adjacent practicals tied to the existing blackout mask. Apparent Alex uses the established refined head/shirt and a contact shadow, with no extra idle movement. |
| Alleys and escape | Drain grates, pavement repairs, restrained wall-side runoff, service pipes, meters, louvers and ordinary business delivery/stage-door signs. Detail hugs existing solids and wall lines; all five navigation paths are unchanged. |
| Old Mill Road | Porch fascia, downspouts, mailboxes, house-window reveal fixes and a community notice. Existing road, vegetation, terrain and arrival framing are retained. |
| Sam's opening | Garage storage shelves, boxes, cooler, folded lawn chair and basketball behind the existing interaction area; backpack fabric, Mom's clothing finish and contact shadow. |
| Alex's room | Retained the accepted detailed bedroom (bedding, desk, chair, personal electronics and helmet). Chapter Four's ceiling-camera footage now honors its existing room/light parameters, giving that night view a cool window bounce instead of inheriting downtown lighting. Temporary light and environment changes restore immediately after the shot. |
| Old bike | The separate Chapter Four photograph bike inherits the accepted worn wheel geometry, fittings and broken-bell detail, with an oxidized material finish. Shared bike identity, wheel pivots, frame proportions and story appearances are retained. |
| Jamie and Sam | Retained refined Chapter Three faces, clothing and grounding; added subtle shirt seams and very small breathing offsets while stopped, driven by the Chapter Four clock. Established colors, flashlight gestures, reactions, foot placement and companion movement remain intact. |

### Creature, darkness and the Presence

The creature's improvement is environmental presentation: cooler dusk fill, warmer local practicals, lower interior ambient fill, and more stable physical light allocation. Important lit fixtures keep their light slot when scores reorder, avoiding flashes as the camera moves. Their brightness reads the current blackout mask every frame, so killed fixtures do not leave stale light on the creature, boys or walls.

The five existing town point lights are reused for shop lamps and marquee light; there are no added town shadow lights. The distant-to-near failure order, creature cower and pass-by, retreat direction, silence, and theater blackout are unchanged. No new visible force, lore, screen glitches or camera coercion is introduced. The accepted small turn/foot-slide imperfection is retained; this pass does not claim an animation fix.

### Artwork and assets

All new material recipes, geometry and canvas film artwork are authored in the project. Film titles remain fictional. There are no new third-party assets, external downloads at runtime, texture packs, fonts, or licensing dependencies. Existing creature attribution remains in the repository.

## Performance and scene management

- Static environment additions enter the existing town-cell material batches and culling system.
- Traffic bodies and each moving wheel are merged by physical finish; wheel pivots and motion are preserved.
- Printed film cases reuse 120 small artwork tiles instead of allocating a tile for every physical case. Tall Lyric lettering is reserved first, and best-fit atlas packing prevents signs being silently dropped.
- Signs: 2048×2048; covers: 2048×1024; shop rooms: 2048×1024. Total uncompressed RGBA canvas/texture storage is 32 MiB before mipmaps, versus 28 MiB in the accepted source. GPU mipmaps add approximately one third; browser canvas backing and implementation overhead are additional. All three atlases report no overflow.
- No new per-frame town-detail loop. Domestic additions are Chapter Four-only and hidden at distance. Character details and contact shadows hide when leaving the chapter. Existing world material/geometry restoration is retained.
- The room footage adds one temporary non-shadowing point light only while rendering that offscreen room; it is removed in `finally`.

## Final validation

Validated across October 12–13, 2026 (UTC). Runtime files are unchanged from `39b6ce7a9d8f7f617de9403d4f206aa22af38ed1`; the final capture/documentation commit does not alter the game. Each completed JSON report records hashes of all 66 top-level runtime files, compared again before packaging. Creature asset files are unchanged from the accepted source.

| Gate | Result |
|---|---|
| Existing full progression/regression suite, `QUICK=1 node tests/verify.mjs` | **622/622**; QUICK omits slow world-geometry sweeps, as in the accepted source's 622-check gate. Includes natural play, replays, five escape routes, companion stress, Chapter Three creature regression, checkpoints and DEV switching. |
| Continuous muted Chromium attempt | **Incomplete, not a full pass**: 9 checks and 41 captures through the Pine Ridge clue/theater return. The 8 GiB worker killed Chromium during the ride home. |
| Fresh ending/DEV browser run, `QA_PART=ending-dev` | **4/4**: from the `c4-ride-home` checkpoint, gameplay inputs reach the end card; then all **42** Chapter Four DEV scenes launch with selector clicks. This is a separate run, not a continuous full-chapter browser pass. |
| Focused art/restoration run, `tests/chapter4-art-review.mjs` | **10/10**; all three atlases fit, footage light is removed, physical lights respect blackout masks, and Chapters 0–2 restore materials/character geometry and hide Chapter Four details. |
| Completed browser runs | **0 JavaScript/console errors; 0 shader/WebGL warnings** |
| Final captures | **106**: 41 frames from the interrupted continuous attempt + 45 fresh ending/DEV frames + 20 art/restoration views. An additional eight before/after comparison sheets reuse those frames. |

The combined rendered coverage includes Sam's opening, camera photographs, the real ride into town, Mason's/library/microfilm, dusk, creature fear and flight, TV surveillance, the video store and Alex-room footage, the narrow-way escape, the Lyric encounter/blackout, Pine Ridge, ride home, and ending. Simulation covers all five escape routes; rendered scene starts show the alternate routes. Jamie and Sam remain active in the accepted horror staging. Chapter Three's simulation and mixed-chapter DEV switching remain green; shared creature code/assets did not change.

**Outstanding validation limitation:** a continuous end-to-end browser playthrough did not finish within this worker's memory budget. The full simulation gate completed the natural Chapter Four playthrough and replays, and the fresh browser verified the ending separately. A continuous human playtest on a real GPU remains outstanding. This delivery does not turn the interrupted run into a pass.

Browser: Chromium 153.0.8010.0, ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). Captures are 1440×900. This is **software rendering**, not a real-GPU FPS result. Audio output is muted; hooks are exercised, not perceptually reviewed.

Earlier interrupted/parallel browser attempts were not counted as passes. Final runs were sequential. The ending/DEV run uses `BROWSER_MEMORY_MB=768` (bounded V8 heap plus garbage collection after screenshots), `MALLOC_ARENA_MAX=2` and `MALLOC_TRIM_THRESHOLD_=131072` to constrain the software-rendering worker. These settings affect the test browser only. Missing text in an intermediate capture batch was traced to expired temporary browser font paths; final runs use available local fonts. No runtime change was needed for that environment issue.

### Representative render counts

| Matched view | Draw calls, before → after | Triangles, before → after |
|---|---:|---:|
| Old Mill Road | 952 → 373 | 187,125 → 220,565 |
| Downtown arrival | 1,027 → 392 | 193,264 → 235,861 |
| Main Street | 692 → 375 | 250,850 → 301,698 |
| Library | 141 → 147 | 110,690 → 198,390 |
| Video shelves | 175 → 177 | 261,707 → 298,092 |
| Marquee | 206 → 157 | 109,741 → 136,293 |
| Ride home | 392 → 394 | 850,283 → 855,935 |

The arrival and daytime-street savings come primarily from merging vehicle parts. Interior book/retail detail adds triangles. These are structural counts from matched saved art views, not proof of increased hardware frame rate; street-life timing can also change visible traffic.

### Evidence and reproduction

- `docs/qa/chapter4-astra-final/simulation-report.json`: all 622 checks, route/companion metrics and runtime hashes.
- `docs/qa/chapter4-astra-final/chapter4-browser-report.json` and `index.html`: interrupted continuous attempt, 9 checks and 41 frames. Its failure is retained.
- `docs/qa/chapter4-astra-ending/chapter4-browser-report.json` and `index.html`: fresh ending check and 42 DEV scene starts, 45 frames and runtime hashes.
- `docs/qa/chapter4-astra-review/report.json`: 10 focused checks, 20 art views and runtime hashes.
- `docs/qa/chapter4-astra-comparison/index.html`: eight saved before/after comparisons and render counts.
- Browser driver environment: `BROWSER_PATH` points to Chromium; `BROWSER_SERVERLESS=1` is used for the serverless build, with `LD_LIBRARY_PATH` for its bundled libraries and `FONTCONFIG_PATH` for available fonts. `CODEX_PRIMARY_RUNTIME_NODE_MODULES` supplies Playwright here. No browser binaries or machine-specific tool dependencies are needed to run the shipped game.


## Known limits and future work

- This is a cohesive procedural art pass, not a photoreal asset replacement. Secondary street vehicles, distant buildings, adults' faces and some counter/electronics silhouettes remain visibly stylized and simple.
- Texture artwork repeats across stock, glass uses the existing approximate response, and practical pools are not a new global illumination solution. Only five town point lights are available at once.
- Library book detail raises triangle counts even though it stays batched. The existing night ride home still renders substantially more suburban geometry than a town interior; a later whole-game visibility pass should address that.
- Creature animation is unchanged, including the accepted approximately 0.13 m maximum turn/foot-slide imperfection previously measured. No new motion-capture, facial animation or hand IK pass is claimed.
- Alex's bedroom geometry is the accepted earlier polish; the new work there is Chapter Four footage lighting. The current room model remains the continuity reference.
- Software Chromium/SwiftShader counts are reproducible structural measurements, not real-GPU FPS. Hardware performance and a fresh human visual playtest remain useful release checks.
- Audio remains the existing placeholder hooks; validation is muted. A future full-game audio pass, character/vehicle asset pass and animation finish are still warranted.
- Chapter Five can safely build on the accepted ending, Pine Ridge photograph, persistent inventory and established companion/creature systems. This branch adds no Chapter Five implementation.
