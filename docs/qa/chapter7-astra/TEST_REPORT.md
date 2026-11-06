# Chapter Seven visual reconstruction — validation

Runtime source commit: `5840a1ea99d614f96d0d0c208697d2b9d4626b87`. Accepted gameplay base: `e24f6638721da8e5f2b74b9565cb0f9598f06cbb`. Subsequent release commits add only QA and documentation; the playable manifest records the final release commit. No changes were merged into main.

| Validation | Result | Scope |
|---|---|---|
| Continuous Chapter Seven simulation | 94 passed, 0 failed | Recovered recorded result on the identical source tree; 31 phases, 39.51 game minutes. |
| Chapter Seven DEV starts | 53 validated | Included in the simulation checks; not claimed as 53 completed browser starts. |
| Fresh focused art/regression checks | 19 passed, 0 failed | Seven earlier-chapter starts restore original geometry/materials; facial transforms restore; scenery clears; replay objects do not accumulate; no added reflection; original detection lights; rescue hand contact. |
| Final rendered views | 30 captures, 0 errors | Default Medium, 1440 × 900, real Chromium software rendering. |
| Matched accepted/final comparison | 21 pairs | Same scripted moments; portable review and repository index. |
| Delivered offline HTML | 9 passed | Real Start and DEV controls; both photographs; earlier creature asset; hunter reveal; ending; no HTTP requests or JavaScript/shader errors. |
| Story and source audit | 652 ordered calls identical | Dialogue, narration, objectives, checkpoints and phase calls unchanged; only Chapter Seven runtime files changed. |

## Measured interaction and restoration results

- Rescue contact: 698 hand samples; maximum 1.83 cm and mean 1.78 cm from Jamie’s wrist.
- Stealth lighting: 24 positions across both floors; maximum error 1.1102230246251565e-16 against the accepted detection values.
- Repeated Chapter Seven starts: 11335 objects before and 11335 after.
- Recorded progression: no stealth failures; no Sam visible; no Jamie visible after the abduction; 757 drag frames with no foot misalignment. The accepted simulation harness used eight traversal fallback jumps.

## Source recovery provenance

The workspace rolled back after a completed 94-check run. Its full per-assertion JSON did not survive; `reports/simulation-recovered-summary.json` preserves the recorded totals and metrics and clearly identifies that limitation. The source was recovered exactly. Reconstructing the former commit’s bytes from the recovered tree, original parent, identity, message and timestamp produces the former tested SHA `12ba4d920c8d7a54c0e2aea4b487a84caa9d1038`. The proof is in `reports/source-equivalence.json`. The fresh 19-check report and final capture/package reports retain their complete records.

A later workspace rollback also removed the first release-record commit (a05fa59b65cf46610e75fc494aacf0b99a0e402b). The complete nine-check offline JSON and review UI totals were recovered from the recorded successful execution; their screenshots were not retained. The rebuilt playable has exactly the same SHA-256 as the tested HTML. This recovery changes release documentation, not the game.

Every runtime hash in the fresh regression report matches the final captures and offline package. Offline HTML SHA-256: `523185bd165269ec0e9bbe83b362f72b0a0d69b43300b02170f1a12ba525d3a9`.

## Captured rendering cost

These counts describe individual views. They are not FPS measurements or a hardware performance certification. Added character and room detail can increase geometry; local culling and static batching reduce work in other views.

| View | Draw calls, accepted → final | Triangles, accepted → final |
|---|---:|---:|
| 01-sams-room | 238 → 275 | 390,497 → 398,601 |
| 09-old-mill-court | 881 → 1184 | 115,578 → 237,458 |
| 14-reveal-landing | 394 → 504 | 76,680 → 170,374 |
| 22-struggle | 198 → 212 | 195,601 → 231,636 |
| 26-final-image | 208 → 208 | 339,199 → 344,015 |
| x17-lange-loom | 584 → 804 | 135,800 → 268,510 |
| x23-pantry-head | 162 → 273 | 82,564 → 156,342 |

## What remains unverified or unfinished

The full input-driven browser walkthrough was attempted but did not complete within this environment’s 8 GB memory limit. It is **not** counted as a passed test. The 53 DEV validations above are simulation validations. Completed final capture and offline runs reported no JavaScript errors; this does not establish that every possible browser route is error-free.

Real-GPU FPS, mobile-browser behavior and an audio-enabled human playthrough remain unverified. The offline check initializes AudioContext and then mutes the game; it is not a listening review. The cast and hunter remain procedural and visibly stylized. A final authored hunter model and animation set, recorded voice performances, final voice synchronization and the final audio mix remain future production work. This visual pass does not claim those assets exist.

## Files

- `index.html`: 21-pair visual review using adjacent image folders.
- `frames/frames.json`: all 30 final views with source hashes and error list.
- `reports/art-checks.json`: complete fresh focused check results.
- `reports/package-browser.json`: complete offline browser result and HTML hash.
- `reports/story-audit.json`, `source-equivalence.json`, `simulation-recovered-summary.json`, `runtime-sha256.json`, `render-comparison.json`: audit and provenance records.
