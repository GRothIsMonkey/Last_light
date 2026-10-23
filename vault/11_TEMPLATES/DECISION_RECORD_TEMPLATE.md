# Decision record template

For most decisions, add **one row** at the top of the table in [Decision log](../00_START_HERE/DECISION_LOG.md):

```markdown
| YYYY-MM-DD | What was decided, in one or two sentences. | ✅ / ⛔ REJECTED / 💡 | Human developer (where: playtest note, chat, brief) |
```

For a big decision, create a note `00_START_HERE/DECISION_YYYY-MM-DD_TOPIC.md` with:

## Decision: (short title)

| | |
|---|---|
| Date | YYYY-MM-DD |
| Decided by | The human developer |
| Status | ✅ Adopted / ⛔ Rejected |
| Affects | Chapters, characters, systems |

### Context

What prompted it (a playtest, a contradiction, a proposal).

### Options considered

1. …
2. …

### Decision

What was chosen, in the decider's words if possible.

### Consequences

- Canon changes (update [Established canon](../01_STORY_BIBLE/ESTABLISHED_CANON.md))
- Code changes needed (branch, owner)
- Vault notes to update

### Rejected alternatives

Keep them listed as ⛔ so they are not re-proposed.
