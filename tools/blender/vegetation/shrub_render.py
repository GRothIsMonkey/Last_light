"""Blender lineup of the shrub library (offline Cycles; rank 6 evidence, not the game).
    python tools/blender/vegetation/shrub_render.py [--quick]  -> docs/qa/vegetation/shrubs/C10_shrub_lineup.jpg
Shrubs stand on a mulch bed in front of a plain foundation wall, the way the Prologue's houses plant them."""
import os
import sys
import bpy
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import veg_render as R  # noqa: E402

SRC = os.path.join(R.ROOT, 'assets', 'source', 'vegetation', 'shrubs')


def main(argv):
    quick = '--quick' in argv
    bpy.ops.wm.open_mainfile(filepath=os.path.join(SRC, 'veg.shrubs.blend'))
    sc = bpy.context.scene
    R.presentation_materials()
    nodes = sorted([o for o in sc.objects if o.get('ll_variant')], key=lambda o: (['globe', 'hedge', 'natural', 'flowering'].index(o['ll_kind']), o.name))
    rows = [[n for n in nodes if n['ll_kind'] == 'natural'], [n for n in nodes if n['ll_kind'] != 'natural']]
    span = 0.0
    for r, row in enumerate(rows):
        x = 0.0
        for n in row:
            w = float(n['ll_size'][0])
            n.location = (x + w / 2, -r * 2.0, 0)
            x += w + .3
            for c in n.children:
                c.hide_render = c.get('ll_lod', 0) != 0
        for n in row:
            n.location.x -= x / 2
        span = max(span, x)
    mulch = R.simple_mat('ref.mulch', (.12, .07, .04), .95)
    wall = R.simple_mat('ref.foundation', (.42, .40, .37), .9)
    siding = R.simple_mat('ref.siding', (.62, .60, .55), .7)
    R.box('ref.bed', (0, -1.0, .02), (span + 1, 3.8, .04), mulch)
    R.box('ref.foundation', (0, 1.4, .3), (span + 1, .3, .6), wall)
    R.box('ref.siding', (0, 1.45, 1.8), (span + 1, .2, 2.4), siding)
    R.HR.plane(sc, 'ref.ground', -200, 200, -200, 200, 0, R.meadow_material(None))
    R.cycles(sc, 16 if quick else 64)
    R.sun(sc, 250, 22)
    R.camera(sc, (0, -span * .55 - 2, 3.6), (0, -.8, .5), lens=32)
    out = os.path.join(R.QA, 'shrubs')
    os.makedirs(out, exist_ok=True)
    R.render(sc, os.path.join(out, 'C10_shrub_lineup.jpg'), res=(1000, 520) if quick else (2200, 1100), samples=16 if quick else 32)


if __name__ == '__main__':
    main(sys.argv[1:])
