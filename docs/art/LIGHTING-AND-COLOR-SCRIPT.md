# Last Light — Lighting and Color Script

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Official lighting style: **NATURALISTIC CINEMATIC LIGHTING.** Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

Numbers below are PROPOSED starting values for the lighting-profile data (bible §4.3). They are tuned in the Phase One benchmark on real hardware and then locked per profile. Current values live in `dist/game.js` `update()` (sun, hemisphere, fog, exposure, sky uniforms) and in each chapter's `light()`/`sky()` function.

---

## 1. Principles

1. **Every light has a source** the player could point to: the sun, the sky, a streetlight, a porch bulb, a lamp, a flashlight, fire, the red deck, a screen.
2. **Shadows carry meaning:** soft and long at golden hour, hard under a single bulb, absent in fog, deep but shaped at night.
3. **One exposure philosophy:** an eye adapting slowly, not a camera hunting. Exposure is set per profile and eased between profiles over ≥ 2 s; no auto-exposure flicker.
4. **Atmospheric depth:** fog/haze separates planes (foreground, middle, background) in every exterior and large interior.
5. **Color is emotional but physical:** temperature shifts come from sources (sodium amber, fluorescent green, fire orange, red deck), not grading.
6. **Faces first in story moments:** the key light on a speaking character comes from a plausible source and keeps the eyes readable.
7. **Night is dark, not black:** shapes, silhouettes and navigation remain readable (§3).

Avoid: flat ambient-only lighting; color grading that overwhelms materials; pitch-black screens; one universal white light; emissive surfaces pretending to be lit.

---

## 2. Light-source standards

| Source | Color temperature / color | Intensity character | Falloff & shadow | Behavior | Where |
|---|---|---|---|---|---|
| Afternoon sun | 5200–5600 K | Strong key; sky fill ≈ 25–35% of key | Hard-edged with slight penumbra; long shadows after 6 PM | Static per scene; slowly moving with story clock | Prologue start, Ch2 morning, Ch4 afternoon, Ch5 day, A1 days |
| Sunset / golden hour | 3000–3800 K, sun disk warm-orange | Key low, rakes across facades; sky fill blue (contrast warm/cool) | Very long soft shadows; rim light on characters and foliage | Sun descends over the Prologue ride (current `distance/LENGTH`) | Prologue |
| Blue hour | Sky 9000–12000 K equivalent; residual warm horizon | No direct sun; skylight only | Shadowless soft; streetlights/porch lights become keys | Lights turn on one by one | Prologue end, Ch1 start, Ch4 dusk |
| Moonlight | 4100–4500 K perceived as blue-gray (shift in grading of the light, not the image) | Very low key; readable silhouettes | Soft shadows on High, none on Low | Static | Ch1–3, Ch5, Ch7 nights |
| Streetlight (HPS sodium, 2011) | ~2000–2200 K, deep amber | Pools 10–15 m diameter under cobra heads; strong inverse-square | Hard-ish downward shadows; dark gaps between poles | Photocell turn-on; Ch4 relay clunk + flicker as the Presence takes them | All night exteriors in Oak Hollow and downtown |
| Porch light | Incandescent 2700 K (some CFL 3000 K) | Small pool at the door | Short range; one shadow-caster at most per scene | On at dusk; Jamie's mother leaves hers on (A1) | All |
| Household lamps / window glow | 2700–3000 K | Warm windows at night; interior keys | Interior shadows in entered rooms | Window schedules (`litMaterial`) | All night exteriors; interiors |
| Flashlight (2011 incandescent/early LED) | Incandescent 3000 K (Jamie's spare); early LED 5500–6000 K slightly blue (Sam's, Ch5 on) — CDA A-38 | Narrow hot center, wide soft spill (CURRENT `player-flashlight` + `-spill`) | Hard cone shadow; the player's own shadow when another light is behind | Hand sway, battery dimming where the story uses it | Ch1 onward |
| Industrial fluorescent | 4000–4500 K, green spike | Even, flat in its zone; buzzing | Soft, top-down | Flicker on failing tubes; ballast hum | Works (Ch6, Ch8), school (A1) |
| Cage/incandescent work lamps | 2700 K | Local pools | Hard | Swing slightly when hit | Works, drains |
| Emergency lights (police/fire) | Red 620 nm + blue 470 nm strobes; amber on utility trucks | Rotating/strobing | Washes across facades; no shadow casting needed on Low | Strobe ≤ 3 Hz with reduced-flashing option | Ch1 police, Ch2, Ch6, Ch8, A1 |
| Candlelight | 1800–2000 K | Very local; flicker | Soft | Each candle independent flicker | Jamie's vigil (A1), memorial |
| Firelight | 1800–2500 K, orange-red | Strong, local, flickering, upward-lit faces | Dancing shadows; smoke occlusion | Gusts with wind and Presence impacts | Ch5 campfire, Ch8 burning houses/gas fire |
| Vehicle headlights | Halogen 3200 K (2011) | Beams with visible cone in fog/smoke | Hard | Sweep on turns | Ch1 police car, Ch7, A1 drive out |
| Screens (TV, monitor) | 6500 K, flickering with content | Low, cool, moving | Soft | Content-driven | Ch4 TV shop/video store, A1 shelter TV, **2026 monitor** |
| Apocalyptic sky (the red deck) | Crimson underlight ~#7a1010–#c02818 with furnace-orange horizon ~#ff6741 (CURRENT sun tint `0xff6741`) | Large-area fill from above-front toward the court; brighter near the Presence's direction (`apocDir`) | Very soft from the deck; fires provide hard local shadows | Intensity follows catastrophe progression (`apoc`), recedes after the seal | Ch8 surface |
| The 2026 desk lamp | 2700–3000 K warm LED | Single key over the desk | Soft shadow, strong falloff into the room | Static; steady | 2026 coda |

