# Last Light — Chapter Seven (The Street That Wasn't There): test report

Branch `claude/chapter7-the-street-that-wasnt-there`, from `910bca199f25fb92e8fc33156f97d056c202b4c0`. Status:
**CHAPTER SEVEN — IMPLEMENTED, AWAITING HUMAN PLAYTEST APPROVAL.** Every number below is from an automated run on this
branch; none of it is a human playtest. All runs are muted or have no audio device: sound events fire and are counted,
nobody listened to them.

## Summary

| Check | Result and scope |
|---|---|
| Chapter Seven playthrough (`ONLY=chapter7 node tests/verify.mjs`) | **53 passed, 0 failed.** One continuous run from Chapter Six's end card (its **Chapter Seven** button) to Chapter Seven's end card, played with inputs only (walking, riding, looking, F, hiding, the mouse on the map, holding on, writing): every beat of the five acts is a check (the knocks, the dining room, the reveal, the stealth, the door, the large thing, the chase, the abduction, the forgetting, the names, the window, the card with no Chapter Eight). 22.4 game minutes. |
| Chapter Seven targeted checks (same run) | **13 passed, 0 failed.** All 40 DEV scenes start; the hunter is its own creature (not the drain creature); walking into it in the stealth gets you caught and back at the stealth checkpoint; hiding in the pantry for 25 s is safe; no sight line through the stair core; stopping in the chase gets you caught and back at the bikes; the photograph is the four of you before the abduction and only you after it on every jump; the gum's path (nightstand → Jamie → the grass → you); Continue offers the last checkpoint; Chapters Six, Five and Four start clean after Chapter Seven; the adapter loads a skinned `.glb` (the existing drain creature's file, as a stand-in test of the loading path), falls back for missing clips and keeps its sockets. |
| Chapter Six regression (`ONLY=chapter6 node tests/verify.mjs`) | **80 passed, 0 failed.** Chapter Five's end card → Chapter Six played by inputs to its end card, which now offers Chapter Seven; its targeted checks, including all 25 of its DEV scenes and "after it has run, the earlier chapters start exactly as before". |
| Chromium walkthrough (`SEGMENTED=1 NO_DEV=1 BROWSER_MEMORY_MB=3000 node tests/chapter7-browser.mjs`) | **67 passed, 0 failed, 1077 s.** Chapter Six's end card, a real click on its **Chapter Seven** button, the chapter card; then all eleven segments played in the page by the simulation's player (inputs only), each segment in a fresh browser from its own checkpoint (the container cannot hold one software-GL page for the whole chapter), to Chapter Seven's end card; 62 beat checks, 65 captures; no JavaScript errors; no WebGL or shader warnings. Triangles per frame 43k–1.06M. |
| Chromium DEV scenes (`SEGMENTED=1 DEV_ONLY=1 node tests/chapter7-browser.mjs`) | **3 passed, 0 failed.** The title's DEV panel, **Chapter Seven**, each of its 40 scenes chosen and started with real clicks (six per fresh browser), captured in `dev/`: every one starts in a Chapter Seven phase, with Jamie there until he is taken and nobody after; no JavaScript errors; no WebGL or shader warnings. |
| Chromium key frames during the beats (`node tests/chapter7-frames.mjs`) | **27 frames, 0 page errors.** Each taken during its beat after a QA jump and the game's own update (the garage glimpse, the hand on the newel post, the father at the glass, the large thing, holding on to Jamie, the four bikes), in `frames/` with `frames.json`; every one looked at (below). Draw calls 108–746, triangles 73k–1.06M per frame (software GL). |

## Length (direct play)

Game minutes per segment, from Chapter Six's end card to Chapter Seven's, for the simulation's direct player (it goes
straight to each objective, reads only what a check needs, and holds Shift in the chase). The Chromium walkthrough, which
plays the same inputs in the page, agrees within a few seconds per segment.

