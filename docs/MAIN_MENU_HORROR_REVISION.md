# Last Light — the title screen's horror revision

The first redesign (`claude/main-menu-complete-redesign`, head `32aa067`) had a live 3D title: the end of Oak Hollow
Drive at dusk, with a slow camera and rare small wrongnesses. It was handsome and calm. It did not frighten anyone,
and most of its wrongness depended on things you had to wait for: a far figure, a lamp flickering, a bell.

This revision replaces that picture with **title art**. It is one composition made for the title, and it is wrong
from the first frame. The menus, settings, saves, chapter starts, DEV tools, packaging and the game itself are as they
were. The first redesign's live title is kept, both as the fallback and as a DEV switch for comparison.

> **What was and was not verified.** Everything below was checked in Chromium with software rendering (SwiftShader)
> and by the headless suite. **Nobody has looked at it on a real GPU or display, and nobody has listened to the sound.**
> The sound was measured by program: levels, peaks and the silences. Whether it is disturbing is a judgement no
> measurement makes. See §8.

## 1. Where it is

| | |
|---|---|
| Branch | `claude/main-menu-horror-art-revision`. It starts from the first redesign's head `32aa067`, which is unchanged on its own branch. `main` is untouched. Nothing was merged. The Aftermath II, coda and final-credits branches were not touched. |
| Play from the repository | `python3 -m http.server 8000 --directory dist`, then open it in Chrome or Edge |
| Offline package | `PLAYTEST_MENU=1 node tools/package-playtest.mjs <folder>` writes `Last-Light-Playtest.html`. The title art is embedded. |
| Compare with the first redesign | Open the DEV tab and choose **Live 3D title (first redesign)**. The choice is remembered and can be switched back. |

## 2. What the player sees

**The first frame.** You are under the old oak, looking back down the street at the last of the light. The trunk and
the canopy are an enormous silhouette on the left; the tire swing hangs still; the kids' bikes lie in the dark grass;
the houses have their windows lit. The sky is a faded rose and lavender evening, the earth's shadow rising cold over
the roofs.

Over the far end of the street, something sits in the clouds that should not be there. It is a vast, irregular
absence in the cloud deck:
- It is darker than anything on the ground.
- Its edge is a ragged cut, with a thin broken seam of pale light.
- The clouds around it are drawn out into long streams that bend toward it, losing their light as they go.
- Its underside hangs toward the houses in slow tendrils.
- Faint darker shafts fan down from it onto the street.

It is not a portal, not a planet, not a face, and not the Presence. It is simply a place where the evening is missing.
It is visible at once, without waiting for anything.

The picture is imperfect, and the interface over it is sharp. The background has:
- fine grain;
- a little softness;
- halation where the sky spills over the black silhouettes and where the warm windows and lamps bleed into the dark;
- a slight colour bleed at hard edges, like an old tape's chroma;
- a vignette, haze and a slow mist along the street;
- a breath of gate weave.

The text, menu, settings and DEV panel are drawn by the page over the canvas and are never filtered.

**The wordmark.** LAST / LIGHT is set in capitals on two lines, widely spaced, with LIGHT indented under LAST. It is
slightly worn: a noise mask erodes the letters a little. The light on it is uneven: it falls off across the words, as
if lit from the left. Behind each word is a faint double, a warm one just below and a cold one just above, like a tape
that has been played too often. It is not bloody, glitchy or neon. It reads cleanly when still. When it moves, it only
ever loses a letter slowly and gets it back (§4).

**Press any key** is kept: the letterbox bars, the title reveal of about four seconds, then the prompt. There is no
long intro.

**While the game loads**, the boot curtain already shows a small, darkened still of the title art in the mood the
title will open in. That still is inline in `index.html`, so it appears before any module has loaded. The game
remembers the mood under `lastlight.titleMood`.

## 3. How the picture is made (technique and provenance)

It is a **hybrid**: a plate rendered from the game's own geometry, repainted offline, and composited live with a
procedural sky and analog treatment. It is **not an in-game screenshot**, and nothing presents it as one. No external
image, photograph, stock texture or generated image was used. No image-generation tool was available or used.

1. **Staging and capture** (`tools/title-art/capture.mjs`, specs `tools/title-art/shot-<mood>.json`).
   - The game runs in Chromium through its `?qa` hook. The title scene's bikes are staged by hand: four in summer,
     three in search, two in after with Sam's bent. A camera that the game never uses is placed under the oak, at the
     cul-de-sac end of Oak Hollow Drive, looking back east down the street. Fog is off, and time is frozen.
   - Four passes are rendered at 3840×2160:
     - beauty;
     - key: the sky swapped for a flat green material, which gives the sky mask;
     - depth: log depth through an override material;
     - ghost: the beauty again with one bike not drawn (`colorWrite=false`) while it still casts its shadow.
