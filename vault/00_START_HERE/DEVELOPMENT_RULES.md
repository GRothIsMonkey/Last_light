# Development rules

These rules come from how every chapter so far was built (the handoffs in [`docs/`](../../docs/)) and from the human
developer's direction. They apply to people and to AI assistants. AI-specific workflow is in
[10 AI development guides](../10_AI_DEVELOPMENT_GUIDES/START_HERE_FOR_AI.md).

## 1. Repository safety

1. **Never modify a frozen release branch** (`codex/astra-*-final-polish`, `codex/astra-v0.1-release`,
   `codex/astra-last-light-final-polish`, `codex/astra-chapter4-repair-pass2`) or a finished `claude/*` branch.
2. **Never modify another agent's active branch.** Today that is `codex/astra-chapter5-ultra-visual-reconstruction`.
3. **Start every pass from an exact, recorded commit** (branch name *and* full SHA), and say so at the top of the
   handoff. Every chapter so far does this.
4. **Linear history:** no rebase, squash, force-push or merge into the source branch. Each pass is a new branch.
5. **Nothing goes to `main` without an explicit instruction from the human developer.** `main` was last updated on
   2026-09-29, when the owner asked for v0.1 to be published there.
6. **Documentation-only work stays in documentation.** The vault lives in `vault/` and never changes `dist/`, `tests/`,
   `assets/` or existing `docs/`.

## 2. Protect what is accepted

1. **Chapters 0–4 must look and play exactly as accepted.** When a later chapter needs a shared-code change, make it
   switchable and turn it on only inside that chapter. Chapter Five's repair does this (`foot.fpBody`, `face.enable`,
   `nav.setPine`, `slabs()`; see [Technical architecture](../09_DEVELOPMENT_HISTORY/TECHNICAL_ARCHITECTURE.md)).
2. **Run the full regression** (`QUICK=1 node tests/verify.mjs` at minimum) after any change to shared code, and report
   the count.
3. **Preserve accepted gameplay contracts**: companion behavior, creature distances, the "seen before it moves" reveal
   gates, checkpoints, DEV-start equivalence. Contracts per system are listed in
   [06 Gameplay systems](../06_GAMEPLAY_SYSTEMS/SYSTEMS_INDEX.md) and in `docs/CHAPTER5_ASTRA_PREP_HANDOFF.md`.

## 3. Story and continuity

1. **Check canon before writing story.** [Established canon](../01_STORY_BIBLE/ESTABLISHED_CANON.md) and the
   [Continuity checklist](../10_AI_DEVELOPMENT_GUIDES/CONTINUITY_CHECKLIST.md).
2. **Never explain the core mysteries without the human developer's decision**: what the Presence is, what the
   creature is, where Alex is, who "AR" is. The game has never named the Presence or the creature on screen.
3. **Alex has no surname** in the game, so "AR" can never be his initials (rule set in Chapter One).
4. **Distinguish confirmed from proposed.** Use the [status labels](STATUS_LABELS.md). Never silently promote an idea to
   canon.
5. **Jamie and Sam are people, not followers**: they never vanish, never get left behind, and have their own
   personalities ([Companion AI](../06_GAMEPLAY_SYSTEMS/COMPANION_AI.md)).

## 4. Horror (direction from the human developer, 2026-10-23)

*Last Light* is a **genuine horror game**, not only a suspenseful or sad mystery. Every chapter from here on should use:

- meaningful jumpscares (caused by something the player can perceive, not random);
- terrifying supernatural encounters;
- physical danger the player can see coming;
- psychological horror;
- atmospheric dread;
- effective chase sequences;
- emotional storytelling.

Avoid:

- long stretches of running without a visible threat;
- encounters that exist only as text in a caption ("Three people are walking into the camp!") rather than something
  the player perceives.

Details: [Horror design bible](../05_HORROR_DESIGN/HORROR_DESIGN_BIBLE.md).

## 5. Player respect (established in every chapter)

1. **Nothing turns the player's view during play** except an explicit, documented time fallback.
2. **Nothing waits forever.** Every beat has hints, then a plainer objective, then a friend leading, then (rarely) a fade.
3. **Evidence is never found for the player** (Chapter Five rule): only progressively plainer hints.
4. **Readable muted.** Every sound that matters also shows on Jamie and Sam (heads, lights, bodies) and in captions.
   No arrows, minimap or HUD markers.
5. **No game over so far.** Nothing has been able to hurt the player. (Whether to keep this is an open question for the
   human developer; see [Unanswered questions](../01_STORY_BIBLE/UNANSWERED_QUESTIONS.md).)

## 6. Technical

1. **Keep the light count constant within a chapter** (lights are attached at intensity 0 and switched by intensity) so
   no material recompiles mid-scene.
2. **No new runtime downloads, CDNs or external APIs.** Everything runs from `dist/`.
3. **Third-party assets need attribution** in `docs/THIRD_PARTY_ASSETS.md`, and the title's Credits must name the
   creature's author before any public release (noted in Chapter Four's handoff).
4. **Measure, don't guess**, and say how: SwiftShader numbers are not real-GPU numbers.

## 7. Testing and reporting

1. **An automated pass is not human approval.** Only the human developer can mark something ✅ Human-approved.
2. **Test proportionately.** Documentation needs link checks, not game runs. A focused fix needs its focused test plus
   the quick regression. Do not launch hours-long suites for small changes.
3. **Report unfinished work accurately**: what was not run, what failed, what was killed by memory limits.
4. **Do not claim publication** (a push, a hosted build) unless it was verified.

## 8. Keep the vault true

After any accepted change, update the vault the same day: see [Vault maintenance](VAULT_MAINTENANCE.md).
