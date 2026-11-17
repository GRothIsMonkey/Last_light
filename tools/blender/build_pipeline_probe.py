"""Last Light, Phase 0A: build the pipeline probe in Blender and export it.

The probe (asset id `tst.pipeline-probe`) is an ORIGINAL technical test figure, not a character: a 1.53 m child-scale
humanoid with the planned bone names, a skinned body, a separate head with shape keys, seven PBR materials (three with
image textures, normal and roughness maps; one metallic), three skeletal clips and one facial clip. It exists only to
prove that a Blender-authored file reaches the game intact. It must never replace or stand in for anyone in the story.

Reproduce (any machine with Blender 4.2 LTS or newer):

    blender --background --factory-startup --python tools/blender/build_pipeline_probe.py

or, with Blender as a Python module (`pip install bpy`; the way it was checked in Phase 0A, Blender 5.0.1):

    python tools/blender/build_pipeline_probe.py

Writes:
    assets/source/tst/pipeline-probe/tst.pipeline-probe.blend      the source file (open it in Blender)
    assets/source/tst/pipeline-probe/textures/*.png|*.jpg           the generated texture set
    dist/assets/tst/tst.pipeline-probe.glb                          the runtime file the game loads

Conventions (docs/art/BLENDER-PIPELINE.md): metres, Z up, the figure faces -Y (Blender's Front view looks at its face),
its left side is +X (bones *_l). The exporter turns that into glTF's +Y up / +Z forward; the game's loader turns +Z
forward into the game's -Z forward.
"""
import sys, os, math

import bpy
import bmesh
import numpy as np
from mathutils import Vector, Matrix, Quaternion

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import ll_export  # noqa: E402

ASSET_ID = 'tst.pipeline-probe'
VERSION = 1
SRC_DIR = os.path.join(REPO, 'assets', 'source', 'tst', 'pipeline-probe')
TEX_DIR = os.path.join(SRC_DIR, 'textures')
GLB_OUT = os.path.join(REPO, 'dist', 'assets', 'tst', ASSET_ID + '.glb')
FPS = 30
RNG = np.random.default_rng(20110821)

# ----------------------------------------------------------------------------------------------------------------------
# Skeleton. Lengths follow dist/rig.js BODY (thigh .38, shin .37, ankle .065, torso .44, shoulder .155, upper .25,
# fore .23, neck .07) so the existing IK pose contract fits this skeleton without re-tuning. A-pose arms (40 degrees).
# (head, tail, parent, deform)
# ----------------------------------------------------------------------------------------------------------------------
A = math.radians(40)
SH_Z = 1.24   # = pelvis root .845 + BODY.torso .44 - .045 (rig.js shoulderPos)
def arm(side):
    x0 = side * .155
    el = Vector((x0 + side * .25 * math.sin(A), .01, SH_Z - .25 * math.cos(A)))
    wr = el + Vector((side * .23 * math.sin(A), 0, -.23 * math.cos(A)))
    hd = wr + Vector((side * .085 * math.sin(A), 0, -.085 * math.cos(A)))
    return Vector((x0, .01, SH_Z)), el, wr, hd   # (rig.js shoulderPos: z +.01 = Blender +Y)

BONES = {}
def bone(name, head, tail, parent=None, deform=True):
    BONES[name] = (Vector(head), Vector(tail), parent, deform)

