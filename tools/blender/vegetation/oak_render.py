"""Blender renders of the old oak (offline Cycles; rank 6 evidence, not the game).

    python tools/blender/vegetation/oak_render.py [--quick] [views...]
views: front side three_quarter trunk swing canopy golden dusk   (default: all)
-> docs/qa/vegetation/oak/B<n>_<view>.jpg

The oak is shown on the lookout's real ground (the game's groundY grid), with the bench, the field fence and the tire
swing exactly where the game puts them (tools/assets/oak-site.mjs). Bearings are oak-local (deg from +X = +lat toward
+Y = +d): the cul-de-sac lies at ~249 deg, the bench at ~161 deg, the swing at 191.8 deg.
"""
import json
import math
import os
import sys
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_render as R  # noqa: E402

ROOT = R.ROOT
OAK = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'oak')
OUT = os.path.join(R.QA, 'oak')


def P(bearing, dist, z):
    a = math.radians(bearing)
    return (math.cos(a) * dist, math.sin(a) * dist, z)


VIEWS = {
    # name: (index, camera, target, lens, look, sun azimuth, sun elevation)
    # sun: the bearing where the sun stands (veg_render.sun), and its elevation
    'front': (1, P(249, 42, 1.7), (0, 0, 8.6), 35, 'golden', 205, 16),
    'side': (2, P(159, 42, 1.7), (0, 0, 8.6), 35, 'golden', 200, 16),
    'three_quarter': (3, P(206, 34, 4.5), (-.5, 0, 8.0), 35, 'golden', 245, 16),
    'trunk': (4, None, None, 30, 'golden', 150, 14),
    'swing': (5, None, None, 30, 'golden', 215, 12),
    'canopy': (6, P(300, 8.5, 1.6), P(300, 13.0, 7.5), 40, 'golden', 300, 9),
    'golden': (7, P(222, 31, 1.55), (0, 0, 7.4), 32, 'golden', 185, 5),
    'dusk': (8, P(249, 46, 1.6), (0, 0, 8.6), 32, 'dusk', 255, -2.5),
}


def meadow(site):
    """The lookout's planting (vegetation-assets.js meadowPoints, in the oak's frame): the tall meadow beyond the field
    fence, longer grass and clover on the knoll; the trodden way, the swing's worn patch, the trunk, the bench and the
    old bike's place left clear."""
    import numpy as np
    sys.path.insert(0, HERE)
    import scene_renders as SR
    blend = os.path.join(R.ROOT, 'assets', 'source', 'vegetation', 'ground', 'veg.ground.blend')
    G = SR.append(blend, SR.lod0_names(blend, ''))
    for o in G.values():
        o.hide_render = True
    g = lambda n: G[n + ':lod0']
    rng = np.random.default_rng(1958)
    grid = site['grid']
    rows = np.array(grid['rows'])

    def ground(x, y):
        i = int(np.clip(round((y - grid['f0']) / grid['step']), 0, rows.shape[0] - 1))
        j = int(np.clip(round((x - grid['x0']) / grid['step']), 0, rows.shape[1] - 1))
        return float(rows[i, j])
    piv = site['swing']['pivot']
    bench = site['bench']['at']
    bike = site['marks']['oldBike']['at']
    fence = site['fence']['f']
    tall = [g('meadow.tall.1'), g('meadow.tall.2')]
    for y in np.arange(fence + .6, fence + 34, .45):
        for x in np.arange(-38, 38, .45):
            xx, yy, r = x + rng.uniform(-.2, .2), y + rng.uniform(-.2, .2), rng.random()
            if rng.random() < max(0, (abs(xx) - 26) / 12, (yy - fence - 22) / 12):      # thinning out at the edges
                continue
            o = tall[rng.integers(2)] if r < .4 else g('meadow.dry.1') if r < .48 else g('weed.seedstalk.1') if r < .53 else g('flower.lace.1') if r < .58 else g('flower.susan.1') if r < .62 else g('grass.long.' + str(1 + rng.integers(2)))
            SR.place(o, (xx, yy, ground(xx, yy)), rng.uniform(0, 6.28), rng.uniform(.8, 1.35))
    for y in np.arange(-14, fence, .45):
        for x in np.arange(-16, 16, .45):
            xx, yy = x + rng.uniform(-.2, .2), y + rng.uniform(-.2, .2)
            d = math.hypot(xx, yy)
            if d < 1.7 or math.hypot(xx - piv[0], yy - piv[1]) < 1.6 or (abs(xx - bench[0]) < 1.6 and abs(yy - bench[1]) < 1.3) or math.hypot(xx - bike[0], yy - bike[1]) < 1.2:
                continue
            if abs(xx - (-8.5 + (yy + 25.5) * .12)) < 1.15 and yy < 7:     # the trodden way from the stop
                continue
            if ground(xx, yy) < -.25:                                         # the bulb's asphalt
                continue
            r = rng.random()
            edge = max(0, (yy - 6) / 5) + max(0, (abs(xx) - 11) / 5)
            if r > (.72 + edge * .25) * (.8 if d < 9 else 1):
                continue
            o = tall[rng.integers(2)] if r < .08 + edge * .25 else g('meadow.dry.1') if r < .14 else g('weed.clover.1') if r < .22 else g('grass.long.' + str(1 + rng.integers(2)))
            SR.place(o, (xx, yy, ground(xx, yy)), rng.uniform(0, 6.28), (.7 if d < 9 else .85) + rng.uniform(0, .45))


