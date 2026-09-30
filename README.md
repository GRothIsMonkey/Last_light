# Last Light

A short first-person bicycle memory set on August 21, 2011. Ride through a warm suburban neighborhood with three friends, who go home one at a time as sunset turns to dusk, until the street ends at a small grassy lookout where the evening runs out.

A normal playthrough takes about **5–6 minutes**: roughly 4–4.5 minutes of riding, then a quiet stop at the end of the street. The memory fades by itself about 100 seconds after you stop. Stopping during the ride can extend the experience.

**Final polish release:** `codex/astra-last-light-final-polish`, based directly on Claude's structural pass at `59c647220e80d12da0d205b1562d483cc5bdb7f3`. It preserves the route, pacing, distinct departures, neighborhood, settings and lookout interactions. This pass adds fuller sidewalk access and wheel-by-wheel curb feedback, an animated bell reach, grounded stopping poses, richer house/bike/character details, corrected signs, quieter service wiring, refined menus and a restrained final memory anomaly.

See **[docs/ASTRA_FINAL_RELEASE.md](docs/ASTRA_FINAL_RELEASE.md)** for the complete release record, [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for measured verification, and [docs/RELEASE_NOTES.md](docs/RELEASE_NOTES.md) for release history. [docs/ASTRA_HANDOFF.md](docs/ASTRA_HANDOFF.md) preserves the preceding structural handoff.

## Play

The title screen shows the controls. During play, only the key that matters right now is shown.

- **W / Up:** pedal. Hold it a while, or add **Shift**, to push harder; you tire, and it comes back when you ease off.
- **S / Down:** brake.
- **A / D or Left / Right:** steer. Use the full sidewalk width or cross the curb and narrow roadside planting strip in either direction; driveway cuts remain smoother. Yards and solid obstacles stay outside the riding area.
- **Mouse:** look around. The start button requests mouse capture; click the scene to capture again. If capture is unavailable, hold the mouse button and drag.
- **Q / E:** look left / right, or turn while on foot.
- **R:** center the view.
- **Space:** reach to the bell, ring it and return your hand to the grip. Friends still riding look back, and a bell answers.
- **F at the end of the street:**
  - get off the bike
  - push the tire swing
  - sit on the bench (and stand up)
  - crouch to look at the chalk
  - get back on the bike (the prompt becomes **Go home** after the call)
- **W A S D on foot:** walk around the lookout.
- **Escape:** pause. From the pause menu: Keep riding, Settings, Start over, Back to the title.
- **Settings** (from the title or pause), remembered in this browser:
  - volume
  - mouse sensitivity
  - graphics quality
  - friends' lines on or off
  - memory lines on or off
  - full screen
- **Touch devices:** hold the on-screen pedal and steering buttons, drag to look; the extra button does whatever F would do.
- **M or the Sound button:** toggle sound. No sound plays before interaction.

There is no failure condition. Pedaling advances the story; stopping lets you stay in a moment, and your friends stop with you.

## What happens

- **Jamie, Sam and Alex ride as three different kids.** Each has their own face, hair, clothes, build, bike and way of riding: their own cadence, their own moments of standing on the pedals, their own line. Push ahead and they answer at their own pace; ease off and the group comes back together.
- **Each goes home differently:**
  - Jamie's mother comes to the door; Jamie drops the bike on the lawn, runs in through the open door and waves.
  - Sam rides into the garage, parks, waves, goes through the door at the back, and the garage door comes down.
  - Alex leaves the bike on its kickstand at the porch steps, waves and goes inside, and a moment later an upstairs light comes on.
- **The neighborhood keeps living around you** and keeps going wherever you look: down the two cross streets (Briarwood Lane and Summerfield Road), between the houses, over the back fences and out to the hills. Sprinklers sweep and switch off, a kid shoots hoops, a parent's minivan comes home, streetlights and porch lights come on one by one, fireflies come out.
- **Now and then, a short memory line** appears in the voice of the one looking back.
- **The street ends in a cul-de-sac.** Get off the bike and walk the small grassy rise: bench, old oak with a tire swing, chalk initials, a fence at the edge of the field. Look back at the lit street; someone far away calls you in. Ride home when you are ready.

## Run locally

Serve `dist` with a static HTTP server, for example `python3 -m http.server 8000 --directory dist`, then open the server address in a WebGL-capable browser. ES modules require HTTP; opening the HTML with `file://` is unsupported.

All runtime assets are local. Three.js r160 is vendored under the MIT license in `dist/THREE-LICENSE.txt`. Geometry, textures (signs, flag, glows) and audio are generated at runtime. No game data, external APIs or CDN requests are required.

## Project layout

`dist/` contains the editable game source and its ready-to-serve assets; there is no build step. [docs/ASTRA_HANDOFF.md](docs/ASTRA_HANDOFF.md) has a full module map.

- **Game:** `dist/game.js`: renderer, sky and light over time, player bike and first-person body, input, riding and walking, game states, prompts, settings application, and the optional `?qa` hook.
- **World:**
  - `dist/world.js`: builds and merges the static world; ground and rideable-surface queries.
  - `dist/layout.js`: street names, junctions, friend homes, lookout spots.
  - `dist/terrain.js`, `dist/route.js`: street frames, the route, terrain.
  - `dist/streets.js`: roads, curbs, sidewalks, junctions, side streets, cul-de-sac.
  - `dist/houses.js`: lots, houses, roofs, garages, porches, driveways, doors, interiors.
  - `dist/vegetation.js`: trees and shrubs.
  - `dist/furniture.js`: streetlights, power network, signs.
  - `dist/props.js`: yards, cars, fences, toys, lookout.
  - `dist/background.js`: the neighborhood beyond the street.
  - `dist/kit.js`: shared geometry helpers.
  - `dist/palette.js`: all colors.
  - `dist/materials.js`: surface shaders.
- **Wheel contact:** `dist/ride-contact.js`: front/rear surface contacts and damped curb feedback.
- **People:**
  - `dist/cast.js`: who everyone is.
  - `dist/rig.js`: bodies, heads, bikes, poses, IK.
  - `dist/friends.js`: group riding and departures.
- **Life:** `dist/ambient.js`: sprinklers, the hoop kid, the minivan, birds, fireflies, lights, tire swing.
- **Sound:** `dist/audio.js`: synthesized sound.
- **Interface:** `dist/index.html`, `dist/style.css`, `dist/ui.js`.
- **Story and ending:**
  - `dist/story.js`: story beats, chapters, finale and memory lines.
  - `dist/nostalgia.js`: memory-line timing.
  - `dist/interactions.js`: end-of-street interactions.
  - `dist/ending.js`: the last minute's details.
- **Tests:**
  - `tests/verify.mjs`: simulation and geometry regression checks.
  - `tests/browser.mjs`: Chromium checks, screenshots and audio renders.
- **QA material:** `docs/qa/`: screenshots, machine-readable results and listening clips.

## Verification

**`npm test`** (Node.js only) loads the real modules and scene with a mocked WebGL renderer and DOM. It covers:

- world continuity and the edges of the world
- side streets, street signs and houses
- doors and the garage
- power lines, trees, sidewalks and props
- the render budget
- characters and bikes
- the title, settings and pause menus
- riding, steering, head look, pushing and sidewalk riding
- two complete playthroughs, ending both ways (riding home and staying until the fade)
- replay and back to the title
- both sidewalk edges, curb up/down on both sides, speed-scaled impacts, feet-down stops and the actual bell hand/lever movement

`QUICK=1 npm test` skips the slow world-geometry sweeps.

**`npm run test:browser`** drives Chromium through the real WebGL and Web Audio code and writes screenshots and reports to `docs/qa`. To set it up, install Playwright in your development environment (`npm install --no-save playwright` and `npx playwright install chromium`). `BROWSER_PATH` selects an existing Chromium, `SOFTWARE_GL=1` selects SwiftShader, and `QA_OUTPUT` changes the output folder.

The `?qa` hook (`window.lastLight`) exposes:

- `start()`, `step(seconds)`
- `press(code)`, `release(code)`, `key(code)`
- `look(yaw, pitch)`, `walkTo(d, lat, yaw, pitch)`, `place(d, lat, speed)`
- `render()`, `reset()`, `toTitle()`
- a `state` snapshot
- the `world`, `friends`, `ambient`, `ui`, `interact` and `ending` objects

Audio is generated locally; there are no recorded voices, third-party sound assets or network calls during play. The QA listening copies are exported browser output, not game dependencies.
