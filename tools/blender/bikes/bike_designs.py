"""The four boys' bicycles, each designed against its own riding anchors (anchors.json <- dist/rig.js).

    bike.jamie   youth BMX (22-inch wheels), rust red      - compact frame with gussets, 4 pegs, pads, U-brake, 25/9
    bike.sam     youth mountain bike (24-inch), steel teal  - sloping alloy frame, suspension fork, 3x7, V-brakes, bottle
    bike.alex    youth cruiser (24-inch), olive green       - cantilever frame, swept bars, coaster brake, rack, bell
    bike.player  youth hybrid / "road-kid" (24-inch)        - diamond frame, riser bar, 1x7, V-brakes, bell, reflectors

A design returns {node: kit.Mesh}. Nodes are the game's moving groups (rig.js createBike): frame, steer, wheel_front,
wheel_rear, crank, pedal_l, pedal_r, kickstand, bell_lever (bikes with a bell), chain. Everything is modelled in the
assembled rest pose: wheel 0, crank 0 (right arm up), steer 0, kickstand stowed.
"""
import math
from mathutils import Vector, Quaternion
import bike_kit as K
import bike_parts as BP
from bike_parts import X, Y, Z
from bike_kit import V, TAU

NODES = ('frame', 'steer', 'wheel_front', 'wheel_rear', 'crank', 'pedal_l', 'pedal_r', 'kickstand', 'bell_lever', 'chain')


def new_nodes():
    return {n: K.Mesh() for n in NODES}


def mirror_x(p):
    return Vector((-p.x, p.y, p.z))


# ----------------------------------------------------------------------------------------------------------------------
# Shared sub-assemblies
# ----------------------------------------------------------------------------------------------------------------------
def rear_triangle(C, fb, m, *, st_attach, ss_r, cs_r, dropout_x, cs_flare=.05, ss_join_dx=.021, bridge_ss=None,
                  bridge_cs=None, cs_pts=None, hanger=False, do_pid=None):
    """Chainstays from the BB shell to the rear dropouts and seatstays from the seat tube to the dropouts."""
    rear = C.rear
    for s in (-1, 1):
        sx = s
        # chainstays: leave the BB shell, flare out round the tyre, run straight to the dropout
        a = C.bb + V(sx * .026, -.002, .012)
        b = rear + V(sx * dropout_x, .006, -.014)
        mid1 = C.bb.lerp(rear, .22) + V(sx * cs_flare * .82, .0, 0)
        mid2 = C.bb.lerp(rear, .55) + V(sx * cs_flare, .002, 0)
        path = K.catmull([a, mid1, mid2, b], 5 if C.lod == 0 else 2)
        sc = [1.0 - .18 * i / (len(path) - 1) for i in range(len(path))]
        fb.curved(f'cs{s}', path, cs_r, 12, scales=sc)
        # seatstays
        top = st_attach + V(sx * ss_join_dx, 0, .006)
        bot = rear + V(sx * dropout_x, .014, -.004)
        fb.straight(f'ss{s}', top, bot, ss_r, 12, r2=ss_r * .82)
        if do_pid:
            BP.dropout(C, m, do_pid, rear, sx, toward=(top - bot).normalized() + (a - b).normalized(), up=Y, hanger=hanger and s > 0)
    if bridge_ss is not None and C.lod < 2:
        y = bridge_ss
        def on(sname, yy):
            a, b = fb.members[sname][0], fb.members[sname][1]
            t = (yy - a.y) / (b.y - a.y)
            return a.lerp(b, t)
        fb.straight('ssb', on('ss-1', y), on('ss1', y), ss_r * .8, 10)
    if bridge_cs is not None and C.lod < 2:
        z = bridge_cs
        pl, pr = fb.members['cs-1'][3], fb.members['cs1'][3]
        def onz(path, zz):
            for i in range(len(path) - 1):
                if path[i].z <= zz <= path[i + 1].z:
                    t = (zz - path[i].z) / (path[i + 1].z - path[i].z)
                    return path[i].lerp(path[i + 1], t)
            return path[-1]
        fb.straight('csb', onz(pl, z), onz(pr, z), cs_r * .85, 10)


def front_fork_rigid(C, m, pid, *, crown_y, leg_r, leg_r2, spread, crown_off, curve=0.0, crown_pid=None, bosses=False,
                     boss_pid=None, dropout_pid=None):
    """A rigid fork: crown on the steering axis, two legs to the (authored) front axle. curve > 0 bends the lower legs
    forward (cruiser / hybrid look); 0 = straight legs parallel to the steerer (BMX)."""
    crown_c = C.axis_at(crown_y)
    F, D = C.F, C.D
    # crown: a rounded block square to the steering axis
    hw = spread + leg_r * 1.15
    outline = [(-hw * .35, -.016), (hw * .35, -.016), (hw, -.006 + crown_off * .5), (hw, crown_off + .008),
               (hw * .6, crown_off + .015), (-hw * .6, crown_off + .015), (-hw, crown_off + .008), (-hw, -.006 + crown_off * .5)]
    K.slab(m, outline, .017, crown_pid or pid, origin=crown_c - D * .002, u=X, v=F, chamfer=.0035 if C.lod == 0 else 0)
    legs = []
    for s in (-1, 1):
        top = crown_c + X * (s * spread) + F * crown_off - D * .008
        bot = C.front + X * (s * (spread * .2 + .044)) + D * .012
        L = (top - bot).length
        if curve > 0:
            p1 = top - D * (L * .45)
            p2 = bot + D * (L * .22) - F * (curve * .9)
            path = K.bezier(top, p1, p2, bot, 9 if C.lod == 0 else 4)
        else:
            path = [top, top.lerp(bot, .5), bot]
        sc = [1 + (leg_r2 / leg_r - 1) * i / (len(path) - 1) for i in range(len(path))]
        K.sweep(m, path, K.circle_profile(leg_r, C.n(14, 5)), pid, scales=sc)
        legs.append(path)
        if dropout_pid:
            u = (top - bot).normalized()
            K.slab(m, [(-.012, -.009), (.02, -.011), (.026, .0), (.018, .01), (-.01, .009)], .005, dropout_pid,
                   origin=C.front + X * (s * .0525), u=u, v=X.cross(u).normalized(), holes=[K.circle2(.005, 8)] if C.lod == 0 else [],
                   chamfer=.0008 if C.lod == 0 else 0)
        if bosses and C.lod < 2:
            # V-brake boss on the leg at rim height (above the axle along the leg)
            p = bot + (top - bot).normalized() * .232
            K.tube(m, p + X * (s * leg_r * .6), p + X * (s * (leg_r + .016)), .0055, C.n(8, 4), boss_pid or pid)
    return crown_c, legs


def steerer(C, m, pid, y_bot, y_top, r=.0143):
    K.tube(m, C.axis_at(y_bot), C.axis_at(y_top), r, C.n(16, 6), pid, caps=(False, True))


def v_brake(C, m, boss, side, up, inward, pid_arm, pid_pad, pid_noodle=None, arm_len=.105, pad_rad=None):
    """A linear-pull (V) brake arm on a boss: arm up from the boss, pad toward the rim."""
    s = side
    base = boss + X * (s * .018)
    top = base + up * arm_len + X * (s * .004)
    pts = [base, base + up * .03 + X * (s * .009), top]
    K.sweep(m, K.catmull(pts, 3 if C.lod == 0 else 1), [(-.0045, -.007), (.0045, -.007), (.0055, .007), (-.0055, .007)], pid_arm,
            ref=X)
    # pad on a post toward the rim
    pad_c = base + up * .028 - X * (s * .012)
    pad_o = K.rounded_rect(.05, .013, .004, 2) if C.lod == 0 else [(-.025, -.0065), (.025, -.0065), (.025, .0065), (-.025, .0065)]
    if C.lod < 2:
        K.slab(m, pad_o, .009, pid_pad, origin=pad_c - X * (s * .004), u=inward, v=X.cross(inward).normalized(), chamfer=.001 if C.lod == 0 else 0)
    K.tube(m, base + up * .028, pad_c + X * (s * .002), .003, 6, pid_arm)
    return top


def chain_circles(C, *, ring_r, cog_r, cog_x, rd=None):
    ring = (Vector((cog_x, C.bb.y, C.bb.z)), ring_r, -1)
    cog = (Vector((cog_x, C.rear.y, C.rear.z)), cog_r, -1)
    if rd:
        up, lo, pr = rd
        return [ring, cog, (up, pr, 1), (lo, pr, -1)]
    return [ring, cog]


