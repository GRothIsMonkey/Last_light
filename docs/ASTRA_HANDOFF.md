# Historical handoff

This document records Claude's structural pass at `59c647220e80d12da0d205b1562d483cc5bdb7f3`. The subsequent final polish release is documented in [ASTRA_FINAL_RELEASE.md](ASTRA_FINAL_RELEASE.md); current verification is in [TEST_REPORT.md](TEST_REPORT.md). Art-pass suggestions and branch status below describe that earlier handoff.

---

# Last Light — handoff to Astra (structural polish pass)

This branch (`claude/epic-planck-cme9eq`) starts from `codex/astra-v0.1-release` (`21bb7a7`) and is **not merged into `main`**. It is a structural pass. Story, pacing, the three departures, the sunset, the end of the street, the `AR` chalk clue, the ending card and the audio are all preserved. What changed is the foundation: geometry, physical layout, riding systems, character construction, interaction plumbing and QA.

Nothing here is a final art pass. Colors, materials, lighting and menus are deliberately plain and centralized, so the final look can be set without re-deriving the structure.

- How to run: `python3 -m http.server 8000 --directory dist`, then open `http://localhost:8000/`. Add `?qa` for the deterministic QA hook (`window.lastLight`).
- How to verify: `npm test` (92 checks, about 75 s) and `npm run test:browser` (Chromium, screenshots into `docs/qa/`). `QUICK=1 npm test` skips the slow geometry sweeps while you iterate on gameplay.

---

## 1. Where everything lives

All runtime code is in `dist/` (ES modules, no build step, Three.js r160 vendored).

| Area | File(s) | What to touch there |
|---|---|---|
| **Layout** (street names, junctions, lot spacing, friend homes, lookout spots) | `dist/layout.js` | `STREETS`, `JUNCTIONS`, `LOOKOUT`, `SECTION`, `FRIEND_HOMES` |
| **Palette** (every house / street / car / foliage / fence / interior color) | `dist/palette.js` | `HOUSE`, `INTERIOR`, `STREET`, `CAR`, `FOLIAGE`, `FENCE` |
| **Surface shaders** (asphalt grain, concrete, roof rows, lap siding, brick, fence boards, leaf cards) | `dist/materials.js` | `surfaceMaterial(material, kind)`, `leafTexture`, `cardCluster` |
| **World assembly** (placement modes, baking, merging, shadow proxies, lit windows, ground queries) | `dist/world.js` | `buildWorld()`, `litMaterial()`, `bakeAndMerge()` |
| **Street frames and terrain** | `dist/terrain.js`, `dist/route.js` | `MAIN`, `makeSideFrame()`, `terrainY()`, `roadCrown()` |
| **Streets** (asphalt, curbs, gutters, sidewalks, lawns, junction corners, side streets, cul-de-sac, rideable surfaces) | `dist/streets.js` | `buildStreets()`, `XS` (cross-section), `W.rideable` |
| **Houses** (lot planning, architecture, roofs, garages, porches, driveways, doors, interiors) | `dist/houses.js` | `planHouse()`, `buildHouse()`, `gableRoof()`, `hipRoof()`, `buildFoyer()`, `buildGarageInterior()`, `buildDrive()`, `makeDynamic()` |
| **Trees and shrubs** | `dist/vegetation.js` | `createVegetation()` → `build()` (kinds `maple`, `oak`, `pine`, `birch`, `young`; LOD `full` / `mid` / `far`) |
| **Street furniture** (streetlights, power network, signs, hydrants, inlets, manholes, patches) | `dist/furniture.js` | `lampPost()`, `pole()`, `span()`, `plate()` / `paint()` (signs) |
| **Yards, props, cars, fences** | `dist/props.js` | `makeCar()`, `fenceRun()`, `mailbox()`, `bins()`, toys, `swingSet()`, `shed()`, lookout bench and field |
| **Background** (second row, far houses, pole lines, horizon trees, far land) | `dist/background.js` | `buildBackground()` |
| **Characters** (who everyone is) | `dist/cast.js` | `CAST` (face, hair, build, clothes, bike, riding manner), `FORMATION` |
| **Rig** (bodies, heads, hair, hands, shoes, bicycles, poses, IK) | `dist/rig.js` | `headGeometry()`, `createPerson()`, `bikeGeometry()` + `STYLES`, `createBike()`, pose functions |
| **Friends' behavior** (group riding, departures, Jamie's mother) | `dist/friends.js` | `ride()`, `cycle()`, departure step lists |
| **Ambient life and lights** (sprinklers, hoop kid, minivan, birds, fireflies, streetlights, porch/window glow, flag, tire swing, town lights) | `dist/ambient.js` | `update*()` functions; swing: `pushSwing()`, `swingPosition()` |
| **Player, camera, input, lighting over time, game states** | `dist/game.js` | sky shader, `hemi`, `sunlight`, fog, exposure (in `update()`), `updateRide()`, `placePlayerBike()`, `updateWalk()`, `updateFinale()`, `promptItems()`, `applyQuality()` |
| **Interface** (title, pause, settings, credits, prompts, memory lines) | `dist/index.html`, `dist/style.css`, `dist/ui.js` | markup, styles (a clearly marked structural block at the end of `style.css`), `createUI()` |
| **Story text** (beats, chapters, finale lines, memory lines) | `dist/story.js` | `memories`, `chapters`, `finale`, `reflections` |
| **Memory-line timing** | `dist/nostalgia.js` | `createNostalgia()` |
| **End-of-street interactions** | `dist/interactions.js` | spots (swing, bench, chalk), camera poses |
| **Ending effects and lore** | `dist/ending.js` | chalk `AR`, oak carving, the other bike |
| **Audio** (all synthesized) | `dist/audio.js` | `createAudio()` (`setVolume()` added) |
| **Automated checks** | `tests/verify.mjs` | 92 checks (headless, mocked renderer) |
| **Rendered QA and screenshots** | `tests/browser.mjs` | Chromium run, captures into `docs/qa/` |

