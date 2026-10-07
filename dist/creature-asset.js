// A small glTF 2.0 (.glb) reader for the drain creature (assets/creature/creature.glb), covering exactly what that
// asset uses: one skinned triangle mesh (positions, normals, tangents, two UV sets, joints, weights, indices), one
// skin, a node hierarchy (matrices or translation/rotation/scale), one material (base colour, occlusion/roughness/
// metalness, normal map) and linear animation channels. It throws on anything else rather than guessing.
// Textures are decoded only where a browser can decode images (createImageBitmap); without that (the simulation)
// the geometry, skeleton and animation still load and the material is untextured.
import * as THREE from './three.module.js';

const COMPONENT={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};
const SIZE={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};

// GLB container: header, JSON chunk, BIN chunk.
export function readGLB(buffer){
 const dv=new DataView(buffer);if(dv.getUint32(0,true)!==0x46546C67)throw new Error('not a GLB');if(dv.getUint32(4,true)!==2)throw new Error('GLB version '+dv.getUint32(4,true));
 let o=12,json=null,bin=null;while(o<dv.byteLength){const len=dv.getUint32(o,true),type=dv.getUint32(o+4,true);o+=8;
  if(type===0x4E4F534A)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,o,len)));else if(type===0x004E4942)bin=new Uint8Array(buffer,o,len);o+=len;}
 if(!json||!bin)throw new Error('GLB without JSON or BIN chunk');return {json,bin};}

function accessor(json,bin,i){const a=json.accessors[i],bv=json.bufferViews[a.bufferView],C=COMPONENT[a.componentType],n=SIZE[a.type];if(!C||!n)throw new Error('accessor type '+a.type+'/'+a.componentType);
 if(a.sparse)throw new Error('sparse accessors not supported');
 const start=bin.byteOffset+(bv.byteOffset||0)+(a.byteOffset||0),stride=bv.byteStride||0,el=n*C.BYTES_PER_ELEMENT;
 let arr;if(!stride||stride===el){const copy=new Uint8Array(a.count*el);copy.set(new Uint8Array(bin.buffer,start,a.count*el));arr=new C(copy.buffer);}
 else{arr=new C(a.count*n);const src=new DataView(bin.buffer);
  for(let k=0;k<a.count;k++)for(let c=0;c<n;c++){const p=start+k*stride+c*C.BYTES_PER_ELEMENT;arr[k*n+c]=C===Float32Array?src.getFloat32(p,true):C===Uint16Array?src.getUint16(p,true):C===Uint32Array?src.getUint32(p,true):C===Int16Array?src.getInt16(p,true):C===Uint8Array?src.getUint8(p):src.getInt8(p);}}
 return {array:arr,itemSize:n,count:a.count,normalized:!!a.normalized};}

async function decodeImage(json,bin,i){const im=json.images[i],bv=json.bufferViews[im.bufferView];
 const bytes=new Uint8Array(bin.buffer,bin.byteOffset+(bv.byteOffset||0),bv.byteLength);
 const blob=new Blob([bytes],{type:im.mimeType||'image/png'});return createImageBitmap(blob,{imageOrientation:'none',premultiplyAlpha:'none',colorSpaceConversion:'none'});}

