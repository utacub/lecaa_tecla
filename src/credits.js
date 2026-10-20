"use strict";
/* ============================================================
   Crèdits (portada i illa) i logo de la UTAC
   ============================================================ */

/* Logo de la UTAC: s'incrusta en muntar l'HTML si existeix assets/UTAC-logo.svg o .png.
   Mentre no hi sigui, es reserva el lloc amb un requadre discontinu. */
function utacImg() {
  let im = Img.get("logoUTAC");
  if (!im && typeof LOGO_UTAC !== "undefined" && LOGO_UTAC) { im = new Image(); im.src = LOGO_UTAC; Img.cache.logoUTAC = im; }
  return im && im.complete && im.naturalWidth ? im : null;
}
function drawUTACMeasure(h) { const im = utacImg(); return im ? h * im.naturalWidth / im.naturalHeight : h * 2.2; }
function drawUTAC(ctx, x, y, h, o = {}) {
  const im = utacImg(), ready = !!im, w = drawUTACMeasure(h);
  const x0 = o.align === "right" ? x - w : o.align === "center" ? x - w / 2 : x;
  if (ready) ctx.drawImage(smoothImg(im, h), x0, y - h / 2, w, h);
  else {
    ctx.save(); ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.strokeStyle = o.dark ? "rgba(255,255,255,0.6)" : "rgba(23,103,107,0.5)"; rr(ctx, x0, y - h / 2, w, h, 8); ctx.stroke();
    text(ctx, "logo UTAC", x0 + w / 2, y + 1, { size: Math.max(12, h * 0.26), weight: 800, font: FONT_T, color: o.dark ? "rgba(255,255,255,0.75)" : "rgba(23,103,107,0.7)" }); ctx.restore();
  }
  return w;
}

