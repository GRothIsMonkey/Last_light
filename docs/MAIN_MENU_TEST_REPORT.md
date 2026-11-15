# Last Light — the title screen, menus and settings: test report

What was checked on `claude/main-menu-complete-redesign`, how, and what was not. The design and the code map are in
[MAIN_MENU_REDESIGN.md](MAIN_MENU_REDESIGN.md).

**Environment.** Linux container, Node 22, Chromium (Playwright) headless with ANGLE SwiftShader — software WebGL, no
GPU, no real audio device (Chromium's headless audio output; the Web Audio graph runs and can be measured, but nobody
heard it). Every time below is software rendering and says nothing about a real GPU.

## 1. The game itself is unchanged (headless simulation)

The existing suite loads the real modules against a mocked DOM and WebGL and plays the story by input. The title
screen's backdrop and menu run in it (the harness has no `?qa`, so this is also the menu's "no real DOM" path: no
splash, no questions, no timers).

| Suite | Before (source branch `df760c2`) | After (this branch) | Wall time |
|---|---|---|---|
| base: `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs` — Prologue to Chapter Six played by input, every checkpoint and Continue, Start over, every DEV start against natural arrival, scene switching | 818 checks passed; the known `2/alex-bike` DEV difference reported (documented in the Chapter Eight and Aftermath I reports; without `DEV_KNOWN` it fails identically on the source branch, run here first) | **818 checks passed**; the same known difference, with the same numbers | ~20 min |
| `ONLY=chapter8 node tests/verify.mjs` | 35 (per the Aftermath I report) | **35 checks passed** | 232 s |
| `ONLY=aftermath1 node tests/verify.mjs` | 58 (per the Aftermath I report) | **58 checks passed** | 205 s |

The suite's own title checks pass unchanged: settings and credits open over the title and return to it, Esc closes
them, settings apply at once and are remembered, Start hides the title and shows the first prompt, Continue lives in the
title menu and returns to the saved moment, back to the title from the pause menu resets everything.

## 2. The menus in Chromium: `tests/main-menu-browser.mjs`

Part A plays it as a person would (no `?qa`, real keys and clicks); Part B looks inside through the `?qa` hook.

| Run | Result |
|---|---|
| `dist/` over HTTP | **70 checks passed**, no JavaScript errors |
| the offline package (`PLAYTEST_MENU=1`), opened from disk | RESULT_PKG, and no HTTP(S) request at all |

What the checks cover:

- **Boot and title:** the curtain while the world is built; the title's reveal under the letterbox; *Press any key*;
  the embedded fonts in use; a key opens the menu and does nothing else; the sound comes on with that key.
- **Main menu:** with no save, Continue hidden and New Game focused; with a save, Continue first, showing the chapter,
  the place and when; arrows move the choice; Enter selects; Esc returns with the choice where it was.
- **Settings:** each section by Tab; a slider moved by arrow keys in steps, its readout following; film grain, brightness,
  caption size, reduce motion applied at once; everything remembered and found again after a reload; Reset asks first
  and puts everything back.
- **Credits:** open, the third-party model's CC BY 4.0 attribution present, Esc closes.
- **Chapters:** ten entries; nine locked on a fresh profile, saying nothing about themselves; with "unlock every
  chapter" all ten can be begun; **Begin** starts Chapter Three at its own black card, the chapter is recorded as reached
  and plays on.
- **Confirmations:** New Game over a saved place asks; Esc is "not yet"; "Begin again" starts the prologue. Quit asks;
  the default is "not yet"; Goodnight shows the farewell; back to the title.
- **DEV:** folded behind its tab; the tab opens the same selector and remembers it; DEV → Chapter Two → Morning →
  START SCENE still starts that scene (Part B); the title-mood buttons change the title.
- **Sound:** M mutes (header and setting agree, remembered) and unmutes. The menu's sound starts in its own running
  context; Master, Music and Effects reach its gain stages; Mute silences it; it fades out in play. Its level measured
  after the limiter: RMS 0.030, peak 0.081 (audible, never clipping). In play, Music / Effects / Voices set the
  game's own new buses (requested and actual gain values both checked).
