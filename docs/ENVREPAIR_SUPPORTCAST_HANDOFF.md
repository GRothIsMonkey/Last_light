# Handoff to Astra — environment repairs (`?envrepair`) and supporting cast (`?supportcast`)

For merging into the combined Prologue build that carries `?player1b&friends1b`. Everything here is opt-in, Prologue-only and
independent of the four boys. **Do not overwrite your friend controllers with anything from this branch**: this branch never
modifies `friends.js`, `cast.js`, `rig.js`, `faces.js`, `astra-anatomy.js` or any boy's asset (the suite checks), and your
`player-1b.js` is not on this branch at all.

## 1. Commits

| | |
|---|---|
| Starting point | `claude/prologue-neighborhood-details-benchmark` at `716fc6bfacae1166f45826905475b7cb1d2409e0` (the six benchmarks) |
| This branch | `claude/prologue-environment-repair-supporting-cast`; final commit in the report's §15 |
| Your 1B branch | `codex/astra-phase1b-protagonist-animation` at `66e3f4bd…` branched from the same `716fc6b` but **removed** the six benchmarks' code and assets. This branch needs them: rebase your branch's additions onto it, or bring the six benchmarks back first |

## 2. Files

**Added (self-contained; copy as they are):**
- `dist/supportcast.js` — the supporting-cast runtime (Jamie's mother, the hoop kid)
- `dist/envrepair.js` — the environment repairs runtime
- `dist/assets/chr/chr.jamie-mother.glb`, `dist/assets/chr/chr.hoop-kid.glb`, `dist/assets/envrepair/envrepair.kit.glb`
- `assets/source/chr/jamie-mother/`, `assets/source/chr/hoop-kid/`, `assets/source/envrepair/` (editable .blend, textures, stats, provenance)
- `tools/blender/supportcast/*`, `tools/blender/envrepair/build_envrepair_kit.py`
- `tests/envrepair-supportcast-browser.mjs` (the suite), `tests/envrepair-supportcast-captures.mjs` (pairs and recordings),
  `tests/envrepair-supportcast-perf.mjs` (cost), `tests/envrepair-audit-views.mjs` (the consistency audit's contact sheets)
- `tools/review/envrepair_supportcast_gallery.py` (the review gallery: `docs/qa/envrepair-supportcast/index.html`)
- `docs/ENVREPAIR_SUPPORTCAST_REPORT.md`, this file, `docs/art/JAMIE-MOTHER-IDENTITY.md`, `docs/qa/envrepair-supportcast/`

**Modified (small, additive hooks; every line below is inert without its flag):**

| File | Change | Lines |
|---|---|---|
| `dist/game.js` | `let supportCast=null;` after `createAmbient(...)`; in `update()` after `ambient.update(...)`: `if(supportCast)supportCast.update(dt,ctx);`; the `ENVREPAIR_FLAG` constant, `...(ENVREPAIR_FLAG?{envrepair:true}:{})` in `worldOpts` and `ENVREPAIR_FLAG` in the `buildWorld` condition; two guarded dynamic imports next to the details benchmark's (`envrepair.js`, `supportcast.js`) with their Prologue-only rules | ~18 |
| `dist/ambient.js` | one getter on the returned object: `get hoopKid(){return {kid,ball:ballMesh,ring,ringY};}` (read-only; nothing else uses it) | 1 |
| `dist/asset-library.js` | three `ASSETS` entries: `envrepair.kit`, `chr.jamie-mother`, `chr.hoop-kid` | 6 |
| `dist/world.js` | `opts.envrepair` → `W.er` + `W.erZone` (like `opts.details`); `'er:'` added to the shadow-proxy zone prefixes; `er:W.er||null` in the returned world | 9 |
| `dist/creek.js` | records for the creek's brush, reeds, ground patches, algae and out-of-scope trees, each guarded by `W.er` (no random draw moved: the same street) | ~10 |
| `dist/vegetation-assets.js` | `export` added to `depthMaterial`, `variantsOf`, `Field` (no behaviour change) | 3 |

## 3. Flags

- `?envrepair` — the repairs. Its chain-link, play-equipment and contact-shadow parts sit on `?streetprops` and `?details`;
  the creek's plants extend `?vegetation`'s library. Alone it repairs only the creek's ground patches and says so in its label.
- `?supportcast` — Jamie's mother and the hoop kid. Works with or without the six benchmarks.
- Full review build: `?bikes&houses&vegetation&pavement&streetprops&details&envrepair&supportcast`; after your work:
  `…&player1b&friends1b`. **Not tested with `?friends1b`** (it did not exist when this was built).
- Keys: `'` (Quote) repaired/as-before; `;` (Semicolon) authored/original cast. Checked against every binding in this branch.

## 4. How the supporting cast attaches (what `friends1b` must keep)

`supportcast.js` reads, every frame after `friends.update` and `ambient.update`:

- `friends.mom` — `{person:{group}, mode, t, pd, plat, ppsi}` from `createFriends` (unchanged). It hides the meshes **inside**
  `mom.person.group` (not the group: the controller keeps toggling the group's visibility) and places the authored root on the
  group's own world transform. **If `friends1b` rebuilds `createFriends`, keep `mom` on its return object with these fields**
  and keep `updateMom` as it is (the authored performance is timed to its `mode`/`t`).
- `friends.list[0]` — Jamie: `{mode, person:{group}, bike:{group}}` for her gaze. With `friends1b`'s authored Jamie, point her
  gaze at your Jamie's head bone instead (one line: `jamieHead()` in `supportcast.js`).
- `ambient.hoopKid` — `{kid:{person:{group},d,phase,t}, ball}` (the getter above).

Nothing in `supportcast.js` writes to a controller, plays a sound or shows a caption.

## 5. Assets and dependencies

- Three GLBs (8.4 MB, 3.8 MB, 1.5 MB), loaded through `asset-library.js` `instantiate()`/`loadAsset()` (three.js r160 GLTFLoader
  as vendored). No other dependency. The offline package embeds them with `PLAYTEST_MODELS=1` (checked).
- Bone names follow your Phase 1B rig (`root, hips, spine_01, spine_02, chest, neck, head, clavicle_*, upperarm_*, lowerarm_*,
  forearm_twist_*, hand_*, thumb1-3_*, index1-3_*, middle1-3_*, ring1-3_*, pinky1-3_*, thigh_*, calf_*, foot_*, toe_*`) plus
  `jaw`, `eye_l/r`, `phys_ponytail_01-03`, `socket_grip_*`, `socket_head_top`, `socket_chest`. Face keys are the pipeline's
  ARKit names (30), so `asset-library.js faceWeights()` drives them.
- `rig.human.adult` (mother) is her own skeleton (1.64 m), **not** the child `BODY` table: `asset-pose.js drivePose` is not used.

## 6. Known compatibility concerns

1. Your 1B branch removed the six benchmarks; `envrepair.js` waits for `window.__streetprops`/`__details`/`__vegetation` only
   when their flags are on, so it degrades to "needs ?…" notes rather than failing.
2. If `friends1b` replaces `CAST.mom`'s procedural person by another object, `supportcast.js` must hide that object's meshes
   instead (`mother()` → `orig`).
3. Both modules add a DEV label stacked under the others (`*-benchmark-label`); add yours to their `place()` lists if needed.
4. The mother's gaze target is the procedural Jamie's group position + 1.32 m (foot) / 1.45 m (bike).
5. `asset-library.js` turns frustum culling off for every skinned mesh, yours included: the supporting cast is drawn whenever
   its controller shows it, on screen or not (10 draws each; the report's §12). A cull sphere in `supportcast.js` would fix it
   for these two without touching the shared library.
6. `asset-library.js` identifies a GLB by the **first** object it meets tagged `ll_asset_id`, and the glTF exporter writes the
   scene's custom properties first. A scene tagged with the id alone reads as version `undefined` (the mother's did; fixed by
   giving the scene the rig's full tag set). Keep a tagged scene's tags complete, or leave the scene untagged.

## 7. Tests to rerun after integration

```bash
node tests/envrepair-supportcast-browser.mjs
```

```bash
node tests/details-browser.mjs docs/qa/details/browser
```

```bash
node tests/streetprops-browser.mjs
```

```bash
node tests/verify.mjs
```

Then your own `player1b`/`friends1b` suites with `&envrepair&supportcast` added, and `node tests/envrepair-supportcast-captures.mjs mom`
to look at the mother beside your Jamie.
