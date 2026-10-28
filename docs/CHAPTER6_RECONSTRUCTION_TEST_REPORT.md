# Chapter Six reconstruction — validation

Branch `codex/astra-chapter6-visual-reconstruction`, from exact accepted parent `7fdfc2a6354e6f1d2c5f6f4de17d5b485fa44073`.

The reconstruction is a human review candidate. Automated checks do not establish character appeal, grief, fear or premium visual quality. The older branch's 818-check report is historical, not a result for these changes.

| Run | Result | Evidence |
| --- | --- | --- |
| Complete Chapter Six simulation | **80 passed, 0 failed**, including the final blanket/stool correction. | `qa/chapter6-reconstruction/simulation-report.json` |
| Rendered reconstruction acceptance | **47 passed, 0 failed; 0 JavaScript errors and 0 shader warnings**, across seven parts. | `qa/chapter6-reconstruction/focused/report.json` |
| Offline local-file launch | **6 passed; 0 JavaScript errors, 0 shader warnings, 0 HTTP(S) requests.** | `qa/chapter6-reconstruction/package-browser-report.json` |

The simulation plays continuously from Chapter Five's ending into Chapter Six and through its ending. It then verifies all 32 QA jumps, 21 aliases, 15 checkpoint definitions, actual checkpoint saves and Continue restoration, 16 idle starting points, gate collision, rising water, all 25 DEV scene starts, and return to earlier Chapters Two–Five. The targeted run does not repeat the full suite's natural-arrival versus DEV snapshot comparison.

## Rendered coverage

The final browser runner uses a fresh Chromium process for each of seven parts: aftermath/rescue, home, cloth, restoration, Jamie's double, the lower chamber/grille, and flood/disappearance. Later parts start at QA checkpoints; walking, looking, F interactions and the story state machine then advance normally. This is checkpoint-based rendered coverage, not one continuous browser walkthrough.

The home checks use actual navigation and prompts, hold F to wash/brush/eat, interrupt/restart brushing, and verify completion/reset. Hand positions are measured against the basin. Cloth checks observe the natural lift, cradle, fold, offer, receive and bagging sequence, including finite vertices, actual hand pins, gravity and transfer continuity. Cast checks verify the same Jamie model, normal blinking versus an unblinking double, exact earlier geometry/material restoration and detachment of Chapter Six details.

The horror parts cover the doorway double and disappearance on looking away, wet prints, Alex up the pipe and charging the grille, the hand brake and locking pin, two Sams, Reyes's view of both, gate slam, disappearance, rescue/manhole, emergency aftermath and ending. The final aftermath review also checks a visible wrapped blanket and a stool beneath Jamie's pelvis, then confirms both detach on returning to Chapter Five.

Chromium runs the game's **Low** quality setting with **ANGLE/SwiftShader software rendering**. AudioContext initialization is disabled and the game muted for accelerated visual tests. The offline smoke test keeps the actual AudioContext available, then mutes playback; it is not a listening test. Raw final reports include runtime SHA-256 hashes, and the packaged HTML has its own hash and source manifest.

The standalone HTML was opened directly from a local file. Real DEV controls entered the morning; the embedded creature loaded and WebGL rendered without a server or network requests. A second capture confirmed the aftermath blanket/stool and Sam's disappearance. The tested HTML SHA-256 is `359851577b00b59d480d7012dbb36a5817e7ffef66123b2cd00ba16b4448c952`.

## Incomplete broader runs

A full prologue–Chapter Six simulation rerun was interrupted. No complete new whole-game result is claimed. Combined browser story segments exceeded the environment's 8 GB memory limit. A fresh-browser-per-segment attempt also reached sustained memory pressure in the garage/photo sequence and was interrupted. These attempts are not counted as passes. Bounded rendered tests provide the final scene coverage above.

## Visual review and limits

Final captures were visually reviewed for home/routine, shirt handoff, Jamie’s double, wet prints, grille, two Sams, rescue, emergency aftermath and earlier-chapter restoration. The home captures show the recessed sink, hands over the basin, held toothbrush/spoon and a cached view of the actual street. The shirt hangs and folds visibly instead of remaining a rigid board. Characters still look stylized and segmented, particularly around shoulders and extended arms. No claim of premium character quality or human approval is made.

Measured cloth pin error: **0 m**; maximum sampled transfer displacement: **0.122 m**; hanging span: **0.638 m**. Peak relative constraint strain was **1.582**, ending at **0.326**; this is not physically exact cloth. Washing hands were within **0.125 m** of the basin target.

Cloth uses structural/shear/bend constraints, table contact, hand pins and a guided fold. It can stretch transiently, and has no full body or self-collision. The evidence bag is staged paper geometry. The aftermath blanket is a draped mesh rather than a second cloth simulation.

The mirror is frosted, window view cached and water highlights approximate lighting rather than reflect the complete scene. Low quality limits shadows. Some grille viewpoints can be crowded by companions; the first-person player can move and look around. Assess scare timing and visibility at normal play speed.

A continuous human playthrough with audio on a real GPU remains necessary to judge character appeal, the father's grief, the cursed double and Sam's disappearance. Real-GPU performance, mobile compatibility and audio quality are unverified.

## Reproduce

```bash
NODE_OPTIONS=--max-old-space-size=2048 QUICK=1 ONLY=chapter6 node tests/verify.mjs
BROWSER_PATH=/path/to/chromium BROWSER_SERVERLESS=1 BROWSER_MEMORY_MB=1536 QUALITY=low node tests/chapter6-reconstruction-browser.mjs
node tools/package-playtest.mjs ../release/playable
BROWSER_PATH=/path/to/chromium node tests/playtest-package-browser.mjs ../release/playable/Last-Light-Chapter6-Playtest.html docs/qa/chapter6-reconstruction/package-browser-report.json
```

Run only one browser test at a time in a memory-constrained environment. `PARTS=home,cloth` selects individual rendered parts. Playwright is a test dependency; the offline game needs no Node installation.
