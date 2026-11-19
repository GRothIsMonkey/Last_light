"""Blender scenes with the whole vegetation library (offline Cycles; rank 6 evidence, not the game).

    python tools/blender/vegetation/scene_renders.py [--quick] street|grass|oak-meadow [views...]
  street      C12: a completed suburban street: three of the authored Prologue houses (house.prologue.blend, unchanged) on
              their setbacks, the street set of the house gallery, street trees, foundation shrubs and a lawn of blade clumps
  grass       C11: grass and ground vegetation close-up (lawn edge at the sidewalk; the lookout meadow)
  oak-meadow  B1-B8 again with the lookout meadow planted around the oak (the in-game planting rules, simplified)
"""
import json
import math
import os
import sys
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_render as R  # noqa: E402

ROOT = R.ROOT
SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation')
HOUSE_BLEND = os.path.join(ROOT, 'assets', 'source', 'house', 'prologue', 'house.prologue.blend')
rng = np.random.default_rng(2011)


def append(blend, names):
    with bpy.data.libraries.load(blend, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if n in names]
    out = {}
    for o in dst.objects:
        if o is None:
            continue
        o.parent = None
        out[o.name] = o
    return out


def place(src, loc, rot=0.0, scale=1.0, coll=None):
    o = src.copy()
    (coll or bpy.context.scene.collection).objects.link(o)
    o.location = loc
    o.rotation_euler = (0, 0, rot)
    o.scale = (scale, scale, scale)
    o.hide_render = False          # (the appended sources are hidden; their copies are what renders)
    return o


def lod0_names(blend, prefix):
    with bpy.data.libraries.load(blend, link=False) as (src, dst):
        return [n for n in src.objects if n.startswith(prefix) and n.endswith(':lod0')]


def scatter_lawn(clumps, x0, x1, y0, y1, density, avoid=lambda x, y: False, z=0.0, scale=(.85, 1.25)):
    n = int((x1 - x0) * (y1 - y0) * density)
    for i in range(n):
        x, y = rng.uniform(x0, x1), rng.uniform(y0, y1)
        if avoid(x, y):
            continue
        place(clumps[rng.integers(len(clumps))], (x, y, z), rng.uniform(0, 6.28), rng.uniform(*scale))


