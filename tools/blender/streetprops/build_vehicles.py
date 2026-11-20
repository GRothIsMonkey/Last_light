"""Last Light: the Prologue's parked cars (vehicles & street props benchmark, ?streetprops).

Source: Comrade1280, "Generic passenger car pack" (Sketchfab, CC BY 4.0; trademark-free generic designs), the original
GLB byte for byte in assets/source/street/third-party/sketchfab-originals/. Six of its ten bodies are US-market family
vehicles of about 1997-2010 and are used; the coupe, the sports car, the city car and the off-roader (whose seven-slot
grille and "4X4" spare cover read as one real make) are not.

What this script does to them (documented in docs/STREET_PROPS_RECONSTRUCTION_REPORT.md):
  * finds each body, its glass, its lamp optics and its own four wheels; turns it front to -Y (glTF +Z; the game's -Z
    after the loader's half turn), puts the wheels' footprint centre on the origin and the tyres on the ground (z = 0);
  * scales it to the length of a period US vehicle of its class (uniform scale: the designer's proportions kept);
  * remaps its UVs into the two vehicle atlases (street_textures.py), where the paint is a grey that the game tints
    per car (restrained period colours, age, dirt: streetprops-assets.js);
  * adds what the pack lacks: a cabin you can see through the glass (front seats with headrests, a rear bench, the
    dash, a steering wheel on the left), a rear licence plate (generic, no real state's design);
  * makes LOD1 and LOD2 (collapse decimation; the cabin and plate drop out at LOD2) and a separate wheel for the one
    car that moves (the parent's minivan coming home);
  * saves assets/source/street/vehicles/street.vehicles.blend and exports dist/assets/street/street.vehicles.glb
    (geometry and UVs only: the atlases ship as their own files beside it, like the pavement textures).

    python3 tools/blender/streetprops/build_vehicles.py          (Blender 5.x as the bpy module; or
    blender --background --factory-startup --python tools/blender/streetprops/build_vehicles.py)
Deterministic: the same inputs give the same geometry (no randomness).
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'blender'))
import ll_export  # noqa: E402

SRC = os.path.join(ROOT, 'assets', 'source', 'street', 'third-party', 'sketchfab-originals', 'generic_passenger_car_pack.glb')
TEX = os.path.join(ROOT, 'assets', 'source', 'street', 'textures')
BLEND = os.path.join(ROOT, 'assets', 'source', 'street', 'vehicles', 'street.vehicles.blend')
OUT = os.path.join(ROOT, 'dist', 'assets', 'street', 'street.vehicles.glb')
STATS = os.path.join(ROOT, 'assets', 'source', 'street', 'vehicles', 'build-stats.json')
LAYOUT = json.load(open(os.path.join(TEX, 'vehicle_atlas.json')))
ATLAS = 2048

# type: source body, wheel texture, target length (m), seats rows, cabin fractions, licence plate height, decimation
CARS = {
    'sedan':     dict(body='Sedan Body', wheel='A', L=4.80, rows=2, plate=.60, seat='fabric_grey'),
    'wagon':     dict(body='Wagon Body', wheel='A', L=4.78, rows=2, plate=.66, seat='fabric_tan'),
    'minivan':   dict(body='minivan body', wheel='D', L=5.05, rows=3, plate=.80, seat='fabric_grey', dynamic=True),
    'suv':       dict(body='SUV Body', wheel='E', L=4.90, rows=2, plate=.82, seat='fabric_tan'),
    'pickup':    dict(body='Pickup Body', wheel='E', L=5.50, rows=2, plate=.68, seat='fabric_grey'),
    'hatchback': dict(body='Hatchback Body', wheel='B', L=4.30, rows=2, plate=.72, seat='fabric_grey'),
}
LOD_RATIO = {1: dict(body=.36, wheel=.30, glass=.6, cabin=.5), 2: dict(body=.11, wheel=.11, glass=.35, cabin=0)}


def log(*a):
    print('[vehicles]', *a, flush=True)


# ------------------------------------------------------------------------------------------------ helpers
def world_verts(o):
    mw = o.matrix_world
    return [mw @ v.co for v in o.data.vertices]


def bbox(points):
    mn = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    mx = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    return mn, mx


def tile_uv(rect):
    """PIL pixel rect (x, y, w, h) in a 2048 atlas -> function mapping a Blender UV (0..1 of the source image)."""
    x, y, w, h = rect
    def f(u, v):
        return ((x + u * w) / ATLAS, 1 - (y + (1 - v) * h) / ATLAS)
    return f


def remap_uv(me, fn, clamp=True):
    uv = me.uv_layers.active
    if uv is None:
        uv = me.uv_layers.new(name='UVMap')
    us = [l.uv[0] for l in uv.data]
    vs = [l.uv[1] for l in uv.data]
    if us and (min(us) < -.01 or max(us) > 1.01 or min(vs) < -.01 or max(vs) > 1.01):
        log('  UVs outside 0..1 in', me.name, round(min(us), 3), round(max(us), 3), round(min(vs), 3), round(max(vs), 3))
    for l in uv.data:
        u, v = l.uv
        if clamp:
            u, v = min(max(u, 0.0), 1.0), min(max(v, 0.0), 1.0)
        l.uv = fn(u, v)


def swatch_uv(me, name, spread=.8):
    """Every loop into one swatch (box-projected across it so fabric noise shows)."""
    x, y, w, h = LAYOUT['swatch'][name]
    uv = me.uv_layers.active or me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        n = p.normal
        ax = max(range(3), key=lambda k: abs(n[k]))
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            a, b = [co[k] for k in range(3) if k != ax]
            fu = .5 + spread * .5 * math.sin(a * 3.1)
            fv = .5 + spread * .5 * math.sin(b * 2.3)
            uv.data[li].uv = ((x + 2 + fu * (w - 4)) / ATLAS, 1 - (y + 2 + fv * (h - 4)) / ATLAS)


def plate_uv(me, name):
    x, y, w, h = LAYOUT['swatch'][name]
    uv = me.uv_layers.active or me.uv_layers.new(name='UVMap')
    for p in me.polygons:
        for li in p.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co
            fu = 1 if co.x > 0 else 0          # the plate faces +Y (the rear): +X is the reader's left... mirrored below
            fv = 1 if co.z > 0 else 0
            uv.data[li].uv = ((x + 1 + (1 - fu) * (w - 2)) / ATLAS, 1 - (y + 1 + (1 - fv) * (h - 2)) / ATLAS)


def new_obj(name, me, coll):
    o = bpy.data.objects.new(name, me)
    coll.objects.link(o)
    return o


def rbox(name, size, center, bevel, coll, rot=None):
    """A rounded box mesh (bmesh cube + bevel), in place."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    if bevel > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=2, affect='EDGES', profile=.5)
    if rot:
        bmesh.ops.rotate(bm, verts=bm.verts, cent=Vector(), matrix=Matrix.Rotation(rot[1], 3, rot[0]))
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(center))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return new_obj(name, me, coll)


