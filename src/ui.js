"use strict";
/* ============================================================
   Interfície comuna: plaques de lletra, tecles, teclat en
   pantalla, comparació d'error, HUD, compte enrere, logo.
   ============================================================ */
const UI = { coral: "#E0553A", coralDark: "#A8341F", ok: "#1F8A5B", gold: "#F2B630" };

/* ---------- placa de lletra (regla d'or: llisa, nítida, contrast ≥ 7:1) ---------- */
function plateSize(ctx, str, size = 64) {
  const s = disp(str), tw = measure(ctx, s, size, 700);
  const h = Math.round(size * 1.32), w = Math.max(h * (s.length === 1 ? 1 : 0.9), tw + size * 0.62);
  return { w, h };
}
function drawPlate(ctx, str, x, y, o = {}) {
  const size = o.size || 64, s = disp(str), prog = o.progress || 0;
  const { w, h } = plateSize(ctx, str, size);
  const sc = o.scale != null ? o.scale : 1;
  ctx.save(); ctx.translate(x, y); if (sc !== 1) ctx.scale(sc, sc);
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  const r = Math.min(18, h * 0.26), x0 = -w / 2, y0 = -h / 2;
  // halo exterior (neó, actiu o pista): sempre fora de la placa
  if (o.glow) { ctx.save(); ctx.shadowColor = o.glow; ctx.shadowBlur = o.glowBlur || 26; rr(ctx, x0, y0, w, h, r); ctx.fillStyle = o.glow; ctx.fill(); ctx.restore(); }
  if (o.state === "bad") { // aliment o objecte "dolent": vora vermella gruixuda amb ratlles
    ctx.save(); rr(ctx, x0 - 9, y0 - 9, w + 18, h + 18, r + 8); ctx.fillStyle = UI.coral; ctx.fill(); ctx.clip();
    ctx.strokeStyle = UI.coralDark; ctx.lineWidth = 6; for (let k = -h - 40; k < w + 40; k += 16) { ctx.beginPath(); ctx.moveTo(x0 + k, y0 - 12); ctx.lineTo(x0 + k + h + 30, y0 + h + 12); ctx.stroke(); }
    ctx.restore();
  }
  // ombra projectada
  if (o.shadow !== false) { ctx.save(); ctx.shadowColor = "rgba(10,20,25,0.35)"; ctx.shadowBlur = o.shadowBlur != null ? o.shadowBlur : 12; ctx.shadowOffsetY = o.shadowY != null ? o.shadowY : 5; rr(ctx, x0, y0, w, h, r); ctx.fillStyle = BRAND.crema; ctx.fill(); ctx.restore(); }
  rr(ctx, x0, y0, w, h, r); ctx.fillStyle = BRAND.crema; ctx.fill();
  let border = "rgba(20,38,42,0.22)", bw = 2;
  if (o.state === "active") { border = BRAND.petroli; bw = 5; }
  else if (o.state === "hint") { border = UI.gold; bw = 5; }
  else if (o.state === "ok") { border = UI.ok; bw = 5; }
  else if (o.state === "wrong") { border = UI.coral; bw = 5; }
  else if (o.state === "bad") { border = UI.coralDark; bw = 3; }
  if (o.border) { border = o.border; bw = o.borderW || 5; }
  ctx.lineWidth = bw; ctx.strokeStyle = border; rr(ctx, x0 + bw / 2, y0 + bw / 2, w - bw, h - bw, r - bw / 2); ctx.stroke();
  // text: el tros escrit en petroli i subratllat, la resta en tinta gairebé negra
  ctx.font = `700 ${size}px ${FONT_L}`; ctx.textBaseline = "middle"; ctx.textAlign = "left";
  const tw = ctx.measureText(s).width; let cx = -tw / 2; const ty = size * 0.04;
  if (prog > 0) {
    const a = s.slice(0, prog), b = s.slice(prog), aw = ctx.measureText(a).width;
    ctx.fillStyle = "rgba(23,103,107,0.13)"; rr(ctx, cx - 4, -size * 0.52, aw + 8, size * 1.04, 8); ctx.fill();
    ctx.fillStyle = BRAND.petroli; ctx.fillText(a, cx, ty);
    ctx.fillRect(cx, size * 0.5, aw, Math.max(3, size * 0.06));
    ctx.fillStyle = o.color || BRAND.ink; ctx.fillText(b, cx + aw, ty);
  } else { ctx.fillStyle = o.color || BRAND.ink; ctx.fillText(s, cx, ty); }
  ctx.restore();
  return { w: w * sc, h: h * sc };
}

