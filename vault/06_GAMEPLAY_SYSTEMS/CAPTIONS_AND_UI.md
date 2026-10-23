# Captions and UI

## Interface ([dist/ui.js](../../dist/ui.js), [dist/index.html](../../dist/index.html), [dist/style.css](../../dist/style.css))

- **Title:** "Take the long way home" (start), **Continue** (only inside the title menu, with the place name), Settings,
  Credits, and the full controls list (the only place it appears). The temporary DEV selector box sits bottom-right.
- **Pause (Esc):** Keep going, Settings, Start over, Back to the title. Esc closes an open panel first.
- **Prompts:** contextual only; the key that matters right now appears at the bottom.
- **Cards:** `#title-card` (LAST LIGHT), `#chapter-card` (CHAPTER TWO …, THE PLACE IN THE PICTURE), `#ending` end card with
  `#next-chapter` (shown at the ends of Chapters Three and Four; hidden at the end of Chapter Five).
- **Objectives:** `#objective` and `#objective-note` under the date line (e.g. `AUGUST 24, 2011 · 3:37 PM`).
- **Memory lines:** a soft overlay (`dist/nostalgia.js`): each line once, never over a friend's line, never back to back;
  can be switched off.
- **Settings** saved in `localStorage['lastlight.settings']` (fail-safe).

## Captions

| Chapters | Style |
|---|---|
| 0–2 | Warm-white 22 px type with a compact charcoal backing, a separate speaker label, a short final fade (Chapter Two's Astra polish) |
| 3+ | **Adaptive, boxless captions** ([dist/captions.js](../../dist/captions.js)) |

**Adaptive captions:** text is warm off-white (#fff4e2) over dark scenes and charcoal (#1e1d1b) over bright ones, with a
soft edge of the opposite tone. After each frame, a small strip behind the caption (≤ 224 × 40 px) is read back
asynchronously (WebGL2 pixel-pack buffer + fence; WebGL1 falls back to a small sync read every 0.5 s); the tone is chosen
by WCAG contrast against the strip's worst part, with hysteresis (a 1.25× advantage held 0.55 s; easing τ 0.32 s) so
police lights, flashlights and foliage don't make it flicker. Only where neither tone reaches 2:1 does a faint radial
glow ease in (never a box). Chapter Three's Astra polish brings that soft backing in earlier over mixed flashlight
backgrounds.

**Captions setting:** "Show dialogue captions" hides spoken lines; objectives and prompts stay.

**Speaker labels:** JAMIE, SAM, ALEX, YOU, ALEX'S MOM, ALEX'S DAD, OFFICER, RADIO, RECORDING, FROM THE CULVERT, MRS.
ALBRIGHT, MRS. KOWALSKI, VIC, SAM'S MOM, MR. OKAFOR… Unattributed voices in Chapter Five (Sam's mother's voice, "…Jamie?")
have no label. Bracketed narration for silent events: "[It goes quiet. No wind. Nothing.]", "[Behind them, a light goes
out.]".

## Muted play

Every chapter is built to work with sound off: every spoken line is a caption and every sound that matters shows on the
companions. See [Sound and silence](../05_HORROR_DESIGN/SOUND_AND_SILENCE.md).

## Known items

- Credits do not yet name the creature's author (needed before any public release).
- Inventory panel styling is placeholder (Chapter Five).
- Touch is partially supported.
