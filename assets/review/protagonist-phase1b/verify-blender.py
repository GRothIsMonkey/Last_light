"""Verify the recovered native scenes and motion videos with Blender in background mode."""
from pathlib import Path
import json
import bpy

folder = Path(__file__).resolve().parent
model = folder / "Player-2011-rig.blend"
expected = {"Idle", "Walk", "Run", "RunLight", "Cycle", "Bell", "Steer", "Brake",
            "Dismount", "Crouch", "GaitChanges", "RunStop", "RideToWalk"}
bpy.ops.wm.open_mainfile(filepath=str(model))
scene = bpy.context.scene
rig = bpy.data.objects["PlayerRig"]
assert len(rig.data.bones) == 59
assert expected == {a.name for a in bpy.data.actions}
images = [im for im in bpy.data.images if im.source == "FILE" and im.users]
assert len(images) >= 7 and all(im.packed_file for im in images)
for action in bpy.data.actions:
    rig.animation_data.action = action
    first, last = map(int, action.frame_range)
    assert last > first
    for frame in (first, (first + last) // 2, last):
        scene.frame_set(frame)
        assert all(abs(value) < 100 for bone in rig.pose.bones for row in bone.matrix for value in row)
print("Recovered player", len(rig.data.bones), "bones,", len(expected), "actions,", len(images), "packed maps")
bpy.ops.wm.open_mainfile(filepath=str(folder / "Bicycle-motion-studio.blend"))
scene = bpy.context.scene
rig = bpy.data.objects["PlayerRig"]
assert Path(bpy.path.abspath(rig.library.filepath)).resolve() == model
assert rig.animation_data.action.name == "Steer"
assert scene.frame_end == 91 and scene.camera
assert len([o for o in scene.objects if o.type == "CAMERA"]) >= 2
crank = bpy.data.objects["Control • bottom bracket"]
scene.frame_set(1)
before = (crank.rotation_euler.x, rig.pose.bones["calf_l"].matrix.copy())
scene.frame_set(14)
assert abs(crank.rotation_euler.x - before[0]) > .1
assert abs((before[1].translation - rig.pose.bones["calf_l"].matrix.translation).length) > .005
clips = {}
for path in sorted((folder / "movement-clips").glob("*.mp4")):
    clip = bpy.data.movieclips.load(str(path))
    assert clip.frame_duration >= 24 and min(clip.size) >= 400, path
    clips[path.stem] = [clip.frame_duration, *clip.size]
    bpy.data.movieclips.remove(clip)
assert len(clips) == 16
print("Recovered linked cycling scene and MP4s", json.dumps(clips))
