# Audio direction

> **Current state:** all audio is **synthesized at runtime** ([dist/audio.js](../../dist/audio.js), Web Audio; "nothing
> plays before the player asks"). There are **no recorded voices** and no third-party sound assets. Offline renders have
> been checked as **signals only** (finite, non-silent, peak below 0.95, loop continuity, timing). **Nobody has listened
> to them.** This has been outstanding since v0.1 (2026-09-29). The game is built to work muted.

## What exists

| Layer | Sounds |
|---|---|
| Riding | Rolling, wind, surface, a speed-scaled chain while pedaling, freewheel when coasting, curb thump and rattle, the bell |
| Neighborhood | Cicadas, birds (day), crickets and katydids (night), traffic, air conditioners, a TV, a sprinkler, a transformer hum, a dog |
| Story one-shots | Tap, pebble, window, click, squelch, car door, door slams, fence, chain, blinds, thud, the rusted bell click, creak, cloth, pebble, splash |
| Police | Siren (wail/yelp/wind-down, Doppler, muffling behind houses), radio |
| Horror | The bell (HRTF-placed), Alex's synthesized voice ("Jamie?", "Guys?"), the culvert loop, heartbeat and breath, relay clunks, phone, static |
| Memory | A 1.9 kHz low-pass over the remembered ride |
| Endings | "One low open fifth, held and let go." |

## Direction (what it should become)

- **Horror depends on sound.** The 2026-10-23 mandate (meaningful jumpscares, terrifying encounters, dread) will need real
  sound design: the bell's two strikes, the creature's wet footfalls and breath, the steel gate, the culvert voice
  ("meant to be uncertain whose"), the camp at night, the silence after a cascade as a *designed absence*.
- **Voices:** decide whether lines will be voice-acted. `faces.js` already exposes `speakAudio(env, rate)` so recorded lines
  can drive lip sync.
- **Nostalgia:** the summer evening bed (cicadas, sprinklers, distant traffic) is the emotional baseline; its loss is a
  horror tool (ambience dropout).
- **Muted readability stays a rule** even after audio improves.

## The outstanding listening pass

A person should listen for: siren harshness/Doppler; near/far balance; radio and TV; footsteps; transitions; the bell's
two strikes at a comfortable level; the heartbeat (never tuned); the creature hooks; the camp at night. Listening copies:
`docs/qa/audio/` (MP3s) and `docs/qa/audio-review.html` (earlier chapters).

## Status

💤 Deferred across all chapters. Track in [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md).
