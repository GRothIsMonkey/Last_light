# Chapter Five — handoff to the Astra visual pass

Source: `claude/chapter5-gameplay-story-repair` (the gameplay and story repair of Chapter Five; see
`docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md`). This repair did **not** do the visual pass: the playtester judged almost every
visual aspect except the sky to be well below the intended quality, and that is the Astra pass's job. This file lists
what the repair built that the visual pass will dress, what is placeholder, and what must not change underneath it.

This build waits on the human playtest; it is not approved.

## Structure the visual pass can rely on

| System | Module | What to keep |
|---|---|---|
| Companion minds | `dist/companion-brain.js` | Goals, moods, personal space, reaction delays, the `PERSON` table. Replacing the character models must keep the rig's IK targets (`rig.js` `P`) and `applyPose`. |
| Props and hands | `dist/physical.js` | `prop(name,obj,{grip})`, `container(name,obj,{opening})`; grips are in hand space. A new model for a prop needs its grip re-measured, nothing else. |
| Garage supplies | `dist/chapter5-garage.js` | Prop names (`supply-flashlight-*`, `supply-batteries-*`, `supply-water-*`), the table frame `TL()`, the two backpacks (hinged flaps) and `bagSteps`. |
| Faces | `dist/faces.js` | `createFace(person,cast)`, `set(name,{hold})`, `update(dt,{talk,speech})`; `speakAudio(env,rate)` is the hook for audio lip sync. The mouth and brows are dynamic meshes on `parts.head` (two draw calls per face). |
| Stones and water | `dist/chapter5-park.js`, `dist/pine-plan.js` (`WADE`, `PS.shallow`) | The skip physics (`bounce`), the wade zones (walkable water cells). |
| Gates | `dist/pine-plan.js` `GATES`, `gateAt`, `gateBar`; `dist/pine-build.js` (turns them); `dist/chapter5-gates.js` | Collision follows the drawn angle (`GATES[id].ang` written by the builder each frame). A re-modelled gate must keep its hinge position, bar length and turning axis, or update `GATES`. |
| Gear and inventory | `dist/chapter5-gear.js`, `dist/inventory.js`, `#inventory` in `style.css` | The flashlight's state model (have / in hand / on / batteries); the camera shot timeline (raise, press at 0.46 s, flash, screen, lower); the flash borrows the flashlight's spill light (no new light). |
| Night | `dist/chapter5-presence.js` | Three carried lights (spot lights, always in the scene at 0 when unlit), the beams (`BEAM_L`, additive cones), `switchLight`, `aim`, `sitDown`, `hold`; the double (`doubleWalk`, Jamie's face). |

## Placeholder now, for the visual pass

- **Characters**: the existing low-poly kids with the new dynamic mouths and brows. Expressions are geometric (brow
  angles, mouth shapes), not texture or blendshape based. Lip sync is text-timed (provisional).
- **Props**: procedural boxes and cylinders (flashlights, battery packs, bottles, granola bars, the county map, the
  backpacks, the sock, stones). The shirt is the existing shirt group; it "folds" by scaling.
- **First-person hands**: the existing rig's hands; there are no fingers. The camera shot draws a fingertip mesh on the
  shutter button.
- **Beams**: additive cones with a gradient texture; the pool is the spot light. No volumetric fog or dust.
- **Gate hardware**: the yellow arm, posts, a hasp, low-poly boulders; the camp gate's leaves as before.
- **Flash**: a short pulse of the spill light; no screen effect.
- **Audio**: placeholder synthesized cues (`click`, `fence`, `creak`, `cloth`, `pebble`, `splash`); no voice.

## Performance budget (keep)

- Lights: Chapter Five's light count is constant through the chapter (the carried lights and the flashlight's two
  lights stay in the scene at intensity 0); nothing here adds a light mid-scene (shader recompiles).
- The three carried lights were point lights and are now spot lights (same count).
- Faces add two meshes per kid; props are a few dozen small meshes, hidden when stored.
- See the memory and frame probes in `docs/TEST_REPORT.md`.

## Review frames

`docs/qa/chapter5-repair/` holds frames captured from the real renderer (Chromium, SwiftShader) by
`tests/review-capture.mjs` and the scripts in `tests/review/` (garage, sock, look-down, stones, dock, gear, night).
They show the motion before, during and after each action, for a person to judge; they are not pass/fail.
