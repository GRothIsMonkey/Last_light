"""Last Light: build the Prologue houses (architecture benchmark) in Blender from the game's own lot plans, save the
editable .blend, export the runtime GLB and (optionally) render.

    python tools/blender/houses/build_houses.py -- [--houses house.car,house.hoop|all] [--lods 0,1,2] [--stage full|geometry]
                                                   [--out dist/assets/house/house.prologue.glb]
(the gallery is tools/blender/houses/render_gallery.py)

(bpy 5.0.1 as a Python module, or `blender --background --factory-startup --python tools/blender/houses/build_houses.py -- ...`)

Outputs (BLENDER-PIPELINE.md conventions):
    assets/source/house/kit/textures/house.kit__<family>_<map>.jpg|png   the shared texture library (runtime size)
    assets/source/house/prologue/house.prologue.blend                     scenes EXPORT (what ships) and REF (renders)
    dist/assets/house/house.prologue.glb                                  via tools/blender/ll_export.py
"""
import sys
import os
import json
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))

import bpy
import house_kit as K
import house_build as HB
import house_bake

VERSION = 2
LICENSE = 'Original work for Last Light (Roth Studios).'
ASSET_ID = 'house.prologue'
TEX_DIR = os.path.join(ROOT, 'assets', 'source', 'house', 'kit', 'textures')
SRC_DIR = os.path.join(ROOT, 'assets', 'source', 'house', 'prologue')


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'houses': 'all', 'lods': '0,1,2', 'stage': 'full', 'render': '', 'out': os.path.join(ROOT, 'dist', 'assets', 'house', 'house.prologue.glb'),
         'blend': os.path.join(SRC_DIR, 'house.prologue.blend'), 'shots': os.path.join(ROOT, 'docs', 'qa', 'houses-phase1', 'blender'), 'samples': '64', 'export': '1', 'bake': '1'}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    return o


def plans():
    with open(os.path.join(HERE, 'plans.json')) as fh:
        return json.load(fh)


def texture_set():
    """The shared texture library (house_textures.py writes it; missing files simply leave the material untextured)."""
    meta = os.path.join(TEX_DIR, 'library.json')
    if not os.path.exists(meta):
        return {}, {}
    with open(meta) as fh:
        lib = json.load(fh)
    tex, means = {}, {}
    for fam, d in lib['families'].items():
        tex[fam] = {k: os.path.join(TEX_DIR, v) for k, v in d['files'].items()}
        tex[fam].update({k: v for k, v in d.items() if k not in ('files', 'mean')})
        means[fam] = tuple(d.get('mean', (1, 1, 1)))
    return tex, means


def fresh():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    return sc


def main():
    o = args()
    t0 = time.time()
    P = plans()
    houses = P['houses'] if o['houses'] == 'all' else [h for h in P['houses'] if h['id'] in o['houses'].split(',')]
    lods = [int(x) for x in o['lods'].split(',')]
    sc = fresh()
    tex, means = texture_set()
    mats = K.make_materials(tex)
    tints = HB.Tints(means)
    root = bpy.data.objects.new(ASSET_ID, None)
    sc.collection.objects.link(root)
    root['ll_asset_id'] = ASSET_ID
    root['ll_asset_version'] = VERSION
    root['ll_rig'] = 'none'
    root['ll_license'] = LICENSE
    root['ll_source'] = 'assets/source/house/prologue/house.prologue.blend'
    root['ll_frame'] = 'houses.js house-local (x across the facade, +z toward the street, y up from the lot ground); one node per house per LOD'
    stats = {}
    for h in houses:
        coll = bpy.data.collections.new(h['id'])
        sc.collection.children.link(coll)
        hn = bpy.data.objects.new(h['id'], None)
        coll.objects.link(hn)
        hn.parent = root
        hn['ll_lot'] = h['lot']
        hn['ll_house'] = h['id']
        hn['ll_role'] = h['role']
        hn['ll_d'] = h['d']
        hn['ll_side'] = h['side']
        st = {}
        for lod in lods:
            house = HB.House(h, lod, tints, P['palette'])
            mb = house.build()
            bk = house_bake.bake(mb, house, lod) if o['bake'] == '1' else None
            ob = mb.build(coll, mats, name=f"{h['id']}:lod{lod}")
            ob.parent = hn
            ob['ll_lod'] = lod
            ob['ll_part'] = 'house'
            st[f'lod{lod}'] = {'tris': mb.tris(), 'slots': sorted(set(f[1] for f in mb.faces))}
            if lod == 0:
                meta = {'porchLight': getattr(house, 'porch_light', None), 'service': getattr(house, 'service', None), 'address': house.address(), 'care': house.care}
                hn['ll_meta'] = json.dumps({k: (list(map(float, v)) if isinstance(v, tuple) else v) for k, v in meta.items()})
            if h['dynamicGarage']:
                gmb = HB.car_garage_door(h, tints, lod)
                gob = gmb.build(coll, mats, name=f"{h['id']}:garage_door:lod{lod}")
                gob.parent = hn
                gob['ll_lod'] = lod
                gob['ll_part'] = 'garage_door'
                st[f'lod{lod}']['garage_door_tris'] = gmb.tris()
        stats[h['id']] = st
        print(h['id'], {k: v['tris'] for k, v in st.items()}, f'{time.time() - t0:.1f}s', flush=True)
    os.makedirs(os.path.dirname(o['blend']), exist_ok=True)
    with open(os.path.join(SRC_DIR, 'build-stats.json'), 'w') as fh:
        json.dump({'version': VERSION, 'houses': stats}, fh, indent=1)
    if o['export'] == '1' and o['stage'] == 'full':
        import ll_export
        ll_export.export_glb(o['out'], export_vertex_color='ACTIVE', export_tangents=False, export_animations=False, export_skins=False, export_morph=False)
    bpy.ops.wm.save_as_mainfile(filepath=o['blend'], compress=True)
    print('done', f'{time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
