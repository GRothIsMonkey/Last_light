# Last Light — Chapter Five: gameplay and story repair

Branch `claude/chapter5-gameplay-story-repair`, created from `claude/chapter5-pine-ridge` at
`cafc27f7f6ffd9ce8229b3a1cb7075680c332be8` (descends from Chapter Four `c9647772642c0bbb5478bdb04bf36592fcc74919`).
Linear history, no rebase, squash or force-push; Chapters 0–4 and their release branches untouched.

This is the record of the major structural repair that followed the human playtest of the first Chapter Five draft
(36 complaints, listed in the repair brief). It says what was wrong in the code (Stage A), what was rebuilt and how
(Stages B–G), how it was checked (Stage H), and what is still provisional. It is not an approval: the chapter waits on
human review.

## Stage A — root causes found in the code

| Playtest complaint | Cause in the code |
|---|---|
| Friends pace while the player stands still | `companions.js` `followWalk`: the target slot is placed relative to the player's *view heading* (`pl.a`), so turning the mouse swings both targets round the player; the slot index also changes every 11 s even at rest (`Math.floor(clock/11)%4`); start/stop thresholds (0.65 m vs 1.1/1.3 m) overlap, so near the goal they start and stop. |
| Friends copy the player's acceleration and stopping | `followRide`: target speed `vT = pv + gap*.5` uses the player's *current* speed with no reaction time; on foot `followWalk` uses `pl.speed + .3`. Both friends react in the same frame. |
| Friends wait for the player to do trivial things | Chapter Five's `match()` only starts mounting when the player is already riding (`want==='ride'`), and the garage's departure waits on the player's bike. |
| Sam's feet sink into the garage floor | `houses.js` `buildGarage`: the foundation box (`y -.05, h .86`) tops out at +0.38 m inside a friend's open garage, hiding the real concrete floor at +0.21 m; walking height (the garage pad) is +0.20 m. Everyone in a friend's garage stood 18 cm "in" the visible floor. |
| Packing is described, not done | `chapter5.js` `pack()`: one F press, then captions name the supplies; no supply props exist. |
| Jamie's sock is invisible / no backpack | The backpack is a prop that appears on the driveway when Jamie speaks (`openBag`); the sock is two boxes on top of it; Jamie never wears or opens it. |
| The yellow gate (and the camp gate) can be walked through | `pine-plan.js`: "The camp's gate leaves and the swing gate are drawn by the builder; the way through is open." Only the posts are solids. |
| Shoreline is a hard wall | `pine-plan.js`: every cell with signed shore distance < −0.35 m is `water` (not walkable); the bed drops 0.55 m within 2.5 m. |
| Skipping stones is not a game | `throwYours()`: F computes a skip count from view pitch and a random number; a stone mesh appears at the hand; friends' counts are fixed arrays. No pickup, no throw, no physics. |
| Dock sitting looks wrong | `sitDock()` only lowers the camera (`pose()`); the first-person body uses the crouch-to-look pose; friends use `sitGesture` (root lowered, feet pulled back) — legs never hang over the edge. |
| Looking down at your body is bad | `on-foot.js`: the camera sits at the head's centre over the body's root, so looking down looks out from inside the neck at the top of the torso; a scripted pose always uses the crouch body. |
| Daytime flashlight "doesn't work" | `updateBatteries()`: the first time the flashlight is switched on anywhere in the camp it dies. In daylight that reads as "the flashlight does not work". |
| Camera has no hands or shutter | `alex-camera.js` hangs the camera model on the view; `photograph()` plays a click; no flash light exists in Chapter Five. |
| No expressions; mouths do not move | `rig.js` `headGeometry` merges the mouth and brows into the head mesh; the kids have no talk animation (adults do, `adult-art.js`). |
| Three-hour campfire | `toFire()` → `C.lapse` jumps the clock from ~4 PM to 6:53 PM over nine seconds. |
| "Yellow orbs" for flashlights | `chapter5-presence.js` carried lights are a sphere and a halo sphere with a point light. |
| "Three people are walking into the camp!" at 90 m | Dialogue names people the player cannot see; lights alone are visible. |
| RUN without a perceived threat | `wake()` → "RUN." after the double is seen; nothing approaches the boys. |
| Shirt vanishes | `owlNext()`: `shirt.visible=false` on a caption. |

## Stage B — Jamie and Sam as people (`dist/companion-brain.js`)

A goal-based mind on top of the existing step system (`companions.js` keeps the steps and the riding; the brain decides
what a friend is doing while he is free to choose):

- **Goals**: `idle`, `follow`, `lead`, `wait`, `inspect`, `aside`, each with hysteresis (a goal has to stop making sense
  for a while before it changes; a test counts flip-flops).
- **Where he stands** is scored from where you are and the way you have been *walking* (your trail), never from where you
  look, so turning the mouse no longer swings anyone round. Personal space per mood (relaxed 1.55 m … escape 1.0 m);
  two friends never settle on the same spot; walked into, he steps aside once.
