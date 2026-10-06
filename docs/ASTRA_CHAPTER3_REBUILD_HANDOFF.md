# Last Light — Chapter Three horror rebuild (handoff for Astra)

This is a **structural** rebuild of Chapter Three's horror: geography, staging, pacing, companions, escape.
It is not an art pass. The woods, the outfall and the tunnel are built from plain procedural geometry and
colours so that they read correctly in the dark. Astra's final art pass is still to come (§14).

The earlier structural pass is described in [ASTRA_CHAPTER3_HANDOFF.md](ASTRA_CHAPTER3_HANDOFF.md). Its day
investigation, phone, captions, tension and heartbeat, checkpoint system and companion fixes are kept. Its
pond road, detention basin, fence gap and culvert are **gone**, and so is its second half. Where the two
documents disagree, this one describes the game.

## Source and branch

| | |
|---|---|
| Source branch | `claude/chapter3-horror-investigation` (not modified) |
| Source SHA | `8f06b2bb3b8f545243c75f3644627cb8a217d7ec` |
| Chapter Two source | `68cc54396bdc2599cfa35b59ba6a4c981db6a8f3` (`codex/astra-chapter2-final-polish`, frozen, not modified) |
| Rebuild branch | `claude/chapter3-horror-rebuild` |
| History | Linear on top of the source SHA. The first commit carries the temporary DEV chapter selector from the private playtest build (the same change as `claude/chapter3-private-playtest`), so the rebuild can be playtested from any chapter. No rebase of earlier history, no merge to `main`. |

Serve `dist/` over HTTP as before. `?qa` exposes `window.lastLight`; `lastLight.jump(section)` starts at any
QA section (§11). **Continue** on the title returns to the last checkpoint.

## 1. The chapter, beat by beat

The intended feeling, in order: normal investigation → curiosity → unease → isolation → dread → "someone has
been down here" → "why is *that* bicycle here?" → "there is a person down there" → "was that Alex?" →
something is in the tunnel with us → panic → escape → relief → fear of what they actually saw.

### Day (August 22, from 9:16 AM)

