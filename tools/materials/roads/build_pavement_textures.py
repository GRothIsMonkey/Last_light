#!/usr/bin/env python3
"""Pavement reconstruction (Prologue, ?pavement): build the runtime pavement textures from their CC0 sources.

Sources (CC0, Poly Haven; the files are kept unmodified in assets/source/road/polyhaven/<id>/, see PROVENANCE.md):
  asphalt_07          residential asphalt: dense stone aggregate in dark binder, 2.5 m x 2.5 m
  gravel_concrete_04  aged sidewalk concrete: fine aggregate, small exposed stones, pores, 2.0 m x 2.0 m

Outputs (dist/assets/pavement/, loaded by dist/pavement-surfaces.js; linear data, NOT sRGB):
  pv.<name>.albedo.jpg  RGB albedo DETAIL: the scan's colour divided by its own broad (>~0.3 m) variation and by its
                        mean colour, with most of its chroma removed (stone-to-stone hue differences are kept at a reduced
                        strength), stored x0.5 so that 0.5 = "the palette colour exactly" (headroom to 2x). The game's
                        palette colour and its own macro variation (wear, sections, stains) are applied in the shader,
                        so no blotch is ever baked into a repeating tile.
  pv.<name>.normal.jpg  RGB tangent-space normal (OpenGL convention, +Y up in the texture), as scanned.
  pv.<name>.hra.jpg     R height (displacement, high-passed, 0.5 = mean), G roughness (as scanned), B ambient occlusion.

Every operation is periodic (FFT high-pass, wrap padding before resampling), so the tiles stay seamless.

usage: python3 tools/materials/roads/build_pavement_textures.py [--size 1024]
Needs numpy and Pillow. Deterministic: the same sources give byte-identical outputs (Pillow's JPEG encoder, fixed
quality and subsampling).
"""
import argparse, hashlib, json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
SRC = os.path.join(ROOT, 'assets', 'source', 'road', 'polyhaven')
OUT = os.path.join(ROOT, 'dist', 'assets', 'pavement')

# name -> source id, physical tile size (m), parameters
MATERIALS = {
    'asphalt': dict(src='asphalt_07', meters=2.5,
                    chroma=.30,       # share of the scan's stone-to-stone colour differences kept
                    highpass=.32,     # metres: broader variation than this is removed (the shader owns it)
                    contrast=1.0),
    'concrete': dict(src='gravel_concrete_04', meters=2.0,
                     chroma=.38, highpass=.28, contrast=.9),
}

def srgb_to_linear(c):
    c = c.astype(np.float64) / 255.0
    return np.where(c <= .04045, c / 12.92, ((c + .055) / 1.055) ** 2.4)

def load(path):
    if not os.path.exists(path):
        sys.exit('missing source: %s (see assets/source/road/PROVENANCE.md)' % path)
    return np.asarray(Image.open(path).convert('RGB'))

def resample(a, size):
    """Downsample a tileable image (H, W[, C], float) to size x size, wrap-padded so the edges stay seamless."""
    h = a.shape[0]
    pad = h // 16
    p = np.pad(a, ((pad, pad), (pad, pad)) + ((0, 0),) * (a.ndim - 2), mode='wrap')
    s = size / h
    big = int(round(p.shape[0] * s))
    chans = [p] if a.ndim == 2 else [p[..., k] for k in range(a.shape[2])]
    out = []
    for c in chans:
        im = Image.fromarray(c.astype(np.float32), mode='F').resize((big, big), Image.LANCZOS)
        out.append(np.asarray(im, dtype=np.float64))
    r = out[0] if a.ndim == 2 else np.stack(out, -1)
    q = int(round(pad * s))
    return r[q:q + size, q:q + size]

def gauss_blur_periodic(a, sigma_px):
    """Gaussian blur with periodic boundaries (FFT)."""
    n = a.shape[0]
    f = np.fft.fftfreq(n)
    g = np.exp(-2 * (np.pi * sigma_px) ** 2 * (f[:, None] ** 2 + f[None, :] ** 2))
    if a.ndim == 2:
        return np.real(np.fft.ifft2(np.fft.fft2(a) * g))
    return np.stack([np.real(np.fft.ifft2(np.fft.fft2(a[..., k]) * g)) for k in range(a.shape[2])], -1)

