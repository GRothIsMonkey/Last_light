"""The driveway basketball kid, chr.hoop-kid: an anonymous neighbourhood boy (not Jamie, Sam, Alex, the protagonist or
Lily Henderson), rebuilt from his existing spec (cast.js CAST.kid) as a light secondary character.

    python3 tools/blender/supportcast/build_hoop_kid.py

Same procedural pipeline as Jamie's mother (build_jamie_mother.py), at a lower resolution and with a child's
configuration: 1.50 m (the original rig's 1.53 m with a child's own proportions), a rounder face, a broad nose, cropped
black hair, his off-white ringer tee with the red trim, blue basketball shorts, white crew socks, off-white sneakers.
Clips follow ambient.js updateKid exactly: dribble (one bounce, sampled at the controller's own phase), shoot (release
at 0.35 s), catch (the ball back in 1.3 s), hold (the ball at his hip while he watches the boys ride by), idle.
"""
import json, math, os, sys
import numpy as np
import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build_jamie_mother as BJ                                  # noqa: E402  (the shared pipeline)
import chr_head as CH, chr_body as CB, chr_hair as HR, chr_tex as TX, chr_rig as RG   # noqa: E402

ROOT = BJ.ROOT
ASSET_ID = 'chr.hoop-kid'
SRC = os.path.join(ROOT, 'assets', 'source', 'chr', 'hoop-kid')
BJ.ASSET_ID = ASSET_ID
BJ.SRC = SRC
BJ.TEXD = os.path.join(SRC, 'textures')
BJ.BLEND = os.path.join(SRC, 'chr.hoop-kid.blend')
BJ.GLB = os.path.join(ROOT, 'dist', 'assets', 'chr', 'chr.hoop-kid.glb')
BJ.STATS = os.path.join(SRC, 'build-stats.json')
# cast.js CAST.kid (CURRENT SOURCE): skin, lips, iris, hair; clothes
BJ.SPEC = dict(skin=0xa5724f, lips=0x8a5444, iris=0x1a120c, hair=0x1f1a17, brow=0x1f1a17, shirt=0xe6e2d6, trim=0xc04a3a,
               shorts=0x2e4a7a, socks=0xf0ece2, shoes=0xdad6cc, sole=0xf0eee8)
SPEC = BJ.SPEC
HEAD_SCALE = .95
BJ.HEAD_SCALE = HEAD_SCALE

# a child of about eleven, 1.50 m: the adult joints scaled, a relatively larger head, narrower shoulders and hips
KJ = dict(
    head_origin=np.array([0, .010, 1.383]),
    neck=np.array([0, .024, 1.285]), head=np.array([0, .014, 1.346]),
    chest=np.array([0, .026, 1.085]), spine_02=np.array([0, .026, 1.000]), spine_01=np.array([0, .022, .920]),
    hips=np.array([0, .012, .860]),
    shoulder=np.array([.148, .008, 1.215]), clav=np.array([.020, -.008, 1.242]),
    elbow=np.array([.214, .013, .969]), wrist=np.array([.265, -.003, .771]),
    hip=np.array([.078, .004, .792]), knee=np.array([.082, -.004, .430]), ankle=np.array([.085, .010, .070]),
    ball=np.array([.092, -.106, .018]), toe=np.array([.096, -.160, .010]),
)
KTORSO = np.array([
    [1.330, .0440, -.022, .056, 2.0],
    [1.305, .0470, -.026, .060, 2.0],
    [1.282, .0500, -.032, .064, 2.0],
    [1.265, .0800, -.044, .068, 2.2],
    [1.250, .1250, -.058, .072, 2.6],
    [1.237, .1400, -.066, .074, 2.9],
    [1.224, .1440, -.070, .076, 3.0],
    [1.195, .1440, -.078, .080, 2.8],
    [1.155, .1370, -.084, .080, 2.5],
    [1.115, .1320, -.086, .080, 2.4],
    [1.075, .1300, -.084, .078, 2.3],
    [1.035, .1260, -.080, .076, 2.3],
    [0.995, .1220, -.078, .074, 2.3],
    [0.955, .1200, -.078, .072, 2.3],
    [0.915, .1200, -.078, .072, 2.3],
    [0.880, .1260, -.078, .078, 2.4],
    [0.845, .1360, -.078, .088, 2.4],
    [0.810, .1420, -.076, .096, 2.4],
    [0.780, .1440, -.072, .100, 2.4],
    [0.745, .1400, -.066, .096, 2.4],
    [0.710, .1320, -.060, .088, 2.4],
])
# cropped hair: a low, even hairline, a short shell (no ponytail)
KHAIRLINE = [(0., .50), (.35, .47), (.70, .36), (1.0, .26), (1.25, .12), (1.45, .02), (1.62, .16), (1.85, .06),
             (2.25, -.30), (2.65, -.58), (math.pi, -.66)]


