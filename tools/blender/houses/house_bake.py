"""Last Light house kit: baked vertex shading (realism refinement pass).

The game renders with no ambient occlusion, no bounce light and no weathering layer, and Cycles has all three; that is
the main reason a house that looks finished in Blender reads as "pasted together" in the game. This pass bakes, into the
house's own vertex colours (COLOR_0, which already carries its palette colours), what a real house shows at the
distance a rider sees it from:

  * ambient occlusion from the house's own geometry and the ground (raycast in house-local metres): the soft dark
    under eaves and porch roofs, inside window and door reveals, at inside corners, the corners of the rooms behind the
    glass, the ground line;
  * weathering by the family's upkeep (fresh / average / tired): rain-splash darkening at the foot of walls,
    sun-fading of one exposure, chalky roofs and trim;
  * macro variation: low-frequency, per-house value and hue drift over siding, brick, shingles and concrete, so a
    2 m texture tile never reads as one uniform sheet.

Restrained on purpose: the Prologue is a cared-for neighbourhood in August 2011. No cracks, no grime decals.

The shading lives on a vertex grid (about 1 m on walls), and the game interpolates it linearly across each triangle, so
it must never hold anything smaller than that grid: a dark corner left by a 30 cm object becomes a metre-wide diagonal
smear in the game (where a facade in shade is lit only by the flat sky fill and nothing hides it). So, on the gridded
surfaces (siding, brick, roofs, concrete):
  * only large occluders shade them: faces of at least OCC_BIG area and width (roof planes, porch roofs and ceilings,
    walls, chimneys, the ground). Door hoods, lanterns, downspouts, posts, railings, shutters, trim, meters and AC units
    do not: their real shadow is smaller than the grid can hold;
  * each grid point's occlusion is the average over its own neighbourhood (a disk of a third of the grid spacing), a
    low-pass filter matched to the grid, so neighbouring points never differ by a step the interpolation would draw
    as a diamond;
  * no sill streaks (a sub-grid feature).
Rooms, trim and hardware keep the full occlusion of everything (their faces are small or their corners are the point).
"""
import math
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

# how strongly occlusion darkens each slot (glass and lamps are not shaded; rooms most: they are lit through one window)
AO_STRENGTH = {'siding': .78, 'brick': .7, 'roof': .55, 'concrete': .7, 'paint': .7, 'metal': .6, 'bare': .45, 'interior': .95}
TESS = {0: {'siding': .95, 'brick': .95, 'roof': 1.4, 'concrete': 1.2, 'interior': 1.5},
        1: {'siding': 1.7, 'brick': 1.7, 'roof': 2.6, 'concrete': 2.2},
        2: {'siding': 3.5, 'brick': 3.5, 'roof': 5.0}}
RAYS = {0: 28, 1: 14, 2: 8}
REACH = {0: 2.2, 1: 2.2, 2: 2.6}
# gridded surfaces: rays per neighbourhood sample, and which occluders are large enough to shade them
GRIDDED = ('siding', 'brick', 'roof', 'concrete')
RAYS_F = {0: 12, 1: 8, 2: 6}
OCC_BIG = {'area': 2.0, 'width': .7}         # m², m (in-plane extents of the occluding face, before tessellation)
RING = [(0.0, 0.0)] + [(math.cos(a), math.sin(a)) for a in [i * math.tau / 6 + .26 for i in range(6)]]


def _hash(*a):
    h = 2166136261
    for x in a:
        h = ((h ^ (int(x) & 0xffffffff)) * 16777619) & 0xffffffff
    return h / 4294967296.0


def _vnoise(p, freq, seed):
    """Smooth 3D value noise in [-1, 1]."""
    x, y, z = p[0] * freq, p[1] * freq, p[2] * freq
    xi, yi, zi = math.floor(x), math.floor(y), math.floor(z)
    fx, fy, fz = x - xi, y - yi, z - zi
    sx, sy, sz = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy), fz * fz * (3 - 2 * fz)
    def h(i, j, k):
        return _hash(xi + i, yi + j, zi + k, seed) * 2 - 1
    c00 = h(0, 0, 0) * (1 - sx) + h(1, 0, 0) * sx
    c10 = h(0, 1, 0) * (1 - sx) + h(1, 1, 0) * sx
    c01 = h(0, 0, 1) * (1 - sx) + h(1, 0, 1) * sx
    c11 = h(0, 1, 1) * (1 - sx) + h(1, 1, 1) * sx
    return (c00 * (1 - sy) + c10 * sy) * (1 - sz) + (c01 * (1 - sy) + c11 * sy) * sz


