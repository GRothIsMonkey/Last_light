# Last Light · Four-friend Prologue

Jamie, Sam and Alex now ride their own reconstructed bicycles in the opt-in Prologue. In the offline ZIP, extract all files and open **START-HERE.html** in Edge or Chrome. Choose New Game. W pedals, Shift increases effort, S brakes, A/D steers, Space rings the bell and F interacts. The file works without a local server.

[Watch the review gallery](REVIEW.html) · [Four-friend lineup](four-friends.png) · [Runtime screenshots](on-the-road.jpg)

## Source and movement

The integration branch starts at environment commit `716fc6bfacae1166f45826905475b7cb1d2409e0`. All six environment benchmark systems come from that tree. The 2011 protagonist runtime and GLB come from `66e3f4bd3988b40cc890117f85e432cb85e0d8b6`. Jamie’s published design reference is `42340fe223a51cdaf655b523db42e85b38513da6`, and Sam’s is `a4db27544112a54d969401b710a7b5fde7cf8bc7`. The three actual sculpt inputs come from the recovered local Alex refinement tree at `93f246186e94225a5d6353ad5aca45eec72edd4e`. It includes the later Jamie and Sam corrections and Alex’s chestnut fibre groom. The recovery contains those original packed masters separately.

Each 68-joint rig uses its own bind positions fitted from 7,093 corresponding body vertices. Each export has one atlas, one skin, three distance meshes and 14 native actions. The fitted hand rotations were calibrated on the visible skinned fingers. Eyelids, gaze, jaw, cheeks and brows use individual joint controls. Speech follows the duration of the existing speaker cue. The approved cast supplies body movement and independent cadence.

The game calls the opt-in visual layer after updating the original friend controllers. It reads their crank, steering, standing, gaze, dismount, person-parent and visibility state. It masks the old drawables on all layers and restores them on title and later-chapter transitions. The protagonist remains the first-person player. The camera exposes his existing photographic head only in the separate four-rider observer recording.

### Runtime assets

| Friend | Master input SHA-256 | GLB MiB | Triangles, close / medium / far | Animation KiB |
|---|---|---:|---|---:|
| Jamie | `e97b3401127a734a24a8754de233208674e2b40d9ba1c1f581070af30d4357b8` | 5.61 | 87,084 / 23,849 / 4,098 | 204.8 |
| Sam | `898e9e4438fe6a9233bf25eda815d9c203775abd1be1d8f481e0a794041d9dfa` | 5.86 | 87,925 / 25,606 / 4,506 | 210.9 |
| Alex | `c554358f78962c8f45a1dd260d2b7aed2119618bd42c20a68e3aeadc4a25f9c2` | 5.32 | 79,577 / 25,734 / 4,482 | 203.2 |

An RGBA8 decode of each 1024 × 1024 atlas costs about 5.33 MiB with mipmaps. Three distance meshes share one skeleton and material per character. The runtime updates close characters on every simulation step, medium characters at up to 30 Hz and distant characters at up to 15 Hz. Hidden people skip pose evaluation.

## Riding, walking and contact

The surface test deforms the high-detail runtime mesh across 36 crank phases, three steering angles and two riding conditions for each child. It measures the palm and five digits separately against a 19 mm grip envelope, the sole above a pedal tread footprint, and posterior garment vertices near a padded saddle envelope. These are sampled contact estimates. A shoe or grip contact can move between adjacent triangles. Negative values indicate penetration.

| Friend | Shoe range, mm | Most finger penetration, mm | Saddle nearest sample, mm | Median planted-vertex travel per 1/48 gait cycle, walk / run, mm |
|---|---:|---:|---:|---:|
| Jamie | -0.3 to 0.6 | -3.6 | -4.1 to 5.3 | 1.0 / 3.1 |
| Sam | -0.0 to 1.2 | -2.3 | -2.2 to 3.2 | 1.0 / 2.9 |
| Alex | -0.0 to 1.2 | -2.8 | -1.6 to 2.8 | 1.0 / 3.0 |

The wrist helper deliberately sits 6 mm inward along the grip axis. Check the grip closeups and the separate per-finger readings for skin contact. Sleeve weights follow the fitted garment topology. The exported hair uses a reduced silhouette and strand ribbons, so individual curls and cloth detail soften at gameplay distance. The extreme views still show small contact overlaps. No continuous all-triangle cloth or bicycle collision test was performed.

