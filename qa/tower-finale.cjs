const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
for(const [f,n] of [['Andika-400.woff2','Andika'],['Andika-700.woff2','Andika'],['Nunito-900.woff2','Nunito']])GlobalFonts.registerFromPath('assets/'+f,n);
const nop=()=>{},stub=new Proxy({}, {get:()=>nop});
const sandbox={console,Math,setTimeout:nop,clearTimeout:nop,performance:{now:()=>0},document:{createElement:()=>createCanvas(1,1)},window:{},navigator:{},localStorage:{getItem:()=>null,setItem:nop},addEventListener:nop,requestAnimationFrame:nop,Image:require('@napi-rs/canvas').Image,Audio2:{ctx:null,now:()=>0},noise:nop,tone:nop,Sfx:stub,Music:stub,Voice:{say:nop,init:nop,stop:nop},PHON_ANNA:{},LOGO_UTAC:'',CREDIT_LOGOS:[]};
const cx=vm.createContext(sandbox);
for(const f of ['core','textures','critters','art','art-tanda3','art-fruit','art-tanda4','content','ui','play','avatars','scenes','voyage'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),cx,{filename:f+'.js'});
for(const id of [13,14,15,16,17])vm.runInContext(fs.readFileSync('src/games/g'+String(id).padStart(2,'0')+'.js','utf8'),cx);
(async()=>{sandbox.ims={};for(const f of fs.readdirSync('assets/art'))if(f.endsWith('.webp'))sandbox.ims[f.slice(0,-5)]=await loadImage('assets/art/'+f);
vm.runInContext('Object.assign(Art.images,ims);Settings.voice=false;Settings.sfx=false;',cx);
let results=[];
for(const id of (process.env.GAMES?process.env.GAMES.split(',').map(Number):[13]))for(const level of [1,2,3,4,5,6]){sandbox.id=id;sandbox.level=level;sandbox.canvas=createCanvas(1600,900);console.log('testing',id,level);
try{const result=vm.runInContext(`(()=>{const sc=new GameScene(Games.byId[id],level,null,{skipDemo:true});sc.state='play';let finished=false;sc.api.finish=()=>{finished=true};let keys=0,completedAt=-1,finishAt=-1;for(let i=0;i<18000&&!finished;i++){const k=sc.g.expected?.();if(k&&i>120&&i%4===0){sc.g.onKey(k);keys++;}sc.api.t+=1/30;sc.g.update(1/30);if(sc.api.hud.progress?.[0]>=sc.api.hud.progress?.[1]&&completedAt<0)completedAt=i;
if(finished)finishAt=i;
if(completedAt>=0&&i===completedAt+120)sc.draw(canvas.getContext('2d'));
if(i===90||i===240){sc.draw(canvas.getContext('2d')); }}return {id,level,finished,finaleSeconds:(finishAt-completedAt)/30,keys,hits:sc.api.hits,progress:sc.api.hud.progress};})()`,cx,{timeout:40000});results.push(result);fs.writeFileSync('qa/tower-finale-l'+level+'.png',sandbox.canvas.toBuffer('image/png'));console.log(result);}catch(e){console.log('FAIL',id,level,e.stack);results.push({id,level,error:e.message});}}
fs.writeFileSync('qa/tower-finale-results'+(process.env.GAMES?'-'+process.env.GAMES.replaceAll(',','-'):'')+'.json',JSON.stringify(results,null,2));if(results.some(r=>r.error||!r.finished||r.finaleSeconds<4.9))process.exitCode=1;})();
