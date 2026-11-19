"""Collect the vegetation benchmark's measurements into docs/qa/vegetation/measurements.md (and .json).

    python3 tools/blender/vegetation/veg_measure.py
Reads build-stats.json of each family, the validator reports (docs/qa/vegetation/validate-*.json, written by
`node tools/assets/validate-glb.mjs <glb> --profile veg --json ...`), the browser report (docs/qa/vegetation/browser/
report.json) and the files themselves. Every number below is software-rendering or file data, never hardware FPS.
"""
import json
import os
import statistics as st

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
QA = os.path.join(ROOT, 'docs', 'qa', 'vegetation')
SRC = os.path.join(ROOT, 'assets', 'source', 'vegetation')
ORIG = os.path.join(SRC, 'third-party', 'sketchfab-originals')


def load(p, default=None):
    try:
        return json.load(open(p))
    except Exception:
        return default


def mb(n):
    return f'{n / 1048576:.2f} MB'


def main():
    out, M = [], {}
    man = load(os.path.join(ORIG, 'manifest.json'), {'files': []})
    # files
    out.append('### Files: the supplied originals and the optimized runtime files\n')
    out.append('| Original (CC BY 4.0) | Bytes | Runtime file | Bytes | Validator |')
    out.append('|---|---|---|---|---|')
    pairs = [('200_year_old_oak_tree.glb', 'lm.old-oak'), ('realistic_trees_collection.glb', 'veg.street-trees'),
             ('bush_models_pack_gameready_lods.glb', 'veg.shrubs'), ('grass_and_bush_-_mobile_gameready.glb', 'veg.ground')]
    M['files'] = []
    for o, r in pairs:
        ob = next((f['bytes'] for f in man['files'] if f['name'] == o), None)
        rp = os.path.join(ROOT, 'dist', 'assets', 'veg', r + '.glb')
        rb = os.path.getsize(rp) if os.path.exists(rp) else None
        v = load(os.path.join(QA, f'validate-{r}.json'), {})
        kh = v.get('khronos', {})
        vtxt = (f"ok; Khronos {kh.get('errors')} errors, {kh.get('warnings')} warnings" if v.get('ok') else 'FAILED: ' + '; '.join(v.get('errors', [])[:2])) if v else 'not run'
        out.append(f'| `{o}` | {ob:,} | `dist/assets/veg/{r}.glb` | {rb:,} | {vtxt} |')
        M['files'].append({'original': o, 'originalBytes': ob, 'runtime': r, 'runtimeBytes': rb, 'gpuTextureMB': v.get('info', {}).get('gpuTextureMBEstimate'), 'validator': {'ok': v.get('ok'), 'khronos': kh}})
    lp = os.path.join(ROOT, 'dist', 'assets', 'veg', 'veg.lawn.glb')
    if os.path.exists(lp):
        v = load(os.path.join(QA, 'validate-veg.lawn.json'), {})
        kh = v.get('khronos', {})
        vtxt = f"ok; Khronos {kh.get('errors')} errors, {kh.get('warnings')} warnings" if v.get('ok') else 'not run or failed'
        out.append(f"| (original work: the lawn repair) | – | `dist/assets/veg/veg.lawn.glb` | {os.path.getsize(lp):,} | {vtxt} |")
        M['files'].append({'original': None, 'runtime': 'veg.lawn', 'runtimeBytes': os.path.getsize(lp), 'gpuTextureMB': v.get('info', {}).get('gpuTextureMBEstimate'), 'validator': {'ok': v.get('ok'), 'khronos': kh}})
    tot = sum(f['runtimeBytes'] or 0 for f in M['files'])
    out.append(f'\nRuntime total {tot:,} bytes ({mb(tot)}); the offline package embeds them base64 (+33 %).\n')
    # triangles per asset and LOD
    out.append('### Triangles by asset and LOD (LOD0 / LOD1 / LOD2)\n')
    oak = load(os.path.join(SRC, 'oak', 'build-stats.json'), {})
    if oak:
        L = oak['lods']
        out.append(f"**The old oak (lm.old-oak):** {L['lod0']['tris']:,} / {L['lod1']['tris']:,} / {L['lod2']['tris']:,} "
                   f"(LOD0: {L['lod0']['wood_tris']:,} bark, {L['lod0']['leaf_cards']:,} leaf cards, {L['lod0']['carving_tris']} carving).\n")
        M['oak'] = L
    street = load(os.path.join(SRC, 'street', 'build-stats.json'), {})
    if street:
        out.append('| Species | Variants | LOD0 min–max (mean) | LOD1 mean | LOD2 mean | Height (m) | Crown radius (m) | Branch architecture |')
        out.append('|---|---|---|---|---|---|---|---|')
        by = {}
        for k, v in street['variants'].items():
            by.setdefault(k.split('.')[1], []).append(v)
        M['street'] = {}
        for sp in ('maple', 'oak', 'ash', 'birch', 'pine', 'spruce', 'young'):
            vs = by.get(sp, [])
            if not vs:
                continue
            l0 = [v['lod0']['tris'] for v in vs]
            row = {'variants': len(vs), 'lod0': [min(l0), max(l0), round(st.mean(l0))], 'lod1': round(st.mean(v['lod1']['tris'] for v in vs)),
                   'lod2': round(st.mean(v['lod2']['tris'] for v in vs)), 'height': [min(v['height'] for v in vs), max(v['height'] for v in vs)],
                   'crown': [min(v['crown'] for v in vs), max(v['crown'] for v in vs)]}
            M['street'][sp] = row
            arch = 'Jungle Jim collection skeletons (3) + reshaped (3)' if sp in ('oak', 'ash') else 'grown (species model)'
            name = {'pine': 'white pine'}.get(sp, sp)
            out.append(f"| {name} | {row['variants']} | {row['lod0'][0]:,}–{row['lod0'][1]:,} ({row['lod0'][2]:,}) | {row['lod1']:,} | {row['lod2']:,} | "
                       f"{row['height'][0]:.1f}–{row['height'][1]:.1f} | {row['crown'][0]:.1f}–{row['crown'][1]:.1f} | {arch} |")
    shrubs = load(os.path.join(SRC, 'shrubs', 'build-stats.json'), {})
    if shrubs:
        fam = {}
        for k, v in shrubs['variants'].items():
            f = k.split('.')[1] + ('.' + k.split('.')[2] if k.startswith('shrub.natural') else '')
            fam.setdefault(f, []).append(v)
        out.append('\n| Shrub family | Variants | LOD0 / LOD1 / LOD2 (mean) | Size w × d × h (m, typical) |')
        out.append('|---|---|---|---|')
        M['shrubs'] = {}
        for f, vs in fam.items():
            r = [round(st.mean(v[f'lod{i}'] for v in vs)) for i in range(3)]
            s = vs[0]['size']
            M['shrubs'][f] = {'variants': len(vs), 'tris': r}
            out.append(f"| {f} | {len(vs)} | {r[0]:,} / {r[1]:,} / {r[2]:,} | {s[0]:.2f} × {s[1]:.2f} × {s[2]:.2f} |")
    ground = load(os.path.join(SRC, 'ground', 'build-stats.json'), {})
    if ground:
        out.append('\n| Ground plant | LOD0 / LOD1 |')
        out.append('|---|---|')
        for k, v in ground['variants'].items():
            out.append(f"| {k} | {v['lod0']} / {v['lod1']} |")
        M['ground'] = ground['variants']
    # the browser
    rep = load(os.path.join(QA, 'browser', 'report.json'), {})
    if rep:
        g = rep.get('parts', {}).get('game', {})
        info = (g.get('loaded') or {}).get('info') or {}
        out.append('\n### In the game (Chromium + ANGLE SwiftShader: software rendering, not a GPU)\n')
        out.append(f"Loaded in **{(g.get('loaded') or {}).get('loadMs')} ms** in the page (wall clock incl. the page's own start: {g.get('wallLoadMs')} ms); "
                   f"{info.get('bytes', 0):,} bytes; **{info.get('materials')} materials**, **{info.get('textures')} textures** "
                   f"(~{info.get('gpuTextureMB')} MB GPU texture memory, uncompressed RGBA8 + mips estimate); {info.get('trees')} street trees "
                   f"({info.get('variantsUsed')} variants in use; species {info.get('speciesCount')}), {info.get('shrubs')} shrubs and perennials, "
                   f"{info.get('meadow')} lookout meadow plants.\n")
        out.append('| Same frame (camera recorded) | Draw calls authored / procedural | Triangles authored / procedural | Vegetation triangles (authored) |')
        out.append('|---|---|---|---|')
        for p in rep.get('pairs', []):
            a, b = p['authored'], p['procedural']
            out.append(f"| {p['name']} | {a['calls']} / {b['calls']} | {a['triangles']:,} / {b['triangles']:,} | {a.get('vegTris', 0):,} |")
        M['browser'] = {'loadMs': (g.get('loaded') or {}).get('loadMs'), 'info': info, 'pairs': rep.get('pairs', []), 'summary': rep.get('summary')}
        lawn = rep.get('lawn', [])
        if lawn:
            out.append('\n### The lawn repair: C (repaired) / B (first benchmark) / A (original procedural lawn), same frame\n')
            out.append('| View | Draw calls C / B / A | Triangles C / B / A | Blade triangles (C) | Blade tiles LOD0/1/2 | Clump-scale islands C / B / A | Mean deviation C / B / A |')
            out.append('|---|---|---|---|---|---|---|')
            for x in lawn:
                C, B, A = x['C'], x['B'], x['A']
                isl = ' / '.join(f"{y['metrics']['islands'] * 100:.1f} %" if y.get('metrics') else '–' for y in (C, B, A))
                dev = ' / '.join(f"{y['metrics']['meanDev'] * 100:.1f} %" if y.get('metrics') else '–' for y in (C, B, A))
                out.append(f"| {x['name']} | {C['calls']} / {B['calls']} / {A['calls']} | {C['triangles']:,} / {B['triangles']:,} / {A['triangles']:,} | {C.get('bladeTris', 0):,} | {'/'.join(str(t) for t in (C.get('bladeTiles') or []))} | {isl} | {dev} |")
            M['lawn'] = lawn
        lc = g.get('lawnChecks')
        if lc:
            out.append(f"\nLawn checks: coverage {lc['coverage']['tested']} lawn points, {lc['coverage']['missing']} without blades; {lc['hard']['bits']:,} blade sub-cells, "
                       f"{lc['hard']['bad']} over a hard surface; LOD drops of unfaded blades {lc['lod']['bad']}; tiling correlation at the 0.5 m period "
                       f"{lc['tiling']['periodX']['r']} / {lc['tiling']['periodZ']['r']} (an unrelated offset: {lc['tiling']['unrelated']['r']}).")
            M['lawnChecks'] = lc
        pk = rep.get('parts', {}).get('packageModels')
        if pk:
            out.append(f"\nOffline package with every model embedded (PLAYTEST_MODELS=1): {pk.get('bytes', 0):,} bytes; the vegetation loads from the embedded bytes with no network.")
    open(os.path.join(QA, 'measurements.md'), 'w').write('\n'.join(out) + '\n')
    json.dump(M, open(os.path.join(QA, 'measurements.json'), 'w'), indent=1, default=str)
    print('\n'.join(out))


if __name__ == '__main__':
    main()
