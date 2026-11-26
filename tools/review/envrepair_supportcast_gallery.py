"""Review gallery for ?envrepair and ?supportcast: one page with every before/after pair (a drag-to-compare slider), the
Blender renders, the clips and the in-game recordings, labelled by what they are (in game under software WebGL, or an
offline Blender render; the placeholder Jamie). Reads docs/qa/envrepair-supportcast/ (captures.json, perf.json,
tests/report.json and the media).

    python3 tools/review/envrepair_supportcast_gallery.py repo
        -> docs/qa/envrepair-supportcast/index.html, pointing at the full-size files beside it (for the repo and the ZIP)
    python3 tools/review/envrepair_supportcast_gallery.py publish <out_dir>
        -> <out_dir>/index.html plus downscaled copies of every image and film (for a hosted page under its size limits)
"""
import html, json, os, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
QA = os.path.join(ROOT, 'docs', 'qa', 'envrepair-supportcast')


def load(p, default):
    try:
        with open(os.path.join(QA, p)) as f:
            return json.load(f)
    except Exception:
        return default


CAP = load('captures.json', {'pairs': [], 'videos': []})
PERF = load('perf.json', {})
SUITE = load('tests/report.json', {})
E = html.escape

MOTHER_RENDERS = [
    ('full-front', 'Front'), ('full-three-quarter', 'Three-quarter'), ('full-side', 'Side'), ('full-back', 'Back'),
    ('apose-front', 'A-pose (rig rest)'), ('clothing', 'Clothing'), ('hands', 'Hands'), ('ponytail', 'Ponytail'),
    ('posture-wait', 'Waiting posture'), ('walk', 'Walk (mid-stride)'), ('wave', 'The wave'),
    ('portrait-neutral', 'Neutral'), ('portrait-smile', 'Warm smile'), ('portrait-calling', 'Calling (silent)'),
    ('portrait-attentive', 'Attentive'), ('portrait-expectant', 'Mild expectation'), ('portrait-blink', 'Blink'),
    ('portrait-profile', 'Profile'),
]
KID_RENDERS = [('full-front', 'Front'), ('full-three-quarter', 'Three-quarter'), ('full-back', 'Back'),
               ('portrait-neutral', 'Portrait'), ('dribble', 'Dribble'), ('shoot', 'Shot, release'),
               ('shoot-follow', 'Follow-through'), ('catch', 'Catch'), ('hold', 'Holding, watching the boys')]
LINEUP = [('front', 'Front'), ('three-quarter', 'Three-quarter'), ('heads', 'Heads')]
MOTHER_CLIPS = [('idle', '1 · Idle'), ('door', '2 · At the door (anticipation)'), ('walk', '3 · Walk'), ('turn', '4 · Turn to the street'),
                ('call-wave', '5 · Call and wave (silent)'), ('wait', '6 · Waiting'), ('return', '7 · Back inside'), ('face', 'Face: blink, smile, call')]
KID_CLIPS = [('dribble', 'Dribble'), ('shoot', 'Shot'), ('catch', 'Catch')]


class Media:
    """file paths for the page; in publish mode, makes downscaled copies"""

    def __init__(self, mode, out):
        self.mode, self.out = mode, out

    def _run(self, args):
        subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def image(self, rel, width=1280):
        src = os.path.join(QA, rel)
        if not os.path.exists(src):
            return None
        if self.mode == 'repo':
            return rel
        name = os.path.splitext(rel)[0].replace('/', '__') + '.jpg'
        dst = os.path.join(self.out, 'm', name)
        if not os.path.exists(dst):
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            from PIL import Image
            im = Image.open(src).convert('RGB')
            if im.width > width:
                im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
            im.save(dst, quality=84, optimize=True, progressive=True)
        return 'm/' + name

    def video(self, rel, width=960, crf=28):
        """(video path, poster path)"""
        src = os.path.join(QA, rel)
        if not os.path.exists(src):
            return None, None
        base = os.path.splitext(rel)[0].replace('/', '__')
        if self.mode == 'repo':
            poster = os.path.join(QA, 'video', 'posters', os.path.basename(base) + '.jpg')
            if not os.path.exists(poster):
                os.makedirs(os.path.dirname(poster), exist_ok=True)
                self._run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0.4', '-i', src, '-frames:v', '1', '-q:v', '4', poster])
            return rel, os.path.relpath(poster, QA)
        dst = os.path.join(self.out, 'm', base + '.mp4')
        poster = os.path.join(self.out, 'm', base + '.jpg')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(dst):
            self._run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-vf', f"scale='min({width},iw)':-2", '-c:v', 'libx264',
                       '-pix_fmt', 'yuv420p', '-crf', str(crf), '-preset', 'medium', '-movflags', '+faststart', '-an', dst])
        if not os.path.exists(poster):
            self._run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0.4', '-i', dst, '-frames:v', '1', '-q:v', '5', poster])
        return 'm/' + base + '.mp4', 'm/' + base + '.jpg'