| Segment | Minutes | | Segment | Minutes |
|---|---|---|---|---|
| The house (the step, his room, the fan, the photograph, the notebook, the gum) | 2.50 | | The green-door house (the reveal, the stealth, the door) | 2.31 |
| The garage | 0.65 | | Upstairs (the boy's room, the old bike, the large thing, the porch roof) | 1.95 |
| Reyes and the map | 2.20 | | The chase (51.4 s riding) | 1.63 |
| The afternoon (the curb, the ride, the lookout, the lane) | 2.46 | | The abduction (12.3 s holding on; the gum) | 1.77 |
| Old Mill Court (the fence, the knocks, the lights) | 3.05 | | Later (Jamie's mother, Reyes) | 1.28 |
| The dining room | 1.04 | | Sam's room that night (the photograph, the names, the window) | 1.52 |

**Total: 22.4 minutes** of direct play, against the 45–55 the chapter was asked for. This is a floor, not an estimate of a
first play: a person reads the room, the map, the court, the boy's room and the forgetting, gets caught in the stealth,
and rides at their own pace. By the ratio earlier chapters showed between this player and a person (about 1.3–1.5×)
a first play would be roughly 30–35 minutes, still under the target. The playtest should time it.

Other numbers from the same run: stealth failures before getting upstairs 0 (and a separate check that it does catch
you if you walk into it); the garage glimpse on screen 0.57 s; while you hold on, the view stays within 0.88 m of
Jamie's hand; while it holds him, his feet stay in its hand on every frame checked (0 off); Sam never seen; Jamie never
seen after he is taken; nothing non-finite.

## Visual review

Every key frame in `docs/qa/chapter7-the-street-that-wasnt-there/frames/` (taken during the beats, software GL, sound
off) was looked at by eye after the last fixes. What each shows, and what is still rough:

| Frame | What it shows | Notes |
|---|---|---|
| 01 Sam's room | The desk, the photograph on it, his shelves, the bed, the window bright with the morning street | |
| 02 The fan | The box fan on the floor at the foot of the bed, blades turning behind the grilles | |
| 03 The photograph | Last July at the oak: the four of them and their bikes | |
| 04–05 The garage | It, low by the side door under the one dim light; its hand on the frame | The stand-in: up close in daylight it reads as a smooth dark figure, which is what it is (placeholder) |
| 06 Reyes | Reyes and Sam's dad at the kitchen table | |
| 07 The map | The 2009 map, the 1958 plan over it, the vacated court, SHEET 2 OF 7 | |
| 08 The lane | The old broken paving to the hedged lane behind the oak | |
| 09 Old Mill Court | The court in afternoon light: the '59 sedan, mailboxes, poles, the houses | |
| 10–12 The dining room | The family at the table through the picture window; the heads turn; the father at the glass, which cracks | |
| 13–15 The reveal | A hand round the newel post at the top of the stairs; on the landing; coming down | Silhouettes against the upstairs light |
| 16 The stealth | It in the living-room doorway, lit from behind; the hide prompts | |
| 17 The boy's room | The August 1991 calendar on the wall | |
| 18 The old bike | The green Meadowlark in the storeroom, wet, AR on the frame | |
| 19 The large thing | A dark shape behind the far roofs, a limb lifting | Crisp against the haze (out of the fog on purpose) |
| 20 The chase | It on all fours along the curb at dusk | Small in the frame at that moment |
| 21 The grab | At the lane's mouth it has Jamie | Jamie is low behind his bike in this view |
| 22 Holding on | Jamie on his back, its hands on his ankles, your hands reaching for his | |
| 23 The gum | The gum in the grass by his bike | Small (a pack of gum) |
| 24 The photograph, that night | Only you, at the oak, with your bike | |
| 25 The names | ALEX, JAMIE, SAM on the notebook page, the pencil | |
| 26 The window | Four bikes across the street, the houses lit | |
| 27 The end card | LAST LIGHT · Chapter Seven · The Street That Wasn't There | |

## Findings fixed during verification

The input-driven simulation and the Chromium frames found these; each is fixed on the branch (the commits say so).

**Blockers a player would have hit**
* Sam's room: after his dad turned the fan back on, the garage noise could never fire (the chapter stalled in the room).
* The names: once written, F stayed captured, so the last window could not be looked out of (the chapter could not end).
* The horror house: the living room, dining room and kitchen furniture left no way round for the hunter (or a clean way
  for the player); the upstairs hall beside the stairwell was narrower than a body (the storeroom and the hall window
  were unreachable); the upstairs doors were shut before the reveal; the dresser's resting place sealed off the desk and
  the calendar; the kitchen counter blocked the back-hall door.
* The reveal could be overridden by the "footsteps stop" beat (it froze at the top of the stairs if you looked up fast).
* Hiding was not offered during the reveal, though the objective said "Hide".
* The chase: the creature landed between the two parked bikes and blocked both; it caught a rider in the first instant;
  a rider who stopped was never caught (it stopped on its line beside them).
* At the oak: it came out of the lane while you were still in it; being knocked off your bike could put you inside the
  lane's hedge (stuck); if it grabbed Jamie close to the lane the struggle ended at once; if you had ridden on, you could
  never reach him.
* An act-only beat in a line list reached the caption timer with no text (a crash in the garage aftermath).
* The stealth checkpoint now starts you hidden in the pantry with Jamie (it used to drop you in the open kitchen).
* At the oak, only the old paving's band was walkable beyond the lookout's own bounds: running to Jamie across the lawn
  beside it you met a wall nobody could see (the continuous run stopped there). The open lawn beside the band is
  walkable now (below the lane's mouth and outside the lookout only; the lookout's oak, bench and fences still stand).
* The gum, knocked out of Jamie's hand at the first yank, could land in the lane's hedge or past the walkable ground when
  he was taken right at the lane's mouth, and then could never be picked up: it settles in the nearest grass you can reach.
* While you held Jamie's hand the view flew to the far end of the map: his hand was read at a moment when the friends'
  riding update had put his body back at its bike's origin. It is read from where he was last laid down.

**Wrong but not blocking**
* The photograph's state did not follow the section on jumps (a jump back to the morning after the night showed the
  altered photo); it now follows the section and resets at the chapter's start.
* Jamie's thrown can did not actually draw the hunter off you (it ignored the noise mid-pursuit).
* QA jumps put Jamie in Sam's doorway (in your way); Jamie now waits where he would be.
* The court's door and mailbox spots were placed in the court's own frame, not the world's.
* Jamie, taken off his bike, was drawn half sat up for as long as he was down (his head a metre off the ground): the
  friends' update stood him upright every frame and the chapter only eased part of the way back. He lies flat now, on
  his back, his ankles in its hand; the hand you hold reaches from his shoulder toward you (it reached from his feet and
  stopped at his waist); the view while you hold on looks down at his hands and his face and keeps it in view as it
  drags.

**Seen in the frames**
* The hunter's stand-in read as a pale cartoon in daylight (beige skin, a heavy brow, round eyes): now dark and a little
  wet, a longer skull without a brow, two deep holes for eyes with a glint far back; the garage light is dimmer.
* The box fan was a solid slab with bars (it read as a radiator, its blades hidden inside); it is an open frame with the
  blades turning behind the grilles, on the floor at the foot of the bed, blowing across it.
* A poster and a lit box stood in the middle of Sam's kitchen: the street's own stand-in room behind his side window
  (`houses.js` builds one so the window shows something from the road). Its triangles are folded away while Chapter
  Seven's rooms are shown and given back after.
* Someone standing about today stood in front of Sam in last July's photograph: everyone the world has about is now
  out of the picture while it is taken.
* Sam's kitchen ceiling read black (the street house's own ceiling showed through under it); it sits lower now.
* The reveal's hand on the boy's-room doorframe could not be seen from the foot of the stairs (the stairwell shows only
  a slot of the upstairs): the hand now comes round the newel post at the top of the stairs, inside that slot.
