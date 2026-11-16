# Last Light — the title screen's horror revision: test report

Branch `claude/main-menu-horror-art-revision`. The code is commit `d9f859c`; the docs and captures are in the commit
after it. Every browser run below used Chromium with SwiftShader (software WebGL) in a Linux container.

**Nobody has looked at this on a real GPU or display, and nobody has listened to it on speakers or headphones.** The
sound was rendered and measured by program (§4), and the renders are included so that someone can listen (§4.3).

## 1. The game itself is unchanged (headless simulation, on `d9f859c`)

| Suite | Result |
|---|---|
| `QUICK=1 DEV_KNOWN=2/alex-bike node tests/verify.mjs`: Prologue to Chapter Six played by input, every checkpoint and Continue, Start over, every DEV start, scene switching | **818 passed**, 0 failed. This is the same count as the first redesign and the source branch. The known `2/alex-bike` DEV difference is reported as before. |
| `ONLY=chapter8 node tests/verify.mjs` | **35 passed**, 0 failed |
| `ONLY=aftermath1 node tests/verify.mjs` | **58 passed**, 0 failed |

The headless harness has no image decoder, so the title art reports itself unavailable there. The game then shows the
first redesign's live title, exactly as before. The simulation therefore exercises the fallback path and everything
after the title.

## 2. The menus in Chromium: `tests/main-menu-browser.mjs`

| Run | Result |
|---|---|
| From `dist/` over HTTP (final run, before the narrow-screen crop fix) | **95 passed**, 0 failed |
| Against the offline package `Last-Light-Playtest.html`, opened from disk (built from `d9f859c`, `dirty:false`) | **96 passed**, 0 failed, including "the offline package makes no network requests" (none were made) |

**The first redesign's checks (Parts A and B) are unchanged in what they require, with three test edits:**
- A2 now prints its details when it fails.
- C5 now waits until the bike is back, instead of a fixed time, because a new scheduled event could otherwise overlap
  the check.
- C1 reads the QA render's draw statistics, because `render()` returns those rather than `true`.

**A2 ("a key opens the menu") was intermittent:** it failed in two earlier runs and passed in the two final runs. In
a direct reproduction, the "Press any key" prompt was hidden 1.6 s after the key. The check allows 2.5 s, and under
heavy software rendering the prompt's fade can run late.

Its captures now go to `docs/qa/main-menu-horror-revision/browser/` (or `package/`) by default. Before this change
they went to the first redesign's folder, and one run overwrote those captures; they were restored from git, and the
"before" set used in §3 is the committed one.

**New: Part C, the title art (25 checks), all passing:**

| | Checked |
|---|---|
| C1 | The title is the art: **one full-screen draw call of 2 triangles** (the 3D world is not drawn behind it), `body.art-on` is set, the sky is drawn and the frame is not empty, the heading reads "Last Light", and no fireflies or dust are drawn over the art |
| C2 | The DEV moods summer, search and after each change the art (captures `c02-art-*`) |
| C3 | Memory effect Off, Subtle and Standard change the treatment's strength (0, 0.55, 1) and are remembered |
| C4 | Reduce motion holds the art completely still: no time, no push-in, no weave, and a slip trigger does nothing. It can be turned back off. |
| C5 | A bike goes: the picture swaps to the frame without it, its shadow stays, and the T of LAST fades. Both come back. |
| C6 | After the bell, the title goes silent: **RMS 0.0278 → 0.00087** (package run), and the wordmark dims |
| C7 | A house comes apart into the haze and the H of LIGHT fades; darkness passes through the clouds |
| C8 | The sound with the art is audible and never clips: **RMS 0.028, peak 0.079** after the limiter. The first redesign's lamp flicker never touches the wordmark over the art. |
| C9 | New Game: the art is gone, the world is drawn, and `art-on` is cleared. Back to the title: the art returns. |
| C10 | DEV "Live 3D title (first redesign)" switches to the first redesign's live scene, and back |
| C11 | The boot curtain shows the inline still of the art at once, in the remembered mood |

Part B's level check (menu sound with the QA hook): RMS 0.038, peak 0.118. The meter now taps the signal after the
limiter, where its comment always said it was. It used to tap before the master gain stage, so these numbers are not
directly comparable with the first redesign's (≈0.03 and 0.08).

## 3. Before and after

`docs/qa/main-menu-horror-revision/compare/` has ten side-by-side images, and `before-after.jpg` is all ten in one
sheet. "Before" is the first redesign, `32aa067`. Its captures are the committed ones in
`docs/qa/main-menu-redesign/`; the reduced-motion "before" was captured from a worktree of `32aa067`. "After" is this
branch, at 1600×900.

