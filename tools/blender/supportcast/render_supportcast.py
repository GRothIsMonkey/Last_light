"""Blender review renders for the supporting cast (offline Cycles renders of the editable .blend: NOT the game).

    python3 tools/blender/supportcast/render_supportcast.py <character> <out_dir> [view,view,...] [--frames clip:frame:name,...]

character: jamie-mother | hoop-kid. Views (each a camera, a pose clip and frame, and a face): see VIEWS below.
Every file is labelled '--BLENDER-RENDER' in its name.
"""
import math, os, sys
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
BLENDS = {'jamie-mother': os.path.join(ROOT, 'assets', 'source', 'chr', 'jamie-mother', 'chr.jamie-mother.blend'),
          'hoop-kid': os.path.join(ROOT, 'assets', 'source', 'chr', 'hoop-kid', 'chr.hoop-kid.blend')}

FACES = {
    'neutral': {},
    'smile': {'mouthSmileLeft': .75, 'mouthSmileRight': .7, 'cheekSquintLeft': .35, 'cheekSquintRight': .3, 'eyeSquintLeft': .2, 'eyeSquintRight': .2, 'browInnerUp': .1},
    'calling': {'jawOpen': .42, 'mouthFunnel': .25, 'browInnerUp': .35, 'browOuterUpLeft': .3, 'browOuterUpRight': .3, 'mouthUpperUp': .2, 'eyeWideLeft': .15, 'eyeWideRight': .15},
    'attentive': {'browInnerUp': .2, 'eyeWideLeft': .12, 'eyeWideRight': .12, 'mouthSmileLeft': .12, 'mouthSmileRight': .1},
    'expectant': {'browInnerUp': .3, 'browDownLeft': .15, 'mouthPressLeft': .45, 'mouthPressRight': .4, 'mouthSmileLeft': .18, 'mouthFrownRight': .1},
    'blink': {'eyeBlinkLeft': 1, 'eyeBlinkRight': 1},
}

# name: (camera position, target, lens, clip, frame, face)
VIEWS = {
    'full-front': ((0, -4.4, 1.0), (0, 0, .86), 50, 'idle_breathe', 0, 'neutral'),
    'full-side': ((4.4, 0, 1.0), (0, 0, .86), 50, 'idle_breathe', 0, 'neutral'),
    'full-back': ((0, 4.4, 1.0), (0, 0, .86), 50, 'idle_breathe', 0, 'neutral'),
    'full-three-quarter': ((2.6, -3.5, 1.05), (0, 0, .86), 50, 'idle_breathe', 0, 'neutral'),
    'apose-front': ((0, -4.4, 1.0), (0, 0, .86), 50, 'apose', 0, 'neutral'),
    'portrait-neutral': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'neutral'),
    'portrait-smile': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'smile'),
    'portrait-calling': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'calling'),
    'portrait-attentive': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'attentive'),
    'portrait-expectant': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'expectant'),
    'portrait-blink': ((.22, -.95, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'blink'),
    'portrait-profile': ((.95, -.12, 1.56), (0, -.02, 1.52), 85, 'idle_breathe', 0, 'neutral'),
    'hands': ((.75, -.75, .95), (.17, -.04, .86), 85, 'idle_breathe', 0, 'neutral'),
    'clothing': ((1.2, -2.0, 1.0), (0, 0, 1.0), 60, 'idle_breathe', 0, 'neutral'),
    'ponytail': ((.75, .75, 1.6), (0, .05, 1.48), 85, 'idle_breathe', 0, 'neutral'),
    'posture-wait': ((2.2, -3.6, 1.0), (0, 0, .86), 50, 'porch_wait', 120, 'expectant'),
    'wave': ((1.6, -3.4, 1.2), (0, 0, 1.0), 55, 'porch_wave', 36, 'smile'),
    'walk': ((3.8, -2.0, 1.0), (0, 0, .86), 50, 'walk', 9, 'neutral'),
}


