"use strict";
/* 7. El monstre golafre — monstre de plastilina, aliments amb paracaigudes, stop motion a 12 fps */
(() => {
  const GROUND = 772, GOAL = 15, MAXDROP = 5;
  const MONSTER = "#438DC3";
  const CHUTES = [["#F36F5B", "#FFE6A8"], ["#F7B84B", "#FFF3D6"], ["#7BC8A4", "#F4FFF8"], ["#B48BE0", "#F6EEFF"], ["#5BB8F3", "#FFFFFF"], ["#F28DB2", "#FFF0F6"]];
  const q12 = t => Math.floor(t * 12) / 12; // temps dels personatges: 12 fotogrames per segon

  /* textura de plastilina pròpia (Tex.clay pot fallar amb radis negatius en algunes llavors) */
  const clayTex = () => Tex.get("g07clay", () => {
    const n = makeNoise(11), R = mulberry32(11), c = Tex.pixels(256, 256, (i, j) => { const v = 222 + (n.fbm(i / 50, j / 50, 3) - 0.5) * 22 + (R() - 0.5) * 4; return [v, v, v]; });
    const x = c.getContext("2d");
    for (let k = 0; k < 9; k++) { const px = R() * 256, py = R() * 256, rad = 14 + R() * 16, a0 = R() * 6.28; for (let q = 0; q < 5; q++) { x.strokeStyle = q % 2 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"; x.lineWidth = 1.2; x.beginPath(); x.arc(px, py, Math.max(1, rad - q * 3), a0, a0 + 1.4 + R()); x.stroke(); } }
    return c;
  });
  /* ---------- pintura de plastilina (només dins de sprites en memòria cau) ---------- */
  function clay(x, path, col, o = {}) {
    const cx = o.cx || 0, cy = o.cy || 0, r = o.r || 50;
    x.save(); path(x); x.fillStyle = col; x.fill(); x.clip();
    const g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.05, cx, cy, r * 1.25);
    g.addColorStop(0, "rgba(255,255,255,0.42)"); g.addColorStop(0.35, "rgba(255,255,255,0.06)"); g.addColorStop(0.75, "rgba(0,0,0,0.04)"); g.addColorStop(1, "rgba(0,0,0,0.28)");
    x.fillStyle = g; x.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    x.globalCompositeOperation = "multiply"; x.globalAlpha = o.tex != null ? o.tex : 0.55;
    x.fillStyle = x.createPattern(clayTex(), "repeat"); x.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    x.restore();
    x.save(); path(x); x.lineWidth = o.lw || 2; x.strokeStyle = rgba("#000000", 0.16); x.stroke(); x.restore();
  }
  const circ = (cx, cy, r) => x => { x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); };
  const ell = (cx, cy, rx, ry, a = 0) => x => { x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, 6.2832); };
  function face(x, cx, cy, s, o = {}) {
    const ex = 11 * s, ey = cy - 2 * s;
    for (const d of [-1, 1]) {
      x.fillStyle = "#1E1A1C"; x.beginPath(); x.ellipse(cx + d * ex, ey, 4.6 * s, 5.6 * s, 0, 0, 6.2832); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(cx + d * ex - 1.4 * s, ey - 2 * s, 1.7 * s, 0, 6.2832); x.fill();
      x.fillStyle = "rgba(255,110,120,0.45)"; x.beginPath(); x.ellipse(cx + d * (ex + 8 * s), ey + 8 * s, 5 * s, 3 * s, 0, 0, 6.2832); x.fill();
    }
    x.strokeStyle = "#1E1A1C"; x.lineWidth = 2.6 * s; x.lineCap = "round"; x.beginPath();
    if (o.grumpy) x.arc(cx, cy + 14 * s, 6 * s, 3.6, 5.8); else x.arc(cx, cy + 4 * s, 7 * s, 0.35, 2.8);
    x.stroke();
    if (o.grumpy) { x.beginPath(); x.moveTo(cx - ex - 6 * s, ey - 10 * s); x.lineTo(cx - ex + 5 * s, ey - 6 * s); x.moveTo(cx + ex + 6 * s, ey - 10 * s); x.lineTo(cx + ex - 5 * s, ey - 6 * s); x.stroke(); }
  }
  function leaf(x, cx, cy, a, col = "#5DAE4B") { x.save(); x.translate(cx, cy); x.rotate(a); clay(x, ell(0, -10, 7, 14), col, { r: 14, cy: -10 }); x.restore(); }

  /* ---------- aliments ---------- */
  const ROUND = (col, o = {}) => (x, s) => {
    clay(x, ell(0, 4, 38 * (o.wx || 1), 36 * (o.wy || 1)), col, { r: 40, cy: 4 });
    if (o.stem) { x.strokeStyle = "#6B4A2A"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(0, -28); x.quadraticCurveTo(3, -40, 8, -44); x.stroke(); }
    if (o.leaf) leaf(x, 12, -34, 0.9, o.leaf);
    if (o.dots) { x.fillStyle = o.dots; for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 10 + (i % 4) * 6; x.beginPath(); x.ellipse(Math.cos(a) * r, 4 + Math.sin(a) * r * 0.9, 1.8, 2.6, a, 0, 6.28); x.fill(); } }
    face(x, 0, 8, 1);
  };
  const FOODS = {
    poma: ROUND("#E5443A", { stem: 1, leaf: "#5DAE4B" }),
    taronja: ROUND("#F59A2F", { leaf: "#4E9A3F", dots: "rgba(160,80,10,0.25)" }),
    "préssec": ROUND("#F7A68A", { leaf: "#5DAE4B" }),
    llimona: ROUND("#F3D43B", { wx: 1.12, wy: 0.86, leaf: "#5DAE4B" }),
    figa: ROUND("#7B4A8E", { stem: 1, wy: 1.02 }),
    coco: ROUND("#8A5A36", { dots: "rgba(60,30,10,0.35)" }),
    kiwi: ROUND("#8B6B3E", { wx: 1.1, wy: 0.9, dots: "rgba(70,45,15,0.3)" }),
    pruna: ROUND("#6B4FB0", { stem: 1, leaf: "#5DAE4B" }),
    ou: (x) => { clay(x, ell(0, 2, 30, 40), "#FBF4E4", { r: 40 }); face(x, 0, 8, 1); },
    pera: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(0, -36); p.bezierCurveTo(18, -36, 16, -10, 30, 10); p.bezierCurveTo(44, 34, 24, 44, 0, 44); p.bezierCurveTo(-24, 44, -44, 34, -30, 10); p.bezierCurveTo(-16, -10, -18, -36, 0, -36); p.closePath(); }, "#A6CC45", { r: 44, cy: 10 });
      x.strokeStyle = "#6B4A2A"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(0, -34); x.lineTo(4, -46); x.stroke(); leaf(x, 12, -40, 1, "#4E9A3F"); face(x, 0, 16, 1);
    },
    pa: (x) => {
      clay(x, p => { p.beginPath(); p.ellipse(0, 6, 46, 30, 0, 0, 6.28); }, "#D9984E", { r: 46, cy: 6 });
      x.strokeStyle = "rgba(255,235,190,0.8)"; x.lineWidth = 4; x.lineCap = "round"; for (const d of [-22, 0, 22]) { x.beginPath(); x.moveTo(d - 8, -14); x.lineTo(d + 8, -4); x.stroke(); }
      face(x, 0, 14, 0.9);
    },
    mel: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-30, -18); p.quadraticCurveTo(-40, 40, 0, 42); p.quadraticCurveTo(40, 40, 30, -18); p.closePath(); }, "#F2B33A", { r: 40, cy: 10 });
      clay(x, p => rr(p, -34, -32, 68, 16, 6), "#C9442F", { r: 30, cy: -24 });
      x.fillStyle = "#C9442F"; x.beginPath(); x.moveTo(-34, -24); x.lineTo(-40, -14); x.lineTo(-28, -16); x.fill();
      face(x, 0, 14, 1);
    },
    llet: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-12, -42); p.lineTo(12, -42); p.lineTo(14, -24); p.quadraticCurveTo(30, -14, 28, 6); p.lineTo(28, 40); p.lineTo(-28, 40); p.lineTo(-28, 6); p.quadraticCurveTo(-30, -14, -14, -24); p.closePath(); }, "#F7F7F2", { r: 44, cy: 4 });
      clay(x, p => rr(p, -14, -48, 28, 10, 4), "#3A8DDE", { r: 16, cy: -44 });
      x.fillStyle = "#7FB7EA"; rr(x, -28, -2, 56, 16, 2); x.fill();
      face(x, 0, 24, 0.9);
    },
    pizza: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-40, -30); p.quadraticCurveTo(0, -46, 40, -30); p.lineTo(0, 44); p.closePath(); }, "#F7C455", { r: 44, cy: -6 });
      clay(x, p => { p.beginPath(); p.moveTo(-42, -32); p.quadraticCurveTo(0, -50, 42, -32); p.lineTo(38, -24); p.quadraticCurveTo(0, -40, -38, -24); p.closePath(); }, "#C77F35", { r: 40, cy: -32 });
      x.fillStyle = "#D8432F"; for (const [a, b] of [[-16, -18], [14, -16], [0, 12]]) { x.beginPath(); x.arc(a, b, 6.5, 0, 6.28); x.fill(); }
      face(x, 0, -4, 0.8);
    },
    suc: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-26, -34); p.lineTo(26, -34); p.lineTo(20, 40); p.lineTo(-20, 40); p.closePath(); }, "#F8A43A", { r: 40, cy: 4 });
      x.fillStyle = "rgba(255,255,255,0.45)"; x.fillRect(-26, -34, 52, 8);
      x.strokeStyle = "#E85A8C"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(8, -30); x.lineTo(16, -54); x.lineTo(26, -56); x.stroke();
      face(x, 0, 8, 0.9);
    },
    maduixa: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(0, 44); p.bezierCurveTo(-44, 14, -40, -30, 0, -26); p.bezierCurveTo(40, -30, 44, 14, 0, 44); p.closePath(); }, "#E8344A", { r: 42, cy: 6 });
      x.fillStyle = "#FFE48A"; for (let i = 0; i < 12; i++) { const a = i * 2.39, r = 8 + (i % 3) * 9; x.beginPath(); x.ellipse(Math.cos(a) * r * 0.9, 6 + Math.sin(a) * r, 1.8, 2.8, 0, 0, 6.28); x.fill(); }
      for (let i = 0; i < 5; i++) leaf(x, -14 + i * 7, -26, -0.9 + i * 0.45, "#4E9A3F");
      face(x, 0, 6, 0.95);
    },
    xocolata: (x) => {
      clay(x, p => rr(p, -30, -40, 60, 82, 8), "#6B3B22", { r: 46 });
      x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 3; for (const yy of [-12, 16]) { x.beginPath(); x.moveTo(-28, yy); x.lineTo(28, yy); x.stroke(); } x.beginPath(); x.moveTo(0, -38); x.lineTo(0, 40); x.stroke();
      clay(x, p => rr(p, -32, 10, 64, 34, 4), "#E6E1E8", { r: 34, cy: 26 });
      face(x, 0, -18, 0.85);
    },
    "síndria": (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-46, -20); p.quadraticCurveTo(0, 70, 46, -20); p.closePath(); }, "#3E9A49", { r: 44, cy: 10 });
      clay(x, p => { p.beginPath(); p.moveTo(-40, -20); p.quadraticCurveTo(0, 58, 40, -20); p.closePath(); }, "#F25560", { r: 40, cy: 4 });
      x.fillStyle = "#2B1E1E"; for (const [a, b] of [[-20, -8], [18, -6], [-6, 14], [8, 4]]) { x.beginPath(); x.ellipse(a, b, 2.2, 3.4, 0.3, 0, 6.28); x.fill(); }
      face(x, 0, -6, 0.85);
    },
    "plàtan": (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-44, -18); p.quadraticCurveTo(-10, 44, 44, 0); p.quadraticCurveTo(44, -8, 38, -10); p.quadraticCurveTo(-6, 24, -36, -26); p.closePath(); }, "#F6D24A", { r: 44, cy: 6 });
      x.fillStyle = "#5A4020"; x.beginPath(); x.arc(-40, -22, 5, 0, 6.28); x.fill();
      face(x, 4, 12, 0.8);
    },
    galeta: (x) => {
      clay(x, circ(0, 2, 40), "#D69A55", { r: 42, cy: 2 });
      x.fillStyle = "#5B321C"; for (const [a, b] of [[-20, -16], [16, -20], [22, 14], [-24, 16], [2, 24]]) { x.beginPath(); x.ellipse(a, b, 5, 4, a, 0, 6.28); x.fill(); }
      face(x, 0, 2, 0.95);
    },
    magdalena: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-32, 0); p.lineTo(32, 0); p.lineTo(24, 42); p.lineTo(-24, 42); p.closePath(); }, "#E9668E", { r: 40, cy: 20 });
      x.strokeStyle = "rgba(0,0,0,0.16)"; x.lineWidth = 2; for (let i = -3; i <= 3; i++) { x.beginPath(); x.moveTo(i * 9, 0); x.lineTo(i * 7, 42); x.stroke(); }
      clay(x, ell(0, -6, 38, 26), "#E3A75A", { r: 38, cy: -6 });
      face(x, 0, -6, 0.9);
    },
    "entrepà": (x) => {
      clay(x, ell(0, 14, 46, 18), "#DDA35C", { r: 46, cy: 14 });
      x.fillStyle = "#6DBE4E"; x.beginPath(); for (let i = -4; i <= 4; i++) x.lineTo(i * 11, 2 + (i % 2) * 6); x.lineTo(44, 10); x.lineTo(-44, 10); x.fill();
      x.fillStyle = "#E86A6A"; x.fillRect(-40, 0, 80, 6);
      clay(x, p => { p.beginPath(); p.ellipse(0, -8, 46, 22, 0, Math.PI, 0); p.closePath(); }, "#E3AE66", { r: 46, cy: -12 });
      face(x, 0, -14, 0.85);
    },
    formatge: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-44, 30); p.lineTo(-44, -6); p.lineTo(40, -30); p.lineTo(44, 30); p.closePath(); }, "#F7CC45", { r: 46, cy: 4 });
      x.fillStyle = "rgba(170,120,10,0.35)"; for (const [a, b, r] of [[-20, 6, 7], [10, 14, 5], [26, -6, 4], [-30, 22, 4]]) { x.beginPath(); x.arc(a, b, r, 0, 6.28); x.fill(); }
      face(x, -4, 6, 0.85);
    },
    cirera: (x) => {
      x.strokeStyle = "#4E7A2F"; x.lineWidth = 4; x.lineCap = "round"; x.beginPath(); x.moveTo(-16, 10); x.quadraticCurveTo(-6, -30, 4, -40); x.moveTo(18, 14); x.quadraticCurveTo(10, -24, 4, -40); x.stroke();
      leaf(x, 10, -40, 1.1, "#5DAE4B");
      clay(x, circ(-18, 20, 20), "#C9243A", { r: 22, cx: -18, cy: 20 }); clay(x, circ(18, 24, 20), "#D82E44", { r: 22, cx: 18, cy: 24 });
      face(x, 18, 26, 0.6); face(x, -18, 22, 0.6);
    },
    pastanaga: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-22, -26); p.quadraticCurveTo(0, -36, 22, -26); p.quadraticCurveTo(10, 20, 0, 48); p.quadraticCurveTo(-10, 20, -22, -26); p.closePath(); }, "#F2862F", { r: 40, cy: 0 });
      for (let i = 0; i < 3; i++) leaf(x, -8 + i * 8, -30, -0.5 + i * 0.5, "#4E9A3F");
      x.strokeStyle = "rgba(120,50,0,0.3)"; x.lineWidth = 2; for (const yy of [0, 16]) { x.beginPath(); x.moveTo(-10, yy); x.lineTo(-2, yy + 2); x.stroke(); }
      face(x, 0, -6, 0.8);
    },
    // aliments dolents
    "mitjó": (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-16, -42); p.lineTo(14, -42); p.lineTo(14, 8); p.quadraticCurveTo(44, 10, 40, 32); p.quadraticCurveTo(36, 46, 0, 42); p.lineTo(-16, 40); p.closePath(); }, "#9AA4B4", { r: 44 });
      x.fillStyle = "#E25B4A"; x.fillRect(-16, -42, 30, 10); x.fillRect(-16, -26, 30, 6);
      x.fillStyle = "#7C8696"; x.beginPath(); x.arc(30, 30, 7, 0, 6.28); x.fill();
      face(x, 0, -6, 0.75, { grumpy: 1 });
    },
    sabata: (x) => {
      clay(x, p => { p.beginPath(); p.moveTo(-40, -20); p.lineTo(-10, -20); p.quadraticCurveTo(-4, 0, 20, 4); p.quadraticCurveTo(46, 8, 46, 26); p.lineTo(-44, 26); p.closePath(); }, "#7A4A2C", { r: 46, cy: 6 });
      x.fillStyle = "#3C2416"; rr(x, -46, 24, 94, 10, 4); x.fill();
      x.strokeStyle = "#F4E7D0"; x.lineWidth = 2.5; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-6 + i * 7, -4 + i * 2); x.lineTo(2 + i * 7, -10 + i * 2); x.stroke(); }
      face(x, -22, 4, 0.75, { grumpy: 1 });
    },
    pedra: (x) => { clay(x, p => blobPath(p, 0, 6, 40, 33, 0.16, 8), "#8E8C88", { r: 42, cy: 6 }); face(x, 0, 8, 0.9, { grumpy: 1 }); },
  };
  const GOODLIST = Object.keys(FOODS).filter(k => !["mitjó", "sabata", "pedra"].includes(k));
  const W5 = ["poma", "pera", "pa", "ou", "mel", "llet", "pizza", "suc", "figa", "kiwi", "coco", "pruna"];
  const W6 = ["maduixa", "xocolata", "taronja", "síndria", "préssec", "plàtan", "galeta", "magdalena", "entrepà", "formatge", "cirera", "pastanaga", "llimona"];
  const BAD5 = ["sabata", "pedra"], BAD6 = ["sabata", "pedra", "mitjó"];
  const foodSprite = k => Sprites.get("g07f_" + k, 120, 120, (x, w, h) => { x.translate(w / 2, h / 2 + 4); FOODS[k](x); });
  const FOODCOL = { poma: "#E5443A", taronja: "#F59A2F", "préssec": "#F7A68A", llimona: "#F3D43B", figa: "#7B4A8E", coco: "#F4EEE2", kiwi: "#8CC63F", pruna: "#6B4FB0", ou: "#F7C531", pera: "#A6CC45", pa: "#D9984E", mel: "#F2B33A", llet: "#FFFFFF", pizza: "#E85A3A", suc: "#F8A43A", maduixa: "#E8344A", xocolata: "#6B3B22", "síndria": "#F25560", "plàtan": "#F6D24A", galeta: "#D69A55", magdalena: "#E9668E", "entrepà": "#E3AE66", formatge: "#F7CC45", cirera: "#C9243A", pastanaga: "#F2862F" };

  const chuteSprite = i => Sprites.get("g07c" + i, 170, 100, (x) => {
    const [a, b] = CHUTES[i];
    const dome = p => { p.beginPath(); p.moveTo(8, 78); p.bezierCurveTo(8, 6, 162, 6, 162, 78); for (let k = 5; k >= 0; k--) { const x0 = 8 + k * 25.67; p.quadraticCurveTo(x0 + 12.8, 92, x0, 78); } p.closePath(); };
    clay(x, dome, a, { r: 80, cx: 85, cy: 50 });
    x.save(); dome(x); x.clip(); x.fillStyle = b;
    for (let k = 0; k < 6; k += 2) { x.beginPath(); x.moveTo(85, 6); x.lineTo(8 + k * 25.67, 92); x.lineTo(8 + (k + 1) * 25.67, 92); x.closePath(); x.globalAlpha = 0.85; x.fill(); }
    x.restore();
    x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(60, 28, 26, 9, -0.4, 0, 6.28); x.fill();
  });

  /* ---------- fons: turons de plastilina (prerenderitzat) ---------- */
  function hill(x, pts, base, col, rim) {
    const path = p => { p.beginPath(); p.moveTo(-20, H + 20); p.lineTo(-20, pts[0][1]); for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; p.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2); } p.lineTo(W + 20, pts[pts.length - 1][1]); p.lineTo(W + 20, H + 20); p.closePath(); };
    x.save(); x.shadowColor = "rgba(30,60,20,0.35)"; x.shadowBlur = 24; x.shadowOffsetY = -2; path(x); x.fillStyle = col; x.fill(); x.restore();
    x.save(); path(x); x.clip();
    const g = x.createLinearGradient(0, base - 160, 0, base + 260); g.addColorStop(0, shade(col, 0.22)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, -0.25)); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.5; x.fillStyle = x.createPattern(clayTex(), "repeat"); x.fillRect(0, 0, W, H);
    x.restore();
    x.save(); x.translate(0, 5); path(x); x.restore(); x.save(); path(x); x.clip(); x.translate(0, 6); path(x); x.lineWidth = 10; x.strokeStyle = rgba(rim, 0.55); x.stroke(); x.restore();
  }
  function tree(x, tx, ty, s, col) {
    x.save(); x.translate(tx, ty); x.scale(s, s);
    clay(x, p => rr(p, -7, -40, 14, 44, 6), "#8A5A36", { r: 20, cy: -20 });
    clay(x, p => blobPath(p, 0, -70, 40, (tx | 0) + 3, 0.12, 9), col, { r: 44, cy: -70 });
    x.restore();
  }
  const bgSprite = () => Sprites.get("g07bg", W, H, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, "#8FD0EA"); g.addColorStop(0.7, "#D7F0EE"); g.addColorStop(1, "#F3F2DA"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // sol de plastilina
    x.save(); x.globalAlpha = 0.35; const sg = x.createRadialGradient(1350, 190, 40, 1350, 190, 220); sg.addColorStop(0, "#FFF6C8"); sg.addColorStop(1, "rgba(255,246,200,0)"); x.fillStyle = sg; x.fillRect(1100, 0, 500, 450); x.restore();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.save(); x.translate(1350 + Math.cos(a) * 92, 190 + Math.sin(a) * 92); x.rotate(a); clay(x, ell(0, 0, 16, 7), "#FFC94A", { r: 16 }); x.restore(); }
    clay(x, circ(1350, 190, 66), "#FFD650", { r: 66, cx: 1350, cy: 190 });
    face(x, 1350, 196, 2.2);
    hill(x, [[0, 470], [260, 400], [520, 470], [800, 420], [1080, 380], [1340, 450], [1600, 410]], 420, "#A9D18E", "#E9F7D8");
    for (const [tx, ty, s] of [[200, 452, 0.8], [990, 418, 0.75], [1440, 446, 0.7]]) tree(x, tx, ty, s, "#7DBB5E");
    hill(x, [[0, 600], [300, 540], [600, 590], [900, 530], [1240, 580], [1600, 520]], 560, "#86C06A", "#DDF3C6");
    for (const [tx, ty, s] of [[420, 580, 1.0], [1140, 572, 0.95], [1500, 540, 1.05]]) tree(x, tx, ty, s, "#5FA84A");
    hill(x, [[0, 730], [400, 700], [800, 735], [1200, 700], [1600, 725]], 720, "#6BB257", "#D2EFB8");
    // flors de plastilina al primer terme
    const R = mulberry32(77);
    for (let i = 0; i < 46; i++) {
      const fx = R() * W, fy = 760 + R() * 130, c = ["#FF8FB1", "#FFE15A", "#FFFFFF", "#B9A4F2", "#FF9F5A"][i % 5];
      x.strokeStyle = "#4E9A3F"; x.lineWidth = 3; x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx, fy - 12); x.stroke();
      for (let k = 0; k < 5; k++) { const a = k * 1.2566; x.fillStyle = c; x.beginPath(); x.arc(fx + Math.cos(a) * 6, fy - 14 + Math.sin(a) * 6, 4.6, 0, 6.28); x.fill(); }
      x.fillStyle = "#F7B733"; x.beginPath(); x.arc(fx, fy - 14, 3.4, 0, 6.28); x.fill();
    }
    for (let i = 0; i < 70; i++) { const fx = R() * W, fy = 745 + R() * 150; x.strokeStyle = rgba("#3E8A35", 0.5); x.lineWidth = 3; x.lineCap = "round"; x.beginPath(); x.moveTo(fx, fy); x.quadraticCurveTo(fx + 3, fy - 8, fx + 6, fy - 14); x.stroke(); }
  });
  const cloudSprite = i => Sprites.get("g07cl" + i, 260, 120, (x) => {
    for (const [cx, cy, r] of [[70, 74, 40], [120, 56, 52], [178, 70, 42], [130, 86, 40], [214, 86, 28]]) clay(x, circ(cx + (i ? -10 : 0), cy, r * (i ? 0.85 : 1)), "#FFFFFF", { r, cx, cy, tex: 0.35 });
  });

  /* ---------- el monstre ---------- */
  const limbSprite = foot => Sprites.get("g07limb" + foot, 96, 72, x => {
    clay(x, ell(48, 36, foot ? 36 : 35, foot ? 20 : 23, foot ? 0 : 0.2), MONSTER,
      { r: 40, cx: 44, cy: 34, tex: 0.38, lw: 1 });
    const skin = Art.get("g07_body");
    if (skin) { x.save(); ell(48, 36, foot ? 36 : 35, foot ? 20 : 23, foot ? 0 : 0.2)(x); x.clip();
      x.globalAlpha = 0.6; x.drawImage(skin, skin.width * 0.28, skin.height * 0.4, skin.width * 0.25, skin.height * 0.2, 10, 12, 76, 48); x.restore(); }
    x.strokeStyle = "rgba(20,65,100,0.3)"; x.lineWidth = 1.6; x.lineCap = "round";
    for (const d of [-1, 1]) { x.beginPath(); x.moveTo(foot ? 58 + d * 8 : 68, foot ? 43 : 34 + d * 7); x.lineTo(foot ? 68 + d * 8 : 77, foot ? 46 : 36 + d * 7); x.stroke(); }
  });
  const bodySprite = () => Sprites.get("g07body", 300, 300, (x) => {
    for (const d of [-1, 1]) { x.save(); x.translate(150 + d * 52, 66); x.rotate(d * 0.35); clay(x, p => { p.beginPath(); p.moveTo(-16, 12); p.quadraticCurveTo(-6, -30, 0, -36); p.quadraticCurveTo(6, -30, 16, 12); p.closePath(); }, "#F7C944", { r: 30, cy: -8 }); x.restore(); }
    clay(x, p => blobPath(p, 150, 162, 112, 5, 0.05, 11), MONSTER, { r: 112, cx: 150, cy: 162, lw: 3 });
    x.save(); blobPath(x, 150, 162, 112, 5, 0.05, 11); x.clip();
    clay(x, ell(150, 222, 70, 54), "#7FB2F0", { r: 70, cx: 150, cy: 222, tex: 0.4 });
    x.fillStyle = rgba("#1F4FA3", 0.35); for (const [a, b, r] of [[78, 110, 9], [222, 130, 11], [96, 210, 7], [212, 196, 8], [240, 170, 5]]) { x.beginPath(); x.arc(a, b, r, 0, 6.28); x.fill(); }
    x.restore();
  });
  function drawMonster(ctx, mx, gy, o = {}) {
    const t = Settings.reduceMotion ? 0 : o.t || 0, s = o.s || 1, sq = Settings.reduceMotion ? 0 : o.sq || 0, look = o.look || [0, 0], open = o.open || 0;
    const step = o.walk ? Math.sin(t * 14) : 0;
    // ombra de contacte
    ctx.save(); ctx.translate(mx, gy + 4); ctx.scale(s, s * 0.18);
    const sh = ctx.createRadialGradient(0, 0, 8, 0, 0, 124); sh.addColorStop(0, "rgba(24,46,28,0.4)"); sh.addColorStop(1, "rgba(24,46,28,0)"); ctx.fillStyle = sh; ctx.fillRect(-124, -124, 248, 248); ctx.restore();
    ctx.save(); ctx.translate(mx, gy); ctx.scale(s, s);
    const hop = Settings.reduceMotion ? 0 : o.hop || 0;
    ctx.translate(0, -hop);
    // peus
    for (const d of [-1, 1]) { const lift = o.walk ? Math.max(0, step * d) * 16 : 0; ctx.save(); ctx.translate(d * 48, -15 - lift); ctx.scale(d, 1); ctx.drawImage(limbSprite(true).c, -48, -36, 96, 72); ctx.restore(); }
    const sy = 1 - sq * 0.12, sx = 1 + sq * 0.1;
    ctx.translate(0, -2); ctx.scale(sx, sy); ctx.translate(0, -138);
    if (o.rot) ctx.rotate(o.rot);
    // braços
    for (const d of [-1, 1]) {
      const wave = o.arms ? Math.sin(t * 9 + d) * 0.6 : (o.walk ? step * 0.25 * d : 0.15);
      ctx.save(); ctx.translate(d * 92, 34); ctx.rotate(d * (0.5 + wave)); ctx.scale(d, 1); ctx.drawImage(limbSprite(false).c, -26, -36, 96, 72); ctx.restore();
    }
    const body = Art.get("g07_body") || bodySprite().c; ctx.drawImage(body, -150, -162, 300, 300);
    if (o.tint) { ctx.save(); ctx.globalAlpha = o.tint; ctx.fillStyle = "#79C267"; blobPath(ctx, 0, 0, 112, 5, 0.05, 11); ctx.globalCompositeOperation = "source-atop"; ctx.fill(); ctx.restore(); }
    // ulls
    const blink = o.blink || 0;
    for (const d of [-1, 1]) {
      const ex = d * 40, ey = -40;
      const white = ctx.createRadialGradient(ex - 9, ey - 11, 2, ex + 3, ey + 7, 35);
      white.addColorStop(0, "#FFFFFF"); white.addColorStop(0.58, "#FFFDF3"); white.addColorStop(1, "#B4C6CD");
      ctx.save(); ctx.shadowColor = "rgba(16,50,77,0.42)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3;
      ctx.fillStyle = white; ctx.beginPath(); ctx.ellipse(ex, ey, 27, 30, 0, 0, 6.28); ctx.fill(); ctx.restore();
      ctx.fillStyle = "rgba(0,30,80,0.12)"; ctx.beginPath(); ctx.ellipse(ex + 3, ey + 6, 24, 24, 0, 0, Math.PI); ctx.fill();
      if (o.yuck) { ctx.strokeStyle = "#1A1820"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(ex - 12, ey - 8); ctx.lineTo(ex + 12 * d * 0 + 10, ey); ctx.lineTo(ex - 12, ey + 8); ctx.stroke(); }
      else {
        const px = ex + clamp(look[0], -1, 1) * 10, py = ey + clamp(look[1], -1, 1) * 11;
        const iris = ctx.createRadialGradient(px, py, 5, px, py, 15); iris.addColorStop(0, "#172B36"); iris.addColorStop(0.65, "#3F7181"); iris.addColorStop(1, "#152E40");
        ctx.fillStyle = iris; ctx.beginPath(); ctx.arc(px, py, 15, 0, 6.28); ctx.fill();
        ctx.fillStyle = "#121E27"; ctx.beginPath(); ctx.arc(px, py, 9, 0, 6.28); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px - 4, py - 5, 4.5, 0, 6.28); ctx.fill();
      }
      if (blink > 0) { ctx.save(); ctx.beginPath(); ctx.ellipse(ex, ey, 28, 31, 0, 0, 6.28); ctx.clip(); ctx.fillStyle = "#3572C8"; ctx.fillRect(ex - 30, ey - 32, 60, 64 * blink); ctx.restore(); }
      // cella
      ctx.strokeStyle = "#245A80"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath();
      const br = o.worry ? d * 0.35 : o.yuck ? -d * 0.3 : 0; ctx.save(); ctx.translate(ex, ey - 42); ctx.rotate(br); ctx.moveTo(-16, 0); ctx.quadraticCurveTo(0, -8, 16, 0); ctx.stroke(); ctx.restore();
    }
    // boca
    const my = 40;
    if (open > 0.05) {
      const mw = 58 * (0.5 + open * 0.5), mh = 48 * open;
      ctx.fillStyle = "#4A0F1E"; ctx.beginPath(); ctx.ellipse(0, my, mw, mh, 0, 0, 6.28); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(0, my, mw, mh, 0, 0, 6.28); ctx.clip();
      ctx.fillStyle = "#E86A86"; ctx.beginPath(); ctx.ellipse(0, my + mh * 0.75, mw * 0.7, mh * 0.5, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = "#FFFDF4"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 10, my - mh); ctx.lineTo(d * 26, my - mh); ctx.lineTo(d * 18, my - mh + 14); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    } else if (o.yuck) {
      ctx.strokeStyle = "#1A1820"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-34, my); for (let i = 1; i <= 6; i++) ctx.lineTo(-34 + i * 11.3, my + (i % 2 ? -7 : 5)); ctx.stroke();
      ctx.fillStyle = "#8BD36B"; ctx.beginPath(); ctx.ellipse(10, my + 14, 12, 16, 0.2, 0, 6.28); ctx.fill();
    } else if (o.chew) {
      const c = Math.sin(t * 22) * 0.5 + 0.5; ctx.fillStyle = "#4A0F1E"; ctx.beginPath(); ctx.ellipse(0, my, 30, 6 + c * 8, 0, 0, 6.28); ctx.fill();
      ctx.fillStyle = "#7FB2F0"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 70, my - 4, 14 + c * 3, 0, 6.28); ctx.fill(); }
    } else if (o.worry) {
      ctx.strokeStyle = "#1A1820"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.ellipse(0, my + 6, 12, 14, 0, 0, 6.28); ctx.stroke();
    } else {
      ctx.strokeStyle = "#1A1820"; ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, my - 22, 40, 0.5, 2.64); ctx.stroke();
      ctx.fillStyle = "#FFFDF4"; ctx.beginPath(); ctx.moveTo(-12, my + 14); ctx.lineTo(-2, my + 16); ctx.lineTo(-7, my + 26); ctx.closePath(); ctx.fill();
    }
    // galtes
    ctx.fillStyle = "rgba(255,120,150,0.35)"; for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * 74, 18, 16, 9, 0, 0, 6.28); ctx.fill(); }
    if (o.hat) drawPartyHat(ctx, 0, -104);
    ctx.restore();
  }
  function drawPartyHat(ctx, x, y) {
    const S = Sprites.get("g07hat", 90, 110, (c) => {
      clay(c, p => { p.beginPath(); p.moveTo(45, 6); p.lineTo(78, 96); p.quadraticCurveTo(45, 108, 12, 96); p.closePath(); }, "#F36F5B", { r: 50, cx: 45, cy: 60 });
      c.save(); c.beginPath(); c.moveTo(45, 6); c.lineTo(78, 96); c.quadraticCurveTo(45, 108, 12, 96); c.closePath(); c.clip();
      c.fillStyle = "#FFE15A"; for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(30 + (i % 2) * 28, 34 + i * 18, 6, 0, 6.28); c.fill(); }
      c.restore(); clay(c, circ(45, 8, 9), "#FFE15A", { r: 9, cx: 45, cy: 8 });
    });
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15); ctx.drawImage(S.c, -45, -100, 90, 110); ctx.restore();
  }

  function chuteAssembly(ctx, f, x, y, t, o = {}) {
    // paracaigudes → cordes → placa → cordill → aliment. La placa sempre recta.
    const sw = Math.sin(q12(t) * 1.6 + f.ph) * 0.07;
    const cy = y - 232, ps = o.ps, plY = y - 122;
    if (o.chute !== false) {
      const C = chuteSprite(f.chute);
      ctx.save(); ctx.translate(x, cy); ctx.rotate(sw); ctx.drawImage(C.c, -85, -50, 170, 100); ctx.restore();
      ctx.strokeStyle = "rgba(70,60,50,0.65)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x - 76, cy + 34 - sw * 70); ctx.lineTo(x - ps.w / 2 + 12, plY - ps.h / 2 + 4); ctx.moveTo(x + 76, cy + 34 + sw * 70); ctx.lineTo(x + ps.w / 2 - 12, plY - ps.h / 2 + 4);
      ctx.moveTo(x - 26, cy + 40); ctx.lineTo(x - 10, plY - ps.h / 2 + 2); ctx.moveTo(x + 26, cy + 40); ctx.lineTo(x + 10, plY - ps.h / 2 + 2); ctx.stroke();
    }
    ctx.strokeStyle = "rgba(70,60,50,0.7)"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x, plY + ps.h / 2 - 2); ctx.lineTo(x, y - 50); ctx.stroke();
    const S = foodSprite(f.kind), wob = Math.sin(q12(t) * 3 + f.ph) * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.rotate(wob); ctx.drawImage(S.c, -78, -84, 156, 156); ctx.restore();
  }

  Games.register({
    id: 7, key: "g", name: "El monstre golafre", zone: "camp", music: "marimba", demoTime: 10, missAt: [800, 330],
    collect: { one: "barret", many: "barrets" },
    goal: l => (l <= 3 ? "Escriu la lletra de cada aliment que cau i el monstre se'l menjarà." : l === 4 ? "Escriu la síl·laba de cada aliment que cau i el monstre se'l menjarà." : "Escriu el nom de cada aliment que cau i el monstre se'l menjarà.") + " Compte: el mitjó, la sabata i la pedra no es mengen!",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const bg = Art.get("g07_meadow") || bgSprite().c, s = Math.max(w / 760, h / 520), bx = bg.width / W, by = bg.height / H;
      ctx.drawImage(bg, 420 * bx, 300 * by, 760 * bx, 520 * by, x + w / 2 - 380 * s, y + h - 520 * s, 760 * s, 520 * s);
      const k = Math.min(w / 420, h / 300);
      ctx.translate(x + w / 2, y + h); ctx.scale(k, k);
      drawMonster(ctx, -40, -24, { s: 0.78, t, open: 0.55 + Math.sin(t * 3) * 0.25, look: [0.6, -0.9], blink: 0 });
      const f = { kind: "poma", chute: 0, ph: 0 }, bob = Math.sin(t * 2) * 6;
      chuteAssembly(ctx, f, 120, -150 + bob, t, { ps: plateSize(ctx, "a", 56) });
      drawPlate(ctx, "a", 120, -272 + bob, { size: 56, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, demo = api.demo;
      const pool = L >= 5 ? api.pool({ items: L === 5 ? W5 : W6 }) : api.pool({});
      const badPool = L >= 5 ? api.pool({ items: L === 5 ? BAD5 : BAD6 }) : null;
      const size = L <= 3 ? 64 : L === 4 ? 52 : 44;
      const fallT = [0, 15, 15, 14, 17, 22, 26][L];   // segons per caure fins a terra
      const maxOn = L === 1 ? 2 : L <= 4 ? 3 : 2;
      const foods = [], splats = [], loose = [];
      let eaten = 0, dropped = 0, spawnT = 0.2, made = 0, over = false, endT = 0, chuteN = randi(0, 5);
      const M = { x: 800, tx: 800, s: 1, open: 0, chew: 0, yuck: 0, worry: 0, hop: 0, hopV: 0, sq: 0, blinkT: 2, blink: 0, dance: 0, walk: false };
      api.hud.progress = [0, GOAL]; api.hud.lives = [MAXDROP, MAXDROP];
      const typer = api.typer({
        targets: () => foods.filter(f => !f.bad && f.state === "fall"),
        rank: f => -f.y,
        onDone: f => eat(f),
        onStep: (f) => { f.pop = 1; },
        onMiss: (f, k) => {
          M.worry = 1.4; Sfx.play("thud");
        },
      });
      function spawn() {
        const live = foods.filter(f => f.state === "fall");
        const goodLive = live.filter(f => !f.bad);
        const bad = made >= 3 && goodLive.length >= 1 && Math.random() < (L === 1 ? 0.18 : 0.24) && !live.some(f => f.bad);
        const excl = live.map(f => f.text);
        let text, kind;
        if (bad) {
          if (badPool) { text = badPool.next(excl); kind = text; }
          else { text = pool.next(excl); kind = pick(["mitjó", "sabata", "pedra"]); }
          if (excl.some(e => e[0] === text[0])) return; // la mateixa primera tecla seria ambigua: ho deixem per a després
        } else {
          text = pool.next(excl); kind = L >= 5 ? text : pick(GOODLIST);
          if (excl.some(e => e[0] === text[0])) text = pool.next(excl);
        }
        let x = 0;
        for (let tries = 0; tries < 30; tries++) { x = rand(190, 1410); if (Math.abs(x - 1350) > 170 && live.every(f => Math.abs(f.x - x) > 280) && Math.abs(x - M.x) > (made === 0 ? 120 : 0)) break; }
        const ps = { w: 0, h: 0 };
        foods.push({ text, kind, bad, x, y: made === 0 ? 330 : rand(268, 300), enter: 0, ph: rand(0, 6), chute: (chuteN++) % CHUTES.length, state: "fall", pop: 0, t: 0, ps, sway: rand(0.5, 0.9) });
        made++;
      }
      function mouthPos() { return [M.x, GROUND - (2 + 138 - 40) * M.s - M.hop]; }
      function eat(f) {
        f.state = "fly"; f.t = 0; f.from = [f.x, f.y]; M.tx = clamp(f.x, 160, 1440); M.open = 1; M.worry = 0;
        loose.push({ x: f.x, y: f.y - 232, vx: rand(-40, 40), vy: -60, chute: f.chute, a: 1, rot: 0 });
        Sfx.play("whoosh");
      }
      function bite(f) {
        f.state = "gone"; eaten++; api.hud.progress = [eaten, GOAL];
        M.open = 0; M.chew = 0.5; M.sq = 1; M.s = 1 + eaten * 0.013;
        const [mx, my] = mouthPos();
        Sfx.play("bite");
        api.particles.emit(mx, my, { count: 14, color: [FOODCOL[f.kind] || "#F7C544", "#FFF3D6", shade(FOODCOL[f.kind] || "#F7C544", -0.2)], speed: 300, gravity: 700, size: 10, life: 0.7, shape: "circle" });
        if (eaten >= GOAL) {
          over = true; endT = 0;
          setTimeout(() => { Sfx.play("burp"); void 0; }, 700);
        }
      }
      function spit(bf) {
        // el monstre s'empassa l'objecte dolent i l'escup
        bf.state = "spit"; bf.t = 0; bf.from = [bf.x, bf.y]; M.tx = clamp(bf.x, 160, 1440); M.open = 1;
        loose.push({ x: bf.x, y: bf.y - 232, vx: rand(-40, 40), vy: -60, chute: bf.chute, a: 1, rot: 0 });
      }
      return {
        expected() { return over ? null : typer.expected(); },
        onKey(k) {
          if (over || k.length !== 1) return;
          const wasLocked = typer.current();
          // el quadre de comparació surt a l'altra banda de l'aliment que cal escriure
          const tg = wasLocked || foods.filter(f => !f.bad && f.state === "fall").sort((p, q) => q.y - p.y)[0];
          api.def.missAt = [tg && tg.x > 800 ? 470 : 1130, 430];
          const ok = typer.key(k);
          if (!ok && !wasLocked) {
            const bf = foods.find(f => f.bad && f.state === "fall" && f.text[0] === k);
            if (bf) spit(bf);
          }
        },
        update(dt) {
          const t = api.t;
          // aparicions
          spawnT -= dt * api.speed;
          const live = foods.filter(f => f.state === "fall"), goodLive = live.filter(f => !f.bad);
          if (!over && (spawnT <= 0 && live.length < maxOn || goodLive.length === 0 && spawnT < 2.2)) { spawn(); spawnT = (L === 1 ? 4.6 : L <= 4 ? 4.0 : 6.5) / Math.max(0.7, api.speed); }
          for (let i = foods.length - 1; i >= 0; i--) {
            const f = foods[i]; f.t += dt; f.enter = Math.min(1, f.enter + dt / 0.9); f.pop = Math.max(0, f.pop - dt * 3);
            if (f.state === "fall") {
              const v = (GROUND - 200) / fallT * api.speed * (f.locked ? 0.35 : 1) * (demo ? 1.6 : 1);
              f.y += v * dt; f.x += Math.sin(t * f.sway + f.ph) * 10 * dt;
              if (f.y > GROUND - 44) {
                f.state = "land"; f.t = 0;
                if (f.bad) { Sfx.play("thud"); }
                else {
                  dropped++; api.hud.lives = [MAXDROP - dropped, MAXDROP]; Sfx.play("splash"); M.worry = 1.2;
                  splats.push({ x: f.x, y: GROUND + 6, col: FOODCOL[f.kind] || "#E5443A", t: 0, seed: randi(1, 999) });
                  api.particles.emit(f.x, GROUND - 10, { count: 16, color: [FOODCOL[f.kind] || "#E5443A", "#fff"], speed: 320, gravity: 900, size: 9, life: 0.6, angle: -Math.PI / 2, spread: 1.2 });
                  if (dropped >= MAXDROP && !over) { over = true; setTimeout(() => api.finish(false), 1200); }
                }
                loose.push({ x: f.x, y: f.y - 232, vx: rand(-30, 30), vy: -40, chute: f.chute, a: 1, rot: 0 });
              }
            } else if (f.state === "fly" || f.state === "spit") {
              const dur = 0.55, k = clamp(f.t / dur, 0, 1), e = Ease.inOutQuad(k), [mx, my] = mouthPos();
              f.x = lerp(f.from[0], mx, e); f.y = lerp(f.from[1], my, e) - Math.sin(k * Math.PI) * 120;
              if (k >= 1) {
                if (f.state === "fly") { bite(f); }
                else { f.state = "out"; f.t = 0; f.vx = M.x < 800 ? 700 : -700; f.vy = -700; M.open = 0; M.yuck = 1.4; Sfx.play("burp"); api.particles.emit(mx, my, { count: 10, color: ["#9AD47A", "#D8F2C2"], speed: 260, gravity: 400, size: 9, life: 0.6 }); }
              }
            } else if (f.state === "out") { f.vy += 1500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; if (f.y > H + 200) f.state = "gone"; }
            else if (f.state === "land") { if (f.bad) { f.x += (f.x < 800 ? -1 : 1) * 260 * dt; } if (f.t > (f.bad ? 1.4 : 0.35)) f.state = "gone"; }
            if (f.state === "gone") foods.splice(i, 1);
          }
          for (let i = loose.length - 1; i >= 0; i--) { const c = loose[i]; c.vy -= 30 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a -= dt * 0.7; c.rot += dt * 0.4 * Math.sign(c.vx || 1); if (c.a <= 0) loose.splice(i, 1); }
          for (let i = splats.length - 1; i >= 0; i--) { splats[i].t += dt; if (splats[i].t > 6) splats.splice(i, 1); }
          // monstre
          const dx = M.tx - M.x; M.walk = Math.abs(dx) > 6; M.x += clamp(dx, -1100 * dt, 1100 * dt);
          const flying = foods.find(f => f.state === "fly" || f.state === "spit");
          if (flying && flying.t > 0.25 && M.hop === 0) { M.hopV = 520; Sfx.play("boing"); }
          if (M.hopV || M.hop > 0) { M.hop += M.hopV * dt; M.hopV -= 2000 * dt; if (M.hop <= 0) { M.hop = 0; M.hopV = 0; M.sq = 0.8; } }
          M.sq = Math.max(0, M.sq - dt * 3); M.chew = Math.max(0, M.chew - dt); M.yuck = Math.max(0, M.yuck - dt); M.worry = Math.max(0, M.worry - dt);
          if (!flying && M.open > 0 && !over) M.open = Math.max(0, M.open - dt * 2);
          M.blinkT -= dt; if (M.blinkT < 0) { M.blink = 1; M.blinkT = rand(2.5, 4.5); } M.blink = Math.max(0, M.blink - dt * 6);
          if (!flying && !M.walk) { const tgt = goodLive.sort((a, b) => b.y - a.y)[0]; if (tgt && Math.abs(tgt.x - M.x) > 520 && eaten < GOAL) M.tx = clamp(lerp(M.x, tgt.x, 0.35), 160, 1440); }
          if (over && eaten >= GOAL) {
            endT += dt; M.dance = 1; M.tx = 800;
            if (endT > 0.7 && endT < 1.4) M.open = 0.8; else M.open = 0;
            if (endT > 1.3 && !M.confetti) { M.confetti = 1; api.particles.emit(800, 380, { count: 60, color: ["#F36F5B", "#FFE15A", "#7BC8A4", "#5BB8F3", "#F28DB2"], shape: "confetti", speed: 620, gravity: 700, size: 14, life: 1.6 }); }
            if (endT > 2.6 && !M.fin) { M.fin = 1; api.finish(true, { collectName: "un barret nou per al monstre" }); }
          }
        },
        draw(ctx) {
          const t = api.t, tq = q12(t);
          const meadow = Art.get("g07_meadow");
          ctx.drawImage(meadow || bgSprite().c, 0, 0, W, H);
          // núvols en parallax
          if (!meadow) for (let i = 0; i < 3; i++) { const C = cloudSprite(i % 2), cx = ((i * 620 + (Settings.reduceMotion ? 0 : t) * (8 + i * 4)) % 2000) - 250; ctx.drawImage(C.c, cx, 120 + i * 70 + (i === 1 ? 40 : 0), 260 * (1 - i * 0.12), 120 * (1 - i * 0.12)); }
          for (const s of splats) {
            const a = clamp(6 - s.t, 0, 1), k = Ease.outBack(clamp(s.t / 0.25, 0, 1));
            ctx.save(); ctx.globalAlpha = a; ctx.translate(s.x, s.y); ctx.scale(k * 1.4, k * 0.45);
            blobPath(ctx, 0, 0, 44, s.seed, 0.35, 11); ctx.fillStyle = s.col; ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.ellipse(-10, -12, 16, 8, 0, 0, 6.28); ctx.fill();
            ctx.restore();
          }
          for (const c of loose) { const C = chuteSprite(c.chute); ctx.save(); ctx.globalAlpha = clamp(c.a, 0, 1); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.drawImage(C.c, -85, -50, 170, 100); ctx.restore(); }
          // aliments que cauen (els de més avall, davant)
          const order = foods.slice().sort((a, b) => a.y - b.y);
          const flying = foods.find(f => f.state === "fly" || f.state === "spit");
          const lookAt = flying || order.filter(f => f.state === "fall" && !f.bad).pop();
          const [mx, my] = mouthPos();
          const look = lookAt ? [(lookAt.x - M.x) / 300, (lookAt.y - my) / 300] : [0, 0.2];
          const dance = M.dance ? Math.sin(tq * 7) : 0;
          for (const f of order) {
            if (f.state !== "fall" && f.state !== "land") continue;
            const ent = 1 - Ease.outCubic(f.enter), y = f.y - ent * 320, a = f.state === "land" ? clamp(1 - f.t / (f.bad ? 1.4 : 0.35), 0, 1) : 1;
            f.ps = plateSize(ctx, f.text, size);
            ctx.save(); ctx.globalAlpha = a;
            if (f.state === "land" && !f.bad) { ctx.restore(); continue; }
            chuteAssembly(ctx, f, f.x, y, t, { ps: f.ps, chute: f.state === "fall" });
            ctx.restore();
          }
          drawMonster(ctx, M.x, GROUND, { t: tq, s: M.s, sq: M.sq, open: M.open, look, blink: M.blink, chew: M.chew > 0, yuck: M.yuck > 0, worry: M.worry > 0 && !M.open, walk: M.walk, hop: M.hop + (M.dance ? Math.abs(dance) * 30 : 0), arms: M.dance, rot: dance * 0.12, hat: M.dance && endT > 1.3 });
          // aliments que volen cap a la boca (davant del monstre)
          for (const f of foods) {
            if (f.state !== "fly" && f.state !== "spit" && f.state !== "out") continue;
            const S = foodSprite(f.kind), k = f.state === "out" ? 1 : 1 - clamp(f.t / 0.55, 0, 1) * 0.45;
            ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(q12(f.t) * (f.state === "out" ? 9 : 4)); ctx.scale(k, k); ctx.drawImage(S.c, -78, -84, 156, 156); ctx.restore();
          }
          // plaques (60 fps, sempre rectes i per sobre)
          for (const f of order) {
            if (f.state !== "fall") continue;
            const ent = 1 - Ease.outCubic(f.enter), y = f.y - ent * 320 - 122;
            const st = f.bad ? "bad" : f.locked ? "active" : null;
            drawPlate(ctx, f.text, f.x, y - f.pop * 6, { size, progress: f.typed || 0, state: st, shadowBlur: 8 });
          }
          drawVignette(ctx, 0.22, "20,50,30");
        },
      };
    },
  });
})();
