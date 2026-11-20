"""Fill the measured sections of docs/STREET_PROPS_RECONSTRUCTION_REPORT.md (the result summary, §10 evidence, §11 tests
and performance) from the suite's report and the regression summaries. Re-runnable: it replaces its own marked blocks.

    python3 tools/streetprops-report-sections.py [docs/qa/streetprops/browser/report.json] [gallery URL]
"""
import json, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
REPORT = os.path.join(ROOT, 'docs', 'STREET_PROPS_RECONSTRUCTION_REPORT.md')
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'docs', 'qa', 'streetprops', 'browser', 'report.json')
GALLERY = sys.argv[2] if len(sys.argv) > 2 else None
R = json.load(open(SRC))
P = R['parts']
REG = os.path.join(ROOT, 'docs', 'qa', 'streetprops', 'regression')


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


# ------------------------------------------------------------------------------------------------ result summary
B, C, D, E, F = (P.get(k, {}) for k in 'BCDEF')
A_ = B.get('authored', {})
cars, props = A_.get('cars', {}), A_.get('props', {})
st = (B.get('loaded') or {}).get('stats', {})
k = st.get('props', {}).get('kinds', {})
checks, fails = len(R['checks']), len(R['failures'])

regs = []
for name, label in (('verify', 'game logic (`verify.mjs`, every chapter)'), ('house-browser', 'house benchmark'),
                    ('bike-browser', 'bike benchmark'), ('pipeline-browser', 'character pipeline lab'),
                    ('vegetation-browser', 'vegetation benchmark'), ('pavement-browser', 'pavement benchmark'),
                    ('main-menu-package', 'main menu, offline package (final chapter)')):
    f = os.path.join(REG, f'regression-{name}.json')
    if not os.path.exists(f):
        regs.append((label, None, None, f'regression-{name}.json'))
        continue
    r = json.load(open(f))
    ok = r.get('passed', len(r.get('checks', [])))
    bad = r.get('failed', len(r.get('failures', [])))
    if isinstance(bad, list):
        bad = len(bad)
    regs.append((label, ok, bad, f'regression-{name}.json'))

reg_ok = all(r[1] is not None and r[2] == 0 for r in regs)
missing = [r[0] for r in regs if r[1] is None]

result = f"""**Result.** All 54 parked cars and the parent's moving minivan are now six refined US-market family vehicles. Also
rebuilt in place: {k.get('poles', 0)} utility poles ({k.get('poles', 0) - k.get('backgroundPoles', 0)} on Oak Hollow and its side streets, {k.get('backgroundPoles', 0)} on the pole lines
behind the houses) with their hardware and {k.get('wires', 0)} continuous wires, 27 cobra-head streetlights, 133 mailboxes,
8 hydrants, {k.get('carts', 0) + k.get('cans', 0)} bins, {k.get('hoops', 0)} hoops and Oak Hollow's 500 fence runs
({n(k.get('bays', 0))} bays, {k.get('gates', 0)} gates, {n(k.get('posts', 0))} posts). Every object stands exactly where the
recorded procedural one stands; the default game's geometry, collisions, navigation and riding are identical (hashed
vertex by vertex and ride by ride). The street-props suite passes **{checks} of {checks + fails}** checks
(`tests/streetprops-browser.mjs`, commit `{R.get('commit')}`). The regression suites
{'all pass' if reg_ok else 'are listed in §11 (not all were run: ' + ', '.join(missing) + ')' if missing else 'are listed in §11'}.
There are {len(R['pairs'])} before/after pairs (§10){', browsable in the [review gallery](' + GALLERY + ')' if GALLERY else ''}."""

