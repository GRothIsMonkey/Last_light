import * as T from './three.module.js';
import {P,spineQuat,gripPos,pedalPos,smooth} from './rig.js';

const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const Q=()=>new T.Quaternion();
const identity=Q(),up=V(0,1,0),tau=2*Math.PI;
const clamp=T.MathUtils.clamp;
const rotation=(pitch=0,yaw=0,roll=0)=>Q().setFromEuler(new T.Euler(pitch,yaw,roll,'YXZ'));
const mix=(a,b,t)=>a+(b-a)*t;
const digits=['thumb','index','middle','ring','pinky'];
const roles={jamie:{swing:1.10,smile:.42,blink:3.79,tilt:.047},sam:{swing:.85,smile:.20,blink:4.71,tilt:.024},alex:{swing:.96,smile:.34,blink:4.16,tilt:.033}};

export function prepareFriend(profile){
 const rest={},pose={},grasp={},soles={};
 for(const [n,j] of Object.entries(profile.joints)){
   rest[n]=V().fromArray(j.head);pose[n]={p:V(),q:Q()};
 }
 for(const [n,q] of Object.entries(profile.grasp))grasp[n]=Q().fromArray(q);
 for(const s of ['l','r']){
   const values=profile['sole_'+s];
   soles[s]=Array.from({length:121},(_,i)=>{
     const p=(i-60)/100,c=Math.cos(p),sn=Math.sin(p);let ground=Infinity,tread=Infinity;
     for(const [x,y,z] of values){const yy=y*c-z*sn,zz=y*sn+z*c;ground=Math.min(ground,yy);
       if(Math.abs(zz+.055)<.037&&Math.abs(x)<.045)tread=Math.min(tread,yy);}
     return [ground,Number.isFinite(tread)?tread:ground];
   });
 }
 return {key:profile.key,rest,pose,grasp,soles,roles:roles[profile.key]};
}
function bottom(table,pitch,index){
 const u=clamp(pitch*100+60,0,119.999),i=Math.floor(u);return mix(table[i][index],table[i+1][index],u-i);
}
// All output positions and rest-relative rotations are in person space (metres, forward −Z).
// The Blender bake calls this same solver with the game's own pose generators.
export function solveFriend(c,p,x){
 const {rest:r,pose:o,grasp,roles:style}=c;
 const set=(n,pt,q)=>{o[n].p.copy(pt);o[n].q.copy(q);};
 const attached=(n,parent)=>r[n].clone().sub(r[parent]).applyQuaternion(o[parent].q).add(o[parent].p);
 const follow=(n,parent,q=o[parent].q)=>set(n,attached(n,parent),q);
 const from=(offset)=>V().fromArray(p,offset);
 const ride=x.ride??0,plant=x.astride||0,steer=x.steer||0,angle=x.crank||0,clock=x.clock||0,g=x.geom;
 const gait=x.gait||0,speed=x.speed||0,wave=clamp(x.wave||0,0,1);
 const lower=rotation(0,p[P.yaw],-.48*p[P.roll]),back=spineQuat(p,Q());
 const pelvis=from(P.root);pelvis.y+=mix(r.hips.y-.80,.023+style.tilt*.20,ride);pelvis.z-=.065*ride*(1-plant);
 const goal={},footQ={},palmQ={},curl={};
 const rake=Q().setFromAxisAngle(up.clone().applyQuaternion(g.rakeQ),steer);
 for(const [s,sign] of [['l',-1],['r',1]]){
   const plantSide=plant*((x.stopSide||0)===0||x.stopSide===sign?1:0);
   const foot=p[sign<0?P.lfp:P.rfp],a=angle+(sign<0?Math.PI:0);
   const pitch=mix(foot,.088*Math.sin(a)*(1-plantSide),ride);
   const q=rotation(pitch,p[P.yaw]*.45,0);footQ[s]=q;
   const ankle=from(sign<0?P.lf:P.rf);
   ankle.y+=-bottom(c.soles[s],pitch,0)-.065;
   const rc=pedalPos(angle,sign,V(),g);rc.z+=.055;rc.x+=sign*.004;rc.y+=.011-bottom(c.soles[s],pitch,1);
   const ground=V(sign*.222,-bottom(c.soles[s],0,0),.06);
   rc.lerp(ground,plantSide);ankle.lerp(rc,ride);goal['foot_'+s]=ankle;
   const hip=r['thigh_'+s].clone().sub(r.hips).applyQuaternion(lower);
   const L=r['thigh_'+s].distanceTo(r['calf_'+s])+r['foot_'+s].distanceTo(r['calf_'+s])-.002;
   const dx=pelvis.x+hip.x-ankle.x,dz=pelvis.z+hip.z-ankle.z;
   pelvis.y=Math.min(pelvis.y,ankle.y+Math.sqrt(Math.max(.001,L*L-dx*dx-dz*dz))-hip.y);
 }
 set('root',r.root,identity);set('hips',pelvis,lower);
 follow('spine_01','hips',lower.clone().slerp(back,.47));follow('spine_02','spine_01',lower.clone().slerp(back,.78));follow('chest','spine_02',back);
 const yaw=clamp(p[P.hy]+(x.lookExtra||0),-1.17,1.17);
 const head=rotation(p[P.hp]-.08*ride+.018*Math.sin(clock*1.2),p[P.yaw]+.60*p[P.twist]+yaw,-.12*p[P.roll]+style.tilt*Math.sin(yaw));
 follow('neck','chest',back.clone().slerp(head,.58));follow('head','neck',head);follow('socket_eye','head');
 function chain(a,b,end,start,target,pole,endQ){
   const l1=r[a].distanceTo(r[b]),l2=r[b].distanceTo(r[end]);
   const ray=target.clone().sub(start);const distance=clamp(ray.length(),Math.abs(l1-l2)+.0001,l1+l2-.0001);ray.normalize();
   const normal=pole.clone().addScaledVector(ray,-pole.dot(ray)).normalize();
   const along=clamp((distance*distance+l1*l1-l2*l2)/(2*distance),-l1,l1);
   const middle=start.clone().addScaledVector(ray,along).addScaledVector(normal,Math.sqrt(Math.max(0,l1*l1-along*along)));
   const reach=start.clone().addScaledVector(ray,distance);
   const aim=(base,tip,v)=>Q().setFromUnitVectors(r[tip].clone().sub(r[base]).normalize(),v.normalize());
   set(a,start,aim(a,b,middle.clone().sub(start)));set(b,middle,aim(b,end,reach.clone().sub(middle)));set(end,reach,endQ);
 }
 for(const [s,sign] of [['l',-1],['r',1]]){
   const n=k=>k+'_'+s;
   const hip=attached(n('thigh'),'hips');chain(n('thigh'),n('calf'),n('foot'),hip,goal[n('foot')],from(sign<0?P.lk:P.rk),footQ[s]);
   follow(n('toe'),n('foot'));
   const clav=n('clavicle');follow(clav,'chest',back);
   const shoulder=attached(n('upperarm'),clav);
   const salute=s==='r'?wave:0;const grip=ride*(1-salute);
   const carry=clamp(x.hold||0,0,1)*(s==='l'?1:0);
   const wq=rotation(.15*Math.sin(gait*tau)*sign-.12*clamp(speed/4,0,1),p[P.yaw],0);
   wq.slerp(rake.clone().multiply(grasp[n('hand')]),Math.max(grip,carry));
   const hand=from(sign<0?P.lh:P.rh);
   if(ride<1&&salute<.1)hand.z*=1+(style.swing-1)*(1-ride);
   // The contract supplies a grasp point on the bar, while the fitted rig supplies the wrist-to-palm offset.
   const bar=gripPos(steer,sign,V(),g);bar.x-=sign*.006;
   const offset=r[n('socket_grip')].clone().sub(r[n('hand')]).applyQuaternion(wq);
   const wanted=bar.clone().sub(offset);
   hand.lerp(wanted,grip);
   if(carry&&x.heldGrip)hand.lerp(x.heldGrip.clone().sub(offset),carry);
   if(salute){
      const q=rotation(-.23,sign*-.45,.64+.23*Math.sin(clock*(c.key==='jamie'?11:7)));
      wq.slerp(q,salute);hand.x+=.018*salute*Math.sin(clock*6);
   }
   // The original hand target already includes the script's wave arc.
   const max=r[n('upperarm')].distanceTo(r[n('lowerarm')])+r[n('lowerarm')].distanceTo(r[n('hand')])-.002;
   const excess=Math.max(0,shoulder.distanceTo(hand)-max);
   if(excess){const shift=hand.clone().sub(shoulder).normalize().multiplyScalar(excess);shoulder.add(shift);o[clav].p.add(shift);}
   chain(n('upperarm'),n('lowerarm'),n('hand'),shoulder,hand,from(sign<0?P.le:P.re),wq);
   const fore=o[n('lowerarm')].q;follow(n('forearm_twist'),n('lowerarm'),fore.clone().slerp(wq,.52));
   const tight=clamp(Math.max(grip,carry,.13*(1-salute)*Math.min(speed,3.5)/3.5),0,1);
   for(const d of digits)for(let k=1;k<=3;k++){
      const id=n(d+k),parent=k===1?n('hand'):n(d+(k-1));
      const local=grasp[n('hand')].clone().invert().multiply(grasp[id]);
      follow(id,parent,wq.clone().multiply(identity.clone().slerp(local,tight)));
   }
   follow(n('socket_grip'),n('hand'));if(s==='r')follow('socket_lamp_r',n('hand'));
   const base=c.key==='jamie'?0:c.key==='sam'?1.3:2.4;
   const blinkT=(clock+base)%style.blink,blink=x.blink??(blinkT<.16?Math.sin(Math.PI*blinkT/.16)**1.5:0);
   const smile=x.smile??style.smile*(.35+.55*Math.min(1,Math.abs(yaw))+.50*salute);
   const speak=x.speech||0;const brow=(x.attention||0)+speak*.26;
   const face=(id,dx,dy,dz,q=head)=>{follow(n(id),'head',q);o[n(id)].p.add(V(dx,dy,dz).applyQuaternion(head));};
   face('eye',0,0,0,head.clone().multiply(rotation(0,clamp(yaw*.17+.026*Math.sin(clock*2.1+base),-.17,.17),0)));
   face('lid',0,-.0115*blink+.0008*smile,-.0016*blink);
   face('brow',0,.0037*brow+.0011*smile,0,head.clone().multiply(rotation(0,0,sign*.035*brow)));
   face('cheek',sign*.0025*smile,.0065*smile,-.0018*smile);
 }
 follow('jaw','head',head.clone().multiply(rotation(-.10*(x.speech||0),0,0)));
 o.jaw.p.add(V(0,-.008*(x.speech||0),.001*(x.speech||0)).applyQuaternion(head));
 return o;
}
