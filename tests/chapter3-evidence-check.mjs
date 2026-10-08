// Verify that archived final QA describes the runtime in this checkout.
// Does not rerun gameplay or pretend that evidence validation is a playtest.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const sha = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = fs.readdirSync('dist').sort()
  .filter(name => fs.statSync(path.join('dist', name)).isFile())
  .map(name => 'dist/' + name);
const specs = [
  ['simulation', 'chapter3-astra-simulation/report.json', 551],
  ['restoration', 'chapter3-astra-regression/report.json', 13],
  ['art', 'chapter3-astra-art/report.json', null],
  ['walkthrough', 'chapter3-astra-walkthrough/chapter3-browser-report.json', 83],
  ['dev', 'chapter3-astra-dev/dev-chapters-browser-report.json', 142],
  ['captionWall', 'chapter3-astra-caption/report.json', 1],
];
const reports = {};
for (const [name, relative, passed] of specs) {
  const file = 'docs/qa/' + relative, report = JSON.parse(fs.readFileSync(file));
  assert.deepEqual(Object.keys(report.runtimeHashes).sort(), files, name + ': runtime manifest coverage');
  const differences=[];
  for (const runtime of files) {
    const current=sha(runtime), recorded=report.runtimeHashes[runtime];
    if(current===recorded) continue;
    // Preserve original evidence truthfully: these two runs precede only the caption-backing fix.
    // Every geometry/material/lighting file must still match exactly. Final browser runs test the fix.
    assert.ok(['art','restoration'].includes(name)&&runtime==='dist/captions.js'&&recorded==='f6046fac4026184397d6eb05e3efcdcf9eb12f42345099b79547783516daac06',name + ': unexplained runtime difference: ' + runtime);
    differences.push({file:runtime,recorded,current,reason:'Caption backing only; covered by final browser runs and the targeted rendered/unit checks.'});
  }
  if (passed !== null) assert.equal(report.passed, passed, name + ': completed checks');
  if (name !== 'simulation') assert.deepEqual(report.errors, [], name + ': no runtime/shader errors');
  for (const frame of report.frames || []) assert.ok(fs.existsSync(path.join(path.dirname(file), frame.name + '.jpg')), name + ': ' + frame.name);
  if (name === 'art') assert.equal(report.frames.length, 114);
  if (name === 'walkthrough') assert.deepEqual(report.audio, [], 'audio production remains deferred');
  reports[name] = {file, sha256: sha(file), passed: report.passed ?? null, recordedFrames: report.frames?.length ?? 0,differences};
}
const preservedAssets = {
  'assets/source/creature/smily_horror_monster.glb': '85c2969d61e1c0bcad4934be43a070be4d80384d6924455f509e11584def0529',
  'dist/assets/creature/creature.glb': 'e86b69df95ce1a96519f0eb720f3dc58cb15d07f3848e35c5f8891047add51b3',
};
for (const [file, hash] of Object.entries(preservedAssets)) assert.equal(sha(file), hash, file + ': immutable creature asset');
const evidence = {runtimeFilesVerified: files.length, reports, preservedAssets,
  note: 'Simulation, both full browser runs and the caption-wall regression match the final runtime. Art/restoration evidence predates only the documented caption-backing fix; all other files match. This validates archived evidence, not rendering speed or subjective visual quality.'};
fs.writeFileSync('docs/qa/chapter3-astra-evidence.json', JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
