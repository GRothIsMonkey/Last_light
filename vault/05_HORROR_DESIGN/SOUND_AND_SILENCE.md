# Sound and silence

> **Status: every sound in the game is synthesized placeholder audio, and no person has ever done a listening review.**
> There are no recorded voices. Every chapter is built to be readable **muted**. This is the single largest gap between
> the design and the experience. See also [Audio direction](../07_VISUAL_AND_AUDIO/AUDIO_DIRECTION.md).

## How sound is used for horror (implemented hooks)

| Device | Where | Implementation |
|---|---|---|
| **The bell** (twice) | Ch1 far off; Ch2 deep in the culvert (2.9 kHz low-pass, echoes 0.09/0.21 s); Ch3 recording; Ch3 drain; Ch5 the dinner bell ringing itself | `audio.bell(pos, gain, {tunnel})`, `audio.bell3` with HRTF `PannerNode` placement (Ch3) |
| **The dead bell** | The old bike's bell: a dry rusted click, no ring | `sfx('oldBell')` |
| **Ambience dropout** | Ch3 (structural pass, kept as a tool): traffic, then street noises, then insects drop away layer by layer as you go deeper; Ch4: everything stops at the marquee | `chapter3.amb` scales traffic/life/insects/wind; Ch4 ambient hooks to zero |
| **Familiar voices** | Alex's "Jamie?" (Ch3 culvert, Ch4 phone, Ch5 Owl); Sam's mother (Ch5) | `audio.voice(word, pos, {tunnel})`: a small formant synthesizer at a 12-year-old's pitch |
| **Heartbeat and breath** | Driven by authored tension (Ch3 on) | [Tension and heartbeat](../06_GAMEPLAY_SYSTEMS/TENSION_AND_HEARTBEAT.md); beat-scheduled "lub-dub" 52/60 Hz; breathing from tension 0.42 |
| **The recording** | Alex's phone: fan, insects, two bells, "There it is again." | `audio.recording(i)` through a phone-speaker chain; captions timed exactly |
| **Relay clunks** | Each streetlight the Presence takes (Ch4) | Hooks fire; sound mostly placeholder |
| **The creature** | Footfalls/splashes per bound, impacts at the gate and the culvert | Placeholder hooks (`move`, `step`, `impact`) |
| **The phone ring, static, wind** | Ch4 video store | Hooks |
| **Siren with Doppler**, radio, TV through a wall | Ch1 | Loops and one-shots in `dist/audio.js` |

## Silence as a tool (keep)

- **The held wait** before a scare (Chapter Three's rebuild waited at least 5.5 s, then 6.2 s, before its scares).
- **The night sounds stopping** ("Why'd everything stop?").
- **Total stillness** under the marquee ("[It goes quiet. No wind. Nothing.]").
- **The quiet after**: the end of each chapter is near-silent ("The chapter ends almost in silence: one low open fifth,
  held and let go." — `dist/audio.js`).

## Muted readability rule

Every sound that matters must also show:

- on **Jamie and Sam** (heads turning, lights snapping round, freezing, recoiling, clustering);
- in **captions** (spoken lines; bracketed narration such as "[Behind them, a light goes out.]");
- never through arrows or HUD indicators.

## What the listening pass must judge (outstanding)

Siren harshness and Doppler; near/far balance; the radio and TV; footsteps; the bell's two distinct strikes; the
heartbeat (no tuning done); the creature (wet footfalls, breath, steel gate); the voices ("meant to be uncertain whose");
the camp at night; transitions. Listening copies and review pages exist in `docs/qa/audio/` and `docs/qa/audio-review.html`
(earlier chapters).
