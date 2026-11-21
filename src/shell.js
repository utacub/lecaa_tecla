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

/* Instal·lació PWA: el navegador ofereix beforeinstallprompt només a la versió publicada (manifest + service worker)
   i mentre l'app no estigui instal·lada; el botó de la portada només es mostra si hi ha aquesta oferta. */
const Install={
  ev:null,
  // dins l'app instal·lada (finestra pròpia) mai no es mostra, encara que arribés l'oferta
  installed(){try{return navigator.standalone===true||matchMedia('(display-mode: standalone)').matches;}catch(e){return false;}},
  can(){return !!this.ev&&!this.installed();},
  // l'oferta només es pot fer servir un cop; si es rebutja, el navegador en pot enviar una altra més endavant
  prompt(){const e=this.ev;this.ev=null;if(e)try{const r=e.prompt();if(r&&r.catch)r.catch(()=>{});}catch(err){}}
};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();Install.ev=e;});
addEventListener('appinstalled',()=>{Install.ev=null;Offline.persist();});

/* Ús sense connexió (només a la versió publicada, on build.py defineix PWA_BYTES i hi ha sw.js).
   El service worker desa index.html (el programa sencer, amb tots els jocs, il·lustracions, sons i tipografies),
   el manifest i les icones, i envia el progrés de la descàrrega; aquí es mostra a la portada i a l'avís d'instal·lació. */
const Offline={
  on:false,phase:'idle',done:0,total:0,failed:false,wasReady:false,seenDownload:false,readyAt:0,free:null,quota:null,
  bytes(){return typeof PWA_BYTES!=='undefined'?PWA_BYTES:0;},
  mb(b,dec){return (b/1e6).toLocaleString(LOCALE,{maximumFractionDigits:dec?1:0});},
  size(){return Math.round(this.bytes()/1e6);},
  pct(){return this.phase==='ready'?100:Math.min(99,Math.floor(this.done*100/(this.total||this.bytes()||1)));},
  init(){
    if(!this.bytes()||!('serviceWorker' in navigator)||!/^https?:$/.test(location.protocol))return;
    this.on=true;this.total=this.bytes();
    navigator.serviceWorker.addEventListener('message',e=>{
      const d=e.data||{};
      if(d.type==='LECAA_TECLA_PROGRESS'){
        // un cop a punt, una versió nova es baixa en silenci: la que ja hi ha continua funcionant sense connexió
        if(this.phase==='ready')return;
        this.phase='downloading';this.seenDownload=true;this.failed=false;this.done=d.done;this.total=d.total||this.bytes();
      }else if(d.type==='LECAA_TECLA_FAILED'&&!this.wasReady){this.failed=true;this.phase='idle';}
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>this.ask());
    if(document.readyState==='complete')this.register();else addEventListener('load',()=>this.register());
  },
  async register(){
    this.failed=false;if(this.phase!=='ready'){this.phase='starting';this.done=0;}
    try{
      const reg=await navigator.serviceWorker.register('sw.js',{scope:'./',updateViaCache:'none'});
      const watch=()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{
        if(w.state==='redundant'&&!this.wasReady&&this.phase!=='ready'){this.failed=true;this.phase='idle';}
        if(w.state==='activated')this.ask();
      });};
      watch();reg.addEventListener('updatefound',watch);
      if(reg.active)this.ask();
    }catch(e){this.failed=true;this.phase='idle';}
  },
  // pregunta al service worker actiu si la còpia d'aquesta versió és completa
  async ask(){
    try{
      const reg=await navigator.serviceWorker.ready,ch=new MessageChannel();
      ch.port1.onmessage=e=>{if(e.data&&e.data.type==='LECAA_TECLA_READY'){
        if(this.phase!=='ready'&&this.seenDownload)this.readyAt=performance.now();
        this.phase='ready';this.wasReady=true;this.failed=false;this.done=this.total;
        if(Install.installed())this.persist();
      }};
      if(reg.active)reg.active.postMessage({type:'LECAA_TECLA_STATUS'},[ch.port2]);
    }catch(e){}
  },
  // demana al navegador que no esborri el joc desat quan li falti espai (cada navegador decideix)
  persist(){try{const r=navigator.storage&&navigator.storage.persist&&navigator.storage.persist();if(r&&r.catch)r.catch(()=>{});}catch(e){}},
  async space(){
    try{const {quota,usage}=await navigator.storage.estimate();if(quota){this.quota=quota;this.free=quota-(usage||0);}}catch(e){}
  },
  // text i barra: a la portada només mentre es baixa, una estona després d'acabar o si ha fallat
  showOnTitle(){return this.on&&(this.phase==='downloading'||this.failed||(this.phase==='ready'&&this.readyAt&&performance.now()-this.readyAt<8000));}
};
Offline.init();

