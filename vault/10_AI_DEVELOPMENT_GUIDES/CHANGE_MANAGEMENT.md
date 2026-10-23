# Change management

## Kinds of change and what each needs

| Change | Branch | Approval needed | Tests | Vault update |
|---|---|---|---|---|
| Documentation only | `docs/*` | None to write; human decides integration | Link check | Yes (it *is* the vault, or note the doc) |
| Focused bug fix in an unapproved chapter | That chapter's work branch (new branch if the old one is finished) | Human playtest to approve | Focused test + `QUICK=1` regression | Open issues → ⏳ |
| Fix touching shared code | New branch from the authoritative commit | Human playtest | Full regression incl. Chapters 0–4; switchable behavior | Note in Technical architecture if a new switch |
| Story change in an accepted chapter | New branch | **Explicit human decision first** | Full | Decision log, canon, chapter note |
| New chapter | New branch from the accepted base | Human go-ahead before starting; human approval at the end | Full chapter pass | New chapter note; everything |
| Art pass | Astra branch | Human acceptance | Astra's validation set | Release history, chapter note |
| Release to `main` | `main` | **Explicit human instruction** | — | Release history |

## Rules

1. **Small, root-cause fixes.** Fix the cause found in code; avoid rewriting systems that work.
2. **One concern per pass** where possible; label what changed in commit messages.
3. **No unbounded review loops.** Review → confirm defects → fix → verify the fixes → stop. Report what remains.
4. **Never cross agents' branches.**
5. **Version everything that matters with full SHAs** in handoffs.
6. **Record decisions** in the [Decision log](../00_START_HERE/DECISION_LOG.md) at the moment they are made.
7. **Keep rejected ideas visible** (⛔) so they are not reintroduced.

## When a human gives feedback

1. Write it down verbatim ([playtest template](../11_TEMPLATES/PLAYTEST_NOTE_TEMPLATE.md)).
2. Turn each complaint into an issue with a status.
3. Find root causes in code before proposing fixes.
4. Fix, test, and hand back as ⏳ Awaiting playtest — never as "done".
