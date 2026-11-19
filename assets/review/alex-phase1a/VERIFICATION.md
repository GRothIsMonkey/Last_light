# Alex · Targeted refinement checks

The input was the local Alex approval commit `85891d7be184`. Blender 5.2.2 LTS reopened the editable source for the comparisons.

| Checked | Result |
|---|---|
| Jamie and Sam | Both Blender files and all their texture files matched the previous checkpoint byte for byte. |
| Alex’s body and wardrobe | All 5,267 body control vertices below the head transition matched exactly. All 74 wardrobe objects retained their mesh or curve geometry, placement and material assignments. |
| Hair | 74,142 editable native fibres with 32 points each. All original roots matched exactly. The highest fibre gained 11 mm. |
| Visible eye openings | Front-facing rays at the iris centres measured 10.60 and 10.40 mm before the edit and 8.35 and 7.75 mm afterward. The lid expression follows the listening-smile shape key. |
| Cameras and light | All studio and exterior light objects matched the original. Seven solo cameras matched exactly. The profile was reframed, and the previous model was rendered with that same profile camera for comparison. |
| Images | The eight solo masters and six updated group and detail renders have Blender camera and 60-sample Cycles metadata. |
| Recovery | The archive was extracted into a separate directory. Every file was compared with its SHA-256 manifest. Blender reopened the three recovered scenes and verified the 21 packed image files against their external PNGs. |

The Jamie blend SHA-256 is `e97b3401127a734a24a8754de233208674e2b40d9ba1c1f581070af30d4357b8`. The Sam blend SHA-256 is `898e9e4438fe6a9233bf25eda815d9c203775abd1be1d8f481e0a794041d9dfa`. The ZIP has a sibling SHA-256 file in the local delivery folder.
