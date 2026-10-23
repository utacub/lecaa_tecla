"use strict";
/* 4. Curses de Tecla — cotxets de plàstic sobre una taula, circuit de cinta adhesiva, maqueta 2.5D amb tilt-shift */
(() => {
  const LAPS = 3, HW = 92;                       // amplada mitja de la pista (coordenades del pla)
  const LANES = [-54, -18, 18, 54];              // carrils: rivals 0..2, jugador 3
  // projecció del pla de la taula (X, Z) a la pantalla, amb perspectiva suau
  const sOf = Z => 0.975 + 0.175 * Z / 420;
  const P = (X, Z) => [800 + X * sOf(Z), 548 + 0.62 * (0.975 * Z + 0.175 * Z * Z / 840), sOf(Z)];
  const TY = 0.62;
  const SHAPES = [
    [[-150, 330], [250, 340], [520, 280], [600, 60], [540, -220], [300, -330], [40, -280], [-120, -345], [-420, -330], [-590, -150], [-580, 120], [-450, 300]],
    [[-200, 325], [300, 330], [560, 220], [585, -60], [420, -300], [150, -330], [-60, -225], [-260, -310], [-520, -285], [-605, 0], [-500, 250]],
    [[-200, 330], [250, 300], [450, 335], [600, 150], [560, -150], [350, -320], [0, -290], [-350, -335], [-580, -200], [-565, 80], [-400, 260]],
  ];
  const THEMES = [
    { name: "Circuit de la cuina", surf: "wood", base: "#D9AE76", wall: "#EFE6D6", tile: "#FFFFFF", tall: ["mug", "glass", "mug"], flat: ["spoon", "crumbs", "cookie", "sugar", "crumbs"] },
    { name: "Circuit de la banyera", surf: "tiles", base: "#DDEFF5", wall: "#BFE1EA", tile: "#E9F6FA", tall: ["duck", "bottle", "duck"], flat: ["soap", "drops", "sponge", "drops"] },
    { name: "Circuit del jardí", surf: "grass", base: "#78AE55", wall: "#A9D3E8", tile: "#5E8F43", tall: ["pot", "can", "pot"], flat: ["stone", "leaf", "leaf", "stone", "ladybug"] },
    { name: "Circuit del taller", surf: "bench", base: "#B07A48", wall: "#8A9AA0", tile: "#6F7F86", tall: ["paint", "oil", "paint"], flat: ["nut", "bolt", "wrench", "nut", "shavings"] },
    { name: "Circuit de la taula de l'escola", surf: "lam", base: "#9CC9B4", wall: "#3E5F55", tile: "#2F4B43", tall: ["pencils", "glue", "pencils"], flat: ["eraser", "ruler", "crayon", "crayon", "sharpener"] },
    { name: "Circuit de l'habitació", surf: "rug", base: "#C9606A", wall: "#F3D9A6", tile: "#E9C98E", tall: ["blocks", "ball", "blocks"], flat: ["book", "puzzle", "puzzle", "star"] },
  ];
  const GAP = [0, 7, 6.2, 5.5, 6.5, 8.5, 11];    // segons entre portes a la velocitat base
  const NG = [0, 6, 6, 6, 5, 4, 4];               // portes per volta
  const RIVAL = [0.92, 1.03, 1.14];               // velocitat dels rivals respecte de la base
  const CAR_COL = ["#F2B630", "#E0553A", "#8E6CC8", "#1E9AA0"];
  const ORD = ["", "1r", "2n", "3r", "4t"];

  /* ---------- geometria del circuit ---------- */
  function buildTrack(shapeIdx, mirror) {
    let pts = SHAPES[shapeIdx].map(p => [mirror ? -p[0] : p[0], p[1]]);
    if (mirror) pts = [pts[0]].concat(pts.slice(1).reverse());
    const n = pts.length, S = [];
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      for (let k = 0; k < 40; k++) {
        const t = k / 40, t2 = t * t, t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        S.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    const cum = [0];
    for (let i = 1; i <= S.length; i++) { const a = S[i - 1], b = S[i % S.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const L = cum[S.length];
    function at(d) {
      d = ((d % L) + L) % L;
      let lo = 0, hi = S.length; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
      const a = S[lo], b = S[(lo + 1) % S.length], k = (d - cum[lo]) / Math.max(0.001, cum[lo + 1] - cum[lo]);
      const h = Math.atan2(b[1] - a[1], b[0] - a[0]);
      return { X: lerp(a[0], b[0], k), Z: lerp(a[1], b[1], k), h };
    }
    // punt del pla desplaçat lateralment (normal a l'esquerra del sentit de la marxa)
    function off(d, o) { const q = at(d); return { X: q.X - Math.sin(q.h) * o, Z: q.Z + Math.cos(q.h) * o, h: q.h }; }
    return { S, L, at, off };
  }

  /* ---------- sons propis ---------- */
  const snd = {
    boost() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: 140, f2: 420, slide: 0.35, d: 0.45, type: "sawtooth", v: 0.07, lp: 1400 }); noise({ f: 700, f2: 2600, d: 0.35, v: 0.1, q: 0.8 }); },
    skid() { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 2600, f2: 1500, d: 0.5, v: 0.11, q: 6 }); noise({ f: 400, d: 0.3, v: 0.08, ft: "lowpass" }); },
    fold() { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 1100, f2: 500, d: 0.16, v: 0.16, q: 1.2 }); tone({ f: 260, f2: 160, d: 0.1, type: "triangle", v: 0.12 }); },
  };

  /* ---------- objectes de l'escenari ---------- */
  function cylSprite(key,w,h,draw) {return Sprites.get('g4'+key,w,h,(x)=>{
    const idx=['mug','glass','duck','bottle','pot','can','paint','oil','pencils','glue','blocks','ball'].indexOf(key);
    const im=Art.cell('race-props',idx,4,3,384,360);if(im){x.drawImage(im,0,0,w,h);return;}draw(x,w,h);
  });}
  function cyl(x, cx, top, bot, rx, ry, col, o = {}) { // cilindre vertical vist de biaix
    const g = x.createLinearGradient(cx - rx, 0, cx + rx, 0);
    g.addColorStop(0, shade(col, -0.3)); g.addColorStop(0.28, shade(col, 0.25)); g.addColorStop(0.42, shade(col, 0.45)); g.addColorStop(0.6, col); g.addColorStop(1, shade(col, -0.42));
    x.fillStyle = g; x.beginPath(); x.ellipse(cx, bot, rx, ry, 0, 0, Math.PI); x.lineTo(cx - rx, top); x.ellipse(cx, top, rx, ry, 0, Math.PI, 0, true); x.closePath(); x.fill();
    if (o.cap !== false) { x.fillStyle = o.capCol || shade(col, 0.15); x.beginPath(); x.ellipse(cx, top, rx, ry, 0, 0, Math.PI * 2); x.fill(); }
  }
  function groundShadow(x, cx, cy, rx, ry, a = 0.32) {
    const g = x.createRadialGradient(cx, cy, 2, cx, cy, rx); g.addColorStop(0, `rgba(40,25,10,${a})`); g.addColorStop(1, "rgba(40,25,10,0)");
    x.save(); x.translate(cx, cy); x.scale(1, ry / rx); x.translate(-cx, -cy); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, rx, 0, Math.PI * 2); x.fill(); x.restore();
  }
  // objectes alts (sprites verticals, ancorats a la base)
  const TALL = {
    mug: () => cylSprite("mug", 150, 160, (x, w, h) => {
      groundShadow(x, 86, 140, 70, 18);
      x.lineWidth = 14; x.strokeStyle = "#B8402C"; x.beginPath(); x.ellipse(118, 80, 22, 30, 0, -1.2, 1.2); x.stroke();
      x.lineWidth = 6; x.strokeStyle = "#E06A50"; x.beginPath(); x.ellipse(118, 78, 20, 27, 0, -1, 0.6); x.stroke();
      cyl(x, 66, 40, 134, 50, 14, "#D9503A", { capCol: "#8A3A22" });
      x.strokeStyle = '#F09B7E'; x.lineWidth = 3; x.beginPath(); x.ellipse(66, 40, 48, 13, 0, 0, Math.PI * 2); x.stroke();
      const coffee = x.createLinearGradient(0, 32, 0, 52); coffee.addColorStop(0, '#321C14'); coffee.addColorStop(1, '#795135'); x.fillStyle = coffee; x.beginPath(); x.ellipse(66, 42, 42, 10, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(255,214,164,0.6)'; x.lineWidth = 1; x.beginPath(); x.ellipse(66, 43, 40, 8, 0, 0.1, 2.9); x.stroke();
      x.fillStyle = 'rgba(255,245,228,0.23)'; rr(x, 34, 57, 7, 61, 3); x.fill();
      x.strokeStyle = '#A63828'; x.lineWidth = 2; x.beginPath(); x.ellipse(66, 129, 46, 10, 0, 0.1, 3.05); x.stroke();
      x.fillStyle = "rgba(255,230,200,0.35)"; x.beginPath(); x.ellipse(56, 41, 18, 4, 0, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#fff"; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(36 + i * 15, 90 + (i % 2) * 10, 5, 0, 6.28); x.fill(); }
    }),
    glass: () => cylSprite("glass", 110, 170, (x) => {
      groundShadow(x, 60, 150, 50, 14, 0.22);
      x.save(); x.globalAlpha = 0.35; cyl(x, 52, 28, 146, 36, 10, "#DCEEF0", { cap: false }); x.restore();
      x.globalAlpha = 0.85; cyl(x, 52, 70, 144, 33, 9, "#F6F3EA", { capCol: "#FFFFFF" }); x.globalAlpha = 1;
      x.strokeStyle = "rgba(160,190,200,0.7)"; x.lineWidth = 2; x.beginPath(); x.ellipse(52, 28, 36, 10, 0, 0, Math.PI * 2); x.stroke();
      x.fillStyle = "rgba(255,255,255,0.8)"; rr(x, 28, 40, 5, 96, 2); x.fill();
      x.strokeStyle = 'rgba(102,145,158,0.5)'; x.lineWidth = 1.2; x.beginPath(); x.ellipse(52, 145, 33, 8, 0, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.ellipse(52, 142, 32, 7, 0, 0, Math.PI * 2); x.stroke();
      x.fillStyle = 'rgba(255,255,255,0.5)'; rr(x, 78, 38, 2, 90, 1); x.fill();
    }),
    duck: () => cylSprite("duck", 150, 140, (x) => {
      groundShadow(x, 76, 120, 62, 16);
      const g = x.createRadialGradient(60, 70, 8, 72, 86, 60); g.addColorStop(0, "#FFF08A"); g.addColorStop(0.6, "#F7C928"); g.addColorStop(1, "#D99A10");
      x.fillStyle = g; x.beginPath(); x.ellipse(72, 92, 56, 30, 0, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.moveTo(118, 78); x.quadraticCurveTo(140, 60, 128, 92); x.fill();
      x.beginPath(); x.arc(52, 52, 28, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#F07A1A"; x.beginPath(); x.ellipse(24, 58, 16, 7, -0.15, 0, Math.PI * 2); x.fill();
      x.fillStyle = "#1A1A1A"; x.beginPath(); x.arc(46, 46, 4.5, 0, 6.28); x.fill();
      x.fillStyle = "rgba(255,255,255,0.7)"; x.beginPath(); x.ellipse(60, 36, 10, 5, -0.5, 0, 6.28); x.fill();
    }),
    bottle: () => cylSprite("bottle", 100, 190, (x) => {
      groundShadow(x, 54, 172, 46, 12);
      cyl(x, 50, 46, 168, 34, 9, "#4FB3C9");
      cyl(x, 50, 20, 50, 16, 5, "#F2F2F2");
      x.fillStyle = "#fff"; rr(x, 26, 86, 48, 46, 8); x.fill(); x.fillStyle = "#4FB3C9"; x.beginPath(); x.arc(50, 109, 12, 0, 6.28); x.fill();
    }),
    pot: () => cylSprite("pot", 150, 190, (x) => {
      groundShadow(x, 80, 170, 66, 16);
      x.fillStyle = "#3F8A3A"; for (let i = 0; i < 7; i++) { x.save(); x.translate(72, 70); x.rotate(-1.4 + i * 0.47); x.beginPath(); x.ellipse(0, -34, 12, 36, 0, 0, 6.28); x.fill(); x.restore(); }
      x.fillStyle = "#F06A8A"; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(48 + i * 24, 34 + (i % 2) * 14, 10, 0, 6.28); x.fill(); }
      x.fillStyle = "#FFE08A"; for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(48 + i * 24, 34 + (i % 2) * 14, 4, 0, 6.28); x.fill(); }
      cyl(x, 72, 82, 164, 46, 12, "#C8673A", { capCol: "#6A4A2A" });
      x.fillStyle = "#B4552C"; x.fillRect(26, 82, 92, 14);
    }),
    can: () => cylSprite("can", 170, 160, (x) => {
      groundShadow(x, 84, 140, 70, 16);
      x.strokeStyle = "#2E7FA8"; x.lineWidth = 10; x.beginPath(); x.moveTo(110, 100); x.lineTo(160, 48); x.stroke();
      x.fillStyle = "#2E7FA8"; x.beginPath(); x.ellipse(160, 46, 12, 6, -0.8, 0, 6.28); x.fill();
      cyl(x, 72, 56, 136, 44, 12, "#3D9CC8");
      x.strokeStyle = "#2A6E8E"; x.lineWidth = 8; x.beginPath(); x.arc(72, 56, 34, Math.PI * 1.1, Math.PI * 1.9); x.stroke();
    }),
    paint: () => cylSprite("paint", 130, 150, (x) => {
      groundShadow(x, 68, 132, 58, 14);
      cyl(x, 64, 40, 128, 46, 12, "#C9CED2", { capCol: "#E7EBEE" });
      x.fillStyle = "#2F8FD0"; x.fillRect(18, 62, 92, 40);
      x.fillStyle = "#2F8FD0"; x.beginPath(); x.moveTo(30, 40); x.quadraticCurveTo(34, 64, 40, 62); x.lineTo(40, 40); x.fill();
    }),
    oil: () => cylSprite("oil", 110, 170, (x) => {
      groundShadow(x, 58, 152, 48, 12);
      cyl(x, 54, 60, 148, 38, 10, "#D8402E");
      x.fillStyle = "#B7B7B7"; x.beginPath(); x.moveTo(48, 58); x.lineTo(60, 58); x.lineTo(84, 14); x.lineTo(80, 10); x.closePath(); x.fill();
      x.fillStyle = "#F2B630"; x.fillRect(18, 90, 72, 22);
    }),
    pencils: () => cylSprite("pencils", 130, 210, (x) => {
      groundShadow(x, 70, 190, 56, 14);
      const cols = ["#E0553A", "#F2B630", "#3D9CC8", "#5FB35A"];
      cols.forEach((c, i) => { x.save(); x.translate(50 + i * 12, 90); x.rotate(-0.25 + i * 0.16); x.fillStyle = c; x.fillRect(-5, -78, 10, 80); x.fillStyle = "#F3D7A6"; x.beginPath(); x.moveTo(-5, -78); x.lineTo(0, -96); x.lineTo(5, -78); x.fill(); x.fillStyle = "#333"; x.beginPath(); x.moveTo(-1.6, -91); x.lineTo(0, -96); x.lineTo(1.6, -91); x.fill(); x.restore(); });
      cyl(x, 64, 92, 186, 42, 11, "#5A6FB0", { capCol: "#2E3A62" });
    }),
    glue: () => cylSprite("glue", 90, 170, (x) => {
      groundShadow(x, 48, 152, 40, 11);
      cyl(x, 44, 40, 148, 26, 8, "#F4F4F4");
      cyl(x, 44, 30, 70, 27, 8, "#7A4BC2");
      x.fillStyle = "#7A4BC2"; x.fillRect(24, 96, 40, 18);
    }),
    blocks: () => cylSprite("blocks", 150, 200, (x) => {
      groundShadow(x, 78, 180, 66, 16);
      const box = (bx, by, s, c) => { x.fillStyle = shade(c, -0.25); x.beginPath(); x.moveTo(bx + s, by); x.lineTo(bx + s + s * 0.35, by - s * 0.25); x.lineTo(bx + s + s * 0.35, by + s * 0.75); x.lineTo(bx + s, by + s); x.fill(); x.fillStyle = shade(c, 0.25); x.beginPath(); x.moveTo(bx, by); x.lineTo(bx + s * 0.35, by - s * 0.25); x.lineTo(bx + s * 1.35, by - s * 0.25); x.lineTo(bx + s, by); x.fill(); x.fillStyle = c; x.fillRect(bx, by, s, s); x.fillStyle = "rgba(255,255,255,0.75)"; starPath(x, bx + s / 2, by + s / 2, s * 0.26, s * 0.11, 5); x.fill(); };
      box(22, 120, 56, "#3D9CC8"); box(80, 124, 52, "#F2B630"); box(46, 66, 54, "#E0553A"); box(60, 18, 46, "#5FB35A");
    }),
    ball: () => cylSprite("ball", 140, 140, (x) => {
      groundShadow(x, 78, 122, 60, 15);
      x.save(); x.beginPath(); x.arc(66, 64, 54, 0, 6.28); x.clip();
      const cols = ["#E0553A", "#FFFFFF", "#3D9CC8", "#F2B630"]; for (let i = 0; i < 4; i++) { x.fillStyle = cols[i]; x.beginPath(); x.moveTo(66, 64); x.arc(66, 64, 60, i * 1.57 + 0.3, (i + 1) * 1.57 + 0.3); x.fill(); }
      const g = x.createRadialGradient(46, 42, 4, 66, 64, 60); g.addColorStop(0, "rgba(255,255,255,0.65)"); g.addColorStop(0.35, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.35)"); x.fillStyle = g; x.fillRect(0, 0, 140, 140);
      x.restore();
    }),
  };
  // objectes plans (dibuixats sobre el pla de la taula, al fons)
  const FLAT = {
    spoon(x) { x.fillStyle = "rgba(60,40,20,0.25)"; x.beginPath(); x.ellipse(6, 8, 70, 14, 0, 0, 6.28); x.fill(); const g = x.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, "#F4F6F8"); g.addColorStop(0.5, "#A9B2BA"); g.addColorStop(1, "#E3E7EA"); x.fillStyle = g; x.beginPath(); x.ellipse(-44, 0, 26, 17, 0, 0, 6.28); x.fill(); x.fillRect(-20, -5, 92, 10); x.beginPath(); x.ellipse(72, 0, 10, 8, 0, 0, 6.28); x.fill(); x.fillStyle = "rgba(255,255,255,0.8)"; x.beginPath(); x.ellipse(-50, -5, 12, 5, 0, 0, 6.28); x.fill(); },
    crumbs(x, R) { for (let i = 0; i < 14; i++) { x.fillStyle = R() < 0.5 ? "#B07A3E" : "#D9A55E"; blobPath(x, (R() - 0.5) * 120, (R() - 0.5) * 80, 3 + R() * 6, (R() * 1000) | 0, 0.35, 6); x.fill(); } },
    cookie(x) { x.fillStyle = "rgba(60,40,20,0.25)"; x.beginPath(); x.arc(5, 6, 40, 0, 6.28); x.fill(); x.fillStyle = "#D89A4E"; blobPath(x, 0, 0, 38, 77, 0.06, 12); x.fill(); x.fillStyle = "#5A3418"; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(Math.cos(i * 2.2) * 22, Math.sin(i * 2.2) * 20, 5, 0, 6.28); x.fill(); } x.strokeStyle = "rgba(255,230,180,0.45)"; x.lineWidth = 3; x.beginPath(); x.arc(-6, -6, 26, 3.6, 5.2); x.stroke(); },
    sugar(x) { for (let i = 0; i < 3; i++) { x.fillStyle = "rgba(60,40,20,0.2)"; x.fillRect(i * 30 - 38, -10 + i * 6, 26, 26); x.fillStyle = "#FBFBF6"; x.fillRect(i * 30 - 42, -14 + i * 6, 26, 26); x.fillStyle = "#E5E2D8"; x.fillRect(i * 30 - 42, 6 + i * 6, 26, 6); } },
    soap(x) { x.fillStyle = "rgba(40,60,70,0.22)"; rr(x, -46, -24, 100, 58, 26); x.fill(); x.fillStyle = "#F7A8C0"; rr(x, -50, -30, 100, 58, 26); x.fill(); x.fillStyle = "rgba(255,255,255,0.55)"; rr(x, -38, -22, 56, 14, 7); x.fill(); x.fillStyle = "rgba(255,255,255,0.8)"; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(40 + i * 9, -30 + (i % 3) * 12, 4 + (i % 2) * 3, 0, 6.28); x.fill(); } },
    drops(x, R) { for (let i = 0; i < 6; i++) { const px = (R() - 0.5) * 120, py = (R() - 0.5) * 80, r = 6 + R() * 10; x.fillStyle = "rgba(120,190,220,0.35)"; x.beginPath(); x.arc(px, py, r, 0, 6.28); x.fill(); x.fillStyle = "rgba(255,255,255,0.75)"; x.beginPath(); x.arc(px - r * 0.3, py - r * 0.3, r * 0.3, 0, 6.28); x.fill(); } },
    sponge(x) { x.fillStyle = "rgba(40,60,70,0.22)"; x.fillRect(-46, -26, 100, 60); x.fillStyle = "#F6D24A"; x.fillRect(-50, -30, 100, 60); x.fillStyle = "#5FB35A"; x.fillRect(-50, -30, 100, 18); x.fillStyle = "rgba(160,120,20,0.4)"; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(-44 + (i * 37) % 92, -6 + (i * 13) % 32, 2.5, 0, 6.28); x.fill(); } },
    stone(x, R) { for (let i = 0; i < 3; i++) { const px = i * 34 - 34, py = (R() - 0.5) * 30; x.fillStyle = "rgba(30,40,20,0.3)"; blobPath(x, px + 4, py + 5, 18, i + 5, 0.2, 8); x.fill(); x.fillStyle = ["#A9A49A", "#C8C2B6", "#8E8A82"][i]; blobPath(x, px, py, 18, i + 5, 0.2, 8); x.fill(); x.fillStyle = "rgba(255,255,255,0.3)"; x.beginPath(); x.ellipse(px - 5, py - 6, 7, 4, -0.4, 0, 6.28); x.fill(); } },
    leaf(x, R) { x.rotate(R() * 6); x.fillStyle = "rgba(30,40,20,0.25)"; x.beginPath(); x.ellipse(4, 5, 40, 16, 0, 0, 6.28); x.fill(); x.fillStyle = R() < 0.5 ? "#E09A2E" : "#C9632E"; x.beginPath(); x.ellipse(0, 0, 40, 16, 0, 0, 6.28); x.fill(); x.strokeStyle = "rgba(90,40,10,0.5)"; x.lineWidth = 2; x.beginPath(); x.moveTo(-40, 0); x.lineTo(40, 0); x.stroke(); },
    ladybug(x) { x.fillStyle = "rgba(30,40,20,0.3)"; x.beginPath(); x.ellipse(3, 4, 18, 14, 0, 0, 6.28); x.fill(); x.fillStyle = "#D8261C"; x.beginPath(); x.ellipse(0, 0, 18, 14, 0, 0, 6.28); x.fill(); x.fillStyle = "#151515"; x.beginPath(); x.arc(16, 0, 8, 0, 6.28); x.fill(); x.fillRect(-18, -1, 34, 2); [[-8, -6], [-8, 6], [4, -7], [4, 7]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 3.2, 0, 6.28); x.fill(); }); },
    nut(x) { x.fillStyle = "rgba(20,20,20,0.3)"; x.beginPath(); for (let i = 0; i < 6; i++) x.lineTo(4 + Math.cos(i * 1.047) * 20, 5 + Math.sin(i * 1.047) * 20); x.fill(); const g = x.createLinearGradient(-20, -20, 20, 20); g.addColorStop(0, "#E8ECEE"); g.addColorStop(1, "#7E878D"); x.fillStyle = g; x.beginPath(); for (let i = 0; i < 6; i++) x.lineTo(Math.cos(i * 1.047) * 20, Math.sin(i * 1.047) * 20); x.closePath(); x.fill(); x.fillStyle = "#5A4532"; x.beginPath(); x.arc(0, 0, 8, 0, 6.28); x.fill(); },
    bolt(x) { x.fillStyle = "rgba(20,20,20,0.3)"; x.fillRect(-26, -2, 64, 12); const g = x.createLinearGradient(0, -8, 0, 8); g.addColorStop(0, "#E8ECEE"); g.addColorStop(1, "#7E878D"); x.fillStyle = g; x.fillRect(-20, -6, 56, 12); x.fillRect(-34, -12, 16, 24); x.strokeStyle = "rgba(60,60,60,0.5)"; x.lineWidth = 1.5; for (let i = 0; i < 9; i++) { x.beginPath(); x.moveTo(-14 + i * 6, -6); x.lineTo(-10 + i * 6, 6); x.stroke(); } },
    wrench(x) { x.fillStyle = "rgba(20,20,20,0.3)"; rr(x, -66, -4, 136, 18, 9); x.fill(); const g = x.createLinearGradient(0, -10, 0, 10); g.addColorStop(0, "#EEF1F3"); g.addColorStop(1, "#8A949A"); x.fillStyle = g; rr(x, -60, -8, 120, 16, 8); x.fill(); x.beginPath(); x.arc(-62, 0, 20, 0.7, 5.6); x.lineTo(-58, 0); x.closePath(); x.fill(); x.fillStyle = "#C8452E"; rr(x, -10, -7, 56, 14, 7); x.fill(); },
    shavings(x, R) { x.strokeStyle = "#E7C48E"; x.lineWidth = 3; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc((R() - 0.5) * 100, (R() - 0.5) * 60, 8 + R() * 8, R() * 6, R() * 6 + 4); x.stroke(); } },
    eraser(x) { x.fillStyle = "rgba(20,30,30,0.25)"; x.fillRect(-36, -14, 76, 36); x.fillStyle = "#F4A0A8"; x.fillRect(-40, -18, 76, 36); x.fillStyle = "#3D7CC8"; x.fillRect(-4, -18, 40, 36); },
    ruler(x) { x.fillStyle = "rgba(20,30,30,0.22)"; x.fillRect(-116, -14, 240, 40); x.fillStyle = "rgba(250,240,170,0.92)"; x.fillRect(-120, -18, 240, 40); x.fillStyle = "#3A3A3A"; for (let i = 0; i <= 24; i++) x.fillRect(-116 + i * 9.7, -18, 1.5, i % 5 ? 8 : 14); },
    crayon(x, R) { const c = pick(["#E0553A", "#3D9CC8", "#5FB35A", "#F2B630", "#8E6CC8"]); x.rotate(R() * 6); x.fillStyle = "rgba(20,30,30,0.25)"; x.fillRect(-36, -4, 76, 14); x.fillStyle = c; x.fillRect(-40, -7, 66, 14); x.beginPath(); x.moveTo(26, -7); x.lineTo(42, 0); x.lineTo(26, 7); x.fill(); x.fillStyle = "rgba(255,255,255,0.35)"; x.fillRect(-40, -5, 66, 3); },
    sharpener(x) { x.fillStyle = "rgba(20,30,30,0.25)"; x.fillRect(-18, -12, 42, 32); x.fillStyle = "#3DB08A"; x.fillRect(-22, -16, 42, 32); x.fillStyle = "#C8CDD0"; x.fillRect(-22, -6, 42, 8); x.fillStyle = "#222"; x.beginPath(); x.arc(-1, 0, 6, 0, 6.28); x.fill(); },
    book(x) { x.fillStyle = "rgba(40,20,20,0.3)"; x.fillRect(-56, -36, 120, 82); x.fillStyle = "#3D7CC8"; x.fillRect(-60, -40, 120, 82); x.fillStyle = "#F4F0E2"; x.fillRect(-58, 36, 116, 6); x.fillStyle = "#F2B630"; x.beginPath(); x.arc(0, 0, 18, 0, 6.28); x.fill(); },
    puzzle(x, R) { x.rotate(R() * 6); const c = pick(["#F2B630", "#5FB35A", "#3D9CC8"]); x.fillStyle = "rgba(40,20,20,0.3)"; x.fillRect(-20, -18, 44, 44); x.fillStyle = c; x.fillRect(-24, -22, 44, 44); x.beginPath(); x.arc(20, 0, 9, 0, 6.28); x.arc(-2, -22, 9, 0, 6.28); x.fill(); },
    star(x) { x.fillStyle = "rgba(40,20,20,0.3)"; starPath(x, 4, 5, 34, 15, 5); x.fill(); x.fillStyle = "#F2B630"; starPath(x, 0, 0, 34, 15, 5); x.fill(); x.fillStyle = "rgba(255,255,255,0.4)"; starPath(x, -4, -4, 14, 6, 5); x.fill(); },
  };

  /* ---------- fons: paret desenfocada, superfície, cinta i objectes plans ---------- */
  function buildBg(th, tr, props, flats, seed) {
    const c = makeCanvas(W, H), x = c.getContext("2d"), R = mulberry32(seed);
    const yEdge = P(0, -560)[1];
    // paret del fons (es desenfocarà)
    const wall = makeCanvas(W, yEdge + 40), wx = wall.getContext("2d");
    const wg = wx.createLinearGradient(0, 0, 0, yEdge); wg.addColorStop(0, shade(th.wall, -0.12)); wg.addColorStop(1, th.wall); wx.fillStyle = wg; wx.fillRect(0, 0, W, yEdge + 40);
    if (th.surf === "wood" || th.surf === "tiles") { wx.strokeStyle = rgba("#000000", 0.08); wx.lineWidth = 3; for (let i = 0; i < W; i += 62) { wx.beginPath(); wx.moveTo(i, 0); wx.lineTo(i, yEdge); wx.stroke(); } for (let j = 20; j < yEdge; j += 62) { wx.beginPath(); wx.moveTo(0, j); wx.lineTo(W, j); wx.stroke(); } }
    if (th.surf === "wood") { wx.fillStyle = "#A9D6EE"; rr(wx, 980, 30, 380, 170, 10); wx.fill(); wx.fillStyle = "#FFFFFF"; wx.fillRect(1164, 30, 12, 170); wx.fillRect(980, 110, 380, 10); wx.fillStyle = "#8A5A36"; rr(wx, 120, 90, 520, 200, 8); wx.fill(); wx.fillStyle = "#9E6A42"; for (let i = 0; i < 3; i++) { rr(wx, 140 + i * 170, 110, 150, 160, 6); wx.fill(); } }
    if (th.surf === "tiles") { wx.fillStyle = "#FFFFFF"; rr(wx, 180, 40, 420, 240, 120); wx.fill(); wx.fillStyle = "#9FD0DE"; rr(wx, 205, 60, 370, 200, 100); wx.fill(); wx.fillStyle = "#C9CED2"; wx.fillRect(1100, 40, 30, 120); wx.beginPath(); wx.arc(1115, 40, 46, Math.PI, 0); wx.fill(); }
    if (th.surf === "grass") { wx.fillStyle = "#4E8A3A"; for (let i = 0; i < 26; i++) { wx.beginPath(); wx.arc(i * 66, yEdge - 30 + Math.sin(i) * 20, 70, 0, 6.28); wx.fill(); } wx.fillStyle = "#FFF6D0"; wx.beginPath(); wx.arc(1350, 70, 46, 0, 6.28); wx.fill(); wx.fillStyle = "#FFFFFF"; [[300, 70], [700, 50], [1000, 90]].forEach(([a, b]) => { wx.beginPath(); wx.ellipse(a, b, 90, 26, 0, 0, 6.28); wx.fill(); }); }
    if (th.surf === "bench") { wx.fillStyle = "#6F7F86"; for (let i = 20; i < W; i += 36) for (let j = 20; j < yEdge; j += 36) { wx.beginPath(); wx.arc(i, j, 4, 0, 6.28); wx.fill(); } wx.fillStyle = "#3E4A50"; [[260, 60, 30, 170], [360, 80, 20, 140], [1200, 50, 40, 160], [1300, 70, 26, 150]].forEach(([a, b, w2, h2]) => { rr(wx, a, b, w2, h2, 8); wx.fill(); }); }
    if (th.surf === "lam") { wx.fillStyle = "#2F4B43"; rr(wx, 260, 30, 1080, 230, 10); wx.fill(); wx.strokeStyle = "#B88A5A"; wx.lineWidth = 16; rr(wx, 260, 30, 1080, 230, 10); wx.stroke(); wx.strokeStyle = "rgba(255,255,255,0.55)"; wx.lineWidth = 6; wx.beginPath(); wx.moveTo(360, 120); wx.bezierCurveTo(500, 60, 600, 180, 760, 100); wx.stroke(); wx.beginPath(); wx.arc(1100, 140, 50, 0, 6.28); wx.stroke(); }
    if (th.surf === "rug") { wx.fillStyle = "rgba(255,255,255,0.4)"; for (let i = 0; i < 40; i++) { starPath(wx, (i * 173) % W, 30 + (i * 67) % (yEdge - 40), 12, 5, 5); wx.fill(); } wx.fillStyle = "#7FA8D8"; rr(wx, 1040, 120, 480, 220, 30); wx.fill(); wx.fillStyle = "#FFFFFF"; rr(wx, 1060, 110, 160, 70, 30); wx.fill(); }
    x.save(); x.filter = "blur(7px)"; x.drawImage(wall, 0, 0); x.restore();
    // vora de la taula
    // superfície
    const surf = makeCanvas(W, H), sx = surf.getContext("2d");
    const top = yEdge;
    if (th.surf === "wood" || th.surf === "bench") sx.drawImage(Tex.wood(800, 450, th.base, { seed: 4, vertical: false }), 0, 0, W, H);
    else if (th.surf === "grass") { sx.fillStyle = sx.createPattern(Tex.felt(256, 256, th.base, { seed: 12, plush: true }), "repeat"); sx.fillRect(0, 0, W, H); }
    else if (th.surf === "rug") { sx.fillStyle = sx.createPattern(Tex.felt(256, 256, th.base, { seed: 14 }), "repeat"); sx.fillRect(0, 0, W, H); }
    else { sx.fillStyle = sx.createPattern(Tex.paper(256, 256, th.base, { seed: 15, fiber: 0.8 }), "repeat"); sx.fillRect(0, 0, W, H); }
    const line = (X1, Z1, X2, Z2) => { const a = P(X1, Z1), b = P(X2, Z2); sx.beginPath(); sx.moveTo(a[0], a[1]); sx.lineTo(b[0], b[1]); sx.stroke(); };
    if (th.surf === "wood" || th.surf === "bench") { sx.strokeStyle = "rgba(70,40,15,0.35)"; sx.lineWidth = 2.5; for (let X = -1300; X <= 1300; X += 190) line(X, -560, X, 620); }
    if (th.surf === "tiles") { sx.strokeStyle = "rgba(120,160,175,0.6)"; sx.lineWidth = 3; for (let X = -1400; X <= 1400; X += 120) line(X, -560, X, 620); for (let Z = -560; Z <= 620; Z += 120) line(-1600, Z, 1600, Z); }
    if (th.surf === "grass") { sx.fillStyle = "rgba(255,255,255,0.06)"; for (let X = -1400; X < 1400; X += 240) { const a = P(X, -560), b = P(X + 120, -560), cc = P(X + 120, 620), d = P(X, 620); sx.beginPath(); sx.moveTo(a[0], a[1]); sx.lineTo(b[0], b[1]); sx.lineTo(cc[0], cc[1]); sx.lineTo(d[0], d[1]); sx.fill(); } }
    if (th.surf === "lam") { sx.fillStyle = "rgba(255,255,255,0.05)"; for (let i = 0; i < 400; i++) sx.fillRect(R() * W, top + R() * (H - top), 2, 2); }
    if (th.surf === "rug") { sx.strokeStyle = "rgba(255,230,190,0.6)"; sx.lineWidth = 10; const b = [[-690, -500], [690, -500], [690, 560], [-690, 560]]; sx.beginPath(); b.forEach(([X, Z], i) => { const p = P(X, Z); i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1]); }); sx.closePath(); sx.stroke(); sx.lineWidth = 4; const b2 = b.map(([X, Z]) => [X * 0.94, Z * 0.94]); sx.beginPath(); b2.forEach(([X, Z], i) => { const p = P(X, Z); i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1]); }); sx.closePath(); sx.stroke(); }
    // ombra de llum de finestra, profunditat
    const dg = sx.createLinearGradient(0, top, 0, H); dg.addColorStop(0, "rgba(30,20,10,0.32)"); dg.addColorStop(0.35, "rgba(30,20,10,0.06)"); dg.addColorStop(1, "rgba(30,20,10,0.12)"); sx.fillStyle = dg; sx.fillRect(0, 0, W, H);
    const scene=Art.get(th.surf==='wood'?'race-bg':'race-'+th.surf);
    if(scene){x.drawImage(scene,0,0,W,H);sx.drawImage(scene,0,0,W,H);}
    // objectes plans
    for (const f of flats) { const [px, py, s] = P(f.X, f.Z); sx.save(); sx.translate(px, py); sx.scale(s * 0.9, s * 0.9 * TY); sx.rotate(f.r); const ids={spoon:0,cookie:1,soap:2,sponge:3,stone:4,leaf:5,ladybug:5,nut:6,bolt:6,wrench:7,shavings:7,eraser:8,sharpener:8,ruler:9,crayon:9,book:10,puzzle:11,star:11};
      const art=Art.cell('race-flats',ids[f.kind],4,3,180,140);
      if(art&&ids[f.kind]!=null){sx.scale(1,1/TY);sx.drawImage(art,-70,-42,140,96);}else FLAT[f.kind](sx,mulberry32(f.seed)); sx.restore(); }
    // circuit: llapis central, cinta adhesiva i sortida
    const N = tr.S.length, step = 2;
    const strip = (o1, o2, fill, edge) => {
      sx.beginPath();
      for (let i = 0; i <= N; i += step) { const q = tr.off(tr.L * i / N, o1), p = P(q.X, q.Z); i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1]); }
      for (let i = N; i >= 0; i -= step) { const q = tr.off(tr.L * i / N, o2), p = P(q.X, q.Z); sx.lineTo(p[0], p[1]); }
      sx.closePath(); sx.fillStyle = fill; sx.fill("evenodd"); if (edge) { sx.strokeStyle = edge; sx.lineWidth = 1.2; sx.stroke(); }
    };
    // A real raised wooden road: full driving surface, extrusion and segmented curbs.
    sx.save();sx.translate(8,19);sx.shadowColor='rgba(35,15,5,.45)';sx.shadowBlur=20;strip(-HW-20,HW+20,'#58321d');sx.restore();
    sx.save();sx.translate(0,14);strip(-HW-20,HW+20,'#946033','#704522');sx.restore();
    strip(-HW-20,HW+20,'#f2d6a4','#ac7846');
    const grain=sx.createPattern(Tex.wood(512,256,'#d7ad76',{seed:42,vertical:false}),'repeat');
    strip(-HW,HW,grain,'#b88854');
    const segment=(d,d2,o1,o2,col)=>{sx.beginPath();const pts=[tr.off(d,o1),tr.off(d2,o1),tr.off(d2,o2),tr.off(d,o2)].map(q=>P(q.X,q.Z));pts.forEach((p,i)=>i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1]));sx.closePath();sx.fillStyle=col;sx.fill();};
    for(let d=0;d<tr.L;d+=48)for(const side of [-1,1])segment(d,Math.min(d+47,tr.L),side*(HW+2),side*(HW+18),Math.floor(d/48)%3===0?'#d94d3c':'#fff1d4');
    for(let d=0;d<tr.L;d+=170){sx.strokeStyle='rgba(94,54,26,.34)';sx.lineWidth=1.4;const a=tr.off(d,-HW-18),b=tr.off(d,HW+18),pa=P(a.X,a.Z),pb=P(b.X,b.Z);sx.beginPath();sx.moveTo(...pa.slice(0,2));sx.lineTo(...pb.slice(0,2));sx.stroke();}
    for(const side of [-1,1])strip(side*(HW+18),side*(HW+20),'#fff0cb');
    for(const lane of [-36,0,36]){sx.strokeStyle='rgba(255,249,225,.8)';sx.lineWidth=2.3;sx.setLineDash([16,18]);sx.beginPath();for(let i=0;i<=N;i+=step){const q=tr.off(tr.L*i/N,lane),p=P(q.X,q.Z);i?sx.lineTo(p[0],p[1]):sx.moveTo(p[0],p[1]);}sx.stroke();}sx.setLineDash([]);
    // línia de sortida a quadres
    for (let r = 0; r < 2; r++) for (let k = 0; k < 8; k++) {
      const o1 = -HW + k * HW / 4, o2 = o1 + HW / 4, d1 = r * 12, d2 = d1 + 12;
      const a = tr.off(d1, o1), b = tr.off(d1, o2), cc = tr.off(d2, o2), d = tr.off(d2, o1);
      const pts = [a, b, cc, d].map(q => P(q.X, q.Z)); sx.beginPath(); pts.forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.closePath();
      sx.fillStyle = (r + k) % 2 ? "#1E2224" : "#FBFBF6"; sx.fill();
    }
    // composició amb tilt-shift (la part de darrere de la taula, desenfocada)
    const blur = makeCanvas(W, H), bx = blur.getContext("2d"); bx.filter = "blur(3px)"; bx.drawImage(surf, 0, 0); bx.filter = "none";
    bx.globalCompositeOperation = "destination-in"; const mg = bx.createLinearGradient(0, top, 0, top + 120); mg.addColorStop(0, "rgba(0,0,0,1)"); mg.addColorStop(1, "rgba(0,0,0,0)"); bx.fillStyle = mg; bx.fillRect(0, 0, W, H);
    x.save(); x.beginPath(); x.rect(0, top, W, H - top); x.clip(); x.drawImage(surf, 0, 0); x.drawImage(blur, 0, 0); x.restore();
    // cantell de la taula
    
    // cartell del circuit (cartró plegat)
    x.save(); x.translate(64, 800);
    x.fillStyle = "rgba(40,25,10,0.3)"; x.beginPath(); x.ellipse(150, 70, 170, 18, 0, 0, 6.28); x.fill();
    x.fillStyle = "#B88650"; x.beginPath(); x.moveTo(0, 66); x.lineTo(16, 0); x.lineTo(304, 0); x.lineTo(296, 66); x.closePath(); x.fill();
    x.fillStyle = "#D4A56C"; x.beginPath(); x.moveTo(6, 62); x.lineTo(20, 4); x.lineTo(300, 4); x.lineTo(292, 62); x.closePath(); x.fill();
    text(x, th.name.replace("Circuit ", "Circuit "), 156, 34, { size: th.name.length > 24 ? 19 : 22, weight: 900, font: FONT_T, color: "#3A2614" });
    x.restore();
    return c;
  }

  /* ---------- cotxes ---------- */
  function carSprites(col, i, mine) {
    const top = Sprites.get("g4carT" + col + i + mine, 84, 50, (x) => {
      x.translate(42, 25);
      x.fillStyle = "#1C1C1E"; [[-23, -19], [23, -19], [-23, 19], [23, 19]].forEach(([a, b]) => { rr(x, a - 9, b - 5, 18, 10, 3); x.fill(); });
      const body = () => { x.beginPath(); x.moveTo(-36, -12); x.quadraticCurveTo(-36, -17, -30, -17); x.lineTo(14, -17); x.quadraticCurveTo(36, -16, 38, -6); x.lineTo(38, 6); x.quadraticCurveTo(36, 16, 14, 17); x.lineTo(-30, 17); x.quadraticCurveTo(-36, 17, -36, 12); x.closePath(); };
      const g = x.createLinearGradient(0, -17, 0, 17); g.addColorStop(0, shade(col, 0.45)); g.addColorStop(0.35, col); g.addColorStop(1, shade(col, -0.3));
      body(); x.fillStyle = g; x.fill(); x.lineWidth = 1.5; x.strokeStyle = shade(col, -0.45); x.stroke();
      if (mine) { x.fillStyle = "#FFFFFF"; x.fillRect(-36, -5, 74, 3.5); x.fillRect(-36, 1.5, 74, 3.5); }
      else { x.fillStyle = "rgba(255,255,255,0.85)"; x.fillRect(-36, -2, 74, 4); }
      // cabina
      x.fillStyle = "#24343C"; rr(x, -16, -12, 28, 24, 7); x.fill();
      x.fillStyle = shade(col, 0.15); rr(x, -12, -10, 16, 20, 5); x.fill();
      const gl = x.createLinearGradient(8, -10, 14, 10); gl.addColorStop(0, "#9FD8EE"); gl.addColorStop(1, "#3A6A80"); x.fillStyle = gl; rr(x, 5, -10, 8, 20, 3); x.fill();
      // Juntes de motlle, reixeta, retrovisors i reflexos de vidre.
      x.strokeStyle = shade(col, -0.38); x.lineWidth = 0.8;
      for (const yy of [-13, 13]) { x.beginPath(); x.moveTo(-21, yy); x.lineTo(-21, yy * 0.65); x.lineTo(4, yy * 0.65); x.stroke(); }
      x.fillStyle = '#D9E6E8'; for (const yy of [-16, 16]) { rr(x, 7, yy - 2, 6, 4, 1.5); x.fill(); }
      x.fillStyle = '#28333B'; for (let k = 0; k < 4; k++) { rr(x, -31 + k * 3, -8, 1.4, 16, 0.5); x.fill(); }
      x.save(); rr(x, 5, -10, 8, 20, 3); x.clip(); x.fillStyle = 'rgba(235,253,255,0.6)'; x.beginPath(); x.moveTo(5, -10); x.lineTo(9, -10); x.lineTo(13, 1); x.lineTo(10, 4); x.closePath(); x.fill(); x.restore();
      // número
      x.fillStyle = "#FFFFFF"; x.beginPath(); x.arc(24, 0, 7, 0, 6.28); x.fill();
      x.fillStyle = BRAND.ink; x.font = `900 10px ${FONT_T}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(String(i + 1), 24, 0.5);
      // brillantor i rascades del plàstic
      x.fillStyle = "rgba(255,255,255,0.45)"; x.beginPath(); x.ellipse(-8, -12, 22, 3, 0, 0, 6.28); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.35)"; x.lineWidth = 0.7; [[-30, 8, -20, 12], [18, -12, 26, -9], [-4, 13, 6, 11]].forEach(([a, b, c2, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); });
      x.fillStyle = "#FFF6C8"; x.fillRect(35, -12, 3, 6); x.fillRect(35, 6, 3, 6);
      x.fillStyle = "#C8341F"; x.fillRect(-37, -12, 2.5, 5); x.fillRect(-37, 7, 2.5, 5);
    });
    const side = Sprites.get("g4carS" + col, 84, 50, (x) => {
      x.translate(42, 25); x.fillStyle = "#151517"; [[-23, -19], [23, -19], [-23, 19], [23, 19]].forEach(([a, b]) => { rr(x, a - 10, b - 6, 20, 12, 4); x.fill(); });
      const flank = x.createLinearGradient(0, -17, 0, 17); flank.addColorStop(0, shade(col, -0.15)); flank.addColorStop(0.55, shade(col, -0.4)); flank.addColorStop(1, shade(col, -0.68)); x.fillStyle = flank; rr(x, -36, -17, 74, 34, 12); x.fill();
      x.fillStyle = '#8A9B9E'; rr(x, -35, 13, 69, 2, 1); x.fill();
      for (const [a,b] of [[-23,-21],[23,-21],[-23,21],[23,21]]) {
        x.fillStyle = '#080D12'; rr(x,a-9,b-4,18,8,3); x.fill();
        const hub = x.createLinearGradient(a-6,b-3,a+6,b+3); hub.addColorStop(0,'#EAF3F5'); hub.addColorStop(0.5,'#667C86'); hub.addColorStop(1,'#243743'); x.fillStyle=hub; rr(x,a-6,b-2.7,12,5.4,2); x.fill();
        x.strokeStyle='#13222C'; x.lineWidth=0.7; for(let q=-4;q<=4;q+=2){x.beginPath();x.moveTo(a+q,b-2);x.lineTo(a+q,b+2);x.stroke();}
      }
    });
    const shadow = Sprites.get("g4carSh", 110, 76, (x) => { x.shadowColor = "rgba(30,15,5,0.55)"; x.shadowBlur = 10; x.fillStyle = "rgba(30,15,5,0.45)"; rr(x, 16, 18, 78, 40, 16); x.fill(); });
    return { top, side, shadow };
  }
  function drawCar(ctx, car, t) {
    const [sx, sy, s] = P(car.X, car.Z), h = car.h + car.yaw, k = s * 1.22;
    const frame=Art.carFrame(car.i,h),dir=frame.dir,art=frame.image;
    if(art){ctx.save();ctx.translate(sx,sy);groundShadow(ctx,4,5,47*k,14*k,.36);
      const bob=Settings.reduceMotion?0:Math.sin(t*12+car.i)*.65*(car.moving?1:0);
      if(car.boost>.05){ctx.save();ctx.rotate(Math.atan2(Math.sin(h)*TY,Math.cos(h)));const glow=ctx.createLinearGradient(-40,0,-92,0);glow.addColorStop(0,'#fff4b3');glow.addColorStop(.35,'#ffac36');glow.addColorStop(1,'rgba(255,90,0,0)');ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(-30,-7);ctx.lineTo(-90,0);ctx.lineTo(-30,7);ctx.fill();ctx.restore();}
      // Direction frames preserve the upright driver instead of rotating a flat decal.
      ctx.rotate(Math.sin(h-dir*Math.PI/8)*.10);if(frame.flip)ctx.scale(-1,1);ctx.drawImage(art,-48*k,-77*k+bob,96*k,96*k);ctx.restore();return;}

    const tf = (dx, dy) => { ctx.translate(sx + dx, sy + dy); ctx.scale(k, k * TY); ctx.rotate(h); };
    ctx.save(); tf(6 * s, 5 * s); ctx.drawImage(car.spr.shadow.c, -55, -38, 110, 76); ctx.restore();
    // flama de l'impuls
    if (car.boost > 0.05) {
      const f = clamp(car.boost / 1.9, 0, 1), L = (26 + 22 * f) * (0.85 + 0.15 * Math.sin((Settings.reduceMotion ? 0 : t) * 8 + car.i));
      ctx.save(); tf(0, -6 * s);
      const g = ctx.createLinearGradient(-38, 0, -38 - L, 0); g.addColorStop(0, "rgba(255,250,210,0.95)"); g.addColorStop(0.35, "rgba(255,190,60,0.85)"); g.addColorStop(1, "rgba(240,90,30,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-36, -9); ctx.quadraticCurveTo(-38 - L * 0.6, -10, -38 - L, 0); ctx.quadraticCurveTo(-38 - L * 0.6, 10, -36, 9); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    const bob = Settings.reduceMotion ? 0 : Math.sin(t * 12 + car.i * 2) * 0.45 * (car.moving ? 1 : 0);
    ctx.save(); tf(0, 0); ctx.drawImage(car.spr.side.c, -42, -25, 84, 50); ctx.restore();
    ctx.save(); tf(0, -9 * s + bob); ctx.drawImage(car.spr.top.c, -42, -25, 84, 50); ctx.restore();
  }

  /* ---------- porta de cartró ---------- */
  function gatePts(tr, g, off = 0) {
    const q = tr.at(g.d), fx = Math.cos(q.h), fz = Math.sin(q.h);
    const a = tr.off(g.d, -(HW + 16)), b = tr.off(g.d, HW + 16);
    a.X += fx * off; a.Z += fz * off; b.X += fx * off; b.Z += fz * off;
    const th = g.fold * Math.PI / 2 * (g.crash ? 1.04 : 1), out = [], inn = [];
    for (let k = 0; k <= 16; k++) {
      const u = k / 16, f = Math.pow(Math.sin(Math.PI * u), 0.32), X = lerp(a.X, b.X, u), Z = lerp(a.Z, b.Z, u);
      const tw = g.crash ? Math.sin(u * Math.PI) * g.fold * 30 : 0;
      const hgt = 112 * f, p = P(X + fx * hgt * Math.sin(th) + tw * fz, Z + fz * hgt * Math.sin(th) - tw * fx);
      out.push([p[0], p[1] - hgt * Math.cos(th) * p[2]]);
      const u2 = lerp(0.13, 0.87, u), f2 = Math.pow(Math.sin(Math.PI * u), 0.4), X2 = lerp(a.X, b.X, u2), Z2 = lerp(a.Z, b.Z, u2), hg2 = 84 * f2;
      const p2 = P(X2 + fx * hg2 * Math.sin(th), Z2 + fz * hg2 * Math.sin(th)); inn.push([p2[0], p2[1] - hg2 * Math.cos(th) * p2[2]]);
    }
    const pa = P(a.X, a.Z), pb = P(b.X, b.Z);
    return { out, inn, base: [pa, pb], top: out[8] };
  }
  const GD = 34; // gruix del cartró en el sentit de la marxa
  function drawGate(ctx, tr, g) {
    const A = gatePts(tr, g, -GD / 2), B = gatePts(tr, g, GD / 2);
    const avgY = G => (G.out[8][1] + G.base[0][1] + G.base[1][1]) / 3;
    const [far, near] = avgY(A) < avgY(B) ? [A, B] : [B, A];
    const face = G => { ctx.beginPath(); G.out.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = G.inn.length - 1; i >= 0; i--) ctx.lineTo(G.inn[i][0], G.inn[i][1]); ctx.closePath(); };
    // ombra a terra
    ctx.save(); ctx.globalAlpha = 0.2 * (1 - g.fold * 0.6); ctx.fillStyle = "#28180A";
    ctx.beginPath(); ctx.moveTo(near.base[0][0], near.base[0][1]); ctx.lineTo(near.base[1][0], near.base[1][1]); ctx.lineTo(near.base[1][0] + 40, near.base[1][1] + 14); ctx.lineTo(near.base[0][0] + 40, near.base[0][1] + 14); ctx.closePath(); ctx.fill(); ctx.restore();
    // cara del fons
    face(far); ctx.fillStyle = "#A8784A"; ctx.fill("evenodd");
    // superfícies de gruix: interior (fosca) i exterior (clara, rep la llum)
    const strip = (k1, k2, col) => { for (let i = 0; i < 16; i++) { const a1 = far[k1][i], a2 = far[k1][i + 1], b1 = near[k1][i], b2 = near[k1][i + 1]; ctx.beginPath(); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(b1[0], b1[1]); ctx.closePath(); ctx.fillStyle = typeof col === "function" ? col(i) : col; ctx.fill(); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1; ctx.stroke(); } };
    strip("inn", 0, i => mix("#7E5630", "#9A6C40", Math.abs(i - 8) / 8));
    strip("out", 0, i => mix("#E9C48E", "#C99A62", Math.abs(i - 8) / 8));
    // canals del cartró ondulat a la vora superior
    ctx.strokeStyle = "rgba(110,75,40,0.35)"; ctx.lineWidth = 1;
    for (let i = 1; i < 16; i += 1) { const p = far.out[i], q = near.out[i]; ctx.beginPath(); ctx.moveTo(lerp(p[0], q[0], 0.2), lerp(p[1], q[1], 0.2)); ctx.lineTo(lerp(p[0], q[0], 0.8), lerp(p[1], q[1], 0.8)); ctx.stroke(); }
    // cara del davant
    face(near); const yT = near.top[1], g2 = ctx.createLinearGradient(0, yT, 0, near.base[0][1]); g2.addColorStop(0, "#DDB27A"); g2.addColorStop(1, "#B98A55"); ctx.fillStyle = g2; ctx.fill("evenodd");
    ctx.lineWidth = 1.6; ctx.strokeStyle = "rgba(90,60,30,0.6)"; ctx.stroke();
    ctx.save(); face(near); ctx.clip("evenodd"); ctx.strokeStyle = g.col; ctx.lineWidth = 9; ctx.globalAlpha = 0.92;
    ctx.beginPath(); for (let i = 0; i < near.out.length; i++) { const p = near.out[i], q = near.inn[i]; const X = lerp(p[0], q[0], 0.5), Y = lerp(p[1], q[1], 0.5); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); ctx.restore();
    return near.top[1] < far.top[1] ? near.top : far.top;
  }

  /* ---------- miniatura ---------- */
  function thumb(ctx,x,y,w,h,t){
    const th=THEMES[0],tr=buildTrack(0,false);const bg=Tex.get('raceThumbProduction',()=>buildBg(th,tr,[],[{kind:'cookie',X:0,Z:0,r:0,seed:5}],90));
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.translate(x,y);ctx.scale(w/W,h/H);ctx.drawImage(bg,0,0);
    for(let i=0;i<4;i++){const q=tr.off(100+i*100,LANES[i]);drawCar(ctx,{...q,i,yaw:0,boost:0,moving:false,spr:carSprites(CAR_COL[i],i,i===3)},t);}
    const mug=TALL.mug();Sprites.draw(ctx,mug,800,540,{s:1.5});drawPlate(ctx,'a',700,265,{size:130});ctx.restore();
  }

  Games.register({
    id: 4, key: "c", name: "Curses de Tecla", zone: "poble", music: "rally", demoTime: 10, captionY: 112, updateAtEnd: true,
    collect: { one: "copa", many: "copes" },
    goal: l => l <= 3 ? "Escriu la lletra de cada porta abans d'arribar-hi i el cotxe correrà més. Acaba les 3 voltes entre els 3 primers."
      : l === 4 ? "Escriu la síl·laba de cada porta abans d'arribar-hi i el cotxe correrà més. Acaba les 3 voltes entre els 3 primers."
        : "Escriu la paraula sencera de cada drecera per obrir-la i agafar velocitat. Acaba les 3 voltes entre els 3 primers.",
    thumb,
    create(api) {
      const L = api.level, th = THEMES[L - 1], tr = buildTrack((L - 1) % 3, L > 3);
      const pool = api.pool({ theme: "animals", filter: L >= 5 ? (w => w.length <= (L === 5 ? 6 : 11)) : null });
      const R = mulberry32(400 + L * 17);
      // objectes de l'escenari, fora de la pista
      const free = (X, Z, rad) => { for (let i = 0; i < tr.S.length; i += 3) { const p = tr.S[i]; if (Math.hypot(p[0] - X, p[1] - Z) < HW + 30 + rad) return false; } return true; };
      const placed = [], tall = [], flats = [];
      const placeAt = (rad, zMin, zMax) => { for (let k = 0; k < 400; k++) { const X = (R() - 0.5) * 1500, Z = lerp(zMin, zMax, R()); if (Math.abs(X) * sOf(Z) > 760) continue; if (Z > 300 && X < -500) continue; if (!free(X, Z, rad)) continue; if (placed.some(p => Math.hypot(p[0] - X, p[1] - Z) < p[2] + rad + 20)) continue; placed.push([X, Z, rad]); return [X, Z]; } return null; };
      th.tall.forEach((kind, i) => { const p = placeAt(70, -520, i === 0 ? 120 : -100); if (p) tall.push({ kind, X: p[0], Z: p[1], spr: TALL[kind]() }); });
      th.flat.concat(th.flat).forEach((kind, i) => { const p = placeAt(55, -500, 480); if (p) flats.push({ kind, X: p[0], Z: p[1], r: R() * 6.28, seed: 50 + i }); });
      const bg = buildBg(th, tr, tall, flats, 90 + L);
      // velocitats
      const n = NG[L], base = tr.L / n / GAP[L];
      const cars = [0, 1, 2, 3].map(i => {
        const mine = i === 3, row = i < 2 ? 0 : 1;
        return { i, mine, col: CAR_COL[i], spr: carSprites(CAR_COL[i], i, mine), lane: LANES[i], d: row === 0 ? -34 : -118, v: 0, boost: 0, skid: 0, yaw: 0, X: 0, Z: 0, h: 0, ratio: mine ? 1 : RIVAL[i], done: false, place: 0, moving: false, ph: R() * 6 };
      });
      // la graella: jugador al darrere, a dins
      cars[3].lane = LANES[1]; cars[1].lane = LANES[3]; cars[2].lane = LANES[0]; cars[0].lane = LANES[2]; cars[2].d = -118;
      cars[0].d = -34; cars[1].d = -34;
      const me = cars[3];
      const GATE_COLS = ["#E0553A", "#1E9AA0", "#F2B630", "#8E6CC8", "#5FB35A", "#3D7CC8"];
      const gates = [];
      for (let i = 0; i < n; i++) gates.push({ d: tr.L * (0.1 + i / n), text: "", typed: 0, done: false, crash: false, fold: 0, rise: 0, col: GATE_COLS[i % GATE_COLS.length], pop: 0, gone: false });
      const used = [];
      gates.forEach(g => { g.text = pool.next(used.slice(-3)); used.push(g.text); });
      const marks = [], fin = { on: false, t: 0, place: 0 }, order = [];
      let started = api.demo, lapShown = 0, t = 0, smokeT = 0, sparkT = 0, ended = false;
      const tempo = () => (api.demo ? 1.7 : 1) * api.speed;
      const total = tr.L * LAPS;
      function active() {
        let best = null;
        for (const g of gates) if (!g.done && !g.gone && g.rise >= 1 && g.d > me.d && g.d <= total + 1 && (!best || g.d < best.d)) best = g;
        return fin.on ? null : best;
      }
      function skid(car, amt) { car.skid = Math.max(car.skid, 1.1 * amt); snd.skid(); }
      function positions() { return cars.slice().sort((a, b) => (b.done ? 1e6 - b.place : b.d) - (a.done ? 1e6 - a.place : a.d)); }
      function place() { if (fin.on) return fin.place; return positions().indexOf(me) + 1; }
      return {
        start() { started = true; Sfx.play("engine"); },
        expected() { const g = active(); return g ? g.text[g.typed] : null; },
        onKey(k) {
          const g = active(); if (!g || k.length !== 1) return;
          const ch = g.text[g.typed];
          if (k === ch) {
            g.typed++; api.hit({ sfx: g.typed >= g.text.length ? "hit" : "key" });
            if (g.typed >= g.text.length) {
              g.done = true; g.pop = 1; snd.fold(); snd.boost();
              me.boost = 1.9; me.skid = 0;
              const gq = tr.at(g.d), [px, py] = P(gq.X, gq.Z);
              api.particles.emit(px, py - 60, { count: 14, color: ["#FFE08A", "#fff", g.col], speed: 260, gravity: 380, size: 9, life: 0.7, shape: "confetti" });
            }
          } else {
            api.miss(ch, k, { sfx: "thud" }); skid(me, 0.75);
          }
        },
        update(dt) {
          t += dt; const tp = tempo();
          for (const c of cars) {
            let v = 0;
            if (started) {
              if (c.mine) {
                const bf = c.boost > 0 ? 1 + 1.15 * Math.pow(c.boost / 1.9, 0.7) : 1;
                const sf = c.skid > 0 ? 1 - 0.72 * (c.skid / 1.1) : 1;
                v = base * bf * sf * (fin.on ? Math.max(0.15, 1 - fin.t * 0.5) : 1);
              } else v = base * c.ratio * (1 + 0.05 * Math.sin(t * 0.7 + c.ph)) * (c.done ? 0.5 : 1);
              v *= tp;
              // arrencada suau
              c.v = lerp(c.v, v, clamp(dt * (c.mine && c.boost > 1.7 ? 9 : 2.2), 0, 1));
            } else c.v = 0;
            c.moving = c.v > 1;
            c.d += c.v * dt;
            c.boost = Math.max(0, c.boost - dt); c.skid = Math.max(0, c.skid - dt);
            c.yaw = c.skid > 0 ? Math.sin(c.skid * 13) * 0.5 * (c.skid / 1.1) : lerp(c.yaw, 0, 0.2);
            const q = tr.off(c.d, c.lane + (c.skid > 0 ? Math.sin(c.skid * 6) * 10 : 0)); c.X = q.X; c.Z = q.Z; c.h = q.h;
            if (!c.done && c.d >= total) { c.done = true; order.push(c); c.place = order.length; if (c.mine) { fin.on = true; fin.t = 0; fin.place = c.place; } }
            // derrapada: fum i marques
            if (c.skid > 0.15) {
              smokeT -= dt; if (smokeT <= 0) { smokeT = 0.05; const [px, py] = P(c.X, c.Z); api.particles.emit(px - Math.cos(c.h) * 20, py, { count: 2, color: ["rgba(235,235,235,0.75)", "rgba(200,200,200,0.7)"], speed: 50, gravity: -60, size: 22, life: 0.8, drag: 0.94 }); }
              if (marks.length < 70) marks.push({ X: c.X, Z: c.Z, h: c.h + c.yaw, a: 1 });
            }
          }
          if (me.boost > 0.2) { sparkT -= dt; if (sparkT <= 0) { sparkT = 0.06; const [px, py, s] = P(me.X - Math.cos(me.h) * 44, me.Z - Math.sin(me.h) * 44); api.particles.emit(px, py - 8 * s, { count: 1, color: ["#FFD36A", "#FF9A3A"], speed: 90, gravity: 60, size: 7, life: 0.35, shape: "spark", glow: true }); } }
          for (let i = marks.length - 1; i >= 0; i--) { marks[i].a -= dt * 0.35; if (marks[i].a <= 0) marks.splice(i, 1); }
          // portes
          for (const g of gates) {
            g.pop = Math.max(0, g.pop - dt * 2);
            if (g.rise < 1) g.rise = Math.min(1, g.rise + dt * 1.6);
            if (g.done || g.crash) { g.fold = Math.min(1, g.fold + dt * (g.crash ? 3.2 : 2.6)); if (g.fold >= 1) g.van = Math.min(1, (g.van || 0) + dt * 1.6); } else { g.van = 0; g.fold = g.rise < 1 ? 1 - Ease.outBack(g.rise) : 0; }
            if (!g.done && !g.crash && !g.gone && g.rise >= 1 && me.d >= g.d - 36 && g.d > me.d - 60) {
              g.crash = true; g.typed = 0; skid(me, 1); Sfx.play("thud"); api.shake(5);
              const [px, py] = P(me.X, me.Z); api.particles.emit(px, py - 30, { count: 12, color: ["#C99A62", "#8E6236", "#E6C08A"], speed: 260, gravity: 700, size: 10, life: 0.8, shape: "rect" });
            }
            // la porta torna a aixecar-se per a la volta següent
            if ((g.done || g.crash) && me.d > g.d + 260) {
              g.d += tr.L; g.done = false; g.crash = false; g.typed = 0; g.fold = 1; g.rise = 0;
              if (g.d > total) g.gone = true;
              else { g.text = pool.next(used.slice(-3)); used.push(g.text); }
            }
          }
          // voltes
          const lap = clamp(Math.floor(me.d / tr.L) + 1, 1, LAPS);
          if (lap !== lapShown) { if (lapShown) { Sfx.play("bell", { note: 84 }); if (lap === LAPS) void 0; } lapShown = lap; }
          api.hud.label = `Volta ${lap} de ${LAPS}`;
          api.hud.score = `${ORD[place()]} lloc`;
          if (fin.on) {
            fin.t += dt;
            if (fin.t > 0.05 && !fin.c) { fin.c = 1; Sfx.play("crowd"); void 0; }
            if (fin.t < 2.2 && Math.random() < 0.4 && fin.place <= 3) api.particles.emit(rand(200, 1400), -10, { count: 2, color: ["#E0553A", "#F2B630", "#1E9AA0", "#8E6CC8", "#fff"], speed: 120, gravity: 260, size: 14, life: 2.2, shape: "confetti", drag: 0.97 });
            if (fin.t > 2.6 && !ended) {
              ended = true;
              const nm = ["", "la copa d'or", "la copa de plata", "la copa de bronze"][fin.place];
              api.finish(fin.place <= 3, nm ? { collectName: nm } : {});
            }
          }
        },
        draw(ctx) {
          ctx.drawImage(bg, 0, 0);
          // marques de derrapada
          ctx.save(); ctx.fillStyle = "#2A2420";
          for (const m of marks) { const [px, py, s] = P(m.X, m.Z); ctx.globalAlpha = m.a * 0.35; ctx.save(); ctx.translate(px, py); ctx.scale(s, s * TY); ctx.rotate(m.h); ctx.fillRect(-30, -22, 9, 5); ctx.fillRect(-30, 17, 9, 5); ctx.restore(); }
          ctx.restore();
          // objectes ordenats per profunditat
          const list = [];
          for (const p of tall) { const q = P(p.X, p.Z); list.push({ y: q[1], f: () => {groundShadow(ctx,q[0],q[1]+8,65*q[2],14*q[2],.28);Sprites.draw(ctx,p.spr,q[0],q[1],{s:q[2]*1.25,ay:.86});} }); }
          for (const g of gates) if (!g.gone) { const q = P(tr.at(g.d).X, tr.at(g.d).Z); list.push({ y: q[1] + (g.fold > 0.5 ? -40 : 0), f: () => { if (g.van >= 1) return; ctx.save(); ctx.globalAlpha = 1 - (g.van || 0); g.top = drawGate(ctx, tr, g); ctx.restore(); } }); }
          for (const c of cars) { const q = P(c.X, c.Z); list.push({ y: q[1], f: () => drawCar(ctx, c, t) }); }
          list.sort((a, b) => a.y - b.y).forEach(o => o.f());
          // marcador del jugador
          { const [px, py, s] = P(me.X, me.Z), y = py - 54 * s - 14 + (Settings.reduceMotion ? 0 : Math.sin(t * 3) * 2);
            ctx.save(); ctx.fillStyle = BRAND.petroli; ctx.beginPath(); ctx.moveTo(px - 9, y + 12); ctx.lineTo(px + 9, y + 12); ctx.lineTo(px, y + 24); ctx.closePath(); ctx.fill();
            rr(ctx, px - 26, y - 12, 52, 26, 13); ctx.fill(); text(ctx, "Tu", px, y + 1, { size: 18, weight: 900, font: FONT_T, color: "#fff" }); ctx.restore(); }
          // plaques de les portes (sempre a dalt, sense rotació)
          const act = active(), sz = L <= 3 ? 64 : L === 4 ? 54 : 44;
          for (const g of gates) {
            if (g.gone) continue;
            const top = g.top || gatePts(tr, g).top, isA = g === act, psz = isA && L <= 3 ? 76 : sz, py = top[1] - psz * 0.66 - 14;
            if (g.done && g.pop > 0) { drawPlate(ctx, g.text, top[0], py - (1 - g.pop) * 40, { size: sz, state: "ok", alpha: g.pop }); continue; }
            if (g.done || g.crash || g.rise < 0.6) continue;
            const a = isA ? 1 : 0.9;
            drawPlate(ctx, g.text, top[0], py, { size: psz, progress: isA ? g.typed : 0, state: isA ? "active" : null, alpha: a * clamp((g.rise - 0.6) * 3, 0, 1), border: isA ? null : g.col, borderW: 4 });
          }
          // bandera d'arribada
          if (fin.on) {
            const k = Ease.outBack(clamp(fin.t / 0.5, 0, 1)), label = fin.place === 1 ? "Primer lloc!" : fin.place === 2 ? "Segon lloc!" : fin.place === 3 ? "Tercer lloc!" : "Quart lloc";
            ctx.save(); ctx.translate(800, 470); ctx.scale(k, k);
            ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; rr(ctx, -250, -64, 500, 128, 28); ctx.fillStyle = "#FFFDF6"; ctx.fill(); ctx.shadowColor = "transparent";
            ctx.save(); rr(ctx, -250, -64, 500, 128, 28); ctx.clip(); for (let i = 0; i < 26; i++) for (let j = 0; j < 2; j++) { ctx.fillStyle = (i + j) % 2 ? "#1E2224" : "#FFFFFF"; ctx.fillRect(-250 + i * 20, -64 + j * 14, 20, 14); ctx.fillRect(-250 + i * 20, 36 + j * 14, 20, 14); } ctx.restore();
            text(ctx, label, 0, 1, { size: 44, weight: 900, font: FONT_T, color: fin.place <= 3 ? BRAND.petroli : BRAND.tinta });
            ctx.restore();
          }
          drawVignette(ctx, 0.3, "40,25,10");
        },
      };
    },
  });
})();
