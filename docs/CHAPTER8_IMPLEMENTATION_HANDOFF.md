# Chapter Eight: implementation handoff

**The Night Oak Hollow Fell** — Friday 26 August 2011, 10:42 PM, to Saturday 27 August, dawn.
Branch `claude/chapter8-fullgame-story-integration` (from Astra `27ad0b6`). The story side is in
`docs/CHAPTER8_FULL_GAME_NARRATIVE_INTEGRATION.md`; test results in `docs/CHAPTER8_TEST_REPORT.md`; what the
aftermath inherits in `docs/AFTERMATH_STORY_HANDOFF.md`.

## 1. How to play it

- From the title, play Chapter Seven to its end card and choose **Chapter Eight →**; or
- **DEV** on the title → **Chapter Eight** → any of its 39 scenes (`DEV_SCENES[8]` in `dist/dev-chapters.js`); or
- after quitting mid-chapter, **Continue** returns to the last checkpoint (`LABEL8` in `dist/chapter8.js`).

There is no build step: serve the repository root over HTTP and open `dist/index.html` (the same way every
earlier chapter is played; see the README's run instructions). `?qa` exposes `window.lastLight` for tests.

Controls are the game's own: WASD / mouse to move and look, **F** to use (hold **F** where the prompt says
"Hold"), **C** to crouch, **T** for the flashlight, **Shift** to run, **Q/E** to look, **S** to put a page down,
number keys for choices. The objective panel always says what to do next.

## 2. Modules