bone('root', (0, 0, 0), (0, -.15, 0), None, False)
bone('hips', (0, 0, .845), (0, 0, .90), 'root')       # pelvis = the pose root; hip joints .03 below it (rig.js)
bone('spine_01', (0, 0, .90), (0, 0, 1.0), 'hips')
bone('spine_02', (0, 0, 1.0), (0, 0, 1.12), 'spine_01')
bone('chest', (0, 0, 1.12), (0, 0, 1.285), 'spine_02')  # neck base = root + BODY.torso
bone('neck', (0, 0, 1.285), (0, -.005, 1.345), 'chest')
bone('head', (0, -.005, 1.345), (0, -.005, 1.55), 'neck')
bone('jaw', (0, -.02, 1.395), (0, -.085, 1.36), 'head')
for s, sx in (('l', 1), ('r', -1)):
    sh, el, wr, hd = arm(sx)
    bone(f'eye_{s}', (sx * .036, -.086, 1.442), (sx * .036, -.116, 1.442), 'head')
    bone(f'clavicle_{s}', (sx * .02, -.005, 1.255), sh, 'chest')
    bone(f'upperarm_{s}', sh, el, f'clavicle_{s}')
    bone(f'lowerarm_{s}', el, wr, f'upperarm_{s}')
    bone(f'hand_{s}', wr, hd, f'lowerarm_{s}')
    bone(f'thigh_{s}', (sx * .085, 0, .815), (sx * .09, -.005, .435), 'hips')
    bone(f'calf_{s}', (sx * .09, -.005, .435), (sx * .09, .01, .065), f'thigh_{s}')
    bone(f'foot_{s}', (sx * .09, .01, .065), (sx * .09, -.11, .022), f'calf_{s}')
    bone(f'ball_{s}', (sx * .09, -.11, .022), (sx * .09, -.175, .022), f'foot_{s}')
    # sockets: non-deforming, exported as joints with no weights; the game attaches things to them by name
    palm = wr.lerp(hd, .55) + Vector((0, -.012, 0))
    bone(f'socket_grip_{s}', palm, palm + Vector((0, -.04, 0)), f'hand_{s}', False)
    bone(f'socket_hip_{s}', (sx * .13, -.01, .89), (sx * .13, -.05, .89), 'hips', False)
bone('socket_head_top', (0, -.005, 1.555), (0, -.005, 1.595), 'head', False)
bone('socket_cap', (0, -.012, 1.51), (0, -.052, 1.51), 'head', False)
bone('socket_eye_cam', (0, -.095, 1.442), (0, -.135, 1.442), 'head', False)
bone('socket_chest', (0, -.105, 1.19), (0, -.145, 1.19), 'chest', False)
bone('socket_back', (0, .105, 1.17), (0, .145, 1.17), 'chest', False)

# ----------------------------------------------------------------------------------------------------------------------
# Textures (generated; original). Blender's pixel buffer starts at the bottom-left; rows = v.
# ----------------------------------------------------------------------------------------------------------------------
def noise(n, scale, octaves=4):
    out = np.zeros((n, n))
    for o in range(octaves):
        k = max(2, int(scale * 2 ** o))
        g = RNG.random((k + 1, k + 1))
        g[-1, :] = g[0, :]; g[:, -1] = g[:, 0]
        x = np.linspace(0, k, n, endpoint=False)
        i = x.astype(int); f = x - i; f = f * f * (3 - 2 * f)
        a = g[np.ix_(i, i)]; b = g[np.ix_(i, i + 1)]; c = g[np.ix_(i + 1, i)]; d = g[np.ix_(i + 1, i + 1)]
        fy = f[:, None]; fx = f[None, :]
        out += (a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy) / 2 ** o
    return out / out.max()

def normal_from_height(h, strength):
    dy, dx = np.gradient(h)
    n = np.dstack((-dx * strength, -dy * strength, np.ones_like(h)))
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return n * .5 + .5

def save_image(name, rgb, fmt):
    n = rgb.shape[0]
    img = bpy.data.images.new(name, n, n, alpha=False, float_buffer=False)
    rgba = np.dstack((np.clip(rgb, 0, 1), np.ones((n, n)))).astype(np.float32)
    img.pixels.foreach_set(rgba.ravel())
    ext = 'png' if fmt == 'PNG' else 'jpg'
    path = os.path.join(TEX_DIR, f'{ASSET_ID}__{name}.{ext}')
    img.filepath_raw = path
    img.file_format = fmt
    if fmt == 'JPEG':
        bpy.context.scene.render.image_settings.quality = 90
    img.save()
    img.filepath = bpy.path.relpath(path) if bpy.data.filepath else path
    return img

def lin(c):
    c = np.asarray(c, float)
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)

