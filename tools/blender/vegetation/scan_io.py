"""Read the oak laser scan (glTF POINTS: POSITION + COLOR_0) straight from the original GLB into numpy.

Coordinates are returned in Blender's frame (Z up, metres): the file's Sketchfab root matrix (a Z-up -> Y-up turn)
and the inner node's translation are applied exactly as the glTF importer would, then glTF Y-up -> Blender Z-up.
"""
import json
import struct
import numpy as np


def _mat(n):
    if 'matrix' in n:
        return np.array(n['matrix'], dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if 'translation' in n:
        m[:3, 3] = n['translation']
    return m


def load_scan(path):
    d = open(path, 'rb').read()
    ln = struct.unpack_from('<I', d, 12)[0]
    js = json.loads(d[20:20 + ln])
    bo = 20 + ln + 8
    acc, bv = js['accessors'], js['bufferViews']

    def read(ai, n):
        a = acc[ai]
        v = bv[a['bufferView']]
        off = bo + v.get('byteOffset', 0) + a.get('byteOffset', 0)
        st = v.get('byteStride', 4 * n)
        arr = np.frombuffer(d, dtype=np.float32, count=a['count'] * st // 4, offset=off).reshape(a['count'], st // 4)
        return arr[:, :n].astype(np.float64)
    nodes = js['nodes']
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []):
            parent[c] = i

    def world(i):
        m = _mat(nodes[i])
        while i in parent:
            i = parent[i]
            m = _mat(nodes[i]) @ m
        return m
    P, Cc = [], []
    for i, n in enumerate(nodes):
        if 'mesh' not in n:
            continue
        pr = js['meshes'][n['mesh']]['primitives'][0]
        p = read(pr['attributes']['POSITION'], 3)
        c = read(pr['attributes']['COLOR_0'], 4)[:, :3]
        m = world(i)
        p = p @ m[:3, :3].T + m[:3, 3]
        P.append(p)
        Cc.append(c)
    P = np.concatenate(P)
    Cc = np.concatenate(Cc)
    # glTF (x, y_up, z) -> Blender (x, -z, y)
    B = np.stack([P[:, 0], -P[:, 2], P[:, 1]], axis=1)
    return B, Cc
