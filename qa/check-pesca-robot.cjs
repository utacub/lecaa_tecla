const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage,GlobalFonts,DOMMatrix}=require('@napi-rs/canvas');
for(const [f,n] of [['Andika-400.woff2','Andika'],['Andika-700.woff2','Andika'],['Nunito-900.woff2','Nunito']])GlobalFonts.registerFromPath('assets/'+f,n);
let clock=0,timers=[];const tick=dt=>{clock+=dt;const ready=timers.filter(t=>t.at<=clock);timers=timers.filter(t=>t.at>clock);ready.forEach(t=>t.fn());};
const nop=()=>{},stub=new Proxy({}, {get:()=>nop});
const sandbox={console,Math,DOMMatrix,NOTE:n=>440*Math.pow(2,(n-69)/12),setTimeout:(fn,ms=0)=>{const t={fn,at:clock+ms/1000};timers.push(t);return t;},clearTimeout:t=>{timers=timers.filter(x=>x!==t);},tick,performance:{now:()=>0},document:{createElement:()=>createCanvas(1,1)},window:{},navigator:{},localStorage:{getItem:()=>null,setItem:nop},addEventListener:nop,requestAnimationFrame:nop,Image:require('@napi-rs/canvas').Image,Audio2:{ctx:null,now:()=>0},noise:nop,tone:nop,Sfx:stub,Music:stub,Voice:{say:nop,init:nop,stop:nop},PHON_ANNA:{},LOGO_UTAC:'',CREDIT_LOGOS:[]};
const cx=vm.createContext(sandbox);
for(const f of ['core','textures','critters','art','art-tanda3','art-fruit','art-tanda4','art-tanda5','art-final','content','ui','play','avatars','scenes','voyage'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),cx,{filename:f+'.js'});
for(const id of [10,23]){let code=fs.readFileSync('src/games/g'+id+'.js','utf8');if(id===10)code=code.replace('expected() { return done ?', 'qa(){return {done,endT,nCaught,spawned,fish:fishes.map(f=>({x:f.x,y:f.y,s:f.s,lane:f.lane,a:f.a})),names:caught.map(c=>c.sp.name)}}, expected() { return done ?');vm.runInContext(code,cx);}
(async()=>{sandbox.ims={};for(const f of fs.readdirSync('assets/art'))if(f.endsWith('.webp'))sandbox.ims[f.slice(0,-5)]=await loadImage('assets/art/'+f);
vm.runInContext('Object.assign(Art.images,ims);Settings.voice=false;Settings.sfx=false;',cx);

let results=[];
for(const id of (process.env.GAMES||"10,23").split(",").map(Number))for(const level of (process.env.LEVELS||"1,2,3,4,5,6").split(",").map(Number)){
 clock=0;timers=[];sandbox.id=id;sandbox.level=level;sandbox.canvas=createCanvas(1600,900);sandbox.finale=createCanvas(1600,900);sandbox.checkcanvas=createCanvas(1600,900);sandbox.freecanvas=createCanvas(1600,900);sandbox.reduced=process.env.REDUCED==='1';
 console.log('testing',id,level);
 const result=vm.runInContext(`(()=>{
   Settings.reduceMotion=reduced;const sc=new GameScene(Games.byId[id],level,null,{skipDemo:true});sc.state='play';let finished=false,finishCalls=0;sc.api.finish=()=>{finished=true;finishCalls++};let keys=0,finalFrame=-1,earlyFinish=false,saved=false,freeSaved=false;
   for(let i=0;i<18000&&!finished;i++){
     const k=sc.g.expected?.();
     if(id===10 && sc.g.qa().done && finalFrame<0)finalFrame=i;
     const hold=id===10 && finalFrame>=0 && i-finalFrame<450;
     if(k&&i>90&&i%4===0&&!hold){sc.g.onKey(k);keys++;}
     sc.api.t+=1/30;sc.g.update(1/30);tick(1/30);
     if(id===10)for(const f of sc.g.qa().fish){
       const water=[[430,1170],[360,1250],[470,1200]][f.lane],radius=95*f.s;
       if(f.x-radius<water[0]||f.x+radius>water[1]||f.a<0||f.a>1)throw Error('Fish outside water or invalid fade');
     }
     if(hold&&finished)earlyFinish=true;
     if(i%300===0)sc.draw(checkcanvas.getContext('2d'));
     if(!saved&&i>90&&k&&k!=='Enter'){sc.draw(canvas.getContext('2d'));saved=true;}
     if(id===23&&!freeSaved&&sc.api.hud.progress[0]===sc.api.hud.progress[1]&&k&&k!=='Enter'){sc.draw(freecanvas.getContext('2d'));freeSaved=true;}
     if(id===10&&finalFrame>=0&&i-finalFrame===180)sc.draw(finale.getContext('2d'));
   }
   const qa=sc.g.qa?.();return {id,level,finished,finishCalls,earlyFinish,keys,hits:sc.api.hits,progress:sc.api.hud.progress,qa};
 })()`,cx,{timeout:60000});results.push(result);
 fs.writeFileSync('qa/game-'+id+'-l'+level+'.png',sandbox.canvas.toBuffer('image/png'));
 if(id===23)fs.writeFileSync('qa/robot-free-l'+level+'.png',sandbox.freecanvas.toBuffer('image/png'));
 if(id===10)fs.writeFileSync('qa/aquarium-l'+level+'.png',sandbox.finale.toBuffer('image/png'));
 console.log(result);
}
fs.writeFileSync('qa/pesca-robot-results'+(process.env.GAMES?'-'+process.env.GAMES.replaceAll(',','-'):'')+(process.env.REDUCED?'-reduced':'')+'.json',JSON.stringify(results,null,2));
if(results.some(r=>!r.finished||r.finishCalls!==1||r.earlyFinish||(r.id===10&&(r.qa.nCaught!==12||new Set(r.qa.names).size!==12))))process.exitCode=1;
})();