def textures():
    os.makedirs(TEX_DIR, exist_ok=True)
    N = 512
    T = {}
    # skin: warm base, soft mottling; pores in the normal map; a little shine variation in roughness
    m = noise(N, 6)
    base = np.array([.84, .64, .50])[None, None, :] * (.93 + .1 * m[..., None]) + np.array([.05, -.02, -.02]) * noise(N, 3)[..., None]
    T['skin_basecolor'] = save_image('skin_basecolor', base, 'JPEG')
    pores = noise(N, 96, 2)
    T['skin_normal'] = save_image('skin_normal', normal_from_height(pores, 1.6), 'PNG')
    T['skin_orm'] = save_image('skin_orm', np.dstack((np.ones((N, N)), .52 + .16 * noise(N, 12), np.zeros((N, N)))), 'PNG')
    # shirt: a cotton weave with a wide stripe, so texture orientation and UVs are easy to read in a screenshot
    u = np.arange(N)[None, :] / N; v = np.arange(N)[:, None] / N
    stripe = (np.sin(v * 2 * np.pi * 6) > .35).astype(float)
    weave = .5 + .25 * np.sin(u * 2 * np.pi * 96) * np.sin(v * 2 * np.pi * 96)
    shirt = np.array([.29, .45, .62])[None, None, :] * (1 - stripe[..., None]) + np.array([.86, .82, .72])[None, None, :] * stripe[..., None]
    T['shirt_basecolor'] = save_image('shirt_basecolor', shirt * (.9 + .15 * weave[..., None]), 'JPEG')
    T['shirt_normal'] = save_image('shirt_normal', normal_from_height(weave + .3 * noise(N, 24, 2), 9), 'PNG')
    T['shirt_orm'] = save_image('shirt_orm', np.dstack((np.ones((N, N)), .86 + .08 * noise(N, 20, 2), np.zeros((N, N)))), 'PNG')
    # shorts: denim twill
    twill = .5 + .5 * np.sin((u + v) * 2 * np.pi * 80)
    denim = np.array([.20, .26, .38])[None, None, :] * (.8 + .3 * twill[..., None]) * (.9 + .2 * noise(N, 8)[..., None])
    T['shorts_basecolor'] = save_image('shorts_basecolor', denim, 'JPEG')
    T['shorts_normal'] = save_image('shorts_normal', normal_from_height(twill, 5), 'PNG')
    # hair: strands along v
    strands = noise(N, 4, 2)[:, :1].repeat(N, 1) * 0 + (.5 + .5 * np.sin(u * 2 * np.pi * 140 + 3 * noise(N, 4)))
    hair = np.array([.24, .16, .10])[None, None, :] * (.7 + .5 * strands[..., None])
    T['hair_basecolor'] = save_image('hair_basecolor', hair, 'JPEG')
    T['hair_normal'] = save_image('hair_normal', normal_from_height(strands, 7), 'PNG')
    return T

