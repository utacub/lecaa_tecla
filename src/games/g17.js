"use strict";
/* 17. La pastisseria — taulell de plastilina pastel, ingredients al bol, forn i decoració lliure */
(() => {
  const ORDERS = 6;
  const CITIES = ["Vic", "Olot", "Reus", "Girona", "Lleida", "Tarragona"];
  const BOWL = [750, 660], CUST = [250, 492], OVEN = [900, 442];
  const SLOTS = [[990, 313], [1210, 313], [1430, 313], [990, 541], [1210, 541], [1430, 541]];
  const DECO_X = [560, 800, 1040], DECO_Y = 800;
  const q12 = t => Math.floor(t * 12) / 12;

  /* ---------- plastilina ---------- */
  const clayTex = () => Tex.get("g17clay", () => {
    const n = makeNoise(17), R = mulberry32(17), c = Tex.pixels(256, 256, (i, j) => { const v = 224 + (n.fbm(i / 50, j / 50, 3) - 0.5) * 20 + (R() - 0.5) * 4; return [v, v, v]; });
    const x = c.getContext("2d");
    for (let k = 0; k < 9; k++) { const px = R() * 256, py = R() * 256, rad = 14 + R() * 16, a0 = R() * 6.28; for (let q = 0; q < 5; q++) { x.strokeStyle = q % 2 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)"; x.lineWidth = 1.2; x.beginPath(); x.arc(px, py, Math.max(1, rad - q * 3), a0, a0 + 1.4 + R()); x.stroke(); } }
    return c;
  });
  function clay(x, path, col, o = {}) {
    const cx = o.cx || 0, cy = o.cy || 0, r = o.r || 50;
    if (o.shadow) { x.save(); path(x); x.shadowColor = "rgba(90,50,40,0.3)"; x.shadowBlur = o.shadow; x.shadowOffsetY = o.shadow * 0.45; x.fillStyle = col; x.fill(); x.restore(); }
    x.save(); path(x); x.fillStyle = col; x.fill(); x.clip();
    const g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.05, cx, cy, r * 1.25);
    g.addColorStop(0, "rgba(255,255,255,0.40)"); g.addColorStop(0.35, "rgba(255,255,255,0.06)"); g.addColorStop(0.75, "rgba(0,0,0,0.03)"); g.addColorStop(1, "rgba(0,0,0,0.22)");
    x.fillStyle = g; x.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    x.globalCompositeOperation = "multiply"; x.globalAlpha = o.tex != null ? o.tex : 0.5;
    x.fillStyle = x.createPattern(clayTex(), "repeat"); x.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    x.restore();
    x.save(); path(x); x.lineWidth = o.lw || 2; x.strokeStyle = "rgba(60,30,20,0.16)"; x.stroke(); x.restore();
  }
  const circ = (cx, cy, r) => x => { x.beginPath(); x.arc(cx, cy, r, 0, 6.2832); };
  const ell = (cx, cy, rx, ry, a = 0) => x => { x.beginPath(); x.ellipse(cx, cy, rx, ry, a, 0, 6.2832); };
  const box = (x0, y0, w, h, r) => x => rr(x, x0, y0, w, h, r);

  /* ---------- ingredients (sprites de 130×130, base a y=58) ---------- */
  const ING = {
    farina: x => { clay(x, p => { p.beginPath(); p.moveTo(-36, 58); p.quadraticCurveTo(-46, 0, -34, -30); p.lineTo(-24, -44); p.quadraticCurveTo(0, -36, 24, -44); p.lineTo(34, -30); p.quadraticCurveTo(46, 0, 36, 58); p.closePath(); }, "#F2E8D2", { r: 56, cy: 8, shadow: 6 }); x.strokeStyle = "#C8A060"; x.lineWidth = 4; x.beginPath(); x.moveTo(-28, -30); x.quadraticCurveTo(0, -22, 28, -30); x.stroke(); x.fillStyle = "#E3B94F"; for (let i = 0; i < 5; i++) { x.beginPath(); x.ellipse(-2 + (i % 2 ? 6 : -6), 2 + i * 8, 5, 3, i % 2 ? 0.6 : -0.6, 0, 6.28); x.fill(); } x.strokeStyle = "#B88A3A"; x.lineWidth = 2.5; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, 44); x.stroke(); },
    ous: x => { x.save(); clay(x, box(-46, 26, 92, 32, 8), "#D9C2A0", { r: 50, cy: 40, shadow: 5 }); for (const d of [-24, 0, 24]) clay(x, ell(d, 18, 15, 20), d ? "#FBF3E4" : "#F2D9B6", { r: 20, cx: d, cy: 18 }); x.restore(); },
    sucre: x => { clay(x, box(-34, -30, 68, 88, 14), "rgba(220,240,255,0.95)", { r: 50, cy: 10, shadow: 6, tex: 0.25 }); for (const [a, b] of [[-14, 30], [8, 34], [-4, 12], [14, 12], [-16, 48], [10, 50]]) clay(x, box(a - 9, b - 9, 18, 18, 3), "#FFFFFF", { r: 10, cx: a, cy: b, tex: 0.3 }); clay(x, box(-38, -40, 76, 16, 6), "#F28DB2", { r: 40, cy: -32 }); },
    llet: x => { clay(x, p => { p.beginPath(); p.moveTo(-14, -48); p.lineTo(14, -48); p.lineTo(16, -28); p.quadraticCurveTo(32, -18, 32, 4); p.lineTo(32, 58); p.lineTo(-32, 58); p.lineTo(-32, 4); p.quadraticCurveTo(-32, -18, -16, -28); p.closePath(); }, "#FBFBF6", { r: 56, cy: 6, shadow: 6 }); clay(x, box(-16, -56, 32, 12, 4), "#4A9BE0", { r: 18, cy: -50 }); x.fillStyle = "#8DC0EE"; rr(x, -32, 6, 64, 20, 2); x.fill(); },
    nata: x => { clay(x, box(-32, -10, 64, 68, 6), "#9AD3EA", { r: 50, cy: 22, shadow: 6 }); clay(x, p => { p.beginPath(); p.moveTo(-32, -10); p.lineTo(0, -40); p.lineTo(32, -10); p.closePath(); }, "#C3E6F3", { r: 34, cy: -20 }); clay(x, circ(0, 22, 16), "#FFFFFF", { r: 16, cy: 22 }); },
    mel: x => { clay(x, p => { p.beginPath(); p.moveTo(-34, -18); p.quadraticCurveTo(-46, 58, 0, 58); p.quadraticCurveTo(46, 58, 34, -18); p.closePath(); }, "#F2B33A", { r: 50, cy: 20, shadow: 6 }); clay(x, box(-38, -34, 76, 18, 7), "#D9553E", { r: 36, cy: -26 }); x.fillStyle = "#F2B33A"; x.beginPath(); x.moveTo(-10, -18); x.quadraticCurveTo(-8, 0, -4, 6); x.quadraticCurveTo(0, 0, 2, -18); x.fill(); },
    maduixa: x => { clay(x, ell(0, 44, 46, 14), "#F5F0E6", { r: 46, cy: 44, shadow: 5 }); for (const [a, b] of [[-18, 26], [16, 28], [0, 10]]) { clay(x, p => { p.beginPath(); p.moveTo(a, b + 24); p.bezierCurveTo(a - 22, b + 6, a - 18, b - 14, a, b - 12); p.bezierCurveTo(a + 18, b - 14, a + 22, b + 6, a, b + 24); p.closePath(); }, "#E8344A", { r: 22, cx: a, cy: b }); x.fillStyle = "#4E9A3F"; x.beginPath(); x.ellipse(a, b - 12, 9, 4, 0, 0, 6.28); x.fill(); } },
    xocolata: x => { clay(x, box(-32, -40, 64, 98, 8), "#6B3B22", { r: 52, cy: 9, shadow: 6 }); x.strokeStyle = "rgba(0,0,0,0.25)"; x.lineWidth = 3; for (const yy of [-12, 16]) { x.beginPath(); x.moveTo(-30, yy); x.lineTo(30, yy); x.stroke(); } x.beginPath(); x.moveTo(0, -38); x.lineTo(0, 30); x.stroke(); clay(x, box(-34, 28, 68, 30, 4), "#E85A6A", { r: 34, cy: 42 }); },
    mantega: x => { clay(x, box(-44, 14, 88, 44, 8), "#E6EEF4", { r: 50, cy: 36, shadow: 6 }); clay(x, box(-36, -8, 72, 36, 6), "#FBE38A", { r: 40, cy: 10 }); },
    llimona: x => { clay(x, ell(0, 16, 40, 34), "#F3D43B", { r: 40, cy: 16, shadow: 6 }); x.fillStyle = "#4E9A3F"; x.beginPath(); x.ellipse(14, -18, 14, 6, -0.5, 0, 6.28); x.fill(); },
    coco: x => { clay(x, p => { p.beginPath(); p.arc(0, 14, 40, 0, Math.PI); p.closePath(); }, "#7A4A2C", { r: 40, cy: 30, shadow: 6 }); clay(x, ell(0, 14, 40, 12), "#FBF6EE", { r: 40, cy: 14 }); x.strokeStyle = "#7A4A2C"; x.lineWidth = 4; x.beginPath(); x.ellipse(0, 14, 38, 11, 0, 0, 6.28); x.stroke(); },
    nous: x => { for (const [a, b] of [[-20, 36], [18, 38], [0, 14]]) { clay(x, circ(a, b, 19), "#B88152", { r: 19, cx: a, cy: b, shadow: 3 }); x.strokeStyle = "rgba(70,40,20,0.5)"; x.lineWidth = 2; x.beginPath(); x.moveTo(a, b - 18); x.quadraticCurveTo(a - 5, b, a, b + 18); x.stroke(); } },
    canyella: x => { clay(x, ell(0, 50, 40, 9), "#C9A27A", { r: 40, cy: 50, shadow: 4 }); for (const d of [-16, 0, 16]) { x.save(); x.translate(d, 10); x.rotate(d * 0.01); clay(x, box(-7, -44, 14, 90, 7), "#A0582E", { r: 20, cy: 0 }); x.restore(); } x.fillStyle = "#E25B4A"; x.fillRect(-26, 10, 52, 8); },
    vainilla: x => { clay(x, box(-26, -14, 52, 72, 10), "rgba(225,245,255,0.95)", { r: 44, cy: 22, shadow: 6, tex: 0.2 }); for (const d of [-8, 2, 10]) { x.strokeStyle = "#3A2418"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(d, 50); x.lineTo(d + (d - 2) * 0.6, -40); x.stroke(); } clay(x, box(-30, -20, 60, 12, 5), "#C9A27A", { r: 30, cy: -14 }); },
    ametlles: x => { clay(x, ell(0, 46, 44, 12), "#9AD3EA", { r: 44, cy: 46, shadow: 4 }); for (const [a, b, r] of [[-20, 30, -0.4], [16, 30, 0.5], [0, 16, 0], [-4, 38, 0.2], [22, 14, 0.9]]) clay(x, ell(a, b, 9, 15, r), "#C98B55", { r: 15, cx: a, cy: b }); },
    avellanes: x => { clay(x, ell(0, 46, 44, 12), "#F2C6D6", { r: 44, cy: 46, shadow: 4 }); for (const [a, b] of [[-20, 30], [18, 30], [0, 14], [0, 38]]) { clay(x, circ(a, b, 14), "#9A5E32", { r: 14, cx: a, cy: b }); x.fillStyle = "#E6C49A"; x.beginPath(); x.ellipse(a, b - 11, 9, 4, 0, 0, 6.28); x.fill(); } },
    merenga: x => { clay(x, ell(0, 50, 42, 10), "#B9A4F2", { r: 42, cy: 50, shadow: 4 }); for (let i = 0; i < 4; i++) clay(x, p => { p.beginPath(); p.moveTo(-28 + i * 2, 48 - i * 20); p.quadraticCurveTo(0, 40 - i * 26 - 12, 28 - i * 2, 48 - i * 20); p.closePath(); }, "#FFFDF6", { r: 30, cy: 40 - i * 20, tex: 0.25 }); clay(x, circ(0, -24, 6), "#FFFDF6", { r: 6, cy: -24 }); },
    crema: x => { clay(x, p => { p.beginPath(); p.moveTo(-40, 6); p.lineTo(40, 6); p.quadraticCurveTo(36, 58, 0, 58); p.quadraticCurveTo(-36, 58, -40, 6); p.closePath(); }, "#F7A68A", { r: 44, cy: 30, shadow: 5 }); clay(x, ell(0, 6, 40, 12), "#F7D774", { r: 40, cy: 6 }); x.fillStyle = "#C58A2C"; x.beginPath(); x.arc(10, 4, 3, 0, 6.28); x.fill(); },
    fruita: x => { clay(x, p => { p.beginPath(); p.moveTo(-46, 20); p.lineTo(46, 20); p.quadraticCurveTo(40, 58, 0, 58); p.quadraticCurveTo(-40, 58, -46, 20); p.closePath(); }, "#D8A060", { r: 48, cy: 38, shadow: 5 }); clay(x, circ(-20, 12, 16), "#E5443A", { r: 16, cx: -20, cy: 12 }); clay(x, circ(18, 10, 16), "#F59A2F", { r: 16, cx: 18, cy: 10 }); clay(x, ell(0, -2, 22, 10, -0.4), "#F6D24A", { r: 22, cy: -2 }); },
    sal: x => { clay(x, p => { p.beginPath(); p.moveTo(-22, 58); p.lineTo(-26, -6); p.quadraticCurveTo(-26, -30, 0, -32); p.quadraticCurveTo(26, -30, 26, -6); p.lineTo(22, 58); p.closePath(); }, "#F8F8F4", { r: 48, cy: 12, shadow: 6, tex: 0.3 }); clay(x, p => { p.beginPath(); p.moveTo(-24, -10); p.quadraticCurveTo(-24, -34, 0, -36); p.quadraticCurveTo(24, -34, 24, -10); p.closePath(); }, "#B9C4CC", { r: 26, cy: -20 }); x.fillStyle = "#4B5A62"; for (const [a, b] of [[-8, -24], [0, -28], [8, -24]]) { x.beginPath(); x.arc(a, b, 2, 0, 6.28); x.fill(); } },
  };
  const ING_COL = { farina: "#F6EEDB", ous: "#F7D774", sucre: "#FFFFFF", llet: "#FFFFFF", nata: "#FFFDF6", mel: "#F2B33A", maduixa: "#F28DA2", xocolata: "#7A4A2E", mantega: "#FBE38A", llimona: "#F3E06B", coco: "#FBF6EE", nous: "#C9935E", canyella: "#B8743E", vainilla: "#F3E6C4", ametlles: "#E8C9A0", avellanes: "#B88152", merenga: "#FFFDF6", crema: "#F7D774", fruita: "#F59A6A", sal: "#FFFFFF" };
  const ING_KEYS = Object.keys(ING);
  const W5 = ["farina", "ous", "sucre", "llet", "nata", "mel", "fruita", "sal", "coco", "nous"];
  const W6 = ["maduixa", "xocolata", "mantega", "canyella", "vainilla", "llimona", "ametlles", "avellanes", "merenga", "crema"];
  const ingSprite = k => Sprites.get("g17i_" + k, 130, 130, (x, w, h) => {
    // Una targeta opaca separa cada ingredient del decorat, també quan es mou.
    x.fillStyle = "#FFFFFF"; x.strokeStyle = "#D8D0C5"; x.lineWidth = 2;
    rr(x, 1, 1, w - 2, h - 2, 18); x.fill(); x.stroke();
    const keys = ["farina","ous","sucre","llet","nata","mel","maduixa","xocolata","mantega","llimona","coco","nous","canyella","vainilla","ametlles","avellanes","merenga","crema","fruita","sal"];
    const im = Art.cell("bakery-ingredients", keys.indexOf(k), 5, 4, w - 20, h - 20);
    if (im) { x.drawImage(im, 10, 10, w - 20, h - 20); return; }
    x.translate(w / 2, h / 2 - 6); x.scale(0.84, 0.84); ING[k](x);
  });

  /* ---------- decoracions ---------- */
  const DECO = {
    cirera: (x, s = 1) => { x.strokeStyle = "#4E7A2F"; x.lineWidth = 3 * s; x.lineCap = "round"; x.beginPath(); x.moveTo(0, -10 * s); x.quadraticCurveTo(4 * s, -24 * s, 12 * s, -28 * s); x.stroke(); clay(x, circ(0, 0, 13 * s), "#D82E44", { r: 13 * s }); },
    espelma: (x, s = 1) => { clay(x, box(-6 * s, -40 * s, 12 * s, 44 * s, 4 * s), "#7FB7EA", { r: 20 * s, cy: -18 * s }); x.fillStyle = "#FFFFFF"; for (let i = 0; i < 3; i++) x.fillRect(-6 * s, (-34 + i * 13) * s, 12 * s, 4 * s); x.fillStyle = "#3A2A20"; x.fillRect(-1 * s, -46 * s, 2 * s, 6 * s); },
    nata: (x, s = 1) => { for (let i = 0; i < 3; i++) clay(x, ell(0, (-i * 9) * s, (16 - i * 4) * s, (8 - i) * s), "#FFFDF6", { r: 16 * s, cy: -i * 9 * s, tex: 0.25 }); clay(x, circ(0, -28 * s, 3.5 * s), "#FFFDF6", { r: 4 * s, cy: -28 * s }); },
    fideus: (x, s = 1) => { const C = ["#F36F5B", "#FFE15A", "#7BC8A4", "#5BB8F3", "#B48BE0"]; for (let i = 0; i < 9; i++) { const a = i * 2.4, r = (4 + (i % 3) * 7) * s; x.save(); x.translate(Math.cos(a) * r * 1.6, Math.sin(a) * r * 0.6 - 2 * s); x.rotate(a); x.fillStyle = C[i % 5]; rr(x, -5 * s, -1.6 * s, 10 * s, 3.2 * s, 1.6 * s); x.fill(); x.restore(); } },
    estel: (x, s = 1) => { clay(x, p => starPath(p, 0, -14 * s, 16 * s, 7 * s, 5), "#F7C83C", { r: 16 * s, cy: -14 * s }); },
    xocolata: (x, s = 1) => { clay(x, p => { p.beginPath(); p.moveTo(-10 * s, 0); p.quadraticCurveTo(-10 * s, -14 * s, 0, -22 * s); p.quadraticCurveTo(10 * s, -14 * s, 10 * s, 0); p.closePath(); }, "#6B3B22", { r: 14 * s, cy: -8 * s }); },
    maduixa: (x, s = 1) => { clay(x, p => { p.beginPath(); p.moveTo(0, 6 * s); p.bezierCurveTo(-16 * s, -8 * s, -12 * s, -24 * s, 0, -22 * s); p.bezierCurveTo(12 * s, -24 * s, 16 * s, -8 * s, 0, 6 * s); p.closePath(); }, "#E8344A", { r: 16 * s, cy: -8 * s }); x.fillStyle = "#4E9A3F"; x.beginPath(); x.ellipse(0, -22 * s, 7 * s, 3 * s, 0, 0, 6.28); x.fill(); },
  };
  const DECO_NAME = { cirera: "cirera", cireres: "cirera", espelma: "espelma", espelmes: "espelma", nata: "nata", fideus: "fideus", estel: "estel", estrelles: "estel", xocolata: "xocolata", maduixes: "maduixa" };
  const D5 = ["cirera", "espelma", "nata", "fideus"], D6 = ["cireres", "espelmes", "xocolata", "maduixes"];
  const decoSprite = k => Sprites.get("g17d_" + k, 70, 70, (x, w, h) => { x.translate(w / 2, h / 2 + 18); DECO[k](x, 1.1); });

  /* ---------- pastís ---------- */
  const SPONGE = ["#F3D9A4", "#7A4A2E", "#F4A3B5", "#F6E3B0"], FROST = ["#FFFDF6", "#F7B6C8", "#6B3B22", "#BFE6D6", "#FBE38A"];
  function cakeSprite(sp, fr) {
    return Sprites.get("g17cake" + sp + fr, 240, 190, (x) => {
      const cx = 120;
      clay(x, ell(cx, 168, 112, 18), "#FFFFFF", { r: 112, cx, cy: 168, shadow: 8, tex: 0.25 }); // plat
      clay(x, p => { p.beginPath(); p.moveTo(cx - 86, 70); p.lineTo(cx - 86, 150); p.ellipse(cx, 150, 86, 20, 0, Math.PI, 0, true); p.lineTo(cx + 86, 70); p.closePath(); }, SPONGE[sp], { r: 90, cx, cy: 110 });
      x.fillStyle = rgba("#000000", 0.08); x.fillRect(cx - 86, 106, 172, 8);
      clay(x, p => { p.beginPath(); p.ellipse(cx, 70, 88, 24, 0, Math.PI, 0); for (let i = 0; i <= 8; i++) { const xx = cx + 88 - i * 22; p.quadraticCurveTo(xx + 11, 102 + (i % 2) * 6, xx, 88); } p.closePath(); }, FROST[fr], { r: 90, cx, cy: 70 });
      x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(cx - 30, 60, 34, 8, -0.1, 0, 6.28); x.fill();
    });
  }
  function drawCake(ctx, x, y, s, cake, decos, t) {
    const S = cakeSprite(cake.sp, cake.fr); ctx.drawImage(S.c, x - 120 * s, y - 170 * s, 240 * s, 190 * s);
    for (const d of decos) {
      const k = d.t != null ? Ease.outBack(clamp(d.t / 0.35, 0, 1)) : 1, drop = (1 - k) * 60;
      const D = decoSprite(d.k); ctx.save(); ctx.translate(x + d.x * s, y - 100 * s + d.y * s - drop * s); ctx.scale(s * k, s * k); ctx.drawImage(D.c, -35, -53, 70, 70); ctx.restore();
    }
  }
  const DSLOTS = [[-50, 2], [0, -8], [50, 2], [-24, 12], [24, 12], [-66, -6], [66, -6]];

  /* ---------- fons: pastisseria de plastilina ---------- */
  const bgSprite = () => Sprites.get("g17bg", W, H, (x) => {
    if(Art.get("bakery-bg")){x.drawImage(Art.get("bakery-bg"),0,0,W,H);return;}
    x.fillStyle = "#FBE1D6"; x.fillRect(0, 0, W, H);
    // rajoles
    const R = mulberry32(5);
    for (let j = 0; j < 9; j++) for (let i = 0; i < 22; i++) { const tx = i * 76 - (j % 2) * 38, ty = 80 + j * 60; x.fillStyle = (i + j) % 5 === 0 ? "#F7CDBF" : (i * 3 + j) % 7 === 0 ? "#D7EEE4" : "#FCE8E0"; rr(x, tx + 3, ty + 3, 70, 54, 10); x.fill(); x.fillStyle = "rgba(255,255,255,0.35)"; rr(x, tx + 8, ty + 6, 30, 8, 4); x.fill(); }
    x.save(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.45; x.fillStyle = x.createPattern(clayTex(), "repeat"); x.fillRect(0, 0, W, H); x.restore();
    // tendal a ratlles amb vora festonejada
    for (let i = 0; i < 20; i++) { const col = i % 2 ? "#FFFFFF" : "#F28DB2"; x.save(); x.beginPath(); x.rect(i * 80, 0, 80, 70); x.arc(i * 80 + 40, 70, 40, 0, Math.PI); x.fillStyle = col; x.shadowColor = "rgba(120,50,60,0.25)"; x.shadowBlur = 10; x.shadowOffsetY = 6; x.fill(); x.restore(); }
    x.save(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.35; x.beginPath(); for (let i = 0; i < 20; i++) { x.rect(i * 80, 0, 80, 70); x.arc(i * 80 + 40, 70, 40, 0, Math.PI); } x.fillStyle = x.createPattern(clayTex(), "repeat"); x.fill(); x.restore();
    // prestatges
    for (const yy of [300, 522]) {
      for (const bx of [1000, 1570]) clay(x, box(bx - 8, yy, 16, 34, 4), "#C88D58", { r: 20, cx: bx, cy: yy + 16 });
      clay(x, box(980, yy - 2, 606, 20, 8), "#E2B482", { r: 140, cx: 1284, cy: yy + 8, shadow: 10 });
    }
    // forn
    const ox = OVEN[0], oy = OVEN[1];
    clay(x, box(ox - 170, oy - 120, 340, 250, 34), "#8CC9C4", { r: 180, cx: ox, cy: oy, shadow: 14 });
    clay(x, box(ox - 150, oy - 104, 300, 30, 12), "#6FB1AC", { r: 150, cx: ox, cy: oy - 90 });
    for (const d of [-90, -40, 40, 90]) { clay(x, circ(ox + d, oy - 89, 10), "#FFF6E6", { r: 10, cx: ox + d, cy: oy - 89 }); x.fillStyle = "#4F8F8A"; x.fillRect(ox + d - 1.5, oy - 98, 3, 8); }
    // paret: rètol de la ciutat i cordill de fotos es dibuixen a part
  });
  const counterSprite = () => Sprites.get("g17counter", W, 330, (x) => {
    const im=Art.get("bakery-bg");if(im){x.drawImage(im,0,im.height*570/H,im.width,im.height*330/H,0,0,W,330);return;}
    // taulell: sobre crema i frontal rosa amb plafons
    clay(x, box(-20, 56, W + 40, 290, 0), "#F5A9BE", { r: 900, cx: 800, cy: 120, shadow: 12 });
    for (let i = 0; i < 6; i++) {
      clay(x, box(40 + i * 260, 100, 220, 200, 26), "#F7BCCB", { r: 130, cx: 150 + i * 260, cy: 190 });
      // magdalena de plastilina en relleu a cada plafó
      const mx = 150 + i * 260, my = 205, cc = ["#FFFDF6", "#BFE6D6", "#FBE38A"][i % 3];
      x.globalAlpha = 0.85;
      clay(x, p => { p.beginPath(); p.moveTo(mx - 30, my); p.lineTo(mx + 30, my); p.lineTo(mx + 22, my + 40); p.lineTo(mx - 22, my + 40); p.closePath(); }, "#F28DB2", { r: 34, cx: mx, cy: my + 20 });
      clay(x, p => { p.beginPath(); p.ellipse(mx, my - 4, 36, 22, 0, 0, 6.28); }, cc, { r: 36, cx: mx, cy: my - 4 });
      clay(x, circ(mx, my - 28, 8), "#D82E44", { r: 8, cx: mx, cy: my - 28 });
      x.globalAlpha = 1;
    }
    clay(x, box(-20, 6, W + 40, 56, 22), "#FFF1DC", { r: 900, cx: 800, cy: 20, shadow: 10 });
    x.fillStyle = "rgba(255,255,255,0.45)"; rr(x, 20, 14, W - 40, 10, 5); x.fill();
    x.save(); x.setLineDash([12, 9]); x.strokeStyle = "rgba(255,255,255,0.7)"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 80); x.lineTo(W, 80); x.stroke(); x.restore();
  });
  const bowlBack = () => Sprites.get("g17bowlB", 260, 170, (x) => { clay(x, ell(130, 44, 118, 30), "#E5F2F8", { r: 118, cx: 130, cy: 44, tex: 0.25 }); x.fillStyle = "#C6DCE6"; x.beginPath(); x.ellipse(130, 48, 104, 22, 0, 0, 6.28); x.fill(); });
  const bowlFront = () => Sprites.get("g17bowlF", 260, 170, (x) => {
    clay(x, p => { p.beginPath(); p.moveTo(12, 44); p.ellipse(130, 44, 118, 30, 0, Math.PI, 0, true); p.quadraticCurveTo(244, 150, 130, 160); p.quadraticCurveTo(16, 150, 12, 44); p.closePath(); }, "#7FC8E8", { r: 130, cx: 130, cy: 90, shadow: 10 });
    x.fillStyle = "#FFFFFF"; for (let i = 0; i < 7; i++) { x.beginPath(); x.arc(40 + i * 30, 104 + Math.sin(i) * 4, 6, 0, 6.28); x.fill(); }
    x.strokeStyle = "rgba(255,255,255,0.45)"; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(40, 70); x.quadraticCurveTo(52, 118, 92, 136); x.stroke();
  });

  /* ---------- clients ---------- */
  const CUST_COLS = [["#C98B55", "#F1D3B0"], ["#9AA4B4", "#E8ECF2"], ["#F2A65A", "#FFE2C2"], ["#B48BE0", "#EEE3FA"], ["#7FC4A0", "#DFF3E7"], ["#E86F86", "#FFD9E1"]];
  const custSprite = (i, pose) => Sprites.get("g17cu" + i + pose, 260, 300, (x) => {
    const [c1, c2] = CUST_COLS[i % CUST_COLS.length], cx = 130;
    clay(x, p => { p.beginPath(); p.moveTo(cx - 90, 300); p.quadraticCurveTo(cx - 92, 190, cx, 186); p.quadraticCurveTo(cx + 92, 190, cx + 90, 300); p.closePath(); }, c1, { r: 100, cx, cy: 240 });
    clay(x, ell(cx, 262, 46, 50), c2, { r: 50, cx, cy: 262, tex: 0.3 });
    const earsUp = i % 3 === 1;
    for (const d of [-1, 1]) { if (earsUp) clay(x, ell(cx + d * 34, 28, 16, 42, d * 0.2), c1, { r: 40, cx: cx + d * 34, cy: 28 }); else clay(x, circ(cx + d * 62, 62, 26), c1, { r: 26, cx: cx + d * 62, cy: 62 }); x.fillStyle = rgba(c2, 0.9); x.beginPath(); if (earsUp) x.ellipse(cx + d * 34, 32, 8, 28, d * 0.2, 0, 6.28); else x.arc(cx + d * 62, 62, 13, 0, 6.28); x.fill(); }
    clay(x, circ(cx, 120, 82), c1, { r: 82, cx, cy: 120 });
    clay(x, ell(cx, 152, 40, 30), c2, { r: 40, cx, cy: 152, tex: 0.3 });
    x.fillStyle = "#3A2A28"; x.beginPath(); x.ellipse(cx, 136, 11, 8, 0, 0, 6.28); x.fill();
    x.fillStyle = "rgba(255,120,140,0.4)"; for (const d of [-1, 1]) { x.beginPath(); x.ellipse(cx + d * 52, 146, 13, 8, 0, 0, 6.28); x.fill(); }
    x.strokeStyle = "#2A1A18"; x.lineWidth = 4; x.lineCap = "round";
    for (const d of [-1, 1]) {
      const ex = cx + d * 30, ey = 104;
      if (pose === "happy") { x.beginPath(); x.arc(ex, ey + 4, 9, 3.5, 5.9); x.stroke(); }
      else if (pose === "sad") { x.beginPath(); x.moveTo(ex - 9, ey); x.lineTo(ex + 9, ey); x.stroke(); x.beginPath(); x.moveTo(ex - 10 * d, ey - 16); x.lineTo(ex + 8 * d, ey - 12); x.stroke(); }
      else { x.fillStyle = "#2A1A18"; x.beginPath(); x.arc(ex, ey, 7.5, 0, 6.28); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex - 2.5, ey - 3, 2.6, 0, 6.28); x.fill(); }
    }
    if (pose === "happy") { x.fillStyle = "#6B2430"; x.beginPath(); x.moveTo(cx - 18, 156); x.quadraticCurveTo(cx, 186, cx + 18, 156); x.closePath(); x.fill(); x.fillStyle = "#F08AA0"; x.beginPath(); x.ellipse(cx, 172, 8, 5, 0, 0, 6.28); x.fill(); }
    else if (pose === "sad") { x.beginPath(); x.moveTo(cx - 14, 166); x.quadraticCurveTo(cx - 6, 158, cx, 166); x.quadraticCurveTo(cx + 6, 174, cx + 14, 166); x.stroke(); x.strokeStyle = "rgba(60,30,30,0.6)"; x.lineWidth = 2.5; for (const d of [-1, 1]) { x.beginPath(); x.moveTo(cx + d * 6, 124); x.lineTo(cx + d * 14, 120); x.stroke(); } }
    else { x.beginPath(); x.arc(cx, 152, 12, 0.4, 2.7); x.stroke(); }
  });
  function drawCustomer(ctx, c, x, y, pose, t) {
    if(Art.get("bakery-chef")){const bob=Settings.reduceMotion?0:Math.sin(t*2.4)*3;Art.fit(ctx,"bakery-chef",x-210,y-310+bob,420,630);return;}
    if (typeof Critters !== "undefined" && c.cid) { Critters.draw(ctx, c.cid, x, y, 300, { t, pose: pose === "sad" ? "sad" : pose === "happy" ? "happy" : "idle", flip: false }); return; }
    const S = custSprite(c.i, pose), bob = Math.sin(q12(t) * 2.4) * 3;
    ctx.drawImage(S.c, x - 130, y - 150 + bob, 260, 300);
  }

  Games.register({
    id: 17, key: "s", name: "La pastisseria", zone: "poble", music: "jazz", demoTime: 12, captionY: 222, missAt: [800, 440],
    collect: { one: "foto de pastís", many: "fotos de pastissos" },
    goal: l => (l <= 3 ? "Mira què vol el client i escriu la lletra de cada ingredient." : l === 4 ? "Mira què vol el client i escriu la síl·laba de cada ingredient." : "Mira què vol el client i escriu el nom de cada ingredient.") + " Després, decora el pastís! Serveix 6 encàrrecs.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const B = bgSprite(), sw = 600, sh = 420, s = Math.max(w / sw, h / sh), cx = 330, cy = 520;
      ctx.drawImage(B.c, (cx - sw / 2) * 2, (cy - sh / 2) * 2, sw * 2, sh * 2, x + w / 2 - sw * s / 2, y + h / 2 - sh * s / 2, sw * s, sh * s);
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-cx, -cy);
      const C = counterSprite(); ctx.drawImage(C.c, 0, 0, sw * 2, 330 * 2, cx - sw / 2, 600, sw, 330);
      drawCake(ctx, cx, 620, 1.15, { sp: 0, fr: 1 }, [{ k: "cirera", x: 0, y: -8 }, { k: "espelma", x: -46, y: 2 }, { k: "nata", x: 46, y: 2 }], t);
      const bob = Math.sin(t * 2.2) * 6;
      Sprites.draw(ctx, ingSprite("maduixa"), cx - 190, 420 + bob, { s: 1.1 });
      drawPlate(ctx, "s", cx + 180, 430 - bob, { size: 72 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, demo = api.demo, city = CITIES[L - 1];
      const nRec = [0, 3, 3, 4, 3, 3, 4][L], nShelf = [0, 4, 5, 5, 5, 5, 6][L], nDeco = L <= 4 ? 3 : 2;
      const pool = L >= 5 ? api.pool({ items: L === 5 ? W5 : W6 }) : api.pool({});
      const dpool = L >= 5 ? api.pool({ items: L === 5 ? D5 : D6 }) : api.pool({});
      const size = L <= 3 ? 64 : L === 4 ? 52 : 40;
      let phase = "enter", pt = 0, served = 0, order = null, shelf = [], decos = [], decoOpts = [], flying = [], photos = [], batter = 0, batterCol = "#F3E6C4", mix = 0, bowlPos = BOWL.slice(), bowlS = 1, cakePos = null, custX = -200, custPose = "idle", poseT = 0, ovenGlow = 0, doorOpen = 0, cakeIn = 0, ding = false, hmm = 0;
      const custList = typeof Critters !== "undefined" ? shuffle(Critters.list.filter(c => c.theme !== "insectes" && c.theme !== "mar").map(c => c.id)) : [];
      api.hud.progress = [0, ORDERS];
      const typer = api.typer({
        targets: () => phase === "ing" || phase === "enter" ? shelf.filter(s => s.need && !s.used) : [],
        rank: s => s.need,
        onStep: s => { s.pop = 1; },
        onDone: s => addIng(s),
        onMiss: () => { custPose = "sad"; poseT = 1.2; hmm = 1.2; },
      });
      const dtyper = api.typer({
        targets: () => phase === "decor" ? decoOpts : [],
        rank: d => d.i,
        onStep: d => { d.pop = 1; },
        onDone: d => { d.done = false; d.typed = 0; addDeco(d); },
        onMiss: () => { custPose = "sad"; poseT = 1; hmm = 1; },
      });
      function newOrder(first) {
        const items = pool.many(nShelf);
        const kinds = L >= 5 ? items : shuffle(ING_KEYS).slice(0, nShelf);
        const needIdx = shuffle(items.map((_, i) => i)).slice(0, nRec);
        shelf = items.map((txt, i) => ({ text: txt, kind: kinds[i], slot: SLOTS[i], need: needIdx.includes(i) ? needIdx.indexOf(i) + 1 : 0, used: false, pop: 0, appear: -i * 0.06 }));
        const recipe = needIdx.map(i => shelf[i]);
        let sp = randi(0, 3), fr = randi(0, 4);
        if (recipe.some(s => s.kind === "xocolata")) sp = 1; else if (recipe.some(s => s.kind === "maduixa")) { sp = 2; fr = 1; }
        order = { recipe, cake: { sp, fr }, cust: { i: served + randi(0, 5), cid: custList.length ? custList[served % custList.length] : null } };
        decos = []; batter = 0; batterCol = "#F3E6C4"; mix = 0; bowlPos = [BOWL[0], BOWL[1] - 260]; bowlS = 1; cakePos = null; cakeIn = 0; ding = false;
        phase = "enter"; pt = 0; custX = -220;
        if (first) { phase = "ing"; custX = CUST[0]; bowlPos = BOWL.slice(); shelf.forEach(s => s.appear = 1); } else Sfx.play("whoosh");
      }
      newOrder(true);
      function addIng(s) {
        s.used = true; flying.push({ s, t: 0, from: [s.slot[0], s.slot[1] - 58], to: [BOWL[0], BOWL[1] - 30] });
        Sfx.play("whoosh");
      }
      function addDeco(d) {
        const slot = DSLOTS[decos.length % DSLOTS.length];
        decos.push({ k: d.kind, x: slot[0] + rand(-6, 6), y: slot[1] + rand(-3, 3), t: 0 });
        Sfx.play("pop"); api.particles.emit(BOWL[0] + slot[0], BOWL[1] - 100 + slot[1], { count: 10, color: ["#FFFFFF", "#F7B6C8", "#FFE15A"], shape: "star", speed: 200, gravity: 300, size: 10, life: 0.6 });
        if (decos.length >= nDeco) { phase = "serve"; pt = 0; }
      }
      function setDecoOpts() {
        const items = dpool.many(3), kinds = L >= 5 ? items.map(t => DECO_NAME[t]) : ["cirera", "espelma", "nata"];
        decoOpts = items.map((txt, i) => ({ text: txt, kind: kinds[i], i, pop: 0, x: DECO_X[i] }));
      }
      return {
        expected() { return phase === "ing" || phase === "enter" ? typer.expected() : phase === "decor" ? dtyper.expected() : null; },
        onKey(k) {
          if (k.length !== 1) return;
          if (phase === "ing" || phase === "enter") typer.key(k);
          else if (phase === "decor") dtyper.key(k);
        },
        update(dt) {
          pt += dt; poseT = Math.max(0, poseT - dt); hmm = Math.max(0, hmm - dt);
          if (poseT <= 0 && custPose === "sad") custPose = "idle";
          shelf.forEach(s => { s.pop = Math.max(0, s.pop - dt * 3); s.appear += dt; });
          decoOpts.forEach(d => { d.pop = Math.max(0, d.pop - dt * 3); });
          decos.forEach(d => { if (d.t != null) { d.t += dt; if (d.t > 0.4) d.t = null; } });
          // el bol arriba i el client entra
          if (phase !== "bake" && phase !== "decor" && phase !== "serve" && phase !== "leave" && !cakePos) bowlPos[1] = lerp(bowlPos[1], BOWL[1], 1 - Math.pow(0.0005, dt));
          if (phase === "enter") { custX = lerp(-220, CUST[0], Ease.outCubic(clamp(pt / 0.7, 0, 1))); if (pt > 0.7) { phase = "ing"; pt = 0; } }
          for (let i = flying.length - 1; i >= 0; i--) {
            const f = flying[i]; f.t += dt / 0.55;
            if (f.t >= 1) {
              flying.splice(i, 1); Sfx.play("plof");
              const col = ING_COL[f.s.kind] || "#F3E6C4"; batter++; batterCol = mix_(batterCol, col, batter === 1 ? 0.8 : 0.4);
              api.particles.emit(BOWL[0], BOWL[1] - 34, { count: 14, color: [col, "#FFFFFF", batterCol], speed: 260, gravity: 700, size: 9, life: 0.6, angle: -Math.PI / 2, spread: 1.1 });
              if (batter >= nRec) { phase = "mix"; pt = 0; }
            }
          }
          if (phase === "mix") { mix += dt * 9; if (pt > 1.05) { phase = "bake"; pt = 0; Sfx.play("whoosh"); } }
          if (phase === "bake") {
            // el bol salta dins del forn, es cou i en surt el pastís
            const k1 = clamp(pt / 0.6, 0, 1);
            doorOpen = pt < 0.6 ? Ease.outCubic(clamp(pt / 0.25, 0, 1)) : pt < 0.8 ? 1 - (pt - 0.6) / 0.2 : pt < 2.0 ? 0 : clamp((pt - 2.0) / 0.25, 0, 1);
            bowlPos = [lerp(BOWL[0], OVEN[0], Ease.inOutQuad(k1)), lerp(BOWL[1], OVEN[1] + 40, Ease.inOutQuad(k1)) - Math.sin(k1 * Math.PI) * 160]; bowlS = 1 - k1 * 0.55;
            ovenGlow = pt > 0.8 && pt < 2.1 ? Math.min(1, (pt - 0.8) * 3) : Math.max(0, ovenGlow - dt * 2);
            if (pt > 1.9 && !ding) { ding = true; Sfx.play("bell", { note: 84 }); }
            if (pt > 2.1) { cakeIn = Ease.outBack(clamp((pt - 2.1) / 0.7, 0, 1)); cakePos = [lerp(OVEN[0], BOWL[0], cakeIn), lerp(OVEN[1] + 50, BOWL[1] + 20, Math.min(1, cakeIn)) - Math.sin(clamp((pt - 2.1) / 0.7, 0, 1) * Math.PI) * 90]; if (Math.random() < 0.3) api.particles.emit(cakePos[0] + rand(-60, 60), cakePos[1] - 150, { count: 1, color: ["rgba(255,255,255,0.7)"], speed: 40, gravity: -60, size: 22, life: 1.2, drag: 0.95 }); }
            if (pt > 2.85) { phase = "decor"; pt = 0; setDecoOpts(); cakePos = [BOWL[0], BOWL[1] + 20]; doorOpen = 0; Sfx.play("plof"); }
          }
          if (phase === "serve") {
            const k = clamp((pt - 0.3) / 0.7, 0, 1);
            if (pt > 0.3) cakePos = [lerp(BOWL[0], CUST[0] + 210, Ease.inOutQuad(k)), BOWL[1] + 20 - Math.sin(k * Math.PI) * 50];
            if (pt > 1.0 && !this.tasted) { this.tasted = 1; custPose = "happy"; poseT = 2.2; Sfx.play("chime", { note: 88 }); void 0; api.particles.emit(CUST[0], CUST[1] - 140, { count: 12, color: ["#F28DB2", "#E8344A", "#FFB6C8"], shape: "circle", speed: 160, gravity: -120, size: 14, life: 1.1 }); }
            if (pt > 1.5 && !this.snap) { this.snap = 1; photos.push({ cake: order.cake, decos: decos.map(d => ({ k: d.k, x: d.x, y: d.y })), t: 0 }); Sfx.play("clack"); }
            if (pt > 2.1) { phase = "leave"; pt = 0; served++; api.hud.progress = [served, ORDERS]; this.tasted = 0; this.snap = 0; }
          }
          if (phase === "leave") {
            custX = lerp(CUST[0], -260, Ease.inCubic(clamp(pt / 0.7, 0, 1))); if (cakePos) cakePos = [custX + 210, cakePos[1]];
            if (pt > 0.75) { if (served >= ORDERS) { phase = "done"; api.finish(true, { collectName: `${ORDERS} fotos de pastissos de ${city}` }); } else newOrder(); }
          }
          photos.forEach(p => p.t += dt);
        },
        draw(ctx) {
          const t = api.t, tq = q12(t);
          ctx.drawImage(bgSprite().c, 0, 0, W, H);
          // cordill de fotos
          ctx.strokeStyle = "rgba(120,70,60,0.6)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(560, 196); ctx.quadraticCurveTo(800, 230, 1040, 196); ctx.stroke();
          photos.forEach((p, i) => {
            const px = 580 + i * 80 + 20, k = Ease.outBack(clamp(p.t / 0.5, 0, 1)), py = 206 + Math.sin((px - 560) / 480 * Math.PI) * 14;
            ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(i * 1.7) * 0.08); ctx.scale(k, k);
            ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 5; ctx.shadowOffsetY = 2; ctx.fillStyle = "#FFFFFF"; ctx.fillRect(-28, 0, 56, 62); ctx.shadowColor = "transparent";
            ctx.fillStyle = "#FBE1D6"; ctx.fillRect(-23, 5, 46, 42); drawCake(ctx, 0, 44, 0.19, p.cake, p.decos, t);
            ctx.fillStyle = "#C88D58"; ctx.fillRect(-4, -6, 8, 12);
            ctx.restore();
          });
          // forn: finestra amb llum, porta
          const ox = OVEN[0], oy = OVEN[1];
          if(Art.get("bakery-bg")) {
            ctx.save();ctx.globalCompositeOperation="screen";
            const og=ctx.createRadialGradient(900,442,8,900,442,90);
            og.addColorStop(0,rgba("#FFB347",ovenGlow*0.8));og.addColorStop(1,rgba("#FFB347",0));
            ctx.fillStyle=og;ctx.fillRect(810,352,180,180);ctx.restore();
          } else {
          ctx.save(); rr(ctx, ox - 130, oy - 58, 260, 160, 20); ctx.fillStyle = "#3A3240"; ctx.fill(); ctx.clip();
          const gl = ctx.createRadialGradient(ox, oy + 30, 10, ox, oy + 30, 170); gl.addColorStop(0, rgba("#FFB347", 0.25 + ovenGlow * 0.7)); gl.addColorStop(1, rgba("#E0553A", 0.1 + ovenGlow * 0.35)); ctx.fillStyle = gl; ctx.fillRect(ox - 130, oy - 58, 260, 160);
          if (phase === "bake" && pt > 0.6 && pt < 2.1) { ctx.globalAlpha = 0.8; const B = bowlBack(), F = bowlFront(); const wob = Math.sin(tq * 9) * 3; ctx.drawImage(B.c, ox - 60 + wob, oy + 6, 120, 78); ctx.drawImage(F.c, ox - 60 + wob, oy + 6, 120, 78); ctx.globalAlpha = 1; }
          ctx.restore();
          // porta del forn (s'obre cap avall)
          if (doorOpen < 0.98) {
            const dh = 160 * (1 - doorOpen);
            ctx.save(); rr(ctx, ox - 136, oy + 104 - dh - 6, 272, dh + 6, 20); ctx.fillStyle = "#79BDB8"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = "rgba(40,90,90,0.35)"; ctx.stroke();
            if (dh > 90) { rr(ctx, ox - 100, oy + 104 - dh + 20, 200, dh - 56, 14); ctx.fillStyle = rgba("#2A2430", 0.75); ctx.fill(); const g2 = ctx.createLinearGradient(0, oy - 60, 0, oy + 100); g2.addColorStop(0, rgba("#FFB347", 0.08 + ovenGlow * 0.6)); g2.addColorStop(1, rgba("#E0553A", 0.05 + ovenGlow * 0.3)); ctx.fillStyle = g2; ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.25)"; rr(ctx, ox - 90, oy + 104 - dh + 26, 70, 10, 5); ctx.fill(); }
            ctx.fillStyle = "#F2F0E8"; rr(ctx, ox - 70, oy + 104 - dh + 4, 140, 12, 6); ctx.fill();
            ctx.restore();
          }
          }
          // client i bombolla de pensament
          drawCustomer(ctx, order.cust, custX, CUST[1], custPose, t);
          if (hmm > 0) text(ctx, "Hmm…", custX + 120, CUST[1] - 140, { size: 30, weight: 900, font: FONT_T, color: "#B0405E", stroke: "#FFF6E8", lw: 6 });
          // taulell
          ctx.drawImage(counterSprite().c, 0, 570, W, 330);
          // bol (davant del taulell)
          const showBowl = !(phase === "bake" && pt > 0.6) && phase !== "decor" && phase !== "serve" && phase !== "leave" && phase !== "done";
          if (showBowl) {
            const [bx, by] = bowlPos, bs = bowlS;
            ctx.save(); ctx.translate(bx, by); ctx.scale(bs, bs);
            ctx.drawImage(bowlBack().c, -130, -90, 260, 170);
            if (batter > 0) {
              ctx.save(); ctx.beginPath(); ctx.ellipse(0, -42, 104, 22, 0, 0, 6.28); ctx.clip();
              const lv = Math.min(1, batter / nRec); ctx.fillStyle = batterCol; ctx.beginPath(); ctx.ellipse(0, -36 + (1 - lv) * 14, 100, 20, 0, 0, 6.28); ctx.fill();
              ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.ellipse(-30, -42 + (1 - lv) * 14, 30, 6, 0, 0, 6.28); ctx.fill();
              if (phase === "mix" || phase === "bake") { ctx.strokeStyle = rgba("#FFFFFF", 0.55); ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); for (let a = 0; a < 14; a += 0.25) { const r = a * 6.5, ang = a + mix; ctx.lineTo(Math.cos(ang) * r, -38 + Math.sin(ang) * r * 0.2); } ctx.stroke(); ctx.strokeStyle = rgba("#6B3B22", 0.25); ctx.beginPath(); for (let a = 0; a < 14; a += 0.25) { const r = a * 6.5, ang = a + mix + 3.1; ctx.lineTo(Math.cos(ang) * r, -38 + Math.sin(ang) * r * 0.2); } ctx.stroke(); }
              ctx.restore();
            }
            if (phase === "mix") { const a = mix; ctx.save(); ctx.translate(Math.cos(a) * 40, -40 + Math.sin(a) * 8); ctx.rotate(0.5); ctx.fillStyle = "#C88D58"; rr(ctx, -7, -120, 14, 110, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -8, 16, 22, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
            ctx.drawImage(bowlFront().c, -130, -90, 260, 170);
            ctx.restore();
          }
          // pastís
          if (cakePos) drawCake(ctx, cakePos[0], cakePos[1], phase === "bake" ? 0.6 + cakeIn * 0.4 : 1, order.cake, decos, t);
          // ingredients que volen cap al bol
          for (const f of flying) {
            const k = Ease.inOutQuad(clamp(f.t, 0, 1)), x = lerp(f.from[0], f.to[0], k), y = lerp(f.from[1], f.to[1], k) - Math.sin(k * Math.PI) * 180;
            Sprites.draw(ctx, ingSprite(f.s.kind), x, y, { s: 0.95 - k * 0.35, rot: q12(f.t) * 3 });
          }
          // Globus de comanda: superfície contínua, marge interior i cua cap a l'ovella.
          if (phase !== "leave" && phase !== "done") {
            const ba = clamp((phase === "enter" ? pt - 0.35 : 1) / 0.3, 0, 1);
            if (ba > 0) {
              ctx.save(); ctx.globalAlpha = ba;
              ctx.translate(custX - CUST[0], 0);
              ctx.shadowColor = "rgba(60,35,25,0.18)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
              ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = "#E6ABB9"; ctx.lineWidth = 3;
              rr(ctx, 440, 190, 430, 292, 28); ctx.fill(); ctx.stroke();
              ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
              ctx.beginPath(); ctx.moveTo(442, 370); ctx.lineTo(407, 411); ctx.lineTo(442, 399); ctx.closePath(); ctx.fill();
              ctx.beginPath(); ctx.moveTo(442, 370); ctx.lineTo(407, 411); ctx.lineTo(442, 399); ctx.stroke();
              text(ctx, "La comanda", 655, 222, { size: 26, weight: 900, font: FONT_T, color: "#98435E" });
              drawCake(ctx, 535, 370, 0.62, order.cake, [], t);
              order.recipe.forEach((s, i) => {
                const ix = 690 + (i % 2) * 104, iy = 294 + Math.floor(i / 2) * 108;
                const S = ingSprite(s.kind);
                ctx.drawImage(S.c, ix - 44, iy - 44, 88, 88);
                if (s.used) {
                  ctx.fillStyle = UI.ok; ctx.beginPath(); ctx.arc(ix + 33, iy + 32, 15, 0, Math.PI * 2); ctx.fill();
                  ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round";
                  ctx.beginPath(); ctx.moveTo(ix + 25, iy + 32); ctx.lineTo(ix + 31, iy + 38); ctx.lineTo(ix + 42, iy + 26); ctx.stroke();
                }
              });
              ctx.restore();
            }
          }
          // Una única targeta associa cada imatge amb la seva lletra o paraula.
          // Es dibuixa damunt del taulell per evitar que aquest tapi les etiquetes.
          for (const s of shelf) {
            if (s.used || phase === "decor" || phase === "serve" || phase === "leave" || phase === "done") continue;
            const [sx, sy] = s.slot, top = sy - 123;
            const a = clamp(s.appear / 0.3, 0, 1);
            ctx.save(); ctx.globalAlpha = a;
            ctx.shadowColor = "rgba(45,30,20,0.2)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
            ctx.fillStyle = "#FFFFFF"; ctx.strokeStyle = s.locked ? BRAND.petroli : "#D8D0C5"; ctx.lineWidth = s.locked ? 4 : 2;
            rr(ctx, sx - 100, top, 200, 208, 20); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
            ctx.drawImage(ingSprite(s.kind).c, sx - 52, top + 13, 104, 104);
            ctx.strokeStyle = "#EEE8DF"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(sx - 78, top + 125); ctx.lineTo(sx + 78, top + 125); ctx.stroke();
            drawPlate(ctx, s.text, sx, top + 165, { size: L >= 5 ? 30 : Math.min(size, 52), progress: s.typed || 0, state: s.locked ? "active" : null, shadowBlur: 0 });
            ctx.restore();
          }
          // decoracions disponibles (fase de decoració)
          if (phase === "decor" || (phase === "serve" && pt < 0.3)) {
            const a = phase === "decor" ? clamp(pt / 0.3, 0, 1) : 1 - pt / 0.3;
            text(ctx, "Decora el pastís!", 800, 712, { size: 30, weight: 900, font: FONT_T, color: "#FFFFFF", stroke: "#B0405E", lw: 8 });
            for (const d of decoOpts) {
              ctx.save(); ctx.globalAlpha = a;
              ctx.fillStyle = "rgba(255,246,232,0.9)"; ctx.beginPath(); ctx.ellipse(d.x, DECO_Y + 10, 110, 70, 0, 0, 6.28); ctx.fill();
              ctx.drawImage(decoSprite(d.kind).c, d.x - 132, DECO_Y - 52, 96, 96);
              ctx.restore();
              drawPlate(ctx, d.text, d.x + 30, DECO_Y + 6 - d.pop * 6, { size, alpha: a, progress: d.typed || 0, state: d.locked ? "active" : null, shadowBlur: 6 });
            }
          }
          drawVignette(ctx, 0.18, "90,40,40");
        },
      };
    },
  });
  function mix_(a, b, t) { const A = hexToRgb(a.startsWith("#") ? a : "#F3E6C4"), B = hexToRgb(b); const r = Math.round(lerp(A[0], B[0], t)), g = Math.round(lerp(A[1], B[1], t)), bl = Math.round(lerp(A[2], B[2], t)); return "#" + [r, g, bl].map(v => v.toString(16).padStart(2, "0")).join(""); }
})();
