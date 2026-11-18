"""Render the bicycle gallery from the saved .blend files (what ships: LOD0 with its exported textures).

    python tools/blender/bikes/render_gallery.py -- --out docs/qa/bikes-phase1/blender [--only bike.jamie] [--samples 96]
        [--set views|lineup|source]

Every bike gets the same cameras and lights (ll_bike_render.py, ACES 1.3 like the game's tone curve):
front three-quarter, rear three-quarter, side profile, close mechanical detail(s), and a golden-hour view. Then the
four together at one scale, and the supplied Sketchfab model beside Jamie's bike under identical light and camera.
Moving parts are posed about their real pivots (crank about the BB, steering about the raked axis, the stand about its
pivot), exactly as rig.js poses them in the game.
"""
import sys
import os
import json
import math
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
import bpy
from mathutils import Vector, Matrix, Quaternion, Euler
import ll_bike_render as R

BIKES = ['bike.jamie', 'bike.sam', 'bike.alex', 'bike.player']
G2B = Matrix(((-1, 0, 0, 0), (0, 0, 1, 0), (0, 1, 0, 0), (0, 0, 0, 1)))
B2G = G2B.inverted()


def gvec(v):
    return Vector((-v[0], v[2], v[1]))


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'out': os.path.join(ROOT, 'docs', 'qa', 'bikes-phase1', 'blender'), 'only': None, 'samples': '96', 'set': 'views,lineup,source'}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    return o


def append_bike(bike_id, scene, offset=Matrix()):
    """Append LOD0 objects of a bike's EXPORT scene into `scene`; returns {node: object} and the anchors record."""
    key = bike_id.split('.')[1]
    path = os.path.join(ROOT, 'assets', 'source', 'bike', key, bike_id + '.blend')
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n.startswith(bike_id)]
    root, parts = None, {}
    for ob in dst.objects:
        if ob is None:
            continue
        if ob.type == 'EMPTY' and ob.name.split('.')[0:2] == bike_id.split('.'):
            root = ob
        if ob.type == 'MESH' and int(ob.get('ll_lod', 0)) == 0:
            scene.collection.objects.link(ob)
            parts[ob['ll_node']] = ob
    anchors = json.loads(root['ll_anchors'])
    for ob in parts.values():
        ob.parent = None
        ob.matrix_world = offset @ ob.matrix_world
    return parts, anchors


def pose(parts, A, offset=Matrix(), crank=0.0, steer=0.0, kick=0.0, wheel=0.0):
    """Pose like rig.js poseBike (game frame), then map to Blender: crank about the BB, pedals level on their circles,
    steering about the raked axis, the stand from stowed to deployed about its pivot, wheels about their axles."""
    def about(point_g, rot_g):
        p = Matrix.Translation(Vector(point_g))
        return G2B @ p @ rot_g.to_4x4() @ p.inverted() @ B2G
    rx = lambda a: Matrix.Rotation(a, 3, 'X')
    bb = A['bb']
    if 'crank' in parts:
        parts['crank'].matrix_world = offset @ about(bb, rx(-crank))
    for node, side in (('pedal_l', -1), ('pedal_r', 1)):
        if node in parts:
            a0 = (math.pi if side < 0 else 0.0)
            a = crank + a0
            p0 = Vector((side * A['pedalX'], bb[1] + math.cos(a0) * A['crank'], bb[2] - math.sin(a0) * A['crank']))
            p1 = Vector((side * A['pedalX'], bb[1] + math.cos(a) * A['crank'], bb[2] - math.sin(a) * A['crank']))
            parts[node].matrix_world = offset @ G2B @ Matrix.Translation(p1 - p0) @ B2G
    rake = A['rake']
    piv = Vector(A['pivot'])
    axis = Vector((0, math.cos(rake), math.sin(rake)))
    S = Matrix.Translation(piv) @ Matrix.Rotation(steer, 4, axis) @ Matrix.Translation(-piv)
    fa = Vector(A['axleFront'])
    ra = Vector(A['axleRear'])
    Wf = Matrix.Translation(fa) @ rx(-wheel).to_4x4() @ Matrix.Translation(-fa)
    Wr = Matrix.Translation(ra) @ rx(-wheel).to_4x4() @ Matrix.Translation(-ra)
    for node in ('steer', 'bell_lever'):
        if node in parts:
            parts[node].matrix_world = offset @ G2B @ S @ B2G
    if 'wheel_front' in parts:
        parts['wheel_front'].matrix_world = offset @ G2B @ S @ Wf @ B2G
    if 'wheel_rear' in parts:
        parts['wheel_rear'].matrix_world = offset @ G2B @ Wr @ B2G
    if 'kickstand' in parts:
        kp = Vector(A['kickPivot'])
        # three.js Euler 'XYZ' is the matrix Rx * Ry * Rz (Blender's Euler 'XYZ' is Rz * Ry * Rx): build it explicitly
        rest = Matrix.Rotation(-1.2, 3, 'X')
        dep = Matrix.Rotation(-1.2 * (1 - kick) - .25 * kick, 3, 'X') @ Matrix.Rotation(-.32 * kick, 3, 'Z')
        parts['kickstand'].matrix_world = offset @ G2B @ Matrix.Translation(kp) @ (dep @ rest.inverted()).to_4x4() @ Matrix.Translation(-kp) @ B2G


