"use strict";
/* 22. Penals de lletres — estadi de nit, retransmissió de TV, jugadors animals 2.5D i marcador de paletes */
(() => {
  const ME = { kind: "fox", fur: "#E8803A", fur2: "#FFF4E6", shirt: "#17676B", trim: "#FFFFFF", keeper: "#F08A3C", num: "7" };
  const TEAMS = [null,
    { name: "GRANOTES", art: "les Granotes", kind: "frog", fur: "#6CBF5A", fur2: "#DDF0B0", shirt: "#F2C230", trim: "#2E7D4F", keeper: "#3FA0D8", num: "1" },
    { name: "CONILLS", art: "els Conills", kind: "rabbit", fur: "#E4DDD6", fur2: "#FFFFFF", shirt: "#EC7FA8", trim: "#FFFFFF", keeper: "#7FC8E8", num: "9" },
    { name: "ÓSSOS", art: "els Óssos", kind: "bear", fur: "#8A5A36", fur2: "#D9B48A", shirt: "#D9503A", trim: "#FFE08A", keeper: "#4FA85A", num: "4" },
    { name: "GATS", art: "els Gats", kind: "cat", fur: "#9A9AA6", fur2: "#F2F2F2", shirt: "#8E6CC8", trim: "#FFFFFF", keeper: "#F2B630", num: "5" },
    { name: "LLOPS", art: "els Llops", kind: "wolf", fur: "#7C8794", fur2: "#DCE2E8", shirt: "#33497A", trim: "#E9B934", keeper: "#E0553A", num: "8" },
    { name: "LLEONS", art: "els Lleons", kind: "lion", fur: "#E2B04A", fur2: "#FFF0C8", shirt: "#2A2A2E", trim: "#E9B934", keeper: "#5FC0B0", num: "10" },
  ];
  // posicions (vista de xut)
  const GOAL = { l: 380, r: 1220, top: 300, bot: 570 };
  const CORN = [[500, 365], [1100, 365], [500, 500], [1100, 500]];
  // vista de porter (des de darrere de la nostra porteria)
  const SPOT = [800, 446], TGT = [[330, 262], [1270, 262], [370, 640], [1230, 640]];

  /* ---------- sons ---------- */
  const snd = {
    kick() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: 140, f2: 60, d: 0.12, v: 0.4 }); noise({ f: 900, d: 0.05, v: 0.2 }); },
    post() { if (!Audio2.ctx || !Settings.sfx) return; [1180, 1770, 2650].forEach((f, i) => tone({ f, d: 0.6 - i * 0.12, type: "sine", v: 0.1 - i * 0.02, verb: true })); },
    net() { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 2400, f2: 900, d: 0.3, v: 0.15, q: 0.7 }); },
    catch() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: 120, f2: 70, d: 0.14, v: 0.35 }); noise({ f: 600, d: 0.08, v: 0.2, ft: "lowpass" }); },
    groan() { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 500, f2: 300, d: 1.0, a: 0.15, v: 0.14, q: 0.4 }); },
    flap() { if (!Audio2.ctx || !Settings.sfx) return; for (let i = 0; i < 5; i++) noise({ f: 3200, q: 3, d: 0.02, v: 0.12, delay: i * 0.05 }); },
  };

  /* ---------- jugadors animals 2.5D ---------- */
  function limb(ctx, x1, y1, x2, y2, w, col) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); }
  function ears(ctx, sp, back) {
    const f = sp.fur, d = shade(sp.fur, -0.25), inn = "#F4A6B8";
    if (sp.kind === "fox" || sp.kind === "cat" || sp.kind === "wolf") {
      const h = sp.kind === "wolf" ? 50 : sp.kind === "fox" ? 44 : 36;
      for (const s of [-1, 1]) { ctx.fillStyle = f; ctx.beginPath(); ctx.moveTo(s * 14, -196); ctx.lineTo(s * 34, -196 - h); ctx.lineTo(s * 42, -176); ctx.closePath(); ctx.fill(); if (!back) { ctx.fillStyle = sp.kind === "fox" ? "#3A2A22" : inn; ctx.beginPath(); ctx.moveTo(s * 22, -196); ctx.lineTo(s * 33, -190 - h * 0.8); ctx.lineTo(s * 37, -184); ctx.closePath(); ctx.fill(); } }
    }
    if (sp.kind === "rabbit") for (const s of [-1, 1]) { ctx.fillStyle = f; ctx.beginPath(); ctx.ellipse(s * 18, -232, 12, 40, s * 0.15, 0, 6.28); ctx.fill(); if (!back) { ctx.fillStyle = inn; ctx.beginPath(); ctx.ellipse(s * 18, -230, 6, 30, s * 0.15, 0, 6.28); ctx.fill(); } }
    if (sp.kind === "bear" || sp.kind === "lion") for (const s of [-1, 1]) { ctx.fillStyle = sp.kind === "lion" ? d : f; ctx.beginPath(); ctx.arc(s * 32, -198, 13, 0, 6.28); ctx.fill(); if (!back) { ctx.fillStyle = sp.fur2; ctx.beginPath(); ctx.arc(s * 32, -198, 6, 0, 6.28); ctx.fill(); } }
  }
  function head(ctx, sp, back, o) {
    const hy = -168;
    if (sp.kind === "lion") { ctx.fillStyle = "#B86A2A"; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28; ctx.beginPath(); ctx.arc(Math.cos(a) * 44, hy + Math.sin(a) * 44, 18, 0, 6.28); ctx.fill(); } }
    ears(ctx, sp, back);
    const g = ctx.createRadialGradient(-14, hy - 16, 4, 0, hy, 46); g.addColorStop(0, shade(sp.fur, 0.28)); g.addColorStop(1, shade(sp.fur, -0.12));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, hy, sp.kind === "frog" ? 46 : 40, 38, 0, 0, 6.28); ctx.fill();
    if (sp.kind === "frog") for (const s of [-1, 1]) { ctx.fillStyle = sp.fur; ctx.beginPath(); ctx.arc(s * 22, hy - 34, 16, 0, 6.28); ctx.fill(); if (!back) { ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(s * 22, hy - 35, 11, 0, 6.28); ctx.fill(); ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(s * 22 + (o.look || 0) * 3, hy - 34, 5.5, 0, 6.28); ctx.fill(); } }
    if (back) { const sg = ctx.createLinearGradient(0, hy - 10, 0, hy + 38); sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(1, "rgba(0,0,0,0.18)"); ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(0, hy, 40, 38, 0, 0, 6.28); ctx.fill(); ctx.strokeStyle = shade(sp.fur, -0.2); ctx.lineWidth = 3; ctx.lineCap = "round"; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 10, hy - 30); ctx.quadraticCurveTo(i * 12 + 4, hy - 22, i * 9, hy - 14); ctx.stroke(); } return; }
    // cara
    ctx.fillStyle = sp.fur2; ctx.beginPath(); ctx.ellipse(0, hy + 14, sp.kind === "frog" ? 34 : 24, sp.kind === "frog" ? 16 : 18, 0, 0, 6.28); ctx.fill();
    if (sp.kind === "fox") { ctx.beginPath(); ctx.moveTo(-40, hy); ctx.quadraticCurveTo(-20, hy + 30, 0, hy + 30); ctx.quadraticCurveTo(20, hy + 30, 40, hy); ctx.quadraticCurveTo(20, hy + 10, 0, hy + 8); ctx.quadraticCurveTo(-20, hy + 10, -40, hy); ctx.fill(); }
    if (sp.kind !== "frog") for (const s of [-1, 1]) { ctx.fillStyle = "#1E1A18"; ctx.beginPath(); ctx.ellipse(s * 15 + (o.look || 0) * 3, hy - 6, 5.5, o.blink ? 1 : 7, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(s * 15 + 2 + (o.look || 0) * 3, hy - 9, 2, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = sp.kind === "frog" ? "#2E7D4F" : "#2A1E1A"; ctx.beginPath(); ctx.ellipse(0, hy + 8, sp.kind === "frog" ? 3 : 7, sp.kind === "frog" ? 2 : 5, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#2A1E1A"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.beginPath();
    if (o.sad) ctx.arc(0, hy + 28, 9, 3.6, 5.8); else ctx.arc(0, hy + 12, sp.kind === "frog" ? 20 : 9, 0.4, 2.74);
    ctx.stroke();
    ctx.fillStyle = "rgba(240,110,120,0.35)"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 26, hy + 10, 7, 4, 0, 0, 6.28); ctx.fill(); }
    if (sp.kind === "cat" || sp.kind === "lion") { ctx.strokeStyle = "rgba(60,40,30,0.5)"; ctx.lineWidth = 1.2; for (const s of [-1, 1]) for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(s * 16, hy + 12 + i * 3); ctx.lineTo(s * 36, hy + 9 + i * 6); ctx.stroke(); } }
  }
  // pose: {back, keeper, arms:[aL,aR] (angles, 0 = avall), legs:[lL,lR], lift, rot, sad, cheer}
  function drawAnimal(ctx, sp, x, y, s, o = {}) {
    const kinds=["frog","rabbit","bear","cat","wolf","lion"];
    const idx=sp.kind==="fox"?(o.back?(o.keeper?1:0):(o.keeper?3:2)):4+kinds.indexOf(sp.kind)*2+(o.keeper?1:0);
    const im=Art.cell("penalty-actors",idx,4,4,220,280);
    if(im){
      ctx.save();ctx.translate(x,y);ctx.fillStyle="rgba(0,0,0,0.22)";ctx.beginPath();ctx.ellipse(0,2,52*s,12*s,0,0,Math.PI*2);ctx.fill();
      ctx.scale(s,s);ctx.translate(o.dx||0,-(o.lift||0));if(o.rot){ctx.translate(0,-90);ctx.rotate(o.rot);ctx.translate(0,90);}
      ctx.drawImage(im,-110,-260,220,280);ctx.restore();return;
    }
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "rgba(0,0,0,0.28)"; ctx.beginPath(); ctx.ellipse(0, 2, 52 * s * (1 - (o.lift || 0) / 400), 12 * s, 0, 0, 6.28); ctx.fill();
    ctx.scale(s, s); ctx.translate(o.dx || 0, -(o.lift || 0));
    if (o.rot) { ctx.translate(0, -90); ctx.rotate(o.rot); ctx.translate(0, 90); }
    const shirt = o.keeper ? sp.keeper : sp.shirt, trim = o.keeper ? "#FFFFFF" : sp.trim;
    const [aL, aR] = o.arms || [0.25, -0.25], [lL, lR] = o.legs || [0, 0];
    const leg = (side, a) => { const hx = side * 16, hy = -54, kx = hx + Math.sin(a) * 44, ky = hy + Math.cos(a) * 44; limb(ctx, hx, hy, kx, ky, 18, sp.fur); ctx.strokeStyle = trim; ctx.lineWidth = 19; ctx.beginPath(); ctx.moveTo(lerp(hx, kx, 0.55), lerp(hy, ky, 0.55)); ctx.lineTo(lerp(hx, kx, 0.85), lerp(hy, ky, 0.85)); ctx.stroke(); ctx.fillStyle = "#1E1E22"; ctx.beginPath(); ctx.ellipse(kx + side * 3, ky + 2, 14, 8, 0, 0, 6.28); ctx.fill(); };
    leg(-1, lL); leg(1, lR);
    ctx.fillStyle = o.keeper ? "#2A2A2E" : shade(shirt, -0.45); rr(ctx, -34, -66, 68, 26, 9); ctx.fill();
    const arm = (side, a) => {
      const sx = side * 36, sy = -118, ex = sx + Math.sin(a) * 58 * side * -1 * -1, ey = sy + Math.cos(a) * 58;
      const ax = sx + Math.sin(a) * 58, ay = sy + Math.cos(a) * 58;
      limb(ctx, sx, sy, ax, ay, 18, shirt); limb(ctx, lerp(sx, ax, 0.6), lerp(sy, ay, 0.6), ax, ay, 15, sp.fur);
      if (o.keeper) { ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(ax, ay, 15, 0, 6.28); ctx.fill(); ctx.fillStyle = sp === ME ? "#F08A3C" : "#3FA0D8"; ctx.beginPath(); ctx.arc(ax, ay, 15, 0.5, 2.6); ctx.fill(); }
      else { ctx.fillStyle = sp.fur; ctx.beginPath(); ctx.arc(ax, ay, 9, 0, 6.28); ctx.fill(); }
      return ex + ey;
    };
    const armsBehind = o.back;
    if (!armsBehind) { /* braços davant, es dibuixen després */ } else { arm(-1, aL); arm(1, aR); }
    const tg = ctx.createLinearGradient(-40, 0, 40, 0); tg.addColorStop(0, shade(shirt, -0.25)); tg.addColorStop(0.35, shade(shirt, 0.18)); tg.addColorStop(1, shade(shirt, -0.3));
    ctx.fillStyle = tg; rr(ctx, -40, -130, 80, 72, 22); ctx.fill();
    ctx.fillStyle = trim; ctx.fillRect(-40, -70, 80, 5);
    if (o.back) { ctx.font = `900 40px ${FONT_T}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = trim; ctx.fillText(o.keeper ? "1" : sp.num, 0, -96); }
    else { ctx.fillStyle = trim; ctx.beginPath(); ctx.moveTo(-12, -130); ctx.lineTo(0, -116); ctx.lineTo(12, -130); ctx.fill(); ctx.beginPath(); ctx.arc(-18, -106, 6, 0, 6.28); ctx.fill(); }
    if (!armsBehind) { arm(-1, aL); arm(1, aR); }
    head(ctx, sp, o.back, o);
    ctx.restore();
  }

  /* ---------- pilota ---------- */
  function ballSprite() {
    return Sprites.get("g22ball", 60, 60, (x) => {
      const im=Art.cell("penalty-ball",0,1,1,60,60);if(im){x.drawImage(im,0,0,60,60);return;}
      const g = x.createRadialGradient(22, 20, 3, 30, 30, 30); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.7, "#E8ECEF"); g.addColorStop(1, "#A8B0B6");
      x.fillStyle = g; x.beginPath(); x.arc(30, 30, 28, 0, 6.28); x.fill();
      x.fillStyle = "#24282C"; const pent = (cx, cy, r, a0) => { x.beginPath(); for (let i = 0; i < 5; i++) { const a = a0 + i * 1.2566; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fill(); };
      pent(30, 30, 9, -1.57); [[30, 5], [54, 22], [46, 52], [14, 52], [6, 22]].forEach(([a, b], i) => pent(a, b, 7, -1.57 + i * 1.2566 + 3.14));
      x.save(); x.beginPath(); x.arc(30, 30, 28, 0, 6.28); x.clip(); x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(20, 16, 12, 7, -0.6, 0, 6.28); x.fill(); x.restore();
    });
  }
  function drawBall(ctx, x, y, r, rot = 0, shadowY = null) {
    if (shadowY != null) { ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.beginPath(); ctx.ellipse(x, shadowY, r * 0.9, r * 0.28, 0, 0, 6.28); ctx.fill(); }
    Sprites.draw(ctx, ballSprite(), x, y, { s: r / 28, rot });
  }

  /* ---------- estadi ---------- */
  function crowd(x0c, x0, y0, w, rows, cols, R) {
    const cv = makeCanvas(W, H), x = cv.getContext("2d");
    const skins = cols.concat(["#E8803A", "#8A5A36", "#E4DDD6", "#6CBF5A", "#9A9AA6", "#E2B04A"]);
    for (let r = 0; r < rows; r++) {
      const yy = y0 + r * 15, sc = 0.7 + r / rows * 0.4;
      x.fillStyle = r % 2 ? "#1A2140" : "#20284A"; x.fillRect(x0, yy + 6 * sc, w, 15);
      for (let i = 0; i < w / 13; i++) { const px = x0 + i * 13 + (r % 2) * 6 + R() * 3; x.fillStyle = pick(cols); x.fillRect(px - 4 * sc, yy + 2, 8 * sc, 9 * sc); x.fillStyle = pick(skins); x.beginPath(); x.arc(px, yy, 4 * sc, 0, 6.28); x.fill(); }
    }
    x0c.save(); x0c.filter = "blur(1.4px)"; x0c.drawImage(cv, 0, 0); x0c.restore();
    const g = x0c.createLinearGradient(0, y0 - 10, 0, y0 + rows * 15 + 10); g.addColorStop(0, "rgba(8,12,30,0.55)"); g.addColorStop(1, "rgba(8,12,30,0.12)"); x0c.fillStyle = g; x0c.fillRect(x0, y0 - 10, w, rows * 15 + 20);
  }
  function floodlight(x, px, py) {
    x.fillStyle = "#2A3150"; x.fillRect(px - 5, py, 10, 400);
    const g = x.createRadialGradient(px, py, 4, px, py, 150); g.addColorStop(0, "rgba(255,250,220,0.75)"); g.addColorStop(0.25, "rgba(255,240,190,0.25)"); g.addColorStop(1, "rgba(255,240,190,0)");
    x.fillStyle = g; x.fillRect(px - 150, py - 150, 300, 300);
    x.fillStyle = "#3A4266"; rr(x, px - 46, py - 22, 92, 40, 6); x.fill();
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { x.fillStyle = "#FFF8DA"; x.beginPath(); x.arc(px - 33 + i * 22, py - 10 + j * 18, 7, 0, 6.28); x.fill(); }
  }
  function grass(x, y0, stripes) {
    for (let k = 0; k < stripes; k++) { const a = y0 + (H - y0) * Math.pow(k / stripes, 1.5), b = y0 + (H - y0) * Math.pow((k + 1) / stripes, 1.5); x.fillStyle = k % 2 ? "#3F9446" : "#4AA350"; x.fillRect(0, a, W, b - a + 1); }
    x.save(); x.globalCompositeOperation = "overlay"; x.globalAlpha = 0.25; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#888888", { seed: 31, plush: true }), "repeat"); x.fillRect(0, y0, W, H - y0); x.restore();
  }
  function adBoards(x, y, h, team) {
    const cols = ["#17676B", team.shirt, "#E0553A", "#203E42", "#F2B630"];
    for (let i = 0; i < 8; i++) { x.fillStyle = cols[i % cols.length]; x.fillRect(i * 200, y, 200, h); x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(i * 200, y, 200, h * 0.4); text(x, ["LECAA Tecla", "Bon joc!", "LECAA Tecla", "Fair play"][i % 4], i * 200 + 100, y + h / 2, { size: h * 0.55, weight: 900, font: FONT_T, color: "#FFFFFF" }); }
  }
  function bgShoot(team) {
    return Sprites.get("g22shoot" + team.name, W, H, (x) => {
      if(Art.get("penalty-bg")){x.drawImage(Art.get("penalty-bg"),0,0,W,H);return;}
      const R = mulberry32(7);
      const sky = x.createLinearGradient(0, 0, 0, 240); sky.addColorStop(0, "#081028"); sky.addColorStop(1, "#1C2752"); x.fillStyle = sky; x.fillRect(0, 0, W, 360);
      x.fillStyle = "#121A36"; x.beginPath(); x.moveTo(0, 150); x.lineTo(W, 150); x.lineTo(W, 330); x.lineTo(0, 330); x.fill();
      crowd(x, 0, 160, W, 11, ["#17676B", "#17676B", team.shirt, team.shirt, "#FFFFFF"], R);
      x.fillStyle = "#0C1228"; x.fillRect(0, 140, W, 14);
      [120, 520, 1080, 1480].forEach(px => floodlight(x, px, 64));
      adBoards(x, 330, 32, team);
      grass(x, 362, 12);
      // línies del camp en perspectiva
      x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 4;
      x.beginPath(); x.moveTo(0, GOAL.bot); x.lineTo(W, GOAL.bot); x.stroke();
      x.beginPath(); x.moveTo(300, GOAL.bot); x.lineTo(250, 610); x.lineTo(1350, 610); x.lineTo(1300, GOAL.bot); x.stroke();
      x.lineWidth = 5; x.beginPath(); x.moveTo(80, GOAL.bot); x.lineTo(-40, 780); x.moveTo(1520, GOAL.bot); x.lineTo(1640, 780); x.stroke();
      x.beginPath(); x.ellipse(800, 790, 14, 6, 0, 0, 6.28); x.fillStyle = "#FFFFFF"; x.fill();
      x.lineWidth = 5; x.beginPath(); x.ellipse(800, 760, 250, 60, 0, 0.35, Math.PI - 0.35, true); x.stroke();
      // ombres de la porteria a la gespa
      x.fillStyle = "rgba(0,0,0,0.18)"; x.beginPath(); x.moveTo(GOAL.l, GOAL.bot); x.lineTo(GOAL.l - 60, GOAL.bot + 30); x.lineTo(GOAL.r + 60, GOAL.bot + 30); x.lineTo(GOAL.r, GOAL.bot); x.fill();
      // xarxa (fons i laterals)
      const bl = 474, br = 1126, bt = 270;
      x.fillStyle = "rgba(220,230,240,0.06)"; x.beginPath(); x.moveTo(GOAL.l, GOAL.top); x.lineTo(bl, bt); x.lineTo(br, bt); x.lineTo(GOAL.r, GOAL.top); x.lineTo(GOAL.r, GOAL.bot); x.lineTo(br, 512); x.lineTo(bl, 512); x.lineTo(GOAL.l, GOAL.bot); x.fill();
      x.strokeStyle = "rgba(235,240,245,0.42)"; x.lineWidth = 1.4;
      for (let i = 0; i <= 26; i++) { const px = lerp(bl, br, i / 26); x.beginPath(); x.moveTo(px, bt); x.lineTo(px, 512); x.stroke(); }
      for (let j = 0; j <= 10; j++) { const py = lerp(bt, 512, j / 10); x.beginPath(); x.moveTo(bl, py); x.lineTo(br, py); x.stroke(); }
      for (let i = 0; i <= 6; i++) { const k = i / 6; for (const [ax, bx2] of [[GOAL.l, bl], [GOAL.r, br]]) { x.beginPath(); x.moveTo(lerp(ax, bx2, k), lerp(GOAL.top, bt, k)); x.lineTo(lerp(ax, bx2, k), lerp(GOAL.bot, 512, k)); x.stroke(); } }
      for (let j = 0; j <= 10; j++) for (const [ax, bx2] of [[GOAL.l, bl], [GOAL.r, br]]) { x.beginPath(); x.moveTo(ax, lerp(GOAL.top, GOAL.bot, j / 10)); x.lineTo(bx2, lerp(bt, 512, j / 10)); x.stroke(); }
      for (let i = 0; i <= 26; i++) { x.beginPath(); x.moveTo(lerp(GOAL.l, GOAL.r, i / 26), GOAL.top); x.lineTo(lerp(bl, br, i / 26), bt); x.stroke(); }
      drawVignette(x, 0.35, "0,0,20");
    });
  }
  function posts(ctx) {
    if(Art.get("penalty-bg"))return;
    const pg = (x0) => { const g = ctx.createLinearGradient(x0 - 11, 0, x0 + 11, 0); g.addColorStop(0, "#B8C0C8"); g.addColorStop(0.4, "#FFFFFF"); g.addColorStop(1, "#9AA2AA"); return g; };
    ctx.fillStyle = pg(GOAL.l); ctx.fillRect(GOAL.l - 11, GOAL.top - 10, 22, GOAL.bot - GOAL.top + 10);
    ctx.fillStyle = pg(GOAL.r); ctx.fillRect(GOAL.r - 11, GOAL.top - 10, 22, GOAL.bot - GOAL.top + 10);
    const g = ctx.createLinearGradient(0, GOAL.top - 11, 0, GOAL.top + 11); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#A8B0B8"); ctx.fillStyle = g; ctx.fillRect(GOAL.l - 11, GOAL.top - 11, GOAL.r - GOAL.l + 22, 22);
  }
  function bgSave(team) {
    return Sprites.get("g22save" + team.name, W, H, (x) => {
      if(Art.get("penalty-save-bg")){x.drawImage(Art.get("penalty-save-bg"),0,0,W,H);return;}
      const R = mulberry32(9);
      const sky = x.createLinearGradient(0, 0, 0, 150); sky.addColorStop(0, "#081028"); sky.addColorStop(1, "#1C2752"); x.fillStyle = sky; x.fillRect(0, 0, W, 330);
      x.fillStyle = "#121A36"; x.fillRect(0, 120, W, 200);
      crowd(x, 0, 140, W, 11, [team.shirt, team.shirt, "#17676B", "#FFFFFF"], R);
      x.fillStyle = "#0C1228"; x.fillRect(0, 112, W, 12);
      [300, 1300].forEach(px => floodlight(x, px, 50));
      adBoards(x, 300, 26, team);
      grass(x, 326, 14);
      x.strokeStyle = "rgba(255,255,255,0.85)"; x.lineWidth = 3;
      x.beginPath(); x.moveTo(-200, 900); x.lineTo(380, 380); x.lineTo(1220, 380); x.lineTo(1800, 900); x.stroke();
      x.beginPath(); x.ellipse(800, 372, 160, 26, 0, Math.PI + 0.3, -0.3); x.stroke();
      x.fillStyle = "#FFFFFF"; x.beginPath(); x.ellipse(SPOT[0], SPOT[1] + 6, 10, 4, 0, 0, 6.28); x.fill();
      x.lineWidth = 6; x.beginPath(); x.moveTo(-100, 860); x.lineTo(1700, 860); x.stroke();
      drawVignette(x, 0.3, "0,0,20");
    });
  }
  // xarxa i marc en primer pla (vista de porter), amb bombament
  function nearGoal(ctx, bulge) {
    ctx.save(); ctx.strokeStyle = "rgba(240,245,250,0.17)"; ctx.lineWidth = 2;
    const off = (px, py) => { if (!bulge || bulge.a <= 0) return [px, py]; const dx = px - bulge.x, dy = py - bulge.y, d = Math.hypot(dx, dy), k = Math.max(0, 1 - d / 260) * bulge.a; return [px + dx * k * 0.35, py + dy * k * 0.35 + k * 18]; };
    for (let i = 0; i <= 26; i++) { const px = lerp(150, 1450, i / 26); ctx.beginPath(); for (let j = 0; j <= 20; j++) { const [a, b] = off(px, lerp(134, 900, j / 20)); j ? ctx.lineTo(a, b) : ctx.moveTo(a, b); } ctx.stroke(); }
    for (let j = 0; j <= 15; j++) { const py = lerp(134, 900, j / 15); ctx.beginPath(); for (let i = 0; i <= 26; i++) { const [a, b] = off(lerp(150, 1450, i / 26), py); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); } ctx.stroke(); }
    ctx.restore();
    const pg = (x0) => { const g = ctx.createLinearGradient(x0 - 24, 0, x0 + 24, 0); g.addColorStop(0, "#9AA2AA"); g.addColorStop(0.45, "#FFFFFF"); g.addColorStop(1, "#8A929A"); return g; };
    ctx.fillStyle = pg(136); ctx.fillRect(112, 104, 48, 800); ctx.fillStyle = pg(1464); ctx.fillRect(1440, 104, 48, 800);
    const g = ctx.createLinearGradient(0, 100, 0, 146); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#9AA2AA"); ctx.fillStyle = g; ctx.fillRect(112, 104, 1376, 40);
  }

  /* ---------- marcador de paletes ---------- */
  function flapCell(ctx, cx, cy, w, h, val, prev, k) {
    const draw = (v, clipTop) => { ctx.save(); ctx.beginPath(); if (clipTop) ctx.rect(cx - w / 2, cy - h / 2, w, h / 2); else ctx.rect(cx - w / 2, cy, w, h / 2); ctx.clip(); rr(ctx, cx - w / 2, cy - h / 2, w, h, 8); const g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, "#2A3036"); g.addColorStop(0.5, "#1A1E22"); g.addColorStop(0.5, "#22272C"); g.addColorStop(1, "#14171A"); ctx.fillStyle = g; ctx.fill(); text(ctx, String(v), cx, cy + 2, { size: h * 0.78, weight: 900, font: FONT_T, color: "#FFF3CF" }); ctx.restore(); };
    if (k >= 1 || prev === val) { draw(val, true); draw(val, false); }
    else {
      draw(val, true); draw(prev, false);
      if (k < 0.5) { const s = 1 - k * 2; ctx.save(); ctx.translate(0, cy); ctx.scale(1, s); ctx.translate(0, -cy); draw(prev, true); ctx.restore(); }
      else { const s = (k - 0.5) * 2; ctx.save(); ctx.translate(0, cy); ctx.scale(1, s); ctx.translate(0, -cy); draw(val, false); ctx.restore(); }
    }
    ctx.fillStyle = "#0A0C0E"; ctx.fillRect(cx - w / 2, cy - 1.5, w, 3);
  }

  /* ---------- miniatura ---------- */
  function thumb(ctx, x, y, w, h, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#0B1430"); sky.addColorStop(0.45, "#1E2A55"); sky.addColorStop(0.45, "#3F9446"); sky.addColorStop(1, "#4AA350"); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const sc = Math.min(Math.max(w / 300, h / 180), h / 170); ctx.translate(w / 2, h * 0.5); ctx.scale(sc, sc);
    for (const px of [-140, 140]) { const g = ctx.createRadialGradient(px, -70, 2, px, -70, 60); g.addColorStop(0, "rgba(255,250,220,0.9)"); g.addColorStop(1, "rgba(255,250,220,0)"); ctx.fillStyle = g; ctx.fillRect(px - 60, -130, 120, 120); }
    ctx.fillStyle = "#4AA350"; for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? "#3F9446" : "#4AA350"; ctx.fillRect(-300, i * 24, 600, 24); }
    ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1; for (let i = 0; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(-110 + i * 18.3, -50); ctx.lineTo(-110 + i * 18.3, 22); ctx.stroke(); } for (let j = 0; j <= 4; j++) { ctx.beginPath(); ctx.moveTo(-110, -50 + j * 18); ctx.lineTo(110, -50 + j * 18); ctx.stroke(); }
    ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-124, -62, 10, 88); ctx.fillRect(114, -62, 10, 88); ctx.fillRect(-124, -66, 248, 10);
    drawAnimal(ctx, TEAMS[1], 40 + Math.sin(t * 2) * 6, 26, 0.36, { keeper: true, arms: [2.2, -2.2], legs: [-0.3, 0.3] });
    const bt = (t * 0.6) % 1, bx = lerp(0, -70, bt), by = lerp(70, -26, bt) - Math.sin(bt * Math.PI) * 30;
    drawBall(ctx, bx, by, lerp(16, 9, bt));
    drawPlate(ctx, "k", -70, -6 - 40, { size: 44, shadowBlur: 6, alpha: 1 });
    ctx.restore();
  }

  Games.register({
    id: 22, key: "k", name: "Penals de lletres", zone: "poble", music: "stadium", demoTime: 12, captionY: 150,
    collect: { one: "cromo de futbol", many: "cromos de futbol" },
    goal: l => l <= 3 ? "Escriu una cantonada lliure per xutar i la lletra de la pilota per parar-la. Guanya la tanda de 5 penals!"
      : l === 4 ? "Escriu la síl·laba d'una cantonada lliure per xutar i la de la pilota per parar-la. Guanya la tanda!"
        : "Escriu la paraula d'una cantonada lliure per xutar i la de la pilota per parar-la. Guanya la tanda!",
    thumb,
    create(api) {
      const L = api.level, team = TEAMS[L];
      const pool = api.pool({ theme: "animals", filter: L >= 5 ? (w => w.length <= (L === 5 ? 6 : 10) && !w.includes(" ")) : null });
      const psz = L <= 3 ? 64 : L === 4 ? 56 : 44;
      const ours = [], theirs = [];
      let kick = -1, turn = "shoot", phase = "intro", pt = 0, t = 0, slow = 1, slowT = 0, started = api.demo;
      let corners = [], covered = 0, switchT = 0, shot = null, ball = null, banner = null, bulge = null, cheer = 0, ended = false;
      const flap = { a: 0, b: 0, pa: 0, pb: 0, ka: 1, kb: 1 };
      const kp = { x: 800, dive: 0, dir: 0, up: 0, sad: false, cheer: 0 };    // porter rival (vista de xut)
      const me = { dive: 0, tx: 0, ty: 0, wrong: false, ready: 0 };            // el nostre porter (vista de porter)
      const sh = { k: 0 };                                                       // el nostre xutador
      const rival = { k: 0 };                                                    // xutador rival
      const typer = api.typer({
        targets: () => turn === "shoot" ? (phase === "aim" ? corners.filter(c => !c.cov) : []) : ((phase === "runup" || phase === "flight") && ball && !ball.res ? [ball] : []),
        rank: c => c.i || 0,
        onLock: () => { if (turn === "save") me.ready = 1; },
        onDone: c => { if (turn === "shoot") doShot(c, "goal"); else saveDone(); },
        onMiss: (c, k) => {
          if (typer.lock) return; // dins d'una paraula: es pot continuar
          if (turn === "shoot") { const cv = corners[covered]; if (cv && k === cv.text[0]) doShot(cv, "saved"); else doShot(null, "post"); }
          else saveFail();
        },
      });
      const tempo = () => (api.demo ? 1.6 : 1);
      function nextKick() {
        kick++; turn = kick % 2 === 0 ? "shoot" : "save"; phase = "intro"; pt = 0; banner = null; bulge = null; shot = null;
        kp.dive = 0; kp.dir = 0; kp.sad = false; kp.cheer = 0; me.dive = 0; me.wrong = false; me.ready = 0; sh.k = 0; rival.k = 0; typer.release();
        if (turn === "shoot") {
          const items = pool.many(4); corners = items.map((text, i) => ({ text, i, cov: false, typed: 0 }));
          covered = randi(0, 3); corners[covered].cov = true; kp.x = covered % 2 ? 960 : 640; kp.up = covered < 2 ? 1 : 0; switchT = 0;
        } else {
          const text = pool.next(); const tgt = randi(0, 3);
          ball = { text, i: 0, typed: 0, tgt, res: null, k: 0 };
          ball.dur = (L <= 3 ? [0, 5.2, 4.8, 4.3][L] : L === 4 ? 5.2 : 2.6 + text.length * (L === 5 ? 0.85 : 0.75)) / api.speed / tempo();
        }
        Sfx.play("whistle");
      }
      function doShot(c, res) {
        if (phase !== "aim") return;
        phase = "kick"; pt = 0; shot = { c, res, from: [800, 790], to: c ? CORN[c.i] : (Math.random() < 0.5 ? [GOAL.l + 4, 300] : [GOAL.r - 4, 300]) };
        if (res === "goal") { kp.dir = (CORN[c.i][0] < 800) ? 1 : -1; } else if (res === "saved") kp.dir = CORN[c.i][0] < 800 ? -1 : 1; else kp.dir = shot.to[0] < 800 ? -1 : 1;
        if (res === "saved") kp.dir = CORN[c.i][0] < kp.x ? -1 : 1;
      }
      function saveDone() { ball.res = "saved"; me.ready = 1; if (phase === "runup") rival.fast = true; }
      function saveFail() { ball.res = "goal"; me.wrong = true; if (phase === "runup") rival.fast = true; }
      function resolve(res) {
        phase = "result"; pt = 0;
        if (turn === "shoot") {
          const goal = res === "goal"; ours.push(goal); if (goal) { flap.pa = flap.a; flap.a++; flap.ka = 0; snd.flap(); }
          banner = goal ? { t: "GOL!", c: UI.ok } : res === "saved" ? { t: "L'ha parada!", c: BRAND.tinta } : { t: "Al pal!", c: BRAND.tinta };
          if (goal) { Sfx.play("crowd"); cheer = 1.6; void 0; api.particles.emit(shot.to[0], shot.to[1], { count: 30, color: ["#17676B", "#FFFFFF", "#F2B630"], speed: 420, gravity: 500, size: 13, life: 1.4, shape: "confetti" }); }
          else { snd.groan(); void 0; }
        } else {
          const saved = res === "saved"; theirs.push(!saved); if (!saved) { flap.pb = flap.b; flap.b++; flap.kb = 0; snd.flap(); }
          banner = saved ? { t: "Quina parada!", c: UI.ok } : { t: "Gol de " + team.art, c: BRAND.tinta };
          if (saved) { Sfx.play("crowd"); cheer = 1.6; void 0; api.particles.emit(me.tx || 800, me.ty || 500, { count: 30, color: ["#17676B", "#FFFFFF", "#F08A3C"], speed: 420, gravity: 500, size: 13, life: 1.4, shape: "confetti" }); }
          else { snd.groan(); }
        }
      }
      function checkEnd() {
        const rounds = theirs.length, a = flap.a, b = flap.b;
        if (ours.length === theirs.length && rounds >= 5 && (a !== b || rounds >= 8)) return a >= b ? "win" : "lose";
        if (ours.length === theirs.length && rounds === 5 && a === b) void 0;
        return null;
      }
      nextKick();
      return {
        start() { started = true; },
        expected() { if (turn === "shoot") return phase === "aim" ? typer.expected() : null; return (phase === "runup" || phase === "flight") && ball && !ball.res ? typer.expected() : null; },
        onKey(k) { if (k.length !== 1) return; if (!this.expected()) return; typer.key(k); },
        update(dt0) {
          slowT = Math.max(0, slowT - dt0); slow = slowT > 0 ? 0.35 : lerp(slow, 1, 0.1);
          const dt = dt0 * slow * tempo(); pt += dt; t += dt0;
          flap.ka = Math.min(1, flap.ka + dt0 * 2.6); flap.kb = Math.min(1, flap.kb + dt0 * 2.6);
          cheer = Math.max(0, cheer - dt0);
          if (bulge) bulge.a = Math.max(0, bulge.a - dt0 * 1.2);
          if (!started) pt = 0;
          if (phase === "intro" && pt > (api.demo ? 0.6 : 1.1)) { phase = turn === "shoot" ? "aim" : "runup"; pt = 0; if (turn === "shoot") api.say(L <= 3 ? "Tria una cantonada lliure!" : "Xuta! Escriu una cantonada lliure."); }
          if (turn === "shoot") {
            if (phase === "aim" && L >= 5 && !typer.lock) { switchT += dt; if (switchT > (L === 5 ? 4.5 : 3.5)) { switchT = 0; corners[covered].cov = false; let n; do { n = randi(0, 3); } while (n === covered); covered = n; corners[n].cov = true; kp.x = n % 2 ? 960 : 640; kp.up = n < 2 ? 1 : 0; Sfx.play("tick"); } }
            kp.xs = lerp(kp.xs || kp.x, kp.x, clamp(dt * 5, 0, 1));
            if (phase === "kick") {
              sh.k = clamp(pt / 0.45, 0, 1);
              if (pt > 0.45 && !shot.kicked) { shot.kicked = true; snd.kick(); }
              const f = clamp((pt - 0.45) / 0.55, 0, 1); shot.f = f; kp.dive = Ease.outCubic(clamp((pt - 0.5) / 0.45, 0, 1));
              if (f >= 1 && !shot.hit) {
                shot.hit = true;
                if (shot.res === "goal") { snd.net(); bulge = { x: shot.to[0], y: shot.to[1], a: 1 }; }
                else if (shot.res === "post") { snd.post(); api.shake(4); }
                else snd.catch();
                resolve(shot.res);
              }
            }
          } else {
            if (phase === "runup") {
              rival.k = Math.min(1, rival.k + dt / (rival.fast ? 0.55 : ball.dur) * (rival.fast ? 1 : 1));
              if (rival.fast) rival.k = Math.min(1, rival.k + dt * 1.6);
              if (rival.k >= 1) { phase = "flight"; pt = 0; snd.kick(); }
            }
            if (phase === "flight") {
              const fd = 0.65; ball.k = clamp(pt / fd, 0, 1);
              const T = TGT[ball.tgt];
              if (ball.res === "saved") { me.tx = T[0]; me.ty = T[1]; me.dive = Ease.outCubic(clamp(pt / (fd * 0.9), 0, 1)); if (ball.k > 0.55 && !ball.slowed) { ball.slowed = true; slowT = 0.8; } }
              else if (me.wrong || ball.k > 0.5) { const wt = TGT[(ball.tgt + 1) % 2 + (ball.tgt >= 2 ? 2 : 0)]; me.tx = me.wrong ? wt[0] : T[0]; me.ty = me.wrong ? wt[1] : T[1]; me.dive = Ease.outCubic(clamp(pt / fd, 0, 1)) * (me.wrong ? 1 : 0.55); }
              if (ball.k >= 1) {
                if (!ball.res) ball.res = "goal";
                if (ball.res === "saved") snd.catch(); else { snd.net(); bulge = { x: T[0], y: T[1], a: 1 }; }
                resolve(ball.res);
              }
            }
          }
          if (phase === "result" && pt > (api.demo ? 1.2 : 2.0) && !ended) {
            if (turn === "save") {
              const e = checkEnd();
              if (e) { ended = true; phase = "final"; pt = 0; const win = e === "win"; banner = { t: win ? "Heu guanyat la tanda!" : "Han guanyat " + team.art, c: win ? UI.ok : BRAND.tinta }; if (win) { Sfx.play("crowd"); cheer = 3; } api.say(win ? "Heu guanyat el partit!" : "Aquesta vegada han guanyat " + team.art + "."); return; }
            }
            nextKick();
          }
          if (phase === "final") {
            if (banner.c === UI.ok && Math.random() < 0.5 && pt < 2.5) api.particles.emit(rand(100, 1500), -10, { count: 2, color: ["#17676B", "#FFFFFF", "#F2B630", "#E0553A"], speed: 120, gravity: 260, size: 14, life: 2.2, shape: "confetti", drag: 0.97 });
            if (pt > 3 && !this.done) { this.done = true; const win = flap.a > flap.b || (flap.a === flap.b); api.finish(win, win ? { collectName: L === 6 ? "la copa de la lliga" : "el cromo de " + team.art } : {}); }
          }
        },
        drawShoot(ctx) {
          ctx.drawImage(bgShoot(team).c, 0, 0, W, H);
          // xarxa bombada on entra la pilota
          if (bulge && bulge.a > 0) { ctx.save(); const g = ctx.createRadialGradient(bulge.x, bulge.y, 4, bulge.x, bulge.y, 120 * bulge.a + 20); g.addColorStop(0, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bulge.x, bulge.y, 140, 0, 6.28); ctx.fill(); ctx.strokeStyle = `rgba(240,245,250,${0.6 * bulge.a})`; ctx.lineWidth = 2; for (let r = 20; r < 120; r += 22) { ctx.beginPath(); ctx.ellipse(bulge.x, bulge.y, r * (1 + bulge.a * 0.2), r * 0.8, 0, 0, 6.28); ctx.stroke(); } ctx.restore(); }
          // porter rival
          const kx = kp.xs || kp.x, dv = kp.dive, dir = kp.dir || (kx < 800 ? -1 : 1);
          const up = kp.up;
          const arms = dv > 0 ? [dir < 0 ? 2.9 : 2.0, dir < 0 ? -2.0 : -2.9] : up ? [2.5 + Math.sin(t * 3) * 0.08, -2.5 - Math.sin(t * 3) * 0.08] : [1.2 + Math.sin(t * 3) * 0.1, -1.2 - Math.sin(t * 3) * 0.1];
          const sad = phase === "result" && shot && shot.res === "goal";
          drawAnimal(ctx, team, kx + dir * dv * 190, 570 - (up ? 0 : -6), 1.12, { keeper: true, arms, legs: dv > 0 ? [-0.5 * dir, 0.6 * dir] : [-0.35, 0.35], rot: dir * dv * 1.15, lift: dv * (kp.up ? 80 : 20) + (phase === "aim" ? Math.abs(Math.sin(t * 4)) * 4 : 0), sad, look: dir * dv, blink: Math.sin(t * 1.3) > 0.97 });
          posts(ctx);
          // pilota
          let bx = 800, by = 790, br = 26, brot = 0;
          if (shot && shot.kicked) {
            const f = Ease.outQuad(clamp(shot.f || 0, 0, 1)); bx = lerp(shot.from[0], shot.to[0], f); by = lerp(shot.from[1], shot.to[1], f) - Math.sin(f * Math.PI) * 80; br = lerp(26, 13, f); brot = f * 8;
            if (shot.hit) { const p = clamp(pt / 0.8, 0, 1); if (shot.res === "post") { bx = shot.to[0] + (shot.to[0] < 800 ? -1 : 1) * p * 300; by = shot.to[1] + p * p * 500 - p * 120; br = 13 + p * 8; } else if (shot.res === "saved") { bx = shot.to[0] + (800 - shot.to[0]) * p * 0.4; by = shot.to[1] + p * 220; br = 13 + p * 6; } else { by = shot.to[1] + p * 60; } brot = 8 + p * 6; }
          }
          drawBall(ctx, bx, by, br, brot, shot && shot.kicked && !shot.hit ? lerp(805, GOAL.bot, Ease.outQuad(shot.f || 0)) : by + br * 0.9);
          // el nostre xutador (d'esquena)
          const sk = sh.k, kickLeg = sk > 0.7 ? -1.1 : sk * 0.6;
          drawAnimal(ctx, ME, lerp(660, 742, Ease.inOutQuad(sk)), lerp(850, 835, sk), 1.6, { back: true, arms: [0.5 + sk * 0.6, -0.5 - sk * 0.3], legs: [0.1, kickLeg], lift: phase === "result" && shot && shot.res === "goal" ? Math.abs(Math.sin(pt * 9)) * 18 : 0 });
          // plaques de les cantonades
          if (phase === "aim" || phase === "intro" || (phase === "kick" && pt < 0.45)) {
            const a = phase === "intro" ? clamp(pt * 3, 0, 1) : phase === "kick" ? 1 - pt / 0.45 : 1;
            corners.forEach(c => { const [px, py] = CORN[c.i], lock = typer.lock === c; drawPlate(ctx, c.text, px, py, { size: psz, progress: lock ? c.typed : 0, state: c.cov ? "bad" : lock ? "active" : null, alpha: a * (c.cov ? 0.82 : 1), border: c.cov || lock ? null : "#17676B", borderW: 4 }); });
            const cv = corners[covered]; if (cv && a > 0.2) { const [px, py] = CORN[cv.i], pw = plateSize(ctx, cv.text, psz).w; ctx.save(); ctx.globalAlpha = a; ctx.translate(px + pw / 2 + 4, py - 40); ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.28); ctx.fill(); ctx.fillStyle = team.keeper; ctx.beginPath(); ctx.arc(0, 0, 20, 0.5, 2.6); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0, 6.28); ctx.stroke(); ctx.restore(); }
          }
          if (shot && shot.c && phase === "kick" && pt >= 0.45 && !shot.hit) drawPlate(ctx, shot.c.text, CORN[shot.c.i][0], CORN[shot.c.i][1] - 70, { size: psz, state: shot.res === "goal" ? "ok" : null, alpha: 0.9 });
        },
        drawSave(ctx) {
          ctx.drawImage(bgSave(team).c, 0, 0, W, H);
          // xutador rival, petit, al punt de penal
          const rk = rival.k, kicked = phase === "flight" || (phase === "result");
          const rx = lerp(900, 828, Ease.inOutQuad(rk)), ry = lerp(400, SPOT[1] - 2, rk);
          drawAnimal(ctx, team, rx, ry, 0.46, { arms: [0.5 + rk * 0.4, -0.5 - rk * 0.4], legs: [Math.sin(rk * 18) * 0.5 * (1 - (kicked ? 1 : 0)), kicked ? -1.0 : -Math.sin(rk * 18) * 0.5], lift: phase === "result" && ball.res === "goal" ? Math.abs(Math.sin(pt * 9)) * 30 : 0, sad: phase === "result" && ball.res === "saved" });
          // pilota
          let bx = SPOT[0], by = SPOT[1], br = 11, brot = 0;
          const T = TGT[ball.tgt];
          if (phase === "flight" || phase === "result" || phase === "final") {
            const k = phase === "flight" ? ball.k : 1;
            bx = lerp(SPOT[0], T[0], k); by = lerp(SPOT[1], T[1], k) - Math.sin(k * Math.PI) * 60; br = lerp(11, ball.res === "saved" ? 40 : 58, k * k); brot = k * 10;
            if (phase !== "flight" && ball.res === "saved") { const p = clamp(pt / 0.6, 0, 1); bx = lerp(T[0], 800, p * 0.5); by = lerp(T[1], 760, p); }
          }
          // el nostre porter (d'esquena, gran)
          const dv = me.dive, tx = me.tx || 800, ty = me.ty || 500, dir = tx < 800 ? -1 : 1, isUp = ty < 450;
          const kp2 = { back: true, keeper: true, arms: dv > 0.05 ? (dir < 0 ? [2.9, 2.3] : [-2.3, -2.9]) : me.ready ? [2.2, -2.2] : [1.3 + Math.sin(t * 3) * 0.1, -1.3 - Math.sin(t * 3) * 0.1], legs: dv > 0.05 ? [-0.4 * dir, 0.5 * dir] : [-0.4, 0.4], rot: dir * dv * (isUp ? 1.0 : 1.35), lift: dv * (isUp ? 230 : 60) + (phase === "runup" ? Math.abs(Math.sin(t * 5)) * 5 : 0), dx: dir * dv * (Math.abs(tx - 800) * 0.75) / 1.45 };
          // Càmera darrere del porter: la seva silueta oculta la pilota.
          drawBall(ctx, bx, by, br, brot);
          drawAnimal(ctx, ME, 800, 880, 1.45, kp2);
          nearGoal(ctx, bulge);
          // placa de la pilota
          if ((phase === "intro" || phase === "runup" || (phase === "flight" && ball.k < 0.8)) && ball) {
            const a = phase === "intro" ? clamp(pt * 3, 0, 1) : phase === "flight" ? 1 - ball.k / 0.8 : 1;
            const px = phase === "flight" ? bx : SPOT[0], py = (phase === "flight" ? by - br : SPOT[1]) - 76;
            drawPlate(ctx, ball.text, px, py, { size: psz, progress: ball.typed, state: ball.res === "saved" ? "ok" : ball.res === "goal" ? "wrong" : typer.lock === ball ? "active" : null, alpha: a, border: typer.lock === ball || ball.res ? null : "#17676B", borderW: 4 });
            // temps: punts de la carrera del xutador
            if (phase === "runup" && !ball.res) { const n = 5, done = Math.floor(rival.k * n); for (let i = 0; i < n; i++) { ctx.fillStyle = i < done ? "rgba(255,255,255,0.35)" : "#FFFFFF"; ctx.beginPath(); ctx.arc(SPOT[0] - 48 + i * 24, py + 66, 7, 0, 6.28); ctx.fill(); } }
          }
        },
        drawHUD(ctx) { },
        draw(ctx) {
          ctx.save(); if (cheer > 0) ctx.translate(0, -Math.abs(Math.sin(cheer * 14)) * 2 * Math.min(1, cheer));
          if (turn === "shoot") this.drawShoot(ctx); else this.drawSave(ctx);
          ctx.restore();
          // marcador de paletes
          ctx.save(); const bx = 800, by = 56;
          ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; rr(ctx, bx - 270, by - 40, 540, 84, 14); ctx.fillStyle = "#30363C"; ctx.fill(); ctx.restore();
          ctx.save(); rr(ctx, bx - 266, by - 36, 532, 76, 11); ctx.fillStyle = "#1C2024"; ctx.fill();
          text(ctx, "TECLA", bx - 160, by - 12, { size: 22, weight: 900, font: FONT_T, color: "#9FE3CC" }); text(ctx, team.name, bx + 160, by - 12, { size: 22, weight: 900, font: FONT_T, color: shade(team.shirt === "#2A2A2E" ? "#E9B934" : team.shirt, 0.3) });
          flapCell(ctx, bx - 38, by + 2, 56, 66, flap.a, flap.pa, flap.ka); flapCell(ctx, bx + 38, by + 2, 56, 66, flap.b, flap.pb, flap.kb);
          const dots = (arr, x0) => { const s0 = Math.max(0, arr.length - 5); for (let i = 0; i < 5; i++) { const v = arr[s0 + i]; ctx.beginPath(); ctx.arc(x0 + i * 22, by + 20, 7.5, 0, 6.28); ctx.fillStyle = v === undefined ? "#3A4046" : v ? "#3FD3A0" : "#E0553A"; ctx.fill(); } };
          dots(ours, bx - 204); dots(theirs, bx + 116);
          ctx.restore();
          // rètol de retransmissió (a baix a l'esquerra)
          const label = turn === "shoot" ? "Xutes tu" : "Ets el porter", n = Math.min(Math.floor(kick / 2) + 1, 99);
          ctx.save(); const ly = 836; rr(ctx, 24, ly - 30, 380, 60, 12); ctx.fillStyle = "rgba(20,30,40,0.88)"; ctx.fill(); ctx.fillStyle = turn === "shoot" ? "#17676B" : "#F08A3C"; rr(ctx, 24, ly - 30, 14, 60, 6); ctx.fill();
          text(ctx, `Penal ${n}${n <= 5 ? " de 5" : ""}`, 56, ly - 9, { size: 18, weight: 800, font: FONT_T, color: "#B8C8CC", align: "left" });
          text(ctx, label, 56, ly + 13, { size: 24, weight: 900, font: FONT_T, color: "#FFFFFF", align: "left" }); ctx.restore();
          ctx.save(); rr(ctx, W - 196, 30, 172, 40, 20); ctx.fillStyle = "rgba(20,30,40,0.8)"; ctx.fill(); ctx.fillStyle = "#E0553A"; ctx.beginPath(); ctx.arc(W - 172, 50, 7, 0, 6.28); ctx.fill(); text(ctx, "EN DIRECTE", W - 100, 51, { size: 18, weight: 900, font: FONT_T, color: "#FFFFFF" }); ctx.restore();
          // titular de la jugada
          if (phase === "intro" && started) { const k = Ease.outBack(clamp(pt / 0.35, 0, 1)); ctx.save(); ctx.globalAlpha = clamp((1.1 - pt) * 4, 0, 1); ctx.translate(800, 620); ctx.scale(k, k); drawPanel(ctx, -240, -46, 480, 92, { r: 46, blur: 18, border: turn === "shoot" ? "#17676B" : "#F08A3C" }); text(ctx, turn === "shoot" ? "Xutes tu!" : "Ets el porter!", 0, 2, { size: 46, weight: 900, font: FONT_T, color: BRAND.tinta }); ctx.restore(); }
          if (banner && (phase === "result" || phase === "final")) { const k = Ease.outBack(clamp(pt / 0.35, 0, 1)); ctx.save(); ctx.translate(800, phase === "final" ? 470 : turn === "shoot" ? 600 : 560); ctx.scale(k, k); ctx.font = `900 54px ${FONT_T}`; const w = ctx.measureText(banner.t).width + 90; drawPanel(ctx, -w / 2, -50, w, 100, { r: 50, blur: 18, border: banner.c }); text(ctx, banner.t, 0, 3, { size: 54, weight: 900, font: FONT_T, color: banner.c }); ctx.restore(); }
        },
      };
    },
  });
})();
