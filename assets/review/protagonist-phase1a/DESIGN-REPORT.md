# Last Light · The 2011 protagonist

**Phase 1A visual approval checkpoint**  
The unnamed twelve-year-old player, Oak Hollow, August 2011.

Start with the [riding sheet](sheets/01-riding.png), [on-foot sheet](sheets/02-on-foot.png) and [hands sheet](sheets/03-hands.png). The [character sheet](sheets/04-character.png), [clothing details](sheets/05-clothing-and-contact.png) and [four-friend comparison](sheets/06-four-friends.png) show how the same child works in photographs. All pictures on the sheets come from the included full-resolution Cycles renders.

## 1. Source and starting point

The Blender starting point was commit `93f246186e94225a5d6353ad5aca45eec72edd4e` on `codex/astra-phase1a-alex-character-design-fix1`, the latest local cast checkpoint. It holds the approved Jamie and Sam sources and the revised Alex. The character checkpoint supplied the connected neutral body, wardrobe construction, footwear and common lighting. The underlying anatomical source is *Child* by gelmi.com.br. The original GLB and attribution accompany this package. [Source and change notice](source/PROVENANCE.md)

Gameplay references came from `GRothIsMonkey/Last_light`, branch `claude/prologue-grass-lawn-ground-repair`. The following references informed the design.

| Reference | Consequence for this model |
|---|---|
| `docs/art/CHARACTER-CANON.md` §3.1 and the existing Jamie, Sam and Alex design reports | Preserve the young witness as the average-build cast reference. Give him a complete face and body for the Chapter Seven photographs and Aftermath I prints. |
| `dist/cast.js` | Use the player’s own palette, crop, short-sleeved summer clothes and teal-gray road bike. |
| `dist/rig.js` | Reconstruct the grip, crank, wheel and saddle positions. The runtime’s shared limb lengths, two-segment IK and simplified hands work as placement references, while close views require all five digits. |
| `dist/on-foot.js` | Keep one body below the eye. Account for the downward eye dip, stance offset, crouch and right-hand flashlight. |
| `dist/game.js` | Preserve the identity of the one player body as it transfers between the bike and walking. |
| `dist/physical.js` | Show distinct approach, touch and hold states for props. A hand that reaches and a hand that bears load need different finger shapes. |
| `dist/astra-anatomy.js` | Follow the existing body proportions and joint landmarks while carrying the surface continuously across the wrist and elbow. |

## 2. Working branch

The isolated local branch is `codex/astra-phase1a-protagonist-character-design`. The design lives under `assets/review/protagonist-phase1a/`.

## 3. Canon preserved

The player remains unnamed, identified as “YOU” in the cast. His light-medium complexion is warm, his eyes brown and his hair medium brown. The design adopts the canon’s proposed **1.52 m** reference stature for a twelve-year-old of average build. The summer palette follows `CAST.player` for the dusty blue shirt, darker trim, muted blue shorts, white socks and off-white shoes. He carries no permanent accessory that would conflict with a later photograph or chapter.

## 4. Changes to the shared foundation

The upper torso and shoulder width were adjusted to the player’s build. The facial sculpt, expression, pigment maps, groom, jersey neckline and clothing palette are specific to him. Both hands keep their connection to the forearms and gain nail beds, local pigment and joint creases. The first-person scene uses the same underlying body and clothes. Static pose shapes change the hand, arm, lower body and garments for each study. The face and scalp are retained in the full-character source.

## 5. Hand design

The thumbnail, index nail and progressively smaller little fingernail follow the actual fingertip surfaces. Short free edges, pinker knuckles, shallow dorsal folds and the warmer palmar pads carry across the poses. A separate landmark map places finger and palm detail in anatomical coordinates. The nail plates and crease geometry follow the subdivided skin when the fingers curl.