DETAILS = {
    'bike.jamie': [('detail-cockpit', (-0.55, -0.9, 1.3), (0.02, -0.38, 0.97), 38), ('detail-drivetrain', (-0.62, -0.28, 0.44), (-0.05, 0.12, 0.3), 40)],
    'bike.sam': [('detail-drivetrain', (-0.66, 0.18, 0.5), (-0.04, 0.3, 0.3), 38), ('detail-fork', (-0.62, -1.02, 0.66), (0, -0.52, 0.47), 40)],
    'bike.alex': [('detail-cockpit-bell', (0.5, -0.72, 1.25), (0.07, -0.36, 1.0), 38), ('detail-rack-reflector', (0.62, 1.26, 0.95), (0, 0.55, 0.72), 40)],
    'bike.player': [('detail-firstperson-cockpit', (0.0, -0.06, 1.37), (0.0, -0.5, 0.86), 22), ('detail-drivetrain', (-0.66, 0.18, 0.5), (-0.04, 0.3, 0.3), 38)],
}


def new_scene(name, look, samples, res=(1600, 1000)):
    sc = bpy.data.scenes.new(name)
    R.setup_scene(sc, look, res=res, samples=samples)
    return sc


def render_golden(bike_id, out, samples):
    sg = new_scene('golden.' + bike_id, 'golden', samples)
    parts, A = append_bike(bike_id, sg)
    pose(parts, A, crank=2.0, steer=.38, kick=1.0, wheel=1.0)
    cam = R.camera(sg, 'cam.golden', (1.95, -2.15, 0.62), (0, -0.05, 0.5), 52)
    return [R.render(sg, cam, os.path.join(out, f'{bike_id}--golden-hour.jpg'))]


def render_views(bike_id, out, samples):
    done = []
    sc = new_scene('views.' + bike_id, 'review', samples)
    parts, A = append_bike(bike_id, sc)
    pose(parts, A, crank=1.15, steer=-.22, kick=0.0, wheel=.4)
    for v in ('front34', 'rear34', 'side'):
        V = R.VIEWS[v]
        if v == 'side':
            pose(parts, A, crank=1.15, steer=0.0, kick=0.0, wheel=.4)
        cam = R.camera(sc, 'cam.' + v, V['loc'], V['target'], V['lens'])
        done.append(R.render(sc, cam, os.path.join(out, f'{bike_id}--{v}.jpg')))
    pose(parts, A, crank=1.15, steer=-.12, kick=0.0, wheel=.4)
    for name, loc, tgt, lens in DETAILS[bike_id]:
        cam = R.camera(sc, 'cam.' + name, loc, tgt, lens)
        done.append(R.render(sc, cam, os.path.join(out, f'{bike_id}--{name}.jpg')))
    # golden hour: parked on its stand, the low sun behind and to the left
    sg = new_scene('golden.' + bike_id, 'golden', samples)
    parts, A = append_bike(bike_id, sg)
    pose(parts, A, crank=2.0, steer=.38, kick=1.0, wheel=1.0)
    cam = R.camera(sg, 'cam.golden', (1.95, -2.15, 0.62), (0, -0.05, 0.5), 52)
    done.append(R.render(sg, cam, os.path.join(out, f'{bike_id}--golden-hour.jpg')))
    return done