const CREDITS = [
  ["LECAA Tecla", "Joc lliure per descobrir on viu cada lletra al teclat a través de 25 minijocs, del viatge inicial i de l'activitat Blanc sobre negre. No és un mètode de mecanografia: l'objectiu és automatitzar la localització de les tecles."],
  ["UTAC", "La UTAC és un equip de la Universitat de Barcelona i de la Fundació Bosch i Gimpera. Concreta la seva activitat a partir de dos serveis de la Generalitat de Catalunya: UTAC Educació, del Departament d’Educació i Formació Professional, i UTAC Sírius, del Departament de Drets Socials i Inclusió."],
  ["Disseny, programació i il·lustracions", "Fets amb Claude (Anthropic) a partir de les indicacions de l'equip de LECAA. Totes les il·lustracions i textures es dibuixen per codi."],
  ["Tipografies i veu", "Andika (SIL International) i Nunito (Vernon Adams, Cyreal i Jacques Le Bailly), amb llicència SIL Open Font License 1.1. Veu: síntesi del navegador o Piper (Ona, dades de la UPC/Festcat, CC BY-SA 3.0 ES). Sons de les lletres: locucions de LECAA Docs (veu de l'Anna)."],
  ["Freqüència de les lletres", "Corpus AnCora (Taulé, Martí i Recasens, 2008), versió Universal Dependencies, llicència CC BY 4.0."],
];
/* logos de les entitats (assets/credits/, en ordre de nom de fitxer) i el seu peu, com a la captura de Marc */
const CREDIT_CAPTIONS = [
  "Unitat de Tècniques Augmentatives de Comunicació",
  "Universitat de Barcelona",
  "Fundació Bosch i Gimpera",
  "UTAC Educació · Departament d’Educació i Formació Professional",
  "UTAC Sírius · Departament de Drets Socials i Inclusió",
];
/* versió reduïda per passos (meitat cada cop) perquè els logos no surtin dentats a mida petita */
function smoothImg(im, maxH) {
  if (!im || !im.complete || !im.naturalWidth) return null;
  im._sm = im._sm || {};
  const key = Math.max(1, Math.ceil(maxH * 2 / 32)) * 32;
  if (!im._sm[key]) {
    let c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext("2d").drawImage(im, 0, 0);
    while (c.height / 2 >= key) { const d = document.createElement("canvas"); d.width = Math.round(c.width / 2); d.height = Math.round(c.height / 2); const x = d.getContext("2d"); x.imageSmoothingQuality = "high"; x.drawImage(c, 0, 0, d.width, d.height); c = d; }
    im._sm[key] = c;
  }
  return im._sm[key];
}
function creditLogos() {
  if (!Img.cache.creditLogos) Img.cache.creditLogos = (typeof CREDIT_LOGOS !== "undefined" ? CREDIT_LOGOS : []).map(src => { const im = new Image(); im.src = src; return im; });
  return Img.cache.creditLogos;
}
/* dibuixa un logo encabit en una caixa (bw × bh), centrat a (cx, cy) */
function drawLogoFit(ctx, im, cx, cy, bw, bh) {
  if (!im || !im.complete || !im.naturalWidth) return 0;
  const r = im.naturalWidth / im.naturalHeight, w = Math.min(bw, bh * r), h = w / r, sm = smoothImg(im, h);
  ctx.drawImage(sm, cx - w / 2, cy - h / 2, w, h); return h;
}
/* fila compacta de logos (portada) */
function drawCreditStrip(ctx, x, y, h, gap) {
  const L = creditLogos().filter(im => im.complete && im.naturalWidth); let cx = x;
  L.forEach((im, i) => { const hh = i === 0 ? h * 1.25 : h, w = hh * im.naturalWidth / im.naturalHeight; drawLogoFit(ctx, im, cx + w / 2, y, w, hh); cx += w + gap; });
  return cx - gap - x;
}
function creditStripWidth(h, gap) { const L = creditLogos().filter(im => im.complete && im.naturalWidth); return L.reduce((s, im, i) => s + (i === 0 ? h * 1.25 : h) * im.naturalWidth / im.naturalHeight, 0) + gap * Math.max(0, L.length - 1); }
/* finestra de crèdits; scene.credits = true l'obre */
function drawCredits(ctx, scene) {
  const k = Ease.outBack(clamp((scene.creditsT || 0) / 0.4, 0, 1));
  ctx.save(); ctx.fillStyle = `rgba(20,38,42,${0.6 * clamp((scene.creditsT || 0) * 4, 0, 1)})`; ctx.fillRect(0, 0, W, H);
  Mouse.add(0, 0, W, H, { click: () => { scene.credits = false; } });
  ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  const pw = 1500, ph = 850, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
  Mouse.add(px, py, pw, ph, {});
  drawPanel(ctx, px, py, pw, ph, { r: 32 });
  drawLogo(ctx, px + 250, py + 56, 48);
  text(ctx, "Crèdits", px + pw - 60, py + 58, { size: 36, weight: 900, font: FONT_T, color: BRAND.tinta, align: "right" });
  ctx.fillStyle = "#DDE7E4"; ctx.fillRect(px + 40, py + 104, pw - 80, 2);
  // a l'esquerra, els textos; a la dreta, els logos de les entitats (3 a dalt i 2 a sota)
  const colW = 600; let y = py + 142; const x = px + 50;
  CREDITS.forEach(([h, b]) => {
    text(ctx, h, x, y, { size: 19, weight: 900, font: FONT_T, color: BRAND.petroli, align: "left" });
    y = wrapText(ctx, b, x, y + 29, colW, 24, { size: 17, weight: 700, color: BRAND.tinta }) + 42;
  });
  text(ctx, "© 2026 LECAA · Programari lliure, llicència GPL-3.0 o posterior", x, py + ph - 36, { size: 16, weight: 800, font: FONT_T, color: "#4B6366", align: "left" });
  const gx = px + 700; ctx.fillStyle = "#DDE7E4"; ctx.fillRect(gx - 20, py + 130, 2, ph - 170);
  const L = creditLogos(), cellW = (px + pw - 40 - gx) / 3;
  L.forEach((im, i) => {
    const row = i < 3 ? 0 : 1, col = i < 3 ? i : i - 3, cx = gx + cellW * (col + 0.5), cy = py + 250 + row * 290;
    const lh = drawLogoFit(ctx, im, cx, cy, cellW - 24, i === 0 ? 120 : 90);
    const cap = CREDIT_CAPTIONS[i] || "";
    ctx.save(); ctx.font = `600 18px ${FONT_T}`; ctx.fillStyle = "#4B6366"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const words = cap.split(" "), lines = []; let line = "";
    words.forEach(w => { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > cellW - 24 && line) { lines.push(line); line = w; } else line = t; }); if (line) lines.push(line);
    lines.forEach((l, li) => ctx.fillText(l, cx, cy + (row ? 70 : 100) + li * 24)); ctx.restore();
  });
  // creu per tancar
  const bx = px + pw - 6, by = py + 6, ov = Mouse.add(bx - 30, by - 30, 60, 60, { click: () => { scene.credits = false; Sfx.play("whoosh"); } });
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(bx, by, 26, 0, 6.28); ctx.fillStyle = ov ? BRAND.petroli : "#fff"; ctx.fill(); ctx.shadowColor = "transparent";
  ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.stroke();
  ctx.strokeStyle = ov ? "#fff" : BRAND.tinta; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx - 9, by - 9); ctx.lineTo(bx + 9, by + 9); ctx.moveTo(bx + 9, by - 9); ctx.lineTo(bx - 9, by + 9); ctx.stroke();
  ctx.restore();
}
