"use strict";
/* 1. On és la lletra? — àlbum de cromos en paper retallat 2.5D */
(() => {
  const THEMES = ["granja", "mar", "selva", "insectes", "bosc", "granja"];
  const TITLES = { granja: "Animals de la granja", mar: "Animals del mar", selva: "Animals de la selva", insectes: "Insectes i bestioles", bosc: "Animals del bosc" };
  const BG = ["#F6C667", "#8FD3E8", "#A8D98A", "#F2A7B8", "#C9B6E8", "#F4B183", "#9ED9C4", "#F7E08A"];
  const GOAL = 20;
  // àlbum
  const AX = 100, AY = 150, AW = 1400, AH = 715, LP = [124, 168, 660, 680], RP = [816, 168, 660, 680];
  const slotPos = i => [LP[0] + 74 + (i % 5) * 128, LP[1] + 148 + Math.floor(i / 5) * 146];
  const critterList = th => (typeof Critters !== "undefined" ? Critters.byTheme(th) : []).map(c => c.id);

  function drawSticker(ctx, x, y, w, h, cid, col, o = {}) {
    ctx.save(); ctx.translate(x, y); if (o.s) ctx.scale(o.s, o.s); if (o.rot) ctx.rotate(o.rot);
    ctx.shadowColor = "rgba(40,30,20,0.35)"; ctx.shadowBlur = o.lift ? 22 : 6; ctx.shadowOffsetY = o.lift ? 14 : 3;
    rr(ctx, -w / 2, -h / 2, w, h, 10); ctx.fillStyle = "#fff"; ctx.fill(); ctx.shadowColor = "transparent";
    const ix = -w / 2 + 6, iy = -h / 2 + 6, iw = w - 12, ih = h - 30;
    ctx.save(); rr(ctx, ix, iy, iw, ih, 6); ctx.clip();
    const g = ctx.createRadialGradient(0, iy + ih * 0.45, 4, 0, iy + ih * 0.5, iw); g.addColorStop(0, shade(col, 0.45)); g.addColorStop(1, col); ctx.fillStyle = g; ctx.fillRect(ix, iy, iw, ih);
    ctx.fillStyle = "rgba(255,255,255,0.16)"; for (let k = 0; k < 12; k++) { ctx.beginPath(); ctx.moveTo(0, iy + ih * 0.55); ctx.arc(0, iy + ih * 0.55, iw, k * 0.524, k * 0.524 + 0.26); ctx.closePath(); ctx.fill(); }
    if (typeof Critters !== "undefined" && cid) Critters.draw(ctx, cid, 0, iy + ih * 0.52, Math.min(iw, ih) * 0.95, { t: o.t || 0, pose: o.pose || "idle" });
    // brillantor de paper estucat
    const gl = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih); gl.addColorStop(0.25, "rgba(255,255,255,0)"); gl.addColorStop(0.4, "rgba(255,255,255,0.32)"); gl.addColorStop(0.5, "rgba(255,255,255,0)"); ctx.fillStyle = gl; ctx.fillRect(ix, iy, iw, ih);
    ctx.restore();
    if (cid && typeof Critters !== "undefined") text(ctx, Critters.name(cid), 0, h / 2 - 13, { size: 15, weight: 700, color: "#3A3330" });
    ctx.restore();
  }
  function drawAlbum(ctx, theme, filled, cards, t, o = {}) {
    // taula de fusta clara
    ctx.fillStyle = ctx.createPattern(Tex.wood(1600, 900, "#D8B485", { seed: 3, vertical: true }), "repeat"); ctx.fillRect(0, 0, W, H);
    // ombra i tapes (petroli de la marca)
    ctx.save(); ctx.shadowColor = "rgba(50,30,10,0.45)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18; rr(ctx, AX, AY, AW, AH, 22); ctx.fillStyle = BRAND.petroli; ctx.fill(); ctx.restore();
    Mat.texFill(ctx, c => rr(c, AX, AY, AW, AH, 22), Tex.felt(128, 128, "#bbbbbb", { seed: 5 }), BRAND.petroli, { alpha: 0.5 });
    // pàgines amb gruix
    for (const P of [LP, RP]) {
      for (let k = 3; k >= 1; k--) { ctx.fillStyle = k % 2 ? "#E9E0CC" : "#F3ECDC"; rr(ctx, P[0] + (P === LP ? -k * 2 : k * 2), P[1] + k * 2, P[2], P[3], 8); ctx.fill(); }
      ctx.save(); rr(ctx, P[0], P[1], P[2], P[3], 8); ctx.clip(); ctx.drawImage(Tex.paper(660, 680, "#FBF6EA", { seed: P === LP ? 7 : 8 }), P[0], P[1]);
      const gx = P === LP ? P[0] + P[2] : P[0], gg = ctx.createLinearGradient(gx, 0, gx + (P === LP ? -90 : 90), 0); gg.addColorStop(0, "rgba(80,60,30,0.28)"); gg.addColorStop(1, "rgba(80,60,30,0)"); ctx.fillStyle = gg; ctx.fillRect(P[0], P[1], P[2], P[3]);
      ctx.restore();
    }
    text(ctx, TITLES[theme], LP[0] + LP[2] / 2, LP[1] + 40, { size: 32, weight: 900, font: FONT_T, color: BRAND.tinta });
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(LP[0] + LP[2] / 2 - 60, LP[1] + 64, 120, 4);
    // forats per als cromos
    for (let i = 0; i < GOAL; i++) {
      const [sx, sy] = slotPos(i);
      if (filled[i]) { const f = filled[i]; drawSticker(ctx, sx, sy, 108, 132, f.cid, f.col, { t, pose: f.pose && f.poseT > 0 ? f.pose : "idle", s: f.s }); continue; }
      ctx.save(); rr(ctx, sx - 54, sy - 66, 108, 132, 10); ctx.fillStyle = "rgba(120,95,60,0.08)"; ctx.fill(); ctx.setLineDash([8, 6]); ctx.lineWidth = 2.5; ctx.strokeStyle = "rgba(120,95,60,0.35)"; ctx.stroke(); ctx.restore();
      text(ctx, String(i + 1), sx, sy, { size: 30, weight: 800, font: FONT_T, color: "rgba(120,95,60,0.28)" });
    }
    // sobre de cromos a la pàgina dreta
    const ex = RP[0] + RP[2] - 120, ey = RP[1] + RP[3] - 90;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.12);
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    rr(ctx, -80, -52, 160, 104, 8); ctx.fillStyle = "#E0553A"; ctx.fill(); ctx.shadowColor = "transparent";
    ctx.fillStyle = "#C2402A"; ctx.beginPath(); ctx.moveTo(-80, -52); ctx.lineTo(0, 6); ctx.lineTo(80, -52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#FFE08A"; starPath(ctx, 0, 22, 18, 8, 5); ctx.fill();
    ctx.restore();
  }

  Games.register({
    id: 1, key: "o", name: "On és la lletra?", zone: "poble", music: "piano", ownCompare: true, demoTime: 9, captionY: 112,
    collect: { one: "cromo", many: "cromos" },
    goal: l => l <= 3 ? "Escolta quina lletra et demanen i busca-la al teclat. Omple l'àlbum amb 20 cromos." : l === 4 ? "Escolta la síl·laba i escriu-la lletra a lletra. Omple l'àlbum amb 20 cromos." : "Escolta la paraula i escriu-la lletra a lletra. Omple l'àlbum amb 20 cromos.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.translate(x, y);
      ctx.fillStyle = "#D8B485"; ctx.fillRect(0, 0, w, h);
      const s = Math.min(w / 300, h / 180); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      rr(ctx, -140, -78, 280, 156, 10); ctx.fillStyle = BRAND.petroli; ctx.fill();
      ctx.fillStyle = "#FBF6EA"; rr(ctx, -132, -70, 128, 140, 5); ctx.fill(); rr(ctx, 4, -70, 128, 140, 5); ctx.fill();
      const cols = ["#F6C667", "#8FD3E8", "#A8D98A", "#F2A7B8"];
      for (let i = 0; i < 6; i++) { ctx.fillStyle = "#fff"; rr(ctx, -122 + (i % 3) * 38, -58 + Math.floor(i / 3) * 62, 32, 50, 4); ctx.fill(); ctx.fillStyle = cols[i % 4]; rr(ctx, -119 + (i % 3) * 38, -55 + Math.floor(i / 3) * 62, 26, 34, 3); ctx.fill(); }
      const lift = Math.sin(t * 2) * 3;
      drawPlate(ctx, "a", 68, -2 - lift, { size: 70, shadowBlur: 8 + lift * 2 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, theme = THEMES[L - 1], pool = api.pool({ theme: L >= 5 ? "animals" : undefined });
      let crit = shuffle(critterList(theme)); if (!crit.length) crit = [null];
      const filled = [], st = { phase: "enter", t: 0 }, ghosts = [];
      let item = "", cards = [], typed = 0, count = 0, flyer = null, askAgain = 0;
      function ask() {
        if (L <= 3) api.sayItem(item, "{x}"); else api.sayItem(item, "{x}");
      }
      function newRound() {
        item = pool.next(); typed = 0; st.phase = "enter"; st.t = 0; api.clearCaption();
        const chars = item.split(""), n = chars.length, maxW = RP[2] - 80;
        const cw = n === 1 ? 330 : Math.min(200, (maxW - (n - 1) * 8) / n), chh = n === 1 ? 410 : cw * 1.3;
        cards = chars.map((c, i) => ({ c, x: RP[0] + RP[2] / 2 + (i - (n - 1) / 2) * (cw + 8), y: RP[1] + 300, w: cw, h: chh, lift: 0, done: false, pop: 0 }));
        setTimeout(() => { if (st.phase !== "done") ask(); }, api.demo ? 100 : 350);
      }
      newRound();
      function reward() {
        const slot = count, cid = crit[count % crit.length], col = BG[count % BG.length];
        st.phase = "reward"; st.t = 0;
        flyer = { slot, cid, col, t: 0, from: [RP[0] + RP[2] - 120, RP[1] + RP[3] - 100], to: slotPos(slot) };
        Sfx.play("whoosh");
      }
      return {
        expected() { return st.phase === "ask" || st.phase === "enter" ? item[typed] : null; },
        onKey(k) {
          if (k.length !== 1 || (st.phase !== "ask" && st.phase !== "enter")) return;
          const ch = item[typed];
          if (k === ch) {
            const c = cards[typed]; c.done = true; c.pop = 1; typed++; api.hit({ sfx: "wood" });
            if (typed >= item.length) { Sfx.play("hit"); reward(); }
          } else {
            api.miss(ch, k, { sfx: "thud" });
            const c = cards[typed]; ghosts.push({ c: k, x0: c.x + 420, x: c.x + 420, y: c.y, w: c.w, h: c.h, tx: c.x, t: 0 });
            askAgain = 1.3;
          }
        },
        update(dt) {
          st.t += dt;
          if (st.phase === "enter" && st.t > 0.55) st.phase = "ask";
          cards.forEach((c, i) => { const tgt = st.phase === "enter" ? Ease.outBack(clamp((st.t - i * 0.05) / 0.5, 0, 1)) : 1; c.lift = c.done ? lerp(c.lift, 0.25, 0.2) : tgt; c.pop = Math.max(0, c.pop - dt * 3); });
          for (let i = ghosts.length - 1; i >= 0; i--) { const g = ghosts[i]; g.t += dt; const k = g.t < 0.35 ? Ease.outCubic(g.t / 0.35) : g.t < 0.8 ? 1 : 1 - Ease.inCubic((g.t - 0.8) / 0.4); g.x = lerp(g.x0, g.tx, k); if (g.t > 1.2) ghosts.splice(i, 1); }
          if (askAgain > 0) { askAgain -= dt; if (askAgain <= 0) ask(); }
          if (flyer) {
            flyer.t += dt / 0.8;
            if (flyer.t >= 1 && !flyer.landed) {
              flyer.landed = true; Sfx.play("plof"); filled[flyer.slot] = { cid: flyer.cid, col: flyer.col, pose: "happy", poseT: 1.4, s: 1 };
              api.particles.emit(flyer.to[0], flyer.to[1], { count: 16, color: ["#fff", "#FFE08A", flyer.col], speed: 260, gravity: 200, size: 9, life: 0.6 });
              if (flyer.cid && typeof Critters !== "undefined") setTimeout(() => void 0, 200);
              count++; api.hud.progress = [count, GOAL];
            }
            if (flyer.t > 1.9) { flyer = null; if (count >= GOAL) { st.phase = "done"; api.finish(true, { collectName: `${GOAL} cromos nous` }); } else newRound(); }
          }
          filled.forEach(f => { if (f && f.poseT > 0) f.poseT -= dt; });
          api.hud.progress = [count, GOAL];
        },
        draw(ctx) {
          const t = api.t;
          drawAlbum(ctx, theme, filled, cards, t);
          // targetes de lletra (sense rotació ni textura sobre la lletra)
          const n = cards.length, sz = n === 1 ? 300 : clamp(cards[0].w * 0.72, 40, 150);
          cards.forEach((c, i) => {
            if (st.phase === "reward" && flyer && flyer.t > 0.3) return;
            const lift = c.lift, y = c.y - lift * 18 - c.pop * 10, glued = n > 1 && i < n - 1;
            ctx.save(); ctx.shadowColor = "rgba(50,35,20,0.38)"; ctx.shadowBlur = 6 + lift * 26; ctx.shadowOffsetY = 3 + lift * 16;
            rr(ctx, c.x - c.w / 2, y - c.h / 2, c.w, c.h, n === 1 ? 26 : 14); ctx.fillStyle = BRAND.crema; ctx.fill(); ctx.restore();
            ctx.lineWidth = c.done ? 6 : 2; ctx.strokeStyle = c.done ? BRAND.petroli : i === typed ? "rgba(23,103,107,0.55)" : "rgba(20,38,42,0.18)"; rr(ctx, c.x - c.w / 2 + 3, y - c.h / 2 + 3, c.w - 6, c.h - 6, n === 1 ? 24 : 12); ctx.stroke();
            if (glued && cards[i].done && cards[i + 1].done) { ctx.fillStyle = BRAND.petroli; ctx.fillRect(c.x + c.w / 2 - 2, y - 12, 12, 24); }
            if (c.c === " ") { ctx.fillStyle = "rgba(20,38,42,0.35)"; ctx.fillRect(c.x - c.w * 0.3, y + sz * 0.3, c.w * 0.6, 6); }
            else text(ctx, disp(c.c), c.x, y + sz * 0.04, { size: sz, weight: 700, color: c.done ? BRAND.petroli : BRAND.ink });
          });
          // la lletra premuda per error llisca i es superposa translúcida
          ghosts.forEach(g => {
            const a = g.t < 0.35 ? g.t / 0.35 : g.t > 0.8 ? 1 - (g.t - 0.8) / 0.4 : 1;
            ctx.save(); ctx.globalAlpha = 0.62 * clamp(a, 0, 1);
            rr(ctx, g.x - g.w / 2, g.y - g.h / 2, g.w, g.h, n === 1 ? 26 : 14); ctx.fillStyle = "#FFF1EC"; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = UI.coral; ctx.stroke();
            text(ctx, g.c === " " ? "␣" : disp(g.c), g.x, g.y + sz * 0.04, { size: sz, weight: 700, color: UI.coralDark });
            ctx.restore();
            if (g.t > 0.3 && g.t < 0.95) { ctx.save(); ctx.globalAlpha = clamp((g.t - 0.3) * 6, 0, 1) * clamp((0.95 - g.t) * 6, 0, 1); text(ctx, "No és la mateixa", RP[0] + RP[2] / 2, RP[1] + 590, { size: 30, weight: 800, font: FONT_T, color: UI.coralDark }); ctx.restore(); }
          });
          // el cromo surt del sobre i vola fins al seu forat
          if (flyer && !flyer.landed) {
            const k = Ease.inOutCubic(clamp(flyer.t, 0, 1)), [fx, fy] = flyer.from, [tx, ty] = flyer.to;
            const x = lerp(fx, tx, k), y = lerp(fy, ty, k) - Math.sin(k * Math.PI) * 260, s = 1.5 - k * 0.5;
            drawSticker(ctx, x, y, 108, 132, flyer.cid, flyer.col, { s, rot: (1 - k) * 0.4, lift: true, t });
          }
          drawVignette(ctx, 0.28, "40,25,10");
        },
      };
    },
  });
})();
