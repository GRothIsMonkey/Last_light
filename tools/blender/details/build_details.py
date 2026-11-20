"""The Prologue's neighborhood-details kit for the ?details benchmark: original models, built here in Blender from code.

    python3 tools/blender/details/build_details.py           (bpy 5.1 as a module, or: blender --background --python ...)

Reads the atlases made by details_textures.py (assets/source/details/textures/) and writes
  assets/source/details/details.kit.blend      the editable source (every piece, its LODs, the atlases linked as files)
  dist/assets/details/details.kit.glb          geometry, UVs and material names only (the game builds its materials)
  assets/source/details/build-stats.json       triangles per piece, the attachment table, the contact points

Every piece is modelled in the local frame of the procedural object it stands for (x right, y up, the object's own +z),
so the game places it with the recorded group's matrix and nothing else; Blender holds it as (x, -z, y) (G()).
Materials: dt_A (the details atlas), dt_cut (cut-outs: chain link, netting, swing chain), dt_sign (sign faces),
dt_water (the kiddie pools' water). LOD0 / LOD1 / LOD2 per piece (fewer segments, then decimation).
Deterministic: no randomness beyond fixed seeds.
"""
import bpy, json, math, os, sys
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'streetprops'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import build_props as BP      # noqa: E402  (the street-props kit's mesh and UV helpers, pointed at this kit's atlas below)
import ll_export              # noqa: E402

TEX = os.path.join(ROOT, 'assets', 'source', 'details', 'textures')
BLEND = os.path.join(ROOT, 'assets', 'source', 'details', 'details.kit.blend')
OUT = os.path.join(ROOT, 'dist', 'assets', 'details', 'details.kit.glb')
STATS = os.path.join(ROOT, 'assets', 'source', 'details', 'build-stats.json')
LAY = json.load(open(os.path.join(TEX, 'details_atlas.json')))
BP.LAY = LAY
MATS = BP.MATS
S = 2048
G, box, lathe, tube, obj_from, swatch, planar, join, dup, smooth, xform, tris = (
    BP.G, BP.box, BP.lathe, BP.tube, BP.obj_from, BP.swatch, BP.planar, BP.join, BP.dup, BP.smooth, BP.xform, BP.tris)


def decimate(o, ratio):
    BP.decimate(o, ratio)
    o.data.validate(clean_customdata=False)
    o.data.update()
    return o


def log(*a):
    print('[details]', *a, flush=True)


def RY(a):           # rotation about the game's y (up) axis, as a Blender matrix
    return Matrix.Rotation(a, 4, 'Z')


def RX(a):
    return Matrix.Rotation(a, 4, 'X')


def RZ(a):           # about the game's z axis (Blender -y)
    return Matrix.Rotation(-a, 4, 'Y')


def T(x, y, z):
    return Matrix.Translation(G(x, y, z))


def rect_map(o, px, f):
    """UVs from a function of the game-frame position: f(x, y, z, normal) -> (u, v) in [0, 1] within the pixel rect px"""
    x0, y0, w, h = px
    uv = BP._uvl(o.data)
    me = o.data
    for p in me.polygons:
        nb = p.normal
        n = (nb.x, nb.z, -nb.y)
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            u, v = f(co.x, co.z, -co.y, n)
            u, v = min(max(u, 0), 1), min(max(v, 0), 1)
            uv.data[li].uv = ((x0 + 1 + u * (w - 2)) / S, 1 - (y0 + 1 + (1 - v) * (h - 2)) / S)
    return o


def tiled_quad(name, P0, U, V, w, h, tile, tw, th, mat='A', u_off=0., v_off=0.):
    """A flat quad from P0 spanned by unit vectors U (length w) and V (length h), cut at every tile boundary so a tile of
    tw x th metres repeats across it at true scale (the atlas cannot wrap)."""
    P0, U, V = Vector(P0), Vector(U), Vector(V)
    tx, ty, tW, tH = LAY['tiles'][tile] if isinstance(tile, str) else tile
    cu = [0.]
    k = math.floor(u_off / tw) + 1
    while k * tw - u_off < w - 1e-4:
        cu.append(k * tw - u_off)
        k += 1
    cu.append(w)
    cv = [0.]
    k = math.floor(v_off / th) + 1
    while k * th - v_off < h - 1e-4:
        cv.append(k * th - v_off)
        k += 1
    cv.append(h)
    verts, faces, uvs = [], [], []
    for i in range(len(cu) - 1):
        for j in range(len(cv) - 1):
            a0, a1, b0, b1 = cu[i], cu[i + 1], cv[j], cv[j + 1]
            ua = ((a0 + u_off) % tw) / tw
            ub = ua + (a1 - a0) / tw
            va = ((b0 + v_off) % th) / th
            vb = va + (b1 - b0) / th
            if ub > 1.0001:
                ua, ub = 0, (a1 - a0) / tw
            if vb > 1.0001:
                va, vb = 0, (b1 - b0) / th
            n = len(verts)
            for (a, b) in ((a0, b0), (a1, b0), (a1, b1), (a0, b1)):
                verts.append(tuple(P0 + U * a + V * b))
            for (u, v) in ((ua, va), (ub, va), (ub, vb), (ua, vb)):
                uvs.append(((tx + 1 + min(u, 1) * (tW - 2)) / S, 1 - (ty + 1 + (1 - min(v, 1)) * (tH - 2)) / S))
            faces.append((n, n + 1, n + 2, n + 3))
    o = obj_from(name, verts, faces, mat)
    uv = BP._uvl(o.data)
    for p in o.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            uv.data[li].uv = uvs[vi]
    return o


def face_dir(o, fn):
    """turn each face to agree with the desired direction fn(centre) (game frame): for the open surfaces"""
    me = o.data
    for p in me.polygons:
        c = p.center
        cg = Vector((c.x, c.z, -c.y))
        nb = p.normal
        n = Vector((nb.x, nb.z, -nb.y))
        if n.dot(Vector(fn(cg))) < 0:
            p.flip()
    me.update()
    return o


def UP(c):
    return (0, 1, 0)


def DOWN(c):
    return (0, -1, 0)


def radial(c, k=1.):
    v = Vector((c.x, 0, c.z))
    return tuple(v.normalized() * k) if v.length > 1e-6 else (0, 0, 0)


def panel(name, verts, faces, mat='A'):
    """a two-sided surface: the back faces get their own vertices (Blender's validation removes coincident faces)"""
    n = len(verts)
    return obj_from(name, list(verts) + list(verts), list(faces) + [tuple(i + n for i in reversed(f)) for f in faces], mat)


def loft(name, rings, mat='A', caps=True):
    """a surface through closed rings of equal size (each a list of game-frame points), capped at both ends"""
    m = len(rings[0])
    verts = [p for r in rings for p in r]
    faces = []
    for i in range(len(rings) - 1):
        for k in range(m):
            j = (k + 1) % m
            faces.append((i * m + k, i * m + j, (i + 1) * m + j, (i + 1) * m + k))
    if caps:
        faces.append(tuple(range(m))[::-1])
        faces.append(tuple((len(rings) - 1) * m + k for k in range(m)))
    return obj_from(name, verts, faces, mat)


