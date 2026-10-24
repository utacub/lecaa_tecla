const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'),fs=require('fs'),path=require('path');
(async()=>{const root=path.resolve(__dirname,'..');const server=require('http').createServer((q,s)=>{s.setHeader('Content-Type','text/html');fs.createReadStream(path.join(root,'dist/LECAA-Tecla.html')).pipe(s)});await new Promise(r=>server.listen(8782,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'/tmp/lecaa-chromium',headless:true,args:['--no-sandbox']});try{const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:8782/#voice=0');await page.waitForFunction(()=>window.LT);
const result=await page.evaluate(()=>{
 const issues=[],assert=(v,m)=>{if(!v)issues.push(m)};assert(Settings.upper===true,'uppercase default');Settings.voice=false;Settings.sfx=false;Settings.music=false;Settings.errorSupport=false;
 // Shared target handling: no target, immediate new target, sequential typing, actual error.
 let hits=0,misses=0,targets=[];const typer=new Typer({hit(){hits++},miss(){misses++}},{targets:()=>targets,onDone(){}});
 typer.key('a');assert(misses===0,'empty typer');targets=[{text:'ab'}];typer.key('a');typer.key('b');assert(hits===2&&misses===0,'rapid word');targets=[{text:'c'}];typer.key('x');assert(misses===1,'real typo');
 let scenes=0,correct=0,empty=0;
 for(const def of Games.list)for(let level=1;level<=6;level++){
  const s=new GameScene(def,level,null,{skipDemo:true,preview:true});s.state='play';if(s.g.start)s.g.start();scenes++;
  // No application loop: deterministic simulation across emergence and transition phases.
  for(let frame=0;frame<100;frame++){
   s.update(.08);if(s.state!=='play')break;
   const ex=s.g.expected?.(),before=s.api.misses;
   if(ex){s.onKey(ex);assert(s.api.misses===before,`${def.id}/${level} correct ${ex} frame ${frame}`);correct++;}
   else {s.onKey('a');assert(s.api.misses===before,`${def.id}/${level} empty frame ${frame}`);empty++;}
  }
 }
 // Later balloons: test the portion visible before the old centre-at-H-60 threshold.
 for(let level=1;level<=6;level++){
  const def=Games.byId[11],create=def.create;let captured;
  def.create=api=>{api.typer=o=>(captured=new Typer(api,o));return create(api);};
  const s=new GameScene(def,level,null,{skipDemo:true,preview:true});def.create=create;s.state='play';s.update(.016);
  while(s.g.expected())s.onKey(s.g.expected());
  let early=false;
  for(let i=0;i<1000;i++){
   s.update(.016);const b=captured.live()[0];if(!b)continue;
   const py=level>=5?b.y+150:b.y+188;
   if(py>840){const before=s.api.hits;s.onKey(b.text[0]);assert(s.api.hits===before+1,'balloon partial label '+level);early=true;break;}
  }
  assert(early,'no early balloon interval '+level);
 }
 // Actual first rendered letter, including partial entry and fade-in, must score immediately.
 const emergence=[];
 for(const id of [3,8,10,11,13,14,15,18,22,24]) {
  const s=new GameScene(Games.byId[id],1,null,{skipDemo:true,preview:true});s.state='play';if(s.g.start)s.g.start();
  let checked=false;
  for(let frame=0;frame<500&&!checked;frame++) {
   s.update(.016);const plates=[],original=drawPlate;
   drawPlate=function(ctx,txt,x,y,o={}) { if(txt && !['ok','wrong','bad'].includes(o.state) && (o.alpha??1)>0 && (o.scale??1)>0 && x>-150 && x<1750 && y>-50 && y<950)plates.push(String(txt));return original(ctx,txt,x,y,o); };
   try{s.g.draw(App.ctx);}finally{drawPlate=original;}
   if(plates.length){const expected=s.g.expected?.(),key=expected||plates[0][0],before=s.api.hits;s.onKey(key);assert(s.api.hits>before,`first visible letter not accepted: ${id}, frame ${frame}`);emergence.push({id,frame});checked=true;}
  }
  assert(checked,'no rendered target '+id);
 }
 const s=new GameScene(Games.byId[11],1,null,{skipDemo:true,preview:true});s.state='play';
 s.api.miss('a','b');assert(!s.halt&&!s.missFx&&!s.api.freeze,'support off');
 Settings.errorSupport=true;s.api.miss('a','b');assert(s.halt&&s.missFx&&s.api.freeze>0,'support on');s.onKey(' ');assert(!s.halt,'resume');
 s.api.freeze=0;const n=s.api.misses;s.onKey('x',{repeat:true});assert(s.api.misses===n,'key repeat');
 Settings.upper=false;Settings.errorSupport=false;saveSettings();return{issues,scenes,correct,empty,emergence};
});
await page.reload();await page.waitForFunction(()=>window.LT);const saved=await page.evaluate(()=>({upper:Settings.upper,support:Settings.errorSupport}));if(saved.upper!==false||saved.support!==false)result.issues.push('settings persistence');
await page.evaluate(()=>{const p=Profiles.add('Prova',0,0);App.setScene(new IslandScene(p));App.scene.opts=true;App.scene.optsT=2;});await page.waitForTimeout(300);await page.screenshot({path:path.join(root,'../qa/input-options.png')});
console.log(JSON.stringify({result,saved,errors}));if(result.issues.length||errors.length)process.exitCode=1;
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