def street(quick):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    plans = {h['id']: h for h in json.load(open(os.path.join(ROOT, 'tools', 'blender', 'houses', 'plans.json')))['houses']}
    ids = ['house.lotR8', 'house.lotR37', 'house.lotR66']
    across = ['house.lotL8', 'house.lotL37', 'house.lotL66']
    S = plans[ids[0]]['setback']
    # the houses (LOD0 only): three in a row 29 m apart on this side, three across the street (turned to face it),
    # each on its own setback
    with bpy.data.libraries.load(HOUSE_BLEND, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if any(n.startswith(i + ':') for i in ids + across) and n.endswith(':lod0')]
    for o in dst.objects:
        hid = o.name.split(':')[0]
        sc.collection.objects.link(o)
        o.parent = None
        if hid in ids:
            o.location = ((ids.index(hid) - 1) * 29.0, S - plans[hid]['setback'], 0)
        else:
            o.location = ((across.index(hid) - 1) * 29.0 + 14.5, -2 * S - (S - plans[hid]['setback']), 0)
            o.rotation_euler = (0, 0, math.pi)
    R.HR.street_set(sc, S, x0=-80, x1=80, extra_back=30)
    # the far side's lawn and walk (the house gallery's set is one-sided): mirrored about the centre line
    grass_m = bpy.data.materials['render.grass']
    conc_m = bpy.data.materials['render.concrete']
    R.HR.plane(sc, 'set.lawn2', -80, 80, -2 * S - 30, -2 * S + S - 7.85, -.002, grass_m)
    R.HR.plane(sc, 'set.walk2', -80, 80, -S - 7.85, -S - 6.35, .14, conc_m)
    R.HR.plane(sc, 'set.strip2', -80, 80, -S - 6.35, -S - 5.0, .12, grass_m)
    R.HR.plane(sc, 'set.curb2', -80, 80, -S - 5.0, -S - 4.7, .15, conc_m)
    trees = append(os.path.join(SRC, 'street', 'veg.street-trees.blend'), lod0_names(os.path.join(SRC, 'street', 'veg.street-trees.blend'), 'tree.'))
    shrubs = append(os.path.join(SRC, 'shrubs', 'veg.shrubs.blend'), lod0_names(os.path.join(SRC, 'shrubs', 'veg.shrubs.blend'), 'shrub.'))
    ground = append(os.path.join(SRC, 'ground', 'veg.ground.blend'), lod0_names(os.path.join(SRC, 'ground', 'veg.ground.blend'), 'grass.'))
    for d in (trees, shrubs, ground):
        for o in d.values():
            o.hide_render = True
    T = lambda n: trees[f'tree.{n}:lod0']
    # front-yard and back-yard trees, all different, sized like the game's (crowns kept off the houses)
    for name, x, y, s in (('maple.2', -20, -S + 10.6, .82), ('oak.4', 9.5, -S + 11.4, .78), ('birch.3', -36, -S + 11, .9), ('maple.6', 24, -S + 10.4, .8),
                          ('young.2', 40, -S + 9.9, 1.0), ('ash.2', -6, 13, .95), ('spruce.2', 18, 16, .85), ('maple.4', 46, 15, 1.0), ('pine.3', -44, 17, .9),
                          ('maple.7', -58, -S + 10.8, .85), ('oak.1', 58, -S + 11.2, .8),
                          ('maple.1', -8, -S - 10.8, .84), ('ash.5', 22, -S - 11.4, .82), ('maple.8', 50, -S - 10.6, .86), ('spruce.4', -30, -S - 12, .8),
                          ('oak.2', 36, -S - 25, .95), ('maple.3', -48, -S - 10.4, .8)):
        place(T(name), (x, y, 0), rng.uniform(0, 6.28), s)
    # foundation beds: clipped globes at one house, natural shrubs at the next, mixed at the third; perennials in front
    mulch = R.simple_mat('ref.mulch', (.10, .065, .04), .95)
    styles = [['shrub.globe.1', 'shrub.globe.2', 'shrub.hedge.1'], ['shrub.natural.medium.3', 'shrub.natural.big.2', 'shrub.natural.medium.5'], ['shrub.globe.3', 'shrub.natural.medium.2', 'shrub.flowering.1']]
    for k, hid in enumerate(ids):
        h = plans[hid]
        cx, cy = (k - 1) * 29.0, S - h['setback']
        front = cy - h['front']
        for side in (-1, 1):
            x0, x1 = (cx - h['w'] / 2 + .3, cx + h['doorX'] - h['porchW'] / 2 - .2) if side < 0 else (cx + h['doorX'] + h['porchW'] / 2 + .2, cx + h['w'] / 2 - .3)
            if x1 - x0 < 1:
                continue
            R.box('ref.bed', ((x0 + x1) / 2, front - .55, .03), (x1 - x0, .9, .06), mulch)
            x = x0 + .6
            j = 0
            while x < x1 - .3:
                v = styles[k][j % len(styles[k])]
                place(shrubs[v + ':lod0'], (x, front - .55, .05), rng.uniform(0, 6.28) if 'hedge' not in v else 0, rng.uniform(.85, 1.1))
                if j % 2 == 0 and k != 0:
                    place(shrubs['shrub.flowering.2:lod0'], (x + .5, front - .95, .05), rng.uniform(0, 6.28), .8)
                x += 1.5 + rng.random() * .5
                j += 1
    # the lawn: blade clumps near the camera (the street edge and the front yards), the ground material beyond
    clumps = [ground[f'grass.lawn.{i}:lod0'] for i in (1, 2, 3)] + [ground['grass.long.1:lod0']]
    houses_box = [((k - 1) * 29.0, S - plans[h]['setback'], plans[h]['w'] / 2 + 6.5, plans[h]['depth'] / 2 + 1.4) for k, h in enumerate(ids)]
    avoid = lambda x, y: any(abs(x - hx) < hw and abs(y - hy) < hd for hx, hy, hw, hd in houses_box)
    scatter_lawn(clumps, -45, 45, -S + 7.9, -S + 16, 6 if not quick else 1.5, avoid)
    scatter_lawn(clumps, -45, 45, -S + 5.05, -S + 6.3, 8 if not quick else 2)
    scatter_lawn(clumps, -45, 45, -S - 6.3, -S - 5.05, 8 if not quick else 2)
    scatter_lawn(clumps, -45, 45, -S - 14, -S - 7.9, 4 if not quick else 1)
    R.presentation_materials()
    R.cycles(sc, 16 if quick else 64)
    R.sun(sc, 205, 11)
    R.camera(sc, (-34, -S - 1.6, 1.55), (10, -S + 3.2, 2.6), lens=30)
    out = os.path.join(R.QA, 'street')
    R.render(sc, os.path.join(out, 'C12_completed_street.jpg'), res=(1000, 560) if quick else (2000, 1120), samples=16 if quick else 32)
    R.camera(sc, (12, -S - 4, 4.2), (-6, -S + 10, 2.0), lens=28)
    R.render(sc, os.path.join(out, 'C12b_completed_street_reverse.jpg'), res=(1000, 560) if quick else (2000, 1120), samples=16 if quick else 32)


