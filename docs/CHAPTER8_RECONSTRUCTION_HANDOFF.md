# Chapter Eight reconstruction: handoff

**The Night Oak Hollow Fell**, rebuilt after the first draft was played and rejected.

- Branch: `claude/chapter8-major-reconstruction` (last code change `e92d191`; packaged and hosted from `2f3a941`, whose `dist/` is identical), started from the rejected draft's exact commit
  `c496d53241b7a82adc7edd8800da367503b5b5a4` (branch `claude/chapter8-fullgame-story-integration`, left untouched).
- `main` and the earlier Chapter Eight branch were not modified, reset, rebased or merged into.
- Test results: `docs/CHAPTER8_RECONSTRUCTION_TEST_REPORT.md`. Before/after captures and their review:
  `docs/qa/chapter8-reconstruction/` (`BASELINE_AUDIT.md`, `VISUAL_REVIEW.md`). What the aftermath inherits:
  `docs/AFTERMATH_STORY_HANDOFF.md` (updated).

## 1. What was wrong, and what was done about it

The baseline audit (`docs/qa/chapter8-reconstruction/BASELINE_AUDIT.md`) looked at fifteen in-beat captures of the
draft and its code. In short: the rescues were single rooms where a boy walked out; the hunter only patrolled; the town's
destruction was one hole that could not be seen from the route; the Presence read as plumbing behind glass; Jamie's death
was a caption over an off-frame event; Alex's injury was a slab chosen by a timer; the faces showed nothing.

The scenes that did not work were rebuilt, not tuned. What is new, by act:

| Act | Rebuilt as |
|---|---|
| III. The three rescues and the crew room | `chapter8-rescue.js` (new). Each rescue is a multi-beat set piece with the friend acting before he is free, an escape, and a visible containment consequence (a LOAD needle falls and a wall moves when an anchor leaves). |
| V (first half). Oak Hollow falls; Jamie | `chapter8-street.js` and `chapter8-town.js` (new). The real street comes apart in stages, on its own geography, while you walk down it; creatures in it; the Hendersons' rescue; Jamie's death and the breakdown after it. |
| V (second half). Alex; the oak; the ride | `chapter8-finale.js` (new). Alex's decision at the hatch and its cost; the oak; the street at sunrise on foot; the last ride with both survivors visibly broken. |
| Throughout | Grief and faces (`faces.js`, `chapter8-acting.js`, `chapter8.js`); the red sky (`game.js`, `chapter8.js`); the Presence's body (`chapter8-presence.js`); synthesized sounds (`audio.js`). |

