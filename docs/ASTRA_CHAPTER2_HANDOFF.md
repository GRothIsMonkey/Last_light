# Last Light — Chapter Two structural handoff (for Astra)

This is the structural/gameplay pass for Chapter Two. It is **not** an art pass. Everything here works,
is tested and is deliberately plain where art direction belongs to Astra.

## Source

| | |
|---|---|
| Input branch | `codex/astra-chapter1-final-polish` (not modified) |
| Input SHA | `9c4b57698efeb7137de8a292b7662dac97a9a2d0` |
| Chapter Two branch | `claude/optimistic-tesla-obxiv5` (the session's assigned branch; the brief's preferred name was `claude/last-light-chapter-2`) |
| History | Linear on top of the input SHA; no rebase, no merge to `main`, Chapter One release history untouched |

Run it like Chapter One: serve `dist/` over HTTP. `?qa` exposes `window.lastLight`; `?qa&jump=<section>` (or
`lastLight.jump(section)`) starts at any QA section listed below.

## 1. Human-playtest bug fixes (Chapter One release)

All four have regression checks in `tests/playtest-fixes.mjs` (run from `tests/verify.mjs`) and captures
in the browser suite.

| Bug | Root cause | Fix |
|---|---|---|
| **Friend-bedroom fan audio glitch** (Sam's window) | The voice-through-a-wall "chatter" used `sin(clock × rate(clock))`; its real frequency grows with the clock, so after a few minutes it stuttered and buzzed. Pan also flipped sign when standing at the window. | Syllable phase is accumulated (`ph += dt × rate`); a dedicated steady `fan` loop (air + 118 Hz hum + slow swell); near-field pan scaling; loops fade over 20 ms on reset instead of cutting. Checked at 5 s, 15 min and 1 h of simulated time with a recording fake AudioContext. |
| **Backwards/upside-down porch flag** | Canton drawn at the bottom of the texture; cloth rotated so it flew toward the house and inverted. | Canton at the top by the hoist; cloth and tip rotated so it flies away from the pole, upright. |
| **Backwards basketball hoop** | The curbside portable hoop faced along the curb with its back to the street. | Rotated to face the street, pole behind the board; Sam's hoop given wall brackets. Every hoop records its board/rim/mount in `world.hoops` and the test checks all of them (1 curbside, 12 garage). The list is now created before houses are built; `buildHouse` works on a shallow copy of the world object, so garage hoops had been recorded into a throwaway array. |
| **Companions not following at the old oak on the first attempt** (critical) | Jamie and Sam, stopped about 1.2 m apart, each turned in place and fell inside the other's "something ahead" cone. With nothing to go, they also stopped turning, and each waited for the other indefinitely. A second attempt worked only because riding back switched them to a slot that ignored the cone. | The friend further along the ridden trail goes first (`yieldsTo`). A held-up friend keeps walking the bike round toward the way on. A stall watchdog walks a stuck friend out. Friends shuffle aside when you push into them, and they change sides behind you, not across your front wheel. When you turn your bike round while stopped, they turn theirs round too, by your side. No teleporting. |

Oak verification:

* **Deterministic checks:**
  * the captured failing configuration, turning left and right
  * leaving straight after the talk
  * waiting first, then leaving
  * remounting before the talk ends
  * a wide turn through the cul-de-sac
  * Continue from the `oak` and `retrace` checkpoints
  * after Start over
* **Randomized sweep:** 120 trials (seeds 5, 11, 23, 42) with randomized wait, stop position, leaving style, linger and line. Result: 0 stuck; every friend sets off within 2.8 s.

## 2. Chapter Two state machine

Chapter Two lives in `dist/chapter2.js` (`createChapter2(options, chapter1.kit)`). Chapter One
(`dist/chapter1.js`) keeps running the shared systems: dialogue queue, objectives, cast, cars,
companions, flashlights and checkpoints. It hands over every phase whose name starts with `c2-` or
`m-` (`api.next.owns(phase)`).

| Phase | What happens | Leaves when |
|---|---|---|
| `c2-black` | The Chapter One fade holds black. A quiet **CHAPTER TWO** card (`#chapter-card`) appears, then "You guys heard that too, right?" / "Yeah." over black, and a fade back to the same creek moments later. | fade done |
| `c2-decide` | Sam wants the cops; "And tell them what? We heard a bike bell?"; "His reflector's here."; "Just a little farther." Checkpoint `chapter2-start`. | dialogue |
| `c2-follow` | Objective **Follow the sound.** Friends switch to `follow:'search'`. If you dawdle for 24 s, Jamie says "Through the fence. Come on." | you are 1.4 m inside the gap |
| `c2-easement` | **Search beyond the fence.** → **Check the drainage path.** Points of interest: Jamie bends to the tire mark, Sam to the weeds, Jamie to the scrape. One line each, only when nobody is talking. | the bike is within 4.2 m, or in view within 11 m |
| `c2-bike` | "Guys." **Look at the bicycle.** F: Look closer (or the inspection happens on its own after 16 s). Checkpoint `bike-found`. | F |
| `c2-bell` | Pose camera down at the empty reflector clip; Jamie's light on it. "That's his bike." / "The back reflector's broken off." / "Where is he?" / "Alex?" Silence, then the bell twice from deep in the culvert. The camera eases up toward the mouth. "Nope." / "That wasn't his bike." | timed |
| `c2-police` | An officer comes in through the gap behind them: "Hey!" / "Kids! Stop right there." He walks up to you wherever you are. "It's Alex's." / "What?" / "His bike." He radios it in. Checkpoint `police-arrival`. | dialogue |
| `c2-search` | **Step back for the police.** Tape goes up, a second officer and two neighbors arrive with lights, then Alex's dad. "We heard a bell. In there." / "Okay." / "You three need to go home." Coming within 2.2 m of the bike gets "Back. Now." | dialogue |
| `c2-home` | **Go home.** "Oak. Tomorrow morning." / "Seriously?" / "Nine." | you walk 13 m away or leave the easement (or 40 s pass) |
| `c2-dawn` | Fade to black; **August 22, 2011** card. | timed |
| `m-home` | Bright morning near your house, bike beside you. **Meet Jamie and Sam at the oak.** Checkpoint `morning`. | you reach the cul-de-sac within 19 m of Jamie |
| (oak talk) | Old-bike disagreement, "What if he heard the bell?", "Come on. Briarwood." Checkpoint `morning-oak`. | dialogue |
| `m-briarwood` | **Return to Briarwood.** Friends ride with you. At the corner: "This is where he turned." **Remember Alex leaving.** F: Remember, on foot or from the saddle. | F |
| `m-memory` | The memory plays (see §8). Checkpoint `briarwood-memory`. | memory done |
| `m-after` | "Sam was right." / "He stopped." / "He was looking toward the creek." / "And earlier he asked if we heard something." / "He heard it before he left." They look down Briarwood; fade. Checkpoint `chapter2-end`. | timed |
| `m-end` | End card **LAST LIGHT / Chapter Two**, August 22, 2011. No "to be continued". | — |

Lighting reads `chapter.night`, `chapter.deep` and `chapter.day` (`DEEP` gives the per-phase values).
`game.js` blends in the morning sky through a `day` sky uniform, plus fog, hemisphere and sun color,
a higher sun position and shadows.

## 3. The new environment: the drainage easement (`dist/easement.js`)

The easement lies behind the creek strip's back fence. Its gap (widened to about 1.85 m in
`creek.js`) is where Chapter One's "dark beyond the fence gap" already was.

