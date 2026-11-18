// Last Light asset gate for Blender exports: the Khronos glTF Validator plus the game's own rules.
// usage: node tools/assets/validate-glb.mjs <file.glb> [--profile chr.child|chr.adult|tst|bike|house] [--json out.json]
// The Khronos validator (npm `gltf-validator`, Apache-2.0) is a development tool and is never shipped with the game.
// Point GLTF_VALIDATOR_DIR at a folder whose node_modules has it (`npm i gltf-validator` anywhere); without it, this
// script still runs the Last Light checks and says plainly that the Khronos validation did not run.
import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';

const args=process.argv.slice(2),file=args.find(a=>!a.startsWith('--')),opt=k=>{const i=args.indexOf('--'+k);return i>=0?args[i+1]:null;};
if(!file){console.error('usage: node tools/assets/validate-glb.mjs <file.glb> [--profile chr.child|tst] [--json out.json]');process.exit(2);}
const profileName=opt('profile')||'tst',bytes=fs.readFileSync(file);

// Rig contract (docs/art/BLENDER-PIPELINE.md §4). Required for every rig.human.child / rig.human.adult file.
const BODY_BONES=['root','hips','spine_01','spine_02','chest','neck','head','jaw','eye_l','eye_r','clavicle_l','clavicle_r','upperarm_l','upperarm_r','lowerarm_l','lowerarm_r','hand_l','hand_r','thigh_l','thigh_r','calf_l','calf_r','foot_l','foot_r','ball_l','ball_r'];
const FINGERS=['thumb','index','middle','ring','pinky'].flatMap(f=>[1,2,3].flatMap(k=>['l','r'].map(s=>`${f}_0${k}_${s}`)));
const SOCKETS=['socket_grip_l','socket_grip_r','socket_head_top','socket_cap','socket_chest','socket_back','socket_hip_l','socket_hip_r','socket_eye_cam'];
const FACE_MIN=['jawOpen','mouthSmileLeft','mouthSmileRight','browInnerUp','eyeBlinkLeft','eyeBlinkRight'];
const PROFILES={
 tst:{tris:20000,bones:80,materials:10,texMax:1024,fingers:false,face:FACE_MIN,clips:['idle_breathe','walk_normal']},
 'chr.child':{tris:45000,bones:80,materials:5,texMax:2048,fingers:true,face:[...FACE_MIN,'browDownLeft','browDownRight','mouthFrownLeft','mouthFrownRight','mouthPucker','mouthFunnel','mouthPressLeft','mouthPressRight','eyeSquintLeft','eyeSquintRight','cheekSquintLeft','cheekSquintRight','noseSneerLeft','noseSneerRight','mouthStretchLeft','mouthStretchRight','mouthClose'],clips:[]},
 'chr.adult':{tris:40000,bones:80,materials:5,texMax:2048,fingers:true,face:FACE_MIN,clips:[]},
 // hero bicycles (Phase 1 benchmark): no skin; moving parts are separate nodes tagged extras.ll_node / ll_lod.
 // Budgets (Asset plan 9): LOD0 15-20k (warn above 20k, error above 24k), LOD1 ~5k, LOD2 ~1k; <= 4 materials.
 bike:{bike:true,tris:[24000,8000,3000],warnTris:[20000,6000,1500],materials:4,texMax:2048,face:[],clips:[]},
 // Prologue house benchmark (house kit): one file, many houses; a node per house (extras.ll_house, ll_lot) with its LOD
 // meshes (extras.ll_lod 0-2, ll_part). Budgets per house (Asset plan 9): story LOD0 20-35k, background 6-10k; LOD1 ~2-8k;
 // LOD2 ~2k. One shared material library, textures <= 1024 (shared by every house).
 // (realism pass, v2: the baked-shading grid adds ~1-2k triangles to a house's LOD0; background houses warn above the
 // plan's 10k and fail above 12k)
 house:{house:true,tris:{story:[35000,8000,2000],ordinary:[12000,5000,1200]},warnTris:{story:[35000,8000,2000],ordinary:[10000,4000,1000]},materials:12,texMax:1024,face:[],clips:[]},
};
const P=PROFILES[profileName];if(!P){console.error('unknown profile '+profileName);process.exit(2);}
const ALLOWED_EXT=new Set(['KHR_materials_emissive_strength','KHR_texture_transform','KHR_materials_clearcoat','KHR_materials_sheen','KHR_materials_specular','KHR_materials_ior','KHR_mesh_quantization']);// no Draco/KTX2/meshopt until their decoders are vendored and packaged

