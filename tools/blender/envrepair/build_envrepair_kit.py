"""Targeted play-equipment and toy repairs for the ?envrepair benchmark: the details kit's trampoline, swing set, big wheel
and wagon rebuilt with the corrections the review asked for, in the same piece frames, on the same atlas and materials
(dt_A, dt_cut), so the game swaps geometry only (placement, settling, colours and LODs are the details benchmark's).

    python3 tools/blender/envrepair/build_envrepair_kit.py

  trampoline  W-legs 45 mm instead of 38 mm, T-sockets where they meet the frame, the base U on plastic feet on the ground;
              the enclosure poles run down beside the uprights and clamp to them (two brackets each) instead of starting
              in mid-air; smoother tubes and pad
  swing       legs 48 mm, plastic foot caps on the ground, swing hangers (clamp + shackle) on the top bar, belt seats with
              a real thickness (9 mm) and their chain clips
  big wheel   a moulded body with rounded sections, tread ribs on the front tyre, pedal blocks on crank arms, axle caps
  wagon       a tray with wall thickness and a rolled rim, hub caps, axle nuts, the handle's yoke
Writes assets/source/envrepair/envrepair.kit.blend, dist/assets/envrepair/envrepair.kit.glb, build-stats.json.
"""
import json, math, os, sys
import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender', 'details'))
import build_details as DB          # noqa: E402  (the details kit's helpers, atlas and conventions)

BP = DB.BP
BLEND = os.path.join(ROOT, 'assets', 'source', 'envrepair', 'envrepair.kit.blend')
OUT = os.path.join(ROOT, 'dist', 'assets', 'envrepair', 'envrepair.kit.glb')
STATS = os.path.join(ROOT, 'assets', 'source', 'envrepair', 'build-stats.json')
tube, box, lathe, swatch, join, dup, smooth, obj_from, loft, rrect, panel, decimate, wheel = (
    DB.tube, DB.box, DB.lathe, DB.swatch, DB.join, DB.dup, DB.smooth, DB.obj_from, DB.loft, DB.rrect, DB.panel, DB.decimate, DB.wheel)


def log(*a):
    print('[envrepair kit]', *a, flush=True)


