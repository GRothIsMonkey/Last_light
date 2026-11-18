"""Last Light: build one of the four boys' bicycles in Blender, from nothing (plus, for Jamie's BMX, harvested parts of
the CC BY 4.0 Sketchfab BMX), bake and synthesize its textures, save the editable .blend, and export the runtime GLB.

    python tools/blender/bikes/build_bike.py -- --bike bike.jamie [--stage geometry|full] [--clay out.jpg]

(bpy 5.0.1 as a Python module, or `blender --background --factory-startup --python tools/blender/bikes/build_bike.py -- ...`)

Outputs (BLENDER-PIPELINE.md conventions):
    assets/source/bike/<id>/bike.<id>.blend           scenes EXPORT (what ships) and REF (anchors, harvest originals)
    assets/source/bike/<id>/textures/bike.<id>__*.jpg|png    runtime-size textures (authored at 2x, downsampled)
    dist/assets/bike/bike.<id>.glb                    via tools/blender/ll_export.py
"""
import sys
import os
import json
import math
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))

import bpy
import numpy as np
from mathutils import Vector, Matrix
import bike_kit as K
import bike_parts as BP
import bike_designs as BD

VERSION = 1
LICENSE_ORIGINAL = 'Original work for Last Light (Roth Studios).'


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'bike': 'bike.jamie', 'stage': 'full', 'clay': None, 'source': None, 'lods': '0,1,2', 'parts': None}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    return o


def anchors(bike_id):
    with open(os.path.join(HERE, 'anchors.json')) as fh:
        return json.load(fh)['bikes'][bike_id]


def fresh():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    return sc


def build_nodes(bike_id, lod, parts, harvest=None):
    A = anchors(bike_id)
    fn, offset = BD.DESIGNS[bike_id]
    C = BP.Ctx(A, lod, parts, offset)
    col = {}
    N = fn(C, col, harvest=harvest)
    return C, N, col


def make_materials(bike_id):
    mats = {}
    for slot, fam in (('paint', 'mat.metal.painted'), ('hardware', 'mat.metal.bare'), ('soft', 'mat.rubber')):
        name = f'{fam}/{bike_id}.{"frame" if slot == "paint" else slot}'
        m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        mats[slot] = m
    return mats


def objects_for(bike_id, lod, N, parts, mats, coll, root):
    out = {}
    for node, m in N.items():
        if not m.f:
            continue
        name = f'{bike_id}:{node}' + ('' if lod == 0 else f':lod{lod}')
        ob = K.to_object(bpy, name, m, parts, mats, coll)
        ob.parent = root
        ob['ll_node'] = node
        ob['ll_lod'] = lod
        out[node] = ob
    return out


def clay_render(path, objs):
    import ll_bike_render as R
    sc = bpy.data.scenes.new('CLAY')
    for ob in objs:
        sc.collection.objects.link(ob)
    clay = bpy.data.materials.new('clay')
    clay.use_nodes = True
    b = clay.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (.5, .48, .45, 1)
    b.inputs['Roughness'].default_value = .5
    for ob in objs:
        ob.data.materials.clear()
        ob.data.materials.append(clay)
    R.setup_scene(sc, 'review', res=(1600, 900), samples=24)
    V = R.VIEWS
    paths = []
    for v in ('side', 'front34'):
        cam = R.camera(sc, 'cam.' + v, V[v]['loc'], V[v]['target'], V[v]['lens'])
        paths.append(R.render(sc, cam, path.replace('.jpg', f'-{v}.jpg')))
    return paths


def main():
    o = args()
    bike_id = o['bike']
    t0 = time.time()
    sc = fresh()
    parts = K.Parts()
    mats = make_materials(bike_id)
    coll = sc.collection
    root = bpy.data.objects.new(bike_id, None)
    coll.objects.link(root)
    lods = [int(x) for x in o['lods'].split(',')]
    built = {}
    for lod in lods:
        C, N, col = build_nodes(bike_id, lod, parts)
        built[lod] = objects_for(bike_id, lod, N, parts, mats, coll, root)
        tris = sum(m.tris() for m in N.values())
        print(f'build_bike: {bike_id} LOD{lod}: {tris} triangles; ' + ', '.join(f'{k} {v.tris()}' for k, v in N.items() if v.f))
        if o.get('parts'):
            by = {}
            for node, mm in N.items():
                for fc, p_ in zip(mm.f, mm.pid):
                    key = f'{node}/{parts.list[p_ - 1][0]}'
                    by[key] = by.get(key, 0) + len(fc) - 2
            print('  by part: ' + ', '.join(f'{k} {v}' for k, v in sorted(by.items(), key=lambda kv: -kv[1])[:28]))
    if o['clay']:
        objs = list(built[lods[0]].values())
        print('clay renders:', clay_render(o['clay'], objs))
    print(f'build_bike: done in {time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