# ----------------------------------------------------------------------------------------------------------------------
# JAMIE — youth BMX
# ----------------------------------------------------------------------------------------------------------------------
def design_jamie(C, col, harvest=None):
    N = new_nodes()
    pid = C.pid
    PAINT = pid('frame', 'paint', 'paint')
    WELD = pid('weld', 'paint', 'paint_weld')
    DT, TT, ST = pid('frame_dt', 'paint', 'paint'), pid('frame_tt', 'paint', 'paint'), pid('frame_st', 'paint', 'paint')
    FORK = pid('fork', 'paint', 'paint')
    CHROME = pid('bars', 'hardware', 'chrome')
    BLACK = pid('black_hw', 'hardware', 'steel_black')
    ALLOY = pid('alloy', 'hardware', 'alloy')
    ZINC = pid('bolts', 'hardware', 'zinc')
    RIM = pid('rim', 'hardware', 'alloy_black')
    SPOKE = pid('spokes', 'hardware', 'spoke')
    NIP = pid('nipples', 'hardware', 'alloy')
    HUB = pid('hub', 'hardware', 'alloy_black')
    CHAIN = pid('chain', 'hardware', 'chain')
    PEG = pid('pegs', 'hardware', 'peg')
    TYRE = pid('tyre', 'soft', 'tyre_street')
    GRIP = pid('grips', 'soft', 'rubber_grip')
    SEAT = pid('saddle', 'soft', 'vinyl')
    PAD = pid('pads', 'soft', 'foam_pad')
    PEDAL = pid('pedals', 'soft', 'plastic_pedal')
    CABLE = pid('cable', 'soft', 'cable')
    BRAKEPAD = pid('brake_pads', 'soft', 'brake_pad')
    VALVE = pid('valve', 'hardware', 'alloy_black')
    col.update({'frame_dt': 0xb2553a, 'frame_tt': 0xb2553a, 'frame_st': 0xb2553a, 'frame': 0xb2553a, 'fork': 0xb2553a, 'weld': 0xb2553a, 'pads': 0x2d4a7a, 'grips': 0x1c1c1e,
                'saddle': 0x262626, 'tyre': 0x2b2c2e, 'pedals': 0x1f1f21})

    f = N['frame']
    fb = BP.FrameBuilder(C, f, PAINT, WELD, weld_r=.0019)
    # head tube on the steering axis; the bars and stem need its top at about rig.js's own head point (0.82 m)
    ht_b, ht_t = BP.head_tube(C, f, PAINT, .695, .818, .0192)
    fb.members['ht'] = (ht_b, ht_t, .0192)
    # seat tube along the line from the BB to the saddle clamp
    clamp = C.saddle - V(0, .052, 0)
    st_dir = (clamp - C.bb).normalized()
    st_top = C.bb + st_dir * .315
    fb.straight('st', C.bb, st_top, .0143, 16, pid=ST)
    # top tube: head tube (upper) to the seat tube just under its top; down tube: head tube (lower) to the BB
    tt_a = ht_b.lerp(ht_t, .74) + C.F * -.004
    tt_b = st_top - st_dir * .026
    fb.straight('tt', tt_a, tt_b, .0143, 16, pid=TT)
    dt_a = ht_b.lerp(ht_t, .26)
    fb.straight('dt', dt_a, C.bb + V(0, .004, -.004), .0159, 16, pid=DT)
    BP.bb_shell(C, f, PAINT, width=.068, r=.0215)
    fb.members['bb'] = (C.bb - X * .034, C.bb + X * .034, .0215)
    # gussets under the top tube and down tube at the head tube (a BMX hallmark)
    if C.lod < 2:
        for (a, b) in ((tt_a, tt_b), (dt_a, C.bb)):
            d = (b - a).normalized()
            p0 = ht_b.lerp(ht_t, .5)
            g = [(0, 0), (.06, 0), (.0, .03)]
        gus_o = [(.0, -.002), (.074, .003), (.02, .032)]
        org = tt_a + (tt_b - tt_a).normalized() * .012
        u = (tt_b - tt_a).normalized()
        v = X.cross(u).normalized()
        if v.y > 0:
            v = -v
        K.slab(f, gus_o, .0035, PAINT, origin=org + v * .012, u=u, v=v, chamfer=.0006)
    rear_triangle(C, fb, f, st_attach=st_top - st_dir * .012, ss_r=.0088, cs_r=.0108, dropout_x=.0545, cs_flare=.046,
                  bridge_ss=C.rear.y + .29, bridge_cs=C.bb.z + .145, do_pid=PAINT)
    for b, mname in (('tt', 'ht'), ('dt', 'ht'), ('tt', 'st'), ('dt', 'bb'), ('st', 'bb')):
        fb.weld(b, mname, end=1)
    for s in (-1, 1):
        fb.weld(f'ss{s}', 'st', end=0)
    BP.seat_collar(C, f, st_top, st_dir, .0143, BLACK, ZINC)
    # cable guides along the top tube
    if C.lod == 0:
        for t in (.25, .7):
            p = tt_a.lerp(tt_b, t) + V(0, .0155, 0)
            K.box(f, p, (.008, .004, .014), ZINC, u=X, v=Y)
    # rear pegs over the axle ends and axle
    for s in ((-1, 1) if C.lod < 2 else ()):
        K.lathe(f, [(0, .006), (0, .0185), (.003, .0192), (.094, .0192), (.1, .0172), (.1, .006)], C.n(18, 6), PEG,
                origin=C.rear + X * (s * .058), axis=X * s, ref=Y, sharp=(1, 4))
    # seatpost and saddle
    sp_top = C.saddle - V(0, .03, 0)
    BP.seatpost(C, f, st_top - st_dir * .05, sp_top, .0127, CHROME, None if harvest else BLACK, style='micro')
    if not harvest:
        BP.saddle(C, f, C.saddle + V(0, -.004, .006), SEAT, SEAT, length=.235, w_rear=.128, w_nose=.052, h=.042, sag=.006,
                  nose_drop=.004, tail_up=.012, style='bmx')
    # kickstand mount on the left chainstay
    kp = V(*C.A['kickPivot'])
    BP.kickstand_mount(C, f, kp, BLACK, ZINC)
    BP.kickstand(C, N['kickstand'], kp, BLACK, PEDAL)

    # ---- rear U-brake on the seatstays (kit version; the harvested Sketchfab U-brake replaces it when available)
    ss = fb.members['ss1']
    if not harvest:
        for s in (-1, 1):
            a, b = fb.members[f'ss{s}'][0], fb.members[f'ss{s}'][1]
            boss = b.lerp(a, .48)
            K.tube(f, boss, boss + X * (s * .02), .0055, 8, ZINC)
            arm = [boss + X * (s * .02), boss + X * (s * .03) + V(0, .05, -.02), boss + V(0, .085, -.032) + X * (s * .012)]
            K.sweep(f, K.catmull(arm, 3), [(-.004, -.006), (.004, -.006), (.004, .006), (-.004, .006)], BLACK, ref=X)
            K.slab(f, K.rounded_rect(.045, .012, .004, 2), .008, BRAKEPAD, origin=boss + X * (s * .012) + V(0, -.012, .004), u=-Z, v=Y)

    # ---- steering: fork, steerer, headset, stem, bars, pad, grips, lever, front pegs
    s_ = N['steer']
    crown_y = ht_b.y - .022
    front_fork_rigid(C, s_, FORK, crown_y=crown_y, leg_r=.0142, leg_r2=.0118, spread=.052, crown_off=C.front_offset * .95,
                        curve=0.0, crown_pid=FORK, dropout_pid=FORK)
    steerer(C, s_, ALLOY, crown_y, ht_t.y + .06)
    stack = BP.headset_stack(C, s_, ht_t, ht_b, BLACK, BLACK, .0143, spacer_h=.006, frame_m=f)
    # top-load BMX stem (kit version; the harvested stem replaces it): steerer clamp + bar clamp on top, forward
    clamp_c = stack + C.D * .036 + C.F * .046
    if not harvest:
        K.lathe(s_, [(0, .0145), (0, .0215), (.042, .0215), (.042, .0145)], C.n(18, 6), BLACK, origin=stack, axis=C.D, ref=X,
                sharp=(1, 2))
        K.slab(s_, K.rounded_rect(.075, .052, .012, 3), .022, BLACK, origin=stack + C.D * .028 + C.F * .022, u=C.F, v=X,
               chamfer=.003)
    # 2-piece BMX bars: clamp section, uprights with up/back sweep, crossbar, grip sections
    gr = C.grip_r
    cy, cz = clamp_c.y, clamp_c.z
    bar_r = .0111
    paths = []
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        p = [V(0, cy, cz), V(s * .042, cy, cz), V(s * .085, cy + .03, cz + .008), V(s * .158, g.y - .022, g.z - .004),
             V(s * .19, g.y, g.z), V(s * .345, g.y, g.z)]
        path = K.fillet(p, [.02, .04, .03, .04], 6 if C.lod == 0 else 2)
        K.sweep(s_, path, K.circle_profile(bar_r, C.n(12, 6)), CHROME, caps=(False, True))
        paths.append(p)
    # crossbar between the uprights
    def up_at(p, y):
        a, b = p[2], p[3]
        t = (y - a.y) / (b.y - a.y)
        return a.lerp(b, t)
    cb_y = cy + .118
    ca, cb = up_at(paths[0], cb_y), up_at(paths[1], cb_y)
    K.tube(s_, ca, cb, .0095, C.n(12, 5), CHROME)
    # crossbar pad (the procedural bike's blue pad), a little worn
    K.lathe(s_, [(0, .009), (0, .021), (.006, .0235), (.168, .0235), (.174, .021), (.174, .009)], C.n(16, 6), PAD,
            origin=ca.lerp(cb, .5) - X * .087, axis=X, ref=Y, sharp=(1, 4))
    # grips (flanged BMX grips), bar-end plugs
    for s in (-1, 1):
        end = V(s * .345, gr.y, gr.z)
        BP.grip(C, s_, end + X * (s * .0005), X * s, GRIP, length=.126, r=.0162, flange=True)
    # rear brake lever on the right (US: right lever = rear brake), cable looping forward and down to the top tube
    lever_pt = V(.205, gr.y, gr.z)
    if harvest:
        exit_ = lever_pt + V(-.03, .004, -.025)
    else:
        exit_ = BP.brake_lever(C, s_, lever_pt, X, 1, BLACK, BLACK, reach=.085, droop=.75)
    # front pegs: on the fork's axle ends, they steer with the fork
    for s in ((-1, 1) if C.lod < 2 else ()):
        K.lathe(s_, [(0, .006), (0, .0185), (.003, .0192), (.094, .0192), (.1, .0172), (.1, .006)], C.n(18, 6), PEG,
                origin=C.front + X * (s * .058), axis=X * s, ref=Y, sharp=(1, 4))
    # cable: lever -> loop in front of the bars -> top tube guide (frame side is static: the loop's end is on the frame)
    tt_guide = tt_a.lerp(tt_b, .25) + V(0, .02, 0)
    BP.cable(C, s_, [exit_, exit_ + V(-.03, -.05, -.06), clamp_c + C.F * .07 + V(.02, -.08, 0), stack + C.F * .05 - C.D * .09], CABLE)
    BP.cable(C, f, [stack + C.F * .05 - C.D * .09 + V(0, 0, .0), ht_b.lerp(ht_t, .9) + V(.022, .0, .03), tt_guide,
                    tt_a.lerp(tt_b, .7) + V(0, .02, 0), st_top + V(.0, -.03, .05), fb.members['ss1'][0].lerp(fb.members['ss1'][1], .3) + V(.0, .03, 0)],
             CABLE)

    # ---- wheels: 22-inch (ISO 457) double-wall black rims, 36 spokes 3-cross, street tyres
    for node, axle, hub in (('wheel_front', C.front, 'front'), ('wheel_rear', C.rear, 'rear')):
        BP.wheel(C, N[node], axle=axle, bead_r=.2285, rim_w=.034, rim_depth=.021, tyre_w=.058, tyre_h=C.R - .2285, rim_pid=RIM,
                 tyre_pid=TYRE, hub_pid=HUB, spoke_pid=SPOKE, nip_pid=NIP, spokes=36, cross=3, hub=hub, flange_r=.0285,
                 flange_x=(-.031, .031) if hub == 'front' else (-.03, .024), tread='street', valve_pid=VALVE)
    # rear driver: 16 teeth behind a 36-tooth sprocket (classic 2011 youth BMX gearing), 9 behind a 25 (micro drive)
    cog_teeth = 16 if harvest else 9
    BP.sprocket(C, N['wheel_rear'], C.rear, .046, cog_teeth, BLACK, thick=.003, ppt=6 if cog_teeth < 12 else 4)
    for s in (-1, 1):
        BP.axle_nut(C, f, ZINC, C.rear, s, gap=.0565, size=.017)
    # ---- crank: 3-piece arms, 25-tooth sprocket
    cr = N['crank']
    for s in (-1, 1):
        BP.crank_arm(C, cr, C.bb, s, C.crank_len, BLACK, x=s * .0615, width=(.036, .025), thick=.0135)
    K.tube(cr, C.bb + V(-.058, 0, 0), C.bb + V(.058, 0, 0), .0095, C.n(12, 5), BLACK)
    holes = BP.ring_holes(5, .03, .0085, phase=.3)
    if not harvest:
        Rp = BP.sprocket(C, cr, C.bb, .046, 25, ALLOY, holes=holes, thick=.0045)
    # ---- pedals
    for node, s in (('pedal_l', -1), ('pedal_r', 1)):
        if not harvest:
            c = V(*(C.A['pedalL0'] if s < 0 else C.A['pedalR0']))
            BP.pedal_platform(C, N[node], c, s, PEDAL, ZINC, pid_pin=ZINC, w=.088, l=.098, h=.022, style='bmx')
    # ---- the harvested Sketchfab components (CC BY 4.0, geometry only, re-textured), fitted to Jamie's anchors
    if harvest:
        hp = {'sprocket': ALLOY, 'pedal': PEDAL, 'seat': SEAT, 'stem': pid('stem', 'hardware', 'alloy_black'), 'lever': BLACK,
              'ubrake': BLACK}
        ssl, ssr = fb.members['ss-1'], fb.members['ss1']
        boss_l, boss_r = ssl[1].lerp(ssl[0], .5), ssr[1].lerp(ssr[0], .5)
        ss_dir = ((ssr[0] - ssr[1]).normalized())
        extra = {'stack': stack, 'lever': lever_pt, 'ss_dir': ss_dir, 'ubrake': (boss_l + boss_r) / 2 + ss_dir * .02}
        H = harvest(C, hp, extra)
        f.extend(H['seat'])
        s_.extend(H['stem'])
        if C.lod < 2:
            f.extend(H['ubrake'])
            s_.extend(H['lever'])
        cr.extend(H['sprocket'])
        N['pedal_l'].extend(H['pedal_l'])
        N['pedal_r'].extend(H['pedal_r'])
        C.harvested = True
    # ---- chain round the sprocket that is actually there (the harvested one is measured), on a matching rear cog
    ring_teeth = (H.get('sprocket_teeth') if harvest else None) or 25
    Rring = K.sprocket_outline(ring_teeth)[1]
    Rcog = K.sprocket_outline(cog_teeth)[1]
    BP.chain_and_path(C, N['chain'], chain_circles(C, ring_r=Rring, cog_r=Rcog, cog_x=.046), CHAIN, roller_pid=CHAIN)
    return N


