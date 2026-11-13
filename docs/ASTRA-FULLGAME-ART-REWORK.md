# Last Light — full-game Astra art rework

This is a playable art-review candidate built on the completed Prologue–Chapter Eight game. It is a substantial procedural art and acting revision, with the heaviest work in the cast, the two creature designs, and Chapter Eight. It is not a photorealistic character release or a completed human visual acceptance test.

## Source and preservation

- Base: `claude/chapter8-major-reconstruction`, `91a446d98c257ae77cbebb2944e0ce7e2744f4d1` (the exact base is also recorded by Git ancestry).
- Release branch: `codex/astra-fullgame-art-rework`.
- GitHub milestone 1: `00a1263e7aeab7f9292248f090ae7553a28059a3` — cast, hunters and Presence.
- GitHub milestone 2: `ea8a719cf58cbf924ac899bf0a1bb1f87b5d37c5` — environments, grief and continuity.
- GitHub milestone 3: `75b305048e00f29a08889329faad2ad17b0389cf` — creature sight lines, death staging and review tools.
- GitHub milestone 4: `fa13071502ec11553b7cbe498acf17af1683213e` — final CPR contact, seated embrace, grief contact regressions and package verification.
- The portable build's `manifest.json` identifies the final release commit and hashes every embedded runtime source file.

The connected GitHub app published the milestones because direct Git push lacked credentials. Each published milestone's entire Git tree was checked against its corresponding local checkpoint. The original local checkpoints remain on a recovery branch. The completed Claude ancestry is retained; main is unchanged.

All three rescues, the four-friend reunion, containment failure, the breach into Oak Hollow, Jamie's permanent death, Alex's permanent death, Sam and the protagonist surviving, sealing the Presence, and the final bicycle ride remain. The accepted story, dialogue, lore, puzzles, encounter progression and chapter transitions are retained. Small actor-position changes support physical contact in the grief scenes. Chapter Seven's drag-mark interaction now reaches slightly farther from the path edge: one natural chase endpoint otherwise put its prompt just beyond the nearest walkable approach.

## Major visual changes

### The Presence

The second supplied reference drives the new silhouette: an enormous arched organism on eight angular load-bearing limbs, with a long forward neck and a deep, tapered vertical opening. It has no humanoid face or boss-like upper body. A ridged dorsal shell, secondary tendons and a narrow abdomen replace the previous mass of overlapping lobes. Six continuous articulated appendages preserve the existing breach and catastrophe actions.

The skyline version is enlarged and oriented toward the street approach, so the opening and long neck read above the houses. Its scale, the retained street impacts, and the red-orange catastrophe sky are intended to work together. The custom sky shader still needs inspection in a WebGL playtest.

### Hunters

The first reference drives the gaunt retrieval predator: a narrow abdomen, raised ribs, vertebrae, shoulder blades, elongated forelimbs, long articulated fingers and hooked talons. The head has recessed orbital cavities, nasal openings, a hinged jaw, irregular tooth rows and a dark throat. Locomotion uses a much lower, forward-loaded stance; existing alert, stalking, running, grabbing and hit states remain.

The new anatomy initially moved a sight ray into the stair wall. A separate perception origin now follows the original rig's detection motion, while visual head and grab sockets follow the rebuilt model. This preserves the accepted cover and detection behavior. Fixed teeth, ribs and finger details are batched by articulated part to avoid a separate draw for every small piece.

### The four boys

Jamie, Sam, Alex and the protagonist share rebuilt anatomical construction with their established individual proportions, colors and styling. The head is a continuous surface with cheeks, sockets, nose, nostrils, jaw and ears. Hair follows the skull with individual layered locks; Jamie's cap has a curved brim, seams and a separate uncapped head for his final scene. Shirts have shaped shoulders, collars, seams, hems and folds. Arms and legs taper; hands include individual fingers, knuckles and nails.

The shared rig carries these changes through earlier chapters, riding, walking and first-person hands. Existing bike controls, limb lengths and movement systems are retained. The cast is still visibly stylized and procedural; small joints and some clothing transitions remain apparent.

### Faces and emotional acting

Curved brows, an animated mouth, gaze direction, eyelids, tear tracks, wet eyes and lower-eye redness strengthen the existing fear and grief states. Sobs include irregular shoulder and head tremors. Negative emotions no longer retain the resting smile. Closed lids cover the eye sockets at death; dead characters stop crying, blinking and breathing. Resetting or starting an earlier chapter clears the grief state.

Chapter Eight has closer shoulder and embrace targets, a grounded lying pose for Jamie, actual chest contact for Reyes's CPR, a folded coat over Jamie, a dropped head and still body for Alex, and a closer seated embrace at the oak. The final ride retains tears and the lowered-head grief posture even when entered directly through DEV. A runtime regression checks contacts over a full CPR cycle and checks the death, embrace and final-ride states.

