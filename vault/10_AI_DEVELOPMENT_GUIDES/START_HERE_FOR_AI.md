# Start here (for AI assistants)

You are working on *Last Light*, a browser horror game built in Three.js with no build step. Several AI agents work on it:
**Claude** (story, structure, gameplay; `claude/*` branches) and **Astra** (Codex; art and polish; `codex/*` branches).
The **human developer** owns every decision about canon, approval and publication.

## The ten steps (do them in order)

1. **Read the vault index.** [START_HERE](../00_START_HERE/START_HERE.md), then [Status labels](../00_START_HERE/STATUS_LABELS.md)
   and [Development rules](../00_START_HERE/DEVELOPMENT_RULES.md).
2. **Determine which branch and commit are authoritative** for your task. Use [Source of truth](SOURCE_OF_TRUTH.md).
   Record the exact branch name **and full SHA** you start from. Check that another agent is not active on it
   ([Current workstreams](../09_DEVELOPMENT_HISTORY/CURRENT_WORKSTREAMS.md)).
3. **Read the relevant chapter's documentation**: its vault note in [03 Chapters](../03_CHAPTERS/CHAPTER_INDEX.md) and the
   handoff(s) it links in `docs/` (newest handoff wins where they disagree).
4. **Check established canon**: [Established canon](../01_STORY_BIBLE/ESTABLISHED_CANON.md),
   [Mystery and clue tracker](../01_STORY_BIBLE/MYSTERY_AND_CLUE_TRACKER.md), [Continuity discrepancies](../01_STORY_BIBLE/CONTINUITY_DISCREPANCIES.md).
5. **Avoid contradicting previous chapters.** Run the [Continuity checklist](CONTINUITY_CHECKLIST.md) on any new line,
   scene or clue.
6. **Preserve accepted gameplay.** Chapters 0–4 must look and play as accepted; make shared-code changes switchable
   ([Technical architecture](../09_DEVELOPMENT_HISTORY/TECHNICAL_ARCHITECTURE.md)); keep the contracts in
   [06 Gameplay systems](../06_GAMEPLAY_SYSTEMS/SYSTEMS_INDEX.md).
7. **Distinguish confirmed decisions from proposals.** Label everything (✅ / 🟡 / 💡 / ❓ / ⛔). Never present a proposal
   as canon; never fill an UNKNOWN with a guess.
8. **Avoid unnecessary broad repair cycles.** Fix what was asked at its root, minimally. Don't re-architect accepted systems
   or relaunch hours-long review rounds for a small change ([Change management](CHANGE_MANAGEMENT.md)).
9. **Test appropriately**: proportionate to the change ([QA standards](../08_PLAYTESTING_AND_ISSUES/QA_STANDARDS.md)).
   Docs → link check. Focused fix → focused test + `QUICK=1 node tests/verify.mjs`. Chapter pass → the full set.
10. **Report unfinished work accurately**: what you did not run, what failed, what was killed by memory, what is
    provisional. An automated pass is **not** human approval. Never claim a push or a hosted build you did not verify.

## Hard "nevers"

- Never modify a frozen release branch, `main`, or another agent's active branch
  (today: `codex/astra-chapter5-ultra-visual-reconstruction`).
- Never rewrite history (no rebase, squash, force-push) on shared branches.
- Never name or explain the Presence or the creature, or decide where Alex is, without the human developer.
- Never mark anything ✅ Human-approved yourself.
- Never start Chapter Six (or any new chapter) without the human developer's go-ahead.

## Workflow guides

- [Claude workflow](CLAUDE_WORKFLOW.md)
- [Astra workflow](ASTRA_WORKFLOW.md)
- [Change management](CHANGE_MANAGEMENT.md)

## After you finish

Update the vault (or tell the human exactly what changed so they can): [Vault maintenance](../00_START_HERE/VAULT_MAINTENANCE.md).
