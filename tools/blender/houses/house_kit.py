"""Last Light house kit: the low-level builder every house component uses.

All geometry is written in the game's house-local frame (houses.js): metres, x across the facade (+x to the right seen
from the street), y up from the lot ground, +z toward the street. `to_blender` turns it into Blender's frame, where the
house faces -Y like every Last Light asset (BLENDER-PIPELINE.md 3): Blender (X, Y, Z) = (x, -z, y). A proper rotation, so
face winding (counter-clockwise seen from outside) is kept, and after the glTF exporter's +Y-up conversion the file's
coordinates are house-local again.

One `MB` (mesh builder) per house per level of detail collects faces with a material slot, UVs in metres (tiling
families are mapped in world metres so courses line up across pieces) and a linear paint colour per face (COLOR_0: the
shared texture library is near-neutral and each house's paint, roof and trim colours ride on the vertices, so twelve
houses share one set of materials and textures).
"""
import math
import bpy
import bmesh
import numpy as np
from mathutils import Vector

# Shared material slots (one material each in the whole kit). name -> (glTF material name, tile size in metres or None)
SLOTS = {
    'siding':   ('mat.siding.vinyl/house.kit', 2.0),
    'brick':    ('mat.brick/house.kit', 2.0),
    'roof':     ('mat.roof.shingle/house.kit', 2.0),
    'concrete': ('mat.concrete/house.kit', 2.0),
    'paint':    ('mat.wood.painted/house.kit', 1.0),
    'metal':    ('mat.metal.painted/house.kit', None),
    'bare':     ('mat.metal.bare/house.kit', None),
    'glass':    ('mat.glass/house.kit', None),
    'interior': ('mat.interior/house.kit', None),
    'light':    ('mat.light/house.kit', None),
}
SLOT_ORDER = list(SLOTS)


def srgb_to_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lin(hexstr_or_int, k=1.0):
    """'#rrggbb' / 0xrrggbb -> linear RGB tuple, optionally scaled (clamped to 1)."""
    if isinstance(hexstr_or_int, str):
        v = int(hexstr_or_int.lstrip('#'), 16)
    else:
        v = int(hexstr_or_int)
    r, g, b = (v >> 16) & 255, (v >> 8) & 255, v & 255
    return tuple(min(1.0, srgb_to_lin(x) * k) for x in (r, g, b))


def mix(a, b, t):
    return tuple(a[i] * (1 - t) + b[i] * t for i in range(3))


def to_blender(p):
    return (p[0], -p[2], p[1])


def V(*a):
    return np.array(a, dtype=float)


def norm(v):
    n = np.linalg.norm(v)
    return v / n if n > 1e-12 else v


