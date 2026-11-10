// (stub while the chapter is being built)
export function scenes9(X){const {C,o,go,task,wait,lines,N,objective,checkpoint,end,dayWorld,setDay,main,sam,joinFoot}=X;
 function scene(from){go('a1-arrive');dayWorld();setDay('AUGUST 27',6.5,'dawn');const q=main(700,0);o.bikeAway?.(true);o.placePlayer({x:q.x,z:q.z,a:0,mode:'walk',bike:null});joinFoot(sam,{x:q.x+1,z:q.z+1},0);checkpoint('a1-arrive');
  task('stub',(function*(){C.fadeIn=0;yield* lines([N('(Aftermath I: stub.)',{time:2})]);yield* wait(1);C.endT=0;})());}
 function begin(){go('a1-black');C.cardT=0;o.fade(1);objective('');task('open',(function*(){yield* wait(6.4);scene('start');})());}
 function jump(section){if(section==='aftermath1-start'){begin();return;}scene('jump');if(section==='aftermath1-end')C.endT=0;}
 function update(dt){if(C.endT>=0){C.endT+=dt;o.fade(Math.min(1,C.endT/3));if(C.endT>3.4){C.endT=-1;go('a1-end');end();}}}
 return {begin,jump,update,reset(){},canDismount:()=>false,canRemount:()=>false};}
