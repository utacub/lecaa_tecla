"use strict";
/* 6. Cara boja — cap de feltre que es vesteix escrivint; mode repte (10 retrats) i mode lliure de premi */
(() => {
  const HX = 862, HY = 468;                 // centre del cap
  const FR = [1372, 428], MS = 0.6;         // marc del model i escala del retrat model
  const SKINS = ["#F6D2B8", "#E8B48C", "#C98E64", "#9A6446", "#F3C9A8"];
  const PART_ORDER = ["ulls", "nas", "boca", "orelles", "cabells", "mostatxo", "galtes", "pigues", "barret", "ulleres"];
  const DRAW_ORDER = ["orelles", "HEAD", "galtes", "pigues", "boca", "mostatxo", "ulls", "nas", "ulleres", "cabells", "barret"];
  // tecla, síl·laba, nom i adjectius de cada peça: en altres idiomes, LANG_DATA.xx.games["g06.parts"]
  const P = LXM("g06.parts", {
    ulls:     { key: "u", syl: "ul", word: "ulls",     at: [0, -34],  wh: [270, 130], adj: ["rodons", "grossos", "adormits", "blaus"] },
    nas:      { key: "n", syl: "na", word: "nas",      at: [0, 34],   wh: [150, 150], adj: ["rodó", "vermell", "llarg", "petit"] },
    boca:     { key: "b", syl: "bo", word: "boca",     at: [0, 112],  wh: [200, 120], adj: ["somrient", "oberta", "petita", "amb dents"] },
    orelles:  { key: "o", syl: "or", word: "orelles",  at: [0, 0],    wh: [480, 220], adj: ["rodones", "de gat", "grosses"] },
    cabells:  { key: "c", syl: "ca", word: "cabells",  at: [0, -160], wh: [440, 250], adj: ["rossos", "rojos", "blaus", "bruns"] },
    mostatxo: { key: "m", syl: "mo", word: "mostatxo", at: [0, 74],   wh: [230, 90],  adj: ["negre", "blanc", "marró"] },
    galtes:   { key: "g", syl: "ga", word: "galtes",   at: [0, 64],   wh: [320, 90],  adj: ["roses", "de cor"] },
    pigues:   { key: "p", syl: "pi", word: "pigues",   at: [0, 14],   wh: [240, 70],  adj: ["marrons", "taronges"] },
    barret:   { key: null, syl: null, word: "barret",  at: [0, -236], wh: [320, 210], adj: ["groc", "vermell", "blau"] },
    ulleres:  { key: null, syl: null, word: "ulleres", at: [0, -34],  wh: [320, 120], adj: ["blaves", "roges"] },
  });
  const CMD = LX("g06.cmd", { put: "posa {w} {a}", del: "treu {w}" });
  const NV = p => P[p].adj.length;
  const ICON = { ulls: [-110, -55, 220, 110], nas: [-70, -60, 140, 120], boca: [-75, -45, 150, 100], orelles: [140, -100, 140, 180], cabells: [-215, -122, 430, 230], mostatxo: [-105, -45, 210, 90], galtes: [60, -45, 110, 90], pigues: [20, -32, 100, 70], barret: [-155, -105, 310, 205], ulleres: [-125, -50, 250, 100] };
  function drawIcon(ctx, p, v, skin, x, y, bw, bh) {
    const S = partSprite(p, v, skin), [w, h] = P[p].wh, [cx, cy, cw, ch] = ICON[p], s = Math.min(bw / cw, bh / ch);
    ctx.drawImage(S.c, (w / 2 + cx) * 2, (h / 2 + cy) * 2, cw * 2, ch * 2, x - cw * s / 2, y - ch * s / 2, cw * s, ch * s);
  }
  const LEVEL_PARTS = l => l === 1 ? ["ulls", "nas", "boca", "orelles"] : l === 2 ? ["ulls", "nas", "boca", "orelles", "cabells", "galtes"] : l <= 4 ? PART_ORDER.slice(0, 8) : PART_ORDER.slice();
  const label = (p, l) => l <= 3 ? P[p].key : l === 4 ? P[p].syl : P[p].word;

  /* ---------- feltre ---------- */
  function felt(x, path, col, o = {}) {
    x.save(); path(x); x.shadowColor = "rgba(40,25,20,0.32)"; x.shadowBlur = o.blur != null ? o.blur : 6; x.shadowOffsetY = o.sy != null ? o.sy : 3; x.fillStyle = col; x.fill(); x.restore();
    x.save(); path(x); x.clip(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.8;
    x.fillStyle = x.createPattern(Tex.felt(128, 128, "#d2d2d2", { seed: o.seed || 9, plush: o.plush }), "repeat"); x.fillRect(-3000, -3000, 6000, 6000);
    x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
    if (o.light !== false) { const [cx, cy, r] = o.c || [0, 0, 60]; const g = x.createRadialGradient(cx - r * 0.4, cy - r * 0.5, 2, cx, cy, r * 1.3); g.addColorStop(0, "rgba(255,255,255,0.28)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.16)"); x.fillStyle = g; x.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4); }
    x.restore();
    if (o.stitch !== false && o.c) {
      const [cx, cy, r] = o.c, k = Math.max(0.4, 1 - (o.gap || 6) / r);
      x.save(); x.translate(cx, cy); x.scale(k, k); x.translate(-cx, -cy); path(x); x.restore();
      x.save(); x.setLineDash(o.dash || [6, 5]); x.lineCap = "round"; x.strokeStyle = o.stitch || "rgba(255,255,255,0.7)"; x.lineWidth = o.slw || 2.2; x.stroke(); x.restore();
    }
  }
  const C = (cx, cy, r) => x => { x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); };
  const E = (cx, cy, rx, ry, a = 0) => x => { x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, 6.2832); };
  function button(x, cx, cy, r, col) {
    felt(x, C(cx, cy, r), col, { c: [cx, cy, r], stitch: false, blur: 3, sy: 2 });
    x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(cx - r * 0.35, cy - r * 0.4, r * 0.35, r * 0.2, -0.5, 0, 6.28); x.fill();
    x.fillStyle = "rgba(0,0,0,0.55)"; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { x.beginPath(); x.arc(cx + a * r * 0.25, cy + b * r * 0.25, r * 0.1, 0, 6.28); x.fill(); }
    x.strokeStyle = "rgba(240,230,210,0.9)"; x.lineWidth = r * 0.08; x.beginPath(); x.moveTo(cx - r * 0.25, cy - r * 0.25); x.lineTo(cx + r * 0.25, cy + r * 0.25); x.moveTo(cx + r * 0.25, cy - r * 0.25); x.lineTo(cx - r * 0.25, cy + r * 0.25); x.stroke();
  }

  /* ---------- peces (cada variant en un sprite centrat al seu ancoratge) ---------- */
  const DRAW = {
    ulls(x, v) {
      for (const d of [-1, 1]) {
        const ex = d * 64;
        if (v === 0) { felt(x, C(ex, 0, 27), "#FFFDF6", { c: [ex, 0, 27] }); button(x, ex + d * 2, 3, 14, "#2A2226"); }
        if (v === 1) { felt(x, C(ex, 0, 40), "#FFFDF6", { c: [ex, 0, 40] }); felt(x, C(ex - d * 6, 12, 18), "#1E1A1C", { stitch: false, blur: 2, light: false }); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex - d * 11, 5, 5.5, 0, 6.28); x.fill(); }
        if (v === 2) { felt(x, C(ex, 0, 27), "#FFFDF6", { c: [ex, 0, 27] }); felt(x, C(ex, 9, 12), "#2A2226", { stitch: false, blur: 2, light: false }); felt(x, p => { p.beginPath(); p.ellipse(ex, 0, 31, 31, 0, Math.PI, 0); p.lineTo(ex + 31, 4); p.quadraticCurveTo(ex, 10, ex - 31, 4); p.closePath(); }, "#B48BE0", { c: [ex, -10, 30], dash: [4, 4] }); x.strokeStyle = "#2A2226"; x.lineWidth = 3; x.lineCap = "round"; for (let i = -1; i <= 1; i++) { x.beginPath(); x.moveTo(ex + i * 12, 7); x.lineTo(ex + i * 15, 16); x.stroke(); } }
        if (v === 3) { felt(x, C(ex, 0, 28), "#FFFDF6", { c: [ex, 0, 28] }); felt(x, C(ex, 3, 16), "#3E8FE0", { stitch: false, blur: 2 }); x.fillStyle = "#14262A"; x.beginPath(); x.arc(ex, 3, 7.5, 0, 6.28); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex - 5, -3, 4.5, 0, 6.28); x.fill(); x.strokeStyle = "#2A2226"; x.lineWidth = 3.5; x.lineCap = "round"; for (let i = -1; i <= 1; i++) { const a = -Math.PI / 2 + i * 0.5 + d * 0.15; x.beginPath(); x.moveTo(ex + Math.cos(a) * 28, Math.sin(a) * 28); x.lineTo(ex + Math.cos(a) * 40, Math.sin(a) * 40); x.stroke(); } }
      }
    },
    nas(x, v) {
      if (v === 0) felt(x, E(0, 0, 24, 20), "#F28DA2", { c: [0, 0, 22] });
      if (v === 1) { felt(x, C(0, 0, 34), "#E5303F", { c: [0, 0, 34], plush: true, stitch: false }); x.fillStyle = "rgba(255,255,255,0.55)"; x.beginPath(); x.ellipse(-11, -13, 11, 7, -0.5, 0, 6.28); x.fill(); }
      if (v === 2) { felt(x, p => { p.beginPath(); p.moveTo(-16, -18); p.quadraticCurveTo(10, -22, 62, 18); p.quadraticCurveTo(14, 22, -14, 16); p.quadraticCurveTo(-24, 0, -16, -18); p.closePath(); }, "#F2862F", { c: [10, 0, 30] }); x.strokeStyle = "rgba(120,50,0,0.4)"; x.lineWidth = 2.5; for (const xx of [8, 26]) { x.beginPath(); x.moveTo(xx, -6); x.lineTo(xx + 4, 6); x.stroke(); } }
      if (v === 3) felt(x, p => { p.beginPath(); p.moveTo(0, -14); p.quadraticCurveTo(4, -12, 15, 10); p.quadraticCurveTo(0, 16, -15, 10); p.quadraticCurveTo(-4, -12, 0, -14); p.closePath(); }, "#A86A4A", { c: [0, 2, 14], gap: 4 });
    },
    boca(x, v) {
      if (v === 0) felt(x, p => { p.beginPath(); p.moveTo(-56, -12); p.quadraticCurveTo(0, 30, 56, -12); p.quadraticCurveTo(58, 2, 50, 4); p.quadraticCurveTo(0, 50, -50, 4); p.quadraticCurveTo(-58, 2, -56, -12); p.closePath(); }, "#E0453F", { c: [0, 10, 40] });
      if (v === 1) { felt(x, p => { p.beginPath(); p.moveTo(-50, -18); p.lineTo(50, -18); p.quadraticCurveTo(48, 44, 0, 46); p.quadraticCurveTo(-48, 44, -50, -18); p.closePath(); }, "#7A1E2C", { c: [0, 10, 44], stitch: "rgba(255,200,200,0.7)" }); felt(x, E(0, 28, 26, 14), "#F2879C", { stitch: false, blur: 2 }); felt(x, p => rr(p, -40, -18, 80, 13, 4), "#FFFDF6", { stitch: false, blur: 1, light: false }); }
      if (v === 2) { felt(x, C(0, 0, 18), "#E0453F", { c: [0, 0, 18], gap: 4 }); felt(x, C(0, 1, 8), "#7A1E2C", { stitch: false, blur: 1, light: false }); }
      if (v === 3) { felt(x, p => { p.beginPath(); p.moveTo(-60, -14); p.quadraticCurveTo(0, 6, 60, -14); p.quadraticCurveTo(52, 40, 0, 42); p.quadraticCurveTo(-52, 40, -60, -14); p.closePath(); }, "#7A1E2C", { c: [0, 10, 46], stitch: "rgba(255,200,200,0.6)" }); for (const d of [-1, 1]) felt(x, p => rr(p, d * 13 - 12, -8, 24, 22, 5), "#FFFDF6", { stitch: false, blur: 2, light: false }); }
    },
    orelles(x, v, skin) {
      for (const d of [-1, 1]) {
        const ex = d * 196;
        if (v === 0) { felt(x, E(ex, 0, 34, 46), skin, { c: [ex, 0, 40] }); felt(x, E(ex, 0, 16, 26), shade(skin, -0.12), { stitch: false, blur: 2, light: false }); }
        if (v === 1) { felt(x, p => { p.beginPath(); p.moveTo(ex - d * 20, -30); p.lineTo(ex + d * 62, -76); p.quadraticCurveTo(ex + d * 40, 10, ex - d * 6, 40); p.closePath(); }, skin, { c: [ex + d * 14, -14, 44] }); felt(x, p => { p.beginPath(); p.moveTo(ex - d * 6, -18); p.lineTo(ex + d * 42, -52); p.quadraticCurveTo(ex + d * 24, 6, ex, 22); p.closePath(); }, shade(skin, -0.12), { stitch: false, blur: 1, light: false }); }
        if (v === 2) { felt(x, C(ex + d * 18, -12, 60), skin, { c: [ex + d * 18, -12, 60] }); felt(x, C(ex + d * 20, -12, 36), "#F2A7B8", { stitch: false, blur: 2 }); }
      }
    },
    cabells(x, v) {
      const band = p => { p.beginPath(); p.ellipse(0, 160, 186, 232, 0, Math.PI * 1.05, Math.PI * 1.95); p.ellipse(0, 190, 150, 190, 0, Math.PI * 1.88, Math.PI * 1.12, true); p.closePath(); };
      if (v === 0) {
        felt(x, band, "#F2C53D", { c: [0, -30, 120], stitch: false });
        x.lineWidth = 9; x.lineCap = "round"; for (let i = 0; i < 15; i++) { const a = Math.PI * (1.08 + i * 0.0565), cx = Math.cos(a) * 176, cy = 160 + Math.sin(a) * 218; x.strokeStyle = i % 2 ? "#F7D660" : "#E0A92A"; x.beginPath(); x.arc(cx, cy, 15, 0, 6.28); x.stroke(); }
      }
      if (v === 1) { for (let i = 0; i < 13; i++) { const a = Math.PI * (1.06 + i * 0.07), cx = Math.cos(a) * 172, cy = 162 + Math.sin(a) * 210; felt(x, C(cx, cy, 30), i % 2 ? "#E0453F" : "#C9302F", { c: [cx, cy, 30], stitch: false, plush: true, blur: 4 }); } }
      if (v === 2) { felt(x, p => { p.beginPath(); for (let i = 0; i <= 10; i++) { const a = Math.PI * (1.05 + i * 0.09), r1 = i % 2 ? 236 : 188; p.lineTo(Math.cos(a) * r1 * 0.86, 170 + Math.sin(a) * r1); } p.ellipse(0, 190, 150, 190, 0, Math.PI * 1.9, Math.PI * 1.1, true); p.closePath(); }, "#3E8FE0", { c: [0, -30, 120] }); }
      if (v === 3) { felt(x, p => { p.beginPath(); p.ellipse(0, 160, 188, 232, 0, Math.PI * 1.02, Math.PI * 1.98); p.quadraticCurveTo(120, 30, 40, 10); p.quadraticCurveTo(0, 50, -40, 10); p.quadraticCurveTo(-120, 30, -186, 140); p.closePath(); }, "#7A4A2C", { c: [0, -20, 140] }); x.strokeStyle = "rgba(255,230,200,0.35)"; x.lineWidth = 3; for (let i = -4; i <= 4; i++) { x.beginPath(); x.moveTo(i * 30, -60); x.quadraticCurveTo(i * 34, -10, i * 22, 20); x.stroke(); } }
    },
    mostatxo(x, v) {
      if (v === 0) felt(x, p => { p.beginPath(); p.moveTo(0, -10); p.bezierCurveTo(30, -26, 70, -14, 86, -26); p.bezierCurveTo(90, -6, 60, 20, 30, 12); p.quadraticCurveTo(10, 8, 0, 2); p.quadraticCurveTo(-10, 8, -30, 12); p.bezierCurveTo(-60, 20, -90, -6, -86, -26); p.bezierCurveTo(-70, -14, -30, -26, 0, -10); p.closePath(); }, "#2A2226", { c: [0, -4, 50], stitch: "rgba(255,255,255,0.5)" });
      if (v === 1) for (const [a, b, r] of [[-56, 0, 22], [-30, -6, 26], [0, -8, 26], [30, -6, 26], [56, 0, 22]]) felt(x, C(a, b, r), "#F6F4EE", { c: [a, b, r], stitch: false, plush: true, blur: 3 });
      if (v === 2) { felt(x, p => { p.beginPath(); p.moveTo(0, -12); p.quadraticCurveTo(40, -24, 62, -6); p.quadraticCurveTo(66, 10, 48, 8); p.quadraticCurveTo(20, 6, 0, 4); p.quadraticCurveTo(-20, 6, -48, 8); p.quadraticCurveTo(-66, 10, -62, -6); p.quadraticCurveTo(-40, -24, 0, -12); p.closePath(); }, "#8A5A36", { c: [0, -4, 50] }); for (const d of [-1, 1]) { x.strokeStyle = "#8A5A36"; x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.arc(d * 72, -12, 12, d > 0 ? 2.4 : -0.6, d > 0 ? 7.4 : 4.4); x.stroke(); } }
    },
    galtes(x, v) { for (const d of [-1, 1]) { if (v === 0) felt(x, C(d * 112, 0, 24), "#F7A6B8", { c: [d * 112, 0, 24], gap: 5 }); else felt(x, p => { p.beginPath(); const cx = d * 112, cy = -4; p.moveTo(cx, cy + 22); p.bezierCurveTo(cx - 34, cy, cx - 22, cy - 26, cx, cy - 10); p.bezierCurveTo(cx + 22, cy - 26, cx + 34, cy, cx, cy + 22); p.closePath(); }, "#E5303F", { c: [d * 112, 0, 24], gap: 5 }); } },
    pigues(x, v) { const col = v === 0 ? "#8A5A36" : "#F2862F"; for (const d of [-1, 1]) for (const [a, b] of [[48, -6], [64, 6], [80, -4], [58, 18], [76, 20]]) felt(x, C(d * a, b, 5.5), col, { stitch: false, blur: 1, sy: 1, light: false }); },
    barret(x, v) {
      if (v === 0) { felt(x, E(0, 50, 150, 26), "#E8B530", { c: [0, 50, 100], stitch: false }); felt(x, p => { p.beginPath(); p.moveTo(-96, 50); p.quadraticCurveTo(-100, -70, 0, -72); p.quadraticCurveTo(100, -70, 96, 50); p.closePath(); }, "#F2C53D", { c: [0, -10, 90] }); felt(x, p => rr(p, -98, 22, 196, 22, 6), "#7A4A2C", { stitch: false, blur: 2 }); }
      if (v === 1) { felt(x, E(0, 56, 140, 24), "#B82A33", { c: [0, 56, 100], stitch: false }); felt(x, p => rr(p, -84, -90, 168, 150, 14), "#D8343E", { c: [0, -14, 90] }); felt(x, p => rr(p, -86, 18, 172, 26, 4), "#2A2226", { stitch: false, blur: 2 }); }
      if (v === 2) { felt(x, p => { p.beginPath(); p.moveTo(0, -96); p.lineTo(92, 60); p.quadraticCurveTo(0, 84, -92, 60); p.closePath(); }, "#3E8FE0", { c: [0, 10, 90] }); for (const [a, b] of [[-30, 30], [24, 0], [0, -40], [40, 44], [-50, 56]]) felt(x, C(a, b, 9), "#FFE15A", { stitch: false, blur: 1, light: false }); felt(x, C(0, -100, 20), "#FFFDF6", { c: [0, -100, 20], stitch: false, plush: true }); }
    },
    ulleres(x, v) {
      const col = v === 0 ? "#2F7FD8" : "#D8343E";
      x.save(); x.shadowColor = "rgba(0,0,0,0.3)"; x.shadowBlur = 4; x.shadowOffsetY = 3; x.lineWidth = 11; x.strokeStyle = col;
      for (const d of [-1, 1]) { x.beginPath(); if (v === 0) x.arc(d * 64, 0, 44, 0, 6.28); else rr(x, d * 64 - 50, -36, 100, 72, 18); x.fillStyle = "rgba(190,230,255,0.22)"; x.fill(); x.stroke(); }
      x.beginPath(); x.moveTo(-20, -6); x.quadraticCurveTo(0, -18, 20, -6); x.stroke(); x.restore();
      x.strokeStyle = "rgba(255,255,255,0.7)"; x.lineWidth = 4; x.lineCap = "round"; for (const d of [-1, 1]) { x.beginPath(); x.arc(d * 64, 0, 30, 3.7, 4.4); x.stroke(); }
    },
  };
  const partSprite = (p, v, skin) => Sprites.get(`g06_${p}_${v}_${p === "orelles" ? skin : ""}`, P[p].wh[0], P[p].wh[1], (x, w, h) => { x.translate(w / 2, h / 2);
    const groups={ulls:["face-parts",v,4,4,210,100],nas:["face-parts",4+v,4,4,v===2?105:68,v===2?65:68],boca:["face-parts",8+v,4,4,v===2?48:145,v===2?48:90],cabells:["face-parts",12+v,4,4,385,215],mostatxo:["face-accessories",v,4,3,190,68],barret:v<2?["face-accessories",4+v,4,3,300,180]:null,ulleres:["face-accessories",8+v,4,3,255,110]};
    const a=groups[p]; if(a){const im=Art.cell(...a);if(im){x.drawImage(im,-a[4]/2,-a[5]/2,a[4],a[5]);return;}}
    if(p==="orelles")x.scale(.82,1);DRAW[p](x, v, skin); });
  const headSprite = skin => Sprites.get("g06head" + skin, 460, 640, (x) => {
    const head=Art.cell("face-heads",Math.max(0,SKINS.indexOf(skin)),5,1,460,640);
    if(head){x.drawImage(head,0,0,460,640);return;}
    x.translate(230, 250);
    // coll i espatlles de feltre
    felt(x, p => { p.beginPath(); p.moveTo(-210, 390); p.quadraticCurveTo(-200, 250, -60, 230); p.lineTo(60, 230); p.quadraticCurveTo(200, 250, 210, 390); p.closePath(); }, "#2E9C8F", { c: [0, 300, 150] });
    felt(x, p => { p.beginPath(); p.moveTo(-64, 228); p.lineTo(0, 300); p.lineTo(64, 228); p.lineTo(40, 214); p.lineTo(0, 260); p.lineTo(-40, 214); p.closePath(); }, "#FFFDF6", { c: [0, 250, 40], gap: 4 });
    felt(x, p => rr(p, -44, 170, 88, 70, 20), shade(skin, -0.08), { c: [0, 200, 40], stitch: false });
    felt(x, E(0, 0, 172, 212), skin, { c: [0, 0, 190], gap: 8, stitch: "rgba(255,255,255,0.55)", dash: [9, 7], slw: 2.6 });
  });

  /* ---------- cara completa ---------- */
  function drawFace(ctx, f, x, y, s, o = {}) {
    const anim = o.anim || {}, t = o.t || 0;
    ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(s, s);
    for (const p of DRAW_ORDER) {
      if (p === "HEAD") { const S = headSprite(f.skin); ctx.drawImage(S.c, -230, -250, 460, 640); continue; }
      const v = f.parts[p]; if (v == null) continue;
      const S = partSprite(p, v, f.skin), [ax, ay] = P[p].at, [w, h] = P[p].wh;
      let k = 1, dy = 0, sy = 1;
      const a = anim[p];
      if (a != null && a < 0.7) { k = 0.25 + 0.75 * Ease.outElastic(clamp(a / 0.7, 0, 1)); dy = -(1 - clamp(a / 0.35, 0, 1)) * 50; }
      if (p === "ulls" && o.blink) sy = 1 - o.blink * 0.85;
      if (p === "boca" && o.smile) sy = 1 + o.smile * 0.18;
      if (p === "nas" && o.wrinkle) { sy = 1 - o.wrinkle * 0.25; k *= 1 + o.wrinkle * 0.08; }
      ctx.save(); ctx.translate(ax, ay + dy); ctx.scale(k, k * sy);
      if (o.glow && o.glow[p] > 0) { ctx.save(); ctx.globalAlpha = o.glow[p]; ctx.shadowColor = "#FFE15A"; ctx.shadowBlur = 30; ctx.drawImage(S.c, -w / 2, -h / 2, w, h); ctx.restore(); }
      ctx.drawImage(S.c, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
    ctx.restore();
  }

  /* ---------- fons: taula, tauler de costura, marc i costurer ---------- */
  const bgSprite = () => Sprites.get("g06bg", W, H, (x) => {
    if(Art.get("face-bg")){x.drawImage(Art.get("face-bg"),0,0,W,H);return;}
    x.fillStyle = x.createPattern(Tex.wood(800, 900, "#C99A66", { seed: 6 }), "repeat"); x.fillRect(0, 0, W, H);
    // tauler de costura (feltre verd amb quadrícula cosida)
    const bd = p => rr(p, 520, 84, 1064, 800, 30);
    felt(x, bd, "#9FCBB2", { c: [1050, 480, 520], stitch: false, blur: 26, sy: 12 });
    x.save(); bd(x); x.clip(); x.strokeStyle = "rgba(255,255,255,0.25)"; x.lineWidth = 1.5; for (let i = 540; i < 1590; i += 50) { x.beginPath(); x.moveTo(i, 84); x.lineTo(i, 884); x.stroke(); } for (let j = 100; j < 884; j += 50) { x.beginPath(); x.moveTo(520, j); x.lineTo(1584, j); x.stroke(); } x.restore();
    x.save(); x.setLineDash([12, 9]); x.strokeStyle = "rgba(255,255,255,0.8)"; x.lineWidth = 3; rr(x, 534, 98, 1036, 772, 22); x.stroke(); x.restore();
    // cinta mètrica
    x.save(); x.translate(560, 852); x.rotate(-0.015); x.shadowColor = "rgba(0,0,0,0.25)"; x.shadowBlur = 6; x.shadowOffsetY = 3; x.fillStyle = "#F7D35A"; x.fillRect(0, -14, 560, 28); x.shadowColor = "transparent";
    x.fillStyle = "#5A4320"; for (let i = 0; i < 56; i++) x.fillRect(i * 10, -14, 1.5, i % 5 ? 8 : 14); x.restore();
    // bobines i coixinet d'agulles
    for (const [bx, by, col] of [[1470, 820, "#E0453F"], [1530, 836, "#3E8FE0"]]) { x.fillStyle = "#D9B07A"; rr(x, bx - 24, by - 34, 48, 10, 4); x.fill(); rr(x, bx - 24, by + 24, 48, 10, 4); x.fill(); felt(x, p => rr(p, bx - 20, by - 26, 40, 52, 6), col, { c: [bx, by, 26], stitch: false }); x.strokeStyle = "rgba(255,255,255,0.3)"; x.lineWidth = 1.5; for (let k = -22; k < 26; k += 5) { x.beginPath(); x.moveTo(bx - 20, by + k); x.lineTo(bx + 20, by + k + 3); x.stroke(); } }
    felt(x, C(1388, 830, 34), "#E86F86", { c: [1388, 830, 34], plush: true });
    for (const [a, c] of [[-0.6, "#3E8FE0"], [0.1, "#FFE15A"], [0.7, "#7BC8A4"]]) { const px = 1388 + Math.cos(a - 1.57) * 30, py = 830 + Math.sin(a - 1.57) * 30; x.strokeStyle = "#B9C4CC"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(1388 + Math.cos(a - 1.57) * 10, 830 + Math.sin(a - 1.57) * 10); x.lineTo(px, py); x.stroke(); x.fillStyle = c; x.beginPath(); x.arc(px, py, 6, 0, 6.28); x.fill(); }
    // marc del retrat model (fusta daurada)
    const [fx, fy] = FR;
    x.save(); x.shadowColor = "rgba(40,20,0,0.45)"; x.shadowBlur = 22; x.shadowOffsetY = 10; rr(x, fx - 180, fy - 230, 360, 460, 22); x.fillStyle = "#B8862E"; x.fill(); x.restore();
    const g = x.createLinearGradient(fx - 180, fy - 230, fx + 180, fy + 230); g.addColorStop(0, "#F2D06B"); g.addColorStop(0.5, "#C8902E"); g.addColorStop(1, "#8E6420"); x.fillStyle = g; rr(x, fx - 180, fy - 230, 360, 460, 22); x.fill();
    x.strokeStyle = "rgba(255,240,190,0.7)"; x.lineWidth = 3; rr(x, fx - 166, fy - 216, 332, 432, 16); x.stroke();
    x.fillStyle = "#FFF4DC"; rr(x, fx - 150, fy - 200, 300, 400, 10); x.fill();
    x.save(); rr(x, fx - 150, fy - 200, 300, 400, 10); x.clip(); x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.paper(256, 256, "#f3ead8", { seed: 4 }), "repeat"); x.fillRect(fx - 150, fy - 200, 300, 400);
    const ig = x.createRadialGradient(fx, fy, 60, fx, fy, 260); ig.addColorStop(0, "rgba(0,0,0,0)"); ig.addColorStop(1, "rgba(90,60,20,0.3)"); x.globalCompositeOperation = "source-over"; x.fillStyle = ig; x.fillRect(fx - 150, fy - 200, 300, 400); x.restore();
    x.strokeStyle = "rgba(90,60,20,0.5)"; x.lineWidth = 3; rr(x, fx - 150, fy - 200, 300, 400, 10); x.stroke();
  });
  const boxSprite = rows => Sprites.get("g06box" + rows, rows === "cmd" ? 530 : 480, 800, (x, BW) => {
    // costurer de fusta obert, amb la tapa enrere i compartiments folrats de feltre vermell
    x.save(); x.shadowColor = "rgba(40,20,0,0.5)"; x.shadowBlur = 24; x.shadowOffsetY = 12; rr(x, 8, 8, BW - 16, 784, 26); x.fillStyle = "#8E5A32"; x.fill(); x.restore();
    x.save(); rr(x, 8, 8, BW - 16, 784, 26); x.clip(); x.fillStyle = x.createPattern(Tex.wood(480, 800, "#A86E3E", { seed: 12 }), "repeat"); x.fillRect(0, 0, BW, 800);
    x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(8, 8, BW - 16, 6); x.restore();
    rr(x, 30, 30, BW - 60, 740, 16); x.fillStyle = "#A8343C"; x.fill();
    x.save(); rr(x, 30, 30, BW - 60, 740, 16); x.clip(); x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#cccccc", { seed: 3 }), "repeat"); x.fillRect(30, 30, BW - 60, 740);
    x.globalCompositeOperation = "source-over"; const ig = x.createLinearGradient(0, 30, 0, 90); ig.addColorStop(0, "rgba(0,0,0,0.35)"); ig.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = ig; x.fillRect(30, 30, BW - 60, 60); x.restore();
    // separadors
    const sep = (x0, y0, w, h) => { x.save(); x.shadowColor = "rgba(0,0,0,0.35)"; x.shadowBlur = 5; x.shadowOffsetY = 3; x.fillStyle = "#B97A46"; rr(x, x0, y0, w, h, 3); x.fill(); x.restore(); x.fillStyle = "rgba(255,240,220,0.25)"; x.fillRect(x0, y0, w, 2); };
    if (rows === "grid") { sep(237, 30, 6, 740); for (let i = 1; i < 4; i++) sep(30, 30 + i * 185, 420, 6); }
    else if (rows === "list") { for (let i = 1; i < 10; i++) sep(30, 30 + i * 74, 420, 4); }
    x.save(); x.setLineDash([8, 6]); x.strokeStyle = "rgba(255,230,200,0.5)"; x.lineWidth = 2.5; rr(x, 18, 18, BW - 36, 764, 20); x.stroke(); x.restore();
  });

  function itemPos(i, mode) {
    if (mode === "grid") return [24 + 30 + (i % 2) * 210 + 105, 96 + 30 + Math.floor(i / 2) * 185 + 92];
    if (mode === "list") return [264, 96 + 30 + i * 74 + 37];
    return [275, 96 + 190 + i * 190];
  }

  Games.register({
    id: 6, key: "b", name: "Cara boja", zone: "costa", music: "waltz", demoTime: 10, missAt: [862, 300], kbPos: [1232, 792], captionY: 122,
    collect: { one: "retrat", many: "retrats" },
    goal: l => l <= 3 ? "Copia el retrat del marc: cada lletra posa una peça (U ulls, N nas, B boca…). Si la tornes a prémer, la canvia." : l === 4 ? "Copia el retrat del marc escrivint la síl·laba de cada peça. Si la tornes a escriure, la canvia." : l === 5 ? "Copia el retrat del marc escrivint el nom de cada peça. Si el tornes a escriure, la canvia." : "Escriu les ordres perquè la cara sigui igual que el retrat del marc.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const B = bgSprite(), sw = 600, sh = 420, s = Math.max(w / sw, h / sh), cx = 860, cy = 470;
      ctx.drawImage(B.c, (cx - sw / 2) * 2, (cy - sh / 2) * 2, sw * 2, sh * 2, x + w / 2 - sw * s / 2, y + h / 2 - sh * s / 2, sw * s, sh * s);
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-cx, -cy);
      const bl = (t % 3.2) < 0.15 ? 1 : 0;
      drawFace(ctx, { skin: SKINS[0], parts: { ulls: 1, nas: 1, boca: 0, orelles: 0, cabells: 1, galtes: 0 } }, 840, 480, 0.88, { blink: bl, rot: Math.sin(t * 1.5) * 0.04, smile: Math.max(0, Math.sin(t * 2)) * 0.6 });
      drawPlate(ctx, "n", 1088, 340 + Math.sin(t * 2) * 5, { size: 72 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, demo = api.demo;
      const parts = LEVEL_PARTS(L), maxV = [0, 1, 2, 3, 2, 2, 3][L];
      const face = { skin: SKINS[0], parts: {} }, anim = {}, glow = {}, loose = [], photos = [];
      let model = null, idx = 0, phase = "play", pt = 0, buf = "", cmds = [], hintPart = null, hintT = 0, blink = 0, blinkT = 2.5, smile = 0, wrinkle = 0, shake = 0, modelIn = 1, flash = 0, freeT = 0;
      api.hud.progress = [0, 10];
      const R = mulberry32(((L * 7919) ^ (Date.now() & 0xffff)) >>> 0);
      function makeModel(i) {
        const base = [0, 2, 2, 3, 3, 2, 4][L], top = [0, 4, 5, 6, 5, 4, 6][L];
        const n = Math.min(parts.length, base + Math.floor(i * (top - base + 1) / 10));
        let pool = parts.slice(); pool = pool.sort(() => R() - 0.5);
        if (pool.includes("ulls")) pool = ["ulls"].concat(pool.filter(p => p !== "ulls"));
        if (L === 6 && R() < 0.5) pool = pool.filter(p => p !== "ulleres" || R() < 0.5);
        const m = {}; const vmax = i < 3 ? 0 : Math.min(maxV, 1 + Math.floor(i / 4));
        pool.slice(0, n).forEach(p => { m[p] = Math.min(NV(p) - 1, Math.floor(R() * (vmax + 1))); });
        if (m.ulls != null && m.ulleres != null && R() < 0.5) delete m.ulleres;
        return { skin: SKINS[Math.floor(R() * SKINS.length)], parts: m };
      }
      function startPortrait(i) {
        model = makeModel(i); face.skin = model.skin; face.parts = {}; buf = ""; hintPart = null;
        if (L === 6) {
          // la cara ja ve vestida, però amb 1 a 3 diferències respecte del model
          Object.assign(face.parts, model.parts);
          const nAlt = 1 + Math.floor(i / 4), keys = Object.keys(model.parts).sort(() => R() - 0.5), extra = PART_ORDER.filter(p => model.parts[p] == null).sort(() => R() - 0.5);
          for (let a = 0; a < nAlt; a++) {
            const kind = a % 3 === 0 ? "add" : a % 3 === 1 ? "remove" : "change";
            if (kind === "add" && extra.length) { const p = extra.pop(); face.parts[p] = Math.floor(R() * NV(p)); }
            else if (kind === "remove" && keys.length) { delete face.parts[keys.pop()]; }
            else if (keys.length) { const p = keys.pop(); face.parts[p] = (model.parts[p] + 1) % NV(p); }
          }
          buildCmds();
          if (!cmds.length) { delete face.parts[Object.keys(face.parts)[0]]; buildCmds(); }
        }
      }
      function buildCmds() {
        cmds = [];
        for (const p of PART_ORDER) {
          const mv = model.parts[p], fv = face.parts[p];
          if (mv === fv) continue;
          if (mv == null) cmds.push({ text: CMD.del.replace("{w}", P[p].word).replace("{d}", P[p].del || P[p].word), p, set: null }); // {d}: el nom amb article, si l'idioma en té
          else cmds.push({ text: CMD.put.replace("{w}", P[p].word).replace("{a}", P[p].adj[mv]), p, set: mv });
        }
      }
      const items = () => {
        if (phase === "free") return (L >= 5 ? PART_ORDER : parts).map(p => ({ text: label(p, L === 6 ? 5 : L), p }));
        if (L === 6) return cmds;
        return parts.map(p => ({ text: label(p, L), p }));
      };
      const needed = it => phase === "free" ? true : L === 6 ? true : model.parts[it.p] != null && face.parts[it.p] !== model.parts[it.p];
      function bestNeeded() { return items().find(it => needed(it) && it.text.startsWith(buf)) || null; }
      function place(p, v, quiet) {
        const old = face.parts[p];
        if (old != null) loose.push({ p, v: old, skin: face.skin, x: HX + P[p].at[0], y: HY + P[p].at[1], vx: rand(-120, 120), vy: -260, rot: 0, vr: rand(-4, 4), t: 0 });
        if (v == null) delete face.parts[p]; else { face.parts[p] = v; anim[p] = 0; }
        if (!quiet) { Sfx.play(v == null ? "cut" : "pop"); if (v != null) setTimeout(() => Sfx.play("click0"), 260); }
        if (!quiet && phase !== "free" && model.parts[p] != null && face.parts[p] === model.parts[p]) { glow[p] = 1; smile = 1; }
      }
      function apply(it) {
        if (phase === "free") { const cur = face.parts[it.p]; place(it.p, cur == null ? 0 : cur + 1 >= NV(it.p) ? null : cur + 1); smile = 0.8; return; }
        if (L === 6) { place(it.p, it.set); cmds = cmds.filter(c => c !== it); }
        else { const cur = face.parts[it.p]; place(it.p, cur == null ? 0 : (cur + 1) % NV(it.p)); }
        if (PART_ORDER.every(p => face.parts[p] === model.parts[p])) { phase = "done"; pt = 0; }
      }
      startPortrait(0);
      function expectedKey() {
        if (phase === "free") return "Enter";
        if (phase !== "play") return null;
        const b = bestNeeded(); if (!b) { buf = ""; const c = bestNeeded(); return c ? c.text[0] : null; }
        return b.text[buf.length];
      }
      return {
        expected: expectedKey,
        onKey(k) {
          if (phase === "free") {
            if (k === "Enter") { phase = "photo"; pt = 0; flash = 1; Sfx.play("clack"); photos.push({ skin: face.skin, parts: Object.assign({}, face.parts) }); return; }
            if (k === "Backspace") { buf = ""; return; }
            if (k.length !== 1) return;
            const c = items().filter(it => it.text.startsWith(buf + k));
            if (!c.length) { buf = ""; shake = 0.4; Sfx.play("thud"); return; }
            buf += k; Sfx.play("click0"); const done = c.find(it => it.text === buf); if (done) { buf = ""; apply(done); }
            return;
          }
          if (phase !== "play") return;
          if (k === "Backspace") { buf = ""; return; }
          if (k.length !== 1) return;
          const c = items().filter(it => needed(it) && it.text.startsWith(buf + k));
          if (c.length) {
            buf += k; const done = c.find(it => it.text === buf);
            api.hit({ sfx: done ? "hit" : "click0" });
            if (done) { buf = ""; apply(done); }
            return;
          }
          // error: les dues plaques, el nas s'arrufa i el model assenyala la peça que falta
          const b = bestNeeded(), ex = expectedKey();
          api.miss(ex, k, { sfx: "boing" });
          wrinkle = 1; shake = 0.5; hintPart = b ? b.p : null; hintT = 2.2;
        },
        update(dt) {
          pt += dt;
          for (const p in anim) anim[p] += dt;
          for (const p in glow) glow[p] = Math.max(0, glow[p] - dt * 0.9);
          blinkT -= dt; if (blinkT <= 0) { blink = 1; blinkT = rand(2.6, 4.2); } blink = Math.max(0, blink - dt * 7);
          smile = Math.max(0, smile - dt * 1.4); wrinkle = Math.max(0, wrinkle - dt * 1.3); shake = Math.max(0, shake - dt); hintT = Math.max(0, hintT - dt); flash = Math.max(0, flash - dt * 2.5);
          modelIn = Math.min(1, modelIn + dt / 0.5);
          for (let i = loose.length - 1; i >= 0; i--) { const l = loose[i]; l.t += dt; l.vy += 1300 * dt; l.x += l.vx * dt; l.y += l.vy * dt; l.rot += l.vr * dt; if (l.y > 900 || l.t > 1.6) loose.splice(i, 1); }
          if (phase === "done") {
            if (pt > 0.35 && !this.snap) { this.snap = 1; flash = 1; Sfx.play("clack"); photos.push({ skin: face.skin, parts: Object.assign({}, face.parts) }); api.particles.emit(HX, HY - 40, { count: 30, color: ["#FFE15A", "#F28DB2", "#7BC8A4", "#FFFFFF"], shape: "confetti", speed: 520, gravity: 600, size: 14, life: 1.2 }); idx++; api.hud.progress = [idx, 10]; Sfx.play("chime", { note: 84 + (idx % 5) }); }
            if (pt > 1.5) {
              this.snap = 0;
              // les peces es descusen i cauen al costurer
              for (const p of Object.keys(face.parts)) loose.push({ p, v: face.parts[p], skin: face.skin, x: HX + P[p].at[0], y: HY + P[p].at[1], vx: (264 - HX - P[p].at[0]) * rand(0.9, 1.3), vy: rand(-500, -300), rot: 0, vr: rand(-5, 5), t: 0 });
              face.parts = {}; Sfx.play("cut");
              if (idx >= 10) { phase = "free"; pt = 0; freeT = 0; buf = ""; api.say("Mode lliure! Vesteix la cara com vulguis i prem Retorn per fer-li una foto."); }
              else { phase = "next"; pt = 0; }
            }
          } else if (phase === "next") { if (pt > 0.45) { startPortrait(idx); modelIn = 0; phase = "play"; pt = 0; Sfx.play("whoosh"); } }
          else if (phase === "free") { freeT += dt; if (freeT > 50) { phase = "photo"; pt = 0; flash = 1; Sfx.play("clack"); photos.push({ skin: face.skin, parts: Object.assign({}, face.parts) }); } }
          else if (phase === "photo") { if (pt > 1.2 && !this.fin) { this.fin = 1; api.finish(true, { collectName: "11 fotos de retrats" }); } }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bgSprite().c, 0, 0, W, H);
          // retrat model dins del marc
          const [fx, fy] = FR;
          ctx.save(); rr(ctx, fx - 150, fy - 200, 300, 400, 10); ctx.clip();
          if (phase === "free" || phase === "photo") {
            text(ctx, "Mode lliure", fx, fy - 40, { size: 40, weight: 900, font: FONT_T, color: "#8E6420" });
            text(ctx, "Inventa una cara!", fx, fy + 10, { size: 28, weight: 800, font: FONT_T, color: "#A87830" });
          } else if (model) {
            const slide = (1 - Ease.outBack(modelIn)) * 420, mg = {};
            for (const p in glow) mg[p] = glow[p];
            if (hintT > 0 && hintPart) mg[hintPart] = 0.5 + 0.5 * Math.sin(hintT * 9);
            drawFace(ctx, model, fx + slide, fy + 18, MS, { glow: mg, t, blink: blink * 0.8 });
          }
          ctx.restore();
          // assenyala la peça que falta
          if (hintT > 0 && hintPart && model && model.parts[hintPart] != null) {
            const ax = fx + P[hintPart].at[0] * MS, ay = fy + 18 + P[hintPart].at[1] * MS, a = clamp(hintT * 2, 0, 1), bob = Math.sin(hintT * 8) * 6;
            ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = UI.gold; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(ax, ay, 60, 34, 0, 0, 6.28); ctx.stroke();
            ctx.fillStyle = "#FFE15A"; ctx.strokeStyle = "#8E6420"; ctx.lineWidth = 3; ctx.beginPath(); const tx = ax + 96 + bob, ty = ay; ctx.moveTo(tx - 34, ty); ctx.lineTo(tx - 6, ty - 22); ctx.lineTo(tx - 6, ty - 9); ctx.lineTo(tx + 26, ty - 9); ctx.lineTo(tx + 26, ty + 9); ctx.lineTo(tx - 6, ty + 9); ctx.lineTo(tx - 6, ty + 22); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
          }
          // placa del marc
          ctx.save(); ctx.shadowColor = "rgba(40,20,0,0.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; rr(ctx, fx - 110, fy + 246, 220, 50, 14); ctx.fillStyle = "#C8902E"; ctx.fill(); ctx.restore();
          text(ctx, phase === "free" || phase === "photo" ? "Retorn: foto!" : L_("Retrat {n} de 10", { n: Math.min(idx + 1, 10) }), fx, fy + 272, { size: 26, weight: 900, font: FONT_T, color: "#FFF6E0" });
          // cap de feltre amb les peces
          const rot = Math.sin(t * 1.3) * 0.015 + (shake > 0 ? Math.sin(shake * 40) * shake * 0.08 : 0);
          drawFace(ctx, face, HX, HY, 1, { anim, blink, smile, wrinkle, rot, t });
          // agulla que fa dos punts a la peça nova
          for (const p in anim) {
            const a = anim[p]; if (a > 0.75 || face.parts[p] == null) continue;
            const k = a / 0.75, ph = (k * 2) % 1, [ax, ay] = P[p].at, nx = HX + ax + 40 + (k < 0.5 ? -20 : 20), ny = HY + ay - 10 - Math.sin(ph * Math.PI) * 40;
            ctx.save(); ctx.strokeStyle = "#E0453F"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(HX + ax + 20, HY + ay); ctx.quadraticCurveTo(nx - 30, ny + 40, nx, ny + 10); ctx.stroke();
            ctx.translate(nx, ny); ctx.rotate(0.6); const g = ctx.createLinearGradient(-3, 0, 3, 0); g.addColorStop(0, "#9AA6AE"); g.addColorStop(0.5, "#FFFFFF"); g.addColorStop(1, "#7C8890"); ctx.fillStyle = g;
            ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(3, -22); ctx.quadraticCurveTo(0, -28, -3, -22); ctx.closePath(); ctx.fill(); ctx.fillStyle = "rgba(40,40,40,0.6)"; ctx.fillRect(-1, -20, 2, 7); ctx.restore();
          }
          // peces descosides que cauen al costurer
          for (const l of loose) { const S = partSprite(l.p, l.v, l.skin), [w, h] = P[l.p].wh, s = Math.max(0.35, 1 - l.t * 0.5); ctx.save(); ctx.globalAlpha = clamp(1.6 - l.t, 0, 1); ctx.translate(l.x, l.y); ctx.rotate(l.rot); ctx.scale(s, s); ctx.drawImage(S.c, -w / 2, -h / 2, w, h); ctx.restore(); }
          // fotos fetes (galeria)
          photos.forEach((ph, i) => {
            const px = 590 + i * 50, py = 790;
            ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(i * 2.1) * 0.08);
            ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2; ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-22, -26, 44, 52); ctx.shadowColor = "transparent";
            ctx.fillStyle = "#E3F0EA"; ctx.fillRect(-18, -22, 36, 36); ctx.save(); ctx.beginPath(); ctx.rect(-18, -22, 36, 36); ctx.clip(); drawFace(ctx, ph, 0, -2, 0.07); ctx.restore();
            ctx.restore();
          });
          // costurer amb les peces i les seves plaques
          const its = items(), mode = L === 6 && phase !== "free" ? "cmd" : its.length > 8 ? "list" : "grid";
          if (mode === "cmd") ctx.drawImage(boxSprite("cmd").c, 10, 96, 530, 800); else ctx.drawImage(boxSprite(mode).c, 24, 96, 480, 800);
          if (mode === "cmd") text(ctx, "Ordres", 275, 96 + 80, { size: 34, weight: 900, font: FONT_T, color: "#FFF1DC" });
          const size = L <= 3 ? 64 : L === 4 ? 52 : 40;
          its.forEach((it, i) => {
            const [ix, iy] = itemPos(i, mode), unused = phase !== "free" && L !== 6 && model.parts[it.p] == null, ok = phase !== "free" && L !== 6 && !unused && !needed(it), act = buf && it.text.startsWith(buf) && (needed(it) || phase === "free");
            const hint = hintT > 0 && hintPart === it.p && L !== 6;
            if (mode !== "cmd") {
              ctx.save(); ctx.globalAlpha = unused ? 0.35 : 1;
              drawIcon(ctx, it.p, phase === "free" ? (face.parts[it.p] != null ? face.parts[it.p] : 0) : 0, face.skin, mode === "grid" ? ix - 50 : ix - 140, iy, mode === "grid" ? 96 : 120, mode === "grid" ? 110 : 58);
              ctx.restore();
            }
            const px = mode === "grid" ? ix + 48 : mode === "list" ? ix + 60 : ix;
            drawPlate(ctx, it.text, px, iy, { size, progress: act ? buf.length : 0, state: hint ? "hint" : act ? "active" : ok ? "ok" : null, alpha: unused ? 0.45 : ok ? 0.8 : 1, shadowBlur: 6 });
            if (mode === "cmd") {
              const v = it.set != null ? it.set : face.parts[it.p] != null ? face.parts[it.p] : 0;
              ctx.save(); ctx.globalAlpha = it.set == null ? 0.55 : 1; drawIcon(ctx, it.p, v, face.skin, ix, iy + 84, 150, 76); ctx.restore();
              if (it.set == null) { ctx.strokeStyle = UI.coral; ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(ix - 34, iy + 54); ctx.lineTo(ix + 34, iy + 114); ctx.moveTo(ix + 34, iy + 54); ctx.lineTo(ix - 34, iy + 114); ctx.stroke(); }
            }
            if (ok) { ctx.strokeStyle = UI.ok; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round"; const cx = mode === "grid" ? ix - 50 : ix - 140, cy = iy + (mode === "grid" ? 52 : 14); ctx.beginPath(); ctx.moveTo(cx - 14, cy - 6); ctx.lineTo(cx - 2, cy + 6); ctx.lineTo(cx + 18, cy - 18); ctx.stroke(); }
          });
          if (phase === "free") drawKeyHint(ctx, fx, 800, "Retorn", "Fes la foto", { ks: 46, fs: 26, color: "#203E42" });
          // flaix de la càmera (suau, només sobre el cap)
          if (flash > 0) { ctx.save(); ctx.globalAlpha = flash * 0.5; const g = ctx.createRadialGradient(HX, HY, 40, HX, HY, 360); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(HX - 360, HY - 360, 720, 720); ctx.restore(); }
          drawVignette(ctx, 0.24, "40,25,10");
        },
      };
    },
  });
})();