Unchanged from the structural pass up to the neighbours: the Briarwood corner, Alex's house and his mother,
his room, the five recordings on his flip phone, the window over the creek, the neighbours. The last
neighbour, Mr. Okafor, heard the bell too ("A few nights this week. Late. Down the street, toward the
end."), and **points down Briarwood to where it stops**: "End of Briarwood, past the last house. There's a
gate. An old city road goes down from there. Down to the big storm drain in the woods. Your creek ends up
down there." "Nobody's used it in years. You boys stay off it."

At the end of Briarwood a streetlight, bollards, a red END marker and a yellow pipe gate, one leaf open. A
Public Works "MAINTENANCE ACCESS" sign, a flood-warning sign, a sewer marker post. Behind the gate the road
goes on: old asphalt, cracked and patched, weeds in the seams, poles carrying dead wires. Jamie: "There."
Sam: "That's not a road. That's a gate into the woods."

Past the gate, by the edge: **a single bike tire track** in the road dust along the asphalt's edge, wobbling,
with **small shoeprints** beside it ("Somebody walked it in. It's all wobbly."), and **weeds pushed down** at
the gate ("That's from today. Or last night."). "See where the tracks
lead." The road runs a hundred metres or so, then **bends down into the trees** and the street goes quiet
behind them ("Can you hear the street? I can't hear the street."). At the bend Sam stops them: "Okay.
That's far enough." Nothing else is there by day. **The old bike is not on the road by day.** Jamie:
"We have to come back tonight." Sam does not want to ("Alex is missing. Like, actually missing. And you
want to come back here in the dark?"), and agrees only on condition: "If anything happens, we leave. Right
away." Eleven o'clock, the corner. By day the woods nav is limited to the first 140 m of road.

### Night (11:12 PM to 11:54 PM)

**Home and the corner.** The house dark; out the door, the bike. Jamie and Sam at the corner ("You came.").
Lights off past Alex's house, then on.

**The road (about two minutes from the end of Briarwood).** A headlight on your handlebars, the companions'
lamps, the pole line, the canopy closing in. Three stages:

- *Early* (asphalt, 0–150 m). The gate behind you, the last streetlight. At the bend (118 m) Jamie looks
  back. Sam: "You can't even see the houses anymore."
- *Middle* (broken asphalt, 150–330 m). The road narrows and the trees close overhead. A **branch swings back**
  across the road behind you after you pass it; Sam's light goes back to it ("Did you guys hit that
  branch?" "What branch?"). A **delineator reflector flares** in your light ("Whoa—" "Reflector. Relax.").
  Something **crosses between the trees** far off the road, a second and gone; Jamie's light follows it
  ("Deer." "Since when are there deer here?").
- *Deep* (gravel and ruts, 330–547 m). Down into the creek valley ("I can hear water."), the road at its
  narrowest, and at the bottom, the outfall.

**The outfall.** A concrete headwall with the culvert's black square mouth, sloped wingwalls, an apron,
riprap, a trickle of water out over the lip. Sam: "That's the drain?" Jamie: "That's where the creek goes.
Behind Alex's. All of it comes out here." Sam: "We are not going in there." Jamie: "The tracks went this way."
**Bikes stay at the mouth: the drain is on foot** (you cannot ride into it). Jamie goes to the side of the
mouth and waits ("Come on. Before I change my mind."); Sam hangs back behind you.

**The drain, phase by phase** (you walk carefully in here, at about three quarters of your normal walk;
running is as fast as ever):

1. **Nothing.** A straight box culvert with a raised walkway. "It smells like the creek." "Don't touch the
   walls." Then the first bend, and the mouth is gone behind you: "I can't see the way out anymore." "It's just
   the bend."
2. **Evidence.** The older, narrower section. A silt bar along the floor with **small shoeprints and a single
   tire line beside them, going in**. Jamie: "Pushing a bike. See? One tire." Sam: "It could be anybody."
   Jamie: "…Yeah. Could be." Nobody says whose they are; there is no blood. A **tap on metal high up the
   ladder shaft**; both look up ("The lid. It's just the lid.").
3. **The first bell.** One bicycle bell, far ahead and deeper in (the source is ~140 m on). Sam: "No." "Then
   we go back. Right now." Jamie: "Just a little farther."
4. **The bike.** Past the spillway step, leaning on the left wall: **the same old bike from the oak** (the
   shared model in `old-bike.js`: faded sage green, the "AR" scratch, the license sticker). "That's the bike.
   From the oak." Sam: "I see it. I see it this time." Look at it (F): "The license sticker. Four-one-seven."
   "It's wet. It wasn't wet at the oak." Try the bell (F): **a dry mechanical click, the lever barely moves,
   no ring** ("It doesn't ring. It never did.").
5. **A clear bell farther ahead.** "That's not this one."
6. **The figure.** At the long straight's end, where it bends, about **25 m (82 ft) away: a boy**, Alex's
   size, in Alex's mustard shirt and olive shorts (the `CAST.alex` model), standing on the floor, normal,
   unlit except by your lights. Both companions see him first: they stop dead, Jamie's long beam lands on
   him, Sam tenses. **He waits until you have actually looked at him** (half a second in view, with a clear
   sightline). If you don't, Sam and Jamie nudge you, by gaze and words ("Look. Down there." "Down there. By
   the bend."). The camera is never turned for you. Once seen: Jamie, quietly, "…Alex?"; the boy turns and
   **walks behind the bend**: from the moment you see him to the moment he is gone, 1–3 s (2.37 s).
7. **Follow.** Jamie goes after him ("Alex! ALEX!"); Sam objects ("Jamie, wait! Jamie!"). Objective: "Follow
   Jamie." You choose when. If you hang back Sam calls after Jamie.
8. **The empty sightline.** Past the bend, the long far straight is **empty**. "He was right here." "There's
   nobody down here." But a hanging **cable is still swinging**, there are **ripples** on the water, a **wet
   child's footprint on dry concrete** ("It's wet." "That's from just now."), a **leaf** turning in the
   current, and a **small stone drops off the lip** of a side culvert.
9. **"Jamie?" ahead.** From the side culvert at the far junction (Briarwood's own pipe), Alex's voice:
   "Jamie?" Jamie: "…Alex?" Sam: "Don't. Jamie, don't."
10. **"Guys?" behind.** After a long silence (at least 5.5 s, and until you look toward the culvert, or 9 s):
    from behind them, back the way they came, the way out: **"Guys?"** Sam whips round, both lights swing back.
11. **Wait.** Nobody moves except to come closer together. Both lights stay on the empty bend behind them.
    Several seconds (6.2 s).
12. **The close bell.** A bell right beside them. Jamie and Sam recoil from it, both lights on the spot. Nothing there.
13. **RUN.** Sam: "RUN!" Jamie: "GO! GO!"

**Escape.** On foot, back the whole way you came. More breath than usual (stamina drains at about a seventh
of the normal rate). **Something splashing behind you** all the way: water breaks every half second or so,
nine to thirteen metres behind (splashes and ripples on the floor, never a creature); Jamie and Sam run
with you and look back over their shoulders at it. The old bike, when you pass it, is **lying on the floor**
now. Out of the mouth: "Get back to the bikes." A generous reach to remount (3.6 m instead of 1.9 m). Jamie
and Sam mount quickly and ride tight beside you. Up the road, no obstacles; once, **a bell far behind them**
at the outfall. Out under the **streetlight at the end of Briarwood**, the houses. Stop.

Sam: "That was him." Jamie: "No." Sam: "You saw him." Jamie: "I know." Fade; end card ("Chapter Three",
"August 22, 2011."). No answers, no monster. Chapter Four is not implemented.

**Turning back.** If you turn round in the drain before the scares are over (walk 30 m back from the
farthest point you reached), Jamie and Sam do not follow: they stand where they are, lights on you. "Where
are you going?" "…Jamie. Come on. Let's go." "I'm not leaving." The objective becomes "Go back to Jamie."
Near the mouth Jamie shouts after you ("I'm not leaving without him!"). There is no wall: you can walk out.
But the bikes will not take you away while they are still down there ("I can't leave them down there.").
Walk back to Jamie and it carries on where it was.

## 2. State machine (`dist/chapter3.js`)

`c3-black` (card) → `d3-corner` → `d3-street` → `d3-mom` → `d3-room` → `d3-phone` → `d3-window` →
`d3-neighbors` → `d3-road` → `d3-tracks` → `d3-plan` → `d3-home` → `c3-night` (card) → `n3-home` →
`n3-corner` → `n3-ride` → `n3-road` → `n3-outfall` → `n3-tunnel` → `n3-evidence` → `n3-tunnel` → `n3-bell` →
`n3-tunnel` → `n3-bike` → `n3-deeper` → `n3-figure` → `n3-follow` → `n3-search` → `n3-voice` → `n3-behind` →
`n3-close` → `n3-run` → `n3-out` → `n3-flee` → `n3-safe` → `n3-end`.

All transient state is in one object `C`, emptied completely by `fresh()` (Start over, a jump, a replay,
the DEV selector). Module-level props (figure, branch, deer, cable, ripples, drops, leaf, stone) are reset
in `reset()`.

**Companions in the drain are driven by roles**, re-evaluated every frame (`target()` →
`companions.steps.toward`):

| Role | Where | Notes |
|---|---|---|
| `lead` (Jamie) | 3.6 m ahead of you along the drain, on the right | His pace is yours plus what it takes to get back in place; after a scene he jogs (up to 4.4 m/s) to get in front again. More than 7.5 m ahead he stops, turned back to you. |
| `behind` (Sam) | 2.3 m behind you on the left; 1.4 m when tension is above 0.5 | Never pushes past you. |
| `beside` | Shoulder to shoulder with you | After the scares (the cluster before the close bell). |
| `point` | A set spot | Jamie at the mouth, past the bend, at the wet footprint. |
| `run` | Out along the drain, then to their own bike, then `mounted` | Waits, turned back, if you fall 7 m behind. |

`hold()` freezes one of them facing or looking at something, with a gesture (`tense`, `recoil`, `crouch`),
and `glance()` turns a head for a moment. Gestures are applied to a copy of the pose, never accumulated.

## 3. Geography

The detention basin, its fence and the pond road are removed (`basin.js` deleted).

### The access road (`dist/woods.js`, data in `layout.js` `WOODS`)

| | |
|---|---|
| Start | Briarwood's far end (u = 250.3 on Briarwood), past a new streetlight, bollards and the gate (13.5 m in) |
| Length | 547.5 m (a Catmull-Rom spline through 14 points, sampled every 0.5 m) |
| Descent | +2.36 m → −7.75 m (about 10 m), most of it after 150 m, steepest 240–410 m |
| Width | 5.5 m at the gate → 3.9 m at the end (half width 2.75 → 1.95) |
| Surface | asphalt to 150 m (cracks, patches), broken asphalt to 330 m, then gravel with two ruts |
| Furniture | gate with chain, END marker, Public Works and flood signs, sewer marker post, "ROAD NOT MAINTAINED" at 300 m, delineator posts with reflectors, a pole line to 200 m with cut wires |
| Woods | ~470 trees near the road and ~3,700 far trees (instanced), shrubs, logs, field tufts and fronds; the creek's valley beside the road in the deep stage |
| Region | a polygon east of Briarwood; far houses, lawns, far land and trees are not built inside it |

The terrain is designed, not raw: the natural ground sags toward the valley and the creek bed, the road is
cut into it, and everything fades back to the original terrain at the region's edge. Walking uses three
fine grids (the road ribbon in 1 m rows, the outfall patch at 0.5 m, the creek ribbon) over a coarse 3 m grid.

### The outfall

At the end of the road, where the creek from behind Alex's house comes out: a 0.45 m concrete headwall
around the 4.6 × 3.6 m mouth, a cap beam, sloped wingwalls 6.3 m long flaring out, stains and a waterline,
a rusted rail on top, an apron 9.2 m long with a trickle down the middle, riprap and debris below. A pad of
gravel where the road ends, where the bikes are left.

### The drain (`dist/drain.js`, data in `layout.js` `DRAIN`)

286 m on foot, never a maze: one way in, one way on.

| Section | s (m) | Inside (w × h) | What is there |
|---|---|---|---|
| A — mouth | 0–24 | 4.6 × 3.6 | The last of the outside light. |
| B — box | 24–72 | 4.6 × 3.6 | A raised walkway on the right, conduits, joints every 2.44 m, graffiti and station stencils. |
| C — first bend | 72–94 | 4.6 × 3.6 | Turns 0.62 rad. **After it the mouth is out of sight.** |
| D — old | 94–150 | 3.9 × 3.15 | Older, narrower, damaged: cracks, patches, lime, roots; the silt bar with the prints (100–146); the ladder shaft (121); a side pipe (136); the spillway step (148.4, 0.5 m up). Water underfoot. |
| E — long | 150–214 | 4.4 × 3.6 | The long straight: the old bike at 171 (left wall); the figure's sightline. |
| — second bend | 214–226 | 4.4 × 3.6 | Turns −0.95 rad. The figure stands at 220.3 and steps behind it. |
| — far | 226–286 | 4.2 × 3.4 | The empty sightline: the cable (≈240), the wet footprint (252); the junction (270–286, 6.2 × 4.2) with Briarwood's side culvert (279) and a bar screen at the end. |

The floor falls 0.4 % toward the mouth, with a low-flow channel down the middle and a shallow ledge.
`drainFrame` gives `project`, `at`, `floorAt`, `inside`, `rayDist` (for the flashlight) and `sees` (for
sightlines); `drainNav` gives walking, surface (`water` in the old section, the step and the junction) and
heading. Navigation locates room → drain → woods → easement → side street → main road.

## 4. The flashlight and the dark (`game.js`, `on-foot.js`)

The structural pass's known problem, a companion near you blown out white by your flashlight, is fixed in
the light itself, not by darkening the companion:

- The beam's intensity is clamped by **what is actually in it**: the ground, the drain wall straight ahead
  (by ray distance), and any companion standing in the cone within 4.6 m (`max(0.7, 2.2·d²)`). Up close the
  beam is soft; down a long sightline it reaches about 46 m.
- **A spill round the hotspot.** In the drain your flashlight also has a dim, wide spill (a second, unshadowed
  spot light, intensity 6, 1.05 rad), as real flashlights do. It shows the walls and floor near you, while the
  hotspot stays as gentle as whoever is in it needs. The spill obeys the same rule for a friend inside its wider
  cone (`max(0.15, 1.2·d²)`), so the close cluster before the bell stays dark and nobody flares. Without it,
  the clamp for Jamie walking 3.6 m ahead in your beam left everything round him black.
- Jamie's light gets a long, narrow throw in the drain (`longThrow`), and an even narrower one on the figure.
- **Cave lighting.** Inside the drain the sky and hemisphere light fade out (down to 14 %), the fog darkens,
  and the exposure lifts slightly, so the tunnel is black except where the lights are. Under the trees a
  shade factor dims the sky.
- **Bounce.** The two emergency point lights (idle in this chapter) are borrowed and put where each beam
  lands, so a lit patch of wall lights its surroundings a little.
- **Shadows.** The flashlight casts shadows (512 map) and skips the player's own body. The bike headlight on
  the night road is shadowed too, tuned so the bike does not shadow itself.
- No red light, no glowing fog. The drain's materials ignore the outside fog, so the mouth is black from the
  apron at night.

**The flashlight hint.** "T Flashlight" used to stay on screen until you pressed T. In Chapter Three the light
is switched on for you ("Lights."), so after any Continue it stayed through the whole drain (and pressing T
would have turned the light off). Now, if the light is already on, the hint shows for its first eight seconds
of walking and then goes. If the light is off, it stays until you press T, as before. This is shared code
(`game.js`), so it reaches Chapter One too, where Jamie hands the spare over already on; the caption
"T — Flashlight" at the hand-over is unchanged.

## 5. The old bike and the evidence

The bike is the shared `old-bike.js` model (one build for the oak and the drain), placed against the left
wall at 171 m. It is absent by day. Its bell only clicks (`click` sound, caption "[A dry click. The lever
barely moves.]"); after the run starts it is found **fallen** on the floor. The silt bar, the footprints
(merged into one mesh) and the tire line are one group; the day tire track and flattened weeds are another.

## 6. The figure

A `createPerson(CAST.alex)` at 220.3 m, 0.5 m left of centre. States: `off` → `waiting` (from `n3-deeper`) →
`turn` (0.45 s after he is seen, as Jamie says "…Alex?") → `walk` (from 0.75 s; he walks out of sight round
the bend) → `gone`.

- **Never missable.** He waits until he has been in view for 0.5 s (`camLooksAt` at 0.965 and a clear
  sightline). Nudges by companion gaze and lines at 3.5 s and 9 s, then "Down there." at 31 s and 38 s (both of them already looking at him throughout). Failsafes: after 40 s, or if
  you walk within 18 m of him, he goes anyway.
- **The camera is never forced.** Tested facing forward, left, right and away (§12).
- From the moment he is seen to the moment he is gone: **1–3 s** (2.37 s measured).
- Triggered at 195 m (or when Jamie reaches 199 m), so he is first seen from about 25 m (82 ft).

## 7. Muted readability

Everything that matters can be read with the sound off, through people and light, not HUD markers:

| Sound | What you see |
|---|---|
| The knock up the shaft | Both stop and look up the shaft; Sam tenses; Jamie's light goes up it. Caption. |
| The first bell, far ahead | Both stop and turn toward it, Sam tensed; both beams go down the tunnel. Caption. |
| The bell's dry click | The lever barely moves. Caption. |
| The clear bell | Both stop and look; Jamie's light goes ahead. Caption. |
| "Jamie?" ahead | Jamie freezes, then edges toward the side culvert, his light on its mouth; Sam shrinks back from it. The caption names the direction ("ALEX'S VOICE, AHEAD"). |
| "Guys?" behind | Sam whips round (3.4 rad/s) and recoils, his light swinging back; Jamie turns a moment later. Caption "ALEX'S VOICE, BEHIND THEM". |
| The wait | They close up beside you, lights on the bend, nobody moves. |
| The close bell | Both turn to the spot beside you and recoil; both lights on it. Caption "[A bicycle bell. Right beside them.]" |
| Splashes behind | Splashes and ripples on the floor behind you; the others look back over their shoulders. |

Captions are the adaptive captions of the structural pass (tone chosen from the frame behind them).

## 8. Audio (placeholders only)

Nothing here has been listened to by a person. The existing synthesized bells, voices and click are reused
at the new positions (`bell3` far, clear, beside and behind; both voices through the tunnel filter, from
their own positions). New synth placeholders: water footsteps, `splash`, `drip`. Placeholder ambience loops
(traffic, life, insects, wind, forest, tunnel, water) fade by where you are. All event IDs, positions,
timings and captions are in place for real assets. The tension and heartbeat system is unchanged; its
curve is checked (§12).

## 9. Companions

The old-oak fixes are untouched. New in this pass (`companions.js`): `steps.toward(c, get)` (a per-frame
target with routing, pace, gaze, facing and gesture), sidestepping when you walk straight into one of them,
and a tight riding formation for the narrow road (reset afterwards). Fear acting: Jamie ahead, Sam behind;
both cluster beside you after the voices; heads and lights carry every reaction.

**A movement fix in shared code (`game.js`).** On foot, a person or a bike used to refuse any step that ended
inside its space, including steps away from it. Getting off right where a friend had just parked could leave
you unable to move at all (found when replaying the chapter). Now a step into someone's space slides along
its edge (the part toward it is taken out), and from inside it you can always step away. A long browser run
also wedged the player between two parked bikes and Sam at the outfall, with the way to the mouth just
through a bike's space; that is covered by a check, and near the end of the road the friends now leave their
tight riding formation so they do not park round you. Walking clear of everyone is exactly as before.

## 10. Escape details

`o.setDrain(.14)` for the run (restored on reaching the street); `A.remountRange = 3.6`; Jamie and Sam run
at 3.55 and 3.4 m/s and mount in about 1.9 s; the road ride out has no added obstacles (the branch, deer
and reflector are spent); the tension holds high (0.92) until the street, then decays slowly.

## 11. Checkpoints and QA jumps

**Checkpoints** (silent; Continue returns to the last): `chapter3-start`, `c3-alex-house`, `alex-bedroom`,
`phone-recording`, `neighbor-investigation`, `c3-road-day`, `night-start`, `c3-road-night`,
`c3-tunnel-entrance`, `c3-tunnel-deep`, `c3-old-bike`, `c3-figure`, `c3-voice`, `c3-escape`, `chapter3-end`.

**QA jumps** (`lastLight.jump(name)`): `chapter3-start`, `c3-alex-house`, `alex-bedroom`, `recording`,
`neighbors`, `c3-road-day`, `night-start`, `c3-road-night`, `c3-forest-deep`, `c3-tunnel-entrance`,
`c3-tunnel-inside`, `c3-evidence`, `c3-first-bell`, `c3-old-bike-tunnel`, `c3-broken-bell`, `c3-figure`,
`c3-figure-bend`, `c3-voice-ahead`, `c3-voice-behind`, `c3-close-bell`, `c3-tunnel-escape`,
`c3-bike-escape`, `chapter3-end`. Aliases: `phone-recording`, `neighbor-investigation`, `c3-tunnel-deep`,
`c3-old-bike`, `c3-voice`, `c3-escape`, `alex-house-day` (each checkpoint name is also a jump).

The **DEV chapter selector** (title screen, temporary) is kept; see
[DEV_CHAPTER_SELECTOR.md](DEV_CHAPTER_SELECTOR.md).

## 12. Verification

See [TEST_REPORT.md](TEST_REPORT.md) for the numbers. The rebuild's evidence (captures, reports, audio
signal renders, a gallery) is in `docs/qa/chapter3-rebuild/` and `docs/qa/dev-chapters-rebuild/`. The
structural pass's evidence in `docs/qa/chapter3/` is kept as it was; it shows the basin, which is gone.

## 13. Performance

See [TEST_REPORT.md](TEST_REPORT.md). In short: the woods and the tunnel are baked into their own zones,
so they can be culled as a whole. Culling switches a batch's render layers off (it is then neither drawn nor
shadowed); `visible` is left alone, so it still says what the world contains. The tunnel is drawn only in the drain or within 95 m of the outfall. Deep in
the drain nothing else is drawn, and the camera's far plane is shortened by context. The neighbourhood
views of Chapters 0–2 never draw the tunnel.

## 14. For Astra (art pass; not attempted here)

- **The woods.** Trees are simple instanced shapes with flat colour; the canopy is read mostly from what the
  lights hit. Ground cover, the creek, the deer silhouette and the branch need real assets.
- **The outfall and the drain.** Procedural concrete with painted stains, joints, cracks and graffiti
  textures; the water is a flat translucent plane with drawn ripples and drops. Real concrete, silt, water,
  wet sheen and grime will matter a great deal.
- **The figure.** Uses `CAST.alex` as it stands, with a slow turn and walk. It works because it is ordinary.
  Keep it ordinary; consider subtle wrongness only in animation timing, not in looks.
- **Lighting.** Tuned under SwiftShader only (no GPU frame rate measured). Re-check exposure, the bounce fill
  and the flashlight falloff on real hardware. Nothing should be red, and the fog should not glow.
- **Audio.** Every sound in the drain is a synth placeholder; positions and timings are final-ready.
- **Startup.** Building the world takes about 60 % longer than in the structural pass (about 5 s more in Node
  on the same machine), nearly all of it baking the woods' ~4,100 trees, built with the neighbourhood's tree
  builder. Instanced or lighter far trees would win most of it back.

## 15. Chapter Four room

Not started. Open threads left deliberately: the bike moved and fell; the voices came from two places; the
figure was seen by all three; the footprints and the tire line; Mr. Okafor knows the road; Sam's "If
anything happens, we leave" and what they tell anyone.
