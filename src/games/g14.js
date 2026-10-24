"use strict";
/* 14. Concert de tecles — escenari de nit amb neó, focus i públic de feltre; cançons pròpies sincronitzades amb el compàs */
(() => {
  // estil de música "buit": el joc toca la seva pròpia cançó (base i melodia) sincronitzada amb les plaques
  if (typeof Music !== "undefined" && Music.STYLES && !Music.STYLES.concert14) Music.STYLES.concert14 = { bpm: 60, root: 60, scale: [0], prog: [0], lead: "sine", bass: "sine", pat: "none", vol: 0 };

  const LINE_Y = 606, TOP_Y = 150;
  const LANE_COL = ["#FF3BD4", "#19E6FF", "#FFE23B", "#7CFF6B", "#B98BFF"];
  const LANES = { 3: [560, 800, 1040], 4: [500, 700, 900, 1100], 5: [440, 620, 800, 980, 1160] };
  const topX = x => 800 + (x - 800) * 0.42;

  /* ---------- cançons originals (una per nivell) ---------- */
  const SONGS = {
    1: { title: "Cançó de la lluna", bpm: 72, lanes: 3, lead: 4, early: 0.6, late: 0.5,
      mel: "64:2 67:2 69:2 67:2 65:2 64:2 62:2 60:2 64:2 67:2 69:2 72:2 71:2 69:2 67:4 65:2 69:2 67:2 64:2 62:2 64:2 62:2 59:2 64:2 67:2 69:2 67:2 65:2 64:2 62:2 60:2 60:2 64:2 67:2 72:4" },
    2: { title: "El ball del bosc", bpm: 80, lanes: 3, lead: 4, early: 0.55, late: 0.45,
      mel: "67:2 67:1 69:1 67:2 64:2 65:2 65:1 67:1 65:2 62:2 64:2 64:1 65:1 67:2 72:2 71:2 69:2 67:4 69:2 69:1 71:1 72:2 69:2 67:2 65:1 64:1 62:4 64:2 67:1 67:1 69:2 67:2 65:2 64:2 62:2 59:2 60:2 64:2 67:2 72:4" },
    3: { title: "La festa de les lletres", bpm: 88, lanes: 3, lead: 4, early: 0.5, late: 0.42,
      mel: "60:1 64:1 67:2 69:1 67:1 64:2 65:1 69:1 72:2 71:1 69:1 67:2 64:1 67:1 72:2 74:1 72:1 71:2 69:1 71:1 72:1 69:1 67:4 65:1 64:1 62:2 65:1 64:1 62:2 64:1 65:1 67:2 69:1 71:1 72:2 72:1 71:1 69:2 67:1 65:1 64:2 62:1 64:1 60:4" },
    4: { title: "La granja canta", bpm: 84, lanes: 4, lead: 5, early: 0.55, late: 0.45,
      lyr: "la:64:2 va:67:2 ca:67:2 fa:65:2 mu:64:4 la:62:2 ca:65:2 bra:65:2 fa:64:2 be:62:4 la:64:2 ga:67:2 ta:67:2 fa:69:2 miau:72:4 el:71:2 gos:69:2 fa:67:2 bub:67:4 el:64:2 gall:67:2 fa:69:2 qui:72:2 qui:72:2 ri:71:2 quic:72:4 el:69:2 porc:67:2 fa:65:2 oinc:64:4 la:64:2 va:62:2 ca:62:2 fa:59:2 mu:60:4" },
    5: { title: "Bona nit, sol", bpm: 88, lanes: 5, lead: 6, early: 0.55, late: 0.45,
      lyr: "surt:64:4 el:62:2 sol:67:6 canta:69:4 el:67:2 mar:64:6 ve:65:4 la:64:2 lluna:62:6 bona:64:4 nit:60:8 la:67:2 mona:69:4 balla:67:6 el:65:2 gos:64:4 salta:62:6 el:64:2 peix:65:4 neda:67:6 tots:69:4 som:71:4 amics:72:8" },
    6: { title: "Cançó de la il·lusió", bpm: 92, lanes: 5, lead: 6, early: 0.55, late: 0.45,
      lyr: "bon dia:64:8 família:67:8 cantem:69:6 una cançó:67:10 amb música:65:8 i il·lusió:64:10 la papallona:67:8 vola tranquil·la:69:10 el gat dorm:65:8 la lluna surt:64:8 som amics:62:8 bona nit:60:12" },
  };
  const CHORDS = { C: [0, 4, 7], F: [5, 9, 0], G: [7, 11, 2], Am: [9, 0, 4], Dm: [2, 5, 9], Em: [4, 7, 11] };
  const CROOT = { C: 48, F: 53, G: 43, Am: 45, Dm: 50, Em: 52 };
  const PREF = { C: 0.35, F: 0.25, G: 0.25, Am: 0.12, Dm: 0.05, Em: 0.02 };
  function harmonize(notes, total) { // un acord per compàs (4 temps) segons les notes de la melodia
    const bars = Math.ceil(total / 4), out = [];
    for (let b = 0; b < bars; b++) {
      const w = {}; let first = null;
      notes.forEach(n => { if (n.midi == null) return; const s = Math.max(n.beat, b * 4), e = Math.min(n.beat + n.len, b * 4 + 4); if (e > s) { const pc = n.midi % 12; w[pc] = (w[pc] || 0) + (e - s); if (first == null && n.beat >= b * 4) first = pc; } });
      let best = "C", bv = -1;
      for (const c in CHORDS) { let v = PREF[c]; CHORDS[c].forEach(pc => v += (w[pc] || 0)); if (first != null && CHORDS[c].includes(first)) v += 1.2; if (v > bv) { bv = v; best = c; } }
      out.push(best);
    }
    if (out.length) out[out.length - 1] = "C";
    return out;
  }
  const START = 4; // compte d'entrada (4 temps)
  function buildChart(L, pool) {
    const S = SONGS[L], items = [];
    let beat = START;
    if (S.mel) {
      let prev = null;
      S.mel.split(" ").forEach(tok => { const [m, b] = tok.split(":"); const len = +b; if (m !== "r") { const txt = pool.next(prev ? [prev] : []); prev = txt; items.push({ text: txt, midi: +m, beat, len }); } beat += len; });
    } else {
      S.lyr.split(" ").reduce((acc, tok) => { // les frases poden tenir espais: s'ajunten fins trobar "text:nota:temps"
        acc.buf = acc.buf ? acc.buf + " " + tok : tok; const p = acc.buf.split(":"); if (p.length === 3) { items.push({ text: p[0], midi: +p[1], beat, len: +p[2] }); beat += +p[2]; acc.buf = ""; } return acc;
      }, { buf: "" });
    }
    const total = beat;
    const chords = harmonize(items, total);
    const mids = items.map(i => i.midi), lo = Math.min(...mids), hi = Math.max(...mids), N = S.lanes;
    items.forEach((it, i) => {
      it.lane = clamp(Math.round((it.midi - lo) / Math.max(1, hi - lo) * (N - 1)), 0, N - 1);
      // notes de les lletres següents: arpegi de l'acord del compàs
      const ch = CHORDS[chords[Math.min(chords.length - 1, Math.floor(it.beat / 4))]];
      let n = it.midi; it.notes = [n];
      for (let k = 1; k < it.text.length; k++) {
        const c = it.text[k];
        if (c === " ") { it.notes.push(null); continue; }
        if (c === "·") { it.notes.push(n); continue; }
        let m = n + 1; while (!ch.includes(m % 12)) m++; if (m > 84) { m = n - 12; while (!ch.includes(((m % 12) + 12) % 12)) m++; }
        n = m; it.notes.push(n);
      }
      it.state = "pending"; it.typed = 0; it.idx = i;
    });
    return { items, chords, total, S };
  }

  /* ---------- art: escenari, focus, públic de feltre ---------- */
  function stageBg() {
    return Sprites.get("concertStage", W, H, (x) => {
      if(Art.get("concert-bg")){x.drawImage(Art.get("concert-bg"),0,0,W,H);return;}
      const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0B0820"); g.addColorStop(0.55, "#1B1240"); g.addColorStop(1, "#090616"); x.fillStyle = g; x.fillRect(0, 0, W, H);
      // pantalla LED del fons amb punts
      x.save(); rr(x, 300, 96, 1000, 420, 24); x.clip();
      const gl = x.createRadialGradient(800, 330, 40, 800, 330, 560); gl.addColorStop(0, "#3B1E7A"); gl.addColorStop(1, "#140C33"); x.fillStyle = gl; x.fillRect(300, 96, 1000, 420);
      for (let yy = 104; yy < 516; yy += 12) for (let xx = 308; xx < 1300; xx += 12) { const d = Math.hypot(xx - 800, (yy - 330) * 1.6); x.fillStyle = `rgba(255,${120 + (d % 60)},${220},${clamp(0.18 - d / 4200, 0.02, 0.18)})`; x.fillRect(xx, yy, 5, 5); }
      // lluna gran a la pantalla
      x.fillStyle = "rgba(255,226,170,0.16)"; x.beginPath(); x.arc(800, 300, 150, 0, 6.28); x.fill(); x.fillStyle = "rgba(255,226,170,0.1)"; x.beginPath(); x.arc(800, 300, 190, 0, 6.28); x.fill();
      x.restore();
      x.strokeStyle = "#2A2050"; x.lineWidth = 10; rr(x, 300, 96, 1000, 420, 24); x.stroke();
      // cortines de vellut
      for (const side of [-1, 1]) {
        for (let k = 0; k < 7; k++) {
          const x0 = side < 0 ? k * 40 - 10 : W - k * 40 - 50, cg = x.createLinearGradient(x0, 0, x0 + 50, 0);
          cg.addColorStop(0, "#3A0820"); cg.addColorStop(0.5, k % 2 ? "#7A1636" : "#8E1D40"); cg.addColorStop(1, "#3A0820");
          x.fillStyle = cg; x.beginPath(); x.moveTo(x0, 0); x.lineTo(x0 + 60, 0); x.quadraticCurveTo(x0 + 70 + side * 20, 400, x0 + 48 + side * (30 - k * 4), H); x.lineTo(x0 - 4 + side * (30 - k * 4), H); x.quadraticCurveTo(x0 + side * 20, 400, x0, 0); x.fill();
        }
      }
      // bambolina superior i estructura de focus
      const vg = x.createLinearGradient(0, 0, 0, 90); vg.addColorStop(0, "#5A0E2A"); vg.addColorStop(1, "#7E1A3C"); x.fillStyle = vg;
      x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, 70); for (let k = 16; k >= 0; k--) x.quadraticCurveTo(k * 100 + 50, 100, k * 100, 70); x.closePath(); x.fill();
      x.strokeStyle = "#8B93A8"; x.lineWidth = 4; x.beginPath(); x.moveTo(140, 88); x.lineTo(1460, 88); x.moveTo(140, 104); x.lineTo(1460, 104); x.stroke();
      x.lineWidth = 2; for (let xx = 140; xx < 1460; xx += 18) { x.beginPath(); x.moveTo(xx, 88); x.lineTo(xx + 18, 104); x.stroke(); }
      // terra de l'escenari, brillant
      const fg = x.createLinearGradient(0, 520, 0, H); fg.addColorStop(0, "#1A1030"); fg.addColorStop(0.3, "#120B24"); fg.addColorStop(1, "#05030C"); x.fillStyle = fg;
      x.beginPath(); x.moveTo(210, 540); x.lineTo(1390, 540); x.lineTo(1600, 760); x.lineTo(0, 760); x.closePath(); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.05)"; x.lineWidth = 2; for (let k = 0; k < 12; k++) { const yy = 540 + Math.pow(k / 12, 1.6) * 220; x.beginPath(); x.moveTo(210 - (yy - 540) * 0.95, yy); x.lineTo(1390 + (yy - 540) * 0.95, yy); x.stroke(); }
      x.fillStyle = "#1E1436"; x.fillRect(0, 760, W, 20); x.fillStyle = "#0A0614"; x.fillRect(0, 780, W, 120);
    });
  }
  function coneSprite(col) {
    return Tex.get("cone" + col, () => { const c = makeCanvas(130, 380), x = c.getContext("2d"), w = 130, h = 380; x.scale(0.5, 0.5); return (((x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(0.6, rgba(col, 0.16)); g.addColorStop(1, rgba(col, 0));
      x.fillStyle = g; x.beginPath(); x.moveTo(w / 2 - 14, 0); x.lineTo(w / 2 + 14, 0); x.lineTo(w, h); x.lineTo(0, h); x.closePath(); x.fill();
      const g2 = x.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, "rgba(0,0,0,0.5)"); g2.addColorStop(0.5, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,0.5)");
      x.globalCompositeOperation = "destination-out"; x.fillStyle = g2; x.fillRect(0, 0, w, h);
    })(x, 260, 760), c); });
  }
  const coneDraw = (ctx, col, x, y, rot, alpha) => { const c = coneSprite(col); ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.drawImage(c, -130, 0, 260, 760); ctx.restore(); };
  // halo lluminós prerenderitzat (evita shadowBlur a cada fotograma)
  function haloSprite(col, w, h) {
    const qw = Math.ceil(w / 16) * 16, qh = Math.ceil(h / 8) * 8;
    return Sprites.get(`halo${col}${qw}x${qh}`, qw + 80, qh + 80, (x) => { x.shadowColor = col; x.shadowBlur = 26; x.fillStyle = col; rr(x, 40, 40, qw, qh, Math.min(18, qh * 0.26)); x.fill(); x.fill(); });
  }
  function lanesSprite(N) {
    return Sprites.get("lanes" + N, W, 720, (x) => {
      LANES[N].forEach((lx, i) => {
        const col = LANE_COL[i % 5], tx = topX(lx);
        // carril translúcid
        const g = x.createLinearGradient(0, TOP_Y, 0, LINE_Y); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, 0.12));
        x.fillStyle = g; x.beginPath(); x.moveTo(tx - 34, TOP_Y - 30); x.lineTo(tx + 34, TOP_Y - 30); x.lineTo(lx + 82, LINE_Y); x.lineTo(lx - 82, LINE_Y); x.closePath(); x.fill();
        for (const s of [-1, 1]) {
          x.save(); x.shadowColor = col; x.shadowBlur = 18; x.strokeStyle = rgba(col, 0.75); x.lineWidth = 5; x.lineCap = "round";
          x.beginPath(); x.moveTo(tx + s * 34, TOP_Y - 30); x.lineTo(lx + s * 82, LINE_Y); x.stroke(); x.restore();
          x.strokeStyle = mix(col, "#FFFFFF", 0.7); x.lineWidth = 1.6; x.beginPath(); x.moveTo(tx + s * 34, TOP_Y - 30); x.lineTo(lx + s * 82, LINE_Y); x.stroke();
        }
        // diana a la línia
        x.save(); x.shadowColor = col; x.shadowBlur = 16; x.strokeStyle = col; x.lineWidth = 4; x.beginPath(); x.ellipse(lx, LINE_Y, 78, 22, 0, 0, 6.28); x.stroke(); x.restore();
      });
      // línia lluminosa
      const a = LANES[N][0] - 120, b = LANES[N][N - 1] + 120;
      x.save(); x.shadowColor = "#FFFFFF"; x.shadowBlur = 24; x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = 5; x.lineCap = "round"; x.beginPath(); x.moveTo(a, LINE_Y); x.lineTo(b, LINE_Y); x.stroke(); x.restore();
    });
  }
  const CRITTERS = ["cat", "bunny", "bear", "owl", "fox", "mouse"];
  function fanSprite(kind, col) {
    return Sprites.get("fan" + kind + col, 200, 240, (x) => {
      const path = (c) => {
        c.beginPath();
        // espatlles
        c.moveTo(10, 240); c.quadraticCurveTo(14, 150, 100, 146); c.quadraticCurveTo(186, 150, 190, 240); c.closePath();
        // cap
        c.moveTo(152, 104); c.arc(100, 104, 52, 0, 6.28);
        if (kind === "cat" || kind === "fox") { c.moveTo(56, 80); c.lineTo(58, 26); c.lineTo(92, 58); c.closePath(); c.moveTo(144, 80); c.lineTo(142, 26); c.lineTo(108, 58); c.closePath(); }
        if (kind === "bunny") { c.moveTo(84, 60); c.ellipse(78, 30, 13, 40, -0.15, 0, 6.28); c.moveTo(130, 60); c.ellipse(122, 30, 13, 40, 0.15, 0, 6.28); }
        if (kind === "bear" || kind === "mouse") { const r = kind === "mouse" ? 28 : 20; c.moveTo(70 + r, 60); c.arc(64, 62, r, 0, 6.28); c.moveTo(142 + r, 60); c.arc(136, 62, r, 0, 6.28); }
        if (kind === "owl") { c.moveTo(56, 74); c.lineTo(60, 40); c.lineTo(84, 60); c.closePath(); c.moveTo(144, 74); c.lineTo(140, 40); c.lineTo(116, 60); c.closePath(); }
      };
      Mat.felt(x, path, col, { seed: kind.length * 7 });
      // llum de contorn de l'escenari
      x.save(); path(x); x.clip(); x.globalCompositeOperation = "source-atop";
      const g = x.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, "rgba(255,170,230,0.35)"); g.addColorStop(1, "rgba(255,170,230,0)"); x.fillStyle = g; x.fillRect(0, 0, 200, 240);
      x.restore();
    });
  }
  function sfxOn() { return Settings.sfx && Audio2.ctx && Audio2.unlocked; }
  function musOn() { return Settings.music && Audio2.ctx && Audio2.unlocked; }

  Games.register({
    id: 14, key: "d", name: "Concert de tecles", zone: "muntanya", music: "concert14", ownCompare: true, kbPos: [800, 784], hints: true, captionY: 116, demoTime: 10,
    collect: { one: "disc d'or", many: "discs d'or" },
    goal: l => l <= 3 ? "Prem la lletra quan arribi a la línia de llum. Acaba la cançó amb un 80% d'encerts." : l === 4 ? "Escriu la síl·laba quan arribi a la línia: és la lletra de la cançó! Acaba-la amb un 80% d'encerts." : "Escriu les paraules de la cançó quan arribin a la línia. Acaba-la amb un 80% d'encerts.",
    thumb(ctx, x, y, w, h, t) {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.translate(x, y);
      const s = Math.max(w / 460, h / 250); ctx.translate(w / 2, h / 2); ctx.scale(s, s); ctx.translate(-230, -125);
      const SX = 380, SY = 230, K = 480 / 840, map = (wx, wy) => [-10 + (wx - SX) * K, -10 + (wy - SY) * K];
      ctx.drawImage(stageBg().c, SX * 2, SY * 2, 840 * 2, 470 * 2, -10, -10, 480, 270);
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      [["#FF3BD4", 40, -0.1], ["#19E6FF", 420, 0.1]].forEach(([c, cx, a], i) => { ctx.save(); ctx.translate(cx, -20); ctx.scale(0.5, 0.5); coneDraw(ctx, c, 0, 0, a + Math.sin(t * 0.8 + i * 2) * 0.25 + (i ? 0.35 : -0.35), 0.9); ctx.restore(); });
      ctx.drawImage(lanesSprite(3).c, SX * 2, SY * 2, 840 * 2, 470 * 2, -10, -10, 480, 270);
      ctx.restore();
      const p = (t * 0.4) % 1, wy = 300 + 220 * p, lx = lerp(topX(560), 560, (wy - TOP_Y) / (LINE_Y - TOP_Y)), [ax, ay] = map(lx, wy), [dx, dy] = map(800, LINE_Y);
      drawPlate(ctx, "a", ax, ay, { size: 44, border: LANE_COL[0], borderW: 4, shadowBlur: 0, alpha: clamp(p * 5, 0, 1) });
      const hs = haloSprite(LANE_COL[1], 80, 76); ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(hs.c, dx - hs.w / 2, dy - 30 - hs.h / 2, hs.w, hs.h); ctx.restore();
      drawPlate(ctx, "d", dx, dy - 30, { size: 58, border: LANE_COL[1], borderW: 4, shadow: false });
      ["bear", "cat", "bunny", "owl", "fox", "mouse"].forEach((k, i) => Sprites.draw(ctx, fanSprite(k, "#2C1F4A"), -10 + i * 92, 268 - Math.abs(Math.sin(t * 3 + i)) * 8, { s: 0.4, ay: 1 }));
      ctx.restore();
    },
    create(api) {
      const L = api.level, pool = api.pool({});
      const { items, chords, total, S } = buildChart(L, pool);
      const N = S.lanes, lanesX = LANES[N];
      const st = { bt: 0, ct: 0, off: 0, hold: false, rel: null, step: 0, phase: "play", endT: 0, hits: 0, judged: 0, energy: 0.55, sour: 0 };
      const pulses = new Array(N).fill(0), wrongs = [], notesFx = [], cmp = [];
      const fans = []; { const R = mulberry32(14 + L); for (let i = 0; i < 15; i++) fans.push({ kind: CRITTERS[Math.floor(R() * CRITTERS.length)], x: 40 + i * 108 + (R() - 0.5) * 30, s: 0.78 + R() * 0.3, ph: R() * 6.28, col: ["#2C1F4A", "#3A2450", "#24203F", "#3B1F3A"][Math.floor(R() * 4)], stick: R() < 0.45 ? LANE_COL[Math.floor(R() * 5)] : null }); fans.sort((a, b) => a.s - b.s); }
      api.hud.progress = [0, items.length];
      const bpm = () => S.bpm * (0.86 + 0.14 * api.speed), spb = () => 60 / bpm();
      const chordAt = b => chords[clamp(Math.floor(b / 4), 0, chords.length - 1)];
      function laneOf(it) { return lanesX[it.lane]; }
      function playMel(m, at) { if (m == null || !sfxOn()) return; tone({ f: NOTE(m), d: 0.55, type: "triangle", v: 0.2, verb: true, at }); tone({ f: NOTE(m + 12), d: 0.32, type: "sine", v: 0.06, at }); tone({ f: NOTE(m), d: 0.12, type: "square", v: 0.025, lp: 2400, at }); }
      function playSour(m, soft) { if (!sfxOn()) return; const f = NOTE(m || 64); tone({ f: f * 1.06, d: 0.35, type: "sawtooth", v: soft ? 0.04 : 0.07, lp: 1100 }); tone({ f: f * 0.955, d: 0.35, type: "sawtooth", v: soft ? 0.04 : 0.07, lp: 1100 }); }
      // base rítmica i acords (programades amb antelació, en corxeres)
      function schedStep(step, at) {
        if (!musOn()) return;
        const bus = Audio2.musBus, beatPos = step / 2, inBar = step % 8, ch = chordAt(st.ct + (beatPos - st.bt)), root = CROOT[ch], pcs = CHORDS[ch];
        const intro = beatPos < START, ended = st.ct > total + 1;
        if (ended) return;
        if (intro) { if (step % 2 === 0) noise({ at, f: 2600, q: 3, d: 0.05, v: 0.5, bus }); return; }
        if (inBar === 0 || inBar === 4) tone({ at, f: 120, f2: 45, d: 0.16, v: 0.55, bus });
        if (inBar === 2 || inBar === 6) noise({ at, f: 1700, d: 0.1, v: 0.32, bus });
        noise({ at, f: 8000, ft: "highpass", d: 0.03, v: step % 2 ? 0.16 : 0.08, bus });
        if (inBar === 0 || inBar === 5) tone({ at, f: NOTE(root), d: spb() * 1.4, type: "triangle", v: 0.5, lp: 500, bus });
        if (inBar === 3) tone({ at, f: NOTE(root + 7), d: spb() * 0.8, type: "triangle", v: 0.38, lp: 500, bus });
        if (inBar === 2 || inBar === 6) pcs.forEach(pc => tone({ at, f: NOTE(60 + pc), d: spb() * 0.7, type: "triangle", v: 0.09, lp: 1800, bus }));
      }
      function finishItem(it) {
        it.state = "hit"; it.doneT = 0; st.hits++; st.judged++; pulses[it.lane] = 1;
        st.energy = clamp(st.energy + 0.12, 0, 1);
        const x = laneOf(it); api.particles.emit(x, LINE_Y - 10, { count: 14, color: [LANE_COL[it.lane % 5], "#FFFFFF"], shape: "spark", glow: true, size: 7, speed: 300, gravity: 200, life: 0.6, angle: -Math.PI / 2, spread: 1.2 });
        notesFx.push({ x: x + rand(-40, 40), y: LINE_Y - 60, t: 0, col: LANE_COL[it.lane % 5], k: randi(0, 1) });
        progress();
      }
      function progress() { api.hud.progress = [st.judged, items.length]; if (st.judged) api.hud.label = `${Math.round(st.hits / st.judged * 100)}% d'encerts`; }
      function showCmp(it, k) { if (!Settings.errorSupport) return; cmp.length = 0; cmp.push({ e: it.text[it.typed] || it.text[0], p: k, lane: it.lane, t: 0 }); }
      function missKey(it, k) {
        api.miss(it.text[it.typed], k, { sfx: false }); playSour(it.notes[Math.max(0, it.typed - 1)] || it.midi);
        wrongs.push({ lane: it.lane, t: 0 }); st.energy = clamp(st.energy - 0.12, 0, 1); showCmp(it, k);
      }
      function pass(it) {
        it.state = "miss"; st.judged++; wrongs.push({ lane: it.lane, t: 0 }); st.energy = clamp(st.energy - 0.2, 0, 1);
        playSour(it.midi, true); progress();
        if (!api.demo) { api.miss(it.text[0], null, { sfx: false }); showCmp(it, null); }
      }
      const live = () => items.filter(i => i.state === "pending" || i.state === "active");
      function autoPlay(it) { // la demostració toca sola
        const t0 = Audio2.now();
        it.notes.forEach((m, k) => playMel(m, t0 + k * 0.14));
        it.typed = it.text.length; api.hit({ sfx: false }); finishItem(it);
      }
      return {
        expected() {
          if (api.demo || st.phase !== "play") return null;
          const act = items.find(i => i.state === "active"); if (act) return act.text[act.typed];
          const nx = items.find(i => i.state === "pending"); return nx && nx.beat - st.ct < S.lead ? nx.text[0] : null;
        },
        onKey(k) {
          if (st.phase !== "play" || k.length !== 1) return;
          const act = items.find(i => i.state === "active");
          if (act) {
            if (k === act.text[act.typed]) { playMel(act.notes[act.typed]); if (act.notes[act.typed] == null && sfxOn()) noise({ f: 6000, d: 0.08, v: 0.2 }); act.typed++; api.hit({ sfx: false }); if (act.typed >= act.text.length) finishItem(act); }
            else missKey(act, k);
            return;
          }
          const inWin = items.filter(i => i.state === "pending" && i.beat - st.ct < S.lead && st.ct - i.beat <= S.late);
          const m = inWin.find(i => i.text[0] === k);
          if (m) {
            const ahead = Math.max(0, m.beat - st.ct) * spb();
            playMel(m.notes[0], Audio2.now() + ahead); m.typed = 1; api.hit({ sfx: false }); pulses[m.lane] = 0.6;
            if (m.text.length === 1) finishItem(m); else m.state = "active";
            return;
          }
          if (inWin.length) { missKey(inWin[0], k); return; }
          const nx = items.find(i => i.state === "pending" && i.beat - st.ct <= 2);
          if (nx && nx.text[0] !== k) missKey(nx, k);
          // Les notes accepten respostes des del primer fotograma visible.
        },
        update(dt) {
          const db = dt * bpm() / 60;
          st.bt += db;
          const act = items.find(i => i.state === "active");
          if (act && st.ct + db >= act.beat) { st.ct = Math.max(st.ct, act.beat); st.hold = true; st.rel = null; }
          else if (st.hold) { // es reprèn alineat amb la base (cada 2 temps)
            if (st.rel == null) st.rel = st.off + Math.ceil((st.bt - st.ct - st.off) / 2 - 1e-6) * 2;
            if (st.bt - st.ct >= st.rel) { st.off = st.rel; st.ct = st.bt - st.off; st.hold = false; st.rel = null; }
          } else st.ct += db;
          // programar la base
          while (st.step / 2 <= st.bt + 0.35) { schedStep(st.step, Audio2.now() + Math.max(0, (st.step / 2 - st.bt)) * spb()); st.step++; }
          if (st.phase === "play") {
            for (const it of items) {
              if (it.state !== "pending") continue;
              if (api.demo && st.ct >= it.beat) autoPlay(it);
              else if (st.ct - it.beat > S.late) pass(it);
            }
            if (!live().length && st.ct > items[items.length - 1].beat + 2) {
              st.phase = "end"; st.endT = 0; const ok = st.hits / items.length >= 0.8;
              if (ok) { Sfx.play("crowd"); void 0; st.energy = 1; } else void 0;
              st.ok = ok;
            }
          } else { st.endT += dt; if (st.endT > 2.2 && !st.fin) { st.fin = true; api.finish(st.ok, { collectName: `el disc d'or «${S.title}»` }); } }
          for (let i = 0; i < N; i++) pulses[i] = Math.max(0, pulses[i] - dt * 2.5);
          for (let i = wrongs.length - 1; i >= 0; i--) { wrongs[i].t += dt; if (wrongs[i].t > 0.5) wrongs.splice(i, 1); }
          for (let i = notesFx.length - 1; i >= 0; i--) { const n = notesFx[i]; n.t += dt; n.y -= dt * 90; if (n.t > 1.4) notesFx.splice(i, 1); }
          for (let i = cmp.length - 1; i >= 0; i--) { cmp[i].t += dt; if (cmp[i].t > 1.8) cmp.splice(i, 1); }
          items.forEach(it => { if (it.doneT != null) it.doneT += dt; });
          st.energy += (0.5 - st.energy) * dt * 0.05;
        },
        draw(ctx) {
          const t = api.t, beatPh = st.bt % 1, bounce = Math.pow(1 - beatPh, 3);
          Sprites.draw(ctx, Sprites.get("stageLanes" + N, W, H, (x) => { x.drawImage(stageBg().c, 0, 0, W, H); x.drawImage(lanesSprite(N).c, 0, 0, W, 720); }), W / 2, H / 2);
          // focus que escombren l'escenari
          ctx.save(); ctx.globalCompositeOperation = "lighter";
          [["#FF3BD4", 330, 0.42], ["#19E6FF", 620, 0.12], ["#FFE23B", 980, -0.12], ["#B98BFF", 1270, -0.42]].forEach(([c, x, a], i) => {
            coneDraw(ctx, c, x, 96, a + (Settings.reduceMotion ? 0 : Math.sin(st.bt * Math.PI / 4 + i * 1.7) * 0.12), 0.15 + 0.12 * st.energy);
          });
          ctx.restore();
          [330, 620, 980, 1270].forEach((x, i) => { ctx.fillStyle = "#2A2F3D"; rr(ctx, x - 22, 84, 44, 30, 8); ctx.fill(); ctx.fillStyle = LANE_COL[[0, 1, 2, 4][i]]; ctx.beginPath(); ctx.ellipse(x, 114, 16, 6, 0, 0, 6.28); ctx.fill(); });
          ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.lineCap = "round";
          lanesX.forEach((lx, i) => {
            const col = LANE_COL[i % 5], p = pulses[i] + bounce * 0.12;
            if (p > 0.02) { const g = ctx.createLinearGradient(0, TOP_Y, 0, LINE_Y + 20); g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, 0.45 * p)); ctx.fillStyle = g; const tx = topX(lx); ctx.beginPath(); ctx.moveTo(tx - 34, TOP_Y - 30); ctx.lineTo(tx + 34, TOP_Y - 30); ctx.lineTo(lx + 82, LINE_Y); ctx.lineTo(lx - 82, LINE_Y); ctx.closePath(); ctx.fill(); ctx.strokeStyle = rgba(col, 0.6 * p); ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(lx, LINE_Y, 78 + p * 14, 22 + p * 4, 0, 0, 6.28); ctx.stroke(); }
          });
          wrongs.forEach(w => { const a = 1 - w.t / 0.5, lx = lanesX[w.lane]; ctx.fillStyle = rgba("#FF4A3D", 0.35 * a); ctx.beginPath(); ctx.ellipse(lx, LINE_Y, 90, 26, 0, 0, 6.28); ctx.fill(); });
          ctx.restore();
          // notes musicals que pugen
          notesFx.forEach(n => { const a = clamp(1.4 - n.t, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = n.col; ctx.translate(n.x + Math.sin(n.t * 5) * 10, n.y); ctx.beginPath(); ctx.ellipse(0, 0, 11, 8, -0.4, 0, 6.28); ctx.fill(); ctx.fillRect(8, -34, 4, 34); if (n.k) ctx.fillRect(8, -34, 18, 6); ctx.restore(); });
          // públic de feltre en silueta
          const e = st.energy, sit = clamp((0.32 - e) / 0.32, 0, 1);
          (Art.get("concert-bg") ? [] : fans).forEach((f, i) => {
            const dance = e > 0.35 ? Math.abs(Math.sin(st.bt * Math.PI + f.ph)) * 16 * e : 0, y = H + 34 + sit * 46 - dance + f.s * 6;
            Sprites.draw(ctx, fanSprite(f.kind, f.col), f.x, y, { s: f.s, ay: 1 });
            if (f.stick && e > 0.6) { const a = Math.sin(st.bt * Math.PI / 2 + f.ph) * 0.35 + 0.2, bx = f.x + 62 * f.s, by = y - 70 * f.s; ctx.save(); ctx.lineCap = "round"; ctx.strokeStyle = "#2C1F4A"; ctx.lineWidth = 14 * f.s; ctx.beginPath(); ctx.moveTo(bx - 6, by + 30); ctx.lineTo(bx, by); ctx.stroke(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = rgba(f.stick, 0.35); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.sin(a) * 70, by - Math.cos(a) * 70); ctx.stroke(); ctx.strokeStyle = mix(f.stick, "#FFFFFF", 0.5); ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
          });
          // plaques que baixen pels carrils (vora lluminosa, interior llis)
          const vis = items.filter(it => (it.state === "pending" || it.state === "active") && it.beat - st.ct <= S.lead + 0.3 || (it.state === "miss" && st.ct - it.beat < 1.6) || (it.state === "hit" && it.doneT < 0.5));
          vis.sort((a, b) => b.beat - a.beat);
          const base = L <= 3 ? 64 : L === 4 ? 52 : 44, extra = L <= 3 ? 14 : 10;
          vis.forEach(it => {
            const lx = lanesX[it.lane], col = LANE_COL[it.lane % 5];
            let p = 1 - (it.beat - st.ct) / S.lead; if (it.state === "active") p = Math.min(p, 1);
            let alpha = clamp(p * 4, 0, 1), y, x;
            const pe = p < 1 ? p * 0.62 + p * p * 0.38 : p;
            if (it.state === "hit") { y = LINE_Y - Ease.outCubic(it.doneT / 0.5) * 60; x = lx; alpha = 1 - it.doneT / 0.5; }
            else { y = lerp(TOP_Y, LINE_Y, pe); x = lerp(topX(lx), lx, Math.min(1, pe)); if (it.state === "miss") alpha = clamp(1 - (st.ct - it.beat) / 1.6, 0, 1) * 0.6; }
            const size = Math.round(base + extra * clamp(pe, 0, 1));
            if (it.state !== "miss") { const ps = plateSize(ctx, it.text, size), hs = haloSprite(col, ps.w, ps.h); ctx.save(); ctx.globalAlpha = alpha * (it.state === "active" ? 1 : 0.8); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(hs.c, x - hs.w / 2, y - hs.h / 2, hs.w, hs.h); ctx.restore(); }
            drawPlate(ctx, it.text, x, y, { size, alpha, progress: it.typed, state: it.state === "active" ? "active" : it.state === "hit" ? "ok" : it.state === "miss" ? "wrong" : null, border: it.state === "pending" ? col : null, borderW: 5, shadow: false });
          });
          // comparació al costat del carril
          cmp.forEach(c => {
            const a = c.t < 0.2 ? c.t / 0.2 : c.t > 1.4 ? 1 - (c.t - 1.4) / 0.4 : 1, left = lanesX[c.lane] < 800, bx = left ? 190 : W - 190, by = 470;
            ctx.save(); ctx.globalAlpha = clamp(a, 0, 1);
            const two = c.p != null, bw = two ? 330 : 240;
            rr(ctx, bx - bw / 2, by - 105, bw, 210, 26); ctx.fillStyle = "rgba(255,255,255,0.94)"; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = LANE_COL[c.lane % 5]; ctx.stroke();
            const big = c.e.length > 1 || (c.p && c.p.length > 1) ? 44 : 64;
            if (two) {
              text(ctx, "Busques", bx - 78, by - 76, { size: 22, weight: 800, font: FONT_T, color: BRAND.petroli }); text(ctx, "Has premut", bx + 78, by - 76, { size: 22, weight: 800, font: FONT_T, color: UI.coralDark });
              drawPlate(ctx, c.e === " " ? "espai" : c.e, bx - 78, by + 12, { size: big, state: "ok" }); drawPlate(ctx, c.p === " " ? "espai" : c.p, bx + 78, by + 12, { size: big, state: "wrong" });
              text(ctx, "≠", bx, by + 12, { size: 44, weight: 800, font: FONT_T, color: BRAND.tinta });
            } else { text(ctx, "Calia prémer", bx, by - 76, { size: 22, weight: 800, font: FONT_T, color: BRAND.petroli }); drawPlate(ctx, c.e === " " ? "espai" : c.e, bx, by + 12, { size: 64, state: "ok" }); }
            ctx.restore();
          });
          // compte d'entrada
          if (st.bt < START + 0.5 && st.phase === "play") { for (let i = 0; i < 4; i++) { const on = st.bt >= i, k = on ? Math.pow(1 - clamp(st.bt - i, 0, 1), 2) : 0; ctx.fillStyle = on ? rgba(LANE_COL[i], 0.5 + 0.5 * k) : "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.arc(W / 2 - 75 + i * 50, LINE_Y + 52, 12 + k * 6, 0, 6.28); ctx.fill(); } }
          if (st.phase === "end") {
            const k = Ease.outBack(clamp(st.endT / 0.5, 0, 1));
            ctx.save(); ctx.translate(W / 2, 330); ctx.scale(k, k);
            text(ctx, st.ok ? "Bravo! Quin concert!" : "Gairebé! Tornem-hi?", 0, 0, { size: 70, weight: 900, font: FONT_T, color: st.ok ? "#FFE23B" : "#FFFFFF", stroke: "#2A1650", lw: 14 });
            text(ctx, `${Math.round(st.hits / items.length * 100)}% de notes encertades`, 0, 76, { size: 34, weight: 800, font: FONT_T, color: "#FFFFFF", stroke: "#2A1650", lw: 8 });
            ctx.restore();
          }
          drawVignette(ctx, 0.35, "5,0,20");
        },
      };
    },
  });
})();
