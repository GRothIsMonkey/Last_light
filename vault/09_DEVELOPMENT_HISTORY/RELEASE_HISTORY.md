# Release history

Newest first. **Frozen** = accepted and never modified again; later work branches from it. **Active** = still changing.
Full narrative release notes: [docs/RELEASE_NOTES.md](../../docs/RELEASE_NOTES.md) (stops at Chapter Five's first draft).
Full SHAs: [Git branches](GIT_BRANCHES.md).

| # | Release | Branch @ commit | Date | State | Verification (automated) |
|---|---|---|---|---|---|
| 13 | Chapter Five visual reconstruction (Astra) | `codex/astra-chapter5-ultra-visual-reconstruction` @ `4bf3902` | 2026-10-23 | **Active**, unapproved | No report yet |
| 12 | **Chapter Five gameplay and story repair** | `claude/chapter5-gameplay-story-repair` @ `d4de9ab` | 2026-10-20 | Finished; **awaiting human review**; baseline | 736/736 sim; Ch5 81/81; Chromium 24+16 segmented; 37 DEV scenes |
| 11 | Chapter Five first draft | `claude/chapter5-pine-ridge` @ `cafc27f` | 2026-10-17 | Superseded by the repair | 718/718 sim; Chromium 33/33 |
| 10 | Chapter Four repair pass 2 (Astra) | `codex/astra-chapter4-repair-pass2` @ `c964777` | 2026-10-14 | Frozen; base of Chapter Five | 11 focused browser checks |
| 9 | Chapter Four repair (Astra) | `91d5dba` | 2026-10-13 | Superseded by pass 2 | 13 focused checks |
| 8 | **Chapter Four Astra final art polish** | `4542392` (runtime `39b6ce7`) | 2026-10-12/13 | Accepted art release | 622 sim; 4 browser + 42 DEV starts; continuous run killed at 8 GiB |
| 7 | **Chapter Four horror revision** | `claude/chapter4-horror-revision` @ `f0120ba` | 2026-10-11 | **Frozen; accepted story** | 622 sim; 13 browser |
| 6 | Chapter Four Main Street (structural) | `claude/chapter4-main-street` @ `8cc59e2` | 2026-10-10 | Superseded | 593 sim; 11 browser |
| 5 | **Chapter Three Astra visual polish** | `codex/astra-chapter3-final-polish` @ `5be6814` (runtime `797bf62`) | 2026-10-08 | **Frozen; accepted** | 551 sim; 83 + 142 DEV browser |
| 5c | Chapter Three creature chase | `claude/chapter3-creature-chase` @ `6edcad0` | 2026-10-07 | Superseded by Astra polish | 551 sim; 83 + 142 browser |
| 5b | Chapter Three horror escalation | `claude/chapter3-horror-escalation` @ `e575f06` | 2026-10-06 | Superseded | 475 sim |
| 5a | Chapter Three horror rebuild | `claude/chapter3-horror-rebuild` @ `26304a9` | 2026-10-06 | Superseded | 436 sim; 420 browser |
| 4b | Chapter Three structural (basin) | `claude/chapter3-horror-investigation` @ `8f06b2b` | 2026-10-05 | ⛔ Story rejected (basin) | 339 sim; 434 browser |
| 4 | **Chapter Two Astra final polish** | `codex/astra-chapter2-final-polish` @ `68cc543` | 2026-10-03 | **Frozen; accepted** | 230 sim; 311 browser; 10 route |
| 3b | Chapter Two (structural) | `claude/optimistic-tesla-obxiv5` @ `3384204` | 2026-10-02 | Superseded | — |
| 3 | **Chapter One Astra final polish** | `codex/astra-chapter1-final-polish` @ `9c4b576` | 2026-10-01 | **Frozen; accepted** | 156 sim; 184 browser |
| 2b | Chapter One pass | `claude/relaxed-heisenberg-gv002b` @ `ed471c0` | 2026-10-01 | Superseded | 152 browser |
| 2 | **Prologue final polish** | `codex/astra-last-light-final-polish` @ `9520b4f` | 2026-09-30 | **Frozen; accepted** | 102 sim; 115 browser |
| 1b | Structural polish pass | `claude/epic-planck-cme9eq` @ `59c6472` | 2026-09-29 | Superseded | 92 sim |
| 1 | **v0.1** | `codex/astra-v0.1-release` = `main` @ `21bb7a7` | 2026-09-29 | Frozen; published on `main` | 22 audio cases |

## What each accepted release added

- **v0.1 / Prologue:** the ride, three departures, the lookout, the AR chalk; later the full world continuation, side streets,
  houses, sidewalk riding, bell, the fifth chalk rider, "I thought I remembered everyone."
- **Chapter One:** the police car, Alex's house, Jamie and Sam, the oak, the creek, the reflector, the bell; night riding and
  walking, checkpoints, QA jumps, police and adults, companions.
- **Chapter Two:** the easement, Alex's bike, the culvert bell, police and search, the morning, the memory system; the four
  playtest fixes.
- **Chapter Three:** Alex's room and phone, Mr. Okafor, the access road, the storm drain, the false Alex, the creature and
  the chase; tension/heartbeat, adaptive captions, the DEV selector.
- **Chapter Four:** Alex's camera, downtown, the microfilm, the Presence's light cascades, live footage, the creature's fear,
  five escape routes, the Lyric.
- **Chapter Five (unapproved):** Pine Ridge, Camp Whippoorwill, companion minds, physical props, inventory, faces, the three
  lights, the split, the double.

## Delivery notes

- Chapter Four's Astra polish was delivered as a portable standalone repository because GitHub push authentication was
  unavailable at the time; its commits are now in the lineage.
- Private hosted playtest builds exist for Chapters Three, Four and Five; links are not kept in the repository.
- No release after v0.1 has been merged to `main`.
