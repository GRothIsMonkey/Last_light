# Source of truth

When sources disagree, use this order.

## For what the game does (behavior, story as implemented)

1. **The code** at the authoritative commit (`dist/`), run or read. Code comments can be stale (the top comments of
   `dist/chapter4.js` and `dist/chapter5.js` describe superseded versions).
2. **The newest handoff** for that chapter in `docs/` (each later handoff says it wins where they disagree: e.g. creature
   chase > escalation > rebuild > structural for Chapter Three; horror revision > main street for Chapter Four; repair >
   first draft for Chapter Five).
3. **The test report** (`docs/TEST_REPORT.md`, newest section first).
4. **This vault** (a summary; if it disagrees with 1–3, the vault is wrong — fix it).
5. The root `README.md` and release notes (known to be partly stale; see
   [Continuity discrepancies](../01_STORY_BIBLE/CONTINUITY_DISCREPANCIES.md)).

## For what is canon (what the story is allowed to be)

1. **The human developer's explicit decisions** (recorded in the [Decision log](../00_START_HERE/DECISION_LOG.md)).
2. **Accepted chapter releases** (Chapters 0–4) — ✅ CONFIRMED CANON.
3. **The current baseline of an unapproved chapter** (Chapter Five @ `d4de9ab`) — 🟡; build on it, flag dependencies.
4. **Proposals** — 💡; never binding.

## Which branch is authoritative (2026-10-23)

| Purpose | Branch @ commit |
|---|---|
| Gameplay and story for the whole game (Ch0–5) | `claude/chapter5-gameplay-story-repair` @ `d4de9abd16fa184f1861335a6e4d8100ce31f1e2` |
| Chapter Five visuals in progress | `codex/astra-chapter5-ultra-visual-reconstruction` @ `95a7e432…` as of 2026-10-23 (Astra's; read-only for everyone else; it moves often) |
| A frozen chapter as accepted | Its release branch ([Git branches](../09_DEVELOPMENT_HISTORY/GIT_BRANCHES.md)) |
| Documentation | `docs/last-light-vault` (this vault) and `docs/` on the code branches |
| Public release | `main` (v0.1 only; out of date) |

**Rule:** when Astra's Chapter Five pass is accepted, it becomes the authoritative branch for Chapters 0–5. Update this
table and [START_HERE](../00_START_HERE/START_HERE.md) the same day.

## How to verify a branch head yourself

In a terminal: `git ls-remote origin` (or the branch page on GitHub, which shows the latest commit). In a browser: open
`https://github.com/GRothIsMonkey/Last_light/branches`. Compare the full SHA with the tables in the vault.
