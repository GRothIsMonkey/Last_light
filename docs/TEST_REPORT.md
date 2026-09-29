# Last Light v0.1 — combined release verification

The recovered Astra build is based directly on Claude's `claude/loving-newton-1vlisx` at `02cbde1`. The original 14 story beats, four chapters, route, three different friend departures and ending text are preserved. The final work is on `codex/astra-v0.1-release`.

**Status:** implementation, automated checks and rendered visual QA pass. The required perceptual listening review remains incomplete. This environment cannot listen to the rendered audio, so signal checks are not treated as listening approval. The combined build must remain on its release branch until that requirement is satisfied; `main` is not yet the completed release.

## Automated simulation

`npm test` passes **44 checks** using the real game modules and Three.js geometry, with a mocked renderer and DOM. It covers two complete playthroughs, including a voluntary return home, replay, and the idle ending. See [simulation-report.json](qa/simulation-report.json).

- All local assets and module imports resolve.
- The route is continuous, with constant distance scale. Asphalt and roof slopes face upward; side streets connect through curb openings. The final sidewalk follows the rise and faces upward.
- Ground queries match the rendered lawns, driveways, walks and lookout within 0.005 m.
- Riding, walking and dismounting preserve limb lengths. Feet stay on the pedals and walking stance feet stay planted. Hands remain within 0.0164 m of the grips while steering.
- Pedaling, steering, independent mouse look, recentering, keyboard look, pause, pointer-lock exit and drag-look fallback work.
- Both rides trigger all 14 story beats in order. Every friend gets inside before being hidden. Jamie's bicycle stays on the lawn, Alex's stays on its kickstand, and Sam's is put away in the garage. Doors and the garage finish closed.
- Getting off, walking, the lookout boundary and fence, turning back, the distant call, remounting and returning home work.
- The single ending clue is absent throughout the ride and appears during both ending fades. Ending freezes the world and clears controls.
- Replay resets story, camera, riders, bicycles, doors, mother sound state, ambient timers, basketball child, vehicle, sprinkler levels, clue and controls.

| Measurement | Result |
|---|---:|
| Uninterrupted ride holding W | 278 s / 4.6 min |
| First complete test playthrough, including walking | 5.64 min |
| Largest ground mismatch | 0.005 m |
| Largest hand-to-grip error | 0.0164 m |
| Pedal contact error | 0 m |
| Largest friend movement in one test frame | 0.25 m |

The initial test also exercises controls before its timed first-ride segment, so that segment alone is shorter than the uninterrupted second ride. Player stops can extend the experience.

## Chromium and rendered QA

`npm run test:browser` passes **55 checks** in Chromium 153.0.8010.0 with SwiftShader. It runs the actual WebGL shaders and Web Audio implementation, starts sound through a user gesture, exercises pointer lock, a click while captured, W, bell, M, Escape/resume, and completes two playthroughs through the deterministic `?qa` stepping hook. It walks back to the bicycle without teleporting. There are **no JavaScript, console or shader errors**. See [browser-report.json](qa/browser-report.json) and [errors.json](qa/errors.json).

Nineteen 1440 × 900 screenshots were reviewed, covering the intro, player bicycle, group ride, first hill, all three departures, porch/upstairs lights, late sunset, cul-de-sac, oak/bench/tire swing, looking home, final fade, ending and idle ending. The close view of the chalk mark is a diagnostic camera view, not a forced camera movement in the game.

The review confirmed closed roof surfaces, continuous final paving/curbs, textured suburban houses, softer leaf canopies, visible rider contact, warm-to-cool sunset progression, and readable ending UI. The recovered build was run again before the final documentation and commit work.

## Audio

The browser renders **22 cases** using a real stereo OfflineAudioContext at 48 kHz: rolling, grass, coasting, two footsteps, bell, sprinkler, basketball bounce/rim, door opening/closing, garage, dropped bicycle, kickstand, stopped vehicle, dog, swing creak, bird, distant call, early/late ambience and ending chord. The bike clips include the associated drivetrain layers; ambience clips include wind, insects, mower and distant traffic.

Every rendered case contains finite, nonzero audio and passes the peak/headroom check. The largest tested peak is approximately **0.1198** of full scale; no tested sample clips. Finished one-shot sources disconnect, replay stops old sources, and delayed bell replies use simulation time.

The final call now uses softened harmonics and moving formants without its old feedback echo. It is still synthesized, not a recorded voice. Its emotional character, recognizability, perceived distance, spatial balance and the mix's comfort/repetition **have not been judged by listening**. Offline clips also do not establish how every sound combines during a full real-time ride.

The [review page](qa/audio-review.html), [complete reel](qa/audio-review.mp3), individual clips and [reel index](qa/audio-review-index.json) preserve actual game output levels; they are not loudness-normalized. Complete the required listening review, particularly the final call, before marking this release complete or merging it into `main`.

## Performance

Static meshes are batched in spatial cells by compatible material, retaining vertex colors, texture coordinates and appropriate material flags. The renderer can cull distant cells while preserving neighborhood detail.

| Captured rendering cost, including shadows | Result |
|---|---:|
| Draw calls across captured views | 46–470 |
| Submitted triangles across captured views | 89,293–298,271 |
| Group ride | 470 calls / 298,271 triangles |
| Final arrival | 66 calls / 126,334 triangles |
| Looking home | 299 calls / 256,725 triangles |

The original group view submitted about 523,112 triangles in 425 calls. The revised group view submits about 43% fewer triangles, with a modest increase in calls. This is a geometry-cost improvement, not an established frame-rate improvement. SwiftShader is a software renderer; no real-GPU or low-end-device FPS claim is made.

## Ending detail and remaining limitations

One faint additional set of chalk initials, **AR**, appears beside the existing initials during the last fade, after the call home. There is no stinger, extra voice, figure, camera cue or explanatory lore. The same restrained clue serves both endings and is cleared on replay.

- Required perceptual audio review is outstanding. This is the release/merge gate.
- Real-GPU performance and physical touch-device behavior remain unmeasured. Browser pointer lock was tested in headless Chromium, not on a physical desktop setup.
- The geometry and sound remain deliberately stylized and locally synthesized. The call especially needs a human listening verdict.
- No known failing automated check or reproduced runtime exception remains in the tested build.

No v0.2 work is included.
