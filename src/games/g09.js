"use strict";
/* 9. Jardí de lletres — aquarel·la sobre paper de gra gruixut, l'estació segueix el nivell */
(() => {
  const GROUND = 690, INK = "#3B2E22";
  const SEASON_BY_LEVEL = ["primavera", "estiu", "tardor", "hivern", "primavera", "estiu"];
  const SEASONS = {
    primavera: {
      sky: [["#F1CDBE", "#FBEAD9"], ["#7FB6E0", "#DCEEF2"], ["#E3A383", "#F7DCB4"]],
      hills: ["#C5DEAE", "#97C783", "#6FAB69"], grass: "#7DB862", soil: "#8B6040", trees: ["#F4B8C8", "#86BE76", "#A9D38F"],
      flowers: [["tulip", "#E8546A"], ["daisy", "#FFFFFF", "#F2C230"], ["poppy", "#E0402E"], ["tulip", "#F4B63E"], ["daisy", "#F59BC0", "#F7D34A"], ["spike", "#9C7BD8"]],
      bush: ["#7FB86A", "#5E9E58"], dot: "#F7A9C4", tree: "blossom",
    },
    estiu: {
      sky: [["#F6D2A6", "#FBEBCF"], ["#5FA6DE", "#CFEAF2"], ["#EE9A6A", "#F8D8A6"]],
      hills: ["#DDE3A0", "#B8CF78", "#8DB25C"], grass: "#93BE58", soil: "#94643E", trees: ["#7FAE5A", "#A2C568", "#6E9E52"],
      flowers: [["sun", "#F5C531", "#7A4A22"], ["spike", "#8E6CD0"], ["poppy", "#E5452F"], ["daisy", "#FFFFFF", "#F2C230"], ["tulip", "#F0789A"], ["sun", "#F29A2E", "#6A3E1E"]],
      bush: ["#88B85A", "#6A9E4C"], dot: "#F6E05A", tree: "fruit",
    },
    tardor: {
      sky: [["#EAC7B0", "#F6E3CC"], ["#93B4CF", "#E6E4D8"], ["#D98E6A", "#F2CFA2"]],
      hills: ["#E3C48E", "#D19A5E", "#AE7A4C"], grass: "#B4A055", soil: "#7E5236", trees: ["#E0863A", "#C9542E", "#E8B444"],
      flowers: [["daisy", "#9F7AD6", "#F2C230"], ["daisy", "#E9873A", "#7A3E1E"], ["poppy", "#C8392E"], ["tulip", "#E6A23A"], ["spike", "#B5638E"], ["daisy", "#F0C24A", "#8A4A22"]],
      bush: ["#B08A48", "#8E6E3A"], dot: "#D8452E", tree: "autumn",
    },
    hivern: {
      sky: [["#D5D9E8", "#EEF0F4"], ["#9DB8D6", "#E9EFF3"], ["#C9A2B4", "#EBD9D6"]],
      hills: ["#E9EEF2", "#D2DDE6", "#B9C9D6"], grass: "#9DB3A4", soil: "#6E5040", trees: ["#4E7A64", "#6B8E7A", "#3E6A58"],
      flowers: [["daisy", "#FFFFFF", "#F2C230"]],
      bush: ["#3F7A52", "#2E6444"], dot: "#D8352A", tree: "pine", snow: true,
    },
  };
  // animals que viuen a cada jardí (6 per nivell)
  const ANIMALS = {
    1: [["papallona", "#F29A2E"], ["abella"], ["papallona", "#5FA0E0"], ["papallona", "#F07AA8"], ["abella"], ["papallona", "#F4CE3A"]],
    2: [["papallona", "#F4CE3A"], ["libèl·lula", "#3FB0C8"], ["abella"], ["papallona", "#E85C4A"], ["libèl·lula", "#7ACB5A"], ["papallona", "#8E6CD0"]],
    3: [["papallona", "#C8642E"], ["abella"], ["papallona", "#E8A23A"], ["marieta"], ["papallona", "#8A5A3A"], ["abella"]],
    4: [["pit-roig"], ["mallerenga"], ["pardal"], ["pit-roig"], ["merla"], ["mallerenga"]],
    5: [["esquirol"], ["pit-roig"], ["esquirol"], ["mallerenga"], ["esquirol"], ["merla"]],
    6: [["esquirol"], ["pardal"], ["esquirol"], ["mallerenga"], ["esquirol"], ["pit-roig"]],
  };
  const BIRDS = {
    "pit-roig": { body: "#8C7A5E", breast: "#E8743A", head: "#8C7A5E", beak: "#3A3028" },
    mallerenga: { body: "#7E9C5A", breast: "#F2D245", head: "#262628", cheek: "#FFFFFF", beak: "#262628" },
    pardal: { body: "#9A6E48", breast: "#DCCAAA", head: "#7C6A5A", cheek: "#E8DCC4", beak: "#4A3A2A" },
    merla: { body: "#2C2C30", breast: "#34343A", head: "#2C2C30", beak: "#F2A93A" },
  };
  const ARTICLE = { papallona: "una papallona", abella: "una abella", "libèl·lula": "una libèl·lula", marieta: "una marieta", "pit-roig": "un pit-roig", mallerenga: "una mallerenga", pardal: "un pardal", merla: "una merla", esquirol: "un esquirol" };

  const bake = (key, w, h, fn) => Tex.get(key, () => { const c = makeCanvas(w, h); NOPAPER = true; try { fn(c.getContext("2d"), w, h); } finally { NOPAPER = false; } return c; });
  const leafPath = (px, py, len, wid, a) => c => {
    const ca = Math.cos(a), sa = Math.sin(a), P = (u, v) => [px + u * ca - v * sa, py + u * sa + v * ca];
    const p = P(0, 0), q1 = P(len * 0.45, -wid), e = P(len, 0), q2 = P(len * 0.55, wid);
    c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(q1[0], q1[1], e[0], e[1]); c.quadraticCurveTo(q2[0], q2[1], p[0], p[1]); c.closePath();
  };
  const circ = (px, py, r) => c => { c.beginPath(); c.arc(px, py, r, 0, 6.28); };
  const blob = (px, py, r, seed, wob = 0.2, n = 9) => c => blobPath(c, px, py, r, seed, wob, n);
  const darkHex = (hex, a) => "#" + shade(hex, a).match(/\d+/g).map(v => (+v).toString(16).padStart(2, "0")).join("");
  /* paper sense costures: la rajola de 256 px es mira en mirall (si no, es veuen quadres) */
  function seamless(src) {
    const n = src.width, c = makeCanvas(n * 2, n * 2), x = c.getContext("2d");
    [[1, 1, 0, 0], [-1, 1, 2 * n, 0], [1, -1, 0, 2 * n], [-1, -1, 2 * n, 2 * n]].forEach(([sx, sy, tx, ty]) => { x.save(); x.translate(tx, ty); x.scale(sx, sy); x.drawImage(src, 0, 0); x.restore(); });
    return c;
  }
  const paperTile = () => Tex.get("g9paperS", () => seamless(Tex.paper(256, 256, "#e9e1d2", { seed: 43, fiber: 2.6 })));
  /* aquarel·la: capes translúcides desplaçades, vora fosca difuminada i gra del paper */
  function wc(x, path, col, seed) {
    const R = mulberry32(seed || 31);
    x.save();
    for (let k = 0; k < 3; k++) { x.save(); x.translate((R() - 0.5) * 4, (R() - 0.5) * 4); path(x); x.globalAlpha = 0.34; x.fillStyle = k === 2 ? shade(col, 0.15) : col; x.fill(); x.restore(); }
    path(x); x.clip();
    x.globalAlpha = 0.33; x.strokeStyle = shade(col, -0.3); x.lineWidth = 4; if (!NOPAPER) x.filter = "blur(1.5px)"; path(x); x.stroke(); x.filter = "none";
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.45; if (!NOPAPER) { x.fillStyle = x.createPattern(paperTile(), "repeat"); x.setTransform(1, 0, 0, 1, 0, 0); x.fillRect(0, 0, x.canvas.width, x.canvas.height); }
    x.restore();
  }
  function inkLine(x, path, o = {}) { x.save(); x.strokeStyle = o.color || INK; x.globalAlpha = o.alpha || 0.7; x.lineWidth = o.lw || 1.7; x.lineJoin = x.lineCap = "round"; x.translate(o.dx || 0.8, o.dy || -0.6); path(x); x.stroke(); x.restore(); }

  let NOPAPER = false; // les capes grans reben el gra una sola vegada al final
  /* ---------- plantes (dues capes: color i traç) ---------- */
  function flowerArt(x, f, ink) {
    const cx = 80, by = 296, top = by - f.h, R = mulberry32(f.seed);
    const stem = c => { c.beginPath(); c.moveTo(cx, by); c.quadraticCurveTo(cx + f.bend, by - f.h * 0.5, cx, top); };
    const leaves = [leafPath(cx + f.bend * 0.4, by - f.h * 0.28, 52, 13, -0.5 - R() * 0.3), leafPath(cx + f.bend * 0.5, by - f.h * 0.45, 46, 12, Math.PI + 0.5 + R() * 0.3)];
    const green = f.season === "tardor" ? "#8E9A48" : "#5E9E4E";
    if (!ink) {
      x.save(); x.lineCap = "round"; x.strokeStyle = rgba(green, 0.55); x.lineWidth = 7; stem(x); x.stroke(); x.lineWidth = 4; x.strokeStyle = rgba("#3E7A3A", 0.35); x.translate(1.5, 0); stem(x); x.stroke(); x.restore();
      leaves.forEach((l, i) => wc(x, l, green, f.seed + i));
    } else { inkLine(x, stem, { lw: 1.4 }); leaves.forEach(l => inkLine(x, l, { lw: 1.3 })); }
    const hx = cx, hy = top;
    if (f.type === "daisy" || f.type === "sun") {
      const n = f.type === "sun" ? 16 : 12, L = f.type === "sun" ? 46 : 34, Wd = f.type === "sun" ? 10 : 8;
      for (let i = 0; i < n; i++) { const p = leafPath(hx, hy, L, Wd, i / n * 6.283 + R() * 0.1); if (!ink) wc(x, p, f.col === "#FFFFFF" ? "#F4F2EE" : f.col, f.seed + 10 + i); else if (i % 2 === 0) inkLine(x, p, { lw: 1.1, alpha: 0.55 }); }
      if (f.col === "#FFFFFF" && !ink) for (let i = 0; i < n; i++) inkLine(x, leafPath(hx, hy, L, Wd, i / n * 6.283), { color: "#8FA4C4", alpha: 0.45, lw: 1.4 });
      const cr = f.type === "sun" ? 22 : 12;
      if (!ink) { wc(x, circ(hx, hy, cr), f.c2, f.seed + 40); x.fillStyle = rgba("#3A2010", 0.25); for (let i = 0; i < (f.type === "sun" ? 30 : 8); i++) { const a = R() * 6.28, r = R() * cr * 0.8; x.beginPath(); x.arc(hx + Math.cos(a) * r, hy + Math.sin(a) * r, 1.6, 0, 6.28); x.fill(); } }
      else inkLine(x, circ(hx, hy, cr), { lw: 1.5 });
    } else if (f.type === "tulip") {
      const cup = c => { c.beginPath(); c.moveTo(hx - 24, hy - 30); c.quadraticCurveTo(hx - 30, hy + 10, hx, hy + 14); c.quadraticCurveTo(hx + 30, hy + 10, hx + 24, hy - 30); c.lineTo(hx + 12, hy - 14); c.lineTo(hx, hy - 36); c.lineTo(hx - 12, hy - 14); c.closePath(); };
      const mid = c => { c.beginPath(); c.moveTo(hx - 12, hy - 14); c.quadraticCurveTo(hx, hy - 44, hx + 12, hy - 14); c.quadraticCurveTo(hx, hy + 6, hx - 12, hy - 14); c.closePath(); };
      if (!ink) { wc(x, cup, f.col, f.seed + 50); wc(x, mid, darkHex(f.col, -0.15), f.seed + 51); }
      else { inkLine(x, cup, { lw: 1.5 }); inkLine(x, mid, { lw: 1.1, alpha: 0.5 }); }
    } else if (f.type === "poppy") {
      for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - 1.2, p = circ(hx + Math.cos(a) * 17, hy + Math.sin(a) * 14, 22); if (!ink) wc(x, p, f.col, f.seed + 60 + i); }
      if (!ink) { x.fillStyle = "rgba(30,20,20,0.85)"; x.beginPath(); x.arc(hx, hy, 9, 0, 6.28); x.fill(); x.fillStyle = "rgba(30,20,20,0.6)"; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28; x.beginPath(); x.arc(hx + Math.cos(a) * 14, hy + Math.sin(a) * 14, 1.8, 0, 6.28); x.fill(); } }
      else for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - 1.2; x.save(); x.strokeStyle = INK; x.globalAlpha = 0.6; x.lineWidth = 1.3; x.beginPath(); x.arc(hx + Math.cos(a) * 17, hy + Math.sin(a) * 14, 22, a - 1.1, a + 1.1); x.stroke(); x.restore(); }
    } else if (f.type === "spike") {
      for (let i = 0; i < 11; i++) { const yy = hy + 10 - i * 7.5, s = 7 - i * 0.35; for (const sd of [-1, 1]) { const p = circ(hx + sd * (5 - i * 0.2), yy, s); if (!ink) { x.fillStyle = rgba(f.col, 0.55); p(x); x.fill(); x.fillStyle = rgba("#5A3E8E", 0.25); circ(hx + sd * (5 - i * 0.2) + 1.5, yy + 1.5, s * 0.6)(x); x.fill(); } else if (i % 3 === 0) inkLine(x, p, { lw: 1, alpha: 0.5 }); } }
    }
  }
  function bushArt(x, b, ink) {
    const cx = 120, by = 236, R = mulberry32(b.seed), blobs = [];
    for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI; blobs.push([cx + Math.cos(a) * 66 * (0.8 + R() * 0.3), by - 52 + Math.sin(a) * 66 * (0.8 + R() * 0.3), 38 + R() * 14]); }
    blobs.push([cx - 34, by - 40, 46], [cx + 34, by - 42, 46], [cx, by - 70, 50]);
    if (!ink) {
      blobs.forEach((q, i) => wc(x, blob(q[0], q[1], q[2], b.seed + i, 0.16), i % 3 === 0 ? b.c2 : b.col, b.seed + i));
      if (b.snow) for (let i = 0; i < 5; i++) { const q = blobs[2 + i]; wc(x, c => { c.beginPath(); c.ellipse(q[0], q[1] - q[2] * 0.62, q[2] * 0.8, q[2] * 0.3, 0, 0, 6.28); }, "#FDFDFF", b.seed + 30 + i); }
      for (let i = 0; i < 18; i++) { const q = blobs[(R() * blobs.length) | 0], a = R() * 6.28, r = R() * q[2] * 0.7, px = q[0] + Math.cos(a) * r, py = q[1] + Math.sin(a) * r * 0.8; x.fillStyle = rgba(b.dot, 0.9); x.beginPath(); x.arc(px, py, 5.5, 0, 6.28); x.fill(); x.fillStyle = "rgba(255,255,255,0.6)"; x.beginPath(); x.arc(px - 1.8, py - 1.8, 1.8, 0, 6.28); x.fill(); }
    } else blobs.slice(0, 9).forEach((q, i) => { x.save(); x.strokeStyle = INK; x.globalAlpha = 0.55; x.lineWidth = 1.5; x.beginPath(); x.arc(q[0], q[1], q[2] * 0.95, Math.PI * 0.95 + i * 0.1, Math.PI * 1.75 + i * 0.1); x.stroke(); x.restore(); });
  }
  function treeArt(x, tr, ink) {
    const cx = 170, by = 496, R = mulberry32(tr.seed), kind = tr.kind;
    const trunk = c => { c.beginPath(); c.moveTo(cx - 20, by); c.quadraticCurveTo(cx - 12, by - 120, cx - 8, by - 230); c.lineTo(cx - 60, by - 300); c.lineTo(cx - 50, by - 306); c.lineTo(cx - 2, by - 256); c.lineTo(cx + 4, by - 330); c.lineTo(cx + 14, by - 328); c.lineTo(cx + 12, by - 250); c.lineTo(cx + 66, by - 296); c.lineTo(cx + 72, by - 288); c.lineTo(cx + 14, by - 214); c.quadraticCurveTo(cx + 14, by - 120, cx + 22, by); c.closePath(); };
    if (kind === "pine") {
      const tiers = c => { c.beginPath(); for (let i = 0; i < 5; i++) { const y0 = by - 90 - i * 70, w0 = 130 - i * 22; c.moveTo(cx - w0, y0); c.quadraticCurveTo(cx, y0 - 20, cx + w0, y0); c.lineTo(cx, y0 - 120); c.closePath(); } };
      if (!ink) { wc(x, c => { c.beginPath(); c.rect(cx - 12, by - 120, 24, 120); }, "#6A4A30", tr.seed); wc(x, tiers, tr.col, tr.seed + 1); for (let i = 0; i < 5; i++) { const y0 = by - 90 - i * 70, w0 = 130 - i * 22; wc(x, c => { c.beginPath(); c.ellipse(cx, y0 - 30, w0 * 0.6, 12, 0, 0, 6.28); }, "#FDFDFF", tr.seed + 5 + i); } }
      else inkLine(x, tiers, { lw: 1.5, alpha: 0.6 });
      return;
    }
    if (!ink) wc(x, trunk, "#7A5236", tr.seed); else { x.save(); x.beginPath(); x.rect(0, by - 220, 400, 300); x.clip(); inkLine(x, trunk, { lw: 1.6 }); x.restore(); }
    const blobs = [[cx, by - 340, 92], [cx - 92, by - 300, 72], [cx + 94, by - 302, 74], [cx - 52, by - 390, 70], [cx + 56, by - 392, 70], [cx - 120, by - 236, 52], [cx + 122, by - 240, 54], [cx, by - 250, 70]];
    const cols = kind === "blossom" ? ["#F6C2D0", "#F2A8BE", "#FBE0E6"] : kind === "fruit" || kind === "green" ? ["#7FAE5A", "#6A9E4C", "#98C268"] : ["#E28A3C", "#CF5C30", "#EAB646"];
    if (!ink) {
      blobs.forEach((q, i) => wc(x, blob(q[0], q[1], q[2], tr.seed + i, 0.18, 10), cols[i % 3], tr.seed + i));
      if (kind === "blossom") for (let i = 0; i < 4; i++) { const q = blobs[5 + (i % 3)]; wc(x, blob(q[0] + 20, q[1] + 20, 28, tr.seed + 50 + i), "#86BE76", tr.seed + 50 + i); }
      const dot = kind === "blossom" || kind === "green" ? "#FFFFFF" : kind === "fruit" ? (tr.seed % 2 ? "#F2952E" : "#E0452E") : "#F4D25A";
      for (let i = 0; i < (kind === "fruit" ? 14 : kind === "green" ? 10 : 30); i++) { const q = blobs[(R() * blobs.length) | 0], a = R() * 6.28, r = R() * q[2] * 0.75, px = q[0] + Math.cos(a) * r, py = q[1] + Math.sin(a) * r; const s = kind === "fruit" ? 9 : 4.5; x.fillStyle = rgba(dot, 0.92); x.beginPath(); x.arc(px, py, s, 0, 6.28); x.fill(); if (kind === "fruit") { x.fillStyle = "rgba(255,255,255,0.55)"; x.beginPath(); x.arc(px - 3, py - 3, 2.6, 0, 6.28); x.fill(); } }
    } else blobs.forEach((q, i) => { x.save(); x.strokeStyle = INK; x.globalAlpha = 0.5; x.lineWidth = 1.5; x.beginPath(); x.arc(q[0], q[1], q[2] * 0.96, Math.PI * 1.0 + i * 0.4, Math.PI * 1.6 + i * 0.4); x.stroke(); x.restore(); });
  }
  const PLANT_DIM = { flower: [160, 300, 80, 296], bush: [240, 250, 120, 236], tree: [340, 510, 170, 496] };
  function plantSprites(p) {
    const [w, h] = PLANT_DIM[p.kind], key = `g9_${p.kind}_${p.spec.type || p.spec.kind}_${p.spec.col}_${p.spec.seed}`;
    const fn = p.kind === "flower" ? flowerArt : p.kind === "bush" ? bushArt : treeArt;
    const map={poppy:0,tulip:1,daisy:2,spike:3,sun:4,iris:5,blossom:11,fruit:10,green:9};
    let atlas="garden-plants", idx=p.kind==="bush"?(p.spec.season==="tardor"?8:6+p.spec.seed%2):map[p.spec.type];
    if(p.spec.season==="hivern"){atlas="garden-extra";idx=p.kind==="bush"?(p.spec.seed%2?1:3):2;}
    if(p.kind==="tree"&&p.spec.season==="tardor"){atlas="garden-extra";idx=4;}
    if(idx!=null&&Art.get(atlas)){
      return {col:Sprites.get(key+atlas,w,h,x=>{const im=Art.get(atlas),[bx,by,bw,bh]=Art.rects[atlas][idx],k=Math.min((w-8)/bw,(h-8)/bh);x.drawImage(im,bx,by,bw,bh,(w-bw*k)/2,h-5-bh*k,bw*k,bh*k);}),ink:Sprites.get(key+"empty",w,h,()=>{})};
    }
    return { col: Sprites.get(key + "c", w, h, x => fn(x, p.spec, false)), ink: Sprites.get(key + "i", w, h, x => fn(x, p.spec, true)) };
  }
  function bloomSprite(col) {
    return Sprites.get("g9bloom" + col, 300, 300, (x, w, h) => {
      for (let k = 0; k < 6; k++) { blobPath(x, w / 2, h / 2, 120 - k * 14, 7 + k * 3, 0.22, 11); x.fillStyle = rgba(col, 0.1); x.fill(); }
      blobPath(x, w / 2, h / 2, 126, 7, 0.22, 11); x.strokeStyle = rgba(col, 0.16); x.lineWidth = 5; x.filter = "blur(3px)"; x.stroke(); x.filter = "none";
    });
  }
  function wetSprite() {
    return Sprites.get("g9wet", 240, 160, (x, w, h) => { for (let k = 0; k < 5; k++) { x.save(); x.translate(w / 2, h / 2); x.scale(1, 0.62); blobPath(x, 0, 0, 100 - k * 16, 3 + k, 0.2, 10); x.restore(); x.fillStyle = "rgba(40,22,12,0.12)"; x.fill(); } });
  }
  function canSprite() {
    return Sprites.get("g9can", 220, 150, x => {
      const art=Art.cell("garden-extra",0,3,2,220,150);if(art){x.drawImage(art,0,0,220,150);return;}
      const body = c => { c.beginPath(); c.moveTo(40, 50); c.lineTo(130, 50); c.lineTo(138, 136); c.quadraticCurveTo(85, 146, 32, 136); c.closePath(); };
      const spout = c => { c.beginPath(); c.moveTo(130, 110); c.lineTo(196, 46); c.lineTo(204, 54); c.lineTo(136, 126); c.closePath(); };
      const rose = c => { c.beginPath(); c.ellipse(204, 46, 10, 16, -0.8, 0, 6.28); };
      wc(x, spout, "#4E9A7A", 3); wc(x, body, "#5FAE8C", 4); wc(x, rose, "#3E826A", 5);
      x.save(); x.strokeStyle = rgba("#3E826A", 0.8); x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(52, 52); x.quadraticCurveTo(85, 6, 118, 52); x.stroke(); x.restore();
      x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(48, 62, 10, 64);
      inkLine(x, body, { lw: 1.8 }); inkLine(x, spout, { lw: 1.6 }); inkLine(x, rose, { lw: 1.4 });
    });
  }
  function seedSprite() {
    return Sprites.get("g9seed", 60, 44, x => {
      wc(x, c => { c.beginPath(); c.ellipse(30, 24, 18, 12, -0.3, 0, 6.28); }, "#C79A5A", 9);
      x.fillStyle = "rgba(255,255,255,0.45)"; x.beginPath(); x.ellipse(24, 19, 6, 3, -0.4, 0, 6.28); x.fill();
      inkLine(x, c => { c.beginPath(); c.ellipse(30, 24, 18, 12, -0.3, 0, 6.28); }, { lw: 1.6 });
    });
  }
  /* ---------- fons de l'estació (sense el cel, que canvia amb l'hora) ---------- */
  function landscape(season) {
    const S = SEASONS[season];
    return bake("g9land_" + season, W, H, (x) => {
      const art=Art.get(season==="hivern"?"garden-winter":season==="tardor"?"garden-autumn":"garden-bg");
      if(art){x.drawImage(art,0,0,W,H);return;}
      const R = mulberry32(season.length * 13 + 3);
      // turons llunyans
      S.hills.forEach((col, i) => {
        const base = 470 + i * 70;
        const path = c => { c.beginPath(); c.moveTo(-20, H); c.lineTo(-20, base); for (let px = 0; px <= W + 40; px += 40) c.lineTo(px, base - 60 * Math.sin(px / (260 + i * 90) + i * 1.7) - 26 * Math.sin(px / 97 + i) - (i === 0 ? 40 : 0)); c.lineTo(W + 20, H); c.closePath(); };
        wc(x, path, col, 11 + i);
        // arbres llunyans sobre els turons
        const ridge = px => base - 60 * Math.sin(px / (260 + i * 90) + i * 1.7) - 26 * Math.sin(px / 97 + i) - (i === 0 ? 40 : 0);
        if (i < 2) for (let gI = 0; gI < 4 + i; gI++) { const gx = 80 + R() * (W - 160), n = 2 + ((R() * 4) | 0); for (let k = 0; k < n; k++) { const px = gx + (k - n / 2) * (16 + R() * 10) * (1 + i * 0.4), py = ridge(px) + 14 + R() * 8, rs = (12 + R() * 8) * (1 + i * 0.45), tc = S.trees[(k + gI) % 3]; x.strokeStyle = rgba("#6A4A30", 0.55); x.lineWidth = 2 + i; x.beginPath(); x.moveTo(px, py); x.lineTo(px, py - rs * 1.2); x.stroke(); wc(x, blob(px, py - rs * 1.6, rs, k + gI * 7 + i * 20, 0.18), tc, k + gI * 7 + i * 30); } }
        if (S.snow && i === 0) { x.save(); x.globalAlpha = 0.65; path(x); x.clip(); x.fillStyle = "#FFFFFF"; x.fillRect(0, 0, W, base - 10); x.restore(); }
      });
      // tanca de fusta
      for (let px = 30; px < W; px += 120) { wc(x, c => { c.beginPath(); c.rect(px - 7, GROUND - 92, 14, 96); }, "#B08A62", px); }
      wc(x, c => { c.beginPath(); c.rect(0, GROUND - 76, W, 10); c.rect(0, GROUND - 40, W, 10); }, "#C29C70", 77);
      // herba i terra en secció
      wc(x, c => { c.beginPath(); c.moveTo(-10, GROUND - 14); for (let px = 0; px <= W + 20; px += 20) c.lineTo(px, GROUND - 14 - Math.sin(px * 0.05) * 4); c.lineTo(W + 10, GROUND + 22); c.lineTo(-10, GROUND + 22); c.closePath(); }, S.snow ? "#F4F6FA" : S.grass, 21);
      const soil = c => { c.beginPath(); c.moveTo(-10, GROUND + 10); for (let px = 0; px <= W + 20; px += 30) c.lineTo(px, GROUND + 8 + Math.sin(px * 0.03) * 5); c.lineTo(W + 10, H + 10); c.lineTo(-10, H + 10); c.closePath(); };
      wc(x, soil, S.soil, 22);
      x.save(); soil(x); x.clip();
      const g = x.createLinearGradient(0, GROUND, 0, H); g.addColorStop(0, "rgba(40,20,10,0)"); g.addColorStop(1, "rgba(40,20,10,0.35)"); x.fillStyle = g; x.fillRect(0, GROUND, W, H - GROUND);
      // pedretes, arrels i un cuc
      for (let k = 0; k < 40; k++) { const px = R() * W, py = GROUND + 40 + R() * 180; wc(x, blob(px, py, 5 + R() * 9, k + 300, 0.3, 7), pick(["#A88A6A", "#8E7660", "#B9A07E", "#6E5A48"]), k + 300); }
      x.strokeStyle = rgba("#4A3020", 0.35); x.lineWidth = 2; x.lineCap = "round";
      for (let k = 0; k < 20; k++) { const px = R() * W, py = GROUND + 12; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + (R() - 0.5) * 60, py + 30, px + (R() - 0.5) * 50, py + 40 + R() * 40); x.stroke(); }
      x.strokeStyle = rgba("#E28A8A", 0.8); x.lineWidth = 7; x.beginPath(); x.moveTo(1330, 860); x.bezierCurveTo(1350, 840, 1370, 880, 1395, 856); x.stroke();
      x.restore();
      // capes de pigment granulat
      x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.2; x.fillStyle = x.createPattern(paperTile(), "repeat"); x.fillRect(0, 380, W, H - 380);
    });
  }
  function grassFront(season) {
    const S = SEASONS[season];
    return bake("g9grass_" + season, W, 60, (x) => {
      const R = mulberry32(5); x.lineCap = "round";
      for (let k = 0; k < 420; k++) { const px = R() * W, L = 10 + R() * 22; x.strokeStyle = rgba(S.snow ? "#C9D8D2" : S.grass, 0.5 + R() * 0.4); x.lineWidth = 2 + R() * 2; x.beginPath(); x.moveTo(px, 44); x.quadraticCurveTo(px + (R() - 0.5) * 8, 44 - L * 0.6, px + (R() - 0.5) * 14, 44 - L); x.stroke(); }
      if (S.snow) { x.fillStyle = "rgba(255,255,255,0.85)"; for (let k = 0; k < 60; k++) { x.beginPath(); x.ellipse(R() * W, 40 + R() * 6, 18 + R() * 20, 5, 0, 0, 6.28); x.fill(); } }
    });
  }
  function cloudSprite(i) {
    return Sprites.get("g9cloud" + i, 320, 140, x => { for (let k = 0; k < 5; k++) wc(x, blob(70 + k * 45, 80 - Math.sin(k / 4 * Math.PI) * 26, 36 + Math.sin(k / 4 * Math.PI) * 18, i * 10 + k, 0.15), "#FFFFFF", i * 10 + k); });
  }
  function skyAt(S, p) {
    const k = p < 0.5 ? p * 2 : (p - 0.5) * 2, a = p < 0.5 ? S.sky[0] : S.sky[1], b = p < 0.5 ? S.sky[1] : S.sky[2];
    return [mix(a[0], b[0], k), mix(a[1], b[1], k)];
  }

  /* ---------- animals ---------- */
  function drawButterfly(ctx, x, y, s, flap, col, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    const k = 0.22 + 0.78 * Math.abs(Math.cos(flap));
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.scale(sd * k, 1);
      ctx.fillStyle = rgba(col, 0.9); ctx.beginPath(); ctx.ellipse(s * 0.42, -s * 0.26, s * 0.46, s * 0.34, -0.55, 0, 6.28); ctx.fill();
      ctx.fillStyle = rgba(col, 0.75); ctx.beginPath(); ctx.ellipse(s * 0.3, s * 0.22, s * 0.3, s * 0.24, 0.55, 0, 6.28); ctx.fill();
      ctx.fillStyle = "rgba(40,25,20,0.35)"; ctx.beginPath(); ctx.ellipse(s * 0.62, -s * 0.38, s * 0.2, s * 0.13, -0.55, 0, 6.28); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)"; ctx.beginPath(); ctx.arc(s * 0.66, -s * 0.4, s * 0.06, 0, 6.28); ctx.fill();
      ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.ellipse(s * 0.42, -s * 0.26, s * 0.46, s * 0.34, -0.55, 0, 6.28); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = "#3A2A22"; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.07, s * 0.36, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#3A2A22"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -s * 0.3); ctx.quadraticCurveTo(-s * 0.1, -s * 0.55, -s * 0.2, -s * 0.6); ctx.moveTo(0, -s * 0.3); ctx.quadraticCurveTo(s * 0.1, -s * 0.55, s * 0.2, -s * 0.6); ctx.stroke();
    ctx.restore();
  }
  function drawBee(ctx, x, y, s, flap, flip, kind) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1);
    if (kind === "marieta") {
      ctx.fillStyle = "#2A2222"; ctx.beginPath(); ctx.arc(s * 0.36, 0, s * 0.2, 0, 6.28); ctx.fill();
      const op = 0.15 + 0.2 * Math.abs(Math.sin(flap));
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(-s * 0.1, -s * 0.3, s * 0.3, s * 0.14, -0.4 - op, 0, 6.28); ctx.fill();
      ctx.fillStyle = "#D8352A"; ctx.beginPath(); ctx.arc(0, 0, s * 0.4, 0, 6.28); ctx.fill();
      ctx.fillStyle = "#2A2222"; [[-0.1, -0.15], [0.15, 0.12], [-0.2, 0.18], [0.12, -0.2]].forEach(([u, v]) => { ctx.beginPath(); ctx.arc(u * s, v * s, s * 0.08, 0, 6.28); ctx.fill(); });
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(-s * 0.12, -s * 0.22, s * 0.12, s * 0.06, -0.5, 0, 6.28); ctx.fill();
      ctx.restore(); return;
    }
    ctx.save(); ctx.scale(1, 0.25 + 0.75 * Math.abs(Math.cos(flap))); ctx.fillStyle = "rgba(235,245,255,0.7)"; ctx.strokeStyle = rgba(INK, 0.4); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(-s * 0.05, -s * 0.36, s * 0.18, s * 0.3, -0.3, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.ellipse(s * 0.14, -s * 0.32, s * 0.14, s * 0.24, 0.3, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.28, 0, 0, 6.28); ctx.fillStyle = "#F2C230"; ctx.fill(); ctx.clip();
    ctx.fillStyle = "#3A2A22"; for (const u of [-0.18, 0.06]) ctx.fillRect(u * s, -s, s * 0.11, s * 2); ctx.restore();
    ctx.fillStyle = "#3A2A22"; ctx.beginPath(); ctx.arc(s * 0.42, -s * 0.02, s * 0.17, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s * 0.47, -s * 0.06, s * 0.05, 0, 6.28); ctx.fill();
    ctx.restore();
  }
  function drawDragonfly(ctx, x, y, s, flap, col, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    for (const sd of [-1, 1]) for (const [yy, L] of [[-0.12, 0.62], [0.06, 0.54]]) {
      ctx.save(); ctx.translate(0, s * yy); ctx.scale(sd * (0.35 + 0.65 * Math.abs(Math.cos(flap + yy * 6))), 1);
      ctx.fillStyle = "rgba(225,242,255,0.6)"; ctx.strokeStyle = rgba(INK, 0.45); ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(s * L * 0.55, 0, s * L * 0.55, s * 0.09, 0, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, s * 0.25, s * 0.05, s * 0.48, 0, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -s * 0.08, s * 0.08, s * 0.14, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#24363A"; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd * s * 0.06, -s * 0.24, s * 0.07, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }
  function drawBird(ctx, x, y, s, wing, flip, kind, o = {}) {
    const B = BIRDS[kind];
    ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1); if (o.tilt) ctx.rotate(o.tilt);
    ctx.fillStyle = shade(B.body, -0.2); ctx.beginPath(); ctx.moveTo(-s * 0.3, -s * 0.05); ctx.lineTo(-s * 0.78, -s * 0.28); ctx.lineTo(-s * 0.72, s * 0.06); ctx.closePath(); ctx.fill();
    if (o.perch) { ctx.strokeStyle = "#6A4A30"; ctx.lineWidth = 2.4; for (const u of [-0.06, 0.1]) { ctx.beginPath(); ctx.moveTo(u * s, s * 0.3); ctx.lineTo(u * s, s * 0.48); ctx.stroke(); } }
    ctx.fillStyle = B.body; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.46, s * 0.34, -0.15, 0, 6.28); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, s * 0.46, s * 0.34, -0.15, 0, 6.28); ctx.clip(); ctx.fillStyle = B.breast; ctx.beginPath(); ctx.ellipse(s * 0.2, s * 0.14, s * 0.34, s * 0.28, 0, 0, 6.28); ctx.fill(); ctx.restore();
    ctx.fillStyle = B.head; ctx.beginPath(); ctx.arc(s * 0.36, -s * 0.26, s * 0.24, 0, 6.28); ctx.fill();
    if (B.cheek) { ctx.fillStyle = B.cheek; ctx.beginPath(); ctx.ellipse(s * 0.38, -s * 0.2, s * 0.12, s * 0.09, 0, 0, 6.28); ctx.fill(); }
    if (kind === "pit-roig") { ctx.fillStyle = B.breast; ctx.beginPath(); ctx.arc(s * 0.44, -s * 0.16, s * 0.15, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = B.beak; ctx.beginPath(); ctx.moveTo(s * 0.56, -s * 0.3); ctx.lineTo(s * 0.76, -s * 0.23); ctx.lineTo(s * 0.56, -s * 0.18); ctx.closePath(); ctx.fill();
    ctx.fillStyle = kind === "merla" ? "#F2A93A" : "#fff"; ctx.beginPath(); ctx.arc(s * 0.43, -s * 0.31, s * 0.065, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#1A1414"; ctx.beginPath(); ctx.arc(s * 0.445, -s * 0.31, s * 0.042, 0, 6.28); ctx.fill();
    ctx.save(); ctx.translate(-s * 0.06, -s * 0.06); ctx.rotate(-wing); ctx.fillStyle = shade(B.body, -0.15); ctx.beginPath(); ctx.ellipse(-s * 0.12, 0, s * 0.34, s * 0.16, 0.25, 0, 6.28); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.45); ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    ctx.strokeStyle = rgba(INK, 0.5); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.ellipse(0, 0, s * 0.46, s * 0.34, -0.15, 0.4, 3.6); ctx.stroke();
    ctx.restore();
  }
  function drawSquirrel(ctx, x, y, s, run, flip, o = {}) {
    const C = "#C2662C", L = "#F2D3AE";
    ctx.save(); ctx.translate(x, y); ctx.scale(flip, 1); if (o.rot) ctx.rotate(o.rot);
    const b = o.sit ? 0 : Math.sin(run) * 0.12;
    // cua
    ctx.save(); ctx.rotate(o.sit ? Math.sin(o.t * 2) * 0.05 : b * 0.6);
    ctx.fillStyle = rgba("#C2662C", 0.95); ctx.beginPath(); ctx.moveTo(-s * 0.3, s * 0.1); ctx.bezierCurveTo(-s * 1.0, s * 0.1, -s * 1.0, -s * 0.9, -s * 0.5, -s * 0.95); ctx.bezierCurveTo(-s * 0.15, -s * 1.0, -s * 0.2, -s * 0.6, -s * 0.45, -s * 0.55); ctx.bezierCurveTo(-s * 0.7, -s * 0.4, -s * 0.5, -s * 0.1, -s * 0.1, -s * 0.05); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = rgba(INK, 0.55); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = "rgba(255,230,200,0.3)"; ctx.beginPath(); ctx.ellipse(-s * 0.62, -s * 0.6, s * 0.12, s * 0.22, 0.4, 0, 6.28); ctx.fill();
    ctx.restore();
    // cos
    ctx.fillStyle = C; ctx.beginPath(); ctx.ellipse(0, -s * (o.sit ? 0.12 : 0.05), s * (o.sit ? 0.3 : 0.4), s * (o.sit ? 0.36 : 0.26), o.sit ? -0.3 : b, 0, 6.28); ctx.fill();
    ctx.fillStyle = L; ctx.beginPath(); ctx.ellipse(s * 0.14, -s * (o.sit ? 0.06 : 0), s * 0.14, s * 0.2, -0.2, 0, 6.28); ctx.fill();
    // potes
    ctx.fillStyle = shade(C, -0.15);
    if (o.sit) { ctx.beginPath(); ctx.ellipse(s * 0.04, s * 0.22, s * 0.16, s * 0.08, 0, 0, 6.28); ctx.fill(); }
    else for (const [u, ph] of [[-0.25, 0], [0.25, Math.PI]]) { const a = Math.sin(run + ph) * 0.6; ctx.beginPath(); ctx.ellipse(s * u + Math.sin(a) * s * 0.12, s * 0.2, s * 0.08, s * 0.12, a, 0, 6.28); ctx.fill(); }
    // cap
    const hx = s * (o.sit ? 0.2 : 0.42), hy = -s * (o.sit ? 0.5 : 0.22);
    ctx.fillStyle = C; ctx.beginPath(); ctx.ellipse(hx, hy, s * 0.22, s * 0.19, 0.2, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx - s * 0.1, hy - s * 0.12); ctx.lineTo(hx - s * 0.04, hy - s * 0.36); ctx.lineTo(hx + s * 0.06, hy - s * 0.12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = L; ctx.beginPath(); ctx.ellipse(hx + s * 0.1, hy + s * 0.06, s * 0.1, s * 0.08, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#1A1414"; ctx.beginPath(); ctx.arc(hx + s * 0.06, hy - s * 0.04, s * 0.045, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(hx + s * 0.21, hy + s * 0.02, s * 0.03, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx + s * 0.05, hy - s * 0.055, s * 0.015, 0, 6.28); ctx.fill();
    if (o.sit) { ctx.fillStyle = "#8A5A30"; ctx.beginPath(); ctx.ellipse(hx + s * 0.12, hy + s * 0.24, s * 0.08, s * 0.1, 0, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  function seasonOf(L) { return SEASON_BY_LEVEL[L - 1]; }
  function kindOf(L) { return L <= 3 ? "flower" : L === 4 ? "bush" : "tree"; }
  const GOAL = { flower: 12, bush: 8, tree: 6 };
  function makeSpec(kind, season, i, seed) {
    const S = SEASONS[season];
    if (kind === "flower") { const [type, col, c2] = S.flowers[i % S.flowers.length]; return { type, col, c2: c2 || "#F2C230", h: (type === "sun" ? 220 : 150) + ((seed * 37) % 50), bend: ((seed * 13) % 30) - 15, seed, season }; }
    if (kind === "bush") return { kind: "bush", col: S.bush[0], c2: S.bush[1], dot: S.dot, snow: S.snow, seed: seed % 4, season, type: "bush" };
    const tk = i % 2 ? (S.tree === "pine" ? "pine" : "green") : S.tree;
    return { kind: tk, col: S.trees[0], seed: (seed + i) % 4, season, type: tk };
  }

  Games.register({
    id: 9, key: "j", name: "Jardí de lletres", zone: "camp", music: "harp", demoTime: 10, captionY: 118, missAt: [800, 330],
    collect: { one: "jardí", many: "jardins" },
    goal: l => l <= 3 ? "Escriu la lletra de cada llavor i la faràs florir. Fes créixer el jardí fins que hi vinguin 6 animals."
      : l === 4 ? "Escriu la síl·laba de cada llavor i naixerà un arbust. Fes venir 6 ocells al jardí d'hivern."
        : "Escriu la paraula de cada llavor i creixerà un arbre. Fes venir 6 animals al jardí.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#86BCE3"); g.addColorStop(1, "#F3E6D2"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const s = Math.max(w / 320, h / 220); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      ctx.fillStyle = "rgba(255,240,200,0.9)"; ctx.beginPath(); ctx.arc(110, -70, 22, 0, 6.28); ctx.fill();
      ctx.fillStyle = "#A8D08E"; ctx.beginPath(); ctx.moveTo(-200, 10); ctx.quadraticCurveTo(-80, -50, 40, -6); ctx.quadraticCurveTo(140, -40, 200, -10); ctx.lineTo(200, 120); ctx.lineTo(-200, 120); ctx.fill();
      ctx.fillStyle = "#7DB862"; ctx.fillRect(-200, 40, 400, 14); ctx.fillStyle = "#8B6040"; ctx.fillRect(-200, 50, 400, 80);
      const fl = [["tulip", "#E8546A"], ["daisy", "#FFFFFF", "#F2C230"], ["poppy", "#E0402E"]];
      fl.forEach(([type, col, c2], i) => { const spec = { type, col, c2: c2 || "#F2C230", h: 150 + i * 14, bend: 8 - i * 6, seed: 3 + i, season: "primavera" }; const sp = plantSprites({ kind: "flower", spec }); const sx = -104 + i * 54; const sw = Math.sin(t * 1.5 + i) * 0.03; ctx.save(); ctx.translate(sx, 52); ctx.rotate(sw); ctx.drawImage(sp.col.c, -40, -148, 80, 150); ctx.drawImage(sp.ink.c, -40, -148, 80, 150); ctx.restore(); });
      drawButterfly(ctx, -30 + Math.sin(t) * 16, -70 + Math.cos(t * 1.3) * 8, 24, t * 9, "#F29A2E", 0.3);
      ctx.fillStyle = "#C79A5A"; ctx.beginPath(); ctx.ellipse(66, 86, 12, 8, -0.3, 0, 6.28); ctx.fill();
      ctx.strokeStyle = "#B08A62"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(66, 80); ctx.lineTo(66, 30); ctx.stroke();
      drawPlate(ctx, "j", 66, 6, { size: 60, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, season = seasonOf(L), S = SEASONS[season], kind = kindOf(L), goal = GOAL[kind];
      const pool = api.pool({ theme: L >= 5 ? "natura" : undefined });
      const nSlots = goal, margin = kind === "tree" ? 170 : kind === "bush" ? 130 : 95;
      const slots = [];
      for (let i = 0; i < nSlots; i++) slots.push({ i, x: margin + i * (W - 2 * margin) / (nSlots - 1) + (kind === "flower" ? ((i * 37) % 19) - 9 : 0), plant: null, seed: null });
      const fontSize = L <= 3 ? 64 : L === 4 ? 52 : 44;
      const wantActive = L <= 3 ? 3 : 2, canY = kind === "tree" ? 170 : 225;
      const plants = [], animals = [], drops = [], wets = [], ambient = [];
      const animalList = ANIMALS[L];
      let grown = 0, arrived = 0, can = null, finishT = -1, said = false, ended = false, specIdx = 0;
      const clouds = [0, 1, 2].map(i => ({ i, x: 200 + i * 560, y: 120 + i * 50, v: 6 + i * 3 }));
      const land = landscape(season), grass = grassFront(season), cs = canSprite(), ss = seedSprite();
      const typer = api.typer({
        targets: () => slots.map(s => s.seed).filter(Boolean),
        rank: t => t.x,
        onStep: t => { t.pop = 1; Sfx.play("pop"); },
        onDone: t => grow(t),
        onMiss: t => { if (t) { t.shake = 0.6; api.particles.emit(t.x, GROUND + 60, { count: 6, color: ["#8B6040", "#6E5040", "#B08A62"], speed: 140, gravity: 500, size: 6, life: 0.5, angle: -Math.PI / 2, spread: 1 }); } },
      });
      function activeTexts() { return slots.filter(s => s.seed).map(s => s.seed.text); }
      function spawnSeed(slot) {
        const txt = pool.next(activeTexts());
        slot.seed = { text: txt, x: slot.x, slot, t: 0, shake: 0, pop: 0, rise: 0 };
        wets.push({ x: slot.x, t: 0 });
      }
      function freeSlots() { return slots.filter(s => !s.plant && !s.seed && !(can && can.slot === s)); }
      function chooseSlot() {
        const free = freeSlots(); if (!free.length) return null;
        const busy = slots.filter(s => s.seed).map(s => s.x);
        const good = free.filter(s => busy.every(bx => Math.abs(bx - s.x) > (kind === "flower" ? 200 : 330)));
        return pick(good.length ? good : free);
      }
      function grow(seed) {
        const slot = seed.slot; slot.seed = null;
        const spec = makeSpec(kind, season, specIdx++, slot.i * 7 + 3);
        const p = { slot, x: slot.x, kind, spec, t: 0, sc: kind === "flower" ? 1.3 : kind === "bush" ? 1.15 : 1.05, sway: rand(0, 6.28), seedText: seed.text, bloomCol: kind === "flower" ? (spec.col === "#FFFFFF" ? "#C8D4EA" : spec.col) : kind === "bush" ? S.bush[0] : S.trees[0] };
        p.spr = plantSprites(p); slot.plant = p; plants.push(p);
        plants.sort((a, b) => a.x - b.x);
        grown++; api.hud.progress = [grown, goal];
        Sfx.play("sprout"); setTimeout(() => Sfx.play("chime", { note: 79 + (grown % 5) * 2 }), 120);
        api.particles.emit(slot.x, GROUND - 10, { count: 14, color: ["#BFE3F2", "#FFFFFF", p.bloomCol], speed: 220, gravity: 300, size: 8, life: 0.7, angle: -Math.PI / 2, spread: 1.2 });
        // arriba un animal cada pocs brots
        const due = Math.min(6, Math.floor(grown * 6 / goal));
        while (animals.length < due) addAnimal(p);
      }
      function addAnimal(p) {
        const [type, col] = animalList[animals.length];
        const fromLeft = p.x > W / 2;
        const a = { type, col: col || "#F29A2E", plant: p, t: 0, phase: "arrive", flip: fromLeft ? 1 : -1, sx: fromLeft ? -90 : W + 90, sy: rand(150, 300), seed: rand(0, 6.28), arrivedSaid: false, delay: 1.1 };
        animals.push(a);
      }
      function anchor(a) {
        const p = a.plant, sp = p.spec, sw = Math.sin(api.t * 1.3 + p.sway) * 0.025;
        if (p.kind === "flower") return [p.x + Math.sin(sw) * sp.h * p.sc, GROUND - sp.h * p.sc - 36];
        if (p.kind === "bush") return [p.x + (a.type === "merla" ? -30 : 10), GROUND - 145 * p.sc];
        return [p.x + (animals.indexOf(a) % 2 ? -66 : 72) * p.sc, GROUND - 296 * p.sc];
      }
      // tres llavors per començar
      for (let k = 0; k < wantActive; k++) { const s = chooseSlot(); if (s) { spawnSeed(s); s.seed.rise = 1; } }
      api.hud.progress = [0, goal];
      return {
        expected() { return ended ? null : typer.expected(); },
        onKey(k) { if (!ended) typer.key(k); },
        update(dt) {
          const sp = api.speed;
          clouds.forEach(c => { c.x += c.v * dt; if (c.x > W + 200) c.x = -340; });
          // regadora: rec periòdic que fa aparèixer llavors noves
          const active = slots.filter(s => s.seed).length, pending = goal - grown - active;
          if (!can && active < wantActive && pending > 0) {
            const slot = chooseSlot();
            if (slot) { const fromLeft = slot.x < W / 2, sx0 = fromLeft ? -200 : W + 200; can = { slot, t: 0, x: sx0, y: canY, fx: sx0, home: sx0, phase: "in", poured: false, flip: fromLeft ? 1 : -1 }; can.tx = slot.x - (kind === "tree" ? 190 : 165) * can.flip; }
          }
          if (can) {
            can.t += dt * sp * (api.demo ? 1.6 : 1);
            if (can.phase === "in") { const k = Ease.inOutCubic(clamp(can.t / 1.0, 0, 1)); can.x = lerp(can.fx, can.tx, k); can.y = canY - Math.sin(k * Math.PI) * 40; if (can.t >= 1.0) { can.phase = "pour"; can.t = 0; } }
            else if (can.phase === "pour") {
              const tip = canTip(can);
              if (drops.length < 70) for (let i = 0; i < 2; i++) drops.push({ x: tip[0] + rand(-6, 6), y: tip[1] + rand(-4, 4), vx: can.flip * rand(40, 90), vy: rand(20, 80), life: 0 });
              if (can.t > 0.45 && !can.poured) { can.poured = true; spawnSeed(can.slot); Sfx.play("splash"); }
              if (can.t >= 0.9) { can.phase = "out"; can.t = 0; can.fx = can.x; can.ox = can.home; }
            } else { const k = Ease.inCubic(clamp(can.t / 0.9, 0, 1)); can.x = lerp(can.fx, can.ox, k); can.y = canY - k * 120; if (can.t >= 0.9) can = null; }
          }
          for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.life += dt; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt; if (d.y > GROUND - 4) drops.splice(i, 1); }
          for (let i = wets.length - 1; i >= 0; i--) { wets[i].t += dt; if (wets[i].t > 4) wets.splice(i, 1); }
          slots.forEach(s => { const sd = s.seed; if (!sd) return; sd.t += dt; sd.rise = Math.min(1, sd.rise + dt * 2.2); sd.shake = Math.max(0, sd.shake - dt); sd.pop = Math.max(0, sd.pop - dt * 3); });
          plants.forEach(p => p.t += dt);
          // animals
          animals.forEach((a, i) => {
            a.t += dt; if (a.delay > 0) { a.delay -= dt; return; }
            const [ax, ay] = anchor(a);
            if (a.type === "esquirol") {
              const p = a.plant;
              if (a.phase === "arrive") { a.phase = "run"; a.x = a.sx; a.y = GROUND - 8; a.run = 0; a.baseX = p.x - 26 * Math.sign(p.x - a.sx); }
              const baseX = a.baseX;
              if (a.phase === "run") { a.run += dt * 16; const dir = Math.sign(baseX - a.x); a.x += dir * 380 * dt; a.y = GROUND - 8 - Math.abs(Math.sin(a.run * 0.5)) * 16; a.flip = dir || 1; if (Math.abs(baseX - a.x) < 12) { a.phase = "climb"; a.t = 0; a.x = baseX; } }
              else if (a.phase === "climb") { const k = Ease.inOutQuad(clamp(a.t / 1.1, 0, 1)); a.run += dt * 18; a.x = lerp(baseX, ax, Ease.inQuad(k)); a.y = lerp(GROUND - 8, ay, k); if (k >= 1) { a.phase = "stay"; a.flip = ax > p.x ? 1 : -1; } }
            } else if (a.phase === "arrive") {
              const k = clamp(a.t / 2.2, 0, 1), e = Ease.inOutCubic(k);
              a.x = lerp(a.sx, ax, e); a.y = lerp(a.sy, ay, e) - Math.sin(e * Math.PI) * 90 + Math.sin(a.t * 5) * 10 * (1 - e);
              a.flip = Math.sign(ax - a.sx) || 1;
              if (k >= 1) a.phase = "stay";
            } else {
              const isFly = BIRDS[a.type] ? false : true;
              a.x = ax + (isFly ? Math.sin(a.t * 1.3 + a.seed) * 26 : 0); a.y = ay + (isFly ? Math.sin(a.t * 2.1 + a.seed) * 12 - 20 : 0);
              if (isFly) a.flip = Math.cos(a.t * 1.3 + a.seed) > 0 ? 1 : -1;
            }
            if ((a.phase === "stay") && !a.arrivedSaid) {
              a.arrivedSaid = true; arrived++; api.hud.label = L_("Animals {n}/6", { n: arrived });
              Sfx.play("chime", { note: 84 }); api.particles.emit(a.x, a.y, { count: 10, color: ["#FFFFFF", "#FFE08A"], shape: "star", size: 10, speed: 160, gravity: 0, life: 0.7 });
              void 0;
            }
          });
          if (!api.hud.label) api.hud.label = L_("Animals {n}/6", { n: 0 });
          // estació: neu o fulles
          if ((S.snow || season === "tardor" || season === "primavera") && ambient.length < 26 && Math.random() < dt * 6) ambient.push({ x: rand(0, W), y: -20, v: rand(30, 60), ph: rand(0, 6.28), r: rand(3, 6), c: S.snow ? "#FFFFFF" : season === "tardor" ? pick(["#E0863A", "#C9542E", "#E8B444"]) : pick(["#F6C2D0", "#FFFFFF"]) });
          for (let i = ambient.length - 1; i >= 0; i--) { const q = ambient[i]; q.y += q.v * dt; q.ph += dt; q.x += Math.sin(q.ph) * 20 * dt; if (q.y > GROUND + 10) ambient.splice(i, 1); }
          // final del jardí
          if (grown >= goal && arrived >= 6 && finishT < 0) { finishT = 0; ended = true; }
          if (finishT >= 0) {
            finishT += dt;
            if (!said && finishT > 0.4) { said = true; void 0; for (let k = 0; k < 5; k++) api.particles.emit(rand(200, 1400), rand(300, 600), { count: 10, color: ["#FFFFFF", "#FFE08A", "#F7A9C4", "#BFE3F2"], shape: "star", size: 12, speed: 200, gravity: 40, life: 1.2 }); Sfx.play("win"); }
            if (finishT > 2.6) api.finish(true, { collectName: season === "hivern" ? "el jardí d'hivern" : season === "estiu" ? "el jardí d'estiu" : season === "tardor" ? "el jardí de tardor" : "el jardí de primavera" });
          }
        },
        draw(ctx) {
          const t = api.t, p = clamp(grown / goal, 0, 1);
          // cel segons l'hora del dia (avança amb el jardí)
          const [top, bot] = skyAt(S, p);
          const g = ctx.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 600);
          const sa = Math.PI * (0.92 - p * 0.84), sx = W / 2 + Math.cos(sa) * 640, sy = 520 - Math.sin(sa) * 380;
          const sg = ctx.createRadialGradient(sx, sy, 10, sx, sy, 150); sg.addColorStop(0, "rgba(255,246,220,0.95)"); sg.addColorStop(0.3, "rgba(255,236,190,0.55)"); sg.addColorStop(1, "rgba(255,236,190,0)"); ctx.fillStyle = sg; ctx.fillRect(sx - 150, sy - 150, 300, 300);
          ctx.fillStyle = p > 0.75 ? "rgba(255,214,160,0.95)" : "rgba(255,246,214,0.95)"; ctx.beginPath(); ctx.arc(sx, sy, 38, 0, 6.28); ctx.fill();
          clouds.forEach(c => Sprites.draw(ctx, cloudSprite(c.i), c.x, c.y, { alpha: 0.85 }));
          ctx.drawImage(land, 0, 0);
          // taques humides a terra
          wets.forEach(w => { const a = w.t < 0.3 ? w.t / 0.3 : 1 - (w.t - 0.3) / 3.7; ctx.save(); ctx.globalAlpha = 0.5 * clamp(a, 0, 1); Sprites.draw(ctx, wetSprite(), w.x, GROUND + 50, { s: 0.6 + Ease.outCubic(clamp(w.t / 0.8, 0, 1)) * 0.4 }); ctx.restore(); });
          // llavors sota terra
          slots.forEach(s => {
            const sd = s.seed; if (!sd) return;
            const shx = sd.shake > 0 ? Math.sin(sd.shake * 50) * 7 * sd.shake : 0;
            const glow = 0.25 + 0.15 * Math.sin(t * 2 + s.i);
            ctx.save(); ctx.globalAlpha = glow; ctx.fillStyle = "#FFE7A8"; ctx.beginPath(); ctx.arc(s.x + shx, GROUND + 70, 28, 0, 6.28); ctx.fill(); ctx.restore();
            Sprites.draw(ctx, ss, s.x + shx, GROUND + 70, { s: 1 + sd.pop * 0.15 });
            if (sd.typed > 0) { const k = sd.typed / sd.text.length; ctx.save(); ctx.strokeStyle = rgba("#5E9E4E", 0.9); ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(s.x + shx, GROUND + 62); ctx.lineTo(s.x + shx, GROUND + 62 - 70 * k); ctx.stroke(); ctx.fillStyle = "#6FAE58"; ctx.beginPath(); ctx.ellipse(s.x + shx - 9, GROUND + 58 - 70 * k, 10 * k + 2, 5 * k + 1, -0.5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(s.x + shx + 9, GROUND + 60 - 70 * k, 10 * k + 2, 5 * k + 1, 0.5, 0, 6.28); ctx.fill(); ctx.restore(); }
          });
          // plantes: taca d'aigua que s'escampa, color que puja i traç que la defineix
          plants.forEach(pl => {
            const [w, h, ax, ay] = PLANT_DIM[pl.kind], k = pl.t;
            if (k < 1.6) { const b = Ease.outCubic(clamp(k / 0.9, 0, 1)); ctx.save(); ctx.globalAlpha = (1 - clamp((k - 0.5) / 1.0, 0, 1)) * 0.7; Sprites.draw(ctx, bloomSprite(pl.bloomCol), pl.x, GROUND - h * pl.sc * 0.62, { s: (0.3 + b * 0.75) * (h * pl.sc / 300) }); ctx.restore(); }
            const gk = Ease.outCubic(clamp((k - 0.15) / 0.9, 0, 1)), ik = clamp((k - 0.7) / 0.6, 0, 1);
            const sw = Math.sin(t * 1.3 + pl.sway) * (pl.kind === "flower" ? 0.025 : 0.008) * gk;
            const sc = (0.6 + 0.4 * Ease.outBack(clamp((k - 0.1) / 0.9, 0, 1))) * pl.sc;
            ctx.save(); ctx.translate(pl.x, GROUND + 4); ctx.rotate(sw); ctx.scale(sc, sc);
            if (gk < 1) { ctx.beginPath(); ctx.rect(-w, -h * gk - 10, w * 2, h * gk + 20); ctx.clip(); }
            ctx.drawImage(pl.spr.col.c, -ax, -ay, w, h);
            if (ik > 0) { ctx.globalAlpha = ik; ctx.drawImage(pl.spr.ink.c, -ax, -ay, w, h); }
            ctx.restore();
          });
          // estaques amb la placa
          slots.forEach(s => { const sd = s.seed; if (!sd) return; const r = Ease.outBack(sd.rise); ctx.save(); ctx.globalAlpha = clamp(sd.rise * 2, 0, 1); ctx.fillStyle = "#B08A62"; ctx.fillRect(s.x - 4, GROUND - 40 + (1 - r) * 60, 8, 92); ctx.fillStyle = "rgba(60,40,20,0.3)"; ctx.fillRect(s.x + 1, GROUND - 40 + (1 - r) * 60, 3, 92); ctx.restore(); });
          // animals
          animals.forEach(a => {
            if (a.delay > 0 || a.x == null) return;
            const fl = a.t * 14 + a.seed;
            if (a.type === "papallona") drawButterfly(ctx, a.x, a.y, 34, a.t * 9 + a.seed, a.col, a.phase === "stay" ? Math.sin(a.t) * 0.25 : a.flip * 0.5);
            else if (a.type === "abella" || a.type === "marieta") drawBee(ctx, a.x, a.y, 30, fl * 2, a.flip, a.type);
            else if (a.type === "libèl·lula") drawDragonfly(ctx, a.x, a.y, 62, fl * 2, a.col, a.flip * 1.3 + Math.sin(a.t) * 0.15);
            else if (BIRDS[a.type]) { const perched = a.phase === "stay"; const hop = perched ? Math.max(0, Math.sin(a.t * 2.4 + a.seed)) ** 6 * 14 : 0; drawBird(ctx, a.x, a.y - hop - (perched ? 18 : 0), 40, perched ? 0.1 : Math.sin(fl) * 0.9, a.flip, a.type, { perch: perched, tilt: perched ? Math.sin(a.t * 1.7) * 0.08 : 0 }); }
            else if (a.type === "esquirol") drawSquirrel(ctx, a.x, a.y, 44, a.run || 0, a.flip, { sit: a.phase === "stay", rot: a.phase === "climb" ? -1.2 : 0, t: a.t });
          });
          // regadora i gotes
          ctx.fillStyle = "rgba(120,180,220,0.75)"; drops.forEach(d => { ctx.beginPath(); ctx.ellipse(d.x, d.y, 2.6, 5, 0, 0, 6.28); ctx.fill(); });
          if (can) { const tilt = can.phase === "pour" ? Ease.outCubic(clamp(can.t / 0.25, 0, 1)) * 0.55 * (can.t > 0.7 ? clamp((0.9 - can.t) / 0.2, 0, 1) : 1) : 0; ctx.save(); ctx.translate(can.x, can.y); ctx.scale(can.flip, 1); ctx.rotate(tilt); Sprites.draw(ctx, cs, 0, 0); ctx.restore(); }
          ambient.forEach(q => { ctx.fillStyle = rgba(q.c, 0.85); ctx.beginPath(); ctx.ellipse(q.x, q.y, q.r, q.r * (S.snow ? 1 : 0.55), q.ph, 0, 6.28); ctx.fill(); });
          if(!Art.get("garden-bg")) ctx.drawImage(grass, 0, GROUND - 40);
          // paper de gra gruixut (abans de les plaques: la textura mai toca la lletra)
          ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.28; ctx.fillStyle = ctx.createPattern(paperTile(), "repeat"); ctx.fillRect(0, 0, W, H); ctx.restore();
          drawVignette(ctx, 0.22, "70,50,30");
          // plaques
          slots.forEach(s => {
            const sd = s.seed; if (!sd) return;
            const r = Ease.outBack(sd.rise), py = GROUND - 62 - (fontSize < 64 ? -10 : 0) + (1 - r) * 60;
            drawPlate(ctx, sd.text, s.x, py, { size: fontSize, progress: sd.typed, state: sd.locked ? "active" : null, alpha: clamp(sd.rise * 2, 0, 1), border: sd.locked ? null : "#7FA86A", borderW: 3 });
          });
        },
      };
      function canTip(c) { const a = c.phase === "pour" ? 0.55 : 0, dx = 94, dy = -29; return [c.x + c.flip * (dx * Math.cos(a) - dy * Math.sin(a)), c.y + dx * Math.sin(a) + dy * Math.cos(a)]; }
    },
  });
})();
