"use strict";
/* 23. El robot ballarí — robots de llauna de joguina en una pista de rajoles lluminoses amb bola de miralls */
(() => {
  // passos per nivell: [text que s'escriu, nom del pas, animació]
  const SETS = {
    1: [["a", "Braços amunt", "armsUp"], ["e", "Estrella", "star"], ["i", "Inclina't", "bow"], ["o", "Onada", "wave"], ["u", "Uep!", "hop"]],
    2: [["s", "Salt", "jump"], ["p", "Picar de mans", "clap"], ["c", "Cop de cap", "nod"], ["r", "Robot", "robot"], ["t", "Tomb", "spin"], ["m", "Molinet", "windmill"], ["d", "Disco", "disco"]],
    3: [["b", "Braços amunt", "armsUp"], ["g", "Gir", "spin"], ["s", "Salt", "jump"], ["p", "Picar de mans", "clap"], ["c", "Cop de cap", "nod"], ["r", "Robot", "robot"]],
    4: [["sa", "Salt", "jump"], ["gi", "Gir", "spin"], ["pi", "Picar de mans", "clap"], ["ca", "Cop de cap", "nod"], ["ro", "Robot", "robot"], ["bra", "Braços amunt", "armsUp"]],
    5: [["salta", "Salt", "jump"], ["gira", "Gir", "spin"], ["pica", "Picar de mans", "clap"], ["cap", "Cop de cap", "nod"], ["robot", "Robot", "robot"], ["braços", "Braços amunt", "armsUp"]],
    6: [["salta alt", "Salt", "jump"], ["gira rodó", "Gir", "spin"], ["pica de mans", "Picar de mans", "clap"], ["cop de cap", "Cop de cap", "nod"], ["fes el robot", "Robot", "robot"], ["braços amunt", "Braços amunt", "armsUp"]],
  };
  const LENS = { 1: [2, 3, 3, 4, 4], 2: [2, 3, 3, 4, 4], 3: [2, 3, 3, 4, 4], 4: [2, 3, 3, 4], 5: [2, 2, 3, 3], 6: [2, 2, 3] };
  const MODEL_X = 360, MODEL_Y = 520, MY_X = 1090, MY_Y = 548, TAPE_Y = 612;
  const NEON = ["#FF4FA0", "#4FD1FF", "#FFD84F", "#7CFF7A", "#B57CFF"];

  /* ---------- sons ---------- */
  const snd = {
    spring() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: 260, f2: 720, slide: 0.18, d: 0.28, type: "sine", v: 0.14 }); tone({ f: 520, f2: 900, slide: 0.1, d: 0.15, type: "triangle", v: 0.05, delay: 0.05 }); },
    gear() { if (!Audio2.ctx || !Settings.sfx) return; for (let i = 0; i < 6; i++) noise({ f: 2600 - i * 120, q: 7, d: 0.02, v: 0.12, delay: i * 0.035 }); },
    clap() { if (!Audio2.ctx || !Settings.sfx) return; noise({ f: 2200, q: 1.2, d: 0.06, v: 0.3 }); tone({ f: 1800, d: 0.04, type: "square", v: 0.03, lp: 3000 }); },
    stuck() { if (!Audio2.ctx || !Settings.sfx) return; for (let i = 0; i < 10; i++) noise({ f: 900 + (i % 3) * 300, q: 5, d: 0.03, v: 0.16, delay: i * 0.045 }); tone({ f: 140, f2: 90, d: 0.45, type: "sawtooth", v: 0.06, lp: 600 }); },
    ding() { if (!Audio2.ctx || !Settings.sfx) return; tone({ f: NOTE(84), d: 0.4, type: "sine", v: 0.12, verb: true }); tone({ f: NOTE(91), d: 0.5, type: "sine", v: 0.06, delay: 0.05, verb: true }); },
  };

  /* ---------- animacions dels passos (k de 0 a 1) ---------- */
  const env = k => Math.sin(Math.PI * clamp(k, 0, 1));
  const POSE0 = () => ({ by: 0, lean: 0, head: 0, headY: 0, aL: 0.25, aR: 0.25, eL: 0, eR: 0, legs: 0, knee: 0, spin: 0, sq: 1 });
  const ANIM = {
    armsUp: (p, k) => { const e = env(k); p.aL = p.aR = 0.25 + 2.75 * e; p.by = -14 * e; p.sq = 1 + 0.04 * e; },
    star: (p, k) => { const e = env(k); p.aL = p.aR = 0.25 + 1.95 * e; p.legs = e; p.by = -55 * e; },
    bow: (p, k) => { const e = env(k); p.headY = 26 * e; p.sq = 1 - 0.1 * e; p.aL = p.aR = 0.25 + 0.6 * e; p.eL = p.eR = -0.9 * e; p.knee = 0.4 * e; },
    wave: (p, k) => { const e = env(k), w = Math.sin(k * Math.PI * 6); p.aL = 0.25 + (1.5 + 0.6 * w) * e; p.aR = 0.25 + (1.5 - 0.6 * w) * e; p.eL = 0.7 * w * e; p.eR = -0.7 * w * e; p.by = -8 * Math.abs(w) * e; p.lean = 0.06 * w * e; },
    hop: (p, k) => { const e = env(k); p.knee = k < 0.2 ? k * 3 : 0; p.by = -70 * env((k - 0.15) / 0.85); p.aR = 0.25 + 2.7 * e; p.eR = -0.3 * e; p.aL = 0.25 + 0.3 * e; },
    jump: (p, k) => { if (k < 0.25) { p.knee = k / 0.25; p.sq = 1 - 0.1 * k / 0.25; } else { const j = (k - 0.25) / 0.75; p.by = -150 * env(j); p.sq = 1 + 0.08 * env(j * 2); p.aL = p.aR = 0.25 + 2.4 * env(j); p.legs = 0.4 * env(j); if (j > 0.9) p.knee = (j - 0.9) * 6; } },
    clap: (p, k) => { const e = Math.min(1, env(k) * 2.2), c = Math.abs(Math.sin(k * Math.PI * 4)); p.aL = p.aR = 0.25 + 0.95 * e; p.eL = p.eR = -(1.55 + 0.55 * c) * e; p.by = -6 * c * e; },
    nod: (p, k) => { const e = env(k), c = Math.abs(Math.sin(k * Math.PI * 4)); p.headY = 18 * c * e; p.head = 0.12 * Math.sin(k * Math.PI * 4) * e; p.knee = 0.25 * c * e; },
    robot: (p, k) => { const q = Math.floor(k * 8) / 8, e = Math.min(1, env(k) * 2), s = Math.floor(q * 4) % 2 ? 1 : -1; p.aL = 0.25 + 1.32 * e; p.aR = 0.25 + 1.32 * e; p.eL = s * 1.5 * e; p.eR = -s * 1.5 * e; p.head = s * 0.22 * e; p.by = -4 * (Math.floor(q * 8) % 2) * e; },
    spin: (p, k) => { const e = env(k); p.spin = Ease.inOutCubic(k); p.aL = p.aR = 0.25 + 1.3 * e; p.by = -10 * e; },
    windmill: (p, k) => { const e = env(k); p.aR = 0.25 + k * Math.PI * 2; p.aL = 0.25 + 0.4 * e; p.by = -6 * Math.abs(Math.sin(k * Math.PI * 4)); p.lean = -0.06 * e; },
    disco: (p, k) => { const e = Math.min(1, env(k) * 2), s = k < 0.5 ? 1 : -1; p.aR = 0.25 + (s > 0 ? 2.5 : 0.5) * e; p.aL = 0.25 + (s > 0 ? 0.5 : 2.5) * e; p.lean = 0.12 * Math.sin(k * Math.PI * 4) * e; p.knee = 0.3 * Math.abs(Math.sin(k * Math.PI * 4)) * e; },
  };
  const ANIM_SFX = { armsUp: "spring", star: "spring", bow: "gear", wave: "gear", hop: "spring", jump: "spring", clap: "clap", nod: "gear", robot: "gear", spin: "gear", windmill: "gear", disco: "spring" };

  function makeRobot(col, chest) {
    return { col, chest, q: [], cur: null, k: 0, dur: 0.9, stuck: 0, glow: 0, p: POSE0(), eyes: 0 };
  }
  function robotPlay(r, anim, dur) { r.q.push({ anim, dur }); }
  function robotUpdate(r, dt, t) {
    if (!r.cur && r.q.length) { r.cur = r.q.shift(); r.k = 0; const s = ANIM_SFX[r.cur.anim]; if (s && r.sfx !== false) snd[s] && snd[s](); }
    const p = POSE0();
    // respiració en repòs
    p.by = Math.sin(t * 2.4) * 2; p.head = Math.sin(t * 1.1) * 0.04; p.aL = 0.25 + Math.sin(t * 2.4) * 0.03; p.aR = 0.25 - Math.sin(t * 2.4) * 0.03;
    if (r.cur) {
      const speed = r.q.length > 1 ? 1.6 : 1;
      r.k += dt / r.cur.dur * speed; ANIM[r.cur.anim](p, r.k);
      if (r.cur.anim === "clap" && r.lastC !== Math.floor(r.k * 4 + 0.5) && r.k > 0.1 && r.k < 0.95) { r.lastC = Math.floor(r.k * 4 + 0.5); if (r.lastC % 2 && r.sfx !== false) snd.clap(); }
      if (r.k >= 1) { r.cur = null; r.lastC = -1; }
    }
    if (r.stuck > 0) { r.stuck -= dt; p.lean = Math.sin(t * 50) * 0.04; p.aL = 0.25 + 0.6; p.eL = -1.2; p.aR = 0.25 + 1.1; p.eR = 0.4; p.head = 0.25; }
    r.glow = Math.max(0, r.glow - dt * 1.4);
    r.p = p;
  }

  /* ---------- dibuix del robot de llauna ---------- */
  function tinGrad(ctx, x0, x1, col) { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, shade(col, -0.35)); g.addColorStop(0.2, shade(col, 0.1)); g.addColorStop(0.3, shade(col, 0.55)); g.addColorStop(0.38, shade(col, 0.12)); g.addColorStop(0.75, col); g.addColorStop(1, shade(col, -0.4)); return g; }
  function screw(ctx, x, y, r = 5) { const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0.5, x, y, r); g.addColorStop(0, "#FFF5CD"); g.addColorStop(0.42, "#DCAF63"); g.addColorStop(1, "#6E452A"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); ctx.strokeStyle = "rgba(58,32,17,0.75)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - r * 0.6, y + r * 0.2); ctx.lineTo(x + r * 0.6, y - r * 0.2); ctx.stroke(); }
  function tube(ctx, x1, y1, x2, y2, w) {
    ctx.lineCap = "round"; ctx.strokeStyle = "#6E777E"; ctx.lineWidth = w + 3; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    const metal = ctx.createLinearGradient(x1 - w * 0.5, y1 - 4, x1 + w * 0.5, y1 + 4);
    metal.addColorStop(0, "#716050"); metal.addColorStop(0.3, "#F2D7A0"); metal.addColorStop(0.55, "#C3A77D"); metal.addColorStop(1, "#59696C");
    ctx.strokeStyle = metal; ctx.lineWidth = w; ctx.stroke();
    ctx.strokeStyle = "rgba(255,246,210,0.4)"; ctx.lineWidth = w * 0.14; ctx.stroke();
    const n = 4, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    ctx.strokeStyle = "rgba(70,78,84,0.55)"; ctx.lineWidth = 1.6;
    for (let i = 1; i < n; i++) { const px = x1 + dx * i / n, py = y1 + dy * i / n; ctx.beginPath(); ctx.moveTo(px + nx * w / 2, py + ny * w / 2); ctx.lineTo(px - nx * w / 2, py - ny * w / 2); ctx.stroke(); }
  }
  function drawRobot(ctx, r, x, y, s, t) {
    const p = r.p, sx = Math.cos(p.spin * Math.PI * 2), back = sx < 0, jit = r.stuck > 0 ? Math.sin(t * 70) * 3 : 0;
    ctx.save(); ctx.translate(x + jit, y);
    // ombra a terra
    const lift = clamp(-p.by / 160, 0, 1);
    ctx.fillStyle = `rgba(0,0,0,${0.4 - lift * 0.2})`; ctx.beginPath(); ctx.ellipse(0, 4, 95 * s * (1 - lift * 0.35), 16 * s * (1 - lift * 0.35), 0, 0, 6.28); ctx.fill();
    if (r.glow > 0) { ctx.save(); ctx.globalCompositeOperation = "lighter"; const g = ctx.createRadialGradient(0, -190 * s, 10, 0, -190 * s, 240 * s); g.addColorStop(0, `rgba(120,255,200,${0.55 * r.glow})`); g.addColorStop(1, "rgba(120,255,200,0)"); ctx.fillStyle = g; ctx.fillRect(-260 * s, -440 * s, 520 * s, 480 * s); ctx.restore(); }
    ctx.scale(s, s); ctx.translate(0, p.by + p.knee * 18);
    ctx.scale(Math.max(0.18, Math.abs(sx)), p.sq);
    ctx.rotate(p.lean);
    // cames
    const kneeY = p.knee * 18;
    for (const side of [-1, 1]) {
      const hx = side * 32, fx = side * (32 + p.legs * 34);
      tube(ctx, hx, -100, fx, -14 - kneeY * 0.2, 24);
      const fg = ctx.createLinearGradient(0, -20, 0, 2); fg.addColorStop(0, shade(r.col, 0.2)); fg.addColorStop(1, shade(r.col, -0.35));
      ctx.fillStyle = fg; rr(ctx, fx - 30 + side * 4, -22 - kneeY * 0.2, 60, 24, 9); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.35)"; rr(ctx, fx - 24 + side * 4, -19 - kneeY * 0.2, 40, 5, 3); ctx.fill();
    }
    // clau de corda (darrere, sobresurt pel costat)
    const keyA = t * 3, kw = Math.cos(keyA);
    const drawKey = (kx, ky, big) => { ctx.fillStyle = "#C9A23A"; ctx.fillRect(kx - 4, ky - 30 * big, 8, 30 * big); ctx.save(); ctx.translate(kx, ky - 30 * big); ctx.scale(kw, 1); const g = ctx.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, "#9A7A20"); g.addColorStop(0.5, "#F6DC78"); g.addColorStop(1, "#9A7A20"); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-20 * big, -10 * big, 18 * big, 13 * big, 0, 0, 6.28); ctx.ellipse(20 * big, -10 * big, 18 * big, 13 * big, 0, 0, 6.28); ctx.fill(); ctx.restore(); };
    if (!back) drawKey(84, -200, 0.7);
    // braços
    const arm = (side, a, e) => {
      const shx = side * 82, shy = -236, ex = shx + side * Math.sin(a) * 58, ey = shy + Math.cos(a) * 58, a2 = a + e, hx = ex + side * Math.sin(a2) * 50, hy = ey + Math.cos(a2) * 50;
      tube(ctx, shx, shy, ex, ey, 22); tube(ctx, ex, ey, hx, hy, 20); screw(ctx, ex, ey, 7);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-side * a2); ctx.strokeStyle = shade(r.col, -0.1); ctx.lineWidth = 9; ctx.lineCap = "round"; ctx.beginPath(); ctx.arc(0, 10, 13, -0.5 + Math.PI * 0.0, Math.PI + 0.5, false); ctx.stroke(); ctx.restore();
    };
    // cos
    const body = () => {
      const shell = Art.get("g23_body");
      if (shell) ctx.drawImage(shell, -84, -266, 168, 176);
      else { ctx.fillStyle = tinGrad(ctx, -78, 78, r.col); rr(ctx, -78, -258, 156, 160, 26); ctx.fill();
        ctx.strokeStyle = shade(r.col, -0.45); ctx.lineWidth = 3; ctx.stroke(); }
      if (!back) {
        ctx.fillStyle = tinGrad(ctx, -52, 52, r.chest); rr(ctx, -52, -232, 104, 76, 12); ctx.fill();
        ctx.fillStyle = "#FFFDF0"; ctx.beginPath(); ctx.arc(-22, -196, 20, 0, 6.28); ctx.fill(); ctx.strokeStyle = "#3A3A3A"; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = "#D9503A"; ctx.lineWidth = 3; const na = -2.4 + Math.sin(t * 2 + (r.cur ? r.k * 6 : 0)) * 0.9 + (r.cur ? 1.2 : 0); ctx.beginPath(); ctx.moveTo(-22, -196); ctx.lineTo(-22 + Math.cos(na) * 15, -196 + Math.sin(na) * 15); ctx.stroke();
        ["#E0553A", "#5FD08A", "#4FA0E8"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(16 + (i % 2) * 18, -214 + i * 18, 7, 0, 6.28); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.arc(14 + (i % 2) * 18, -216 + i * 18, 2.5, 0, 6.28); ctx.fill(); });
        ctx.fillStyle = "rgba(0,0,0,0.18)"; for (let i = 0; i < 5; i++) ctx.fillRect(-46 + i * 20, -146, 12, 26);
      } else drawKey(0, -150, 1.1);
      if (!shell) { [[-64, -244], [64, -244], [-64, -112], [64, -112]].forEach(([a, b]) => screw(ctx, a, b, 6));
        ctx.fillStyle = "rgba(255,255,255,0.32)"; rr(ctx, -60, -252, 14, 140, 7); ctx.fill(); }
    };
    if (back) { body(); arm(-1, p.aL, p.eL); arm(1, p.aR, p.eR); }
    else { arm(-1, p.aL, p.eL); arm(1, p.aR, p.eR); body(); }
    // muscles d'espatlla
    for (const side of [-1, 1]) screw(ctx, side * 82, -236, 12);
    // coll i cap
    ctx.fillStyle = "#8A949A"; rr(ctx, -16, -272, 32, 18, 5); ctx.fill();
    ctx.save(); ctx.translate(0, -268 + p.headY); ctx.rotate(p.head);
    // antena
    const aw = Math.sin(t * 5) * 0.12 + (r.cur ? Math.sin(r.k * 20) * 0.2 : 0);
    ctx.strokeStyle = "#8A949A"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -88); ctx.quadraticCurveTo(Math.sin(aw) * 10, -110, Math.sin(aw) * 26, -128); ctx.stroke();
    const bg = ctx.createRadialGradient(Math.sin(aw) * 26 - 3, -131, 1, Math.sin(aw) * 26, -128, 11); bg.addColorStop(0, "#FFD0C8"); bg.addColorStop(1, "#D9261C"); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(Math.sin(aw) * 26, -128, 11, 0, 6.28); ctx.fill();
    for (const side of [-1, 1]) { ctx.fillStyle = tinGrad(ctx, side * 60 - 10, side * 60 + 10, "#B8C0C6"); rr(ctx, side * 62 - 10, -62, 20, 32, 6); ctx.fill(); }
    const headShell = Art.get("g23_head");
    if (headShell) ctx.drawImage(headShell, -66, -96, 132, 100);
    else { ctx.fillStyle = tinGrad(ctx, -60, 60, "#C9D0D5"); rr(ctx, -60, -92, 120, 92, 20); ctx.fill(); ctx.strokeStyle = "#6E777E"; ctx.lineWidth = 3; ctx.stroke(); }
    if (!back) {
      for (const side of [-1, 1]) {
        const ex = side * 27, ey = -54;
        ctx.fillStyle = "#3A3F44"; ctx.beginPath(); ctx.arc(ex, ey, 20, 0, 6.28); ctx.fill();
        if (r.stuck > 0) { ctx.strokeStyle = "#FFD84F"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex - 9, ey - 9); ctx.lineTo(ex + 9, ey + 9); ctx.moveTo(ex + 9, ey - 9); ctx.lineTo(ex - 9, ey + 9); ctx.stroke(); }
        else { const eg = ctx.createRadialGradient(ex - 3, ey - 4, 2, ex, ey, 15); eg.addColorStop(0, "#FFFFE5"); eg.addColorStop(0.6, r.eye || "#EFC66C"); eg.addColorStop(1, "#6B5540"); ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(ex, ey, 16, 0, 6.28); ctx.fill();
          const gaze = Settings.reduceMotion ? 0 : Math.sin(t * 0.7) * 2;
          ctx.fillStyle = "#223239"; ctx.beginPath(); ctx.ellipse(ex + gaze, ey + 1, 6.5, 8, 0, 0, 6.28); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.beginPath(); ctx.arc(ex - 5, ey - 6, 4, 0, 6.28); ctx.fill(); }
        ctx.strokeStyle = "#D8AD61"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, 21, 0, 6.28); ctx.stroke();
      }
      ctx.fillStyle = "#3A3F44"; rr(ctx, -30, -26, 60, 14, 5); ctx.fill(); ctx.fillStyle = "#9AA4AA"; for (let i = 0; i < 6; i++) ctx.fillRect(-26 + i * 10, -24, 4, 10);
    } else { screw(ctx, -36, -46, 6); screw(ctx, 36, -46, 6); ctx.fillStyle = "rgba(0,0,0,0.15)"; for (let i = 0; i < 4; i++) ctx.fillRect(-30, -70 + i * 12, 60, 4); }
    if (!headShell) { ctx.fillStyle = "rgba(255,255,255,0.35)"; rr(ctx, -50, -86, 12, 70, 6); ctx.fill(); }
    ctx.restore();
    ctx.restore();
  }

  /* ---------- discoteca ---------- */
  function floorQuad(i, j, rows, cols) {
    const y0 = 462, y1 = 900, wTop = 1000, wBot = 2600, ry = k => y0 + (y1 - y0) * Math.pow(k / rows, 1.35), wy = y => lerp(wTop, wBot, (y - y0) / (y1 - y0));
    const ya = ry(j), yb = ry(j + 1), wa = wy(ya), wb = wy(yb);
    const xa = c => 800 - wa / 2 + wa * c / cols, xb = c => 800 - wb / 2 + wb * c / cols;
    return [[xa(i), ya], [xa(i + 1), ya], [xb(i + 1), yb], [xb(i), yb]];
  }
  function bgDisco() {
    return Sprites.get("g23bg", W, H, (x) => {
      const g = x.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, "#140A2A"); g.addColorStop(1, "#2E1650"); x.fillStyle = g; x.fillRect(0, 0, W, 470);
      // panells de la paret amb bombetes
      for (let i = 0; i < 6; i++) { const px = 300 + i * 170; x.fillStyle = "rgba(255,255,255,0.04)"; rr(x, px, 200, 140, 230, 12); x.fill(); x.strokeStyle = "rgba(180,140,255,0.18)"; x.lineWidth = 3; x.stroke(); }
      x.fillStyle = "#FFE9A8"; for (let i = 0; i < 40; i++) { x.globalAlpha = 0.55; x.beginPath(); x.arc(240 + i * 28, 186, 4, 0, 6.28); x.fill(); } x.globalAlpha = 1;
      // rètol de neó
      x.save(); x.shadowColor = "#FF4FA0"; x.shadowBlur = 22; text(x, "Disco Tecla", 800, 236, { size: 54, weight: 900, font: FONT_T, color: "#FFC2E0" }); x.restore();
      // cortines
      for (const side of [-1, 1]) {
        for (let i = 0; i < 7; i++) { const px = side < 0 ? i * 30 : W - (i + 1) * 30; const cg = x.createLinearGradient(px, 0, px + 30, 0); cg.addColorStop(0, "#5A0E2A"); cg.addColorStop(0.5, "#A01E48"); cg.addColorStop(1, "#4A0A22"); x.fillStyle = cg; x.fillRect(px, 0, 30, 470); }
        x.fillStyle = "#E9B934"; x.fillRect(side < 0 ? 0 : W - 210, 0, 210, 16);
      }
      // altaveus
      for (const sx of [250, 1350]) { x.fillStyle = "#1A1622"; rr(x, sx - 60, 300, 120, 170, 10); x.fill(); for (const [cy, r] of [[345, 26], [420, 38]]) { x.fillStyle = "#2E2A38"; x.beginPath(); x.arc(sx, cy, r, 0, 6.28); x.fill(); x.fillStyle = "#0E0C12"; x.beginPath(); x.arc(sx, cy, r * 0.55, 0, 6.28); x.fill(); x.strokeStyle = "rgba(255,255,255,0.15)"; x.lineWidth = 2; x.beginPath(); x.arc(sx, cy, r, 3.6, 5); x.stroke(); } }
      // vora de la pista
      x.fillStyle = "#0E0818"; x.fillRect(0, 456, W, 12);
      // pedestal del model
      x.save(); x.translate(MODEL_X, MODEL_Y);
      x.fillStyle = "rgba(0,0,0,0.4)"; x.beginPath(); x.ellipse(0, 46, 140, 22, 0, 0, 6.28); x.fill();
      const pg = x.createLinearGradient(-120, 0, 120, 0); pg.addColorStop(0, "#3A2A5A"); pg.addColorStop(0.4, "#6A54A0"); pg.addColorStop(1, "#2A1E44"); x.fillStyle = pg; rr(x, -120, 0, 240, 44, 10); x.fill();
      x.fillStyle = "#8A72C8"; x.beginPath(); x.ellipse(0, 0, 120, 18, 0, 0, 6.28); x.fill(); x.fillStyle = "#A890E8"; x.beginPath(); x.ellipse(0, -2, 112, 14, 0, 0, 6.28); x.fill();
      x.fillStyle = "#FFFDF6"; rr(x, -50, 12, 100, 26, 8); x.fill(); text(x, "Model", 0, 26, { size: 19, weight: 900, font: FONT_T, color: "#3A2A5A" });
      x.restore();
    });
  }
  function mirrorBall() {
    return Sprites.get("g23ball", 120, 120, (x) => {
      x.save(); x.beginPath(); x.arc(60, 60, 54, 0, 6.28); x.clip();
      for (let j = 0; j < 12; j++) for (let i = 0; i < 14; i++) { const v = 120 + ((i * 37 + j * 53) % 120); x.fillStyle = `rgb(${v},${v},${v + 20})`; x.fillRect(6 + i * 8, 6 + j * 9, 7.2, 8.2); }
      const g = x.createRadialGradient(42, 40, 4, 60, 60, 56); g.addColorStop(0, "rgba(255,255,255,0.6)"); g.addColorStop(0.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,0.5)"); x.fillStyle = g; x.fillRect(0, 0, 120, 120);
      x.restore();
    });
  }

  /* ---------- icona del pas (pictograma petit) ---------- */
  function stepIcon(ctx, anim, x, y, s, col) {
    const p = POSE0(); if (ANIM[anim]) ANIM[anim](p, anim === "spin" ? 0.3 : 0.5);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.translate(0, p.by * 0.2); rr(ctx, -10, -26, 20, 22, 5); ctx.fill(); ctx.beginPath(); ctx.arc(0, -34 + p.headY * 0.2, 7, 0, 6.28); ctx.fill();
    for (const side of [-1, 1]) { const a = side < 0 ? p.aL : p.aR, e = side < 0 ? p.eL : p.eR, ex = side * 10 + side * Math.sin(a) * 12, ey = -22 + Math.cos(a) * 12, hx = ex + side * Math.sin(a + e) * 10, hy = ey + Math.cos(a + e) * 10; ctx.beginPath(); ctx.moveTo(side * 10, -22); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(side * 5, -4); ctx.lineTo(side * (6 + p.legs * 8), 12); ctx.stroke(); }
    if (anim === "spin") { ctx.beginPath(); ctx.arc(0, -14, 26, -0.6, 3.6); ctx.stroke(); }
    ctx.restore();
  }

  /* ---------- miniatura ---------- */
  function thumb(ctx, x, y, w, h, t) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#140A2A"); g.addColorStop(0.55, "#2E1650"); g.addColorStop(0.55, "#1A1030"); g.addColorStop(1, "#1A1030"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const sc = Math.min(Math.max(w / 300, h / 180), h / 170); ctx.translate(w / 2, h * 0.5); ctx.scale(sc, sc);
    for (let j = 0; j < 3; j++) for (let i = -4; i < 4; i++) { ctx.fillStyle = rgba(NEON[(i + j + 8 + Math.floor(t * 2)) % 5], 0.45); ctx.beginPath(); ctx.moveTo(i * 38 - j * 6, 20 + j * 22); ctx.lineTo(i * 38 + 36 - j * 6 + (i + 1) * 3, 20 + j * 22); ctx.lineTo(i * 38 + 36 + j * 6 + (i + 1) * 3, 40 + j * 22); ctx.lineTo(i * 38 + j * 6, 40 + j * 22); ctx.fill(); }
    Sprites.draw(ctx, mirrorBall(), 78, -64, { s: 0.3, rot: t * 0.5 });
    const r = makeRobot("#D9503A", "#F2C230"); const k = (t * 0.8) % 1; r.p = POSE0(); ANIM.armsUp(r.p, k);
    drawRobot(ctx, r, -36, 60, 0.29, t);
    drawPlate(ctx, "w", 74, 14, { size: 46, shadowBlur: 8 });
    ctx.restore();
  }

  Games.register({
    id: 23, key: "w", name: "El robot ballarí", zone: "espai", music: "funk", demoTime: 12, captionY: 160, kbPos: [800, 782], missAt: [800, 340],
    collect: { one: "coreografia", many: "coreografies" },
    goal: l => l <= 3 ? "Mira el robot model i escriu la lletra de cada pas per copiar-li el ball. Després prem Retorn i a ballar!"
      : l === 4 ? "Mira el robot model i escriu la síl·laba de cada pas per copiar-li el ball. Després prem Retorn i a ballar!"
        : "Mira el robot model i escriu el nom de cada pas per copiar-li el ball. Després prem Retorn i a ballar!",
    thumb,
    create(api) {
      const L = api.level, set = SETS[L], lens = LENS[L], total = lens.length;
      const psz = L <= 3 ? 64 : L === 4 ? 56 : 44;
      const model = makeRobot("#3C86C8", "#9AD9C4"), mine = makeRobot("#D9503A", "#F2C230");
      model.eye = "#7CFF7A";
      let ch = 0, phase = "intro", pt = 0, seq = [], idx = 0, typed = 0, showI = -1, t = 0, beat = 0, beatT = 0, party = 0, done = 0;
      let free = { n: 0, lock: null, typed: 0, sug: 0 }, ended = false, spotsA = 0;
      const stepDur = () => (api.demo ? 0.75 : 0.95) / api.speed;
      function newChallenge() {
        const n = lens[ch]; seq = [];
        for (let i = 0; i < n; i++) { let s, k = 0; do { s = pick(set); k++; } while (k < 20 && seq.length && seq[seq.length - 1] === s); seq.push(s); }
        idx = 0; typed = 0; showI = -1; phase = "show"; pt = -0.6;
        api.say("Mira bé!");
      }
      function triggerStep(s, robot, glowModel) { robotPlay(robot, s[2], stepDur()); if (glowModel) { model.glow = 1; robotPlay(model, s[2], stepDur()); model.sfx = false; } }
      function startDance() { phase = "dance"; pt = 0; party = 1; void 0; seq.forEach(s => { robotPlay(mine, s[2], 0.8); robotPlay(model, s[2], 0.8); }); model.sfx = false; mine.sfx = true; Sfx.play("go"); }
      newChallenge();
      const curItem = () => seq[idx] && seq[idx][0];
      return {
        expected() {
          if (phase === "play") return curItem()[typed];
          if (phase === "ready") return api.demo ? null : "Enter";
          if (phase === "free" && free.n < 6 && pt <= 12) { const it = free.lock ? free.lock[0] : set[free.sug % set.length][0]; return it[free.lock ? free.typed : 0]; }
          return null;
        },
        onKey(k) {
          if (phase === "ready") { if (k === "Enter") startDance(); return; }
          if (phase === "free") {
            if (k.length !== 1 || free.n >= 6 || pt > 12) return;
            if (!free.lock) { const s = set.find(q => q[0][0] === k); if (!s) { mine.stuck = 0.35; snd.stuck(); return; } free.lock = s; free.typed = 0; }
            const s = free.lock;
            if (s[0][free.typed] === k) { free.typed++; api.hit({ sfx: "key" }); if (free.typed >= s[0].length) { robotPlay(mine, s[2], 0.8); free.n++; free.sug++; free.lock = null; free.typed = 0; free.last = s; free.lastT = 1; api.particles.emit(MY_X, 300, { count: 10, color: NEON, speed: 300, gravity: 300, size: 10, life: 0.8, shape: "star" }); } }
            else { free.lock = null; free.typed = 0; mine.stuck = 0.35; snd.stuck(); }
            return;
          }
          if (phase !== "play" || k.length !== 1) return;
          const it = curItem(), c = it[typed];
          if (k === c) {
            typed++; api.hit({ sfx: typed >= it.length ? "hit" : "key" });
            if (typed >= it.length) {
              triggerStep(seq[idx], mine, true); snd.ding();
              idx++; typed = 0;
              if (idx >= seq.length) { phase = "ready"; pt = 0; setTimeout(() => { if (phase === "ready") api.say("Molt bé! Prem Retorn i a ballar!"); }, 700); }
            }
          } else {
            api.miss(c, k, { sfx: false }); snd.stuck(); mine.stuck = 0.6; mine.q.length = 0; mine.cur = null;
            api.particles.emit(MY_X + 40, 330, { count: 8, color: ["rgba(200,200,210,0.8)", "rgba(160,160,170,0.7)"], speed: 70, gravity: -80, size: 26, life: 0.9, drag: 0.95 });
          }
        },
        update(dt) {
          t += dt; pt += dt; spotsA += dt * (party > 0 ? 0.9 : 0.3);
          beatT += dt; if (beatT > 60 / 108) { beatT = 0; beat++; }
          party = Math.max(0, party - dt * 0.12);
          robotUpdate(model, dt, t); robotUpdate(mine, dt, t + 1.7);
          if (phase === "show") {
            const d = stepDur() * 1.15, i = Math.floor(pt / d);
            if (pt >= 0 && i !== showI && i < seq.length) { showI = i; model.sfx = true; robotPlay(model, seq[i][2], stepDur()); }
            if (pt > d * seq.length + 0.2) { phase = "play"; pt = 0; api.say(L <= 3 ? "Ara tu! Escriu els passos." : "Ara tu! Escriu els passos."); }
          }
          if (phase === "ready" && api.demo && pt > 1.2) startDance();
          if (phase === "dance") {
            if (!mine.cur && !mine.q.length && pt > 0.5) {
              done++; ch++; api.hud.progress = [done, total];
              Sfx.play("crowd"); api.particles.emit(MY_X, 260, { count: 26, color: NEON.concat(["#FFFFFF"]), speed: 420, gravity: 420, size: 12, life: 1.3, shape: "confetti" });
              if (ch >= total) { phase = "freeIntro"; pt = 0; api.say("Ball lliure! Prem les lletres dels passos que vulguis."); }
              else { phase = "cheer"; pt = 0; void 0; }
            }
          }
          if (phase === "cheer" && pt > 1.3) newChallenge();
          if (phase === "freeIntro" && pt > 1.6) { phase = "free"; pt = 0; party = 1; }
          if (phase === "free") {
            party = Math.max(party, 0.8); if (free.lastT) free.lastT = Math.max(0, free.lastT - dt);
            if ((free.n >= 6 || pt > 12) && !mine.cur && !mine.q.length) { phase = "end"; pt = 0; Sfx.play("crowd"); void 0; }
          }
          if (phase === "end") {
            if (pt < 2 && Math.random() < 0.5) api.particles.emit(rand(100, 1500), -10, { count: 2, color: NEON.concat(["#FFFFFF"]), speed: 120, gravity: 260, size: 14, life: 2.2, shape: "confetti", drag: 0.97 });
            if (pt > 2.6 && !ended) { ended = true; api.finish(true, { collectName: "una coreografia nova" }); }
          }
          api.hud.progress = [done, total];
        },
        draw(ctx) {
          ctx.drawImage(bgDisco().c, 0, 0, W, H);
          // pista de rajoles lluminoses (canvis suaus al ritme)
          const fRows = 6, cols = 10, glowK = 0.32 + party * 0.35 + (1 - Math.min(1, beatT / 0.35)) * 0.12;
          for (let j = 0; j < fRows; j++) for (let i = 0; i < cols; i++) {
            const q = floorQuad(i, j, fRows, cols), c = NEON[(i + j * 3 + beat) % 5];
            ctx.beginPath(); q.forEach((p, n) => n ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
            ctx.fillStyle = "#1A1030"; ctx.fill(); ctx.fillStyle = rgba(c, glowK * ((i + j) % 2 ? 0.75 : 1)); ctx.fill();
            ctx.strokeStyle = "rgba(10,5,20,0.9)"; ctx.lineWidth = 3; ctx.stroke();
          }
          const fl = ctx.createLinearGradient(0, 462, 0, 900); fl.addColorStop(0, "rgba(20,10,40,0.6)"); fl.addColorStop(0.4, "rgba(20,10,40,0)"); ctx.fillStyle = fl; ctx.fillRect(0, 462, W, 438);
          // focus de llum
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          for (const [sx, tx, c] of [[60, MODEL_X, "#4FD1FF"], [1540, MY_X, "#FF4FA0"]]) { const sw = Math.sin(t * 0.7 + sx) * 40; const g = ctx.createLinearGradient(sx, 0, tx, 560); g.addColorStop(0, rgba(c, 0.32)); g.addColorStop(1, rgba(c, 0.04)); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx - 20, 0); ctx.lineTo(sx + 20, 0); ctx.lineTo(tx + 150 + sw, 560); ctx.lineTo(tx - 150 + sw, 560); ctx.closePath(); ctx.fill(); }
          // reflexos de la bola de miralls
          for (let i = 0; i < 26; i++) { const a = spotsA + i * 2.4, R = 160 + (i * 97) % 640, px = 800 + Math.cos(a) * R, py = 330 + Math.sin(a * 1.3 + i) * 220; ctx.fillStyle = rgba(NEON[i % 5], 0.22 + party * 0.15); ctx.beginPath(); ctx.ellipse(px, py, 7 + (i % 3) * 2, 5, 0, 0, 6.28); ctx.fill(); }
          ctx.restore();
          // bola de miralls
          ctx.strokeStyle = "#8A8A9A"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(800, 0); ctx.lineTo(800, 40); ctx.stroke();
          Sprites.draw(ctx, mirrorBall(), 800, 92, { s: 0.95, rot: Math.sin(t * 0.4) * 0.15 });
          // robots
          drawRobot(ctx, model, MODEL_X, MODEL_Y, 0.74, t);
          drawRobot(ctx, mine, MY_X, MY_Y, 0.98, t + 1.7);
          // cinta de passos
          const items = phase === "free" || phase === "freeIntro" ? set : seq;
          const gap = 18, ws = items.map(s => Math.max(plateSize(ctx, s[0], psz).w, measure(ctx, s[1], 17, 800, FONT_T) + 46));
          const rows = [[]]; let rw = 0;
          items.forEach((s, i) => { if (rows[rows.length - 1].length && rw + gap + ws[i] > 1360) { rows.push([]); rw = 0; } rw += (rw ? gap : 0) + ws[i]; rows[rows.length - 1].push(i); });
          rows.forEach((row, ri) => {
            const ty = TAPE_Y + ri * 136, tot = row.reduce((a, i) => a + ws[i], 0) + gap * (row.length - 1), bw = Math.max(520, tot + 170);
            ctx.save();
            ctx.fillStyle = "rgba(0,0,0,0.45)"; rr(ctx, 800 - bw / 2 + 6, ty - 44 + 8, bw, 92, 46); ctx.fill();
            const tg = ctx.createLinearGradient(0, ty - 44, 0, ty + 48); tg.addColorStop(0, "#3A3446"); tg.addColorStop(0.5, "#24202C"); tg.addColorStop(1, "#16131C"); ctx.fillStyle = tg; rr(ctx, 800 - bw / 2, ty - 44, bw, 92, 46); ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 2; const off = (t * (phase === "dance" ? 120 : 20)) % 28; for (let x0 = 800 - bw / 2 + 40 + off; x0 < 800 + bw / 2 - 40; x0 += 28) { ctx.beginPath(); ctx.moveTo(x0, ty - 38); ctx.lineTo(x0, ty + 42); ctx.stroke(); }
            for (const sx of [800 - bw / 2 + 46, 800 + bw / 2 - 46]) screw(ctx, sx, ty + 2, 14);
            ctx.restore();
            let x = 800 - tot / 2;
            row.forEach(i => {
              const s = items[i], w = ws[i], cx = x + w / 2; x += w + gap;
              let st = null, alpha = 1, prog = 0;
              if (phase === "free" || phase === "freeIntro") { st = free.lock === s ? "active" : null; prog = free.lock === s ? free.typed : 0; }
              else if (phase === "show") { alpha = i <= showI ? 1 : 0.35; st = i === showI ? "hint" : null; }
              else if (phase === "play") { st = i < idx ? "ok" : i === idx ? "active" : null; prog = i === idx ? typed : 0; }
              else st = "ok";
              if (phase === "dance") { const di = seq.length - mine.q.length - (mine.cur ? 1 : 0) - 1; if (i === di) st = "hint"; }
              // etiqueta amb el nom del pas
              const lab = s[1], lw = measure(ctx, lab, 17, 800, FONT_T) + 46;
              ctx.save(); ctx.globalAlpha = alpha; rr(ctx, cx - lw / 2, ty - 92, lw, 30, 15); ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fill();
              stepIcon(ctx, s[2], cx - lw / 2 + 18, ty - 70, 0.5, "#3A2A5A");
              text(ctx, lab, cx + 12, ty - 76, { size: 17, weight: 800, font: FONT_T, color: "#3A2A5A" }); ctx.restore();
              drawPlate(ctx, s[0], cx, ty + 2, { size: psz, state: st, progress: prog, alpha });
            });
          });
          // indicacions
          if (phase === "ready") { const b = Math.sin(pt * 3) * 4; ctx.save(); ctx.globalAlpha = clamp(pt * 3, 0, 1); drawPanel(ctx, 800 - 220, 386 + b - 40, 440, 80, { r: 40, blur: 18, border: "#B57CFF" }); drawKeyHint(ctx, 800, 386 + b, "Retorn", "A ballar!", { ks: 56, fs: 34, theme: "petroli" }); ctx.restore(); }
          if (phase === "show" && pt > -0.3) { ctx.save(); ctx.globalAlpha = clamp((pt + 0.3) * 3, 0, 1); rr(ctx, MODEL_X - 90, 232, 180, 40, 20); ctx.fillStyle = "rgba(255,255,255,0.92)"; ctx.fill(); text(ctx, "Mira'm!", MODEL_X, 253, { size: 24, weight: 900, font: FONT_T, color: "#3C86C8" }); ctx.restore(); }
          if (phase === "freeIntro" || phase === "free" || phase === "end") {
            const k = phase === "freeIntro" ? Ease.outBack(clamp(pt / 0.5, 0, 1)) : 1;
            ctx.save(); ctx.translate(800, 384); ctx.scale(k, k);
            const label = phase === "end" ? "Coreografia guardada!" : `Ball lliure  ${Math.min(free.n, 6)} / 6`;
            ctx.font = `900 34px ${FONT_T}`; const w = ctx.measureText(label).width + 70;
            drawPanel(ctx, -w / 2, -34, w, 68, { r: 34, blur: 16, border: "#FF4FA0" }); text(ctx, label, 0, 2, { size: 34, weight: 900, font: FONT_T, color: "#3A2A5A" });
            ctx.restore();
          }
          drawVignette(ctx, 0.4, "10,0,25");
        },
      };
    },
  });
})();
