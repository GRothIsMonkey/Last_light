"""Residential shrubs (veg.shrubs) from LOLIPOP's "Bush models pack (gameready, LODs)" (CC BY 4.0), rebuilt for Last Light.

    python tools/blender/vegetation/shrub_build.py

What is kept from the pack: the 15 bushes' geometry and their LOD0/LOD1/LOD2 chain (the billboards, the checker floor
and the human scale figure are not used), and the pack's branch-and-leaf atlas, graded to the shared late-August
palette and re-packed with three colour variants. What is new: alpha-tested (not blended) leaves, the shared street bark
on the stems, baked occlusion (COLOR_0) and wind (_WIND) by the vegetation standard; trimmed foundation shapes made from
the pack's own leaves (rounded "boxwood" globes and short hedge blocks: the bush's leaves pulled into a clipped
envelope); low flowering perennials (small bushes with an original flower layer). Some families clip, some do not.
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
import veg_mesh as VM            # noqa: E402
import veg_blender as VB         # noqa: E402
import veg_paths                 # noqa: E402
import ez_skeleton as E          # noqa: E402  (GLB reading helpers)

ROOT = VB.ROOT
SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'shrubs')
TEX = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'textures')
OUT = os.path.join(ROOT, 'dist', 'assets', 'veg', 'veg.shrubs.glb')
ASSET_ID = 'veg.shrubs'
LICENSE = ('Last Light (Roth Studios). Shrub geometry, LODs and leaf atlas adapted from "Bush models pack (gameready, LODs)" by '
           'LOLIPOP (https://skfb.ly/pLE8N), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/): leaves re-graded and '
           're-packed, materials rebuilt (alpha-tested), occlusion and wind baked, trimmed and flowering variants derived. '
           'The author does not endorse Last Light.')
MAT_BARK, MAT_LEAF = 0, 1


def read_pack():
    """{bush name: {lod: {'bark': (P,N,UV,I), 'leaf': (...)}}} in Blender frame (Z up), metres, base at the origin."""
    path = veg_paths.original('bush_models_pack_gameready_lods.glb')
    d, js, bo = E._load(path)
    out = {}
    for ni, n in enumerate(js['nodes']):
        if 'mesh' not in n:
            continue
        m = js['meshes'][n['mesh']]
        name = m['name']
        if not name.startswith('Bush_') or 'Billboard' in name:
            continue
        bush = '_'.join(name.split('_')[:3])            # Bush_big_001
        lod = int(name.split('_LOD')[1][0])
        part = 'leaf' if 'Brunch' in name else 'bark'
        M = E._world(js, ni)
        pr = m['primitives'][0]
        P = E._acc(d, js, bo, pr['attributes']['POSITION'])
        N = E._acc(d, js, bo, pr['attributes']['NORMAL'])
        UV = E._acc(d, js, bo, pr['attributes']['TEXCOORD_0'])
        I = E._acc(d, js, bo, pr['indices']).ravel()
        P = P @ M[:3, :3].T + M[:3, 3]
        N = N @ M[:3, :3].T
        N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-9
        P = np.stack([P[:, 0], -P[:, 2], P[:, 1]], 1)
        N = np.stack([N[:, 0], -N[:, 2], N[:, 1]], 1)
        out.setdefault(bush, {}).setdefault(lod, {})[part] = (P, N, UV, I)
    # each bush to its own origin (the pack lines them up in rows)
    for bush, lods in out.items():
        allp = np.concatenate([p[0] for lod in lods.values() for p in lod.values()])
        c = np.array([np.median(allp[:, 0]), np.median(allp[:, 1]), allp[:, 2].min()])
        for lod in lods.values():
            for k, (P, N, UV, I) in list(lod.items()):
                lod[k] = (P - c, N, UV, I)
    return out


def shrub_atlas(n=2048):
    """2x2: the pack's branch atlas graded (privet-like), darker and denser (yew / boxwood), yellow-green (spirea),
    and the graded atlas with an original flower layer (hydrangea / phlox clusters) for the perennials."""
    import veg_textures as T
    from PIL import Image, ImageDraw
    imgs, js = T.read_glb_images(veg_paths.original('bush_models_pack_gameready_lods.glb'))
    mi = next(i for i, m in enumerate(js['materials']) if m['name'] == 'Brunch_material')
    src_i = js['textures'][js['materials'][mi]['pbrMetallicRoughness']['baseColorTexture']['index']]['source']
    a = np.asarray(imgs[src_i].convert('RGBA').resize((n // 2, n // 2), Image.LANCZOS), dtype=np.float64) / 255
    a = T.pad_color(a)
    base = T.grade(a, 'shrub')
    dark = base.copy()
    dark[..., :3] = T.lin_to_srgb(T.srgb_to_lin(dark[..., :3]) * np.array([.62, .74, .70]))
    yel = base.copy()
    yel[..., :3] = T.lin_to_srgb(T.srgb_to_lin(yel[..., :3]) * np.array([1.25, 1.18, .72]))
    flw = base.copy()
    im = Image.fromarray((flw * 255).astype(np.uint8), 'RGBA')
    d = ImageDraw.Draw(im)
    rng = np.random.default_rng(5)
    alpha = flw[..., 3] > .5
    ys, xs = np.nonzero(alpha)
    for k in range(260):
        j = rng.integers(len(xs))
        cx, cy = xs[j], ys[j]
        col = [(232, 216, 235), (214, 150, 190), (245, 240, 228), (170, 160, 225)][k % 4]
        for q in range(14):
            ox, oy = rng.normal(0, 9, 2)
            r = rng.uniform(3, 6)
            shade = rng.uniform(.82, 1.05)
            d.ellipse([cx + ox - r, cy + oy - r, cx + ox + r, cy + oy + r], fill=tuple(int(c * shade) for c in col) + (255,))
    flw = np.asarray(im, dtype=np.float64) / 255
    atlas = np.zeros((n, n, 4))
    c = n // 2
    atlas[:c, :c], atlas[:c, c:], atlas[c:, :c], atlas[c:, c:] = base, dark, yel, flw
    T.save(T.pad_color(atlas), 'leaf.shrubs__basecolor.png', 'RGBA')
    return os.path.join(TEX, 'leaf.shrubs__basecolor.png')


def clip_envelope(P, kind, size):
    """Pull leaf vertices into a clipped envelope (a gardener's shears): 'globe' (rounded) or 'hedge' (rounded box)."""
    Q = P.copy()
    if kind == 'globe':
        rx, ry, rz = size
        c = np.array([0, 0, rz])
        v = (Q - c) / np.array([rx, ry, rz])
        r = np.linalg.norm(v, axis=1)
        k = np.where(r > .82, .82 / np.maximum(r, 1e-6) + (r - .82) * .08 / np.maximum(r, 1e-6), 1.0)
        Q = c + v * k[:, None] * np.array([rx, ry, rz])
    else:
        hx, hy, hz = size
        for ax, h in ((0, hx), (1, hy)):
            Q[:, ax] = np.clip(Q[:, ax], -h, h) + (Q[:, ax] - np.clip(Q[:, ax], -h, h)) * .06
        Q[:, 2] = np.minimum(Q[:, 2], hz + (Q[:, 2] - hz).clip(0) * .06)
    return Q


def bake(P, H, seed, leaf):
    """occlusion (deeper inside, lower = darker) and wind data for one shrub piece"""
    rng = np.random.default_rng(seed)
    r = np.hypot(P[:, 0], P[:, 1])
    R = max(.2, np.percentile(r, 95))
    depth = np.clip(1 - r / R, 0, 1)
    occ = np.clip(.95 - .45 * depth ** 1.5 - .25 * np.clip(1 - P[:, 2] / max(H, .2), 0, 1) ** 2, .35, 1)
    flex = np.clip(P[:, 2] / max(H, .2), 0, 1) ** 1.3 * (.4 + .6 * np.clip(r / R, 0, 1))
    ph = np.full(len(P), rng.random())
    W = np.stack([flex, ph, flex * (.6 if leaf else 0), np.full(len(P), rng.random()) if leaf else np.zeros(len(P))], 1)
    return occ, W


def add_piece(buf, P, N, UV, I, mat, cell, H, seed, leaf, tint=(1, 1, 1)):
    occ, W = bake(P, H, seed, leaf)
    UV = np.stack([UV[:, 0], 1 - UV[:, 1]], 1)          # glTF (v down) -> Blender (v up); the exporter flips it back
    if leaf:                                             # into the shrub atlas cell (2x2, cell 0 = top left)
        cx, cy = cell % 2, cell // 2
        UV = np.stack([UV[:, 0] * .5 + cx * .5, UV[:, 1] * .5 + (1 - cy) * .5], 1)
    C = occ[:, None] * np.array(tint)[None]
    buf.add(P, UV, C, W, I.reshape(-1, 3), mat, N if leaf else None)


def main():
    t0 = time.time()
    pack = read_pack()
    atlas = shrub_atlas()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.scale_length = 1.0
    rt = os.path.join(SRC, 'textures')
    T = {'leaf': VB.runtime_texture(atlas, os.path.join(rt, 'veg.shrubs__leaves_basecolor.png'), 1024, 'RGBA'),
         'bark_c': VB.runtime_texture(os.path.join(TEX, 'bark.broadleaf__basecolor.png'), os.path.join(rt, 'veg.shrubs__bark_basecolor.jpg'), 512, 'RGB')}
    mats = [VB.material('mat.bark/veg.shrubs', T['bark_c'], roughness=.92),
            VB.material('mat.foliage/veg.shrubs', T['leaf'], alpha_clip=.45, roughness=.75, double=True)]
    root = bpy.data.objects.new(ASSET_ID, None)
    sc.collection.objects.link(root)
    root['ll_asset_id'] = ASSET_ID
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = LICENSE
    root['ll_source'] = 'assets/source/vegetation/shrubs/veg.shrubs.blend'
    stats = {}
    variants = []
    names = sorted(pack)
    # natural shrubs: every pack bush, leaf colour by size family
    for k, b in enumerate(names):
        fam = b.split('_')[1]
        cell = {'big': (0, 1), 'medium': (0, 2), 'small': (2, 0)}[fam][k % 2]
        variants.append(dict(id=f'shrub.natural.{fam}.{b[-1]}', src=b, kind='natural', cell=cell, clip=None, scale=1.0))
    # trimmed foundation shrubs from the pack's own leaves
    for j, b in enumerate(['Bush_big_002', 'Bush_big_004', 'Bush_big_005']):
        variants.append(dict(id=f'shrub.globe.{j + 1}', src=b, kind='globe', cell=1, clip=('globe', (.62, .62, .48) if 'big' in b else (.45, .45, .38)), scale=1.0))
    for j, b in enumerate(['Bush_big_001', 'Bush_big_003']):
        variants.append(dict(id=f'shrub.hedge.{j + 1}', src=b, kind='hedge', cell=1 if j == 0 else 0, clip=('hedge', (.62, .4, .82)), scale=1.0))
    # low flowering perennials (small bushes with the flower layer)
    for j, b in enumerate(['Bush_small_001', 'Bush_small_003', 'Bush_small_005']):
        variants.append(dict(id=f'shrub.flowering.{j + 1}', src=b, kind='flowering', cell=3, clip=None, scale=.75))
    for v in variants:
        node = bpy.data.objects.new(v['id'], None)
        sc.collection.objects.link(node)
        node.parent = root
        lods = pack[v['src']]
        st = {}
        for lod in (0, 1, 2):
            if lod not in lods:
                continue
            buf = VM.MeshBuf()
            allp = np.concatenate([p[0] for p in lods[lod].values()])
            H = float(allp[:, 2].max()) * v['scale']
            for part, (P, N, UV, I) in lods[lod].items():
                P = P * v['scale']
                if v['clip'] and part == 'leaf':
                    P = clip_envelope(P, *v['clip'])
                if v['clip'] and part == 'bark':
                    P = clip_envelope(P, *v['clip']) * np.array([.9, .9, .92])
                add_piece(buf, P, N, UV, I, MAT_LEAF if part == 'leaf' else MAT_BARK, v['cell'], H, hash(v['id']) % 1000, part == 'leaf')
            # density: trimmed shapes are solid masses of leaves (the pack's next-coarser leaf layer, turned and clipped
            # into the same envelope); the big natural bushes get one extra turned layer
            extra = {'globe': [(1.57, .96), (3.67, .9)], 'hedge': [(1.57, .97), (3.14, .93)], 'natural': [(2.1, .9)] if 'small' not in v['src'] else []}.get(v['kind'], [])
            src_lod = min(2, lod + 1)
            if extra and 'leaf' in lods.get(src_lod, {}):
                P0, N0, UV0, I0 = lods[src_lod]['leaf']
                for ang, sc_ in extra:
                    ca, sa = math.cos(ang), math.sin(ang)
                    Rm = np.array([[ca, -sa, 0], [sa, ca, 0], [0, 0, 1.0]])
                    Pq = (P0 * v['scale'] * np.array([sc_, sc_, sc_ * 1.02])) @ Rm.T
                    Nq = N0 @ Rm.T
                    if v['clip']:
                        Pq = clip_envelope(Pq, *v['clip'])
                    add_piece(buf, Pq, Nq, UV0, I0, MAT_LEAF, v['cell'], H, hash(v['id']) % 1000 + 7, True)
            arr = buf.arrays()
            ob = VB.mesh_from(arr, f"{v['id']}:lod{lod}", sc.collection, mats, custom_normals=True)
            ob.parent = node
            ob['ll_lod'] = lod
            st[f'lod{lod}'] = int(buf.tris)
        allp = np.concatenate([p[0] for p in lods[0].values()]) * v['scale']
        if v['clip']:
            allp = clip_envelope(allp, *v['clip'])
        node['ll_variant'] = v['id']
        node['ll_kind'] = v['kind']
        node['ll_source'] = v['src']
        size = [round(float(x), 3) for x in (np.ptp(allp[:, 0]), np.ptp(allp[:, 1]), allp[:, 2].max())]
        node['ll_size'] = size
        stats[v['id']] = {**st, 'size': size, 'source': v['src']}
        print(v['id'], st, size, flush=True)
    os.makedirs(SRC, exist_ok=True)
    with open(os.path.join(SRC, 'build-stats.json'), 'w') as f:
        json.dump({'asset': ASSET_ID, 'variants': stats}, f, indent=1)
    VB.export(OUT)
    blend = os.path.join(SRC, 'veg.shrubs.blend')
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
    if os.path.exists(blend + '1'):
        os.remove(blend + '1')
    print('done', f'{time.time() - t0:.0f}s')


if __name__ == '__main__':
    main()
