"use strict";
/* 8. Talla fruita — fruita de guaix brillant sobre una taula de fusta fosca */
(() => {
  const TABLE_Y = 760;           // línia del tauler de la taula (les fruites surten de darrere)
  const EXIT_Y = TABLE_Y + 120;  // sota d'aquí la fruita ja no es veu
  // fruites que sabem pintar (nom → aspecte). shape: round apple pear oval lemon mango pine
  const FR = {
    "síndria": { shape: "round", skin: "#2F7D3B", skin2: "#62B04C", pith: "#EAF4C9", flesh: "#E83A4C", juice: "#F0506A", det: "seeds", stripes: "#1D5A2A" },
    taronja: { shape: "round", skin: "#F2881C", skin2: "#FFB547", pith: "#FFF0CF", flesh: "#FFA22A", juice: "#FFB030", det: "citrus", dimple: 1, leaf: 1 },
    poma: { shape: "apple", skin: "#D6322A", skin2: "#F57A3C", flesh: "#FFF1CE", juice: "#FFE7A6", det: "core", stem: 1, leaf: 1 },
    pera: { shape: "pear", skin: "#AFC23A", skin2: "#E6D85C", flesh: "#FBF2CF", juice: "#F2EDB0", det: "core", stem: 1 },
    kiwi: { shape: "oval", skin: "#8A6235", skin2: "#B58A55", flesh: "#7BB83A", juice: "#A6D65A", det: "kiwi", fuzzy: 1 },
    llima: { shape: "lemon", skin: "#58A53A", skin2: "#93D05A", pith: "#EEF6D0", flesh: "#BCE06C", juice: "#CDEB7A", det: "citrus" },
    llimona: { shape: "lemon", skin: "#F0CF2A", skin2: "#FFF27E", pith: "#FFF8DA", flesh: "#FBE57A", juice: "#FFF09A", det: "citrus" },
    figa: { shape: "pear", skin: "#6A386E", skin2: "#A1609A", pith: "#F2E4C6", flesh: "#D8435A", juice: "#E46A82", det: "fig" },
    pruna: { shape: "round", skin: "#5A2C7A", skin2: "#9058B0", flesh: "#F1C14A", juice: "#E8B844", det: "stone", s: 0.88 },
    coco: { shape: "round", skin: "#6A4426", skin2: "#94683F", pith: "#FFFDF4", flesh: "#F4EFE2", juice: "#F4F2EA", det: "coco", hairy: 1 },
    mango: { shape: "mango", skin: "#F2A22E", skin2: "#E2483A", flesh: "#FFB22A", juice: "#FFC040", det: "stone", blush: 1 },
    nespra: { shape: "round", skin: "#F09E36", skin2: "#FFCB72", flesh: "#FFD58A", juice: "#FFD27A", det: "bigseeds", s: 0.88, stem: 1 },
    "préssec": { shape: "round", skin: "#F7A05C", skin2: "#E6504A", flesh: "#FFC24A", juice: "#FFC860", det: "stone", blush: 1, leaf: 1 },
    pinya: { shape: "pine", skin: "#D49826", skin2: "#F4C850", flesh: "#FCE27A", juice: "#FFEA8A", det: "pine" },
    "meló": { shape: "oval", skin: "#CFD24A", skin2: "#F1EE90", pith: "#E6EFAE", flesh: "#F7E7A4", juice: "#F4EBB0", det: "melon" },
  };
  const ANY = ["síndria", "taronja", "poma", "pera", "kiwi", "llimona", "préssec", "mango", "pinya", "coco", "figa", "llima"];
  const BIG = ["síndria", "taronja", "meló", "coco", "pinya"];
  const EXOTIC = ["un litxi", "una carambola", "una fruita del drac", "un maracujà", "una guaiaba", "un rambutan", "una papaia", "un caqui"];

  /* ---------- formes ---------- */
  function shapePath(c, sh, r) {
    c.beginPath();
    if (sh === "round") c.ellipse(0, 0, r, r * 0.95, 0, 0, 6.2832);
    else if (sh === "apple") { c.moveTo(0, -0.66 * r); c.bezierCurveTo(0.55 * r, -1.06 * r, 1.12 * r, -0.55 * r, 0.96 * r, 0.12 * r); c.bezierCurveTo(0.84 * r, 0.74 * r, 0.42 * r, 0.98 * r, 0, 0.86 * r); c.bezierCurveTo(-0.42 * r, 0.98 * r, -0.84 * r, 0.74 * r, -0.96 * r, 0.12 * r); c.bezierCurveTo(-1.12 * r, -0.55 * r, -0.55 * r, -1.06 * r, 0, -0.66 * r); c.closePath(); }
    else if (sh === "pear") { c.moveTo(0, -1.02 * r); c.bezierCurveTo(0.32 * r, -1.02 * r, 0.4 * r, -0.55 * r, 0.52 * r, -0.2 * r); c.bezierCurveTo(0.98 * r, 0.22 * r, 0.98 * r, 0.96 * r, 0, 0.98 * r); c.bezierCurveTo(-0.98 * r, 0.96 * r, -0.98 * r, 0.22 * r, -0.52 * r, -0.2 * r); c.bezierCurveTo(-0.4 * r, -0.55 * r, -0.32 * r, -1.02 * r, 0, -1.02 * r); c.closePath(); }
    else if (sh === "oval") c.ellipse(0, 0, 1.12 * r, 0.84 * r, 0, 0, 6.2832);
    else if (sh === "lemon") { c.moveTo(-1.2 * r, 0); c.bezierCurveTo(-1.02 * r, -0.98 * r, 1.02 * r, -0.98 * r, 1.2 * r, 0); c.bezierCurveTo(1.02 * r, 0.98 * r, -1.02 * r, 0.98 * r, -1.2 * r, 0); c.closePath(); }
    else if (sh === "mango") c.ellipse(0, 0, 1.08 * r, 0.84 * r, -0.35, 0, 6.2832);
    else if (sh === "pine") c.ellipse(0, 0.1 * r, 0.8 * r, 1.0 * r, 0, 0, 6.2832);
  }
  /* pinzellades de guaix que segueixen la forma */
  function gouache(c, col, r, seed, n = 26) {
    const R = mulberry32(seed); c.lineCap = "round";
    for (let i = 0; i < n; i++) {
      const a0 = R() * 6.28, rad = r * (0.25 + R() * 0.75), len = 0.4 + R() * 0.9, light = R() < 0.45;
      c.strokeStyle = light ? shade(col, 0.18 + R() * 0.12) : shade(col, -0.12 - R() * 0.12); c.globalAlpha = 0.18 + R() * 0.22; c.lineWidth = r * (0.07 + R() * 0.09);
      c.beginPath(); c.arc(0, 0, rad, a0, a0 + len); c.stroke();
    }
    c.globalAlpha = 1;
  }
  function paperGrain(c, r) { c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.22; c.fillStyle = c.createPattern(Tex.paper(256, 256, "#e9e1cf", { seed: 41, fiber: 1.6 }), "repeat"); c.fillRect(-r * 2, -r * 2, r * 4, r * 4); c.restore(); }
  function leaf(c, x, y, s, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(s * 0.5, -s * 0.42, s, 0); c.quadraticCurveTo(s * 0.5, s * 0.42, 0, 0); c.closePath();
    const g = c.createLinearGradient(0, -s * 0.3, 0, s * 0.3); g.addColorStop(0, "#7CC24E"); g.addColorStop(1, "#2F7A33"); c.fillStyle = g; c.fill();
    c.strokeStyle = "rgba(20,60,20,0.55)"; c.lineWidth = s * 0.05; c.stroke();
    c.strokeStyle = "rgba(220,255,190,0.6)"; c.lineWidth = s * 0.04; c.beginPath(); c.moveTo(s * 0.06, 0); c.quadraticCurveTo(s * 0.5, -s * 0.06, s * 0.92, 0); c.stroke();
    c.restore();
  }
  /* fruita sencera, centrada a (0,0), radi r */
  function paintWhole(c, name, r) {
    const im=Art.fruitCell("fruit-whole-clean",Object.keys(FR).indexOf(name),240,260);
    if(im){c.drawImage(im,-r*1.18,-r*1.35,r*2.36,r*2.6);return;}
    const d = FR[name], sh = d.shape, seed = name.length * 13 + name.charCodeAt(0);
    c.save(); shapePath(c, sh, r); c.fillStyle = d.skin; c.fill(); c.clip();
    // volum: llum de dalt a l'esquerra, ombra a baix a la dreta
    const g = c.createRadialGradient(-r * 0.4, -r * 0.45, r * 0.05, 0, 0, r * 1.25);
    g.addColorStop(0, d.blush ? d.skin : d.skin2); g.addColorStop(0.55, d.skin); g.addColorStop(1, shade(d.skin, -0.42)); c.fillStyle = g; c.fillRect(-r * 1.4, -r * 1.4, r * 2.8, r * 2.8);
    if (d.blush) { const b = c.createRadialGradient(r * 0.35, r * 0.1, 0, r * 0.35, r * 0.1, r * 0.95); b.addColorStop(0, rgba(d.skin2, 0.75)); b.addColorStop(1, rgba(d.skin2, 0)); c.fillStyle = b; c.fillRect(-r * 1.4, -r * 1.4, r * 2.8, r * 2.8); }
    if (d.stripes) { c.strokeStyle = d.stripes; c.lineWidth = r * 0.13; c.globalAlpha = 0.75; for (let i = -4; i <= 4; i++) { const x = i * r * 0.26; c.beginPath(); c.moveTo(x * 0.5, -r); for (let k = 0; k <= 10; k++) { const yy = -r + k * r * 0.2, w = Math.sin(k * 1.7 + i) * r * 0.05; c.lineTo(x * Math.cos((yy / r) * 1.2) + w, yy); } c.stroke(); } c.globalAlpha = 1; }
    gouache(c, d.skin, r, seed);
    if (d.dimple) { const R = mulberry32(9); c.fillStyle = "rgba(160,70,0,0.25)"; for (let i = 0; i < 70; i++) { const a = R() * 6.28, rr0 = Math.sqrt(R()) * r; c.beginPath(); c.arc(Math.cos(a) * rr0, Math.sin(a) * rr0, r * 0.018, 0, 6.28); c.fill(); } }
    if (d.fuzzy || d.hairy) { const R = mulberry32(11); c.lineWidth = r * (d.hairy ? 0.025 : 0.014); for (let i = 0; i < (d.hairy ? 160 : 220); i++) { const a = R() * 6.28, rr0 = Math.sqrt(R()) * r * 1.05, x = Math.cos(a) * rr0, y = Math.sin(a) * rr0, L = r * (d.hairy ? 0.12 : 0.05); c.strokeStyle = R() < 0.5 ? "rgba(60,35,15,0.45)" : "rgba(220,180,120,0.3)"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a + 1.3) * L, y + Math.sin(a + 1.3) * L); c.stroke(); } }
    if (sh === "pine") { c.strokeStyle = "rgba(120,70,10,0.55)"; c.lineWidth = r * 0.045; for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(i * r * 0.28 - r, -r); c.lineTo(i * r * 0.28 + r, r * 1.2); c.stroke(); c.beginPath(); c.moveTo(i * r * 0.28 + r, -r); c.lineTo(i * r * 0.28 - r, r * 1.2); c.stroke(); } c.fillStyle = "rgba(255,230,140,0.55)"; for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const x = i * r * 0.28 + (j % 2 ? r * 0.14 : 0), y = j * r * 0.14 * 2 + r * 0.1; c.beginPath(); c.arc(x, y, r * 0.03, 0, 6.28); c.fill(); } }
    // reflex de llum al costat fosc (llum rebotada de la taula)
    c.strokeStyle = rgba(d.skin2, 0.35); c.lineWidth = r * 0.08; c.beginPath(); c.arc(0, 0, r * 0.9, 0.3, 1.6); c.stroke();
    paperGrain(c, r);
    // vora de llum càlida perquè la fruita es destaqui sobre la fusta fosca
    c.save(); c.translate(-r * 0.04, -r * 0.05); shapePath(c, sh, r); c.restore(); c.strokeStyle = "rgba(255,236,200,0.45)"; c.lineWidth = r * 0.07; c.stroke();
    c.restore();
    // contorn de pinzell
    c.save(); shapePath(c, sh, r); c.strokeStyle = rgba("#2a1608", 0.45); c.lineWidth = r * 0.035; c.stroke(); c.restore();
    // brillantor de guaix blanc (molt sucós)
    c.save(); c.fillStyle = "rgba(255,255,255,0.82)"; c.beginPath(); c.ellipse(-r * 0.4, -r * 0.44, r * 0.25, r * 0.12, -0.7, 0, 6.28); c.fill();
    c.fillStyle = "rgba(255,255,255,0.9)"; c.beginPath(); c.arc(-r * 0.12, -r * 0.62, r * 0.05, 0, 6.28); c.fill();
    c.fillStyle = "rgba(255,255,255,0.25)"; c.beginPath(); c.ellipse(-r * 0.3, -r * 0.3, r * 0.45, r * 0.3, -0.7, 0, 6.28); c.fill(); c.restore();
    // tija, fulla, corona
    const topY = sh === "pear" ? -1.0 * r : sh === "apple" ? -0.66 * r : -0.92 * r;
    if (d.stem) { c.save(); c.strokeStyle = "#5A3418"; c.lineCap = "round"; c.lineWidth = r * 0.08; c.beginPath(); c.moveTo(0, topY + r * 0.08); c.quadraticCurveTo(r * 0.04, topY - r * 0.16, r * 0.16, topY - r * 0.28); c.stroke(); c.restore(); }
    if (d.leaf) leaf(c, r * 0.06, topY - r * 0.04, r * 0.5, -0.5);
    if (sh === "pine") { for (let i = -3; i <= 3; i++) { const a = -1.5708 + i * 0.28, L = r * (0.9 - Math.abs(i) * 0.12); c.save(); c.translate(0, -r * 0.82); c.rotate(a); c.beginPath(); c.moveTo(0, -r * 0.09); c.quadraticCurveTo(L * 0.6, -r * 0.05, L, 0); c.quadraticCurveTo(L * 0.6, r * 0.05, 0, r * 0.09); c.closePath(); const g2 = c.createLinearGradient(0, 0, L, 0); g2.addColorStop(0, "#2D6E35"); g2.addColorStop(1, "#7CC250"); c.fillStyle = g2; c.fill(); c.strokeStyle = "rgba(15,50,20,0.5)"; c.lineWidth = r * 0.025; c.stroke(); c.restore(); } }
  }
  /* secció tallada: interior pintat amb detall */
  function paintFlesh(c, d, R0) {
    const R = mulberry32(R0 | 0);
    if (d.det === "seeds") {
      for (const [k, n] of [[0.42, 7], [0.7, 11]]) for (let i = 0; i < n; i++) { const a = i / n * 6.28 + k * 3, x = Math.cos(a) * R0 * k, y = Math.sin(a) * R0 * k; c.save(); c.translate(x, y); c.rotate(a + 1.5708); c.fillStyle = "#1B1210"; c.beginPath(); c.ellipse(0, 0, R0 * 0.045, R0 * 0.08, 0, 0, 6.28); c.fill(); c.fillStyle = "rgba(255,255,255,0.6)"; c.beginPath(); c.arc(-R0 * 0.012, -R0 * 0.03, R0 * 0.014, 0, 6.28); c.fill(); c.restore(); }
      c.strokeStyle = "rgba(255,180,190,0.35)"; c.lineWidth = R0 * 0.02; for (let i = 0; i < 40; i++) { const a = R() * 6.28, r1 = R() * R0 * 0.9; c.beginPath(); c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); c.lineTo(Math.cos(a) * (r1 + R0 * 0.08), Math.sin(a) * (r1 + R0 * 0.08)); c.stroke(); }
    } else if (d.det === "citrus") {
      const n = 10; for (let i = 0; i < n; i++) { const a = i / n * 6.28; c.fillStyle = i % 2 ? shade(d.flesh, 0.1) : shade(d.flesh, -0.04); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R0 * 0.94, a + 0.03, a + 6.28 / n - 0.03); c.closePath(); c.fill(); }
      c.strokeStyle = rgba(d.pith || "#fff", 0.95); c.lineWidth = R0 * 0.035; for (let i = 0; i < n; i++) { const a = i / n * 6.28; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * R0 * 0.95, Math.sin(a) * R0 * 0.95); c.stroke(); }
      c.strokeStyle = "rgba(255,255,255,0.45)"; c.lineWidth = R0 * 0.015; c.lineCap = "round"; for (let i = 0; i < 90; i++) { const a = R() * 6.28, r1 = R0 * (0.2 + R() * 0.65); c.beginPath(); c.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); c.lineTo(Math.cos(a + 0.05) * (r1 + R0 * 0.12), Math.sin(a + 0.05) * (r1 + R0 * 0.12)); c.stroke(); }
      c.fillStyle = d.pith || "#fff"; c.beginPath(); c.arc(0, 0, R0 * 0.1, 0, 6.28); c.fill();
    } else if (d.det === "core") {
      c.strokeStyle = "rgba(170,130,60,0.6)"; c.lineWidth = R0 * 0.025; starPath(c, 0, 0, R0 * 0.32, R0 * 0.14, 5); c.stroke();
      for (let i = 0; i < 5; i++) { const a = -1.5708 + i * 1.2566; c.save(); c.translate(Math.cos(a) * R0 * 0.2, Math.sin(a) * R0 * 0.2); c.rotate(a + 1.5708); c.fillStyle = "#5A3216"; c.beginPath(); c.ellipse(0, 0, R0 * 0.045, R0 * 0.085, 0, 0, 6.28); c.fill(); c.fillStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.arc(-R0 * 0.012, -R0 * 0.03, R0 * 0.014, 0, 6.28); c.fill(); c.restore(); }
    } else if (d.det === "kiwi") {
      c.strokeStyle = "rgba(230,250,190,0.45)"; c.lineWidth = R0 * 0.025; for (let i = 0; i < 48; i++) { const a = i / 48 * 6.28; c.beginPath(); c.moveTo(Math.cos(a) * R0 * 0.3, Math.sin(a) * R0 * 0.3); c.lineTo(Math.cos(a) * R0 * (0.75 + R() * 0.2), Math.sin(a) * R0 * (0.75 + R() * 0.2)); c.stroke(); }
      c.fillStyle = "#F3EFC4"; c.beginPath(); c.ellipse(0, 0, R0 * 0.3, R0 * 0.22, 0, 0, 6.28); c.fill();
      c.fillStyle = "#1A140E"; for (let i = 0; i < 30; i++) { const a = i / 30 * 6.28 + R() * 0.1, rr0 = R0 * (0.36 + R() * 0.08); c.save(); c.translate(Math.cos(a) * rr0, Math.sin(a) * rr0 * 0.8); c.rotate(a); c.beginPath(); c.ellipse(0, 0, R0 * 0.035, R0 * 0.018, 0, 0, 6.28); c.fill(); c.restore(); }
    } else if (d.det === "stone") {
      c.strokeStyle = "rgba(255,240,170,0.4)"; c.lineWidth = R0 * 0.02; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28; c.beginPath(); c.moveTo(Math.cos(a) * R0 * 0.42, Math.sin(a) * R0 * 0.42); c.lineTo(Math.cos(a) * R0 * 0.9, Math.sin(a) * R0 * 0.9); c.stroke(); }
      c.fillStyle = "#8A4A22"; c.beginPath(); c.ellipse(0, 0, R0 * 0.36, R0 * 0.28, 0.3, 0, 6.28); c.fill();
      c.strokeStyle = "rgba(60,25,10,0.55)"; c.lineWidth = R0 * 0.02; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(0, 0, R0 * (0.08 + i * 0.045), R0 * (0.06 + i * 0.035), 0.3, 0, 6.28); c.stroke(); }
      c.fillStyle = "rgba(255,220,180,0.4)"; c.beginPath(); c.ellipse(-R0 * 0.12, -R0 * 0.1, R0 * 0.1, R0 * 0.05, 0.3, 0, 6.28); c.fill();
    } else if (d.det === "coco") {
      const g = c.createRadialGradient(0, 0, 0, 0, 0, R0 * 0.62); g.addColorStop(0, "#D9E4E6"); g.addColorStop(1, "#BFCFD2"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R0 * 0.62, 0, 6.28); c.fill();
      c.fillStyle = "rgba(255,255,255,0.6)"; c.beginPath(); c.ellipse(-R0 * 0.2, -R0 * 0.25, R0 * 0.18, R0 * 0.08, -0.6, 0, 6.28); c.fill();
    } else if (d.det === "pine") {
      c.strokeStyle = "rgba(255,250,200,0.5)"; c.lineWidth = R0 * 0.03; for (let i = 0; i < 36; i++) { const a = i / 36 * 6.28; c.beginPath(); c.moveTo(Math.cos(a) * R0 * 0.22, Math.sin(a) * R0 * 0.22); c.lineTo(Math.cos(a) * R0 * 0.92, Math.sin(a) * R0 * 0.92); c.stroke(); }
      c.fillStyle = "#FFF3B8"; c.beginPath(); c.arc(0, 0, R0 * 0.2, 0, 6.28); c.fill();
      c.fillStyle = "rgba(160,110,20,0.6)"; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28; c.beginPath(); c.arc(Math.cos(a) * R0 * 0.86, Math.sin(a) * R0 * 0.86, R0 * 0.035, 0, 6.28); c.fill(); }
    } else if (d.det === "fig") {
      c.fillStyle = "#F3E6C8"; c.beginPath(); c.arc(0, 0, R0 * 0.28, 0, 6.28); c.fill();
      for (let i = 0; i < 110; i++) { const a = R() * 6.28, rr0 = R0 * (0.25 + R() * 0.6); c.strokeStyle = "rgba(255,200,160,0.55)"; c.lineWidth = R0 * 0.015; c.beginPath(); c.moveTo(Math.cos(a) * rr0 * 0.6, Math.sin(a) * rr0 * 0.6); c.lineTo(Math.cos(a) * rr0, Math.sin(a) * rr0); c.stroke(); c.fillStyle = "#F6D46A"; c.beginPath(); c.arc(Math.cos(a) * rr0, Math.sin(a) * rr0, R0 * 0.02, 0, 6.28); c.fill(); }
    } else if (d.det === "melon") {
      c.fillStyle = "#E9C878"; c.beginPath(); c.ellipse(0, 0, R0 * 0.42, R0 * 0.32, 0, 0, 6.28); c.fill();
      c.fillStyle = "#FFF6DA"; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; c.save(); c.translate(Math.cos(a) * R0 * 0.3, Math.sin(a) * R0 * 0.22); c.rotate(a); c.beginPath(); c.ellipse(0, 0, R0 * 0.06, R0 * 0.025, 0, 0, 6.28); c.fill(); c.restore(); }
    } else if (d.det === "bigseeds") {
      for (const [x, y, a] of [[-R0 * 0.16, 0, 0.4], [R0 * 0.16, 0.02, -0.4]]) { c.fillStyle = "#6A3A1A"; c.beginPath(); c.ellipse(x, y, R0 * 0.16, R0 * 0.22, a, 0, 6.28); c.fill(); c.fillStyle = "rgba(255,230,200,0.5)"; c.beginPath(); c.ellipse(x - R0 * 0.04, y - R0 * 0.08, R0 * 0.05, R0 * 0.03, a, 0, 6.28); c.fill(); }
    }
  }
  /* meitat: 0 = la de dalt (cara plana a baix), 1 = la de baix */
  function paintHalf(c, name, r, which) {
    const im=Art.fruitCell("fruit-cut",Object.keys(FR).indexOf(name),240,240);
    if(im){c.save();c.beginPath();c.rect(-r*1.25,which===0?-r*1.25:0,r*2.5,r*1.25);c.clip();c.drawImage(im,-r*1.2,-r*1.2,r*2.4,r*2.4);c.restore();return;}
    const d = FR[name], sh = d.shape;
    c.save(); c.beginPath(); if (which === 0) c.rect(-r * 2, -r * 2, r * 4, r * 2); else c.rect(-r * 2, 0, r * 4, r * 2); c.clip();
    c.save(); shapePath(c, sh, r); c.fillStyle = shade(d.skin, -0.1); c.fill(); c.clip();
    // pell vista en secció
    const k1 = d.det === "coco" ? 0.86 : 0.9, k2 = d.pith ? (d.det === "seeds" ? 0.8 : 0.84) : 0.88;
    if (d.pith) { c.save(); c.scale(k1, k1); shapePath(c, sh, r); c.fillStyle = d.pith; c.fill(); c.restore(); }
    c.save(); c.scale(k2, k2); shapePath(c, sh, r); c.fillStyle = d.det === "coco" ? d.pith : d.flesh; c.fill(); c.clip();
    const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); g.addColorStop(0, "rgba(255,255,255,0.22)"); g.addColorStop(1, "rgba(0,0,0,0.12)"); c.fillStyle = g; c.fillRect(-r * 2, -r * 2, r * 4, r * 4);
    paintFlesh(c, d, r * 0.95);
    c.restore();
    paperGrain(c, r);
    c.restore();
    c.save(); shapePath(c, sh, r); c.strokeStyle = rgba("#2a1608", 0.45); c.lineWidth = r * 0.035; c.stroke(); c.restore();
    // reflex humit
    c.fillStyle = "rgba(255,255,255,0.55)"; c.beginPath(); c.ellipse(-r * 0.3, which === 0 ? -r * 0.45 : r * 0.35, r * 0.2, r * 0.06, -0.3, 0, 6.28); c.fill();
    c.restore();
    // vora del tall: línia clara
    c.save(); c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = r * 0.03; c.beginPath(); c.moveTo(-r * 0.95, 0); c.lineTo(r * 0.95, 0); c.stroke(); c.restore();
  }
  const SR = 100; // radi de referència dels sprites
  const wholeSpr = name => Sprites.get("g8w" + name, SR * 2.6, SR * 3.0, (c, w, h) => { c.translate(w / 2, h / 2 + SR * 0.2); paintWhole(c, name, SR); });
  const halfSpr = (name, which) => Sprites.get("g8h" + name + which, SR * 2.6, SR * 2.6, (c, w, h) => { c.translate(w / 2, h / 2); paintHalf(c, name, SR, which); });
  const shadowSpr = () => Sprites.get("g8sh", 200, 200, (c) => { const g = c.createRadialGradient(100, 100, 10, 100, 100, 96); g.addColorStop(0, "rgba(10,4,0,0.5)"); g.addColorStop(1, "rgba(10,4,0,0)"); c.fillStyle = g; c.fillRect(0, 0, 200, 200); });
  const bombSpr = () => Sprites.get("g8bomb", 260, 280, (c, w, h) => {
    c.translate(w / 2, h / 2 + 20); const r = SR;
    const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r * 1.1); g.addColorStop(0, "#5A6A7A"); g.addColorStop(0.5, "#252B33"); g.addColorStop(1, "#0C0E12"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.28); c.fill();
    gouache(c, "#2A3038", r, 77, 18);
    c.fillStyle = "rgba(255,255,255,0.65)"; c.beginPath(); c.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.1, -0.7, 0, 6.28); c.fill();
    c.fillStyle = "#3C444E"; rr(c, -r * 0.28, -r * 1.12, r * 0.56, r * 0.26, r * 0.06); c.fill(); c.strokeStyle = "#11151a"; c.lineWidth = 3; c.stroke();
    c.strokeStyle = "#B88A50"; c.lineWidth = r * 0.07; c.lineCap = "round"; c.beginPath(); c.moveTo(0, -r * 1.1); c.quadraticCurveTo(r * 0.1, -r * 1.4, r * 0.38, -r * 1.36); c.stroke();
    c.strokeStyle = "rgba(90,60,20,0.6)"; c.lineWidth = r * 0.02; c.setLineDash([4, 5]); c.stroke();
  });
  /* fons: paret de taulons foscos, llum càlida i la taula de fusta */
  const bgSpr = () => Sprites.get("g8bg", W, H, (c) => {
    if(Art.get("fruit-bg")){c.drawImage(Art.get("fruit-bg"),0,0,W,H);return;}
    c.fillStyle = c.createPattern(Tex.wood(1600, 760, "#4A2D1B", { seed: 21, vertical: true }), "repeat"); c.fillRect(0, 0, W, TABLE_Y);
    c.fillStyle = "rgba(0,0,0,0.35)"; for (let x = 0; x < W; x += 200) c.fillRect(x, 0, 4, TABLE_Y);
    c.fillStyle = "rgba(255,210,150,0.07)"; for (let x = 4; x < W; x += 200) c.fillRect(x, 0, 2, TABLE_Y);
    const sp = c.createRadialGradient(800, 260, 60, 800, 360, 900); sp.addColorStop(0, "rgba(255,200,130,0.28)"); sp.addColorStop(0.5, "rgba(255,170,90,0.08)"); sp.addColorStop(1, "rgba(0,0,0,0.45)"); c.fillStyle = sp; c.fillRect(0, 0, W, TABLE_Y);
    // superfície de la taula (en perspectiva) i cantell frontal
    c.fillStyle = c.createPattern(Tex.wood(1600, 140, "#6B3F22", { seed: 22 }), "repeat"); c.fillRect(0, TABLE_Y, W, H - TABLE_Y);
    const tg = c.createLinearGradient(0, TABLE_Y, 0, TABLE_Y + 46); tg.addColorStop(0, "rgba(255,210,160,0.32)"); tg.addColorStop(1, "rgba(255,210,160,0.04)"); c.fillStyle = tg; c.fillRect(0, TABLE_Y, W, 46);
    c.fillStyle = "rgba(0,0,0,0.5)"; c.fillRect(0, TABLE_Y - 3, W, 4);
    c.fillStyle = "rgba(255,225,180,0.4)"; c.fillRect(0, TABLE_Y + 1, W, 2);
    const fg = c.createLinearGradient(0, TABLE_Y + 46, 0, H); fg.addColorStop(0, "rgba(0,0,0,0.25)"); fg.addColorStop(0.08, "rgba(0,0,0,0.05)"); fg.addColorStop(1, "rgba(0,0,0,0.55)"); c.fillStyle = fg; c.fillRect(0, TABLE_Y + 46, W, H - TABLE_Y - 46);
    c.fillStyle = "rgba(255,220,170,0.3)"; c.fillRect(0, TABLE_Y + 46, W, 2);
    // taula de tallar amb un ganivet (esquerra) i bol de fruita (dreta), sobre el tauler
    c.save(); c.translate(150, TABLE_Y + 22); c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 16; c.shadowOffsetY = 6;
    rr(c, -110, -18, 240, 34, 10); c.fillStyle = "#C99A5E"; c.fill(); c.shadowColor = "transparent";
    c.fillStyle = c.createPattern(Tex.wood(256, 64, "#C99A5E", { seed: 31 }), "repeat"); rr(c, -110, -18, 240, 26, 10); c.fill();
    c.fillStyle = "rgba(255,240,210,0.35)"; c.fillRect(-100, -17, 220, 3);
    c.fillStyle = "#D8DCE0"; c.beginPath(); c.moveTo(-40, -24); c.lineTo(110, -30); c.quadraticCurveTo(130, -28, 112, -22); c.lineTo(-40, -18); c.closePath(); c.fill(); c.fillStyle = "rgba(255,255,255,0.7)"; c.fillRect(-36, -26, 140, 2);
    rr(c, -96, -27, 58, 12, 5); c.fillStyle = "#2B1A10"; c.fill();
    c.restore();
    c.save(); c.translate(1420, TABLE_Y + 10);
    for (const [n, x, y, s] of [["taronja", -60, -40, 0.42], ["poma", 10, -52, 0.44], ["pera", 66, -46, 0.4], ["llimona", -14, -20, 0.36]]) { const sp2 = wholeSpr(n); c.drawImage(sp2.c, x - sp2.w * s / 2, y - sp2.h * s / 2, sp2.w * s, sp2.h * s); }
    c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 14; c.shadowOffsetY = 6;
    c.beginPath(); c.moveTo(-120, -14); c.quadraticCurveTo(0, 70, 120, -14); c.closePath(); const bg2 = c.createLinearGradient(0, -14, 0, 40); bg2.addColorStop(0, "#F3EDE0"); bg2.addColorStop(1, "#BDB2A0"); c.fillStyle = bg2; c.fill(); c.shadowColor = "transparent";
    c.strokeStyle = "#2E6E8E"; c.lineWidth = 6; c.beginPath(); c.moveTo(-104, 2); c.quadraticCurveTo(0, 46, 104, 2); c.stroke();
    c.fillStyle = "#E8E0D0"; c.beginPath(); c.ellipse(0, -14, 120, 9, 0, 0, 6.28); c.fill();
    c.restore();
    drawGrainOverlay(c, 0.06, 9);
  });

  Games.register({
    id: 8, key: "f", name: "Talla fruita", zone: "costa", music: "perc", demoTime: 9,
    collect: { one: "fruita exòtica", many: "fruites exòtiques" },
    goal: l => l <= 3 ? "Escriu la lletra de cada fruita per tallar-la. No toquis les bombes!" : l === 4 ? "Escriu la síl·laba de cada fruita per tallar-la. No toquis les bombes!" : l === 5 ? "Escriu el nom de cada fruita per tallar-la." : "Les fruites grans tenen dues paraules: escriu-les per partir-les.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      ctx.fillStyle = ctx.createPattern(Tex.wood(256, 256, "#4A2D1B", { seed: 21, vertical: true }), "repeat"); ctx.fillRect(0, 0, w, h); const sp = ctx.createRadialGradient(w / 2, h * 0.3, 10, w / 2, h / 2, Math.max(w, h)); sp.addColorStop(0, "rgba(255,200,130,0.25)"); sp.addColorStop(1, "rgba(0,0,0,0.4)"); ctx.fillStyle = sp; ctx.fillRect(0, 0, w, h);
      const s = Math.min(w / 300, h / 200); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      const bob = Math.sin(t * 2) * 4;
      const ha = halfSpr("síndria", 0), hb = halfSpr("síndria", 1), k = 0.48;
      Sprites.draw(ctx, ha, -78, -26 + bob, { s: k, rot: -0.35 }); Sprites.draw(ctx, hb, -50, 26 - bob, { s: k, rot: -0.35 });
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineCap = "round"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-150, 30); ctx.lineTo(10, -30); ctx.stroke(); ctx.lineWidth = 16; ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.stroke(); ctx.restore();
      const o = wholeSpr("taronja"); Sprites.draw(ctx, o, 80, -10 - bob, { s: 0.5, rot: Math.sin(t) * 0.2 });
      drawPlate(ctx, "f", 80, -6 - bob, { size: 64, shadowBlur: 8 });
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#F0506A" : "#FFB030"; ctx.beginPath(); ctx.arc(-60 + i * 14, 60 + (i % 3) * 6, 5, 0, 6.28); ctx.fill(); }
      ctx.restore();
    },
    create(api) {
      const L = api.level;
      const P = [null,
        { goal: 24, time: 60, maxN: 2, gap: 2.2, T: 5.6, r: 96, bomb: 0 },
        { goal: 26, time: 60, maxN: 3, gap: 1.9, T: 5.2, r: 94, bomb: 0.12 },
        { goal: 30, time: 60, maxN: 3, gap: 1.7, T: 5.0, r: 94, bomb: 0.15 },
        { goal: 20, time: 75, maxN: 2, gap: 2.5, T: 7.0, r: 98, bomb: 0.12 },
        { goal: 12, time: 90, maxN: 2, gap: 3.4, T: 9.5, r: 104, bomb: 0.1 },
        { goal: 8, time: 90, maxN: 1, gap: 2.0, T: 13, r: 150, bomb: 0.08 }][L];
      const pool = L === 5 ? api.pool({ theme: "fruita", filter: w => !!FR[w] }) : L === 6 ? api.pool({ theme: "fruita", filter: w => !w.includes(" ") }) : api.pool({});
      const fruits = [], halves = [], splats = [], pops = [];
      const st = { cuts: 0, time: P.time, combo: 0, spawnT: 0.2, done: false, endT: 0, slash: [] };
      api.hud.progress = [0, P.goal]; api.hud.timer = P.time;
      const live = () => fruits.filter(f => !f.gone && !f.whole);
      const firstLetters = () => { const s = []; for (const f of live()) for (const p of f.parts) if (!p.done && !p.dead) s.push(p.text); return s; };
      function launch(o) {
        const T = P.T / api.speed, apex = L === 6 ? rand(270, 330) : rand(230, 340), h = (TABLE_Y + 60) - apex, g = 8 * h / (T * T), vy = -Math.sqrt(2 * g * h);
        const x = rand(260, W - 260), tx = clamp(x + rand(-260, 260), 240, W - 240), vx = (tx - x) / T;
        return Object.assign({ x, y: TABLE_Y + 60, vx, vy, g, rot: rand(-0.3, 0.3), vr: rand(-0.6, 0.6), age: 0, parts: [], gone: false }, o);
      }
      function spawn() {
        const ex = firstLetters(), bombs = fruits.filter(f => f.bomb && !f.gone).length;
        if (P.bomb && bombs === 0 && fruits.length > 0 && Math.random() < P.bomb && !api.demo) {
          const lp = (L <= 3 ? LETTERS[L] : LETTERS[3]).filter(ch => !ex.some(t => t[0] === ch) && /[a-z]/.test(ch));
          if (lp.length) { const f = launch({ bomb: true, r: 74 }); f.parts.push({ text: pick(lp), fruit: f, bombPart: true }); fruits.push(f); return; }
        }
        if (L === 6) {
          const [a, b] = pool.many(2, ex); const f = launch({ name: pick(BIG), r: P.r, big: true, vr: rand(-0.08, 0.08), rot: rand(-0.05, 0.05) });
          f.parts.push({ text: a, fruit: f, side: 0 }, { text: b, fruit: f, side: 1 }); fruits.push(f); return;
        }
        const item = pool.next(ex), name = L === 5 && FR[item] ? item : pick(ANY);
        const f = launch({ name, r: P.r * (FR[name].s || 1) }); f.parts.push({ text: item, fruit: f, side: -1 }); fruits.push(f);
      }
      /* temps fins que la fruita torna a amagar-se sota la taula */
      const timeLeft = f => { const dy = EXIT_Y - f.y, a = f.g * 0.5; return (-f.vy + Math.sqrt(Math.max(0, f.vy * f.vy + 4 * a * dy))) / (2 * a); };
      const platePos = p => { const f = p.fruit; if (p.side === -1) return [f.x, f.y]; return [f.x, f.y + (p.side === 0 ? -1 : 1) * f.r * 0.42]; };
      const visible = p => { const [, py] = platePos(p); return py < TABLE_Y - 30 && py + 50 > 0; };
      const typer = api.typer({
        targets: () => { const out = []; for (const f of fruits) if (!f.gone && !f.whole && !f.bomb) for (const p of f.parts) if (!p.done && visible(p)) out.push(p); return out; },
        rank: p => timeLeft(p.fruit) + (p.side === 1 ? 0.01 : 0),
        onStep: () => Sfx.play("tick"),
        onDone: p => cut(p),
        onMiss: p => { st.combo = 0; if (p && L <= 3 && !p.fruit.big) dropWhole(p.fruit); },
      });
      function dropWhole(f) { f.whole = true; f.vy = Math.max(f.vy, 120); f.g = Math.max(f.g, 900); f.vr = rand(-2, 2); Sfx.play("thud"); }
      function cut(p) {
        const f = p.fruit, d = FR[f.name], [px, py] = platePos(p);
        const ang = f.big ? f.rot : rand(-0.6, 0.6);
        st.slash.push({ x: px, y: py, a: ang, len: f.r * 2.9, t: 0 });
        Sfx.play("cut"); setTimeout(() => Sfx.play("splash"), 60);
        st.combo++; st.cuts++; api.hud.progress = [st.cuts, P.goal];
        if (st.combo >= 3) { pops.push({ x: px, y: py - f.r - 20, txt: `Combo ×${st.combo}!`, t: 0 }); Sfx.play("note", { note: 72 + Math.min(12, st.combo * 2), d: 0.25, type: "triangle", v: 0.16 }); }
        const nx = -Math.sin(ang), ny = Math.cos(ang);
        if (!f.big) {
          for (const w of [0, 1]) { const sgn = w === 0 ? -1 : 1; halves.push({ name: f.name, which: w, x: f.x + nx * sgn * 8, y: f.y + ny * sgn * 8, vx: f.vx * 0.4 + nx * sgn * 170 + rand(-30, 30), vy: Math.min(f.vy, 0) * 0.3 + ny * sgn * 170 - 180, rot: ang, vr: sgn * rand(1.5, 3), r: f.r }); }
          f.gone = true;
        } else {
          const w = p.side; halves.push({ name: f.name, which: w, x: f.x, y: f.y + (w === 0 ? -6 : 6), vx: (w === 0 ? -1 : 1) * rand(120, 200), vy: w === 0 ? -260 : 60, rot: f.rot, vr: (w === 0 ? -1 : 1) * rand(1, 2), r: f.r });
          f.cutSide = (f.cutSide || []).concat([w]);
          if (f.parts.every(q => q.done)) f.gone = true; else { f.half = 1 - w; const up = f.y - 300; f.vy = up > 0 ? -Math.sqrt(2 * f.g * up) : Math.min(f.vy, -40); }
        }
        const jc = d.juice;
        api.particles.emit(px, py, { count: 22, color: [jc, shade(jc, -0.2), "#fff"], speed: 420, gravity: 900, size: 11, life: 0.75, drag: 0.97 });
        if (splats.length > 12) splats.shift();
        splats.push({ x: px + rand(-40, 40), y: py + rand(-30, 30), r: f.r * rand(0.6, 0.9), col: jc, seed: randi(1, 999), t: 0, drips: [rand(-0.5, -0.1), rand(0.1, 0.5)].map(o => ({ o, l: 0, max: rand(20, 70) })), dots: Array.from({ length: 7 }, () => [rand(0, 6.28), rand(1.15, 1.7), rand(3, 9)]) });
        if (st.cuts >= P.goal && !st.done) { st.done = true; st.endT = 0; }
      }
      function explode(f) {
        f.gone = true; st.combo = 0; Sfx.play("boom"); api.shake(10);
        api.particles.emit(f.x, f.y, { count: 26, color: ["#FFB347", "#FF7A3A", "#FFE08A"], speed: 520, gravity: 300, size: 12, life: 0.6, shape: "spark" });
        api.particles.emit(f.x, f.y, { count: 14, color: ["#3A3A3A", "#5A5552", "#2A2624"], speed: 160, gravity: -60, size: 46, life: 1.2, drag: 0.94 });
      }
      spawn(); st.spawnT = 1.0;
      return {
        expected() { return st.done ? null : typer.expected(); },
        onKey(k) {
          if (st.done || k.length !== 1) return;
          if (!typer.current()) {
            const T = typer.live(), ok = T.some(p => p.text[0] === k);
            const bomb = fruits.find(f => f.bomb && !f.gone && f.parts[0].text === k && visible(f.parts[0]));
            if (!ok && bomb) { const e = typer.expected(); explode(bomb); api.miss(e, k, { sfx: false }); return; }
          }
          typer.key(k);
        },
        update(dt) {
          if (!st.done) { st.time -= dt; api.hud.timer = Math.max(0, st.time); if (st.time <= 0 && !api.demo) { st.done = true; st.fail = true; st.endT = 0; } }
          else { st.endT += dt; if (st.endT > (st.fail ? 0.6 : 1.1) && !st.finished) { st.finished = true; api.finish(!st.fail, { collectName: pick(EXOTIC) }); } }
          // aparicions: sempre hi ha alguna fruita a l'aire
          st.spawnT -= dt * api.speed;
          const n = fruits.filter(f => !f.gone && !f.whole && !f.bomb).length, vis = typer.live().length;
          if (!st.done && n < P.maxN && (st.spawnT <= 0 || vis === 0 && st.spawnT < P.gap * 0.6)) { spawn(); st.spawnT = P.gap * rand(0.85, 1.15); }
          const lock = typer.current();
          for (const f of fruits) {
            const locked = lock && lock.fruit === f;
            if (locked) { const ty = clamp(f.y, 220, f.big ? 400 : 480); f.vy = lerp(f.vy, (ty - f.y) * 1.5, 1 - Math.pow(0.03, dt)); }
            else f.vy += f.g * dt;
            f.x += f.vx * dt * (locked ? 0.3 : 1); f.y += f.vy * dt; f.rot += f.vr * dt; f.age += dt;
            if (f.y > EXIT_Y + f.r && f.vy > 0) f.gone = true;
            if (f.bomb) f.fuse = (f.fuse || 0) + dt;
          }
          for (let i = fruits.length - 1; i >= 0; i--) if (fruits[i].gone) fruits.splice(i, 1);
          for (let i = halves.length - 1; i >= 0; i--) { const h = halves[i]; h.vy += 1100 * dt; h.x += h.vx * dt; h.y += h.vy * dt; h.rot += h.vr * dt; if (h.y > H + 200) halves.splice(i, 1); }
          for (let i = splats.length - 1; i >= 0; i--) { const s = splats[i]; s.t += dt; s.drips.forEach(d => d.l = Math.min(d.max, d.l + dt * 30)); if (s.t > 3.2) splats.splice(i, 1); }
          for (let i = st.slash.length - 1; i >= 0; i--) { st.slash[i].t += dt; if (st.slash[i].t > 0.3) st.slash.splice(i, 1); }
          for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 1.1) pops.splice(i, 1); }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bgSpr().c, 0, 0, W, H);
          // esquitxades de suc a la paret que s'esvaeixen
          for (const s of splats) {
            const a = s.t < 0.1 ? s.t / 0.1 : 1 - clamp((s.t - 1.6) / 1.6, 0, 1); if (s.y > TABLE_Y) continue;
            ctx.save(); ctx.globalAlpha = 0.55 * a; ctx.fillStyle = s.col;
            blobPath(ctx, s.x, s.y, s.r * Ease.outCubic(clamp(s.t / 0.15, 0, 1)), s.seed, 0.32, 11); ctx.fill();
            s.drips.forEach(d => { const dx = s.x + d.o * s.r, y1 = s.y + s.r * 0.55 + d.l; ctx.beginPath(); ctx.moveTo(dx - 7, s.y + s.r * 0.3); ctx.quadraticCurveTo(dx - 3, y1 - 10, dx - 3.5, y1); ctx.arc(dx, y1, 4.5, 3.14, 0, true); ctx.quadraticCurveTo(dx + 3, y1 - 10, dx + 7, s.y + s.r * 0.3); ctx.fill(); });
            s.dots.forEach(([a, d, r]) => { ctx.beginPath(); ctx.arc(s.x + Math.cos(a) * s.r * d, s.y + Math.sin(a) * s.r * d, r, 0, 6.28); ctx.fill(); });
            ctx.restore();
          }
          // ombres a la paret
          const shd = shadowSpr();
          for (const f of fruits) if (f.y < TABLE_Y + 40) ctx.drawImage(shd.c, f.x + 26 - f.r * 1.15, f.y + 34 - f.r * 1.15, f.r * 2.3, f.r * 2.3);
          // meitats que cauen (darrere la taula)
          for (const h of halves) Sprites.draw(ctx, halfSpr(h.name, h.which), h.x, h.y, { s: h.r / SR, rot: h.rot });
          for (const f of fruits) {
            if (f.bomb) { Sprites.draw(ctx, bombSpr(), f.x, f.y - 20 * f.r / SR, { s: f.r / SR, rot: f.rot * 0.3 }); continue; }
            const s = f.r / SR;
            if (f.big && f.half != null) Sprites.draw(ctx, halfSpr(f.name, f.half), f.x, f.y, { s, rot: f.rot });
            else Sprites.draw(ctx, wholeSpr(f.name), f.x, f.y, { s, rot: f.rot, ay: (SR * 1.5 + SR * 0.2) / (SR * 3.0) });
          }
          // la taula tapa el que queda per sota del tauler
          ctx.drawImage(bgSpr().c, 0, TABLE_Y * 2, W * 2, (H - TABLE_Y) * 2, 0, TABLE_Y, W, H - TABLE_Y);
          // traç de llum blanca del tall
          for (const sl of st.slash) {
            const k = sl.t / 0.3, grow = Ease.outCubic(clamp(k * 2.2, 0, 1)), fade = 1 - clamp((k - 0.4) / 0.6, 0, 1);
            ctx.save(); ctx.translate(sl.x, sl.y); ctx.rotate(sl.a); ctx.globalCompositeOperation = "lighter";
            const x0 = -sl.len / 2, x1 = x0 + sl.len * grow;
            ctx.fillStyle = `rgba(255,255,255,${0.95 * fade})`; ctx.beginPath(); ctx.moveTo(x0, 0); ctx.quadraticCurveTo((x0 + x1) / 2, -5, x1, 0); ctx.quadraticCurveTo((x0 + x1) / 2, 5, x0, 0); ctx.fill();
            ctx.fillStyle = `rgba(255,245,220,${0.25 * fade})`; ctx.beginPath(); ctx.ellipse((x0 + x1) / 2, 0, (x1 - x0) / 2, 16, 0, 0, 6.28); ctx.fill();
            ctx.restore();
          }
          // espurna de la metxa de la bomba
          for (const f of fruits) if (f.bomb) { const s = f.r / SR, fx = f.x + 0.38 * SR * s, fy = f.y - 1.36 * SR * s, fl = 0.75 + 0.25 * Math.sin(f.fuse * 9); ctx.save(); ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 26 * fl); g.addColorStop(0, "rgba(255,240,180,0.95)"); g.addColorStop(0.4, "rgba(255,160,60,0.5)"); g.addColorStop(1, "rgba(255,120,40,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 26, 0, 6.28); ctx.fill(); ctx.restore(); }
          // plaques (sempre dretes, damunt de tot)
          const lock = typer.current();
          for (const f of fruits) for (const p of f.parts) {
            if (p.done) continue; const [px, py] = platePos(p); if (py > TABLE_Y + 30) continue;
            const a = clamp((TABLE_Y - 30 - py) / 50, 0, 1); if (a <= 0) continue;
            const size = p.text.length === 1 ? 64 : L === 6 ? 46 : 50;
            if (f.bomb) drawPlate(ctx, p.text, px, py, { size: 64, state: "bad", alpha: a });
            else drawPlate(ctx, p.text, px, py, { size, progress: p.typed || 0, state: p === lock ? "active" : null, alpha: a });
          }
          for (const p of pops) { const k = p.t / 1.1; ctx.save(); ctx.globalAlpha = 1 - Ease.inCubic(k); text(ctx, p.txt, p.x, p.y - k * 50, { size: 40, weight: 900, font: FONT_T, color: "#FFE08A", stroke: "#5A2A0A", lw: 8 }); ctx.restore(); }
          drawVignette(ctx, 0.35, "20,8,0");
        },
      };
    },
  });
})();
