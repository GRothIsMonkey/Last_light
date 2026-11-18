"""Last Light house kit: the authored components (one function per part, shared by every house and every style).

Each part is placed by a frame F = (origin, ex, ey, ez) in house-local coordinates: ex along the wall (left to right
seen from outside), ey up, ez out of the wall. For wall parts the origin is the centre of the rough opening on the
siding plane (t = 0). Dimensions follow docs/art/ENVIRONMENT-STYLE-GUIDE.md 2.2 (doors 0.91 x 2.03 m, garage doors
2.74/4.88 x 2.13 m, casing, sills, 0.9 m railings, risers <= 0.19 m, eaves 0.3-0.45 m, gutters on eaves only,
downspouts to splash blocks, meters on side walls, AC condensers on pads).

lod: 0 = full (near the ride), 1 = mid (simplified trims, flat interior card, no muntins), 2 = far (massing + cards).
"""
import math
import numpy as np
from house_kit import V, norm, lin, mix, Wall, wall_surface

# Interior atlas layout (UV space of mat.interior; textures from house_textures.interior_atlas):
#   cards 0-7: 4 x 2 grid in the top half (each 0.25 x 0.25); strips in the bottom half.
CARD_UV = [(0.25 * (i % 4), 0.75 - 0.25 * (i // 4), 0.25, 0.25) for i in range(8)]   # (u0, v0, du, dv), v up
STRIP_UV = {
    'wall0': (0.0, 0.375, 0.25, 0.125), 'wall1': (0.25, 0.375, 0.25, 0.125), 'wall2': (0.5, 0.375, 0.25, 0.125), 'wall3': (0.75, 0.375, 0.25, 0.125),
    'floor_carpet': (0.0, 0.25, 0.25, 0.125), 'floor_wood': (0.25, 0.25, 0.25, 0.125), 'floor_tile': (0.5, 0.25, 0.25, 0.125), 'ceiling': (0.75, 0.25, 0.25, 0.125),
    'fabric': (0.0, 0.125, 0.25, 0.125), 'sheer': (0.25, 0.125, 0.25, 0.125), 'blinds': (0.5, 0.125, 0.25, 0.125), 'garage': (0.75, 0.125, 0.25, 0.125),
    'garage_wall': (0.0, 0.0, 0.25, 0.125), 'shade': (0.25, 0.0, 0.25, 0.125), 'dark': (0.5, 0.0, 0.25, 0.125), 'glow': (0.75, 0.0, 0.25, 0.125),
}
CARD_ASPECT_M = 2.8   # each card shows a 2.8 x 2.8 m piece of back wall


def P(F, x, y, z=0.0):
    o, ex, ey, ez = F
    return o + ex * x + ey * y + ez * z


def sub(F, x, y, z=0.0):
    o, ex, ey, ez = F
    return (P(F, x, y, z), ex, ey, ez)


def lbox(mb, F, c, size, slot, col=None, skip=()):
    mb.box(c, size, slot, col, skip=skip, frame=F)


def lquad(mb, F, pts, slot, col=None, uv=None, n=None):
    q = [P(F, *p) for p in pts]
    nn = None
    if n is not None:
        o, ex, ey, ez = F
        nn = ex * n[0] + ey * n[1] + ez * n[2]
    return mb.poly(q, slot, col, uv=uv, n=nn)


def rect_uv(region, u0=0, v0=0, u1=1, v1=1):
    a, b, du, dv = region
    return [(a + du * u0, b + dv * v0), (a + du * u1, b + dv * v0), (a + du * u1, b + dv * v1), (a + du * u0, b + dv * v1)]


# ============================================================================================== windows
LITES = {'6/6': ((3, 2), (3, 2)), '6/1': ((3, 2), (1, 1)), '1/1': ((1, 1), (1, 1)), '2/2': ((2, 1), (2, 1)), '9/9': ((3, 3), (3, 3)), '4/4': ((2, 2), (2, 2))}
REVEAL = 0.10


def window(mb, F, W, H, *, lites='6/6', trim=(1, 1, 1), sash_col=None, casing='flat', casing_w=0.09, head='cap', shutters=None,
           shutter_kind='louver', interior=None, lod=0, sill=True, picture=False):
    """A double-hung window in a rough opening W x H (the wall builder cuts the hole and its reveal)."""
    T = trim
    S = sash_col or trim
    hw, hh = W / 2, H / 2
    if lod >= 2:
        # far: the glass/interior card set into the opening, a flat casing ring
        if interior:
            interior_box(mb, F, W, H, interior, lod=2)
        cw = casing_w
        for (x0, x1, y0, y1) in [(-hw - cw, -hw, -hh, hh + cw), (hw, hw + cw, -hh, hh + cw), (-hw - cw, hw + cw, hh, hh + cw), (-hw - cw - .03, hw + cw + .03, -hh - .04, -hh)]:
            lquad(mb, F, [(x0, y0, .02), (x1, y0, .02), (x1, y1, .02), (x0, y1, .02)], 'paint', T, n=(0, 0, 1))
        if shutters:
            for s in (-1, 1):
                x = s * (hw + cw + .2)
                lquad(mb, F, [(x - .19, -hh, .03), (x + .19, -hh, .03), (x + .19, hh, .03), (x - .19, hh, .03)], 'paint', shutters, n=(0, 0, 1))
        return
    # --- frame inside the opening (front and inner faces only; the reveal hides the rest)
    fw, fz0, fz1 = .045, -REVEAL, -.012
    fd, fc = fz1 - fz0, (fz0 + fz1) / 2
    lbox(mb, F, (0, hh - fw / 2, fc), (W, fw, fd), 'paint', S, skip=('+y', '-z'))
    lbox(mb, F, (0, -hh + fw / 2, fc), (W, fw, fd), 'paint', S, skip=('-y', '-z'))
    for s in (-1, 1):
        lbox(mb, F, (s * (hw - fw / 2), 0, fc), (fw, H - 2 * fw, fd), 'paint', S, skip=('+x' if s > 0 else '-x', '-z', '+y', '-y'))
    iw, ih = W - 2 * fw, H - 2 * fw      # inside the frame
    y_lo, y_hi = -hh + fw, hh - fw
    if lod == 0 and not picture:
        meet = (y_lo + y_hi) / 2
        lo_l, up_l = LITES.get(lites, ((1, 1), (1, 1)))
        # upper sash (outer track) and lower sash (inner track)
        for (ya, yb, z0, z1, grid, bottom) in [(meet - .017, y_hi, -.048, -.016, lo_l, .03), (y_lo, meet + .017, -.088, -.054, up_l, .065)]:
            zc, zd = (z0 + z1) / 2, z1 - z0
            st, top = .045, .045
            lbox(mb, F, (0, yb - top / 2, zc), (iw, top, zd), 'paint', S, skip=('+y', '-z'))
            lbox(mb, F, (0, ya + bottom / 2, zc), (iw, bottom, zd), 'paint', S, skip=('-y', '-z'))
            for s in (-1, 1):
                lbox(mb, F, (s * (iw / 2 - st / 2), (ya + bottom + yb - top) / 2, zc - .002), (st, yb - ya - top - bottom, zd), 'paint', S, skip=('+x' if s > 0 else '-x', '-z', '+y', '-y'))
            gx0, gx1, gy0, gy1 = -iw / 2 + st, iw / 2 - st, ya + bottom, yb - top
            gz = zc
            lquad(mb, F, [(gx0, gy0, gz), (gx1, gy0, gz), (gx1, gy1, gz), (gx0, gy1, gz)], 'glass', (0.06, 0.07, 0.07), n=(0, 0, 1))
            nx, ny = grid
            mw, mt = .019, .008
            for k in range(1, nx):
                x = gx0 + (gx1 - gx0) * k / nx
                lbox(mb, F, (x, (gy0 + gy1) / 2, gz + mt / 2 + .002), (mw, gy1 - gy0, mt), 'paint', S, skip=('-z', '+y', '-y'))
            for k in range(1, ny):
                y = gy0 + (gy1 - gy0) * k / ny
                lbox(mb, F, (0, y, gz + mt / 2 + .003), (gx1 - gx0, mw, mt), 'paint', S, skip=('-z', '+x', '-x'))
    else:
        # mid (or a fixed picture window): one glass plane, a meeting rail on double-hungs
        gz = -.05
        lquad(mb, F, [(-iw / 2, y_lo, gz), (iw / 2, y_lo, gz), (iw / 2, y_hi, gz), (-iw / 2, y_hi, gz)], 'glass', (0.06, 0.07, 0.07), n=(0, 0, 1))
        if not picture:
            lbox(mb, F, (0, (y_lo + y_hi) / 2, -.04), (iw, .05, .03), 'paint', S, skip=('-z',))
    # --- casing, sill, head
    cw = casing_w
    ct = .026 if casing == 'flat' else .03
    if casing == 'brick':
        cw = .055
    for s in (-1, 1):
        lbox(mb, F, (s * (hw + cw / 2), 0, ct / 2 - .002), (cw, H, ct), 'paint', T, skip=('-z',))
    hd = cw + .02
    lbox(mb, F, (0, hh + hd / 2, ct / 2), (W + 2 * cw, hd, ct), 'paint', T, skip=('-z',))
    if head == 'cap' and lod == 0:
        lbox(mb, F, (0, hh + hd + .012, ct + .012), (W + 2 * cw + .05, .024, ct + .024), 'paint', T, skip=('-z',))
    if sill:
        lbox(mb, F, (0, -hh - .016, .02), (W + 2 * cw + .06, .032, .08 + REVEAL - .06), 'paint', T, skip=('-z',))
        if casing != 'brick':
            lbox(mb, F, (0, -hh - .032 - .03, ct / 2), (W + 2 * cw - .02, .06, ct), 'paint', T, skip=('-z', '+y'))   # apron
    if shutters:
        shutter_pair(mb, F, W, H, hw + cw, shutters, kind=shutter_kind, lod=lod)
    if interior:
        interior_box(mb, F, W - 2 * fw, H - 2 * fw, interior, lod=lod, dy=0)


def shutter_pair(mb, F, W, H, edge, col, kind='louver', lod=0):
    sw = min(.45, max(.32, W * .36))
    for s in (-1, 1):
        x = s * (edge + .012 + sw / 2)
        G = sub(F, x, 0, .0)
        t = .03
        st = .055
        lbox(mb, G, (0, H / 2 - st / 2, t / 2 - .002), (sw - 2 * st, st, t), 'paint', col, skip=('-z', '+x', '-x'))
        lbox(mb, G, (0, -H / 2 + st / 2, t / 2 - .002), (sw - 2 * st, st, t), 'paint', col, skip=('-z', '+x', '-x'))
        lbox(mb, G, (0, 0, t / 2 - .002), (sw - 2 * st, st * .8, t), 'paint', col, skip=('-z', '+x', '-x'))
        for k in (-1, 1):
            lbox(mb, G, (k * (sw / 2 - st / 2), 0, t / 2), (st, H, t), 'paint', col, skip=('-z',))
        ix = sw / 2 - st
        if lod == 0 and kind == 'louver':
            for half in (-1, 1):
                y0, y1 = (-H / 2 + st, -st * .4) if half < 0 else (st * .4, H / 2 - st)
                n = max(3, int((y1 - y0) / .062))
                for k in range(n):
                    ya = y0 + (y1 - y0) * k / n
                    yb = ya + (y1 - y0) / n
                    # one louver: a slat tilted down and out
                    lquad(mb, G, [(-ix, ya + .004, .006), (ix, ya + .004, .006), (ix, yb, t - .006), (-ix, yb, t - .006)], 'paint', col, n=(0, .5, 1))
                    lquad(mb, G, [(-ix, ya + .004, .006), (-ix, ya + .004 + .012, t - .01), (ix, ya + .004 + .012, t - .01), (ix, ya + .004, .006)], 'paint', mix(col, (0, 0, 0), .25), n=(0, -1, .3))
        else:
            # panel shutters (and every far shutter): the recessed field
            for (ya, yb) in [(-H / 2 + st, -st * .4), (st * .4, H / 2 - st)]:
                lquad(mb, G, [(-ix, ya, t * .45), (ix, ya, t * .45), (ix, yb, t * .45), (-ix, yb, t * .45)], 'paint', col, n=(0, 0, 1))


def interior_box(mb, F, W, H, spec, lod=0, dy=0.0):
    """What you see through the glass: a shallow room (back wall card, side walls, floor, ceiling) and curtains/blinds.
    spec: dict(card=0..7, wall='wall0', floor='floor_carpet', depth=2.4, curtain=None|'pair'|'pair_closed', blinds=0..1,
    fabric=(r,g,b), sill_h=0.9 (sill height above the room floor), garage=False)."""
    card = spec.get('card', 0)
    depth = spec.get('depth', 2.4)
    hw, hh = W / 2, H / 2
    z0 = -REVEAL - .002
    wallR = spec.get('wall', 'wall0')
    floorR = spec.get('floor', 'floor_carpet')
    if spec.get('garage'):
        wallR, floorR = 'garage_wall', 'garage'
    white = (1, 1, 1)
    if lod >= 2:
        u = rect_uv(CARD_UV[card], .3, .25, .7, .75)
        lquad(mb, F, [(-hw, -hh, -.03), (hw, -hh, -.03), (hw, hh, -.03), (-hw, hh, -.03)], 'interior', white, uv=u, n=(0, 0, 1))
        return
    if lod == 1:
        d = .45
        ext = .25
        x0, x1, y0, y1 = -hw - ext, hw + ext, -hh - ext, hh + ext
        cu = CARD_UV[card]
        span = CARD_ASPECT_M
        uu = lambda x: .5 + x / span
        vv = lambda y: .5 + (y + spec.get('card_y', 0)) / span
        lquad(mb, F, [(x0, y0, -d), (x1, y0, -d), (x1, y1, -d), (x0, y1, -d)], 'interior', white,
              uv=[(cu[0] + cu[2] * uu(x0), cu[1] + cu[3] * vv(y0)), (cu[0] + cu[2] * uu(x1), cu[1] + cu[3] * vv(y0)), (cu[0] + cu[2] * uu(x1), cu[1] + cu[3] * vv(y1)), (cu[0] + cu[2] * uu(x0), cu[1] + cu[3] * vv(y1))], n=(0, 0, 1))
        for (a, b, c, d2, n, reg) in [((x0, y0), (x0, y1), 0, 0, (1, 0, 0), wallR), ((x1, y1), (x1, y0), 0, 0, (-1, 0, 0), wallR)]:
            lquad(mb, F, [(a[0], a[1], z0), (b[0], b[1], z0), (b[0], b[1], -d), (a[0], a[1], -d)], 'interior', white, uv=rect_uv(STRIP_UV['shade']), n=n)
        lquad(mb, F, [(x0, y1, z0), (x1, y1, z0), (x1, y1, -d), (x0, y1, -d)], 'interior', white, uv=rect_uv(STRIP_UV['shade']), n=(0, -1, 0))
        lquad(mb, F, [(x0, y0, z0), (x1, y0, z0), (x1, y0, -d), (x0, y0, -d)], 'interior', white, uv=rect_uv(STRIP_UV['shade']), n=(0, 1, 0))
        if spec.get('blinds', 0) > 0:
            b = spec['blinds']
            lquad(mb, F, [(-hw, hh - H * b, z0 - .02), (hw, hh - H * b, z0 - .02), (hw, hh, z0 - .02), (-hw, hh, z0 - .02)], 'interior', white, uv=rect_uv(STRIP_UV['blinds'], 0, 0, 1, b), n=(0, 0, 1))
        return
    # full: a room box seen through the window
    side = spec.get('side', .7)
    sill_h = spec.get('sill_h', .85)
    ceil = spec.get('ceil', .32)
    x0, x1 = -hw - side, hw + side
    y0, y1 = -hh - sill_h, hh + ceil
    zb = -depth
    cu = CARD_UV[card]
    span = CARD_ASPECT_M
    # the back card is centred on the window, its floor line on the room floor (card's bottom = floor)
    uu = lambda x: .5 + x / span
    vv = lambda y: (y - y0) / span
    lquad(mb, F, [(x0, y0, zb), (x1, y0, zb), (x1, y1, zb), (x0, y1, zb)], 'interior', white,
          uv=[(cu[0] + cu[2] * uu(x0), cu[1] + cu[3] * vv(y0)), (cu[0] + cu[2] * uu(x1), cu[1] + cu[3] * vv(y0)), (cu[0] + cu[2] * uu(x1), cu[1] + cu[3] * vv(y1)), (cu[0] + cu[2] * uu(x0), cu[1] + cu[3] * vv(y1))], n=(0, 0, 1))
    wr = STRIP_UV[wallR]
    # side walls: u along depth (dark toward the window wall, as the strip is painted), v up
    for (x, n) in [(x0, (1, 0, 0)), (x1, (-1, 0, 0))]:
        lquad(mb, F, [(x, y0, z0), (x, y0, zb), (x, y1, zb), (x, y1, z0)], 'interior', white,
              uv=[(wr[0], wr[1]), (wr[0] + wr[2], wr[1]), (wr[0] + wr[2], wr[1] + wr[3]), (wr[0], wr[1] + wr[3])], n=n)
    fr = STRIP_UV[floorR]
    lquad(mb, F, [(x0, y0, z0), (x1, y0, z0), (x1, y0, zb), (x0, y0, zb)], 'interior', white,
          uv=[(fr[0], fr[1]), (fr[0] + fr[2], fr[1]), (fr[0] + fr[2], fr[1] + fr[3]), (fr[0], fr[1] + fr[3])], n=(0, 1, 0))
    cr = STRIP_UV['ceiling']
    lquad(mb, F, [(x0, y1, z0), (x0, y1, zb), (x1, y1, zb), (x1, y1, z0)], 'interior', white,
          uv=[(cr[0], cr[1]), (cr[0], cr[1] + cr[3]), (cr[0] + cr[2], cr[1] + cr[3]), (cr[0] + cr[2], cr[1])], n=(0, -1, 0))
    # the inside face of the outer wall around the opening (you can glimpse it at steep angles)
    for (a0, a1, b0, b1) in [(x0, -hw, y0, y1), (hw, x1, y0, y1), (-hw, hw, hh, y1), (-hw, hw, y0, -hh)]:
        lquad(mb, F, [(a0, b0, z0), (a1, b0, z0), (a1, b1, z0), (a0, b1, z0)], 'interior', white, uv=rect_uv(STRIP_UV['shade']), n=(0, 0, -1))
    fab = spec.get('fabric', (0.75, 0.68, 0.58))
    cur = spec.get('curtain')
    zc = z0 - .07
    if cur:
        closed = cur == 'pair_closed'
        pw = (W * (.36 if closed else .2)) + .12
        top, bot = hh + .14, (-hh - .12 if spec.get('long') else -hh + .05)
        for s in (-1, 1):
            xa = s * (hw + .08)
            xb = xa - s * pw
            n = 8
            pts = []
            for k in range(n + 1):
                t = k / n
                x = xa + (xb - xa) * t
                z = zc + (.035 if k % 2 else -.01)
                pts.append((x, z, t))
            for k in range(n):
                (xa_, za, ta), (xb_, zb_, tb) = pts[k], pts[k + 1]
                fr2 = STRIP_UV['fabric']
                uv = [(fr2[0] + fr2[2] * ta, fr2[1]), (fr2[0] + fr2[2] * tb, fr2[1]), (fr2[0] + fr2[2] * tb, fr2[1] + fr2[3]), (fr2[0] + fr2[2] * ta, fr2[1] + fr2[3])]
                shade = .82 + .18 * (k % 2)
                lquad(mb, F, [(xa_, bot, za), (xb_, bot, zb_), (xb_, top, zb_), (xa_, top, za)], 'interior', tuple(c * shade for c in fab), uv=uv, n=(0, 0, 1))
        # rod
        lbox(mb, F, (0, top + .03, zc + .01), (W + .4, .022, .022), 'bare', (.35, .3, .22), skip=('-z',))
    b = spec.get('blinds', 0)
    if b > 0:
        yb = hh - H * b
        lquad(mb, F, [(-hw + .01, yb, z0 - .015), (hw - .01, yb, z0 - .015), (hw - .01, hh, z0 - .015), (-hw + .01, hh, z0 - .015)], 'interior', (1, 1, 1), uv=rect_uv(STRIP_UV['blinds'], 0, 0, 1, b), n=(0, 0, 1))
        lbox(mb, F, (0, yb - .012, z0 - .015), (W - .02, .024, .03), 'paint', (0.85, 0.83, 0.78), skip=('-z',))


# ============================================================================================== doors
def entry_door(mb, F, *, col, trim, style='six', lod=0, storm=False, surround='flat', width=.91, height=2.03, knob=1):
    """Front door in a rough opening width x height (origin at the threshold centre on the wall plane)."""
    w, h = width, height
    T = trim
    rz = -.12      # the door face sits 12 cm inside the siding plane (frame depth)
    if lod >= 2:
        lquad(mb, F, [(-w / 2, 0, -.02), (w / 2, 0, -.02), (w / 2, h, -.02), (-w / 2, h, -.02)], 'paint', col, n=(0, 0, 1))
        lquad(mb, F, [(-w / 2 - .1, 0, .01), (-w / 2, 0, .01), (-w / 2, h + .1, .01), (-w / 2 - .1, h + .1, .01)], 'paint', T, n=(0, 0, 1))
        lquad(mb, F, [(w / 2, 0, .01), (w / 2 + .1, 0, .01), (w / 2 + .1, h + .1, .01), (w / 2, h + .1, .01)], 'paint', T, n=(0, 0, 1))
        lquad(mb, F, [(-w / 2, h, .01), (w / 2, h, .01), (w / 2, h + .1, .01), (-w / 2, h + .1, .01)], 'paint', T, n=(0, 0, 1))
        return
    # jambs (the reveal is cut by the wall); door slab
    lbox(mb, F, (0, h / 2, rz - .0225), (w - .02, h - .01, .045), 'paint', col, skip=('-z',))
    if lod == 0:
        if style == 'six':
            cols = [(-1, 1), (1, 1)]
            rows = [(.12, .62), (.74, 1.36), (1.48, 1.91)]   # (y0, y1) of the three panel rows
            for (y0, y1) in rows:
                for s in (-1, 1):
                    xc = s * .19
                    raised_panel(mb, F, xc, (y0 + y1) / 2, .3, y1 - y0, rz, col)
        elif style == 'craftsman':
            for s in (-1, 1):
                raised_panel(mb, F, s * .19, .5, .3, .7, rz, col)
            raised_panel(mb, F, 0, 1.0, .72, .12, rz, col)
            # three lites up top
            for k in range(3):
                x = -.24 + .24 * k
                lquad(mb, F, [(x - .1, 1.25, rz + .002), (x + .1, 1.25, rz + .002), (x + .1, 1.88, rz + .002), (x - .1, 1.88, rz + .002)], 'glass', (.05, .06, .06), n=(0, 0, 1))
        elif style == 'flush':
            lbox(mb, F, (0, 1.55, rz + .003), (.42, .3, .006), 'glass', (.05, .06, .06), skip=('-z',))
        # hardware: knob, deadbolt, kick plate
        kx = .35 * knob
        mb.cylinder(P(F, kx, .92, rz + .002), P(F, kx, .92, rz + .05), .012, 'bare', (.58, .45, .2), seg=6)
        lbox(mb, F, (kx, .92, rz + .06), (.055, .055, .03), 'bare', (.62, .48, .22), skip=('-z',))
        lbox(mb, F, (kx, 1.06, rz + .008), (.03, .06, .016), 'bare', (.62, .48, .22), skip=('-z',))
        lbox(mb, F, (0, .1, rz + .002), (w - .1, .2, .004), 'bare', (.6, .48, .25), skip=('-z',))
        # threshold
        lbox(mb, F, (0, .012, rz + .06), (w + .04, .024, .16), 'bare', (.55, .5, .42), skip=('-y',))
    # frame inside the reveal
    for s in (-1, 1):
        lbox(mb, F, (s * (w / 2 + .005), h / 2, (rz + 0) / 2 - .01), (.03, h, -rz - .02), 'paint', T, skip=('-z',))
    lbox(mb, F, (0, h + .005, (rz + 0) / 2 - .01), (w + .04, .03, -rz - .02), 'paint', T, skip=('-z',))
    # exterior casing / surround
    cw = .11 if surround != 'flat' else .1
    for s in (-1, 1):
        lbox(mb, F, (s * (w / 2 + .02 + cw / 2), (h + .03) / 2, .015), (cw, h + .03, .03), 'paint', T, skip=('-z',))
    lbox(mb, F, (0, h + .03 + .06, .015), (w + .04 + 2 * cw, .12, .03), 'paint', T, skip=('-z',))
    if surround == 'pediment' and lod == 0:
        # a colonial crosshead: frieze, crown, cap
        lbox(mb, F, (0, h + .25, .03), (w + .04 + 2 * cw + .06, .1, .06), 'paint', T, skip=('-z',))
        lbox(mb, F, (0, h + .315, .05), (w + .04 + 2 * cw + .14, .04, .1), 'paint', T, skip=('-z',))
        for s in (-1, 1):
            lbox(mb, F, (s * (w / 2 + .02 + cw / 2), .1, .04), (cw + .03, .2, .05), 'paint', T, skip=('-z',))
    if storm and lod == 0:
        # aluminium storm door with a full glass lite, in front of the door
        sc = (.86, .85, .8)
        zs = .045
        for s in (-1, 1):
            lbox(mb, F, (s * (w / 2 - .01), h / 2, zs), (.05, h - .02, .03), 'metal', sc, skip=('-z',))
        for y in (.03, h - .03, .95):
            lbox(mb, F, (0, y, zs), (w - .02, .06 if y != .95 else .09, .03), 'metal', sc, skip=('-z',))
        lquad(mb, F, [(-w / 2 + .035, .99, zs - .003), (w / 2 - .035, .99, zs - .003), (w / 2 - .035, h - .06, zs - .003), (-w / 2 + .035, h - .06, zs - .003)], 'glass', (.05, .06, .06), n=(0, 0, 1))
        lquad(mb, F, [(-w / 2 + .035, .06, zs - .004), (w / 2 - .035, .06, zs - .004), (w / 2 - .035, .9, zs - .004), (-w / 2 + .035, .9, zs - .004)], 'glass', (.05, .06, .06), n=(0, 0, 1))
        lbox(mb, F, (.36 * knob, .95, zs + .03), (.03, .14, .03), 'bare', (.7, .7, .68), skip=('-z',))


def raised_panel(mb, F, xc, yc, pw, ph, z, col):
    """A raised (bevelled) door panel on a slab face at depth z."""
    b = .035
    e = .012
    zt = z + e
    x0, x1, y0, y1 = xc - pw / 2, xc + pw / 2, yc - ph / 2, yc + ph / 2
    lquad(mb, F, [(x0 + b, y0 + b, zt), (x1 - b, y0 + b, zt), (x1 - b, y1 - b, zt), (x0 + b, y1 - b, zt)], 'paint', col, n=(0, 0, 1))
    dark = tuple(c * .78 for c in col)
    lite = tuple(min(1, c * 1.06) for c in col)
    lquad(mb, F, [(x0, y0, z + .001), (x1, y0, z + .001), (x1 - b, y0 + b, zt), (x0 + b, y0 + b, zt)], 'paint', lite, n=(0, -1, 1))
    lquad(mb, F, [(x1 - b, y1 - b, zt), (x1, y1, z + .001), (x0, y1, z + .001), (x0 + b, y1 - b, zt)], 'paint', dark, n=(0, 1, 1))
    lquad(mb, F, [(x0, y0, z + .001), (x0 + b, y0 + b, zt), (x0 + b, y1 - b, zt), (x0, y1, z + .001)], 'paint', col, n=(-1, 0, 1))
    lquad(mb, F, [(x1, y0, z + .001), (x1, y1, z + .001), (x1 - b, y1 - b, zt), (x1 - b, y0 + b, zt)], 'paint', col, n=(1, 0, 1))


def garage_door(mb, F, W, H, *, col, lod=0, windows=False, style='raised', z=0.0, origin_at_centre=False):
    """Sectional garage door W x H, face at depth z (origin at the bottom centre unless origin_at_centre)."""
    y0 = -H / 2 if origin_at_centre else 0.0
    if lod >= 2:
        lquad(mb, F, [(-W / 2, y0, z), (W / 2, y0, z), (W / 2, y0 + H, z), (-W / 2, y0 + H, z)], 'paint', col, n=(0, 0, 1))
        return
    rows = 4
    cols = 8 if W > 4 else 4
    sh = H / rows
    shadow = tuple(c * .72 for c in col)
    for r in range(rows):
        ya, yb = y0 + r * sh, y0 + (r + 1) * sh
        # the section: its face, and the joint groove at its top
        lquad(mb, F, [(-W / 2, ya + .008, z), (W / 2, ya + .008, z), (W / 2, yb - .008, z), (-W / 2, yb - .008, z)], 'paint', col, n=(0, 0, 1))
        lquad(mb, F, [(-W / 2, yb - .008, z), (W / 2, yb - .008, z), (W / 2, yb - .008, z - .012), (-W / 2, yb - .008, z - .012)], 'paint', shadow, n=(0, 1, 0))
        lquad(mb, F, [(-W / 2, ya + .008, z - .012), (W / 2, ya + .008, z - .012), (W / 2, ya + .008, z), (-W / 2, ya + .008, z)], 'paint', col, n=(0, -1, 0))
        lquad(mb, F, [(-W / 2, yb - .008, z - .012), (W / 2, yb - .008, z - .012), (W / 2, yb + .008, z - .012), (-W / 2, yb + .008, z - .012)], 'paint', tuple(c * .5 for c in col), n=(0, 0, 1))
        if lod == 0:
            pw = W / cols
            for c in range(cols):
                xc = -W / 2 + pw * (c + .5)
                if windows and r == rows - 1:
                    lquad(mb, F, [(xc - pw * .38, ya + sh * .22, z - .004), (xc + pw * .38, ya + sh * .22, z - .004), (xc + pw * .38, yb - sh * .22, z - .004), (xc - pw * .38, yb - sh * .22, z - .004)], 'glass', (.04, .045, .045), n=(0, 0, 1))
                    continue
                if style == 'raised':
                    raised_panel(mb, F, xc, (ya + yb) / 2, pw * .82, sh * .62, z, col)
        elif windows and r == rows - 1:
            lquad(mb, F, [(-W / 2 + .05, ya + sh * .22, z + .002), (W / 2 - .05, ya + sh * .22, z + .002), (W / 2 - .05, yb - sh * .22, z + .002), (-W / 2 + .05, yb - sh * .22, z + .002)], 'glass', (.04, .045, .045), n=(0, 0, 1))
    # bottom seal
    if lod == 0:
        lbox(mb, F, (0, y0 + .01, z + .006), (W, .02, .012), 'metal', (.08, .08, .08), skip=('-z',))


# ============================================================================================== porch parts
def post(mb, base, top_y, w, col, kind='square', lod=0):
    """A porch post from base (x, y, z) to top_y: square wrapped post with base and cap trim, or a turned column."""
    x, y, z = base
    h = top_y - y
    if lod >= 2:
        mb.box((x, y + h / 2, z), (w, h, w), 'paint', col, skip=('-y', '+y'))
        return
    if kind == 'round' and lod == 0:
        mb.lathe([(w * .62, 0), (w * .62, .07), (w * .5, .1), (w * .44, .16), (w * .4, h - .2), (w * .46, h - .14), (w * .58, h - .1), (w * .62, h - .03), (w * .62, h)], (x, y, z), 'paint', col, seg=10)
        return
    mb.box((x, y + .09, z), (w + .06, .18, w + .06), 'paint', col, skip=('-y',))
    mb.box((x, y + h / 2, z), (w, h - .3, w), 'paint', col, skip=('-y', '+y'))
    mb.box((x, top_y - .07, z), (w + .05, .14, w + .05), 'paint', col, skip=('+y',))
    if lod == 0:
        mb.box((x, y + .2, z), (w + .03, .04, w + .03), 'paint', col, skip=('-y',))
        mb.box((x, top_y - .16, z), (w + .03, .04, w + .03), 'paint', col, skip=('+y',))


def railing(mb, a, b, y, col, lod=0, height=.9, spacing=.105):
    """A porch railing between post faces a and b (x, z at floor height y): top and bottom rails, square balusters."""
    a, b = V(*a), V(*b)
    d = b - a
    L = float(np.linalg.norm(d[[0, 2]]))
    if L < .15:
        return
    ex = norm(V(d[0], 0, d[2]))
    mb.span((a[0], y + height - .03, a[2]), (b[0], y + height - .03, b[2]), .06, .1, 'paint', col)
    if lod >= 2:
        return
    mb.span((a[0], y + .1, a[2]), (b[0], y + .1, b[2]), .05, .07, 'paint', col)
    if lod == 1:
        return
    n = max(1, int(L / spacing))
    for k in range(1, n):
        p = a + ex * (L * k / n)
        mb.box((p[0], y + .1 + (height - .2) / 2 + .02, p[2]), (.038, height - .2, .038), 'paint', col, skip=('-y', '+y'))


def steps(mb, x0, x1, z_front, floor, n, run, slot, col, sides=True, frame_dir=1):
    """n-1 steps descending from a porch/stoop edge at z_front (toward +z) to the ground; floor = top height."""
    for k in range(n - 1):
        top = floor * (n - 1 - k) / n
        za = z_front + run * k
        zb = za + run
        mb.box(((x0 + x1) / 2, top / 2, (za + zb) / 2 + .0), (x1 - x0, top, run), slot, col, skip=('-y', '-z'))


# ============================================================================================== roofs
def gable_roof(mb, cx, cz, a, b, y0, rise, *, ou=(.25, .25), ov=(.4, .4), along_x=True, roof_col, trim, wall_slot='siding', wall_col=None,
               lod=0, gutters=(True, True), gutter_col=(.85, .84, .8), vent=True, ridge=True, gable_walls=(True, True), frieze=True):
    """A gable roof over an a x b rectangle centred (cx, cz) (a along the ridge), wall plate at y0.
    along_x: the ridge runs along x (side gables). ou = rake overhangs at the (-u, +u) ends, ov = eave overhangs on the
    (-v, +v) sides; an overhang of 0 means that edge dies into a wall (no fascia, soffit, rake board or gutter there).
    Returns (eave height at the fascia top, slope)."""
    if along_x:
        M = lambda u, y, v: V(cx + u, y, cz + v)
    else:
        M = lambda u, y, v: V(cx + v, y, cz - u)
    Un, Up = a / 2 + ou[0], a / 2 + ou[1]
    slope = rise / (b / 2)
    top = y0 + rise
    th = .07
    rc = roof_col
    F_h = .2
    for si, s in enumerate((-1, 1)):
        o = ov[si]
        Hb = b / 2 + o
        ye = y0 - o * slope
        e0, e1, r0, r1 = M(-Un, ye, s * Hb), M(Up, ye, s * Hb), M(-Un, top, 0), M(Up, top, 0)
        dn = norm(e0 - r0)
        ua = norm(e1 - e0)
        mb.poly([e0, e1, r1, r0], 'roof', rc, uvmode=(e0, ua, -dn), n=V(0, 1, 0))
        d = V(0, -th, 0)
        outv = M(0, 0, s) - M(0, 0, 0)
        if o > .05:
            mb.quad(e0, e0 + d, e1 + d, e1, 'metal', mix(rc, (0, 0, 0), .2), n=outv)
            # fascia, boxed soffit (vented), frieze, gutter
            mb.box(tuple(M((Up - Un) / 2, ye - th - F_h / 2 + .02, s * (Hb - .015))), ((Un + Up) if along_x else .03, F_h, .03 if along_x else (Un + Up)), 'paint', trim, skip=('-y',))
            y_s = ye - th - F_h + .02
            y_w = y0 - .1
            ua0, ua1 = -Un, Up
            sy = lambda f: y_w + (y_s - y_w) * f
            mb.quad(M(ua0, y_w, s * b / 2), M(ua1, y_w, s * b / 2), M(ua1, y_s, s * (Hb - .03)), M(ua0, y_s, s * (Hb - .03)), 'paint', mix(trim, (0, 0, 0), .06), n=V(0, -1, 0))
            if lod == 0:
                f0, f1 = .35, .6
                mb.quad(M(-Un + .3, sy(f0) - .003, s * (b / 2 + (Hb - .03 - b / 2) * f0)), M(Up - .3, sy(f0) - .003, s * (b / 2 + (Hb - .03 - b / 2) * f0)),
                        M(Up - .3, sy(f1) - .003, s * (b / 2 + (Hb - .03 - b / 2) * f1)), M(-Un + .3, sy(f1) - .003, s * (b / 2 + (Hb - .03 - b / 2) * f1)), 'metal', mix(trim, (0, 0, 0), .35), n=V(0, -1, 0))
            if gutters[si]:
                gutter(mb, lambda u, y, v: M(u + (Up - Un) / 2, y, v), (Un + Up) / 2, Hb, ye - th - .03, s, gutter_col, lod, along_x, b)
        # rake ends of this slope
        for ei, e in enumerate((-1, 1)):
            oe = ou[ei]
            U = Un if e < 0 else Up
            p, q = (e0, r0) if e < 0 else (e1, r1)
            if oe > .05:
                mb.quad(p, q, q + d, p + d, 'paint', trim, n=M(e, 0, 0) - M(0, 0, 0))
                pe = M(e * (U - .015), ye - .1, s * Hb)
                pr = M(e * (U - .015), top - .1, 0)
                mb.span(tuple(pe), tuple(pr), .2, .03, 'paint', trim, skip=())
                if lod <= 1:
                    q0, q1 = M(e * a / 2, ye - th - .2, s * Hb), M(e * a / 2, top - th - .2, 0)
                    q2, q3 = M(e * (U - .03), top - th - .2, 0), M(e * (U - .03), ye - th - .2, s * Hb)
                    mb.quad(q0, q1, q2, q3, 'paint', mix(trim, (0, 0, 0), .08), n=V(0, -1, 0))
            else:
                mb.quad(p, q, q + d, p + d, 'metal', mix(rc, (0, 0, 0), .3), n=M(e, 0, 0) - M(0, 0, 0))
    # gable triangles
    for ei, e in enumerate((-1, 1)):
        if gable_walls[ei] and wall_col is not None:
            g0, g1, g2 = M(e * a / 2, y0, -b / 2), M(e * a / 2, top - .06, 0), M(e * a / 2, y0, b / 2)
            mb.poly([g0, g2, g1], wall_slot, wall_col, n=M(e, 0, 0) - M(0, 0, 0))
            if vent and lod <= 1:
                gable_vent(mb, M, e, a, y0, rise, trim, lod, along_x)
    if ridge:
        ridge_cap(mb, M(-Un, top, 0), M(Up, top, 0), slope, rc, lod)
    return y0 - max(ov) * slope, slope


def ridge_cap(mb, a, b, slope, col, lod=0):
    a, b = V(*a), V(*b)
    ex = norm(b - a)
    side = norm(np.cross(ex, V(0, 1, 0)))
    w = .15
    dy = w * slope
    up = V(0, .022, 0)
    pts = [a + side * w - V(0, dy, 0) + V(0, .01, 0), a + up, a - side * w - V(0, dy, 0) + V(0, .01, 0)]
    qts = [p + (b - a) for p in pts]
    c = mix(col, (0, 0, 0), .08)
    mb.quad(pts[0], qts[0], qts[1], pts[1], 'roof', c, n=side + V(0, 1, 0))
    mb.quad(pts[1], qts[1], qts[2], pts[2], 'roof', c, n=-side + V(0, 1, 0))
    mb.tri(pts[0], pts[1], pts[2], 'roof', c, uvmode=None) if lod == 0 else None
    mb.poly([qts[2], qts[1], qts[0]], 'roof', c, n=ex)


def gutter(mb, M, L, Hb, y_top, s, col, lod, along_x, b):
    """K-style gutter along the eave line v = s*Hb (fascia face), u from -L to L, top at y_top, with end caps."""
    out = M(0, 0, s) - M(0, 0, 0)
    a = M(-L + .01, y_top, s * Hb)
    c = M(L - .01, y_top, s * Hb)
    ex = norm(c - a)
    if lod >= 2:
        mb.span(tuple(a + out * .065 + V(0, -.06, 0)), tuple(c + out * .065 + V(0, -.06, 0)), .12, .12, 'metal', col, skip=())
        return
    prof = [(0.0, 0.0), (0.0, -.11), (.07, -.122), (.112, -.095), (.12, -.045), (.136, -.022), (.13, 0.0)]
    ring = lambda p0: [p0 + out * o + V(0, u, 0) for (o, u) in prof]
    A, B = ring(a), ring(c)
    for k in range(1, len(prof) - 1):
        (o0, u0), (o1, u1) = prof[k], prof[k + 1]
        n = out * (u1 - u0) + V(0, -(o1 - o0), 0)        # outward (away from the trough)
        mb.quad(A[k], B[k], B[k + 1], A[k + 1], 'metal', col, n=n)
    # the trough seen from above (dark) and the end caps
    mb.quad(A[0] + V(0, -.004, 0), B[0] + V(0, -.004, 0), B[-1] + V(0, -.004, 0), A[-1] + V(0, -.004, 0), 'metal', mix(col, (0, 0, 0), .55), n=V(0, 1, 0))
    for (R, sg) in [(A, -1), (B, 1)]:
        mb.poly(R[:-1], 'metal', col, n=ex * sg)


def downspout(mb, top, wall_pt, ground_y, out_dir, col, lod=0, kick=.32):
    """A 2x3 inch downspout: from under the gutter outlet (top), an offset back to the wall (wall_pt, same height or
    lower), down the wall, and an elbow out onto a concrete splash block."""
    top, wall_pt = V(*top), V(*wall_pt)
    o = norm(V(*out_dir))
    w, d = .075, .055
    wp = wall_pt + o * (d / 2 + .01)
    p0 = top
    p1 = top + V(0, -.12, 0)
    p2 = V(wp[0], min(p1[1] - .25, p1[1] - float(np.linalg.norm((p1 - wp)[[0, 2]])) * .7), wp[2])
    p3 = V(wp[0], ground_y + .3, wp[2])
    p4 = V(wp[0], ground_y + .07, wp[2]) + o * kick
    if lod >= 2:
        mb.span(tuple(p2), tuple(p3), w, d, 'metal', col)
        return
    side = norm(np.cross(o, V(0, 1, 0)))
    for (a, b) in [(p0, p1), (p1, p2), (p2, p3), (p3, p4)]:
        mb.span(tuple(a), tuple(b), w, d, 'metal', col, up=tuple(side), skip=())
    if lod == 0:
        for y in (ground_y + 1.1, ground_y + 2.5, ground_y + 3.9):
            if y < p2[1] - .2:
                mb.box((wp[0], y, wp[2]), (.09, .02, .075) if abs(o[2]) > .5 else (.075, .02, .09), 'metal', col)
        sb = p4 + o * .22
        mb.box((sb[0], ground_y + .025, sb[2]), (.3, .05, .3), 'concrete', (.82, .8, .76), skip=('-y',))


def gable_vent(mb, M, e, a, y0, rise, trim, lod, along_x):
    """A louvred gable vent in the triangle at end e."""
    yc = y0 + rise * .45
    hgt = min(.62, rise * .42)
    wid = hgt * .78
    out = M(e, 0, 0) - M(0, 0, 0)
    c = M(e * (a / 2 + .012), yc, 0)
    # trim ring and a dark louvred face
    side = norm(np.cross(V(0, 1, 0), out))
    def pt(sx, sy, so=0):
        return c + side * sx + V(0, sy, 0) + out * so
    mb.quad(pt(-wid / 2 - .05, -hgt / 2 - .05, .01), pt(wid / 2 + .05, -hgt / 2 - .05, .01), pt(wid / 2 + .05, hgt / 2 + .05, .01), pt(-wid / 2 - .05, hgt / 2 + .05, .01), 'paint', trim, n=out)
    mb.quad(pt(-wid / 2, -hgt / 2, .015), pt(wid / 2, -hgt / 2, .015), pt(wid / 2, hgt / 2, .015), pt(-wid / 2, hgt / 2, .015), 'metal', mix(trim, (0, 0, 0), .55), n=out)
    if lod == 0:
        n = 7
        for k in range(n):
            y = -hgt / 2 + hgt * (k + .7) / n
            mb.quad(pt(-wid / 2, y - .035, .018), pt(wid / 2, y - .035, .018), pt(wid / 2, y, .045), pt(-wid / 2, y, .045), 'paint', trim, n=out + V(0, .6, 0))


def hip_roof(mb, cx, cz, Wd, Dd, y0, rise, o, *, roof_col, trim, wall_col=None, wall_slot='siding', lod=0, gutters=True, gutter_col=(.85, .84, .8), frieze=True):
    along = Wd >= Dd
    if along:
        a, b = Wd, Dd
        M = lambda u, y, v: V(cx + u, y, cz + v)
    else:
        a, b = Dd, Wd
        M = lambda u, y, v: V(cx + v, y, cz - u)
    L, H = a / 2 + o, b / 2 + o
    slope = rise / (b / 2)
    r = max(0.0, (a - b) / 2)
    ye = y0 - o * slope
    top = y0 + rise
    th = .07
    E = [M(-L, ye, H), M(L, ye, H), M(L, ye, -H), M(-L, ye, -H)]
    R0, R1 = M(-r, top, 0), M(r, top, 0)
    rc = roof_col
    planes = [(E[0], E[1], R1, R0), (E[2], E[3], R0, R1)]
    for (p, q, rr, ss) in planes:
        ua = norm(q - p)
        dn = norm(np.cross(ua, V(0, 1, 0)))
        if float(np.dot(dn, (p + q) / 2 - (rr + ss) / 2)) < 0:
            dn = -dn
        mb.poly([p, q, rr, ss], 'roof', rc, uvmode=(p, ua, -dn), n=V(0, 1, 0))
    for (p, q, apex) in [(E[1], E[2], R1), (E[3], E[0], R0)]:
        ua = norm(q - p)
        dn = norm(np.cross(ua, V(0, 1, 0)))
        if float(np.dot(dn, (p + q) / 2 - apex)) < 0:
            dn = -dn
        mb.poly([p, q, apex], 'roof', rc, uvmode=(p, ua, -dn), n=V(0, 1, 0))
    d = V(0, -th, 0)
    for i in range(4):
        p, q = E[i], E[(i + 1) % 4]
        outn = norm(np.cross(q - p, V(0, 1, 0)))
        mb.quad(p, p + d, q + d, q, 'metal', mix(rc, (0, 0, 0), .2), n=-outn if np.dot(-outn, (p + q) / 2 - V(cx, 0, cz)) > 0 else outn)
    F_h = .2
    y_s = ye - th - F_h + .02
    for i in range(4):
        p, q = E[i], E[(i + 1) % 4]
        mid = (p + q) / 2
        outn = norm(V(mid[0] - cx, 0, mid[2] - cz))
        if abs(outn[0]) > abs(outn[2]):
            outn = V(np.sign(outn[0]), 0, 0)
        else:
            outn = V(0, 0, np.sign(outn[2]))
        ln = float(np.linalg.norm(q - p))
        size = (ln + .04, F_h, .03) if abs(outn[2]) > .5 else (.03, F_h, ln + .04)
        mb.box(tuple(mid + V(0, -th - F_h / 2 + .02, 0) - outn * .015), size, 'paint', trim, skip=('-y',))
        # soffit ring piece (a trapezoid under the overhang)
        wall_half = (a / 2 if abs(outn[2]) > .5 and along else b / 2 if abs(outn[2]) > .5 else b / 2 if along else a / 2)
        inner = []
        for pt in (p, q):
            v = V(pt[0], y_s, pt[2])
            inner.append(v)
        # inner corners at the wall line
        c0 = V(cx, y_s, cz)
        hw_x = (Wd / 2)
        hw_z = (Dd / 2)
        ip = V(np.clip(p[0], cx - hw_x, cx + hw_x), y_s, np.clip(p[2], cz - hw_z, cz + hw_z))
        iq = V(np.clip(q[0], cx - hw_x, cx + hw_x), y_s, np.clip(q[2], cz - hw_z, cz + hw_z))
        ip[1] = iq[1] = y0 - .1
        mb.poly([V(p[0], y_s, p[2]) - outn * .03, V(q[0], y_s, q[2]) - outn * .03, iq, ip], 'paint', mix(trim, (0, 0, 0), .06), n=V(0, -1, 0))
        if gutters and (abs(outn[2]) > .5 if along else abs(outn[0]) > .5):
            pass
    if gutters:
        for s in (-1, 1):
            gutter(mb, M, L, H, ye - th - .03, s, gutter_col, lod, along, b)
    # hip and ridge caps
    c = mix(rc, (0, 0, 0), .08)
    if r > .01:
        ridge_cap(mb, R0, R1, slope, rc, lod)
    for (e, rr) in [(E[0], R0), (E[1], R1), (E[2], R1), (E[3], R0)]:
        dvec = rr - e
        side = norm(np.cross(dvec, V(0, 1, 0)))
        w = .1
        up = V(0, .025, 0)
        mb.quad(e + side * w + up * .3, rr + side * w + up * .3, rr + up, e + up, 'roof', c, n=V(0, 1, 0) + side)
        mb.quad(e + up, rr + up, rr - side * w + up * .3, e - side * w + up * .3, 'roof', c, n=V(0, 1, 0) - side)
    return ye, slope


def shed_roof(mb, x0, x1, z_wall, z_out, y_wall, y_out, *, roof_col, trim, lod=0, gutters=True, gutter_col=(.85, .84, .8), ceiling_col=None, beam=True):
    """A porch shed roof from the wall (z_wall, y_wall) out to (z_out, y_out), with fascia, ceiling and gutter."""
    rc = roof_col
    a, b = V(x0, y_out, z_out), V(x1, y_out, z_out)
    c, d = V(x1, y_wall, z_wall), V(x0, y_wall, z_wall)
    ua = V(1, 0, 0)
    dn = norm(a - d)
    mb.poly([a, b, c, d], 'roof', rc, uvmode=(a, ua, -dn), n=V(0, 1, 0))
    th = .07
    mb.quad(a, a + V(0, -th, 0), b + V(0, -th, 0), b, 'metal', mix(rc, (0, 0, 0), .2), n=V(0, 0, 1))
    for (p, q, sx) in [(a, d, -1), (b, c, 1)]:
        mb.quad(p, q, q + V(0, -.2, 0), p + V(0, -.2, 0), 'paint', trim, n=V(sx, 0, 0))
    mb.box(((x0 + x1) / 2, y_out - th - .09, z_out - .015), (x1 - x0, .18, .03), 'paint', trim, skip=('-y',))
    # porch ceiling (beadboard-white), flat at the beam's underside
    yc = y_out - th - .18
    cc = ceiling_col or mix(trim, (0, 0, 0), .04)
    mb.quad(V(x0 + .02, yc, z_out - .03), V(x0 + .02, yc, z_wall), V(x1 - .02, yc, z_wall), V(x1 - .02, yc, z_out - .03), 'paint', cc, n=V(0, -1, 0))
    if gutters:
        g0, g1 = V(x0 + .02, y_out - th - .05, z_out + .0), V(x1 - .02, y_out - th - .05, z_out + .0)
        M = lambda u, y, v: V((x0 + x1) / 2 + u, y, z_out + v)
        gutter(mb, M, (x1 - x0) / 2 - .02, 0.0, y_out - th - .03, 1, gutter_col, lod, True, 0)
    return yc


# ============================================================================================== chimneys, dormers, utilities
def chimney(mb, x, z, w, d, y_base, y_top, *, brick_col=(1, 1, 1), crown=(.55, .54, .5), shoulder=None, lod=0, flue=True):
    """A brick chimney: optional wider base up to shoulder (exterior chimneys), stack to y_top, concrete crown, flue."""
    if shoulder:
        sw, sd, sy = shoulder
        mb.box((x, (y_base + sy) / 2, z), (sw, sy - y_base, sd), 'brick', brick_col, skip=('-y',))
        # sloped weathering from the base to the stack
        for s in (-1, 1):
            a0, a1 = V(x + s * sw / 2, sy, z - sd / 2), V(x + s * sw / 2, sy, z + sd / 2)
            b0, b1 = V(x + s * w / 2, sy + .45, z - sd / 2), V(x + s * w / 2, sy + .45, z + sd / 2)
            mb.quad(a0, a1, b1, b0, 'brick', brick_col, n=V(s, 1, 0))
            mb.poly([a1, b1, V(x + s * w / 2, sy, z + sd / 2)], 'brick', brick_col, n=V(0, 0, 1))
            mb.poly([a0, V(x + s * w / 2, sy, z - sd / 2), b0], 'brick', brick_col, n=V(0, 0, -1))
        y_base2 = sy
    else:
        y_base2 = y_base
    mb.box((x, (y_base2 + y_top) / 2, z), (w, y_top - y_base2, d), 'brick', brick_col, skip=('-y',))
    mb.box((x, y_top + .05, z), (w + .1, .1, d + .1), 'concrete', crown)
    if flue and lod <= 1:
        mb.box((x + w * .18, y_top + .2, z), (.22, .2, .22), 'concrete', (.52, .32, .24), skip=('-y',))
        if lod == 0:
            mb.box((x + w * .18, y_top + .3, z), (.16, .005, .16), 'metal', (.02, .02, .02), skip=('-y',))


def meter(mb, F, col=(.62, .63, .6), lod=0):
    """Electric meter base and dome on a side wall, with its conduit to the ground."""
    lbox(mb, F, (0, 0, .06), (.3, .42, .12), 'metal', col, skip=('-z',))
    if lod == 0:
        o, ex, ey, ez = F
        mb.cylinder(P(F, 0, .02, .12), P(F, 0, .02, .2), .085, 'glass', (.2, .22, .22), seg=10, caps=(False, True))
        mb.cylinder(P(F, 0, .02, .12), P(F, 0, .02, .135), .095, 'bare', (.6, .6, .58), seg=10, caps=(False, True))
    lbox(mb, F, (0, -.21 - .25, .035), (.06, .5, .06), 'metal', col)


def ac_unit(mb, c, rot, col=(.72, .73, .7), lod=0):
    """A 2011 split-system condenser on its pad: louvred cabinet, top grille, fan guard."""
    x, y, z = c
    mb.box((x, y + .04, z), (.92, .08, .92), 'concrete', (.78, .76, .72), skip=('-y',))
    mb.box((x, y + .08 + .34, z), (.74, .68, .74), 'metal', col, skip=('-y',))
    if lod == 0:
        for s in (-1, 1):
            for k in range(9):
                yy = y + .16 + k * .065
                mb.box((x + s * .372, yy, z), (.006, .028, .66), 'metal', mix(col, (0, 0, 0), .35))
                mb.box((x, yy, z + s * .372), (.66, .028, .006), 'metal', mix(col, (0, 0, 0), .35))
        mb.cylinder((x, y + .76, z), (x, y + .79, z), .3, 'metal', (.12, .12, .12), seg=14, caps=(False, True))
        mb.cylinder((x, y + .79, z), (x, y + .83, z), .06, 'metal', (.1, .1, .1), seg=8)


def wall_lantern(mb, F, frame_col=(.03, .03, .03), lod=0):
    """A carriage lantern by a door: back plate, arm, glass box with a lamp (the light slot glows at night)."""
    lbox(mb, F, (0, 0, .015), (.12, .26, .03), 'metal', frame_col, skip=('-z',))
    if lod >= 2:
        lbox(mb, F, (0, 0, .1), (.16, .26, .14), 'light', (1.0, .78, .45))
        return
    lbox(mb, F, (0, -.02, .1), (.17, .03, .17), 'metal', frame_col)
    lbox(mb, F, (0, .2, .1), (.2, .03, .2), 'metal', frame_col)
    lbox(mb, F, (0, .24, .1), (.1, .05, .1), 'metal', frame_col)
    lbox(mb, F, (0, .09, .1), (.13, .2, .13), 'light', (1.0, .78, .45))
    if lod == 0:
        for sx in (-1, 1):
            for sz in (-1, 1):
                lbox(mb, F, (sx * .075, .09, .1 + sz * .075), (.014, .22, .014), 'metal', frame_col)


def house_number(mb, F, text, col=(.02, .02, .02), plate=None, lod=0, h=.11):
    """House numbers: simple stroke digits (original 7-segment-ish lettering), on an optional plate."""
    if lod >= 2:
        return
    seg = {'0': 'abcdef', '1': 'bc', '2': 'abdeg', '3': 'abcdg', '4': 'bcfg', '5': 'acdfg', '6': 'acdefg', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg'}
    w = h * .55
    t = h * .14
    n = len(text)
    gap = w * .45
    total = n * w + (n - 1) * gap
    if plate:
        lbox(mb, F, (0, 0, .008), (total + .08, h + .07, .016), 'paint', plate, skip=('-z',))
    for i, ch in enumerate(text):
        x0 = -total / 2 + i * (w + gap)
        S = seg.get(ch, '')
        bars = {'a': (x0 + w / 2, h / 2 - t / 2, w, t), 'g': (x0 + w / 2, 0, w, t), 'd': (x0 + w / 2, -h / 2 + t / 2, w, t),
                'f': (x0 + t / 2, h / 4, t, h / 2), 'b': (x0 + w - t / 2, h / 4, t, h / 2), 'e': (x0 + t / 2, -h / 4, t, h / 2), 'c': (x0 + w - t / 2, -h / 4, t, h / 2)}
        for k in S:
            bx, by, bw, bh = bars[k]
            lbox(mb, F, (bx, by, .02), (bw, bh, .008), 'bare', col, skip=('-z',))


def basement_window(mb, F, col_trim=(.9, .9, .88), lod=0, well=True, ground_y=0.0):
    """A hopper basement window at grade in the foundation, with a galvanised window well."""
    W, H = .8, .36
    lquad(mb, F, [(-W / 2, -H / 2, -.06), (W / 2, -H / 2, -.06), (W / 2, H / 2, -.06), (-W / 2, H / 2, -.06)], 'glass', (.03, .035, .035), n=(0, 0, 1))
    lquad(mb, F, [(-W / 2, -H / 2, -.065), (W / 2, -H / 2, -.065), (W / 2, H / 2, -.065), (-W / 2, H / 2, -.065)], 'interior', (1, 1, 1), uv=rect_uv(STRIP_UV['dark']), n=(0, 0, 1))
    if lod == 0:
        for (c, size) in [((0, H / 2 - .02, -.04), (W, .04, .04)), ((0, -H / 2 + .02, -.04), (W, .04, .04)), ((-W / 2 + .02, 0, -.04), (.04, H, .04)), ((W / 2 - .02, 0, -.04), (.04, H, .04))]:
            lbox(mb, F, c, size, 'paint', col_trim, skip=('-z',))
        if well:
            # corrugated half-round well (a few facets) and gravel
            o, ex, ey, ez = F
            R = .55
            pts = []
            for k in range(7):
                a = math.pi * k / 6
                pts.append((math.cos(a) * R * 1.0, math.sin(a) * R * .75))
            for k in range(6):
                (xa, za), (xb, zb) = pts[k], pts[k + 1]
                for (y0, y1) in [(-H / 2 - .12, H / 2 + .1)]:
                    lquad(mb, F, [(xb, y0, zb), (xa, y0, za), (xa, y1, za), (xb, y1, zb)], 'bare', (.55, .56, .55), n=(0, 0, -1))
                    lquad(mb, F, [(xa, y0, za), (xb, y0, zb), (xb, y1, zb), (xa, y1, za)], 'bare', (.62, .63, .62), n=(0, 0, 1))
            lquad(mb, F, [(-R, -H / 2 - .11, 0), (R, -H / 2 - .11, 0), (R, -H / 2 - .11, R * .75), (-R, -H / 2 - .11, R * .75)], 'concrete', (.55, .53, .5), n=(0, 1, 0))


def hose_bib(mb, F, hose=True, lod=0):
    lbox(mb, F, (0, 0, .03), (.06, .06, .06), 'bare', (.62, .46, .22))
    if lod == 0 and hose:
        # a reel-less coil hanging on a wall hanger
        lbox(mb, F, (.35, .1, .04), (.18, .05, .08), 'metal', (.25, .27, .25))
        o, ex, ey, ez = F
        cx = P(F, .35, -.12, .09)
        n = 10
        for ring in range(3):
            r = .2 + ring * .012
            prev = None
            for k in range(n + 1):
                a = 2 * math.pi * k / n
                p = cx + ex * (math.cos(a) * r) + ey * (math.sin(a) * r) + ez * (ring * .02)
                if prev is not None:
                    mb.span(tuple(prev), tuple(p), .022, .022, 'metal', (.13, .3, .16))
                prev = p


def dryer_vent(mb, F, col=(.88, .87, .83), lod=0):
    lbox(mb, F, (0, 0, .01), (.17, .17, .02), 'metal', col, skip=('-z',))
    if lod == 0:
        for k in range(3):
            lquad(mb, F, [(-.07, .05 - k * .045, .02), (.07, .05 - k * .045, .02), (.07, .06 - k * .045 + .03, .05), (-.07, .06 - k * .045 + .03, .05)], 'metal', col, n=(0, .3, 1))


def welcome_mat(mb, c, w=.75, d=.45, col=(.42, .3, .17)):
    x, y, z = c
    mb.box((x, y + .008, z), (w, .016, d), 'concrete', col, skip=('-y',))


def lawn_chair(mb, c, yaw, col):
    """A plastic/aluminium porch chair (seat, back, arms, legs)."""
    x, y, z = c
    cy, sy = math.cos(yaw), math.sin(yaw)
    F = (V(x, y, z), V(cy, 0, -sy), V(0, 1, 0), V(sy, 0, cy))
    lbox(mb, F, (0, .4, 0), (.52, .04, .48), 'metal', col)
    G = sub(F, 0, .7, -.22)
    o, ex, ey, ez = G
    mb.box((0, 0, 0), (.52, .5, .035), 'metal', col, frame=(o, ex, norm(ey - ez * .25), norm(ez + ey * .25)))
    for s in (-1, 1):
        lbox(mb, F, (s * .27, .58, 0), (.04, .035, .5), 'metal', col)
        for k in (-1, 1):
            lbox(mb, F, (s * .24, .2, k * .2), (.035, .4, .035), 'metal', col, skip=('-y',))


def planter(mb, c, r=.24, h=.38, col=(.62, .36, .22), plant=(.22, .32, .12), lod=0):
    x, y, z = c
    mb.lathe([(r * .72, 0), (r * .78, .02), (r, h - .04), (r * 1.06, h - .03), (r * 1.06, h), (r * .92, h), (r * .9, h - .05)], (x, y, z), 'concrete', col, seg=10)
    if lod == 0:
        mb.lathe([(r * .9, h - .05), (r * .85, h + .12), (r * .6, h + .3), (r * .2, h + .38), (.001, h + .4)], (x, y, z), 'interior', plant, seg=8)


def hoop(mb, board, rim, rim_r, mount_y, wall_z, *, lod=0):
    """A driveway basketball hoop mounted over the garage door: backboard, bracket to the wall, rim and net."""
    bx, by, bz = board
    rx, ry, rz = rim
    white = (.86, .86, .83)
    mb.box((bx, by, bz), (1.12, .72, .04), 'paint', white)
    mb.box((bx, by - .07, bz + .022), (.46, .32, .004), 'paint', (.6, .09, .04), skip=('-z',))
    mb.box((bx, by - .07, bz + .023), (.4, .26, .004), 'paint', white, skip=('-z',))
    # bracket arms to the wall/fascia
    for sx in (-.3, .3):
        mb.span((bx + sx, by + .1, bz - .02), (bx + sx, by + .1, wall_z + .02), .05, .05, 'metal', (.18, .18, .18))
        mb.span((bx + sx, by - .22, bz - .02), (bx + sx, mount_y, wall_z + .02), .05, .05, 'metal', (.18, .18, .18))
    seg = 14 if lod == 0 else 8
    prev = None
    for k in range(seg + 1):
        a = 2 * math.pi * k / seg
        p = V(rx + math.cos(a) * rim_r, ry, rz + math.sin(a) * rim_r)
        if prev is not None:
            mb.span(tuple(prev), tuple(p), .018, .018, 'metal', (.75, .22, .08))
        prev = p
    mb.span((rx, ry, rz - rim_r), (rx, ry, bz + .02), .05, .02, 'metal', (.75, .22, .08))
    if lod == 0:
        for k in range(10):
            a = 2 * math.pi * k / 10
            p = V(rx + math.cos(a) * rim_r, ry, rz + math.sin(a) * rim_r)
            q = V(rx + math.cos(a + .35) * rim_r * .6, ry - .4, rz + math.sin(a + .35) * rim_r * .6)
            mb.span(tuple(p), tuple(q), .006, .006, 'paint', (.92, .92, .9))