- **In play:** New Game removes the title scene and puts the camera back on the bike at FOV 64; resolution scale lowers
  the render resolution; Esc-pause shows the pause menu, arrows move in it, Enter opens Settings, Esc returns, "Keep
  going" resumes; back to the title shows the menu at once with the scene back at the oak.
- **No JavaScript errors** in any page.

Times (software rendering): boot to first frame 38.6 s (the world build, as before); Chapter Three from the Chapters
screen 3.3 s behind its curtain; a DEV jump scene ~0.1 s.

Chapters → Begin for more chapters, each in a fresh page (`lastLight.startChapter`, the same path the button takes),
checked to land on the chapter's own beginning with no errors and the title scene gone:

| Chapter | Phase read (when) | Time behind the curtain |
|---|---|---|
| One | `leave`, the ride home from the end of the street (6 s in) | 2.8 s |
| Three | `c3-black`, its card (at once; the menu suite) | 3.3 s |
| Four | `d4-sam`, the next afternoon at Sam's, its card already over (6 s in) | 3.4 s |
| Eight | `c8-black`, its card (6 s in) | 16.1 s (it plays Chapter Seven's real ending, muted and unseen, first) |
| Aftermath I | `a1-black`, its card (6 s in) | 1.5 s |

## 3. The existing package test

`tests/aftermath1-package-browser.mjs` against a `PLAYTEST_CHAPTER=9` package built from this branch: **6/6** — the
real DEV controls enter Aftermath I from Chapter Eight's end card, later scenes start from their jumps, the end card is
Aftermath I's, WebGL renders, no HTTP(S) requests, no JavaScript errors (the same 6/6 the Aftermath I report records).

## 4. Captures

`docs/qa/main-menu-redesign/` (from the test runs: `a01`–`a12`, `b03`–`b08`, and `package/`) and
`docs/qa/main-menu-redesign/gallery/` (the title in its three moods, Chapters, every Settings section, Credits, a
confirmation, Goodnight, the pause menu; 1600×900). Layout was also checked at 1280×720, 1024×768 and 390×844 (a
phone-sized window), which led to the narrow-screen rules (the Chapters list kept usable, headers clear of the Sound
button, hints hidden).

Title events were captured by stepping the scene for several minutes in the search and after moods: the old bike
appears under the oak after cuts, the lamp stutters, a rider crosses the far end of the street, the figure stands by
the far lamp (all seen; see `gallery/15-far-street-detail.jpg`).

## 5. Bugs the runs found (all fixed)

- The suite greps `index.html` for exactly `<section id="intro">`: an added attribute failed it.
- Hovering a chapter selects it, so a click on an already-hovered chapter began it at once: a click now only selects;
  Enter, a double click or **Begin chapter** begins.
- The pause menu did not take the keyboard focus when it opened.
- The old global `header`/`footer` rules positioned the new screens' headers and footers absolutely.
- Specificity: a locked chapter still showed **Begin chapter**; "Begin" sat against the footer at 900 px tall.
- Menu timing used the game's clamped frame step (slow at low frame rates); it now uses real time.
- The Sound button moved left once the small wordmark was hidden on the title.
- Captions drew over the pause menu (pre-existing; the pause menu is now above them).

## 6. Not verified

- **A human playthrough** of the title and menus, and **anyone listening** to the menu's sound.
- **Real-GPU performance** of the title scene (it draws the same neighborhood as the prologue's last stretch).
- Firefox and Safari (the playtest targets desktop Chrome and Edge); a real touch device (only a phone-sized window).
- The full `npm run test:browser` suite (hours in software rendering; the earlier passes did not run it either). The
  menu suite above and the package test cover what the redesign touches in the browser.
- Starting Chapters Two, Five, Six and Seven from the Chapters screen in the browser (they take the same `dev.start(n)`
  path as the five chapters timed above, which the DEV selector and the headless suites also exercise).