def configure():
    CB.J = {k: v.copy() for k, v in KJ.items()}
    CB.TORSO = KTORSO
    CB.BUST = 0.0
    HR.HAIRLINE = KHAIRLINE
    HR.SHELL = dict(base=.0028, bulge=0., edge=.0035, flat_ears=0.)
    HR.ANCHOR = np.array([0, .080, .020])


def kid_head():
    """a boy's head: rounder cheeks, a broad nose, a softer jaw and brow, no expression lines; scaled 0.95"""
    H = CH.Head(cheek=1.16, jaw=.94, nose_len=.86, nose_proj=.86, nose_w=1.22, brow=.55, chin=.92, lip_full=1.06, age=0., asym=.7)
    g = CH.relax(CH.build(H, NU=64, NV=74), iters=10)
    hm = CH.assemble(g)
    return H, g, hm


def build_geometry():
    configure()
    H, g, hm = kid_head()
    BJ.log('kid head', len(hm['V']))
    HO = CB.J['head_origin']
    NU, NV = hm['NU'], hm['NV']
    Vh = hm['V']
    az, el = HR.az_el(Vh)
    under = (el - HR.hairline_elev(az)) > .16
    keepf = [k for k, f in enumerate(hm['F']) if not all(under[i] for i in f)]
    hm = dict(hm, F=[hm['F'][k] for k in keepf], UV=[hm['UV'][k] for k in keepf])
    UV = [[(u, .08 + .92 * v) if u < .97 else (u, v) for (u, v) in fu] for fu in hm['UV']]
    hb = Vh[:NU] * HEAD_SCALE + HO
    yk = CB.yoke(hb, z_to=1.205, rows=8)
    yk_uv = [[(u % 1.0001, .075 * (1 - min(v / .09, 1))) for (u, v) in fu] for fu in yk['UV']]
    yV = yk['V'][NU:]
    yF = [[(i - NU + len(Vh)) if i >= NU else i for i in f][::-1] for f in yk['F']]
    yk_uv = [u[::-1] for u in yk_uv]
    special = [k for k, fu in enumerate(UV) if fu[0][0] >= .97 and fu[0][1] >= .98]
    sv = sorted({i for k in special for i in hm['F'][k]})
    base = len(Vh) + len(yV)
    cmap = {v: base + n for n, v in enumerate(sv)}
    # head space, scaled: the yoke comes back into head space at the head's scale
    Vs = Vh * HEAD_SCALE
    V = np.concatenate([Vs, (yV - HO), Vs[sv]])
    F = [list(f) for f in hm['F']] + yF + [[cmap[i] for i in hm['F'][k]][::-1] for k in special]
    U = UV + yk_uv + [UV[k][::-1] for k in special]
    M = ['skin_head'] * len(F)
    teeth = BJ.teeth_mesh()
    teeth['V'] = teeth['V'] * HEAD_SCALE
    la, lb = HR.lashes(hm, 1), HR.lashes(hm, -1)
    for extra in (la, lb):
        extra['V'] = extra['V'] * HEAD_SCALE
    for extra, mat in ((teeth, 'teeth'), (la, 'hair_cards'), (lb, 'hair_cards')):
        off = len(V)
        V = np.concatenate([V, extra['V']])
        F += [[i + off for i in f] for f in extra['F']]
        U += [[(.905 + .04 * u, v) for (u, v) in fu] for fu in extra['UV']] if mat == 'hair_cards' else extra['UV']
        M += [mat] * len(extra['F'])
    nb = len(Vh) + len(yV) + len(sv)
    V, F, U, M = BJ.add_ears(H, hm, V, F, U, M, HEAD_SCALE)
    head = dict(V=V, F=F, UV=U, M=M, n_grid=NU * NV)
    hm_s = dict(hm, V=hm['V'] * HEAD_SCALE)
    info = dict(hm=hm_s, g=g, H=H, n_head=len(Vh), n_yoke=len(yV), dup_map=cmap, teeth_range=(nb, nb + len(teeth['V'])),
                lash_range=(nb + len(teeth['V']), nb + len(teeth['V']) + len(la['V']) + len(lb['V'])), n_teeth_upper=teeth['n_upper'])
    shell, _ = HR.shell(hm, H, NU, NV)
    shell['V'] = shell['V'] * HEAD_SCALE
    hair = BJ.merge_mats([(shell, 'hair')])
    # body
    sh, _ = CB.shirt(n=40, hem=.770, rows=18)
    # the ringer tee's trim: the rib band (the shirt's last 4 x 40 faces) samples the red rows at the tile's top; the body
    # keeps v below them
    nrib = 4 * 40
    vmax = max(v for fu in sh['UV'][:-nrib] for (u, v) in fu) or 1
    sh['UV'] = [[(u, .05 + .78 * v / vmax) for (u, v) in fu] for fu in sh['UV'][:-nrib]] + [[(u, .95) for (u, v) in fu] for fu in sh['UV'][-nrib:]]
    parts = [(sh, 'shirt')]
    hands = {}
    for side in (1, -1):
        sl = CB.sleeve(side, n=20, length=.130)
        # the cuff: the sleeve's last three rings (the hem and its turned edge) take the trim
        ncuff = 3 * 20
        vmx = max(v for fu in sl['UV'] for (u, v) in fu) or 1
        sl['UV'] = [[(u, .05 + .78 * v / vmx) for (u, v) in fu] for fu in sl['UV'][:-ncuff]] + [[(u, .95) for (u, v) in fu] for fu in sl['UV'][-ncuff:]]
        parts.append((sl, 'shirt'))
        a, wr = CB.arm(side, n=14)
        hmesh, nails, tips, fr = CB.hand(side, wr, n=14)
        # a child's hand: 88 % of the woman's, about the wrist
        for m_ in (hmesh, nails):
            m_['V'] = fr['W'] + (m_['V'] - fr['W']) * .88
        tips = {k: ([fr['W'] + (np.asarray(p) - fr['W']) * .88 for p in v[0]], v[1]) for k, v in tips.items()}
        hands[side] = (tips, fr)
        parts += [(a, 'skin_body'), (hmesh, 'skin_body'), (nails, 'skin_body_nails'), (CB.bare_leg(side, n=14), 'skin_body'),
                  (CB.sock(side, n=14), 'sock')]
        up, so = CB.shoe(side)
        for m_ in (up, so):
            m_['V'] = CB.J['ankle'] * [side, 1, 1] * [1, 1, 0] + (m_['V'] - CB.J['ankle'] * [side, 1, 1] * [1, 1, 0]) * [.93, .90, .95]
        parts += [(up, 'shoe'), (so, 'shoe_sole')]
    parts.append((CB.shorts(n_hip=36, rows_hip=5), 'shorts'))
    body = BJ.merge_mats(parts)
    eyes = BJ.eye_meshes(nu=20, nv=12)
    for e in eyes:
        e['V'] = e['V'] * HEAD_SCALE
    return dict(head=head, info=info, hair=hair, chain=[np.array([0, .08, .02]) + [0, 0, -.03 * k] for k in range(5)], body=body,
                eyes=eyes, hands=hands, HO=HO)