CSS = r"""
:root{
 /* layout: a review sheet. A sticky section bar, then each subject as a band of evidence cards on a quiet ground */
 --bg:#eef0f3;--panel:#ffffff;--ink:#141a22;--muted:#5b6574;--line:#d5dae1;--accent:#b8621b;--accent-ink:#ffffff;
 --chip-game:#1f5e8c;--chip-blender:#6a4c93;--chip-warn:#8a5a00;--chip-bg-game:#e3eef7;--chip-bg-blender:#eee8f6;--chip-bg-warn:#fbf0d9;
 --pass:#1d7a46;--fail:#b3261e;
 --display:'Archivo',system-ui,sans-serif;--body:'Inter',system-ui,sans-serif;--mono:'JetBrains Mono',ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#10141a;--panel:#171c24;--ink:#e7eaef;--muted:#9aa4b2;--line:#2a313c;--accent:#f0a23e;--accent-ink:#1a1206;
 --chip-game:#9cc8ec;--chip-blender:#c9b3ea;--chip-warn:#f2c86b;--chip-bg-game:#1b2c3b;--chip-bg-blender:#2a2238;--chip-bg-warn:#3a2d12;--pass:#6fd39b;--fail:#ff8a80;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#10141a;--panel:#171c24;--ink:#e7eaef;--muted:#9aa4b2;--line:#2a313c;--accent:#f0a23e;--accent-ink:#1a1206;
 --chip-game:#9cc8ec;--chip-blender:#c9b3ea;--chip-warn:#f2c86b;--chip-bg-game:#1b2c3b;--chip-bg-blender:#2a2238;--chip-bg-warn:#3a2d12;--pass:#6fd39b;--fail:#ff8a80;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.55;margin:0}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
header.top{padding-block:28px 8px}
h1{font-family:var(--display);font-weight:800;font-size:clamp(28px,4vw,42px);line-height:1.08;margin:0 0 8px;text-wrap:balance;letter-spacing:-.01em}
h2{font-family:var(--display);font-weight:700;font-size:26px;margin:0 0 6px;text-wrap:balance}
h3{font-family:var(--display);font-weight:700;font-size:18px;margin:26px 0 10px}
p{max-width:72ch;margin:0 0 10px}
.lede{color:var(--muted);font-size:16px}
.meta{font-family:var(--mono);font-size:12.5px;color:var(--muted);display:flex;flex-wrap:wrap;gap:6px 18px;margin:12px 0 4px;min-width:0}
.meta span{min-width:0;overflow-wrap:anywhere}
.meta b{color:var(--ink);font-weight:600}
nav.bar{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:var(--bg);border-bottom:1px solid var(--line)}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--bg)}
nav.bar .wrap{display:flex;gap:4px;overflow-x:auto;padding-block:8px}
nav.bar a{font-family:var(--mono);font-size:12.5px;text-decoration:none;color:var(--muted);padding:6px 10px;border-radius:6px;white-space:nowrap}
nav.bar a:hover,nav.bar a:focus-visible{color:var(--ink);background:var(--panel);outline:none}
section{padding-block:30px 10px;border-bottom:1px solid var(--line)}
.notice{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:14px 0;max-width:100%}
.notice p{margin:0 0 6px}.notice p:last-child{margin:0}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}
.chip{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px;border-radius:4px;white-space:nowrap}
.chip.game{color:var(--chip-game);background:var(--chip-bg-game)}
.chip.blender{color:var(--chip-blender);background:var(--chip-bg-blender)}
.chip.warn{color:var(--chip-warn);background:var(--chip-bg-warn)}
.grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr))}
.grid.small{grid-template-columns:repeat(auto-fill,minmax(min(100%,210px),1fr))}
.grid.wide{grid-template-columns:repeat(auto-fill,minmax(min(100%,560px),1fr))}
.grid.one{grid-template-columns:1fr}
figure{margin:0;min-width:0}
figure img,figure video{display:block;width:100%;height:auto;max-width:100%;border-radius:6px;background:#000}
figcaption{font-size:13.5px;color:var(--muted);margin-top:6px}
figcaption b{color:var(--ink);font-weight:600}
.cmp{position:relative;border-radius:6px;overflow:hidden;background:#000;touch-action:pan-y}
.cmp img{border-radius:0}
.cmp .over{position:absolute;inset:0}
.cmp .over img{width:100%;height:100%;object-fit:cover;clip-path:inset(0 calc(100% - var(--x,50%)) 0 0)}
.cmp .rule{position:absolute;top:0;bottom:0;left:var(--x,50%);width:2px;margin-left:-1px;background:var(--accent);pointer-events:none}
.cmp .tag{position:absolute;top:8px;font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;padding:3px 7px;border-radius:4px;background:rgba(0,0,0,.62);color:#fff;pointer-events:none}
.cmp .tag.l{left:8px}.cmp .tag.r{right:8px}
.cmp input[type=range]{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}
.cmp input[type=range]:focus-visible + .rule{box-shadow:0 0 0 3px var(--accent)}
.cmp.detail{margin-top:8px}
.pairhead{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:4px 12px;margin-top:8px}
.pairhead b{font-family:var(--mono);font-size:12.5px}
.toggle{font-family:var(--mono);font-size:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:6px;padding:4px 9px;cursor:pointer}
.toggle:hover{border-color:var(--accent)}.toggle:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.tablewrap{overflow-x:auto;max-width:100%;margin:10px 0}
table{border-collapse:collapse;font-size:13.5px;min-width:520px}
th,td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-family:var(--mono);font-size:11.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);font-weight:600}
td.n{font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.ok{color:var(--pass);font-weight:600}.bad{color:var(--fail);font-weight:600}
.cam{font-family:var(--mono);font-size:11.5px;color:var(--muted);word-break:break-all}
footer{padding-block:24px 40px;color:var(--muted);font-size:13px}
@media (prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
"""

