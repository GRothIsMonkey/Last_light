# Chapter Zero — Prologue ("The Long Way Home")

> ✅ **CONFIRMED CANON.** The prologue as it plays today is the accepted prologue **as amended by the Chapter One pass**
> (Alex leaves first; "Go home" leads into Chapter One). Title-menu button: *Take the long way home*. "THE LONG WAY HOME"
> is the name of the prologue's first section, not an official chapter title.

| | |
|---|---|
| In-world date | Sunday, **August 21, 2011** |
| Time | Sunset to dusk; the ride home after the lookout resumes at **8:44 PM** (Chapter One). A police radio later says Alex was "last seen on Oak Hollow around eight". |
| Length | About 5–6 minutes (uninterrupted riding ~240 s; full interaction run 4.91 min; idle route ~5.8 min) |
| Release | Art release `codex/astra-last-light-final-polish` @ `9520b4f`; current form carried in every later release. `main` still has the older **v0.1** form (`21bb7a7`). |
| Main sources | [docs/ASTRA_HANDOFF.md](../../docs/ASTRA_HANDOFF.md), [docs/ASTRA_FINAL_RELEASE.md](../../docs/ASTRA_FINAL_RELEASE.md), [docs/ASTRA_CHAPTER1_HANDOFF.md](../../docs/ASTRA_CHAPTER1_HANDOFF.md) §1; code [dist/story.js](../../dist/story.js), [dist/friends.js](../../dist/friends.js), [dist/ending.js](../../dist/ending.js), [dist/interactions.js](../../dist/interactions.js) |

## Setting

A warm suburban neighborhood in summer 2011. The ride runs along **Oak Hollow Drive**, past the junctions with
**Briarwood Lane** (right) and **Summerfield Road** (left), to a **cul-de-sac** (NO OUTLET) that ends at a small grassy
**lookout**: a bench, the **old oak** with a tire swing, chalk initials on the pavement, and a fence at the edge of a
field. The neighborhood is alive: sprinklers, a kid shooting hoops, a minivan coming home, streetlights and porch lights
coming on one by one, fireflies. See [The neighborhood](../04_WORLD_AND_LOCATIONS/THE_NEIGHBORHOOD.md).

## Starting conditions

Four friends riding together at the end of summer: **you**, **Jamie**, **Sam** and **Alex**. School has not started
("Even when school starts?"). Nothing is wrong.

## Characters

[You](../02_CHARACTERS/PLAYER.md) · [Jamie](../02_CHARACTERS/JAMIE.md) · [Sam](../02_CHARACTERS/SAM.md) ·
[Alex](../02_CHARACTERS/ALEX.md) · Jamie's mother (at the door) · neighborhood life (the hoop kid, a parent in a minivan).

## Objectives

None on screen beyond contextual prompts. Ride; at the end of the street, get off and look around; go home when ready.
There is no failure condition: pedaling advances the story, stopping lets you stay in a moment and your friends stop
with you.

## Story progression

Section titles shown along the ride (`dist/story.js` `chapters`):

| Distance | Section title |
|---|---|
| 0 m | THE LONG WAY HOME |
| 556 m | SEE YOU TOMORROW |
| 690 m | WHEN THE STREETLIGHTS COME ON |
| 880 m | THE WAY YOU REMEMBER IT |

1. **The group ride.** Each friend rides differently (own cadence, standing, line). Push ahead and they answer at their
   own pace; ease off and the group re-forms. Ringing your bell makes riding friends look back, and a bell answers.
2. **Alex's question** (about 376–405 m): Alex: "Did you guys hear that?" Jamie: "Hear what?" Alex: "Never mind."
3. **Alex leaves first** (556 m): "Alright, I'm this way. See you tomorrow." He turns right onto **Briarwood Lane**
   (595 m), **rings his bell twice**, waves over his shoulder, and rides on until Briarwood's curve, by the creek's trees,
   takes him out of sight. Nothing ominous happens on screen. Narrator: "You don't remember what you said back."
4. **Jamie goes home** (~696–791 m): "That's my mom. I gotta go. Tomorrow, okay?" His mother comes to the door; Jamie
   drops the bike on the lawn, runs in and waves.
