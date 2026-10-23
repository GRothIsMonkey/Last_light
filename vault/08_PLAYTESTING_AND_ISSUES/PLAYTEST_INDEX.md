# Playtest index

> **Automated tests are not playtests.** A playtest is the human developer (or another person) playing the game. Simulation
> and Chromium runs are recorded under [QA standards](QA_STANDARDS.md) and in [docs/TEST_REPORT.md](../../docs/TEST_REPORT.md).

## Human playtests on record

| Date | Build | Chapter(s) | Result | Note |
|---|---|---|---|---|
| ~2026-10-01 | Chapter One pass (`ed471c0`) | One | Night navigation to Jamie's and Sam's houses needed clearer cues (answered in Astra's Chapter One polish) | [Earlier feedback](EARLIER_PLAYTEST_FEEDBACK.md) |
| ~2026-10-01/02 | Chapter One release (`9c4b576`) | Prologue–One | Four bugs: fan audio, porch flag, a hoop, friends stuck at the old oak (fixed in Chapter Two) | [Earlier feedback](EARLIER_PLAYTEST_FEEDBACK.md) |
| ~2026-10-06 | Chapter Three rebuild (`26304a9`), muted | Three | "Better but not great" | [Earlier feedback](EARLIER_PLAYTEST_FEEDBACK.md) |
| ~2026-10-10/11 | Chapter Four structural (`8cc59e2`) | Four | Five problems | [Earlier feedback](EARLIER_PLAYTEST_FEEDBACK.md) |
| ~2026-10-17 | Chapter Five first draft (`cafc27f`) | Five | **36 complaints** | [Chapter Five feedback](CHAPTER5_INITIAL_FEEDBACK.md), round 1 |
| after 2026-10-20 | Chapter Five repair (`d4de9ab`) | Five (escape) | "Excessively long, boring, and frighteningly ineffective" | [Chapter Five feedback](CHAPTER5_INITIAL_FEEDBACK.md), round 2 |

Dates marked "~" are inferred from the commit dates of the build that was played and the build that answered it; the
repository does not record playtest dates. **Not yet verified.**

## Private playtest builds

Hosted private builds have been used (Chapter Three's private playtest build; Chapter Four's Astra repair at a private
site; Chapter Five's private build "updated in place (version 2; the link is in the final report, not in the repository)").
Links are deliberately not copied into the vault; ask the human developer.

## Recording a new playtest

1. Copy [the playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md) to `PLAYTEST_YYYY-MM-DD_CHAPTERN.md` in this folder.
2. Add a row above.
3. Add each actionable complaint to [Open issues](OPEN_ISSUES.md).
4. If the human approves something, move it to [Accepted fixes](ACCEPTED_FIXES.md) and mark it ✅ Human-approved.
