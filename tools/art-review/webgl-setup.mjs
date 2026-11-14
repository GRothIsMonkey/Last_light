// Optional software WebGL capture backend: the shipped Three.js renderer and shaders,
// real CanvasTextures, and the game's deterministic input harness. This is not a browser.
import {createRequire} from 'node:module';
export async function setup(THREE,canvas){
 const require=createRequire(process.env.RENDER_MODULES+'/package.json'),createGL=require('gl'),{createCanvas,loadImage,Image,Canvas}=require('@napi-rs/canvas');
 const create=document.createElement.bind(document);
 document.createElement=tag=>tag==='canvas'?createCanvas(1,1):create(tag);
 document.createElementNS=(_,tag)=>document.createElement(tag);
 globalThis.ImageBitmap=Image;globalThis.HTMLCanvasElement=Canvas;
 globalThis.createImageBitmap=async blob=>loadImage(Buffer.from(await blob.arrayBuffer()));
 globalThis.devicePixelRatio=1;globalThis.innerWidth=+(process.env.RENDER_WIDTH||1280);globalThis.innerHeight=+(process.env.RENDER_HEIGHT||800);
 canvas.width=innerWidth;canvas.height=innerHeight;canvas.removeEventListener=()=>{};
 const gl=createGL(innerWidth,innerHeight,{preserveDrawingBuffer:true,antialias:false,alpha:false});
 if(!gl)throw Error('Software WebGL could not create a context');
 // napi Canvas exposes a data() method; headless-gl mistakes it for ImageData.data.
 // Supply the same RGBA pixels explicitly, without changing the runtime texture.
 for(const name of ['texImage2D','texSubImage2D']){const raw=gl[name].bind(gl);gl[name]=(...args)=>{const j=args.length-1,im=args[j];if(im?.getContext){const data=im.getContext('2d').getImageData(0,0,im.width,im.height);args[j]={width:im.width,height:im.height,data:data.data};}return raw(...args);};}
 globalThis.renderContext=gl;
 globalThis.FakeRenderer=class extends THREE.WebGLRenderer{
  constructor(){super({canvas,context:gl});const draw=this.render.bind(this),ratio=this.setPixelRatio.bind(this);this.render=(s,c)=>{if(this.getRenderTarget())draw(s,c);};this.setPixelRatio=()=>ratio(1);
   this.debug.onShaderError=(g,p,vs,fs)=>{throw Error('Shader: '+g.getProgramInfoLog(p)+'\n'+g.getShaderInfoLog(vs)+'\n'+g.getShaderInfoLog(fs));};
   this.capture=(s,c)=>{const start=performance.now();draw(s,c);gl.finish();return {ms:performance.now()-start,...this.info.render};};
  }
 };
 console.log('Actual renderer backend:',gl.getParameter(gl.VERSION),gl.getParameter(gl.RENDERER));
}
