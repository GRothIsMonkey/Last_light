# QA standards

## The one rule

> **Never confuse an automated test pass with human approval.** Tests prove the code does what the tests check. Only the
> human developer can say a chapter is frightening, readable, fun or finished.

## Test suites ([`tests/`](../../tests/))

| Command | What it does | Time |
|---|---|---|
| `npm test` (`node tests/verify.mjs`) | Node simulation with a mocked WebGL renderer and DOM: world geometry sweeps, menus, riding, two prologue playthroughs, **the whole story prologue → Chapter Five played with inputs**, every beat, jump, checkpoint, Continue, Start over, DEV checks, playtest regressions | Long |
| `QUICK=1 npm test` | Same, skipping the slow world-geometry sweeps (also skips the 2,000-mesh world check) | Shorter |
| `ONLY=chapter5 node tests/verify.mjs` | Chapter Five alone (+ companion tests A–H); `ROUTE`, `CHOICE`, `FROM`, `PLAY_ONLY` narrow it | Shorter |
| `QUICK=1 ONLY=chapter4 node tests/verify.mjs` | Chapter Four alone | Shorter |
| `QUICK=1 ONLY=dev-record node tests/verify.mjs` | **Regenerates** the DEV selector's history (`dist/dev-chapter-history.js`) | — |
| `npm run test:browser` (`tests/browser.mjs`) | Chromium through real WebGL and Web Audio; screenshots and reports to `docs/qa` (needs Playwright; `BROWSER_PATH`, `SOFTWARE_GL=1`, `QA_OUTPUT`) | Long |
| `node tests/chapter5-browser.mjs` | Chapter Five in Chromium, sound off; `SEGMENTED=1 SEGS=… QUALITY=low` for memory-limited machines | Long |
| `tests/review-capture.mjs` + `tests/review/*.mjs` | Human-viewable review frames (garage, sock, lookdown, stones, dock, gear, companions, faces, night, aftermath) | — |

Per-chapter sims and browser scripts: `chapter2-*`, `chapter3-*`, `chapter4-*`, `chapter5-*`, `dev-chapters-*`,
`playtest-fixes.mjs`, `memory-usability*.mjs`, `creature-lab.mjs` (creature animation sheets).

## What every chapter pass reports

1. Exact source branch and SHA; final SHA.
2. Full simulation count (and Chapters 0–4 regression explicitly).
3. A **natural playthrough by inputs** from the previous chapter's end card, with no QA jump inside it.
4. Every QA jump, alias and checkpoint with Continue; Start over; replay in the same page.
5. Fallback/idle behavior (standing still never strands the player; payoffs never skipped).
6. Companion distance stats (never lost).
7. DEV selector: every scene starts; DEV start equals the natural arrival; key scenes start **before** their event;
   switching leaks nothing.
8. Browser: 0 JavaScript errors and 0 WebGL/shader warnings; captures for review.
9. Performance counts and memory, labeled as software rendering.
10. **What was not done**, what failed, what was killed by memory limits.

## Evidence locations

`docs/qa/` (per-pass folders: `chapter3-*`, `chapter4-*`, `chapter5-pine-ridge`, `chapter5-repair`, `dev-*`, audio,
contact sheets, manifests with runtime hashes). Galleries are `index.html` files inside those folders.

## Proportionate testing

- Documentation-only change (like this vault): link check; no game run.
- A focused fix: its focused test + `QUICK=1` regression.
- A chapter pass: everything above.
- Don't re-launch hours-long browser suites for small changes; don't run browser suites concurrently with node suites on a
  memory-limited container (earlier runs were killed that way).

## Known environment limits

SwiftShader only (no real GPU in the build containers); renderer memory spikes of 4–6 GB under software GL; containers have
killed browsers at 4.5–9.1 GB. Touch devices and non-Chromium browsers are untested.
