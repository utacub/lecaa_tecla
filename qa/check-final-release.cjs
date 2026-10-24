const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage,GlobalFonts}=require('@napi-rs/canvas');
for(const [f,n] of [['Andika-400.woff2','Andika'],['Andika-700.woff2','Andika'],['Nunito-900.woff2','Nunito']])GlobalFonts.registerFromPath('assets/'+f,n);
const nop=()=>{},stub=new Proxy({}, {get:()=>nop});
const sandbox={console,Math,DOMMatrix:require('@napi-rs/canvas').DOMMatrix,NOTE:n=>440*Math.pow(2,(n-69)/12),setTimeout:nop,clearTimeout:nop,performance:{now:()=>0},document:{createElement:()=>createCanvas(1,1)},window:{},navigator:{},localStorage:{getItem:()=>null,setItem:nop},addEventListener:nop,requestAnimationFrame:nop,Image:require('@napi-rs/canvas').Image,Audio2:{ctx:null,now:()=>0},noise:nop,tone:nop,Sfx:stub,Music:stub,Voice:{say:nop,init:nop,stop:nop},PHON_ANNA:{},LOGO_UTAC:'',CREDIT_LOGOS:[]};
const cx=vm.createContext(sandbox);
for(const f of ['core','textures','critters','art','art-tanda3','art-fruit','art-tanda4','art-tanda5','art-final','content','ui','play','avatars','scenes','voyage'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),cx,{filename:f+'.js'});
for(const id of Array.from({length:25},(_,i)=>i+1))vm.runInContext(fs.readFileSync('src/games/g'+String(id).padStart(2,'0')+'.js','utf8'),cx);
(async()=>{sandbox.ims={};for(const f of fs.readdirSync('assets/art'))if(f.endsWith('.webp'))sandbox.ims[f.slice(0,-5)]=await loadImage('assets/art/'+f);
vm.runInContext('Object.assign(Art.images,ims);Settings.voice=false;Settings.sfx=false;',cx);
const results=[];sandbox.canvas=createCanvas(1600,900);
for(let id=1;id<=25;id++){sandbox.id=id;try{vm.runInContext(`(()=>{const sc=new GameScene(Games.byId[id],1,null,{skipDemo:true});sc.state='play';for(let i=0;i<90;i++){sc.api.t+=1/30;sc.g.update(1/30);}sc.draw(canvas.getContext('2d'));})()`,cx,{timeout:30000});results.push({id,ok:true});}catch(e){results.push({id,ok:false,error:e.message});}}
for(const file of ['dist/LECAA-Tecla.html','dist/pwa/index.html']){const html=fs.readFileSync(file,'utf8');for(const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);if(html.includes('id="review"'))throw Error('Review menu in production');}
fs.writeFileSync('qa/final-release-smoke.json',JSON.stringify(results,null,2));console.log(results);if(results.some(r=>!r.ok))process.exitCode=1;
})();
