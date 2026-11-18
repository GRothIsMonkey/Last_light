"""Last Light: build one of the four boys' bicycles in Blender, from nothing (plus, for Jamie's BMX, harvested parts of
the CC BY 4.0 Sketchfab BMX), bake and synthesize its textures, save the editable .blend, and export the runtime GLB.

    python tools/blender/bikes/build_bike.py -- --bike bike.jamie [--stage geometry|full] [--clay out.jpg]

(bpy 5.0.1 as a Python module, or `blender --background --factory-startup --python tools/blender/bikes/build_bike.py -- ...`)

Outputs (BLENDER-PIPELINE.md conventions):
    assets/source/bike/<id>/bike.<id>.blend           scenes EXPORT (what ships) and REF (anchors, harvest originals)
    assets/source/bike/<id>/textures/bike.<id>__*.jpg|png    runtime-size textures (authored at 2x, downsampled)
    dist/assets/bike/bike.<id>.glb                    via tools/blender/ll_export.py
"""
import sys
import os
import json
import math
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))

import bpy
import numpy as np
from mathutils import Vector, Matrix
import bike_kit as K
import bike_parts as BP
import bike_designs as BD

VERSION = 1
LICENSE_ORIGINAL = 'Original work for Last Light (Roth Studios).'


def args():
    a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    o = {'bike': 'bike.jamie', 'stage': 'full', 'clay': None, 'source': None, 'lods': '0,1,2', 'parts': None, 'render': None, 'harvest': '1'}
    for i, k in enumerate(a):
        if k.startswith('--') and i + 1 < len(a):
            o[k[2:]] = a[i + 1]
    return o


def anchors(bike_id):
    with open(os.path.join(HERE, 'anchors.json')) as fh:
        return json.load(fh)['bikes'][bike_id]


def fresh():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'EXPORT'
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 1.0
    return sc


SOURCE_GLB = os.path.join(ROOT, 'assets', 'source', 'bike', 'third-party', 'sketchfab-bmx-bike-mitchell', 'bmx_bike.glb')


class Harvester:
    """Imports the Sketchfab BMX once (into the REF scene) and hands Jamie's design its components per LOD."""
    def __init__(self, path):
        import source_bmx
        self.S = source_bmx
        self.path = path
        self.ref = bpy.data.scenes.get('REF') or bpy.data.scenes.new('REF')
        self.report = {}
        self.loaded = None

    def __call__(self, C, pids, extra):
        if self.loaded is None:
            self.loaded = self.S.load(self.path, self.ref)     # one untouched copy of the source in the REF scene
        budget_scale = (1.0, .32, .1)[C.lod]
        saved = dict(self.S.PARTS)
        self.S.PARTS = {k: (v[0], max(24, int(v[1] * budget_scale))) for k, v in saved.items()}
        try:
            out, rep, coll = self.S.harvest(self.path, C, self.ref, pids, extra, loaded=self.loaded)
        finally:
            self.S.PARTS = saved
        self.report[C.lod] = rep
        return out


def build_nodes(bike_id, lod, parts, harvest=None):
    A = anchors(bike_id)
    fn, offset = BD.DESIGNS[bike_id]
    C = BP.Ctx(A, lod, parts, offset)
    col = {}
    N = fn(C, col, harvest=harvest)
    return C, N, col


def make_materials(bike_id):
    mats = {}
    for slot, fam in (('paint', 'mat.metal.painted'), ('hardware', 'mat.metal.bare'), ('soft', 'mat.rubber')):
        name = f'{fam}/{bike_id}.{"frame" if slot == "paint" else slot}'
        m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        mats[slot] = m
    return mats


def objects_for(bike_id, lod, N, parts, mats, coll, root):
    out = {}
    for node, m in N.items():
        if not m.f:
            continue
        name = f'{bike_id}:{node}' + ('' if lod == 0 else f':lod{lod}')
        ob = K.to_object(bpy, name, m, parts, mats, coll)
        ob.parent = root
        ob['ll_node'] = node
        ob['ll_lod'] = lod
        out[node] = ob
    return out


# ----------------------------------------------------------------------------------------------------------------------
# UV atlas packing, baking utility maps, texture synthesis, materials
# ----------------------------------------------------------------------------------------------------------------------
import bmesh
from mathutils.bvhtree import BVHTree
import bike_textures as TX

SLOTS = ('paint', 'hardware', 'soft')
AUTHOR = 2048
RUNTIME = 1024


