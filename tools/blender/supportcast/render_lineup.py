"""Same-scale lineup of Jamie's mother (chr.jamie-mother) beside Jamie's Phase 1A design (Astra's editable chr.jamie.a12
source, read only: appended into a scratch scene, never saved back). Offline Cycles renders, NOT the game.

    python3 tools/blender/supportcast/render_lineup.py <jamie .blend> <out_dir>

The Jamie source is the Phase 1A correction-pass model carried on codex/astra-phase1b-protagonist-animation
(assets/review/alex-phase1a/models/jamie/chr.jamie.a12.blend, git blob recorded in the report); his published design branch
codex/astra-phase1a-jamie-sketchfab-redesign (42340fe) holds the design report and provenance but no .blend. Nothing here
modifies Jamie's files.
"""
import math, os, sys
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import render_supportcast as RS    # noqa: E402


def main():
    jamie, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.open_mainfile(filepath=RS.BLENDS['jamie-mother'])
    sc, cam = RS.setup()
    arm = next(o for o in sc.objects if o.type == 'ARMATURE')
    head = next(o for o in sc.objects if o.type == 'MESH' and o.data.shape_keys)
    RS.pose(arm, 'idle_breathe', 0)
    RS.face(head, RS.FACES['neutral'])
    # append Jamie's character collections (anatomy, eyes and brows, hair, summer kit, cap)
    with bpy.data.libraries.load(jamie, link=False) as (src, dst):
        dst.collections = [c for c in src.collections if c[:2] in ('01', '02', '03', '04', '05')]
    holder = bpy.data.collections.new('Jamie (Phase 1A, read-only reference)')
    sc.collection.children.link(holder)
    offset = Vector((.62, 0, 0))
    for c in dst.collections:
        holder.children.link(c)
    roots = set()
    for c in dst.collections:
        for o in c.all_objects:
            p = o
            while p.parent is not None:
                p = p.parent
            roots.add(p)
    for r in roots:
        if r.name not in sc.objects:
            try:
                holder.objects.link(r)
            except RuntimeError:
                pass
        r.location = r.location + offset
    bpy.context.view_layer.update()
    # heights: the mother's crown and Jamie's (the top of his cap / hair)
    def top(objs):
        z = -1
        for o in objs:
            if o.type in ('MESH', 'CURVE'):
                for v in o.bound_box:
                    z = max(z, (o.matrix_world @ Vector(v)).z)
        return z
    mz = top([o for o in sc.objects if o.name.startswith('JamieMother')])
    jz = top([o for c in dst.collections for o in c.all_objects])
    print('heights', round(mz, 3), round(jz, 3), flush=True)
    views = {
        'lineup-front': ((.31, -5.2, 1.0), (.31, 0, .84), 50, (1500, 1200)),
        'lineup-three-quarter': ((3.4, -4.2, 1.1), (.31, 0, .84), 50, (1500, 1200)),
        'lineup-heads': ((.31, -1.9, 1.45), (.31, 0, 1.40), 70, (1500, 1000)),
    }
    for name, (cp, tg, lens, res) in views.items():
        cam.location = cp
        cam.data.lens = lens
        cam.rotation_euler = (Vector(tg) - Vector(cp)).to_track_quat('-Z', 'Y').to_euler()
        sc.render.resolution_x, sc.render.resolution_y = res
        sc.cycles.samples = 64
        sc.render.filepath = os.path.join(out, f'jamie-mother-{name}-with-jamie-phase1a--BLENDER-RENDER.png')
        bpy.ops.render.render(write_still=True)
        print('rendered', sc.render.filepath, flush=True)
    with open(os.path.join(out, 'lineup-heights.txt'), 'w') as f:
        f.write(f'mother crown {mz:.3f} m; Jamie (Phase 1A source, cap on) top {jz:.3f} m; Jamie offset +{offset.x} m in x\n')


if __name__ == '__main__':
    main()
