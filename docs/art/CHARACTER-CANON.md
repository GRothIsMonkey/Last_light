# Last Light — Character Canon

Part of the [Final Art Bible](../LAST-LIGHT-FINAL-ART-BIBLE.md). Status labels (STORY CANON, APPROVED, CURRENT SOURCE, PROPOSED, CDA) are defined there.

**Rule of this document:** anything not established by story text or an approved decision is labeled CURRENT SOURCE (what the code does now) or PROPOSED. Nothing here is invented and then called canon. Hex colors are quoted from the code as evidence; they become canon only when the creative director approves them (`ART-APPROVAL-REGISTER.md`).

Source audit base: `c646a862b272c987b0a0b9aea690ddfc859ddda7`.

---

## 1. How characters are built today (summary)

Full detail: [`VISUAL-CONSISTENCY-AUDIT.md`](VISUAL-CONSISTENCY-AUDIT.md) §2.

- **Data:** `dist/cast.js` `CAST` (the four boys, Jamie's mother in the Prologue as `mom`, the hoop kid as `kid`); `dist/people.js` `ADULTS` (officers incl. Reyes, Alex's parents, searchers, Chapter Three neighbors); `dist/chapter6-cast.js` `ADULTS6` (Sam's dad, Mr. Brandt, firefighters); `dist/chapter7-cast.js` (`MRS_LANGE`, `JAMIE_MOM`, the dining-room family, the photo "studio"); `dist/chapter8-fall.js` / `dist/chapter8-street.js` (Hendersons, Lily, Mrs. Pruitt, Mr. Davis, runners — via a local `ADULT()` helper defined twice); `dist/aftermath1.js` `ADULTS9` (the protagonist's mother, volunteer, paramedic); `dist/chapter4.js` (Sam's mom, inline); `dist/town-life.js` (Main Street people).
- **Rig:** `dist/rig.js` — one IK-target pose (35 floats) driving rigid segment meshes. Shared bone lengths `BODY = {hip .085, thigh .38, shin .37, ankle .065, torso .44, shoulder .155, upper .25, fore .23, neck .07, head .105, stand .80}` → a standing child ≈ 1.53 m to the crown. Adults are the **same skeleton uniformly scaled** by `scale` 1.10–1.22.
- **Boys' art:** `dist/astra-anatomy.js` `boyModel` replaces the rig's primitive parts for any spec whose `name` is `JAMIE`, `SAM`, `ALEX` or `YOU` (`isBoy`). Lofted continuous head, fitted hair, lofted shirt, tapered limbs, finger tubes. Faces: `dist/faces.js` (expressions, text-timed mouth, grief, "rich" face always on for the boys).
- **Adults' art:** `dist/people.js` `createActor` → `dist/adult-art.js` `refineAdult` → `dist/adult-sculpt.js` `adultHead`. Then chapter overlays: `chapter6-models.js` `chapter6Appearance` (Chapters Six–Seven), `chapter7-portraits.js` `portrait` (Chapter Seven), `aftermath1-acting.js` `adultFace` (Aftermath I).
- **Children who are not the four boys** (Lily Henderson, the hoop kid, shelter children) use the primitive rig head or the *adult* sculpt (Lily is a `createActor`) or instanced crowd meshes.

---

## 2. Shared standards for every human

### 2.1 Proportion table (PROPOSED)

| Group | Height | Heads tall | Notes |
|---|---|---|---|
| The four boys, 2011 (12) | 1.45–1.58 m (individual, below) | 6.6–7.0 | Current rig: 1.53 m for all four, build varies only in girth/shoulders/head size |
| Lily Henderson (CDA on age) | ~1.15–1.25 m | ~5.5–6 | Current: `CAST.kid` scaled 0.76–0.78 |
| Adult women | 1.58–1.72 m | 7.3–7.6 | Current: child rig × 1.10–1.14 |
| Adult men | 1.70–1.88 m | 7.4–7.8 | Current: child rig × 1.16–1.22 |
| Elderly adults | −2–4 cm, forward head carriage | 7.2–7.5 | Mrs. Lange, Mr. Henderson, Mrs. Pruitt, Brandt (gray-haired) |
| Protagonist / Sam, ~2021 (≈22) | individual | 7.5 | Not yet built |

**Defect today:** because adults are the child skeleton scaled up, every adult has a child's head-to-body ratio (≈ 6.8 heads). The reconstruction must give adults their own skeleton proportions (`rig.human.adult`), keeping the pose contract (`rig.js` `P` layout and socket names) so scenes keep working. Contact-heavy scenes (CPR, embraces, hand-holding, carrying Brandt) must be revalidated when proportions change (Roadmap Phase 2 tests).

### 2.2 Character-sheet views (required before Phase Two implementation of a character)

For every recurring character, one approved sheet set:

- Full body: front, left profile, right profile, three-quarter, back — in each approved wardrobe.
- Head: front, profile, three-quarter, back (hair construction visible).
- Expressions (head, three-quarter): neutral, happy, concerned, frightened, crying; plus for Sam additionally *numb* and *angry*; for Alex *exhausted/weak*; for adults their specific grief expression (§5).
- Hands: open, gripping handlebar, holding flashlight, holding another hand (protagonist at hero detail).
- Height lineup: all four boys side by side, with their bikes; adults lineup with the boys.
- Material callouts: skin, hair, each garment fabric, shoes.
- For age variants: 2011 and adult sheets side by side with landmark overlay (eyes, nose base, mouth corners, ears, hairline).

Sheets may be drawn, painted or rendered from a sculpt; they must be **original**, stored under a proposed `docs/art/references/` with provenance (author, date, tool, approval date). AI-generated sheets require creative-director approval and must not imitate any real person or existing character.

### 2.3 Standard condition variants (all humans)

| Condition | Visual | Persistence |
|---|---|---|
| `+wet` | Darker fabric (value −25%), clinging fold set, hair clumped, skin specular up slightly | Dries over scene time unless story says otherwise |
| `+mud` / `+grit` | Decal masks on shins, knees, hands, seat of shorts, shoes | Persists within a night/sequence; cleared by a story change of clothes |
| `+dust` | Concrete/plaster dust on hair and shoulders (Ch8 surface, collapse survivors) | Persists through Chapter Eight; gone by the shelter wash (story-dependent) |
| `+soot` | Smudges on face/hands near fires | Same |
| `+blood` | Non-graphic: small abrasions, nosebleed trace, blood on hands from helping. No gore | Story-specific only |
| `+bruise`, `+scrape`, `+bandage`, `+cast` | Physical injury markers | Per story (Brandt's leg cast in Aftermath I; the protagonist's dressed hand in Aftermath I `aftermath1-record.js` `dressHand`) |
| `+tired` | Eye bags, lower lids raised, posture drop, slower blink | Ch6–Ch8, Aftermath I early |
| `+tear-stained` | Redness, wet lower lids, dried track sheen | Hours after crying |
| `+dead` | Lids per scene, no breath/blink/micro-motion, skin desaturation ≤ 10%, no gore | Jamie (Ch8 sc.13), Alex (Ch8 sc.16) |

---

## 3. The four boys (2011)

Shared: age **12** (STORY CANON). Each must be identifiable in silhouette at 20 m (hair/cap shape, build, posture, bike), by face at 3 m, and by expression at 1.5 m.

### 3.1 The protagonist — `chr.protagonist`

| Field | Value |
|---|---|
| Name / ID | Unnamed; "YOU" in code (`CAST.player`). `chr.protagonist` |
| Role | The player; witness; survivor; later the author of *Last Light* (2026 coda) |
| First appearance | Prologue (first person) |
| Appearances | Every chapter in first person (`dist/game.js` `self`, one instance); visible full body in photographs (Chapter Seven studio render; Aftermath I prints and canvas drawings); 2021 and 2026 adult (planned) |
| Age | 12 (2011, STORY CANON: "Twelve." Aftermath I §5); ≈22 in ~2021; ≈27 in 2026 (anchors) |
| Height / build | CURRENT SOURCE: rig 1.53 m, `build {bulk 1, shoulders 1, head 1, posture −.16}`. PROPOSED: 1.52 m, average build — the reference point the others are measured against |
| Face | CURRENT SOURCE: `jaw .92, cheek 1, eyeGap .036, eyeY .012, browTilt 0, nose 'button', mouth 'flat'`. PROPOSED: deliberately understated, memorable through calm, observant eyes and a slightly lopsided resting mouth; **CDA (A-01)** — final face design |
| Eyes | CURRENT SOURCE iris `0x3a3020` (brown). CDA (A-02) |
| Skin | CURRENT SOURCE `0xd9a883` (light-medium, warm). His mother in Aftermath I uses the same value (consistent) |
| Hair | CURRENT SOURCE `style 'cropped'`, `0x5a4030` (medium brown). PROPOSED: short, natural, slightly grown out at the end of summer. CDA (A-03) |
| Default posture / expression | Relaxed, slightly forward on the bike (`posture −.16` is *less* lean than default; verify intent); neutral-attentive |
| Wardrobe (2011) | CURRENT SOURCE summer: short-sleeve shirt `0x7f93ab` (dusty blue) with trim `0x5d6f86`, shorts `0x4a5a78`, white socks, off-white shoes. STORY: "Your Tour shirt" with iron-on letters exists as an object (Aftermath I). Night/later-chapter wardrobe per scene: CDA (A-04) |
| Accessories | Flashlight (from Jamie at the creek, Chapter One onward); Alex's camera when held (Ch4–5); Sam's notebook (Ch8 → carried out of Oak Hollow); Jamie's cap (Ch8 → kept or given to Jamie's mother, save-dependent) |
| Bike | `bike.protagonist`: style `road-kid`, frame `0x5f8f93`, riser bars, bell, reflector (Environment guide §8) |
| Hands (hero priority) | One canonical pair for every chapter. Must read as a 12-year-old's: short nails, slight knuckle definition, no adult veins, skin matches face. Required poses: grip (bars), bell thumb, flashlight grip, door push/pull, object pinch, holding another hand, resting on knees, covering face, CPR-adjacent reach (Ch8), holding the notebook in the car (Aftermath I) |
| Movement | First-person: subtle head bob on foot, stable on bike, breathing visible only in exhaustion/crying (`C.pCry` in Ch8) |
| Emotional animation | First-person conveys fear and grief through camera breath, hand tremor and pace; captions remain readable |
| Conditions | `+wet`, `+mud` (drains), `+dust` (Ch8), dressed left hand (Aftermath I), `+tear-stained` |
| Close-up requirements | Hands at 0.4–0.6 m camera distance must hold up at High: finger joints, nails, knuckle creases, wrist-to-sleeve transition, no gaps at the forearm/hand join |
| Known inconsistencies | Current rig arm/hand joins can show at extreme reach; first-person head is shadow-only (layer 1); in QA cameras outside the body he appears headless (documented in `ASTRA_HANDOFF.md`) — capture rules must avoid presenting that as the character |
| Files | `dist/cast.js` (`player`), `dist/game.js` (self, bike), `dist/on-foot.js` (body, flashlight), `dist/physical.js` (hand reach/contact), `dist/rig.js`, `dist/astra-anatomy.js`, `dist/chapter5-gear.js` / `chapter5-park.js` (first-person arm poses) |
| Approvals | A-01 face, A-02 eyes, A-03 hair, A-04 wardrobe set, A-20 adult protagonist |