- **Reaction**: he notices you have gone after his own reaction time (Jamie 0.35–0.85 s, Sam 0.65–1.25 s, scaled by
  mood), sees your speed as it was a moment ago (`seenSpeed`), and accelerates and brakes at his own rates. On the bike:
  delayed perceived speed, his own braking (1.5–2.3 s to stop), and a lag that wanders.
- **Personalities** (`PERSON`): Jamie leads, is curious sooner and about different things (water, climbing, odd things);
  Sam hangs back, reads signs, maps and records, carries the supplies; different walking and running speeds, different
  gestures.
- **Moods** per scene (`relaxed`, `explore`, `tense`, `danger`, `escape`) set distances, reaction scale and whether he
  wanders off to look at places of interest (`dist/chapter5-places.js`: the park, the old lot, the road, the camp).
- **Navigation recovery**: no progress for 2.2 s → a fresh path, then a different way round (counted).
- **Bikes**: Jamie and Sam walk to their own bikes, kick the stand up, get on with the mounting animation and ride to the
  end of the driveway by themselves, one after the other, and wait there.

## Stage C — things handled for real (`dist/physical.js`, `dist/chapter5-garage.js`, `dist/faces.js`)

- **Props and hands**: every supply is a prop with a grip; people reach for things (bending for low ones), make contact,
  carry, store into a container's mouth, hand over, hold out. Your own hands do the same in first person (`playerReach`,
  with the lean and dip a short person needs).
- **The garage**: the table of supplies (three flashlights, two battery packs, three waters, the camera, the county map,
  granola bars). You pack by hand (F on a thing, F on the bag); Sam packs the rest himself, claims what he reaches for,
  never teleports anything. Sam closes and shoulders his bag, then holds Alex's camera out; you take it.
- **Sam's feet** stand on the floor: a friend's open garage's foundation box had topped out 0.18 m above the concrete.
- **Jamie's sock**: he arrives wearing his backpack, swings it round, opens it, reaches in, pulls out one sock, holds it
  up; Sam's look; the sock goes back, the granola bars from Sam's hand go in after it, the bag goes back on.
- **Why Pine Ridge**: Sam opens the county map on the table, points at the town, Mill Street, the Old Reservoir Road, the
  ridge, the reservoir and the recreation area (his pencil line), and says it; the plan (“We stay together. We look.
  We're back before dark.”); the map folded into his back pocket.
- **Looking down**: the eye now sits forward of the neck and turns about it; the body moves back under it; the stance
  relaxes; looking down you see your chest, arms, legs and feet, not the inside of your shirt.
- **Faces** (provisional, see below): dynamic mouth and brows on each kid's head, expression presets (19), blinking,
  and dialogue-driven mouth shapes timed from the line's text; lines carry `face:` cues where the moment calls for one.

## Stage D — the beach and the dock (`dist/chapter5-park.js`)

- **Stones**: 22 flat stones on the shore. F picks one up with your hand (you bend for it); hold F to wind up (low, back
  past the right hip, out of view), let go to throw (the hand comes round at waist height, the stone leaves it). Crouch
  (C) to throw lower and flatter. Physics: a real arc; a touch on the water skips while it comes in under ~24°, fast and
  spinning, losing speed by how steep it came in; it sinks with a ring and a splash. Jamie and Sam walk to their own
  stones, bend for them, and throw with their own arm; their throws are chosen (by simulating candidate throws) to do
  what the scene wants (Jamie 3, 4, 2; Sam a plunk, 2, and a crouched 6), and what they say is what their stone did.
  A stone left in your hand is set down when you do something else or walk away.
- **Shallows**: the shore's wade zones are walkable water (slower, rings at each step) instead of a hard wall.
- **The dock**: all three sit on the end, legs over the water (a seated first-person body; friends lower onto the edge).

## Stage E — gates, gear, inventory, the shirt (`dist/chapter5-gates.js`, `dist/chapter5-gear.js`, `dist/inventory.js`)

- **Gates** (`pine-plan.js` `GATES`, `gateAt`): the yellow arm and both camp-gate leaves block where they are *drawn*
  (the builder turns them and writes the angle back each frame), so a gate blocks as it swings shut and lets you by
  only once it is clear. Boulders either side of the yellow gate's posts make the road the way through. F at the latch
  opens it; if you don't, Jamie walks up, lifts the latch and walks the arm round on its post (he never repeats it if you
  did). Camp buildings' doors also block until they have visibly swung open.
- **Flashlight**: works by day and by night; its state is only whether you have it, whether it is in your hand (out of
  your pocket with a hand transition, put away the same way), whether it is switched on, and the batteries. Sam hands
  out the flashlights at the camp gate from his bag (you take yours with F; Jamie takes his from Sam's hand).
- **The batteries**: the light dies once, on, in the dark inside a cabin, with a flicker; Sam says “Hang on”, walks over,
  swings his bag round, gets out one of the battery packs packed that morning and holds it out; you take it (F) and
  your hands change them; the light comes back on.
- **Photographs**: V in a look view raises the camera into your hands at arm's length, its screen showing what it sees;
  a fingertip goes down on the shutter; the picture is rendered at that instant (without your hands in it); the flash is
  the flashlight's wide spill borrowed for a moment (no new light: the scene's light count never changes), bright in the
  dark and faint by day; the picture appears on the camera's screen; the camera comes down.