def torus(name, center, R, r, coll, tilt):
    bm = bmesh.new()
    seg, ring = 20, 6
    verts = []
    for i in range(seg):
        a = i / seg * 2 * math.pi
        row = []
        for j in range(ring):
            b = j / ring * 2 * math.pi
            p = Vector(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b)))
            row.append(bm.verts.new(p))
        verts.append(row)
    for i in range(seg):
        for j in range(ring):
            bm.faces.new((verts[i][j], verts[(i + 1) % seg][j], verts[(i + 1) % seg][(j + 1) % ring], verts[i][(j + 1) % ring]))
    bmesh.ops.rotate(bm, verts=bm.verts, cent=Vector(), matrix=Matrix.Rotation(tilt, 3, 'X'))
    bmesh.ops.translate(bm, verts=bm.verts, vec=Vector(center))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    return new_obj(name, me, coll)


def material(name, color, image=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    if image:
        img = bpy.data.images.load(image, check_existing=True)
        tn = nt.nodes.new('ShaderNodeTexImage')
        tn.image = img
        nt.links.new(tn.outputs['Color'], bsdf.inputs['Base Color'])
    return m


def decimate(o, ratio):
    if ratio >= .999:
        return
    m = o.modifiers.new('dec', 'DECIMATE')
    m.decimate_type = 'COLLAPSE'
    m.ratio = ratio
    m.use_collapse_triangulate = True
    bpy.context.view_layer.objects.active = o
    with bpy.context.temp_override(object=o, active_object=o):
        bpy.ops.object.modifier_apply(modifier=m.name)


def smooth(o, angle=38):
    me = o.data
    for p in me.polygons:
        p.use_smooth = True
    if hasattr(me, 'set_sharp_from_angle'):
        me.set_sharp_from_angle(angle=math.radians(angle))


def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def join(objs, name):
    objs = [o for o in objs if o is not None]
    ctx = {'object': objs[0], 'active_object': objs[0], 'selected_objects': objs, 'selected_editable_objects': objs}
    with bpy.context.temp_override(**ctx):
        bpy.ops.object.join()
    objs[0].name = name
    objs[0].data.name = name
    return objs[0]


# ------------------------------------------------------------------------------------------------ the build
def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    main_scene = bpy.context.scene
    main_scene.name = 'street.vehicles'
    main_scene.unit_settings.scale_length = 1.0
    bpy.ops.import_scene.gltf(filepath=SRC)
    src_objs = list(main_scene.objects)
    for o in src_objs:
        o.hide_render = True
        o.hide_set(True)
    meshes = [o for o in src_objs if o.type == 'MESH']
    optics_img = None
    # the optics texture as pixels (to find which end of each car has the red lamps)
    for o in meshes:
        if 'Optics' in o.name and o.active_material:
            for n in o.active_material.node_tree.nodes:
                if n.type == 'TEX_IMAGE':
                    optics_img = n.image
            if optics_img:
                break
    opx = list(optics_img.pixels[:])
    ow, oh = optics_img.size

    def optic_red(u, v):
        x = min(ow - 1, max(0, int(u * ow)))
        y = min(oh - 1, max(0, int(v * oh)))     # Blender pixel rows run bottom-up, as Blender UVs do
        i = (y * ow + x) * 4
        r, g, b = opx[i], opx[i + 1], opx[i + 2]
        return r > .35 and r > 1.7 * g and r > 1.7 * b

    coll = bpy.data.collections.new('vehicles')
    main_scene.collection.children.link(coll)
    mats = {'A': material('veh_A', (1, 1, 1), os.path.join(TEX, 'veh_a_albedo.jpg')),
            'B': material('veh_B', (1, 1, 1), os.path.join(TEX, 'veh_b_albedo.jpg')),
            'glass': material('veh_glass', (.08, .1, .11))}

    bodies = {}
    for t, c in CARS.items():
        parts = [o for o in meshes if o.name.startswith(c['body'] + '_')]
        body = next(o for o in parts if o.name.endswith('_Body_0'))
        bodies[t] = (body, parts)
    # each wheel to the car whose footprint holds it
    wheels = [o for o in meshes if o.name.startswith('Wheel_') and ('_Wheel_0' in o.name or '_Wheek_0' in o.name)]
    extras = [o for o in meshes if o.name.startswith('Wheel_') and '_Body_0' in o.name]
    frames = {}
    for t, (body, parts) in bodies.items():
        pts = world_verts(body)
        cx = sum(p.x for p in pts) / len(pts)
        cy = sum(p.y for p in pts) / len(pts)
        # principal horizontal axis
        sxx = sum((p.x - cx) ** 2 for p in pts) / len(pts)
        syy = sum((p.y - cy) ** 2 for p in pts) / len(pts)
        sxy = sum((p.x - cx) * (p.y - cy) for p in pts) / len(pts)
        ang = .5 * math.atan2(2 * sxy, sxx - syy)
        ax = Vector((math.cos(ang), math.sin(ang), 0))
        lat = Vector((-ax.y, ax.x, 0))
        lo = [(p - Vector((cx, cy, 0))).dot(ax) for p in pts]
        la = [(p - Vector((cx, cy, 0))).dot(lat) for p in pts]
        frames[t] = dict(c=Vector((cx, cy, 0)), ax=ax, lat=lat, L=max(lo) - min(lo), W=max(la) - min(la),
                         lo=(min(lo), max(lo)), la=(min(la), max(la)))
    owner = {}
    for w in wheels + extras:
        p = w.matrix_world @ (sum((v.co for v in w.data.vertices), Vector()) / len(w.data.vertices))
        best, bd = None, 1e9
        for t, f in frames.items():
            d = p - f['c']
            a, b = d.dot(f['ax']), d.dot(f['lat'])
            if f['lo'][0] - .2 < a < f['lo'][1] + .2 and f['la'][0] - .35 < b < f['la'][1] + .35:
                dist = math.hypot(a, b)
                if dist < bd:
                    best, bd = t, dist
        if best:
            owner.setdefault(best, []).append(w)
    stats = {'source': os.path.relpath(SRC, ROOT), 'blender': bpy.app.version_string, 'cars': {}}
    exported = []
    root = bpy.data.objects.new('street.vehicles', None)
    coll.objects.link(root)
    root['ll_asset_id'] = 'street.vehicles'
    root['ll_asset_version'] = 1
    root['ll_rig'] = 'none'
    root['ll_license'] = ('Contains CC BY 4.0 geometry and textures: "Generic passenger car pack" by Comrade1280 '
                          '(https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5), '
                          'modified for Last Light (see docs/THIRD_PARTY_ASSETS.md)')
    for t, c in CARS.items():
        body, parts = bodies[t]
        f = frames[t]
        ws = [w for w in owner.get(t, []) if '_Body_0' not in w.name]
        xs = [w for w in owner.get(t, []) if '_Body_0' in w.name]
        if len(ws) != 4:
            raise SystemExit(f'{t}: expected 4 wheels, found {[w.name for w in ws]}')
        # which end is the rear: the red lamps of the optics
        optics = next(o for o in parts if '_Optics_0' in o.name)
        me = optics.data
        uvl = me.uv_layers.active.data
        red = []
        for p in me.polygons:
            for li in p.loop_indices:
                u, v = uvl[li].uv
                if optic_red(u, v):
                    red.append((optics.matrix_world @ me.vertices[me.loops[li].vertex_index].co - f['c']).dot(f['ax']))
        rear_sign = 1 if sum(red) / max(1, len(red)) > 0 else -1
        lamp_loops = []   # (world point, 'head'|'tail') from the optics texture under each loop
        for p in me.polygons:
            for li in p.loop_indices:
                u, v = uvl[li].uv
                x = min(ow - 1, max(0, int(u * ow)))
                y = min(oh - 1, max(0, int(v * oh)))
                i = (y * ow + x) * 4
                r, g_, b = opx[i], opx[i + 1], opx[i + 2]
                kind = 'tail' if optic_red(u, v) else 'head' if min(r, g_, b) > .45 and max(r, g_, b) - min(r, g_, b) < .18 else None
                if kind:
                    lamp_loops.append((optics.matrix_world @ me.vertices[me.loops[li].vertex_index].co, kind))
        # car frame: Y along the length with the front at -Y; wheels' footprint centred; tyres on z = 0
        wc = [w.matrix_world @ (sum((v.co for v in w.data.vertices), Vector()) / len(w.data.vertices)) for w in ws]
        mid = sum(wc, Vector()) / 4
        yax = f['ax'] * rear_sign            # +Y = toward the rear
        xax = Vector((yax.y, -yax.x, 0))     # right-handed with z up: +X is the car's left (driver side, US)
        R = Matrix(((xax.x, xax.y, 0, 0), (yax.x, yax.y, 0, 0), (0, 0, 1, 0), (0, 0, 0, 1)))   # rows: world -> car
        T0 = R @ Matrix.Translation(Vector((-mid.x, -mid.y, 0)))
        s = c['L'] / f['L']
        zmin = min(min((T0 @ (w.matrix_world @ v.co)).z for v in w.data.vertices) for w in ws)
        T = Matrix.Scale(s, 4) @ Matrix.Translation(Vector((0, 0, -zmin + .004))) @ T0   # 4 mm into the ground (tyre contact)
        # the origin at the body's centre along its length (as the game's own cars: overhangs are not equal)
        bys = [(T @ (body.matrix_world @ v.co)).y for v in body.data.vertices]
        T = Matrix.Translation(Vector((0, -(min(bys) + max(bys)) / 2, 0))) @ T
        built = {}

        def take(o, name):
            me = o.data.copy()
            me.transform(T @ o.matrix_world)
            ob = new_obj(name, me, coll)
            ob.data.materials.clear()
            return ob
        bo = take(body, f'{t}.body')
        tile = LAYOUT['atlas'][t + ':body']
        remap_uv(bo.data, tile_uv(tile['px']))
        bo.data.materials.append(mats[tile['atlas']])
        go = take(next(o for o in parts if '_Glass_0' in o.name), f'{t}.glass')
        go.data.materials.append(mats['glass'])
        oo = take(optics, f'{t}.optics')
        remap_uv(oo.data, tile_uv(LAYOUT['atlas']['optics']['px']))
        oo.data.materials.append(mats['B'])
        wos = []
        for k, w in enumerate(sorted(ws, key=lambda w: ((T @ w.matrix_world.translation).y, (T @ w.matrix_world.translation).x))):
            wo = take(w, f'{t}.wheel{k}')
            remap_uv(wo.data, tile_uv(LAYOUT['atlas']['wheel:' + c['wheel']]['px']))
            wo.data.materials.append(mats['B'])
            wos.append(wo)
        xos = []
        for k, x in enumerate(xs):
            xo = take(x, f'{t}.extra{k}')
            remap_uv(xo.data, tile_uv(tile['px']))
            xo.data.materials.append(mats[tile['atlas']])
            xos.append(xo)
        lamps = {}
        for kind in ('head', 'tail'):
            for side in (1, -1):
                pts_ = [T @ q for q, k in lamp_loops if k == kind]
                pts_ = [q for q in pts_ if q.x * side > .15 and ((q.y < 0) if kind == 'head' else (q.y > 0))]
                if pts_:
                    lamps.setdefault(kind, []).append([round(sum(q[i] for q in pts_) / len(pts_), 3) for i in range(3)])
        # measurements in the finished frame
        bmn, bmx = bbox([v.co for v in bo.data.vertices])
        gmn, gmx = bbox([v.co for v in go.data.vertices])
        wcs = []
        for wo in wos:
            mn, mx = bbox([v.co for v in wo.data.vertices])
            wcs.append(((mn + mx) / 2, (mx.z - mn.z) / 2, mx.x - mn.x))
        wr = sum(w[1] for w in wcs) / 4
        wheelbase = abs(max(w[0].y for w in wcs) - min(w[0].y for w in wcs))
        track = abs(max(w[0].x for w in wcs) - min(w[0].x for w in wcs))
        # the cabin seen through the glass (original geometry; swatch UVs on atlas B)
        cab = []
        belt, roof = gmn.z, gmx.z
        y0, y1 = gmn.y, gmx.y                  # windshield base (front, -Y) .. rear glass
        Wc = (gmx.x - gmn.x)
        rows = c['rows'] if t != 'pickup' else 1
        span = (y1 - y0)
        frontY = y0 + span * (.36 if t not in ('minivan', 'suv') else .30)
        # heights from the glass: the cushion well below the belt line, every headrest inside the roof
        seatH = min(belt - .38, roof - 1.0)
        headZ = min(seatH + .72, roof - .2)
        backH = min(.6, headZ - seatH - .08)
        for side in (1, -1):
            sx = side * Wc * .22
            cab.append(rbox(f'{t}.seat{side}', (.48, .52, .14), (sx, frontY + .05, seatH), .04, coll))
            cab.append(rbox(f'{t}.back{side}', (.48, .12, backH), (sx, frontY + .33, seatH + .05 + backH / 2), .05, coll, rot=('X', -.22)))
            cab.append(rbox(f'{t}.head{side}', (.26, .1, .18), (sx, frontY + .42, headZ), .04, coll, rot=('X', -.12)))
        if t != 'pickup':
            ys = [frontY + .95] if rows == 2 else [frontY + .9, frontY + 1.75]
            for ry in ys:
                cab.append(rbox(f'{t}.bench{ry:.2f}', (Wc * .82, .55, .15), (0, ry, seatH - .02), .05, coll))
                cab.append(rbox(f'{t}.benchback{ry:.2f}', (Wc * .82, .12, backH), (0, ry + .3, seatH + .03 + backH / 2), .05, coll, rot=('X', -.2)))
                for sx in (-.36, .36):
                    cab.append(rbox(f'{t}.rhead{ry:.2f}{sx}', (.24, .09, .16), (sx * Wc * .9, ry + .36, min(headZ - .02, roof - .22)), .04, coll, rot=('X', -.15)))
        dash = rbox(f'{t}.dash', (Wc * .92, .42, .2), (0, y0 + .02, belt - .08), .06, coll)
        wheel_s = torus(f'{t}.steer', (Wc * .22, y0 + .32, belt + .02), .19, .018, coll, tilt=math.radians(62))
        for o in cab:
            swatch_uv(o.data, c['seat'])
        swatch_uv(dash.data, 'dash')
        swatch_uv(wheel_s.data, 'gloss_black')
        cab += [dash, wheel_s]
        for o in cab:
            o.data.materials.append(mats['B'])
        # rear plate: a 305 x 152 mm plate on the rear surface, found by a ray from behind
        bpy.context.view_layer.update()
        depsgraph = bpy.context.evaluated_depsgraph_get()
        hit_y = None
        for zz in (c['plate'], c['plate'] + .05, c['plate'] - .05):
            ok, loc, nor, _ = bo.ray_cast(Vector((0, bmx.y + 1, zz)), Vector((0, -1, 0)))
            if ok:
                hit_y = loc.y
                break
        if hit_y is None:
            hit_y = bmx.y
        pm = bpy.data.meshes.new(f'{t}.plate')
        pm.from_pydata([(-.1525, 0, -.076), (-.1525, 0, .076), (.1525, 0, .076), (.1525, 0, -.076)], [], [(0, 1, 2, 3)])
        pm.transform(Matrix.Translation(Vector((0, hit_y + .012, c['plate']))))   # faces +Y: the rear
        plate = new_obj(f'{t}.plate', pm, coll)
        plate_uv(pm, {'sedan': 'plate1', 'wagon': 'plate2', 'minivan': 'plate3', 'suv': 'plate1', 'pickup': 'plate2', 'hatchback': 'plate3'}[t])
        pm.materials.append(mats['B'])
        # the moving car's wheel: one wheel centred on its axle (the game turns it about X)
        wm = wos[0].data.copy()
        wm.transform(Matrix.Translation(-wcs[0][0]))
        wheel_c = new_obj(f'{t}.wheel.centred', wm, coll)
        # LODs -------------------------------------------------------------------------------------------
        lods = {}
        groups0 = dict(body=[bo] + xos + [oo], wheel=wos, glass=[go], cabin=cab + [plate])
        for lod in (2, 1):
            r = LOD_RATIO[lod]
            cp = {}
            for k, objs in groups0.items():
                if r.get(k if k != 'cabin' else 'cabin', 1) == 0:
                    continue
                cp[k] = []
                for o in objs:
                    n = o.copy()
                    n.data = o.data.copy()
                    n.name = f'{o.name}.lod{lod}'
                    coll.objects.link(n)
                    if k != 'cabin' or lod == 2:
                        decimate(n, r[k])
                    cp[k].append(n)
            lods[lod] = cp
        lods[0] = groups0
        for lod in (0, 1, 2):
            g = lods[lod]
            solid = [o for k in ('body', 'wheel', 'cabin') for o in g.get(k, [])]
            for o in solid:
                if lod > 0 and o.name.split('.')[1].startswith(('body', 'wheel', 'extra', 'optics')):
                    smooth(o)
            if lod == 0 and c.get('dynamic'):
                # the car that moves: its LOD0 without the wheels (the game turns its own wheels)
                shell = []
                for o in [o for k in ('body', 'cabin') for o in g.get(k, [])]:
                    n = o.copy()
                    n.data = o.data.copy()
                    coll.objects.link(n)
                    shell.append(n)
                sh = join(shell, f'veh.{t}.shell')
                sh.parent = root
                sh['ll_vehicle'] = t
                sh['ll_lod'] = 0
                exported.append(sh)
            ob = join(solid, f'veh.{t}.lod{lod}')
            gl = join(g['glass'], f'veh.{t}.lod{lod}.glass')
            for o in (ob, gl):
                o.parent = root
                o['ll_vehicle'] = t
                o['ll_lod'] = lod
            exported += [ob, gl]
        wheel_c.name = f'veh.{t}.wheel'
        wheel_c.data.name = f'veh.{t}.wheel'
        wheel_c.parent = root
        wheel_c['ll_vehicle'] = t
        wheel_c['ll_lod'] = 0
        exported.append(wheel_c)
        info = dict(L=round(bmx.y - bmn.y, 3), W=round(bmx.x - bmn.x, 3), H=round(bmx.z, 3), scale=round(s, 4),
                    wheelR=round(wr, 3), wheelbase=round(wheelbase, 3), track=round(track, 3),
                    wheels=[[round(w[0].x, 3), round(w[0].y, 3), round(w[0].z, 3)] for w in wcs],
                    belt=round(belt, 3), roof=round(roof, 3), source=c['body'], wheelTexture=c['wheel'], lamps=lamps,
                    tris={f'lod{l}': tris(bpy.data.objects[f'veh.{t}.lod{l}']) + tris(bpy.data.objects[f'veh.{t}.lod{l}.glass'])
                          for l in (0, 1, 2)}, wheelTris=tris(wheel_c))
        root[f'veh_{t}'] = json.dumps(info)
        stats['cars'][t] = info
        log(t, info)
    # export scene: only the root and its children
    for o in list(coll.objects):
        if o is not root and o.parent is not root:
            bpy.data.objects.remove(o)

    os.makedirs(os.path.dirname(BLEND), exist_ok=True)
    # the .blend keeps the built vehicles (editable) with the atlases as files (assets/source/street/textures, relative
    # paths); the imported pack is not kept in it (the original GLB is in the repository and this script rebuilds it)
    keep_imgs = {m.node_tree.nodes['Image Texture'].image for m in (mats['A'], mats['B'])}
    for o in src_objs:
        bpy.data.objects.remove(o)
    for img in list(bpy.data.images):
        if img not in keep_imgs:
            bpy.data.images.remove(img)
    for me in list(bpy.data.meshes):
        if me.users == 0:
            bpy.data.meshes.remove(me)
    for m in list(bpy.data.materials):
        if m.users == 0:
            bpy.data.materials.remove(m)
    bpy.ops.wm.save_as_mainfile(filepath=BLEND, relative_remap=True, compress=True)
    # export with untextured stand-ins of the three materials (the game builds its own from the atlases)
    plain = {}
    for key, m in mats.items():
        p = bpy.data.materials.new(m.name + '.x')
        p.diffuse_color = (1, 1, 1, 1)
        plain[m.name] = p
    for o in exported:
        for i, slot in enumerate(o.data.materials):
            o.data.materials[i] = plain[slot.name]
    for m in mats.values():
        m.name = m.name + '.src'
    for k, p in plain.items():
        p.name = k
    ll_export.export_glb(OUT, export_materials='EXPORT', export_tangents=False)   # no normal maps on the cars
    stats['glb_bytes'] = os.path.getsize(OUT)
    json.dump(stats, open(STATS, 'w'), indent=1)
    log('wrote', OUT, stats['glb_bytes'], 'bytes')


if __name__ == '__main__':
    main()
