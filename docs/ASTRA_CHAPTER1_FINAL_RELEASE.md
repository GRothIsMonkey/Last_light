# Last Light — Astra Chapter One final polish

## Provenance and scope

- Repository: `GRothIsMonkey/Last_light`.
- Exact input: `claude/relaxed-heisenberg-gv002b` at `ed471c04b34bc083da10bdc876f20419246a08e6`.
- Preserved release ancestor: `codex/astra-last-light-final-polish` at `9520b4f1d72759b27ac823671bdefae19ce27e55`.
- Output branch: `codex/astra-chapter1-final-polish`.
- Interrupted cruiser, adult and animation work was preserved in `0a68454`, then continued in the same workspace and branch. No replacement history, source-branch switch, main merge or Chapter Two content.
- `dist/` is both the editable source and the playable payload. No build, CDN or external asset service is required.

## Human playtest navigation improvements

The officer conversation now leads to **Find Jamie.** Recruiting Jamie changes it to **Find Sam.** Jamie remains required first. Tapping Sam's window early gives the thought **I should get Jamie first.** and leaves recruitment available for the return.

Jamie's two-story house has a permanent red porch chair, a planter and a stepping-stone path down the bedroom side. These are present during the prologue departure and at night. The porch light illuminates the entry, and warm light from the working bedroom window reaches the side yard. The chimney is clear of that window's approach. The reminder is short: **Back on Oak Hollow. The red chair on his porch.**

Sam's low ranch, blue garage trim, large garage door and old hoop make a different silhouette and destination. The coach lamps, side path and bedroom light reinforce it at night. After Jamie joins, the reminder reads **Farther toward the oak. His garage with the old hoop.** The large door remains closed during recruitment; Sam uses its side door.

The window prompts appear within about 2.5 metres while facing the correct side. Path reservations keep yard scatter out of the narrow approaches. No arrows, beams, minimap, wall outlines, route trail or waypoint system were added. The street layout and house locations are retained.

QA includes two complete input-driven prologue-to-ending runs. From Alex's house, the runs ride back along Briarwood and Oak Hollow, dismount, walk around the parked bike and follow each property's side path to the window. No QA jump or player-coordinate placement is used inside these runs. The route controller uses authored road/property coordinates; this is a scripted navigation regression with visual review of the clues, not a claim that a new human player completed a blind playtest. A first-time human retest remains useful.

Road and property evidence: [Jamie from the road](qa/astra-jamie-night-road.jpg), [Jamie's side yard](qa/astra-jamie-night-side-yard.jpg), [Sam from the road](qa/astra-sam-night-road.jpg), [Sam's window](qa/astra-sam-night-window.jpg).

## Walking, body and flashlight

- Normal walking is 2.05 m/s, sprinting 3.65 m/s, and crouching 0.95 m/s. Acceleration and braking are eased; foot cadence follows actual distance moved.
- Shift uses a small, temporary stamina bar. Approximately 13 seconds of sustained sprint drains it; rest restores it, with an exhaustion recovery threshold to prevent rapid toggling.
- Space jumps on foot, with gravity, a modest approximately half-metre apex and a landing recovery interval. Bike Space still rings the bell. Jumping does not bypass horizontal collision or fences.
- Hold C or Ctrl to crouch. Eye height, torso, hands and legs move together. Scripted clue inspection uses a separate low pose aligned to the camera.
- The existing player rig remains visible on foot. Its head and neck remain excluded from the first-person camera. Reset and remount restore the bike parent and pose.
- Jamie offers a spare flashlight during the existing creek dialogue. T toggles the player's own warm spotlight independently of Jamie's light. The light is attached to the right hand, follows the view smoothly and reduces its intensity when aimed at nearby ground. Continue restores ownership at the creek; Start over removes it.
- Pause lists the new controls. Keyboard/mouse is the validated control path; the added actions do not have dedicated touch buttons.

## Companions and conversation staging

