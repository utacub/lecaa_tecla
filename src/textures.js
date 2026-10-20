"use strict";
/* ============================================================
   Textures i materials procedurals.
   Tot es genera una sola vegada en llenços fora de pantalla.
   Regla de l'art: cap textura toca mai la placa de la lletra.
   ============================================================ */
function makeCanvas(w, h) { const c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }

/* soroll de valor amb llavor + fbm */
function makeNoise(seed = 1) {
  const R = mulberry32(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = R(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const sm = t => t * t * (3 - 2 * t);
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = G[P[(xi & 255) + P[yi & 255]]], b = G[P[((xi + 1) & 255) + P[yi & 255]]];
    const c = G[P[(xi & 255) + P[(yi + 1) & 255]]], d = G[P[((xi + 1) & 255) + P[(yi + 1) & 255]]];
    const u = sm(xf), v = sm(yf); return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }
  n2.fbm = (x, y, oct = 4) => { let s = 0, a = 0.5, f = 1, n = 0; for (let i = 0; i < oct; i++) { s += a * n2(x * f, y * f); n += a; a *= 0.5; f *= 2; } return s / n; };
  return n2;
}

const Tex = {
  cache: {},
  get(key, make) { return this.cache[key] || (this.cache[key] = make()); },
  /* llenç a partir d'una funció per píxel (r,g,b,a) */
  pixels(w, h, fn) {
    const c = makeCanvas(w, h), x = c.getContext("2d"), id = x.createImageData(c.width, c.height), d = id.data;
    for (let j = 0; j < c.height; j++) for (let i = 0; i < c.width; i++) { const o = (j * c.width + i) * 4; const p = fn(i, j); d[o] = p[0]; d[o + 1] = p[1]; d[o + 2] = p[2]; d[o + 3] = p[3] == null ? 255 : p[3]; }
    x.putImageData(id, 0, 0); return c;
  },
  /* gra neutre (gris al 50%) per barrejar amb "overlay" o "soft-light" */
  grain(size = 256, amt = 40, seed = 7) {
    return this.get(`grain${size}_${amt}_${seed}`, () => { const R = mulberry32(seed); return this.pixels(size, size, () => { const v = 128 + (R() - 0.5) * amt * 2; return [v, v, v, 255]; }); });
  },
  /* paper: fibres suaus i gra, tenyit d'un color */
  paper(w, h, base = "#f6efe0", o = {}) {
    return this.get(`paper${w}x${h}${base}${o.seed || 3}${o.fiber || 1}`, () => {
      const n = makeNoise(o.seed || 3), [r, g, b] = hexToRgb(base), R = mulberry32((o.seed || 3) * 31), f = o.fiber || 1;
      const c = this.pixels(w, h, (i, j) => {
        const v = (n.fbm(i / 90, j / 90, 4) - 0.5) * 18 * f + (n(i / 3.2, j / 3.2) - 0.5) * 10 * f + (R() - 0.5) * 7;
        return [clamp(r + v, 0, 255), clamp(g + v, 0, 255), clamp(b + v * 0.95, 0, 255)];
      });
      const x = c.getContext("2d"); x.globalAlpha = 0.05 * f; x.strokeStyle = "#7a6a50"; x.lineWidth = 0.8;
      for (let k = 0; k < w * h / 2500; k++) { const px = R() * w, py = R() * h, a = R() * 6.28, L = 6 + R() * 22; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 0.6) * L / 2, py + Math.sin(a + 0.6) * L / 2, px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke(); }
      return c;
    });
  },
  /* fusta: veta allargada */
  wood(w, h, base = "#c8955a", o = {}) {
    return this.get(`wood${w}x${h}${base}${o.seed || 5}${o.vertical ? "v" : "h"}`, () => {
      const n = makeNoise(o.seed || 5), [r, g, b] = hexToRgb(base), R = mulberry32(o.seed || 5);
      return this.pixels(w, h, (i, j) => {
        let x = i, y = j; if (o.vertical) { x = j; y = i; }
        const warp = n.fbm(x / 260, y / 40, 3) * 6;
        const ring = Math.sin((y / 7.5 + warp * 3.2)) * 0.5 + 0.5;
        const fine = n(x / 1.5, y / 18) - 0.5;
        const v = (ring - 0.5) * 26 + fine * 16 + (n.fbm(x / 120, y / 120, 2) - 0.5) * 30 + (R() - 0.5) * 6;
        return [clamp(r + v, 0, 255), clamp(g + v * 0.85, 0, 255), clamp(b + v * 0.7, 0, 255)];
      });
    });
  },
  /* feltre i felpa: fibres curtes en totes direccions */
  felt(w, h, base = "#7aa86a", o = {}) {
    return this.get(`felt${w}x${h}${base}${o.seed || 9}${o.plush ? "p" : ""}`, () => {
      const c = makeCanvas(w, h), x = c.getContext("2d"), R = mulberry32(o.seed || 9), n = makeNoise(o.seed || 9);
      x.fillStyle = base; x.fillRect(0, 0, w, h);
      const N = w * h / (o.plush ? 9 : 14);
      for (let k = 0; k < N; k++) {
        const px = R() * w, py = R() * h, a = o.plush ? -1.2 + (R() - 0.5) * 1.2 : R() * 6.28, L = (o.plush ? 3 : 2) + R() * (o.plush ? 7 : 5);
        const lv = n.fbm(px / 80, py / 80, 2);
        x.strokeStyle = R() < 0.5 ? shade(base, 0.12 + lv * 0.18) : shade(base, -0.12 - lv * 0.15);
        x.globalAlpha = 0.25 + R() * 0.35; x.lineWidth = 0.6 + R() * 0.8;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * L, py + Math.sin(a) * L); x.stroke();
      }
      return c;
    });
  },
  /* plastilina: llisa, amb marques de dits i polsim */
  clay(w, h, base = "#e88b6a", o = {}) {
    return this.get(`clay${w}x${h}${base}${o.seed || 11}`, () => {
      const n = makeNoise(o.seed || 11), [r, g, b] = hexToRgb(base), R = mulberry32(o.seed || 11);
      const c = this.pixels(w, h, (i, j) => { const v = (n.fbm(i / 50, j / 50, 3) - 0.5) * 22 + (R() - 0.5) * 4; return [clamp(r + v, 0, 255), clamp(g + v, 0, 255), clamp(b + v, 0, 255)]; });
      const x = c.getContext("2d");
      for (let k = 0; k < w * h / 9000; k++) { // empremtes
        const px = R() * w, py = R() * h, rad = 10 + R() * 18, a0 = R() * 6.28;
        for (let q = 0; q < 5; q++) { x.strokeStyle = q % 2 ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"; x.lineWidth = 1.2; x.beginPath(); x.arc(px, py, Math.max(1, rad - q * 3), a0, a0 + 1.4 + R()); x.stroke(); }
      }
      return c;
    });
  },
  /* camp d'estrelles */
  stars(w, h, o = {}) {
    return this.get(`stars${w}x${h}${o.seed || 13}${o.n || 0}`, () => {
      const c = makeCanvas(w, h), x = c.getContext("2d"), R = mulberry32(o.seed || 13), N = o.n || (w * h / 2600);
      for (let k = 0; k < N; k++) {
        const px = R() * w, py = R() * h, s = Math.pow(R(), 3) * (o.max || 2.4) + 0.4;
        x.fillStyle = `rgba(${200 + R() * 55 | 0},${210 + R() * 45 | 0},255,${0.35 + R() * 0.65})`;
        x.beginPath(); x.arc(px, py, s, 0, 6.28); x.fill();
        if (s > 2) { x.globalAlpha = 0.25; x.fillRect(px - s * 3, py - 0.5, s * 6, 1); x.fillRect(px - 0.5, py - s * 3, 1, s * 6); x.globalAlpha = 1; }
      }
      return c;
    });
  },
  /* nebulosa amb soroll de color */
  nebula(w, h, c1, c2, o = {}) {
    return this.get(`neb${w}x${h}${c1}${c2}${o.seed || 17}`, () => {
      const n = makeNoise(o.seed || 17), A = hexToRgb(c1), B = hexToRgb(c2), bg = hexToRgb(o.bg || "#060914");
      return this.pixels(w, h, (i, j) => {
        const v = n.fbm(i / 180, j / 180, 5), u = n.fbm(i / 120 + 40, j / 120, 4);
        const k1 = clamp((v - 0.45) * 2.4, 0, 1), k2 = clamp((u - 0.5) * 2.4, 0, 1);
        return [bg[0] + A[0] * k1 * 0.5 + B[0] * k2 * 0.45, bg[1] + A[1] * k1 * 0.5 + B[1] * k2 * 0.45, bg[2] + A[2] * k1 * 0.5 + B[2] * k2 * 0.45].map(z => clamp(z, 0, 255));
      });
    });
  },
  /* paper kraft envellit amb taques */
  kraft(w, h, o = {}) {
    return this.get(`kraft${w}x${h}${o.seed || 19}`, () => {
      const c = this.paper(w, h, "#c9a774", { seed: o.seed || 19, fiber: 2.2 });
      const out = makeCanvas(w, h), x = out.getContext("2d"); x.drawImage(c, 0, 0);
      const R = mulberry32(o.seed || 19);
      for (let k = 0; k < 7; k++) { // taques de cafè
        const px = R() * w, py = R() * h, rad = 30 + R() * 90;
        x.strokeStyle = "rgba(110,70,30,0.16)"; x.lineWidth = 3 + R() * 4; x.beginPath(); x.arc(px, py, rad, 0, 6.28); x.stroke();
        x.fillStyle = "rgba(120,80,35,0.05)"; x.fill();
      }
      const gv = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
      gv.addColorStop(0, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(70,40,10,0.45)"); x.fillStyle = gv; x.fillRect(0, 0, w, h);
      // plecs
      x.strokeStyle = "rgba(80,50,20,0.18)"; x.lineWidth = 2;
      for (const fx of [w / 3, 2 * w / 3]) { x.beginPath(); x.moveTo(fx, 0); x.lineTo(fx + 4, h); x.stroke(); }
      x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2 + 3); x.stroke();
      x.strokeStyle = "rgba(255,240,210,0.15)"; for (const fx of [w / 3 + 3, 2 * w / 3 + 3]) { x.beginPath(); x.moveTo(fx, 0); x.lineTo(fx + 4, h); x.stroke(); }
      return out;
    });
  },
  /* tela de punt de creu (aida) */
  aida(w, h, base = "#f3eee2", cell = 12) {
    return this.get(`aida${w}x${h}${base}${cell}`, () => {
      const c = this.paper(w, h, base, { seed: 23, fiber: 0.6 }), out = makeCanvas(w, h), x = out.getContext("2d"); x.drawImage(c, 0, 0);
      x.fillStyle = "rgba(120,100,70,0.16)";
      for (let i = 0; i < w; i += cell) x.fillRect(i, 0, 1.4, h);
      for (let j = 0; j < h; j += cell) x.fillRect(0, j, w, 1.4);
      x.fillStyle = "rgba(255,255,255,0.35)";
      for (let i = 0; i < w; i += cell) for (let j = 0; j < h; j += cell) x.fillRect(i + cell / 2 - 1, j + cell / 2 - 1, 2, 2);
      return out;
    });
  },
};