def _dirs(n):
    """Cosine-weighted hemisphere directions about +Z (a fixed, well-spread set)."""
    out = []
    g = math.pi * (3 - math.sqrt(5))
    for i in range(n):
        r = math.sqrt((i + .5) / n)
        a = i * g
        out.append((r * math.cos(a), r * math.sin(a), math.sqrt(max(0.0, 1 - r * r))))
    return out


def _basis(nrm):
    n = Vector(nrm)
    t = Vector((1, 0, 0)) if abs(n.x) < .9 else Vector((0, 1, 0))
    u = n.cross(t).normalized()
    v = n.cross(u)
    return u, v, n


def _is_big(P):
    """A planar face large enough for its occlusion to live on the bake grid (area and narrowest in-plane extent)."""
    P = [np.asarray(p, dtype=float) for p in P]
    n = np.zeros(3)
    for i in range(len(P)):
        n += np.cross(P[i], P[(i + 1) % len(P)])
    area = np.linalg.norm(n) / 2
    if area < OCC_BIG['area']:
        return False
    u, v, _ = _basis(n / max(1e-12, np.linalg.norm(n)))
    eu = max(float(np.dot(p, u)) for p in P) - min(float(np.dot(p, u)) for p in P)
    ev = max(float(np.dot(p, v)) for p in P) - min(float(np.dot(p, v)) for p in P)
    return min(eu, ev) >= OCC_BIG['width']


def _bvh(verts, faces):
    """BVH of the given faces plus the lot ground (0.5 cm below grade)."""
    vlist = [Vector(v) for v in verts]
    polys = [list(f[0]) for f in faces]
    g0 = len(vlist)
    G = 40.0
    vlist += [Vector((-G, -.005, -G)), Vector((G, -.005, -G)), Vector((G, -.005, G)), Vector((-G, -.005, G))]
    polys.append([g0, g0 + 3, g0 + 2, g0 + 1])
    return BVHTree.FromPolygons(vlist, polys, all_triangles=False, epsilon=0.0)


def _occlusion(bvh, origin, u, v, w, dirs, rot, reach, wall_like):
    """1 - weighted fraction of the hemisphere (about w) blocked within reach."""
    cr, sr = math.cos(rot), math.sin(rot)
    occ, used = 0.0, 0
    for (dx, dy, dz) in dirs:
        # on outside walls, rays that skim the wall only find the thin trim around windows (2-3 cm proud): at the bake
        # grid's spacing that would smear into blotches, so walls look out at least ~25 deg from the wall
        if wall_like and dz < .42:
            continue
        used += 1
        rx, ry = dx * cr - dy * sr, dx * sr + dy * cr
        hit = bvh.ray_cast(origin, u * rx + v * ry + w * dz, reach)
        # (walls: hits nearer than 18 cm are trim and shutters, whose own shadow is a hairline, not a metre)
        if hit[0] is not None and not (wall_like and hit[3] < .18):
            occ += (1 - hit[3] / reach) ** .6
    return 1 - occ / max(1, used)


