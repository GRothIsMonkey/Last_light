// Wheel contact feedback: compare authored surface heights, excluding gradual terrain grade.
export function createRideContact(){
 let previous=null,offset=0,velocity=0,events=[];
 return {
  reset(){previous=null;offset=velocity=0;events=[];},
  update(dt,{d,lat,yaw,speed,geom,groundY,baseY,impact}){
   const contacts=[-geom.front,-geom.rear].map(z=>({d:d+Math.cos(yaw)*z,lat:lat+Math.sin(yaw)*z}));
   const heights=contacts.map(p=>groundY(p.d,p.lat));
   const levels=contacts.map((p,i)=>heights[i]-baseY(p.d,p.lat));
   if(previous&&dt>0&&dt<.1&&speed>.08)for(let i=0;i<2;i++){
    const delta=levels[i]-previous[i];
    if(Math.abs(delta)>.065&&Math.abs(delta)<.22){
     const strength=Math.min(1,speed/4)*Math.min(1,Math.abs(delta)/.13);
     velocity+=(delta>0?1:-1)*strength*.055;
     const e={wheel:i===0?'front':'rear',direction:delta>0?'up':'down',strength,d,lat};
     events.push(e);if(events.length>12)events.shift();impact?.(e);
    }
   }
   previous=levels;
   velocity+=(-offset*240-velocity*23)*dt;offset+=velocity*dt;
   offset=Math.max(-.008,Math.min(.008,offset));
   return {height:(heights[0]+heights[1])/2,pitch:Math.atan2(heights[0]-heights[1],geom.wheelbase),offset};
  },
  get state(){return {offset,events:events.slice()};}
 };
}
