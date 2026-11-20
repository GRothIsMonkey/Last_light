"""Last Light: the Prologue street's props (vehicles & street props benchmark, ?streetprops).

Builds assets/source/street/props/street.props.blend and dist/assets/street/street.props.glb (geometry and UVs; the
atlases of street_props_textures.py ship beside it). Every piece is modelled in the game's own local frame of the object
it replaces (x right, y up, z = the procedural object's +z), so the game places it with the procedural group's own matrix.

  pole.shaft      original: a tapered wood pole (game dimensions: 0.33 m at the ground line, 0.23 m at the top, 9.35 m
                  above ground, 0.5 m buried), wrapped in the source pole's own weathered-wood texture
  pole.arm        SLASH / RENDAR "Utility Pole (PBR)" (CC BY 4.0): the double crossarm, four pin insulators, V braces and
                  bolts, scaled so the arm is the game's 2.1 m and the insulator tops meet the game's conductors (8.93 m)
  pole.xfmr       the same source: the lower arm with two fused cutouts, the jumpers, the transformer cans and brackets
  pole.rack       original: a two-spool secondary rack for the neutral and the service drops (below the cans)
  pole.sidepin    original: a side-mounted pin insulator (corner poles, where the conductors run along the crossarm)
  pole.guard      original: the yellow guy guard and anchor eye
  lamp.*          original: a tapered steel pole, the mast arm on the game's own arm path, a die-cast cobra-head housing
                  and its HPS drop refractor (lens: a material of its own, lit by the game's lamp levels)
  mailbox.*       original: a T1 rural mailbox (door +z, flag on +x) on four mounts (white post, stained post, black
                  scroll post, brick column)
  hydrant         Spellkaze "Fire hydrant" (CC BY 4.0): scaled to 0.88 m, the pumper toward +z, repainted (textures)
  cart, can       peyman.khaleghi "Trash_cans" (CC BY 4.0): the wheeled cart (handle and wheels toward +z) and the
                  galvanized can
  hoop.*          original: garage-mounted hoops (72 x 42 in board; an older 52 x 33 in steel board) and a portable hoop
  fence.*, post.* original geometry with DmitriyGDS "Wooden Fence" (CC BY 4.0) board textures: privacy, picket, rail,
                  chain-link bays (unit length along x, sheared between posts by the game), a gate, and posts
LODs: authored pieces are rebuilt with fewer segments; source pieces are decimated.

    python3 tools/blender/streetprops/build_props.py      (Blender 5.x as the bpy module, or blender --background --python)
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import ll_export  # noqa: E402

SRC = os.path.join(ROOT, 'assets', 'source', 'street', 'third-party', 'sketchfab-originals')
TEX = os.path.join(ROOT, 'assets', 'source', 'street', 'textures')
BLEND = os.path.join(ROOT, 'assets', 'source', 'street', 'props', 'street.props.blend')
OUT = os.path.join(ROOT, 'dist', 'assets', 'street', 'street.props.glb')
STATS = os.path.join(ROOT, 'assets', 'source', 'street', 'props', 'build-stats.json')
LAY = json.load(open(os.path.join(TEX, 'props_atlas.json')))
S = 2048
K = 2.1 / 93.115          # the source pole's units -> metres (its crossarm is the game's 2.1 m arm)


def log(*a):
    print('[props]', *a, flush=True)


def G(x, y, z):
    """The game's local frame (y up, the object's +z) -> Blender (z up). glTF export maps it back."""
    return Vector((x, -z, y))


COLL = None
MATS = {}


def material(name, color=(1, 1, 1)):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (*color, 1)
    return m


def obj_from(name, verts, faces, mat='A'):
    me = bpy.data.meshes.new(name)
    me.from_pydata([G(*v) for v in verts], [], faces)
    me.validate()
    o = bpy.data.objects.new(name, me)
    COLL.objects.link(o)
    o.data.materials.append(MATS[mat])
    return o


def bm_obj(name, bm, mat='A'):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    COLL.objects.link(o)
    o.data.materials.append(MATS[mat])
    return o


def lathe(name, prof, segs, cx=0, cy=0, cz=0, axis='y', mat='A', cap=True):
    """prof: [(r, h)] along the axis; a surface of revolution in the game frame."""
    verts, faces = [], []
    n = len(prof)
    for i in range(segs):
        a = i / segs * 2 * math.pi
        for r, h in prof:
            c, s = math.cos(a) * r, math.sin(a) * r
            if axis == 'y':
                verts.append((cx + c, cy + h, cz + s))
            elif axis == 'x':
                verts.append((cx + h, cy + c, cz + s))
            else:
                verts.append((cx + c, cy + s, cz + h))
    for i in range(segs):
        j = (i + 1) % segs
        for k in range(n - 1):
            faces.append((i * n + k, i * n + k + 1, j * n + k + 1, j * n + k))
    if cap:
        for k in (0, n - 1):
            if prof[k][0] > 1e-4:
                ring = [i * n + k for i in range(segs)]
                faces.append(tuple(ring if k == n - 1 else ring[::-1]))
    o = obj_from(name, verts, faces, mat)
    return o


def box(name, c, size, mat='A', bevel=0.0, rot=None):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect='EDGES')
    if rot:
        for ax, ang in rot:
            bmesh.ops.rotate(bm, verts=bm.verts, cent=Vector(), matrix=Matrix.Rotation(ang, 3, ax))
    for v in bm.verts:
        v.co = G(v.co.x + c[0], v.co.y + c[1], v.co.z + c[2])
    return bm_obj(name, bm, mat)


def tube(name, pts, r, segs, mat='A', caps=True, r2=None):
    """A tube through game-frame points (parallel-transported rings)."""
    pts = [Vector(p) for p in pts]
    verts, faces = [], []
    t0 = (pts[1] - pts[0]).normalized()
    up = Vector((0, 1, 0)) if abs(t0.y) < .9 else Vector((1, 0, 0))
    nrm = t0.cross(up).normalized()
    n = len(pts)
    for i, p in enumerate(pts):
        t = (pts[min(n - 1, i + 1)] - pts[max(0, i - 1)]).normalized()
        nrm = (nrm - t * nrm.dot(t)).normalized()
        bi = t.cross(nrm)
        rr = r if r2 is None else r + (r2 - r) * i / (n - 1)
        for k in range(segs):
            a = k / segs * 2 * math.pi
            v = p + (nrm * math.cos(a) + bi * math.sin(a)) * rr
            verts.append(tuple(v))
    for i in range(n - 1):
        for k in range(segs):
            j = (k + 1) % segs
            faces.append((i * segs + k, i * segs + j, (i + 1) * segs + j, (i + 1) * segs + k))
    if caps:
        faces.append(tuple(range(segs))[::-1])
        faces.append(tuple((n - 1) * segs + k for k in range(segs)))
    return obj_from(name, verts, faces, mat)


# ------------------------------------------------------------------------------------------------ UVs
def _uvl(me):
    return me.uv_layers.active or me.uv_layers.new(name='UVMap')


def rect_uv(px):
    x, y, w, h = px
    return lambda u, v: ((x + u * w) / S, 1 - (y + (1 - v) * h) / S)


def remap(o, px, clamp=True):
    f = rect_uv(px)
    for l in _uvl(o.data).data:
        u, v = l.uv
        if clamp:
            u, v = min(max(u, 0), 1), min(max(v, 0), 1)
        l.uv = f(u, v)


def swatch(o, name, spread=.8, scale=2.0):
    """Box projection into one swatch's interior (noise shows; edges never bleed)."""
    x, y, w, h = LAY['swatch'][name]
    me = o.data
    uv = _uvl(me)
    for p in me.polygons:
        ax = max(range(3), key=lambda k: abs(p.normal[k]))
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            a, b = [co[k] for k in range(3) if k != ax]
            fu = .5 + spread * .5 * math.sin(a * scale * 3.1 + .3)
            fv = .5 + spread * .5 * math.sin(b * scale * 2.3 + .7)
            uv.data[li].uv = ((x + 4 + fu * (w - 8)) / S, 1 - (y + 4 + fv * (h - 8)) / S)
    return o