JS = r"""
for(const c of document.querySelectorAll('.cmp')){const r=c.querySelector('input');const set=v=>{c.style.setProperty('--x',v+'%');};r.addEventListener('input',()=>set(r.value));set(r.value);}
for(const b of document.querySelectorAll('.toggle')){b.addEventListener('click',()=>{const c=document.getElementById(b.dataset.for);const r=c.querySelector('input');r.value=(+r.value>50)?0:100;c.style.setProperty('--x',r.value+'%');b.textContent=+r.value>50?'Show original':'Show '+b.dataset.after;});}
"""


def chips(*kinds):
    labels = {'game': 'In game · software WebGL', 'blender': 'Blender render · not the game', 'placeholder': 'Jamie: placeholder',
              'qa': 'QA camera', 'ride': 'Riding camera'}
    cls = {'game': 'game', 'blender': 'blender', 'placeholder': 'warn', 'qa': 'game', 'ride': 'game'}
    return '<div class="chips">' + ''.join(f'<span class="chip {cls[k]}">{labels[k]}</span>' for k in kinds) + '</div>'


def detail_crop(after_abs, before_abs):
    """the region where the two images of a pair differ (pixels changed by more than 30/765), padded and widened to 16:9;
    None when the change already fills a third of the frame, spans most of its width, or there is none"""
    import numpy as np
    from PIL import Image
    a, b = Image.open(after_abs).convert('RGB'), Image.open(before_abs).convert('RGB')
    d = np.abs(np.asarray(a, np.int16) - np.asarray(b, np.int16)).sum(2) > 30
    # ignore isolated speckle: keep rows/columns with several changed pixels
    ys, xs = np.where(d)
    if len(xs) < 200:
        return None
    x0, x1 = np.percentile(xs, [2, 98]).astype(int)
    y0, y1 = np.percentile(ys, [2, 98]).astype(int)
    W, H = a.size
    w, h = (x1 - x0) * 1.3 + 40, (y1 - y0) * 1.3 + 40
    if w * h > W * H / 3:
        return None
    w, h = max(w, h * 16 / 9, 400), max(h, w * 9 / 16, 225)
    if w > W / 1.6:  # (a detail must enlarge the frame at least 1.6 times, or it says nothing the full pair does not)
        return None
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    bx0 = int(min(max(cx - w / 2, 0), W - w)); by0 = int(min(max(cy - h / 2, 0), H - h))
    return (bx0, by0, int(bx0 + w), int(by0 + h))


