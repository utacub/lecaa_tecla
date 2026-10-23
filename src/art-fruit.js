"use strict";
/* Sprite source regions follow the actual layout, not equal grid divisions.
   Extract only the largest connected opaque shape, preserving its alpha edge.
   This prevents the corners of neighbouring sprites from leaking into sprites. */
Art.isolatedRegions={
 "fruit-whole-clean":[[0,0,330,340],[325,0,300,340],[625,0,310,340],[935,0,280,333],[1215,0,321,330],
 [0,340,325,300],[320,340,300,300],[620,335,310,313],[930,333,285,297],[1215,325,321,335],
 [0,638,335,350],[335,640,280,350],[615,650,320,340],[935,630,280,394],[1215,660,321,335]],
 "fruit-cut":[[10,0,350,339],[352,0,320,327],[662,0,325,322],[987,0,305,330],[1293,0,326,334],
 [10,329,315,305],[325,320,322,318],[640,310,329,322],[971,324,315,305],[1281,326,338,312],
 [7,621,336,338],[339,626,294,337],[621,625,334,326],[938,619,347,344],[1275,626,344,337]]
};
Art.isolatedCell=function(key,index,w,h){
 const im=this.get(key),region=this.isolatedRegions[key]?.[index];if(!im||!region)return null;
 this.cells ||= Object.create(null);const cacheKey=['isolated-sprite-v3',key,index,w,h].join(':');
 if(this.cells[cacheKey])return this.cells[cacheKey];
 const [sx,sy,sw,sh]=region,c=makeCanvas(sw,sh),ctx=c.getContext('2d');
 ctx.drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
 const pixels=ctx.getImageData(0,0,sw,sh),d=pixels.data,n=sw*sh;
 const labels=new Int32Array(n),queue=new Int32Array(n);let label=0,best=0,bestSize=0;
 for(let start=0;start<n;start++){
  if(labels[start]||d[start*4+3]<128)continue;
  label++;let read=0,end=1;queue[0]=start;labels[start]=label;
  while(read<end){const at=queue[read++],x=at%sw;
   for(const next of [x?at-1:-1,x<sw-1?at+1:-1,at-sw,at+sw]){
    if(next>=0&&next<n&&!labels[next]&&d[next*4+3]>=128){labels[next]=label;queue[end++]=next;}
   }
  }
  if(end>bestSize){bestSize=end;best=label;}
 }
 if(!best)return null;
 const keep=new Uint8Array(n);let left=sw,top=sh,right=0,bottom=0;
 for(let at=0;at<n;at++)if(labels[at]===best){
  const x=at%sw,y=(at/sw)|0;
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
   const xx=x+dx,yy=y+dy;if(xx>=0&&xx<sw&&yy>=0&&yy<sh)keep[yy*sw+xx]=1;
  }
 }
 for(let at=0;at<n;at++){
  if(!keep[at])d[at*4+3]=0;
  if(d[at*4+3]){const x=at%sw,y=(at/sw)|0;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 ctx.putImageData(pixels,0,0);
 const result=makeCanvas(w,h),rx=result.getContext('2d'),bw=right-left+1,bh=bottom-top+1,k=Math.min((w-8)/bw,(h-8)/bh);
 rx.imageSmoothingQuality='high';rx.drawImage(c,left,top,bw,bh,(w-bw*k)/2,(h-bh*k)/2,bw*k,bh*k);
 return this.cells[cacheKey]=result;
};

// Backward-compatible entry point for Talla fruita.
Art.fruitCell=Art.isolatedCell;
// Individual regions preserve feet, ears and hat pompoms across grid lines.
Art.isolatedRegions["party-guests"]=[
 [45,2,272,373],[384,3,327,373],[763,0,281,379],[1092,3,304,372],
 [44,360,286,367],[367,360,332,371],[761,366,289,361],[1087,367,354,356],
 [37,715,300,360],[397,718,319,359],[767,716,286,359],[1142,717,301,362]
];
