"use strict";
/* ============================================================
   Blanc sobre negre (Marc, 20-10-2026)
   Fons negre, una lletra blanca i gran. Per defecte, sense ajudes ni reacció
   als errors: només l'encert fa un "ding", un lleu senyal verd i passa a la
   lletra següent. No s'acaba mai; se'n surt amb la creueta grisa.
   La rodeta grisa obre les opcions: avís d'error, pistes i bloqueig amb contrasenya.
   ============================================================ */
/* lletra següent: sorteig ponderat per la freqüència del català (AnCora), sense repetir la mateixa dues vegades seguides */
function bsnNext(prev) {
  const keys = Object.keys(CALIB_FREQ).filter(l => l !== prev);
  let r = Math.random() * keys.reduce((s, l) => s + CALIB_FREQ[l], 0);
  for (const l of keys) { r -= CALIB_FREQ[l]; if (r <= 0) return l; }
  return keys[keys.length - 1];
}
/* resum curt de la contrasenya (no és seguretat forta: només evita que un infant surti de l'activitat) */
function bsnHash(s) { let h = 5381; for (const c of "tecla|" + s) h = (h * 33 + c.charCodeAt(0)) | 0; return "h" + (h >>> 0).toString(36); }
const BSN_DEF = { so: "veure", upper: null, err: false, hint: "cap", hintS: 5, stars: false, starN: 0, pass: null, locked: false };
/* so de la lletra: locucions enregistrades dels fonemes (veu de l'Anna, LECAA Docs) */
const BSN_SO = [["cap", "No"], ["veure", "Sí"]]; // sona quan apareix la lletra (Marc, 20-10-2026)
const BSN_HINTS = [["cap", "No"], ["error", "Després d'un error"], ["temps", "Després d'uns segons"], ["sempre", "Sempre"]];
function bsnFullscreen() {
  try {
    const el = document.documentElement;
    if (!document.fullscreenElement) { const r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen(); if (r && r.catch) r.catch(() => { }); }
    // Chrome i Edge: amb el teclat bloquejat, Esc s'ha de mantenir premuda per sortir de la pantalla completa
    if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(["Escape"]).catch(() => { });
  } catch (e) { }
}
/* mentre està bloquejada: torna a pantalla completa amb el primer gest i avisa abans de tancar la pestanya */
(function () {
  const locked = () => App.scene instanceof BlackWhiteScene && App.scene.o.locked;
  addEventListener("pointerdown", () => { if (locked() && !document.fullscreenElement) bsnFullscreen(); }, true);
  addEventListener("keydown", () => { if (locked() && !document.fullscreenElement) bsnFullscreen(); }, true);
  addEventListener("beforeunload", e => { if (locked()) { e.preventDefault(); e.returnValue = ""; } });
})();

