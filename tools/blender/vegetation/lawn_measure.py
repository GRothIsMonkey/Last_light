"""The lawn repair's numbers and capture tables, from the browser suite's report.

    python3 tools/blender/vegetation/lawn_measure.py [docs/qa/vegetation/lawn-browser]
-> docs/qa/vegetation/lawn-measurements.md / .json (pasted into docs/LAWN_REPAIR_REPORT.md §4, §6, §7)
Every number is the shipped renderer under software WebGL (SwiftShader) or file data, never a GPU timing.
"""
import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
QA = os.path.join(ROOT, 'docs', 'qa', 'vegetation')


def pct(x):
    return f'{x * 100:.1f} %'


def main(argv):
    bdir = os.path.join(ROOT, argv[0]) if argv else os.path.join(QA, 'lawn-browser')
    rep = json.load(open(os.path.join(bdir, 'report.json')))
    rel = os.path.relpath(bdir, os.path.join(ROOT, 'docs'))
    out, M = [], {'summary': rep.get('summary'), 'commit': rep.get('commit')}
    lawn = rep.get('lawn', [])
    # captures: one row per view, links to C / B / A
    out.append('### Captures (in the game, software WebGL; one camera and one frame per row)\n')
    out.append('| View | Camera | C repaired | B first benchmark | A original |')
    out.append('|---|---|---|---|---|')
    for x in lawn:
        f = x['files']
        cam = x.get('camera') == 'walking' and 'walking (later evening)' or ('riding, with bikes & houses' if x.get('flags') else 'riding (golden hour)')
        link = lambda p, t: f'[{t}]({rel}/{os.path.basename(p)})' if p else '–'
        out.append(f"| **{x['name']}**: {x.get('caption', '')} | {cam}{'' if x['sameCamera'] else ' **(camera differs!)**'} | {link(f[0], 'C')} | {link(f[1], 'B')} | {link(f[2], 'A')} |")
    # cost
    out.append('\n### Cost in the same frames (software WebGL; renderer counts for the whole frame)\n')
    out.append('| View | Draw calls C / B / A | Triangles C / B / A | Blade triangles C | Blade tiles LOD0/1/2 | B tufts |')
    out.append('|---|---|---|---|---|---|')
    for x in lawn:
        C, B, A = x['C'], x['B'], x['A']
        out.append(f"| {x['name']} | {C['calls']} / {B['calls']} / {A['calls']} | {C['triangles']:,} / {B['triangles']:,} / {A['triangles']:,} | {C.get('bladeTris', 0):,} | "
                   f"{'/'.join(str(t) for t in (C.get('bladeTiles') or []))} | {B.get('clumps', 0):,} |")
    tri = [(x['C']['triangles'] / max(1, x['B']['triangles'])) for x in lawn]
    calls = [x['C']['calls'] - x['B']['calls'] for x in lawn]
    out.append(f"\nAgainst the first benchmark in the same frames: triangles x{min(tri):.2f} .. x{max(tri):.2f} (median x{sorted(tri)[len(tri) // 2]:.2f}); "
               f"draw calls {min(calls):+d} .. {max(calls):+d}.")
    M['cost'] = [{'name': x['name'], 'C': x['C'], 'B': x['B'], 'A': x['A']} for x in lawn]
    # pixel metrics
    mrows = [x for x in lawn if x['C'].get('metrics')]
    if mrows:
        out.append('\n### The lawn\'s own pixels (lawn-only 12 px blocks, from a mask rendered in the same frame)\n')
        out.append('| View | Lawn blocks | Tuft islands (blocks >15 % off their neighbourhood) C / B / A | Mean deviation C / B / A |')
        out.append('|---|---|---|---|')
        for x in mrows:
            C, B, A = x['C']['metrics'], x['B']['metrics'], x['A']['metrics']
            out.append(f"| {x['name']} | {C['blocks']:,} | {pct(C['islands'])} / {pct(B['islands'])} / {pct(A['islands'])} | {pct(C['meanDev'])} / {pct(B['meanDev'])} / {pct(A['meanDev'])} |")
        out.append('\nWhere a lawn is near (L01-L07): A, the original lawn, is a flat colour (mean deviation under 1.1 %: the "slab"); '
                   'B adds tuft islands (2.4-9.0 % of the lawn blocks); C keeps islands under 1 % while giving the lawn the fine '
                   'variation of grass (mean deviation 1.9-2.8 %). In the long and shadowed views (L08, L15, L16) a block covers '
                   'about a square metre far away and tree shadows and the lots\' own colours dominate all three versions alike '
                   '(L08: C 2.5 %, B 2.0 %, A 1.6 %; L15: C and B 10.2 %, A 9.2 %; L16: C 4.6 %, B 17.4 %, A 3.9 %): '
                   'the metric does not judge tufts there.')
    g = rep.get('parts', {}).get('game', {})
    lc = g.get('lawnChecks')
    info = ((g.get('loaded') or {}).get('info') or {})
    if lc:
        out.append('\n### Focused checks\n')
        out.append(f"- coverage: {lc['coverage']['tested']} lawn points (12.5 cm sub-cell centres) within 11 m in view, {lc['coverage']['missing']} without blades")
        out.append(f"- boundaries: {lc['hard']['bits']:,} blade sub-cells in {lc['hard']['cells']} tiles, {lc['hard']['bad']} over a walk, curb, drive, pad, porch, house, shed or the street")
        out.append(f"- LOD: {lc['lod']['bad']} tiles dropping unfaded blades (tiles LOD0/1/2 {'/'.join(map(str, lc['lod']['tiles']))}); the same pose twice: {'identical' if lc['stable'] else 'DIFFERENT'}")
        t = lc['tiling']
        out.append(f"- tiling: lawn pixels 0.5 m apart correlate r = {t['periodX']['r']} / {t['periodZ']['r']} (x / z; n = {t['periodX']['n']} / {t['periodZ']['n']}); an unrelated offset r = {t['unrelated']['r']}")
        w = lc['wind']
        out.append(f"- wind: blades on the trees' uniforms {w['sameTime'] and w['sameGust'] and w['sameScale']}, time advances {w['advances']}")
        out.append(f"- collisions: obstacles {lc['obstacles']}, navigation shapes {lc['space']} (the same as without the flag)")
        M['lawnChecks'] = lc
    if info:
        out.append(f"\nLoaded in {(g.get('loaded') or {}).get('loadMs')} ms (software path, local server): {info.get('bytes', 0):,} bytes in five files; "
                   f"{info.get('materials')} vegetation materials, {info.get('textures')} textures, ~{info.get('gpuTextureMB')} MB GPU texture memory (estimate, RGBA8 + mips).")
        M['info'] = info
    out.append(f"\nSuite: {rep['summary']['passed']} passed, {rep['summary']['failed']} failed (commit {rep.get('commit')}).")
    open(os.path.join(QA, 'lawn-measurements.md'), 'w').write('\n'.join(out) + '\n')
    json.dump(M, open(os.path.join(QA, 'lawn-measurements.json'), 'w'), indent=1, default=str)
    print('\n'.join(out))


if __name__ == '__main__':
    main(sys.argv[1:])