# ----------------------------------------------------------------------------------------------------------------------
# Materials: Principled BSDF only, wired the way the glTF exporter recognizes.
# ----------------------------------------------------------------------------------------------------------------------
def material(name, color=(1, 1, 1), rough=.8, metal=0., base=None, normal=None, orm=None, normal_strength=1.):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = (*lin(color), 1)
    bsdf.inputs['Roughness'].default_value = rough
    bsdf.inputs['Metallic'].default_value = metal
    def tex(img, noncolor, loc):
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; t.location = loc
        if noncolor:
            img.colorspace_settings.name = 'Non-Color'
        return t
    if base:
        t = tex(base, False, (-600, 300)); nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
    if orm:
        t = tex(orm, True, (-600, 0))
        sep = nt.nodes.new('ShaderNodeSeparateColor'); sep.location = (-300, 0)
        nt.links.new(t.outputs['Color'], sep.inputs['Color'])
        nt.links.new(sep.outputs['Green'], bsdf.inputs['Roughness'])
        nt.links.new(sep.outputs['Blue'], bsdf.inputs['Metallic'])
    if normal:
        t = tex(normal, True, (-600, -300))
        nm = nt.nodes.new('ShaderNodeNormalMap'); nm.location = (-300, -300); nm.inputs['Strength'].default_value = normal_strength
        nt.links.new(t.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

# ----------------------------------------------------------------------------------------------------------------------
# Geometry
# ----------------------------------------------------------------------------------------------------------------------
def body_mesh():
    """One continuous body from a Skin modifier over a joint graph, subdivided and applied."""
    me = bpy.data.meshes.new('tst.pipeline-probe:body')
    ob = bpy.data.objects.new('tst.pipeline-probe:body', me)
    bpy.context.collection.objects.link(ob)
    V, E, R = [], [], []
    def v(p, r):
        V.append(p); R.append(r); return len(V) - 1
    pel = v((0, 0, .875), (.115, .085))
    wai = v((0, 0, 1.01), (.10, .075))
    che = v((0, 0, 1.15), (.125, .082))
    nb = v((0, -.003, 1.285), (.05, .045))
    nt = v((0, -.006, 1.37), (.04, .038))
    E += [(pel, wai), (wai, che), (che, nb), (nb, nt)]
    for sx in (1, -1):
        sh, el, wr, hd = arm(sx)
        s0 = v((sx * .1, 0, 1.245), (.055, .05))
        s1 = v(tuple(sh), (.052, .048)); e1 = v(tuple(el), (.038, .036)); w1 = v(tuple(wr), (.03, .025))
        h1 = v(tuple(hd + (hd - wr) * .35), (.028, .014))
        hp = v((sx * .088, 0, .80), (.075, .07)); kn = v((sx * .09, -.005, .435), (.05, .05))
        an = v((sx * .09, .01, .085), (.042, .042)); toe = v((sx * .09, -.17, .035), (.04, .03))
        hl = v((sx * .09, .035, .04), (.04, .035))
        E += [(nb, s0), (s0, s1), (s1, e1), (e1, w1), (w1, h1), (pel, hp), (hp, kn), (kn, an), (an, toe), (an, hl)]
    me.from_pydata(V, E, [])
    sk = ob.modifiers.new('skin', 'SKIN')
    for i, r in enumerate(R):
        me.skin_vertices[0].data[i].radius = r
    me.skin_vertices[0].data[pel].use_root = True
    ob.modifiers.new('sub', 'SUBSURF').levels = 2
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return ob

def smart_uv(ob):
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.selected_objects:
        o.select_set(False)
    ob.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=.01)
    bpy.ops.object.mode_set(mode='OBJECT')

