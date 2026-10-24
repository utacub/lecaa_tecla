"use strict";
/* 2. Invasors de l'alfabet — píxel art de 16 colors, nebulosa amb tramat i pantalla antiga */
(() => {
  // paleta de 16 colors
  const P = ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"];
  const OUT = "#0A0D22";
  const PX = 9, SPX = 7, CANNON_Y = 822, SHIELD_Y = 722, LIMIT_Y = 704, WAVES = 5;
  // espècies de medusa: cos (a), ombra (b), llum (c)
  const SPECIES = [
    { a: P[14], b: P[2], c: P[15] }, { a: P[12], b: P[1], c: P[7] }, { a: P[11], b: P[3], c: P[7] },
    { a: P[9], b: P[4], c: P[10] }, { a: P[13], b: P[1], c: P[6] }, { a: P[8], b: P[2], c: P[14] },
  ];
  const SHAPES = [
    { body: ["....aaaaa....", "..aaccaaaaa..", ".acccaaaaaaa.", ".acaaaaaaaaa.", "aaekeaaaekeaa", "aaeeeaaaeeeaa", "apaaaaaaaaapa", "abaaabbbaaaba", ".bbbbbbbbbbb."],
      legs: [[".b.b..b..b.b.", "b..b..b..b..b"], [".b.b..b..b.b.", "..b..b.b..b.."]] },
    { body: ["..c.......c..", "...a.....a...", "..aaaaaaaaa..", ".aacaaaaaaaa.", ".aekeaaaekea.", "aaeeeaaaeeeaa", "apaaabbbaaapa", "aaaaaaaaaaaaa"],
      legs: [[".a.aa...aa.a.", "a..a.....a..a"], [".a.aa...aa.a.", ".a..a...a..a."]] },
    { body: ["...aaaaaaa...", ".aacccaaaaaa.", "aacaaaaaaaaaa", "aaekeaaaekeaa", "aaeeeaaaeeeaa", "apaaabbbaaapa", ".aaaaaaaaaaa."],
      legs: [["aa.aa.a.aa.aa", "a...a...a...a"], [".aa.aa.aa.aa.", ".a...a.a...a."]] },
  ];
  // nau nodrissa i nau gegant generades per programa (cúpula + plat + tentacles)
  function saucerRows(w, frame, giant) {
    const rows = [], c = (w - 1) / 2, dome = giant ? 6 : 4;
    for (let j = 0; j < dome; j++) { const hw = Math.round(Math.sqrt(1 - Math.pow((dome - j - 0.5) / dome, 2)) * (w * (giant ? 0.3 : 0.28))); let s = ""; for (let i = 0; i < w; i++) { const d = i - c; s += Math.abs(d) <= hw ? (j <= 1 && d < -hw * 0.2 && d > -hw * 0.9 ? "g" : "d") : "."; } rows.push(s); }
    const bodyH = giant ? 5 : 3;
    for (let j = 0; j < bodyH; j++) { const hw = c - (j === 0 ? 2 : j === bodyH - 1 ? 1 : 0); let s = ""; for (let i = 0; i < w; i++) { const d = Math.abs(i - c); s += d <= hw ? (j === 0 ? (d < hw - 1 ? "c" : "a") : j === bodyH - 1 ? "b" : "a") : "."; } rows.push(s); }
    // pilot dins la cúpula i finestres al plat
    const ej = dome - 2, ex = giant ? 4 : 2;
    rows[ej] = rows[ej].split("").map((ch, i) => { const d = i - c; if (Math.abs(Math.abs(d) - ex) === 0) return "k"; if (Math.abs(Math.abs(d) - ex) === 1 && ch !== ".") return "e"; return ch; }).join("");
    const mid = dome + 1, wins = giant ? [-12, -6, 0, 6, 12] : [-7, 0, 7];
    rows[mid] = rows[mid].split("").map((ch, i) => { const d = i - c; for (const e of wins) { if (Math.abs(d - e) <= 1) return "l"; } return ch; }).join("");
    // llums que s'alternen
    let s = ""; for (let i = 0; i < w; i++) { const d = Math.abs(i - c); s += d <= c - 3 ? (((i + frame * 2) % 4 === 0) ? "l" : "b") : "."; } rows.push(s);
    // tentacles de medusa
    for (let j = 0; j < (giant ? 3 : 2); j++) { let t = ""; for (let i = 0; i < w; i++) { const d = Math.abs(i - c); const on = d <= c - 4 && ((i + (j % 2 ? frame * 2 + 1 : frame * 2) + j) % 4 === 0); t += on ? "b" : "."; } rows.push(t); }
    return rows;
  }
  const cache = {};
  function pixelCanvas(key, rows, cmap, px) {
    if (cache[key]) return cache[key];
    const h = rows.length, w = rows[0].length, c = makeCanvas((w + 2) * px, (h + 2) * px), x = c.getContext("2d");
    const at = (i, j) => (j >= 0 && j < h && i >= 0 && i < w) ? rows[j][i] : ".";
    for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) {
      const ch = at(i, j);
      if (ch === ".") { if (at(i - 1, j) !== "." || at(i + 1, j) !== "." || at(i, j - 1) !== "." || at(i, j + 1) !== ".") { x.fillStyle = OUT; x.fillRect((i + 1) * px, (j + 1) * px, px, px); } continue; }
      x.fillStyle = cmap[ch] || "#f0f"; x.fillRect((i + 1) * px, (j + 1) * px, px, px);
      // Cantells de píxels sencers; sense suavitzar la silueta.
      if (ch === 'a' || ch === 'b' || ch === 'd') {
        if (at(i, j - 1) === '.') { x.fillStyle = cmap.c || P[7]; x.fillRect((i + 1) * px, (j + 1) * px, px, Math.max(1, Math.floor(px / 3))); }
        if (at(i, j + 1) === '.') { x.fillStyle = OUT; x.fillRect((i + 1) * px, (j + 2) * px - 2, px, 2); }
      }
    }
    return cache[key] = c;
  }
  const cmapOf = sp => ({ a: sp.a, b: sp.b, c: sp.c, e: P[7], k: P[1], p: P[14], d: P[12], g: P[7], l: P[10] });
  function shipSprite(kind, spi, frame) {
    const idx=kind==='ship'?[0,2,1,3,0,2][spi%6]:4;
    const w=kind==='giant'?410:kind==='mother'?250:190,h=kind==='giant'?250:kind==='mother'?160:150;
    const art=Art.cell('orbital-sprites',idx,3,2,w,h);if(art)return art;
    const sp = SPECIES[spi % SPECIES.length];
    if (kind === "mother" || kind === "giant") {
      const giant = kind === "giant", w = giant ? 33 : 23;
      const m = cmapOf(sp); m.d = P[6]; m.g = P[7]; m.e = P[7]; m.k = P[1];
      return pixelCanvas(`${kind}${spi}_${frame}`, saucerRows(w, frame, giant), m, giant ? 11 : 9);
    }
    const sh = SHAPES[spi % SHAPES.length];
    return pixelCanvas(`s${spi}_${frame}`, sh.body.concat(sh.legs[frame]), cmapOf(sp), PX);
  }
  const CANNON = ["......ccc......", "......cac......", ".....aaaaa.....", "..aaaaaaaaaaa..", ".aacaaaaaaacaa.", "aaaaaaaaaaaaaaa", "abbbbbbbbbbbbba", ".b.b.b...b.b.b."];
  const cannonSprite = () => Art.cell("orbital-sprites",5,3,2,200,166) || pixelCanvas("cannon", CANNON, { a: P[12], b: P[1], c: P[7] }, 8);
  const BOLT = [["..a..", ".aba.", "abcba", ".aba.", "..a.."], [".a.a.", "aabaa", ".bcb.", "aabaa", ".a.a."]];
  const boltSprite = f => {
    const key='plasma'+f;if(cache[key])return cache[key];const c=makeCanvas(54,54),x=c.getContext('2d');
    const g=x.createRadialGradient(23,20,2,27,27,25);g.addColorStop(0,'#fffbe5');g.addColorStop(.2,'#ffe48b');g.addColorStop(.55,'#ff9439');g.addColorStop(1,'rgba(255,89,40,0)');x.fillStyle=g;x.fillRect(0,0,54,54);
    x.strokeStyle='#ffecc5';x.lineWidth=2;x.beginPath();x.ellipse(27,27,16,9,f*.8-.4,0,7);x.stroke();return cache[key]=c;
  };
  const BUNKER = ["...aaaaaaaa...", "..aaaaaaaaaa..", ".aaaaaaaaaaaa.", "aaaaaaaaaaaaaa", "aaaaaaaaaaaaaa", "aaaaaaaaaaaaaa", "aaaa......aaaa", "aaa........aaa"];

  /* ---------- fons: nebulosa amb tramat ordenat + planeta + capes d'estrelles ---------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
  const LW = 320, LH = 180, LS = W / LW; // fons a baixa resolució (píxels de 5 px)
  function nebulaCanvas() {
    if (cache.neb) return cache.neb;
    const w = LW, h = LH, c = makeCanvas(w, h), x = c.getContext("2d"), id = x.createImageData(w, h), d = id.data;
    const n = makeNoise(77), m = makeNoise(91);
    const rampA = ["#000000", "#080b22", P[1], "#4a1a45", P[2]], rampB = ["#000000", "#080b22", P[1], "#173d6e", "#1f5f96"];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const o = (j * w + i) * 4, th = BAYER[(j % 4) * 4 + (i % 4)];
      const v = n.fbm(i / 56, j / 56, 5), u = m.fbm(i / 44 + 9, j / 44, 4);
      const k = clamp((v - 0.33) * 4.2, 0, 3.8), ramp = u > 0.5 ? rampB : rampA;
      const [r, g, b] = hexToRgb(ramp[clamp(Math.floor(k + th), 0, 4)]); d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255;
    }
    x.putImageData(id, 0, 0); return cache.neb = c;
  }
  function planetCanvas() {
    if (cache.planet) return cache.planet;
    const w = 90, h = 60, c = makeCanvas(w, h), x = c.getContext("2d"), id = x.createImageData(w, h), d = id.data, n = makeNoise(5);
    const cx = 45, cy = 30, pr = 19;
    const put = (i, j, col) => { const o = (j * w + i) * 4, [r, g, b] = hexToRgb(col); d[o] = r; d[o + 1] = g; d[o + 2] = b; d[o + 3] = 255; };
    const ring = (i, j) => { const dx = i - cx, dy = j - cy, ry = (dy - dx * 0.28) * 3.2, rd = Math.hypot(dx, ry); return rd > pr * 1.3 && rd < pr * 2.05 ? rd : 0; };
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const dx = i - cx, dy = j - cy, dd = Math.hypot(dx, dy), th = BAYER[(j % 4) * 4 + (i % 4)], rd = ring(i, j);
      const front = rd && (dy - dx * 0.28) > 0;
      if (dd < pr && !front) {
        const lit = clamp(0.62 - (dx * 0.8 + dy) / (pr * 2.1), 0, 1), band = Math.sin(dy * 0.9 + n(i / 5, j / 5) * 2.5) > 0.2;
        const ramp = ["#0b0610", P[2], band ? P[4] : "#8a3d4a", band ? P[9] : P[15]]; put(i, j, ramp[clamp(Math.floor(lit * 3.2 + th - 0.2), 0, 3)]);
      } else if (rd) {
        if (!front && dd < pr + 0.5) continue;
        const shadowed = front ? false : dd < pr + 3;
        put(i, j, Math.floor(rd * 0.7) % 3 === 0 ? P[5] : shadowed ? P[5] : P[13]);
      }
    }
    x.putImageData(id, 0, 0); return cache.planet = c;
  }
  function starLayer(seed, n, cols, big) {
    const key = "st" + seed; if (cache[key]) return cache[key];
    const w = LW, h = LH, c = makeCanvas(w, h), x = c.getContext("2d"), R = mulberry32(seed);
    for (let k = 0; k < n; k++) {
      const sx = Math.floor(R() * w), sy = Math.floor(R() * h); x.fillStyle = cols[Math.floor(R() * cols.length)]; x.fillRect(sx, sy, 1, 1);
      if (big && R() < 0.35) { x.globalAlpha = 0.6; x.fillRect(sx - 1, sy, 1, 1); x.fillRect(sx + 1, sy, 1, 1); x.fillRect(sx, sy - 1, 1, 1); x.fillRect(sx, sy + 1, 1, 1); x.globalAlpha = 1; }
    }
    return cache[key] = c;
  }
  function crtOverlay() {
    if (cache.crt) return cache.crt;
    const c = makeCanvas(W, H), x = c.getContext("2d");
    x.fillStyle = "rgba(0,0,0,0.10)"; for (let y = 0; y < H; y += 4) x.fillRect(0, y + 2, W, 2);
    // curvatura: cantonades fosques i un reflex de vidre molt suau
    const g = x.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, W * 0.66); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.75, "rgba(0,0,0,0.25)"); g.addColorStop(1, "rgba(0,0,0,0.75)");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const gl = x.createLinearGradient(0, 0, W * 0.4, H * 0.5); gl.addColorStop(0, "rgba(255,255,255,0.06)"); gl.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gl; x.fillRect(0, 0, W, H);
    return cache.crt = c;
  }
  function drawSpace(ctx, t, scroll) {
    const im=Art.get('orbital-bg');if(im){ctx.drawImage(im,0,0,W,H);
      // Tiny beacons breathe while the station and landing deck remain stable.
      ctx.save();ctx.globalAlpha=Settings.reduceMotion?.4:.25+.15*Math.sin(t*1.5);ctx.fillStyle='#8deaff';
      for(let i=0;i<12;i++){ctx.beginPath();ctx.arc(120+i*123,790+(i%2)*8,2,0,7);ctx.fill();}ctx.restore();return;}
    ctx.save(); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(nebulaCanvas(), 0, 0, W, H);
    ctx.fillStyle = 'rgba(4,8,25,0.42)'; ctx.fillRect(0, 0, W, H);
    if (Settings.reduceMotion) scroll = 0;
    const layers = [[starLayer(11, 200, [P[5], P[13], P[1]]), 5], [starLayer(23, 90, [P[6], P[13], P[12]]), 13], [starLayer(37, 34, [P[7], P[15], P[10]], true), 30]];
    layers.forEach(([c, sp], li) => {
      const off = Math.floor(((scroll * sp) % H) / LS) * LS; ctx.globalAlpha = [0.35, 0.55, 0.75][li]; ctx.drawImage(c, 0, off, W, H); ctx.drawImage(c, 0, off - H, W, H);
      if (li === 0) { const py = Math.floor((520 + scroll * 2) % (H + 400) / LS) * LS - 200; ctx.globalAlpha = 0.38; ctx.drawImage(planetCanvas(), 1260, py, 72 * LS, 48 * LS); }
    });
    ctx.globalAlpha = 1;
    // Plataforma lunar al marge inferior, fora de les plaques de lectura.
    for (let k = 0; k < 80; k++) { const yy = 870 + Math.round((Math.sin(k * 0.43) + Math.cos(k * 0.19)) * 4) * 3;
      ctx.fillStyle = P[1]; ctx.fillRect(k * 20, yy, 20, H - yy); ctx.fillStyle = P[13]; ctx.fillRect(k * 20, yy, 20, 3); }
    ctx.restore();
  }
  const blit = (ctx, c, x, y, s = 1) => ctx.drawImage(c, Math.round(x - c.width * s / 2), Math.round(y - c.height * s / 2), c.width * s, c.height * s);
  function sfx(fn) { if (Settings.sfx && Audio2.ctx && Audio2.unlocked) try { fn(); } catch (e) { } }
  const pixBoom = () => sfx(() => { noise({ f: 900, f2: 120, d: 0.38, v: 0.28, ft: "lowpass" }); tone({ f: 220, f2: 50, d: 0.3, type: "square", v: 0.08, lp: 1200 }); });

  const LV = {
    1: { waves: [4, 4, 5, 5, 6], vy: 6, vx: 46, fire: 8.5, shots: 1, shotV: 52, size: 72 },
    2: { waves: [4, 5, 5, 6, 6], vy: 6.5, vx: 50, fire: 7.5, shots: 1, shotV: 56, size: 72 },
    3: { waves: [5, 6, 6, 7, 8], vy: 7.5, vx: 56, fire: 6.5, shots: 2, shotV: 60, size: 68 },
    4: { waves: [3, 3, 4, 4, 5], vy: 5.5, vx: 42, fire: 9, shots: 1, shotV: 46, size: 60 },
    5: { waves: [3, 3, 4, 4, 1], vy: 4.6, vx: 38, fire: 0, shots: 0, size: 52 },
    6: { waves: [3, 3, 3, 4, 1], vy: 4, vx: 34, fire: 0, shots: 0, size: 48 },
  };
  const GIANT5 = LX("g02.giant5", ["planeta", "estrella", "astronauta", "cometa", "meteorit"]);
  const GIANT6 = LX("g02.giant6", ["la lluna surt", "som astronautes", "adéu estrelles", "bon viatge", "la nau gegant"]);

  Games.register({
    id: 2, key: "i", name: "Invasors de l'alfabet", zone: "espai", music: "arcade",
    collect: { one: "insígnia de pilot", many: "insígnies de pilot" },
    goal: l => l <= 3 ? "Prem la lletra de cada nau per disparar-hi. Neteja 5 onades sense perdre les 3 vides." : l === 4 ? "Escriu la síl·laba de cada nau nodrissa. Neteja 5 onades sense perdre les 3 vides." : "Escriu la paraula de cada nau. A l'última onada arriba una nau gegant!",
    missAt: [800, 560], captionY: 470,
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const s = Math.max(w / 460, h / 250); ctx.translate(w / 2, h / 2); ctx.scale(s, s); ctx.translate(-230, -125);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(Art.get("orbital-bg") || nebulaCanvas(), -20, -10, 500, 280);
      ctx.fillStyle = 'rgba(4,8,25,0.42)'; ctx.fillRect(-20,-10,500,280);
      ctx.drawImage(starLayer(37, 34, [P[7], P[15], P[10]], true), 0, 0, LW / 2, LH / 2, -20, -10, 500, 280);
      if (Settings.reduceMotion) t = 0; const f = Math.floor(t * 2) % 2;
      ctx.save(); ctx.globalCompositeOperation = "lighter"; const lg = ctx.createLinearGradient(0, 0, 0, 220); lg.addColorStop(0, "rgba(41,173,255,0.1)"); lg.addColorStop(1, "rgba(41,173,255,0.75)"); ctx.fillStyle = lg; ctx.fillRect(225, 92, 10, 120); ctx.fillStyle = "rgba(255,241,232,0.9)"; ctx.fillRect(228, 92, 4, 120); ctx.restore();
      blit(ctx, shipSprite("ship", 1, f), 108, 70 + Math.sin(t * 2) * 3, 0.85);
      blit(ctx, shipSprite("ship", 0, 1 - f), 230, 52 + Math.sin(t * 2 + 1) * 3, 1.05);
      blit(ctx, shipSprite("ship", 2, f), 352, 70 + Math.sin(t * 2 + 2) * 3, 0.85);
      blit(ctx, cannonSprite(), 230, 222, 1);
      
      drawPlate(ctx, "i", 230, 128, { size: 64, border: P[14], borderW: 4, shadowBlur: 6 });
      ctx.restore();
    },
    create(api) {
      const L = api.level, cfg = LV[L], pool = api.pool({ theme: L >= 5 ? "espai" : undefined });
      const shotPool = api.pool({});
      const ships = [], shots = [], beams = [], rings = [], pops = [];
      const st = { phase: "banner", t: 0, wave: 0, lives: 3, over: false, scroll: 0, fireT: 3, hurt: 0, cleared: 0, dir: 1, fx: 0, fy: 0 };
      const cannon = { x: W / 2, tx: W / 2, recoil: 0, puff: 0 };
      const shields = [380, 800, 1220].map(sx => ({ x: sx, cells: BUNKER.map(r => r.split("").map(ch => ch === "a" ? 1 : 0)), dirty: true, c: null }));
      let banner = { text: "Onada 1 de 5", sub: "Prem la lletra de les naus", t: 0 };
      const typer = api.typer({
        targets: () => ships.concat(shots),
        rank: t => -t.y,
        onStep(t) {
          cannon.tx = t.x;
          if (!t.done && t.text.length > 1) { beams.push({ x: t.x, y: t.y + (t.isShot ? 0 : 20), t: 0, small: true, delay: 0.06 }); sfx(() => tone({ f: 1400, f2: 600, d: 0.08, type: "square", v: 0.05, lp: 3500 })); }
        },
        onDone(t) { destroy(t); },
        onMiss() { Sfx.play("click0"); cannon.recoil = 0.6; cannon.puff = 1; },
      });
      function destroy(t) {
        t.dead = true; cannon.tx = t.x; cannon.recoil = 1;
        beams.push({ x: t.x, y: t.y, t: 0, delay: 0.09, target: t });
        Sfx.play("laser");
      }
      function explode(t) {
        const sp = SPECIES[(t.spi || 0) % SPECIES.length], big = t.kind === "giant" ? 2.4 : t.kind === "mother" ? 1.5 : 1;
        if (t.isShot) { api.particles.emit(t.x, t.y, { count: 14, color: [P[9], P[10], P[7]], shape: "square", size: 8, speed: 240, gravity: 500, life: 0.7 }); sfx(() => noise({ f: 2400, d: 0.12, v: 0.2 })); return; }
        api.particles.emit(t.x, t.y, { count: Math.round(26 * big), color: [sp.a, sp.b, sp.c, P[7]], shape: "square", size: 10, speed: 300 * Math.sqrt(big), gravity: 650, life: 1.2, drag: 0.97 });
        api.particles.emit(t.x, t.y, { count: 8, color: [P[10], P[7]], shape: "square", size: 6, speed: 160, gravity: 0, life: 0.45 });
        rings.push({ x: t.x, y: t.y, t: 0, r: 70 * big, col: sp.c });
        pixBoom(); api.shake(big > 1.5 ? 10 : 4);
      }
      function spawnWave() {
        const n = cfg.waves[st.wave], giant = (L >= 5 && st.wave === WAVES - 1);
        ships.length = 0;
        let items;
        if (giant) items = [L === 5 ? pick(GIANT5) : pick(GIANT6)];
        else items = pool.many(n);
        const kind = giant ? "giant" : L >= 4 ? "mother" : "ship";
        const rows = (!giant && n >= 7) ? [Math.ceil(n / 2), Math.floor(n / 2)] : [n];
        const spacing = kind === "ship" ? (rows[0] >= 6 ? 210 : 240) : L >= 5 ? 340 : 270;
        let k = 0; const spis = shuffle([0, 1, 2, 3, 4, 5]);
        rows.forEach((cnt, ri) => {
          for (let i = 0; i < cnt; i++) {
            const text = items[k++], ox = (i - (cnt - 1) / 2) * spacing + (ri ? spacing / 2 * (rows[0] === cnt ? 1 : 0) : 0);
            ships.push({ text, kind, spi: spis[k % 6], ox, oy: ri * 230, x: W / 2 + ox, y: -120, enterT: -(k * 0.12), ph: rand(0, 6.28), size: giant ? (L === 5 ? 56 : 52) : cfg.size });
          }
        });
        st.fx = 0; st.fy = giant ? 170 : 160; st.dir = Math.random() < 0.5 ? -1 : 1; st.fireT = cfg.fire * 0.6;
        st.phase = "enter"; st.t = 0;
      }
      function plateY(s) { return s.y + shipSprite(s.kind, s.spi, 0).height / 2 + s.size * 0.66 - 6; }
      function loseLife(x, y) {
        st.lives--; st.hurt = 1; api.hud.lives = [Math.max(0, st.lives), 3];
        api.particles.emit(x, y, { count: 30, color: [P[8], P[9], P[10], P[7]], shape: "square", size: 10, speed: 320, gravity: 600, life: 1 });
        Sfx.play("boom"); api.shake(12);
        if (st.lives <= 0 && !st.over) { st.over = true; st.phase = "over"; st.t = 0; banner = { text: "Fi de la partida", sub: "Les naus han arribat a baix", t: 0 }; }
      }
      function setMusic() {
        if (Music.styleName !== "arcade" || !Music.STYLES.arcade) return;
        let low = 0; for (const s of ships) if (!s.dead) low = Math.max(low, clamp((plateY(s) - 250) / (LIMIT_Y - 250), 0, 1));
        const bpm = Math.round(132 + low * 42);
        if (!Music.style || Music.style.bpm !== bpm) Music.style = Object.assign({}, Music.STYLES.arcade, { bpm });
      }
      api.hud.lives = [3, 3]; api.hud.progress = [0, WAVES]; api.hud.label = "Onada 1";
      return {
        expected() { return st.phase === "play" ? typer.expected() : null; },
        onKey(k) { if (st.phase === "play") typer.key(k); },
        update(dt) {
          st.t += dt; st.scroll += dt; banner.t += dt;
          cannon.x += (cannon.tx - cannon.x) * Math.min(1, dt * 18);
          cannon.recoil = Math.max(0, cannon.recoil - dt * 4); cannon.puff = Math.max(0, cannon.puff - dt * 2.5); st.hurt = Math.max(0, st.hurt - dt * 1.5);
          if (st.phase === "banner" && st.t > (api.demo ? 0.4 : 1.4)) spawnWave();
          if (st.phase === "enter") {
            let all = true;
            ships.forEach(s => { s.enterT += dt; const k = Ease.outBack(clamp(s.enterT / 0.8, 0, 1)); s.x = W / 2 + st.fx + s.ox; s.y = lerp(-120, st.fy + s.oy, k); if (s.enterT < 0.8) all = false; });
            if (all) { st.phase = "play"; st.t = 0; }
          }
          if (st.phase === "play") {
            // la formació fa ziga-zaga i baixa
            const sp = api.speed, live = ships.filter(s => !s.dead);
            let minX = Infinity, maxX = -Infinity; live.forEach(s => { const hw = s.kind === "giant" ? 200 : s.kind === "mother" ? 150 : 70; minX = Math.min(minX, W / 2 + st.fx + s.ox - hw); maxX = Math.max(maxX, W / 2 + st.fx + s.ox + hw); });
            const vx = cfg.vx * sp * (live.length <= 2 ? 1.25 : 1);
            st.fx += st.dir * vx * dt;
            if ((maxX > W - 40 && st.dir > 0) || (minX < 40 && st.dir < 0)) { st.dir *= -1; st.fy += 14; }
            st.fy += cfg.vy * sp * dt * (api.demo ? 0 : 1);
            ships.forEach(s => { s.x = W / 2 + st.fx + s.ox; s.y = st.fy + s.oy + Math.sin(api.t * 2.4 + s.ph) * 4; });
            for (const s of live) if (plateY(s) + 46 > LIMIT_Y) { s.dead = true; s.landed = true; explode(s); loseLife(s.x, LIMIT_Y); }
            // trets enemics
            if (cfg.fire && !api.demo) {
              st.fireT -= dt * sp;
              if (st.fireT <= 0 && shots.filter(q => !q.dead).length < cfg.shots && live.length) {
                st.fireT = cfg.fire * rand(0.8, 1.2);
                const from = pick(live), used = ships.concat(shots).filter(q => !q.dead).map(q => q.text);
                const txt = L === 4 ? shotPool.next(used) : shotPool.next(used);
                shots.push({ text: txt, isShot: true, x: from.x, y: from.y + 30, vx: 0, t: 0, size: L === 4 ? 48 : 64 });
                sfx(() => tone({ f: 600, f2: 1200, d: 0.12, type: "square", v: 0.05, lp: 3000 }));
              }
            }
            if (!live.length && !st.over) {
              st.cleared++; api.hud.progress = [st.cleared, WAVES];
              shots.forEach(q => { if (!q.dead) { q.dead = true; explode(q); } });
              if (st.cleared >= WAVES) { st.phase = "won"; st.t = 0; banner = { text: "Sector superat!", sub: "Has guanyat la insígnia de pilot", t: 0 }; Sfx.play("win"); }
              else { st.phase = "cleared"; st.t = 0; banner = { text: "Onada superada!", sub: L_("Ara ve l'onada {n} de 5", { n: st.cleared + 1 }), t: 0 }; Sfx.play("star", { i: st.cleared % 3 }); }
            }
          }
          if (st.phase === "cleared" && st.t > (api.demo ? 0.6 : 1.8)) {
            st.wave++; api.hud.label = L_("Onada {n}", { n: st.wave + 1 });
            const giant = L >= 5 && st.wave === WAVES - 1;
            banner = { text: giant ? "Atenció: nau gegant!" : L_("Onada {n} de 5", { n: st.wave + 1 }), sub: giant ? (L === 6 ? "Escriu tota la frase, amb els espais" : "Escriu la paraula llarga") : "", t: 0 };
            st.phase = "banner"; st.t = 0;
          }
          if (st.phase === "won" && st.t > 1.6 && !st.fin) { st.fin = true; api.finish(true, { collectName: L_("la insígnia del sector {n}", { n: L }) }); }
          if (st.phase === "over" && st.t > 1.6 && !st.fin) { st.fin = true; api.finish(false); }
          // projectils: cauen cap al canó, els escuts els aturen
          for (const q of shots) {
            if (q.dead) continue;
            q.t += dt; q.vx += clamp((cannon.x - q.x) * 0.5 - q.vx, -60, 60) * dt; q.x += q.vx * dt; q.y += cfg.shotV * api.speed * dt;
            const hy = q.y + 56;
            if (hy > SHIELD_Y - 8 && hy < SHIELD_Y + 64) {
              for (const sh of shields) {
                const ci = Math.floor((q.x - (sh.x - 49)) / SPX), cj = Math.floor((hy - SHIELD_Y) / SPX);
                if (ci >= 0 && ci < 14 && cj >= 0 && cj < 8 && sh.cells[cj][ci]) {
                  for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) { const a = cj + dj, b = ci + di; if (a >= 0 && a < 8 && b >= 0 && b < 14 && Math.abs(di) + Math.abs(dj) <= 2 + (Math.random() < 0.5)) sh.cells[a][b] = 0; }
                  sh.dirty = true; q.dead = true; explode(q); break;
                }
              }
            }
            if (!q.dead && hy > CANNON_Y - 30) { q.dead = true; explode(q); if (Math.abs(q.x - cannon.x) < 70) loseLife(cannon.x, CANNON_Y); }
          }
          for (let i = shots.length - 1; i >= 0; i--) if (shots[i].dead) shots.splice(i, 1);
          for (let i = beams.length - 1; i >= 0; i--) { const b = beams[i]; b.t += dt; if (b.target && !b.boomed && b.t >= b.delay) { b.boomed = true; explode(b.target); } if (b.t > b.delay + 0.3) beams.splice(i, 1); }
          for (let i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t > 0.45) rings.splice(i, 1); }
          for (let i = ships.length - 1; i >= 0; i--) if (ships[i].dead && !beams.some(b => b.target === ships[i])) ships.splice(i, 1);
          setMusic();
        },
        draw(ctx) {
          const t = api.t, f = Settings.reduceMotion ? 0 : Math.floor((st.scroll) * 2) % 2;
          drawSpace(ctx, t, st.scroll);
          ctx.save(); ctx.imageSmoothingEnabled = true;
          // escuts
          shields.forEach(sh => {
            const alive=sh.cells.flat().reduce((a,b)=>a+b,0)/BUNKER.join('').split('').filter(c=>c==='a').length;
            ctx.save();ctx.translate(sh.x,SHIELD_Y+28);
            const base=ctx.createLinearGradient(0,12,0,50);base.addColorStop(0,'#8babb9');base.addColorStop(.3,'#324956');base.addColorStop(1,'#122530');
            ctx.fillStyle=base;rr(ctx,-78,13,156,35,10);ctx.fill();ctx.fillStyle='#ffba65';rr(ctx,-23,31,46,5,2);ctx.fill();
            if(alive>0){ctx.globalAlpha=.3+.65*alive;ctx.shadowColor='#59edff';ctx.shadowBlur=15;ctx.strokeStyle='#a4f7ff';ctx.lineWidth=3;
              ctx.beginPath();ctx.moveTo(-52,18);ctx.lineTo(-52,-8);ctx.bezierCurveTo(-52,-58,52,-58,52,-8);ctx.lineTo(52,18);ctx.closePath();
              ctx.fillStyle='rgba(40,210,240,.22)';ctx.fill();ctx.stroke();ctx.clip();ctx.shadowBlur=0;ctx.lineWidth=.9;
              for(let yy=-50;yy<20;yy+=15)for(let xx=-60;xx<65;xx+=18){ctx.beginPath();for(let k=0;k<6;k++){const an=k*Math.PI/3;ctx.lineTo(xx+(yy%30?9:0)+Math.cos(an)*10,yy+Math.sin(an)*10);}ctx.closePath();ctx.stroke();}
            }ctx.restore();
          });
          // naus
          ships.forEach(s => { if (s.dead && s.landed) return; const c = shipSprite(s.kind, s.spi, (f + (s.spi & 1)) % 2); blit(ctx, c, s.x, s.y); });
          // projectils
          shots.forEach(q => {
            for (let k = 1; k <= 4; k++) { ctx.fillStyle = rgba(k % 2 ? P[9] : P[10], 0.75 - k * 0.15); ctx.fillRect(Math.round(q.x - q.vx * k * 0.05 - 4), Math.round(q.y - 64 - k * 14), 8, 8); }
            blit(ctx, boltSprite(Math.floor(q.t * 5) % 2), q.x, q.y - 52);
          });
          // canó
          const cy = CANNON_Y + cannon.recoil * 6;
          if (st.hurt > 0) { ctx.globalAlpha = 0.55 + 0.45 * Math.cos(st.hurt * Math.PI * 2); }
          blit(ctx, cannonSprite(), cannon.x, cy); ctx.globalAlpha = 1;
          if (cannon.puff > 0) { ctx.fillStyle = rgba(P[6], cannon.puff * 0.7); const pf = (1 - cannon.puff) * 18; for (const [dx, dy] of [[-1, -1], [1, -1], [0, -2]]) ctx.fillRect(Math.round(cannon.x + dx * pf - 5), Math.round(cy - 40 + dy * pf - 5), 10, 10); }
          ctx.restore();
          // làser de llum
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          beams.forEach(b => {
            if (b.t < b.delay * 0.6) return;
            const a = clamp(1 - (b.t - b.delay) / 0.3, 0, 1), w = b.small ? 6 : 16, y0 = CANNON_Y - 40;
            const g = ctx.createLinearGradient(0, b.y, 0, y0); g.addColorStop(0, rgba(P[12], 0.9 * a)); g.addColorStop(1, rgba(P[12], 0.25 * a));
            ctx.fillStyle = g; ctx.fillRect(b.x - w, b.y, w * 2, y0 - b.y);
            ctx.fillStyle = rgba(P[7], 0.95 * a); ctx.fillRect(b.x - w * 0.3, b.y, w * 0.6, y0 - b.y);
          });
          rings.forEach(r => { const k = r.t / 0.45, rad = r.r * Ease.outCubic(k); ctx.fillStyle = rgba(r.col.startsWith("#") ? r.col : "#FFFFFF", 0.8 * (1 - k)); for (let a = 0; a < 16; a++) { const an = a / 16 * 6.283; ctx.fillRect(Math.round(r.x + Math.cos(an) * rad - 5), Math.round(r.y + Math.sin(an) * rad - 5), 10, 10); } });
          ctx.restore();
          // efecte de pantalla antiga només sobre el fons i les naus
          
          // línia de perill
          ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = P[8]; for (let x = 20; x < W - 20; x += 28) ctx.fillRect(x, LIMIT_Y + 2, 14, 4); ctx.restore();
          // plaques (planes i nítides, per sobre de tot)
          const cur = typer.current();
          ships.forEach(s => {
            if (s.dead) return;
            const lk = s === cur;
            drawPlate(ctx, s.text, s.x, plateY(s), { size: s.size, progress: s.typed, state: lk ? "active" : null, border: lk ? null : SPECIES[s.spi % SPECIES.length].a, borderW: 5, shadowBlur: 0, shadowY: 4 });
          });
          shots.forEach(q => drawPlate(ctx, q.text, q.x, q.y + 18, { size: q.size, progress: q.typed, state: q === cur ? "active" : null, border: q === cur ? null : P[10], borderW: 6, shadowBlur: 0, shadowY: 4 }));
          // rètols d'onada
          if (["banner", "cleared", "won", "over"].includes(st.phase)) {
            const k = Ease.outBack(clamp(banner.t / 0.45, 0, 1)), a = clamp(banner.t * 4, 0, 1);
            ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 400); ctx.scale(k, k);
            ctx.fillStyle = "rgba(10,13,34,0.82)"; ctx.fillRect(-380, -80, 760, banner.sub ? 170 : 120);
            ctx.fillStyle = P[12]; ctx.fillRect(-380, -80, 760, 8); ctx.fillRect(-380, (banner.sub ? 90 : 40) - 8, 760, 8);
            text(ctx, banner.text, 0, -18, { size: 60, weight: 900, font: FONT_T, color: st.phase === "over" ? P[14] : P[10], stroke: OUT, lw: 10 });
            if (banner.sub) text(ctx, banner.sub, 0, 48, { size: 30, weight: 700, color: P[7] });
            ctx.restore();
          }
        },
      };
    },
  });
})();