// Parse into three.js objects. Returns {root, mesh, skeleton, bones (by original name), clips, info}.
export async function parseCreature(buffer,{textures=typeof createImageBitmap==='function'&&typeof Blob==='function',maxAnisotropy=4}={}){
 const {json,bin}=readGLB(buffer);
 if(json.meshes?.length!==1||json.meshes[0].primitives.length!==1)throw new Error('expected one mesh with one primitive');
 if(json.skins?.length!==1)throw new Error('expected one skin');
 const prim=json.meshes[0].primitives[0];if((prim.mode??4)!==4)throw new Error('expected triangles');
 // geometry
 const geo=new THREE.BufferGeometry(),ATTR={POSITION:'position',NORMAL:'normal',TANGENT:'tangent',TEXCOORD_0:'uv',TEXCOORD_1:'uv1',JOINTS_0:'skinIndex',WEIGHTS_0:'skinWeight'};
 for(const [k,name] of Object.entries(ATTR)){if(prim.attributes[k]===undefined)continue;const a=accessor(json,bin,prim.attributes[k]);geo.setAttribute(name,new THREE.BufferAttribute(a.array,a.itemSize,a.normalized));}
 if(prim.indices!==undefined){const a=accessor(json,bin,prim.indices);geo.setIndex(new THREE.BufferAttribute(a.array,1));}
 // material
 const md=json.materials[prim.material],pbr=md.pbrMetallicRoughness||{};
 const mat=new THREE.MeshStandardMaterial({name:md.name||'creature',color:0xffffff,roughness:pbr.roughnessFactor??1,metalness:pbr.metallicFactor??1,side:md.doubleSided?THREE.DoubleSide:THREE.FrontSide});
 const texCache=new Map(),makeTex=async(ref,srgb)=>{if(!ref)return null;const t=json.textures[ref.index];const key=t.source+(srgb?'s':'l');if(texCache.has(key))return texCache.get(key);
  const img=await decodeImage(json,bin,t.source);const tex=new THREE.Texture(img);const s=json.samplers?.[t.sampler]||{};tex.flipY=false;tex.wrapS=s.wrapS===33071?THREE.ClampToEdgeWrapping:s.wrapS===33648?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;
  tex.wrapT=s.wrapT===33071?THREE.ClampToEdgeWrapping:s.wrapT===33648?THREE.MirroredRepeatWrapping:THREE.RepeatWrapping;tex.colorSpace=srgb?THREE.SRGBColorSpace:THREE.NoColorSpace;tex.anisotropy=maxAnisotropy;tex.channel=ref.texCoord||0;tex.needsUpdate=true;texCache.set(key,tex);return tex;};
 if(textures){mat.map=await makeTex(pbr.baseColorTexture,true);const orm=await makeTex(pbr.metallicRoughnessTexture,false);if(orm){mat.roughnessMap=orm;mat.metalnessMap=orm;}
  const occ=await makeTex(md.occlusionTexture,false);if(occ){mat.aoMap=occ;mat.aoMapIntensity=md.occlusionTexture.strength??1;}
  const nrm=await makeTex(md.normalTexture,false);if(nrm){mat.normalMap=nrm;const sc=md.normalTexture.scale??1;mat.normalScale.set(sc,sc);}}
 else if(pbr.baseColorFactor)mat.color.setRGB(...pbr.baseColorFactor.slice(0,3));
 // nodes
 const objs=json.nodes.map((n,i)=>{let o;if(n.mesh!==undefined){o=new THREE.SkinnedMesh(geo,mat);}else o=json.skins[0].joints.includes(i)?new THREE.Bone():new THREE.Group();
  o.name=THREE.PropertyBinding.sanitizeNodeName(n.name||('node'+i));o.userData.gltfName=n.name;
  if(n.matrix){o.matrix.fromArray(n.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);}else{if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);}return o;});
 json.nodes.forEach((n,i)=>{for(const c of n.children||[])objs[i].add(objs[c]);});
 const root=new THREE.Group();root.name='creature-asset';for(const i of json.scenes[json.scene??0].nodes)root.add(objs[i]);root.updateMatrixWorld(true);
 // skin
 const meshIndex=json.nodes.findIndex(n=>n.mesh!==undefined),mesh=objs[meshIndex],sk=json.skins[0];
 const ibm=accessor(json,bin,sk.inverseBindMatrices).array,bones=sk.joints.map(i=>objs[i]),inv=sk.joints.map((_,k)=>new THREE.Matrix4().fromArray(ibm,k*16));
 // (glTF: a skinned vertex is joint world matrix × inverse bind matrix × position; the mesh node's own transform
 // does not apply, so the bind matrix is the identity, as three.js's own glTF loader binds it)
 const skeleton=new THREE.Skeleton(bones,inv);mesh.bind(skeleton,new THREE.Matrix4());mesh.normalizeSkinWeights();
 // animations
 const clips=(json.animations||[]).map((an,ai)=>{const tracks=[];for(const ch of an.channels){const s=an.samplers[ch.sampler];if((s.interpolation||'LINEAR')!=='LINEAR')throw new Error('animation interpolation '+s.interpolation);
   const times=accessor(json,bin,s.input).array,vals=accessor(json,bin,s.output).array,name=objs[ch.target.node].name;
   const T=ch.target.path==='rotation'?THREE.QuaternionKeyframeTrack:ch.target.path==='weights'?null:THREE.VectorKeyframeTrack;if(!T)continue;
   tracks.push(new T(name+'.'+(ch.target.path==='rotation'?'quaternion':ch.target.path==='translation'?'position':'scale'),Array.from(times),Array.from(vals)));}
  return new THREE.AnimationClip(an.name||('clip'+ai),-1,tracks);});
 const byName={};for(const b of bones)byName[b.userData.gltfName]=b;
 const info={meta:json.asset?.extras||{},generator:json.asset?.generator,triangles:(geo.index?geo.index.count:geo.attributes.position.count)/3,vertices:geo.attributes.position.count,joints:bones.length,
  animations:clips.map(c=>({name:c.name,duration:c.duration,tracks:c.tracks.length})),textures:textures?(json.images||[]).length:0};
 return {root,mesh,skeleton,bones:byName,clips,info,material:mat};}