def select_only(objs, active):
    if bpy.context.object and bpy.context.object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')
    for ob in bpy.context.view_layer.objects:
        ob.select_set(False)
    for ob in objs:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = active


def pack_atlases(objs, mats):
    """Pack each material's UV islands (across all LOD0 objects) into its own 0-1 atlas at one texel density."""
    for ob in objs:
        ob.data.uv_layers.active = ob.data.uv_layers['UVMap']
    select_only(objs, objs[0])
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.context.scene.tool_settings.use_uv_select_sync = True
    for slot in SLOTS:
        any_face = False
        for ob in objs:
            bm = bmesh.from_edit_mesh(ob.data)
            idx = {i for i, m in enumerate(ob.data.materials) if m == mats[slot]}
            for f in bm.faces:
                f.select = f.material_index in idx
                any_face |= f.select
            bmesh.update_edit_mesh(ob.data)
        if not any_face:
            continue
        kw = dict(rotate=True, scale=True, margin=0.0035)
        try:
            bpy.ops.uv.pack_islands(udim_source='CLOSEST_UDIM', margin_method='FRACTION', shape_method='CONCAVE',
                                    rotate_method='AXIS_ALIGNED', **kw)
        except TypeError:
            bpy.ops.uv.pack_islands(**kw)
    bpy.ops.object.mode_set(mode='OBJECT')


def texel_density(objs, mats, res):
    out = {}
    for slot in SLOTS:
        a3 = auv = 0.0
        for ob in objs:
            me = ob.data
            idx = {i for i, m in enumerate(me.materials) if m == mats[slot]}
            uv = me.uv_layers['UVMap'].data
            for p in me.polygons:
                if p.material_index not in idx:
                    continue
                a3 += p.area
                pts = [uv[li].uv for li in p.loop_indices]
                ar = 0.0
                for i in range(1, len(pts) - 1):
                    ar += abs((pts[i] - pts[0]).cross(pts[i + 1] - pts[0])) / 2
                auv += ar
        out[slot] = res * math.sqrt(auv / a3) if a3 > 0 else 0
    return out


def _emission_setup(mat, kind, img):
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    em = nt.nodes.new('ShaderNodeEmission')
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    if kind == 'pos':
        g = nt.nodes.new('ShaderNodeNewGeometry')
        nt.links.new(g.outputs['Position'], em.inputs['Color'])
    elif kind == 'nrm':
        g = nt.nodes.new('ShaderNodeNewGeometry')
        nt.links.new(g.outputs['Normal'], em.inputs['Color'])
    elif kind == 'pid':
        at = nt.nodes.new('ShaderNodeAttribute')
        at.attribute_name = 'pid'
        nt.links.new(at.outputs['Fac'], em.inputs['Color'])
    elif kind == 'pat':
        uvn = nt.nodes.new('ShaderNodeUVMap')
        uvn.uv_map = 'pattern'
        nt.links.new(uvn.outputs['UV'], em.inputs['Color'])
    elif kind == 'ao':
        ao = nt.nodes.new('ShaderNodeAmbientOcclusion')
        ao.samples = 24
        ao.inputs['Distance'].default_value = 0.05
        nt.links.new(ao.outputs['AO'], em.inputs['Color'])
    elif kind == 'edge':
        bev = nt.nodes.new('ShaderNodeBevel')
        bev.samples = 8
        bev.inputs['Radius'].default_value = 0.0012
        g = nt.nodes.new('ShaderNodeNewGeometry')
        dot = nt.nodes.new('ShaderNodeVectorMath')
        dot.operation = 'DOT_PRODUCT'
        nt.links.new(bev.outputs['Normal'], dot.inputs[0])
        nt.links.new(g.outputs['Normal'], dot.inputs[1])
        inv = nt.nodes.new('ShaderNodeMath')
        inv.operation = 'SUBTRACT'
        inv.inputs[0].default_value = 1.0
        nt.links.new(dot.outputs['Value'], inv.inputs[1])
        nt.links.new(inv.outputs['Value'], em.inputs['Color'])
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = img
    nt.nodes.active = t


