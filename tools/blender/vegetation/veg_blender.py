"""Last Light vegetation: turning veg_mesh MeshBuf arrays into Blender objects, and the shared vegetation materials.

Materials follow docs/art/BLENDER-PIPELINE.md §6 (Principled BSDF only, images in source format, ORM packing) so the
glTF is clean; the game replaces them with one vegetation shader (dist/vegetation-assets.js) that reads the same
textures plus COLOR_0 (baked occlusion) and _WIND. The render scripts (veg_render.py) add Cycles-only presentation
(leaf translucency, bark moss from _WIND.w) on top of these materials, never in the shipped file.
"""
import os
import numpy as np
import bpy

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))


def mesh_from(arr, name, collection, materials, custom_normals=False):
    P, F, UV, C, W, M = arr['P'], arr['F'], arr['UV'], arr['C'], arr['W'], arr['M']
    me = bpy.data.meshes.new(name)
    me.vertices.add(len(P))
    me.vertices.foreach_set('co', P.astype(np.float32).ravel())
    me.loops.add(len(F) * 3)
    me.loops.foreach_set('vertex_index', F.astype(np.int32).ravel())
    me.polygons.add(len(F))
    me.polygons.foreach_set('loop_start', np.arange(0, len(F) * 3, 3, dtype=np.int32))
    me.polygons.foreach_set('loop_total', np.full(len(F), 3, np.int32))
    me.polygons.foreach_set('material_index', M.astype(np.int32))
    me.update(calc_edges=True)
    uv = me.uv_layers.new(name='UVMap')
    uv.data.foreach_set('uv', UV[F.ravel()].astype(np.float32).ravel())
    col = me.color_attributes.new('Col', 'FLOAT_COLOR', 'POINT')
    col.data.foreach_set('color', np.concatenate([C, np.ones((len(C), 1))], 1).astype(np.float32).ravel())
    me.color_attributes.active_color = col
    me.color_attributes.render_color_index = 0
    wa = me.attributes.new('_WIND', 'FLOAT_COLOR', 'POINT')
    wa.data.foreach_set('color', W.astype(np.float32).ravel())
    for m in materials:
        me.materials.append(m)
    me.polygons.foreach_set('use_smooth', np.ones(len(F), bool))
    if custom_normals and arr.get('N') is not None:
        N = arr['N']
        has = np.linalg.norm(N, axis=1) > .5
        if has.any():
            me.update()
            vn = np.array([v.normal for v in me.vertices]) if not has.all() else None
            Nn = N.copy()
            if vn is not None:
                Nn[~has] = vn[~has]
            me.normals_split_custom_set_from_vertices([tuple(n) for n in Nn])
    me.validate(clean_customdata=False)
    ob = bpy.data.objects.new(name, me)
    collection.objects.link(ob)
    return ob


def _img(path, colorspace='sRGB'):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = colorspace
    return im


def _n(nt, kind, loc):
    n = nt.nodes.new(kind)
    n.location = loc
    return n


def material(name, base, normal=None, orm=None, alpha_clip=None, roughness=.9, normal_strength=1.0, double=False):
    """Principled BSDF wired the way the glTF exporter reads it. base colour x COLOR_0 (baked occlusion/tint)."""
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = _n(nt, 'ShaderNodeOutputMaterial', (600, 0))
    b = _n(nt, 'ShaderNodeBsdfPrincipled', (300, 0))
    nt.links.new(b.outputs['BSDF'], out.inputs['Surface'])
    tb = _n(nt, 'ShaderNodeTexImage', (-500, 200))
    tb.image = _img(base)
    tb.name = 'base'
    va = _n(nt, 'ShaderNodeVertexColor', (-500, 450))
    va.layer_name = 'Col'
    mul = _n(nt, 'ShaderNodeMix', (-150, 300))
    mul.data_type = 'RGBA'
    mul.blend_type = 'MULTIPLY'
    mul.inputs['Factor'].default_value = 1.0
    nt.links.new(tb.outputs['Color'], mul.inputs['A'])
    nt.links.new(va.outputs['Color'], mul.inputs['B'])
    nt.links.new(mul.outputs['Result'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = roughness
    b.inputs['Metallic'].default_value = 0.0
    if alpha_clip is not None:
        gt = _n(nt, 'ShaderNodeMath', (0, -50))
        gt.operation = 'GREATER_THAN'
        gt.inputs[1].default_value = alpha_clip
        nt.links.new(tb.outputs['Alpha'], gt.inputs[0])
        nt.links.new(gt.outputs[0], b.inputs['Alpha'])
        try:
            m.blend_method = 'CLIP'
        except Exception:
            pass
    if normal:
        tn = _n(nt, 'ShaderNodeTexImage', (-500, -250))
        tn.image = _img(normal, 'Non-Color')
        nm = _n(nt, 'ShaderNodeNormalMap', (0, -300))
        nm.inputs['Strength'].default_value = normal_strength
        nt.links.new(tn.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    if orm:
        to = _n(nt, 'ShaderNodeTexImage', (-500, -550))
        to.image = _img(orm, 'Non-Color')
        sp = _n(nt, 'ShaderNodeSeparateColor', (-150, -550))
        nt.links.new(to.outputs['Color'], sp.inputs['Color'])
        nt.links.new(sp.outputs['Green'], b.inputs['Roughness'])
    m.use_backface_culling = not double
    return m


def pad_rgba(im):
    """Fill the colour under transparent pixels from the nearest opaque ones (glb_pack.pad_rgba)."""
    import sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import glb_pack
    return glb_pack.pad_rgba(im)


def runtime_texture(src, dst, size, mode=None):
    """Downsample an authoring texture to its runtime size (Lanczos), keep alpha where present."""
    from PIL import Image
    im = Image.open(src)
    if mode:
        im = im.convert(mode)
    if im.size[0] != size:
        im = im.resize((size, size), Image.LANCZOS)
    if im.mode == 'RGBA':
        im = pad_rgba(im)          # Pillow resizes RGBA premultiplied: colour under alpha 0 comes back black
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if dst.endswith('.jpg'):
        im.convert('RGB').save(dst, quality=93, subsampling=0)
    else:
        im.save(dst, optimize=True)
    return dst


def export(path, **kw):
    import sys
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
    import ll_export
    settings = dict(export_vertex_color='ACTIVE', export_all_vertex_colors=False, export_attributes=True, export_tangents=False,
                    export_animations=False, export_skins=False, export_morph=False, export_image_format='WEBP', export_image_quality=90)
    settings.update(kw)
    return ll_export.export_glb(path, **settings)