| # | State | Before | After |
|---|---|---|---|
| 01 | Press any key | `gallery/01-press-any-key.jpg` | `gallery/01-press-any-key.jpg` |
| 02 | Main menu, choice moved to Chapters | `a02-menu.jpg` | `gallery/02-main-menu.jpg` |
| 03 | Summer | `gallery/02-title-summer.jpg` | `gallery/03-summer.jpg` |
| 04 | Search | `gallery/03-title-search.jpg` | `gallery/04-search.jpg` |
| 05 | After | `gallery/04-title-after.jpg` | `gallery/05-after.jpg` |
| 06 | Settings (Display, with Memory effect) | `gallery/08-settings-display.jpg` | `gallery/06-settings.jpg` |
| 07 | Chapters | `gallery/05-chapters.jpg` | `gallery/07-chapters.jpg` |
| 08 | Credits | `gallery/11-credits.jpg` | `gallery/08-credits.jpg` |
| 09 | A horror event | `gallery/15-far-street-detail.jpg` (the far figure) | `gallery/09-horror-moment.jpg`: search mood, Sam's bike gone with its shadow left, the big house coming apart, darkness passing, T and H fading. Triggered through `?qa` for the capture; DEV hidden. |
| 10 | Reduce motion on | captured from `32aa067` | `gallery/10-reduced-motion.jpg` |

The art without any interface is in `art/title-art-<mood>.jpg`. Layouts at 1280×720, 1024×600 and 390×844 are in
`viewports/`. On narrow screens the art crops toward the absence, and the analog offsets are scaled to the crop: the
first phone capture had colour bleed about 4× too wide, which is fixed.

## 4. Sound, checked by program

### 4.1 In the browser (real-time, through the menu's own meter)
See §2: C6, C8 and B2. Mute and the Master, Music and Effects buses are checked by B2, unchanged.

### 4.2 Offline renders (`tools/title-art/render-menu-sound.mjs`)
The menu's sound engine was run in an `OfflineAudioContext`: 90 s per mood, the menu's frame loop every 0.05 s, and
the art's events at fixed times. The events are: a bike gone at 30 s, back at 40 s, dark at 48 s, the bell at 62 s,
silence at 64.7 s, and the house coming apart at 76 s. Measured on the rendered output, after the limiter:

| Mood | RMS (90 s) | Peak (90 s) | During the silence (65–68 s) | Energy below 120 Hz | 120–500 Hz |
|---|---|---|---|---|---|
| summer | 0.022 | 0.133 (−17.5 dBFS) | RMS 0.0007–0.002 (from about 0.02): it recovers over about 4 s | 48% | 44% |
| after | 0.032 | 0.158 (−16 dBFS) | likewise | 76% | 18% |

- The level is flat second by second, with no growth over 90 s; `title-sound-*-levels.json` has every second.
- Nothing reaches full scale, and no menu action has a stinger.
- The energy sits mostly in the drone's band. **On laptop speakers much of the drone will not be heard:** its
  fundamental is 41 Hz. Only the 87 Hz voice and the throat will carry.

### 4.3 For listening
`docs/qa/main-menu-horror-revision/sound/title-sound-summer-90s.ogg` and `title-sound-after-90s.ogg` (Opus, 96 kb/s)
are those renders. **Nobody has listened to them.** Whether the soundscape is disturbing, rather than merely present,
is unknown.

### 4.4 Two sound bugs found and fixed during testing
- A misplaced `//` comment in the edited bus set-up line commented out the Music and Effects buses. The menu's sound
  then failed to start, silently; it now logs a warning if it ever fails.
- The metallic resonance's feedback loop was unstable at a gain of 0.87 and grew without bound within seconds. It is
  now 0.72 behind a gentler filter, and stable over 90 s (§4.2).

## 5. Performance and memory (SwiftShader, so only relative numbers mean anything)

| | First redesign (`32aa067`) | This revision |
|---|---|---|
| Title frame cost (QA render, synchronised) | 1157 ms | **376 ms** (the art is one full-screen pass) |
| Title frame interval with menu sound on (rAF) | 742 ms average, 1633 ms maximum | 448 ms average, 800 ms maximum |
| Boot until the title is shown | — | 34–47 s across runs (software rendering) |

**Memory in play.** The first version of this revision never drew the world while the art was up. On New Game, every
shader and texture of the world was then prepared at once. Under SwiftShader this drove the renderer from about 3 GB to
over 12 GB in a few seconds and crashed the tab, in 2 of 2 runs; the first redesign did not crash in the same runs.
The fix is that the world is drawn once behind the boot curtain, as before. After the fix there were no crashes in
three runs, peaking at 5.6–8.8 GB against the first redesign's 5.6–7.8 GB in the same probe. On a real GPU this would
have been a hitch on the first frame of play rather than a crash, but it is fixed either way.

## 6. Not verified

- **Appearance on a real GPU and display:** colour, the grain's scale and the halation's strength.
- **Listening (§4.3).**
- Safari and Firefox: only Chromium was run.
- Touch devices beyond the 390×844 layout capture.
- The art's events on their natural schedule over many minutes were not watched. They were triggered and stepped
  through the QA hook, and the schedule is seeded and short (the first events arrive within 14–77 s).
