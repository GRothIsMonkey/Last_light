# Physical interactions

> Added by the Chapter Five repair (🟡 IMPLEMENTED BUT UNAPPROVED) after the playtester complained that packing,
> pickups and the shirt happened "on a caption". Rule: **nothing appears in a hand or disappears from a table on a
> caption; a prop changes place only at the moment of contact.**

## The system ([dist/physical.js](../../dist/physical.js))

- **Prop:** any Object3D plus a **grip** (where it sits in a hand, in the hand's own frame): `prop(name, obj, {grip})`.
- **Container:** any Object3D plus an **opening** and an open amount the scene animates: `container(name, obj, {opening})`.
- People (Jamie, Sam, and your first-person hands via `playerReach`) **reach** (bending for low things), **make contact**,
  **carry** (the prop follows the hand frame by frame), **store** into a container's mouth, **hand over**, **hold out**,
  **sit** (`sit`, seated "legs over the edge" pose), and **wear** a bag (`wearOn`: belt to shoulder blades).
- Small things are taken within an arm's length (~1–1.25 m); hand-overs are staged at arm's length, chest height.

**Contract for art:** "Replace the meshes, keep the names, grips and openings, and every scene still works." A new prop
model needs only its grip re-measured.

## Where it is used (Chapter Five)

| Interaction | Module | What happens |
|---|---|---|
| Packing in the garage | [chapter5-garage.js](../../dist/chapter5-garage.js) | Table frame `TL()`; supplies `supply-flashlight-*`, `supply-batteries-*`, `supply-water-*`, granola bars, the county map, Alex's camera; F on a thing, F on Sam's bag; Sam packs the rest himself (`bagSteps`); two backpacks with hinged flaps |
| Jamie's sock | `sockScene` | He swings his worn bag round, opens it, pulls out one sock, holds it up; it goes back with the granola bars |
| The camera hand-over | chapter5-garage.js | Sam walks round the table to arm's length (or holds it across the table) |
| Skipping stones | [chapter5-park.js](../../dist/chapter5-park.js) | 22 stones on the shore; F picks one up; **hold F** to wind up (low, back past the right hip), release to throw; C for a lower, flatter throw. Real arc; a touch skips while it comes in under ~24°, fast and spinning, losing speed by how steep it came in (`bounce`); rings and splashes |
| Wading | [pine-plan.js](../../dist/pine-plan.js) `WADE`, `PS.shallow` | Walkable water cells, slower, rings at each step |
| Sitting on the dock / at the fire | physical.js `sit` | Seated bodies; S stands you up, F sits you back down |
| Gates | [chapter5-gates.js](../../dist/chapter5-gates.js), `GATES`/`gateAt`/`gateBar` in pine-plan.js, turned by pine-build.js | Collision follows the drawn angle (written back each frame); F at the latch; Jamie does it if you don't; stops against a player in the way; doors block until visibly open |
| Flashlight hand-out and batteries | [chapter5-gear.js](../../dist/chapter5-gear.js) | Sam hands flashlights out of his bag at the camp gate; in Bluejay he holds out a battery pack and your hands change them |
| Photographs | chapter5-gear.js | Both hands raise the camera; a fingertip on the shutter |
| Alex's shirt | chapter5.js | Sam reaches up, takes it off its nail, gathers it, swings his bag round, opens it, puts it in, closes it |
| Water at the fire | chapter5.js | Sam passes a bottle round inside the logs to Jamie, who drinks and sets it down |

## Known placeholders (Astra)

No fingers (blocky fists; the flashlight passes through a fist, the camera rests on a palm); procedural box/cylinder
props; the shirt "folds" by scaling, not cloth; the sock is a rigid L-tube; one consistent skipping-stone mesh needed;
reach animations stiff; the throw should be a low sidearm with a body turn.