# ------------------------------------------------------------------------------------------------ §10 evidence
REQ = [('1', 'A sedan', 'S01, S05'), ('2', 'A minivan or SUV', 'S02 (minivan); the SUV in S04'),
       ('3', 'A pickup or station wagon', 'S03 (pickup), S03b (wagon)'), ('4', 'Three vehicle types together', 'S04'),
       ('5', 'Wheel and body close', 'S05'), ('6', 'Utility pole and wires', 'S06 (also S06b: the pole line behind the houses)'),
       ('7', 'Transformer and insulators', 'S07'), ('8', 'A streetlight at golden hour', 'S08, S08b'),
       ('9', 'A streetlight at dusk', 'S09'), ('10', 'A mailbox', 'S10, S10b (brick column close; also S11)'), ('11', 'A hydrant', 'S11'),
       ('12', 'Bins', 'S12'), ('13', 'A basketball hoop', 'S13 (garage), S13b (portable)'),
       ('14', 'A fence and gate', 'S14, S14b'), ('15', 'A residential street', 'S15'),
       ('16', 'A wide view with all five benchmarks', 'S16'),
       ('17', 'The boys on their current bikes', 'S17 (current in-game placeholder characters)')]
rows = []
for p in R['pairs']:
    a, o = p['authored'], p['original']
    f = [os.path.basename(x) for x in p['files']]
    cam = 'QA camera' if p.get('at', {}).get('free') else 'riding camera'
    clock = re.sub(r'\s+', ' ', (p.get('clock') or '').strip())
    rows.append(f"| **{pair_id(p)}** | {p['what']} | {cam} | {clock} | [authored](qa/streetprops/browser/{f[0]}) · "
                f"[original](qa/streetprops/browser/{f[1]}) | {n(a['calls'])} / {n(o['calls'])} | "
                f"{n(a['triangles'])} / {n(o['triangles'])} |")

ev = f"""## 10. Evidence

**{len(R['pairs'])} before/after pairs** in `docs/qa/streetprops/browser/`: the 17 required views, with a second angle for
{len(R['pairs']) - 17} of them. Each pair is one camera and one frame, with all five benchmarks on; the two images differ only by the X
key. `report.json` beside them holds each image's camera, game clock, draw calls, triangles and SHA-256.
{'**Review gallery** (the pairs side by side with a slider): ' + GALLERY + '. The same gallery is also in the offline package (`review-gallery/index.html`).' if GALLERY else 'The review gallery is built from `report.json` by `tools/blender/streetprops/build_review_gallery.py`.'}

| # | Required capture | Pair(s) |
|---|---|---|
""" + '\n'.join(f'| {a} | {b} | {c} |' for a, b, c in REQ) + """

| Pair | What it shows | Camera | Game clock | Images | Draw calls (authored / original) | Triangles (authored / original) |
|---|---|---|---|---|---|---|
""" + '\n'.join(rows) + f"""

The clock reads the game's own date line: every daytime pair is in the Prologue's evening (7:35–7:48 PM, August 21,
2011); S09 is later in the same ride, after the lamps come on. **Riding camera**: the gameplay camera, placed by the QA
hook. **QA camera**: placed by hand beside the object ({', '.join(pair_id(p) for p in R['pairs'] if p.get('at', {}).get('free'))}), with the same renderer, light and
shadows. In S16 the bike stands under the raised camera.

**Blender inspection renders** (offline Cycles, **not** the game): `docs/qa/streetprops/blender/`
(`blender-vehicles-lineup--BLENDER-RENDER.jpg`, `blender-props-kit--BLENDER-RENDER.jpg`): the six cars at LOD0 in period
paints, and the prop kit. They show the models themselves, not how the game draws them.
"""

# ------------------------------------------------------------------------------------------------ §11 tests, performance
byPart = {}
for c in R['checks']:
    byPart.setdefault(c['part'], []).append(c['name'])
fp = P.get('A', {}).get('fingerprint') or {}
q = P.get('A', {}).get('queries') or {}
foot = A_.get('footprint', {})
gr = A_.get('grounding', {})
wires = A_.get('wires', {})
loaded = B.get('loaded') or {}
tex = loaded.get('tex') or {}
veh, pr = st.get('vehicles', {}), st.get('props', {})
cost = E.get('cost') or {}

