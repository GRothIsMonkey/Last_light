"""Last Light house kit: assemble one house from the game's own lot plan (tools/blender/houses/plans.json, dumped from
dist/houses.js planLots by tools/assets/house-plans.mjs) at a given level of detail.

The plan fixes what the game already relies on: footprint (w x depth at the lot's setback), front door position and
porch floor height (the walkable pads), porch width/depth and step count (stepFront: the riding obstacle), garage side,
width, front line and door size (the car house's working door and the van that parks in it), the hoop (the kid shooting
baskets), palette colours (walls, roof, door, shutters, garage door), brick use, chimney type and dormer count.
The kit decides how it is built: proportions, roof pitch (style guide 2.2), windows placed by rooms, trims, materials.
"""
import math
import random
import numpy as np
from house_kit import MB, V, lin, mix, norm, Wall, wall_surface
import house_parts as HP

PITCH = {'ranch': 5 / 12, 'colonial': 7 / 12, 'cape': 11 / 12, 'frontgable': 8 / 12}
SIDING_BOTTOM = .34
EAVE, RAKE = .40, .25


class Tints:
    """Vertex colours that put the palette's colours back after the tiling textures' own mean (house_textures)."""
    def __init__(self, means):
        self.means = means

    def __call__(self, family, colour, k=1.0):
        m = self.means.get(family, (1, 1, 1))
        c = lin(colour) if not isinstance(colour, tuple) else colour
        return tuple(min(1.0, c[i] * k / max(1e-3, m[i])) for i in range(3))


def room_specs(rnd):
    return {
        'living': dict(card=rnd.choice([0, 1]), wall=rnd.choice(['wall0', 'wall1']), floor='floor_carpet', curtain='pair', long=True, fabric=rnd.choice([(.62, .5, .38), (.55, .58, .5), (.7, .62, .5), (.45, .4, .5)]), blinds=rnd.choice([0, 0, .25])),
        'dining': dict(card=2, wall=rnd.choice(['wall1', 'wall2']), floor='floor_wood', curtain=rnd.choice(['pair', None]), long=True, fabric=(.66, .6, .52), blinds=0),
        'kitchen': dict(card=3, wall='wall3', floor='floor_tile', curtain=None, blinds=rnd.choice([.3, .45]), sill_h=1.05),
        'bedroom': dict(card=4, wall=rnd.choice(['wall0', 'wall2']), floor='floor_carpet', curtain=rnd.choice(['pair', 'pair_closed', None]), fabric=rnd.choice([(.5, .55, .62), (.7, .66, .58), (.6, .45, .42)]), blinds=rnd.choice([0, .35, .6])),
        'kid': dict(card=5, wall=rnd.choice(['wall1', 'wall3']), floor='floor_carpet', curtain=rnd.choice(['pair', None]), fabric=rnd.choice([(.35, .45, .62), (.6, .62, .4)]), blinds=rnd.choice([.2, .5])),
        'hall': dict(card=6, wall='wall0', floor='floor_wood', curtain=None, blinds=0),
        'den': dict(card=7, wall=rnd.choice(['wall2', 'wall3']), floor='floor_wood', curtain=None, blinds=rnd.choice([.4, .7])),
    }


