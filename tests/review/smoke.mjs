// Smoke review: the garage; Sam's feet; looking down at yourself; Sam's face neutral, surprised, talking.
export default async function(L,{cap,step,face}){
 L.jump('c5-garage');step(4);const S=L.chapter.companions.list.sam,c=L.camera;
 const at=(x,z)=>{const p=L.state.walk;return Math.atan2(x-p.x,-(z-p.z));};
 face(at(S.px,S.pz),-.05);step(.2);await cap('smoke-01-sam-from-player');
 face(at(S.px,S.pz),-.45);step(.2);await cap('smoke-02-sam-feet');
 face(L.state.walk.a,-1.1);step(.3);await cap('smoke-03-look-down');
 // close to Sam's face
 L.placePlayer({x:S.px+Math.sin(S.pa)*.9,z:S.pz-Math.cos(S.pa)*.9,a:S.pa+Math.PI,mode:'walk'});step(.5);face(at(S.px,S.pz),-.12);step(.3);await cap('smoke-04-sam-face');
 S.person.face.set('surprised',{hold:5});step(.6);await cap('smoke-05-sam-surprised');
 S.person.face.set('unimpressed',{hold:5});step(.6);await cap('smoke-06-sam-unimpressed');
 S.talk=2;S.speech={text:'Mom’s at work till six. She thinks we’re at Jamie’s.',dur:2};step(.35);await cap('smoke-07-sam-talking-a');step(.15);await cap('smoke-08-sam-talking-b');
 return {sam:{x:S.px,z:S.pz}};
}
