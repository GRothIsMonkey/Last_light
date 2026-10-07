# Last Light — Chapter Three: the creature, the chase, the lure (handoff for Astra)

The climax of Chapter Three rebuilt around a real creature model, a real chase, and the Alex-like figure as a lure;
the day's conversations made short and free; the temporary DEV selector made a Chapter → Scene picker. Built on the
horror escalation; where this document and
[ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md](ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md) disagree about the night
past the first reveal, the chase, the ending or the day's conversations, this one describes the game.

## Source and branch

| | |
|---|---|
| Source branch | `claude/chapter3-horror-escalation` (not modified) |
| Source SHA | `e575f069c2f1bec4641253632a3d670ce68c45e3` |
| Branch | `claude/chapter3-creature-chase` |
| Final SHA | the branch head (see the final report / `git log`) |
| History | Linear on top of the source SHA. No merge. `main`, `claude/chapter3-horror-escalation`, `claude/chapter3-horror-rebuild`, `claude/chapter3-horror-investigation` and `codex/astra-chapter2-final-polish` are untouched. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight` (`jump(section)`, `devScene(n,id)`).

## 1. The creature asset

| | |
|---|---|
| Source (untouched, not loaded) | `assets/source/creature/smily_horror_monster.glb` — 12,943,960 bytes, SHA-256 `85c2969d…0529` |
| Runtime copy (loaded) | `dist/assets/creature/creature.glb` — 2,583,500 bytes |
| How the copy was made | `tools/creature/repack_glb.py` |
| Attribution | "Smily horror monster" (https://skfb.ly/6W6ut) by Bento, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Recorded in [THIRD_PARTY_ASSETS.md](THIRD_PARTY_ASSETS.md) with "Modified/optimized for use in Last Light". The embedded `asset.extras` (title, author, license, source) are kept in both files. |

**Inspection (before use).** glTF 2.0 binary from Sketchfab (generator 16.52.0). One skinned mesh, one primitive:
13,205 vertices, **23,820 triangles**, 32-bit indices; positions, normals, tangents, two UV sets, joints, weights.
One double-sided PBR material ("Material.001", metalness 0) with base colour, occlusion/roughness/metalness and normal
textures, three embedded 2048² PNGs (11.5 MB). 55 nodes (Sketchfab root matrices, an FBX −90° X rotation, an armature at
scale 100); **one skin of 46 joints** (spine, neck, head, jaw, face, arms with full fingers, legs, feet, toes). **One
animation**, "Armature|ArmatureAction": 3.25 s, linear, 53 channels, an **idle** (jaw, hands, fingers, a little arm
movement); the body does not move and there is no root motion — **no walk, run or crawl cycle exists**. Modelled in
centimetres, crouched on all fours (head about 0.75 m up at its own scale), facing about +Z turned ~11°. Visually: a
pale, thin, long-armed humanoid with a wide red grin of teeth and hollow eyes. It was not redesigned.

**Modifications (runtime copy only):** textures re-encoded as JPEG (base colour 2048², ORM and normal 1024²): 11.5 MB of
textures become 1.2 MB. Geometry (not decimated), skin, animation and material are unchanged. A note was added to
`asset.extras.lastLightRuntime`.

**Loading.** `dist/creature-asset.js` is a small GLB reader for exactly what the file uses; it throws on anything else
(no silent guessing). The skinned mesh is bound with an identity bind matrix, as glTF requires. The file is loaded in the
background when the game starts (`fetch`; in the simulation, `node:fs`). If it fails to load, the chapter still runs (the
creature beats play their lines and cues; it is simply not drawn) and `lastLight.chapter3.creature.error` says why.

## 2. The creature controller and animation (`dist/creature.js`)

- **Placement**: turned to face exactly along its heading, scaled from centimetres to metres × 1.35 (about 1.3 m long and
  1.3 m to the top of the shoulders crouched), its lowest point on the ground at the group's origin.
- **Animation, on the real skeleton**: every frame the bones go back to their rest pose, the **idle clip** plays on top
  (jaw, fingers: kept alive), then the limbs, spine and head are turned procedurally:
  - **gait**: a four-limbed bounding scramble whose cadence follows its speed (0.9 + 0.34 × speed cycles/s); arms swing
    about the body's side axis, legs half a cycle later; elbows and knees fold as the limb comes forward; the body pitches
    and bobs with each bound, lower and longer the faster it goes;
  - **rear / claw**: up on its hind legs, arms striking one after the other (at the gate; when you stand still; half
    risen at the treeline);
  - **crouch**: low and still, the head tilting slowly (at the culvert lip, at the mouth);
  - **look**: the head and neck turn to you (within what a neck can do).
- **No floating, no sliding, no T-pose**: a ground clamp lifts the body if any hand or foot would pass below its resting
  height; the speed driving the gait is the speed it actually moves over the ground (measured in the chase: median error
  0.004 m/s); it is placed on the drain floor every frame (measured float 0.000 m); it is only ever drawn once loaded
  and posed.
- **Collision**: two circles along the body (r 0.42 and 0.38). Never the mesh. They are part of `blockers()` (so you and
  Jamie and Sam stop against it), and the chase never brings it within 4.6 m of you.
- **Catch light**: like the boy and the old bike, a little more of its own colour where a beam lands on it far off.
- **Sound hooks** (placeholders): a footfall/splash per bound (`move` in water, `step` on dry concrete), `impact` for the
  gate and the culvert, all counted in `state.chapter3.crKinds`.

## 3. The night, past the first reveal (what a muted player sees)

1. **The first reveal** (unchanged, escalation §5): at the end of their lights, a boy in Alex's clothes; he waits until
   you have seen him; "…Alex?"; he turns and walks round the bend. Checkpoint `c3-alex-lure`.
2. **Follow him.** Jamie: "Alex! ALEX! Wait!" — Sam: "Jamie— wait for us!" Past the bend, nobody; a wet print on the
   ledge, a hanging cable still swinging (optional lines if you are close or look).
3. **The lure, again** (`lure-wait`): farther in, at the junction, standing by the black side culvert, **his back to
   them**. Seen when you look (or by 254 m, or when Jamie is there): "There!" "ALEX! It's us! It's Jamie!" He does not
   answer. He **walks to the culvert, climbs up over its sill and goes in** (`lure-walk`, `lure-step`, `lure-in`); gone.
   From inside, his voice: "Jamie?" (captioned FROM THE CULVERT). Jamie: "Alex? …Alex, come out. It's okay."
   Near the culvert you walk slower and slower (nobody walks up to that), so you cannot reach it.
4. **The creature** (checkpoint `c3-creature-reveal`): it comes up out of the dark of the culvert — where nobody down the
   tunnel can see into it — to the **lip**, head and arms out over the sill, and **waits there until you have seen it**:
   its head in front of you and nothing in between, for 0.4 s. Never a turned camera. If you have not: Sam "Jamie." (2.5
   s), "Jamie. The pipe. Look at the pipe." (6 s), Jamie "Something's in there." (12 s), "The pipe. On the left."; if
   you are standing so far back that the lip cannot be seen at all (the approach tunnel is narrower than the junction),
   Jamie calls you up: "Come here. Look— in the pipe." After 40 s unseen it comes anyway (and they saw it). Seen: both
   recoil, both lights on it; "…That's not—" "That's not Alex." It creeps to the edge (1 s), **drops into the water**
   (3.8 s after being seen), turns to them. Sam: "RUN!" Jamie: "GO! GO!" The boy and the creature are **never on screen
   together** (checked every frame of every test).
5. **The run** (checkpoint `c3-creature-chase`), §4.
6. **The road** (checkpoint `c3-road-escape`): on the bikes, fast. If you look back over your shoulder for it, when you
   face front again it is at the edge of the trees **ahead**, half risen at the side of the road you are about to ride
   past, about 20 m off (placed only while you were looking back); then gone. Farther up, the **Alex-like boy** standing in the road ahead (escalation
   §7): "No— no no no—" "Don't stop. DON'T STOP." He steps off into the trees; nobody stops. The creature is never shown
   with him.
7. **The end** (checkpoint `chapter3-end`): the streetlight. Sam: "That wasn't Alex." Jamie: "…I know." Sam: "Then what
   did we follow?" Jamie does not answer. The end card. The creature is never named.

## 4. The chase (`chapter3.js`: `run`, `updateChase`, `crChase`)

A story sprint, as before (escape speed 5.25 m/s, the view 7° wider, no stamina to lose; W runs you out whichever way you
look). Behind you, the creature, moved along the drain's own centre line by an **authored controller**: it keeps a
distance it chooses behind you, closing fast when it is farther (up to its stage's top speed), never nearer. Stages:

| Stage | Where (drain s) | What | Distance behind you |
|---|---|---|---|
| far | 279 → 211 | it turns from the culvert and comes; Sam: "It's coming! IT'S COMING!" (his light swings back onto it; a "Mouse: Look back" hint if you never look) | the gap at "RUN!", 13–21 m (first seen at 18.9–25.4 m in the tests) |
| lost | ≤ 211 | round the second bend: the moment nobody can see it, it is not there. "Where is it? WHERE IS IT?" "Just GO!" Jamie goes down and gets up (≤ 198). | — (only splashes behind) |
| side | ≤ 185 | **out of a low hole in the wall behind you** (194 m, left; it starts inside the wall, out of sight), crawls out, turns; "It came out of the wall— it's behind us!" Water bursts from the side pipe (141). | out of the wall at ~9 m, chasing at 12.5 (seen at 12.1–14.8 m) |
| near | ≤ 96 | the old bike from the oak lying across the way out ("WHAT—" "That's the bike— that's the BIKE—"); vault it, jump it or veer round it; then it is right behind you: "It's RIGHT THERE!" | 8.5 (seen at 8.3–10.4 m; closest while running 6.3–8.3 m) |
| gate | 74 | the old **maintenance gate** at the first bend, open on the way in. Whoever is through first (Jamie, or Sam) waits at it — "THROUGH! GET THROUGH!" — you through, and it is slammed. It hits the bars and claws at them (6 blows, never nearer than 1.2 m back from the bars): "It's at the gate—" "It won't hold! GO! GO!" | held **3.2 s** (or until you are 28 m off), then it bursts the leaves open |
| after | 74 → 9 | the box straight; the way out pale ahead; "The bikes! GET TO THE BIKES!" | 16 |
| mouth | ≤ 9 | it stops low in the dark just inside the mouth and watches; it never comes out | — |

- **It never touches anyone.** Stop dead and it comes on, slower, to about 4.6 m and rears up, and comes no closer
  (measured 4.6 m standing still; 6.3 m was the closest while running in 24 randomized runs).
- **No visible teleports.** It is only ever repositioned while out of view (hidden round the bend, inside the wall, deep
  in the culvert, at the treeline while you look back); a per-frame watch in the tests counts every jump of more than
  1.2 m while it is in view: **0**.
- If the gate cannot be shut in time (you stood in front of it until it was already too close), it is left open and the
  chase goes on without the beat; out either way.
- Sound: its footfalls in the water each bound, its impacts at the gate and the culvert, the gate's clangs, splashes
  behind you while it is out of sight; voices and yells are the companions' lines.
- **Duration**: 52.8 s in the scripted walkthrough (from "RUN!" to the bike; 56 s in Chromium); 56–78 s across 24 randomized runs (looking
  back, stopping, weaving); limits checked: 45–90 s.

## 5. The day: shorter, freer conversations

Played directly in the simulation (only what each version needs), the day from Chapter Three's start to "Go home" went
from **554 s to 306 s (−248 s, −45%)**:

| Beat | Before | Now | What changed |
|---|---|---|---|
| The corner | 26.7 s | 15.3 s | four lines cut; the same question ("Maybe yesterday wasn't the first time." "His mom would know.") |
| His mom | 50.4 s of talk; she waited 7 s | ~30 s; she speaks first (2.5 s) | the same facts: he kept asking about a bike bell at night, Thursday to Saturday; "Go on up to his room" |
| His room → the phone | 29.7 s | ~3–11 s | they talk while you look around (no lock); the phone is ready as soon as it is noticed; the helmet lines when you look at it (or after the recording) |
| The phone | 99.3 s, five recordings, each an F, camera locked | ~38 s, one F | it opens on the **last recording, the one that matters**; the four ordinary ones are there afterwards ("Play an older recording"), optional, nothing held |
| The window | 24.3 s, camera locked | ~14 s, no lock | "Mr. Okafor's up all night." |
| The neighbours | 157.5 s (ask two, then the nudge, then Mr. Okafor) | ~37 s | one useful person: **Mr. Okafor** (the bell late at night, the gate at the end of Briarwood, the old city road down to the big storm drain, "stay off it"); the others a line each if asked |
| The plan for tonight | 37.8 s | ~31 s | two lines cut; "We have to come back tonight." "Eleven. The corner." kept |

Kept: Alex heard the bell at night; the road and the drain exist; they come back that night. The whole chapter,
scripted, now takes 19.1 minutes of game time (escalation: 23.7).

## 6. DEV Chapter → Scene selector (TEMPORARY)

See [DEV_CHAPTER_SELECTOR.md](DEV_CHAPTER_SELECTOR.md) ("On claude/chapter3-creature-chase") for the full list of 58
scenes, how each starts, the state-equivalence design and the results. In short: a two-step panel on the title (chapter,
scene, START SCENE), marked DEV · PLAYTEST · TEMPORARY; each scene is one of the game's own ways in (a chapter hand-over,
the QA/Continue checkpoint initializer, or the prologue's own warp and ride) plus generated history, after clearing
everything transient; every scene starts shortly before its event. Natural vs DEV: **46 scenes compared, 0
differences**; switching in one session: **0 leaks**. Normal Start, Continue, Start over and the chapter hand-overs are
unchanged.

## 7. Checkpoints and QA jumps

Checkpoints (silent; Continue): `chapter3-start`, `c3-alex-house`, `alex-bedroom`, `phone-recording`,
`neighbor-investigation`, `c3-road-day`, `night-start`, `c3-road-night`, `c3-tunnel-entrance`, **`c3-tunnel-deep`**,
**`c3-old-bike`**, **`c3-alex-lure`**, **`c3-creature-reveal`**, **`c3-creature-chase`**, **`c3-road-escape`**,
**`chapter3-end`**. Older saves (`c3-figure`, `c3-voice`, `c3-escape`) still continue.

QA jumps (34, in story order): `chapter3-start`, `c3-alex-house`, `alex-bedroom`, `recording`, `neighbors`,
`c3-road-day`, `night-start`, `c3-road-night`, `c3-forest-deep`, `c3-tunnel-entrance`, `c3-tunnel-inside`,
`c3-tunnel-deep`, `c3-evidence`, `c3-first-bell`, `c3-alex-item`, `c3-old-bike`, `c3-broken-bell`, `c3-bike-gone`,
`c3-figure-reveal`, `c3-follow-alex`, `c3-second-sighting`, **`c3-creature-reveal`** (the lure walking to the culvert),
**`c3-creature-advance`** (it at the lip, just seen), **`c3-creature-chase-start`** (a moment before it lands: RUN),
**`c3-creature-far`**, `c3-creature-side`, `c3-bike-block`, **`c3-creature-near`**, **`c3-creature-barrier`** (at the
gate, Jamie holding it), **`c3-tunnel-exit`**, **`c3-bike-remount`**, **`c3-road-escape`**, **`c3-final-lure`**,
**`chapter3-end`**. The escalation's names are aliases (`c3-after-figure`, `c3-voice-behind`, `c3-close-bell`,
`c3-run-start`, `c3-pursuit-far`, `c3-pursuit-near`, `c3-road-pursuit`, `c3-road-figure`, …); no alias collides with a
section. Every jump sets the flags of the chapter's earlier beats (checked against a natural playthrough).

## 8. Tests

See [TEST_REPORT.md](TEST_REPORT.md). Simulation (`npm test`): Chapters 0–2 regression; Chapter Three played with inputs
three times in one session; every jump, checkpoint, Continue and Start over (creature, gate, colliders cleared); the boy
from four facings and randomized; **the creature at the culvert from forward, left, right, behind, with the light 16°
off it, never looked at, and 14 randomized**; the chase perceived (far, side, near, standing still, the gate, the gate
with you stalling first, the bike in the way, the treeline glimpse); its body through a chase (grounding, foot speed,
heading, gait, lift, no jumps); muted reactions and captions; audio hooks; 24 randomized runs, 12 road rides, 12 drain
walks, 10 road-figure rides; the DEV selector (58 scenes, 46 natural comparisons, switching). Browser (Chromium,
SwiftShader): the whole chapter played muted with no QA jump and a capture at each beat; every jump; Continue; captions;
audio hooks; the DEV panel with real clicks, scene comparisons, switching via the pause menu, and Chapter Three played
from the DEV start.

## 9. Performance (SwiftShader; no real-GPU frame rate measured)

- Static world: **2,514,058 triangles / 1,131 merged meshes** (unchanged; the soft target is ~6 M / ~2,000).
- **The creature**: one skinned mesh, **23,820 triangles**, one draw (plus its shadow), drawn only while it is shown
  (the reveal, the chase, the mouth, the treeline); never decimated. Its runtime file is 2.6 MB (textures 1.2 MB).
- **The gate**: 6 meshes, 468 triangles, shown at night near and in the drain.
- Deep in the drain only the tunnel's 69 merged meshes are drawn (the creature and the gate are separate objects); the
  far plane drops to 150 m and the sky is not drawn. Per-frame counts for each capture are in
  `docs/qa/chapter3-creature/chapter3-browser-report.json` (summary in the test report).

## 10. Known limitations

- **The creature's locomotion is procedural** on the asset's real skeleton (the file has only an idle). It reads well
  at chase distance and in the dark; up close in good light the gait is simple (no IK foot planting; the ground clamp
  lifts the body rather than bending the limb).
- It moves only along the drain's centre line with a small sideways drift; it does not climb walls or go round you.
- It comes out of the 194 m side opening by passing through the opening's black plane (the openings have no depth
  geometry); the opening was enlarged to 1.4 × 1.4 m so it fits.
- The treeline glimpse needs you to look back over your shoulder on the road (about 105° is as far as you can turn on
  the bike); without that there is none (it is optional).
- **Audio is placeholder and deferred**: hooks only (its movement, impacts, the gate, the culvert voice reuse the
  existing synthesized placeholders); no new voices, no heartbeat tuning, no offline or HRTF renders were made; nobody
  has listened.
- SwiftShader only. No real-GPU frame rate has been measured.

## 11. What Astra should polish

- A proper crawl/run cycle (or IK foot planting) for the creature, and a rear/claw animation, keeping the same
  controller states (`hidden`, `emerge`, `reveal`, `creep`, `drop`, `turn`, `chase`, `side-out`, `gate`, `watch`,
  `tree`) and the measured distances.
- Real audio for it: wet footfalls, breath, the gate (steel), the culvert voice (it is meant to be uncertain whose).
- Lighting/staging of the culvert lip and the gate; the side opening's depth.
- The lure's climb onto the sill (now a simple rise).
- Keep: the reveal gate on being seen, the chase distances, "never on screen with him", the unnamed creature, the
  ending lines.
