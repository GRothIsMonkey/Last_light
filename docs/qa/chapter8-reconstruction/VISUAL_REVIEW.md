# Chapter Eight reconstruction: before/after visual review

Every image here is a real capture from the game, made in headless Chromium on SwiftShader (software GL) at 1280×720 by
the scripts named below, and looked at one by one. Software rendering is slower and a little flatter than a GPU, but
the scene content, staging, faces and lighting are the game's own. Nothing was painted over or composited.

- **Before**: `before/*.jpg`, the rejected draft at `c496d53`, by `tests/chapter8-baseline.mjs` (reviewed in
  `BASELINE_AUDIT.md`).
- **After (same fifteen moments)**: `after/*.jpg`, by `tests/chapter8-after.mjs` (same harness, same camera rules, the
  moments re-found in the rebuilt scenes).
- **After (the new beats, more angles)**: `after-street/*.jpg` (`tests/chapter8-street-defs.mjs`) and
  `after-finale/*.jpg` (`tests/chapter8-finale-defs.mjs`), both run by `tests/chapter8-dev-shots.mjs`.

Captions in the frames are the game's subtitles at that moment. A "Get on bike" prompt in some street frames is an
artefact of the capture placing the camera on foot during the ride.

## 1. The fifteen baseline moments

See §3: each row compares `before/<name>.jpg` with `after/<name>.jpg` and says whether the draft's problem is gone.

## 2. The new beats, looked at

### The street falls (Act V, first half)

| Frame | What it shows | Verdict |
|---|---|---|
| `after-street/surface-drive.jpg` | From the cul-de-sac: the red deck over the whole town, smoke rising, lamps still on, the friends with you. | The sky reads as wrong and threatening. The friends' faces are flat here: captured before the face fix (see §4). |
| `after-street/trench-go.jpg` | The road heaving into a hump, slabs lifting, the crack running toward you, dust. | Reads as the road failing. |
| `after-street/trench-lean.jpg` | The trench open: broken slabs, the pole down across it with its wires, steam from the burst main, the house beyond. | Destruction reads as large and physical. (The lean itself happens a few seconds after this frame.) |
| `after-street/death-sam.jpg` | Two of its limbs going up out of the ground beyond the houses into the red cloud, claws at their tips; the Kesslers' burning with its front open; the house at 1052 leaning. | Scale works. The limbs were salmon-coloured in this capture (before the skyline material fix); re-captured in `sky-*.jpg`. |
| `after-street/hend-down.jpg` | Jamie on his back on the grass at the edge of the hole, his cap beside him, Sam standing over him. | The death is now on screen and unmistakable. |
| `after-street/death-reyes.jpg` | Reyes on his knees over Jamie, doing CPR. | Reads as an adult trying to save a child. |
| `after-street/hend-door.jpg`, `hend-drag.jpg` | First capture of the side door and the drag. | Showed two bugs, both fixed: Jamie was not in the doorway (he could not path into the garage; now placed there) and the "beam" was a huge plank in the air (now a door header with the frame and siding). Re-captured. |

### The end (Act V, second half)