class MB:
    """Mesh builder in house-local coordinates."""

    def __init__(self, name):
        self.name = name
        self.verts = []        # positions (house-local)
        self.faces = []        # (vertex indices, slot, uvs, colour, smooth)
        self.paint = (1, 1, 1)  # current default colour

    # ------------------------------------------------------------------ primitives
    def _add(self, pts):
        i0 = len(self.verts)
        self.verts.extend([tuple(map(float, p)) for p in pts])
        return list(range(i0, i0 + len(pts)))

    def poly(self, pts, slot, col=None, uv=None, uvmode=None, smooth=False, n=None):
        """A planar polygon, counter-clockwise seen from the side it faces (or turned to face n when given)."""
        pts = [np.asarray(p, dtype=float) for p in pts]
        if n is not None and len(pts) >= 3:
            c = np.cross(pts[1] - pts[0], pts[2] - pts[0])
            if len(pts) > 3 and np.linalg.norm(c) < 1e-12:
                c = np.cross(pts[2] - pts[0], pts[3] - pts[0])
            if float(np.dot(c, n)) < 0:
                pts = pts[::-1]
                if uv is not None:
                    uv = uv[::-1]
        if uv is None:
            uv = self.auto_uv(pts, slot, uvmode)
        idx = self._add(pts)
        self.faces.append((idx, slot, uv, col or self.paint, smooth))
        return idx

    def quad(self, a, b, c, d, slot, col=None, uv=None, uvmode=None, n=None):
        return self.poly([a, b, c, d], slot, col, uv, uvmode, n=n)

    def tri(self, a, b, c, slot, col=None, uv=None, uvmode=None):
        return self.poly([a, b, c], slot, col, uv, uvmode)

    # UVs: tiling families in world metres on the face's plane; painted wood along the longest edge (grain direction).
    def auto_uv(self, pts, slot, mode=None):
        tile = SLOTS[slot][1] or 1.0
        n = norm(np.cross(pts[1] - pts[0], pts[2] - pts[0])) if len(pts) >= 3 else V(0, 0, 1)
        if mode is not None and not isinstance(mode, str):   # explicit (origin, u axis, v axis)
            o, ua, va = mode
            return [(float(np.dot(p - o, ua) / tile), float(np.dot(p - o, va) / tile)) for p in pts]
        ax = np.abs(n)
        if mode == 'grain':   # u along the polygon's longest edge
            best, bl = None, -1
            for i in range(len(pts)):
                e = pts[(i + 1) % len(pts)] - pts[i]
                l = np.linalg.norm(e)
                if l > bl:
                    best, bl = e / max(l, 1e-9), l
            ua = best
            va = norm(np.cross(n, ua))
            return [(float(np.dot(p, ua) / tile), float(np.dot(p, va) / tile)) for p in pts]
        if ax[1] >= ax[0] and ax[1] >= ax[2]:        # horizontal face: x, z
            return [(float(p[0] / tile), float(-p[2] / tile)) for p in pts]
        if ax[0] >= ax[2]:                            # faces +-x: along z, up y
            s = 1 if n[0] > 0 else -1
            return [(float(-s * p[2] / tile), float(p[1] / tile)) for p in pts]
        s = 1 if n[2] > 0 else -1                     # faces +-z: along x, up y
        return [(float(s * p[0] / tile), float(p[1] / tile)) for p in pts]

    # ------------------------------------------------------------------ solids
    def box(self, c, size, slot, col=None, skip=(), frame=None, uvmode=None):
        """Axis box (or in a local frame (origin, ex, ey, ez)). size = full extents. skip: faces to omit ('+x','-y',...)."""
        hx, hy, hz = size[0] / 2, size[1] / 2, size[2] / 2
        if frame is None:
            o, ex, ey, ez = V(*c), V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)
        else:
            o0, ex, ey, ez = frame
            o = o0 + ex * c[0] + ey * c[1] + ez * c[2]
        P = lambda x, y, z: o + ex * x + ey * y + ez * z
        faces = {
            '+x': (P(hx, -hy, hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(hx, hy, hz)),
            '-x': (P(-hx, -hy, -hz), P(-hx, -hy, hz), P(-hx, hy, hz), P(-hx, hy, -hz)),
            '+y': (P(-hx, hy, hz), P(hx, hy, hz), P(hx, hy, -hz), P(-hx, hy, -hz)),
            '-y': (P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, -hy, hz), P(-hx, -hy, hz)),
            '+z': (P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz)),
            '-z': (P(hx, -hy, -hz), P(-hx, -hy, -hz), P(-hx, hy, -hz), P(hx, hy, -hz)),
        }
        mode = uvmode if uvmode is not None else ('grain' if slot == 'paint' else None)
        for k, f in faces.items():
            if k in skip:
                continue
            self.poly(f, slot, col, uvmode=mode)

    def span(self, a, b, w, t, slot, col=None, up=(0, 1, 0), skip=('a', 'b')):
        """A board/bar from point a to point b: width w across `up`, thickness t along up x dir."""
        a, b = V(*a), V(*b)
        ex = norm(b - a)
        L = np.linalg.norm(b - a)
        ey = V(*up)
        ey = norm(ey - ex * np.dot(ey, ex))
        ez = np.cross(ex, ey)
        sk = []
        if 'a' in skip:
            sk.append('-x')
        if 'b' in skip:
            sk.append('+x')
        self.box((L / 2, 0, 0), (L, w, t), slot, col, skip=tuple(sk), frame=(a, ex, ey, ez))

    def prism(self, base, height, slot, col=None, top=True, bottom=False, uvmode=None):
        """Extrude a counter-clockwise (seen from +y) polygon in xz up by height (y)."""
        n = len(base)
        lo = [V(p[0], p[1], p[2]) for p in base]
        hi = [p + V(0, height, 0) for p in lo]
        for i in range(n):
            j = (i + 1) % n
            self.quad(lo[i], lo[j], hi[j], hi[i], slot, col, uvmode=uvmode)
        if top:
            self.poly(hi, slot, col, uvmode=uvmode)
        if bottom:
            self.poly(list(reversed(lo)), slot, col, uvmode=uvmode)

    def cylinder(self, a, b, r, slot, col=None, seg=8, caps=(True, True), r2=None):
        a, b = V(*a), V(*b)
        ax = norm(b - a)
        t = V(1, 0, 0) if abs(ax[0]) < .9 else V(0, 1, 0)
        u = norm(np.cross(ax, t))
        v = np.cross(ax, u)
        r2 = r if r2 is None else r2
        ring = lambda c, rr: [c + (u * math.cos(2 * math.pi * k / seg) + v * math.sin(2 * math.pi * k / seg)) * rr for k in range(seg)]
        A, B = ring(a, r), ring(b, r2)
        i0 = len(self.verts)
        self.verts.extend([tuple(p) for p in A + B])
        circ = 2 * math.pi * max(r, r2)
        L = np.linalg.norm(b - a)
        for k in range(seg):
            k2 = (k + 1) % seg
            uvs = [(k / seg * circ, 0), (k / seg * circ, L), ((k + 1) / seg * circ, L), ((k + 1) / seg * circ, 0)]
            # winding: outward
            self.faces.append(([i0 + k, i0 + k2, i0 + seg + k2, i0 + seg + k][::1], slot, [uvs[0], uvs[3], uvs[2], uvs[1]], col or self.paint, True))
        if caps[0]:
            self.poly(list(reversed(A)), slot, col)
        if caps[1]:
            self.poly(B, slot, col)

    def lathe(self, profile, c, slot, col=None, seg=10, axis='y'):
        """Revolve [(r, h)] about the vertical axis through c (smooth)."""
        c = V(*c)
        rings = []
        for (r, h) in profile:
            rings.append([c + V(r * math.cos(2 * math.pi * k / seg), h, r * math.sin(2 * math.pi * k / seg)) for k in range(seg)])
        i0 = len(self.verts)
        for ring in rings:
            self.verts.extend([tuple(p) for p in ring])
        for j in range(len(rings) - 1):
            for k in range(seg):
                k2 = (k + 1) % seg
                a, b = i0 + j * seg + k, i0 + j * seg + k2
                cc, d = i0 + (j + 1) * seg + k2, i0 + (j + 1) * seg + k
                uvs = [(k / seg, profile[j][1]), (k / seg, profile[j + 1][1]), ((k + 1) / seg, profile[j + 1][1]), ((k + 1) / seg, profile[j][1])]
                self.faces.append(([a, d, cc, b], slot, uvs, col or self.paint, True))

    def sweep(self, profile, path, slot, col=None, up=(0, 1, 0), closed=False, caps=True, smooth=False):
        """Sweep a 2D profile [(s, t)] (s along the side vector, t along up) along a polyline."""
        path = [V(*p) for p in path]
        n = len(path)
        rings = []
        for i, p in enumerate(path):
            if i == 0:
                d = path[1] - path[0]
            elif i == n - 1:
                d = path[-1] - path[-2]
            else:
                d = norm(path[i + 1] - path[i]) + norm(path[i] - path[i - 1])
            d = norm(d)
            upv = V(*up)
            upv = norm(upv - d * np.dot(upv, d))
            side = np.cross(d, upv)
            # mitre scale at corners
            k = 1.0
            if 0 < i < n - 1:
                a1, a2 = norm(path[i] - path[i - 1]), norm(path[i + 1] - path[i])
                c = max(.2, float(np.dot(norm(a1 + a2), a1)))
                k = 1.0 / c
            rings.append([p + side * s * k + upv * t for (s, t) in profile])
        m = len(profile)
        i0 = len(self.verts)
        for ring in rings:
            self.verts.extend([tuple(q) for q in ring])
        seglen = [0.0]
        for i in range(1, n):
            seglen.append(seglen[-1] + float(np.linalg.norm(path[i] - path[i - 1])))
        for i in range(n - 1):
            for j in range(m if closed else m - 1):
                j2 = (j + 1) % m
                a, b = i0 + i * m + j, i0 + i * m + j2
                c, d = i0 + (i + 1) * m + j2, i0 + (i + 1) * m + j
                uvs = [(seglen[i], j * .05), (seglen[i + 1], j * .05), (seglen[i + 1], j2 * .05), (seglen[i], j2 * .05)]
                self.faces.append(([a, d, c, b], slot, uvs, col or self.paint, smooth))
        if caps:
            self.poly([V(*self.verts[i0 + j]) for j in range(m)], slot, col)
            self.poly([V(*self.verts[i0 + (n - 1) * m + j]) for j in range(m)][::-1], slot, col)

    # ------------------------------------------------------------------ stats / output
    def tris(self):
        return sum(len(f[0]) - 2 for f in self.faces)

    def build(self, collection, materials, name=None):
        """Create a Blender mesh object (triangulated n-gons, outward winding kept, per-corner colour and UV)."""
        name = name or self.name
        me = bpy.data.meshes.new(name)
        verts = [to_blender(p) for p in self.verts]
        polys = [f[0] for f in self.faces]
        me.from_pydata(verts, [], polys)
        me.update(calc_edges=True)
        slots = []
        for f in self.faces:
            if f[1] not in slots:
                slots.append(f[1])
        slots.sort(key=SLOT_ORDER.index)
        for s in slots:
            me.materials.append(materials[s])
        me.uv_layers.new(name='UVMap')
        me.color_attributes.new(name='Color', type='BYTE_COLOR', domain='CORNER')
        uvl = me.uv_layers['UVMap']           # (fetch after every attribute is added: adding one reallocates the others)
        col = me.color_attributes['Color']
        mi = [slots.index(f[1]) for f in self.faces]
        me.polygons.foreach_set('material_index', mi)
        me.polygons.foreach_set('use_smooth', [bool(f[4]) for f in self.faces])
        uvs, cols = [], []
        for f in self.faces:
            c = f[3]
            for k in range(len(f[0])):
                uvs.extend(f[2][k])
                cols.extend((c[0], c[1], c[2], 1.0))
        uvl.data.foreach_set('uv', uvs)
        col.data.foreach_set('color', cols)
        me.validate(clean_customdata=False)
        ob = bpy.data.objects.new(name, me)
        collection.objects.link(ob)
        # triangulate n-gons (MikkTSpace and the exporter want triangles/quads; quads are triangulated on export)
        bm = bmesh.new()
        bm.from_mesh(me)
        ngons = [f for f in bm.faces if len(f.verts) > 4]
        if ngons:
            bmesh.ops.triangulate(bm, faces=ngons)
        bm.to_mesh(me)
        bm.free()
        return ob