def build_textures(G):
    os.makedirs(BJ.TEXD, exist_ok=True)
    info, head = G['info'], G['head']
    hm = info['hm']
    S = 1024
    nf = len(hm['F'])
    P, Mk = TX.raster_positions(head['V'], head['F'][:nf], head['UV'][:nf], S)
    P = P / HEAD_SCALE                        # paint in the adult head space the painter knows

    def depth_fn(p):
        az, el = HR.az_el(p)
        return el - HR.hairline_elev(az)
    col, pores = TX.head_skin(P, Mk, SPEC, depth_fn, CH.D['eye'], S)
    # cropped hair: the scalp is the hair (dense dark stipple)
    dp = depth_fn(P)
    hairz = np.clip((dp + .01) / .03, 0, 1)
    stip = TX.noise3(P, 900, 4, 2)
    col = col * (1 - hairz[..., None]) + (TX.srgb(SPEC['hair']) * (.8 + .5 * stip[..., None])) * hairz[..., None]
    yk = int(S * (1 - .08))
    col[yk:] = TX.srgb(SPEC['skin']) * (1 + .03 * (TX.noise2((S - yk, S), 20, 5) - .5))[..., None]
    TX.save(col, os.path.join(BJ.TEXD, 'skin_head_albedo.jpg'), quality=90)
    TX.save(TX.normal_from_height(pores[::2, ::2], .9), os.path.join(BJ.TEXD, 'skin_head_normal.png'))
    bc, bn = TX.body_skin(SPEC, S=256)
    bc[:12, -12:] = TX.srgb(SPEC['skin']) * [1.1, .95, .9] + .1
    TX.save(bc, os.path.join(BJ.TEXD, 'skin_body_albedo.jpg'))
    TX.save(bn, os.path.join(BJ.TEXD, 'skin_body_normal.png'))
    TX.save(TX.eye_tex(SPEC, S=256), os.path.join(BJ.TEXD, 'eye_albedo.jpg'))
    # hair: short dark strands (the shell), the lash strip
    hc, ha, hn = TX.hair_tex(SPEC, W=256, Hh=256)
    TX.save(hc, os.path.join(BJ.TEXD, 'hair_shell_albedo.jpg'))
    W = hc.shape[1]
    hc[:, int(W * .90):] = [.03, .025, .02]
    lash = np.zeros_like(ha[:, int(W * .90):])
    xx = np.arange(lash.shape[1])
    for c in range(0, lash.shape[1], 3):
        lash += np.outer(np.clip(1 - np.linspace(0, 1, lash.shape[0]) ** 1.5, 0, 1), np.exp(-((xx - c) / .7) ** 2))
    ha[:, int(W * .90):] = np.clip(lash, 0, 1)
    TX.save(hc, os.path.join(BJ.TEXD, 'hair_albedo.png'), alpha=ha)
    TX.save(hn, os.path.join(BJ.TEXD, 'hair_normal.png'))
    # the ringer tee: off-white jersey with the red trim band at the tile's top (neckband and sleeve hems sample it)
    jc, jn = TX.jersey(SPEC['shirt'], S=256)
    jc[:20] = TX.srgb(SPEC['trim']) * (.92 + .1 * TX.noise2((20, 256), 8, 3)[..., None])
    TX.save(jc, os.path.join(BJ.TEXD, 'shirt_albedo.jpg'))
    TX.save(jn, os.path.join(BJ.TEXD, 'shirt_normal.png'))
    # basketball shorts: a mesh-weave poly in blue
    yy, xx = np.mgrid[0:256, 0:256] / 256
    mesh = (np.sin(xx * math.pi * 120) * np.sin(yy * math.pi * 120)) * .5 + .5
    sc = TX.srgb(SPEC['shorts'])[None, None] * (.85 + .25 * mesh[..., None])
    TX.save(np.clip(sc, 0, 1), os.path.join(BJ.TEXD, 'shorts_albedo.jpg'))
    TX.save(TX.normal_from_height(mesh, 1.2), os.path.join(BJ.TEXD, 'shorts_normal.png'))
    so = TX.srgb(SPEC['socks'])[None, None] * (.9 + .1 * mesh[..., None])
    TX.save(np.clip(so, 0, 1), os.path.join(BJ.TEXD, 'sock_albedo.jpg'))
    cc, cn = TX.canvas(SPEC['shoes'], S=256)
    cc[int(256 * .8):] = TX.srgb(SPEC['sole'])
    TX.save(cc, os.path.join(BJ.TEXD, 'shoe_albedo.jpg'))
    TX.save(cn, os.path.join(BJ.TEXD, 'shoe_normal.png'))
    TX.save(np.ones((32, 32, 3)) * [.88, .85, .78], os.path.join(BJ.TEXD, 'teeth_albedo.jpg'))


