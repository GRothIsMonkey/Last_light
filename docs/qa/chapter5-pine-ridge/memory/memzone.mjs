// ONLY=script: merged vertex bytes and triangles by zone/far, plus shadow proxies by region
export default async function({h}){const by={},add=(k,b,t)=>{const r=by[k]||(by[k]={mb:0,tris:0,meshes:0});r.mb+=b/1048576;r.tris+=t;r.meshes++;};
 const bytes=g=>{let b=0;for(const a of Object.values(g.attributes))b+=a.array.byteLength;if(g.index)b+=g.index.array.byteLength;return b;};
 const tris=g=>(g.index?g.index.count:g.attributes.position.count)/3;
 for(const m of h.scene.children){if(!m.isMesh||!m.geometry)continue;const z=m.name==='shadow-proxy'?'shadow-proxy':(m.userData.zone||'(none)')+(m.userData.far?' far':'');add(z,bytes(m.geometry),tris(m.geometry));}
 const P=await import('/home/user/Last_light/dist/pine-plan.js');
 // shadow proxies over Pine Ridge's box
 const RB=P.REGION_BOX;for(const m of h.scene.children){if(m.name!=='shadow-proxy')continue;const s=m.geometry.boundingSphere;if(s&&s.center.x>RB.x0&&s.center.x<RB.x1&&s.center.z>RB.z0&&s.center.z<RB.z1)add('shadow-proxy in pine box',bytes(m.geometry),tris(m.geometry));}
 for(const [k,v] of Object.entries(by).sort((a,b)=>b[1].mb-a[1].mb))console.log(k.padEnd(28),v.mb.toFixed(1).padStart(7),'MB',String(Math.round(v.tris)).padStart(9),'tris',String(v.meshes).padStart(5),'meshes');}