Jamie and Sam alternate among staggered, alongside and briefly ahead positions on straight, open stretches. They ease back toward the ridden trail at bends or obstructions. Wheel-corridor checks, local obstacle clearance and separation checks cover the player, the other companion, parked cars and adults. Walking slots vary similarly; short local detours and distance-based gait reduce pushing and foot sliding. Catch-up remains continuous and speed-bounded, without the old offscreen position reset.

The officer approaches the player's actual location using a local walkable path, slows and faces the player before the first question. Alex's dad joins after a short delay, looks between the player and officer, and must be nearby and stopped before **He never came home.** The same written conversation is preserved. The staging adapts to several sidewalk/driveway positions; walking well away cancels it so it can restart on return.

Jamie's climb has staged hand support, staggered legs, sill clearance and a grounded landing. His bike lift keeps the hands aimed at the moving bicycle. Sam's scene includes the two visible pebble arcs, sash response, side-door opening and closing, and a bike exit while the large garage door stays shut.

## Art, night and interface

The patrol sedan has wheel arches, a crowned hood and trunk, separate cabin glass, seats and driver silhouette, mirrors, handles, grille, lamp housings, wipers, wheel hardware and municipal livery. Front-wheel steering, axle contact, body pitch under braking, turn roll and brake lamps accompany the existing pass and turn. Near/far detail groups retain the silhouette while dropping small cabin and body details at distance.

Adults use distinct adult face and torso geometry, collars, pockets, folds and age/hair details. Officers have badge, belt and radio details; Alex's mother has a cordless handset. Blinks, small speaking movements, hand gestures, weight shifts and head attention remain restrained. A merged distant silhouette removes individual finger and face calls beyond the close scene.

Emergency lights use two shared point lights with limited reach and physical falloff, alternating red/blue double flashes, plus a shared headlight/search spotlight. Night shadows remain disabled; daytime shadows use the established merged proxies. Two existing local streetlight sources are reused near the friends' porch/garage and bedroom windows. There is no new light allocated per house. Sidewalk joints now use non-emissive lit geometry rather than unlit lines.

The creek has surface grain, wet silt, small stones and leaves, bank roots, algae, debris and a detailed reflector bed. The original channel, culvert, railing, grate, loose fence gap, vegetation and walkable limits remain. The reflector has a chipped outline, molded facets, black tape, bracket, bolt and scratches. Its small glint responds to real flashlight alignment instead of camera proximity. The close beam is softened to preserve the red plastic and black tape.

LAST LIGHT and the end card use restrained spacing and hierarchy. Objectives have short, quiet memory subtext. **Show dialogue captions** replaces the misleading friends-only setting and hides spoken captions while retaining navigation text. The final bell gently raises and turns the player's view toward the woods as the friends react, before the existing fade and Chapter One end card.

## Audio validation

The existing procedural audio and unresolved two-strike distant bicycle bell are preserved. The player flashlight uses the existing quiet switch sound; landing uses the footstep system; Sam's side door uses the existing door sound. Browser OfflineAudioContext checks cover finite samples, non-silence and peak headroom, including a dedicated distant final-bell render through the spatial audio path.

[Audio review page](qa/audio-review.html) contains refreshed clips and a listening reel. These are signal checks and exported recordings. **No human listening or perceptual mix approval is claimed.** A human should listen for siren harshness/Doppler, near/far balance, speaker-like radio and TV, footsteps, transitions, and the final bell's two distinct strikes at a comfortable level.

## Validation and performance

Final measured results are recorded below after the release suite completes. Machine-readable evidence and content hashes are in [qa/manifest.json](qa/manifest.json), [qa/simulation-report.json](qa/simulation-report.json) and [qa/browser-report.json](qa/browser-report.json).

Validated game/test commit: `ec67022c9dfd99ede3d4de206b751e9fce93509a`. The publication commit adds documentation and QA assets; the manifest's runtime hashes bind both full test reports to the exact shipped payload.

