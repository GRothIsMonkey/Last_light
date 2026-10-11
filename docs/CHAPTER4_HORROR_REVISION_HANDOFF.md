# Last Light — Chapter Four: horror revision (handoff)

A structural horror and gameplay correction of Chapter Four after human playtesting, not an art pass. Chapter Four's
environments, investigations, downtown geography, story continuity, its 22 beats and the DEV tools are kept; five
problems are fixed: how the creature moves, what the greater evil feels like, an escape that played itself, Jamie
and Sam disappearing, and a generic message from the figure under the marquee. Everything below works in the
simulation and in Chromium (software rendering). Art direction and sound stay with Astra (see **Astra priorities**).

## Source and branch

| | |
|---|---|
| Source | `claude/chapter4-main-street` at `8cc59e26111c4c2032a2893c69b67fafc548612a` (verified as HEAD before branching; not modified) |
| Revision branch | `claude/chapter4-horror-revision`, created from that exact SHA |
| Final SHA | the head of `claude/chapter4-horror-revision`: the commit that adds this document (a commit cannot carry its own hash; `git log -1`, and the final report) |
| History | Linear on top of the source SHA: no merge, no rebase, no force-push. `main`, `claude/chapter4-main-street`, `codex/astra-chapter3-final-polish`, the earlier Chapter Three branches and Chapters Zero–Two are untouched. |
| Creature asset | "Smily horror monster" by Bento (https://skfb.ly/6W6ut), CC BY 4.0. The GLB, its source copy, its attribution and `docs/THIRD_PARTY_ASSETS.md` are unchanged: same mesh, face, proportions, textures and colours. Only its animation is new. |

Commits, in order: `214c64b` companions · `4c508d5` creature animation · `4b1fd1e` Presence and the creature's fear ·
`dc49d33` responsive escape and the video store · `281a25a` the Lyric and the DEV scenes · `eee6dd3` clean scene
switching and the DEV-start playthrough · `477ba22` docs, the lab, avoiding the boys where they really are ·
`0f24a23` limbs measured from the rest pose · `3695f1e` lab sheets · `54c295f` the standing stance · `b3a84e7`
and the final commit: QA captures and final numbers.

## 1. Findings from the playtest, and what was wrong

1. **The creature slid.** Its limbs swung on a sine about the body's side axis with no contact with the ground; at speed it
   skated, stopped like a puppet and turned on the spot.
2. **The greater evil had no weight.** The creature "looked past them" from 26–48 m away, too small to read; nothing
   connected its fear to the lights; the lights simply went out in a timed wave.
3. **The escape played itself.** One scripted route (the laundromat); the dark was a timed radial wave from the store;
   the creature came from behind on a timer. Any other way out soft-locked (`n4-alley` only progressed into the
   laundromat; the passage to Main, the narrow way to Depot Street and the creek side led nowhere and stranded the boys).
4. **Jamie and Sam disappeared** (root causes below).
5. **The marquee** spoke in generic threats ("I know where he is." "Come find him.").

## 2. Jamie and Sam: root cause and fix

Reproduced with scripted stress runs (sprinting, stopping, turning back, each route, store in/out, lingering, DEV
starts) logging where each boy was every quarter second. **Four causes, none of them "too slow" alone:**

| Cause | Effect |
|---|---|
| On foot the companions were capped at **3.0 m/s**; the player sprints at **3.65 m/s** | a sprinting player simply outran them (Sam 18.1 m behind, lost 12 s) |
| Scripted stand spots (the TV-shop window ride, the creature pass's wall spots) kept them **where the scene put them**, whatever the player did | the player walked on; they stayed (cascade sprint: 28.6 / 26.4 m) |
| Routes other than the laundromat **never progressed** | they stood at their last spots indefinitely |
| The darkness (C.dark .8–.88) | a boy 15 m back was invisible: "disappeared" |

**Fix** (`dist/companions.js`, `dist/chapter4.js` `guard()`):
- `footBoost`: on foot a boy may run up to 3 × boost m/s (1.2, or 1.45 when they hurry), more the farther behind he is,
  so a sprinting player is matched, never left.
- A stand spot the player has walked away from (beyond its leash, 12 m) is **let go**: he follows again.
- A path that has stopped getting anywhere (no progress for 2.5 s while 6 m behind) is **looked for again**.
- Only when a boy is truly stuck (7.5 s, 9 m behind, out of sight) is he **put back along the player's own trail**
  5–12 m behind, at a walkable point the camera cannot see. Counted in `C.guardLog` (it did not fire in any route run).
- The escape (below) progresses from every route; nothing strands them.
- Jamie and Sam keep distinct behaviour: **Jamie** runs ahead to the turning you are heading for and points the
  way ("This way. Through here." "Up here. It comes out on Main."); he is the one who calls you on. **Sam** stays
  close and keeps looking back at the dark (more often the closer it is); he is the first to say "It's still behind
  us.", warns you off the store's front door, and holds Jamie back at the marquee.

Results (final code): sprint 12.6 / 12.0 m worst, cascade sprint to the store 5.6 / 6.7 m, ride home fast 5.4 / 5.1 m;
every escape route ≤ 14 m worst; **never more than 14 m away for any length of time, never hidden in any sample, and
no unseen recovery was needed in the route runs**.

## 3. The creature's animation (and how the rig is used)

The asset gives a 46-joint skeleton and one idle clip (jaw, fingers). The clip keeps playing; everything else is
procedural on the skeleton itself (`dist/creature.js`):

- **Velocity from where it really went** since the last frame (any story code just places it; teleports are
  detected and the feet re-planted).
- **Gait by speed**: a walk (lateral sequence), a trot (diagonal pairs) and a **bounding gallop** (hind pair, then fore
  pair, with a flight phase), blended; cadence and duty factor follow speed.
- **Planted contacts**: each hand and foot is planted where it lands and stays there while the body passes over it;
  then it swings, in the body's own frame, to where it will land, predicted from speed and turn rate. Standing, the
  limbs settle one at a time, two when it has turned further, and one it can no longer reach steps at once.
- **Two-bone IK** on shoulder/elbow/hand and hip/knee/foot with the rest pose's own bend as the pole; hands flat and
  feet on their toes while planted, curled back in the swing.
- **Weight**: the body bobs with the steps (rising through the gallop's flight), pitches against acceleration (nose
  down speeding up, sitting back stopping), rolls into turns; the spine flexes with the bound; the chest turns first.
- **Head**: held level against the body's pitch and bob, turned to what it looks at, fast when it snaps round.
- **States** (the `drive`): speed, crouch, cower (limbs drawn in, a fine shiver), back (backing away), alert (chest
  and head up), snap (a fast head turn), look; rear and claw for Chapter Three's gate.
- `ground(x,z)` lets a chapter give it the surface under it (Chapter Four: street, garage roofs, the creek bank, falling
  off it on a real arc). `reset()` now returns it exactly as the page made it (bones in rest pose, the clip's clock),
  and the limbs are measured from the model's rest pose, so it moves the same whichever chapter showed it first.

Its own movement language is a little wrong on purpose: it comes **low and quick, with a slight weave**, stops **dead
mid-stride**, and turns its head **before** its body; frightened, it draws its limbs under itself and shivers.

Evidence: `docs/qa/chapter4-horror-revision/creature-lab/` (profile, front, rear and three-quarter sheets of the run,
trot, stalk, stop, turn, back, cower and turn-to-flee) — foot slip 0 in run, stalk, turn; ≤ 0.09 m only in the last
frames of a hard stop. In the Chapter Four encounter, in the full playthrough: foot slip ≤ 0.13 m (was 2.2 m off the creek
bank, and 0.8 m in an in-place turn until standing hands it cannot reach were stepped at once). Chapter
Three's chase with the new gait: 156 checks pass; float 0, speed error median 0.004, heading error p95 0.003.

## 4. The greater evil (the Presence)

Never shown, named or explained. It is felt only through what it does and what the creature does about it.

**Second Street at dusk (first encounter, `creatureDusk`/`updateCrt`).** Restaged to read at 15–20 m (was 26–48 m):
1. *watch* — at the far end of Second Street, crouched, looking at them. SAM "Stop. Stop." JAMIE "Is that—" SAM "Don't move."
2. *stalk* — it comes, low and deliberate, up the middle of the street, a little quicker as it comes; once, under the
   streetlight, it stops and holds still. JAMIE "It's coming." SAM "Don't run. Don't run."
3. *freeze* — dead still mid-stride; its head snaps past them to the TV shop's corner, the way they were going home.
   YOU "Why'd it stop?" Sam looks there.
4. *look* — its whole body turns to the corner. The light over the TV shop's door dies, slowly; then the street lamp
   beside it. JAMIE "What's it looking at?" SAM "There's nothing there."
5. *back* — it backs away from the corner, low, never taking its eyes off it. JAMIE "It's backing up."
6. *scurry*, *hide* — **the "it's hiding" image**: it scrambles to the lit corner of the video store — nearer the boys
   than it has been — presses itself into it, made small, shaking, glancing between the corner, up Main, and them.
   SAM "It's hiding." JAMIE "…From what?"
7. The answer, without a word: far up Main, the streetlights begin to go out, one after another, coming this way.
8. *flinch*, *flee* — it recoils, all of it at once, and bolts back down Second Street for the creek; the light over
   the street dies as it passes under it. SAM "It ran."

The player sees it become afraid (stages 3–6) before anyone understands why. Each stage waits (within limits) to be
seen; if anyone comes within 6–7 m it bolts at once; it never passes through anyone. The boys only ever see the lights.

**Deliberate patterns.** `presence.kill(i, at, {flick, dur})` takes a fade duration: the lights it takes near the creature
die slowly (1.8 s), the ones that answer a question go as a sequence.

**In the narrow way, on the way to the theater, and under the marquee** (below) the same rule holds: the lights go
where it is, the creature fears it, and when it is near, everything goes still.

No line says or implies the hierarchy (tested: nothing spoken contains "controls", "servant", "in charge", "created").

## 5. The escape (`outBack` … `marquee` in `dist/chapter4.js`)

**Routes.** From the video store's back door there are five ways to the Lyric, all of which work and reconnect at the
corner of Main and Depot under the theater:

| Way | Through |
|---|---|
| A | down the alley, the narrow way between the garages, **the laundromat** (in its back door, out its side door), Depot Street |
| B | the narrow way on to **Depot Street** |
| C | up the **passage** between the shops (u 142–144) to Main |
| D | up the **gangway** (u 127) to Main |
| E | **along the creek** behind the garages to Depot Street |

**Pressure, from state not a timer.** The dark is a point that follows the player's actual trail (`darkStep`); lights
within 9 m of it die as it reaches them, and the night deepens as it closes in (`C.darkTo` .62 → .84). It moves at
1.9 m/s rising to 2.4 m/s over two minutes (a walker slowly gains, then slowly loses; a runner gains), holds back while
the creature is there, hurries to close the distance when it is more than 16–22 m behind (so it is never far), and is
never allowed closer than 2.6 m. Hesitate and it closes; right behind them, the light over them goes; the boys say
so (Sam "It's still behind us.", Jamie "Don't stop. Don't stop!", Sam "Run!", "Not that way!" if you go back toward it).
**Nothing kills the player.** Only standing still for 40 s with it right there makes the boys pull you on (the old
carry-on, now by region, for idle players only; it never fires in any route test).

**The creature passes them, running from what is behind them** (`creaturePass`, three variants by route):
the narrow way (A, B), Main (C, D), the creek (E). It comes at them **from ahead**, low and quick; the boys freeze
against the wall (or beside you in the open); it stops. **Behind them, a light goes out** ("[Behind them, a light goes
out.]"). It looks past them at it (JAMIE "It's not looking at us."; Sam looks back); it shrinks and backs away the way
it came, and **its own end goes dark** (SAM "The other end—"). With nowhere else to go it **bolts past them**, flat
out, close, and away through the nearest way out on their side (up the passage; into the square; over the creek bank).
It never touches anyone: it takes the side of the lane away from you, keeps 1.6 m from each of the three, and in the
narrow way, if there is no room, goes over the garage roofs. JAMIE "It went right past us." SAM "It didn't even look at
us." No camera is turned, nothing stops the player. The theater waits until it is gone.

**The video store becomes unsafe** (`updateStore`): the exterior is already dark; a shot on the TV that nobody has
looked at **holds** (up to 9 s longer) until it has been seen; on the live picture the boys react to the impossible
angle (Sam looks up at the corner it would have to be filmed from, Jamie turns round looking for the camera); the
picture is from the **upper corner farthest from you**, and when you go toward that corner it is from another one
(SAM "It moved. It's— from over there now."); the tubes fail **from the one over you outward**, the first stuttering
a long time; the front door is the wrong way (SAM "Not out there." JAMIE "The back. Come on."); the back door is the
way out, taken when you choose (the old fallbacks remain).

Two small additions to the town for this: two back-wall security lights along the narrow way (lamp ids 60, 61 in
`dist/town-plan.js`, in free slots: no existing light index moves), so the dark has lights to take there.

## 6. The Lyric: the new message

When they reach the corner **everything stops**: no wind, no insects (the ambient hooks drop to zero at once), nothing
goes out, nobody appears in the windows, and the figure under the marquee **does not sway or breathe**.
"[It goes quiet. No wind. Nothing.]" Then, as they come nearer (each line waits for a step closer, or a while):

> JAMIE "…Alex?" — SAM "Jamie. Don't." (Sam's hand on his arm)
> ALEX "Did you guys hear that?" — JAMIE "…Hear what?" — ALEX "Never mind."
> SAM "That's what he said. On the hill. That's exactly—"
> ALEX "Don't run. Don't run." — SAM "…That's what I said."
> ALEX "Alright, I'm this way." — ALEX "See you tomorrow."

The marquee goes out. When the lights come back he is gone. Come at him and he is gone before he finishes ("See you—").

Why it is personal: every line is one the story already established. "Did you guys hear that?" / "Hear what?" /
"Never mind." is the exchange on the hill the last evening (Chapter Zero), which Jamie has been quoting ever since; Jamie
answers it again before he can stop himself. "Don't run. Don't run." is what Sam said on Second Street tonight, where
the figure was not. "Alright, I'm this way. See you tomorrow." is Alex's goodbye at the corner of Briarwood; the boys'
own "Tomorrow." "…Tomorrow." over the Pine Ridge picture now answers it. Nothing explains him, threatens, smiles, or
distorts; there is no jumpscare, no voice effect, no forced camera, no lock on the player. Kept: the Lyric, the marquee,
the darkness, the cautious approach, the blackout, his disappearance, the Pine Ridge picture on Alex's camera (the lead
for Chapter Five, carried in the inventory), the return to the bikes and the ride home.

## 7. DEV selector (Chapter Four)

All Chapter 0–3 scenes and every existing Chapter Four scene are kept. Renamed or added (no duplicates):
Creature First Appearance (`c4-creature`) · **Creature Notices Presence** (`c4-creature-notices`, new) · **Creature
Cowering / Fear** (`c4-creature-hiding`, new) · Streetlight Cascade (`c4-presence`) · Video Store (`c4-video-store`) ·
Impossible Surveillance (`c4-store-live`) · Video Store Escape (`c4-back-door`) · Downtown Escape Start (`c4-escape`) ·
**Alley Route A** (`c4-route-a`, new: where the ways part, facing the narrow way) · **Alley Route B** (`c4-route-b`,
new: facing the passage to Main) · Creature Flees Past Group (`c4-alley-creature`) · Theater Approach (`c4-theater`) ·
New Alex Message (`c4-marquee`) · Chapter Four Ending (`chapter4-end`). 42 scenes in all.

Every scene starts from canonical state: the creature (now fully reset: pose, gait, clip), the Presence and its
cascade, TVs and the live camera's corner, companions, captions, objectives, timers, events, dialogue, the dark's
trail and the route log. Tested in the revision's order — C4 Creature Fear → C3 Creature Chase → C4 Downtown Escape →
C1 Old Oak → C4 Theater → C2 Briarwood → C4 Video Store → C4 Ending — each Chapter Four scene identical to a clean start
of it, nothing of Chapter Four left in the others.

## 8. Checkpoints and QA jumps

Checkpoints unchanged (12). The `c4-presence` checkpoint is now saved when the lights begin to go — during the hiding,
as before it was after the flight. New QA jumps: `c4-creature-notices`, `c4-creature-hiding`, `c4-route-a`,
`c4-route-b` (42 sections, 13 aliases). The state snapshot adds `escape` (route, the ways taken, the dark's gap now /
closest / farthest, lights it took, carry-ons) and `creature.pass` (kind, stage, closest).

## 9. Tests

See `docs/TEST_REPORT.md` (top section) for the full results. In short:

- full suite **622 passed, 0 failed** (Chapters 0–3 played naturally, then Chapter Four from Chapter Three's end card, Chapter Four's
  checks, the Chapter Four replay, and **a complete Chapter Four playthrough from the DEV selector's Chapter Four Start**);
- Chapter Four alone 35 checks, including: the encounter's stage and light order, distance and foot slip; the narrow-way
  pass; every way out, walking and running; the store's held shot and moving camera; the marquee's lines, silence and
  stillness; the DEV switching order;
- Chapter Three alone 156 (shared creature code);
- Chromium, muted: **13 checks**, 86 captures, 0 JavaScript errors, 0 WebGL/shader warnings (`docs/qa/chapter4-horror-revision/`): the walkthrough from Chapter Three's end card by inputs alone, then all 42 DEV scenes by real clicks.

## 10. Performance

Software rendering (SwiftShader) only: the counts are real, the times are not a GPU measurement.

| | |
|---|---|
| The creature | 1 skinned mesh, 23,820 triangles (one draw call per pass); its animation about 0.16 ms CPU per update |
| Downtown, Chromium 1440×900 | 136–1,047 draw calls, 83–417 k triangles across the walkthrough (the escape 136–191, the marquee 174–194) |
| Chapter Three's tunnel, the creature in view | 65–74 draw calls, 54–70 k triangles |
| Renderer | ANGLE (Vulkan 1.3, SwiftShader), Chromium 141 |
| JavaScript / shader errors | 0 / 0 |

## 11. Known roughness

- At a hard stop the last hand to land can slide up to 0.09 m for a few frames; turning in place toward something, about 0.2 m.
- The creature does not path-find: its routes are hand-placed lines that avoid the town's solids; in the main-street
  variant it can brush street furniture on the north sidewalk.
- In the narrow way at walking pace the creature passes at about 1.5 m (by design close, but tight at the shoulder).
- On the Main and creek routes few lights stand near the trail, so the dark is felt more as the sky than as lights.
- The figure under the marquee is the cast's Alex model (a mild default mouth); stillness is posed, not acted.
- Audio remains placeholder hooks only; all of this is built to work muted.

## 12. Astra priorities

1. Creature: a hand-authored run/stop/turn set to blend with the procedural contacts; a crouched "hide" pose with
   the head pulled in; a dedicated recoil; dust at the contacts.
2. The Presence: light failures as an authored sequence per beat (flicker grammar, the tube that stutters), the sky
   and fog response as the dark closes, and its silence as a designed sound absence.
3. Second Street and the narrow way: lighting so the hiding image and the pass silhouette read at 15–20 m in the dark.
4. The marquee: the figure's stillness (breath held, eyes), the marquee bulbs freezing mid-chase.
5. The video store: the live picture's lens and the corner it is from; the fluorescent tube's failure.
6. Sound: everything (hooks fire at the right beats; see `C.sounds`).
