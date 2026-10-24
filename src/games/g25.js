"use strict";
/* 25. El carter — llibre desplegable: un carrer de paper s'aixeca i el carter reparteix les cartes */
(() => {
  const HAS = () => typeof Critters !== "undefined";
  const STREETS = [
    { name: "Carrer del Sol", sky: ["#8FD0F0", "#E3F4FB"], hill: ["#9ACB6E", "#7BB25A"] },
    { name: "Carrer de la Lluna", sky: ["#B7B0E8", "#F3E3F0"], hill: ["#8DBF8A", "#6FA37A"] },
    { name: "Plaça Nova", sky: ["#F6C38A", "#FCEBD2"], hill: ["#B9C86A", "#94AE52"] },
    { name: "Carrer Major", sky: ["#86C9D8", "#DDF2EF"], hill: ["#7FBF8F", "#5FA27A"] },
    { name: "Carrer del Mar", sky: ["#7DB6E8", "#D2E9FA"], hill: ["#E8D49A", "#D2B676"] },
  ];
  const HOUSE_COLS = ["#F28C6B", "#F6C667", "#8FCBE8", "#A8D98A", "#F2A7B8", "#C9B6E8", "#F4B183", "#9ED9C4"];
  const ROOF_COLS = ["#C8553D", "#8A5A3B", "#3E7CC0", "#5E8F3A", "#B8442A"];
  const BOX_COLS = ["#D9443A", "#3E7CC0", "#E8963A", "#3FA34D"];
  const NEIGH = ["gat", "gos", "conill", "guineu", "mussol", "os", "esquirol", "granota", "ovella", "porc", "mico", "lleo", "erico", "anec", "cabra", "marieta", "pollet", "vaca"];
  const WINDOWS = [[374,202,89,106],[893,202,86,109],[371,800,94,104],[895,784,91,111]];
  const BASE = 652, ENV = [930, 718];

  /* ---------- fons: taula, llibre obert ---------- */
  let BG = null;
  function buildBg() {
    if (BG) return BG;
    const c = makeCanvas(W, H), x = c.getContext("2d");
    if(Art.get('g25-book')){x.drawImage(Art.get('g25-book'),0,0,W,H);BG=c;return c;}
    x.drawImage(Tex.wood(W, H, "#B9895A", { seed: 25 }), 0, 0);
    // tapes del llibre
    const cover = [[70, 586], [1530, 586], [1590, 900], [10, 900]];
    x.save(); x.shadowColor = "rgba(40,20,5,0.5)"; x.shadowBlur = 30; x.shadowOffsetY = 12; x.beginPath(); cover.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fillStyle = "#2F5E7A"; x.fill(); x.restore();
    Mat.texFill(x, c2 => { c2.beginPath(); cover.forEach((p, i) => i ? c2.lineTo(p[0], p[1]) : c2.moveTo(p[0], p[1])); c2.closePath(); }, Tex.felt(128, 128, "#bbbbbb", { seed: 6 }), "#2F5E7A", { alpha: 0.45 });
    // pàgines (amb gruix de fulls)
    for (const side of [-1, 1]) {
      for (let k = 4; k >= 0; k--) {
        const pg = side < 0 ? [[96 - k * 2, 596 + k * 3], [800, 606 + k * 2], [800, 892], [40 - k * 3, 884 + k * 2]] : [[800, 606 + k * 2], [1504 + k * 2, 596 + k * 3], [1560 + k * 3, 884 + k * 2], [800, 892]];
        x.beginPath(); pg.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath();
        if (k) { x.fillStyle = k % 2 ? "#E6DCC6" : "#F2EAD8"; x.fill(); continue; }
        x.save(); x.clip(); x.drawImage(Tex.paper(800, 300, "#FBF6EA", { seed: side < 0 ? 31 : 32 }), side < 0 ? 0 : 800, 596, 800, 300);
        const g = x.createLinearGradient(800, 0, 800 + side * 160, 0); g.addColorStop(0, "rgba(90,70,40,0.32)"); g.addColorStop(1, "rgba(90,70,40,0)"); x.fillStyle = g; x.fillRect(0, 590, W, 310);
        x.restore();
      }
    }
    // línia de text decoratiu del llibre
    x.strokeStyle = "rgba(120,100,70,0.16)"; x.lineWidth = 3; x.lineCap = "round";
    for (let r = 0; r < 4; r++) for (const side of [-1, 1]) { const y = 860 - r * 14 + (side < 0 ? 0 : 0); x.beginPath(); x.moveTo(side < 0 ? 120 + r * 8 : 980, y); x.lineTo(side < 0 ? 620 : 1480 - r * 8, y); x.stroke(); }
    BG = c; return c;
  }
  /* decorat de fons d'un carrer (cartolina que s'aixeca) */
  const DECO = {};
  function backdrop(i) {
    if (DECO[i]) return DECO[i];
    const S = STREETS[i], w = 1320, h = 520, c = makeCanvas(w, h), x = c.getContext("2d");
    rr(x, 0, 0, w, h, 26); x.save(); x.clip();
    let g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, S.sky[0]); g.addColorStop(1, S.sky[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.35; x.drawImage(Tex.paper(w, h, "#ffffff", { seed: 40 + i }), 0, 0); x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
    const cut = (pf, col, d = 5) => Mat.paperCut(x, pf, col, { depth: d, seed: 3 + i });
    cut(c2 => { c2.beginPath(); c2.arc(i === 2 ? 1080 : 1140, 120, 54, 0, 6.28); }, i === 1 ? "#FFF6D8" : "#FFD23F", 4);
    for (const [cx, cy, s] of [[230, 110, 1], [700, 80, 0.75], [980, 170, 0.6]]) cut(c2 => { c2.beginPath(); for (let k = 0; k < 4; k++) c2.arc(cx + (k - 1.5) * 34 * s, cy - (k % 3 ? 14 : 0) * s, 32 * s, 0, 6.28); }, "#FFFFFF", 3);
    cut(c2 => { c2.beginPath(); c2.moveTo(0, h); for (let xx = 0; xx <= w; xx += 20) c2.lineTo(xx, 330 - Math.sin(xx / 210 + i) * 40 - Math.sin(xx / 77) * 8); c2.lineTo(w, h); c2.closePath(); }, S.hill[0], 6);
    // campanar i teulades llunyanes
    cut(c2 => { c2.beginPath(); c2.rect(560, 250, 50, 160); c2.moveTo(552, 252); c2.lineTo(585, 205); c2.lineTo(618, 252); c2.closePath(); }, shade(S.hill[1], -0.2), 4);
    cut(c2 => { c2.beginPath(); c2.moveTo(0, h); for (let xx = 0; xx <= w; xx += 20) c2.lineTo(xx, 400 - Math.sin(xx / 160 + i * 2) * 26); c2.lineTo(w, h); c2.closePath(); }, S.hill[1], 6);
    x.restore();
    x.strokeStyle = "rgba(255,255,255,0.6)"; x.lineWidth = 4; rr(x, 2, 2, w - 4, h - 4, 24); x.stroke();
    return (DECO[i] = c);
  }
  /* casa de paper desplegable */
  function houseSprite(kind, col, roof, w, h) {
    return Sprites.get(`c25h${kind}${col}${roof}${w}x${h}`, w + 40, h + 130, (x) => {
      const art=Art.get('g25-houses'),box=Art.rects['g25-houses'][kind];
      if(art){x.drawImage(art,...box,0,0,w+40,h+130);return;}
      const ox = 20, top = 130, by = top + h;
      const body = c => { c.beginPath(); c.rect(ox, top, w, h); };
      Mat.paperCut(x, body, col, { depth: 7, seed: w });
      // plec del desplegable: meitat dreta lleugerament a l'ombra
      x.fillStyle = "rgba(60,30,20,0.12)"; x.fillRect(ox + w / 2, top, w / 2, h);
      x.strokeStyle = "rgba(255,255,255,0.45)"; x.lineWidth = 2; x.beginPath(); x.moveTo(ox + w / 2, top); x.lineTo(ox + w / 2, by); x.stroke();
      // teulada
      const rf = c => {
        c.beginPath();
        if (kind === 0) { c.moveTo(ox - 14, top + 6); c.lineTo(ox + w / 2, top - 100); c.lineTo(ox + w + 14, top + 6); c.closePath(); }
        else if (kind === 1) { const s = w / 6; c.moveTo(ox - 6, top + 4); c.lineTo(ox - 6, top - 20); c.lineTo(ox + s, top - 20); c.lineTo(ox + s, top - 50); c.lineTo(ox + 2 * s, top - 50); c.lineTo(ox + 2 * s, top - 82); c.lineTo(ox + 4 * s, top - 82); c.lineTo(ox + 4 * s, top - 50); c.lineTo(ox + 5 * s, top - 50); c.lineTo(ox + 5 * s, top - 20); c.lineTo(ox + w + 6, top - 20); c.lineTo(ox + w + 6, top + 4); c.closePath(); }
        else if (kind === 2) { c.rect(ox - 12, top - 26, w + 24, 30); }
        else { c.moveTo(ox - 8, top + 4); c.lineTo(ox - 8, top - 10); c.quadraticCurveTo(ox + w / 2, top - 130, ox + w + 8, top - 10); c.lineTo(ox + w + 8, top + 4); c.closePath(); }
      };
      Mat.paperCut(x, rf, roof, { depth: 5, seed: w + 1 });
      if (kind === 2) { x.fillStyle = shade(roof, 0.35); for (let k = 0; k < 8; k++) { x.fillRect(ox - 4 + k * (w + 8) / 8 + 6, top - 52, 10, 26); } x.fillRect(ox - 10, top - 56, w + 20, 8); }
      // finestra (el veí hi treu el cap: interior fosc)
      const wx = ox + w / 2 - 40, wy = top + 34;
      x.fillStyle = shade(col, -0.35); rr(x, wx - 8, wy - 8, 96, 92, 10); x.fill();
      x.fillStyle = "#3A3550"; rr(x, wx, wy, 80, 76, 6); x.fill();
      x.fillStyle = shade(col, 0.4); x.fillRect(wx - 12, wy + 76, 104, 10);
      // porta
      const dx = ox + w * 0.26 - 30, dh = Math.min(118, h * 0.42);
      Mat.paperCut(x, c => { c.beginPath(); c.moveTo(dx, by); c.lineTo(dx, by - dh + 30); c.arc(dx + 30, by - dh + 30, 30, Math.PI, 0); c.lineTo(dx + 60, by); c.closePath(); }, shade(roof, -0.15), { depth: 3, seed: 9 });
      x.fillStyle = "#F2C14E"; x.beginPath(); x.arc(dx + 48, by - dh * 0.45, 4.5, 0, 6.28); x.fill();
      // flors a la base
      for (let k = 0; k < 5; k++) { const fx = ox + w * 0.55 + k * 18; x.fillStyle = "#4E8F3A"; x.fillRect(fx - 1.5, by - 18, 3, 18); x.fillStyle = ["#E8507A", "#F6C343", "#FFFFFF"][k % 3]; x.beginPath(); x.arc(fx, by - 20, 6, 0, 6.28); x.fill(); }
    });
  }
  function mailbox(col) {
    return Sprites.get("c25mb" + col, 92, 84, (x) => {
      Mat.paperCut(x, c => { c.beginPath(); c.moveTo(10, 78); c.lineTo(10, 30); c.arc(46, 30, 36, Math.PI, 0); c.lineTo(82, 78); c.closePath(); }, col, { depth: 4, seed: 4 });
      const enamel=x.createLinearGradient(10,0,82,0);enamel.addColorStop(0,'rgba(0,0,0,.28)');enamel.addColorStop(.33,'rgba(255,255,255,.3)');enamel.addColorStop(1,'rgba(0,0,0,.12)');
      x.fillStyle=enamel;x.beginPath();x.moveTo(10,78);x.lineTo(10,30);x.arc(46,30,36,Math.PI,0);x.lineTo(82,78);x.closePath();x.fill();
      x.strokeStyle='#dcb974';x.lineWidth=2.5;x.stroke();
      x.fillStyle = "rgba(0,0,0,0.55)"; rr(x, 24, 34, 44, 8, 4); x.fill();
      x.fillStyle = "rgba(255,255,255,0.85)"; x.font = `900 15px ${FONT_T}`; x.textAlign = "center"; x.fillText(L_("CORREU"), 46, 66);
    });
  }
  /* carter amb bicicleta (de cara a la dreta) */
  function postman() {
    return Sprites.get("c25post", 300, 260, (x) => {
      const art=Art.get('g25-postman');
      if(art){x.drawImage(art,263,12,1025,984,15,0,270,260);return;}
      const pc = (pf, col, d = 4) => Mat.paperCut(x, pf, col, { depth: d, seed: 12 });
      for (const wx of [70, 232]) { x.lineWidth = 9; x.strokeStyle = "#2A2A30"; x.beginPath(); x.arc(wx, 208, 44, 0, 6.28); x.stroke(); x.lineWidth = 2; x.strokeStyle = "#9AA0A8"; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; x.beginPath(); x.moveTo(wx, 208); x.lineTo(wx + Math.cos(a) * 40, 208 + Math.sin(a) * 40); x.stroke(); } x.fillStyle = "#555"; x.beginPath(); x.arc(wx, 208, 6, 0, 6.28); x.fill(); }
      x.strokeStyle = "#D9443A"; x.lineWidth = 8; x.lineCap = "round"; x.lineJoin = "round";
      x.beginPath(); x.moveTo(70, 208); x.lineTo(130, 150); x.lineTo(214, 150); x.lineTo(232, 208); x.moveTo(130, 150); x.lineTo(150, 208); x.lineTo(70, 208); x.moveTo(214, 150); x.lineTo(206, 112); x.lineTo(186, 104); x.stroke();
      x.fillStyle = "#3A2A22"; rr(x, 104, 136, 44, 12, 6); x.fill();
      // cames
      x.strokeStyle = "#24476B"; x.lineWidth = 16; x.beginPath(); x.moveTo(128, 128); x.lineTo(166, 168); x.lineTo(150, 206); x.stroke();
      // cos
      pc(c => { c.beginPath(); c.moveTo(108, 136); c.lineTo(118, 64); c.quadraticCurveTo(140, 52, 160, 66); c.lineTo(156, 136); c.closePath(); }, "#3E7CC0", 5);
      x.strokeStyle = "#3E7CC0"; x.lineWidth = 13; x.beginPath(); x.moveTo(150, 76); x.lineTo(182, 102); x.lineTo(192, 104); x.stroke();
      x.fillStyle = "#F2C9A0"; x.beginPath(); x.arc(194, 104, 7, 0, 6.28); x.fill();
      // corretja de la saca
      x.strokeStyle = "#7A4A26"; x.lineWidth = 6; x.beginPath(); x.moveTo(120, 70); x.lineTo(156, 126); x.stroke();
      // cap
      pc(c => { c.beginPath(); c.arc(140, 40, 25, 0, 6.28); }, "#F2C9A0", 4);
      pc(c => { c.beginPath(); c.moveTo(114, 34); c.quadraticCurveTo(138, 2, 164, 30); c.lineTo(178, 34); c.lineTo(166, 38); c.lineTo(114, 38); c.closePath(); }, "#D9443A", 3);
      x.fillStyle = "#F2B630"; x.beginPath(); x.arc(140, 22, 4, 0, 6.28); x.fill();
      x.fillStyle = "#2B2320"; x.beginPath(); x.arc(150, 44, 3, 0, 6.28); x.fill();
      x.strokeStyle = "#2B2320"; x.lineWidth = 2.5; x.beginPath(); x.arc(150, 52, 7, 0.2, 2.2); x.stroke();
      x.fillStyle = "rgba(240,110,120,0.5)"; x.beginPath(); x.arc(158, 50, 5, 0, 6.28); x.fill();
      x.fillStyle = "#6A4A3A"; x.beginPath(); x.ellipse(160, 50, 8, 3.5, 0.2, 0, 6.28); x.fill();
    });
  }
  const bagFront = () => Sprites.get("c25bag", 130, 90, (x) => {
    Mat.paperCut(x, c => { c.beginPath(); c.moveTo(10, 10); c.lineTo(120, 10); c.lineTo(112, 74); c.quadraticCurveTo(65, 86, 18, 74); c.closePath(); }, "#9A6234", { depth: 5, seed: 7 });
    x.fillStyle = "#7A4A26"; rr(x, 10, 6, 110, 16, 6); x.fill();
    x.fillStyle = "#F2B630"; rr(x, 56, 16, 18, 22, 4); x.fill();
    x.fillStyle = "rgba(255,255,255,0.7)"; x.font = `900 13px ${FONT_T}`; x.textAlign = "center"; x.fillText(L_("CORREU"), 65, 62);
  });
  function drawEnvelope(ctx, x, y, w, h, rot, s) {
    ctx.save(); ctx.translate(x, y); if (rot) ctx.rotate(rot); if (s != null) ctx.scale(s, s);
    ctx.shadowColor = "rgba(40,25,10,0.35)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    ctx.fillStyle = "#F7EFDD"; rr(ctx, -w / 2, -h / 2, w, h, 8); ctx.fill(); ctx.shadowColor = "transparent";
    ctx.strokeStyle = "rgba(150,120,80,0.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w / 2 + 4, -h / 2 + 4); ctx.lineTo(0, h * 0.08); ctx.lineTo(w / 2 - 4, -h / 2 + 4); ctx.stroke();
    ctx.fillStyle = "#E8603A"; rr(ctx, w / 2 - 34, -h / 2 + 8, 24, 28, 3); ctx.fill(); ctx.strokeStyle = "#FFFFFF"; ctx.setLineDash([3, 3]); ctx.strokeRect(w / 2 - 32, -h / 2 + 10, 20, 24); ctx.setLineDash([]);
    ctx.restore();
  }
  // Each shutter leaf comes from the facade's own painted wood and ironwork.
  function drawShutters(ctx, x, y, open, col, kind = 0) {
    const art = Art.get('g25-houses'), box = WINDOWS[kind];
    for (const side of [-1, 1]) {
      const k = Math.cos(open * 2.65), hx = x + (side < 0 ? 0 : 80);
      ctx.save(); ctx.translate(hx, y); ctx.scale(k * (side < 0 ? 1 : -1), 1);
      ctx.shadowColor='rgba(25,18,12,.35)';ctx.shadowBlur=4;ctx.shadowOffsetX=3;ctx.shadowOffsetY=2;
      if (art) {
        const half=box[2]/2;
        if(side<0)ctx.drawImage(art,box[0],box[1],half,box[3],0,0,40,76);
        else {ctx.save();ctx.translate(40,0);ctx.scale(-1,1);ctx.drawImage(art,box[0]+half,box[1],half,box[3],0,0,40,76);ctx.restore();}
      } else {ctx.fillStyle=col;ctx.fillRect(0,0,40,76);}
      ctx.shadowColor='transparent';ctx.fillStyle=`rgba(25,20,12,${Math.sin(open*Math.PI)*.18})`;ctx.fillRect(0,0,40,76);
      ctx.strokeStyle='rgba(60,38,19,.5)';ctx.lineWidth=.8;ctx.strokeRect(0,0,40,76);ctx.restore();
    }
  }
  function drawNeighbour(ctx, id, x, y, wave, t) {
    const index=NEIGH.indexOf(id), bounds=Art.rects['g25-neighbours']?.[index], aspect=bounds?bounds[2]/bounds[3]:1;
    const portrait=index<0?null:Art.cell('g25-neighbours',index,6,3,160,Math.round(160/aspect));
    ctx.save();ctx.beginPath();ctx.rect(x,y,80,76);ctx.clip();
    const room=ctx.createLinearGradient(x,y,x+80,y+76);room.addColorStop(0,'#232f31');room.addColorStop(1,'#80624a');ctx.fillStyle=room;ctx.fillRect(x,y,80,76);
    if(portrait){
      const bob=Settings.reduceMotion?0:Math.sin(t*5.5)*1.2;
      const m=ctx.getTransform(),ratio=Math.hypot(m.c,m.d)/Math.hypot(m.a,m.b);
      const pw=Math.min(76,72*aspect*ratio),ph=pw/aspect/ratio;
      ctx.translate(x+40,y+76-ph/2+(1-wave)*76+bob);
      if(!Settings.reduceMotion)ctx.rotate(Math.sin(t*3.5)*.035*wave);
      ctx.drawImage(portrait,-pw/2,-ph/2,pw,ph);
    } else if(HAS())Critters.draw(ctx,id,x+40,y+92-wave*34,96,{t,pose:'happy'});
    ctx.restore();
  }

  Games.register({
    id: 25, key: "ç", name: "El carter", zone: "poble", music: "waltz", demoTime: 11, kbPos: [800, 236], missAt: [330, 772], captionY: 400,
    collect: { one: "postal dels veïns", many: "postals dels veïns" },
    goal: l => L_(l <= 3 ? "Escriu la lletra del sobre per dur-lo a la seva bústia." : l === 4 ? "Escriu la síl·laba del sobre per dur-lo a la seva bústia." : l === 5 ? "Escriu el nom del veí que hi ha al sobre." : "Escriu l'adreça del sobre per dur-hi la carta.") + L_(" Hi ha 5 carrers."),
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, "#8FD0F0"); g.addColorStop(1, "#E3F4FB"); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);if(Art.get('g25-book'))ctx.drawImage(Art.get('g25-book'),x,y,w,h);
      const s = Math.min(w / 260, h / 200), cx = x + w / 2, by = y + h / 2 + 70 * s;
      ctx.fillStyle = "#9ACB6E"; ctx.fillRect(x, by - 10 * s, w, h);
      ctx.fillStyle = "#F7EFDD"; ctx.fillRect(x, by + 8 * s, w, h);
      const hs = houseSprite(0, "#F28C6B", "#C8553D", 150, 150), k = 0.62 * s;
      ctx.drawImage(hs.c, cx - 110 * s - 20 * k, by - (150 + 130) * k, hs.w * k, hs.h * k);
      const wave = (Math.sin(t * 1.4) + 1) / 2;
      {const box=Art.rects['g25-houses'][0],win=WINDOWS[0];
       const left=cx-110*s-20*k,top=by-(150+130)*k;
       ctx.save();ctx.translate(left+(win[0]-box[0])*hs.w*k/box[2],top+(win[1]-box[1])*hs.h*k/box[3]);
       ctx.scale(win[2]*hs.w*k/box[2]/80,win[3]*hs.h*k/box[3]/76);
       drawNeighbour(ctx,'gat',0,0,wave,t);drawShutters(ctx,0,0,Ease.outCubic(wave),'#4a7452',0);ctx.restore();}
      const mb = mailbox("#D9443A"); ctx.drawImage(mb.c, cx + 10 * s, by - 70 * s, 70 * s, 64 * s);
      const fy = by - 120 * s - Math.sin(t * 2) * 6 * s;
      drawEnvelope(ctx, cx + 64 * s, fy, 100 * s, 68 * s, -0.08);
      drawPlate(ctx, "ç", cx + 60 * s, fy + 2 * s, { size: 34 * s, shadowBlur: 4 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, NH = L === 6 ? 3 : 4, PER = L <= 4 ? 4 : L === 5 ? 3 : 2, NST = 5;
      buildBg();
      const streetLayer=makeCanvas(W,H),streetCtx=streetLayer.getContext("2d");
      const pool = api.pool(L >= 5 ? { theme: "noms" } : undefined);
      const neigh = shuffle(NEIGH.filter(id => !HAS() || Critters.name(id)));
      const st = { street: 0, phase: "rise", t: 0, turn: 0, delivered: 0 };
      let houses = [], queue = [], env = null, flyer = null, loops = [];
      const plateSz = L <= 3 ? 64 : L === 4 ? 52 : L === 5 ? 46 : 40;
      function buildStreet(i) {
        const texts = [];
        for (let k = 0; k < NH; k++) { let it, n = 0; do { it = pool.next(texts); n++; } while (texts.includes(it) && n < 40); texts.push(it); }
        const gap = NH === 4 ? 312 : 400, hw = NH === 4 ? 236 : 270;
        houses = texts.map((tx, k) => {
          const hx = 800 + (k - (NH - 1) / 2) * gap, hh = (L <= 4 ? 262 : 300) + ((k * 37 + i * 53) % 4) * (L <= 4 ? 18 : 14);
          return { x: hx, w: hw, h: hh, kind: (k + i * 2) % 4, col: HOUSE_COLS[(k * 3 + i) % HOUSE_COLS.length], roof: ROOF_COLS[(k + i) % ROOF_COLS.length], shut: ["#3E7CC0", "#3FA34D", "#C8553D", "#8A5A3B"][(k + i) % 4], box: BOX_COLS[(k * 2 + i) % BOX_COLS.length], text: tx, neigh: neigh[(i * 4 + k) % neigh.length], wave: 0, waveT: 0, flap: 0, done: false, pop: 0 };
        });
        queue = shuffle(houses.map((_, k) => k)).slice(0, PER);
        env = null;
      }
      function nextEnvelope() {
        if (!queue.length) { st.phase = "fold"; st.t = 0; Sfx.play("bike"); return; }
        const h = houses[queue.shift()];
        env = { h, text: h.text, typed: 0, t: 0 };
        if (L >= 5) setTimeout(() => api.sayItem(env ? env.text : "", "{x}"), api.demo ? 50 : 250);
      }
      const MBS = L <= 4 ? 1.3 : 1;
      const mbPos = h => [h.x + h.w * 0.27, BASE - (L <= 4 ? 72 : 52)];
      const platePos = h => L <= 4 ? [h.x + h.w * 0.27, BASE - 58] : [h.x + 8, BASE - 150];
      buildStreet(0);
      return {
        expected() { return st.phase === "play" && env && !flyer ? env.text[env.typed] : null; },
        onKey(k) {
          if (st.phase !== "play" || !env || flyer || k.length !== 1) return;
          const ch = env.text[env.typed];
          if (k === ch) {
            env.typed++; api.hit({ sfx: env.typed >= env.text.length ? "hit" : "key" });
            if (env.typed >= env.text.length) { flyer = { h: env.h, t: 0, text: env.text }; env = null; Sfx.play("whoosh"); }
          } else {
            api.miss(ch, k, { sfx: "miss" });
            loops.push({ at: App.t }); env.loopAt = App.t; Sfx.play("page");
          }
        },
        update(dt) {
          st.t += dt;
          if (st.phase === "rise" && st.t > 1.4) { st.phase = "play"; st.t = 0; nextEnvelope(); if (st.street === 0 || true) Sfx.play("bike"); }
          if (env) env.t += dt;
          houses.forEach(h => { if (h.waveT > 0) h.waveT -= dt; h.wave = clamp(h.waveT > 0 ? h.wave + dt * 3 : h.wave - dt * 3, 0, 1); h.flap = Math.max(0, h.flap - dt * 2.5); h.pop = Math.max(0, h.pop - dt * 2); });
          if (flyer) {
            flyer.t += dt / 0.85;
            if (flyer.t >= 1 && !flyer.landed) {
              flyer.landed = true; const h = flyer.h; h.done = true; h.flap = 1; h.pop = 1; Sfx.play("clack");
              const [mx, my] = mbPos(h); api.particles.emit(mx, my - 20, { count: 12, color: ["#FFFFFF", "#F2B630", h.box], shape: "confetti", speed: 240, gravity: 420, size: 9, life: 0.8 });
              setTimeout(() => { h.waveT = 1.9; Sfx.play("chime", { note: 88 }); void 0; }, 280);
              st.delivered++;
            }
            if (flyer.t > 1.5) { flyer = null; nextEnvelope(); }
          }
          if (st.phase === "fold" && st.t > 2.2) {
            if(st.street === NST-1){st.phase='done';api.hud.progress=[NST,NST];api.finish(true,{collectName:'5 postals dels veïns'});return;}
            st.phase = "turn"; st.t = 0; Sfx.play("page");
          }
          if (st.phase === "turn" && st.t > 0.15) {
            st.street++;
            if (st.street >= NST) { st.phase = "done"; api.finish(true, { collectName: "5 postals dels veïns" }); return; }
            buildStreet(st.street); st.phase = "rise"; st.t = 0;
          }
          api.hud.progress = [st.street + (st.phase === "turn" ? 1 : 0), NST];
          
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(BG, 0, 0);
          // Dissolve the complete street as one layer; the illustrated book stays still.
          // Reduced motion uses a direct scene change, without flattening or scaling.
          let up=1;
          if(!Settings.reduceMotion){
            if(st.phase==='rise')up=Ease.inOutCubic(clamp(st.t/.9,0,1));
            else if(st.phase==='fold' && st.street<NST-1)up=1-Ease.inOutCubic(clamp((st.t-1.6)/.6,0,1));
            else if(st.phase==='turn')up=0;
          }
          if(up>0.001){
            const streetTarget=ctx,dissolve=up<.999;
            if(dissolve){ctx=streetCtx;ctx.clearRect(0,0,W,H);}
            ctx.save();
            const bh=520;
            if(!Art.get('g25-book'))ctx.drawImage(backdrop(st.street%STREETS.length),140,90,1320,bh);
            // rètol del carrer
            if (up > 0) {
              const a = 1, sy = Art.get("g25-book") ? 135 : 610 - bh + 118, nm = STREETS[st.street % STREETS.length].name;
              ctx.save(); ctx.globalAlpha *= a; const tw = measure(ctx, nm, 30, 900, FONT_T) + 60;
              ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; rr(ctx, 800 - tw / 2, sy - 28, tw, 56, 10); ctx.fillStyle = "#2F5E7A"; ctx.fill(); ctx.shadowColor = "transparent";
              ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 3; rr(ctx, 800 - tw / 2 + 6, sy - 22, tw - 12, 44, 7); ctx.stroke();
              text(ctx, nm, 800, sy + 1, { size: 30, weight: 900, font: FONT_T, color: "#FFFFFF" }); ctx.restore();
            }
            // vorera de paper
            ctx.fillStyle = "#C9C2B4"; ctx.fillRect(150, BASE - 4, 1300, 22); ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(150, BASE + 14, 1300, 4);
            houses.forEach((h, k) => {
              const sp=houseSprite(h.kind,h.col,h.roof,h.w,h.h);
              ctx.drawImage(sp.c,h.x-sp.w/2,BASE-sp.h,sp.w,sp.h);
              // finestra: porticons i veí
              let wx = h.x - 40, wy = BASE - h.h + 34;
              ctx.save();
              if(Art.get('g25-houses')) {
                const box=Art.rects['g25-houses'][h.kind],win=WINDOWS[h.kind];
                ctx.translate(h.x-sp.w/2+(win[0]-box[0])*sp.w/box[2],BASE-sp.h+(win[1]-box[1])*sp.h/box[3]);
                ctx.scale(win[2]*sp.w/box[2]/80,win[3]*sp.h/box[3]/76);wx=0;wy=0;
                ctx.fillStyle='#302c37';ctx.fillRect(0,0,80,76);
              }
              drawNeighbour(ctx,h.neigh,wx,wy,h.wave,t);
              drawShutters(ctx,wx,wy,Ease.outCubic(h.wave),h.shut,h.kind);
              if (h.wave > 0.5) {
                const a = clamp((h.wave - 0.5) * 2, 0, 1), bx = wx + 92, by2 = wy - 18;
                ctx.save(); ctx.globalAlpha *= a; ctx.shadowColor = "rgba(0,0,0,0.2)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
                rr(ctx, bx, by2 - 26, 150, 52, 20); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.shadowColor = "transparent";
                ctx.beginPath(); ctx.moveTo(bx + 14, by2 + 20); ctx.lineTo(bx - 8, by2 + 34); ctx.lineTo(bx + 30, by2 + 22); ctx.fill();
                text(ctx, "Gràcies!", bx + 75, by2 + 1, { size: 28, weight: 800, font: FONT_T, color: BRAND.tinta }); ctx.restore();
              }
              ctx.restore();
              // bústia i placa
              const [mx, my] = mbPos(h), mb = mailbox(h.box), fl = h.flap;
              ctx.fillStyle = "#6A5A4A"; ctx.fillRect(mx - 4, my + 30 * MBS, 8, Math.max(0, BASE - my - 30 * MBS));
              ctx.drawImage(mb.c, mx - 46 * MBS, my - 42 * MBS - h.pop * 6, 92 * MBS, 84 * MBS);
              if (fl > 0) { ctx.fillStyle = shade(h.box, -0.3); rr(ctx, mx - 24 * MBS, my - 12 * MBS - fl * 10, 48 * MBS, 8 + fl * 6, 3); ctx.fill(); }
              if (h.done) { ctx.fillStyle = "#F2B630"; ctx.fillRect(mx + 40 * MBS, my - 40 * MBS, 5, 34); ctx.fillStyle = "#E8603A"; ctx.fillRect(mx + 44 * MBS, my - 40 * MBS, 22, 14); }
              const [px, py] = platePos(h);
              drawPlate(ctx, h.text, px, py, { size: plateSz, state: h.done ? "ok" : null, shadowBlur: 8, border: h.done ? null : shade(h.box, -0.1), borderW: 4 });
            });
            ctx.restore();
            if(dissolve){ctx=streetTarget;ctx.save();ctx.globalAlpha*=up;ctx.drawImage(streetLayer,0,0);ctx.restore();}
          }
          // carter, saca i sobre
          const pm = postman(), bob = Settings.reduceMotion ? 0 : Math.sin(t * 2.2) * 2;
          ctx.drawImage(pm.c, 822 - pm.w * 0.55, 884 - pm.h * 1.1 + bob, pm.w * 1.1, pm.h * 1.1);
          if (env) {
            const sz = plateSize(ctx, env.text, plateSz), ew = sz.w + 70, eh = sz.h + 56;
            let ex = ENV[0], ey = ENV[1] - Ease.outBack(clamp(env.t / 0.4, 0, 1)) * 30 + 30, rot = 0;
            if (env.loopAt != null) { const e = (App.t - env.loopAt) / 1.0; if (e < 1) { const a = e * Math.PI * 2; ex += Math.sin(a) * 90; ey += -Math.sin(a / 2) * 150 + (1 - Math.cos(a)) * 0; rot = Math.sin(a) * 0.5; } }
            drawEnvelope(ctx, ex, ey, ew, eh, rot);
            drawPlate(ctx, env.text, ex - 10, ey + 6, { size: plateSz, progress: env.typed, state: "active", shadowBlur: 6 });
          }
          if (flyer) {
            const k = Ease.inOutCubic(clamp(flyer.t, 0, 1)), [mx, my] = mbPos(flyer.h), x0 = ENV[0], y0 = ENV[1];
            const cx = (x0 + mx) / 2, cy = Math.min(y0, my) - 260, u = 1 - k;
            const x = u * u * x0 + 2 * u * k * cx + k * k * mx, y = u * u * y0 + 2 * u * k * cy + k * k * (my - 12 * MBS);
            if (flyer.t < 1) drawEnvelope(ctx, x, y, 150, 100, Math.sin(k * Math.PI) * -0.6 + (mx > x0 ? 0.2 : -0.2) * k, lerp(1, 0.32, k));
            if (k < 0.25) drawPlate(ctx, flyer.text, x - 10, y + 6, { size: plateSz, alpha: 1 - k * 4, state: "ok" });
          }
          if(!Art.get("g25-postman")){const bf = bagFront(); ctx.drawImage(bf.c, ENV[0] - 70, ENV[1] + 44, bf.w * 1.1, bf.h * 1.1);}
          drawVignette(ctx, 0.25, "40,25,10");
        },
      };
    },
  });
})();