**Adult protagonist (`chr.protagonist.a22`, `.a27`) — planned:** preserve eye spacing ratio, iris, brow family, nose type, ears, hairline family and the lopsided resting mouth. 2021: young-adult casual (CDA). 2026: at home in the evening, seen mostly as hands, sleeves and reflection; desk-lamp light. His hands must be an aged version of the 2011 hands (same nail shape, finger ratios), not a different model.

### 3.2 Jamie — `chr.jamie`

| Field | Value |
|---|---|
| Role | The lively, outgoing, warm-hearted friend. Dies in Chapter Eight (scene 13) saving Mr. Henderson |
| First appearance | Prologue |
| Appearances | Prologue (`friends.js`, rides, runs home when his mother calls); Ch1–Ch5 (companion, `companions.js`); Ch5 double in Owl (`chapter5-presence.js`); Ch6 (with Sam/Reyes; "jamie-on-the-stairs" double, `chapter6-cast.js`); Ch7 (taken by the hunter); Ch8 (rescued in the retrieval wing; reunion; death in the Hendersons' side yard); after death: Reyes's coat over him; Aftermath I photographs, flyer, portrait, vigil, his cap, his BMX at the porch |
| Age | 12 (STORY CANON: Reyes "Twelve. Blue cap. Orange shirt."). **No adult version ever.** |
| Height / build | CURRENT SOURCE: `bulk 1.08, shoulders 1.06, head 1.02, posture .04` — the sturdiest of the four. PROPOSED: 1.55 m, solid, athletic-soft, wide shoulders for his age |
| Face | CURRENT SOURCE: `jaw .95, cheek 1.06, eyeGap .036, eyeY .012, browTilt .12 (raised), nose 'button', mouth 'grin'`, six cheek freckle dots in the Ch7 portrait code (dead path: portrait skips the boys). PROPOSED: open, round-cheeked, quick wide grin that pulls slightly higher on one side; brows that live high; the most expressive face of the four. Freckles: CDA (A-06) |
| Eyes | CURRENT SOURCE iris `0x3a2a1c` (dark brown). CDA (A-02) |
| Skin | CURRENT SOURCE `0xd6a57f` (warm medium-light). His mother (both specs) shares it |
| Hair | Under the cap: CURRENT SOURCE `0x3b2a20` (dark brown); the uncapped head (`artUncappedHead`, used after the cap comes off) is generated with style `'cropped'` — never designed. CDA (A-05): Jamie's uncapped hair |
| **Cap** | STORY CANON: **blue cap; "the one he turns backwards when he rides"** (Ch7, `chapter7.js` 1372). CURRENT SOURCE: worn cap is brim-forward in every state (`astra-anatomy.js`), color `0x2d4a7a`, six-panel seams, top button, a pale front badge `0xb8c5bc`. **Conflict:** canon says backwards when riding. CDA (A-07): backwards while riding, forwards on foot? (PROPOSED: yes — backwards on the bike, forwards on foot, matching the line.) Prop: `prop.jamie-cap` (Environment guide §10) |
| Wardrobe (2011) | STORY CANON: **orange shirt** "with the hole in the sleeve he won't let me throw out" (his mother, Ch7). CURRENT SOURCE: shirt `0xc8743f`, short sleeves, shorts `0x6b6250` (khaki-olive), white socks, off-white shoes. **The hole in the sleeve is not modeled** (A-08). Same outfit Prologue → Ch8 death (the story spans Aug 21–27; whether he changes clothes between days: CDA A-08) |
| Bike | `bike.jamie`: BMX, frame `0xb2553a` (rust red), BMX bars, 0.29 m wheels, pegs, pad. After Ch7: down in the grass west of the path mouth; after Ch8: on its side in the gutter by the streetlight; Aftermath I: at his mother's porch rail |
| Default posture | Forward, bouncy, weight on the balls of the feet; on the bike stands on the pedals often (`ride.stand 1.3`), weaves (`weave 1.2`), sways (`1.15`) |
| Default expression | Half-grin at rest; eyebrows up |
| Mannerisms | Talks with his hands; looks back over his shoulder while riding (`look 1.2`); quick reactions (`reaction .45 s`); drops his bike on the lawn |
| Walk / run | Long, bouncy steps; runs everywhere short; slightly flat-footed landing |
| Emotional range | Joy, teasing, bravado, anger/frustration (`face:'frustrated'`), terror (`'terrified'`), determination (`'determined'`), grief for Alex. Must look genuinely alive early so his death lands |
| Death-scene standards | Body keeps correct proportions; face recognizably Jamie; grounded lying pose; Reyes's CPR hands contact the sternum (contact regression exists: `tests/art-contacts.mjs`); the coat drapes over him without floating (`astra-environment.js` `mourningCoat`); hands/arms do not intersect; **after death: no blink, breath, tears or idle motion**; facial stillness relaxed, not a paused expression; cap off (uncapped head) |
| After 2011 | Only photographs (from his canonical 2011 model), memories, objects. His mother's wallet picture and school picture are *portraits of the canonical model* (currently canvas drawings — audit §4) |
| Known inconsistencies | Cap orientation vs canon; uncapped hair undesigned; sleeve hole missing; four separate cap builders with three different blues; photographs drawn not rendered; double in Ch6 uses a different (Chapter Six) head model |
| Files | `dist/cast.js` (`jamie`), `dist/astra-anatomy.js`, `dist/faces.js`, `dist/friends.js`, `dist/companions.js`, `dist/companion-brain.js`, `dist/chapter5-presence.js`, `dist/chapter6-cast.js`, `dist/chapter7.js` (cap prop), `dist/chapter8-street.js` (cap prop, death), `dist/chapter8-acting.js`, `dist/astra-environment.js` (coat), `dist/aftermath1-scenes.js` (cap prop), `dist/aftermath1-props.js` (flyer/portrait drawings) |
| Approvals | A-02, A-05, A-06, A-07, A-08, A-09 (final face design) |

### 3.3 Sam — `chr.sam`

| Field | Value |
|---|---|
| Role | The loyal, emotionally sensitive friend who survives; widest emotional range in the game |
| First appearance | Prologue |
| Appearances | Prologue (rides into his garage; door comes down); Ch1–Ch6 companion; taken Thursday Aug 25 in the Gate 2B emergency (Ch6); "the-other-sam" double (Ch6, Reyes saw two Sams at once); Ch7 absent (his room is the chapter's emotional center: fan, photo of the four, notebook, gum, hoodie on the chair, helmet on the doorknob, Tour poster); Ch8 rescued from the flooded wing; reunion; kneels over Jamie; holds Alex's hand and holds him at the oak; the last ride crying; Aftermath I (shelter, return, porch, vigil, memorial, chain repair, October goodbye, staying in Oak Hollow); Aftermath II adult (planned) |
| Age | 12 (STORY CANON: flyer "Age 12"); ≈22 in ~2021 (anchor) |
| Height / build | CURRENT SOURCE `bulk .9, shoulders .94, head .97, posture .1, hunch .06` — the slightest of the four. PROPOSED: 1.50 m, slim, a little narrow-shouldered, slight forward hunch |
| Face | CURRENT SOURCE `jaw .86, cheek .94, eyeGap .034 (closest-set), eyeY .016 (highest), browTilt −.02, nose 'straight', mouth 'flat'`. PROPOSED: narrower, longer face; straight nose; expressive, slightly deep-set eyes that carry the acting; resting face thoughtful and a little guarded. CDA (A-10) |
| Eyes | CURRENT SOURCE iris `0x2a1c12` (very dark brown). CDA (A-02) |
| Skin | CURRENT SOURCE `0xc4906a` (medium, warmer/darker than his parents' current values: father `0xd9b394`, mother `0xe2b898`). **Family resemblance unresolved** (A-11) |
| Hair | CURRENT SOURCE `style 'shaggy'`, `0x2a1c14` (near-black brown), longer at the back, 13 locks. PROPOSED: shaggy, falls toward the eyes, he pushes it back when stressed. CDA (A-12) |
| Wardrobe (2011) | CURRENT SOURCE: short-sleeve shirt `0x6d9a8a` (sage-teal) with cream trim `0xe9e1cf`, shorts `0x3f4a5c`, gray socks, gray shoes. STORY: a hoodie and a helmet exist in his room (Ch7). Night wardrobe and post-rescue wardrobe: CDA (A-13) |
| Accessories | Sam's notebook (STORY: the names written in it; Reyes copies it; protagonist leaves with it); the county map (Ch5); batteries and flashlights; the Tour de Oak Hollow poster (he keeps it: "Somebody has to") |
| Bike | `bike.sam`: mountain bike, frame `0x4d7f8f` (steel teal), flat bars, 0.32 m wheels, bottle, knobby tires. Aftermath I: he fixes the protagonist's chain (twice) |
| Default posture | Slight hunch, hands often in pockets or holding a strap; rides seated, steady (`stand .7, weave .8`), slower cadence (`.94`) |
| Default expression | Thoughtful, guarded; smiles are small and late |
| Mannerisms | Pushes his hair back; looks down before speaking; reacts after a beat (`reaction .8 s`); practical with tools |
| Emotional acting | Fear without overacting; real relief; natural crying; struggling to speak; numbness; anger (Aftermath I: angry at the official story and at Jamie for going back); partial composure; grief through posture more than face. Chapter Eight: visibly carries both deaths (face, walk, silences). Aftermath I evolves: shock (shelter) → anger → practical again by October (grief not gone) |
| Conditions | `+wet` (flooded wing), `+tired`, `+dust`, `+tear-stained` through the last ride |
| Known inconsistencies | Cursed double in Ch6 uses the Chapter Six head/hair model, not his canonical model; skin vs parents; photographs as canvas drawings |
| Files | `dist/cast.js` (`sam`), `dist/astra-anatomy.js`, `dist/faces.js`, `dist/companions.js`, `dist/companion-brain.js`, `dist/chapter6-cast.js` (double), `dist/chapter6-models.js`, `dist/chapter7-house.js` (room, notebook), `dist/chapter8-acting.js`, `dist/aftermath1*.js` |
| Approvals | A-02, A-10, A-11, A-12, A-13, A-21 (adult Sam) |

**Adult Sam (`chr.sam.a22`) — planned for Aftermath II.** Must be a believable older version of the 12-year-old: same eye spacing ratio (he is the closest-set of the four), same straight nose family, same thoughtful resting mouth, same habit of pushing hair back if the hair is kept long enough to do it; hair style may change (CDA A-21). Height gain to adult male range, slim build retained. Clothing plausible for 2021, staying in Oak Hollow. **Not a random adult male model.** Acceptance: side-by-side landmark overlay of the 2011 and 2021 heads at matched scale shows eye-line, nose base, mouth corners and ear positions consistent with normal growth (QA §5.4); five people unfamiliar with the project match the adult to the child from a lineup of four.

### 3.4 Alex — `chr.alex`

| Field | Value |
|---|---|
| Role | The thoughtful friend, taken first; his final choice saves the others; dies against the old oak |
| First appearance | Prologue (goes home first: turns onto Briarwood, rings his bell twice, waves) |
| Appearances | Prologue; missing Ch1–Ch7 but present as: the Ch3 "Alex-like figure" (`chapter3.js` `figure`, canonical model), Ch4 across Main Street and under the Lyric marquee (`chapter4.js` `AX`, canonical model), Ch6 Line Two figure (`chapter6-cast.js`, *cursed Chapter Six model*), flyers, his camera's pictures, his room; Ch8 rescued from the room the thing made; reunion; anchor board; holds the hatch; dies at the oak; Aftermath I photographs, portrait at his memorial, bike on two garage hooks, room untouched |
| Age | 12 (STORY CANON: "Age 12. Since Sun., Aug. 21."). **No adult version ever.** |
| Height / build | CURRENT SOURCE `bulk 1, shoulders 1, head 1, posture 0, hunch .02`. PROPOSED: 1.54 m, average-slim, upright |
| Face | CURRENT SOURCE `jaw .9, cheek 1, eyeGap .038 (widest-set), eyeY .01, browTilt .05, nose 'button', mouth 'smile'`. PROPOSED: gentle, wide-set eyes, soft rounded jaw, a closed-mouth smile that reaches the eyes; looks like he is listening. CDA (A-15) |
| Eyes | CURRENT SOURCE iris `0x4a5a3a` (green-hazel), shared with both his parents in `people.js`. CDA (A-02) |
| Skin | CURRENT SOURCE `0xe0b595` (light, warm); mother `0xe2b898`, father `0xd8ad8c` (consistent family) |
| Hair | Docs: "swept brown hair" (`ASTRA_CHAPTER3_HORROR_ESCALATION_HANDOFF.md`). CURRENT SOURCE `style 'swept'`, `0x7a5230` (medium-light brown; his mother's hair is the same value). PROPOSED: side-swept fringe, the lightest hair of the four. CDA (A-16) for exact style |
| Wardrobe (2011) | STORY CANON: **the gold shirt**, **olive shorts** ("Alex as everyone has seen him on the flyers, the gold shirt, the olive shorts", `chapter6-cast.js`). CURRENT SOURCE: collared short-sleeve shirt `0xd4b25a` with cream trim/collar and three buttons, shorts `0x5d6a4a`, white socks, dark shoes `0x3d4450`. The gold shirt is found wet in Owl (Ch5), carried by Sam (Ch6). **Continuity question:** what Alex wears when rescued in Ch8 if his gold shirt was left at the camp — CDA (A-17) |
| Accessories | His camera (`dist/alex-camera.js` `makeCameraModel` — the one shared builder, good), flip phone (Ch3 recordings), red bike helmet on his desk (Ch3), the bell on his bike |
| Bike | `bike.alex`: cruiser, frame `0x8a8f3f` (olive green — STORY: "the green cruiser, the rack, the bell"), swept bars, brown saddle `0x5a3a28`, cream grips `0xd8cfb8`, rack, bell, rear reflector (broken out of its clip — the Chapter One clue), evidence tag on the seat post (Ch8) |
| Default posture | Upright, balanced, centered; rides evenly (`all ride factors 1`) |
| Default expression | Soft closed smile |
| Mannerisms | Rings the bell twice; looks off toward sounds others don't hear (Ch2 memory: he stopped and looked toward the creek); photographs things |
| Final-scene standards | Injured (the lid across his back), exhausted, weak, emotionally present, supported by Sam and the protagonist; eye contact with the player; human dialogue delivery ("We were supposed to go riding tomorrow."); then genuinely still: head dropped, no breath, no blink; no artificial collapse, clipping hands, stiff hug or exaggerated crying (contact tests: `tests/art-contacts.mjs` oak embrace) |
| Known inconsistencies | Line Two figure geometry differs (cursed Ch6 model); portrait/prints are canvas drawings; shirt continuity at rescue unresolved |
| Files | `dist/cast.js` (`alex`), `dist/astra-anatomy.js`, `dist/faces.js`, `dist/friends.js`, `dist/chapter3.js`, `dist/chapter4.js`, `dist/chapter6-cast.js`, `dist/companions.js` (Ch8), `dist/chapter8-finale.js`, `dist/alex-camera.js`, `dist/alex-room.js`, `dist/aftermath1-props.js`, `dist/aftermath1-places.js` (memorial portrait) |
| Approvals | A-02, A-15, A-16, A-17 |

### 3.5 Distinctness matrix (PROPOSED; the four must never look like one model; heights: CDA A-41)

| | Protagonist | Jamie | Sam | Alex |
|---|---|---|---|---|
| Silhouette marker | Plain short hair, average | **Cap** (backwards riding), sturdy | **Shaggy hair**, slim, hunched | **Swept fringe**, upright |
| Height (proposed) | 1.52 | 1.55 | 1.50 | 1.54 |
| Face shape | Oval, neutral | Round, full cheeks | Long, narrow | Soft, wide-set eyes |
| Nose | Button (CURRENT) | Button | Straight | Button |
| Resting mouth | Lopsided neutral | Grin | Flat | Closed smile |
| Shirt | Dusty blue | **Orange** | Sage-teal | **Gold, collared** |
| Bike | Teal-gray road-kid | **Rust-red BMX** | Steel-teal MTB | **Olive cruiser** |
| Riding | (player) | Stands, weaves, looks back | Seated, steady | Even, upright |

Note: the protagonist and Jamie and Alex all currently use `nose 'button'`; protagonist and Jamie share eye gap `.036` and eye height `.012`. The final designs must separate them further (A-01, A-09, A-15).

---

## 4. Recurring adults

Every adult below needs an approved identity sheet before Phase Two. Their current specs are evidence; several are derived from another character's spec (marked **DERIVED**), which is the main adult identity defect.

### 4.1 Officer Reyes — `chr.reyes`

| Field | Value |
|---|---|
| Role | The police officer who stays; witness to everything; keeps the evidence; tries CPR on Jamie; covers him with his jacket; stays with Alex |
| Appearances | Ch1 (as `ADULTS.officer2` at Alex's house), Ch2, Ch4–Ch8, Aftermath I (every act) |
| Age | Not established. PROPOSED: late 30s–40s. CDA (A-18) |
| Current source | `ADULTS.officer2`: name field `'OFFICER'` (displayed as OFFICER REYES in captions), scale 1.2 (≈1.84 m), `jaw .9, cheek 1, nose 'broad'`, skin `0x9a6a4c` (medium-deep brown), hair cropped `0x171310` (black), iris `0x1e140e`, build `bulk 1.08, shoulders 1.1`. Navy uniform shirt `0x27324a` with collar, dark trousers `0x1c2232`, radio on the chest in Ch6, flashlight/phone/radio gestures |
| Story wardrobe | Uniform; "his hat off" (Ch8 oak, so a hat exists in that scene — CDA A-18 whether modeled); his jacket covers Jamie (`mourningCoat` `0x1b2232`) and later his coat over Alex |
| Design direction | Responsibility, exhaustion, restraint. A steady face that rarely moves; grief shows as stillness, a hand to the face, sitting down. Hands of a working adult |
| Conditions | `+tired`, `+dust`, `+soot`, wet (works), blood on hands after CPR (non-graphic, CDA) |
| Inconsistencies | Face/hair geometry changes by chapter: Ch1–5 `refineAdult`; Ch6 `chapter6Appearance` model; Ch7 Ch6 model + `portrait` overlay; Ch8 back to `refineAdult`; Aftermath I `refineAdult` + `adultFace` |
| Files | `dist/people.js`, `dist/adult-art.js`, `dist/adult-sculpt.js`, `dist/chapter6-models.js`, `dist/chapter7-portraits.js`, `dist/aftermath1-acting.js`, `dist/astra-environment.js` (jacket) |

### 4.2 Mr. Brandt — `chr.brandt`

| Field | Value |
|---|---|
| Role | Township public-works man who knew the works as plumbing; reads Procedure 7; breaks his leg; carried up by Reyes |
| Appearances | Ch6, Ch8 (works, operation), Aftermath I (leg in a cast at both remembrances) |
| Current source | `ADULTS6.brandt`: scale 1.2, `jaw 1, nose 'broad', ears 1.04`, skin `0xc8957a`, hair cropped gray `0x9a958c`, iris `0x3a4a52`, bulky. Yellow long-sleeve collared work shirt `0xd2c232` with two reflective bands, olive work trousers `0x3e4436`, brown work boots |
| Direction | Older working man (PROPOSED: late 50s–60s, CDA A-19): weathered skin, heavy hands, reading glasses? (CDA — not established). Practical, gruff, ashamed once he knows |
| Conditions | Broken leg (Ch8), `+cast` (Aftermath I), lawn chair/aisle seated |
| Files | `dist/chapter6-cast.js`, `dist/chapter8-finale.js` |

### 4.3 Jamie's mother — `chr.jamie-mother`

| Field | Value |
|---|---|
| Role | Calls Jamie in at the door in the Prologue; Chapter Seven conversation ("His orange shirt…"); Aftermath I shelter, porch, vigil; may receive Jamie's cap |
| **Conflict (verified)** | Two different models. **Prologue:** `CAST.mom` via `createPerson` (not `createActor`) in `friends.js`: primitive rig head (not the adult sculpt), ponytail `0x6b4a2a`, skin `0xd6a57f`, red short-sleeve shirt `0x9c3b3b`, jeans `0x3d4a66`, scale 1.13. **Ch7 → Aftermath I:** `JAMIE_MOM` (`chapter7-cast.js`) = **DERIVED from Alex's mother** (`{...ADULTS.mom}`) with hair `0x5a3a22`, skin `0xd6a57f`, browTilt .2, shirt `0x8a5a7a` (mauve), pants `0x2e3442`, long sleeves; adult sculpt |
| Direction | Her own face (not Alex's mother's). Family resemblance to Jamie: skin, eye color, round cheeks, warmth. Grief: open, physical, can't stop touching his things; she leaves the porch light on. CDA (A-22) final identity and which hair color is canon |
| Files | `dist/cast.js`, `dist/friends.js`, `dist/chapter7-cast.js`, `dist/aftermath1*.js` |

### 4.4 Alex's mother — `chr.alex-mother`, and Alex's father — `chr.alex-father`

| Field | Alex's mother | Alex's father |
|---|---|---|
| Current source | `ADULTS.mom` ("ALEX’S MOM"): scale 1.14, `jaw .84, nose 'button'`, skin `0xe2b898`, ponytail `0x7a5230`, iris `0x4a5a3a`, long-sleeve `0xc9b9a8`, pants `0x3a4252` | `ADULTS.dad`: scale 1.21, `jaw .96, nose 'button'`, skin `0xd8ad8c`, swept `0x5a3f28`, iris `0x4a5a3a`, collared `0x7f8f9c`, khakis `0x8c7b5e` |
| Appearances | Ch1, Ch3 (talks about the bell), Ch6, Aftermath I (shelter, garage, his room, memorial) | Ch1 onward; Aftermath I (prints every picture; memorial; the camera; the Sunday print) |
| Direction | Her grief is quiet and composed in public, collapsing in private (his room, end of the bed) | Grief through work: printing, hanging the boards, organizing; breaks once |
| Notes | Her face is the template for two other mothers today (Sam's, Jamie's) — **must be separated** | Shares Alex's eye color; keep |

### 4.5 Sam's father — `chr.sam-father`; Sam's mother — `chr.sam-mother`

| Field | Sam's father | Sam's mother |
|---|---|---|
| Current source | `ADULTS6.samDad`: scale 1.2, `jaw .95, nose 'straight'` (shares Sam's nose type), skin `0xd9b394`, swept `0x4a4038`, collared navy `0x2c3a58` | `chapter4.js` inline: **DERIVED from Alex's mother** (`{...ADULTS.mom}`) — identical face, skin `0xe2b898`, iris `0x4a5a3a`; only hair `0x4a3626` and shirt `0x7a94a8`/pants changed |
| Appearances | Ch6–Ch8, Aftermath I (carries things out of the house; their house is RESTRICTED) | Ch4, Ch7 (her lines), Ch8, Aftermath I |
| Direction | Practical, protective; stays in Oak Hollow | Her own face; resemblance to Sam (narrow face, dark eyes) — CDA (A-11) |

### 4.6 The protagonist's mother — `chr.protagonist-mother`

| Field | Value |
|---|---|
| Current source | `ADULTS9.mom` (Aftermath I): name `'MOM'`, scale 1.14, `jaw .85, nose 'button'`, skin `0xd9a883` and hair `0x5a4030` (both match the protagonist), iris `0x3a3020` (matches), ponytail, long-sleeve `0x4f6f7a` |
| Appearances | Aftermath I (shelter, kitchen with the letter, packing, the drive out). Earlier chapters: voice/phone only (verify per chapter) |
| Direction | Worry and protectiveness; tired competence; the kitchen-table scene is her key close-up |
| Note | Name collision: `CAST.mom` (Jamie's mother) and `ADULTS9.mom` are both named `'MOM'` in data; `adult-sculpt.js` keys the female head on `name.includes('MOM')` (audit §2.4). Canonical IDs fix this |

### 4.7 Mrs. Lange — `chr.lange`

| Field | Value |
|---|---|
| Role | Chapter Seven: the figure in No. 5 Old Mill Court (Evelyn Lange, taken April 1974 per the anchor board `E.L. · T.L. — 4/74`); the one close-range scare (out of the bathroom, fast, bent forward) |
| Current source | `MRS_LANGE` (`chapter7-cast.js`), `createPerson` + face; scale 1.1, `browTilt .22`, skin `0xdcc4ae`, gray bun with pins, housecoat (`chapter7-portraits.js` `housecoat`), elder lid/mouth behavior |
| Direction | Recognizable as an ordinary elderly woman from 1974 (period housecoat, pinned bun) before she becomes frightening; the fear comes from wrong timing and posture (bent forward, too fast, mouth held open), not from a monster face. Her figure must match the established character every time it appears |
| Note | Story status of the figure (a made reconstruction vs. Evelyn herself) follows Chapter Seven/Eight canon; do not add new lore |

### 4.8 The Hendersons, Mrs. Pruitt, Mr. Davis

| Character | Current source | Notes |
|---|---|---|
| Mrs. Henderson | `ADULT('MRS. HENDERSON', shirt 0x7a5a8a, pants 0x2e3446, hair 0x5a3a24, skin 0xd9ad8c)` — **defined twice** (`chapter8-fall.js` seed 81 and `chapter8-street.js` seed 181) | Female face uses the male rings (name does not contain "MOM") |
| Mr. Henderson (Lily's grandfather — "my father-in-law") | `ADULT(..., hair 0xc8c4bc, skin 0xd2a68a, scale 1.14, old)` — defined twice | Elderly; trapped in the garage end; Jamie saves him |
| Lily Henderson | `{...CAST.kid, name:'LILY', scale .76/.78, pink shirt}` — **the hoop kid's spec** (a boy's cropped hair and face) through `createActor` → **adult head sculpt on a child** | She heard about "Biscuit"; her drawing of the dog goes to Jamie's mother. Needs her own child identity (A-23) |
| Mrs. Pruitt | `ADULT('MRS. PRUITT', …, hair 0xd8d4cc, old)` in Ch8 | Distinct from `ADULTS.pruitt` = **Mr.** Pruitt (Ch3). Relationship not established — CDA (A-23) |
| Mr. Davis | `ADULT('MR. DAVIS', …, skin 0x9a6a4c)` in Ch8 | On his porch at dawn; at the vigil |

### 4.9 Other recurring or named adults (lower priority; identities required before their chapters are rebuilt)

`ADULTS.officer` (the other officer), Mr. Huang, Mrs. Delaney, Mr. Okafor, Mr. Pruitt, the Chapter Two searchers (`vol1–5`), the Chapter Four Main Street people (`town-life.js`: Mrs. Kowalski the florist, Mrs. Albright the librarian, the shop owner), the firefighters, the paramedic, the shelter volunteer, the Chapter Seven dining-room family (mother, father, girl, boy), the county/state crews in Aftermath I. Is the florist Mrs. Kowalski the same family as the Kowalskis' burned house? Not established — CDA (A-23).

---

## 5. Grief and emotional performance — individual behavior (PROPOSED)

No two grieving characters share a loop. Each has a pattern (posture, hands, breath, gaze, voice timing).

| Character | Pattern |
|---|---|
| Sam (Ch8 → Aftermath I) | Contained: shoulders drawn in, head down, crying in waves with long silent stretches; speaks in fragments; anger later is tight and quiet, then breaks |
| Protagonist (first person) | Breath catches, camera dips, hands tremble on the bars; never melodramatic |
| Jamie's mother | Open, physical: holds his things against her chest, rocks, touches the cap or the bike; her face moves |
| Alex's mother | Held in public: very still, hands clasped; private collapse in his room (end of the bed) |
| Alex's father | Busy hands: printing, straightening boards; one moment where he stops and can't continue |
| Reyes | Restraint: stillness, a hand pressed over the eyes, sitting or kneeling suddenly; looks away to compose himself |
| Sam's parents | Protective, practical; relief that Sam lived mixed with guilt in front of the other families |
| Protagonist's mother | Worry turned into logistics; softens only at the kitchen table |
| The Hendersons | Gratitude and confusion; they "remember the night differently on different days" — let their faces be uncertain |
| Brandt | Shame and exhaustion; won't meet eyes |

---

## 6. Scenes that need special animation beyond the shared set

| Scene | Requirement |
|---|---|
| Prologue departures | Jamie drops his bike on the lawn and runs in; Sam rides into the garage and parks; Alex rings twice and waves while riding |
| Ch7 Jamie grabbed / dragged | Ankle in the hunter's `grab` socket, heels dragging, hands clawing at grass |
| Ch8 rescues | Sam through the drained wing; Jamie through the slot; Alex's two-handle door |
| Ch8 Hendersons | Kicking a window, jacking a header, holding a fallen beam overhead (`chapter8-acting.js` `overhead`, `heave`) |
| Ch8 Jamie's death | Thrown down; still; CPR cycle (Reyes); covering with the coat; kneeling grief (Sam); holding his hand (protagonist) |
| Ch8 hatch | Alex holding the chain from below; the lid; being lifted out |
| Ch8 oak | Seated against the trunk, supported; hand-holding; embrace after death |
| Ch8 last ride | Two riders, Sam crying while riding, head low over the bars |
| Aftermath I | Cots (sit, lie), blankets, cups in both hands, clipboards, the cast leg out, arms round a child, hand on shoulder (`aftermath1-acting.js` `ACT9`); the chain repair (kneeling, bike upside down); carrying boxes; the wave goodbye from a bike with a foot down |
| Aftermath II (planned) | Adult reunion: handshake turning into a hug, walking the old street, sitting at the oak |

---

## 7. Photographs, portraits and depictions

STORY CANON: Sunday at the oak (four bikes), the three of them at Alex's door, Jamie's wallet/school picture, Alex's school portrait at his memorial, the June photo-booth strip (four frames, four boys, one helmet), the group photo in Sam's room (Ch7), Alex's last picture (the three of them at the fire, from the trees), Alex's prints (two sets).

**Rule:** every depiction of a canonical character (photo, print, portrait, flyer picture, TV image) is produced from that character's canonical model in an appropriate wardrobe, rendered to texture with photographic lighting and the period camera look (2011 point-and-shoot: slight flash falloff, date stamp where story shows it, mild JPEG softness), then printed onto the prop. The current Aftermath I canvas drawings (`aftermath1-props.js` `kid()`) and the Chapter Seven render (`chapter7.js` studio + `WebGLRenderTarget`) disagree; the render approach is the one to standardize (PROPOSED; A-25).

---

## 8. Character consistency matrix (verified against source; abbreviations below)

Abbreviations: **RIG** = `rig.js` primitive parts; **BOY** = `astra-anatomy.js` boyModel; **FACE** = `faces.js`; **AA** = `adult-art.js` refineAdult + `adult-sculpt.js`; **C6** = `chapter6-models.js` chapter6Appearance; **PT** = `chapter7-portraits.js` portrait; **AF** = `aftermath1-acting.js` adultFace; **CV** = 2D canvas drawing.

| Character | Chapter(s) | Model source | Rig | Hair | Face geometry | Skin material | Clothing | Animation | Current inconsistencies | Proposed canonical source | Migration | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Protagonist | All | BOY via `game.js` self | RIG IK | BOY (cropped) | BOY (head shadow-only) | BOY skin `roughness .68` | BOY cloth shader | `game.js`, `on-foot.js`, `physical.js` | Photos: CV (A1) vs render (Ch7) | `chr.protagonist.a12` | Skinned hero mesh, same pose contract; hands hero LOD | CDA A-01–04 |
| Jamie | Pro–Ch8; A1 depictions | BOY | RIG IK | BOY cap; uncapped = generated cropped | BOY + FACE | BOY | BOY; Ch7 PT shirt transfer skipped for boys | `friends.js`, `companions.js`, `chapter8-acting.js` | Cap orientation; 4 cap prop builders; Ch6 double = C6 cursed; photos CV | `chr.jamie.a12` | Hero mesh; cap as attachment with riding/foot states; double = same mesh + cursed behavior | CDA A-05–09 |
| Sam | Pro–Ch6, Ch8, A1; A2 planned | BOY | RIG IK | BOY shaggy | BOY + FACE | BOY | BOY | as above + `aftermath1-acting.js` | Ch6 double = C6 cursed; skin vs parents; photos CV | `chr.sam.a12`, `chr.sam.a22` | Hero mesh; adult derived | CDA A-10–13, A-21 |
| Alex | Pro, figures Ch3–4, Ch6 figure, Ch8; A1 depictions | BOY (Ch3, Ch4); C6 cursed (Ch6 figure) | RIG IK | BOY swept | BOY + FACE | BOY | BOY | `friends.js`, `chapter3.js`, `chapter4.js`, `companions.js`, `chapter8-finale.js` | Line Two figure geometry; photos CV; shirt at rescue | `chr.alex.a12` | Hero mesh; figures use same mesh | CDA A-15–17 |
| Reyes | Ch1–8, A1 | RIG + AA | RIG IK ×1.2 | AA | AA → C6 (Ch6) → C6+PT (Ch7) → AA (Ch8) → AA+AF (A1) | `rig.js` material / C6 vc | RIG torso + AA | `people.js` actor gestures | Face changes per chapter; child proportions | `chr.reyes` | Adult skeleton; one face system | CDA A-18 |
| Brandt | Ch6, Ch8, A1 | RIG + AA (+C6 in Ch6–7) | RIG ×1.2 | AA | AA / C6 | as above | Vest bands as torus rings | actor | Per-chapter face; band rings are primitives | `chr.brandt` | Adult skeleton; authored vest | CDA A-19 |
| Jamie's mother | Pro; Ch7–A1 | Pro: RIG only (`createPerson`); Ch7+: RIG + AA (+C6+PT in Ch7, +AF in A1) | RIG ×1.13 | Pro: rig ponytail `0x6b4a2a`; Ch7+: AA `0x5a3a22` | Two different faces | — | Pro red shirt; Ch7 mauve | `friends.js`; actor | **Two identities**; DERIVED from Alex's mother | `chr.jamie-mother` | New identity | CDA A-22 |
| Alex's mother | Ch1–A1 | RIG + AA (+C6/PT/AF) | ×1.14 | AA | AA etc. | | | actor | Face reused for Sam's and Jamie's mothers | `chr.alex-mother` | Keep, but unique | CDA A-22 |
| Alex's father | Ch1–A1 | RIG + AA (+C6/PT/AF) | ×1.21 | AA | | | | actor | Per-chapter face | `chr.alex-father` | | CDA |
| Sam's mother | Ch4, Ch7, Ch8, A1 | RIG + AA, DERIVED from Alex's mother | ×1.14 | AA | = Alex's mother | | | actor | Same face as Alex's mother | `chr.sam-mother` | New identity | CDA A-11 |
| Sam's father | Ch6–A1 | RIG + AA (+C6/PT) | ×1.2 | AA | | | | actor | Per-chapter face | `chr.sam-father` | | CDA A-11 |
| Protagonist's mother | A1 | RIG + AA + AF | ×1.14 | AA | | | | actor | Name collision `'MOM'` | `chr.protagonist-mother` | | CDA |
| Mrs. Lange | Ch7 | RIG + FACE (+C6/PT elder) | ×1.1 | PT bun | C6 + PT elder | | PT housecoat | `chapter7-lange.js` | Not built by `createActor` (no AA); unique path | `chr.lange` | Adult (elder) skeleton | CDA |
| Hendersons | Ch8, A1 | RIG + AA (two definitions) | ×1.14–1.16 | AA | AA male rings for Mrs. | | | actor | Duplicate actors per Ch8 module | `chr.henderson-*` | One instance set | CDA A-23 |
| Lily | Ch8, A1 | `CAST.kid` + AA (adult head) | ×.76–.78 | AA (boy's cropped) | Adult sculpt on a child | | | actor | Boy's spec; adult head; duplicate | `chr.lily` | Child skeleton, own identity | CDA A-23 |
| Shelter crowd (96) | A1 | `shelter-crowd.js` instanced lofts | none (pose loops) | lofted | none (no faces) | | Varied colors | loops | Separate realism tier | `chr.crowd.*` | Shared skinned crowd bases, LOD faces | PROPOSED |

---

## 9. Identity test requirements (for the future implementation)

See [`VISUAL-QA-ACCEPTANCE.md`](VISUAL-QA-ACCEPTANCE.md) §5. In short, for each `chr.*` ID: identical identity geometry hash, skeleton, material parameters and attachment set in every chapter, transition and DEV start; differences only from declared variants; a face-landmark capture at a fixed camera in each chapter compared numerically; and a human lineup check per milestone.