def crop_pair(M, name, after_abs, before_abs, box):
    from PIL import Image
    out = []
    for tag, src in (('after', after_abs), ('before', before_abs)):
        im = Image.open(src).convert('RGB').crop(box)
        im = im.resize((1280, round(1280 * im.height / im.width)), Image.NEAREST if im.width < 640 else Image.LANCZOS)
        rel = f'browser/detail/{name}--{tag}.jpg'
        dst = os.path.join(QA, rel) if M.mode == 'repo' else os.path.join(M.out, 'm', f'detail__{name}--{tag}.jpg')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im.save(dst, quality=88)
        out.append(rel if M.mode == 'repo' else 'm/' + os.path.basename(dst))
    return out


def pair_card(M, p):
    files = p['files']
    after = next((f for f in files if '--repaired' in f or '--authored' in f), None)
    before = next((f for f in files if '--original' in f), None)
    if not after or not before:
        return ''
    rel = lambda f: os.path.relpath(os.path.join(ROOT, f), QA)
    a, b = M.image(rel(after)), M.image(rel(before))
    word = 'authored' if '--authored' in after else 'repaired'
    cid = 'c-' + p['name']
    kinds = ['game', 'ride' if ('riding' in p['what'] or 'ride' in p['name']) else 'qa']
    if p['name'].startswith('S0') and 'Jamie' in p['what']:
        kinds.append('placeholder')
    detail = ''
    box = detail_crop(os.path.join(ROOT, after), os.path.join(ROOT, before)) if p['name'].startswith('E') else None
    if box:
        da, db = crop_pair(M, p['name'], os.path.join(ROOT, after), os.path.join(ROOT, before), box)
        did = cid + '-detail'
        detail = f'''<div class="cmp detail" id="{E(did)}"><img src="{E(db)}" alt="{E(p['name'])} detail: original" loading="lazy">
  <div class="over"><img src="{E(da)}" alt="{E(p['name'])} detail: {word}" loading="lazy"></div>
  <input type="range" min="0" max="100" value="50" aria-label="Compare the enlarged detail: {E(p['name'])}"><div class="rule"></div>
  <span class="tag l">{word} · detail ×{1280 / (box[2] - box[0]):.1f}</span><span class="tag r">original</span></div>'''
    return f'''<figure>
 <div class="cmp" id="{E(cid)}"><img src="{E(b)}" alt="{E(p['name'])}: original" loading="lazy" width="1600" height="900">
  <div class="over"><img src="{E(a)}" alt="{E(p['name'])}: {word}" loading="lazy"></div>
  <input type="range" min="0" max="100" value="50" aria-label="Compare original and {word}: {E(p['name'])}"><div class="rule"></div>
  <span class="tag l">{word}</span><span class="tag r">original</span></div>
 <div class="pairhead"><b>{E(p['name'])}</b><button class="toggle" type="button" data-for="{E(cid)}" data-after="{word}">Show original</button></div>
 {detail}
 {chips(*kinds)}
 <figcaption>{E(p['what'])} <span class="cam">· key {E(p.get('key', ''))} · clock {E(p.get('clock') or '')} · draws {p['after']['calls']}/{p['before']['calls']}, triangles {p['after']['triangles']:,}/{p['before']['triangles']:,} · same camera: {'yes' if p.get('sameCamera') else 'NO'}</span></figcaption>
</figure>'''


