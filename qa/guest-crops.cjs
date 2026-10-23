const fs=require('fs'),vm=require('vm'),{createCanvas,loadImage}=require('@napi-rs/canvas');
const sandbox={makeCanvas:createCanvas,Image:function(){}};vm.createContext(sandbox);
for(const f of ['art','art-tanda3','art-fruit'])vm.runInContext(fs.readFileSync('src/'+f+'.js','utf8'),sandbox);
(async()=>{sandbox.guests=await loadImage('assets/art/party-guests.webp');vm.runInContext('Art.images["party-guests"]=guests',sandbox);
const c=createCanvas(1200,1050),x=c.getContext('2d');x.fillStyle='#253344';x.fillRect(0,0,c.width,c.height);
const names=['Gat','Conill','Os','Guineu','Porc','Lleó','Mico','Elefant','Gos','Granota','Mussol','Esquirol'];
for(let i=0;i<12;i++){
 const sp=vm.runInContext(`Art.isolatedCell('party-guests',${i},240,280)`,sandbox);
 x.drawImage(sp,i%4*300+30,Math.floor(i/4)*350+10);x.fillStyle='white';x.font='20px sans-serif';x.fillText(names[i],i%4*300+30,Math.floor(i/4)*350+320);
 const a=sp.getContext('2d').getImageData(0,0,240,280).data;
 for(let p=0;p<240*280;p++)if((p%240<2||p%240>237||p<480||p>=240*278)&&a[p*4+3])throw Error('Clipped output '+names[i]);
}
fs.writeFileSync('qa/guest-crops.png',c.toBuffer('image/png'));console.log('12 guests rendered, all with transparent margins.');})();