2. **Repaint** (`tools/title-art/compose.py`, numpy and Pillow).
   - The key gives the foreground alpha. Fireflies and dust over the sky are removed, and leaf and wire edges are
     decontaminated of the rendered sky.
   - The plate is regraded for the title rather than the game:
     - colder shadows and a contrast curve;
     - the far street pushed into silhouette;
     - the ground falling into shadow toward the menu;
     - the warm windows and lamps kept at full value as small pockets of light;
     - large slow mottling, so no surface reads as clean CG.
   - It writes, per mood:
     - a 1920×1080 plate;
     - a 960×540 auxiliary map: alpha, depth, the warm lights' glow, and blurred alpha for halation;
     - the ghost bike's region as a small patch.
   - These are WebP data URIs in `dist/title-art-assets.js`, about 860 KB, which the offline package embeds like any
     module.
3. **Live composite** (`dist/title-art.js`, about 17 KB).
   - One full-screen shader drawn with the game's own renderer while the title is up. The 3D world is not rendered
     behind it, so the title costs less GPU than the first redesign's.
   - The sky is entirely procedural:
     - the earth-shadow band and the rose belt;
     - a lit, broken cloud deck;
     - the absence with its inflowing streams, seam and dark shafts;
     - in the after mood, a low crimson along its lower edge.
   - Then the plate is composited, with depth haze and mist, softness, chroma bleed, halation, the warm glow,
     saturation, vignette, exposure breathing, grain and weave.
   - Pointer parallax is weighted by depth and is very small. A very slow push-in is the only camera move.
4. **The boot still** (`tools/title-art/boot-preview.py`) reduces three captured frames of the composite to about
   9 KB, 5 KB and 3 KB WebPs and inlines them in `index.html`.

All source passes come from this repository's own scene. The "Smily horror monster" model (CC BY 4.0) is not in any
pass, because the title scene never shows it. No new third-party asset was added, so `THIRD_PARTY_ASSETS.md` is
unchanged.

Rebuilding the art (it needs Chromium and Python with numpy and Pillow):

```bash
node tools/title-art/capture.mjs /tmp/ta tools/title-art/shot-summer.json
```

```bash
node tools/title-art/capture.mjs /tmp/ta tools/title-art/shot-search.json
```

```bash
node tools/title-art/capture.mjs /tmp/ta tools/title-art/shot-after.json
```

```bash
python3 tools/title-art/compose.py /tmp/ta /tmp/plates dist/title-art-assets.js
```

## 4. Horror without waiting: what happens over time

The picture is frightening when still. Over time, a few things happen to it the way they happen to a damaged memory.
Each is slow, story-connected and unexplained. None is a jumpscare, a flash or a loud sound.

| Event | First, then every | What happens | The title | The sound |
|---|---|---|---|---|
| **A bike is gone** (summer and search) | 14–22 s, then 70–110 s | A band of the picture slips for under a second, and one bike is no longer there. Its shadow is still on the grass. In summer it is the fourth bike, by the trunk; in search it is Sam's. It comes back 7–13 s later, after another slip. | The T of LAST fades to nothing; its ghost stays. | The drone and the pad sag in pitch, as if the tape slowed, and there is a breath of air. |
| **Darkness passes through the clouds** | 30–45 s, then 55–90 s | A slow dark front moves out of the absence across the sky, over 14 s. | — | Something very low passes from one side to the other. |
| **A house comes apart** | 44–64 s (20 s in after), then 80–130 s | The largest house at the far end of the street dissolves into the haze for about 9 s, and the sky shows through where it was. | The H of LIGHT fades with it, and comes back with it. | A dry, granular hiss, like a recording being worn through. |
| **A bell twice, then silence** | 52–77 s, then 85–140 s | A bicycle bell rings far off; the second ring comes late and a little flat. Then the evening stops: wind, cicadas, notes and drone drop to a whisper for about 4.5 s. The lamps and windows dim, then return. | The whole wordmark dims a little during the silence. | All of it, under every bus. It returns slowly. |

These events come from a seeded schedule in `title-art.js`. Every one can be triggered for review:
`lastLight.titleArt.trigger('absence' | 'erase' | 'dark' | 'bell' | 'slip')` under `?qa`.

## 5. Moods (the same place, less of the evening left)

The moods follow `progress.js` exactly as before: summer through Chapter Three, search from Chapter Four, and after once
Chapter Eight is finished.

