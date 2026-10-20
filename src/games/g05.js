"use strict";
/* 5. Mosaic màgic — banc de trencadís modernista: rajoles blanques que s'esmalten lletra a lletra */
(() => {
  /* ---------- imatges del mosaic (espai de disseny 100 × 100) ---------- */
  const PICS = {
    flor: {
      name: "la flor", de: "de la flor", bg: ["#8FCBE8", "#A4D6EE", "#7FBFE0"], pal: ["#3E9B4F", "#2F7D3E", "#E8507A", "#C93A62", "#F6C343", "#C9875A"],
      draw(x) {
        x.fillStyle = "#C9875A"; x.fillRect(-60, 90, 220, 40);
        x.strokeStyle = "#3E9B4F"; x.lineWidth = 9; x.lineCap = "round"; x.beginPath(); x.moveTo(50, 50); x.quadraticCurveTo(46, 72, 50, 94); x.stroke();
        x.fillStyle = "#2F7D3E"; x.beginPath(); x.ellipse(36, 76, 14, 6, -0.5, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(64, 68, 14, 6, 0.5, 0, 6.28); x.fill();
        for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 - 1.57; x.fillStyle = i % 2 ? "#C93A62" : "#E8507A"; x.beginPath(); x.arc(50 + Math.cos(a) * 18, 36 + Math.sin(a) * 18, 14, 0, 6.28); x.fill(); }
        x.fillStyle = "#F6C343"; x.beginPath(); x.arc(50, 36, 12, 0, 6.28); x.fill();
      },
    },
    ocell: {
      name: "l'ocell", de: "de l'ocell", bg: ["#F9E7A6", "#F5DB8C", "#FBEEC0"], pal: ["#2F7FC1", "#1E5A92", "#F39A2B", "#1A1A1A", "#F5F0E2", "#8A5A33", "#5DAA4E"],
      draw(x) {
        x.strokeStyle = "#8A5A33"; x.lineWidth = 8; x.lineCap = "round"; x.beginPath(); x.moveTo(-10, 84); x.lineTo(110, 80); x.stroke();
        x.fillStyle = "#5DAA4E"; x.beginPath(); x.ellipse(14, 76, 10, 5, -0.4, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(88, 74, 10, 5, 0.4, 0, 6.28); x.fill();
        x.fillStyle = "#1E5A92"; x.beginPath(); x.moveTo(26, 54); x.lineTo(2, 38); x.lineTo(8, 66); x.closePath(); x.fill();
        x.fillStyle = "#2F7FC1"; x.beginPath(); x.ellipse(48, 56, 28, 21, 0, 0, 6.28); x.fill(); x.beginPath(); x.arc(72, 38, 15, 0, 6.28); x.fill();
        x.fillStyle = "#F5F0E2"; x.beginPath(); x.ellipse(54, 64, 17, 10, 0, 0, 6.28); x.fill();
        x.fillStyle = "#1E5A92"; x.beginPath(); x.ellipse(42, 50, 18, 10, -0.35, 0, 6.28); x.fill();
        x.fillStyle = "#F39A2B"; x.beginPath(); x.moveTo(84, 34); x.lineTo(98, 40); x.lineTo(84, 45); x.closePath(); x.fill();
        x.fillStyle = "#1A1A1A"; x.beginPath(); x.arc(75, 34, 4, 0, 6.28); x.fill();
        x.strokeStyle = "#F39A2B"; x.lineWidth = 3; x.beginPath(); x.moveTo(44, 74); x.lineTo(42, 82); x.moveTo(56, 74); x.lineTo(56, 82); x.stroke();
      },
    },
    drac: {
      name: "el drac", de: "del drac", bg: ["#B9E0F0", "#A6D3EA", "#CFEAF5"], pal: ["#3FA34D", "#2C7D3A", "#E8A23A", "#E8603A", "#F2D35C", "#FFFFFF", "#1A1A1A", "#3A78C9"],
      draw(x) {
        x.strokeStyle = "#3FA34D"; x.lineWidth = 12; x.lineCap = "round"; x.beginPath(); x.moveTo(26, 62); x.quadraticCurveTo(4, 64, 8, 42); x.stroke();
        x.fillStyle = "#E8603A"; x.beginPath(); x.moveTo(8, 42); x.lineTo(0, 32); x.lineTo(14, 36); x.closePath(); x.fill();
        x.fillStyle = "#E8A23A"; x.beginPath(); x.moveTo(40, 52); x.lineTo(30, 16); x.lineTo(50, 30); x.lineTo(64, 18); x.lineTo(62, 50); x.closePath(); x.fill();
        x.fillStyle = "#2C7D3A"; for (const lx of [32, 44, 60, 70]) x.fillRect(lx - 4, 66, 8, 18);
        x.fillStyle = "#3FA34D"; x.beginPath(); x.ellipse(50, 62, 28, 15, 0, 0, 6.28); x.fill();
        x.beginPath(); x.moveTo(66, 56); x.quadraticCurveTo(76, 40, 80, 34); x.lineTo(88, 44); x.quadraticCurveTo(80, 56, 74, 66); x.closePath(); x.fill();
        x.beginPath(); x.arc(82, 36, 12, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(92, 40, 9, 7, 0, 0, 6.28); x.fill();
        x.fillStyle = "#F2D35C"; x.beginPath(); x.ellipse(52, 69, 20, 6, 0, 0, 6.28); x.fill();
        x.fillStyle = "#3A78C9"; for (const [px, py] of [[40, 58], [54, 55], [64, 62]]) { x.beginPath(); x.arc(px, py, 4, 0, 6.28); x.fill(); }
        x.fillStyle = "#E8603A"; for (let i = 0; i < 5; i++) { const px = 28 + i * 10; x.beginPath(); x.moveTo(px, 50 - (i === 2 ? 1 : 0)); x.lineTo(px + 5, 41); x.lineTo(px + 10, 49); x.closePath(); x.fill(); }
        x.fillStyle = "#FFFFFF"; x.beginPath(); x.arc(84, 32, 4.5, 0, 6.28); x.fill(); x.fillStyle = "#1A1A1A"; x.beginPath(); x.arc(85, 32, 2.2, 0, 6.28); x.fill();
      },
    },
    papallona: {
      name: "la papallona", de: "de la papallona", bg: ["#C9E8C0", "#B6DFAE", "#DAF0D2"], pal: ["#E86A2B", "#F2B630", "#3B2A4A", "#FFFFFF", "#B8442A"],
      draw(x) {
        x.fillStyle = "#E86A2B"; x.beginPath(); x.ellipse(30, 36, 22, 18, -0.3, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(70, 36, 22, 18, 0.3, 0, 6.28); x.fill();
        x.fillStyle = "#F2B630"; x.beginPath(); x.ellipse(34, 66, 16, 14, 0.3, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(66, 66, 16, 14, -0.3, 0, 6.28); x.fill();
        x.fillStyle = "#B8442A"; x.beginPath(); x.ellipse(24, 30, 8, 6, 0, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(76, 30, 8, 6, 0, 0, 6.28); x.fill();
        x.fillStyle = "#FFFFFF"; for (const [px, py] of [[34, 44], [66, 44], [32, 68], [68, 68]]) { x.beginPath(); x.arc(px, py, 4.5, 0, 6.28); x.fill(); }
        x.fillStyle = "#3B2A4A"; x.beginPath(); x.ellipse(50, 50, 5, 26, 0, 0, 6.28); x.fill();
        x.strokeStyle = "#3B2A4A"; x.lineWidth = 3; x.beginPath(); x.moveTo(48, 26); x.quadraticCurveTo(42, 12, 36, 10); x.moveTo(52, 26); x.quadraticCurveTo(58, 12, 64, 10); x.stroke();
      },
    },
    peix: {
      name: "el peix", de: "del peix", bg: ["#5DB7D6", "#4FA8C9", "#73C4DE"], pal: ["#F28C28", "#D9661A", "#FFFFFF", "#1A1A1A", "#F6D35B", "#2E8C6A"],
      draw(x) {
        x.fillStyle = "#2E8C6A"; x.fillRect(-60, 92, 220, 40); x.beginPath(); x.ellipse(14, 86, 5, 14, 0.2, 0, 6.28); x.fill(); x.beginPath(); x.ellipse(90, 84, 5, 16, -0.2, 0, 6.28); x.fill();
        x.fillStyle = "#D9661A"; x.beginPath(); x.moveTo(74, 50); x.lineTo(98, 28); x.lineTo(96, 72); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(36, 34); x.quadraticCurveTo(50, 14, 64, 32); x.closePath(); x.fill();
        x.fillStyle = "#F28C28"; x.beginPath(); x.ellipse(46, 50, 32, 20, 0, 0, 6.28); x.fill();
        x.save(); x.beginPath(); x.ellipse(46, 50, 32, 20, 0, 0, 6.28); x.clip(); x.fillStyle = "#FFFFFF"; x.fillRect(30, 20, 7, 60); x.fillRect(52, 20, 7, 60); x.restore();
        x.fillStyle = "#FFFFFF"; x.beginPath(); x.arc(24, 46, 6, 0, 6.28); x.fill(); x.fillStyle = "#1A1A1A"; x.beginPath(); x.arc(23, 46, 3, 0, 6.28); x.fill();
        x.fillStyle = "#F6D35B"; for (const [px, py, r] of [[8, 24, 4], [14, 12, 3], [84, 14, 3]]) { x.beginPath(); x.arc(px, py, r, 0, 6.28); x.fill(); }
      },
    },
  };
  const CFG = { 1: [4, 4], 2: [6, 6], 3: [6, 6], 4: [6, 6], 5: [8, 8], 6: [11, 6] };
  const RX0 = 96, RX1 = 1144, RY0 = 184, RY1 = 708;         // zona de la graella
  const PX0 = 1192, PX1 = 1540, PY0 = 184, PY1 = 708, PCX = (PX0 + PX1) / 2; // plafó lateral
  const DECO = ["#3A78C9", "#5FA3D9", "#E8A23A", "#F2D35C", "#3FA34D", "#8CC66B", "#E8603A", "#F4EEDF", "#E7E1D0", "#9D6BB8", "#2F9C9A"];

  /* ---------- geometria del trencadís ---------- */
  function clipPoly(poly, ax, ay, nx, ny) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dp = (p[0] - ax) * nx + (p[1] - ay) * ny, dq = (q[0] - ax) * nx + (q[1] - ay) * ny;
      if (dp <= 0) out.push(p);
      if ((dp <= 0) !== (dq <= 0)) { const k = dp / (dp - dq); out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]); }
    }
    return out;
  }
  /* trossos de Voronoi dins d'una rajola de costat s, amb junta */
  function makeShards(s, n, R) {
    const sites = [], cw = s / n, ins = Math.max(2, s * 0.035);
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) sites.push([(i + 0.5 + (R() - 0.5) * 0.75) * cw, (j + 0.5 + (R() - 0.5) * 0.75) * cw]);
    const base = [[ins, ins], [s - ins, ins], [s - ins, s - ins], [ins, s - ins]], gap = s * 0.018 + 0.9;
    const out = [];
    sites.forEach((a, i) => {
      let poly = base;
      sites.forEach((b, j) => { if (i !== j) poly = clipPoly(poly, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, b[0] - a[0], b[1] - a[1]); });
      if (poly.length < 3) return;
      let cx = 0, cy = 0; poly.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= poly.length; cy /= poly.length;
      poly = poly.map(p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1, k = Math.max(0, d - gap) / d; return [cx + dx * k, cy + dy * k]; });
      let r = 0; poly.forEach(p => r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cy)));
      out.push({ poly, cx, cy, r });
    });
    return out;
  }
  function paintShard(x, sh, col, v) {
    const P = sh.poly, r = sh.r;
    const path = () => { x.beginPath(); P.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
    const g = x.createLinearGradient(sh.cx - r, sh.cy - r, sh.cx + r, sh.cy + r);
    g.addColorStop(0, shade(col, clamp(0.3 + v, -1, 1))); g.addColorStop(0.5, v >= 0 ? shade(col, v) : shade(col, v)); g.addColorStop(1, shade(col, clamp(-0.24 + v, -1, 1)));
    path(); x.fillStyle = g; x.fill();
    x.save(); path(); x.clip();
    x.fillStyle = "rgba(255,255,255,0.3)"; x.beginPath(); x.ellipse(sh.cx - r * 0.3, sh.cy - r * 0.42, r * 0.6, r * 0.2, -0.55, 0, 6.28); x.fill();
    x.strokeStyle = "rgba(0,0,0,0.22)"; x.lineWidth = 2.2; x.translate(1.2, 1.4); path(); x.stroke();
    x.restore();
    x.lineJoin = "round"; x.lineWidth = 1; x.strokeStyle = "rgba(255,255,255,0.55)"; path(); x.stroke();
  }
  /* mostrejador de la imatge per a una graella cols × rows */
  function sampler(pic, cols, rows) {
    const S = 24, c = makeCanvas(cols * S, rows * S), x = c.getContext("2d");
    x.fillStyle = pic.bg[0]; x.fillRect(0, 0, c.width, c.height);
    const side = Math.min(c.width, c.height) * 0.98, ox = (c.width - side) / 2, oy = (c.height - side) / 2;
    x.save(); x.translate(ox, oy); x.scale(side / 100, side / 100); pic.draw(x); x.restore();
    const d = x.getImageData(0, 0, c.width, c.height).data, pal = [pic.bg[0]].concat(pic.pal), rgb = pal.map(hexToRgb);
    return (u, v) => { // u, v en unitats de rajola
      const px = clamp(Math.floor(u * S), 0, c.width - 1), py = clamp(Math.floor(v * S), 0, c.height - 1), o = (py * c.width + px) * 4;
      let best = 0, bd = 1e9; rgb.forEach((q, i) => { const dd = (q[0] - d[o]) ** 2 + (q[1] - d[o + 1]) ** 2 + (q[2] - d[o + 2]) ** 2; if (dd < bd) { bd = dd; best = i; } });
      return best === 0 ? null : pal[best];
    };
  }
  /* sprite esmaltat d'una rajola (trossos de colors segons la imatge) */
  function glazedTile(s, col, row, samp, pic, R) {
    const c = makeCanvas(s * 2, s * 2), x = c.getContext("2d"); x.scale(2, 2);
    const sh = makeShards(s, s >= 120 ? 4 : 3, R);
    let avg = [0, 0, 0];
    sh.forEach(q => {
      const k = samp(col + q.cx / s, row + q.cy / s), hex = k || pic.bg[Math.floor(R() * pic.bg.length)];
      paintShard(x, q, hex, (R() - 0.5) * 0.16);
      const [r, g, b] = hexToRgb(hex); avg[0] += r; avg[1] += g; avg[2] += b;
    });
    avg = avg.map(v => Math.round(v / sh.length));
    return { c, avg: `rgb(${avg[0]},${avg[1]},${avg[2]})` };
  }
  function whiteTile(s) {
    return Sprites.get("m5w" + Math.round(s), s, s, (x) => {
      const ins = Math.max(2, s * 0.035), w = s - ins * 2, r = s * 0.09;
      x.save(); x.shadowColor = "rgba(60,50,30,0.35)"; x.shadowBlur = 3; x.shadowOffsetY = 1.5; rr(x, ins, ins, w, w, r); x.fillStyle = "#F6F2E8"; x.fill(); x.restore();
      const g = x.createRadialGradient(s / 2, s / 2, s * 0.22, s / 2, s / 2, s * 0.72); g.addColorStop(0, "#FFFEFA"); g.addColorStop(0.6, "#FBF8F0"); g.addColorStop(1, "#E4DDCD");
      rr(x, ins, ins, w, w, r); x.fillStyle = g; x.fill();
      x.lineWidth = 1.6; x.strokeStyle = "rgba(255,255,255,0.95)"; rr(x, ins + 1.5, ins + 1.5, w - 3, w - 3, r - 1); x.stroke();
      x.strokeStyle = "rgba(120,100,70,0.22)"; x.lineWidth = 1.2; rr(x, ins + 0.5, ins + 0.5, w - 1, w - 1, r); x.stroke();
      x.fillStyle = "rgba(255,255,255,0.75)"; x.beginPath(); x.ellipse(ins + w * 0.24, ins + w * 0.12, w * 0.16, w * 0.035, -0.2, 0, 6.28); x.fill();
    });
  }
  const glint = () => Sprites.get("m5glint", 80, 80, (x) => {
    const g = x.createRadialGradient(40, 40, 0, 40, 40, 40); g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(0.3, "rgba(255,255,255,0.35)"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.beginPath(); x.ellipse(40, 40, 40, 22, -0.5, 0, 6.28); x.fill();
  });
  const litGlow = (s) => Sprites.get("m5lit" + Math.round(s), s + 60, s + 60, (x) => {
    x.shadowColor = "rgba(255,206,90,0.95)"; x.shadowBlur = 22; x.strokeStyle = "rgba(255,214,110,0.9)"; x.lineWidth = 8; rr(x, 30, 30, s, s, s * 0.1); x.stroke();
  });

  /* ---------- fons: cel, muntanyes, pins i el banc ondulat ---------- */
  function trencadisArea(x, x0, y0, w, h, cell, R, pal, desat) {
    const nx = Math.ceil(w / cell) + 1, ny = Math.ceil(h / cell) + 1, P = [];
    for (let j = 0; j <= ny; j++) { P[j] = []; for (let i = 0; i <= nx; i++) P[j][i] = [x0 + i * cell + (i && i < nx ? (R() - 0.5) * cell * 0.6 : 0), y0 + j * cell + (j && j < ny ? (R() - 0.5) * cell * 0.6 : 0)]; }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const a = P[j][i], b = P[j][i + 1], c = P[j + 1][i + 1], d = P[j + 1][i];
      const polys = R() < 0.45 ? (R() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]) : [[a, b, c, d]];
      polys.forEach(poly => {
        let cx = 0, cy = 0; poly.forEach(p => { cx += p[0]; cy += p[1]; }); cx /= poly.length; cy /= poly.length;
        const g = 2.2, pts = poly.map(p => { const dx = p[0] - cx, dy = p[1] - cy, dd = Math.hypot(dx, dy) || 1, k = Math.max(0, dd - g) / dd; return [cx + dx * k, cy + dy * k]; });
        let r = 0; pts.forEach(p => r = Math.max(r, Math.hypot(p[0] - cx, p[1] - cy)));
        const col = mix(pal[Math.floor(R() * pal.length)], "#C9C3B6", desat);
        const hx = "#" + hexToRgbStr(col);
        paintShard(x, { poly: pts, cx, cy, r }, hx, (R() - 0.5) * 0.14);
      });
    }
  }
  function hexToRgbStr(rgbStr) { const m = rgbStr.match(/\d+/g).map(Number); return m.map(v => v.toString(16).padStart(2, "0")).join(""); }
  const crestY = xx => 150 + Math.sin(xx / 150 + 0.6) * 16 + Math.sin(xx / 61) * 4;
  function buildBg(lay) {
    const c = makeCanvas(W, H), x = c.getContext("2d"), R = mulberry32(505);
    // cel mediterrani
    let g = x.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, "#6FB6E2"); g.addColorStop(1, "#D8EEF6"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = "rgba(255,255,255,0.75)"; for (const [cx, cy, s] of [[230, 70, 1], [1180, 56, 1.3], [1460, 110, 0.8]]) { for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(cx + (k - 2) * 34 * s, cy + Math.abs(k - 2) * 6, 40 * s, 20 * s, 0, 0, 6.28); x.fill(); } }
    // serralades (Montserrat llunyà) amb boira
    const ridge = (y0, amp, col, seed, bumps) => {
      const n = makeNoise(seed); x.beginPath(); x.moveTo(0, H);
      for (let xx = 0; xx <= W; xx += 8) { const v = n.fbm(xx / 260, 0.5, 3), b = Math.abs(Math.sin(xx / bumps)) ; x.lineTo(xx, y0 - v * amp - b * amp * 0.35); }
      x.lineTo(W, H); x.closePath(); x.fillStyle = col; x.fill();
    };
    ridge(330, 170, "#9DB3C9", 11, 38); ridge(380, 120, "#87A0AE", 12, 55); ridge(430, 90, "#7E9A7C", 13, 120);
    x.fillStyle = "rgba(216,238,246,0.35)"; x.fillRect(0, 250, W, 200);
    // pins pinyoners
    const pine = (px, py, s) => {
      x.strokeStyle = "#6B4A33"; x.lineWidth = 9 * s; x.lineCap = "round"; x.beginPath(); x.moveTo(px, py + 160 * s); x.quadraticCurveTo(px + 14 * s, py + 80 * s, px + 4 * s, py); x.stroke();
      for (let k = 0; k < 7; k++) { x.fillStyle = k % 2 ? "#3F6E3B" : "#4F8447"; x.beginPath(); x.ellipse(px + (k - 3) * 30 * s, py - 6 * s + Math.abs(k - 3) * 6 * s, 52 * s, 22 * s, 0, 0, 6.28); x.fill(); }
      x.fillStyle = "rgba(255,255,255,0.12)"; x.beginPath(); x.ellipse(px - 20 * s, py - 18 * s, 70 * s, 10 * s, 0, 0, 6.28); x.fill();
    };
    pine(70, 200, 1.1); pine(1530, 190, 1.2); pine(1250, 250, 0.8); pine(330, 260, 0.7);
    // terra de sauló
    g = x.createLinearGradient(0, 790, 0, H); g.addColorStop(0, "#D9C29B"); g.addColorStop(1, "#C4A97E"); x.fillStyle = g; x.fillRect(0, 790, W, 110);
    for (let k = 0; k < 900; k++) { x.fillStyle = R() < 0.5 ? "rgba(120,90,50,0.25)" : "rgba(255,245,220,0.35)"; x.fillRect(R() * W, 795 + R() * 105, 1 + R() * 2.5, 1 + R() * 2); }
    // banc: respatller ondulat cobert de trencadís
    const back = cx => { cx.beginPath(); cx.moveTo(20, 760); for (let xx = 20; xx <= W - 20; xx += 10) cx.lineTo(xx, crestY(xx)); cx.lineTo(W - 20, 760); cx.closePath(); };
    x.save(); x.shadowColor = "rgba(40,40,60,0.4)"; x.shadowBlur = 30; x.shadowOffsetY = 12; back(x); x.fillStyle = "#C9C3B6"; x.fill(); x.restore();
    x.save(); back(x); x.clip(); x.fillStyle = "#C3BBAA"; x.fillRect(0, 0, W, H);
    trencadisArea(x, 0, 120, W, 660, 58, R, DECO, 0.5);
    x.fillStyle = "rgba(226,218,200,0.28)"; x.fillRect(0, 100, W, 700);
    // ombra suau sota la cresta
    g = x.createLinearGradient(0, 150, 0, 260); g.addColorStop(0, "rgba(255,255,255,0.18)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 120, W, 160);
    x.restore();
    // vora arrodonida de la cresta
    x.save(); x.lineCap = "round"; x.lineJoin = "round";
    x.beginPath(); for (let xx = 20; xx <= W - 20; xx += 10) xx === 20 ? x.moveTo(xx, crestY(xx)) : x.lineTo(xx, crestY(xx));
    x.strokeStyle = "rgba(60,50,40,0.35)"; x.lineWidth = 30; x.stroke(); x.strokeStyle = "#EEE7D6"; x.lineWidth = 24; x.stroke(); x.strokeStyle = "rgba(255,255,255,0.8)"; x.lineWidth = 6; x.translate(0, -6); x.stroke(); x.restore();
    // seient i peu del banc
    x.fillStyle = "#B5AC99"; x.fillRect(20, 740, W - 40, 70);
    x.save(); x.beginPath(); x.rect(20, 760, W - 40, 50); x.clip(); trencadisArea(x, 20, 756, W - 40, 60, 34, R, DECO, 0.35); x.restore();
    g = x.createLinearGradient(0, 728, 0, 764); g.addColorStop(0, "#F3EEE2"); g.addColorStop(1, "#D9D1BF"); x.fillStyle = g; rr(x, 10, 728, W - 20, 34, 14); x.fill();
    x.fillStyle = "rgba(255,255,255,0.6)"; x.fillRect(24, 731, W - 48, 3);
    g = x.createLinearGradient(0, 808, 0, 840); g.addColorStop(0, "rgba(60,40,20,0.35)"); g.addColorStop(1, "rgba(60,40,20,0)"); x.fillStyle = g; x.fillRect(20, 808, W - 40, 32);
    // encaix de la graella: motllura blanca i junta de ciment amb gra
    const recess = (rx, ry, rw, rh, fill) => {
      x.save(); x.shadowColor = "rgba(30,25,15,0.45)"; x.shadowBlur = 16; x.shadowOffsetY = 6; rr(x, rx - 18, ry - 18, rw + 36, rh + 36, 22); x.fillStyle = "#F1EADA"; x.fill(); x.restore();
      g = x.createLinearGradient(rx, ry - 18, rx, ry + rh + 18); g.addColorStop(0, "#FFFFFF"); g.addColorStop(1, "#D8CFBB"); rr(x, rx - 18, ry - 18, rw + 36, rh + 36, 22); x.fillStyle = g; x.fill();
      x.strokeStyle = "#2F6FB0"; x.lineWidth = 4; rr(x, rx - 10, ry - 10, rw + 20, rh + 20, 16); x.stroke();
      x.fillStyle = "#E8A23A"; for (const [cx, cy] of [[rx - 10, ry - 10], [rx + rw + 10, ry - 10], [rx - 10, ry + rh + 10], [rx + rw + 10, ry + rh + 10]]) { x.beginPath(); x.arc(cx, cy, 7, 0, 6.28); x.fill(); }
      x.save(); rr(x, rx - 4, ry - 4, rw + 8, rh + 8, 10); x.clip(); x.drawImage(Tex.paper(512, 512, fill, { seed: 55, fiber: 2.6 }), rx - 4, ry - 4, Math.max(rw + 8, 512), Math.max(rh + 8, 512));
      for (let k = 0; k < rw * rh / 60; k++) { x.fillStyle = R() < 0.5 ? "rgba(70,60,45,0.22)" : "rgba(255,255,255,0.25)"; x.fillRect(rx + R() * rw, ry + R() * rh, 1 + R() * 1.6, 1 + R() * 1.6); }
      x.strokeStyle = "rgba(40,30,15,0.45)"; x.lineWidth = 6; rr(x, rx - 4, ry - 4, rw + 8, rh + 8, 10); x.stroke(); x.restore();
    };
    recess(lay.gx, lay.gy, lay.gw, lay.gh, "#B9AF9C");
    // plafó lateral: placa de ceràmica crema
    x.save(); x.shadowColor = "rgba(30,25,15,0.45)"; x.shadowBlur = 16; x.shadowOffsetY = 6; rr(x, PX0, PY0, PX1 - PX0, PY1 - PY0, 26); x.fillStyle = "#F4EEDF"; x.fill(); x.restore();
    g = x.createLinearGradient(PX0, PY0, PX1, PY1); g.addColorStop(0, "#FFFDF6"); g.addColorStop(1, "#EAE1CC"); rr(x, PX0, PY0, PX1 - PX0, PY1 - PY0, 26); x.fillStyle = g; x.fill();
    x.strokeStyle = "#2F6FB0"; x.lineWidth = 5; rr(x, PX0 + 12, PY0 + 12, PX1 - PX0 - 24, PY1 - PY0 - 24, 18); x.stroke();
    x.strokeStyle = "rgba(47,111,176,0.45)"; x.lineWidth = 2; rr(x, PX0 + 22, PY0 + 22, PX1 - PX0 - 44, PY1 - PY0 - 44, 12); x.stroke();
    // flors modernistes als cantons del plafó
    for (const [cx, cy] of [[PX0 + 12, PY0 + 12], [PX1 - 12, PY0 + 12], [PX0 + 12, PY1 - 12], [PX1 - 12, PY1 - 12]]) {
      for (let k = 0; k < 4; k++) { const a = k * 1.571 + 0.785; x.fillStyle = "#3A78C9"; x.beginPath(); x.ellipse(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9, 8, 4.5, a, 0, 6.28); x.fill(); }
      x.fillStyle = "#F2B630"; x.beginPath(); x.arc(cx, cy, 5, 0, 6.28); x.fill();
    }
    return c;
  }

  /* miniatura (illa, targeta, museu): un tros de mosaic amb la rajola de la m */
  function thumbSprite() {
    return Sprites.get("m5thumb", 300, 300, (x) => {
      const n = 5, s = 60, pic = PICS.flor, samp = sampler(pic, n, n), R = mulberry32(77);
      x.fillStyle = "#B9AF9C"; x.fillRect(0, 0, 300, 300);
      x.drawImage(Tex.paper(300, 300, "#B9AF9C", { seed: 55, fiber: 2.6 }), 0, 0);
      for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
        if (i === 3 && j === 2) { const wt = whiteTile(s); x.drawImage(wt.c, i * s, j * s, s, s); continue; }
        const t = glazedTile(s, i, j, samp, pic, R); x.drawImage(t.c, i * s, j * s, s, s);
      }
      x.save(); x.shadowColor = "rgba(255,200,80,0.9)"; x.shadowBlur = 12; x.strokeStyle = "#F2B630"; x.lineWidth = 4; rr(x, 3 * s + 3, 2 * s + 3, s - 6, s - 6, 6); x.stroke(); x.restore();
      text(x, "m", 3.5 * s, 2.5 * s + 2, { size: 44, weight: 700, color: BRAND.ink });
    });
  }

  Games.register({
    id: 5, key: "m", name: "Mosaic màgic", zone: "muntanya", music: "guitar", demoTime: 10, missAt: [W - 312, 320],
    collect: { one: "mosaic", many: "mosaics" },
    goal: l => l <= 3 ? "Escriu la lletra de la rajola que brilla. Amb les fletxes tries la rajola." : l === 4 ? "Escriu la síl·laba que brilla i esmalta el mosaic." : "Cada fila és una paraula: escriu-la i esmalta el mosaic.",
    thumb(ctx, x, y, w, h, t) {
      const sp = thumbSprite(), sc = Math.max(w, h) / 300;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.drawImage(sp.c, x + w / 2 - 150 * sc, y + h / 2 - 150 * sc, 300 * sc, 300 * sc);
      const lx = x + w * (0.5 + Math.cos(t * 0.8) * 0.4), ly = y + h * (0.4 + Math.sin(t * 0.6) * 0.3), R0 = Math.max(w, h) * 0.45;
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R0); g.addColorStop(0, "rgba(255,255,255,0.38)"); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      ctx.restore();
    },
    create(api) {
      const L = api.level, [cols, rows] = CFG[L];
      const picKey = api.demo ? "flor" : L === 1 ? pick(["flor", "papallona", "peix"]) : pick(Object.keys(PICS)), pic = PICS[picKey];
      const s = Math.floor(Math.min((RX1 - RX0) / cols, (RY1 - RY0) / rows)), gw = s * cols, gh = s * rows;
      const gx = Math.round((RX0 + RX1) / 2 - gw / 2), gy = Math.round((RY0 + RY1) / 2 - gh / 2);
      const lay = { gx, gy, gw, gh }, bg = buildBg(lay), samp = sampler(pic, cols, rows), R = mulberry32(randi(1, 1e6));
      const fs = L <= 3 ? Math.max(64, Math.round(s * 0.62)) : L === 4 ? Math.round(s * 0.6) : Math.max(42, Math.round(s * 0.6));
      const pool = api.pool(L >= 5 ? { filter: w => w.length <= cols } : undefined);
      const tiles = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const T = glazedTile(s, c, r, samp, pic, R);
        // esquerda que es repara: traç en ziga-zaga des d'un cantó
        // (només a la vora: mai no passa per sobre de la lletra)
        const crack = [], left = R() < 0.5, ex = v => left ? v : s - v; let py = s * (0.08 + R() * 0.1); crack.push([ex(s * 0.06), py]);
        for (let k = 0; k < 6; k++) { py += s * 0.12; crack.push([ex(s * (0.09 + R() * 0.08)), py]); }
        tiles.push({ r, c, x: gx + c * s + s / 2, y: gy + r * s + s / 2, ch: null, spr: T.c, avg: T.avg, g: 0, gd: 0, delay: 0, crack, ck: 0, shake: 0, pop: 0 });
      }
      const groups = [];
      if (L <= 3) tiles.forEach((t, i) => { t.ch = pool.next(); groups.push({ tiles: [i], text: t.ch, typed: 0, row: t.r }); });
      else if (L === 4) for (let r = 0; r < rows; r++) for (let k = 0; k < cols / 2; k++) { const sy = pool.next(), i = r * cols + k * 2; tiles[i].ch = sy[0]; tiles[i + 1].ch = sy[1]; groups.push({ tiles: [i, i + 1], text: sy, typed: 0, row: r }); }
      else { const used = []; for (let r = 0; r < rows; r++) { const w = pool.next(used); used.push(w); const c0 = Math.floor((cols - w.length) / 2), ids = []; for (let k = 0; k < w.length; k++) { const i = r * cols + c0 + k; tiles[i].ch = w[k]; ids.push(i); } const fill = []; for (let c = 0; c < cols; c++) if (c < c0 || c >= c0 + w.length) fill.push(r * cols + c); groups.push({ tiles: ids, text: w, typed: 0, row: r, fill, c0 }); } }
      groups.forEach(gr => { gr.cx = gr.tiles.reduce((a, i) => a + tiles[i].x, 0) / gr.tiles.length; gr.cy = tiles[gr.tiles[0]].y; });
      const order = L <= 3 ? shuffle(groups.map((_, i) => i)) : groups.map((_, i) => i);
      const st = { phase: "play", t: 0, sweep: 0, announce: 0.35, done: 0 };
      let sel = order[0], light = [800, 300];
      const total = tiles.length;
      const unfinished = () => groups.map((g, i) => i).filter(i => groups[i].typed < groups[i].text.length);
      const announce = () => { const g = groups[sel]; if (g) api.sayItem(g.text, "{x}"); };
      function select(i, quiet) { if (i == null || i === sel) return; sel = i; st.announce = quiet ? 0 : 0.25; groups[sel].tiles.forEach(t => tiles[t].pop = 1); }
      function nextGroup() {
        const left = unfinished(); if (!left.length) return null;
        if (L <= 3) return order.find(i => left.includes(i));
        return left.find(i => i > sel) != null ? left.find(i => i > sel) : left[0];
      }
      function move(dir) {
        const D = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[dir], cur = groups[sel], left = unfinished().filter(i => i !== sel);
        if (!left.length) return;
        if (L >= 4 && D[1] === 0) { // en files de síl·labes o paraules: anterior o següent
          const n = D[0] > 0 ? (left.find(i => i > sel) != null ? left.find(i => i > sel) : left[0]) : (left.slice().reverse().find(i => i < sel) != null ? left.slice().reverse().find(i => i < sel) : left[left.length - 1]);
          select(n); Sfx.play("tick"); return;
        }
        let best = null, bv = Infinity;
        for (const i of left) { const g = groups[i], dx = g.cx - cur.cx, dy = g.cy - cur.cy, along = dx * D[0] + dy * D[1], side = Math.abs(dx * D[1] - dy * D[0]); if (along < s * 0.4) continue; const v = along + side * 2.2; if (v < bv) { bv = v; best = i; } }
        if (best != null) { select(best); Sfx.play("tick"); } else Sfx.play("click0");
      }
      function glaze(i, delay) { const t = tiles[i]; if (t.gd) return; t.gd = 1; t.delay = delay || 0; }
      function dring(k) { Sfx.play("chime", { note: 84 + [0, 2, 4, 7, 9, 12][k % 6] }); noise({ f: 6200, q: 3, d: 0.05, v: 0.12 }); }
      let notes = 0;
      return {
        expected() { if (st.phase !== "play" || sel == null) return null; const g = groups[sel]; return g.text[g.typed]; },
        onKey(k) {
          if (st.phase !== "play") return;
          if (k.startsWith("Arrow")) { move(k); return; }
          if (k.length !== 1) return;
          const g = groups[sel], ch = g.text[g.typed], ti = tiles[g.tiles[g.typed]];
          if (k === ch) {
            api.hit({ sfx: false }); dring(notes++); glaze(g.tiles[g.typed]); g.typed++;
            api.particles.emit(ti.x, ti.y, { count: 8, color: ["#fff", "#FFE9A8"], speed: 160, gravity: 120, size: 6, life: 0.5, shape: "star" });
            if (g.typed >= g.text.length) {
              if (g.fill) g.fill.forEach(i => glaze(i, 0.12 + Math.abs(tiles[i].c - (g.c0 + g.text.length / 2)) * 0.07));
              const n = nextGroup();
              if (n == null) { st.phase = "finishing"; st.t = 0; }
              else select(n);
            }
          } else {
            api.miss(ch, k); ti.ck = 1; ti.shake = 1; noise({ f: 3600, q: 2.5, d: 0.07, v: 0.28 });
            st.announce = 1.2;
          }
        },
        update(dt) {
          st.t += dt;
          const t = api.t; light = [800 + Math.cos(t * 0.31) * 520, 380 + Math.sin(t * 0.23) * 260];
          if (st.announce > 0) { st.announce -= dt; if (st.announce <= 0 && st.phase === "play") announce(); }
          let glazed = 0;
          tiles.forEach(tl => {
            if (tl.gd) { if (tl.delay > 0) tl.delay -= dt; else tl.g = Math.min(1, tl.g + dt / 0.55); }
            if (tl.g >= 1) glazed++;
            tl.ck = Math.max(0, tl.ck - dt / 1.4); tl.shake = Math.max(0, tl.shake - dt * 3); tl.pop = Math.max(0, tl.pop - dt * 3);
          });
          api.hud.progress = [groups.filter(g => g.typed >= g.text.length).length, groups.length];
          if (st.phase === "finishing" && glazed >= total && st.t > 0.6) { st.phase = "sweep"; st.t = 0; Sfx.play("glass"); [84, 88, 91, 96].forEach((n, i) => setTimeout(() => Sfx.play("chime", { note: n }), 150 + i * 160)); }
          if (st.phase === "sweep") {
            st.sweep = st.t / 1.7;
            if (Math.random() < 0.5) { const tl = pick(tiles); api.particles.emit(tl.x + rand(-s / 3, s / 3), tl.y + rand(-s / 3, s / 3), { count: 2, color: ["#fff", "#FFF3C4"], shape: "star", size: 12, speed: 40, gravity: 0, life: 0.8 }); }
            if (st.t > 2.2) { st.phase = "done"; api.finish(true, { collectName: "el mosaic " + pic.de }); }
          }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bg, 0, 0);
          const wt = whiteTile(s), G = groups[sel], lit = st.phase === "play" && G ? new Set(G.tiles) : new Set(), curT = st.phase === "play" && G ? G.tiles[G.typed] : -1;
          // rajoles
          tiles.forEach((tl, i) => {
            const x0 = tl.x - s / 2 + (tl.shake ? Math.sin(tl.shake * 30) * 5 * tl.shake : 0), up = lit.has(i) ? 4 + tl.pop * 6 : 0, y0 = tl.y - s / 2 - up;
            if (up) { ctx.fillStyle = "rgba(40,30,15,0.28)"; rr(ctx, x0 + 3, y0 + up + 4, s - 4, s - 4, s * 0.1); ctx.fill(); }
            if (tl.g < 1) ctx.drawImage(wt.c, x0, y0, s, s);
            if (tl.g > 0 && tl.g < 1) { // l'esmalt s'escampa com un líquid
              ctx.save(); blobPath(ctx, x0 + s / 2, y0 + s / 2, s * 0.78 * Ease.outCubic(tl.g) + 1, i * 7 + 3, 0.22, 10); ctx.clip(); ctx.drawImage(tl.spr, x0, y0, s, s); ctx.restore();
            } else if (tl.g >= 1) ctx.drawImage(tl.spr, x0, y0, s, s);
            if (tl.ck > 0 && tl.g < 1) { // esquerda que es repara sola (es torna daurada i s'esvaeix)
              ctx.save(); ctx.lineJoin = "round"; ctx.globalAlpha = clamp(tl.ck * 1.6, 0, 1);
              ctx.beginPath(); tl.crack.forEach((p, k) => k ? ctx.lineTo(x0 + p[0], y0 + p[1]) : ctx.moveTo(x0 + p[0], y0 + p[1]));
              ctx.strokeStyle = tl.ck > 0.55 ? "#4A3F35" : "#D9A93A"; ctx.lineWidth = 2.6; ctx.stroke(); ctx.restore();
            }
            if (tl.ch != null && tl.g < 0.4) {
              const a = 1 - tl.g / 0.4, yy = y0 + s / 2 + fs * 0.04;
              if (tl.ch === " ") { ctx.fillStyle = rgba(BRAND.ink, 0.55 * a); rr(ctx, x0 + s * 0.25, y0 + s * 0.62, s * 0.5, Math.max(5, s * 0.07), 3); ctx.fill(); }
              else { ctx.save(); ctx.globalAlpha = a; text(ctx, disp(tl.ch), x0 + s / 2, yy, { size: fs, weight: 700, color: BRAND.ink }); ctx.restore(); }
            }
          });
          // reflex especular: la llum es mou per sobre de l'esmalt
          ctx.save(); ctx.beginPath(); let any = false;
          tiles.forEach(tl => { if (tl.g >= 1) { ctx.rect(tl.x - s / 2, tl.y - s / 2, s, s); any = true; } });
          if (any) {
            ctx.clip(); ctx.globalCompositeOperation = "lighter";
            const sg = ctx.createRadialGradient(light[0], light[1], 0, light[0], light[1], 420); sg.addColorStop(0, "rgba(255,250,235,0.32)"); sg.addColorStop(0.4, "rgba(255,250,235,0.1)"); sg.addColorStop(1, "rgba(255,250,235,0)");
            ctx.fillStyle = sg; ctx.fillRect(gx, gy, gw, gh);
            if (st.phase === "sweep") {
              const p = lerp(-0.4, 1.4, Ease.inOutQuad(clamp(st.sweep, 0, 1))), lg = ctx.createLinearGradient(gx, gy, gx + gw, gy + gh);
              const a = clamp(p - 0.14, 0, 1), b = clamp(p, 0, 1), c2 = clamp(p + 0.14, 0, 1);
              lg.addColorStop(0, "rgba(255,255,255,0)"); if (a > 0) lg.addColorStop(a, "rgba(255,255,255,0)"); lg.addColorStop(b, "rgba(255,255,240,0.5)"); if (c2 < 1) lg.addColorStop(c2, "rgba(255,255,255,0)"); lg.addColorStop(1, "rgba(255,255,255,0)");
              ctx.fillStyle = lg; ctx.fillRect(gx, gy, gw, gh);
            }
            const gl = glint(), gs = s * 0.5;
            tiles.forEach(tl => { if (tl.g < 1) return; const dx = light[0] - tl.x, dy = light[1] - tl.y, d = Math.hypot(dx, dy) || 1, a = 0.75 * Math.exp(-d / 520); ctx.globalAlpha = a; ctx.drawImage(gl.c, tl.x + dx / d * s * 0.2 - gs / 2, tl.y + dy / d * s * 0.2 - gs * 0.28, gs, gs * 0.56); });
          }
          ctx.restore();
          // la rajola que toca brilla
          if (lit.size) {
            const pulse = 0.65 + 0.35 * Math.sin(t * 4), lg = litGlow(s);
            lit.forEach(i => { const tl = tiles[i], up = 4 + tl.pop * 6; ctx.save(); ctx.globalAlpha = i === curT ? pulse : 0.45; ctx.drawImage(lg.c, tl.x - s / 2 - 30, tl.y - s / 2 - 30 - up, s + 60, s + 60); ctx.restore(); });
            if (curT >= 0) { const tl = tiles[curT], up = 4 + tl.pop * 6; ctx.lineWidth = 5; ctx.strokeStyle = BRAND.petroli; rr(ctx, tl.x - s / 2 + 2.5, tl.y - s / 2 - up + 2.5, s - 5, s - 5, s * 0.1); ctx.stroke(); }
          }
          // plafó: què cal escriure i la miniatura
          text(ctx, pic.name[0] === "l" && pic.name[1] === "'" ? "L" + pic.name.slice(1) : pic.name[0].toUpperCase() + pic.name.slice(1), PCX, PY0 + 58, { size: 28, weight: 900, font: FONT_T, color: BRAND.tinta });
          if (st.phase === "play" && G) {
            const base = L <= 3 ? 112 : L === 4 ? 84 : 56; let size = base;
            while (size > 40 && plateSize(ctx, G.text, size).w > PX1 - PX0 - 60) size -= 2;
            drawPlate(ctx, G.text, PCX, PY0 + 160, { size, progress: L >= 4 ? G.typed : 0, state: "active", shadowBlur: 10 });
          } else {
            text(ctx, st.phase === "sweep" || st.phase === "done" ? "Acabat!" : "Molt bé!", PCX, PY0 + 160, { size: 46, weight: 900, font: FONT_T, color: BRAND.petroli });
          }
          const mw = cols > rows ? 270 : 170, mh = mw * rows / cols, mx = PCX - mw / 2, my = PY0 + 252 + (170 - mh) / 2, ms = mw / cols;
          ctx.save(); ctx.shadowColor = "rgba(40,30,15,0.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.fillStyle = "#B9AF9C"; ctx.fillRect(mx - 6, my - 6, mw + 12, mh + 12); ctx.restore();
          tiles.forEach(tl => {
            const x0 = mx + tl.c * ms, y0 = my + tl.r * ms;
            if (tl.g >= 1) ctx.drawImage(tl.spr, x0, y0, ms, ms);
            else { ctx.fillStyle = "#FBF8F0"; ctx.fillRect(x0 + 0.8, y0 + 0.8, ms - 1.6, ms - 1.6); ctx.globalAlpha = 0.28; ctx.fillStyle = tl.avg; ctx.fillRect(x0 + 0.8, y0 + 0.8, ms - 1.6, ms - 1.6); ctx.globalAlpha = 1; }
          });
          ctx.strokeStyle = "#2F6FB0"; ctx.lineWidth = 3; ctx.strokeRect(mx - 6, my - 6, mw + 12, mh + 12);
          // fletxes per triar
          if (st.phase === "play") {
            const ky = PY1 - 56, ks = 36;
            drawKeycap(ctx, PCX - 110, ky - ks - 4, ks, ks, "↑", { theme: "white", size: 20 });
            drawKeycap(ctx, PCX - 150, ky, ks, ks, "←", { theme: "white", size: 20 }); drawKeycap(ctx, PCX - 110, ky, ks, ks, "↓", { theme: "white", size: 20 }); drawKeycap(ctx, PCX - 70, ky, ks, ks, "→", { theme: "white", size: 20 });
            text(ctx, "Tria rajola", PCX + 60, ky + 6, { size: 22, weight: 700, color: BRAND.tinta });
          }
          drawVignette(ctx, 0.22, "30,30,50");
        },
      };
    },
  });
})();
