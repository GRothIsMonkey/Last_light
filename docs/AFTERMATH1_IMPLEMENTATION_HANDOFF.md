# Aftermath I — What Was Left: implementation handoff

Aftermath I is the chapter after Chapter Eight: Saturday 27 August 2011 at half past six in the morning, to an
afternoon in October when the protagonist's family drives out of Oak Hollow. It is built, playable from Chapter Eight's
end card to its own end card, and tested by input. **It has not been played by a person yet, and none of its sound has
been listened to.** Read `AFTERMATH1_TEST_REPORT.md` for what was checked and how, and
`AFTERMATH1_PLAYTEST_CHECKLIST.md` for what only a person can judge.

## 1. Where it is

| | |
|---|---|
| Branch | `claude/aftermath1-what-was-left` (new; nothing else was pushed to, reset or rebased) |
| Base | `91a446d98c257ae77cbebb2944e0ce7e2744f4d1`, the head of `claude/chapter8-major-reconstruction` (the verified Chapter Eight reconstruction) |
| `main` | untouched |
| Astra | `codex/astra-fullgame-art-rework` does not exist on the remote. Every `codex/astra-*` branch that does exist is already an ancestor of the base. **No Astra full-game art rework is in this build**; §9 lists what an art pass will meet. |
| Commits | `d770568` skeleton · `15443b1` Act I · `1d98746` Act II · `a4d2f69` Act III · `d9c7dc6` Act IV · `2cad970` fixes from captures and branch runs, package tool, docs · `a4d6403` last code change, final captures · then the report and handoff updates (no code) |

## 2. How to play it

- **Hosted (private artifact)**: __HOSTED__ — only its owner can open it until it is shared from the page's Share menu.
  Start a new game, or **DEV → Aftermath I → a scene → START SCENE**. It is this branch's `dist/` at `a4d6403`, with the
  one host-only change every earlier hosted build had (the host does not serve `.glb`, so the creature model comes as
  base64 text read by a host copy of `creature.js`). Files unchanged since the base were copied from Chapter Eight's
  hosted build, which carries the same bytes.
- **Offline**: `PLAYTEST_CHAPTER=9 node tools/package-playtest.mjs <folder>` makes one HTML file that runs from disk in
  desktop Chrome or Edge (the one delivered with this work: `Last-Light-Aftermath1-Playtest.zip`, built from `a4d6403`).
- **From the repository**: no build step. Serve the repository root over HTTP and open `dist/index.html`.
- **From Chapter Eight:** finish Chapter Eight (or DEV → Chapter Eight → its ending). The end card now has
  **Aftermath I →**. Chapter Eight's save (`lastlight.chapter8`) is read for what was carried out of that night.