def planar(o, px, axis_u, axis_v, u0, u1, v0, v1):
    """Planar projection: game-frame axis_u in [u0,u1] and axis_v in [v0,v1] -> the pixel rect px."""
    x, y, w, h = px
    me = o.data
    uv = _uvl(me)
    iu, iv = 'xyz'.index(axis_u), 'xyz'.index(axis_v)
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            g = (co.x, co.z, -co.y)
            fu = (g[iu] - u0) / (u1 - u0)
            fv = (g[iv] - v0) / (v1 - v0)
            fu, fv = min(max(fu, 0), 1), min(max(fv, 0), 1)
            uv.data[li].uv = ((x + 2 + fu * (w - 4)) / S, 1 - (y + 2 + (1 - fv) * (h - 4)) / S)
    return o


# ------------------------------------------------------------------------------------------------ mesh utilities
def join(objs, name):
    objs = [o for o in objs if o]
    with bpy.context.temp_override(object=objs[0], active_object=objs[0], selected_objects=objs, selected_editable_objects=objs):
        bpy.ops.object.join()
    objs[0].name = name
    objs[0].data.name = name
    return objs[0]


def decimate(o, ratio):
    if ratio >= .999:
        return o
    m = o.modifiers.new('dec', 'DECIMATE')
    m.decimate_type = 'COLLAPSE'
    m.ratio = ratio
    m.use_collapse_triangulate = True
    with bpy.context.temp_override(object=o, active_object=o):
        bpy.ops.object.modifier_apply(modifier=m.name)
    return o


def dup(o, name):
    n = o.copy()
    n.data = o.data.copy()
    n.name = name
    COLL.objects.link(n)
    return n


def smooth(o, angle=40):
    for p in o.data.polygons:
        p.use_smooth = True
    if hasattr(o.data, 'set_sharp_from_angle'):
        o.data.set_sharp_from_angle(angle=math.radians(angle))
    return o


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def import_parts(fname):
    """Import a source GLB; return its mesh objects with transforms applied (Blender world space), hidden."""
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, fname))
    new = [o for o in bpy.context.scene.objects if o not in before]
    meshes = []
    for o in new:
        if o.type == 'MESH':
            o.data = o.data.copy()
            o.data.transform(o.matrix_world)
            o.parent = None
            o.matrix_world = Matrix()
            meshes.append(o)
    for o in new:
        if o.type != 'MESH':
            bpy.data.objects.remove(o)
    for o in meshes:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        COLL.objects.link(o)
        o.data.materials.clear()
        o.data.materials.append(MATS['A'])      # (every source part goes onto the props atlas)
        for p in o.data.polygons:
            p.material_index = 0
    return meshes


def split_loose(o):
    """-> list of (bmesh face index sets) components with their world bbox."""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bm.faces.ensure_lookup_table()
    seen, comps = set(), []
    for f in bm.faces:
        if f.index in seen:
            continue
        stack, comp = [f], []
        while stack:
            x = stack.pop()
            if x.index in seen:
                continue
            seen.add(x.index)
            comp.append(x.index)
            for e in x.edges:
                for g2 in e.link_faces:
                    if g2.index not in seen:
                        stack.append(g2)
        vs = {v.co.copy().freeze() for i in comp for v in bm.faces[i].verts}
        mn = Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
        mx = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
        comps.append((set(comp), mn, mx))
    bm.free()
    return comps


def extract(o, faces, name):
    """A new object holding only the given faces of o."""
    n = dup(o, name)
    bm = bmesh.new()
    bm.from_mesh(n.data)
    bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.index not in faces], context='FACES')
    bm.to_mesh(n.data)
    bm.free()
    return n


def xform(o, M):
    o.data.transform(M)
    return o


