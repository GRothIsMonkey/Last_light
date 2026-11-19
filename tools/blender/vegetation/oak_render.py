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
    R.cycles(sc, 16 if quick else 64)
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
        R.render(sc, path, res=res, samples=16 if quick else 64)
        print('rendered', path, flush=True)


if __name__ == '__main__':
    main(sys.argv[1:])
