"""Ground vegetation (veg.ground): lawn clumps, long grass, lookout meadow tufts, weeds and wildflowers.

    python tools/blender/vegetation/ground_build.py
Near the camera the lawn is real geometry (curved blades, ~90 triangles a clump); further out each clump is crossed
cards from the ground atlas; beyond ~20 m the lawn is the ground material alone (the runtime fades clumps out).
Meadow tufts, the dry tuft, weeds and the seed stalk are Ali haghshenas' sprites ("Grass And Bush - Mobile GameReady",
CC BY 4.0) on crossed cards; lawn blades, wildflowers and clover are original.
"""
import json
import math
import os
import sys
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_mesh as VM        # noqa: E402
import veg_blender as VB     # noqa: E402

ROOT = VB.ROOT
SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'ground')
TEX = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'textures')
OUT = os.path.join(ROOT, 'dist', 'assets', 'veg', 'veg.ground.glb')
ASSET_ID = 'veg.ground'
LICENSE = ('Last Light (Roth Studios). Meadow, dry grass, sprig and seed-stalk sprites adapted from "Grass And Bush - Mobile '
           'GameReady" by Ali haghshenas (https://skfb.ly/6WTVC), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/): '
           'cropped, turned upright, graded, re-packed; lawn blades, wildflowers and clover original. The author does not '
           'endorse Last Light.')
ATLAS = (4, 2)


def cell_uv(cell):
    cx, cy = cell % ATLAS[0], cell // ATLAS[0]
    return cx / ATLAS[0], (cx + 1) / ATLAS[0], 1 - (cy + 1) / ATLAS[1], 1 - cy / ATLAS[1]


def blades(buf, rng, n, h, spread, cell=0, lean=.25):
    """curved blades: each a 4-segment tapered strip sampling a thin vertical slice of the lawn-blade cell"""
    u0, u1, v0, v1 = cell_uv(cell)
    for i in range(n):
        x, y = rng.normal(0, spread, 2)
        H = rng.uniform(*h)
        az = rng.uniform(0, 2 * np.pi)
        lean_v = np.array([math.cos(az), math.sin(az)]) * rng.uniform(.05, lean) * H
        w = rng.uniform(.006, .011)
        side = np.array([-math.sin(az + 1.2), math.cos(az + 1.2), 0]) * w
        uc = u0 + (u1 - u0) * rng.uniform(.1, .9)
        du = (u1 - u0) * .006
        V, UV, F = [], [], []
        k = 4
        for s in range(k + 1):
            t = s / k
            c = np.array([x + lean_v[0] * t * t, y + lean_v[1] * t * t, H * t])
            ww = 1 - t * .9
            V += [c - side * ww, c + side * ww]
            UV += [[uc - du, v0 + (v1 - v0) * t * .9], [uc + du, v0 + (v1 - v0) * t * .9]]
        for s in range(k):
            a = s * 2
            F += [[a, a + 1, a + 3], [a, a + 3, a + 2]]
        V = np.array(V)
        W = np.zeros((len(V), 4))
        W[:, 0] = np.clip(V[:, 2] / max(h[1], .05), 0, 1)
        W[:, 1] = rng.random()
        W[:, 2] = W[:, 0]
        W[:, 3] = rng.random()
        occ = np.clip(.55 + .45 * V[:, 2] / max(h[1], .05), 0, 1)
        nrm = np.tile([0, 0, 1.0], (len(V), 1)) * .7 + np.tile(np.array([math.cos(az), math.sin(az), 0]) * .3, (len(V), 1))
        buf.add(V, np.array(UV), np.stack([occ] * 3, 1), W, np.array(F), 0, nrm)


def crossed(buf, rng, cell, size, count=2, tilt=.12, flat=False):
    u0, u1, v0, v1 = cell_uv(cell)
    a0 = rng.uniform(0, np.pi)
    for k in range(count):
        a = a0 + k * np.pi / count
        side = np.array([math.cos(a), math.sin(a), 0])
        up = np.array([rng.normal(0, tilt), rng.normal(0, tilt), 1.0])
        if flat:
            up = np.array([-math.sin(a), math.cos(a), .08])
        up /= np.linalg.norm(up)
        w, h = size
        base = np.array([0, 0, .0 if not flat else .01]) - (up * h * .5 if flat else 0)
        V = np.array([base - side * w / 2, base + side * w / 2, base + side * w / 2 + up * h, base - side * w / 2 + up * h])
        UV = np.array([[u0, v0], [u1, v0], [u1, v1], [u0, v1]])
        W = np.array([[0, rng.random(), 0, rng.random()]] * 2 + [[1, rng.random(), 1, rng.random()]] * 2, float)
        if flat:
            W[:, 0] = W[:, 2] = .15
        occ = np.array([.6, .6, 1, 1])
        buf.add(V, UV, np.stack([occ] * 3, 1), W, np.array([[0, 1, 2], [0, 2, 3]]), 0, np.tile([0, 0, 1.0], (4, 1)))


