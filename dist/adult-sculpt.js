// Continuous adult faces. Eye and IK anchors match the established actor rig.
import * as T from './three.module.js';
import {artLoft,mergeArt} from './astra-anatomy.js';
const gauss=(x,y,a,b,u,v)=>Math.exp(-(((x-a)/u)**2+((y-b)/v)**2));
const tint=(c,k)=>new T.Color(c).multiplyScalar(k).getHex();
export function adultHead(spec){
 const F=spec.face,H=spec.hair,skin=F.skin,mom=spec.name.includes('MOM'),old=spec.name==='NEIGHBOR',parts=[];
 const add=(geo,color,p=[0,0,0],s=[1,1,1])=>parts.push({geo,color,matrix:new T.Matrix4().compose(new T.Vector3(...p),new T.Quaternion(),new T.Vector3(...s))});
 const ball=(color,p,s)=>add(new T.SphereGeometry(1,20,14),color,p,s);
 const rings=[[-.132,.002,.002,0],[-.118,mom?.030:.040,.044,0],[-.092,mom?.058:.068,.065,.001],[-.055,.077,.081,.003],[-.012,.088,.088,.006],[.028,.087,.087,.009],[.071,.083,.082,.013],[.112,.065,.060,.017],[.137,.002,.002,.018]];
 const g=artLoft(rings,56,5,2.65),p=g.attributes.position,co=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),front=Math.max(0,Math.min(1,(-z-.025)/.05));
  const socket=gauss(Math.abs(x),y,.033,.012,.019,.013),cheek=gauss(Math.abs(x),y,.047,-.025,.021,.026);
  p.setZ(i,z+front*(.004*socket-.013*gauss(x,y,0,-.008,.010,.031)-.023*gauss(x,y,0,-.030,.013,.010)-.003*cheek));
  const c=new T.Color(skin).lerp(new T.Color(0xaf7167),front*cheek*.10).multiplyScalar(1-front*(socket*.10+(old?.045:.018)*gauss(Math.abs(x),y,.045,-.005,.022,.006)));co.push(c.r,c.g,c.b);
 }g.setAttribute('color',new T.Float32BufferAttribute(co,3));g.computeVertexNormals();add(g,0xffffff);
 for(const s of [-1,1]){
  ball(skin,[s*.087,-.006,.012],[.013,.027,.019]);ball(tint(skin,.76),[s*.097,-.008,.004],[.003,.016,.010]);
  ball(0xd9d5ca,[s*.033,.012,-.083],[.014,.007,.003]);ball(F.iris,[s*.033,.012,-.086],[.0054,.0063,.0018]);ball(0x17191a,[s*.033,.012,-.0876],[.0025,.0038,.0007]);ball(0xe2dfcf,[s*.031,.014,-.0881],[.001,.001,.0004]);
  ball(tint(skin,.5),[s*.009,-.037,-.104],[.0035,.002,.002]);
  for(const up of [-1,1]){const curve=[];for(let k=0;k<=14;k++){const a=k/14*Math.PI;curve.push(new T.Vector3(s*.033+Math.cos(a)*.015,.012+up*Math.sin(a)*.008,-.085));}add(new T.TubeGeometry(new T.CatmullRomCurve3(curve),16,.0008,4),tint(skin,up>0?.72:.92));}
 }
 // A fitted cap with an asymmetric hairline; winding faces outward and the pole is shared.
 const cols=56,rows=22,hp=[],hc=[],ix=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const a=i/cols*Math.PI*2,front=Math.max(0,-Math.sin(a)),back=Math.max(0,Math.sin(a)),edge=1.53-front*.42+back*.30+.035*Math.sin(a*3),t=j/rows*edge,ridge=.0008*Math.sin(a*39+t*11)*Math.sin(t),quiff=(H.style==='swept'?.008:0)*front*Math.max(0,Math.cos(a))*Math.sin(t),sx=Math.cos(a),sz=Math.sin(a);
  hp.push(Math.sign(sx)*Math.abs(sx)**.76*Math.sin(t)*(.096+ridge),.004+Math.cos(t)*.143+quiff,.012+Math.sign(sz)*Math.abs(sz)**.76*Math.sin(t)*(.108+ridge));
  const c=new T.Color(H.color).multiplyScalar(.92+.09*Math.sin(a*39+t*11)**2+(old?.18*Math.abs(sx)*Math.sin(t)**4:0));hc.push(c.r,c.g,c.b);
  if(j<rows&&i<cols){const n=j*(cols+1)+i;ix.push(n,n+1,n+cols+1,n+1,n+cols+2,n+cols+1);}}
 const hair=new T.BufferGeometry();hair.setAttribute('position',new T.Float32BufferAttribute(hp,3));hair.setAttribute('color',new T.Float32BufferAttribute(hc,3));hair.setIndex(ix);hair.computeVertexNormals();add(hair,0xffffff);
 for(const s of [-1,1])ball(H.color,[s*.085,.026,.017],[.009,.035,.029]);
 if(mom){ball(H.color,[0,.008,.110],[.030,.035,.030]);ball(H.color,[0,-.060,.128],[.026,.067,.028]);}
 return mergeArt(parts);
}
export function animatedAdultLips(head,color){
 const mat=new T.MeshStandardMaterial({color,roughness:.76,side:T.DoubleSide}),lips=[-1,1].map(()=>{const g=new T.PlaneGeometry(1,1,24,1),m=new T.Mesh(g,mat);head.add(m);return m;});
 const update=mouth=>{for(let k=0;k<2;k++){const p=lips[k].geometry.attributes.position,sign=k?1:-1;for(let row=0;row<2;row++)for(let i=0;i<=24;i++){const u=i/24*2-1,x=u*mouth.scale.x*1.15,edge=mouth.position.y+sign*mouth.scale.y*Math.sqrt(Math.max(0,1-u*u));p.setXYZ(row*25+i,x,edge+sign*row*.0023*(1-u*u),-.0885+.002*u*u);}p.needsUpdate=true;lips[k].visible=mouth.visible;}};
 return {lips,update};
}
