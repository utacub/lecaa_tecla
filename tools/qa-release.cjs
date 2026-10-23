const fs=require('fs'),path=require('path'),http=require('http'),crypto=require('crypto');
const {chromium}=require('playwright');
const {execFileSync}=require('child_process');
const root=path.resolve(__dirname,'..');
(async()=>{
 let phase='previous';const errors=[];const report={};
 const previousDir=path.join(root,'release-qa/previous');fs.mkdirSync(previousDir,{recursive:true});
 for(const name of ['index.html','sw.js'])if(!fs.existsSync(path.join(previousDir,name)))fs.writeFileSync(path.join(previousDir,name),execFileSync('git',['show','e213290501276b2cae41c871bb787102c884816f:dist/pwa/'+name],{cwd:root}));
 const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');let rel=u.pathname.replace(/^\/lecaa_tecla\//,'')||'index.html';
  if(rel.includes('..')){res.writeHead(400);return res.end();}
  let file=path.join(root,'dist/pwa',rel);
  if(phase==='previous'&&['index.html','sw.js'].includes(rel))file=path.join(root,'release-qa/previous',rel);
  if(!fs.existsSync(file)){res.writeHead(404);return res.end();}
  res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.webmanifest')?'application/manifest+json':rel.endsWith('.png')?'image/png':'text/html;charset=utf-8');res.end(fs.readFileSync(file));
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port,url=origin+'/lecaa_tecla/';
 const browser=await chromium.launch({executablePath:process.env.LECAA_CHROMIUM,headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:768}});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(url+'#play=1&voice=0');await page.waitForFunction(()=>window.LT&&App.scene);await page.evaluate(async()=>{await navigator.serviceWorker.ready;await caches.open('lecaa-docs-release-sentinel');localStorage.setItem('lecaa-tecla.release-sentinel','preserved');});
  await page.waitForFunction(()=>!!navigator.serviceWorker.controller);await page.evaluate(()=>window.previousController=navigator.serviceWorker.controller);
  phase='new';await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update();});
  const expected=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'dist/pwa/index.html'))).digest('hex').slice(0,10);
  await page.waitForFunction(async expected=>(await caches.keys()).includes('lecaa-tecla-'+expected),expected,{timeout:30000});
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==window.previousController);
  await page.reload();await page.waitForFunction(()=>window.LT&&App.scene&&typeof Art!=='undefined');
  report.upgrade=await page.evaluate(()=>({sentinel:localStorage.getItem('lecaa-tecla.release-sentinel'),scope:navigator.serviceWorker.controller?.scriptURL}));
  await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.LT&&App.scene&&typeof Art!=='undefined');
  report.offline=await page.evaluate(async()=>{await Art.init();Settings.voice=false;Settings.sfx=false;Settings.music=false;Music.stop();return{resources:Object.keys(ART_DATA).length,missing:Object.keys(ART_DATA).filter(k=>!Art.get(k)),caches:await caches.keys(),games:Object.keys(Games.byId).map(id=>{try{const s=new GameScene(Games.byId[id],1,Profiles.cur,{skipDemo:true,preview:true});App.setScene(s);s.startPlay();for(let i=0;i<100;i++)s.update(1/30);App.frame(0);return{id:+id,ok:true}}catch(e){return{id:+id,ok:false,error:e.message}}}),cars:Array.from({length:64},(_,i)=>!!Art.carFrame(Math.floor(i/16),i%16*Math.PI/8).image).every(Boolean)}});
  report.views=[];
  for(const [width,height] of [[1366,768],[1024,768],[768,1024]]){await page.setViewportSize({width,height});for(const id of [1,2,3,4,5,7,10,23]){await page.evaluate(id=>{const s=new GameScene(Games.byId[id],5,Profiles.cur,{skipDemo:true,preview:true});App.setScene(s);s.startPlay();for(let i=0;i<80;i++)s.update(1/30);App.resize();App.frame(0);},id);report.views.push({width,height,id,ok:true});}}
  report.manifest=JSON.parse(fs.readFileSync(path.join(root,'dist/pwa/manifest.webmanifest'),'utf8'));
  report.browser=browser.version();report.errors=errors;report.passed=!errors.length&&!report.offline.missing.length&&report.offline.games.every(g=>g.ok)&&report.offline.cars&&report.upgrade.sentinel==='preserved'&&report.offline.caches.includes('lecaa-docs-release-sentinel')&&!report.offline.caches.includes('lecaa-tecla-ea841d3147')&&report.manifest.id==='/lecaa_tecla/'&&report.manifest.scope==='/lecaa_tecla/';
  fs.writeFileSync(path.join(root,'docs/qa/release-pwa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
 }catch(e){console.log(JSON.stringify({failure:e.message,errors,debug:await page.evaluate(async()=>({hasArt:typeof Art,ready:!!window.LT,caches:await caches.keys(),length:document.documentElement.outerHTML.length}))}));throw e;}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1});
