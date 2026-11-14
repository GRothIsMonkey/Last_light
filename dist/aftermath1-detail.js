// October props and cloth, local to Aftermath I; no story or collision changes.
import * as T from './three.module.js';
const mat=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:.8,...o});
function box(g,x,y,z,w,h,d,c,r=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='number'?mat(c):c);m.position.set(x,y,z);m.rotation.x=r;g.add(m);return m;}
function label(g,x,y,z,w,h,draw){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext?.('2d');if(ctx)draw(ctx,512,256);const tex=ctx?new T.CanvasTexture(canvas):null;if(tex)tex.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);g.add(m);return m;}
export function drapedBlanket(color){const p=[],ix=[],S=40,R=24;
 for(let j=0;j<=R;j++)for(let i=0;i<=S;i++){const t=j/R,a=.45+i/S*(Math.PI*2-.90),shoulder=Math.sin(Math.min(1,t/.32)*Math.PI/2),rx=.065+shoulder*.17+t*.018,rz=.05+shoulder*.10,fold=(.006+.007*t)*Math.sin(a*13+t*5);p.push(Math.sin(a)*(rx+fold),.255-t*.49-Math.sin(a*2+.3)**2*.009*t,Math.cos(a)*(rz+fold)+.02);if(j<R&&i<S){const n=j*(S+1)+i;ix.push(n,n+S+1,n+1,n+1,n+S+1,n+S+2);}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();const m=new T.Mesh(g,mat(color,{side:T.DoubleSide}));m.name='a1-draped-blanket';m.castShadow=true;return m;
}
export function finishMovingTruck(g){
 const white=mat(0xe2dfd4),metal=mat(0x8c9294,{metalness:.45,roughness:.5}),blue=mat(0x315575),wood=mat(0x927252),card=mat(0xad8456);
 box(g,0,.54,1.4,2.3,.12,5,wood);box(g,0,2.98,1.4,2.3,.08,5,white);box(g,0,1.75,-1.08,2.3,2.5,.09,white);
 for(const s of [-1,1]){box(g,s*1.13,1.75,1.4,.05,2.5,5,white);box(g,s*1.163,1.2,1.4,.018,.3,4.8,blue);for(const y of [.65,1.85,2.85])box(g,s*1.09,y,1.4,.07,.05,4.8,wood);box(g,s*1.16,1.75,3.9,.065,2.5,.07,metal);for(let j=0;j<17;j++)box(g,s*1.168,2.86,-.9+j*.29,.012,.022,.022,metal);}
 for(let k=0;k<6;k++)box(g,0,2.96-k*.065,3.9,2.16,.052,.045,metal);
 // Loaded furniture stays behind the open ramp and the existing mover paths.
 for(let row=0;row<3;row++)for(let col=0;col<3;col++){const h=.38+(col%2)*.07;box(g,-.72+col*.59,.63+h/2+row*.44,-.3+row*.7,.53,h,.61,card);box(g,-.72+col*.59,.63+h/2+row*.44,.011+row*.7,.055,h,.004,0xc1ae86);}
 box(g,.63,1.25,2.6,.63,1.38,1.1,0x61706e);box(g,-.65,1.05,2.5,.5,.95,.9,wood);for(const s of [-1,1])box(g,s*.83,1.4,3.12,.04,1.65,.017,0x343b3e);
 label(g,0,2.49,3.94,1.26,.21,(c,w,h)=>{c.fillStyle='#e1ddd0';c.fillRect(0,0,w,h);c.fillStyle='#334b61';c.font='bold 62px sans-serif';c.textAlign='center';c.fillText('LOCAL MOVING',w/2,155);});
}
export function finishCarCabin(g){
 const dark=mat(0x181c20),trim=mat(0x848884,{metalness:.35,roughness:.6});
 for(const x of [-.69,.25,.67]){box(g,x,.88,-.757,.22,.10,.025,dark);for(let j=0;j<4;j++)box(g,x,.846+j*.022,-.739,.19,.007,.01,trim);}
 label(g,-.42,.94,-.756,.34,.15,(c,w,h)=>{c.fillStyle='#11171a';c.fillRect(0,0,w,h);for(const x of [145,365]){c.strokeStyle='#a7b0a0';c.lineWidth=3;c.beginPath();c.arc(x,150,85,Math.PI*.7,Math.PI*2.3);c.stroke();for(let i=0;i<9;i++){const a=i/8*5+2.2;c.beginPath();c.moveTo(x+Math.cos(a)*67,150+Math.sin(a)*67);c.lineTo(x+Math.cos(a)*81,150+Math.sin(a)*81);c.stroke();}c.strokeStyle='#cc8e54';c.beginPath();c.moveTo(x,150);c.lineTo(x-48,120);c.stroke();}c.fillStyle='#c3cc9a';c.font='18px monospace';c.fillText('083521',220,225);});
 box(g,0,.80,-.744,.31,.20,.026,dark);label(g,0,.844,-.726,.24,.043,(c,w,h)=>{c.fillStyle='#253831';c.fillRect(0,0,w,h);c.fillStyle='#b6c09c';c.font='bold 76px monospace';c.fillText('FM  98.3',22,162);});box(g,0,.785,-.725,.22,.009,.004,0x080a0b);
 for(const x of [-.118,.118]){const q=new T.Mesh(new T.CylinderGeometry(.020,.020,.022,12),dark);q.rotation.x=Math.PI/2;q.position.set(x,.745,-.717);g.add(q);}
 for(const x of [.32,.56])box(g,x,.68,-.757,.23,.008,.005,0x161a1c);box(g,.45,.72,-.737,.075,.018,.018,trim);
 box(g,-.42,1.0,-.71,.19,.068,.045,dark,-.45);box(g,-.42,.92,-.67,.042,.16,.035,dark,-.45);box(g,-.66,.94,-.76,.17,.018,.018,dark);
 box(g,0,.73,-.2,.035,.18,.038,dark,-.18);box(g,0,.82,-.19,.075,.04,.065,dark);box(g,0,1.32,-.598,.216,.050,.004,mat(0x89918c,{metalness:.72,roughness:.18}));
 for(const s of [-1,1]){box(g,s*.42,1.27,.145,.30,.18,.10,0x484c50);box(g,s*.827,.81,-.25,.03,.035,.17,trim);box(g,s*.17,.58,.03,.04,.065,.035,0x753b32);}
}
export function finishEveningNook(home,room,table,fl){const g=new T.Group();g.name='a1-evening-nook';home.root.add(g);g.visible=false;
 const bulb=mat(0xffe0ae,{emissive:0xffb76d,emissiveIntensity:1.4});box(g,table.x,fl+2.30,table.z,.018,.43,.018,0x292c2b);
 const shade=new T.Mesh(new T.ConeGeometry(.24,.16,24,1,true),mat(0x8e7b5d,{side:T.DoubleSide}));shade.position.set(table.x,fl+2.06,table.z);g.add(shade);const b=new T.Mesh(new T.SphereGeometry(.045,12,8),bulb);b.position.set(table.x,fl+2.03,table.z);g.add(b);
 box(g,table.x,fl+.758,table.z,.73,.004,.47,0xb4ab94);
 label(g,(room.x0+room.x1)/2,fl+1.63,room.z0+.046,1.04,.76,(c,w,h)=>{const q=c.createLinearGradient(0,0,0,h);q.addColorStop(0,'#1d2d41');q.addColorStop(.65,'#756b70');q.addColorStop(1,'#bb8a62');c.fillStyle=q;c.fillRect(0,0,w,h);c.fillStyle='#182629';for(let i=0;i<22;i++){c.beginPath();c.ellipse(i*27,h-15-(i%4)*15,43,75+(i%3)*10,0,0,Math.PI*2);c.fill();}});
 return g;
}
export function eveningMaterials(root){const changed=[];return on=>{if(on&&changed.length===0)root.traverse(o=>{if(o.isLight){changed.push([o,'intensity',o.intensity]);o.intensity*=.25;}if(o.isMesh&&o.material?.emissiveIntensity>.12){const old=o.material;o.material=old.clone();o.material.emissiveIntensity*=.22;changed.push([o,'material',old]);}});if(!on){for(const [o,k,v]of changed){if(k==='material')o.material.dispose();o[k]=v;}changed.length=0;}};}
