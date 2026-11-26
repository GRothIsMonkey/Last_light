"""Blender motion review: each clip of the supporting cast rendered as a short film (offline Cycles renders of the editable
.blend, NOT the game), encoded with ffmpeg. Every file is named '--BLENDER-RENDER'.

    python3 tools/blender/supportcast/render_clips.py <character> <out_dir> [clip,clip,...]

Clips (jamie-mother): idle, door, walk, turn, call-wave, wait, return, face. (hoop-kid): dribble, shoot, catch.
The game drives the same clips from its controllers (supportcast.js); turning and the walk back in are the walk clip under
the controller's own rotation, shown here by turning the whole figure the way the controller does.
"""
import math, os, shutil, subprocess, sys
import bpy
from mathutils import Euler, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import render_supportcast as RS    # noqa: E402

FACE = RS.FACES


def ss(a, b, x):
    t = max(0., min(1., (x - a) / (b - a)))
    return t * t * (3 - 2 * t)


# name: (clip, frames [(source frame, seconds)], camera pos, target, lens, figure yaw(t) or None, face(t) or None, fps)
def mother_plan():
    side = ((3.6, -.6, 1.0), (0, 0, .86), 50)
    tq = ((2.4, -3.2, 1.05), (0, 0, .86), 50)
    face = ((.25, -.92, 1.55), (0, -.02, 1.51), 85)
    walk_frames = [(f % 36, f / 30) for f in range(0, 73)]

    def calling(t):
        call = ss(.1, .25, t) * (1 - ss(1.0, 1.2, t))
        syl = call * (.5 + .5 * math.sin(min(1, t / 1.1) * math.pi * 2.2 - 1.2))
        return {'jawOpen': .32 * syl, 'mouthFunnel': .18 * syl, 'browInnerUp': .25 * call, 'mouthSmileLeft': .6 * (1 - call * .6), 'mouthSmileRight': .55 * (1 - call * .6),
                'cheekSquintLeft': .2, 'cheekSquintRight': .18, 'browOuterUpLeft': .2 * call, 'browOuterUpRight': .2 * call}

    def faces(t):
        seq = [(0, 'neutral'), (1.0, 'smile'), (2.0, 'calling'), (3.0, 'attentive'), (4.0, 'expectant'), (5.0, 'neutral')]
        for (t0, a), (t1, b) in zip(seq, seq[1:]):
            if t0 <= t < t1:
                k = ss(t0 + .55, t1, t)
                A, Bv = FACE[a], FACE[b]
                out = {n: A.get(n, 0) * (1 - k) + Bv.get(n, 0) * k for n in set(A) | set(Bv)}
                blink = math.sin(math.pi * min(1, max(0, (t - t0 - .3) / .16))) if t0 + .3 < t < t0 + .46 else 0
                out['eyeBlinkLeft'] = max(out.get('eyeBlinkLeft', 0), blink)
                out['eyeBlinkRight'] = max(out.get('eyeBlinkRight', 0), blink)
                return out
        return {}
    return {
        'idle': ('idle_breathe', [(f, f / 30) for f in range(0, 121, 2)], *tq, None, lambda t: {'eyeBlinkLeft': 1, 'eyeBlinkRight': 1} if 2.2 < t < 2.36 else {}, 15),
        'door': ('door_open', [(f, f / 30) for f in range(0, 19)] + [(18, .6 + k / 30) for k in range(1, 16)], *side, None, None, 30),
        'walk': ('walk', walk_frames, *side, None, None, 30),
        'turn': ('walk', [(f % 36, f / 30) for f in range(0, 45)], *tq, lambda t: -math.pi / 2 * ss(0, 1.3, t), None, 30),
        'call-wave': ('porch_wave', [(f, f / 30) for f in range(0, 73)], (1.4, -2.6, 1.3), (0, 0, 1.25), 70, None, calling, 30),
        'wait': ('porch_wait', [(f, f / 30) for f in range(0, 241, 2)], *tq, None, lambda t: {**FACE['expectant'], **({'eyeBlinkLeft': 1, 'eyeBlinkRight': 1} if 3.0 < t < 3.16 or 6.4 < t < 6.56 else {})}, 15),
        'return': ('walk', [(f % 36, f / 30) for f in range(0, 61)], *tq, lambda t: math.pi * ss(0, 1.0, t), None, 30),
        'face': ('idle_breathe', [(int(f * 2) % 121, f / 30) for f in range(0, 150)], *face, None, faces, 30),
    }


def kid_plan():
    cam = ((2.0, -2.8, .95), (0, -.2, .8), 50)
    return {
        'dribble': ('dribble', [(f % 31, k / 30) for k, f in enumerate(list(range(0, 31, 2)) * 3)], *cam, None, None, 30),
        'shoot': ('shoot', [(f, f / 30) for f in range(0, 43)], *((2.4, -2.6, 1.15), (0, -.1, 1.05), 50), None, None, 30),
        'catch': ('catch', [(f, f / 30) for f in range(0, 40)], *cam, None, None, 30),
    }


def main():
    who = sys.argv[1]
    out = sys.argv[2]
    want = sys.argv[3].split(',') if len(sys.argv) > 3 else None
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=RS.BLENDS[who])
    sc, cam = RS.setup()
    sc.render.resolution_x, sc.render.resolution_y = 480, 640
    sc.cycles.samples = 20
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    head = next((o for o in sc.objects if o.type == 'MESH' and o.data.shape_keys), None)
    plan = mother_plan() if who == 'jamie-mother' else kid_plan()
    for name, spec in plan.items():
        if want and name not in want:
            continue
        clip, frames, cp, tg, lens, yaw, facef, fps = spec
        tmp = os.path.join(out, '.frames-' + name)
        os.makedirs(tmp, exist_ok=True)
        cam.location = cp
        cam.data.lens = lens
        cam.rotation_euler = (Vector(tg) - Vector(cp)).to_track_quat('-Z', 'Y').to_euler()
        for k, (f, t) in enumerate(frames):
            RS.pose(arm, clip, f)
            arm.rotation_euler = Euler((0, 0, yaw(t) if yaw else 0))
            if head is not None:
                RS.face(head, facef(t) if facef else {})
            bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(tmp, f'{k:05d}.png')
            bpy.ops.render.render(write_still=True)
        arm.rotation_euler = Euler((0, 0, 0))
        mp4 = os.path.join(out, f'{who}-{name}--BLENDER-RENDER.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', mp4], check=True)
        shutil.copy(os.path.join(tmp, f'{len(frames) // 2:05d}.png'), os.path.join(out, f'{who}-{name}-still--BLENDER-RENDER.png'))
        shutil.rmtree(tmp)
        print('clip', mp4, flush=True)


if __name__ == '__main__':
    main()
