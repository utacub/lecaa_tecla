"use strict";
/* 15. Constel·lacions — cianotípia: blau de Prússia, traços blancs i tinta daurada */
(() => {
  const GOLD = "#F4C95A", GOLD_HI = "#FFE7A6", CHALK = "rgba(235,242,255,";
  /* figures dibuixades amb traços en una capsa de 0 a 100. El primer traç és el contorn (hi van les estrelles). */
  const FIG = {
    gat: { name: "el Gat", move: "walk", legend: "El Gat vigila el cel mentre tothom dorm.", strokes: [
      { c: 1, p: [[30, 95], [25, 72], [27, 52], [35, 36], [42, 23], [40, 8], [50, 18], [58, 8], [61, 23], [65, 33], [61, 43], [55, 47], [60, 62], [62, 80], [66, 95]] },
      { p: [[30, 93], [16, 91], [8, 80], [14, 70]] }, { p: [[52, 27], [54, 29]] }, { p: [[62, 36], [74, 34]] }, { p: [[62, 38], [73, 41]] }, { p: [[48, 95], [48, 82]] }] },
    peix: { name: "el Peix", move: "swim", legend: "El Peix neda pel riu de la Via Làctia.", strokes: [
      { c: 1, p: [[90, 50], [73, 36], [53, 31], [35, 37], [21, 48], [6, 34], [10, 50], [6, 66], [21, 52], [35, 63], [53, 69], [73, 64]] },
      { p: [[77, 45], [79, 47]] }, { p: [[66, 40], [63, 50], [66, 60]] }, { p: [[44, 33], [52, 18], [62, 33]] }, { p: [[46, 50], [52, 46], [56, 52]] }] },
    ocell: { name: "l'Ocell", move: "fly", legend: "L'Ocell porta la primera llum del matí.", strokes: [
      { c: 1, p: [[94, 40], [81, 35], [73, 27], [62, 30], [56, 42], [36, 47], [12, 38], [15, 52], [30, 61], [50, 68], [68, 62], [79, 47]] },
      { p: [[74, 34], [76, 36]] }, { p: [[38, 50], [55, 45], [62, 57], [44, 60]] }, { p: [[50, 68], [48, 84]] }, { p: [[60, 66], [60, 84]] }] },
    cargol: { name: "el Cargol", move: "walk", legend: "El Cargol va tan a poc a poc que només es mou una nit cada any.", strokes: [
      { c: 1, p: [[8, 82], [34, 83], [60, 83], [82, 80], [90, 70], [88, 58], [80, 62], [72, 70], [70, 54], [62, 36], [45, 28], [28, 35], [20, 52], [24, 68], [14, 76]] },
      { p: [[45, 55], [52, 52], [52, 44], [44, 40], [36, 46], [36, 58], [46, 64], [58, 60]] }, { p: [[88, 58], [84, 42]] }, { p: [[90, 60], [97, 46]] }] },
    conill: { name: "el Conill", move: "hop", legend: "El Conill salta d'estrella en estrella buscant pastanagues.", strokes: [
      { c: 1, p: [[25, 90], [18, 72], [22, 56], [35, 46], [50, 43], [58, 34], [54, 18], [52, 4], [61, 14], [63, 28], [66, 6], [71, 11], [69, 29], [77, 37], [81, 43], [73, 49], [64, 53], [66, 71], [70, 90]] },
      { p: [[16, 78], [10, 74], [12, 84], [17, 80]] }, { p: [[69, 37], [71, 39]] }, { p: [[46, 90], [46, 78]] }] },
    balena: { name: "la Balena", move: "swim", legend: "La Balena canta i les estrelles l'escolten.", strokes: [
      { c: 1, p: [[93, 56], [89, 40], [73, 32], [50, 32], [30, 38], [18, 45], [7, 31], [12, 48], [6, 61], [20, 55], [36, 65], [60, 71], [82, 67]] },
      { p: [[79, 50], [81, 52]] }, { p: [[93, 57], [72, 60]] }, { p: [[70, 30], [68, 16]] }, { p: [[70, 30], [78, 19]] }, { p: [[70, 30], [61, 20]] }] },
    lleó: { name: "el Lleó", move: "walk", legend: "El Lleó dorm sota la lluna i somnia amb el sol.", strokes: [
      { c: 1, p: [[15, 86], [12, 60], [22, 46], [55, 42], [61, 28], [72, 17], [86, 23], [93, 38], [88, 53], [78, 59], [73, 70], [75, 88], [62, 88], [60, 71], [36, 71], [31, 88]] },
      { p: [[13, 55], [4, 45], [6, 36]] }, { p: [[78, 30], [72, 37], [76, 46], [85, 45], [87, 36], [82, 30], [78, 30]] }, { p: [[80, 35], [81, 37]] }] },
    tortuga: { name: "la Tortuga", move: "walk", legend: "La Tortuga porta el cel damunt la closca.", strokes: [
      { c: 1, p: [[12, 70], [20, 50], [38, 38], [58, 38], [75, 50], [83, 52], [92, 47], [96, 57], [86, 64], [80, 70], [78, 82], [70, 82], [68, 72], [32, 72], [30, 84], [22, 84], [20, 72], [8, 74]] },
      { p: [[30, 70], [36, 54], [48, 46], [62, 54], [68, 70]] }, { p: [[48, 46], [48, 38]] }, { p: [[36, 54], [24, 52]] }, { p: [[62, 54], [72, 50]] }, { p: [[90, 52], [91, 54]] }] },
    papallona: { name: "la Papallona", move: "fly", legend: "La Papallona escampa pols d'estrelles quan vola.", strokes: [
      { c: 1, p: [[50, 30], [60, 25], [80, 10], [95, 20], [90, 40], [70, 50], [88, 62], [85, 82], [65, 80], [50, 62], [35, 80], [15, 82], [12, 62], [30, 50], [10, 40], [5, 20], [20, 10], [40, 25]] },
      { p: [[50, 30], [50, 76]] }, { p: [[50, 30], [44, 16], [40, 12]] }, { p: [[50, 30], [56, 16], [60, 12]] }, { p: [[78, 28], [82, 32], [78, 36], [74, 32], [78, 28]] }, { p: [[22, 28], [26, 32], [22, 36], [18, 32], [22, 28]] }] },
    dofí: { name: "el Dofí", move: "swim", legend: "El Dofí salta entre les onades del cel.", strokes: [
      { c: 1, p: [[96, 53], [86, 46], [74, 38], [61, 35], [55, 20], [49, 37], [30, 44], [13, 48], [4, 37], [8, 52], [4, 65], [15, 56], [36, 62], [60, 64], [66, 74], [71, 64], [86, 58]] },
      { p: [[82, 47], [84, 49]] }, { p: [[96, 54], [84, 55]] }] },
  };
  const BY_LEVEL = {
    1: ["peix", "gat", "ocell", "balena", "dofí", "cargol"], 2: ["conill", "tortuga", "papallona", "lleó", "gat", "peix"], 3: ["balena", "cargol", "papallona", "conill", "lleó", "tortuga"],
    4: ["ocell", "dofí", "gat", "tortuga", "peix", "conill"], 5: ["gat", "peix", "ocell", "cargol", "conill", "balena", "tortuga"], 6: ["lleó", "dofí", "papallona", "tortuga", "balena", "cargol"],
  };
  const STARS_N = { 1: [5, 6], 2: [6, 7], 3: [7, 8], 4: [6, 7] };
  const PER_ROUND = 3;
  const AREA = [390, 250, 820, 430];

  /* ---------- geometria: Catmull-Rom suau i mostreig per longitud ---------- */
  function smooth(pts, closed, n = 8) {
    const out = [], N = pts.length, P = i => closed ? pts[(i + N) % N] : pts[clamp(i, 0, N - 1)];
    const segs = closed ? N : N - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
    }
    out.push(closed ? out[0] : pts[N - 1]);
    return out;
  }
  function polyLen(pts) { let L = 0; const cum = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cum.push(L); } return { L, cum }; }
  function sampleAt(pts, cum, d) { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const k = (d - cum[i - 1]) / Math.max(0.0001, cum[i] - cum[i - 1]); return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)]; }
  /* prepara una figura a la pantalla: traços suavitzats, longituds i N estrelles al contorn */
  function layout(id, nStars, area = AREA) {
    const F = FIG[id]; let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    F.strokes.forEach(s => s.p.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
    const sc = Math.min(area[2] / (x1 - x0), area[3] / (y1 - y0)), ox = area[0] + area[2] / 2 - (x0 + x1) / 2 * sc, oy = area[1] + area[3] / 2 - (y0 + y1) / 2 * sc;
    const T = ([x, y]) => [ox + x * sc, oy + y * sc];
    const strokes = F.strokes.map(s => { const sp = smooth(s.p.map(T), !!s.c); const m = polyLen(sp); return { pts: sp, L: m.L, cum: m.cum, closed: !!s.c }; });
    const ol = strokes[0], stars = [];
    for (let i = 0; i < nStars; i++) stars.push(sampleAt(ol.pts, ol.cum, ol.L * i / nStars));
    const cx = stars.reduce((a, s) => a + s[0], 0) / nStars, cy = stars.reduce((a, s) => a + s[1], 0) / nStars;
    return { id, F, strokes, stars, cx, cy, total: strokes.reduce((a, s) => a + s.L, 0) };
  }
  function strokeUpTo(ctx, st, len) {
    ctx.beginPath(); ctx.moveTo(st.pts[0][0], st.pts[0][1]);
    for (let i = 1; i < st.pts.length; i++) { if (st.cum[i] <= len) ctx.lineTo(st.pts[i][0], st.pts[i][1]); else { const p = sampleAt(st.pts, st.cum, len); ctx.lineTo(p[0], p[1]); break; } }
  }
  /* figura d'or: k = 0..1 de traç dibuixat */
  function drawFigure(ctx, lay, k, o = {}) {
    let left = lay.total * k;
    ctx.save(); ctx.lineCap = ctx.lineJoin = "round";
    for (const pass of [0, 1, 2]) {
      let rem = left;
      ctx.strokeStyle = pass === 0 ? "rgba(244,201,90,0.16)" : pass === 1 ? "rgba(244,201,90,0.85)" : "rgba(255,240,200,0.9)";
      ctx.lineWidth = (pass === 0 ? 16 : pass === 1 ? 5 : 1.6) * (o.lw || 1);
      for (const st of lay.strokes) { if (rem <= 0) break; strokeUpTo(ctx, st, Math.min(rem, st.L)); ctx.stroke(); rem -= st.L; }
    }
    // la ploma que dibuixa
    if (k > 0 && k < 1 && o.pen !== false) { let rem = left; for (const st of lay.strokes) { if (rem <= st.L) { const p = sampleAt(st.pts, st.cum, rem); const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 26); g.addColorStop(0, "rgba(255,246,214,1)"); g.addColorStop(1, "rgba(255,220,140,0)"); ctx.fillStyle = g; ctx.fillRect(p[0] - 26, p[1] - 26, 52, 52); break; } rem -= st.L; } }
    ctx.restore();
  }

  /* ---------- fons de cianotípia ---------- */
  function chart() {
    return Tex.get("g15chart", () => {
      const c = makeCanvas(W, H), x = c.getContext("2d"), R = mulberry32(15);
      if(Art.get("stars-bg")){x.drawImage(Art.get("stars-bg"),0,0,W,H);return c;}
      const g = x.createRadialGradient(W * 0.45, H * 0.4, 100, W / 2, H / 2, 1000); g.addColorStop(0, "#1C4C8C"); g.addColorStop(0.6, "#133A72"); g.addColorStop(1, "#0B2552"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // pigment desigual de la cianotípia
      const n = makeNoise(21), blot = Tex.pixels(400, 225, (i, j) => { const v = 128 + (n.fbm(i / 40, j / 40, 4) - 0.5) * 120; return [v, v, v, 255]; });
      x.save(); x.globalCompositeOperation = "soft-light"; x.globalAlpha = 0.6; x.drawImage(blot, 0, 0, W, H); x.restore();
      // planisferi: cercles de declinació i meridians que surten del pol
      const px = W * 0.5, py = -380; x.strokeStyle = CHALK + "0.16)"; x.lineWidth = 1.4;
      for (let r = 500; r < 1700; r += 140) { x.beginPath(); x.arc(px, py, r, 0, Math.PI); x.stroke(); }
      for (let a = 0.15; a < Math.PI; a += 0.13) { x.beginPath(); x.moveTo(px + Math.cos(a) * 500, py + Math.sin(a) * 500); x.lineTo(px + Math.cos(a) * 1800, py + Math.sin(a) * 1800); x.stroke(); }
      // eclíptica de punts
      x.setLineDash([3, 9]); x.strokeStyle = CHALK + "0.4)"; x.lineWidth = 2; x.beginPath(); for (let i = -20; i <= W + 20; i += 10) { const yy = 520 + Math.sin(i / 260) * 140; if (i === -20) x.moveTo(i, yy); else x.lineTo(i, yy); } x.stroke(); x.setLineDash([]);
      // marc doble amb graus
      x.strokeStyle = CHALK + "0.55)"; x.lineWidth = 2; x.strokeRect(18, 18, W - 36, H - 36); x.lineWidth = 1; x.strokeRect(30, 30, W - 60, H - 60);
      for (let i = 30; i < W - 30; i += 20) { const L = i % 100 === 30 ? 10 : 5; x.beginPath(); x.moveTo(i, 30); x.lineTo(i, 30 + L); x.moveTo(i, H - 30); x.lineTo(i, H - 30 - L); x.stroke(); }
      for (let j = 30; j < H - 30; j += 20) { const L = j % 100 === 30 ? 10 : 5; x.beginPath(); x.moveTo(30, j); x.lineTo(30 + L, j); x.moveTo(W - 30, j); x.lineTo(W - 30 - L, j); x.stroke(); }
      // rosa dels vents
      x.save(); x.translate(120, 780); x.strokeStyle = CHALK + "0.5)"; x.fillStyle = CHALK + "0.12)"; x.lineWidth = 1.5;
      x.beginPath(); x.arc(0, 0, 54, 0, 6.28); x.stroke(); x.beginPath(); x.arc(0, 0, 44, 0, 6.28); x.stroke();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, L = i % 2 ? 34 : 62; x.beginPath(); x.moveTo(Math.cos(a) * L, Math.sin(a) * L); x.lineTo(Math.cos(a + 0.5) * 9, Math.sin(a + 0.5) * 9); x.lineTo(0, 0); x.closePath(); x.fill(); x.stroke(); }
      x.font = `800 18px ${FONT_T}`; x.fillStyle = CHALK + "0.7)"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("N", 0, -76);
      x.restore();
      // estrelles de fons (blanques, de mides diferents)
      for (let k = 0; k < 420; k++) { const sx = R() * W, sy = R() * H, s = Math.pow(R(), 4) * 2.6 + 0.5; x.fillStyle = CHALK + (0.35 + R() * 0.5) + ")"; x.beginPath(); x.arc(sx, sy, s, 0, 6.28); x.fill(); if (s > 2.2) { x.strokeStyle = CHALK + "0.4)"; x.lineWidth = 1; x.beginPath(); x.moveTo(sx - s * 4, sy); x.lineTo(sx + s * 4, sy); x.moveTo(sx, sy - s * 4); x.lineTo(sx, sy + s * 4); x.stroke(); } }
      // gra del paper i fibres clares
      x.globalCompositeOperation = "soft-light"; x.globalAlpha = 0.55; x.fillStyle = x.createPattern(Tex.grain(256, 70, 15), "repeat"); x.fillRect(0, 0, W, H);
      x.globalCompositeOperation = "source-over"; x.globalAlpha = 1; x.strokeStyle = CHALK + "0.06)"; x.lineWidth = 0.8;
      for (let k = 0; k < 900; k++) { const fx = R() * W, fy = R() * H, a = R() * 6.28, L = 6 + R() * 20; x.beginPath(); x.moveTo(fx, fy); x.quadraticCurveTo(fx + Math.cos(a + 0.6) * L / 2, fy + Math.sin(a + 0.6) * L / 2, fx + Math.cos(a) * L, fy + Math.sin(a) * L); x.stroke(); }
      const v = x.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.65); v.addColorStop(0, "rgba(5,15,40,0)"); v.addColorStop(1, "rgba(5,15,40,0.5)"); x.fillStyle = v; x.fillRect(0, 0, W, H);
      return c;
    });
  }
  function starSprite(lit) {
    return Sprites.get("g15star" + (lit ? "L" : ""), 90, 90, (x, w, h) => {
      const g = x.createRadialGradient(45, 45, 0, 45, 45, 44); g.addColorStop(0, lit ? "rgba(255,232,160,0.9)" : "rgba(220,235,255,0.75)"); g.addColorStop(0.25, lit ? "rgba(255,210,110,0.35)" : "rgba(200,220,255,0.22)"); g.addColorStop(1, "rgba(200,220,255,0)"); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = lit ? "#FFF3CC" : "#FFFFFF"; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 4 : 18; x.lineTo(45 + Math.cos(a) * r, 45 + Math.sin(a) * r); } x.closePath(); x.fill();
      x.beginPath(); x.arc(45, 45, 5, 0, 6.28); x.fill();
    });
  }
  function drawComet(ctx, x, y, ang, t) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, -120, 0); g.addColorStop(0, "rgba(255,236,170,0.85)"); g.addColorStop(1, "rgba(255,236,170,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -9); ctx.quadraticCurveTo(-60, -4, -120, 0); ctx.quadraticCurveTo(-60, 4, 0, 9); ctx.closePath(); ctx.fill();
    ctx.rotate(t * 1.2); ctx.fillStyle = "#FFF6D8"; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5, r = i % 2 ? 6 : 15; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  Games.register({
    id: 15, key: "e", name: "Constel·lacions", zone: "muntanya", music: "celesta", demoTime: 11, captionY: 118, missAt: [800, 300],
    collect: { one: "constel·lació", many: "constel·lacions" },
    goal: l => l <= 3 ? "Escriu la lletra de l'estrella que assenyala l'estel guia. Uneix-les i descobreix 3 animals al cel." : l === 4 ? "Escriu la síl·laba de l'estrella que assenyala l'estel guia. Descobreix 3 animals al cel." : "Les estrelles formen el nom de l'animal. Escriu-les en ordre i descobreix 3 animals al cel.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      ctx.drawImage(chart(), 300, 150, 1000, 1000 * h / w, 0, 0, w, h);
      const s = Math.max(w / 320, h / 220); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      const lay = Tex.get("g15thumbLay", () => layout("peix", 6, [-120, -70, 200, 130]));
      ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = "rgba(244,201,90,0.25)"; ctx.lineWidth = 9; ctx.beginPath(); lay.stars.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke(); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
      lay.stars.forEach((p, i) => Sprites.draw(ctx, starSprite(true), p[0], p[1], { s: 0.55 + 0.05 * Math.sin(t * 2 + i) }));
      drawPlate(ctx, "e", 70, -40, { size: 56, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, pool = L <= 4 ? api.pool({}) : null;
      const order = shuffle(BY_LEVEL[L]).slice(0, PER_ROUND);
      const fs = L === 4 ? 50 : 64;
      let ci = -1, con = null, guide = { x: -100, y: 200, tx: 200, ty: 200, a: 0 }, done = 0, finished = false, trail = [];
      const lit = [];
      function newConstellation() {
        ci++; const id = order[ci];
        const names = L >= 5 ? id.split("") : null;
        const n = names ? names.length : randi(STARS_N[L][0], STARS_N[L][1]);
        const lay = layout(id, n);
        const texts = names || (L <= 3 ? pool.many(Math.min(n, pool.items.length)) : pool.many(n));
        while (texts.length < n) texts.push(pool.next(texts.slice(-2)));
        const stars = lay.stars.map((p, i) => {
          const dx = p[0] - lay.cx, dy = p[1] - lay.cy, dl = Math.hypot(dx, dy) || 1, off = L === 4 ? 82 : 74;
          return { x: p[0], y: p[1], text: texts[i], px: clamp(p[0] + dx / dl * off, 90, W - 90), py: clamp(p[1] + dy / dl * off, 196, H - 70), on: false, pop: 0, blink: 0, appear: -i * 0.12 };
        });
        con = { lay, stars, cur: 0, typed: 0, lines: [], phase: "intro", t: 0, walk: 0 };
        api.hud.progress = [done, PER_ROUND];
      }
      newConstellation();
      function target() { return con && (con.phase === "play" || con.phase === "intro") && con.stars[con.cur]?.appear > 0.3 ? con.stars[con.cur] : null; }
      return {
        expected() { const s = target(); return s ? s.text[con.typed] : null; },
        onKey(k) {
          const s = target(); if (!s || k.length !== 1) return;
          const ch = s.text[con.typed];
          if (k === ch) {
            con.typed++;
            if (con.typed >= s.text.length) {
              api.hit({ sfx: false }); Sfx.play("bell", { note: [72, 74, 76, 79, 81, 84, 86, 88, 91][con.cur % 9] });
              s.on = true; s.pop = 1;
              if (con.cur > 0) con.lines.push({ a: con.cur - 1, b: con.cur, t: 0 });
              api.particles.emit(s.x, s.y, { count: 14, color: [GOLD, GOLD_HI, "#FFFFFF"], shape: "star", size: 9, speed: 160, gravity: 0, life: 0.7, glow: true });
              con.cur++; con.typed = 0;
              if (con.cur >= con.stars.length) { con.phase = "close"; con.t = 0; if (con.lay.strokes[0].closed) con.lines.push({ a: con.stars.length - 1, b: 0, t: -0.3 }); }
            } else api.hit({ sfx: "tick" });
          } else { api.miss(ch, k, { sfx: "sour" }); s.blink = 1; }
        },
        update(dt) {
          const t = api.t; con.t += dt;
          con.stars.forEach(s => { s.appear += dt * 2.2; s.pop = Math.max(0, s.pop - dt * 2); s.blink = Math.max(0, s.blink - dt * 2.2); });
          con.lines.forEach(l => l.t += dt / 0.4);
          if (con.phase === "intro" && con.t > 0.5 + con.stars.length * 0.12) con.phase = "play";
          if (con.phase === "close" && con.t > 0.6) { con.phase = "draw"; con.t = 0; Sfx.play("chime", { note: 84 }); }
          if (con.phase === "draw" && con.t > 2.0) { con.phase = "walk"; con.t = 0; void 0; }
          if (con.phase === "walk" && con.t > 3.6) {
            done++; lit.push(con.lay.id); api.hud.progress = [done, PER_ROUND];
            if (done >= PER_ROUND) { if (!finished) { finished = true; Sfx.play("win"); api.finish(true, { collectName: `${PER_ROUND} constel·lacions noves` }); } con.phase = "end"; }
            else newConstellation();
          }
          // estel guia
          const s = target() || (con.phase === "intro" ? con.stars[0] : null);
          if (s) { guide.tx = s.x - 64; guide.ty = s.y - 58; }
          else if (con.phase === "walk" || con.phase === "draw") { guide.tx = W + 200; guide.ty = 140; }
          const ox = guide.x, oy = guide.y, kk = 1 - Math.pow(0.02, dt);
          guide.x = lerp(guide.x, guide.tx + Math.sin(t * 1.4) * 8, kk); guide.y = lerp(guide.y, guide.ty + Math.cos(t * 1.8) * 6, kk);
          const vx = guide.x - ox, vy = guide.y - oy; if (Math.hypot(vx, vy) > 0.6) guide.a = Math.atan2(vy, vx); else guide.a = lerp(guide.a, Math.atan2(s ? s.y - guide.y : 0, s ? s.x - guide.x : 1), 0.05);
          if (Math.hypot(vx, vy) > 2 && trail.length < 40) trail.push({ x: guide.x, y: guide.y, l: 0 });
          for (let i = trail.length - 1; i >= 0; i--) { trail[i].l += dt; if (trail[i].l > 0.8) trail.splice(i, 1); }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(chart(), 0, 0);
          // les constel·lacions ja descobertes queden petites al planisferi (a dalt)
          lit.forEach((id, i) => { const lay = Tex.get("g15mini" + id, () => layout(id, 6, [0, 0, 120, 80])); ctx.save(); ctx.translate(1110 + i * 140, 770); ctx.globalAlpha = 0.85; drawFigure(ctx, lay, 1, { lw: 0.5, pen: false }); ctx.restore(); });
          const lay = con.lay, st = con.stars;
          // figura que es dibuixa i camina
          let wx = 0, wy = 0, wr = 0, fade = 1;
          if (con.phase === "walk") {
            const k = con.t / 3.6, mv = lay.F.move;
            wx = Ease.inCubic(k) * 1300; wy = mv === "hop" ? -Math.abs(Math.sin(k * 14)) * 50 : mv === "fly" ? Math.sin(k * 12) * 26 - k * 140 : mv === "swim" ? Math.sin(k * 10) * 22 : -Math.abs(Math.sin(k * 18)) * 14;
            wr = mv === "swim" ? Math.cos(k * 10) * 0.08 : mv === "walk" ? Math.sin(k * 18) * 0.04 : 0;
            fade = 1 - clamp((k - 0.2) / 0.5, 0, 1);
          }
          // línies daurades entre estrelles
          ctx.save(); ctx.globalAlpha = fade; ctx.lineCap = "round";
          con.lines.forEach(l => {
            const k = Ease.inOutQuad(clamp(l.t, 0, 1)); if (k <= 0) return; const A = st[l.a], B = st[l.b], ex = lerp(A.x, B.x, k), ey = lerp(A.y, B.y, k);
            ctx.strokeStyle = "rgba(244,201,90,0.22)"; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(ex, ey); ctx.stroke();
            ctx.strokeStyle = GOLD; ctx.lineWidth = 3.4; ctx.stroke();
            const sh = (t * 0.5 + l.a * 0.37) % 1; if (k >= 1) { const hx = lerp(A.x, B.x, sh), hy = lerp(A.y, B.y, sh); const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 14); g.addColorStop(0, "rgba(255,246,214,0.9)"); g.addColorStop(1, "rgba(255,246,214,0)"); ctx.fillStyle = g; ctx.fillRect(hx - 14, hy - 14, 28, 28); }
          });
          ctx.restore();
          if (con.phase === "draw" || con.phase === "walk" || con.phase === "end") {
            const k = con.phase === "draw" ? Ease.inOutQuad(clamp(con.t / 1.8, 0, 1)) : 1;
            ctx.save(); ctx.translate(lay.cx + wx, lay.cy + wy); ctx.rotate(wr); ctx.translate(-lay.cx, -lay.cy);
            drawFigure(ctx, lay, k);
            ctx.restore();
            if (con.phase === "draw" && con.t > 1.2 || con.phase === "walk") { const a = con.phase === "draw" ? clamp((con.t - 1.2) / 0.4, 0, 1) : fade; text(ctx, lay.F.name[0].toLocaleUpperCase("ca") + lay.F.name.slice(1), lay.cx + wx, Math.min(H - 60, AREA[1] + AREA[3] + 40) + wy, { size: 40, weight: 900, font: FONT_T, color: `rgba(255,236,180,${a})` }); }
          }
          // estrelles
          st.forEach((s, i) => {
            const ap = clamp(s.appear, 0, 1); if (ap <= 0) return;
            const isT = target() === s, pulse = isT ? 1 + 0.18 * Math.sin(t * 5) : 1, blink = s.blink > 0 ? (s.blink > 0.5 ? 0.35 : 1) : 1;
            ctx.save(); ctx.globalAlpha = ap * blink * (con.phase === "walk" ? fade * 0.6 + 0.4 : 1);
            if (isT) { const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 60); g.addColorStop(0, "rgba(255,236,170,0.35)"); g.addColorStop(1, "rgba(255,236,170,0)"); ctx.fillStyle = g; ctx.fillRect(s.x - 60, s.y - 60, 120, 120); }
            Sprites.draw(ctx, starSprite(s.on), s.x, s.y, { s: (s.on ? 0.9 : 0.7) * pulse * Ease.outBack(ap) + s.pop * 0.4 });
            ctx.restore();
          });
          // rastre i estel guia
          trail.forEach(p => { const a = 1 - p.l / 0.8; ctx.fillStyle = `rgba(255,236,170,${a * 0.6})`; ctx.beginPath(); ctx.arc(p.x, p.y, 3 * a + 1, 0, 6.28); ctx.fill(); });
          drawComet(ctx, guide.x, guide.y, guide.a, t);
          // plaques (sempre a sobre, rectes i nítides)
          if (con.phase === "intro" || con.phase === "play" || con.phase === "close") st.forEach((s, i) => {
            const ap = clamp(s.appear - 0.3, 0, 1); if (ap <= 0) return;
            const isT = target() === s;
            if (isT) { ctx.save(); ctx.globalAlpha = ap * 0.6; ctx.strokeStyle = "rgba(255,236,170,0.6)"; ctx.setLineDash([4, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.px, s.py); ctx.stroke(); ctx.restore(); }
            drawPlate(ctx, s.text, s.px, s.py, { size: fs, alpha: ap, progress: isT ? con.typed : 0, state: isT ? "hint" : s.on ? "ok" : null, border: isT || s.on ? null : "#7FA6D8", borderW: 3 });
          });
        },
      };
    },
  });
})();