def render_card(M, rel, title, kinds=('blender',)):
    src = M.image(rel, width=900)
    if not src:
        return ''
    return f'<figure><img src="{E(src)}" alt="{E(title)}" loading="lazy">{chips(*kinds)}<figcaption><b>{E(title)}</b></figcaption></figure>'


def video_card(M, rel, title, what, kinds):
    v, poster = M.video(rel)
    if not v:
        return ''
    return f'''<figure><video controls muted playsinline preload="none" poster="{E(poster)}" src="{E(v)}"></video>{chips(*kinds)}
 <figcaption><b>{E(title)}</b> {E(what)}</figcaption></figure>'''


def suite_table():
    s = SUITE.get('summary')
    if not s:
        return '<p>The suite has not been run.</p>'
    rows = ''.join(f'<tr><td>{E(c["part"])}</td><td class="ok">pass</td><td>{E(c["name"])}</td></tr>' for c in SUITE.get('checks', []))
    rows += ''.join(f'<tr><td>{E(c["part"])}</td><td class="bad">FAIL</td><td>{E(c["name"])}</td></tr>' for c in SUITE.get('failures', []))
    return (f'<p><b>{s["passed"]} passed, {s["failed"]} failed</b> · <span class="cam">{E(SUITE.get("renderer", ""))} · commit {E(str(SUITE.get("commit", "")))}</span></p>'
            f'<div class="tablewrap"><table><thead><tr><th>Part</th><th>Result</th><th>Check</th></tr></thead><tbody>{rows}</tbody></table></div>')


def perf_table():
    if not PERF.get('runs'):
        return '<p>Not measured.</p>'
    six, eight = PERF['runs']['six'], PERF['runs']['eight']
    rows = ''
    for a, b in zip(six['cams'], eight['cams']):
        rows += (f'<tr><td>{E(a["cam"])}</td><td class="n">{a["calls"]}</td><td class="n">{b["calls"]}</td><td class="n">{a["triangles"]:,}</td>'
                 f'<td class="n">{b["triangles"]:,}</td><td class="n">{a["ms"]}</td><td class="n">{b["ms"]}</td><td class="n">{b.get("scUpdateMs") if b.get("scUpdateMs") is not None else "—"}</td></tr>')
    cast = (eight.get('sc') or {}).get('cast', {})
    crow = ''.join(f'<tr><td>{E(k)}</td><td class="n">{c["tris"]:,}</td><td class="n">{c["bones"]}</td><td class="n">{c["draws"]}</td><td class="n">{c["textures"]}</td>'
                   f'<td class="n">{c["morphs"]}</td><td class="n">{c["clips"]}</td><td class="n">{c["bytes"] / 1e6:.2f} MB</td><td class="n">{c["readMs"]} + {c["parseMs"]}</td></tr>' for k, c in cast.items())
    return f'''<p>Software WebGL (Chromium + ANGLE SwiftShader), <b>not a GPU</b>: frame times show relative CPU-side cost only and are noisy
(median of three renders). Six = the six Prologue benchmarks; eight = with <code>?envrepair&amp;supportcast</code>. Load: {six["loadMs"] / 1000:.1f} s / {eight["loadMs"] / 1000:.1f} s.</p>
<div class="tablewrap"><table><thead><tr><th>Camera</th><th>Draws six</th><th>Draws eight</th><th>Triangles six</th><th>Triangles eight</th><th>ms six</th><th>ms eight</th><th>Cast update ms</th></tr></thead><tbody>{rows}</tbody></table></div>
<div class="tablewrap"><table><thead><tr><th>Character</th><th>Triangles</th><th>Bones</th><th>Draws</th><th>Textures</th><th>Face keys</th><th>Clips</th><th>GLB</th><th>Read + parse ms</th></tr></thead><tbody>{crow}</tbody></table></div>'''


