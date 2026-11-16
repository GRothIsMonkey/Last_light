# Aftermath II, the 2026 coda and the credits — test report

**What this report can and cannot say.** Every result below comes from automated runs: the game's own code driven by
keyboard and mouse input in a headless harness (a mocked DOM and renderer around the real modules), and captures in
headless Chromium with software WebGL (ANGLE SwiftShader). They show that every beat can be reached and finished by a
player's inputs, in every branch tried, that the earlier chapters still pass their own suites, and what frames look like
in a real WebGL renderer. They do **not** show that a scene lands, that the pacing is right, or that anything sounds
right: **no person has played Aftermath II or the coda, and none of their sound has been listened to.**
[AFTERMATH2_PLAYTEST_CHECKLIST.md](AFTERMATH2_PLAYTEST_CHECKLIST.md) lists what a person needs to judge.

## 1. Build

- Branch `claude/aftermath2-2026-final-coda`, from `claude/final-art-bible` at `643c345a0195d34e4c77f2d5de4af4b75f1fc264`.
- RESULTS_COMMIT_NOTE

## 2. Aftermath II through the credits, played by input

`ONLY=aftermath2 node tests/verify.mjs` plays from Aftermath I's end card (an Aftermath I save written the way Aftermath
I writes it) through all of Aftermath II, the coda and the credits, then runs the standalone checks (§3). Options:
`CAP=keep|shelter|porch` (where Aftermath I left Jamie's cap), `PICK=1|2|3` (which answer at every question, and which
Aftermath I history: how you said goodbye, how you kept in touch, where you left Jamie's BMX, whether you told Alex's
father about the shadow), `QUIETLY=1` (let every question pass in silence), `OPTIONAL=0` (skip every optional look),
`FROM=`/`TO=` (a part of it), `PLAY_ONLY=1` / `CHECKS_ONLY=1`.

RUNS_TABLE

The twenty playthrough checks, in order: Aftermath I's end card offers Aftermath II; the card and the car (August 27,
2021, late afternoon); the title over the road and driving by holding W (a car passes; Sam's text); pulling over, the
notebook (and the cap) off the seat, getting out; the old curb, your house, Sam looks up; the reunion (what you say, how
you say hello as remembered from Aftermath I, "You got tall."); up the hill with Sam beside you (he never falls more than
9 m behind); Briarwood (the corner, the bell remembered, his house, the Sunday print); Jamie's (the walk back: "You still
ride?", the missed shot and the ball returned; his mother moved, the bike, the chair, the kid's bike, the cap, Biscuit);
Summerfield and the Kowalskis'; the streetlight (sit, his mom, a choice, the chain, the notebook held and its pages turned
by Q/E: the names, RULE 6, what you looked at saved); the new houses (Lily, the seam, Mrs. Pruitt); the oak in the golden
light (the optional looks, the print, under it); the two kids ("See you tomorrow!", then "We used to do that." / "Yeah." /
"Feels like it was yesterday." in that order); the streetlights, rule four, look back, "You coming?", the card; the coda
(the Prologue ride, its date line and melody, then the pullback); the pullback is gradual (the screen fills the view at
its start; the camera backs away over his shoulder); the room (notebook, strip, cap when kept; "I still remember."; LAST
LIGHT on the monitor); the credits (not rushed, the dedication's exact words, the CC BY attribution, the end screen,
completion saved); and the end screen's "Watch the credits again" (Skip goes to the dedication, a second skip right away
does not skip it unseen, a third goes past it).

**Time.** The bot walks the shortest way and takes every prompt at once, so a person will take longer. Its times, in
minutes of play: SEGMENT_TIMES. The coda is about 1 min 50 s, the credits about 1 min 25 s (roll 66 s at 960 × 540, then
the dedication).

## 3. Standalone checks

Run after every full run (and alone with `CHECKS_ONLY=1`):