class BlackWhiteScene {
  constructor() {
    this.t = 0; this.o = Object.assign({}, BSN_DEF, Store.get("bsn", {})); if (this.o.so === "encert") this.o.so = "veure";
    this.l = bsnNext(null); this.lt = 0; this.wrong = 0; this.shake = 0; this.ok = 0; this.n = 0;
    this.fly = []; this.panel = false; this.prompt = null; this.edit = null; // edit: text de la contrasenya nova mentre s'escriu
  }
  save() { Store.set("bsn", this.o); }
  enter() { Music.stop(); Voice.stop(); }
  exit() { Phon.stop(); }
  update(dt) {
    this.t += dt; this.shake = Math.max(0, this.shake - dt * 4);
    this.fly = this.fly.filter(f => { f.t += dt / 0.7; if (f.t >= 1) { this.o.starN++; this.save(); return false; } return true; });
    if (this.panel || this.prompt) return;
    this.lt += dt;
    if (this.ok > 0) { this.ok += dt; if (this.ok > 0.45) { this.ok = 0; this.l = bsnNext(this.l); this.lt = 0; this.wrong = 0; this.saidL = false; } }
    if (this.o.so === "veure" && !this.saidL && this.ok === 0 && this.lt > 0.25) { this.saidL = true; Phon.play(this.l); }
  }
  showHint() {
    const h = this.o.hint; if (this.ok > 0) return false;
    return h === "sempre" || (h === "error" && this.wrong > 0) || (h === "temps" && this.lt >= this.o.hintS);
  }
  draw(ctx) {
    // majúscules o minúscules pròpies d'aquesta activitat (si no s'ha triat, segueix la configuració general)
    const up0 = Settings.upper; if (this.o.upper != null) Settings.upper = this.o.upper;
    try { this.drawMain(ctx); } finally { Settings.upper = up0; }
  }
  drawMain(ctx) {
    ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, H);
    const g = this.ok > 0 ? Math.sin(Math.PI * clamp(this.ok / 0.45, 0, 1)) : 0;
    const withKb = this.o.hint !== "cap", ly = withKb ? 320 : H / 2 + 10, ls = withKb ? 300 : 380;
    if (g > 0) { // lleu resplendor verda d'encert
      const rg = ctx.createRadialGradient(W / 2, ly, 40, W / 2, ly, 420); rg.addColorStop(0, `rgba(60,200,110,${0.32 * g})`); rg.addColorStop(1, "rgba(60,200,110,0)");
      ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    }
    const sx = Math.sin(this.shake * 40) * 14 * this.shake;
    text(ctx, disp(this.l), W / 2 + sx, ly, { size: ls, weight: 700, font: FONT_L, color: g > 0 ? mix("#FFFFFF", "#7CE3A0", g) : "#FFFFFF" });
    if (withKb && this.showHint()) Kb.draw(ctx, W / 2, 712, 52, { marks: { [this.l]: "expected" }, dimOthers: true, alpha: 0.92 });
    if (this.o.stars) this.drawStars(ctx, ly);
    // controls discrets: rodeta d'opcions i, si no està bloquejada, la creueta per sortir
    const gx = this.o.locked ? W - 44 : W - 104, gy = 44;
    const gov = Mouse.add(gx - 28, gy - 28, 56, 56, { click: () => this.openOptions() });
    bsnGear(ctx, gx, gy, gov ? "#5A5A5A" : "#333333");
    if (!this.o.locked) {
      const bx = W - 44, by = 44, ov = Mouse.add(bx - 28, by - 28, 56, 56, { click: () => App.go(new TitleScene()) });
      ctx.save(); ctx.strokeStyle = ov ? "#5A5A5A" : "#333333"; ctx.lineWidth = 4; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(bx - 12, by - 12); ctx.lineTo(bx + 12, by + 12); ctx.moveTo(bx + 12, by - 12); ctx.lineTo(bx - 12, by + 12); ctx.stroke(); ctx.restore();
    }
    if (this.panel) this.drawPanel(ctx);
    if (this.prompt) this.drawPrompt(ctx);
  }
  /* estrelles acumulades: columna a l'esquerra, de baix a dalt, amb el comptador a sobre */
  starPos(i) { const cols = 5, max = 70, j = i % max; return [48 + (j % cols) * 52, H - 48 - Math.floor(j / cols) * 50]; }
  drawStars(ctx, ly) {
    const n = this.o.starN, shown = n % 70 || (n ? 70 : 0), base = n - shown;
    for (let i = 0; i < shown; i++) { const [x, y] = this.starPos(base + i); drawStar(ctx, x, y, 19, true, { blur: 2 }); }
    drawStar(ctx, 48, 52, 22, true, { blur: 2 }); text(ctx, String(n), 82, 54, { size: 40, weight: 900, font: FONT_T, color: "#E8E8E8", align: "left" });
    this.fly.forEach(f => {
      const [tx, ty] = this.starPos(f.to), k = Ease.inOutQuad(clamp(f.t, 0, 1)), x = lerp(W / 2, tx, k), y = lerp(ly, ty, k) - Math.sin(Math.PI * k) * 160;
      drawStar(ctx, x, y, lerp(46, 19, k), true, { blur: 4, rot: k * 4 });
    });
  }
  openOptions() {
    if (this.o.locked) { this.prompt = { s: "", err: false }; return; }
    this.panel = true; this.edit = null;
  }
  /* ---------- finestra d'opcions (fosca i sòbria, amb el ratolí) ---------- */
  drawPanel(ctx) {
    ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H); Mouse.add(0, 0, W, H, {});
    const pw = 980, ph = 880, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    rr(ctx, px, py, pw, ph, 24); ctx.fillStyle = "#161616"; ctx.fill(); ctx.strokeStyle = "#3A3A3A"; ctx.lineWidth = 2; ctx.stroke();
    const T = (s, x, y, o = {}) => text(ctx, s, x, y, Object.assign({ size: 24, weight: 800, font: FONT_T, color: "#D8D8D8", align: "left" }, o));
    T("Opcions de Blanc sobre negre", px + 44, py + 52, { size: 30, weight: 900, color: "#F2F2F2" });
    let y = py + 130;
    T("Avís quan s'equivoca", px + 44, y);
    bsnChips(ctx, px + 400, y, [["no", "No"], ["si", "Sí"]], this.o.err ? "si" : "no", v => { this.o.err = v === "si"; this.save(); });
    T("Un so greu i la lletra tremola. Si no, la tecla equivocada no fa res.", px + 44, y + 36, { size: 17, weight: 700, color: "#8C8C8C", font: FONT_L });
    y += 92; T("Lletres", px + 44, y);
    const up = this.o.upper != null ? this.o.upper : !!Settings.upper;
    bsnChips(ctx, px + 400, y, [["min", "minúscules"], ["maj", "MAJÚSCULES"]], up ? "maj" : "min", v => { this.o.upper = v === "maj"; this.save(); });
    y += 78; T("So de la lletra", px + 44, y);
    bsnChips(ctx, px + 400, y, BSN_SO, this.o.so || "cap", v => { this.o.so = v; this.save(); if (v !== "cap") Phon.play(this.l); });
    T("Sona quan apareix cada lletra (locució enregistrada, veu de l'Anna).", px + 44, y + 36, { size: 17, weight: 700, color: "#8C8C8C", font: FONT_L });
    y += 92; T("Pistes de la tecla", px + 44, y);
    bsnChips(ctx, px + 44, y + 52, BSN_HINTS, this.o.hint, v => { this.o.hint = v; this.save(); });
    y += 108;
    if (this.o.hint === "temps") {
      T("Segons d'espera", px + 44, y, { size: 21, color: "#B0B0B0" });
      bsnChips(ctx, px + 300, y, [3, 5, 8, 12].map(s => [s, s + " s"]), this.o.hintS, v => { this.o.hintS = v; this.save(); });
    }
    y += 70; T("Una estrella per cada encert", px + 44, y);
    bsnChips(ctx, px + 440, y, [["no", "No"], ["si", "Sí"]], this.o.stars ? "si" : "no", v => { this.o.stars = v === "si"; this.save(); });
    T(this.o.starN + " estrelles guardades", px + 44, y + 36, { size: 17, weight: 700, color: "#8C8C8C", font: FONT_L });
    if (this.o.starN) bsnBtn(ctx, px + 640, y, "Posar a zero", () => { this.o.starN = 0; this.save(); }, { w: 190 });
    y += 100; ctx.fillStyle = "#2A2A2A"; ctx.fillRect(px + 44, y - 30, pw - 88, 2);
    T("Contrasenya per desbloquejar", px + 44, y + 10);
    const fx = px + 440, fy = y - 14, fw = 300, editing = this.edit != null;
    const fov = Mouse.add(fx, fy, fw, 48, { click: () => { this.edit = ""; } });
    rr(ctx, fx, fy, fw, 48, 12); ctx.fillStyle = editing ? "#262626" : "#1E1E1E"; ctx.fill(); ctx.strokeStyle = editing ? "#9A9A9A" : fov ? "#5A5A5A" : "#3A3A3A"; ctx.stroke();
    const shown = editing ? "•".repeat(this.edit.length) + (Math.floor(this.t * 2) % 2 ? "|" : " ") : this.o.pass ? "••••••" : "Clica per definir-ne una";
    T(shown, fx + 16, fy + 25, { size: editing || this.o.pass ? 26 : 18, color: editing || this.o.pass ? "#E0E0E0" : "#7A7A7A", weight: 700 });
    if (editing) bsnBtn(ctx, fx + fw + 20, fy + 24, "Desar", () => this.savePass());
    y += 100;
    const can = !!this.o.pass && !editing;
    bsnBtn(ctx, px + 44, y, "Bloquejar la finestra", can ? () => this.lock() : null, { w: 330 });
    T(can ? "Pantalla completa i sense creueta fins que s'escrigui la contrasenya." : "Primer cal definir una contrasenya.", px + 400, y, { size: 17, weight: 700, color: "#8C8C8C", font: FONT_L });
    bsnBtn(ctx, px + pw - 44, py + ph - 52, "Tancar", () => { this.panel = false; this.edit = null; }, { align: "right", w: 180 });
    ctx.restore();
  }
  savePass() { if (this.edit && this.edit.length) { this.o.pass = bsnHash(this.edit); this.save(); Sfx.play("tick"); } this.edit = null; }
  lock() { this.o.locked = true; this.save(); this.panel = false; bsnFullscreen(); }
  /* ---------- demanar la contrasenya quan està bloquejada ---------- */
  drawPrompt(ctx) {
    const P = this.prompt;
    ctx.save(); ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0, 0, W, H); Mouse.add(0, 0, W, H, {});
    const pw = 620, ph = 300, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    rr(ctx, px, py, pw, ph, 24); ctx.fillStyle = "#161616"; ctx.fill(); ctx.strokeStyle = "#3A3A3A"; ctx.lineWidth = 2; ctx.stroke();
    text(ctx, "Contrasenya", W / 2, py + 52, { size: 28, weight: 900, font: FONT_T, color: "#F2F2F2" });
    rr(ctx, px + 60, py + 96, pw - 120, 56, 12); ctx.fillStyle = "#262626"; ctx.fill(); ctx.strokeStyle = P.err ? "#A85A50" : "#9A9A9A"; ctx.stroke();
    text(ctx, "•".repeat(P.s.length) + (Math.floor(this.t * 2) % 2 ? "|" : " "), W / 2, py + 125, { size: 30, weight: 700, font: FONT_T, color: "#E0E0E0" });
    if (P.err) text(ctx, "No és correcta", W / 2, py + 180, { size: 19, weight: 700, font: FONT_L, color: "#C98A80" });
    bsnBtn(ctx, W / 2 - 16, py + 240, "Tornar", () => { this.prompt = null; }, { align: "right", w: 180 });
    bsnBtn(ctx, W / 2 + 16, py + 240, "Desbloquejar", () => this.tryUnlock(), { align: "left", w: 220 });
    ctx.restore();
  }
  tryUnlock() {
    const P = this.prompt; if (!P) return;
    if (bsnHash(P.s) === this.o.pass) {
      this.o.locked = false; this.save(); this.prompt = null; this.panel = true;
      try { if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); } catch (e) { }
      Sfx.play("tick");
    } else { P.err = true; P.s = ""; }
  }
  typeInto(k, cur, max = 24) {
    if (k === "Backspace") return cur.slice(0, -1);
    if (k.length === 1 && cur.length < max) return cur + k;
    return cur;
  }
  onKey(k) {
    if (this.prompt) {
      if (k === "Enter") this.tryUnlock(); else if (k === "Escape") this.prompt = null; else { this.prompt.s = this.typeInto(k, this.prompt.s); this.prompt.err = false; }
      return;
    }
    if (this.panel) {
      if (this.edit != null) { if (k === "Enter") this.savePass(); else if (k === "Escape") this.edit = null; else this.edit = this.typeInto(k, this.edit); }
      return;
    }
    if (this.ok > 0 || k.length !== 1) return;
    if (k === this.l) {
      this.ok = 0.0001; this.n++; Sfx.play("ding");
      if (this.o.stars) this.fly.push({ t: 0, to: this.o.starN + this.fly.length });
      return;
    }
    if (k === " ") return;
    this.wrong++; // compta per a les pistes "després d'un error", tant si hi ha avís com si no
    if (this.o.err) { this.shake = 1; Sfx.play("nope"); }
  }
}
/* rodeta dentada */
function bsnGear(ctx, x, y, col) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath();
  const n = 8, R = 17, r = 12.5;
  for (let i = 0; i < n * 2; i++) { const a0 = (i / (n * 2)) * Math.PI * 2, a1 = ((i + 1) / (n * 2)) * Math.PI * 2, rad = i % 2 ? r : R; ctx.arc(0, 0, rad, a0 + 0.06, a1 - 0.06); }
  ctx.closePath(); ctx.moveTo(6, 0); ctx.arc(0, 0, 6, 0, Math.PI * 2, true); ctx.fill("evenodd"); ctx.restore();
}
/* xips de selecció i botons de la finestra fosca */
function bsnChips(ctx, x, y, items, cur, set) {
  let cx = x;
  items.forEach(([v, label]) => {
    ctx.font = `800 20px ${FONT_T}`; const w = ctx.measureText(label).width + 40, sel = v === cur;
    const ov = Mouse.add(cx, y - 22, w, 44, { click: () => { set(v); Sfx.play("tick"); } });
    rr(ctx, cx, y - 22, w, 44, 22); ctx.fillStyle = sel ? "#E6E6E6" : ov ? "#333333" : "#242424"; ctx.fill();
    text(ctx, label, cx + w / 2, y + 1, { size: 20, weight: 800, font: FONT_T, color: sel ? "#111111" : "#C8C8C8" });
    cx += w + 12;
  });
}
function bsnBtn(ctx, x, y, label, click, o = {}) {
  ctx.font = `800 21px ${FONT_T}`; const w = o.w || ctx.measureText(label).width + 44, x0 = o.align === "right" ? x - w : x, on = !!click;
  const ov = on && Mouse.add(x0, y - 24, w, 48, { click: () => { click(); } });
  rr(ctx, x0, y - 24, w, 48, 24); ctx.fillStyle = !on ? "#1E1E1E" : ov ? "#4A4A4A" : "#333333"; ctx.fill();
  text(ctx, label, x0 + w / 2, y + 1, { size: 21, weight: 800, font: FONT_T, color: on ? "#EDEDED" : "#5A5A5A" });
}