---

## 3. Exposure and night readability

| Rule | Standard |
|---|---|
| Exposure model | One tone-mapper (ACES today; AgX candidate — CDA A-24), profile exposure targets, eased transitions (≥ 2 s; ≥ 0.5 s for doors between interior/exterior) |
| Night minimum | At default brightness on an sRGB-calibrated monitor, the following are distinguishable: the walkable path within 8 m, any companion within 10 m (silhouette + face orientation), interactable story objects within 3 m when the prompt shows, creature silhouettes when the design intends them to be seen |
| Measurement | In captures, the 5th percentile luminance of the walkable area within 8 m should not fall below ~2% of display white (≈ sRGB 25) except in deliberate total-darkness beats that the story requires (e.g., Ch4 all lights out, Ch3 flashlight off) — those beats must be short and end with readable light |
| Black level | Deep shadows retain hue (blue night, warm interiors), never pure 0,0,0 except voids (inside a pipe, the throat of the opening) |
| Highlights | Light sources may clip; lit surfaces should not (sunlit white trim stays below clip) |
| Brightness setting | Gamma/brightness slider affects the post curve, not the scene lights; story-critical readability holds across its range |
| Known problem | "Some underground angles remain extremely dark" (`VISUAL_RECOVERY_REPORT.md`) — fails the night minimum; fix with bounce from wet surfaces and practical lights, not ambient boost |

---

## 4. Shadows

| Tier | Sun shadow | Practical shadows | Contact |
|---|---|---|---|
| Low | 1024², 60 m frustum, PCF | None (blob shadows under characters, creatures, vehicles) | Blob decals |
| Medium | 2048², 100 m | 1 shadowing practical near the player (flashlight or the nearest key) | Blob + short-range screen-space contact shadows (PROPOSED) |
| High | 3072–4096², 120 m (or 2 cascades: 40 m sharp + 150 m soft) | 2–3 practicals | Contact shadows |

