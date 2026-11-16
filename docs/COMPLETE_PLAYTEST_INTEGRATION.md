# Complete playtest: the whole story with the horror title screen

Branch `claude/complete-playtest-horror-title`, made for playtesting. It merges:

- the complete story: `claude/aftermath2-2026-final-coda` at `2470987f76ce7a40de3938ab0d5aad99928510fb` (Prologue to
  Aftermath II, the 2026 coda, the final credits);
- the title screen's horror revision: `claude/main-menu-horror-art-revision` at
  `32f93b55f7b14e3170d21b7ae8b738f413b7015c` (the title artwork, the analog memory effects, the redesigned LAST LIGHT
  logo, menus, settings, menu sound).

Neither source branch was changed, and nothing was merged into `main`. The art bible's docs come with both.

## What the merge needed

- **Conflicts** (`game.js`, `audio.js`, `style.css`, `package-playtest.mjs`, `README.md`) were resolved by keeping both
  sides. Reset clears both the title art and the coda/credits state. The credits get their skip keys before the
  menu's own key handling. The title draws its artwork, and everything else draws through `coda.render()`, which is
  the world as before, or the 2026 room with the world on its monitor. The credits music (`theme`) now goes through
  the new music bus, so the Music slider applies to it.
- **The menus now know the rest of the story.** The Chapters screen and the progress record gain **Aftermath II** (10)
  and **One More Lap** (11, the coda), with game-rendered stills. Each unlocks when the chapter before it is finished.
  The title footer now reads PROLOGUE — 2026, and the DEV panel lists Aftermath II and 2026 · Credits.
- **Two credits screens, kept separate.** The title's own Credits screen belongs to the menu redesign. The end-of-game
  roll and dedication come from `final-credits.js`. The menu's screen names the creator by the GitHub handle
  (GRothIsMonkey) and the final roll uses the commit name (Grayson); which name to credit is still for the creator to
  confirm.

## Checks on this branch

| Run | Result |
|---|---|
| `ONLY=aftermath2` (by input through Aftermath II, the coda and credits, plus standalone checks) | 24 passed |
| `ONLY=aftermath1` | 58 passed |
| `ONLY=chapter8` | 35 passed |
| `ONLY=dev DEV_KNOWN=2/alex-bike` | 327 passed (the known Chapter Two difference only) |
| base `QUICK=1 DEV_KNOWN=2/alex-bike` (Prologue to Chapter Six by input) | 818 passed |
| `tests/main-menu-browser.mjs` (served) | 94 of 95; the one failure was this test's own count of chapters (10), updated to 12 |
| `tests/main-menu-browser.mjs <package>` (offline file, from disk) | **96 passed, 0 failed** |
| `tests/aftermath2-package-browser.mjs <package>` (offline file, from disk) | **8 passed**, no network requests, no errors |

Opened as a player would (no QA hook), both the hosted files and the offline file boot to the horror title artwork
("press any key"), then the menu (New Game, Chapters, Settings, Credits, Quit). The older live 3D title stays
reachable only through DEV ("Live 3D title").

## Builds

- **Offline**: `PLAYTEST_CHAPTER=final node tools/package-playtest.mjs <folder>` →
  `Last-Light-Complete-Playtest.html` (12,346,522 bytes, 160 modules, built from `fa0ba3c`, clean tree).
- **Hosted (private artifact)**: https://claude.ai/artifact/CkTtoL89SKdQFvAUDuBFqW. Only its owner can open it until it
  is shared. It serves the same `dist/` files, with the one host-only change earlier hosted builds also had: the host
  does not serve `.glb`, so the creature model is served as base64 text and read by a host copy of `creature.js`.
