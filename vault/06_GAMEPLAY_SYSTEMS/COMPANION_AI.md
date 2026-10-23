# Companion AI (Jamie and Sam)

> Rule across every chapter: **Jamie and Sam never vanish, never get left behind, and never stand in the way for long.**
> Their reliability has been the subject of three human-playtest complaints (Chapter One's oak deadlock, Chapter Four's
> disappearing friends, Chapter Five's "followers on a string"), each fixed at the root.

## Three layers of code

| Layer | Module | Used in | What it does |
|---|---|---|---|
| Group riding | [dist/friends.js](../../dist/friends.js) | Prologue (and Ch2's memory) | Individual riders in formation; each goes home in a small readable sequence (ride in, stop, get off, deal with the bike, walk inside) |
| World-space companions | [dist/companions.js](../../dist/companions.js) | Ch1–5 | Follow the path you actually rode/walked; scripted **steps** (`rideTo`, `brake`, `dismount`, `mount`, `drop`, `kickstand`, `lift`, `walkTo`, `turnTo`, `idle`, `pebble`, `climb`, `toward`, `act`…, run as a list by `comp.run`); routing round obstacles (`routeTo`, A* `nav.walkPath` only when a straight line is blocked, at most every 0.35 s); the oak fix (`yieldsTo`, stall watchdog, shuffle aside, turn their bikes round with you); `footBoost` (Ch4) |
| Goal-based minds | [dist/companion-brain.js](../../dist/companion-brain.js) + [dist/chapter5-places.js](../../dist/chapter5-places.js) | Ch5 (any chapter can switch it on) | Decides what a friend does while he is free to choose, on top of the step system |

## Chapter Five minds (`companion-brain.js`)

- **Goals:** `idle`, `follow`, `lead`, `wait`, `inspect`, `aside`, each with **hysteresis** (a goal must stop making sense
  for a while before it changes; tests count flip-flops).
- **Where he stands** is scored from where you are and the way you have been *walking* (your trail), **never from where
  you look** (turning the mouse no longer swings anyone round). Two friends never settle on the same spot; walked into, he
  steps aside once.
- **Reaction:** he notices you have gone after his own reaction time and sees your speed **as it was a moment ago**
  (`seenSpeed`); accelerates and brakes at his own rates. On the bike: delayed perceived speed, his own braking (1.5–2.3 s
  to stop), a wandering lag.
- **Personalities** (`PERSON`):

  | | Jamie | Sam |
  |---|---|---|
  | Reaction | 0.35–0.85 s | 0.65–1.25 s |
  | Position | Leads, on your right | Hangs back, on your left |
  | Curious after | 7–13 s | 10–17 s |
  | Likes | odd things, water, climbing, views | maps, signs, records, supplies |
  | Speeds (walk/brisk/jog/run) | 1.45 / 2.05 / 3.1 / 3.9 m/s | 1.35 / 1.9 / 2.9 / 3.75 m/s |
  | Looks back | every 6–10 s | every 3–6 s |
  | Gestures | hips, shift, look around, scratch, stretch | cross arms, pockets, shift |

- **Moods** per scene (distances in metres):

  | Mood | Comes after you beyond | Personal space | Reaction scale | Wanders to points of interest |
  |---|---:|---:|---:|---|
  | relaxed | 5.6 | 1.55 | 1.0 | yes |
  | explore | 5.2 | 1.45 | 1.0 | yes |
  | tense | 3.6 | 1.25 | 0.6 | no |
  | danger | 2.8 | 1.1 | 0.3 | no |
  | escape | 2.4 | 1.0 | 0.15 | no |

- **Navigation recovery:** no progress for 2.2 s → a fresh path, then a different way round. A failed Pine Ridge path
  search is remembered for the next 45 identical asks (a frame-freeze fix).
- **Bikes:** each walks to his own bike, kicks the stand up, mounts with the animation, rides to the end of the driveway
  and waits.

## Earlier chapters' guarantees

- **Ch1:** varied riding/walking formations; bounded continuous catch-up; no offscreen teleport reset.
- **Ch2:** the oak deadlock fixed (the friend farther along the trail goes first; stall watchdog; 120-trial randomized sweep,
  0 stuck); companions route round fences and through gaps; stand across a clue from you.
- **Ch3:** roles in the drain (`lead` Jamie 3.6 m ahead, `behind` Sam 2.3 m back, `beside`, `point`, `run`); `hold()` and
  `glance()` for staged reactions; Jamie won't leave if you turn back ("I'm not leaving.").
- **Ch4:** four root causes of "disappearing" fixed: on-foot speed cap below the player's sprint (now `footBoost`: up to
  3 m/s × a boost of 1.2, or 1.45 when hurrying — 3.6–4.35 m/s), stand spots that held them (let go beyond a 12 m leash), routes that never progressed, and darkness
  hiding them. A guard puts a truly stuck boy back on your trail out of sight (counted; fired in no route run). Worst
  distances: sprint 12.6/12.0 m; every escape route ≤ 14 m.
- **Ch5:** a guard and **make way** (a friend in your path steps 1.5 m aside, only onto walkable ground). Stress test:
  farthest 10.3 m sprinting round the camp; the run: farthest 7.2 m and 9.4 m.

## Chapter Five companion tests (`tests/chapter5-companions.mjs`, A–H)

A: a minute standing still — they settle, no pacing. B: a sudden sprint — they go after a moment (Jamie 1.57 s, Sam
2.17 s), not together. C: a sudden stop — they walk on a step or two. D: walking away and back — no flip-flopping. E:
they get on their own bikes. F: 216 s round the camp — median 3 m / 3.2 m. G: inside the office — nobody walks through
anybody. H: the run — they run and keep with you.

## Contracts (from the Astra prep handoff — keep)

Goals, moods, personal space, reaction delays and the `PERSON` table. Replacing the character models must keep the rig's
IK targets (`rig.js` `P`) and `applyPose`.

## Known issues

Sam can linger in Owl after taking the shirt in some runs (until the guard brings him back out of sight). Idle variety is
thin (they hold one pose for long stretches and look straight at you). Companion seated "legs over the edge" reads as
straight legs from some angles.
