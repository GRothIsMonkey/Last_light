# Last Light v0.1 — final polish

Based directly on Claude's `claude/loving-newton-1vlisx` at `02cbde1`. All original story beats, the three distinct departures, the route, final exploration area and ending text are preserved.

## Visuals

- Corrected invisible roof slopes, degenerate hip-roof triangles and the reversed lookout sidewalk. The sidewalk follows the grassy rise, and the cul-de-sac curb segments follow its circumference.
- Added roof, asphalt, siding and concrete surface variation; curtains, corner boards, gutters, downspouts, a few scooters and doorstep mats.
- Replaced the large polygonal tree crowns with airy leaf clusters. Kept the wind, shrubs, birds, sprinkler sweeps, minivan, porch lights, stars and fireflies.
- Reworked the warm-to-cool light progression, with irregular cloud bands, gentler haze, cooler dusk ambient light and two nearby streetlamps that illuminate passing bikes and pavement.
- Reduced the heavy brown screen overlay so the evening colors remain visible.

## Movement and stability

- Riders lean and turn their shoulders with the handlebars. Tested grip error decreased from up to 8.8 cm in the original rig to at most 1.7 cm, without stretching the arms.
- Added a small welcoming gesture from Jamie's mother. Corrected wrapped-angle steering during departures.
- Manual looking now overrides the automatic departure glance until R recenters the view.
- Corrected a Chromium pointer-lock/capture race, on-foot right-arrow turning, and late audio replies after pause/replay.
- Replay clears the mother's door sound state, ambient timers, wheels, lights, basketball child, ending clue and old audio sources. The ending freezes the world and clears the controls.
- M toggles sound while the mouse is captured.

## Audio

The original locally synthesized sound system remains. The pass removes the final call's feedback echo, softens its harmonic source, adds early bird calls, adjusts rolling/cricket levels, cleans up finished sources and resets old sounds on replay. The evening layers fade beneath the ending chord. A master compressor provides headroom protection.

Real OfflineAudioContext renders and signal checks cover 22 sound cases. They are not a perceptual listening review. The rendered clips and review page accompany the release so this last required gate can be completed without reconstructing the work.

## Ending detail (spoiler)

One faint additional set of chalk initials appears beside the old initials only during the final fade, after the call home. There is no camera cue, sound cue, second voice, figure, chase or lore text. It is cleared on replay and appears in both natural and idle endings.

## Rendering

Static geometry is batched by spatial cell and compatible material. Vertex colors preserve the existing house and foliage palette while distant cells can be culled. This reduces submitted geometry without stripping neighborhood detail. Real laptop/GPU frame rate is not claimed; the available browser uses SwiftShader.
