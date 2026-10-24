# Validation attempts and retained evidence

- A real reserved-GLSL-identifier error (`patch`) was corrected in 4bf3902. Subsequent 17-view captures and successful browser checks reported no shader errors.
- An earlier browser attempt was OOM-killed while heavy jobs overlapped. Its partial report remains under `attempt-browser-oom/`; it is not counted as a pass.
- The inherited 2,000 world-batch ceiling contradicted the accepted repair's documented 2,259 batches. The final full run produced 2,190; the test now uses the accepted baseline and retains the six-million-triangle ceiling.
- The first segmented Route C driver cut Owl's corner, became stuck and used Route A recovery. Following the south wall before joining the service road corrected the driver. The rerun passed 11 checks; the natural full-suite Route C replay also passed. Game collision and route logic were unchanged.
- The final close-up review caught sleeves separating during the shirt fold. Commit 95a7e43 makes all fabric panels deform in the same coordinate system. A six-check geometry regression and fresh final interaction captures verify this presentation-only change.
- A later environment reset restored an older local snapshot and lost uncommitted raw reports and review images. Published code was recovered from GitHub. `validation-summary.json` is an explicit summary of completed tool output from the conversation; it does not pretend to be the missing raw report. The 34 matched views survived; the final gear review was rerun.
- The managed cloud browser loaded the packaged page but has WebGL disabled. Chromium/SwiftShader rendered the game separately. Audio was muted; real-GPU performance and sound mixing require human review.