| Gate | Final result |
|---|---:|
| Full simulation/geometry checks | **156 passed** |
| Browser/WebGL/Web Audio checks | **184 passed** |
| Rendered gameplay/inspection captures | **219** |
| Audio signal cases | **35 passed** |
| JavaScript / console / shader errors | **0** |
| Static world triangles (excluding duplicate shadow proxies) | **1,716,635** |
| Merged/static world meshes | **935** |
| Scene triangle instances, including invisible dynamic objects/LODs | 2,006,303 |
| Unique geometry attribute/index buffers in the scene | 237.9 MiB |
| Renderer | 153.0.8010.0 / SwiftShader |
| Real-GPU FPS | Not measured |

Representative rendered frames, default medium quality:

| Capture | Triangles | Draw calls | Active lights |
|---|---:|---:|---:|
| 03-group-ride | 632,375 | 364 | 2 |
| c1-03-police-passing | 605,470 | 278 | 5 |
| c1-06-briarwood-police-scene | 414,715 | 301 | 4 |
| c1-09-jamie-window | 656,321 | 293 | 4 |
| astra-jamie-night-road | 769,980 | 450 | 4 |
| astra-sam-night-road | 342,096 | 189 | 4 |
| astra-sam-garage-side-exit | 901,283 | 549 | 4 |
| c1-17-creek-flashlight | 395,267 | 326 | 7 |
| astra-reflector-detail | 455,793 | 147 | 6 |
| astra-bell-look-toward-trees | 587,873 | 262 | 6 |

Across all captures: **71,673–912,204 triangles**, **57–549 draw calls**. Counts include inspection cameras, unusual angles, shadow passes and story close-ups; they are not a uniform gameplay benchmark. The Sam side-door view back along the street is a 549-call outlier, above the complex-scene guidance. Several broad neighborhood views also exceed the ordinary 300-call target. These remain a hardware-profiling limitation, not a claim of measured smooth performance. Static totals remain well inside the revised normal targets.

Night captures have **0 shadow-casting lights**; daytime uses one. Peak renderer allocations across captures: 1305 geometry objects, 15 textures, 73 programs. Buffer inventory is CPU attribute/index storage, including shadow proxies and alternate geometry; it is not measured GPU VRAM.

Evidence: [visual review gallery](qa/visual-review.html), 10 contact sheets, [audio review](qa/audio-review.html), and the two machine-readable test reports. Runtime SHA-256 hashes match between both tests and `dist/`.


The geometry policy is the updated brief: approximately 4 million world triangles and 1,500 static meshes are normal targets; 6 million/2,000 require profiling. Ordinary frames aim at 600–700k triangles and 300 calls; complex scenes may approach 1 million/450. These are guidance targets, not the superseded 1.7 million/900 caps. Geometry is concentrated on inspectable objects and merged by material; distant adult/car detail and static frustum culling remain active.

The original prologue, Alex leaving first, both other departures, AR/fifth chalk child, old bicycle, quiet ride home, cruiser route, written dialogue, oak disagreement, clue and unresolved ending remain covered. All QA jumps, Continue checkpoints, lingering, replay and reset are checked. Full contact sheets and selected full-resolution frames are reviewed, including adult hands/faces, windows, vehicle, light exposure, body, creek and reflector.

## Remaining limits

- Chromium software WebGL (SwiftShader) is the available renderer. No real-GPU FPS, hardware smoothness or low-end laptop performance claim is made. Heavy-view draw-call outliers are reported rather than hidden.
- Audio still requires human listening. Radio/TV/calls are procedural impressions, not recorded voice acting.
- Natural navigation runs are automated. Their environmental cues were visually inspected; fresh human usability testing is not substituted by their pass count.
- Touch-specific new controls and other browser engines are not validated. The modest jump is an embodiment action, not a platforming system.
- Companion avoidance is local, not a global pathfinding redesign. Tight turns can make a friend pause and fall back before rejoining.

No content continues beyond the Chapter One ending.
