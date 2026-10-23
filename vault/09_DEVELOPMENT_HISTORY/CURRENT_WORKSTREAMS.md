# Current workstreams (2026-10-23)

| Workstream | Owner | Branch | Base | State | Next step |
|---|---|---|---|---|---|
| **Chapter Five visual reconstruction + interactive Owl escape** | Astra (Codex) | `codex/astra-chapter5-ultra-visual-reconstruction` | `d4de9ab` | **Active** (2 commits, 2026-10-23: `4f96fdf`, `4bf3902`) | Finish; write a handoff; hand to the human |
| Chapter Five approval | Human developer | — | Astra's build | Waiting | Playtest; approve or list problems |
| Development knowledge vault | Claude | `docs/last-light-vault` | `d4de9ab` | Created 2026-10-23 | Human decides when to integrate |
| Chapter Six | — | — | — | **Not started** (do not start before Chapter Five is approved) | Human decides direction |

## Astra's branch (observed read-only; may change)

Commits on top of `d4de9ab`:

- `4f96fdf` — "Reconstruct Chapter Five environments, characters and interactive Owl escape": 19 files changed (+538/−94).
  New: `dist/chapter5-models.js`, `dist/chapter5-props.js`, `dist/pine-detail.js`, `dist/pine-forest.js`,
  `dist/pine-materials.js`, `tests/astra-smoke.mjs`, `tests/chapter5-ultra-capture.mjs`. Changed: `audio.js`,
  `chapter5-garage.js`, `chapter5-gear.js`, `chapter5-presence.js`, `chapter5.js`, `game.js`, `pine-build.js`,
  `pine-camp.js`, `pine-plan.js`, `world.js`, `tests/chapter5-browser.mjs`, `tests/chapter5-sim.mjs`.
- `4bf3902` — "Avoid reserved GLSL identifier in forest-floor material".

The escape changes visible in the diff are summarized in
[Chapter Five Astra objectives](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_ASTRA_OBJECTIVES.md). No documentation for the pass
exists on the branch yet.

## Coordination rules

- The vault never touches Astra's branch; Astra never needs to touch the vault.
- When Astra's pass lands, update: [Chapter Five](../03_CHAPTERS/CHAPTER_5_THE_PLACE_IN_THE_PICTURE.md),
  [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md), [Release history](RELEASE_HISTORY.md),
  [Git branches](GIT_BRANCHES.md), [START_HERE](../00_START_HERE/START_HERE.md).
- If Astra's pass changes story (e.g. the escape), record it as 🟡 until the human approves it.