def make_materials():
    m = BJ.material
    return dict(
        skin_head=m('skin_head', 'skin_head_albedo.jpg', 'skin_head_normal.png', rough=.5, sss=.1, nstrength=.3, spec=.45),
        skin_body=m('skin_body', 'skin_body_albedo.jpg', 'skin_body_normal.png', rough=.5, sss=.08, nstrength=.3, spec=.45),
        teeth=m('teeth', 'teeth_albedo.jpg', rough=.3),
        eye=m('eye', 'eye_albedo.jpg', rough=.05, spec=.6, coat=.6),
        hair=m('hair', 'hair_shell_albedo.jpg', 'hair_normal.png', rough=.62, nstrength=.3, spec=.35),
        hair_cards=m('hair_cards', 'hair_albedo.png', None, rough=.6, alpha=True),
        shirt=m('shirt', 'shirt_albedo.jpg', 'shirt_normal.png', rough=.86, nstrength=.4, spec=.3),
        shorts=m('shorts', 'shorts_albedo.jpg', 'shorts_normal.png', rough=.6, nstrength=.4, spec=.4),
        sock=m('sock', 'sock_albedo.jpg', None, rough=.9, spec=.25),
        shoe=m('shoe', 'shoe_albedo.jpg', 'shoe_normal.png', rough=.6, nstrength=.3, spec=.4),
    )


