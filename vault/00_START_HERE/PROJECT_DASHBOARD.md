# Project dashboard

The numbers in one place. For the narrative version see [Current project status](CURRENT_PROJECT_STATUS.md).
Last updated 2026-10-23 from the repository at `d4de9ab` (and a read-only look at Astra's branch head `4bf3902`).

## The game at a glance

| | |
|---|---|
| Title | *Last Light* |
| Genre | First-person psychological and supernatural horror, story-driven, with cycling and on-foot exploration |
| Setting | Oak Hollow, a fictional American suburb and small town, and Pine Ridge reservoir to its north; August 21–24, 2011 |
| Player | "You", an unnamed kid, one of four friends; an adult narrator looks back on that summer ([Player](../02_CHARACTERS/PLAYER.md)) |
| Platform | Browser (WebGL via Three.js r160, vendored). No build step: `dist/` is both source and playable game. |
| Run it | Serve `dist/` over HTTP (`python3 -m http.server 8000 --directory dist`) and open it in a WebGL browser. |
| Assets | Almost everything is generated at runtime (geometry, textures, audio). One third-party model: the creature, "Smily horror monster" by Bento, CC BY 4.0 ([docs/THIRD_PARTY_ASSETS.md](../../docs/THIRD_PARTY_ASSETS.md)). |
| Failure state | None so far. Nothing can hurt the player; every beat has a time fallback. (Whether this continues is an open design question.) |

## Chapters

| Ch | Length (from docs) | QA jumps | Checkpoints | DEV scenes | Release status |
|---|---|---:|---:|---:|---|
| Prologue | 5–6 min | `alex-departure` + warps | — | 9 | ✅ Accepted (`9520b4f`) |
| One | 12–15 min | 11 sections | 6 | 9 | ✅ Accepted (`9c4b576`) |
| Two | ~10 min (scripted 9.7 game min) | 10 | 7 | 11 | ✅ Accepted (`68cc543`) |
| Three | 13–14 min per README; 19.1 game min scripted per the creature-chase test report (**discrepancy, not resolved**) | 34 | 16 | 29 | ✅ Accepted (`5be6814`) |
| Four | 20–30 min (scripted ~21) | 38 (+aliases) | 12 | 42 | ✅ Accepted story (`f0120ba`); art/repairs to `c964777` |
| Five | 35–45 min with exploring (scripted direct 30.5 game min in the repair) | 37 (+27 aliases) | 12 | 37 | 🟡 Unapproved (`d4de9ab`) |

DEV selector total: **137 scenes** across the six chapters (temporary playtest tool; see
[DEV scene selector](../06_GAMEPLAY_SYSTEMS/DEV_SCENE_SELECTOR.md)).

## Verification history (automated; not human approval)

| Release | Simulation | Browser | Notes |
|---|---:|---:|---|
| Prologue final polish | 102 | 115 | 130 captures, 23 audio signal cases |
| Chapter One final | 156 | 184 | 219 captures, 35 audio signal cases |
| Chapter Two final | 230 | 311 (+10 route) | 2 continuous full-story browser runs |
| Chapter Three final polish | 551 | 83 + 142 DEV | 304 captures |
| Chapter Four main street | 593 | 11 | 76 captures |
| Chapter Four horror revision | 622 | 13 | |
| Chapter Four Astra polish | 622 | 4 completed + 42 DEV starts | continuous browser run killed by 8 GiB memory limit |
| Chapter Four repair pass 2 | focused | 11 focused | full walkthrough not repeated |
| Chapter Five first draft | 718 | 33 | |
| **Chapter Five repair (`d4de9ab`)** | **736/736** (Ch5 alone 81/81) | 24 + 16 segmented; 37 DEV scenes | software rendering, sound off |

## Open work by status

Counts from [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md) and
[Chapter Five initial feedback](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_INITIAL_FEEDBACK.md).

| Status | Chapter Five playtest complaints (36 + 1) |
|---|---|
| 🔴 Open | 1 (the escape after the double: too long, not frightening), plus visual quality (#36) handed to Astra |
| 🔧 Fixed in code / ⏳ Awaiting playtest | 29 marked "Yes", 5 "Partly", 2 "Needs human review" in the repair report |
| ✅ Human-approved | 0 (no Chapter Five item has a recorded human approval) |
| 💤 Deferred | Art, audio, lip sync, cloth, volumetric beams (to Astra / later) |

## Workstreams

| Who | What | Where | State |
|---|---|---|---|
| Astra (Codex) | Chapter Five visual reconstruction + interactive Owl escape | `codex/astra-chapter5-ultra-visual-reconstruction` @ `4bf3902` | In progress, started 2026-10-23 |
| Human developer | Playtest and approve Chapter Five | — | Waiting on Astra's build |
| Claude | This vault | `docs/last-light-vault` | Documentation only |

More: [Current workstreams](../09_DEVELOPMENT_HISTORY/CURRENT_WORKSTREAMS.md).

## Technical health

| | |
|---|---|
| Static world (Ch5 era) | 2,259 merged meshes (over the 2,000 world-geometry check ceiling; known, same as the first draft) |
| JS heap at title | ~1,085 MB (Chromium, SwiftShader) |
| Renderer steady in Ch5 | 1.67–1.82 GB; brief peaks 4–6 GB on jumps under software GL |
| Lights in Ch5 | Constant: hemisphere, sun, 6 point, 5 spot (no mid-scene shader recompiles) |
| Real-GPU FPS | **Never measured** |
| Audio | Placeholder synthesis; **never listened to by a person**; no voices |

Details: [Performance budget](../07_VISUAL_AND_AUDIO/PERFORMANCE_BUDGET.md).
