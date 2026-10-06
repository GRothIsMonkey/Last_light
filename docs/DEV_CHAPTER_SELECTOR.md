# DEV chapter selector (TEMPORARY, private playtest build only)

Branch `claude/chapter3-private-playtest`, made from the finished Chapter Three commit
`8f06b2bb3b8f545243c75f3644627cb8a217d7ec` (`claude/chapter3-horror-investigation`, unchanged).
Nothing here belongs in the shipped game. The finished Chapter Three branch does not contain it.

**Carried on `claude/chapter3-horror-rebuild`** (the Chapter Three horror rebuild) as its first commit, so the
rebuild can be playtested from any chapter. Everything below applies there unchanged, except that the
rebuild's evidence is in `docs/qa/dev-chapters-rebuild/` (the files in `docs/qa/dev-chapters/` are the
playtest build's, kept as they were).

## Using it

The title screen has a dashed box in the bottom-right corner: **DEV · PLAYTEST ONLY — START AT CHAPTER**,
with **Prologue**, **Chapter One**, **Chapter Two** and **Chapter Three**. It exists only on the title,
so it cannot be pressed during play. To switch chapters mid-session: Esc, then **Back to the title**, then
another button. While a chapter is being prepared the box shows "Preparing Chapter …" (one to five
seconds), and then the chapter starts. **Take the long way home**, **Continue**, **Start over** and the
end-of-chapter menus work as before.

## Where each button starts

| Button | Starts at | Arrived at the way the game itself arrives there |
|---|---|---|
| Prologue | the first frame of the ride | Start over (`resetState()` + `start()`), the same as a new game |
| Chapter One | phase `leave`, riding out of the cul-de-sac | the game rides the last 30 m into the lookout, stops, plays the finale (the call, "time to go home", full night), then runs `leave()`, which is what pressing F → "Go home" calls |
| Chapter Two | phase `c2-black`, black, the CHAPTER TWO card about to show | Chapter One's last scene (the creek checkpoint), the real F at the reflector, then the game runs (muted, behind black) until Chapter One's own ending calls `chapter2.begin()` |
| Chapter Three | phase `c3-black`, black, the CHAPTER THREE card about to show; then the Briarwood corner (`d3-corner`) | Chapter Two's last scene (the `chapter2-end` checkpoint), then the game runs until Chapter Two's own `end()` calls `chapter3.begin()` |

## How the state is made canonical (`dist/dev-chapters.js`)

1. **Clear everything first.** Chapter One's, Two's and Three's per-run state objects are emptied
   completely (their `fresh()` functions only refill a fixed list of keys). Every grown-up (police,
   parents, neighbours, searchers) and the night-ride position are put back exactly as the page created
   them (walking speed, pose and gesture blend otherwise carry over between runs). Companion scripts,
   routes and gazes are dropped. The recording on Alex's phone is stopped. Then the game's own Start over
   (`resetState()`) resets every module: tension, heartbeat and breathing, captions, dialogue queue,
   objectives, timers, bells, voices, audio.
2. **Enter through the game's own code**, as in the table above. Nothing is placed by hand.
3. **Add what the earlier beats left behind.** The checkpoint scenes do not know which windows were
   tapped, that Jamie gave you the spare flashlight, the siren, Chapter Two's evidence and police flags,
   the reflector lens, or the Continue save. That history is in `dist/dev-chapter-history.js`, which is
   **generated** from a natural playthrough (`QUICK=1 ONLY=dev-record node tests/verify.mjs`), never
   written by hand. Timestamps in it are stored as "seconds before now" on their chapter clock and
   re-based when applied.

There is no second, hand-kept list of story flags.

## Verification

**Simulation** (`tests/dev-chapters-sim.mjs`, run by `npm test`). The main run plays the prologue and
Chapters One to Three naturally with inputs. The state is recorded in the frame each chapter's `begin()`
runs (and, for Chapters Two and Three, again when the title card gives way to the opening scene). Each
selector start is then compared field by field: game variables, player, flashlight, Chapter One/Two/Three
state and flags, companions (active, mode, follow, visibility, script, positions), grown-ups, police cars,
props, sky/sun/hemisphere lighting, doors and garages, prologue friends, memory, tension and heartbeat,
caption mode, audio, date, objective, title card, fade, body classes, prompt, and the Continue save.