# ----------------------------------------------------------------------------------------------------------------------
# SAM — youth mountain bike
# ----------------------------------------------------------------------------------------------------------------------
def design_sam(C, col, harvest=None):
    N = new_nodes()
    pid = C.pid
    PAINT = pid('frame', 'paint', 'paint')
    WELD = pid('weld', 'paint', 'paint_weld')
    DT, TT, ST = pid('frame_dt', 'paint', 'paint'), pid('frame_tt', 'paint', 'paint'), pid('frame_st', 'paint', 'paint')
    FORKLOW = pid('fork_lowers', 'hardware', 'alloy_black')
    STANCH = pid('stanchions', 'hardware', 'chrome')
    BLACK = pid('black_hw', 'hardware', 'alloy_black')
    ALLOY = pid('alloy', 'hardware', 'alloy')
    ZINC = pid('bolts', 'hardware', 'zinc')
    RIM = pid('rim', 'hardware', 'alloy')
    SPOKE = pid('spokes', 'hardware', 'spoke')
    NIP = pid('nipples', 'hardware', 'alloy')
    HUB = pid('hub', 'hardware', 'alloy')
    CHAIN = pid('chain', 'hardware', 'chain')
    COG = pid('cogs', 'hardware', 'steel_cog')
    TYRE = pid('tyre', 'soft', 'tyre_knobby')
    GRIP = pid('grips', 'soft', 'rubber_grip')
    SHIFT = pid('shifters', 'soft', 'plastic')
    SEAT = pid('saddle', 'soft', 'vinyl')
    PEDAL = pid('pedals', 'soft', 'plastic_pedal')
    CABLE = pid('cable', 'soft', 'cable')
    BRAKEPAD = pid('brake_pads', 'soft', 'brake_pad')
    BOTTLE = pid('bottle', 'soft', 'bottle')
    CAP = pid('bottle_cap', 'soft', 'plastic')
    GUARD = pid('ring_guard', 'soft', 'plastic')
    VALVE = pid('valve', 'hardware', 'alloy')
    col.update({'frame_dt': 0x4d7f8f, 'frame_tt': 0x4d7f8f, 'frame_st': 0x4d7f8f, 'frame': 0x4d7f8f, 'weld': 0x4d7f8f, 'grips': 0x303032, 'saddle': 0x1e1e20, 'tyre': 0x27282a,
                'bottle': 0x3a86c8, 'bottle_cap': 0xe8e6de, 'shifters': 0x2a2b2d, 'ring_guard': 0x232425, 'pedals': 0x242526})
    f = N['frame']
    fb = BP.FrameBuilder(C, f, PAINT, WELD, weld_r=.0021)
    ht_b, ht_t = BP.head_tube(C, f, PAINT, .735, .862, .0188, flare=.0012)
    fb.members['ht'] = (ht_b, ht_t, .0188)
    clamp = C.saddle - V(0, .052, 0)
    st_dir = (clamp - C.bb).normalized()
    st_top = C.bb + st_dir * .372
    fb.straight('st', C.bb, st_top, .0146, 16, pid=ST)
    tt_a = ht_b.lerp(ht_t, .78)
    tt_b = st_top - st_dir * .055
    fb.straight('tt', tt_a, tt_b, .0162, 16, pid=TT)
    dt_a = ht_b.lerp(ht_t, .3)
    fb.straight('dt', dt_a, C.bb + V(0, .005, -.006), .0186, 18, pid=DT)
    BP.bb_shell(C, f, PAINT, width=.068, r=.0205)
    fb.members['bb'] = (C.bb - X * .034, C.bb + X * .034, .0205)
    rear_triangle(C, fb, f, st_attach=tt_b - st_dir * .012, ss_r=.0082, cs_r=.0098, dropout_x=.0565, cs_flare=.05,
                  bridge_ss=C.rear.y + .3, bridge_cs=C.bb.z + .14, hanger=True, do_pid=PAINT)
    for b, mname in (('tt', 'ht'), ('dt', 'ht'), ('tt', 'st'), ('dt', 'bb'), ('st', 'bb')):
        fb.weld(b, mname, end=1)
    for s in (-1, 1):
        fb.weld(f'ss{s}', 'st', end=0)
    BP.seat_collar(C, f, st_top, st_dir, .0146, ALLOY, ZINC, qr=True)
    # V-brake bosses on the seatstays and the rear V-brake
    rb = None
    for s in (-1, 1):
        a, b = fb.members[f'ss{s}'][0], fb.members[f'ss{s}'][1]
        boss = b + (a - b).normalized() * .236
        K.tube(f, boss, boss + X * (s * .016), .0055, C.n(8, 4), ZINC)
        top = v_brake(C, f, boss, s, (a - b).normalized(), -Z, ALLOY, BRAKEPAD)
        if s > 0:
            rb = top
    # bottle bosses, cage and bottle on the down tube
    dt0, dt1 = fb.members['dt'][0], fb.members['dt'][1]
    ddir = (dt1 - dt0).normalized()
    up_dt = X.cross(ddir).normalized()
    if up_dt.y < 0:
        up_dt = -up_dt
    cage_c = dt0.lerp(dt1, .55) + up_dt * (.0186 + .038)
    if C.lod < 2:
        K.lathe(f, [(0, .0001), (0, .03), (.01, .0355), (.17, .0355), (.185, .029), (.19, .012), (.205, .012), (.205, .0001)],
                C.n(20, 8), BOTTLE, origin=cage_c - ddir * .1, axis=-ddir, ref=X, sharp=(1,))
        K.lathe(f, [(0, .0001), (0, .0128), (.016, .0128), (.02, .006), (.02, .0001)], C.n(12, 6), CAP,
                origin=cage_c - ddir * .1 - ddir * .2, axis=-ddir, ref=X)
        for s in ((-1, 1) if C.lod == 0 else ()):
            pts = [dt0.lerp(dt1, .48) + up_dt * .019 + X * (s * .006), cage_c + ddir * .05 + X * (s * .033) - up_dt * .012,
                   cage_c - ddir * .08 + X * (s * .034), cage_c - ddir * .095 + X * (s * .01) + up_dt * .03]
            K.sweep(f, K.catmull(pts, 4 if C.lod == 0 else 2), K.circle_profile(.0026, C.n(6, 3)), BLACK)
        K.sweep(f, K.catmull([cage_c + ddir * .1 - up_dt * .026 + X * -.02, cage_c + ddir * .12 - up_dt * .03,
                              cage_c + ddir * .1 - up_dt * .026 + X * .02], 3), K.circle_profile(.0026, 5), BLACK)
    # seatpost, saddle with rails
    sp_top = C.saddle - V(0, .04, -.004)
    BP.seatpost(C, f, st_top - st_dir * .06, sp_top, .0136, ALLOY, BLACK)
    BP.saddle_rails(C, f, C.saddle + V(0, -.012, .0), ALLOY)
    BP.saddle(C, f, C.saddle + V(0, .0, .004), SEAT, SEAT, length=.255, w_rear=.145, w_nose=.048, h=.05, sag=.009, style='sport')
    kp = V(*C.A['kickPivot'])
    BP.kickstand_mount(C, f, kp, BLACK, ZINC)
    BP.kickstand(C, N['kickstand'], kp, ALLOY, PEDAL)
    # front derailleur on the seat tube, cables under the BB to the derailleurs
    fd_c = C.bb + st_dir * .14 + V(.03, 0, .02)
    if C.lod == 0:
        K.lathe(f, [(-.01, .0146), (-.01, .0182), (.01, .0182), (.01, .0146)], C.n(16, 6), BLACK, origin=C.bb + st_dir * .15,
                axis=st_dir, ref=X)
        K.slab(f, [(-.045, -.002), (.025, -.02), (.04, .012), (-.03, .016)], .0022, BLACK, origin=fd_c + V(.012, -.03, -.025),
               u=-Z, v=Y, chamfer=0)
        K.slab(f, [(-.04, -.002), (.02, -.018), (.035, .01), (-.026, .014)], .0018, BLACK, origin=fd_c + V(-.004, -.03, -.025),
               u=-Z, v=Y, chamfer=0)

    # ---- steering: suspension fork (silver stanchions, black lowers, arch), threadless riser stem, flat bar,
    #      twist shifters, levers, V-brake, cables
    s_ = N['steer']
    crown_y = ht_b.y - .024
    crown_c = C.axis_at(crown_y)
    off = C.front_offset
    outline = [(-.078, -.02), (.078, -.02), (.082, off + .02), (.03, off + .028), (-.03, off + .028), (-.082, off + .02)]
    K.slab(s_, outline, .026, BLACK, origin=crown_c, u=X, v=C.F, chamfer=.003 if C.lod == 0 else 0)
    legs = []
    for s in (-1, 1):
        top = crown_c + X * (s * .062) + C.F * off
        bot = C.front + X * (s * .062)
        d = (top - bot).normalized()
        st_lo = bot + d * .2
        K.tube(s_, st_lo, top + d * .012, .0142, C.n(16, 6), STANCH)
        # lower leg: wiper seal, tapered slider, dropout
        K.lathe(s_, [(0, .0001), (0, .0165), (.012, .0182), (.2, .0188), (.208, .019), (.212, .0162), (.218, .0145), (.218, .0001)],
                C.n(18, 6), FORKLOW, origin=bot - d * .012, axis=d, ref=X, sharp=(5,))
        legs.append((bot, top, d))
        boss = bot + d * .222
        K.tube(s_, boss, boss + X * (s * .018), .0055, C.n(8, 4), FORKLOW)
    # arch brace in front of the tyre, joining the lowers
    if C.lod < 2:
        (bl, tl, dl), (br_, tr, dr) = legs
        a = bl + dl * .19 + C.F * .012
        b = br_ + dr * .19 + C.F * .012
        mid = (a + b) / 2 + C.D * .045 + C.F * .02
        K.sweep(s_, K.catmull([a, (a + mid) / 2 + C.D * .012, mid, (b + mid) / 2 + C.D * .012, b], 3 if C.lod == 0 else 1),
                [(-.008, -.006), (.008, -.006), (.008, .006), (-.008, .006)], FORKLOW, ref=C.F)
    # front V-brake
    fbtop = None
    for s in (-1, 1):
        bot, top, d = legs[0 if s < 0 else 1]
        boss = bot + d * .222
        t = v_brake(C, s_, boss, s, d, -Z, ALLOY, BRAKEPAD)
        if s > 0:
            fbtop = t
    steerer(C, s_, ALLOY, crown_y, ht_t.y + .07)
    stack = BP.headset_stack(C, s_, ht_t, ht_b, BLACK, BLACK, .0143, spacer_h=.02, frame_m=f)
    gr = C.grip_r
    clamp_c = V(0, gr.y - .006, gr.z - .016)
    BP.stem_threadless(C, s_, stack + C.D * .021, clamp_c, X, BLACK, ZINC)
    # flat bar, 5-degree back sweep at the ends
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        p = [V(0, clamp_c.y, clamp_c.z), V(s * .1, clamp_c.y, clamp_c.z), V(s * .2, g.y, g.z - .002), V(s * .358, g.y, g.z + .012)]
        path = K.fillet(p, [.25, .25], 4 if C.lod == 0 else 1)
        sc = [1.14 if abs(q.x) < .03 else 1.0 for q in path]
        K.sweep(s_, path, K.circle_profile(.0111, C.n(12, 6)), BLACK, caps=(False, True), scales=sc)
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        end = V(s * .358, g.y, g.z + .012)
        out = (end - V(s * .2, g.y, g.z - .002)).normalized()
        BP.grip(C, s_, end, out, GRIP, length=.092, r=.0158)
        # twist shifter inboard of the grip
        sh_a = end - out * .094
        K.lathe(s_, [(0, .0118), (0, .0172), (.008, .0185), (.042, .0182), (.05, .016), (.05, .0118)], C.n(16, 6), SHIFT,
                origin=sh_a - out * .05, axis=out, ref=Y, sharp=(1,))
        lp = sh_a - out * .062
        BP.brake_lever(C, s_, lp, out, s, ALLOY, ALLOY, reach=.07)
    # cables: front brake (left lever... US: left = front), rear brake and shifters to the frame stops
    BP.cable(C, s_, [V(-.2, gr.y + .004, gr.z - .02), V(-.12, gr.y - .05, gr.z - .1), fbtop + V(.0, .08, -.03), fbtop + V(-.005, .02, 0)],
             CABLE)
    BP.cable(C, s_, [V(.2, gr.y + .004, gr.z - .02), V(.1, gr.y - .07, gr.z - .11), stack + C.F * .06 - C.D * .07], CABLE)
    BP.cable(C, s_, [V(.19, gr.y - .01, gr.z + .01), V(.07, gr.y - .1, gr.z - .05), stack + C.F * .045 - C.D * .1 + X * .01], CABLE)
    BP.cable(C, s_, [V(-.19, gr.y - .01, gr.z + .01), V(-.07, gr.y - .1, gr.z - .05), stack + C.F * .045 - C.D * .1 - X * .01], CABLE)
    tt0, tt1 = fb.members['tt'][0], fb.members['tt'][1]
    BP.cable(C, f, [stack + C.F * .06 - C.D * .07, ht_b.lerp(ht_t, .95) + V(.02, .01, .02), tt0.lerp(tt1, .3) + V(.0, .021, 0),
                    tt0.lerp(tt1, .85) + V(0, .021, 0), tt1 + V(.0, .0, .05), rb], CABLE)
    BP.cable(C, f, [stack + C.F * .045 - C.D * .1 + X * .01, ht_b + V(.022, -.03, .02), dt0.lerp(dt1, .5) + V(.02, -.017, 0),
                    C.bb + V(.012, -.03, .02), C.bb + V(.03, -.022, .16), C.rear + V(.04, .02, -.06)], CABLE)

    # ---- wheels: 24-inch (ISO 507) silver double-wall, 36 spokes, knobby tyres; QR front hub
    for node, axle, hub in (('wheel_front', C.front, 'front'), ('wheel_rear', C.rear, 'rear')):
        BP.wheel(C, N[node], axle=axle, bead_r=.2535, rim_w=.026, rim_depth=.019, tyre_w=.058, tyre_h=C.R - .2535, rim_pid=RIM,
                 tyre_pid=TYRE, hub_pid=HUB, spoke_pid=SPOKE, nip_pid=NIP, spokes=36, cross=3, hub=hub, flange_r=.0255,
                 flange_x=(-.033, .033) if hub == 'front' else (-.034, .02), knobby=True, tread='knobby', valve_pid=VALVE)
    teeth = [28, 24, 21, 18, 16, 14]
    BP.cassette(C, N['wheel_rear'], C.rear, teeth, .024, .0047, COG, BLACK)
    for s in (-1, 1):
        BP.axle_nut(C, f, ZINC, C.rear, s, gap=.0595, size=.015)
    # QR lever on the front (left side), axle ends
    if C.lod < 2:
        K.lathe(s_, [(0, .0001), (0, .011), (.008, .009), (.008, .0001)], C.n(12, 5), ALLOY, origin=C.front + X * -.06, axis=X * -1, ref=Y)
        K.sweep(s_, K.catmull([C.front + X * -.064, C.front + V(-.07, .01, .02), C.front + V(-.072, .02, .085)], 3),
                [(-.0055, -.002), (.0055, -.002), (.0055, .002), (-.0055, .002)], ALLOY, ref=X)
        K.lathe(s_, [(0, .0001), (0, .009), (.006, .0001)], C.n(10, 5), ALLOY, origin=C.front + X * .06, axis=X, ref=Y)
    # ---- rear derailleur, crankset 42/32/22 with a plastic guard, chain on 32 x 18
    rd = BP.derailleur_rear(C, f, C.rear + V(0, -.004, .006), .036 + 3 * .0047, BLACK, BLACK, BLACK, 0)
    cr = N['crank']
    for s in (-1, 1):
        BP.crank_arm(C, cr, C.bb, s, C.crank_len, ALLOY, x=s * .066, width=(.034, .023), thick=.013)
    K.tube(cr, C.bb + V(-.06, 0, 0), C.bb + V(.06, 0, 0), .0095, C.n(12, 5), ALLOY)
    spider = []
    for k in range(5):
        a = TAU * k / 5 + .2
        d = V(0, math.sin(a), math.cos(a))
        if C.lod < 2:
            K.slab(cr, K.stadium(.044, .011, 3), .006, ALLOY, origin=C.bb + V(.056, 0, 0) + d * .028, u=d, v=X.cross(d).normalized())
    for t, x, finish in ((42, .055, 'alloy'), (32, .049, 'alloy'), (22, .043, 'alloy')):
        BP.sprocket(C, cr, C.bb, x, t, COG if t == 22 else ALLOY, thick=.002, ppt=4 if t == 32 else 2,
                    holes=BP.ring_holes(5, K.sprocket_outline(t)[1] - .016, .006, .2 + math.pi / 5, 8) if t == 42 else ())
    if C.lod < 2:
        K.slab(cr, K.circle2(K.sprocket_outline(42)[1] + .011, C.n(48, 12)), .002, GUARD, origin=C.bb + V(.062, 0, 0), u=-Z, v=Y,
               holes=[K.circle2(K.sprocket_outline(42)[1] - .008, C.n(48, 12))], chamfer=0)
    for node, s in (('pedal_l', -1), ('pedal_r', 1)):
        c = V(*(C.A['pedalL0'] if s < 0 else C.A['pedalR0']))
        BP.pedal_platform(C, N[node], c, s, PEDAL, ZINC, w=.085, l=.092, h=.024, style='mtb')
    Rring = K.sprocket_outline(32)[1]
    Rcog = K.sprocket_outline(18)[1]
    BP.chain_and_path(C, N['chain'], chain_circles(C, ring_r=Rring, cog_r=Rcog, cog_x=.049, rd=rd), CHAIN, roller_pid=CHAIN)
    return N


