"""Harvest components from the supplied Sketchfab model for Jamie's BMX.

Source: "Bmx Bike" by Mitchell (https://skfb.ly/oUoKB, https://sketchfab.com/3d-models/bmx-bike-62efadd576304b38808149e2558d8d8a),
licensed under Creative Commons Attribution 4.0 (http://creativecommons.org/licenses/by/4.0/). The original file is kept
byte-for-byte at assets/source/bike/third-party/sketchfab-bmx-bike-mitchell/bmx_bike.glb with its SHA-256.

What is used: GEOMETRY ONLY of six BMX-specific components (the 25-tooth guard sprocket, the platform pedals, the
pivotal seat, the top-load stem, the brake lever assembly and the U-brake arms). Each is converted to metres,
decimated to the game budget, given new UVs in Jamie's atlases and re-textured by Last Light's own finish library
(bike_textures.py), then fitted to Jamie's rig.js anchors. Not used: the source frame, fork, bars, wheels, tyres,
chain, bolts and ALL source textures (they carry real brand marks: the art bible forbids reproducing them).

The source's units are ~1.7 mm (its 20-inch wheels are 299 units across): SCALE converts to metres.
"""
import math
import bpy
import bmesh
import numpy as np
from mathutils import Vector, Matrix, Quaternion
import bike_kit as K

SCALE = 0.0017
SRC_RAKE = math.radians(20.46)      # the source's head angle from vertical (its Fork / Stem node rotations)

# component -> (source node names, triangle budget)
PARTS = {
    'sprocket': (['Sproket_Front'], 640),
    'pedal_l': (['Pedal_L'], 300),
    'pedal_r': (['Pedal_R'], 300),
    'seat': (['Seat'], 900),
    'stem': (['Stem_Front', 'Stem_Rear', 'Stem_Top_Fixture'], 960),
    'lever': (['Brake_Braket', 'Lever', 'Break_Line_Ajuster'], 520),
    'ubrake': (['Brake_U_L', 'Brake_U_R'], 760),
}


def load(path, ref_scene):
    """Import the source GLB into a collection of the REF scene (never exported). Returns {node name: [mesh objects]}."""
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new = [o for o in bpy.data.objects if o not in before]
    coll = bpy.data.collections.new('REF.sketchfab-bmx-mitchell (CC BY 4.0, original, unused textures)')
    ref_scene.collection.children.link(coll)
    for o in new:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        coll.objects.link(o)
    roots = [o for o in new if o.parent is None]
    for r in roots:
        r.scale = (SCALE,) * 3
    ref_scene.view_layers[0].update()        # these objects live only in REF: update that scene's matrices
    by = {}
    for o in new:
        if o.type == 'MESH' and o.parent is not None:
            by.setdefault(o.parent.name, []).append(o)
    return by, coll


