# Chapter Five — handoff to the Astra visual pass

Source: `claude/chapter5-gameplay-story-repair` (the gameplay and story repair of Chapter Five; see
`docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md`). This repair did **not** do the visual pass: the playtester judged almost every
visual aspect except the sky to be well below the intended quality, and that is the Astra pass's job. This file lists
what the repair built that the visual pass will dress, what is placeholder, and what must not change underneath it.

This build waits on the human playtest; it is not approved.

## Functional contracts: the structure the visual pass can rely on (and must keep)

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

### Chapter Five only (Chapters Zero to Four must look and play as they did)

The repair's shared-code changes are switched on by Chapter Five and off by its reset (`chapter5.js` `common()` and
`reset()`); a re-skin must keep them switchable:

- `foot.fpBody` (`on-foot.js`): the first-person stance, the body set back under the eye, the eye that dips looking down,
  the deeper look-down limit (`game.js`).
- `face.enable(on)` (`faces.js`): the expressive faces swap the head geometry (brows and mouth out of the head mesh) and
  show the dynamic mouth and brows; off, the static head and the old blink are back. `enable()` does nothing when the
  face is already in that state (a reset must not put a head back over Chapter Three's detailed heads), and
  `chapter3-art.js`, switching off, restores only a value it still owns.
- `nav.setPine(on)` also selects the friends' garages as walk-in rooms (`nav.js` `gRoom`) instead of solid boxes (`gBox`),
  for collision and for the siren's walls.
- `P.garageFoundation` (`houses.js` `liveFooting`): the friends' garage footings are live meshes, not baked, draped on the
  ground vertex by vertex the way the bake drapes; `slabs(true)` lowers them 0.18 m to the floor people stand on. A re-modelled
  garage keeps its footing out of the bake (or the lowering will not show).

### Interaction contracts

- Spot ids (`g5-*`, `p5-*`, `c5-*`) and their ranges: small things are taken within an arm's length (about 1-1.25 m);
  a re-modelled prop keeps its prop name and gets its `grip` re-measured.
- The shot timeline (`chapter5-gear.js` `shootArms`): up by 0.38 s, the finger down at 0.40-0.46 s, the picture taken and
  the flash at 0.46 s, the picture held on the screen, down from 1.05 s, done at 1.4 s; the flashlight is hidden and its
  beam off for that time.
- Carried lights: three, always in the scene; `carry(n, paths, {speed})` with a path each walks them single file, a step
  apart where they stop, each to its own seat; the beam cone (`BEAM_L`, `beamTex`) fades along its length and when it
  faces the camera.
- The double: `doubleWalk(path, {speed})`; the run starts once it is out of the door and close, or after 8.5 s.

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

## Visual deficiencies found in the review captures

A frame-by-frame inspection of the 22 review scenes (`docs/qa/chapter5-repair/`) listed what the picture gets wrong.
They are grouped here by what the Astra pass would change. Items marked **(repaired)** were functional faults (staging,
attachment, timing) that this repair fixed in code after the inspection; the rest are art and are left as they are.

### Characters (Jamie, Sam, the double)

- **Rig and proportions.** Tube limbs with ball shoulders that read as pauldrons, visible seams at elbows and wrists, a
  long thin neck, forearms too long (relaxed hands hang to mid-thigh), a bulbous pelvis, long straight leg cylinders and
  an oversized head. Rest poses are knock-kneed with bent knees; walk cycles have little arm swing and a stiff torso; the
  knee kinks the jeans with no deformation. The crossed-arms idle crosses the forearms high, in an X, through each
  other; the hands-on-hips pose never reaches the hips.
- **Clothing.** Shirts are rigid tubes with puffed sleeves; the collar is a separate white torus and the hem a separate
  ring standing off the waist (it reads as a glass hula-hoop in several frames), with hairline lines down the shirt
  sides and a small tan wedge at Sam's hip. Shorts and jeans are plain cylinders; bare skin shows between cuff and shoe;
  Jamie's tee has a seam at the belly that reads as a second mouth.
- **Shoes.** A flat white sole plate overhangs each shoe like a ski; no contact shadow or occlusion under any foot.
- **Hands and grips.** Blocky fists everywhere; nothing is gripped by fingers (the flashlight passes through a fist, the
  camera rests on a flat palm, the battery card sits on the back of the wrist, the stone dangles below the fingers).
  Grips need finger poses and hand-relative sockets (the `grip` of each prop in `physical.js` is where they plug in).
- **Faces.** Eyelids are flat discs across the middle of the eyeball instead of lids that cover it; eyes are faceted
  spheres with oversized pupils and no iris; the nose is a cone or sphere. The dynamic brows exist but sit under Sam's
  fringe and Jamie's cap brim, so they barely show. Mouths are small and low in contrast (they vanish beyond about 3 m),
  sit slightly proud of the face (visible on the profile, below the chin in one frame), and the expression range is too
  subtle to carry a laugh, surprise or relief. Lip movement is text-timed and small.
- **Hair.** Solid helmets with a sawtooth fringe; black blobs under the back of Jamie's cap; skin shows under the hair cap
  from behind.
- **The double.** A default stiff pose with fists; it needs a deliberate, wrong-feeling idle and walk and a readable
  "smiling with Jamie's face".
- **Look-at.** Sam's head pitches back with the eyes rolled up when he looks at the double; clamp head pitch and aim at
  the face.

### Backpacks, props, the shirt

- **Backpacks** are strapless boxes, too large, and were worn at head height. **(repaired: worn lower, belt to shoulder
  blades, `physical.js` `wearOn`.)** They still need a soft model with shoulder straps over the chest and a real open
  and closed state; the open flap is a single plane.
- **Flashlights** are capped cylinders with no lens, head or switch (the companions' read as hockey pucks at night); the
  battery change is a sealed card pressed to the tail (no cap off, no cells).
- **Stones** differ in colour, shape and size between ground, hand, release and flight; one flat skipping-stone mesh is
  needed, with a contact shadow.
- **The shirt** is a rigid board that "folds" by scaling into a fan of planes; it needs cloth states (on the nail,
  bunched in a fist, a bundle that fits in the bag).
- **The sock** is a rigid L-shaped tube; the granola bar is a tiny green blob fused with whatever else is in the fist.
- **The register** is one oversized sheet on a closed blue slab, the page text small and low in contrast.
- **Alex's camera** in the shot is mirrored compared with a real compact (shutter at the left as you hold it). The
  finger was placed at the wrong end **(repaired: the left index finger over the shutter, the screen shows live focus
  brackets, then the picture held white-edged with a count)**; the model itself is Chapter Four's and was not changed.

### First-person body

- The arms are bare skin tubes from the screen corners with no sleeve, an elbow bulge, mitten hands with a thumb block,
  sausage fingers and a forearm in a darker tone than the hand. Held things sit low and half out of frame.
- Looking down: the shorts are two tubes with no crotch, ground shows between the thighs, knees are rounded caps, the
  sneakers tall blocks, the shins thin; crouched, the jeans balloon and skin shows in the shoe openings.
- Seated on the dock, the body shows layered shirt shells with gaps; a seated first-person body is needed.
- Crouched to throw, the eye went inside the collar **(repaired: Chapter Five's body sits further back and leans less
  when crouched or dipping into a throw)**.

### Animation and staging

- Bike mount: no visible kickstand kick, the reach for the saddle is a stiff straight arm, the leg swing over freezes
  with a foot in mid-air, riders stand over the top tube instead of sitting with a foot down.
- Hand-offs were staged at a distance **(repaired: Sam comes to an arm's length and holds the camera, the flashlight and
  the batteries out at chest height; the take ranges are an arm's length)**. Reach animations still read stiff.
- The stone throw reads as a level, shoulder-height swing; a low sidearm with a body turn is wanted.
- Companions' seated "legs over the edge" pose reads as straight legs from some angles.
- Idle variety is thin: the friends hold one pose for long stretches and look straight at you.

### Environment

- **Water:** a flat pale sheet with no shading, reflection or shoreline transition; the shallows are opaque (feet vanish);
  ripples and wading rings are hard-edged grey polygons with no splash.
- **Ground:** the dirt road texture is noisy and will shimmer; the beach turns flat olive looking down; jagged notches and
  a dark seam along the gravel road edge.
- **Camp buildings:** flat untextured walls and plastic-looking posts; porch ceilings render black; the office and cabins
  are evenly lit with no visible source. The wall battens ran across door and window openings like bars **(repaired:
  they stop at the openings, `pine-camp.js`)**.
- **Camp gate:** untextured posts and a blank sign, thin flat rails, no hinge or latch hardware, and no fence line: a
  slammed gate that could be walked round. A fence into the woods would make the slam a threat.
- **Yellow gate:** no hinge collar, counterweight or latch mechanism; the latch is a dark square on the post. (The arm
  was baked and never seen to turn; **repaired**: it is built live and turns on screen.)
- **Porch light:** a bare white egg on an invisible cord.
- **The lot:** no lamp post or fixture is visible at the aftermath, only a pool on the grass; bike spokes glow white.

### Light and time of day

- At the first light (7:44 PM) the sky is still pink twilight and everything is easy to see, so the scare has no contrast;
  eight game minutes later (the three lights) it is suddenly near black. The escape (8:12 PM) is under a bright lavender
  sky, brighter than the porch scene before it, so "every light out" does not read. The night grade needs to be smooth
  and darker from the call on.
- **Carried beams** read as hard flat cones and, pointed at you, as a floating disc **(repaired: the cone fades along its
  length and fades out when it faces you, a lens glint takes over, the pool is brighter)**; volumetric dust, bloom or a
  flare would sell them. Their holders are never seen; at dusk brightness that reads as a light floating at waist height,
  so the scene needs to be dark enough to hide the holder (a story requirement: the Presence is not shown).
- **The player's flashlight** shows as a glowing blob in first person with a faint pool by day; it needs a visible
  torch in the hand and a hotspot with falloff.
- **The camera flash** is a flat brightening that also lights the camera's back silver; it needs a short burst thrown
  forward from the camera front.
- **Faces at night** are near black; fill or bounce light is needed so fear reads. The fire gives no warm flicker on faces.

### What the inspection could not see (capture limits)

Some moments fall between frames (the grasp at the table, the bag going on, the kickstand); the frames are a sample of
each action, not every moment of it. `tests/review/*.mjs` can be given more `cap()` calls where a moment needs it.

### Small issues left as they are (cosmetic or rare; for the playtest to judge)

- The garage's baked concrete slab is 1–2 cm above the floor people stand on, so feet sit 1–2 cm into it (the footing
  under it now matches the floor). A re-modelled garage floor should sit at the walk height (+0.2 m).
- Sam can linger in Owl after taking the shirt in some runs, until the companion guard brings him back out of sight.
- From inside Alex's room the car garage's live footing is culled where its baked predecessor was drawn (not visible
  from there).
- The world's mesh count (2,259) is over the 2,000 ceiling of the world-geometry check, as on the first draft.
- Under software GL the renderer peaks at 4–6 GB on a jump; the human playtest should watch memory over a long session.

## Review frames

`docs/qa/chapter5-repair/` holds frames captured from the real renderer (Chromium, SwiftShader) by
`tests/review-capture.mjs` and the scripts in `tests/review/` (garage, sock, look-down, stones, dock, gear, night).
They show the motion before, during and after each action, for a person to judge; they are not pass/fail.
