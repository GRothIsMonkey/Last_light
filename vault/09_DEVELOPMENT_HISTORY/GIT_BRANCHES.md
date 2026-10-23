# Git branches

Verified on 2026-10-23 with `git ls-remote` and `git merge-base --is-ancestor` against a full (unshallowed) clone of
`GRothIsMonkey/Last_light`. "Lineage" = the commit is an ancestor of the Chapter Five repair `d4de9ab` (the history is one
straight line from v0.1 to the repair, 181 commits).

Agents: **Claude** works on `claude/*` branches; **Astra** (Codex) works on `codex/*` branches. The human developer
decides what is accepted.

## Remote branches

| Branch | Head (full SHA) | Date | Role | State | Lineage |
|---|---|---|---|---|---|
| `main` | `21bb7a7147f2f81702b3bd5376c8cbdc81f184a2` | 2026-09-29 | v0.1 prologue, published at the owner's request | Frozen (not updated since) | ✔ |
| `codex/astra-v0.1-release` | `21bb7a7147f2f81702b3bd5376c8cbdc81f184a2` | 2026-09-29 | v0.1 release (same commit as `main`) | Frozen | ✔ |
| `claude/loving-newton-1vlisx` | `02cbde1ad2b4d0061dc7346c52c66e85d4c95642` | 2026-09-29 | Final v0.1 gameplay pass (Claude) | Historical | ✔ |
| `claude/epic-planck-cme9eq` | `59c647220e80d12da0d205b1562d483cc5bdb7f3` | 2026-09-29 | Structural polish pass (Claude) | Historical | ✔ |
| `claude/pages-preview` | `450fc5b8f5844a699aa4cb019cca2fb518fce769` | 2026-09-30 | A playtest preview of `epic-planck` at `/preview/` | Side branch | ✘ (branches off `21bb7a7`) |
| `codex/astra-last-light-final-polish` | `9520b4f1d72759b27ac823671bdefae19ce27e55` | 2026-09-30 | **Prologue final art release** | Frozen | ✔ |
| `claude/relaxed-heisenberg-gv002b` | `ed471c04b34bc083da10bdc876f20419246a08e6` | 2026-10-01 | Chapter One pass (Claude) | Historical | ✔ |
| `codex/astra-chapter1-final-polish` | `9c4b57698efeb7137de8a292b7662dac97a9a2d0` | 2026-10-01 | **Chapter One final release** | Frozen | ✔ |
| `claude/optimistic-tesla-obxiv5` | `3384204a42872ad0d3592b6647441582cb48531b` | 2026-10-02 | Chapter Two pass (Claude) | Historical | ✔ |
| `codex/astra-chapter2-final-polish` | `68cc54396bdc2599cfa35b59ba6a4c981db6a8f3` | 2026-10-03 | **Chapter Two final release** | Frozen | ✔ |
| `claude/chapter3-horror-investigation` | `8f06b2bb3b8f545243c75f3644627cb8a217d7ec` | 2026-10-05 | Chapter Three structural pass (basin version, ⛔ superseded) | Historical | ✔ |
| `claude/chapter3-private-playtest` | `b027b7241beb1b30a489785c51cce1dc19ae8932` | 2026-10-05 | Private playtest build with the first DEV selector | Side branch | ✘ (branches off `8f06b2b`) |
| `claude/chapter3-horror-rebuild` | `26304a9dbc30ce66dcdc0a5e65f4082fc53a55e0` | 2026-10-06 | Chapter Three rebuild (access road, drain) | Historical | ✔ |
| `claude/chapter3-horror-escalation` | `e575f069c2f1bec4641253632a3d670ce68c45e3` | 2026-10-06 | Chapter Three escalation | Historical | ✔ |
| `claude/chapter3-creature-chase` | `6edcad0bb44426ba29da61fd83d2f35cc94fad5c` | 2026-10-07 | Chapter Three creature chase | Historical | ✔ |
| `codex/astra-chapter3-final-polish` | `5be68143c13dfdb24ccec24afbd7ec0b4769f469` | 2026-10-08 | **Chapter Three final release** | Frozen | ✔ |
| `claude/chapter4-main-street` | `8cc59e26111c4c2032a2893c69b67fafc548612a` | 2026-10-10 | Chapter Four structural pass | Historical | ✔ |
| `claude/chapter4-horror-revision` | `f0120badfcbd60d3f1dcf7e837650a5c61088f90` | 2026-10-11 | **Chapter Four accepted story** | Frozen | ✔ |
| `codex/astra-chapter4-repair-pass2` | `c9647772642c0bbb5478bdb04bf36592fcc74919` | 2026-10-14 | **Chapter Four repair pass 2** — base of Chapter Five | Frozen | ✔ |
| `claude/chapter5-pine-ridge` | `cafc27f7f6ffd9ce8229b3a1cb7075680c332be8` | 2026-10-17 | Chapter Five first draft | Historical (superseded) | ✔ |
| `claude/chapter5-gameplay-story-repair` | `d4de9abd16fa184f1861335a6e4d8100ce31f1e2` | 2026-10-20 | **Chapter Five gameplay/story repair — current baseline** | Finished; awaiting human review | ✔ (it is the reference) |
| `codex/astra-chapter5-ultra-visual-reconstruction` | `4bf39029b29fc01b91584217f6d2d99dbfe81cf7` | 2026-10-23 | **Astra's active Chapter Five visual pass** | **ACTIVE — do not touch** | Descends from `d4de9ab` (+2 commits) |
| `docs/last-light-vault` | (this vault) | 2026-10-23 | This knowledge vault, from `d4de9ab` | Documentation only | Descends from `d4de9ab` |

