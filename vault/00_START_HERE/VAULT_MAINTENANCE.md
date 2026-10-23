# Vault maintenance

Short recipes for keeping the vault true. Each takes a few minutes in github.dev
([how](HOW_TO_USE_THIS_VAULT.md)). When you finish, add one line to the **Vault change log** at the bottom.

**Golden rules**

- Update the vault **when something changes status**, not later.
- Never change a label to ✅ CONFIRMED CANON or ✅ Human-approved unless the human developer said so.
- Link to the source (a `docs/` file, a commit, a `dist/` file) for every new fact.
- If you cannot verify something, write **"Not yet verified."**

---

## Record a new accepted chapter

1. Copy [the chapter template](../11_TEMPLATES/CHAPTER_NOTE_TEMPLATE.md) to `03_CHAPTERS/CHAPTER_N_TITLE.md` (or update
   the existing note).
2. Fill every section from the chapter's handoff; mark its story ✅ CONFIRMED CANON only once the human accepts it.
3. Update: [Chapter index](../03_CHAPTERS/CHAPTER_INDEX.md), the chapter table in [START_HERE](START_HERE.md),
   [Master timeline](../01_STORY_BIBLE/MASTER_TIMELINE.md), [Established canon](../01_STORY_BIBLE/ESTABLISHED_CANON.md),
   [Release history](../09_DEVELOPMENT_HISTORY/RELEASE_HISTORY.md), [Git branches](../09_DEVELOPMENT_HISTORY/GIT_BRANCHES.md),
   [Status labels](STATUS_LABELS.md) (the accepted-chapter table).
4. Move any of its items in [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md) to
   [Accepted fixes](../08_PLAYTESTING_AND_ISSUES/ACCEPTED_FIXES.md) if the human approved them.
5. Add a line to the [Decision log](DECISION_LOG.md).

## Update character information

1. Open the character's note in [02 Characters](../02_CHARACTERS/CHARACTER_INDEX.md).
2. Add the new fact under the right heading with its label and chapter, e.g.
   `- 🟡 Chapter Six: Sam admits he took the shirt for Alex's mom. (dist/chapter6.js)`.
3. If it changes a relationship, also update [Character relationships](../02_CHARACTERS/CHARACTER_RELATIONSHIPS.md).
4. If it changes a look (clothes, colors, build), update [Character design](../07_VISUAL_AND_AUDIO/CHARACTER_DESIGN.md).

## Add a new clue

1. Copy the block in [the clue template](../11_TEMPLATES/CLUE_ENTRY_TEMPLATE.md) into
   [Mystery and clue tracker](../01_STORY_BIBLE/MYSTERY_AND_CLUE_TRACKER.md) under the right thread.
2. Fill: where it is found, what it shows, what the characters say, what it connects to, status label, source file.
3. If it raises a new question, add it to [Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md).

## Track an unresolved mystery

1. Add a row to [Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md): the question, what is known, which
   chapters touch it, and whether it is *deliberately open* or *not yet verified*.
2. Never write an answer there. Candidate answers go in a **PROPOSED** section of a future-chapter note, clearly marked.

## Add playtest feedback

1. Copy [the playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md) to
   `08_PLAYTESTING_AND_ISSUES/PLAYTEST_YYYY-MM-DD_CHAPTERN.md`.
2. Write the human's words as they were said. Do not soften them.
3. Add the playtest to the [Playtest index](../08_PLAYTESTING_AND_ISSUES/PLAYTEST_INDEX.md).
4. Turn each actionable complaint into a row in [Open issues](../08_PLAYTESTING_AND_ISSUES/OPEN_ISSUES.md) with
   status 🔴 Open.

## Approve or reject a design decision

1. Only the human developer approves or rejects. Record their words and the date.
2. Add a row at the top of the [Decision log](DECISION_LOG.md) (✅ or ⛔ REJECTED).
3. Update the label wherever the item appears (search the vault for its name with `Ctrl+Shift+F`).
4. For a rejection, keep the item in the vault, struck through or labeled ⛔ REJECTED, so nobody re-proposes it by
   accident.

## Update a GitHub release

1. When a branch is accepted or frozen, add it to [Release history](../09_DEVELOPMENT_HISTORY/RELEASE_HISTORY.md) and
   [Git branches](../09_DEVELOPMENT_HISTORY/GIT_BRANCHES.md) with its **full SHA** (copy it from the branch page on
   GitHub: the commit link shows the full hash).
2. Mark it *Frozen* or *Active*.
3. Update [Current workstreams](../09_DEVELOPMENT_HISTORY/CURRENT_WORKSTREAMS.md) and the top table of
   [START_HERE](START_HERE.md).

## Record a new horror mechanic

1. Copy [the horror-mechanic template](../11_TEMPLATES/HORROR_MECHANIC_TEMPLATE.md) into
   [Horror mechanics registry](../05_HORROR_DESIGN/HORROR_MECHANICS_REGISTRY.md).
2. Say what the player perceives, what causes it, how it escalates, its fallback, and its status.
3. Check it against the [Horror design bible](../05_HORROR_DESIGN/HORROR_DESIGN_BIBLE.md) rules (visible threat,
   cause, no text-only threats).

## Add a future chapter proposal

1. Copy [the proposal template](../11_TEMPLATES/FUTURE_CHAPTER_PROPOSAL_TEMPLATE.md) into
   `03_CHAPTERS/FUTURE_CHAPTERS/`.
2. Label everything 💡 PROPOSED. Name the author and date. List what it depends on from Chapter Five (which is not yet
   approved).
3. Link it from the [Future chapters index](../03_CHAPTERS/FUTURE_CHAPTERS/FUTURE_CHAPTERS_INDEX.md).

---

## Vault change log

| Date | Change | By |
|---|---|---|
| 2026-10-23 | Vault created from `d4de9ab` on `docs/last-light-vault` | Claude |