Requirements: characters grounded (no detached or missing shadows at the feet), correct orientation to the key, stable (no swimming on camera move; texel snapping), soft/hard per source, faces readable (avoid nose/brow shadows that hide eyes in dialogue: adjust staging, not shadows), large structures (houses, the Presence's limbs) cast appropriately sized shadows. CURRENT: one sun shadow with position-only proxies; Chapter Six adds blob "foot contact" decals only while its presentation is on (`chapter6-models.js`) — make contact shadows global.

---

## 5. Color script — chapter by chapter

Each entry: time and weather; motivating light; dominant color families; exposure intent; fog; key readability notes; profile IDs.

### Prologue — "the happiest summer evening the player will never get back"
- **Time:** Sunday, August 21, 2011, ~7:30 PM to blue hour (sunset ride; friends go home one by one).
- **Light:** low golden sun (3000–3800 K) raking down Oak Hollow Drive; blue sky fill; then blue hour with sodium streetlights and porch lights coming on one by one; fireflies; the first stars "wait for the very end".
- **Colors:** warm gold, soft blue, healthy greens, muted cream, warm siding, amber streetlights.
- **Exposure:** slightly bright, open shadows (fill high), gentle contrast; warm highlights.
- **Fog:** warm haze (CURRENT fog `0xe3ac8d`, density .008) — keep as depth, thin enough to show the hills.
- **Memory variant:** the Ch2 "Remember" reconstruction is a lighting variant of this profile (CURRENT: fog warmer, exposure +.025) — keep subtle.
- **Profiles:** `lgt.prologue.golden`, `lgt.prologue.sunset`, `lgt.prologue.blue-hour`, `lgt.memory.prologue`.

### Chapters One and Two — "something is wrong with a place that still looks familiar"
- **Ch1:** same night, after 8:44 PM: deep blue hour into night; the police cruiser's lights on Briarwood; flashlight from the creek on. **Ch2:** the creek and easement that night (flashlight, police flashlights, tape); then Monday morning August 22 in bright daylight with searchers and flyers.
- **Colors:** muted greens, warm twilight, dusk blue, soft gray, deepening shadow, restrained warm interiors; morning: clean but slightly overcast-pale daylight (the same street, less golden).
- **Exposure:** night lower than the Prologue's blue hour; morning a touch flatter than the Prologue.
- **Rule:** do not redesign the street; unease comes from emptiness, stillness, framing and shadow.
- **Profiles:** `lgt.ch1.night-search`, `lgt.ch2.easement-night`, `lgt.ch2.morning`.

### Chapter Three — "descending beneath childhood into a place nobody should enter"
- **Time:** August 22: day at Alex's house and the pond road; that night at eleven down the pond road to the basin, the culvert, the drains.
- **Light:** day interiors (warm, curtains); night: moonlight, the flashlight (starts off), the drain's darkness.
- **Colors:** damp charcoal, dirty concrete gray, dark moss, rust, muted industrial amber, black-blue shadow.
- **Exposure:** night low; flashlight dominant; wet surfaces return highlights for shape.
- **Profiles:** `lgt.ch3.day-interior`, `lgt.ch3.pond-road-night`, `lgt.ch3.drain`.

### Chapters Four to Six — "the ordinary town is sitting on something much older"
- **Ch4 (Tue Aug 23):** white afternoon → gold → dusk at eight → night on Main Street (CURRENT `chapter4.js` own clock); streetlights die in a line; TV screens; the Lyric marquee. **Ch5 (Wed Aug 24):** day at Sam's garage and on the road; Pine Ridge afternoon; the camp at dusk and night (lamps with no power, carried lights, campfire); one light across the water. **Ch6 (Thu Aug 25):** Sam's house morning; the works; the storm (`chapter6-storm.js`); Gate 2B emergency.
- **Colors:** cool blue-gray, aged concrete, desaturated greens, rust orange, old fluorescent, stained interior yellow, deep isolated shadows; Ch5 dusk may carry warmth before the camp turns cold.
- **Exposure:** moderate; storm lowers sun and raises fog (CURRENT `L4.storm`).
- **Profiles:** `lgt.ch4.afternoon`, `lgt.ch4.dusk`, `lgt.ch4.main-street-night`, `lgt.ch5.day`, `lgt.ch5.camp-dusk`, `lgt.ch5.camp-night`, `lgt.ch6.morning`, `lgt.ch6.storm`, `lgt.works.fluorescent`.

### Chapter Seven — "safety has completely disappeared"
- **Time:** Friday August 26: morning at Sam's house (Reyes and the maps), afternoon to the lookout and the court, night in the houses (the Langes', the green-door house), the chase, Jamie taken (≈ 9:38 PM).
- **Colors:** cold suburban night blue, deep neutral black, sickly interior green where appropriate (old fixtures in the court houses), muted tungsten, strong flashlight highlights, selective red (one red object or light per scene at most).
- **Exposure:** strongest night contrast in the game before Ch8; flashlight readability is critical in close hunter encounters; the hunter's silhouette must separate (rim from a window, porch light behind).
- **Profiles:** `lgt.ch7.morning-interior`, `lgt.ch7.court-dusk`, `lgt.ch7.house-night`, `lgt.ch7.street-night`.

