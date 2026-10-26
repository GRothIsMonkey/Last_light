# Last Light — Chapter Six (Someone Was Here): test report

Branch `claude/chapter6-someone-was-here`, from `7db770d6ee491dd8f8b758d82cb43664ab386386`. Status: **Chapter Six —
implemented, awaiting human playtest approval.** Every number below is from an automated run on this branch's final
runtime; none of it is a human playtest. All runs are muted: sound events fire and are counted, nobody listened to them.

## Summary

| Check | Result and scope |
|---|---|
| Full simulation, prologue → Chapter Six (`QUICK=1 node tests/verify.mjs`) | **818 passed, exit 0.** Real Three.js geometry and full state updates with a mocked renderer and DOM. Prologue, Chapters One–Five as before (natural first ride, replays, Chapter Five's checks and its Route C replay, DEV selector checks), then Chapter Six played from Chapter Five's end card by inputs, then Chapter Six's own checks. `QUICK=1` skips only the slow world-geometry sweeps of the street (unchanged by this branch). |
| Chapter Six playthrough (in that run) | All of its checks pass: the card, the room, the camera, the call, the meeting (shirt bagged, silhouette, camera handed over), the oak, the double on Jamie's stairs, Reyes at the creek, the plan, the works, the helmet, the radio twice, the prints, the grille, the gate held by Sam, under it, the pin, two Sams seen at once by you and by Reyes, the gate, Sam gone, the manhole, two hours later, the end card with no Chapter Seven, Sam never seen again and never called dead. |
| Chapter Six checks (in that run) | 32 QA jumps start in their own phase with everyone finite; Sam present in every jump before the gate and absent after it; 21 aliases; 15 checkpoints, Continue saves and returns; **idle**: a player who stands still is carried through every beat (16 starting points); the double in Jamie's house with the player never looking; 2B as a wall (passable at 1.6 m, not at 0.6 m, not shut); the water rising; all **25 DEV scenes** start; **DEV start = natural arrival (0 differences)**; DEV switching 6→1→6→5→6→0→3→6 leaves nothing behind; after Chapter Six, Chapters Five, Four, Three and Two start with no works, storm, room or storm sky. |
| Chromium walkthrough (`node tests/chapter6-browser.mjs`) | See **Chromium** below. Chapter Five's end card, its **Chapter Six** button by a real click, then the whole chapter played by inputs in one page against the real renderer (ANGLE / SwiftShader), frames captured at every checked beat, then all 25 DEV scenes started from the selector with real clicks. |

## Length (direct play)

The simulation player goes straight to each objective, reads each optional thing once (window, photo strip, chalk, the
file, Sam's notebook, the channel, the bar screen, the gate log, the switchgear, the gauge, the speaker, the prints,
the port) and never wanders. Game minutes, final run:

| Segment | Direct play | Act |
|---|---:|---|
| Your room, the camera, Sam's call | 2.32 | I |
| The ride, Sam's garage: the shirt, the pictures, the plan for the day | 6.81 | I |
| The oak, Jamie's house, Briarwood with Reyes | 7.55 | II |
| Two o'clock: the radio, the camera back, the plan, the file, the notebook, the argument | 4.29 | III |
| The works: Brandt, the helmet, the log, the gallery, the radio twice | 3.87 | IV |
| The landing, the prints, Line Two, the grille | 3.05 | IV |
| The water: the gate held, the pin, the other Sam, the gate | 1.14 | IV / V |
| After the gate, the bank, two hours later, the end card | 4.25 | V |
| **Total** | **33.28** | |

Against the requested acts (I 8–10, II 7–9, III 8–10, IV 12–15, V 5–7; 40–50 in all): in direct play Act I (9.1) and
Act II (7.6) are in range, Act V (~5.3) is in range, **Act III (~4.3) and Act IV (~7.5) are short**. A first-time
player who looks around the streets, the yard, the gatehouse and the chambers, reads the plan and the file closely and
listens through the scenes will take longer; by the ratio the earlier chapters' handoffs used (direct play × 1.3–1.5),
about **43–50 minutes** in all. That is an estimate. The playtest should time Acts III and IV in particular.

## Idle fallbacks (a player who does nothing)

From each starting point the chapter carried itself on to the next beat (seconds of game time): the room to the call
(275), the ride to the meeting (331), the pictures to Jamie's story (222), the street to Jamie's house (381), the
anomaly to its reaction (42), the creek (241), two o'clock to the works (437), the works to the gallery (426), the
gallery to the landing (204), the landing to Line Two (216), Line Two to the water (64), the water to the hold (57),
the hold to the gate (75), after the gate to the bank (148), the bank to two hours later (186), and two hours later to
the end card.

## Chromium

**52 passed, 0 failed, 0 JavaScript errors, 0 WebGL/shader warnings, 91 frames** (Chromium 153, ANGLE / SwiftShader
software rendering, sound off). One page, one continuous playthrough: Chapter Five's end-checkpoint played to its end
card, the **Chapter Six** button clicked, then the chapter played by inputs (one page call per segment, no jump between
them) to Chapter Six's end card in **33.0 game minutes** (409 s wall). The same 46 story checks as the simulation pass
in the page. Then **all 25 DEV scenes** started from the selector with real clicks, each in a Chapter Six phase with
Jamie and Sam there (only Jamie after the gate).

| Segment | Game minutes (cumulative) | JS heap after |
|---|---:|---:|
| morning | 2.28 | 1,011 MB |
| meeting | 9.06 | 1,015 MB |
| streets | 16.54 | 1,018 MB |
| records | 20.81 | 1,019 MB |
| works | 24.67 | 1,023 MB |
| below | 27.63 | 1,024 MB |
| flood | 28.76 | 1,025 MB |
| after | 33.00 | 1,026 MB |

Across the captured frames: 61–553 draw calls, 65,934–1,037,975 triangles (software rendering: the counts are real,
frame times are not a GPU measurement). The JS heap is flat across the chapter. The software renderer's own memory is
large: with the full simulation running beside it in the same container, Chromium was once killed by the container's
memory limit mid-chapter, so the browser test was run on its own. No real-GPU frame rate was measured.

## Visual review (captured frames)

The frames are in `docs/qa/chapter6-someone-was-here/` with an `index.html` gallery: numbered walkthrough frames (the
WebGL picture with the page's date, objective and caption drawn over it by the test), the hand-over and end card as
full-page screenshots, and one frame per DEV scene. Found in the review and fixed before the final runs:

- the low concrete header over the foot of the landing stairs: the camera clipped through it and showed the void
  behind (removed; the landing's ceiling now steps up to the stairs');
- Jamie's front door never opened: the prologue's own door logic shuts it every frame, so the double "on the stairs"
  could be counted as seen behind a closed door (Chapter Six now holds the door every frame while it has it, and the
  double counts as seen only through the open door);
- the aftermath placed you inside Reyes's cruiser; your bike stood outside the works fence though you came by car;
  Sam's backpack sat on the plan at two o'clock (all moved);
- the storm sky read as fair weather until the storm's height; puddles were black rectangles; the works' sign text ran
  off its board; Brandt's truck was boxes (now the town's own pickup); emergency lamps never came on when the mains
  failed; the storm fog was lighter than the storm sky, so distant trees showed as pale cut-outs.

## Other findings

- **Earlier chapters' random sequence.** Building Chapter Six used `Math.random` at page load, which shifted the random
  numbers every earlier chapter draws from. Chapter Six is now built on its own seeded generator, and the earlier
  chapters' sequence is as it was. The DEV history (`dist/dev-chapter-history.js`) keeps its accepted entries for
  Chapters Two to Five exactly and adds one generated entry for Chapter Six. (Re-recording showed Chapter One's
  `dadCall` stamp varying by up to 3 s between runs of the same code: that run-to-run variation is pre-existing.)
- **Chapter Four's town-lights clock** is not reset by Start over; it is only overwritten when Chapter Four runs. A DEV
  start of Chapter Six does not run Chapter Four, so the DEV switching check leaves that one field out. Chapter Six never
  reads it.
- **Reyes cannot crouch** (the adults' rig has no crouch); he stands at the left of the gap under 2B instead, and the
  line-of-sight check measures from his head.
- **Faces.** A face's mouth geometry is built on its first update; Chapter Six's figures are now updated once when they
  are made. Three hidden background people in the shared scene (pre-existing) still have unbuilt faces until shown.

## Private playtest

Published as a private artifact: **https://claude.ai/artifact/THG93DdUVKkPxGTTjZLCFR** (runtime `b6feb6b`; see the
handoff for the one packaging difference: the creature model's bytes as base64 text, because the host serves no
`.glb`). Before publishing, the packaged copy was opened in Chromium: the title, the DEV Chapter Six button and the
creature asset loaded with no errors.

## How to run

```
QUICK=1 node tests/verify.mjs                       # prologue → Chapter Six, then Chapter Six's checks
QUICK=1 ONLY=chapter6 node tests/verify.mjs         # Chapter Six alone (FROM=/TO= one of: morning meeting streets records works below flood after)
node tests/chapter6-browser.mjs                     # Chromium walkthrough + DEV scenes (QA_OUTPUT to change the folder)
```
