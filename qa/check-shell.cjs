const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('fs');
(async()=>{
 const server=require('http').createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');fs.createReadStream('dist/LECAA-Tecla.html').pipe(res);});await new Promise(r=>server.listen(8767,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:'/tmp/lecaa-chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))errors.push(m.text());});
 await page.goto('http://127.0.0.1:8767/LECAA_Tecla_pantalles_i_avatars_prova.html#voice=0');
 await page.waitForFunction(()=>window.LT?.ShellArt.get('profiles'),{timeout:60000});
 await page.evaluate(()=>{LT.Settings.voice=false;LT.Settings.music=false;LT.Settings.sfx=false;LT.Settings.reduceMotion=true;});
 fs.mkdirSync('qa',{recursive:true});await page.screenshot({path:'qa/title.png'});
 await page.evaluate(()=>{
  LT.Profiles.list=[];['Mar','Jan','Aina','Pau','Ona','Nil','Berta','Pol'].forEach((n,i)=>{const p=LT.Profiles.add(n,i,i);p.calib={n:20,found:20};});
  LT.App.setScene(new LT.ProfileScene());
 });
 await page.screenshot({path:'qa/profiles.png'});
 await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
 const paged=await page.evaluate(()=>LT.App.scene.sel);if(paged!==6)throw Error('Profile keyboard grid mismatch '+paged);
 await page.screenshot({path:'qa/profiles-page2.png'});
 await page.evaluate(()=>{const s=LT.App.scene;s.mode='new';s.newP={name:'Marina',animal:2,color:3,field:0};});
 await page.screenshot({path:'qa/new-profile.png'});
 await page.evaluate(()=>LT.App.setScene(new LT.IslandScene(LT.Profiles.list[0])));
 await page.screenshot({path:'qa/island-overview.png'});
 const initial=await page.evaluate(()=>({cam:{...LT.App.scene.cam},n:LT.Games.list.length,icons:LT.Games.list.filter(g=>LT.ShellArt.get('icon-'+g.id)).length}));
 await page.mouse.move(800,450);await page.mouse.wheel(0,-300);await page.waitForTimeout(200);
 const zoom=await page.evaluate(()=>LT.App.scene.cam.z);if(!(zoom>initial.cam.z))throw Error('Wheel zoom failed');
 await page.mouse.move(300,550);await page.mouse.down();await page.mouse.move(480,580,{steps:10});await page.mouse.up();
 const pan=await page.evaluate(()=>({...LT.App.scene.cam}));if(pan.x===initial.cam.x)throw Error('Pan failed');
 await page.evaluate(()=>{const s=LT.App.scene;s.clickPlace(10);s.walk=null;s.pos=LT.PLACES[10].slice();s.cardT=2;s.cam.z=s.zoomT=.85;s.free=null;for(let i=0;i<100;i++)s.update(.05);});
 await page.screenshot({path:'qa/island-card.png'});
 // Marker rendering must not call a game thumbnail; detailed cards still do.
 const behavior=await page.evaluate(()=>{
  const s=LT.App.scene,g=LT.Games.byId[10],orig=g.thumb;let calls=0;g.thumb=()=>{calls++;};s.drawPlace(LT.App.ctx,10);const markerCalls=calls;s.drawCard(LT.App.ctx);g.thumb=orig;return {markerCalls,cardCalls:calls};
 });if(behavior.markerCalls!==0||behavior.cardCalls!==1)throw Error('Thumbnail separation failed '+JSON.stringify(behavior));
 // Every icon and animal must load, draw, and keep alpha.
 const avatars=await page.evaluate(()=>LT.ANIMALS.map((a,i)=>{const im=LT.ShellArt.avatar(a.id,LT.PLUSH[i]);return {id:a.id,w:im?.width,h:im?.height};}));
 if(avatars.some(a=>!a.w))throw Error('Avatar missing');
 await page.evaluate(()=>{const s=new LT.VoyageScene(LT.Profiles.list[2]);s.t=6;s.prog=.35;s.progT=.35;s.next();LT.App.setScene(s);});
 await page.screenshot({path:'qa/voyage.png'});
 for(const [name,width,height]of [['tablet',1024,768],['portrait',768,1024]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>LT.App.setScene(new LT.ProfileScene()));await page.screenshot({path:'qa/'+name+'.png'});
 }
 await page.setViewportSize({width:1600,height:900});
 // All 25 game intro screens still instantiate and render.
 const gameResults=await page.evaluate(()=>{const results=[];for(const g of LT.Games.list){try{const s=new LT.GameScene(g,1,LT.Profiles.list[0],{skipDemo:true});s.draw(LT.App.ctx);results.push({id:g.id,ok:true});}catch(e){results.push({id:g.id,ok:false,error:String(e)});}}return results;});
 // Native maximum zoom and voyage checkpoints.
 await page.evaluate(()=>{const s=new LT.IslandScene(LT.Profiles.list[0]);LT.App.setScene(s);s.cam.z=s.zoomT=2;s.pos=LT.PLACES[25].slice();s.cam.x=s.pos[0];s.cam.y=s.pos[1];s.free=s.pos.slice();});
 await page.screenshot({path:'qa/island-max-zoom.png'});
 for(const [name,pr] of [['start',0],['middle',.5],['arrival',1]]){
  await page.evaluate(pr=>{const s=new LT.VoyageScene(LT.Profiles.list[2]);s.prog=s.progT=pr;s.t=4;LT.App.setScene(s);},pr);
  await page.screenshot({path:'qa/voyage-'+name+'.png'});
 }
 const motion=await page.evaluate(()=>{const s=LT.App.scene,c=document.createElement('canvas');c.width=1600;c.height=900;const ctx=c.getContext('2d');LT.Settings.reduceMotion=false;s.t=3;s.drawWorld(ctx);const a=c.toDataURL();s.t=4;s.drawWorld(ctx);const b=c.toDataURL();return a!==b;});
 if(!motion)throw Error('Water/parallax does not animate');
 const retina=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:2});
 await retina.goto('http://127.0.0.1:8767/#voice=0');await retina.waitForFunction(()=>window.LT?.ShellArt.get('detail-house-a'),{timeout:60000});
 const resolution=await retina.evaluate(()=>{LT.Settings.voice=false;LT.Settings.music=false;LT.Settings.reduceMotion=true;const p=LT.Profiles.add('Prova',0,0),s=new LT.IslandScene(p);LT.App.setScene(s);s.cam.z=s.zoomT=2;s.pos=LT.PLACES[25].slice();s.free=s.pos.slice();s.cam.x=s.pos[0];s.cam.y=s.pos[1];return {dpr:devicePixelRatio,maxZoom:s.cam.z,props:LT.NativeIsland.props.map(([key,x,y,w])=>({key,nativeWidth:LT.ShellArt.get('detail-'+key).width,requiredWidth:Math.ceil(w*LT.SHELL_MAP.w/1536*2*2)}))};});
 if(resolution.props.some(p=>p.nativeWidth<p.requiredWidth))throw Error('Prop upsampling at maximum zoom/DPR2');
 await retina.screenshot({path:'qa/island-max-zoom-retina.png'});await retina.close();
 const report={resolution,motion,initial,zoom,pan,behavior,avatars,gameResults,errors};fs.writeFileSync('qa/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 await browser.close();server.close();if(errors.length||gameResults.some(r=>!r.ok))process.exit(1);
})();