| Frame | What it shows | Verdict |
|---|---|---|
| `after-finale/hatch-pinned.jpg` | Alex face down across the hatch's rim, the steel lid (no counterweight) across his back, his arms out on the grass; Sam and Reyes kneeling. | The injury's cause is visible: it is the lid, because of the chain. |
| `after-finale/hatch-out.jpg` | Alex out on the grass after you and Sam lift the lid and pull him out. | Readable. |
| `after-finale/oak-two.jpg` | Sam sitting against the oak beside Alex, holding his hand; the AR carving; dawn. | The two of them read as together. |
| `after-finale/oak-sit.jpg` | Your view sitting in the grass in front of them: Sam with tear tracks and red eyes; Alex heavy-lidded and pale; your own legs in front of you. | Grief visible on faces (first time in this chapter). |
| `after-finale/oak-sam.jpg` | Sam sobbing with his hand over his face; Alex crying. | The acting is there; this camera angle is poor (over Sam's shoulder). |
| `after-finale/oak-after.jpg` | Alex slumped, Sam beside him: "Alex?" | The moment of his death reads. |
| `after-finale/walk-trench.jpg` | On foot at dawn past the trench: broken slabs along the road, steam, the collapsed porch, the leaning house; a red-brown sky settling. | Destruction persists into the morning. |
| `after-finale/ride-sam.jpg` | Sam on his bike beside you, crying (tear tracks), grey dawn. | Captured before the head-down riding posture was added. |
| `after-finale/ride-summerfield.jpg` | The collapsed Summerfield intersection in a grey, hazy dawn, a police car, blown-out windows. | Earlier capture of this frame was a clear blue morning: fixed (smoky overcast dawn). |
| `after-finale/ride-back.jpg` | Looking back up the street: dark smoke columns over the roofs, the Kesslers' shell still burning. | The look back shows what happened. |

## 3. Before → after, the fifteen moments

| Shot | Before (the draft) | After (this build) | Problem gone? |
|---|---|---|---|
| `sam-out` | A dark figure in a black room; the containment consequence only a caption. | Sam swaying in front of you, his face close, grabbing your arm ("like you might not be real either"); the objective is the flood door. Still very dark: the wing is unlit and the capture had the flashlight off. | Partly. The moment exists and is physical; the frame is too dark to read without the flashlight. |
| `jamie-out` | An empty olive corridor; nobody in frame. | The retrieval wing: Sam crouched by the grille, the hunter far down the corridor under a lamp, bolts to throw, Jamie telling you to go. | Yes. |
| `alex-door` | A striped door in a plain box room. | The room it made for Alex (panelling, the poster), your light on the closet door, "Alex. It's us. It's really—". | Partly: the room is still plain at this angle; the change is in what happens there. |
| `alex-out` | Identical to `alex-door`. | The room coming apart round Alex: the paper coming off the walls in sheets, something pale grown on the concrete behind, the lamp going out. | Yes. |
| `reunion` | Four boys standing stiffly round a table. | Sam and Alex in chairs, Jamie on the floor against the lockers, the lamp, silence. | Yes (poses differ; faces still small at this distance). |
| `breach` | A smooth dark cylinder with two tube limbs ("plumbing"). | Plated, segmented limbs with long fingers coming through the chamber from several sides; the lamps failing. | Yes for the creature; the plug is still the same drum. |
| `escape` | A dark doorway; the event carried by a caption. | Same staging (the jammed bulkhead), unchanged by the reconstruction. | No (not rebuilt). |
| `street` | "The road isn't there" over an intact, peaceful street. | The road broken open along the storm line (slabs, the crack, steam), the collapsed porch, the house that leans, under the red deck. | Yes. |
| `jamie-death` | A black pit; Jamie and the hunter tiny or off-frame. | Sam (anguish), Alex (shock) and Mr. Henderson in front; behind them, the hunter at the garage's side door with Jamie lifted off the ground. The friends faced the camera in this capture; they now turn to watch. | Mostly. The act is on screen; it is small in this framing (a player running at it sees it closer). |
| `jamie-after` | A small shape on a far lawn; no one near. | Reyes on his knees doing CPR over Jamie at the edge of the hole. | Yes. |
| `gates` | Dark bridge, a handwheel, flat water. | Same mechanics; Alex shouting about the water. | No (not rebuilt). |
| `plug` | A plain cylinder, rounded blobs under the catwalk. | The plug drum; plated, clawed limbs reaching up at the catwalk; Sam beside you. | Partly (the creature yes; the structure is the draft's). |
| `hatch` | The camera inside a ladder shaft; Alex's injury a caption ("a whole slab"). | Alex face down across the hatch's rim, the lid across his back, his arms out on the grass; Sam and Reyes kneeling. | Yes. |
| `alex-death` | Daylight; Alex upright and unhurt-looking, neutral face. | Your view sitting in front of them at dawn: Sam with tear tracks and red eyes holding his hand, Alex heavy-lidded and pale against the oak. | Yes. |
| `ride` | Sam on a bike on a pristine street. | Sam on his bike beside you, crying, a grey dawn; the street behind shows smoke and the burned houses (`after-finale/ride-back.jpg`). | Yes. |

The three rows marked "No" are the parts of the chapter this reconstruction did not rebuild (the escape, the gates; the
plug's structure). They are listed as limitations in `docs/CHAPTER8_RECONSTRUCTION_HANDOFF.md`.

## 3b. The creatures and the skyline (after the fixes)

| Frame | What it shows |
|---|---|
| `after-street/made-grin.jpg` | One of the made things up close: pale, too thin, too long in the arm, a wide black smile with teeth and dark eye sockets; the thing's body on the skyline behind it. Reads as uncanny; the stand-in model's jointed limbs read a little like a mannequin. |
| `after-street/made-three.jpg` | Two made things crouched and the second hunter, together on the cul-de-sac. |
| `after-street/sky-hend.jpg` | From the Hendersons': the thing's body on the skyline, a dark hill of folds rimmed red, filling the end of the street behind the houses, smoke going up; the friends and Reyes walking. |
| `after-street/sky-cul.jpg`, `sky-sams.jpg`, `sky-south.jpg` | The same sky from the cul-de-sac, from Sam's and from the south end. |

## 4. Problems found by looking, and what was done

1. **The friends' faces were off in Chapter Eight.** The draft's reset switched off the shared character presentation
   (faces) and nothing turned it back on. Every expression, tear and red eye in the reconstruction was invisible until
   this was found by probing a face that "should" have been crying (`cry` weight 0). Fixed; the oak frames show it.
2. **Alex invisible at the oak and in the well** (enlisted but never put on his feet). Fixed.
3. **Sam standing at the oak** (the grief slump re-applied a standing pose over the scene's sitting one). Fixed.
4. **Your own bike parked in shot** in the field. Fixed.
5. **The skyline creature read as a pale grey boulder, its limbs as glowing salmon worms.** The Presence's rim-light term
   had its sign inverted (every surface facing the camera got the full rim glow; under the court too). Fixed, and the
   skyline instance has its own dark material lit red from underneath.
6. **The ride under a clear blue sky.** Now a low, smoky dawn with the red going out of it.
7. **Jamie not in the side doorway; a crane-like plank in the air.** Fixed (placed; a real header).
8. **Sam and Alex faced the camera while Jamie was being dragged.** They now stand at the end of the hole turned to it.
