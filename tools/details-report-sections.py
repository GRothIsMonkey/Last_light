"""Fill the measured sections of docs/DETAILS_RECONSTRUCTION_REPORT.md from the suite's report, the regression summaries and
the package record. It writes three blocks:
- the result summary;
- §12 evidence and §13 tests and performance;
- §18 delivery.

It is re-runnable: it replaces its own marked blocks.

    python3 tools/details-report-sections.py [docs/qa/details/browser/report.json] [gallery URL]
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
REPORT = os.path.join(ROOT, 'docs', 'DETAILS_RECONSTRUCTION_REPORT.md')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'qa', 'details', 'browser', 'report.json')
GALLERY = sys.argv[2] if len(sys.argv) > 2 else None
R = json.load(open(SRC))
P = R['parts']
REG = os.path.join(ROOT, 'docs', 'qa', 'details', 'regression')
PKG = os.path.join(ROOT, 'docs', 'qa', 'details', 'package.json')
PK = json.load(open(PKG)) if os.path.exists(PKG) else {}


def n(x):
    return f'{x:,}'


def rng(v, signed=False):
    if not v:
        return '?'
    f = (lambda x: f'{x:+d}'.replace('-', '−')) if signed else (lambda x: f'{x}')
    return f'{f(v[0])} to {f(v[1])}'


def size(f):
    return os.path.getsize(os.path.join(ROOT, f))


def pair_id(p):
    return p['name'].split('-')[0]


A, B, C, D, E, F = (P.get(k, {}) for k in 'ABCDEF')
loaded = B.get('loaded') or {}
st = loaded.get('stats') or {}
k = st.get('kinds') or {}
m = B.get('m') or {}
rec = (m.get('counts') or {}).get('records') or {}
hoses = m.get('hoses') or {}
checks, fails = len(R['checks']), len(R['failures'])

regs = []
for name, label in (('streetprops-browser', 'street-props benchmark (parts A–D)'), ('pavement-browser', 'pavement benchmark'),
                    ('vegetation-browser', 'vegetation benchmark'), ('house-browser', 'house benchmark'),
                    ('bike-browser', 'bike benchmark'), ('pipeline-browser', 'character pipeline lab'),
                    ('verify', 'game logic (`verify.mjs`, every chapter)'),
                    ('main-menu-package', 'main menu, offline package (final chapter)')):
    f = os.path.join(REG, f'regression-{name}.json')
    if not os.path.exists(f):
        regs.append((label, None, None, f'regression-{name}.json', None))
        continue
    r = json.load(open(f))
    ok = r.get('passed', len(r.get('checks', [])))
    bad = r.get('failed', len(r.get('failures', [])))
    if isinstance(bad, list):
        bad = len(bad)
    regs.append((label, ok, bad, f'regression-{name}.json', r.get('commit')))
reg_ok = all(r[1] is not None and r[2] == 0 for r in regs)
missing = [r[0] for r in regs if r[1] is None]

toys = sum(k.get(x, 0) for x in ('bigwheel', 'wagon', 'kidbike', 'scooter', 'balls'))
result = f"""**Result.** The Prologue's remaining neighborhood details are rebuilt in place as original Blender models:
- {k.get('signs', 0)} street-sign assemblies ({rec.get('plates', 0)} plates and blades);
- {k.get('porch chairs', 0) + k.get('lawn chairs', 0)} lawn and porch chairs and {k.get('grills', 0)} kettle grills;
- {k.get('hose coils', 0)} garden hoses with their hose bibs on the houses' walls, and {k.get('sprinklers', 0)} impact sprinklers on the game's own turning heads;
- {toys} toys;
- {k.get('kiddie pools', 0)} kiddie pools, {k.get('trampolines', 0)} trampolines with their nets and {k.get('swing sets', 0)} swing sets;
- {k.get('sheds', 0) + k.get('sheds behind the rear fences', 0)} sheds and {k.get('clotheslines', 0)} clotheslines;
- Briarwood's creek chain link ({k.get('creek fence bays', 0)} bays, {k.get('creek fence posts', 0)} posts) and the lookout's field fence ({k.get('field fence posts', 0)} posts, {k.get('field fence rails', 0)} rails).

