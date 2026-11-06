# Last Light — Chapter Seven: the hunter (`chapter7_hunter`) — asset guide

This is the contract between Chapter Seven and the creature model that plays its hunter. The chapter ships with a
**temporary procedural stand-in**; this document says exactly what a replacement has to provide so that it can be
dropped in without touching the story, the AI or any set piece.

It is deliberately a different creature from the smiling thing of Chapters Three to Six (`dist/creature.js`,
`dist/assets/creature/creature.glb`). Nothing here loads or changes that model.

## 1. Where it lives

| File | What it is |
|---|---|
| `dist/chapter7-creature.js` | The **adapter** (`createHunterModel`) and the **stand-in**. Exports `HUNTER_ID` (`'chapter7_hunter'`), `HUNTER_ASSET` (the replacement settings), `HUNTER_STATES`. |
| `dist/chapter7-hunter.js` | The **mind** (`createHunterAI`): patrol, search, pursue, attack, the chase, scripted beats. It moves a position and a heading and sets states and drive values. It never touches meshes. |
| `dist/creature-asset.js` | The existing small `.glb` reader (shared with the drain creature): one skinned mesh, one skin, its clips. |
| `dist/chapter7.js` | The chapter. It talks to the AI and, for set pieces, to the adapter's sockets and drive values. |

The replacement changes **only** `HUNTER_ASSET` in `dist/chapter7-creature.js` (and adds the file under
`dist/assets/chapter7/`). Nothing else in the game needs to change.

## 2. What the stand-in is (and is not)

A procedural humanoid about 2.3 m standing, with very long arms, a hunched spine that folds nearly flat when it runs
on its knuckles, a head that keeps pointing at what it wants while the body does something else, long fingers that
curl. Joints are solved every frame (two-bone IK for arms and legs); simple tapered segments are laid between them. No
skinning or authored animation. The Astra visual pass adds procedural mottling, more substantial anatomical forms,
and edge shading to this stand-in; it still uses the same joints and semantic sockets. It exists so the chapter can
be played and judged for staging, timing and readability. **It is a placeholder by design** and should be replaced by an authored model before release.

## 3. The adapter's interface (what the chapter and the AI use)

`createHunterModel({scene, asset, loadBytes})` returns an object with:

