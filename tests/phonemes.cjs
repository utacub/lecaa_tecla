// Run after tools/build.py dist/LECAA-Tecla.html. Uses Playwright from the runtime.
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/sons/phonemes/manifest.json')));
for(const [name,meta] of Object.entries(manifest.files)) {
 const bytes=fs.readFileSync(path.join(root,'assets/sons/phonemes',name));
 if(crypto.createHash('sha256').update(bytes).digest('hex')!==meta.sha256)throw Error(name);
}
(async()=>{
 const server=require('http').createServer((q,s)=>{s.setHeader('Content-Type','text/html');fs.createReadStream(path.join(root,'dist/LECAA-Tecla.html')).pipe(s)});await new Promise(r=>server.listen(8781,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/tmp/lecaa-chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:8781/#scene=bsn&voice=0');await page.waitForFunction(()=>window.LT);
 const result=await page.evaluate(async()=>{
  App.scene.o.so='cap';Phon.stop();
  const context=new AudioContext(),durations={},issues=[];
  for(const [file,url] of Object.entries(PHON_AUDIO)) {const response=await fetch(url),decoded=await context.decodeAudioData(await response.arrayBuffer());durations[file]=decoded.duration;}
  for(const [lang,bank] of Object.entries(PHON_BANK))for(const [voice,clips] of Object.entries(bank.voices))for(const [ph,clip] of Object.entries(clips)){
   if(!durations[clip.file]||clip.start<0||clip.end<=clip.start||clip.end>durations[clip.file]+.06)issues.push({lang,voice,ph,clip,duration:durations[clip.file]});
  }
  if(Phon.url('h')||Phon.url('j','xx')||Phon.url('j','es','jordi'))issues.push('cross-language fallback');
  if(Phon.clip('j','ca')!==Phon.phonemeClip('ʒ','ca')||Phon.clip('j','es')!==Phon.phonemeClip('x','es'))issues.push('language mapping');
  if(Phon.clip('J','ca')!==Phon.clip('j','ca'))issues.push('case');
  for(const [ph,lang] of [['a','ca'],['θ','es'],['ʝ','es']]){
    if(!Phon.playPhoneme(ph,lang))issues.push('play '+ph);
    await new Promise(r=>setTimeout(r,1000));if(Phon.audio)issues.push('did not stop '+ph);
  }
  Phon.playPhoneme('a','ca');Phon.stop();await new Promise(r=>setTimeout(r,100));if(Phon.audio||Phon.timer)issues.push('stop');
  await context.close();return {decodedFiles:Object.keys(durations).length,clips:Object.values(PHON_BANK).reduce((n,b)=>n+Object.values(b.voices).reduce((m,v)=>m+Object.keys(v).length,0),0),issues};
 });
 console.log(JSON.stringify({result,errors}));if(errors.length||result.issues.length)throw Error('phoneme validation failed');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