/* sprite en memòria cau (objectes estàtics prerenderitzats) */
const Sprites = {
  cache: {},
  get(key, w, h, draw) {
    let s = this.cache[key]; if (s) return s;
    const sc = 2; // supermostreig per a pantalles d'alta densitat
    const c = makeCanvas(w * sc, h * sc), x = c.getContext("2d"); x.scale(sc, sc); draw(x, w, h);
    s = { c, w, h }; this.cache[key] = s; return s;
  },
  draw(ctx, s, x, y, o = {}) {
    const w = s.w * (o.sx || o.s || 1), h = s.h * (o.sy || o.s || 1);
    if (o.rot || o.alpha != null) { ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha; ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.drawImage(s.c, -w * (o.ax != null ? o.ax : 0.5), -h * (o.ay != null ? o.ay : 0.5), w, h); ctx.restore(); }
    else ctx.drawImage(s.c, x - w * (o.ax != null ? o.ax : 0.5), y - h * (o.ay != null ? o.ay : 0.5), w, h);
  },
};

/* materials aplicats a un camí (pathFn construeix el camí al ctx) */
/* rectangle del llenç visible en coordenades locals: evita omplir àrees enormes fora de pantalla */
function visibleBox(ctx) {
  const m = ctx.getTransform().inverse(), cw = ctx.canvas.width, ch = ctx.canvas.height, xs = [], ys = [];
  for (const [px, py] of [[0, 0], [cw, 0], [0, ch], [cw, ch]]) { xs.push(m.a * px + m.c * py + m.e); ys.push(m.b * px + m.d * py + m.f); }
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0];
}
const Mat = {
  /* omplir amb textura tenyida (multiply) dins d'un camí */
  texFill(ctx, pathFn, tex, color, o = {}) {
    ctx.save(); pathFn(ctx); ctx.fillStyle = color; ctx.fill(); ctx.clip();
    ctx.globalCompositeOperation = o.mode || "multiply"; ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
    const p = ctx.createPattern(tex, "repeat"); if (o.offset) p.setTransform && p.setTransform(new DOMMatrix().translate(o.offset[0], o.offset[1]));
    ctx.fillStyle = p; ctx.fillRect(-4000, -4000, 8000, 8000); ctx.restore();
  },
  /* paper retallat amb ombra de capa i vora clara */
  paperCut(ctx, pathFn, color, o = {}) {
    const d = o.depth != null ? o.depth : 6;
    ctx.save(); pathFn(ctx); ctx.shadowColor = o.shadow || "rgba(30,20,10,0.35)"; ctx.shadowBlur = d * 2.2; ctx.shadowOffsetY = d * 0.9; ctx.shadowOffsetX = d * 0.3; ctx.fillStyle = color; ctx.fill(); ctx.restore();
    this.texFill(ctx, pathFn, Tex.grain(256, 22, o.seed || 3), color, { mode: "overlay", alpha: 0.55 });
    if (o.edge !== false) { ctx.save(); pathFn(ctx); ctx.clip(); ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 3; ctx.translate(-1, -1.5); pathFn(ctx); ctx.stroke(); ctx.restore(); }
  },
  /* ceres: color amb traços inclinats i porus del paper */
  crayon(ctx, pathFn, color, o = {}) {
    const R = mulberry32(o.seed || 29);
    ctx.save(); pathFn(ctx); ctx.clip();
    ctx.globalAlpha = 0.82; ctx.fillStyle = color; ctx.fill();
    ctx.globalAlpha = 1; ctx.lineCap = "round";
    const bb = o.bbox || [-200, -200, 400, 400];
    for (let k = 0; k < (o.strokes || 70); k++) {
      const x0 = bb[0] + R() * bb[2], y0 = bb[1] + R() * bb[3], L = 30 + R() * 60, a = -0.9 + (R() - 0.5) * 0.3;
      ctx.strokeStyle = R() < 0.5 ? shade(color, -0.18) : shade(color, 0.15); ctx.globalAlpha = 0.18 + R() * 0.25; ctx.lineWidth = 2 + R() * 3;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L); ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    for (let k = 0; k < (o.pores || 260); k++) { const px = bb[0] + R() * bb[2], py = bb[1] + R() * bb[3]; ctx.fillRect(px, py, 1 + R() * 2, 1 + R() * 1.4); }
    ctx.restore();
    if (o.outline !== false) { ctx.save(); ctx.strokeStyle = o.outline || shade(color, -0.45); ctx.lineWidth = o.lw || 3.2; ctx.globalAlpha = 0.85; ctx.lineJoin = "round"; pathFn(ctx); ctx.stroke(); ctx.restore(); }
  },
  /* aquarel·la: capes translúcides desplaçades i vora fosca */
  watercolor(ctx, pathFn, color, o = {}) {
    const R = mulberry32(o.seed || 31);
    ctx.save();
    for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate((R() - 0.5) * 4, (R() - 0.5) * 4); pathFn(ctx); ctx.globalAlpha = 0.32; ctx.fillStyle = k === 2 ? shade(color, 0.15) : color; ctx.fill(); ctx.restore(); }
    pathFn(ctx); ctx.clip();
    ctx.globalAlpha = 0.35; ctx.strokeStyle = shade(color, -0.3); ctx.lineWidth = o.edge || 5; ctx.filter = "blur(1.5px)"; pathFn(ctx); ctx.stroke(); ctx.filter = "none";
    ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.5; ctx.fillStyle = ctx.createPattern(Tex.paper(256, 256, "#e9e3d6", { seed: 37, fiber: 2 }), "repeat"); const vb = visibleBox(ctx); ctx.fillRect(vb[0], vb[1], vb[2], vb[3]);
    ctx.restore();
  },
  /* plastilina: degradat volumètric i brillantor mat */
  clay(ctx, pathFn, color, o = {}) {
    const [cx, cy, r] = o.light || [0, -20, 120];
    ctx.save(); pathFn(ctx); ctx.shadowColor = "rgba(40,20,10,0.35)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8; ctx.fillStyle = color; ctx.fill(); ctx.restore();
    ctx.save(); pathFn(ctx); ctx.clip();
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r * 1.4);
    g.addColorStop(0, shade(color, 0.32)); g.addColorStop(0.5, color); g.addColorStop(1, shade(color, -0.32));
    ctx.fillStyle = g; ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    ctx.globalCompositeOperation = "multiply"; ctx.globalAlpha = 0.6; ctx.fillStyle = ctx.createPattern(Tex.clay(256, 256, "#dddddd", { seed: o.seed || 11 }), "repeat"); ctx.fillRect(cx - r * 3, cy - r * 3, r * 6, r * 6);
    ctx.restore();
  },
  /* feltre amb punt de costura */
  felt(ctx, pathFn, color, o = {}) {
    ctx.save(); pathFn(ctx); ctx.shadowColor = "rgba(20,20,10,0.35)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4; ctx.fillStyle = color; ctx.fill(); ctx.restore();
    this.texFill(ctx, pathFn, Tex.felt(128, 128, "#c8c8c8", { seed: o.seed || 9, plush: o.plush }), color, { mode: "multiply", alpha: 0.9 });
    if (o.stitch !== false && o.center) {
      // puntada a uns 6 px de la vora: el mateix camí reduït cap al centre
      const [cx, cy, rad] = o.center, k = Math.max(0.5, 1 - (o.gap || 7) / rad);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k); ctx.translate(-cx, -cy); pathFn(ctx); ctx.restore();
      ctx.save(); ctx.setLineDash([7, 6]); ctx.lineCap = "round"; ctx.strokeStyle = o.stitch || shade(color, 0.55); ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowOffsetY = 1.2; ctx.shadowBlur = 1; ctx.stroke(); ctx.restore();
    }
  },
  /* esmalt ceràmic amb reflex especular */
  glaze(ctx, x, y, w, h, color, o = {}) {
    const g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, shade(color, 0.22)); g.addColorStop(0.55, color); g.addColorStop(1, shade(color, -0.2));
    ctx.fillStyle = g; rr(ctx, x, y, w, h, o.r || 6); ctx.fill();
    if (o.light != null) {
      const lx = o.light; ctx.save(); rr(ctx, x, y, w, h, o.r || 6); ctx.clip();
      const sp = ctx.createRadialGradient(lx[0], lx[1], 0, lx[0], lx[1], o.spec || 260);
      sp.addColorStop(0, "rgba(255,255,255,0.55)"); sp.addColorStop(0.25, "rgba(255,255,255,0.12)"); sp.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sp; ctx.fillRect(x, y, w, h); ctx.restore();
    }
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = 1.5; rr(ctx, x + 2, y + 2, w - 4, h - 4, (o.r || 6) - 1); ctx.stroke();
  },
};

/* superposició de gra i vinyeta a pantalla completa (es prerenderitza) */
function drawGrainOverlay(ctx, amt = 0.08, seed = 7) {
  ctx.save(); ctx.globalCompositeOperation = "overlay"; ctx.globalAlpha = amt;
  ctx.fillStyle = ctx.createPattern(Tex.grain(256, 60, seed), "repeat"); ctx.fillRect(0, 0, W, H); ctx.restore();
}
function drawVignette(ctx, amt = 0.35, color = "0,0,0") {
  const key = `vig${amt}${color}`;
  const s = Sprites.get(key, W / 2, H / 2, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.62);
    g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${amt})`); x.fillStyle = g; x.fillRect(0, 0, w, h);
  });
  ctx.drawImage(s.c, 0, 0, W, H);
}