def head_mesh():
    bm = bmesh.new(); bm.loops.layers.uv.new('UVMap')   # (calc_uvs needs the layer to exist)
    bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=1, calc_uvs=True)
    for vert in bm.verts:
        x, y, z = vert.co
        sx = .088 * (1 - .12 * max(0, -z) ** 2)          # narrower jaw
        vert.co = Vector((x * sx, y * .1, z * .118 + 1.44)) + Vector((0, -.006, 0))
        if y < 0:                                       # flatter face, slight chin
            vert.co.y += .008 * (-y) * (1 - abs(x))
    me = bpy.data.meshes.new('tst.pipeline-probe:head')
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('tst.pipeline-probe:head', me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob

def sphere(name, r, center, scale=(1, 1, 1), segs=(24, 16)):
    bm = bmesh.new(); bm.loops.layers.uv.new('UVMap')   # (calc_uvs needs the layer to exist)
    bmesh.ops.create_uvsphere(bm, u_segments=segs[0], v_segments=segs[1], radius=r, calc_uvs=True)
    for vert in bm.verts:
        vert.co = Vector((vert.co.x * scale[0], vert.co.y * scale[1], vert.co.z * scale[2])) + Vector(center)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob

def cylinder(name, r, depth, center, axis='X'):
    bm = bmesh.new(); bm.loops.layers.uv.new('UVMap')   # (calc_uvs needs the layer to exist)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=r, radius2=r, depth=depth, calc_uvs=True)
    rot = {'X': Matrix.Rotation(math.pi / 2, 4, 'Y'), 'Y': Matrix.Rotation(math.pi / 2, 4, 'X'), 'Z': Matrix()}[axis]
    bmesh.ops.transform(bm, matrix=Matrix.Translation(center) @ rot, verts=bm.verts)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    return ob

def join(objs, name):
    for o in bpy.context.selected_objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    objs[0].name = name; objs[0].data.name = name
    return objs[0]

# ----------------------------------------------------------------------------------------------------------------------
# Skinning: distance-to-segment weights over the deforming bones, at most 4 influences, normalized.
# ----------------------------------------------------------------------------------------------------------------------
def seg_dist(p, a, b):
    ab = b - a; t = max(0., min(1., (p - a).dot(ab) / ab.length_squared))
    return (p - (a + ab * t)).length

def skin(ob, arm_ob, allowed=None, rigid=None):
    deform = [n for n, (h, t, par, d) in BONES.items() if d and (allowed is None or n in allowed)]
    for n in deform:
        ob.vertex_groups.new(name=n)
    for vtx in ob.data.vertices:
        p = vtx.co
        if rigid:
            ob.vertex_groups[rigid].add([vtx.index], 1.0, 'REPLACE'); continue
        ds = sorted((seg_dist(p, BONES[n][0], BONES[n][1]), n) for n in deform)
        ws = [(1 / (d + .012) ** 5, n) for d, n in ds[:4]]
        tot = sum(w for w, _ in ws)
        for w, n in ws:
            if w / tot > .02:
                ob.vertex_groups[n].add([vtx.index], w / tot, 'REPLACE')
    mod = ob.modifiers.new('Armature', 'ARMATURE'); mod.object = arm_ob
    ob.parent = arm_ob

# ----------------------------------------------------------------------------------------------------------------------
def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'; sc.unit_settings.scale_length = 1.0
    sc.render.fps = FPS
    T = textures()
    M = {
        'skin': material('mat.skin/tst.pipeline-probe', (.84, .64, .5), .55, 0, T['skin_basecolor'], T['skin_normal'], T['skin_orm'], .35),
        'shirt': material('mat.fabric.cotton/tst.pipeline-probe.shirt', rough=.88, base=T['shirt_basecolor'], normal=T['shirt_normal'], orm=T['shirt_orm']),
        'shorts': material('mat.fabric.denim/tst.pipeline-probe.shorts', rough=.9, base=T['shorts_basecolor'], normal=T['shorts_normal']),
        'shoes': material('mat.rubber/tst.pipeline-probe.shoes', (.92, .9, .86), .62),
        'metal': material('mat.metal.steel/tst.pipeline-probe.watch', (.78, .78, .8), .28, 1.0),
        'eye': material('mat.eye/tst.pipeline-probe', (.93, .92, .88), .08),
        'iris': material('mat.eye.iris/tst.pipeline-probe', (.18, .26, .16), .1),
        'hair': material('mat.hair/tst.pipeline-probe', rough=.6, base=T['hair_basecolor'], normal=T['hair_normal']),
        'mouth': material('mat.mouth/tst.pipeline-probe', (.42, .14, .13), .45),
    }

    # armature
    ad = bpy.data.armatures.new('tst.pipeline-probe:rig')
    arm_ob = bpy.data.objects.new('tst.pipeline-probe', ad)
    sc.collection.objects.link(arm_ob)
    bpy.context.view_layer.objects.active = arm_ob
    bpy.ops.object.mode_set(mode='EDIT')
    for n, (h, t, par, d) in BONES.items():
        eb = ad.edit_bones.new(n); eb.head = h; eb.tail = t; eb.use_deform = d
        eb.roll = 0
    for n, (h, t, par, d) in BONES.items():
        if par:
            eb = ad.edit_bones[n]; eb.parent = ad.edit_bones[par]
            eb.use_connect = (ad.edit_bones[par].tail - eb.head).length < 1e-5 and not n.startswith('socket')
    bpy.ops.object.mode_set(mode='OBJECT')
    arm_ob['ll_asset_id'] = ASSET_ID
    arm_ob['ll_asset_version'] = VERSION
    arm_ob['ll_rig'] = 'rig.human.child'
    arm_ob['ll_license'] = 'Original work for Last Light (Roth Studios). Technical test asset; not a character.'
    arm_ob['ll_source'] = 'tools/blender/build_pipeline_probe.py'

    # body: materials by region
    body = body_mesh()
    smart_uv(body)
    for k in ('skin', 'shirt', 'shorts', 'shoes'):
        body.data.materials.append(M[k])
    for p in body.data.polygons:
        c = p.center; ax = abs(c.x)
        if c.z < .13:
            p.material_index = 3
        elif c.z < .62 and ax < .2:
            p.material_index = 0                       # legs below the shorts
        elif c.z < .95 and ax < .2:
            p.material_index = 2                       # shorts
        elif c.z > 1.28:
            p.material_index = 0                       # neck
        elif ax > .155 + .16 * math.sin(A) and c.z < 1.15:
            p.material_index = 0                       # forearms and hands
        else:
            p.material_index = 1                       # shirt (torso, short sleeves)
        p.use_smooth = True
    skin(body, arm_ob)

    # watch on the left wrist (metallic): rigid to lowerarm_l
    _, el, wr, _ = arm(1)
    w = cylinder('tst.pipeline-probe:watch', .031, .022, wr.lerp(el, .12), 'Z')
    w.matrix_world = Matrix()
    d = (wr - el).normalized()
    rot = d.to_track_quat('Z', 'Y').to_matrix().to_4x4()
    c = wr.lerp(el, .12)
    for vv in w.data.vertices:
        vv.co = c + rot.to_3x3() @ (vv.co - c)
    w.data.materials.append(M['metal'])
    skin(w, arm_ob, rigid='lowerarm_l')

    # head with face regions; skinned to head and jaw
    head = head_mesh()
    for k in ('skin', 'mouth', 'hair'):
        head.data.materials.append(M[k])
    for p in head.data.polygons:
        c = p.center
        if c.y < -.07 and abs(c.x) < .03 and 1.372 < c.z < 1.388:
            p.material_index = 1                                    # mouth
        elif c.y < -.07 and .008 < abs(c.x) < .052 and 1.468 < c.z < 1.482:
            p.material_index = 2                                    # brows
        elif c.z > 1.465 and c.y > -.045 or c.z > 1.515:
            p.material_index = 2                                    # hair cap
    skin(head, arm_ob, allowed={'head', 'jaw', 'neck'})
    # the jaw only takes the lower face
    jaw_g, head_g = head.vertex_groups['jaw'], head.vertex_groups['head']
    for vtx in head.data.vertices:
        p = vtx.co; jw = max(0., min(1., (1.382 - p.z) / .03)) * max(0., min(1., (-p.y - .01) / .04))
        jaw_g.add([vtx.index], jw, 'REPLACE'); head_g.add([vtx.index], 1 - jw, 'REPLACE')
        head.vertex_groups['neck'].remove([vtx.index])

    # shape keys (morph targets); names follow the ARKit-style set in BLENDER-PIPELINE.md
    head.shape_key_add(name='Basis')
    def key(name, fn):
        k = head.shape_key_add(name=name, from_mix=False)
        for i, vtx in enumerate(head.data.vertices):
            off = fn(vtx.co)
            if off:
                k.data[i].co = vtx.co + Vector(off)
        return k
    g = lambda p, c, s: math.exp(-sum(((p[i] - c[i]) / s[i]) ** 2 for i in range(3)))
    def jaw_open(p):
        if p.y > .02:
            return None
        w = max(0., min(1., (1.38 - p.z) / .012)) * max(0., min(1., (-p.y + .02) / .06))
        w *= max(0., min(1., (p.z - 1.31) / .03)) * .6 + .4
        return (0, .006 * w, -.032 * w) if w > 0 else None
    key('jawOpen', jaw_open)
    for nm, sx in (('mouthSmileLeft', 1), ('mouthSmileRight', -1)):
        key(nm, lambda p, sx=sx: (sx * .006 * g(p, (sx * .03, -.08, 1.38), (.014, .03, .012)), .002 * g(p, (sx * .03, -.08, 1.38), (.014, .03, .012)), .009 * g(p, (sx * .03, -.08, 1.38), (.014, .03, .012))))
    key('browInnerUp', lambda p: (0, 0, .011 * (g(p, (.022, -.085, 1.475), (.016, .03, .012)) + g(p, (-.022, -.085, 1.475), (.016, .03, .012)))))
    for nm, sx in (('eyeBlinkLeft', 1), ('eyeBlinkRight', -1)):
        # (closes the skin over the eye: the brow and upper lid region drops toward the eye line)
        key(nm, lambda p, sx=sx: (0, -.004 * g(p, (sx * .036, -.08, 1.455), (.018, .03, .008)), -.010 * g(p, (sx * .036, -.08, 1.455), (.018, .03, .008))))

    # eyes and irises: rigid to the eye bones (gaze by bone, as the plan requires)
    for s, sx in (('l', 1), ('r', -1)):
        e = sphere(f'tst.pipeline-probe:eye_{s}', .0135, (sx * .036, -.086, 1.442))   # front of the eye ~1 cm proud of the face
        e.data.materials.append(M['eye']); skin(e, arm_ob, rigid=f'eye_{s}')
        ir = sphere(f'tst.pipeline-probe:iris_{s}', .0068, (sx * .036, -.0985, 1.442), (1, .35, 1), (16, 10))
        ir.data.materials.append(M['iris']); skin(ir, arm_ob, rigid=f'eye_{s}')

    # ---- animation: quaternion keys about world axes, converted into each bone's rest frame
    arm_ob.animation_data_create()
    pb = arm_ob.pose.bones
    for b in pb:
        b.rotation_mode = 'QUATERNION'
    def qworld(name, axis, deg):
        rest = arm_ob.data.bones[name].matrix_local.to_3x3()
        return Quaternion(rest.inverted() @ Vector(axis), math.radians(deg))
    def clip(name, frames, keys):
        act = bpy.data.actions.new(name)
        arm_ob.animation_data.action = act
        for b in pb:
            b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
        for f in frames:
            for b in pb:
                b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
            t = (f - frames[0]) / (frames[-1] - frames[0])
            for bname, fn in keys.items():
                r = fn(t)
                q = Quaternion()
                for axis, deg in r.get('rot', []):
                    q = qworld(bname, axis, deg) @ q
                pb[bname].rotation_quaternion = q
                if 'loc' in r:
                    rest = arm_ob.data.bones[bname].matrix_local.to_3x3()
                    pb[bname].location = rest.inverted() @ Vector(r['loc'])
            for b in pb:
                b.keyframe_insert('rotation_quaternion', frame=f, group=b.name)
                if b.name in keys and 'loc' in keys[b.name](0):
                    b.keyframe_insert('location', frame=f, group=b.name)
        act.use_fake_user = True
        tr = arm_ob.animation_data.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, frames[0], act); st.name = name
        tr.mute = True
        arm_ob.animation_data.action = None
        return act
    X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
    S = lambda t, k=1, ph=0: math.sin(2 * math.pi * (k * t + ph))
    # walk_normal: in place, 1 s cycle; +X rotation tips a down-pointing bone's tail toward -Y (forward)
    clip('walk_normal', list(range(0, 31)), {
        'hips': lambda t: {'rot': [(Z, 5 * S(t))], 'loc': (0, 0, .018 * abs(S(t)) - .012)},
        'spine_01': lambda t: {'rot': [(Z, -4 * S(t)), (X, -3)]},
        'chest': lambda t: {'rot': [(Z, -5 * S(t))]},
        'head': lambda t: {'rot': [(Z, 4 * S(t))]},
        'thigh_l': lambda t: {'rot': [(X, 28 * S(t))]},
        'thigh_r': lambda t: {'rot': [(X, -28 * S(t))]},
        'calf_l': lambda t: {'rot': [(X, -(18 + 22 * max(0, S(t, 1, .3))))]},
        'calf_r': lambda t: {'rot': [(X, -(18 + 22 * max(0, S(t, 1, .8))))]},
        'foot_l': lambda t: {'rot': [(X, 10 * S(t, 1, .15))]},
        'foot_r': lambda t: {'rot': [(X, -10 * S(t, 1, .15))]},
        'upperarm_l': lambda t: {'rot': [(Y, -30), (X, -24 * S(t))]},
        'upperarm_r': lambda t: {'rot': [(Y, 30), (X, 24 * S(t))]},
        'lowerarm_l': lambda t: {'rot': [(X, 16 + 10 * max(0, -S(t)))]},
        'lowerarm_r': lambda t: {'rot': [(X, 16 + 10 * max(0, S(t)))]},
    })
    clip('idle_breathe', list(range(0, 61, 2)), {
        'spine_02': lambda t: {'rot': [(X, -1.5 * S(t))]},
        'chest': lambda t: {'rot': [(X, -2 * S(t))]},
        'neck': lambda t: {'rot': [(X, 1.2 * S(t))]},
        'head': lambda t: {'rot': [(Z, 9 * S(t, 1, .25))]},
        'upperarm_l': lambda t: {'rot': [(Y, -32 - 2 * S(t))]},
        'upperarm_r': lambda t: {'rot': [(Y, 32 + 2 * S(t))]},
        'lowerarm_l': lambda t: {'rot': [(X, 8)]},
        'lowerarm_r': lambda t: {'rot': [(X, 8)]},
    })
    clip('wave_r', list(range(0, 46)), {
        'upperarm_r': lambda t: {'rot': [(Y, -95 * min(1, t * 4) * min(1, (1 - t) * 4))]},
        'lowerarm_r': lambda t: {'rot': [(Y, -50 * min(1, t * 4) * min(1, (1 - t) * 4)), (X, 30 * S(t, 3) * min(1, t * 4) * min(1, (1 - t) * 4))]},
        'upperarm_l': lambda t: {'rot': [(Y, -30)]},
        'head': lambda t: {'rot': [(Y, 6 * min(1, t * 4) * min(1, (1 - t) * 4))]},
    })
    # talk: a bone clip (jaw + head nod) and a shape-key clip of the same name, merged by the exporter into one clip
    clip('talk', list(range(0, 61, 2)), {
        'jaw': lambda t: {'rot': [(X, -4 * max(0, S(t, 5)))]},
        'head': lambda t: {'rot': [(X, 2 * S(t, 2))]},
    })
    kd = head.data.shape_keys
    kd.animation_data_create()
    if bpy.app.version >= (4, 4):
        # slotted Actions: one Action 'talk' with a slot for the armature and a slot for the shape keys
        act = bpy.data.actions['talk']
    else:
        act = bpy.data.actions.new('talk_shapes')   # older Blender: merged by NLA track name below
    kd.animation_data.action = act
    kb = kd.key_blocks
    for f in range(0, 61, 2):
        t = f / 60
        vals = {'jawOpen': max(0, S(t, 5)) * .9, 'mouthSmileLeft': .5 + .3 * S(t, 1), 'mouthSmileRight': .5 + .3 * S(t, 1),
                'browInnerUp': max(0, S(t, 1.5)), 'eyeBlinkLeft': 1. if 24 <= f <= 28 else 0., 'eyeBlinkRight': 1. if 24 <= f <= 28 else 0.}
        for n, val in vals.items():
            kb[n].value = val; kb[n].keyframe_insert('value', frame=f)
    act.use_fake_user = True
    # the exporter finds shape-key clips through the Key's NLA (as it finds the armature's)
    slot = kd.animation_data.action_slot if bpy.app.version >= (4, 4) else None
    tr = kd.animation_data.nla_tracks.new(); tr.name = 'talk'; st = tr.strips.new('talk', 0, act); tr.mute = True
    if slot is not None:
        st.action_slot = slot
    kd.animation_data.action = None
    for k in kb:
        k.value = 0
    for b in pb:
        b.rotation_quaternion = (1, 0, 0, 0); b.location = (0, 0, 0)
    sc.frame_start, sc.frame_end = 0, 60

    os.makedirs(SRC_DIR, exist_ok=True)
    blend = os.path.join(SRC_DIR, ASSET_ID + '.blend')
    bpy.context.preferences.filepaths.save_version = 0   # no .blend1 backups next to the source
    bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True, relative_remap=True)
    print('build_pipeline_probe: saved', blend)
    ll_export.export_glb(GLB_OUT, export_copyright='Roth Studios — original technical test asset for Last Light',
                         **({} if bpy.app.version >= (4, 4) else {'export_merge_animation': 'NLA_TRACK'}))
    # report
    tris = sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
    print(f'build_pipeline_probe: {tris} triangles, {len(BONES)} bones '
          f'({sum(1 for b in BONES.values() if b[3])} deforming), {len(M)} materials, shape keys {[k.name for k in kb][1:]}, '
          f'actions {sorted(a.name for a in bpy.data.actions)}')


if __name__ == '__main__':
    build()
