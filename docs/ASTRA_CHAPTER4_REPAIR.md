# Chapter Four Astra repair — playtest candidate

Source: `codex/astra-chapter4-final-polish` at `4542392c6d18fd9c4bfe395bc5d1e0877a763f4a`.
Repair branch: `codex/astra-chapter4-final-polish-repair`.
This candidate requires the user's human playtest and approval; it is not final accepted.

Private playtest: https://last-light-astra-repair.graysonroth30.chatgpt.site

## Repairs

- Library and commercial/video-store subfloor tops are now 6 cm below the finish floors. The former coplanar foundation and floor surfaces were a concrete depth-conflict defect. Finish-floor gameplay heights are preserved.
- Chapter Four brick and carpet use cached deterministic 256×256 textures with mip filtering and world-aligned coordinates. This removes the high-frequency per-fragment noise/bump recipes from those affected materials. Remaining Chapter Four bump normal calculations guard against zero-length normalization.
- All nine Old Mill approach houses use the existing detailed neighborhood house builder, including roof edges, windows, trim, porches and chimneys. Road-facing orientation, foundations and graded paths are corrected. Original lot dimensions, positions and collision envelopes are preserved.
- Connector road, curb, sidewalk and lawn cross-sections meet Summerfield; the road crown fades into Main Street. Main Street widening uses smooth edges shared with navigation.
- Surrounding terrain is clipped to the road/lawn boundaries instead of removing whole cells or overlapping differently sampled surfaces. Region-edge terrain blending no longer lifts the land away from the connector.
- Existing downtown random choices are preserved by retaining the original house-loop RNG consumption. Earlier neighborhood architecture code is unchanged.

The six runtime files changed from the source release are `chapter4-surfaces.js`, `town-build.js`, `town-plan.js`, `chapter4-textures.js`, `town-ground.js` and `town-houses.js`.
Story, chapter controllers, companion behavior, creature identity/animation/model, title/controls and DEV selector files are unchanged.

## Focused validation before interruption

The preceding repair session completed 13 focused checks:
1. Library finish floor separated from foundation.
2. Video-store finish floor separated from foundation.
3. Affected materials use shared mip-filtered textures.
4. Connector road/sidewalk samples have no holes or competing upper surfaces.
5. Connector lawn samples have no holes.
6. Main Street widening agrees with navigation.
7. Both connector ends join their road and sidewalk surfaces.
8. Nine detailed approach houses face the road and retain lot dimensions.
9. Chapter Three endcard handoff and DEV Chapter Four start agree on active world/Chapter Four state.
10. Movement input works and companions remain active.
11. An input-driven connector ride reaches downtown.
12. All 42 Chapter Four DEV scenes start.
13. Creature loading and earlier-chapter material restoration/town closure checks pass.

The original check groups combined some of these assertions; the run reported 13 passing groups.
Maximum sampled rendered/navigation height errors were approximately 0.019814 m on the connector and 0.00001345 m on Main Street.
The short browser run moved the player 2.7465 m, loaded the creature (one textured mesh), kept Jamie and Sam active/visible, and rode into the downtown state. No browser/shader errors were reported.

Rendered views reviewed in that session covered the title/DEV start, library floor and exterior brick, video floor, approach houses, earlier neighborhood, Summerfield join, town join and ridden downtown arrival; the affected surfaces were also viewed after a small camera movement.
No full-game or continuous whole-chapter walkthrough was repeated.

## Recovery and publication verification

The local workspace reverted after interruption. The complete final runtime was recovered from the already-pushed private Sites source commit `23ceb57951bfb367f66f10b60b6842a47f0bac4a`, then applied to a fresh extraction of the exact original 4542392 repository.
All 70 runtime files match that recovered hosting copy byte-for-byte; only the six intended runtime files differ from the original release.
JavaScript syntax checks and `git diff --check` passed after recovery.

Private deployment succeeded on 2026-10-14. Authenticated HTTP checks returned the exact index and original creature bytes with HTTP 200. The host serves the GLB directly; no embedded-model conversion or game rebuild was needed.
Creature SHA-256: `e86b69df95ce1a96519f0eb720f3dc58cb15d07f3848e35c5f8891047add51b3`.

## Limits

- The original random color flashing was not reproduced on the software renderer. Coplanar floor geometry was confirmed and corrected; sampled repaired renders were stable. Visual stability on the user's GPU still needs human confirmation.
- The natural-arrival comparison used the actual Chapter Three endcard handoff after a jump to that ending, rather than a complete Chapters 0–3 replay.
- Raw repair screenshots and the focused test script/report from the interrupted scratch workspace were not retained. The validation account above is the recorded result from that session, not a newly generated report or a rerun.
- No fresh hosted browser run was available after recovery. Deployment, exact index/model delivery and unchanged runtime bytes were verified; the earlier rendered checks apply to this recovered runtime.
- Sign in with the owning ChatGPT account to access the private Site. Keyboard and mouse are recommended.

