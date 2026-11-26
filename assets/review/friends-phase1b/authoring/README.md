# Authoring the four-friend checkpoint

Open the individual `jamie-rig.blend`, `sam-rig.blend` or `alex-rig.blend` master in Blender 5.2.2. Select **FriendRig** and choose an action in the Action Editor. The bicycle in the scene follows the crank and steering channels. The three game assets are under `dist/assets/chr`. The review gallery opens directly from disk.

## Rebuild one character

The recovery ZIP contains `inputs/protagonist/Player-2011-rig.blend`, the three original character-specific Phase 1A masters under `inputs/phase1a`, and the integration tree under `project`. From the project directory the following example rebuilds Jamie in a new output folder. Repeat with the matching name and bicycle for Sam and Alex. Blender supplies NumPy, and the external atlas step uses Python with Pillow.

```powershell
$art='assets/review/friends-phase1b/authoring'
$key='jamie'
$out="rebuild/$key"
$motion="rebuild/$key-actions.json"
blender -b --factory-startup --python-exit-code 1 --python "$art/fit.py" -- ../inputs/protagonist/Player-2011-rig.blend "../inputs/phase1a/$key/chr.$key.a12.blend" $key $out
python "$art/atlas.py" $out
node "$art/sample.mjs" $key $out $motion
blender -b --factory-startup --python-exit-code 1 --python "$art/bake.py" -- "$out/$key-rig.blend" $motion
blender -b --factory-startup --python-exit-code 1 --python "$art/export.py" -- $out "rebuild/chr.$key.a12.glb"
blender -b --factory-startup --python-exit-code 1 --python "$art/studio.py" -- $out "dist/assets/bike/bike.$key.glb" $motion
```

The fit script uses the per-finger rotations in `grip-calibration.json`. The optional browser fitting program derives them on the high-detail game mesh. For motion inspection from a served checkout, open `dist/friends-1b-review.html`. It uses the embedded actions and matching authored bicycle.

## Tests and recording

Run `node tests/friends-phase1b.mjs PATH_TO_OFFLINE_HTML RESULT.json` from the repository root. The test starts a local server and closes it afterward. It supports Playwright via `PLAYWRIGHT_PATH` and a browser executable via `CHROME_EXECUTABLE`. The capture scripts use the same environment variables. They save JPEG sequences and any game soundtracks under `review-capture/footage`. Pass the capture directory, destination and clip names to `encode.py` using Blender’s background Python. Browser and Blender versions affect pixel output.

To reproduce the offline HTML, set `PLAYTEST_MENU=1` and `PLAYTEST_MODELS=1` and run `node tools/package-playtest.mjs ../offline`. Place the supplied `START-HERE.html` next to the generated `Last-Light-Playtest.html`. The integrated game also accepts `?bikes&houses&vegetation&pavement&streetprops&details&player1b&friends1b`.