def bake_maps(objs, mats, res=AUTHOR):
    """Bake the utility maps into float images, one per atlas and kind. Returns {slot: {kind: ndarray(H, W, k)}}."""
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.render.bake.margin = 12
    try:
        sc.render.bake.margin_type = 'EXTEND'
    except Exception:
        pass
    select_only(objs, objs[0])
    out = {slot: {} for slot in SLOTS}
    chans = {'pos': 3, 'nrm': 3, 'pid': 1, 'pat': 2, 'ao': 1, 'edge': 1}
    for kind in ('pid', 'pos', 'nrm', 'pat', 'ao', 'edge'):
        imgs = {}
        for slot in SLOTS:
            img = bpy.data.images.new(f'bake.{kind}.{slot}', res, res, alpha=False, float_buffer=True)
            img.colorspace_settings.name = 'Non-Color'
            imgs[slot] = img
            _emission_setup(mats[slot], kind, img)
        sc.cycles.samples = 6 if kind in ('ao', 'edge') else 1
        t = time.time()
        bpy.ops.object.bake(type='EMIT', use_clear=True, margin=12)
        print(f'  bake {kind}: {time.time() - t:.1f}s')
        for slot in SLOTS:
            arr = np.empty(res * res * 4, np.float32)
            imgs[slot].pixels.foreach_get(arr)
            out[slot][kind] = arr.reshape(res, res, 4)[..., :chans[kind]].copy()
            bpy.data.images.remove(imgs[slot])
    return out