# ---------------------------------------------------------------------------------------------- wall faces with holes
def wall_rects(x0, x1, y0, y1, holes):
    """Cover the rectangle [x0,x1]x[y0,y1] minus rectangular holes [(a0,a1,b0,b1)] with rectangles (column slicing)."""
    xs = sorted(set([x0, x1] + [h[0] for h in holes] + [h[1] for h in holes]))
    xs = [x for x in xs if x0 - 1e-9 <= x <= x1 + 1e-9]
    out = []
    for i in range(len(xs) - 1):
        a, b = xs[i], xs[i + 1]
        if b - a < 1e-6:
            continue
        m = (a + b) / 2
        cuts = sorted([(h[2], h[3]) for h in holes if h[0] < m < h[1]])
        y = y0
        for (c0, c1) in cuts:
            if c0 > y + 1e-6:
                out.append((a, b, y, min(c0, y1)))
            y = max(y, c1)
        if y < y1 - 1e-6:
            out.append((a, b, y, y1))
    # merge vertically-identical neighbours to save triangles
    merged = []
    for r in sorted(out, key=lambda r: (r[2], r[3], r[0])):
        if merged and abs(merged[-1][1] - r[0]) < 1e-6 and abs(merged[-1][2] - r[2]) < 1e-6 and abs(merged[-1][3] - r[3]) < 1e-6:
            merged[-1] = (merged[-1][0], r[1], r[2], r[3])
        else:
            merged.append(r)
    return merged


