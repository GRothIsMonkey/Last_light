// Verify the portable file is an exact embedding of this checkout, with closed module imports.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const out=path.resolve(process.argv[2]),manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json'),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const html=fs.readFileSync(path.join(out,manifest.entry),'utf8');
assert.equal(hash(html),manifest.entrySHA256);
assert.equal(manifest.dirty,false,'Package must come from a committed clean tree');
const start=html.indexOf('modules={'),end=html.indexOf(',imports={}',start);
assert.ok(start>0&&end>start,'Embedded module map exists');
const modules=JSON.parse(html.slice(start+8,end));
for(const [file,expected] of Object.entries(manifest.sourceHashes))assert.equal(hash(fs.readFileSync(file)),expected,file+' source hash');
for(const [name,encoded] of Object.entries(modules)){
 let expected=fs.readFileSync('dist/'+name.slice('last-light/'.length),'utf8').replace(/(['"])\.\/([^'"]+\.js)\1/g,(_,q,f)=>q+'last-light/'+f+q);
 if(name==='last-light/creature.js')expected=expected.replace("new URL('./assets/creature/creature.glb',import.meta.url)",'new URL(globalThis.__LL_CREATURE_URL__)');
 const source=Buffer.from(encoded,'base64').toString('utf8');assert.equal(source,expected,name+' exact embedding');
 for(const m of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](last-light\/[^'"]+)['"]/g))assert.ok(modules[m[1]],name+' resolves '+m[1]);
}
assert.equal(Object.keys(modules).length,manifest.modules);
assert.ok(html.includes("type:'model/gltf-binary'"),'Legacy creature asset is embedded');
console.log(JSON.stringify({commit:manifest.commit,entry:manifest.entry,modules:manifest.modules,sourceFiles:Object.keys(manifest.sourceHashes).length,sourceHashesMatch:true,exactEmbedding:true,importsResolve:true,clean:true,entrySHA256:manifest.entrySHA256},null,2));