# ----------------------------------------------------------------------------------------------------------------------
# ALEX — youth cruiser
# ----------------------------------------------------------------------------------------------------------------------
def design_alex(C, col, harvest=None):
    N = new_nodes()
    pid = C.pid
    PAINT = pid('frame', 'paint', 'paint')
    WELD = pid('weld', 'paint', 'paint_weld')
    DT, TT, ST = pid('frame_dt', 'paint', 'paint'), pid('frame_tt', 'paint', 'paint'), pid('frame_st', 'paint', 'paint')
    CHROME = pid('chrome', 'hardware', 'chrome')
    BLACK = pid('black_hw', 'hardware', 'steel_black')
    ZINC = pid('bolts', 'hardware', 'zinc')
    RIM = pid('rim', 'hardware', 'chrome')
    SPOKE = pid('spokes', 'hardware', 'spoke')
    NIP = pid('nipples', 'hardware', 'zinc')
    HUB = pid('hub', 'hardware', 'chrome')
    CHAIN = pid('chain', 'hardware', 'chain')
    RACK = pid('rack', 'hardware', 'zinc')
    GUARDP = pid('chainguard', 'paint', 'paint_black')
    BADGE = pid('headbadge', 'hardware', 'brass')
    TYRE = pid('tyre', 'soft', 'tyre_cruiser')
    GRIP = pid('grips', 'soft', 'rubber_grip')
    SEAT = pid('saddle', 'soft', 'vinyl')
    PEDAL = pid('pedals', 'soft', 'rubber_block')
    REFL = pid('reflector_red', 'soft', 'reflector_red')
    REFLB = pid('reflector_body', 'soft', 'plastic')
    TAPE = pid('tape', 'soft', 'tape')
    VALVE = pid('valve', 'hardware', 'zinc')
    col.update({'frame_dt': 0x8a8f3f, 'frame_tt': 0x8a8f3f, 'frame_st': 0x8a8f3f, 'frame': 0x8a8f3f, 'weld': 0x8a8f3f, 'grips': 0xd8cfb8, 'saddle': 0x5a3a28, 'tyre': 0x2b2c2e,
                'chainguard': 0x1d1e1c, 'reflector_red': 0x8a1a14, 'reflector_body': 0x2a1513, 'pedals': 0x1b1b1c, 'tape': 0x161617})
    f = N['frame']
    fb = BP.FrameBuilder(C, f, PAINT, WELD, weld_r=.0019)
    ht_b, ht_t = BP.head_tube(C, f, PAINT, .728, .858, .0172, flare=.002)
    fb.members['ht'] = (ht_b, ht_t, .0172)
    clamp = C.saddle - V(0, .055, 0)
    st_dir = (clamp - C.bb).normalized()
    st_top = C.bb + st_dir * .385
    fb.straight('st', C.bb, st_top, .0143, 16, pid=ST)
    # top tube: a long gentle arc from the head tube down into the seat tube
    tt_a = ht_b.lerp(ht_t, .82)
    tt_b = st_top - st_dir * .03
    tt_path = K.bezier(tt_a, tt_a + V(0, -.0, .16), tt_b + V(0, .07, -.16), tt_b, 9 if C.lod == 0 else 4)
    fb.curved('tt', tt_path, .0143, 16, pid=TT)
    dt_a = ht_b.lerp(ht_t, .22)
    dt_b = C.bb + V(0, .006, -.006)
    dt_path = K.bezier(dt_a, dt_a + V(0, -.12, .07), dt_b + V(0, .12, -.11), dt_b, 7 if C.lod == 0 else 3)
    fb.curved('dt', dt_path, .0159, 16, pid=DT)
    BP.bb_shell(C, f, PAINT, width=.068, r=.022)
    fb.members['bb'] = (C.bb - X * .034, C.bb + X * .034, .022)
    # chainstays
    rear_triangle(C, fb, f, st_attach=st_top, ss_r=.0001, cs_r=.0098, dropout_x=.0545, cs_flare=.045, bridge_cs=C.bb.z + .15,
                  do_pid=PAINT)
    # drop the placeholder seatstays made by rear_triangle (r ~ 0): the cantilever stays replace them
    # cantilever stays: from the dropouts up past the seat tube, then forward and down into the down tube
    def st_at(y):
        return C.bb + st_dir * ((y - C.bb.y) / st_dir.y)
    j = 0.45
    dt_join = dt_path[int(len(dt_path) * j)]
    for s in (-1, 1):
        p = [C.rear + V(s * .0545, .012, -.004), C.rear + V(s * .044, .14, -.1), st_at(.585) + V(s * .0255, 0, .012),
             st_at(.585) + V(s * .022, -.004, -.06), dt_join + V(s * .014, .03, .07), dt_join + V(s * .004, .0, .0)]
        path = K.catmull(p, 4 if C.lod == 0 else 2)
        fb.curved(f'cant{s}', path, .0098, 12, scales=[1 - .15 * max(0, 1 - i / (len(path) * .3)) for i in range(len(path))])
    # a bridge where the stays pass the seat tube
    if C.lod < 2:
        K.tube(f, st_at(.585) + V(-.026, 0, .012), st_at(.585) + V(.026, 0, .012), .007, C.n(10, 5), PAINT)
    for b, mname in (('tt', 'ht'), ('dt', 'ht'), ('tt', 'st'), ('dt', 'bb'), ('st', 'bb')):
        fb.weld(b, mname, end=1)
    BP.seat_collar(C, f, st_top, st_dir, .0143, CHROME, ZINC)
    # head badge on the front of the head tube (an original mark, embossed brass)
    if C.lod < 2:
        hb = ht_b.lerp(ht_t, .55) + C.F * .0175
        K.slab(f, [(-.011, -.018), (.011, -.018), (.014, .006), (0, .02), (-.014, .006)], .0016, BADGE, origin=hb, u=X, v=C.D,
               chamfer=.0004)
    # seatpost (plain chrome, separate clamp) and the wide sprung saddle
    sp_top = C.saddle - V(0, .062, -.01)
    BP.seatpost(C, f, st_top - st_dir * .06, sp_top, .0111, CHROME, CHROME, style='candle')
    BP.saddle(C, f, C.saddle + V(0, .005, .012), SEAT, SEAT, length=.24, w_rear=.205, w_nose=.07, h=.068, sag=.012, nose_drop=.01,
              tail_up=.0, style='cruiser')
    if C.lod < 2:
        for s in (-1, 1):   # coil springs under the saddle's tail
            c = C.saddle + V(s * .055, -.05, .075)
            pts = [c + V(math.cos(a) * .012, a / TAU * .0075 - .025, math.sin(a) * .012) for a in [i * TAU / 8 for i in range(49)]]
            K.sweep(f, pts if C.lod == 0 else pts[::3], K.circle_profile(.0022, 4), CHROME, caps=(True, True))
        BP.saddle_rails(C, f, C.saddle + V(0, -.03, .02), CHROME, length=.17, gap=.03, drop=.012)
    # rack: two side rails from behind the seat tube to past the tyre, cross bars, struts to the dropouts
    rr = C.A['rearReflector']
    rc = V(*rr['center'])
    ry = rc.y + .03
    z0, z1 = st_top.z + .1, rc.z + .02
    if C.lod < 2:
        for s in (-1, 1):
            K.sweep(f, K.fillet([V(s * .06, ry, z0), V(s * .065, ry, z1 - .03), V(s * .04, ry - .002, z1)], .02, 3),
                    K.circle_profile(.0048, C.n(8, 4)), RACK)
            K.tube(f, V(s * .065, ry, z1 - .05), C.rear + V(s * .066, .01, .0), .0048, C.n(8, 4), RACK)
            K.tube(f, V(s * .064, ry, (z0 + z1) / 2), C.rear + V(s * .066, .02, -.005), .0045, C.n(8, 4), RACK)
            # forward stays to the cantilever stays
            K.tube(f, V(s * .06, ry, z0), fb.members[f'cant{s}'][3][3], .004, C.n(8, 4), RACK)
        for k in range(5):
            z = z0 + (z1 - .03 - z0) * k / 4
            K.tube(f, V(-.064, ry - .002, z), V(.064, ry - .002, z), .0034, C.n(6, 3), RACK)
        K.tube(f, V(-.04, ry, z1), V(.04, ry, z1), .0045, C.n(8, 4), RACK)
    # the red rear reflector on the back of the rack: the same size and red as the piece found at the creek
    if C.lod < 2:
        K.box(f, rc + V(0, .028, -.008), (.03, .05, .006), RACK, u=X, v=Y)
        K.box(f, rc + V(0, .042, -.006), (.036, .016, .02), TAPE, u=X, v=Y)
    BP.reflector_disc(C, f, rc + V(0, 0, .006), V(0, 0, 1), rr['r'], REFL, REFLB, depth=.012)
    # chain guard over the top run, and the coaster brake arm on the left chainstay
    if C.lod < 2:
        Rr = K.sprocket_outline(36)[1]
        # a steel guard over the ring's top and the top run of the chain, bolted to the seat tube and chainstay
        g2 =[(-.06, Rr + .018), (.05, Rr + .024), (.41, .05), (.44, .036), (.44, .012), (.40, .004), (.05, Rr - .024), (-.06, Rr - .03)]
        K.slab(f, g2, .0018, GUARDP, origin=V(.083, C.bb.y, C.bb.z), u=Z, v=Y, chamfer=.0004)
        K.tube(f, C.rear + V(-.06, .0, -.0), C.rear + V(-.06, -.004, -.17), .0055, C.n(8, 4), BLACK)
        K.box(f, C.rear + V(-.058, -.004, -.17), (.012, .016, .02), ZINC, u=X, v=Y)
    kp = V(*C.A['kickPivot'])
    BP.kickstand_mount(C, f, kp, BLACK, ZINC)
    BP.kickstand(C, N['kickstand'], kp, CHROME, PEDAL)

    # ---- steering: curved painted fork, chrome quill stem, swept chrome bars, cream grips, bell
    s_ = N['steer']
    crown_y = ht_b.y - .022
    front_fork_rigid(C, s_, PAINT, crown_y=crown_y, leg_r=.0135, leg_r2=.0112, spread=.05, crown_off=.008, curve=C.front_offset,
                        crown_pid=PAINT, dropout_pid=PAINT)
    steerer(C, s_, CHROME, crown_y, ht_t.y + .03)
    stack = BP.headset_stack(C, s_, ht_t, ht_b, CHROME, CHROME, .0111, spacer_h=.0, frame_m=f)
    # quill stem: a chrome post up out of the headset, a forward extension to the bar clamp
    gr = C.grip_r
    clamp_c = V(0, gr.y - .072, gr.z - .072)
    q_top = stack + C.D * .085
    K.tube(s_, stack - C.D * .02, q_top, .0111, C.n(14, 6), CHROME)
    K.lathe(s_, [(0, .0001), (0, .0125), (.012, .0125), (.016, .009), (.016, .0001)], C.n(14, 6), CHROME, origin=q_top - C.D * .012,
            axis=C.D, ref=X, sharp=(1,))
    K.tube(s_, q_top - C.D * .022, clamp_c, .0112, C.n(14, 6), CHROME)
    K.lathe(s_, [(-.017, .0122), (-.017, .0168), (.017, .0168), (.017, .0122)], C.n(16, 6), CHROME, origin=clamp_c, axis=X, ref=Y,
            sharp=(1, 2))
    # swept bars
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        p = [V(0, clamp_c.y, clamp_c.z), V(s * .06, clamp_c.y, clamp_c.z - .006), V(s * .17, clamp_c.y + .035, clamp_c.z - .012),
             V(s * .25, g.y, g.z - .045), V(s * .335, g.y + .004, g.z + .028)]
        path = K.catmull(p, 4 if C.lod == 0 else 2)
        K.sweep(s_, path, K.circle_profile(.0111, C.n(12, 6)), CHROME, caps=(False, True))
        end = p[-1]
        out = (p[-1] - p[-2]).normalized()
        BP.grip(C, s_, end, out, GRIP, length=.112, r=.0175)
    # the bell on the left bar, at rig.js's bell point (the rider's hand reaches there)
    bell_pt = V(*C.A['bell'])
    on_bar = V(bell_pt.x, clamp_c.y + .03, clamp_c.z - .01)
    for q in K.catmull([V(0, clamp_c.y, clamp_c.z), V(-.06, clamp_c.y, clamp_c.z - .006), V(-.17, clamp_c.y + .035, clamp_c.z - .012),
                        V(-.25, C.grip_l.y, C.grip_l.z - .045)], 8):
        if abs(q.x - bell_pt.x) < .006:
            on_bar = q
    BP.bell(C, s_, on_bar, V(-1, 0, 0), CHROME, BLACK, dome_r=.029, dome_h=.024, center=bell_pt)
    BP.bell_lever(C, N['bell_lever'], V(*C.A['bellLeverPivot']), V(-1, 0, 0), CHROME)
    # front: chrome axle nuts
    for s in (-1, 1):
        BP.axle_nut(C, s_, ZINC, C.front, s, gap=.0565, size=.015)

    # ---- wheels: 24-inch chrome single-wall rims, 36 spokes, cream-wall balloon tyres; coaster hub at the rear
    for node, axle, hub in (('wheel_front', C.front, 'front'), ('wheel_rear', C.rear, 'coaster')):
        BP.wheel(C, N[node], axle=axle, bead_r=.2535, rim_w=.03, rim_depth=.014, tyre_w=.056, tyre_h=C.R - .2535, rim_pid=RIM,
                 tyre_pid=TYRE, hub_pid=HUB, spoke_pid=SPOKE, nip_pid=NIP, spokes=36, cross=3, hub='front' if hub == 'front' else 'coaster',
                 flange_r=.03 if hub == 'coaster' else .024, flange_x=(-.03, .03) if hub == 'front' else (-.033, .033),
                 tread='cruiser', double_wall=False, valve_pid=VALVE)
    BP.sprocket(C, N['wheel_rear'], C.rear, .045, 18, BLACK, thick=.0022, ppt=4)
    for s in (-1, 1):
        BP.axle_nut(C, f, ZINC, C.rear, s, gap=.0565, size=.016)
    # ---- one-piece chrome crank, 36-tooth steel ring
    cr = N['crank']
    for s in (-1, 1):
        a = C.bb + V(s * .055, 0, 0)
        b = C.bb + V(s * .062, s * C.crank_len, 0)
        K.sweep(cr, K.fillet([C.bb + V(s * .036, 0, 0), a, b, b + V(s * .008, 0, 0)], .012, 4 if C.lod == 0 else 1),
                K.circle_profile(.0085, C.n(12, 5)), CHROME, scales=None)
    K.tube(cr, C.bb + V(-.036, 0, 0), C.bb + V(.036, 0, 0), .0085, C.n(12, 5), CHROME)
    BP.sprocket(C, cr, C.bb, .045, 36, CHROME, holes=BP.ring_holes(6, .045, .011, .0, 10), thick=.0024, ppt=4)
    for node, s in (('pedal_l', -1), ('pedal_r', 1)):
        c = V(*(C.A['pedalL0'] if s < 0 else C.A['pedalR0']))
        BP.pedal_platform(C, N[node], c, s, PEDAL, CHROME, w=.09, l=.085, h=.026, style='block')
    BP.chain_and_path(C, N['chain'], chain_circles(C, ring_r=K.sprocket_outline(36)[1], cog_r=K.sprocket_outline(18)[1], cog_x=.045),
                      CHAIN, roller_pid=CHAIN)
    return N


