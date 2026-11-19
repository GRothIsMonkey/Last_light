"""Build the Prologue's street-tree library (veg.street-trees) in Blender and export it for the game.

    python tools/blender/vegetation/street_build.py [--only maple,oak] [--no-export]

Writes  assets/source/vegetation/street/veg.street-trees.blend  (scene EXPORT: one empty per variant, :lod0/:lod1/:lod2)
        assets/source/vegetation/street/textures/                (runtime textures the .blend links)
        assets/source/vegetation/street/build-stats.json
        dist/assets/veg/veg.street-trees.glb
Variants (>= 6 per species near the route, art bible §5.1): maple 8, oak 6, ash 6, birch 6, white pine 6, spruce 6, young 6.
"""
import json
import math
import os
import sys
import time
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_mesh as VM        # noqa: E402
import veg_trees as VT       # noqa: E402
import veg_blender as VB     # noqa: E402

ROOT = VB.ROOT
SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'street')
TEX = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'textures')
OUT = os.path.join(ROOT, 'dist', 'assets', 'veg', 'veg.street-trees.glb')
ASSET_ID = 'veg.street-trees'
VERSION = 1
LICENSE = ('Last Light (Roth Studios). Oak and ash branch architectures recovered from "Realistic Trees Collection" by '
           'Jungle Jim (https://skfb.ly/pDzJR), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/); oak, ash and pine '
           'twig photos adapted from the same collection; bark micro-detail from its bark photo. Maple, birch, pine, spruce and '
           'young trees, the maple and birch leaves and the barks are original. Rebuilt, re-meshed and re-textured for Last Light; '
           'the author does not endorse Last Light.')

COLLECTION = {
    'oak': ['Tree EZTree0.Medium010_branches.010_0', 'Tree EZTree0.Medium011_branches.011_0', 'Tree EZTree1.Large009_branches.009_0'],
    'ash': ['Tree EZTree0.Large_branches_0', 'Tree EZTree1.Large001_branches.001_0', 'Tree EZTree1.Medium002_branches.002_0'],
}
COUNTS = {'maple': 8, 'oak': 6, 'ash': 6, 'birch': 6, 'pine': 6, 'spruce': 6, 'young': 6}


def variants(only=None):
    out = []
    for sp, n in COUNTS.items():
        if only and sp not in only:
            continue
        for k in range(n):
            seed = 1000 * (list(COUNTS).index(sp) + 1) + k
            rng = np.random.default_rng(seed)
            if sp in COLLECTION:
                src = COLLECTION[sp][k % 3]
                sk = VT.from_collection(src, rng)
                target = rng.uniform(9.5, 12.5)
                s = target / sk.H
                sk = VT.Skel(sk.P * s, sk.par, sk.R * s * 1.15, sk.L)
                sk.H = target
                origin = f'collection:{src.split("_")[0]}'
                if k >= 3:     # reshaped: one side pruned back, limbs bent, a lean
                    sk = VT.reshape(sk, rng, prune_side=rng.uniform(0, 2 * np.pi), bend=rng.uniform(.25, .45), lean=rng.uniform(.01, .035))
                    origin += ' (pruned, bent, leaning)'
                else:
                    sk = VT.reshape(sk, rng, bend=rng.uniform(.05, .15))
            elif sp in ('pine', 'spruce'):
                sk = VT.grow_conifer(sp, seed)
                origin = 'grown'
            else:
                sk = VT.grow(sp, seed)
                origin = 'grown'
            out.append(dict(id=f'tree.{sp}.{k + 1}', species=sp, seed=seed, skel=sk, origin=origin))
    return out


