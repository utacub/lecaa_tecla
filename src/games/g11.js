"use strict";
/* 11. Globus amunt — festa d'aniversari amb globus de làtex i paper xarol */
(() => {
  const CEIL = 104;              // sostre: un globus que hi arriba s'ha escapat
  const TABLE_Y = 742;           // tauler de la taula de la festa
  const COLS = ["#E8453C", "#3B8FE0", "#F5C02E", "#46B35C", "#9A5BD0", "#F07AA8", "#F5862A", "#22B0A2"];
  const GUESTS = ["gat", "conill", "os", "guineu", "porc", "lleo", "mico", "elefant", "gos", "granota", "mussol", "esquirol"];
  const DECOR = ["una garlanda d'estrelles", "un fanalet de paper", "un pastís de tres pisos", "una corona de festa", "un ram de serpentines", "una bola de miralls", "un globus daurat"];
  const BR = 60, BRY = 72; // radis del globus
  const MC = makeCanvas(4, 4).getContext("2d");

  /* ---------- globus (làtex brillant, prerenderitzat per color) ---------- */
  const balloonSpr = col => Sprites.get("g11b" + col, BR * 2 + 24, BRY * 2 + 40, (c, w, h) => {
    const im=Art.cell("party-balloons",Math.max(0,COLS.indexOf(col)),4,2,w,h);
    if(im){c.drawImage(im,0,0,w,h);return;}
    c.translate(w / 2, BRY + 10);
    const body = () => { c.beginPath(); c.moveTo(0, BRY); c.bezierCurveTo(-BR * 0.5, BRY * 0.92, -BR * 1.02, BRY * 0.45, -BR, -BRY * 0.12); c.bezierCurveTo(-BR * 0.98, -BRY * 0.78, -BR * 0.55, -BRY, 0, -BRY); c.bezierCurveTo(BR * 0.55, -BRY, BR * 0.98, -BRY * 0.78, BR, -BRY * 0.12); c.bezierCurveTo(BR * 1.02, BRY * 0.45, BR * 0.5, BRY * 0.92, 0, BRY); c.closePath(); };
    body(); const g = c.createRadialGradient(-BR * 0.35, -BRY * 0.4, 4, 0, 0, BRY * 1.15); g.addColorStop(0, shade(col, 0.45)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.45)); c.fillStyle = g; c.fill();
    c.save(); body(); c.clip();
    c.globalAlpha = 0.35; c.strokeStyle = shade(col, 0.55); c.lineWidth = 5; c.beginPath(); c.arc(0, 4, BR * 0.92, 0.25, 1.35); c.stroke(); c.globalAlpha = 1;
    c.restore();
    // reflex especular (finestra) i punt
    c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.ellipse(-BR * 0.42, -BRY * 0.42, BR * 0.16, BRY * 0.25, 0.5, 0, 6.28); c.fill();
    c.fillStyle = "rgba(255,255,255,0.55)"; c.beginPath(); c.ellipse(-BR * 0.18, -BRY * 0.72, BR * 0.08, BRY * 0.05, 0.2, 0, 6.28); c.fill();
    c.strokeStyle = rgba("#000000", 0.18); c.lineWidth = 1.5; body(); c.stroke();
    // nus
    c.fillStyle = shade(col, -0.25); c.beginPath(); c.moveTo(0, BRY - 3); c.lineTo(-8, BRY + 12); c.quadraticCurveTo(0, BRY + 8, 8, BRY + 12); c.closePath(); c.fill();
  });
  /* ---------- convidats ---------- */
  function drawGuest(ctx, g, t) {
    const im=Art.isolatedCell("party-guests",GUESTS.indexOf(g.id),240,280);
    if(im){const bob=g.clap>0?-Math.abs(Math.sin((t+g.ph)*7))*12:Math.sin(t*1.5+g.ph)*2;
      ctx.save();ctx.translate(g.x,g.y+bob);ctx.rotate(g.sad>0?-0.06:Math.sin(t*1.4+g.ph)*0.012);ctx.scale(g.flip?-1:1,1);
      ctx.drawImage(im,-g.size*.65,-g.size*1.02,g.size*1.3,g.size*1.52);ctx.restore();return;}

    if (typeof Critters !== "undefined") { Critters.draw(ctx, g.id, g.x, g.y, g.size, { t: t + g.ph, pose: g.clap > 0 ? "happy" : g.sad > 0 ? "sad" : "idle", flip: g.flip }); }
    else { ctx.fillStyle = "#B07A4A"; ctx.beginPath(); ctx.arc(g.x, g.y - g.size * 0.15, g.size * 0.3, 0, 6.28); ctx.fill(); }
    // barret de festa de paper
    const hx = g.x + (g.flip ? 6 : -6), hy = g.y - g.size * 0.31 + (g.clap > 0 ? -Math.abs(Math.sin((t + g.ph) * 7)) * g.size * 0.05 : 0);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(g.flip ? 0.18 : -0.18);
    ctx.beginPath(); ctx.moveTo(-20, 8); ctx.lineTo(0, -46); ctx.lineTo(20, 8); ctx.closePath(); ctx.fillStyle = g.hat; ctx.fill(); ctx.save(); ctx.clip();
    ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 5; for (let k = -40; k < 20; k += 14) { ctx.beginPath(); ctx.moveTo(-24, k + 24); ctx.lineTo(24, k); ctx.stroke(); } ctx.restore();
    ctx.strokeStyle = "rgba(40,20,20,0.5)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#FFE08A"; ctx.beginPath(); ctx.arc(0, -46, 7, 0, 6.28); ctx.fill(); ctx.strokeStyle = "rgba(120,80,0,0.5)"; ctx.stroke();
    ctx.restore();
    // mans que piquen (cercles que es toquen)
    if (g.clap > 0) { const k = Math.abs(Math.sin((t + g.ph) * 9)), cx = g.x, cy = g.y - g.size * 0.02; ctx.fillStyle = g.hand; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * (6 + k * 18), cy, 11, 0, 6.28); ctx.fill(); ctx.strokeStyle = "rgba(43,35,32,0.8)"; ctx.lineWidth = 2; ctx.stroke(); } if (k < 0.2) { ctx.strokeStyle = "rgba(255,240,160,0.9)"; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const a = -1.9 + i * 0.6; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18); ctx.lineTo(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30); ctx.stroke(); } } }
  }
  /* ---------- sala de festes ---------- */
  function bunting(c, x0, x1, y, sag, seed) {
    const n = Math.round((x1 - x0) / 46), R = mulberry32(seed);
    c.strokeStyle = "#8A6A4A"; c.lineWidth = 2.5; c.beginPath(); for (let i = 0; i <= 40; i++) { const k = i / 40; c.lineTo(lerp(x0, x1, k), y + Math.sin(k * Math.PI) * sag); } c.stroke();
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n, x = lerp(x0, x1, k), yy = y + Math.sin(k * Math.PI) * sag, col = COLS[Math.floor(R() * COLS.length)];
      c.save(); c.translate(x, yy); c.rotate(Math.cos(k * Math.PI) * sag * -0.004);
      c.shadowColor = "rgba(60,30,20,0.3)"; c.shadowBlur = 6; c.shadowOffsetY = 4;
      c.beginPath(); c.moveTo(-19, 0); c.lineTo(19, 0); c.lineTo(0, 40); c.closePath(); const g = c.createLinearGradient(-19, 0, 19, 40); g.addColorStop(0, shade(col, 0.3)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, -0.2)); c.fillStyle = g; c.fill(); c.shadowColor = "transparent";
      c.fillStyle = "rgba(255,255,255,0.35)"; c.beginPath(); c.moveTo(-12, 3); c.lineTo(-2, 3); c.lineTo(-6, 18); c.closePath(); c.fill();
      c.restore();
    }
  }
  function pin(c, x, y, col) { c.fillStyle = "rgba(0,0,0,0.25)"; c.beginPath(); c.ellipse(x + 2, y + 4, 9, 5, 0, 0, 6.28); c.fill(); const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, 9); g.addColorStop(0, shade(col, 0.6)); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.arc(x, y, 8, 0, 6.28); c.fill(); }
  const roomSpr = () => Sprites.get("g11room", W, H, (c) => {
    if(Art.get("party-bg")){c.drawImage(Art.get("party-bg"),0,0,W,H);return;}
    // paper pintat de ratlles
    const st = 64; for (let x = 0; x < W; x += st) { c.fillStyle = (x / st) % 2 ? "#FBE6DA" : "#FFF3EA"; c.fillRect(x, 0, st, H); }
    c.fillStyle = "rgba(240,150,140,0.18)"; for (let x = st / 2; x < W; x += st * 2) for (let y = 140; y < H; y += 56) { starPath(c, x + st, y + (x % 3) * 8, 7, 3, 5); c.fill(); }
    c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(Tex.paper(400, 400, "#efe6dc", { seed: 51 }), "repeat"); c.fillRect(0, 0, W, H); c.restore();
    // sòcol de fusta (sota la taula)
    c.fillStyle = c.createPattern(Tex.wood(800, 200, "#B98A5E", { seed: 52 }), "repeat"); c.fillRect(0, 610, W, 290);
    c.fillStyle = "rgba(255,240,220,0.6)"; c.fillRect(0, 606, W, 6); c.fillStyle = "rgba(90,50,20,0.35)"; c.fillRect(0, 612, W, 3);
    // finestra amb cel de tarda
    c.save(); c.translate(1235, 300); c.shadowColor = "rgba(80,40,20,0.3)"; c.shadowBlur = 16; c.shadowOffsetY = 8;
    rr(c, -120, -120, 240, 230, 14); c.fillStyle = "#FFFFFF"; c.fill(); c.shadowColor = "transparent";
    const sky = c.createLinearGradient(0, -104, 0, 94); sky.addColorStop(0, "#7EC8F0"); sky.addColorStop(1, "#FFE2B8"); c.fillStyle = sky; rr(c, -104, -104, 208, 198, 8); c.fill();
    c.fillStyle = "rgba(255,255,255,0.9)"; for (const [x, y, s] of [[-50, -50, 1], [40, -20, 0.8]]) { c.beginPath(); c.arc(x, y, 18 * s, 0, 6.28); c.arc(x + 20 * s, y - 8 * s, 22 * s, 0, 6.28); c.arc(x + 42 * s, y, 16 * s, 0, 6.28); c.fill(); }
    c.fillStyle = "#7FBF6A"; c.beginPath(); c.moveTo(-104, 94); c.quadraticCurveTo(-30, 30, 104, 70); c.lineTo(104, 94); c.closePath(); c.fill();
    c.fillStyle = "#fff"; c.fillRect(-4, -104, 8, 198); c.fillRect(-104, -8, 208, 8);
    c.fillStyle = "rgba(255,255,255,0.35)"; c.beginPath(); c.moveTo(-90, -104); c.lineTo(-40, -104); c.lineTo(-104, -20); c.lineTo(-104, -60); c.closePath(); c.fill();
    c.restore();
    // quadre amb un pastís de paper retallat
    c.save(); c.translate(360, 300); c.rotate(-0.03); c.shadowColor = "rgba(80,40,20,0.3)"; c.shadowBlur = 12; c.shadowOffsetY = 6; rr(c, -80, -90, 160, 180, 6); c.fillStyle = "#E0A040"; c.fill(); c.shadowColor = "transparent";
    c.fillStyle = "#FFF8EE"; c.fillRect(-66, -76, 132, 152); c.fillStyle = "#F07AA8"; rr(c, -40, 0, 80, 46, 6); c.fill(); c.fillStyle = "#FFFFFF"; rr(c, -30, -26, 60, 30, 6); c.fill(); c.fillStyle = "#3B8FE0"; c.fillRect(-3, -50, 6, 24); c.fillStyle = "#F5C02E"; c.beginPath(); c.ellipse(0, -58, 6, 10, 0, 0, 6.28); c.fill();
    c.restore();
    // sostre i motllura
    const cg = c.createLinearGradient(0, 0, 0, CEIL); cg.addColorStop(0, "#F4EEE6"); cg.addColorStop(1, "#E4D8CA"); c.fillStyle = cg; c.fillRect(0, 0, W, CEIL);
    c.fillStyle = "#FFFFFF"; c.fillRect(0, CEIL - 14, W, 10); c.fillStyle = "rgba(120,80,50,0.25)"; c.fillRect(0, CEIL - 4, W, 4); c.fillStyle = "rgba(120,80,50,0.12)"; c.fillRect(0, CEIL, W, 10);
    // garlandes penjades de xinxetes
    bunting(c, 20, 560, CEIL + 4, 70, 3); bunting(c, 560, 1060, CEIL + 4, 60, 4); bunting(c, 1060, 1580, CEIL + 4, 70, 5);
    for (const [x, col] of [[20, "#E8453C"], [560, "#3B8FE0"], [1060, "#46B35C"], [1580, "#F5C02E"]]) pin(c, x, CEIL + 4, col);
    // serpentines
    for (const [x, col] of [[300, "#F07AA8"], [820, "#22B0A2"], [1400, "#9A5BD0"]]) { c.strokeStyle = col; c.lineWidth = 6; c.lineCap = "round"; c.beginPath(); for (let i = 0; i <= 50; i++) { const y = CEIL + 6 + i * 3.2, xx = x + Math.sin(i * 0.55) * 12; if (i === 0) c.moveTo(xx, y); else c.lineTo(xx, y); } c.stroke(); pin(c, x, CEIL + 6, "#E8453C"); }
    const sp = c.createRadialGradient(800, 380, 100, 800, 420, 1000); sp.addColorStop(0, "rgba(255,230,190,0)"); sp.addColorStop(1, "rgba(120,60,30,0.28)"); c.fillStyle = sp; c.fillRect(0, 0, W, H);
  });
  const tableSpr = () => Sprites.get("g11table", W, H - TABLE_Y + 220, (c) => {
    const y0 = 220; // marge per al pastís
    if(Art.get("party-bg")&&Art.get("party-cake")){
      const im=Art.get("party-bg"); c.drawImage(im,0,770,1600,130,0,770-TABLE_Y+220,W,130);
      Art.fit(c,"party-cake",650,18,300,310);return;
    }
    // estovalles amb pics i punts
    c.save(); c.shadowColor = "rgba(80,40,20,0.35)"; c.shadowBlur = 20; c.shadowOffsetY = -4; c.fillStyle = "#FFFFFF"; c.fillRect(0, y0, W, 30); c.restore();
    const tg = c.createLinearGradient(0, y0, 0, y0 + 40); tg.addColorStop(0, "#FFFFFF"); tg.addColorStop(1, "#ECE4F2"); c.fillStyle = tg; c.fillRect(0, y0, W, 40);
    c.fillStyle = "#FFFBF6"; c.fillRect(0, y0 + 40, W, H);
    c.fillStyle = "rgba(240,122,168,0.35)"; for (let x = 20; x < W; x += 60) for (let y = y0 + 64; y < y0 + 200; y += 44) { c.beginPath(); c.arc(x + ((y / 44) % 2) * 30, y, 8, 0, 6.28); c.fill(); }
    c.fillStyle = "rgba(160,120,200,0.25)"; c.fillRect(0, y0 + 40, W, 4);
    c.fillStyle = "#F07AA8"; for (let x = 0; x < W; x += 40) { c.beginPath(); c.arc(x + 20, y0 + 44, 20, 0, Math.PI); c.fill(); }
    c.fillStyle = "#FFFBF6"; for (let x = 0; x < W; x += 40) { c.beginPath(); c.arc(x + 20, y0 + 40, 17, 0, Math.PI); c.fill(); }
    const fg = c.createLinearGradient(0, y0 + 60, 0, y0 + 160); fg.addColorStop(0, "rgba(0,0,0,0)"); fg.addColorStop(1, "rgba(80,40,60,0.18)"); c.fillStyle = fg; c.fillRect(0, y0 + 60, W, 200);
    // pastís de dos pisos (centrat)
    c.save(); c.translate(800, y0 + 6);
    c.fillStyle = "rgba(80,40,40,0.22)"; c.beginPath(); c.ellipse(0, 4, 150, 16, 0, 0, 6.28); c.fill();
    c.fillStyle = "#E8E8F0"; c.beginPath(); c.ellipse(0, -2, 140, 14, 0, 0, 6.28); c.fill();
    const tier = (y, w, h, col, top) => {
      const g = c.createLinearGradient(-w, 0, w, 0); g.addColorStop(0, shade(col, -0.12)); g.addColorStop(0.35, shade(col, 0.15)); g.addColorStop(1, shade(col, -0.2)); c.fillStyle = g; c.fillRect(-w, y - h, w * 2, h);
      c.beginPath(); c.ellipse(0, y, w, w * 0.12, 0, 0, Math.PI); c.fill();
      c.fillStyle = top; c.beginPath(); c.ellipse(0, y - h, w, w * 0.12, 0, 0, 6.28); c.fill();
      c.beginPath(); c.moveTo(-w, y - h); for (let i = 0; i <= 12; i++) { const x = -w + i * w / 6; c.quadraticCurveTo(x - w / 12, y - h + 14 + (i % 2) * 10, x, y - h + 4); } c.lineTo(w, y - h); c.closePath(); c.fill();
    };
    tier(-6, 120, 62, "#F07AA8", "#FFF4F8"); tier(-74, 80, 52, "#FFD9E6", "#FFFFFF");
    c.fillStyle = "#E8453C"; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(-60 + i * 20, -128, 6, 0, 6.28); c.fill(); }
    for (const [x, col] of [[-40, "#3B8FE0"], [0, "#F5C02E"], [40, "#46B35C"]]) { c.fillStyle = col; c.fillRect(x - 4, -170, 8, 40); c.fillStyle = "rgba(255,255,255,0.5)"; c.fillRect(x - 3, -170, 2, 40); }
    c.restore();
    // gots de paper i regals
    for (const [x, col] of [[420, "#3B8FE0"], [1180, "#46B35C"]]) { c.save(); c.translate(x, y0 + 8); c.fillStyle = col; c.beginPath(); c.moveTo(-26, -66); c.lineTo(26, -66); c.lineTo(20, 0); c.lineTo(-20, 0); c.closePath(); c.fill(); c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 6; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(k * 10, -66); c.lineTo(k * 8, 0); c.stroke(); } c.fillStyle = "#fff"; c.beginPath(); c.ellipse(0, -66, 26, 6, 0, 0, 6.28); c.fill(); c.restore(); }
    for (const [x, w, h, col, rib] of [[560, 90, 70, "#9A5BD0", "#F5C02E"], [1030, 74, 90, "#F5862A", "#3B8FE0"]]) { c.save(); c.translate(x, y0 + 10); c.shadowColor = "rgba(60,20,40,0.3)"; c.shadowBlur = 10; c.shadowOffsetY = 4; c.fillStyle = col; c.fillRect(-w / 2, -h, w, h); c.shadowColor = "transparent"; c.fillStyle = shade(col, 0.25); c.fillRect(-w / 2, -h, w, 10); c.fillStyle = rib; c.fillRect(-7, -h, 14, h); c.beginPath(); c.ellipse(-16, -h - 8, 18, 10, 0.4, 0, 6.28); c.ellipse(16, -h - 8, 18, 10, -0.4, 0, 6.28); c.fill(); c.restore(); }
  });
  const flame = (ctx, x, y, t, s = 1) => { const f = 1 + Math.sin(t * 6) * 0.08 + Math.sin(t * 9.7) * 0.05; ctx.save(); ctx.translate(x, y); ctx.scale(s, s * f); const g = ctx.createRadialGradient(0, -6, 1, 0, -6, 18); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(0.5, "rgba(255,190,60,0.9)"); g.addColorStop(1, "rgba(255,120,30,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(10, -6, 0, 2); ctx.quadraticCurveTo(-10, -6, 0, -24); ctx.fill(); ctx.restore(); };

  Games.register({
    id: 11, key: "u", name: "Globus amunt", zone: "costa", music: "party", demoTime: 9,
    collect: { one: "decoració", many: "decoracions" },
    goal: l => l <= 3 ? "Escriu la lletra d'un globus per rebentar-lo abans que arribi al sostre." : l === 4 ? "Rebenta els globus del ram en ordre per escriure la síl·laba." : "Escriu la paraula de cada ram de globus abans que arribi al sostre.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      ctx.drawImage(roomSpr().c, 500, 180, 900, 700, 0, 0, w, h);
      const s = Math.min(w / 300, h / 210); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      const bob = Math.sin(t * 1.8) * 5;
      for (const [bx, by, col, k] of [[-95, -30, COLS[1], 0.62], [95, -42, COLS[2], 0.62], [0, -58, COLS[0], 0.8]]) {
        const b = balloonSpr(col), yy = by + bob * (bx === 0 ? 1 : -0.6);
        ctx.strokeStyle = "rgba(90,70,60,0.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, yy + BRY * k); ctx.quadraticCurveTo(bx + 8, yy + BRY * k + 30, bx, yy + BRY * k + 54); ctx.stroke();
        Sprites.draw(ctx, b, bx, yy + 3 * k, { s: k });
      }
      drawPlate(ctx, "u", 0, -58 + bob + BRY * 0.8 + 70, { size: 64, shadowBlur: 8 });
      const R = mulberry32(3); for (let i = 0; i < 14; i++) { ctx.fillStyle = COLS[i % COLS.length]; const px = (R() - 0.5) * 300, py = ((R() * 220 + t * 30 * (0.5 + R())) % 220) - 110; ctx.save(); ctx.translate(px, py); ctx.rotate(t * 2 + i); ctx.fillRect(-6, -3, 12, 6); ctx.restore(); }
      ctx.restore();
    },
    create(api) {
      const L = api.level;
      const P = [null,
        { rise: 52, maxN: 3, gap: 2.6 }, { rise: 56, maxN: 3, gap: 2.3 }, { rise: 60, maxN: 4, gap: 2.0 },
        { rise: 42, maxN: 2, gap: 3.4 }, { rise: 30, maxN: 2, gap: 4.8 }, { rise: 24, maxN: 2, gap: 6.0 }][L];
      const pool = api.pool({ theme: "festa", filter: L >= 5 ? (w => w.length <= 14) : undefined });
      const TIME = 90, MAXESC = 5;
      const bunches = [], stuck = [], falling = [], scraps = [];
      const st = { time: TIME, esc: 0, popped: 0, spawnT: 0, done: false, endT: 0 };
      // convidats: dos a cada costat, darrere la taula
      const ids = shuffle(GUESTS).slice(0, 4), hats = shuffle(COLS);
      const guests = ids.map((id, i) => ({ id, x: [118, 262, 1338, 1482][i], y: TABLE_Y - 30 - (i % 2 ? 0 : 16), size: i % 2 ? 190 : 210, flip: i >= 2, ph: i * 1.3, clap: 0, sad: 0, hat: hats[i], hand: "#FFE3C8" }));
      api.hud.timer = TIME; api.hud.lives = [MAXESC, MAXESC]; api.hud.label = "Rebentats: 0";
      const plateSize = L <= 4 ? 64 : 46;
      /* forma del ram segons el nivell */
      function make(text, x, y) {
        const b = { age: 0, text, x, y, x0: x, vy: P.rise * rand(0.85, 1.15), ph: rand(0, 6.28), balloons: [], plateX: x, plateY: 0, wob: 0, typed: 0, esc: false };
        if (L <= 3) b.balloons.push({ dx: 0, dy: 0, col: pick(COLS), ch: 0 });
        else if (L === 4) { const n = text.length, cs = shuffle(COLS); for (let i = 0; i < n; i++) b.balloons.push({ dx: (i - (n - 1) / 2) * 128, dy: (i % 2) * -18, col: cs[i], ch: i }); }
        else { const cs = shuffle(COLS); [[-62, -6], [0, -40], [62, -6]].forEach(([dx, dy], i) => b.balloons.push({ dx, dy, col: cs[i], at: Math.ceil((i + 1) * text.length / 3) })); }
        return b;
      }
      function spawn(first) {
        const exclude = bunches.filter(b => !b.done && !b.esc).map(b => b.text);
        const text = pool.next(exclude);
        const halfW = L === 4 ? 200 : L >= 5 ? Math.max(130, measure(MC, text, plateSize) / 2 + 40) : 90;
        let x = 0, tries = 0;
        do { x = rand(340 + halfW * 0.5, W - 340 - halfW * 0.5); tries++; } while (tries < 30 && bunches.some(b => !b.esc && !b.done && Math.abs(b.x0 - x) < halfW + (b.halfW || 100) + 30 && b.y > 200));
        const b = make(text, x, first || api.demo ? 520 : (L >= 5 ? 760 : 790)); b.halfW = halfW; bunches.push(b);
      }
      const knotY = b => L >= 5 ? b.y + 118 : b.y + BRY + 78;     // on penja la placa (la vora de dalt)
      const plateCenter = (b, i) => { if (L === 4) { const bl = b.balloons[i]; return [b.x + bl.dx * 1 + Math.sin(b.ph + i) * 3, b.y + bl.dy + BRY + 74 + 42]; } return [b.plateX, knotY(b) + (L >= 5 ? 32 : 42)]; };
      const live = () => bunches.filter(b => !b.done && !b.esc);
      const visible = b => { const [, py] = plateCenter(b, Math.min(b.typed, b.balloons.length - 1)); return py < H - 60; };
      const typer = api.typer({
        targets: () => live().filter(visible),
        rank: b => b.y,
        onStep: (b) => { if (L === 4) { const i = b.typed - 1, [px, py] = plateCenter(b, i); popBalloon(b, b.balloons.find(q => q.ch === i)); falling.push({ text: b.text[i], x: px, y: py, vy: -60, t: 0 }); } else if (L >= 5) { for (const q of b.balloons) if (!q.popped && b.typed >= q.at && b.typed < b.text.length) popBalloon(b, q); } },
        onDone: b => finishBunch(b),
        onMiss: b => { if (b) b.wob = 1; },
      });
      function balloonPos(b, q) { return [b.x + q.dx + Math.sin(api.t * 1.3 + b.ph + q.dx) * 4, b.y + q.dy]; }
      function popBalloon(b, q) {
        if (!q || q.popped) return; q.popped = true;
        const [x, y] = balloonPos(b, q);
        Sfx.play("pop");
        api.particles.emit(x, y, { count: 26, color: ["#E8453C", "#3B8FE0", "#F5C02E", "#46B35C", "#F07AA8", "#FFFFFF"], shape: "confetti", speed: 420, gravity: 260, drag: 0.94, size: 16, life: 2.2 });
        for (let i = 0; i < 6; i++) { if (scraps.length > 30) scraps.shift(); scraps.push({ x, y, vx: rand(-260, 260), vy: rand(-320, -60), r: rand(0, 6), vr: rand(-8, 8), col: q.col, s: rand(10, 20), t: 0 }); }
        clap();
      }
      function clap() { guests.forEach(g => g.clap = 1.3); for (let i = 0; i < 4; i++) noise({ f: 1600, q: 0.7, d: 0.05, v: 0.12, delay: 0.15 + i * 0.13 }); }
      function finishBunch(b) {
        b.balloons.forEach(q => popBalloon(b, q));
        b.done = true; st.popped++; api.hud.label = "Rebentats: " + st.popped;
        if (L !== 4) { const [px, py] = plateCenter(b, 0); falling.push({ text: b.text, x: px, y: py, vy: -120, t: 0 }); }
      }
      spawn(true); st.spawnT = 1.4;
      return {
        expected() { return st.done ? null : typer.expected(); },
        onKey(k) { if (!st.done) typer.key(k); },
        update(dt) {
          const t = api.t;
          if (!st.done) {
            st.time -= dt; api.hud.timer = Math.max(0, st.time);
            if (st.time <= 0 && !api.demo) { st.done = true; st.win = true; st.endT = 0; clap(); }
          } else { st.endT += dt; if (st.endT > 1.2 && !st.fin) { st.fin = true; api.finish(st.win, { collectName: pick(DECOR) }); } }
          st.spawnT -= dt * api.speed;
          const n = live().length;
          if (!st.done && n < P.maxN && (st.spawnT <= 0 || typer.live().length === 0 && st.spawnT < P.gap * 0.5)) { spawn(false); st.spawnT = P.gap * rand(0.85, 1.2); }
          const lock = typer.current();
          for (const b of bunches) {
            if (b.done) continue;
            b.age += dt;
            if (b.esc) { b.y = lerp(b.y, b.stuckY, 1 - Math.pow(0.02, dt)); continue; }
            const left = b.balloons.filter(q => !q.popped).length / b.balloons.length;
            const slow = b === lock ? 0.55 : 1;
            b.y -= b.vy * api.speed * slow * (0.55 + 0.45 * left) * dt;
            b.x = b.x0 + Math.sin(t * 0.9 + b.ph) * 22;
            b.plateX = lerp(b.plateX, b.x, 1 - Math.pow(0.1, dt));
            b.wob = Math.max(0, b.wob - dt * 1.6);
            const top = Math.min(...b.balloons.filter(q => !q.popped).map(q => b.y + q.dy)) - BRY;
            if (top < CEIL + 4) {
              b.esc = true; b.stuckY = b.y + (CEIL + 6 - top); st.esc++; Sfx.play("boing"); Sfx.play("sour", { note: 64 });
              guests.forEach(g => g.sad = 1.2); typer.release && typer.lock === b && typer.release();
              api.hud.lives = [Math.max(0, MAXESC - st.esc), MAXESC];
              if (st.esc > MAXESC && !st.done && !api.demo) { st.done = true; st.win = false; st.endT = 0; }
              if (stuck.length > 7) { const old = stuck.shift(); old.gone = true; }
              stuck.push(b);
            }
          }
          for (let i = bunches.length - 1; i >= 0; i--) if (bunches[i].done || bunches[i].gone) bunches.splice(i, 1);
          for (let i = falling.length - 1; i >= 0; i--) { const f = falling[i]; f.t += dt; f.vy += 700 * dt; f.y += f.vy * dt; if (f.t > 1.2) falling.splice(i, 1); }
          for (let i = scraps.length - 1; i >= 0; i--) { const s = scraps[i]; s.t += dt; s.vy += 900 * dt; s.vx *= 0.98; s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; if (s.y > H + 40) scraps.splice(i, 1); }
          guests.forEach(g => { g.clap = Math.max(0, g.clap - dt); g.sad = Math.max(0, g.sad - dt); });
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(roomSpr().c, 0, 0, W, H);
          // convidats darrere la taula
          for (const g of guests) drawGuest(ctx, g, t);
          const tb = tableSpr(); ctx.drawImage(tb.c, 0, TABLE_Y - 220, W, H - TABLE_Y + 220);
          for (const x of [-36, 0, 36]) flame(ctx, 800 + x, Art.get("party-cake") ? TABLE_Y-200 : TABLE_Y+6-170, t+x, 1);
          const lock = typer.current();
          // globus (els escapats queden enganxats al sostre)
          const drawBunch = b => {
            const a = (b.esc ? 0.75 : 1) * clamp(b.age / 0.35, 0, 1);
            ctx.save(); ctx.globalAlpha = a;
            const ky = knotY(b);
            for (const q of b.balloons) {
              if (q.popped) continue;
              const [x, y] = balloonPos(b, q), wob = b.wob > 0 ? Math.sin(b.wob * 20) * b.wob * 0.12 : 0;
              ctx.strokeStyle = "rgba(90,70,60,0.85)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + BRY + 8);
              if (L >= 5) ctx.quadraticCurveTo(x + Math.sin(t * 2 + q.dx) * 8, (y + ky) / 2 + 20, b.plateX, ky); else if (!b.esc) { const [px, py] = plateCenter(b, L === 4 ? q.ch : 0); ctx.bezierCurveTo(x + Math.sin(t * 2 + b.ph) * 10, y + BRY + 30, (x + px) / 2, py - 70, L === 4 ? px : b.plateX, py - 42); }
              else ctx.quadraticCurveTo(x + 10, y + BRY + 40, x - 4, y + BRY + 90);
              ctx.stroke();
              Sprites.draw(ctx, balloonSpr(q.col), x, y + 10, { sx: 1 + wob, sy: 1 - wob, ay: (BRY + 20) / (BRY * 2 + 40) });
            }
            if (L >= 5 && !b.esc) { ctx.fillStyle = "#E8453C"; ctx.beginPath(); ctx.ellipse(b.plateX - 10, ky - 2, 10, 6, 0.5, 0, 6.28); ctx.ellipse(b.plateX + 10, ky - 2, 10, 6, -0.5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(b.plateX, ky - 2, 5, 0, 6.28); ctx.fill(); }
            ctx.restore();
          };
          stuck.forEach(b => { if (!b.gone) drawBunch(b); });
          for (const b of bunches) if (!b.esc) drawBunch(b);
          // trossos de làtex que cauen
          for (const s of scraps) { ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(s.r); ctx.fillStyle = s.col; ctx.beginPath(); ctx.moveTo(-s.s / 2, 0); ctx.quadraticCurveTo(0, -s.s * 0.6, s.s / 2, 0); ctx.quadraticCurveTo(0, s.s * 0.2, -s.s / 2, 0); ctx.fill(); ctx.restore(); }
          // plaques penjades del fil (sempre dretes)
          for (const b of bunches) {
            if (b.esc || b.done) continue;
            if (L === 4) b.balloons.forEach((q, i) => { if (q.popped) return; const [px, py] = plateCenter(b, i); drawPlate(ctx, b.text[i], px, py, { size: 64, state: b === lock && i === b.typed ? "active" : null }); });
            else { const [px, py] = plateCenter(b, 0); drawPlate(ctx, b.text, px, py, { size: plateSize, progress: b.typed || 0, state: b === lock ? "active" : null, alpha: clamp(b.age / 0.35, 0, 1) }); }
          }
          for (const f of falling) drawPlate(ctx, f.text, f.x, f.y, { size: f.text.length > 1 ? plateSize : 64, state: "ok", alpha: 1 - Ease.inCubic(clamp(f.t / 1.2, 0, 1)) });
          drawVignette(ctx, 0.22, "90,40,20");
        },
      };
    },
  });
})();
