#!/usr/bin/env python3
"""Build the neighborhood-details review gallery (one HTML page + the captures beside it) from the browser suite's report.

usage: python3 tools/blender/details/build_review_gallery.py <report.json> <outDir> [--commit SHA] [--blender DIR] [--standalone]
Writes <outDir>/index.html and copies every capture to <outDir>/img/ (and the labelled Blender renders to <outDir>/blender/). The page works from disk (relative paths, no
network) and is the same page that is published as the review artifact.
"""
import argparse, html, json, os, shutil

ap = argparse.ArgumentParser()
ap.add_argument('report'); ap.add_argument('out'); ap.add_argument('--commit', default=None)
ap.add_argument('--blender', default=None, help='folder of *--BLENDER-RENDER.jpg inspection renders (shown in their own section)')
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
nav = []
for i, p in enumerate(R.get('pairs', [])):
    f = p.get('files') or [None, None]
    rec, org = img(f[0]), img(f[1])
    if not rec or not org:
        continue
    flags = p.get('flags', 'qa&details')
    camkind = p.get('cameraKind') or 'gameplay riding camera (QA placement)'
    cam = p.get('camera', {})
    clock = (p.get('clock') or '').strip()
    rc, oc = p.get('authored', {}), p.get('original', {})
    num = p['name'].split('-')[0]
    title = p.get('what') or p['name']
    nav.append(f'<a href="#{esc(num.lower())}">{esc(num)}</a>')
    cards.append(f'''
<article class="pair" id="{esc(num.lower())}">
 <header><span class="code">{esc(num)}</span><h2>{esc(title[0].upper() + title[1:])}</h2></header>
 <div class="compare" style="--x:50%">
  <img src="{org}" alt="{esc(title)}: original procedural objects" loading="lazy" width="1600" height="900">
  <img class="top" src="{rec}" alt="{esc(title)}: authored neighborhood details" loading="lazy" width="1600" height="900">
  <span class="tag l">Authored</span><span class="tag r">Original</span>
  <span class="handle" aria-hidden="true"></span>
  <input type="range" min="0" max="100" value="50" aria-label="Reveal authored or original: {esc(num)}" id="slider-{i}">
 </div>
 <dl>
  <div><dt>Capture</dt><dd>Game-renderer capture · {esc(camkind)} · software WebGL (SwiftShader), not a GPU</dd></div>
  <div><dt>Scene</dt><dd>{esc(clock or 'Prologue')} · flags <code>?{esc(flags)}</code> · same camera and frame: {'yes' if p.get('sameCamera') else 'NO'}</dd></div>
  <div><dt>Cost</dt><dd>authored {rc.get('calls','?')} draw calls, {rc.get('triangles',0):,} tris · original {oc.get('calls','?')} calls, {oc.get('triangles',0):,} tris</dd></div>
  <div><dt>Files</dt><dd><a href="{rec}">authored</a> · <a href="{org}">original</a> · commit <code>{esc(commit)}</code></dd></div>
 </dl>
</article>''')

blend = []
if a.blender and os.path.isdir(a.blender):
    os.makedirs(os.path.join(a.out, 'blender'), exist_ok=True)
    for name in sorted(f for f in os.listdir(a.blender) if f.endswith('--BLENDER-RENDER.jpg')):
        shutil.copyfile(os.path.join(a.blender, name), os.path.join(a.out, 'blender', name))
        what = name.replace('blender-details-', '').replace('--BLENDER-RENDER.jpg', '')
        blend.append(f'<figure><img src="blender/{esc(name)}" alt="Blender inspection render of the details kit: {esc(what)}" loading="lazy"><figcaption><span class="code">BLENDER RENDER</span> {esc(what)} · offline render of the models alone, not the game</figcaption></figure>')
