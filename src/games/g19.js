"use strict";
/* 19. Talps del teclat — prat de felpa amb els forats exactament com les tecles (files i desplaçament reals) */
(() => {
  const U = 116, ROWY = [370, 520, 670], ROWS = [0.92, 1.0, 1.06], CX = 5.64;
  const LETTERKEYS = KB_ROWS.flatMap(r => r.keys).filter(k => /^[a-zñç]$/.test(k));
  const holePos = k => { const p = KB_POS[k]; if (!p) return null; return { x: 800 + (p.x - CX) * U, y: ROWY[p.row], s: ROWS[p.row], row: p.row }; };
  const GOALS = [0, 15, 20, 25, 25, 30, 35], TIME = 60;
  const distinct = w => new Set(w).size === w.length;
  const W5 = WORDS5.concat(["sol", "mar", "gat", "nas", "peu", "cel", "nit", "dia", "riu", "gos", "foc", "pot", "dit", "ull", "mel", "tren", "camp", "poma", "pera", "sopa", "mans", "vent", "neu", "roda", "flor", "bosc", "ruc", "tia", "pare", "mare", "bou", "dau", "nau", "pou", "lupa", "fum", "cuc"]).filter(w => /^[a-zç]{3,4}$/.test(w) && distinct(w));
  const W6 = ["pluja", "cotxe", "fruit", "pinya", "blanc", "vespa", "corda", "pinta", "sucre", "menta", "dents", "fusta", "mosca", "gelat", "ploma", "regal", "fideu", "porta", "camps", "mitjó", "verds", "groc", "llamp"].filter(w => /^[a-zç]{5}$/.test(w) && distinct(w));
  const FELT = "#6FB04E";

  /* ---------- prat de felpa (prerenderitzat per conjunt de forats oberts) ---------- */
  function holeRim(x, hx, hy, s, front) {
    const rx = 45 * s, ry = 21 * s;
    if (!front) {
      // vora de felpa (anell) i forat fosc amb profunditat
      x.save(); x.shadowColor = "rgba(20,50,10,0.35)"; x.shadowBlur = 8; x.shadowOffsetY = 3;
      x.fillStyle = "#86C462"; x.beginPath(); x.ellipse(hx, hy, rx + 10 * s, ry + 7 * s, 0, 0, 6.283); x.fill(); x.restore();
      x.save(); x.beginPath(); x.ellipse(hx, hy, rx + 10 * s, ry + 7 * s, 0, 0, 6.283); x.clip();
      x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#cfcfcf", { seed: 21, plush: true }), "repeat"); x.fillRect(hx - 90, hy - 50, 180, 100); x.restore();
      const g = x.createRadialGradient(hx, hy + ry * 0.6, 2, hx, hy, rx * 1.1); g.addColorStop(0, "#2A1A12"); g.addColorStop(0.7, "#3E2A1C"); g.addColorStop(1, "#5A3E28");
      x.fillStyle = g; x.beginPath(); x.ellipse(hx, hy, rx, ry, 0, 0, 6.283); x.fill();
      x.save(); x.setLineDash([6, 5]); x.lineWidth = 2.2; x.strokeStyle = "rgba(255,250,220,0.7)"; x.beginPath(); x.ellipse(hx, hy, rx + 5.5 * s, ry + 4 * s, 0, 0, 6.283); x.stroke(); x.restore();
    } else {
      // llavi davanter (per sobre del talp)
      x.save(); x.beginPath(); x.ellipse(hx, hy, rx + 10 * s, ry + 7 * s, 0, 0, Math.PI); x.ellipse(hx, hy, rx, ry, 0, Math.PI, 0, true); x.closePath();
      x.fillStyle = "#86C462"; x.fill(); x.clip();
      x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#cfcfcf", { seed: 21, plush: true }), "repeat"); x.fillRect(hx - 90, hy - 50, 180, 100);
      x.globalCompositeOperation = "source-over"; x.fillStyle = "rgba(255,255,255,0.12)"; x.fillRect(hx - 90, hy, 180, 6);
      x.restore();
      x.save(); x.setLineDash([6, 5]); x.lineWidth = 2.2; x.strokeStyle = "rgba(255,250,220,0.7)"; x.beginPath(); x.ellipse(hx, hy, rx + 5.5 * s, ry + 4 * s, 0, 0.05, Math.PI - 0.05); x.stroke(); x.restore();
    }
  }
  function patch(x, hx, hy, s) {
    // forat tancat: pedaç de feltre cosit
    const rx = 44 * s, ry = 20 * s;
    x.save(); x.shadowColor = "rgba(20,50,10,0.3)"; x.shadowBlur = 5; x.shadowOffsetY = 2; x.fillStyle = "#C9A27A"; x.beginPath(); x.ellipse(hx, hy, rx, ry, 0, 0, 6.283); x.fill(); x.restore();
    x.save(); x.beginPath(); x.ellipse(hx, hy, rx, ry, 0, 0, 6.283); x.clip(); x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#d0d0d0", { seed: 31 }), "repeat"); x.fillRect(hx - 60, hy - 30, 120, 60); x.restore();
    x.strokeStyle = "rgba(110,70,40,0.75)"; x.lineWidth = 2.4; x.lineCap = "round";
    for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, cx = hx + Math.cos(a) * (rx - 6), cy = hy + Math.sin(a) * (ry - 4); x.beginPath(); x.moveTo(cx - 3, cy - 3); x.lineTo(cx + 3, cy + 3); x.moveTo(cx + 3, cy - 3); x.lineTo(cx - 3, cy + 3); x.stroke(); }
  }
  function meadow(x, open, w = W, h = H) {
    // cel de feltre i turons llunyans
    const g = x.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, "#9ED6EE"); g.addColorStop(1, "#D9F0EC"); x.fillStyle = g; x.fillRect(0, 0, w, 270);
    x.save(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.35; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#dddddd", { seed: 5 }), "repeat"); x.fillRect(0, 0, w, 270); x.restore();
    for (const [cx, cy, r] of [[230, 170, 40], [280, 152, 52], [336, 172, 38], [1180, 150, 36], [1226, 134, 46], [1278, 154, 34]]) {
      x.save(); x.shadowColor = "rgba(60,100,130,0.25)"; x.shadowBlur = 8; x.shadowOffsetY = 4; x.fillStyle = "#FFFFFF"; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fill(); x.restore();
      x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.clip(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.35; x.fillStyle = x.createPattern(Tex.felt(128, 128, "#e2e2e2", { seed: 7, plush: true }), "repeat"); x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; const cg = x.createLinearGradient(0, cy - r, 0, cy + r); cg.addColorStop(0.5, "rgba(255,255,255,0)"); cg.addColorStop(1, "rgba(150,180,200,0.3)"); x.fillStyle = cg; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); x.restore();
    }
    const far = c => { c.beginPath(); c.moveTo(0, 270); c.bezierCurveTo(300, 170, 520, 250, 800, 210); c.bezierCurveTo(1080, 170, 1300, 250, 1600, 200); c.lineTo(1600, 320); c.lineTo(0, 320); c.closePath(); };
    Mat.felt(x, far, "#8CC56D", { stitch: false });
    // prat principal
    const field = c => { c.beginPath(); c.moveTo(0, 250); c.bezierCurveTo(400, 225, 1200, 225, 1600, 250); c.lineTo(1600, 900); c.lineTo(0, 900); c.closePath(); };
    x.save(); field(x); x.fillStyle = FELT; x.fill(); x.clip();
    const fg = x.createLinearGradient(0, 240, 0, 900); fg.addColorStop(0, "rgba(255,255,230,0.22)"); fg.addColorStop(0.5, "rgba(0,0,0,0)"); fg.addColorStop(1, "rgba(10,40,10,0.22)"); x.fillStyle = fg; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "multiply"; x.fillStyle = x.createPattern(Tex.felt(256, 256, "#d4d4d4", { seed: 9, plush: true }), "repeat"); x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = "source-over";
    // costures de retalls (com un edredó)
    x.setLineDash([10, 8]); x.lineWidth = 3; x.strokeStyle = "rgba(240,255,220,0.35)";
    for (const yy of [415, 565, 715]) { x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(500, yy - 12, 1100, yy + 12, 1600, yy - 4); x.stroke(); }
    x.setLineDash([]);
    const R = mulberry32(19);
    for (let i = 0; i < 160; i++) { const px = R() * w, py = 260 + R() * 640; x.strokeStyle = rgba("#3E7F2E", 0.35); x.lineWidth = 2.4; x.lineCap = "round"; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 2, py - 7, px + 5, py - 12); x.stroke(); }
    x.restore();
    // matolls de felpa a l'horitzó i flors cosides al primer terme
    const R2 = mulberry32(8);
    for (let i = 0; i < 9; i++) { const bx = 60 + i * 185 + R2() * 60, by = 238 + R2() * 14, br = 22 + R2() * 14; Mat.felt(x, c => blobPath(c, bx, by, br, i + 3, 0.12, 8), i % 2 ? "#4F9A3C" : "#5DA846", { stitch: false }); }
    for (let i = 0; i < 26; i++) { const fx = 30 + i * 61 + R2() * 30, fy = 760 + R2() * 110; x.strokeStyle = "#3E7F2E"; x.lineWidth = 4; x.lineCap = "round"; x.beginPath(); x.moveTo(fx, fy + 30); x.quadraticCurveTo(fx - 4, fy + 14, fx, fy); x.stroke(); const F = flowerSprite(i % 6), fs = 0.55 + R2() * 0.35; x.drawImage(F.c, fx - 35 * fs, fy - 35 * fs, 70 * fs, 70 * fs); }
    // forats
    for (const k of LETTERKEYS) { const p = holePos(k); if (open.has(k)) holeRim(x, p.x, p.y, p.s, false); else patch(x, p.x, p.y, p.s); }
  }
  const bgSprite = (open, key) => Sprites.get("g19bg" + key, W, H, x => meadow(x, open));
  const lipSprite = s => Sprites.get("g19lip" + s, 160, 80, x => holeRim(x, 80, 30, s, true));

  /* ---------- talp de peluix amb casc i ulleres ---------- */
  const moleSprite = pose => Sprites.get("g19mole" + pose, 160, 240, (x) => {
    const cx = 80;
    const body = c => { c.beginPath(); c.moveTo(cx - 58, 240); c.lineTo(cx - 60, 104); c.bezierCurveTo(cx - 62, 34, cx + 62, 34, cx + 60, 104); c.lineTo(cx + 58, 240); c.closePath(); };
    Mat.felt(x, body, "#8D6E5C", { plush: true, center: [cx, 140, 76], gap: 6, stitch: "rgba(255,240,220,0.55)" });
    x.save(); body(x); x.clip(); const sh = x.createLinearGradient(cx - 60, 0, cx + 60, 0); sh.addColorStop(0, "rgba(0,0,0,0.2)"); sh.addColorStop(0.35, "rgba(255,255,255,0.12)"); sh.addColorStop(1, "rgba(0,0,0,0.24)"); x.fillStyle = sh; x.fillRect(0, 0, 160, 240);
    Mat.felt(x, c => { c.beginPath(); c.ellipse(cx, 200, 44, 50, 0, 0, 6.283); }, "#B49482", { stitch: false });
    x.restore();
    // orelletes
    for (const d of [-1, 1]) Mat.felt(x, c => { c.beginPath(); c.ellipse(cx + d * 54, 76, 11, 13, 0, 0, 6.283); }, "#7A5C4C", { stitch: false });
    // morro
    Mat.felt(x, c => { c.beginPath(); c.ellipse(cx, 116, 32, 23, 0, 0, 6.283); }, "#E9CDB8", { stitch: false });
    x.fillStyle = "#E86F86"; x.beginPath(); x.ellipse(cx, 104, 12, 8.5, 0, 0, 6.283); x.fill(); x.fillStyle = "rgba(255,255,255,0.6)"; x.beginPath(); x.ellipse(cx - 3, 101, 4.5, 2.6, 0, 0, 6.283); x.fill();
    x.strokeStyle = "#4A3328"; x.lineWidth = 3; x.lineCap = "round";
    if (pose === "idle") { x.beginPath(); x.arc(cx - 7, 120, 7, 0.2, 2.6); x.stroke(); x.beginPath(); x.arc(cx + 7, 120, 7, 0.55, 2.9); x.stroke(); x.fillStyle = "#fff"; x.fillRect(cx - 5, 124, 10, 7); }
    else if (pose === "caught") { x.fillStyle = "#5A2430"; x.beginPath(); x.ellipse(cx, 126, 8, 10, 0, 0, 6.283); x.fill(); }
    else { x.fillStyle = "#5A2430"; x.beginPath(); x.moveTo(cx - 20, 114); x.quadraticCurveTo(cx, 148, cx + 20, 114); x.closePath(); x.fill(); x.fillStyle = "#F08AA0"; x.beginPath(); x.ellipse(cx, 131, 9, 5, 0, 0, 6.283); x.fill(); x.fillStyle = "#fff"; x.fillRect(cx - 7, 114, 14, 5); }
    for (const d of [-1, 1]) {
      const ex = cx + d * 23, ey = 80;
      if (pose === "laugh") { x.strokeStyle = "#2A1A14"; x.lineWidth = 3.4; x.beginPath(); x.arc(ex, ey + 3, 6, 3.6, 5.8); x.stroke(); }
      else { const r = pose === "caught" ? 7.5 : 5.5; x.fillStyle = "#2A1A14"; x.beginPath(); x.arc(ex, ey, r, 0, 6.283); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.arc(ex - 2, ey - 2, r * 0.4, 0, 6.283); x.fill(); }
      x.strokeStyle = "#2B3A44"; x.lineWidth = 4; x.beginPath(); x.arc(ex, ey, 16, 0, 6.283); x.stroke();
      x.fillStyle = "rgba(200,235,255,0.25)"; x.beginPath(); x.arc(ex, ey, 14, 0, 6.283); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.75)"; x.lineWidth = 2.4; x.beginPath(); x.arc(ex, ey, 11, 3.6, 4.4); x.stroke();
    }
    x.strokeStyle = "#2B3A44"; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - 7, 78); x.quadraticCurveTo(cx, 73, cx + 7, 78); x.stroke();
    if (pose === "laugh") { x.fillStyle = "rgba(140,210,255,0.85)"; for (const d of [-1, 1]) { x.beginPath(); x.ellipse(cx + d * 42, 88, 4, 6, 0, 0, 6.283); x.fill(); } }
    if (pose === "caught") { x.fillStyle = "rgba(255,120,140,0.4)"; for (const d of [-1, 1]) { x.beginPath(); x.ellipse(cx + d * 40, 104, 9, 5, 0, 0, 6.283); x.fill(); } }
    // casc d'obra
    const hat = c => { c.beginPath(); c.moveTo(cx - 46, 54); c.bezierCurveTo(cx - 46, 6, cx + 46, 6, cx + 46, 54); c.closePath(); };
    x.save(); x.shadowColor = "rgba(0,0,0,0.3)"; x.shadowBlur = 6; x.shadowOffsetY = 3; x.fillStyle = "#F5C02E"; hat(x); x.fill(); x.restore();
    x.save(); hat(x); x.clip(); const hg = x.createRadialGradient(cx - 14, 16, 2, cx, 32, 54); hg.addColorStop(0, "rgba(255,255,255,0.65)"); hg.addColorStop(0.4, "rgba(255,255,255,0)"); hg.addColorStop(1, "rgba(150,90,0,0.35)"); x.fillStyle = hg; x.fillRect(0, 0, 160, 60); x.restore();
    x.fillStyle = "#E8A91E"; rr(x, cx - 6, 9, 12, 45, 5); x.fill();
    x.fillStyle = "#F7C83C"; rr(x, cx - 58, 50, 116, 12, 5); x.fill(); x.fillStyle = "rgba(150,90,0,0.35)"; x.fillRect(cx - 56, 58, 112, 3);
  });
  const pawSprite = () => Sprites.get("g19paw", 40, 34, x => { Mat.felt(x, c => { c.beginPath(); c.ellipse(20, 17, 16, 12, 0, 0, 6.283); }, "#E9CDB8", { stitch: false }); x.strokeStyle = "rgba(120,80,60,0.6)"; x.lineWidth = 2; for (const d of [-6, 0, 6]) { x.beginPath(); x.moveTo(20 + d, 8); x.lineTo(20 + d, 14); x.stroke(); } });
  const flowerSprite = i => Sprites.get("g19fl" + i, 70, 70, (x) => {
    const col = ["#F28DB2", "#FFE15A", "#FFFFFF", "#B9A4F2", "#FF9F5A", "#7FD0F0"][i];
    for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; Mat.felt(x, c => { c.beginPath(); c.ellipse(35 + Math.cos(a) * 16, 35 + Math.sin(a) * 16, 12, 9, a, 0, 6.283); }, col, { stitch: false }); }
    x.save(); x.shadowColor = "rgba(0,0,0,0.3)"; x.shadowBlur = 3; x.shadowOffsetY = 1; x.fillStyle = "#C88A2E"; x.beginPath(); x.arc(35, 35, 10, 0, 6.283); x.fill(); x.restore();
    x.fillStyle = "#6B4318"; for (const [a, b] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) { x.beginPath(); x.arc(35 + a, 35 + b, 1.6, 0, 6.283); x.fill(); }
  });

  const PLATE_DY = 160, RISE = 224;
  function drawMole(ctx, hx, hy, s, rise, pose, o = {}) {
    const top = hy + 26 * s - RISE * s * rise, M = moleSprite(pose);
    ctx.save(); ctx.beginPath(); ctx.rect(hx - 90 * s, hy - 300 * s, 180 * s, 300 * s); ctx.ellipse(hx, hy, 45 * s, 21 * s, 0, 0, 6.283); ctx.clip();
    const sq = o.sq || 0;
    ctx.translate(hx, top + 120 * s); ctx.scale(s * (1 + sq * 0.06), s * (1 - sq * 0.06)); ctx.drawImage(M.c, -80, -120, 160, 240);
    ctx.restore();
    const L = lipSprite(s); ctx.drawImage(L.c, hx - 80, hy - 30, 160, 80);
    return top;
  }
  /* placa de la lletra que el talp aguanta amb les potes */
  function molePlate(ctx, m, top, str, o) {
    const s = m.s, py = top + PLATE_DY * s;
    drawPlate(ctx, str, m.x, py, o);
    const P = pawSprite(); ctx.save(); ctx.globalAlpha *= o.alpha; for (const d of [-1, 1]) ctx.drawImage(P.c, m.x + d * 47 * s - 20 * s, py + 6 * s, 40 * s, 34 * s); ctx.restore();
  }

  Games.register({
    id: 19, key: "h", name: "Talps del teclat", zone: "camp", music: "band", keyboard: false, missAt: [800, 806], captionY: 150, demoTime: 9,
    collect: { one: "casc", many: "cascos" },
    goal: l => l <= 2 ? `Quan surti un talp, prem la tecla que és al mateix lloc del teclat. Atrapa'n ${GOALS[l]} en un minut!` : l <= 4 ? `Els forats són com les tecles: prem la tecla del lloc d'on surt el talp. Atrapa'n ${GOALS[l]} en un minut!` : `Surten uns quants talps que formen una paraula: atrapa'ls en ordre. Atrapa'n ${GOALS[l]} en un minut!`,
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const B = bgSprite(new Set(LETTERKEYS.filter(k => k !== "ñ")), "all");
      const p = holePos("h"), sw = 420, sh = 300, s = Math.max(w / sw, h / sh), cx = p.x, cy = p.y - 70; // tros del prat al voltant del forat de la h
      ctx.drawImage(B.c, (cx - sw / 2) * 2, (cy - sh / 2) * 2, sw * 2, sh * 2, x + w / 2 - sw * s / 2, y + h / 2 - sh * s / 2, sw * s, sh * s);
      ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-cx, -cy);
      const top = drawMole(ctx, p.x, p.y, p.s, 1, "idle", { sq: Math.max(0, Math.sin(t * 3)) * 0.6 });
      molePlate(ctx, p, top, "h", { size: 64, alpha: 1, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, demo = api.demo, goal = GOALS[L];
      const letters = L === 1 ? LETTERS[1] : L === 2 ? LETTERS[2] : LETTERS[3];
      const open = new Set(L <= 2 ? letters : LETTERKEYS.filter(k => k !== "ñ"));
      const bgKey = L <= 2 ? "l" + L : "all";
      const pool = L <= 4 ? api.pool({ items: letters }) : api.pool({ items: L === 5 ? W5 : W6 });
      const moles = [], marks = [], flowers = [];
      let caught = 0, timeLeft = TIME, popT = 0.3, streak = 0, word = null, wordIdx = 0, over = false, endT = 0, wordBounce = 0;
      api.hud.progress = [0, goal]; api.hud.timer = TIME;
      const stay = () => (L <= 2 ? 6.5 : L <= 4 ? 5.5 : 10) / api.speed * (demo ? 2 : 1);
      function freeHoles() { const busy = new Set(moles.filter(m => m.state !== "gone").map(m => m.k)); return [...open].filter(k => !busy.has(k)); }
      function popOne() {
        const busy = moles.filter(m => m.state !== "gone").map(m => m.k);
        let k = pool.next(busy); if (busy.includes(k)) return;
        const p = holePos(k); moles.push({ k, p, rise: 0, t: 0, state: "up", life: stay(), pose: "idle", sq: 0, plateA: 1 });
        Sfx.play("pop");
      }
      function popWord() {
        word = pool.next(); wordIdx = 0; wordBounce = 1;
        word.split("").forEach((k, i) => { const p = holePos(k); moles.push({ k, p, rise: 0, t: -i * 0.12, state: "up", life: stay(), pose: "idle", sq: 0, plateA: 1, wi: i }); });
        Sfx.play("pop"); api.sayItem(word, "{x}"); api.clearCaption(); // el rètol ja mostra la paraula
      }
      function wordMoles() { return moles.filter(m => m.wi != null && m.state !== "gone"); }
      function target() {
        if (over) return null;
        if (L >= 5) { const m = wordMoles().find(m => m.wi === wordIdx && m.state === "up"); return m || null; }
        let best = null; for (const m of moles) if (m.state === "up" && m.rise > 0.15 && (!best || m.t > best.t)) best = m; return best;
      }
      function bloom() {
        for (let n = 0; n < 3 && flowers.length < 46; n++) {
          let fx = 0, fy = 0;
          for (let tries = 0; tries < 20; tries++) { fx = rand(40, 1560); fy = pick([rand(268, 300), rand(410, 432), rand(560, 582), rand(700, 735)]); if (LETTERKEYS.every(k => { const p = holePos(k); return Math.abs(p.x - fx) > 70 || Math.abs(p.y - fy) > 40; })) break; }
          flowers.push({ x: fx, y: fy, i: randi(0, 5), t: -n * 0.12, s: rand(0.7, 1.05) });
        }
        Sfx.play("sprout");
      }
      function catchMole(m) {
        m.state = "caught"; m.pose = "caught"; m.t = 0; m.sq = 1; caught++; streak++;
        api.hud.progress = [caught, goal]; api.hit({ sfx: "boing" });
        api.particles.emit(m.p.x, m.p.y - 120, { count: 12, color: ["#FFE15A", "#FFFFFF", "#F5C02E"], shape: "star", speed: 280, gravity: 300, size: 13, life: 0.7 });
        if (streak % 4 === 0) bloom();
        if (caught >= goal) { over = true; endT = 0; }
      }
      return {
        expected() { const m = target(); return m ? m.k : null; },
        onKey(k) {
          if (over || k.length !== 1) return;
          const tg = target();
          if (L >= 5) {
            if (!tg) return;
            if (k === tg.k) { catchMole(tg); wordIdx++; if (wordIdx >= word.length) { word = null; popT = 0.7; } return; }
          } else {
            const m = moles.find(m => m.state === "up" && m.rise > 0.15 && m.k === k);
            if (m) { catchMole(m); popT = Math.min(popT, 0.35); return; }
            if (!tg) return;
          }
          // error: el talp fa ganyota i riu; marquem al prat el forat de cada tecla
          streak = 0;
          api.miss(tg.k, k, { sfx: "boing" });
          Sfx.play("miss");
          tg.pose = "laugh"; tg.poseT = 1.6; tg.sq = 1;
          marks.length = 0; marks.push({ k: tg.k, ok: true, t0: App.t }); if (KB_POS[k]) marks.push({ k, ok: false, t0: App.t });
        },
        update(dt) {
          if (!over) { timeLeft -= dt; api.hud.timer = Math.max(0, timeLeft); }
          if (!over && timeLeft <= 0) { over = true; endT = 0; }
          // aparicions
          if (!over) {
            if (L >= 5) { if (!word && wordMoles().length === 0) { popT -= dt; if (popT <= 0) popWord(); } }
            else {
              const up = moles.filter(m => m.state === "up").length, maxUp = L <= 2 ? 1 : 2;
              popT -= dt * api.speed;
              if ((up === 0 && popT <= 0) || (up > 0 && up < maxUp && popT <= -1.8)) { popOne(); popT = 0.6; }
            }
          }
          for (let i = moles.length - 1; i >= 0; i--) {
            const m = moles[i]; m.t += dt; m.sq = Math.max(0, m.sq - dt * 3);
            if (m.poseT) { m.poseT -= dt; if (m.poseT <= 0) { m.poseT = 0; if (m.state === "up") m.pose = "idle"; } }
            if (m.state === "up") {
              m.rise = m.t < 0 ? 0 : Ease.outBack(clamp(m.t / 0.32, 0, 1));
              if (L === 4) m.plateA = clamp(1 - (m.t - 0.82) / 0.18, 0, 1); // la placa només es veu mig segon
              if (m.t > m.life && !over) { m.state = "down"; m.t = 0; if (m.wi != null) { word = null; popT = 0.8; wordMoles().forEach(o => { if (o.state === "up") { o.state = "down"; o.t = 0; } }); } }
            } else if (m.state === "caught") { m.rise = m.t < 0.28 ? 1 + Math.sin(m.t / 0.28 * Math.PI) * 0.06 : 1 - Ease.inCubic(clamp((m.t - 0.28) / 0.25, 0, 1)); if (m.t > 0.55) m.state = "gone"; }
            else if (m.state === "down") { m.rise = 1 - Ease.inCubic(clamp(m.t / 0.3, 0, 1)); if (m.t > 0.32) m.state = "gone"; }
            if (m.state === "gone") moles.splice(i, 1);
          }
          if (over) {
            endT += dt;
            moles.forEach(m => { if (m.state === "up") { m.state = "down"; m.t = 0; } });
            if (endT > 1.2 && !this.fin) { this.fin = 1; api.finish(caught >= goal, { collectName: "un casc nou per als talps" }); }
          }
          for (const f of flowers) f.t += dt;
          wordBounce = Math.max(0, wordBounce - dt * 2.5);
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bgSprite(open, bgKey).c, 0, 0, W, H);
          for (const f of flowers) { if (f.t < 0) continue; const k = Ease.outBack(clamp(f.t / 0.5, 0, 1)) * f.s; Sprites.draw(ctx, flowerSprite(f.i), f.x, f.y, { s: k, rot: Math.sin(t * 1.2 + f.x) * 0.08 }); }
          // marques d'error al prat (sota els talps)
          for (let i = marks.length - 1; i >= 0; i--) { marks[i].t = App.t - marks[i].t0; if (marks[i].t > 2.2) marks.splice(i, 1); }
          for (const mk of marks) {
            const p = holePos(mk.k); if (!p) continue;
            const a = clamp(Math.min(mk.t * 5, (2.2 - mk.t) * 3), 0, 1), pulse = 1 + Math.sin(mk.t * 6) * 0.06;
            ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 7; ctx.strokeStyle = mk.ok ? "#2FBF7E" : UI.coral; ctx.setLineDash(mk.ok ? [] : [14, 8]);
            ctx.beginPath(); ctx.ellipse(p.x, p.y, 74 * p.s * pulse, 38 * p.s * pulse, 0, 0, 6.283); ctx.stroke(); ctx.restore();
          }
          // talps, fila a fila (la de dalt primer)
          const order = moles.slice().sort((a, b) => a.p.y - b.p.y || a.p.x - b.p.x);
          for (const m of order) {
            const top = drawMole(ctx, m.p.x, m.p.y, m.p.s, Math.max(0, m.rise), m.pose, { sq: m.sq });
            const pa = clamp((m.rise - 0.7) / 0.3, 0, 1) * m.plateA;
            if (pa > 0.01 && m.state !== "caught") {
              const st = L >= 5 ? (m.wi === wordIdx ? "active" : m.wi < wordIdx ? "ok" : null) : null;
              molePlate(ctx, m.p, top, m.k, { size: 64, alpha: pa, state: st, shadowBlur: 6 });
            }
          }
          // etiqueta dels forats marcats
          for (const mk of marks) {
            const p = holePos(mk.k); if (!p || mk.t > 2.1) continue;
            const a = clamp(Math.min(mk.t * 5, (2.2 - mk.t) * 3), 0, 1);
            const lbl = mk.ok ? "aquí" : "has premut", ly = p.y + 44 * p.s;
            ctx.save(); ctx.globalAlpha = a; ctx.font = `800 22px ${FONT_T}`; const tw = ctx.measureText(lbl).width + 26;
            rr(ctx, p.x - tw / 2, ly - 15, tw, 30, 15); ctx.fillStyle = mk.ok ? "#1F8A5B" : UI.coralDark; ctx.fill();
            text(ctx, lbl, p.x, ly + 1, { size: 22, weight: 800, font: FONT_T, color: "#fff" }); ctx.restore();
          }
          // paraula (nivells 5 i 6): rètol de feltre a dalt
          if (L >= 5 && word) {
            const ps = plateSize(ctx, word, 64), bw = ps.w + 44, by = 132 - wordBounce * 10;
            ctx.save(); ctx.shadowColor = "rgba(20,40,10,0.35)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5; rr(ctx, 800 - bw / 2, by - 54, bw, 108, 22); ctx.fillStyle = "#C46A4A"; ctx.fill(); ctx.restore();
            ctx.save(); rr(ctx, 800 - bw / 2, by - 54, bw, 108, 22); ctx.clip(); ctx.globalCompositeOperation = "multiply"; ctx.fillStyle = ctx.createPattern(Tex.felt(128, 128, "#d0d0d0", { seed: 41 }), "repeat"); ctx.fillRect(800 - bw / 2, by - 54, bw, 108); ctx.restore();
            ctx.save(); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.6; ctx.strokeStyle = "rgba(255,240,220,0.8)"; rr(ctx, 800 - bw / 2 + 7, by - 47, bw - 14, 94, 16); ctx.stroke(); ctx.restore();
            drawPlate(ctx, word, 800, by, { size: 64, progress: wordIdx, shadowBlur: 4 });
          }
          drawVignette(ctx, 0.2, "10,40,10");
        },
      };
    },
  });
})();