# ------------------------------------------------------------------------------------------------ the pieces
def build_pole():
    out = {}
    src = import_parts('utility_pole_pbr.glb')[0]
    comps = split_loose(src)
    shaft = max(comps, key=lambda c: c[2].z - c[1].z)
    arm, xf = set(), set()
    for faces, mn, mx in comps:
        cz, cx, cy = (mn.z + mx.z) / 2, (mn.x + mx.x) / 2, (mn.y + mx.y) / 2
        if faces is shaft[0]:
            continue
        if cz > 445 and abs(cx) < 6:          # the source's own pole-top cap (the shaft below has its own top)
            continue
        if len(faces) == 108:                 # jumpers from the primaries down to the cutouts
            xf |= faces
        elif cz >= 405:
            arm |= faces
        else:
            xf |= faces
    # source (x, y, z) -> game: x, y = 8.75 + (z - 431.684) K, z = -(y + 300) K
    M = Matrix(((K, 0, 0, 0), (0, K, 0, 300 * K), (0, 0, K, (8.75 - 431.684 * K)), (0, 0, 0, 1)))
    # (in Blender coordinates: game z = -Blender y, so Blender y' = (y + 300) K; z' = 8.75 + (z - 431.684) K)
    a = xform(extract(src, arm, 'pole.arm'), M)
    x = xform(extract(src, xf, 'pole.xfmr'), M)
    for o in (a, x):
        remap(o, LAY['tiles']['pole'])
    # the source shaft's texture strip: u 0..0.279, v along the height (which way: measured)
    me = src.data
    uvl = me.uv_layers.active.data
    zs, vs = [], []
    for p in me.polygons:
        if p.index in shaft[0]:
            for li in p.loop_indices:
                zs.append(me.vertices[me.loops[li].vertex_index].co.z)
                vs.append(uvl[li].uv[1])
    zlo = min(zs)
    v_at_bottom = sum(v for z, v in zip(zs, vs) if z < zlo + 5) / max(1, sum(1 for z in zs if z < zlo + 5))
    flip = v_at_bottom > .5
    bpy.data.objects.remove(src)
    px = LAY['tiles']['pole']
    for q, segs in ((0, 14), (1, 8), (2, 5)):
        ys = [-.5, 0, .3, 1.6, 3.5, 6, 8.2, 9.35] if q == 0 else [-.5, 0, 4.5, 9.35] if q == 1 else [-.5, 9.35]
        verts, faces, uvs = [], [], []
        for i, yy in enumerate(ys):
            r = .165 - (yy + .5) / 9.85 * .05
            for k in range(segs + 1):
                ang = k / segs * 2 * math.pi
                verts.append((math.cos(ang) * r, yy, math.sin(ang) * r))
                v = (yy + .5) / 9.85
                uvs.append((k / segs * .279, 1 - v if flip else v))
        n = segs + 1
        for i in range(len(ys) - 1):
            for k in range(segs):
                faces.append((i * n + k, (i + 1) * n + k, (i + 1) * n + k + 1, i * n + k + 1))
        top = len(verts)
        verts.append((0, 9.38, 0))
        uvs.append((.14, (0.02 if flip else .98)))
        last = (len(ys) - 1) * n
        for k in range(segs):
            faces.append((last + k, top, last + k + 1))
        o = obj_from(f'pole.shaft.lod{q}', verts, faces)
        uv = _uvl(o.data)
        f = rect_uv(px)
        for p in o.data.polygons:
            for li in p.loop_indices:
                uv.data[li].uv = f(*uvs[o.data.loops[li].vertex_index])
        parts = [smooth(o, 50)]
        if q == 0:   # ground-wire moulding up the back, the pole tag, a few step-bolt holes' worth of hardware
            m = box('pole.mould', (0, 3.6, -.155), (.035, 7.2, .02), bevel=.006)
            swatch(m, 'galvanized_dull')
            t = box('pole.tag', (.0, 1.75, .158), (.07, .09, .006))
            swatch(t, 'tag_aluminum')
            parts += [m, t]
        out[f'pole.shaft.lod{q}'] = join(parts, f'pole.shaft.lod{q}')
    for q, r in ((0, 1), (1, .45), (2, .12)):
        out[f'pole.arm.lod{q}'] = decimate(dup(a, f'pole.arm.lod{q}'), r)
        out[f'pole.xfmr.lod{q}'] = decimate(dup(x, f'pole.xfmr.lod{q}'), r if q < 2 else .15)
    bpy.data.objects.remove(a)
    bpy.data.objects.remove(x)
    # secondary rack: two spools on a galvanized bracket, street side (+x), below the transformers
    for q, segs in ((0, 12), (1, 6)):
        br = box('rack.br', (.137, 6.71, 0), (.02, .34, .05))
        swatch(br, 'galvanized_dull')
        parts = [br]
        for yy in (6.80, 6.62):
            sp = lathe('rack.spool', [(.0, -.04), (.038, -.04), (.03, -.025), (.028, 0), (.03, .025), (.038, .04), (.0, .04)], segs, .19, yy, 0, axis='z')
            swatch(sp, 'porcelain')
            pin = tube('rack.pin', [(.14, yy, 0), (.235, yy, 0)], .007, 5)
            swatch(pin, 'galvanized')
            parts += [sp, pin]
        out[f'pole.rack.lod{q}'] = join(parts, f'pole.rack.lod{q}')
    # side pin insulator (corner poles): a steel bracket to a pin insulator 0.16 m off the pole (+z); mirrored by the game
    for q, segs in ((0, 12), (1, 6)):
        # (origin: the conductor's tie point on top of the insulator, 0.16 m off the pole axis)
        br = box('sp.br', (0, -.105, .135), (.04, .03, .07))
        swatch(br, 'galvanized_dull')
        ins = lathe('sp.ins', [(0, -.02), (.02, -.02), (.05, .0), (.05, .02), (.035, .04), (.04, .06), (.028, .085), (.0, .09)], segs, 0, -.09, .16)
        swatch(ins, 'porcelain')
        out[f'pole.sidepin.lod{q}'] = join([br, ins], f'pole.sidepin.lod{q}')
    # guy guard (2.4 m, along +y; the game turns it along the guy) and the anchor eye
    g1 = lathe('guard', [(.0, 0), (.032, 0), (.032, 2.4), (0, 2.4)], 10, 0, 0, 0)
    swatch(g1, 'guard_yellow')
    eye = tube('eye', [(0, -.25, 0), (0, .05, 0)], .012, 6)
    swatch(eye, 'rust')
    out['pole.guard.lod0'] = join([g1, eye], 'pole.guard.lod0')
    return out


