# Regression runs (existing suites)

Run on this branch's final runtime (`dist/` unchanged after `7fc71d6`). The browser suites use software WebGL (Chromium + ANGLE
SwiftShader, not a GPU), with `SHOTS=0` (no screenshots) and `PARTS=A,B,C,D` where the suite has parts.

| Suite | Result | Files |
|---|---|---|
| `tests/verify.mjs` | stops at its last block, the DEV chapter selector check (`dev-chapters-sim.mjs:227`, "2/alex-bike"); every earlier check passes. **Pre-existing**: the starting commit `716fc6b` fails the same check with the same values | `verify.log`, `verify-at-start-716fc6b.log` |
| `tests/pipeline-browser.mjs` | 36 passed, 0 failed | `pipeline-browser.log`, `pipeline-browser-report.json` |
| `tests/bike-browser.mjs` | 29 passed, 0 failed | `bike-browser.log`, `bike-browser-report.json` |
| `tests/details-browser.mjs` | 36 passed, 0 failed | `details-browser.log`, `details-browser-report.json` |
| `tests/streetprops-browser.mjs` | 32 passed, 0 failed | `streetprops-browser.log`, `streetprops-browser-report.json` |
| `tests/vegetation-browser.mjs` | 74 passed, 0 failed | `vegetation-browser.log`, `vegetation-browser-report.json` |
| `tests/pavement-browser.mjs` | 30 passed, 0 failed | `pavement-browser.log`, `pavement-browser-report.json` |
| `tests/house-browser.mjs` | 30 passed, 0 failed | `house-browser.log`, `house-browser-report.json` |

This pass's own suite (`tests/envrepair-supportcast-browser.mjs`) is in `../tests/report.json`. Its earlier runs are kept here:
- `envrepair-supportcast-first-full-run.log`: 31 passed, 1 failed. The failure was the test's own ordering: Part A recorded the default game's controller baseline after three scripted rides in the same page.
- `envrepair-supportcast-parts-A-B-rerun.log`: parts A and B re-run after that fix, all passing.

Paths to the scratch directory are written `<scratch>/`.
