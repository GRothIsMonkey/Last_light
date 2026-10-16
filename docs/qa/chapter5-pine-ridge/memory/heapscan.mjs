export default async function({h}){globalThis.gc?.();await new Promise(r=>setTimeout(r,50));globalThis.gc?.();const mu=process.memoryUsage();
 let objs=0,geos=new Set();h.scene.traverse(o=>{objs++;if(o.geometry)geos.add(o.geometry);});
 console.log('HEAP heapUsed',(mu.heapUsed/1048576|0),'MB arrayBuffers',(mu.arrayBuffers/1048576|0),'MB rss',(mu.rss/1048576|0),'MB sceneObjects',objs,'sceneGeometries',geos.size);}
