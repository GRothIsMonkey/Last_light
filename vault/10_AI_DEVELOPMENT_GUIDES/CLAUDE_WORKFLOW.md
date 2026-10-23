# Claude workflow

Claude's role so far: the **structural, gameplay and story passes** for every chapter (prologue structure, Chapters
One–Five), their revisions after human playtests, the DEV selector, the test suites, and this vault. Claude's work is
"deliberately plain wherever art direction belongs to Astra".

## The pattern every Claude pass has followed (keep it)

1. **Branch from the exact accepted commit** (verify it is the branch head; record branch + full SHA at the top of the
   handoff). New branch per pass; linear commits; no rebase/squash/merge/force-push; nothing to `main`.
2. **Read the previous handoffs and the playtest feedback** first. For a revision, list each complaint and find its **root
   cause in the code** before changing anything (Chapter Five repair, Stage A, is the model).
3. **Build the chapter as one director** (`dist/chapterN.js`) taking over phases by prefix, with all transient state in one
   object, a full `reset()`, checkpoints, QA jumps (each sets every earlier flag), DEV scenes, and fallbacks for every beat.
4. **Make shared-code changes switchable**, on only in the new chapter.
5. **Test**: the natural playthrough by inputs from the previous end card; every jump/checkpoint/Continue/Start over;
   idle fallbacks; companion stress; DEV equivalence and switching; Chromium walkthrough and DEV scenes; Chapters 0–4
   regression. Report counts honestly; segment browser runs if memory-limited and say so.
6. **Write the handoff** in `docs/` (what the player experiences, systems, files, checkpoints, QA, known limitations,
   what Astra should polish) and update `docs/TEST_REPORT.md` and `docs/RELEASE_NOTES.md`.
7. **Push to the assigned branch only**; report the final SHA.
8. **Hand over to Astra** with explicit contracts (what the art pass must keep).

## Claude-specific cautions (from history)

- Scripted walkthroughs passing ≠ scary or fun. Expect a human playtest to find what tests cannot.
- Do not narrate threats in captions that the player cannot perceive.
- Keep the escape tight; don't pad after the climax.
- Re-read your own dialogue against earlier chapters (the "come find him" error came from a rewrite).
- Prefer reading the code to trusting old comments.
- Review rounds were valuable in the Chapter Five repair (they found five real defects), but avoid unbounded repair
  cycles: fix confirmed defects, verify, stop.

## For documentation-only tasks (like this vault)

Work only in `vault/` (or the requested folder) on a `docs/*` branch; never touch `dist/`, `tests/`, `assets/`, existing
`docs/`, release branches or Astra's branch; validate links; don't run the game.
