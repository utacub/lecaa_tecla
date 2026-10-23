"use strict";
/* 3. Asteroides de lletres — línies vectorials de neó amb resplendor sobre negre */
(() => {
  const NEON = ["#19E6FF", "#FF3BD4", "#FFE23B"];
  const CX = 800, CY = 470, SHIELD_R = 128, DURATION = 120;

  /* ---------- síl·labes (aproximació a les regles del català) ---------- */
  const VOW = "aeiouàèéíïòóúü", CLUST = ["pl", "bl", "cl", "gl", "fl", "pr", "br", "tr", "dr", "cr", "gr", "fr"];
  function syllabify(word) {
    const u = []; // unitats: {s, v}
    for (let i = 0; i < word.length;) {
      const c = word[i], two = word.slice(i, i + 2), nx = word[i + 2] || "";
      if (c === " ") { u.push({ s: " ", sp: true }); i++; continue; }
      if (word.slice(i, i + 3) === "l·l") { u.push({ s: "l·", v: false }); i += 2; continue; }
      if (two === "ll" || two === "ny") { u.push({ s: two, v: false }); i += 2; continue; }
      if ((two === "qu" || two === "gu") && "eiéèíï".includes(nx)) { u.push({ s: two, v: false }); i += 2; continue; }
      u.push({ s: c, v: VOW.includes(c) }); i++;
    }
    // nuclis: vocal + i/u àtona (diftong decreixent)
    const nuc = []; // índexs inicials de nucli i longitud
    for (let i = 0; i < u.length; i++) {
      if (!u[i].v) continue;
      let len = 1; if (u[i + 1] && (u[i + 1].s === "i" || u[i + 1].s === "u") && "aeiouàèéòó".includes(u[i].s) && u[i].s !== u[i + 1].s && !(u[i + 2] && u[i + 2].v)) len = 2;
      nuc.push([i, len]); i += len - 1;
    }
    if (nuc.length <= 1) return [word];
    const cuts = [];
    for (let k = 0; k < nuc.length - 1; k++) {
      const a = nuc[k][0] + nuc[k][1], b = nuc[k + 1][0], cons = b - a;
      let cut;
      if (u.slice(a, b).some(x => x.sp)) { cut = a + u.slice(a, b).findIndex(x => x.sp) + 1; }
      else if (cons <= 1) cut = a;
      else { const last2 = u[b - 2].s + u[b - 1].s; cut = CLUST.includes(last2) ? b - 2 : b - 1; }
      cuts.push(cut);
    }
    const out = []; let st = 0;
    for (const c of cuts.concat([u.length])) { const s = u.slice(st, c).map(x => x.s).join(""); if (s.trim()) out.push(s.trim()); st = c; }
    return out;
  }

  /* ---------- sprites prerenderitzats ---------- */
  function rockShape(seed, n) { const R = mulberry32(seed), pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + (R() - 0.5) * 0.3; pts.push([Math.cos(a), Math.sin(a), 0.72 + R() * 0.3]); } return pts; }
  function rockSprite(seed, r, col) {
    return Sprites.get(`ast${seed}_${r}_${col}`, r * 2 + 60, r * 2 + 60, (x, w, h) => {
      const art=Art.cell('crystal-sprites',NEON.indexOf(col)===0?1:NEON.indexOf(col)===1?0:2,3,2,512,512);
      if(art){x.drawImage(art,0,0,w,h);return;}
      const pts = rockShape(seed, 9 + (seed % 5)), R = mulberry32(seed * 7), cx = w / 2, cy = h / 2;
      const path = () => { x.beginPath(); pts.forEach(([a, b, k], i) => { const px = cx + a * r * k, py = cy + b * r * k; i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); };
      path(); const core = x.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      core.addColorStop(0, mix(col, '#10243D', 0.78)); core.addColorStop(0.45, '#101B30'); core.addColorStop(1, '#030711'); x.fillStyle = core; x.fill();
      // Facetes minerals dins del tub lluminós; prerenderitzades una sola vegada.
      x.save(); path(); x.clip();
      pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; x.beginPath(); x.moveTo(cx - r * 0.18, cy - r * 0.22); x.lineTo(cx + p[0] * p[2] * r, cy + p[1] * p[2] * r); x.lineTo(cx + q[0] * q[2] * r, cy + q[1] * q[2] * r); x.closePath(); x.fillStyle = rgba(col, 0.025 + (i % 3) * 0.055); x.fill(); x.strokeStyle = rgba(col, 0.16); x.lineWidth = 0.8; x.stroke(); });
      x.restore();
      // cràters i esquerdes interiors
      x.save(); path(); x.clip(); x.strokeStyle = rgba(col, 0.32); x.lineWidth = 1.6;
      for (let k = 0; k < 3; k++) { const a = R() * 6.28, d = R() * r * 0.55, cr = r * (0.1 + R() * 0.14); x.beginPath(); x.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, cr, 0, 6.28); x.stroke(); }
      x.restore();
      x.lineJoin = "round";
      x.save(); x.shadowColor = col; x.shadowBlur = 22; x.strokeStyle = col; x.lineWidth = 4.5; path(); x.stroke(); x.shadowBlur = 10; x.stroke(); x.restore();
      x.strokeStyle = mix(col, "#FFFFFF", 0.65); x.lineWidth = 1.6; path(); x.stroke();
      pts.filter((_, i) => i % 3 === 0).forEach(p => { x.fillStyle = '#F0FDFF'; x.beginPath(); x.arc(cx + p[0] * p[2] * r, cy + p[1] * p[2] * r, 1.8, 0, Math.PI * 2); x.fill(); });
    });
  }
  function shipSprite() {
    return Sprites.get("astShip", 190, 190, (x) => {
      const art=Art.cell('crystal-sprites',3,3,2,256,256);if(art){x.translate(95,95);x.rotate(Math.PI/2);x.drawImage(art,-91,-91,182,182);return;}
      x.translate(95, 95); x.lineJoin = "round";
      const hull = () => { x.beginPath(); x.moveTo(40, 0); x.lineTo(-26, -26); x.lineTo(-14, 0); x.lineTo(-26, 26); x.closePath(); };
      hull(); const shell = x.createLinearGradient(-20, -26, 20, 26); shell.addColorStop(0, '#29475D'); shell.addColorStop(0.45, '#101E36'); shell.addColorStop(1, '#040914'); x.fillStyle = shell; x.fill();
      x.save(); x.shadowColor = NEON[0]; x.shadowBlur = 20; x.strokeStyle = NEON[0]; x.lineWidth = 4; hull(); x.stroke(); x.stroke(); x.restore();
      x.strokeStyle = "#D8FBFF"; x.lineWidth = 1.6; hull(); x.stroke();
      x.strokeStyle = '#427C9B'; x.lineWidth = 1; x.beginPath(); x.moveTo(34, 0); x.lineTo(-14, 0); x.moveTo(-21, -21); x.lineTo(8, 0); x.lineTo(-21, 21); x.stroke();
      x.fillStyle = '#88ECFF'; rr(x, -18, -19, 7, 3, 1); x.fill(); rr(x, -18, 16, 7, 3, 1); x.fill();
      x.save(); x.shadowColor = NEON[1]; x.shadowBlur = 10; x.fillStyle = NEON[1]; x.beginPath(); x.arc(8, 0, 5, 0, 6.28); x.fill(); x.restore();
    });
  }
  function arcSprite() {
    return Sprites.get("astArc", 340, 340, (x) => {
      x.translate(170, 170); x.lineCap = "round";
      const a0 = -1.0, a1 = 1.0;
      x.save();x.beginPath();x.arc(0,0,SHIELD_R,-1,1);x.arc(0,0,SHIELD_R-24,1,-1,true);x.closePath();x.clip();
      x.fillStyle='rgba(65,215,239,.12)';x.fillRect(-150,-150,300,300);x.strokeStyle='rgba(138,240,250,.25)';x.lineWidth=.7;
      for(let yy=-140;yy<150;yy+=15)for(let xx=-140;xx<150;xx+=18){x.beginPath();for(let k=0;k<6;k++)x.lineTo(xx+Math.cos(k*Math.PI/3)*10,yy+Math.sin(k*Math.PI/3)*10);x.closePath();x.stroke();}x.restore();
      x.save(); x.shadowColor = NEON[0]; x.shadowBlur = 26; x.strokeStyle = rgba(NEON[0], 0.85); x.lineWidth = 7; x.beginPath(); x.arc(0, 0, SHIELD_R, a0, a1); x.stroke(); x.stroke(); x.restore();
      x.strokeStyle = "#E6FDFF"; x.lineWidth = 2.2; x.beginPath(); x.arc(0, 0, SHIELD_R, a0, a1); x.stroke();
      x.strokeStyle = rgba(NEON[0], 0.25); x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, SHIELD_R - 12, a0 + 0.1, a1 - 0.1); x.stroke();
    });
  }
  function spaceLayers() {
    return Tex.get("astBg", () => {
      const c = makeCanvas(W, H), x = c.getContext("2d");
      const im=Art.get("crystal-bg");if(im){x.drawImage(im,0,0,W,H);return c;}
      x.fillStyle = "#020309"; x.fillRect(0, 0, W, H);
      x.globalAlpha = 0.42; x.imageSmoothingEnabled = true; x.drawImage(Tex.nebula(400, 225, "#7A1C8C", "#0C5C7A", { seed: 29, bg: "#020309" }), 0, 0, W, H); x.globalAlpha = 1;
      const g = x.createRadialGradient(CX, CY, 60, CX, CY, 900); g.addColorStop(0, "rgba(25,230,255,0.06)"); g.addColorStop(1, "rgba(0,0,0,0.5)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      return c;
    });
  }
  function drawSpace(ctx, t) {
    ctx.drawImage(spaceLayers(), 0, 0);
    if (Settings.reduceMotion) t = 0;
    const L = [[Tex.stars(W, H, { seed: 41, n: 420, max: 1.2 }), 4], [Tex.stars(W, H, { seed: 53, n: 160, max: 1.8 }), 10], [Tex.stars(W, H, { seed: 67, n: 50, max: 2.6 }), 22]];
    for (const [c, sp] of L) { const off = (t * sp) % W; ctx.drawImage(c, -off, 0); ctx.drawImage(c, W - off, 0); }
  }
  function sfx(fn) { if (Settings.sfx && Audio2.ctx && Audio2.unlocked) try { fn(); } catch (e) { } }

  const LV = {
    1: { every: 5.2, v: 36, cap: 3, size: 72 }, 2: { every: 4.8, v: 38, cap: 3, size: 72 }, 3: { every: 4.2, v: 42, cap: 4, size: 72 },
    4: { every: 6.0, v: 34, cap: 7, size: 60 }, 5: { every: 8.5, v: 28, cap: 12, size: 50 }, 6: { every: 10, v: 24, cap: 15, size: 46 },
  };

  Games.register({
    id: 3, key: "a", name: "Asteroides de lletres", zone: "espai", music: "orbital",
    collect: { one: "mineral espacial", many: "minerals espacials" },
    goal: l => l <= 3 ? "Prem la lletra de cada asteroide per desfer-lo. Aguanta 2 minuts amb l'escut encès." : l === 4 ? "Escriu la síl·laba i després les lletres dels trossos. Aguanta 2 minuts amb l'escut encès." : "Escriu la paraula, després les síl·labes i les lletres dels trossos. Aguanta 2 minuts!",
    missAt: [800, 190],
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      if (Settings.reduceMotion) t = 0;
      const s = Math.max(w / 460, h / 250); ctx.translate(w / 2, h / 2); ctx.scale(s, s); ctx.translate(-230, -125);
      ctx.drawImage(spaceLayers(), 520, 290, 560, 340, -20, -20, 500, 300);
      ctx.drawImage(Tex.stars(W, H, { seed: 67, n: 50, max: 2.6 }), 0, 0, 800, 450, 0, 0, 460, 260);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const sh = arcSprite(); for (let i = 0; i < 3; i++) Sprites.draw(ctx, sh, 175, 150, { s: 0.55, rot: t * 0.3 + i * 2.094 });
      Sprites.draw(ctx, shipSprite(), 175, 150, { s: 0.6, rot: -0.55 });
      const k = (t * 0.7) % 1; ctx.strokeStyle = rgba(NEON[2], 0.9 * (1 - k)); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(197, 136); ctx.lineTo(290, 92); ctx.stroke();
      Sprites.draw(ctx, rockSprite(7, 64, NEON[1]), 300, 86, { s: 0.85, rot: t * 0.4 });
      Sprites.draw(ctx, rockSprite(12, 40, NEON[2]), 330, 200, { s: 0.75, rot: -t * 0.5 });
      ctx.restore();
      drawPlate(ctx, "a", 300, 86, { size: 60, border: NEON[1], borderW: 4, shadowBlur: 4 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, cfg = LV[L], pool = api.pool({ theme: L >= 5 ? "espai" : undefined });
      const rocks = [], beams = [], shards = [], ctxM = makeCanvas(4, 4).getContext("2d");
      const st = { t: 0, spawnT: 0, shield: 3, blink: 0, hit: 0, ang: -Math.PI / 2, tang: -Math.PI / 2, phase: "play", endT: 0, seed: randi(1, 9999), rot: 0 };
      api.hud.timer = DURATION; api.hud.lives = [3, 3];
      const typer = api.typer({
        targets: () => rocks.filter(r => r.x - r.r * 0.55 > 0 && r.x + r.r * 0.55 < W && r.y > 110 && r.y < H - 40),
        rank: r => dist(r.x, r.y, CX, CY) - SHIELD_R - r.r * 0.7,
        onStep(r) { st.tang = Math.atan2(r.y - CY, r.x - CX); if (!r.done) { beams.push({ x: r.x, y: r.y, t: 0, small: true, col: r.col }); sfx(() => tone({ f: 1800, f2: 900, d: 0.07, type: "sine", v: 0.06 })); } },
        onDone(r) { blast(r); },
        onMiss() { st.blink = 1; sfx(() => tone({ f: 180, f2: 120, d: 0.25, type: "sawtooth", v: 0.05, lp: 700 })); },
      });
      function plateSz(stage) { return stage === "letter" ? 72 : stage === "syl" ? (L === 4 ? 60 : 54) : cfg.size; }
      function makeRock(text, stage, x, y, vx, vy, parentCol) {
        const sz = plateSz(stage), pw = text.length === 1 ? sz * 1.32 : measure(ctxM, disp(text), sz, 700) + sz * 0.62;
        const r = stage === "letter" ? (L <= 3 ? 86 : 74) : stage === "syl" ? clamp(pw / 2 + 38, 84, 130) : clamp(pw / 2 + 26, 100, 190);
        const col = stage === "word" || !parentCol ? pick(NEON) : NEON[(NEON.indexOf(parentCol) + 1) % 3];
        const seed = st.seed++;
        const rk = { text, stage, x, y, vx, vy, r, col, seed, sprite: rockSprite(seed % 40, Math.round(r / 4) * 4, col), rot: rand(0, 6.28), vr: rand(-0.5, 0.5), size: sz, born: 0, drift: stage !== "word" };
        rocks.push(rk); return rk;
      }
      function spawn(initial) {
        const text = pool.next(rocks.map(r => r.text)), stage = L <= 3 ? "letter" : L === 4 ? "syl" : "word";
        // entra des d'una vora i va cap a la nau (amb una mica de desviació)
        let x, y;
        if (initial) { const a = rand(0, Math.PI * 2), d = rand(520, 600); x = clamp(CX + Math.cos(a) * d * 1.25, 140, W - 140); y = clamp(CY + Math.sin(a) * d * 0.8, 190, H - 120); }
        else { // just fora d'una vora (les laterals i la de sota més sovint, per no passar pel HUD)
          const e = pick([1, 2, 3]), m = 110;
          if (e === 0) { x = rand(300, W - 300); y = -m; } else if (e === 1) { x = -m; y = rand(150, H - 100); } else if (e === 2) { x = W + m; y = rand(150, H - 100); } else { x = rand(150, W - 150); y = H + m; }
        }
        const aim = Math.atan2(CY + rand(-60, 60) - y, CX + rand(-60, 60) - x), v = cfg.v * rand(0.85, 1.15);
        const rk = makeRock(text, stage, x, y, Math.cos(aim) * v, Math.sin(aim) * v);
        rk.big = true; rk.drift = false;
      }
      function pending() { return rocks.reduce((s, r) => s + (r.dead ? 0 : r.text.length * (r.stage === "word" ? 3 : r.stage === "syl" ? 2 : 1)), 0); }
      function shatter(r, n = 10, life = 0.9) {
        const pts = rockShape(r.seed % 40, 9 + ((r.seed % 40) % 5));
        for (let i = 0; i < pts.length && shards.length < 90; i++) {
          const p = pts[i], q = pts[(i + 1) % pts.length], mx = (p[0] * p[2] + q[0] * q[2]) / 2, my = (p[1] * p[2] + q[1] * q[2]) / 2;
          const c = Math.cos(r.rot), s = Math.sin(r.rot), wx = (mx * c - my * s) * r.r, wy = (mx * s + my * c) * r.r;
          const len = Math.hypot((p[0] * p[2] - q[0] * q[2]), (p[1] * p[2] - q[1] * q[2])) * r.r, ang = Math.atan2(q[1] * q[2] - p[1] * p[2], q[0] * q[2] - p[0] * p[2]) + r.rot;
          shards.push({ x: r.x + wx, y: r.y + wy, vx: wx / r.r * rand(90, 170) + r.vx, vy: wy / r.r * rand(90, 170) + r.vy, a: ang, va: rand(-4, 4), len, col: r.col, t: 0, life: life * rand(0.8, 1.2) });
        }
      }
      function blast(r) {
        r.dead = true; st.tang = Math.atan2(r.y - CY, r.x - CX);
        beams.push({ x: r.x, y: r.y, t: 0, col: r.col });
        Sfx.play("glass"); shatter(r);
        api.particles.emit(r.x, r.y, { count: 18, color: [r.col, "#FFFFFF", mix(r.col, "#FFFFFF", 0.5)], shape: "spark", glow: true, size: 7, speed: 300, gravity: 0, life: 0.7, drag: 0.94 });
        // es parteix en trossos que porten síl·labes o lletres
        let parts = [];
        if (r.stage === "word") { const syl = syllabify(r.text); parts = syl.length > 1 ? syl.map(s => [s, s.replace(/[·\s]/g, "").length > 1 ? "syl" : "letter"]) : letters(r.text); }
        else if (r.stage === "syl") parts = letters(r.text);
        parts = parts.map(([s, sg]) => [s.replace(/·$/, ""), sg]).filter(([s]) => s && s !== "·");
        if (!parts.length) return;
        const out = Math.atan2(r.y - CY, r.x - CX), px = -Math.sin(out), py = Math.cos(out);
        const widths = parts.map(([s, sg]) => sg === "letter" ? 120 : Math.max(130, measure(ctxM, disp(s), plateSz(sg), 700) + 70)), tot = widths.reduce((a, b) => a + b, 0);
        let off = -tot / 2;
        parts.forEach(([s, sg], i) => {
          const o = off + widths[i] / 2; off += widths[i];
          let x = r.x + px * o, y = r.y + py * o;
          x = clamp(x, 80, W - 80); y = clamp(y, 150, H - 80);
          const sp = rand(40, 70), k = makeRock(s, sg, x, y, Math.cos(out) * sp * 0.6 + px * o * 0.25, Math.sin(out) * sp * 0.6 + py * o * 0.25, r.col);
          k.born = 0.0001;
        });
      }
      function letters(s) { return s.split("").filter(c => c !== "·" && c !== " ").map(c => [c, "letter"]); }
      function impact(r) {
        r.dead = true; st.shield--; st.hit = 1; api.hud.lives = [Math.max(0, st.shield), 3];
        shatter(r, 10, 1.2); Sfx.play("boom"); api.shake(9);
        api.particles.emit(r.x, r.y, { count: 22, color: [NEON[0], "#FFFFFF", r.col], shape: "spark", glow: true, size: 8, speed: 260, gravity: 0, life: 0.8, drag: 0.93 });
        if (st.shield <= 0 && st.phase === "play") { st.phase = "lost"; st.endT = 0; void 0; }
      }
      // al principi ja n'hi ha a la vista (perquè la demostració comenci de seguida)
      spawn(true); if (L <= 3) spawn(true);
      return {
        expected() { return st.phase === "play" ? typer.expected() : null; },
        onKey(k) { if (st.phase === "play") typer.key(k); },
        update(dt) {
          st.t += dt; st.rot += Settings.reduceMotion ? 0 : dt * 0.25;
          st.blink = Math.max(0, st.blink - dt * 2.2); st.hit = Math.max(0, st.hit - dt * 1.6);
          let da = st.tang - st.ang; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; st.ang += da * Math.min(1, dt * 12);
          if (st.phase === "play") {
            api.hud.timer = Math.max(0, DURATION - st.t);
            st.spawnT += dt * api.speed;
            const bigs = rocks.filter(r => r.big && !r.dead).length;
            if (api.demo && st.spawnT > 1.6 && rocks.length < 2) { st.spawnT = 0; spawn(true); rocks[rocks.length - 1].born = 0.0001; }
            else if ((st.spawnT > cfg.every && pending() < cfg.cap * (L <= 3 ? 1 : 1)) || (bigs === 0 && pending() === 0 && st.spawnT > 1)) { st.spawnT = 0; spawn(false); }
            if (st.t >= DURATION && !api.demo) { st.phase = "won"; st.endT = 0; rocks.forEach(r => { if (!r.dead) blast(r); }); rocks.forEach(r => r.dead = true); Sfx.play("win"); void 0; }
          } else {
            st.endT += dt;
            if (st.endT > 1.6 && !st.fin) { st.fin = true; api.finish(st.phase === "won", { collectName: "un mineral espacial" }); }
          }
          for (const r of rocks) {
            if (r.dead) continue;
            if (r.born > 0) r.born += dt;
            const dx = CX - r.x, dy = CY - r.y, d = Math.hypot(dx, dy);
            if (r.drift) {
              // els trossos s'escampen i després tornen lentament cap a la nau
              r.vx *= Math.pow(0.55, dt); r.vy *= Math.pow(0.55, dt);
              const pull = (L <= 4 ? 16 : 13) * api.speed; r.vx += dx / d * pull * dt * 0.9; r.vy += dy / d * pull * dt * 0.9;
              const sp = Math.hypot(r.vx, r.vy), mx = Math.max(pull, 90 * Math.exp(-r.born * 1.5));
              if (sp > mx) { r.vx *= mx / sp; r.vy *= mx / sp; }
              // es mantenen dins la pantalla
              if (r.x < r.r * 0.6) r.vx += 60 * dt; if (r.x > W - r.r * 0.6) r.vx -= 60 * dt; if (r.y < 120) r.vy += 60 * dt; if (r.y > H - r.r * 0.5) r.vy -= 60 * dt;
            } else { const v = Math.hypot(r.vx, r.vy), tv = cfg.v * api.speed * (r.big ? 1 : 0.8); r.vx = r.vx / v * tv; r.vy = r.vy / v * tv; }
            r.x += r.vx * dt; r.y += r.vy * dt; r.rot += Settings.reduceMotion ? 0 : r.vr * dt;
            if (d < SHIELD_R + r.r * 0.62 && st.phase === "play" && !api.demo) impact(r);
            else if (d < SHIELD_R + r.r * 0.9 && api.demo) { r.vx *= 0.9; r.vy *= 0.9; r.x -= dx / d * 2; r.y -= dy / d * 2; }
          }
          // evitar que dos trossos quedin un sobre l'altre
          for (let i = 0; i < rocks.length; i++) for (let j = i + 1; j < rocks.length; j++) {
            const a = rocks[i], b = rocks[j]; if (a.dead || b.dead) continue;
            const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, min = (a.r + b.r) * 0.8;
            if (d < min) { const push = (min - d) * 0.5 * Math.min(1, dt * 6); a.x -= dx / d * push; a.y -= dy / d * push; b.x += dx / d * push; b.y += dy / d * push; }
          }
          for (let i = rocks.length - 1; i >= 0; i--) if (rocks[i].dead) rocks.splice(i, 1);
          for (let i = beams.length - 1; i >= 0; i--) { beams[i].t += dt; if (beams[i].t > 0.35) beams.splice(i, 1); }
          for (let i = shards.length - 1; i >= 0; i--) { const s = shards[i]; s.t += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.pow(0.4, dt); s.vy *= Math.pow(0.4, dt); s.a += s.va * dt; if (s.t > s.life) shards.splice(i, 1); }
        },
        draw(ctx) {
          const t = api.t;
          drawSpace(ctx, t);
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          // trossos de línia que giren i s'apaguen
          ctx.lineCap = "round";
          shards.forEach(s => {
            const a = 1 - s.t / s.life, c = Math.cos(s.a) * s.len / 2, d = Math.sin(s.a) * s.len / 2;
            const chip=Art.cell('crystal-sprites',s.col===NEON[0]?5:4,3,2,128,128);
            if(chip){ctx.save();ctx.globalAlpha=a;ctx.globalCompositeOperation='source-over';ctx.translate(s.x,s.y);ctx.rotate(s.a);const sz=Math.min(38,s.len);ctx.drawImage(chip,-sz/2,-sz/2,sz,sz);ctx.restore();return;}
            ctx.strokeStyle = rgba(s.col, 0.35 * a); ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(s.x - c, s.y - d); ctx.lineTo(s.x + c, s.y + d); ctx.stroke();
            ctx.strokeStyle = rgba("#FFFFFF", 0.85 * a); ctx.lineWidth = 2; ctx.stroke();
          });
          // raigs de llum
          beams.forEach(b => {
            const a = 1 - b.t / 0.35, x0 = CX + Math.cos(st.ang) * 40, y0 = CY + Math.sin(st.ang) * 40;
            ctx.strokeStyle = rgba(b.col, 0.4 * a); ctx.lineWidth = b.small ? 8 : 18; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(b.x, b.y); ctx.stroke();
            ctx.strokeStyle = rgba("#FFFFFF", 0.95 * a); ctx.lineWidth = b.small ? 2 : 5; ctx.stroke();
            if (!b.small) { const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 90 * (0.5 + b.t)); g.addColorStop(0, rgba(b.col, 0.6 * a)); g.addColorStop(1, rgba(b.col, 0)); ctx.fillStyle = g; ctx.fillRect(b.x - 200, b.y - 200, 400, 400); }
          });
          ctx.globalCompositeOperation="source-over";
          // asteroides
          rocks.forEach(r => { const sc = r.born > 0 ? Ease.outBack(clamp(r.born / 0.35, 0, 1)) : 1; Sprites.draw(ctx, r.sprite, r.x, r.y, { rot: r.rot, s: sc }); });
          // escut: tres arcs (cada impacte n'apaga un) i la nau
          const sh = arcSprite(), blinkA = 1 - 0.65 * Math.sin(Math.PI * (1 - st.blink)) * (st.blink > 0 ? 1 : 0);
          for (let i = 0; i < 3; i++) {
            const on = i < st.shield, ang = st.rot + i * 2.094;
            if (on) Sprites.draw(ctx, sh, CX, CY, { rot: ang, alpha: blinkA * (0.85 + 0.15 * Math.sin(t * 2 + i)) });
            else { ctx.strokeStyle = rgba(NEON[0], 0.12); ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.beginPath(); ctx.arc(CX, CY, SHIELD_R, ang - 1, ang + 1); ctx.stroke(); ctx.setLineDash([]); }
          }
          if (st.hit > 0) { ctx.strokeStyle = rgba(NEON[1], 0.6 * st.hit); ctx.lineWidth = 10 * st.hit; ctx.beginPath(); ctx.arc(CX, CY, SHIELD_R + (1 - st.hit) * 40, 0, 6.28); ctx.stroke(); }
          const fl = Settings.reduceMotion ? 0.7 : 0.7 + 0.1 * Math.sin(t * 8);
          ctx.fillStyle = rgba(NEON[1], 0.5 * fl); ctx.beginPath(); ctx.moveTo(CX - Math.cos(st.ang) * 20 + Math.sin(st.ang) * 8, CY - Math.sin(st.ang) * 20 - Math.cos(st.ang) * 8); ctx.lineTo(CX - Math.cos(st.ang) * (38 + 8 * fl), CY - Math.sin(st.ang) * (38 + 8 * fl)); ctx.lineTo(CX - Math.cos(st.ang) * 20 - Math.sin(st.ang) * 8, CY - Math.sin(st.ang) * 20 + Math.cos(st.ang) * 8); ctx.fill();
          ctx.restore();
          Sprites.draw(ctx, shipSprite(), CX, CY, { rot: st.ang });
          // cercle que marca l'asteroide triat
          const cur = typer.current();
          if (cur) {
            ctx.save(); ctx.strokeStyle = rgba("#FFFFFF", 0.9); ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.lineDashOffset = Settings.reduceMotion ? 0 : -t * 40;
            ctx.beginPath(); ctx.arc(cur.x, cur.y, cur.r + 16, 0, 6.28); ctx.stroke(); ctx.setLineDash([]);
            ctx.strokeStyle = rgba(cur.col, 0.5); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cur.x, cur.y, cur.r + 16, 0, 6.28); ctx.stroke(); ctx.restore();
          }
          drawVignette(ctx, 0.18, "0,0,0");
          // plaques: no giren mai, només es desplacen
          rocks.forEach(r => {
            const sc = r.born > 0 ? clamp(r.born / 0.25, 0.4, 1) : 1;
            drawPlate(ctx, r.text, r.x, r.y, { size: r.size, progress: r.typed, state: r === cur ? "active" : null, border: r === cur ? null : r.col, borderW: 5, scale: sc, shadowBlur: 0, shadowY: 3 });
          });
          if (st.phase !== "play") {
            const k = Ease.outBack(clamp(st.endT / 0.5, 0, 1));
            ctx.save(); ctx.translate(CX, 250); ctx.scale(k, k);
            text(ctx, st.phase === "won" ? "Has aguantat 2 minuts!" : "L'escut s'ha apagat", 0, 0, { size: 64, weight: 900, font: FONT_T, color: st.phase === "won" ? NEON[2] : NEON[1], stroke: "#05060f", lw: 12 });
            ctx.restore();
          }
        },
      };
    },
  });
})();
