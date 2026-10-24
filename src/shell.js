/* LECAA Tecla — portada, perfils i illa. Original logo renderers unchanged. */
const ShellArt = {
  get: name => Art.get('shell-'+name),
  fit(ctx, im, x, y, w, h) {
    if (!im) return;
    const k=Math.min(w/im.width,h/im.height);
    ctx.drawImage(im,x+(w-im.width*k)/2,y+(h-im.height*k)/2,im.width*k,im.height*k);
  },
  cache: new Map(),
  avatar(animal,color) {
    const key=animal+color;if(this.cache.has(key))return this.cache.get(key);
    const im=this.get('avatar-'+animal);if(!im)return null;
    const c=makeCanvas(im.width,im.height),x=c.getContext('2d');x.drawImage(im,0,0);
    // Recolour only the pale knitted vest; retain the species' natural coat.
    const d=x.getImageData(0,0,c.width,c.height),rgb=hexToRgb(color||PLUSH[0]);
    const vestY=animal==='conill'?.755:animal==='granota'?.68:animal==='mussol'?.68:.70;
    const vestRY=animal==='conill'?.095:.12;
    for(let y=Math.floor(c.height*(vestY-vestRY));y<c.height*(vestY+vestRY);y++)for(let xx=Math.floor(c.width*.25);xx<c.width*.75;xx++){
      const i=(y*c.width+xx)*4,r=d.data[i],g=d.data[i+1],b=d.data[i+2];
      const radius=Math.hypot((xx/c.width-.5)/.23,(y/c.height-vestY)/vestRY),alpha=clamp((1-radius)*5,0,1)*.82;
      if(d.data[i+3]>150 && r>130 && g>110 && b>70 && r-b<105 && Math.max(r,g,b)-Math.min(r,g,b)<100){
        const f=(r+g+b)/660;for(let j=0;j<3;j++)d.data[i+j]=Math.min(255,rgb[j]*f*alpha+d.data[i+j]*(1-alpha));
      }
    }
    x.putImageData(d,0,0);this.cache.set(key,c);return c;
  }
};
const legacyDrawAvatar=drawAvatar;
drawAvatar=function(ctx,x,y,size,animal,color,o={}) {
  const im=ShellArt.avatar(animal,color);if(!im){legacyDrawAvatar(ctx,x,y,size,animal,color,o);return;}
  ctx.save();ctx.translate(x,y);
  const walk=Settings.reduceMotion?0:(o.walk||0),bob=walk?Math.abs(Math.sin(walk*11))*size*.045:0;
  ctx.translate(0,-bob);ctx.rotate(Settings.reduceMotion?0:o.tilt||0);
  if(o.body){
    ctx.fillStyle='rgba(24,52,45,.18)';ctx.beginPath();ctx.ellipse(0,size*.61,size*.31,size*.07,0,0,Math.PI*2);ctx.fill();
    const h=size*1.62,w=h*im.width/im.height;ctx.drawImage(im,-w/2,-size*.94,w,h);
  }else{
    const sh=im.height*.78,k=Math.min(size/im.width,size/sh);
    ctx.drawImage(im,0,0,im.width,sh,-im.width*k/2,size*.5-sh*k,im.width*k,sh*k);
  }
  ctx.restore();
};

TitleScene.prototype.draw=function(ctx){
  const im=ShellArt.get('title');if(im)ctx.drawImage(im,0,0,W,H);
  // Both logos are the exact original functions/assets, never image-generated.
  drawLogo(ctx,800,238,116);
  text(ctx,'Juga i descobreix on viu cada lletra',800,317,{size:27,weight:800,color:BRAND.petroli});
  drawButton(ctx,585,636,'Blanc sobre negre',{fs:30,w:380,h:88,style:'dark',click:()=>this.start('bsn')});
  drawButton(ctx,1000,636,"Anar a l'illa",{fs:32,w:380,h:88,style:'primary',click:()=>this.start('illa')});
  const on=!!Settings.fullscreen;
  drawPanel(ctx,635,711,330,55,{r:27,border:false,fill:'#FFFDF6',blur:15});
  Mouse.add(635,711,330,55,{click:()=>{Settings.fullscreen=!on;saveSettings();Sfx.play('tick');}});
  rr(ctx,655,726,25,25,6);ctx.fillStyle=on?BRAND.petroli:'#fff';ctx.fill();ctx.strokeStyle=BRAND.petroli;ctx.lineWidth=3;ctx.stroke();
  if(on)text(ctx,'✓',668,738,{size:23,color:'#fff'});
  text(ctx,'Pantalla completa',700,739,{size:23,weight:800,color:BRAND.tinta,align:'left'});
  drawButton(ctx,30,48,'Crèdits',{fs:22,h:48,align:'left',click:()=>{this.credits=true;Sfx.play('whoosh');}});
  drawGearButton(ctx,W-60,50,this,.88);
  const lh=54,uw=drawUTACMeasure(lh);drawPanel(ctx,W-uw-70,H-108,uw+48,78,{r:34,border:false,blur:12});drawUTAC(ctx,W-uw-46,H-68,lh);
  if(this.opts)drawIslandOptions(ctx,this);if(this.credits)drawCredits(ctx,this);
};