function drawOfflineBar(ctx,x,y,w,h){
  rr(ctx,x,y,w,h,h/2);ctx.fillStyle='#DDE7E4';ctx.fill();
  const f=Offline.phase==='ready'?1:Offline.phase==='downloading'?Offline.pct()/100:0;
  if(Offline.phase==='starting'){ // encara sense dades: franja que llisca (indeterminat)
    const t=performance.now()/1000,bw=w*.25,bx=x+((t*.45)%1)*(w+bw)-bw;
    ctx.save();rr(ctx,x,y,w,h,h/2);ctx.clip();rr(ctx,bx,y,bw,h,h/2);ctx.fillStyle=BRAND.petroli;ctx.fill();ctx.restore();
  }else if(f>0){rr(ctx,x,y,Math.max(h,w*f),h,h/2);ctx.fillStyle=BRAND.petroli;ctx.fill();}
}
// pastilla de la portada, sota els botons
function drawOfflineTitle(ctx){
  if(!Offline.showOnTitle())return;
  const failed=Offline.failed,w=failed?760:600,x=800-w/2,y=792,ready=Offline.phase==='ready';
  drawPanel(ctx,x,y,w,failed?62:58,{r:failed?31:29,border:false,fill:'#FFFDF6',blur:12});
  if(failed){
    const bw=drawButton(ctx,x+w-10,y+31,L_('Torna-ho a provar'),{fs:19,h:44,align:'right',style:'primary',click:()=>{Sfx.play('tick');Offline.register();}});
    text(ctx,L_("No s'ha pogut desar per jugar sense connexió."),x+26,y+31,{size:20,weight:800,color:'#9B1C1C',align:'left',maxW:w-bw-56});
  }else if(ready){
    text(ctx,'✓  '+L_('A punt per jugar sense connexió'),800,y+30,{size:22,weight:800,color:BRAND.petroli,maxW:w-50});
  }else{
    text(ctx,L_('Desant per jugar sense connexió'),x+28,y+19,{size:19,weight:800,color:BRAND.tinta,align:'left',maxW:w-140});
    text(ctx,Offline.pct()+' %',x+w-28,y+19,{size:19,weight:900,color:BRAND.petroli,align:'right'});
    drawOfflineBar(ctx,x+28,y+35,w-56,12);
  }
}
// Avís de mida abans d'instal·lar: què es desa, quant ocupa, l'espai lliure i com va la descàrrega.
function openInstallDialog(scene){scene.inst=true;scene.instT=0;Offline.space();Sfx.play('whoosh');}
function drawInstallDialog(ctx,scene){
  const k=Ease.outBack(clamp(scene.instT/.35,0,1)),close=()=>{scene.inst=false;Sfx.play('whoosh');};
  ctx.save();ctx.fillStyle=`rgba(20,38,42,${.6*clamp(scene.instT*4,0,1)})`;ctx.fillRect(0,0,W,H);
  Mouse.add(0,0,W,H,{click:close});
  ctx.translate(W/2,H/2);ctx.scale(k,k);ctx.translate(-W/2,-H/2);
  const O=Offline,mb=O.size(),ready=O.phase==='ready';
  const pw=960,px=W/2-pw/2,bx=px+50,bw=pw-100;
  const paras=[L_("Es desa en aquest dispositiu tot el que cal per jugar sense connexió: els 25 jocs, les il·lustracions, els sons de les lletres en tots els idiomes i les tipografies."),
    L_("Les veus opcionals que es baixen des dels ajustos de la veu no hi són incloses."),
    ready?L_("La descàrrega ja és completa en aquest navegador: instal·lar no torna a baixar res."):L_("Si fas servir dades mòbils, millor connecta't a una xarxa wifi abans de continuar.")];
  let space='',low=false;
  if(O.free!=null){
    const need=ready?0:Math.max(0,O.bytes()-O.done),gb=O.free>=1e9,n=gb?(O.free/1e9).toLocaleString(LOCALE,{maximumFractionDigits:1})+' GB':O.mb(O.free)+' MB';
    low=O.free<need*1.1;
    space=low?L_("Atenció: aquest navegador només pot desar uns {n} més. Allibera espai abans d'instal·lar o el joc no funcionarà sense connexió.",{n}):L_("Espai disponible per a aquest navegador: uns {n}. N'hi ha prou.",{n});
  }
  // alçada segons el text (els idiomes traduïts poden ocupar més línies)
  const fs=21,lh=29,lines=t=>t?Math.round((wrapText(ctx,t,0,0,bw-50,lh,{size:fs,weight:700,measure:true}))/lh)+1:0;
  const boxH=78+paras.reduce((a,t)=>a+lines(t)*lh+10,0)+(space?lines(space)*lh+10:0)+8;
  const statusH=O.on&&!ready?86:O.on?48:0,ph=124+boxH+20+statusH+104,py=Math.max(20,H/2-ph/2);
  Mouse.add(px,py,pw,ph,{});
  drawPanel(ctx,px,py,pw,ph,{r:32});
  text(ctx,L_('Instal·lar LECAA Tecla'),bx,py+58,{size:36,weight:900,font:FONT_T,color:BRAND.tinta,align:'left',maxW:pw-180});
  ctx.fillStyle='#DDE7E4';ctx.fillRect(px+40,py+102,pw-80,2);
  // requadre de l'avís, amb la vora esquerra en petroli
  let y=py+124;
  ctx.save();rr(ctx,bx,y,bw,boxH,18);ctx.fillStyle='#F1F7F5';ctx.fill();ctx.clip();ctx.fillStyle=BRAND.petroli;ctx.fillRect(bx,y,8,boxH);ctx.restore();
  text(ctx,L_('Ocupa uns {mb} MB',{mb}),bx+30,y+40,{size:32,weight:900,font:FONT_T,color:BRAND.petroli,align:'left',maxW:bw-60});
  let ty=y+86;
  for(const t of paras){ty=wrapText(ctx,t,bx+30,ty,bw-50,lh,{size:fs,weight:700,color:BRAND.tinta})+lh+10;}
  if(space)wrapText(ctx,space,bx+30,ty,bw-50,lh,{size:fs,weight:800,color:low?'#9B1C1C':BRAND.petroli});
  y+=boxH+20;
  // estat de la descàrrega
  if(O.on){
    let st;
    if(O.failed)st=L_("No s'ha pogut desar per jugar sense connexió.");
    else if(ready)st='✓  '+L_('A punt per jugar sense connexió');
    else if(O.phase==='downloading')st=L_('Desant per jugar sense connexió: {done} de {mb} MB ({pct} %). No tanquis aquesta finestra fins que acabi.',{done:O.mb(O.done),mb:O.mb(O.total),pct:O.pct()});
    else st=L_('Preparant la descàrrega per jugar sense connexió…');
    text(ctx,st,bx,y+16,{size:20,weight:800,color:O.failed?'#9B1C1C':ready?BRAND.petroli:BRAND.tinta,align:'left',maxW:bw});
    if(!ready&&!O.failed)drawOfflineBar(ctx,bx,y+44,bw,16);
    if(O.failed)drawButton(ctx,bx+bw,y+56,L_('Torna-ho a provar'),{fs:19,h:44,align:'right',click:()=>{Sfx.play('tick');O.register();}});
  }
  // botons
  const by=py+ph-56,can=Install.can();
  if(can)drawButton(ctx,px+pw/2-14,by,L_('Instal·lar ({mb} MB)',{mb}),{fs:27,h:66,align:'right',style:'primary',click:()=>{scene.inst=false;Sfx.play('tick');O.persist();Install.prompt();}});
  drawButton(ctx,can?px+pw/2+14:px+pw/2,by,L_('Cancel·lar'),{fs:27,h:66,w:230,align:can?'left':'center',click:close});
  // creu per tancar
  const cx=px+pw-50,cy=py+52,ov=Mouse.add(cx-28,cy-28,56,56,{click:close});
  ctx.strokeStyle=ov?BRAND.petroli:'#7A8C8E';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx-13,cy-13);ctx.lineTo(cx+13,cy+13);ctx.moveTo(cx+13,cy-13);ctx.lineTo(cx-13,cy+13);ctx.stroke();
  ctx.restore();
}
const baseTitleUpdate=TitleScene.prototype.update;
TitleScene.prototype.update=function(dt){baseTitleUpdate.call(this,dt);if(this.inst)this.instT=(this.instT||0)+dt;};
const baseTitleKey=TitleScene.prototype.onKey;
TitleScene.prototype.onKey=function(k){if(this.inst){if(k==='Escape')this.inst=false;return;}return baseTitleKey.call(this,k);};