### How the world is built (read this before editing geometry)

`world.js` gives every builder four placement modes, so nothing is stretched by the curving street:

- **bent** (`W.bent(frame)`): authored flat in street coordinates, then each vertex is mapped onto the street frame. Used for long things that follow the street: road, curbs, sidewalks, lawns, fences, chalk.
- **drape** (`W.drape`): rigid footprint, base heights sampled from the ground. Used for houses.
- **rigid** (`W.place(frame, u, v, {y, rot})`, `W.placeWorld(x, z, y, rot)`): whole objects placed upright. Used for trees, cars, props, poles, background.
- **baked** (`W.baked`): meshes already in world space. Used for driveways, wires and far land.

Everything static is then **baked and merged by material and 110 m cell** (220 m for far content). Batched materials use vertex colors, so palette changes flow through automatically. Shadows come from position-only **shadow proxies** (50 m cells) on layer 1. `sunlight.shadow.camera.layers.enable(1)` makes the sun see them; the main camera does not.

Windows and porch lights use two shared shader materials, `glassLit` and `porchLit`. The vertex color's red channel stores the moment each light comes on. Uniforms `uP` (ride progress) and `uNight` are driven from `ambient.js`.

Named meshes survive merging as `world.originals` (for example `roof-slope`, `main-road`, `sign-face`, `garage-interior`, `lookout-walk`, `far-land`), which is how the tests inspect them.

---

## 2. What Claude changed

### World continuation (`background.js`, `terrain.js`, `route.js`)

