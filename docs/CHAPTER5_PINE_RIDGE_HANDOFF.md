# Last Light — Chapter Five: The Place in the Picture (handoff)

The first complete, playable draft of Chapter Five: the next day, Wednesday, August 24, 2011, from Sam's garage in the
afternoon to one light across the reservoir at night. Story, world, gameplay, companions, horror, checkpoints, the DEV
selector and tests are all implemented. Art, sound and lighting are a coherent first draft. The final art pass belongs
to Astra (see **Future Astra art priorities**).

## Source and branch

| | |
|---|---|
| Starting branch | `codex/astra-chapter4-repair-pass2` (not modified) |
| Starting SHA | `c9647772642c0bbb5478bdb04bf36592fcc74919` |
| Chapter Five branch | `claude/chapter5-pine-ridge`, created from that SHA |
| History | Linear commits on top of the starting SHA. No rebase, no squash, no merge, no force-push, nothing to `main`. |
| Final SHA | The branch head at publication. It is the commit that adds this document, and the chat delivery reports it. Runtime commits come before it. |
| Creature | "Smily horror monster" by Bento (CC BY 4.0, https://skfb.ly/6W6ut). Asset bytes, source copy and `docs/THIRD_PARTY_ASSETS.md` unchanged. Chapter Five reuses Chapter Three's instance through its existing `place`/`drive` interface. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight.chapter5`. `lastLight.jump(section)` starts any
section below, and **Continue** on the title returns to the last checkpoint.

## Length

The scripted, direct simulation playthrough takes **26.6 minutes** of game time from Chapter Four's end card to
Chapter Five's end card (27.4 by the other route). It goes straight to each objective. A player who looks around the
park, the camp and the buildings will take about **35–45 minutes**. Nothing is timed against the player. Every beat
has a time fallback (leaving Sam's garage a minute after "Ride to Pine Ridge.", the ride after eight minutes, the bike rack after 200 s on foot,
and the rest as listed in the sim's idle check), so a player who stands still is carried on.

## 1. The story as implemented

Chapter Four's end card (LAST LIGHT / Chapter Four / August 23, 2011) has a **Chapter Five →** button. It leads to
black and the chapter card: THE PLACE IN THE PICTURE over **Chapter Five**.

**Sam's garage, 1:52 PM.** Sam's mother is at work until six and thinks they are at Jamie's. **F** helps Sam pack:
three flashlights, batteries, water, and Alex's camera ("You hold it."). Jamie arrives late and drops his backpack
open on the driveway. **F** looks in it: one sock ("…I packed one sock."; if the player doesn't look, the line comes
after 8 s). Sam hands him two granola bars without a word. Then, before they ride, what happened downtown: Jamie: "He
said 'see you tomorrow.' It's tomorrow." Sam: "That wasn't him last night. It said what WE said. Like it was copying
us." "What if the picture's the same thing? Something that wants us out there." Jamie: "Then he's out there too. I'm
going." Sam: "…I know. I packed, didn't I?"

**The ride.** Through town and north on Mill Street, past its LOCAL TRAFFIC ONLY sawhorse, onto the **Old Reservoir
Road**: fields, a farmhouse and barn, a narrow two-lane road climbing the wooded ridge. Jamie races you to the top.
The adaptive race always has a winner, and either result is fine. From the crest the reservoir opens below.

**Pine Ridge Park.** The entrance has a fee booth, a paved lot, a picnic shelter on a mown lawn that runs down to the
water, a public dock, a playground, a restroom and a trail kiosk. A new park sign stands at the entrance, and it is
not the one in the picture. The bikes are locked at the rack, and from here on the camp is on foot.
- **Skipping stones** (F at the flat stones, three throws each). Jamie's three, Sam's plunk, then Sam's six.
- **The end of the dock** (F to sit). Alex, and the shoe he once caught and named Gary.

**The place in the picture.** The last picture on Alex's camera is a photograph of a television: Alex walking toward
whoever held the camera, a brown wooden sign, a yellow gate and a gray shed. The player looks for it with the camera
up (**V**, magnify, compare). It matches only by looking from the right spot: the **old gravel lot** at the north end
of the lawn, with the original brown sign, the yellow swing gate across a gravel road and the Reservoir Authority's
shed by the water. Hints arrive if the player is lost, and fallbacks at 240 s and 330 s carry the scene on.

**The trail map.** The kiosk map shows that the gravel road goes to **Camp Whippoorwill (closed)**.

**The yellow gate: a disagreement.** Jamie wants to go ("We're not vehicles."). Sam doesn't ("Nobody knows we're
here, Jamie. Nobody."). Jamie: "Alex was HERE." **The player decides** with F: **Go with Jamie** ("We're just going to
look." "…Fine. But nobody goes anywhere alone.") or **Hear Sam out** ("We look. If anything's weird, we leave. No
arguing." "And we're back at the bikes before dark."). Both lead on.

**Camp Whippoorwill.** A gate under a log arch reads STAY WITH YOUR BUDDY. Sam hands out a flashlight each. The camp
has an office, a clearing with a flagpole and a dinner bell, a lodge, six cabins named for birds (Robin, Bluejay,
Cardinal, Wren, Heron, Owl), a washhouse, a maintenance shed, a pump house, a campfire circle and a camp dock.
Bluejay, Cardinal, the office and the lodge can be entered during the afternoon; Owl's door is swollen shut until dusk.
Free exploration:
- **The clearing.** The camp map on its board, the flagpole, the dinner bell on its post (F rings it).
- **The office.** The **1991 office register** can be paged through with F (A/D), and each
  page is read aloud. Its entries for August 22–25, 1991, record a missing boy from Mill Street (Jamie: "Danny
  Whitcomb. From the library.", the boy from Chapter Four's microfilm), the search based at the lodge, and on
  **8/24**, Grid 7 (pump house / service road): *"two bike tracks at the service gate, fresh. Searchers say both lead
  in. None out."* Pinned up is the **search grid map** with the pump house circled. While the
  player reads the register or looks closer at the map or the carving, **V** photographs it with Alex's camera.
- **The lodge.** Long tables, camp photographs and a pantry. On the pantry's middle shelf, cans are
  gone from the dust, leaving clean rings. *Recently.*
- **The cabins.** The first time the player switches the flashlight on in the camp (Bluejay, in the test runs), it
  dies: "My light's dead." Sam: "Here." "You brought batteries?" "I brought batteries for the batteries." Nobody
  asked him to.

**The campfire (quiet scene).** The three of them sit on the logs around the old fire ring by the water. "This is
nice. That's messed up, right?" Jamie's mom keeps saying "when he comes home", not "if", and he doesn't think she
believes it. "What if we find him and he's not— what if it's—" "Never mind." Time passes in a short lapse. "It's six
fifty-three." "We've been sitting here three hours?" "It felt like ten minutes." Jamie talks Sam into one last cabin.
"…Five minutes." Sitting is the player's to undo: **S** stands up while they talk (the talk and the lapse go on), and
**F** at the log sits back down. A player still standing when the talk ends is put back on the log (with a fade if
they walked off) before the three hours pass, so the picture taken from the trees has all three of them in it. A
player who never sits is brought to the log by a fade 520 s after reaching the camp; the bike stays in the rack.

**Dusk.** Wren's window lights for a moment. "Did you see that? Wren. In the window." "It's the sun. On the glass." (A
player who doesn't go to Owl is led: after 120 s Jamie says "Owl's the last one. Down here." and the two of them walk to
its front; after 240 s a fade brings the player to the porch.) In **Owl**, at the west end:
**Alex's gold shirt** hangs on a nail, still wet, and **JSA** is cut fresh into the back wall, with an arrow and four
marks. Sam takes the shirt and puts it in his bag. They call Alex's name. A light in the trees moves away toward the
pump house, stops, and goes out.

**Three lights.** On the walk back, three flashlights come in at the camp gate. They walk exactly where the three boys
walked that afternoon, stopping where the boys stopped. The creature from the drain crouches low by the lodge,
watching the lights. It runs from them. The lights stop, turn, and go out.

**Night: the camp that wants them apart (the set piece).** Owl's window is lit behind them and the office's porch
light is ahead, toward the way out. A voice from Owl says "Jamie?" A voice by the office sounds like Sam's mother. The
camp pulls at whichever friend the player is **not** with, and staring at Owl pulls at Sam. Sam's compromise:
together, look from the porch, then go. A player who doesn't go to the porch is led there: after 100 s Jamie
("Owl. Come on. Together.") and Sam walk to the front of Owl, and after 170 s a fade brings the three of them to the
porch. The double is never skipped on a timer.

**Owl from the porch.** Standing where the shirt hung is Jamie: his cap, his shirt. Jamie, beside the player: "…That's
my hat." "That's me." The light goes out, and then every light in the camp comes on at once. **RUN.**

**The escape (known geography):** either
- **Route A, the road.** Back past the cabins and lodge to the camp gate. Sam swings it shut behind them, and it
  swings open again by itself.
- **Route C, the dam.** Through the service yard, behind the pump house, onto the service road. The dinner bell rings
  by itself across the water.

Every light in the camp came on at once at the double; along the way out, each lamp the boys pass flickers and its
door slams. At the boundary every light in the camp goes out at once. The way out is read from where the player goes
(either can be chosen late). A player who stops to look back may: Sam and Jamie call at 3.5, 9 and 20 s, and only after
40 s without moving (or 200 s in all) do the friends carry the escape on (to the gate, or onto the dam's walkway).
Every fade that carries the three of them lands each one on the nearest ground they can walk.

**Aftermath.** The walk back to the bikes is the player's own (about 300 m along the shore from the dam); a player who
is still getting nearer is never cut short, and one who stops for 90 s (or after 8 minutes) is faded to the rack. The lamp in the lot. Shaky laughter. The shirt is in Sam's bag. "It didn't start till we found it."
"It knew we'd come."

**The second discovery.** The last picture on Alex's camera is one none of them took: the three of them at the
campfire, from the trees, stamped **6:53**.

**The last image.** Jamie and Sam stand at the edge of the lawn. "I'm starving." "You brought a sock." Across the dark
water, **one light** is on in Owl. End card: **LAST LIGHT / Chapter Five / August 24, 2011.** There is no Chapter Six
button.

The chapter never explains the Presence and has no fight. It never turns the player's view during play; only three
time fallbacks do (after 170 s and 200 s in Owl, the shirt and the carving; after 520 s in the camp, the seat at the fire). Jamie and Sam stay with
the player the whole way and both survive.

## 2. World layout (Pine Ridge)

One frame: `e` east, `n` north, meters from Mill Street's centerline at the town's north edge (`pine-plan.js` `P0`).
- **Old Reservoir Road** (327 m of new road, plus Mill Street's continuation) connects physically to the town. It is
  rideable and runs past the farm, over the ridge and down to the park drive.
- **Park.** Fee booth, paved lot with the bike rack and lot lamp, picnic shelter, mown lawn, public dock, playground,
  restroom, trail kiosk, shoreline with flat stones, and the **old gravel lot** with the old sign, the yellow gate and
  the Authority shed.
- **Gravel road** (190 m) along the north shore to the camp gate.
- **Camp.** Office, clearing (flagpole, bell, buddy board, map board), lodge (20 × 11 m, with kitchen and pantry),
  six cabins, washhouse, maintenance shed, campfire circle, camp dock, service yard and pump house. A **camp lane**
  (162 m) loops through the camp.
- **Service road** (456 m): service yard → pump house → the **dam** → the south shore → the picnic lawn. This is
  escape route C, and it is walkable.
- **Ground.** One designed height function, triangulated on the far ground's lattice, used both for drawing and for
  walking. Where Pine Ridge meets the older far ground it takes the far ground's heights, so there is one surface,
  not two. Walls, tables, benches, logs and other furniture are solid (353 nav solids). The doors of Bluejay, Cardinal,
  Owl, the office and the lodge open with F (and at the wake); the lodge's kitchen door stays shut.

Modules: `dist/pine-plan.js` (plan, heights, nav, solids, doors, spots), `dist/pine-build.js` (terrain, roads, park,
water, trees, lights, animation), `dist/pine-camp.js` (camp buildings and interiors), `dist/pine-art.js` (canvas art:
signs, register, maps, carving, photos), `dist/far-land.js` (shared far-ground heights). `dist/nav.js` gains a `pine`
branch, and `dist/world.js` builds Pine Ridge with the town.

## 3. Gameplay systems

- **Director** `dist/chapter5.js`. Chapter Four hands over every phase starting with `c5-`, `d5-`, `e5-` or `n5-`, and
  all hooks (`update/spots/act/key/pan/wheel/hint/sources/blockers/light/...`). Phases: `c5-black`, `d5-garage`,
  `d5-ride`, `d5-park`, `d5-stones`, `d5-dock`, `d5-sign`, `d5-map`, `d5-gate`, `d5-road`, `d5-camp`, `d5-fire`,
  `e5-dusk`, `e5-owl`, `e5-call`, `e5-lights`, `n5-split`, `n5-window`, `n5-run`, `n5-out`, `n5-final`, `n5-end`.
- **Sky and clock.** Chapter Four's day curve plus a darkness term. The clock lapses at the campfire (to about 6:53)
  and reaches night for the set piece.
- **Alex's camera** (from Chapter Four, **V**) is used for the photo match and for photographing evidence. The
  aftermath picture is added to the camera.
- **The camp at night** `dist/chapter5-presence.js`. Each building's window glow is a lamp with a level, a rate and
  flicker. The three nearest lit lamps get the real lights (a pool of three point lights). Far lamps keep a soft glow
  the night haze does not swallow. It also handles the carried lights (three flashlights replaying the afternoon's
  recorded trail), the **double** (Jamie's build and clothes), and the office porch bulb.
- **Recorded trail.** The player's afternoon path through the camp, with its stops, is what the three lights replay.

## 4. Friendship moments (all playable)

1. **The departure.** Packing in the garage; Jamie's bag, open on the driveway, which the player looks in (one sock);
   Sam's granola bars; then the three of them on what happened downtown, and Sam's worry that the picture is a trap.
2. **Ordinary competition.** Jamie's race to the ridge, and skipping stones (three throws each; Sam's plunk, then six).
3. **A shared memory.** The end of the dock: Alex and Gary the shoe. The scene ends on its own; no scare interrupts it.
4. **Help without asking.** Sam's batteries in Bluejay.
5. **A quiet three-person scene.** The campfire. The player and the boys sit on the logs (the player can stand up
   and sit back down while they talk). Jamie's confidence slips and he can't finish his sentence.
6. **Genuine disagreement.** The yellow gate. Jamie under it, Sam refusing, the player's call. At night the
   disagreement returns as the split, until Sam's compromise.
7. **Shared relief.** The lamp in the lot: shaky laughter, the shirt in the bag.

There is no friendship meter. Jamie is impulsive, funny and loyal, and his confidence cracks. Sam is careful,
prepared, dry, annoyed and kind.

## 5. Horror design

The horror is a ladder of small wrong things, with no random jump scares:
- Someone has been here (the pantry rings).
- The 1991 history (the register, the search map).
- The wet shirt and the fresh carving.
- A light that answers, then goes out.
- The **copy**: three lights walking the boys' own afternoon.
- The creature, seen once, frightened of the lights.
- The **attention** set piece.
- The **double**.
- The **wake** (every light at once).
- The **boundary**: the gate opens again, or the bell rings by itself.
- The **second discovery**: a picture taken of them.

The set piece responds to the player. `C.split` tracks each friend's drift (capped at 13 m: a friend pulled that far
stops and calls). The camp pulls at whichever friend is farther from the player. Looking at Owl's light for more than
1.2 s turns the pull on Sam, and looking at the office light turns it on Jamie. The player holds a friend by being
with him (within 3.6 m), not by standing beside him staring at a light. Voices make surges: "…Jamie?" from Owl at
9 s, Sam's "mom" by the office at 19 s, and the bell at 29 s (both). When the three stay together for 2.6 s after
25 s, or at 66 s at the latest, it resolves into Sam's compromise. This does not repeat Chapter Four's
streetlight cascade: the camp's lamps come on all at once, not in a line toward them.

## 6. Alex clue details

- The video store picture (Chapter Four) is matched to the old lot.
- **Alex's gold shirt**, wet, in Owl. Sam keeps it.
- **JSA** (Jamie, Sam, Alex) cut fresh into Owl's back wall, with an arrow and four marks.
- The 1991 register, from the search for Danny Whitcomb (Chapter Four's microfilm): on August 24, twenty years ago
  to the day, two bike tracks in at the service gate and none out.
- A light walked toward the pump house, the place circled on the 1991 search map.
- The last picture on his camera: the three of them at the fire at 6:53, taken from the trees.

## 7. Ending state

Phase `n5-end`, game state `ended`, card LAST LIGHT / Chapter Five / August 24, 2011, and `#next-chapter` hidden.
The checkpoint `chapter5-end` ("One light") is saved when the last image begins, so Continue returns there. The lamp
in the lot is saved as `c5-second-discovery` (at the rack, after the relief scene). **Start over** and **Back to the
title** work as before.

## 8. Companion logic

Jamie and Sam use the existing companion system (`putFoot`, `run`, `rideTo`, follow modes). Chapter Five adds:
- A guard, as in Chapter Four. It releases a friend held at a scene spot when the player walks away, and clears a
  stuck friend's route after 2.5 s without progress. Each case is counted in `C.guardLog`.
- Make way: when the player holds W and gets nowhere with Jamie or Sam right in front, in the player's path (within
  0.75 m of the line ahead: a porch corner, a cabin door), that friend steps 1.5 m aside, then follows on or returns to
  his spot (`C.guardLog.madeWay`). Every quarter metre of the step aside must be walkable, so he never walks through a
  cabin wall or off the edge of a porch. A friend beside the player (not in the way) is left alone.
- Seats taken from the campfire logs' own solids. Standing up steps back off the log.
- Scripted stand-and-look spots for each beat.
- Bikes locked at the rack: everyone is on foot from the park to the end.

The stress test (sprinting round the camp) keeps both within 10.2 m. Neither friend ever disappears.

## 9. Checkpoints, QA jumps, DEV scenes

- **12 checkpoints** (silent, for Continue): The next afternoon · The Old Reservoir Road · Pine Ridge · The place in the
  picture · The yellow gate · Camp Whippoorwill · The campfire · Owl · The camp at night · Run · The lamp in the lot ·
  One light.
- **37 QA sections** (`SECTIONS5`), each a canonical initializer (`jump`). Each one sets every flag of the chapter's
  earlier beats, the clock and sky, the positions, the bikes and the lamps, and starts shortly **before** its event.
  The Continue save a player would hold at that moment comes from the jump's own checkpoint or, in the DEV selector,
  from the scene's `save`. Evidence photographs are not pre-taken: after a jump the player can still take them. There
  are also 27 aliases (`ALIAS5`).
- **DEV selector: Chapter Five, 37 scenes.** **Chapter Five Start** is the real hand-over: Chapter Four's end
  checkpoint played to its end card, then its button. The other 36 scenes use the matching jumps. See
  [DEV_CHAPTER_SELECTOR.md](DEV_CHAPTER_SELECTOR.md).

## 10. Tests performed

See [TEST_REPORT.md](TEST_REPORT.md) for the numbers. In summary:
- `tests/chapter5-sim.mjs`: the natural playthrough from Chapter Four's end card by inputs, both routes and both gate
  choices, plus every jump, alias and checkpoint, companion stress, set-piece responsiveness, idle fallbacks, Start
  over, DEV start equivalence, 37 DEV scenes, 18 BEFORE checks and leak-free switching.
- `tests/chapter5-browser.mjs`: Chromium, sound off. Real clicks through the hand-over, the same input-driven
  playthrough in the page, then all 37 DEV scenes with real clicks. Captures go to `docs/qa/chapter5-pine-ridge/`.
- The full suite (`QUICK=1 node tests/verify.mjs`) plays the prologue through Chapter Five, then runs every chapter's
  checks.

## 11. Known limitations

- **No real-GPU frame rate measured.** Rendering was checked in SwiftShader only. Draw counts and triangle counts are
  real, frame times are not. The heaviest reviewed views (the ridge crest, the old lot) are just under 1M triangles.
- **Memory** (Chromium with SwiftShader, measured with nothing else running; details in the test report). Pine Ridge
  is built at load with the rest of the world.
  - Vertex data: +151 MB over the starting commit (518 → 670 MB of merged meshes and shadow proxies, simulation
    harness), mostly the 6,235 trees.
  - JS heap at the title: 927 MB at the starting commit, 1,267 MB before this pass's fixes, **1,139 MB** now. Pine
    Ridge's bake layers now let go of their pre-bake objects once merged (`release:true` in `pine-build.js`, honoured by
    `world.js`); other chapters' layers are unchanged.
  - No leaks found: revisiting the camp, the three lights and the split three times leaves shader programs (187),
    geometries (1,989), textures (49) and the heap flat.
  - Lights: Chapter Five keeps a constant 9 point lights (the carried lights stay in the scene at intensity 0 when
    unlit), so no material recompiles mid-scene. Entering Chapter Five recompiles once, behind its black card.
  - Steady state in Chapter Five: renderer about 1.6–2.0 GB, GPU process about 1.0 GB. Jumps and chapter changes
    (DEV starts, Continue) spike the renderer for a moment to 2–5.8 GB under software GL; the starting commit spiked
    to 5.3 GB entering Chapter Four. In SwiftShader all GPU buffers live in system RAM, so these numbers say little
    about a real GPU.
  - Still available: instancing the trees, and releasing the other chapters' pre-bake groups (not done: those reach
    into accepted Chapters 0–4, and two of their modules read parent chains of baked objects).
- **No human playtest yet.** The walkthroughs are scripted inputs.
- **Audio is first-draft synthesis plus hooks.** The bell, door slams, clicks, splashes and voices are placeholder
  sounds, and the voices are captions with synthesized cues. No new audio assets were added.
- Fog makes the distant tree impostors read pale against the dusk sky in the final view.
- The double is seen through Owl's door from the porch. If a player stands far to one side, the door frame can hide
  it. The scene's time fallback carries on regardless.
- The far lamp glow is a camera-facing sprite. Up close the real window light takes over.
- Pine Ridge has no other people. The park is empty on a Wednesday afternoon, which is intended but sparse.

## 12. Future Astra art priorities

Camp architecture and cabin and lodge materials (weathering, roofing, rot) · lakeside atmosphere and fog depth ·
vegetation density and variety near the camp · natural dusk and night lighting (window light spill, porch bulb) ·
fine object detail in the office, lodge and pantry · character materials · composition of the three lights, the
double and the final image · horror sound design (the voices, the bell, the camp at night) · technical art
optimization of the crest and lot views.
