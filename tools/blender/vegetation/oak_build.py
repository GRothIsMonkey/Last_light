"""Build the old oak (lm.old-oak) in Blender and export it for the game.

    python tools/blender/vegetation/oak_build.py            (bpy 5.0.1; numpy, scipy, Pillow)

Reads   assets/source/vegetation/oak/oak_skeleton.json (+ oak_scan_voxels.npz, regenerated if missing)
        tools/blender/vegetation/oak_site.json (node tools/assets/oak-site.mjs)
        assets/source/vegetation/textures/ (python tools/blender/vegetation/veg_textures.py)
Writes  assets/source/vegetation/oak/lm.old-oak.blend   scene EXPORT: root empty + :lod0/:lod1/:lod2 (what ships)
        assets/source/vegetation/oak/textures/           runtime-size textures the .blend links
        assets/source/vegetation/oak/build-stats.json
        dist/assets/veg/lm.old-oak.glb                   the runtime file (WebP textures, _WIND attribute)

One canonical tree for every chapter (ENVIRONMENT-STYLE-GUIDE §6 "built once"): the summer state ships now; later states
(silhouetted, ash, September, October) are material states of this same geometry (the runtime's `season`/`ash` uniforms
read the same textures), so the limbs never change between chapters.
"""
import json
import math
import os
import subprocess
import sys
import time
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_mesh as VM          # noqa: E402
import veg_blender as VB       # noqa: E402

ROOT = VB.ROOT
OAK = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'oak')
TEX = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'textures')
OUT = os.path.join(ROOT, 'dist', 'assets', 'veg', 'lm.old-oak.glb')
ASSET_ID = 'lm.old-oak'
VERSION = 1
LICENSE = ('Last Light (Roth Studios). Reconstructed from "200 year old oak tree" by kungphil '
           '(https://skfb.ly/6vqWJ), licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/): the laser scan '
           'was used as the measured source of the branch architecture and crown; the mesh, bark, leaves and carving are new. '
           'Leaf card photo adapted from "Realistic Trees Collection" by Jungle Jim (https://skfb.ly/pDzJR), CC BY 4.0. '
           'The authors do not endorse Last Light.')


