"""Jamie's mother, chr.jamie-mother: the original Blender character for the ?supportcast benchmark.

    python3 tools/blender/supportcast/build_jamie_mother.py          (bpy 5.1 as a module, or blender --background --python)

Writes
  assets/source/chr/jamie-mother/chr.jamie-mother.blend     the editable source: meshes, armature, weights, shape keys,
                                                             clips, materials (textures linked from textures/)
  assets/source/chr/jamie-mother/textures/*                  the generated textures (sources at full size)
  dist/assets/chr/chr.jamie-mother.glb                       the game asset (ll_export.py: skins, morphs, clips)
  assets/source/chr/jamie-mother/build-stats.json            triangles, bones, clips, keys, sizes, measurements
Everything is built from code (chr_head, chr_body, chr_hair, chr_tex, chr_rig): original work, deterministic.
"""
import json, math, os, sys, time
import numpy as np
import bpy, bmesh
from mathutils import Matrix, Quaternion, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import chr_head as CH, chr_body as CB, chr_hair as HR, chr_tex as TX, chr_rig as RG   # noqa: E402
import ll_export                                                                         # noqa: E402

ASSET_ID = 'chr.jamie-mother'
VERSION = '1'
SRC = os.path.join(ROOT, 'assets', 'source', 'chr', 'jamie-mother')
TEXD = os.path.join(SRC, 'textures')
BLEND = os.path.join(SRC, 'chr.jamie-mother.blend')
GLB = os.path.join(ROOT, 'dist', 'assets', 'chr', 'chr.jamie-mother.glb')
STATS = os.path.join(SRC, 'build-stats.json')
FPS = 30
HEAD_SCALE = 1.0     # the head's scale about the ear canals (the kid's build sets 0.95)
# bones every clip keys (so switching clips never leaves one of them where another clip put it)
POSED_ALWAYS = {'hips', 'spine_01', 'spine_02', 'chest', 'neck', 'head', 'clavicle_l', 'clavicle_r', 'upperarm_l', 'upperarm_r',
                'lowerarm_l', 'lowerarm_r', 'hand_l', 'hand_r', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r', 'foot_l', 'foot_r', 'toe_l', 'toe_r'}
# The Prologue spec (cast.js CAST.mom) is the provisional foundation; everything not in it is PROPOSED (A-22).
SPEC = dict(skin=0xd6a57f, lips=0xb27264, iris=0x3a2a1c, hair=0x6b4a2a, hair_tone=.62, brow=0x4c3320, shirt=0x9c3b3b, jeans=0x3d4a66,
            shoes=0x2f2f33, sole=0x8a8a86)
T0 = time.time()


def log(*a):
    print(f'[jamie-mother {time.time() - T0:6.1f}s]', *a, flush=True)


# ================================================================================================ geometry
def build_geometry():
    H = CH.Head()
    g = CH.relax(CH.build(H))
    hm = CH.assemble(g)
    log('head', len(hm['V']), 'verts')
    HO = CB.J['head_origin']
    NU, NV = hm['NU'], hm['NV']
    Vh = hm['V']                                       # head space
    # the scalp well inside the hairline is always under the opaque hair shell: drop those faces (the shell starts below
    # the hairline, so no gap can open)
    az, el = HR.az_el(Vh)
    depth = el - HR.hairline_elev(az)
    under = depth > .16
    keepf = [k for k, f in enumerate(hm['F']) if not all(under[i] for i in f)]
    hm = dict(hm, F=[hm['F'][k] for k in keepf], UV=[hm['UV'][k] for k in keepf])
    # head UVs: the grid's v is lifted to leave the bottom strip of the atlas for the neck yoke
    UV = [[(u, .08 + .92 * v) if u < .97 else (u, v) for (u, v) in fu] for fu in hm['UV']]
    # the neck yoke continues the bottom grid row (row 0) down under the shirt
    hb = Vh[:NU] + HO
    yk = CB.yoke(hb)
    yk_uv = [[(u / 1.0 % 1.0001, .075 * (1 - min(v / .09, 1))) for (u, v) in fu] for fu in yk['UV']]
    # the yoke's first ring is the grid's bottom row: weld it
    nY = len(yk['V'])
    yV = yk['V'][NU:]
    yF = [[(i - NU + len(Vh)) if i >= NU else i for i in f][::-1] for f in yk['F']]
    yk_uv = [u[::-1] for u in yk_uv]
    # lashes (part of the head so they follow the blink)
    la, lb = HR.lashes(hm, 1), HR.lashes(hm, -1)
    # teeth: a soft upper and lower arc behind the lips (upper on the head, lower on the jaw)
    teeth = teeth_mesh()
    parts = [dict(V=Vh, F=hm['F'], UV=UV, mat='skin_head'), dict(V=yV - HO, F=yF, UV=yk_uv, mat='skin_head', shared=True)]
    # the lid margins and the mouth's interior are seen from either side: give them back faces (on their own vertex
    # copies: Blender's validation drops a face that reuses another face's vertices)
    special = [k for k, fu in enumerate(UV) if fu[0][0] >= .97 and fu[0][1] >= .98]
    sv = sorted({i for k in special for i in hm['F'][k]})
    base = len(Vh) + len(yV)
    cmap = {v: base + n for n, v in enumerate(sv)}
    V = np.concatenate([Vh, yV - HO, Vh[sv]])
    F = [list(f) for f in hm['F']] + yF + [[cmap[i] for i in hm['F'][k]][::-1] for k in special]
    U = UV + yk_uv + [UV[k][::-1] for k in special]
    M = ['skin_head'] * len(F)
    for extra, mat in ((teeth, 'teeth'), (la, 'hair_cards'), (lb, 'hair_cards')):
        off = len(V)
        V = np.concatenate([V, extra['V']])
        F += [[i + off for i in f] for f in extra['F']]
        if mat == 'hair_cards':
            U += [[(.905 + .04 * u, v) for (u, v) in fu] for fu in extra['UV']]
        else:
            U += extra['UV']
        M += [mat] * len(extra['F'])
    V, F, U, M = add_ears(H, hm, V, F, U, M, 1.0)
    head = dict(V=V, F=F, UV=U, M=M, n_grid=NU * NV, lash_ranges=None)
    # head-space bookkeeping for weights and shape keys
    nb = len(Vh) + len(yV) + len(sv)
    info = dict(hm=hm, g=g, H=H, n_head=len(Vh), n_yoke=len(yV), dup_map=cmap, teeth_range=(nb, nb + len(teeth['V'])),
                lash_range=(nb + len(teeth['V']), nb + len(teeth['V']) + len(la['V']) + len(lb['V'])), n_teeth_upper=teeth['n_upper'])
    # hair
    shell, _ = HR.shell(hm, H, NU, NV)
    cl = HR.clumps(H)
    core, cards, elastic, chain = HR.ponytail()
    hair = merge_mats([(shell, 'hair'), (core, 'hair'), (elastic, 'hair_cards'), (cl, 'hair_cards'), (cards, 'hair_cards')])
    # the elastic samples the reserved dark strip of the cards atlas; the cards stay in [0, .85)
    hair['UV'] = remap_hair_uv(hair, [len(shell['F']) + len(core['F']), len(elastic['F'])])
    # body (world)
    sh, _ = CB.shirt()
    body_parts = [(sh, 'shirt')]
    hands = {}
    for side in (1, -1):
        body_parts.append((CB.sleeve(side), 'shirt'))
        a, wr = CB.arm(side)
        hmesh, nails, tips, fr = CB.hand(side, wr)
        hands[side] = (tips, fr)
        body_parts += [(a, 'skin_body'), (hmesh, 'skin_body'), (nails, 'skin_body_nails')]
        up, so = CB.shoe(side)
        body_parts += [(up, 'shoe'), (so, 'shoe_sole')]
    body_parts.append((CB.jeans(), 'jeans'))
    body = merge_mats(body_parts)
    eyes = eye_meshes()
    log('geometry built')
    return dict(head=head, info=info, hair=hair, chain=chain, body=body, eyes=eyes, hands=hands, HO=HO)


def add_ears(H, hm, V, F, U, M, scale):
    """both ears into the head mesh (skin_head), each vertex taking the UV of the nearest head-grid vertex"""
    vuv = {}
    for f, fu in zip(hm['F'], hm['UV']):
        for i, u in zip(f, fu):
            if i not in vuv and u[0] < .97:
                vuv[i] = (u[0], .08 + .92 * u[1])
    keys = np.array(sorted(vuv))
    G = hm['V'][keys]
    for side in (1, -1):
        e = CH.ear(H, side)
        off = len(V)
        V = np.concatenate([V, e['V'] * scale])
        F += [[i + off for i in f] for f in e['F']]
        for f in e['F']:
            row = []
            for i in f:
                p = e['V'][i]
                k = keys[int(np.argmin(np.linalg.norm(G - p, axis=1)))]
                row.append(vuv[int(k)])
            U.append(row)
        M += ['skin_head'] * len(e['F'])
    return V, F, U, M


def merge_mats(parts):
    V, F, U, M, owner = [], [], [], [], []
    off = 0
    for k, (m, mat) in enumerate(parts):
        V.append(np.asarray(m['V']))
        F += [[i + off for i in f] for f in m['F']]
        U += m['UV']
        M += [mat] * len(m['F'])
        owner += [m.get('part', '')] * len(m['V'])
        off += len(m['V'])
    return dict(V=np.concatenate(V), F=F, UV=U, M=M, owner=owner)


def remap_hair_uv(hair, counts):
    out = []
    n_op, n_el = counts
    for i, (fu, mat) in enumerate(zip(hair['UV'], hair['M'])):
        if n_op <= i < n_op + n_el:
            out.append([(.975, .5)] * len(fu))                       # the elastic: the dark strip
        elif mat == 'hair_cards':
            out.append([(.04 + (u % 1) * .80, v) for (u, v) in fu])
        else:
            out.append(list(fu))
    return out


def teeth_mesh():
    """two soft arcs (upper and lower incisors, canines, premolars) behind the lips, seen only when she smiles or talks"""
    V, F, UV = [], [], []
    n = 18
    n_upper = 0
    for k, (z0, z1) in enumerate(((-.0335, -.0410), (-.0418, -.0485))):
        base = len(V)
        for i in range(n + 1):
            t = i / n * 2 - 1
            ang = t * 1.25
            r = .028
            x = math.sin(ang) * r
            y = -.0895 + (1 - math.cos(ang)) * r * 1.05
            for z in (z0, z1):
                V.append((x, y, z))
                UV.append(None)
            V.append((x * .94, y + .004, (z0 + z1) / 2))
        for i in range(n):
            a = base + 3 * i
            F += [[a, a + 3, a + 4, a + 1], [a + 1, a + 4, a + 5, a + 2], [a + 2, a + 5, a + 3, a]]
        if k == 0:
            n_upper = len(V)
    uv = [[(.5, .5)] * len(f) for f in F]
    return dict(V=np.array(V), F=F, UV=uv, n_upper=n_upper)


def eye_meshes(nu=32, nv=20):
    """eyeballs: a sphere with the cornea's bulge, UV v from the cornea apex (0) to the back (1), facing -y"""
    out = []
    e, r = CH.D['eye'], CH.D['eye_r']
    for side in (1, -1):
        c = e * [side, 1, 1]
        V, F, UV = [], [], []
        for j in range(nv + 1):
            th = math.pi * j / nv
            for i in range(nu):
                ph = 2 * math.pi * i / nu
                d = np.array([math.sin(th) * math.cos(ph), -math.cos(th), math.sin(th) * math.sin(ph)])
                rr = r
                if th < .62:                                   # the cornea: a steeper cap, 1.1 mm proud at the apex
                    rr = r + .0011 * (1 - (th / .62) ** 2) ** 1.5
                V.append(c + d * rr)
        for j in range(nv):
            for i in range(nu):
                a, b = j * nu + i, j * nu + (i + 1) % nu
                F.append([a, b, b + nu, a + nu])
                UV.append([(i / nu, 1 - j / nv), ((i + 1) / nu, 1 - j / nv), ((i + 1) / nu, 1 - (j + 1) / nv), (i / nu, 1 - (j + 1) / nv)])
        out.append(dict(V=np.array(V), F=F, UV=UV, side=side))
    return out


# ================================================================================================ textures
def build_textures(G):
    os.makedirs(TEXD, exist_ok=True)
    hm, info = G['hm'] if 'hm' in G else G['info']['hm'], G['info']
    head = G['head']
    S = 2048
    log('rasterizing the head for the skin bake')
    nf = len(hm['F'])
    P, Mk = TX.raster_positions(head['V'], head['F'][:nf], head['UV'][:nf], S)
    def depth_fn(p):
        az, el = HR.az_el(p)
        return el - HR.hairline_elev(az)
    col, pores = TX.head_skin(P, Mk, SPEC, depth_fn, CH.D['eye'], S)
    # the yoke strip (v < .08): the same tone, continuous with the neck
    yk = int(S * (1 - .08))
    col[yk:] = col[yk - 1:yk][0] * 0 + TX.srgb(SPEC['skin']) * (1 + .03 * (TX.noise2((S - yk, S), 20, 5) - .5))[..., None]
    TX.save(col, os.path.join(TEXD, 'skin_head_albedo.jpg'), quality=92)
    pn = pores[::2, ::2] * .5 + pores[1::2, 1::2] * .5
    TX.save(TX.normal_from_height(pn, .9), os.path.join(TEXD, 'skin_head_normal.png'))
    bc, bn = TX.body_skin(SPEC)
    # nails: a lighter, pinker patch at the tile's corner
    bc[:24, -24:] = TX.srgb(SPEC['skin']) * [1.02, .90, .88] + .08
    TX.save(bc, os.path.join(TEXD, 'skin_body_albedo.jpg'))
    TX.save(bn, os.path.join(TEXD, 'skin_body_normal.png'))
    TX.save(TX.eye_tex(SPEC), os.path.join(TEXD, 'eye_albedo.jpg'))
    hc, ha, hn = TX.hair_tex(SPEC)
    # the shell and the tail's core: the strands alone (tileable, opaque)
    TX.save(hc, os.path.join(TEXD, 'hair_shell_albedo.jpg'))
    Wd = hc.shape[1]
    hc[:, int(Wd * .95):] = [.025, .022, .02]                 # the elastic
    ha[:, int(Wd * .95):] = 1
    lash = np.zeros_like(ha[:, int(Wd * .90):int(Wd * .95)])
    xx = np.arange(lash.shape[1])
    for c in range(0, lash.shape[1], 3):
        lash += np.outer(np.clip(1 - np.linspace(0, 1, lash.shape[0]) ** 1.5, 0, 1), np.exp(-((xx - c) / .7) ** 2))
    hc[:, int(Wd * .90):int(Wd * .95)] = [.04, .03, .025]
    ha[:, int(Wd * .90):int(Wd * .95)] = np.clip(lash, 0, 1)
    TX.save(hc, os.path.join(TEXD, 'hair_albedo.png'), alpha=ha)
    TX.save(hn, os.path.join(TEXD, 'hair_normal.png'))
    jc, jn = TX.jersey(SPEC['shirt'])
    TX.save(jc, os.path.join(TEXD, 'shirt_albedo.jpg'))
    TX.save(jn, os.path.join(TEXD, 'shirt_normal.png'))
    dc, dn = TX.denim(SPEC['jeans'])
    TX.save(dc, os.path.join(TEXD, 'jeans_albedo.jpg'))
    TX.save(dn, os.path.join(TEXD, 'jeans_normal.png'))
    cc, cn = TX.canvas(SPEC['shoes'])
    cc[int(cc.shape[0] * .8):] = TX.srgb(SPEC['sole'])        # the sole's rubber, at the tile's bottom
    TX.save(cc, os.path.join(TEXD, 'shoe_albedo.jpg'))
    TX.save(cn, os.path.join(TEXD, 'shoe_normal.png'))
    teeth = np.ones((64, 64, 3)) * [.86, .82, .74]
    TX.save(teeth, os.path.join(TEXD, 'teeth_albedo.jpg'))
    log('textures written')


# ================================================================================================ Blender scene
def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.scale_length = 1.0
    sc.render.fps = FPS
    return sc


def image(name, path, colour=True):
    img = bpy.data.images.load(path, check_existing=True)
    img.name = name
    if not colour:
        img.colorspace_settings.name = 'Non-Color'
    return img


def material(name, albedo=None, normal=None, rough=.6, metal=0., alpha=False, nstrength=.6, sss=0., spec=.5, coat=0.):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    if 'Specular IOR Level' in b.inputs:
        b.inputs['Specular IOR Level'].default_value = spec
    if sss:
        b.inputs['Subsurface Weight'].default_value = sss
        b.inputs['Subsurface Radius'].default_value = (1.0, .42, .26)
        b.inputs['Subsurface Scale'].default_value = .006
    if coat:
        b.inputs['Coat Weight'].default_value = coat
        b.inputs['Coat Roughness'].default_value = .15
    if albedo:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = image(name + '_albedo', os.path.join(TEXD, albedo))
        nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
        if alpha:
            nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
            try:
                m.surface_render_method = 'DITHERED'
            except Exception:
                pass
    if normal:
        t = nt.nodes.new('ShaderNodeTexImage')
        t.image = image(name + '_normal', os.path.join(TEXD, normal), colour=False)
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = nstrength
        nt.links.new(t.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m


def make_materials():
    return dict(
        skin_head=material('skin_head', 'skin_head_albedo.jpg', 'skin_head_normal.png', rough=.52, sss=.12, nstrength=.35, spec=.45),
        skin_body=material('skin_body', 'skin_body_albedo.jpg', 'skin_body_normal.png', rough=.55, sss=.1, nstrength=.3, spec=.45),
        skin_body_nails=None,
        teeth=material('teeth', 'teeth_albedo.jpg', rough=.25, spec=.5),
        eye=material('eye', 'eye_albedo.jpg', rough=.04, spec=.6, coat=.6),
        hair=material('hair', 'hair_shell_albedo.jpg', 'hair_normal.png', rough=.58, nstrength=.4, spec=.4),
        hair_cards=material('hair_cards', 'hair_albedo.png', 'hair_normal.png', rough=.58, alpha=True, nstrength=.4, spec=.4),
        shirt=material('shirt', 'shirt_albedo.jpg', 'shirt_normal.png', rough=.86, nstrength=.5, spec=.3),
        jeans=material('jeans', 'jeans_albedo.jpg', 'jeans_normal.png', rough=.9, nstrength=.7, spec=.3),
        shoe=material('shoe', 'shoe_albedo.jpg', 'shoe_normal.png', rough=.75, nstrength=.4, spec=.35),
    )


def mesh_object(name, D, mats, scale_uv=None, offset=None, recalc=True, flip=False):
    sc = bpy.context.scene
    V = D['V'] + (offset if offset is not None else 0)
    me = bpy.data.meshes.new(name)
    F = [f[::-1] for f in D['F']] if flip else D['F']
    me.from_pydata([tuple(map(float, v)) for v in V], [], [tuple(int(i) for i in f) for f in F])
    me.validate(clean_customdata=False)
    me.update()
    names = []
    for mname in D['M']:
        mname = 'skin_body' if mname == 'skin_body_nails' else ('shoe' if mname == 'shoe_sole' else mname)
        if mname not in names:
            names.append(mname)
    for n in names:
        me.materials.append(mats[n])
    uv = me.uv_layers.new(name='UVMap')
    for p, fu, mname in zip(me.polygons, D['UV'], D['M']):
        p.material_index = names.index('skin_body' if mname == 'skin_body_nails' else ('shoe' if mname == 'shoe_sole' else mname))
        p.use_smooth = True
        fu = fu[::-1] if flip else fu
        for li, u in zip(p.loop_indices, fu):
            if u is None:
                u = (.5, .5)
            if mname == 'skin_body_nails':
                u = (.985, .985)
            if mname == 'shoe_sole':
                u = ((u[0] * .5) % 1, .05 + (u[1] * .1) % .12)
            uv.data[li].uv = u
    ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob)
    if recalc:
        bm = bmesh.new()
        bm.from_mesh(me)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        bm.to_mesh(me)
        bm.free()
    return ob


# ================================================================================================ rig
def build_armature(G):
    J = CB.J
    HO = G['HO']
    e = CH.D['eye']
    hs = HEAD_SCALE
    eyes = {1: HO + e * [1, 1, 1] * hs, -1: HO + e * [-1, 1, 1] * hs}
    jaw = (HO + np.array([0, -.004, -.010]) * hs, HO + np.array([0, -.080, -.072]) * hs)
    tail = [HO + p for p in G['chain'][:4]]
    B = RG.skeleton(J, G['hands'], eyes, tail, jaw)
    arm = bpy.data.armatures.new('rig.human.adult')
    ob = bpy.data.objects.new('chr.jamie-mother:rig', arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    eb = arm.edit_bones
    for n, b in B.items():
        bn = eb.new(n)
        bn.head = Vector(b['head'])
        bn.tail = Vector(b['tail'])
        bn.use_deform = b['deform']
    for n, b in B.items():
        if b['parent']:
            eb[n].parent = eb[b['parent']]
            eb[n].use_connect = False
    # consistent rolls: limbs' Z toward the back (+y) or up
    for bn in eb:
        d = (bn.tail - bn.head).normalized()
        ref = Vector((0, 0, 1)) if abs(d.z) < .8 else Vector((0, 1, 0))
        bn.align_roll(ref)
    bpy.ops.object.mode_set(mode='OBJECT')
    ob['ll_asset_id'] = ASSET_ID
    ob['ll_asset_version'] = VERSION
    ob['ll_rig'] = 'rig.human.adult'
    ob['ll_license'] = 'Original work for Last Light (procedural Blender build); no third-party assets'
    ob['ll_character'] = 'Jamie\'s mother (PROVISIONAL design, approval A-22 open)'
    return ob, B


def skin(ob, arm_ob, groups):
    """groups: (names, idx (n,4), weights (n,4)) for the object's vertices"""
    names, idx, w = groups
    vg = {n: ob.vertex_groups.new(name=n) for n in names}
    for v in range(len(idx)):
        for k in range(4):
            ww = float(w[v, k])
            if ww > 1e-4:
                vg[names[idx[v, k]]].add([v], ww, 'REPLACE')
    md = ob.modifiers.new('Armature', 'ARMATURE')
    md.object = arm_ob
    ob.parent = arm_ob


def head_weights(G):
    J, HO = CB.J, G['HO']
    hd = G['head']
    P = hd['V'] + HO
    n = len(P)
    sp = RG.chain_weights(P, [J['chest'], J['neck'], J['head'], J['head'] + [0, 0, .2]], ['chest', 'neck', 'head'], [.035, .025])
    info = G['info']
    hm = info['hm']
    # the mouth's lips: the rim's upper half on the head, the lower half (the copies) on the jaw
    rings = hm['rings']['mouth']
    loop = hm['loops']['mouth']
    n_up = len([1 for _ in range(len(loop))])
    Vh = hd['V'] / HEAD_SCALE
    lower_ids = [i for i in range(n) if i < info['n_head'] and Vh[i, 2] < CH.MOUTH_OPEN['z'] - .0002 and Vh[i, 1] < -.08 and abs(Vh[i, 0]) < .024]
    upper_ids = [i for i in range(n) if i < info['n_head'] and Vh[i, 2] > CH.MOUTH_OPEN['z'] + .0002 and Vh[i, 1] < -.08 and abs(Vh[i, 0]) < .024 and Vh[i, 2] < -.028]
    jw = RG.jaw_mask(Vh, lower_ids, upper_ids)
    t0, t1 = info['teeth_range']
    jw[t0:t0 + info['n_teeth_upper']] = 0
    jw[t0 + info['n_teeth_upper']:t1] = 1
    info['jaw_w'] = jw
    W = {k: v * (1 - jw * (P[:, 2] > J['neck'][2] - .03)) for k, v in sp.items()}
    W['jaw'] = jw * (P[:, 2] > J['neck'][2] - .03)
    return RG.finalize(W, n)


def body_weights(G):
    J = CB.J
    body = G['body']
    P = body['V']
    n = len(P)
    owner = np.array(body['owner'])
    out = {}
    side = np.where(P[:, 0] >= 0, 1, -1)
    # torso (shirt body, rib) by spine height; near the shoulders, clavicle and upper arm
    sp = RG.spine_weights(P, J)
    armL, armR = RG.arm_weights(P, J, 'l', 1), RG.arm_weights(P, J, 'r', -1)
    legL, legR = RG.leg_weights(P, J, 'l', 1), RG.leg_weights(P, J, 'r', -1)
    handL = RG.hand_weights(P, J, 'l', 1, *G['hands'][1])
    handR = RG.hand_weights(P, J, 'r', -1, *G['hands'][-1])
    is_sleeve = np.isin(owner, ['shirt.sleeve'])
    is_shirt = np.isin(owner, ['shirt', 'shirt.rib'])
    is_arm = np.isin(owner, ['skin.arm'])
    is_hand = np.isin(owner, ['skin.hand', 'nails'])
    is_legs = np.isin(owner, ['jeans'])
    is_shoe = np.isin(owner, ['shoe', 'sole'])
    # how much the shoulder/arm owns a shirt vertex: lateral distance beyond the chest, near the armhole
    lat = np.abs(P[:, 0])
    sh_own = RG.sstep(.115, .175, lat) * RG.sstep(1.17, 1.27, P[:, 2])
    arm_side = {k: np.where(side > 0, armL.get(k, 0), 0) for k in armL}
    arm_side.update({k: np.where(side < 0, armR.get(k, 0), 0) for k in armR})
    # sleeves are 'shirt' too: their vertices lie outside the torso, sh_own picks them up
    torso = {k: v * (1 - sh_own) for k, v in sp.items()}
    shirt_w = RG.combine((is_shirt * 1., torso), (is_shirt * sh_own, arm_side), (is_sleeve * 1., arm_side))
    arm_w = RG.combine((is_arm * 1., arm_side))
    hand_side = {k: np.where(side > 0, v, 0) for k, v in handL.items()}
    hand_side.update({k: hand_side.get(k, 0) + np.where(side < 0, v, 0) for k, v in handR.items()})
    hand_w = RG.combine((is_hand * 1., hand_side))
    leg_side = {k: np.where(side > 0, legL.get(k, 0), 0) for k in legL}
    for k, v in legR.items():
        leg_side[k] = leg_side.get(k, 0) + np.where(side < 0, v, 0)
    # the jeans' seat and waist: hips and spine_01 above the crotch
    hipzone = RG.sstep(.80, .90, P[:, 2])
    legs_w = RG.combine((is_legs * (1 - hipzone), leg_side), (is_legs * hipzone, sp))
    shoe_w = RG.combine((is_shoe * 1., leg_side))
    W = RG.combine((1., shirt_w), (1., arm_w), (1., hand_w), (1., legs_w), (1., shoe_w))
    return RG.finalize(W, n)


def hair_weights(G):
    hr = G['hair']
    HO = G['HO']
    P = hr['V'] + HO
    n = len(P)
    ch = [HO + p for p in G['chain']]
    tail = RG.chain_weights(P, [ch[0] - (ch[1] - ch[0]) * .6] + ch[:4] + [ch[4]], ['head', 'phys_ponytail_01', 'phys_ponytail_02', 'phys_ponytail_03'], [.02, .04, .04])
    # only the ponytail's own vertices (below and behind the elastic) follow the chain
    rel = P - ch[0]
    own = RG.sstep(-.005, .012, rel[:, 1]) * RG.sstep(.01, -.01, rel[:, 2]) + (rel[:, 1] > .01) * RG.sstep(.0, -.03, rel[:, 2])
    own = np.clip(own, 0, 1)
    W = {k: v * own for k, v in tail.items()}
    W['head'] = W.get('head', 0) + (1 - own)
    return RG.finalize(W, n)


# ================================================================================================ face
def shape_keys(ob, G):
    info = G['info']
    hd = G['head']
    Vh = hd['V'] / HEAD_SCALE
    hm = info['hm']
    # lid zones: the grid/lid vertices near each eye (not the brow), including the lid margin rings and lashes
    zone = {}
    for s in (1, -1):
        c = CH.D['eye'] * [s, 1, 1]
        r = np.linalg.norm(Vh - c, axis=1)
        zone[s] = (r < .0215) & (np.sign(Vh[:, 0]) == s)
    info['lid_zone'] = zone
    keys = RG.face_keys(Vh, info, CH.D, CH.EYE_OPEN, CH.MOUTH_OPEN)
    # lashes: follow their root vertex on the lid margin
    a0, a1 = info['lash_range']
    me = ob.data
    ob.shape_key_add(name='Basis', from_mix=False)
    for name in sorted(keys):
        d = keys[name]
        if a1 > a0:
            roots = np.arange(a0, a1, 2)
            for rI in roots:
                # the root and its tip move with the nearest lid vertex of the head
                p = Vh[rI]
                hv = np.argmin(np.linalg.norm(Vh[:info['n_head']] - p, axis=1))
                d[rI] = d[hv]
                d[rI + 1] = d[hv]
        kb = ob.shape_key_add(name=name, from_mix=False)
        flat = ((Vh + d) * HEAD_SCALE + G['HO']).astype(np.float32).ravel()
        kb.data.foreach_set('co', flat)
    return sorted(keys)


# ================================================================================================ clips
class Poser:
    """aim / world-rotation pose solver on the armature's rest matrices (mathutils)"""

    def __init__(self, arm_ob):
        self.ob = arm_ob
        self.bones = arm_ob.data.bones
        self.order = []
        seen = set()

        def visit(b):
            self.order.append(b.name)
            for c in b.children:
                visit(c)
        for b in self.bones:
            if b.parent is None:
                visit(b)
        self.rest = {b.name: b.matrix_local.copy() for b in self.bones}

    def solve(self, spec):
        posed, basis = {}, {}
        for n in self.order:
            b = self.bones[n]
            Mr = self.rest[n]
            if b.parent:
                base = posed[b.parent.name] @ (self.rest[b.parent.name].inverted() @ Mr)
            else:
                base = Mr.copy()
            brot = base.to_quaternion()
            head = base.translation.copy()
            s = spec.get(n, {})
            if 'loc' in s:
                head = Vector(s['loc'])
            W = brot.copy()
            if 'wrot' in s:
                W = s['wrot'] @ brot
            if 'aim' in s:
                yd = (Vector(s['aim']) - head).normalized()
                cy = W @ Vector((0, 1, 0))
                W = cy.rotation_difference(yd) @ W
                if 'pole' in s:
                    pz = Vector(s['pole'])
                    pz = (pz - yd * pz.dot(yd)).normalized()
                    cz = W @ Vector((0, 0, 1))
                    cz = (cz - yd * cz.dot(yd)).normalized()
                    ang = math.atan2(yd.dot(cz.cross(pz)), cz.dot(pz))
                    W = Quaternion(yd, ang) @ W
            if 'post' in s:
                W = W @ s['post']
            posed[n] = Matrix.Translation(head) @ W.to_matrix().to_4x4()
            basis[n] = (brot.inverted() @ W, brot.inverted() @ (head - base.translation))
        self.posed = posed
        return basis

    def joint(self, n):
        return self.posed[n].translation.copy()


def two_bone(hip, target, l1, l2, pole):
    """knee/elbow position for a two-bone chain from hip to target with the bend toward pole"""
    d = target - hip
    L = d.length
    L = max(min(L, l1 + l2 - 1e-4), abs(l1 - l2) + 1e-4)
    dn = d.normalized()
    x = (l1 * l1 - l2 * l2 + L * L) / (2 * L)
    h = math.sqrt(max(0, l1 * l1 - x * x))
    pp = (pole - dn * pole.dot(dn)).normalized()
    return hip + dn * x + pp * h, hip + dn * L


def qa(axis, deg):
    return Quaternion(Vector(axis), math.radians(deg))


def make_clips(arm_ob, G):
    P = Poser(arm_ob)
    pb = arm_ob.pose.bones
    for b in pb:
        b.rotation_mode = 'QUATERNION'
    J = CB.J
    L = lambda a, b: (Vector(J[a]) - Vector(J[b])).length
    l_th, l_sh = L('hip', 'knee'), L('knee', 'ankle')
    l_up, l_fo = L('shoulder', 'elbow'), L('elbow', 'wrist')
    arm_ob.animation_data_create()
    clips = {}

    def hang(side, swing=0., flex=12., out=6., lift=0.):
        """arm hanging relaxed: upper arm down (out deg from vertical, swing deg forward), the elbow bent flex deg"""
        sh = P.joint('upperarm_' + ('l' if side > 0 else 'r'))
        d = Vector((0, 0, -1))
        d = qa((0, 1, 0), -side * out) @ d               # away from the body
        d = qa((1, 0, 0), -swing) @ d                   # forward (-y) for positive swing
        d = qa((1, 0, 0), -lift) @ d
        el = sh + d * l_up
        fd = qa((1, 0, 0), -(swing + flex)) @ (qa((0, 1, 0), -side * (out - 2)) @ Vector((0, 0, -1)))
        wr = el + fd * l_fo
        return el, wr

    def arm_spec(spec, side, el, wr, hand_pitch=-6., hand_roll=0.):
        s = 'l' if side > 0 else 'r'
        back = Vector((0, 1, 0))
        spec['upperarm_' + s] = dict(aim=el, pole=Vector((side * .3, 1, 0)))
        spec['lowerarm_' + s] = dict(aim=wr, pole=Vector((side * .2, 1, .2)))
        spec['hand_' + s] = dict(post=qa((1, 0, 0), hand_pitch) @ qa((0, 1, 0), hand_roll))

    def key_all(name, frames, specf, loop=True):
        act = bpy.data.actions.new(name)
        arm_ob.animation_data.action = act
        n = len(frames)
        for i, f in enumerate(frames):
            t = i / (n - 1) if not loop else i / (n - 1)
            spec = specf(t, P)
            basis = P.solve(spec)
            for bn in P.order:
                q, l = basis[bn]
                pb[bn].rotation_quaternion = q
                pb[bn].location = l
                if bn in spec or bn in POSED_ALWAYS:
                    pb[bn].keyframe_insert('rotation_quaternion', frame=f, group=bn)
                if bn == 'hips':
                    pb[bn].keyframe_insert('location', frame=f, group=bn)
        act.use_fake_user = True
        tr = arm_ob.animation_data.nla_tracks.new()
        tr.name = name
        st = tr.strips.new(name, frames[0], act)
        st.name = name
        tr.mute = True
        arm_ob.animation_data.action = None
        clips[name] = dict(frames=len(frames), seconds=(len(frames) - 1) / FPS, loop=loop)

    hips0 = Vector(J['hips'])

    def base_spec(spec, sway=0., breath=0., lean=0., yaw=0., head_pitch=0., head_yaw=0., hips_drop=0., hips_roll=0.):
        spec['hips'] = dict(loc=hips0 + Vector((sway, 0, -hips_drop)), wrot=qa((0, 1, 0), hips_roll) @ qa((0, 0, 1), yaw * .5))
        spec['spine_01'] = dict(wrot=qa((1, 0, 0), -lean * .3) @ qa((0, 1, 0), -hips_roll * .5))
        spec['spine_02'] = dict(wrot=qa((1, 0, 0), -breath * .6 - lean * .3))
        spec['chest'] = dict(wrot=qa((1, 0, 0), -breath - lean * .2) @ qa((0, 0, 1), -yaw * .3))
        spec['neck'] = dict(wrot=qa((1, 0, 0), head_pitch * .4) @ qa((0, 0, 1), head_yaw * .4))
        spec['head'] = dict(wrot=qa((1, 0, 0), head_pitch * .6) @ qa((0, 0, 1), head_yaw * .6))

    def legs_stand(spec, P, weight=0., bend=0.):
        """feet planted at rest; the hips' move bends the knees as needed. weight > 0: more on the left leg"""
        P.solve(spec)
        for side, s in ((1, 'l'), (-1, 'r')):
            hipj = P.joint('thigh_' + s)
            ank = Vector(J['ankle']) * Vector((side, 1, 1))
            ank = Vector((ank.x, ank.y, ank.z))
            k, a = two_bone(hipj, ank, l_th, l_sh, Vector((0, -1, 0)))
            spec['thigh_' + s] = dict(aim=k, pole=Vector((0, -1, 0)) * -1 + Vector((0, 0, 0)))
            spec['calf_' + s] = dict(aim=a)
            spec['foot_' + s] = dict(aim=Vector(J['ball']) * Vector((side, 1, 1)))
            spec['toe_' + s] = dict(aim=Vector(J['toe']) * Vector((side, 1, 1)))

    S = lambda t, k=1, ph=0: math.sin(2 * math.pi * (k * t + ph))
    C = lambda t, k=1, ph=0: math.cos(2 * math.pi * (k * t + ph))

    # ---- idle_breathe: 4 s loop; breathing, a slow weight shift, the head settling
    def idle(t, P):
        spec = {}
        base_spec(spec, sway=.007 * S(t), breath=.9 * S(t, 1), hips_drop=.004 + .002 * (1 - C(t, 2)) / 2, hips_roll=1.2 * S(t),
                  head_pitch=1.2 * S(t, 1, .2), head_yaw=1.5 * S(t, 1, .6))
        legs_stand(spec, P)
        P.solve(spec)
        for side in (1, -1):
            el, wr = hang(side, swing=2 + 1.2 * S(t, 1, .25 * side), flex=13 + 2 * S(t, 1), out=7)
            arm_spec(spec, side, el, wr, hand_pitch=-8)
        return spec
    key_all('idle_breathe', list(range(0, 121)), idle)

    # ---- walk: in place, one cycle = 1.30 m (two steps) in 36 frames (1.083 m/s at 30 fps); the runtime drives the
    # phase from the distance actually travelled, so the planted foot does not slide
    STRIDE = 1.30
    STANCE = .56
    yf, yb = -.33, .40          # (yb - yf) = STANCE x STRIDE: the planted foot moves back at exactly the body's speed

    def foot_at(u, side):
        """foot target (ankle position, pitch) for gait phase u (0 = this foot's heel strike)"""
        ax = Vector(J['ankle']) * Vector((side, 1, 1))
        if u < STANCE:
            s = u / STANCE
            y = yf + (yb - yf) * s
            pitch = 14 * max(0, 1 - s / .12) ** 2 - 30 * max(0, (s - .72) / .28) ** 1.6
            lift = 0.
        else:
            w = (u - STANCE) / (1 - STANCE)
            mj = 10 * w ** 3 - 15 * w ** 4 + 6 * w ** 5
            y = yb + (yf - yb) * mj
            pitch = -30 * (1 - min(1, w / .45)) ** 1.5 + 14 * max(0, (w - .55) / .45) ** 1.2
            lift = .065 * math.sin(math.pi * w) ** 1.2 + .012 * math.sin(math.pi * w * 2) * (w < .5)
        # pitch about the heel (toe up) or the ball (heel up)
        heel = Vector((ax.x, y + .055, 0.))
        ball = Vector((ax.x, y - .118, .02))
        a_rest = Vector((ax.x, y, ax.z + lift))
        if pitch > 0:
            r = qa((1, 0, 0), pitch)
            piv = heel + Vector((0, 0, lift))
            a = piv + r @ (a_rest - piv)
            b = piv + r @ (ball + Vector((0, 0, lift)) - piv)
        else:
            r = qa((1, 0, 0), pitch)
            piv = ball + Vector((0, 0, lift))
            a = piv + r @ (a_rest - piv)
            b = piv.copy()
        return a, b, pitch

    def walk(t, P):
        spec = {}
        bob = .011 * C(t, 2, -.15)
        sway = .016 * S(t, 1, .0)
        base_spec(spec, sway=sway, breath=0, lean=4, yaw=-5 * S(t, 1, .25) * 0, hips_drop=.034 - bob, hips_roll=-3.5 * S(t, 1, .0),
                  head_pitch=-1.5, head_yaw=0)
        spec['hips']['wrot'] = qa((0, 1, 0), -3.5 * S(t)) @ qa((0, 0, 1), 4.5 * S(t, 1, .25))
        spec['chest']['wrot'] = qa((1, 0, 0), -1.2) @ qa((0, 0, 1), -6 * S(t, 1, .25))
        spec['neck']['wrot'] = qa((0, 0, 1), 1.5 * S(t, 1, .25))
        spec['head']['wrot'] = qa((0, 0, 1), 1.2 * S(t, 1, .25)) @ qa((1, 0, 0), -1.0 + .8 * C(t, 2))
        P.solve(spec)
        for side, s, ph in ((1, 'l', 0.), (-1, 'r', .5)):
            u = (t + ph) % 1
            a, b, pitch = foot_at(u, side)
            hipj = P.joint('thigh_' + s)
            k, a2 = two_bone(hipj, a, l_th, l_sh, Vector((0, -1, .1)))
            spec['thigh_' + s] = dict(aim=k, pole=Vector((0, 1, 0)))
            spec['calf_' + s] = dict(aim=a2)
            spec['foot_' + s] = dict(aim=b)
            toe = b + Vector((0, -.06, -.008 if pitch < 0 else 0))
            if pitch < 0:
                toe = Vector((b.x, b.y - .06, max(.004, b.z - .01)))
            spec['toe_' + s] = dict(aim=toe)
            P.solve(spec)
        for side, ph in ((1, .5), (-1, 0.)):
            swing = 13 * S(t, 1, .25 + ph)
            el, wr = hang(side, swing=swing + 3, flex=16 + 9 * max(0, S(t, 1, .25 + ph)), out=8)
            arm_spec(spec, side, el, wr, hand_pitch=-10)
        return spec
    key_all('walk', list(range(0, 37)), walk)

    # ---- door_open: 0.6 s, anticipation at the door: weight forward, the near hand starting toward the door
    def door(t, P):
        spec = {}
        e = RG.sstep(0, 1, t)
        base_spec(spec, sway=-.006 * e, lean=4 * e, hips_drop=.006, hips_roll=-1.5 * e, head_pitch=-2 * e)
        legs_stand(spec, P)
        P.solve(spec)
        el, wr = hang(-1, swing=8 + 30 * e, flex=20 + 45 * e, out=10)
        arm_spec(spec, -1, el, wr, hand_pitch=-15 * e)
        el, wr = hang(1, swing=3, flex=14, out=7)
        arm_spec(spec, 1, el, wr, hand_pitch=-8)
        return spec
    key_all('door_open', list(range(0, 19)), door, loop=False)

    # ---- porch_wave: 2.4 s; the right hand up beside the head, a small wave, back down (the game's own wave window)
    def wave(t, P):
        spec = {}
        up = RG.sstep(0, .22, t) * (1 - RG.sstep(.78, 1, t))
        base_spec(spec, sway=-.008 * up, breath=.4 * S(t, 1), hips_roll=-1.5 * up, head_pitch=1.5 * up, head_yaw=-2 * up)
        legs_stand(spec, P)
        P.solve(spec)
        shr = P.joint('upperarm_r')
        osc = math.sin(2 * math.pi * 2.3 * t * 2.4) * RG.sstep(.18, .3, t) * (1 - RG.sstep(.72, .84, t))
        el_up = shr + Vector((-.17, -.10, -.18))
        wr_up = el_up + (qa((0, 1, 0), 18 * osc) @ Vector((-.02, -.05, .22)).normalized()) * l_fo
        el0, wr0 = hang(-1, swing=3, flex=14, out=7)
        el = el0.lerp(el_up, up)
        wr = wr0.lerp(wr_up, up)
        arm_spec(spec, -1, el, wr, hand_pitch=-8 + 20 * up, hand_roll=12 * osc * up)
        el, wr = hang(1, swing=2, flex=14, out=7)
        arm_spec(spec, 1, el, wr, hand_pitch=-8)
        return spec
    key_all('porch_wave', list(range(0, 73)), wave, loop=False)

    # ---- porch_wait: 8 s loop; standing on the porch, the weight moving from one leg to the other and back, a hand
    # loosely on the hip for a moment (ordinary waiting, a little expectation)
    def wait(t, P):
        spec = {}
        w = S(t, 1, 0)
        hand = RG.sstep(.30, .40, t) * (1 - RG.sstep(.62, .72, t))
        base_spec(spec, sway=.020 * w, breath=.8 * S(t, 2), hips_drop=.006 + .004 * abs(w), hips_roll=2.4 * w, head_pitch=.8 * S(t, 2, .3),
                  head_yaw=1.2 * S(t, 1, .1))
        spec['spine_02']['wrot'] = qa((0, 1, 0), -1.4 * w) @ spec['spine_02']['wrot']
        legs_stand(spec, P)
        P.solve(spec)
        el0, wr0 = hang(1, swing=2, flex=14, out=7)
        sh = P.joint('upperarm_l')
        hip_pt = Vector((.150, .010, .965))
        el_h = sh + Vector((.105, .060, -.215))
        el = el0.lerp(el_h, hand)
        wr = wr0.lerp(hip_pt, hand)
        arm_spec(spec, 1, el, wr, hand_pitch=-8 - 40 * hand, hand_roll=-30 * hand)
        el, wr = hang(-1, swing=2.5 + .8 * S(t, 2), flex=14, out=7)
        arm_spec(spec, -1, el, wr, hand_pitch=-8)
        return spec
    key_all('porch_wait', list(range(0, 241)), wait)

    # ---- rest pose clip (the A-pose, for reviews and as the bind reference)
    key_all('apose', [0, 1], lambda t, P: {}, loop=False)
    for b in pb:
        b.rotation_quaternion = (1, 0, 0, 0)
        b.location = (0, 0, 0)
    return clips, dict(stride=STRIDE, walk_cycle_s=36 / FPS)


# ================================================================================================ main
def main():
    os.makedirs(SRC, exist_ok=True)
    G = build_geometry()
    build_textures(G)
    sc = clear()
    mats = make_materials()
    HO = G['HO']
    head_ob = mesh_object('JamieMotherHead', G['head'], mats, offset=HO, recalc=False, flip=True)
    hair_ob = mesh_object('JamieMotherHair', G['hair'], mats, offset=HO, recalc=True)
    body_ob = mesh_object('JamieMotherBody', G['body'], mats, recalc=True)
    eye_obs = []
    for e in G['eyes']:
        D = dict(V=e['V'], F=e['F'], UV=e['UV'], M=['eye'] * len(e['F']))
        eye_obs.append(mesh_object('JamieMotherEye_' + ('l' if e['side'] > 0 else 'r'), D, mats, offset=HO, recalc=False, flip=True))
    arm_ob, B = build_armature(G)
    log('armature', len(B), 'bones')
    skin(head_ob, arm_ob, head_weights(G))
    skin(body_ob, arm_ob, body_weights(G))
    skin(hair_ob, arm_ob, hair_weights(G))
    for eo, s in zip(eye_obs, ('l', 'r')):
        n = len(eo.data.vertices)
        skin(eo, arm_ob, (['eye_' + s], np.zeros((n, 4), int), np.tile([1., 0, 0, 0], (n, 1))))
    keys = shape_keys(head_ob, G)
    log('shape keys', len(keys))
    clips, walkinfo = make_clips(arm_ob, G)
    log('clips', list(clips))
    # join both eyes into one object (one draw call)
    bpy.ops.object.select_all(action='DESELECT')
    for eo in eye_obs:
        eo.select_set(True)
    bpy.context.view_layer.objects.active = eye_obs[0]
    bpy.ops.object.join()
    eye_obs[0].name = 'JamieMotherEyes'
    for ob in (head_ob, hair_ob, body_ob, eye_obs[0]):
        ob['ll_part'] = ob.name
    sc['ll_asset_id'] = ASSET_ID
    bpy.ops.wm.save_as_mainfile(filepath=BLEND)
    bpy.ops.file.make_paths_relative()
    bpy.ops.wm.save_as_mainfile(filepath=BLEND)
    log('saved', BLEND)
    ll_export.export_glb(GLB)
    stats = dict(asset=ASSET_ID, version=VERSION, blender=bpy.app.version_string, glb_bytes=os.path.getsize(GLB),
                 triangles={ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in (head_ob, hair_ob, body_ob, eye_obs[0])},
                 bones=len(B), deform_bones=sum(1 for b in B.values() if b['deform']), shape_keys=keys, clips=clips, walk=walkinfo,
                 measurements=measure(G, B))
    stats['triangles']['total'] = sum(stats['triangles'].values())
    json.dump(stats, open(STATS, 'w'), indent=1)
    log('done', stats['triangles'])


def measure(G, B):
    J = CB.J
    HO = G['HO']
    hV = G['head']['V'][:G['info']['n_head']] + HO
    top = float(max(hV[:, 2].max(), (G['hair']['V'] + HO)[:, 2].max()))
    crown = float(hV[:, 2].max())
    hmV = G['info']['hm']['V']
    front = (hmV[:, 1] < -.07) & (np.abs(hmV[:, 0]) < .012)
    chin = float(hmV[front][:, 2].min() + HO[2])
    head_h = crown - chin
    return dict(stature_m=round(crown, 4), top_of_hair_m=round(top, 4), head_height_m=round(head_h, 4), heads_tall=round(crown / head_h, 2),
                chin_m=round(chin, 4), eye_height_m=round(float(HO[2] + CH.D['eye'][2]), 4), shoulder_width_m=round(float(2 * J['shoulder'][0]), 3),
                hip_joint_m=round(float(J['hip'][2]), 3), knee_m=round(float(J['knee'][2]), 3),
                upper_arm_m=round(float(np.linalg.norm(J['elbow'] - J['shoulder'])), 3), forearm_m=round(float(np.linalg.norm(J['wrist'] - J['elbow'])), 3),
                thigh_m=round(float(np.linalg.norm(J['knee'] - J['hip'])), 3), shin_m=round(float(np.linalg.norm(J['ankle'] - J['knee'])), 3),
                interpupillary_m=round(float(2 * CH.D['eye'][0]), 4))


if __name__ == '__main__':
    main()
