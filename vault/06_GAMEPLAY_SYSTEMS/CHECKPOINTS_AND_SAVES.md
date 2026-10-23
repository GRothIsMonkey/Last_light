# Checkpoints and saves

## How saving works

- **Silent checkpoints.** No save icon or menu during play. The only UI is **Continue** inside the title menu, with the place
  name next to it.
- Stored in the browser's `localStorage`: one checkpoint store, `lastlight.chapter1` (`{section, at}`), written by Chapter
  One's kit; Chapters Three, Four and Five save through the same kit function (`k.checkpointTo(id, label)` in
  `dist/chapter3.js`, `chapter4.js`, `chapter5.js`), and labels are registered at startup so Continue shows them after a
  reload. Chapter Four's carried items are in `lastlight.chapter4`; settings in `lastlight.settings`.
- **Start over** (pause menu or end card) replays from the prologue and resets every module (companions, adults, doors,
  lights, clues, tension, captions, timers, audio).
- A **checkpoint is a jump**: Continue restores through the chapter's own QA initializer, which sets every flag of the
  earlier beats, the clock and sky, positions, bikes, doors and gates, and props.

## Checkpoints by chapter

| Chapter | Checkpoints (Continue labels where known) |
|---|---|
| 1 | Alex's house (after the title) · Jamie · Sam · the oak · the retrace · the creek |
| 2 | Behind the creek (`chapter2-start`) · Alex's bike (`bike-found`) · The police (`police-arrival`) · The next morning (`morning`) · The oak, morning (`morning-oak`) · Where Alex turned (`briarwood-memory`) · Briarwood, morning (`chapter2-end`) |
| 3 | `chapter3-start`, `c3-alex-house`, `alex-bedroom`, `phone-recording`, `neighbor-investigation`, `c3-road-day`, `night-start`, `c3-road-night`, `c3-tunnel-entrance`, `c3-tunnel-deep`, `c3-old-bike`, `c3-alex-lure`, `c3-creature-reveal`, `c3-creature-chase`, `c3-road-escape`, `chapter3-end` (older saves `c3-figure`, `c3-voice`, `c3-escape` still continue) |
| 4 | The next afternoon · Alex's camera · Main Street · The library · The microfilm · Ten to eight · The streetlights · The Lantern Video · Out the back · The Lyric · The picture · The old oak (`chapter4-start` … `chapter4-end`) |
| 5 🟡 | The next afternoon · The Old Reservoir Road · Pine Ridge · The place in the picture · The yellow gate · Camp Whippoorwill · The campfire · Owl · The camp at night · Run · The lamp in the lot · One light (`LABEL5` in `dist/chapter5.js`) |

## QA jumps (developer tool)

- In `?qa` mode: `lastLight.jump(section)`; outside QA mode: add `?jump=<section>` to the URL and press Start.
- Sections per chapter: Ch1 11, Ch2 10, Ch3 34 (+aliases), Ch4 42 (+13 aliases), Ch5 37 (+27 aliases: `SECTIONS5`,
  `ALIAS5`). Each starts shortly **before** its event so it can be played.
- The `?qa` hook (`window.lastLight`) also exposes `start()`, `step(seconds)`, `press/release/key(code)`, `look(yaw,
  pitch)`, `walkTo`, `place`, `placePlayer`, `drive`, `render()`, `reset()`, `toTitle()`, a `state` snapshot, the
  `world`/`friends`/`ambient`/`ui`/`interact`/`ending` objects, `chapter4`, `chapter5`, `nextChapter()`, `devScene(n, id)`.

## Known issue (observed, not fixed)

Chapter Two's `homeAt` is set with `??=` in `c2-home`, so on a second playthrough in the same page the 40-second "go home"
fallback can fire early (a small pacing difference; reported in `docs/DEV_CHAPTER_SELECTOR.md`, left as shipped). The DEV
selector clears these keys.
