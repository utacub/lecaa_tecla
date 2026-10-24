"use strict";
/* 24. La serp de paraules — tela de punt de creu, serp brodada punt a punt i botons cosits */
(() => {
  const AI = 13, C = 39;                 // cel·la d'aida i cel·la de la serp (3×3 punts)
  const X0 = 39, Y0 = 234, COLS = 39, ROWS = 16;
  const GOAL = 10;
  const BTN = ["#F2A7B8", "#8FD3E8", "#F6C667", "#A8D98A", "#C9B6E8", "#F4B183", "#9ED9C4", "#F3EFE6"];
  const SNAKE = ["#2E9E6A", "#2E9E6A", "#F2B630"];   // franges de la serp
  const cx = c => X0 + c * C + C / 2, cy = r => Y0 + r * C + C / 2;

  /* ---------- punt de creu amb fil de cotó perlé ---------- */
  function cross(c, x, y, col, o = {}) {
    const a = 1.8, b = AI - 1.8, n = o.n == null ? 2 : o.n;
    c.lineCap = "round";
    const leg = (x1, y1, x2, y2, top) => {
      c.strokeStyle = "rgba(40,25,15,0.28)"; c.lineWidth = 4.6; c.beginPath(); c.moveTo(x + x1 + 0.7, y + y1 + 1); c.lineTo(x + x2 + 0.7, y + y2 + 1); c.stroke();
      c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(x + x1, y + y1); c.lineTo(x + x2, y + y2); c.stroke();
      c.strokeStyle = top ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x + x1 + 0.8, y + y1 - 0.6); c.lineTo(x + x2 - 0.6, y + y2 + 0.8 - (y2 > y1 ? 1.4 : -1.4) * 0); c.stroke();
    };
    if (n >= 1) leg(a, b, b, a, false);
    if (n >= 2) leg(a, a, b, b, true);
  }
  const cellSpr = col => Sprites.get("g24c" + col, C, C, (c) => { const im=Art.cell("g24-sewing",col===SNAKE[2]?1:0,2,2,C,C);if(im){c.drawImage(im,0,0,C,C);return;} for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cross(c, i * AI, j * AI, col); });
  /* ---------- botó (2.5D) ---------- */
  const buttonSpr = (col, R) => Sprites.get(`g24b${col}${R}`, R * 2 + 30, R * 2 + 30, (c, w) => {
    const m = w / 2;
    const button=Art.cell('g24-sewing',3,2,2,R*2,R*2);
    if(button){c.save();c.shadowColor='rgba(65,35,20,.3)';c.shadowBlur=9;c.shadowOffsetY=5;c.drawImage(button,15,15);c.restore();c.save();c.globalCompositeOperation='hue';c.fillStyle=col;c.beginPath();c.arc(m,m,R-3,0,Math.PI*2);c.fill();c.restore();return;}
    c.save(); c.shadowColor = "rgba(60,40,20,0.4)"; c.shadowBlur = 12; c.shadowOffsetY = 6; c.beginPath(); c.arc(m, m, R, 0, 6.28); c.fillStyle = col; c.fill(); c.restore();
    const g = c.createRadialGradient(m - R * 0.4, m - R * 0.45, R * 0.1, m, m, R * 1.05); g.addColorStop(0, shade(col, 0.45)); g.addColorStop(0.6, col); g.addColorStop(1, shade(col, -0.3)); c.fillStyle = g; c.beginPath(); c.arc(m, m, R, 0, 6.28); c.fill();
    // vora aixecada i cubeta interior
    c.lineWidth = R * 0.13; c.strokeStyle = shade(col, 0.25); c.beginPath(); c.arc(m, m, R * 0.86, 0, 6.28); c.stroke();
    c.lineWidth = 2; c.strokeStyle = shade(col, -0.28); c.beginPath(); c.arc(m, m, R * 0.78, 0, 6.28); c.stroke();
    c.strokeStyle = "rgba(255,255,255,0.7)"; c.lineWidth = 3; c.beginPath(); c.arc(m, m, R * 0.95, 3.6, 4.9); c.stroke();
    if (col === "#F3EFE6") { const n = c.createLinearGradient(m - R, m - R, m + R, m + R); n.addColorStop(0, "rgba(180,220,255,0.25)"); n.addColorStop(0.5, "rgba(255,200,240,0.25)"); n.addColorStop(1, "rgba(200,255,220,0.25)"); c.fillStyle = n; c.beginPath(); c.arc(m, m, R, 0, 6.28); c.fill(); }
  });
  /* ---------- tela, vores brodades i cinta del títol ---------- */
  const bgSpr = () => Sprites.get("g24bg", W, H, (c) => {
    if(Art.get('g24-workshop')) {c.drawImage(Art.get('g24-workshop'),0,0,W,H);return;}
    c.drawImage(Tex.aida(W, H, "#F4EEDF", AI), 0, 0, W, H);
    const v = c.createRadialGradient(800, 500, 300, 800, 500, 1000); v.addColorStop(0, "rgba(255,250,235,0)"); v.addColorStop(1, "rgba(120,90,50,0.22)"); c.fillStyle = v; c.fillRect(0, 0, W, H);
    // sanefa de punt de creu al voltant del tauler
    const bx0 = X0 - AI * 2, by0 = Y0 - AI * 2, bx1 = X0 + COLS * C + AI, by1 = Y0 + ROWS * C + AI;
    for (let x = bx0; x <= bx1; x += AI) { const k = Math.round((x - bx0) / AI); cross(c, x, by0, k % 4 === 0 ? "#2E7FB8" : "#D6453A"); cross(c, x, by1, k % 4 === 0 ? "#2E7FB8" : "#D6453A"); }
    for (let y = by0 + AI; y < by1; y += AI) { const k = Math.round((y - by0) / AI); cross(c, bx0, y, k % 4 === 0 ? "#2E7FB8" : "#D6453A"); cross(c, bx1, y, k % 4 === 0 ? "#2E7FB8" : "#D6453A"); }
    // flors brodades a les cantonades de dalt
    const flower = (fx, fy) => { const pat = ["..p..", ".ppp.", "ppypp", ".ppp.", "..p..", "..g..", ".gg..", "..g.."]; pat.forEach((row, j) => row.split("").forEach((ch, i) => { if (ch !== ".") cross(c, fx + i * AI, fy + j * AI, ch === "p" ? "#E86A9A" : ch === "y" ? "#F2B630" : "#3E9A55"); })); };
    flower(60, 90); flower(130, 116); flower(W - 190, 90); flower(W - 120, 116);
    // cinta de feltre per a la paraula
    c.save(); c.shadowColor = "rgba(60,40,20,0.35)"; c.shadowBlur = 14; c.shadowOffsetY = 6;
    c.beginPath(); c.moveTo(380, 84); c.lineTo(1220, 84); c.lineTo(1190, 130); c.lineTo(1220, 176); c.lineTo(380, 176); c.lineTo(410, 130); c.closePath(); c.fillStyle = "#2E7FB8"; c.fill(); c.restore();
    Mat.texFill(c, cc => { cc.beginPath(); cc.moveTo(380, 84); cc.lineTo(1220, 84); cc.lineTo(1190, 130); cc.lineTo(1220, 176); cc.lineTo(380, 176); cc.lineTo(410, 130); cc.closePath(); }, Tex.felt(128, 128, "#bbbbbb", { seed: 24 }), "#2E7FB8", { alpha: 0.55 });
    c.save(); c.setLineDash([9, 7]); c.strokeStyle = "#FFF4D8"; c.lineWidth = 3; c.lineCap = "round"; c.beginPath(); c.moveTo(396, 94); c.lineTo(1204, 94); c.moveTo(396, 166); c.lineTo(1204, 166); c.stroke(); c.restore();
  });

  Games.register({
    id: 24, key: "x", name: "La serp de paraules", zone: "camp", music: "musicbox", demoTime: 10, captionY: 205,
    collect: { one: "tela brodada", many: "teles brodades" },
    goal: l => l <= 3 ? "Escolta la lletra i escriu-la: la serp anirà a menjar-se el botó." : l === 4 ? "Escriu la síl·laba en ordre perquè la serp es mengi els botons." : "Escriu la paraula en ordre perquè la serp es mengi els botons. Compte amb les lletres esquer!",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      if(Art.get('g24-workshop'))ctx.drawImage(Art.get('g24-workshop'),0,0,w,h);
      ctx.fillStyle = ctx.createPattern(Tex.aida(260, 260, "#F4EEDF", AI), "repeat"); ctx.fillRect(0, 0, w, h); if(Art.get('g24-workshop'))ctx.drawImage(Art.get('g24-workshop'),0,0,w,h); for (let i = 0; i * AI < w; i++) { cross(ctx, i * AI, 4, i % 4 ? "#D6453A" : "#2E7FB8"); cross(ctx, i * AI, h - AI - 4, i % 4 ? "#D6453A" : "#2E7FB8"); }
      const s = Math.min(w / 300, h / 180); ctx.translate(w / 2, h / 2); ctx.scale(s, s);
      const cells = [[-5, 1], [-4, 1], [-3, 1], [-2, 1], [-2, 0], [-1, 0], [0, 0], [1, 0]];
      cells.forEach(([i, j], k) => Sprites.draw(ctx, cellSpr(SNAKE[k % 3]), -60 + i * 26, 10 + j * 26, { s: 26 / C }));
      ctx.save(); ctx.translate(-60 + 26 + 10, 10); ctx.fillStyle = "#2E9E6A"; ctx.beginPath(); ctx.ellipse(0, 0, 20, 16, 0, 0, 6.28); ctx.fill(); for (const e of [-1, 1]) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(4, e * 7, 6, 0, 6.28); ctx.fill(); ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(6, e * 7, 3, 0, 6.28); ctx.fill(); } ctx.restore();
      Sprites.draw(ctx, buttonSpr(BTN[0], 72), 90, -10 + Math.sin(t * 2) * 2, { s: 0.85 });
      drawPlate(ctx, "x", 90, -10 + Math.sin(t * 2) * 2, { size: 64, shadowBlur: 4, shadowY: 2 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, R = L === 6 ? 64 : 72;
      const pool = L <= 4 ? api.pool({}) : L === 5 ? api.pool({ filter: w => w.length >= 3 && w.length <= 5 }) : api.pool({ filter: w => !w.includes(" ") && w.length <= 10 });
      const BAITS = [null, 2, 3, 3, 2, 1, 3][L];
      const st = { phase: "intro", t: 0, words: 0, word: "", typed: 0, eaten: 0, stepT: 0, stop: 0, look: 0, joy: 0, done: false };
      const stepDur = () => (L <= 3 ? 0.085 : 0.068) / api.speed;
      let snake = [], dying = [], buttons = [], queue = [], path = null, moving = null, ghosts = [];
      for (let i = 0; i < 5; i++) snake.push({ c: 8 - i, r: 9, born: -1 });
      const targetLen = () => Math.min(18, 5 + st.words + st.eaten);
      const occ = () => { const m = new Map(); snake.forEach((s, i) => m.set(s.c + "," + s.r, i)); return m; };
      /* camí més curt (BFS) que esquiva el cos (tenint en compte que la cua avança) i els altres botons */
      function bfs(from, goal, ignoreBody) {
        const O = occ(), len = snake.length, block = new Set();
        for (const b of buttons) if (b !== goal && !b.eaten) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (Math.hypot(i, j) * C < R + 16) block.add((b.c + i) + "," + (b.r + j));
        const start = from.c + "," + from.r, prev = new Map([[start, null]]), dq = [[from.c, from.r, 0]];
        while (dq.length) {
          const [c, r, d] = dq.shift();
          if (c === goal.c && r === goal.r) { const out = []; let k = c + "," + r; while (k !== start) { const [a, b] = k.split(",").map(Number); out.unshift({ c: a, r: b }); k = prev.get(k); } return out; }
          for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nc = c + dc, nr = r + dr, key = nc + "," + nr;
            if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || prev.has(key)) continue;
            if (block.has(key) && !(nc === goal.c && nr === goal.r)) continue;
            const i = O.get(key); if (!ignoreBody && i != null && d + 1 <= len - 1 - i) continue;
            if (ignoreBody && i === 1 && d === 0) continue;
            prev.set(key, c + "," + r); dq.push([nc, nr, d + 1]);
          }
        }
        return null;
      }
      function place(chars) {
        const out = [], head = snake[0];
        for (let n = 0; n < chars.length; n++) {
          let best = null;
          for (let tries = 0; tries < 400 && !best; tries++) {
            const minD = tries < 250 ? 5.2 : 4, c = randi(2, COLS - 3), r = randi(2, ROWS - 3);
            if (out.some(b => Math.hypot(b.c - c, (b.r - r) * 1.0) < minD)) continue;
            if (snake.some(s => Math.abs(s.c - c) <= 2 && Math.abs(s.r - r) <= 2) || Math.hypot(head.c - c, head.r - r) < 5) continue;
            best = { c, r };
          }
          if (!best) best = { c: randi(2, COLS - 3), r: randi(2, ROWS - 3) };
          out.push(Object.assign(best, { ch: chars[n], col: pick(BTN), t: -n * 0.08, eaten: false, claimed: false, gone: 0 }));
        }
        return out;
      }
      function newWord() {
        st.word = pool.next(); st.typed = 0; st.eaten = 0; queue = [];
        const chars = st.word.split("");
        const src = (L <= 3 ? LETTERS[L] : LANG === "ca" ? "abcdefgilmnoprstuv".split("") : Object.keys(LD.freq).filter(c => /^[a-z]$/.test(c) && LD.freq[c] > 0.5)).filter(ch => !chars.includes(ch));
        const baits = shuffle(src).slice(0, BAITS);
        buttons = place(shuffle(chars.concat(baits)));
        st.phase = "sew"; st.t = 0; Sfx.play("page");
        setTimeout(() => { if (!st.done) api.sayItem(st.word, L <= 3 ? "{x}" : "{x}"); }, api.demo ? 50 : 250);
      }
      newWord();
      function eat(b) {
        b.eaten = true; b.gone = 0.001; st.eaten++; b.hx = cx(snake[0].c); b.hy = cy(snake[0].r);
        Sfx.play("bite"); setTimeout(() => Sfx.play("pop"), 90);
        api.particles.emit(cx(b.c), cy(b.r), { count: 14, color: [b.col, "#FFFFFF", "#F2B630"], speed: 240, gravity: 300, size: 9, life: 0.6, shape: "square" });
        if (st.eaten >= st.word.length) {
          st.words++; api.hud.progress = [st.words, GOAL]; st.phase = "joy"; st.t = 0; st.joy = 1.4;
          if (L >= 4) api.say(st.word);
          Sfx.play("win");
          const h = snake[0]; api.particles.emit(cx(h.c), cy(h.r), { count: 30, color: ["#E86A9A", "#F2B630", "#2E7FB8", "#3E9A55", "#fff"], shape: "star", speed: 380, gravity: 220, size: 12, life: 1.1 });
        }
      }
      function stepSnake() {
        if (!path || !path.length) return;
        const n = path.shift();
        snake.unshift({ c: n.c, r: n.r, born: api.t });
        const tl = targetLen();
        while (snake.length > tl) { const d = snake.pop(); dying.push({ c: d.c, r: d.r, t: 0, col: SNAKE[(snake.length) % 3] }); }
        if (!path.length) { const b = moving; path = null; moving = null; if (b) eat(b); }
      }
      api.hud.progress = [0, GOAL];
      return {
        expected() { return (st.phase === "play" || st.phase === "sew") && !st.done && st.typed < st.word.length ? st.word[st.typed] : null; },
        onKey(k) {
          if (st.done || (st.phase !== "play" && st.phase !== "sew") || k.length !== 1 || st.typed >= st.word.length) return;
          const ch = st.word[st.typed];
          if (k === ch) {
            // botó lliure més proper (des d'on serà la serp quan hi arribi)
            const from = queue.length ? queue[queue.length - 1] : moving || snake[0];
            const cand = buttons.filter(b => b.ch === k && !b.claimed && !b.eaten);
            cand.sort((a, b) => (Math.abs(a.c - from.c) + Math.abs(a.r - from.r)) - (Math.abs(b.c - from.c) + Math.abs(b.r - from.r)));
            const b = cand[0]; if (!b) return; b.claimed = true; queue.push(b); st.typed++;
            api.hit({ sfx: false }); Sfx.play("note", { note: 72 + [0, 2, 4, 7, 9, 12][st.typed % 6], d: 0.25, type: "sine", v: 0.18 });
          } else {
            api.miss(ch, k, { sfx: "thud" }); st.stop = 0.6; st.look = 1.4;
            const wrong = buttons.find(b => b.ch === k && !b.eaten); if (wrong) wrong.shake = 1;
          }
        },
        update(dt) {
          st.t += dt; st.look = Math.max(0, st.look - dt); st.joy = Math.max(0, st.joy - dt);
          buttons.forEach(b => { b.t += dt; if (b.gone) b.gone += dt; if (b.shake) b.shake = Math.max(0, b.shake - dt * 2.5); });
          for (let i = dying.length - 1; i >= 0; i--) { dying[i].t += dt; if (dying[i].t > 0.35) dying.splice(i, 1); }
          if (st.phase === "sew" && st.t > 0.55 + buttons.length * 0.08) { st.phase = "play"; st.t = 0; }
          if (st.phase === "joy" && st.t > 1.5) {
            if (st.words >= GOAL) { if (!st.done) { st.done = true; api.finish(true, { collectName: "una tela brodada nova" }); } }
            else { buttons.forEach(b => { if (!b.eaten) b.gone = 0.001; }); st.phase = "clear"; st.t = 0; }
          }
          if (st.phase === "clear" && st.t > 0.45) newWord();
          // moviment pas a pas (la serp es brodada punt a punt)
          if (st.stop > 0) { st.stop -= dt; return; }
          if (!path && queue.length && st.phase !== "joy") { moving = queue.shift(); path = bfs(snake[0], moving, false) || bfs(snake[0], moving, true) || [{ c: moving.c, r: moving.r }]; if (path.length > 1) path.pop(); st.stepT = 0; }
          if (path) { st.stepT += dt; while (path && st.stepT >= stepDur()) { st.stepT -= stepDur(); stepSnake(); } }
          else if (snake.length > targetLen() && st.t % 0.2 < dt) { const d = snake.pop(); dying.push({ c: d.c, r: d.r, t: 0, col: SNAKE[snake.length % 3] }); }
        },
        draw(ctx) {
          const t = api.t;
          ctx.drawImage(bgSpr().c, 0, 0, W, H);
          // cua que es descus
          for (const d of dying) Sprites.draw(ctx, cellSpr(d.col), cx(d.c), cy(d.r), { alpha: 1 - d.t / 0.35 });
          // Fil continu sota els segments de llana: evita una silueta de peces separades.
          if(Art.get('g24-sewing') && snake.length>1){
            ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
            for(const [width,color] of [[31,'#105842'],[23,'#258468']]){
              ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();
              snake.forEach((s,i)=>ctx[i?'lineTo':'moveTo'](cx(s.c),cy(s.r)));ctx.stroke();
            }ctx.restore();
          }
          // cos brodat (la cel·la nova es broda punt a punt)
          const wig = !Settings.reduceMotion && st.joy > 0 ? st.joy : 0;
          for (let i = snake.length - 1; i >= 1; i--) {
            const s = snake[i], col = SNAKE[i % 3], age = s.born < 0 ? 9 : t - s.born, off = wig ? Math.sin(t * 14 - i * 0.9) * 5 * Math.min(1, wig) : 0;
            const x = cx(s.c), y = cy(s.r);
            if (age >= stepDur() * 1.5) Sprites.draw(ctx, cellSpr(col), x + off * (i % 2 ? 1 : -1) * 0.5, y + off, {});
            else { const n = Math.floor(clamp(age / (stepDur() * 1.5), 0, 1) * 18); ctx.save(); ctx.translate(x - C / 2, y - C / 2); for (let q = 0; q < 9; q++) { const leg = n - q * 2; if (leg <= 0) break; cross(ctx, (q % 3) * AI, Math.floor(q / 3) * AI, col, { n: Math.min(2, leg) }); } ctx.restore(); }
          }
          // botons cosits (amb puntades a la vora)
          for (const b of buttons) {
            const k = clamp(b.t / 0.35, 0, 1); if (k <= 0) continue;
            const gone = b.gone ? clamp(b.gone / 0.4, 0, 1) : 0, ge = b.eaten ? Ease.inCubic(gone) : 0, x = lerp(cx(b.c), b.eaten ? b.hx : cx(b.c), ge) + (b.shake ? Math.sin(b.shake * 30) * 6 * b.shake : 0), y = lerp(cy(b.r), b.eaten ? b.hy : cy(b.r), ge) - Math.sin(gone * Math.PI) * 30;
            const s = Ease.outBack(k) * (1 + gone * 0.25) * (b.eaten ? 1 - gone * 0.9 : 1), a = 1 - gone;
            if (a <= 0) continue;
            Sprites.draw(ctx, buttonSpr(b.col, R), x, y, { s, alpha: a });
            if (!gone) { ctx.save(); ctx.strokeStyle = "#D6453A"; ctx.lineWidth = 3.5; ctx.lineCap = "round"; for (let i = 0; i < 4; i++) { const an = 0.785 + i * 1.571; const r1 = R * 0.9 * s, r2 = R * 1.12 * s; ctx.beginPath(); ctx.moveTo(x + Math.cos(an - 0.12) * r1, y + Math.sin(an - 0.12) * r1); ctx.lineTo(x + Math.cos(an + 0.12) * r2, y + Math.sin(an + 0.12) * r2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + Math.cos(an + 0.12) * r1, y + Math.sin(an + 0.12) * r1); ctx.lineTo(x + Math.cos(an - 0.12) * r2, y + Math.sin(an - 0.12) * r2); ctx.stroke(); } ctx.restore(); }
          }
          // cap: puntada de setí amb ulls de botó
          const h = snake[0], nk = snake[1] || { c: h.c - 1, r: h.r }, dirA = Math.atan2(h.r - nk.r, h.c - nk.c);
          const hx = cx(h.c), hy = cy(h.r) + (wig ? Math.sin(t * 14) * 5 : 0);
          ctx.save(); ctx.translate(hx, hy); ctx.rotate(dirA);
          const headArt=Art.cell('g24-sewing',2,2,2,76,52);
          if(headArt)ctx.drawImage(headArt,-38,-26,76,52);
          else {
          ctx.fillStyle = "rgba(40,25,15,0.25)"; ctx.beginPath(); ctx.ellipse(2, 3, 30, 24, 0, 0, 6.28); ctx.fill();
          ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 30, 24, 0, 0, 6.28); ctx.fillStyle = "#2E9E6A"; ctx.fill(); ctx.clip();
          ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 2; for (let k = -40; k < 40; k += 5) { ctx.beginPath(); ctx.moveTo(k, -30); ctx.lineTo(k + 18, 30); ctx.stroke(); }
          ctx.strokeStyle = "rgba(0,40,20,0.25)"; for (let k = -38; k < 40; k += 5) { ctx.beginPath(); ctx.moveTo(k, -30); ctx.lineTo(k + 18, 30); ctx.stroke(); }
          ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.ellipse(-6, -10, 16, 6, 0, 0, 6.28); ctx.fill();
          ctx.restore();
          }
          if (Math.sin(t * 2.2) > 0.6 && !st.look) { ctx.strokeStyle = "#D6453A"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(40, 0); ctx.lineTo(46, -5); ctx.moveTo(40, 0); ctx.lineTo(46, 5); ctx.stroke(); }
          ctx.restore();
          // ulls (miren el botó, o amunt cap a la paraula quan s'equivoca)
          const tgt = moving || queue[0], lookA = st.look ? -Math.PI / 2 : tgt ? Math.atan2(cy(tgt.r) - hy, cx(tgt.c) - hx) : dirA;
          for (const e of [-1, 1]) {
            const ex = hx + Math.cos(dirA) * 6 + Math.cos(dirA + Math.PI / 2) * e * 11, ey = hy + Math.sin(dirA) * 6 + Math.sin(dirA + Math.PI / 2) * e * 11;
            ctx.fillStyle = "#FFFDF6"; ctx.beginPath(); ctx.arc(ex, ey, 8.5, 0, 6.28); ctx.fill(); ctx.strokeStyle = "rgba(30,40,30,0.6)"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.fillStyle = "#1A1A1A"; ctx.beginPath(); ctx.arc(ex + Math.cos(lookA) * 3.5, ey + Math.sin(lookA) * 3.5, 4.2, 0, 6.28); ctx.fill();
            ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(ex + Math.cos(lookA) * 3.5 - 1.3, ey + Math.sin(lookA) * 3.5 - 1.5, 1.4, 0, 6.28); ctx.fill();
          }
          // agulla que segueix la serp, amb el fil
          const bob = Settings.reduceMotion ? 0 : Math.sin(t * 9) * 0.5 + 0.5, back = dirA + Math.PI, nx = hx + Math.cos(back) * 30 + Math.cos(back + 1.2) * 34, ny = hy + Math.sin(back) * 30 + Math.sin(back + 1.2) * 34 - 26;
          ctx.save(); ctx.strokeStyle = "#2E9E6A"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(hx + Math.cos(back) * 22, hy + Math.sin(back) * 22); ctx.quadraticCurveTo(nx, ny + 30, nx + 6, ny - 26); ctx.stroke(); ctx.restore();
          ctx.save(); ctx.translate(nx, ny + bob * 8); ctx.rotate(0.5);
          ctx.fillStyle = "rgba(40,25,15,0.25)"; ctx.fillRect(4, 6, 6, 64);
          const ng = ctx.createLinearGradient(-3, 0, 3, 0); ng.addColorStop(0, "#9AA3AB"); ng.addColorStop(0.5, "#F4F7FA"); ng.addColorStop(1, "#7E8790"); ctx.fillStyle = ng;
          ctx.beginPath(); ctx.moveTo(-3, -30); ctx.lineTo(3, -30); ctx.lineTo(2.2, 30); ctx.lineTo(0, 40); ctx.lineTo(-2.2, 30); ctx.closePath(); ctx.fill();
          ctx.fillStyle = "#E9DCC4"; ctx.beginPath(); ctx.ellipse(0, -23, 1.2, 4, 0, 0, 6.28); ctx.fill();
          ctx.restore();
          // plaques: als botons i la paraula a dalt
          for (const b of buttons) {
            const k = clamp((b.t - 0.15) / 0.3, 0, 1); if (k <= 0) continue;
            const gone = b.gone ? clamp(b.gone / 0.3, 0, 1) : 0; if (gone >= 1) continue;
            const ge = b.eaten ? Ease.inCubic(gone) : 0, x = lerp(cx(b.c), b.eaten ? b.hx : cx(b.c), ge) + (b.shake ? Math.sin(b.shake * 30) * 6 * b.shake : 0), y = lerp(cy(b.r), b.eaten ? b.hy : cy(b.r), ge) - Math.sin(gone * Math.PI) * 30;
            drawPlate(ctx, b.ch, x, y, { size: 64, scale: Ease.outBack(k), alpha: 1 - gone, shadowBlur: 4, shadowY: 2, state: b.claimed && !b.eaten ? "active" : null });
          }
          if (st.word) {
            const sz = st.word.length <= 2 ? 64 : st.word.length <= 6 ? 58 : 50;
            drawPlate(ctx, st.word, 800, 130, { size: sz, progress: st.typed, state: st.look ? "hint" : "active", shadowBlur: 6 });
          }
          drawVignette(ctx, 0.15, "90,60,30");
        },
      };
    },
  });
})();
