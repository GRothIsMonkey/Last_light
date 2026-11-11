# Aftermath I — test report

**What this report can and cannot say.** Every result below comes from automated runs: the game's own code driven by
keyboard and mouse input in a headless harness (a mocked DOM and renderer around the real modules), and captures in
headless Chromium with software WebGL. They show that every beat of the chapter can be reached and finished by a
player's inputs, in every branch tried, and that the earlier chapters still pass their own suites. They do **not** show
that a scene lands, that the pacing is right, or that anything sounds right: **no person has played Aftermath I, and none
of its sound has been listened to.** `AFTERMATH1_PLAYTEST_CHECKLIST.md` lists what a person needs to judge.

## 1. Build

- Branch `claude/aftermath1-what-was-left`, base `91a446d` (the verified Chapter Eight reconstruction).
- §2–§3 (Aftermath I's four runs) are from the final code commit `a4d6403`. The earlier chapters' suites (§4) ran on
  intermediate commits of this branch (`d9c7dc6` to `a4d6403`) during which no runtime file outside `dist/aftermath1*`
  changed; the files they exercise are the same bytes as at `a4d6403`.

## 2. Aftermath I, played by input

`ONLY=aftermath1 node tests/verify.mjs` (with `FROM=`/`TO=` to play part of it, `CAP=` for the cap branch, `QUIETLY=1`
to let every choice pass in silence). Each run ends with the chapter's four standalone checks (§3).

| Run | What it plays | Result |
|---|---|---|
| **Full** (from Chapter Eight's end card) | Chapter Eight's end card → **Aftermath I →** → all 21 sections → the end card; Jamie's cap kept safe for his mother; an answer chosen at every question | **58 checks passed, 0 failed** (225 s) |
| **Silent** (`QUIETLY=1`, from the first scene) | every question left to pass in silence; the hesitant paths (you can't answer; you lean the bike by the rail; you don't go up to Alex's room; you don't tell his father; you don't look back) | **56 checks passed, 0 failed** (229 s) |
| **Cap given at the shelter** (`CAP=give-shelter`, from Jamie's mother) | the cap is hers from August 27: on the porch step beside her, at the vigil in her hands, not in your room | **50 checks passed, 0 failed** (218 s) |
| **Cap given on her porch** (`CAP=give-porch`, from the porch) | you keep it safe in August and give it to her on September 2 | **27 checks passed, 0 failed** (150 s) |

What the play checks assert, scene by scene (a check fails if the beat cannot be reached by input, if a script throws,
or if what was kept is wrong):

- **The school, Aug 27**: the card and the date; riding in; the bike into the rack (hold F); Sam's handlebars (hold F);
  the gym is a shelter (≥20 people in it); the volunteer and FOUND; people look at you and then at the doors (≥3);
  sitting down; Jamie's mother (her face crying), Reyes kneeling; the cap's branch; Alex's parents (the two mothers are
  not the same face); Sam's father ("I left your fan on"), Sam goes to him; your mother.
- **Act II**: washing (the dressing on your hand); the fan; Sam and the chain; Sunday: the record read, the four things
  laid out **in the order you chose** and read back in it; your own words written beside his; Monday: the list, the
  word you can't reach, the notebook, JAMIE written (hold F).
- **Sep 1**: the September street (Chapter Eight's ruin shown; its fires out; no red in the sky); the gate opens; walking
  with Reyes; the paint ("They're all zeros"); **you stop when he says stop** (or, in the silent run, you keep walking
  and he says it again); Sam's house; the barricade; looking at the oak, the Kesslers' ("They were at the lake"), 1052
  (its lamp off); the bikes: Jamie's stood up, Alex's bell (keep.bell), "Do it again"; the fan and the Tour; walking
  Jamie's out while Sam walks Alex's; into the truck.
- **Sep 2**: the porch (the bike where you put it: keep.told.bmx), Lily's drawing, "Was he scared?", the cap; the
  garage (the bike on its hooks; the print: keep.print; the camera with his parents), his room and his mother's question.
- **Sep 3, 6, 17**: the vigil (≥14 people; stories heard by walking among them; Sam's note at the curb; your note; his
  mother's question; you choose when to go); the gym memorial (his father's words; the shadow found on a board; telling
  his father: keep.told.shadow; a card in the box: keep.note); the chain (Sam rides over; the pedal turned backwards,
  hold F; the curb; the gum; Sam's anger; rule four as the streetlights come on).
- **October**: riding up the street (the October street; Jamie's bike still where you left it); Reyes at the fence; the
  kitchen (sitting, the letter, the move); packing (the drawer, the strip boxed, the calendar, his cap kept with you,
  tape: keep.boxed); the curb (the chain, the notebook: keep.notebook = you, rule five, the plan to call, the goodbye,
  the wave, the car); the road out (looking back measured by where the camera points; the notebook on your lap; looking
  ahead) → **the end card**, the final save (`section: aftermath1-end`, `presence: sealed`, `lost: [JAMIE, ALEX]`,
  `notebook: you`, `left: true`), and **no next chapter offered**.
- In every scene: Jamie is not visible, Chapter Seven/Eight's hunter is not visible, and nothing under the court is
  active.

## 3. Standalone checks (every run)

| Check | Result |
|---|---|
| Every DEV Aftermath I scene (23 with a jump) starts in an Aftermath I phase, on its own date, in its own light (sky state), on its feet (not in a wall), without a script error, with Jamie and the hunter absent, and with the DEV variant's cap state | passed |
| Continue: after a DEV start of *Packing Your Room (his mother has his cap)*, the title's Continue offers that checkpoint, and jumping to it restores the save (the cap still hers), not a fresh start | passed |
| The street is Chapter Eight's own ruin and town, settled (no fire); leaving the chapter (a jump to Chapter Seven) puts it all away (no September state, the ruin back to stage 0) | passed |
| The DEV end card: Aftermath I's own card, the final save, and the next-chapter button hidden | passed |

## 4. The earlier chapters (regression)

Each earlier chapter's own suite on this branch (exit 0 = every check passed). The counts match the Chapter Eight
reconstruction's report.

| Suite | Result | Wall time |
|---|---|---|
| `ONLY=chapter3` | 156 checks passed | 358 s |
| `ONLY=chapter4` | 35 checks passed | 126 s |
| `ONLY=chapter5` | 81 checks passed | 157 s |
| `ONLY=chapter6` | 80 checks passed | 204 s |
| `ONLY=chapter7` | 94 checks passed | 254 s |
| `ONLY=chapter8` (from Chapter Seven's end card) | 35 checks passed | 269 s |
| `ONLY=companions` | 8 checks passed | 44 s |
| `ONLY=dev DEV_KNOWN=2/alex-bike` (DEV starts of every chapter vs natural arrival; switching) | 327 checks passed; the one known difference reported | 441 s |
| base (`QUICK=1 DEV_KNOWN=2/alex-bike`: Prologue to Chapter Six by input, every DEV start vs natural arrival) | **818 checks passed**; the one known difference reported | 1110 s |

The known Chapter Two DEV difference (`2/alex-bike`: Alex's companion bike placed differently after switching scenes)
is the same one the Chapter Eight reconstruction reported, with the same numbers; it predates this work.

## 5. Captures

`tests/aftermath1-shots.mjs` (Chromium, SwiftShader, 960×540) with `tests/aftermath1-shot-defs.mjs` (Acts I–II),
`-defs3.mjs` (the street and the houses) and `-defs4.mjs` (the remembrances, Sam, October), into `docs/qa/aftermath1/`.
No page errors in any capture run. What they showed and what was changed because of them: `AFTERMATH1_VISUAL_REVIEW.md`.

## 6. Bugs the runs found (all fixed)

- The test cue "Probably." also matched a line of Reyes's in Act II, so the full run lost sync at the goodbye (test fix).
- The nurse's room started without resetting the gym's state when reached from Act I in one sitting; it is now a clean
  scene start like every other day change.
- Silent branch: "Go home" on Jamie's lawn was crowded out by the card table's prompt (moved down the sidewalk).
- Kitchen: the start point was inside a wall; the room's things needed to be taken by looking (nearest-prompt picked the
  shirt on the bed over the drawer); the drawer's photo strip used a stale transform (it was 432 m away).
- The memorial gym: standing up put you inside a row of chairs; you now stand up into the aisle.
- Alex's room: the camera model returns a holder object, not a group (crash on entering the room).
- The road out: the seat trailed the car by a frame; the car model is solid inside (see the visual review).

## 7. Timing (the test player)

Game minutes per section as the test player plays them (it takes the shortest path and does a few optional things):
arrive 1.46 · gym 1.86 · Jamie's mother 2.62 · Alex's parents 2.82 · families 2.39 · nurse's room 3.02 · record 6.60 · the list 2.26 · behind the fence 5.75 · the bikes 5.41 · Jamie's porch 3.14 · Alex's driveway 2.34 · Jamie's lawn 2.21 · Alex's pictures 3.05 · the chain 3.60 · October 2.76 · the letter 1.42 · packing 0.80 · goodbye 2.67 · the road out 0.91 — about 56 game minutes in all. A person reading the captions and looking around will take longer; the brief's 35–50 minutes is a human
estimate and has not been measured.

## 8. Package and hosted build

- **Offline package**: `PLAYTEST_CHAPTER=9 node tools/package-playtest.mjs <folder>`, built from `a4d6403` (clean tree).
  One file, `Last-Light-Aftermath1-Playtest.html` (10,225,551 bytes, SHA-256
  `3d2cb2e1b33020ee047178904de9dc22406fb0db4ad53e457f5459b7e33e486a`), plus `START-HERE.txt`, the licences and
  `manifest.json` (branch, commit, per-file source hashes). Zipped: `Last-Light-Aftermath1-Playtest.zip` (4,368,036
  bytes, SHA-256 `cc7b6651ec315c56ee3abc1661ebd7cae735122d2c419ba48bd30ab03e1201d8`).
  `tests/aftermath1-package-browser.mjs` opened it from disk in headless Chromium: **6 of 6 checks passed** (Aftermath I entered through the real DEV controls; WebGL renders; eleven later scenes start from their jumps; the end card is Aftermath I's and offers nothing after it; no HTTP(S) requests; no JavaScript errors). Report: `docs/qa/aftermath1/package-browser-report.json` (with screenshots).
- **Hosted build**: a private claude.ai artifact, https://claude.ai/artifact/WJvexwNCLHKACfMYZWfx66 (only its owner can open it until it is shared). The same `dist/` files as `a4d6403`, with the one host-only change the earlier hosted builds also had (the creature model served as base64 text, `assets/creature/creature.glb.txt`, read by a host copy of `creature.js`) and the page title "Last Light Aftermath I". The 16 files Aftermath I added or changed were uploaded; the other 122 were copied server-side from Chapter Eight's hosted build (https://claude.ai/artifact/2iBMpwKT8x3id9KNhkuchc), whose files are byte-identical to this branch's base. Checked before publishing by serving that exact set locally in headless Chromium: **8 of 8 checks passed** (title; DEV enters Aftermath I; WebGL renders; six later scenes start; the creature loads from its base64 copy; no requests outside the host; no missing files; no JavaScript errors). Not played through by a person.

## 9. Not verified

- **A human playthrough** (pacing, emotional effect, clarity, whether choices feel like yours).
- **Sound**: nothing has been listened to. The crowd murmur, machinery, bell, freewheel, tape and theme are synthesized
  and new; the crying and breathing are Chapter Eight's synthesized cues used more sparingly.
- **Real GPUs**: only software rendering was used for the captures; frame rate on real hardware is unmeasured.
- **Continue across a real browser reload** was checked through the save and the jump Continue uses, not by reloading a
  real page.
