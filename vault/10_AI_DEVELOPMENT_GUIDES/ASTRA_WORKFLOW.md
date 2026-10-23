# Astra workflow

Astra (Codex, `codex/*` branches) does the **art and polish passes**: every accepted chapter release so far is an Astra
polish of a Claude structural pass (Prologue, Chapters One–Four), plus Chapter Four's two repair passes. Astra is now
doing Chapter Five's visual reconstruction, which also redesigns the escape.

## The pattern Astra's passes have followed (keep it)

1. **Start from the exact accepted source commit**; record it ("Accepted source: `claude/chapter4-horror-revision`, exactly
   `f0120ba…`").
2. **Preserve story, routes, companion and creature behavior, controls and the DEV selector** unless the brief says
   otherwise. List the modules left unchanged (e.g. "`chapter4.js`, `town-plan.js`, `companions.js`, `creature.js` …
   unchanged").
3. **Add detail inside the existing batching and culling**; keep light counts and slots stable; report geometry and atlas
   budgets.
4. **Validate**: simulation suite, browser checks (0 JS/shader errors), focused restoration checks for earlier chapters,
   inspected captures; runtime-file hashes in reports/manifests.
5. **Document** in `docs/ASTRA_<CHAPTER>_*.md`: provenance, scope, visual changes table, preserved behavior, performance,
   validation, known limits ("no real-GPU FPS claim").
6. **Never merge to `main`** or change earlier release branches.

## Chapter Five specifics

- Base: `claude/chapter5-gameplay-story-repair` @ `d4de9ab`.
- Objectives and the **contracts to keep**: [Chapter Five Astra objectives](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_ASTRA_OBJECTIVES.md)
  (from `docs/CHAPTER5_ASTRA_PREP_HANDOFF.md`).
- The top priority is the human's complaint about the escape after the double.
- Chapters 0–4 must still look and play as accepted: Chapter Five's shared-code features stay switchable.
- When gameplay or story changes (the escape is gameplay), say so explicitly in the handoff so the vault can mark it 🟡.

## Coordination with Claude and the vault

- Astra's active branch is Astra's alone; no other agent commits to it.
- The vault (`docs/last-light-vault`) is independent; Astra does not need to edit it. After the pass, the human (or an
  agent asked to) updates the vault from Astra's handoff.
