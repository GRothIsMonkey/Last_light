# The 2026 coda (Ending A): handoff

Branch `claude/aftermath2-2026-final-coda` (see [AFTERMATH2_IMPLEMENTATION_HANDOFF.md](AFTERMATH2_IMPLEMENTATION_HANDOFF.md)
for the source commit). Code: `dist/coda2026.js`, wired in `dist/game.js`. Reached from Aftermath II's end card
(**One more lap →**), from Continue at any of its checkpoints, and from DEV → **2026 · Credits**.

## 1. What the player sees

1. **The Prologue image.** The game seems to have gone back to its beginning: the summer street in the golden light,
   August 21, 2011, 7:4x PM in the corner, the wordmark, Jamie, Sam and Alex riding with you, the old melody, the
   Prologue's own lines. It is the game's real Prologue ride (`game.js` riding state, `friends.js`, the evening light),
   on autopilot: you can look around and ring the bell; the bike rides itself.
2. **The pullback (about 46 s).** Very slowly the view begins to move back. At its first frame the picture is exactly the
   picture that was on screen a frame before (see §3), so there is no cut. The edges of a monitor's bezel come into the
   corners; then the desk, the lamp, a sticky note on the bezel ("AUG 21 / 7:42 PM / the light"), a cork board; the
   back of a man's head; over his shoulder. The Prologue keeps playing on the screen, its date line, captions and
   wordmark drawn on the screen where the page drew them, shrinking with it.
3. **The room (2026).** A small room at night: a desk against the wall, a lamp, the monitor with the Prologue on it, a
   window with the dark blue night and a few lit windows across the way, a shelf, a chair with a jacket. The date line
   becomes **AUGUST 21, 2026 · 11:48 PM**. On the desk: Sam's notebook (fifteen years on it), the photo-booth strip of
   the four of them propped against the lamp, **Jamie's cap only if Aftermath I's save says you kept it** (never Alex's
   camera: that went back to his parents). On the wall: his hand-drawn map of Oak Hollow (ME, ALEX, JAMIE, SAM, THE OAK,
   "the long way home"), index cards in his writing (PROLOGUE..., "ALEX rings twice. every corner.", "JAMIE cap
   backwards when he rides", "SAM fixes the chain (backwards, slow)"), and the Sunday print.
4. **The reveal is visual first.** No narration says it: the man at the desk is the protagonist at twenty-seven, and the
   game on his monitor is the one you have been playing. The cards, the map and the objects say he made it from what
   happened. Nothing frames it as a dream or imagined: the room, the notebook and the pictures are the real ones, and
   the screen shows his recreation of real events.
5. **The line.** He takes his hands off the keys; on the screen the bike rolls to a stop and the others wait for him up
   ahead. He turns to the photograph and says, as a caption (no synthesized voice): **YOU: "I still remember."**
6. **The title.** The monitor's picture dims and **LAST LIGHT** comes up on it; the Prologue melody returns.
7. Fade to the credits ([FINAL_CREDITS_AND_RELEASE_HANDOFF.md](FINAL_CREDITS_AND_RELEASE_HANDOFF.md)).

Total: ride 24 s + pull 46 s + room 13 s + line 12 s + title 9.5 s + fade 3.4 s, about 1 min 50 s. The ride hands over
to the pull only between captions, so no line is cut off.

## 2. Stages and checkpoints

| Stage | Section (Continue / DEV) | Notes |
|---|---|---|
| ride | `coda-start` | The Prologue from d 0, autopilot, its lines on. |
| pull | `coda-pullback` | Starts the pull already swapped (screen fills the view). |
| room | `coda-room` | DEV has two variants: the cap kept, and the cap with his mother (no cap on the desk). |
| line | `coda-line` | Hands off the keys, the look to the strip, the line at 6.2 s. |
| title | `coda-title` | LAST LIGHT on the monitor. |
| credits | `coda-credits` | Straight to the credits. |

## 3. How the pullback stays seamless

- The world is rendered into a half-float render target whose texture is marked sRGB and flagged so three.js applies
  the same tone mapping and output encoding to it as to the canvas. The monitor's screen is a raw-output shader (no
  second tone mapping or encoding), so the screen's pixels are the canvas's pixels.
- The monitor's screen has the window's aspect ratio (`shapeMonitor`) and the room camera starts at the distance where
  the screen exactly fills its field of view (`d0 = (h/2)/tan(fov/2)`), looking straight at it; its first frame matches
  the last frame of the plain render.
- The page's chrome is measured with `getBoundingClientRect` at the swap (date line, caption, wordmark) and drawn on an
  overlay canvas on the screen at the same places, then hidden on the page; from then on it moves with the screen.
- The camera moves on a Catmull-Rom path (`PATH`) with an ease that does almost nothing for the first seconds (just the
  bezel entering), then glides back and to the right over his shoulder and settles; the field of view narrows a little
  (64 → 50) so the room reads as a room, not a fisheye.
- The screen picks up a faint vignette and the lamp's reflection as it recedes; the room is lit by the desk lamp (a
  warm spot with shadows), the monitor's glow, the window and a low hemisphere fill.

## 4. The man (provisional)

`YOU26` in `aftermath2-actors.js`: the protagonist's own model (`CAST.player`) at adult scale (1.16), aged face numbers,
cropped dark hair, a long-sleeved shirt, with `ageHead` adding a trace of stubble. Marked PROVISIONAL (A-20) for the art
pass. He is posed seated, hands on the keyboard and mouse, breathing; `poseMan` turns his head to the strip for the
line and mouths it.

## 5. What is decided, and what is not

- Decided here: the date (August 21, 2026, the fifteenth anniversary of the Prologue's evening, 11:48 PM); the
  objects on the desk and wall; the line is a caption only.
- Follows the saves: the cap (desk only if kept); the Sunday print (on the board if you had it).
- Not decided: whether he has a name (he does not here, as in the whole game); his face is a provisional derivation.

## 6. Known limits

- The room's props are simple (boxes, canvases); the man is the game's stylized rig at adult proportions.
- The seamless first frame was checked in software WebGL (SwiftShader) captures; a GPU pass should confirm it on real
  hardware and at unusual window sizes (the monitor's aspect is clamped to 1.2–2.6).
- Nothing supernatural appears in the coda; there is no post-credits scene.
