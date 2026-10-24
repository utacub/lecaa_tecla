const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright'),fs=require('fs'),path=require('path');
(async()=>{const root=path.resolve(__dirname,'..'),server=require('http').createServer((q,s)=>{s.setHeader('Content-Type','text/html');fs.createReadStream(path.join(root,'dist/LECAA-Tecla.html')).pipe(s)});await new Promise(r=>server.listen(8783,'127.0.0.1',r));const browser=await chromium.launch({executablePath:'/tmp/lecaa-chromium',headless:true,args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:8783/#voice=0');await page.waitForFunction(()=>window.LT);
const result=await page.evaluate(async()=>{
 const issues=[],assert=(x,m)=>{if(!x)issues.push(m)},events=[];const say=TTS.say,play=Phon.playAsync;Settings.voice=true;
 TTS.say=async t=>{events.push(['text',t]);};Phon.playAsync=async l=>{events.push(['sound',l]);};
 setVoiceCfg('shortMode','phonemes');
 for(const [input,expected] of [['a',['a']],['MA',['m','a']],['e\u0300',['è']],['ny',['n','y']]]) {events.length=0;await Voice.sayItem(input);assert(JSON.stringify(events)===JSON.stringify(expected.map(l=>['sound',l])),'phonemes '+input);}
 events.length=0;await Voice.say('pa');assert(events.length===2&&events.every(e=>e[0]==='sound'),'direct short');
 events.length=0;await Voice.sayItem('mar');assert(JSON.stringify(events)==='[["text","mar"]]','three letters');
 events.length=0;await Voice.say('Prem la tecla.');assert(events.length===1&&events[0][1]==='Prem la tecla.','sentence intact');
 events.length=0;await Voice.sayItem('ma',{template:'Escolta: {x}.'});assert(events[1][1]==='m'&&events[2][1]==='a'&&Voice.caption.includes('MA'),'template');
 setVoiceCfg('shortMode','names');events.length=0;await Voice.sayItem('pa');assert(events.length===2&&events[0][1].includes('pe')&&events[1][1].includes('a'),'names');assert(events.every(e=>!/^\p{L}{1,2}$/u.test(e[1])),'bare name synthesis');
 Settings.voice=false;events.length=0;await Voice.sayItem('ma');assert(!events.length,'voice off');await Voice.sayItem('ma',{force:true});assert(events.length===2,'BSN force');Settings.voice=true;setVoiceCfg('shortMode','phonemes');
 let release;Phon.playAsync=l=>{events.push(['sound',l]);return new Promise(r=>release=r);};events.length=0;const pending=Voice.sayItem('ma');Voice.stop();release();await pending;assert(events.length===1,'cancel before second');
 TTS.say=say;Phon.playAsync=play;
 // Real HTMLAudioElement completion must resolve before the next recording starts.
 const original=Phon.playClip,order=[];Phon.playClip=function(clip){order.push({file:clip?.file,time:performance.now()});return original.call(this,clip);};
 await Promise.race([Voice.sayItem('ma'),new Promise((_,reject)=>setTimeout(()=>reject(Error('audio sequence timeout')),5000))]);Phon.playClip=original;
 assert(order.length===2&&order[1].time-order[0].time>300&&!Phon.audio&&!Phon.timer,'real ordered audio');
 VoicePanel.open();return{issues,sequenceGapMs:order[1]?.time-order[0]?.time};
});await page.screenshot({path:path.join(root,'../qa/short-speech-options.png')});console.log(JSON.stringify({result,errors}));if(errors.length||result.issues.length)process.exitCode=1;
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1});
