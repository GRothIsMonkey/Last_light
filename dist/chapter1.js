// Chapter One (stub while the director is built): the night after the ride.
export function createChapter1(o){
 let t=0;
 const api={night:1,deep:0,arPlain:false,sources:[],urgent:false,glanceMax:.85,hideBell:false,pose:null,
  begin(how){t=0;},update(dt){t+=dt;},reset(){t=0;},
  attention(){return null;},blockers(){return [];},spot(){return null;},act(){},canDismount(){return true;},canRemount(){return true;},onFoot(){},
  get state(){return {t};}};
 return api;
}