def render_lineup(out, samples):
    done = []
    sc = new_scene('lineup', 'golden', samples, res=(2200, 1100))
    for i, b in enumerate(BIKES):
        off = Matrix.Translation(Vector(((i - 1.5) * 1.05, (i - 1.5) * .18, 0)))
        parts, A = append_bike(b, sc, off)
        pose(parts, A, offset=off, crank=1.2 + i * .9, steer=-.15, kick=0.0, wheel=i)
    cam = R.camera(sc, 'cam.lineup', (-3.3, -4.6, 1.45), (0.0, 0.0, 0.55), 40)
    done.append(R.render(sc, cam, os.path.join(out, 'lineup--four-bikes-golden-hour.jpg')))
    sr = new_scene('lineup-side', 'review', samples, res=(2400, 900))
    for i, b in enumerate(BIKES):
        off = Matrix.Translation(Vector((0, (i - 1.5) * 1.75, 0)))
        parts, A = append_bike(b, sr, off)
        pose(parts, A, offset=off, crank=1.15, steer=0.0, kick=0.0, wheel=0)
    cam = R.camera(sr, 'cam.side', (-11.5, 0.0, 0.62), (0, 0.0, 0.58), 50)
    done.append(R.render(sr, cam, os.path.join(out, 'lineup--four-bikes-side-profile-common-scale.jpg')))
    return done


def render_source(out, samples):
    """The supplied Sketchfab BMX (its own textures, untouched) and Jamie's bike, same light and camera."""
    done = []
    src = os.path.join(ROOT, 'assets', 'source', 'bike', 'third-party', 'sketchfab-bmx-bike-mitchell', 'bmx_bike.glb')
    for v in ('front34', 'side'):
        sc = new_scene('source.' + v, 'review', samples)
        before = set(bpy.data.objects)
        bpy.ops.import_scene.gltf(filepath=src)
        new = [o for o in bpy.data.objects if o not in before]
        for o in new:
            for c in list(o.users_collection):
                c.objects.unlink(o)
            sc.collection.objects.link(o)
        for r in [o for o in new if o.parent is None]:
            r.scale = (0.0017,) * 3
        sc.view_layers[0].update()
        zmin = min((o.matrix_world @ Vector(c)).z for o in new if o.type == 'MESH' for c in o.bound_box)
        for r in [o for o in new if o.parent is None]:
            r.location.z -= zmin
        V = R.VIEWS[v]
        cam = R.camera(sc, 'cam.' + v, V['loc'], V['target'], V['lens'])
        done.append(R.render(sc, cam, os.path.join(out, f'source--sketchfab-bmx-original--{v}.jpg')))
    return done


def main():
    o = args()
    out = os.path.abspath(o['out'])
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    samples = int(o['samples'])
    sets = o['set'].split(',')
    t0 = time.time()
    done = []
    if 'views' in sets:
        for b in BIKES:
            if o['only'] and b not in o['only'].split(','):
                continue
            t = time.time()
            done += render_views(b, out, samples)
            print(f'render_gallery: {b} in {time.time() - t:.0f}s')
    if 'golden' in sets:
        for b in BIKES:
            if not o['only'] or b in o['only'].split(','):
                done += render_golden(b, out, samples)
    if 'lineup' in sets:
        done += render_lineup(out, samples)
    if 'source' in sets:
        done += render_source(out, samples)
    print(f'render_gallery: {len(done)} images in {time.time() - t0:.0f}s')
    for d in done:
        print('  ', os.path.relpath(d, ROOT))


if __name__ == '__main__':
    main()
