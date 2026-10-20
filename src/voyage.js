"use strict";
/* ============================================================
   El viatge a l'illa: calibratge inicial de cada jugador
   Es mostren N lletres grans (per defecte 20) en ordre aleatori ponderat per la
   freqüència de les lletres en català; no hi ha ajudes, només es registra el temps.
   ============================================================ */

/* Freqüència (%) de cada tecla de lletra en català. Calculada sobre els 454.098 mots del
   corpus AnCora (Taulé, Martí i Recasens, 2008; versió Universal Dependencies, CC BY 4.0).
   Les vocals accentuades compten com la seva tecla base (à → a). */
const CALIB_FREQ = { e: 13.47, a: 13.04, s: 7.77, i: 7.48, r: 7.12, l: 6.62, n: 6.36, t: 6.35, o: 5.38, d: 4.3, c: 4.26, u: 4.0, p: 2.88, m: 2.8, v: 1.42, b: 1.28, g: 1.28, q: 1.15, f: 0.9, h: 0.68, x: 0.45, j: 0.39, y: 0.29, z: 0.17, "ç": 0.1, k: 0.04, w: 0.02 };

/* Mostra sense repetició ponderada per l'arrel de la freqüència: les lletres freqüents surten
   gairebé sempre i les rares (k, w, ç) també poden sortir. L'ordre és diferent cada vegada. */
function calibSample(n) {
  const pool = Object.keys(CALIB_FREQ).map(l => ({ l, w: Math.sqrt(CALIB_FREQ[l]) })), out = [];
  n = clamp(n, 5, pool.length);
  while (out.length < n) {
    const tot = pool.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot, i = 0;
    while (r > pool[i].w && i < pool.length - 1) { r -= pool[i].w; i++; }
    out.push(pool[i].l); pool.splice(i, 1);
  }
  return out;
}
const median = a => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/* resum del viatge i ajust proposat (nivell inicial, ritme i espera de l'ajuda) */
function calibSummary(items) {
  const ok = items.filter(it => !it.timeout), first = ok.filter(it => it.err === 0);
  const med = median(ok.map(it => it.rt)) || 6;
  const score = items.length ? first.length / items.length : 0;
  const level = score >= 0.9 && med <= 1.5 ? 4 : score >= 0.8 && med <= 2.5 ? 3 : score >= 0.6 ? 2 : 1;
  const speed = Math.round(clamp(1.45 - 0.2 * med, 0.6, 1.3) * 20) / 20;
  const hint = clamp(Math.round(2.5 * med), 4, 10);
  return { n: items.length, found: ok.length, first: first.length, med: Math.round(med * 100) / 100, tune: { level, speed, hint } };
}
/* ajust vigent d'un jugador (el de l'adult si n'ha fet un, si no el del viatge) */
function tuneOf(p) { return (p && p.tune) || { level: 1, speed: 1, hint: 5 }; }

