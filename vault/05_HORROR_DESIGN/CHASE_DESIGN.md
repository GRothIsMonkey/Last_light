# Chase design

> Rule from the human developer (2026-10-23): **effective chase sequences; avoid excessive repetitive running without
> visible danger.** The best reference in the game is Chapter Three's creature chase. The weakest is Chapter Five's escape
> after the double (judged "excessively long, boring, and frighteningly ineffective").

## What a chase needs (derived from what worked and what didn't)

| Need | Chapter Three (worked) | Chapter Five repair (did not) |
|---|---|---|
| A **visible pursuer** | The creature, seen far, then near; the player is prompted to look back ("Mouse: Look back") | The double is gone when you look back; nothing visibly follows |
| **Events every few seconds** | Far sighting → lost → out of the wall → Jamie falls → water bursts from a pipe → the old bike in the way → the gate held and burst → the bikes | The gate slams (route A) or the bell rings (route C), then a long walk back |
| **A bounded length** | 52.8 s scripted, 56–78 s randomized, limits 45–90 s | 146 s escape (sim), then ~190–300 m back to the bikes |
| **Known geography** | Back the way you came | Known routes (good), but long |
| **Physical beats** | A gate held and slammed; an obstacle to vault; a burst pipe | A gate slammed in front and shoved open |
| **A clean end** | Onto the bike; it stops at the mouth and watches | A fade only if you stop for 90 s or after 8 minutes |
| **Companions present** | Run faster than normal, look back, one falls | Present (escape mood) |

## Rules

1. **Show the threat** during the run, at least every 10–15 seconds (a sighting, a sound shown on the companions, a light
   dying behind you). Silence is fine only when it is a held breath before the next event.
2. **Keep it between 45 and 90 seconds** of actual running unless a different length is designed and playtested.
3. **Put an event every few seconds**: an obstacle, a near miss, a stumble, a blocked way, a new direction of threat.
4. **Use the player's own path** (Chapter Four's dark follows the trail you actually took; Astra's Chapter Five redesign
   makes the pursuer take the path you walked).
5. **End decisively**: a vehicle (the bikes), a threshold (the mouth of the drain, the streetlight), or a cut. Do not end on
   an empty walk.
6. **The story escape state** (Chapter Three, `run()` / `A.escape`): forward runs you *out* whichever way you look,
   5.25 m/s in the drain, the view widened 7°, no stamina to lose, companions run 2.8–6.3 m/s. Restored afterwards.
7. **Never let it look scripted to the point of playing itself** (Chapter Four lesson): respond to hesitation (the dark
   closes) and speed (it falls back).
8. **It must never touch anyone unless the human developer decides the player can be caught** (current canon).

## Reference implementations

| Chase | Code | Doc |
|---|---|---|
| Ch3 creature chase | `run`, `updateChase`, `crChase` in [dist/chapter3.js](../../dist/chapter3.js); [dist/creature.js](../../dist/creature.js) | [Creature chase handoff](../../docs/ASTRA_CHAPTER3_CREATURE_CHASE_HANDOFF.md) §4 |
| Ch4 pursuing dark (five routes) | `outBack` … `marquee`, `darkStep`, `creaturePass` in [dist/chapter4.js](../../dist/chapter4.js) | [Horror revision](../../docs/CHAPTER4_HORROR_REVISION_HANDOFF.md) §5 |
| Ch5 escape (repair) | `updateRun`, `shoveGate`, `outStart` in [dist/chapter5.js](../../dist/chapter5.js) | [Repair](../../docs/CHAPTER5_GAMEPLAY_STORY_REPAIR.md) Stage G |
| Ch5 escape (Astra redesign, in progress) | `pursue()` and changes in `updateRun` on Astra's branch (`4f96fdf`) | No doc yet — 🟡 observed read-only |

## Checklist for a new chase

- [ ] What is chasing, and when is it on screen?
- [ ] List the events with their times; is any gap longer than ~15 s?
- [ ] Total running time? Where does it end, and how?
- [ ] What happens if the player stops? Turns back? Takes another way?
- [ ] Do Jamie and Sam keep up and stay visible?
- [ ] Does it read muted?
- [ ] Has a human played it?