const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),errors=[],warnings=[],info={};
if(dv.getUint32(0,true)!==0x46546C67){console.error('not a GLB');process.exit(1);}
const jl=dv.getUint32(12,true),json=JSON.parse(new TextDecoder().decode(bytes.subarray(20,20+jl)));
const nodes=json.nodes||[],names=nodes.map(n=>n.name);
info.file=path.basename(file);info.bytes=bytes.length;info.sha256=createHash('sha256').update(bytes).digest('hex');info.generator=json.asset?.generator;info.profile=profileName;
// identity
const rootExtras=nodes.find(n=>n.extras?.ll_asset_id)?.extras;info.assetId=rootExtras?.ll_asset_id||null;info.assetVersion=rootExtras?.ll_asset_version??null;
if(!rootExtras)errors.push('no node carries extras.ll_asset_id (set custom property ll_asset_id on the armature)');
else if(!path.basename(file).startsWith(rootExtras.ll_asset_id))errors.push(`file name ${path.basename(file)} does not start with ll_asset_id ${rootExtras.ll_asset_id}`);
if(!rootExtras?.ll_license)errors.push('no extras.ll_license on the asset root');
// external references and extensions
for(const b of json.buffers||[])if(b.uri)errors.push('external buffer uri '+b.uri);
for(const im of json.images||[])if(im.uri)errors.push('external image uri '+im.uri);
for(const e of json.extensionsUsed||[])if(!ALLOWED_EXT.has(e))errors.push('extension not supported by the game build: '+e);
// geometry
let tris=0,verts=0,morphs=new Set(),skinned=0,unskinned=[];
const acc=i=>json.accessors[i];
for(const [ni,n] of nodes.entries()){if(n.mesh===undefined)continue;const m=json.meshes[n.mesh];if(n.skin===undefined)unskinned.push(n.name);else skinned++;
 for(const p of m.primitives){const c=p.indices!==undefined?acc(p.indices).count:acc(p.attributes.POSITION).count;if((p.mode??4)!==4)errors.push(`${m.name}: primitive mode ${p.mode} (triangles only)`);tris+=c/3;verts+=acc(p.attributes.POSITION).count;
  if(n.skin!==undefined&&(p.attributes.JOINTS_1||p.attributes.WEIGHTS_1))errors.push(`${m.name}: more than 4 influences per vertex`);
  if(p.material===undefined)errors.push(`${m.name}: primitive without a material`);
  const mat=json.materials?.[p.material];if(mat?.normalTexture&&!p.attributes.TANGENT){if(P.house)info.noTangentPrimitives=(info.noTangentPrimitives||0)+1;else warnings.push(`${m.name}: normal map without exported tangents (enable Tangents)`);}}
 for(const t of m.extras?.targetNames||[])morphs.add(t);}
if(info.noTangentPrimitives)warnings.push(`${info.noTangentPrimitives} normal-mapped primitives without exported tangents (house kit: deliberate; world-planar UVs, three.js derives the tangent frame per pixel)`);
info.triangles=tris;info.vertices=verts;info.skinnedMeshes=skinned;info.morphTargets=[...morphs];
if(!P.bike&&!P.house&&tris>P.tris)errors.push(`triangles ${tris} over the ${profileName} budget ${P.tris}`);
if(P.house){const houses=nodes.map((n,i)=>[n,i]).filter(([n])=>n.extras?.ll_house);info.houses={};
 const triOf=n=>json.meshes[n.mesh].primitives.reduce((a,p)=>a+(p.indices!==undefined?acc(p.indices).count:acc(p.attributes.POSITION).count)/3,0);
 if(!houses.length)errors.push('no house nodes (extras.ll_house)');
 for(const [h] of houses){const role=String(h.extras.ll_role||'ordinary').startsWith('story')?'story':'ordinary',per=[0,0,0],parts=new Set();let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(const c of h.children||[]){const n=nodes[c];if(n.mesh===undefined)continue;const l=n.extras?.ll_lod;if(l===undefined){errors.push(`${n.name}: mesh without extras.ll_lod`);continue;}per[l]+=triOf(n);parts.add(n.extras?.ll_part+':'+l);
   if(l===0&&n.extras?.ll_part==='house')for(const p of json.meshes[n.mesh].primitives){const a=acc(p.attributes.POSITION);for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],a.min[k]);mx[k]=Math.max(mx[k],a.max[k]);}}}
  info.houses[h.extras.ll_house]={lot:h.extras.ll_lot,role,trianglesPerLOD:per,extents:{min:mn.map(v=>+v.toFixed(2)),max:mx.map(v=>+v.toFixed(2))}};
  for(let l=0;l<3;l++){if(!parts.has('house:'+l))errors.push(`${h.extras.ll_house}: no LOD${l} mesh`);if(per[l]>P.tris[role][l])errors.push(`${h.extras.ll_house} LOD${l} ${per[l]} triangles over ${P.tris[role][l]}`);else if(per[l]>P.warnTris[role][l])warnings.push(`${h.extras.ll_house} LOD${l} ${per[l]} triangles above the ${P.warnTris[role][l]} target`);}
  if(!h.extras.ll_lot)errors.push(`${h.extras.ll_house}: no extras.ll_lot`);
  if(mn[1]<-1||mx[1]>14)errors.push(`${h.extras.ll_house}: height range ${mn[1].toFixed(2)}..${mx[1].toFixed(2)} m (metres, +Y up, ground at 0?)`);
  if(!(mx[2]>-mn[2]))errors.push(`${h.extras.ll_house}: the front (porch, door) is not toward +Z (house-local frame: +z toward the street)`);}
 info.trianglesAllLOD0=Object.values(info.houses).reduce((a,h)=>a+h.trianglesPerLOD[0],0);}
