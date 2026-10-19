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

## Review round: code review, visual inspection, and Chapters Zero to Four

After stages A–G, two independent reviews were run over the repair: a code review of the diff by area (companions, hands
and props, gates and gear, the night and the story, scene jumps, regressions in Chapters 0–4), and a frame-by-frame
inspection of the 22 review scenes. What they found and what was done:

- **Chapters 0–4 had changed** through shared code (garages walkable in every chapter, the garage footing lowered, the
  first-person stance and look-down eye, the deeper look-down limit, the new faces with moving mouths). All of it is now
  switched on by Chapter Five only (`foot.fpBody`, `face.enable`, `nav` garage rooms tied to `setPine`, `slabs()`), so the
  earlier chapters look and play as accepted; the full regression covers them.
- **Hands and props:** make-way no longer cancels a friend's scripted action (the stones game could stall, a bag stay in a
  hand); one counted throw per turn and nothing after the game ends; a single press throws (the touch button);
  the garage reset frees the granola bars and the sock; Sam comes to an arm's length before handing over the camera,
  the flashlight or the batteries, and the take ranges are an arm's length; backpacks are worn at the back, not the head.
- **Gates and gear:** Tab no longer moves browser focus (Enter could reload the page); Escape, the pause and the end close
  the bag; the yellow arm stops against a player standing in its way instead of trapping them, and Jamie walks it at a
  pace he can keep; the flashlight comes out on after the new batteries; the beam is off during a picture; wading only
  where the bed is under water; the shutter finger is on the shutter and the screen shows the picture taken.
- **The night:** the carried beam cone faced backwards (fixed earlier), now fades along its length and when pointed at
  you; the three lights walk round the office, not through it, and each reaches its own log; "they sit where we sat"
  needs them there; Jamie's demonstration is one blink and he repeats it only if nobody does; the double comes out of the
  door toward you before every light comes on; the camp-gate clock catches up instead of jumping 40 minutes.
- **The campfire:** the water bottle crossed seven metres of fire in one frame; Sam now walks it round inside the logs to
  Jamie, who sets it down by his log after a drink. The campfire checkpoint starts the call to the fire.
- **Companions:** kick-up no longer jumps the body 0.43 m twice; the rise starts from the sit; the dock fallback rises at
  once from the seat; reset clears the seated state; lead lasts 6–12 s; looks last their time and stay near you; intent is
  dropped after a scripted scene; pace changes once wanted; a step off the bike is not a heading; a look-at spot is clear of
  the other friend; make-way never steps a friend onto the other.
- **Scene jumps** start with doors and gates where the scene wants them instead of swinging there.
- **Tests:** companion test G now opens the office door and checks you were inside.

## Repair report: each playtest complaint

"Fixed" means fixed in the simulation and the review frames, pending the human playtest. Tests named here are in
`tests/chapter5-sim.mjs` (the full play), `tests/chapter5-companions.mjs` (A–H) and the review scripts in `tests/review/`.

