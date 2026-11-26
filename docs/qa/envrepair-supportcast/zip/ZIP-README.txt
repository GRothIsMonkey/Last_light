LAST LIGHT — Prologue environment repairs and supporting cast (DEV benchmark, awaiting review)
=============================================================================================

Branch:  claude/prologue-environment-repair-supporting-cast   (not merged into main)
Commit:  6083368d60006a786a5f0bbaffff70b88cf2749a
Nothing in this package is approved. Every decision is open in docs/art/ART-APPROVAL-REGISTER.md (A-78 to A-86);
A-22 (Jamie's mother's canonical identity) stays open.

What is in this ZIP
-------------------
Last-Light-Playtest.html        The whole game, server-free, with every benchmark's Blender models embedded
                                (PLAYTEST_MENU=1 PLAYTEST_MODELS=1). Open it in a desktop browser (Chrome, Edge or Firefox).
review-gallery/index.html       The review gallery: every before/after pair (drag to compare), the Blender renders, the
                                motion clips, the in-game recordings, the audit, the tests and the cost, with what each
                                one is. Works offline; the fonts fall back to system fonts without a connection.
ENVREPAIR_SUPPORTCAST_REPORT.md The full report (what was built, evidence, tests, performance, limitations, decisions).
ENVREPAIR_SUPPORTCAST_HANDOFF.md  For Astra: files, hooks, flags and what friends1b must keep.
JAMIE-MOTHER-IDENTITY.md        The proposed identity for Jamie's mother (a proposal; A-22 open).
START-HERE.txt                  The packager's general instructions for the game (menus, keys, DEV scene selector).
Last-Light-Pipeline-Lab.html, Last-Light-Bike-Lab.html   The earlier passes' DEV labs, as the packager builds them.
manifest.json, THIRD_PARTY_ASSETS.md, THREE-LICENSE.txt   The package's sources (commit, file hashes) and licences.

How to review in the game
-------------------------
Add the flags to the address after the file name:

  Last-Light-Playtest.html?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast

  '   (apostrophe)  the environment repairs  <-> as the six benchmarks left them (same frame)
  ;   (semicolon)   the authored supporting cast <-> the original procedural people (same frame)

Each benchmark shows a small DEV label in the corner. Ride the Prologue as usual:
  - the hoop kid is in his driveway near the start of Oak Hollow;
  - the yards with trampolines, swing sets, toys and chain link are along the whole street;
  - Briarwood creek shows down Briarwood Lane at the junction;
  - Jamie's mother comes out when the group reaches Jamie's house.

Without ?envrepair and ?supportcast the game is unchanged. Both are Prologue only; the later chapters are untouched.

What to keep in mind
--------------------
- Jamie in the game is the existing procedural Jamie, a placeholder; Astra's Phase 1B Jamie is not in this build.
- In-game evidence was rendered with software WebGL (no GPU); a GPU will look the same but run much faster.
- Images and films marked BLENDER RENDER are offline renders of the editable .blend files, not the game.