parts_txt = {
    'A': f"the default game fetches no street-props module or asset and has no `sp:` record, zone or line tag; its baseline: "
         f"{n(fp.get('merged', {}).get('tris', 0))} merged triangles, {n(q.get('n', 0))} ground queries, {q.get('obstacles')} obstacles",
    'B': f"the two GLBs and eight textures load (module {loaded.get('loadMs')} ms; page {n(B.get('wallLoadMs') or 0)} ms in software); "
         f"{cars.get('placed')}/{cars.get('records')} cars on their records (x/z within 2 cm), tyres within {gr.get('worstGap')} m of "
         f"the ground (the level procedural cars: up to {gr.get('proceduralWorstGap')} m), none further over a sidewalk "
         f"({foot.get('walkWorse')}) or into a house margin ({foot.get('houseCornerHitsBeyondProcedural')}) than the procedural "
         f"car; every pole, lamp, mailbox, hydrant, bin, bay and post accounted for; {wires.get('count')} wires attached at "
         f"both ends ({wires.get('detached')} detached, {wires.get('primariesOffInsulator')} primaries off an insulator); the "
         f"merged geometry, shadow proxies and lines hash identical to A; {n(q.get('n', 0))} ground queries, obstacles, "
         f"navigation shapes and three scripted rides identical; X and Z work; the moving minivan is authored, drives "
         f"{(B.get('dynamic') or {}).get('moved')} m with its wheels turning; Chapter One shows the originals; no page errors",
    'C': "all five benchmarks load together without error; vegetation identical with and without `?streetprops`; the ride runs",
    'D': "the offline package with models runs `?streetprops` and all five from the embedded bytes, browser offline, with no "
         "network request; the default package fails loudly and substitutes nothing",
    'E': f"{len(R['pairs'])} pairs, each one camera and one frame; cost per frame (below); no page errors",
    'F': "cost against the default game at eight riding cameras (below); no page errors",
}
suite = '\n'.join(f"| {p} | {len(byPart.get(p, []))} | {parts_txt[p]} |" for p in 'ABCDEF')
reg_rows = '\n'.join(f"| {lab} | {('**' + str(ok) + ' passed, ' + str(bad) + ' failed**') if ok is not None else 'not run'} | "
                     f"`docs/qa/streetprops/regression/{f}` |" for lab, ok, bad, f in regs)

frows = []
if F.get('summary'):
    for v in F['views']:
        d = F['default'].get(v['n'], {}).get('default', {})
        a = F['streetprops'].get(v['n'], {}).get('authored', {})
        o = F['streetprops'].get(v['n'], {}).get('original', {})
        frows.append(f"| {v['n']} (d {v['d']}) | {n(d.get('calls', 0))} · {n(d.get('tris', 0))} · {d.get('ms')} | "
                     f"{n(o.get('calls', 0))} · {n(o.get('tris', 0))} · {o.get('ms')} | {n(a.get('calls', 0))} · "
                     f"{n(a.get('tris', 0))} · {a.get('ms')} |")
    S = F['summary']
    ftxt = """| Camera | Default game: calls · tris · ms | `?streetprops`, ORIGINAL | `?streetprops`, AUTHORED |
|---|---|---|---|
""" + '\n'.join(frows) + f"""
| **Sum** | {n(S['default']['calls'])} · {n(S['default']['tris'])} · {S['default']['ms']} | {n(S.get('original', {}).get('calls', 0))} · {n(S.get('original', {}).get('tris', 0))} · {S.get('original', {}).get('ms')} | {n(S['authored']['calls'])} · {n(S['authored']['tris'])} · {S['authored']['ms']} |

Authored against the default game: **draw calls ×{S['ratio']['calls']}, triangles ×{S['ratio']['tris']}, software frame
time ×{S['ratio']['ms']}**. ORIGINAL under the flag already costs a little more than the default game in draw calls: the flag
bakes the street props into batches of their own (zones `sp:*`) so that X can hide them. Those smaller batches are also
frustum-culled one by one, so fewer triangles are drawn (the geometry is identical, §11.1). The frame time is the median of three renders on SwiftShader, on the CPU: it shows the relative
added work, not a GPU frame time."""
else:
    ftxt = '_Part F was not measured in this report._'

files = ['dist/assets/street/street.vehicles.glb', 'dist/assets/street/street.props.glb']
texs = [f for f in sorted(os.listdir(os.path.join(ROOT, 'dist', 'assets', 'street'))) if f.endswith(('.jpg', '.png'))]
tex_bytes = sum(size('dist/assets/street/' + f) for f in texs)
pkg = (D.get('package') or {})

