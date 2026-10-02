// Remembering. A memory is a short piece of the evening ride, replayed from where you were, the
// way you remember it: from your own eyes, on your own bike, the others riding with you. You can
// look around a little; you cannot change anything. Lines come back in pieces. The picture is
// warm and soft and fades in and out (no flicker, no glitches); the sound is muffled.
//
// Each memory is data. The game (game.js) owns the bike, the eye and the light; it runs the ride
// on the evening's own code with a separate copy of the friends, so the present is untouched and
// comes back exactly as it was. This file only says what to show and when.
//
//  from, to   where along Oak Hollow the memory starts, and where the ride stops at the latest
//  lat        your line across the street
//  speed      [distance, m/s] keys for your remembered pace (it eases off where it matters)
//  lines      [{at, who, text, time}] pieces of what was said, by distance
//  watch      who your eyes keep going back to (a friend's key), between two distances
//  detail     what this memory shows that the evening did not (friends.js hooks.detail)
//  lookAt     where that detail looks: {u, v} on Briarwood, or {easement:[s, t]} behind the creek
//  focus      while the detail happens, the view narrows a little onto them: {who, fov}
//  look       how far you can turn your head: yaw left/right, up, down (radians)
//  until      when it has shown what it shows: 'alex-gone' (Alex out of sight down his street)
//  max        a hard limit in seconds
export const MEMORIES={
 'alex-turns':{
  from:548,to:618,lat:-1.3,
  speed:[[548,4.35],[568,4.35],[579,2.3],[585,.7],[589,.32],[597,.5],[606,.9],[618,.9]],
  lines:[
   {at:556,who:'ALEX',text:'“Alright, I’m this way…”',time:2.6},
   {at:566,who:'ALEX',text:'“…tomorrow…”',time:2.2},
  ],
  watch:{who:'alex',from:566,to:640},
  detail:'alex-glance',
  // Off to his side, past the back yards: the creek's woods where it runs on behind the fence
  // (the easement, where the bell was and where his bike was found). Not down his own street.
  lookAt:{easement:[22,0]},
  focus:{who:'alex',fov:38},
  look:{yaw:.72,up:.28,down:.36},
  until:'alex-gone',
  max:48,
 },
};
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
// Times (seconds) for the way in and out.
export const MEMORY_TIMES={out:1.7,in:2.2,back:2.1,ret:1.8};

export function createMemory(host){
 let M=null;
 function start(id){if(M)return false;const spec=MEMORIES[id];if(!spec)return false;M={id,spec,phase:'out',t:0,said:0,ended:false};return true;}
 function update(dt){if(!M)return;M.t+=dt;const T=MEMORY_TIMES,s=M.spec;
  if(M.phase==='out'){host.fade(smooth(M.t/T.out),true);if(M.t>=T.out+.25){host.enter(s);M.phase='in';M.t=0;}}
  else if(M.phase==='in'||M.phase==='play'){
   if(M.phase==='in'){host.fade(1-smooth(M.t/T.in),true);if(M.t>=T.in){host.fade(0,true);M.phase='play';}}
   const d=host.distance;while(M.said<s.lines.length&&d>=s.lines[M.said].at){const l=s.lines[M.said++];host.say(l.who,l.text,l.time);}
   M.play=(M.play||0)+dt;if(host.finished(s)||M.play>s.max||d>=s.to+30){M.phase='back';M.t=0;}}
  else if(M.phase==='back'){host.fade(smooth(M.t/T.back),true);if(M.t>=T.back+.3){host.leave(s);M.phase='return';M.t=0;}}
  else if(M.phase==='return'){host.fade(1-smooth(M.t/T.ret),true);if(M.t>=T.ret){host.fade(0,false);const id=M.id;M=null;host.done(id);}}}
 // Abandon a memory (Restart, Back to title, a QA jump): back to the present at once.
 function reset(){if(!M)return;const inside=M.phase==='in'||M.phase==='play'||M.phase==='back';M=null;if(inside)host.leave(null,true);host.fade(0,false);}
 return {start,update,reset,MEMORIES,get active(){return !!M;},get state(){return M?{id:M.id,phase:M.phase,t:+M.t.toFixed(2),said:M.said}:null;}};
}
