# Chapter Five memory evidence

Chromium (SwiftShader), nothing else running, 1280×720.

- `probe-starting-commit.log`: the starting commit `c9647772`.
- `probe-before-fixes.log`: this branch before the memory fixes.
- `probe-after-fixes.log`: this branch after them.

For each step the probe records the following:
- the JS heap after a forced GC;
- three.js `renderer.info` (programs, geometries, textures);
- the lights in the scene;
- the RSS of the renderer and GPU processes, now and at the peak since the previous step (sampled every 500 ms).

The starting-commit probe used an earlier, simpler version of `memprobe.mjs`: JS heap and renderer RSS only. Playwright is loaded from `/opt/node22/lib/node_modules` (adjust for your machine).

Each step jumps to a QA section and renders 3 s. Run it from the repository root:

    node docs/qa/chapter5-pine-ridge/memory/memprobe.mjs dist <section,section,...>

`heapscan.mjs` and `memzone.mjs` run in the simulation harness:

    QUICK=1 ONLY=script SCRIPT=<file> node --expose-gc tests/verify.mjs

They report the heap after GC, and the merged vertex bytes by zone.
