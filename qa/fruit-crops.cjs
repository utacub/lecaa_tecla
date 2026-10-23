const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const sandbox={makeCanvas:createCanvas,Image:function(){}};vm.createContext(sandbox);
for(const f of ['art','art-tanda3','art-fruit'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),sandbox);
(async()=>{sandbox.whole=await loadImage('assets/art/fruit-whole-clean.webp');sandbox.cut=await loadImage('assets/art/fruit-cut.webp');
vm.runInContext('Art.images["fruit-whole-clean"]=whole;Art.images["fruit-cut"]=cut',sandbox);
const c=createCanvas(1500,1200),x=c.getContext('2d');x.fillStyle='#253344';x.fillRect(0,0,1500,1200);
for(let i=0;i<15;i++)for(let half=0;half<2;half++){
 const sprite=vm.runInContext(`Art.fruitCell('${half?'fruit-cut':'fruit-whole-clean'}',${i},240,260)`,sandbox);
 const px=i%5*300+30,py=Math.floor(i/5)*400+half*175+15;
 x.drawImage(sprite,px,py,160,173);x.fillStyle='white';x.font='15px sans-serif';x.fillText(`${i+1} ${half?'interior':'sencera'}`,px+165,py+85);
 const a=sprite.getContext('2d').getImageData(0,0,240,260).data;
 for(let p=0;p<240*260;p++)if((p%240<2||p%240>237||p<480||p>=240*258)&&a[p*4+3])throw Error('Clipped output '+i);
}
fs.writeFileSync('qa/fruit-crops.png',c.toBuffer('image/png'));console.log('30 fruit sprites rendered; all have transparent margins.');})();
