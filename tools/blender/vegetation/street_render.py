"""Blender lineup of the street-tree library (offline Cycles; rank 6 evidence, not the game).

    python tools/blender/vegetation/street_render.py [--quick] [--species maple,oak] [--out name]
-> docs/qa/vegetation/street/C9_street_tree_lineup.jpg (one row per species, LOD0, golden hour)
"""
import math
import os
import sys
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_render as R  # noqa: E402

SRC = os.path.join(R.ROOT, 'assets', 'source', 'vegetation', 'street')


def main(argv):
    quick = '--quick' in argv
    species = argv[argv.index('--species') + 1].split(',') if '--species' in argv else None
    name = argv[argv.index('--out') + 1] if '--out' in argv else 'C9_street_tree_lineup'
    bpy.ops.wm.open_mainfile(filepath=os.path.join(SRC, 'veg.street-trees.blend'))
    sc = bpy.context.scene
    R.presentation_materials()
    nodes = [o for o in sc.objects if o.get('ll_variant')]
    rows = {}
    for n in nodes:
        if species and n['ll_species'] not in species:
            for c in n.children:
                c.hide_render = True
            continue
        rows.setdefault(n['ll_species'], []).append(n)
    order = [s for s in ('maple', 'oak', 'ash', 'birch', 'young', 'pine', 'spruce') if s in rows]
    gap_x, gap_y = 14.0, 22.0
    for r, sp in enumerate(order):
        for k, n in enumerate(sorted(rows[sp], key=lambda o: o.name)):
            n.location = ((k - (len(rows[sp]) - 1) / 2) * gap_x, r * gap_y, 0)
            for c in n.children:
                c.hide_render = c.get('ll_lod', 0) != 0
    g = R.meadow_material(None)
    R.HR.plane(sc, 'ref.ground', -300, 300, -300, 400, 0, g)
    R.cycles(sc, 16 if quick else 48)
    R.sun(sc, 230, 14)
    W = max(len(v) for v in rows.values())
    depth = (len(order) - 1) * gap_y
    span = W * gap_x
    R.camera(sc, (0, -span * .62 - 6, 9 + depth * .25), (0, depth * .42, 5.5), lens=35)
    out = os.path.join(R.QA, 'street')
    os.makedirs(out, exist_ok=True)
    R.render(sc, os.path.join(out, name + '.jpg'), res=(1000, 700) if quick else (2000, 1300), samples=16 if quick else 48)


if __name__ == '__main__':
    main(sys.argv[1:])