# ================================================================================================== trampoline
def build_trampoline():
    out = {}
    for q in (0, 1, 2):
        segs = (64, 32, 14)[q]
        ts = (12, 8, 5)[q]
        ps = []
        R, Y = 1.8, .85
        ring = tube('tr.frame', [(R * math.cos(a), Y, R * math.sin(a)) for a in [i / segs * 2 * math.pi for i in range(segs + 1)]], .0215, ts, caps=False)
        swatch(ring, 'galv')
        ps.append(smooth(ring, 50))
        for k in range(3):
            a0, a1 = (k * 120 - 15), (k * 120 + 45)
            ups = []
            for a in (a0, a1):
                ar = math.radians(a)
                ca, sa = math.cos(ar), math.sin(ar)
                top = (R * ca, Y - .035, R * sa)
                bot = (R * 1.015 * ca, .07, R * 1.015 * sa)
                up = tube('tr.leg', [top, bot], .0225, ts)
                swatch(up, 'galv')
                ps.append(smooth(up, 50))
                # the T-socket welded to the frame: a short sleeve along the ring, the upright's top inside it
                tg = (-sa, 0, ca)
                sock = tube('tr.socket', [(R * ca - tg[0] * .055, Y - .005, R * sa - tg[2] * .055), (R * ca + tg[0] * .055, Y - .005, R * sa + tg[2] * .055)], .027, ts)
                swatch(sock, 'galv')
                drop = tube('tr.socket', [(R * ca, Y - .005, R * sa), (R * ca, Y - .075, R * sa)], .027, ts)
                swatch(drop, 'galv')
                ps += [sock, drop]
                ups.append((R * 1.015 * ca, .07, R * 1.015 * sa))
            # the W-leg's base: down from each upright through a bend to a U along the ground, on plastic feet
            (x0, _, z0), (x1, _, z1) = ups
            mx, mz = (x0 + x1) / 2 * .955, (z0 + z1) / 2 * .955
            pts = [(x0, .07, z0), (x0 * .995, .035, z0 * .995), (x0 * .97 + mx * .03, .026, z0 * .97 + mz * .03), (mx, .026, mz),
                   (x1 * .97 + mx * .03, .026, z1 * .97 + mz * .03), (x1 * .995, .035, z1 * .995), (x1, .07, z1)]
            base = tube('tr.base', pts, .0225, ts)
            swatch(base, 'galv')
            ps.append(smooth(base, 50))
            for (fx, fz) in ((x0 * .985 + mx * .015, z0 * .985 + mz * .015), (x1 * .985 + mx * .015, z1 * .985 + mz * .015), (mx, mz)):
                ft = lathe('tr.foot', [(0, 0), (.034, 0), (.034, .006), (.028, .012), (0, .012)], max(8, ts), fx, 0, fz)
                swatch(ft, 'plastic_black')
                ps.append(ft)
        if q < 2:
            ns = 72 if q == 0 else 36
            for k in range(ns):
                a = k / ns * 2 * math.pi
                sp = tube('tr.spring', [(R * .985 * math.cos(a), Y - .005, R * .985 * math.sin(a)), (1.64 * math.cos(a), Y - .01, 1.64 * math.sin(a))], .009, 5 if q == 0 else 3, caps=False)
                swatch(sp, 'spring_steel')
                ps.append(sp)
        mat = lathe('tr.mat', [(0, Y - .012), (1.64, Y - .012)], segs, cap=False)
        DB.face_dir(mat, DB.UP)
        DB.rect_map(mat, DB.LAY['tiles']['mat'], lambda x, y, z, n: ((x / 1.72 + 1) / 2, (z / 1.72 + 1) / 2))
        ps.append(mat)
        pad = lathe('tr.pad', [(1.58, Y + .022), (1.60, Y + .04), (1.96, Y + .042), (1.995, Y + .03), (2.005, Y + .0), (1.995, Y - .05), (1.97, Y - .065)], segs, cap=False)
        swatch(pad, 'pad_blue')
        DB.face_dir(pad, lambda c: tuple(Vector((c.x, c.y - (Y - .015), c.z)) - Vector(DB.radial(c, 1.78))))
        pad_in = lathe('tr.pad.under', [(1.58, Y + .022), (1.97, Y - .065)], segs, cap=False)
        DB.face_dir(pad_in, DB.DOWN)
        swatch(pad_in, 'pad_blue')
        ps += [smooth(pad, 60), pad_in]
        # enclosure poles: beside each upright from a clamp 0.30 m above the ground, curving out a little to the top ring
        for k in range(6):
            a = math.radians([-15, 45, 105, 165, 225, 285][k])
            ca, sa = math.cos(a), math.sin(a)
            r0 = R * 1.015 + .05
            pts = [(r0 * ca, .28, r0 * sa), (r0 * ca, Y + .05, r0 * sa), (R * 1.05 * ca, 1.6, R * 1.05 * sa), (R * 1.0 * ca, 2.5, R * 1.0 * sa)]
            pole = tube('tr.pole', pts, .0215, ts)
            swatch(pole, 'galv')
            foam = tube('tr.foam', [(r0 * ca, Y + .12, r0 * sa), (R * 1.05 * ca, 1.6, R * 1.05 * sa), (R * 1.0 * ca, 2.42, R * 1.0 * sa)], .036, ts)
            swatch(foam, 'foam')
            cap = lathe('tr.polecap', [(0, 0), (.024, 0), (.024, .03), (.012, .045), (0, .046)], max(6, ts), R * ca, 2.5, R * sa)
            swatch(cap, 'plastic_black')
            ps += [smooth(pole, 50), smooth(foam, 50), cap]
            # two clamps: pole to upright (a short strap and its bolt)
            for y in (.34, .70):
                lx, lz = R * 1.015 * ca - (R * 1.015 * ca - R * ca) * (y - .07) / (Y - .105), R * 1.015 * sa - (R * 1.015 * sa - R * sa) * (y - .07) / (Y - .105)
                strap = tube('tr.clamp', [(lx, y, lz), (r0 * ca, y, r0 * sa)], .013, 6)
                swatch(strap, 'galv')
                ps.append(strap)
        tr = tube('tr.top', [(R * math.cos(a), 2.5, R * math.sin(a)) for a in [i / segs * 2 * math.pi for i in range(segs + 1)]], .013, (8, 5, 3)[q], caps=False)
        swatch(tr, 'foam')
        ps.append(tr)
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
        o = join(ps, f'trampoline.lod{q}')
        if q == 2:
            decimate(o, .55)
        out[f'trampoline.lod{q}'] = o
        out[f'trampoline.net.lod{q}'] = net
    return out


