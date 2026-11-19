"""The old oak, step 1: a branch skeleton from kungphil's laser scan (4.6 M coloured points, no surfaces).

Method (the standard one for terrestrial laser scans; e.g. Xu, Gossett & Chen 2007): voxelize the points, connect
neighbouring voxels into a graph, measure every voxel's geodesic distance from the trunk base along the graph (Dijkstra),
slice those distances into level sets, split each slice into connected (and, in dense foliage, spatially limited)
clusters, and join each cluster to the cluster it touches in the slice below. The cluster centroids are the skeleton.
Radii follow the pipe model (area proportional to the foliage carried), calibrated to the trunk measured in the scan.

Output: assets/source/vegetation/oak/oak_skeleton.json (oak-local frame: origin at the trunk centre on the ground,
X = scan x, Y = scan y, Z up; metres) and oak_leafpoints.npz (foliage voxels, for the crown and leaf cards).
python tools/blender/vegetation/oak_skeleton.py   (numpy + scipy; bpy not needed)
"""
import json
import os
import sys
import time
import numpy as np
from scipy.spatial import cKDTree
from scipy.sparse import coo_matrix
from scipy.sparse.csgraph import dijkstra, connected_components

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from scan_io import load_scan  # noqa: E402

ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUTDIR = os.path.join(ROOT, 'assets', 'source', 'vegetation', 'oak')
TRUNK_XY = np.array([-2.30, 19.95])   # measured: centre of the trunk slices 0.3-2 m above the ground (scan frame)
GROUND_Z = -1.20                       # the scan's lowest points: the ground line at the trunk
VOX = 0.08
STEP = 0.30                            # geodesic slice width (m)
MAXSPAN = 0.9                          # a slice cluster wider than this is split (dense foliage)


def voxelize(P, C, v):
    k = np.floor(P / v).astype(np.int64)
    key = (k[:, 0] + 4096) * 16777216 + (k[:, 1] + 4096) * 4096 + (k[:, 2] + 4096)
    u, inv, cnt = np.unique(key, return_inverse=True, return_counts=True)
    pos = np.zeros((len(u), 3))
    col = np.zeros((len(u), 3))
    np.add.at(pos, inv, P)
    np.add.at(col, inv, C)
    return pos / cnt[:, None], col / cnt[:, None], cnt