| Mood | Bikes | Sky | The absence | Warmth |
|---|---|---|---|---|
| summer | four | rose and lavender dusk, a bright belt, lit cloud undersides | already vast | windows and lamps warm |
| search | three (the dog's search; no one is named) | colder and later, a blue-violet evening | larger, the shafts stronger, a trace of crimson | lamps fewer and weaker |
| after | two, one lying bent | almost no colour left: grey-mauve | largest, with a low crimson seam | almost none |

Nothing in any mood shows a later scene:
- no Jamie's or Alex's death;
- no full Presence;
- no 2026 and no Aftermath II adults;
- no Chapter Eight skyline.

The absence is never explained.

*A fix to the first redesign's live title.* Its after mood used a sky "apoc" value of 0.3. Above 0.25, `game.js` widens
the camera's far plane for Chapter Eight's skyline. That let distant Chapter Eight geometry appear as a black dome over
the street: a spoiler risk. The value is now 0.24 (`title-scene.js`), and the title never shows it.

## 6. Settings

Every setting is kept, with one addition.

| Setting | Key | Default | Effect on the title art |
|---|---|---|---|
| **Memory effect** (new, Display) | `memoryEffect` | Standard | Off, Subtle or Standard: the strength of the analog treatment (grain, softness, chroma bleed, halation strength, weave, vignette depth). Off still shows the art, clean. |
| Reduce motion | `reduceMotion` | off | The picture holds completely still: no push-in, weave, drift, parallax, cloud movement or slips. Events that change the picture still happen, but slowly and without the slip. |
| Reduce flashing | `reduceFlashing` | off | The art has no strobes or flashes at all. The fastest change is a 0.8 s slip, and that is suppressed under reduce motion. |
| Film grain | `grain` | on | Now marked "In play.": the gameplay grain overlay. The title art's grain follows Memory effect. |
| Brightness | `brightness` | 100% | Applies to the art as to the game, through the canvas filter. |

## 7. Sound

All of it is synthesized in `menu-audio.js`; nothing is loaded. It uses the same AudioContext, made on the first key
or click, so autoplay rules are respected. It sits under the same buses: Master × Music for the score, drone and pad;
Master × Effects for the evening, the air, the resonance and the distant sounds. Mute silences all of it, and a
limiter sits at the end.

New in this revision, present from the first moment rather than after 90 s:

- **Drone.** Four low saws: E1, a fifth above, a flat ninth, and a near-unison that beats against the root. They sit
  behind a resonant low-pass that opens and closes like slow breathing. Each saw drifts in pitch on its own.
- **Throat.** Pink noise through a narrow resonance that wanders slowly between about 140 and 280 Hz. It is air
  through something that is not quite a room.
- **Resonance.** Noise ringing in a short feedback delay: a thin, pitched whine that is no instrument, its pitch
  drifting by a few cents.
- **Distant sounds.** About every 20–60 s, a voice-like formant falls slowly, trembling, mostly reverb, panned far to
  one side. It is too far away to name.
- **The melody.** The prologue's old melody, and Aftermath I's four notes in the after mood, now sag in pitch as they
  decay: 7, 13 or 24 cents by mood. The pad has a slow wow and a faint flutter. After the first time through, a note is
  sometimes answered a semitone low or a tritone under, more often later in the summer.
- **Event sounds** (§4). The silence is a 0.18 s fall to 4% under every bus and a slow return. Nothing is a stinger.
  The menu's own interface sounds are unchanged and stay small.

Levels, measured after the limiter in Chromium and in 90-second offline renders: RMS about 0.02–0.03, peaks 0.08–0.16 (−16 dBFS at most). During a silence the RMS falls from about 0.028 to 0.0009. Nothing approaches full scale. The renders are in `docs/qa/main-menu-horror-revision/sound/`, so anyone can listen without waiting at the menu. Much of the drone's energy is below 120 Hz, and on laptop speakers it will mostly not be heard.
**Nobody has listened to it**, so whether it is disturbing, or merely present, is not known.

## 8. Tests

See `docs/MAIN_MENU_HORROR_REVISION_TEST_REPORT.md` for the full results, captures and before/after comparison.
In short:
- The game is unchanged: the node suite passes 818, Chapter Eight 35 and Aftermath I 58.
- The menu browser suite passes 95 from `dist/` and 96 against the offline package, including 25 new title-art checks
  and no network requests.
- The before/after comparison of ten states is in `docs/qa/main-menu-horror-revision/compare/`.

## 9. Limitations

- The art is a fixed composition. It does not follow the game's world if Oak Hollow's geometry changes. Re-run §3's
  four commands after any change to the street or the oak.
- The art's events are on a timer, not tied to anything the player does on the menu.
- On a browser without WebGL image decoding, or under the headless harness, the title falls back to the first
  redesign's live 3D title automatically.
- Only Chromium with SwiftShader was used. Colour and grain on a real display, and performance on a weak GPU, are
  unverified. The art is one full-screen shader pass with about 20 texture reads, likely cheaper than the 3D scene.
- The boot still is about 640 px wide and blurred. On a large screen it is a hint of the picture, not the picture.
- The sound has not been listened to (§7).
- The full game in play under software rendering needs as much memory as before (5–9 GB in SwiftShader). That is a
  property of the game in a software renderer, not of the title, but it is why the browser tests must run one at a
  time.
