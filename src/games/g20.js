"use strict";
/* 20. L'eco de la cova — cristalls que canten: cada lletra té un color i una nota fixos */
(() => {
  const ALPHA = "abcdefghijklmnopqrstuvwxyzç";
  const BASE = { "à": "a", "é": "e", "è": "e", "í": "i", "ï": "i", "ò": "o", "ó": "o", "ú": "u", "ü": "u" };
  const PAL = ["#FF5D7A", "#FFB23E", "#FFE45C", "#5EE08A", "#3FD6E0", "#4F8CFF", "#A67BFF", "#FF7BD8"];
  const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88, 91]; // la menor pentatònica en dues octaves
  const idxOf = item => { const c = item[0]; const i = ALPHA.indexOf(BASE[c] || c); return i < 0 ? 0 : i; };
  const colOf = item => PAL[(idxOf(item) * 3) % PAL.length];
  const noteOf = item => PENTA[(idxOf(item) * 7) % PENTA.length];
  // racons de la cova on hi ha els cristalls (base a la paret, apunten cap al centre)
  const SLOTS = [[64, 712, 1.0], [48, 438, 0.92], [236, 168, 0.9], [566, 78, 0.85], [1034, 78, 0.85], [1364, 168, 0.9], [1552, 438, 0.92], [1536, 712, 1.0]];
  const SLOT_ROT = SLOTS.map(([x, y]) => Math.atan2(470 - y, 800 - x) + Math.PI / 2);
  const START = { 1: 2, 2: 3, 3: 3, 4: 2, 5: 1, 6: 1 }, GOAL = { 1: 8, 2: 8, 3: 8, 4: 5, 5: 4, 6: 3 };
  const STONE = [800, 652, 480, 92];

  /* ---------- cristalls prerenderitzats (un per color + un neutre) ---------- */
  const CR = {};
  function crystal(col) {
    const key = col || "neutre"; if (CR[key]) return CR[key];
    const w = 220, h = 270, S = 1.5, c = makeCanvas(w * S, h * S), x = c.getContext("2d"); x.scale(S, S);
    const base = col || "#9AA6E0", bx = w / 2, by = h - 30, lit = !!col;
    // roca de la base
    x.fillStyle = "#1E1A2E"; blobPath(x, bx, by + 8, 74, 5, 0.25, 9); x.fill();
    x.fillStyle = "rgba(140,130,200,0.28)"; blobPath(x, bx - 8, by + 2, 58, 6, 0.25, 9); x.fill();
    const prisms = [[-0.5, 92, 36, -50], [0.52, 86, 34, 50], [-0.22, 148, 48, -24], [0.24, 132, 46, 26], [0.02, 205, 62, 0]];
    prisms.forEach(([a, len, wd, dx], k) => {
      x.save(); x.translate(bx + dx, by); x.rotate(a * 0.62);
      const hw = wd / 2, tip = wd * 0.78, y1 = -len + tip;
      const poly = pts => { x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); };
      const L = [[-hw, 0], [-hw, y1], [0, -len], [-hw * 0.3, y1 + tip * 0.22], [-hw * 0.3, 0]];
      const C = [[-hw * 0.3, 0], [-hw * 0.3, y1 + tip * 0.22], [0, -len], [hw * 0.4, y1 + tip * 0.18], [hw * 0.4, 0]];
      const Rf = [[hw * 0.4, 0], [hw * 0.4, y1 + tip * 0.18], [0, -len], [hw, y1], [hw, 0]];
      x.globalAlpha = lit ? 0.97 : 0.9;
      poly(L); x.fillStyle = shade(base, lit ? -0.32 : -0.42); x.fill();
      let g = x.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, shade(base, -0.25)); g.addColorStop(0.55, base); g.addColorStop(1, shade(base, lit ? 0.6 : 0.42));
      poly(C); x.fillStyle = g; x.fill();
      g = x.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, shade(base, -0.05)); g.addColorStop(1, shade(base, lit ? 0.75 : 0.55));
      poly(Rf); x.fillStyle = g; x.fill();
      x.globalAlpha = 1;
      // refracció: nucli clar, línies internes i reflex de l'altra cara
      x.save(); poly(C); x.clip();
      g = x.createLinearGradient(-hw * 0.3, 0, hw * 0.4, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.5, `rgba(255,255,255,${lit ? 0.4 : 0.18})`); g.addColorStop(1, "rgba(255,255,255,0)");
      x.fillStyle = g; x.fillRect(-hw, y1 * 0.95, wd, -y1 * 0.8);
      x.strokeStyle = `rgba(255,255,255,${lit ? 0.5 : 0.28})`; x.lineWidth = 1.2;
      for (let q = 0; q < 3; q++) { x.beginPath(); x.moveTo(-hw * 0.15 + q * hw * 0.18, -len * 0.06); x.lineTo(-hw * 0.08 + q * hw * 0.14, y1 - q * 8); x.stroke(); }
      x.restore();
      x.save(); poly(L); x.clip(); x.fillStyle = `rgba(255,255,255,${lit ? 0.25 : 0.12})`; x.beginPath(); x.moveTo(-hw, y1 * 0.4); x.lineTo(-hw * 0.3, y1 * 0.55); x.lineTo(-hw * 0.3, y1 * 0.7); x.lineTo(-hw, y1 * 0.55); x.closePath(); x.fill(); x.restore();
      // arestes brillants
      x.strokeStyle = `rgba(255,255,255,${lit ? 0.9 : 0.6})`; x.lineWidth = 1.8; x.beginPath(); x.moveTo(hw * 0.4, -4); x.lineTo(hw * 0.4, y1 + tip * 0.18); x.lineTo(0, -len); x.stroke();
      x.strokeStyle = `rgba(255,255,255,${lit ? 0.55 : 0.35})`; x.lineWidth = 1.2; x.beginPath(); x.moveTo(-hw * 0.3, -4); x.lineTo(-hw * 0.3, y1 + tip * 0.22); x.lineTo(0, -len); x.stroke();
      x.strokeStyle = "rgba(10,8,25,0.55)"; x.lineWidth = 1.4; poly([[-hw, 0], [-hw, y1], [0, -len], [hw, y1], [hw, 0]]); x.stroke();
      g = x.createLinearGradient(0, 0, 0, -40); g.addColorStop(0, "rgba(20,16,36,0.85)"); g.addColorStop(1, "rgba(20,16,36,0)");
      poly([[-hw, 0], [-hw, -44], [hw, -44], [hw, 0]]); x.fillStyle = g; x.fill();
      if (k >= 3) { x.fillStyle = `rgba(255,255,255,${lit ? 0.95 : 0.7})`; starPath(x, hw * 0.12, -len + tip * 0.5, 7, 1.6, 4); x.fill(); }
      x.restore();
    });
    return (CR[key] = { c, w, h, ax: bx / w, ay: by / h });
  }
  const GL = {};
  function glow(col) {
    if (GL[col]) return GL[col];
    const c = makeCanvas(256, 256), x = c.getContext("2d"), [r, g, b] = hexToRgb(col);
    const gr = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, `rgba(${r},${g},${b},0.9)`); gr.addColorStop(0.25, `rgba(${r},${g},${b},0.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
    x.fillStyle = gr; x.fillRect(0, 0, 256, 256); return (GL[col] = c);
  }

  /* ---------- fons de la cova (roca humida) ---------- */
  let BG = null, SHEEN = null;
  function buildBg() {
    if (BG) return BG;
    const c = makeCanvas(W, H), x = c.getContext("2d");
    const n = makeNoise(2020), sw = 534, sh = 300;
    const rock = Tex.pixels(sw, sh, (i, j) => {
      const u = i / sw, v = j / sh, dx = (u - 0.5) * 1.5, dy = (v - 0.46) * 1.25, d = Math.sqrt(dx * dx + dy * dy);
      const f = n.fbm(i / 30, j / 24, 5), f2 = n.fbm((i - 1.5) / 30, (j - 1.5) / 24, 5), emb = (f - f2) * 6;
      const rid = 1 - Math.abs(n.fbm(i / 18 + 9, j / 14, 3) * 2 - 1), crev = 1 - clamp((rid - 0.88) * 3, 0, 0.3);
      const strata = Math.sin(j / 5 + f * 9) * 0.5 + 0.5;
      const wall = clamp((d - 0.22) * 1.7, 0, 1), k = (0.16 + wall * (0.3 + f * 0.6) + strata * 0.08 * wall) * crev + clamp(emb, -0.2, 0.35) * wall;
      return [clamp(26 + k * 92, 0, 255), clamp(22 + k * 80, 0, 255), clamp(48 + k * 125, 0, 255)];
    });
    x.imageSmoothingEnabled = true; x.drawImage(rock, 0, 0, W, H);
    // profunditat al fons de la cova
    let g = x.createRadialGradient(800, 380, 40, 800, 400, 520); g.addColorStop(0, "rgba(6,6,20,0.85)"); g.addColorStop(1, "rgba(6,6,20,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    // estalactites
    const R = mulberry32(31);
    for (let k = 0; k < 22; k++) {
      const px = 120 + R() * 1360, len = 40 + R() * 120, wd = 14 + R() * 26;
      if (Math.abs(px - 566) < 70 || Math.abs(px - 1034) < 70) continue;
      g = x.createLinearGradient(px - wd, 0, px + wd, 0); g.addColorStop(0, "#2A2442"); g.addColorStop(0.6, "#4A4270"); g.addColorStop(1, "#231E38");
      x.fillStyle = g; x.beginPath(); x.moveTo(px - wd, 0); x.quadraticCurveTo(px - wd * 0.4, len * 0.6, px, len); x.quadraticCurveTo(px + wd * 0.4, len * 0.6, px + wd, 0); x.closePath(); x.fill();
      x.fillStyle = "rgba(200,210,255,0.35)"; x.beginPath(); x.arc(px, len - 2, 2, 0, 6.28); x.fill();
    }
    // terra de la cova
    g = x.createLinearGradient(0, 600, 0, H); g.addColorStop(0, "rgba(40,34,66,0)"); g.addColorStop(0.3, "#2B2546"); g.addColorStop(1, "#1A1630"); x.fillStyle = g;
    x.beginPath(); x.moveTo(0, H); x.lineTo(0, 700); x.quadraticCurveTo(400, 600, 800, 610); x.quadraticCurveTo(1200, 600, W, 700); x.lineTo(W, H); x.closePath(); x.fill();
    // bassal que reflecteix
    x.fillStyle = "rgba(90,110,190,0.18)"; x.beginPath(); x.ellipse(800, 830, 520, 40, 0, 0, 6.28); x.fill();
    x.strokeStyle = "rgba(180,200,255,0.18)"; x.lineWidth = 2; x.beginPath(); x.ellipse(800, 830, 520, 40, 0, 3.4, 6.0); x.stroke();
    // la pedra plana
    const [sx, sy, rx, ry] = STONE;
    x.save(); x.shadowColor = "rgba(0,0,0,0.6)"; x.shadowBlur = 40; x.shadowOffsetY = 20;
    x.fillStyle = "#2E2848"; x.beginPath(); x.ellipse(sx, sy + 44, rx, ry, 0, 0, 6.28); x.fill(); x.restore();
    g = x.createLinearGradient(0, sy, 0, sy + ry + 48); g.addColorStop(0, "#4A4268"); g.addColorStop(1, "#231E3A");
    x.fillStyle = g; x.beginPath(); x.ellipse(sx, sy + 44, rx, ry, 0, 0, Math.PI); x.lineTo(sx - rx, sy); x.ellipse(sx, sy, rx, ry, 0, Math.PI, 0, true); x.closePath(); x.fill();
    x.save(); x.beginPath(); x.ellipse(sx, sy, rx, ry, 0, 0, 6.28); x.clip();
    const top = Tex.pixels(240, 48, (i, j) => { const v = n.fbm(i / 14 + 50, j / 6, 4); const k = 70 + v * 60; return [k * 0.95, k * 0.9, k * 1.25]; });
    x.drawImage(top, sx - rx, sy - ry, rx * 2, ry * 2);
    g = x.createRadialGradient(sx, sy - 40, 20, sx, sy, rx); g.addColorStop(0, "rgba(160,150,220,0.25)"); g.addColorStop(1, "rgba(10,8,25,0.55)"); x.fillStyle = g; x.fillRect(sx - rx, sy - ry, rx * 2, ry * 2);
    x.restore();
    x.strokeStyle = "rgba(190,180,255,0.35)"; x.lineWidth = 2; x.beginPath(); x.ellipse(sx, sy, rx - 2, ry - 2, 0, Math.PI * 1.05, Math.PI * 1.95); x.stroke();
    BG = c;
    // brillantor humida de les parets (es mostra quan un cristall s'encén)
    SHEEN = makeCanvas(W, H); const s = SHEEN.getContext("2d"), R2 = mulberry32(7);
    for (let k = 0; k < 340; k++) {
      const px = R2() * W, py = R2() * 760; if (dist(px, py, 800, 420) < 330) continue;
      s.strokeStyle = `rgba(255,255,255,${0.05 + R2() * 0.12})`; s.lineWidth = 1.5 + R2() * 3; s.lineCap = "round";
      s.beginPath(); s.moveTo(px, py); s.quadraticCurveTo(px + (R2() - 0.5) * 16, py + 10, px + (R2() - 0.5) * 14, py + 8 + R2() * 26); s.stroke();
    }
    for (let k = 0; k < 260; k++) { const px = R2() * W, py = R2() * 780; if (dist(px, py, 800, 420) < 300) continue; s.fillStyle = `rgba(255,255,255,${0.3 + R2() * 0.5})`; s.beginPath(); s.arc(px, py, 0.8 + R2() * 2.2, 0, 6.28); s.fill(); }
    return BG;
  }
  function tablet(w, h) {
    return Sprites.get(`z20tab${Math.round(w)}x${Math.round(h)}`, w + 16, h + 16, (x) => {
      x.save(); x.shadowColor = "rgba(0,0,0,0.55)"; x.shadowBlur = 8; x.shadowOffsetY = 5; rr(x, 8, 8, w, h, 16); x.fillStyle = "#3B3458"; x.fill(); x.restore();
      const g = x.createLinearGradient(0, 8, 0, h + 8); g.addColorStop(0, "#5B5384"); g.addColorStop(1, "#2C2646"); rr(x, 8, 8, w, h, 16); x.fillStyle = g; x.fill();
      x.strokeStyle = "rgba(200,190,255,0.35)"; x.lineWidth = 2; rr(x, 10, 10, w - 4, h - 4, 14); x.stroke();
      x.fillStyle = "rgba(20,16,40,0.45)"; x.beginPath(); x.arc(8 + w / 2, 8 + h / 2, Math.min(w, h) * 0.16, 0, 6.28); x.fill();
      x.strokeStyle = "rgba(200,190,255,0.25)"; x.lineWidth = 1.5; x.beginPath(); x.arc(8 + w / 2, 8 + h / 2, Math.min(w, h) * 0.26, 0, 6.28); x.stroke();
    });
  }
  function crystalNote(item, v = 1) {
    const n = noteOf(item);
    Sfx.play("bell", { note: n });
    tone({ f: NOTE(n + 12), d: 0.9, type: "sine", v: 0.05 * v, verb: true, delay: 0.02 });
    tone({ f: NOTE(n), d: 0.8, type: "sine", v: 0.045 * v, verb: true, delay: 0.36 }); // eco
    tone({ f: NOTE(n), d: 0.7, type: "sine", v: 0.02 * v, verb: true, delay: 0.7 });
  }

  Games.register({
    id: 20, key: "z", name: "L'eco de la cova", zone: "muntanya", music: "cave", demoTime: 13, captionY: 250, missAt: [800, 172], kbPos: [800, 400],
    collect: { one: "cristall rar", many: "cristalls rars" },
    goal: l => l <= 3 ? "Mira i escolta les lletres i repeteix-les en ordre. Arriba a 8!" : l === 4 ? "Mira i escolta les síl·labes i repeteix-les en ordre." : "Escolta les paraules de la cova i escriu-les en ordre.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      const g = ctx.createRadialGradient(x + w / 2, y + h * 0.45, 4, x + w / 2, y + h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, "#151230"); g.addColorStop(1, "#3D3566"); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const s = Math.min(w, h) / 132, cols = ["#3FD6E0", "#FF5D7A", "#FFE45C"], k = Math.floor(t * 1.2) % 3;
      [[0.18, 0.95, -0.5], [0.5, 0.98, 0], [0.82, 0.95, 0.5]].forEach(([u, v, r], i) => {
        const cr = crystal(i === k ? cols[i] : null), sc = 0.42 * s;
        ctx.save(); ctx.translate(x + w * u, y + h * v); ctx.rotate(r); ctx.drawImage(cr.c, -cr.w * cr.ax * sc, -cr.h * cr.ay * sc, cr.w * sc, cr.h * sc); ctx.restore();
        if (i === k) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4); const gs = 120 * s; ctx.drawImage(glow(cols[i]), x + w * u - gs / 2, y + h * v - 50 * s - gs / 2, gs, gs); ctx.restore(); }
      });
      drawPlate(ctx, "z", x + w / 2, y + h * 0.36, { size: 44 * s, border: cols[k], borderW: 4 * s, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, start = START[L], goalN = GOAL[L];
      buildBg();
      const pool = api.pool(L >= 5 ? { filter: w => w.length <= 10 } : undefined);
      const pid = (api.profile && api.profile.id) || "anon", rKey = `eco20.${pid}.${L}`;
      let record = Store.get(rKey, 0);
      const st = { phase: "intro", t: 0, len: start, idx: 0, typed: 0, showI: -1, failI: -1, dark: 0, best: 0, newRec: 0 };
      let seq = [];
      const slotOf = i => goalN <= 1 ? 3 : Math.round(i * 7 / (goalN - 1));
      const light = SLOTS.map(() => ({ v: 0, hold: 0, col: PAL[0] }));
      const motes = Array.from({ length: 34 }, () => ({ x: rand(100, 1500), y: rand(120, 720), vx: rand(-6, 6), vy: rand(-10, -3), p: rand(0, 6.28) }));
      const drips = [];
      const showVoiceOnly = L >= 5;
      const hideWords = () => showVoiceOnly && Settings.voice;
      function extend() { const used = seq.slice(-2); seq.push(pool.next(used)); }
      for (let i = 0; i < start; i++) extend();
      const step = () => (L <= 3 ? 1.0 : L === 4 ? 1.2 : 1.9) / clamp(api.speed, 0.7, 1.4);
      function lightItem(i, v = 1, hold = 0.5) { const s = slotOf(i); light[s].v = v; light[s].hold = hold; light[s].col = colOf(seq[i]); }
      function beginShow() { st.phase = "show"; st.t = 0; st.showI = -1; st.idx = 0; st.typed = 0; }
      const plateSizeFor = () => L <= 3 ? 66 : L === 4 ? 52 : 44;
      function layout(n) {
        const gap = L <= 3 ? Math.min(118, 920 / n) : L === 4 ? Math.min(160, 900 / n) : Math.min(220, 920 / n);
        return Array.from({ length: n }, (_, i) => [STONE[0] + (i - (n - 1) / 2) * gap, STONE[1] - 26]);
      }
      return {
        expected() { return st.phase === "input" ? seq[st.idx][st.typed] : null; },
        onKey(k) {
          if (st.phase !== "input" || k.length !== 1) return;
          const item = seq[st.idx], ch = item[st.typed];
          if (k === ch) {
            st.typed++; api.hit({ sfx: false });
            if (L >= 4) Sfx.play("note", { note: noteOf(item) + 12, d: 0.12, v: 0.08, type: "sine" });
            if (st.typed >= item.length) {
              crystalNote(item); lightItem(st.idx);
              const [px, py] = layout(seq.length)[st.idx];
              api.particles.emit(px, py - 40, { count: 14, color: [colOf(item), "#fff"], speed: 220, gravity: 80, size: 7, life: 0.7, shape: "star", glow: true });
              st.idx++; st.typed = 0;
              if (st.idx >= seq.length) { st.phase = "win"; st.t = 0; }
            }
          } else {
            api.miss(ch, k, { sfx: "sour" });
            st.phase = "dark"; st.t = 0; st.failI = st.idx;
            noise({ f: 200, f2: 80, d: 0.6, v: 0.18, ft: "lowpass" });
          }
        },
        update(dt) {
          st.t += dt;
          light.forEach(l => { if (l.hold > 0) l.hold -= dt; else l.v = Math.max(0, l.v - dt * 1.4); });
          motes.forEach(m => { m.x += m.vx * dt; m.y += m.vy * dt; m.p += dt; if (m.y < 100) { m.y = 740; m.x = rand(100, 1500); } });
          if (Math.random() < dt * 0.5 && drips.length < 4) drips.push({ x: rand(200, 1400), y: rand(40, 120), vy: 0, t: 0 });
          for (let i = drips.length - 1; i >= 0; i--) { const d = drips[i]; d.t += dt; if (d.t > 0.6) { d.vy += 1400 * dt; d.y += d.vy * dt; } if (d.y > 820) { d.ripple = (d.ripple || 0) + dt; d.y = 820; if (d.ripple > 0.8) drips.splice(i, 1); } }
          if (st.phase === "intro" && st.t > 0.9) beginShow();
          if (st.phase === "show") {
            const sp = step(), i = Math.floor(st.t / sp);
            if (i !== st.showI && i < seq.length) {
              st.showI = i; lightItem(i, 1, sp * 0.55); crystalNote(seq[i]);
              if (L <= 4) api.sayItem(seq[i], "{x}"); else { api.say(seq[i]); if (hideWords()) api.clearCaption(); }
            }
            if (st.t > seq.length * sp + 0.6) { st.phase = "hide"; st.t = 0; Sfx.play("whoosh"); }
          }
          if (st.phase === "hide" && st.t > 0.45) { st.phase = "input"; st.t = 0; api.say("Ara tu!"); if (hideWords()) api.clearCaption(); }
          if (st.phase === "dark" && st.t > 1.0) { st.phase = "reveal"; st.t = 0; }
          if (st.phase === "reveal" && st.t > 2.4) { void 0; beginShow(); st.t = -0.5; }
          if (st.phase === "win") {
            // la melodia sencera ressona ràpid pels cristalls
            const k = Math.floor(st.t / 0.16); if (k !== st.winK && k < seq.length) { st.winK = k; lightItem(k, 1, 0.3); Sfx.play("note", { note: noteOf(seq[k]) + 12, d: 0.25, v: 0.07, type: "sine", verb: true }); }
            if (st.t > 0.2 && !st.praised) { st.praised = 1; Sfx.play("win"); api.particles.emit(800, 560, { count: 30, color: PAL, speed: 420, gravity: 260, size: 9, life: 1.1, shape: "star" }); }
            if (st.t > Math.max(1.6, seq.length * 0.16 + 0.8)) {
              st.winK = -1; st.praised = 0;
              const reached = seq.length; st.best = Math.max(st.best, reached);
              if (reached > record) { record = reached; Store.set(rKey, record); st.newRec = 2.2; if (!api.demo) void 0; }
              if (reached >= goalN) { st.phase = "done"; api.hud.progress = [st.best, goalN]; api.hud.label = "Rècord: " + record; api.finish(true, { collectName: "un cristall rar" }); return; }
              extend(); st.phase = "intro"; st.t = 0.3;
            }
          }
          if (st.newRec > 0) st.newRec -= dt;
          api.hud.progress = [st.best, goalN];
          api.hud.label = record ? "Rècord: " + record : null;
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(BG, 0, 0);
          // gotes que cauen del sostre
          drips.forEach(d => {
            if (d.ripple) { ctx.strokeStyle = `rgba(190,200,255,${0.5 * (1 - d.ripple / 0.8)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(d.x, 820, 8 + d.ripple * 50, 2 + d.ripple * 8, 0, 0, 6.28); ctx.stroke(); }
            else { ctx.fillStyle = "rgba(200,215,255,0.8)"; ctx.beginPath(); ctx.ellipse(d.x, d.y, 2.2, d.t > 0.6 ? 4 : 2.2 + d.t * 2, 0, 0, 6.28); ctx.fill(); }
          });
          // llum dels cristalls sobre les parets humides
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          SLOTS.forEach(([sx, sy, sc], i) => {
            const l = light[i]; if (l.v <= 0.01) return;
            const cx = sx + Math.sin(SLOT_ROT[i]) * 110 * sc, cy = sy - Math.cos(SLOT_ROT[i]) * 110 * sc, gs = 760 * sc;
            ctx.globalAlpha = l.v * 0.42; ctx.drawImage(glow(l.col), cx - gs / 2, cy - gs / 2, gs, gs);
            ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 360 * sc, 0, 6.28); ctx.clip(); ctx.globalAlpha = l.v * 0.75; ctx.drawImage(SHEEN, 0, 0); ctx.restore();
          });
          ctx.restore();
          // cristalls
          SLOTS.forEach(([sx, sy, sc], i) => {
            const l = light[i], rot = SLOT_ROT[i], tw = Math.sin(t * 0.7 + i * 1.7) * 0.012;
            const draw1 = (cr, a) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(sx, sy); ctx.rotate(rot + tw); if (i % 2) ctx.scale(-1, 1); ctx.scale(sc, sc); ctx.drawImage(cr.c, -cr.w * cr.ax, -cr.h * cr.ay, cr.w, cr.h); ctx.restore(); };
            draw1(crystal(null), 1);
            if (l.v > 0.01) {
              draw1(crystal(l.col), clamp(l.v * 1.4, 0, 1));
              const cx = sx + Math.sin(rot) * 120 * sc, cy = sy - Math.cos(rot) * 120 * sc, gs = 380 * sc;
              ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = l.v; ctx.drawImage(glow(l.col), cx - gs / 2, cy - gs / 2, gs, gs); ctx.restore();
            }
          });
          // pols que sura a la llum
          ctx.fillStyle = "rgba(220,225,255,0.5)";
          motes.forEach(m => { const a = 0.25 + 0.25 * Math.sin(m.p * 1.3); ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(m.x + Math.sin(m.p) * 6, m.y, 1.6, 0, 6.28); ctx.fill(); });
          ctx.globalAlpha = 1;
          // foscor en fallar
          let dark = 0;
          if (st.phase === "dark") dark = clamp(st.t / 0.3, 0, 1);
          else if (st.phase === "reveal") dark = st.t < 1.9 ? 1 : 1 - (st.t - 1.9) / 0.5;
          if (dark > 0) { ctx.fillStyle = `rgba(4,3,12,${0.8 * dark})`; ctx.fillRect(0, 0, W, H); }
          // plaques sobre la pedra
          const n = seq.length, pos = layout(n), size = plateSizeFor(), hidden = hideWords();
          const tw = L <= 3 ? 86 : L === 4 ? 112 : 150, th = L <= 3 ? 96 : 84;
          for (let i = 0; i < n; i++) {
            const [px, py] = pos[i], item = seq[i], col = colOf(item);
            let vis = 0, state = null, prog = 0, txt = item;
            if (st.phase === "show") { if (i <= st.showI) vis = clamp((st.t - i * step()) / 0.22, 0, 1); }
            else if (st.phase === "hide") vis = 1 - clamp(st.t / 0.35, 0, 1);
            else if (st.phase === "input") { if (i < st.idx) { vis = 1; state = "ok"; } }
            else if (st.phase === "win") { vis = 1; state = "ok"; }
            else if (st.phase === "reveal") { vis = clamp((st.t - 0.1 - i * 0.08) / 0.25, 0, 1); if (i === st.failI) state = "wrong"; }
            else if (st.phase === "dark") { if (i < st.idx) { vis = 1 - dark; state = "ok"; } }
            const showText = !(hidden && (st.phase === "show" || st.phase === "hide"));
            if (vis < 1 || !showText) { const tb = tablet(tw, th); ctx.save(); ctx.globalAlpha = 1 - (showText ? vis : 0) * 0.9; ctx.drawImage(tb.c, px - tb.w / 2, py - tb.h / 2, tb.w, tb.h); ctx.restore(); }
            // pedra preciosa del color de la lletra mentre sona
            const l = light[slotOf(i)];
            if (!showText && st.phase === "show" && i <= st.showI) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.4 + l.v * 0.6; ctx.drawImage(glow(col), px - 50, py - 50, 100, 100); ctx.restore(); }
            if (st.phase === "input" && i === st.idx && L === 4 && st.typed > 0) { drawPlate(ctx, item.slice(0, st.typed), px, py, { size, border: col, borderW: 5, progress: st.typed }); continue; }
            if (st.phase === "input" && i === st.idx) { ctx.strokeStyle = `rgba(255,240,180,${0.55 + 0.35 * Math.sin(t * 4)})`; ctx.lineWidth = 4; rr(ctx, px - tw / 2 - 4, py - th / 2 - 4, tw + 8, th + 8, 18); ctx.stroke(); }
            if (vis > 0 && showText) drawPlate(ctx, txt, px, py - (1 - vis) * 14, { size: L >= 5 ? Math.min(size, 40 + 0 * prog) : size, alpha: vis, scale: 0.85 + 0.15 * Ease.outBack(vis), state, border: state ? null : col, borderW: 5 });
          }
          // paraula que s'està escrivint (nivells 5 i 6)
          if (st.phase === "input" && L >= 5 && st.typed > 0) drawPlate(ctx, seq[st.idx].slice(0, st.typed), 800, 470, { size: 56, progress: st.typed, border: colOf(seq[st.idx]), borderW: 5 });
          // indicació de torn
          const msg = st.phase === "show" ? (hidden ? "Escolta la cova…" : "Mira i escolta…") : st.phase === "input" ? "Ara tu!" : st.phase === "win" ? "Molt bé!" : st.phase === "reveal" ? "Era així:" : "";
          if (msg) {
            const a = st.phase === "input" ? clamp(st.t * 3, 0, 1) : 1;
            ctx.save(); ctx.globalAlpha = a; text(ctx, msg, 800, st.phase === "input" && L >= 5 ? 360 : 524, { size: 44, weight: 900, font: FONT_T, color: "#F4F0FF", shadow: "rgba(120,90,255,0.8)", blur: 18, sy: 0 }); ctx.restore();
          }
          if (st.newRec > 0) { ctx.save(); ctx.globalAlpha = clamp(st.newRec, 0, 1); drawChip(ctx, 800, 400, "Nou rècord: " + record, { align: "center", fs: 28, h: 52, fill: "rgba(242,182,48,0.95)", color: BRAND.tinta }); ctx.restore(); }
          drawVignette(ctx, 0.5, "5,4,15");
        },
      };
    },
  });
})();
