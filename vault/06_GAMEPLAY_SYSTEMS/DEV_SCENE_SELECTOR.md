# DEV scene selector (TEMPORARY)

> **A private-playtest tool. It must not ship.** Full documentation: [docs/DEV_CHAPTER_SELECTOR.md](../../docs/DEV_CHAPTER_SELECTOR.md).
> Code: [dist/dev-chapters.js](../../dist/dev-chapters.js) (picker and `startScene`), [dist/dev-chapter-history.js](../../dist/dev-chapter-history.js)
> (**generated**, never edited by hand). Created on `claude/chapter3-private-playtest` (2026-10-05); carried on every
> branch since.

## Using it

On the title screen, bottom-right: a dashed box **DEV · PLAYTEST · TEMPORARY**. **1 · Chapter** → **2 · Scene** →
**START SCENE**. Only on the title, so it cannot be pressed during play. To switch: Esc → **Back to the title** → pick
again. "Preparing…" shows for one to five seconds.

## Scenes (137)

| Chapter | Count | How the start works |
|---|---:|---|
| Prologue | 9 | New game, warps along the street, the game riding on (muted) through departures |
| Chapter One | 9 | Title start; checkpoint jumps; the final bell via the real F at the reflector |
| Chapter Two | 11 | The real hand-over from Chapter One's last scene; jumps |
| Chapter Three | 29 | Hand-over from Chapter Two; jumps (tunnel, figure, creature, chase stages, gate, road…) |
| Chapter Four | 42 | **Chapter Four Start** = the real hand-over (Chapter Three's end checkpoint → end card → **Chapter Four** button); the rest are QA jumps (incl. Creature Notices Presence, Creature Cowering / Fear, Alley Route A/B, New Alex Message) |
| Chapter Five | 37 | **Chapter Five Start** = the real hand-over from Chapter Four's end card; then Sam's Garage … Chapter Five Ending (one light) |

## How a scene is made canonical

1. **Clear everything first** (chapter state objects emptied; every adult and the night-ride position reset; companion
   scripts dropped; then the game's own Start over).
2. **Enter through the game's own code** (a hand-over or the chapter's own `jump()`); nothing placed by hand.
3. **Add what earlier beats left behind**: `HISTORY[n]` and `SCENE_HISTORY[scene]`, recorded from a natural playthrough
   by `QUICK=1 ONLY=dev-record node tests/verify.mjs`.

On the Chapter Five repair, each scene also sets the repair's state as a player would have it (props in bags minus what
was handed out, the yellow gate open or shut, the flashlight in hand and batteries changed, the shirt in Sam's bag, the
new afternoon clock, the three lights' route fresh) and **switches the repair's shared-code features on for Chapter Five
and off for Chapters 0–4**.

## Verification (what "works" means here)

- Natural vs DEV start compared field by field: **0 differences** (46 scenes compared in Chapters 0–3; Chapter Four and
  Five starts equal to the natural arrival on the first frame after the hand-over, except running clocks and documented
  ignores).
- Switching chapters in one session leaks nothing (e.g. 5→1→5→4→5→0→3→5).
- 18 key Chapter Five scenes start **before** their event.

## Removing it (before any public release)

Delete `dist/dev-chapters.js`, `dist/dev-chapter-history.js`, `tests/dev-chapters-sim.mjs`, `tests/dev-chapters-browser.mjs`
and the DEV QA folders; remove the blocks marked `TEMPORARY` in `dist/game.js`, `dist/index.html`, `dist/style.css`,
`dist/chapter2.js` and `tests/verify.mjs`. (Exact list in the source doc.)