def bake(mb, house, lod):
    """Tessellate, raycast occlusion, weather and vary; leaves per-corner colours on mb.faces."""
    # occluders, from the faces as built (before the grid): everything, and only the large ones (for gridded surfaces)
    occl = [f for f in mb.faces if f[1] not in ('glass', 'light')]
    bvh = _bvh(mb.verts, occl)
    bvh_big = _bvh(mb.verts, [f for f in occl if _is_big([mb.verts[i] for i in f[0]])])
    mb.tessellate(TESS[lod])
    verts = mb.verts
    dirs = _dirs(RAYS[lod])
    dirs_f = _dirs(RAYS_F[lod])
    reach = REACH[lod]
    spacing = TESS[lod]
    h = house.h
    care = house.care
    wear = {'fresh': .35, 'average': .9, 'tired': 1.3}[care]
    seed = int(h['seeds'][0] * 1e6) % 100000
    sun_az = h['seeds'][1] * math.tau                 # which exposure this family's paint has faded on
    sun_dir = (math.cos(sun_az), 0.0, math.sin(sun_az))
    cache = {}
    out = []
    for f in mb.faces:
        idx, slot, uv, col, smooth = f
        if slot not in AO_STRENGTH or not isinstance(col, tuple):
            out.append(f)
            continue
        P = [verts[i] for i in idx]
        a = np.subtract(P[1], P[0])
        b = np.subtract(P[2], P[0])
        n = np.cross(a, b)
        if len(P) > 3 and np.linalg.norm(n) < 1e-10:
            n = np.cross(np.subtract(P[2], P[0]), np.subtract(P[3], P[0]))
        ln = np.linalg.norm(n)
        if ln < 1e-12:
            out.append(f)
            continue
        n = n / ln
        cen = np.mean(P, axis=0)
        u, v, w = _basis(n)
        cols = []
        wall_like = slot in ('siding', 'brick', 'concrete') and abs(n[1]) < .35
        gridded = slot in GRIDDED and slot in spacing
        for p in P:
            key = (round(p[0], 3), round(p[1], 3), round(p[2], 3), round(n[0], 2), round(n[1], 2), round(n[2], 2))
            ao = cache.get(key)
            if ao is None:
                inward = cen - np.asarray(p)
                d = np.linalg.norm(inward)
                o = np.asarray(p) + n * .006 + (inward / d * min(.02, d * .25) if d > 1e-6 else 0)
                rot = _hash(int(p[0] * 997), int(p[1] * 991), int(p[2] * 983)) * math.tau   # per-point rotation of the set
                if gridded:
                    # the neighbourhood average: samples on a disk of a third of the grid spacing around the point
                    # (skipping any the point cannot reach along its own surface), large occluders only
                    rad = spacing[slot] / 3
                    samples = []
                    for (cx, cy) in RING:
                        q = np.asarray(o) + (np.asarray(u) * cx + np.asarray(v) * cy) * rad
                        if cx or cy:
                            seg = q - o
                            ls = float(np.linalg.norm(seg))
                            if bvh_big.ray_cast(Vector(o), Vector(seg / ls), ls)[0] is not None:
                                continue
                        samples.append(Vector(q))
                    ao = sum(_occlusion(bvh_big, q, u, v, w, dirs_f, rot + k * 1.7, reach, wall_like) for k, q in enumerate(samples)) / len(samples)
                else:
                    ao = _occlusion(bvh, Vector(o), u, v, w, dirs, rot, reach, wall_like)
                cache[key] = ao
            k = AO_STRENGTH[slot]
            shade = (1 - k) + k * (ao ** 1.15)
            c = list(col)
            vert = abs(n[1]) < .35
            # macro variation (per house, low frequency)
            if slot in ('siding', 'brick', 'roof', 'concrete'):
                fr, amp = {'siding': (.32, .025), 'brick': (.55, .05), 'roof': (.45, .075), 'concrete': (.7, .06)}[slot]
                m = _vnoise(p, fr, seed) * amp + _vnoise(p, fr * 3.1, seed + 7) * amp * .45
                hue = _vnoise(p, fr * .7, seed + 13) * amp * .35
                c = [c[0] * (1 + m + hue), c[1] * (1 + m), c[2] * (1 + m - hue)]
            # sun fade: one exposure of the siding and trim slightly lighter and chalkier (more on tired houses)
            if slot in ('siding', 'paint') and vert:
                facing = max(0.0, n[0] * sun_dir[0] + n[2] * sun_dir[2])
                fade = facing * .035 * wear
                lum = (c[0] + c[1] + c[2]) / 3
                c = [ci + (lum * 1.08 - ci) * fade * 2.2 + fade * .05 for ci in c]
            if slot == 'roof':
                fade = .03 * wear
                lum = (c[0] + c[1] + c[2]) / 3
                c = [ci + (lum - ci) * fade * 3 + fade * .06 for ci in c]
            # rain splash at the foot of walls (warm grey-brown), stronger on tired houses
            if slot in ('siding', 'brick', 'concrete', 'paint') and vert and p[1] < .7:
                t = max(0.0, 1 - p[1] / .7) ** 1.6
                dirt = t * .09 * wear
                c = [c[0] * (1 - dirt) + .2 * dirt * .5, c[1] * (1 - dirt) + .18 * dirt * .5, c[2] * (1 - dirt * 1.1) + .14 * dirt * .5]
            c = [max(0.0, min(1.0, ci * shade)) for ci in c]
            cols.append(tuple(c))
        out.append((idx, slot, uv, cols, smooth))
    mb.faces = out
    return {'aoPoints': len(cache), 'tris': mb.tris()}
