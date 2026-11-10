// (being built: Acts II to IV follow)
export function townActs(H){const {C,go,task,wait,lines,N,objective}=H;
 const ACT2={sceneQuiet(from){go('a1-quiet');C.fadeIn=0;task('stub',(function*(){yield* lines([N('(Act II follows.)',{time:2})]);yield* wait(1);C.endT=0;})());},update(){},reset(){}};
 return {SCENE:{},ACT2,update(){},reset(){}};}