/* ---------- tecla (estil del logo 4) ---------- */
const KEY_THEMES = {
  white:   { face: "#FFFFFF", border: BRAND.petroli, shadow: BRAND.petroli, ink: BRAND.tinta },
  menta:   { face: BRAND.menta, border: null, shadow: BRAND.tinta, ink: BRAND.tinta },
  petroli: { face: BRAND.petroli, border: BRAND.petroli, shadow: BRAND.tinta, ink: "#FFFFFF" },
  tinta:   { face: BRAND.tinta, border: null, shadow: "#0f2629", ink: "#FFFFFF" },
  coral:   { face: UI.coral, border: UI.coralDark, shadow: UI.coralDark, ink: "#FFFFFF" },
  gold:    { face: "#FFE08A", border: "#C8901A", shadow: "#C8901A", ink: BRAND.tinta },
  soft:    { face: "#F4F8F6", border: "#B9CFCB", shadow: "#9DB8B3", ink: "#4B6366" },
};
function drawKeycap(ctx, x, y, w, h, label, o = {}) {
  const th = KEY_THEMES[o.theme || "white"], pressed = !!o.pressed, u = h / 54;
  const depth = (pressed ? 2 : 5) * u, top = y + (pressed ? 3 * u : 0), r = 12 * u;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha *= o.alpha;
  if (o.glow) { ctx.save(); ctx.shadowColor = o.glow; ctx.shadowBlur = 24 * u; rr(ctx, x, top, w, h + depth, r); ctx.fillStyle = o.glow; ctx.fill(); ctx.restore(); }
  rr(ctx, x, top + depth, w, h, r); ctx.fillStyle = th.shadow; ctx.fill();
  rr(ctx, x, top, w, h, r); ctx.fillStyle = th.face; ctx.fill();
  if (th.border) { const bw = 3 * u; ctx.lineWidth = bw; ctx.strokeStyle = th.border; rr(ctx, x + bw / 2, top + bw / 2, w - bw, h - bw, r - bw / 2); ctx.stroke(); }
  if (label != null && label !== "") {
    const fs = o.size || 34 * u;
    ctx.font = `${o.weight || 900} ${fs}px ${o.font || FONT_T}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = th.ink; ctx.fillText(label, x + w / 2, top + h / 2 + fs * 0.04);
  }
  ctx.restore();
}

/* ---------- logo 4: LECAA + fila de tecles T·E·C·L·A ---------- */
const LOGO_RATIO = 1683.48 / 765.7;
function logoWidth(h) { return h * (LOGO_RATIO + 22 / 96 + 5 * 50 / 96 + 4 * 6 / 96); }
function drawLogo(ctx, cx, cy, h, o = {}) {
  const onDark = o.variant === "dark", img = Img.get(onDark ? "logoW" : "logoP");
  const total = logoWidth(h); let x = cx - total / 2;
  const lw = h * LOGO_RATIO;
  if (img && img.complete && img.naturalWidth) ctx.drawImage(img, x, cy - h / 2, lw, h);
  x += lw + h * 22 / 96;
  const kw = h * 50 / 96, kh = h * 54 / 96, gap = h * 6 / 96, ky = cy - kh / 2 - h * 6 / 96;
  const t = o.t || 0;
  "TECLA".split("").forEach((ch, i) => {
    const sway = o.sway ? Math.sin(t * 2 + i * 0.9) * h * 0.025 : 0;
    const isC = i === 2, press = o.press != null ? o.press === i : isC;
    const theme = onDark ? (press ? "petroli" : "menta") : (press ? "petroli" : "white");
    ctx.save(); if (o.sway) { ctx.translate(x + kw / 2, ky); ctx.rotate(Math.sin(t * 1.6 + i * 1.3) * 0.03); ctx.translate(-(x + kw / 2), -ky); }
    drawKeycap(ctx, x, ky + sway, kw, kh, ch, { theme, pressed: press, size: kh * 34 / 54 });
    ctx.restore();
    x += kw + gap;
  });
}

/* ---------- teclat en pantalla: disposició espanyola (català, castellà, basc, gallec),
   francesa (AZERTY) o britànica; es tria amb l'idioma i es pot canviar a Opcions ---------- */
const KB_LAYOUTS = {
  es: { label: "QWERTY ES", num: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "'", "¡"], rows: [
    { off: 0, keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "`", "+"] },
    { off: 0.28, keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ", "´", "ç"] },
    { off: -0.22, keys: ["<", "z", "x", "c", "v", "b", "n", "m", ",", ".", "-"] }] },
  fr: { label: "AZERTY", num: ["&", "é", "\"", "'", "(", "-", "è", "_", "ç", "à", ")", "="], rows: [
    { off: 0, keys: ["a", "z", "e", "r", "t", "y", "u", "i", "o", "p", "^", "$"] },
    { off: 0.28, keys: ["q", "s", "d", "f", "g", "h", "j", "k", "l", "m", "ù", "*"] },
    { off: -0.22, keys: ["<", "w", "x", "c", "v", "b", "n", ",", ";", ":", "!"] }] },
  uk: { label: "QWERTY UK", num: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="], rows: [
    { off: 0, keys: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"] },
    { off: 0.28, keys: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "#"] },
    { off: -0.22, keys: ["\\", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"] }] },
};
const KB_LAYOUT = KB_LAYOUTS[Settings.layout] ? Settings.layout : LANG_INFO.layout;
const KB_ROWS = KB_LAYOUTS[KB_LAYOUT].rows, KB_NUM = KB_LAYOUTS[KB_LAYOUT].num;
const KB_POS = {}; KB_ROWS.forEach((r, ri) => r.keys.forEach((k, ci) => KB_POS[k] = { row: ri, col: ci, x: r.off + ci }));
// fila dels números: només es dibuixa la tecla que cal prémer (p. ex. 3 per al punt volat, é a l'AZERTY)
KB_NUM.forEach((k, ci) => { if (!KB_POS[k]) KB_POS[k] = { row: -1, col: ci, x: ci - 0.6 }; });
/* tecles físiques que cal prémer per a un caràcter (accents amb tecla morta) */
function keysFor(ch) {
  if (!ch) return [];
  if (ch === " ") return [" "];
  if (KB_POS[ch]) return [ch];
  const base = ch.normalize("NFD")[0], mark = ch.normalize("NFD").slice(1);
  if (KB_LAYOUT === "fr") {
    if (mark === "\u0302") return ["^", base];          // circumflex: â ê î ô û
    if (mark === "\u0308") return ["^", base];          // dièresi: Maj + ^ (¨)
    return [base];
  }
  if (KB_LAYOUT === "es") {
    if (mark === "\u0300") return ["`", base];          // à è ò
    if (mark === "\u0301") return ["´", base];          // á é í ó ú
    if (mark === "\u0308") return ["´", base];          // ï ü: Maj + ´
    if (ch === "·") return ["3"];
  }
  return [base];
}
const Kb = {
  /* marks: {tecla: "expected"|"wrong"|"hint"|"row"} */
  draw(ctx, cx, cy, ks, o = {}) {
    const marks = o.marks || {}, pad = ks * 0.32, gap = ks * 0.14, u = ks + gap;
    const wid = 12.3 * u + pad * 2, hei = 4 * u + pad * 2 - gap * 0.5;
    const x0 = cx - wid / 2, y0 = cy - hei / 2;
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    rr(ctx, x0, y0, wid, hei, ks * 0.4); ctx.fillStyle = "rgba(227,239,235,0.97)"; ctx.fill(); ctx.shadowColor = "transparent";
    ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 3; ctx.stroke();
    const t = App.t;
    KB_ROWS.forEach((r, ri) => r.keys.forEach((k, ci) => {
      const kx = x0 + pad + (r.off + 0.25 + ci) * u, ky = y0 + pad + ri * u;
      const m = marks[k] || (o.hintRow === ri ? "row" : null);
      let theme = "white", glow = null, pressed = false;
      if (m === "expected") { theme = "petroli"; glow = rgba("#3FD3A0", 0.6 + 0.4 * Math.sin(t * 8)); }
      else if (m === "wrong") { theme = "coral"; pressed = true; }
      else if (m === "hint") { theme = "gold"; glow = rgba(UI.gold, 0.5 + 0.4 * Math.sin(t * 6)); }
      else if (m === "row") theme = "gold";
      else if (o.dimOthers) theme = "soft";
      const label = /^\p{L}$/u.test(k) ? disp(k) : k;
      drawKeycap(ctx, kx, ky, ks, ks, label, { theme, glow, pressed, font: FONT_L, weight: 700, size: ks * 0.52 });
    }));
    // barra d'espai
    const sx = x0 + pad + 3.25 * u, sy = y0 + pad + 3 * u, sw = 5.6 * u;
    const ms = marks[" "]; drawKeycap(ctx, sx, sy, sw, ks * 0.8, L_("espai"), { theme: ms === "expected" ? "petroli" : ms === "wrong" ? "coral" : o.dimOthers ? "soft" : "white", font: FONT_L, weight: 700, size: ks * 0.34, glow: ms === "expected" ? rgba("#3FD3A0", 0.8) : null });
    // tecles de la fila dels números, només si cal prémer-ne alguna (3 per al punt volat, é è ç à a l'AZERTY)
    KB_NUM.forEach(k => {
      const p = KB_POS[k]; if (!marks[k] || !p || p.row !== -1) return;
      const label = k === "3" && KB_LAYOUT === "es" ? "3 ·" : disp(k);
      drawKeycap(ctx, x0 + pad + (p.x + 0.25) * u, y0 - u * 0.9, ks, ks, label, { theme: marks[k] === "expected" ? "petroli" : marks[k] === "hint" ? "gold" : "coral", font: FONT_L, size: ks * (label.length > 1 ? 0.36 : 0.52) });
    });
    ctx.restore();
    return { x: x0, y: y0, w: wid, h: hei };
  },
  keyCenter(cx, cy, ks, k) {
    const p = KB_POS[k]; if (!p) return null;
    const pad = ks * 0.32, gap = ks * 0.14, u = ks + gap, wid = 12.3 * u + pad * 2, hei = 4 * u + pad * 2 - gap * 0.5;
    return [cx - wid / 2 + pad + (p.x + 0.25) * u + ks / 2, cy - hei / 2 + pad + p.row * u + ks / 2];
  },
};

/* ---------- panells i textos de la interfície ---------- */
function drawPanel(ctx, x, y, w, h, o = {}) {
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = o.blur || 30; ctx.shadowOffsetY = 10;
  rr(ctx, x, y, w, h, o.r || 28); ctx.fillStyle = o.fill || "#FFFFFF"; ctx.fill();
  ctx.shadowColor = "transparent";
  if (o.border !== false) { ctx.lineWidth = 4; ctx.strokeStyle = o.border || BRAND.petroli; ctx.stroke(); }
  ctx.restore();
}
/* indicació de tecla + acció, p. ex. [Retorn] Tornar a l'illa */
function drawKeyHint(ctx, x, y, key, label, o = {}) {
  key = L_(key); label = L_(label);
  const ks = o.ks || 40, fs = o.fs || 24;
  ctx.save(); ctx.font = `800 ${ks * 0.42}px ${FONT_T}`; const kw = Math.max(ks, ctx.measureText(key).width + ks * 0.6);
  ctx.font = `700 ${fs}px ${FONT_L}`; const lw = ctx.measureText(label).width;
  const total = kw + 12 + lw; let x0 = o.align === "left" ? x : o.align === "right" ? x - total : x - total / 2;
  // amb o.click, la indicació és també un botó per al ratolí
  const hov = o.click ? Mouse.add(x0 - 10, y - ks / 2 - 10, total + 22, ks + 20, { click: o.click }) : false;
  if (hov) { rr(ctx, x0 - 10, y - ks / 2 - 10, total + 22, ks + 20, (ks + 20) / 2); ctx.fillStyle = o.hoverFill || "rgba(255,255,255,0.18)"; ctx.fill(); }
  drawKeycap(ctx, x0, y - ks / 2 - 2, kw, ks, key, { theme: o.theme || "white", size: ks * 0.42, weight: 800, pressed: hov });
  ctx.fillStyle = o.color || BRAND.tinta; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(label, x0 + kw + 12, y + 1);
  ctx.restore();
  return total;
}
/* botó de menú (ratolí): pastilla amb text; estils primary, light, ghost. Retorna l'amplada */
function drawButton(ctx, x, y, label, o = {}) {
  label = L_(label);
  const fs = o.fs || 26, h = o.h || Math.round(fs * 2.1);
  ctx.save(); ctx.font = `800 ${fs}px ${FONT_T}`; const w = o.w || ctx.measureText(label).width + fs * 1.6;
  if (o.w) fitFont(ctx, label, 800, fs, FONT_T, w - fs * 0.9);
  const x0 = o.align === "left" ? x : o.align === "right" ? x - w : x - w / 2, y0 = y - h / 2;
  const hov = o.click ? Mouse.add(x0, y0, w, h, { click: o.click }) : false, st = o.style || "light";
  const fill = st === "dark" ? (hov ? "#2A2A2A" : "#0B0B0B") : st === "primary" ? (hov ? BRAND.tinta : BRAND.petroli) : st === "ghost" ? (hov ? BRAND.petroli : "rgba(227,239,235,0.16)") : (hov ? BRAND.petroli : BRAND.menta);
  const ink = st === "primary" || st === "ghost" || st === "dark" || hov ? "#fff" : BRAND.tinta;
  if (st !== "ghost") { ctx.shadowColor = "rgba(0,0,0,0.22)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; }
  rr(ctx, x0, y0, w, h, h / 2); ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = "transparent";
  if (st === "light" && !hov) { ctx.lineWidth = 2; ctx.strokeStyle = "rgba(23,103,107,0.35)"; ctx.stroke(); }
  ctx.fillStyle = o.color || ink; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x0 + w / 2, y + 1);
  ctx.restore(); return w;
}
function drawStar(ctx, x, y, r, fill, o = {}) {
  ctx.save(); ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = o.blur != null ? o.blur : 8; ctx.shadowOffsetY = 3;
  starPath(ctx, 0, 0, r, r * 0.48, 5);
  ctx.lineJoin = "round"; ctx.lineWidth = r * 0.16; ctx.strokeStyle = fill ? "#C8901A" : "rgba(32,62,66,0.35)"; ctx.stroke();
  ctx.fillStyle = fill ? UI.gold : "rgba(255,255,255,0.65)"; ctx.fill(); ctx.shadowColor = "transparent";
  if (fill) { ctx.save(); starPath(ctx, 0, 0, r, r * 0.48, 5); ctx.clip(); ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.45, r * 0.6, r * 0.35, -0.4, 0, 6.28); ctx.fill(); ctx.restore(); }
  ctx.restore();
}
function drawHeart(ctx, x, y, s, full) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 32, s / 32);
  ctx.beginPath(); ctx.moveTo(0, 10); ctx.bezierCurveTo(-26, -8, -12, -30, 0, -14); ctx.bezierCurveTo(12, -30, 26, -8, 0, 10); ctx.closePath();
  ctx.fillStyle = full ? UI.coral : "rgba(255,255,255,0.25)"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = full ? UI.coralDark : "rgba(255,255,255,0.5)"; ctx.stroke();
  if (full) { ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(-8, -12, 5, 3, -0.6, 0, 6.28); ctx.fill(); }
  ctx.restore();
}
/* bombolla de subtítol de la veu */
function drawCaption(ctx, txt, x, y, a = 1) {
  if (!txt) return;
  ctx.save(); ctx.globalAlpha *= a;
  // el text s'encongeix i, si cal, es parteix en dues línies perquè la bombolla no surti de la pantalla
  const maxW = 1380; let fs = 30, lines = [txt];
  ctx.font = `700 ${fs}px ${FONT_L}`;
  while (ctx.measureText(txt).width + 96 > maxW && fs > 24) { fs -= 1; ctx.font = `700 ${fs}px ${FONT_L}`; }
  if (ctx.measureText(txt).width + 96 > maxW) {
    const words = txt.split(" "); let best = 1, bestW = Infinity;
    for (let i = 1; i < words.length; i++) { const m = Math.max(ctx.measureText(words.slice(0, i).join(" ")).width, ctx.measureText(words.slice(i).join(" ")).width); if (m < bestW) { bestW = m; best = i; } }
    lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
  }
  const tw = Math.max(...lines.map(l => ctx.measureText(l).width)), w = tw + 96, lh = fs * 1.2, h = 58 + (lines.length - 1) * lh;
  rr(ctx, x - w / 2, y - h / 2, w, h, 29); ctx.fillStyle = "rgba(255,255,255,0.96)"; ctx.shadowColor = "rgba(0,0,0,0.25)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4; ctx.fill(); ctx.shadowColor = "transparent";
  ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 3; ctx.stroke();
  // icona d'altaveu
  const ix = x - w / 2 + 30; ctx.fillStyle = BRAND.petroli; ctx.beginPath(); ctx.moveTo(ix - 10, y - 6); ctx.lineTo(ix - 4, y - 6); ctx.lineTo(ix + 4, y - 13); ctx.lineTo(ix + 4, y + 13); ctx.lineTo(ix - 4, y + 6); ctx.lineTo(ix - 10, y + 6); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ix + 6, y, 8, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(ix + 6, y, 14, -0.8, 0.8); ctx.stroke();
  ctx.fillStyle = BRAND.tinta; ctx.textAlign = "left"; ctx.textBaseline = "middle";
  lines.forEach((l, i) => ctx.fillText(l, x - w / 2 + 58, y + 1 + (i - (lines.length - 1) / 2) * lh));
  ctx.restore();
}
/* xip de text petit amb fons fosc (HUD) */
function drawChip(ctx, x, y, label, o = {}) {
  label = L_(label);
  ctx.save(); ctx.font = `800 ${o.fs || 24}px ${FONT_T}`; const w = (o.w || ctx.measureText(label).width + 36), h = o.h || 46;
  if (o.w) fitFont(ctx, label, 800, o.fs || 24, FONT_T, w - 24);
  const x0 = o.align === "right" ? x - w : o.align === "center" ? x - w / 2 : x;
  const hov = o.click ? Mouse.add(x0, y, w, h, { click: o.click }) : false;
  rr(ctx, x0, y, w, h, h / 2); ctx.fillStyle = hov ? BRAND.petroli : (o.fill || "rgba(32,62,66,0.82)"); ctx.fill();
  ctx.fillStyle = o.color || "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, x0 + w / 2, y + h / 2 + 1);
  ctx.restore(); return w;
}
