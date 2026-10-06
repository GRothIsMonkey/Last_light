# Last Light — Chapter Three horror escalation (handoff for Astra)

A **structural horror pass** on the deep drain, the boy, the pursuit and the escape. It is not an art pass:
everything new is plain procedural geometry and flat colours, built so that it reads in the dark and with
the sound off. The day investigation, the access road, the outfall, the companions, captions, tension,
checkpoints and the DEV selector are kept from the rebuild
([ASTRA_CHAPTER3_REBUILD_HANDOFF.md](ASTRA_CHAPTER3_REBUILD_HANDOFF.md)). Where the two documents
disagree about the drain, the figure or the escape, this one describes the game.

## Source and branch

| | |
|---|---|
| Source branch | `claude/chapter3-horror-rebuild` (not modified) |
| Source SHA | `26304a9dbc30ce66dcdc0a5e65f4082fc53a55e0` |
| Escalation branch | `claude/chapter3-horror-escalation` |
| Final SHA | the branch head (runtime `43b71e6`; later commits are tests, QA evidence and documentation) |
| History | Linear on top of the source SHA. No rebase, no merge to `main`. `claude/chapter3-horror-investigation` and `codex/astra-chapter2-final-polish` are untouched. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight`; `lastLight.jump(section)` starts at any
QA section (§9). The title's temporary **DEV** buttons start any chapter (Chapter Three included) exactly as if
it had been reached by playing.

## 0. The human playtest this answers

Played muted on the rebuild: "better but not great"; the run was "basically jogging out of the tunnel";
almost nothing happened during the escape; the old bike was somewhat creepy; **the figure was never seen**;
the player never wanted to leave; nothing was scary; the big tunnel was not ominous.

So, in this pass:

- the drain closes in, past the first bend, to a low wet box (§2);
- something of Alex's that the player has *seen* this morning is found down there, and Sam wants out (§3);
- the bike is kept and made stronger: found by the light, a dead bell, gone, then impossibly ahead (§4);
- the boy cannot be missed: everything stops until you have actually looked at him (§5);
- the run is a real escape, with something happening every few seconds (§6);
- the ride out has its own beat: him, standing in the road ahead (§7).

## 1. The night, beat by beat (what a muted player sees)

In the order a player meets them (durations: [TEST_REPORT.md](TEST_REPORT.md)).

| Beat | What is on screen |
|---|---|
| Mouth → first bend | The big portal, the outfall light behind you. Nothing happens for the first stretch. Round the bend the way out is gone ("I can't see the way out anymore."). The ceiling comes down. |
| Footprints, a knock, a bell | Small prints and one tire line in the silt; a knock up a shaft (both look up); one bell far ahead (both stop, both lights go down the tunnel). |
| **His helmet** | Upside down in the silt by the wall, deep in: red, a white stripe, his number. Jamie goes to it and crouches; Sam backs off and turns to face the way out. "…That's his helmet." "That was on his desk. This morning." "We need to tell somebody. Right now." "He was here. Tonight." "Jamie. That's why." "Just to the end. Then we go." |
| **The bike** | At the edge of the light, from about 15 m: the bike from the oak, upright against the wall. "That's the bike. From the oak." "I see it. I see it this time." F: look at it; F: try the bell. The lever barely moves: a dry click, no ring. After a silence a clear bell, farther in. |
| The deep box | Lower still, ankle-deep water, a dry ledge along one wall, pipes overhead, black drains in the walls. "It's getting smaller." |
| **The bike is gone** | Well past it, it is no longer where it was. Nobody saw it go (it is only taken while nobody is looking at that spot). "…Where's the bike?" "It was right there." "Don't. Just— keep going." |
| **The boy** | Jamie stops dead, then Sam: either side of you, both lights down the tunnel. At the end of them, about 22 m (73 ft) away, a boy Alex's size, in his clothes, facing them. He waits until you have looked at him. "…Alex?" He turns, slowly (about two seconds), and walks round the bend like anyone would. |
| Round the bend | Nobody. Another long stretch with nowhere to go. "He was right here." "There's nobody down here." … "There's nowhere to go." A cable still swinging, ripples, a leaf turning in the water. Then a wet footprint on dry concrete: "It's wet." A long pause (no event for well over ten seconds). |
| **Someone crosses** | Ahead, from one black side drain to the other: a person, clearly, gone in a second. Both recoil; Jamie's light follows him, Sam's stays on where he went. "Somebody just—" "I saw." "…Alex?" |
| Voices | "Jamie?" from that drain ahead (Jamie looks, takes a step toward it; Sam looks). Then "Guys?" from behind them, the way out: Sam whips round, Jamie turns hard, both lights snap back. |
| Search, then the bell | They search behind them with their lights (Jamie points back down the tunnel). Nothing. They draw together. A long wait. The bell, right beside them. Both recoil from it. "RUN!" |
| **RUN** | See §6. |
| **The ride out** | See §7. |
| The street | The first streetlight, the houses, Briarwood. They slow only once they are under the light. "That was him." "No." "You saw him." "…I know." End card. |

## 2. The drain: large → enclosed → oppressive → wrong (`dist/drain.js`, data in `layout.js` `DRAIN`)

All of it is one physical tunnel, 286 m from the portal, with no changing geometry and no loops. Sections
(`DRAIN.sections`, width × height):

| s (m) | Section | Size | Character |
|---|---|---|---|
| 0–72 | mouth, first box | 4.6 × 3.6 m | The big portal; a raised walkway along one wall (24–72); the entrance light behind you. |
| 72–94 | first bend | 4.4 × 3.3 m | The way out leaves your sight. |
| 94–150 | old | 3.7 × 2.7 m (≈ 8.9 ft) | Older concrete, flood lines, cracks and roots, the first black side drains (108 round, 129.5 a low box), a rusted ladder up a shaft (121), the first water across the floor, the side pipe (136) that bursts during the run. |
| 150–226 | deep | 3.1 × 2.3 m (≈ 7.5 ft) | Ankle-deep water across the floor; a narrow dry ledge (0.55 m wide, 0.24 m up) along the right wall, broken for a few metres near s = 197; spalled concrete with exposed rebar; brackets, conduit and two ceiling pipes; a ladder up to a sealed hatch (187), a black square of nothing; side openings (176 high round, 194 low box); debris; stencilled municipal markings. |
| 226–286 | far, junction | 3.2 × 2.4 m, then 5.2 × 3.5 m | Past the bend where he went: the long stretch with nowhere to go, the two side drains he crosses between, the junction with its side culvert. |

The water is a surface of its own (`Dr.waterAt`) over a recessed floor (`Dr.floorAt(s,t,{ledge})`): dark and
slightly glossy, so your hotspot lies on it as a wet sheen and the rest of it stays dark. Side drains and pipes are
open holes into darkness with nothing behind them to light. Past your beam is unlit concrete. The walkways and
ledge are walkable; the water is only centimetres deep and never slows you.

**The beam in the drain** (`game.js` `foot.exposure`, `on-foot.js` `lamp`). As before, the beam is only as strong
as whatever is nearest in it can take, so nothing close flares white. Two changes in the drain only (nothing
changes outside it): a friend in the beam is allowed more light (so Jamie walking 3 m ahead no longer leaves the
tunnel past him black), and the limit counts only as much of the cone as actually falls on him (a friend at the
edge of the beam, running beside you, barely dims it). Found in review: before this, Jamie ahead of you made
the deep box read as solid black.

Deep in the drain the camera's far plane drops to 150 m and the sky is not drawn; the neighbourhood, the woods
and the road are culled as whole zones (only the tunnel's batches are drawn: 69 merged meshes). The
neighbourhood views of Chapters 0–2 never draw the tunnel.

No blood, writing, symbols, bones, dolls or eyes. It is ordinary neglected infrastructure.

## 3. Alex's helmet (continuity)

- **Established in the morning** (`alex-room.js` `makeHelmet`): on his desk beside the phone, a red bike
  helmet with a white stripe down the middle and his number on the sides. When the phone is noticed, Sam:
  "His helmet's still here." Jamie: "He never rides without it. His mom makes him." Both look at it.
- **Found that night** (`chapter3.js` `itemSeen`, layout `DRAIN.item`, s = 141): the same model, upside down
  in the silt against the wall, its stripe in your light. Seen when you come within about 3 m, or look at it
  from within 9 m.
- **Reaction:** Jamie goes to it and crouches; Sam holds back, then turns his whole body toward the way out
  and keeps his light that way while they talk. The objective stays empty until it is said; then "Keep going."

## 4. The old bike: three states (`C.bike`)

| State | Where | When |
|---|---|---|
| `none` | nowhere | the day, the road, before the drain |
| `tunnel` | upright against the left wall of the deep stretch (s = 163) | from entering the drain; found by the light from a distance; F: look, F: try the bell (click, no ring) |
| `removed` | nowhere | once you are well past it (about 11 m) **and** you are not looking at its spot. It is never seen moving. Look back at the empty spot and you notice; if you don't, Sam looks back and notices a few seconds later. Nothing waits on it. |
| `relocated` | lying across most of the floor at s = 83.5, round the first bend on the way out | set when the run starts. It cannot be there. |

During the run the relocated bike is a **low obstacle**: running at it you veer round it if there is room;
jumping (Space) clears it; running straight into it makes you vault it. You are never stuck (checked from
both lines, in the run and in randomized escapes). Jamie, running ahead, sees it first ("WHAT—"), and Sam:
"That's the bike— that's the BIKE—".

Checkpoints and QA jumps set the right state for where they are (§9); Start over sets `none`.

## 5. The boy: the reveal you cannot miss (`FG.state`)

States: `off` → `unseen` (placed at s = 212.2, out of sight, when you are deep enough) → `first-reveal` →
`first-seen` → `turning` → `leaving-bend` → `hidden` → `second-presence` (the crossing) → `hidden` →
`pursuit-far` → `pursuit-hidden` → `pursuit-near` → `pursuit-watch` → `off` → `road-block` → `road-leave` →
`gone`. Every transition is driven by where you are and what you have seen, not by a timer alone.

**The stop.** When you reach the long straight (s ≥ 186, the boy about 20–25 m on, in clear line of sight),
`first-reveal` begins: Jamie stops dead a step and a half ahead of you and 0.85 m to your right, Sam the same on
your left (measured from where *you* are; against a wall, the one with no room goes to the other side, a step
deeper), both facing down the tunnel with both lights on him. Your line of sight to him runs clear between
them (checked: neither is within 0.45 m of it). Found in review: from fixed places in the tunnel, Jamie could
end up almost in front of you, hiding him. Their lights narrow and reach farther (a long throw) while he is there, so he
stands in the overlap of two beams at the end of them. The objective is cleared. Your view is never turned.

**Waiting to be seen.** He stays in `first-reveal` until your view has been on his chest or head (within
about 20°, nothing in between) for half a second. Until then nothing moves on, and the cues come:
2.6 s "Look. Down there." (Sam), 7 s "There. At the end. Somebody's standing there." (Jamie, pointing),
14 s "Don't you see him?", and every 7 s after that "Down there." Only after **40 s** of never looking at
all (and all of those cues) does he go anyway; that is the deliberate, generous fallback.

**After he is seen** (`first-seen`): "…Alex?" no earlier than 1.7 s; he starts to turn no earlier than
3.4 s and only once you have watched him for 2.8 s (or 8 s have passed); the turn takes 2.1 s; then he walks
(1.25 m/s, a normal walk) round the bend, and is only taken away once he is out of your line of sight. In
the simulation he was present **12.3 s or more** after being seen in every case (forward, left,
right and away facings; 14 randomized facings and stop points). Never looking: the cues came 4 times and he
went after 47.9 s.

**Appearance.** The same person build as Alex (height, proportions, his mustard shirt, dark green shorts,
swept brown hair), at normal scale, grounded each frame on the floor under him; idle, turning, walking and running use the walk and run poses
the companions use, his speed drives the gait (no sliding), and he turns at a limited rate. Seen at 20–25 m
in two beams his face is not readable. No glow, no distortion. He has his own copies of the materials and
**catches the light**: when your beam (where you look) or Jamie's or Sam's is on him and he is far off, a little
more of his own colour shows, as a flashlight's hotspot gives (`catchLight`, up to half again, nothing within
about 7 m, nothing at all when no beam is on him). Found in review: at 18 m in the run he was a dim 45-pixel
shape.

**Follow.** Jamie goes after him at once ("Alex! ALEX!"); Sam: "Jamie, wait! Jamie!". Jamie waits at the
bend for you; past it, nobody (§1).

**Second presence.** At s = 264, once you have been waiting long enough and are looking down the tunnel
(or after a generous wait), he crosses from the right side drain to the left one at a walk, lit by Jamie's
light. A couple of seconds; never his face.

## 6. RUN: the story escape state

`run()` starts it at the close bell. `A.escape` (read by `game.js` every frame) returns the direction and
speed of the escape, so holding W (or any forward key) runs **out**, whichever way you look:

- **Movement:** 5.25 m/s in the drain (normal sprint is about 4), 4.8 m/s on the apron toward your bike.
  Stamina is not spent: you cannot become exhausted. Looking roughly the way out, W also
  steers a little toward where you look; A/D move you across the tunnel. You keep to the floor (a soft pull
  back from the walls).
- **Body:** stronger arm and light swing (`on-foot.js` `runK`), a heavier bob and slight roll, the field of
  view widening from 64° to about 71° (eased in and out; never in memories).
- **Water:** splashes at your feet and theirs; his splashes behind.
- **Companions** run faster than normal (2.8–6.3 m/s, matched to you), not in step, Jamie ahead and
  Sam near you; each looks back over a shoulder now and then, and their lights go back with them.
- **Restored afterwards:** at the bike the escape ends; field of view, speed and stamina are as before. Start
  over and QA jumps clear it too.

**The sequence** (staged against your position; he never catches anyone):

| | |
|---|---|
| Start | The bell beside them; "RUN!"; water breaks behind them. |
| Far | On the long straight he appears behind them, round the bend they just came through, running: kept about 16.5 m back (50–70 ft: 17.2 m when looked at in the browser). Sam looks back and shouts "He's behind us!"; if you have not looked, Jamie looks back too and Sam shouts again ("He's COMING!"), then the prompt hint *Mouse: Look back* (no forced camera). |
| Stumble | Jamie goes down in the water and gets up, still running. |
| Hidden | Round the next bend he is gone. A breath. |
| Side pipe | Water bursts out of the side pipe beside them as they pass. |
| The bike ahead | Round the first bend, lying across the way out: the bike they left far behind them (§4). |
| Near | Round the last bend he is behind them again, closer: about 10 m (25–35 ft: 10 m when looked at). "He's right there— he's RIGHT THERE!" "DON'T STOP!". Stop dead and he slows and stops too, never closer than about 6 m (9 m at the closest in the run). |
| The way out | The mouth glows pale ahead (an exterior glow plane; their lights point at it). Out onto the apron, W runs you straight at your bike, and within 1.35 m you are on it; F works from 6 m away. No small prompt to hunt for. |

Run time from the bell to the bikes: 55.1 s in the browser run, 56–76 s across 24 randomized
escapes (brief: 45–90 s).

## 7. The ride out and the boy in the road

- Mounted, everything is faster: ride speed ×1.35, the field of view a little wider, Jamie and Sam riding
  hard (×1.42), ragged, looking back; your bar light on.
- At a bend 375 m up the road from Briarwood he is **standing in the road ahead**, facing them, lit by the
  bar lights and their flashlights. He is placed when you are 22–58 m short of him; seen within about 15 m
  (40–50 ft; 14.3 m in the browser run). Jamie slows and swerves (speed ×0.62); Sam: "No— no no no—";
  Jamie: "DON'T STOP!". They keep riding at him.
- Before anyone reaches him he turns half away and walks off the road into the trees, his back to them.
  Never running, never vanishing in view. Nobody stops, and nobody follows him.
- The streetlight at the end of Briarwood; their posture eases only there. The ending lines (§1).

## 8. Muted design

Every event has a picture. Captions keep the dialogue and say where a sound came from, but no event depends on
them (no "[a figure runs behind you]"). Jamie and Sam act every sound: they stop, recoil, crouch, turn, point
and run; their lights move with their heads. The boy, the crossing, his running, the bike in the way, the water
breaking and the exit light are all things you see.

**Audio is placeholder and deferred.** The hooks are kept (bell far, bell clean, bell beside them, his voice
ahead and behind, the click, splashes, a knock, the bell behind them on the road). In this pass they were
checked only for being called, a sensible number of times, without errors. No offline renders were made and
nothing was tuned (`C3_AUDIO_RENDER=1` brings back the old signal renders). Nobody has listened.

## 9. Checkpoints, QA jumps, DEV selector, reset

**Checkpoints** (silent; Continue returns to the last). Story ones are kept: `chapter3-start`, `c3-alex-house`,
`alex-bedroom`, `phone-recording`, `neighbor-investigation`, `c3-road-day`, `night-start`, `c3-road-night`,
`c3-tunnel-entrance`. The drain and escape have six: **`c3-tunnel-deep`** (round the first bend),
**`c3-old-bike`**, **`c3-figure`** (the stop), **`c3-escape`** (RUN), **`c3-road-escape`** (on the bikes),
**`chapter3-end`**. Each restores the bike state, the boy's state, the companions' roles and places, the
objective, tension and the drain's lights. An old save at `c3-voice` still continues.

**QA jumps** (`lastLight.jump(name)`, 33): `chapter3-start`, `c3-alex-house`, `alex-bedroom`, `recording`,
`neighbors`, `c3-road-day`, `night-start`, `c3-road-night`, `c3-forest-deep`, `c3-tunnel-entrance`,
`c3-tunnel-inside`, **`c3-tunnel-deep`**, `c3-evidence`, `c3-first-bell`, **`c3-alex-item`**, **`c3-old-bike`**,
`c3-broken-bell`, **`c3-bike-gone`**, **`c3-figure-reveal`**, **`c3-after-figure`**, `c3-figure-crossing`,
**`c3-voice-ahead`**, **`c3-voice-behind`**, **`c3-close-bell`**, **`c3-run-start`**, **`c3-pursuit-far`**,
**`c3-bike-block`**, **`c3-pursuit-near`**, **`c3-tunnel-exit`**, **`c3-bike-remount`**, **`c3-road-pursuit`**,
**`c3-road-figure`**, **`chapter3-end`**. Old names still work as aliases (`c3-old-bike-tunnel`, `c3-figure`,
`c3-figure-bend`, `c3-voice`, `c3-escape`, `c3-tunnel-escape`, `c3-bike-escape`, `c3-road-escape`,
`phone-recording`, `neighbor-investigation`, `alex-house-day`); no alias collides with a section name.

**DEV selector** kept unchanged; Chapter Three from it is canonically equivalent to reaching it by playing
(0 differences; switching 3→1→3→0→3 and 3→1→2→3→0→2→1→3 leaves nothing behind). New natural snapshots:
`docs/qa/dev-chapters-escalation/natural-snapshots.json`.

**Start over / replays** clear the boy, the bike, the helmet, the exit glow, the pursuit, the road figure,
boosts, the field of view, the escape state, roles, holds, captions and tension.

## 10. Files

| File | Change |
|---|---|
| `dist/layout.js` | `DRAIN`: sections, water, ledges, openings, ladder, hatch, pipes, item, bike positions, figure, relocation. |
| `dist/drain.js` | The progression: profiles, age-keyed materials, water surfaces (a lighter, less mirror-like water so the hotspot reads on it), ledges, openings, pipes, conduit, brackets, rebar, debris, markings; floor/water/ledge queries; nav; spots. |
| `dist/alex-room.js` | `makeHelmet()`; the helmet on his desk. |
| `dist/chapter3.js` | The night from the drain on: helmet, bike states, figure states, reveal (framing measured from you), the boy catching the light, crossing, voices, search, pursuit, road figure, checkpoints, jumps, reset. |
| `dist/game.js` | The escape state (direction, speed, field of view, bob), low obstacles you can jump or vault, the instant remount at a run, faster ride, prompt hints, deep-drain culling, the drain's beam allowance for a friend in it. |
| `dist/on-foot.js` | Arm and light swing while running for your life; in the drain, the friend limit on the beam counts only the part of the cone on him. |
| `dist/companions.js` | Faster caps when the story asks (`boost`). |
| `dist/chapter1.js` | A companion light can follow a moving target (a function). |
| `tests/*` | §11. |

## 11. Verification

See [TEST_REPORT.md](TEST_REPORT.md). The escalation's captures, report and gallery are in
`docs/qa/chapter3-escalation/` (`index.html`).

## 12. Performance

Static world **2,514,058 triangles / 1,131 meshes** (rebuild 2,505,240 / 1,124), far under this pass's soft targets (~6 M / ~2,000): the drain's new detail is merged into its own zone. Deep in the drain only the tunnel's 69 merged meshes are drawn, the far plane is 150 m and the sky is off; frames there are about 27,000–71,000 triangles and 58–205 draw calls; within about 90 m of the mouth, where the portal and the woods beyond it are in view, up to ~660,000 / 233. The neighbourhood views of Chapters 0–2 never draw the tunnel. Per-frame numbers for every capture: [TEST_REPORT.md](TEST_REPORT.md). SwiftShader only; no real-GPU frame rate was measured.

## 13. Known roughness

- **Art:** all procedural. The tunnel concrete is flat-coloured with painted stains; the water is a dark,
  slightly glossy plane; the boy is the shared low-poly person with Alex's colours.
- **The boy's face** is never close enough to read, by design. Seen at about 8–10 m in the near pursuit, in the
  lights, he is clearly a child running; the low-poly face would not survive a closer look.
- **The pursuer** is staged on the tunnel's centreline at a kept distance; if you stop and stare he slows and
  stops at about 8 m and simply stands there (he never comes closer). That reads as menacing, but a
  determined player can study him.
- **The road figure** stands on a long, gentle curve rather than just past a sharp one, so he is in view
  a little before the ~15 m where he counts as seen. A player who spends the whole ride looking off into the
  trees can miss him (nothing waits on him).
- **Vaulting** the bike is a plain jump; there is no stumble animation for you.
- **Timing** is tuned on a scripted, efficient player. The drain takes longer for someone who explores.
- **Audio** is placeholder (§8).
- **SwiftShader only:** no real-GPU frame rate was measured.

## 14. For Astra (later)

- Concrete: real textures by age (cast-in-place mouth, old board-formed box, the deep box's efflorescence and
  spalls), wet sheen and drips, the water's surface and its reflections of the beams.
- The boy: Alex's model at full detail would be uncanny up close; keep him unreadable at distance with
  better cloth, hair and a heavier run. His walk away should feel ordinary.
- The helmet: a real model with his number decal; it should read at a glance in both places.
- The bike: rust, a bent fender, the bell; how it lies across the floor.
- The ride out: denser trees close to the road at his curve, so the boy is revealed by the trees and the bend themselves.
- Lighting: the two-beam overlap at the reveal, the pale exit glow, the first streetlight.