- The ground continues everywhere. `terrainY()` blends the street ground into rolling land with knolls. A far-land mesh (about 61k triangles, no shadows) reaches the horizon and stays under authored lawns.
- The street runs on about 430 m behind the start, so looking back never finds an edge.
- **Second row:** 106 houses back onto the rear fences (the next street over), with back-yard trees, sheds and lot-line fences.
- **Far field:** 637 simplified houses (box, bare hip roof, lit window quads), about 1,300 far-LOD trees, distant pole lines at ±68 m and a horizon tree ring. All of it fades into the fog.
- Measured by the tests: a ray 2° below the horizon hits the world in all 192 sampled directions. A level ray hits houses, trees or hills in 96.9% of directions; the rest look straight down the street or out over the lookout field. Through every gap between first-row houses there is more neighborhood behind (100%).

### Side streets, intersections and names (`streets.js`, `layout.js`, `furniture.js`)

- Two cross streets, each 250 m long, straight then bending over a crest so the far end hides itself: **Briarwood Ln** (right, at d 595) and **Summerfield Rd** (left, at d 870). Each has the full cross-section (asphalt, gutter, curbs, planting strip, sidewalk, lawns), 16 houses (full LOD near, mid LOD farther), mailboxes, trees, curb-parked cars, streetlights, a branch power line and a stop bar.
- The main street is **Oak Hollow Dr**. At each junction a corner post carries a stop sign and two double-sided blades: the Oak Hollow blade runs along Oak Hollow, and the cross-street blade runs along the cross street. Other signs: SLOW CHILDREN AT PLAY, SPEED LIMIT 25, and NO OUTLET past Summerfield (the street ends in the cul-de-sac). All names come from `layout.js`.
- Curb returns at the junction corners use a 6.5 m radius. The cul-de-sac mouth is filleted, and the lookout walk follows the grassy rise.

### Houses (`houses.js`, `palette.js`)

- Every lot is planned before building (`planLots`), so driveway curb cuts, mailboxes and fences line up with the house that owns them.
- Each house is built rigidly in its own frame and draped on the ground. The foundation follows the terrain.
- Four styles (ranch, colonial, cape, front-gable) and three roof types (hip, side gable, front gable). Variations: attached one- or two-car garages on either side, porch / portico / stoop, dormers, interior or exterior chimneys, brick veneer (full front or lower wainscot), shutters, AC units, rear decks and patios.
- Complete from every side: foundation, lap siding, corner boards, fascia, soffits, rake boards, ridge caps, gutters and downspouts. Windows on all four walls have trim, sills, mullions and curtains; side windows are skipped only where a garage covers the wall. Rear windows and a back slider, porch lights.
- Softer silhouettes where they matter: rounded boxes for trim, posts, steps and porch parts; turned (lathe) columns.
- Fixed in this pass: brick veneer used to cover the front windows. Windows, door and porch light now sit on the brick face.

### Curbs, sidewalks, driveways and sidewalk riding (`streets.js`, `houses.js`, `game.js`)

- Swept curb profile with a rounded top, gutter strip, planting strip, and sidewalk with joints.
- Driveway curb cuts with aprons. Each driveway blends from the street's surface into the house's grade, with side skirts, walkways and lead walks.
- **The player can ride on the road, across driveway cuts, along sidewalks and in the cul-de-sac.** Lawns, planting strips and curbs away from cuts are not rideable (`world.rideable()`).
- The bike sits on whatever it rides: height and pitch come from both wheels, smoothed. A bike that rolls straight off the end of an apron eases onto the nearest paved band instead of crossing grass.

### Power lines (`furniture.js`)

- One connected network: lot-line poles down the left side, a corner pole at Summerfield, a crossing arm at Briarwood, and branch lines down both side streets. Transformers on some poles, a guyed dead-end at the last pole, and service drops from poles to the houses near the line.
- Every span sags. The tests check all 114 spans end at pole attachment heights, all 112 drops run pole to house, and no wire ends in the air.

### Trees (`vegetation.js`)