# ----------------------------------------------------------------------------------------------------------------------
# THE PROTAGONIST — youth hybrid ("road-kid" in rig.js)
# ----------------------------------------------------------------------------------------------------------------------
def design_player(C, col, harvest=None):
    N = new_nodes()
    pid = C.pid
    PAINT = pid('frame', 'paint', 'paint')
    WELD = pid('weld', 'paint', 'paint_weld')
    DT, TT, ST = pid('frame_dt', 'paint', 'paint'), pid('frame_tt', 'paint', 'paint'), pid('frame_st', 'paint', 'paint')
    FORK = pid('fork', 'paint', 'paint')
    ALLOY = pid('alloy', 'hardware', 'alloy')
    BLACK = pid('black_hw', 'hardware', 'alloy_black')
    STEELB = pid('steel_black', 'hardware', 'steel_black')
    CHROME = pid('chrome', 'hardware', 'chrome')
    ZINC = pid('bolts', 'hardware', 'zinc')
    RIM = pid('rim', 'hardware', 'alloy_machined')
    SPOKE = pid('spokes', 'hardware', 'spoke')
    NIP = pid('nipples', 'hardware', 'alloy')
    HUB = pid('hub', 'hardware', 'alloy')
    CHAIN = pid('chain', 'hardware', 'chain')
    COG = pid('cogs', 'hardware', 'steel_cog')
    TYRE = pid('tyre', 'soft', 'tyre_hybrid')
    GRIP = pid('grips', 'soft', 'rubber_grip')
    SEAT = pid('saddle', 'soft', 'vinyl')
    PEDAL = pid('pedals', 'soft', 'plastic_pedal')
    CABLE = pid('cable', 'soft', 'cable')
    BRAKEPAD = pid('brake_pads', 'soft', 'brake_pad')
    SHIFT = pid('shifters', 'soft', 'plastic')
    GUARD = pid('ring_guard', 'soft', 'plastic')
    RW = pid('reflector_white', 'soft', 'reflector_white')
    RR = pid('reflector_red', 'soft', 'reflector_red')
    RA = pid('reflector_amber', 'soft', 'reflector_amber')
    RB = pid('reflector_body', 'soft', 'plastic')
    VALVE = pid('valve', 'hardware', 'alloy')
    col.update({'frame_dt': 0x5f8f93, 'frame_tt': 0x5f8f93, 'frame_st': 0x5f8f93, 'frame': 0x5f8f93, 'fork': 0x5f8f93, 'weld': 0x5f8f93, 'grips': 0x303032, 'saddle': 0x262626, 'tyre': 0x2b2c2e,
                'shifters': 0x26272a, 'ring_guard': 0x1f2022, 'reflector_white': 0xe8e4d8, 'reflector_red': 0x8a1a14,
                'reflector_amber': 0xd89a3a, 'reflector_body': 0x2a2a2c, 'pedals': 0x232426})
    f = N['frame']
    fb = BP.FrameBuilder(C, f, PAINT, WELD, weld_r=.0018)
    ht_b, ht_t = BP.head_tube(C, f, PAINT, .712, .858, .0172)
    fb.members['ht'] = (ht_b, ht_t, .0172)
    clamp = C.saddle - V(0, .052, 0)
    st_dir = (clamp - C.bb).normalized()
    st_top = C.bb + st_dir * .405
    fb.straight('st', C.bb, st_top, .0143, 16, pid=ST)
    tt_a = ht_b.lerp(ht_t, .8)
    tt_b = st_top - st_dir * .03
    fb.straight('tt', tt_a, tt_b, .0143, 16, pid=TT)
    dt_a = ht_b.lerp(ht_t, .24)
    fb.straight('dt', dt_a, C.bb + V(0, .005, -.005), .0159, 16, pid=DT)
    BP.bb_shell(C, f, PAINT, width=.068, r=.0205)
    fb.members['bb'] = (C.bb - X * .034, C.bb + X * .034, .0205)
    rear_triangle(C, fb, f, st_attach=tt_b - st_dir * .006, ss_r=.008, cs_r=.0095, dropout_x=.0555, cs_flare=.048,
                  bridge_ss=C.rear.y + .3, bridge_cs=C.bb.z + .145, hanger=True, do_pid=PAINT)
    for b, mname in (('tt', 'ht'), ('dt', 'ht'), ('tt', 'st'), ('dt', 'bb'), ('st', 'bb')):
        fb.weld(b, mname, end=1)
    for s in (-1, 1):
        fb.weld(f'ss{s}', 'st', end=0)
    BP.seat_collar(C, f, st_top, st_dir, .0143, BLACK, ZINC)
    rb = None
    for s in (-1, 1):
        a, b = fb.members[f'ss{s}'][0], fb.members[f'ss{s}'][1]
        boss = b + (a - b).normalized() * .236
        K.tube(f, boss, boss + X * (s * .016), .0055, C.n(8, 4), ZINC)
        top = v_brake(C, f, boss, s, (a - b).normalized(), -Z, ALLOY, BRAKEPAD)
        if s > 0:
            rb = top
    sp_top = C.saddle - V(0, .042, -.004)
    BP.seatpost(C, f, st_top - st_dir * .06, sp_top, .0136, ALLOY, BLACK)
    BP.saddle_rails(C, f, C.saddle + V(0, -.014, 0), ALLOY)
    BP.saddle(C, f, C.saddle + V(0, .0, .006), SEAT, SEAT, length=.25, w_rear=.165, w_nose=.055, h=.054, sag=.008, style='sport')
    # red reflector on the seatpost
    if C.lod < 2:
        rp = st_top + st_dir * .1
        K.lathe(f, [(-.008, .0136), (-.008, .0165), (.008, .0165), (.008, .0136)], C.n(14, 6), STEELB, origin=rp, axis=st_dir, ref=X)
        BP.reflector_rect(C, f, rp + V(0, 0, .03), V(0, 0, 1), Y, .048, .022, RR, RB, depth=.01)
    kp = V(*C.A['kickPivot'])
    BP.kickstand_mount(C, f, kp, STEELB, ZINC)
    BP.kickstand(C, N['kickstand'], kp, ALLOY, PEDAL)

    # ---- steering: rigid fork with a curved rake, threadless riser stem, riser bar, levers, thumb shifter, bell,
    #      front reflector, front V-brake
    s_ = N['steer']
    crown_y = ht_b.y - .022
    crown_c, legs = front_fork_rigid(C, s_, FORK, crown_y=crown_y, leg_r=.013, leg_r2=.0105, spread=.048, crown_off=.012,
                                        curve=C.front_offset - .01, crown_pid=FORK, bosses=True, boss_pid=ZINC, dropout_pid=FORK)
    fbtop = None
    for s, path in zip((-1, 1), legs):
        top, bot = path[0], path[-1]
        boss = bot + (top - bot).normalized() * .232
        t = v_brake(C, s_, boss + X * (s * .002), s, (top - bot).normalized(), -Z, ALLOY, BRAKEPAD)
        if s > 0:
            fbtop = t
    steerer(C, s_, ALLOY, crown_y, ht_t.y + .07)
    stack = BP.headset_stack(C, s_, ht_t, ht_b, BLACK, BLACK, .0143, spacer_h=.018, frame_m=f)
    gr = C.grip_r
    clamp_c = V(0, gr.y - .036, gr.z - .02)
    BP.stem_threadless(C, s_, stack + C.D * .021, clamp_c, X, BLACK, ZINC)
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        p = [V(0, clamp_c.y, clamp_c.z), V(s * .075, clamp_c.y, clamp_c.z), V(s * .14, g.y, g.z - .008), V(s * .34, g.y, g.z + .014)]
        path = K.fillet(p, [.05, .07], 6 if C.lod == 0 else 2)
        sc = [1.14 if abs(q.x) < .03 else 1.0 for q in path]
        K.sweep(s_, path, K.circle_profile(.0111, C.n(16, 6)), BLACK, caps=(False, True), scales=sc)
    levers = {}
    for s in (-1, 1):
        g = gr if s > 0 else C.grip_l
        end = V(s * .34, g.y, g.z + .014)
        out = (end - V(s * .14, g.y, g.z - .008)).normalized()
        BP.grip(C, s_, end, out, GRIP, length=.118, r=.0158)
        lp = end - out * .132
        levers[s] = BP.brake_lever(C, s_, lp, out, s, ALLOY, ALLOY, reach=.078)
    # thumb shifter under the right bar, inboard of the lever
    if C.lod < 2:
        sp = V(.172, gr.y - .006, gr.z - .009)
        K.lathe(s_, [(-.009, .0118), (-.009, .016), (.009, .016), (.009, .0118)], C.n(14, 6), SHIFT, origin=sp, axis=X, ref=Y)
        K.slab(s_, K.rounded_rect(.034, .026, .007, 2), .016, SHIFT, origin=sp + V(-.004, -.018, -.006), u=-Z, v=Y,
               chamfer=.002 if C.lod == 0 else 0)
        K.slab(s_, K.stadium(.03, .009, 3), .004, SHIFT, origin=sp + V(.006, -.024, .012), u=V(.3, -.2, 1).normalized(), v=X)
    # the bell, at rig.js's bell point on the left of the bar (the hand reaches there when Space is pressed)
    bell_pt = V(*C.A['bell'])
    on_bar = V(bell_pt.x, gr.y - .002, gr.z - .006)
    BP.bell(C, s_, on_bar, V(-1, 0, 0), CHROME, BLACK, dome_r=.026, dome_h=.021, center=bell_pt)
    BP.bell_lever(C, N['bell_lever'], V(*C.A['bellLeverPivot']), V(-1, 0, 0), CHROME)
    # white front reflector on a bracket from the stem's steerer clamp
    fr = V(*C.A['frontReflector'])
    if C.lod < 2:
        K.sweep(s_, K.catmull([stack + C.D * .01 + C.F * .016, stack + C.F * .04 - C.D * .01, fr + V(0, .02, .012)], 3),
                [(-.006, -.0012), (.006, -.0012), (.006, .0012), (-.006, .0012)], STEELB, ref=X)
    BP.reflector_rect(C, s_, fr, V(0, 0, -1), Y, .046, .062, RW, RB, depth=.011)
    # cables (left lever = front brake, right = rear, shifter cable on the right)
    BP.cable(C, s_, [levers[-1], levers[-1] + V(.02, -.07, -.09), fbtop + V(-.0, .1, -.03), fbtop + V(-.004, .02, 0)], CABLE)
    BP.cable(C, s_, [levers[1], levers[1] + V(-.03, -.08, -.08), stack + C.F * .06 - C.D * .06], CABLE)
    BP.cable(C, s_, [V(.168, gr.y - .03, gr.z - .01), V(.09, gr.y - .1, gr.z - .03), stack + C.F * .045 - C.D * .09 + X * .012], CABLE)
    tt0, tt1 = fb.members['tt'][0], fb.members['tt'][1]
    dt0, dt1 = fb.members['dt'][0], fb.members['dt'][1]
    BP.cable(C, f, [stack + C.F * .06 - C.D * .06, ht_b.lerp(ht_t, .95) + V(.02, .01, .02), tt0.lerp(tt1, .3) + V(0, .019, 0),
                    tt0.lerp(tt1, .85) + V(0, .019, 0), tt1 + V(0, 0, .05), rb], CABLE)
    BP.cable(C, f, [stack + C.F * .045 - C.D * .09 + X * .012, ht_b + V(.022, -.03, .02), dt0.lerp(dt1, .55) + V(.018, -.016, 0),
                    C.bb + V(.012, -.028, .02), C.bb + V(.03, -.022, .16), C.rear + V(.04, .02, -.06)], CABLE)

    # ---- wheels: 24-inch silver double-wall rims with machined brake tracks, 36 spokes, semi-slick tyres,
    #      amber spoke reflectors (the CPSC-style kit every new bike came with)
    for node, axle, hub in (('wheel_front', C.front, 'front'), ('wheel_rear', C.rear, 'rear')):
        BP.wheel(C, N[node], axle=axle, bead_r=.2535, rim_w=.025, rim_depth=.019, tyre_w=.047, tyre_h=C.R - .2535, rim_pid=RIM,
                 tyre_pid=TYRE, hub_pid=HUB, spoke_pid=SPOKE, nip_pid=NIP, spokes=36, cross=3, hub=hub, flange_r=.0245,
                 flange_x=(-.032, .032) if hub == 'front' else (-.034, .021), tread='slick', valve_pid=VALVE)
        if C.lod < 2:
            a = math.radians(70 if node == 'wheel_front' else 250)
            d = V(0, math.sin(a), math.cos(a))
            K.slab(N[node], K.rounded_rect(.072, .03, .008, 2), .006, RA, origin=axle + d * .16 + X * .004, u=d, v=X.cross(d).normalized(),
                   chamfer=.001 if C.lod == 0 else 0)
    teeth = [28, 24, 21, 18, 16, 14]
    BP.cassette(C, N['wheel_rear'], C.rear, teeth, .024, .0047, COG, BLACK)
    for s in (-1, 1):
        BP.axle_nut(C, f, ZINC, C.rear, s, gap=.0595, size=.015)
        BP.axle_nut(C, s_, ZINC, C.front, s, gap=.0565, size=.015)
    rd = BP.derailleur_rear(C, f, C.rear + V(0, -.004, .006), .024 + 3 * .0047, BLACK, BLACK, BLACK, 0)
    cr = N['crank']
    for s in (-1, 1):
        BP.crank_arm(C, cr, C.bb, s, C.crank_len, ALLOY, x=s * .064, width=(.034, .023), thick=.013)
    K.tube(cr, C.bb + V(-.058, 0, 0), C.bb + V(.058, 0, 0), .0095, C.n(12, 5), ALLOY)
    for k in range(4):
        a = TAU * k / 4 + .4
        d = V(0, math.sin(a), math.cos(a))
        if C.lod < 2:
            K.slab(cr, K.stadium(.042, .011, 3), .006, ALLOY, origin=C.bb + V(.054, 0, 0) + d * .027, u=d, v=X.cross(d).normalized())
    BP.sprocket(C, cr, C.bb, .048, 36, STEELB, holes=BP.ring_holes(4, .052, .008, .4 + math.pi / 4, 10), thick=.0024, ppt=4)
    if C.lod < 2:
        K.slab(cr, K.circle2(K.sprocket_outline(36)[1] + .012, C.n(48, 12)), .002, GUARD, origin=C.bb + V(.057, 0, 0), u=-Z, v=Y,
               holes=[K.circle2(.03, C.n(24, 8))], chamfer=0)
    for node, s in (('pedal_l', -1), ('pedal_r', 1)):
        c = V(*(C.A['pedalL0'] if s < 0 else C.A['pedalR0']))
        BP.pedal_platform(C, N[node], c, s, PEDAL, ZINC, w=.082, l=.09, h=.022, style='resin', refl_pid=RA)
    BP.chain_and_path(C, N['chain'], chain_circles(C, ring_r=K.sprocket_outline(36)[1], cog_r=K.sprocket_outline(18)[1],
                                                   cog_x=.048, rd=rd), CHAIN, roller_pid=CHAIN)
    return N


DESIGNS = {'bike.jamie': (design_jamie, .030), 'bike.sam': (design_sam, .040), 'bike.alex': (design_alex, .045),
           'bike.player': (design_player, .040)}