## Release commits that are not branch heads

| Commit | Date | What | Branch in docs |
|---|---|---|---|
| `ec67022c9dfd99ede3d4de206b751e9fce93509a` | 2026-10-01 | Chapter One validated game/test commit | `codex/astra-chapter1-final-polish` |
| `f9ef319d31b01f27a07ec8639c5db3106ce0f04f` | 2026-10-03 | Chapter Two tested implementation | `codex/astra-chapter2-final-polish` |
| `38ff68d309c71a0d3a6d9568fefd7a615940ceae` | 2026-10-05 | Chapter Three structural tested runtime | `claude/chapter3-horror-investigation` |
| `43b71e6ac7c98fe7c5ce83224cb78941e7233cd3` | 2026-10-06 | Chapter Three escalation runtime | `claude/chapter3-horror-escalation` |
| `797bf62382d5ad5760d13ecb1a4d70eb73cb1a38` | 2026-10-08 | Chapter Three Astra runtime | `codex/astra-chapter3-final-polish` |
| `39b6ce7a9d8f7f617de9403d4f206aa22af38ed1` | 2026-10-12 | Chapter Four Astra final runtime | `codex/astra-chapter4-final-polish` (no remote branch now; delivered as a portable repository) |
| `4542392c6d18fd9c4bfe395bc5d1e0877a763f4a` | 2026-10-13 | **Chapter Four accepted Astra release** | `codex/astra-chapter4-final-polish` (no remote branch now) |
| `91d5dba97728d8f1f9205695998654ee53439c91` | 2026-10-13 | Chapter Four Astra repair (playtest candidate) | `codex/astra-chapter4-final-polish-repair` (no remote branch now) |
| `71f5539f0fbd86b8fce9956e419e165f20347837` | 2026-10-17 | Chapter Five first draft verified runtime (718/718) | `claude/chapter5-pine-ridge` |
| `c08d35eae820e24b605855890fa73363685cc697` | 2026-10-20 | Chapter Five repair: five defects from the final audit | `claude/chapter5-gameplay-story-repair` |
| `66c6ca5aee8bf88cca1e6bd4bf488fa248d1b23c` | 2026-10-20 | Chapter Five repair final runtime (`dist/` unchanged after it) | same |
| `4f96fdffdb9d16803b4ca9eefbf16522212a5909` | 2026-10-23 | Astra: "Reconstruct Chapter Five environments, characters and interactive Owl escape" | `codex/astra-chapter5-ultra-visual-reconstruction` |

All of these are ancestors of `d4de9ab` except Astra's `4f96fdf` (a descendant).

## Branch naming conventions observed

- `claude/<chapter>-<topic>` for Claude's structural/story passes; older ones have random session names
  (`claude/relaxed-heisenberg-gv002b`).
- `codex/astra-<chapter>-final-polish` for Astra's accepted art releases; `codex/astra-<chapter>-<topic>` for other Astra work.
- `docs/<topic>` for documentation-only work (this vault).