# ================================================================================================== swing set
def build_swing():
    out = {}
    for q in (0, 1):
        segs = 14 if q == 0 else 8
        ps = []
        for s in (-1, 1):
            x = s * 1.6
            for z0, z1 in ((-.92, -.02), (.92, .02)):
                leg = tube('sw.leg', [(x, .03, z0), (x, 2.27, z1)], .024, segs)
                swatch(leg, 'swing_green')
                ps.append(smooth(leg, 50))
                foot = lathe('sw.foot', [(0, 0), (.036, 0), (.036, .012), (.030, .045), (0, .045)], segs, x, 0, z0)
                swatch(foot, 'plastic_black')
                ps.append(foot)
                stake = tube('sw.anchor', [(x + .05 * (1 if z0 < 0 else 1), .03, z0), (x + .06, .006, z0)], .006, 5)
                swatch(stake, 'galv')
                ps.append(stake)
            br = tube('sw.brace', [(x, .72, -.61), (x, .72, .61)], .019, segs)
            swatch(br, 'swing_green')
            ps.append(br)
            bk = box('sw.bracket', (x, 2.27, 0), (.10, .14, .16), bevel=.025 if q == 0 else 0)
            swatch(bk, 'swing_green')
            ps.append(bk)
            bolt = tube('sw.bolt', [(x - .07, 2.27, 0), (x + .07, 2.27, 0)], .008, 6)
            swatch(bolt, 'galv')
            ps.append(bolt)
        top = tube('sw.top', [(-1.78, 2.3, 0), (1.78, 2.3, 0)], .033, segs)
        swatch(top, 'swing_green')
        ps.append(smooth(top, 50))
        for x in (-1.78, 1.78):
            cap = lathe('sw.cap', [(0, -.012), (.037, -.012), (.037, .01), (0, .014)], segs, x, 2.3, 0, axis='x')
            swatch(cap, 'plastic_black')
            ps.append(cap)
        for xc in (-.7, .5):
            for s in (-1, 1):
                x = xc + s * .2
                # the hanger: a clamp round the bar and a shackle below it
                cl = lathe('sw.hanger', [(0, -.022), (.041, -.022), (.041, .022), (0, .022)], 10, x, 2.3, 0, axis='x')
                swatch(cl, 'galv')
                sh = tube('sw.shackle', [(x, 2.26, 0), (x, 2.235, .012), (x, 2.215, 0), (x, 2.235, -.012), (x, 2.26, 0)], .005, 5, caps=False)
                swatch(sh, 'galv')
                ps += [cl, sh]
                for rot in ((1, 0), (0, 1)):
                    w = .012
                    verts = [(x - w, .62, 0), (x + w, .62, 0), (x + w, 2.215, 0), (x - w, 2.215, 0)] if rot[0] else \
                        [(x, .62, -w), (x, .62, w), (x, 2.215, w), (x, 2.215, -w)]
                    ch = obj_from('sw.chain', verts, [(0, 1, 2, 3)], mat='cut')
                    uv = BP._uvl(ch.data)
                    for p in ch.data.polygons:
                        for li, vi in zip(p.loop_indices, p.vertices):
                            v = verts[vi]
                            uv.data[li].uv = (300.02 + (0 if vi in (0, 3) else .96), (v[1] - .62) / .06)
                    ps.append(ch)
                clip = box('sw.clip', (x, .605, 0), (.02, .035, .028), bevel=.006 if q == 0 else 0)
                swatch(clip, 'galv')
                ps.append(clip)
                if q == 0:
                    grip = lathe('sw.grip', [(0, 0), (.016, 0), (.016, .3), (0, .3)], 8, x, .66, 0)
                    swatch(grip, 'plastic_black')
                    ps.append(grip)
            # the belt seat with thickness (a curved slab, 9 mm), its ends wrapped round the chain clips
            n = 10 if q == 0 else 5
            rings = []
            for i in range(n + 1):
                t = i / n
                x = xc - .245 + .49 * t
                y = .58 - .05 * math.sin(math.pi * t)
                rings.append([(x, y + .0045, -.086), (x, y + .0045, .086), (x, y - .0045, .086), (x, y - .0045, -.086)])
            seat = loft('sw.seat', rings)
            swatch(seat, 'plastic_blue')
            ps.append(smooth(seat, 40))
        prof = []
        n = 16 if q == 0 else 6
        for i in range(n + 1):
            t = i / n
            x = 1.66 + 1.5 * t
            y = 1.45 - 1.15 * t + .06 * math.sin(t * math.pi * 2)
            if t > .86:
                y = .35 - (t - .86) * .3
            prof.append((x, y))
        verts, faces = [], []
        for (x, y) in prof:
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
            rail = tube('sw.lrail', [(1.62, 1.6, s * .22), (1.22, .03, s * .26)], .017, segs)
            swatch(rail, 'swing_green')
            ft = lathe('sw.foot', [(0, 0), (.03, 0), (.03, .04), (0, .04)], 10, 1.22, 0, s * .26)
            swatch(ft, 'plastic_black')
            ps += [rail, ft]
        for k in range(1, 5):
            t = k / 5
            y = 1.6 - 1.63 * t
            x = 1.62 - .4 * t
            rung = tube('sw.rung', [(x, y, -.23), (x, y, .23)], .014, 8)
            swatch(rung, 'galv')
            ps.append(rung)
        hookb = tube('sw.slidehook', [(1.6, 1.48, -.2), (1.6, 1.48, .2)], .016, 8)
        swatch(hookb, 'swing_green')
        ps.append(hookb)
        out[f'swing.lod{q}'] = join(ps, f'swing.lod{q}')
    out['swing.lod2'] = decimate(dup(out['swing.lod1'], 'swing.lod2'), .35)
    return out


