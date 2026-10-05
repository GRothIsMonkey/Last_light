// Player tension: how frightened the player's body is, 0 (calm) to 1 (panic). Chapter Three is the first
// to use it; any later chapter can. The story *authors* it from the player's situation (what has just
// happened, how dark and quiet it is, what they expect), never from where anything is: it is not a
// detector. It sometimes rises before something happens, sometimes rises and nothing happens, and
// stays up after a scare has passed, coming down slowly.
//
// The value moves smoothly toward the authored target: rising at a bounded rate (a jolt is quick but
// never a jump), falling as a slow decay, optionally held for a while first. The body reads it as a
// heartbeat (inaudible when calm, fading in, quickening) and, higher up, breathing. Exertion (running)
// adds breath, and a little heartbeat only once tension is already up.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
export const HEART={rest:64,max:152,audibleFrom:.2,fullAt:.75};

export function createTension(){
 const T={value:0,target:0,rise:.3,fall:.03,hold:0,exertion:0,log:[],
  // Author a new target. rise: how fast it may climb (per second, at most); fall: decay rate (per second,
  // fraction of the gap); hold: seconds before it may start to fall again.
  set(target,{rise=.3,fall=.03,hold=0,why=''}={}){T.target=clamp(target,0,1);T.rise=rise;T.fall=fall;T.hold=Math.max(T.hold,hold);if(why)T.note(why);},
  // A jolt: up quickly toward (at least) this level, then held a moment before it may ease.
  jolt(level,{rise=1.6,hold=2.5,fall=.04,why=''}={}){T.target=Math.max(T.target,clamp(level,0,1));T.rise=Math.max(T.rise,rise);T.hold=Math.max(T.hold,hold);T.fall=fall;if(why)T.note(why);},
  // Back down toward a level slowly (the danger is over; the body does not believe it yet).
  ease(level,{fall=.025,hold=0,why=''}={}){T.target=Math.min(T.target,clamp(level,0,1));T.fall=fall;T.hold=Math.max(T.hold,hold);if(why)T.note(why);},
  note(why){T.log.push({why,value:+T.value.toFixed(3),target:+T.target.toFixed(3)});if(T.log.length>80)T.log.shift();},
  reset(){T.value=0;T.target=0;T.rise=.3;T.fall=.03;T.hold=0;T.exertion=0;T.log.length=0;T.maxRate=0;},
  // exertion: 0..1 (sprinting, out of breath); comes and goes on its own time scale.
  update(dt,{exertion=0}={}){
   T.exertion+=(exertion-T.exertion)*(1-Math.exp(-(exertion>T.exertion?1.2:.35)*dt));
   if(T.hold>0)T.hold=Math.max(0,T.hold-dt);
   const gap=T.target-T.value,before=T.value;
   // Rising: an eased approach whose speed is capped (no step changes, even for a jolt).
   if(gap>0)T.value+=Math.min(gap,Math.max(.012*dt,Math.min(T.rise*dt,gap*(1-Math.exp(-3.2*dt)))));
   // Falling: a slow exponential decay, only once any hold is over.
   else if(gap<0&&T.hold<=0)T.value+=gap*(1-Math.exp(-T.fall*dt));
   T.value=clamp(T.value,0,1);if(dt>0)T.maxRate=Math.max(T.maxRate||0,Math.abs(T.value-before)/dt);return T.value;},
  // What the body does with it.
  get heart(){const v=T.value,e=T.exertion*smooth((v-.25)/.3)*.35,x=clamp(v+e,0,1);
   return {bpm:HEART.rest+(HEART.max-HEART.rest)*Math.pow(x,1.25),gain:smooth((v-HEART.audibleFrom)/(HEART.fullAt-HEART.audibleFrom))*(.45+.55*x),
    breath:clamp(smooth((v-.42)/.45)*.8+T.exertion*.55,0,1),breathRate:14+20*clamp(Math.max(v-.3,0)/.7+T.exertion*.6,0,1)};},
  get state(){const h=T.heart;return {value:+T.value.toFixed(3),target:+T.target.toFixed(3),hold:+T.hold.toFixed(2),bpm:+h.bpm.toFixed(1),gain:+h.gain.toFixed(3),breath:+h.breath.toFixed(3),exertion:+T.exertion.toFixed(3)};}};
 return T;
}