5. **Sam goes home** (~900–994 m): "Save me a spot tomorrow." He rides into the garage, parks, waves, goes through the
   door at the back, and the garage door comes down.
6. **Alone to the end of the street.** Narrator lines: "There was no big goodbye. Just one more ordinary evening."
   "You moved away in October. You meant to keep in touch." "For a moment, you can almost hear their bikes again."
7. **The lookout.** On foot: push the tire swing (a real pendulum), sit on the bench, crouch at the chalk, look back at the
   lit street. Someone calls you in: caption **"Someone is calling you home."** (after 18 s if you look back for 1.4 s,
   otherwise at 36 s).
8. **Go home.** F on the bike now reads **Go home**. The last memory lines play: "We left our bikes wherever we
   stopped." then **"I thought I remembered everyone."** The picture fades and returns farther along the ride home:
   Chapter One begins. (Staying instead fades on its own after about 100 s and also leads on.)

### Memory lines (the adult narrator looking back)

"We knew which driveways had the smoothest pavement." · "We used to stay out until the streetlights came on." ·
"Back then, going home only meant until tomorrow." · "I don't remember when the neighborhood got this quiet." ·
"We left our bikes wherever we stopped." · "I thought I remembered everyone." (Can be switched off in Settings.)

## Discoveries and clues

| Clue | How it appears | Label |
|---|---|---|
| Alex hears something | "Did you guys hear that?" on the hill. Becomes central in Chapters 2–4. | ✅ |
| **JSA** chalk | Old chalk initials on the lookout pavement (Jamie, Sam, Alex). | ✅ |
| **AR** chalk | Faint initials beside JSA: you must crouch to see them after the call; plain during the final fade. | ✅ |
| **AR** carved in the oak | At a kid's height, facing the swing; dark, readable only up close. | ✅ |
| **The old bike under the oak** | Appears after the call, only while you are looking away and more than 6 m from it. Never seen appearing. | ✅ |
| **The fifth chalk rider** | A chalk drawing shows four children on bikes; after the call and the old bike, a **fifth** joins, only while you are >3 m away and facing away. | ✅ |
| AR marks on the old bike | Small scratched initials connect the bike to the chalk. | ✅ |
| "I thought I remembered everyone." | The final line: someone has been forgotten. | ✅ |

No sound, light, figure or explanation accompanies any of these. They reset on replay.

## Supernatural events

Only the quiet anomalies above: the AR initials, the old bike that was not there, the fifth chalk rider. Nothing is
explained. (Chapter One decides that AR is not Alex: Alex has no surname in the game.)

## Connections

- **To later chapters:** Alex's "Did you guys hear that?" (Ch2 memory, Ch4 marquee); his bell rung twice (Ch1–3 bells);
  his route down Briarwood past the creek (Ch1–2); the old bike (Ch2 morning, Ch3 drain, Ch4 photographs and Mason
  Cycle); JSA (Ch5: carved fresh in Owl cabin); "See you tomorrow" (Ch4 marquee).
- **Previous:** none (first chapter).

## Ending

Riding home alone. Chapter One starts without a menu. (In v0.1, an end card closed the game here.)

## Gameplay systems

Riding, steering, bell, head look, pushing/stamina, sidewalk and curb riding, on-foot lookout interactions, contextual
prompts, memory lines, settings, pause. See [Cycling](../06_GAMEPLAY_SYSTEMS/CYCLING.md) and
[Movement and controls](../06_GAMEPLAY_SYSTEMS/MOVEMENT_AND_CONTROLS.md).

## Known problems

- Audio is procedural and has had **no human listening review** (outstanding since v0.1).
- Stylized procedural art: close-up joints, hair, hands and distant houses are simplified (accepted).
- Chalk and the AR bicycle marks depend on viewing angle and resolution.
- `main` still carries the v0.1 form (from before the Chapter One pass made Alex leave first, and ending on an end card); it has not been updated since. The exact v0.1 departure order is not yet verified.

## Release status

✅ Accepted and frozen. Prologue final polish verified with 102 simulation and 115 browser checks (2026-09-30).
