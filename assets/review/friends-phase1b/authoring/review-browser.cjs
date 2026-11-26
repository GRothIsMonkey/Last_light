const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const http=require('http'),fs=require('fs'),path=require('path');
async function browserSession(run){
 const root=path.resolve(process.env.LL_TEST_DIST||'dist'),server=http.createServer((req,res)=>{
   const url=new URL(req.url,'http://localhost');if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
   if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404).end();return;}
   res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.glb':'model/gltf-binary','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');
   fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));let b;
 try{
   b=await chromium.launch({executablePath:process.env.CHROME_EXECUTABLE||undefined,headless:true,args:['--disable-background-timer-throttling','--disable-renderer-backgrounding','--use-angle=d3d11','--enable-unsafe-swiftshader']});
   const page=await b.newPage({viewport:{width:800,height:560},deviceScaleFactor:1});page.on('pageerror',e=>console.log('PAGE ERROR',e.message));await run(page,'http://127.0.0.1:'+server.address().port);
 }finally{if(b)await b.close();await new Promise(r=>server.close(r));}
}
module.exports={browserSession};