Acts I–II (the bikes, the field, the shaft, the gallery, the office and film, Danny) and Act IV (the anchor board, the
breach) keep the draft's structure. Changes there: the gallery stealth is now bounded (Reyes draws the hunter off up the
shaft once you have the receipt and the film, or after about three and a half minutes), the 1958 film's frames and
captions were remade around the LOAD gauges ("DO NOT VACATE OCCUPIED CHAMBERS"), and the breach uses the Presence's new
body. The final operation's gates, ports, Line Two and pins are the draft's mechanics with one new beat (the catwalk takes
Brandt's leg at pin C, which is why Reyes is carrying him at the hatch). These are the least rebuilt parts of the chapter
(see §7).

## 2. How to play it

- **Hosted (private artifact, built from `2f3a941`)**: https://claude.ai/artifact/2iBMpwKT8x3id9KNhkuchc — only its owner
  can open it until it is shared from the page's Share menu.
- **Offline**: `PLAYTEST_CHAPTER=8 node tools/package-playtest.mjs <folder>` makes one HTML file that runs from disk in
  desktop Chrome or Edge (the one delivered with this work: `Last-Light-Chapter8-Reconstruction-Playtest.zip`).
- **From the repository**: there is no build step. Serve the repository root over HTTP and open `dist/index.html` (as
  for every earlier chapter).

- From the title: play Chapter Seven to its end card and choose **Chapter Eight →**; or
- **DEV** on the title → **Chapter Eight** → any of its **49** scenes (`DEV_SCENES[8]` in `dist/dev-chapters.js`); or
- **Continue** after quitting returns to the last checkpoint (`LABEL8` in `dist/chapter8.js`).

`?qa` exposes `window.lastLight` for tests (`lastLight.chapter8.SC.STREET`, `.FIN`, `.RESCUE` are the new modules).
Controls are unchanged: WASD/mouse, **F** (hold where the prompt says), **C** crouch, **T** flashlight, **Shift** run,
**G** throw a bolt (the retrieval wing), number keys for choices, **S** puts a page down.

## 3. Modules

| File | What it is |
|---|---|
| `dist/chapter8.js` | The director (phases, sections, checkpoints, task scripts, offers, hazards, the hunter's setup). New here: the grief state (`C.grief`, `griefFor(section)` so a DEV start or Continue sets it from the section; `applyGrief`, `cry`, `weep`, the tears overlay, sobs and breathing), the apocalyptic sky's level (`C.apocWant`/`C.apoc`, flashes), offers usable while you are posed (`inPose`), and turning on the shared character presentation (faces) on begin/jump. |
| `dist/chapter8-scenes.js` | Acts I–II, and the hand-off to the other modules. Gallery stealth bounded; film captions from `FILM8`. |
| `dist/chapter8-rescue.js` | **New.** Act III: the flooded wing (Sam), the retrieval wing (Jamie), the corridor that moves and the room it made (Alex), the crew room. |
| `dist/chapter8-fall.js` | Act IV (anchor board, breach, escape), the works and the final operation; hands the street to `chapter8-street.js` and the end to `chapter8-finale.js`. |
| `dist/chapter8-street.js` | **New.** The surface, from MH-12 to Summerfield: the sky and the skyline Presence, the creatures (made smiling things, a second hunter, far silhouettes), Mrs. Pruitt, the limb, the Hendersons', Jamie, the flight south. `after(on)` leaves the street as it fell for the finale. |
| `dist/chapter8-town.js` | **New.** The destruction toolkit on the real street: slab fields over trenches (the storm line at d 1047–1095; the Hendersons' yard), houses rebuilt from their own plans as breakable pieces (lean, facade, roof, porch, chimney, garage), blowouts, a falling pole with arcing wires, cars that slide in, power failing lamp by lamp, fires, smoke columns, ash, fixed FX pools. |
| `dist/chapter8-finale.js` | **New.** The service hatch and Alex; the oak; the street at sunrise; the last ride; responders. |
| `dist/chapter8-acting.js` | **New.** Gestures drawn over a person's pose: floor, seat, kneel, hide, hug, slump, cower, overhead, heave, reach, limp, crawl, propped, still, and grief (sob, embrace, kneelOver, shake, headInHands, shoulder). |
| `dist/faces.js` | Expressions for crying (`tearful`, `crying`, `sobbing`, `anguish`, `grief`, `numb`, `horror`, `pain`, `weak`); keys for tears, red rims, trembling lips, sob pulses; a grief floor that persists; "rich" faces (eyes that move and look at things, wet lower lids, red rims, running tear tracks). |
| `dist/chapter8-presence.js` | The Presence's body: plated, barbed, fingered limbs; a lobed fleshy mass; fog. A `sky` variant for the skyline (dark silhouette, red under-glow from the fires and the open ground). |
| `dist/chapter8-complex.js`, `chapter8-props.js`, `chapter8-ruin.js` | The works under the court (wings rebuilt for Act III), the film and papers, the draft's street ruin (now mostly superseded by the town module; its Summerfield heave and the Kowalskis' fire remain). |
| `dist/audio.js` | Synthesized sounds added for the reconstruction (impacts, glass, collapses, sirens, the Presence's loop, pumps, chains, shots, and grief: sobs, sniffs, gasps, a wail, shaking breaths). **No recorded voices exist.** |
| `dist/game.js`, `people.js`, `style.css`, `ambient.js`, `dev-chapters.js` | The sky shader's crimson deck and its lighting tint; function gestures for actors; the tears overlay; per-lamp overrides; the DEV list. |

## 4. Scene by scene: what changed (the chapter's 17 beats)

| # | Beat | Draft | Now |
|---|---|---|---|
| 1 | Four bikes at Sam's | Kept. | Kept. |
| 2 | The missing junction (MH-12) | Kept. | Kept. |
| 3 | The construction gallery | 31.6 bot-minutes of waiting out a patrol. | Bounded: Reyes, on the far side, bangs up the shaft and draws it off once you have what you came for (or after ~3.5 min). |
| 4 | Annie Rowan, 0417; the film | Captions over a generic film. | The film remade: three wall sections with LOAD gauges; a girl carried out, a needle falls, the wall bows; carried back, it stills; "DO NOT VACATE OCCUPIED CHAMBERS." |
| 5 | Danny | Kept. | Kept. |
| 6 | Sam (the flooded wing) | Find the door, one mechanism, he walks out. | Rebuilt (Act III, `chapter8-rescue.js`): evidence he is alive without knowing it is him; a trust beat through the door slot; draining the wing, the live cable, the seized door; Sam acting before he is free; the flood door; his anchor's needle falling and a wall moving. |
| 7 | Jamie (the retrieval wing) | An empty corridor; Jamie walks out. | Rebuilt: the hunter carries Jamie back to his cell; its routine; hiding, throwing bolts to draw it; Jamie through the slot; its den; the chase. |
| 8 | Alex (the corridor that moves; the room it made) | A striped door in a box room. | Rebuilt: the corridor closing ahead, the made room coming apart, Alex who has been fooled before, the proof, two levers, the ledge, his hand. |
| 9 | The crew room | Four boys standing. | Rebuilt: the gum, the camera, the bike, sitting with them, and the plan to go riding tomorrow (set up here for the oak). |
| 10 | The anchor board | Kept (concise; "You got your friends back"). | Kept. |
| 11 | The breach and the way out | Plumbing behind glass. | Same staging with the Presence's new body (lobed mass, plated limbs, fog). |
| 12 | Oak Hollow from the oak | A caption over an intact street. | Rebuilt (`chapter8-street.js`): the red deck over the whole town; the thing itself on the skyline, limbs into the cloud; the first blows (windows, lamps, the crack); a made thing in a yard calling for help in a woman's voice (you hide behind a car while it walks past); a neighbour chased across the lawns; the road heaving and going into the storm line with a car and a pole; a second hunter out of it searching the far side while you go along the near lawns; the house at 1052 leaning in, its rooms open; Mrs. Pruitt under her awning (Jamie's win); a limb out of the cloud coming down on the Kesslers' (it goes, then fire). |
| 13 | The Hendersons'; Jamie | Caption; off-frame; a dot on a lawn. | Rebuilt: Jamie kicks in the window and talks Lily out ("Biscuit", the dog he doesn't have); the jack under the garage door; the lawn heaving under you (run for the street or go down with it); the garage's side door, Jamie holding its header while Mr. Henderson crawls out; the hunter coming up out of the hole's end, taking Jamie to drag him back down (what it is for), you able to run at it; it slams him down at the edge and goes under. Then: everyone's own reaction (Sam runs to him and kneels; Alex can't come close; Reyes's CPR, then his hand over his eyes); you kneel; his hand; his cap; Reyes's jacket over him; the made things climbing out of the yard; away south, still crying (the police car at the corner with one of them on its roof looking in). |
| 14 | The works | Kept. | Kept. |
| 15 | The final operation | Gates, ports, Line Two, pins. | Same mechanics; at pin C the catwalk takes Brandt's leg. |
| 16 | Alex | A random roof slab; a neutral face against the oak in daylight. | Rebuilt (`chapter8-finale.js`): the hatch's counterweight is gone; Alex takes the chain himself (he is the light one) and holds it while the others climb; the chain fouls, he lets go to climb the last rungs, and the lid comes down across his back. You and Sam lift it and pull him out. At the oak: his breathing, the cold, the bikes he kept thinking about in the room it made, "We were supposed to go riding tomorrow"; you take his hand, look at Sam, stay; he dies; Sam holds him; Reyes kneels with Sam; you get up when you are ready. |
| 17 | The last ride | A pristine street. | Rebuilt: on foot first with Sam past the trench, the house that fell, the Kesslers' shell, the Hendersons' yard; then the bikes where Reyes left them; the ride past Summerfield's responders; Sam crying on and off; "His mom doesn't know yet"; the look back; the card. |

## 5. Systems the brief asked for

- **Grief.** `C.grief` (Jamie, Alex) sets a grief floor on Sam's and Alex's faces (wet, red-rimmed eyes, down-turned
  mouth), a slump in their walk, their own sobs (synthesized), and your own: a shaking view, a breath that catches,
  tears swimming at the edge of the screen (`#c8-tears`). `griefFor(section)` initialises it from the section on any
  jump, so a DEV start or Continue into the street after Jamie, the walk or the ride begins in the right state.
- **Faces.** The friends' faces are the shared character presentation (Chapter Five's), which the draft switched off
  in its reset and never back on: every face in the draft was the plain one. Chapter Eight now turns it on like Six and
  Seven do. Crying, sobbing, anguish, pain and weak faces, eye gaze at targets, blinking, trembling lips and tears.