Result: **0 differences** outside the list below for Chapters One, Two and Three, at the hand-over and at
the opening scene. The prologue equals a new game on a fresh page. Switching 3→1→2→3→0→2→1→3 in one
session, and switching after playing Chapter Three to its close bell with a recording playing, gives
every start **identical** to a clean start of that chapter. On the rebuild the simulation also switches
**3→1→3→0→3**, with the same result (and found one leak on the way, now fixed: the figure's position along
the drain survived Start over).

**Browser** (`tests/dev-chapters-browser.mjs`, Chromium): real clicks on the title buttons, each start
compared with the simulation's natural snapshots (`docs/qa/dev-chapters/natural-snapshots.json`) with
the same rules; pointer lock as for the title's start button; switching 3→1→2→3→0→2 (on the rebuild:
3→1→3→0→3→2) through Esc → Back to the title with no leaks; normal (non-QA) mode; then Chapter Three played from the DEV start to its end
card with inputs and no QA jump. Report: `docs/qa/dev-chapters/dev-chapters-browser-report.json`.

### Differences that are intentional (not compared, and why)

- **Clocks and timers**: elapsed-time counters (chapter clocks, the game clock) and running timers (title
  card, dialogue gaps). Timestamps are compared after conversion to "seconds ago"; at the opening scene
  they may differ by under 0.5 s, because the pause after the previous chapter's last line may still be
  counting down at the hand-over.
- **Chapter One's dad's errand timer** (`dadCall`): re-scheduled with `Math.random()` each time it fires;
  two natural playthroughs differ here too.
- **Police light flash phase**: which lamp is lit this frame (random phase per car).
- **Where you were when the previous chapter ended**, and which way you faced: the player, companions
  and grown-ups keep their spots at a hand-over, which depend on how that chapter was played. These are
  checked to be in the same place (within 15 m) instead of equal; headings are not compared.
- **Chapter Two's searchers' progress** along their walking routes in the morning (how long Chapter Two's
  dawn ran). They are hidden for the night in Chapter Three.
- **The prologue's lookout values**, never read after you leave it: how long you lingered, the ride
  section header index, and which optional things you did there (bench, swing, chalk, looking back for
  the other bike and the fifth rider).
- **A friend who has gone home (Alex)** keeps whatever mode label he left in; never read again.
- **A rider's stored on-foot position** (the rider is attached to the bike) and **a parked, inactive police
  car's stored position** (placed when activated).
- **The Continue save for the prologue and Chapter One**: profile data. A natural arrival on a fresh
  profile has none; a profile that has played before keeps its save, as Start over does.
- **A key not created yet versus its reset default** (`undefined` versus `null`, `false` or `0`).

## Removing it

Delete `dist/dev-chapters.js`, `dist/dev-chapter-history.js`, `tests/dev-chapters-sim.mjs`,
`tests/dev-chapters-browser.mjs`, `docs/qa/dev-chapters/` (and `docs/qa/dev-chapters-rebuild/`) and this file; remove the blocks marked
`TEMPORARY` in `dist/game.js`, `dist/index.html`, `dist/style.css`, `dist/chapter2.js` (a read-only
accessor) and `tests/verify.mjs`. Or simply never merge this branch.

## Observed, not changed

The game's own Start over leaves keys that only later beats create in Chapter One's and Two's state
objects, because their `fresh()` refills a fixed list of keys (`approachT`, `talkOrigin`, `dpRate`;
`discT`, `copT`, `arrive`, `callAt`, `homeFrom`, `homeAt`). Most are written before they are read. One
is not: Chapter Two's `homeAt` is set with `??=` in `c2-home`, so on a second playthrough in the same
page the 40-second "go home" fallback is measured from the first run's time and can fire early. That
is a small pacing difference, not a blocker; it is reported here and not fixed (Chapter Two/Three are
not to be changed in this branch). The selector clears these keys. Start over is left as shipped.
