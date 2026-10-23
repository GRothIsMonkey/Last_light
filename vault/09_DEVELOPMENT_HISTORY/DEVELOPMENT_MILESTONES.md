# Development milestones

The project went from v0.1 to a five-chapter game in under four weeks (first commit 2026-09-28; 181 commits to `d4de9ab`).
The rhythm is consistent: **Claude** builds a chapter's structure, story and systems; the **human developer** playtests;
Claude revises; **Astra** polishes the art; the release freezes; the next chapter branches from it.

## Timeline

| Date | Milestone |
|---|---|
| 2026-09-28 | Project imported: "Last Light v0.1" game, tests and docs |
| 2026-09-29 | v0.1 published to `main` (owner's instruction); structural pass on `epic-planck` (92 checks) |
| 2026-09-30 | Prologue final art release (`9520b4f`) |
| 2026-10-01 | Chapter One: the night Alex did not come home; Astra polish released (`9c4b576`) |
| 2026-10-02 | Chapter Two; four human-playtest bugs fixed (including the old-oak deadlock) |
| 2026-10-03 | Chapter Two final release (`68cc543`) |
| 2026-10-05 | Chapter Three structural pass (basin); tension system; adaptive captions; the temporary DEV selector |
| 2026-10-06 | Chapter Three rebuilt (access road, storm drain) after the human found it unscary; escalation the same day |
| 2026-10-07 | The creature: a licensed model, a real chase; the DEV selector becomes Chapter → Scene (58 scenes) |
| 2026-10-08 | Chapter Three final release (`5be6814`) |
| 2026-10-10 | Chapter Four: Main Street (structural) |
| 2026-10-11 | Chapter Four horror revision (`f0120ba`) — accepted story |
| 2026-10-12/13 | Chapter Four Astra art release (`4542392`) and repair (`91d5dba`) |
| 2026-10-14 | Chapter Four repair pass 2 (`c964777`) — base for Chapter Five |
| 2026-10-17 | Chapter Five first complete draft (`cafc27f`); the human's playtest: 36 complaints |
| 2026-10-17 → 20 | Chapter Five gameplay and story repair, stages A–G, review round, final audit (`d4de9ab`) |
| 2026-10-23 | Astra begins Chapter Five's visual reconstruction; the human reports the escape problem; this vault is created |

## Lessons the project has learned (recorded in the handoffs)

1. **Structure first, art second.** Structural passes are deliberately plain; Astra's passes polish without changing
   story, routes or behavior.
2. **Protect accepted chapters.** Shared-code changes are switchable; full regression every pass; DEV starts must equal
   natural arrivals.
3. **Scripted ≠ human.** Automated walkthroughs repeatedly passed builds the human found unscary or awkward. Human playtests
   drive every major revision.
4. **Horror needs perception and causes** (Chapters Three, Four, Five revisions).
5. **Companions need root-cause fixes**, not catch-up hacks (Chapters Two, Four, Five).
6. **Memory limits in build containers** constrain browser verification; segmented runs are acceptable if reported.
7. **Report honestly**: every handoff lists what was not done.
