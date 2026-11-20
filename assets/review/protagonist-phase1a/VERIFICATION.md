# Phase 1A checkpoint verification

| Check | Result |
|---|---|
| Character scene | Blender 5.2.2 LTS reopened the 7,093-control-vertex body, ten nail plates, 74,142 groom fibres, eleven cameras and seven packed image maps. The packed player maps matched their external PNGs byte for byte. |
| First-person scene | Blender evaluated all twenty frame markers. Each selected the expected camera and body shape. The bicycle, flashlight and second hand switched with their appropriate poses. The scene contains eight packed file images, including the companion skin resources. |
| Cast | All four roots use unit scale and share ground height. The three source Blender files for Jamie, Sam and Alex matched their blobs in parent commit `93f246186e94`. All 28 file images used by the comparison scene were packed. |
| Renders and sheets | Eleven character PNGs and two cast PNGs carry 60-sample Cycles metadata. All twenty 1120 × 860 first-person PNGs carry 48-sample Cycles metadata and a camera name matching the filename. Each set contains distinct renders. All six sheets decoded successfully. |
| Pedal placement | In both crank positions, the lowest evaluated outsole vertex over each platform met the top of its tread within 0.02 mm. This measures contact with the horizontal tread at the two pictured phases. |
| Pinch | Within the token’s circular footprint, the closest sampled thumb and index pad vertices lay 1.68 mm and 1.57 mm from its centre plane. The two faces lie 1.70 mm to either side. |
| Wrist alignment | The right forearm and mean wrist-to-knuckle direction differed by about 6° in the bar grip, 9° in the flashlight grip and 8° in the companion-hand pose. Finger curl, forearm twist and the silhouettes can be judged independently in the renders. |
| Recovery | The archive was extracted to a separate folder. Every listed payload file matched the included SHA-256 manifest. The three recovered scenes reopened in Blender and passed the image, camera and scene checks above without external Blender libraries. |

`SHA256SUMS.txt` covers all package files other than the manifest itself. The ZIP has a separate SHA-256 checksum alongside the local archive. The [design report](DESIGN-REPORT.md) identifies the source branch, design decisions and remaining runtime tests.
