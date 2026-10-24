"use strict";
/* 16. El laberint del tresor — mapa de pirates en paper kraft, tinta i ceres; l'explorador porta una torxa */
(() => {
  const INK = "#3A2614", RED = "#C2302A";
  const COLS = 6, ROWS = 4, X0 = 330, DX = 186, Y0 = 250, DY = 150;
  /* llocs del mapa: paraula (nivell 5) i pistes (nivell 6, dues formes amb inicial diferent) */
  const MARKS = LXM("g16.marks", {
    cova: { w: "cova", p: ["entra a la cova", "per la cova"] },
    pont: { w: "pont", p: ["passa pel pont", "creua el pont"] },
    far: { w: "far", p: ["cap al far", "fins al far"] },
    bosc: { w: "bosc", p: ["travessa el bosc", "dins del bosc"] },
    llac: { w: "llac", p: ["vora el llac", "rodeja el llac"] },
    torre: { w: "torre", p: ["fins a la torre", "puja a la torre"] },
    palmera: { w: "palmera", p: ["sota la palmera", "a la palmera"] },
    volcà: { w: "foc", p: ["mira el volcà", "puja al volcà"] },
    mina: { w: "mina", p: ["baixa a la mina", "dins la mina"] },
    roca: { w: "roca", p: ["rodeja la roca", "salta la roca"] },
  });
  const MARK_IDS = Object.keys(MARKS);
  const TREASURES = [["corona", "una corona d'or"], ["moneda", "una moneda antiga"], ["bruixola", "una brúixola daurada"], ["calze", "un calze d'or"], ["collaret", "un collaret de perles"]];

  /* ---------- dibuixos de tinta ---------- */
  function inkPalm(x, px, py, s) {
    if(Art.tanda4Sprite(x,0,px,py,90*s,90*s))return;
    x.save(); x.translate(px, py); x.scale(s, s); x.lineCap = "round"; x.lineJoin = "round";
    x.strokeStyle = INK; x.lineWidth = 2.2; x.fillStyle = "rgba(120,90,50,0.5)";
    x.beginPath(); x.moveTo(-4, 0); x.quadraticCurveTo(2, -20, 6, -42); x.lineTo(10, -42); x.quadraticCurveTo(7, -20, 4, 0); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = "rgba(70,120,50,0.75)";
    for (const a of [-2.6, -2.0, -1.2, -0.5, 0.1]) { x.beginPath(); x.moveTo(8, -42); x.quadraticCurveTo(8 + Math.cos(a - 0.3) * 18, -42 + Math.sin(a - 0.3) * 18 - 6, 8 + Math.cos(a) * 30, -42 + Math.sin(a) * 30 + 6); x.quadraticCurveTo(8 + Math.cos(a) * 14, -42 + Math.sin(a) * 14, 8, -42); x.fill(); x.stroke(); }
    x.restore();
  }
  function inkMountain(x, px, py, s) {
    if(Art.tanda4Sprite(x,1,px,py,90*s,90*s))return;
    x.save(); x.translate(px, py); x.scale(s, s); x.strokeStyle = INK; x.lineWidth = 2.2; x.lineJoin = "round";
    x.fillStyle = "rgba(140,110,70,0.45)"; x.beginPath(); x.moveTo(-34, 0); x.lineTo(-6, -46); x.lineTo(4, -34); x.lineTo(12, -40); x.lineTo(36, 0); x.closePath(); x.fill(); x.stroke();
    x.lineWidth = 1.2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(-2 + i * 5, -36 + i * 6); x.lineTo(4 + i * 5, -30 + i * 6 + 8); x.stroke(); }
    x.restore();
  }
  function inkTree(x, px, py, s) {
    if(Art.tanda4Sprite(x,2,px,py,90*s,90*s))return;
    x.save(); x.translate(px, py); x.scale(s, s); x.strokeStyle = INK; x.lineWidth = 2;
    x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -14); x.stroke();
    x.fillStyle = "rgba(80,120,60,0.6)"; x.beginPath(); x.arc(0, -24, 13, 0, 6.28); x.fill(); x.stroke();
    x.restore();
  }
  function drawMark(x, id, px, py) {
    const idx = ["cova","pont","far","bosc","llac","torre","palmera","volcà","mina","roca"].indexOf(id);
    const im = idx >= 0 && Art.cell("maze-marks",idx,5,2,90,90);
    if(im){x.drawImage(im,px-45,py-65,90,90);return;}
    x.save(); x.translate(px, py); x.strokeStyle = INK; x.lineWidth = 2.4; x.lineCap = x.lineJoin = "round";
    const fillS = (c) => { x.fillStyle = c; x.fill(); x.stroke(); };
    if (id === "cova") { x.beginPath(); x.moveTo(-40, 14); x.quadraticCurveTo(-34, -30, 0, -34); x.quadraticCurveTo(34, -30, 40, 14); x.closePath(); fillS("rgba(130,105,70,0.6)"); x.beginPath(); x.moveTo(-16, 14); x.quadraticCurveTo(-14, -12, 0, -14); x.quadraticCurveTo(14, -12, 16, 14); x.closePath(); fillS("rgba(30,20,10,0.85)"); }
    else if (id === "pont") { x.strokeStyle = "rgba(40,100,160,0.55)"; x.lineWidth = 14; x.beginPath(); x.moveTo(-6, -40); x.quadraticCurveTo(6, 0, -6, 40); x.stroke(); x.strokeStyle = INK; x.lineWidth = 2.4; x.fillStyle = "rgba(160,110,60,0.8)"; x.fillRect(-30, -8, 60, 16); x.strokeRect(-30, -8, 60, 16); for (let i = -24; i <= 24; i += 8) { x.beginPath(); x.moveTo(i, -8); x.lineTo(i, 8); x.stroke(); } }
    else if (id === "far") { x.beginPath(); x.moveTo(-12, 20); x.lineTo(-7, -26); x.lineTo(7, -26); x.lineTo(12, 20); x.closePath(); fillS("#EDE3CF"); x.fillStyle = "rgba(194,48,42,0.85)"; x.fillRect(-10, -6, 20, 8); x.fillRect(-11.5, 8, 23, 7); x.beginPath(); x.rect(-9, -38, 18, 12); fillS("rgba(250,210,90,0.9)"); x.beginPath(); x.moveTo(-11, -38); x.lineTo(0, -48); x.lineTo(11, -38); x.closePath(); fillS("rgba(194,48,42,0.9)"); }
    else if (id === "bosc") { inkTree(x, -18, 14, 1); inkTree(x, 14, 16, 1.1); inkTree(x, -2, 2, 1.2); }
    else if (id === "llac") { x.beginPath(); x.ellipse(0, 0, 40, 22, 0.1, 0, 6.28); fillS("rgba(60,130,190,0.55)"); x.strokeStyle = "rgba(255,255,255,0.7)"; x.lineWidth = 1.6; for (const yy of [-6, 6]) { x.beginPath(); x.moveTo(-14, yy); x.quadraticCurveTo(-7, yy - 4, 0, yy); x.quadraticCurveTo(7, yy + 4, 14, yy); x.stroke(); } }
    else if (id === "torre") { x.beginPath(); x.rect(-14, -30, 28, 50); fillS("rgba(170,150,120,0.8)"); x.beginPath(); for (let i = -14; i < 14; i += 7) x.rect(i, -38, 5, 8); fillS("rgba(170,150,120,0.8)"); x.beginPath(); x.moveTo(-5, 20); x.lineTo(-5, 8); x.arc(0, 8, 5, Math.PI, 0); x.lineTo(5, 20); fillS("rgba(40,25,10,0.8)"); x.beginPath(); x.moveTo(0, -38); x.lineTo(0, -58); x.stroke(); x.beginPath(); x.moveTo(0, -58); x.lineTo(16, -53); x.lineTo(0, -48); fillS("rgba(194,48,42,0.9)"); }
    else if (id === "palmera") { inkPalm(x, -4, 20, 1.2); }
    else if (id === "volcà") { x.beginPath(); x.moveTo(-40, 18); x.lineTo(-12, -24); x.lineTo(12, -24); x.lineTo(40, 18); x.closePath(); fillS("rgba(120,90,70,0.7)"); x.beginPath(); x.moveTo(-12, -24); x.quadraticCurveTo(-6, -10, -10, 0); x.lineTo(-4, -4); x.quadraticCurveTo(0, -16, 12, -24); x.closePath(); fillS("rgba(220,80,40,0.85)"); x.fillStyle = "rgba(90,80,80,0.5)"; for (const [cx, cy, r] of [[0, -34, 8], [8, -46, 10], [-4, -58, 12]]) { x.beginPath(); x.arc(cx, cy, r, 0, 6.28); x.fill(); } }
    else if (id === "mina") { x.beginPath(); x.moveTo(-26, 18); x.lineTo(-26, -16); x.lineTo(26, -16); x.lineTo(26, 18); fillS("rgba(120,80,40,0.7)"); x.beginPath(); x.rect(-16, -6, 32, 24); fillS("rgba(25,15,5,0.9)"); x.beginPath(); x.moveTo(-30, -16); x.lineTo(30, -16); x.lineWidth = 5; x.stroke(); x.lineWidth = 2; x.beginPath(); x.moveTo(-8, 30); x.lineTo(-30, 30); x.moveTo(8, 30); x.lineTo(30, 30); x.stroke(); }
    else if (id === "roca") { x.beginPath(); x.moveTo(-30, 16); x.lineTo(-26, -10); x.lineTo(-8, -26); x.lineTo(14, -22); x.lineTo(30, -2); x.lineTo(28, 16); x.closePath(); fillS("rgba(130,120,110,0.75)"); x.lineWidth = 1.3; x.beginPath(); x.moveTo(-8, -26); x.lineTo(-4, 4); x.lineTo(14, -22); x.moveTo(-4, 4); x.lineTo(-26, 10); x.stroke(); }
    x.restore();
  }
  function drawKey(ctx, x, y, s, t) {
    if(Art.tanda4Sprite(ctx,5,x,y+26*s,58*s,68*s))return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.5 + Math.sin(t * 2) * 0.1);
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#7A5208";
    const g = ctx.createLinearGradient(-20, -10, 20, 10); g.addColorStop(0, "#FFE48A"); g.addColorStop(0.5, "#E8B030"); g.addColorStop(1, "#B47A10"); ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(-16, 0, 11, 0, 6.28); ctx.arc(-16, 0, 5, 0, 6.28, true); ctx.fill("evenodd"); ctx.stroke();
    ctx.beginPath(); ctx.rect(-6, -3.5, 30, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.rect(14, 3, 5, 8); ctx.rect(22, 3, 4, 6); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function glowSprite(col) {
    return Sprites.get("g16glow" + col, 200, 200, (x, w, h) => { const g = x.createRadialGradient(100, 100, 0, 100, 100, 100); g.addColorStop(0, rgba(col, 0.75)); g.addColorStop(0.35, rgba(col, 0.28)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  }
  function drawChest(ctx, x, y, open, t) {
    if(Art.tanda4Sprite(ctx,open>0.5?7:6,x,y+28,115,100))return;
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "rgba(30,15,5,0.3)"; ctx.beginPath(); ctx.ellipse(0, 26, 46, 10, 0, 0, 6.28); ctx.fill();
    const wood = "#8A5428";
    ctx.lineWidth = 2.5; ctx.strokeStyle = "#3A1E0C";
    ctx.fillStyle = wood; rr(ctx, -40, -8, 80, 34, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#E8B030"; ctx.fillRect(-30, -8, 8, 34); ctx.fillRect(22, -8, 8, 34); ctx.strokeRect(-30, -8, 8, 34); ctx.strokeRect(22, -8, 8, 34);
    if (open > 0) {
      const g = ctx.createRadialGradient(0, -10, 2, 0, -10, 60); g.addColorStop(0, "rgba(255,240,180,1)"); g.addColorStop(1, "rgba(255,200,80,0)"); ctx.fillStyle = g; ctx.fillRect(-60, -70, 120, 80);
      ctx.fillStyle = "#F2C230"; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-26 + i * 9, -8 - (i % 2) * 4, 7, 4, 0, 0, 6.28); ctx.fill(); }
    }
    ctx.save(); ctx.translate(0, -8); ctx.scale(1, 1 - open * 1.8);
    ctx.fillStyle = shade(wood, 0.12); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-40, -14); ctx.quadraticCurveTo(0, -34, 40, -14); ctx.lineTo(40, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#E8B030"; ctx.fillRect(-30, -24, 8, 24); ctx.fillRect(22, -24, 8, 24);
    ctx.restore();
    if (open <= 0) { ctx.fillStyle = "#E8B030"; rr(ctx, -8, -14, 16, 18, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#3A1E0C"; ctx.beginPath(); ctx.arc(0, -7, 2.6, 0, 6.28); ctx.fill(); ctx.fillRect(-1.2, -7, 2.4, 7); }
    ctx.restore();
  }
  function drawTreasure(ctx, kind, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 3; ctx.strokeStyle = "#7A5208"; ctx.lineJoin = "round";
    const gold = ctx.createLinearGradient(-30, -30, 30, 30); gold.addColorStop(0, "#FFE9A0"); gold.addColorStop(0.5, "#F2B830"); gold.addColorStop(1, "#C08010"); ctx.fillStyle = gold;
    if (kind === "corona") { ctx.beginPath(); ctx.moveTo(-34, 18); ctx.lineTo(-38, -16); ctx.lineTo(-18, 2); ctx.lineTo(0, -26); ctx.lineTo(18, 2); ctx.lineTo(38, -16); ctx.lineTo(34, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); [["#D8352A", -18], ["#2E7AD8", 0], ["#2EA05A", 18]].forEach(([c, gx]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(gx, 9, 5, 0, 6.28); ctx.fill(); }); }
    else if (kind === "moneda") { ctx.beginPath(); ctx.arc(0, 0, 30, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.28); ctx.stroke(); ctx.fillStyle = "#B47A10"; starPath(ctx, 0, 0, 13, 6, 5); ctx.fill(); }
    else if (kind === "bruixola") { ctx.beginPath(); ctx.arc(0, 0, 30, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#FBF3DC"; ctx.beginPath(); ctx.arc(0, 0, 23, 0, 6.28); ctx.fill(); ctx.fillStyle = "#C2302A"; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.fill(); ctx.fillStyle = "#3A2614"; ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(6, 0); ctx.lineTo(-6, 0); ctx.fill(); }
    else if (kind === "calze") { ctx.beginPath(); ctx.moveTo(-24, -26); ctx.lineTo(24, -26); ctx.quadraticCurveTo(22, 4, 5, 8); ctx.lineTo(5, 20); ctx.lineTo(16, 28); ctx.lineTo(-16, 28); ctx.lineTo(-5, 20); ctx.lineTo(-5, 8); ctx.quadraticCurveTo(-22, 4, -24, -26); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#D8352A"; ctx.beginPath(); ctx.arc(0, -12, 5, 0, 6.28); ctx.fill(); }
    else { ctx.lineWidth = 2; for (let i = 0; i < 11; i++) { const a = 0.3 + i / 10 * (Math.PI - 0.6); ctx.fillStyle = "#F8F4EC"; ctx.beginPath(); ctx.arc(Math.cos(a) * 30, Math.sin(a) * 24 - 10, 6, 0, 6.28); ctx.fill(); ctx.strokeStyle = "rgba(120,110,100,0.6)"; ctx.stroke(); } }
    ctx.restore();
  }
  /* explorador 2.5D amb torxa */
  function drawExplorer(ctx, x, y, t, o = {}) {
    const ss=o.s||1.25,bb=Settings.reduceMotion?0:(o.walk?Math.abs(Math.sin(t*11))*3:Math.sin(t*2));
    if(Art.tanda4Sprite(ctx,4,x,y-bb,75*ss,95*ss,(o.face||1)<0))return;
    const walk = o.walk ? t * 11 : 0, bob = o.walk ? Math.abs(Math.sin(walk)) * 4 : Math.sin(t * 2) * 1.2;
    ctx.save(); ctx.translate(x, y); ctx.scale(o.s || 1.25, o.s || 1.25);
    ctx.fillStyle = "rgba(30,15,5,0.35)"; ctx.beginPath(); ctx.ellipse(0, 4, 26, 8, 0, 0, 6.28); ctx.fill();
    ctx.scale(o.face || 1, 1); ctx.translate(0, -bob);
    // cames
    ctx.fillStyle = "#5A3E26"; for (const [sx, ph] of [[-8, 0], [8, Math.PI]]) { const sw = o.walk ? Math.sin(walk + ph) * 7 : 0; rr(ctx, sx - 5 + sw * 0.4, -18, 10, 18, 4); ctx.fill(); ctx.fillStyle = "#3A2614"; rr(ctx, sx - 6 + sw * 0.6, -4, 13, 6, 3); ctx.fill(); ctx.fillStyle = "#5A3E26"; }
    // motxilla
    ctx.fillStyle = "#7A4E2A"; rr(ctx, -24, -50, 16, 28, 5); ctx.fill(); ctx.strokeStyle = "#3A2614"; ctx.lineWidth = 1.6; ctx.stroke();
    // cos
    ctx.fillStyle = "#C8A060"; rr(ctx, -15, -54, 30, 38, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#6A4426"; ctx.fillRect(-15, -26, 30, 5);
    // braç i torxa
    const raise = o.think ? 0.3 : 0;
    ctx.save(); ctx.translate(12, -46); ctx.rotate(-0.6 - raise + (o.walk ? Math.sin(walk) * 0.08 : 0));
    ctx.fillStyle = "#C8A060"; rr(ctx, -4, -4, 22, 9, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#E8C49A"; ctx.beginPath(); ctx.arc(19, 0, 5, 0, 6.28); ctx.fill();
    ctx.restore();
    const tx = 12 + Math.cos(-0.6 - raise) * 19, ty = -46 + Math.sin(-0.6 - raise) * 19;
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(0.25);
    ctx.fillStyle = "#6A4426"; ctx.fillRect(-3, -26, 6, 34); ctx.fillStyle = "#3A2614"; ctx.fillRect(-4.5, -30, 9, 7);
    const fl = 1 + Math.sin(t * 9) * 0.06 + Math.sin(t * 13.7) * 0.04;
    ctx.translate(0, -32); ctx.scale(1, fl);
    ctx.fillStyle = "rgba(255,150,40,0.9)"; ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(13, -10, 9, 2); ctx.quadraticCurveTo(0, 8, -9, 2); ctx.quadraticCurveTo(-13, -10, 0, -30); ctx.fill();
    ctx.fillStyle = "rgba(255,225,120,0.95)"; ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(7, -6, 5, 1); ctx.quadraticCurveTo(0, 5, -5, 1); ctx.quadraticCurveTo(-7, -6, 0, -18); ctx.fill();
    ctx.restore();
    // cap amb salacot
    ctx.fillStyle = "#EBC398"; ctx.beginPath(); ctx.arc(2, -68, 14, 0, 6.28); ctx.fill(); ctx.stroke();
    const look = o.think ? Math.sin(t * 2.2) * 3 : 2;
    ctx.fillStyle = "#2A1A10"; ctx.beginPath(); ctx.arc(5 + look, -69, 2.2, 0, 6.28); ctx.arc(11 + look * 0.6, -69, 2, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#7A3A2A"; ctx.lineWidth = 1.6; ctx.beginPath(); if (o.think) { ctx.moveTo(4, -61); ctx.lineTo(11, -62); } else ctx.arc(8, -63, 4, 0.2, 2.6); ctx.stroke();
    ctx.fillStyle = "#E6D2A0"; ctx.strokeStyle = "#3A2614"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(2, -74, 22, 6, 0, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(2, -76, 14, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8A5A2A"; ctx.fillRect(-12, -79, 28, 3);
    ctx.restore();
  }
  function signBoard(w, h) {
    return Sprites.get(`g16board${w | 0}x${h | 0}`, w + 16, h + 16, (x) => {
      x.save(); x.shadowColor = "rgba(30,15,5,0.45)"; x.shadowBlur = 8; x.shadowOffsetY = 4; rr(x, 8, 8, w, h, 8); x.fillStyle = "#9A6A3A"; x.fill(); x.restore();
      x.save(); rr(x, 8, 8, w, h, 8); x.clip(); x.drawImage(Tex.wood(256, 128, "#B07A44", { seed: 16 }), 8, 8, w, h); x.restore();
      x.strokeStyle = "#5A3618"; x.lineWidth = 2.5; rr(x, 9, 9, w - 2, h - 2, 7); x.stroke();
      x.fillStyle = "#4A3020"; for (const [px, py] of [[16, 16], [w, 16], [16, h], [w, h]]) { x.beginPath(); x.arc(px, py, 2.6, 0, 6.28); x.fill(); }
    });
  }

  /* ---------- graf del laberint ---------- */
  function buildMaze(L) {
    const R = Math.random, nodes = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) nodes.push({ i: nodes.length, c, r, x: X0 + c * DX + rand(-24, 24), y: Y0 + r * DY + rand(-18, 18), nb: [] });
    const id = (c, r) => r * COLS + c, edges = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { if (c < COLS - 1) edges.push([id(c, r), id(c + 1, r)]); if (r < ROWS - 1) edges.push([id(c, r), id(c, r + 1)]); }
    const adj = new Map(nodes.map(n => [n.i, new Set()])); edges.forEach(([a, b]) => { adj.get(a).add(b); adj.get(b).add(a); });
    const connected = () => { const seen = new Set([0]), q = [0]; while (q.length) { const n = q.shift(); adj.get(n).forEach(m => { if (!seen.has(m)) { seen.add(m); q.push(m); } }); } return seen.size === nodes.length; };
    const removeN = Math.round(edges.length * (L <= 3 ? 0.28 : L === 4 ? 0.14 : L === 5 ? 0.04 : 0.22));
    let removed = 0;
    for (const [a, b] of shuffle(edges)) {
      if (removed >= removeN) break;
      if (adj.get(a).size <= 2 || adj.get(b).size <= 2) continue;
      adj.get(a).delete(b); adj.get(b).delete(a);
      if (!connected()) { adj.get(a).add(b); adj.get(b).add(a); continue; }
      removed++;
    }
    const E = [];
    adj.forEach((s, a) => s.forEach(b => { if (a < b) { const A = nodes[a], B = nodes[b], mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, dx = B.x - A.x, dy = B.y - A.y, dl = Math.hypot(dx, dy); const off = rand(-18, 18); E.push({ a, b, cx: mx - dy / dl * off, cy: my + dx / dl * off }); } }));
    E.forEach(e => { nodes[e.a].nb.push({ to: e.b, e }); nodes[e.b].nb.push({ to: e.a, e }); });
    const dist = from => { const d = new Array(nodes.length).fill(1e9); d[from] = 0; const q = [from]; while (q.length) { const n = q.shift(); nodes[n].nb.forEach(({ to }) => { if (d[to] > d[n] + 1) { d[to] = d[n] + 1; q.push(to); } }); } return d; };
    // inici a baix a l'esquerra; claus i cofre repartits lluny
    const start = id(0, ROWS - 1), d0 = dist(start);
    const picks = [], used = new Set([start]);
    const farthest = (cands) => { let best = null, bv = -1; cands.forEach(n => { const v = Math.min(...[start, ...picks].map(p => dist(p)[n])) + Math.random() * 0.5; if (v > bv) { bv = v; best = n; } }); return best; };
    const chest = farthest(nodes.map(n => n.i).filter(n => n !== start && d0[n] >= 5)) ?? id(COLS - 1, 0); used.add(chest); picks.push(chest);
    const keys = [];
    for (let k = 0; k < 3; k++) { const c = farthest(nodes.map(n => n.i).filter(n => !used.has(n) && d0[n] >= 2)); keys.push(c); used.add(c); picks.push(c); }
    nodes.forEach((n, i) => { n.mark = MARK_IDS[(i * 7 + 3) % MARK_IDS.length]; n.mx = n.x + (i % 2 ? 62 : -62); n.my = n.y + 58; });
    return { nodes, edges: E, start, chest, keys, dist };
  }
  function edgePts(e, from) {
    const pts = [], A = e.from = null, a = from === e.a ? e.a : e.b, b = from === e.a ? e.b : e.a;
    return [a, b];
  }
  function curvePoint(nodes, e, from, k) {
    const A = nodes[from], B = nodes[from === e.a ? e.b : e.a], u = 1 - k;
    return [u * u * A.x + 2 * u * k * e.cx + k * k * B.x, u * u * A.y + 2 * u * k * e.cy + k * k * B.y];
  }

  /* ---------- capa del mapa ---------- */
  function mapLayer(M) {
    const c = Tex.get("g16mapCanvas", () => makeCanvas(W, H)), x = c.getContext("2d");
    x.clearRect(0, 0, W, H);
    const R = mulberry32(7);
    if(Art.get("maze-bg"))x.drawImage(Art.get("maze-bg"),0,0,W,H);else x.drawImage(Tex.kraft(800,450,{seed:23}),0,0,W,H);
    // decoració entre camins (lluny de camins i cruïlles)
    const segs = []; M.edges.forEach(e => { for (let k = 0; k <= 10; k++) segs.push(curvePoint(M.nodes, e, e.a, k / 10)); });
    const free = (px, py, r) => segs.every(([sx, sy]) => Math.hypot(sx - px, sy - py) > r) && M.nodes.every(n => Math.hypot(n.mx - px, n.my - py) > 60);
    for (let k = 0; k < 150; k++) {
      const px = 120 + R() * 1360, py = 150 + R() * 690; if (!free(px, py, 58)) continue;
      const kind = R(); if (kind < 0.35) inkTree(x, px, py, 0.9 + R() * 0.4); else if (kind < 0.6) inkPalm(x, px, py, 0.7 + R() * 0.3); else if (kind < 0.75) inkMountain(x, px, py, 0.6 + R() * 0.3); else { x.fillStyle = "rgba(70,50,30,0.35)"; for (let q = 0; q < 6; q++) { x.beginPath(); x.arc(px + (R() - 0.5) * 30, py + (R() - 0.5) * 16, 1.6, 0, 6.28); x.fill(); } }
    }
    // camins: banda de sorra amb vora de tinta
    x.lineCap = x.lineJoin = "round";
    const pathE = (e) => { const A = M.nodes[e.a], B = M.nodes[e.b]; x.beginPath(); x.moveTo(A.x, A.y); x.quadraticCurveTo(e.cx, e.cy, B.x, B.y); };
    M.edges.forEach(e => { pathE(e); x.strokeStyle = "rgba(58,38,20,0.85)"; x.lineWidth = 46; x.stroke(); });
    M.edges.forEach(e => { pathE(e); x.strokeStyle = "#E2C590"; x.lineWidth = 40; x.stroke(); });
    M.edges.forEach(e => { pathE(e); x.strokeStyle = "rgba(160,120,70,0.35)"; x.lineWidth = 2; x.setLineDash([3, 9]); x.stroke(); x.setLineDash([]); });
    M.nodes.forEach(n => { x.fillStyle = "#E2C590"; x.beginPath(); x.arc(n.x, n.y, 21, 0, 6.28); x.fill(); });
    // llocs
    M.nodes.forEach(n => { if (n.i !== M.start) drawMark(x, n.mark, n.mx, n.my); });
    // rosa dels vents al mar i cartutx
    x.save(); x.translate(1490, 812); x.strokeStyle = INK; x.lineWidth = 1.8; x.fillStyle = "rgba(194,48,42,0.6)";
    for (let i = 0; i < 4; i++) { x.rotate(Math.PI / 2); x.beginPath(); x.moveTo(0, -44); x.lineTo(8, -8); x.lineTo(0, 0); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(0, -44); x.lineTo(-8, -8); x.lineTo(0, 0); x.closePath(); x.stroke(); }
    x.beginPath(); x.arc(0, 0, 26, 0, 6.28); x.stroke(); x.font = `900 18px ${FONT_T}`; x.fillStyle = INK; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("N", 0, -58); x.restore();
    // monstre marí petit
    x.save(); x.translate(130, 852); x.strokeStyle = INK; x.lineWidth = 2.2; x.fillStyle = "rgba(60,140,110,0.6)";
    for (const [cx, r] of [[-10, 14], [18, 12], [42, 10]]) { x.beginPath(); x.arc(cx, 0, r, Math.PI, 0); x.fill(); x.stroke(); }
    x.beginPath(); x.arc(-24, -6, 10, 0, 6.28); x.fill(); x.stroke(); x.fillStyle = INK; x.beginPath(); x.arc(-27, -9, 2, 0, 6.28); x.fill(); x.restore();
    // gra i taques de cafè
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.35; x.fillStyle = x.createPattern(Tex.grain(256, 50, 16), "repeat"); x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
    const v = x.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, 950); v.addColorStop(0, "rgba(60,30,5,0)"); v.addColorStop(1, "rgba(60,30,5,0.45)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
    return c;
  }

  const DEF = {
    id: 16, key: "l", name: "El laberint del tresor", zone: "muntanya", music: "adventure", demoTime: 10, captionY: 118,
    collect: { one: "tresor", many: "tresors" },
    goal: l => l <= 3 ? "A cada cruïlla, escriu la lletra del cartell del camí que vols. Recull 3 claus i obre el cofre." : l === 4 ? "A cada cruïlla, escriu la síl·laba del cartell del camí. Recull 3 claus i obre el cofre." : l === 5 ? "A cada cruïlla, escriu la paraula del cartell del camí. Recull 3 claus i obre el cofre." : "Els cartells són pistes. Escriu la pista del camí que vols. Recull 3 claus i obre el cofre.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      ctx.drawImage(Art.get("maze-bg")||Tex.kraft(800, 450, { seed: 23 }), 0, 0, w, h);
      const s = Math.max(w / 320, h / 220); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      inkPalm(ctx, -120, -30, 0.8); inkMountain(ctx, 150, -40, 0.7); inkTree(ctx, -150, 100, 0.8); inkPalm(ctx, 150, 110, 0.7);
      ctx.lineCap = ctx.lineJoin = "round";
      const road = () => { ctx.beginPath(); ctx.moveTo(-260, 70); ctx.quadraticCurveTo(-120, 64, -20, 70); ctx.quadraticCurveTo(100, 76, 260, 66); ctx.moveTo(-20, 70); ctx.quadraticCurveTo(-30, -40, -14, -160); };
      road(); ctx.strokeStyle = "rgba(58,38,20,0.9)"; ctx.lineWidth = 36; ctx.stroke(); ctx.strokeStyle = "#F2E0B4"; ctx.lineWidth = 26; ctx.stroke();
      ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([0.5, 13]); ctx.beginPath(); ctx.moveTo(-260, 70); ctx.quadraticCurveTo(-120, 64, -40, 69); ctx.stroke(); ctx.setLineDash([]);
      const g = ctx.createRadialGradient(-40, 10, 40, -40, 10, 230); g.addColorStop(0, "rgba(255,200,110,0.15)"); g.addColorStop(1, "rgba(22,12,4,0.7)"); ctx.fillStyle = g; ctx.fillRect(-300, -200, 600, 400);
      Sprites.draw(ctx, glowSprite("#FFD45A"), 92, 40, { s: 0.75 + Math.sin(t * 2) * 0.05 }); drawChest(ctx, 92, 46, 0, t);
      Sprites.draw(ctx, glowSprite("#FFD45A"), 30, -75, { s: 0.4 }); drawKey(ctx, 34, -75, 0.85, t);
      drawExplorer(ctx, -62, 78, t, { face: 1, s: 1 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, M = buildMaze(L), nodes = M.nodes;
      const pool = L <= 4 ? api.pool({}) : null, wordPool = api.pool({});
      const fs = L <= 3 ? 64 : L === 4 ? 52 : L === 5 ? 44 : 40;
      const map = mapLayer(M);
      const dark = makeCanvas(W / 2, H / 2), dx = dark.getContext("2d");
      const st = { node: M.start, from: -1, phase: "arrive", t: 0, walk: null, think: 0, keys: 0, face: 1, open: 0, endT: 0 };
      const keys = M.keys.map(n => ({ n, got: false, fly: null }));
      const walked = [];
      let options = [], ex = nodes[M.start].x, ey = nodes[M.start].y, darkA = 1;
      const treasure = pick(TREASURES);
      api.hud.progress = [0, 3];
      function goalNode() {
        const left = keys.filter(k => !k.got); if (!left.length) return M.chest;
        const d = M.dist(st.node); left.sort((a, b) => d[a.n] - d[b.n]); return left[0].n;
      }
      function makeOptions() {
        const here = nodes[st.node], g = goalNode(), dg = M.dist(g);
        const want = L <= 3 || L === 6 ? 2 : L === 4 ? 3 : 4;
        let nb = here.nb.slice().sort((a, b) => dg[a.to] - dg[b.to]);
        const best = nb[0], rest = shuffle(nb.slice(1)).sort((a, b) => (a.to === st.from) - (b.to === st.from));
        const chosen = [best, ...rest].slice(0, Math.min(want, nb.length));
        const used = [];
        options = chosen.map(o => {
          let txt;
          if (L <= 4) txt = pool.next(used);
          else {
            const m = MARKS[nodes[o.to].mark], cands = L === 5 ? [m.w] : m.p.slice();
            txt = cands.find(c => !used.some(u => u[0] === c[0]));
            if (!txt) txt = wordPool.next(used);
          }
          used.push(txt);
          const B = nodes[o.to], ddx = B.x - here.x, ddy = B.y - here.y, dl = Math.hypot(ddx, ddy), ux = ddx / dl, uy = ddy / dl;
          const ps = plateSizeCache(txt), bw = ps.w + 26, bh = ps.h + 24;
          const horiz = Math.abs(ux) > Math.abs(uy);
          let bx, by, post;
          if (horiz) { const d = Math.max(122, bw / 2 + 60); bx = here.x + ux * d; by = here.y + uy * d - 52; post = [bx, by, here.y + uy * d + 4]; }
          else { const d = uy < 0 ? 152 : 114; bx = here.x + ux * d; by = here.y + uy * d; post = [bx, by, by + bh / 2 + 16]; }
          bx = clamp(bx, bw / 2 + 12, W - bw / 2 - 12); by = clamp(by, 84 + bh / 2, H - bh / 2 - 8);
          return { text: txt, to: o.to, e: o.e, x: bx, y: by, post, ux, uy, bw, bh, dist: dg[o.to], pop: 0 };
        });
      }
      const psCache = {};
      function plateSizeCache(s) { if (!psCache[s]) { const c = makeCanvas(4, 4).getContext("2d"); psCache[s] = plateSize(c, s, fs); } return psCache[s]; }
      const typer = api.typer({
        targets: () => st.phase === "choose" ? options : [],
        rank: o => o.dist,
        onStep: o => { o.pop = 1; },
        onDone: o => { st.fade = { o, a: 1 }; options = []; st.phase = "walk"; st.t = 0; st.walk = { e: o.e, from: st.node, to: o.to, len: Math.hypot(nodes[o.to].x - nodes[st.node].x, nodes[o.to].y - nodes[st.node].y) }; Sfx.play("whoosh"); },
        onMiss: () => { st.think = 1.4; DEF.missAt = [ex < 800 ? 1130 : 470, ey < 450 ? 560 : 300]; },
      });
      DEF.missAt = [ex < 800 ? 1130 : 470, ey < 450 ? 560 : 300];
      function arrive() {
        st.phase = "arrive"; st.t = 0;
        const k = keys.find(k => k.n === st.node && !k.got);
        if (k) { k.got = true; k.fly = 0; st.keys++; api.hud.progress = [st.keys, 3]; Sfx.play("chime", { note: 79 + st.keys * 2 }); api.particles.emit(nodes[k.n].x, nodes[k.n].y - 40, { count: 18, color: ["#FFE48A", "#F2C230", "#FFFFFF"], shape: "star", size: 12, speed: 220, gravity: 200, life: 0.8 }); api.say(st.keys < 3 ? L_("Una clau! Te'n falten {n}.", { n: 3 - st.keys }) : "Ja tens les tres claus! Ara, al cofre!"); }
        if (st.node === M.chest) {
          if (st.keys >= 3) { st.phase = "open"; st.t = 0; Sfx.play("bell", { note: 72 }); setTimeout(() => Sfx.play("win"), 400); void 0; return; }
          else { api.say("El cofre està tancat. Busca les claus!"); Sfx.play("clack"); st.locked = 1; }
        }
      }
      return {
        expected() { return st.phase === "choose" ? typer.expected() : null; },
        onKey(k) { if (st.phase === "choose") typer.key(k); },
        update(dt) {
          const t = api.t; st.t += dt; st.think = Math.max(0, st.think - dt); st.locked = Math.max(0, (st.locked || 0) - dt);
          if (st.phase === "arrive" && st.t > 0.35) { makeOptions(); st.phase = "choose"; st.t = 0; DEF.missAt = [ex < 800 ? 1130 : 470, ey < 450 ? 560 : 300]; }
          if (st.phase === "walk") {
            const w = st.walk, dur = w.len / (175 * Math.max(0.8, api.speed)), k = clamp(st.t / dur, 0, 1);
            const p = curvePoint(nodes, w.e, w.from, Ease.inOutQuad(k)); st.face = p[0] < ex - 0.3 ? -1 : p[0] > ex + 0.3 ? 1 : st.face; ex = p[0]; ey = p[1];
            if (k >= 1) { walked.push({ e: w.e, from: w.from }); st.from = w.from; st.node = w.to; st.walk = null; options = []; arrive(); }
          }
          options.forEach(o => o.pop = Math.max(0, o.pop - dt * 3)); if (st.fade) { st.fade.a -= dt * 3.5; if (st.fade.a <= 0) st.fade = null; }
          keys.forEach(k => { if (k.fly != null && k.fly < 1) k.fly += dt / 0.9; });
          if (st.phase === "open") { const C = nodes[M.chest], tx = C.x + (C.x > 800 ? -95 : 95), k6 = Math.min(1, dt * 5); st.face = tx > C.x ? -1 : 1; ex = lerp(ex, tx, k6); ey = lerp(ey, C.y + 24, k6); st.aside = Math.abs(ex - tx) > 3; st.open = Math.min(1, st.open + dt * 1.4); darkA = Math.max(0, darkA - dt * 0.6); if (st.t > 0.3 && st.t < 1.5 && Math.random() < dt * 14) api.particles.emit(nodes[M.chest].x, nodes[M.chest].y - 30, { count: 3, color: ["#FFE48A", "#F2C230", "#FFFFFF", "#D8352A", "#2E7AD8"], shape: pick(["star", "circle", "square"]), size: 11, speed: 380, gravity: 600, life: 1.1, angle: -Math.PI / 2, spread: 0.9 }); if (st.t > 3.2 && !st.fin) { st.fin = true; api.finish(true, { collectName: treasure[1] }); } }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(map, 0, 0);
          // camí recorregut: línia de punts vermella
          ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([0.5, 13]);
          const trace = (w, k) => { ctx.beginPath(); const p0 = curvePoint(nodes, w.e, w.from, 0); ctx.moveTo(p0[0], p0[1]); for (let q = 1; q <= 24; q++) { const kk = q / 24 * k; const p = curvePoint(nodes, w.e, w.from, kk); ctx.lineTo(p[0], p[1]); } ctx.stroke(); };
          walked.forEach(w => trace(w, 1));
          if (st.walk) trace(st.walk, Ease.inOutQuad(clamp(st.t / (st.walk.len / (175 * Math.max(0.8, api.speed))), 0, 1)));
          ctx.restore();
          // X vermella del tresor (es veu quan tens les tres claus)
          const C = nodes[M.chest];
          // claus i cofre
          keys.forEach(k => { if (k.got) return; const n = nodes[k.n]; drawKey(ctx, n.x, n.y - 28 + Math.sin(t * 2 + k.n) * 4, 1.15, t); });
          drawChest(ctx, C.x, C.y - 12, Ease.outBack(st.open), t);
          // cartells (pals)
          options.forEach(o => {
            const [px, top, bot] = o.post; ctx.fillStyle = "rgba(30,15,5,0.3)"; ctx.beginPath(); ctx.ellipse(px, bot, 12, 4, 0, 0, 6.28); ctx.fill(); ctx.fillStyle = "#5A3618"; ctx.fillRect(px - 4, top, 8, bot - top);
          });
          // explorador
          drawExplorer(ctx, ex, ey + 8, t, { walk: st.phase === "walk" || (st.phase === "open" && st.aside), face: st.face, think: st.think > 0 });
          // foscor: només la torxa il·lumina un cercle
          if (darkA > 0) {
            dx.globalCompositeOperation = "source-over"; dx.clearRect(0, 0, W / 2, H / 2); dx.fillStyle = `rgba(22,12,4,${0.64 * darkA})`; dx.fillRect(0, 0, W / 2, H / 2);
            dx.globalCompositeOperation = "destination-out";
            const hole = (hx, hy, r, a = 1) => { const g = dx.createRadialGradient(hx / 2, hy / 2, 0, hx / 2, hy / 2, r / 2); g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(0.55, `rgba(0,0,0,${a * 0.9})`); g.addColorStop(1, "rgba(0,0,0,0)"); dx.fillStyle = g; dx.fillRect((hx - r) / 2, (hy - r) / 2, r, r); };
            const fl = 1 + Math.sin(t * 7) * 0.015 + Math.sin(t * 11.3) * 0.01;
            hole(ex + 16 * st.face, ey - 50, 380 * fl);
            keys.forEach(k => { if (!k.got) hole(nodes[k.n].x, nodes[k.n].y - 28, 90, 0.7); });
            hole(C.x, C.y - 10, st.keys >= 3 ? 160 : 100, 0.7);
            if (L >= 5) options.forEach(o => { const n = nodes[o.to]; hole(n.mx, n.my, 150, 0.75); });
            ctx.drawImage(dark, 0, 0, W, H);
            // llum càlida de la torxa
            ctx.save(); ctx.globalCompositeOperation = "soft-light"; const lg = ctx.createRadialGradient(ex, ey - 50, 10, ex, ey - 50, 260); lg.addColorStop(0, "rgba(255,190,90,0.55)"); lg.addColorStop(1, "rgba(255,190,90,0)"); ctx.fillStyle = lg; ctx.fillRect(ex - 260, ey - 310, 520, 520); ctx.restore();
          }
          // lluentors que es veuen de lluny
          keys.forEach(k => { if (k.got) return; const n = nodes[k.n]; Sprites.draw(ctx, glowSprite("#FFD45A"), n.x, n.y - 28, { s: 0.55 + Math.sin(t * 2.4 + k.n) * 0.06, alpha: 0.75 }); drawKey(ctx, n.x, n.y - 28 + Math.sin(t * 2 + k.n) * 4, 1.15, t); });
          Sprites.draw(ctx, glowSprite("#FFC84A"), C.x, C.y - 16, { s: (st.keys >= 3 ? 1.0 : 0.7) + Math.sin(t * 2) * 0.05, alpha: 0.8 });
          if (st.open > 0) { ctx.save(); ctx.translate(C.x, C.y - 30); ctx.rotate(t * 0.4); ctx.globalAlpha = 0.5 * st.open; ctx.fillStyle = "#FFE7A0"; for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -260); ctx.lineTo(18, -260); ctx.closePath(); ctx.fill(); } ctx.restore(); }
          drawChest(ctx, C.x, C.y - 12, Ease.outBack(st.open), t);
          if (st.locked > 0) { ctx.save(); ctx.globalAlpha = clamp(st.locked, 0, 1); drawKey(ctx, C.x + 50, C.y - 60, 0.8, t); ctx.strokeStyle = UI.coral; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(C.x + 30, C.y - 80); ctx.lineTo(C.x + 70, C.y - 40); ctx.stroke(); ctx.restore(); }
          if (st.open > 0.3) { const k = clamp((st.t - 0.4) / 0.8, 0, 1); drawTreasure(ctx, treasure[0], C.x, Math.max(C.y - 60 - Ease.outBack(k) * 90, 170 + (1 - k) * 60), 1.2 * Ease.outBack(k) + 0.01); }
          // explorador per sobre de la foscor (porta la torxa)
          drawExplorer(ctx, ex, ey + 8, t, { walk: st.phase === "walk" || (st.phase === "open" && st.aside), face: st.face, think: st.think > 0 });
          // claus que volen cap al comptador
          keys.forEach((k, i) => { if (k.fly == null || k.fly >= 1) return; const n = nodes[k.n], kk = Ease.inOutCubic(k.fly); drawKey(ctx, lerp(n.x, 1260, kk), lerp(n.y - 28, 44, kk) - Math.sin(kk * Math.PI) * 120, 1.15 - kk * 0.5, t); });
          // rètols de fusta amb la placa (sempre a sobre i rectes)
          options.forEach(o => {
            const s = 1 + o.pop * 0.06, b = signBoard(o.bw, o.bh);
            const horiz = Math.abs(o.ux) > Math.abs(o.uy), ang = horiz ? (o.ux > 0 ? 0 : Math.PI) : (o.uy > 0 ? Math.PI / 2 : -Math.PI / 2), off = (horiz ? o.bw : o.bh) / 2 + 2;
            ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(ang); ctx.translate(off * s, 0); ctx.fillStyle = RED; ctx.strokeStyle = "#5A1410"; ctx.lineWidth = 2.5; ctx.lineJoin = "round";
            ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(0, -19); ctx.lineTo(0, 19); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
            Sprites.draw(ctx, b, o.x, o.y, { s });
            drawPlate(ctx, o.text, o.x, o.y, { size: fs, progress: o.typed, state: o.locked ? "active" : null, border: o.locked ? null : "#8A5A2A", borderW: 3, shadowBlur: 4, shadowY: 2 });
          });
          if (st.fade) { const o = st.fade.o, a = clamp(st.fade.a, 0, 1), sc = 1 + (1 - a) * 0.15; Sprites.draw(ctx, signBoard(o.bw, o.bh), o.x, o.y, { s: sc, alpha: a }); drawPlate(ctx, o.text, o.x, o.y, { size: fs * sc, state: "ok", alpha: a, shadowBlur: 4, shadowY: 2 }); }
          if (st.think > 0) { ctx.save(); ctx.globalAlpha = clamp(st.think * 2, 0, 1); ctx.fillStyle = "#FBF3DC"; ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(ex - 58 * st.face, ey - 100, 26, 22, 0, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(ex - 30 * st.face, ey - 76, 5, 0, 6.28); ctx.fill(); ctx.stroke(); text(ctx, "?", ex - 58 * st.face, ey - 99, { size: 30, weight: 900, font: FONT_T, color: INK }); ctx.restore(); }
        },
      };
    },
  };
  Games.register(DEF);
})();