- **The sky.** A crimson deck that churns, lit from below toward the court, with flashes inside it and far thuds; raised
  when the thing comes out, settling to a low, smoky red-brown after the seal (`C.apocWant`).
- **The Presence on the skyline.** A second instance, never fogged out, its body a hill behind the trees at the court and
  limbs going up into the deck and over the roofs; one comes down on the Kesslers'. Dark, lit red from under.
- **Creatures in the street.** Lore rule kept: Danny Whitcomb is the original and is not duplicated. The pale smiling
  things are **made**: copies of what it did to Danny, put together out of what it has taken (Alex: "That's one of the
  things it makes", "They all smile. The ones it makes."). Placed few, not many simulated: each has a short route, a
  sight check (houses block it; holes do not), a rush; the far ones only watch. A second hunter searches the trench.
- **Destruction as play.** The storm-line trench reroutes you onto the near lawns under a searching hunter; the lawn
  that heaves under you is a run for the street with a real failure; the hole between you and Jamie is real ground;
  everything that falls stays fallen for the walk and the ride.

## 6. Checkpoints and failures

| Danger | Back to |
|---|---|
| The hunter in the Line Four pipe | `c8-barrier` |
| The hunter in the gallery | `c8-stealth` |
| Danny at the alcoves | `c8-danny` |
| The hunter in the flooded wing / the retrieval wing / its den | `c8-sam-door` / `c8-jamie-door` / `c8-jamie-run` |
| The made thing in the yard sees you before you are down behind the car | `c8-surface` |
| The second hunter sees you on the near lawns | `c8-trench` |
| You are still on the Hendersons' lawn when it goes | `c8-garage` |
| Falling structure in the escape; the gate surges; the pins; the hatch's chamber | `c8-escape` / `c8-gates` / `c8-plug` / `c8-chain` |

Jamie's death and Alex's are not failure states and have no "save him" prompt.

## 7. Known limitations (honest)

- **Found by the end-to-end run and fixed late:** the friends' faces were switched off in Chapter Eight (draft bug); the
  crew room's door could shut on you when you walked in from Alex's escape (you could not move). Both fixed; a
  chapter-wide "unstuck" safety net was added. Other world changes that could strand a player in a way the scripted
  runs did not try may remain; the safety net moves you to the nearest walkable spot after a moment if that happens.
- **Memory:** the game's JS heap is about 1.1–1.25 GB at all times (all chapters are built at load). This predates the
  reconstruction (the draft measures the same, ~30 MB less). It is a risk on low-memory machines.

- **No voice acting.** Every line is a caption. Crying, sobbing, breathing and the woman's voice are synthesized noise
  shaped to suggest them; they were never listened to by a person during this work (the container has no audio
  output). Whether they sound right is unverified. The emotional effect of the deaths has **not** been judged by a
  person; it has only been checked that the beats happen, in order, with the faces and bodies doing what the code says.
- **No human playtest.** Everything was played by scripted inputs (walking, looking, F, holding F, crouching) in a
  headless test runner and in headless Chromium. Bot timings are not human timings.
- **Performance** was measured only in headless Chromium on SwiftShader (software rendering on this container's CPU):
  update cost per frame, draw calls, triangles, memory. No frame rate on real hardware was measured (see the test report).
- **Faces** are procedural (shapes, overlay eyes, tear tracks), not sculpted or captured. Close up they read as the
  game's stylised characters crying, not as photographic faces.
- **Least rebuilt:** the final operation's gates/ports/pins (the draft's mechanics; the brief asked for a larger
  climax there), the breach staging (new body, old choreography), the reunion's room. The town has no new interior
  furniture beyond the rebuilt houses' rooms; responders on the ride are the chapter's existing police cars and
  firefighters plus captions (no ambulance or fire-engine models exist in the project).

## 8. Human playtest checklist

Play from Chapter Seven's end card with sound on, then again from DEV starts. For each, note confusion, boredom, cheap
deaths, stuck companions, and whether the moment lands.

1. Gallery: is the stealth short enough? Does Reyes drawing it off read?
2. Sam, Jamie, Alex: does each rescue feel like rescuing someone (danger, his participation, the escape)? Does the
   falling needle/moving wall make the anchors' meaning clear without the board?
3. Crew room: does the plan to ride tomorrow register?
4. Surface: is the sky frightening? Is the thing on the skyline readable as one enormous animal? Do the made things read
   as "made" and not as Danny? Is hiding behind the car fair? Is the trench route clear? Is the second hunter fair?
5. The Hendersons': is the lawn run readable and fair? Can you tell what Jamie is doing at the side door and why he
   doesn't run? Does trying to reach him feel possible and then not?
6. After Jamie: do Sam's, Alex's and Reyes's reactions read without captions? Is there enough time? Too much?
7. The hatch: is Alex's choice clear and his own? Is the injury understood as the lid, because of the chain?
8. The oak: is the agency (sit, his hand, Sam, stay, get up) enough and not too much? Does the line feel like his?
9. The walk and the ride: does the street look destroyed? Do Sam's face and body show what happened? Does the look back
   work with the mouse/Q?
10. DEV: enter **The Last Ride** directly. Within the first seconds, is it obvious these two boys have lost their friends?
11. Sound: listen to the synthesized crying and breathing. If they are wrong or distracting, mute those cues
    (`c8Sob`, `c8Sniff`, `c8Gasp`, `c8Breath2`, `c8Wail` in `dist/audio.js`) rather than keep them.
