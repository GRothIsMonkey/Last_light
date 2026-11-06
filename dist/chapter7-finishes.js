// Art for the three houses on Friday. Tiling finishes use the building kit's metre UVs.
// The same sheets are sampled offline, in the photo studio and in the normal renderer.
import * as THREE from './three.module.js';
import {paper} from './chapter6-kit.js';
import {seeded} from './kit.js';

const textures = new Map();
const materials = new Map();
const TAU = Math.PI * 2;

function line(c, points, color, width = 1) {
 c.strokeStyle = color;
 c.lineWidth = width;
 c.beginPath();
 points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y));
 c.stroke();
}
function ellipse(c, x,y,rx,ry, color, angle = 0) {
 c.fillStyle = color;
 c.beginPath();
 c.ellipse(x,y,rx,ry,angle,0,TAU);
 c.fill();
}
function grain(c, r, amount) {
 for (let i=0;i<amount;i++) {
  c.fillStyle = i%3 ? 'rgba(32,22,17,.08)' : 'rgba(255,246,225,.18)';
  c.fillRect(r()*512,r()*512,1+r()*1.7,1);
 }
}
function oak(c, r) {
 for (let row=0;row<8;row++) {
  const y=row*64, start=-(row%3)*74;
  c.fillStyle=['#af8e66','#aa8461','#b39067','#a68260'][row%4];
  c.fillRect(0,y,512,64);
  for(let x=start;x<512;x+=256) {
   c.fillStyle=r()>.5?'rgba(89,48,19,.12)':'rgba(255,225,175,.10)';
   c.fillRect(x,y,256,63);
   line(c,[[x,y],[x+256,y]],'#6c5743',2);
   line(c,[[x,y],[x,y+62]],'#7e654e',1.5);
   for(let n=0;n<26;n++) {
    const b=y+3+r()*57, a=r()*5, points=[];
    for(let k=0;k<=12;k++) points.push([x+k*21.3,b+Math.sin(a+k*.7)*1.8+Math.sin(k*.35+a)*2.4]);
    line(c,points,n%4?'rgba(84,50,27,.15)':'rgba(243,213,165,.30)',.7+r()*.6);
   }
  }
 }
}
function tile(c,r) {
 for(let y=0;y<4;y++) for(let x=0;x<4;x++) {
  const a=x*128,b=y*128;
  c.fillStyle=(x+y)%2?'#b6b8a0':'#ddd5b6';c.fillRect(a,b,128,128);
  c.fillStyle='rgba(250,243,210,.4)';c.fillRect(a+2,b+2,124,2);
  line(c,[[a,b+127],[a+127,b+127],[a+127,b]],'#8c907d',2);
  for(let i=0;i<250;i++) {const u=a+r()*126,v=b+r()*126;line(c,[[u,v],[u+2,v-.8]],i%2?'rgba(252,246,224,.28)':'rgba(98,94,70,.18)',1);}
 }
}
function wallPrint(c,r,style) {
 const green=style==='fern',blue=style==='stripe';
 c.fillStyle=green?'#b4b49a':blue?'#9fadb0':'#d4bea0';c.fillRect(0,0,512,512);
 for(let x=0;x<512;x+=32){
  c.fillStyle=blue?'rgba(44,79,92,.12)':'rgba(104,83,54,.09)';c.fillRect(x,0,blue?3:1,512);
  c.fillStyle='rgba(255,245,212,.19)';c.fillRect(x+4,0,1,512);
 }
 if(!blue){
  const ink=green?'rgba(52,82,64,.48)':'rgba(120,76,63,.46)';
  for(let row=-1;row<6;row++) for(let col=-1;col<6;col++){
   const x=col*128+(row%2)*64,y=row*96+24;
   c.lineWidth=1.5;c.strokeStyle=ink;c.beginPath();c.moveTo(x-4,y+31);c.bezierCurveTo(x+14,y+12,x-10,y+2,x+2,y-27);c.stroke();
   for(let i=0;i<4;i++){const h=y+17-i*10;ellipse(c,x-4,h,7,2.4,ink,.6);ellipse(c,x+6,h-5,7,2.5,ink,-.7);}
   if(!green){for(let k=0;k<5;k++)ellipse(c,x+2+4*Math.cos(k*TAU/5),y-28+4*Math.sin(k*TAU/5),3,3,'rgba(144,83,72,.50)');}
  }
 }
 grain(c,r,3800);
}
function siding(c,r) {
 for(let i=0;i<8;i++){
  const y=i*64,grad=c.createLinearGradient(0,y,0,y+64);
  grad.addColorStop(0,'#b7b3a6');grad.addColorStop(.13,'#e6e5da');grad.addColorStop(.68,'#f2eee1');grad.addColorStop(.95,'#dedccf');grad.addColorStop(1,'#aaa597');
  c.fillStyle=grad;c.fillRect(0,y,512,64);
  for(let k=0;k<16;k++){const x=r()*512,b=y+8+r()*48;line(c,[[x,b],[x+8+r()*54,b-.4]],'rgba(117,106,85,.12)',.8);}
 }
}
function shingles(c,r) {
 c.fillStyle='#7d7c76';c.fillRect(0,0,512,512);
 for(let j=0;j<8;j++)for(let i=-1;i<6;i++) {
  const x=i*128+(j%2)*64,y=j*64,l=135+Math.floor(r()*36);
  c.fillStyle='rgb('+l+','+(l-2)+','+(l-8)+')';c.fillRect(x+1,y+3,126,60);
  c.fillStyle='rgba(41,43,43,.4)';c.fillRect(x,y+62,128,2);
 }
 grain(c,r,12000);
}
function weave(c,r) {
 c.fillStyle='#c7c2ae';c.fillRect(0,0,512,512);
 for(let i=0;i<512;i+=4){line(c,[[i,0],[i,512]],'rgba(255,248,225,.25)',1);line(c,[[0,i],[512,i]],'rgba(53,65,68,.18)',1.3);}
 const band=(p,w,col)=>{c.fillStyle=col;c.fillRect(p,0,w,512);c.fillRect(0,p,512,w);};
 for(const x of [0,256]){band(x,43,'rgba(39,70,78,.44)');band(x+52,7,'rgba(243,227,187,.74)');band(x+94,3,'rgba(150,83,60,.61)');}
 grain(c,r,3400);
}
function paperRug(c,r) {
 c.fillStyle='#b88c6d';c.fillRect(0,0,512,512);
 const diamond=(x,y,w,h,color)=>{c.fillStyle=color;c.beginPath();c.moveTo(x-w,y);c.lineTo(x,y-h);c.lineTo(x+w,y);c.lineTo(x,y+h);c.closePath();c.fill();};
 for(let i=0;i<9;i++){const p=7+i*5;c.strokeStyle=['#4f625f','#c7af83','#845749'][i%3];c.lineWidth=3;c.strokeRect(p,p,512-2*p,512-2*p);}
 for(let y=80;y<445;y+=44)for(let x=78;x<454;x+=44){diamond(x+(y%88?0:11),y,8,11,'#8a6559');diamond(x+(y%88?0:11),y,3,5,'#d0ae80');}
 diamond(256,256,125,150,'#566863');diamond(256,256,107,132,'#c5aa7e');diamond(256,256,88,113,'#996a55');
 diamond(256,256,48,70,'#4f645e');diamond(256,256,20,35,'#bda67d');grain(c,r,9000);
}
const recipes={oak,tile,fern:(c,r)=>wallPrint(c,r,'fern'),rose:(c,r)=>wallPrint(c,r,'rose'),stripe:(c,r)=>wallPrint(c,r,'stripe'),siding,shingles,weave,rug:paperRug};