def body_weights(G):
    J = CB.J
    body = G['body']
    P = body['V']
    n = len(P)
    owner = np.array(body['owner'])
    side = np.where(P[:, 0] >= 0, 1, -1)
    sp = RG.spine_weights(P, J)
    armL, armR = RG.arm_weights(P, J, 'l', 1), RG.arm_weights(P, J, 'r', -1)
    legL, legR = RG.leg_weights(P, J, 'l', 1), RG.leg_weights(P, J, 'r', -1)
    handL = RG.hand_weights(P, J, 'l', 1, *G['hands'][1])
    handR = RG.hand_weights(P, J, 'r', -1, *G['hands'][-1])
    pick = lambda d, sgn: {k: np.where(side == sgn, v, 0) for k, v in d.items()}
    arm_side = RG.combine((1., pick(armL, 1)), (1., pick(armR, -1)))
    hand_side = RG.combine((1., pick(handL, 1)), (1., pick(handR, -1)))
    leg_side = RG.combine((1., pick(legL, 1)), (1., pick(legR, -1)))
    is_ = lambda *names: np.isin(owner, list(names)) * 1.
    lat = np.abs(P[:, 0])
    sh_own = RG.sstep(.10, .155, lat) * RG.sstep(1.07, 1.16, P[:, 2])
    torso = {k: v * (1 - sh_own) for k, v in sp.items()}
    hipzone = RG.sstep(.73, .82, P[:, 2])
    W = RG.combine((is_('shirt'), torso), (is_('shirt') * sh_own, arm_side), (is_('shirt.sleeve'), arm_side),
                   (is_('skin.arm'), arm_side), (is_('skin.hand', 'nails'), hand_side),
                   (is_('shorts') * (1 - hipzone), leg_side), (is_('shorts') * hipzone, sp),
                   (is_('skin.leg', 'sock', 'shoe', 'sole'), leg_side))
    return RG.finalize(W, n)