def main(argv):
    quick = '--quick' in argv
    names = [a for a in argv if not a.startswith('--')] or list(VIEWS)
    bpy.ops.wm.open_mainfile(filepath=os.path.join(OAK, 'lm.old-oak.blend'))
    sc = bpy.context.scene
    site = json.load(open(os.path.join(HERE, 'oak_site.json')))
    anchors = json.loads(bpy.data.objects['lm.old-oak']['ll_anchors'])
    # only LOD0 renders (the hero view); LOD1/2 are judged in the LOD lineup
    for o in sc.objects:
        if o.type == 'MESH' and o.get('ll_lod', 0) != 0:
            o.hide_render = True
    R.presentation_materials()
    R.lookout_ground(site, R.meadow_material(site))
    R.lookout_props(site, limb_r=anchors['swingLimb']['radius_at_pivot'])
    if '--no-meadow' not in argv:
        meadow(site)
    R.cycles(sc, 16 if quick else 32)
    os.makedirs(OUT, exist_ok=True)
    piv = site['swing']['pivot']
    car = anchors['carving']
    for name in names:
        idx, cam, tgt, lens, look, saz, sel = VIEWS[name]
        if name == 'trunk':
            b = car['bearing']                        # radians (oak_build.py ll_anchors)
            cam = (math.cos(b) * 2.4 - math.sin(b) * .9, math.sin(b) * 2.4 + math.cos(b) * .9, 1.4)
            tgt = (car['centre'][0], car['centre'][1], 1.12)
        if name == 'swing':
            a = math.atan2(piv[1], piv[0])
            perp = (math.sin(a), -math.cos(a))
            cam = (piv[0] + perp[0] * 7.5 + math.cos(a) * 1.5, piv[1] + perp[1] * 7.5 + math.sin(a) * 1.5, 1.45)
            tgt = (piv[0] * .75, piv[1] * .75, 3.3)
        if look == 'dusk':
            R.dusk(sc, saz)
        else:
            R.sun(sc, saz, sel, look)
        R.camera(sc, cam, tgt, lens=lens)
        res = (800, 500) if quick else (1600, 1000)
        path = os.path.join(OUT, f'B{idx}_{name}.jpg')
        R.render(sc, path, res=res, samples=16 if quick else 32)
        print('rendered', path, flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
