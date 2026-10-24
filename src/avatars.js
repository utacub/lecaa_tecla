"use strict";
/* ============================================================
   Avatars de felpa (8 animals × 8 colors) i perfils d'alumne
   ============================================================ */
const ANIMALS = [
  { id: "gat", name: L_("Gat") }, { id: "gos", name: L_("Gos") }, { id: "conill", name: L_("Conill") }, { id: "os", name: L_("Ós") },
  { id: "guineu", name: L_("Guineu") }, { id: "granota", name: L_("Granota") }, { id: "mussol", name: L_("Mussol") }, { id: "porc", name: L_("Porc") },
];
const PLUSH = ["#E9A15B", "#8FB6D9", "#E58FA6", "#9BC27A", "#B79AD6", "#F0D06A", "#C98E6B", "#7FC7BD"];

const Profiles = {
  list: Store.get("profiles", []), cur: null,
  save() { Store.set("profiles", this.list); },
  add(name, animal, color) { const p = { id: Date.now().toString(36) + randi(0, 999), name, animal, color, stars: {}, collect: {}, conf: {}, log: [], created: Date.now() }; this.list.push(p); this.save(); return p; },
  remove(p) { this.list = this.list.filter(q => q !== p); this.save(); },
  totalStars(p) { let n = 0; if (p && p.stars) for (const g in p.stars) for (const l in p.stars[g]) n += p.stars[g][l]; return n; },
  gameStars(p, gid) { const s = (p && p.stars && p.stars[gid]) || {}; let best = 0, tot = 0; for (const l in s) { tot += s[l]; best = Math.max(best, s[l]); } return { best, tot, per: s }; },
};

