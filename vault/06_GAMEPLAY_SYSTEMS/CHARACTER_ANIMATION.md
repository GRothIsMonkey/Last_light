# Character animation

## The rig ([dist/rig.js](../../dist/rig.js))

"Kid-scale people and bicycles. A pose is a small array of IK targets, so any two poses blend without stretching limbs,
and feet can be planted exactly." Bone lengths are shared (`BODY`) so every pose fits every bike; each person's
silhouette, face, hair, clothes and riding manner come from `CAST` ([dist/cast.js](../../dist/cast.js)).

- Pose functions: `standPose`, `walkPose`, `sitPose`, `newPose`, `blendPose`, `copyPose`, `applyPose`; IK targets `P`.
- Riders: hands within ~1.7 cm of the grips, feet exactly on the pedals; standing riders roll the torso at most ~13°
  against the bike.
- Departures, mounting (the dismount reversed), kickstands, bike lifts, window climbs (Ch1), pebble throws.
- Gestures layered on a copy of the pose (never accumulated): `tense`, `recoil`, `crouch`, `fold`, `hips`, `phone`, `radio`,
  `flashlight`, `talk`, `point`, `wave`…

## Faces

| Chapters | System |
|---|---|
| 0–4 | Heads are single merged meshes (eyes, brows, nose, mouth, ears) built by `headGeometry`; friends blink on separate timings; Chapter Three's art pass added refined heads (`chapter3-art.js`) |
| 5 only | **Expressive faces** ([dist/faces.js](../../dist/faces.js)): the mouth and brows are dynamic meshes on the head (two draw calls a face); 19 expression presets; blinking; **text-timed mouth movement** (one opening per vowel group, shut on m/b/p, pauses at punctuation); lines carry `face:` cues. `speakAudio(env, rate)` is the hook for future audio lip sync. Switched on by `face.enable(true)` in Chapter Five only. |

**Provisional:** expressions are geometric (brow angles, mouth shapes); mouths are small and low in contrast (vanish
beyond ~3 m); brows hide under Sam's fringe and Jamie's cap brim. A Chapter Three/Four regression where resets put simple
heads back over detailed ones was fixed in the final audit (`enable()` does nothing when unchanged).

## Adults

`dist/people.js` (actors: place, walk a path, turn, head-look, gestures, per-foot ground contact) and
`dist/adult-art.js` (adult face and torso geometry, collars, pockets, badges, belts, radios). No lip sync; small speaking
movements; gestures layered on a standing pose (stiff, accepted).

## The creature

Procedural gait with planted contacts and two-bone IK on the asset's own skeleton, over its idle clip. See
[Smiling creature behavior](../05_HORROR_DESIGN/SMILING_CREATURE_BEHAVIOR.md).

## Standards and known weaknesses

See [Animation standards](../07_VISUAL_AND_AUDIO/ANIMATION_STANDARDS.md). The Chapter Five Astra handoff lists: tube limbs
with ball shoulders, long forearms, knock-kneed rest poses, little arm swing, crossed-arms idle crossing through itself,
blocky fists with no finger grips, stiff reach animations, the stone throw as a level shoulder swing, the mount freezing
with a foot in the air, thin idle variety.

## Contracts (keep)

- Keep `rig.js` `P` (IK targets) and `applyPose` when replacing models.
- Faces: `createFace(person, cast)`, `set(name, {hold})`, `update(dt, {talk, speech})`, `speakAudio(env, rate)`.
- `face.enable(on)` must stay switchable and must do nothing when unchanged.