* **Its own frame.** Briarwood's side frame is degenerate past the creek: its curvature center is
  about `v = 50`. `easementFrame(W)` therefore defines a straight local frame, with `s` running
  along the corridor from the gap and `t` across it. All layout is in `EASEMENT` (`dist/layout.js`):
  gap, turn, channel profile, path offset, culvert size, hill, evidence and bike positions, and the
  bell depth.
* **Ground.** One height grid serves both the rendered ground patch and walking. The concrete V
  channel is a dense lining sampled from the same heights, with no grass cells under it. There is a
  trickle of water, an outfall headwall and a dirt path on the left bank.
* **The culvert.** A concrete box set into a wooded rise, with:
  * a headwall, cap and wingwalls
  * a dark interior with a back plane
  * standing water and storm debris
  * a separate ground cap over the tunnel, so no ground pokes through the opening
* **Surroundings.** A power line overhead, about 420 weed tufts, brush lines along the walkable
  corridor and 16 trees.
* **Holes in the older ground.** Lawns, far land, creek woods and far trees skip cells inside the
  easement's footprint (`streets.js`, `background.js`, `creek.js`).
* **Navigation** (`nav.js`). `locate()` returns `street:'easement'` with `s`/`t`, and `groundY` /
  `walkable` / `surface` delegate to `easementNav`.
  * Walkable: the path, the banks and the channel slopes.
  * The culvert is walkable only about a step inside its mouth (it is not explorable).
  * Bikes stay on the street side of the fence.