On the bars, four fingers wrap the rubber while the thumb opposes them. For the bell, the left thumb changes direction while the other fingers stay curled. The larger graphite flashlight sits across the right palm, with the four fingers spaced down the barrel. A small round token tests opposition between the index and thumb. The door has separate reach, push and return-handle poses. The companion hand is a contact-study copy using Sam’s skin and hand topology. The scene illustrates hand scale and contact without assigning a new story event.

## 6. First-person embodiment

The bike uses 0.31 m wheel radii and 0.15 m cranks. The bar reference is 1.02 m above the ground and roughly 0.28 m to each side. The left bell, solid grips, brake levers and true pedal platforms establish surfaces that the limbs can actually touch. The alternate crank phase reverses the higher knee. The side inspection isolates the shoe sole and pedal tread.

The on-foot views use a standing eye reference near 1.40 m and a forward/downward eye shift for looking over the chest. The four downward studies show rest, a step, a crouch and carrying the 17 cm flashlight. Close lenses, forward eye offsets and the shared studio ground were chosen for review. The resting-hand, wrist-profile and shoe-contact cameras are external inspection views. Frame numbers correspond to the PNG prefixes in `first-person/`. Opening the preview scene and moving through frames 1–20 switches the camera, pose and contact props.

## 7. Clothes and materials

The jersey has a bound crew neck, hem stitching, sleeve seams and a darker blue edge. The short sleeves move with the upper arm. The shorts have a joined rise, waistband, separate hems and pocket seams. Ribbed crew socks meet the padded shoe collar. The sneakers retain independent uppers, laces, eyelets, overlays, midsoles and outsoles. The cream rubber reads against both the grey ground and the dark pedal tread. The [evening photograph](renders/08-golden-hour.png) gives a second lighting reference for the same clothes and skin.

## 8. Hair

The short, slightly grown-out crop uses 74,142 editable native hair curves. The cut lengths vary locally, with small groups curving together across the fringe and temple. Individual tips break the lower edge. The compact crown and brown colour distinguish him beside Alex’s taller swept hair, Sam’s darker shag and Jamie’s cap.

## 9. Face, photographs and later identity

The resting face has a short rounded nose, slight differences between the two mouth corners, soft cheek planes and a quiet gaze. The expression control lifts the mouth and lower lids together. The complete head, eyes, brows, groom and body can be photographed from any side. Eye spacing, iris colour, nose and ear shapes, the uneven resting mouth, finger-length ratios and nail outlines are landmarks for the future 2021 and 2026 designs.

## 10. Cast consistency

The lineup runs left to right as Jamie, Sam, Alex and the player. All four stand on the same floor with unscaled character roots, the same orthographic camera and the same directional lights. A second closer composition compares the faces under those lights. The other three characters came directly from the parent checkpoint. The cast studio packs their materials and textures for local review.

## 11. Limits and Phase 1B handoff

These are twenty individually authored still views. They establish target silhouettes, joint angles and contacts at the pictured poses. Continuous steering, the complete pedal revolution, transitions between hand states, dynamic collision, moving-partner grip, camera clipping across the full look range and real-time performance still need engine testing. The preview contains static pose shapes and camera selection on the timeline. Production skin weights, runtime LODs, chapter-specific wardrobe and injury variants, and the 2021 and 2026 bodies remain future work. Visual approval is the next decision.

## Editable sources

| File | Contents |
|---|---|
| [Full character](models/protagonist/chr.protagonist.a12.blend) | Editable mesh, groom, materials, hands, expression, wardrobe and studio cameras |
| [First-person studies](models/protagonist/first-person-studies.blend) | Twenty camera markers, static pose shapes and contact props |
| [Four-character studio](comparison/four-friends.blend) | Packed same-scale comparison of the four boys |
| [Texture maps](models/protagonist/textures/) | Seven external player PNGs, also packed in the character scene |
| [Verification](VERIFICATION.md) | Source, image, contact and recovery checks |

Each of the three `render-*.py` scripts can be run with Blender in background mode from an extracted copy of this folder.