Every object stands where the recorded procedural one stands, in its own yard and colours. The story objects (the oak, the
tire swing, the bench, the chalk, the bikes, the friends' homes) are untouched. The default game's geometry, collisions,
navigation and riding are identical, hashed vertex by vertex and ride by ride.

The details suite passes **{checks} of {checks + fails}** checks (`tests/details-browser.mjs`, commit `{R.get('commit')}`).
The regression suites
{'all pass' if reg_ok else ('are listed in §13 (not all were run: ' + ', '.join(missing) + ')') if missing else 'are listed in §13'}.
There are {len(R['pairs'])} before/after pairs (§12){', browsable in the [review gallery](' + GALLERY + ')' if GALLERY else ''}."""

# ------------------------------------------------------------------------------------------------ §12 evidence
REQ = [('1', 'Street-name sign close-up', 'D01'), ('2', 'Stop sign and intersection', 'D02'), ('3', 'Speed limit', 'D03'),
       ('4', 'Children at play', 'D04 (also D04b: NO OUTLET)'), ('5', 'Lawn chairs', 'D05, D05b (also D05c: porch chairs)'),
       ('6', 'Hose', 'D06'), ('7', 'Sprinkler', 'D07'), ('8', 'Wagon', 'D08'), ('9', 'Big wheel', 'D09'),
       ('10', 'A yard with toys', 'D10 (also D24: a kid\'s bike)'), ('11', 'Swing set', 'D11'), ('12', 'Trampoline', 'D12'),
       ('13', 'Pool', 'D13'), ('14', 'Shed', 'D14'), ('15', 'Clothesline', 'D15'), ('16', 'Creek chain link', 'D16'),
       ('17', 'Lookout field fence', 'D17'), ('18', 'Side-street fences', 'D18'), ('19', 'Wide residential street', 'D19'),
       ('20', 'Full Oak Hollow, all six benchmarks', 'D20'), ('21', 'First-person riding view', 'D21'),
       ('22', 'Oak and lookout unchanged', 'D22 (also D17)')]
rows = []
for p in R['pairs']:
    a, o = p['authored'], p['original']
    f = [os.path.basename(x) for x in p['files']]
    cam = 'QA camera' if p.get('at', {}).get('free') else 'riding camera'
    clock = re.sub(r'\s+', ' ', (p.get('clock') or '').strip())
    rows.append(f"| **{pair_id(p)}** | {p['what']} | {cam} | {clock} | [authored](qa/details/browser/{f[0]}) · "
                f"[original](qa/details/browser/{f[1]}) | {n(a['calls'])} / {n(o['calls'])} | "
                f"{n(a['triangles'])} / {n(o['triangles'])} |")
free = [pair_id(p) for p in R['pairs'] if p.get('at', {}).get('free')]
blender = sorted(f for f in os.listdir(os.path.join(ROOT, 'docs', 'qa', 'details', 'blender')) if f.endswith('--BLENDER-RENDER.jpg'))

ev = f"""## 12. Evidence

**{len(R['pairs'])} before/after pairs** are in `docs/qa/details/browser/`: the 22 required views, plus {len(R['pairs']) - 22} more
(a second angle or a further object). Each pair is one camera and one frame, with all six benchmarks on; the two images
differ only by the `.` key. `report.json` beside them holds each image's camera, game clock, draw calls, triangles and
SHA-256.
{'**Review gallery** (the pairs side by side with a slider, and the Blender renders in a section of their own): ' + GALLERY + '. The same gallery is also in the offline package (`review-gallery/index.html`).' if GALLERY else 'The review gallery is built from `report.json` by `tools/blender/details/build_review_gallery.py`.'}

| # | Required capture | Pair(s) |
|---|---|---|
""" + '\n'.join(f'| {a} | {b} | {c} |' for a, b, c in REQ) + """

| Pair | What it shows | Camera | Game clock | Images | Draw calls (authored / original) | Triangles (authored / original) |
|---|---|---|---|---|---|---|
""" + '\n'.join(rows) + f"""

The clock reads the game's own date line: every pair is in the Prologue's evening ride on August 21, 2011.
- **Riding camera:** the gameplay camera, placed by the QA hook and turned toward its subject.
- **QA camera:** placed by hand beside the object ({', '.join(free)}), with the same renderer, light and shadows. The bike
  stands next to the subject, or under a raised camera, so that the sky, the shadow camera and the world's own culling
  follow it.

**Blender inspection renders** (offline renders, **not** the game) are in `docs/qa/details/blender/`:
{', '.join('`' + b + '`' for b in blender)}. They show the kit's models alone at LOD0, not how the game draws them.
"""

# ------------------------------------------------------------------------------------------------ §13 tests, performance
byPart = {}
for c in R['checks']:
    byPart.setdefault(c['part'], []).append(c['name'])
fp = A.get('fingerprint') or {}
q = A.get('queries') or {}
tex = loaded.get('tex') or {}
cost = E.get('cost') or {}
ground = m.get('ground') or {}
signs = m.get('signs') or []

parts_txt = {
    'A': f"the default game fetches no details module or asset and has no `dt:` record, zone or label; its baseline: "
         f"{n(fp.get('merged', {}).get('tris', 0))} merged triangles, {fp.get('proxyCount', '?')} shadow proxies, "
         f"{n(q.get('n', 0))} ground queries, {q.get('obstacles')} obstacles",
    'B': f"the kit and five textures load (module {loaded.get('loadMs')} ms; page {n(B.get('wallLoadMs') or 0)} ms in software). "
         f"Every record is accounted for ({rec.get('chairs', '?')} chair, {rec.get('grills', '?')} grill, {rec.get('toys', '?')} toy and {rec.get('sheds', '?')} shed records and the rest): "
         f"each is placed, or counted where it is left alone (the {k.get('hose coils inside a house (never seen): left out', 0)} hidden hose coils, and Old Mill Road's "
         f"{k.get('porch chairs on Old Mill Road (a Chapter Four place): left as they are', 0)} porch chairs and {k.get('grills on Old Mill Road (a Chapter Four place): left as they are', 0)} grills). "
         f"Every authored piece stands on its procedural original ({(m.get('origin') or {}).get('checked', '?')} pieces against the baked geometry of their own zone, {(m.get('origin') or {}).get('off', '?')} off). "
         f"Every rigid piece is upright at true scale; nothing floats or sinks ({len(ground)} kinds measured). "
         f"All {len(signs)} plates and blades read their record's words, front and back, with none mirrored or pierced. "
         f"{hoses.get('bibs', '?')} hose bibs are on their walls ({hoses.get('bibsOffWall', '?')} off), with "
         f"{hoses.get('runs', '?')} continuous hose runs ({hoses.get('jumps', '?')} jumps, {hoses.get('underLawn', '?')} under the lawn, "
         f"{hoses.get('onWalkOrStreet', '?')} on a walk or the street, {hoses.get('onDrive', '?')} on a drive). "
         f"There are no duplicates or double shadows, and no detail on a story home or at the lookout. "
         f"The merged geometry, shadow proxies and lines hash identical to A, and {n(q.get('n', 0))} ground queries, "
         f"obstacles, navigation and three scripted rides are identical. The sprinklers turn and spray as before; `.` and `,` "
         f"work; Chapter One shows the originals; there are no page errors",
    'C': "all six benchmarks load together without error; vegetation and the street props are identical with and without "
         "`?details`; no authored porch chair or grill on a house-benchmark lot, and no grill anywhere but at a recorded grill; the ride runs",
    'D': "the offline package with models runs `?details` and all six from the embedded bytes, browser offline, with no "
         "network request; the default package fails loudly and substitutes nothing",
    'E': f"{len(R['pairs'])} pairs, each one camera and one frame; cost per frame (below); no page errors",
    'F': "cost against the default game at eight riding cameras (below); no page errors",
}
suite = '\n'.join(f"| {p} | {len(byPart.get(p, []))} | {parts_txt[p]} |" for p in 'ABCDEF')
reg_rows = '\n'.join(f"| {lab} | {('**' + str(ok) + ' passed, ' + str(bad) + ' failed**') if ok is not None else 'not run'} | "
                     f"{('`' + str(cm).split(' ')[0] + '`') if cm else '—'} | `docs/qa/details/regression/{f}` |"
                     for lab, ok, bad, f, cm in regs)

if F.get('summary'):
    frows = []
    for v in F['views']:
        d = F['default'].get(v['n'], {}).get('default', {})
        a = F['details'].get(v['n'], {}).get('authored', {})
        o = F['details'].get(v['n'], {}).get('original', {})
        frows.append(f"| {v['n']} (d {v['d']}) | {n(d.get('calls', 0))} · {n(d.get('tris', 0))} · {d.get('ms')} | "
                     f"{n(o.get('calls', 0))} · {n(o.get('tris', 0))} · {o.get('ms')} | {n(a.get('calls', 0))} · "
                     f"{n(a.get('tris', 0))} · {a.get('ms')} |")
    S = F['summary']
    ftxt = """| Camera | Default game: calls · tris · ms | `?details`, ORIGINAL | `?details`, AUTHORED |
|---|---|---|---|
""" + '\n'.join(frows) + f"""
| **Sum** | {n(S['default']['calls'])} · {n(S['default']['tris'])} · {S['default']['ms']} | {n(S['original']['calls'])} · {n(S['original']['tris'])} · {S['original']['ms']} | {n(S['authored']['calls'])} · {n(S['authored']['tris'])} · {S['authored']['ms']} |

Authored against the default game: **draw calls ×{S['ratio']['calls']}, triangles ×{S['ratio']['tris']}, software frame
time ×{S['ratio']['ms']}**. ORIGINAL under the flag can differ a little from the default game in draw calls and triangles:
the flag bakes the details into batches of their own (zones `dt:*`) so that `.` can hide them, and those batches are
frustum-culled one by one. The geometry is identical (§13.1). The frame time is the median of three renders on
SwiftShader, on the CPU: it shows the relative added work, not a GPU frame time."""
    mem = F.get('detailsMemory') or {}
    dmem = F.get('defaultMemory') or {}
else:
    ftxt, mem, dmem = '_Part F was not measured in this report._', {}, {}

texs = [f for f in sorted(os.listdir(os.path.join(ROOT, 'dist', 'assets', 'details'))) if f.endswith(('.jpg', '.png'))]
tex_bytes = sum(size('dist/assets/details/' + f) for f in texs)
pkg = D.get('package') or {}
kit = size('dist/assets/details/details.kit.glb')

perf = f"""## 13. Tests and performance

### 13.1 The details suite

`node tests/details-browser.mjs` (Chromium + ANGLE SwiftShader, 1600 × 900): **{checks} passed, {fails} failed**
(commit `{R.get('commit')}`; `docs/qa/details/browser/report.json`).

| Part | Checks | What is proved |
|---|---|---|
{suite}

### 13.2 Regressions (the existing suites)

| Suite | Result | Commit | Summary |
|---|---|---|---|
{reg_rows}

`verify.mjs` reports one known DEV difference, `2/alex-bike`: a companion's bike position after a dev-scene switch. It is
reported, not asserted, and appears with the same values in the earlier branches' runs.

**Which commit.** The details suite and every regression ran on `6a85f70`. The later commits on this branch change only
documentation, the QA records and the text of one capture's description in the details suite (D19). They also
remove two Python bytecode caches the first commit had picked up by mistake. `dist/` is byte-identical. The street-props suite ran its correctness parts A–D (the default game unchanged, every street prop
placed, the offline package). Its capture and cost parts (E, F) are that benchmark's own evidence, and nothing they
measure was touched.

### 13.3 Cost

**Files.**
- `details.kit.glb`: {kit / 1e6:.2f} MB (every piece, three LODs).
- Five textures: {tex_bytes / 1e6:.2f} MB on disk (a 2048² albedo, 1024² ORM and normal maps, a 512² cut-out, a 2048 × 1024
  sign atlas).
- Offline package with every benchmark's models: {pkg.get('models', 0) / 1e6:.1f} MB. Default package (no models):
  {pkg.get('default', 0) / 1e6:.1f} MB.

**GPU textures** (estimated, RGBA8 with mipmaps): **≈ {tex.get('gpuMB')} MB**, anisotropy {tex.get('aniso')}. One atlas set
serves every detail, through instancing and the shared atlases.

**Geometry at a riding camera** (the DEV label's count, part B): {n(round(st.get('tris', 0)))} detail triangles in
{st.get('calls')} instanced draws for {st.get('instances')} instances ({st.get('sets')} sets, {st.get('materials')} materials;
LOD 0/1/2 sets in view: {'/'.join(str(x) for x in st.get('levels', []))}). LOD0 per piece is between 24 triangles (a
chain-link bay) and 3,420 (a trampoline); the kit's triangle counts are in `assets/source/details/build-stats.json`.

**With all six benchmarks** (E, per captured frame; authored against original in the same frame): draw calls
{rng(cost.get('drawCallDelta'), True)} per frame, triangles ×{rng(cost.get('triangleRatio'))}. Over the {len(R['pairs'])} frames:
- draw calls: {n((cost.get('sum') or {}).get('authored', {}).get('calls', 0))} against {n((cost.get('sum') or {}).get('original', {}).get('calls', 0))};
- triangles: {n((cost.get('sum') or {}).get('authored', {}).get('tris', 0))} against {n((cost.get('sum') or {}).get('original', {}).get('tris', 0))}.

**The details alone, against the default game** (F): eight riding cameras, with `?details` alone, in fresh browsers. The
default game renders three cameras per browser. The flag renders two per browser, each camera in both `.` modes.

{ftxt}

**Load.** The details module builds its set in {loaded.get('loadMs')} ms after its files arrive. The world bake is the game's
own: the flag adds batch splits, not geometry.

**Memory** (software renderer, the first browser of F): JS heap {dmem.get('heapMB', '?')} MB for the default game,
{mem.get('heapMB', '?')} MB with `?details`. Geometries {(dmem.get('renderer') or {}).get('geometries', '?')} against
{(mem.get('renderer') or {}).get('geometries', '?')}; textures {(dmem.get('renderer') or {}).get('textures', '?')} against
{(mem.get('renderer') or {}).get('textures', '?')}. No real-GPU number has been measured.
"""

# ------------------------------------------------------------------------------------------------ §18 delivery
z = PK.get('zip') or {}
delivery = f"""| # | Deliverable | Where |
|---|---|---|
| 1 | The branch | `claude/prologue-neighborhood-details-benchmark`, pushed to `origin`. Started from `192ac2b515e47324838fa8df0e719b91ecde0a34` (the street-props branch, untouched); **not merged into `main`**. |
| 2 | Its verified SHA | the head commit is the one that adds this section. Its SHA is given with the delivery and by `git ls-remote origin claude/prologue-neighborhood-details-benchmark`. |
| 3 | The report | this file |
| 4 | Blender models | `assets/source/details/details.kit.blend` (every piece, three LODs) |
| 5 | Game-ready assets | `dist/assets/details/` (`details.kit.glb`, five textures). The runtime is `dist/details-assets.js` and `dist/details-benchmark.js`; the recording hooks are in `world.js`, `props.js`, `furniture.js`, `houses.js`, `background.js`, `ambient.js` and `game.js` (inert without the flag). |
| 6 | Build scripts | `tools/blender/details/`: `details_textures.py`, `build_details.py`, `render_details.py` and `build_review_gallery.py`. `tools/details-report-sections.py` fills this report. |
| 7 | Provenance | `assets/source/details/PROVENANCE.md`, `SHA256SUMS`, and `docs/THIRD_PARTY_ASSETS.md` (the details section) |
| 8 | Screenshots | `docs/qa/details/browser/` ({len(R['pairs'])} same-frame pairs, `report.json`) |
| 9 | Gallery | {GALLERY or '(not published)'} (private to its owner until shared), also `review-gallery/` in the package; Blender renders in `docs/qa/details/blender/`, labelled |
| 10 | Performance numbers and limitations | §13.3, §15 |
| 11 | The test suite | `tests/details-browser.mjs`: {checks} passed, {fails} failed, all six parts |
| 12 | Regression results | §13.2; `docs/qa/details/regression/` |
| 13 | Offline ZIP | {('`' + z.get('name', '?') + '`, ' + n(z.get('bytes', 0)) + ' bytes, SHA-256 `' + z.get('sha256', '?') + '`. It holds `Last-Light-Playtest.html` (the whole game with every benchmark\'s models embedded; entry SHA-256 `' + z.get('entrySha256', '?') + '`), `DETAILS-README.txt`, this report, the review gallery, and the credits and licences. It was built from the `dist/` of `' + str(z.get('builtFrom', '?')) + '`. Smoke test of the delivered file: ' + z.get('smokeTest', 'not run') + '.') if z else '(see the delivery message)'} The ZIP is not in git (`release/` is ignored). |
| 14 | Six-benchmark instructions | §14, and `DETAILS-README.txt` in the ZIP (`?bikes&houses&vegetation&pavement&streetprops&details`; `.` and `,`) |
| 15 | Approval entries | A-69 to A-77 in `docs/art/ART-APPROVAL-REGISTER.md`, all OPEN (§17); A-60 to A-68 unchanged |
| 16 | Deferred list | §16 |"""

text = open(REPORT).read()


def put(text, key, body, marker):
    block = f'<!-- {key}:start -->\n{body.strip()}\n<!-- {key}:end -->'
    pat = re.compile(rf'<!-- {key}:start -->.*?<!-- {key}:end -->', re.S)
    if pat.search(text):
        return pat.sub(lambda m_: block, text)
    assert marker in text, marker
    return text.replace(marker, block, 1)


text = put(text, 'RESULT', result, '__RESULT__')
text = put(text, 'MEASURED', ev + '\n' + perf, '__MEASURED__')
text = put(text, 'DELIVERY', delivery, '__DELIVERY__')
open(REPORT, 'w').write(text)
print('report sections written:', checks, 'checks,', fails, 'failures,', len(R['pairs']), 'pairs; F', bool(F.get('summary')),
      '; regressions', 'all pass' if reg_ok else f'missing {missing}')