def setup(scene_samples=64):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = scene_samples
    sc.cycles.use_denoising = True
    try:
        sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception:
        pass
    sc.view_settings.view_transform = 'AgX'
    w = bpy.data.worlds.new('review') if not sc.world else sc.world
    sc.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (.20, .21, .23, 1)
    bg.inputs['Strength'].default_value = .55
    # a warm key (evening sun), a cool fill and a rim; a neutral floor
    def light(n, loc, e, size, col):
        o = bpy.data.objects.new(n, bpy.data.lights.new(n, 'AREA'))
        o.data.energy = e
        o.data.size = size
        o.data.color = col
        sc.collection.objects.link(o)
        o.location = loc
        o.rotation_euler = (Vector((0, 0, 1.1)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    light('key', (-2.2, -3.0, 3.0), 700, 1.6, (1.0, .9, .78))
    light('fill', (3.0, -2.2, 1.6), 260, 3.0, (.78, .86, 1.0))
    light('rim', (1.2, 3.2, 2.6), 420, 1.5, (1.0, .95, .9))
    bpy.ops.mesh.primitive_plane_add(size=12)
    fl = bpy.context.active_object
    m = bpy.data.materials.new('floor')
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (.34, .33, .31, 1)
    m.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .9
    fl.data.materials.append(m)
    cam = bpy.data.objects.new('review-cam', bpy.data.cameras.new('review-cam'))
    sc.collection.objects.link(cam)
    sc.camera = cam
    return sc, cam


def pose(arm, clip, frame):
    ad = arm.animation_data
    act = bpy.data.actions.get(clip)
    for tr in ad.nla_tracks:
        tr.mute = True
    ad.action = act
    try:
        ad.action_slot = act.slots[0]
    except Exception:
        pass
    bpy.context.scene.frame_set(int(frame))


def face(head, values):
    kb = head.data.shape_keys.key_blocks
    for k in kb:
        if k.name != 'Basis':
            k.value = 0
    for n, v in values.items():
        if n in kb:
            kb[n].value = v


def main():
    who = sys.argv[1] if len(sys.argv) > 1 else 'jamie-mother'
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'docs', 'qa', 'supportcast', 'blender')
    want = sys.argv[3].split(',') if len(sys.argv) > 3 and sys.argv[3] != 'all' else None
    res = (900, 1200)
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=BLENDS[who])
    sc, cam = setup()
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    head = next((o for o in sc.objects if o.type == 'MESH' and o.data.shape_keys), None)
    views = VIEWS if who == 'jamie-mother' else KID_VIEWS
    for name, (cp, tg, lens, clip, frame, fc) in views.items():
        if want and name not in want:
            continue
        pose(arm, clip, frame)
        if head is not None:
            face(head, FACES[fc])
        cam.location = cp
        cam.data.lens = lens
        cam.rotation_euler = (Vector(tg) - Vector(cp)).to_track_quat('-Z', 'Y').to_euler()
        portrait = name.startswith('portrait') or name in ('hands', 'ponytail')
        sc.render.resolution_x, sc.render.resolution_y = (900, 1000) if portrait else res
        sc.cycles.samples = 96 if portrait else 64
        sc.render.filepath = os.path.join(out, f'{who}-{name}--BLENDER-RENDER.png')
        bpy.ops.render.render(write_still=True)
        print('rendered', sc.render.filepath, flush=True)


KID_VIEWS = {
    'full-front': ((0, -3.8, .85), (0, 0, .75), 50, 'idle', 0, 'neutral'),
    'full-three-quarter': ((2.2, -3.0, .9), (0, 0, .75), 50, 'idle', 0, 'neutral'),
    'portrait-neutral': ((.18, -.85, 1.40), (0, -.02, 1.37), 85, 'idle', 0, 'neutral'),
    'dribble': ((2.0, -2.8, .9), (0, -.2, .7), 50, 'dribble', 7, 'neutral'),
    'shoot': ((2.4, -2.6, 1.1), (0, -.1, 1.0), 50, 'shoot', 9, 'neutral'),
    'shoot-follow': ((2.4, -2.6, 1.1), (0, -.1, 1.0), 50, 'shoot', 16, 'neutral'),
    'catch': ((2.0, -2.8, .9), (0, -.2, .8), 50, 'catch', 38, 'neutral'),
    'hold': ((2.0, -2.8, .9), (0, -.2, .8), 50, 'hold', 0, 'neutral'),
    'full-back': ((0, 3.8, .85), (0, 0, .75), 50, 'idle', 0, 'neutral'),
}

if __name__ == '__main__':
    main()