/* cap de felpa: sprite en memòria cau, 200 × 200 */
function avatarSprite(animal, color) {
  return Sprites.get(`av_${animal}_${color}`, 220, 220, (x, w, h) => {
    const cx = 110, cy = 120, light = shade(color, 0.35), dark = shade(color, -0.3), seed = animal.length * 7 + PLUSH.indexOf(color);
    const F = (path, c, o = {}) => Mat.felt(x, path, c, Object.assign({ seed, plush: true }, o));
    const circ = (px, py, r) => ctx => { ctx.beginPath(); ctx.arc(px, py, r, 0, 6.28); };
    const ell = (px, py, rx, ry, rot = 0) => ctx => { ctx.beginPath(); ctx.ellipse(px, py, rx, ry, rot, 0, 6.28); };
    const tri = (pts) => ctx => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], pts[i][2], pts[i][3]); ctx.closePath(); };
    // orelles (darrere del cap)
    if (animal === "gat" || animal === "guineu") {
      const big = animal === "guineu" ? 1.25 : 1;
      for (const s of [-1, 1]) { F(tri([[cx + s * 30, cy - 50], [cx + s * 60 * big, cy - 110 * big, cx + s * 78, cy - 38]]), color, { center: [cx + s * 58, cy - 62, 30] }); F(tri([[cx + s * 42, cy - 52], [cx + s * 60 * big, cy - 92 * big, cx + s * 70, cy - 46]]), animal === "guineu" ? "#3a2a22" : "#F2B5C0", { stitch: false }); }
    }
    if (animal === "conill") for (const s of [-1, 1]) { F(ell(cx + s * 30, cy - 92, 20, 58, s * 0.15), color, { center: [cx + s * 30, cy - 92, 22] }); F(ell(cx + s * 30, cy - 88, 9, 40, s * 0.15), "#F2B5C0", { stitch: false }); }
    if (animal === "os") for (const s of [-1, 1]) { F(circ(cx + s * 58, cy - 58, 26), color, { center: [cx + s * 58, cy - 58, 26] }); F(circ(cx + s * 58, cy - 58, 13), light, { stitch: false }); }
    if (animal === "porc") for (const s of [-1, 1]) F(tri([[cx + s * 30, cy - 58], [cx + s * 72, cy - 98, cx + s * 74, cy - 40]]), shade(color, -0.08), { center: [cx + s * 58, cy - 62, 22] });
    if (animal === "mussol") for (const s of [-1, 1]) F(tri([[cx + s * 26, cy - 60], [cx + s * 70, cy - 108, cx + s * 70, cy - 46]]), dark, { center: [cx + s * 54, cy - 68, 22] });
    // cap
    if (animal === "granota") F(ell(cx, cy + 4, 82, 64), color, { center: [cx, cy + 4, 70] });
    else if (animal === "guineu") F(tri([[cx - 78, cy - 26], [cx - 80, cy + 40, cx, cy + 74], [cx + 80, cy + 40, cx + 78, cy - 26], [cx, cy - 92, cx - 78, cy - 26]]), color, { center: [cx, cy, 72] });
    else F(circ(cx, cy, 76), color, { center: [cx, cy, 76] });
    if (animal === "gos") for (const s of [-1, 1]) F(ell(cx + s * 70, cy - 4, 22, 46, s * -0.35), dark, { center: [cx + s * 70, cy - 4, 24] });
    // musell / galtes
    if (animal === "guineu") for (const s of [-1, 1]) F(tri([[cx + s * 8, cy + 66], [cx + s * 60, cy + 40, cx + s * 74, cy - 4], [cx + s * 34, cy + 30, cx + s * 8, cy + 66]]), "#FFF6EA", { stitch: false });
    if (animal === "os" || animal === "gos") F(ell(cx, cy + 34, 40, 30), light, { center: [cx, cy + 34, 32] });
    if (animal === "mussol") for (const s of [-1, 1]) F(circ(cx + s * 32, cy - 8, 32), light, { center: [cx + s * 32, cy - 8, 32] });
    if (animal === "porc") F(ell(cx, cy + 30, 34, 24), shade(color, 0.18), { center: [cx, cy + 30, 28] });
    if (animal === "granota") for (const s of [-1, 1]) F(circ(cx + s * 40, cy - 54, 28), color, { center: [cx + s * 40, cy - 54, 28] });
    // ulls de botó
    const eyeY = animal === "granota" ? cy - 56 : animal === "mussol" ? cy - 8 : cy - 10, eyeX = animal === "granota" ? 40 : animal === "mussol" ? 32 : 30;
    for (const s of [-1, 1]) {
      x.save(); x.shadowColor = "rgba(0,0,0,0.4)"; x.shadowBlur = 4; x.shadowOffsetY = 2;
      x.fillStyle = animal === "mussol" || animal === "granota" ? "#fff" : "#1d1a1a"; x.beginPath(); x.arc(cx + s * eyeX, eyeY, animal === "mussol" || animal === "granota" ? 17 : 11, 0, 6.28); x.fill(); x.restore();
      if (animal === "mussol" || animal === "granota") { x.fillStyle = "#1d1a1a"; x.beginPath(); x.arc(cx + s * eyeX, eyeY + 2, 10, 0, 6.28); x.fill(); }
      x.fillStyle = "rgba(255,255,255,0.85)"; x.beginPath(); x.arc(cx + s * eyeX - 3, eyeY - 4, 3.5, 0, 6.28); x.fill();
    }
    // nas i boca
    x.lineCap = "round"; x.lineWidth = 3.2; x.strokeStyle = "#3a2626";
    if (animal === "porc") { x.fillStyle = shade(color, -0.35); for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * 11, cy + 30, 5, 8, 0, 0, 6.28); x.fill(); } }
    else if (animal === "mussol") { x.fillStyle = "#F0A13A"; x.beginPath(); x.moveTo(cx - 9, cy + 18); x.lineTo(cx + 9, cy + 18); x.lineTo(cx, cy + 36); x.closePath(); x.fill(); }
    else if (animal === "granota") { x.beginPath(); x.moveTo(cx - 34, cy + 22); x.quadraticCurveTo(cx, cy + 46, cx + 34, cy + 22); x.stroke(); }
    else {
      x.fillStyle = animal === "gat" || animal === "conill" ? "#E77E94" : "#2a2020";
      x.beginPath(); x.ellipse(cx, cy + 20, 11, 8, 0, 0, 6.28); x.fill();
      x.beginPath(); x.moveTo(cx, cy + 27); x.lineTo(cx, cy + 36); x.moveTo(cx, cy + 36); x.quadraticCurveTo(cx - 10, cy + 46, cx - 18, cy + 38); x.moveTo(cx, cy + 36); x.quadraticCurveTo(cx + 10, cy + 46, cx + 18, cy + 38); x.stroke();
    }
    if (animal === "gat") { x.strokeStyle = "rgba(60,40,40,0.55)"; x.lineWidth = 2; for (const s of [-1, 1]) for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(cx + s * 22, cy + 24 + k * 6); x.lineTo(cx + s * 62, cy + 18 + k * 10); x.stroke(); } }
    // galtes rosades
    if (animal !== "mussol") { x.fillStyle = "rgba(240,120,140,0.35)"; for (const s of [-1, 1]) { x.beginPath(); x.ellipse(cx + s * 50, cy + 22, 13, 8, 0, 0, 6.28); x.fill(); } }
  });
}
function drawAvatar(ctx, x, y, size, animal, color, o = {}) {
  const s = avatarSprite(animal, color), k = size / 220;
  ctx.save(); ctx.translate(x, y);
  if (o.body) { // cos de felpa en forma de mongeta, amb peus que es mouen
    const step = o.walk ? Math.sin(o.walk * 14) : 0;
    ctx.fillStyle = "rgba(0,0,0,0.22)"; ctx.beginPath(); ctx.ellipse(0, size * 0.62, size * 0.36, size * 0.08, 0, 0, 6.28); ctx.fill();
    for (const sd of [-1, 1]) { ctx.fillStyle = shade(color, -0.25); ctx.beginPath(); ctx.ellipse(sd * size * 0.17, size * 0.56 - (sd === 1 ? Math.max(0, step) : Math.max(0, -step)) * size * 0.06, size * 0.11, size * 0.07, 0, 0, 6.28); ctx.fill(); }
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, size * 0.36, size * 0.27, size * 0.24, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = shade(color, 0.3); ctx.beginPath(); ctx.ellipse(0, size * 0.4, size * 0.15, size * 0.14, 0, 0, 6.28); ctx.fill();
    ctx.strokeStyle = shade(color, 0.55); ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, size * 0.36, size * 0.23, size * 0.2, 0, 0, 6.28); ctx.stroke(); ctx.setLineDash([]);
  }
  const bob = o.walk ? Math.abs(Math.sin(o.walk * 14)) * size * 0.05 : 0, tilt = o.tilt || 0;
  ctx.translate(0, -bob); ctx.rotate(tilt);
  ctx.drawImage(s.c, -110 * k, -120 * k - (o.body ? size * 0.12 : 0), 220 * k, 220 * k);
  ctx.restore();
}
