#!/usr/bin/env python3
"""Build the pavement review gallery (one HTML page + the captures beside it) from the browser suite's report.

usage: python3 tools/materials/roads/build_review_gallery.py <report.json> <outDir> [--commit SHA] [--title-suffix text]
Writes <outDir>/index.html and copies every capture to <outDir>/img/. The page works from disk (relative paths, no
network) and is the same page that is published as the review artifact.
"""
import argparse, html, json, os, shutil

ap = argparse.ArgumentParser()
ap.add_argument('report'); ap.add_argument('out'); ap.add_argument('--commit', default=None)
ap.add_argument('--standalone', action='store_true', help='wrap in a full HTML document (for opening from disk)')
a = ap.parse_args()
R = json.load(open(a.report))
os.makedirs(os.path.join(a.out, 'img'), exist_ok=True)
commit = a.commit or R.get('commit') or '?'
esc = html.escape

def img(path):
    if not path:
        return None
    name = os.path.basename(path)
    shutil.copyfile(path, os.path.join(a.out, 'img', name))
    return 'img/' + name

cards = []
for i, p in enumerate(R.get('pairs', [])):
    f = p.get('files') or [None, None]
    rec, org = img(f[0]), img(f[1])
    if not rec or not org:
        continue
    flags = p.get('flags', 'qa&pavement')
    cam = p.get('camera', {})
    clock = (p.get('clock') or '').strip()
    rc, oc = p.get('reconstructed', {}), p.get('original', {})
    num = p['name'].split('-')[0]
    title = p.get('what') or p['name']
    cards.append(f'''
<article class="pair" id="{esc(num.lower())}">
 <header><span class="code">{esc(num)}</span><h2>{esc(title[0].upper() + title[1:])}</h2></header>
 <div class="compare" style="--x:50%">
  <img src="{org}" alt="{esc(title)}: original pavement" loading="lazy" width="1600" height="900">
  <img class="top" src="{rec}" alt="{esc(title)}: reconstructed pavement" loading="lazy" width="1600" height="900">
  <span class="tag l">Reconstructed</span><span class="tag r">Original</span>
  <span class="handle" aria-hidden="true"></span>
  <input type="range" min="0" max="100" value="50" aria-label="Reveal reconstructed or original: {esc(num)}" id="slider-{i}">
 </div>
 <dl>
  <div><dt>Capture</dt><dd>Game-renderer capture · gameplay riding camera (QA placement) · software WebGL (SwiftShader), not a GPU</dd></div>
  <div><dt>Scene</dt><dd>{esc(clock or 'Prologue')} · flags <code>?{esc(flags)}</code> · same camera and frame: {'yes' if p.get('sameCamera') else 'NO'}</dd></div>
  <div><dt>Cost</dt><dd>reconstructed {rc.get('calls','?')} draw calls, {rc.get('triangles',0):,} tris · original {oc.get('calls','?')} calls, {oc.get('triangles',0):,} tris</dd></div>
  <div><dt>Files</dt><dd><a href="{rec}">reconstructed</a> · <a href="{org}">original</a> · commit <code>{esc(commit)}</code></dd></div>
 </dl>
</article>''')

