# The smiling creature: behavior and implementation

Story-side profile: [The smiling creature](../02_CHARACTERS/THE_SMILING_CREATURE.md). Code:
[dist/creature.js](../../dist/creature.js) (controller and procedural animation), [dist/creature-asset.js](../../dist/creature-asset.js)
(a small GLB reader for exactly this asset), runtime model `dist/assets/creature/creature.glb`.

## The asset

One skinned mesh, **23,820 triangles**, one PBR material, a **46-joint** skeleton, and **one animation: an idle** (jaw,
hands, fingers; no locomotion, no root motion). Modelled in centimetres on all fours; placed facing exactly along its
heading, scaled ×1.35, lowest point on the ground. If it fails to load, the chapter still runs (the beats play; it is
not drawn) and `lastLight.chapter3.creature.error` says why.

## Movement (Chapter Four horror revision, shared with Chapter Three)

- **Velocity from where it really went** (story code just places it; teleports are detected and feet re-planted).
- **Gait by speed**: a walk (lateral sequence), a trot (diagonal pairs) and a **bounding gallop** (hind pair, then fore
  pair, with a flight phase), blended.
- **Planted contacts** with **two-bone IK** on each limb; hands flat and feet on toes while planted.
- **Weight**: bob, pitch against acceleration, roll into turns, spine flex; the head held level and turned to what it looks
  at, snapping fast.
- **Its own wrong way of moving**: low and quick with a slight weave; **dead still mid-stride**; the head turns **before**
  the body; frightened, it draws its limbs under itself and **shivers**.
- **Drive states**: speed, crouch, cower, back, alert, snap, look; rear and claw (Chapter Three's gate); controller states
  `hidden`, `emerge`, `reveal`, `creep`, `drop`, `turn`, `chase`, `side-out`, `gate`, `watch`, `tree`.
- Measured: foot slip 0 in run/stalk/turn; ≤ 0.09 m at a hard stop; ≤ 0.13 m in the Chapter Four encounter (accepted).
- **Collision**: two circles (r 0.42 and 0.38), never the mesh.

## Staging rules (keep)

1. **It waits until it has been seen** (head in front of you, nothing in between, 0.4 s), with cues from Sam and Jamie at
   2.5 s, 6 s, 12 s and a 40 s fallback. Never a turned camera.
2. **It never touches anyone.** Chapter Three chase: it keeps a chosen distance behind you and is never nearer; stopped
   dead, you see it come on to about **4.6 m** and rear; the closest while running was **6.3 m** across 24 randomized runs.
   Chapter Four: keeps 1.6 m from each boy as it passes; goes over the garage roofs if there is no room.
3. **No visible teleports.** It is repositioned only out of view (round a bend, inside a wall, at the treeline while you
   look back); tests count jumps over 1.2 m in view: **0**.
4. **Never on screen with the false Alex.**
5. **It is afraid of the Presence** (Ch4: freeze, look, back away, hide, flee as the lights die; Ch5: runs from the carried
   lights).
6. **Never named.**

## The Chapter Three chase (reference numbers)

| Stage | Where (drain s) | Distance behind you |
|---|---|---|
| far | 279 → 211 | 13–21 m at "RUN!"; first seen 18.9–25.4 m |
| lost | ≤ 211 | out of sight round the bend; splashes only |
| side | ≤ 185 | out of a low hole in the wall at ~9 m, chasing at 12.5 m |
| near | ≤ 96 | 8.5 m (after the old bike across the way) |
| gate | 74 | held 3.2 s, 6 blows, ≥ 1.2 m back from the bars; then bursts through |
| after | 74 → 9 | 16 m |
| mouth | ≤ 9 | stops in the dark inside and watches; never comes out |

Duration: 52.8 s scripted; 56–78 s randomized; limits 45–90 s. Details in [Chase design](CHASE_DESIGN.md).

## The Chapter Four encounter (reference)

watch (15–20 m) → stalk ("Don't run. Don't run.") → freeze → look (the TV shop corner's lights die slowly) → back →
scurry and **hide** in the lit corner of the video store ("It's hiding." "…From what?") → the streetlights start going out
far up Main → flinch and flee to the creek. If anyone comes within 6–7 m it bolts at once. In the escape it **passes**
the boys on every route.

## Known limits / for Astra

Procedural locomotion on an idle-only model (reads well at chase distance in the dark; simple up close in good light);
moves along authored lines, no pathfinding; comes out of the side opening through a black plane; the treeline glimpse
needs a ~105° look back on the bike. Wanted: a hand-authored run/stop/turn set, a crouched hide pose, a recoil, dust at
contacts, real audio (wet footfalls, breath, steel gate), better staging light.
