// First-person body, looking down: standing, walking, holding the flashlight and not.
export default async function(L,{cap,step,face,press,release}){
 L.jump('c5-camp');step(3);const a=L.state.walk.a;
 for(const p of [-.5,-.9,-1.15,-1.32]){face(a,p);step(.2);await cap(`look-light-${String(-p).replace('.','')}`);}
 L.chapter5.C.inv.flashlight=false;L.foot.owned=false;step(.2);
 for(const p of [-.9,-1.32]){face(a,p);step(.2);await cap(`look-bare-${String(-p).replace('.','')}`);}
 face(a,-1.1);press('KeyW');step(.4);await cap('look-walk-a');step(.25);await cap('look-walk-b');release('KeyW');
 return {fp:L.foot.fp};
}