checks = len(R.get('checks', [])); fails = len(R.get('failures', []))
page = f'''<title>Oak Hollow Details</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@500;600&display=swap">
<style>
/* Layout: a single reading column of same-frame comparisons; each pair is one figure with its own record. */
:root{{--bg:#efede8;--surface:#fbfaf7;--fg:#1b1a17;--muted:#5d5a52;--line:#d6d2c8;--accent:#8a5a06;--accent-ink:#ffffff;--warn:#1d5a3a;
 --display:"Space Grotesk",system-ui,sans-serif;--body:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#13120f;--surface:#1c1b17;--fg:#ebe8e0;--muted:#aaa598;--line:#34322b;--accent:#e2b64a;--accent-ink:#1a1405;--warn:#7cc39a;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#13120f;--surface:#1c1b17;--fg:#ebe8e0;--muted:#aaa598;--line:#34322b;--accent:#e2b64a;--accent-ink:#1a1405;--warn:#7cc39a;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}}
main{{max-width:1120px;margin:0 auto;display:grid;gap:40px}}
.intro{{display:grid;gap:14px;max-width:72ch}}
.intro h1{{font:600 clamp(28px,4vw,40px)/1.1 var(--display);margin:0;text-wrap:balance;letter-spacing:-.01em}}
.intro p{{margin:0;color:var(--muted)}}
.facts{{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}}
.facts li{{font:500 12px/1 var(--mono);padding:7px 10px;border:1px solid var(--line);border-radius:4px;background:var(--surface)}}
.facts li b{{color:var(--accent);font-weight:500}}
.key{{font:500 12px var(--mono);background:var(--accent);color:var(--accent-ink);padding:2px 7px;border-radius:3px}}
.toc{{display:flex;flex-wrap:wrap;gap:6px;margin:0}}
.toc a{{font:500 12px/1 var(--mono);padding:6px 8px;border:1px solid var(--line);border-radius:4px;text-decoration:none;color:var(--fg);background:var(--surface)}}
.toc a:hover{{border-color:var(--accent);color:var(--accent)}}
.blender{{display:grid;gap:14px;border-top:1px solid var(--line);padding-top:28px}}
.blender h2{{font:600 22px/1.2 var(--display);margin:0}} .blender p{{margin:0;color:var(--muted);max-width:72ch}}
.blender .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:16px}}
figure{{margin:0;display:grid;gap:6px;min-width:0}} figure img{{width:100%;border-radius:6px;border:3px dashed var(--line)}}
figcaption{{font-size:13px;color:var(--muted)}}
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
  <h1>Oak Hollow Details</h1>
  <p>The Prologue's street signs, lawn and porch chairs, grills, garden hoses and sprinklers, toys, kiddie pools, trampolines, swing sets, sheds, clotheslines, Briarwood's creek chain link and the lookout's field fence, rebuilt in place. Every pair below is one camera and one frame in the running game, with all six visual benchmarks on and only the details benchmark's <span class="key">.</span> key changed between them. Drag across an image to compare. Awaiting the creative director's review — not approved.</p>
  <ul class="facts">
   <li>commit <b>{esc(commit)}</b></li>
   <li>branch <b>claude/prologue-neighborhood-details-benchmark</b></li>
   <li>renderer <b>software WebGL (SwiftShader)</b></li>
   <li>viewport <b>1600 × 900</b></li>
   <li>suite <b>{checks} passed · {fails} failed</b></li>
  </ul>
  <nav class="toc" aria-label="Pairs">{''.join(nav)}<a href="#blender">Blender renders</a></nav>
 </section>
 {''.join(cards)}
 <section class="blender" id="blender">
  <h2>Blender inspection renders — not the game</h2>
  <p>Offline renders of the kit's models alone (LOD0, neutral studio light), made by <code>tools/blender/details/render_details.py</code>. They show the models, not how the game draws them; every image above is the game renderer.</p>
  <div class="grid">{''.join(blend) or '<p>(none supplied)</p>'}</div>
 </section>
 <footer>The pairs are game-renderer captures; the only offline renders are the separately labelled Blender section, and there are no generated images. Riding-camera views are placed by the QA hook; close-up and raised views are a QA camera placed by hand beside the object, in the same game renderer, light and shadows (each pair says which). Times of day are the ride's own. The figures on bicycles are the game's current procedural characters, placeholders until the Blender characters are integrated. The details are original Last Light work; the lookout fence's grey wood is the street props' texture from “Wooden Fence” by DmitriyGDS (CC BY 4.0), and the sign lettering is set in Overpass (SIL OFL 1.1).</footer>
</main>
<script>
document.querySelectorAll('.compare').forEach(c=>{{const r=c.querySelector('input');const set=v=>c.style.setProperty('--x',v+'%');r.addEventListener('input',()=>set(r.value));set(r.value);}});
</script>
'''
if a.standalone:
    page = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + page.replace('<main>', '</head><body><main>', 1) + '</body></html>\n'
open(os.path.join(a.out, 'index.html'), 'w').write(page)
print('gallery:', len(cards), 'pairs ->', os.path.join(a.out, 'index.html'))
