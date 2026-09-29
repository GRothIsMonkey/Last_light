# Last Light v0.1 — verification report

Final v0.1 implementation and gameplay pass. The original 14 story beats, four chapters and ending text are kept. This pass adds believable friend departures, a rigged cast, a rebuilt neighborhood, background life, reworked audio, and a small final stop at the end of the street.

## Automated results (`npm test`)

35 checks pass. The suite loads the real modules and full scene, using a mocked WebGL renderer and DOM. It plays the game twice: a full first playthrough with walking and riding home, a replay, a second ride, and the idle ending.

- Assets and imports: every file referenced by `index.html` and every module import resolves locally.
- Route: constant distance scale, grade below 4.3%, smooth heading.
- Surfaces:
  - Raycast checks confirm the asphalt faces upward and matches the road surface height over the whole ride.
  - Side streets connect through curb openings.
  - `groundY` (used by every rider and walker) matches the rendered lawns, driveways, walks, porch steps and lookout within 0.5 cm.
- Rig:
  - Thigh, shin and forearm lengths are preserved (to 0.1 mm) across riding, standing on the pedals, walking, running and the dismount keyframes.
  - Riders' feet stay on the pedals through a full crank turn (0 mm error).
  - Walking stance feet stay planted.
- Input:
  - W pedals; A/D steering stays inside the road edges and turns the handlebars and leans the bike.
  - Mouse look is separate from steering; R, Q and E work.
  - Pause freezes travel and releases the mouse.
  - A spurious mouse jump right after pointer lock is ignored.
  - Pointer-lock exit pauses; drag-look works when pointer lock is unavailable.
- Story: all 14 triggers fire in order within 0.27 m of their distances on both rides. Riding eye height stays between 1.35 and 1.62 m.
- Friends:
  - Every friend ends inside their house.
  - No friend's body or bike moves more than 0.3 m in a frame (largest: 0.25 m, Jamie sprinting). There is no teleporting.
  - Nobody is hidden before going inside: Jamie and Alex are only hidden once through their own doorway, and Sam behind the closed garage door.
  - Jamie's bike is left lying on the lawn, Alex's stands on its kickstand, and Sam's is put away in the garage. Doors and the garage end closed.
- Final stop:
  - The bike rolls to a stop at the end of the street, and F gets off.
  - W/A/S/D walking moves the player, stays inside the lookout, is stopped by the fence, and keeps standing eye height.
  - The player can turn all the way around, and looking back brings the distant call.
  - F beside the bike rides home, and the ending card appears.
- Replay resets story, view, bike, friends, doors, garage and controls.
- If the player just waits at the end of the street, the memory fades to the ending on its own (after about 100 s).

### Metrics (from the latest run)

| | |
|---|---|
| Ride to the end of the street, holding W | 278 s (4.6 min) |
| Full first playthrough, including the test's walk at the lookout | 5.6 min |
| Largest ground-height mismatch | 0.005 m |
| Largest per-frame friend movement | 0.25 m |
| World build time (Node) | about 2.4 s |

Camera-relative angle to each friend at key moments, holding W and never touching the mouse. The gentle "attention glance" is included, and the horizontal half field of view is about 48°:

| | stops | gets off | goes inside |
|---|---|---|---|
| Jamie | 4–5° | 1–2° | 18–22° |
| Sam | 8–9° | 6° | 44–47° (the garage door coming down) |
| Alex | 0–1° | 0° | 7–8° |

## Browser checks

The game was run in headless Chromium (SwiftShader WebGL) through the `?qa` hook, which steps the simulation deterministically. Screenshots were reviewed for:

- the intro, with friends waiting astride
- group riding, with friends drifting alongside when they speak
- Jamie's exit: mother on the stoop, the dropped bike on the lawn, the wave at the door
- the minivan's headlights arriving
- Sam's open garage
- Alex's bike on its kickstand at the porch, with the porch light and window lit
- streetlights and lit windows at dusk
- arrival at the cul-de-sac
- looking back down the lit street past the parked bike
- the lookout (bench, oak, tire swing, fence, chalk initials)
- the call caption, the fade, and the ending card

No page errors or console errors occurred with sound enabled. Rendering was 230–420 draw calls (shadow pass included) and about 0.5 M triangles per frame.

## Limitations

- SwiftShader is a software renderer, so real-GPU frame rate was not measured. Scene cost is modest (static geometry is merged by material; about 190 merged meshes), but a check on low-end hardware is still outstanding.
- Real hardware pointer lock, touch controls on a physical device, and the synthesized audio were exercised for errors only; nobody has listened to them. The distant voice at the end is synthesized and deliberately faint, so it deserves a listen during the art/audio pass.
- Friend departures are tuned for a player holding W. A player who stops or looks around sees them differently, which is intended; the glance only engages when the view has been left alone for 3 s.