def main(argv):
    only = None
    if '--only' in argv:
        only = argv[argv.index('--only') + 1].split(',')
    t0 = time.time()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    rt = os.path.join(SRC, 'textures')
    T = {
        'bark_c': VB.runtime_texture(os.path.join(TEX, 'bark.broadleaf__basecolor.png'), os.path.join(rt, 'veg.street__bark_basecolor.jpg'), 1024, 'RGB'),
        'bark_n': VB.runtime_texture(os.path.join(TEX, 'bark.broadleaf__normal.png'), os.path.join(rt, 'veg.street__bark_normal.png'), 1024, 'RGB'),
        'birch_c': VB.runtime_texture(os.path.join(TEX, 'bark.birch__basecolor.png'), os.path.join(rt, 'veg.street__birch_basecolor.jpg'), 1024, 'RGB'),
        'birch_n': VB.runtime_texture(os.path.join(TEX, 'bark.birch__normal.png'), os.path.join(rt, 'veg.street__birch_normal.png'), 512, 'RGB'),
        'leaf_c': VB.runtime_texture(os.path.join(TEX, 'leaf.street__basecolor.png'), os.path.join(rt, 'veg.street__leaves_basecolor.png'), 2048, 'RGBA'),
    }
    mats = [VB.material('mat.bark/veg.street', T['bark_c'], T['bark_n'], roughness=.93),
            VB.material('mat.bark/veg.street.birch', T['birch_c'], T['birch_n'], roughness=.8, normal_strength=.7),
            VB.material('mat.foliage/veg.street', T['leaf_c'], alpha_clip=.42, roughness=.72, double=True)]
    root = bpy.data.objects.new(ASSET_ID, None)
    sc.collection.objects.link(root)
    root['ll_asset_id'] = ASSET_ID
    root['ll_asset_version'] = VERSION
    root['ll_rig'] = 'none'
    root['ll_license'] = LICENSE
    root['ll_source'] = 'assets/source/vegetation/street/veg.street-trees.blend'
    root['ll_frame'] = 'tree-local: x, -z horizontal, y up from the ground at the trunk; placed by vegetation.js records'
    stats = {}
    for v in variants(only):
        sk = v['skel']
        node = bpy.data.objects.new(v['id'], None)
        sc.collection.objects.link(node)
        node.parent = root
        ao = None
        st = {}
        crown = float(np.percentile(np.hypot(sk.P[:, 0], sk.P[:, 1]), 97))
        for lod in (0, 1, 2):
            buf, nc, ao = VT.mesh_tree(sk, v['species'], lod, v['seed'], ao=ao)
            if v['species'] == 'young' and lod < 2:
                VT.stake(buf)
            arr = buf.arrays()
            ob = VB.mesh_from(arr, f"{v['id']}:lod{lod}", sc.collection, mats, custom_normals=True)
            ob.parent = node
            ob['ll_lod'] = lod
            st[f'lod{lod}'] = {'tris': int(buf.tris), 'cards': int(nc)}
        node['ll_species'] = v['species']
        node['ll_variant'] = v['id']
        node['ll_height'] = round(float(sk.H), 2)
        node['ll_crown'] = round(crown, 2)
        node['ll_trunk'] = round(float(sk.R[int(np.argmin(sk.par))]), 3)
        node['ll_origin'] = v['origin']
        stats[v['id']] = {**st, 'height': node['ll_height'], 'crown': node['ll_crown'], 'trunk': node['ll_trunk'], 'origin': v['origin']}
        print(v['id'], st, f"H {sk.H:.1f} crown {crown:.1f}", f'{time.time() - t0:.0f}s', flush=True)
    os.makedirs(SRC, exist_ok=True)
    with open(os.path.join(SRC, 'build-stats.json'), 'w') as f:
        json.dump({'asset': ASSET_ID, 'version': VERSION, 'variants': stats}, f, indent=1)
    if '--no-export' not in argv:
        VB.export(OUT)
    blend = os.path.join(SRC, 'veg.street-trees.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    if os.path.exists(blend + '1'):
        os.remove(blend + '1')
    print('done', f'{time.time() - t0:.0f}s')


if __name__ == '__main__':
    main(sys.argv[1:])
