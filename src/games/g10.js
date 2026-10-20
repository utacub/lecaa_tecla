"use strict";
/* 10. Pesca a l'estany — aquarel·la, aigua animada amb càustiques i reflexos */
(() => {
  const INK = "#2E3A3A";
  /* ---------- espècies (pintades a mà amb paràmetres) ----------
     forma: fish | eel | horse ; mida relativa ; esquena, panxa ; dibuix: plain spots bands stripes wavy scales mottled dotrow ; aletes */
  const F = (name, o) => Object.assign({ name, shape: "fish", size: 1, h: 0.36, back: "#7A8A8A", belly: "#E8E8E0", pat: "plain", pc: "#3A3A3A", fin: "#8A9A9A", tail: "fork" }, o);
  const PONDS = {
    estany: {
      name: "l'estany", water: "#3E9A86", deep: "#1E5A56", bottom: "#9A9468", sky: "#CFE6E8",
      species: [
        F("carpa", { back: "#B8862E", belly: "#F0D9A0", pat: "scales", pc: "#8A5E1E", fin: "#C0703A", h: 0.4, size: 1.15, barbels: true }),
        F("tenca", { back: "#4E6A32", belly: "#C9B860", fin: "#3E5228", tail: "round", h: 0.34, redEye: true }),
        F("perca", { back: "#8E9C3E", belly: "#E8E0B0", pat: "bands", pc: "#3A4422", fin: "#E0602E", h: 0.38 }),
        F("gardí", { back: "#8A9888", belly: "#F0F0E8", fin: "#D8452E", h: 0.38 }),
        F("carpí", { back: "#EE7E26", belly: "#F8C878", fin: "#F09A3E", h: 0.42, size: 0.8, tail: "veil" }),
        F("lluç de riu", { back: "#5E7A3A", belly: "#E0E0B0", pat: "spots", pc: "#D8D89A", fin: "#7A8A3A", h: 0.2, size: 1.3, snout: true }),
        F("peix gat", { back: "#4E4236", belly: "#B8A890", fin: "#3E342A", tail: "round", h: 0.3, barbels: "long" }),
        F("gambúsia", { back: "#8E9696", belly: "#E8E8E0", fin: "#9AA0A0", size: 0.6, tail: "round" }),
        F("bagra", { back: "#5E7488", belly: "#E8ECF0", fin: "#8E9AA8", h: 0.3 }),
        F("madrilleta", { back: "#7E8E8A", belly: "#F0F0EA", fin: "#E8903E", size: 0.75, redEye: true }),
        F("anguila", { shape: "eel", back: "#4A4A2E", belly: "#D8C878", fin: "#5A5A3A", size: 1.3 }),
        F("espinós", { back: "#6A8A4A", belly: "#D8452E", fin: "#7A9A5A", size: 0.6, spines: true }),
      ],
    },
    riu: {
      name: "el riu", water: "#5E9AA8", deep: "#2E5E6E", bottom: "#9A9078", sky: "#D6EAF0", flow: true,
      species: [
        F("truita", { back: "#8A7A4A", belly: "#F0E0B8", pat: "spots", pc: "#C8402E", fin: "#9A8A5A", h: 0.32, dark: true }),
        F("salmó", { back: "#6E8090", belly: "#F0C8C0", pat: "spots", pc: "#2A3038", fin: "#8A98A0", h: 0.32, size: 1.2 }),
        F("barb", { back: "#9A8040", belly: "#E8D8A8", fin: "#B07A4A", h: 0.3, barbels: true }),
        F("bagra", { back: "#5E7488", belly: "#E8ECF0", fin: "#8E9AA8", h: 0.3 }),
        F("esturió", { back: "#6A7A7E", belly: "#D8DCD8", pat: "dotrow", pc: "#E8E8E0", fin: "#5A6A6E", h: 0.22, size: 1.4, snout: true, tail: "shark" }),
        F("llop de riu", { back: "#8A7A52", belly: "#E0D0A8", pat: "mottled", pc: "#5A4A2E", fin: "#8A7A5A", h: 0.2, size: 0.7, barbels: true, tail: "round" }),
        F("bavosa de riu", { back: "#7E7044", belly: "#D8C890", pat: "mottled", pc: "#4A3E22", fin: "#8A7A4A", h: 0.28, size: 0.7, tail: "round" }),
        F("anguila", { shape: "eel", back: "#4A4A2E", belly: "#D8C878", fin: "#5A5A3A", size: 1.3 }),
        F("madrilleta", { back: "#7E8E8A", belly: "#F0F0EA", fin: "#E8903E", size: 0.75, redEye: true }),
        F("gardí", { back: "#8A9888", belly: "#F0F0E8", fin: "#D8452E", h: 0.38 }),
        F("carpa", { back: "#B8862E", belly: "#F0D9A0", pat: "scales", pc: "#8A5E1E", fin: "#C0703A", h: 0.4, size: 1.15, barbels: true }),
        F("espinós", { back: "#6A8A4A", belly: "#D8452E", fin: "#7A9A5A", size: 0.6, spines: true }),
      ],
    },
    mar: {
      name: "el mar", water: "#2EB0C0", deep: "#16729A", bottom: "#EADAB0", sky: "#D8F0F4",
      species: [
        F("sardina", { back: "#2E6E9A", belly: "#E8F0F4", pat: "dotrow", pc: "#1E3E5A", fin: "#8AA8B8", h: 0.26, size: 0.8 }),
        F("verat", { back: "#2E7A70", belly: "#E8F0EC", pat: "wavy", pc: "#18302E", fin: "#6A9A90", h: 0.26 }),
        F("tonyina", { back: "#1E3A6A", belly: "#E0E6EE", fin: "#E8C83A", h: 0.34, size: 1.45, tail: "moon" }),
        F("llobarro", { back: "#7A8A98", belly: "#F0F2F4", fin: "#8A98A4", h: 0.32, size: 1.15 }),
        F("orada", { back: "#8A98A8", belly: "#F0F2F0", pat: "goldband", pc: "#E8C040", fin: "#7A8898", h: 0.44 }),
        F("sard", { back: "#9AA4AC", belly: "#F0F2F2", pat: "bands", pc: "#4A5058", fin: "#9AA4AC", h: 0.42 }),
        F("sarg", { back: "#A0A8A8", belly: "#F2F2EE", pat: "tailspot", pc: "#202428", fin: "#B0B8B0", h: 0.44 }),
        F("mabre", { back: "#B0B0A0", belly: "#F0F0E8", pat: "bands", pc: "#6A6A5A", fin: "#C8B888", h: 0.38 }),
        F("molla", { back: "#D86A5A", belly: "#F8D8C8", pat: "stripes", pc: "#E8B040", fin: "#E8907A", h: 0.3, size: 0.85, barbels: true }),
        F("lluç", { back: "#7A8490", belly: "#E8ECF0", fin: "#8A949E", h: 0.24, size: 1.25 }),
        F("gerret", { back: "#8A8E9A", belly: "#F0EEE8", pat: "dotrow", pc: "#3A3E48", fin: "#D89A6A", h: 0.28, size: 0.7 }),
        F("sorell", { back: "#3E7A8A", belly: "#E8F0F0", pat: "line", pc: "#1E3A44", fin: "#E8D070", h: 0.28 }),
      ],
    },
    fons: {
      name: "el fons marí", water: "#2896C8", deep: "#0E4A86", bottom: "#D8C8A0", sky: "#CFE8F4", deepSea: true,
      species: [
        F("rap", { back: "#7A5E3E", belly: "#C8B08A", pat: "mottled", pc: "#4A3622", fin: "#6A5236", h: 0.4, size: 1.3, tail: "round", angler: true }),
        F("aranya", { back: "#A89A5E", belly: "#E8E0C0", pat: "stripes", pc: "#5A4A2A", fin: "#2A2A2A", h: 0.26, spines: true }),
        F("castanyola", { back: "#4A3A3A", belly: "#6A5450", fin: "#3A2E2E", h: 0.44, size: 0.7 }),
        F("donzella", { back: "#2E9A9A", belly: "#E8F0E0", pat: "stripes", pc: "#F08A3E", fin: "#3EA8A0", h: 0.26, size: 0.8 }),
        F("serrà", { back: "#C08A6A", belly: "#F0D8C0", pat: "bands", pc: "#7A4A3A", fin: "#C89A7A", h: 0.36 }),
        F("tord", { back: "#5E9A5E", belly: "#E0E8C0", pat: "spots", pc: "#E86A4A", fin: "#6AA86A", h: 0.34 }),
        F("cavallet de mar", { shape: "horse", back: "#D8A040", belly: "#F0D080", fin: "#E8C070", size: 0.9 }),
        F("peix lluna", { back: "#8A949E", belly: "#D8DEE4", fin: "#7A8490", h: 0.8, size: 1.3, tail: "sun" }),
        F("escórpora", { back: "#C8503A", belly: "#F0A890", pat: "mottled", pc: "#7A2A1E", fin: "#D8604A", h: 0.4, tail: "round", spines: true }),
        F("morena", { shape: "eel", back: "#4A3A26", belly: "#4A3A26", pat: "spots", pc: "#E8D070", fin: "#4A3A26", size: 1.4 }),
        F("salpa", { back: "#8A8E7A", belly: "#E8E8DA", pat: "stripes", pc: "#E8C040", fin: "#9A9E8A", h: 0.36 }),
        F("déntol", { back: "#B89098", belly: "#F0E4E4", pat: "spots", pc: "#4A7AB8", fin: "#C8A0A8", h: 0.36, size: 1.25 }),
      ],
    },
  };
  const POND_BY_LEVEL = ["estany", "riu", "mar", "fons", "mar", "fons"];
  const LANES = [262, 402, 542], BOAT = [800, 820], TANK = [1296, 712, 284, 170], GOAL = 12;

  /* ---------- aquarel·la ---------- */
  function seamless(src) {
    const n = src.width, c = makeCanvas(n * 2, n * 2), x = c.getContext("2d");
    [[1, 1, 0, 0], [-1, 1, 2 * n, 0], [1, -1, 0, 2 * n], [-1, -1, 2 * n, 2 * n]].forEach(([sx, sy, tx, ty]) => { x.save(); x.translate(tx, ty); x.scale(sx, sy); x.drawImage(src, 0, 0); x.restore(); });
    return c;
  }
  const paperTile = () => Tex.get("g10paperS", () => seamless(Tex.paper(256, 256, "#e9e1d2", { seed: 47, fiber: 2.4 })));
  function wc(x, path, col, seed, o = {}) {
    const R = mulberry32(seed || 31);
    x.save();
    for (let k = 0; k < 3; k++) { x.save(); x.translate((R() - 0.5) * 3, (R() - 0.5) * 3); path(x); x.globalAlpha = o.a || 0.36; x.fillStyle = k === 2 ? shade(col, 0.15) : col; x.fill(); x.restore(); }
    path(x); x.clip();
    x.globalAlpha = 0.35; x.strokeStyle = shade(col, -0.32); x.lineWidth = o.edge || 3.5; if (!NOPAPER) x.filter = "blur(1.2px)"; path(x); x.stroke(); x.filter = "none";
    x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.4; if (!NOPAPER) { x.fillStyle = x.createPattern(paperTile(), "repeat"); x.setTransform(1, 0, 0, 1, 0, 0); x.fillRect(0, 0, x.canvas.width, x.canvas.height); }
    x.restore();
  }
  let NOPAPER = false; // les capes grans reben el gra una sola vegada al final
  const bake = (key, w, h, fn) => Tex.get(key, () => { const c = makeCanvas(w, h); NOPAPER = true; try { fn(c.getContext("2d"), w, h); } finally { NOPAPER = false; } return c; });
  const blob = (px, py, r, seed, wob = 0.2, n = 9) => c => blobPath(c, px, py, r, seed, wob, n);

  /* ---------- peix de perfil (salt, aquari) ---------- */
  function sideBody(c, L, h) {
    c.beginPath(); c.moveTo(L * 0.5, h * 0.04);
    c.bezierCurveTo(L * 0.46, -h * 0.4, L * 0.15, -h * 0.55, -L * 0.08, -h * 0.44);
    c.bezierCurveTo(-L * 0.24, -h * 0.34, -L * 0.33, -h * 0.14, -L * 0.38, -h * 0.1);
    c.lineTo(-L * 0.38, h * 0.1);
    c.bezierCurveTo(-L * 0.3, h * 0.18, -L * 0.2, h * 0.42, -L * 0.04, h * 0.45);
    c.bezierCurveTo(L * 0.18, h * 0.5, L * 0.44, h * 0.38, L * 0.5, h * 0.04); c.closePath();
  }
  function sideTail(c, L, h, type) {
    c.beginPath();
    if (type === "round" || type === "sun") { c.ellipse(-L * 0.44, 0, L * 0.09, h * (type === "sun" ? 0.4 : 0.3), 0, 0, 6.28); return; }
    if (type === "veil") { c.moveTo(-L * 0.36, -h * 0.05); c.bezierCurveTo(-L * 0.6, -h * 0.7, -L * 0.72, -h * 0.2, -L * 0.62, 0); c.bezierCurveTo(-L * 0.72, h * 0.2, -L * 0.6, h * 0.7, -L * 0.36, h * 0.05); c.closePath(); return; }
    const sp = type === "moon" ? 0.62 : type === "shark" ? 0.5 : 0.44, notch = type === "moon" ? 0.4 : 0.46;
    c.moveTo(-L * 0.36, -h * 0.07); c.lineTo(-L * 0.52, -h * sp); c.quadraticCurveTo(-L * notch, 0, -L * 0.52, h * (type === "shark" ? 0.25 : sp)); c.lineTo(-L * 0.36, h * 0.07); c.closePath();
  }
  function patternSide(x, sp, L, h, R) {
    x.fillStyle = sp.pc; x.strokeStyle = sp.pc;
    const p = sp.pat;
    if (p === "spots") for (let i = 0; i < 22; i++) { const px = (R() - 0.5) * L * 0.8, py = (R() - 0.6) * h * 0.7; x.globalAlpha = 0.85; x.beginPath(); x.arc(px, py, 2 + R() * 2.6, 0, 6.28); x.fill(); }
    if (p === "bands") { x.globalAlpha = 0.5; for (let i = 0; i < 6; i++) { const px = -L * 0.3 + i * L * 0.13; x.beginPath(); x.ellipse(px, -h * 0.1, L * 0.035, h * 0.45, 0.12, 0, 6.28); x.fill(); } }
    if (p === "stripes") { x.globalAlpha = 0.75; x.lineWidth = h * 0.08; for (const yy of [-0.12, 0.06]) { x.beginPath(); x.moveTo(L * 0.42, h * yy); x.quadraticCurveTo(0, h * (yy - 0.04), -L * 0.38, h * yy * 0.4); x.stroke(); } }
    if (p === "wavy") { x.globalAlpha = 0.8; x.lineWidth = 2.6; for (let i = 0; i < 9; i++) { const px = -L * 0.32 + i * L * 0.08; x.beginPath(); x.moveTo(px, -h * 0.48); x.quadraticCurveTo(px + 8, -h * 0.3, px - 2, -h * 0.08); x.stroke(); } }
    if (p === "scales") { x.globalAlpha = 0.45; x.lineWidth = 1.4; for (let i = 0; i < 9; i++) for (let j = -2; j <= 2; j++) { x.beginPath(); x.arc(-L * 0.3 + i * L * 0.075 + (j % 2) * L * 0.035, j * h * 0.15, L * 0.04, -1.2, 1.2); x.stroke(); } }
    if (p === "mottled") for (let i = 0; i < 14; i++) { x.globalAlpha = 0.45; blobPath(x, (R() - 0.5) * L * 0.8, (R() - 0.5) * h * 0.7, 4 + R() * 7, (R() * 99) | 0, 0.35, 7); x.fill(); }
    if (p === "dotrow") { x.globalAlpha = 0.85; for (let i = 0; i < 8; i++) { x.beginPath(); x.arc(L * 0.25 - i * L * 0.075, -h * 0.12, 2.6, 0, 6.28); x.fill(); } }
    if (p === "goldband") { x.globalAlpha = 0.9; x.lineWidth = 5; x.beginPath(); x.moveTo(L * 0.36, -h * 0.4); x.lineTo(L * 0.4, -h * 0.05); x.stroke(); }
    if (p === "tailspot") { x.globalAlpha = 0.9; x.beginPath(); x.arc(-L * 0.33, -h * 0.02, h * 0.1, 0, 6.28); x.fill(); x.globalAlpha = 0.25; for (let i = 0; i < 7; i++) { x.fillRect(-L * 0.25 + i * L * 0.08, -h * 0.5, 3, h); } }
    if (p === "line") { x.globalAlpha = 0.8; x.lineWidth = 2.4; x.beginPath(); x.moveTo(L * 0.3, -h * 0.2); x.quadraticCurveTo(0, -h * 0.25, -L * 0.1, -h * 0.02); x.lineTo(-L * 0.36, 0); x.stroke(); }
    x.globalAlpha = 1;
  }
  function sideSprite(sp) {
    const L = 160, h = L * sp.h;
    return Sprites.get("g10side_" + sp.name, 220, Math.max(120, h * 1.9 + 30), (x, w, hh) => {
      x.translate(w / 2 + 6, hh / 2);
      const R = mulberry32(sp.name.length * 31 + 7);
      if (sp.shape === "eel") {
        const body = c => { c.beginPath(); c.moveTo(L * 0.62, 0); c.bezierCurveTo(L * 0.4, -16, L * 0.1, 12, -L * 0.2, -8); c.bezierCurveTo(-L * 0.4, -18, -L * 0.6, 0, -L * 0.66, 2); c.bezierCurveTo(-L * 0.6, 8, -L * 0.4, -4, -L * 0.2, 8); c.bezierCurveTo(L * 0.1, 26, L * 0.4, 12, L * 0.62, 0); c.closePath(); };
        wc(x, body, sp.back, 3); x.save(); body(x); x.clip(); patternSide(x, sp, L * 1.2, 30, R); const g = x.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, "rgba(0,0,0,0.15)"); g.addColorStop(1, rgba(sp.belly, 0.45)); x.fillStyle = g; x.fillRect(-L, -40, 2 * L, 80); x.restore();
        x.save(); x.strokeStyle = INK; x.globalAlpha = 0.6; x.lineWidth = 1.4; body(x); x.stroke(); x.restore();
        return;
      }
      if (sp.shape === "horse") {
        const body = c => { c.beginPath(); c.moveTo(10, -56); c.bezierCurveTo(30, -60, 40, -44, 28, -36); c.lineTo(52, -30); c.lineTo(50, -22); c.lineTo(24, -24); c.bezierCurveTo(34, -6, 30, 20, 14, 34); c.bezierCurveTo(4, 44, 6, 58, 16, 60); c.bezierCurveTo(26, 62, 26, 50, 18, 50); c.bezierCurveTo(-10, 56, -14, 30, -6, 14); c.bezierCurveTo(2, -4, -12, -20, -6, -40); c.bezierCurveTo(-4, -50, 2, -55, 10, -56); c.closePath(); };
        wc(x, body, sp.back, 5); x.save(); body(x); x.clip(); x.strokeStyle = rgba("#8A5E1E", 0.5); x.lineWidth = 1.6; for (let i = -50; i < 60; i += 8) { x.beginPath(); x.moveTo(-20, i); x.lineTo(40, i + 4); x.stroke(); } x.restore();
        wc(x, c => { c.beginPath(); c.moveTo(-8, -10); c.quadraticCurveTo(-26, 0, -10, 12); c.closePath(); }, sp.fin, 6);
        x.save(); x.strokeStyle = INK; x.globalAlpha = 0.6; x.lineWidth = 1.5; body(x); x.stroke(); x.restore();
        return;
      }
      if (sp.spines || sp.pat === "x") { x.save(); x.strokeStyle = sp.fin; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(L * 0.18 - i * 14, -h * 0.45); x.lineTo(L * 0.2 - i * 14, -h * 0.85); x.stroke(); } x.restore(); }
      // aletes darrere del cos
      const dors = c => { c.beginPath(); c.moveTo(L * 0.14, -h * 0.47); c.quadraticCurveTo(-L * 0.02, -h * (sp.tail === "sun" ? 1.1 : 0.88), -L * 0.2, -h * 0.38); c.closePath(); };
      const anal = c => { c.beginPath(); c.moveTo(-L * 0.06, h * 0.44); c.quadraticCurveTo(-L * 0.16, h * (sp.tail === "sun" ? 1.05 : 0.68), -L * 0.26, h * 0.3); c.closePath(); };
      wc(x, dors, sp.fin, 8); wc(x, anal, sp.fin, 9);
      wc(x, c => sideTail(c, L, h, sp.tail), sp.fin, 10);
      if (sp.snout) wc(x, c => { c.beginPath(); c.moveTo(L * 0.45, -h * 0.1); c.lineTo(L * 0.66, 0); c.lineTo(L * 0.45, h * 0.14); c.closePath(); }, sp.back, 11);
      wc(x, c => sideBody(c, L, h), sp.back, 12);
      x.save(); sideBody(x, L, h); x.clip();
      const g = x.createLinearGradient(0, -h * 0.5, 0, h * 0.5); g.addColorStop(0, "rgba(0,0,0,0.1)"); g.addColorStop(0.45, rgba(sp.belly, 0.2)); g.addColorStop(0.7, rgba(sp.belly, 0.85)); g.addColorStop(1, rgba(sp.belly, 0.95)); x.fillStyle = g; x.fillRect(-L, -h, 2 * L, 2 * h);
      patternSide(x, sp, L, h, R);
      x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(L * 0.06, -h * 0.26, L * 0.22, h * 0.07, -0.05, 0, 6.28); x.fill();
      x.restore();
      wc(x, c => { c.beginPath(); c.ellipse(L * 0.16, h * 0.12, L * 0.09, h * 0.07, 0.5, 0, 6.28); }, sp.fin, 13);
      x.save(); x.strokeStyle = INK; x.globalAlpha = 0.65; x.lineWidth = 1.5; x.lineJoin = "round"; sideBody(x, L, h); x.stroke(); x.globalAlpha = 0.4; sideTail(x, L, h, sp.tail); x.stroke(); dors(x); x.stroke();
      x.globalAlpha = 0.55; x.beginPath(); x.arc(L * 0.36, 0, h * 0.34, 2.2, 4.0); x.stroke();
      x.beginPath(); x.moveTo(L * 0.5, h * 0.05); x.lineTo(L * 0.43, h * 0.1); x.stroke();
      if (sp.barbels) { x.lineWidth = 1.3; x.beginPath(); x.moveTo(L * 0.47, h * 0.12); x.quadraticCurveTo(L * 0.5, h * 0.4, L * (sp.barbels === "long" ? 0.62 : 0.52), h * (sp.barbels === "long" ? 0.55 : 0.36)); x.stroke(); }
      if (sp.angler) { x.lineWidth = 1.3; x.beginPath(); x.moveTo(L * 0.38, -h * 0.4); x.quadraticCurveTo(L * 0.55, -h * 0.9, L * 0.62, -h * 0.5); x.stroke(); x.fillStyle = "#F4E07A"; x.globalAlpha = 0.9; x.beginPath(); x.arc(L * 0.62, -h * 0.48, 4, 0, 6.28); x.fill(); }
      x.restore();
    });
  }
  const eyePos = sp => sp.shape === "eel" ? [160 * 0.5, -3] : sp.shape === "horse" ? [22, -46] : [160 * 0.36, -160 * sp.h * 0.12];
  function drawSide(ctx, sp, x, y, s, rot, flip, surprised) {
    const spr = sideSprite(sp);
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip * s, s);
    ctx.drawImage(spr.c, -spr.w / 2 - 6, -spr.h / 2, spr.w, spr.h);
    const [ex, ey] = eyePos(sp), er = surprised ? 9 : 6.5;
    ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(ex, ey, er, 0, 6.28); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = sp.redEye ? "#B8302A" : "#1A1A1E"; ctx.beginPath(); ctx.arc(ex + (surprised ? 0 : 1.2), ey, surprised ? 3.2 : 3.8, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex - 1, ey - 1.6, 1.3, 0, 6.28); ctx.fill();
    if (surprised && sp.shape !== "horse") { ctx.fillStyle = "#3A1E1E"; ctx.beginPath(); ctx.ellipse(160 * 0.48, 160 * (sp.h || 0.2) * 0.12, 4, 5, 0, 0, 6.28); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- peix vist des de dalt (dins l'aigua) ---------- */
  function topSprite(sp) {
    const L = 150, w = L * Math.max(0.16, sp.h * 0.62);
    return Sprites.get("g10top_" + sp.name, 200, 110, (x, cw, ch) => {
      x.translate(cw / 2 + 4, ch / 2);
      const R = mulberry32(sp.name.length * 17 + 3);
      if (sp.shape === "eel") {
        const body = c => { c.beginPath(); c.moveTo(L * 0.6, 0); c.bezierCurveTo(L * 0.5, -9, L * 0.2, -9, 0, -6); c.bezierCurveTo(-L * 0.3, -4, -L * 0.6, -2, -L * 0.68, 0); c.bezierCurveTo(-L * 0.6, 2, -L * 0.3, 4, 0, 6); c.bezierCurveTo(L * 0.2, 9, L * 0.5, 9, L * 0.6, 0); c.closePath(); };
        wc(x, body, sp.back, 4, { a: 0.55 }); if (sp.pat === "spots") { x.save(); body(x); x.clip(); x.fillStyle = sp.pc; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc((R() - 0.5) * L * 1.1, (R() - 0.5) * 8, 1.6, 0, 6.28); x.fill(); } x.restore(); }
        x.save(); x.strokeStyle = INK; x.globalAlpha = 0.5; x.lineWidth = 1.2; body(x); x.stroke(); x.restore();
        x.fillStyle = "#1A1A1E"; for (const s of [-1, 1]) { x.beginPath(); x.arc(L * 0.5, s * 4, 1.8, 0, 6.28); x.fill(); }
        return;
      }
      if (sp.shape === "horse") {
        // el cavallet de mar es veu de perfil fins i tot des de dalt (neda dret)
        x.scale(0.75, 0.75); x.rotate(-1.57);
        const body = c => { c.beginPath(); c.ellipse(0, 0, 50, 14, 0, 0, 6.28); };
        wc(x, body, sp.back, 4); x.fillStyle = sp.fin; x.globalAlpha = 0.6; x.beginPath(); x.ellipse(40, 0, 16, 10, 0, 0, 6.28); x.fill();
        return;
      }
      const body = c => { c.beginPath(); c.moveTo(L * 0.5, 0); c.bezierCurveTo(L * 0.48, -w * 0.5, L * 0.12, -w * 0.58, -L * 0.12, -w * 0.4); c.quadraticCurveTo(-L * 0.3, -w * 0.2, -L * 0.38, -w * 0.08); c.lineTo(-L * 0.38, w * 0.08); c.quadraticCurveTo(-L * 0.3, w * 0.2, -L * 0.12, w * 0.4); c.bezierCurveTo(L * 0.12, w * 0.58, L * 0.48, w * 0.5, L * 0.5, 0); c.closePath(); };
      const tail = c => { c.beginPath(); const sp2 = sp.tail === "veil" ? 1.1 : sp.tail === "round" || sp.tail === "sun" ? 0.6 : 0.75, ln = sp.tail === "veil" ? 0.66 : 0.56; c.moveTo(-L * 0.35, 0); c.quadraticCurveTo(-L * 0.46, -w * sp2, -L * ln, -w * sp2 * 0.95); c.quadraticCurveTo(-L * (ln - 0.06), 0, -L * ln, w * sp2 * 0.95); c.quadraticCurveTo(-L * 0.46, w * sp2, -L * 0.35, 0); c.closePath(); };
      const pect = s => c => { c.beginPath(); c.moveTo(L * 0.22, s * w * 0.32); c.quadraticCurveTo(L * 0.16, s * w * 0.95, L * 0.02, s * w * 0.8); c.quadraticCurveTo(L * 0.1, s * w * 0.5, L * 0.22, s * w * 0.32); c.closePath(); };
      wc(x, tail, sp.fin, 6, { a: 0.42 }); wc(x, pect(-1), sp.fin, 7, { a: 0.4 }); wc(x, pect(1), sp.fin, 8, { a: 0.4 });
      if (sp.snout) wc(x, c => { c.beginPath(); c.moveTo(L * 0.46, -w * 0.18); c.lineTo(L * 0.66, 0); c.lineTo(L * 0.46, w * 0.18); c.closePath(); }, sp.back, 9);
      wc(x, body, sp.back, 10, { a: 0.55 });
      x.save(); body(x); x.clip();
      const g = x.createLinearGradient(0, -w * 0.5, 0, w * 0.5); g.addColorStop(0, rgba(sp.belly, 0.35)); g.addColorStop(0.5, "rgba(0,0,0,0.12)"); g.addColorStop(1, rgba(sp.belly, 0.35)); x.fillStyle = g; x.fillRect(-L, -w, 2 * L, 2 * w);
      x.fillStyle = sp.pc;
      if (sp.pat === "spots" || sp.pat === "mottled") for (let i = 0; i < 16; i++) { x.globalAlpha = 0.7; x.beginPath(); x.arc((R() - 0.5) * L * 0.75, (R() - 0.5) * w * 0.8, 1.8 + R() * 2.4, 0, 6.28); x.fill(); }
      if (sp.pat === "bands" || sp.pat === "wavy" || sp.pat === "tailspot") { x.globalAlpha = 0.45; for (let i = 0; i < 6; i++) x.fillRect(-L * 0.3 + i * L * 0.12, -w, L * 0.035, 2 * w); }
      if (sp.pat === "stripes" || sp.pat === "dotrow" || sp.pat === "line") { x.globalAlpha = 0.6; for (const s of [-1, 1]) x.fillRect(-L * 0.35, s * w * 0.22 - 1.5, L * 0.8, 3); }
      if (sp.pat === "scales") { x.globalAlpha = 0.35; x.strokeStyle = sp.pc; x.lineWidth = 1.2; for (let i = 0; i < 8; i++) for (let j = -1; j <= 1; j++) { x.beginPath(); x.arc(-L * 0.28 + i * L * 0.08, j * w * 0.25, L * 0.04, -1.2, 1.2); x.stroke(); } }
      x.globalAlpha = 1; x.fillStyle = "rgba(255,255,255,0.3)"; x.beginPath(); x.ellipse(L * 0.1, -w * 0.12, L * 0.24, w * 0.08, 0, 0, 6.28); x.fill();
      x.restore();
      x.save(); x.strokeStyle = INK; x.globalAlpha = 0.55; x.lineWidth = 1.3; body(x); x.stroke(); x.globalAlpha = 0.3; tail(x); x.stroke(); x.restore();
      x.fillStyle = "#1A1A1E"; for (const s of [-1, 1]) { x.beginPath(); x.arc(L * 0.36, s * w * 0.27, 2.6, 0, 6.28); x.fill(); }
      if (sp.barbels) { x.strokeStyle = rgba(INK, 0.6); x.lineWidth = 1.2; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(L * 0.48, s * 3); x.quadraticCurveTo(L * 0.56, s * 8, L * (sp.barbels === "long" ? 0.64 : 0.58), s * 14); x.stroke(); } }
    });
  }
  function topShadow(sp) {
    const s = topSprite(sp);
    return Sprites.get("g10shadow_" + sp.name, s.w, s.h, (x, w, h) => { x.filter = "blur(4px) brightness(0)"; x.globalAlpha = 0.5; x.drawImage(s.c, 0, 0, w, h); x.filter = "none"; });
  }
  /* dibuixa el peix de dalt amb la cua ondulant (dues meitats) */
  function drawTop(ctx, sp, x, y, s, dir, wag, o = {}) {
    const spr = o.shadow ? topShadow(sp) : topSprite(sp), k = spr.c.width / spr.w, jx = spr.w / 2 + 4 - 150 * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    const ox = -spr.w / 2 - 4, oy = -spr.h / 2;
    ctx.drawImage(spr.c, jx * k, 0, (spr.w - jx) * k, spr.c.height, ox + jx, oy, spr.w - jx, spr.h);
    ctx.translate(ox + jx, 0); ctx.rotate(wag);
    ctx.drawImage(spr.c, 0, 0, (jx + 2) * k, spr.c.height, -jx, oy, jx + 2, spr.h);
    ctx.restore();
  }
  function drawSeahorse(ctx, sp, x, y, s, flip, t) { drawSide(ctx, sp, x, y + Math.sin(t * 2) * 3, s, Math.sin(t * 1.4) * 0.06, flip, false); }

  /* ---------- escenaris ---------- */
  function causticTile() {
    return Tex.get("g10caust", () => {
      const n = makeNoise(5), n2 = makeNoise(9);
      const src = Tex.pixels(256, 256, (i, j) => { const a = n.fbm(i / 38, j / 38, 3), b = n2.fbm(i / 30 + 7, j / 30, 3); const v = Math.pow(1 - Math.abs(a - b) * 2.6, 9); return [255, 255, 245, clamp(v * 255, 0, 255)]; });
      return seamless(src);
    });
  }
  function bottomLayer(pk) {
    const P = PONDS[pk];
    return bake("g10bot_" + pk, W, H, x => {
      const R = mulberry32(pk.length * 19 + 1);
      x.fillStyle = P.bottom; x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.7; x.fillStyle = x.createPattern(Tex.paper(256, 256, "#d8d0c0", { seed: 61, fiber: 2 }), "repeat"); x.globalAlpha = 0.3; x.fillStyle = x.createPattern(paperTile(), "repeat"); x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
      if (pk === "mar" || pk === "fons") { x.strokeStyle = "rgba(150,120,80,0.25)"; x.lineWidth = 3; for (let j = 0; j < 40; j++) { const y0 = R() * H; x.beginPath(); x.moveTo(-20, y0); for (let px = 0; px < W + 40; px += 40) x.lineTo(px, y0 + Math.sin(px / 60 + j) * 8); x.stroke(); } }
      // còdols i pedres del fons
      const stones = pk === "riu" ? 160 : pk === "estany" ? 60 : 50;
      for (let k = 0; k < stones; k++) { const px = R() * W, py = R() * H, r = (pk === "riu" ? 10 : 6) + R() * (pk === "riu" ? 22 : 14); wc(x, blob(px, py, r, k, 0.25, 8), pick(pk === "riu" ? ["#A8A090", "#8E8A80", "#B8AC94", "#7A7466", "#C2B8A0"] : ["#A89A7A", "#8E8670", "#B8AA88"]), k); }
      if (pk === "estany") for (let k = 0; k < 26; k++) { const px = R() * W, py = 120 + R() * (H - 120); x.strokeStyle = rgba(pick(["#4E7A3A", "#6A8E4A", "#3E6A3A"]), 0.6); x.lineWidth = 4; x.lineCap = "round"; for (let s = 0; s < 4; s++) { x.beginPath(); x.moveTo(px + s * 6, py); x.bezierCurveTo(px + s * 6 + 20, py - 30, px + s * 6 - 20, py - 60, px + s * 6 + 10, py - 90); x.stroke(); } }
      if (pk === "mar" || pk === "fons") for (let k = 0; k < (pk === "fons" ? 22 : 12); k++) { const px = R() * W, py = R() * H; x.strokeStyle = rgba("#4E7A4A", 0.55); x.lineWidth = 7; x.lineCap = "round"; for (let s = 0; s < 6; s++) { const a = -1.2 + s * 0.48; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a) * 40, py + Math.sin(a) * 40 - 20, px + Math.cos(a) * 70, py + Math.sin(a) * 70); x.stroke(); } }
      if (pk === "fons") {
        for (let k = 0; k < 14; k++) { const px = R() * W, py = 140 + R() * (H - 140); x.strokeStyle = rgba(pick(["#D8503A", "#E87A3A", "#C83A5A"]), 0.75); x.lineCap = "round"; const br = (bx, by, a, L, d) => { if (d > 4) return; const ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L; x.lineWidth = 7 - d * 1.3; x.beginPath(); x.moveTo(bx, by); x.lineTo(ex, ey); x.stroke(); br(ex, ey, a - 0.5, L * 0.72, d + 1); br(ex, ey, a + 0.45, L * 0.72, d + 1); }; br(px, py, -1.57 + (R() - 0.5), 40, 0); }
        for (let k = 0; k < 10; k++) { const px = R() * W, py = R() * H; x.fillStyle = "#3A2440"; x.beginPath(); x.arc(px, py, 9, 0, 6.28); x.fill(); x.strokeStyle = "#3A2440"; x.lineWidth = 1.5; for (let s = 0; s < 16; s++) { const a = s / 16 * 6.28; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * 18, py + Math.sin(a) * 18); x.stroke(); } }
        for (let k = 0; k < 6; k++) { const px = R() * W, py = R() * H; wc(x, c => starPath(c, px, py, 22, 9, 5), "#E8903A", k + 50); }
      }
      if (pk === "mar") for (let k = 0; k < 5; k++) { const px = R() * W, py = R() * H; wc(x, c => starPath(c, px, py, 20, 8, 5), "#E8783A", k + 60); }
      // profunditat: l'aigua enfosqueix el fons
      const g = x.createRadialGradient(W / 2, H * 0.48, 100, W / 2, H * 0.5, 900); g.addColorStop(0, rgba(P.deep, 0.55)); g.addColorStop(1, rgba(P.water, 0.35)); x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = rgba(P.water, 0.35); x.fillRect(0, 0, W, H);
    });
  }
  function surfaceLayer(pk) {
    const P = PONDS[pk];
    return bake("g10surf_" + pk, W, H, x => {
      const R = mulberry32(pk.length * 7 + 5);
      // ombra suau barata: tres còpies desplaçades i translúcides (sense filtres sobre la capa gran)
      const sh = path => { for (let k = 0; k < 3; k++) { x.save(); x.translate(6 + k * 3, 9 + k * 4); path(x); x.fillStyle = "rgba(10,40,40,0.1)"; x.fill(); x.restore(); } };
      // vora superior: herba, canyes i sorra
      if (pk === "estany" || pk === "riu") {
        const bank = c => { c.beginPath(); c.moveTo(-10, -10); c.lineTo(W + 10, -10); c.lineTo(W + 10, 92); for (let px = W; px >= -20; px -= 40) c.lineTo(px, 100 + Math.sin(px / 90) * 14 + Math.sin(px / 33) * 5); c.closePath(); };
        const sand = c => { c.beginPath(); c.moveTo(-10, -10); c.lineTo(W + 10, -10); c.lineTo(W + 10, 112); for (let px = W; px >= -20; px -= 40) c.lineTo(px, 118 + Math.sin(px / 90) * 14); c.closePath(); };
        sh(sand); wc(x, sand, "#C8B48A", 3); wc(x, bank, "#7DAE5E", 4);
        for (let k = 0; k < 70; k++) { const px = R() * W, by = 98 + Math.sin(px / 90) * 14; x.strokeStyle = rgba(pick(["#5E8E42", "#7AA650", "#4A7A36"]), 0.85); x.lineWidth = 3; x.lineCap = "round"; x.beginPath(); x.moveTo(px, by); x.quadraticCurveTo(px + (R() - 0.5) * 20, by - 40, px + (R() - 0.5) * 30, by - 70 - R() * 30); x.stroke(); if (R() < 0.25) { x.fillStyle = "#7A4E2E"; x.beginPath(); x.ellipse(px + (R() - 0.5) * 10, by - 60, 4, 12, 0, 0, 6.28); x.fill(); } }
      }
      if (pk === "estany") {
        const pads = [[120, 330, 46], [210, 410, 36], [1460, 300, 52], [1380, 470, 38], [130, 640, 44], [1500, 640, 40], [420, 170, 34], [1180, 160, 40], [700, 630, 30], [960, 190, 32]];
        pads.forEach(([px, py, r], i) => { const pad = c => { c.beginPath(); c.moveTo(px, py); c.arc(px, py, r, 0.3 + i, 0.3 + i + 5.8); c.closePath(); }; sh(pad); wc(x, pad, i % 3 ? "#5E9E4A" : "#4E8E3E", 20 + i); x.strokeStyle = rgba("#3E6E2E", 0.5); x.lineWidth = 1.2; for (let s = 0; s < 7; s++) { const a = s / 7 * 6.28 + i; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * r * 0.9, py + Math.sin(a) * r * 0.9); x.stroke(); } if (i % 3 === 0) { for (let s = 0; s < 8; s++) { const a = s / 8 * 6.28; wc(x, c => { c.beginPath(); c.ellipse(px + Math.cos(a) * 9, py + Math.sin(a) * 9, 11, 5, a, 0, 6.28); }, "#F4B8C8", 40 + s); } x.fillStyle = "#F2C230"; x.beginPath(); x.arc(px, py, 5, 0, 6.28); x.fill(); } });
      }
      if (pk === "riu") [[230, 300, 40], [1350, 360, 48], [520, 580, 30], [1150, 600, 36], [1540, 520, 44], [60, 520, 40]].forEach(([px, py, r], i) => { sh(blob(px, py, r, i + 3, 0.18)); wc(x, blob(px, py, r, i + 3, 0.18), "#9A968A", 30 + i); x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(px - r * 0.2, py - r * 0.3, r * 0.5, r * 0.25, -0.3, 0, 6.28); x.fill(); x.lineCap = "round"; for (let q = 0; q < 3; q++) { x.strokeStyle = `rgba(255,255,255,${0.6 - q * 0.17})`; x.lineWidth = 3.5 - q; x.beginPath(); x.arc(px, py, r + 6 + q * 8, -0.7 - q * 0.1, 0.9 + q * 0.15); x.stroke(); } });
      if (pk === "mar" || pk === "fons") {
        const rocks = pk === "mar" ? [[40, 160, 110], [1560, 200, 120], [-10, 620, 90], [1610, 640, 100], [300, 40, 80], [1290, 30, 90]] : [[30, 180, 80], [1580, 260, 90], [1300, 30, 60], [260, 20, 60]];
        rocks.forEach(([px, py, r], i) => { sh(blob(px, py, r, i + 9, 0.22, 10)); wc(x, blob(px, py, r, i + 9, 0.22, 10), pick(["#8A7E70", "#7A7064", "#9A8E7E"]), 70 + i); x.fillStyle = "rgba(255,255,255,0.25)"; x.beginPath(); x.ellipse(px - r * 0.25, py - r * 0.3, r * 0.45, r * 0.22, -0.4, 0, 6.28); x.fill(); x.lineCap = "round"; for (let q = 0; q < 3; q++) { x.strokeStyle = `rgba(255,255,255,${0.55 - q * 0.15})`; x.lineWidth = 5 - q; for (let a = 0; a < 6.28; a += 0.7) { x.beginPath(); x.arc(px, py, r + 8 + q * 9 + Math.sin(a * 3 + q) * 3, a, a + 0.45); x.stroke(); } } });
      }
      x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.3; x.fillStyle = x.createPattern(paperTile(), "repeat"); x.fillRect(0, 0, W, H);
    });
  }
  function boatSprite() {
    return Sprites.get("g10boat", 230, 330, (x, w, h) => {
      const hull = c => { c.beginPath(); c.moveTo(115, 10); c.bezierCurveTo(200, 70, 210, 220, 190, 320); c.lineTo(40, 320); c.bezierCurveTo(20, 220, 30, 70, 115, 10); c.closePath(); };
      const inner = c => { c.beginPath(); c.moveTo(115, 34); c.bezierCurveTo(182, 86, 190, 220, 174, 330); c.lineTo(56, 330); c.bezierCurveTo(40, 220, 48, 86, 115, 34); c.closePath(); };
      x.save(); x.shadowColor = "rgba(10,30,40,0.4)"; x.shadowBlur = 16; x.shadowOffsetX = 10; x.shadowOffsetY = 14; hull(x); x.fillStyle = "#9A6A3E"; x.fill(); x.restore();
      wc(x, hull, "#B07A48", 3);
      x.save(); inner(x); x.clip(); x.drawImage(Tex.wood(230, 330, "#C8955A", { seed: 7, vertical: true }), 0, 0); x.fillStyle = "rgba(60,30,10,0.18)"; for (let i = 0; i < 6; i++) x.fillRect(56 + i * 22, 0, 2, 340); x.restore();
      x.strokeStyle = "#6A4426"; x.lineWidth = 3; inner(x); x.stroke();
      [[150, 26], [250, 24]].forEach(([y, hh]) => { x.fillStyle = "#8A5A32"; x.fillRect(46, y, 138, hh); x.fillStyle = "rgba(255,255,255,0.15)"; x.fillRect(46, y, 138, 4); });
      x.strokeStyle = "#7A5230"; x.lineWidth = 7; x.lineCap = "round"; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(115 + s * 70, 180); x.lineTo(115 + s * 112, 300); x.stroke(); }
      x.fillStyle = "#C8A070"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(115 + s * 116, 314, 10, 26, s * -0.4, 0, 6.28); x.fill(); }
    });
  }
  function bucketSprite() {
    return Sprites.get("g10bucket", 90, 90, x => {
      x.save(); x.shadowColor = "rgba(0,0,0,0.35)"; x.shadowBlur = 8; x.shadowOffsetY = 5; x.fillStyle = "#3E6E9A"; x.beginPath(); x.arc(45, 45, 38, 0, 6.28); x.fill(); x.restore();
      x.fillStyle = "#5E8EBA"; x.beginPath(); x.arc(45, 45, 36, 0, 6.28); x.fill();
      x.fillStyle = "#2E7A8E"; x.beginPath(); x.arc(45, 45, 28, 0, 6.28); x.fill();
      x.fillStyle = "rgba(255,255,255,0.35)"; x.beginPath(); x.ellipse(36, 36, 12, 6, -0.6, 0, 6.28); x.fill();
      x.strokeStyle = "#BFD3E2"; x.lineWidth = 3; x.beginPath(); x.arc(45, 45, 36, 0, 6.28); x.stroke();
    });
  }
  function tankBack(pk) {
    const [tx, ty, tw, th] = TANK;
    return Sprites.get("g10tank_" + pk, tw + 20, th + 20, x => {
      x.translate(10, 10);
      x.save(); x.shadowColor = "rgba(0,0,0,0.4)"; x.shadowBlur = 16; x.shadowOffsetY = 8; rr(x, 0, 0, tw, th, 14); x.fillStyle = "#2E6E7A"; x.fill(); x.restore();
      const g = x.createLinearGradient(0, 0, 0, th); g.addColorStop(0, "#9ED8E0"); g.addColorStop(1, "#3E9AAA"); rr(x, 6, 6, tw - 12, th - 12, 10); x.fillStyle = g; x.fill();
      x.save(); rr(x, 6, 6, tw - 12, th - 12, 10); x.clip();
      x.fillStyle = "#E8D6A8"; x.beginPath(); x.moveTo(0, th - 26); x.quadraticCurveTo(tw / 2, th - 40, tw, th - 24); x.lineTo(tw, th); x.lineTo(0, th); x.fill();
      const R = mulberry32(3); for (let k = 0; k < 14; k++) { x.fillStyle = pick(["#A89A7A", "#8E8670", "#C8B890"]); x.beginPath(); x.arc(R() * tw, th - 14 - R() * 10, 3 + R() * 4, 0, 6.28); x.fill(); }
      x.strokeStyle = "#4E8E4A"; x.lineWidth = 5; x.lineCap = "round"; for (const px of [30, 46, 240, 256]) { x.beginPath(); x.moveTo(px, th - 20); x.bezierCurveTo(px + 14, th - 60, px - 14, th - 90, px + 6, th - 120); x.stroke(); }
      x.restore();
    });
  }
  function tankFront() {
    const [tx, ty, tw, th] = TANK;
    return Sprites.get("g10tankF", tw + 20, th + 20, x => {
      x.translate(10, 10);
      x.fillStyle = "rgba(255,255,255,0.18)"; x.beginPath(); x.moveTo(20, 8); x.lineTo(70, 8); x.lineTo(30, th - 8); x.lineTo(14, th - 8); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.5)"; x.lineWidth = 2; rr(x, 6, 6, tw - 12, th - 12, 10); x.stroke();
      x.fillStyle = "#2E6E7A"; rr(x, -4, -6, tw + 8, 14, 6); x.fill();
    });
  }

  function avatarOf(api) { const p = api.profile; return p && typeof ANIMALS !== "undefined" ? [ANIMALS[(p.animal || 0) % 8].id, PLUSH[(p.color || 0) % 8]] : ["gat", "#E9A15B"]; }

  Games.register({
    id: 10, key: "p", name: "Pesca a l'estany", zone: "costa", music: "guitar", demoTime: 10, missAt: [800, 470], kbPos: [800, 770],
    collect: { one: "peix", many: "peixos" },
    goal: l => l <= 3 ? "Escriu la lletra d'un peix per llançar-li l'ham. Omple l'aquari amb 12 espècies." : l === 4 ? "Escriu la síl·laba d'un peix per pescar-lo. Omple l'aquari amb 12 espècies." : l === 5 ? "Escriu la paraula del peix gros per pescar-lo. Omple l'aquari amb 12 espècies." : "Escriu el nom de cada espècie per pescar-la. Omple l'aquari amb 12 espècies.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "#5EA8A0"); g.addColorStop(1, "#2F6A70"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      const s = Math.max(w / 320, h / 220); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.25; ctx.fillStyle = ctx.createPattern(causticTile(), "repeat"); ctx.translate(t * 8, t * 5); ctx.fillRect(-400 - t * 8, -300 - t * 5, 800, 600); ctx.restore();
      ctx.fillStyle = "#4E8E3E"; ctx.beginPath(); ctx.moveTo(-120, -60); ctx.arc(-120, -60, 30, 0.4, 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5E9E4A"; ctx.beginPath(); ctx.moveTo(130, 60); ctx.arc(130, 60, 26, 2, 7.6); ctx.closePath(); ctx.fill();
      const sp = PONDS.estany.species[0];
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = `rgba(255,255,255,${0.5 - i * 0.15})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(-30, 40, 30 + i * 18 + (t * 20) % 18, (30 + i * 18 + (t * 20) % 18) * 0.5, 0, 0, 6.28); ctx.stroke(); }
      const k = (t * 0.6) % 1, jx = lerp(-80, 40, k), jy = 40 - Math.sin(k * Math.PI) * 90;
      drawSide(ctx, sp, jx, jy, 0.62, -Math.cos(k * Math.PI) * 0.7, 1, true);
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(150, -120); ctx.quadraticCurveTo(80, -30, jx + 40, jy); ctx.stroke();
      drawPlate(ctx, "p", 62, -38, { size: 58, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, pk = POND_BY_LEVEL[L - 1], P = PONDS[pk];
      const species = shuffle(P.species);
      let speciesQ = species.slice();
      const wordsMode = L >= 5;
      const pool = wordsMode ? null : api.pool({});
      const fishes = [], ripples = [], caught = [], jumps = [], wakes = [];
      const bot = bottomLayer(pk), surf = surfaceLayer(pk), boat = boatSprite(), bucket = bucketSprite();
      const [anim, acol] = avatarOf(api);
      const ROD = [BOAT[0] + 120, BOAT[1] - 168];
      const hook = { state: "idle", x: ROD[0], y: ROD[1] + 60, t: 0 };
      let nCaught = 0, said = false, card = null, done = false, endT = -1, castAnim = 0, laneFree = [0, 0, 0];
      const fontSize = L <= 3 ? 64 : L === 4 ? 50 : 42;
      const typer = api.typer({
        targets: () => fishes.filter(f => f.x > 90 && f.x < W - 90),
        rank: f => Math.abs(f.x - 800) * 0.6 + (900 - f.y),
        onStep: (f) => {
          if (f.typed === 1) cast(f.x, f.y + 8, f);
          else { f.tug = 1; ripples.push({ x: f.x, y: f.y, t: 0, r: 18 }); Sfx.play("plof"); }
        },
        onDone: f => { f.state = "caught"; f.doneT = 0; },
        onMiss: (f) => {
          if (f && f.locked) { f.tug = 1; return; }
          const tx = f ? clamp(f.x + pick([-1, 1]) * rand(150, 220), 160, 1440) : rand(300, 1300), ty = f ? clamp(f.y + rand(-40, 60), 220, 600) : rand(260, 560);
          cast(tx, ty, null);
        },
      });
      function cast(tx, ty, fish) {
        hook.state = "cast"; hook.t = 0; hook.fx = hook.x; hook.fy = hook.y; hook.tx = tx; hook.ty = ty; hook.fish = fish; castAnim = 1;
        if (fish) { fish.hooked = true; }
        Sfx.play("whoosh");
      }
      function textFor(sp) {
        if (!wordsMode) return pool.next(fishes.filter(f => f.text).map(f => f.text));
        return sp.name;
      }
      function nextSpecies() {
        if (!speciesQ.length) speciesQ = shuffle(P.species);
        const used = new Set(fishes.map(f => f.sp.name));
        let i = speciesQ.findIndex(s => !used.has(s.name) && (!wordsMode || !fishes.some(f => f.text[0] === s.name[0])));
        if (i < 0) i = speciesQ.findIndex(s => !used.has(s.name));
        if (i < 0) i = 0;
        return speciesQ.splice(i, 1)[0];
      }
      function spawn(lane, first) {
        const sp = nextSpecies(), fromLeft = Math.random() < 0.5;
        const sz = (L === 5 ? 1.45 : 1.22) * clamp(sp.size, 0.75, 1.35);
        const f = { sp, text: textFor(sp), lane, x: first ? rand(260, 1340) : (fromLeft ? -90 : W + 90), y: LANES[lane], dir: fromLeft ? 1 : -1, face: fromLeft ? 1 : -1, v: rand(36, 52), ph: rand(0, 6.28), s: sz, state: "swim", tug: 0, t: 0, a: first ? 1 : 1 };
        if (first) { f.dir = f.x < 800 ? 1 : -1; f.face = f.dir; }
        fishes.push(f);
      }
      [0, 1, 2].forEach(l => spawn(l, true));
      api.hud.progress = [0, GOAL];
      function land(j) {
        Sfx.play("splash"); api.particles.emit(BOAT[0] + 70, BOAT[1] + 40, { count: 16, color: ["#BFE3F2", "#FFFFFF", "#7EC8E0"], speed: 200, gravity: 500, size: 7, life: 0.6, angle: -Math.PI / 2, spread: 1.2 });
        setTimeout(() => {
          caught.push({ sp: j.sp, x: TANK[0] + rand(60, TANK[2] - 60), y: TANK[1] + rand(40, TANK[3] - 60), dir: pick([-1, 1]), ph: rand(0, 6), v: rand(14, 24), pop: 1 });
          nCaught++; api.hud.progress = [nCaught, GOAL];
          card = { sp: j.sp, t: 0 }; Sfx.play("chime", { note: 76 + (nCaught % 5) * 2 });
          api.particles.emit(TANK[0] + TANK[2] / 2, TANK[1] + 30, { count: 14, color: ["#FFFFFF", "#FFE08A", "#BFE3F2"], shape: "star", size: 10, speed: 180, gravity: 120, life: 0.8 });
          void 0;
          if (nCaught >= GOAL && !done) { done = true; endT = 0; }
        }, 450);
      }
      return {
        expected() { return done ? null : typer.expected(); },
        onKey(k) { if (!done) typer.key(k); },
        update(dt) {
          const sp = api.speed, t = api.t;
          castAnim = Math.max(0, castAnim - dt * 2.2);
          // peixos
          for (let i = fishes.length - 1; i >= 0; i--) {
            const f = fishes[i]; f.t += dt; f.tug = Math.max(0, f.tug - dt * 2.5);
            if (f.state === "swim") {
              const stop = f.hooked || f.locked;
              const entering = f.x < 150 && f.dir > 0 || f.x > W - 150 && f.dir < 0;
              const vv = stop ? 0 : f.v * sp * (entering ? 4 : 1);
              f.x += f.dir * vv * dt;
              const edge = Math.max(170, (f.pw || 0) / 2 + 30);
              if (!stop && ((f.x > W - edge && f.dir > 0) || (f.x < edge && f.dir < 0))) f.dir *= -1;
              f.face = lerp(f.face, f.dir, clamp(dt * 3, 0, 1));
              f.y = LANES[f.lane] + Math.sin(f.t * 0.35 + f.ph) * 26;
              if (f.hooked && !f.locked && f.typed === 0) f.hooked = false;
              if (Math.random() < dt * 1.2 && !stop) wakes.push({ x: f.x - f.dir * 40 * f.s, y: f.y - 4, t: 0 });
            } else if (f.state === "caught") {
              f.doneT += dt;
              if (f.doneT > (hook.state === "cast" ? 0.5 : 0.08)) {
                fishes.splice(i, 1);
                jumps.push({ sp: f.sp, x0: f.x, y0: f.y, x1: BOAT[0] + 70, y1: BOAT[1] + 40, t: 0, s: f.s, flip: f.x > BOAT[0] ? -1 : 1, plate: f.text });
                ripples.push({ x: f.x, y: f.y, t: 0, r: 30 }, { x: f.x, y: f.y, t: -0.15, r: 20 });
                Sfx.play("splash"); api.particles.emit(f.x, f.y, { count: 22, color: ["#FFFFFF", "#BFE3F2", "#8ED0E8"], speed: 300, gravity: 700, size: 8, life: 0.8, angle: -Math.PI / 2, spread: 1.1 });
                hook.state = "reel"; hook.t = 0; hook.fx = f.x; hook.fy = f.y;
                laneFree[f.lane] = 1.4 / Math.max(0.7, sp);
              }
            }
          }
          // carrils buits: arriba un peix nou nedant des de la vora
          [0, 1, 2].forEach(l => { if (laneFree[l] > 0) { laneFree[l] -= dt; if (laneFree[l] <= 0 && nCaught + fishes.length + jumps.length < GOAL + 3 && !done) spawn(l, false); } });
          // ham
          hook.t += dt;
          if (hook.state === "cast") { const k = clamp(hook.t / 0.45, 0, 1); hook.x = lerp(hook.fx, hook.tx, Ease.outQuad(k)); hook.y = lerp(hook.fy, hook.ty, Ease.outQuad(k)); hook.z = Math.sin(k * Math.PI) * 120; if (k >= 1) { hook.state = hook.fish ? "wait" : "empty"; hook.t = 0; ripples.push({ x: hook.x, y: hook.y, t: 0, r: 10 }); Sfx.play("plof"); if (hook.fish) hook.fish.tug = 1; } }
          else if (hook.state === "wait") { const f = hook.fish; if (f && fishes.includes(f)) { hook.x = f.x + f.face * 50 * f.s; hook.y = f.y; } else if (!f || !fishes.includes(f)) { hook.state = "reel"; hook.t = 0; hook.fx = hook.x; hook.fy = hook.y; } }
          else if (hook.state === "empty") { if (hook.t > 0.6) { hook.state = "reel"; hook.t = 0; hook.fx = hook.x; hook.fy = hook.y; } }
          else if (hook.state === "reel") { const k = Ease.inOutQuad(clamp(hook.t / 0.6, 0, 1)); hook.x = lerp(hook.fx, ROD[0], k); hook.y = lerp(hook.fy, ROD[1] + 60, k); hook.z = Math.sin(k * Math.PI) * 50; if (k >= 1) { hook.state = "idle"; hook.z = 0; } }
          else { hook.x = ROD[0] + Math.sin(t * 1.5) * 4; hook.y = ROD[1] + 60; hook.z = 0; }
          // salts
          for (let i = jumps.length - 1; i >= 0; i--) { const j = jumps[i]; j.t += dt / 1.0; if (j.t >= 1 && !j.landed) { j.landed = true; land(j); } if (j.t > 1.15) jumps.splice(i, 1); }
          for (let i = ripples.length - 1; i >= 0; i--) { ripples[i].t += dt; if (ripples[i].t > 1.6) ripples.splice(i, 1); }
          for (let i = wakes.length - 1; i >= 0; i--) { wakes[i].t += dt; if (wakes[i].t > 1.4) wakes.splice(i, 1); }
          if (wakes.length > 40) wakes.splice(0, wakes.length - 40);
          caught.forEach(c => { c.x += c.dir * c.v * dt; c.pop = Math.max(0, c.pop - dt * 1.5); if ((c.x > TANK[0] + TANK[2] - 40 && c.dir > 0) || (c.x < TANK[0] + 40 && c.dir < 0)) c.dir *= -1; });
          if (card) { card.t += dt; if (card.t > 2.6) card = null; }
          if (endT >= 0) { endT += dt; if (endT > 0.3 && !said) { said = true; void 0; Sfx.play("win"); } if (endT > 2.8) api.finish(true, { collectName: `12 peixos de ${P.name}` }); }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bot, 0, 0);
          // ombres i peixos sota l'aigua
          fishes.forEach(f => { const wag = Math.sin(f.t * (f.hooked ? 14 : 5) + f.ph) * (f.hooked ? 0.35 : 0.22) + f.tug * Math.sin(f.t * 30) * 0.3; if (f.sp.shape !== "horse") drawTop(ctx, f.sp, f.x + 16, f.y + 22, f.s, Math.sign(f.face) || 1, wag, { shadow: true, alpha: 0.5 }); });
          // càustiques i flux del riu
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          const flow = P.flow ? t * 30 : 0, ct = causticTile();
          const c1 = ctx.createPattern(ct, "repeat"), c2 = ctx.createPattern(ct, "repeat");
          c1.setTransform(new DOMMatrix().translate(t * 9 + flow, t * 5));
          c2.setTransform(new DOMMatrix().translate(-t * 7 + flow * 0.8 + 140, t * 8 + 60).scale(1.4));
          ctx.globalAlpha = 0.12; ctx.fillStyle = c1; ctx.fillRect(0, 0, W, H);
          ctx.globalAlpha = 0.08; ctx.fillStyle = c2; ctx.fillRect(0, 0, W, H);
          ctx.restore();
          fishes.forEach(f => {
            const wag = Math.sin(f.t * (f.hooked ? 14 : 5) + f.ph) * (f.hooked ? 0.35 : 0.22) + f.tug * Math.sin(f.t * 30) * 0.3;
            const fx = f.x + (f.tug ? Math.sin(f.t * 40) * 3 * f.tug : 0);
            if (f.sp.shape === "horse") drawSeahorse(ctx, f.sp, fx, f.y + 6, 0.62 * f.s, Math.sign(f.face) || 1, f.t);
            else drawTop(ctx, f.sp, fx, f.y, f.s, Math.abs(f.face) < 0.2 ? 0.2 * Math.sign(f.face || 1) : f.face, wag, { alpha: 0.97 });
          });
          // reflex del cel
          ctx.save(); const rg = ctx.createLinearGradient(0, 0, W, H); rg.addColorStop(0, rgba(P.sky, 0.28)); rg.addColorStop(0.5, rgba(P.sky, 0.05)); rg.addColorStop(1, rgba(P.sky, 0.18)); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
          for (let i = 0; i < 3; i++) { const cx = ((t * 12 + i * 620) % (W + 600)) - 300, cy = 200 + i * 220; const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220); g.addColorStop(0, "rgba(255,255,255,0.14)"); g.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = g; ctx.fillRect(cx - 220, cy - 220, 440, 440); }
          if (P.flow) { ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 2; ctx.lineCap = "round"; for (let i = 0; i < 18; i++) { const yy = 140 + (i * 97) % 640, xx = ((t * 60 + i * 233) % (W + 200)) - 100; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + 30, yy - 4, xx + 70, yy); ctx.stroke(); } }
          ctx.restore();
          ctx.drawImage(surf, 0, 0);
          // ones
          ctx.save(); ctx.lineWidth = 2.2;
          ripples.forEach(r => { if (r.t < 0) return; const k = r.t / 1.6; ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; for (let q = 0; q < 2; q++) { const rad = r.r + k * 110 - q * 18; if (rad > 2) { ctx.beginPath(); ctx.ellipse(r.x, r.y, rad, rad * 0.55, 0, 0, 6.28); ctx.stroke(); } } });
          wakes.forEach(w => { const k = w.t / 1.4; ctx.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.ellipse(w.x, w.y, 8 + k * 40, 4 + k * 16, 0, 0, 6.28); ctx.stroke(); });
          ctx.restore();
          // aleta dorsal fora de l'aigua (sense deformar mai la placa)
          fishes.forEach(f => {
            if (f.sp.shape === "horse") return;
            const fx = f.x, fy = f.y - 6, fc = f.sp.fin, s = f.s;
            ctx.save(); ctx.translate(fx, fy);
            ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 4, 26 * s, 8 * s, 0, 0, 6.28); ctx.stroke();
            ctx.scale(Math.sign(f.face) || 1, 1);
            ctx.fillStyle = shade(fc, -0.2); ctx.beginPath(); ctx.moveTo(-20 * s, 4); ctx.quadraticCurveTo(-4 * s, -34 * s, 12 * s, -38 * s); ctx.quadraticCurveTo(4 * s, -14 * s, 20 * s, 4); ctx.closePath(); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.moveTo(-10 * s, 2); ctx.quadraticCurveTo(0, -24 * s, 10 * s, -32 * s); ctx.lineTo(4 * s, 2); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = rgba(INK, 0.6); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-20 * s, 4); ctx.quadraticCurveTo(-4 * s, -34 * s, 12 * s, -38 * s); ctx.quadraticCurveTo(4 * s, -14 * s, 20 * s, 4); ctx.stroke();
            ctx.restore();
          });
          // barca, avatar, canya i fil
          const tilt = castAnim > 0 ? Math.sin((1 - castAnim) * Math.PI) * 0.12 : Math.sin(t * 1.2) * 0.02;
          ctx.save(); ctx.translate(BOAT[0], BOAT[1] + 60); ctx.rotate(Math.sin(t * 0.9) * 0.012); Sprites.draw(ctx, boat, 0, 0); ctx.restore();
          ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 2; for (let i = 0; i < 2; i++) { const k = ((t * 0.5 + i * 0.5) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.ellipse(BOAT[0], BOAT[1] + 80, 130 + k * 60, 190 + k * 50, 0, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke(); } ctx.restore();
          Sprites.draw(ctx, bucket, BOAT[0] + 70, BOAT[1] + 40, { s: 0.9 });
          caught.slice(-3).forEach((c, i) => { ctx.save(); ctx.beginPath(); ctx.arc(BOAT[0] + 70, BOAT[1] + 40, 26, 0, 6.28); ctx.clip(); drawTop(ctx, c.sp, BOAT[0] + 64 + i * 6, BOAT[1] + 34 + i * 8, 0.3, i % 2 ? 1 : -1, Math.sin(t * 4 + i) * 0.2, { alpha: 0.9 }); ctx.restore(); });
          const rodA = -1.0 + tilt * 3 - castAnim * 0.6;
          const rx = BOAT[0] + 22, ry = BOAT[1] - 14, tipX = rx + Math.cos(rodA) * 190, tipY = ry + Math.sin(rodA) * 190;
          drawAvatar(ctx, BOAT[0] - 6, BOAT[1] - 30, 118, anim, acol, { tilt: tilt - 0.04 });
          ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = "#5A3A22"; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + Math.cos(rodA) * 60, ry + Math.sin(rodA) * 60); ctx.stroke();
          ctx.strokeStyle = "#B88A4A"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(rx + Math.cos(rodA) * 60, ry + Math.sin(rodA) * 60); ctx.lineTo(tipX, tipY); ctx.stroke();
          ctx.fillStyle = "#8A8A8A"; ctx.beginPath(); ctx.arc(rx + Math.cos(rodA) * 40, ry + Math.sin(rodA) * 40, 8, 0, 6.28); ctx.fill();
          // fil fins a l'ham (amb una mica de panxa)
          const hz = hook.z || 0, hx = hook.x, hy = hook.y - hz;
          ctx.strokeStyle = "rgba(250,250,240,0.85)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.quadraticCurveTo((tipX + hx) / 2, Math.max(tipY, hy) + 40 - hz * 0.3, hx, hy); ctx.stroke();
          if (hz > 4) { ctx.fillStyle = "rgba(0,30,40,0.2)"; ctx.beginPath(); ctx.ellipse(hook.x, hook.y, 6, 3, 0, 0, 6.28); ctx.fill(); }
          ctx.strokeStyle = "#D8DCE0"; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx, hy + 12); ctx.arc(hx - 5, hy + 12, 5, 0, Math.PI); ctx.stroke();
          ctx.fillStyle = "#E0452E"; ctx.beginPath(); ctx.arc(hx, hy - 10, 5, 0, 6.28); ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(hx, hy - 13, 3, Math.PI, 0); ctx.fill();
          ctx.restore();
          // peixos saltant cap a la galleda, amb mirada sorpresa
          jumps.forEach(j => {
            const k = clamp(j.t, 0, 1), x = lerp(j.x0, j.x1, k), y = lerp(j.y0, j.y1, k) - Math.sin(k * Math.PI) * 230, s = lerp(0.75, 0.42, k) * j.s;
            const vx = j.x1 - j.x0, vy = (j.y1 - j.y0) - Math.cos(k * Math.PI) * Math.PI * 230;
            const rot = Math.atan2(vy, Math.abs(vx)) * 0.8;
            if (k < 1) { ctx.fillStyle = "rgba(0,30,40,0.18)"; ctx.beginPath(); ctx.ellipse(x + 20, lerp(j.y0, j.y1, k) + 20, 50 * s, 14 * s, 0, 0, 6.28); ctx.fill(); drawSide(ctx, j.sp, x, y, s, j.flip > 0 ? rot : -rot, j.flip, true); }
          });
          // aquari
          ctx.drawImage(tankBack(pk).c, TANK[0] - 10, TANK[1] - 10, TANK[2] + 20, TANK[3] + 20);
          ctx.save(); rr(ctx, TANK[0] + 6, TANK[1] + 6, TANK[2] - 12, TANK[3] - 12, 10); ctx.clip();
          caught.forEach((c, i) => { const s = 0.3 * clamp(c.sp.size, 0.7, 1.3) * (1 + c.pop * 0.4); if (c.sp.shape === "horse") drawSide(ctx, c.sp, c.x, c.y + Math.sin(t * 2 + c.ph) * 4, s * 0.8, 0, c.dir, false); else drawSide(ctx, c.sp, c.x, c.y + Math.sin(t * 1.5 + c.ph) * 5, s, Math.sin(t * 2 + c.ph) * 0.05, c.dir, false); });
          ctx.restore();
          ctx.drawImage(tankFront().c, TANK[0] - 10, TANK[1] - 10, TANK[2] + 20, TANK[3] + 20);
          // fitxa de l'espècie nova
          if (card) {
            const a = card.t < 0.25 ? Ease.outBack(card.t / 0.25) : card.t > 2.2 ? 1 - (card.t - 2.2) / 0.4 : 1, cx = TANK[0] + TANK[2] / 2, cy = TANK[1] - 70;
            ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.translate(cx, cy); ctx.scale(0.8 + 0.2 * clamp(a, 0, 1), 0.8 + 0.2 * clamp(a, 0, 1));
            ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; rr(ctx, -150, -42, 300, 84, 16); ctx.fillStyle = "#FBF6EA"; ctx.fill(); ctx.shadowColor = "transparent";
            ctx.strokeStyle = "#3E8E9A"; ctx.lineWidth = 3; ctx.stroke();
            drawSide(ctx, card.sp, -88, 2, card.sp.shape === "horse" ? 0.42 : 0.4, 0, 1, false);
            const nm = card.sp.name[0].toLocaleUpperCase("ca") + card.sp.name.slice(1);
            text(ctx, nm, 52, 2, { size: nm.length > 12 ? 24 : 30, weight: 900, font: FONT_T, color: BRAND.tinta });
            ctx.restore();
          }
          ctx.save(); ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(paperTile(), "repeat"); ctx.fillRect(0, 0, W, H); ctx.restore();
          drawVignette(ctx, 0.3, "10,40,50");
          // plaques sobre l'aleta (sempre a sobre, mai deformades)
          fishes.forEach(f => { if (!f.pw) f.pw = plateSize(ctx, f.text, fontSize).w; drawPlate(ctx, f.text, clamp(f.x, f.pw / 2 + 14, W - f.pw / 2 - 14), f.y - 48 * f.s - (fontSize < 64 ? 26 : 40), { size: fontSize, progress: f.typed, state: f.locked ? "active" : null, border: f.locked ? null : "#3E8E9A", borderW: 3 }); });
        },
      };
    },
  });
})();