class Wall:
    """A planar wall: origin o (its left-bottom point seen from outside), along unit vector ax, outward normal n.
    Local (s, y, t): s along the wall from o, y up (absolute), t outward."""

    def __init__(self, o, ax, n, length):
        self.o, self.ax, self.n, self.L = V(*o), norm(V(*ax)), norm(V(*n)), length

    def p(self, s, y, t=0.0):
        return self.o + self.ax * s + V(0, y, 0) + self.n * t

    def frame(self, s, y, t=0.0):
        """(origin, ex, ey, ez) of a component on this wall: ex along, ey up, ez out."""
        return (self.p(s, y, t), self.ax, V(0, 1, 0), self.n)


def wall_surface(mb, wall, y0, y1, holes, slot, col, t=0.0, s0=0.0, s1=None, reveal=None, reveal_slot='paint', reveal_col=None):
    """Fill a wall plane with rectangles around holes [(s0,s1,y0,y1)]; reveal = depth of the opening returns."""
    s1 = wall.L if s1 is None else s1
    for (a, b, c, d) in wall_rects(s0, s1, y0, y1, holes):
        mb.quad(wall.p(a, c, t), wall.p(b, c, t), wall.p(b, d, t), wall.p(a, d, t), slot, col)
    if reveal:
        for (a, b, c, d) in holes:
            if b <= s0 or a >= s1:
                continue
            rc = reveal_col or col
            rs = reveal_slot
            # four returns facing into the opening
            up = V(0, 1, 0)
            mb.quad(wall.p(a, c, t), wall.p(a, d, t), wall.p(a, d, t - reveal), wall.p(a, c, t - reveal), rs, rc, n=wall.ax)    # left jamb
            mb.quad(wall.p(b, d, t), wall.p(b, c, t), wall.p(b, c, t - reveal), wall.p(b, d, t - reveal), rs, rc, n=-wall.ax)   # right jamb
            mb.quad(wall.p(b, d, t), wall.p(b, d, t - reveal), wall.p(a, d, t - reveal), wall.p(a, d, t), rs, rc, n=-up)        # head
            mb.quad(wall.p(a, c, t), wall.p(a, c, t - reveal), wall.p(b, c, t - reveal), wall.p(b, c, t), rs, rc, n=up)         # sill


