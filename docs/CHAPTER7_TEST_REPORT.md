# Last Light — Chapter Seven (The Street That Wasn't There): test report

Branch `claude/chapter7-the-street-that-wasnt-there`, from `910bca199f25fb92e8fc33156f97d056c202b4c0`. Status:
**CHAPTER SEVEN — IMPLEMENTED, AWAITING HUMAN PLAYTEST APPROVAL.** Every number below is from an automated run on this
branch; none of it is a human playtest. All runs are muted or have no audio device: sound events fire and are counted,
nobody listened to them.

## Summary

| Check | Result and scope |
|---|---|
| Chapter Seven playthrough (`ONLY=chapter7 node tests/verify.mjs`) | __SIM_RESULT__ |
| Chapter Seven targeted checks (same run) | __CHECKS_RESULT__ |
| Chapter Six regression (`ONLY=chapter6 node tests/verify.mjs`) | __REG6_RESULT__ |
| Chromium walkthrough (`SEGMENTED=1 NO_DEV=1 node tests/chapter7-browser.mjs`) | __BROWSER_RESULT__ |
| Chromium key frames during the beats (`node tests/chapter7-frames.mjs`) | __FRAMES_RESULT__ |

## Length (direct play)

__LENGTH__

## Visual review

__VISUAL__

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

**Wrong but not blocking**
* The photograph's state did not follow the section on jumps (a jump back to the morning after the night showed the
  altered photo); it now follows the section and resets at the chapter's start.
* Jamie's thrown can did not actually draw the hunter off you (it ignored the noise mid-pursuit).
* QA jumps put Jamie in Sam's doorway (in your way); Jamie now waits where he would be.
* The court's door and mailbox spots were placed in the court's own frame, not the world's.

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
* Sam's kitchen ceiling read black; it is lit like the walls.


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
SEGMENTED=1 node tests/chapter7-browser.mjs               # Chromium walkthrough + DEV scenes (NO_DEV=1: walkthrough only)
node tests/chapter7-frames.mjs                            # the key frames, taken during the beats
```

Segments: `house, garage, reyes, afternoon, court, green, upstairs, chase, abduction, after, night`.