def make_clips(arm_ob, G):
    """dribble (one bounce, normalized to 1 s), shoot (1.4 s, release at 0.35 s), catch (1.3 s), hold (2 s loop), idle"""
    P = BJ.Poser(arm_ob)
    pb = arm_ob.pose.bones
    for b in pb:
        b.rotation_mode = 'QUATERNION'
    J = CB.J
    L = lambda a, b: (Vector(J[a]) - Vector(J[b])).length
    l_th, l_sh, l_up, l_fo = L('hip', 'knee'), L('knee', 'ankle'), L('shoulder', 'elbow'), L('elbow', 'wrist')
    qa, two_bone = BJ.qa, BJ.two_bone
    arm_ob.animation_data_create()
    clips = {}
    hips0 = Vector(J['hips'])
    FPS = BJ.FPS

    def key(name, n, f, loop=True):
        act = bpy.data.actions.new(name)
        arm_ob.animation_data.action = act
        for i in range(n):
            spec = f(i / (n - 1), P)
            basis = P.solve(spec)
            for bn in P.order:
                q, l = basis[bn]
                pb[bn].rotation_quaternion = q
                pb[bn].location = l
                if bn in spec or bn in BJ.POSED_ALWAYS:
                    pb[bn].keyframe_insert('rotation_quaternion', frame=i, group=bn)
                if bn == 'hips':
                    pb[bn].keyframe_insert('location', frame=i, group=bn)
        act.use_fake_user = True
        tr = arm_ob.animation_data.nla_tracks.new()
        tr.name = name
        st = tr.strips.new(name, 0, act)
        tr.mute = True
        arm_ob.animation_data.action = None
        clips[name] = dict(frames=n, seconds=(n - 1) / FPS, loop=loop)

    def body(spec, crouch=0., lean=0., twist=0., hop=0., head_pitch=0., side=0.):
        spec['hips'] = dict(loc=hips0 + Vector((side, 0, -crouch + hop)), wrot=qa((1, 0, 0), -lean * .35) @ qa((0, 0, 1), twist * .3))
        spec['spine_01'] = dict(wrot=qa((1, 0, 0), -lean * .25))
        spec['spine_02'] = dict(wrot=qa((1, 0, 0), -lean * .25) @ qa((0, 0, 1), twist * .3))
        spec['chest'] = dict(wrot=qa((1, 0, 0), -lean * .15) @ qa((0, 0, 1), twist * .4))
        spec['neck'] = dict(wrot=qa((1, 0, 0), head_pitch * .4 + lean * .25))
        spec['head'] = dict(wrot=qa((1, 0, 0), head_pitch * .6 + lean * .3))

    def legs(spec, hop=0., stance=.0):
        P.solve(spec)
        for side, s in ((1, 'l'), (-1, 'r')):
            hj = P.joint('thigh_' + s)
            a = Vector(J['ankle']) * Vector((side, 1, 1)) + Vector((side * stance, -.04 if side < 0 else .03, hop))
            k, a2 = two_bone(hj, a, l_th, l_sh, Vector((side * .25, -1, 0)))
            spec['thigh_' + s] = dict(aim=k, pole=Vector((0, 1, 0)))
            spec['calf_' + s] = dict(aim=a2)
            ball = Vector(J['ball']) * Vector((side, 1, 1)) + Vector((side * stance, -.04 if side < 0 else .03, max(0, hop * .6)))
            spec['foot_' + s] = dict(aim=ball if hop < .02 else a2 + (ball - a2) + Vector((0, 0, -hop * .3)))
            spec['toe_' + s] = dict(aim=Vector(J['toe']) * Vector((side, 1, 1)) + Vector((side * stance, -.04 if side < 0 else .03, max(0, hop * .5))))

    def arm(spec, side, wr, el_hint):
        s = 'l' if side > 0 else 'r'
        P.solve(spec)
        sh = P.joint('upperarm_' + s)
        el, _ = two_bone(sh, wr, l_up, l_fo, el_hint)
        spec['upperarm_' + s] = dict(aim=el, pole=Vector((side * .3, 1, 0)))
        spec['lowerarm_' + s] = dict(aim=wr, pole=Vector((side * .2, 1, .2)))

    # kid-local (game) positions of the ball (ambient.js kidToWorld): x right, y up, z forward(-); in Blender: right is
    # -x, forward is -y, up is z
    def G2B(x, y, z):
        return Vector((-x, z, y))

    # ---- dribble: one bounce (normalized; the runtime samples it at the controller's own phase u = (t % 0.52) / 0.52)
    def dribble(u, P):
        spec = {}
        by = .9 - (.9 - .12) * (u * 2) ** 2 if u < .5 else .12 + .78 * (1 - (1 - (u - .5) * 2) ** 2)
        hy = max(by + .10, .90 - .12 * math.sin(math.pi * u))
        bob = .012 * math.cos(2 * math.pi * u)
        body(spec, crouch=.07 + bob, lean=16, twist=-6, head_pitch=-8, side=.01)
        legs(spec, stance=.05)
        hand = G2B(.30, hy + .02, -.34) + Vector((0, 0, 0))
        arm(spec, -1, hand, Vector((-1, .5, 0)))
        spec['hand_r'] = dict(post=qa((1, 0, 0), -30 + 25 * math.sin(math.pi * u)))
        arm(spec, 1, G2B(-.22, .80, -.20), Vector((1, .6, 0)))
        return spec
    key('dribble', 31, dribble)

    # ---- shoot: 1.4 s; dip, rise with the ball to the set point, release at 0.35 s with the wrist's flick, a small hop,
    # the follow-through held, arms down
    def shoot(t01, P):
        t = t01 * 1.4
        spec = {}
        up = RG.sstep(0, .35, t)
        hop = .12 * math.sin(math.pi * min(1, t / .6)) if t < .6 else 0
        dip = .06 * math.sin(math.pi * min(1, t / .18)) * (t < .18)
        body(spec, crouch=.03 + dip - hop * 0, hop=hop, lean=4 - 6 * up, head_pitch=10 * up)
        legs(spec, hop=hop * .2)
        ballp = G2B(0, .95 + .9 * up, -.30) if t < .35 else G2B(0, 1.85, -.30)
        follow = RG.sstep(.35, .50, t) * (1 - RG.sstep(.95, 1.35, t))
        for side in (-1, 1):
            off = Vector((side * .085, .03, -.07 * (1 - up)))
            wr = ballp + off + Vector((0, 0, -.02))
            if t >= .35:
                wr = G2B(0, 1.86, -.33) + Vector((side * .09, -.05 * follow, -.04 + .03 * follow)) if follow > .01 else wr
                down = RG.sstep(.95, 1.35, t)
                rest = G2B(-side * .22, .78, -.10)
                wr = wr.lerp(rest, down)
            arm(spec, side, wr, Vector((side * .9, .4, -.3)))
            s = 'l' if side > 0 else 'r'
            spec['hand_' + s] = dict(post=qa((1, 0, 0), -25 * up + 55 * follow))
        return spec
    key('shoot', 43, shoot, loop=False)

    # ---- catch: 1.3 s; watching the ball come back off the rim and bounce, ready, the catch at waist height
    def catch(t01, P):
        t = t01 * 1.3
        spec = {}
        ready = RG.sstep(.3, .9, t)
        body(spec, crouch=.03 + .03 * ready, lean=6 * ready, head_pitch=6 - 14 * RG.sstep(.2, 1.1, t))
        legs(spec, stance=.04 * ready)
        rel = t / 1.3
        ballp = G2B(.25, .95, -.30)
        for side in (-1, 1):
            low = G2B(-side * .22, .80, -.10)
            catch_p = ballp + Vector((side * .10, .02, 0))
            wr = low.lerp(G2B(-side * .16, .85, -.32), ready * .6).lerp(catch_p, RG.sstep(.80, .98, rel))
            arm(spec, side, wr, Vector((side * .9, .5, 0)))
        return spec
    key('catch', 40, catch, loop=False)

    # ---- hold: the ball at his right hip while he watches the boys ride by (2 s loop: breathing, a little sway)
    def hold(t, P):
        spec = {}
        body(spec, crouch=.005 + .003 * math.sin(2 * math.pi * t), lean=1, side=.01 * math.sin(2 * math.pi * t))
        legs(spec)
        bp = G2B(.30, .86, -.28)
        arm(spec, -1, bp + Vector((-.06, .05, .0)), Vector((-1, .5, 0)))
        arm(spec, 1, bp + Vector((.11, -.02, .02)), Vector((1, .4, 0)))
        return spec
    key('hold', 61, hold)

    def idle(t, P):
        spec = {}
        body(spec, crouch=.004 + .003 * math.sin(2 * math.pi * t), side=.006 * math.sin(2 * math.pi * t))
        legs(spec)
        for side in (-1, 1):
            arm(spec, side, G2B(-side * .21, .74, -.04), Vector((side * .5, 1, 0)))
        return spec
    key('idle', 61, idle)
    key('apose', 2, lambda t, P: {}, loop=False)
    for b in pb:
        b.rotation_quaternion = (1, 0, 0, 0)
        b.location = (0, 0, 0)
    return clips