VARIANTS = [
    # id, lod0 builder, lod1 builder
    ('grass.lawn.1', lambda b, r: blades(b, r, 16, (.05, .09), .07), lambda b, r: crossed(b, r, 0, (.22, .09), 2)),
    ('grass.lawn.2', lambda b, r: blades(b, r, 14, (.06, .11), .08), lambda b, r: crossed(b, r, 0, (.24, .1), 2)),
    ('grass.lawn.3', lambda b, r: blades(b, r, 18, (.04, .08), .09), lambda b, r: crossed(b, r, 0, (.26, .08), 2)),
    ('grass.long.1', lambda b, r: (blades(b, r, 12, (.16, .32), .06, lean=.4), crossed(b, r, 0, (.3, .3), 2)), lambda b, r: crossed(b, r, 0, (.34, .3), 2)),
    ('grass.long.2', lambda b, r: (blades(b, r, 10, (.2, .38), .05, lean=.45), crossed(b, r, 0, (.28, .34), 2)), lambda b, r: crossed(b, r, 0, (.32, .34), 2)),
    ('meadow.tall.1', lambda b, r: crossed(b, r, 1, (.7, .75), 3), lambda b, r: crossed(b, r, 1, (.7, .75), 2)),
    ('meadow.tall.2', lambda b, r: crossed(b, r, 1, (.6, .62), 3), lambda b, r: crossed(b, r, 1, (.6, .62), 2)),
    ('meadow.dry.1', lambda b, r: crossed(b, r, 2, (.55, .5), 3), lambda b, r: crossed(b, r, 2, (.55, .5), 2)),
    ('weed.groundcover.1', lambda b, r: crossed(b, r, 3, (.38, .32), 2, flat=True), lambda b, r: crossed(b, r, 3, (.38, .32), 1, flat=True)),
    ('weed.seedstalk.1', lambda b, r: crossed(b, r, 4, (.42, .7), 2), lambda b, r: crossed(b, r, 4, (.42, .7), 1)),
    ('flower.lace.1', lambda b, r: crossed(b, r, 5, (.55, .7), 2), lambda b, r: crossed(b, r, 5, (.55, .7), 1)),
    ('flower.susan.1', lambda b, r: crossed(b, r, 6, (.5, .62), 2), lambda b, r: crossed(b, r, 6, (.5, .62), 1)),
    ('weed.clover.1', lambda b, r: crossed(b, r, 7, (.42, .42), 1, flat=True), lambda b, r: crossed(b, r, 7, (.42, .42), 1, flat=True)),
]


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.scale_length = 1.0
    tex = VB.runtime_texture(os.path.join(TEX, 'ground.atlas__basecolor.png'), os.path.join(SRC, 'textures', 'veg.ground__atlas_basecolor.png'), 2048, 'RGBA')
    mat = VB.material('mat.foliage/veg.ground', tex, alpha_clip=.4, roughness=.82, double=True)
    root = bpy.data.objects.new(ASSET_ID, None)
    sc.collection.objects.link(root)
    root['ll_asset_id'] = ASSET_ID
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = LICENSE
    root['ll_source'] = 'assets/source/vegetation/ground/veg.ground.blend'
    stats = {}
    for vid, f0, f1 in VARIANTS:
        node = bpy.data.objects.new(vid, None)
        sc.collection.objects.link(node)
        node.parent = root
        node['ll_variant'] = vid
        st = {}
        for lod, f in ((0, f0), (1, f1)):
            rng = np.random.default_rng(abs(hash(vid)) % 10000 + lod)
            buf = VM.MeshBuf()
            f(buf, rng)
            ob = VB.mesh_from(buf.arrays(), f'{vid}:lod{lod}', sc.collection, [mat], custom_normals=True)
            ob.parent = node
            ob['ll_lod'] = lod
            st[f'lod{lod}'] = int(buf.tris)
        stats[vid] = st
        print(vid, st)
    os.makedirs(SRC, exist_ok=True)
    with open(os.path.join(SRC, 'build-stats.json'), 'w') as f:
        json.dump({'asset': ASSET_ID, 'variants': stats}, f, indent=1)
    VB.export(OUT)
    blend = os.path.join(SRC, 'veg.ground.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    if os.path.exists(blend + '1'):
        os.remove(blend + '1')


if __name__ == '__main__':
    main()
