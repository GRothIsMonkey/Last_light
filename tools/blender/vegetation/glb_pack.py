"""Pack a vegetation GLB's vertex data (no visible change): NORMAL -> signed bytes (KHR_mesh_quantization),
COLOR_0 -> unsigned normalized bytes, _WIND -> signed normalized bytes (all its channels are in [-1, 1]).
POSITION, TEXCOORD_0, indices and images are copied unchanged. 56 -> 32 bytes per vertex.

    python tools/blender/vegetation/glb_pack.py dist/assets/veg/*.glb      (in place; prints before/after)
"""
import json
import struct
import sys
import numpy as np

COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def read(path):
    d = open(path, 'rb').read()
    ln = struct.unpack_from('<I', d, 12)[0]
    js = json.loads(d[20:20 + ln])
    bl = struct.unpack_from('<I', d, 20 + ln)[0]
    return js, d[20 + ln + 8:20 + ln + 8 + bl]


def acc_data(js, binb, ai):
    a = js['accessors'][ai]
    v = js['bufferViews'][a['bufferView']]
    dt = COMP[a['componentType']]
    n = NCOMP[a['type']]
    item = np.dtype(dt).itemsize
    stride = v.get('byteStride', n * item)
    off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    raw = np.frombuffer(binb, dtype=np.uint8, count=stride * (a['count'] - 1) + n * item, offset=off)
    out = np.zeros((a['count'], n), dt)
    for i in range(a['count']):
        pass
    full = np.lib.stride_tricks.as_strided(np.frombuffer(raw.tobytes() + b'\0' * stride, dtype=np.uint8), shape=(a['count'], n * item), strides=(stride, 1))
    out = np.frombuffer(full.copy().tobytes(), dtype=dt).reshape(a['count'], n)
    if a.get('normalized'):
        if dt == np.int8:
            return np.maximum(out / 127.0, -1)
        if dt == np.uint8:
            return out / 255.0
        if dt == np.int16:
            return np.maximum(out / 32767.0, -1)
        if dt == np.uint16:
            return out / 65535.0
    return out.astype(np.float64) if dt == np.float32 else out


def pack(path):
    js, binb = read(path)
    before = len(open(path, 'rb').read())
    chunks = []
    views = []

    def add_view(data, target=None, stride=None):
        off = sum(len(c) for c in chunks)
        pad = (-off) % 4
        if pad:
            chunks.append(b'\0' * pad)
            off += pad
        chunks.append(data)
        v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(data)}
        if target:
            v['target'] = target
        if stride:
            v['byteStride'] = stride
        views.append(v)
        return len(views) - 1
    # images keep their bytes
    view_map = {}
    for i, im in enumerate(js.get('images', [])):
        ov = js['bufferViews'][im['bufferView']]
        data = binb[ov.get('byteOffset', 0):ov.get('byteOffset', 0) + ov['byteLength']]
        view_map[im['bufferView']] = add_view(data)
        im['bufferView'] = view_map[im['bufferView']]
    new_acc = []
    acc_map = {}

    def copy_acc(ai, target):
        if ai in acc_map:
            return acc_map[ai]
        a = dict(js['accessors'][ai])
        data = acc_data(js, binb, ai)
        dt = COMP[a['componentType']]
        raw = np.ascontiguousarray(data.astype(dt)).tobytes()
        a['bufferView'] = add_view(raw, target)
        a.pop('byteOffset', None)
        new_acc.append(a)
        acc_map[ai] = len(new_acc) - 1
        return acc_map[ai]

    def quant_acc(ai, kind):
        a = js['accessors'][ai]
        x = acc_data(js, binb, ai).astype(np.float64)
        if kind == 'normal':
            x = x / (np.linalg.norm(x, axis=1, keepdims=True) + 1e-12)
            q = np.round(np.clip(x, -1, 1) * 127).astype(np.int8)
            q = np.concatenate([q, np.zeros((len(q), 1), np.int8)], 1)     # 4-byte aligned elements
            v = add_view(q.tobytes(), 34962, 4)
            na = {'bufferView': v, 'componentType': 5120, 'normalized': True, 'count': len(q), 'type': 'VEC3'}
        elif kind == 'color':
            if x.shape[1] == 3:
                x = np.concatenate([x, np.ones((len(x), 1))], 1)
            q = np.round(np.clip(x, 0, 1) * 255).astype(np.uint8)
            v = add_view(q.tobytes(), 34962, 4)
            na = {'bufferView': v, 'componentType': 5121, 'normalized': True, 'count': len(q), 'type': 'VEC4'}
        else:
            q = np.round(np.clip(x, -1, 1) * 127).astype(np.int8)
            v = add_view(q.tobytes(), 34962, 4)
            na = {'bufferView': v, 'componentType': 5120, 'normalized': True, 'count': len(q), 'type': 'VEC4'}
        new_acc.append(na)
        return len(new_acc) - 1
    for m in js['meshes']:
        for pr in m['primitives']:
            at = pr['attributes']
            for k in list(at):
                if k == 'NORMAL':
                    at[k] = quant_acc(at[k], 'normal')
                elif k == 'COLOR_0':
                    at[k] = quant_acc(at[k], 'color')
                elif k == '_WIND':
                    at[k] = quant_acc(at[k], 'wind')
                elif k == 'TANGENT':
                    del at[k]
                else:
                    at[k] = copy_acc(at[k], 34962)
            if 'indices' in pr:
                pr['indices'] = copy_acc(pr['indices'], 34963)
    js['accessors'] = new_acc
    js['bufferViews'] = views
    binall = b''.join(chunks)
    binall += b'\0' * ((-len(binall)) % 4)
    js['buffers'] = [{'byteLength': len(binall)}]
    for ext in ('KHR_mesh_quantization',):
        js.setdefault('extensionsUsed', [])
        js.setdefault('extensionsRequired', [])
        if ext not in js['extensionsUsed']:
            js['extensionsUsed'].append(ext)
        if ext not in js['extensionsRequired']:
            js['extensionsRequired'].append(ext)
    js.setdefault('asset', {}).setdefault('extras', {})['lastLightPack'] = 'glb_pack.py: NORMAL int8 (KHR_mesh_quantization), COLOR_0 uint8, _WIND int8 normalized'
    jb = json.dumps(js, separators=(',', ':')).encode()
    jb += b' ' * ((-len(jb)) % 4)
    out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(binall)) + struct.pack('<I4s', len(jb), b'JSON') + jb + struct.pack('<I4s', len(binall), b'BIN\0') + binall
    open(path, 'wb').write(out)
    print(f'{path}: {before:,} -> {len(out):,} bytes ({100 * len(out) / before:.0f}%)')


if __name__ == '__main__':
    for p in sys.argv[1:]:
        pack(p)
