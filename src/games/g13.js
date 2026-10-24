"use strict";
/* 13. Torre fins als núvols — blocs de fusta pintada, grua de joguina i física senzilla de balanceig */
(() => {
  const G0 = 800;          // terra a la pantalla quan la càmera és a baix
  const TOPS = 612;        // on volem veure el cim de la torre
  const PIV = [800, 142];  // carro de la grua (punt de penjada)
  const BASEX = 800, BH = 104;
  const COLS = ["#E8453C", "#F5B82E", "#3B8FE0", "#46B35C", "#F5862A", "#9A5BD0", "#22B0A2", "#F07AA8"];
  const SHAPES = ["la teulada", "el rellotge", "el campanar", "la cúpula", "el castell", "la bandera"];
  const MC = makeCanvas(4, 4).getContext("2d");

  /* ---------- bloc de fusta pintada (prerenderitzat) ---------- */
  const blockSpr = (col, w) => Sprites.get(`g13b${col}${w}`, w + 8, BH + 24, (c) => {
    const art=Art.cell("tower-blocks",Math.max(0,COLS.indexOf(col)),4,2,w+8,BH+24);
    if(art){c.drawImage(art,0,0,w+8,BH+24);return;}
    const x0 = 4, y0 = 18, d = 14;
    // cara de dalt en perspectiva
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + d, y0 - d); c.lineTo(x0 + w - d, y0 - d); c.lineTo(x0 + w, y0); c.closePath(); c.fillStyle = shade(col, 0.3); c.fill();
    c.save(); c.clip(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.35; c.drawImage(Tex.wood(256, 64, "#d8b080", { seed: 61 }), 0, 0, w + 8, 30); c.restore();
    // cara frontal
    rr(c, x0, y0, w, BH, 7); c.fillStyle = col; c.fill();
    c.save(); rr(c, x0, y0, w, BH, 7); c.clip();
    c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.45; c.drawImage(Tex.wood(512, 128, "#d8b080", { seed: 62 }), 0, y0, w + 8, BH);
    c.globalCompositeOperation = "source-over"; c.globalAlpha = 1;
    const g = c.createLinearGradient(0, y0, 0, y0 + BH); g.addColorStop(0, "rgba(255,255,255,0.22)"); g.addColorStop(0.45, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(40,20,0,0.25)"); c.fillStyle = g; c.fillRect(0, y0, w + 8, BH);
    // vernís: reflex
    c.fillStyle = "rgba(255,255,255,0.18)"; c.beginPath(); c.moveTo(x0 + 10, y0 + 4); c.lineTo(x0 + w * 0.42, y0 + 4); c.lineTo(x0 + w * 0.3, y0 + BH * 0.4); c.lineTo(x0 + 10, y0 + BH * 0.4); c.closePath(); c.fill();
    c.restore();
    // bisell
    c.strokeStyle = "rgba(255,255,255,0.4)"; c.lineWidth = 2; rr(c, x0 + 3, y0 + 3, w - 6, BH - 6, 5); c.stroke();
    c.strokeStyle = rgba("#2a1608", 0.45); c.lineWidth = 1.5; rr(c, x0, y0, w, BH, 7); c.stroke();
    // estrelles pintades als costats
    c.fillStyle = "rgba(255,250,235,0.85)"; for (const sx of [x0 + 24, x0 + w - 24]) { starPath(c, sx, y0 + BH / 2, 11, 5, 5); c.fill(); }
  });
  const roofSpr = (w) => Sprites.get("g13roof" + w, w + 60, 170, (c, cw) => {
    const cx = cw / 2, by = 160;
    c.beginPath(); c.moveTo(cx - w / 2 - 22, by); c.lineTo(cx, by - 120); c.lineTo(cx + w / 2 + 22, by); c.closePath(); c.fillStyle = "#C8442E"; c.fill();
    c.save(); c.clip(); c.strokeStyle = "rgba(90,20,10,0.4)"; c.lineWidth = 3; for (let y = by - 110; y < by; y += 18) { c.beginPath(); c.moveTo(0, y); c.lineTo(cw, y); c.stroke(); for (let x = (y / 18 % 2) * 14; x < cw; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 18); c.stroke(); } }
    c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.4; c.drawImage(Tex.wood(256, 128, "#d8b080", { seed: 63 }), 0, 0, cw, 170); c.restore();
    c.fillStyle = "rgba(255,255,255,0.2)"; c.beginPath(); c.moveTo(cx, by - 120); c.lineTo(cx - w / 2 - 22, by); c.lineTo(cx - w / 2, by); c.closePath(); c.fill();
    c.fillStyle = "#F5B82E"; c.beginPath(); c.arc(cx, by - 124, 12, 0, 6.28); c.fill(); c.strokeStyle = "rgba(120,60,0,0.6)"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#FFF6DA"; c.beginPath(); c.arc(cx, by - 52, 22, 0, 6.28); c.fill(); c.strokeStyle = "#8A5A20"; c.lineWidth = 4; c.stroke(); c.beginPath(); c.moveTo(cx, by - 52); c.lineTo(cx, by - 66); c.moveTo(cx, by - 52); c.lineTo(cx + 10, by - 48); c.stroke();
  });
  /* ---------- decorat ---------- */
  const citySpr = () => Sprites.get("g13city", W, 420, (c) => {
    const R = mulberry32(17);
    const hills = (y, col, amp, seed) => { const R2 = mulberry32(seed); c.fillStyle = col; c.beginPath(); c.moveTo(0, 420); for (let x = 0; x <= W; x += 40) c.lineTo(x, y - Math.sin(x / 260 + seed) * amp - R2() * 6); c.lineTo(W, 420); c.closePath(); c.fill(); };
    hills(200, "#C9DDE8", 40, 1);
    const pal = ["#F4C7B8", "#F8E1A8", "#BFE0D0", "#C9C3EA", "#F5B9C9", "#B8D8EE", "#FFD9B0"];
    for (let layer = 0; layer < 2; layer++) {
      let x = -20; while (x < W) {
        const w = 70 + R() * 90, h = (layer ? 130 : 200) + R() * (layer ? 120 : 140), col = pal[Math.floor(R() * pal.length)], y = 420 - h - (layer ? 0 : 40);
        c.fillStyle = layer ? col : mix(col, "#C9DDE8", 0.45); c.fillRect(x, y, w, h + 40);
        if (R() < 0.4) { c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + w / 2, y - 30 - R() * 20); c.lineTo(x + w + 6, y); c.closePath(); c.fillStyle = layer ? shade(col, -0.18) : mix(shade(col, -0.18), "#C9DDE8", 0.45); c.fill(); }
        c.fillStyle = layer ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)";
        for (let wy = y + 16; wy < 410; wy += 26) for (let wx = x + 12; wx < x + w - 16; wx += 22) c.fillRect(wx, wy, 10, 14);
        c.fillStyle = "rgba(0,0,0,0.06)"; c.fillRect(x + w - 10, y, 10, h + 40);
        x += w + 6 + R() * 18;
      }
    }
    c.fillStyle = "#9CCB7A"; c.fillRect(0, 404, W, 16);
  });
  const groundSpr = () => Sprites.get("g13ground", W, 260, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, "#E9C98E"); g.addColorStop(1, "#C99A5A"); c.fillStyle = g; c.fillRect(0, 0, W, 260);
    c.save(); c.globalCompositeOperation = "multiply"; c.globalAlpha = 0.5; c.fillStyle = c.createPattern(Tex.paper(256, 256, "#d9c39a", { seed: 64, fiber: 2.5 }), "repeat"); c.fillRect(0, 0, W, 260); c.restore();
    c.fillStyle = "rgba(255,240,200,0.6)"; c.fillRect(0, 0, W, 3);
    // base de formigó de la torre
    c.fillStyle = "rgba(60,40,20,0.25)"; c.beginPath(); c.ellipse(BASEX, 14, 220, 16, 0, 0, 6.28); c.fill();
    rr(c, BASEX - 190, -2, 380, 22, 6); c.fillStyle = "#B9B4AA"; c.fill(); c.fillStyle = "rgba(255,255,255,0.4)"; c.fillRect(BASEX - 184, 0, 368, 3);
    // tanca de joguina, cons, pila de sorra, carretó
    for (let x = 30; x < 520; x += 60) { rr(c, x, -46, 12, 70, 3); c.fillStyle = "#F2F2F2"; c.fill(); }
    for (const y of [-34, -6]) { c.fillStyle = "#E8453C"; c.fillRect(24, y, 500, 12); c.fillStyle = "#fff"; for (let x = 24; x < 520; x += 40) c.fillRect(x, y, 20, 12); }
    const cone = (x, y, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = "rgba(0,0,0,0.2)"; c.beginPath(); c.ellipse(4, 2, 30, 8, 0, 0, 6.28); c.fill(); c.fillStyle = "#F5862A"; c.beginPath(); c.moveTo(-18, 0); c.lineTo(-5, -60); c.lineTo(5, -60); c.lineTo(18, 0); c.closePath(); c.fill(); c.fillStyle = "#fff"; c.fillRect(-11, -36, 22, 9); c.fillStyle = "#D2691E"; c.fillRect(-26, -4, 52, 8); c.restore(); };
    cone(600, 56, 1); cone(1030, 70, 0.9); cone(470, 120, 1.1);
    c.fillStyle = "#D9B070"; c.beginPath(); c.moveTo(1050, 40); c.quadraticCurveTo(1140, -60, 1250, 40); c.closePath(); c.fill(); c.fillStyle = "rgba(255,255,255,0.3)"; c.beginPath(); c.moveTo(1090, 10); c.quadraticCurveTo(1130, -30, 1160, -18); c.lineTo(1120, 20); c.closePath(); c.fill();
    c.save(); c.translate(1420, 120); c.fillStyle = "#3B8FE0"; c.beginPath(); c.moveTo(-70, -40); c.lineTo(60, -40); c.lineTo(40, 0); c.lineTo(-50, 0); c.closePath(); c.fill(); c.fillStyle = "#2B2B2B"; c.beginPath(); c.arc(-10, 10, 18, 0, 6.28); c.fill(); c.fillStyle = "#999"; c.beginPath(); c.arc(-10, 10, 7, 0, 6.28); c.fill(); c.strokeStyle = "#7A5230"; c.lineWidth = 7; c.beginPath(); c.moveTo(50, -30); c.lineTo(110, -10); c.stroke(); c.restore();
  });
  const mastSpr = () => Sprites.get("g13mast", 60, 60, (c) => {
    c.strokeStyle = "#95602E"; c.lineWidth = 10; c.lineCap = "round"; c.beginPath(); c.moveTo(8, 0); c.lineTo(8, 60); c.moveTo(52, 0); c.lineTo(52, 60); c.stroke();
    c.lineWidth = 4; c.strokeStyle = "#C89551"; c.beginPath(); c.moveTo(8, 0); c.lineTo(52, 30); c.lineTo(8, 60); c.moveTo(8, 30); c.lineTo(52, 30); c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.45)"; c.lineWidth = 2; c.beginPath(); c.moveTo(6, 0); c.lineTo(6, 60); c.stroke();
  });
  const jibSpr = () => Sprites.get("g13jib", W, 200, (c) => {
    const y = 96, x0 = 360, x1 = 1520, mx = 1330;
    // cabina
    c.save(); c.shadowColor = "rgba(0,0,0,0.25)"; c.shadowBlur = 10; c.shadowOffsetY = 5;
    rr(c, mx - 50, y + 26, 100, 74, 10); c.fillStyle = "#C89551"; c.fill(); c.restore();
    rr(c, mx - 38, y + 36, 54, 40, 6); c.fillStyle = "#BFE3F5"; c.fill(); c.fillStyle = "rgba(255,255,255,0.6)"; c.fillRect(mx - 34, y + 40, 12, 32);
    // braç (gelosia)
    c.strokeStyle = "#95602E"; c.lineWidth = 12; c.lineCap = "round"; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.moveTo(x0 + 20, y + 30); c.lineTo(x1 - 10, y + 30); c.stroke();
    c.lineWidth = 4; c.strokeStyle = "#C89551"; c.beginPath(); for (let x = x0 + 20; x < x1 - 30; x += 40) { c.moveTo(x, y + 30); c.lineTo(x + 20, y); c.lineTo(x + 40, y + 30); } c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y - 2); c.lineTo(x1, y - 2); c.stroke();
    // pal de dalt i tirants
    c.strokeStyle = "#95602E"; c.lineWidth = 10; c.beginPath(); c.moveTo(mx, y); c.lineTo(mx, y - 70); c.stroke();
    c.strokeStyle = "#8A6A40"; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, y - 70); c.lineTo(x0 + 60, y); c.moveTo(mx, y - 70); c.lineTo(x1 - 20, y); c.stroke();
    // contrapès
    rr(c, x1 - 110, y + 32, 90, 56, 6); c.fillStyle = "#8C9399"; c.fill(); c.fillStyle = "rgba(255,255,255,0.3)"; c.fillRect(x1 - 104, y + 36, 78, 6); c.fillStyle = "#6D747A"; c.fillRect(x1 - 110, y + 60, 90, 3);
  });
  const cloudSpr = (seed) => Sprites.get("g13cl" + seed, 420, 200, (c) => {
    const R = mulberry32(seed), puffs = [];
    for (let i = 0; i < 16; i++) { const k = i / 15, x = 60 + k * 300 + (R() - 0.5) * 20, r = 22 + Math.sin(k * Math.PI) * (34 + R() * 26); puffs.push([x, 150 - r * 0.85 - R() * 10, r]); }
    const path = () => { c.beginPath(); for (const [x, y, r] of puffs) { c.moveTo(x + r, y); c.arc(x, y, r, 0, 6.28); } c.rect(60, 120, 300, 30); };
    c.save(); c.shadowColor = "rgba(110,140,180,0.35)"; c.shadowBlur = 22; c.shadowOffsetY = 10; path(); c.fillStyle = "#EEF3FA"; c.fill(); c.restore();
    c.save(); path(); c.clip();
    const g = c.createLinearGradient(0, 40, 0, 155); g.addColorStop(0, "#FFFFFF"); g.addColorStop(0.6, "#F6F9FD"); g.addColorStop(1, "#D5E0EE"); c.fillStyle = g; c.fillRect(0, 0, 420, 200);
    for (const [x, y, r] of puffs) { const h = c.createRadialGradient(x - r * 0.35, y - r * 0.45, 1, x, y, r); h.addColorStop(0, "rgba(255,255,255,0.95)"); h.addColorStop(0.7, "rgba(255,255,255,0)"); c.fillStyle = h; c.beginPath(); c.arc(x, y, r, 0, 6.28); c.fill(); }
    c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 1.2; for (let i = 0; i < 160; i++) { const x = 50 + R() * 320, y = 40 + R() * 100, a = R() * 6.28; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + 1) * 5, y + Math.sin(a + 1) * 5, x + Math.cos(a) * 9, y + Math.sin(a) * 9); c.stroke(); }
    c.restore();
  });

  Games.register({
    id: 13, key: "n", name: "Torre fins als núvols", zone: "costa", music: "build", demoTime: 10, missAt: [800, 268],
    collect: { one: "forma de bloc", many: "formes de bloc" },
    goal: l => l <= 3 ? "Escriu la lletra del bloc quan passi pel mig per deixar-lo caure. Arriba als núvols!" : l === 4 ? "Escriu la síl·laba del bloc per deixar-lo caure ben centrat. Arriba als núvols!" : "Escriu la paraula de cada pis per construir la torre fins als núvols.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#7EC3EE"); g.addColorStop(1, "#D8F0FA"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      if(Art.get("tower-bg"))ctx.drawImage(Art.get("tower-bg"),0,0,w,h);
      const s = Math.min(w / 320, h / 230); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      Sprites.draw(ctx, cloudSpr(3), -150, -90, { s: 0.5 }); Sprites.draw(ctx, cloudSpr(5), 160, -70, { s: 0.45 });
      ctx.fillStyle = "#E9C98E"; ctx.fillRect(-400, 100, 800, 200);
      for (let i = 0; i < 3; i++) Sprites.draw(ctx, blockSpr(COLS[i + 1], 150), -40 + (i - 1) * 8, 100 - 30 - i * 52, { s: 0.6, ay: 0.5 });
      ctx.strokeStyle = "#E0A21E"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-220, -112); ctx.lineTo(220, -112); ctx.stroke();
      const sw = Math.sin(t * 1.6) * 0.25, px = 20, py = -110, L = 92;
      ctx.strokeStyle = "#4A3A30"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.sin(sw) * L, py + Math.cos(sw) * L); ctx.stroke();
      const bx = px + Math.sin(sw) * (L + 34), by = py + Math.cos(sw) * (L + 34);
      Sprites.draw(ctx, blockSpr(COLS[0], 150), bx, by, { s: 0.75, rot: -sw });
      drawPlate(ctx, "n", bx, by + 4, { size: 64, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level;
      const P = [null,
        { A: 120, per: 3.8, k: 0.3 }, { A: 140, per: 3.4, k: 0.35 }, { A: 160, per: 3.0, k: 0.45 },
        { A: 160, per: 3.2, k: 0.5 }, { A: 150, per: 3.8, k: 0.5 }, { A: 160, per: 3.8, k: 0.55 }][L];
      const GOAL = L <= 4 ? 20 : 14;
      const pool = api.pool({});
      const size = L <= 4 ? 64 : 46;
      const recKey = `g13rec_${api.profile && api.profile.id != null ? api.profile.id : 0}_${L}`;
      const record = Store.get(recKey, 0);
      const tower = [], fallers = [], pops = [], fireworks = [];
      const st = { phase: "lower", t: 0, cam: 0, camT: 0, phi: 0, phiV: 0, H: 0, swingT: 0, amp: 0, cable: 30, done: false, endT: 0, ci: 0 };
      let cur = null;
      api.hud.progress = [0, GOAL]; api.hud.label = record ? L_("Rècord: {n}", { n: record }) : null;
      const widthFor = txt => L <= 4 ? 230 : Math.max(330, Math.ceil(measure(MC, disp(txt), size) + size * 0.62 + 90));
      function next() {
        const text = pool.next();
        cur = { text, typed: 0, w: widthFor(text), col: COLS[st.ci++ % COLS.length], wob: 0 };
        st.phase = "lower"; st.t = 0; st.cable = 20; st.amp = 0; st.swingT = 0;
      }
      next();
      const groundY = () => G0 + st.cam;
      const topLocal = () => tower.length ? tower[tower.length - 1] : null;
      /* punt local de la torre (sense balanceig) → pantalla, amb la rotació φ sobre la base */
      function toScreen(x, y) { const gy = groundY(), dx = x - BASEX, dy = y - gy, c = Math.cos(st.phi), s = Math.sin(st.phi); return [BASEX + dx * c - dy * s, gy + dx * s + dy * c]; }
      const ropeLen = () => st.cable + 34 + BH / 2;
      function hanging() {
        const th = st.amp * Math.sin(st.swingT * 2 * Math.PI / (P.per / api.speed));
        const Lr = ropeLen(); return { th, x: PIV[0] + Math.sin(th) * Lr, y: PIV[1] + Math.cos(th) * Lr };
      }
      function release() {
        const h = hanging(), top = topLocal(), tx = top ? top.x : BASEX;
        const xf = tx + (h.x - tx) * P.k * (L >= 5 ? 0.8 : 1);
        cur.drop = { x0: h.x, y0: h.y, r0: -h.th, xf, t: 0 };
        st.phase = "drop"; st.t = 0; Sfx.play("whoosh");
      }
      function land() {
        const d = cur.drop, top = topLocal(), below = top ? top.x : BASEX;
        const blk = { x: d.xf, hb: st.H, w: cur.w, col: cur.col, text: cur.text, sq: 0.86 };
        tower.push(blk); st.H += BH;
        const off = blk.x - below, good = Math.abs(off) < 14;
        Sfx.play("wood"); if (good) setTimeout(() => Sfx.play("chime", { note: 79 + Math.min(12, tower.length) }), 80);
        Sfx.play("note", { note: 60 + [0, 2, 4, 7, 9][tower.length % 5] + 12 * Math.floor(tower.length / 5) % 24, d: 0.4, type: "triangle", v: 0.14 });
        const [sx, sy] = toScreen(blk.x, groundY() - blk.hb);
        api.particles.emit(sx - blk.w / 2, sy, { count: 8, color: ["#E9D8B8", "#D9C29A", "#FFFFFF"], speed: 140, gravity: -40, size: 16, life: 0.7, angle: Math.PI, spread: 0.6, drag: 0.9 });
        api.particles.emit(sx + blk.w / 2, sy, { count: 8, color: ["#E9D8B8", "#D9C29A", "#FFFFFF"], speed: 140, gravity: -40, size: 16, life: 0.7, angle: 0, spread: 0.6, drag: 0.9 });
        if (good) { pops.push({ txt: "Ben centrat!", x: sx - blk.w / 2 - 150, y: sy - BH / 2, t: 0 }); api.particles.emit(sx, sy - BH / 2, { count: 14, color: ["#FFE08A", "#FFFFFF"], shape: "star", speed: 260, gravity: 200, size: 14, life: 0.8 }); }
        st.phiV += clamp(off / blk.w, -1, 1) * 0.05;
        // el bloc nou cau si el seu centre queda fora del de sota
        if (top && Math.abs(off) > top.w / 2) { tower.pop(); st.H -= BH; tumble([blk], Math.sign(off)); pops.push({ txt: "Uf! Ha caigut", x: sx - top.w / 2 - 160, y: sy - BH / 2, t: 0, bad: true }); Sfx.play("thud"); }
        else {
          // la resta de la torre aguanta? (centre de masses de cada tram sobre el bloc de sota)
          for (let i = 0; i < tower.length - 1; i++) {
            let m = 0, mx = 0; for (let j = i + 1; j < tower.length; j++) { m += tower[j].w; mx += tower[j].x * tower[j].w; }
            if (Math.abs(mx / m - tower[i].x) > tower[i].w / 2) { const gone = tower.splice(i + 1); st.H = tower.length * BH; tumble(gone, Math.sign(mx / m - tower[i].x)); Sfx.play("boom"); api.shake(12); if (gone.length >= 2 && !api.demo) { st.done = true; st.fail = true; st.endT = 0; } break; }
          }
        }
        api.hud.progress = [tower.length, GOAL];
        if (record && tower.length > record) api.hud.label = "Nou rècord!";
        cur = null; st.camT = Math.max(0, st.H - (G0 - TOPS));
        if (!st.done && tower.length >= GOAL) { st.done = true; st.endT = 0; st.roof = { t: 0 }; }
        else if (!st.done) { st.phase = "wait"; st.t = 0; }
      }
      function tumble(list, dir) {
        list.forEach((b, i) => { const [sx, sy] = toScreen(b.x, groundY() - b.hb - BH / 2); fallers.push({ x: sx, y: sy, vx: dir * rand(120, 260) + rand(-30, 30), vy: -rand(40, 160) - i * 10, r: st.phi, vr: dir * rand(1.5, 3.5), col: b.col, w: b.w, text: b.text }); });
      }
      function fireworksBurst() { const x = rand(300, 1300), y = rand(160, 420); fireworks.push({ x, y, t: 0 }); api.particles.emit(x, y, { count: 34, color: ["#E8453C", "#F5B82E", "#3B8FE0", "#46B35C", "#F07AA8", "#FFFFFF"], shape: pick(["confetti", "star"]), speed: 420, gravity: 160, drag: 0.95, size: 15, life: 1.8 }); Sfx.play("pop"); setTimeout(() => Sfx.play("chime", { note: randi(76, 88) }), 90); }
      return {
        expected() { return (st.phase === "swing" || st.phase === "lower") && cur && !st.done ? cur.text[cur.typed] : null; },
        onKey(k) {
          if ((st.phase !== "swing" && st.phase !== "lower") || !cur || st.done || k.length !== 1) return;
          const ch = cur.text[cur.typed];
          if (k === ch) { cur.typed++; api.hit({ sfx: cur.typed >= cur.text.length ? "clack" : "tick" }); if (cur.typed >= cur.text.length) release(); }
          else { api.miss(ch, k, { sfx: "thud" }); cur.wob = 1; }
        },
        update(dt) {
          st.t += dt;
          if (st.phase === "lower") { st.cable = lerp(st.cable, 236, 1 - Math.pow(0.004, dt)); st.amp = lerp(st.amp, 0, 0.2); if (st.t > 0.75) { st.phase = "swing"; st.cable = 236; } }
          if (st.phase === "swing" || st.phase === "lower") { const A = P.A / ropeLen(); st.amp = lerp(st.amp, Math.asin(Math.min(0.9, A)), 1 - Math.pow(0.15, dt)); st.swingT += dt; }
          if (st.phase === "drop" && cur) { cur.drop.t += dt; if (cur.drop.t >= 0.42) land(); }
          if (st.phase === "wait" && st.t > 0.35) next();
          if (cur) cur.wob = Math.max(0, cur.wob - dt * 2);
          // balanceig de la torre: molla amortida cap a la inclinació del centre de masses
          let m = 0, mx = 0; for (const b of tower) { m += b.w; mx += b.x * b.w; }
          const lean = m ? clamp((mx / m - BASEX) / 400, -0.04, 0.04) : 0, wind = Math.sin(api.t * 0.9) * 0.0016 * Math.min(1, tower.length / 8);
          const acc = -16 * (st.phi - lean * 0.25 - wind) - 2.0 * st.phiV; st.phiV += acc * dt; st.phi += st.phiV * dt;
          tower.forEach(b => b.sq = lerp(b.sq, 1, 1 - Math.pow(0.001, dt)));
          st.cam = lerp(st.cam, st.camT, 1 - Math.pow(0.08, dt));
          for (let i = fallers.length - 1; i >= 0; i--) { const f = fallers[i]; f.vy += 1500 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.r += f.vr * dt; if (f.y > H + 200) fallers.splice(i, 1); }
          for (let i = pops.length - 1; i >= 0; i--) { pops[i].t += dt; if (pops[i].t > 1.2) pops.splice(i, 1); }
          if (st.done) {
            st.endT += dt;
            if (st.roof) { st.roof.t += dt; if (st.roof.t > 0.6 && !st.roof.landed) { st.roof.landed = true; Sfx.play("wood"); Sfx.play("win"); } }
            if (!st.fail && st.endT > 0.9 && Math.floor(st.endT * 2.5) !== st.fwN && st.endT < 3.2) { st.fwN = Math.floor(st.endT * 2.5); fireworksBurst(); }
            if (st.endT > (st.fail ? 1.6 : 5.0) && !st.fin) {
              st.fin = true; if (!api.demo && tower.length > record) Store.set(recKey, tower.length);
              const ok = !st.fail || tower.length >= Math.ceil(GOAL / 2);
              api.finish(ok, { collectName: st.fail ? L_("una torre de {n} blocs", { n: tower.length }) : L_("bloc nou: {x}", { x: L_(pick(SHAPES)) }) });
            }
          }
        },
        draw(ctx) {
          // La teulada aterra abans del pla general; mantenim el resultat visible abans de puntuar.
          const reveal = st.done && !st.fail ? (Settings.reduceMotion ? (st.endT >= 0.8 ? 1 : 0) : Ease.inOutQuad(clamp((st.endT - 0.8) / 2.2, 0, 1))) : 0;
          const zoom = lerp(1, Math.min(1, (G0 - 140) / (st.H + 180)), reveal);
          const t = api.t, cam = st.cam, gy = groundY(), skyK = clamp(cam / (GOAL * BH), 0, 1);
          // cel que s'aprofundeix a mesura que pugem
          const sg = ctx.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, mix("#86C8F0", "#4E8FD8", skyK)); sg.addColorStop(1, mix("#E4F5FB", "#A9D6F5", skyK)); ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
          // núvols llunyans (parallax)
          for (const [x, y, sd, s] of [[180, 220, 3, 0.6], [1350, 330, 5, 0.5], [620, 120, 7, 0.45], [1050, -280, 9, 0.6], [260, -620, 11, 0.55], [1250, -1000, 3, 0.6]]) Sprites.draw(ctx, cloudSpr(sd), x + Math.sin(t * 0.05 + sd) * 30, y + cam * 0.35, { s, alpha: 0.85 });
          // ciutat pastel amb parallax
          const cy = G0 - 400 + cam * 0.45; if(Art.get("tower-bg")){ctx.drawImage(Art.get("tower-bg"),0,cam*0.45*(1-reveal),W,H);}else if (cy < H) ctx.drawImage(citySpr().c, 0, cy, W, 420);
          // Càmera del món: el pla final inclou la base, tots els blocs i la teulada.
          ctx.save();
          ctx.translate(BASEX, lerp(gy, G0, reveal));
          ctx.scale(zoom, zoom); ctx.translate(-BASEX, -gy);
          // terra del solar
          if (gy < H + 20 && !Art.get("tower-bg")) ctx.drawImage(groundSpr().c, 0, gy - 6, W, 260);
          // pal de la grua (s'allarga cap avall)
          const ms = mastSpr(), mtop = 186, mbot = reveal > 0 ? gy : Math.min(H, gy);
          for (let y = mtop; y < mbot; y += 60) ctx.drawImage(ms.c, 1300, y, 60, Math.min(60, mbot - y));
          // núvols de cotó a l'altura dels núvols (darrere)
          const goalY = gy - GOAL * BH;
          for (const [x, dy, sd, s] of [[300, -40, 13, 1.2], [1250, 10, 15, 1.1], [760, -150, 17, 1.0]]) Sprites.draw(ctx, cloudSpr(sd), x, goalY + dy, { s });
          // torre (rotada sobre la base)
          ctx.save(); ctx.translate(BASEX, gy); ctx.rotate(st.phi); ctx.translate(-BASEX, -gy);
          for (const b of tower) { const sp = blockSpr(b.col, b.w); ctx.drawImage(sp.c, b.x - b.w / 2 - 4, gy - b.hb - BH - 18 + BH * (1 - b.sq), sp.w, sp.h * b.sq); }
          if (st.roof && tower.length) { const top = tower[tower.length - 1], k = Ease.outBounce(clamp(st.roof.t / 0.6, 0, 1)), rs = roofSpr(top.w); ctx.drawImage(rs.c, top.x - rs.w / 2, gy - st.H - 160 - (1 - k) * 380, rs.w, rs.h); }
          ctx.restore();
          // blocs que cauen
          for (const f of fallers) { const sp = blockSpr(f.col, f.w); Sprites.draw(ctx, sp, f.x, f.y - 7, { rot: f.r }); }
          // bloc penjat del ganxo, o caient
          let hx = 0, hy = 0, hr = 0;
          if (cur) {
            if (st.phase === "drop") {
              const d = cur.drop, p = clamp(d.t / 0.42, 0, 1), top = topLocal();
              const [tx, ty] = toScreen(d.xf, gy - (top ? st.H : 0) - BH / 2);
              hx = lerp(d.x0, tx, Ease.outQuad(p)); hy = lerp(d.y0, ty, p * p); hr = lerp(d.r0, st.phi, p);
            } else {
              const h = hanging(), wob = cur.wob ? Math.sin(cur.wob * 24) * cur.wob * 0.06 : 0; hx = h.x; hy = h.y; hr = -h.th + wob;
              const hk = [PIV[0] + Math.sin(h.th) * st.cable, PIV[1] + Math.cos(h.th) * st.cable];
              ctx.strokeStyle = "#3A3030"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(PIV[0], PIV[1]); ctx.lineTo(hk[0], hk[1]); ctx.stroke();
              // eslingues fins a les cantonades de dalt del bloc
              const c = Math.cos(hr), s = Math.sin(hr), tl = [hx + (-cur.w / 2 + 16) * c - (-BH / 2) * s, hy + (-cur.w / 2 + 16) * s + (-BH / 2) * c], trr = [hx + (cur.w / 2 - 16) * c - (-BH / 2) * s, hy + (cur.w / 2 - 16) * s + (-BH / 2) * c];
              ctx.strokeStyle = "#5A4A40"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(tl[0], tl[1]); ctx.lineTo(hk[0], hk[1] + 14); ctx.lineTo(trr[0], trr[1]); ctx.stroke();
              ctx.save(); ctx.translate(hk[0], hk[1]); ctx.rotate(-h.th); ctx.strokeStyle = "#7A7F86"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 10, 9, -0.6, Math.PI + 0.6, false); ctx.stroke(); ctx.fillStyle = "#E8453C"; rr(ctx, -10, -8, 20, 12, 3); ctx.fill(); ctx.restore();
            }
            Sprites.draw(ctx, blockSpr(cur.col, cur.w), hx, hy - 7, { rot: hr });
          }
          // braç i carro (davant)
          const jib=Art.cell("tower-jib",0,1,1,1180,300);if(jib)ctx.drawImage(jib,350,65,1180,300);else ctx.drawImage(jibSpr().c, 0, 0, W, 200);
          ctx.fillStyle = "#3A3A40"; rr(ctx, PIV[0] - 26, 120, 52, 20, 5); ctx.fill(); ctx.fillStyle = "#6A6A72"; ctx.beginPath(); ctx.arc(PIV[0] - 14, 120, 6, 0, 6.28); ctx.arc(PIV[0] + 14, 120, 6, 0, 6.28); ctx.fill();
          // guia: línia discontínua del centre de la torre
          if (cur && st.phase === "swing") { const top = topLocal(), [tx, ty] = toScreen(top ? top.x : BASEX, gy - st.H); ctx.save(); ctx.setLineDash([10, 12]); ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, ty - 6); ctx.lineTo(tx, ty - 70); ctx.stroke(); ctx.restore(); ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.moveTo(tx - 9, ty - 78); ctx.lineTo(tx + 9, ty - 78); ctx.lineTo(tx, ty - 66); ctx.closePath(); ctx.fill(); }
          // núvols de cotó davant de tot quan hi arribem
          for (const [x, dy, sd, s] of [[120, 70, 19, 1.0], [1480, 60, 21, 1.1]]) Sprites.draw(ctx, cloudSpr(sd), x, goalY + dy, { s, alpha: 0.95 });
          // plaques (sempre dretes)
          for (const b of tower) { const [px, py] = toScreen(b.x, gy - b.hb - BH / 2); if (reveal > 0 || (py > -60 && py < H + 60)) drawPlate(ctx, b.text, px, py + 2, { size, shadowBlur: 4, shadowY: 2 }); }
          for (const f of fallers) drawPlate(ctx, f.text, f.x, f.y, { size, alpha: 0.9 });
          if (cur) drawPlate(ctx, cur.text, hx, hy + 2, { size, progress: cur.typed, state: st.phase === "swing" ? "active" : null, shadowBlur: 6 });
          for (const p of pops) { const k = p.t / 1.2; ctx.save(); ctx.globalAlpha = 1 - Ease.inCubic(k); text(ctx, p.txt, p.x, p.y - k * 40, { size: 36, weight: 900, font: FONT_T, color: p.bad ? "#FFE3DC" : "#FFFFFF", stroke: p.bad ? UI.coralDark : BRAND.petroli, lw: 8 }); ctx.restore(); }
          ctx.restore();
          drawVignette(ctx, 0.18, "30,60,90");
        },
      };
    },
  });
})();