export function finish(kind,tint=0xffffff) {
 const key=kind+'-'+tint;
 if(materials.has(key))return materials.get(key);
 if(!textures.has(kind)){
  const tx=paper(512,512,c=>recipes[kind](c,seeded(7193)));
  if(tx&&kind!=='rug'){tx.wrapS=tx.wrapT=THREE.RepeatWrapping;const freq={oak:.62,tile:1,fern:1.18,rose:1.04,stripe:.75,siding:.82,shingles:.87,weave:1.25}[kind];tx.repeat.set(freq,freq);}
  textures.set(kind,tx);
 }
 const m=new THREE.MeshStandardMaterial({color:tint,map:textures.get(kind),roughness:kind==='tile'?.53:kind==='oak'?.68:.91});
 m.name='c7-finish-'+kind+'-'+tint.toString(16);materials.set(key,m);return m;
}

// The printed surface is fixed to the physical object. Only the light falloff on it changes.
export function wallPrintArt(kind) {
 const cKey='print-'+kind;if(materials.has(cKey))return materials.get(cKey);
 const map=paper(384,480,(c,w,h)=>{
  const r=seeded(1959),summer=kind==='summer',field=kind==='field';
  c.fillStyle=summer?'#ead7ab':field?'#d0cab1':'#b3a68d';c.fillRect(0,0,w,h);
  c.save();c.beginPath();c.rect(18,18,w-36,h-102);c.clip();
  const sky=c.createLinearGradient(0,8,0,340);sky.addColorStop(0,summer?'#4d8796':'#778a87');sky.addColorStop(.75,summer?'#f0cf96':'#d6bea0');sky.addColorStop(1,'#ede1be');c.fillStyle=sky;c.fillRect(0,0,w,h);
  ellipse(c,summer?279:93,109,31,31,'#f6ddb0');
  for(let j=0;j<4;j++){const y=170+j*24;c.fillStyle=['#a0ad99','#81988b','#5c7972','#3d625b'][j];c.beginPath();c.moveTo(-3,400);for(let i=0;i<=22;i++)c.lineTo(i*19,y+Math.sin(i*.42+j)*16+Math.sin(i*.91)*5);c.lineTo(410,400);c.fill();}
  c.fillStyle='#738e84';c.beginPath();c.moveTo(245,242);c.bezierCurveTo(106,294,306,303,104,394);c.lineTo(362,394);c.bezierCurveTo(387,302,180,291,276,242);c.fill();
  for(let i=0;i<100;i++){const x=r()*w,y=280+r()*110;line(c,[[x,y],[x+5+r()*24,y]],'rgba(233,222,182,.28)');}
  const evergreen=(x,y,h)=>{line(c,[[x,y],[x,y-h]],'#304a46',2);for(let k=1;k<10;k++){const v=k/10,b=y-h+v*h;const d=v*h*.18;c.fillStyle='#35594e';c.beginPath();c.moveTo(x,b-h*.2);c.lineTo(x-d,b+4);c.lineTo(x+d,b);c.fill();}};
  for(const [x,y,h2] of [[30,367,196],[52,339,132],[329,317,94],[350,355,145],[73,325,78]])evergreen(x,y,h2);
  c.restore();c.textAlign='center';c.fillStyle='#344c48';c.font='bold 27px Georgia';c.fillText(summer?'PINE RIDGE':field?'OAK HOLLOW':'MILL CREEK',192,425);
  c.font='12px Georgia';c.fillText(summer?'SUMMER  •  2009':field?'Township parks   /   No. 3':'AUGUST AT THE MILL',192,449);grain(c,r,3300);
 });
 const m=new THREE.MeshStandardMaterial({map,color:0xf4eedc,roughness:.91});m.name=cKey;materials.set(cKey,m);return m;
}
