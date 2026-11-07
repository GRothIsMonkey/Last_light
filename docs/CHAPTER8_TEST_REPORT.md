# Chapter Eight: test report

Branch `claude/chapter8-fullgame-story-integration`. All results below are from automated runs in this
environment. **No human playtest has been done.** No frame rate or performance on real hardware was measured;
rendering was only exercised with SwiftShader (software GL) in headless Chromium, and no performance figure is claimed.

## 1. How the game was exercised

- **Headless simulation** (`tests/verify.mjs`): the real game modules (Three.js scene graph, navigation, the chapter
  directors, companions, the hunter, audio graph calls) with a mocked WebGL renderer and DOM. The chapter simulations
  drive the game **by inputs**: key presses (W/A/S/D, Shift, C, T, F held or tapped, digits, S), mouse look toward
  targets, walking routes found on the game's own walkability, waiting for the game to offer an interaction before
  using it. They do not set story flags or jump past beats inside a run.
- **Chromium** (Playwright, SwiftShader, sound off): `tests/chapter8-frames.mjs` captures twenty-one frames of the
  chapter during its beats (QA jumps, then the game's own update), saved with `frames.json` under
  `docs/qa/chapter8-the-night-oak-hollow-fell/frames/`; `tests/chapter8-package-browser.mjs` opens the offline
  package from disk.

### 1.1 The commands that were run

```bash
DEBUG8=1 ONLY=chapter8 node --max-old-space-size=6144 tests/verify.mjs            # Chapter Eight, continuous, then its checks
CHECKS_ONLY=1 ONLY=chapter8 node --max-old-space-size=4096 tests/verify.mjs       # Chapter Eight checks alone
ONLY=chapter8 PLAY_ONLY=1 FROM=<segment> TO=<segment> node tests/verify.mjs       # a stretch of it (development)
ONLY=chapter3 node --max-old-space-size=4096 tests/verify.mjs                     # likewise chapter4, chapter5, chapter6, chapter7
TRACE=1 NO_CHAPTER4=1 node --max-old-space-size=6144 tests/verify.mjs             # Prologue to Chapter Three, then DEV checks
node tests/chapter8-frames.mjs                                                    # SHOTS=a,b for a subset
PLAYTEST_CHAPTER=8 node tools/package-playtest.mjs <folder>                       # the offline package
node tests/chapter8-package-browser.mjs <folder>/Last-Light-Chapter8-Playtest.html
```

## 2. Chapter Eight

### 2.1 One continuous run, Chapter Seven's end card to Chapter Eight's

`DEBUG8=1 ONLY=chapter8 node tests/verify.mjs` on commit `f7f26d3` (the packaged commit) —
**29/29: 20/20 story checks** in a single uninterrupted input-driven run (61.9 minutes of game time), then **9/9
chapter checks** (`runChapterEightChecks`). (`runChapterEightChecks`). The run begins with one QA jump to Chapter Seven's end card; from there
everything is input: the end card's button, keys, mouse look and walking.

| # | Check (as named in the run) | Result |
|---|---|---|
| 1 | Chapter Seven's end card offers Chapter Eight | pass |
| 2 | The card: LAST LIGHT · Chapter Eight · THE NIGHT OAK HOLLOW FELL | pass |
| 3 | The four bikes, the page, the cover; Reyes: "They're underneath us." "Who?" "All of them." | pass |
| 4 | The plans: MH-12 found on the 1959 sheet over the 2009 map | pass |
| 5 | MH-12: probed, dug, vented, lifted on three | pass |
| 6 | The outer barrier: down before it gets there; it hits the leaf and stops; it goes | pass |
| 7 | Annie Rowan: Mason's slip, licence 0417, her school picture (A.R.); the 1958 film | pass |
| 8 | Danny: the flyer (two fingers, left hand), his hand on the alcove, his name; it flees what is coming | pass |
| 9 | Sam: what's new can't be copied (the fan); the drain; the seized crank and the catch; out; something far off moves | pass |
| 10 | Jamie: it brings him back to his cell; Sam holds the grille; Jamie's door; it hits the grille | pass |
| 11 | Alex: "It keeps bringing you here."; at the same time (your light, twice); two handles; the last one out | pass |
| 12 | All four of them … "Can we just go home?"; the alarm; Reyes on the radio | pass |
| 13 | The anchor board: the tags, three blank rows, three needles down; "We let it out?" "You got your friends back." | pass |
| 14 | It comes through the barrier; the hunter runs from it; the way out comes down behind you; the ladder | pass |
| 15 | The street from the oak: the road gone, the fire, the pole; Summerfield goes down with a car | pass |
| 16 | The Hendersons': the jack, the door, Lily; Jamie holds the doorway; it comes out of the hole; Jamie is dead | pass |
| 17 | The drawdown nobody would use while anyone was in there; "There aren't now." | pass |
| 18 | The gates, the drain gate (Chapter Six's), the ports, Line Two, three pins, the plug; Alex holds the hatch | pass |
| 19 | The oak: "Did we stop it?" "Yeah." "Good." … "We were supposed to go riding tomorrow." Alex dies | pass |
| 20 | The last ride: Sam, two bikes; "I keep thinking they're right behind us."; the road behind is empty; the end card | pass |

In that run the simulated player was caught once by the hunter in the construction gallery (`c8-stealth`) and once by
the water heaving at gate 1 (`c8-gates`); both times the game returned it to that checkpoint and the retry passed.
Game-time per segment (minutes): bikes 2.2, field 1.5, shaft 0.9, gallery 31.6, corridor 1.7, wing 2.9, retrieval 2.1, Alex 1.9, reunion 1.7,
truth 1.7, breach 1.1, surface 2.3, street 2.9, staging 0.9, operation 3.0, oak 1.6, ride 2.0. (The gallery is long because the sim waits out the hunter's patrols
with patient, safe holds; a person will usually move sooner.)

Chapter checks (all pass): every one of the 39 DEV Chapter Eight scenes starts in a Chapter Eight phase with the player
on foot or riding (or at the end card); the barrier can be failed and returns to its checkpoint; **the escape can be
failed** (standing under the junction-hall beam) and returns to `c8-escape`; the hunter is Chapter Eight's own
instance and the smiling creature is Chapter Three's with the injured hand; Continue offers the last checkpoint;
Chapter Seven and Chapter Six start clean afterwards (no complex, no ruin, no Alex companion; Chapter Six's drawdown
gate stops the voice in the horn); the earlier-chapter clues exist in source; the save the aftermath will read is
written (`home: YOU, SAM; lost: JAMIE, ALEX; presence: sealed`).

Earlier full runs on this branch (before the last fixes) found the defects listed in 2.2; the numbers above are from
the final run.

### 2.2 Problems the runs found, and what was fixed

These were real defects a player would have hit, found by the input-driven runs and fixed:

- The 1974 hall collapse blocked the only way round; the junction-hall beam landed on the entry path with no visible
  warning (now: the hall comes down past the crew-room door, the beam drops where you came in, and every hazard drops
  grit and dust first).
- The jammed bulkhead could not be got under even crouching (now crouch-only passage).
- The Hendersons' jack, door step and lawn were inside the collapse hole; the street scene was rebuilt on walkable
  ground (her car at the east curb, the escort round the hole, Jamie caught at the curb in view).
- Every scene's fallback timer counted from the start of the chapter, so in a continuous playthrough fallbacks fired
  at once and scenes skipped their interactions (the scene clock now restarts per phase).
- Acts IV–V received a frozen copy of Alex (`undefined`), so his escape boost, hiding at the ladder, his place at the
  works and his sitting pose at the oak never applied.
- The look back on the last ride needed a 123° head turn; riding allows about 106° (now achievable).
- The operating bridge is one person wide and Sam and Alex followed onto it, blocking the way back (they now watch
  from the bank).
- The flashlight signal at Alex's door could wait 22 minutes if missed (now a reminder at 25 s, fallback at 150 s).
- The hall's long windows looked at a solid wall (window holes were cut at each room's own floor height; the main
  chamber is nine metres lower), so the breach was invisible; the main chamber had no lights.
- DEV/Continue into the flooded wing or the bulkhead left the player on the street; "the room it made" and "his door"
  resumed in the wrong room; Continue from the garage, from Jamie and from the hatch replayed their scenes.
- **DEV switching crashed** (Chapter Eight's reset met its emptied state), breaking DEV starts of other chapters
  (found by Chapter Six's suite).

## 3. Earlier chapters (regression)

Each chapter's own suite, run on this branch after the Chapter Eight changes:

| Suite | Result | Notes |
|---|---|---|
| `ONLY=chapter3` | 156/156 pass | |
| `ONLY=chapter4` | 35/35 pass | |
| `ONLY=chapter5` | 81/81 pass | |
| `ONLY=chapter6` | 80/80 pass | First run: 78/79, the one failure was the DEV-switching crash above; fixed and re-run. |
| `ONLY=chapter7` | 94/94 pass | First run: 93/94; the one failure asserted that Chapter Seven's end card offers *no* next chapter, which this brief changes on purpose. The assertion now expects Chapter Eight. |
| Default run (Prologue, Chapters One–Three and their replays, then the DEV selector checks), `TRACE=1 NO_CHAPTER4=1` | 549 checks pass, then the run stops at the pre-existing DEV assertion below | Chapters Four–Six are skipped here because their own suites above cover them. |

**Pre-existing failure, not caused by this work:** the default run's DEV-selector equivalence check stops on
`[{"k":"2/alex-bike","d":[["companions.1.b.x",…],["companions.1.b.z",…],["companions.1.ba",…]]}]` (Chapter Two's
DEV start places Alex's companion bike differently from natural arrival). The identical assertion fails on a clean
worktree of the recovered Astra commit `27ad0b6`, before any change from this branch.

## 4. Visual evidence (Chromium, SwiftShader)

Twenty-one frames, reviewed by eye (`docs/qa/chapter8-the-night-oak-hollow-fell/frames/`). What they show, honestly:

- **Readable and staged as intended:** the outer barrier; the 1958 film running on the review-room screen; Danny's
  corridor; Sam's cell door; the crew room with all four boys; the anchor board's text; the breach through the long
  windows (the plug drum, the limbs coming through, the mass behind, the catwalk); the street from the cul-de-sac;
  the Hendersons' (the house, the fallen beam over the door, the hole, her car); Jamie on the grass at a distance (not
  graphic); the works; the plug chamber from the catwalk; the oak (Alex against it, Sam beside him holding his hand);
  the ride; the end card.
- **Fixed after the first captures:** the breach (the windows showed a wall), the made bedroom (dark, unreadable),
  the plug chamber (unlit), Sam at the oak (standing, tilted, not holding Alex's hand).
- **Limits:** software rendering only; props and the Presence are simple procedural geometry; some frames are framed
  by a QA jump rather than by play.

The offline package check (`tests/chapter8-package-browser.mjs`): *pending (runs after the final continuous run).*

## 5. The narrative comprehension test (brief §13)

Assessed against what a first-time player sees on the main path, without optional pages. This is a reading of the
build, not a human test; actual comprehension still needs human playtesting.

| Question | Where the main path answers it | Assessment |
|---|---|---|
| 1. What is the Presence? | The 1958 film (the wall moves); the anchor board; Alex at the board: "It's alive. It's just big. It's under all of it: the court, the lines, out to the camp."; the breach. | Clear. |
| 2. Why does it capture people? | Alex: "It learns you. Your voice, the stuff you'd say. Then it makes another you and goes and gets whoever comes looking. The bell's the same. It rings the bell because we come."; Alex at his door ("It keeps bringing you here."). | Clear. |
| 3. What happened to Danny Whitcomb? | The 1991 flyer (two fingers, left hand) and the same hand on the alcove; his name; the board `D.W. 8/91 — VACATED 9/91 — BREACH`; "Not all the way out. You saw what he is." | Clear. |
| 4. What is the hunter? | It carries Jamie back into his cell (retrieval wing); "the long one brings you back when you get out. That's all it's for."; it runs from the breach. | Clear. |
| 5. Why did historical people and places appear in Old Mill Court? | The room it made for Alex comes apart ("It made it." / "That's what the court was."); "It makes places out of what it took. The court. The Langes'. My room." | Clear. |
| 6. Camp Whippoorwill's connection? | Brandt: "…the reservoir line out to the camp. It's in all of it."; Alex at the board ("out to the camp"); Alex's crew-room account (optional) of coming up in a box in the woods at the camp. | Mostly clear; the full story of Alex at the camp is in an optional conversation. |
| 7. Why living captives? | The board's needles; "Those chambers weren't just holding the children." … "The connections were keeping it in place." | Clear. |
| 8. Why did rescuing the boys cause the catastrophe? | Each release moves a barrier ("something far off moves"); the needles; "When we got out, the walls started moving." — "We let it out?" — "You got your friends back." | Clear. |
| 9. How did they stop it? | Procedure 7 at the works; the three objectives of the operation; the plug drops and it goes quiet. | Clear. |
| 10. Why are some people and records still affected afterward? | "It takes you out of people. The longer it has you, the more of you is gone. Out there, too."; the notebook ("Everybody was forgetting. Me too. So I wrote it down."). The chapter does not show the after-effects (that is the aftermath's). | Partly: the mechanism is stated; its persistence after the sealing is implied, not shown. |

## 6. What was not done

- No human playtest of any chapter in this build.
- No real-GPU or frame-rate measurement.
- No audio-on browser run (all browser runs were muted; audio is exercised as calls in the simulation only).
- The complete Prologue-to-Chapter-Eight walkthrough was run as separate suites (default run for the Prologue to
  Chapter Three, then each chapter's own suite, then Chapter Eight from Chapter Seven's end card), not as one process.
