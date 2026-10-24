const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const server=require('http').createServer((req,res)=>{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/lecaa_tecla\//,'');const f=path.join('dist/pwa',rel||'index.html');if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.webmanifest')?'application/manifest+json':f.endsWith('.png')?'image/png':'text/html');fs.createReadStream(f).pipe(res);});await new Promise(r=>server.listen(8768,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'/tmp/lecaa-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const context=await browser.newContext();const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const profile={id:'existing-profile',name:'Usuari existent',animal:5,color:3,stars:{'1':{best:3,total:3}},collect:{a:1},conf:{},log:[],created:1700000000000,calib:{n:20,found:20}};
 await page.addInitScript(p=>{if(!localStorage.getItem('lecaa-tecla.profiles')){localStorage.setItem('lecaa-tecla.profiles',JSON.stringify([p]));localStorage.setItem('lecaa-tecla.lastProfile',JSON.stringify(p.id));}},profile);
 await page.goto('http://127.0.0.1:8768/lecaa_tecla/#voice=0');await page.waitForFunction(()=>window.LT?.ShellArt.get('detail-house-a'),{timeout:60000});
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('lecaa-tecla.profiles'))[0]);if(JSON.stringify(before)!==JSON.stringify(profile))throw Error('Existing profile changed');
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;});await page.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:60000});
 const cache=await page.evaluate(async()=>({keys:await caches.keys(),controller:navigator.serviceWorker.controller.scriptURL}));await context.setOffline(true);await page.reload();await page.waitForFunction(()=>window.LT?.ShellArt.get('detail-boat'),{timeout:60000});
 const after=await page.evaluate(()=>{LT.App.setScene(new LT.IslandScene(LT.Profiles.list[0]));return {profile:LT.Profiles.list[0],assets:LT.Games.list.filter(g=>LT.ShellArt.get('icon-'+g.id)).length};});
 if(JSON.stringify(after.profile)!==JSON.stringify(profile)||after.assets!==25||errors.length)throw Error(JSON.stringify({after,errors}));
 fs.writeFileSync('qa/shell-pwa-results.json',JSON.stringify({profilePreserved:true,offlineBoot:true,offlineIsland:true,icons:after.assets,cache,errors},null,2));console.log('Existing profile preserved; offline boot, island and 25 icons passed.');await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