def build_lamp():
    """The streetlight on the game's own lamp post path (arm toward -x; lens centre at x -2.08, y 7.18)."""
    out = {}
    for q, segs, arm_n in ((0, 16, 14), (1, 8, 6), (2, 5, 3)):
        parts = []
        prof = [(0, 0), (.16, 0), (.16, .05), (.13, .09), (.115, .55), (.085, 6.4), (.072, 7.0), (.066, 7.25), (0, 7.27)]
        p = lathe('lamp.pole', prof, segs)
        swatch(p, 'pole_steel', scale=.6)
        parts.append(smooth(p, 50))
        if q < 2:
            base = lathe('lamp.base', [(0, 0), (.24, 0), (.24, .05), (.2, .09), (0, .09)], segs)   # anchor-bolt base cover
            swatch(base, 'concrete_dark')
            parts.append(base)
        # mast arm: a smooth curve through the game's arm points (0,6.7) -> (-.9,7.2) -> (-1.75,7.3) into the slipfitter
        P0, P1, P2 = Vector((0, 6.72, 0)), Vector((-.95, 7.28, 0)), Vector((-1.78, 7.3, 0))
        pts = [(1 - t) ** 2 * P0 + 2 * (1 - t) * t * P1 + t * t * P2 for t in [i / arm_n for i in range(arm_n + 1)]]
        a = tube('lamp.arm', [tuple(v) for v in pts], .03, max(5, segs // 2), r2=.026)
        swatch(a, 'pole_steel', scale=.6)
        parts.append(a)
        if q < 2:
            clamp = box('lamp.clamp', (-.03, 6.72, 0), (.07, .16, .09), bevel=.01)
            swatch(clamp, 'pole_steel')
            parts.append(clamp)
        # cobra head: lofted sections from the slipfitter (x -1.72) to the nose (x -2.46)
        rows, cols = (18, 14) if q == 0 else (8, 8) if q == 1 else (4, 5)
        verts, faces = [], []
        for i in range(rows + 1):
            t = i / rows
            x = -1.72 - t * .74
            w = .055 + .12 * math.sin(min(1, t / .7) * math.pi / 2) ** 1.4 - (.05 * ((t - .8) / .2) ** 2 if t > .8 else 0)
            hh = .085 + .055 * math.sin(min(1, t / .55) * math.pi / 2) - (.07 * ((t - .82) / .18) ** 2 if t > .82 else 0)
            for k in range(cols + 1):
                s = k / cols * math.pi          # 0..pi: over the top from +z to -z
                verts.append((x, 7.205 + max(0.0, hh) * math.sin(s) ** .7, w * math.cos(s)))
        n = cols + 1
        for i in range(rows):
            for k in range(cols):
                faces.append((i * n + k, i * n + k + 1, (i + 1) * n + k + 1, (i + 1) * n + k))
        # flat underside (the door frame) and the closed ends
        bot = len(verts)
        for i in range(rows + 1):
            verts.append(verts[i * n][:1] + (7.205, verts[i * n][2]))
            verts.append(verts[i * n + cols][:1] + (7.205, verts[i * n + cols][2]))
        for i in range(rows):
            a0, a1, b0, b1 = bot + 2 * i, bot + 2 * i + 1, bot + 2 * i + 2, bot + 2 * i + 3
            faces.append((a0, b0, b1, a1))
        faces.append(tuple(range(rows * n, rows * n + n)))
        hd = obj_from('lamp.head', verts, faces)
        swatch(hd, 'lamp_housing', scale=1.5)
        parts.append(smooth(hd, 55))
        if q < 2:
            pc = lathe('lamp.photocell', [(0, 0), (.04, 0), (.04, .045), (.03, .06), (0, .062)], 8, -1.92, 7.33, 0)
            swatch(pc, 'photocell')
            parts.append(pc)
        out[f'lamp.lod{q}'] = join(parts, f'lamp.lod{q}')
        # the drop refractor: a shallow prismatic bowl under the door (its own material: lit by the lamp level)
        rr, rc = (10, 16) if q == 0 else (5, 8) if q == 1 else (3, 5)
        verts, faces = [], []
        for i in range(rr + 1):
            ph = i / rr * math.pi / 2
            for k in range(rc):
                th = k / rc * 2 * math.pi
                verts.append((-2.08 + .25 * math.cos(ph) * math.cos(th), 7.205 - .065 * math.sin(ph), .125 * math.cos(ph) * math.sin(th)))
        for i in range(rr):
            for k in range(rc):
                j = (k + 1) % rc
                faces.append((i * rc + k, i * rc + j, (i + 1) * rc + j, (i + 1) * rc + k))
        ln = obj_from(f'lamp.lens.lod{q}', verts, faces, mat='lens')
        planar(ln, LAY['tiles']['refractor'], 'x', 'z', -2.33, -1.83, -.13, .13)
        out[f'lamp.lens.lod{q}'] = smooth(ln, 80)
    return out


def mailbox_box(q):
    """T1 rural box: 0.17 wide, 0.21 tall, 0.48 deep; door at +z; flag on +x. Base at y 0 (the mount adds its height)."""
    segs = 10 if q == 0 else 5
    verts, faces = [], []
    prof = [(-.085, 0), (.085, 0)] + [(.085 * math.cos(a), .125 + .085 * math.sin(a)) for a in [i / segs * math.pi for i in range(segs + 1)]]
    for z in (-.23, .25):
        for x, y in prof:
            verts.append((x, y, z))
    n = len(prof)
    for k in range(n):
        j = (k + 1) % n
        faces.append((k, j, n + j, n + k))
    faces.append(tuple(range(n))[::-1])
    body = obj_from('mb.body', verts, faces)
    swatch(body, 'mailbox_paint')
    door = obj_from('mb.door', [(x * 1.02, y * 1.0 + (.0 if y > 0 else -.003), .253) for x, y in prof] + [(x * 1.02, y, .262) for x, y in prof],
                    [tuple(range(len(prof), 2 * len(prof)))] + [(k, (k + 1) % len(prof), len(prof) + (k + 1) % len(prof), len(prof) + k) for k in range(len(prof))])
    swatch(door, 'mailbox_paint')
    parts = [smooth(body, 40), door]
    latch = box('mb.latch', (0, .2, .27), (.03, .025, .02))
    swatch(latch, 'galvanized')
    parts.append(latch)
    flag_arm = box('mb.flagarm', (.093, .15, -.06), (.008, .025, .17))
    swatch(flag_arm, 'flag_red')
    flag = box('mb.flag', (.093, .19, -.15), (.008, .085, .07))
    swatch(flag, 'flag_red')
    parts += [flag_arm, flag]
    if q == 0:
        piv = lathe('mb.pivot', [(0, -.006), (.012, -.006), (.012, .006), (0, .006)], 8, .09, .15, .03, axis='x')
        swatch(piv, 'galvanized')
        parts.append(piv)
    return parts


def build_mailboxes():
    out = {}
    BOX_Y = 1.13
    for q in (0, 1):
        def boxed(parts):
            bx = mailbox_box(q)
            for o in bx:
                xform(o, Matrix.Translation(G(0, BOX_Y, .02)))
            return parts + bx
        # white 4x4 post with a support board
        p = box('mb.post', (0, .56, 0), (.09, 1.12 + .3, .09), bevel=.006)
        xform(p, Matrix.Translation(G(0, -.15, 0)))
        swatch(p, 'white_paint')
        a = box('mb.arm', (0, 1.105, .0), (.14, .05, .44), bevel=.005)
        swatch(a, 'white_paint')
        br = box('mb.brace', (0, .96, -.12), (.05, .05, .28), rot=[('X', math.radians(45))])
        swatch(br, 'white_paint')
        out[f'mailbox.white.lod{q}'] = join(boxed([p, a, br]), f'mailbox.white.lod{q}')
        # stained 4x4 post
        p = box('mb.post', (0, .41, 0), (.09, 1.42, .09), bevel=.006)
        planar(p, plank('wood', 0, 30), 'x', 'y', -.05, .05, -.3, 1.2)
        a = box('mb.arm', (0, 1.105, .0), (.14, .05, .44), bevel=.005)
        planar(a, plank('wood', 4, 40), 'x', 'z', -.1, .1, -.25, .25)
        num = box('mb.num', (.047, .82, 0), (.004, .07, .2))
        planar(num, LAY['tiles']['numbers'], 'z', 'y', -.1, .1 + .3, .78, .86)
        out[f'mailbox.wood.lod{q}'] = join(boxed([p, a, num]), f'mailbox.wood.lod{q}')
        # black decorative post with a scroll bracket and a finial
        p = box('mb.post', (0, .41, 0), (.075, 1.42, .075), bevel=.004)
        swatch(p, 'iron_black')
        a = box('mb.arm', (0, 1.1, .0), (.06, .04, .46), bevel=.004)
        swatch(a, 'iron_black')
        scroll = []
        for s in (-1, 1):
            pts = [(0, .86 + .2 * (1 - math.cos(t)) * .5 + .05 * math.sin(2 * t), s * (.04 + .16 * math.sin(t))) for t in [i / 8 * math.pi * .55 for i in range(9)]]
            sc = tube('mb.scroll', pts, .009, 5)
            swatch(sc, 'iron_black')
            scroll.append(sc)
        collar = lathe('mb.collar', [(0, 0), (.06, 0), (.06, .03), (.045, .05), (0, .05)], 8, 0, .02, 0)
        swatch(collar, 'iron_black')
        plate = box('mb.plate', (0, .7, .04), (.18, .07, .006))
        planar(plate, LAY['tiles']['numbers'], 'x', 'y', -.09, .41, .665, .735)
        out[f'mailbox.deco.lod{q}'] = join(boxed([p, a, collar, plate] + scroll), f'mailbox.deco.lod{q}')
        # brick column (the procedural one's size), concrete cap, an inset mailbox door and the house number
        bx = box('mb.col', (0, .66, 0), (.56, 1.32, .56), bevel=.004)
        me = bx.data
        uv = _uvl(me)
        tx, ty, tw, th = LAY['tiles']['brick']
        for pgn in me.polygons:
            ax = max(range(3), key=lambda k: abs(pgn.normal[k]))
            for li in pgn.loop_indices:
                co = me.vertices[me.loops[li].vertex_index].co
                gco = (co.x, co.z, -co.y)
                a_, b_ = (gco[2], gco[1]) if ax == 0 else (gco[0], gco[1]) if ax == 1 else (gco[0], gco[1])
                fu, fv = (a_ + .3) / .81, (b_ % .405) / .405 if b_ < 1.3 else .99
                uv.data[li].uv = ((tx + 2 + min(max(fu, 0), 1) * (tw - 4)) / S, 1 - (ty + 2 + (1 - min(max(fv, 0), 1)) * (th - 4)) / S)
        cap = box('mb.cap', (0, 1.36, 0), (.64, .08, .64), bevel=.01)
        swatch(cap, 'concrete')
        dr = box('mb.door', (0, 1.02, .283), (.3, .22, .012), bevel=.004)
        swatch(dr, 'powder_black')
        hd = box('mb.handle', (0, 1.08, .292), (.06, .015, .01))
        swatch(hd, 'brass')
        num = box('mb.num', (0, .72, .283), (.22, .07, .006))
        planar(num, LAY['tiles']['numbers'], 'x', 'y', -.11, .39, .685, .755)
        out[f'mailbox.brick.lod{q}'] = join([bx, cap, dr, hd, num], f'mailbox.brick.lod{q}')
    return out


def build_hydrant():
    out = {}
    o = import_parts('fire_hydrant.glb')[0]
    zs = [v.co.z for v in o.data.vertices]
    s = .88 / (max(zs) - min(zs))
    xform(o, Matrix.Scale(s, 4) @ Matrix.Translation(Vector((0, 0, -min(zs)))))   # pumper already toward Blender -Y (game +z)
    remap(o, LAY['tiles']['hydrant'])
    for q, r in ((0, 1), (1, .4), (2, .12)):
        out[f'hydrant.lod{q}'] = decimate(dup(o, f'hydrant.lod{q}'), r)
    bpy.data.objects.remove(o)
    return out


def build_bins():
    out = {}
    objs = import_parts('trash_cans.glb')
    cart = next(o for o in objs if len(o.data.polygons) < 5500 and len(o.data.polygons) > 4500)
    cans = next(o for o in objs if 4000 < len(o.data.polygons) < 4500)
    # cart: the axle line (the wheels' parts) gives the handle side; turn it to +z (Blender -Y), centre it, 1.0 m tall
    comps = split_loose(cart)
    wheels = [((mn + mx) / 2) for f, mn, mx in comps if (mx.z - mn.z) > 10 and (mx.z - mn.z) < 18 and mn.z < 2]
    body = max(comps, key=lambda c: len(c[0]))
    allv = [v.co for v in cart.data.vertices]
    ctr = Vector((sum(v.x for v in allv) / len(allv), sum(v.y for v in allv) / len(allv), 0))
    wc = sum(wheels, Vector()) / max(1, len(wheels))
    hdir = (wc - ctr)
    hdir.z = 0
    hdir.normalize()
    ang = math.atan2(-1, 0) - math.atan2(hdir.y, hdir.x)
    zmin = min(v.z for v in allv)
    zmax = max(v.z for v in allv)
    sc = 1.0 / (zmax - zmin)
    xform(cart, Matrix.Scale(sc, 4) @ Matrix.Rotation(ang, 4, 'Z') @ Matrix.Translation(Vector((-ctr.x, -ctr.y, -zmin))))
    vs = [v.co for v in cart.data.vertices]
    cx, cy = (min(v.x for v in vs) + max(v.x for v in vs)) / 2, (min(v.y for v in vs) + max(v.y for v in vs)) / 2
    xform(cart, Matrix.Translation(Vector((-cx, -cy, 0))))
    remap(cart, LAY['tiles']['cart'])
    # galvanized can: the upright one with its lid (the parts round it), 0.66 m to the lid's top
    comps = split_loose(cans)
    can_body = [c for c in comps if len(c[0]) == 118]
    pick = min(can_body, key=lambda c: (c[1] + c[2]).x)
    pc = (pick[1] + pick[2]) / 2
    keep = set()
    for f, mn, mx in comps:
        c = (mn + mx) / 2
        if math.hypot(c.x - pc.x, c.y - pc.y) < 30 and mn.z > -1:
            keep |= f
    can = extract(cans, keep, 'can')
    vs = [v.co for v in can.data.vertices]
    zmin, zmax = min(v.z for v in vs), max(v.z for v in vs)
    sc = .68 / (zmax - zmin)
    xform(can, Matrix.Scale(sc, 4) @ Matrix.Translation(Vector((-pc.x, -pc.y, -zmin))))
    remap(can, LAY['tiles']['can'])
    for o in objs:
        if o is not cart:
            bpy.data.objects.remove(o)
    for q, r in ((0, 1), (1, .35), (2, .1)):
        out[f'cart.lod{q}'] = decimate(dup(cart, f'cart.lod{q}'), r)
        out[f'can.lod{q}'] = decimate(dup(can, f'can.lod{q}'), r)
    bpy.data.objects.remove(cart)
    bpy.data.objects.remove(can)
    return out


def hoop_parts(q, bw, bh, rim_dy, rim_dz, old=False):
    """A backboard (centre at the origin, face +z), its rim (at (0, rim_dy, rim_dz)), the rim's bracket and a net."""
    segs = 18 if q == 0 else 8
    parts = []
    b = box('hoop.board', (0, 0, 0), (bw, bh, .035), bevel=.012)
    me = b.data
    uv = _uvl(me)
    tx, ty, tw, th = LAY['tiles']['backboard']
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            fu, fv = (co.x / bw) + .5, (co.z / bh) + .5
            if p.normal.y < -.5:                              # (Blender -Y is the game's +z: the face; edges and back plain)
                uv.data[li].uv = ((tx + 2 + min(max(fu, 0), 1) * (tw - 4)) / S, 1 - (ty + 2 + (1 - min(max(fv, 0), 1)) * (th - 4)) / S)
            else:
                uv.data[li].uv = ((tx + 6) / S, 1 - (ty + 6) / S)
    parts.append(b)
    if old:
        frame = box('hoop.frame', (0, 0, -.03), (bw * .9, bh * .85, .03))
        swatch(frame, 'rust')
        parts.append(frame)
    # rim: a torus of 0.225 m (18 in) with a 16 mm rod
    R, r = .2286, .009
    verts, faces = [], []
    rs = 6 if q == 0 else 4
    for i in range(segs * 2):
        a = i / (segs * 2) * 2 * math.pi
        for k in range(rs):
            b2 = k / rs * 2 * math.pi
            verts.append(((R + r * math.cos(b2)) * math.cos(a), rim_dy + r * math.sin(b2), rim_dz + (R + r * math.cos(b2)) * math.sin(a) - 0))
    for i in range(segs * 2):
        for k in range(rs):
            faces.append((i * rs + k, ((i + 1) % (segs * 2)) * rs + k, ((i + 1) % (segs * 2)) * rs + (k + 1) % rs, i * rs + (k + 1) % rs))
    rim = obj_from('hoop.rim', verts, faces)
    swatch(rim, 'rim_orange' if not old else 'rust')
    parts.append(rim)
    brk = box('hoop.brk', (0, rim_dy - .02, (rim_dz - R + .02) / 2 + .01), (.12, .06, rim_dz - R + .02))
    swatch(brk, 'rim_orange' if not old else 'rust')
    parts.append(brk)
    if q == 0 or not old:
        nv, nf = [], []
        ring = 12
        for i, (rr, yy) in enumerate([(R, 0), (R * .82, -.16), (R * .62, -.38)]):
            for k in range(ring + 1):
                a = k / ring * 2 * math.pi
                nv.append((rr * math.cos(a), rim_dy + yy, rim_dz + rr * math.sin(a)))
        for i in range(2):
            for k in range(ring):
                n_ = ring + 1
                nf.append((i * n_ + k, i * n_ + k + 1, (i + 1) * n_ + k + 1, (i + 1) * n_ + k))
        net = obj_from('hoop.net', nv, nf, mat='cut')
        cx, cy, cw, ch = LAY['cutout']['net']
        uv = _uvl(net.data)
        for p in net.data.polygons:
            for li in p.loop_indices:
                vi = net.data.loops[li].vertex_index
                k, i = vi % (ring + 1), vi // (ring + 1)
                uv.data[li].uv = ((cx + k / ring * cw) / 512, 1 - (cy + i / 2 * ch) / 512)
        parts.append(net)
    return parts


def build_hoops():
    out = {}
    for q in (0, 1):
        # the game's garage hoop: 1.7 x 1.0 board at (0,0,0); rim 0.23 below the board centre, 0.30 out
        ps = hoop_parts(q, 1.83, 1.07, -.23, .30)
        for s in (-1, 1):
            st = box('hoop.strut', (s * .35, -.05, -.16), (.04, .04, .3))
            swatch(st, 'galvanized_dull')
            ps.append(st)
        out[f'hoop.garage.lod{q}'] = join(ps, f'hoop.garage.lod{q}')
        # the older steel board (1.32 x 0.83) on its bracket
        ps = hoop_parts(q, 1.32, .84, -.27, .23, old=True)
        for s in (-1, 1):
            st = box('hoop.strut', (s * .32, -.0, -.12), (.05, .05, .22))
            swatch(st, 'rust')
            ps.append(st)
        out[f'hoop.old.lod{q}'] = join(ps, f'hoop.old.lod{q}')
        # portable: fillable base (back -z), a three-section pole, extension arms, a 54 in board at (0, 3.25, 0)
        base = box('pt.base', (0, .16, -.5), (.72, .3, 1.05), bevel=.06)
        swatch(base, 'base_plastic')
        ps = [base]
        for s in (-1, 1):
            w = lathe('pt.wheel', [(0, -.03), (.075, -.03), (.075, .03), (0, .03)], 10, s * .38, .075, -.95, axis='x')
            swatch(w, 'rubber')
            ps.append(w)
        pole = tube('pt.pole', [(0, .28, -.42), (0, 1.4, -.37), (0, 2.6, -.3), (0, 3.2, -.27)], .045, 10 if q == 0 else 6, r2=.04)
        swatch(pole, 'powder_black')
        ps.append(pole)
        for yy in (2.95, 3.4):
            arm = tube('pt.arm', [(0, yy, -.27), (0, yy - .03, -.03)], .022, 6)
            swatch(arm, 'powder_black')
            ps.append(arm)
        ps += [o for o in hoop_parts(q, 1.37, .84, -.2, .30) if xform(o, Matrix.Translation(G(0, 3.25, 0))) is not None]
        out[f'hoop.portable.lod{q}'] = join(ps, f'hoop.portable.lod{q}')
    return out


PLANK_X = (8, 36, 64, 122, 150, 178)      # clean strips of the two planks in a 512 px wood tile (no seam, no mortise)


def plank(tile, i, w=24):
    """One board's strip of a wood tile: clear of the source's seam (x 100-120) and its mortise holes (y < 60, y > 390)."""
    tx, ty, tw, th = LAY['tiles'][tile]
    return [tx + PLANK_X[i % len(PLANK_X)], ty + 60, w, 330]


def plank_area(tile):
    tx, ty, tw, th = LAY['tiles'][tile]
    return [tx + 8, ty + 60, 200, 330]


def build_fences():
    """Bays along x in [-0.5, 0.5] (a 2.4 m bay scaled by the game to its length and sheared between its posts)."""
    out = {}
    L = 2.4
    nx = lambda x: x / L
    W = LAY['tiles']
    for q in (0, 1, 2):
        # privacy (stained) and privacy (weathered grey): dog-eared boards, two rails behind
        for name, tile in (('privacy', 'wood'), ('privacy_grey', 'wood_grey')):
            ps = []
            if q < 2:
                n = 16
                bw = L / 16
                for i in range(n):
                    x0 = -L / 2 + i * bw
                    w = bw - .004
                    hgt = 1.8 + .012 * math.sin(i * 2.7)
                    if q == 0:
                        v = [(x0, .05, .0), (x0 + w, .05, .0), (x0 + w, hgt - .05, .0), (x0 + w - .035, hgt, .0), (x0 + .035, hgt, .0), (x0, hgt - .05, .0)]
                        vb = [(a, b, -.018) for a, b, _ in v]
                        verts = v + vb
                        faces = [(0, 1, 2, 3, 4, 5), (11, 10, 9, 8, 7, 6)] + [(k, 6 + k, 6 + (k + 1) % 6, (k + 1) % 6) for k in range(6)]
                    else:      # LOD1: each board's two faces only
                        verts = [(x0, .05, 0), (x0 + w, .05, 0), (x0 + w, hgt, 0), (x0, hgt, 0), (x0, .05, -.018), (x0 + w, .05, -.018), (x0 + w, hgt, -.018), (x0, hgt, -.018)]
                        faces = [(0, 1, 2, 3), (5, 4, 7, 6)]
                    bo = obj_from('f.board', [(nx(a), b, c) for a, b, c in verts], faces)
                    planar(bo, plank(tile, i * 5 + 1), 'x', 'y', nx(x0), nx(x0 + w), .0, 1.85)
                    ps.append(bo)
                for yy in (.32, 1.45):
                    r = box('f.rail', (0, yy, -.06), (1.0, .089, .038))
                    planar(r, plank(tile, 2, 40), 'y', 'x', yy - .05, yy + .05, -.5, .5)
                    ps.append(r)
            else:
                bo = box('f.slab', (0, .925, -.01), (1.0, 1.75, .02))
                planar(bo, plank_area(tile), 'x', 'y', -.5, .5, .05, 1.8)
                ps.append(bo)
            out[f'fence.{name}.lod{q}'] = join(ps, f'fence.{name}.lod{q}')
        # picket (painted white): pointed pickets, two rails
        ps = []
        if q < 2:
            n = 17 if q == 0 else 17
            for i in range(n):
                x0 = -L / 2 + .035 + i * L / n
                w = .07
                h = .98 + .01 * math.sin(i * 1.9)
                v = [(x0, .07, 0), (x0 + w, .07, 0), (x0 + w, h - .05, 0), (x0 + w / 2, h, 0), (x0, h - .05, 0)]
                verts = v + [(a, b, -.02) for a, b, _ in v]
                faces = [(0, 1, 2, 3, 4), (9, 8, 7, 6, 5)] + [(k, 5 + k, 5 + (k + 1) % 5, (k + 1) % 5) for k in range(5)]
                if q == 1:
                    verts = verts[:5] + [(a, b, -.02) for a, b, _ in v]
                po = obj_from('f.picket', [(nx(a), b, c) for a, b, c in verts], faces)
                planar(po, plank('wood_white', i * 7 + 3), 'x', 'y', nx(x0), nx(x0 + w), 0, 1.0)
                ps.append(po)
            for yy in (.3, .78):
                r = box('f.rail', (0, yy, -.045), (1.0, .07, .035))
                planar(r, plank('wood_white', 4, 40), 'y', 'x', yy - .04, yy + .04, -.5, .5)
                ps.append(r)
        else:
            bo = box('f.slab', (0, .55, -.01), (1.0, .9, .02))
            planar(bo, plank_area('wood_white'), 'x', 'y', -.5, .5, .07, 1.0)
            ps.append(bo)
        out[f'fence.picket.lod{q}'] = join(ps, f'fence.picket.lod{q}')
        # rail: two flat rails (horse-fence style) between posts
        ps = []
        for yy in (.45, .9):
            r = box('f.rail', (0, yy, 0), (1.0, .1, .04 if q < 2 else .02), bevel=.004 if q == 0 else 0)
            planar(r, plank('wood', 3, 40), 'y', 'x', yy - .05, yy + .05, -.5, .5)
            ps.append(r)
        out[f'fence.rail.lod{q}'] = join(ps, f'fence.rail.lod{q}')
        # chain link: the mesh (cut-out), top rail, bottom tension wire
        mesh = obj_from('f.chain', [(-.5, .03, 0), (.5, .03, 0), (.5, 1.2, 0), (-.5, 1.2, 0)], [(0, 1, 2, 3)], mat='cut')
        uv = _uvl(mesh.data)
        for p in mesh.data.polygons:
            for li in p.loop_indices:
                vi = mesh.data.loops[li].vertex_index
                x, y = mesh.data.vertices[vi].co.x, mesh.data.vertices[vi].co.z
                uv.data[li].uv = (10 + (x + .5) * L / .4, 1 - y / .4)   # 0.4 m tiles, u offset by 10: the cut-out shader repeats the chain tile
        ps = [mesh]
        if q < 2:
            tr = tube('f.toprail', [(-.5, 1.2, 0), (.5, 1.2, 0)], .021, 8 if q == 0 else 5, caps=False)
            swatch(tr, 'galvanized')
            ps.append(tr)
        out[f'fence.chain.lod{q}'] = join(ps, f'fence.chain.lod{q}')
        # gate (privacy): boards, a Z brace behind, two strap hinges and a latch on +x... unit length too
        ps = []
        n = 16 if q == 0 else 1
        bw = L / 16
        for i in range(n):
            x0 = -L / 2 + i * bw if q == 0 else -L / 2
            w = bw - .004 if q == 0 else L
            verts = [(x0, .07, 0), (x0 + w, .07, 0), (x0 + w, 1.78, 0), (x0, 1.78, 0), (x0, .07, -.018), (x0 + w, .07, -.018), (x0 + w, 1.78, -.018), (x0, 1.78, -.018)]
            faces = [(0, 1, 2, 3), (5, 4, 7, 6), (1, 5, 6, 2), (4, 0, 3, 7), (3, 2, 6, 7)]
            bo = obj_from('g.board', [(nx(a), b, c) for a, b, c in verts], faces)
            planar(bo, plank('wood_grey', i * 5 + 2) if q == 0 else plank_area('wood_grey'), 'x', 'y', nx(x0), nx(x0 + w), 0, 1.8)
            ps.append(bo)
        if q < 2:
            for yy in (.3, 1.5):
                r = box('g.rail', (0, yy, -.045), (1.0, .089, .038))
                swatch(r, 'wood_post')
                ps.append(r)
            # the Z brace: a strip from low hinge side to high latch side, built on its end points (it stays a brace
            # with vertical ends when the game stretches the bay)
            x0, y0, x1, y1, hw = -.42, .36, .42, 1.42, .045
            zv = [(x0, y0 - hw, -.04), (x1, y1 - hw, -.04), (x1, y1 + hw, -.04), (x0, y0 + hw, -.04)]
            zv += [(a, b, -.078) for a, b, _ in zv]
            zb = obj_from('g.diag', zv, [(0, 1, 2, 3), (5, 4, 7, 6), (1, 5, 6, 2), (4, 0, 3, 7), (3, 2, 6, 7), (0, 4, 5, 1)])
            swatch(zb, 'wood_post')
            ps.append(zb)
            for yy in (.35, 1.45):
                h = box('g.hinge', (-.38, yy, .01), (.24, .03, .006))
                swatch(h, 'iron_black')
                ps.append(h)
            la = box('g.latch', (.45, 1.1, .012), (.04, .12, .012))
            swatch(la, 'iron_black')
            ps.append(la)
        out[f'fence.gate.lod{q}'] = join(ps, f'fence.gate.lod{q}')
        # posts (height 1.0: the game scales y to the run's post height)
        segs = 12 if q == 0 else 6
        p = box('post.wood', (0, .5, 0), (.09, 1.0, .09), bevel=.006 if q == 0 else 0)
        planar(p, plank('wood', 1, 30), 'x', 'y', -.05, .05, -.3, 1.0)
        out[f'post.wood.lod{q}'] = p
        p = box('post.white', (0, .5, 0), (.09, 1.0, .09), bevel=.004 if q == 0 else 0)
        swatch(p, 'white_paint')
        cap = obj_from('post.cap', [(-.05, 1.0, -.05), (.05, 1.0, -.05), (.05, 1.0, .05), (-.05, 1.0, .05), (0, 1.05, 0)], [(0, 1, 4), (1, 2, 4), (2, 3, 4), (3, 0, 4)])
        swatch(cap, 'white_paint')
        out[f'post.white.lod{q}'] = join([p, cap], f'post.white.lod{q}')
        if q < 2:
            p = lathe('post.chain', [(0, 0), (.03, 0), (.03, 1.0), (.034, 1.01), (.034, 1.03), (0, 1.05)], segs)
        else:
            p = box('post.chain', (0, .52, 0), (.055, 1.05, .055))
        swatch(p, 'galvanized')
        out[f'post.chain.lod{q}'] = p
    return out


# ------------------------------------------------------------------------------------------------ main
def main():
    global COLL
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'street.props'
    sc.unit_settings.scale_length = 1.0
    COLL = bpy.data.collections.new('props')
    sc.collection.children.link(COLL)
    MATS['A'] = material('props_A')
    MATS['cut'] = material('props_cut')
    MATS['lens'] = material('props_lens', (1, .95, .85))
    pieces = {}
    for f in (build_pole, build_lamp, build_mailboxes, build_hydrant, build_bins, build_hoops, build_fences):
        got = f()
        pieces.update(got)
        log(f.__name__, {k: tris(v) for k, v in got.items()})
    root = bpy.data.objects.new('street.props', None)
    COLL.objects.link(root)
    root['ll_asset_id'] = 'street.props'
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = ('Contains CC BY 4.0 material: "Utility Pole (PBR)" by SLASH / RENDAR, "Fire hydrant" by Spellkaze, '
                          '"Trash_cans" by peyman.khaleghi, "Wooden Fence" by DmitriyGDS (Sketchfab), modified for Last Light; '
                          'the rest is original work (see docs/THIRD_PARTY_ASSETS.md)')
    attach = {'primary': [.934, 8.925], 'pairZ': .131, 'neutral': [.19, 6.80], 'drop': [.19, 6.62], 'sidepin': [0, 0, .16],
              'guyEye': 8.6, 'lens': [-2.08, 7.17], 'hoopGarage': {'board': [1.83, 1.07], 'rim': [-.23, .30]},
              'hoopOld': {'board': [1.32, .84], 'rim': [-.27, .23]}, 'mailboxY': 1.13, 'fenceRef': 2.4}
    root['sp_attach'] = json.dumps(attach)
    for k, o in pieces.items():
        o.name = k
        o.data.name = k
        o.parent = root
    # leftovers (helper objects that were joined away are gone; anything else not exported)
    for o in list(COLL.objects):
        if o is not root and o.parent is not root:
            bpy.data.objects.remove(o)
    stats = {'blender': bpy.app.version_string, 'pieces': {k: tris(o) for k, o in sorted(pieces.items())}, 'attach': attach}
    os.makedirs(os.path.dirname(BLEND), exist_ok=True)
    img = {}
    for n, f in (('A', 'props_albedo.jpg'), ('cut', 'props_cutout.png')):
        im = bpy.data.images.load(os.path.join(TEX, f), check_existing=True)
        m = MATS[n]
        tn = m.node_tree.nodes.new('ShaderNodeTexImage')
        tn.image = im
        m.node_tree.links.new(tn.outputs['Color'], m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
        img[n] = tn
    # the .blend keeps the built pieces with the atlases as files; the imported sources' own images and materials are
    # not kept (the original GLBs are in the repository and this script rebuilds everything from them)
    ours = {MATS['A'], MATS['cut'], MATS['lens']}
    for m in list(bpy.data.materials):
        if m not in ours:
            bpy.data.materials.remove(m)
    keep = {tn.image for tn in img.values()}
    for im in list(bpy.data.images):
        if im not in keep:
            bpy.data.images.remove(im)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND, relative_remap=True, compress=True)
    for n, tn in img.items():          # the GLB carries geometry only (the game builds its materials from the atlases)
        MATS[n].node_tree.nodes.remove(tn)
    # no exported tangents: several planar-mapped faces (post sides, board edges) have UVs constant in one direction, and
    # their MikkTSpace tangents degenerate (black in the game); three.js then derives tangents per pixel, safely
    ll_export.export_glb(OUT, export_materials='EXPORT', export_tangents=False)
    stats['glb_bytes'] = os.path.getsize(OUT)
    json.dump(stats, open(STATS, 'w'), indent=1)
    log('wrote', OUT, stats['glb_bytes'], 'bytes')


if __name__ == '__main__':
    main()