- **Inventory** (I, or Tab; a BAG button on touch screens): a small panel, the walk held while open. *With you*: Alex's
  camera, the flashlight (take out / put away). *Found*: Alex's pictures (and how many you took today), the county map
  (in Sam's pocket), the register, the search map, the pantry, Alex's shirt (in Sam's bag), Jamie's sock. It is derived
  from the chapter's state, so Continue, checkpoints and DEV starts rebuild it without duplicates.
- **Alex's shirt**: Sam walks to the wall, reaches up, takes it off its nail, gathers it in both hands, swings his bag
  round, opens it, puts it in, closes it, and puts it back on. From then on it is in his bag (DEV starts too).

## Stage F — a coherent afternoon

- **Clock**: out of the garage at about 3:37 PM, Pine Ridge by about 4:20, the camp before 6, the fire at about a quarter
  to seven, Owl at half past seven, dark a little after eight. Time runs at its own pace (four times real time by day);
  where a beat needs a minimum hour, the clock catches up a minute per second on a walk, never jumps hours.
- **The campfire** is a short rest (about a minute of talk, two to four minutes in all): Sam gets a water bottle out of his
  bag, drinks, passes it to Jamie; the conversation; “We should keep going. It's almost seven.”; Owl, then the bikes.
  No lapse. The picture none of them took is taken (from the trees) during the rest, stamped with the time it was taken,
  and Sam reads that time aloud at the end (“The camera was in your pocket. The whole time.”).
- **Investigation chain**: the photograph and the county map (why Pine Ridge) → the old sign matches the picture (where)
  → the trail map and the road to the camp (why the camp) → the 1991 register and search map (what happened here; two
  bike tracks, grid seven, the pump house) → the pantry (somebody recently) → the shirt and the fresh carving with its
  arrow toward the pump house (Alex, and where) → the light in the trees going that way.

## Stage G — the night, earned

- **No orbs**: carried lights are flashlights (a dark body, a lens, a narrow beam that fades along its length, and a spot
  light making a pool on the ground and catching trunks), aimed down the path ahead and swinging with each step.
- **The first light** (20–40 m off, in the trees toward the pump house): curiosity and ordinary explanations (“Somebody
  fishing. Or a ranger.” “ALEX? Is that you?” “Hello?”); it stops, its beam comes round onto the three of them, it goes
  out. “A ranger would have said something.” They decide to go back to the bikes — not RUN.
- **Three lights**, the length of the camp away (about 100 m): “There's a light. At the gate.” “Two.” “Three.” — lights,
  never people. A search party? They walk where the boys walked, in order: the office (“So? It's the first building.”),
  then the map board, where they stop (“Where we stood.”). Jamie: flash your light at them. **One of them copies your
  flashlight** (off when yours goes off, on when it comes on; Jamie does it if you don't). “It's doing what you do.
  Exactly what you do.” They go on to the fire and **sit where the boys sat**. The creature from the drain watches them
  and runs from them. They get up, turn their beams on the boys, and go out together. They never let you close.
- **The double**: real Jamie beside you on Owl's porch; Owl's lamp on; the double standing where the shirt hung, clear of
  the door. It turns its head to look at Jamie. “…That's my hat.” “That's me.” “Jamie. Look at me.” Then **it comes
  out**: through the door, across the porch, toward the three of you, at a walk, smiling with Jamie's face. “Back up.
  Back UP.” Only when it is close does every light in the camp come on, and Sam says RUN. It is gone when you look back.
- **The escape**: the friends in escape mood keep with you and lead toward the gate; at the camp gate both leaves slam
  shut in front of you; Sam gets there and shoves the leaf open (or you do, F), holds it, and the three of you go through;
  behind you every light in the camp goes out at once. The dam route keeps the bell.

## Fallbacks: hints before recovery

Evidence is never found for you: the photo match, the camp's records/pantry/cabins, the shirt and carving, and the last
picture only ever get progressive hints (dialogue, then a plainer objective, then a friend standing at the place), and
the photo match gets easier to line up after four minutes. Getting somewhere (the map, the gate, the road, Owl, the
porch, the walk back) is pulled along by the boys and only after a long while (a lost walk) does a fade carry you on.
Optional moments (stones, the dock) move on with a line. The idle test checks all three kinds.

## Provisional, and handed to the Astra pass

- Mouth animation is text-timed visemes; `faces.js` exposes `speakAudio(env, rate)` for audio-driven lip sync once
  voice recordings exist. Expressions use simple dynamic geometry on the existing heads.
- Props (supplies, the camera, the shirt) are simple procedural models; the shirt folds by scaling, not cloth.
- Beams are additive cones; no volumetrics. Placeholder sounds.
- See `docs/CHAPTER5_ASTRA_PREP_HANDOFF.md` and `docs/TEST_REPORT.md`.