def main(src):
    t0 = time.time()
    P, C = load_scan(src)
    P = P - np.array([TRUNK_XY[0], TRUNK_XY[1], GROUND_Z])
    V, VC, VN = voxelize(P, C, VOX)
    print(f'{len(P):,} points -> {len(V):,} voxels ({VOX} m) in {time.time() - t0:.1f}s')
    tree = cKDTree(V)
    pairs = tree.query_pairs(VOX * 2.6, output_type='ndarray')
    w = np.linalg.norm(V[pairs[:, 0]] - V[pairs[:, 1]], axis=1)
    n = len(V)
    G = coo_matrix((np.concatenate([w, w]), (np.concatenate([pairs[:, 0], pairs[:, 1]]), np.concatenate([pairs[:, 1], pairs[:, 0]]))), shape=(n, n)).tocsr()
    nc, lab = connected_components(G, directed=False)
    sizes = np.bincount(lab)
    main_c = sizes.argmax()
    print(f'graph: {len(pairs):,} edges, {nc} components, main {sizes[main_c]:,} voxels')
    # bridge stray components (scan shadows) to the main one with a penalty, so no foliage is orphaned
    extra_r, extra_c, extra_w = [], [], []
    mt = cKDTree(V[lab == main_c])
    mi = np.nonzero(lab == main_c)[0]
    for c in np.nonzero(sizes >= 3)[0]:
        if c == main_c:
            continue
        idx = np.nonzero(lab == c)[0]
        d, j = mt.query(V[idx])
        a = d.argmin()
        if d[a] < 1.5:
            extra_r += [idx[a], mi[j[a]]]
            extra_c += [mi[j[a]], idx[a]]
            extra_w += [d[a] * 3, d[a] * 3]
    if extra_r:
        G = (G + coo_matrix((extra_w, (extra_r, extra_c)), shape=(n, n)).tocsr()).tocsr()
    root = np.nonzero((np.hypot(V[:, 0], V[:, 1]) < 0.9) & (V[:, 2] < 0.35))[0]
    print('root voxels', len(root))
    dist = dijkstra(G, directed=False, indices=root, min_only=True)
    ok = np.isfinite(dist)
    print(f'reached {ok.sum():,} of {n:,} voxels; max geodesic {dist[ok].max():.1f} m')
    level = np.where(ok, np.floor(dist / STEP), -1).astype(int)
    # slice clusters
    Gc = G.tocoo()
    same = level[Gc.row] == level[Gc.col]
    S = coo_matrix((np.ones(same.sum()), (Gc.row[same], Gc.col[same])), shape=(n, n)).tocsr()
    _, comp = connected_components(S, directed=False)
    # split wide components spatially (k-means-lite on a grid of MAXSPAN cells)
    cl = np.full(n, -1)
    nodes = []
    order = np.argsort(comp)
    bounds = np.flatnonzero(np.diff(comp[order])) + 1
    for grp in np.split(order, bounds):
        grp = grp[ok[grp]]
        if not len(grp):
            continue
        pts = V[grp]
        span = np.ptp(pts, axis=0).max()
        if span > MAXSPAN:
            cell = np.floor((pts - pts.min(0)) / (MAXSPAN * .75)).astype(int)
            key = cell[:, 0] * 10000 + cell[:, 1] * 100 + cell[:, 2]
            _, sub = np.unique(key, return_inverse=True)
        else:
            sub = np.zeros(len(grp), int)
        for s in np.unique(sub):
            m = grp[sub == s]
            cl[m] = len(nodes)
            wts = VN[m].astype(float)
            nodes.append({'level': int(level[m[0]]), 'pos': (V[m] * wts[:, None]).sum(0) / wts.sum(), 'mass': float(wts.sum()),
                          'nvox': int(len(m)), 'col': (VC[m] * wts[:, None]).sum(0) / wts.sum(), 'spread': float(np.linalg.norm(V[m] - V[m].mean(0), axis=1).mean())})
    print(f'{len(nodes):,} skeleton clusters in {level.max() + 1} slices')
    # parent: the neighbouring cluster one slice down with the most edges to this one
    a, b = Gc.row, Gc.col
    ca, cb = cl[a], cl[b]
    valid = (ca >= 0) & (cb >= 0)
    a, b, ca, cb = a[valid], b[valid], ca[valid], cb[valid]
    la, lb = level[a], level[b]
    down = la == lb + 1
    pc = {}
    for x, y in zip(ca[down], cb[down]):
        pc.setdefault(x, {}).setdefault(y, 0)
        pc[x][y] += 1
    parent = np.full(len(nodes), -1)
    for x, cand in pc.items():
        parent[x] = max(cand, key=cand.get)
    # clusters with no parent above level 0: attach to the nearest cluster in a lower level (scan gaps)
    pos = np.array([nd['pos'] for nd in nodes])
    lev = np.array([nd['level'] for nd in nodes])
    for i in np.nonzero((parent < 0) & (lev > 0))[0]:
        lower = np.nonzero(lev < lev[i])[0]
        j = lower[np.linalg.norm(pos[lower] - pos[i], axis=1).argmin()]
        parent[i] = j
    # the level-0 clusters all join one root at the trunk base
    roots = np.nonzero(parent < 0)[0]
    r0 = roots[np.linalg.norm(pos[roots, :2], axis=1).argmin()]
    for r in roots:
        if r != r0:
            parent[r] = r0
    # downstream foliage mass (pipe model)
    down_mass = np.array([nd['mass'] for nd in nodes])
    for i in np.argsort(-lev):
        if parent[i] >= 0:
            down_mass[parent[i]] += down_mass[i]
    out = {'source': 'kungphil, "200 year old oak tree" (Sketchfab, CC BY 4.0): laser scan oak_RGB_2cm.ply',
           'frame': 'oak-local: origin trunk centre at ground; X,Y as the scan; Z up; metres',
           'scan_offset': [float(TRUNK_XY[0]), float(TRUNK_XY[1]), GROUND_Z], 'voxel': VOX, 'step': STEP,
           'nodes': [{'p': [round(float(x), 4) for x in nd['pos']], 'parent': int(parent[i]), 'level': nd['level'],
                      'mass': round(nd['mass'], 1), 'down': round(float(down_mass[i]), 1), 'spread': round(nd['spread'], 3),
                      'col': [round(float(x), 3) for x in nd['col']]} for i, nd in enumerate(nodes)]}
    os.makedirs(OUTDIR, exist_ok=True)
    with open(os.path.join(OUTDIR, 'oak_skeleton.json'), 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    # foliage voxels (positions, colours, counts, geodesic distance) for the crown envelope and leaf-card placement
    np.savez_compressed(os.path.join(OUTDIR, 'oak_scan_voxels.npz'), pos=V.astype(np.float32), col=VC.astype(np.float16),
                        n=VN.astype(np.int32), geo=np.where(ok, dist, -1).astype(np.float32), cluster=cl.astype(np.int32))
    print(f'done in {time.time() - t0:.1f}s; root {r0}; trunk base mass {down_mass[r0]:.0f}')


if __name__ == '__main__':
    sys.path.insert(0, HERE)
    import veg_paths  # noqa
    main(veg_paths.original('200_year_old_oak_tree.glb'))
