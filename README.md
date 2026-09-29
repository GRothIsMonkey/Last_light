# Last Light — v0.1

A short first-person bicycle memory set on August 21, 2011. Ride through a warm suburban neighborhood with three friends, who leave one at a time as sunset turns to dusk.

## Play

- W / Up: pedal; S / Down: brake.
- A / D or Left / Right: steer within the paved street.
- Mouse: independent, smoothly limited head-look. The start button requests mouse capture; click the scene to capture again. If capture is unavailable, hold the mouse button and drag on the scene.
- Q / E: optional keyboard head-look.
- R: smoothly center the view.
- Space: ring the bicycle bell.
- Escape: release the mouse and pause. Click Keep riding to resume.
- Touch devices: hold the existing on-screen pedal and steering buttons.
- Sound button: toggle ambient audio. No sound plays before interaction.

The 1,120-meter route takes approximately four minutes at a steady pace. There is no failure condition. Pedaling advances the story; stopping lets you stay in a moment. Replay is available at the end.

## v0.1 polish

The original 14 story beats, four chapters, ending, and timing are preserved. Changes are limited to gentle hills, authored bends, two small side-street junctions, visible asphalt, curbs and sidewalks, connected driveway aprons, speed-linked pedaling, separate mouse-look, smoother steering, and restrained bike lean. Route bounds keep the bike on the main street. This is the v0.1 scope endpoint, with no further features planned in this pass.

## Run locally

Serve `dist` with a static HTTP server, for example `python3 -m http.server 8000 --directory dist`, then open the server address in a WebGL-capable browser. ES modules require HTTP; opening the HTML with `file://` is unsupported.

All runtime assets are local. Three.js r160 is vendored under the MIT license in `dist/THREE-LICENSE.txt`. The existing neighborhood uses runtime geometry and generated audio. No game data, external APIs, or CDN requests are required.

## Project layout

The `dist/` folder contains the editable game source and its ready-to-serve assets; no build step or dependency download is needed.


- `dist/game.js`: scene, surfaces, bike animation, controls, audio, and state transitions.
- `dist/route.js`: fixed route frames, gentle terrain, paved-surface height, and pedal linkage.
- `dist/story.js`: unchanged original story beats and progression.
- `tests/verify.mjs`: repeatable geometry and full-ride simulation.
- `docs/TEST_REPORT.md`: verification results and remaining browser-testing limitations.

Run checks with `npm test` (Node.js required). To play locally, run `python3 -m http.server 8000 --directory dist` from this folder and open `http://localhost:8000`.

## Verification

Run `node tests/verify.mjs` from the project root. It uses the actual Three.js geometry and state updates with a mocked DOM and renderer. Checks include route distance and grade, upward-facing connected asphalt, bike clearance, mouse and fallback input handlers, Q/E, steering bounds, pedal linkage, pause, all original story triggers, ending, and a second playthrough after replay.

These are geometry and logic checks, not real browser rendering or hardware-input tests. Browser visual QA and real pointer-lock behavior remain unverified because the supported browser-testing capability was unavailable in this environment. See `docs/TEST_REPORT.md` for the exact results.