* **Evidence.** All marks drape onto the terrain, with named meshes `evidence-tire-mark`,
  `evidence-flattened-weeds` and `evidence-scrape`:
  * mud (s 9.2): a puddle of mud with one narrow tire track and its tread
  * weeds (s 17): a waist-high band with one lane pressed flat toward the channel
  * scrape (s 25.8): pale scratches and rubber marks down the concrete lip, a torn-dirt smear, a few clods
  * Nothing implies injury: no blood, no body.

## 4. Alex's bicycle and the reflector

The found bike is built from `CAST.alex.bike` itself: same frame, green, rack, bell, grips, tyres
and proportions. The only change is the `rear-reflector-broken` extra in `rig.js`: a bent bracket,
black tape still round it, and a jagged red sliver of the lens left in the clip. A little mud sits on
the tyres and frame.

* **Reflector continuity.** The reflector's size and red are now one constant, `REFLECTOR`
  (r 0.049 m, `0x8a1a14`), used by both the prologue bike and the broken clip. The Chapter One
  creek piece (same red) fits inside that lens. Previously the piece was wider than the whole
  reflector and a different red.
* **Placement.** The bike lies on its side in the grass at the top of the bank beside the culvert.
  It is lifted so its lowest point (pedal and bar end) rests on the ground.
* **Blocking.** Three blockers along its length keep people from walking through it.

## 5. The second bell

`secondBell()` plays the ordinary bell twice through `audio.bell(pos, 1.5, {tunnel:true})`. With
`tunnel` on, it goes through a 2.9 kHz low-pass and two short echoes (0.09 s and 0.21 s).

* **Position.** `EASEMENT.bell.s = 52`, about 19 m inside the culvert and 20 m or more from the bike.
  The bike's bell is not animated.
* **Reaction.** Everyone freezes and turns to the mouth, the lights snap round, and Sam steps in.

## 6. Police and search systems

These reuse Chapter One's actors: `officer`, `officer2`, `dad`, cruisers, `createActor`, `walkPath`
and the conversational-spot helper. Chapter Two adds:

* **Volunteers.** Five people (`ADULTS.vol1`–`vol5` in `people.js`) who walk search loops at night
  and fill in the morning.
* **Flashlights.** Visible beam cones for Sam, the second officer and two volunteers. Jamie's,
  officer2's and the player's are real lights.
* **Tape.** Yellow tape on four stakes around the bike, across the end of the path.
* **The officer's walk.** He walks to wherever you are. If you walk away while he is coming, he
  re-plans.
* **Grown-ups don't take it seriously.** "We heard a bell. In there." gets "Okay." — on purpose.

## 7. The morning

Reached through `morningWorld()`:

* **Lighting and world modes.** Night rendering is off (sun shadows back, police lights detached).
  `ambient.morning(true)` hides the hoop kid and keeps the street lamps off. The audio gets birds and
  no katydids.
* **The street.**
  * a cruiser by the Briarwood corner and one at Alex's house, no lights
  * officers on the radio
  * two volunteers walking the street
  * one pinning a flyer to a pole
  * neighbors talking on a lawn
  * an officer checking yards
  * missing-person flyers on five poles and the lookout's fence post (canvas texture)
* **No supernatural changes.** The world's merged meshes are identical to the night; a test checks
  their visibility list. There is no school: the dialogue never mentions it.
* **Start.** By your house, the bike beside you, Jamie and Sam already at the oak.