def to_kit_mesh(objs, budget, pid, ref_scene):
    """Join copies of the source meshes (world transform applied, metres), decimate to `budget` triangles, and return a
    kit Mesh in GAME coordinates with metric box-projected pattern UVs."""
    me_all = []
    bm = bmesh.new()
    vl = ref_scene.view_layers[0]
    vl.update()
    flipped = 0
    for o in objs:
        tmp = bmesh.new()
        tmp.from_mesh(o.data)
        # The source was made for double-sided rendering; the game culls back faces. Make every face's winding agree
        # with the source's own vertex normals (the glTF NORMAL data), so nothing renders inside out.
        try:
            cn = o.data.corner_normals
            loopn = {}
            for poly in o.data.polygons:
                s_ = Vector()
                for li in poly.loop_indices:
                    s_ += cn[li].vector
                loopn[poly.index] = s_
            tmp.faces.ensure_lookup_table()
            for f in tmp.faces:
                if f.normal.dot(loopn.get(f.index, f.normal)) < 0:
                    f.normal_flip()
                    flipped += 1
        except AttributeError:
            pass
        tmp.transform(o.matrix_world)
        me = bpy.data.meshes.new('tmp')
        tmp.to_mesh(me)
        tmp.free()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.00005)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    me = bpy.data.meshes.new('harvest.tmp')
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new('harvest.tmp', me)
    ref_scene.collection.objects.link(ob)
    n0 = len(me.polygons)
    if n0 > budget:
        # planar dissolve first (keeps hard-surface shapes), then collapse to the budget
        mod = ob.modifiers.new('dissolve', 'DECIMATE')
        mod.decimate_type = 'DISSOLVE'
        mod.angle_limit = math.radians(2.0)
        vl.update()
        ev = ob.evaluated_get(vl.depsgraph)
        me2 = bpy.data.meshes.new_from_object(ev)
        ob.modifiers.clear()
        ob.data = me2
        bm = bmesh.new()
        bm.from_mesh(me2)
        bmesh.ops.triangulate(bm, faces=bm.faces)
        bm.to_mesh(me2)
        bm.free()
        n1 = len(me2.polygons)
        if n1 > budget:
            mod = ob.modifiers.new('collapse', 'DECIMATE')
            mod.decimate_type = 'COLLAPSE'
            mod.ratio = budget / n1
            mod.use_collapse_triangulate = True
            vl.update()
            ev = ob.evaluated_get(vl.depsgraph)
            me3 = bpy.data.meshes.new_from_object(ev)
            ob.modifiers.clear()
            ob.data = me3
    me = ob.data
    m = K.Mesh()
    verts = [Vector((-v.co.x, v.co.z, v.co.y)) for v in me.vertices]      # Blender -> game
    for v in verts:
        m.add_v(v)
    me.calc_loop_triangles()
    for p in me.polygons:
        idx = list(p.vertices)
        if len(idx) < 3:
            continue
        # box projection in metres by the face's dominant axis (game frame), one island per axis
        n = (verts[idx[1]] - verts[idx[0]]).cross(verts[idx[2]] - verts[idx[0]])
        ax = max(range(3), key=lambda i: abs(n[i]))
        sgn = 1 if n[ax] >= 0 else -1
        a, b = [(1, 2), (0, 2), (0, 1)][ax]
        uvs = [(verts[i][a] * sgn, verts[i][b]) for i in idx]
        m.add_f(idx, uvs, pid, isl=ax * 2 + (sgn > 0))
    tris = m.tris()
    bpy.data.objects.remove(ob)
    if flipped:
        print(f'  source_bmx: {flipped} source faces turned to agree with their normals')
    return m, n0, tris


def bbox(m):
    a = np.array(m.v)
    return Vector(a.min(0)), Vector(a.max(0))


def pca_axes(m):
    a = np.array(m.v)
    c = a.mean(0)
    w, v = np.linalg.eigh(np.cov((a - c).T))
    return Vector(c), [Vector(v[:, i]) for i in (2, 1, 0)]   # largest first


def place(m, mat):
    m.transform(mat)
    return m