def downsample(img, kind):
    h, w, c = img.shape
    if kind == 'basecolor':
        lin = TX.srgb2lin(img)
        d = lin.reshape(h // 2, 2, w // 2, 2, c).mean(axis=(1, 3))
        return TX.lin2srgb(d)
    d = img.reshape(h // 2, 2, w // 2, 2, c).mean(axis=(1, 3))
    if kind == 'normal':
        n = d * 2 - 1
        n /= np.linalg.norm(n, axis=-1, keepdims=True)
        return n * .5 + .5
    return d


def save_image(bike_id, tex_dir, name, rgb, fmt):
    h, w, _ = rgb.shape
    img = bpy.data.images.new(f'{bike_id}__{name}', w, h, alpha=False, float_buffer=False)
    rgba = np.concatenate([np.clip(rgb, 0, 1), np.ones((h, w, 1), np.float32)], -1).astype(np.float32)
    img.pixels.foreach_set(rgba.ravel())
    ext = 'png' if fmt == 'PNG' else 'jpg'
    path = os.path.join(tex_dir, f'{bike_id}__{name}.{ext}')
    img.filepath_raw = path
    img.file_format = fmt
    if fmt == 'JPEG':
        bpy.context.scene.render.image_settings.quality = 92
    img.save()
    img.filepath = path
    if name.endswith('normal') or name.endswith('orm'):
        img.colorspace_settings.name = 'Non-Color'
    return img


def gltf_output_group():
    g = bpy.data.node_groups.get('glTF Material Output')
    if g:
        return g
    g = bpy.data.node_groups.new('glTF Material Output', 'ShaderNodeTree')
    try:
        g.interface.new_socket('Occlusion', in_out='INPUT', socket_type='NodeSocketFloat')
        g.interface.new_socket('Thickness', in_out='INPUT', socket_type='NodeSocketFloat')
    except AttributeError:
        g.inputs.new('NodeSocketFloat', 'Occlusion')
        g.inputs.new('NodeSocketFloat', 'Thickness')
    g.nodes.new('NodeGroupInput')
    return g


def wire_material(mat, base, orm, normal, normal_strength=1.0):
    """Principled BSDF wired the way the glTF exporter reads it (BLENDER-PIPELINE.md 6), ORM's R as occlusion."""
    nt = mat.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    out.location = (400, 0)
    bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
    nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    tb = nt.nodes.new('ShaderNodeTexImage'); tb.image = base; tb.location = (-700, 300)
    nt.links.new(tb.outputs['Color'], bsdf.inputs['Base Color'])
    to = nt.nodes.new('ShaderNodeTexImage'); to.image = orm; to.location = (-700, 0)
    sep = nt.nodes.new('ShaderNodeSeparateColor'); sep.location = (-400, 0)
    nt.links.new(to.outputs['Color'], sep.inputs['Color'])
    nt.links.new(sep.outputs['Green'], bsdf.inputs['Roughness'])
    nt.links.new(sep.outputs['Blue'], bsdf.inputs['Metallic'])
    grp = nt.nodes.new('ShaderNodeGroup'); grp.node_tree = gltf_output_group(); grp.location = (100, -300)
    nt.links.new(sep.outputs['Red'], grp.inputs['Occlusion'])
    tn = nt.nodes.new('ShaderNodeTexImage'); tn.image = normal; tn.location = (-700, -300)
    nm = nt.nodes.new('ShaderNodeNormalMap'); nm.location = (-400, -300)
    nm.inputs['Strength'].default_value = normal_strength
    nt.links.new(tn.outputs['Color'], nm.inputs['Color'])
    nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    mat.use_backface_culling = True


def transfer_uvs(src_objs, dst_objs, mats):
    """LOD1/LOD2 atlas UVs from LOD0: each target face takes the nearest LOD0 triangle of the same node and material
    (at the face centre) and maps all its corners through that triangle's affine 3D->UV map, so faces never straddle
    an atlas seam."""
    for node, dst in dst_objs.items():
        src = src_objs.get(node)
        if src is None:
            continue
        sme, dme = src.data, dst.data
        suv = sme.uv_layers['UVMap'].data
        trees = {}
        for mi, m in enumerate(sme.materials):
            tris, corners = [], []
            verts = [v.co.copy() for v in sme.vertices]
            sme.calc_loop_triangles()
            for lt in sme.loop_triangles:
                if lt.material_index != mi:
                    continue
                tris.append(tuple(lt.vertices))
                corners.append(tuple(lt.loops))
            if tris:
                trees[m.name] = (BVHTree.FromPolygons(verts, tris), tris, corners, verts)
        duv = dme.uv_layers['UVMap'].data
        for p in dme.polygons:
            m = dme.materials[p.material_index].name
            if m not in trees:
                continue
            tree, tris, corners, verts = trees[m]
            loc, nrm, fi, dist = tree.find_nearest(p.center)
            if fi is None:
                continue
            a, b, c = (verts[i] for i in tris[fi])
            ua, ub, uc = (suv[l].uv for l in corners[fi])
            e1, e2 = b - a, c - a
            n = e1.cross(e2)
            nn = n.dot(n)
            if nn < 1e-18:
                continue
            for li in p.loop_indices:
                q = dme.vertices[dme.loops[li].vertex_index].co
                q = q - n * ((q - a).dot(n) / nn)
                w = q - a
                # barycentric in the triangle's plane (may be outside the triangle: affine extension)
                d00, d01, d11 = e1.dot(e1), e1.dot(e2), e2.dot(e2)
                d20, d21 = w.dot(e1), w.dot(e2)
                den = d00 * d11 - d01 * d01
                if abs(den) < 1e-18:
                    continue
                vb = (d11 * d20 - d01 * d21) / den
                wb = (d00 * d21 - d01 * d20) / den
                ub_ = 1 - vb - wb
                duv[li].uv = ua * ub_ + ub * vb + uc * wb


def texture_stage(bike_id, objs0, mats, parts, colors, info, tex_dir):
    os.makedirs(tex_dir, exist_ok=True)
    t = time.time()
    pack_atlases(objs0, mats)
    dens = texel_density(objs0, mats, AUTHOR)
    print('  texel density (px/m at authoring size):', {k: round(v) for k, v in dens.items()}, f'{time.time() - t:.1f}s')
    maps = bake_maps(objs0, mats)
    decals = TX.decal_images(bike_id)
    tyre_img = TX.tyre_text_image(bike_id)
    tinfo = {}
    for k, v in info.items():
        tinfo[k] = dict(v)
        if k.startswith('frame_'):
            tinfo[k]['decals'] = decals
        if 'vmid' in v:
            ar = tyre_img.shape[1] / tyre_img.shape[0]
            th = .0062
            tinfo[k]['text'] = (tyre_img, th * ar, th)
    images = {}
    for slot in SLOTS:
        t = time.time()
        base, orm, normal = TX.synthesize(bike_id, maps[slot], parts.list, colors, tinfo, dens[slot], AUTHOR)
        names = {'paint': 'frame', 'hardware': 'hardware', 'soft': 'soft'}[slot]
        b = save_image(bike_id, tex_dir, f'{names}_basecolor', downsample(base, 'basecolor'), 'JPEG')
        o = save_image(bike_id, tex_dir, f'{names}_orm', downsample(orm, 'orm'), 'PNG')
        n = save_image(bike_id, tex_dir, f'{names}_normal', downsample(normal, 'normal'), 'PNG')
        wire_material(mats[slot], b, o, n)
        images[slot] = (b, o, n)
        print(f'  textures {slot}: {time.time() - t:.1f}s')
    return dens


def anchors_record(bike_id, C):
    A = anchors(bike_id)
    rec = {k: A[k] for k in ('wheelR', 'bb', 'rear', 'pivot', 'rake', 'crank', 'pedalX', 'saddle', 'grip', 'gripL', 'gripR',
                             'pedalL0', 'pedalR0', 'bell', 'bellLeverPivot', 'kickPivot', 'axleRear')}
    rec['frontRig'] = A['front']
    rec['axleFront'] = [0.0, round(C.front.y, 5), round(C.front.z, 5)]   # the authored front axle (see the review)
    rec['forkOffset'] = C.front_offset
    rec['frame'] = 'game bike-local: metres, +Y up, forward -Z, right +X (rig.js)'
    return rec


def strip_reference():
    """Drop the imported Sketchfab reference from the file (its packed 2048² images would double the repository size):
    the original is kept byte-for-byte beside the sources; a text block says where."""
    ref = bpy.data.scenes.get('REF')
    gone = 0
    for coll in [c for c in bpy.data.collections if c.name.startswith('REF.sketchfab')]:
        for ob in list(coll.objects):
            bpy.data.objects.remove(ob)
            gone += 1
        bpy.data.collections.remove(coll)
    if gone:
        for im in [i for i in bpy.data.images if i.name.startswith('Image_')]:
            bpy.data.images.remove(im)
        for m in [m for m in bpy.data.materials if m.users == 0]:
            bpy.data.materials.remove(m)
        for me in [m for m in bpy.data.meshes if m.users == 0]:
            bpy.data.meshes.remove(me)
        t = bpy.data.texts.get('sketchfab-source.txt') or bpy.data.texts.new('sketchfab-source.txt')
        t.from_string('Components of this bike come from "Bmx Bike" by Mitchell (https://skfb.ly/oUoKB), CC BY 4.0.\n'
                      'Original, byte for byte: assets/source/bike/third-party/sketchfab-bmx-bike-mitchell/bmx_bike.glb\n'
                      'SHA-256 11f3c4b640a7f7d89bb70b38e9a20c6e9370cbc47b2e8e55246117e2f013c950\n'
                      'Harvest script: tools/blender/bikes/source_bmx.py; record: docs/THIRD_PARTY_ASSETS.md\n')
    return gone


def save_and_export(bike_id, built, root, mats, build_info, dens):
    import ll_export
    key = bike_id.split('.')[1]
    src_dir = os.path.join(ROOT, 'assets', 'source', 'bike', key)
    C0 = build_info[0][0]
    harvested = bool(getattr(C0, 'harvested', None))
    root['ll_asset_id'] = bike_id
    root['ll_asset_version'] = VERSION
    root['ll_kind'] = 'bike'
    root['ll_rig'] = 'rig.bike'
    root['ll_source'] = f'assets/source/bike/{key}/{bike_id}.blend'
    root['ll_license'] = LICENSE_ORIGINAL + (
        ' Incorporates modified geometry from "Bmx Bike" by Mitchell (https://skfb.ly/oUoKB), licensed under CC BY 4.0 '
        '(http://creativecommons.org/licenses/by/4.0/); see docs/THIRD_PARTY_ASSETS.md.' if harvested else '')
    root['ll_anchors'] = json.dumps(anchors_record(bike_id, C0))
    root['ll_nodes'] = json.dumps(sorted({ob['ll_node'] for lod in built.values() for ob in lod.values()}))
    root['ll_lods'] = json.dumps({str(l): sorted(v.keys()) for l, v in built.items()})
    root['ll_texel_density_px_m'] = json.dumps({k: round(v * RUNTIME / AUTHOR) for k, v in dens.items()})
    for lod, objs in built.items():
        for ob in objs.values():
            ob.hide_render = lod > 0
    strip_reference()
    # REF scene: the anchors as a text block, for anyone opening the .blend
    ref = bpy.data.scenes.get('REF') or bpy.data.scenes.new('REF')
    txt = bpy.data.texts.get('anchors.json') or bpy.data.texts.new('anchors.json')
    txt.from_string(json.dumps(anchors_record(bike_id, C0), indent=1))
    for lod, objs in built.items():     # n-gons defeat MikkTSpace tangents at export: triangulate them
        for ob in objs.values():
            bm = bmesh.new()
            bm.from_mesh(ob.data)
            ng = [f for f in bm.faces if len(f.verts) > 4]
            if ng:
                bmesh.ops.triangulate(bm, faces=ng, quad_method='BEAUTY', ngon_method='BEAUTY')
                bm.to_mesh(ob.data)
            bm.free()
    os.makedirs(src_dir, exist_ok=True)
    blend = os.path.join(src_dir, bike_id + '.blend')
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True, relative_remap=True)
    print('build_bike: saved', blend)
    glb = os.path.join(ROOT, 'dist', 'assets', 'bike', bike_id + '.glb')
    ll_export.export_glb(glb, export_copyright='Roth Studios — Last Light' + (' (incorporates CC BY 4.0 geometry by Mitchell)' if harvested else ''))
    return blend, glb


def present_render(path, objs, views=('front34', 'side'), look='review', samples=48, res=(1600, 1000)):
    """Render the textured objects as they will ship (no material override)."""
    import ll_bike_render as R
    sc = bpy.data.scenes.new('PRESENT')
    for ob in objs:
        sc.collection.objects.link(ob)
    R.setup_scene(sc, look, res=res, samples=samples)
    out = []
    for v in views:
        V = R.VIEWS[v]
        cam = R.camera(sc, 'cam.' + v, V['loc'], V['target'], V['lens'])
        out.append(R.render(sc, cam, path.replace('.jpg', f'-{v}.jpg')))
    return out


def clay_render(path, objs):
    import ll_bike_render as R
    sc = bpy.data.scenes.new('CLAY')
    for ob in objs:
        sc.collection.objects.link(ob)
    clay = bpy.data.materials.new('clay')
    clay.use_nodes = True
    b = clay.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (.5, .48, .45, 1)
    b.inputs['Roughness'].default_value = .5
    for ob in objs:
        ob.data.materials.clear()
        ob.data.materials.append(clay)
    R.setup_scene(sc, 'review', res=(1600, 900), samples=24)
    V = R.VIEWS
    paths = []
    for v in (os.environ.get('CLAY_VIEWS') or 'side,front34').split(','):
        cam = R.camera(sc, 'cam.' + v, V[v]['loc'], V[v]['target'], V[v]['lens'])
        paths.append(R.render(sc, cam, path.replace('.jpg', f'-{v}.jpg')))
    return paths


def main():
    o = args()
    bike_id = o['bike']
    t0 = time.time()
    sc = fresh()
    parts = K.Parts()
    mats = make_materials(bike_id)
    coll = sc.collection
    root = bpy.data.objects.new(bike_id, None)
    coll.objects.link(root)
    lods = [int(x) for x in o['lods'].split(',')]
    built = {}
    build_info = {}
    harvester = Harvester(SOURCE_GLB) if (bike_id == 'bike.jamie' and o.get('harvest', '1') != '0') else None
    for lod in lods:
        C, N, col = build_nodes(bike_id, lod, parts, harvest=harvester)
        build_info[lod] = (C, N, col)
        built[lod] = objects_for(bike_id, lod, N, parts, mats, coll, root)
        tris = sum(m.tris() for m in N.values())
        print(f'build_bike: {bike_id} LOD{lod}: {tris} triangles; ' + ', '.join(f'{k} {v.tris()}' for k, v in N.items() if v.f))
        if o.get('parts'):
            by = {}
            for node, mm in N.items():
                for fc, p_ in zip(mm.f, mm.pid):
                    key = f'{node}/{parts.list[p_ - 1][0]}'
                    by[key] = by.get(key, 0) + len(fc) - 2
            print('  by part: ' + ', '.join(f'{k} {v}' for k, v in sorted(by.items(), key=lambda kv: -kv[1])[:28]))
    if o['stage'] != 'geometry':
        tex_dir = os.path.join(ROOT, 'assets', 'source', 'bike', bike_id.split('.')[1], 'textures')
        C0, N0, col0 = build_info[0]
        # only LOD0 may be seen by the bake rays: the lower LODs overlap it and would bake false occlusion
        for lod in lods:
            for ob in built[lod].values():
                ob.hide_render = lod > 0
        dens = texture_stage(bike_id, list(built[0].values()), mats, parts, col0, C0.info, tex_dir)
        for lod in lods:
            if lod > 0:
                transfer_uvs(built[0], built[lod], mats)
    if o['stage'] == 'full':
        save_and_export(bike_id, built, root, mats, build_info, dens)
    if o['render']:
        print('renders:', present_render(o['render'], list(built[lods[0]].values())))
    if o['clay']:
        objs = list(built[lods[0]].values())
        print('clay renders:', clay_render(o['clay'], objs))
    if harvester:
        print('build_bike: harvested from the Sketchfab BMX (source tris -> game tris):', harvester.report)
    print(f'build_bike: done in {time.time() - t0:.1f}s')


if __name__ == '__main__':
    main()