| Member | Meaning |
|---|---|
| `x, y, z, heading` | Where it stands (metres, world) and where its body faces (game convention: heading `a` looks along `(sin a, −cos a)`). The AI writes these. |
| `place(x, z, heading, y)` | Puts it somewhere. |
| `show(on)`, `visible` | In the world or not. |
| `setState(s)` / `state` | One of the semantic states below. |
| `drive` | Continuous inputs: `speed` (m/s, for gait), `low` (0 upright … 1 flat to the ground), `look` (a world point its head tracks), `reach` / `reachL` (world points its right / left hand reaches for), `open` (jaw), `tilt` (head roll), `lunge` (0..1), `back` (moving backwards, e.g. dragging), `twitch`. |
| `sockets` | `Object3D`s kept on the body every frame: `head`, `handL`, `handR`, `grab` (just in front of the right palm: what holds Jamie's ankle), `chest`, `hips`, `footL`, `footR`. |
| `eye(out)` | Its eye point (the `head` socket): the AI's line of sight starts here. |
| `radius()` | Collision radius (grows when it is low). |
| `source` | `'stand-in'` or `'asset'`; `error` if a configured asset failed (the stand-in stays). |
| `ready` | A promise that settles when the asset (if any) has loaded or failed. |
| `assetInfo`, `missing` | After loading: the asset's clips, mapped bones, size; the states that had to fall back. |

### Semantic states

`idle, walk, stalk, run, crawl, crouch, alert, peek, lunge, attack, grab, drag, hit, retreat`

Where the chapter uses them:

| State | Used for |
|---|---|
| `crouch` | The garage: low by the side door, looking at you. The bikes: waiting low behind cover. |
| `peek` | A hand round the newel post at the top of the stairs, the head leaning out after it (with `drive.reach` on the post). |
| `stalk` | Coming out of the doorway, down the stairs, the patrol round the ground floor. |
| `walk` | Searching; leaving the house up the street. |
| `alert` | It has noticed something: it stops and its head turns. |
| `run` / `crawl` | Pursuit; the chase; out of the garage on all fours. |
| `lunge` / `attack` | Catching you in the house; over the car at the bikes; the leap at Jamie. |
| `hit` | Hammering the door you hold shut with the dresser. |
| `grab` / `drag` | Jamie's ankle in its right hand, dragged backwards to the lane (`drive.back = 1`). |
| `retreat` | Spare (backing off). |

## 4. A replacement model: the file

* **Format:** binary glTF 2.0 (`.glb`), **one** skinned mesh with **one** skin (that is what `creature-asset.js`
  reads; it throws on anything else, and the stand-in stays).
* **Units and scale:** metres preferred. `HUNTER_ASSET.scale` converts model units to metres if not.
* **Orientation:** the model faces **−Z**, **+Y** up, its right hand on **+X**. `HUNTER_ASSET.yaw` (radians) is added if
  it faces elsewhere.
* **Origin:** anywhere; the adapter centres the model on its root and puts its lowest point on the ground.
  `groundOffset` adjusts.
* **Height:** set `HUNTER_ASSET.height` to its standing height (the AI's eye height is 0.88 of it).
* **Root motion:** none. Locomotion clips must play **in place**; the game moves the creature. Each locomotion clip's
  authored ground speed goes in `HUNTER_ASSET.speeds` so playback rate follows the real speed.
* **Skeleton:** any names; map the ones the sockets need in `HUNTER_ASSET.bones`: `hips`, `head`, `handL`, `handR`,
  `footL`, `footR`, and `grab` (the hand that holds Jamie's ankle; the right hand by default). A missing `head` bone
  puts the head socket at 0.9 of the height.
* **Clips:** map semantic state → clip name in `HUNTER_ASSET.clips`. Missing clips fall back through
  `HUNTER_ASSET.fallback` (chains are followed; `idle` is the last resort), so a model with only an idle and a run is
  already usable. The chapter never asks for a clip by name.
* **Materials:** standard PBR (`MeshStandardMaterial` after import). No custom shaders. The night scenes rely on its
  silhouette and on light falling across it: avoid self-illumination.
* **Budget (recommendation):** ≤ 30k triangles, ≤ 60 bones, ≤ 2 × 2048² textures, file ≤ 8 MB. The private playtest
  host does not serve `.glb` directly (the Chapter Six package carried the drain creature as base64 text); keep the
  file small for the same reason.

## 5. Swapping it in

1. Put the file at `dist/assets/chapter7/hunter.glb`.
2. In `dist/chapter7-creature.js` set, for example:

   ```js
   export const HUNTER_ASSET={
    url:'./assets/chapter7/hunter.glb', scale:1, yaw:0, groundOffset:0, height:2.3, radius:.42,
    bones:{hips:'mixamorig:Hips',head:'mixamorig:Head',handL:'mixamorig:LeftHand',handR:'mixamorig:RightHand',
     footL:'mixamorig:LeftFoot',footR:'mixamorig:RightFoot',grab:'mixamorig:RightHand'},
    clips:{idle:'Idle',walk:'Walk',stalk:'Sneak',run:'Run',crawl:'Crawl',crouch:'Crouch',alert:'Alert',peek:'Peek',
     lunge:'Lunge',attack:'Attack',grab:'Grab',drag:'DragBack',hit:'Hit',retreat:'Retreat'},
    speeds:{walk:1.1,stalk:.8,run:5.2,crawl:3.4,drag:1.6,retreat:1.0},
    fallback:{/* as shipped */},
   };
   ```

   (the bone and clip names above are only an example).
3. Run the creature checks (section 7). They load the file, report what was mapped and what fell back, and run the
   stealth, the chase and the abduction with it.
4. Look at it in the browser at the DEV scenes listed in section 7.

## 6. Licensing

Do not import a model from a random site. A replacement must be one of:

* made for this project (and recorded as such), or
* a model whose licence explicitly permits use, modification and redistribution in a game (e.g. CC0 or CC-BY with
  the attribution recorded), with the source URL, author, licence and the file's SHA-256 recorded in
  `docs/THIRD_PARTY_ASSETS.md` before it is committed.

The stand-in has no third-party content.

## 7. How to check a replacement

* Simulation: `ONLY=chapter7 CHECKS_ONLY=1 node tests/verify.mjs` runs the chapter's targeted checks, including
  "the hunter adapter loads a `.glb` (bones and clips mapped; missing states fall back)" — it loads the existing drain
  creature file through the adapter as a stand-in test of the loading path — plus the stealth (caught, retried,
  hidden), the chase and the abduction (Jamie's feet stay in the `grab` socket while it holds him).
* Browser: in the private build's DEV panel, **Chapter Seven** → *Garage Disturbance (first glimpse)*, *Creature Reveal
  (the stairs)*, *Stealth Encounter*, *The Door (it hammers)*, *Bicycle Escape*, *Jamie Grab*, *Rescue Struggle*,
  *Jamie Taken*. Things to look at: it reads as one creature from far and near; the
  hand on the doorframe; the head that keeps looking at you; nothing floats or sinks; the right hand really holds the
  ankle during the drag; the run is fast and low.
