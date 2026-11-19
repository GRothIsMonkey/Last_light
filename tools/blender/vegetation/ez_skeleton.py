"""Recover the branch skeletons of Jungle Jim's "Realistic Trees Collection" (EZ-Tree meshes; CC BY 4.0).

EZ-Tree builds each branch as a tube: (sections + 1) rings of (segments + 1) vertices, the last vertex of a ring
duplicating the first (UV seam). Each connected tube is one branch; ring centroids and radii are its skeleton. The trees
are modelled at ~10x real size (EZ-Tree units); positions come out in metres (x0.1), Blender frame (Z up), tree base
at the origin.
"""
import json
import struct
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import connected_components


def _load(path):
    d = open(path, 'rb').read()
    ln = struct.unpack_from('<I', d, 12)[0]
    js = json.loads(d[20:20 + ln])
    return d, js, 20 + ln + 8


def _acc(d, js, bo, ai):
    a = js['accessors'][ai]
    v = js['bufferViews'][a['bufferView']]
    n = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[a['type']]
    dt = {5126: np.float32, 5125: np.uint32, 5123: np.uint16, 5121: np.uint8}[a['componentType']]
    off = bo + v.get('byteOffset', 0) + a.get('byteOffset', 0)
    st = v.get('byteStride', 0) // np.dtype(dt).itemsize or n
    arr = np.frombuffer(d, dtype=dt, count=a['count'] * st, offset=off).reshape(a['count'], st)[:, :n]
    return arr.astype(np.float64 if dt == np.float32 else np.int64)


def _world(js, i):
    nodes = js['nodes']
    parent = {c: k for k, n in enumerate(nodes) for c in n.get('children', [])}

    def mat(n):
        if 'matrix' in n:
            return np.array(n['matrix']).reshape(4, 4).T
        m = np.eye(4)
        if 'scale' in n:
            m = m @ np.diag(list(n['scale']) + [1])
        if 'rotation' in n:
            x, y, z, w = n['rotation']
            R = np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                          [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                          [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])
            m2 = np.eye(4)
            m2[:3, :3] = R
            m = m2 @ m
        if 'translation' in n:
            t = np.eye(4)
            t[:3, 3] = n['translation']
            m = t @ m
        return m
    m = mat(nodes[i])
    while i in parent:
        i = parent[i]
        m = mat(nodes[i]) @ m
    return m


def extract(path, mesh_name):
    """skeleton of one tree's 'branches' mesh: list of branches, each (k,3) centres and (k,) radii, metres, Z up"""
    d, js, bo = _load(path)
    mi = next(i for i, m in enumerate(js['meshes']) if m['name'] == mesh_name)
    ni = next(i for i, n in enumerate(js['nodes']) if n.get('mesh') == mi)
    M = _world(js, ni)
    pr = js['meshes'][mi]['primitives'][0]
    P = _acc(d, js, bo, pr['attributes']['POSITION'])
    P = P @ M[:3, :3].T + M[:3, 3]
    P = np.stack([P[:, 0], -P[:, 2], P[:, 1]], 1) * 0.1     # glTF Y-up -> Z-up, EZ-Tree units -> metres
    I = _acc(d, js, bo, pr['indices']).ravel()
    n = len(P)
    e = I.reshape(-1, 3)
    G = coo_matrix((np.ones(len(e) * 3), (np.concatenate([e[:, 0], e[:, 1], e[:, 2]]), np.concatenate([e[:, 1], e[:, 2], e[:, 0]]))), shape=(n, n))
    nc, lab = connected_components(G, directed=False)
    UV = _acc(d, js, bo, pr['attributes']['TEXCOORD_0'])
    # EZ-Tree UVs: u runs once around each ring, v alternates 0/1 from ring to ring. A ring is therefore a connected set
    # of vertices joined by edges whose two ends share v (edges between rings always cross v).
    a = np.concatenate([e[:, 0], e[:, 1], e[:, 2]])
    b = np.concatenate([e[:, 1], e[:, 2], e[:, 0]])
    same = np.abs(UV[a, 1] - UV[b, 1]) < 1e-4
    # (the seam duplicate at u=1 shares its position with u=0 but not its index: join coincident vertices too)
    Gr = coo_matrix((np.ones(same.sum()), (a[same], b[same])), shape=(n, n))
    _, ring = connected_components(Gr, directed=False)
    cross = ~same
    branches = []
    for c in range(nc):
        idx = np.nonzero(lab == c)[0]
        rids = np.unique(ring[idx])
        if len(rids) < 2:
            continue
        C = {r: P[ring == r].mean(0) for r in rids}
        R = {r: np.linalg.norm(P[ring == r] - C[r], axis=1).mean() for r in rids}
        # ring adjacency along the tube
        m = cross & (lab[a] == c)
        adj = {r: set() for r in rids}
        for x, y in zip(ring[a[m]], ring[b[m]]):
            if x != y:
                adj[x].add(y)
                adj[y].add(x)
        ends = [r for r in rids if len(adj[r]) <= 1] or [rids[0]]
        start = max(ends, key=lambda r: R[r])
        path, prev, cur = [start], None, start
        while True:
            nxt = [r for r in adj[cur] if r != prev and r not in path]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
            path.append(cur)
        branches.append((np.array([C[r] for r in path]), np.array([R[r] for r in path])))
    base = min(b[0][0, 2] for b in branches)
    root = branches[int(np.argmax([b[1][0] for b in branches]))][0][0]
    shift = np.array([root[0], root[1], base])
    return [(C - shift, R) for C, R in branches]


def to_skeleton(branches):
    """branches -> one node tree (pos, parent, radius): each branch's first ring attaches to the nearest node of an
    earlier (thicker) branch."""
    order = np.argsort([-b[1][0] for b in branches])
    pos, par, rad = [], [], []
    for k, bi in enumerate(order):
        C, R = branches[bi]
        start = len(pos)
        if k == 0:
            attach = -1
        else:
            Pa = np.array(pos)
            attach = int(np.argmin(np.linalg.norm(Pa - C[0], axis=1)))
        for i in range(len(C)):
            pos.append(C[i])
            rad.append(R[i])
            par.append(attach if i == 0 else start + i - 1)
    return np.array(pos), np.array(par), np.array(rad)


if __name__ == '__main__':
    import sys
    sys.path.insert(0, __import__('os').path.dirname(__file__))
    import veg_paths
    p = veg_paths.original('realistic_trees_collection.glb')
    _, js, _ = _load(p)
    for m in js['meshes']:
        if 'branches' in m['name'] or m['name'].endswith('material_0'):
            br = extract(p, m['name'])
            P, par, R = to_skeleton(br)
            print(f"{m['name'][:40]:40s} branches {len(br):4d} nodes {len(P):5d} height {P[:, 2].max():5.2f} m  "
                  f"spread {np.ptp(P[:, 0]):5.2f} x {np.ptp(P[:, 1]):5.2f} m  trunk r {R.max():.3f}")
