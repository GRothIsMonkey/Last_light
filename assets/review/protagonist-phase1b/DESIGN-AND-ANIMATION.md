# The 2011 player · Phase 1B

The player retains his Phase 1A face, short medium-brown hair, brown eyes and warm light-medium skin. His reference stature is 1.52 m. The dusty-blue shirt, darker trim, muted-blue shorts, white socks and off-white sneakers continue the summer 2011 design. The four-friends portrait places the new player beside the original Jamie, Sam and Alex in the same studio at the original scale.

## What changed

The existing hands retain their joint landmarks, nail plates and grip shapes. Nail highlights, skin response and the transition from palm pigment to forearm were refined. The new forearm twist weights share rotation with the wrist. Each finger and thumb has three independently editable joints. The flashlight, bell and bar grips use the old contact studies as landmarks.

The shirt and shorts have small fabric folds around the moving shoulder, waist and hip. Cuff thickness and stitching follow the sleeve weights. Concealed skin has an editable coverage mask to reduce breakthrough. The full-detail hair and its natural fringe remain in the Blender master. The game export uses a simpler scalp surface and strands. The shoe assembly retains its laces, seams, sole edge and sock. Foot placement was calibrated against the outsole vertices.

The standing, walking and running poses have separate joint and finger motion. Walk uses heel-to-toe roll and opposing arm swing. Run increases knee lift, arm flexion and forward lean. Cycling follows the crank, steering axis and contact positions from the game. The stopping action transfers weight to the planted foot before the player leaves the saddle.

## Reviewing the work

Open [the review gallery](REVIEW.html) for 17 motion clips, 14 Cycles renders and 11 screenshots from the playable Prologue. The labeled [first-person sheet](First-person-review.png) compares contact in the Blender studio with the actual game camera. The [four-friends portrait](blender-review/16-four-friends.png) is the cast consistency check.

Open [the bicycle studio](Bicycle-motion-studio.blend) and play frames 1–91 at 30 fps for a continuous side view. The rider camera is also available in the scene. Keep its linked [player rig](Player-2011-rig.blend) beside it. Select the PlayerRig armature and use the Action Editor to inspect or edit any of the thirteen actions. The source opens on Steer so the bicycle file can evaluate it directly. Select Idle for the standing character.

The playable flag is `?player1b`. To launch from the extracted recovery package, run `python serve-review.py` in this folder. The optional `--studio` switch opens the angle selector and scrubber. The recovery archive also supports `--environment` to launch the tested character with the upgraded Prologue neighborhood. The original Prologue inputs control the ride, dismount and on-foot movement. Press the right bracket key (`]`) while on foot to preview the held flashlight. This daytime review control attaches the existing prop to the right hand. Later flashlight acquisition, beam behavior and story states continue through the game's regular controls.

## Approval questions

Judge the player's weight as he slows and steps off the bicycle, the hands' silhouette while turning, and the timing of the feet and elbows in the run. The full cast view and the neutral portrait are ready for your visual decision alongside movement. Close inspection is especially valuable during fast leg recovery and where the upper arm crosses the sleeve. The checkpoint ends at protagonist visual and movement approval.

The prior source commit is `c7cc8c0794b82634c27b0bfcf63378487950c6cc`. Its original source package, renders, pose studies and attribution are included in the recovery archive under `assets/review/protagonist-phase1a`. [Source attribution](source/PROVENANCE.md)
