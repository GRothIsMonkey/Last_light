# Tension and heartbeat

Introduced in Chapter Three's structural pass (✅, kept through the rebuilds); reusable by any chapter. Code:
[dist/tension.js](../../dist/tension.js) (`createTension()`), body sounds in [dist/audio.js](../../dist/audio.js)
(`audio.updateBody`). Source: [docs/ASTRA_CHAPTER3_HANDOFF.md](../../docs/ASTRA_CHAPTER3_HANDOFF.md) §6.

## The model

- **One value, 0 (calm) to 1 (panic), authored by the story** — never computed from distances. The chapter sets it at beats.
- API: `set(target, {rise, fall, hold})`, `jolt(level, {rise, hold})`, `ease(level, {fall})`, `reset()`. Rising is an eased
  approach with a capped rate; falling is a slow exponential decay after an optional hold. Per-frame change never exceeds
  the authored rise rate (max 2.0/s measured, at the close bell).

## What it drives

| Output | Behavior |
|---|---|
| **Heart rate** | 64 → 152 bpm (`rest + span·x^1.25`); audible from tension 0.2, full by 0.75 |
| **Heartbeat sound** | Two soft low thumps ("lub-dub", sine 52/60 Hz, low-passed) **scheduled beat by beat on the audio clock** (no loop seam); beat-to-beat tempo change limited to −7%/+7.5%; silent when calm; its own bus, not placed in the world |
| **Breathing** | Band-passed noise in/out from tension 0.42 (and with exertion; a sprint adds breath, and heartbeat only once already afraid) |
| **Body** | On foot only: a few millimetres of chest rise with the breathing; above 0.7, a faint sway |

## Authored curve (Chapter Three night, structural pass)

home 0.04 → road 0.14 → "everything stopped" 0.30 → bike gone 0.38 → first bell 0.52 → second bell 0.60–0.62 → waiting
0.66 → "Jamie?" 0.84 → "Guys?" 0.93 → bell behind 1.0 (held 30 s) → under the streetlight easing to 0.42. Day: only small
rises (the recorded bell 0.24–0.31, the old bike 0.22).

## Used later

Chapter Five calls `T.set(...)` with reasons (for example `why:'the time'`, `why:'the last picture'`) and resets it at the
chapter start.

## Known limits

No heartbeat tuning or human listening has been done ("no heartbeat tuning" noted in the creature-chase handoff). It is a
strong tool for the new horror mandate once audio gets a real pass.
