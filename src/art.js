"use strict";
/* Imatges de producció, incrustades al muntatge. Cap petició de xarxa.
   El dibuix procedural continua disponible si un recurs no es pot descodificar. */
const Art = {
  images: Object.create(null),
  init() {
    return Promise.all(Object.entries(typeof ART_DATA === "undefined" ? {} : ART_DATA).map(([key, src]) =>
      new Promise(resolve => {
        const im = new Image();
        im.onload = () => { this.images[key] = im; resolve(true); };
        im.onerror = () => resolve(false);
        im.src = src;
      })
    ));
  },
  get(key) { return this.images[key] || null; },
  // Atlas cells are decoded once; all gameplay uses independent movable layers.
  cell(key, index, cols, rows, w, h) {
    const im = this.get(key); if (!im) return null;
    const id = [key,index,cols,rows,w,h].join(':'); this.cells ||= Object.create(null);
    if (this.cells[id]) return this.cells[id];
    const c = makeCanvas(w,h), x = c.getContext('2d'), sw=im.width/cols, sh=im.height/rows;
    x.imageSmoothingQuality='high';
    const box=this.rects?.[key]?.[index];
    if(box){const [bx,by,bw,bh]=box,k=Math.min(w/bw,h/bh);x.drawImage(im,bx,by,bw,bh,(w-bw*k)/2,(h-bh*k)/2,bw*k,bh*k);}
    else x.drawImage(im,index%cols*sw,Math.floor(index/cols)*sh,sw,sh,0,0,w,h);
    return this.cells[id]=c;
  },
  // Sixteen headings in track coordinates. Symmetric views use horizontal reflection.
  carFrame(color, heading) {
    const dir=((Math.round(heading/(Math.PI/8))%16)+16)%16;
    let key, column, flip=false;
    if(dir%2===0){const d=dir/2;key=d%2?'race-diagonal':'race-cars';column=Math.floor(d/2);}
    else {
      const frames=[['race-turn-front',0,false],['race-turn-front',1,false],
        ['race-turn-front',2,false],['race-turn-front',0,true],
        ['race-turn-front',3,true],['race-turn-back',1,false],
        ['race-turn-back',2,false],['race-turn-front',3,false]];
      [key,column,flip]=frames[(dir-1)/2];
    }
    return {image:this.cell(key,color*4+column,4,4,256,256),flip,dir,key,column};
  },
  fit(ctx, key, x, y, w, h) {
    const im=this.get(key); if(!im)return false;
    const k=Math.min(w/im.width,h/im.height);ctx.drawImage(im,x+(w-im.width*k)/2,y+(h-im.height*k)/2,im.width*k,im.height*k);return true;
  },
};



/* ATLAS BOUNDS */
Art.rects={"orbital-sprites":[[31,81,449,383],[532,141,443,306],[984,121,542,297],[7,542,501,312],[508,533,576,385],[1080,526,419,416]],"crystal-sprites":[[20,19,494,484],[552,45,472,459],[1077,67,442,448],[67,526,422,461],[691,658,225,299],[1153,653,223,299]],"race-props":[[24,61,359,293],[431,23,259,329],[774,66,271,285],[1181,12,184,353],[31,364,316,333],[368,384,362,305],[776,397,261,291],[1087,373,335,325],[60,695,267,345],[495,710,123,325],[737,709,312,318],[1108,718,305,307]],"race-cars":[[38,140,306,197],[382,128,213,206],[639,140,303,197],[993,134,208,200],[37,420,308,198],[380,405,217,209],[638,420,304,198],[992,414,209,201],[37,700,307,199],[380,685,217,210],[637,700,307,200],[993,694,210,201],[37,979,307,200],[380,963,217,211],[636,978,308,201],[992,973,210,202]],"race-diagonal":[[26,55,291,237],[343,60,270,231],[655,53,290,231],[964,56,278,237],[27,344,297,243],[345,351,279,234],[657,342,293,234],[969,342,275,244],[26,642,299,245],[346,641,279,245],[656,644,293,236],[964,647,279,244],[28,946,302,247],[346,944,282,247],[657,945,293,241],[965,946,278,247]],"race-turn-front":[[22,83,314,236],[359,72,264,240],[632,72,263,239],[924,84,308,237],[22,371,318,234],[360,352,264,245],[632,354,265,243],[922,371,311,239],[22,656,317,237],[358,639,266,246],[632,640,266,246],[922,657,311,241],[22,949,317,235],[357,926,266,247],[633,926,266,247],[922,950,311,241]],"race-turn-back":[[29,93,299,226],[365,94,259,224],[655,96,263,221],[947,91,283,228],[30,377,300,227],[366,379,260,222],[656,380,263,221],[946,376,284,229],[29,662,300,227],[368,664,258,223],[655,666,264,221],[946,660,285,230],[28,948,301,232],[366,950,259,227],[655,952,263,226],[945,948,287,234]],"paper-granja":[[12,6,434,331],[457,65,314,267],[835,20,310,326],[1183,27,335,308],[12,335,403,337],[458,361,288,312],[828,350,301,313],[1176,343,351,331],[22,652,381,343],[455,685,307,301],[806,680,277,313],[1253,697,251,299]],"paper-mar":[[30,71,342,258],[444,34,294,325],[774,15,400,331],[1187,40,334,313],[27,377,379,290],[493,357,223,335],[808,378,314,304],[1205,363,300,333],[31,701,389,289],[441,692,382,297],[830,697,328,292],[1199,702,317,291]],"paper-selva":[[33,43,349,333],[412,60,399,312],[820,13,284,376],[1161,84,337,291],[28,386,342,317],[366,396,418,303],[797,397,326,308],[1224,401,258,290],[14,705,379,275],[407,732,455,252],[830,709,338,272],[1162,703,338,279]],"paper-insectes":[[42,18,345,338],[444,125,338,234],[791,26,345,333],[1191,79,298,272],[49,381,372,279],[418,364,343,280],[781,431,335,228],[1162,405,347,265],[17,651,408,316],[412,667,349,308],[766,748,381,203],[1162,687,348,295]],"paper-bosc":[[23,16,388,323],[442,16,349,316],[831,42,270,298],[1205,52,307,287],[53,399,332,259],[443,340,298,331],[809,416,263,244],[1115,345,396,323],[19,681,408,303],[418,731,383,244],[805,694,367,295],[1227,683,278,310]]};
/* END ATLAS BOUNDS */