* The boy's-room calendar had no object on the wall (the look floated in a window); the old green bike was not in the
  storeroom at all (only its look and its bell): both are there now (the bike is the game's own Meadowlark build).
* The family at the table showed only the tops of their heads over a high sill: the picture window is lower and wider
  and the table nearer it.
* Old Mill Court stayed in broad daylight until the green-door house; the light now runs ahead of the clock there.
* Jamie, taken off his bike, stood upright in the grass (the friends' own update stood him back up after the chapter laid
  him down): he is posed after it now.
* The names were written at a grazing angle (the page unreadable); the last look out of Sam's window showed a dark pane
  (the view was rendered into the corner of the garage): it is rendered past the garage at the four bikes, bright.
* Jamie's knock request could leak into the dining-room scene on a jump; it only comes before the lights.
* A dark box stood over Sam in last July's photograph: it was the frame's own wooden stand, its top corner through the
  front of the picture. The stand is wholly behind the frame now. At night the photograph in your hand was nearly black;
  in his dark room it now catches a little light from the street, enough to see that only you are in it.
* The 1991 calendar was inside the boy's-room wall (the wall is 14 cm thick; it hung 3 cm behind its face): on the wall now.
* The large thing behind the roofs was the colour of the sky (the dusk haze took it at a hundred metres): it is out of
  the haze, a dark shape against it.
* The old paving at the lane's mouth read as railway sleepers (dark slabs laid one per 0.8 m): slabs of uneven length
  meeting at cracks, now and then a gap.
* Sam's window showed the street house's own glass (part of the street's geometry, a few centimetres inside the pane),
  not the view: the panes stand in front of it now. The last look out of it was taken along the line from wherever you
  stood (from the desk, at a slant along the wall): it is square on to the glass, at the four bikes. By day his window was
  a plain glowing pane (the morning view was never rendered): the street across from it is rendered once you are in his
  house, shown by its own light, and taken off the glass at night.

**The simulation's own player (not the game)**
* After drifting round Jamie it could end up wedged on a corner it had only grazed (the '59 sedan in the court, after the
  knocks): it now stops pushing, steps out the way it can walk and finds the way again; its escape from a tight spot no
  longer goes through a car.
* In the continuous run it set off upstairs before Jamie had dragged the dresser off the door: it waits for him.


## Not verified

* **Audio by ear.** Every run is muted. The checks prove which sounds are asked for and when, not how they sound.
* **A real GPU.** Chromium ran with ANGLE / SwiftShader (software). Triangle and draw-call counts are real; frame times
  are not a real-GPU measurement.
* **A person playing it.** The simulation player goes straight to each objective. Stealth difficulty, the readability of
  the hunter's patrol, the chase's feel and the length of a first play need a human.

## How to run

```
ONLY=chapter7 node tests/verify.mjs                       # the playthrough and the chapter's checks
ONLY=chapter7 PLAY_ONLY=1 FROM=green TO=upstairs node tests/verify.mjs   # some segments only (TRACE7=1 to trace)
ONLY=chapter7 CHECKS_ONLY=1 node tests/verify.mjs        # the targeted checks only
ONLY=chapter6 node tests/verify.mjs                       # Chapter Six (its end card now offers Chapter Seven)
SEGMENTED=1 node tests/chapter7-browser.mjs               # Chromium walkthrough + DEV scenes (NO_DEV=1: walkthrough only;
                                                          #   DEV_ONLY=1: DEV scenes only; QA_OUTPUT=dir for the captures)
node tests/chapter7-frames.mjs                            # the key frames, taken during the beats
```

Segments: `house, garage, reyes, afternoon, court, green, upstairs, chase, abduction, after, night`.