def page(M):
    pairs = {p['name']: p for p in CAP.get('pairs', [])}
    vids = {v['name']: v for v in CAP.get('videos', [])}
    env = [pairs[n] for n in sorted(pairs) if n.startswith('E')]
    cast = [pairs[n] for n in sorted(pairs) if n.startswith('S')]
    B = 'blender/'

    def vcard(name, title, kinds):
        v = vids.get(name)
        return video_card(M, os.path.relpath(os.path.join(ROOT, v['file']), QA), title, v.get('what', ''), kinds) if v else ''
    out = []
    out.append(f'''<title>Prologue Repair Review</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;600&display=swap">
<style>{CSS}</style>
<header class="top"><div class="wrap">
<h1>Prologue environment repairs &amp; supporting cast</h1>
<p class="lede">Review evidence for <code>?envrepair</code> and <code>?supportcast</code> on branch <code>claude/prologue-environment-repair-supporting-cast</code>. Nothing here is approved: every decision is open in the approval register (A-78 to A-86), and A-22 stays open.</p>
<div class="meta"><span>build <b>?bikes&amp;houses&amp;vegetation&amp;pavement&amp;streetprops&amp;details&amp;envrepair&amp;supportcast</b></span><span>captures at <b>{E(str(CAP.get("commit", "")))}</b></span><span>keys <b>'</b> repairs · <b>;</b> cast</span></div>
<div class="notice"><p><b>How to read this page.</b> In-game images and films are the shipped renderer under <b>software WebGL</b> (Chromium + SwiftShader, not a GPU) at 1600 × 900. A pair is one camera and one frame; drag across it, or use its button, to compare. Only the benchmark's own key changes between the two images.</p>
<p>Items marked <b>Blender render</b> are offline Cycles renders of the editable .blend files, not the game. <b>Jamie</b> in every in-game view is the existing procedural Jamie, a placeholder, not Astra's Phase 1B character.</p></div>
</div></header>
<nav class="bar" aria-label="Sections"><div class="wrap"><a href="#environment">Environment</a><a href="#mother">Jamie's mother</a><a href="#kid">Hoop kid</a><a href="#ride">The ride</a><a href="#audit">Audit</a><a href="#tests">Tests</a><a href="#cost">Cost</a></div></nav>
<main>''')
    out.append('<section id="environment"><div class="wrap"><h2>Environment repairs</h2><p>Chain link that keeps its coverage at a distance, Briarwood creek\'s last primitive vegetation, the play equipment and toys, and contact shadows. Key <b>\'</b> swaps repaired and original.</p>')
    out.append('<div class="grid wide">' + ''.join(pair_card(M, p) for p in env) + '</div>')
    out.append('<h3>Chain link in motion</h3><div class="grid wide">' + vcard('V01-chain-link-in-motion--original', 'Before', ['game', 'qa']) + vcard('V01-chain-link-in-motion--repaired', 'After', ['game', 'qa']) + '</div></div></section>')
    out.append('<section id="mother"><div class="wrap"><h2>Jamie\'s mother</h2><p>An original procedural character proposed for A-22 (still open): late thirties, 1.64 m, the Prologue\'s outfit, a face of her own. The game\'s controller (<code>friends.js updateMom</code>) drives when and where she moves; nothing about the scene\'s timing, triggers, positions or lines changed.</p>')
    out.append('<h3>In game</h3><div class="grid wide">' + ''.join(pair_card(M, p) for p in cast if 'mother' in p['name']) + vcard('V02-jamies-mother-complete-scene', 'The complete scene', ['game', 'qa', 'placeholder']) + '</div>')
    out.append('<h3>Model</h3><div class="grid small">' + ''.join(render_card(M, f'{B}jamie-mother-{n}--BLENDER-RENDER.png', t) for n, t in MOTHER_RENDERS) + '</div>')
    out.append('<h3>Beside Jamie (Phase 1A design model, read only, same scale)</h3><p>Jamie\'s 1A model is a Sketchfab-based design pass with its own shading; it is neither the game\'s current Jamie nor the Phase 1B character. Shown for scale and family resemblance only.</p><div class="grid">' + ''.join(render_card(M, f'{B}jamie-mother-lineup-{n}-with-jamie-phase1a--BLENDER-RENDER.png', t) for n, t in LINEUP) + '</div>')
    out.append('<h3>Motion clips</h3><div class="grid small">' + ''.join(video_card(M, f'video/jamie-mother-{n}--BLENDER-RENDER.mp4', t, '', ['blender']) for n, t in MOTHER_CLIPS) + '</div></div></section>')
    out.append('<section id="kid"><div class="wrap"><h2>The driveway basketball kid</h2><p>The anonymous neighbour of <code>CAST.kid</code>, kept where and as he was. <code>ambient.js updateKid</code> still drives the dribble, the shot, the ball and his look at the boys; the clips follow its phase.</p>')
    out.append('<h3>In game</h3><div class="grid wide">' + ''.join(pair_card(M, p) for p in cast if 'kid' in p['name']) + vcard('V03-hoop-kid-driveway', 'At his driveway', ['game', 'qa']) + vcard('V03b-hoop-kid-riding-past', 'Riding past him', ['game', 'ride', 'placeholder']) + '</div>')
    out.append('<h3>Model and clips</h3><div class="grid small">' + ''.join(render_card(M, f'{B}hoop-kid-{n}--BLENDER-RENDER.png', t) for n, t in KID_RENDERS) + ''.join(video_card(M, f'video/hoop-kid-{n}--BLENDER-RENDER.mp4', t, '', ['blender']) for n, t in KID_CLIPS) + '</div></div></section>')
    out.append('<section id="ride"><div class="wrap"><h2>The ride</h2><div class="grid wide">' + vcard('V04-combined-prologue-ride', 'From the hoop kid\'s street to Jamie\'s house', ['game', 'ride', 'placeholder']) + '</div></div></section>')
    sheets = sorted(f for f in os.listdir(os.path.join(QA, 'audit')) if f.startswith('audit-sheet-')) if os.path.isdir(os.path.join(QA, 'audit')) else []
    if sheets:
        out.append('<section id="audit"><div class="wrap"><h2>Consistency audit</h2><p>The riding camera every 60 m from 0 to 1,140 m, '
                   'looking to both sides, all eight flags, at the game\'s own time of day for each distance (labels: distance in metres, L or R). '
                   'Findings are in the report\'s §7: the parked cars stand on their tyres (0.5–0.9 cm, measured; they only look lifted at dusk); '
                   'two small pre-existing items (the lawn\'s cut edge at driveway aprons, the flat curb inlets); the authored supporting cast beside '
                   'the procedural boys (expected until Phase 1B); a DEV-label bug, fixed.</p><div class="grid one">'
                   + ''.join(f'<figure><a href="{E(M.image("audit/" + f, width=1920))}" target="_blank" rel="noopener"><img src="{E(M.image("audit/" + f, width=1920))}" alt="Audit contact sheet {i + 1}" loading="lazy"></a>{chips("game", "ride")}<figcaption><b>Sheet {i + 1}</b> (opens full size)</figcaption></figure>' for i, f in enumerate(sheets))
                   + '</div></div></section>')
    out.append(f'<section id="tests"><div class="wrap"><h2>Tests</h2>{suite_table()}</div></section>')
    out.append(f'<section id="cost"><div class="wrap"><h2>Cost</h2>{perf_table()}</div></section>')
    out.append('</main><footer><div class="wrap">Generated by <code>tools/review/envrepair_supportcast_gallery.py</code> from <code>docs/qa/envrepair-supportcast/</code>. The full report: <code>docs/ENVREPAIR_SUPPORTCAST_REPORT.md</code>.</div></footer>')
    out.append(f'<script>{JS}</script>')
    return '\n'.join(out)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else 'repo'
    if mode == 'repo':
        M = Media('repo', QA)
        body = page(M)
        with open(os.path.join(QA, 'index.html'), 'w') as f:
            head, rest = body.split('<header class="top">', 1)
            f.write('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                    + head + '</head>\n<body>\n<header class="top">' + rest + '\n</body></html>\n')
        print('wrote', os.path.join(QA, 'index.html'))
    else:
        out = sys.argv[2]
        os.makedirs(out, exist_ok=True)
        M = Media('publish', out)
        with open(os.path.join(out, 'index.html'), 'w') as f:
            f.write(page(M) + '\n')
        print('wrote', os.path.join(out, 'index.html'))


if __name__ == '__main__':
    main()