**Old-bike logic.** The old bike at the lookout (`ending.otherBike`) only appears in the evening
prologue, when you look away from it; at night it goes when you look away. In the morning it is
simply not there (checked). The disagreement is dialogue only, and the camera glances at where it
was. Nothing explains it.

## 8. Memory system (`dist/memory.js`)

Memories are data in `MEMORIES`. Each one sets:

* `from`, `to`, `lat`: where the remembered ride starts and stops, and its line across the street
* `speed`: the remembered pace as distance/speed keys, slowing where it matters
* `lines`: pieces of dialogue, some trailing off
* `watch`: who the eyes go back to
* `detail`: the remembered difference (a `friends.js` hook)
* `lookAt`: where the detail looks
* `focus`: a gentle narrowing of the field of view during the detail
* `look`: how far you can turn your head
* `until`: when the memory is over
* `max`: a time cap

`createMemory(host)` runs the timeline: a warm fade out, enter, play, a warm fade back, leave, then
`chapter2.memoryDone()`.

The host in `game.js` does the work:

* **The ride.** It enters state `memory` and runs the evening's own prologue ride code: bike, body,
  eye, prologue light at that distance, audio through a low-pass. The pace comes from the memory,
  not the keys. You can look around within the memory's limits, with Q/E or the mouse.
* **The cast.** A separate, lazily built `createFriends()` copy with a stubbed world (doors, garages
  and Alex's window can't be touched), so the present cast is never disturbed.
* **The present.** `chapter2.presentVisible(false/true)` hides and restores the present scene. You
  come back exactly where you were, on foot or on the bike; the present friends never move (tested).

`alex-turns`, the only memory, uses `hooks.detail='alex-glance'` in `friends.js`. This code is
inactive in the prologue's own instance. On his turn into Briarwood, Alex all but stops for 3.4 s
with his head turned about 50° (`|look|` ≈ 0.9 rad) toward the creek woods behind the yards. That is
the easement, the creek's continuation, where the bell and his bike were; the creek crossing itself
is dead ahead down his street, so it is not used. Then he looks back, waves, rings and rides on, as
in the prologue. A body-class `remembering` adds a soft warm CSS filter. There are no glitch effects.

## 9. QA jumps and checkpoints

**QA jumps:** `chapter2-start`, `easement`, `alex-bike`, `second-bell`, `police-find`, `morning`,
`morning-oak`, `memory-start`, `memory-reconstruction`, `chapter2-end`. All Chapter One jumps still
work.

**Checkpoints** (silent; stored in `localStorage['lastlight.chapter1']`; Continue on the title):

| Checkpoint | Continue label |
|---|---|
| `chapter2-start` | Behind the creek |
| `bike-found` | Alex's bike |
| `police-arrival` | The police |
| `morning` | The next morning |
| `morning-oak` | The oak, morning |
| `briarwood-memory` | Where Alex turned |
| `chapter2-end` | Briarwood, morning |

* Checkpoint names that differ from jump names (`bike-found`, `police-arrival`, `briarwood-memory`)
  are aliases routed to Chapter Two's jump.
* Labels are registered at startup, so Continue shows them after a reload.
* Start over, Back to title and jumps fully reset Chapter Two, including from inside a memory.

## 10. Performance-sensitive systems

| Measure | Value |
|---|---|
| Static world | 1,759,149 triangles in 948 merged meshes (Chapter One: 1,716,635 / 935) |
| Rendered (final SwiftShader captures, 1440 × 900) | Easement at night 0.56–0.74M triangles and 198–345 draw calls, 6–8 active lights; morning street 0.68–0.84M / 363–429, 2 lights; memory 0.73–0.85M / 328–478 |
| Heaviest Chapter Two frame | `c2-11-police-flashlight`, 927k triangles / 579 draw calls (the officer coming down the path, the whole easement in view) |
| Scene instances incl. invisible | 1,888 meshes / 2.28M triangles (Chapter One: 1,587 / 2.01M) |

All of this is well inside the updated guidance. Exact numbers are in `docs/qa/browser-report.json`
(`frames`) and in `docs/TEST_REPORT.md`.