ProfileScene.prototype.draw=function(ctx){
  const im=ShellArt.get('profiles');if(im)ctx.drawImage(im,0,0,W,H);
  text(ctx,'Qui juga?',800,85,{size:57,weight:900,font:FONT_T,color:BRAND.tinta});
  const slots=this.slots(),page=Math.floor(this.sel/6),start=page*6;
  const xs=[535,800,1065],ys=[301,585];
  for(let n=0;n<6;n++){
    const i=start+n;if(i>=slots.length)continue;
    const p=slots[i],cx=xs[n%3],cy=ys[Math.floor(n/3)],sel=i===this.sel&&this.mode==='pick';
    if(this.mode==='pick')Mouse.add(cx-126,cy-128,252,267,{hover:()=>{if(this.sel!==i){this.sel=i;Sfx.play('tick');}},click:()=>{this.sel=i;this.onKey('Enter');}});
    if(sel){ctx.save();ctx.shadowColor='#51D3CE';ctx.shadowBlur=14;ctx.lineWidth=6;ctx.strokeStyle='#4BD0C8';rr(ctx,cx-126,cy-128,252,267,34);ctx.stroke();ctx.restore();}
    if(p){
      const jump=this.jump&&this.jump.p===p?Math.sin(Math.min(1,this.jump.t/.9)*Math.PI)*38:0;
      drawAvatar(ctx,cx,cy-14-jump,215,ANIMALS[p.animal%8].id,PLUSH[p.color%8],{tilt:sel&&!Settings.reduceMotion?Math.sin(this.t*2)*.025:0});
    }else{
      ctx.save();ctx.fillStyle='#F4E5C8';ctx.shadowColor='rgba(60,35,15,.3)';ctx.shadowBlur=16;ctx.beginPath();ctx.arc(cx,cy-12,62,0,Math.PI*2);ctx.fill();ctx.restore();
      ctx.save();ctx.strokeStyle=BRAND.petroli;ctx.setLineDash([8,7]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy-12,53,0,Math.PI*2);ctx.stroke();ctx.restore();
      text(ctx,'+',cx,cy-15,{size:84,weight:800,color:BRAND.petroli});
    }
    const label=p?p.name:'Nou';const fs=Math.min(29,190/Math.max(1,label.length)*1.5);
    drawPanel(ctx,cx-108,cy+89,216,46,{r:17,border:false,fill:sel?BRAND.petroli:'#FFF7E8',blur:6});
    text(ctx,label,cx,cy+112,{size:fs,weight:900,font:FONT_T,color:sel?'#fff':BRAND.petroli});
  }
  if(slots.length>6){
    const pages=Math.ceil(slots.length/6);
    if(page>0)drawButton(ctx,312,462,'‹',{w:64,h:68,fs:48,click:()=>{this.sel=Math.max(0,this.sel-6);}});
    if(page<pages-1)drawButton(ctx,1288,462,'›',{w:64,h:68,fs:48,click:()=>{this.sel=Math.min(slots.length-1,this.sel+6);}});
    drawPanel(ctx,720,782,160,38,{r:19,border:false,fill:'rgba(255,253,246,.95)',blur:3});
    text(ctx,`${page+1} / ${pages}`,800,801,{size:20,color:BRAND.petroli});
  }
  drawButton(ctx,34,838,'‹  Portada',{align:'left',w:215,h:60,fs:25,click:this.mode==='pick'?()=>this.onKey('Escape'):null});
  const lh=43,lw=logoWidth(lh);drawPanel(ctx,W-lw-64,808,lw+38,62,{r:28,border:false,blur:10});drawLogo(ctx,W-lw/2-45,839,lh);
  if(this.mode==='new')this.drawNew(ctx);
};