### Chapter Eight — "the world itself is breaking"
- **Time:** Fri Aug 26, 10:42 PM → Sat Aug 27 ~6:30 AM. Underground (works, flooded wing, retrieval wing, crew room, anchor board); the breach ~2:20 AM; the surface before five; the works at first light; the oak ~6:20; the last ride.
- **Light:** underground: flashlights, failing fluorescents, emergency lamps, alarm strobes; surface: the **red deck** (crimson underlight, furnace horizon, moving charcoal clouds, flashes inside the clouds), house fires and the gas fire at the curb, emergency red/blue at Summerfield, the Presence silhouetted; at the seal: the unnatural atmosphere recedes; dawn at the oak (gray-gold, smoke-filtered); the ride: lighting begins to recover, emotional consequence does not.
- **Colors:** blood red, deep crimson, charcoal black, burnt orange, ash gray, firelight, smoke-darkened neutrals, limited emergency blue and red.
- **Exposure:** surface brighter than Ch7 nights (the sky is a light source) but low-contrast in the far field due to smoke; faces lit by fire and the deck from the side; Jamie's death and Alex's death must stay readable (§6).
- **Avoid:** a flat red background; red so saturated that skin and materials lose identity (keep skin hue recognizable under red: lift with fire's orange and a neutral bounce).
- **Profiles:** `lgt.ch8.works`, `lgt.ch8.alarm`, `lgt.ch8.breach`, `lgt.ch8.catastrophe` (driven by `apoc` 0–1), `lgt.ch8.first-light`, `lgt.ch8.oak-dawn`, `lgt.ch8.ride-recovery`.

### Aftermath I — "the nightmare has ended, but nothing is normal anymore"
- **Time:** Aug 27 6:30 AM (school lot; "the red sky gone to brown"), the shelter days, Sept 1 behind the fence, Sept 6 the memorial, Jamie's vigil at dusk, the chain at dusk, October 15 "the last of the light", the kitchen at 6:20 PM, packing, goodbye, the drive.
- **Colors:** dusty gray, faded green, pale late-summer daylight, smoke-stained neutrals, muted autumn browns, soft evening gold, warm candlelight.
- **Exposure:** naturalistic and slightly subdued; no stylized grief filter; interiors lit by practical sources (fix: the kitchen "lit like Chapter Six's morning" must read as evening, a localized warm lamp and dim window).
- **Profiles:** `lgt.a1.smoke-morning`, `lgt.a1.shelter-gym` (fluorescent + daylight from high windows), `lgt.a1.nurse-room`, `lgt.a1.sept-day`, `lgt.a1.vigil-dusk`, `lgt.a1.memorial-gym`, `lgt.a1.chain-dusk`, `lgt.a1.october-afternoon`, `lgt.a1.kitchen-evening`, `lgt.a1.drive`.

### Aftermath II (~2021, planned) — "the place has recovered, but time cannot be reversed"
- **Colors:** mature green, peaceful suburban blue, warm natural daylight, gentle amber, more subdued reflective tones, realistic contemporary materials.
- **Light:** CDA A-44 on time of day (PROPOSED: late afternoon into golden hour, mirroring the Prologue's light at a slightly different angle/season, so the echo is felt without copying). Streetlights may be LED in 2021 (cooler 3000–4000 K) — a quiet sign that time passed.
- **No new supernatural lighting.**
- **Profiles:** `lgt.a2.afternoon`, `lgt.a2.golden`, `lgt.a2.dusk`.

### 2026 coda (planned) — "someone has spent years trying to preserve what mattered"
- **Light:** warm desk lamp (2700–3000 K) as key; dark neutral blue room fill from a window at night; subtle monitor light (6500 K) showing *Last Light*; natural wood and fabric.
- **Camera:** quiet, slow; the monitor's image is the Prologue's golden street — the coda connects directly to the Prologue profile.
- **Profiles:** `lgt.2026.desk-night`.

**Critical rule:** these transitions are emotional lighting on one world. They are never changes in art quality, character style or material response.

---

## 6. Emotional scene lighting and staging

| Scene | Key | Fill | Rim/separation | Readability requirement |
|---|---|---|---|---|
| Prologue departures | Low gold sun | Sky blue | Sun rim on hair | Faces readable at 3–6 m as each friend waves |
| Four-friend reunion (Ch8 crew room) | Practical work lamp(s) | Bounce from concrete | Flashlights on the floor | All four faces readable from the player's natural position; their joy reads |
| Jamie's death (Ch8 sc.13) | Fire from the Hendersons' and the red deck | Neutral bounce from the street | Emergency lights at a distance (slow, not strobing at the body) | His face recognizable as Jamie; Reyes's CPR hands visible; the devastated street visible behind; no gore |
| Alex's death (Ch8 sc.16) | Dawn sky (gray-gold, smoke-filtered) | The oak's bark bounce | Low sun breaking through smoke behind the town | His eyes and mouth readable at 1–1.5 m; Sam's hand on his; stillness after |
| Sam's grief (Ch8 ride, A1) | Natural source of the scene | — | — | Posture readable at 5 m; face at 2 m |
| Shelter / families (A1) | Gym high windows + fluorescents | Bright floor bounce | — | Each family's grief distinct; not a uniform gloom |
| Jamie's vigil | Candles + porch light + dusk sky | Dusk sky | Candle rim | Faces warm, eyes glinting |
| Alex's memorial | Gym daylight | — | Spot on the portrait easel (practical) | His portrait clearly Alex |
| October kitchen | Single warm lamp over the table | Dim window | — | Mother's face at the table readable |
| Aftermath II reunion (planned) | Late-day sun | Sky | — | Adult Sam recognizable at 3 m |
| 2026 coda (planned) | Desk lamp | Monitor | Window | Objects (notebook, print, cap if kept) recognizable |

Staging guidelines (all): characters come to the player and stop at 1.2–2.0 m, turn their faces into the key, and hold the moment; the player keeps camera control unless the scene already restricts it; prompts never cover faces; captions never cover a face in the center third of the frame (adaptive captions exist from Ch3 — keep).

---

## 7. Sky and atmosphere standard

One sky system (CURRENT `skyMat` in `game.js` + `catastrophe-sky.js`). Required states and parameters:

| Parameter | Range / meaning |
|---|---|
| Sun direction | From the story clock and location (Oak Hollow, ~40°N; August/October sun paths) |
| Day / dusk / night | Blend weights (CURRENT uniforms) |
| Cloud layers | Cirrus wisps (Prologue), cumulus (afternoons), storm deck (Ch6), catastrophe deck (Ch8: two moving decks with directional underlighting — CURRENT), smoke columns (Ch8–A1 morning) |
| Atmosphere | Rayleigh-like blue gradient, Mie-like sun glow; horizon haze tied to fog color |
| Fog | Color = horizon color of the sky profile; density per profile; height fog for creek valleys and the reservoir (PROPOSED) |
| Weather | Clear, haze, storm (rain where established: Ch6 storm), smoke |
| Catastrophe | `apoc` 0→1 drives sky, fog, sun tint, exposure; `apocDir` points toward the court |
| Recovery | After the seal: `apoc` eases down; smoke and brown sky persist into A1's first morning |
| Stars | Only in deep night (CURRENT threshold) |

Particles and volumes: dust (works, collapses), wind-blown leaves (Prologue light breeze; October), fog/mist (creek, reservoir), smoke (Ch8, A1 morning), rain (Ch6), steam (works, water main), embers and ash (Ch8), light shafts (gym windows, dust in the works, flashlight in dust), cloud motion, distant haze, emergency-scene atmosphere. Effects are lit, scaled to the world (an ember is millimeters; a smoke column is tens of meters), bounded (bible §20.2), and varied (no repeating sprite sheets in view).

---

## 8. Lighting profile catalog (IDs)

`lgt.prologue.golden`, `lgt.prologue.sunset`, `lgt.prologue.blue-hour`, `lgt.memory.prologue`, `lgt.ch1.night-search`, `lgt.ch2.easement-night`, `lgt.ch2.morning`, `lgt.ch3.day-interior`, `lgt.ch3.pond-road-night`, `lgt.ch3.drain`, `lgt.ch4.afternoon`, `lgt.ch4.dusk`, `lgt.ch4.main-street-night`, `lgt.ch5.day`, `lgt.ch5.camp-dusk`, `lgt.ch5.camp-night`, `lgt.ch6.morning`, `lgt.ch6.storm`, `lgt.works.fluorescent`, `lgt.ch7.morning-interior`, `lgt.ch7.court-dusk`, `lgt.ch7.house-night`, `lgt.ch7.street-night`, `lgt.ch8.works`, `lgt.ch8.alarm`, `lgt.ch8.breach`, `lgt.ch8.catastrophe`, `lgt.ch8.first-light`, `lgt.ch8.oak-dawn`, `lgt.ch8.ride-recovery`, `lgt.a1.smoke-morning`, `lgt.a1.shelter-gym`, `lgt.a1.nurse-room`, `lgt.a1.sept-day`, `lgt.a1.vigil-dusk`, `lgt.a1.memorial-gym`, `lgt.a1.chain-dusk`, `lgt.a1.october-afternoon`, `lgt.a1.kitchen-evening`, `lgt.a1.drive`, `lgt.a2.afternoon`, `lgt.a2.golden`, `lgt.a2.dusk`, `lgt.2026.desk-night`.

Each profile record (PROPOSED schema): `sun {dir|clock, color, intensity, shadow}`, `sky {day, dusk, night, storm, apoc, clouds}`, `hemi {sky, ground, intensity}`, `fog {color, density, height?}`, `exposure`, `practicals {defaults}`, `post {bloom, grain, vignette}`, `notes`, `status`, `approvedCaptures[]`.
