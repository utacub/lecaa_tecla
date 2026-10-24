"use strict";
/* 21. La granja amagada — dibuix de ceres: portes que s'obren i animals que surten */
(() => {
  const HAS = () => typeof Critters !== "undefined";
  const FARM = ["vaca", "porc", "gallina", "ovella", "cavall", "anec", "conill", "cabra", "ruc", "gat", "gos", "pollet"];
  const EXTRA = ["guineu", "mussol", "granota", "esquirol", "erico", "cargol", "marieta", "abella"];
  const ALL = FARM.concat(EXTRA);
  const FEM = new Set(["vaca", "gallina", "ovella", "cabra", "guineu", "granota", "marieta", "abella"]);
  const NAME = { vaca: "vaca", porc: "porc", gallina: "gallina", ovella: "ovella", cavall: "cavall", anec: "ànec", conill: "conill", cabra: "cabra", ruc: "ruc", gat: "gat", gos: "gos", pollet: "pollet", guineu: "guineu", mussol: "mussol", granota: "granota", esquirol: "esquirol", erico: "eriçó", cargol: "cargol", marieta: "marieta", abella: "abella" };
  const nameOf = id => (HAS() && Critters.name(id)) || NAME[id] || id;
  const phrase = id => { const n = nameOf(id); return (/^[aàeèéiíoòóuú]/.test(n) ? (FEM.has(id) ? "una " : "un ") : FEM.has(id) ? "la " : "el ") + n; };
  const STYLE = { porc: "slide", gallina: "fly", anec: "fly", pollet: "fly", mussol: "fly", abella: "fly", conill: "hop", granota: "hop", esquirol: "hop", cargol: "slow", marieta: "fly" };
  // portes: x, y (centre), w, h, color, fulles (1 o 2)
  const DOORS = [
    { x: 251, y: 474, w: 178, h: 286, col: "#3E7CC0", leaves: 1 },
    { x: 800, y: 439, w: 310, h: 253, col: "#F2E6C8", leaves: 2, main: true },
    { x: 801, y: 211, w: 190, h: 148, col: "#F2E6C8", leaves: 1 },
    { x: 1351, y: 480, w: 126, h: 244, col: "#E8963A", leaves: 1 },
  ];
  const GROUND = 714, NB = [110, 742, 1380, 148];

  /* ---------- ceres ---------- */
  function wob(pts, closed, seg = 22) { // subdivideix per poder fer tremolar el traç
    const out = [], n = pts.length, m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) { const a = pts[i], b = pts[(i + 1) % n], d = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(d / seg)); for (let j = 0; j < k; j++) out.push([lerp(a[0], b[0], j / k), lerp(a[1], b[1], j / k)]); }
    if (!closed) out.push(pts[n - 1]); return out;
  }
  function crayonLine(x, pts, col, lw, R, closed) {
    const P = wob(pts, closed);
    x.save(); x.lineCap = "round"; x.lineJoin = "round"; x.strokeStyle = col;
    for (let p = 0; p < 3; p++) {
      x.globalAlpha = p === 0 ? 0.9 : 0.4; x.lineWidth = p === 0 ? lw : lw * 0.55;
      x.beginPath(); const N = closed ? P.length + 1 : P.length;
      for (let i = 0; i < N; i++) { const q = P[i % P.length], j = lw * 0.8; i ? x.lineTo(q[0] + (R() - 0.5) * j, q[1] + (R() - 0.5) * j) : x.moveTo(q[0] + (R() - 0.5) * j, q[1] + (R() - 0.5) * j); }
      x.stroke();
    }
    x.restore();
  }
  const polyPath = pts => c => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); };
  const bboxOf = pts => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; pts.forEach(p => { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); }); return [a - 10, b - 10, c - a + 20, d - b + 20]; };
  function fill(x, pts, col, seed) { const bb = bboxOf(pts); Mat.crayon(x, polyPath(pts), col, { bbox: bb, seed, strokes: Math.round(bb[2] * bb[3] / 520) + 20, pores: Math.round(bb[2] * bb[3] / 90), outline: false }); }
  const rect = (x0, y0, w, h) => [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]];
  const ellPts = (cx, cy, rx, ry, n = 28) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.283) * rx, cy + Math.sin(i / n * 6.283) * ry]);
  function pores(x, w, h, n, seed) { const R = mulberry32(seed); x.save(); x.globalCompositeOperation = "destination-out"; x.fillStyle = "rgba(0,0,0,0.55)"; for (let k = 0; k < n; k++) x.fillRect(R() * w, R() * h, 1 + R() * 1.6, 1 + R() * 1.2); x.restore(); }

  /* formes de l'escena (per a l'emplenat i per als contorns que bullen) */
  const SHAPES = (() => {
    const S = [];
    const hill = (y0, amp, ph) => { const p = [[0, 900], [0, y0]]; for (let xx = 0; xx <= 1600; xx += 40) p.push([xx, y0 - Math.sin(xx / 260 + ph) * amp - Math.sin(xx / 97) * amp * 0.2]); p.push([1600, y0], [1600, 900]); return p; };
    S.push({ pts: hill(470, 40, 0.5), col: "#9CCB6B", line: "#5E8F3A", lw: 4, open: true });
    S.push({ pts: hill(545, 22, 2.1), col: "#7DBA4F", line: "#4E7F2E", lw: 4, open: true });
    S.push({ pts: ellPts(1460, 150, 66, 66), col: "#FFD23F", line: "#E89A1C", lw: 5 });
    S.push({ cloud: [330, 150, 1] }, { cloud: [880, 105, 0.8] }, { cloud: [1170, 210, 0.6] });
    // cobert de l'esquerra
    S.push({ pts: rect(120, 470, 320, 244), col: "#F0B84A", line: "#9A6A1E", lw: 5 });
    S.push({ pts: [[96, 482], [280, 372], [464, 482]], col: "#8A5A3B", line: "#4E3020", lw: 5 });
    // graner
    S.push({ pts: rect(540, 336, 520, 378), col: "#D9443A", line: "#7E1F18", lw: 6 });
    S.push({ pts: [[512, 348], [800, 162], [1088, 348]], col: "#7A3B2E", line: "#3E1A12", lw: 6 });
    S.push({ pts: [[560, 340], [800, 186], [1040, 340]], col: "#C8382F", line: "#7E1F18", lw: 4 });
    S.push({ pts: rect(600, 392, 76, 70), col: "#FFF4D6", line: "#7E1F18", lw: 5, cross: true });
    S.push({ pts: rect(924, 392, 76, 70), col: "#FFF4D6", line: "#7E1F18", lw: 5, cross: true });
    // galliner
    S.push({ pts: rect(1160, 530, 272, 184), col: "#F4E2B8", line: "#9A7A3E", lw: 5 });
    S.push({ pts: [[1136, 540], [1296, 444], [1456, 540]], col: "#C8382F", line: "#7E1F18", lw: 5 });
    // tanca
    for (const [a, b] of [[440, 540], [1060, 1160], [1432, 1600]]) for (let xx = a + 14; xx < b; xx += 34) S.push({ pts: rect(xx - 7, 640, 14, 74), col: "#E9D2A6", line: "#8A6A3A", lw: 3 });
    for (const [a, b] of [[440, 540], [1060, 1160], [1432, 1600]]) { S.push({ pts: rect(a, 652, b - a, 9), col: "#D9BC88", line: "#8A6A3A", lw: 3 }); S.push({ pts: rect(a, 686, b - a, 9), col: "#D9BC88", line: "#8A6A3A", lw: 3 }); }
    return S;
  })();
  function cloudPts(cx, cy, s) { const p = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.283; const r = 1 + 0.18 * Math.sin(a * 5); p.push([cx + Math.cos(a) * 110 * s * r, cy + Math.sin(a) * 44 * s * r]); } return p; }

  let SCN = null;
  /* tres versions completes de l'escena (el traç "bull" alternant-les a 8 fps) */
  function buildScene() {
    if (SCN) return;
    const paper = Tex.paper(W, H, "#FBF7EC", { seed: 21, fiber: 1.3 });
    SCN = [0, 1, 2].map(v => {
      const L = makeCanvas(W, H), x = L.getContext("2d"), Rv = mulberry32(500 + v * 17), R = mulberry32(2121);
      // cel de cera blava, gargots amples i suaus
      x.save(); x.lineCap = "round";
      for (let k = 0; k < 520; k++) { const y0 = R() * 540, x0 = R() * W - 60, L2 = 70 + R() * 120; x.strokeStyle = R() < 0.5 ? "#7FB8E8" : "#A7D0F2"; x.globalAlpha = 0.1 + R() * 0.14 * (1 - y0 / 640); x.lineWidth = 7 + R() * 8; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + L2, y0 - L2 * 0.12); x.stroke(); }
      x.restore();
      let seed = 1;
      for (const s of SHAPES) {
        if (s.cloud) { const p = cloudPts(...s.cloud); fill(x, p, "#FFFFFF", seed++); crayonLine(x, p, "#8DB6DA", 4, Rv, true); continue; }
        fill(x, s.pts, s.col, seed++);
        if (s.open) crayonLine(x, s.pts.slice(2, -2), s.line, s.lw, Rv, false); else crayonLine(x, s.pts, s.line, s.lw, Rv, true);
        if (s.cross) { const [a, , c2] = s.pts; crayonLine(x, [[(a[0] + c2[0]) / 2, a[1]], [(a[0] + c2[0]) / 2, c2[1]]], s.line, 4, Rv, false); crayonLine(x, [[a[0], (a[1] + c2[1]) / 2], [c2[0], (a[1] + c2[1]) / 2]], s.line, 4, Rv, false); }
        if (s.pts.length === 28) for (let k = 0; k < 10; k++) { const an = k / 10 * 6.283 + v * 0.03; crayonLine(x, [[1460 + Math.cos(an) * 84, 150 + Math.sin(an) * 84], [1460 + Math.cos(an) * 120, 150 + Math.sin(an) * 120]], "#F2A81E", 5, Rv, false); }
      }
      // interiors foscos de les portes (es veuen quan s'obren)
      DOORS.forEach((d, i) => { fill(x, rect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h), "#3B2A22", 90 + i); x.save(); x.strokeStyle = "#E9C25A"; x.lineCap = "round"; const Rh = mulberry32(60 + i); for (let k = 0; k < 26; k++) { x.globalAlpha = 0.6; x.lineWidth = 2.5; const px = d.x - d.w / 2 + Rh() * d.w, py = d.y + d.h / 2 - Rh() * d.h * 0.25; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Rh() - 0.5) * 30, py - 10 - Rh() * 16); x.stroke(); } x.restore(); crayonLine(x, rect(d.x - d.w / 2, d.y - d.h / 2, d.w, d.h), "#2A1A12", 5, Rv, true); });
      // camí de terra i brins d'herba
      fill(x, [[0, 708], [1600, 708], [1600, 760], [0, 760]], "#C99A62", 77); crayonLine(x, [[0, 708], [1600, 708]], "#8A6238", 4, Rv, false);
      const Rg = mulberry32(900); for (let k = 0; k < 70; k++) { const gx = Rg() * W, gy = 560 + Rg() * 140; if ((gx > 520 && gx < 1080) || (gx > 110 && gx < 450 && gy > 460) || (gx > 1150 && gx < 1440 && gy > 520)) continue; crayonLine(x, [[gx, gy], [gx + (Rg() - 0.5) * 8, gy - 12 - Rg() * 10]], "#4E8F2E", 3, Rv, false); }
      // composició sobre el paper: els porus de la cera deixen veure el paper
      const c = makeCanvas(W, H), y = c.getContext("2d"); y.drawImage(paper, 0, 0); y.drawImage(L, 0, 0);
      if(Art.get("farm-bg"))y.drawImage(Art.get("farm-bg"),0,0,W,H);
      // quadern de l'excursió
      const [nx, ny, nw, nh] = NB;
      y.save(); y.shadowColor = "rgba(60,40,20,0.35)"; y.shadowBlur = 16; y.shadowOffsetY = 6; rr(y, nx, ny, nw, nh, 14); y.fillStyle = "#A8743F"; y.fill(); y.restore();
      rr(y, nx + 8, ny + 6, nw - 16, nh - 10, 10); y.fillStyle = "#FFFDF4"; y.fill();
      y.save(); rr(y, nx + 8, ny + 6, nw - 16, nh - 10, 10); y.clip(); y.strokeStyle = "rgba(90,140,200,0.22)"; y.lineWidth = 1; for (let yy = ny + 20; yy < ny + nh; yy += 18) { y.beginPath(); y.moveTo(nx, yy); y.lineTo(nx + nw, yy); y.stroke(); } y.strokeStyle = "rgba(220,80,80,0.3)"; y.beginPath(); y.moveTo(nx + 70, ny); y.lineTo(nx + 70, ny + nh); y.stroke(); y.restore();
      for (let xx = nx + 30; xx < nx + nw - 20; xx += 34) { y.strokeStyle = "#8B8F96"; y.lineWidth = 4; y.beginPath(); y.ellipse(xx, ny + 4, 6, 12, 0, 0, 6.28); y.stroke(); }
      text(y, "El meu quadern", nx + 36, ny + nh / 2, { size: 22, weight: 800, font: FONT_T, color: "#6A4A2A", align: "left" });
      return c;
    });
  }
  /* fulla de porta prerenderitzada */
  function leafSprite(d, w, h, flipBrace) {
    return Sprites.get(`v21leaf${d.col}${w}x${h}${flipBrace ? 1 : 0}`, w + 12, h + 12, (x) => {
      const i=d.col==="#3E7CC0"?0:d.main?1:d.col==="#E8963A"?3:2;
      const im=Art.get("farm-doors"),box=Art.rects["farm-doors"]?.[i];if(im&&box){x.drawImage(im,...box,0,0,w+12,h+12);return;}
      x.translate(6, 6); const R = mulberry32(w * 7 + h);
      Mat.crayon(x, polyPath(rect(0, 0, w, h)), d.col, { bbox: [0, 0, w, h], seed: w + h, strokes: Math.round(w * h / 300), pores: Math.round(w * h / 60), outline: false });
      const dark = shade(d.col, -0.4);
      for (let px = w / 4; px < w - 4; px += w / 4) crayonLine(x, [[px, 4], [px, h - 4]], dark, 2.5, R, false);
      crayonLine(x, [[6, 8], [w - 6, 8], [w - 6, h - 8], [6, h - 8]], "#FFFFFF", 6, R, true);
      crayonLine(x, flipBrace ? [[w - 8, 10], [8, h - 10]] : [[8, 10], [w - 8, h - 10]], "#FFFFFF", 6, R, false);
      crayonLine(x, rect(0, 0, w, h), "#2A1A12", 4, R, true);
      x.fillStyle = "#5A5A60"; for (const yy of [h * 0.18, h * 0.82]) { x.beginPath(); x.arc(flipBrace ? w - 6 : 6, yy, 4, 0, 6.28); x.fill(); }
    });
  }
  const shadowBlob = () => Sprites.get("v21shadow", 160, 40, (x) => { x.strokeStyle = "rgba(60,90,30,0.55)"; x.lineCap = "round"; const R = mulberry32(3); for (let k = 0; k < 40; k++) { const a = R() * 6.283, r = R(); x.lineWidth = 3; x.globalAlpha = 0.5; x.beginPath(); const px = 80 + Math.cos(a) * 66 * r, py = 20 + Math.sin(a) * 13 * r; x.moveTo(px - 10, py + 3); x.lineTo(px + 10, py - 3); x.stroke(); } });
  function sticker(id) {
    return Sprites.get("v21st_" + id, 104, 96, (x) => {
      const R = mulberry32(id.length * 13 + id.charCodeAt(0));
      Mat.crayon(x, c => { blobPath(c, 52, 50, 42, id.charCodeAt(1) || 3, 0.12, 9); }, "#FFE9A8", { bbox: [0, 0, 104, 96], seed: 5, strokes: 30, pores: 200, outline: false });
      const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; p.push([52 + Math.cos(a) * 44, 50 + Math.sin(a) * 42]); } crayonLine(x, p, "#E0904A", 3.5, R, true);
      if (HAS()) Art.farmAnimal(x, id, 52, 48, 74, { t: 0 });
    });
  }
  /* ratolí de ceres que diu "no, no" amb el cap */
  function drawMouse(ctx, x, y, t, k) {
    ctx.save(); ctx.translate(x, y + (1 - k) * 40); ctx.scale(1.3, 1.3); ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.fillStyle = "#A9A4A0"; ctx.strokeStyle = "#4A4442"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 18, 30, 20, 0, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(0, -6); ctx.rotate(Math.sin(t * 13) * 0.32);
    for (const s of [-1, 1]) { ctx.fillStyle = "#A9A4A0"; ctx.beginPath(); ctx.arc(s * 20, -18, 13, 0, 6.28); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#F2A7B8"; ctx.beginPath(); ctx.arc(s * 20, -18, 7, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = "#B9B4B0"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 18, 0, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#2B2320"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * 8, -3, 3.4, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = "#F07A90"; ctx.beginPath(); ctx.arc(0, 6, 4, 0, 6.28); ctx.fill();
    ctx.strokeStyle = "#4A4442"; ctx.lineWidth = 1.5; for (const s of [-1, 1]) for (const dy of [-2, 3]) { ctx.beginPath(); ctx.moveTo(s * 6, 7); ctx.lineTo(s * 26, 7 + dy * 2); ctx.stroke(); }
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-4, 13); ctx.quadraticCurveTo(0, 10, 4, 13); ctx.stroke();
    ctx.restore(); ctx.restore();
  }
  /* sons dels animals (sintetitzats) */
  function animalSound(id) {
    const T = (o) => tone(o), N = (o) => noise(o);
    switch (id) {
      case "vaca": T({ f: 150, f2: 115, d: 0.9, type: "sawtooth", v: 0.16, lp: 700, a: 0.08 }); break;
      case "porc": for (let i = 0; i < 2; i++) { N({ f: 420, q: 3, d: 0.12, v: 0.4, delay: i * 0.17 }); T({ f: 160, f2: 120, d: 0.12, type: "square", v: 0.08, lp: 600, delay: i * 0.17 }); } break;
      case "gallina": case "pollet": for (let i = 0; i < 3; i++) T({ f: id === "pollet" ? 2200 : 900, f2: id === "pollet" ? 2600 : 600, d: 0.09, type: "triangle", v: 0.16, delay: i * 0.13 }); break;
      case "ovella": case "cabra": for (let i = 0; i < 6; i++) T({ f: 320 + (i % 2) * 18, d: 0.08, type: "sawtooth", v: 0.1, lp: 1500, delay: i * 0.07 }); break;
      case "cavall": [700, 1000, 820, 1050, 600].forEach((f, i) => T({ f, d: 0.1, type: "triangle", v: 0.14, delay: i * 0.08 })); break;
      case "anec": for (let i = 0; i < 2; i++) T({ f: 520, f2: 380, d: 0.14, type: "square", v: 0.08, lp: 1300, delay: i * 0.2 }); break;
      case "gat": T({ f: 600, f2: 900, slide: 0.2, d: 0.45, type: "triangle", v: 0.16 }); break;
      case "gos": for (let i = 0; i < 2; i++) { N({ f: 700, q: 2, d: 0.08, v: 0.4, delay: i * 0.22 }); T({ f: 300, f2: 200, d: 0.1, type: "square", v: 0.08, lp: 900, delay: i * 0.22 }); } break;
      case "ruc": [900, 320, 900, 320].forEach((f, i) => T({ f, d: 0.16, type: "sawtooth", v: 0.08, lp: 1400, delay: i * 0.18 })); break;
      case "mussol": T({ f: 420, d: 0.3, type: "sine", v: 0.2 }); T({ f: 380, d: 0.4, type: "sine", v: 0.2, delay: 0.38 }); break;
      case "granota": N({ f: 500, q: 6, d: 0.2, v: 0.4 }); N({ f: 500, q: 6, d: 0.2, v: 0.4, delay: 0.26 }); break;
      case "abella": T({ f: 220, d: 0.6, type: "sawtooth", v: 0.07, lp: 800 }); break;
      default: Sfx.play("boing");
    }
  }

  Games.register({
    id: 21, key: "v", name: "La granja amagada", zone: "camp", music: "country", demoTime: 11, captionY: 118, missAt: [420, 250],
    collect: { one: "quadern de l'excursió", many: "quaderns de l'excursió" },
    goal: l => l <= 3 ? "Escriu la lletra d'una porta per obrir-la i descobrir l'animal." : l === 4 ? "Escriu la síl·laba d'una porta per obrir-la i descobrir l'animal." : "Escolta el nom de l'animal i escriu-lo per cridar-lo.",
    thumb(ctx, x, y, w, h, t) {
      const sp = Sprites.get("v21thumb", 300, 220, (c) => {
        if(Art.get("farm-bg")){const im=Art.get("farm-bg");c.drawImage(im,im.width*.22,0,im.width*.56,im.height,0,0,300,220);return;}
        c.drawImage(Tex.paper(300, 220, "#FBF7EC", { seed: 21 }), 0, 0);
        const R = mulberry32(5); c.lineCap = "round"; for (let k = 0; k < 120; k++) { c.strokeStyle = "#8EC3EC"; c.globalAlpha = 0.3; c.lineWidth = 4; const px = R() * 300, py = R() * 120; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 30, py - 10); c.stroke(); } c.globalAlpha = 1;
        fill(c, [[0, 220], [0, 150], [300, 140], [300, 220]], "#7DBA4F", 3);
        fill(c, rect(70, 90, 160, 120), "#D9443A", 4); fill(c, [[56, 96], [150, 30], [244, 96]], "#7A3B2E", 5);
        fill(c, rect(110, 130, 80, 80), "#3B2A22", 6);
        crayonLine(c, rect(70, 90, 160, 120), "#7E1F18", 4, R, true); crayonLine(c, [[56, 96], [150, 30], [244, 96]], "#3E1A12", 4, R, true);
        fill(c, ellPts(262, 34, 22, 22), "#FFD23F", 7);
      });
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const sc = Math.max(w / 300, h / 220); ctx.drawImage(sp.c, x + w / 2 - 150 * sc, y + h / 2 - 110 * sc, 300 * sc, 220 * sc);
      const cx = x + w / 2, by = y + h / 2 + 100 * sc;
      if (HAS()) Art.farmAnimal(ctx, "vaca", cx, by - 38 * sc - Math.abs(Math.sin(t * 2.5)) * 6 * sc, 84 * sc, { t, pose: "happy" });
      // porta mig oberta
      const lw = leafSprite(DOORS[3], 40, 80, false); ctx.save(); ctx.translate(cx - 40 * sc, y + h / 2 + 20 * sc); ctx.scale(0.35 * sc, sc); ctx.drawImage(lw.c, 0, 0, 52, 92); ctx.restore();
      drawPlate(ctx, "v", cx + 58 * sc, y + h / 2 - 34 * sc, { size: 30 * sc, shadowBlur: 4 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, GOAL = L >= 5 ? 12 : 20;
      buildScene();
      let order = shuffle(L === 5 ? ALL.filter(id => /^[a-zç]+$/.test(nameOf(id))) : ALL);
      if (api.demo) order = ["porc", "gallina", "vaca"].concat(order.filter(i => !["porc", "gallina", "vaca"].includes(i)));
      let nextA = 0;
      const pool = api.pool(L >= 5 ? { items: order.map(id => L === 6 ? phrase(id) : nameOf(id)) } : undefined);
      const doors = DOORS.map((d, i) => ({ ...d, i, text: null, open: 0, opening: 0, typed: 0, rank: 0, mouse: 0 }));
      const found = [], st = { t: 0, busy: false, endT: -1 };
      let animal = null; // animal en escena
      const usable = L >= 5 ? doors.filter(d => d.main) : doors;
      function assign(d) {
        if (L >= 5) {
          const id = order[nextA % order.length]; d.text = L === 6 ? phrase(id) : nameOf(id); d.aid = id; d.typed = 0; d.done = false; d.dead = false;
          const spokenText = d.text;
          setTimeout(() => { if (d.text === spokenText && !d.done) api.sayItem(spokenText, "{x}"); }, api.demo ? 50 : 300);
        } else {
          const others = usable.filter(o => o !== d && o.text).map(o => o.text);
          d.text = pool.next(others); d.typed = 0; d.done = false; d.dead = false; d.rank = rand(0, 1);
        }
      }
      usable.forEach(assign);
      const typer = api.typer({
        targets: () => st.busy || st.endT >= 0 ? [] : usable.filter(d => d.text && d.open === 0),
        rank: d => d.rank,
        onStep: (d) => { Sfx.play("wood"); },
        onDone: (d) => openDoor(d),
        onMiss: (d, k) => { const m = d || pick(usable); m.mouseAt = App.t; Sfx.play("pop"); setTimeout(() => Sfx.play("tick"), 300); setTimeout(() => Sfx.play("tick"), 500); },
      });
      function openDoor(d) {
        st.busy = true; d.opening = 1; Sfx.play("clack"); noise({ f: 300, f2: 120, d: 0.5, v: 0.12, q: 0.8 });
        const id = L >= 5 ? d.aid : order[nextA % order.length]; nextA++;
        animal = { id, d, t: 0, style: STYLE[id] || "jump", phase: "out", slot: found.length };
      }
      function slotPos(i) { const per = Math.ceil(GOAL / 2), col = i % per, row = Math.floor(i / per), sx = NB[0] + 230 + col * ((NB[2] - 280) / per); return [sx, NB[1] + 44 + row * 66]; }
      return {
        expected() { return st.busy || st.endT >= 0 ? null : typer.expected(); },
        onKey(k) { if (st.busy || st.endT >= 0) return; typer.key(k); },
        update(dt) {
          st.t += dt;
          doors.forEach(d => {
            if (d.opening > 0) d.open = Math.min(1, d.open + dt / 0.45);
            else d.open = Math.max(0, d.open - dt / 0.35);
          });
          if (animal) {
            const a = animal; a.t += dt;
            if (a.phase === "out" && a.t > 0.35 && !a.said) { a.said = true; animalSound(a.id); setTimeout(() => void 0, 350); api.particles.emit(a.d.x, GROUND - 40, { count: 12, color: ["#F2B630", "#E8603A", "#7DBA4F", "#fff"], shape: "confetti", speed: 280, gravity: 500, size: 10, life: 0.9 }); }
            if (a.phase === "out" && a.t > 1.9) { a.phase = "fly"; a.t = 0; a.d.opening = 0; Sfx.play("whoosh"); a.d.text = null; }
            if (a.phase === "fly" && a.t > 0.75) {
              found.push(a.id); Sfx.play("plof");
              const [sx, sy] = slotPos(a.slot); api.particles.emit(sx, sy, { count: 14, color: ["#FFD23F", "#E0904A", "#fff"], shape: "star", speed: 200, gravity: 200, size: 9, life: 0.6 });
              const d = a.d; animal = null; st.busy = false;
              if (found.length >= GOAL) { st.endT = 0; Sfx.play("win"); }
              else setTimeout(() => { if (st.endT < 0) assign(d); }, 350);
            }
          }
          if (st.endT >= 0) { st.endT += dt; if (st.endT > 2.0 && !st.fin) { st.fin = true; api.finish(true, { collectName: "el quadern de l'excursió" }); } }
          api.hud.progress = [found.length, GOAL];
        },
        draw(ctx) {
          const t = api.t, boil = Math.floor(t * 8) % 3;
          ctx.drawImage(SCN[boil], 0, 0);
          // portes
          // el ratolí treu el cap per darrere del cantó de la porta
          doors.forEach(d => { const e = App.t - (d.mouseAt == null ? -99 : d.mouseAt); if (e < 1.8) { const k = Ease.outBack(clamp(Math.min(e, 1.8 - e) * 5, 0, 1)); drawMouse(ctx, d.x + d.w / 2 + 4 - (1 - k) * 36, d.y + (d.main ? 0 : d.h * 0.05), App.t, 1); } });
          doors.forEach(d => {
            const q = Math.floor(d.open * 6) / 6; // s'obre "redibuixant-se" a cops, com un dibuix animat
            const leaves = d.leaves, lw = d.w / leaves, ang = q * 1.3;
            for (let k = 0; k < leaves; k++) {
              const right = leaves === 2 && k === 1, sp = leafSprite(d, Math.round(lw), d.h, right);
              const hx = right ? d.x + d.w / 2 : d.x - d.w / 2 + (leaves === 2 ? 0 : 0), sx = Math.cos(ang), y0 = d.y - d.h / 2;
              ctx.save(); ctx.translate(hx, y0); ctx.scale(right ? -sx : sx, 1 + q * 0.05); if (right) ctx.scale(-1, 1);
              ctx.drawImage(sp.c, right ? -lw - 6 : -6, -6 - q * 4, lw + 12, d.h + 12);
              if (q > 0) { ctx.fillStyle = `rgba(40,25,15,${q * 0.35})`; ctx.fillRect(right ? -lw : 0, -q * 4, lw, d.h); }
              ctx.restore();
            }
            if (d.text && d.open < 0.34) {
              const a = 1 - d.open * 3, size = L <= 3 ? 64 : L === 4 ? 54 : 46, py = d.main ? d.y - d.h * 0.18 : d.y - d.h * 0.08;
              const sz = plateSize(ctx, d.text, size);
              // vora de cera al voltant de la placa (la placa és llisa) i claus
              ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = "#2A1A12"; ctx.lineWidth = 4; ctx.lineJoin = "round";
              const j = (n) => Math.sin(n * 12.9 + boil * 2.1) * 1.6; const x0 = d.x - sz.w / 2 - 6, y0 = py - sz.h / 2 - 6, x1 = d.x + sz.w / 2 + 6, y1 = py + sz.h / 2 + 6;
              ctx.beginPath(); ctx.moveTo(x0 + j(1), y0 + j(2)); ctx.lineTo(x1 + j(3), y0 + j(4)); ctx.lineTo(x1 + j(5), y1 + j(6)); ctx.lineTo(x0 + j(7), y1 + j(8)); ctx.closePath(); ctx.stroke(); ctx.restore();
              drawPlate(ctx, d.text, d.x, py, { size, alpha: a, progress: d.typed, state: d.locked ? "active" : null, shadowBlur: 6, shadowY: 4 });
              ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#6A6A72"; for (const [nx2, ny2] of [[x0 + 12, y0 + 12], [x1 - 12, y0 + 12]]) { ctx.beginPath(); ctx.arc(nx2, ny2, 4, 0, 6.28); ctx.fill(); } ctx.restore();
            }
          });
          // quadern: forats i animals trobats
          for (let i = 0; i < GOAL; i++) {
            const [sx, sy] = slotPos(i);
            if (found[i]) { const sp = sticker(found[i]), bob = st.endT >= 0 ? Math.abs(Math.sin(t * 6 + i)) * 6 : 0; ctx.drawImage(sp.c, sx - 31, sy - 30 - bob, 62, 58); }
            else { ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(120,90,60,0.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(sx, sy, 26, 24, 0, 0, 6.28); ctx.stroke(); ctx.restore(); text(ctx, "?", sx, sy + 1, { size: 22, weight: 800, font: FONT_T, color: "rgba(120,90,60,0.35)" }); }
          }
          // l'animal que surt
          if (animal && HAS()) {
            const a = animal, d = a.d;
            if (a.phase === "out") {
              const k = clamp(a.t / 0.5, 0, 1), size = d.main ? 150 : 120;
              let x = d.x, y = GROUND, sx = 1, sy = 1, pose = a.t > 0.5 ? "happy" : "surprised";
              const startY = d.y + d.h / 2 - 20;
              if (a.style === "slide") { const m = Ease.outCubic(clamp((a.t - 0.25) / 0.6, 0, 1)); x = d.x + m * 150; y = lerp(startY, GROUND, Ease.outQuad(k)); sx = 1 + (1 - m) * 0.25 * (m > 0 ? 1 : 0); sy = 1 - (1 - m) * 0.12 * (m > 0 ? 1 : 0); if (m > 0 && m < 0.95) for (let q = 0; q < 3; q++) { ctx.strokeStyle = "rgba(90,60,30,0.6)"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(x - 80 - q * 18, GROUND - 20 - q * 16); ctx.lineTo(x - 130 - q * 18, GROUND - 20 - q * 16); ctx.stroke(); } }
              else if (a.style === "fly") { const m = clamp(a.t / 1.4, 0, 1); x = d.x + Math.sin(m * 3.14) * 40; y = lerp(startY, GROUND, m) - Math.sin(Math.min(1, m * 1.3) * 3.14) * 170; sy = 1 + Math.sin(a.t * 30) * 0.08 * (1 - m); pose = "jump"; if (m > 0.9) pose = "happy"; }
              else if (a.style === "hop") { const hops = clamp(a.t / 1.2, 0, 1); x = d.x + hops * 110; y = lerp(startY, GROUND, k) - Math.abs(Math.sin(hops * 9.42)) * 70; }
              else if (a.style === "slow") { x = d.x + clamp(a.t / 1.6, 0, 1) * 60; y = lerp(startY, GROUND, k); }
              else { y = lerp(startY, GROUND, k) - Math.sin(clamp(a.t / 0.9, 0, 1) * 3.14) * 130; const land = clamp((a.t - 0.9) / 0.25, 0, 1); if (land > 0 && land < 1) { sx = 1 + Math.sin(land * 3.14) * 0.18; sy = 1 - Math.sin(land * 3.14) * 0.15; } }
              const sh = shadowBlob(), hgt = clamp((GROUND - y) / 200, 0, 1);
              ctx.save(); ctx.globalAlpha = 1 - hgt * 0.6; ctx.drawImage(sh.c, x - 80 * (1 - hgt * 0.4), GROUND - 14, 160 * (1 - hgt * 0.4), 40); ctx.restore();
              ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy); Art.farmAnimal(ctx, a.id, 0, -size * 0.45, size * Ease.outBack(Math.min(1, 0.3 + k)), { t, pose }); ctx.restore();
              // bafarada amb el nom
              if (a.t > 0.6) {
                const n = nameOf(a.id), bw = measure(ctx, n, 34) + 44, bx = clamp(x + 70, 80, W - bw - 20), by = y - size - 20, al = clamp((a.t - 0.6) * 5, 0, 1);
                ctx.save(); ctx.globalAlpha = al; rr(ctx, bx, by - 30, bw, 60, 26); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = "#2A1A12"; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(bx + 20, by + 28); ctx.lineTo(bx + 4, by + 50); ctx.lineTo(bx + 40, by + 28); ctx.fillStyle = "#FFFFFF"; ctx.fill(); ctx.stroke();
                text(ctx, n, bx + bw / 2, by + 2, { size: 34, weight: 700, color: BRAND.ink }); ctx.restore();
              }
              a.lastX = x; a.lastY = y;
            } else {
              const k = Ease.inOutCubic(clamp(a.t / 0.75, 0, 1)), [tx, ty] = slotPos(a.slot), fx = a.lastX, fy = a.lastY - 60;
              const x = lerp(fx, tx, k), y = lerp(fy, ty, k) - Math.sin(k * 3.14) * 160, s = lerp(d.main ? 150 : 120, 62, k);
              Art.farmAnimal(ctx, a.id, x, y, s, { t, pose: "jump" });
            }
          }
          if (st.endT >= 0) { const a = clamp(st.endT * 2, 0, 1); ctx.save(); ctx.globalAlpha = a; text(ctx, "Quadern complet!", 800, 120, { size: 52, weight: 900, font: FONT_T, color: "#D9443A", stroke: "#FFFFFF", lw: 10 }); ctx.restore(); }
          drawVignette(ctx, 0.16, "90,60,20");
        },
      };
    },
  });
})();