| Check | Result |
|---|---|
| Every DEV scene with a jump (Aftermath II's 17 and the coda's 7, including the cap and goodbye variants) starts in its own phase, date and light, on its feet, Sam where he should be, no Jamie, no hunter, no script error. The 2026 room, line and title, entered directly, show **August 21, 2026** (regression: Aftermath II's clock used to write 2021 over it). Standing on the end of the street in 2021 and looking down where the Prologue's ending draws its chalk: no 2011 chalk riders, no AR, no other bike, no fifth rider (regression: the ending's logic was still live). | passed |
| Continue from an Aftermath II checkpoint (*Jamie's House, cap given at the shelter*): the title's own Continue offers it ("Jamie's house") and restores the save (the cap still hers) | passed |
| Continue after finishing Aftermath II offers the coda ("One more lap"); the credits by DEV mark the game complete (`lastlight.complete`) | passed |
| After the end, the earlier chapters still start (the Prologue, Chapter Eight, Aftermath I) and Aftermath II's town is put away | passed |

Both regression assertions were confirmed to fail on the code before their fixes.

## 4. The earlier chapters (regression)

Each earlier chapter's own suite on this branch (exit 0 = every check passed).

REGRESSION_TABLE

## 5. Captures (real WebGL renderer, software)

`tests/aftermath2-shots.mjs` with `tests/aftermath2-shot-defs.mjs`: headless Chromium, ANGLE SwiftShader (software
WebGL, no GPU), 960 × 540, the real game page and renderer (`dist/index.html?qa`), each shot a fresh page. Output in
`docs/qa/aftermath2/` (JPEG) with `shots.json` (phase, coda stage, caption, draw calls, triangles per frame).
CAPTURE_SUMMARY

| The brief's list | Frames |
|---|---|
| 1. Adult arrival in Oak Hollow | `drive-windshield`, `drive-seat`, `drive-mower`, `drive-parked` |
| 2. Rebuilt neighbourhood | `street-out-of-car`, `street-your-house`, `walk-hill` |
| 3. Adult Sam reunion | `street-sam-on-curb`, `reunion-standing`, `reunion-face-review`, `reunion-tall`, `walk-beside` |
| 4. Jamie's old street | `jamie-house`, `jamie-porch`, `hoop-shot`, `hoop-gutter` |
| 5. Alex's old street | `alex-corner`, `alex-house`, `alex-print` |
| 6. Reconstructed catastrophe area | `rebuilt-summerfield`, `rebuilt-kowalskis`, `rebuilt-seam`, `rebuilt-new-row`, `rebuilt-hendersons` |
| 7. The notebook | `light-sitting`, `light-notebook-names`, `light-notebook-back` |
| 8. Old oak | `oak-approach`, `oak-under`, `oak-street-back` |
| 9. Children on bicycles | `kids-riding`, `kids-stopped`, `kids-we-used-to` |
| 10. The final 2021 view | `leave-lamps`, `leave-oak-back`, `leave-end-card` |
| 11. The Prologue image on the monitor | `coda-prologue`, `coda-pull-0` (the first frame of the pullback: the screen fills the view) |
| 12. The camera revealing the computer | `coda-pull-edges`, `coda-pull-desk`, `coda-pull-shoulder` |
| 13. The 2026 room | `coda-room`, `coda-line`, `desk-wall-review`, `desk-face-review` |
| 14. The photograph and notebook | `desk-desk-review` |
| 15. Final title | `coda-title` |
| 16. Credits | `credits-roll`, `credits-dedication`, `credits-end-screen` |

"review" frames use a camera placed only to look closely; all others are the player's own view.

**What the captures found, and what changed because of them** (all fixed and re-captured):

- **The car**: the camera sat inside the seated adult body's (double-sided) shirt, and the world's sedan is a solid
  extrusion whose top is a lid across the cabin at the belt line, hiding the seats, the notebook and the cap. Now a car
  seat height puts the eyes at 1.25 m and the feet on the floor, the exterior is hidden from inside (mirrors and trim
  kept), the wheel is within reach (hands on it), and the headliner reads as cloth, not a black band.
- **2011 chalk in 2021**: the initials, sun and hopscotch at the end of the street, and the Prologue ending's chalk
  riders, were still on the asphalt ten years later; the ending's AR clue could also have shown. All hidden while 2021 is
  shown, restored exactly afterwards; regression-tested (§3).
- **Things the narration names that were not there**: Jamie's "different car in the drive" and "wreath on the red door";
  your old house's "scooter on the walk" and "hopscotch" — added. "The cold white kind" streetlights — the line dropped
  (the lamps are the world's warm ones).
- **The notebook**: the tucked Sunday print hid "BACK." in RULE 6. WRITE BACK. — moved below it; the page is held higher,
  above the captions. The cover's label carried invented words — blank again, as Aftermath I has it. Under the 2026 desk
  lamp the blue cover read white — a softer lamp.
- **The road**: thick black seams and an invented painted lane line — thin tar seams, no lane line.
- **The coda**: the page's wordmark stayed in the corner through the pullback and the room — now drawn on the monitor and
  shrinking with it. A jump straight into the room showed 2021's date — fixed (regression-tested).
- **The credits**: the dedication's first line began while the roll was still fading — it now waits for the roll.
- **The hoop**: the kid shot at a garage with no hoop, across the street from the real one, and once into a parked car's
  space — he now plays under one of the street's own garage hoops with a clear drive, and the missed shot lands where you
  are walking.
- **The children** stopped 25 m off and read small — they stop about 15 m from the oak.

## 6. Package

PACKAGE_SECTION

## 7. Not verified

- **A human playthrough**: pacing, emotional effect, clarity, whether the reunion is natural, whether the reveal is
  understood and earned (the checklist).
- **Sound**: nothing has been listened to. Everything is synthesized; the room's hush (`screen()`), the theme under the
  title and credits (`theme()`) and the kids' bell are new.
- **Real GPUs**: only software rendering; frame rate on real hardware is unmeasured. The pullback's seamless first
  frame was checked in software rendering only.
- **Pointer lock, fullscreen and real keyboard/mouse** in a real browser window: the harness sends input events; it does
  not test the browser's own pointer lock or fullscreen.
- **Continue across a real browser reload** was checked through the save and the jump Continue uses, not by reloading a
  real page.
- Adult Sam and the adult bodies are provisional derivations (A-20/A-21) awaiting the art pass.
