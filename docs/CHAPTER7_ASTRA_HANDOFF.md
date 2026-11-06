# Chapter Seven — Astra visual reconstruction

The pass continues the accepted expanded Chapter Seven from `e24f6638721da8e5f2b74b9565cb0f9598f06cbb` on `codex/astra-chapter7-final-polish`. It improves the existing chapter’s presentation. The user’s correction is applied: **no false-Jamie reflection, additional double encounter, new objective or new story scene**.

## What changed

| Area | Reconstruction |
|---|---|
| Real Jamie and the full cast | Reversible Chapter Seven facial fitting, more natural eye and mouth proportions, skin variation, better cloth materials and wardrobe detail; dialogue-driven mouth movement and expressions. Jamie has a fitted cap, freckles, shirt graphic and stronger emotional readability. The player’s hands and wristband are included. |
| Mrs. Lange | A distinct older face, recessed eyes, altered facial proportions, bun, housecoat and brooch; reduced excessive head roll; stronger doorway light and close-range staging within the existing scare. |
| Humanoid hunter | More substantial shoulders, palms, ribs and skull, mottled shading and edge light; a clearer silhouette during the garage, landing, pantry and ankle-grab appearances. The semantic rig sockets and replacement-model interface are preserved. |
| Sam’s house | Wall and floor finishes, quilt and cushions, curtains, trim, shelf objects, fixtures and prints; more coherent morning and night light. |
| The Langes’ house | Worn patterned finishes, furniture and kitchen details, curtains, fixtures and dusk window views; the existing bathroom and rush scares remain in their accepted order. |
| Green-door house | Patterned wallpaper, oak floor/stairs and trim, fuller rooms, material variation, pantry dressing and a landing backlight. The existing clues and routes remain intact. |
| Old Mill Court and streets | More complete facades, lawns and verges, gardens and porch objects, aggregate pavement and evidence marks. Court-local culling and static batching contain the added detail. |
| Rescue and aftermath | Lowered first-person rescue framing, the player’s arms resolved against Jamie’s current pose, corrected evidence-mark placement and framing, clearer gum, upgraded photograph subjects and readable final bicycles. |

The accepted dialogue and progression calls compare identically: **652 ordered literal calls** across narration, dialogue, objectives, checkpoints and phase changes. All 12 changed runtime files are Chapter Seven files. Shared earlier-chapter runtime files are unchanged.

## Presentation changes that needed regression checks

Visual lights have separate detection metadata. The hunter still receives the accepted positions and strength of the detection fixtures, even where the visible light has been moved or strengthened. The pantry and den inspection approach is moved 28 cm back to prevent the enlarged visual head entering the player’s view. This changes the presentation of the existing check, not its state order or timing.

The rescue camera is lowered and moved slightly toward Jamie. The player’s arm solve runs against Jamie’s updated pose, keeping the hands on his wrist. The existing struggle inputs, timing and outcome are unchanged. Chapter Seven facial, material and wardrobe changes restore when returning to earlier chapters.

## Validation and review

See `qa/chapter7-astra/TEST_REPORT.md` for the exact completed checks and limits. `qa/chapter7-astra/index.html` compares 21 accepted/final views. The portable visual review contains the same images without external dependencies. The offline playtest opens directly in desktop Chrome or Edge: **DEV → Chapter Seven → START SCENE**. Normal Start still begins the prologue.

The continuous simulation result was recovered with its source identity verified by reconstructing the original Git commit hash. A fresh focused regression run and final browser captures are stored alongside that recovered summary. The interrupted long browser walkthrough is not represented as completed.

## Remaining production limits

The cast and hunter are still procedural. This pass improves their material, anatomy, silhouette and acting within the established renderer; it does not deliver photorealistic scanned people or a final authored creature asset. The hunter replacement contract remains in `CHAPTER7_CREATURE_ASSET_GUIDE.md`. Real-GPU performance and an audio-enabled human walkthrough remain to be reviewed. Nothing was merged into `main`, and Chapter Eight is outside this pass.

## Reproduction

```sh
ONLY=chapter7 node --max-old-space-size=2048 tests/verify.mjs
ONLY=script SCRIPT=$PWD/tests/chapter7-art-checks.mjs ART_REPORT=docs/qa/chapter7-astra/reports/art-checks.json node --max-old-space-size=2048 tests/verify.mjs
PLAYTEST_CHAPTER=7 node tools/package-playtest.mjs ../release/playable
BROWSER_PATH=/path/to/chromium node tests/chapter7-package-browser.mjs ../release/playable/Last-Light-Chapter7-Playtest.html docs/qa/chapter7-astra/reports/package-browser.json
node tools/chapter7-review.mjs
```

The frame script accepts `BROWSER_PATH`, `SHOTS`, `BATCH` and `QA_OUTPUT`; run long software-rendered jobs one at a time. The supplied comparison uses the accepted baseline capture metadata and final capture metadata with source hashes.
