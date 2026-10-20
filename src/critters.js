"use strict";
/* ============================================================
   Critters: bestioles vectorials d'estil àlbum infantil
   Dibuix en un espai normalitzat de 100 × 100 (origen al centre,
   peus a y = 45), escalat a `size`. Sense text, sense filtres.
   ============================================================ */
const Critters = (() => {
  const TAU = Math.PI * 2;
  const OL = "#2B2320";                 // contorn càlid
  const LW = 2.2;                       // gruix del contorn
  const SHC = [74, 38, 92];             // to de l'ombra (lila càlid)
  const SHA = "rgba(74,38,92,0.2)";
  const BLUSH = "rgba(255,110,136,0.42)";
  const MOUTH = "#7A2E38", TONGUE = "#F58190", EYE = "#2B2320", IRIS = "#6B4A3E";
  const NOSE = "#3A2E2C", PINKIN = "#F5B3C0";
  const NO = {};
  const SG = [-1, 1];

  /* ── colors (amb memòria cau) ── */
  const memo = new Map();
  function rgbOf(c) {
    if (c[0] === "r") return c.slice(c.indexOf("(") + 1, -1).split(",").map(Number);
    let h = c.slice(1); if (h.length === 3) h = h.replace(/./g, "$&$&");
    const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(c, to, k) {
    const key = c + "|" + to + "|" + k; let v = memo.get(key);
    if (!v) { const a = rgbOf(c); v = `rgb(${a.map((x, i) => Math.round(x + (to[i] - x) * k)).join(",")})`; memo.set(key, v); }
    return v;
  }
  const dk = (c, k = 0.2) => mix(c, SHC, k);
  const lt = (c, k = 0.35) => mix(c, [255, 252, 242], k);

  /* ── camins ── */
  function ell(c, x, y, rx, ry, r = 0) { c.moveTo(x + rx * Math.cos(r), y + rx * Math.sin(r)); c.ellipse(x, y, rx, ry, r, 0, TAU); }
  const E = (x, y, rx, ry, r = 0) => c => ell(c, x, y, rx, ry, r);
  const RR = (x, y, w, h, r) => c => { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  function rot(c, x, y, a) { c.translate(x, y); c.rotate(a); c.translate(-x, -y); }

  /* peça: color pla + ombra inferior-dreta + brillantor + contorn */
  function P(c, path, col, o = NO) {
    const d = o.d == null ? 3 : o.d, inner = o.inner, hl = o.hl;
    c.beginPath(); path(c);
    c.fillStyle = d && !inner ? dk(col) : col; c.fill();
    if (d || inner || hl) {
      c.save(); c.clip();
      if (inner) {
        inner(c);
        if (d) { c.beginPath(); path(c); c.translate(-d * 0.45, -d); path(c); c.fillStyle = SHA; c.fill("evenodd"); c.translate(d * 0.45, d); }
      } else if (d) {
        c.translate(-d * 0.45, -d); c.beginPath(); path(c); c.fillStyle = col; c.fill(); c.translate(d * 0.45, d);
      }
      if (hl) { c.beginPath(); ell(c, hl[0], hl[1], hl[2], hl[3], hl[4] || 0); c.fillStyle = lt(col, 0.5); c.fill(); }
      c.restore();
    }
    if (o.ol !== false) { c.beginPath(); path(c); c.stroke(); }
  }
  const O = (c, x, y, rx, ry, col, o = NO) => P(c, E(x, y, rx, ry, o.r || 0), col, o);

  /* unió de cercles/el·lipses amb un sol contorn exterior */
  function blob(c, pts, col, o = NO) {
    const path = c => { for (const p of pts) { if (p.length > 3) ell(c, p[0], p[1], p[2], p[3], p[4] || 0); else { c.moveTo(p[0] + p[2], p[1]); c.arc(p[0], p[1], p[2], 0, TAU); } } };
    c.beginPath(); path(c); c.lineWidth = LW * 2; c.stroke(); c.lineWidth = LW;
    P(c, path, col, { d: o.d, hl: o.hl, ol: false });
  }
  /* tub (cues, potes primes, antenes) */
  function tube(c, path, w, col, hi = true) {
    c.beginPath(); path(c);
    c.lineWidth = w + LW * 2; c.strokeStyle = OL; c.stroke();
    c.lineWidth = w; c.strokeStyle = hi ? dk(col, 0.16) : col; c.stroke();
    if (hi && w > 2.5) { c.save(); c.translate(-w * 0.1, -w * 0.16); c.beginPath(); path(c); c.lineWidth = w * 0.5; c.strokeStyle = col; c.stroke(); c.restore(); }
    c.lineWidth = LW; c.strokeStyle = OL;
  }
  function ln(c, path, w = LW, col = OL) { c.beginPath(); path(c); c.lineWidth = w; c.strokeStyle = col; c.stroke(); c.lineWidth = LW; c.strokeStyle = OL; }
  function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = col; c.fill(); }
  function dots(c, pts, col) { c.beginPath(); for (const p of pts) { c.moveTo(p[0] + p[2], p[1]); c.arc(p[0], p[1], p[2], 0, TAU); } c.fillStyle = col; c.fill(); }

  /* ── cara ── */
  function eye(c, s, x, y, r, o = NO) {
    const lc = o.lc || OL;
    if (s.happy) { ln(c, c => { c.moveTo(x - r, y + r * 0.4); c.quadraticCurveTo(x, y - r * 1.2, x + r, y + r * 0.4); }, LW * 1.35, lc); return; }
    if (s.closed) { ln(c, c => { c.moveTo(x - r, y); c.quadraticCurveTo(x, y + r * 0.9, x + r, y); }, LW * 1.35, lc); return; }
    const k = s.surp ? 1.15 : 1;
    if (o.white) {
      c.beginPath(); ell(c, x, y, r * 1.1 * k, r * 1.22 * k); c.fillStyle = "#FFFFFF"; c.fill(); c.stroke();
      y += r * 0.18; r *= 0.7;
    }
    c.beginPath(); ell(c, x, y, r * 0.86 * k, r * k); c.fillStyle = EYE; c.fill();
    c.beginPath(); ell(c, x, y + r * 0.46 * k, r * 0.5 * k, r * 0.3 * k); c.fillStyle = IRIS; c.fill();
    dot(c, x + r * 0.26 * k, y - r * 0.38 * k, r * 0.36 * k, "#FFFFFF");
    dot(c, x - r * 0.3 * k, y + r * 0.36 * k, r * 0.14 * k, "#FFFFFF");
  }
  function brow(c, s, x, y, r, g, o = NO) {
    if (!(s.surp || s.sad)) return;
    const col = o.lc || OL, by = y - r * (o.white ? 2.0 : 1.75);
    if (s.surp) ln(c, c => { c.moveTo(x - r * 0.8, by + r * 0.15); c.quadraticCurveTo(x, by - r * 0.55, x + r * 0.8, by + r * 0.15); }, LW * 1.1, col);
    else {
      ln(c, c => { c.moveTo(x + g * r * 0.9, by + r * 0.4); c.lineTo(x - g * r * 0.7, by - r * 0.2); }, LW * 1.1, col);
      if (g < 0 && !s.closed) tear(c, x - r * 0.4, y + r * 1.55, r * 0.42);
    }
  }
  function tear(c, x, y, r) {
    P(c, c => { c.moveTo(x, y - r * 1.9); c.bezierCurveTo(x + r * 1.1, y - r * 0.5, x + r, y + r, x, y + r); c.bezierCurveTo(x - r, y + r, x - r * 1.1, y - r * 0.5, x, y - r * 1.9); }, "#8FD3F5", { d: 0 });
  }
  function eyes(c, s, dx, y, r, o = NO) {
    for (const g of SG) { eye(c, s, dx * g, y, r, o); brow(c, s, dx * g, y, r, g, o); }
  }
  function mouth(c, s, x, y, w, kind) {
    if (s.happy || s.jump || kind === "open") {
      const p = c => { c.moveTo(x - w, y); c.quadraticCurveTo(x, y + w * 0.3, x + w, y); c.quadraticCurveTo(x + w * 0.9, y + w * 1.6, x, y + w * 1.6); c.quadraticCurveTo(x - w * 0.9, y + w * 1.6, x - w, y); c.closePath(); };
      P(c, p, MOUTH, { d: 0, inner: c => { c.beginPath(); ell(c, x, y + w * 1.5, w * 0.62, w * 0.5); c.fillStyle = TONGUE; c.fill(); } });
    } else if (s.surp) O(c, x, y + w * 0.5, w * 0.45, w * 0.6, MOUTH, { d: 0 });
    else if (s.sad) ln(c, c => { c.moveTo(x - w * 0.7, y + w * 0.6); c.quadraticCurveTo(x, y - w * 0.1, x + w * 0.7, y + w * 0.6); }, LW * 1.1);
    else if (kind === "w") ln(c, c => { c.moveTo(x - w, y); c.quadraticCurveTo(x - w * 0.5, y + w * 0.8, x, y); c.quadraticCurveTo(x + w * 0.5, y + w * 0.8, x + w, y); }, LW * 1.1);
    else ln(c, c => { c.moveTo(x - w, y); c.quadraticCurveTo(x, y + w * 0.85, x + w, y); }, LW * 1.1);
  }
  function blush(c, dx, y, r = 4.6) { c.beginPath(); ell(c, -dx, y, r, r * 0.6); ell(c, dx, y, r, r * 0.6); c.fillStyle = BLUSH; c.fill(); }
  function blush1(c, x, y, r = 4.2) { c.beginPath(); ell(c, x, y, r, r * 0.6); c.fillStyle = BLUSH; c.fill(); }
  function whisk(c, dx, y, len = 9) {
    ln(c, c => { for (const g of SG) { c.moveTo(dx * g, y); c.lineTo((dx + len) * g, y - 2); c.moveTo(dx * g, y + 3); c.lineTo((dx + len) * g, y + 4.5); } }, LW * 0.7);
  }
  /* bec frontal (ocells) */
  function beak(c, s, x, y, w, h, col) {
    if (s.happy || s.surp || s.jump) {
      O(c, x, y + h * 0.7, w * 0.6, h * 0.5, MOUTH, { d: 0 });
      P(c, c => { c.moveTo(x - w * 0.6, y + h * 0.75); c.quadraticCurveTo(x, y + h * 0.7, x + w * 0.6, y + h * 0.75); c.quadraticCurveTo(x + w * 0.2, y + h * 1.25, x, y + h * 1.35); c.quadraticCurveTo(x - w * 0.2, y + h * 1.25, x - w * 0.6, y + h * 0.75); c.closePath(); }, col, { d: 1 });
    }
    P(c, c => { c.moveTo(x - w, y); c.quadraticCurveTo(x, y - h * 0.4, x + w, y); c.quadraticCurveTo(x + w * 0.4, y + h * 0.55, x, y + h); c.quadraticCurveTo(x - w * 0.4, y + h * 0.55, x - w, y); c.closePath(); }, col, { d: 1.3, hl: [x - w * 0.3, y, w * 0.3, h * 0.15] });
  }
  /* bec lateral (mira a la dreta) */
  function sideBeak(c, s, x, y, L, h, col) {
    const op = s.happy || s.surp || s.jump ? 0.3 : 0;
    if (op) {
      O(c, x + 2, y + 1, h * 0.5, h * 0.45, MOUTH, { d: 0 });
      c.save(); rot(c, x, y, op);
      P(c, c => { c.moveTo(x, y); c.quadraticCurveTo(x + L * 0.6, y, x + L * 0.8, y + h * 0.15); c.quadraticCurveTo(x + L * 0.4, y + h * 0.6, x, y + h * 0.5); c.closePath(); }, col, { d: 1 });
      c.restore();
    }
    c.save(); if (op) rot(c, x, y, -op * 0.5);
    P(c, c => { c.moveTo(x, y - h * 0.5); c.quadraticCurveTo(x + L * 0.7, y - h * 0.45, x + L, y + h * 0.1); c.quadraticCurveTo(x + L * 0.5, y + h * 0.35, x, y + h * 0.45); c.closePath(); }, col, { d: 1.2 });
    c.restore();
  }
  /* pota d'ocell */
  function foot(c, x, y0, col) {
    tube(c, c => { c.moveTo(x, y0); c.lineTo(x, 41.5); c.moveTo(x - 5, 44.5); c.lineTo(x, 41.5); c.lineTo(x + 5, 44.5); c.moveTo(x, 41.5); c.lineTo(x + 0.5, 45); }, 2.4, col, false);
  }
  /* falca (ratlles de tigre, zebra) */
  function wedge(c, x, y, a, len, w) {
    const ca = Math.cos(a), sa = Math.sin(a);
    c.moveTo(x - sa * w, y + ca * w);
    c.quadraticCurveTo(x + ca * len * 0.55 - sa * w * 0.9, y + sa * len * 0.55 + ca * w * 0.9, x + ca * len, y + sa * len);
    c.quadraticCurveTo(x + ca * len * 0.55 + sa * w * 0.9, y + sa * len * 0.55 - ca * w * 0.9, x + sa * w, y - ca * w);
    c.closePath();
  }

  /* ── cossos tipus ── */
  // assegut, frontal (potes amb coixinets)
  function sit(c, s, col, o = NO) {
    P(c, E(0, 25, 20, 18), col, { inner: o.inner, hl: [-8, 16, 6, 3.5, -0.5] });
    if (o.belly) O(c, 0, 29, 12, 12.5, o.belly, { d: 2 });
    const pw = o.paw || col;
    for (const g of SG) O(c, 10 * g, 40.5, 8, 4.6, pw, { d: 1.5, hl: [10 * g - 2, 38.5, 3, 1.2] });
    if (o.arms !== false) for (const g of SG) O(c, 13.5 * g, 28, 5, 8.5, o.armc || col, { r: 0.42 * g, d: 1.5 });
  }
  // dret, frontal (quatre potes amb peülles)
  function stand(c, s, col, o = NO) {
    const w = o.lw || 9, hoof = o.hoof, nails = o.nails;
    const leg = (x, y0, cc) => P(c, RR(x - w / 2, y0, w, 45 - y0, w * 0.45), cc, {
      d: 1.5,
      inner: hoof ? c => { c.fillStyle = hoof; c.fillRect(x - w, 40.5, w * 2, 6); c.beginPath(); c.moveTo(x - w, 40.5); c.lineTo(x + w, 40.5); c.stroke(); }
        : nails ? c => { c.beginPath(); ell(c, x - w * 0.22, 43.5, w * 0.17, 1.6); ell(c, x + w * 0.22, 43.5, w * 0.17, 1.6); c.fillStyle = "#F6EEE6"; c.fill(); } : null,
    });
    const bx = 6.5 + w * 0.9;
    leg(-bx, 27, dk(col, 0.1)); leg(bx, 27, dk(col, 0.1));
    P(c, E(0, 22, 21, 14), col, { inner: o.inner, hl: [-9, 14, 6, 3, -0.3] });
    leg(-w * 0.78, 29, col); leg(w * 0.78, 29, col);
  }

  const D = {};

  /* ════════════ GRANJA ════════════ */
  D.vaca = (c, s) => {
    const col = "#FFF8EE", spot = "#4C3D3A", pk = "#F8B4BD";
    c.save(); rot(c, 17, 22, s.wag * 0.12);
    tube(c, c => { c.moveTo(16, 24); c.quadraticCurveTo(30, 22, 30, 9); }, 2.6, col);
    O(c, 30, 7, 3.4, 5, spot, { d: 1 });
    c.restore();
    stand(c, s, col, { hoof: "#6E5852", inner: c => { c.fillStyle = spot; c.beginPath(); ell(c, -13, 26, 8, 6.5, 0.4); ell(c, 14, 17, 7, 5.5, -0.3); c.fill(); } });
    for (const g of SG) O(c, 12 * g, -32, 3.6, 7.5, "#F2DFAE", { r: 0.45 * g, d: 1.2 });
    const ea = 0.3 + (s.sad ? 0.45 : 0) + Math.sin(s.t * 3) * 0.05;
    for (const g of SG) { O(c, 26 * g, -15, 10, 5.2, col, { r: ea * g, d: 1.5 }); O(c, 27 * g, -15, 6, 2.6, pk, { r: ea * g, d: 0, ol: false }); }
    O(c, 0, -12, 25, 22, col, { inner: c => { c.fillStyle = spot; c.beginPath(); ell(c, 15, -24, 11, 8.5, -0.5); c.fill(); }, hl: [-9, -26, 8, 4, -0.3] });
    O(c, 0, 3, 19, 11, pk, { d: 2, hl: [-8, -2, 5, 2] });
    c.fillStyle = "#C96B7B"; c.beginPath(); ell(c, -6.5, 1.5, 2.3, 3.2, 0.2); ell(c, 6.5, 1.5, 2.3, 3.2, -0.2); c.fill();
    eyes(c, s, 10, -15, 4.6);
    blush(c, 20, -5);
    mouth(c, s, 0, 8, 4);
    O(c, 0, 18.5, 4.4, 4.4, "#F7C548", { d: 1.2 }); dot(c, 0, 20, 1.2, OL);
  };

  D.porc = (c, s) => {
    const col = "#F7AEC0", sn = "#F28CA6", ns = "#B5566F";
    c.save(); rot(c, 17, 20, s.wag * 0.15);
    tube(c, c => { c.moveTo(16, 22); c.bezierCurveTo(26, 20, 32, 14, 28, 9); c.bezierCurveTo(24, 5, 20, 12, 26, 14); }, 2.6, col);
    c.restore();
    stand(c, s, col, { hoof: "#C9718A" });
    const ea = s.sad ? 0.5 : Math.sin(s.t * 2.5) * 0.04;
    for (const g of SG) {
      c.save(); rot(c, 16 * g, -24, ea * g);
      P(c, c => { c.moveTo(7 * g, -28); c.quadraticCurveTo(20 * g, -46, 29 * g, -42); c.quadraticCurveTo(31 * g, -30, 24 * g, -19); c.closePath(); }, col, { d: 1.5 });
      P(c, c => { c.moveTo(13 * g, -29); c.quadraticCurveTo(21 * g, -40, 26 * g, -38); c.quadraticCurveTo(27 * g, -30, 22 * g, -24); c.closePath(); }, sn, { d: 0, ol: false });
      c.restore();
    }
    O(c, 0, -10, 27, 23, col, { hl: [-10, -24, 8, 4, -0.4] });
    eyes(c, s, 12, -14, 4.4);
    blush(c, 20, -1);
    O(c, 0, 1, 11.5, 8.5, sn, { d: 1.8, hl: [-4, -3, 4, 1.8] });
    c.fillStyle = ns; c.beginPath(); ell(c, -4, 1.5, 2, 3.4); ell(c, 4, 1.5, 2, 3.4); c.fill();
    mouth(c, s, 0, 12.5, 3.6);
  };

  D.gallina = (c, s) => {
    const col = "#EFA766", lite = "#FBDDB0", red = "#E8473E", bk = "#F8AA34", tl = "#B9623A";
    for (const x of [-6, 7]) foot(c, x, 34, bk);
    c.save(); rot(c, -18, 6, s.wag * 0.05);
    O(c, -29, 4, 5, 12, tl, { r: -1.0, d: 1.4 });
    O(c, -27, -5, 5.5, 13, dk(col, 0.1), { r: -0.55, d: 1.4 });
    O(c, -20, -10, 5, 12, tl, { r: -0.2, d: 1.4 });
    c.restore();
    O(c, -2, 16, 25, 21, col, { inner: c => { c.beginPath(); ell(c, 14, 20, 12, 15); c.fillStyle = lite; c.fill(); }, hl: [-12, 4, 7, 3.5, -0.4] });
    c.save(); rot(c, -14, 10, Math.sin(s.t * 3) * 0.06 - (s.happy || s.jump ? 0.3 : 0));
    P(c, c => { c.moveTo(-20, 10); c.bezierCurveTo(-12, 2, 6, 6, 6, 16); c.bezierCurveTo(6, 24, -6, 28, -12, 26); c.bezierCurveTo(-16, 25, -18, 22, -15, 20); c.bezierCurveTo(-20, 19, -21, 15, -18, 14); c.bezierCurveTo(-22, 13, -22, 11, -20, 10); c.closePath(); }, dk(col, 0.08), { d: 1.5 });
    ln(c, c => { c.moveTo(-10, 14); c.quadraticCurveTo(-3, 15, 1, 20); }, LW * 0.8);
    c.restore();
    blob(c, [[11, -27, 4.5], [17, -30.5, 5.5], [23.5, -27, 4.5]], red, { d: 1.5 });
    O(c, 17, -13, 14, 14, col, { hl: [11, -21, 4.5, 2.5, -0.4] });
    O(c, 29.5, -3, 2.6, 4.2, red, { d: 1 });
    sideBeak(c, s, 28.5, -11, 10, 7, bk);
    eye(c, s, 13, -14, 3.8); eye(c, s, 22, -14, 3.6);
    brow(c, s, 13, -14, 3.8, -1); brow(c, s, 22, -14, 3.6, 1);
    blush1(c, 11, -6, 3.6); blush1(c, 25, -5, 3);
  };

  D.ovella = (c, s) => {
    const wool = "#FFFDF7", face = "#F4D8C6", dark = "#5C5052";
    for (const g of SG) { P(c, RR(14 * g - 3.5, 28, 7, 17, 3), dk(dark, 0.1), { d: 1 }); }
    for (const g of SG) { P(c, RR(6 * g - 3.5, 30, 7, 15, 3), dark, { d: 1 }); }
    const pts = [[0, 16, 21, 12]];
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; pts.push([Math.cos(a) * 21, 16 + Math.sin(a) * 12, 8.5]); }
    blob(c, pts, wool, { hl: [-12, 6, 7, 3.5, -0.3] });
    const ea = 0.35 + (s.sad ? 0.5 : 0) + Math.sin(s.t * 2.8) * 0.06;
    for (const g of SG) { O(c, 19 * g, -11, 8.5, 4.4, face, { r: ea * g, d: 1.2 }); O(c, 20 * g, -11, 5, 2.2, PINKIN, { r: ea * g, d: 0, ol: false }); }
    O(c, 0, -8, 15, 18, face, { hl: [-6, -14, 4, 2.5, -0.3] });
    blob(c, [[-10, -21, 7], [-3, -27, 8], [5, -27, 8], [11, -21, 7], [0, -21, 7]], wool, { d: 2 });
    eyes(c, s, 6.5, -8, 4);
    blush(c, 10.5, 0, 3.6);
    P(c, c => { c.moveTo(-3, 1.5); c.quadraticCurveTo(0, 0.5, 3, 1.5); c.quadraticCurveTo(1, 4.2, 0, 4.4); c.quadraticCurveTo(-1, 4.2, -3, 1.5); c.closePath(); }, "#C77B86", { d: 0 });
    mouth(c, s, 0, 6, 2.8, "w");
  };

  // èquids: cavall, zebra, ruc
  function equine(c, s, q) {
    c.save(); rot(c, 16, 18, s.wag * 0.1);
    if (q.bigTail) P(c, c => { c.moveTo(14, 14); c.bezierCurveTo(30, 10, 38, 26, 32, 42); c.bezierCurveTo(28, 36, 24, 30, 16, 26); c.closePath(); }, q.mane, { d: 2 });
    else { tube(c, c => { c.moveTo(16, 20); c.quadraticCurveTo(30, 18, 30, 32); }, 2.6, q.col); O(c, 30, 35, 3.8, 6, q.mane, { d: 1 }); }
    c.restore();
    stand(c, s, q.col, { hoof: q.hoof, inner: q.bodyInner });
    if (q.bigTail) P(c, c => { c.moveTo(-4, -36); c.bezierCurveTo(-26, -34, -28, -6, -20, 14); c.lineTo(-8, 10); c.closePath(); }, q.mane, { d: 2 });
    if (q.mohawk) P(c, RR(-5, -46, 10, 20, 5), q.col, { d: 1.5, inner: q.mohawk });
    const ea = (s.sad ? 0.7 : 0) + Math.sin(s.t * 2.2) * 0.05;
    for (const g of SG) {
      c.save(); rot(c, 10 * g, -30, ea * g);
      if (q.longEars) { O(c, 13 * g, -40, 5.5, 14, q.col, { r: 0.35 * g, d: 1.5, inner: c => { c.beginPath(); ell(c, 13 * g, -40, 3, 10, 0.35 * g); c.fillStyle = PINKIN; c.fill(); c.beginPath(); ell(c, 18 * g, -54, 7, 7); c.fillStyle = q.mane; c.fill(); } }); }
      else { O(c, 12 * g, -35, 5, 9, q.col, { r: 0.35 * g, d: 1.3, inner: c => { c.beginPath(); ell(c, 12 * g, -34, 2.6, 6, 0.35 * g); c.fillStyle = q.earIn || PINKIN; c.fill(); } }); }
      c.restore();
    }
    O(c, 0, -12, 19, 24, q.col, { inner: q.headInner, hl: [-7, -27, 6, 3.5, -0.3] });
    O(c, 0, 4, 15.5, 10.5, q.mz, { d: 2, hl: [-6, 0, 4, 1.8] });
    c.fillStyle = q.nos; c.beginPath(); ell(c, -5.5, 3, 1.8, 2.6, 0.3); ell(c, 5.5, 3, 1.8, 2.6, -0.3); c.fill();
    if (q.forelock) blob(c, [[-6, -33, 5.5], [1, -35, 6.5], [7, -31, 5], [-1, -28, 4.5]], q.mane, { d: 1.5 });
    if (q.tuft) blob(c, [[-3, -35, 3.5], [2, -37, 4], [5, -33, 3]], q.mane, { d: 1 });
    eyes(c, s, 8.5, -14, 4.3);
    blush(c, 14, -5, 3.8);
    mouth(c, s, 0, 9.5, 3.4);
  }
  D.cavall = (c, s) => equine(c, s, { col: "#C98B5B", mz: "#EBC7A3", mane: "#6E432C", hoof: "#4F3A32", nos: "#8C5A40", bigTail: true, forelock: true });
  D.zebra = (c, s) => {
    const K = "#2F2A2C";
    equine(c, s, {
      col: "#FBFAF7", mz: "#5A5257", mane: K, hoof: K, nos: "#2B2320", earIn: "#E8DCE0",
      mohawk: c => { c.fillStyle = K; for (let y = -44; y < -26; y += 6) c.fillRect(-6, y, 12, 3); },
      bodyInner: c => { c.fillStyle = K; c.beginPath(); for (let i = -3; i <= 3; i++) wedge(c, i * 6.5, 6, Math.PI / 2 + i * 0.12, 18, 2.8); c.fill(); },
      headInner: c => { c.fillStyle = K; c.beginPath(); wedge(c, 0, -40, Math.PI / 2, 16, 3); for (const g of SG) { wedge(c, 8 * g, -39, Math.PI / 2 + 0.5 * g, 14, 2.6); wedge(c, 23 * g, -27, g > 0 ? Math.PI + 0.25 : -0.25, 16, 3); wedge(c, 23 * g, -18, g > 0 ? Math.PI + 0.1 : -0.1, 14, 2.8); wedge(c, 22 * g, -9, g > 0 ? Math.PI - 0.1 : 0.1, 10, 2.4); } c.fill(); },
    });
  };
  D.ruc = (c, s) => equine(c, s, { col: "#A9A3B4", mz: "#ECE6E8", mane: "#544D5C", hoof: "#4A4350", nos: "#7D7488", longEars: true, tuft: true });

  D.cabra = (c, s) => {
    const col = "#E2C9A3", wh = "#FBF6EE", horn = "#A49284";
    c.save(); rot(c, 18, 14, s.wag * 0.2); O(c, 22, 10, 3.5, 6.5, col, { r: 0.6, d: 1 }); c.restore();
    stand(c, s, col, { hoof: "#5B4A44" });
    for (const g of SG) P(c, c => { c.moveTo(4 * g, -29); c.quadraticCurveTo(8 * g, -47, 24 * g, -45); c.quadraticCurveTo(14 * g, -41, 12 * g, -28); c.closePath(); }, horn, { d: 1.2, inner: c => { c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(5 * g, -34 - i * 3.6); c.lineTo(13 * g, -33 - i * 3.6); } c.lineWidth = 1.2; c.strokeStyle = dk(horn, 0.3); c.stroke(); } });
    const ea = 0.45 + (s.sad ? 0.4 : 0) + Math.sin(s.t * 3) * 0.05;
    for (const g of SG) { O(c, 22 * g, -13, 10, 4.6, col, { r: ea * g, d: 1.4 }); O(c, 23 * g, -13, 6, 2.3, PINKIN, { r: ea * g, d: 0, ol: false }); }
    O(c, 0, -12, 19, 22, col, { hl: [-7, -25, 6, 3.5, -0.3] });
    P(c, c => { c.moveTo(-6, 9); c.quadraticCurveTo(-4, 20, 0, 25); c.quadraticCurveTo(4, 20, 6, 9); c.closePath(); }, wh, { d: 1.5 });
    O(c, 0, 3, 13, 9, wh, { d: 1.8 });
    c.fillStyle = "#B88E86"; c.beginPath(); ell(c, -4.5, 1.5, 1.6, 2.4, 0.3); ell(c, 4.5, 1.5, 1.6, 2.4, -0.3); c.fill();
    eyes(c, s, 8.5, -13, 4.3);
    blush(c, 14, -4, 3.8);
    mouth(c, s, 0, 7.5, 3);
  };

  D.conill = (c, s) => {
    const col = "#CBC3D3", wh = "#FBF7F4";
    O(c, 22, 36, 6, 5.5, wh, { d: 1.2 });
    sit(c, s, col, { belly: wh });
    const ea = (s.sad ? 0.9 : 0.1) + Math.sin(s.t * 2) * 0.05;
    for (const g of SG) {
      c.save(); rot(c, 8 * g, -20, ea * g + (g > 0 ? Math.max(0, Math.sin(s.t * 1.3 + 1)) * 0.12 : 0));
      O(c, 9 * g, -35, 7, 15, col, { r: 0.08 * g, d: 2, inner: c => { c.beginPath(); ell(c, 9 * g, -34, 3.6, 10.5, 0.08 * g); c.fillStyle = PINKIN; c.fill(); } });
      c.restore();
    }
    O(c, 0, -4, 23, 20, col, { hl: [-9, -15, 7, 3.5, -0.4] });
    O(c, 0, 4, 9, 6, wh, { d: 1.2 });
    eyes(c, s, 10, -6, 4.6);
    blush(c, 16, 2, 4);
    P(c, c => { c.moveTo(-3, 0); c.quadraticCurveTo(0, -1, 3, 0); c.quadraticCurveTo(1, 3, 0, 3.2); c.quadraticCurveTo(-1, 3, -3, 0); c.closePath(); }, "#F08CA3", { d: 0 });
    if (!(s.happy || s.jump || s.surp)) P(c, RR(-2.6, 6.4, 5.2, 4.2, 1), "#FFFFFF", { d: 0 });
    mouth(c, s, 0, 4.5, 3, "w");
    whisk(c, 9, 3.5, 8);
  };

  D.gat = (c, s) => {
    const col = "#F5A25A", belly = "#FFE8CC", st = "#D9772F";
    c.save(); rot(c, 16, 38, s.wag * 0.08);
    tube(c, c => { c.moveTo(14, 38); c.bezierCurveTo(36, 40, 38, 14, 30, 6); }, 6, col);
    c.restore();
    sit(c, s, col, { belly });
    for (const g of SG) {
      c.save(); rot(c, 16 * g, -24, (s.sad ? 0.5 : 0) * g);
      P(c, c => { c.moveTo(25 * g, -14); c.quadraticCurveTo(27 * g, -36, 22 * g, -40); c.quadraticCurveTo(15 * g, -36, 6 * g, -26); c.closePath(); }, col, { d: 1.5 });
      P(c, c => { c.moveTo(21 * g, -19); c.quadraticCurveTo(22 * g, -32, 20.5 * g, -34); c.quadraticCurveTo(16 * g, -31, 11 * g, -25); c.closePath(); }, PINKIN, { d: 0, ol: false });
      c.restore();
    }
    O(c, 0, -8, 26, 22, col, { inner: c => { c.fillStyle = st; c.beginPath(); wedge(c, 0, -30, Math.PI / 2, 9, 2); wedge(c, -6, -29, Math.PI / 2 + 0.25, 7, 1.6); wedge(c, 6, -29, Math.PI / 2 - 0.25, 7, 1.6); for (const g of SG) { wedge(c, 26 * g, -8, g > 0 ? Math.PI : 0, 7, 1.6); wedge(c, 26 * g, -2, g > 0 ? Math.PI : 0, 6, 1.4); } c.fill(); }, hl: [-12, -20, 7, 3.5, -0.4] });
    O(c, 0, 3, 11, 7, belly, { d: 1.2 });
    eyes(c, s, 10.5, -9, 4.8);
    blush(c, 17, 1, 4);
    P(c, c => { c.moveTo(-3, -1.5); c.quadraticCurveTo(0, -2.5, 3, -1.5); c.quadraticCurveTo(1, 1.5, 0, 1.8); c.quadraticCurveTo(-1, 1.5, -3, -1.5); c.closePath(); }, "#F08CA3", { d: 0 });
    mouth(c, s, 0, 2.5, 3.2, "w");
    whisk(c, 11, 1, 9);
  };

  D.gos = (c, s) => {
    const col = "#EBC995", ear = "#A06B45", wh = "#FFF4E2";
    c.save(); rot(c, 16, 34, Math.sin(s.t * 12) * (s.happy ? 0.3 : 0.15));
    tube(c, c => { c.moveTo(14, 34); c.quadraticCurveTo(30, 32, 31, 18); }, 5, col);
    c.restore();
    sit(c, s, col, { belly: wh });
    P(c, RR(-13, 9, 26, 6, 3), "#E5534B", { d: 1.2 });
    O(c, 0, 18, 3.6, 3.6, "#F7C548", { d: 1 });
    O(c, 0, -10, 24, 21, col, { inner: c => { c.beginPath(); ell(c, 10, -15, 9, 8.5, 0.2); c.fillStyle = ear; c.fill(); }, hl: [-10, -22, 7, 3.5, -0.4] });
    O(c, 0, 1, 12, 9, wh, { d: 1.5 });
    const ea = (s.sad ? 0.25 : -0.12) + Math.sin(s.t * 3) * 0.05 + (s.surp || s.jump ? -0.35 : 0);
    for (const g of SG) { c.save(); rot(c, 19 * g, -24, -ea * g); O(c, 23 * g, -10, 7, 14, ear, { r: -0.25 * g, d: 2 }); c.restore(); }
    eyes(c, s, 10, -14, 4.5);
    blush(c, 15, -3, 3.8);
    O(c, 0, -4, 5, 3.6, NOSE, { d: 0, hl: [-1.6, -5.4, 1.6, 0.9] });
    ln(c, c => { c.moveTo(0, -0.5); c.lineTo(0, 1.5); }, LW);
    mouth(c, s, 0, 1.5, 3.5, s.happy || s.jump ? null : "w");
    if (!(s.happy || s.jump || s.surp || s.sad)) P(c, c => { c.moveTo(-2.4, 3.4); c.lineTo(2.4, 3.4); c.quadraticCurveTo(2.6, 8.5, 0, 8.5); c.quadraticCurveTo(-2.6, 8.5, -2.4, 3.4); c.closePath(); }, TONGUE, { d: 0 });
  };

  D.pollet = (c, s) => {
    const col = "#FFD84D", org = "#F79A2E", shell = "#FFFDF7";
    c.save(); rot(c, 0, 40, Math.sin(s.t * 3) * 0.04);
    const fl = Math.sin(s.t * 9) * 0.15 + (s.happy || s.jump ? 0.4 : 0);
    for (const g of SG) { c.save(); rot(c, 22 * g, 0, -fl * g); O(c, 25 * g, 4, 6, 10, col, { r: 0.55 * g, d: 1.5 }); c.restore(); }
    for (const a of [-0.45, 0, 0.45]) { c.save(); rot(c, 0, -26, a); O(c, 0, -32, 2.6, 6, col, { d: 1 }); c.restore(); }
    O(c, 0, -2, 26, 27, col, { hl: [-10, -16, 8, 4, -0.4] });
    eyes(c, s, 9, -7, 4.6);
    blush(c, 16, 1, 4);
    beak(c, s, 0, -1, 4.5, 5, org);
    P(c, c => {
      const z = [[-29, 13], [-22, 7], [-15, 14], [-8, 7], [-1, 14], [6, 7], [13, 14], [20, 7], [29.5, 13]];
      c.moveTo(z[0][0], z[0][1]); for (let i = 1; i < z.length; i++) c.lineTo(z[i][0], z[i][1]);
      c.ellipse(0, 16, 29.5, 29, 0, 0, Math.PI); c.closePath();
    }, shell, { d: 3, hl: [-16, 24, 5, 8, 0.4] });
    c.restore();
  };

  D.anec = (c, s) => {
    const col = "#FCF9F3", org = "#F9A23A";
    for (const g of SG) O(c, 9 * g, 42, 8, 3.4, org, { d: 1 });
    const fl = Math.sin(s.t * 8) * 0.1 + (s.happy || s.jump ? 0.5 : 0);
    for (const g of SG) { c.save(); rot(c, 20 * g, 8, -fl * g); O(c, 24 * g, 18, 7, 13, col, { r: 0.35 * g, d: 2 }); c.restore(); }
    O(c, 0, 21, 24, 20, col, { hl: [-10, 12, 7, 3.5, -0.4] });
    O(c, 0, -13, 20, 18, col, { hl: [-8, -24, 6, 3, -0.4] });
    tube(c, c => { c.moveTo(0, -30); c.quadraticCurveTo(1, -38, 6, -38); c.quadraticCurveTo(9, -37, 7, -34); }, 3, col);
    eyes(c, s, 8.5, -16, 4.3);
    blush(c, 14, -7, 3.8);
    if (s.happy || s.surp || s.jump) {
      O(c, 0, -3, 8, 4.5, MOUTH, { d: 0 });
      O(c, 0, 0.5, 10, 3.5, org, { d: 1 });
      O(c, 0, -7, 12.5, 4.6, org, { d: 1.2, hl: [-5, -9, 4, 1.2] });
    } else {
      O(c, 0, -5, 12.5, 5.6, org, { d: 1.5, hl: [-5, -8, 4, 1.4] });
      ln(c, c => { c.moveTo(-9, -5); c.quadraticCurveTo(0, -2, 9, -5); }, LW * 0.9);
    }
  };

  /* ════════════ MAR ════════════ */
  D.peix = (c, s) => {
    const col = "#FF9A3D", fin = "#FF7B2E";
    const sw = Math.sin(s.t * 6) * 0.15;
    c.translate(0, Math.sin(s.t * 2) * 1.2);
    for (let i = 0; i < 2; i++) { const yy = -10 - i * 10 - ((s.t * 8) % 10); P(c, E(36 + i * 5, yy, 2.8 - i * 0.6, 2.8 - i * 0.6), "#DDF4FF", { d: 0 }); }
    c.save(); rot(c, -24, 8, sw);
    P(c, c => { c.moveTo(-22, 8); c.quadraticCurveTo(-36, -8, -46, -12); c.quadraticCurveTo(-39, 8, -46, 28); c.quadraticCurveTo(-36, 24, -22, 8); c.closePath(); }, fin, { d: 2 });
    c.restore();
    P(c, c => { c.moveTo(-14, -10); c.quadraticCurveTo(-6, -30, 12, -20); c.quadraticCurveTo(8, -14, 8, -12); c.closePath(); }, fin, { d: 1.5 });
    O(c, 0, 10, 31, 24, col, {
      inner: c => { for (const x of [5, -16]) { c.beginPath(); c.moveTo(x - 3, -16); c.quadraticCurveTo(x - 9, 10, x - 3, 36); c.lineTo(x + 3, 36); c.quadraticCurveTo(x - 3, 10, x + 3, -16); c.closePath(); c.fillStyle = "#FFFFFF"; c.fill(); c.lineWidth = 1.6; c.stroke(); } },
      hl: [-6, -4, 10, 4, -0.15],
    });
    c.save(); rot(c, -4, 16, sw * 2); O(c, -6, 20, 8, 4.5, fin, { r: 0.5, d: 1 }); c.restore();
    eye(c, s, 17, 2, 5.5); brow(c, s, 17, 2, 5.5, -1);
    blush1(c, 18, 12, 4);
    mouth(c, s, 27, 12, 3);
  };

  D.pop = (c, s) => {
    const col = "#B784E0", suck = "#EBD6FA";
    const xs = [-21, -13, -5, 5, 13, 21];
    for (let i = 0; i < 6; i++) {
      const x0 = xs[i], g = x0 < 0 ? -1 : 1, wv = Math.sin(s.t * 3 + i * 1.3) * 3;
      const p0 = [x0, 6], p1 = [x0 + wv, 30], p2 = [x0 + g * 12 + wv, 46], p3 = [x0 + g * 20, 36];
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12, a = (1 - u) ** 3, b = 3 * (1 - u) ** 2 * u, d = 3 * (1 - u) * u * u, e = u ** 3;
        pts.push([a * p0[0] + b * p1[0] + d * p2[0] + e * p3[0], a * p0[1] + b * p1[1] + d * p2[1] + e * p3[1], 7 - u * 4.3]);
      }
      blob(c, pts, i % 2 ? col : dk(col, 0.06), { d: 1.5 });
      dots(c, [pts[5], pts[7], pts[9]].map(p => [p[0] - g * 0.5, p[1] + 1.5, 1.3]), suck);
    }
    O(c, 0, -14, 28, 27, col, { hl: [-11, -30, 9, 5, -0.4] });
    dots(c, [[12, -30, 3], [18, -22, 2], [6, -36, 1.8]], lt(col, 0.4));
    eyes(c, s, 10, -10, 5.4);
    blush(c, 19, -1, 4.2);
    mouth(c, s, 0, 2, 3.5);
  };

  D.cranc = (c, s) => {
    const col = "#F26B52";
    const LG = [[20, 12, 35, 6, 44, 20], [22, 19, 38, 17, 44, 33], [19, 26, 32, 30, 36, 43]];
    for (const g of SG) for (let i = 0; i < 3; i++) {
      const q = LG[i], wv = Math.sin(s.t * 5 + i + g) * 1.2;
      tube(c, c => { c.moveTo(q[0] * g, q[1]); c.lineTo(q[2] * g, q[3] + wv); c.lineTo(q[4] * g, q[5]); }, 3.6, col);
    }
    const sn = Math.max(0, Math.sin(s.t * 4)) * 0.35 + (s.happy || s.jump ? 0.25 : 0);
    for (const g of SG) {
      tube(c, c => { c.moveTo(16 * g, 8); c.quadraticCurveTo(28 * g, 4, 31 * g, -8); }, 5, col);
      const cx = 33 * g, cy = -18, mid = -Math.PI / 2 + 0.35 * g, op = 0.45 + sn;
      P(c, c => { c.moveTo(cx, cy); c.ellipse(cx, cy, 12, 11, 0, mid + op, mid - op + TAU); c.closePath(); }, col, { d: 2.5, hl: [cx - 5, cy - 2, 3, 2] });
    }
    for (const g of SG) tube(c, c => { c.moveTo(8 * g, 0); c.lineTo(10 * g, -12); }, 3.4, col);
    O(c, 0, 16, 30, 21, col, { hl: [-12, 4, 9, 4, -0.2] });
    for (const g of SG) { eye(c, s, 10 * g, -16, 5.5, { white: true }); brow(c, s, 10 * g, -16, 5.5, g, { white: true }); }
    blush(c, 18, 17, 4.4);
    mouth(c, s, 0, 18, 4);
  };

  D.balena = (c, s) => {
    const col = "#5D8FD8", belly = "#CFE2F7", water = "#BDE7FF";
    c.translate(0, 4);
    const sp = 0.8 + 0.2 * Math.sin(s.t * 4);
    c.save(); c.translate(12, -14); c.scale(sp, sp);
    tube(c, c => { c.moveTo(0, 0); c.lineTo(0, -16); }, 3.5, water, false);
    for (const g of SG) tube(c, c => { c.moveTo(0, -16); c.quadraticCurveTo(7 * g, -26, 13 * g, -18); }, 3.5, water, false);
    P(c, E(0, -20, 4, 4), water, { d: 0 });
    c.restore();
    c.save(); rot(c, -32, 8, Math.sin(s.t * 3) * 0.1);
    P(c, c => { c.moveTo(-28, 4); c.quadraticCurveTo(-38, 2, -42, -6); c.bezierCurveTo(-46, -8, -52, -14, -50, -22); c.bezierCurveTo(-46, -18, -42, -16, -39, -14); c.bezierCurveTo(-38, -20, -34, -24, -28, -26); c.bezierCurveTo(-30, -18, -32, -10, -26, 14); c.closePath(); }, col, { d: 2 });
    c.restore();
    P(c, c => { c.moveTo(-36, 4); c.bezierCurveTo(-20, -4, -4, -16, 18, -16); c.bezierCurveTo(36, -16, 46, 0, 46, 14); c.bezierCurveTo(46, 30, 34, 38, 14, 38); c.bezierCurveTo(-8, 38, -22, 28, -36, 12); c.closePath(); }, col, {
      inner: c => { c.beginPath(); ell(c, 14, 40, 34, 17); c.fillStyle = belly; c.fill(); c.beginPath(); for (let i = 0; i < 3; i++) { c.moveTo(-2 + i * 8, 30 + i * 0.5); c.quadraticCurveTo(10 + i * 9, 33, 22 + i * 7, 31); } c.lineWidth = 1.4; c.strokeStyle = dk(belly, 0.25); c.stroke(); },
      hl: [4, -8, 12, 4, -0.1],
    });
    O(c, 4, 30, 9, 4.5, dk(col, 0.1), { r: 0.5, d: 1 });
    eye(c, s, 26, 8, 5); brow(c, s, 26, 8, 5, -1);
    blush1(c, 34, 16, 4);
    if (s.happy || s.jump || s.surp) mouth(c, s, 36, 21, 4);
    else ln(c, c => { c.moveTo(45, 19); c.quadraticCurveTo(38, 25, 26, 21); }, LW * 1.1);
  };

  D.tortuga = (c, s) => {
    const skin = "#A9D86E", shell = "#5BAE72", plate = "#86CB93", rim = "#3F8C5A";
    const pd = Math.sin(s.t * 3) * 0.12;
    c.save(); rot(c, -26, 32, -pd); O(c, -32, 38, 9, 4.5, skin, { r: -0.3, d: 1.2 }); c.restore();
    O(c, -38, 30, 4, 2.5, skin, { d: 0.8 });
    tube(c, c => { c.moveTo(20, 24); c.quadraticCurveTo(28, 22, 34, 16); }, 9, skin);
    O(c, 37, 11, 12, 11, skin, { hl: [33, 5, 4, 2, -0.3] });
    P(c, c => { c.moveTo(-36, 28); c.bezierCurveTo(-36, -18, 32, -18, 32, 28); c.closePath(); }, shell, {
      inner: c => {
        const hex = (x, y, r) => { c.moveTo(x + r, y); for (let i = 1; i < 6; i++) c.lineTo(x + r * Math.cos(i * TAU / 6), y + r * Math.sin(i * TAU / 6)); c.closePath(); };
        c.beginPath(); hex(-2, 6, 10); hex(-21, 14, 8.5); hex(17, 14, 8.5); hex(-12, -6, 6); hex(8, -6, 6);
        c.fillStyle = plate; c.fill(); c.lineWidth = 1.6; c.strokeStyle = dk(shell, 0.2); c.stroke();
      },
      hl: [-14, -2, 8, 4, -0.4],
    });
    P(c, RR(-39, 24, 74, 9, 4.5), rim, { d: 1.5 });
    c.save(); rot(c, 18, 32, pd); O(c, 23, 38, 12, 5, skin, { r: 0.3, d: 1.2 }); c.restore();
    eye(c, s, 33, 8, 3.6); eye(c, s, 42, 8, 3.4);
    brow(c, s, 33, 8, 3.6, -1); brow(c, s, 42, 8, 3.4, 1);
    blush1(c, 31, 15, 3); blush1(c, 46, 14, 2.6);
    mouth(c, s, 39, 15, 3);
  };

  D.estrella = (c, s) => {
    const col = "#FF9F5A";
    const R = 43, r = 21, cy = 4, pts = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5 + (i % 2 ? 0 : Math.sin(s.t * 2 + i) * 0.04);
      const rr = i % 2 ? r : R; pts.push([Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    const path = c => {
      const L = pts[9], F = pts[0]; c.moveTo((L[0] + F[0]) / 2, (L[1] + F[1]) / 2);
      for (let i = 0; i < 10; i++) { const p = pts[i], q = pts[(i + 1) % 10]; c.arcTo(p[0], p[1], q[0], q[1], i % 2 ? 7 : 8); }
      c.closePath();
    };
    P(c, path, col, {
      inner: c => { const d = []; for (let i = 0; i < 10; i += 2) { const p = pts[i]; d.push([p[0] * 0.62, cy + (p[1] - cy) * 0.62, 2.2], [p[0] * 0.8, cy + (p[1] - cy) * 0.8, 1.6]); } dots(c, d, lt(col, 0.45)); },
      hl: [-10, -6, 6, 3, -0.5],
    });
    eyes(c, s, 7, 1, 4.6);
    blush(c, 12, 9, 3.6);
    mouth(c, s, 0, 9, 3.4);
  };

  D.medusa = (c, s) => {
    const col = "#F59DC8", t2 = "#C9A6F2";
    c.translate(0, Math.sin(s.t * 2) * 2);
    for (let i = 0; i < 5; i++) {
      const x0 = -18 + i * 9, ph = s.t * 3 + i;
      tube(c, c => { c.moveTo(x0, 0); c.bezierCurveTo(x0 + Math.sin(ph) * 5, 14, x0 - Math.sin(ph + 1) * 6, 28, x0 + Math.sin(ph + 2) * 4, 42); }, 3.6, i % 2 ? t2 : col);
    }
    const bell = c => { c.moveTo(-30, 2); c.bezierCurveTo(-32, -46, 32, -46, 30, 2); for (let i = 0; i < 5; i++) { const x0 = 30 - i * 12, x1 = x0 - 12; c.quadraticCurveTo((x0 + x1) / 2, 10, x1, 2); } c.closePath(); };
    P(c, bell, col, { inner: c => { c.beginPath(); ell(c, 0, -14, 22, 18); c.fillStyle = lt(col, 0.18); c.fill(); }, hl: [-12, -22, 7, 4, -0.5] });
    dots(c, [[-18, -20, 2.4], [16, -24, 2], [20, -12, 1.6]], lt(col, 0.55));
    eyes(c, s, 10, -11, 5);
    blush(c, 18, -3, 4);
    mouth(c, s, 0, -4, 3.4);
  };

  D.dofi = (c, s) => {
    const col = "#7FAEDB", belly = "#E5F1FB";
    c.translate(0, 8 + Math.sin(s.t * 2) * 1.5);
    P(c, c => { c.moveTo(-12, -10); c.quadraticCurveTo(-12, -24, -20, -30); c.quadraticCurveTo(-2, -28, 4, -13); c.closePath(); }, col, { d: 1.5 });
    c.save(); rot(c, -34, 16, Math.sin(s.t * 4) * 0.12);
    O(c, -39, 10, 9, 4, col, { r: -0.7, d: 1.2 }); O(c, -39, 22, 9, 4, col, { r: 0.7, d: 1.2 });
    c.restore();
    P(c, c => { c.moveTo(-36, 15); c.bezierCurveTo(-20, -6, 2, -16, 22, -12); c.bezierCurveTo(32, -10, 36, -2, 38, 2); c.bezierCurveTo(44, 3, 50, 5, 48, 9); c.bezierCurveTo(44, 13, 36, 12, 32, 14); c.bezierCurveTo(22, 24, 0, 28, -14, 24); c.bezierCurveTo(-24, 22, -30, 20, -36, 18); c.closePath(); }, col, {
      inner: c => { c.beginPath(); c.moveTo(-30, 20); c.quadraticCurveTo(0, 8, 30, 8); c.quadraticCurveTo(46, 8, 50, 10); c.lineTo(50, 40); c.lineTo(-30, 40); c.closePath(); c.fillStyle = belly; c.fill(); },
      hl: [4, -8, 12, 3, -0.15],
    });
    O(c, 6, 20, 9, 4, dk(col, 0.1), { r: 0.6, d: 1 });
    eye(c, s, 26, -1, 4.6); brow(c, s, 26, -1, 4.6, -1);
    blush1(c, 27, 7, 3.6);
    if (s.happy || s.jump || s.surp) mouth(c, s, 38, 9, 3.4);
    else ln(c, c => { c.moveTo(47, 9); c.quadraticCurveTo(40, 12, 33, 9); }, LW);
  };

  D.cavallet = (c, s) => {
    const col = "#FFB648", fin = "#FFE08A";
    c.translate(0, Math.sin(s.t * 2) * 1.5);
    c.save(); rot(c, -10, 2, Math.sin(s.t * 9) * 0.15);
    P(c, c => { c.moveTo(-8, -8); c.quadraticCurveTo(-24, -6, -22, 6); c.quadraticCurveTo(-18, 14, -6, 12); c.closePath(); }, fin, { d: 1.2, inner: c => { c.beginPath(); for (let i = 0; i < 4; i++) { c.moveTo(-8, 2); c.lineTo(-22 + i * 2, -4 + i * 5); } c.lineWidth = 1.2; c.strokeStyle = dk(fin, 0.25); c.stroke(); } });
    c.restore();
    blob(c, [[0, -40, 3.5], [-6, -38, 3.2], [-10, -34, 3]], fin, { d: 1 });
    const tc = [[-2, 26, 7.5], [-8, 31, 6.5], [-9, 37, 5.5], [-5, 41.5, 4.6], [1, 41.5, 3.8], [4, 37.5, 3.2], [2, 33.5, 2.6], [-1, 34, 2]];
    blob(c, [[4, -27, 12], [17, -24, 5], [23, -23, 4.5], [28, -23, 4.5], [0, -14, 9], [4, -1, 13], [6, 11, 12], [2, 20, 9]].concat(tc), col, { d: 2.5, hl: [-2, -32, 4, 2.5, -0.4] });
    ln(c, c => { for (let i = 0; i < 4; i++) { const y = -4 + i * 6; c.moveTo(10 + i * 0.5, y); c.quadraticCurveTo(15 - Math.abs(i - 1.5), y + 1.5, 17 - Math.abs(i - 1.5) * 1.6, y + 0.5); } }, 1.6, dk(col, 0.25));
    eye(c, s, 7, -28, 4.6); brow(c, s, 7, -28, 4.6, -1);
    blush1(c, 10, -19, 3.4);
    ln(c, c => { c.moveTo(32.5, -25.5); c.lineTo(32.5, -20.5); }, LW);
  };

  D.foca = (c, s) => {
    const col = "#9FB0C4", lite = "#DCE5EF";
    for (const g of SG) O(c, 14 * g, 42, 10, 4.2, dk(col, 0.1), { r: 0.25 * g, d: 1 });
    blob(c, [[0, 18, 25, 25], [0, -12, 20]], col, { hl: [-10, -22, 6, 3.5, -0.4] });
    O(c, 0, 24, 15, 15, lite, { d: 2 });
    const fl = Math.sin(s.t * 4) * 0.12 + (s.happy || s.jump ? 0.5 : 0);
    for (const g of SG) { c.save(); rot(c, 20 * g, 12, -fl * g); O(c, 25 * g, 22, 6, 12, col, { r: -0.5 * g, d: 1.5 }); c.restore(); }
    eyes(c, s, 9, -16, 5.4);
    for (const g of SG) O(c, 4.6 * g, -4, 6, 4.6, lite, { d: 1 });
    dots(c, [[-6, -4, 0.9], [-3, -2.5, 0.9], [6, -4, 0.9], [3, -2.5, 0.9]], dk(col, 0.4));
    O(c, 0, -8, 3.8, 2.8, NOSE, { d: 0, hl: [-1.2, -9, 1.2, 0.7] });
    ln(c, c => { for (const g of SG) { c.moveTo(9 * g, -5); c.lineTo(18 * g, -7); c.moveTo(9 * g, -2.5); c.lineTo(18 * g, -1.5); } }, LW * 0.7);
    blush(c, 14, -8, 3.6);
    mouth(c, s, 0, 1, 3);
  };

  /* ════════════ SELVA ════════════ */
  D.lleo = (c, s) => {
    const col = "#F6C063", mane = "#D2702E", muz = "#FFF0CC";
    c.save(); rot(c, 16, 38, s.wag * 0.08);
    tube(c, c => { c.moveTo(14, 38); c.bezierCurveTo(34, 40, 36, 26, 33, 18); }, 4, col);
    O(c, 33, 15, 5, 6, mane, { d: 1.2 });
    c.restore();
    sit(c, s, col, { belly: "#FFE3A6" });
    const pts = [[0, -10, 27, 25]];
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; pts.push([Math.cos(a) * 27, -10 + Math.sin(a) * 25, 9.5]); }
    blob(c, pts, mane, { hl: [-16, -30, 8, 4, -0.6] });
    for (const g of SG) O(c, 16 * g, -25, 6.5, 6.5, col, { d: 1.2, inner: c => { c.beginPath(); ell(c, 16 * g, -24.5, 3.3, 3.3); c.fillStyle = "#E89B57"; c.fill(); } });
    O(c, 0, -8, 21, 19, col, { hl: [-8, -18, 6, 3, -0.4] });
    for (const g of SG) O(c, 5 * g, 2, 7, 5.5, muz, { d: 1.2 });
    eyes(c, s, 9, -11, 4.3);
    blush(c, 14.5, -2, 3.6);
    P(c, c => { c.moveTo(-4, -3); c.quadraticCurveTo(0, -4.5, 4, -3); c.quadraticCurveTo(1.5, 1.5, 0, 1.6); c.quadraticCurveTo(-1.5, 1.5, -4, -3); c.closePath(); }, "#8A4B3A", { d: 0 });
    mouth(c, s, 0, 4.5, 3, "w");
  };

  D.elefant = (c, s) => {
    const col = "#A9B6CC", ein = "#F2C3CF";
    c.save(); rot(c, 16, 18, s.wag * 0.12); tube(c, c => { c.moveTo(16, 20); c.quadraticCurveTo(28, 20, 28, 32); }, 2.4, col); c.restore();
    stand(c, s, col, { lw: 11, nails: true });
    const fl = Math.sin(s.t * 2.5) * 0.06 + (s.sad ? 0.2 : 0);
    for (const g of SG) { c.save(); rot(c, 16 * g, -14, fl * g); O(c, 28 * g, -11, 17, 21, col, { r: 0.15 * g, d: 2.5, inner: c => { c.beginPath(); ell(c, 29 * g, -10, 11, 14.5, 0.15 * g); c.fillStyle = ein; c.fill(); } }); c.restore(); }
    O(c, 0, -14, 22, 21, col, { hl: [-8, -26, 7, 3.5, -0.4] });
    for (const g of SG) O(c, 7 * g, 3, 2.4, 5, "#FFF8E8", { r: -0.3 * g, d: 0.8 });
    const up = s.happy || s.jump;
    const tr = up ? [[0, -6, 7], [2, 1, 6.5], [6, 6, 6], [12, 7, 5.4], [17, 4, 5], [20, -1, 4.6], [21, -6, 4.2]]
      : [[0, -6, 7], [0, 2, 6.5], [0.5, 9, 6], [2, 15, 5.5], [4.5, 20, 5], [8.5, 23, 4.6], [13, 22.5, 4.2], [15.5, 19.5, 3.8]];
    blob(c, tr, col, { d: 1.8 });
    ln(c, c => { for (let i = 1; i < 4; i++) { const p = tr[i]; c.moveTo(p[0] - p[2] * 0.6, p[1]); c.lineTo(p[0] + p[2] * 0.6, p[1] + 0.6); } }, 1.3, dk(col, 0.3));
    eyes(c, s, 10, -17, 4.4);
    blush(c, 15.5, -7, 3.6);
    if (up || s.surp) mouth(c, s, -9, 4, 2.6);
  };

  D.girafa = (c, s) => {
    const col = "#F7C65E", spot = "#C77437", mz = "#FBE3B5";
    const spots = pts => c => { c.fillStyle = spot; c.beginPath(); for (const p of pts) ell(c, p[0], p[1], p[2], p[3], p[4] || 0); c.fill(); };
    c.save(); rot(c, 16, 18, s.wag * 0.12); tube(c, c => { c.moveTo(16, 20); c.quadraticCurveTo(28, 20, 27, 32); }, 2.2, col); O(c, 27, 35, 3, 5, spot, { d: 1 }); c.restore();
    stand(c, s, col, { hoof: "#6B4A3A", lw: 8, inner: spots([[-13, 20, 5, 4, 0.3], [0, 30, 5, 3.5], [13, 19, 5, 4, -0.3], [-4, 13, 3.5, 3]]) });
    P(c, RR(-8, -24, 16, 44, 7), col, { d: 2, inner: spots([[-4, -8, 3.6, 3, 0.3], [4, 0, 3.6, 3, -0.2], [-3, 10, 4, 3, 0.2], [5, 14, 3, 2.5]]) });
    for (const g of SG) { tube(c, c => { c.moveTo(5 * g, -36); c.lineTo(7 * g, -45); }, 3.4, col); O(c, 7 * g, -46, 3.3, 3.3, spot, { d: 1 }); }
    const ea = 0.35 + (s.sad ? 0.5 : 0) + Math.sin(s.t * 3) * 0.06;
    for (const g of SG) { O(c, 17 * g, -33, 7, 3.4, col, { r: ea * g, d: 1 }); }
    O(c, 0, -29, 15.5, 14, col, { inner: spots([[-11, -36, 3, 2.4], [11, -38, 2.4, 2]]), hl: [-6, -37, 4.5, 2.4, -0.3] });
    O(c, 0, -19, 11.5, 7.5, mz, { d: 1.5 });
    dots(c, [[-3.5, -20.5, 1.2], [3.5, -20.5, 1.2]], "#B0835E");
    eyes(c, s, 7, -31, 3.8);
    blush(c, 12, -23, 3);
    mouth(c, s, 0, -16.5, 2.6);
  };

  D.mico = (c, s) => {
    const col = "#9C6A4B", face = "#F4CFA6";
    c.save(); rot(c, 16, 36, s.wag * 0.1);
    tube(c, c => { c.moveTo(14, 36); c.bezierCurveTo(40, 38, 44, 12, 34, 4); c.quadraticCurveTo(28, 0, 29, 7); }, 4.5, col);
    c.restore();
    sit(c, s, col, { belly: face });
    for (const g of SG) O(c, 25 * g, -9, 8, 8, col, { d: 1.5, inner: c => { c.beginPath(); ell(c, 25 * g, -9, 4.6, 4.6); c.fillStyle = face; c.fill(); } });
    O(c, 0, -10, 23, 21, col, { hl: [-8, -24, 6, 3, -0.4] });
    blob(c, [[-7.5, -13, 9.5], [7.5, -13, 9.5], [0, 0, 14.5, 9.5]], face, { d: 1.5 });
    blob(c, [[-2, -32, 3], [2, -33, 3.2]], col, { d: 0 });
    eyes(c, s, 7.5, -13, 4.2);
    blush(c, 12.5, -2, 3.4);
    dots(c, [[-2, -3, 1], [2, -3, 1]], "#8B5A40");
    mouth(c, s, 0, 2, 5);
  };

  D.tigre = (c, s) => {
    const col = "#F7973F", wh = "#FFF5E8", K = "#3A2C2A";
    c.save(); rot(c, 16, 38, s.wag * 0.08);
    tube(c, c => { c.moveTo(14, 38); c.bezierCurveTo(36, 40, 38, 16, 30, 8); }, 5.5, col);
    ln(c, c => { c.moveTo(31, 26); c.lineTo(36, 24); c.moveTo(33, 17); c.lineTo(37, 18); }, 2, K);
    c.restore();
    sit(c, s, col, { belly: wh, inner: c => { c.fillStyle = K; c.beginPath(); for (const g of SG) { wedge(c, 20 * g, 18, g > 0 ? Math.PI : 0, 7, 1.6); wedge(c, 20 * g, 26, g > 0 ? Math.PI : 0, 6, 1.4); } c.fill(); } });
    for (const g of SG) O(c, 18 * g, -26, 7, 7, col, { d: 1.2, inner: c => { c.beginPath(); ell(c, 18 * g, -25.5, 3.6, 3.6); c.fillStyle = wh; c.fill(); } });
    O(c, 0, -8, 26, 22, col, {
      inner: c => { c.fillStyle = K; c.beginPath(); wedge(c, 0, -30, Math.PI / 2, 8, 2.2); wedge(c, -6, -29, Math.PI / 2 + 0.3, 6, 1.6); wedge(c, 6, -29, Math.PI / 2 - 0.3, 6, 1.6); for (const g of SG) { wedge(c, 26 * g, -10, g > 0 ? Math.PI + 0.15 : -0.15, 9, 1.8); wedge(c, 26 * g, -2, g > 0 ? Math.PI : 0, 7, 1.5); } c.fill(); },
      hl: [-12, -20, 6, 3, -0.4],
    });
    for (const g of SG) O(c, 6.5 * g, 3, 8.5, 6.5, wh, { d: 1.2 });
    eyes(c, s, 10.5, -10, 4.6);
    blush(c, 17, -1, 3.6);
    P(c, c => { c.moveTo(-4, -2.5); c.quadraticCurveTo(0, -4, 4, -2.5); c.quadraticCurveTo(1.5, 2, 0, 2.2); c.quadraticCurveTo(-1.5, 2, -4, -2.5); c.closePath(); }, "#E77D8A", { d: 0 });
    mouth(c, s, 0, 4.5, 3, "w");
    whisk(c, 13, 3, 8);
  };

  D.lloro = (c, s) => {
    const red = "#E8483F", yel = "#FFD23F", blu = "#3D8BEA", bk = "#F3E8D6";
    c.save(); rot(c, 0, 30, s.wag * 0.05);
    O(c, -4, 37, 4.6, 11, blu, { r: 0.18, d: 1.2 }); O(c, 4, 38, 4.6, 11, red, { r: -0.18, d: 1.2 });
    c.restore();
    O(c, 0, 12, 19, 22, red, { hl: [-8, 2, 5, 3, -0.4] });
    const fl = Math.sin(s.t * 4) * 0.06 + (s.happy || s.jump ? 0.45 : 0);
    for (const g of SG) { c.save(); rot(c, 16 * g, -2, -fl * g); O(c, 18 * g, 13, 8, 17, red, { r: -0.2 * g, d: 2, inner: c => { c.fillStyle = yel; c.fillRect(-30, 6, 60, 7); c.fillStyle = blu; c.fillRect(-30, 13, 60, 30); } }); c.restore(); }
    for (const g of SG) dots(c, [[6 * g, 42, 2]], "#8A8090");
    O(c, 0, -16, 18.5, 17, red, { hl: [-7, -27, 6, 3, -0.4] });
    for (const g of SG) O(c, 8 * g, -16, 7.5, 7, "#FFF4EA", { d: 1 });
    eyes(c, s, 8, -17, 3.7);
    blush(c, 13, -8, 3);
    O(c, 0, -3, 4.6, 3.6, s.happy || s.jump || s.surp ? MOUTH : "#4A3E40", { d: 0 });
    P(c, c => { c.moveTo(-7, -10); c.bezierCurveTo(-7, -17, 7, -17, 7, -10); c.bezierCurveTo(7, -2, 3, 3, 0, 5); c.bezierCurveTo(-1, 1, -2, -2, -4, -3); c.bezierCurveTo(-6, -4, -7, -7, -7, -10); c.closePath(); }, bk, { d: 1.5, hl: [-2, -12, 2.5, 1.5] });
  };

  D.serp = (c, s) => {
    const col = "#72C76A", sp = "#4FA458";
    tube(c, c => ell(c, 0, 31, 26, 8), 12, col);
    dots(c, [[-16, 37, 1.8], [-4, 39.5, 1.8], [8, 39, 1.8], [19, 36, 1.8]], sp);
    tube(c, c => ell(c, 0, 20, 19, 6.5), 11, col);
    dots(c, [[-10, 25.5, 1.6], [2, 26.5, 1.6], [12, 25, 1.6]], sp);
    const sw = Math.sin(s.t * 2) * 3;
    tube(c, c => { c.moveTo(16, 17); c.bezierCurveTo(30 + sw, 4, -14 + sw, 2, 0 + sw * 0.5, -14); }, 10, col);
    const hx = sw * 0.5;
    if (!(s.surp || s.happy)) { const fk = Math.sin(s.t * 10) > 0 ? 2 : 0; ln(c, c => { c.moveTo(hx, -6); c.lineTo(hx, 2 + fk); c.lineTo(hx - 2.5, 5 + fk); c.moveTo(hx, 2 + fk); c.lineTo(hx + 2.5, 5 + fk); }, 1.6, "#E5484D"); }
    O(c, hx, -19, 16, 12.5, col, { hl: [hx - 6, -26, 5, 2.5, -0.3] });
    dots(c, [[hx - 3, -28, 1.6], [hx + 3, -28, 1.6], [hx, -30.5, 1.4]], sp);
    eyes(c, s, 7, -21, 4.3);
    blush(c, 11.5, -13, 3.2);
    if (s.surp || s.happy || s.jump || s.sad) mouth(c, s, hx, -12, 3.4);
    else ln(c, c => { c.moveTo(hx - 6, -12); c.quadraticCurveTo(hx, -9, hx + 6, -12); }, LW);
  };

  D.hipopotam = (c, s) => {
    const col = "#A99BD1", mz = "#BBAEE0";
    c.save(); rot(c, 16, 18, s.wag * 0.2); tube(c, c => { c.moveTo(16, 20); c.quadraticCurveTo(24, 20, 25, 27); }, 2.4, col); c.restore();
    stand(c, s, col, { lw: 11, nails: true });
    for (const g of SG) { c.save(); rot(c, 15 * g, -34, Math.sin(s.t * 6) * 0.08 * g); O(c, 15 * g, -36, 5, 5.5, col, { d: 1, inner: c => { c.beginPath(); ell(c, 15 * g, -35.5, 2.4, 3); c.fillStyle = PINKIN; c.fill(); } }); c.restore(); }
    O(c, 0, -25, 19, 15, col, { hl: [-7, -33, 6, 3, -0.3] });
    O(c, 0, -3, 27, 18, mz, { hl: [-10, -13, 7, 3, -0.2] });
    c.fillStyle = "#7D6EA8"; c.beginPath(); ell(c, -8, -11, 3, 2.2, 0.3); ell(c, 8, -11, 3, 2.2, -0.3); c.fill();
    eyes(c, s, 8.5, -28, 4.2);
    blush(c, 19, -2, 4);
    if (s.happy || s.jump || s.surp || s.sad) mouth(c, s, 0, 2, 7);
    else {
      ln(c, c => { c.moveTo(-14, 2); c.quadraticCurveTo(0, 10, 14, 2); }, LW * 1.1);
      for (const g of SG) P(c, RR(6 * g - 2, 4.4, 4, 4, 1), "#FFFFFF", { d: 0 });
    }
  };

  D.cocodril = (c, s) => {
    const col = "#5DB061", belly = "#CDE88F";
    c.translate(0, -4);
    const tw = Math.sin(s.t * 2.5) * 3;
    const tail = [];
    for (let k = 0; k <= 9; k++) { const u = k / 9; tail.push([-16 - u * 32, 30 - u * u * (16 + tw), 11 - u * 8]); }
    for (let k = 2; k <= 8; k += 2) { const p = tail[k]; O(c, p[0], p[1] - p[2] + 0.5, 2.6, 2.6, dk(col, 0.12), { d: 0 }); }
    for (const x of [-24, -14, -4, 6]) O(c, x, 18, 3.3, 3.3, dk(col, 0.12), { d: 0 });
    blob(c, tail, col, { d: 2 });
    O(c, -16, 42, 6.5, 5, dk(col, 0.06), { d: 1 });
    P(c, E(-3, 30, 24, 13), col, { inner: c => { c.beginPath(); ell(c, -3, 43, 22, 7); c.fillStyle = belly; c.fill(); }, hl: [-12, 21, 7, 2.5, -0.1] });
    O(c, 14, 42, 6.5, 5, col, { d: 1 });
    const op = s.happy || s.jump || s.surp ? 0.22 : Math.max(0, Math.sin(s.t * 1.5)) * 0.06;
    c.save(); rot(c, 10, 26, op);
    P(c, RR(10, 23, 36, 8, 4), belly, { d: 1.2 });
    c.restore();
    O(c, 17, 13, 8.5, 8, col, { d: 1.5 });
    P(c, RR(6, 13, 42, 11, 5.5), col, { d: 2, hl: [24, 15, 8, 1.6] });
    O(c, 43, 13.5, 3.4, 2.4, col, { d: 0.8 });
    c.save(); rot(c, 10, 26, op * 0.4);
    c.beginPath(); for (const x of [20, 27, 34, 41]) { c.moveTo(x - 2, 23.5); c.lineTo(x, 27); c.lineTo(x + 2, 23.5); }
    c.fillStyle = "#FFFFFF"; c.fill(); c.lineWidth = 1.2; c.stroke(); c.lineWidth = LW;
    c.restore();
    eye(c, s, 17, 11, 4.6); brow(c, s, 17, 11, 4.6, -1);
    blush1(c, 26, 19, 3.6);
  };

  /* ════════════ INSECTES ════════════ */
  D.papallona = (c, s) => {
    const w1 = "#F58BB5", w2 = "#FFC45E", body = "#8C76BD";
    c.translate(0, 4 + Math.sin(s.t * 3) * 1.5);
    const fl = 0.78 + 0.22 * Math.cos(s.t * 9) + (s.happy || s.jump ? 0.05 : 0);
    c.save(); c.scale(fl, 1);
    for (const g of SG) {
      O(c, 21 * g, -13, 22, 18, w1, { r: -0.35 * g, d: 2.5, inner: c => { dots(c, [[25 * g, -16, 6], [14 * g, -22, 3], [30 * g, -4, 2.6]], lt(w1, 0.5)); }, hl: [14 * g - 4, -24, 6, 3, -0.4] });
      O(c, 16 * g, 17, 14, 14, w2, { r: 0.4 * g, d: 2, inner: c => { dots(c, [[19 * g, 19, 4.5]], lt(w2, 0.5)); } });
    }
    c.restore();
    O(c, 0, 10, 6, 20, body, { d: 1.5 });
    for (const g of SG) { tube(c, c => { c.moveTo(3 * g, -26); c.quadraticCurveTo(6 * g, -38, 13 * g, -41); }, 1.6, OL, false); dot(c, 13 * g, -41, 2.8, body); c.beginPath(); c.arc(13 * g, -41, 2.8, 0, TAU); c.stroke(); }
    O(c, 0, -17, 12, 11, body, { hl: [-4, -22, 3.5, 2, -0.4] });
    eyes(c, s, 5, -18, 3.4);
    blush(c, 8, -12, 2.6);
    mouth(c, s, 0, -12.5, 2.2);
  };

  D.marieta = (c, s) => {
    const red = "#EF4B4B", K = "#3C3440";
    for (const g of SG) for (let i = 0; i < 3; i++) tube(c, c => { c.moveTo(18 * g, 12 + i * 8); c.lineTo((30 + (i === 1 ? 2 : 0)) * g, 16 + i * 10); c.lineTo((33 - i * 2) * g, 22 + i * 10); }, 3, K, false);
    const fl = s.happy || s.jump ? 0.25 : 0;
    for (const g of SG) {
      c.save(); rot(c, 0, -20, fl * g);
      P(c, c => { c.moveTo(0, -32); c.bezierCurveTo(20 * g, -33, 33 * g, -18, 31 * g, 4); c.bezierCurveTo(29 * g, 22, 14 * g, 30, 0, 30); c.closePath(); }, red, {
        inner: c => { c.beginPath(); ell(c, 13 * g, -14, 6, 6); ell(c, 21 * g, 6, 5.5, 5.5); ell(c, 8 * g, 14, 4.5, 4.5); ell(c, 4 * g, -27, 3.6, 3.6); c.fillStyle = K; c.fill(); },
        hl: [12 * g - 3, -24, 7, 3.5, -0.4],
      });
      c.restore();
    }
    for (const g of SG) { tube(c, c => { c.moveTo(6 * g, 10); c.quadraticCurveTo(14 * g, 2, 20 * g, 6); }, 1.6, K, false); dot(c, 20 * g, 6, 2.4, K); }
    O(c, 0, 24, 17, 15, K, { d: 1.5, hl: [-6, 16, 5, 2.5, -0.4] });
    eyes(c, s, 7, 22, 4, { white: true, lc: "#FFFFFF" });
    blush(c, 11.5, 30, 3);
    if (s.happy || s.jump || s.surp) mouth(c, s, 0, 30, 3);
    else ln(c, c => { c.moveTo(-3, 30.5); c.quadraticCurveTo(0, 33, 3, 30.5); }, LW, "#FFFFFF");
  };

  D.abella = (c, s) => {
    const yel = "#FFD23F", K = "#3B3138", wing = "#E1F3FF";
    c.translate(0, Math.sin(s.t * 3) * 1.5);
    const fl = Math.sin(s.t * 16) * 0.25;
    for (const g of SG) { c.save(); rot(c, 10 * g, -14, fl * g); O(c, 21 * g, -26, 11, 16, wing, { r: 0.55 * g, d: 1.5, inner: c => { ln(c, c => { c.moveTo(12 * g, -18); c.quadraticCurveTo(20 * g, -26, 26 * g, -34); }, 1.2, "#B9DDF2"); } }); c.restore(); }
    P(c, c => { c.moveTo(-4, 33); c.lineTo(0, 42); c.lineTo(4, 33); c.closePath(); }, K, { d: 0 });
    for (const g of SG) O(c, 9 * g, 35.5, 4, 2.6, K, { d: 0 });
    O(c, 0, 8, 28, 27, yel, {
      inner: c => { c.fillStyle = K; c.beginPath(); for (const y of [14, 27]) { c.moveTo(-30, y); c.quadraticCurveTo(0, y + 6, 30, y); c.lineTo(30, y + 7); c.quadraticCurveTo(0, y + 13, -30, y + 7); c.closePath(); } c.fill(); },
      hl: [-11, -6, 8, 4, -0.4],
    });
    for (const g of SG) { tube(c, c => { c.moveTo(7 * g, -17); c.quadraticCurveTo(9 * g, -28, 15 * g, -32); }, 1.6, K, false); dot(c, 15 * g, -32, 2.8, K); }
    eyes(c, s, 10, -2, 4.8);
    blush(c, 18, 4, 3.8);
    mouth(c, s, 0, 4, 3.4);
  };

  D.cargol = (c, s) => {
    const body = "#BFE38D", shell = "#F0A04B", sl = "#B9662E";
    const st = Math.sin(s.t * 2.5) * 0.08;
    for (const [x0, a, x1, y1] of [[28, -st, 22, -26], [36, st, 41, -24]]) {
      c.save(); rot(c, x0, -2, a);
      tube(c, c => { c.moveTo(x0, -2); c.quadraticCurveTo((x0 + x1) / 2, -14, x1, y1); }, 3.4, body);
      eye(c, s, x1, y1 - 1, 4, { white: true }); brow(c, s, x1, y1 - 1, 4, x1 < 30 ? -1 : 1, { white: true });
      c.restore();
    }
    blob(c, [[-2, 38, 38, 6.5], [30, 16, 10, 22, -0.15], [32, 3, 11.5]], body, { d: 2, hl: [28, -3, 4, 2.5, -0.4] });
    O(c, -6, 12, 25, 24, shell, { hl: [-16, -2, 7, 3.5, -0.5] });
    ln(c, c => { const cx = -5, cy = 13; let first = true; for (let a = 0; a < TAU * 2.4; a += 0.3) { const r = 20 - a * 1.25; const x = cx + Math.cos(a + 2.2) * r, y = cy + Math.sin(a + 2.2) * r * 0.95; if (first) { c.moveTo(x, y); first = false; } else c.lineTo(x, y); } }, 2.4, sl);
    blush1(c, 39, 7, 3);
    mouth(c, s, 36, 9, 3);
  };

  D.formiga = (c, s) => {
    const col = "#CC5C40";
    const wk = Math.sin(s.t * 6) * 2;
    for (let i = 0; i < 3; i++) { const x0 = -6 + i * 4, d = (i - 1) * 12; tube(c, c => { c.moveTo(x0, 22); c.lineTo(x0 + d * 0.6 + (i % 2 ? wk : -wk), 30); c.lineTo(x0 + d + (i % 2 ? wk : -wk), 44); }, 3, dk(col, 0.1), false); }
    O(c, -27, 20, 16, 13, col, { hl: [-33, 12, 5, 2.5, -0.4] });
    O(c, -10, 21, 4, 4, col, { d: 0.8 });
    O(c, 0, 20, 9, 7.5, col, { d: 1.5 });
    O(c, 10, 14, 4, 4, col, { d: 0.8 });
    ln(c, c => { c.moveTo(18, -4); c.lineTo(14, -18); c.lineTo(22, -27); c.moveTo(28, -4); c.lineTo(30, -17); c.lineTo(39, -23); }, 1.8);
    dots(c, [[22, -27, 2.2], [39, -23, 2.2]], OL);
    O(c, 23, 6, 16, 15, col, { hl: [17, -3, 5, 2.5, -0.4] });
    eye(c, s, 18, 4, 4.2); eye(c, s, 29, 4, 4);
    brow(c, s, 18, 4, 4.2, -1); brow(c, s, 29, 4, 4, 1);
    blush1(c, 15, 12, 3.2); blush1(c, 34, 12, 3);
    mouth(c, s, 24, 12, 3);
  };

  D.libellula = (c, s) => {
    const body = "#3FB6C9", wing = "#DDF3FB";
    c.translate(0, Math.sin(s.t * 3) * 1.5);
    const fl = Math.sin(s.t * 14) * 0.12;
    for (const g of SG) {
      c.save(); rot(c, 0, -6, fl * g);
      O(c, 24 * g, -10, 22, 7, wing, { r: -0.25 * g, d: 1, inner: c => ln(c, c => { c.moveTo(4 * g, -6); c.lineTo(44 * g, -15); }, 1.1, "#A8DCEB") });
      O(c, 22 * g, 4, 20, 6, wing, { r: 0.22 * g, d: 1, inner: c => ln(c, c => { c.moveTo(4 * g, 0); c.lineTo(40 * g, 9); }, 1.1, "#A8DCEB") });
      c.restore();
    }
    P(c, RR(-3.5, -4, 7, 48, 3.5), body, { d: 1.2, inner: c => { c.beginPath(); for (let y = 6; y < 44; y += 6) { c.moveTo(-4, y); c.lineTo(4, y); } c.lineWidth = 1.2; c.strokeStyle = dk(body, 0.35); c.stroke(); } });
    O(c, 0, -6, 8, 9, body, { d: 1.5 });
    O(c, 0, -23, 14, 12, body, { hl: [-5, -30, 4, 2, -0.3] });
    eyes(c, s, 6.5, -25, 5);
    blush(c, 10, -17, 2.8);
    mouth(c, s, 0, -18, 2.6);
  };

  D.cuc = (c, s) => {
    const col = "#F59AB4";
    const h = 20 + Math.sin(s.t * 3) * 4, pts = [];
    for (let k = 0; k <= 11; k++) { const u = k / 11; pts.push([-40 + u * 56, 37 - h * Math.sin(u * Math.PI), 8.5]); }
    pts.push([20, 34, 8.5], [24, 28, 9.5]);
    blob(c, pts, col, { d: 2 });
    ln(c, c => { for (let k = 1; k < pts.length - 2; k += 2) { const p = pts[k], q = pts[k + 1]; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; const nx = -dy / L * 6.5, ny = dx / L * 6.5; c.moveTo(p[0] + nx, p[1] + ny); c.quadraticCurveTo(p[0] + dx / L * 1.5, p[1] + dy / L * 1.5, p[0] - nx, p[1] - ny); } }, 1.4, dk(col, 0.3));
    O(c, 31, 18, 14, 13.5, col, { hl: [26, 10, 5, 2.5, -0.4] });
    eye(c, s, 26, 15, 4.2); eye(c, s, 36, 15, 4);
    brow(c, s, 26, 15, 4.2, -1); brow(c, s, 36, 15, 4, 1);
    blush1(c, 23, 22, 3); blush1(c, 40, 22, 3);
    mouth(c, s, 31, 23, 3);
  };

  D.aranya = (c, s) => {
    const col = "#7E68B8";
    const L = [[[-2, -18], [4, 2]], [[2, -6], [6, 22]], [[2, 8], [2, 40]], [[-6, 18], [-12, 44]]];
    for (const g of SG) for (let i = 0; i < 4; i++) {
      const wv = Math.sin(s.t * 4 + i + (g > 0 ? 1 : 0)) * 1.2;
      const kx = (30 + L[i][0][0]) * g, ky = L[i][0][1] + wv, fx = (40 + L[i][1][0]) * g, fy = L[i][1][1];
      tube(c, c => { c.moveTo(14 * g, 4 + i * 5); c.lineTo(kx, ky); c.lineTo(fx, fy); }, 3.4, dk(col, 0.1), false);
    }
    O(c, 0, 12, 24, 24, col, { inner: c => { c.beginPath(); ell(c, 0, 28, 12, 7); c.fillStyle = lt(col, 0.3); c.fill(); }, hl: [-9, -2, 7, 3.5, -0.4] });
    dots(c, [[-4, -3, 2], [4, -3, 2]], OL);
    eyes(c, s, 8.5, 6, 5);
    blush(c, 15, 14, 3.6);
    mouth(c, s, 0, 15, 3.4);
  };

  D.grill = (c, s) => {
    const col = "#9CC04B", wing = "#6E9134";
    const jl = s.jump ? -0.4 : 0;
    ln(c, c => { c.moveTo(22, -1); c.bezierCurveTo(14, -20, -4, -26, -22, -20); c.moveTo(27, -1); c.bezierCurveTo(22, -24, 8, -32, -8, -32); }, 1.6);
    tube(c, c => { c.moveTo(6, 32); c.lineTo(4, 44); c.moveTo(16, 30); c.lineTo(20, 44); }, 2.6, dk(col, 0.1), false);
    O(c, 2, 24, 22, 11, col, { hl: [-6, 18, 6, 2.5, -0.1] });
    P(c, c => { c.moveTo(14, 16); c.quadraticCurveTo(-6, 10, -24, 20); c.quadraticCurveTo(-8, 26, 14, 22); c.closePath(); }, wing, { d: 1.2 });
    c.save(); rot(c, -4, 22, jl);
    tube(c, c => { c.moveTo(-20, 4); c.lineTo(-30, 42); c.lineTo(-36, 43); }, 2.8, col);
    O(c, -12, 13, 13.5, 6.5, col, { r: 0.85, d: 1.5 });
    c.restore();
    O(c, 25, 10, 13, 13, col, { hl: [20, 3, 4, 2, -0.4] });
    eye(c, s, 22, 8, 3.8); eye(c, s, 31, 8, 3.6);
    brow(c, s, 22, 8, 3.8, -1); brow(c, s, 31, 8, 3.6, 1);
    blush1(c, 19, 15, 2.8); blush1(c, 34, 15, 2.6);
    mouth(c, s, 27, 15, 2.8);
  };

  /* ════════════ BOSC ════════════ */
  D.guineu = (c, s) => {
    const col = "#F2873D", wh = "#FFF4E6", K = "#4B3833";
    c.save(); rot(c, 16, 38, s.wag * 0.1);
    O(c, 28, 22, 11, 21, col, { r: 0.55, d: 2.5, inner: c => { c.beginPath(); ell(c, 36, 8, 9, 10, 0.55); c.fillStyle = wh; c.fill(); } });
    c.restore();
    sit(c, s, col, { belly: wh, paw: K, armc: K });
    for (const g of SG) {
      c.save(); rot(c, 16 * g, -24, (s.sad ? 0.5 : 0) * g);
      P(c, c => { c.moveTo(26 * g, -14); c.quadraticCurveTo(28 * g, -40, 23 * g, -44); c.quadraticCurveTo(15 * g, -38, 5 * g, -27); c.closePath(); }, col, { d: 1.5, inner: c => { c.beginPath(); c.moveTo(18 * g, -48); c.lineTo(32 * g, -48); c.lineTo(28 * g, -36); c.lineTo(18 * g, -38); c.closePath(); c.fillStyle = K; c.fill(); } });
      P(c, c => { c.moveTo(21 * g, -19); c.quadraticCurveTo(23 * g, -33, 21.5 * g, -36); c.quadraticCurveTo(16 * g, -32, 11 * g, -25); c.closePath(); }, "#FFE1C8", { d: 0, ol: false });
      c.restore();
    }
    O(c, 0, -9, 25, 20, col, { inner: c => { c.beginPath(); c.moveTo(-30, -6); c.bezierCurveTo(-16, -10, -6, -4, 0, -2); c.bezierCurveTo(6, -4, 16, -10, 30, -6); c.lineTo(30, 20); c.lineTo(-30, 20); c.closePath(); c.fillStyle = wh; c.fill(); }, hl: [-11, -20, 6, 3, -0.4] });
    eyes(c, s, 10, -11, 4.3);
    blush(c, 16, -1, 3.6);
    O(c, 0, 1, 3.6, 2.8, K, { d: 0, hl: [-1, 0, 1.1, 0.7] });
    mouth(c, s, 0, 4.5, 3, "w");
  };

  D.os = (c, s) => {
    const col = "#A56F4C", mz = "#E9C49E";
    sit(c, s, col, { belly: mz });
    for (const g of SG) O(c, 19 * g, -27, 8, 8, col, { d: 1.5, inner: c => { c.beginPath(); ell(c, 19 * g, -26.5, 4.3, 4.3); c.fillStyle = "#E3AE88"; c.fill(); } });
    O(c, 0, -8, 26, 23, col, { hl: [-10, -20, 7, 3.5, -0.4] });
    O(c, 0, 2, 12.5, 9.5, mz, { d: 1.5 });
    O(c, 0, -2, 5.2, 3.7, NOSE, { d: 0, hl: [-1.6, -3.4, 1.6, 0.9] });
    ln(c, c => { c.moveTo(0, 1.5); c.lineTo(0, 3.5); }, LW);
    eyes(c, s, 11, -11, 4.5);
    blush(c, 18, 0, 4);
    mouth(c, s, 0, 3.5, 3.6, s.happy || s.jump ? null : "w");
  };

  D.mussol = (c, s) => {
    const col = "#A57C5B", belly = "#F2DDBA", disc = "#F8EAD2", bk = "#F6A93B";
    for (const g of SG) P(c, c => { c.moveTo(10 * g, -24); c.quadraticCurveTo(22 * g, -34, 26 * g, -40); c.quadraticCurveTo(28 * g, -26, 24 * g, -16); c.closePath(); }, col, { d: 1.5 });
    for (const g of SG) dots(c, [[(6 + 0) * g, 43, 2.2], [9.5 * g, 43.5, 2.2], [13 * g, 43, 2.2]], bk);
    O(c, 0, 8, 29, 35, col, {
      inner: c => { c.beginPath(); ell(c, 0, 25, 18, 18); c.fillStyle = belly; c.fill(); c.beginPath(); for (const [x, y] of [[-8, 18], [0, 16], [8, 18], [-4, 25], [4, 25], [-8, 32], [0, 32], [8, 32]]) { c.moveTo(x - 2.5, y - 1); c.quadraticCurveTo(x, y + 2, x + 2.5, y - 1); } c.lineWidth = 1.3; c.strokeStyle = dk(belly, 0.3); c.stroke(); },
      hl: [-12, -16, 7, 4, -0.4],
    });
    const fl = Math.sin(s.t * 3) * 0.05 + (s.happy || s.jump ? 0.4 : 0);
    for (const g of SG) { c.save(); rot(c, 25 * g, 0, -fl * g); O(c, 27 * g, 14, 7.5, 17, dk(col, 0.1), { r: -0.15 * g, d: 1.5 }); c.restore(); }
    for (const g of SG) O(c, 11 * g, -10, 12, 12, disc, { d: 1.5 });
    eyes(c, s, 11, -10, 6.2);
    blush(c, 19.5, -1, 3.2);
    beak(c, s, 0, -4, 3.6, 7, bk);
  };

  D.esquirol = (c, s) => {
    const col = "#D9783E", belly = "#FBE3C4", tl = "#E58C4F";
    const sw = Math.sin(s.t * 2) * 2;
    blob(c, [[16, 36, 9], [28, 30, 12], [34, 16, 15], [32 + sw * 0.5, 0, 16], [26 + sw, -16, 14], [16 + sw, -26, 11], [10 + sw, -24, 7]], tl, { d: 3, hl: [26, -14, 6, 4, -0.5] });
    sit(c, s, col, { belly, arms: false });
    O(c, 0, 25, 6.5, 7, "#C98A4B", { d: 1.2 });
    P(c, c => { c.moveTo(-7.5, 21); c.quadraticCurveTo(0, 12, 7.5, 21); c.closePath(); }, "#7A5236", { d: 1 });
    ln(c, c => { c.moveTo(0, 15.5); c.lineTo(1, 12.5); }, 1.8);
    for (const g of SG) O(c, 8.5 * g, 26, 4.5, 4, col, { d: 1 });
    for (const g of SG) { O(c, 14 * g, -29, 6, 10, col, { r: 0.25 * g, d: 1.3, inner: c => { c.beginPath(); ell(c, 14 * g, -28, 3, 6, 0.25 * g); c.fillStyle = "#F2B595"; c.fill(); } }); O(c, 16 * g, -39, 2, 3.5, dk(col, 0.2), { r: 0.3 * g, d: 0 }); }
    O(c, 0, -8, 23, 20, col, { hl: [-9, -19, 6, 3, -0.4] });
    for (const g of SG) O(c, 5.5 * g, 2, 7.5, 6, belly, { d: 1 });
    eyes(c, s, 10, -10, 4.5);
    blush(c, 15, -1, 3.4);
    O(c, 0, -2.5, 3, 2.2, NOSE, { d: 0 });
    if (!(s.happy || s.jump || s.surp)) P(c, RR(-2.4, 4.2, 4.8, 4, 1), "#FFFFFF", { d: 0 });
    mouth(c, s, 0, 2, 3, "w");
  };

  D.erico = (c, s) => {
    const sp = "#8C6650", face = "#F3DBBA";
    const pts = [], cy = 8, n = 22;
    for (let i = 0; i <= n; i++) { const a = Math.PI * 0.8 + (i / n) * Math.PI * 1.4; const r = i % 2 ? 31 : 40; pts.push([Math.cos(a) * r, cy + Math.sin(a) * r * 0.95]); }
    P(c, c => { c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.quadraticCurveTo(0, 50, pts[0][0], pts[0][1]); c.closePath(); }, sp, {
      inner: c => { c.beginPath(); for (let i = 2; i < n; i += 2) { const p = pts[i]; c.moveTo(p[0] * 0.55, cy + (p[1] - cy) * 0.55); c.lineTo(p[0] * 0.85, cy + (p[1] - cy) * 0.85); } c.lineWidth = 1.5; c.strokeStyle = lt(sp, 0.25); c.stroke(); },
      hl: [-14, -14, 8, 4, -0.5],
    });
    O(c, 22, -30, 8, 7.5, "#E8483F", { hl: [19, -33, 2.5, 1.5, -0.4] });
    ln(c, c => { c.moveTo(22, -37); c.lineTo(23, -41); }, 1.8);
    O(c, 27, -40, 4, 2, "#7CC85A", { r: -0.4, d: 0 });
    for (const g of SG) O(c, 11 * g, 41.5, 7, 4, face, { d: 1 });
    O(c, 0, 16, 24, 23, face, { hl: [-9, 4, 6, 3, -0.4] });
    for (const g of SG) O(c, 17 * g, -4, 5, 4.6, face, { d: 1, inner: c => { c.beginPath(); ell(c, 17 * g, -4, 2.4, 2.2); c.fillStyle = "#E7B8A8"; c.fill(); } });
    O(c, 0, 19, 7.5, 5.5, lt(face, 0.2), { d: 1 });
    eyes(c, s, 9, 9, 4.2);
    blush(c, 15.5, 18, 3.4);
    O(c, 0, 16, 3.4, 2.6, NOSE, { d: 0, hl: [-1, 15.2, 1, 0.6] });
    mouth(c, s, 0, 22, 3);
  };

  D.cervol = (c, s) => {
    const col = "#C98450", light = "#F6DDBF", ant = "#8A5B3B";
    c.save(); rot(c, 16, 14, s.wag * 0.25); O(c, 21, 11, 3.5, 5.5, light, { r: 0.6, d: 1 }); c.restore();
    stand(c, s, col, { hoof: "#4A3530", inner: c => { dots(c, [[-14, 17, 1.8], [-8, 13, 1.6], [10, 13, 1.6], [15, 18, 1.8], [-16, 24, 1.5], [17, 25, 1.5]], light); } });
    for (const g of SG) tube(c, c => { c.moveTo(7 * g, -30); c.quadraticCurveTo(11 * g, -40, 18 * g, -46); c.moveTo(10.5 * g, -38); c.lineTo(19 * g, -37); c.moveTo(14 * g, -43); c.lineTo(12 * g, -49); }, 3.4, ant);
    const ea = 0.5 + (s.sad ? 0.5 : 0) + Math.sin(s.t * 3) * 0.06;
    for (const g of SG) { O(c, 23 * g, -18, 10, 5, col, { r: ea * g, d: 1.4 }); O(c, 24 * g, -18, 6, 2.5, light, { r: ea * g, d: 0, ol: false }); }
    O(c, 0, -12, 21, 21, col, { hl: [-8, -24, 6, 3, -0.4] });
    P(c, RR(-10, 14, 20, 8, 4), light, { d: 0, ol: false });
    O(c, 0, 1, 12, 9, light, { d: 1.5 });
    O(c, 0, -2.5, 4.6, 3.2, NOSE, { d: 0, hl: [-1.4, -3.6, 1.4, 0.8] });
    eyes(c, s, 9, -14, 4.4);
    blush(c, 15, -4, 3.6);
    mouth(c, s, 0, 3.5, 3, "w");
  };

  D.granota = (c, s) => {
    const col = "#7CC75B", belly = "#D9F0A6";
    for (const g of SG) { O(c, 30 * g, 42.5, 9, 3.2, col, { d: 1 }); O(c, 24 * g, 33, 11, 9, col, { r: -0.3 * g, d: 2 }); }
    O(c, 0, 27, 23, 17, col, { inner: c => { c.beginPath(); ell(c, 0, 32, 15, 12); c.fillStyle = belly; c.fill(); } });
    for (const g of SG) O(c, 10 * g, 41.5, 6.5, 3.4, col, { d: 1 });
    for (const g of SG) O(c, 14 * g, -14, 11, 11, col, { d: 2, hl: [10 * g - 2, -20, 3.5, 2, -0.4] });
    O(c, 0, 3, 30, 19, col, { hl: [-12, -6, 8, 3.5, -0.3] });
    eyes(c, s, 14, -15, 5.6);
    blush(c, 21, 7, 4.2);
    dots(c, [[-3, -3, 1.1], [3, -3, 1.1]], dk(col, 0.45));
    if (s.happy || s.jump || s.surp || s.sad) mouth(c, s, 0, 6, s.surp ? 5 : 10);
    else ln(c, c => { c.moveTo(-15, 5); c.quadraticCurveTo(0, 15, 15, 5); }, LW * 1.1);
  };

  D.llop = (c, s) => {
    const col = "#8F9CB3", light = "#E3E8F0", dark = "#5F6A80";
    c.save(); rot(c, 16, 38, s.wag * 0.08);
    O(c, 29, 24, 9.5, 19, col, { r: 0.6, d: 2.5, inner: c => { c.beginPath(); ell(c, 37, 12, 7, 8, 0.6); c.fillStyle = dark; c.fill(); } });
    c.restore();
    sit(c, s, col, { belly: light });
    for (const g of SG) {
      c.save(); rot(c, 15 * g, -24, (s.sad ? 0.5 : 0) * g);
      P(c, c => { c.moveTo(24 * g, -16); c.quadraticCurveTo(24 * g, -40, 19 * g, -44); c.quadraticCurveTo(12 * g, -38, 5 * g, -28); c.closePath(); }, col, { d: 1.5, inner: c => { c.beginPath(); c.moveTo(14 * g, -48); c.lineTo(28 * g, -48); c.lineTo(24 * g, -38); c.lineTo(15 * g, -40); c.closePath(); c.fillStyle = dark; c.fill(); } });
      P(c, c => { c.moveTo(19 * g, -20); c.quadraticCurveTo(20 * g, -33, 18 * g, -36); c.quadraticCurveTo(14 * g, -32, 10 * g, -26); c.closePath(); }, "#F1C6CF", { d: 0, ol: false });
      c.restore();
    }
    for (const g of SG) P(c, c => { c.moveTo(20 * g, -14); c.lineTo(30 * g, -6); c.lineTo(23 * g, -3); c.lineTo(30 * g, 3); c.lineTo(18 * g, 6); c.closePath(); }, col, { d: 1 });
    O(c, 0, -10, 24, 20, col, { inner: c => { c.beginPath(); c.moveTo(-30, -4); c.bezierCurveTo(-16, -8, -6, -6, 0, -10); c.bezierCurveTo(6, -6, 16, -8, 30, -4); c.lineTo(30, 20); c.lineTo(-30, 20); c.closePath(); c.fillStyle = light; c.fill(); }, hl: [-10, -21, 6, 3, -0.4] });
    O(c, 0, 0, 10.5, 8, light, { d: 1.5 });
    eyes(c, s, 10, -13, 4.3);
    blush(c, 15.5, -4, 3.4);
    O(c, 0, -3.5, 4.6, 3.4, NOSE, { d: 0, hl: [-1.4, -4.6, 1.4, 0.8] });
    ln(c, c => { c.moveTo(0, -0.5); c.lineTo(0, 1.5); }, LW);
    mouth(c, s, 0, 1.8, 3.2, s.happy || s.jump ? null : "w");
  };

  D.senglar = (c, s) => {
    const col = "#8A6550", mz = "#C49B83", br = "#5E4335";
    c.save(); rot(c, 17, 20, s.wag * 0.2); tube(c, c => { c.moveTo(16, 22); c.quadraticCurveTo(26, 20, 27, 28); }, 2.2, col); c.restore();
    stand(c, s, col, { hoof: "#3E2E28" });
    P(c, c => { c.moveTo(-14, -26); const z = [[-11, -40], [-6, -31], [-2, -44], [2, -32], [7, -42], [10, -31], [14, -37], [15, -26]]; for (const p of z) c.lineTo(p[0], p[1]); c.closePath(); }, br, { d: 1.2 });
    for (const g of SG) { c.save(); rot(c, 18 * g, -24, (s.sad ? 0.5 : Math.sin(s.t * 3) * 0.06) * g); P(c, c => { c.moveTo(14 * g, -26); c.quadraticCurveTo(26 * g, -40, 28 * g, -34); c.quadraticCurveTo(28 * g, -24, 22 * g, -18); c.closePath(); }, col, { d: 1.2 }); c.restore(); }
    O(c, 0, -10, 26, 22, col, { hl: [-10, -22, 7, 3.5, -0.4] });
    for (const g of SG) P(c, c => { c.moveTo(9 * g, 5); c.quadraticCurveTo(16 * g, 2, 15 * g, -6); c.quadraticCurveTo(13 * g, 0, 9 * g, 1); c.closePath(); }, "#FFF8E7", { d: 0.8 });
    O(c, 0, 3, 12.5, 9, mz, { d: 1.8, hl: [-5, -1, 4, 1.6] });
    c.fillStyle = "#6E4A3C"; c.beginPath(); ell(c, -4, 3, 2, 3.2); ell(c, 4, 3, 2, 3.2); c.fill();
    eyes(c, s, 11, -14, 4.2);
    ln(c, c => { for (const g of SG) { c.moveTo(15 * g, -21); c.lineTo(7 * g, -20); } }, 2.2, br);
    blush(c, 18, -3, 3.6);
    mouth(c, s, 0, 13.5, 3.4);
  };

  /* ── llista ── */
  const list = [
    ["vaca", "vaca", "granja"], ["porc", "porc", "granja"], ["gallina", "gallina", "granja"], ["ovella", "ovella", "granja"],
    ["cavall", "cavall", "granja"], ["anec", "ànec", "granja"], ["conill", "conill", "granja"], ["cabra", "cabra", "granja"],
    ["ruc", "ruc", "granja"], ["gat", "gat", "granja"], ["gos", "gos", "granja"], ["pollet", "pollet", "granja"],
    ["peix", "peix", "mar"], ["pop", "pop", "mar"], ["cranc", "cranc", "mar"], ["balena", "balena", "mar"], ["tortuga", "tortuga", "mar"],
    ["estrella", "estrella", "mar"], ["medusa", "medusa", "mar"], ["dofi", "dofí", "mar"], ["cavallet", "cavallet", "mar"], ["foca", "foca", "mar"],
    ["lleo", "lleó", "selva"], ["elefant", "elefant", "selva"], ["girafa", "girafa", "selva"], ["mico", "mico", "selva"], ["zebra", "zebra", "selva"],
    ["tigre", "tigre", "selva"], ["lloro", "lloro", "selva"], ["serp", "serp", "selva"], ["hipopotam", "hipopòtam", "selva"], ["cocodril", "cocodril", "selva"],
    ["papallona", "papallona", "insectes"], ["marieta", "marieta", "insectes"], ["abella", "abella", "insectes"], ["cargol", "cargol", "insectes"],
    ["formiga", "formiga", "insectes"], ["libellula", "libèl·lula", "insectes"], ["cuc", "cuc", "insectes"], ["aranya", "aranya", "insectes"], ["grill", "grill", "insectes"],
    ["guineu", "guineu", "bosc"], ["os", "ós", "bosc"], ["mussol", "mussol", "bosc"], ["esquirol", "esquirol", "bosc"], ["erico", "eriçó", "bosc"],
    ["cervol", "cérvol", "bosc"], ["granota", "granota", "bosc"], ["llop", "llop", "bosc"], ["senglar", "senglar", "bosc"],
  ].map(([id, name, theme]) => ({ id, name, theme }));
  const byId = {}, themes = {};
  for (const e of list) { byId[e.id] = e; (themes[e.theme] = themes[e.theme] || []).push(e); }

  /* ── dibuix ── */
  function draw(ctx, id, x, y, size, o = NO) {
    const f = D[id]; if (!f || !(size > 0)) return;
    const t = o.t || 0, pose = o.pose || "idle";
    const s = { t, pose, happy: pose === "happy", sad: pose === "sad", surp: pose === "surprised", jump: pose === "jump", closed: !!o.blink, wag: Math.sin(t * 5) };
    const k = size / 100, br = Math.sin(t * 2.4);
    let sx = 1 - br * 0.008, sy = 1 + br * 0.014, dy = 0;
    if (s.happy) dy = -Math.abs(Math.sin(t * 7)) * 5;
    else if (s.jump) { dy = -7; sx *= 0.92; sy *= 1.08; }
    else if (s.sad) { sx *= 1.03; sy *= 0.95; }
    else if (s.surp) { sx *= 0.97; sy *= 1.04; dy = -2; }
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
    ctx.translate(x, y);
    ctx.scale(o.flip ? -k : k, k);
    ctx.translate(0, 45 + dy); ctx.scale(sx, sy); ctx.translate(0, -45);
    ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.lineWidth = LW; ctx.strokeStyle = OL;
    f(ctx, s);
    ctx.restore();
  }

  return {
    list,
    byTheme: th => (themes[th] || []).slice(),
    draw,
    name: id => (byId[id] ? byId[id].name : ""),
  };
})();