class VoyageScene {
  constructor(profile) {
    this.p = profile; this.t = 0; this.state = "leave"; this.st = 0;
    this.letters = calibSample(Settings.calibN || 20); this.i = 0; this.items = [];
    this.prog = 0; this.progT = 0; this.wake = 0; this.particles = new Particles();
    this.gulls = Array.from({ length: 4 }, () => ({ x: rand(0, W), y: rand(90, 220), v: rand(30, 55), p: rand(0, 6) }));
  }
  enter() { Music.play("adventure"); setTimeout(() => Voice.say("Troba cada lletra al teclat."), 400); }
  get N() { return this.letters.length; }
  update(dt) {
    this.t += dt; this.st += dt; this.particles.update(dt);
    this.gulls.forEach(g => { g.x -= g.v * dt * 0.6; if (g.x < -60) g.x = W + 60; });
    this.prog += (this.progT - this.prog) * Math.min(1, dt * 2.2);
    this.wake = Math.max(0, this.wake - dt * 0.8);
    if (this.state === "leave" && this.st > 3.2) this.next();
    if (this.state === "letter") {
      this.cur.t += dt;
      if (this.cur.t > 15.35) this.answer(null); // sense resposta: es registra i el viatge continua
    }
    if (this.state === "sail" && this.st > 0.9) this.next();
    if (this.state === "arrive" && this.st > 2.6 && !this.saved) this.save();
  }
  next() {
    if (this.i >= this.N) { this.state = "arrive"; this.st = 0; this.progT = 1; Sfx.play("bell"); return; }
    this.cur = { l: this.letters[this.i], t: 0, err: 0, shake: 0 }; this.state = "letter"; this.st = 0; Sfx.play("pop");
  }
  answer(ok) {
    const c = this.cur, rt = Math.max(0, c.t - 0.35);
    this.items.push({ l: c.l, rt: Math.round(rt * 1000) / 1000, err: c.err, timeout: !ok });
    this.i++; this.progT = this.i / (this.N + 0.6); this.state = "sail"; this.st = 0; this.wake = 1;
    if (ok) { Sfx.play("chime"); this.particles.emit(980, 330, { count: 16, color: [UI.gold, "#fff", BRAND.menta], shape: "star", size: 12, speed: 300, gravity: 400 }); }
    Sfx.play("whoosh");
  }
  save() {
    this.saved = true;
    const s = calibSummary(this.items), p = this.p;
    if (p) { p.calib = { date: Date.now(), items: this.items, n: s.n, found: s.found, first: s.first, med: s.med, proposed: s.tune }; p.tune = Object.assign({}, s.tune); p.redoCalib = false; Profiles.save(); }
    this.sum = s; this.state = "done"; this.st = 0; Sfx.play("win");
  }
  goIsland() { if (this.leaving) return; this.leaving = true; Sfx.play("go"); App.go(new IslandScene(this.p, { intro: true })); }
  onKey(k) {
    if (this.state === "done") { if (k === "Enter" || k === " ") this.goIsland(); return; }
    if (this.state !== "letter" || this.cur.t < 0.35) return;
    if (k.length !== 1 || !/[a-zç]/.test(k)) return;
    if (k === this.cur.l) this.answer(true);
    else { this.cur.err++; this.cur.shake = 1; Sfx.play("boing"); }
  }
  /* ---------- dibuix ---------- */
  drawWorld(ctx) {
    const t = this.t, pr = this.prog, scroll = pr * 2600 + t * 18;
    // cel de matí
    const g = ctx.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, "#7FC4D6"); g.addColorStop(0.6, "#CDE8E6"); g.addColorStop(1, "#FBEBCB");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 520);
    const sg = ctx.createRadialGradient(260, 170, 10, 260, 170, 240); sg.addColorStop(0, "rgba(255,248,220,0.95)"); sg.addColorStop(1, "rgba(255,248,220,0)"); ctx.fillStyle = sg; ctx.fillRect(0, 0, 600, 450);
    ctx.fillStyle = "#FFF6D8"; ctx.beginPath(); ctx.arc(260, 170, 58, 0, 6.28); ctx.fill();
    const cloud = (cx, cy, s, col) => Sprites.draw(ctx, Sprites.get("vcloud" + col, 300, 120, (x) => Mat.paperCut(x, c2 => { c2.beginPath(); c2.arc(80, 80, 40, 0, 6.28); c2.arc(140, 60, 55, 0, 6.28); c2.arc(205, 78, 42, 0, 6.28); c2.rect(80, 70, 125, 50); }, col, { depth: 4, edge: false })), cx, cy, { s });
    const wrap = (x, span) => ((x % span) + span) % span - 200;
    cloud(wrap(700 - scroll * 0.08, W + 400), 120, 0.9, "#FFFFFF"); cloud(wrap(1300 - scroll * 0.05, W + 400), 210, 0.6, "#F6FBFA"); cloud(wrap(200 - scroll * 0.1, W + 400), 260, 0.75, "#FFFFFF");
    ctx.strokeStyle = "#3B4A55"; ctx.lineWidth = 3; ctx.lineCap = "round";
    this.gulls.forEach(gl => { const f = Math.sin(t * 6 + gl.p) * 7; ctx.beginPath(); ctx.moveTo(gl.x - 16, gl.y - f); ctx.quadraticCurveTo(gl.x - 7, gl.y - 7, gl.x, gl.y); ctx.quadraticCurveTo(gl.x + 7, gl.y - 7, gl.x + 16, gl.y - f); ctx.stroke(); });
    // port de sortida (marxa cap a l'esquerra) i illa d'arribada (creix a la dreta)
    const hx = 180 - pr * 1400 - Math.min(this.t, 3.2) * 40;
    if (hx > -600) this.drawHarbor(ctx, hx);
    const ik = Ease.inOutQuad(pr), ix = lerp(W + 260, W - 360, ik), is = lerp(0.32, 1.05, ik);
    Sprites.draw(ctx, this.islandSprite(), ix, 512, { s: is, ay: 1 });
    // mar en capes de paper
    const sea = ctx.createLinearGradient(0, 500, 0, H); sea.addColorStop(0, "#5FA7B3"); sea.addColorStop(1, "#1E5E69"); ctx.fillStyle = sea; ctx.fillRect(0, 500, W, H - 500);
    for (let r = 0; r < 3; r++) this.wave(ctx, 520 + r * 34, mix("#8CC9CF", "#4E97A2", r / 3), 0.6, scroll * (0.3 + r * 0.15), r, t);
    this.drawBoat(ctx, t);
    for (let r = 3; r < 6; r++) this.wave(ctx, 520 + r * 52, mix("#6DB2BB", "#246B76", (r - 3) / 3), 0.55, scroll * (0.5 + r * 0.2), r, t);
  }
  drawThumb(ctx) { this.drawWorld(ctx); }
  draw(ctx) {
    this.drawWorld(ctx);
    this.drawRoute(ctx);
    this.particles.draw(ctx);
    if (this.state === "letter") this.drawLetter(ctx);
    // botó per a l'adult: ometre el viatge
    if (this.state !== "done") drawButton(ctx, W - 30, 50, "Ometre el viatge", { align: "right", fs: 18, h: 40, style: "ghost", color: BRAND.tinta, click: () => this.goIsland() });
    if (this.state === "done") this.drawDone(ctx);
    drawGrainOverlay(ctx, 0.06); drawVignette(ctx, 0.22);
  }
  wave(ctx, y, col, alpha, off, r, t) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin((x + off) * 0.011 + r * 1.7 + t * (0.9 + r * 0.12)) * (5 + r * 2.2));
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  drawHarbor(ctx, x) {
    const sp = Sprites.get("vharbor", 560, 260, (c) => {
      const wood = Tex.wood(256, 64, "#9C6B43", { seed: 61 });
      // casetes de paper
      [[30, 70, 110, 120, "#E9C46A"], [140, 40, 100, 150, "#F4A261"], [240, 80, 90, 110, "#E76F51"], [330, 60, 100, 130, "#A8DADC"]].forEach(([hx, hy, w, h, col], i) => {
        Mat.paperCut(c, c2 => { c2.beginPath(); c2.rect(hx, hy + 30, w, h); }, col, { depth: 4, seed: 5 + i });
        Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(hx - 8, hy + 32); c2.lineTo(hx + w / 2, hy - 4); c2.lineTo(hx + w + 8, hy + 32); c2.closePath(); }, "#B5523B", { depth: 4, seed: 9 + i });
        c.fillStyle = "#2B4A55"; c.fillRect(hx + w / 2 - 12, hy + 30 + h - 46, 24, 46); c.fillStyle = "#FFF7E0"; c.fillRect(hx + 14, hy + 54, 22, 22);
      });
      // moll
      c.fillStyle = "#5A3A22"; for (let k = 0; k < 9; k++) c.fillRect(20 + k * 60, 196, 14, 64);
      c.fillStyle = c.createPattern(wood, "repeat"); c.fillRect(0, 186, 560, 24);
    });
    Sprites.draw(ctx, sp, x + 280, 530, { ay: 1 });
  }
  islandSprite() {
    return Sprites.get("visland", 760, 380, (c) => {
      Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(0, 380); c2.bezierCurveTo(80, 300, 160, 290, 240, 300); c2.bezierCurveTo(400, 250, 560, 260, 680, 310); c2.lineTo(760, 380); c2.closePath(); }, "#EBD8A6", { depth: 5, seed: 21 });
      Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(70, 340); c2.bezierCurveTo(140, 200, 260, 150, 360, 170); c2.bezierCurveTo(470, 110, 590, 170, 660, 330); c2.closePath(); }, "#7DB07A", { depth: 6, seed: 22 });
      Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(300, 200); c2.lineTo(420, 40); c2.lineTo(540, 200); c2.closePath(); }, "#8E9CAA", { depth: 5, seed: 23 });
      Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(392, 78); c2.lineTo(420, 40); c2.lineTo(448, 78); c2.quadraticCurveTo(420, 88, 392, 78); c2.closePath(); }, "#FFFFFF", { depth: 2, seed: 24 });
      // far amb franges petroli
      Mat.paperCut(c, c2 => { c2.beginPath(); c2.moveTo(586, 300); c2.lineTo(598, 170); c2.lineTo(626, 170); c2.lineTo(638, 300); c2.closePath(); }, "#FFFFFF", { depth: 4, seed: 25 });
      c.fillStyle = BRAND.petroli; c.fillRect(592, 200, 40, 18); c.fillRect(589, 245, 46, 18);
      c.fillStyle = "#F2C14E"; c.fillRect(598, 150, 28, 22); c.fillStyle = BRAND.tinta; c.beginPath(); c.moveTo(592, 152); c.lineTo(612, 132); c.lineTo(632, 152); c.closePath(); c.fill();
      // cases i palmeres
      [[170, 240, "#F4A261"], [230, 228, "#E9C46A"], [480, 236, "#E76F51"]].forEach(([hx, hy, col], i) => { Mat.paperCut(c, c2 => { c2.beginPath(); c2.rect(hx, hy, 46, 40); }, col, { depth: 3, seed: 30 + i }); c.fillStyle = "#B5523B"; c.beginPath(); c.moveTo(hx - 6, hy + 2); c.lineTo(hx + 23, hy - 22); c.lineTo(hx + 52, hy + 2); c.closePath(); c.fill(); });
      [[110, 300], [700, 320]].forEach(([px, py]) => { c.strokeStyle = "#7A5230"; c.lineWidth = 9; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + 12, py - 50, px + 4, py - 100); c.stroke(); c.fillStyle = "#4F8F4A"; for (let k = 0; k < 5; k++) { c.save(); c.translate(px + 4, py - 100); c.rotate(-2.6 + k * 0.55); c.beginPath(); c.ellipse(34, 0, 38, 10, 0, 0, 6.28); c.fill(); c.restore(); } });
    });
  }
  drawBoat(ctx, t) {
    const bx = 470, by = 622 + Math.sin(t * 1.8) * 6, tilt = Math.sin(t * 1.3) * 0.035 - this.wake * 0.03;
    // escuma de l'estela
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.35 + this.wake * 0.4})`; ctx.lineWidth = 4; ctx.lineCap = "round";
    for (let k = 0; k < 5; k++) { const ww = 40 + k * 46 + this.wake * 60; ctx.beginPath(); ctx.moveTo(bx - 190 - ww, by + 34 + k * 7); ctx.lineTo(bx - 160 - ww * 0.4, by + 30 + k * 6); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(bx, by); ctx.rotate(tilt);
    // pal, vela i bandereta
    ctx.fillStyle = "#6B4429"; ctx.fillRect(-6, -250, 12, 250);
    const puff = 1 + this.wake * 0.12;
    Mat.paperCut(ctx, c2 => { c2.beginPath(); c2.moveTo(10, -238); c2.quadraticCurveTo(10 + 150 * puff, -150, 14, -40); c2.closePath(); }, "#FFF8EA", { depth: 5, seed: 41 });
    ctx.save(); ctx.beginPath(); ctx.moveTo(10, -238); ctx.quadraticCurveTo(10 + 150 * puff, -150, 14, -40); ctx.closePath(); ctx.clip(); ctx.fillStyle = BRAND.petroli; ctx.fillRect(0, -150, 200, 26); ctx.restore();
    Mat.paperCut(ctx, c2 => { c2.beginPath(); c2.moveTo(-12, -230); c2.quadraticCurveTo(-110, -150, -16, -70); c2.closePath(); }, "#F3EAD6", { depth: 4, seed: 42 });
    const fl = Math.sin(t * 8) * 6; ctx.fillStyle = UI.coral; ctx.beginPath(); ctx.moveTo(6, -250); ctx.quadraticCurveTo(30, -258 + fl, 54, -246 + fl); ctx.lineTo(6, -232); ctx.closePath(); ctx.fill();
    // jugador assegut a la barca
    if (this.p) drawAvatar(ctx, -60, -48, 104, ANIMALS[this.p.animal % 8].id, PLUSH[this.p.color % 8], { body: true, tilt: Math.sin(t * 2) * 0.05 });
    // buc de fusta
    const wood = Tex.wood(256, 64, "#A0623A", { seed: 47 });
    const hull = c2 => { c2.beginPath(); c2.moveTo(-180, -10); c2.lineTo(170, -10); c2.quadraticCurveTo(150, 46, 100, 56); c2.lineTo(-130, 56); c2.quadraticCurveTo(-170, 40, -180, -10); c2.closePath(); };
    Mat.paperCut(ctx, hull, "#A0623A", { depth: 6, seed: 48 });
    ctx.save(); hull(ctx); ctx.clip(); ctx.globalAlpha = 0.55; ctx.fillStyle = ctx.createPattern(wood, "repeat"); ctx.fillRect(-190, -20, 380, 90); ctx.globalAlpha = 1;
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(-190, 4, 380, 12); ctx.fillStyle = "#F3EAD6"; ctx.fillRect(-190, 16, 380, 4); ctx.restore();
    ctx.restore();
  }
  drawRoute(ctx) {
    // ruta del viatge: del port a l'illa, amb una boia per lletra
    const x0 = 360, x1 = W - 360, y = 66, N = this.N;
    ctx.save(); drawPanel(ctx, x0 - 70, y - 34, x1 - x0 + 140, 68, { r: 34, fill: "rgba(255,255,255,0.88)", border: false, blur: 10 });
    ctx.setLineDash([4, 10]); ctx.lineCap = "round"; ctx.lineWidth = 4; ctx.strokeStyle = "rgba(23,103,107,0.45)"; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
    for (let i = 0; i < N; i++) { const bx = lerp(x0 + 30, x1 - 30, (i + 0.5) / N), done = i < this.i; ctx.beginPath(); ctx.arc(bx, y, done ? 7 : 5, 0, 6.28); ctx.fillStyle = done ? BRAND.petroli : "#C8D8D4"; ctx.fill(); }
    // port i illa
    ctx.fillStyle = "#B5523B"; ctx.beginPath(); ctx.moveTo(x0 - 40, y + 6); ctx.lineTo(x0 - 28, y - 10); ctx.lineTo(x0 - 16, y + 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#7DB07A"; ctx.beginPath(); ctx.ellipse(x1 + 30, y + 4, 24, 12, 0, Math.PI, 0); ctx.fill(); ctx.fillStyle = "#EBD8A6"; ctx.fillRect(x1 + 6, y + 4, 48, 5);
    // barqueta
    const mx = lerp(x0, x1, clamp(this.prog, 0, 1)); ctx.fillStyle = "#A0623A"; ctx.beginPath(); ctx.moveTo(mx - 16, y + 2); ctx.lineTo(mx + 16, y + 2); ctx.lineTo(mx + 10, y + 12); ctx.lineTo(mx - 10, y + 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#FFF8EA"; ctx.beginPath(); ctx.moveTo(mx, y - 20); ctx.lineTo(mx + 14, y); ctx.lineTo(mx, y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#6B4429"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(mx, y - 22); ctx.lineTo(mx, y + 2); ctx.stroke();
    ctx.restore();
  }
  drawLetter(ctx) {
    // la lletra, ben gran i neta, sobre una targeta que no es mou
    const c = this.cur, k = Ease.outBack(clamp(c.t / 0.3, 0, 1)); c.shake = Math.max(0, c.shake - 1 / 60 * 3);
    const sx = Math.sin(c.shake * 30) * 10 * c.shake;
    ctx.save(); ctx.translate(980 + sx, 340); ctx.scale(k, k);
    ctx.shadowColor = "rgba(10,30,40,0.35)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; rr(ctx, -160, -170, 320, 340, 34); ctx.fillStyle = "#FFFDF6"; ctx.fill(); ctx.shadowColor = "transparent";
    ctx.lineWidth = 6; ctx.strokeStyle = BRAND.petroli; rr(ctx, -150, -160, 300, 320, 28); ctx.stroke();
    ctx.fillStyle = BRAND.ink || "#14262A"; ctx.font = `700 230px ${FONT_L}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(disp(c.l), 0, 12);
    ctx.restore();
  }
  drawDone(ctx) {
    const s = this.sum, k = Ease.outBack(clamp(this.st / 0.5, 0, 1));
    ctx.save(); ctx.fillStyle = `rgba(20,38,42,${0.45 * clamp(this.st * 3, 0, 1)})`; ctx.fillRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
    const pw = 760, ph = 420, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    drawPanel(ctx, px, py, pw, ph, { r: 36 });
    ctx.save(); rr(ctx, px, py, pw, 110, 36); ctx.clip(); ctx.fillStyle = BRAND.petroli; ctx.fillRect(px, py, pw, 110); ctx.restore(); ctx.fillStyle = BRAND.petroli; ctx.fillRect(px, py + 80, pw, 30);
    text(ctx, "Hem arribat a l'illa!", W / 2, py + 60, { size: 48, weight: 900, font: FONT_T, color: "#fff" });
    text(ctx, `Has trobat ${s.found} lletres de ${s.n}.`, W / 2, py + 180, { size: 36, weight: 800, font: FONT_T, color: BRAND.tinta });
    text(ctx, "Ara ja pots explorar l'illa i triar un joc.", W / 2, py + 236, { size: 26, weight: 700, color: "#4B6366" });
    drawButton(ctx, W / 2, py + ph - 70, "Anar a l'illa", { fs: 32, w: 320, h: 76, style: "primary", click: this.st > 0.6 ? () => this.goIsland() : null });
    ctx.restore();
  }
}