if(!P.bike&&!P.house&&unskinned.length)warnings.push('meshes not skinned (they will not follow the skeleton): '+unskinned.join(', '));
// bicycles: per-LOD budgets, the moving nodes the game drives, the anchor record, orientation and ground contact
if(P.bike){const per=[0,0,0],nodesBy={0:new Set(),1:new Set(),2:new Set()};
 for(const n of nodes){if(n.mesh===undefined)continue;const lod=n.extras?.ll_lod??0;const t=json.meshes[n.mesh].primitives.reduce((a,p)=>a+(p.indices!==undefined?acc(p.indices).count:acc(p.attributes.POSITION).count)/3,0);per[lod]+=t;if(n.extras?.ll_node)nodesBy[lod].add(n.extras.ll_node);else errors.push(`mesh node ${n.name} has no extras.ll_node`);}
 info.trianglesPerLOD=per;
 for(let l=0;l<3;l++){if(per[l]>P.tris[l])errors.push(`LOD${l} ${per[l]} triangles over ${P.tris[l]}`);else if(per[l]>P.warnTris[l])warnings.push(`LOD${l} ${per[l]} triangles above the ${P.warnTris[l]} target`);}
 const need=['frame','steer','wheel_front','wheel_rear','crank','pedal_l','pedal_r','kickstand'];
 for(let l=0;l<3;l++){const miss=need.filter(k=>!nodesBy[l].has(k)&&!(l===2&&k==='chain'));if(miss.length)errors.push(`LOD${l} missing moving parts: ${miss.join(', ')}`);}
 info.nodes=[...nodesBy[0]];
 if(rootExtras?.ll_kind!=='bike')errors.push('extras.ll_kind must be "bike"');
 let anchors=null;try{anchors=JSON.parse(rootExtras?.ll_anchors||'null');}catch{}
 if(!anchors)errors.push('no extras.ll_anchors (the rig.js anchors the bike was built on)');else info.anchors={wheelR:anchors.wheelR,bb:anchors.bb,axleRear:anchors.axleRear,axleFront:anchors.axleFront,pivot:anchors.pivot,saddle:anchors.saddle,grip:anchors.grip};
 // geometry extents in the file (glTF frame: front +Z, the game turns it): the front wheel must be at +Z, tyres on y=0
 const box=(lod,name)=>{let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const n of nodes){if(n.mesh===undefined||(n.extras?.ll_lod??0)!==lod||(name&&n.extras?.ll_node!==name))continue;for(const p of json.meshes[n.mesh].primitives){const a=acc(p.attributes.POSITION);for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],a.min[k]);mx[k]=Math.max(mx[k],a.max[k]);}}}return {mn,mx};};
 const fw=box(0,'wheel_front'),rw=box(0,'wheel_rear'),all=box(0,null);
 info.extents={min:all.mn.map(v=>+v.toFixed(3)),max:all.mx.map(v=>+v.toFixed(3))};
 const fz=(fw.mn[2]+fw.mx[2])/2,rz=(rw.mn[2]+rw.mx[2])/2;info.frontWheelZ=+fz.toFixed(3);info.rearWheelZ=+rz.toFixed(3);
 if(!(fz>rz))errors.push('the front wheel is not toward +Z in the glTF file (model the bike facing Blender -Y)');
 if(Math.abs(fw.mn[1])>.004||Math.abs(rw.mn[1])>.004)errors.push(`tyres do not touch y=0 (front ${fw.mn[1].toFixed(4)}, rear ${rw.mn[1].toFixed(4)})`);
 if(anchors){const R=(fw.mx[1]-fw.mn[1])/2;info.frontWheelRadius=+R.toFixed(4);if(Math.abs(R-anchors.wheelR)>.006)errors.push(`front wheel radius ${R.toFixed(3)} differs from rig.js ${anchors.wheelR}`);}
 const rx=(all.mn[0]+all.mx[0]);info.lateralCentre=+(rx/2).toFixed(3);
}
// skeleton
const skin=(P.bike||P.house)?null:json.skins?.[0];if(!skin&&!P.bike&&!P.house)errors.push('no skin');if((json.skins||[]).length>1)warnings.push(`${json.skins.length} skins (one per character is expected)`);
const joints=skin?skin.joints.map(i=>names[i]):[];info.joints=joints.length;
const need=(P.bike||P.house)?[]:[...BODY_BONES,...SOCKETS,...(P.fingers?FINGERS:[])];const missing=need.filter(b=>!names.includes(b));if(missing.length)errors.push('missing bones/sockets: '+missing.join(', '));
if(joints.length>P.bones)errors.push(`joints ${joints.length} over ${P.bones}`);
const badName=joints.filter(n=>!/^[a-z][a-z0-9_]*$/.test(n));if(badName.length)errors.push('bone names must be lower_snake_case: '+badName.join(', '));
// scale and orientation: the head must be about 1.2–2.0 m up (+Y) and the face toward +Z (glTF forward)
const world=new Map();const mul=(a,b)=>{const o=new Array(16).fill(0);for(let r=0;r<4;r++)for(let c=0;c<4;c++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
const local=n=>{if(n.matrix)return n.matrix;const [x,y,z,w]=n.rotation||[0,0,0,1],[sx,sy,sz]=n.scale||[1,1,1],[tx,ty,tz]=n.translation||[0,0,0];
 return [(1-2*(y*y+z*z))*sx,2*(x*y+z*w)*sx,2*(x*z-y*w)*sx,0,2*(x*y-z*w)*sy,(1-2*(x*x+z*z))*sy,2*(y*z+x*w)*sy,0,2*(x*z+y*w)*sz,2*(y*z-x*w)*sz,(1-2*(x*x+y*y))*sz,0,tx,ty,tz,1];};
const walk=(i,parent)=>{const m=mul(parent,local(nodes[i]));world.set(i,m);for(const c of nodes[i].children||[])walk(c,m);};
for(const r of json.scenes[json.scene??0].nodes)walk(r,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const pos=n=>{const i=names.indexOf(n);const m=world.get(i);return m?[m[12],m[13],m[14]]:null;};
const head=pos('head'),top=pos('socket_head_top'),eye=pos('socket_eye_cam'),hl=pos('hand_l'),fl=pos('foot_l');
if(top){info.crownHeight=+top[1].toFixed(3);if(top[1]<1.0||top[1]>2.1)errors.push(`crown at ${top[1].toFixed(3)} m: scale must be metres, +Y up`);}
if(eye&&head){info.faceForward=eye[2]>head[2]?'+Z':'-Z';if(eye[2]<=head[2])errors.push('face points to -Z in the glTF file; model the figure facing Blender -Y (Front view looks at the face)');}
if(hl){info.leftHandX=+hl[0].toFixed(3);if(hl[0]<0)errors.push('hand_l is on -X in glTF: the figure\'s left must be Blender +X');}
if(fl&&fl[1]>.2)errors.push('foot_l is above 0.2 m: feet must stand on the origin plane');
// materials and textures
const mats=json.materials||[];info.materials=mats.map(m=>m.name);if(mats.length>P.materials)(profileName==='tst'?errors:errors).push(`${mats.length} materials over ${P.materials}`);
for(const m of mats)if(!/^mat\.[a-z0-9.-]+\/[a-z0-9.:-]+$/i.test(m.name||''))warnings.push(`material name "${m.name}" does not follow mat.<family>/<asset>[.<part>]`);
const usedAs=new Map();const mark=(ref,kind)=>{if(!ref)return;const src=json.textures[ref.index].source;(usedAs.get(src)||usedAs.set(src,new Set()).get(src)).add(kind);};
for(const m of mats){const p=m.pbrMetallicRoughness||{};mark(p.baseColorTexture,'color');mark(p.metallicRoughnessTexture,'data');mark(m.normalTexture,'normal');mark(m.occlusionTexture,'data');mark(m.emissiveTexture,'color');}
info.textures=[];
for(const [i,im] of (json.images||[]).entries()){const bv=json.bufferViews[im.bufferView],b=bytes.subarray(20+jl+8+(bv.byteOffset||0),20+jl+8+(bv.byteOffset||0)+bv.byteLength);let w=0,h=0;
 if(im.mimeType==='image/png'){w=new DataView(b.buffer,b.byteOffset).getUint32(16);h=new DataView(b.buffer,b.byteOffset).getUint32(20);}
 else if(im.mimeType==='image/jpeg'){let o=2;while(o<b.length){if(b[o]!==0xFF){o++;continue;}const mk=b[o+1];if(mk>=0xC0&&mk<=0xC3){h=(b[o+5]<<8)|b[o+6];w=(b[o+7]<<8)|b[o+8];break;}o+=2+((b[o+2]<<8)|b[o+3]);}}
 const kinds=[...(usedAs.get(i)||[])];info.textures.push({name:im.name,mime:im.mimeType,w,h,bytes:bv.byteLength,use:kinds});
 if(w>P.texMax||h>P.texMax)errors.push(`${im.name}: ${w}×${h} over ${P.texMax}`);if(w&(w-1)||h&(h-1))errors.push(`${im.name}: ${w}×${h} not a power of two`);
 if(kinds.includes('normal')&&im.mimeType==='image/jpeg')warnings.push(`${im.name}: normal map stored as JPEG (use PNG; JPEG blocks show in the lighting)`);}
info.textureBytes=info.textures.reduce((a,t)=>a+t.bytes,0);info.gpuTextureMBEstimate=+(info.textures.reduce((a,t)=>a+t.w*t.h*4*4/3,0)/1048576).toFixed(1);
// face
const faceMissing=P.face.filter(n=>!morphs.has(n));if(faceMissing.length)errors.push('missing face shape keys: '+faceMissing.join(', '));
// clips
const clips=(json.animations||[]).map(a=>({name:a.name,channels:a.channels.length,paths:[...new Set(a.channels.map(c=>c.target.path))]}));info.clips=clips;
for(const c of P.clips)if(!clips.some(k=>k.name===c))errors.push('missing clip '+c);
for(const c of clips)if(!/^[a-z0-9]+(_[a-z0-9]+)*$/.test(c.name))warnings.push(`clip name "${c.name}" is not <family>_<variant> lower case`);
for(const a of json.animations||[])for(const s of a.samplers)if(s.interpolation==='CUBICSPLINE')warnings.push(`${a.name}: CUBICSPLINE interpolation (prefer sampled LINEAR)`);

// Khronos validator
let khronos={ran:false};
try{const dirs=[process.env.GLTF_VALIDATOR_DIR,process.cwd()].filter(Boolean);let v=null;for(const d of dirs){try{v=createRequire(path.join(path.resolve(d),'x.js'))('gltf-validator');break;}catch{}}
 if(v){const r=await v.validateBytes(new Uint8Array(bytes),{maxIssues:200});khronos={ran:true,version:r.validatorVersion,errors:r.issues.numErrors,warnings:r.issues.numWarnings,infos:r.issues.numInfos,hints:r.issues.numHints,messages:r.issues.messages.filter(m=>m.severity<=1).map(m=>`${m.severity===0?'E':'W'} ${m.code} ${m.pointer||''} ${m.message}`)};
  if(r.issues.numErrors)errors.push(`Khronos glTF Validator: ${r.issues.numErrors} error(s)`);}
}catch(e){khronos={ran:false,error:String(e)};}
if(!khronos.ran)warnings.push('Khronos glTF Validator did not run (npm i gltf-validator; set GLTF_VALIDATOR_DIR)');
const report={ok:errors.length===0,errors,warnings,info,khronos};
if(opt('json'))fs.writeFileSync(opt('json'),JSON.stringify(report,null,1)+'\n');
console.log(JSON.stringify(report,null,1));process.exit(errors.length?1:0);