### Environments and atmosphere

The containment works gains wall and ceiling pipe runs, clamps, sagging cables, drain channels, grates, junction boxes, mineral streaks, chipped surfaces and chamber buttress collars. These additions are visual and do not create new navigation blockers. Shared concrete, plaster, metal, bark and asphalt treatments add mineral runoff, form-board marks, pits, wear and fissures across the game.

Old Mill Court, storm drains, Pine Ridge, Oak Hollow and the final route benefit primarily from those shared materials and the rebuilt cast. Most of their existing architectural geometry and destruction choreography remain. This pass does not replace every house interior, tree, prop or adult NPC with a bespoke new asset.

## Verification and visual review

See `docs/qa/astra-fullgame-art/verification.json` in the repository, or `geometry-review/verification.json` in the portable ZIP, for the recorded results and scope. Simulation checks run the real game logic, input handling, geometry and animation against a mocked renderer; they do not prove a frame was rendered by WebGL.

| Check | Result | Scope |
| --- | --- | --- |
| Runtime syntax | 129 modules passed | Every shipped JavaScript module |
| Shared art regression | 55 passed | Models, expressions, resets, sockets and finite geometry |
| Grief contacts | 65 passed | CPR cycle, oak embrace, death state and final ride |
| Chapter Seven | 94 passed | Full route from Chapter Six's end card, plus regressions |
| Chapter Eight | 35 passed | Full route from Chapter Seven's end card, plus regressions |
| Earlier chapters/shared replay suite | 328 checks recorded, no recorded failures; incomplete | Natural Prologue–Chapter Six route completed; the later replay sweep was interrupted |

The Chapter Seven full run initially stopped at the drag-mark prompt and caused eight later checks to fail. A diagnostic replay found a walkable approach 1.7025 m from its 1.7 m interaction radius. The marks can now be shown from 2.2 m; the final full run passes all 94 checks without bypassing the interaction or changing its outcome. Historical failing and passing logs are included. A separate earlier base run recorded 460 checks before interruption; these overlap the 328-check run and are not additive. No complete 818-check base-suite result is claimed for this revision.

The portable ZIP's `package-verification.json` records its exact-embedding and source-hash checks against the final published commit.

The preview browser reported that WebGL was unavailable. Consequently, no successful final in-game browser render or browser performance test is claimed for this pass. The separate geometry review exports the actual scene meshes and poses and renders them with Mesa/ModernGL. It was used to inspect the Presence silhouette and direction, hunter anatomy, faces, bunker, Chapter Seven stair encounter, reunion, Jamie's body and CPR contact, the coat, oak embrace and Sam on the final ride.

The included gallery contains 19 labeled images. They use approximate lighting and deliberately omit game textures, alpha-cut foliage, custom material and sky shaders, shadows and post-processing. Some use a closer review camera. They are not screenshots of the running game and are not evidence that the final lighting or animation playback is correct. Earlier and later model views are labeled separately; changed cameras and lighting are disclosed.

## Remaining limitations

1. A WebGL-enabled desktop playtest is still required for final lighting, shaders, textures, transparency, camera framing, animation playback, frame rate and GPU memory. In particular, check the red sky, the breach, the hunter's hands and head at close range, the oak, and the two-person ride.
2. Procedural models remain stylized. The hunter is substantially more skeletal and anatomical, but does not reproduce the reference's photographic skin quality. The boys are not scanned or sculpted high-end human characters. Hair tips, shoulder joins, hands and cloth intersections can still look artificial.
3. Adults, many environmental props and much of the earlier architecture retain their existing art. Street destruction uses the completed reconstruction's existing breakage and debris, with the new Presence and shared surfacing. There is no new destruction simulation.
4. Contact staging is improved, but there is no cloth simulation or full-body collision solver. Some incidental intersections can remain during pose transitions and from unusual viewpoints.
5. No audio-enabled human walkthrough was completed. Existing caption dialogue and synthesized sound remain; this pass adds no voice acting or new sound library.
6. Emotional effectiveness needs player review. Automated expression and state checks cannot establish that a death feels convincing or sad.

## Playing the build

Extract the playtest ZIP and open `Last-Light-Full-Game-Art-Rework.html` in desktop Chrome or Edge with WebGL available. No terminal or local server is needed. Start from the title or use **DEV → Chapter Eight → scene → START SCENE**. Earlier chapters remain available in the same menu.

Prioritize the construction gallery, each rescue, the reunion, truth reveal, breach, surface catastrophe, Hendersons, Jamie, oak, and final ride. Also revisit Chapter Seven's hunter and Mrs. Lange, a storm-drain scene, and Pine Ridge. `START-HERE.txt` lists controls; the included geometry review explains what its images can and cannot establish.
