import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
const repo=path.resolve(process.env.RENDER_REPO||'.'),file=path.join(repo,'tests/verify.mjs'),base=path.dirname(file);
let source=fs.readFileSync(file,'utf8');
source=source.replace('globalThis.harness={','globalThis.harness={refreshReviewCamera(){sky.position.copy(camera.position);cullCache.key="";cullCache.x=Infinity;cullZones();chapter8?.SC?.STREET?.town?.update(0,{camera});},');
source=source.replace(/globalThis\.FakeRenderer=class\{[^\n]+/,`await (await import(${JSON.stringify(new URL('./webgl-setup.mjs',import.meta.url).href)})).setup(THREE,canvas);`);
source=source.replaceAll('import.meta.url',JSON.stringify(pathToFileURL(file).href));
source=source.replace(/(['"])(\.\.?\/[^'"\n]+\.m?js)\1/g,(_,q,p)=>JSON.stringify(pathToFileURL(path.resolve(base,p)).href));
process.env.ONLY='script';process.env.SCRIPT||=fileURLToPath(new URL('./webgl-captures.mjs',import.meta.url));
try{await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));}
catch(e){console.error(String(e.message).slice(0,6000));console.error((e.stack||'').split('\n').filter(l=>!l.includes('data:text')).slice(1,6).join('\n'));process.exit(1);}