def grass(quick):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    S = 19.0
    R.HR.street_set(sc, S, x0=-20, x1=20, extra_back=12)
    ground = append(os.path.join(SRC, 'ground', 'veg.ground.blend'), lod0_names(os.path.join(SRC, 'ground', 'veg.ground.blend'), ''))
    for o in ground.values():
        o.hide_render = True
    G = lambda n: ground[n + ':lod0']
    lawn = [G('grass.lawn.1'), G('grass.lawn.2'), G('grass.lawn.3')]
    scatter_lawn(lawn, -6, 6, -S + 7.9, -S + 14, 26 if not quick else 6)
    scatter_lawn([G('grass.long.1'), G('grass.long.2')], -6, 6, -S + 7.86, -S + 8.3, 30)       # the unedged lawn along the walk
    scatter_lawn([G('weed.clover.1')], -4, 4, -S + 9, -S + 12, 2.5)
    scatter_lawn(lawn, -6, 6, -S + 5.05, -S + 6.3, 26 if not quick else 6)
    # a patch of the lookout meadow at the back of the lawn (tall grass, dry tufts, wildflowers, seed stalks)
    mead = [G('meadow.tall.1'), G('meadow.tall.2'), G('meadow.dry.1'), G('flower.lace.1'), G('flower.susan.1'), G('weed.seedstalk.1'), G('grass.long.2')]
    scatter_lawn(mead, -6, 6, -S + 14.5, -S + 19, 9, scale=(.8, 1.3))
    R.presentation_materials()
    R.cycles(sc, 16 if quick else 96)
    R.sun(sc, 215, 13)
    R.camera(sc, (-.6, -S + 6.9, .42), (1.2, -S + 13, .15), lens=28)
    R.render(sc, os.path.join(R.QA, 'ground', 'C11_grass_close_up.jpg'), res=(1000, 560) if quick else (2000, 1120), samples=16 if quick else 40)
    R.camera(sc, (2.5, -S + 11.4, .65), (-.5, -S + 18, .45), lens=32)
    R.render(sc, os.path.join(R.QA, 'ground', 'C11b_meadow_close_up.jpg'), res=(1000, 560) if quick else (2000, 1120), samples=16 if quick else 40)


def main(argv):
    quick = '--quick' in argv
    what = [a for a in argv if not a.startswith('--')]
    os.makedirs(os.path.join(R.QA, 'ground'), exist_ok=True)
    if 'street' in what:
        street(quick)
    if 'grass' in what:
        grass(quick)


if __name__ == '__main__':
    main(sys.argv[1:])
