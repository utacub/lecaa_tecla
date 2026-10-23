"use strict";
/* 12. El tren de paraules — tren de fusta de joguina: muntar el tren vagó a vagó i portar-lo de viatge */
(() => {
  const MAIN_Y = 404, SIDE_Y = 640, LOOP_X = 1404, LOOP_RX = 128, LOOP_CY = (MAIN_Y + SIDE_Y) / 2, LOOP_RY = (SIDE_Y - MAIN_Y) / 2;
  const LOCO_X = 34, LOCO_W = 236, SLOT0 = LOCO_X + LOCO_W + 6;
  const STATIONS = [
    { id: "granja", name: "Estació de la granja" }, { id: "mina", name: "Estació de la mina" }, { id: "port", name: "Estació del port" },
    { id: "ciutat", name: "Estació de la ciutat" }, { id: "bosc", name: "Estació del bosc" }, { id: "castell", name: "Estació del castell" },
    { id: "platja", name: "Estació de la platja" }, { id: "muntanya", name: "Estació de la muntanya" },
  ];
  const WCOLS = ["#E8B530", "#3C86C8", "#4FA85A", "#D9503A", "#8E6CC8", "#F08A3C"];
  const CARGOS = ["barrels", "logs", "crates", "coal", "milk", "balls"];
  const SPECIAL = ["un vagó de circ", "un vagó de correus", "un vagó de gelats"];
  const L6_ITEMS = ["estació", "locomotora", "maquinista", "mercaderies", "túnel", "andana", "il·lusió", "hipopòtam", "papallona", "cançó", "bicicleta", "muntanya", "pel·lícula"];

  /* ---------- sons ---------- */
  const snd = {
    roll() { if (!Audio2.ctx || !Settings.sfx) return; for (let i = 0; i < 4; i++) noise({ f: 300, q: 2, d: 0.06, v: 0.12, delay: i * 0.09 }); },
    chuff(v = 0.14) { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 1400, f2: 500, d: 0.18, v, q: 0.6 }); },
    toot() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: 620, d: 0.25, type: "triangle", v: 0.08, a: 0.03 }); tone({ f: 780, d: 0.25, type: "triangle", v: 0.06, a: 0.03 }); },
    whistle() { if (!Audio2.ctx || !Settings.sfx) return; [0, 0.42].forEach(dl => { tone({ f: 880, d: 0.34, type: "sine", v: 0.12, a: 0.04, delay: dl }); tone({ f: 1108, d: 0.34, type: "sine", v: 0.09, a: 0.04, delay: dl }); tone({ f: 1318, d: 0.34, type: "sine", v: 0.06, a: 0.04, delay: dl }); }); },
  };

  /* ---------- fusta envernissada ---------- */
  function grainOver(x, w, h, a = 0.13) { x.save(); x.globalCompositeOperation = "source-atop"; x.globalAlpha = a; x.drawImage(Tex.wood(256, 128, "#8a6a40", { seed: 21 }), 0, 0, w, h); x.restore(); }
  function gloss(x, x0, y0, w, h, r) { const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, "rgba(255,255,255,0.42)"); g.addColorStop(0.22, "rgba(255,255,255,0.08)"); g.addColorStop(0.7, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,0.18)"); x.fillStyle = g; rr(x, x0, y0, w, h, r); x.fill(); }
  function wheel(x, cx, cy, r, hub = "#D33A2C") {
    x.fillStyle = "#1F1A17"; x.beginPath(); x.arc(cx, cy, r, 0, 6.28); x.fill();
    const g = x.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r * 0.8); g.addColorStop(0, shade(hub, 0.3)); g.addColorStop(1, shade(hub, -0.2));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r * 0.72, 0, 6.28); x.fill();
    x.fillStyle = "#E9C88E"; x.beginPath(); x.arc(cx, cy, r * 0.26, 0, 6.28); x.fill();
    x.fillStyle = "rgba(90,60,30,0.6)"; x.beginPath(); x.arc(cx, cy, r * 0.1, 0, 6.28); x.fill();
  }
  function magnet(x, cx, cy) { x.fillStyle = "#3A3A40"; rr(x, cx - 7, cy - 7, 14, 14, 4); x.fill(); x.fillStyle = "#B8302A"; x.beginPath(); x.arc(cx, cy, 5, 0, 6.28); x.fill(); }

  // locomotora (mira a l'esquerra). Sprite 250×250, carril a y=238
  function locoSprite() {
    return Sprites.get("g12loco", 250, 250, (x) => {
      const im=Art.cell("train-vehicles",0,3,2,246,232);
      if(im){const a=Art.get("train-vehicles"),[bx,by,bw,bh]=Art.rects["train-vehicles"][0],k=Math.min(246/bw,232/bh);x.drawImage(a,bx,by,bw,bh,(250-bw*k)/2,238-bh*k,bw*k,bh*k);return;}
      const R = 238;
      x.fillStyle = "rgba(40,25,10,0.28)"; x.beginPath(); x.ellipse(128, R + 2, 118, 8, 0, 0, 6.28); x.fill();
      // xassís de fusta natural
      x.fillStyle = "#D9B07A"; rr(x, 22, R - 52, 214, 22, 6); x.fill(); grainOver(x, 250, 250, 0.0);
      // caldera
      const bg = x.createLinearGradient(0, R - 132, 0, R - 50); bg.addColorStop(0, "#5FBF88"); bg.addColorStop(0.35, "#2E8B57"); bg.addColorStop(1, "#1C5E3A");
      x.fillStyle = bg; rr(x, 30, R - 132, 128, 84, 30); x.fill();
      x.fillStyle = "#E9B934"; [62, 104, 140].forEach(bx => { x.fillRect(bx, R - 131, 8, 82); });
      x.fillStyle = "#1C5E3A"; x.beginPath(); x.ellipse(32, R - 90, 12, 40, 0, 0, 6.28); x.fill();
      x.fillStyle = "#E9B934"; x.beginPath(); x.arc(28, R - 92, 9, 0, 6.28); x.fill(); x.fillStyle = "#FFF4C0"; x.beginPath(); x.arc(26, R - 94, 4, 0, 6.28); x.fill();
      // xemeneia i cúpula
      const cg = x.createLinearGradient(56, 0, 90, 0); cg.addColorStop(0, "#2A2A2E"); cg.addColorStop(0.4, "#55555C"); cg.addColorStop(1, "#1A1A1E");
      x.fillStyle = cg; rr(x, 58, R - 186, 30, 60, 6); x.fill();
      x.fillStyle = "#D33A2C"; rr(x, 50, R - 196, 46, 16, 6); x.fill();
      x.fillStyle = "#E9B934"; x.beginPath(); x.ellipse(118, R - 132, 18, 16, 0, Math.PI, 0); x.fill();
      // cabina
      const kg = x.createLinearGradient(0, R - 178, 0, R - 50); kg.addColorStop(0, "#EE5A46"); kg.addColorStop(1, "#A82A1E");
      x.fillStyle = kg; rr(x, 150, R - 176, 84, 128, 10); x.fill();
      x.fillStyle = "#FFF6E0"; rr(x, 164, R - 160, 56, 46, 8); x.fill();
      const wg = x.createLinearGradient(170, R - 156, 214, R - 118); wg.addColorStop(0, "#A9DDF0"); wg.addColorStop(1, "#3C6A86"); x.fillStyle = wg; rr(x, 170, R - 154, 44, 34, 6); x.fill();
      x.fillStyle = "#26262A"; rr(x, 140, R - 194, 106, 22, 10); x.fill(); x.fillStyle = "rgba(255,255,255,0.25)"; rr(x, 146, R - 192, 94, 5, 3); x.fill();
      // llevaneu
      x.fillStyle = "#D33A2C"; x.beginPath(); x.moveTo(30, R - 50); x.lineTo(6, R - 14); x.lineTo(38, R - 14); x.closePath(); x.fill();
      x.strokeStyle = "#8A2018"; x.lineWidth = 2; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(30 - i * 6, R - 48 + i * 2); x.lineTo(14 + i * 8, R - 16); x.stroke(); }
      grainOver(x, 250, 250, 0.12);
      gloss(x, 30, R - 132, 128, 84, 30); gloss(x, 150, R - 176, 84, 128, 10);
      // rodes
      wheel(x, 66, R - 18, 18); wheel(x, 142, R - 27, 27); wheel(x, 206, R - 27, 27);
      x.fillStyle = "#C9CED2"; rr(x, 140, R - 32, 70, 8, 4); x.fill();
      magnet(x, 240, R - 40);
    });
  }
  // vagó: sprite (w+24)×170, carril a y=160
  function wagonSprite(w, col, cargo, special) {
    return Sprites.get(`g12w${w}${col}${cargo}${special || ""}`, w + 24, 170, (x) => {
      const idx=[2,3,4,1,5,1][Math.max(0,WCOLS.indexOf(col))],im=Art.cell("train-vehicles",idx,3,2,w+24,154);
      if(im){const a=Art.get("train-vehicles"),[bx,by,bw,bh]=Art.rects["train-vehicles"][idx],k=Math.min((w+24)/bw,154/bh);x.drawImage(a,bx,by,bw,bh,(w+24-bw*k)/2,160-bh*k,bw*k,bh*k);return;}
      const R = 160, ox = 12, H = 100, top = R - 30 - H;
      x.fillStyle = "rgba(40,25,10,0.28)"; x.beginPath(); x.ellipse(ox + w / 2, R + 2, w / 2 + 4, 7, 0, 0, 6.28); x.fill();
      // càrrega
      const cx = ox + w / 2, cy = top;
      if (cargo === "barrels") for (let i = 0; i < 2; i++) { const bx = cx + (i - 0.5) * w * 0.42; const g = x.createLinearGradient(bx - 18, 0, bx + 18, 0); g.addColorStop(0, "#7A4A22"); g.addColorStop(0.4, "#C08048"); g.addColorStop(1, "#6A3E1A"); x.fillStyle = g; rr(x, bx - 18, cy - 38, 36, 44, 10); x.fill(); x.fillStyle = "#3A3A3A"; x.fillRect(bx - 18, cy - 28, 36, 4); x.fillRect(bx - 18, cy - 8, 36, 4); }
      if (cargo === "logs") for (let i = 0; i < 5; i++) { const lx = cx + ((i % 3) - 1) * 22 - (i > 2 ? -11 : 0), ly = cy - 10 - (i > 2 ? 20 : 0); x.fillStyle = "#8A5A2E"; x.beginPath(); x.arc(lx, ly, 12, 0, 6.28); x.fill(); x.fillStyle = "#E3B97E"; x.beginPath(); x.arc(lx, ly, 8, 0, 6.28); x.fill(); x.strokeStyle = "#B8854E"; x.lineWidth = 1.5; x.beginPath(); x.arc(lx, ly, 4, 0, 6.28); x.stroke(); }
      if (cargo === "crates") for (let i = 0; i < 2; i++) { const bx = cx + (i - 0.5) * w * 0.4 - 18, by = cy - 36 + i * 6; x.fillStyle = "#D9A866"; x.fillRect(bx, by, 36, 36); x.strokeStyle = "#9A6A30"; x.lineWidth = 3; x.strokeRect(bx + 1.5, by + 1.5, 33, 33); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + 36, by + 36); x.stroke(); }
      if (cargo === "coal") { x.fillStyle = "#2A2A2E"; x.beginPath(); x.moveTo(cx - w * 0.42, cy + 4); for (let i = 0; i <= 8; i++) x.lineTo(cx - w * 0.42 + i * w * 0.105, cy - 14 - Math.sin(i * 1.7) * 6 - (i > 2 && i < 6 ? 8 : 0)); x.lineTo(cx + w * 0.42, cy + 4); x.fill(); x.fillStyle = "rgba(255,255,255,0.25)"; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(cx - w * 0.3 + i * w * 0.12, cy - 12 - (i % 2) * 6, 2.5, 0, 6.28); x.fill(); } }
      if (cargo === "milk") for (let i = 0; i < 3; i++) { const bx = cx + (i - 1) * w * 0.28; const g = x.createLinearGradient(bx - 12, 0, bx + 12, 0); g.addColorStop(0, "#9AA4AA"); g.addColorStop(0.4, "#F2F5F6"); g.addColorStop(1, "#8A949A"); x.fillStyle = g; rr(x, bx - 12, cy - 34, 24, 40, 6); x.fill(); x.fillStyle = "#6E787E"; rr(x, bx - 6, cy - 42, 12, 10, 3); x.fill(); }
      if (cargo === "cones") for (let i = 0; i < 3; i++) { const bx = cx + (i - 1) * 30; x.fillStyle = "#E3B06A"; x.beginPath(); x.moveTo(bx - 11, cy - 14); x.lineTo(bx, cy + 8); x.lineTo(bx + 11, cy - 14); x.fill(); x.fillStyle = ["#F7A8C0", "#FFF4E0", "#9AD9B0"][i]; x.beginPath(); x.arc(bx, cy - 20, 12, 0, 6.28); x.fill(); }
      if (cargo === "balls") ["#E0553A", "#F2B630", "#3C86C8", "#4FA85A"].forEach((c, i) => { const bx = cx + ((i % 2) - 0.5) * 30 + (i > 1 ? 8 : 0), by = cy - 12 - (i > 1 ? 22 : 0); const g = x.createRadialGradient(bx - 5, by - 5, 2, bx, by, 15); g.addColorStop(0, shade(c, 0.5)); g.addColorStop(1, c); x.fillStyle = g; x.beginPath(); x.arc(bx, by, 14, 0, 6.28); x.fill(); });
      // xassís i caixa pintada
      x.fillStyle = "#D9B07A"; rr(x, ox - 2, R - 36, w + 4, 16, 5); x.fill();
      const bg = x.createLinearGradient(0, top, 0, top + H); bg.addColorStop(0, shade(col, 0.22)); bg.addColorStop(1, shade(col, -0.22));
      x.fillStyle = bg; rr(x, ox, top, w, H, 9); x.fill();
      if (special === "circ") { x.save(); rr(x, ox, top, w, H, 9); x.clip(); for (let i = 0; i < w; i += 16) { x.fillStyle = (i / 16) % 2 ? "#E0553A" : "#FFF4E0"; x.fillRect(ox + i, top, 16, H); } x.restore(); }
      if (special === "correus") { x.fillStyle = "#FFFDF6"; rr(x, cx - 30, top + 30, 60, 40, 4); x.fill(); x.strokeStyle = "#D9503A"; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 30, top + 30); x.lineTo(cx, top + 52); x.lineTo(cx + 30, top + 30); x.stroke(); }
      if (special === "gelats") { x.fillStyle = "#FFFDF6"; x.beginPath(); x.arc(cx, top + 50, 26, 0, 6.28); x.fill(); x.fillStyle = "#D9503A"; x.beginPath(); x.arc(cx - 8, top + 46, 7, 0, 6.28); x.arc(cx + 9, top + 52, 6, 0, 6.28); x.fill(); }
      if (special === "circ") { x.fillStyle = "#F2B630"; starPath(x, cx, top + 50, 24, 10, 5); x.fill(); }
      x.fillStyle = "rgba(0,0,0,0.18)"; x.fillRect(ox + 4, top + 4, w - 8, 5);
      grainOver(x, w + 24, 170, 0.12);
      gloss(x, ox, top, w, H, 9);
      wheel(x, ox + w * 0.24, R - 13, 14); wheel(x, ox + w * 0.76, R - 13, 14);
      magnet(x, ox - 4, R - 28); magnet(x, ox + w + 4, R - 28);
    });
  }

  /* ---------- vies de fusta ---------- */
  function trackStraight(x, x0, x1, y) {
    x.fillStyle = "rgba(40,25,10,0.25)"; x.fillRect(x0, y + 10, x1 - x0, 10);
    x.fillStyle = "#B98A50"; x.fillRect(x0, y + 4, x1 - x0, 12);
    const g = x.createLinearGradient(0, y - 14, 0, y + 6); g.addColorStop(0, "#F3D9A8"); g.addColorStop(1, "#DDB47A"); x.fillStyle = g; x.fillRect(x0, y - 14, x1 - x0, 20);
    x.fillStyle = "rgba(120,80,40,0.55)"; x.fillRect(x0, y - 9, x1 - x0, 3); x.fillRect(x0, y - 1, x1 - x0, 3);
    x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(x0, y - 14, x1 - x0, 2);
    for (let px = x0 + 40; px < x1; px += 200) { x.strokeStyle = "rgba(110,70,30,0.6)"; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, y - 14); x.lineTo(px, y + 16); x.stroke(); x.fillStyle = "rgba(110,70,30,0.35)"; x.beginPath(); x.arc(px - 5, y - 4, 4, 0, 6.28); x.fill(); }
  }
  function trackLoop(x) {
    const arc = (dr, dy, col, lw) => { x.strokeStyle = col; x.lineWidth = lw; x.beginPath(); x.ellipse(LOOP_X, LOOP_CY + dy, LOOP_RX + dr, LOOP_RY + dr * 0.95, 0, -Math.PI / 2, Math.PI / 2); x.stroke(); };
    arc(0, 14, "rgba(40,25,10,0.25)", 22); arc(0, 8, "#B98A50", 22); arc(0, 0, "#E8C690", 20);
    arc(-4, 0, "rgba(120,80,40,0.55)", 2.5); arc(4, 0, "rgba(120,80,40,0.55)", 2.5);
  }

  /* ---------- fons de cada estació ---------- */
  function lolliTree(x, tx, ty, s, col) { x.fillStyle = "#B98A50"; rr(x, tx - 5 * s, ty - 30 * s, 10 * s, 32 * s, 3); x.fill(); const g = x.createRadialGradient(tx - 10 * s, ty - 62 * s, 4, tx, ty - 50 * s, 34 * s); g.addColorStop(0, shade(col, 0.35)); g.addColorStop(1, col); x.fillStyle = g; x.beginPath(); x.arc(tx, ty - 52 * s, 30 * s, 0, 6.28); x.fill(); }
  function pegPerson(x, px, py, col, hat) { x.fillStyle = "rgba(40,25,10,0.25)"; x.beginPath(); x.ellipse(px, py + 2, 14, 4, 0, 0, 6.28); x.fill(); const g = x.createLinearGradient(px - 12, 0, px + 12, 0); g.addColorStop(0, shade(col, -0.2)); g.addColorStop(0.4, shade(col, 0.2)); g.addColorStop(1, shade(col, -0.3)); x.fillStyle = g; rr(x, px - 12, py - 44, 24, 44, 10); x.fill(); x.fillStyle = "#F2CFA2"; x.beginPath(); x.arc(px, py - 54, 12, 0, 6.28); x.fill(); x.fillStyle = "#2A2A2E"; x.beginPath(); x.arc(px - 4, py - 55, 1.6, 0, 6.28); x.arc(px + 4, py - 55, 1.6, 0, 6.28); x.fill(); if (hat) { x.fillStyle = hat; rr(x, px - 13, py - 70, 26, 8, 3); x.fill(); rr(x, px - 9, py - 80, 18, 12, 4); x.fill(); } }
  function stationMotif(x, id) {
    const by = 300;
    if (id === "granja") { x.fillStyle = "#C8442E"; x.fillRect(980, by - 120, 170, 120); x.beginPath(); x.moveTo(960, by - 118); x.lineTo(1065, by - 190); x.lineTo(1170, by - 118); x.fill(); x.fillStyle = "#FFF4E0"; x.fillRect(1035, by - 80, 60, 80); x.strokeStyle = "#C8442E"; x.lineWidth = 6; x.beginPath(); x.moveTo(1035, by - 80); x.lineTo(1095, by); x.moveTo(1095, by - 80); x.lineTo(1035, by); x.stroke(); x.fillStyle = "#E9B934"; x.beginPath(); x.arc(1240, by - 20, 40, Math.PI, 0); x.fill(); }
    if (id === "mina") { x.fillStyle = "#8A7A6A"; x.beginPath(); x.moveTo(900, by); x.quadraticCurveTo(1100, by - 260, 1320, by); x.fill(); x.fillStyle = "#2A2420"; x.beginPath(); x.arc(1110, by, 50, Math.PI, 0); x.fill(); x.strokeStyle = "#B98A50"; x.lineWidth = 10; x.beginPath(); x.arc(1110, by, 54, Math.PI, 0); x.stroke(); x.fillStyle = "#4A4A50"; x.beginPath(); x.ellipse(1250, by - 8, 40, 16, 0, 0, 6.28); x.fill(); }
    if (id === "port") { x.fillStyle = "#4F9CC8"; x.fillRect(820, by - 40, 780, 40); x.fillStyle = "#FFFFFF"; x.beginPath(); x.moveTo(1000, by - 50); x.lineTo(1000, by - 150); x.lineTo(1070, by - 50); x.fill(); x.fillStyle = "#D9503A"; x.beginPath(); x.moveTo(950, by - 50); x.lineTo(1090, by - 50); x.lineTo(1070, by - 30); x.lineTo(970, by - 30); x.fill(); x.fillStyle = "#E9B934"; x.fillRect(1200, by - 120, 60, 80); x.fillStyle = "#3C86C8"; x.fillRect(1270, by - 100, 60, 60); }
    if (id === "ciutat") { [["#E8B530", 880, 140], ["#3C86C8", 950, 200], ["#D9503A", 1030, 160], ["#8E6CC8", 1100, 230], ["#4FA85A", 1180, 150], ["#F08A3C", 1250, 190]].forEach(([c, bx, bh]) => { x.fillStyle = c; x.fillRect(bx, by - bh, 66, bh); x.fillStyle = "rgba(255,255,255,0.7)"; for (let j = by - bh + 16; j < by - 20; j += 30) { x.fillRect(bx + 10, j, 14, 16); x.fillRect(bx + 40, j, 14, 16); } }); }
    if (id === "bosc") for (let i = 0; i < 9; i++) { const tx = 870 + i * 70, s = 1 + (i % 3) * 0.25; x.fillStyle = "#B98A50"; x.fillRect(tx - 5, by - 30 * s, 10, 30 * s); x.fillStyle = i % 2 ? "#2E7D4F" : "#3E9A5E"; x.beginPath(); x.moveTo(tx - 34 * s, by - 26 * s); x.lineTo(tx, by - 120 * s); x.lineTo(tx + 34 * s, by - 26 * s); x.fill(); }
    if (id === "castell") { x.fillStyle = "#B9AFA0"; x.fillRect(960, by - 150, 260, 150); [960, 1080, 1180].forEach(tx => { x.fillRect(tx, by - 210, 40, 70); for (let k = 0; k < 3; k++) x.fillRect(tx + k * 15, by - 222, 10, 14); }); x.fillStyle = "#5A4A3A"; x.beginPath(); x.arc(1090, by, 40, Math.PI, 0); x.fill(); x.fillStyle = "#D9503A"; x.beginPath(); x.moveTo(1100, by - 210); x.lineTo(1100, by - 260); x.lineTo(1140, by - 248); x.lineTo(1100, by - 236); x.fill(); }
    if (id === "platja") { x.fillStyle = "#4F9CC8"; x.fillRect(820, by - 60, 780, 60); x.fillStyle = "#F2DCA0"; x.beginPath(); x.moveTo(820, by); x.quadraticCurveTo(1200, by - 70, 1600, by - 20); x.lineTo(1600, by); x.fill(); x.fillStyle = "#D9503A"; x.beginPath(); x.moveTo(1100, by - 110); x.quadraticCurveTo(1160, by - 160, 1220, by - 110); x.fill(); x.fillStyle = "#FFFFFF"; x.fillRect(1158, by - 130, 4, 100); x.fillStyle = "#FFE08A"; x.beginPath(); x.arc(1400, by - 190, 40, 0, 6.28); x.fill(); }
    if (id === "muntanya") { x.fillStyle = "#7C8AA0"; x.beginPath(); x.moveTo(860, by); x.lineTo(1060, by - 250); x.lineTo(1260, by); x.fill(); x.beginPath(); x.moveTo(1120, by); x.lineTo(1300, by - 200); x.lineTo(1500, by); x.fill(); x.fillStyle = "#FFFFFF"; x.beginPath(); x.moveTo(1010, by - 190); x.lineTo(1060, by - 250); x.lineTo(1110, by - 190); x.lineTo(1080, by - 200); x.lineTo(1060, by - 180); x.lineTo(1040, by - 200); x.fill(); x.beginPath(); x.moveTo(1260, by - 150); x.lineTo(1300, by - 200); x.lineTo(1340, by - 150); x.fill(); }
  }
  function buildBg(st) {
    const c = makeCanvas(W, H), x = c.getContext("2d");
    if(Art.get("train-bg")){
      x.drawImage(Art.get("train-bg"),0,0,W,H);trackLoop(x);trackStraight(x,0,LOOP_X,MAIN_Y);trackStraight(x,40,LOOP_X,SIDE_Y);
      drawPlate(x,st.name,1110,242,{size:25});return c;
    }
    // fons llunyà (desenfocat com en una maqueta)
    const far = makeCanvas(W, 440), f = far.getContext("2d");
    const sky = f.createLinearGradient(0, 0, 0, 380); sky.addColorStop(0, "#8EC9E6"); sky.addColorStop(1, "#E9F4EC"); f.fillStyle = sky; f.fillRect(0, 0, W, 440);
    f.fillStyle = "#FFFFFF"; [[260, 120, 90], [620, 90, 70], [1380, 130, 100]].forEach(([a, b, r]) => { f.beginPath(); f.arc(a, b, r * 0.5, 0, 6.28); f.arc(a + r * 0.55, b + 8, r * 0.4, 0, 6.28); f.arc(a - r * 0.55, b + 10, r * 0.36, 0, 6.28); f.fill(); });
    f.fillStyle = "#9CC98A"; f.beginPath(); f.moveTo(0, 300); for (let i = 0; i <= 16; i++) f.lineTo(i * 100, 250 + Math.sin(i * 1.3) * 30); f.lineTo(W, 440); f.lineTo(0, 440); f.fill();
    stationMotif(f, st.id);
    f.fillStyle = "#7DB46A"; f.beginPath(); f.moveTo(0, 330); for (let i = 0; i <= 16; i++) f.lineTo(i * 100, 300 + Math.cos(i * 0.9) * 18); f.lineTo(W, 440); f.lineTo(0, 440); f.fill();
    for (let i = 0; i < 7; i++) lolliTree(f, 420 + i * 70 + (i % 2) * 20, 330 + (i % 3) * 6, 0.8 + (i % 3) * 0.15, ["#4FA85A", "#6CBF5A", "#3E8F4A"][i % 3]);
    x.save(); x.filter = "blur(2.5px)"; x.drawImage(far, 0, 0); x.restore();
    // edifici de l'estació (de fusta, a prop)
    x.save(); x.translate(470, 352);
    x.fillStyle = "rgba(40,25,10,0.25)"; x.fillRect(-10, -6, 330, 16);
    x.fillStyle = "#F3E3C0"; x.fillRect(0, -120, 310, 120); x.fillStyle = "#D9503A"; x.beginPath(); x.moveTo(-24, -116); x.lineTo(155, -186); x.lineTo(334, -116); x.closePath(); x.fill();
    x.fillStyle = "rgba(255,255,255,0.25)"; x.beginPath(); x.moveTo(-24, -116); x.lineTo(155, -186); x.lineTo(160, -176); x.lineTo(-10, -112); x.fill();
    x.fillStyle = "#3C86C8"; [24, 236].forEach(wx => { rr(x, wx, -92, 50, 56, 6); x.fill(); }); x.fillStyle = "#A9DDF0"; [24, 236].forEach(wx => { rr(x, wx + 6, -86, 38, 44, 4); x.fill(); });
    x.fillStyle = "#8A5A2E"; rr(x, 124, -84, 62, 84, 6); x.fill();
    x.fillStyle = "#FFFDF6"; rr(x, 40, -150, 230, 34, 10); x.fill(); x.strokeStyle = BRAND.petroli; x.lineWidth = 3; x.stroke();
    text(x, st.name, 155, -132, { size: st.name.length > 21 ? 19 : 21, weight: 900, font: FONT_T, color: BRAND.tinta });
    grainOver(x, 310, 0, 0); x.restore();
    // terra (taula de fusta clara on hi ha el joc)
    x.drawImage(Tex.wood(800, 260, "#E3C291", { seed: 8 }), 0, 352, W, H - 352);
    const sh = x.createLinearGradient(0, 352, 0, 420); sh.addColorStop(0, "rgba(40,25,10,0.3)"); sh.addColorStop(1, "rgba(40,25,10,0)"); x.fillStyle = sh; x.fillRect(0, 352, W, 70);
    // andana de taulons entre les dues vies
    x.fillStyle = "rgba(40,25,10,0.28)"; x.fillRect(20, 432, 1290, 168);
    x.fillStyle = "#C9A16A"; x.fillRect(16, 424, 1290, 166);
    for (let j = 0; j < 5; j++) { x.fillStyle = j % 2 ? "#D7B17A" : "#CFA670"; x.fillRect(16, 428 + j * 32, 1290, 30); }
    x.fillStyle = "rgba(90,60,30,0.35)"; for (let j = 0; j < 5; j++) for (let i = (j % 2) * 120; i < 1290; i += 240) x.fillRect(16 + i, 428 + j * 32, 2, 30);
    x.fillStyle = "#E9B934"; x.fillRect(16, 424, 1290, 6); x.fillStyle = "#9A6A30"; x.fillRect(16, 590, 1290, 10);
    // fanals, banc i viatgers
    for (const lx of [380, 900]) { x.fillStyle = "rgba(40,25,10,0.25)"; x.beginPath(); x.ellipse(lx + 6, 470, 20, 6, 0, 0, 6.28); x.fill(); x.fillStyle = "#2E5E62"; x.fillRect(lx - 5, 340, 10, 130); x.fillStyle = "#FFE9A8"; rr(x, lx - 16, 318, 32, 30, 8); x.fill(); x.fillStyle = "#2E5E62"; rr(x, lx - 20, 310, 40, 10, 4); x.fill(); }
    x.fillStyle = "#8A5A2E"; rr(x, 560, 500, 160, 14, 4); x.fill(); rr(x, 560, 470, 160, 12, 4); x.fill(); x.fillRect(574, 512, 10, 30); x.fillRect(696, 512, 10, 30);
    pegPerson(x, 600, 516, "#3C86C8", "#2A2A2E"); pegPerson(x, 660, 518, "#E8B530", null); pegPerson(x, 1050, 560, "#D9503A", "#4FA85A");
    x.fillStyle = "#B98A50"; rr(x, 1140, 520, 60, 46, 4); x.fill(); x.fillStyle = "#D9A866"; rr(x, 1150, 486, 44, 38, 4); x.fill();
    // vies
    trackLoop(x);
    trackStraight(x, 0, LOOP_X, MAIN_Y); trackStraight(x, 40, LOOP_X, SIDE_Y);
    x.fillStyle = "#9A6A30"; rr(x, 34, SIDE_Y - 30, 14, 44, 4); x.fill(); x.fillStyle = "#D9503A"; rr(x, 30, SIDE_Y - 40, 22, 16, 5); x.fill(); // topall
    // joguines a terra, a baix
    x.save(); x.translate(1470, 820); x.fillStyle = "rgba(40,25,10,0.25)"; x.beginPath(); x.ellipse(0, 30, 70, 14, 0, 0, 6.28); x.fill(); x.fillStyle = "#3C86C8"; x.fillRect(-60, -30, 60, 60); x.fillStyle = "#E8B530"; x.fillRect(4, -10, 50, 40); x.fillStyle = "#D9503A"; x.fillRect(-36, -76, 46, 46); x.restore();
    // peces de via soltes i un senyal
    x.save(); x.translate(330, 790); x.rotate(-0.12); x.fillStyle = "rgba(40,25,10,0.25)"; x.fillRect(4, 10, 210, 30); trackStraight(x, 0, 200, 0); x.restore();
    x.save(); x.translate(1150, 760); x.rotate(0.08); x.fillStyle = "rgba(40,25,10,0.25)"; x.fillRect(4, 10, 150, 30); trackStraight(x, 0, 140, 0); x.restore();
    x.save(); x.translate(1300, 700); x.fillStyle = "rgba(40,25,10,0.25)"; x.beginPath(); x.ellipse(6, 4, 30, 8, 0, 0, 6.28); x.fill(); x.fillStyle = "#3A3A40"; x.fillRect(-4, -110, 8, 112); x.fillStyle = "#2A2A2E"; rr(x, -16, -150, 32, 60, 8); x.fill(); x.fillStyle = "#E0553A"; x.beginPath(); x.arc(0, -134, 9, 0, 6.28); x.fill(); x.fillStyle = "#5FD08A"; x.beginPath(); x.arc(0, -108, 9, 0, 6.28); x.fill(); x.restore();
    x.save(); x.translate(120, 820); x.fillStyle = "rgba(40,25,10,0.25)"; x.beginPath(); x.ellipse(0, 26, 60, 12, 0, 0, 6.28); x.fill(); lolliTree(x, 0, 30, 1.3, "#4FA85A"); x.restore();
    return c;
  }

  /* ---------- viatge: paisatge de maqueta en parallax ---------- */
  function travelLayers() {
    return Sprites.get("g12travel", 1600, 900, (x) => {
      const sky = x.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, "#7FC0E2"); sky.addColorStop(1, "#E6F2E6"); x.fillStyle = sky; x.fillRect(0, 0, 1600, 900);
    });
  }
  function stripFar() { return Sprites.get("g12far", 1600, 360, (x) => { x.fillStyle = "#A9C8C0"; x.beginPath(); x.moveTo(0, 360); const hf = i => 160 + Math.sin(i * Math.PI * 6 / 16) * 50 + (i % 2) * 30; for (let i = 0; i <= 16; i++) x.lineTo(i * 100, hf(i)); x.lineTo(1600, 360); x.fill(); x.fillStyle = "#FFFFFF"; for (let i = 0; i < 16; i += 2) { const px = i * 100, py = hf(i); x.beginPath(); x.moveTo(px - 30, py + 30); x.lineTo(px, py); x.lineTo(px + 30, py + 30); x.fill(); } }); }
  function stripMid() { return Sprites.get("g12mid", 1600, 300, (x) => { x.fillStyle = "#86BE6E"; x.beginPath(); x.moveTo(0, 300); for (let i = 0; i <= 32; i++) x.lineTo(i * 50, 120 + Math.sin(i * Math.PI * 8 / 32) * 40); x.lineTo(1600, 300); x.fill(); for (let i = 0; i < 14; i++) lolliTree(x, 60 + i * 115, 150 + Math.sin(i * 0.8 * 1.6) * 30 + 40, 0.9, ["#4FA85A", "#6CBF5A", "#3E8F4A"][i % 3]); }); }
  function stripFg() { return Sprites.get("g12fg", 1600, 160, (x) => { for (let i = 0; i < 20; i++) { const px = i * 84 + (i % 3) * 10, r = 40 + (i % 4) * 10; const g = x.createRadialGradient(px - 10, 80, 4, px, 100, r); g.addColorStop(0, "#6CBF5A"); g.addColorStop(1, "#2E7D4F"); x.fillStyle = g; x.beginPath(); x.arc(px, 120, r, Math.PI, 0); x.fill(); } }); }

  /* ---------- miniatura ---------- */
  function thumb(ctx, x, y, w, h, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
    const sky = ctx.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#8EC9E6"); sky.addColorStop(0.6, "#E9F4EC"); sky.addColorStop(0.6, "#E3C291"); sky.addColorStop(1, "#D2AE78"); ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    const sc = Math.min(Math.max(w / 300, h / 170), h / 150); ctx.translate(w / 2, h * 0.62); ctx.scale(sc, sc);
    ctx.fillStyle = "#9CC98A"; ctx.beginPath(); ctx.ellipse(-60, -10, 140, 50, 0, Math.PI, 0); ctx.fill();
    trackStraight(ctx, -400, 400, 26);
    const off = ((t * 30) % 60) - 30;
    const loco = locoSprite(); ctx.drawImage(loco.c, -150 + off * 0.2, 26 - 238 * 0.55 + 4, 250 * 0.55, 250 * 0.55);
    const wg = wagonSprite(110, "#E8B530", "balls"); ctx.drawImage(wg.c, -10 + off * 0.2, 26 - 160 * 0.55 + 4, 134 * 0.55, 170 * 0.55);
    drawPlate(ctx, "t", 50 + off * 0.2, -36, { size: 46, shadowBlur: 6 });
    ctx.restore();
  }

  Games.register({
    id: 12, key: "t", name: "El tren de paraules", zone: "camp", music: "ragtime", demoTime: 10, captionY: 112, missAt: [800, 512],
    collect: { one: "vagó especial", many: "vagons especials" },
    goal: l => l <= 3 ? "Escriu la lletra de cada vagó que demana la locomotora. Quan el tren estigui complet, prem Retorn per sortir."
      : l === 4 ? "Escriu la síl·laba vagó a vagó. Quan el tren estigui complet, prem Retorn per sortir."
        : "Escriu la paraula vagó a vagó. Compte amb els vagons esquer! Quan el tren estigui complet, prem Retorn.",
    thumb,
    create(api) {
      const L = api.level, GOAL = L === 6 ? 6 : 8;
      const ww = L <= 3 ? 150 : L === 4 ? 140 : L === 5 ? 120 : 96, gap = L === 6 ? 5 : 8, pitch = ww + gap;
      const psz = L <= 3 ? 64 : L === 4 ? 64 : 64;
      const pool = L === 6 ? api.pool({ items: L6_ITEMS.filter(w => w.length <= 11) }) : api.pool({ theme: "tren", filter: L === 5 ? (w => w.length <= 6) : null });
      const letters = L <= 3 ? LETTERS[L] : "abcdefghijlmnoprstuvxz".split("");
      const loco = locoSprite();
      const stOrder = shuffle(STATIONS.map((s, i) => i));
      const bgs = {};
      const bgFor = i => bgs[i] || (bgs[i] = buildBg(STATIONS[i]));
      let stIdx = 0, delivered = 0, phase = "arrive", pt = 0, need = [], idx = 0, display = "word";
      let coupled = [], siding = [], locoX = LOCO_X, depX = 0, puffT = 0, chuffT = 0, shake = 0, travelT = 0, fadeIn = 0, finished = false, special = pick(SPECIAL);
      const spec = special.includes("circ") ? "circ" : special.includes("correus") ? "correus" : "gelats";
      const R = mulberry32(12 + L);
      function slotX(i) { return SLOT0 + pitch * i + pitch / 2; }
      function sidingLayout() { const n = siding.length, total = n * pitch, x0 = Math.max(70, LOOP_X - 40 - total); siding.forEach((w, i) => { w.tx = x0 + pitch * i + pitch / 2; }); }
      function newTrain() {
        if (L <= 3) { const n = 1 + Math.floor(delivered * 3 / GOAL); need = pool.many(n); display = "letters"; }
        else { need = pool.next().split(""); display = "word"; }
        idx = 0; coupled = [];
        const decoys = L <= 3 ? Math.max(2, 4 - need.length) : L === 6 ? 2 : 3;
        const chars = need.slice();
        for (let i = 0; i < decoys; i++) { let c, k = 0; do { c = pick(letters); k++; } while ((need.includes(c) || chars.includes(c)) && k < 40); chars.push(c); }
        siding = shuffle(chars).map((ch, i) => ({ ch, col: WCOLS[(i + delivered) % WCOLS.length], cargo: CARGOS[(i * 7 + delivered * 3) % CARGOS.length], x: 0, tx: 0, drop: -i * 0.07, nudge: 0 }));
        siding.forEach(w => { w.spr = wagonSprite(ww, w.col, w.cargo); });
        sidingLayout(); siding.forEach(w => w.x = w.tx);
        phase = "arrive"; pt = 0; locoX = LOCO_X + 260; depX = 0;
        setTimeout(() => { if (phase === "arrive" || phase === "build") api.sayItem(need.join(""), L <= 3 ? "{x}" : "{x}"); }, api.demo ? 50 : 500);
      }
      newTrain();
      // camí del vagó: via de servei → bucle → via principal
      function pathPos(w, s) {
        const s1 = LOOP_X - w.from, s2 = Math.PI * (LOOP_RX + LOOP_RY) / 2;
        if (s < s1) return { x: w.from + s, y: SIDE_Y - (w.hop ? Math.sin(Math.PI * s / s1) * 120 : 0), sx: 1 };
        if (s < s1 + s2) { const ph = (s - s1) / s2 * Math.PI; return { x: LOOP_X + Math.sin(ph) * LOOP_RX, y: LOOP_CY + Math.cos(ph) * LOOP_RY, sx: Math.max(0.3, Math.abs(Math.cos(ph))) }; }
        return { x: LOOP_X - (s - s1 - s2), y: MAIN_Y, sx: 1 };
      }
      function pathLen(w) { return (LOOP_X - w.from) + Math.PI * (LOOP_RX + LOOP_RY) / 2 + (LOOP_X - w.to); }
      function depart() {
        phase = "depart"; pt = 0; snd.whistle(); void 0;
      }
      function drawWagonAt(ctx, w, x, y, sx = 1, plate = true, alpha = 1) {
        ctx.save(); if (alpha < 1) ctx.globalAlpha *= alpha;
        ctx.translate(x, y); ctx.scale(sx, 1); ctx.drawImage(w.spr.c, -(ww + 24) / 2, -160, ww + 24, 170); ctx.restore();
        if (plate && w.ch) drawPlate(ctx, w.ch, x, y - 80, { size: psz, alpha, state: w.state, shadowBlur: 6, shadowY: 3 });
      }
      return {
        expected() { return phase === "build" || (phase === "arrive" && pt > 0.5) ? need[idx] : phase === "ready" && !api.demo ? "Enter" : null; },
        onKey(k) {
          if (phase === "ready") { if (k === "Enter") depart(); else if (k.length === 1) { snd.toot(); shake = 0.4; } return; }
          if (!(phase === "build" || (phase === "arrive" && pt > 0.5)) || k.length !== 1) return;
          if (phase === "arrive") phase = "build";
          const ch = need[idx];
          if (k === ch) {
            let best = null; for (const w of siding) if (w.ch === k && (!best || w.x > best.x)) best = w;
            if (!best) { best = { ch: k, col: WCOLS[idx % 6], cargo: CARGOS[idx % 6], x: 100, tx: 100 }; best.spr = wagonSprite(ww, best.col, best.cargo); }
            best.hop = siding.some(q => q !== best && q.x > best.x);
            siding.splice(siding.indexOf(best), 1); sidingLayout();
            best.from = best.x; best.to = slotX(idx); best.s = 0; best.len = pathLen(best); best.dur = 0.55 + best.len / (1500 * api.speed); best.t = 0; best.arrived = false; best.state = null;
            coupled.push(best); idx++;
            api.hit({ sfx: "wood" }); snd.roll();
            if (idx >= need.length) { phase = "ready"; pt = 0; setTimeout(() => { if (phase === "ready") api.say("Prem Retorn i el tren sortirà!"); }, 900); }
          } else {
            api.miss(ch, k, { sfx: "thud" });
            const w = siding.find(q => q.ch === k); if (w) w.nudge = 1; else shake = 0.5;
          }
        },
        update(dt) {
          pt += dt; shake = Math.max(0, shake - dt);
          // fum de la xemeneia
          puffT -= dt;
          const chim = [locoX + depX + 73, MAIN_Y - 196];
          if (phase !== "travel" && puffT <= 0) { puffT = phase === "depart" ? 0.12 : 1.1; api.particles.emit(chim[0], chim[1], { count: phase === "depart" ? 2 : 3, color: ["rgba(255,255,255,0.9)", "rgba(240,240,240,0.85)"], speed: 40, gravity: -50, size: 30, life: 1.4, drag: 0.95, angle: -Math.PI / 2, spread: 0.6 }); }
          if (phase === "arrive") { locoX = LOCO_X + 260 * Math.pow(1 - Ease.outCubic(clamp(pt / 1.1, 0, 1)), 1); if (pt > 1.1) { locoX = LOCO_X; if (pt > 1.15) phase = "build"; } }
          siding.forEach(w => { w.x = lerp(w.x, w.tx, clamp(dt * 6, 0, 1)); w.drop = Math.min(1, w.drop + dt * 2.5); w.nudge = Math.max(0, w.nudge - dt * 1.6); });
          coupled.forEach(w => {
            if (w.arrived) return;
            w.t += dt / w.dur; const k = clamp(w.t, 0, 1);
            w.s = w.len * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
            if (k >= 1) { w.arrived = true; w.state = "ok"; w.okT = 1; Sfx.play("clack"); api.particles.emit(w.to - ww / 2 - 4, MAIN_Y - 28, { count: 8, color: ["#FFE08A", "#fff"], speed: 160, gravity: 300, size: 6, life: 0.45, shape: "star" }); }
          });
          coupled.forEach(w => { if (w.okT > 0) { w.okT -= dt; if (w.okT <= 0) w.state = null; } });
          if (phase === "ready" && api.demo && pt > 1.3) depart();
          if (phase === "depart") {
            const allIn = coupled.every(w => w.arrived);
            if (!allIn) pt = 0;
            chuffT -= dt; if (chuffT <= 0) { chuffT = Math.max(0.12, 0.42 - pt * 0.2); snd.chuff(); }
            depX = -Math.pow(pt, 2.2) * 520;
            if (pt > 2.0) { phase = "travel"; travelT = 0; Sfx.play("whoosh"); }
          }
          if (phase === "travel") {
            travelT += dt;
            chuffT -= dt; if (chuffT <= 0) { chuffT = 0.16; snd.chuff(0.08); }
            const dur = api.demo ? 3.2 : 4.4;
            if (travelT > dur) {
              delivered++; api.hud.progress = [delivered, GOAL]; Sfx.play("bell", { note: 79 });
              if (delivered >= GOAL) { phase = "end"; pt = 0; stIdx++; fadeIn = 1; siding = []; depX = 0; locoX = LOCO_X + 260; coupled = [{ ch: "", spr: wagonSprite(ww, spec === "circ" ? "#E0553A" : spec === "correus" ? "#E8B530" : "#F7A8C0", spec === "gelats" ? "cones" : spec === "correus" ? "crates" : "balls", spec), to: slotX(0), arrived: true }]; Sfx.play("crowd"); api.say("Totes les mercaderies entregades!"); }
              else { stIdx++; fadeIn = 1; newTrain(); }
            }
          }
          if (phase === "end") {
            if (pt < 2.2 && Math.random() < 0.5) api.particles.emit(rand(100, 1500), -10, { count: 2, color: ["#E0553A", "#F2B630", "#3C86C8", "#4FA85A", "#fff"], speed: 120, gravity: 260, size: 14, life: 2.2, shape: "confetti", drag: 0.97 });
            locoX = LOCO_X + 260 * Math.pow(1 - Ease.outCubic(clamp(pt / 1.1, 0, 1)), 1);
            if (pt > 3 && !finished) { finished = true; api.finish(true, { collectName: special }); }
          }
          fadeIn = Math.max(0, fadeIn - dt * 2.2);
          api.hud.progress = [delivered, GOAL];
        },
        drawPlatform(ctx) {
          const st = stOrder[stIdx % STATIONS.length];
          ctx.drawImage(bgFor(st), 0, 0);
          const lx = locoX + depX + (shake > 0 ? Math.sin(shake * 60) * 3 : 0);
          // via de servei
          siding.forEach(w => { const d = Ease.outBack(clamp(w.drop, 0, 1)), nx = Math.sin(w.nudge * Math.PI) * 26; drawWagonAt(ctx, w, w.x + nx, SIDE_Y - (1 - d) * 40, 1, true, clamp(w.drop * 2 + 0.3, 0, 1)); });
          // vagons en camí pel bucle (els que són a la via principal, ordenats)
          const moving = coupled.filter(w => !w.arrived);
          moving.forEach(w => { const p = pathPos(w, w.s); if (p.y < MAIN_Y + 4) return; drawWagonAt(ctx, w, p.x, p.y, p.sx, true); });
          // tren: locomotora + vagons enganxats
          ctx.drawImage(loco.c, lx - 8, MAIN_Y - 238 + 4, 250, 250);
          coupled.forEach(w => { if (!w.arrived) return; drawWagonAt(ctx, w, (phase === "end" ? lx - LOCO_X : 0) + w.to + depX, MAIN_Y + 4, 1, true); });
          moving.forEach(w => { const p = pathPos(w, w.s); if (p.y >= MAIN_Y + 4) return; drawWagonAt(ctx, w, p.x, p.y + 4, p.sx, true); });
          // cartell de la locomotora: què volem formar
          if (phase === "arrive" || phase === "build" || phase === "ready") {
            const a = phase === "arrive" ? clamp((pt - 0.6) * 3, 0, 1) : 1, cy = 160;
            ctx.save(); ctx.globalAlpha = a;
            if (display === "letters") {
              const pw = plateSize(ctx, "m", 64).w, tot = need.length * pw + (need.length - 1) * 12, x0 = Math.max(24, lx + 128 - tot / 2);
              ctx.fillStyle = "#9A6A30"; ctx.fillRect(lx + 104, cy + 30, 8, 42); ctx.fillRect(lx + 196, cy + 30, 8, 60);
              need.forEach((c, i) => drawPlate(ctx, c, x0 + pw / 2 + i * (pw + 12), cy, { size: 64, state: i < idx ? "ok" : i === idx ? "active" : null }));
            } else {
              const str = need.join(""), pw = plateSize(ctx, str, 56).w, cx = Math.max(24 + pw / 2, lx + 128);
              ctx.fillStyle = "#9A6A30"; ctx.fillRect(lx + 104, cy + 30, 8, 42); ctx.fillRect(lx + 196, cy + 30, 8, 60);
              drawPlate(ctx, str, cx, cy, { size: 56, progress: idx, state: idx >= need.length ? "ok" : "active" });
            }
            ctx.restore();
          }
          if (phase === "ready") {
            const b = Math.sin(pt * 3) * 4, x = 830, y = 296 + b;
            ctx.save(); ctx.globalAlpha = clamp(pt * 3, 0, 1);
            drawPanel(ctx, x - 230, y - 44, 460, 88, { r: 44, blur: 18 });
            drawKeyHint(ctx, x, y, "Retorn", "El tren surt!", { ks: 58, fs: 34, theme: "petroli" });
            ctx.restore();
          }
          if (phase === "end") {
            const k = Ease.outBack(clamp(pt / 0.6, 0, 1));
            ctx.save(); ctx.translate(800, 510); ctx.scale(k, k);
            drawPanel(ctx, -330, -60, 660, 120, { r: 36 });
            text(ctx, "Totes les estacions servides!", 0, 2, { size: 38, weight: 900, font: FONT_T, color: BRAND.petroli });
            ctx.restore();
          }
        },
        drawTravel(ctx) {
          const T = travelT, speed = 720, sc = T * speed;
          ctx.drawImage(travelLayers().c, 0, 0, W, H);
          const tile = (spr, f, y, hgt) => { const o = ((sc * f) % 1600 + 1600) % 1600; ctx.drawImage(spr.c, o - 1600, y, 1600, hgt); ctx.drawImage(spr.c, o, y, 1600, hgt); };
          const travelArt=Art.get("train-travel");
          if(travelArt){ctx.drawImage(travelArt,-80+Math.sin(T*.35)*70,-30,W+160,H+60);}else{
          ctx.fillStyle = "#FFFFFF"; for (let i = 0; i < 6; i++) { const px = ((i * 330 + sc * 0.05 + T * 12) % 1980) - 190, py = 120 + (i % 3) * 50, r = 60 + (i % 2) * 24; ctx.beginPath(); ctx.arc(px, py, r * 0.5, 0, 6.28); ctx.arc(px + r * 0.55, py + 8, r * 0.4, 0, 6.28); ctx.arc(px - r * 0.55, py + 10, r * 0.36, 0, 6.28); ctx.fill(); }
          tile(stripFar(), 0.12, 180, 360); tile(stripMid(), 0.4, 300, 300);
          // terra
          ctx.fillStyle = "#7DB46A"; ctx.fillRect(0, 560, W, 340);
          ctx.fillStyle = "#6CA85A"; for (let i = -1; i < 18; i++) { const px = ((i * 120 + sc) % 2160 + 2160) % 2160 - 280; ctx.beginPath(); ctx.ellipse(px, 700 + (i % 3) * 50, 60, 12, 0, 0, 6.28); ctx.fill(); }
          }
          // riu i pont
          const bx = -900 + sc;
          if (!travelArt && bx > -700 && bx < 2300) {
            ctx.fillStyle = "#4F9CC8"; ctx.beginPath(); ctx.moveTo(bx - 260, 900); ctx.quadraticCurveTo(bx - 120, 700, bx - 180, 600); ctx.lineTo(bx + 180, 600); ctx.quadraticCurveTo(bx + 120, 700, bx + 260, 900); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 5; i++) ctx.fillRect(bx - 90 + i * 40 + Math.sin(T * 3 + i) * 8, 640 + i * 46, 46, 4);
            ctx.fillStyle = "#C9A16A"; ctx.fillRect(bx - 230, 540, 460, 26);
            ctx.fillStyle = "#B98A50"; for (let i = 0; i < 3; i++) { const ax = bx - 150 + i * 150; ctx.beginPath(); ctx.moveTo(ax - 75, 566); ctx.lineTo(ax - 75, 700); ctx.lineTo(ax - 52, 700); ctx.quadraticCurveTo(ax, 590, ax + 52, 700); ctx.lineTo(ax + 75, 700); ctx.lineTo(ax + 75, 566); ctx.fill(); }
          }
          trackStraight(ctx, -10, W + 10, 566);
          // tren petit (sense lletres)
          const s = 0.62, tx = 420, bob = Math.sin(T * 18) * 1.2, n = Math.max(1, need.length);
          const drawTrain = () => {
            ctx.drawImage(loco.c, tx, 566 - 238 * s + 2 + bob, 250 * s, 250 * s);
            for (let i = 0; i < n; i++) { const w = coupled[i] || coupled[0]; if (!w) break; const cx = tx + (LOCO_W + 6) * s + (pitch * i + pitch / 2) * s; ctx.drawImage(w.spr.c, cx - (ww + 24) * s / 2, 566 - 160 * s + 2 + Math.sin(T * 18 + i) * 1.2, (ww + 24) * s, 170 * s); ctx.fillStyle = BRAND.crema; rr(ctx, cx - 26 * s, 566 - 108 * s, 52 * s, 48 * s, 8); ctx.fill(); }
          };
          drawTrain();
          if (Math.random() < 0.3) api.particles.emit(tx + 45, 566 - 196 * s, { count: 1, color: ["rgba(255,255,255,0.85)"], speed: 30, gravity: -40, size: 26, life: 1.2, angle: 0, spread: 0.4, drag: 0.96 });
          // túnel: la muntanya tapa el tren
          const mx = -2300 + sc;
          if (!travelArt && mx > -900 && mx < 2600) {
            ctx.fillStyle = "#8AA27A"; ctx.beginPath(); ctx.moveTo(mx - 420, 610); ctx.quadraticCurveTo(mx - 260, 180, mx, 170); ctx.quadraticCurveTo(mx + 260, 180, mx + 420, 610); ctx.fill();
            ctx.fillStyle = "#7A9270"; ctx.beginPath(); ctx.moveTo(mx - 300, 610); ctx.quadraticCurveTo(mx - 150, 330, mx + 40, 320); ctx.quadraticCurveTo(mx + 200, 360, mx + 300, 610); ctx.fill();
            ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.moveTo(mx - 70, 210); ctx.quadraticCurveTo(mx, 160, mx + 70, 210); ctx.quadraticCurveTo(mx, 196, mx - 70, 210); ctx.fill();
            for (const px of [mx - 300, mx + 300]) { ctx.fillStyle = "#B9AFA0"; ctx.beginPath(); ctx.moveTo(px - 70, 610); ctx.lineTo(px - 70, 440); ctx.quadraticCurveTo(px, 400, px + 70, 440); ctx.lineTo(px + 70, 610); ctx.fill(); ctx.fillStyle = "#2A2420"; ctx.beginPath(); ctx.moveTo(px - 46, 590); ctx.lineTo(px - 46, 470); ctx.quadraticCurveTo(px, 440, px + 46, 470); ctx.lineTo(px + 46, 590); ctx.fill(); }
          }
          if(!travelArt)tile(stripFg(), 1.5, 760, 160);
          // cartell de l'estació següent
          const dur = api.demo ? 3.2 : 4.4, nxt = STATIONS[stOrder[(stIdx + 1) % STATIONS.length]];
          const k = clamp((T - (dur - 1.6)) / 0.5, 0, 1);
          if (k > 0) { ctx.save(); ctx.globalAlpha = k; ctx.translate(800, 160 - (1 - Ease.outBack(k)) * 60); drawPanel(ctx, -280, -42, 560, 84, { r: 42, blur: 16 }); text(ctx, "Arribem a: " + nxt.name.replace("Estació ", "l'estació "), 0, 2, { size: 30, weight: 900, font: FONT_T, color: BRAND.tinta }); ctx.restore(); }
        },
        draw(ctx) {
          if (phase === "travel") this.drawTravel(ctx);
          else { this.drawPlatform(ctx); if (fadeIn > 0) { ctx.save(); ctx.globalAlpha = Ease.inOutQuad(fadeIn); this.drawTravel(ctx); ctx.restore(); } }
          drawVignette(ctx, 0.22, "40,25,10");
        },
      };
    },
  });
})();
