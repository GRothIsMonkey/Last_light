# Final credits and release: handoff

Code: `dist/final-credits.js` (the text and the roll), `dist/game.js` (`beginCredits`, `showComplete`), `dist/style.css`
(`#final-credits`), `dist/audio.js` (`theme`). Branch `claude/aftermath2-2026-final-coda`.

## 1. The sequence

The coda's title (LAST LIGHT on the monitor) fades to black, then:

1. **The roll.** Off-white text rising slowly over near-black, centred, one role and its names per block, about 38 pixels
   a second (64–120 s depending on the window height; 66 s at 960 × 540). The Prologue's eight-note melody plays
   under it, quietly.
2. **The dedication**, alone on the black once the roll has faded, line by line, held about 17 seconds:

   > For Jamie and Alex.
   > And for every summer we thought would last forever.

3. The fade, then the **end screen**: THE END / *Last Light* / Summer, 2011., with **Watch the credits again ↻**,
   **Start over** and **Back to the title** (the title screen's DEV menu reaches every chapter and section).

**Skip** (Esc, Space, Enter, or the Skip button): during the roll it goes to the dedication; during the dedication it
first makes sure both lines have been up (8.4 s in), then goes on; during the fade it finishes. Nothing is ever
skipped past the dedication without it being shown.

**Completion**: `lastlight.complete` = `{"complete":true,"at":<time>,"plays":<n>}` is written the moment the credits
begin, so a skip, a closed tab or a crash during the credits cannot lose it. Replaying the credits only increments
`plays`. Earlier saves are never touched.

## 2. What the credits say, and where each line comes from

Every name is one the repository establishes; nothing is invented, and nothing is filled in to look complete.

| Block | Text | Source in the repository |
|---|---|---|
| Title | LAST LIGHT | The game. |
| Created by | Grayson | The repository owner's commit author name (`git log`: "Grayson"); GitHub owner `GRothIsMonkey`. **To confirm**: the name the creator wants in the credits (a full name or a handle was not assumed). |
| Story and creative direction | Grayson | The directives every chapter was built from were written by the creative director (the repository owner). |
| Writing, game design and development | Claude (Anthropic) | Commit author "Claude" on the implementation branches (`claude/*`). |
| Visual development | Astra (the art passes) / directed by Grayson | The repository's own name for its visual passes (`codex/astra-*` branches; `docs/ASTRA_*`). **To confirm**: the repository never says who or what Astra is; credit it as the creator prefers. |
| Music and sound | Synthesized by the game as you play / The Prologue's melody and every sound in Last Light are written in code | `dist/audio.js`: every sound is synthesized with Web Audio; no recording is shipped. |
| Third-party asset | "Smily horror monster" by Bento · sketchfab.com/gostbento · skfb.ly/6W6ut · Licensed under Creative Commons Attribution 4.0 · creativecommons.org/licenses/by/4.0 · Modified and optimized for Last Light. · The author does not endorse Last Light or this use. | `docs/THIRD_PARTY_ASSETS.md` (title, author, link, licence and modification notice as the CC BY 4.0 licence requires). |
| Built with | Three.js r160 · © 2010–2023 three.js authors · MIT License | `dist/three.module.js`, `dist/THREE-LICENSE.txt`. |
| Tested with | Node.js · Chromium, through Playwright | `tests/`. |
| Special thanks | (empty: not shown) | No special-thanks list is recorded anywhere. Add names to `CREDITS` in `final-credits.js` and the block appears; until then it is hidden, not filled with guesses. |

## 3. Music

- There is no licensed music and no music file. Everything is synthesized at run time (`audio.js`).
- **The cue interface**: `audio.theme(true)` starts the credits/title music and `audio.theme(false)` stops it.
  `final-credits.js` calls it when the roll starts and when the credits finish or stop; the coda calls it as the title
  comes up. Today `theme()` plays the Prologue's own eight notes (A3 E4 A4 B4 F#4 E4 D4 A3) slowly on a soft
  synthesized voice.
- To use a licensed or original recording later: implement it behind `theme(on)` (decode the file into an
  `AudioBuffer`, or an `<audio>` element routed into the same master gain), keep the synthesized motif as the fallback
  when the file is missing, and credit it in `CREDITS` with its licence. Nothing else has to change.
- With sound off (M) or no audio device, the credits, the coda and the end screen behave the same, silently.

## 4. The release package

```bash
PLAYTEST_CHAPTER=final node tools/package-playtest.mjs ../release/last-light-complete
```

builds `Last-Light-Complete-Playtest.html` (the unchanged runtime, every module and the creature asset embedded; no
server needed), `START-HERE.txt` (how to start, the DEV route to Aftermath II and the coda, controls, what still needs a
person), `manifest.json` (branch, commit, SHA-256 of every source file and of the entry), `THREE-LICENSE.txt`,
`THIRD_PARTY_ASSETS.md`, `AFTERMATH2-TEST-REPORT.md` and `RELEASE-NOTES.md` (this document). Zip the folder.

## 5. Integration points for the title-screen redesign (a separate branch)

This branch does not change the title screen, settings, chapter selection or the menu's own credits; it only adds to
them. When the redesigned title screen is merged with this story, these are the joins:

- **DEV**: two buttons in `dist/index.html`, `data-dev-chapter="10"` (Aftermath II) and `"11"` (2026 · Credits), handled
  by the existing DEV panel (`dev-chapters.js` `DEV_SCENES[10]`, `[11]`). A redesigned chapter select can list the same
  ids; `lastLight.devScene(n, id)` / the panel's own start path work unchanged.
- **Continue**: the existing checkpoint save carries Aftermath II's and the coda's sections with their labels
  (`aftermath2.LABEL`: "Sam", "The old oak", ..., "One more lap", "The credits"); Continue resumes them the same way it
  resumes every chapter.
- **Completion**: `localStorage['lastlight.complete']` = `{complete:true, at, plays}`. A title screen can read it to show
  a completed state, offer the credits, or unlock a chapter list.
- **Credits from a menu**: `beginCredits(null, {again:true})` in `game.js` plays the final credits from anywhere (it is
  what **Watch the credits again** calls); the credits build their own `#final-credits` element if the page has none.
  A menu "Credits" item can call the same function, or show `CREDITS`/`DEDICATION` from `final-credits.js` in its own
  layout so the two never disagree.
- **The end screen** reuses the existing `#ending` panel and `#next-chapter` button (THE END / Last Light / Summer,
  2011.); its **Start over** and **Back to the title** are the existing buttons.
- **Chapter chain**: Aftermath I's end card → Aftermath II (`aftermath1.next=aftermath2`), Aftermath II's → the coda
  (`nextChapter()` when `aftermath2.finished`), the coda → the credits. Earlier chapters' end cards are unchanged.

## 6. Before a public release

- Confirm the creator's credited name and the Astra credit (§2).
- Decide the notebook's colour (Chapter Seven green vs. Aftermath I/II blue) and the adult characters' final look
  (provisional A-20/A-21 derivations) in the art pass.
- A human playthrough on a GPU, with sound (the checklist in `AFTERMATH2_TEST_REPORT.md`).
- Nothing comes after the credits: no stinger, no post-credits scene. Keep it that way.