def rrect(cx, cy, cz, w, h, r=.2, seg=2, plane='xy'):
    """a rounded rectangle ring (w x h, corner radius r * min(w, h)) around (cx, cy, cz) in the given plane"""
    rr = r * min(w, h)
    pts = []
    for (ax, ay, a0) in ((w / 2 - rr, h / 2 - rr, 0), (-w / 2 + rr, h / 2 - rr, 90), (-w / 2 + rr, -h / 2 + rr, 180), (w / 2 - rr, -h / 2 + rr, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            u, v = ax + rr * math.cos(a), ay + rr * math.sin(a)
            pts.append((cx + u, cy + v, cz) if plane == 'xy' else (cx + u, cy, cz + v) if plane == 'xz' else (cx, cy + v, cz + u))
    return pts


def flip_faces(o):
    for p in o.data.polygons:
        p.flip()
    return o


def plate(name, outline, thick, region, back_region=None, mirror_back=False, mat='sign'):
    """A flat sign plate: the outline (x, y) polygon extruded `thick` toward -z from z = 0; the front face mapped to the
    region (the outline's bounding box = the region), the back to back_region (mirrored for double-sided blades), the
    edges to the back region."""
    n = len(outline)
    verts = [(x, y, 0) for x, y in outline] + [(x, y, -thick) for x, y in outline]
    faces = [tuple(range(n)), tuple(range(2 * n - 1, n - 1, -1))]
    for k in range(n):
        j = (k + 1) % n
        faces.append((j, k, n + k, n + j))
    o = obj_from(name, verts, faces, mat)
    xs, ys = [p[0] for p in outline], [p[1] for p in outline]
    X0, X1, Y0, Y1 = min(xs), max(xs), min(ys), max(ys)
    reg = LAY['signs']

    def px(key):
        return reg[key] if isinstance(key, str) else key
    uv = BP._uvl(o.data)
    me = o.data
    for fi, p in enumerate(me.polygons):
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            x, y = co.x, co.z
            if fi == 0:
                r, u, v = px(region), (x - X0) / (X1 - X0), (y - Y0) / (Y1 - Y0)
            elif fi == 1:
                r = px(back_region or 'back')
                u, v = ((X1 - x) / (X1 - X0) if mirror_back else (x - X0) / (X1 - X0)), (y - Y0) / (Y1 - Y0)
            else:
                r, u, v = px('back'), .5 + .3 * (x - X0) / (X1 - X0), .5
            x0, y0, w, h = r
            uv.data[li].uv = ((x0 + .5 + u * (w - 1)) / 2048, 1 - (y0 + .5 + (1 - v) * (h - 1)) / 1024)    # the signs atlas: 2048 x 1024
    return o


def rounded(w, h, r, seg=4):
    pts = []
    for cx, cy, a0 in ((w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)):
        for k in range(seg + 1):
            a = math.radians(a0 + 90 * k / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def octagon(across, r=.02, seg=2):
    R = across / 2 / math.cos(math.pi / 8)
    pts = []
    for k in range(8):
        a = math.pi / 8 + k * math.pi / 4
        c = (R - r / math.cos(math.pi / 8)) * Vector((math.cos(a), math.sin(a)))
        for j in range(seg + 1):
            b = a - math.pi / 8 + math.pi / 4 * j / seg
            pts.append((c.x + r * math.cos(b), c.y + r * math.sin(b)))
    return pts


def diamond(side, r=.025, seg=3):
    R = side / math.sqrt(2)
    pts = []
    for a in (90, 180, 270, 0):
        c = Vector((math.cos(math.radians(a)), math.sin(math.radians(a)))) * (R - r * math.sqrt(2))
        for j in range(seg + 1):
            b = math.radians(a - 45 + 90 * j / seg)
            pts.append((c.x + r * math.cos(b), c.y + r * math.sin(b)))
    return pts


def bolt(x, y, z, axis='z', q=0):
    """a carriage bolt head with its washer, on the face +axis"""
    segs = 8 if q == 0 else 5
    if axis == 'z':
        w = lathe('bolt.w', [(0, 0), (.016, 0), (.016, .002), (0, .002)], segs, x, y, z, axis='z')
        h = lathe('bolt.h', [(0, 0), (.009, 0), (.008, .004), (.004, .006), (0, .006)], segs, x, y, z + .002, axis='z')
    else:
        w = lathe('bolt.w', [(0, 0), (.016, 0), (.016, .002), (0, .002)], segs, x, y, z, axis='x')
        h = lathe('bolt.h', [(0, 0), (.009, 0), (.008, .004), (.004, .006), (0, .006)], segs, x + .002, y, z, axis='x')
    for o in (w, h):
        swatch(o, 'galv')
    return [w, h]


# ================================================================================================== signs
POST = .0508       # 2 in square perforated galvanized post


def build_signs():
    out = {}
    for q in (0, 1):
        # the post: 3.05 m, 0.45 m of it below grade (the game lifts it so its top is where the procedural post's was)
        p = box('sp.post', (0, (2.6 - .45) / 2, 0), (POST, 3.05, POST), bevel=.003 if q == 0 else 0)
        px = LAY['tiles']['post']
        rect_map(p, px, lambda x, y, z, n: ((x if abs(n[2]) > .5 else z) / POST + .5, (y + .45) / 3.05))
        cap = box('sp.cap', (0, 2.6 + .006, 0), (POST + .006, .012, POST + .006), bevel=.002 if q == 0 else 0)
        swatch(cap, 'galv')
        out[f'sign.post.lod{q}'] = join([p, cap], f'sign.post.lod{q}')
        # the ground anchor: a 2 1/4 in sleeve standing 6 cm proud of the lawn, its corner bolt
        a = box('sp.anchor', (0, -.07, 0), (.058, .26, .058), bevel=.002 if q == 0 else 0)
        swatch(a, 'galv')
        parts = [a]
        if q == 0:
            parts += bolt(0, .03, .029, 'z')
        out[f'sign.anchor.lod{q}'] = join(parts, f'sign.anchor.lod{q}')
        # street-name blades: 1.2 x 0.19 m, 0.08 in (2 mm) aluminium, 1.5 in corners, both faces the same name
        for name in ('OAK HOLLOW DR', 'BRIARWOOD LN', 'SUMMERFIELD RD'):
            o = plate('sp.blade', rounded(1.2, .19, .038, 4 if q == 0 else 2), .002, 'blade:' + name, 'blade:' + name, mirror_back=True)
            xform(o, T(0, 0, .001))
            out[f'sign.blade.{name.replace(" ", "_")}.lod{q}'] = o
        # regulatory and warning plates: the plate's back 1 mm off the post's face, two bolts through the post
        off = POST / 2 + .002

        def mounted(key, outline, region, bolts_y):
            o = plate('sp.plate', outline, .002, region, 'back')
            xform(o, T(0, 0, off + .002))
            ps = [o]
            if q == 0:
                for by in bolts_y:
                    ps += bolt(0, by, off + .002, 'z')
            out[f'sign.{key}.lod{q}'] = join(ps, f'sign.{key}.lod{q}')
        mounted('stop', octagon(.762, .025, 2 if q == 0 else 1), 'stop', (.3, -.3))
        mounted('speed', rounded(.61, .762, .038, 3 if q == 0 else 1), 'speed', (.33, -.33))
        mounted('children', diamond(.61, .025, 3 if q == 0 else 1), 'children', (.33, -.33))
        mounted('outlet', diamond(.61, .025, 3 if q == 0 else 1), 'outlet', (.33, -.33))
        # the junctions' cross bracket (cast aluminium): a cap on the post holding the lower blade's bottom edge, a cross
        # piece between the blades, a cap on the upper blade; set screws; the blades run in its slots, nothing through them
        bp = []
        lowZ = (2.625, 2.815)      # the lower blade (along the group's z), the upper (along x)
        hi = (2.885, 3.075)
        c1 = box('br.cap', (0, 2.6075, 0), (.07, .035, .07), bevel=.004 if q == 0 else 0)
        s1 = box('br.slot', (0, lowZ[0] + .004, 0), (.022, .03, .16), bevel=.003 if q == 0 else 0)
        mid = box('br.mid', (0, (lowZ[1] + hi[0]) / 2, 0), (.05, hi[0] - lowZ[1] + .004, .05), bevel=.004 if q == 0 else 0)
        s2 = box('br.slot', (0, lowZ[1] - .004 + .012, 0), (.022, .03, .16), bevel=.003 if q == 0 else 0)
        s3 = box('br.slot', (0, hi[0] + .004 - .012, 0), (.16, .03, .022), bevel=.003 if q == 0 else 0)
        s4 = box('br.slot', (0, hi[1] - .004, 0), (.16, .03, .022), bevel=.003 if q == 0 else 0)
        bp += [c1, s1, mid, s2, s3, s4]
        for o in bp:
            swatch(o, 'alu_cast')
        if q == 0:
            for y in (lowZ[0] + .004, lowZ[1] - .002):
                bp += bolt(.012, y, 0, 'x')
            for y in (hi[0] + .002, hi[1] - .004):
                bp += bolt(0, y, .012, 'z')
        out[f'sign.bracket.lod{q}'] = join(bp, f'sign.bracket.lod{q}')
    return out


# ================================================================================================== furniture
def build_chairs():
    """lawn: a folding aluminium chair with woven webbing (the seat 0.52 wide, its front toward -z, the back at +z, as the
    procedural lawn chair); resin: a moulded white resin patio chair (the same frame; porch chairs turn it round)."""
    out = {}
    for q in (0, 1):
        segs = 8 if q == 0 else 5
        ps = []
        r = .0125
        for s in (-1, 1):
            x = s * .26
            # one bent tube: front leg up to the arm, the arm back, down to the back leg (the folding X below)
            ps.append(tube('lc.side', [(x, 0, -.24), (x, .56, -.24), (x, .6, -.2), (x, .6, .2), (x, .56, .24), (x, 0, .24)], r, segs))
            ps.append(tube('lc.back', [(x, .37, .2), (x, .95, .34)], r, segs))
            ps.append(tube('lc.x', [(x, .02, .2), (x, .37, -.2)], r * .9, segs))
            cap = box('lc.arm', (x, .615, 0), (.05, .018, .46), bevel=.005 if q == 0 else 0)
            swatch(cap, 'resin_white')
            ps.append(cap)
            for z in (-.24, .24):
                ps.append(lathe('lc.foot', [(0, 0), (.017, 0), (.016, .02), (0, .02)], 6, x, 0, z))
        ps.append(tube('lc.front', [(-.26, .37, -.22), (.26, .37, -.22)], r, segs))
        ps.append(tube('lc.rear', [(-.26, .37, .2), (.26, .37, .2)], r, segs))
        ps.append(tube('lc.top', [(-.26, .95, .34), (.26, .95, .34)], r, segs))
        for o in ps:
            if not o.name.startswith('lc.arm'):
                swatch(o, 'alu')
        # webbing: seat and back panels just inside the frame (both faces)
        web = LAY['tiles']['webbing']
        seat = panel('lc.seat', [(-.25, .365, -.21), (.25, .365, -.21), (.25, .355, .19), (-.25, .355, .19)], [(0, 1, 2, 3)])
        rect_map(seat, web, lambda x, y, z, n: (x + .25, z + .21))
        back = panel('lc.backw', [(-.25, .38, .205), (.25, .38, .205), (.25, .93, .335), (-.25, .93, .335)], [(0, 1, 2, 3)])
        rect_map(back, web, lambda x, y, z, n: (x + .25, (y - .38) * .9))
        out[f'chair.lawn.lod{q}'] = join(ps + [seat, back], f'chair.lawn.lod{q}')
        # resin chair: seat shell, slatted back with a curved top rail, arms, four flared legs
        ps = []
        seat = box('rc.seat', (0, .42, -.01), (.5, .035, .46), bevel=.015 if q == 0 else 0)
        ps.append(seat)
        rows = 6 if q == 0 else 3
        for k in range(rows):
            x = -.2 + k * .4 / (rows - 1)
            ps.append(box('rc.slat', (x, .66, .235 + .04), (.06 if q == 0 else .11, .42, .025), rot=[('X', math.radians(-12))], bevel=.008 if q == 0 else 0))
        ps.append(tube('rc.toprail', [(-.25, .86, .32), (-.1, .88, .325), (.1, .88, .325), (.25, .86, .32)], .022, segs))
        ps.append(box('rc.lowrail', (0, .47, .23), (.5, .04, .03), bevel=.008 if q == 0 else 0))
        for s in (-1, 1):
            ps.append(tube('rc.arm', [(s * .265, .62, -.2), (s * .27, .64, .05), (s * .26, .64, .22), (s * .25, .86, .32)], .02, segs))
            ps.append(tube('rc.armpost', [(s * .262, .43, -.2), (s * .265, .62, -.2)], .018, segs))
            for z, lean in ((-.21, -.04), (.21, .05)):
                ps.append(tube('rc.leg', [(s * .24, .41, z), (s * (.26 + .02), 0, z + lean)], .022, segs, r2=.017))
        for o in ps:
            swatch(o, 'resin_white')
        out[f'chair.resin.lod{q}'] = join(ps, f'chair.resin.lod{q}')
    for k in ('chair.lawn', 'chair.resin'):
        out[f'{k}.lod2'] = decimate(dup(out[f'{k}.lod1'], f'{k}.lod2'), .35)
    return out


def build_grill():
    """a 22 in kettle grill: porcelain-enamel bowl and lid, dampers, a handle, the ash pan, three legs and two wheels"""
    out = {}
    for q in (0, 1):
        segs = 20 if q == 0 else 10
        R = .29
        bowl = lathe('kg.bowl', [(0, .52), (.14, .525), (.22, .56), (.27, .62), (R, .70), (R + .008, .705)], segs, cap=False)
        bowl2 = lathe('kg.bowl.in', [(R, .70), (.27, .63), (.2, .58), (0, .56)], segs, cap=False)
        lid = lathe('kg.lid', [(R + .008, .708), (R, .74), (.27, .82), (.21, .89), (.12, .93), (0, .94)], segs, cap=False)
        face_dir(bowl, lambda c: tuple(Vector(radial(c)) + Vector((0, -1, 0))))
        face_dir(bowl2, UP)
        face_dir(lid, lambda c: (c.x, c.y - .7, c.z))
        ps = [bowl, bowl2, lid]
        for o in ps:
            swatch(o, 'enamel_black')
        hd = tube('kg.handle', [(-.1, .955, 0), (-.1, .985, 0), (.1, .985, 0), (.1, .955, 0)], .012, 6)
        swatch(hd, 'wood_post')
        damp = lathe('kg.damper', [(0, .935), (.05, .935), (.05, .942), (0, .942)], 10)
        swatch(damp, 'alu')
        ps += [hd, damp]
        for k in range(3):
            a = math.pi / 2 + k * 2 * math.pi / 3
            top = (math.cos(a) * .2, .56, math.sin(a) * .2)
            foot = (math.cos(a) * .36, 0, math.sin(a) * .36)
            lg = tube('kg.leg', [top, foot], .012, 6)
            swatch(lg, 'alu')
            ps.append(lg)
            if k > 0:
                w = lathe('kg.wheel', [(0, -.02), (.085, -.02), (.09, 0), (.085, .02), (0, .02)], 12 if q == 0 else 8, foot[0], .085, foot[2], axis='x')
                swatch(w, 'plastic_black')
                ps.append(w)
        pan = lathe('kg.ash', [(0, .2), (.16, .2), (.17, .23), (0, .23)], 12)
        swatch(pan, 'alu')
        ring = tube('kg.ring', [(math.cos(a) * .3, .22, math.sin(a) * .3) for a in [i / 12 * 2 * math.pi for i in range(13)]], .006, 4, caps=False)
        swatch(ring, 'alu')
        ps += [pan, ring]
        out[f'grill.lod{q}'] = smooth(join(ps, f'grill.lod{q}'), 50)
    out['grill.lod2'] = decimate(dup(out['grill.lod1'], 'grill.lod2'), .35)
    return out


# ================================================================================================== hoses and sprinklers
def build_hoses():
    """the coil: about five loose loops of 5/8 in garden hose lying on the lawn, the brass coupling and a pistol nozzle on
    top; its other end leaves the coil at (0.27, 0.012, 0) heading +x (the game runs the hose from there to the faucet).
    The faucet: a brass hose bib on its flange, the handle, the vacuum breaker; its outlet at (0, -0.06, 0.08)."""
    out = {}
    r = .0095
    for q in (0, 1, 2):
        segs = (6, 4, 3)[q]
        n = (120, 60, 28)[q]
        pts = []
        for i in range(n + 1):
            t = i / n
            a = t * 5.2 * 2 * math.pi
            rad = .2 + .05 * math.sin(a * .5 + 1.3) + .02 * math.sin(a * 1.7)
            y = r + .006 + .014 * (.5 + .5 * math.sin(a * .8))
            pts.append((rad * math.cos(a), y, rad * math.sin(a)))
        # leave the coil toward +x on the ground
        end = Vector(pts[-1])
        tail = [(end.x + (0.27 - end.x) * k / 6, r + .004, end.z * (1 - k / 6)) for k in range(1, 7)]
        h = tube('hose.coil', pts + tail, r, segs)
        swatch(h, 'hose_green')
        ps = [smooth(h, 60)]
        if q < 2:
            s0 = Vector(pts[0])
            noz = [lathe('hose.coupling', [(0, 0), (.014, 0), (.014, .03), (0, .03)], 8, s0.x, s0.y, s0.z, axis='x')]
            swatch(noz[0], 'brass')
            body = box('hose.nozzle', (s0.x - .07, s0.y + .02, s0.z), (.12, .035, .03), bevel=.008 if q == 0 else 0)
            grip = box('hose.grip', (s0.x - .1, s0.y - .02, s0.z), (.03, .08, .028), bevel=.006 if q == 0 else 0, rot=[('Z', .3)])
            for o in (body, grip):
                swatch(o, 'plastic_black')
            ps += noz + [body, grip]
        out[f'hose.coil.lod{q}'] = join(ps, f'hose.coil.lod{q}')
    for q in (0, 1):
        ps = []
        fl = lathe('bib.flange', [(0, 0), (.035, 0), (.035, .008), (0, .008)], 10, 0, 0, 0, axis='z')
        body = tube('bib.body', [(0, 0, .008), (0, 0, .06), (0, -.01, .075), (0, -.045, .08)], .013, 8)
        spout = lathe('bib.thread', [(0, 0), (.0135, 0), (.0135, .02), (0, .02)], 8, 0, -.065, .08, axis='y')
        stem = tube('bib.stem', [(0, 0, .05), (0, .045, .06)], .006, 6)
        hand = lathe('bib.handle', [(0, -.004), (.026, -.004), (.026, .004), (0, .004)], 8, 0, .05, .06)
        for o in (fl, body, spout, stem):
            swatch(o, 'brass')
        swatch(hand, 'iron_black')
        ps += [fl, body, spout, stem, hand]
        out[f'hose.bib.lod{q}'] = join(ps, f'hose.bib.lod{q}')
    # the impact sprinkler: a zinc step spike in the lawn (to 0.2 m); the head (on the game's turning head group, origin at
    # its pivot): the brass body and bearing, the nozzle, the drive arm with its spring and spoon, the diffuser screw
    for q in (0, 1):
        sp = [tube('spk.spike', [(0, -.18, 0), (0, .19, 0)], .012, 6)]
        sp.append(tube('spk.step', [(0, .1, 0), (.07, .1, 0), (.07, .07, 0)], .007, 5))
        sp.append(lathe('spk.inlet', [(0, .14), (.018, .14), (.018, .19), (0, .19)], 8))
        sp.append(tube('spk.barb', [(0, .15, 0), (0, .15, .06)], .009, 6))
        for o in sp:
            swatch(o, 'galv')
        out[f'sprinkler.base.lod{q}'] = join(sp, f'sprinkler.base.lod{q}')
        hp = [lathe('spk.bearing', [(0, -.01), (.016, -.01), (.016, .02), (.012, .028), (0, .03)], 10)]
        hp.append(tube('spk.body', [(0, .02, 0), (0, .05, -.02), (0, .065, -.07)], .011, 8))
        hp.append(lathe('spk.nozzle', [(0, 0), (.007, 0), (.005, .03), (0, .03)], 6, 0, .065, -.07, axis='z'))
        for o in hp:
            swatch(o, 'brass')
        arm = tube('spk.arm', [(0, .055, .01), (0, .075, -.04), (0, .07, -.11), (.012, .062, -.125)], .004, 5)
        spoon = box('spk.spoon', (.014, .062, -.125), (.012, .022, .018), bevel=.003 if q == 0 else 0)
        spring = tube('spk.spring', [(.01 * math.cos(k), .035 + k * .0025, .012 * math.sin(k)) for k in [i * .6 for i in range(14)]], .0015, 4, caps=False)
        for o in (arm, spoon, spring):
            swatch(o, 'galv')
        hp += [arm, spoon, spring]
        out[f'sprinkler.head.lod{q}'] = join(hp, f'sprinkler.head.lod{q}')
    return out


# ================================================================================================== toys
def wheel(name, x, y, z, r, w, rim_sw='wheel_white', tire_sw='tire', segs=16, axis='x'):
    t = lathe(name + '.tire', [(r - w * .9, -w / 2), (r - .006, -w / 2), (r, -w * .25), (r, w * .25), (r - .006, w / 2), (r - w * .9, w / 2)], segs, x, y, z, axis=axis, cap=False)
    hub = lathe(name + '.rim', [(0, -w * .4), (r - w * .9, -w * .4), (r - w * .9, w * .4), (0, w * .4)], max(8, segs // 2), x, y, z, axis=axis)
    swatch(t, tire_sw)
    swatch(hub, rim_sw)
    return [smooth(t, 50), hub]


def build_toys():
    out = {}
    for q in (0, 1):
        segs = 18 if q == 0 else 10
        ts = 8 if q == 0 else 5
        # ---- big wheel: the 16 in front wheel (pedals on its axle, front at -z) in a moulded fork, a long low body sweeping
        # back to the rear axle, the yellow bucket seat, yellow bars with grips; small rear wheels
        ps = wheel('bw.front', 0, .27, -.35, .27, .1, rim_sw='plastic_red', tire_sw='plastic_black', segs=32 if q == 0 else 12)
        hub = lathe('bw.hub', [(0, -.07), (.09, -.07), (.1, -.05), (.1, .05), (.09, .07), (0, .07)], max(8, segs // 2), 0, .27, -.35, axis='x')
        swatch(hub, 'plastic_yellow')
        ps.append(hub)
        for s_ in (-1, 1):
            ps += wheel('bw.rear', s_ * .27, .1, .32, .1, .065, rim_sw='plastic_red', tire_sw='plastic_black', segs=max(8, segs // 2))
            crank = tube('bw.crank', [(s_ * .075, .27, -.35), (s_ * .09, .37, -.31)], .011, 5)
            swatch(crank, 'plastic_black')
            ped = box('bw.pedal', (s_ * .15, .37, -.31), (.09, .025, .05), bevel=.006 if q == 0 else 0)
            swatch(ped, 'plastic_yellow')
            fork = loft('bw.fork', [rrect(s_ * .075, y, z, .035, .06, .3, 1, 'xz') for (y, z) in ((.27, -.35), (.4, -.31), (.5, -.27))])
            swatch(fork, 'plastic_red')
            ps += [crank, ped, fork]
        ax = tube('bw.axle', [(-.27, .1, .32), (.27, .1, .32)], .009, 5)
        swatch(ax, 'iron_black')
        ps.append(ax)
        # body: cross-sections from the neck down along the frame to the wide rear deck over the axle
        secs = [(-.27, .5, .09, .09), (-.2, .36, .11, .1), (-.1, .2, .16, .07), (.05, .16, .22, .06), (.2, .16, .34, .07), (.33, .17, .5, .08), (.4, .19, .5, .06)]
        rings = [rrect(0, y, z, w, h, .35, 2 if q == 0 else 1, 'xy') for (z, y, w, h) in secs]
        body = loft('bw.body', rings)
        swatch(body, 'plastic_red')
        ps.append(smooth(body, 50))
        # the bucket seat: a U section swept from the pan (low, forward) up the backrest
        path = [(-.02, .2), (.08, .2), (.18, .21), (.26, .25), (.31, .34), (.33, .45)]
        rings = []
        for (z, y) in path:
            rings.append([(-.17, y + .1, z), (-.15, y + .02, z), (0, y - .01, z), (.15, y + .02, z), (.17, y + .1, z),
                          (.14, y + .09, z), (0, y + .025, z), (-.14, y + .09, z)])
        seat = loft('bw.seat', rings)
        swatch(seat, 'plastic_yellow')
        ps.append(smooth(seat, 50))
        bar = tube('bw.bar', [(-.23, .6, -.24), (-.16, .58, -.27), (0, .57, -.28), (.16, .58, -.27), (.23, .6, -.24)], .016, 6)
        swatch(bar, 'plastic_yellow')
        stem = tube('bw.stem', [(0, .48, -.27), (0, .57, -.28)], .022, 6)
        swatch(stem, 'plastic_red')
        ps += [bar, stem]
        for s_ in (-1, 1):
            g_ = lathe('bw.grip', [(0, 0), (.021, 0), (.021, .07), (0, .07)], 6, s_ * .23 - (.07 if s_ > 0 else 0), .6, -.24, axis='x')
            swatch(g_, 'plastic_black')
            ps.append(g_)
        out[f'toy.bigwheel.lod{q}'] = join(ps, f'toy.bigwheel.lod{q}')
        # ---- wagon: a 34 x 15 in steel tray with a rolled rim, two axles on leaf brackets, steering bolster, 10 in
        # wheels with white rims, the long handle lying forward on the lawn (front at -z, as the procedural wagon)
        ps = []
        tw, tl, th, ty = .38, .86, .12, .23
        verts, faces = [], []
        for (x, z) in ((-tw / 2, -tl / 2), (tw / 2, -tl / 2), (tw / 2, tl / 2), (-tw / 2, tl / 2)):
            verts += [(x * .96, ty, z * .97), (x, ty + th, z)]
        faces = [(0, 2, 4, 6)[::-1]]
        for k in range(4):
            j = (k + 1) % 4
            faces.append((2 * k, 2 * j, 2 * j + 1, 2 * k + 1))
        tray = obj_from('wg.tray', verts, faces)
        tray_in = obj_from('wg.tray.in', verts, [tuple(reversed(f)) for f in faces[1:]])
        swatch(tray, 'wagon_red')
        swatch(tray_in, 'wagon_red')
        rim = tube('wg.rim', [(-tw / 2, ty + th, -tl / 2), (tw / 2, ty + th, -tl / 2), (tw / 2, ty + th, tl / 2), (-tw / 2, ty + th, tl / 2), (-tw / 2, ty + th, -tl / 2)], .009, 6, caps=False)
        swatch(rim, 'wagon_red')
        ps += [tray, tray_in, rim]
        for z in (-.3, .3):
            ax = tube('wg.axle', [(-.25, .1, z), (.25, .1, z)], .006, 5)
            br = box('wg.bracket', (0, .17, z), (.3, .12, .03), bevel=.006 if q == 0 else 0)
            swatch(ax, 'iron_black')
            swatch(br, 'iron_black')
            ps += [ax, br]
            for s in (-1, 1):
                ps += wheel('wg.wheel', s * .25, .1, z, .1, .045, rim_sw='wheel_white', tire_sw='tire', segs=24 if q == 0 else 10)
        bol = box('wg.bolster', (0, .2, -.3), (.32, .03, .05))
        swatch(bol, 'iron_black')
        hd = tube('wg.handle', [(0, .2, -.43), (0, .12, -.6), (0, .03, -.95), (0, .025, -1.0)], .009, 6)
        tg = tube('wg.tgrip', [(-.07, .028, -1.03), (.07, .028, -1.03)], .014, 6)
        swatch(hd, 'iron_black')
        swatch(tg, 'plastic_black')
        ps += [bol, hd, tg]
        out[f'toy.wagon.lod{q}'] = join(ps, f'toy.wagon.lod{q}')
        # ---- kick scooter: aluminium deck with grip tape, a fender brake, 100 mm urethane wheels, the folding stem and
        # T-bar with foam grips (front at -z); the stem and bar take the recorded colour (mask)
        ps = []
        deck = box('sc.deck', (0, .065, .0), (.11, .025, .5), bevel=.008 if q == 0 else 0)
        swatch(deck, 'alu')
        tape = box('sc.tape', (0, .0785, .01), (.095, .003, .42))
        swatch(tape, 'grip_tape')
        fender = tube('sc.fender', [(0, .07, .24), (0, .11, .25), (0, .12, .3)], .02, 6)
        swatch(fender, 'plastic_tint')
        ps += [deck, tape, fender]
        for z in (-.22, .25):
            ps += wheel('sc.wheel', 0, .05, z, .05, .024, rim_sw='alu', tire_sw='urethane', segs=max(8, segs // 2))
        ps.append(tube('sc.neck', [(0, .07, -.22), (0, .12, -.26)], .016, 6))
        stem = tube('sc.stem', [(0, .12, -.26), (0, .78, -.26)], .016, ts)
        swatch(stem, 'paint_tint')
        bar = tube('sc.bar', [(-.16, .78, -.26), (.16, .78, -.26)], .012, ts)
        swatch(bar, 'alu')
        ps += [stem, bar]
        for s in (-1, 1):
            g_ = lathe('sc.grip', [(0, 0), (.017, 0), (.017, .09), (0, .09)], 8, s * .16 - (.09 if s > 0 else 0), .78, -.26, axis='x')
            swatch(g_, 'foam')
            ps.append(g_)
        for o in ps:
            if o.name.startswith('sc.neck'):
                swatch(o, 'alu')
        out[f'toy.scooter.lod{q}'] = join(ps, f'toy.scooter.lod{q}')
        # ---- a 16 in kid's bike with training wheels, lying on its left side in the grass (as the procedural one lies,
        # wheels near flat, front at -z); built upright, then laid down. Frame in the recorded colour (mask)
        ps = []
        WR = .2
        ps += wheel('kb.front', 0, WR, -.36, WR, .045, rim_sw='chrome', tire_sw='tire', segs=28 if q == 0 else 12)
        ps += wheel('kb.rear', 0, WR, .36, WR, .045, rim_sw='chrome', tire_sw='tire', segs=28 if q == 0 else 12)
        for o in ps:
            pass
        fr = [tube('kb.down', [(0, .42, -.22), (0, .2, .04)], .016, ts), tube('kb.top', [(0, .42, -.22), (0, .44, .1)], .015, ts),
              tube('kb.seat', [(0, .2, .04), (0, .5, .14)], .016, ts), tube('kb.chain', [(0, .2, .04), (0, .2, .36)], .011, ts),
              tube('kb.stay', [(0, .47, .12), (0, .2, .36)], .01, ts), tube('kb.fork', [(0, .48, -.24), (0, .2, -.36)], .012, ts)]
        for o in fr:
            swatch(o, 'paint_tint')
        guard = box('kb.guard', (.03, .2, .2), (.01, .12, .34))
        swatch(guard, 'paint_tint')
        bars = tube('kb.bars', [(-.22, .62, -.2), (-.12, .6, -.24), (0, .55, -.25), (.12, .6, -.24), (.22, .62, -.2)], .011, 6)
        swatch(bars, 'chrome')
        stem = tube('kb.stem', [(0, .48, -.24), (0, .56, -.25)], .013, 6)
        swatch(stem, 'chrome')
        sad = box('kb.saddle', (0, .53, .15), (.12, .05, .22), bevel=.02 if q == 0 else 0)
        swatch(sad, 'seat_vinyl')
        crank = tube('kb.crank', [(.06, .2, .04), (.07, .1, .08)], .009, 5)
        ped = box('kb.pedal', (.1, .1, .08), (.07, .02, .05))
        for o in (crank, ped):
            swatch(o, 'plastic_black')
        ps += fr + [guard, bars, stem, sad, crank, ped]
        for s in (-1, 1):
            g_ = lathe('kb.grip', [(0, 0), (.018, 0), (.018, .08), (0, .08)], 6, s * .22 - (.08 if s > 0 else 0), .62, -.2, axis='x')
            swatch(g_, 'plastic_black')
            ps.append(g_)
            tw_ = tube('kb.trainer.arm', [(s * .02, .2, .36), (s * .17, .12, .4)], .007, 5)
            swatch(tw_, 'chrome')
            ps.append(tw_)
            ps += wheel('kb.trainer', s * .19, .07, .4, .07, .03, rim_sw='wheel_white', tire_sw='tire', segs=max(8, segs // 2))
        bike = join(ps, f'toy.kidbike.lod{q}')
        xform(bike, RZ(math.radians(-80)))       # laid on its left side
        bike.data.update()
        zs = [(bike.matrix_world @ v.co).z for v in bike.data.vertices]
        xform(bike, Matrix.Translation(Vector((0, 0, -min(zs)))))
        out[f'toy.kidbike.lod{q}'] = bike
        # ---- balls: a unit sphere, the game scales it to the recorded radius
        for key, tile in (('basketball', 'basketball'), ('playball', 'playball')):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=24 if q == 0 else 12, ring_count=12 if q == 0 else 7, radius=1)
            o = bpy.context.active_object
            for c in list(o.users_collection):
                c.objects.unlink(o)
            BP.COLL.objects.link(o)
            o.data.materials.clear()
            o.data.materials.append(MATS['A'])
            rect_map(o, LAY['tiles'][tile], lambda x, y, z, n: ((math.atan2(z, x) / (2 * math.pi)) % 1, .5 + math.asin(max(-1, min(1, y))) / math.pi))
            o.name = f'toy.{key}.lod{q}'
            out[f'toy.{key}.lod{q}'] = smooth(o, 80)
    for k in ('toy.bigwheel', 'toy.wagon', 'toy.scooter', 'toy.kidbike'):
        out[f'{k}.lod2'] = decimate(dup(out[f'{k}.lod1'], f'{k}.lod2'), .3)
    return out


# ================================================================================================== kiddie pool
def build_pool():
    """a hard plastic wading pool (2 m across, 0.26 m deep, as the procedural one): moulded ribbed wall, a rolled lip,
    the printed floor; its water a separate piece (dt_water) at 0.2 m"""
    out = {}
    for q in (0, 1, 2):
        segs = (48, 24, 14)[q]
        wall = lathe('kp.wall', [(.9, .006), (.96, .01), (.985, .2), (1.0, .245), (1.0, .262), (.975, .262), (.955, .24), (.93, .03), (.9, .02)], segs, cap=False)
        swatch(wall, 'pool_blue')
        face_dir(wall, lambda c: radial(c) if Vector((c.x, 0, c.z)).length > .96 or c.y > .25 else radial(c, -1))
        floor = lathe('kp.floor', [(0, .02), (.9, .02)], segs, cap=False)
        face_dir(floor, UP)
        rect_map(floor, LAY['tiles']['poolprint'], lambda x, y, z, n: ((x + 1) / 2, (z + 1) / 2))
        under = lathe('kp.under', [(0, .004), (.9, .006)], segs, cap=False)
        face_dir(under, DOWN)
        swatch(under, 'pool_blue')
        out[f'pool.kiddie.lod{q}'] = smooth(join([wall, floor, under], f'pool.kiddie.lod{q}'), 50)
        wtr = lathe('kp.water', [(0, .2), (.952, .2)], segs, mat='water', cap=False)
        face_dir(wtr, UP)
        out[f'pool.water.lod{q}'] = wtr
    return out


# ================================================================================================== play equipment
def build_swing():
    """a tubular steel A-frame swing set (the procedural frame: legs from (+-1.6, 0, -+0.9) to the top bar at 2.3 m):
    swaged A-frame brackets, cross braces, ground anchors, two belt swings on chains, and at +x a wave slide with its
    ladder inside the frame's end"""
    out = {}
    for q in (0, 1):
        segs = 10 if q == 0 else 6
        ps = []
        for s in (-1, 1):
            x = s * 1.6
            ps.append(tube('sw.leg', [(x, -.05, -.92), (x, 2.27, -.02)], .021, segs))
            ps.append(tube('sw.leg', [(x, -.05, .92), (x, 2.27, .02)], .021, segs))
            ps.append(tube('sw.brace', [(x, .72, -.61), (x, .72, .61)], .017, segs))
            ps.append(box('sw.bracket', (x, 2.27, 0), (.09, .12, .14), bevel=.02 if q == 0 else 0))
            for z in (-.92, .92):
                ps.append(tube('sw.anchor', [(x, .05, z), (x + .04, .02, z)], .006, 4))
        ps.append(tube('sw.top', [(-1.78, 2.3, 0), (1.78, 2.3, 0)], .03, segs))
        for o in ps:
            swatch(o, 'swing_green')
        for x in (-1.78, 1.78):
            cap = lathe('sw.cap', [(0, -.012), (.034, -.012), (.034, .01), (0, .012)], segs, x, 2.3, 0, axis='x')
            swatch(cap, 'plastic_black')
            ps.append(cap)
        # the swings: S-hooks on the bar, chains (cut-out strips), the belt seat
        for xc in (-.7, .5):
            for s in (-1, 1):
                x = xc + s * .2
                hk = tube('sw.hook', [(x, 2.33, 0), (x, 2.27, .02), (x, 2.24, 0)], .005, 5)
                swatch(hk, 'galv')
                ps.append(hk)
                for rot in ((1, 0), (0, 1)):
                    w = .012
                    if rot[0]:
                        verts = [(x - w, .58, 0), (x + w, .58, 0), (x + w, 2.24, 0), (x - w, 2.24, 0)]
                    else:
                        verts = [(x, .58, -w), (x, .58, w), (x, 2.24, w), (x, 2.24, -w)]
                    ch = obj_from('sw.chain', verts, [(0, 1, 2, 3)], mat='cut')
                    uv = BP._uvl(ch.data)
                    for p in ch.data.polygons:
                        for li, vi in zip(p.loop_indices, p.vertices):
                            v = verts[vi]
                            uv.data[li].uv = (300.02 + (0 if vi in (0, 3) else .96), (v[1] - .58) / .06)
                    ps.append(ch)
                if q == 0:
                    grip = lathe('sw.grip', [(0, 0), (.016, 0), (.016, .3), (0, .3)], 6, x, .62, 0)
                    swatch(grip, 'plastic_black')
                    ps.append(grip)
            verts = []
            n = 8 if q == 0 else 4
            for i in range(n + 1):
                t = i / n
                x = xc - .24 + .48 * t
                y = .58 - .05 * math.sin(math.pi * t)
                verts += [(x, y, -.085), (x, y, .085)]
            faces = [(2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1) for i in range(n)]
            seat = panel('sw.seat', verts, faces)
            swatch(seat, 'plastic_blue')
            ps.append(seat)
        # the wave slide (+x) and its ladder
        prof = []
        n = 14 if q == 0 else 6
        for i in range(n + 1):
            t = i / n
            x = 1.66 + 1.5 * t
            y = 1.45 - 1.15 * t + .06 * math.sin(t * math.pi * 2) - (.0 if t < .9 else (t - .9) * 0)
            if t > .86:
                y = .35 - (t - .86) * .3
            prof.append((x, y))
        verts, faces = [], []
        for i, (x, y) in enumerate(prof):
            for z, dy in ((-.25, .12), (-.2, 0), (0, -.025), (.2, 0), (.25, .12)):
                verts.append((x, y + dy, z))
        for i in range(len(prof) - 1):
            for j in range(4):
                a = i * 5 + j
                faces.append((a, a + 5, a + 6, a + 1))
        bed = panel('sw.slide', verts, faces)
        swatch(bed, 'slide_yellow')
        ps.append(smooth(bed, 40))
        for s in (-1, 1):
            rail = tube('sw.lrail', [(1.62, 1.6, s * .22), (1.22, -.03, s * .26)], .015, segs)
            swatch(rail, 'swing_green')
            ps.append(rail)
        for k in range(1, 5):
            t = k / 5
            y = 1.6 - 1.63 * t
            x = 1.62 - .4 * t
            rung = tube('sw.rung', [(x, y, -.23), (x, y, .23)], .013, 6)
            swatch(rung, 'galv')
            ps.append(rung)
        hookb = tube('sw.slidehook', [(1.6, 1.48, -.2), (1.6, 1.48, .2)], .015, 6)
        swatch(hookb, 'swing_green')
        ps.append(hookb)
        out[f'swing.lod{q}'] = join(ps, f'swing.lod{q}')
    out['swing.lod2'] = decimate(dup(out['swing.lod1'], 'swing.lod2'), .35)
    return out


def build_trampoline():
    """a 12 ft trampoline (the procedural one: frame 1.8 m, its pad at 0.85 m, six legs, the enclosure to 2.5 m):
    galvanized frame ring, three W legs (six uprights), 72 springs under a blue pad, the woven mat, six padded enclosure
    poles curving out a little, the top rope ring and the netting from the mat to the top"""
    out = {}
    for q in (0, 1, 2):
        segs = (48, 24, 12)[q]
        ps = []
        R, Y = 1.8, .85
        ring = tube('tr.frame', [(R * math.cos(a), Y, R * math.sin(a)) for a in [i / segs * 2 * math.pi for i in range(segs + 1)]], .021, (8, 6, 4)[q], caps=False)
        swatch(ring, 'galv')
        ps.append(ring)
        for k in range(3):
            a0, a1 = (k * 120 - 15), (k * 120 + 45)
            ups = []
            for a in (a0, a1):
                ar = math.radians(a)
                top = (R * math.cos(ar), Y, R * math.sin(ar))
                bot = (R * 1.02 * math.cos(ar), 0.03, R * 1.02 * math.sin(ar))
                up = tube('tr.leg', [top, bot], .019, (8, 6, 4)[q])
                swatch(up, 'galv')
                ps.append(up)
                ups.append(bot)
            base = tube('tr.base', [ups[0], ((ups[0][0] + ups[1][0]) / 2 * .97, .03, (ups[0][2] + ups[1][2]) / 2 * .97), ups[1]], .019, (8, 6, 4)[q])
            swatch(base, 'galv')
            ps.append(base)
        if q < 2:
            ns = 72 if q == 0 else 36
            for k in range(ns):
                a = k / ns * 2 * math.pi
                sp = tube('tr.spring', [(R * .985 * math.cos(a), Y - .005, R * .985 * math.sin(a)), (1.64 * math.cos(a), Y - .01, 1.64 * math.sin(a))], .009, 4 if q == 0 else 3, caps=False)
                swatch(sp, 'spring_steel')
                ps.append(sp)
        mat = lathe('tr.mat', [(0, Y - .012), (1.64, Y - .012)], segs, cap=False)
        face_dir(mat, UP)
        rect_map(mat, LAY['tiles']['mat'], lambda x, y, z, n: ((x / 1.72 + 1) / 2, (z / 1.72 + 1) / 2))
        ps.append(mat)
        pad = lathe('tr.pad', [(1.58, Y + .02), (1.6, Y + .035), (1.98, Y + .035), (2.0, Y + .01), (1.99, Y - .06), (1.97, Y - .065)], segs, cap=False)
        swatch(pad, 'pad_blue')
        face_dir(pad, lambda c: tuple(Vector((c.x, c.y - (Y - .015), c.z)) - Vector(radial(c, 1.78))))
        pad_in = lathe('tr.pad.under', [(1.58, Y + .02), (1.97, Y - .065)], segs, cap=False)
        face_dir(pad_in, DOWN)
        swatch(pad_in, 'pad_blue')
        ps += [smooth(pad, 40), pad_in]
        # enclosure: six padded poles at the uprights' angles, bowing out a little, the top ring, the net band
        top = []
        for k in range(6):
            a = math.radians([-15, 45, 105, 165, 225, 285][k])
            ca, sa = math.cos(a), math.sin(a)
            pts = [(R * 1.03 * ca, .6, R * 1.03 * sa), (R * 1.04 * ca, 1.6, R * 1.04 * sa), (R * 1.0 * ca, 2.5, R * 1.0 * sa)]
            pole = tube('tr.pole', pts, .02, (8, 5, 4)[q])
            swatch(pole, 'galv')
            foam = tube('tr.foam', [(R * 1.03 * ca, Y + .1, R * 1.03 * sa), (R * 1.04 * ca, 1.6, R * 1.04 * sa), (R * 1.0 * ca, 2.42, R * 1.0 * sa)], .032, (8, 5, 4)[q])
            swatch(foam, 'foam')
            ps += [pole, foam]
            top.append(pts[-1])
        tr = tube('tr.top', [(R * math.cos(a), 2.5, R * math.sin(a)) for a in [i / segs * 2 * math.pi for i in range(segs + 1)]], .012, (6, 4, 3)[q], caps=False)
        swatch(tr, 'foam')
        ps.append(tr)
        # the net (cut-out, both faces): u >= 200 picks the netting tile, which repeats every 0.4 m
        verts, faces, uvs = [], [], []
        for i in range(segs + 1):
            a = i / segs * 2 * math.pi
            for y in (Y + .05, 2.48):
                verts.append((R * .99 * math.cos(a), y, R * .99 * math.sin(a)))
                uvs.append((200.0 + i / segs * (2 * math.pi * R / .4), (y - Y) / .4))
        for i in range(segs):
            faces.append((2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1))
        net = obj_from('tr.net', verts, faces, mat='cut')
        uv = BP._uvl(net.data)
        for p in net.data.polygons:
            for li, vi in zip(p.loop_indices, p.vertices):
                uv.data[li].uv = uvs[vi]
        out[f'trampoline.lod{q}'] = join(ps, f'trampoline.lod{q}')
        out[f'trampoline.net.lod{q}'] = net
    return out


# ================================================================================================== shed, clothesline
def build_shed(name, Wd, Dd, Hh, rise, ox, oz, door, q):
    """a gable shed (ridge along x, as gableRoof builds it): T1-11 walls on a sill, corner and rake trim, fascia, a
    shingled roof with a drip edge and ridge cap, gable vents; with `door`, a framed single door on +z with strap
    hinges and a hasp. The walls and the roof take the recorded colours (mask): two pieces, (body, roof)."""
    ps, rs = [], []
    W2, D2 = Wd / 2, Dd / 2
    sill = .12
    # walls (outward), the siding tile 2.6 x 2.1 m at true scale
    sd = (2.6, 2.1)
    for (P0, U, w) in (((-W2, sill, D2), (1, 0, 0), Wd), ((W2, sill, -D2), (-1, 0, 0), Wd), ((W2, sill, D2), (0, 0, -1), Dd), ((-W2, sill, -D2), (0, 0, 1), Dd)):
        ps.append(tiled_quad('sh.wall', P0, U, (0, 1, 0), w, Hh - sill, 'siding', *sd))
    # gable triangles (siding continues up)
    for e in (-1, 1):
        x = e * W2
        verts = [(x, Hh, -D2 * e), (x, Hh, D2 * e), (x, Hh + rise, 0)]
        tri = face_dir(obj_from('sh.gable', verts, [(0, 1, 2)]), lambda c, e=e: (e, 0, 0))
        rect_map(tri, LAY['tiles']['siding'], lambda x_, y, z, n: ((z + D2) / 2.6, (y - sill) / 2.1 * .999))
        ps.append(tri)
        if q == 0:
            vent = box('sh.vent', (x + e * .012, Hh + rise * .45, 0), (.02, .22, .3), bevel=.004)
            swatch(vent, 'trim_white')
            ps.append(vent)
    # sill on its concrete pad
    pad = box('sh.pad', (0, .05, 0), (Wd + .1, .1, Dd + .1), bevel=.01 if q == 0 else 0)
    swatch(pad, 'concrete')
    ps.append(pad)
    for (cx, cz) in ((-W2, -D2), (W2, -D2), (W2, D2), (-W2, D2)):
        ct = box('sh.corner', (cx, (sill + Hh) / 2, cz), (.09, Hh - sill, .09))
        swatch(ct, 'trim_white')
        ps.append(ct)
    # roof: two shingled planes from the eaves (with the overhangs) to the ridge, fascia and rake trim, ridge cap
    L = W2 + ox
    ye = Hh - oz * rise / D2
    for s in (-1, 1):
        P0 = (-L, ye, s * (D2 + oz))
        up = Vector((0, Hh + rise - ye, -s * (D2 + oz)))
        ln = up.length
        U = (1, 0, 0) if s > 0 else (-1, 0, 0)
        P0 = (-L, ye, s * (D2 + oz)) if s > 0 else (L, ye, s * (D2 + oz))
        plane = tiled_quad('sh.roof', P0, U, tuple(up.normalized()), 2 * L, ln, 'shingles', 1.5, 1.5)
        under = obj_from('sh.soffit', [tuple(Vector(P0)), tuple(Vector(P0) + Vector(U) * 2 * L), tuple(Vector(P0) + Vector(U) * 2 * L + up), tuple(Vector(P0) + up)], [(3, 2, 1, 0)])
        swatch(under, 'trim_white')
        fas = box('sh.fascia', (0, ye - .04, s * (D2 + oz)), (2 * L + .02, .1, .025))
        swatch(fas, 'trim_white')
        rs += [plane, under, fas]
        for e in (-1, 1):
            rk = tube('sh.rake', [(e * L, ye - .02, s * (D2 + oz)), (e * L, Hh + rise - .02, 0)], .022, 4)
            swatch(rk, 'trim_white')
            rs.append(rk)
    cap = box('sh.ridge', (0, Hh + rise + .012, 0), (2 * L, .03, .16))
    swatch(cap, 'ash')
    rs.append(cap)
    if door:
        dw, dh = 1.0, 1.9
        dz = D2 + .012
        panel = tiled_quad('sh.door', (-dw / 2, sill + .02, dz), (1, 0, 0), (0, 1, 0), dw, dh - .04, 'siding', 2.6, 2.1, u_off=.37)
        ps.append(panel)
        for (cx, cy, sx, sy) in ((0, sill + dh / 2, dw + .1, .0), ):
            pass
        for (x, y, w, h) in ((-dw / 2 - .04, sill + dh / 2, .07, dh + .04), (dw / 2 + .04, sill + dh / 2, .07, dh + .04), (0, sill + dh + .04, dw + .15, .07)):
            tb = box('sh.dtrim', (x, y, dz + .006), (w, h, .02))
            swatch(tb, 'trim_white')
            ps.append(tb)
        for (y,) in ((sill + .3,), (sill + dh / 2,), (sill + dh - .3,)):
            tb = box('sh.dbrace', (0, y, dz + .012), (dw - .08, .08, .016))
            swatch(tb, 'trim_white')
            ps.append(tb)
        if q == 0:
            for y in (sill + .35, sill + dh - .35):
                hg = box('sh.hinge', (-dw / 2 + .15, y, dz + .024), (.3, .035, .006))
                swatch(hg, 'iron_black')
                ps.append(hg)
            hs = box('sh.hasp', (dw / 2 - .08, sill + 1.0, dz + .024), (.05, .14, .008))
            hd = tube('sh.handle', [(dw / 2 - .16, sill + .9, dz + .02), (dw / 2 - .16, sill + .92, dz + .05), (dw / 2 - .16, sill + 1.08, dz + .05), (dw / 2 - .16, sill + 1.1, dz + .02)], .008, 5)
            for o in (hs, hd):
                swatch(o, 'iron_black')
            ps += [hs, hd]
    base, dot = name.rsplit('.lod', 1)
    return join(ps, name), join(rs, f'{base}.roof.lod{dot}')


def build_sheds():
    out = {}
    for q in (0, 1):
        out[f'shed.lod{q}'], out[f'shed.roof.lod{q}'] = build_shed(f'shed.lod{q}', 2.6, 2.2, 2.1, .8, .15, .2, True, q)
        out[f'shed.small.lod{q}'], out[f'shed.small.roof.lod{q}'] = build_shed(f'shed.small.lod{q}', 2.4, 2.0, 2.1, .7, .12, .18, False, q)
    for k in ('shed', 'shed.roof', 'shed.small', 'shed.small.roof'):
        out[f'{k}.lod2'] = decimate(dup(out[f'{k}.lod1'], f'{k}.lod2'), .4)
    return out


def build_clothesline():
    """two galvanized T-posts (the procedural line: posts at x +-2.2, arms 0.9 m at 1.85 m), concrete collars, eye
    bolts, three lines of coated wire with a little sag, and the three things on the middle line (a sheet, a towel, a
    T-shirt in the procedural colours) folded over it with clothespins"""
    out = {}
    for q in (0, 1):
        segs = 10 if q == 0 else 6
        ps = []
        for s in (-1, 1):
            x = s * 2.2
            ps.append(tube('cl.post', [(x, -.05, 0), (x, 1.9, 0)], .03, segs))
            ps.append(tube('cl.arm', [(x, 1.85, -.47), (x, 1.85, .47)], .022, segs))
            for z in (-.42, .42):
                ps.append(tube('cl.strut', [(x, 1.6, 0), (x, 1.84, z * .55)], .012, 6))
            col = lathe('cl.collar', [(0, -.02), (.12, -.02), (.11, .03), (0, .04)], 12 if q == 0 else 8, x, 0, 0)
            swatch(col, 'concrete')
            ps.append(col)
        for o in ps:
            if not o.name.startswith('cl.collar'):
                swatch(o, 'galv')
        for z in (-.4, 0, .4):
            pts = []
            n = 16 if q == 0 else 6
            for i in range(n + 1):
                t = i / n
                pts.append((-2.2 + 4.4 * t, 1.84 - .05 * 4 * t * (1 - t) - .0, z))
            ln = tube('cl.line', pts, .0025, 4, caps=False)
            swatch(ln, 'rope')
            ps.append(ln)
        cl = LAY['tiles']['clothes']
        for k, (xc, w, hgt) in enumerate(((-1.0, .5, .6), (-.2, .5, .6), (.6, .5, .62))):
            verts, faces, uvs = [], [], []
            nx, ny = (8, 6) if q == 0 else (3, 2)
            y_line = 1.84 - .05 * 4 * ((xc + 2.2) / 4.4) * (1 - (xc + 2.2) / 4.4)
            for j in range(ny + 1):
                for i in range(nx + 1):
                    u, v = i / nx, j / ny
                    x = xc - w / 2 + w * u
                    y = y_line - hgt * v
                    z = .025 * math.sin(u * math.pi * 2 + k) * v + .01 * v
                    verts.append((x, y, z))
                    uvs.append((u, 1 - v))
            for j in range(ny):
                for i in range(nx):
                    a = j * (nx + 1) + i
                    faces.append((a, a + 1, a + nx + 2, a + nx + 1))
            cloth = panel('cl.cloth', verts, faces)
            uvs = uvs + uvs
            uv = BP._uvl(cloth.data)
            x0, y0 = cl[0] + k * 170, cl[1]
            for p in cloth.data.polygons:
                for li, vi in zip(p.loop_indices, p.vertices):
                    u, v = uvs[vi]
                    uv.data[li].uv = ((x0 + 2 + u * 166) / S, 1 - (y0 + 2 + (1 - v) * 252) / S)
            ps.append(smooth(cloth, 80))
            if q == 0:
                for px_ in (xc - w / 2 + .05, xc + w / 2 - .05):
                    pin = box('cl.pin', (px_, y_line - .01, 0), (.012, .07, .014))
                    swatch(pin, 'pin_wood')
                    ps.append(pin)
        out[f'clothesline.lod{q}'] = join(ps, f'clothesline.lod{q}')
    out['clothesline.lod2'] = decimate(dup(out['clothesline.lod1'], 'clothesline.lod2'), .4)
    return out


# ================================================================================================== fences
def build_fences():
    """the creek's chain link (1.2 m: a unit-length bay along x in [-0.5, 0.5], sheared by the game between its posts),
    its line post; the lookout's field fence: a round weathered post and a unit-length round rail along x in [0, 1]"""
    out = {}
    for q in (0, 1, 2):
        H = 1.2
        verts = [(-.5, .03, 0), (.5, .03, 0), (.5, H - .02, 0), (-.5, H - .02, 0)]
        mesh = obj_from('ch.mesh', verts, [(0, 1, 2, 3)], mat='cut')
        uv = BP._uvl(mesh.data)
        for p in mesh.data.polygons:
            for li, vi in zip(p.loop_indices, p.vertices):
                x, y, _ = verts[vi]
                uv.data[li].uv = (100.0 + (x + .5) * 2.4 / .4, (y - .03) / .4)
        ps = [mesh]
        if q < 2:
            tr = tube('ch.toprail', [(-.5, H, 0), (.5, H, 0)], .021, 8 if q == 0 else 5, caps=False)
            swatch(tr, 'galv')
            tw = tube('ch.tension', [(-.5, .05, 0), (.5, .05, 0)], .003, 3, caps=False)
            swatch(tw, 'galv')
            ps += [tr, tw]
        out[f'fence.chain.lod{q}'] = join(ps, f'fence.chain.lod{q}')
        segs = (10, 6, 4)[q]
        p = lathe('ch.post', [(.001, -.15), (.03, -.15), (.03, 1.0), (.001, 1.0)], segs)
        swatch(p, 'galv')
        cap = lathe('ch.cap', [(.001, .98), (.036, .98), (.036, 1.03), (.02, 1.05), (.001, 1.05)], segs)
        swatch(cap, 'galv')
        out[f'post.chain.lod{q}'] = join([p, cap], f'post.chain.lod{q}')
        # field fence: a weathered round post (planks of the grey wood tile run up it) and a round rail
        pt = lathe('ff.post', [(.001, -.2), (.08, -.2), (.077, 1.18), (.07, 1.26), (.05, 1.3), (.001, 1.31)], segs + 2)
        px_ = BP.plank('wood_grey', 2, 40)
        rect_map(pt, px_, lambda x, y, z, n: ((math.atan2(z, x) / (2 * math.pi)) % 1, (y + .2) / 1.51))
        out[f'ff.post.lod{q}'] = smooth(pt, 50)
        rl = tube('ff.rail', [(0, 0, 0), (.33, .006, .004), (.67, -.004, -.003), (1, 0, 0)], .05, segs, caps=True)
        px_ = BP.plank('wood_grey', 4, 40)
        rect_map(rl, px_, lambda x, y, z, n: ((math.atan2(z, y) / (2 * math.pi)) % 1, x))
        out[f'ff.rail.lod{q}'] = smooth(rl, 50)
    return out


# ================================================================================================== contacts
def contacts(o):
    """the lowest points of a piece (in the game frame): the game settles each placed object onto the ground with them"""
    vs = [(v.co.x, v.co.z, -v.co.y) for v in o.data.vertices]
    if not vs:
        return []
    y0 = min(v[1] for v in vs)
    low = [v for v in vs if v[1] < y0 + .015]
    pick = []
    for key in (lambda v: v[0], lambda v: -v[0], lambda v: v[2], lambda v: -v[2], lambda v: v[0] + v[2], lambda v: v[0] - v[2], lambda v: -v[0] + v[2], lambda v: -v[0] - v[2]):
        m = min(low, key=key)
        if m not in pick:
            pick.append(m)
    return [[round(a, 4) for a in v] for v in pick]


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'details.kit'
    BP.COLL = bpy.data.collections.new('details')
    sc.collection.children.link(BP.COLL)
    MATS.clear()
    MATS['A'] = BP.material('dt_A')
    MATS['cut'] = BP.material('dt_cut')
    MATS['sign'] = BP.material('dt_sign')
    MATS['water'] = BP.material('dt_water', (.3, .5, .6))
    pieces = {}
    for f in (build_signs, build_chairs, build_grill, build_hoses, build_toys, build_pool, build_swing, build_trampoline, build_sheds, build_clothesline, build_fences):
        got = f()
        pieces.update(got)
        log(f.__name__, {k: tris(v) for k, v in got.items() if k.endswith('lod0')})
    root = bpy.data.objects.new('details.kit', None)
    BP.COLL.objects.link(root)
    root['ll_asset_id'] = 'details.kit'
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = ('Original work for Last Light (the lookout rails use the street-props weathered fence wood: "Wooden Fence" by '
                          'DmitriyGDS, CC BY 4.0; sign lettering set in Overpass, SIL OFL 1.1). See docs/THIRD_PARTY_ASSETS.md')
    attach = {'hoseExit': [.27, .0135, 0], 'bibOutlet': [0, -.075, .08], 'bibHeight': .45, 'sprinklerHead': .2,
              'post': {'top': 2.6, 'width': POST}, 'blade': [1.2, .19], 'plateOffset': POST / 2 + .004}
    cont = {k[:-5]: contacts(o) for k, o in pieces.items() if k.endswith('.lod0')}
    root['dt_attach'] = json.dumps(attach)
    root['dt_contacts'] = json.dumps(cont)
    for k, o in pieces.items():
        o.name = k
        o.data.name = k
        o.parent = root
    for o in list(BP.COLL.objects):
        if o is not root and o.parent is not root:
            bpy.data.objects.remove(o)
    stats = {'blender': bpy.app.version_string, 'pieces': {k: tris(o) for k, o in sorted(pieces.items())}, 'attach': attach, 'contacts': cont}
    os.makedirs(os.path.dirname(BLEND), exist_ok=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    img = {}
    for n, f in (('A', 'details_albedo.jpg'), ('cut', 'details_cutout.png'), ('sign', 'details_signs.jpg')):
        im = bpy.data.images.load(os.path.join(TEX, f), check_existing=True)
        m = MATS[n]
        tn = m.node_tree.nodes.new('ShaderNodeTexImage')
        tn.image = im
        m.node_tree.links.new(tn.outputs['Color'], m.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
        img[n] = tn
    ours = set(MATS.values())
    for m in list(bpy.data.materials):
        if m not in ours:
            bpy.data.materials.remove(m)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND, relative_remap=True, compress=True)
    for n, tn in img.items():
        MATS[n].node_tree.nodes.remove(tn)
    ll_export.export_glb(OUT, export_materials='EXPORT', export_tangents=False)
    stats['glb_bytes'] = os.path.getsize(OUT)
    json.dump(stats, open(STATS, 'w'), indent=1)
    log('wrote', OUT, stats['glb_bytes'], 'bytes')


if __name__ == '__main__':
    main()
