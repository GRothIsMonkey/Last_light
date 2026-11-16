# Last Light — the title screen, menus and settings: redesign handoff

The game no longer opens on a text menu over the first frame of the ride. It opens on a live scene drawn by the game
itself — the end of Oak Hollow Drive at the last of the light: the old oak against the sky, the tire swing, the kids'
bikes dropped in the grass, the lamps coming on — with a slow camera, a few cuts, and a few small things that do not
quite fit. Over it: a title that reveals itself, "press any key", and a menu with Continue, New Game, Chapters,
Settings, Credits and Quit. The story, its chapters and its saves are untouched. **No person has played or listened to
it yet**: everything below was checked in Chromium with software rendering (SwiftShader) and by the headless suite.

## 1. Where it is

| | |
|---|---|
| Branch | `claude/main-menu-complete-redesign` (new; nothing else was pushed to; `main` untouched) |
| Base | `df760c2` — the head of `codex/astra-chapter8-aftermath1-visual-recovery` (Prologue to Aftermath I, the most complete build; it already contains `claude/aftermath1-what-was-left`) |
| Play from the repository | no build step: serve `dist/` over HTTP (`python3 -m http.server 8000 --directory dist`) and open it in Chrome or Edge |
| Offline package | `PLAYTEST_MENU=1 node tools/package-playtest.mjs <folder>` → `Last-Light-Playtest.html` (one file, runs from disk, no network). The older `PLAYTEST_CHAPTER=…` variants still work and now include the new menus too |
| Tests | `node tests/main-menu-browser.mjs` (the menus in Chromium), `node tests/main-menu-browser.mjs <package.html>` (the same against the offline package), and the existing suites — §8 |

## 2. What the player sees

1. **Boot.** A dark curtain with the wordmark while the world is built (the same build time as before); it lifts on
   the first frame drawn.
2. **The title reveals itself** over the live scene, between cinematic letterbox bars: the eyebrow, "Last *Light*",
   the tagline, then **Press any key**. Any key or click opens the menu (and only that: the key does nothing else), and
   it is the first moment sound may play, so the evening's sound fades in then. Coming back to the title from the game
   skips this and shows the menu at once.
