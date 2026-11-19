"""Last Light vegetation: shared Blender helpers (paths, import, measurement, presentation).

Offline Cycles renders made with these helpers are rank-6 evidence (VISUAL-QA-ACCEPTANCE §1): not the game.
The light rig matches tools/blender/houses/house_render.py (ACES 1.3, the Prologue's golden hour) so every
benchmark gallery is comparable.
"""
import math
import os
import sys
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SOURCES = os.path.join(ROOT, 'assets', 'source', 'vegetation')
ORIGINALS = os.path.join(SOURCES, 'third-party', 'sketchfab-originals')
QA = os.path.join(ROOT, 'docs', 'qa', 'vegetation')
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'houses'))
import house_render as HR  # noqa: E402  (the house gallery's light rig, reused unchanged)


def originals_dir():
    """The four rebuilt original GLBs (reconstruct.py output). Rebuilt on demand, verified by the manifest."""
    out = os.environ.get('LL_VEG_ORIGINALS') or os.path.join(ORIGINALS, 'reconstructed')
    need = ['200_year_old_oak_tree.glb', 'realistic_trees_collection.glb',
            'bush_models_pack_gameready_lods.glb', 'grass_and_bush_-_mobile_gameready.glb']
    if not all(os.path.exists(os.path.join(out, n)) for n in need):
        import subprocess
        os.makedirs(out, exist_ok=True)
        for n in need:
            p = os.path.join(out, n)
            if os.path.exists(p):
                os.remove(p)
        subprocess.check_call([sys.executable, '-I', os.path.join(ORIGINALS, 'reconstruct.py'), '--output', out])
    return out


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_glb(path, collection_name):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    objs = [o for o in bpy.data.objects if o not in before]
    col = bpy.data.collections.new(collection_name)
    bpy.context.scene.collection.children.link(col)
    for o in objs:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        col.objects.link(o)
    return col, objs


def world_bbox(objs):
    lo = Vector((1e9, 1e9, 1e9))
    hi = -lo
    for o in objs:
        if o.type != 'MESH':
            continue
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    return lo, hi


def tri_count(o):
    me = o.data
    return sum(len(p.vertices) - 2 for p in me.polygons)


def look(scene, look='golden', azimuth=None, elevation=None):
    HR.lights(scene, look, azimuth, elevation)


camera = HR.camera
render = HR.render
ground_mat = HR.ground_mat
plane = HR.plane
