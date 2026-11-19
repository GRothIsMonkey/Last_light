"""Stage A: import the four Sketchfab originals in Blender, measure them and render inspection lineups.

python tools/blender/vegetation/inspect_sources.py   (bpy 5.0.1)  -> docs/qa/vegetation/stageA/*.jpg + inspect.json
"""
import json
import math
import os
import sys
import bpy
from mathutils import Vector
sys.path.insert(0, os.path.dirname(__file__))
import veg_common as C  # noqa: E402

OUT = os.path.join(C.QA, 'stageA')
os.makedirs(OUT, exist_ok=True)
src = C.originals_dir()
report = {}


def summarize(name, objs):
    rows = []
    for o in objs:
        if o.type != 'MESH':
            continue
        lo, hi = C.world_bbox([o])
        rows.append({'object': o.name, 'tris': C.tri_count(o), 'verts': len(o.data.vertices),
                     'materials': [m.name for m in o.data.materials if m],
                     'min': [round(v, 3) for v in lo], 'max': [round(v, 3) for v in hi]})
    report[name] = rows
    return rows


def studio(scene, look='review'):
    C.look(scene, look)
    g = C.ground_mat('inspect.ground', (.18, .18, .17), (.24, .24, .22), scale=3, rough=.95, bump=.05)
    C.plane(scene, 'inspect.ground', -200, 200, -200, 200, 0, g)


# ---- 1. Realistic Trees Collection --------------------------------------------------------------------------------
C.reset()
sc = bpy.context.scene
col, objs = C.import_glb(os.path.join(src, 'realistic_trees_collection.glb'), 'trees')
rows = summarize('realistic_trees_collection', objs)
# group meshes into trees by their parent empty name prefix (Tree EZTree0.Large, ...)
groups = {}
for r in rows:
    key = r['object'].split('_')[0].replace('Tree EZTree', 'EZ').rsplit('.', 0)[0]
    base = r['object'].rsplit('_', 2)[0]
    groups.setdefault(base, []).append(r)
trees = {}
for o in objs:
    if o.type == 'MESH':
        k = o.name.split('_')[0]
        trees.setdefault(k, []).append(o)
summary = []
for k, os_ in trees.items():
    lo, hi = C.world_bbox(os_)
    summary.append({'tree': k, 'tris': sum(C.tri_count(o) for o in os_), 'height': round(hi.z - lo.z, 2),
                    'width_x': round(hi.x - lo.x, 2), 'width_y': round(hi.y - lo.y, 2),
                    'center': [round((lo.x + hi.x) / 2, 2), round((lo.y + hi.y) / 2, 2), round(lo.z, 2)]})
report['trees_summary'] = summary
print(json.dumps(summary, indent=1))
lo, hi = C.world_bbox([o for o in objs if o.type == 'MESH'])
studio(sc)
mid = (lo + hi) / 2
span = max(hi.x - lo.x, hi.y - lo.y)
C.camera(sc, (mid.x, lo.y - span * 1.1, mid.z * .9 + 2), (mid.x, mid.y, (lo.z + hi.z) * .45), lens=35)
C.render(sc, os.path.join(OUT, 'A1_trees_collection_as_supplied.jpg'), res=(1600, 900), samples=24)

# ---- 2. Bush pack ---------------------------------------------------------------------------------------------------
C.reset()
sc = bpy.context.scene
col, objs = C.import_glb(os.path.join(src, 'bush_models_pack_gameready_lods.glb'), 'bushes')
rows = summarize('bush_models_pack', objs)
lo, hi = C.world_bbox([o for o in objs if o.type == 'MESH'])
report['bush_bounds'] = [list(lo), list(hi)]
studio(sc)
mid = (lo + hi) / 2
span = max(hi.x - lo.x, hi.y - lo.y)
C.camera(sc, (mid.x, lo.y - span * .75, span * .35), (mid.x, mid.y, 0.5), lens=35)
C.render(sc, os.path.join(OUT, 'A2_bush_pack_as_supplied.jpg'), res=(1600, 900), samples=24)

# ---- 3. Grass pack ----------------------------------------------------------------------------------------------------
C.reset()
sc = bpy.context.scene
col, objs = C.import_glb(os.path.join(src, 'grass_and_bush_-_mobile_gameready.glb'), 'grass')
rows = summarize('grass_pack', objs)
lo, hi = C.world_bbox([o for o in objs if o.type == 'MESH'])
report['grass_bounds'] = [list(lo), list(hi)]
studio(sc)
mid = (lo + hi) / 2
span = max(hi.x - lo.x, hi.y - lo.y, hi.z - lo.z)
C.camera(sc, (mid.x, lo.y - span * 1.4, mid.z + span * .3), (mid.x, mid.y, mid.z), lens=40)
C.render(sc, os.path.join(OUT, 'A3_grass_pack_as_supplied.jpg'), res=(1600, 900), samples=24)

with open(os.path.join(OUT, 'inspect.json'), 'w') as f:
    json.dump(report, f, indent=1, default=float)
print('done')