TitleScene.prototype.draw=function(ctx){
  const im=ShellArt.get('title');if(im)ctx.drawImage(im,0,0,W,H);
  // Both logos are the exact original functions/assets, never image-generated.
  drawLogo(ctx,800,238,116);
  text(ctx,L_('Juga i descobreix on viu cada lletra'),800,317,{size:27,weight:800,color:BRAND.petroli,maxW:700});
  drawButton(ctx,585,636,L_('Blanc sobre negre'),{fs:30,w:380,h:88,style:'dark',click:()=>this.start('bsn')});
  drawButton(ctx,1000,636,L_("Anar a l'illa"),{fs:32,w:380,h:88,style:'primary',click:()=>this.start('illa')});
  const on=!!Settings.fullscreen,inst=Install.can(),fsT=L_('Pantalla completa'),fsW=measure(ctx,fsT,23,800);
  // amb Instal·lar: dues pastilles d'igual amplada, amb l'espai entre elles alineat amb el dels dos botons grans (x=792,5)
  let fx=635,fw=330,cx=fx+20;
  if(inst){fw=Math.round(Math.min(330,Math.max(fsW+80,measure(ctx,'Instal·lar',23,800)+78)));fx=792.5-10-fw;cx=fx+(fw-(40+fsW))/2;}
  drawPanel(ctx,fx,711,fw,55,{r:27,border:false,fill:'#FFFDF6',blur:15});
  Mouse.add(fx,711,fw,55,{click:()=>{Settings.fullscreen=!on;saveSettings();Sfx.play('tick');}});
  rr(ctx,cx,726,25,25,6);ctx.fillStyle=on?BRAND.petroli:'#fff';ctx.fill();ctx.strokeStyle=BRAND.petroli;ctx.lineWidth=3;ctx.stroke();
  if(on)text(ctx,'✓',cx+13,738,{size:23,color:'#fff'});
  text(ctx,fsT,cx+(inst?40:45),739,{size:23,weight:800,color:BRAND.tinta,align:'left',maxW:inst?fw-60:245});
  // botó Instal·lar al costat (fletxa de baixada sobre safata, en petroli)
  if(inst){const ix=792.5+10,iT=L_('Instal·lar'),iW=Math.min(measure(ctx,iT,23,800),fw-78),ic=ix+(fw-(38+iW))/2,hov=Mouse.add(ix,711,fw,55,{click:()=>openInstallDialog(this)});
    drawPanel(ctx,ix,711,fw,55,{r:27,border:false,fill:hov?'#FFFFFF':'#FFFDF6',blur:hov?20:15});
    ctx.save();ctx.strokeStyle=BRAND.petroli;ctx.lineWidth=4;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.moveTo(ic+11,723);ctx.lineTo(ic+11,743);ctx.moveTo(ic+3,736);ctx.lineTo(ic+11,744);ctx.lineTo(ic+19,736);
    ctx.moveTo(ic,748);ctx.lineTo(ic,753);ctx.lineTo(ic+22,753);ctx.lineTo(ic+22,748);ctx.stroke();ctx.restore();
    text(ctx,iT,ic+38,739,{size:23,weight:800,color:BRAND.tinta,align:'left',maxW:fw-78});}
  drawButton(ctx,30,48,L_('Crèdits'),{fs:22,h:48,align:'left',click:()=>{this.credits=true;Sfx.play('whoosh');}});
  drawGearButton(ctx,W-60,50,this,.88);
  // menú d'idioma a dalt a la dreta, com a Mira i Juga i LECAA Docs
  if(!this.opts&&!this.credits){drawLangButton(ctx,W-116,50,this,{h:54,fs:23});}
  const lh=54,uw=drawUTACMeasure(lh);drawPanel(ctx,W-uw-70,H-108,uw+48,78,{r:34,border:false,blur:12});drawUTAC(ctx,W-uw-46,H-68,lh);
  if(!this.opts&&!this.credits)drawLangList(ctx,this);
  if(!this.opts&&!this.credits&&!this.inst)drawOfflineTitle(ctx);
  if(this.opts)drawIslandOptions(ctx,this);if(this.credits)drawCredits(ctx,this);
  if(this.inst){if(Install.can()||Offline.on)drawInstallDialog(ctx,this);else this.inst=false;}
};

