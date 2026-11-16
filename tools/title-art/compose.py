#!/usr/bin/env python3
"""Compose Last Light's title-screen plates from the passes tools/title-art/capture.mjs renders.

    python3 tools/title-art/compose.py <capture-dir> <out-dir>

For each mood (summer, search, after) it reads <mood>-beauty.png, -key.png (sky replaced by a green key), -depth.png and
-ghost-beauty.png (one bike not drawn, its shadow kept), all 3840x2160, and writes:
  plate-<mood>.webp   1920x1080 RGB: the foreground repainted for the title (sky pixels are irrelevant: the live sky goes there)
  aux-<mood>.webp     960x540 RGBA: R foreground alpha, G depth (1 near .. 0 far), B glow of the warm lights, A alpha blurred
  patch-<mood>.webp   the ghost bike's region, graded the same way, and patch-<mood>.json with its rectangle (0..1 uv)
The grade is the title's art direction, not the game's renderer: deep cool silhouettes under the sky, the warm windows and
lamps kept as small pockets of light, the ground falling into shadow toward the menu. Haze, sky, halation and the analog
treatment are added live by dist/title-art.js.
"""
import sys, json, os
import numpy as np
from PIL import Image, ImageFilter

SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
W, H = 1920, 1080

GRADE = {  # exposure, saturation, light gain, shadow tint (rgb multiplier), ground darkening
    'summer': dict(exp=.50, sat=.78, light=1.05, tint=(.86, .86, 1.0), ground=.80),
    'search': dict(exp=.36, sat=.62, light=.95, tint=(.80, .84, 1.0), ground=.86),
    'after':  dict(exp=.26, sat=.42, light=.70, tint=(.86, .84, .96), ground=.90),
}

def load(path, size=None):
    im = Image.open(path).convert('RGB')
    if size: im = im.resize(size, Image.LANCZOS)
    return np.asarray(im).astype(np.float32) / 255.0

def _box(a, r, axis):
    """Box filter of radius r along one axis (edge-clamped), via a cumulative sum."""
    if r < 1: return a
    pad = [(0, 0)] * a.ndim; pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis, dtype=np.float64)
    n = a.shape[axis]
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)

def blur(a, sigma):
    """Gaussian-like blur (three box passes per axis) of a float image, HxW or HxWxC."""
    r = max(1, int(round(sigma * 1.0)))
    for _ in range(3):
        a = _box(_box(a, r, 0), r, 1)
    return a

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def foreground_alpha(key):
    """Sky = the key colour (tone-mapped green); everything else is foreground. Measured at 4K, averaged down."""
    k = np.median(key[20:200, -400:-40].reshape(-1, 3), 0)
    d = np.sqrt(((key - k) ** 2).sum(-1))
    a = np.clip((d - .07) / .22, 0, 1)
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((W, H), Image.BOX), np.float32) / 255
    # fireflies and dust drawn over the sky are not foreground: drop isolated specks above the horizon
    frac = blur((a > .5).astype(np.float32), 5)
    y = np.linspace(0, 1, H)[:, None]
    a = np.where((frac < .35) & (y < .60), 0, a)
    return a

def grade(F, alpha, depth, mood):
    g = GRADE[mood]
    lin = F ** 2.2
    luma = (lin * [.2126, .7152, .0722]).sum(-1)
    srgbl = luma ** (1 / 2.2)
    warm = F[..., 0] > F[..., 2] * 1.15
    lights = smooth(.50, .78, srgbl) * warm
    out = lin * g['exp']
    l2 = (out * [.2126, .7152, .0722]).sum(-1, keepdims=True)
    out = l2 + (out - l2) * g['sat']
    # darks lean cold violet, mids keep their material colour
    shadow = 1 - smooth(.0, .12, l2[..., 0])
    out *= 1 + (np.array(g['tint']) - 1) * shadow[..., None]
    # a contrast curve: the shadows sink, the night has shape
    out = out ** 1.12
    # the ground falls into shadow toward the bottom of the frame (the menu sits there)
    y = np.linspace(0, 1, H)[:, None]
    ground = 1 - g['ground'] * smooth(.62, 1.0, y)
    out *= ground[..., None]
    # the far street (houses, trees beyond the cul-de-sac) becomes silhouette: the live haze will lift it to the sky
    out *= (.30 + .70 * smooth(.30, .56, depth))[..., None]
    # the near grass and bikes lose a little more light than the street beyond them
    out *= (1 - .35 * smooth(.62, .9, depth))[..., None]
    # warm windows, porches and lamps: small pockets of light, kept
    keep = lights[..., None]
    out = out * (1 - keep) + lin * g['light'] * keep
    # large, slow mottling: no surface reads as clean CG
    rng = np.random.default_rng(2011)
    m = blur(rng.random((H // 8, W // 8)).astype(np.float32), 3)
    m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC), np.float32) / 255
    out *= (.9 + .2 * m)[..., None]
    return np.clip(out, 0, 1) ** (1 / 2.2), lights

def to_img(a, mode='RGB'):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8), mode)

