"use strict";
/* 18. Torre de control — aeroport vist des de dalt, cartell serigrafiat dels anys 60 */
(() => {
  const INK = "#24324A", PAPER = "#F1E6CC", TEAL = "#2F8C8A", MUST = "#E8B23A", ORANGE = "#E0613A", OLIVE = "#9DB46A", PINK = "#E99A8C", SKY = "#8FC1C4";
  const PLANE_COLS = [ORANGE, TEAL, MUST, PINK, "#5B7DB8"];
  const EC = { cx: 800, cy: 365, rx: 610, ry: 215 }; // circuit d'espera
  const RW = { x0: 110, x1: 1300, y: 570, h: 80 };   // pista
  const GATES = [910, 1008, 1105, 1203, 1300], PARK_Y = 775, GOAL = 20;

  /* ---------- fons serigrafiat (prerenderitzat) ---------- */
  function halftone() {
    return Tex.get("ctrlDots", () => { const c = makeCanvas(10, 10), x = c.getContext("2d"); x.fillStyle = rgba(INK, 0.38); x.beginPath(); x.arc(5, 5, 2.2, 0, 6.28); x.fill(); return c; });
  }
  function airportBg() {
    return Sprites.get("ctrlBg", W, H, (x) => {
      if(Art.get("airport-bg")){x.drawImage(Art.get("airport-bg"),0,0,W,H);return;}
      const outlines = [];
      const shape = (path, fill, o = {}) => { x.fillStyle = fill; x.beginPath(); path(x); x.fill(o.rule || "nonzero"); if (o.line !== false) outlines.push([path, o.lw || 3]); };
      const shadow = (path, dx = 10, dy = 12) => { x.save(); x.translate(dx, dy); x.fillStyle = x.createPattern(halftone(), "repeat"); x.beginPath(); path(x); x.fill(); x.restore(); };
      // paper i herba amb franges de segar
      x.fillStyle = OLIVE; x.fillRect(0, 0, W, H);
      x.save(); x.globalAlpha = 0.16; x.fillStyle = "#FFF6D8"; for (let k = -10; k < 30; k++) { x.beginPath(); x.moveTo(k * 90, 0); x.lineTo(k * 90 + 45, 0); x.lineTo(k * 90 + 45 - 500, H); x.lineTo(k * 90 - 500, H); x.fill(); } x.restore();
      // mar a dalt a l'esquerra
      shape(c => { c.moveTo(0, 0); c.lineTo(560, 0); c.bezierCurveTo(470, 90, 300, 70, 220, 160); c.bezierCurveTo(150, 240, 60, 230, 0, 300); c.closePath(); }, SKY);
      x.strokeStyle = rgba("#FFFFFF", 0.7); x.lineWidth = 3; for (const [wx, wy] of [[80, 60], [200, 110], [330, 40], [60, 180], [420, 70]]) { x.beginPath(); x.arc(wx, wy, 12, Math.PI * 1.1, Math.PI * 1.9); x.arc(wx + 24, wy, 12, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); }
      // camp de conreu (per als aterratges d'emergència) amb paller i graner
      const field = c => { c.moveTo(110, 668); c.lineTo(660, 650); c.lineTo(690, 880); c.lineTo(90, 890); c.closePath(); };
      shape(field, "#D9C060");
      x.save(); x.beginPath(); field(x); x.clip(); x.strokeStyle = "#BFA544"; x.lineWidth = 9; for (let k = 0; k < 16; k++) { x.beginPath(); x.moveTo(60 + k * 44, 640); x.lineTo(20 + k * 44, 900); x.stroke(); } x.restore();
      shadow(c => c.rect(560, 700, 70, 52)); shape(c => c.rect(560, 700, 70, 52), "#C8432F"); shape(c => { c.moveTo(556, 700); c.lineTo(595, 676); c.lineTo(634, 700); c.closePath(); }, "#8E2E22");
      for (const [hx, hy] of [[220, 740], [300, 800], [430, 720]]) { shadow(c => c.arc(hx, hy, 22, 0, 6.28), 6, 7); shape(c => c.arc(hx, hy, 22, 0, 6.28), MUST); x.strokeStyle = "#B88A20"; x.lineWidth = 2; x.beginPath(); x.arc(hx, hy, 12, 0, 6.28); x.stroke(); }
      // arbres arrodonits
      const R = mulberry32(18);
      const trees = [[40, 400], [70, 470], [30, 560], [1560, 160], [1520, 230], [1570, 330], [1490, 120], [900, 120], [960, 150], [700, 150], [1560, 520], [1540, 600], [760, 690], [1580, 690], [40, 640]];
      trees.forEach(([tx, ty]) => { const r = 22 + R() * 16; shadow(c => c.arc(tx, ty, r, 0, 6.28), 8, 9); shape(c => c.arc(tx, ty, r, 0, 6.28), R() < 0.5 ? "#5E8A4A" : "#4F7A44"); x.fillStyle = rgba("#FFF6D8", 0.25); x.beginPath(); x.arc(tx - r * 0.3, ty - r * 0.3, r * 0.35, 0, 6.28); x.fill(); });
      // pista principal
      const rw = c => rr(c, RW.x0, RW.y - RW.h / 2, RW.x1 - RW.x0, RW.h, 14);
      shadow(rw, 6, 8); shape(c => rw(c), "#3E4A5C");
      x.fillStyle = "#F4EEDC"; x.fillRect(RW.x0 + 10, RW.y - RW.h / 2 + 7, RW.x1 - RW.x0 - 20, 3); x.fillRect(RW.x0 + 10, RW.y + RW.h / 2 - 10, RW.x1 - RW.x0 - 20, 3);
      for (let k = RW.x0 + 150; k < RW.x1 - 150; k += 60) x.fillRect(k, RW.y - 3, 34, 6);
      for (const ex of [RW.x0 + 20, RW.x1 - 60]) for (let k = 0; k < 6; k++) x.fillRect(ex, RW.y - 34 + k * 12, 40, 6);
      for (const [nx, num, rot] of [[RW.x0 + 110, "09", -Math.PI / 2], [RW.x1 - 110, "27", Math.PI / 2]]) { x.save(); x.translate(nx, RW.y); x.rotate(rot); x.font = `900 34px ${FONT_T}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#F4EEDC"; x.fillText(num, 0, 0); x.restore(); }
      x.fillStyle = MUST; for (let k = RW.x0 + 20; k < RW.x1; k += 46) { x.beginPath(); x.arc(k, RW.y - RW.h / 2 - 8, 3.5, 0, 6.28); x.arc(k, RW.y + RW.h / 2 + 8, 3.5, 0, 6.28); x.fill(); }
      // carrer de rodatge fins a la plataforma
      const tw = c => { c.moveTo(1170, RW.y); c.lineTo(1230, RW.y); c.quadraticCurveTo(1250, RW.y, 1250, RW.y + 40); c.lineTo(1250, 668); c.lineTo(1206, 668); c.lineTo(1206, RW.y + 40); c.closePath(); };
      shape(tw, "#56627A", { line: false });
      x.strokeStyle = MUST; x.lineWidth = 3; x.setLineDash([12, 10]); x.beginPath(); x.moveTo(1180, RW.y); x.quadraticCurveTo(1228, RW.y, 1228, RW.y + 50); x.lineTo(1228, 660); x.stroke(); x.setLineDash([]);
      // plataforma i terminal
      const apron = c => rr(c, 890, 652, 640, 200, 22);
      shape(apron, "#CFC8B5");
      x.strokeStyle = MUST; x.lineWidth = 3; GATES.forEach(gx => { x.beginPath(); x.moveTo(gx, 668); x.lineTo(gx, PARK_Y + 20); x.stroke(); x.beginPath(); x.arc(gx, PARK_Y, 34, 0.2, Math.PI - 0.2); x.stroke(); });
      const term = c => rr(c, 900, 812, 620, 70, 18);
      shadow(term, 8, 10); shape(term, MUST);
      x.fillStyle = "#C8901A"; for (let k = 920; k < 1500; k += 26) x.fillRect(k, 824, 12, 46);
      GATES.forEach(gx => { shape(c => rr(c, gx - 9, 778, 18, 40, 6), "#F4EEDC"); });
      // torre de control
      const TX = 790, TY = 740;
      shadow(c => c.arc(TX, TY, 46, 0, 6.28), 12, 14);
      shape(c => c.arc(TX, TY, 46, 0, 6.28), TEAL);
      shape(c => c.arc(TX, TY, 32, 0, 6.28), "#BFE3E0");
      x.strokeStyle = INK; x.lineWidth = 3; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.28; x.beginPath(); x.moveTo(TX + Math.cos(a) * 32, TY + Math.sin(a) * 32); x.lineTo(TX + Math.cos(a) * 46, TY + Math.sin(a) * 46); x.stroke(); }
      shape(c => c.arc(TX, TY, 13, 0, 6.28), ORANGE);
      // mànega de vent
      x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.moveTo(1420, 470); x.lineTo(1420, 500); x.stroke(); shape(c => { c.moveTo(1420, 470); c.lineTo(1470, 476); c.lineTo(1468, 488); c.lineTo(1420, 484); c.closePath(); }, ORANGE);
      // traç negre desplaçat (registre lleugerament mogut)
      x.save(); x.translate(-3, -2); x.strokeStyle = rgba(INK, 0.85); x.lineJoin = "round";
      outlines.forEach(([p, lw]) => { x.lineWidth = lw; x.beginPath(); p(x); x.stroke(); }); x.restore();
      // gra de tinta i paper
      x.save(); x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.5; x.fillStyle = x.createPattern(Tex.paper(512, 512, "#EFE4C8", { seed: 61, fiber: 1.6 }), "repeat"); x.fillRect(0, 0, W, H); x.restore();
      x.save(); x.globalCompositeOperation = "overlay"; x.globalAlpha = 0.35; x.fillStyle = x.createPattern(Tex.grain(256, 70, 19), "repeat"); x.fillRect(0, 0, W, H); x.restore();
    });
  }
  /* ---------- avió de formes arrodonides, vist des de dalt (morro cap a +x) ---------- */
  function planePath(c) {
    // fuselatge
    c.moveTo(56, 0); c.bezierCurveTo(56, -11, 40, -12, 20, -12); c.lineTo(-40, -9); c.quadraticCurveTo(-56, -7, -56, 0); c.quadraticCurveTo(-56, 7, -40, 9); c.lineTo(20, 12); c.bezierCurveTo(40, 12, 56, 11, 56, 0); c.closePath();
  }
  function wingPath(c) {
    c.moveTo(14, -10); c.quadraticCurveTo(4, -50, -10, -58); c.quadraticCurveTo(-20, -60, -18, -50); c.lineTo(-12, -10); c.closePath();
    c.moveTo(14, 10); c.quadraticCurveTo(4, 50, -10, 58); c.quadraticCurveTo(-20, 60, -18, 50); c.lineTo(-12, 10); c.closePath();
    c.moveTo(-38, -7); c.quadraticCurveTo(-46, -26, -54, -27); c.quadraticCurveTo(-60, -26, -56, -7); c.closePath();
    c.moveTo(-38, 7); c.quadraticCurveTo(-46, 26, -54, 27); c.quadraticCurveTo(-60, 26, -56, 7); c.closePath();
  }
  function planeSprite(col) {
    return Sprites.get("ctrlPlane" + col, 140, 140, (x) => {
      const im=Art.cell("airport-planes",Math.max(0,PLANE_COLS.indexOf(col)),5,1,140,140);if(im){x.drawImage(im,0,0,140,140);return;}
      x.translate(70, 70);
      x.fillStyle = shade(col, -0.12); x.beginPath(); wingPath(x); x.fill();
      x.fillStyle = "#F4EEDC"; x.beginPath(); planePath(x); x.fill();
      x.fillStyle = col; x.beginPath(); x.moveTo(56, 0); x.bezierCurveTo(56, -11, 44, -12, 32, -12); x.lineTo(32, 12); x.bezierCurveTo(44, 12, 56, 11, 56, 0); x.fill(); x.fillRect(-56, -3, 70, 6);
      x.fillStyle = INK; x.beginPath(); x.ellipse(40, 0, 6, 8, 0, 0, 6.28); x.fill();
      x.fillStyle = shade(col, -0.35); for (const s of [-1, 1]) { x.beginPath(); x.ellipse(8, s * 30, 8, 5, 0, 0, 6.28); x.fill(); }
      x.save(); x.translate(-2.5, -2); x.strokeStyle = rgba(INK, 0.9); x.lineWidth = 2.5; x.lineJoin = "round"; x.beginPath(); wingPath(x); x.stroke(); x.beginPath(); planePath(x); x.stroke(); x.restore();
    });
  }
  function shadowSprite() {
    return Sprites.get("ctrlShadow", 140, 140, (x) => { x.translate(70, 70); x.fillStyle = rgba(INK, 0.28); x.beginPath(); wingPath(x); planePath(x); x.fill(); });
  }
  function drawPlaneAt(ctx, p, col) {
    const alt = p.alt, s = (0.92 + alt * 0.22) * (p.sc || 1);
    Sprites.draw(ctx, shadowSprite(), p.x + 14 + alt * 46, p.y + 18 + alt * 60, { rot: p.h, s: s * (1 - alt * 0.15) });
    Sprites.draw(ctx, planeSprite(col), p.x, p.y, { rot: p.h + (p.roll || 0), s });
  }
  function gauge(ctx, x, y, f) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = PAPER; ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 19, 0, 6.28); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = ORANGE; ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI * 0.8, Math.PI * 1.1); ctx.stroke();
    ctx.strokeStyle = TEAL; ctx.beginPath(); ctx.arc(0, 0, 13, Math.PI * 1.75, Math.PI * 2.2); ctx.stroke();
    const a = Math.PI * 0.8 + clamp(f, 0, 1) * Math.PI * 1.4;
    ctx.strokeStyle = f < 0.25 ? ORANGE : INK; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 6.28); ctx.fill();
    ctx.font = `900 10px ${FONT_T}`; ctx.textAlign = "center"; ctx.fillText("E", -10, 12); ctx.fillText("F", 10, 12);
    ctx.restore();
  }
  // corbes mostrejades com a polilínia
  function bez(p0, p1, p2, p3, n = 40) { const out = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return out; }
  function line(a, b, n = 20) { const out = []; for (let i = 0; i <= n; i++) out.push([lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); return out; }
  function poly(pts) { const L = [0]; for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + dist(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1])); return { pts, L, len: L[L.length - 1] }; }
  function at(P, d) {
    d = clamp(d, 0, P.len); let i = 1; while (i < P.L.length - 1 && P.L[i] < d) i++;
    const a = P.pts[i - 1], b = P.pts[i], k = (d - P.L[i - 1]) / Math.max(1e-6, P.L[i] - P.L[i - 1]);
    return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  const cap = capFirst;
  const RADIO = ["Autoritzat!", "Autoritzat a aterrar!", "Pista lliure. Autoritzat!", "Molt bé, autoritzat!"];
  function sfx(fn) { if (Settings.sfx && Audio2.ctx && Audio2.unlocked) try { fn(); } catch (e) { } }
  const radioClick = () => sfx(() => { noise({ f: 2200, q: 0.8, d: 0.12, v: 0.12 }); tone({ f: 1400, d: 0.06, type: "square", v: 0.04, lp: 2500, delay: 0.1 }); });

  const LV = { 1: { air: 3, gap: 5, fuel: 75, v: 62, size: 64 }, 2: { air: 3, gap: 4.6, fuel: 66, v: 66, size: 64 }, 3: { air: 4, gap: 4.2, fuel: 60, v: 70, size: 64 }, 4: { air: 3, gap: 5, fuel: 70, v: 62, size: 54 }, 5: { air: 3, gap: 6, fuel: 85, v: 58, size: 48 }, 6: { air: 3, gap: 7, fuel: 100, v: 54, size: 46 } };

  Games.register({
    id: 18, key: "r", name: "Torre de control", zone: "poble", music: "swing",
    collect: { one: "segell", many: "segells" },
    goal: l => l <= 3 ? "Escriu la lletra d'un avió per donar-li permís per aterrar. Fes aterrar 20 avions sense cap emergència." : l === 4 ? "Escriu la síl·laba de cada avió per fer-lo aterrar. Fes aterrar 20 avions sense cap emergència." : "Escriu la ciutat d'on ve cada avió per fer-lo aterrar. Fes aterrar 20 avions sense cap emergència.",
    missAt: [800, 420], captionY: 190,
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const s = Math.max(w / 460, h / 250); ctx.translate(w / 2, h / 2); ctx.scale(s, s); ctx.translate(-230, -125);
      const bg = airportBg(); ctx.drawImage(bg.c, 600 * 2, 380 * 2, 820 * 2, 440 * 2, -10, -5, 480, 260);
      const a = t * 0.7, px = 215 + Math.cos(a) * 70, py = 100 + Math.sin(a) * 40, hd = Math.atan2(Math.cos(a) * 40, -Math.sin(a) * 70);
      for (let k = 1; k < 14; k++) { const b = a - k * 0.09; ctx.fillStyle = rgba(INK, 0.5 - k * 0.03); ctx.beginPath(); ctx.arc(215 + Math.cos(b) * 70, 100 + Math.sin(b) * 40, 2.6, 0, 6.28); ctx.fill(); }
      ctx.save(); ctx.translate(px, py); ctx.scale(0.9, 0.9); drawPlaneAt(ctx, { x: 0, y: 0, h: hd, alt: 1 }, ORANGE); ctx.restore();
      drawPlate(ctx, "r", px - Math.cos(hd) * 70, py - Math.sin(hd) * 70 - 6, { size: 50, border: ORANGE, borderW: 4, shadowBlur: 0, shadowY: 3 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, cfg = LV[L], pool = api.pool({ theme: L >= 5 ? "ciutats" : undefined });
      const cityList = THEMES.ciutats[6].concat(THEMES.ciutats[5]);
      const planes = [], trails = [], puffs = [];
      const st = { spawnT: 2.2, spawned: 0, landed: 0, emerg: 0, done: 0, lastApp: -9, t: 0, colI: randi(0, 4), fin: false, endT: -1, lastCity: "Girona" };
      api.hud.progress = [0, GOAL];
      const typer = api.typer({
        targets: () => planes.filter(p => (p.state === "enter" && p.t > 0) || p.state === "circle" || p.state === "loop"),
        rank: p => p.fuel,
        onDone(p) { clearPlane(p); },
        onMiss(p) { if (p && p.state === "circle") { p.state = "loop"; p.loopT = 0; p.loopC = [p.x - Math.sin(p.h) * 70, p.y + Math.cos(p.h) * 70]; p.loopA = Math.atan2(p.y - (p.y + Math.cos(p.h) * 70), p.x - (p.x - Math.sin(p.h) * 70)); p.wrongT = 1; } },
      });
      function freeTheta() {
        const used = planes.filter(p => p.state === "circle" || p.state === "loop" || p.state === "enter").map(p => p.th);
        let best = rand(0, 6.28), bv = -1;
        for (let k = 0; k < 24; k++) { const th = k / 24 * Math.PI * 2; let m = 9; used.forEach(u => { let d = Math.abs(((th - u) % 6.283 + 6.283) % 6.283); d = Math.min(d, 6.283 - d); m = Math.min(m, d); }); if (m > bv + 0.01 || (Math.abs(m - bv) < 0.01 && Math.random() < 0.3)) { bv = m; best = th; } }
        return best;
      }
      function spawn() {
        const live = planes.filter(p => !["parked", "gone"].includes(p.state) && !p.emergency).map(p => p.text);
        const text = pool.next(live), th = freeTheta();
        const p = { text, th, state: "enter", t: 0, x: 0, y: 0, h: 0, alt: 1.6, fuel: cfg.fuel * rand(0.92, 1.08), fuelMax: cfg.fuel, col: PLANE_COLS[st.colI++ % PLANE_COLS.length], ready: false, trailD: 0, city: L >= 5 ? text : pick(cityList) };
        p.fuelMax = p.fuel; posOnEllipse(p); planes.push(p); st.spawned++;
        sfx(() => tone({ f: 180, f2: 260, d: 1.2, type: "sawtooth", v: 0.025, lp: 600, a: 0.3 }));
      }
      function posOnEllipse(p) { p.x = EC.cx + Math.cos(p.th) * EC.rx; p.y = EC.cy + Math.sin(p.th) * EC.ry; p.h = Math.atan2(Math.cos(p.th) * EC.ry, -Math.sin(p.th) * EC.rx); }
      function clearPlane(p) {
        p.state = "wait"; p.okT = 0; p.cleared = true; radioClick();
        void 0;
      }
      function startLanding(p) {
        // aproximació des d'on és fins a l'inici de la pista, toca terra, roda i va fins a una porta lliure
        const A = [RW.x0 - 120, RW.y], T = [RW.x0 + 90, RW.y], Rr = [1150, RW.y];
        const hd = [Math.cos(p.h), Math.sin(p.h)], d0 = Math.max(220, dist(p.x, p.y, A[0], A[1]) * 0.45);
        const gate = freeGate(); p.gate = gate;
        const gx = GATES[gate];
        const taxi = [[1150, RW.y], [1200, RW.y], [1228, RW.y + 10], [1228, RW.y + 60], [1228, 650], [1228, 662]];
        const tpts = poly([].concat(line([1150, RW.y], [1206, RW.y], 6), bez([1206, RW.y], [1228, RW.y], [1228, RW.y], [1228, RW.y + 40], 10), line([1228, RW.y + 40], [1228, 640], 10), bez([1228, 640], [1228, 668], [1228, 668], [gx > 1228 ? 1256 : 1200, 668], 8), line([gx > 1228 ? 1256 : 1200, 668], [gx + (gx > 1228 ? -28 : 28), 668], 12), bez([gx + (gx > 1228 ? -28 : 28), 668], [gx, 668], [gx, 668], [gx, 700], 10), line([gx, 700], [gx, PARK_Y], 6)));
        p.legs = [
          { P: poly(bez([p.x, p.y], [p.x + hd[0] * d0, p.y + hd[1] * d0], [A[0] - 260, A[1]], A, 60)), v0: 150, v1: 140, a0: 1, a1: 0.55 },
          { P: poly(line(A, T, 10)), v0: 140, v1: 130, a0: 0.55, a1: 0, touch: true },
          { P: poly(line(T, Rr, 30)), v0: 210, v1: 60, a0: 0, a1: 0 },
          { P: tpts, v0: 70, v1: 50, a0: 0, a1: 0, last: true },
        ];
        p.leg = 0; p.d = 0; p.state = "landing";
        sfx(() => tone({ f: 240, f2: 140, d: 1.6, type: "sawtooth", v: 0.03, lp: 500, a: 0.2 }));
      }
      function freeGate() {
        const busy = new Set(planes.filter(q => q.gate != null && q.state !== "gone").map(q => q.gate));
        for (let i = 0; i < GATES.length; i++) if (!busy.has(i)) return i;
        // totes ocupades: el més antic marxa
        const old = planes.filter(q => q.state === "parked").sort((a, b) => b.t - a.t)[0]; if (old) { old.state = "gone"; old.fade = 1; return old.gate; }
        return randi(0, GATES.length - 1);
      }
      function emergency(p) {
        p.state = "emerg"; p.emergency = true; p.t = 0; st.emerg++; api.hud.label = L_("Emergències: {n}", { n: st.emerg });
        const E = [rand(200, 560), rand(720, 830)];
        p.legs = [{ P: poly(bez([p.x, p.y], [p.x + Math.cos(p.h) * 200, p.y + Math.sin(p.h) * 200], [E[0] - 180, E[1] - 60], E, 50)), v0: 120, v1: 90, a0: 1, a1: 0, wobble: true }, { P: poly(line(E, [E[0] + 130, E[1] + 10], 20)), v0: 120, v1: 0, a0: 0, a1: 0, bounce: true, last: true }];
        p.leg = 0; p.d = 0;
        void 0;
        sfx(() => { tone({ f: 600, f2: 300, d: 0.5, type: "sine", v: 0.12 }); tone({ f: 450, f2: 250, d: 0.5, type: "sine", v: 0.1, delay: 0.5 }); });
      }
      function judge() {
        st.done++; api.hud.progress = [st.landed, GOAL];
        if (st.done >= GOAL && st.endT < 0) st.endT = 0;
      }
      return {
        expected() { return typer.expected(); },
        onKey(k) { typer.key(k); },
        update(dt) {
          st.t += dt;
          const air = planes.filter(p => ["enter", "circle", "loop", "wait"].includes(p.state)).length;
          st.spawnT -= dt * api.speed;
          if (st.spawned < GOAL && (air === 0 || (st.spawnT <= 0 && air < cfg.air))) { spawn(); st.spawnT = cfg.gap * rand(0.85, 1.15); }
          planes.forEach(p => {
            p.t += dt; if (p.okT != null) p.okT += dt; if (p.wrongT) p.wrongT = Math.max(0, p.wrongT - dt * 1.5);
            const airborne = ["enter", "circle", "loop", "wait"].includes(p.state);
            if (airborne && !api.demo) { p.fuel -= dt; if (p.fuel <= 0 && !p.cleared) { emergency(p); judge(); return; } }
            if (airborne) {
              const v = cfg.v * (0.85 + 0.15 * api.speed);
              if (p.state === "loop") { // fa una volta més (petit cercle fora del circuit)
                p.loopT += dt; const a = p.loopA + p.loopT / 2.4 * Math.PI * 2;
                p.x = p.loopC[0] + Math.cos(a) * 70; p.y = p.loopC[1] + Math.sin(a) * 70; p.h = a + Math.PI / 2;
                if (p.loopT >= 2.4) { p.state = "circle"; posOnEllipse(p); }
              } else {
                const sp = Math.hypot(EC.rx * Math.sin(p.th), EC.ry * Math.cos(p.th)); p.th += v * dt / sp; posOnEllipse(p);
              }
              if (p.state === "enter") { p.alt = lerp(1.6, 1, Ease.outCubic(clamp(p.t / 1.6, 0, 1))); if (p.t > 0.5) p.ready = true; if (p.t > 1.6) p.state = "circle"; }
              if (p.state === "wait" && st.t - st.lastApp > 1.7) { st.lastApp = st.t; startLanding(p); }
            }
            if (p.state === "landing" || p.state === "emerg") {
              const leg = p.legs[p.leg], k = clamp(p.d / leg.P.len, 0, 1), v = lerp(leg.v0, leg.v1, k);
              p.d += Math.max(leg.last ? 8 : 30, v) * dt;
              const [x, y, h] = at(leg.P, p.d); p.x = x; p.y = y;
              let dh = h - p.h; while (dh > Math.PI) dh -= 6.283; while (dh < -Math.PI) dh += 6.283; p.h += dh * Math.min(1, dt * 10);
              p.alt = lerp(leg.a0, leg.a1, k);
              if (leg.wobble) p.roll = Math.sin(p.t * 9) * 0.18;
              if (leg.bounce) { p.alt = Math.abs(Math.sin(k * Math.PI * 3)) * (1 - k) * 0.5; p.roll = k * 0.9; if (Math.random() < dt * 8) puffs.push({ x: p.x - Math.cos(p.h) * 40, y: p.y - Math.sin(p.h) * 40, t: 0, s: rand(0.7, 1.2) }); }
              if (p.d >= leg.P.len) {
                if (leg.touch) { st.landed++; judge(); Sfx.play("thud", {}); sfx(() => noise({ f: 700, d: 0.25, v: 0.12 })); api.particles.emit(p.x, p.y + 6, { count: 8, color: ["#FFFFFF", "#DDD3BB"], size: 9, speed: 80, gravity: -20, life: 0.8 }); }
                if (leg.last) {
                  if (p.state === "emerg") { p.state = "dizzy"; p.t = 0; Sfx.play("boing"); }
                  else { p.state = "parked"; p.t = 0; Sfx.play("bell", { note: 84 }); }
                } else { p.leg++; p.d = 0; }
              }
            }
            if (p.state === "parked" && p.t > 6) { p.state = "gone"; p.fade = 1; }
            if (p.state === "dizzy" && p.t > 6) { p.state = "gone"; p.fade = 1; }
            if (p.fade != null) p.fade -= dt * 1.2;
            // estela de punts
            if (airborne || p.state === "landing" || p.state === "emerg") { p.trailD += Math.hypot(p.x - (p.px || p.x), p.y - (p.py || p.y)); if (p.trailD > 16) { p.trailD = 0; trails.push({ x: p.x - Math.cos(p.h) * 52 + p.alt * 10, y: p.y - Math.sin(p.h) * 52 + p.alt * 10, t: 0 }); } }
            p.px = p.x; p.py = p.y;
          });
          for (let i = planes.length - 1; i >= 0; i--) if (planes[i].state === "gone" && planes[i].fade <= 0) planes.splice(i, 1);
          for (let i = trails.length - 1; i >= 0; i--) { trails[i].t += dt; if (trails[i].t > 3) trails.splice(i, 1); }
          if (trails.length > 260) trails.splice(0, trails.length - 260);
          for (let i = puffs.length - 1; i >= 0; i--) { puffs[i].t += dt; if (puffs[i].t > 1.6) puffs.splice(i, 1); }
          if (st.endT >= 0) {
            st.endT += dt;
            if (st.endT > 2.5 && !st.fin) {
              st.fin = true; const last = planes.filter(p => p.cleared).map(p => p.city).pop() || pick(cityList);
              api.finish(st.emerg === 0, { collectName: L_("el segell de {lloc}", { lloc: cap(last) }) });
            }
          }
        },
        draw(ctx) {
          const t = api.t;
          Sprites.draw(ctx, airportBg(), W / 2, H / 2);
          // radar de la torre
          ctx.save(); ctx.translate(790, 740); ctx.rotate(t * 2.2); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.restore();
          // estela de punts
          trails.forEach(d => { ctx.fillStyle = rgba(INK, 0.42 * (1 - d.t / 3)); ctx.beginPath(); ctx.arc(d.x + 1.5, d.y + 1, 3.2, 0, 6.28); ctx.fill(); });
          // avions: primer els de terra, després els de l'aire
          const order = planes.slice().sort((a, b) => a.alt - b.alt);
          order.forEach(p => {
            ctx.save(); if (p.fade != null) ctx.globalAlpha = clamp(p.fade, 0, 1);
            drawPlaneAt(ctx, p, p.col);
            ctx.restore();
          });
          puffs.forEach(q => { const k = q.t / 1.6; ctx.fillStyle = rgba("#FFFFFF", 0.75 * (1 - k)); ctx.beginPath(); ctx.arc(q.x, q.y - k * 30, 12 + k * 18 * q.s, 0, 6.28); ctx.fill(); ctx.strokeStyle = rgba(INK, 0.4 * (1 - k)); ctx.lineWidth = 2; ctx.stroke(); });
          planes.filter(p => p.state === "dizzy").forEach(p => { for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.09; ctx.fillStyle = k % 2 ? MUST : ORANGE; starPath(ctx, p.x + Math.cos(a) * 34, p.y - 30 + Math.sin(a) * 12, 10, 4.5, 5); ctx.fill(); } });
          drawVignette(ctx, 0.22, "60,40,20");
          // plaques a la cua (sempre dretes) amb l'indicador de combustible
          const cur = typer.current(), labels = [];
          planes.forEach(p => {
            const show = ["enter", "circle", "loop"].includes(p.state) || (p.state === "wait" && p.okT < 0.9) || (p.state === "landing" && p.okT < 0.9);
            if (!show) return;
            const ps = plateSize(ctx, p.text, cfg.size), pw = ps.w, off = 60 + Math.min(pw / 2, 120) + 4;
            let px = clamp(p.x - Math.cos(p.h) * off, pw / 2 + 12, W - pw / 2 - 44), py = clamp(p.y - Math.sin(p.h) * off - 4, 84 + ps.h / 2, H - ps.h / 2 - 10);
            const baseY=py;
            for(let attempt=0;attempt<12;attempt++){
              if(!labels.some(b=>Math.abs(px-b.x)<(pw+b.w)/2+40&&Math.abs(py-b.y)<(ps.h+b.h)/2+16))break;
              py=clamp(baseY+(attempt%2?1:-1)*Math.ceil((attempt+1)/2)*(ps.h+24),84+ps.h/2,H-ps.h/2-10);
            }
            labels.push({x:px,y:py,w:pw,h:ps.h});
            if(Math.abs(py-baseY)>8){ctx.save();ctx.strokeStyle=p.col;ctx.lineWidth=2;ctx.globalAlpha=.65;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(px,py);ctx.stroke();ctx.restore();}
            const a = p.state === "enter" ? clamp(p.t * 2, 0, 1) : p.okT != null ? clamp(1 - (p.okT - 0.5) / 0.4, 0, 1) : 1;
            const state = p.cleared ? "ok" : p === cur ? "active" : p.wrongT > 0 ? "wrong" : null;
            const r = drawPlate(ctx, p.text, px, py, { size: cfg.size, progress: p.cleared ? p.text.length : p.typed, state, border: state ? null : p.col, borderW: 5, alpha: a, shadowBlur: 0, shadowY: 4 });
            if (!p.cleared) { ctx.save(); ctx.globalAlpha = a; gauge(ctx, px + r.w / 2 + 14, py - r.h / 2 + 2, p.fuel / p.fuelMax); ctx.restore(); }
          });
          if (st.endT >= 0) {
            const k = Ease.outBack(clamp(st.endT / 0.5, 0, 1));
            ctx.save(); ctx.translate(800, 360); ctx.scale(k, k);
            rr(ctx, -360, -70, 720, 140, 20); ctx.fillStyle = PAPER; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
            text(ctx, st.emerg ? "Tots a terra!" : "20 avions a terra!", 0, -14, { size: 54, weight: 900, font: FONT_T, color: INK });
            text(ctx, st.emerg ? (st.emerg === 1 ? L_("Hi ha hagut 1 emergència") : L_("Hi ha hagut {n} emergències", { n: st.emerg })) : "Cap emergència. Bona feina, torre!", 0, 40, { size: 28, weight: 800, font: FONT_T, color: st.emerg ? ORANGE : TEAL });
            ctx.restore();
          }
        },
      };
    },
  });
})();