// Full map bounds include a wide ocean apron, keeping every coast inside the image.
const SHELL_MAP={x:-700,y:-525,w:3800,h:2533,minZoom:.43,maxZoom:2};
// Positions follow the new terrain; IDs and progression remain unchanged.
const shellPlaces={1:[735,425],2:[745,220],3:[840,190],4:[740,575],5:[1050,365],6:[1030,610],7:[370,505],8:[670,665],9:[490,350],10:[560,615],11:[815,650],12:[375,600],13:[1145,565],14:[1155,440],15:[925,330],16:[720,330],17:[655,495],18:[825,525],19:[565,440],20:[610,300],21:[380,395],22:[980,505],23:[935,240],24:[550,520],25:[890,445]};
for(const [id,[x,y]]of Object.entries(shellPlaces))PLACES[id]=[SHELL_MAP.x+x/1536*SHELL_MAP.w,SHELL_MAP.y+y/1024*SHELL_MAP.h];
buildIsland=function(){const im=ShellArt.get('island');ISLAND={c:im,S:1};};
const baseIslandEnter=IslandScene.prototype.enter;
IslandScene.prototype.enter=function(){
  baseIslandEnter.call(this);this.cam={x:1200,y:750,z:.43};this.zoomT=.43;this.free=[1200,750];this.introT=99;this.clouds=[];
};
IslandScene.prototype.camClamp=function(x,y,z){
  const vw=W/z,vh=H/z,b=SHELL_MAP;
  return [vw>=b.w?b.x+b.w/2:clamp(x,b.x+vw/2,b.x+b.w-vw/2),vh>=b.h?b.y+b.h/2:clamp(y,b.y+vh/2,b.y+b.h-vh/2)];
};
IslandScene.prototype.onWheel=function(d,mx=W/2,my=H/2){
  if(this.credits||this.opts)return;
  if(this.cardOpen&&mx>W-560&&my>110&&my<810)return;
  const z1=clamp(this.cam.z*(d<0?1.15:1/1.15),SHELL_MAP.minZoom,SHELL_MAP.maxZoom),[wx,wy]=this.screenToWorld(mx,my);
  const [x,y]=this.camClamp(wx-(mx-W/2)/z1,wy-(my-H/2)/z1,z1);
  this.cam.z=this.zoomT=z1;this.cam.x=x;this.cam.y=y;this.free=[x,y];Store.set('islandZoom',z1);
};
const baseIslandDrag=IslandScene.prototype.onDrag;
IslandScene.prototype.onDrag=function(dx,dy){
  if(this.cardOpen&&Mouse.press&&Mouse.press.x>W-560&&Mouse.press.y>110&&Mouse.press.y<810)return;
  baseIslandDrag.call(this,dx,dy);
};
IslandScene.prototype.drawPlace=function(ctx,id){
  const [x,y]=PLACES[id],sel=id===this.at&&this.cardOpen,open=this.open.has(id),r=63;
  const bob=sel&&!this.walk&&!Settings.reduceMotion?Math.sin(this.t*3)*2:0;
  const [sx,sy]=this.worldToScreen(x-r-9,y-r-9),[ex,ey]=this.worldToScreen(x+r+9,y+r+30);
  const hov=Mouse.add(sx,sy,ex-sx,ey-sy,{click:()=>this.clickPlace(id)});
  ctx.save();ctx.shadowColor='rgba(19,55,49,.3)';ctx.shadowBlur=13;ctx.shadowOffsetY=7;
  ctx.fillStyle='#FFFAED';ctx.beginPath();ctx.arc(x,y-bob,r+6,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.beginPath();ctx.arc(x,y-bob,r,0,Math.PI*2);ctx.clip();
  const grad=ctx.createLinearGradient(x,y-r,x,y+r);grad.addColorStop(0,'#FFFFFF');grad.addColorStop(1,'#E5E9DA');ctx.fillStyle=grad;ctx.fillRect(x-r,y-r-bob,r*2,r*2);
  ctx.globalAlpha=open?1:.36;ShellArt.fit(ctx,ShellArt.get('icon-'+id),x-r+9,y-r+9-bob,2*r-18,2*r-18);ctx.restore();
  ctx.strokeStyle=sel?'#0D9293':hov?'#43BCB9':'#B3BBA8';ctx.lineWidth=sel?7:4;ctx.beginPath();ctx.arc(x,y-bob,r+4,0,Math.PI*2);ctx.stroke();
  if(sel){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y-bob,r+13,0,Math.PI*2);ctx.stroke();}
  if(!open){ctx.save();ctx.fillStyle=BRAND.tinta;rr(ctx,x+28,y+27,25,22,5);ctx.fill();ctx.strokeStyle=BRAND.tinta;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+40.5,y+27,8,Math.PI,0);ctx.stroke();ctx.restore();}
  if(this.p){const st=Profiles.gameStars(this.p,id).best;for(let n=0;n<3;n++)drawStar(ctx,x-24+n*24,y+r+23,10,n<st,{blur:2});}
  if(hov)this.hoverId=id;
};
IslandScene.prototype.draw=function(ctx){
  const b=SHELL_MAP,z=this.cam.z,im=ShellArt.get('island');
  ctx.fillStyle='#26A4BA';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-this.cam.x,-this.cam.y);
  NativeIsland.draw(ctx,this);
  // Static paths have transparent strokes; the living scene remains uncluttered.
  if(!this.shellPaths){this.shellPaths=[];const done=new Set();Object.keys(PLACES).map(Number).forEach(a=>{
    Object.keys(PLACES).map(Number).filter(k=>k!==a&&Games.byId[k].zone===Games.byId[a].zone).sort((u,v)=>dist(...PLACES[a],...PLACES[u])-dist(...PLACES[a],...PLACES[v])).slice(0,1).forEach(k=>{const key=[a,k].sort((u,v)=>u-v).join('-');if(!done.has(key)){done.add(key);this.shellPaths.push([a,k]);}});
  });}
  ctx.save();ctx.lineCap='round';ctx.setLineDash([1,17]);ctx.lineWidth=6;ctx.strokeStyle='rgba(255,252,228,.85)';
  for(const [a,k]of this.shellPaths){ctx.beginPath();ctx.moveTo(...PLACES[a]);ctx.lineTo(...PLACES[k]);ctx.stroke();}ctx.restore();
  this.hoverId=null;this.hoverVoy=false;
  for(const id of Object.keys(PLACES).map(Number).sort((a,k)=>PLACES[a][1]-PLACES[k][1]))this.drawPlace(ctx,id);
  this.drawVoyageToken(ctx);
  islandAvatar(ctx,this);
  ctx.restore();
  if(this.hoverId&&!this.walk){const [hx,hy]=this.worldToScreen(PLACES[this.hoverId][0],PLACES[this.hoverId][1]-80);drawChip(ctx,clamp(hx,150,W-150),Math.max(122,hy-20),Games.byId[this.hoverId].name,{align:'center',fs:23,h:44,fill:'rgba(23,103,107,.97)'});}
  if(this.hoverVoy&&!this.hoverId){const [hx,hy]=this.worldToScreen(...VOYAGE_POS);drawChip(ctx,Math.max(180,hx),hy-95,"El viatge a l'illa",{align:'center',fs:22,h:44,fill:BRAND.petroli});}
  this.drawHUD(ctx);
  drawButton(ctx,30,H-44,'‹  Portada',{align:'left',fs:22,h:52,w:180,click:()=>App.go(new TitleScene())});
  drawButton(ctx,W/2-120,H-44,'−',{w:54,h:52,fs:34,click:()=>this.onWheel(1)});
  drawButton(ctx,W/2-50,H-44,'+',{w:54,h:52,fs:32,click:()=>this.onWheel(-1)});
  drawButton(ctx,W/2+80,H-44,'Vista general',{w:170,h:52,fs:20,click:()=>{this.closeCard();this.zoomT=.43;this.cam.z=.43;this.free=[1200,750];}});
  if(this.cardOpen&&this.cardT>0&&!this.walk){if(this.cardVoy)this.drawVoyageCard(ctx);else this.drawCard(ctx);}
  if(this.opts)drawIslandOptions(ctx,this);if(this.credits)drawCredits(ctx,this);
};
