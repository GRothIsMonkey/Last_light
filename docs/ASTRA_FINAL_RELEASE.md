# Last Light — final Astra polish release

This completes the scoped final polish pass on the existing 5–6 minute game. It is a continuation of the combined game and Claude structural work, with no route rewrite, new chapter or replacement history.

## Provenance

- Starting branch: `claude/epic-planck-cme9eq`.
- Exact starting commit: `59c647220e80d12da0d205b1562d483cc5bdb7f3`.
- Release branch: `codex/astra-last-light-final-polish`.
- Publication target: the same tested commit on the release branch and `main`, by fast-forward with all prior history retained.
- Baseline validation before implementation: 92 simulation checks and 84 browser checks passed.
- Final validation and content hashes: [TEST_REPORT.md](TEST_REPORT.md) and [qa/manifest.json](qa/manifest.json).

The release commit is the commit containing this document and its manifest. Runtime and test hashes identify the verified content without embedding a circular self-referencing commit ID.

## What changed

| Area | Final behavior and changes |
|---|---|
| Houses | Finer lap siding and roof shingle variation, shutter louvers, deeper window casings, beveled steps, thresholds, doorstep mats and garden edging. Key foyers gain floorboards, skirting, shoes and papers; Sam's garage gains concrete surface detail. Existing closed shells, windows, inward doors and interiors are retained. |
| Player body | Smoother limb surfaces, fingers, shoe laces, garment seams and shoulder joins. Existing visible body, shadow-only head, steering IK, dismount and remount are retained. |
| Characters | Distinct original silhouettes, faces, colors, builds, bikes and cadences remain. Hair gains layered locks and tonal variation; friends blink on separate timings. Jamie supports his left foot, Sam his right, Alex both when stopping in formation. |
| Bikes | Rounder frame tubes, more differentiated metal, brake levers and connected cable housings, plus an actual animated bell lever. Existing spokes, cranks, pedal contact, steering and bike styles remain. |
| Bell | The contextual riding prompt is `Space: Ring bell`. The left hand reaches, the lever presses and the sound strikes around 0.12 seconds, then the hand returns; the right hand stays on its grip. Friend glances and answer bells remain. |
| Sidewalks | Both sides are usable almost to their rendered outer edges (2.5 cm boundary inset). The curb and narrow planting strip can be crossed, so riders no longer get trapped between driveway cuts. Yards and obstacle footprints remain blocked. |
| Curb contact | Front and rear wheels sample the actual surface separately, including heading. Both ascent and descent work on either side. Height/pitch settle smoothly; a speed-scaled, damped camera impulse is capped at 8 mm. Driveway ramps remain smooth. |
| Curb sound | Quiet tire thump and brief mechanical rattle; downward contacts are softer. Low-speed impacts are weaker, and no sustained shake is added. |
| Speed and steering | Existing acceleration, fatigue, Shift surge, independent group pacing and head look are preserved. Boundary handling and wheel contact change; top speed and story pace do not. |
| Bike sound | A subdued speed-scaled chain layer while pedaling; the freewheel is gated to coasting on the bike. Existing rolling, wind, surface and neighborhood layers remain. |
| Signs | Batching now keys on the actual texture identity instead of merely whether a texture exists, preventing speed-limit artwork from replacing street-name text. Single-sided faces sit ahead of posts; double-sided blades mount above the post with supports in the gaps. Junction assemblies also keep clear of utility poles. All 13 printed faces are rendered in QA. |
| Power lines | All 114 pole-to-pole spans remain. House service drops fall from 112 to 41, with important homes retained; attachments and sag are checked. |
| Vegetation | Lookout grass uses bent blade clusters instead of cones. Leaf clusters vary in scale/tilt and trunks are rounder. Original tree placement, wind, distant neighborhood and rolling land remain. |
| Cars and props | Paint/glass response, mirrors, handles, grille, trim and wheel hubs/spokes receive detail. Fence caps are beveled within the geometry budget. Existing driveway clearance and yard clutter remain. |
| Light | Modest warmer sunset fill and cooler dusk haze refinements retain the existing sky progression, porch lights, streetlights, fireflies and stars. |
| Title and UI | Refined title typography, evening gradient, spacing, buttons, pause/settings/end-card presentation, contextual action pills and a 1280 × 720 title layout. Full control instructions stay on the title. |
| Nostalgia | Ordinary wear, doorstep and interior details reinforce the existing 2011 neighborhood and gradual departures. No extra quest or exposition is added. |

## Memory text and ending (spoilers)

Two reflection lines change to:

- “We knew which driveways had the smoothest pavement.”
- “We left our bikes wherever we stopped.”

Their once-only timing, separation from dialogue and settings toggle remain. The distant call caption becomes **“Someone is calling you home.”** After the call, the bicycle interaction reads **“Go home.”**

The existing JSA chalk, faint AR initials, oak carving and old bicycle remain. A simple pavement drawing starts with four children. After the call and the unseen appearance of the old bike, a fifth chalk child can appear only while the player is more than three meters away and facing away from the drawing. Small AR marks on the old bike connect the clues. There is no visible apparition, camera jump, chase or explanation.

The exact final cliffhanger, added to the existing end card, is:

> I thought I remembered everyone.

Returning home and staying until the memory fades still reach the ending. Replay clears the extra figure, other bike, chalk reveal, bell pose, impacts and the existing story/world state.

## Verification and limits

The final build passes **102 simulation checks and 115 Chromium checks**, with **130 captured frames** and no reported JavaScript, console or shader errors. Rendered review uses contact sheets for all frames plus full-size inspection of representative views and the reported problem areas. This is automated browser playthrough and visual inspection, not an independent human playtest.

The full world has **1,621,465 triangles / 893 merged meshes**, below the existing 1.7 million / 900 limits. Normal uninterrupted riding remains about 240 seconds; the full interaction test is 4.91 minutes, and the idle route is approximately 5.8 minutes. See the test report for measurements and method.

The 23 browser-generated audio cases pass finite, nonzero and headroom checks. Updated MP3s and the [review page](qa/audio-review.html) are provided. **Perceptual listening remains outstanding**; the synthesized call is not recorded voice acting. No real-GPU FPS, physical touch-device performance or cross-browser certification is claimed from SwiftShader.

The art remains stylized procedural geometry: close-up joints, hair, hands and distant houses remain visibly simplified. Fine original chalk and the small AR bicycle mark depend on viewing angle and resolution. Side streets are scenic beyond their rideable mouths; deep lawns remain outside the bicycle boundary. These are limits of this release, not claims of photorealism or unrestricted exploration.

This is the complete scoped polish release. No continuation chapter is included.