checks = len(R.get('checks', [])); fails = len(R.get('failures', []))
page = f'''<title>Oak Hollow Pavement</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600&display=swap">
<style>
/* Layout: a single reading column of same-frame comparisons; each pair is one figure with its own record. */
:root{{--bg:#eceeef;--surface:#fbfbfb;--fg:#17191b;--muted:#565d64;--line:#cfd3d6;--accent:#2f6b45;--accent-ink:#ffffff;
 --display:"Space Grotesk",system-ui,sans-serif;--body:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#111315;--surface:#1a1d20;--fg:#e8eaec;--muted:#a1a8af;--line:#30353a;--accent:#7cc39a;--accent-ink:#0d1a12;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#111315;--surface:#1a1d20;--fg:#e8eaec;--muted:#a1a8af;--line:#30353a;--accent:#7cc39a;--accent-ink:#0d1a12;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}}
main{{max-width:1120px;margin:0 auto;display:grid;gap:40px}}
.intro{{display:grid;gap:14px;max-width:72ch}}
.intro h1{{font:600 clamp(28px,4vw,40px)/1.1 var(--display);margin:0;text-wrap:balance;letter-spacing:-.01em}}
.intro p{{margin:0;color:var(--muted)}}
.facts{{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}}
.facts li{{font:500 12px/1 var(--mono);padding:7px 10px;border:1px solid var(--line);border-radius:4px;background:var(--surface)}}
.facts li b{{color:var(--accent);font-weight:500}}
.key{{font:500 12px var(--mono);background:var(--accent);color:var(--accent-ink);padding:2px 7px;border-radius:3px}}
.pair{{display:grid;gap:12px}}
.pair header{{display:flex;align-items:baseline;gap:12px;min-width:0}}
.code{{font:500 13px var(--mono);color:var(--accent);letter-spacing:.04em}}
.pair h2{{font:600 20px/1.25 var(--display);margin:0;text-wrap:balance}}
.compare{{position:relative;aspect-ratio:16/9;max-width:100%;overflow:hidden;border-radius:6px;background:#000;touch-action:pan-y}}
.compare img{{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;max-width:none}}
.compare .top{{clip-path:inset(0 calc(100% - var(--x)) 0 0)}}
.handle{{position:absolute;top:0;bottom:0;left:var(--x);width:2px;margin-left:-1px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.35);pointer-events:none}}
.handle::after{{content:"";position:absolute;top:50%;left:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.45)}}
.compare input{{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:ew-resize;margin:0}}
.compare input:focus-visible~.handle,.compare:has(input:focus-visible) .handle{{background:var(--accent)}}
.tag{{position:absolute;top:10px;font:500 11px/1 var(--mono);letter-spacing:.06em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.55);padding:6px 8px;border-radius:3px;pointer-events:none}}
.tag.l{{left:10px}}.tag.r{{right:10px}}
dl{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 20px;margin:0;font-size:13px}}
dl div{{min-width:0}} dt{{font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}} dd{{margin:2px 0 0;overflow-wrap:anywhere}}
code{{font:12px var(--mono)}} a{{color:var(--accent)}}
footer{{color:var(--muted);font-size:13px;max-width:72ch}}
@media (max-width:640px){{dl{{grid-template-columns:minmax(0,1fr)}}.tag{{font-size:10px}}}}
</style>
<main>
 <section class="intro">
  <h1>Oak Hollow Pavement</h1>
  <p>Roads, gutters, curbs, sidewalks and driveways of Last Light's Prologue, reconstructed: every pair below is one camera and one frame in the running game, with only the benchmark's <span class="key">O</span> key changed between them. Drag across an image to compare.</p>
  <ul class="facts">
   <li>commit <b>{esc(commit)}</b></li>
   <li>branch <b>claude/prologue-roads-sidewalks-curbs-reconstruction</b></li>
   <li>renderer <b>software WebGL (SwiftShader)</b></li>
   <li>viewport <b>1600 × 900</b></li>
   <li>suite <b>{checks} passed · {fails} failed</b></li>
  </ul>
 </section>
 {''.join(cards)}
 <footer>Game-renderer captures only: no offline renders and no generated images. Times of day are the ride's own (golden hour early in the ride, dusk toward the cul-de-sac; P18 and P21 after the call at the lookout). Textures: CC0 photogrammetry from Poly Haven (Asphalt 07 by Charlotte Baglioni, Gravel Concrete 04 by Dimitrios Savva), processed by Last Light's own tool; all wear and joints are Last Light's own shader work.</footer>
</main>
<script>
document.querySelectorAll('.compare').forEach(c=>{{const r=c.querySelector('input');const set=v=>c.style.setProperty('--x',v+'%');r.addEventListener('input',()=>set(r.value));set(r.value);}});
</script>
'''
if a.standalone:
    page = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + page.replace('<main>', '</head><body><main>', 1) + '</body></html>\n'
open(os.path.join(a.out, 'index.html'), 'w').write(page)
print('gallery:', len(cards), 'pairs ->', os.path.join(a.out, 'index.html'))
