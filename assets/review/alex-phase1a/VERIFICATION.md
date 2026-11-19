# Local checkpoint verification

Blender 5.2.2 LTS reopened the three packed sources. All 21 file textures in the scenes matched their external PNGs by SHA-256. The original 517,152-byte anatomical GLB matches the recorded attribution hash.

| Check | Result |
|---|---|
| Jamie source versus the approved Pass 2 file | Byte-identical. SHA-256 `e97b3401127a734a24a8754de233208674e2b40d9ba1c1f581070af30d4357b8` |
| Sam's anatomy, eyes, brows and wardrobe | 106 objects matched their prior geometry, transforms, material assignments and mesh shape keys |
| Sam's groom | 33,191 native fibres. The upper crown rose a median 3.33 mm, with a maximum of 4.10 mm |
| Alex's editable body | 7,093 control vertices, an anatomical A-pose reference and separate neutral and smile shapes. Skull apex at 1.542 m |
| Alex's groom | 74,142 native editable hair fibres |
| Alex's neutral clothing fit | Zero intersection pairs with the evaluated skin on the shirt, collar stand, fitted yoke, folded collar, shorts and waistband |
| Alex's hands | Zero detected intersections between separate distal fingers on both hands in the neutral pose |
| Render provenance | Eight 880 × 1100 solo masters and seven new lineup or detail PNGs with Blender camera and 60-sample Cycles metadata |
| Matched comparison | Unit-scale character roots, one orthographic camera and fixed directional lights. Whole-body views share framing and spacing |
| Recovery | The sibling ZIP was extracted to a separate directory and the restored files checked against the manifest. The restored scenes and packed textures were checked in Blender |

`SHA256SUMS.txt` lists every package file other than the manifest itself. The archive's SHA-256 is supplied alongside the ZIP.