3. **The menu.** Continue (only with a saved place: *Chapter Three · Alex's room*, *Saved yesterday, 9:14 PM*), New
   Game, Chapters, Settings, Credits, Quit. A small warm light — a firefly — follows the choice. Arrows or W/S choose,
   Enter or Space selects, Esc goes back, the mouse works everywhere and hovering moves the same light.
4. **The scene keeps living** while you choose: four shots (the oak at sunset; back down the street from the grass;
   down at the chalk drawing; low in the grass among the bikes), slow drifts with a breath of a hand-held camera, a dip to
   black between them, the pointer leaning the view a little, out-of-focus fireflies drifting near the lens, a slow
   glow over the horizon, and film grain.
5. **Rarely, something is a little wrong** (all of it from the game's own story, none of it explained):
   - the lamp over the oak stutters and catches — and the word *Light* in the title stutters with it, with the hum of
     its ballast;
   - after a cut, the old bike from the prologue's last minute is lying under the oak;
   - far down the street, a kid rides across in the haze, and a bell rings twice, far off;
   - by the farthest lamp you can see, someone is standing beside an old bike, looking back; the lamp stutters and
     there is no one there, and for a breath the night goes quiet (the cicadas stop, as they did on the pond road);
   - in the later moods, the chalk drawing on the asphalt has five riders instead of four.
6. **The title remembers how far you have come** (`progress.js`, from the saves the game already writes):

   | Mood | When | The evening it remembers |
   |---|---|---|
   | summer | the Prologue to Chapter Three | warm late dusk, the sun behind the oak, all four bikes, many fireflies. *It's getting late. / But nobody wants to go home yet.* |
   | search | Chapter Four to Chapter Eight reached | later and bluer, one bike missing, the far rider and the figure more likely. *The streetlights are on. / Not everyone made it home.* |
   | after | Chapter Eight finished, or Aftermath I reached | nearly dark, a low sky with the faintest red in it, two bikes (one lying wrong), few fireflies, the undertone sooner. *You moved away in October. / You meant to keep in touch.* (the prologue's own line) |

   Nothing in any mood shows a later scene; the catastrophe appears only as that red in the clouds.

## 3. The menus

| Screen | What is on it |
|---|---|
| **Continue** | game.js's own Continue (the same `jumpTo(section)` as before), now labelled with the chapter, the place and when it was saved |
| **New Game** | starts the prologue exactly as before. If a place is saved it asks first ("Begin again?" — the save is replaced at the new game's first checkpoint, which is when the game itself overwrites it) |
| **Chapters** | the Prologue to Aftermath I. Each reached chapter: a still from near its start (rendered by the game), Alex's-camera date stamp, the official title where the game has one (Four to Aftermath I; One to Three have none, so they show their date and first place), its date, where it begins, one line about how it opens, and *Your place* on the chapter of the saved checkpoint. Chapters not reached yet read *Not yet remembered* and show nothing. **Begin chapter** (or Enter, or a double click) starts it at its true beginning through the game's own hand-over (see §6), behind a short curtain. Aftermath II and 2026 do not exist and are not shown |
| **Settings** | four sections — §4 |
| **Credits** | a slow roll you can take over (wheel, arrows, Page keys): the creator, the passes the game was built in, sound, technology, the third-party model's CC BY 4.0 attribution (it was not credited in the game before), the typefaces |
| **Quit** | asks, then a *Goodnight.* screen that stops drawing and stops the sound (a browser tab cannot be closed by a page it did not open; `window.close()` is tried) and offers the way back to the title |
| **Pause** | the same items as before (Keep going, Settings, Start over, Back to the title) in the menu's type, with keyboard navigation, above the captions now |
| **Confirmations** | one dialog for everything that cannot be undone; the safe answer has the focus; Esc is "not yet" |
| **DEV** | unchanged inside (same ids, same scenes, same START SCENE), folded behind a small **DEV** tab in the corner of the title (remembered when opened; always open under `?qa`). Two additions for review: **Title mood** (Auto / Summer / Search / After) and **Unlock every chapter in Chapters** |

## 4. Settings

All settings apply at once and are remembered in this browser under `lastlight.settings` (the same key as before;
an older saved object loads unchanged and the new keys take their defaults; values of the wrong type are ignored).

| Section | Setting | Key | Default | What it does |
|---|---|---|---|---|
| Audio | Master volume | `volume` | 100% | the game's master (as before) and the menu's |
| | Music | `music` | 100% | the game's melody, end chords and Aftermath theme; the menu's notes |
| | Effects & ambience | `sfx` | 100% | the world, bikes, doors, the heartbeat and breathing; the menu's evening and interface sounds |
| | Voices | `voice` | 100% | calls down the street, names, synthesized voices, Alex's recordings, the shelter's murmur, the synthesized crying |
| | Mute all sound | `muted` | off | also **M** or the Sound button, now remembered |
| Display | Full screen | `fullscreen` | off | as before (never restored on load: browsers only allow it from a click) |
| | Graphics quality | `quality` | Medium | as before (pixel ratio and shadow-map size) |
| | Resolution scale | `renderScale` | 100% | 50–100% of the quality's pixel ratio |
| | Brightness | `brightness` | 100% | 70–140%, a brightness filter on the picture only (not the interface) |
| | Film grain | `grain` | on | the grain overlay |
| Controls | Mouse sensitivity | `sensitivity` | 1.0× | as before |
| | Invert vertical look | `invertY` | off | mouse and touch look |
| | (keys) | | | every key, grouped (bike, on foot, everywhere, later in the summer). **Keys cannot be rebound yet**: each chapter reads key codes directly, and a remapping layer was judged too risky for this pass |
| Accessibility | Dialogue captions | `captions` | on | as before |
| | Caption size | `captionSize` | M | S / M / L / XL, captions and memory lines |
| | Memory lines | `memories` | on | as before |
| | Reduce flashing | `reduceFlashing` | off | lightning and sudden flashes (the sky's flash and the lighting flash) at 30% |
| | Reduce motion | `reduceMotion` | off | a still title (no drift, no hand-held breath, no parallax, no drifting motes), head bob at 25% |
| | Reset to defaults | | | asks first; full screen is left as it is |

Defaults keep the accepted game exactly as it sounded and looked: every new volume is 100%, every new effect off.

## 5. Sound

All synthesized, nothing loaded (`menu-audio.js`, its own AudioContext, made on the first key or click, faded out and
suspended during play, resumed on the title). The evening: wind with slow gusts, leaves, two cicada choruses, crickets,
a car passing far away now and then. Music: a felt-piano voice playing the prologue's own old melody very slowly, over a
barely-there pad; in the search mood a minor turn and more rests; in the after mood Aftermath I's four-note theme,
slightly detuned. If you stay, after about a minute and a half (sooner later in the summer), a low undertone of two
tones beating slowly. Events: the lamp's ballast hum and ticks, the far bell (the game's bell partials, twice), a low
swell when the figure is there, and the night going quiet when it is not. Interface: soft glass ticks for moving,
a breath for opening, two falling notes for back, a small chime for choosing, a two-note swell for beginning, slider
ticks pitched by value, switch clicks. Measured after the limiter in Chromium over the first seconds: RMS ≈ 0.03, peaks ≈ 0.08
(no clipping; the limiter starts at 0.32). **Nobody has listened to it.**

In play, the game's own sound (`audio.js`) is now routed into Music / Effects / Voices buses under the master, so the
three sliders work in every chapter (§4 lists what goes where). At 100% the mix is what it was.

## 6. How it fits into the game (for whoever works on it next)

New files:

| File | |
|---|---|
| `dist/title-scene.js` | the title's backdrop: shots, moods, props (the bikes, the far figure, the far rider), events, the title's light and camera. Everything it touches it gives back in `exit()` |
| `dist/menu.js` | the title's presentation and navigation, every menu screen, the confirm dialog, Quit, the DEV tab, the 2D motes |
| `dist/menu-data.js` | what Chapters says about each chapter, and the title's text per mood |
| `dist/menu-art.js` | the ten chapter stills (WebP, ~100 KB) |
| `dist/menu-audio.js` | the menu's sound |
| `dist/progress.js` | furthest chapter reached, Continue's details, the mood (reads the existing saves; writes only `lastlight.progress`) |
| `dist/fonts.css` | Cormorant Garamond and Karla, embedded (SIL OFL 1.1; see `THIRD_PARTY_ASSETS.md`) |
| `tests/main-menu-browser.mjs` | the menus in Chromium, as a player and through the QA hook |

Changed: `index.html` (the title, the new screens, the same ids everywhere the tests and the game use them), `style.css`
(one appended section, scoped under `#experience`; the in-game interface rules are untouched), `ui.js` (new settings,
the Chapters panel, reset), `audio.js` (the three buses, `setMix`, read-only `mix`/`mixGains`), `game.js` (below),
`tools/package-playtest.mjs` (inlines `fonts.css`; `PLAYTEST_MENU=1`), `docs/THIRD_PARTY_ASSETS.md` (the fonts).

`game.js`, in order of what happens:

- On the title (`state==='intro'`), after the game's own lighting each frame, `titleScene.light()` sets the title's
  moment of the evening; after the game's own camera placement, `titleScene.place()` sets the shot; the ambient
  neighborhood is updated with the title scene's own context (`ambientCtx()`), never the shared one — `friends.update`
  reads that one, and Jamie's mother would walk out of her door if it said the end of the street.
- `start()` and `resetState()` call `titleScene.exit()` first, so every way into the story (New Game, Continue,
  Chapters, DEV, Start over) begins from exactly the state it began from before. `toTitle()` enters the title scene and
  shows the menu.
- The first frame drawn calls `menu.booted()`; every frame calls `menu.frame(dt)` (the menu has no
  `requestAnimationFrame` or timers of its own; its listeners are on `document`, because the headless harness keeps one
  `window` listener per event type and those belong to the game).
- The New Game button calls `menu.newGame()` (which asks first when a place is saved, then calls `start()`).
  `?jump=` still overrides it, as before.
- `startChapter(n)` = `devStart(n)` + `progress.record(n)`: **the player's Chapters screen starts a chapter through
  `dev-chapters.js`'s `start(n)`**, the canonical hand-over the DEV selector uses (the previous chapter's real ending,
  muted and unseen, then its own next-chapter button). That file is marked temporary. **Before the DEV tools are removed
  from a release, move `start(n)` and its generated history into a permanent module**; the Chapters screen depends on it.
- Settings: `applySetting` handles the new keys; `turnView` inverts Y; head bob × `motionK`; flashes × `flashK`;
  `applyQuality` multiplies the pixel ratio by the resolution scale; M and the Sound button go through `toggleSound()`
  (remembered); `start()` respects a remembered mute; `pause()` gives the pause menu the focus.
- QA hook (`?qa`): `lastLight.titleScene`, `.progress`, `.menu`, `.startChapter`. Under `?qa` (and in the headless
  harness) there is no splash, no confirmation (the answer is yes) and the DEV tab is open, so every existing test
  clicks straight through as before.

Storage: `lastlight.settings` (extended), `lastlight.progress` (`{furthest, at, v}`), `lastlight.dev` (`{open,
unlockAll, mood}`). The story's own saves (`lastlight.chapter1` for Continue, `.chapter4`, `.chapter7`, `.chapter8`,
`.aftermath1`) are read, never written by the menu.

To regenerate the chapter stills: load `dist/?qa`, hide everything but the canvas, `lastLight.devScene(n, id)`, step
a few seconds, `lastLight.render()`, screenshot at 1280×656, resize to 560×287 and encode as WebP (quality 72) into
`menu-art.js`. The scenes used are listed beside each still in that file.

## 7. Limits, and what still needs polish

- **Unplayed and unheard by a person.** Software rendering only; real-GPU frame rate on the title is unmeasured (it
  draws the same neighborhood as the prologue's last stretch, so it should cost about the same). The stills were
  rendered by SwiftShader and are a little soft; re-capture them on a GPU for the final art.
- **The menu's music is a placeholder** in the same spirit as the game's (a few synthesized notes). A real title theme,
  recorded ambience and a listening pass would lift it most.
- **Key rebinding** is not implemented (§4).
- **Chapter starts take a moment** behind their curtain (software rendering: One 2.8 s, Three 3.3 s, Four 3.4 s,
  Aftermath I 1.5 s, **Eight 16 s**, because it simulates Chapter Seven's real ending first). The work is CPU-bound
  simulation, so a desktop will be faster, but Chapter Eight still waits noticeably. A dedicated start that applies the
  recorded history directly would remove the wait.
- **Quit** cannot close a tab the player opened (a browser rule); it shows the goodnight screen instead.
- The moods' thresholds (Chapter Four, Chapter Eight finished) and the events' frequencies are first guesses; tune them
  in `MOODS` (`title-scene.js`) and `progress.js` after a playtest.
- Touch: the title and menus work with taps (tap anywhere to begin), but they were designed for desktop first.
- The in-game interface (captions, objectives, chapter cards) keeps its existing type; only the menus and the pause
  menu use the new typefaces.