# ---------------------------------------------------------------------------------------------- materials (Blender)
def _img(path, colorspace):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = colorspace
    return im


def make_materials(tex, kit_name='house.kit'):
    """The shared house material library. tex: {family: {'basecolor': path, 'normal': path, 'orm': path}} (optional)."""
    mats = {}
    for slot, (name, tile) in SLOTS.items():
        m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
        m.use_nodes = True
        nt = m.node_tree
        for n in list(nt.nodes):
            nt.nodes.remove(n)
        out = nt.nodes.new('ShaderNodeOutputMaterial')
        out.location = (600, 0)
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
        bsdf.location = (300, 0)
        nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        vc = nt.nodes.new('ShaderNodeVertexColor')
        vc.layer_name = 'Color'
        vc.location = (-500, 300)
        t = tex.get(slot)
        if t and t.get('basecolor'):
            bc = nt.nodes.new('ShaderNodeTexImage')
            bc.image = _img(t['basecolor'], 'sRGB')
            bc.location = (-500, 100)
            mul = nt.nodes.new('ShaderNodeMix')
            mul.data_type = 'RGBA'
            mul.blend_type = 'MULTIPLY'
            mul.inputs['Factor'].default_value = 1.0
            mul.location = (-150, 200)
            nt.links.new(bc.outputs['Color'], mul.inputs[6])
            nt.links.new(vc.outputs['Color'], mul.inputs[7])
            nt.links.new(mul.outputs[2], bsdf.inputs['Base Color'])
        else:
            nt.links.new(vc.outputs['Color'], bsdf.inputs['Base Color'])
        if t and t.get('orm'):
            orm = nt.nodes.new('ShaderNodeTexImage')
            orm.image = _img(t['orm'], 'Non-Color')
            orm.location = (-500, -200)
            sep = nt.nodes.new('ShaderNodeSeparateColor')
            sep.location = (-200, -200)
            nt.links.new(orm.outputs['Color'], sep.inputs['Color'])
            nt.links.new(sep.outputs['Green'], bsdf.inputs['Roughness'])
            nt.links.new(sep.outputs['Blue'], bsdf.inputs['Metallic'])
        if t and t.get('normal'):
            nm = nt.nodes.new('ShaderNodeTexImage')
            nm.image = _img(t['normal'], 'Non-Color')
            nm.location = (-500, -500)
            nmap = nt.nodes.new('ShaderNodeNormalMap')
            nmap.location = (-150, -500)
            nmap.inputs['Strength'].default_value = t.get('normal_strength', 1.0)
            nt.links.new(nm.outputs['Color'], nmap.inputs['Color'])
            nt.links.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])
        rough = {'metal': .42, 'bare': .32, 'glass': .03, 'interior': .9, 'light': .5}.get(slot, .7)
        bsdf.inputs['Roughness'].default_value = rough
        bsdf.inputs['Metallic'].default_value = 1.0 if slot == 'bare' else 0.0
        if slot == 'glass':
            # alpha-blended glass (glTF alphaMode BLEND); the game adds Fresnel and the scoped sky reflection
            bsdf.inputs['Alpha'].default_value = 0.2
            try:
                m.surface_render_method = 'BLENDED'
            except Exception:
                pass
            try:
                m.blend_method = 'BLEND'
            except Exception:
                pass
            bsdf.inputs['IOR'].default_value = 1.5
        if slot == 'interior' and t and t.get('emissive'):
            em = nt.nodes.new('ShaderNodeTexImage')
            em.image = _img(t['emissive'], 'sRGB')
            em.location = (-500, -800)
            nt.links.new(em.outputs['Color'], bsdf.inputs['Emission Color'])
            bsdf.inputs['Emission Strength'].default_value = t.get('emission', 0.0)
        if slot == 'light':
            nt.links.new(vc.outputs['Color'], bsdf.inputs['Emission Color'])
            bsdf.inputs['Emission Strength'].default_value = 0.0
        m['ll_tile_m'] = tile or 0.0
        mats[slot] = m
    return mats


def signed_volume(ob):
    """Positive when faces wind outward (closed solids); used as a sanity check on generated solids."""
    me = ob.data
    vol = 0.0
    for p in me.polygons:
        vs = [me.vertices[i].co for i in p.vertices]
        for k in range(1, len(vs) - 1):
            vol += vs[0].dot(vs[k].cross(vs[k + 1])) / 6.0
    return vol
