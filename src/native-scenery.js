/* Resolution-independent terrain plus native-resolution, individually drawn props. */
const NativeIsland={
  coast:new Path2D('M 285 340 C 345 275 430 265 520 245 C 570 205 645 187 700 210 C 760 179 820 184 875 214 C 950 206 1050 260 1125 292 C 1215 315 1285 375 1280 438 C 1345 469 1344 525 1315 569 C 1368 605 1355 663 1290 686 C 1225 704 1180 668 1110 687 C 1018 712 971 743 887 724 C 824 697 825 727 790 749 C 727 785 659 803 610 780 C 545 763 497 769 456 730 C 380 707 337 661 316 623 C 264 612 237 579 259 546 C 216 518 195 482 225 447 C 250 404 230 369 285 340 Z'),
  lake:new Path2D('M 436 526 C 485 502 544 521 565 555 C 595 582 651 578 659 616 C 660 654 609 670 568 661 C 509 677 440 640 413 604 C 392 572 404 542 436 526 Z'),
  paths:[[[445,365],[525,400],[630,442],[770,455]],[[810,269],[806,330],[787,378],[770,455]],[[770,455],[904,472],[1060,492],[1205,470]],[[770,455],[786,555],[823,633],[873,701]],[[770,455],[684,513],[611,552],[506,605]]],
  props:[
    ['hill',633,302,144],['hill',1040,350,144],['hill',1148,399,132],
    ['observatory',840,266,77],['barn',452,370,75],['windmill',512,365,49],
    ['house-a',719,463,69],['house-b',760,416,66],['church',826,421,71],
    ['house-a',881,474,68],['house-b',729,535,67],['house-a',839,546,64],
    ['cabin',480,630,59],['lighthouse',1235,654,37],
    ['oak',391,335,45],['oak',425,318,43],['cypress',493,287,24],['oak',547,313,46],
    ['oak',582,260,36],['cypress',728,218,23],['oak',754,230,40],['oak',913,254,41],
    ['oak',956,272,42],['cypress',1101,301,22],['oak',1183,385,49],['oak',1220,408,43],
    ['oak',325,474,48],['oak',350,496,42],['oak',387,543,43],['cypress',632,389,24],
    ['oak',680,397,43],['oak',944,475,45],['oak',970,493,41],['cypress',899,426,22],
    ['oak',388,638,45],['oak',420,664,40],['oak',549,709,43],['oak',579,721,39],
    ['oak',644,651,46],['oak',696,636,43],['oak',1045,598,46],['oak',1080,620,42],
    ['oak',1146,572,46],['oak',1183,584,40]
  ],
  init(){
    if(this.grass)return;const r=mulberry32(244926);this.grass=[];
    for(let i=0;i<10500;i++)this.grass.push([205+r()*1150,200+r()*580,1+r()*2.3,r()]);
    this.props.sort((a,b)=>a[2]-b[2]);
  },
  sprite(ctx,key,x,y,width){
    const im=ShellArt.get('detail-'+key);if(!im)return;const h=width*im.height/im.width;
    ctx.drawImage(im,x-width/2,y-h,width,h);
  },
  draw(ctx,scene){
    this.init();const b=SHELL_MAP,s=b.w/1536,t=Settings.reduceMotion?0:scene.t;
    ctx.save();ctx.translate(b.x,b.y);ctx.scale(s,b.h/1024);
    const sea=ctx.createLinearGradient(0,0,0,1024);sea.addColorStop(0,'#36AFC4');sea.addColorStop(.5,'#269DB8');sea.addColorStop(1,'#228EAB');ctx.fillStyle=sea;ctx.fillRect(0,0,1536,1024);
    // Every wave is drawn at the actual output resolution, including at maximum zoom.
    ctx.lineCap='round';
    for(let row=0;row<55;row++)for(let col=0;col<40;col++){
      const x=col*42+(row%2)*21+Math.sin(t*.23+row)*4,y=row*20+Math.sin(col*.7+row*.8+t*.6)*3;
      ctx.lineWidth=.35+(row%3)*.2;ctx.strokeStyle=(row+col)%3?'rgba(195,241,234,.16)':'rgba(9,106,143,.15)';
      ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+6,y-1.7,x+13,y+1.4,x+21+(col%4)*3,y);ctx.stroke();
    }
    // Soft shallows and surf follow the exact coastline, rather than a raster outline.
    ctx.lineJoin='round';ctx.strokeStyle='rgba(116,220,210,.22)';ctx.lineWidth=42;ctx.stroke(this.coast);
    ctx.strokeStyle='rgba(165,232,211,.38)';ctx.lineWidth=20;ctx.stroke(this.coast);
    const sand=ctx.createLinearGradient(300,200,900,800);sand.addColorStop(0,'#E9DAB4');sand.addColorStop(.6,'#F7E6BB');sand.addColorStop(1,'#DBC592');
    ctx.fillStyle=sand;ctx.fill(this.coast);ctx.strokeStyle='rgba(255,253,226,.7)';ctx.lineWidth=2+Math.sin(t*.7)*.3;ctx.stroke(this.coast);
    ctx.save();ctx.translate(770,470);ctx.scale(.962,.94);ctx.translate(-770,-470);
    const grass=ctx.createLinearGradient(300,250,1100,750);grass.addColorStop(0,'#AABF6B');grass.addColorStop(.45,'#A7BD69');grass.addColorStop(1,'#92AD61');ctx.fillStyle=grass;ctx.fill(this.coast);
    ctx.clip(this.coast);
    const patches=[[500,340,180,'rgba(192,203,114,.4)'],[980,370,210,'rgba(117,158,77,.25)'],[680,620,170,'rgba(211,209,123,.3)'],[1100,560,220,'rgba(197,201,115,.35)']];
    for(const [x,y,r,c]of patches){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'rgba(160,180,90,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
    // Small native marks supply texture without a blurry enlarged grass photograph.
    const stride=scene.cam.z<.65?4:scene.cam.z<1?2:1;
    const [vx,vy]=scene.screenToWorld(0,0),[vx1,vy1]=scene.screenToWorld(W,H);
    const minx=(vx-b.x)/s-5,maxx=(vx1-b.x)/s+5,miny=(vy-b.y)/(b.h/1024)-5,maxy=(vy1-b.y)/(b.h/1024)+5;
    for(let i=0;i<this.grass.length;i+=stride){const [x,y,l,a]=this.grass[i];if(x<minx||x>maxx||y<miny||y>maxy)continue;ctx.strokeStyle=a>.5?'rgba(235,228,156,.24)':'rgba(87,123,62,.19)';ctx.lineWidth=.45;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+.65,y-l);ctx.stroke();}
    ctx.restore();
    // Paths, crop beds, piazza and dock are native drawing commands, not bitmap details.
    for(const path of this.paths){const p=new Path2D();p.moveTo(...path[0]);p.bezierCurveTo(...path[1],...path[2],...path[3]);ctx.strokeStyle='rgba(107,109,62,.14)';ctx.lineWidth=18;ctx.stroke(p);ctx.strokeStyle='#E8D3A3';ctx.lineWidth=13;ctx.stroke(p);ctx.strokeStyle='rgba(255,242,200,.4)';ctx.lineWidth=8;ctx.stroke(p);}
    this.field(ctx,363,391,126,64,'#D4BA56',0);this.field(ctx,473,423,118,59,'#80A154',1);this.field(ctx,560,430,70,48,'#9375A0',2);
    ctx.fillStyle='#DECCA9';ctx.beginPath();ctx.ellipse(793,475,109,63,-.02,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.clip();ctx.strokeStyle='rgba(153,129,94,.32)';ctx.lineWidth=.65;
    for(let y=415;y<545;y+=10){ctx.beginPath();ctx.moveTo(670,y);ctx.lineTo(910,y);ctx.stroke();for(let x=670+(y%20?10:0);x<910;x+=22){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+10);ctx.stroke();}}ctx.restore();
    ctx.save();ctx.shadowColor='rgba(51,80,50,.2)';ctx.shadowBlur=5;ctx.fillStyle='#769C67';ctx.fill(this.lake);ctx.restore();
    ctx.save();ctx.clip(this.lake);const lg=ctx.createLinearGradient(420,520,650,660);lg.addColorStop(0,'#2A8B9C');lg.addColorStop(.6,'#3AA9B6');lg.addColorStop(1,'#67BDB7');ctx.fillStyle=lg;ctx.fillRect(390,505,285,175);
    for(let j=0;j<65;j++){const x=406+(j*37)%248,y=530+(j*23)%126;ctx.strokeStyle='rgba(212,242,222,.32)';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(x+Math.sin(t+j)*1.5,y,4+(j%5),.6,0,0,Math.PI);ctx.stroke();}ctx.restore();
    ctx.strokeStyle='#9EA66F';ctx.lineWidth=3;ctx.stroke(this.lake);
    this.dock(ctx,865,700,130,36,.47);this.dock(ctx,480,623,55,17,.15);
    // Grounded soft shadows, then depth-sorted independent high resolution scenery.
    for(const [key,x,y,w]of this.props){
      const im=ShellArt.get('detail-'+key);if(!im)continue;const h=w*im.height/im.width;
      if(x+w/2<minx||x-w/2>maxx||y<miny||y-h>maxy)continue;
      ctx.save();ctx.fillStyle=key==='hill'?'rgba(76,98,54,.06)':'rgba(54,76,42,.18)';ctx.beginPath();ctx.ellipse(x+w*.09,y-1,w*.35,w*.095,0,0,Math.PI*2);ctx.shadowColor='rgba(54,76,42,.25)';ctx.shadowBlur=9;ctx.fill();ctx.restore();this.sprite(ctx,key,x,y,w);
    }
    this.fountain(ctx,791,489);
    ctx.restore();
  },
  field(ctx,x,y,w,h,color,type){
    ctx.save();ctx.translate(x,y);ctx.rotate(.18);ctx.fillStyle='#A18D5B';rr(ctx,0,0,w,h,4);ctx.fill();
    ctx.fillStyle=color;ctx.fillRect(3,3,w-6,h-6);
    for(let row=5;row<h-4;row+=6){ctx.strokeStyle='rgba(73,86,44,.3)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(5,row);ctx.lineTo(w-5,row);ctx.stroke();for(let xx=7;xx<w-5;xx+=6){ctx.fillStyle=type===0?'#EDD377':type===1?'#9FBA70':'#B19AC0';ctx.beginPath();ctx.ellipse(xx,row-1,type===0?1.4:2.3,type===0?3:1.9,0,0,Math.PI*2);ctx.fill();}}
    ctx.restore();
  },
  dock(ctx,x,y,len,width,angle){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='rgba(34,87,82,.22)';ctx.fillRect(7,6,len,width);
    const g=ctx.createLinearGradient(0,0,0,width);g.addColorStop(0,'#CAA06A');g.addColorStop(1,'#9D7046');ctx.fillStyle=g;ctx.fillRect(0,0,len,width);
    for(let i=0;i<len;i+=7){ctx.strokeStyle='#835F3C';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,width);ctx.stroke();ctx.strokeStyle='rgba(245,214,164,.5)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(i+1,0);ctx.lineTo(i+1,width);ctx.stroke();}
    for(let i=4;i<len;i+=28)for(const yy of [0,width]){ctx.fillStyle='#775333';ctx.fillRect(i-2,yy-9,4,14);ctx.fillStyle='#B88B55';ctx.beginPath();ctx.ellipse(i,yy-9,2.4,1.1,0,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  },
  fountain(ctx,x,y){
    ctx.fillStyle='rgba(80,73,55,.2)';ctx.beginPath();ctx.ellipse(x+4,y+5,25,12,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#D6D3C1';ctx.beginPath();ctx.ellipse(x,y,25,12,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#4DA6AE';ctx.beginPath();ctx.ellipse(x,y-2,20,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#DDE0D3';ctx.fillRect(x-3,y-23,6,22);ctx.beginPath();ctx.ellipse(x,y-23,9,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x,y-29,4,0,Math.PI*2);ctx.fill();
  }
};

function islandAvatar(ctx,scene){
  if(!scene.p)return;const size=82,x=scene.pos[0]-108,y=scene.pos[1]+113;
  ctx.save();
  // A quiet, opaque inner backing and dark outline retain contrast on every terrain.
  const g=ctx.createRadialGradient(x,y+7,24,x,y+7,100);g.addColorStop(0,'rgba(255,252,214,.7)');g.addColorStop(.65,'rgba(255,247,183,.34)');g.addColorStop(1,'rgba(255,247,183,0)');ctx.fillStyle=g;ctx.fillRect(x-105,y-103,210,220);
  ctx.shadowColor='rgba(11,55,58,.35)';ctx.shadowBlur=12;ctx.shadowOffsetY=5;
  ctx.beginPath();ctx.ellipse(x,y-4,53,76,0,0,Math.PI*2);ctx.fillStyle='rgba(255,253,239,.94)';ctx.fill();ctx.shadowColor='transparent';ctx.lineWidth=5;ctx.strokeStyle='#17676B';ctx.stroke();
  ctx.beginPath();ctx.ellipse(x,y-4,48,71,0,0,Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke();ctx.restore();
  drawAvatar(ctx,x,y,82,ANIMALS[scene.p.animal%8].id,PLUSH[scene.p.color%8],{body:true,walk:scene.walk?scene.t:0,tilt:scene.walk?Math.sin(scene.t*11)*.04:0});
}

const VoyageArt={
  sprite(ctx,key,x,baseline,w,alpha=1){const im=ShellArt.get('detail-'+key);if(!im)return;ctx.save();ctx.globalAlpha=alpha;ctx.drawImage(im,x,baseline-w*im.height/im.width,w,w*im.height/im.width);ctx.restore();},
  ocean(ctx,t,scroll){
    const sea=ctx.createLinearGradient(0,480,0,H);sea.addColorStop(0,'#79BAC1');sea.addColorStop(.12,'#3AA6B5');sea.addColorStop(.5,'#258DA3');sea.addColorStop(1,'#176C86');ctx.fillStyle=sea;ctx.fillRect(0,480,W,H-480);
    // Perspective-scaled waves drift horizontally; each band has independent phase.
    for(let r=0;r<36;r++){
      const depth=r/35,y=486+Math.pow(depth,1.7)*420,amp=.6+depth*5,wavelength=48+depth*125;
      ctx.strokeStyle=r%3?'rgba(169,225,220,'+(.17+depth*.12)+')':'rgba(11,99,132,.22)';ctx.lineWidth=.65+depth*1.9;
      ctx.beginPath();for(let x=-20;x<=W+20;x+=12){const yy=y+Math.sin((x+scroll*(.18+depth*.4))/wavelength+t*(.6+depth*.5)+r)*amp;x===-20?ctx.moveTo(x,yy):ctx.lineTo(x,yy);}ctx.stroke();
    }
    for(let k=0;k<150;k++){
      const d=((k*19)%100)/100,y=492+d*d*400,x=((k*137-scroll*(.12+d*.5))%(W+160)+W+160)%(W+160)-80;
      ctx.strokeStyle='rgba(225,248,228,'+(.10+Math.sin(k+t)*.035)+')';ctx.lineWidth=.7+d*1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+10+d*15,y-1-d*2,x+22+d*30,y);ctx.stroke();
    }
  },
  cloud(ctx,x,y,s,alpha){
    ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='rgba(255,252,235,'+alpha+')';ctx.shadowColor='rgba(240,233,208,.15)';ctx.shadowBlur=16;
    ctx.beginPath();ctx.ellipse(0,0,78,19,0,0,Math.PI*2);ctx.ellipse(-32,-13,34,25,0,0,Math.PI*2);ctx.ellipse(12,-20,45,33,0,0,Math.PI*2);ctx.ellipse(52,-5,31,22,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
};
VoyageScene.prototype.drawWorld=function(ctx){
  const t=Settings.reduceMotion?0:this.t,pr=this.prog,scroll=pr*2600+t*18;
  const sky=ctx.createLinearGradient(0,0,0,510);sky.addColorStop(0,'#81BECE');sky.addColorStop(.65,'#D8E7DD');sky.addColorStop(1,'#F9E9C8');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const sun=ctx.createRadialGradient(250,160,18,250,160,180);sun.addColorStop(0,'rgba(255,248,215,.92)');sun.addColorStop(.3,'rgba(255,245,210,.5)');sun.addColorStop(1,'rgba(255,244,210,0)');ctx.fillStyle=sun;ctx.fillRect(60,0,380,350);
  VoyageArt.ocean(ctx,t,scroll);
  const wrap=(v,span)=>((v%span)+span)%span-180;
  VoyageArt.cloud(ctx,wrap(430-scroll*.075,W+360),140,1.2,.6);VoyageArt.cloud(ctx,wrap(1100-scroll*.12,W+360),220,.75,.55);VoyageArt.cloud(ctx,wrap(1550-scroll*.05,W+360),110,.6,.45);
  // Distant layers drift more slowly than the departure harbor and near-water wake.
  VoyageArt.sprite(ctx,'destination',wrap(970-scroll*.14,W+500),489,420,.19);
  VoyageArt.sprite(ctx,'destination',wrap(250-scroll*.23,W+700),496,330,.15);
  VoyageArt.sprite(ctx,'harbor',-110-pr*2050-Math.min(this.t,3.2)*24,530,940);
  const arrival=Ease.inOutQuad(pr),destW=lerp(530,1080,arrival),destX=lerp(W+100,555,arrival);
  VoyageArt.sprite(ctx,'destination',destX,552,destW);
  this.drawBoat(ctx,t);
  // A few small glints in front of the hull reinforce its contact with the sea.
  for(let i=0;i<7;i++){const x=270+i*64+Math.sin(t+i)*8,y=715+Math.sin(t*.8+i)*3;ctx.strokeStyle='rgba(199,239,227,.3)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+28,y-1);ctx.stroke();}
};
VoyageScene.prototype.drawBoat=function(ctx,t){
  const im=ShellArt.get('detail-boat');if(!im)return;
  const w=510,h=w*im.height/im.width,bx=470+Ease.inOutQuad(clamp((this.prog-.8)/.2,0,1))*360,by=704-Ease.inOutQuad(clamp((this.prog-.8)/.2,0,1))*75+Math.sin(t*1.8)*5,tilt=Math.sin(t*1.3)*.022-this.wake*.018;
  ctx.save();ctx.strokeStyle='rgba(224,248,232,.57)';ctx.lineWidth=2.5;ctx.lineCap='round';
  for(let k=0;k<9;k++){const x=bx-190-k*29-this.wake*30,y=by-14+k*3;ctx.beginPath();ctx.moveTo(x-50-k*6,y);ctx.quadraticCurveTo(x,y+4,x+65,y-2);ctx.stroke();}ctx.restore();
  ctx.save();ctx.translate(bx,by);ctx.rotate(tilt);ctx.drawImage(im,-w/2,-h,w,h);
  const hullTop=-h*.24;
  if(this.p)drawAvatar(ctx,-w*.15,hullTop-47,106,ANIMALS[this.p.animal%8].id,PLUSH[this.p.color%8],{body:true,tilt:Math.sin(t*1.7)*.025});
  // The actual front hull is redrawn over the seated avatar, preserving correct occlusion.
  ctx.save();ctx.beginPath();ctx.rect(-w/2,hullTop,w,-hullTop+2);ctx.clip();ctx.drawImage(im,-w/2,-h,w,h);ctx.restore();ctx.restore();
};
IslandScene.prototype.drawVoyageToken=function(ctx){
  const [x,y]=VOYAGE_POS,t=Settings.reduceMotion?0:this.t;
  const [sx,sy]=this.worldToScreen(x-110,y-155),[ex,ey]=this.worldToScreen(x+110,y+30);
  const hov=Mouse.add(sx,sy,ex-sx,ey-sy,{click:()=>{this.cardVoy=true;this.cardOpen=true;this.cardT=0;Sfx.play('whoosh');}});if(hov)this.hoverVoy=true;
  const im=ShellArt.get('detail-boat');if(!im)return;
  ctx.save();ctx.fillStyle='rgba(222,247,226,.45)';ctx.beginPath();ctx.ellipse(x,y+8,98,13,0,0,Math.PI*2);ctx.fill();
  const w=190,h=w*im.height/im.width;ctx.drawImage(im,x-w/2,y-h+Math.sin(t*1.5)*3,w,h);
  if(hov){ctx.strokeStyle='#fffbe9';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(x,y-h/2,w*.58,h*.62,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
};