| # | Complaint | Cause | What changed, and where | How tested | Fixed? | For Astra / human review |
|---|---|---|---|---|---|---|
| 1 | Sam's packing doesn't match what he says | `pack()` was one F press and captions | Sam packs each supply by hand: reach, grip, lift, into the open bag (`chapter5-garage.js`, `physical.js` `reach`/`prop`/`container`); lines follow what is in his hand | sim garage checks (each item stored, by whom); review `garage` frames | Yes | Finger grips, a soft bag model |
| 2 | The player can't help pack | No interaction | F picks a supply up and F on the bag puts it in; Sam packs the rest | sim "you pack" check; frames g03–g06 | Yes | First-person hand model |
| 3 | Sam's feet sink into the floor | Garage footing top at +0.38 m | Footing lowered to the slab (Chapter Five only, `slabs()`); feet grounded by `comp.feet` | frames smoke-01/02, g01 | Yes | Contact shadows |
| 4 | Jamie's sock and backpack aren't real | Bag appeared on the driveway; sock was two boxes | Jamie arrives wearing his bag, swings it off, opens it, pulls the sock out; the bag goes back on (`sockScene`) | sim sock check; garage frames g12–g16 | Yes | Cloth sock, bag straps |
| 5 | Friends are followers | Slot following on the view heading | Goal-based minds (`companion-brain.js`): idle, look, aside, follow, lead, wait; each with his own spot | companions A, D, F | Yes | Idle variety, acting |
| 6 | They wait for you to do trivial things | Mounting only when you rode | They go to their own bikes and get on by themselves | companions E | Yes | Mount animation |
| 7 | Acceleration and stopping copy yours | `vT = pv + gap*.5` | Seen-speed with reaction delays, own acceleration (`seenSpeed`, `PERSON`) | companions B, C | Yes | — |
| 8 | Pacing, collisions, crowding | Spot re-chosen every frame; no personal space | Personal space, settle rule, make-way, look-at spots clear of others | companions A, F, G, H | Yes | — |
| 9 | Why Pine Ridge isn't clear | Told in captions | Sam's county map in the garage; Alex's picture matched at the sign; the register | sim map/sign checks | Yes (story) | Human review of pacing |
| 10 | Too scripted | Triggers drove everything | Hints before recovery; the player does the actions; carries only after long idle | idle test (evidence never found for you) | Yes | — |
| 11 | Geography and lore | — | Map in the garage, road signs, the kiosk map, the register's 1991 entry | sim; review frames | Partly | Signage art, a clearer map |
| 12 | Stones aren't a minigame | `throwYours()` was a random number | Pick a stone up, hold F to wind, let go; physics skips by speed and angle (`chapter5-park.js` `bounce`) | sim stones checks (counts vary with the throw); frames | Yes | Throw animation (low sidearm) |
| 13 | Stones appear without pickup | Mesh at the hand | Stones lie on the beach; F reaches down and takes one | frames s06–s08 | Yes | One stone asset |
| 14 | Must reach down for a stone | — | Reach with crouch, within an arm's length | frames s07 | Yes | Hand pose |
| 15 | Throwing animations unconvincing | No arm | First-person wind-up and release; friends crouch and throw | frames s09–s14 | Partly | Animation |
| 16 | Impacts need interaction | — | Rings and splashes at each touch | frames s12–s13 | Yes | Water effects |
| 17 | Hard shoreline | Water cells unwalkable | Wade zones at the beach and lawn (`WADE`, `PS.shallow`), slower in the water | sim wade check; frame s15 | Yes | See-through shallows |
| 18 | Enter shallow water | — | As 17; only where the bed is under water | as 17 | Yes | — |
| 19 | Dock sitting is wrong | Only the camera moved | All three sit on the edge, legs over the water (`physical.js` `sit`, `sitPose` hang); seats side by side | sim dock check; dock frames | Yes | Seated first-person body |
| 20 | Looking down at yourself is bad | Camera inside the neck | Chapter Five's body back under the eye, an eye that dips, a stance (`on-foot.js` `fpBody`) | lookdown frames | Partly | Leg and shoe meshes |
| 21 | Walk through a gate | Gates drawn, not solid | Collision follows the drawn arm (`gateAt`); F lifts the latch or Jamie does (`chapter5-gates.js`) | sim gate checks | Yes | Hinge/latch hardware |
| 22 | No inventory | — | I/Tab or the BAG button (`inventory.js`) | sim inventory checks; frame e16 | Yes | Panel styling |
| 23 | Flashlight by day | It died on first use | Sam hands it out at the camp gate; works by day; dies only in Bluejay, then Sam's batteries | sim flashlight/batteries checks | Yes | Torch model, hotspot |
| 24 | Camera needs hands and shutter | Model hung on the view | Both hands raise it, a finger presses the shutter (`chapter5-gear.js` shot) | frames e10–e15 | Yes | Finger rig; camera model is Ch.4's |
| 25 | Shutter/flash response | A click | Flash light, the picture on the screen, white-edged | frames e13–e14 | Yes | Flash burst effect |
| 26 | Little facial expression | Brows and mouth merged in the head | Dynamic brows and mouth with expressions per line (`faces.js`) | faces frames | Partly | Lids, eyes, range |
| 27 | Mouths don't move | — | Text-timed mouth movement on every line | faces frames | Partly (provisional) | Audio lip sync |
| 28 | Campfire takes 3.5 hours | `C.lapse` jumped the clock | A short rest at the real clock rate; the evening runs at six times | sim campfire check (clock) | Yes | — |
| 29 | Shirt taken without a pickup | `shirt.visible=false` | Sam takes it off the nail, gathers it, puts it in his bag | sim shirt check; frames e17–e20 | Yes | Cloth states |
| 30 | Floating yellow orb | Sphere and halo | Carried flashlights with beams, a glint, a pool (`chapter5-presence.js`) | night frames | Partly | Volumetric beam, darkness |
| 31 | People too far for the dialogue | Named people at 90 m | They talk about lights ("There's a light. At the gate."); the lights come close but go out at 12 m | sim three-lights checks | Yes | — |
| 32 | Horror lacks causes | Triggers | Lights copy you, sit where you sat, turn on you; the double comes out toward you | sim night checks; night frames | Yes (needs human review) | Darkness grade |
| 33 | RUN without danger | RUN on seeing the double | RUN only when it comes out at you; the gate slams; Sam shoves it | sim escape checks | Yes | — |
| 34 | The escape isn't frightening | — | The camp gate slams shut in front of you; every light out behind | sim; frames n16–n18 | Needs human review | Darkness, audio |
| 35 | Disconnected triggers | — | One afternoon to night, clock-driven, each beat caused by the last | sim full play | Needs human review | — |
| 36 | Visuals below quality | Placeholder art | Not addressed (the Astra pass); deficiencies listed in the Astra handoff | review frames | No (by design) | Everything in the handoff |

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
