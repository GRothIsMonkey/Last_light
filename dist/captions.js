// Adaptive captions: no box behind the words. The text reads light (warm off-white) over dark scenes
// and dark (charcoal) over bright ones, with a soft edge of the opposite tone that strengthens only when
// the background is busy or in between.
//
// What is behind the caption is measured cheaply: a few times a second, a small strip of the rendered
// frame where the caption sits is read back asynchronously (WebGL2 pixel-pack buffer and a fence, so the
// GPU is never waited on; no full-frame read). Until a measurement arrives, or where readback is not
// available, an estimate from the light of the scene and where the camera is pointing stands in. The
// choice of tone has hysteresis in both contrast and time, and the color itself eases between tones,
// so foliage, sky, police lights or a flashlight hotspot passing behind the words never make it flicker.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};
// Relative luminance of the two tones (WCAG): warm off-white #fff4e2, charcoal #1e1d1b.
const LIGHT={rgb:[255,244,226],Y:.906,label:[248,220,169]},DARK={rgb:[30,29,27],Y:.0124,label:[92,62,26]};
export function createCaptionTone({renderer,el}){
 const S={lum:.03,lo:.02,hi:.05,mode:0,mix:0,want:0,wantT:0,source:'estimate',samples:0,last:'',cLight:20,cDark:1.2,halo:.5,readback:false};
 let gl=null,gl2=false,pbo=null,buf=null,pending=null,nextAt=0,pixels=null;
 try{gl=renderer?.getContext?.()||null;gl2=!!gl&&typeof WebGL2RenderingContext!=='undefined'&&gl instanceof WebGL2RenderingContext;}catch{gl=null;}
 // The strip behind the caption, in drawing-buffer pixels (bottom-left origin).
 function region(){const cv=renderer.domElement,W=cv.width,H=cv.height,cw=globalThis.innerWidth||W,ch=globalThis.innerHeight||H,sx=W/cw,sy=H/ch;
  const bottom=Math.max(116,ch*.17)+(cw<=700?Math.max(37,ch*.05):0),capH=46,wCss=Math.min(760,cw*.86)*.62,cx=cw/2,cy=ch-bottom-capH/2;
  const w=Math.max(8,Math.min(224,Math.round(wCss*sx))),h=Math.max(4,Math.min(40,Math.round(capH*sy))),x=Math.round(cx*sx-w/2),y=Math.round(H-cy*sy-h/2);
  return {x:clamp(x,0,W-w),y:clamp(y,0,H-h),w,h};}
 function analyze(data,n){const ys=[];for(let i=0;i<n;i+=4*3){ys.push(.2126*lin(data[i])+.7152*lin(data[i+1])+.0722*lin(data[i+2]));}
  if(!ys.length)return;ys.sort((a,b)=>a-b);const q=f=>ys[Math.min(ys.length-1,Math.floor(f*ys.length))];let m=0;for(const y of ys)m+=y;
  S.lum=m/ys.length;S.lo=q(.15);S.hi=q(.85);S.source='frame';S.samples++;}
 // Called right after the frame is drawn (the drawing buffer is still there).
 function sample(now=performance.now()){if(!gl)return;
  try{if(pending){const st=gl.clientWaitSync(pending.sync,0,0);if(st===gl.ALREADY_SIGNALED||st===gl.CONDITION_SATISFIED){gl.bindBuffer(gl.PIXEL_PACK_BUFFER,pbo);gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,buf,0,pending.n);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);gl.deleteSync(pending.sync);analyze(buf,pending.n);pending=null;}
    else if(st===gl.WAIT_FAILED){gl.deleteSync(pending.sync);pending=null;}else return;}
   if(now<nextAt)return;nextAt=now+220;const r=region(),n=r.w*r.h*4;
   if(gl2){if(!pbo){pbo=gl.createBuffer();}if(!buf||buf.length<n){buf=new Uint8Array(n);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,pbo);gl.bufferData(gl.PIXEL_PACK_BUFFER,n,gl.STREAM_READ);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);}
    gl.bindBuffer(gl.PIXEL_PACK_BUFFER,pbo);gl.readPixels(r.x,r.y,r.w,r.h,gl.RGBA,gl.UNSIGNED_BYTE,0);gl.bindBuffer(gl.PIXEL_PACK_BUFFER,null);pending={sync:gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0),n};gl.flush();S.readback=true;}
   else{const w=Math.min(r.w,64),h=Math.min(r.h,12);if(!pixels||pixels.length<w*h*4)pixels=new Uint8Array(w*h*4);gl.readPixels(r.x+(r.w-w)/2|0,r.y+(r.h-h)/2|0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);analyze(pixels,w*h*4);nextAt=now+500;}}
  catch{gl=null;}}
 // A stand-in when nothing has been measured: how bright the scene is, and how much sky is behind the words.
 function estimate({day=0,night=0,deep=0,pitch=0,flash=0,dusk=0}){const sky=clamp((pitch+.18)/.35,0,1),ground=day?.16:(1-night)*(.12-.08*dusk)+night*.012*(1-deep*.5),skyL=day?.62:(1-night)*(.42-.2*dusk)+night*.03;
  const y=ground*(1-sky)+skyL*sky+flash*.18;return {lum:y,lo:y*.6,hi:y*1.4};}
 // Every frame: blend toward the measured (or estimated) background; pick the tone with hysteresis.
 function update(dt,{fade=0,fadeY=.01,est=null}={}){if(S.source!=='frame'&&est){const e=estimate(est);S.lum+=(e.lum-S.lum)*(1-Math.exp(-4*dt));S.lo=S.lum*.6;S.hi=S.lum*1.4;}
  // A fade overlay is in front of the frame too.
  const mixBg=v=>v*(1-fade)+fadeY*fade,lo=mixBg(S.lo),hi=mixBg(S.hi);
  // Contrast each tone would have against the worst part of the strip for it.
  S.cLight=(LIGHT.Y+.05)/(hi+.05);S.cDark=(lo+.05)/(DARK.Y+.05);const better=S.cDark>S.cLight*(S.mode?1/1.25:1.25)?1:0;
  if(better!==S.mode){S.wantT+=dt;if(S.wantT>.55){S.mode=better;S.wantT=0;}}else S.wantT=0;
  S.mix+=(S.mode-S.mix)*(1-Math.exp(-dt/.32));if(Math.abs(S.mode-S.mix)<.002)S.mix=S.mode;
  const c=S.mode?S.cDark:S.cLight;S.halo+=(clamp((6-c)/4.5,.28,.95)-S.halo)*(1-Math.exp(-dt/.5));apply();}
 function apply(){const m=S.mix,col=LIGHT.rgb.map((v,i)=>Math.round(v+(DARK.rgb[i]-v)*m)),lab=LIGHT.label.map((v,i)=>Math.round(v+(DARK.label[i]-v)*m));
  // The edge is the opposite tone: a dark soft shadow under light words, a pale glow round dark ones.
  const sh=Math.round(14*(1-m)+236*m),a=(.35+.5*S.halo).toFixed(2),a2=(.18+.38*S.halo).toFixed(2);
  const key=col.join()+'|'+a;if(key===S.last)return;S.last=key;
  const vars={'--cap-color':`rgb(${col.join(',')})`,'--cap-shadow':`0 0 2px rgba(${sh},${sh},${sh},${a}),0 1px 3px rgba(${sh},${sh},${sh},${a}),0 0 14px rgba(${sh},${sh},${sh},${a2}),0 0 26px rgba(${sh},${sh},${sh},${(a2*.7).toFixed(2)})`,'--cap-label':`rgb(${lab.join(',')})`};
  S.vars=vars;if(el?.style){for(const [k,v] of Object.entries(vars)){if(el.style.setProperty)el.style.setProperty(k,v);else el.style[k]=v;}}}
 // A new scene (Start over, a jump, Continue): what was read from the old one is thrown away, unread.
 function reset(){if(pending){try{gl?.deleteSync(pending.sync);}catch{}pending=null;}nextAt=0;S.source='estimate';S.samples=0;S.wantT=0;}
 return {sample,update,reset,estimate,region,get state(){return {lum:+S.lum.toFixed(4),lo:+S.lo.toFixed(4),hi:+S.hi.toFixed(4),mode:S.mode?'dark':'light',mix:+S.mix.toFixed(3),contrast:+(S.mode?S.cDark:S.cLight).toFixed(2),halo:+S.halo.toFixed(2),source:S.source,samples:S.samples,readback:S.readback};},S};
}
