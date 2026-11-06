import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root='docs/qa/chapter7-astra',read=p=>JSON.parse(fs.readFileSync(path.join(root,p)));
const art=read('reports/art-checks.json'),frames=read('frames/frames.json'),before=read('before/frames.json'),offline=read('reports/package-browser.json'),story=read('reports/story-audit.json'),sim=read('reports/simulation-recovered-summary.json');
const manifest=JSON.parse(fs.readFileSync('../release/playable/manifest.json'));
assert.equal(art.passed,19);assert.deepEqual(art.failed,[]);assert.equal(frames.frames.length,30);assert.deepEqual(frames.errors,[]);
assert.equal(offline.passed,9);assert.ok(!offline.failure);assert.deepEqual(offline.errors,[]);assert.deepEqual(offline.warnings,[]);assert.deepEqual(offline.httpRequests,[]);
assert.equal(manifest.entrySHA256,offline.htmlSHA256);assert.equal(story.identical_story_calls,652);assert.equal(story.exactOrderedSequenceIdentical,true);
for(const [file,hash]of Object.entries(art.runtimeHashes)){
 assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file+' final source');
 assert.equal(frames.runtimeHashes[file],hash,file+' final renders');
 const packaged=manifest.sourceHashes[file]??createHash('sha256').update(fs.readFileSync('../release/playable/'+path.basename(file))).digest('hex');
 assert.equal(packaged,hash,file+' offline package');
}
const rows=frames.frames.filter(f=>before.frames.some(b=>b.name===f.name)).map(f=>{const b=before.frames.find(b=>b.name===f.name);return {name:f.name,beforeCalls:b.calls,afterCalls:f.calls,beforeTriangles:b.triangles,afterTriangles:f.triangles};});
assert.equal(rows.length,21);
fs.writeFileSync(path.join(root,'reports/render-comparison.json'),JSON.stringify({renderer:'Chromium / ANGLE SwiftShader',viewport:[1440,900],quality:'Medium (default)',fpsNotMeasured:true,views:rows},null,2)+'\n');
const keep=['01-sams-room','09-old-mill-court','14-reveal-landing','x17-lange-loom','x23-pantry-head','22-struggle','26-final-image'];
const table=rows.filter(r=>keep.includes(r.name)).map(r=>`| ${r.name} | ${r.beforeCalls} → ${r.afterCalls} | ${r.beforeTriangles.toLocaleString()} → ${r.afterTriangles.toLocaleString()} |`).join('\n');
const report=`# Chapter Seven visual reconstruction — validation

Runtime source commit: \`${sim.recoveredIdenticalSourceCommit}\`. Accepted gameplay base: \`${story.baseline}\`. Subsequent release commits add only QA and documentation; the playable manifest records the final release commit. No changes were merged into main.

| Validation | Result | Scope |
|---|---|---|
| Continuous Chapter Seven simulation | 94 passed, 0 failed | Recovered recorded result on the identical source tree; 31 phases, 39.51 game minutes. |
| Chapter Seven DEV starts | 53 validated | Included in the simulation checks; not claimed as 53 completed browser starts. |
| Fresh focused art/regression checks | ${art.passed} passed, 0 failed | Seven earlier-chapter starts restore original geometry/materials; facial transforms restore; scenery clears; replay objects do not accumulate; no added reflection; original detection lights; rescue hand contact. |
| Final rendered views | ${frames.frames.length} captures, ${frames.errors.length} errors | Default Medium, 1440 × 900, real Chromium software rendering. |
| Matched accepted/final comparison | ${rows.length} pairs | Same scripted moments; portable review and repository index. |
| Delivered offline HTML | ${offline.passed} passed | Real Start and DEV controls; both photographs; earlier creature asset; hunter reveal; ending; no HTTP requests or JavaScript/shader errors. |
| Story and source audit | 652 ordered calls identical | Dialogue, narration, objectives, checkpoints and phase calls unchanged; only Chapter Seven runtime files changed. |

## Measured interaction and restoration results

- Rescue contact: ${art.metrics.grip.samples} hand samples; maximum ${(art.metrics.grip.maxMetres*100).toFixed(2)} cm and mean ${(art.metrics.grip.meanMetres*100).toFixed(2)} cm from Jamie’s wrist.
- Stealth lighting: ${art.metrics.stealthLight.samples} positions across both floors; maximum error ${art.metrics.stealthLight.maxError} against the accepted detection values.
- Repeated Chapter Seven starts: ${art.metrics.replayObjects.first} objects before and ${art.metrics.replayObjects.last} after.
- Recorded progression: no stealth failures; no Sam visible; no Jamie visible after the abduction; 757 drag frames with no foot misalignment. The accepted simulation harness used eight traversal fallback jumps.

## Source recovery provenance

The workspace rolled back after a completed 94-check run. Its full per-assertion JSON did not survive; \`reports/simulation-recovered-summary.json\` preserves the recorded totals and metrics and clearly identifies that limitation. The source was recovered exactly. Reconstructing the former commit’s bytes from the recovered tree, original parent, identity, message and timestamp produces the former tested SHA \`${sim.originalTestedCommit}\`. The proof is in \`reports/source-equivalence.json\`. The fresh 19-check report and final capture/package reports retain their complete records.

A later workspace rollback also removed the first release-record commit (a05fa59b65cf46610e75fc494aacf0b99a0e402b). The complete nine-check offline JSON and review UI totals were recovered from the recorded successful execution; their screenshots were not retained. The rebuilt playable has exactly the same SHA-256 as the tested HTML. This recovery changes release documentation, not the game.

Every runtime hash in the fresh regression report matches the final captures and offline package. Offline HTML SHA-256: \`${offline.htmlSHA256}\`.

## Captured rendering cost

These counts describe individual views. They are not FPS measurements or a hardware performance certification. Added character and room detail can increase geometry; local culling and static batching reduce work in other views.

| View | Draw calls, accepted → final | Triangles, accepted → final |
|---|---:|---:|
${table}

## What remains unverified or unfinished

The full input-driven browser walkthrough was attempted but did not complete within this environment’s 8 GB memory limit. It is **not** counted as a passed test. The 53 DEV validations above are simulation validations. Completed final capture and offline runs reported no JavaScript errors; this does not establish that every possible browser route is error-free.

Real-GPU FPS, mobile-browser behavior and an audio-enabled human playthrough remain unverified. The offline check initializes AudioContext and then mutes the game; it is not a listening review. The cast and hunter remain procedural and visibly stylized. A final authored hunter model and animation set, recorded voice performances, final voice synchronization and the final audio mix remain future production work. This visual pass does not claim those assets exist.

## Files

- \`index.html\`: 21-pair visual review using adjacent image folders.
- \`frames/frames.json\`: all 30 final views with source hashes and error list.
- \`reports/art-checks.json\`: complete fresh focused check results.
- \`reports/package-browser.json\`: complete offline browser result and HTML hash.
- \`reports/story-audit.json\`, \`source-equivalence.json\`, \`simulation-recovered-summary.json\`, \`runtime-sha256.json\`, \`render-comparison.json\`: audit and provenance records.
`;
fs.writeFileSync(path.join(root,'TEST_REPORT.md'),report);
console.log(JSON.stringify({sourceHashesMatched:Object.keys(art.runtimeHashes).length,art:art.passed,simulation:sim.passed,frames:frames.frames.length,comparisonPairs:rows.length,offline:offline.passed,htmlSHA256:offline.htmlSHA256}));