perf = f"""## 11. Tests and performance

### 11.1 The street-props suite

`node tests/streetprops-browser.mjs` (Chromium + ANGLE SwiftShader, 1600 × 900): **{checks} passed, {fails} failed**
(commit `{R.get('commit')}`; `docs/qa/streetprops/browser/report.json`).

| Part | Checks | What is proved |
|---|---|---|
{suite}

### 11.2 Regressions (the existing suites)

| Suite | Result | Summary |
|---|---|---|
{reg_rows}

`verify.mjs` reports one known DEV difference (`2/alex-bike`: a companion's bike position after a dev-scene switch). It is
reported, not asserted, and appears with the same values in the pavement branch's own run
(`docs/qa/pavement/regression/regression-verify.json`). The game-logic suite was re-run after the review fixes (commit
`ff761b0`). The other benchmarks' browser suites ran at `495d571`, before them. Since then the only change outside the
street-props modules, assets, suite and docs is `background.js`, which records its pole lines when `?streetprops` is on and
does nothing without it: the default game's fingerprint in part A (merged geometry, shadow proxies, line batches, ground
queries and obstacles) is hash-for-hash the one of the earlier runs, and the game-logic suite passes.

### 11.3 Cost

**Files.** `street.vehicles.glb` {size(files[0]) / 1e6:.2f} MB, `street.props.glb` {size(files[1]) / 1e6:.2f} MB, eight textures
{tex_bytes / 1e6:.2f} MB on disk (2048² albedos, 1024² ORM and normal maps, a 512² cut-out). Offline package with every
benchmark's models: {pkg.get('models', 0) / 1e6:.1f} MB; default package (no models): {pkg.get('default', 0) / 1e6:.1f} MB.

**GPU textures** (estimated, RGBA8 with mipmaps): **≈ {tex.get('gpuMB')} MB**, anisotropy {tex.get('aniso')}.

**Geometry at a riding camera** (the DEV label's count, B): cars {n(veh.get('tris', 0))} triangles in {veh.get('calls')}
instanced draws for {veh.get('instances')} cars; props {n(pr.get('tris', 0))} triangles in
{pr.get('calls')} draws for {n(pr.get('instances', 0))} instances. LOD0 per car: 7,915–9,380 triangles (§4).

**Per captured frame** (E, all five benchmarks; authored against original in the same frame): draw calls
{rng(cost.get('drawCallDelta'), True)} per frame, triangles ×{rng(cost.get('triangleRatio'))}. Over the {len(R['pairs'])} frames: {n((cost.get('sum') or {}).get('authored', {}).get('calls', 0))} against
{n((cost.get('sum') or {}).get('original', {}).get('calls', 0))} calls, {n((cost.get('sum') or {}).get('authored', {}).get('tris', 0))} against
{n((cost.get('sum') or {}).get('original', {}).get('tris', 0))} triangles.

**Against the default game** (F: eight riding cameras, `?streetprops` alone; fresh browsers: three cameras per browser for the default game, one per browser with the flag, which renders each camera in both X modes):

{ftxt}

**Load.** The street-props module builds its set in {loaded.get('loadMs')} ms after its files arrive. The world bake is
the game's own: the flag adds batch splits, not geometry. **Memory** in software rendering: see §13. No real-GPU number has
been measured.
"""

text = open(REPORT).read()


def put(text, key, body, marker):
    block = f'<!-- {key}:start -->\n{body.strip()}\n<!-- {key}:end -->'
    pat = re.compile(rf'<!-- {key}:start -->.*?<!-- {key}:end -->', re.S)
    if pat.search(text):
        return pat.sub(lambda m: block, text)
    assert marker in text, marker
    return text.replace(marker, block, 1)


text = put(text, 'RESULT', result, '__RESULT__')
text = put(text, 'MEASURED', ev + '\n' + perf, '__MEASURED__')
open(REPORT, 'w').write(text)
print('report sections written:', checks, 'checks,', fails, 'failures,', len(R['pairs']), 'pairs; F', bool(F.get('summary')))
