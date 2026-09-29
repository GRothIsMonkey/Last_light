# Last Light — structural polish verification

- **Branch:** `claude/epic-planck-cme9eq`
- **Base:** `codex/astra-v0.1-release` (`21bb7a7`), not merged into `main`.
- **What was preserved:** the v0.1 story beats, chapters, the three departures, the end of the street, the ending text and the audio.
- **What changed:** see [ASTRA_HANDOFF.md](ASTRA_HANDOFF.md).

**Status:** all automated simulation checks and all Chromium checks pass, with no JavaScript, console or shader errors. The rendered frames were reviewed by eye, and the issues found in review were fixed (listed below). The perceptual listening review carried over from v0.1 is still outstanding.

## Automated simulation — `npm test`

**92 checks pass.** The run uses the real game modules and Three.js geometry with a mocked WebGL renderer and DOM, and plays the game completely twice. The full output with metrics is in [simulation-report.json](qa/simulation-report.json).

- **World**
  - The route is continuous.
  - Asphalt and roof slopes face up.
  - The street continues about 430 m behind the start.
  - Both side streets continue asphalt-covered for 210 m past their junctions.
  - Both side streets have houses on both sides, sidewalks and at least four poles each.
  - Sidewalks are clear to ride (nothing parked or standing on them).
  - Ground height matches the rendered surface everywhere a rider or walker stands (worst error 0.037 m).
- **World edge**
  - From eight places along the ride and 24 directions each, a ray 2° below the horizon always meets the world.
  - A level ray meets houses, trees or hills in **96.9%** of directions; the rest look down the street's own axis or out over the lookout field.
  - Every gap between first-row houses shows more neighborhood behind it (**100%**).
  - Background: 106 second-row houses, 637 far houses, 1,306 far trees.
- **Streets and signs**
  - Real, unique names: Oak Hollow Dr, Briarwood Ln and Summerfield Rd.
  - One sign post per junction, and every name is on a double-sided blade (front and back face opposite ways).
- **Houses**
  - 22 sampled houses are closed on all four walls at body height.
  - Every one has front and back windows.
  - 28 of 28 open side walls have windows.
- **Doors and garage**
  - Jamie's and Alex's doors swing into the house, not over the porch.
  - Their foyers are real rooms and the way in is not blocked.
  - Sam's garage is 6.7 m deep, with clutter and a door into the house.
- **Rideable surfaces**
  - Driveway cuts and sidewalks are rideable; lawns never are; curbs away from cuts are not.
  - All 1,661 trees stand clear of streets, sidewalks and driveways.
- **Power lines:** all 114 spans run pole to pole at attachment height and sag; all 112 service drops run pole to house; the dead end is guyed.
- **Props:** nothing scattered on the sidewalks; the scooter lies in the grass.
- **Render budget:** 1.43 M world triangles in 845 merged, frustum-culled meshes.
- **Characters and bikes**
  - Every friend differs in hair, bike style, bars, shirt, frame color, face, build, cadence and crank phase.
  - All four bike styles sit on the ground with two spoked wheels, pedals and cranks.
  - Hands stay on the grips while steering (worst 0.0164 m).
  - Feet stay on the pedals on every bike (exact).
  - Limbs keep their length; walking feet stay planted.
  - The first-person head and neck are shadow-only, and every other body part is visible.
- **Title and settings**
  - Settings and Credits open over the title and return to it; Esc closes a panel without starting.
  - Graphics quality changes the shadow map and pixel ratio.
  - Sensitivity scales the mouse look (verified in play).
  - Settings are saved (full screen is never restored on load).
- **Riding**
  - W pedals, and the first prompt gives way to the steering prompt.
  - Looking down finds your own body; the hands meet the actual grips.
  - Mouse look beats the automatic glance.
  - Head look reaches about 106° without going round; R centers; Q/E look.
  - A/D stop at the curbs.
  - Releasing the bars eases straight with overshoot under 0.012 rad.
- **Pause:** pause freezes travel, releases the mouse and hides prompts. Settings open over the pause menu and Esc returns to it. Start over resets the ride. The pointer-lock exit and drag-look fallback work.
- **Pushing**
  - Shift gives a bounded burst: top 6.27 m/s, and stamina drops.
  - Friends answer out of step. Each stands after their own delay or stays seated; if two or more stand, their onsets are more than 0.5 s apart. In the test surge, Jamie and Sam stayed seated and Alex stood at 7.5 s.
  - The player never leads by more than 4 m, and the group re-forms without jumps.
- **Two full rides**
  - All 14 story beats fire in order, on time; eye height stays steady.
  - Once learned, controls are not shown again.
  - The group never brakes for a departure (slowest 4.23 m/s).
  - Friends' cranks are within 0.25 rad of each other only about 12–13% of the time.
  - No friend moves more than 0.27 m in a frame, and nobody is hidden before going inside.
  - Jamie's bike lies on the lawn, Alex's stands on its kickstand, Sam's is put away, and the doors and garage finish closed.
  - The head glances toward departing friends when you are not looking around.
- **Memory lines**
  - Each appears once, never over a friend's line.
  - The final line appears during the fade.
  - With captions and memory lines switched off, neither appears.
- **End of the street**
  - F gets off; walking stays inside the lookout; the fence stops you.
  - Turning back brings the call 1.5 s later.
  - The swing takes a push away from you and settles.
  - The bench seats you and lets you look around; F stands you up.
  - The other bike is there only after the call.
  - Crouching at the chalk after the call reveals the faint `AR` when you turn to it; before the call there is only JSA.
  - Getting back on before the call keeps you there; after it, F rides home.
  - The chalk `AR` is plain in both final fades.
  - The ending card appears after the slower fade.
  - The ending freezes the world and clears prompts.