| File | Lines | What it is |
|---|---|---|
| `dist/chapter8.js` | ~295 | The director. Phases (`c8-black` … `n8-end`), sections/aliases/labels, the chapter state `C`, task scripts (generators: `task`, `wait`, `until`, `lines`), **offers** (a thing you can look at and press or hold F on: `offer(id,label,at,{r,hold,tick,can,blocked,noise,when,once,fn})`), hazards (`hazard({at,r,warn,fatal,section,h,onFall})`: grit falls from overhead during the warning, then it comes down; fatal inside `r`), hunts (`huntStart({ids,route,at,catchTo,…})` on the complex's graphs), `fail(section)` (fade, back to that checkpoint, fail count kept), checkpoints, the clock and date line, lights pool, inventory, the end card and the save. `go(phase)` also restarts the scene clock `C.pt` (every scene's fallback timings count from when that scene began). |
| `dist/chapter8-scenes.js` | ~560 | Acts I–III (scenes 1–9): Sam's house and the four bikes, the cover, the field and MH-12, the shaft and the outer barrier, the gallery stealth, the office and the 1958 film, Danny, the flooded wing (Sam), the retrieval wing (Jamie), the corridor that moves and the room it made (Alex), the crew room reunion. Its `SCENE` table maps every section to the function that starts it, including resume points. |
| `dist/chapter8-fall.js` | ~405 | Acts IV–V (scenes 10–17): the anchor board, the breach and the escape, the surface, the Hendersons' and Jamie, the works, the final operation (gates, ports, Line Two, the plug, the hatch), the oak, the last ride. People of the street (the Hendersons, neighbours running). |
| `dist/chapter8-complex.js` | ~313 | The isolation works under the court, from one table of cells (`CELLS`) and openings (`OPENINGS`): meshes, walkability, sight lines, doors (steel leaves, a jammed door can be ducked under: `ST.duck`), the hunter's graphs, the made room, the plug, the barrier, valves, grille, levers, water. `SPOT` names every place the scenes use. |
| `dist/chapter8-ruin.js` | ~188 | The real street, ruined: material "cut" volumes patched into the merged world materials only while the chapter needs them, the holes, the Hendersons' broken house and their car, the burning house and the gas fire, the downed pole, the Summerfield heave (the road lifts, splits and takes a car), the rescue truck. `ruin.locate()` gives street coordinates even inside its room. |
| `dist/chapter8-presence.js` | ~105 | The thing itself: instanced procedural limbs (emerge, probe, strike, drag, retract), the mass behind the barrier, debris chunks, dust, and the falling-grit warning (`trickle`). |
| `dist/chapter8-props.js` | ~92 | Paper (Sam's page, the 1959 sheet over the 2009 map, Mason's slip, licence 0417, her picture, the 1991 flyer, Ruth Ann Carver's 1979 book, Procedure 7, the anchor board) and the 1958 observation film. |

Changes outside the chapter (see the narrative doc for the story side): `dist/game.js` (Chapter Eight after Chapter
Seven, seeded random numbers, `qa` exposure), `dist/chapter7.js` (its end card offers Chapter Eight; later phases
handed on through `next`), `dist/chapter6.js` (exports the Line 4 drawdown gate `DD` and the works spots `WS`),
`dist/companions.js` (`enlist`/`dismiss` for Alex), `dist/companion-brain.js` (Alex's personality),
`dist/audio.js` (13 synthesized `c8*` sounds and the fire/gas loops), `dist/dev-chapters.js` and `dist/index.html`
(DEV), `dist/creature.js` (the injured hand bones, used in Chapters Three, Four and Eight).

## 3. The flow, its checkpoints and its failures

Phases in order: `c8-black` (card) → `d8-bikes` → `d8-field` → `d8-shaft` → `e8-gallery` → `e8-danny` → `e8-sam` →
`e8-jamie` → `e8-alex` → `e8-reunion` → `f8-truth` → `f8-breach` → `g8-surface` → `g8-street` → `g8-staging` →
`n8-op` → `n8-oak` → `n8-ride` → `n8-end`.

Where you can be failed and where it sends you:

| Danger | Section you go back to |
|---|---|
| The hunter in the Line Four pipe before the barrier is down | `c8-barrier` |
| The hunter searching the construction gallery | `c8-stealth` |
| Danny at the alcoves (standing when he is beside you) | `c8-danny` |
| The hunter in the flooded wing; in the retrieval wing | `c8-wing` / `c8-retrieval` (and their door checkpoints) |
| Falling structure in the escape (the beam in the junction hall, the crane in the gallery) | `c8-escape` |
| The water heaving at gate 1; the strikes at the plug's pins; the roof at the hatch | `c8-gates` / `c8-plug` / `c8-hatch` |

Each repeated failure in the same place makes the hunter there slightly less sharp (sight range and run speed down
6–12% per failure, up to two). Every hazard shows grit and dust falling from overhead before it comes down. The
street (Jamie) and the oak (Alex) have no failure state: neither death is a "save him" prompt.

Resume points (Continue/DEV) start where they say, not at the top of their scene: `c8-made` in the room it made,
`c8-alex` at his door, `c8-garage` with the door open and Jamie gone in, `c8-jamie-death` after it, `c8-hatch` at
the ladder with the plug down.

## 4. Things a maintainer should know

- **Coordinates.** The complex is built at `CX = (-2600, 2600)`; `CM.at(name, y)` / `W(x, z, y)` give world points
  (y is absolute; floors are 0 for A/L4/S1-top, −3 for most rooms, −12 for the main chamber). The street uses
  `k.main(d, lat)` (distance along Oak Hollow Drive and lateral offset); inside the ruin use `ruin.locate()`.
- **Windows** between rooms on different floors are cut at the height of the room they are looked out of (the hall's
  long windows over the main chamber). Doors use each room's own floor.
- **Alex** is a companion only while Chapter Eight has him (`enlistAlex` / `dismissAlex`). Acts IV–V receive the
  context with a live `alex` getter; a plain object spread would freeze it.
- **Lights.** Six pooled point lights (`light(i, at, {...})`) plus the flashlight. `lightsBelow(area)` sets them for
  A, B, C, J, K, F and I (the main chamber: catwalk lamps and two big cold lamps, physically-based intensities).
- **The hunter** is its own instance (`createHunterModel`), not Chapter Seven's; the smiling creature is Chapter
  Three's model with the injured hand.
- **Save.** `lastlight.chapter8` in local storage at the end card (see the aftermath handoff).

## 5. Tests

- `ONLY=chapter8 node tests/verify.mjs` — plays the chapter by inputs from Chapter Seven's end card to Chapter
  Eight's (keys, mouse, walking real paths, holding F, crouching, turning the light off), then runs the checks
  (`runChapterEightChecks`). `PLAY_ONLY=1` skips the checks; `FROM=`/`TO=` play a stretch (`bikes`, `field`,
  `shaft`, `gallery`, `corridor`, `wing`, `retrieval`, `alex`, `reunion`, `truth`, `breach`, `surface`, `street`,
  `staging`, `op`, `oak`, `ride`); `DEBUG8=1` prints each interaction and each failure.
- `node tests/chapter8-frames.mjs` — twenty frames of the chapter in Chromium (SwiftShader), into
  `docs/qa/chapter8-the-night-oak-hollow-fell/frames/` with `frames.json`.

## 6. Known limitations (honest)

- No human has played this chapter. All play evidence is automated (see the test report).
- The sim walks with a grid route over the game's own walkability; a human will take other lines. Hazard and stealth
  timing was tuned so that the sim's routes pass; a person who stops in the wrong place under a warning will be failed,
  as intended, and it has not been tested how often that feels unfair.
- Rendering was only checked with SwiftShader (software GL) in headless Chromium. No frame-rate measurement on real
  hardware was made; none is claimed.
- Props and the Presence are built from simple procedural geometry (boxes, cylinders, instanced tubes, a sphere mass)
  in the game's existing style. The film is drawn silhouettes.
- The DEV-switching snapshot assertion in the default `tests/verify.mjs` run (`2/alex-bike`) fails identically on the
  untouched Astra commit; it is pre-existing and not caused by this work (details in the test report).