ProfileScene.prototype.draw=function(ctx){
  const im=ShellArt.get('profiles');if(im)ctx.drawImage(im,0,0,W,H);
  text(ctx,L_('Qui juga?'),800,85,{size:57,weight:900,font:FONT_T,color:BRAND.tinta});
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
    const label=p?p.name:L_('Nou');const fs=Math.min(29,190/Math.max(1,label.length)*1.5);
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
  drawButton(ctx,34,838,L_('‹  Portada'),{align:'left',w:215,h:60,fs:25,click:this.mode==='pick'?()=>this.onKey('Escape'):null});
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
  if(this.hoverVoy&&!this.hoverId){const [hx,hy]=this.worldToScreen(...VOYAGE_POS);drawChip(ctx,Math.max(180,hx),hy-95,L_("El viatge a l'illa"),{align:'center',fs:22,h:44,fill:BRAND.petroli});}
  this.drawHUD(ctx);
  drawButton(ctx,30,H-44,L_('‹  Portada'),{align:'left',fs:22,h:52,w:180,click:()=>App.go(new TitleScene())});
  drawButton(ctx,W/2-120,H-44,'−',{w:54,h:52,fs:34,click:()=>this.onWheel(1)});
  drawButton(ctx,W/2-50,H-44,'+',{w:54,h:52,fs:32,click:()=>this.onWheel(-1)});
  drawButton(ctx,W/2+80,H-44,L_('Vista general'),{w:170,h:52,fs:20,click:()=>{this.closeCard();this.zoomT=.43;this.cam.z=.43;this.free=[1200,750];}});
  if(this.cardOpen&&this.cardT>0&&!this.walk){if(this.cardVoy)this.drawVoyageCard(ctx);else this.drawCard(ctx);}
  if(this.opts)drawIslandOptions(ctx,this);if(this.credits)drawCredits(ctx,this);
};
