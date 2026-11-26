# Prologue environment repair & supporting cast — report

**Branch** `claude/prologue-environment-repair-supporting-cast`, started from `claude/prologue-neighborhood-details-benchmark` at
**`716fc6bfacae1166f45826905475b7cb1d2409e0`** (that branch's verified remote head; it and the five earlier benchmark branches
are untouched). Final commit: §15. Nothing is merged into `main`. Without `?envrepair` and `?supportcast` the game is unchanged
(proved vertex by vertex and frame by frame, §11). **Awaiting the creative director's review — nothing here is approved;
A-22 stays open.**

**Evidence and its limits.** Every in-game image and recording is the shipped renderer under **software WebGL** (Chromium +
ANGLE SwiftShader, **not a GPU**) at 1600 × 900, with all eight flags on (`?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast`).
A before/after pair is **one camera and one frame**: only the benchmark's own key changes between the two images (`'` for the
repairs, `;` for the cast). Recordings are rendered frame by frame at a fixed game step and play back in real time. Images
and films named `--BLENDER-RENDER` are offline Cycles renders of the editable .blend files, **not the game**. Jamie in every
in-game image is **the existing procedural Jamie, a placeholder**, not Astra's Phase 1B character (not integrated here).
Every performance number is a software-renderer or file number; no real-GPU frame time has been measured.

<!-- RESULT:start -->
<!-- RESULT:end -->

## 1. Source of truth and parallel work

| | |
|---|---|
| Start | `claude/prologue-neighborhood-details-benchmark` @ `716fc6b` (the six benchmarks: bikes, houses, vegetation, pavement, street props, details) |
| This branch | `claude/prologue-environment-repair-supporting-cast` (new) |
| Astra's work, read only | `codex/astra-phase1b-protagonist-animation` @ `66e3f4b` (rig and export conventions: bone names, `instantiate()`, ARKit keys); `codex/astra-phase1a-jamie-sketchfab-redesign` @ `42340fe` (Jamie's design report; it holds no .blend); Jamie's editable Phase 1A source `chr.jamie.a12.blend` as carried on the 1B branch (git blob `67490e2027801ec08190307cd8580392842eeea8`), opened read-only for the lineup only |
| Not touched | the four boys' models, controllers and animations; `friends.js`, `cast.js`, `rig.js`, `faces.js`, `astra-anatomy.js` (Astra's `player-1b.js` is not on this branch); Chapter Seven's and Aftermath I's mother; the old oak and its tire swing; the departure sequence; any dialogue, caption, voice or sound |

Read before changing anything: the two previous reports, the approval register, the character canon, the environment style
guide, the roadmap, the visual-consistency audit, and `friends.js`, `cast.js`, `ambient.js`, `rig.js`, `faces.js`,
`adult-art.js`, `adult-sculpt.js`, `people.js`, `chapter7-cast.js`, the Aftermath I cast, the six benchmarks' runtimes and the
asset pipeline. What was found that matters here:

- Jamie's mother in the Prologue is `createPerson(CAST.mom)`: the child rig × 1.13 (≈ 1.73 m) with the rig's primitive head;
  from Chapter Seven she is a different person derived from Alex's mother (canon §4.3, A-22).
- Her scene is `friends.js updateMom`: active at ride distance 681 (`FORMATION.jamie.leaveAt − 15`); she starts **2.3 m inside**
  the front wall (`door.inside`); the door opens in 0.6 s while she stands there; she walks out 0.9 m past the threshold
  (`door.outside`) and 0.55 m along; on the porch she turns to the street, looks at Jamie and makes the small wave (`addWave`
  weight `smooth(t/.7)·(1−smooth((t−1.6)/.8))·0.45`); when Jamie is inside she walks back to `door.inside`, is hidden, and
  the door closes 0.15 s later with its slam. She has **no line** (`story.js` has only Jamie's "That's my mom. I gotta go.").
- The hoop kid is `createPerson(CAST.kid)` in `ambient.js updateKid`: dribble (0.52 s bounces), shot (ball released at 0.35 s,
  rim at 1.4 s), the ball back off the rim in 1.3 s, and while the boys pass (`distance` within 26 m before to 6 m after him)
  he holds the ball at his hip and looks at them.
- The street props' chain link (`streetprops-assets.js cutoutMaterial`) uses the plain 0.5 alpha test; the details kit's
  (`details-assets.js`) adds the coverage-preserving dither (the details report's own deferred item).
- Briarwood creek's brush is `vegetation.js shrub` (two green balls), its reeds are flat three-triangle blades, its mud and wet
  patches 9-sided discs and its algae flattened balls (`creek.js`); none is recorded by `?vegetation`, whose tree record also
  stops 95 m from Oak Hollow, before most of the creek's trees.

<!-- BODY:start -->
<!-- BODY:end -->
