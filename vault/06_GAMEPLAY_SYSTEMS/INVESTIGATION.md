# Investigation

How the player finds things: objectives, "look closer", hints, evidence, memories, records.

## Objectives

- Shown under the date line (`#objective`, with a quieter note `#objective-note`), short and plain: *See what's happening
  on Briarwood.*, **Find Jamie.**, **Follow the sound.**, **Go back to where Alex turned.**, **Run.**, *Check the last
  cabin.* (with *Owl, past Bluejay and Heron, at the west end.*).
- Reminders are memory-flavored, never arrows: "Back on Oak Hollow. The red chair on his porch."
- Objectives remain visible when spoken captions are off.

## "Look closer" (F)

A camera pose toward the thing (crouching for low things), with the friends' reactions. Examples: the reflector (Ch1),
Alex's bike and the empty clip (Ch2), the old bike and its sticker, "Try the bell" (Ch3), Mason's window (Ch4), the
register and search map (Ch5). In Chapter Five, while looking closer, **V** photographs the evidence.

## Evidence design rules

- Evidence is **physical in the world** (marks draped on terrain, props, pages), named for tests (`evidence-tire-mark`,
  `evidence-flattened-weeds`, `evidence-scrape`).
- **Nothing implies injury**: no blood, no body.
- **Evidence is never found for the player** (Chapter Five rule): progressive hints (dialogue → a plainer objective → a
  friend standing at the place); the photo match gets easier to line up after four minutes. Getting somewhere is pulled
  along by the boys; only after a long while does a fade carry you. Optional moments move on with a line.
- Earlier chapters had friends do it after a while (Ch1: Jamie spots the reflector after 38 s; Ch2: the bike inspection
  starts on its own after 16 s; Ch4: Jamie takes the TV picture after 15 s).

## Records and reading

| Chapter | Medium | Controls |
|---|---|---|
| 3 | Alex's flip-phone voice recorder (the 08/20 11:52 PM recording first; four older ones optional) | F; captions timed exactly to the audio (`RECS` in `dist/chapter3.js`) |
| 4 | Microfilm reader (*The Oak Hollow Courier*): the page fills the view; each record is also a caption | A/D winds the film; S gets up; idle → "Next one." (22 s ×2), then it winds on |
| 5 | The camp register (1991): pages read aloud | A/D; V photographs |
| 5 | Maps: Sam's county map (garage), the trail kiosk map, the search grid map | Look / F |

Canvas art for pages, signs and maps is drawn at load (`dist/pine-art.js`, Chapter Four's archive canvas in
`dist/chapter4.js`).

## Remembering (Chapter Two)

A reusable, data-driven memory system ([dist/memory.js](../../dist/memory.js)); `game.js` hosts the remembered ride.

- A memory is data in `MEMORIES`: `from`, `to`, `lat`, `speed` keys, `lines`, `watch`, `detail` (a `friends.js` hook),
  `lookAt`, `focus` (a gentle FOV narrowing), `look` (head-turn limits), `until`, `max`.
- **F — Remember** at the Briarwood corner (on foot or stopped on the bike; no precise facing needed; persists while you
  linger or look away; Jamie's one reminder after 12 s: "Try to remember exactly what he did.").
- It replays the evening ride from your eyes, warm (CSS filter + scene light) and muffled (1.9 kHz low-pass), with a
  separate cast so the present is never disturbed; you return exactly where you were.
- The only memory: `alex-turns` (detail `alex-glance`: Alex all but stops for 3.4 s, head turned ~50° toward the creek woods).

## Tracking

All clues by thread: [Mystery and clue tracker](../01_STORY_BIBLE/MYSTERY_AND_CLUE_TRACKER.md).