for mood in ('summer', 'search', 'after'):
    p = lambda n: os.path.join(SRC, f'{mood}-{n}.png')
    beauty = load(p('beauty'), (W, H))
    key = load(p('key'))
    depth = load(p('depth'), (W, H))[..., 0]
    alpha = foreground_alpha(key)
    # decontaminate the leaf and wire edges: remove the rendered sky that is mixed into them
    a3 = alpha[..., None]
    sky_est = blur(beauty * (1 - a3), 18) / np.maximum(blur(1 - alpha, 18)[..., None], 1e-3)
    F = np.where(a3 > .02, (beauty - (1 - a3) * sky_est) / np.maximum(a3, .02), .02)
    F = np.clip(F, 0, 1)
    plate, lights = grade(F, alpha, depth, mood)
    to_img(plate).save(os.path.join(OUT, f'plate-{mood}.webp'), quality=88, method=6)
    # glow from the warm lights (a tight core and a wide bloom), for live halation
    # (only lights that are part of the foreground: fireflies and dust over the sky would glow there as stars)
    lumL = (F ** 2.2 * [.2126, .7152, .0722]).sum(-1) * lights * (alpha > .5)
    glow = blur(lumL, 6) * 1.6 + blur(lumL, 22) * 2.4 + blur(lumL, 60) * 2.0
    glow = np.clip(glow / max(glow.max(), 1e-3) * 1.3, 0, 1) ** .8
    ablur = blur(alpha, 26)
    aux = np.stack([alpha, depth, glow, ablur], -1)
    aux = np.asarray(to_img(aux, 'RGBA').resize((960, 540), Image.LANCZOS))
    Image.fromarray(aux, 'RGBA').save(os.path.join(OUT, f'aux-{mood}.webp'), lossless=True, method=6)
    # the ghost: the same frame with one bike gone and its shadow left behind; only the region that differs is kept
    gb = load(p('ghost-beauty'), (W, H))
    gF = np.where(a3 > .02, (gb - (1 - a3) * sky_est) / np.maximum(a3, .02), .02)
    gplate, _ = grade(np.clip(gF, 0, 1), alpha, depth, mood)
    yy = np.linspace(0, 1, H)[:, None]
    diff = (blur(np.abs(gplate - plate).sum(-1), 2) > .05) & (yy > .62)
    ys, xs = np.nonzero(diff)
    if len(xs):
        m = 24
        x0, x1, y0, y1 = max(0, xs.min() - m), min(W, xs.max() + m), max(0, ys.min() - m), min(H, ys.max() + m)
        to_img(gplate[y0:y1, x0:x1]).save(os.path.join(OUT, f'patch-{mood}.webp'), quality=90, method=6)
        json.dump({'x': x0 / W, 'y': y0 / H, 'w': (x1 - x0) / W, 'h': (y1 - y0) / H}, open(os.path.join(OUT, f'patch-{mood}.json'), 'w'))
    print(mood, 'plate', os.path.getsize(os.path.join(OUT, f'plate-{mood}.webp')), 'aux', os.path.getsize(os.path.join(OUT, f'aux-{mood}.webp')), 'patch', (x0, y0, x1, y1) if len(xs) else None)

# ---- the runtime module: every plate, aux map and patch as a data URI (the offline package embeds .js files) ----
if len(sys.argv) > 3:
    import base64
    def uri(path, mime='image/webp'):
        return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()
    lines = ['// Title-screen artwork for Last Light (generated by tools/title-art/compose.py from passes rendered by',
             '// tools/title-art/capture.mjs: the game\'s own Oak Hollow geometry, staged and repainted for the title).',
             '// Not an in-game screenshot: a title-only composition. See docs/MAIN_MENU_HORROR_REVISION.md.',
             'export const TITLE_ART={']
    for mood in ('summer', 'search', 'after'):
        rect = json.load(open(os.path.join(OUT, f'patch-{mood}.json')))
        lines.append(f" {mood}:{{plate:'{uri(os.path.join(OUT, f'plate-{mood}.webp'))}',")
        lines.append(f"  aux:'{uri(os.path.join(OUT, f'aux-{mood}.webp'))}',")
        lines.append(f"  patch:'{uri(os.path.join(OUT, f'patch-{mood}.webp'))}',rect:{json.dumps(rect)}}},")
    lines.append('};')
    open(sys.argv[3], 'w').write('\n'.join(lines) + '\n')
    print('module', sys.argv[3], os.path.getsize(sys.argv[3]))