- **DEV:** the DEV menu has an **Aftermath I** row: its start (from Chapter Eight's end card), every scene, two
  variants where Jamie's cap is already with his mother, and the end card. A DEV start always begins a scene the same way
  (it does not read your save).
- **Continue:** every scene is a checkpoint. Continue puts you back at the start of the last one you reached, with what
  you kept (your save), not a fresh start.
- Controls are the game's own: walk, mouse look, **F** (tap) and **hold F**, number keys for what you say, **S** to put
  a held thing down, **I** for what you carry, Esc to pause. One new kind of beat (look at a thing to take it: the oak,
  his pictures, the drawer) uses the existing look-prompt.

## 3. The chapter

The brief's 16 scenes are played as 21 sections (two scenes are split where they move to a different place or day).
Times are the in-game clock. Every section has an objective, at least one thing you do, and a transition that has been
played through by input.

| # | Section (DEV id) | When / where | What you do | What it keeps |
|---|---|---|---|---|
| 1 | `a1-arrive` | Aug 27, 6:30 AM, the school lot | ride in, get off, wheel your bike into the rack (hold F); Sam won't let go of his: take his handlebars (hold F) | |
| 1 | `a1-gym` | the gym as a shelter | stand with Sam in the doorway; a volunteer, FOUND across his flyer; people look at you and then past you at the doors; the board, the TV, water (optional); sit | |
| 2 | `a1-jamie-mom` | the gym | Jamie's mother asks where he is; what you can say (or look at Reyes); Reyes tells her, kneeling; **his cap: give it to her, or keep it safe for her** | `cap`, `capWhen` |
| 3 | `a1-alex-parents` | the gym | his father asks; Reyes takes them aside; his mother straightens Sam's collar; his father asks what he said | `told.alexDad1/2` |
| 4 | `a1-families` | the gym | Sam won't go to his father until he says something only he would know ("I left your fan on"); your mother | |
| 5 | `a1-quiet-room` | 2:30 PM, the nurse's room | wash your hands (hold F: the water goes grey, then clear); the cut; the paramedic; something to eat; the box fan; Sam and the shear pin and the chain; sit beside him or not; lie down | `told.samChain` |
| 6 | `a1-record` | Aug 28, Room 6 | Reyes reads what he saw; you lay out the plan, the camera, the notebook, the sketch **in your own order**; what you want written beside his | `camera: reyes`, `told.record` |
| 7 | `a1-names` | Aug 29, the county's list | a line with an age and a street and no name; you can't reach the word; the notebook; write JAMIE (hold F) | `wrote` |
| 8 | `a1-return` | **Sep 1**, Oak Hollow Drive behind the fence | Reyes's rules at the gate; walk with him (the paint on the doors: all zeros); **stop when he says stop** (a gas crew); Sam's house (RESTRICTED); as far as the barricade at the trench: **choose what to look at** (the oak, 1052, the Kesslers', the Hendersons') | |
| 9 | `a1-remained` | the same morning | the two bikes where the four of you left them; stand Jamie's up (hold F); **Alex's bell** (twice; Sam: "Do it again"); Sam's father with the fan and the Tour de Oak Hollow; walk Jamie's out (its tyre flat) while Sam walks Alex's; lift it into the truck | `bell`, `told.bell` |
| 10 | `a1-porch` | Sep 2, Jamie's porch | walk his bike up to his mother; **by the rail or in the middle of the walk** ("That's how you know I'm home"); Lily's drawing of Biscuit; "Was he scared?" (or go back down the steps); the cap again if you kept it | `told.bmx`, `cap` |
| 10 | `a1-driveway` | Sep 2, Alex's garage on Briarwood | give his father the bike: it goes back on its two hooks; the pictures he printed (Sunday at the oak is yours); his mother: **go up to his room or not**; in his room, a question you can answer or **leave the room** on | `print`, `camera: parents`, `told.alexRoom/alexMom` |
| 11 | `a1-memorial-jamie` | Sep 3, dusk, Jamie's lawn | candles; people telling each other about him (mostly funny), heard as you walk among them; his picture; **leave a note**; **stand with Sam at the curb**; his mother asks for something about him she doesn't know; **go home when you're ready** | `told.jamieNote`, `told.jamieMom3`, `told.samCurb` |
| 11 | `a1-memorial-alex` | Sep 6, the gym | sit or stand at the back; his father's few words; his pictures on both walls (12, two sets): **in one he is there after all** (his shadow); **tell his father** or don't; a card for the box; the two mothers; go outside when you're ready | `note`, `told.shadow` |
| 12 | `a1-sam` | Sep 17, dusk, your driveway | your chain is off; Sam rides over, kneels, puts it on the back cog; **turn the pedal backwards** (hold F); the curb; his gum ("Medical—"); his anger and your guilt (you can say it was your fault; he won't let you have it); the streetlights come on: rule four | `told.samWhy`, `told.samMad` |
| 13 | `a1-weeks` | Oct 1, on your bikes | ride up the street with Sam under turning leaves; Jamie's bike still where you left it; the fence shut at Summerfield; Reyes: the report, what he wrote, the copies | `told.reyesOct` |
| 13 | `a1-home` | Oct 3, the kitchen | sit down; read the township's letter; your mother's reasons; what you say | `told.move` |
| 14 | `a1-packing` | Oct 14, your room in boxes | the drawer; for each of the photo-booth strip, the Sunday print, his cap, the calendar, the Tour shirt: **into the box or keep it with you**; the window; your mother from the hall; tape the box (hold F) | `boxed`, `told.keptOut` |
| 15 | `a1-goodbye` | Oct 15, the curb | the truck; Sam checks your chain; **his notebook is yours** (RULE 6. WRITE BACK); rule five (say it or don't); a plan to call; hug him, punch his arm, or "See you, Sam"; he waves from the lamp post, and nobody comes round the corner after him; get in the car | `notebook: you`, `told.rule5/call/bye` |
| 16 | `a1-road-out` | the last of the light, your mother's car | first person, free look: **look back**; **look at what you kept** (the notebook; his cap or the print if you kept them out); look ahead when you can; the card | `told.lookedBack`, `told.lookedAt` |
| — | `aftermath1-end` | | **AFTERMATH I · WHAT WAS LEFT · October, 2011**; Start over / Back to the title; no next chapter | the final save |

Nobody comes back in this chapter, nothing comes up out of the ground, and nothing is resolved by a choice: every
choice changes what is said, what is kept or where a thing ends up, never what happened.

## 4. What is kept (`lastlight.aftermath1`)

Written at every checkpoint and, finally, at the end card:

```json
{"cap":"you|mom","capWhen":"shelter|porch|null","notebook":"you","camera":"parents","print":true,"wrote":true,
 "bell":true,"note":"chain|bell|look","boxed":["booth",...],"told":{...every answer, by scene...},"left":true,
 "section":"aftermath1-end","home":["YOU","SAM"],"lost":["JAMIE","ALEX"],"presence":"sealed",
 "you":"moved away, October 2011","sam":"Oak Hollow","at":<timestamp>}
```

Where the things are at the end: **Jamie's cap** with you (in the box or in your pocket) or with his mother (given at
the shelter or on her porch). **Sam's notebook** with you (he gave it to you at the curb). **Alex's camera** with his
parents (Reyes copied the card and gave it back). **The Sunday print** with you. **The Tour de Oak Hollow** with Sam.
**Alex's bike** on its hooks in his garage. **Jamie's BMX** at his porch, where you put it.

## 5. How it is built

All new code is in `dist/aftermath1*.js` (no build step, like the rest of the game):

| File | What it is |
|---|---|
| `aftermath1.js` | the director: sections, DEV/Continue jumps, the save, the task runner every scene is written on (scripts as generators), prompts (tap/hold/look), choices, poses, held things, grief (yours and Sam's), the sky by day, the cast it borrows from earlier chapters |
| `aftermath1-scenes.js` | Act I (the school) and the glue that joins the acts |
| `aftermath1-record.js` | Act II (the nurse's room, Room 6, the list) |
| `aftermath1-town.js` | Act III scenes 8–10 (the street, the bikes, Jamie's porch, Alex's garage and room); joins Acts III–IV |
| `aftermath1-memorial.js` | Act III scenes 11–12 (Jamie's lawn, Alex's pictures, the chain) |
| `aftermath1-leaving.js` | Act IV (October, the kitchen, your room, the curb, the road out, the end card) |
| `aftermath1-places.js` | the school (lot, gym in three states: shelter / thin / memorial, corridor, nurse's room, Room 6) |
| `aftermath1-street.js` | Oak Hollow Drive in September and October on top of Chapter Eight's own ruin (below) |
| `aftermath1-props.js` | everything printed or drawn (boards, lists, the county's list, the photographs, the letter, cards, placards, paint) |
| `aftermath1-acting.js` | grown-ups' faces laid over the existing heads (tears, reddened lids, mouth), and poses (sit, lie, hold, cup, clutch…) |

Places are not rebuilt where the game already has them:

- **The street** is Chapter Eight's own ruin and town (`chapter8-ruin.js` at its morning stage, `chapter8-town.js`'s
  `after()` state), settled: the fires out, the wires dead, the main shut and water standing in the trench. On top of it:
  September (a chain-link line below Summerfield with a gate; the crater fenced; a barricade at the trench; the
  searchers' paint and UNSAFE/RESTRICTED placards on every door from Summerfield up; plywood where the windows blew; an
  excavator, a bucket truck, a dumpster, what people carried out under tarps) and October (the line moved to Summerfield
  and shut; the crater filled and plated; the Kowalskis' lot cleared; the paint fading). The pole that snapped in front
  of **your** house (Chapter Eight's ruin puts it at 438.7 m on the Drive, on your side, by your drive) has been replaced by September; the new
  one's wood is still pale.
- **Your house** is Chapter Six's (`chapter6-home.js`): your room, the hall, the kitchen behind it.
- **Alex's garage** is the world's own: its two empty bike hooks are part of the shared world (`layout.js`: `garageBike:'empty'`). **Alex's room**
  is Chapter Three's interior.
- **The four bikes** are Chapter Seven's studio bikes, as Chapter Eight left them under the streetlight across from Sam's.

Shared files changed outside `aftermath1*` (all small, all default-off for the earlier chapters):
`game.js` (route into Aftermath I; a "hide the world" flag for the school), `chapter8.js` (the end card's next button;
the save records what was carried; the hand-over), `chapter8-town.js` (exports its fires so they can be put out),
`dev-chapters.js` + `index.html` (the DEV row), `audio.js` (a crowd murmur loop; a bicycle bell, cloth, theme, freewheel,
tape and box sounds), `rig.js` (a bike can be built without its chain loop, for the chain that comes off; default
unchanged).

## 6. Story decisions made here

- **Dates**: Aug 27 (Sat) shelter; Aug 28 record; Aug 29 the list; Sep 1 (Thu) the return; Sep 2 the families;
  Sep 3 Jamie's lawn; Sep 6 (Tue) Alex's memorial; Sep 17 Sam; Oct 1 the street; Oct 3 the letter; Oct 14 packing;
  Oct 15 the move.
- **The return is supervised**: Reyes escorts; Sam's father is there for belongings (his house is RESTRICTED, not
  UNSAFE). The kids don't walk through barricades.
- **The bikes**: Alex's and Jamie's were never moved from under the streetlight (Chapter Eight's own staging). You and
  Sam walk them out; they go home in Sam's father's truck. Alex's goes back on the garage hooks; Jamie's stays at his
  porch where you put it, and is still there in October.
- **Alex's bell** is an ordinary bike bell (a new sound, not Chapter Three's rusted one); his father already said in
  Act I that he rang it at every corner, twice. It rings only when someone presses it.
- **The memory beat** is the bell and the corner of Briarwood, the last time you heard it, in the narration: no voice,
  no figure.
- **Reyes's October update** keeps the public account and the witnesses side by side (aged storm lines and a gas main —
  true, and not all of it; the Hendersons remember differently on different days; a state team writes down what it
  can't name). No cover-up plot.
- **The move**: the township can't certify the ground under the Drive for 12–18 months; housing assistance ends
  Nov 30; a job where your aunt has room; your mother lying awake listening to the floor.
- **Jamie** is remembered through things he did (Biscuit, the gum, "That's how you know I'm home", the diagonal mowing,
  the bananas, the duck-voice pledge, "it smells weird" to Mr. Henderson). **Alex** through what he saw (his pictures;
  "He's not in any of them"; his shadow in one) and his room.
- **Sam** goes from shock (Aug 27) to explaining the shear pin (that afternoon) to anger at the newspaper and at Jamie,
  and refusing to let you take the blame (Sep 17), to the curb in October: tired, practical, still grieving.
- **Aftermath II and 2026** are not begun or hinted. The end card offers nothing after it.

## 7. Tests

`ONLY=aftermath1 node tests/verify.mjs` plays the chapter from Chapter Eight's end card to its own by input
(`FROM=`/`TO=` segments, `CAP=give-shelter|give-porch|keep`, `QUIETLY=1` for the silent/hesitant answers), then runs the
standalone checks (every DEV start's day, light and footing; Continue; the street put away; the end card and save).
`tests/aftermath1-shots.mjs` (with `DEFS=tests/aftermath1-shot-defs*.mjs`) captures scenes in Chromium. Results:
`AFTERMATH1_TEST_REPORT.md`.

## 8. Known limitations

- **No human has played it.** Pacing, whether a scene lands, and whether a choice feels like yours are not tested.
- **Audio is unheard.** The crying/breath cues are Chapter Eight's synthesized ones, used sparingly and quieter; they may
  sound wrong. Mute them (C.quietCry) if they do. All plot information is also in captions and objectives.
- **Acting is limited by the rig**: seated people sit with straight arms; hugs are an embrace pose, not a simulated hug;
  faces are an overlay (tears, lids, mouth) on the existing heads.
- **Interiors at night** (the kitchen at 6:20 PM) use Chapter Six's room materials, which were made for morning light.
- **The car** on the road out is the game's wagon model with a simple interior (dash, pillars, doors, wheel); it reads as
  a car from the passenger seat but is not detailed.
- **The oak** is 124 m from the barricade; from there it is a tree at the end of the street, not a landmark you can pick
  out at a glance. The look prompt and the narration name it.

## 9. For the art pass (Astra boundaries)

Nothing in this chapter replaces a finished model. If the full-game art rework lands later, these are the pieces it will
meet, all new in this chapter and all in `dist/aftermath1*`: the school (lot, gym in three states, corridor, nurse's
room, Room 6 — `aftermath1-places.js`); the street dressing (fences, placards, paint, plywood, machines, the new pole —
`aftermath1-street.js`); printed things (`aftermath1-props.js`); the grown-ups' face overlay (`aftermath1-acting.js`,
attached to the existing heads at runtime); the candles, easel, notes and card table on Jamie's lawn, the kitchen
chairs, boxes, drawer, moving truck and car interior (`aftermath1-memorial.js`, `aftermath1-leaving.js`); the hi-vis
vests and hard hats; the basket, fan and poster roll. The characters themselves are the existing cast (`people.js`,
`cast.js`, Chapter Seven's studio bikes); a reworked cast would be picked up wherever those are used.