- Trunks flare into the ground. Every crown hangs from a limb that grows from the trunk, so no crowns float.
- Trees are placed whole (never bent by the street), so none are sliced or stretched.
- Kinds: maple, oak, pine, birch, young (staked). LOD by distance.
- An occupancy grid keeps them off roads, sidewalks and driveways; the tests check all 1,661. The old oak has a 14-sided trunk and roots.

### Fences (`props.js` → `fenceRun`)

- Privacy, chain-link, picket and rail styles, with regular posts that follow the ground and deliberate end posts.
- Rear fences break at the junctions. Lot-line fences with gates meet the houses. The second row has its own lot-line fences.

### Cars (`props.js` → `makeCar`)

- Each kind has an extruded, rounded side profile: body, hood, roof, trunk or hatch, windshield and side glass, pillars, mirrors, bumpers, head and tail lights, wheel wells and wheels.
- Parked in driveways (always behind the sidewalk now), at curbs, and on the side streets. The minivan that comes home now arrives down Briarwood Ln.

### Bikes (`rig.js` → `bikeGeometry` / `createBike`, `cast.js`)

- Four frame styles, each with its own geometry: road-kid (player), BMX (Jamie), mountain bike (Sam) and cruiser (Alex).
- Every bike has a fork, stem, bars (riser, BMX, flat or swept), grips, saddle and post, spoked wheels with tires (knobby on Sam's), chainring, crank, pedals and a kickstand.
- Extras: pegs and pad (Jamie), bottle (Sam), rack and bell (Alex), bell and reflector (player).
- Each bike is merged into a few rigid assemblies (frame, steering, wheels, crank).

### Player body (`rig.js`, `game.js` → `placePlayerBike`)

- The whole body is present: torso, sleeves, arms, hands, legs, socks and sneakers.
- The head and neck render only into the shadow pass (layer 1). The camera sits in the head and the rider still casts a whole shadow.
- IK keeps the hands on the actual bike's grips (within 1.6 cm) and the feet on its pedals (exact).
- Looking down shows the chest, arms, hands on the grips, the bars, knees and shoes on the pedals. The rendered QA covers this pedaling, steering, braking, pushing hard, stopped, getting off and getting back on.

### Friends: individuality and riding (`cast.js`, `rig.js`, `friends.js`)

- Each person is a data entry in `cast.js` with:
  - **face:** jaw, cheek, eye spacing and height, brow tilt, nose type, mouth type, ears, skin, lips, iris
  - **hair:** cap, messy, swept, shaggy, cropped or ponytail, plus color
  - **build:** bulk, shoulders, head size, posture, hunch
  - **clothes:** shirt, trim, sleeves, collar, shorts or pants, socks, shoes, soles
  - **bike**
  - **riding manner:** cadence, crank phase, sway, standing tendency, weave, look frequency, reaction lag
- Heads are single merged meshes with eyes, brows, nose, mouth and ears. Jamie's mother and the hoop kid use the same system.
- Riding is per friend: own reaction lag, own gearing, own crank phase, standing bursts on their own schedule and duration, own sway and weave.
  - Tests: friends' cranks are within 0.25 rad of each other only about 12–13% of the time (random phases would give about 23%).
  - When you surge, each rider decides for themselves. After their own delay (0.2–3 s, drawn fresh for every surge) they stand up out of the saddle, or they stay seated this time (Sam most often, Jamie least).
  - A standing rider rocks the bike under a nearly upright body: the torso rolls at most about 13° against the bike, which leans the other way.
  - Fixed in this pass: standing riders used to roll their whole torso by up to about 40°, and in some surges all three stood within 0.3 s of each other.

### Group speed, player speed and catch-up (`game.js` → `updateRide`, `friends.js` → `ride`)

- **Departures:** the pace eases by only 10–15% for a short window; the group's slowest speed while a friend peels off is 4.23 m/s. The departing friend peels off directly and the head glances toward them.
- **Player speed:**
  - Cruise is 4.75 m/s.
  - Holding W for more than 5 s eases into a light push.
  - Shift pushes harder, up to +30% (about 6.3 m/s top). Stamina drains while pushing hard and recovers when easing off.
  - The push fades once you are about 9 m ahead.
- **Catch-up:** friends read your speed through their own reaction lag. While you push they gradually let you lead; when you ease off they re-form. Nothing teleports (largest friend step per frame is 0.27 m).
- **Fixed in this pass:** a friend in your line now keeps rolling and moves aside instead of braking in front of you. Previously you and that friend could slow each other down to a stop.

### Steering and head look (`game.js`)

- **Steering:**
  - Input eases in and out.
  - The heading follows through a critically damped response, so there is no spring-back: overshoot after release stays under 0.012 rad in the tests. Momentum carries on after you let go.
  - Handlebar angle comes from the bike's actual yaw rate and lean from speed² × curvature, so bars, front wheel, lean and rider always agree.
  - At a curb the front wheel turns away and the bike runs along the edge.
- **Head look:**
  - Mouse: ±1.85 rad left/right, 1.2 down, 0.6 up. Q/E add ±1.1 rad. R recenters. Sensitivity is a setting.
  - The automatic glance toward a friend heading home starts only after 3 s without manual look. It returns only after 14 s of quiet with the view near center.

### House entries and garage (`houses.js` → `buildFoyer`, `buildGarageInterior`, `makeDynamic`)

- **Jamie and Alex:** real door openings in the facade. The doors swing about 85° inward into lit foyers with floor, walls, ceiling, stairs, a table lamp and a rug. They go through the door before they are hidden.
- **Sam:** a garage about 7 m deep with shelves, bins, a workbench, pegboard, water heater, mower, bikes on the wall and a ball. The house door at the back has steps. Sam parks, waves, walks through that door, and the garage door closes over a real opening.
- Tests: the doors swing inside, entry paths are clear, and the garage is more than 5 m deep with clutter.

### Interface (`index.html`, `style.css`, `ui.js`, `game.js`)

- **Title:** "Take the long way home", Settings, Credits, and the controls list (the only place the full list appears).
- **Settings** apply immediately and are remembered in this browser (localStorage, fails safe):
  - volume
  - mouse sensitivity
  - graphics quality: low / medium / high sets pixel ratio 1 / 1.35 / 2 and shadow map 1024 / 2048 / 3072
  - show friends' lines
  - show memory lines
  - full screen
- **Pause (Esc):** Keep riding, Settings, Start over, Back to the title. Esc closes an open panel first.
- **Contextual prompts only:**
  - A short riding tutorial: W / Mouse, then A+D, Space and Shift, each until learned.
  - Nothing during the ride after that.
  - At the end of the street: F (get off / get back on / ride home / push the swing / sit down / stand up / look closer) and W (ride home).
  - On touch devices the action button mirrors F.

### Interactions (`interactions.js`, `ambient.js`)

- **Tire swing:** a real pendulum on 3.35 m of rope. A push sends it away from you and it settles; it creaks at the turnarounds.
- **Bench:** sit and look around; stand with F or by walking.
- **Chalk:** crouch down to it for a few seconds.
- **Getting back on before the call** keeps you at the end of the street; after the call it takes you home.
- **Bell:** friends still riding look back, each after their own moment, and a bell answers.

### Memory lines (`story.js` → `reflections`, `nostalgia.js`)

Five short lines in the voice of the one looking back. Each appears once, softly, never over a friend's line, and can be switched off in Settings:

- "I thought we'd always ride this street." (d 132–168)
- "Back then, going home only meant until tomorrow." (after the first friend is inside)
- "We used to stay out until the streetlights came on." (d 571–598)
- "I don't remember when the neighborhood got this quiet." (d 734–770)
- "Nobody ever said which summer would be the last." (during the final fade)

### Ending and lore (`ending.js`, `game.js` → `updateFinale`)

- **More room to breathe:**
  - The call comes after 18 s if you look back for 1.4 s, otherwise at 36 s.
  - Riding home fades over about 6.5 s, carrying the last memory line.
  - Staying fades on its own after 100 s, over 6 s.
- **`AR` chalk (preserved):** still plain during the final fade. After the call it can also be found faintly, if you crouch at the chalk and turn toward it.
- **New:** `AR` cut into the old oak's bark at a kid's height, facing the swing. It is dark and only readable up close.
- **New:** an old bike lying under the oak. It appears only after the call, and only while you are looking away and more than 6 m from it. The tests confirm it never pops into view.
- No sound, light, figure or text accompanies either addition, and replay resets all of it.

### Nostalgia hooks for set dressing (`props.js` → `W.hooks`, exposed as `world.hooks`)

Every placed nostalgic object is registered by name with its object and street position:

- **Yard objects:** `bins` (54), `hose` (32), `trampoline` (24), `parked-car` (41), `kiddie-pool`, `big-wheel`, `bike-in-yard`, `ball`, `wagon`, `lawn-chairs`, `scooter`
- **Singles:** `portable-hoop`, `toy-at-curb`, `scooter-in-grass`, `ball-in-grass`, `chalk`, `bench`, `old-oak`, `initials`

Use these to restyle or swap objects without searching the builders.

### Replay and reset

"One more summer", Start over and Back to the title reset all of the following (tested):

- friends, bikes, departures, doors and the garage
- the mother
- lights and streetlights
- the minivan, the hoop kid and sprinklers
- ambient timers
- the swing and interactions
- memory lines and prompts
- the ending state: chalk, carving visibility, the other bike
- the player's speed system (push, stamina, steering state)

---

## 3. What Astra should focus on next

In rough order of payoff:

1. **Materials and textures.**
   - Siding, brick, roofing, asphalt and concrete are simple procedural shader variations (`materials.js`) on vertex-colored batches (`palette.js`).
   - Stronger materials (normal detail, roughness variation, weathering), more realistic glass and a real window interior treatment would lift everything.
   - The chalk is drawn with 1-pixel `LineSegments`. Textured decals would read far better (keep the `AR` behavior in `ending.js`).
2. **Lighting and atmosphere.**
   - The sky shader, fog colors and density, hemisphere and sun curves, and exposure are all in `game.js` → `update()`.
   - The window and porch light timing lives in `litMaterial` (`world.js`) and `ambient.js`.
   - Dusk could be richer: bounce light, streetlight pools, window spill, better night color on the lookout.
3. **Character visual quality.**
   - Faces, hair, clothes and hands are stylized low-poly (`rig.js` → `headGeometry`, `torsoGeometry`, `handGeometry`, `shoeGeometry`), driven by `cast.js`.
   - Shading, hair shape refinement, fabric folds and skin tones are the next step. Keep the bone lengths in `rig.js` → `BODY` and the pose IK intact.
4. **Bike finish.** Materials, chain and cable detail, tire tread, spokes, reflectors. The geometry lives in `bikeGeometry()` / `createBike()`.
5. **Car finish.** Paint and glass materials, wheel detail, softer body transitions (`makeCar()`).
6. **House finish.** Edge softness on eaves and fascia, better trim profiles, porch and door detail, roof material and shingle breakup. The structure is sound: every wall closes and every roof slope faces up.
7. **Vegetation.** Crown shapes and leaf cards (`materials.js` → `leafTexture` / `cardCluster`, `vegetation.js`).
   - The lookout's tall grass is spiky cones (`props.js`, near the end) and wants replacing.
   - Lawns are flat-colored with a wind shader (`ambient.js`).
8. **Props.** Bins, mailboxes, toys, hoop, swing tire, bench: all geometry is in `props.js` and reachable through `world.hooks`.
9. **Menus.** The title, pause, settings, credits, prompt pill and memory-line overlay are functional and plainly styled. Their structural CSS is a marked block at the end of `style.css`.
10. **Ending presentation.**
    - The final fade, the ending card, how the last memory line sits over the fade.
    - The chalk and carving presentation: subtle, never explained.
11. **Overall cohesion.** One art direction across the near street, the side streets and the haze-dissolved far field.

---

## 4. Known technical constraints

- **Performance-sensitive areas:**
  - About 1.43 M world triangles in total: about 1.12 M near (shadowed) and about 0.31 M far (unshadowed). They sit in 845 merged meshes (517 near, 328 far) plus 203 shadow proxies.
  - Per gameplay view in the rendered QA: 58–353 draw calls and about 69 k–588 k submitted triangles, shadows included. For comparison, v0.1 captured 46–470 calls and 89 k–298 k triangles. The QA-only house-inspection cameras reach 438 calls and 647 k triangles.
  - The heaviest views look along the street or down a side street early in the ride. Keep new detail inside the batching (use `K.mat` colors, which merge) and avoid unique materials per object.
  - `glassLit` / `porchLit` are shared on purpose.
- **Simplified distant geometry:**
  - Second-row houses are full houses without interiors.
  - Far-field houses are boxes with bare hip roofs and window quads.
  - Far trees are 2–3 low-poly masses.
  - Mid-LOD side-street houses use plain boxes for trim.
  - All of this relies on the fog. If you thin the fog, check `edge-*` screenshots again.
- **Shadows:** a single 120 m directional shadow frustum follows the player. Distant content does not cast shadows.
- **Browser and engine:**
  - WebGL1/2 via Three.js r160. Chalk and wires are GL lines (1 px on most GPUs).
  - Pointer lock is optional; drag-to-look is the fallback.
  - Headless QA uses SwiftShader, so real-GPU frame rate is not measured here.
  - World build takes about 4.5 s in Node on this machine.
- **The player's head is shadow-only** (layer 1). QA cameras placed outside the player (portraits, sequences) therefore show a headless rider. The in-game camera never can.
- **Not rideable by design:** lawns, planting strips and the side streets beyond their junction mouths.
- **Audio:** unchanged except a master volume setting. The perceptual listening review noted in v0.1 is still outstanding.

---

## 5. Remaining visual limitations noticed during QA

These are intentionally left for the art pass, not structural bugs:

- The lookout field's tall grass reads as spiky cones.
- The tire swing reads as a black torus at night.
- Chalk strokes are thin lines. The crouch view frames "JSA" well, but the lines are hairlines.
- The prompt pill and memory lines are legible but plain; the prompt has low contrast on bright asphalt.
- The asphalt patches are subtle darker quads. Keep or replace them with a proper patch texture.
- Side-street asphalt can read a touch darker than Oak Hollow in low sun. Check the side-road normals and material together with the asphalt retune.

---

## 6. QA material

- `docs/qa/*.jpg`: 1440 × 900 rendered frames from `npm run test:browser`:
  - title, settings, credits, pause, prompts
  - the ride and all three departures, with **entry views** (`house-01-jamie-entry`, `house-02-sam-garage-open`, `house-03-alex-entry`) and **sequences** (`seq-*`)
  - **world-edge** views (`edge-*`: looking back at the start, 90° left and right, through gaps, behind yards, down both side streets, late left and right, the lookout field)
  - **body** views (`body-*`: looking down while riding, steering, braking, pushing hard, stopped, getting off, getting back on)
  - **friends** and **character** close-ups
  - **house QA** (`house-q*`: several house types from the front corner, the side and the back corner)
  - **sidewalk riding**
  - the end-of-street interactions, the carving, the other bike, the final fade, the ending
- `docs/qa/browser-report.json`: every check and each frame's draw calls and triangles.
- `docs/qa/simulation-report.json`: output of `npm test`, with metrics.
- `docs/TEST_REPORT.md`: summary of results.
