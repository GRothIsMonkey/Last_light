# Status labels (read this once)

Every fact in this vault carries, or sits under a heading that carries, one of five **story labels**. Every bug or
request carries one of five **issue statuses**. Use exactly these words so that a search for one finds all of them.

## Story labels

| Label | Meaning | Example |
|---|---|---|
| ✅ **CONFIRMED CANON** | Happens in an **accepted** chapter release (Chapters 0–4). Future work must not contradict it without a human decision. | Alex turns onto Briarwood Lane, rings his bell twice and is never seen again by his friends (Prologue). |
| 🟡 **IMPLEMENTED BUT UNAPPROVED** | Exists in a development build but the human developer has not approved it as final. Treat it as the working baseline, but expect it may change. | Chapter Five's Camp Whippoorwill, Jamie's double, the escape. |
| 💡 **PROPOSED** | An idea for the future. Not in the game. Not canon. | Anything under [Future chapters](../03_CHAPTERS/FUTURE_CHAPTERS/FUTURE_CHAPTERS_INDEX.md). |
| ❓ **UNKNOWN** | A mystery the game deliberately leaves open, or a fact this vault could not verify. Never fill an UNKNOWN with a guess. | What the Presence is. Who "AR" is. |
| ⛔ **REJECTED** | Was built or proposed and then explicitly abandoned. Do not bring it back without the human developer asking. | Chapter Three's detention-basin night (replaced by the storm drain). |

### Which chapters count as "accepted"

| Chapter | Accepted release (frozen) | Label for its story |
|---|---|---|
| Prologue (Chapter Zero) | `codex/astra-last-light-final-polish` @ `9520b4f` | ✅ CONFIRMED CANON |
| Chapter One | `codex/astra-chapter1-final-polish` @ `9c4b576` | ✅ CONFIRMED CANON |
| Chapter Two | `codex/astra-chapter2-final-polish` @ `68cc543` | ✅ CONFIRMED CANON |
| Chapter Three | `codex/astra-chapter3-final-polish` @ `5be6814` | ✅ CONFIRMED CANON |
| Chapter Four | story accepted at `claude/chapter4-horror-revision` @ `f0120ba`; art and repairs through `codex/astra-chapter4-repair-pass2` @ `c964777` | ✅ CONFIRMED CANON (see note) |
| Chapter Five | `claude/chapter5-gameplay-story-repair` @ `d4de9ab` (gameplay/story baseline) | 🟡 IMPLEMENTED BUT UNAPPROVED |

**Note on Chapter Four.** The Chapter Four art polish (`docs/ASTRA_CHAPTER4_FINAL_POLISH.md`) calls the horror
revision "accepted". Chapter Five's documents call `c964777` "the accepted Chapter Four commit". The repository holds no
separate written record of the human approving repair pass 2 itself: **Not yet verified**. Chapter Four's story did
not change in either repair pass.

**Note on Chapter Five.** The human developer named `d4de9ab` the finished gameplay repair and the source for this
vault, and Astra builds on it. Its own documents say *"It is not an approval: the chapter waits on human review"*,
and the human has since reported that the escape is too long (see
[Chapter Five initial feedback](../08_PLAYTESTING_AND_ISSUES/CHAPTER5_INITIAL_FEEDBACK.md)). So Chapter Five is the
**working baseline**, not confirmed canon. A future chapter may build on it, but must flag every dependency on a
Chapter Five detail.

## Issue statuses

| Status | Meaning |
|---|---|
| 🔴 **Open** | Known problem, nobody has fixed it. |
| 🔧 **Fixed in code** | A change exists and automated tests pass. **This is not approval.** |
| ⏳ **Awaiting playtest** | Fixed in code and ready; the human developer has not played it yet. |
| ✅ **Human-approved** | The human developer played it and accepted it. Only the human can grant this. |
| 💤 **Deferred** | Deliberately left for later (usually the art pass, audio, or real-GPU testing). |

> **Never confuse an automated test pass with human approval.** "736/736 simulation checks" means the code does what
> the tests say. It does not mean the chapter is frightening, fun, or finished.

## Short forms used in tables

- SHAs are shortened to 7 characters; full SHAs are in [Git branches](../09_DEVELOPMENT_HISTORY/GIT_BRANCHES.md).
- "Ch0" = Prologue, "Ch1" = Chapter One, and so on.
- "sim" = the Node simulation suite (`tests/verify.mjs`), "browser" = the Chromium/SwiftShader suites.