class House:
    def __init__(self, h, lod, tints, palette):
        self.h = h
        self.lod = lod
        self.T = tints
        self.pal = palette
        self.rnd = random.Random(int(h['seeds'][0] * 1e6) + 17)
        self.mb = MB(f"{h['id']}:lod{lod}")
        self.rooms = room_specs(self.rnd)
        self.stats = {}
        r = self.rnd
        # how the family keeps the place (restrained: fresh / average / tired)
        self.care = ['fresh', 'average', 'average', 'tired'][int(h['seeds'][1] * 4) % 4]
        fade = {'fresh': 1.0, 'average': .985, 'tired': .965}[self.care]
        c = self.T
        self.c_wall = c('siding', mix(lin(h['wall']), (lin(h['wall'])[0] * 1.1,) * 3, .0 if self.care != 'tired' else .12), fade)
        self.c_trim = c('paint', mix(lin(palette['trim']), (.62, .58, .48), {'fresh': 0, 'average': .05, 'tired': .12}[self.care]))
        self.c_roof = c('roof', mix(lin(h['roofColor']), (.32, .3, .28), {'fresh': 0, 'average': .08, 'tired': .18}[self.care]))
        self.c_door = c('paint', lin(h['door']))
        self.c_shut = c('paint', lin(h['shutters'])) if h['shutters'] else None
        self.c_gdoor = c('paint', lin(h['garageColor']))
        self.c_found = c('concrete', lin(palette['foundation']))
        self.c_step = c('concrete', lin(palette['step']))
        self.c_brick = c('brick', (1, 1, 1)) if True else None
        self.c_floor = c('paint', lin(palette['porchFloor']))
        self.c_gutter = lin(palette['gutter'])
        self.c_down = lin(palette['downspout'])
        self.c_soffit = c('paint', lin(palette['soffit']))

    # ------------------------------------------------------------------ layout
    def layout(self):
        h = self.h
        st = h['style']
        self.W2, self.D2 = h['w'] / 2, h['depth'] / 2
        self.plate = h['h']
        self.f1 = max(.42, h['floor'] + .02)
        self.two = h['stories'] == 2
        self.f2 = self.plate - 2.44 - .02 if self.two else None
        self.pitch = PITCH[st]
        if st == 'cape':
            self.rise = h['rise']
        elif st == 'frontgable':
            self.rise = self.W2 * self.pitch
        else:
            self.rise = self.D2 * self.pitch
        # windows by style (W x H rough openings) and grilles
        r = self.rnd
        if st == 'colonial':
            self.win = (.91, 1.47)
            self.lites = r.choice(['6/6', '6/6', '6/1'])
        elif st == 'ranch':
            self.win = (.91, 1.32)
            self.lites = r.choice(['1/1', '6/6', '2/2'])
        elif st == 'cape':
            self.win = (.86, 1.37)
            self.lites = '6/6'
        else:
            self.win = (.86, 1.42)
            self.lites = r.choice(['1/1', '6/1', '6/6'])
        self.head1 = self.f1 + 2.06
        self.head2 = (self.plate - .48) if self.two else None
        self.gs = h['gs']
        self.hasG = h['hasGarage']
        # garage geometry: ranches carry the garage under one long roof (full depth, flush front)
        if self.hasG:
            self.gw, self.gh = h['gw'], h['gh']
            self.gx = h['gx']
            self.gfront = h['gfront']
            self.gd = h['gd']
            self.merged_garage = st == 'ranch'
            if self.merged_garage:
                self.gd = h['depth']
                self.gfront = self.D2
            self.gdoorW = (h['garageInfo']['doorW'] if h['dynamicGarage'] else (4.88 if self.gw > 5 else 2.74))
            self.gdoorH = h['garageInfo']['doorH'] if h['dynamicGarage'] else 2.13
        self.knob = -1 if self.gs > 0 else 1

    # ------------------------------------------------------------------ openings
    def front_openings(self):
        """Windows on the front wall by rooms. Returns [(x, y_centre, W, H, kind, room)]."""
        h, st = self.h, self.h['style']
        W2 = self.W2
        dx = h['doorX']
        ww, wh = self.win
        out = []
        lim = W2 - .75
        y1 = self.head1 - wh / 2
        r = self.rnd
        if st == 'colonial':
            # colonial: four bays evenly across the upper floor, stacked over the ground floor's windows; a ground-floor
            # bay is left out where the entry (door, its casing and a shutter's width) needs the wall
            nb = 4
            bays = [-W2 + h['w'] * (i + .5) / nb for i in range(nb)]
            y2 = self.head2 - wh / 2
            for i, x in enumerate(bays):
                room = 'living' if (x < dx) == (self.gs > 0) else 'dining'
                if abs(x - dx) > ww / 2 + .11 + .38 + .46 + .2:
                    out.append((x, y1, ww, wh, 'dh', room))
                out.append((x, y2, ww, wh - .15, 'dh', 'kid' if i == 0 else 'bedroom'))
        elif st == 'ranch':
            far = -self.gs if self.hasG else (1 if dx < 0 else -1)
            # living-room picture window on the side away from the garage, a pair toward the garage (kitchen/bed)
            px = dx + far * 2.55
            px = max(-lim + 1.1, min(lim - 1.1, px))
            out.append((px, self.head1 - 1.45 / 2, 2.3, 1.45, 'picture', 'living'))
            room_far = dx + far * 5.0
            if abs(room_far) < lim - .3 and abs(room_far - px) > 2.2:
                out.append((room_far, y1, ww, wh, 'dh', 'bedroom'))
            near = -far
            kx = dx + near * 1.9
            if abs(kx) < lim:
                out.append((kx, self.head1 - .55, 1.22, 1.0, 'dh', 'kitchen'))
            bx = dx + near * 4.0
            if abs(bx) < lim and (not self.hasG or True):
                out.append((bx, y1, ww, wh, 'dh', 'bedroom'))
            bx2 = dx + near * 5.6
            if abs(bx2) < lim:
                out.append((bx2, y1, ww, wh, 'dh', 'kid'))
        elif st == 'cape':
            for k in (1, 2):
                for s in (-1, 1):
                    x = dx + s * (1.0 + 1.55 * k - .55)
                    if abs(x) < lim:
                        out.append((x, y1, ww, wh, 'dh', 'living' if s == -self.gs else 'dining'))
        else:  # front gable: the gable end is the facade
            for s in (-1, 1):
                x = dx + s * 1.75
                if abs(x) < lim and abs(x - dx) > 1.1:
                    out.append((x, y1, ww, wh, 'dh', 'living' if s == -self.gs else 'dining'))
            y2 = self.head2 - (wh - .1) / 2
            for s in (-1, 1):
                out.append((s * 1.35, y2, ww, wh - .1, 'dh', 'bedroom' if s < 0 else 'kid'))
        return out

    def side_openings(self, s):
        """Windows on a side wall (s = -1 left, +1 right). Returns [(z, y, W, H, kind, room)]."""
        if self.hasG and s == self.gs:
            # second-floor windows above a lower garage roof
            if self.two:
                return [(-self.D2 * .35, self.head2 - (self.win[1] - .15) / 2, self.win[0], self.win[1] - .15, 'dh', 'bedroom')]
            return []
        ww, wh = self.win
        out = []
        zs = [self.D2 * .45, -self.D2 * .4] if self.h['depth'] > 9.0 else [self.D2 * .2]
        y1 = self.head1 - wh / 2
        for i, z in enumerate(zs):
            out.append((z, y1, ww, wh, 'dh', 'dining' if i == 0 else 'kitchen'))
        if self.two:
            for i, z in enumerate(zs):
                out.append((z, self.head2 - (wh - .15) / 2, ww, wh - .15, 'dh', 'bedroom'))
        return out

    # ------------------------------------------------------------------ walls
    def walls(self):
        mb, h, lod = self.mb, self.h, self.lod
        W2, D2, top = self.W2, self.D2, self.plate
        sb = SIDING_BOTTOM
        st = h['style']
        gable_front = st == 'frontgable'
        brickOut = h['brickOut']
        front = Wall((-W2, 0, D2), (1, 0, 0), (0, 0, 1), 2 * W2)
        back = Wall((W2, 0, -D2), (-1, 0, 0), (0, 0, -1), 2 * W2)
        left = Wall((-W2, 0, -D2), (0, 0, 1), (-1, 0, 0), 2 * D2)
        right = Wall((W2, 0, D2), (0, 0, -1), (1, 0, 0), 2 * D2)
        self.wall_objs = {'front': front, 'back': back, 'left': left, 'right': right}
        rev = HP.REVEAL if lod <= 1 else None
        # front
        fo = self.front_openings()
        dx = h['doorX']
        door_hole = (dx + W2 - .51, dx + W2 + .51, h['floor'], h['floor'] + 2.1)
        holes = [door_hole] + [(x + W2 - w / 2, x + W2 + w / 2, y - hh / 2, y + hh / 2) for (x, y, w, hh, k, r) in fo]
        if lod >= 2:
            holes = []
        t_front = brickOut if h['brick'] == 'front' else 0.0
        if h['brick'] == 'front':
            wall_surface(mb, front, -.05, top, holes, 'brick', self.c_brick, t=t_front, reveal=(rev + t_front) if rev else None, reveal_slot='brick', reveal_col=self.c_brick)
            # the veneer's returns at the corners
            for x, n in ((-W2, (-1, 0, 0)), (W2, (1, 0, 0))):
                mb.quad(V(x, -.05, D2), V(x, -.05, D2 + t_front), V(x, top - .3, D2 + t_front), V(x, top - .3, D2), 'brick', self.c_brick, n=V(*n))
        else:
            wall_surface(mb, front, sb, top, holes, 'siding', self.c_wall, reveal=rev, reveal_slot='paint', reveal_col=self.c_trim)
        if h['brick'] == 'lower':
            # a brick wainscot across the front up to below the first-floor sills, with a sloped rowlock cap
            cap = min(1.0, min([y - hh / 2 for (x, y, w, hh, k, r) in fo] + [1.2]) - .12)
            bh = [(dx + W2 - .51, dx + W2 + .51, -.05, cap + .2)] if lod <= 1 else []
            wall_surface(mb, front, -.05, cap, bh, 'brick', self.c_brick, t=brickOut, reveal=(brickOut + .01) if lod <= 1 else None, reveal_slot='brick', reveal_col=self.c_brick)
            mb.poly([V(-W2 - .01, cap, D2 + brickOut + .025), V(W2 + .01, cap, D2 + brickOut + .025), V(W2 + .01, cap + .07, D2), V(-W2 - .01, cap + .07, D2)], 'brick', self.c_brick, n=V(0, 1, 1))
            mb.quad(V(-W2 - .01, cap - .06, D2 + brickOut + .025), V(W2 + .01, cap - .06, D2 + brickOut + .025), V(W2 + .01, cap, D2 + brickOut + .025), V(-W2 - .01, cap, D2 + brickOut + .025), 'brick', self.c_brick, n=V(0, 0, 1))
            for x, n in ((-W2 - .01, -1), (W2 + .01, 1)):
                mb.quad(V(x, -.05, D2), V(x, -.05, D2 + brickOut + .025), V(x, cap, D2 + brickOut + .025), V(x, cap + .07, D2), 'brick', self.c_brick, n=V(n, 0, 0))
        self.front_t = t_front
        self.fo = fo
        # sides and back
        self.so = {}
        for s, wall in ((-1, left), (1, right)):
            so = self.side_openings(s)
            self.so[s] = so
            hs = []
            for (z, y, w, hh, k, r) in so:
                sc = (D2 - z) if s < 0 else (D2 - z)
                # left wall runs from z=-D2 (s=0) to +D2; right wall from +D2 to -D2
                c = (z + D2) if s < 0 else (D2 - z)
                hs.append((c - w / 2, c + w / 2, y - hh / 2, y + hh / 2))
            if lod >= 2:
                hs = []
            wall_surface(mb, wall, sb, top, hs, 'siding', self.c_wall, reveal=rev, reveal_slot='paint', reveal_col=self.c_trim)
        bo = []
        ww, wh = self.win
        n_back = max(2, int(self.h['w'] / 3.6))
        for i in range(n_back):
            x = -W2 + self.h['w'] * (i + .5) / n_back
            bo.append((x, self.head1 - wh / 2, ww, wh, 'dh', 'kitchen'))
            if self.two:
                bo.append((x, self.head2 - (wh - .15) / 2, ww, wh - .15, 'dh', 'bedroom'))
        # sliding patio door at the back
        bdx = (h['seeds'][1] - .5) * self.h['w'] * .4
        bo = [o for o in bo if abs(o[0] - bdx) > 1.5 or o[1] > 2.5]
        self.bo, self.bdx = bo, bdx
        hs = [(W2 - x - w / 2, W2 - x + w / 2, y - hh / 2, y + hh / 2) for (x, y, w, hh, k, r) in bo] + [(W2 - bdx - .9, W2 - bdx + .9, self.f1, self.f1 + 2.03)]
        if lod >= 2:
            hs = []
        wall_surface(mb, back, sb, top, hs, 'siding', self.c_wall, reveal=rev, reveal_slot='paint', reveal_col=self.c_trim)
        # corner boards
        if not (h['brick'] == 'front'):
            cb = .1
            for (x, z) in ((-1, 1), (1, 1), (-1, -1), (1, -1)):
                X, Z = x * W2, z * D2
                if lod <= 1:
                    # the board on the front/back wall wraps the corner; the side board butts against it (no coplanar overlap)
                    mb.box((X + x * .025 - x * cb / 2, (sb + top) / 2, Z + z * .0125), (cb, top - sb, .025), 'paint', self.c_trim, skip=('-y', '+y'))
                    mb.box((X + x * .0125, (sb + top) / 2, Z - z * (cb - .025) / 2), (.025, top - sb, cb - .025), 'paint', self.c_trim, skip=('-y', '+y'))
        else:
            for (x, z) in ((-1, -1), (1, -1)):
                X, Z = x * W2, z * D2
                if lod <= 1:
                    mb.box((X + x * .025 - x * .05, (sb + top) / 2, Z + z * .0125), (.1, top - sb, .025), 'paint', self.c_trim, skip=('-y', '+y'))
                    mb.box((X + x * .0125, (sb + top) / 2, Z - z * .0375), (.025, top - sb, .075), 'paint', self.c_trim, skip=('-y', '+y'))
        # foundation: exposed concrete band (slightly inset), going below grade so a sloping lot never shows a gap
        fz = .015
        fy0, fy1 = -.7, sb + .02
        for wall, key in ((front, 'front'), (back, 'back'), (left, 'left'), (right, 'right')):
            if key == 'front' and h['brick'] in ('front', 'lower'):
                continue
            mb.quad(wall.p(0, fy0, -fz), wall.p(wall.L, fy0, -fz), wall.p(wall.L, fy1, -fz), wall.p(0, fy1, -fz), 'concrete', self.c_found, n=wall.n)
        if lod == 0:
            # siding starter edge (a small shadow line at the bottom course)
            for wall, key in ((front, 'front'), (back, 'back'), (left, 'left'), (right, 'right')):
                if key == 'front' and h['brick'] == 'front':
                    continue
                mb.quad(wall.p(0, sb - .005, .012), wall.p(wall.L, sb - .005, .012), wall.p(wall.L, sb, 0), wall.p(0, sb, 0), 'siding', mix(self.c_wall, (0, 0, 0), .35), n=V(0, -1, 0) + wall.n)

    # ------------------------------------------------------------------ windows and doors
    def place_windows(self):
        mb, h, lod = self.mb, self.h, self.lod
        W2, D2 = self.W2, self.D2
        front = self.wall_objs['front']
        t = self.front_t
        casing = 'brick' if h['brick'] == 'front' else 'flat'
        cw = .11 if h['style'] == 'colonial' else .09
        shut = self.c_shut
        kind = 'louver' if (h['seeds'][2] < .6) else 'panel'
        r = self.rnd
        for (x, y, w, hh, k, room) in self.fo:
            spec = dict(self.rooms[room])
            spec['depth'] = 2.2 if y < 2.6 else 1.8
            F = front.frame(x + W2, y, t)
            sh = shut if (shut is not None and k != 'picture' and h['style'] in ('colonial', 'cape', 'ranch', 'frontgable')) else None
            if k == 'picture':
                # a fixed centre lite with two operating flankers, mulled
                fw = .56
                cwid = w - 2 * fw
                HP.window(mb, HP.sub(F, 0, 0), cwid, hh, lites='1/1', trim=self.c_trim, casing=casing, casing_w=0.0001, head='none', interior=spec, lod=lod, sill=False, picture=True)
                for s in (-1, 1):
                    sp2 = dict(spec)
                    HP.window(mb, HP.sub(F, s * (cwid / 2 + fw / 2), 0), fw, hh, lites=self.lites, trim=self.c_trim, casing=casing, casing_w=0.0001, head='none', interior=sp2, lod=lod, sill=False)
                # one casing around the unit
                self.casing_ring(F, w, hh, cw if casing != 'brick' else .055, lod, sill=True)
                if shut is not None and lod <= 1:
                    HP.shutter_pair(mb, F, w, hh, w / 2 + cw, shut, kind=kind, lod=lod)
                continue
            lites = self.lites if room != 'kitchen' else ('2/2' if self.lites != '1/1' else '1/1')
            HP.window(mb, F, w, hh, lites=lites, trim=self.c_trim, casing=casing, casing_w=cw, head='cap' if h['style'] in ('colonial', 'cape') else 'flat',
                      shutters=sh if room != 'kitchen' else None, shutter_kind=kind, interior=spec, lod=lod)
        for s, wall in ((-1, self.wall_objs['left']), (1, self.wall_objs['right'])):
            for (z, y, w, hh, k, room) in self.so[s]:
                c = (z + D2) if s < 0 else (D2 - z)
                spec = dict(self.rooms[room])
                spec['depth'] = 1.6
                spec['side'] = .5
                F = wall.frame(c, y, 0)
                HP.window(mb, F, w, hh, lites=self.lites, trim=self.c_trim, casing='flat', casing_w=.09, head='flat', interior=spec, lod=max(lod, 1) if lod < 2 else 2)
        back = self.wall_objs['back']
        for (x, y, w, hh, k, room) in self.bo:
            F = back.frame(W2 - x, y, 0)
            HP.window(mb, F, w, hh, lites=self.lites, trim=self.c_trim, casing='flat', casing_w=.09, head='flat', interior=dict(self.rooms[room], depth=1.2), lod=max(lod, 1) if lod < 2 else 2)
        # patio slider at the back (two glass panels in a white frame)
        F = back.frame(W2 - self.bdx, self.f1, 0)
        if lod <= 1:
            for (c, size) in [((0, 2.03 - .03, -.05), (1.8, .06, .1)), ((-.87, 1.0, -.05), (.06, 2.03, .1)), ((.87, 1.0, -.05), (.06, 2.03, .1)), ((0, 1.0, -.07), (.06, 2.03, .05))]:
                HP.lbox(mb, F, c, size, 'paint', self.c_trim, skip=('-z',))
            HP.interior_box(mb, HP.sub(F, 0, 1.0), 1.7, 1.95, dict(self.rooms['kitchen'], depth=1.4, sill_h=.05, ceil=.3, blinds=.0), lod=1)
            HP.lquad(mb, F, [(-.84, .03, -.06), (.84, .03, -.06), (.84, 1.98, -.06), (-.84, 1.98, -.06)], 'glass', (.06, .07, .07), n=(0, 0, 1))
        else:
            HP.lquad(mb, F, [(-.9, 0, .01), (.9, 0, .01), (.9, 2.03, .01), (-.9, 2.03, .01)], 'interior', (1, 1, 1), uv=HP.rect_uv(HP.STRIP_UV['dark']), n=(0, 0, 1))

    def casing_ring(self, F, w, hh, cw, lod, sill=True):
        mb = self.mb
        ct = .026
        for s in (-1, 1):
            HP.lbox(mb, F, (s * (w / 2 + cw / 2), 0, ct / 2 - .002), (cw, hh, ct), 'paint', self.c_trim, skip=('-z',))
        HP.lbox(mb, F, (0, hh / 2 + (cw + .02) / 2, ct / 2), (w + 2 * cw, cw + .02, ct), 'paint', self.c_trim, skip=('-z',))
        if sill:
            HP.lbox(mb, F, (0, -hh / 2 - .016, .02), (w + 2 * cw + .06, .032, .12), 'paint', self.c_trim, skip=('-z',))
            if lod == 0:
                HP.lbox(mb, F, (0, -hh / 2 - .062, ct / 2), (w + 2 * cw - .02, .06, ct), 'paint', self.c_trim, skip=('-z', '+y'))
        # mullions between the units
        HP.lbox(mb, F, (-(w / 2 - .56), 0, .0), (.07, hh, .05), 'paint', self.c_trim, skip=('-z',))
        HP.lbox(mb, F, ((w / 2 - .56), 0, .0), (.07, hh, .05), 'paint', self.c_trim, skip=('-z',))

    def front_door(self):
        mb, h, lod = self.mb, self.h, self.lod
        F = self.wall_objs['front'].frame(h['doorX'] + self.W2, h['floor'], self.front_t)
        st = h['style']
        style = 'six' if st in ('colonial', 'cape') else ('craftsman' if st == 'frontgable' else self.rnd.choice(['flush', 'six']))
        surround = 'pediment' if (st == 'colonial' and h['porch'] != 'porch') else 'flat'
        storm = self.rnd.random() < .45
        HP.entry_door(mb, F, col=self.c_door, trim=self.c_trim, style=style, lod=lod, storm=storm, surround=surround, knob=self.knob)
        # what is behind an open/glass door: a dark hall (the slab is opaque; this backs the storm door glass)
        self.door_frame = F
        # porch light, house number, mat
        if lod <= 1:
            lx = .9 * (-self.knob)
            HP.wall_lantern(mb, HP.sub(F, lx, 1.72), lod=lod)
            self.porch_light = tuple(HP.P(F, lx, 1.81, .1))
        if lod == 0:
            HP.house_number(mb, HP.sub(F, -lx, 1.55), self.address(), col=(.55, .42, .18), plate=None, lod=lod)
            HP.welcome_mat(mb, tuple(HP.P(F, 0, 0, .45)), col=self.T('concrete', (.32, .22, .12)))

    def address(self):
        k = round((self.h['d'] + 427) / 29)
        return str(400 + 4 * k + (1 if self.h['side'] > 0 else 0))

    # ------------------------------------------------------------------ porch, stoop, portico
    def entry(self):
        mb, h, lod = self.mb, self.h, self.lod
        front, dx, fl, pw, pd, n = self.D2 + self.front_t, h['doorX'], h['floor'], h['porchW'], h['pdep'], h['steps']
        # keep the procedural plan's porch depth measured from the wall face
        front = self.D2
        T = self.c_trim
        kind = h['porch']
        if kind == 'porch':
            x0, x1 = dx - pw / 2, dx + pw / 2
            # deck: framed edge, boards running out from the house, lattice skirt
            mb.box((dx, fl - .1, front + pd / 2), (pw, .2, pd), 'paint', T, skip=('+y', '-z'))
            if lod == 0:
                nb = int(pw / .09)
                for k in range(nb):
                    xa = x0 + pw * k / nb + .004
                    xb = x0 + pw * (k + 1) / nb - .004
                    mb.quad(V(xa, fl, front + pd), V(xb, fl, front + pd), V(xb, fl, front), V(xa, fl, front), 'paint', mix(self.c_floor, (0, 0, 0), .03 * (k % 3)), n=V(0, 1, 0))
                mb.quad(V(x0, fl - .012, front + pd), V(x1, fl - .012, front + pd), V(x1, fl - .012, front), V(x0, fl - .012, front), 'paint', mix(self.c_floor, (0, 0, 0), .6), n=V(0, 1, 0))
                # lattice skirt between the rim joist and the ground
                yb = fl - .2
                if yb > .05:
                    mb.quad(V(x0 + .05, 0, front + pd - .02), V(x1 - .05, 0, front + pd - .02), V(x1 - .05, yb, front + pd - .02), V(x0 + .05, yb, front + pd - .02), 'interior', (1, 1, 1), uv=HP.rect_uv(HP.STRIP_UV['dark']), n=V(0, 0, 1))
                    k = 0
                    x = x0 + .1
                    while x < x1 - .1:
                        mb.span((x, 0, front + pd - .01), (min(x1 - .05, x + yb), yb, front + pd - .01), .025, .012, 'paint', T, up=(0, 0, 1))
                        mb.span((x, yb, front + pd - .005), (min(x1 - .05, x + yb), 0, front + pd - .005), .025, .012, 'paint', T, up=(0, 0, 1))
                        x += .2
            else:
                mb.quad(V(x0, fl, front + pd), V(x1, fl, front + pd), V(x1, fl, front), V(x0, fl, front), 'paint', self.c_floor, n=V(0, 1, 0))
            # steps (painted wood treads on stringers), centred on the door
            stw = 1.6
            HP.steps(mb, dx - stw / 2, dx + stw / 2, front + pd, fl, n, .3, 'paint', self.c_floor)
            # posts, railings, roof
            ph = (h['eaveFront'] - .12 - .25 - .24 - fl) if h['lowPorch'] else 2.75
            pz = front + pd - .16
            posts = [x0 + .16, x1 - .16]
            if pw >= 5:
                posts += [dx - (pw - .4) / 2 * .5 - .0, dx + (pw - .4) / 2 * .5]
            if pw >= 5:
                posts = [x0 + .16, dx - stw / 2 - .12, dx + stw / 2 + .12, x1 - .16]
            posts = sorted(posts)
            pk = 'round' if h['style'] in ('colonial',) else 'square'
            for x in posts:
                HP.post(mb, (x, fl, pz), fl + ph, .16 if pk == 'square' else .2, T, kind=pk, lod=lod)
            # railings between posts except across the steps
            for i in range(len(posts) - 1):
                a, b = posts[i] + .09, posts[i + 1] - .09
                if a < dx + stw / 2 and b > dx - stw / 2:
                    continue
                HP.railing(mb, (a, 0, pz), (b, 0, pz), fl, T, lod=lod)
            # side railings back to the house
            for x in (posts[0], posts[-1]):
                HP.railing(mb, (x, 0, pz - .09), (x, 0, front + .05), fl, T, lod=lod)
            # roof
            y1 = fl + ph + .24
            if h['lowPorch']:
                y2 = y1 + .25
                z0 = front + .47
            else:
                y2 = y1 + .5
                z0 = front
            beam_y = fl + ph
            mb.box((dx, beam_y + .11, pz), (pw + .1, .22, .2), 'paint', T)
            HP.shed_roof(mb, x0 - .2, x1 + .2, z0, front + pd + .3, y2, y1, roof_col=self.c_roof, trim=T, lod=lod, gutter_col=self.c_gutter)
            if not h['lowPorch'] and lod <= 1:
                # flashing where the porch roof meets the wall
                mb.quad(V(x0 - .2, y2 - .01, front + .01), V(x1 + .2, y2 - .01, front + .01), V(x1 + .2, y2 + .14, front + .01), V(x0 - .2, y2 + .14, front + .01), 'metal', mix(self.c_roof, (.5, .5, .5), .3), n=V(0, 0, 1))
            # porch life: chairs, a planter
            if lod == 0 and self.rnd.random() < .7:
                cx = dx + (-self.knob) * min(pw / 2 - .8, 1.6)
                col = self.rnd.choice([(.85, .84, .8), (.2, .32, .22), (.55, .35, .2)])
                for k in range(2 if pw > 5 else 1):
                    HP.lawn_chair(mb, (cx + k * .8 * (-self.knob), fl, front + .8), math.pi + self.rnd.uniform(-.3, .3), col)
            if lod == 0:
                HP.planter(mb, (dx + self.knob * (stw / 2 + .35), fl, front + pd - .5), lod=lod)
        elif kind == 'portico':
            ph = 2.6
            mb.box((dx, fl / 2, front + pd / 2), (pw, fl, pd), 'concrete', self.c_step, skip=('-y', '-z'))
            HP.steps(mb, dx - .8, dx + .8, front + pd, fl, n, .3, 'concrete', self.c_step)
            for s in (-1, 1):
                HP.post(mb, (dx + s * (pw / 2 - .18), fl, front + pd - .18), fl + ph, .2, T, kind='round', lod=lod)
            mb.box((dx, fl + ph + .1, front + pd / 2), (pw + .2, .2, pd + .1), 'paint', T)
            HP.gable_roof(mb, dx, front + pd / 2 - .05, pd + .1, pw + .2, fl + ph + .2, .7, ou=(0.0, .12), ov=(.1, .1), along_x=False,
                          roof_col=self.c_roof, trim=T, wall_col=T, wall_slot='paint', lod=lod, gutters=(False, False), vent=False)
        else:
            # stoop: a concrete landing and steps, iron rail; a gabled hood on brackets on two-storey houses
            mb.box((dx, fl / 2, front + pd / 2), (pw, fl, pd), 'concrete', self.c_step, skip=('-y', '-z'))
            HP.steps(mb, dx - .8, dx + .8, front + pd, fl, n, .3, 'concrete', self.c_step)
            if lod <= 1 and n >= 3:
                for s in (-1, 1):
                    x = dx + s * .74
                    mb.span((x, fl + .9, front + pd - .05), (x, .9, front + pd + .3 * (n - 1)), .03, .03, 'metal', (.02, .02, .02))
                    for k in range(n):
                        z = front + pd - .05 + .3 * k
                        yb = fl - fl * k / n
                        mb.span((x, yb, z), (x, yb + .9, z), .02, .02, 'metal', (.02, .02, .02))
            if self.two:
                hood_z = front + .5
                HP.gable_roof(mb, dx, front + .45, .9, 1.7, 2.62 + h['floor'] * 0, .42, ou=(0.0, .08), ov=(.1, .1), along_x=False,
                              roof_col=self.c_roof, trim=T, wall_col=T, wall_slot='paint', lod=lod, gutters=(False, False), vent=False)
                for s in (-1, 1):
                    mb.span((dx + s * .72, 2.2, front + .02), (dx + s * .72, 2.58, front + .8), .08, .08, 'paint', T)

    # ------------------------------------------------------------------ roofs
    def roofs(self):
        mb, h, lod = self.mb, self.h, self.lod
        W2, D2, y0 = self.W2, self.D2, self.plate
        st = h['style']
        T = self.c_trim
        hasG = self.hasG
        gs = self.gs
        if st == 'ranch' and hasG:
            # one long roof over house and garage
            xa, xb = -W2, W2
            if gs > 0:
                xb = W2 + self.gw
            else:
                xa = -W2 - self.gw
            cx = (xa + xb) / 2
            Wd = xb - xa
            if h['roof'] == 'hip':
                HP.hip_roof(mb, cx, 0, Wd, 2 * D2, y0, D2 * self.pitch, EAVE, roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter)
            else:
                HP.gable_roof(mb, cx, 0, Wd, 2 * D2, y0, D2 * self.pitch, ou=(RAKE, RAKE), ov=(EAVE, EAVE), along_x=True, roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter)
            self.roof_span = (xa, xb)
        elif st == 'frontgable':
            HP.gable_roof(mb, 0, 0, 2 * D2, 2 * W2, y0, self.rise, ou=(RAKE, RAKE), ov=(EAVE, EAVE), along_x=False, roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter)
            self.roof_span = (-W2, W2)
        elif h['roof'] == 'hip':
            HP.hip_roof(mb, 0, 0, 2 * W2, 2 * D2, y0, D2 * self.pitch, EAVE, roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter)
            self.roof_span = (-W2, W2)
        else:
            ou = [RAKE, RAKE]
            if hasG and st == 'cape':
                ou[0 if gs < 0 else 1] = 0.0   # the cape's gable wall comes down to the garage roof
            HP.gable_roof(mb, 0, 0, 2 * W2, 2 * D2, y0, self.rise, ou=tuple(ou), ov=(EAVE, EAVE), along_x=True, roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter)
            self.roof_span = (-W2, W2)
        # dormers (capes)
        if h['dormers'] and lod <= 2:
            n = h['dormers']
            for k in range(n):
                x = -W2 + h['w'] * (k + .5) / n
                self.dormer(x)

    def dormer(self, x):
        mb, lod = self.mb, self.lod
        D2, y0 = self.D2, self.plate
        slope = self.rise / D2
        dw, dh = 1.35, 1.35
        z_face = D2 - .55
        yb = y0 + (D2 - z_face) * slope - .02      # main roof height at the dormer face
        top = yb + dh
        back_z = D2 - (top - y0) / slope + .05     # where the dormer's ridge meets the main roof
        T = self.c_trim
        # cheeks (sided) down to the roof plane, front wall with the window
        for s in (-1, 1):
            xs = x + s * dw / 2
            mb.poly([V(xs, yb, z_face), V(xs, top, z_face), V(xs, top, back_z)], 'siding', self.c_wall, n=V(s, 0, 0))
        front = Wall((x - dw / 2, 0, z_face), (1, 0, 0), (0, 0, 1), dw)
        ww, wh = .7, .95
        wy = yb + .2 + wh / 2
        hole = [(dw / 2 - ww / 2, dw / 2 + ww / 2, wy - wh / 2, wy + wh / 2)] if lod <= 1 else []
        wall_surface(mb, front, yb - .1, top, hole, 'siding', self.c_wall, reveal=HP.REVEAL if lod <= 1 else None, reveal_col=T)
        HP.window(mb, front.frame(dw / 2, wy, 0), ww, wh, lites='6/6' if self.lites != '1/1' else '1/1', trim=T, casing='flat', casing_w=.08, head='flat',
                  interior=dict(self.rooms['bedroom'], depth=1.2, side=.25, sill_h=.6, ceil=.15), lod=lod)
        HP.gable_roof(mb, x, (z_face + back_z) / 2 + .08, z_face - back_z + .16, dw, top, .62, ou=(0.0, .12), ov=(.12, .12), along_x=False,
                      roof_col=self.c_roof, trim=T, wall_col=self.c_wall, lod=lod, gutters=(False, False), vent=False, frieze=False)

    # ------------------------------------------------------------------ garage
    def garage(self):
        if not self.hasG:
            return
        mb, h, lod = self.mb, self.h, self.lod
        gx, gw, gd, gh = self.gx, self.gw, self.gd, self.gh
        gf = self.gfront
        gs = self.gs
        T = self.c_trim
        z0, z1 = gf - gd, gf
        xo = gx + gs * gw / 2          # outer wall
        xi = gx - gs * gw / 2          # against the house
        sb = SIDING_BOTTOM
        dW, dH = self.gdoorW, self.gdoorH
        slab = .2
        front = Wall((gx - gw / 2, 0, z1), (1, 0, 0), (0, 0, 1), gw)
        hole = [(gw / 2 - dW / 2, gw / 2 + dW / 2, slab, slab + dH)]
        brick = h['brick'] == 'front' and self.merged_garage
        t = h['brickOut'] if brick else 0.0
        top = gh if not self.merged_garage else self.plate
        if brick:
            wall_surface(mb, front, -.05, top, hole, 'brick', self.c_brick, t=t, reveal=.12 + t, reveal_slot='brick', reveal_col=self.c_brick)
        else:
            wall_surface(mb, front, sb, top, hole, 'siding', self.c_wall, reveal=.12, reveal_slot='paint', reveal_col=T)
            mb.quad(front.p(0, -.7, -.015), front.p(gw, -.7, -.015), front.p(gw, sb + .02, -.015), front.p(0, sb + .02, -.015), 'concrete', self.c_found, n=V(0, 0, 1))
            # the slab edge at the opening
        mb.quad(front.p(gw / 2 - dW / 2, -.3, .0), front.p(gw / 2 + dW / 2, -.3, .0), front.p(gw / 2 + dW / 2, slab, .0), front.p(gw / 2 - dW / 2, slab, .0), 'concrete', self.c_found, n=V(0, 0, 1))
        # outer side wall with a service door and a window; back wall
        if gs > 0:
            side = Wall((xo, 0, z1), (0, 0, -1), (1, 0, 0), gd)
        else:
            side = Wall((xo, 0, z0), (0, 0, 1), (-1, 0, 0), gd)
        sd_c = gd * .32 if gs > 0 else gd * .68
        win_c = gd * .7 if gs > 0 else gd * .3
        holes = [(sd_c - .46, sd_c + .46, slab, slab + 2.03), (win_c - .45, win_c + .45, 1.2, 2.0)] if lod <= 1 else []
        wall_surface(mb, side, sb, top, holes, 'siding', self.c_wall, reveal=.1 if lod <= 1 else None, reveal_col=T)
        mb.quad(side.p(0, -.7, -.015), side.p(gd, -.7, -.015), side.p(gd, sb + .02, -.015), side.p(0, sb + .02, -.015), 'concrete', self.c_found, n=side.n)
        if lod <= 1:
            HP.entry_door(mb, side.frame(sd_c, slab, 0), col=self.c_door if self.rnd.random() < .5 else T, trim=T, style='flush', lod=lod, storm=False, surround='flat', knob=1)
            HP.window(mb, side.frame(win_c, 1.6, 0), .9, .8, lites='1/1', trim=T, casing='flat', casing_w=.08, head='flat', interior=dict(card=0, wall='garage_wall', floor='garage', garage=True, depth=2.0, sill_h=1.2), lod=1)
        if not self.merged_garage:
            back = Wall((xo, 0, z0), (-gs, 0, 0), (0, 0, -1), gw) if gs > 0 else Wall((xi, 0, z0), (1, 0, 0), (0, 0, -1), gw)
            if gs < 0:
                back = Wall((xi, 0, z0), (-1, 0, 0), (0, 0, -1), gw)
                back = Wall((gx + gw / 2, 0, z0), (-1, 0, 0), (0, 0, -1), gw)
            else:
                back = Wall((gx + gw / 2, 0, z0), (-1, 0, 0), (0, 0, -1), gw)
            wall_surface(mb, back, sb, top, [], 'siding', self.c_wall)
            mb.quad(back.p(0, -.7, -.015), back.p(gw, -.7, -.015), back.p(gw, sb + .02, -.015), back.p(0, sb + .02, -.015), 'concrete', self.c_found, n=back.n)
            # the strip of house wall exposed behind a shallower garage is the house's own side wall (built already)
            # garage roof: a lower side gable (ridge along x) dying into the house wall
            rise = 1.25 if not self.two else 1.45
            cxr = gx
            ou = [RAKE, RAKE]
            ou[0 if gs > 0 else 1] = 0.0
            HP.gable_roof(mb, gx - gs * .0, (z0 + z1) / 2, gw, gd, gh, rise, ou=tuple(ou), ov=(EAVE, EAVE), along_x=True, roof_col=self.c_roof, trim=T,
                          wall_col=self.c_wall, lod=lod, gutter_col=self.c_gutter, gable_walls=(gs < 0, gs > 0) if True else (True, True))
        # corner boards on the garage
        if lod <= 1 and not brick:
            for z in (z1,):
                mb.box((xo + gs * .025 - gs * .05, (sb + top) / 2, z + .0125), (.1, top - sb, .025), 'paint', T, skip=('-y', '+y'))
                mb.box((xo + gs * .0125, (sb + top) / 2, z - .0375), (.025, top - sb, .075), 'paint', T, skip=('-y', '+y'))
        # garage door (or, on the car house, an opening whose working door is a separate node) + trim
        Fd = front.frame(gw / 2, slab, t)
        if not h['dynamicGarage']:
            HP.garage_door(mb, HP.sub(Fd, 0, 0, -.1), dW, dH, col=self.c_gdoor, lod=lod, windows=self.rnd.random() < .45)
            # a dark garage behind the door's windows
            if lod == 0:
                HP.lquad(mb, Fd, [(-dW / 2, 0, -.16), (dW / 2, 0, -.16), (dW / 2, dH, -.16), (-dW / 2, dH, -.16)], 'interior', (1, 1, 1), uv=HP.rect_uv(HP.STRIP_UV['garage']), n=(0, 0, 1))
        for s in (-1, 1):
            HP.lbox(mb, Fd, (s * (dW / 2 + .07), dH / 2, .015), (.14, dH, .03), 'paint', T, skip=('-z',))
        HP.lbox(mb, Fd, (0, dH + .08, .015), (dW + .28, .16, .03), 'paint', T, skip=('-z',))
        if lod <= 1:
            for s in (-1, 1):
                HP.wall_lantern(mb, HP.sub(Fd, s * (dW / 2 + .5), 1.85), lod=lod)
        # hoop (the story's: exact board and rim positions from the plan)
        if h.get('hoop') and lod <= 1:
            b, rpos = h['hoop']['board'], h['hoop']['rim']
            HP.hoop(mb, (b[0], b[1], b[2] + .02), tuple(rpos), h['hoop']['rimR'], 2.5, gf + t, lod=lod)

    def garage_interior(self):
        """The car house's garage behind its working door: walls, ceiling, slab, shelving, a workbench, the water heater,
        the door into the house up two steps. The middle stays clear: the family's van parks there (ambient.js)."""
        if not (self.hasG and self.h['dynamicGarage']) or self.lod >= 2:
            return
        mb, lod = self.mb, self.lod
        gx, gw, gd, gh, gf, gs = self.gx, self.gw, self.gd, self.gh, self.gfront, self.gs
        x0, x1 = gx - gw / 2 + .16, gx + gw / 2 - .16
        zb, zf = gf - gd + .16, gf - .12
        y0, y1 = .2, gh - .05
        wallc = (1, 1, 1)
        WU = HP.STRIP_UV['garage_wall']
        BU = HP.STRIP_UV['garage']
        uvw = [(WU[0], WU[1]), (WU[0] + WU[2], WU[1]), (WU[0] + WU[2], WU[1] + WU[3]), (WU[0], WU[1] + WU[3])]
        # side walls (facing in), back wall (shelves painted in its strip), ceiling, slab
        mb.quad(V(x0, y0, zf), V(x0, y0, zb), V(x0, y1, zb), V(x0, y1, zf), 'interior', wallc, uv=uvw, n=V(1, 0, 0))
        mb.quad(V(x1, y0, zb), V(x1, y0, zf), V(x1, y1, zf), V(x1, y1, zb), 'interior', wallc, uv=uvw, n=V(-1, 0, 0))
        mb.quad(V(x0, y0, zb), V(x1, y0, zb), V(x1, y1, zb), V(x0, y1, zb), 'interior', wallc,
                uv=[(BU[0], BU[1]), (BU[0] + BU[2], BU[1]), (BU[0] + BU[2], BU[1] + BU[3]), (BU[0], BU[1] + BU[3])], n=V(0, 0, 1))
        mb.quad(V(x0, y1, zf), V(x0, y1, zb), V(x1, y1, zb), V(x1, y1, zf), 'interior', (.9, .9, .88), uv=HP.rect_uv(HP.STRIP_UV['ceiling']), n=V(0, -1, 0))
        mb.quad(V(x0, y0 + .002, zf + .1), V(x1, y0 + .002, zf + .1), V(x1, y0 + .002, zb), V(x0, y0 + .002, zb), 'concrete', self.T('concrete', (.42, .41, .39)), n=V(0, 1, 0))
        # the inside face of the front wall around the opening (seen when the door is up)
        dW, dH = self.gdoorW, self.gdoorH
        for (a, b, c, d) in [(x0, gx - dW / 2, y0, y1), (gx + dW / 2, x1, y0, y1), (gx - dW / 2, gx + dW / 2, y0 + dH, y1)]:
            mb.quad(V(a, c, zf), V(b, c, zf), V(b, d, zf), V(a, d, zf), 'interior', wallc, uv=uvw, n=V(0, 0, -1))
        # door-opener rail and motor
        mb.box((gx, y1 - .06, (zf + zb) / 2 + .6), (.05, .05, gd - 1.5), 'metal', (.3, .3, .3))
        mb.box((gx, y1 - .2, zb + 1.3), (.35, .18, .5), 'metal', (.75, .75, .72))
        mb.box((gx, y1 - .012, (zf + zb) / 2), (.9, .025, .4), 'light', (1.0, .9, .7))
        if lod == 0:
            # steel shelving along the outer wall, with storage bins
            wx = x1 - .3 if gs > 0 else x0 + .3
            for zc in (zb + .7, zb + 2.0):
                for y in (.35, .9, 1.45, 2.0):
                    mb.box((wx, y, zc), (.5, .03, 1.15), 'metal', (.4, .4, .38))
                for dx2 in (-.23, .23):
                    for dz in (-.55, .55):
                        mb.box((wx + dx2, 1.2, zc + dz), (.035, 2.0, .035), 'metal', (.4, .4, .38), skip=('-y', '+y'))
                for y in (.37, .92, 1.47):
                    for k, dz in enumerate((-.28, .28)):
                        c = [(.18, .3, .55), (.75, .7, .55), (.5, .16, .1), (.25, .38, .2)][(k + int(y * 3)) % 4]
                        mb.box((wx, y + .17, zc + dz), (.42, .32, .45), 'metal', c)
            # workbench and pegboard on the back wall, water heater in the house-side back corner
            bx = gx - gs * .6
            mb.box((bx, .9, zb + .32), (1.8, .06, .6), 'paint', self.T('paint', (.42, .3, .18)))
            for dxx in (-.82, .82):
                mb.box((bx + dxx, .55, zb + .32), (.06, .7, .5), 'paint', self.T('paint', (.32, .24, .15)), skip=('-y',))
            mb.box((bx, 1.5, zb + .015), (1.8, 1.0, .02), 'paint', self.T('paint', (.62, .5, .35)), skip=('-z',))
            hx = gx - gs * (gw / 2 - .5)
            mb.cylinder((hx, .2, zb + .45), (hx, 1.7, zb + .45), .28, 'metal', (.85, .84, .8), seg=12)
            # door into the house: two concrete steps and a landing
            ix = x0 + .01 if gs > 0 else x1 - .01
            iz = zb + gd * .55
            sgn = 1 if gs > 0 else -1
            for k, (yy, ww) in enumerate(((.38, .9), (.56, .6))):
                mb.box((ix + sgn * ww / 2, (y0 + yy) / 2, iz), (ww, yy - y0, 1.1), 'concrete', self.T('concrete', (.5, .49, .46)), skip=('-y',))
            HP.lquad(mb, (V(ix, .56, iz), V(0, 0, -sgn), V(0, 1, 0), V(sgn, 0, 0)), [(-.45, 0, .005), (.45, 0, .005), (.45, 2.03, .005), (-.45, 2.03, .005)], 'paint', self.c_door, n=(0, 0, 1))
            for dz in (-.5, .5):
                mb.box((ix + sgn * .03, 1.6, iz + dz), (.05, 2.1, .08), 'paint', self.c_trim)

    # ------------------------------------------------------------------ chimneys, utilities, gutters' downspouts
    def chimney(self):
        h, mb, lod = self.h, self.mb, self.lod
        if not h['chimney']:
            return
        W2, D2 = self.W2, self.D2
        ridge = self.plate + (self.rise if h['style'] != 'ranch' else D2 * self.pitch)
        if h['chimney'] == 'exterior':
            cs = -self.gs if self.hasG else 1
            cz = -h['depth'] * .12
            x = cs * (W2 + .42)
            top = ridge + .7
            HP.chimney(mb, x, cz, .78, .62, -.3, top, brick_col=self.c_brick, shoulder=(1.5, .7, 1.7), lod=lod)
        else:
            cx = (h['seeds'][2] - .5) * h['w'] * .5
            cz = -h['depth'] * .2
            top = ridge + .9 if h['style'] != 'frontgable' else self.plate + self.rise * .7 + .9
            if h['style'] == 'frontgable':
                cx = self.W2 * .45 * (1 if h['seeds'][2] > .5 else -1)
                cz = -D2 * .4
                top = self.plate + (self.W2 - abs(cx)) * self.pitch + 1.0
            base = self.plate - .5
            HP.chimney(mb, cx, cz, .75, .62, base, top, brick_col=self.c_brick, lod=lod)

    def utilities(self):
        h, mb, lod = self.h, self.mb, self.lod
        if lod >= 2:
            return
        W2, D2 = self.W2, self.D2
        # the service side: where the game's power drop lands (furniture.js: x = garage? -gs*w/2 : w/2, z = front-1.2, y = h-.35)
        s = -self.gs if self.hasG else 1
        wall = self.wall_objs['left' if s < 0 else 'right']
        zc = D2 - 1.2
        c = (zc + D2) if s < 0 else (D2 - zc)
        drop_y = self.plate - .35
        # service entrance cable from the drop point down to the meter
        F = wall.frame(c, drop_y, 0)
        HP.lbox(mb, F, (0, 0, .05), (.06, .12, .1), 'metal', (.15, .15, .15))           # the drop's clevis/insulator bracket
        HP.lbox(mb, F, (0, -(drop_y - 1.75) / 2 - .06, .03), (.035, drop_y - 1.75, .03), 'metal', (.12, .12, .12))
        HP.meter(mb, wall.frame(c, 1.55, 0), lod=lod)
        self.service = tuple(HP.P(F, 0, 0, .1))
        if lod == 0:
            HP.hose_bib(mb, wall.frame(c + (.9 if s < 0 else -.9) * 0 + 1.4, .62, 0), hose=self.rnd.random() < .7, lod=lod)
            HP.dryer_vent(mb, wall.frame(max(.6, c - 3.0 if s > 0 else c - 3.0), .55, 0), lod=lod)
            # gas meter low on the same wall
            G = wall.frame(c - 1.1, .5, 0)
            HP.lbox(mb, G, (0, .1, .12), (.3, .32, .18), 'metal', (.55, .56, .52))
            HP.lbox(mb, G, (0, -.25, .08), (.04, .4, .04), 'metal', (.3, .3, .28))
        # AC condenser where the procedural house had it (keeps the yard layout)
        if h['ac']:
            ax = s * (W2 + .55)
            az = D2 * .3 if False else -D2 * .45
            HP.ac_unit(mb, (ax, 0, az), 0, lod=lod)
            if lod == 0:
                mb.span((s * W2, .5, az + .2), (ax - s * .38, .5, az + .2), .025, .025, 'metal', (.15, .15, .15))
                mb.span((s * W2, .45, az + .26), (ax - s * .38, .45, az + .26), .02, .02, 'bare', (.55, .35, .2))

    def downspouts(self):
        h, mb, lod = self.h, self.mb, self.lod
        if lod >= 2:
            return
        W2, D2 = self.W2, self.D2
        st = h['style']
        slope_y = lambda o: self.plate - o * (self.rise / (W2 if st == 'frontgable' else D2) if st != 'ranch' else self.pitch)
        ye = self.plate - EAVE * ((self.rise / W2) if st == 'frontgable' else (self.rise / D2 if st not in ('ranch',) else self.pitch))
        gy = ye - .07 - .03 - .12
        col = self.c_down
        if st == 'frontgable':
            for sx in (-1, 1):
                for sz in (-1, 1):
                    if self.hasG and sx == self.gs and sz > 0:
                        continue
                    z = sz * (D2 - .25)
                    top = (sx * (W2 + EAVE + .06), gy, z)
                    HP.downspout(mb, top, (sx * W2, gy - .3, z), 0.0, (sx, 0, 0), col, lod=lod)
        else:
            xa, xb = self.roof_span
            for sz in (-1, 1):
                for (x, sx) in ((xa + .25, -1), (xb - .25, 1)):
                    top = (x, gy, sz * (D2 + EAVE + .06))
                    HP.downspout(mb, top, (x, gy - .3, sz * D2), 0.0, (0, 0, sz), col, lod=lod)
        if self.hasG and not self.merged_garage:
            gy2 = self.gh - EAVE * (1.25 / (self.gd / 2)) - .22
            xo = self.gx + self.gs * (self.gw / 2 - .25)
            for sz, z in ((1, self.gfront), (-1, self.gfront - self.gd)):
                HP.downspout(mb, (xo, gy2, z + sz * (EAVE + .06)), (xo, gy2 - .3, z), 0.0, (0, 0, sz), col, lod=lod)

    # ------------------------------------------------------------------ all
    def build(self):
        self.layout()
        self.walls()
        self.place_windows()
        self.front_door()
        self.entry()
        self.roofs()
        self.garage()
        self.garage_interior()
        self.chimney()
        self.utilities()
        self.downspouts()
        return self.mb


def car_garage_door(h, tints, lod):
    """The car house's working garage door, as its own mesh in the dynamic panel's frame (world.js makeGarage: the
    panel group sits at (garage x, garage y + doorH/2, front - 0.1) and turns up into the garage)."""
    G = h['garageInfo']
    mb = MB(f"{h['id']}:garage_door:lod{lod}")
    col = tints('paint', lin(h['garageColor']))
    F = (V(0, 0, 0), V(1, 0, 0), V(0, 1, 0), V(0, 0, 1))
    HP.garage_door(mb, F, G['doorW'] - .04, G['doorH'], col=col, lod=lod, windows=True, origin_at_centre=True, z=.03)
    # the back of the panel (seen from inside when it is up)
    HP.lquad(mb, F, [(-(G['doorW'] - .04) / 2, -G['doorH'] / 2, -.03), ((G['doorW'] - .04) / 2, -G['doorH'] / 2, -.03), ((G['doorW'] - .04) / 2, G['doorH'] / 2, -.03), (-(G['doorW'] - .04) / 2, G['doorH'] / 2, -.03)], 'paint', mix(col, (0, 0, 0), .15), n=(0, 0, -1))
    return mb