def main():
    os.makedirs(SRC, exist_ok=True)
    G = build_geometry()
    build_textures(G)
    sc = BJ.clear()
    mats = make_materials()
    HO = G['HO']
    head_ob = BJ.mesh_object('HoopKidHead', G['head'], mats, offset=HO, recalc=False, flip=True)
    hair_ob = BJ.mesh_object('HoopKidHair', G['hair'], mats, offset=HO, recalc=True)
    body_ob = BJ.mesh_object('HoopKidBody', G['body'], mats, recalc=True)
    eye_obs = [BJ.mesh_object('HoopKidEye_' + ('l' if e['side'] > 0 else 'r'), dict(V=e['V'], F=e['F'], UV=e['UV'], M=['eye'] * len(e['F'])), mats, offset=HO, recalc=False, flip=True) for e in G['eyes']]
    BJ.CB = CB
    arm_ob, B = BJ.build_armature(G)
    arm_ob['ll_rig'] = 'rig.human.child'
    arm_ob['ll_character'] = 'the driveway basketball kid (anonymous neighbour; not Lily Henderson); spec cast.js CAST.kid'
    arm_ob.name = 'chr.hoop-kid:rig'
    # head weights: the head/neck chain (no jaw clips for him, the jaw still follows its region)
    hd = G['head']
    G['head'] = dict(hd, V=hd['V'])
    BJ.skin(head_ob, arm_ob, BJ.head_weights(G))
    BJ.skin(body_ob, arm_ob, body_weights(G))
    n = len(hair_ob.data.vertices)
    BJ.skin(hair_ob, arm_ob, (['head'], np.zeros((n, 4), int), np.tile([1., 0, 0, 0], (n, 1))))
    for eo, s in zip(eye_obs, ('l', 'r')):
        n = len(eo.data.vertices)
        BJ.skin(eo, arm_ob, (['eye_' + s], np.zeros((n, 4), int), np.tile([1., 0, 0, 0], (n, 1))))
    keys = BJ.shape_keys(head_ob, G)
    clips = make_clips(arm_ob, G)
    bpy.ops.object.select_all(action='DESELECT')
    for eo in eye_obs:
        eo.select_set(True)
    bpy.context.view_layer.objects.active = eye_obs[0]
    bpy.ops.object.join()
    eye_obs[0].name = 'HoopKidEyes'
    bpy.ops.wm.save_as_mainfile(filepath=BJ.BLEND)
    BJ.ll_export.export_glb(BJ.GLB)
    stats = dict(asset=ASSET_ID, version=BJ.VERSION, blender=bpy.app.version_string, glb_bytes=os.path.getsize(BJ.GLB),
                 triangles={ob.name: sum(len(p.vertices) - 2 for p in ob.data.polygons) for ob in (head_ob, hair_ob, body_ob, eye_obs[0])},
                 bones=len(B), shape_keys=keys, clips=clips, measurements=dict(stature_m=round(float((G['head']['V'][:G['info']['n_head']] + HO)[:, 2].max()), 3)))
    stats['triangles']['total'] = sum(stats['triangles'].values())
    json.dump(stats, open(BJ.STATS, 'w'), indent=1)
    BJ.log('kid done', stats['triangles'])


if __name__ == '__main__':
    main()