def main():
    t0 = time.time()
    if not os.path.exists(os.path.join(OAK, 'oak_scan_voxels.npz')):
        subprocess.check_call([sys.executable, os.path.join(HERE, 'oak_skeleton.py')])
    import oak_tree as O
    oak = O.Oak()
    G = O.OakGeometry(oak)
    G.prepare()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    # runtime textures (hero sizes: bark 2048, leaves 2048, carving detail 512)
    rt = os.path.join(OAK, 'textures')
    T = {
        'bark_c': VB.runtime_texture(os.path.join(TEX, 'bark.white-oak__basecolor.png'), os.path.join(rt, 'lm.old-oak__bark_basecolor.jpg'), 2048, 'RGB'),
        'bark_n': VB.runtime_texture(os.path.join(TEX, 'bark.white-oak__normal.png'), os.path.join(rt, 'lm.old-oak__bark_normal.png'), 2048, 'RGB'),
        'bark_o': VB.runtime_texture(os.path.join(TEX, 'bark.white-oak__orm.png'), os.path.join(rt, 'lm.old-oak__bark_orm.png'), 1024, 'RGB'),
        'leaf_c': VB.runtime_texture(os.path.join(TEX, 'leaf.oak__basecolor.png'), os.path.join(rt, 'lm.old-oak__leaves_basecolor.png'), 2048, 'RGBA'),
        'det_c': VB.runtime_texture(os.path.join(TEX, 'detail.oak-carving__basecolor.png'), os.path.join(rt, 'lm.old-oak__carving_basecolor.png'), 512, 'RGBA'),
        'det_n': VB.runtime_texture(os.path.join(TEX, 'detail.oak-carving__normal.png'), os.path.join(rt, 'lm.old-oak__carving_normal.png'), 512, 'RGB'),
    }
    m_bark = VB.material('mat.bark/lm.old-oak', T['bark_c'], T['bark_n'], T['bark_o'], roughness=.92, normal_strength=1.0)
    m_leaf = VB.material('mat.foliage/lm.old-oak', T['leaf_c'], alpha_clip=.42, roughness=.72, double=True)
    m_det = VB.material('mat.bark/lm.old-oak.carving', T['det_c'], T['det_n'], alpha_clip=.5, roughness=.88, normal_strength=1.2)
    root = bpy.data.objects.new(ASSET_ID, None)
    sc.collection.objects.link(root)
    root['ll_asset_id'] = ASSET_ID
    root['ll_asset_version'] = VERSION
    root['ll_rig'] = 'none'
    root['ll_license'] = LICENSE
    root['ll_source'] = 'assets/source/vegetation/oak/lm.old-oak.blend'
    root['ll_frame'] = 'oak-local: x = lateral (+lat), -z = forward (+d), y up from the oak placement point (props.js); placed by dist/layout.js LOOKOUT.oak'
    site = oak.site
    root['ll_anchors'] = json.dumps({
        'swingPivot': site['swing']['pivot'], 'swingLimb': G.o.swing_info,
        'carving': {'centre': [round(float(x), 4) for x in G.carving_centre] if hasattr(G, 'carving_centre') else None},
        'trunkRadius13': round(float(G.trunk_radius(G.carve_az, 1.3)), 3)})
    stats = {}
    for lod in (0, 1, 2):
        buf = VM.MeshBuf()
        tw = G.wood(buf, lod)
        nc = G.leaves(buf, lod)
        td = G.carving(buf) if lod == 0 else 0
        arr = buf.arrays()
        mats = [m_bark, m_leaf, m_det] if lod == 0 else [m_bark, m_leaf]
        ob = VB.mesh_from(arr, f'{ASSET_ID}:lod{lod}', sc.collection, mats, custom_normals=True)
        ob.parent = root
        ob['ll_lod'] = lod
        ob['ll_part'] = 'tree'
        stats[f'lod{lod}'] = {'tris': int(buf.tris), 'wood_tris': int(tw), 'leaf_cards': int(nc), 'carving_tris': int(td), 'verts': int(len(arr['P']))}
        print(f'lod{lod}', stats[f'lod{lod}'], f'{time.time() - t0:.1f}s', flush=True)
    root['ll_anchors'] = json.dumps({
        'swingPivot': site['swing']['pivot'], 'swingLimb': {k: round(float(v), 4) for k, v in G.o.swing_info.items()},
        'carving': {'centre': [round(float(x), 4) for x in G.carving_centre], 'bearing': round(float(G.carve_az), 5), 'height': round(float(G.carve_z), 3)},
        'trunkRadiusAtCarving': round(float(G.trunk_radius(G.carve_az, G.carve_z)), 4), 'dbh': round(2 * float(O.DBH_R), 3),
        'clearance': {'oldBike': site['marks']['oldBike']['at'], 'sitAgainstTrunk': site['marks']['sitAgainstTrunk']['at']}})
    rec = {'asset': ASSET_ID, 'version': VERSION, 'lods': stats, 'limbs': G.limb_rows, 'swing': {k: float(v) for k, v in G.o.swing_info.items()},
           'rotation_deg': math.degrees(O.PHI), 'dead_nodes': int(G.o.dead.sum()), 'textures': {k: os.path.relpath(v, ROOT) for k, v in T.items()}}
    with open(os.path.join(OAK, 'build-stats.json'), 'w') as f:
        json.dump(rec, f, indent=1, default=str)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    VB.export(OUT)
    blend = os.path.join(OAK, 'lm.old-oak.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    print('done', f'{time.time() - t0:.1f}s', 'glb', os.path.getsize(OUT))


if __name__ == '__main__':
    main()
