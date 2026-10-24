const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
for(const [f,n] of [['Andika-400.woff2','Andika'],['Andika-700.woff2','Andika'],['Nunito-900.woff2','Nunito']])GlobalFonts.registerFromPath('assets/'+f,n);
let clock=0,timers=[];const tick=dt=>{clock+=dt;const ready=timers.filter(t=>t.at<=clock);timers=timers.filter(t=>t.at>clock);ready.forEach(t=>t.fn());};
const nop=()=>{},stub=new Proxy({}, {get:()=>nop});
const sandbox={console,Math,setTimeout:(fn,ms=0)=>{const t={fn,at:clock+ms/1000};timers.push(t);return t;},clearTimeout:t=>{timers=timers.filter(x=>x!==t);},tick,performance:{now:()=>0},document:{createElement:()=>createCanvas(1,1)},window:{},navigator:{},localStorage:{getItem:()=>null,setItem:nop},addEventListener:nop,requestAnimationFrame:nop,Image:require('@napi-rs/canvas').Image,Audio2:{ctx:null,now:()=>0},noise:nop,tone:nop,Sfx:stub,Music:stub,Voice:{say:nop,init:nop,stop:nop},PHON_ANNA:{},LOGO_UTAC:'',CREDIT_LOGOS:[]};
const cx=vm.createContext(sandbox);
for(const f of ['core','textures','critters','art','art-tanda3','art-fruit','art-tanda4','art-final','content','ui','play','avatars','scenes','voyage'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),cx,{filename:f+'.js'});
for(const id of [24,25])vm.runInContext(fs.readFileSync('src/games/g'+String(id).padStart(2,'0')+'.js','utf8').replace('        expected()', '        qaState(){return {...st};}, expected()').replace('  Games.register({',id===25?'  window.postalQA={drawNeighbour,drawShutters}; Games.register({':'  Games.register({'),cx);
(async()=>{sandbox.ims={};for(const f of fs.readdirSync('assets/art'))if(f.endsWith('.webp'))sandbox.ims[f.slice(0,-5)]=await loadImage('assets/art/'+f);
vm.runInContext('Object.assign(Art.images,ims);Settings.voice=false;Settings.sfx=false;',cx);
const results=[];
for(const reduced of [false,true])for(const level of [1,2,3,4,5,6]){
 clock=0;timers=[];sandbox.level=level;sandbox.reduced=reduced;sandbox.canvas=createCanvas(1600,900);sandbox.captures=[];
 sandbox.capture=(label)=>{const file='qa/postal-transition-'+(reduced?'reduced-':'')+label+'.png';fs.writeFileSync(file,sandbox.canvas.toBuffer('image/png'));};
 const result=vm.runInContext(`(()=>{
  Settings.reduceMotion=reduced;Math.random=mulberry32(735+level);
  const sc=new GameScene(Games.byId[25],level,null,{skipDemo:true});sc.state='play';let finished=false;sc.api.finish=()=>finished=true;
  const turns=new Set(),shots=new Set();let keys=0;
  for(let i=0;i<18000&&!finished;i++){
   const k=sc.g.expected();if(k&&i>120&&i%4===0){sc.g.onKey(k);keys++;}
   sc.api.t+=1/30;sc.g.update(1/30);tick(1/30);const st=sc.g.qaState();
   if(st.phase==='turn')turns.add(st.street);
   if(sc.g.expected() && st.phase!=='play')throw Error('Input available during transition');
   let shot=null;
   if(st.street===0&&st.phase==='fold'&&st.t>=1.65)shot=st.t>=2.1?'out-end':st.t>=1.9?'out-mid':'out-start';
   if(st.street===0&&st.phase==='turn')shot='between';
   if(st.street===1&&st.phase==='rise'&&st.t>=.4)shot=st.t>=.85?'in-end':'in-mid';
   if(level===1&&shot&&!shots.has(shot)){shots.add(shot);sc.draw(canvas.getContext('2d'));capture(shot);}
  }
  sc.draw(canvas.getContext('2d'));
  return {level,reduced,finished,keys,turns:[...turns],progress:sc.api.hud.progress,shots:[...shots]};
 })()`,cx,{timeout:40000});
 results.push(result);console.log(JSON.stringify(result));
 if(!result.finished||result.turns.length!==4||result.progress[0]!==5)throw Error('Transition sequence failed');
}
fs.writeFileSync('qa/postal-transition-results.json',JSON.stringify(results,null,2));
})();