The first-person film spans 4,090 consecutive frames at 15 fps (4:32.7). Existing controls drove the route without position jumps. The films use the game framebuffer with the active original subtitle text. Alex completes his ordinary goodbye around the bend. Jamie drops his bicycle and runs to the house. Sam parks in the garage, waves and goes inside. The separate motion reels play the baked GLB actions and label each movement. The 30 static character studies and same-scale lineup were rendered in Blender. The matched lighting sheet uses the engine’s photograph controls, including a shaded setup and a local streetlight source.

## Performance

Physical NVIDIA GeForce RTX 4060 Ti through Edge/D3D11, 800 × 560. Each case starts from the same controls and camera, simulates 120 seconds and produces 1,800 rendered frames. The first 30 frames are excluded from the percentiles. A pixel readback waits for GPU completion. Frame times include two 30 Hz simulation steps per captured frame. Initial ready times include browser navigation and asset setup. Geometry and texture counters track renderer allocations. Heap totals are browser estimates.

| Build | Ready s | Median / p95 frame ms | Median update ms | Median triangles / draw calls | Geometries start → end | Textures start → end |
|---|---:|---:|---:|---:|---:|---:|
| Original | 16.4 | 6.8 / 10.4 | 0.8 | 893,312 / 446 | 357 → 950 | 10 → 20 |
| Six environment systems | 14.5 | 7.8 / 12.6 | 0.8 | 1,047,129 / 668 | 707 → 1519 | 101 → 111 |
| Environment + player | 14.3 | 8.8 / 12.8 | 1.1 | 1,116,185 / 668 | 702 → 1513 | 103 → 113 |
| Environment + four boys | 14.5 | 9.3 / 13.3 | 1.3 | 1,302,274 / 611 | 651 → 1453 | 109 → 119 |

The combined run ended near 612.1 m. The three-friend visual update averaged 0.140 ms per simulation update. Integrated graphics, mobile devices, sustained thermal behavior and full-resolution displays are unmeasured.

## Verification

The full game regression completed 840 passing checks with the existing Chapter Two DEV scene `2/alex-bike` difference recorded. The strict run stopped on that same mismatch after 838 passes. A focused comparison reproduced the same three values on the earlier source. The original neighborhood details suite passed 31 checks covering default behavior, details and the combined six-system environment. The dedicated suite compares captions, paths and departure order across the complete route with the switches off and on.

Jamie and Sam moved 26 mm and 17 mm respectively on their 1/30-second bike-to-ground handoff. The dedicated suite also checked title, pause, resume, restart, chapter jumping, visible LODs, original shadow meshes and offline playback. The HTML loaded 38 embedded model/texture entries with zero outbound network requests and all three friends active.

[Native verification](evidence/native.json) · [Character tests and surface measurements](evidence/friends-qa.json) · [Full ride trace](evidence/continuous-ride.json) · [Performance measurements](evidence/performance.json) · [Regression evidence](evidence/regression.json) · [GLB container inspection](evidence/export-info.json)

## Media and ground checks

The full ride and its road-side departure excerpts carry the original game's stereo audio, scheduled on the same simulation clock as the recorded frames. The three studio movement reels and the separate four-person observer shot are silent. All nine MP4 video tracks and the five gameplay audio tracks were verified. [Media inspection](evidence/media.json)

On the stopped-rider ground fixtures the largest sole offset occurred across the driveway cut, from 8.3 mm below the surface to 4.8 mm above it. The road and sidewalk-edge measurements stayed within 1.9 mm. Cross-slopes and very close views of the fingers remain useful visual approval points. [Terrain measurements](evidence/terrain.json)

## Attribution

The exact published parent branches, recovered Blender input blobs and per-character hashes are listed in the [source record](PROVENANCE.md).

All four characters adapt the anatomy of “Child” by gelmi.com.br under Creative Commons Attribution 4.0 International. Last Light supplied the character-specific design, clothing, grooming, weights, animation and game conversion. [Original model](https://skfb.ly/oLutp) · [License](https://creativecommons.org/licenses/by/4.0/)