# ================================================================================================== toys
def build_toys():
    out = {}
    for q in (0, 1):
        segs = 20 if q == 0 else 10
        rr = 4 if q == 0 else 2
        # ---- big wheel
        ps = wheel('bw.front', 0, .27, -.35, .27, .1, rim_sw='plastic_red', tire_sw='plastic_black', segs=40 if q == 0 else 14)
        if q == 0:                                        # tread ribs moulded across the front tyre
            for k in range(20):
                a = k / 20 * 2 * math.pi
                c = (0, .27 + .272 * math.cos(a), -.35 + .272 * math.sin(a))
                rib = box('bw.rib', c, (.085, .012, .02), bevel=.004)
                rib.rotation_euler = (0, 0, 0)
                DB.xform(rib, Matrix.Translation(Vector(DB.G(*c))) @ DB.RX(-a) @ Matrix.Translation(-Vector(DB.G(*c))))
                swatch(rib, 'plastic_black')
                ps.append(rib)
        hub = lathe('bw.hub', [(0, -.075), (.085, -.075), (.1, -.06), (.1, .06), (.085, .075), (0, .075)], max(10, segs // 2), 0, .27, -.35, axis='x')
        swatch(hub, 'plastic_yellow')
        ps.append(smooth(hub, 50))
        for s_ in (-1, 1):
            ps += wheel('bw.rear', s_ * .27, .1, .32, .1, .065, rim_sw='plastic_red', tire_sw='plastic_black', segs=max(10, segs))
            cap = lathe('bw.axlecap', [(0, 0), (.022, 0), (.022, .012), (.012, .02), (0, .02)], 8, s_ * (.27 + .033), .1, .32, axis='x')
            swatch(cap, 'plastic_yellow')
            ps.append(cap)
            crank = tube('bw.crank', [(s_ * .08, .27, -.35), (s_ * .095, .36, -.30)], .013, 6)
            swatch(crank, 'plastic_yellow')
            # the pedal: a rounded block with a ribbed top on its own little axle
            ped = box('bw.pedal', (s_ * .155, .37, -.30), (.085, .03, .055), bevel=.009 if q == 0 else 0)
            swatch(ped, 'plastic_yellow')
            pax = tube('bw.pedalaxle', [(s_ * .095, .365, -.30), (s_ * .115, .368, -.30)], .007, 6)
            swatch(pax, 'iron_black')
            fork = loft('bw.fork', [rrect(s_ * .078, y, z, .036, .062, .4, rr, 'xz') for (y, z) in ((.27, -.35), (.36, -.325), (.44, -.29), (.51, -.265))])
            swatch(fork, 'plastic_red')
            ps += [crank, ped, pax, smooth(fork, 50)]
        ax = tube('bw.axle', [(-.27, .1, .32), (.27, .1, .32)], .009, 6)
        swatch(ax, 'iron_black')
        ps.append(ax)
        secs = [(-.27, .51, .09, .09), (-.22, .40, .11, .10), (-.14, .26, .15, .08), (-.04, .18, .20, .065), (.07, .16, .25, .06), (.20, .16, .34, .068),
                (.31, .168, .46, .078), (.37, .18, .50, .07), (.41, .195, .48, .05)]
        rings = [rrect(0, y, z, w, h, .42, rr, 'xy') for (z, y, w, h) in secs]
        body = loft('bw.body', rings)
        swatch(body, 'plastic_red')
        ps.append(smooth(body, 60))
        path = [(-.02, .2), (.06, .195), (.14, .2), (.22, .22), (.28, .27), (.32, .35), (.335, .45)]
        rings = []
        for (z, y) in path:
            rings.append([(-.17, y + .1, z), (-.158, y + .045, z), (-.12, y + .008, z), (0, y - .012, z), (.12, y + .008, z), (.158, y + .045, z), (.17, y + .1, z),
                          (.145, y + .092, z), (.11, y + .03, z), (0, y + .012, z), (-.11, y + .03, z), (-.145, y + .092, z)])
        seat = loft('bw.seat', rings)
        swatch(seat, 'plastic_yellow')
        ps.append(smooth(seat, 60))
        bar = tube('bw.bar', [(-.23, .6, -.24), (-.17, .585, -.265), (-.06, .575, -.28), (.06, .575, -.28), (.17, .585, -.265), (.23, .6, -.24)], .017, 10)
        swatch(bar, 'plastic_yellow')
        stem = tube('bw.stem', [(0, .5, -.27), (0, .575, -.28)], .023, 10)
        swatch(stem, 'plastic_red')
        ps += [smooth(bar, 50), stem]
        for s_ in (-1, 1):
            g_ = lathe('bw.grip', [(0, 0), (.021, 0), (.023, .01), (.023, .06), (.021, .07), (0, .07)], 10, s_ * .23 - (.07 if s_ > 0 else 0), .6, -.24, axis='x')
            swatch(g_, 'plastic_black')
            ps.append(smooth(g_, 50))
        out[f'toy.bigwheel.lod{q}'] = join(ps, f'toy.bigwheel.lod{q}')
        # ---- wagon: a steel tray with wall thickness, a rolled rim, hub caps, the handle's yoke
        ps = []
        tw, tl, th, ty = .38, .86, .12, .23
        outer, inner = [], []
        for (x, z) in ((-tw / 2, -tl / 2), (tw / 2, -tl / 2), (tw / 2, tl / 2), (-tw / 2, tl / 2)):
            outer.append(((x * .96, ty, z * .97), (x, ty + th, z)))
            inner.append(((x * .96 - .006 * (1 if x > 0 else -1), ty + .006, z * .97 - .006 * (1 if z > 0 else -1)), (x - .006 * (1 if x > 0 else -1), ty + th, z - .006 * (1 if z > 0 else -1))))
        verts = [p for pair in outer for p in pair] + [p for pair in inner for p in pair]
        faces = [(0, 2, 4, 6)[::-1], (8, 10, 12, 14)]
        for k in range(4):
            j = (k + 1) % 4
            faces.append((2 * k, 2 * j, 2 * j + 1, 2 * k + 1))
            faces.append((8 + 2 * k + 1, 8 + 2 * j + 1, 8 + 2 * j, 8 + 2 * k))
            faces.append((2 * k + 1, 2 * j + 1, 8 + 2 * j + 1, 8 + 2 * k + 1))
        tray = obj_from('wg.tray', verts, faces)
        swatch(tray, 'wagon_red')
        rim = tube('wg.rim', [(-tw / 2, ty + th, -tl / 2), (tw / 2, ty + th, -tl / 2), (tw / 2, ty + th, tl / 2), (-tw / 2, ty + th, tl / 2), (-tw / 2, ty + th, -tl / 2)], .0105, 8, caps=False)
        swatch(rim, 'wagon_red')
        ps += [tray, rim]
        for z in (-.3, .3):
            ax = tube('wg.axle', [(-.26, .1, z), (.26, .1, z)], .007, 6)
            br = box('wg.bracket', (0, .17, z), (.30, .11, .032), bevel=.008 if q == 0 else 0)
            swatch(ax, 'iron_black')
            swatch(br, 'iron_black')
            ps += [ax, br]
            for s in (-1, 1):
                ps += wheel('wg.wheel', s * .25, .1, z, .1, .045, rim_sw='wheel_white', tire_sw='tire', segs=28 if q == 0 else 12)
                hc = lathe('wg.hubcap', [(0, 0), (.035, 0), (.035, .006), (.02, .014), (0, .016)], 12 if q == 0 else 6, s * (.25 + .024), .1, z, axis='x')
                swatch(hc, 'chrome')
                ps.append(hc)
        bol = box('wg.bolster', (0, .2, -.3), (.32, .03, .05), bevel=.006 if q == 0 else 0)
        swatch(bol, 'iron_black')
        yoke = tube('wg.yoke', [(-.05, .19, -.36), (0, .2, -.43), (.05, .19, -.36)], .008, 6)
        swatch(yoke, 'iron_black')
        hd = tube('wg.handle', [(0, .2, -.43), (0, .12, -.6), (0, .03, -.95), (0, .028, -1.0)], .0095, 8)
        tg = tube('wg.tgrip', [(-.075, .03, -1.03), (.075, .03, -1.03)], .015, 10)
        swatch(hd, 'iron_black')
        swatch(tg, 'plastic_black')
        ps += [bol, yoke, smooth(hd, 50), smooth(tg, 50)]
        out[f'toy.wagon.lod{q}'] = join(ps, f'toy.wagon.lod{q}')
    for k in ('toy.bigwheel', 'toy.wagon'):
        out[f'{k}.lod2'] = decimate(dup(out[f'{k}.lod1'], f'{k}.lod2'), .3)
    return out


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.name = 'envrepair.kit'
    BP.COLL = bpy.data.collections.new('envrepair')
    sc.collection.children.link(BP.COLL)
    DB.MATS.clear()
    DB.MATS['A'] = BP.material('dt_A')
    DB.MATS['cut'] = BP.material('dt_cut')
    pieces = {}
    for f in (build_trampoline, build_swing, build_toys):
        got = f()
        pieces.update(got)
        log(f.__name__, {k: DB.tris(v) for k, v in got.items()})
    root = bpy.data.objects.new('envrepair.kit', None)
    BP.COLL.objects.link(root)
    root['ll_asset_id'] = 'envrepair.kit'
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = 'Original work for Last Light (procedural Blender build on the details kit\'s atlas)'
    cont = {k[:-5]: DB.contacts(o) for k, o in pieces.items() if k.endswith('.lod0')}
    root['dt_contacts'] = json.dumps(cont)
    for k, o in pieces.items():
        o.name = k
        o.data.name = k
        o.parent = root
    for o in list(BP.COLL.objects):
        if o is not root and o.parent is not root:
            bpy.data.objects.remove(o)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    os.makedirs(os.path.dirname(BLEND), exist_ok=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND, relative_remap=True, compress=True)
    DB.ll_export.export_glb(OUT, export_materials='EXPORT', export_tangents=False)
    old = json.load(open(DB.STATS))['pieces']
    stats = {'blender': bpy.app.version_string, 'pieces': {k: DB.tris(o) for k, o in sorted(pieces.items())},
             'details_kit_pieces': {k: old.get(k) for k in sorted(pieces)}, 'contacts': cont, 'glb_bytes': os.path.getsize(OUT)}
    json.dump(stats, open(STATS, 'w'), indent=1)
    log('wrote', OUT, stats['glb_bytes'])


if __name__ == '__main__':
    main()