- **Staying:** the idle ending comes on its own, and the other bike never appears while you face it.
- **Replay and title**
  - Replay resets the story, view, bikes, friends, doors, the mother, lights, the minivan, the hoop kid, sprinklers and timers.
  - It also resets the swing, interactions, memory lines, the ending state and the player's push, stamina and steering.
  - Back to the title resets and waits; starting again begins at 0.
- **Sidewalk riding:** up a driveway cut onto the sidewalk and along it past the cut, with the bike's height on the walk (within 0.05 m). The planting strip keeps you on the walk between driveways.

| Measurement | Result |
|---|---:|
| Uninterrupted ride holding W (second ride) | 240 s / 4.0 min |
| First complete test playthrough, including walking and interactions | 4.91 min |
| Longest idle path (ride + 100 s at the lookout + 6 s fade) | about 5.8 min |
| Slowest remaining rider during a departure | 4.23 m/s |
| Push top speed / most the player led the group | 6.27 m/s / −0.3 m |
| Call after turning to look back | 1.47 s |
| Worst ground mismatch | 0.037 m |
| Worst hand-to-grip error | 0.0164 m |
| Largest friend movement in one frame | 0.267 m |

The ride is about 38 s shorter than v0.1's 278 s. The group used to slow 26–34% around each departure; it now eases only 10–15%. The finale was given more room (a later call, a slower leaving fade), so a playthrough stays within the 5–6 minute target.

## Chromium and rendered QA — `npm run test:browser`

**84 checks pass** in Chromium 141.0.7390.37 with SwiftShader. There are **no JavaScript, console or shader errors**. Results are in [browser-report.json](qa/browser-report.json) and [errors.json](qa/errors.json).

The run uses the real WebGL shaders and Web Audio:

- sound starts from a user gesture
- pointer lock, W, bell, M, Escape
- the pause menu
- title Settings and Credits
- a graphics setting
- two complete playthroughs, plus a return to the title

It walks back to the bicycle without teleporting.

**99 frames at 1440 × 900 were captured and reviewed by eye:**

- **Title, settings, credits, pause, prompts:** `01*`, `02*`, `26-back-to-title`
- **The ride and departures:** `03`–`13`, and the sequences `seq-group-pedaling`, `seq-friends-surge`, `seq-jamie-goes-home`, `seq-sam-rides-into-the-garage`
- **Entries with the door open:** `house-01-jamie-entry`, `house-02-sam-garage-open`, `house-03-alex-entry`
- **World edge:** `edge-01` … `edge-11`: looking back at the start, 90° left and right, through gaps, behind yards, down both side streets, late in the evening, the lookout field
- **Player body:** `body-01` … `body-08`: looking down while pedaling, over the shoulder, steering, braking, pushing hard, stopped, getting off, getting back on
- **Friends:** `friends-*` and `character-*` close-ups (Jamie, Sam, Alex, Jamie's mother)
- **House QA:** `house-q*`: six kinds of house from the front corner, the side and the back corner
- **Sidewalk riding:** `sidewalk-01`, `sidewalk-02`
- **End of the street:** `14`–`25` (swing, bench, chalk crouch, faint `AR`, oak carving, the other bike) and `16`–`19` (the fades and the ending)

**Found in review and fixed in this pass:**

- Brick veneer covered the front windows of brick-fronted houses.
- Cars in shallow driveways poked over the sidewalk.
- A scooter stood on the sidewalk.
- Standing riders rolled their torsos by up to about 40°, and all three could stand within 0.3 s of each other. The bike now rocks under a near-upright body, and each rider stands on their own beat or stays seated.
- The `AR` carving read mirrored.
- The chalk crouch view was too close.
- Asphalt patches read as dark slabs.

**Found by the new checks and fixed:**

- A friend dropping back right in front of you and you easing off behind them could slow each other to a stop.
- A bike rolling straight off the end of a driveway apron crossed the grass strip.

**A QA-only artifact** is also handled: inspection cameras far from the rider saw past the sky dome. The sky follows the eye in play, and the QA cameras now re-center it too.

## Audio

Unchanged from v0.1 apart from a master volume setting, with the default level equal to v0.1's. The browser renders **22 cases** through a real OfflineAudioContext; all are finite, nonzero and unclipped. The clips are in `docs/qa/audio/`. **The perceptual listening review remains outstanding**, particularly for the synthesized call. Signal checks are not a listening verdict.

## Performance

| | v0.1 | This branch |
|---|---:|---:|
| World triangles (all cells) | about 0.66 M | 1.43 M (1.12 M near + 0.31 M far, unshadowed) |
| Draw calls per gameplay view, including shadows | 46–470 | 58–353 |
| Submitted triangles per gameplay view | 89 k–298 k | 69 k–588 k |
| World build (Node, this machine) | about 4.5 s | about 4.6–5.2 s |

Far content is merged into 220 m cells and casts no shadows. Shadows come from position-only proxies. Batched vertex-colored materials keep the material count low. The heaviest views look along the street or down a side street early in the ride. Out-of-street house-inspection cameras (QA only) reach up to about 440 calls.

SwiftShader is a software renderer, so no real-GPU or low-end-device frame rate is claimed. Graphics quality (low / medium / high) scales pixel ratio and shadow-map size.

## Remaining limitations

- The perceptual audio review is outstanding.
- Real-GPU frame rate and physical touch devices are unmeasured.
- Distant geometry is deliberately simple and relies on the evening haze. The final art pass should re-check the `edge-*` frames if the fog changes.
- The player's head is shadow-only, so QA cameras outside the rider show a headless player. The in-game camera never can.
- Art-pass items (tall grass cones, thin chalk lines, the black tire, plain menus) are listed in [ASTRA_HANDOFF.md](ASTRA_HANDOFF.md).
