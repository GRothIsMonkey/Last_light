# Last Light — v0.1

A short first-person bicycle memory set on August 21, 2011. Ride through a warm suburban neighborhood with three friends, who go home one at a time as sunset turns to dusk, until the street ends at a small grassy lookout where the evening runs out.

A normal playthrough takes about five minutes: roughly four and a half minutes of riding, then a quiet stop at the end of the street for as long as you like (the memory fades by itself after about a minute and a half).

## Play

- W / Up: pedal; S / Down: brake.
- A / D or Left / Right: steer within the paved street.
- Mouse: independent, smoothly limited head-look. The start button requests mouse capture; click the scene to capture again. If capture is unavailable, hold the mouse button and drag on the scene.
- Q / E: optional keyboard head-look (turn on foot).
- R: smoothly center the view.
- Space: ring the bicycle bell.
- F: at the end of the street, get off the bike; beside the bike, get back on and ride home.
- W A S D on foot: walk around the lookout.
- Escape: release the mouse and pause. Click Keep riding to resume.
- Touch devices: hold the on-screen pedal and steering buttons; drag to look; the extra button gets off and rides home.
- Sound button: toggle ambient audio. No sound plays before interaction.

There is no failure condition. Pedaling advances the story; stopping lets you stay in a moment, and your friends stop with you.

## What happens

- Jamie, Sam and Alex ride as independent riders: their own speed, cadence, steering and lean, drifting alongside when they talk and putting a foot down when you stop.
- Each goes home differently. Jamie's mother comes to the door; Jamie rides onto the lawn, drops the bike, runs in and waves from the stoop. Sam rides straight into the open garage, parks, waves, and the garage door comes down. Alex cuts across the lawn, leaves the bike on its kickstand at the porch steps, waves, goes inside, and a moment later an upstairs light comes on.
- When a friend is heading inside and you are not steering the view, your head turns a little toward them. Any mouse or Q/E input cancels this.
- The neighborhood keeps living in the background: sprinklers sweep and switch off, a kid shoots hoops, a parent's minivan pulls into its garage, birds cross the sky, streetlights flicker on one by one, porch lights and windows fill in, fireflies come out, a flag and the trees move in the wind. The sound thins out as friends leave: cicadas give way to crickets, the mower and traffic fade, the old melody stops at the end of the street.
- The street ends in a cul-de-sac. Get off the bike, walk the small grassy rise (bench, old oak with a tire swing, chalk initials, a fence at the edge of the field), and look back at the lit street. Someone far away calls you in; ride home when you are ready.

## Run locally

Serve `dist` with a static HTTP server, for example `python3 -m http.server 8000 --directory dist`, then open the server address in a WebGL-capable browser. ES modules require HTTP; opening the HTML with `file://` is unsupported.

All runtime assets are local. Three.js r160 is vendored under the MIT license in `dist/THREE-LICENSE.txt`. Geometry, textures (signs, flag, glows) and audio are generated at runtime. No game data, external APIs, or CDN requests are required.

## Project layout

The `dist/` folder contains the editable game source and its ready-to-serve assets; no build step or dependency download is needed.

- `dist/game.js`: renderer, sky and light over time, player bike and first-person body, input, game states (ride, arrive, stop, dismount, walk, remount, leave, ending), UI, and an optional `?qa` hook.
- `dist/world.js`: the neighborhood. Houses (varied stories, roofs, garages, porches), yards and props, lawns, curbs, sidewalks, driveways, street furniture, signs, the cul-de-sac and lookout. Static geometry is authored in street coordinates, bent onto the route, and merged by material. Also provides `groundY` for anything that stands on the ground, plus the friend homes' working doors and garage doors.
- `dist/rig.js`: kid-scale people and bicycles. Poses are arrays of IK targets (feet, hands, pelvis, spine, head), so poses blend without stretching limbs. Riding, astride, walking/running with planted feet, waving, dismounting, and pushing a bike.
- `dist/friends.js`: formation riding and the three scripted walks home, plus Jamie's mother.
- `dist/ambient.js`: wind and lawn shaders, sprinklers, the basketball kid, the arriving car, birds, fireflies, dust, flag, streetlights and porch/window lights, tire swing, distant town lights.
- `dist/audio.js`: synthesized ambience, bike sounds, positional one-shots, and the distant call.
- `dist/route.js`: fixed route frames, gentle terrain, and paved-surface height.
- `dist/story.js`: the original story beats and chapters (unchanged), plus the short end-of-street lines.
- `tests/verify.mjs`: geometry, rig, input and full-playthrough simulation.
- `docs/TEST_REPORT.md`: verification results and remaining limitations.

## Verification

Run `npm test` (Node.js required). It loads the real modules and scene with a mocked WebGL renderer and DOM, then plays the game twice: every story trigger, every friend's departure (nobody hidden before they are through their own door or behind their garage door; bikes left dropped, parked or put away), the stop, getting off, walking and the fence, turning around, the call, riding home, the ending, replay reset, and the idle fade. See `docs/TEST_REPORT.md`.

For browser checks, open `index.html?qa`: `window.lastLight` exposes `start()`, `press(code)`, `release(code)`, `step(seconds)`, `look(yaw, pitch)` and a `state` snapshot for scripted screenshots.