def harvest(path, C, ref_scene, pids, anchors_extra, loaded=None):
    """Returns {component: kit Mesh (game frame, placed on Jamie's anchors)} and a report. `loaded` = load()'s result,
    so the source is imported once for all LODs."""
    by, coll = loaded or load(path, ref_scene)
    out, report = {}, {}

    def get(name):
        objs = []
        for n in PARTS[name][0]:
            objs += by.get(n, [])
        return objs

    X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
    # --- sprocket: centred on the BB, its plane at the chain line (game x = .046)
    m, n0, t = to_kit_mesh(get('sprocket'), PARTS['sprocket'][1], pids['sprocket'], ref_scene)
    lo, hi = bbox(m)
    c = (lo + hi) / 2
    place(m, Matrix.Translation(Vector((.046, C.bb.y, C.bb.z)) - c))
    out['sprocket'], report['sprocket'] = m, (n0, t)
    # measure it: tooth-tip radius -> pitch radius and tooth count (1/2-inch pitch), so the chain wraps this sprocket
    a = np.array(m.v)
    r = np.sqrt((a[:, 1] - C.bb.y) ** 2 + (a[:, 2] - C.bb.z) ** 2)
    tip = float(r.max())
    teeth = int(round(math.pi / math.asin(.0127 / (2 * (tip - .0042)))))
    out['sprocket_teeth'] = teeth
    report['sprocket_teeth'] = teeth
    # --- pedals: centred on rig.js's pedal points at crank 0, platform level
    for side, key in ((-1, 'pedal_l'), (1, 'pedal_r')):
        m, n0, t = to_kit_mesh(get(key), PARTS[key][1], pids['pedal'], ref_scene)
        lo, hi = bbox(m)
        c = (lo + hi) / 2
        target = Vector(C.A['pedalL0'] if side < 0 else C.A['pedalR0'])
        place(m, Matrix.Translation(target - c))
        out[key], report[key] = m, (n0, t)
    # --- seat: its underside clamp on the seatpost top, nose forward, top level
    m, n0, t = to_kit_mesh(get('seat'), PARTS['seat'][1], pids['seat'], ref_scene)
    lo, hi = bbox(m)
    top_c = Vector(((lo.x + hi.x) / 2, hi.y, (lo.z + hi.z) / 2))
    target = C.saddle + Vector((0, .028, .006))
    place(m, Matrix.Translation(target - top_c))
    out['seat'], report['seat'] = m, (n0, t)
    # --- stem: re-angled from the source's head angle to Jamie's rake, its steerer clamp on the headset stack
    m, n0, t = to_kit_mesh(get('stem'), PARTS['stem'][1], pids['stem'], ref_scene)
    q = Quaternion(X, -(SRC_RAKE - C.rake) * 1.0)
    lo, hi = bbox(m)
    place(m, Matrix.Translation(-(lo + hi) / 2))
    place(m, q.to_matrix().to_4x4())
    lo, hi = bbox(m)
    stack = anchors_extra['stack']
    # the steerer clamp is the rearmost part of the stem: put its lower back edge on the steerer at the stack top
    want = stack + C.D * .021 - C.F * .0
    base = Vector(((lo.x + hi.x) / 2, lo.y, hi.z - .018))
    place(m, Matrix.Translation(want - base + C.F * .0))
    out['stem'], report['stem'] = m, (n0, t)
    # --- lever (perch, blade, barrel adjuster): on the right bar, inboard of the grip
    m, n0, t = to_kit_mesh(get('lever'), PARTS['lever'][1], pids['lever'], ref_scene)
    lo, hi = bbox(m)
    # the clamp end (inboard, toward x=0) sits on the bar at the lever point
    clamp_end = Vector((lo.x, (lo.y + hi.y) / 2, (lo.z + hi.z) / 2))
    place(m, Matrix.Translation(anchors_extra['lever'] - clamp_end + Vector((0, -.004, -.012))))
    out['lever'], report['lever'] = m, (n0, t)
    # --- U-brake arms: centred between the seatstay bosses above the rim, turned to the seatstays' angle
    m, n0, t = to_kit_mesh(get('ubrake'), PARTS['ubrake'][1], pids['ubrake'], ref_scene)
    c, axes = pca_axes(m)
    place(m, Matrix.Translation(-c))
    ss_dir = anchors_extra['ss_dir']          # up the seatstays (game frame)
    a0 = axes[0] if axes[0].dot(ss_dir) > 0 else -axes[0]
    a0 = Vector((0, a0.y, a0.z)).normalized()
    q = a0.rotation_difference(Vector((0, ss_dir.y, ss_dir.z)).normalized())
    place(m, q.to_matrix().to_4x4())
    place(m, Matrix.Translation(anchors_extra['ubrake']))
    out['ubrake'], report['ubrake'] = m, (n0, t)
    return out, report, coll