def to8(a):
    return np.clip(np.round(a * 255.0), 0, 255).astype(np.uint8)

def save(a, path):
    Image.fromarray(a).save(path, quality=93, subsampling=0)
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()

def build(name, P, size):
    d = os.path.join(SRC, P['src'])
    base = os.path.join(d, P['src'] + '_%s_2k.jpg')
    diff = srgb_to_linear(load(base % 'diff'))
    nor = load(base % 'nor_gl').astype(np.float64) / 255.0
    rough = load(base % 'rough')[..., 0].astype(np.float64) / 255.0
    disp = load(base % 'disp')[..., 0].astype(np.float64) / 255.0
    ao = load(base % 'ao')[..., 0].astype(np.float64) / 255.0

    diff = resample(diff, size)
    nor = resample(nor, size)
    rough = resample(rough, size)
    disp = resample(disp, size)
    ao = resample(ao, size)
    px_per_m = size / P['meters']
    sigma = P['highpass'] * px_per_m / 2.5  # ~ the high-pass corner

    # albedo detail: luminance high-passed (ratio to its own broad level), chroma reduced and neutral on average
    lum = diff @ np.array([.2126, .7152, .0722])
    lum = np.maximum(lum, 1e-4)
    broad = gauss_blur_periodic(lum, sigma)
    detail = lum / np.maximum(broad, 1e-4)
    detail = 1 + (detail - 1) * P['contrast']
    chroma = diff / lum[..., None]                     # per-pixel colour / grey
    chroma = chroma / chroma.reshape(-1, 3).mean(0)    # remove the scan's overall cast (warm/brown)
    chroma = 1 + (chroma - 1) * P['chroma']
    alb = detail[..., None] * chroma
    alb = alb / alb.reshape(-1, 3).mean(0)             # mean exactly 1 per channel
    stats = dict(albedo_p01=float(np.percentile(alb, 1)), albedo_p99=float(np.percentile(alb, 99)))
    alb8 = to8(np.clip(alb * .5, 0, 1))

    # normal: the scan's own, renormalised after resampling
    n = nor * 2 - 1
    n /= np.maximum(np.linalg.norm(n, axis=-1, keepdims=True), 1e-6)
    nor8 = to8(n * .5 + .5)

    # height: high-passed at twice the albedo corner (so a stone's dome survives), 0.5 = mean
    h = disp - gauss_blur_periodic(disp, sigma * 2)
    h = h / max(1e-6, np.percentile(np.abs(h), 99.5)) * .5 + .5
    hra = np.stack([np.clip(h, 0, 1), np.clip(rough, 0, 1), np.clip(ao, 0, 1)], -1)
    hra8 = to8(hra)

    os.makedirs(OUT, exist_ok=True)
    files = {}
    for kind, arr in (('albedo', alb8), ('normal', nor8), ('hra', hra8)):
        p = os.path.join(OUT, 'pv.%s.%s.jpg' % (name, kind))
        files[os.path.relpath(p, ROOT)] = dict(sha256=save(arr, p), bytes=os.path.getsize(p))
    stats.update(rough_mean=float(rough.mean()), meters=P['meters'], px_per_m=px_per_m, size=size)
    return files, stats

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--size', type=int, default=1024)
    a = ap.parse_args()
    manifest = dict(tool='tools/materials/roads/build_pavement_textures.py', size=a.size, materials={})
    for name, P in MATERIALS.items():
        files, stats = build(name, P, a.size)
        manifest['materials'][name] = dict(source=P['src'], license='CC0 1.0 (Poly Haven)', params=P, stats=stats, files=files)
        print(name, json.dumps(stats))
        for f, i in files.items():
            print('  ', f, i['bytes'], i['sha256'][:16])
    with open(os.path.join(OUT, 'pavement-textures.json'), 'w') as f:
        json.dump(manifest, f, indent=1)
        f.write('\n')

if __name__ == '__main__':
    main()