* **The memory cast** adds a second set of three kids, three bikes and Jamie's mom. They are built on
  the first memory (hidden otherwise) and drawn only while remembering.
* **Chapter Two actors** (five volunteers, the found bike, tape, flyers) are hidden unless the
  chapter shows them.
* **Lights.** The flashlight cones are additive meshes, not lights. Only Jamie's, officer2's and the
  player's flashlights are real lights; they detach in daylight.
* **Companion routing** (`companions.js` `routeTo`) runs an A* `nav.walkPath` only when a straight
  line is blocked, and at most every 0.35 s per companion.
* **The easement lining** is dense: about 6k triangles.

## 11. Audio hooks

| Hook | Sound |
|---|---|
| `audio.bell(pos, g, {tunnel})` | the bell from the culvert |
| `audio.memory(on)` | memory low-pass, 1.9 kHz |
| loop `culvert` | low hollow air in the pipe, an occasional echoing drip |
| loop `water` | the channel |
| loop `fan` | Sam's window |
| loop `radio` | the officers' radios, `radio-am` in the morning |
| `audio.update({morning})` | birds by day; katydids only on the night |
| `sfx('squelch')` | radio squelch |

**Listening limitation:** these were checked as signals only: finite, unclipped, loop continuity,
pan over time, trigger timing and filter/delay graph, plus recorded clips in `docs/qa/audio/`. No
perceptual listening has been done; that is left for a person.

## 12. Known rough visuals

* The culvert headwall and wingwalls are plain dark boxes; the opening reads as a black rectangle at
  night.
* The weeds are flat-shaded blades; the flattened lane reads by color more than shape.
* The tire track's tread is a regular ladder.
* The tape is flat planes.
* The flyer photo is a grey placeholder silhouette.
* The broken-reflector close-up depends on Jamie's light; the rack plate reads very pale under it.
* Morning lighting is a first pass: flat-ish greens and a strong blue sky.
* The memory's warm look is only a CSS filter plus the evening's own light.
* Evidence and the bike are visible in daylight only through jumps; in play the bike is gone by
  morning.

## 13. Known animation limitations

* Adults' idle poses are stiff. Neighbors face each other only roughly. Gestures are layered arm
  poses.
* Jamie and Sam "bend to look" with a simple crouch-and-lean pose. Hands go down, but they don't pick
  anything up.
* Riding companions walk their bikes round at a fixed rate. In the captured oak configuration Sam
  sets off at about 4 s; in natural play it is 1.5–2.8 s.
* Alex's "stop" in the memory is a 0.3 m/s roll, not a foot down. His head turn is the only body
  language.
* The officer's flashlight beam sweeps on a sine; it does not aim at the kids.

## 14. What Astra should polish

* culvert and drainage realism (concrete wear, water, the headwall, scale)
* night flashlight composition in the easement
* Alex's bicycle damage and detail
* bell presentation (the moment, the camera, the sound)
* police search lighting
* Alex's dad's reaction
* morning lighting
* search volunteers
* flyers and props
* the memory-reconstruction presentation
* companion animation
* NPC body language
* materials
* vegetation
* audio mix (human listening)
* visual verification of the bug fixes (flag, hoops) across the street

## 15. Files

| | Files |
|---|---|
| New | `dist/chapter2.js`, `dist/easement.js`, `dist/memory.js`, `tests/chapter2-sim.mjs`, `tests/chapter2-browser.mjs`, `tests/playtest-fixes.mjs`, this file |
| Changed | `dist/game.js` (Chapter Two wiring, morning light, memory host, riding spots), `dist/chapter1.js` (hand-over hooks, kit), `dist/companions.js` (oak fix, search mode, routing), `dist/friends.js` (memory detail hook), `dist/audio.js`, `dist/ambient.js`, `dist/props.js`, `dist/houses.js`, `dist/world.js`, `dist/layout.js`, `dist/nav.js`, `dist/streets.js`, `dist/background.js`, `dist/creek.js`, `dist/rig.js`, `dist/people.js`, `dist/index.html`, `dist/style.css`, tests |

Scope stops at the Briarwood realization. There is no tunnel exploration, no explanation of the bell,
Alex or the old bike, and no Chapter Three.
