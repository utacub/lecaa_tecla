"use strict";
/* ============================================================
   Marc comú dels minijocs: registre, escriptura de objectius,
   seqüència (iris → demo → 3-2-1 → joc → final), pausa, errors,
   ajudes, velocitat adaptativa i estrelles.
   ============================================================ */
const Games = {
  list: [], byId: {},
  register(def) {
    // nom, consigna i premis de cada joc s'escriuen en català i es tradueixen aquí
    const c = def.collect || { one: "premi", many: "premis" }, goal = def.goal;
    def.name = L_(def.name); def.collect = { one: L_(c.one), many: L_(c.many) }; if (goal) def.goal = l => L_(goal(l));
    this.list.push(def); this.byId[def.id] = def;
  },
  sorted() { return this.list.slice().sort((a, b) => a.id - b.id); },
};

/* Escriptura amb objectius: la primera tecla tria l'objectiu i la resta l'ha de completar. */
class Typer {
  constructor(api, o) { this.api = api; this.o = o; this.lock = null; }
  live() { return this.o.targets().filter(t => t && !t.dead && !t.done && t.text); }
  best(list) { const r = this.o.rank || (() => 0); let b = null, bv = Infinity; for (const t of list) { const v = r(t); if (v < bv) { bv = v; b = t; } } return b; }
  expected() {
    const T = this.live(); if (this.lock && T.includes(this.lock)) return this.lock.text[this.lock.typed || 0];
    const b = this.best(T); return b ? b.text[0] : null;
  }
  current() { return this.lock && this.live().includes(this.lock) ? this.lock : null; }
  release() { if (this.lock) { this.lock.typed = 0; this.lock.locked = false; } this.lock = null; }
  key(k) {
    if (k === "Backspace") { this.release(); return true; }
    if (k.length !== 1) return false;
    const T = this.live();
    if (!T.length) { this.lock = null; return false; } // cap objectiu: cap error
    if (this.lock && !T.includes(this.lock)) this.lock = null;
    if (this.lock) {
      const t = this.lock, ch = t.text[t.typed];
      if (k === ch) { t.typed++; this.api.hit(); this.o.onStep && this.o.onStep(t, k); if (t.typed >= t.text.length) { t.done = true; this.lock = null; t.locked = false; this.o.onDone(t); } return true; }
      this.api.miss(ch, k, { target: t }); this.o.onMiss && this.o.onMiss(t, k); return false;
    }
    let cands = T.filter(t => t.text[0] === k);
    if (this.o.only) cands = cands.filter(this.o.only);
    if (cands.length) {
      const t = this.best(cands); t.typed = 1; this.api.hit();
      this.o.onStep && this.o.onStep(t, k);
      if (t.text.length === 1) { t.done = true; this.o.onDone(t); }
      else { this.lock = t; t.locked = true; this.o.onLock && this.o.onLock(t); }
      return true;
    }
    const b = this.best(T); this.api.miss(b ? b.text[0] : null, k, { target: b }); this.o.onMiss && this.o.onMiss(b, k);
    return false;
  }
}

/* explicació del minijoc: sempre, només el primer cop de cada jugador, o mai (opció de la rodeta de l'illa) */
function introWanted(def, profile) {
  const m = Settings.intro || "sempre"; if (m === "mai") return false;
  const key = "introSeen." + (profile ? profile.id : "x"), seen = Store.get(key) || {};
  if (m === "primer" && seen[def.id]) return false;
  seen[def.id] = 1; Store.set(key, seen); return true;
}
/* ---------- l'escena que embolcalla cada joc ---------- */
class GameScene {
  constructor(def, level, profile, o = {}) {
    this.def = def; this.level = clamp(parseInt(level, 10) || 1, 1, 6); this.profile = profile; this.o = o;
    this.state = o.skipDemo || !introWanted(def, profile) ? "count" : "intro"; this.st = 0; this.particles = new Particles();
    this.make(this.state === "intro");
    if (this.state === "count") this.countdown = 0;
    this.pauseSel = 0;
  }
  make(demo) {
    const sc = this;
    const api = this.api = {
      level: this.level, demo, def: this.def, profile: this.profile,
      hits: 0, misses: 0, speed: tuneOf(this.profile).speed, t: 0, freeze: 0, idle: 0, lastExp: null, win: [],
      hud: { progress: null, timer: null, lives: null, score: null, label: null },
      errs: [],
      pool(o) { return new Pool(sc.level, o); },
      typer(o) { return new Typer(api, o); },
      hit(o = {}) {
        api.hits++; api.idle = 0; api.win.push(1); api.adapt();
        if (o.sfx !== false) Sfx.play(o.sfx || "hit");
      },
      miss(expected, pressed, o = {}) {
        api.misses++; api.idle = 0; api.win.push(0); api.adapt();
        if (!demo && Settings.errorSupport) { api.freeze = 0.5; sc.halt = true; sc.haltT = 0; }
        if (Settings.errorSupport) sc.showMiss(expected, pressed, o);
        if (o.sfx !== false) Sfx.play(o.sfx || "miss");
        if (expected && pressed && !demo) api.errs.push([expected, pressed]);
      },
      adapt() {
        while (api.win.length > 10) api.win.shift();
        if (api.win.length >= 8 && (api.hits + api.misses) % 4 === 0) {
          const acc = api.win.reduce((a, b) => a + b, 0) / api.win.length;
          if (acc > 0.9) api.speed = Math.min(1.5, api.speed * 1.07);
          else if (acc < 0.7) api.speed = Math.max(0.6, api.speed * 0.9);
        }
      },
      say(txt, o) { if (!demo || o && o.demo) Voice.say(txt, o); },
      sayItem(item, tpl) { if (!demo) return Voice.sayItem(item, { template: tpl || "{x}" }); },
      finish(success = true, extra = {}) { if (extra.collectName) extra = { ...extra, collectName: L_(extra.collectName) }; if (demo) { sc.demoDone = true; return; } sc.finish(success, extra); },
      clearCaption() { Voice.capT = 0; },
      shake(a = 8) { sc.shakeA = Math.max(sc.shakeA || 0, a); },
      particles: this.particles,
      // per marcar a la cara de la pantalla on cal llegir l'error
      missAt: null,
    };
    this.g = this.def.create(api);
  }
  enter() {
    Music.play(this.def.music || "menu");
    if (this.state === "intro") { Voice.say(this.def.goal(this.level)); } // només la consigna, sense el nom del joc
  }
  exit() { Voice.stop(); }
  showMiss(expected, pressed, o) {
    this.missFx = { e: expected, p: pressed, t: 0, at: o.at || (typeof this.def.missAt === "function" ? this.def.missAt(this) : this.def.missAt) || null };
    this.kbShow = 2.4; this.kbMarks = {};
    keysFor(expected).forEach(k => this.kbMarks[k] = "expected");
    keysFor(pressed).forEach(k => { if (!this.kbMarks[k]) this.kbMarks[k] = "wrong"; });
  }
  finish(success, extra) {
    if (this.state === "end") return;
    const a = this.api, tot = a.hits + a.misses, acc = tot ? a.hits / tot : 1;
    const stars = success ? (acc >= 0.95 ? 3 : acc >= 0.8 ? 2 : 1) : 0;
    this.result = { success, acc, stars, prev: 0, extra, t: 0, collect: success && !extra.noCollect };
    if (this.profile && !this.o.preview) {
      const p = this.profile, key = this.def.id;
      p.stars = p.stars || {}; p.stars[key] = p.stars[key] || {};
      this.result.prev = p.stars[key][this.level] || 0;
      p.stars[key][this.level] = Math.max(this.result.prev, stars);
      if (this.result.collect) { p.collect = p.collect || {}; p.collect[key] = (p.collect[key] || 0) + 1; }
      p.conf = p.conf || {}; for (const [e, q] of a.errs) { const k = e + "→" + q; p.conf[k] = (p.conf[k] || 0) + 1; }
      p.log = p.log || []; p.log.push({ g: key, l: this.level, acc: Math.round(acc * 100), s: stars, d: Date.now() }); if (p.log.length > 400) p.log.shift();
      Profiles.save();
    }
    this.state = "end"; this.st = 0; this.endSel = 0;
    setTimeout(() => { if (success) Sfx.play("win"); }, 250);
  }
  startPlay() { this.halt = false; this.make(false); this.state = "count"; this.countdown = 0; this.st = 0; this.missFx = null; this.kbShow = 0; this.particles.p.length = 0; Voice.stop(); }
  update(dt) {
    this.st += dt;
    if (this.state === "pause") return;
    if (this.halt && this.state === "play") { // error: tot congelat, només avança l'aparició de la comparació
      if (this.missFx) this.missFx.t = Math.min(1, this.missFx.t + dt); this.haltT = (this.haltT || 0) + dt;
      // els jocs amb comparació pròpia la dibuixen animada: se'ls deixa mig segon perquè aparegui
      if (this.def.ownCompare && this.haltT < 0.6) this.g.update(dt);
      return;
    }
    this.particles.update(dt);
    if (this.state === "end") { this.result.t += dt; if (this.g.update && this.def.updateAtEnd) this.g.update(dt * 0.5); return; }
    const a = this.api;
    if (this.missFx) { this.missFx.t += dt; if (this.missFx.t > 1.9) this.missFx = null; }
    if (this.kbShow > 0) this.kbShow -= dt;
    if (this.shakeA) this.shakeA = Math.max(0, this.shakeA - dt * 30);
    if (this.state === "count") {
      this.countdown += dt;
      const n = Math.floor(this.countdown / 0.75);
      if (n !== this.lastCount) { this.lastCount = n; if (n < 3) Sfx.play("count"); else if (n === 3) { Sfx.play("go"); if (this.g.start) this.g.start(); } }
      if (this.countdown > 3.3) this.state = "play";
      if (this.countdown < 2.25) return; // la partida comença amb el "Som-hi!"
    }
    if (this.state === "intro") {
      // demostració: el joc es juga sol amb les tecles bones
      this.demoT = (this.demoT || 0) + dt;
      if (this.st > 1.2 && this.demoT > 1.05) {
        this.demoT = 0; const k = this.g.expected && this.g.expected();
        if (k) { this.demoKey = { k, t: 0 }; this.g.onKey && this.g.onKey(k); }
      }
      if (this.demoKey) this.demoKey.t += dt;
      if (this.st > (this.def.demoTime || 9) || this.demoDone) this.startPlay();
    }
    if (a.freeze > 0) { a.freeze -= dt; return; }
    a.t += dt; a.idle += dt;
    const ex = this.g.expected ? this.g.expected() : null;
    if (ex !== a.lastExp) { a.lastExp = ex; a.idle = 0; }
    this.g.update(dt);
  }
  draw(ctx) {
    ctx.save();
    if (this.shakeA && !Settings.reduceMotion) ctx.translate(rand(-1, 1) * this.shakeA, rand(-1, 1) * this.shakeA);
    this.g.draw(ctx);
    this.particles.draw(ctx);
    ctx.restore();
    if (this.def.hud !== false) this.drawHUD(ctx);
    else if (this.g.drawHUD) this.g.drawHUD(ctx);
    this.drawHelp(ctx);
    const cap = Voice.capT > 0 ? Voice.caption : ""; if (Voice.capT > 0) Voice.capT -= 1 / 60;
    if (cap && this.state !== "end") drawCaption(ctx, cap, W / 2, this.def.captionY || 122, clamp(Voice.capT * 2, 0, 1));
    if (this.state === "intro") this.drawIntro(ctx);
    if (this.state === "count") this.drawCount(ctx);
    if (this.state === "pause") this.drawPause(ctx);
    if (this.state === "end") this.drawEnd(ctx);
  }
  drawHUD(ctx) {
    const h = this.api.hud;
    let x = 24;
    x += drawChip(ctx, x, 22, L_("❚❚  Pausa"), { fs: 20, h: 42, fill: "rgba(32,62,66,0.7)", click: this.state === "play" ? () => this.onKey("Escape") : null }) + 10;
    x += drawChip(ctx, x, 22, this.def.name, { fs: 22, h: 42, fill: "rgba(23,103,107,0.92)" }) + 10;
    drawChip(ctx, x, 22, L_("Nivell {n}", { n: this.level }), { fs: 20, h: 42, fill: "rgba(255,255,255,0.92)", color: BRAND.tinta });
    let rx = W - 24;
    if (h.progress) {
      const [v, m] = h.progress, bw = 260;
      ctx.save(); rr(ctx, rx - bw - 120, 22, bw + 120, 42, 21); ctx.fillStyle = "rgba(32,62,66,0.82)"; ctx.fill();
      rr(ctx, rx - bw - 14, 34, bw, 18, 9); ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fill();
      const k = clamp(v / m, 0, 1); if (k > 0) { rr(ctx, rx - bw - 14, 34, Math.max(18, bw * k), 18, 9); ctx.fillStyle = "#7FE0B8"; ctx.fill(); }
      text(ctx, `${Math.min(v, m)} / ${m}`, rx - bw - 70, 44, { size: 22, weight: 800, font: FONT_T, color: "#fff" });
      ctx.restore(); rx -= bw + 130;
    }
    if (h.timer != null) { const s = Math.max(0, Math.ceil(h.timer)); rx -= drawChip(ctx, rx, 22, `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`, { fs: 24, h: 42, align: "right", fill: s <= 10 ? "rgba(224,85,58,0.92)" : "rgba(32,62,66,0.82)" }) + 10; }
    if (h.lives) { const [n, m] = h.lives; for (let i = m - 1; i >= 0; i--) { drawHeart(ctx, rx - 20, 44, 34, i < n); rx -= 42; } rx -= 6; }
    if (h.score != null) rx -= drawChip(ctx, rx, 22, String(h.score), { fs: 24, h: 42, align: "right" }) + 10;
    if (h.label) rx -= drawChip(ctx, rx, 22, h.label, { fs: 22, h: 42, align: "right" }) + 10;
  }
  /* comparació d'error + teclat en pantalla + pista */
  drawHelp(ctx) {
    if (this.state !== "play" && this.state !== "intro") return;
    const a = this.api, lvl = this.level, ex = a.lastExp;
    let marks = null, hintRow = null, alpha = 0;
    if (this.kbShow > 0) { marks = this.kbMarks; alpha = clamp(this.kbShow * 2, 0, 1); }
    else if (Settings.hints && ex && a.idle > tuneOf(this.profile).hint && lvl <= 4 && this.def.hints !== false) {
      alpha = clamp((a.idle - tuneOf(this.profile).hint) * 3, 0, 1);
      const ks = keysFor(ex);
      if (lvl <= 2) { marks = {}; ks.forEach(k => marks[k] = "hint"); }
      else { const p = KB_POS[ks[ks.length - 1]]; hintRow = p ? p.row : null; marks = {}; }
    }
    if (alpha > 0 && this.def.keyboard !== false) {
      const [kx, ky] = this.def.kbPos || [W / 2, H - 132];
      const slide = (1 - Ease.outCubic(alpha)) * 60;
      Kb.draw(ctx, kx, ky + slide, 46, { marks, hintRow, alpha });
    }
    const m = this.missFx;
    if (this.halt && this.state === "play") this.drawHalt(ctx);
    if (m && m.e && !this.def.ownCompare) {
      const k = m.t < 0.25 ? Ease.outBack(m.t / 0.25) : m.t > 1.5 ? 1 - (m.t - 1.5) / 0.4 : 1;
      const [mx, my] = m.at || [W / 2, (this.def.kbPos ? this.def.kbPos[1] : H - 132) - 230];
      ctx.save(); ctx.globalAlpha = clamp(k, 0, 1);
      const lab = v => v === " " ? L_("espai") : v === "Enter" ? L_("Retorn") : v;
      if (m.p == null) { // no s'ha premut res a temps: només la tecla que calia
        ctx.save(); rr(ctx, mx - 170, my - 98, 340, 196, 30); ctx.fillStyle = "rgba(255,255,255,0.93)"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; ctx.fill(); ctx.restore();
        text(ctx, L_("Calia prémer"), mx, my - 70, { size: 22, weight: 800, font: FONT_T, color: BRAND.petroli });
        drawPlate(ctx, lab(m.e), mx, my + 18, { size: m.e.length > 1 ? 48 : 72, state: "ok" });
      } else {
        const sep = 120 * clamp(k, 0, 1.2);
        ctx.save(); rr(ctx, mx - 300, my - 98, 600, 196, 30); ctx.fillStyle = "rgba(255,255,255,0.93)"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 6; ctx.fill(); ctx.restore();
        text(ctx, L_("Busques"), mx - sep, my - 70, { size: 22, weight: 800, font: FONT_T, color: BRAND.petroli });
        text(ctx, L_("Has premut"), mx + sep, my - 70, { size: 22, weight: 800, font: FONT_T, color: UI.coralDark });
        drawPlate(ctx, lab(m.e), mx - sep, my + 18, { size: m.e.length > 1 ? 48 : 72, state: "ok" });
        drawPlate(ctx, lab(m.p), mx + sep, my + 18, { size: String(m.p).length > 1 ? 48 : 72, state: "wrong" });
        text(ctx, "≠", mx, my + 18, { size: 54, weight: 800, font: FONT_T, color: BRAND.tinta });
      }
      ctx.restore();
    }
  }
  // avís: el joc continua quan es prem espai
  drawHalt(ctx) {
    const m = this.missFx, a = clamp(((this.haltT || 0) - 0.35) * 4, 0, 1); if (a <= 0) return;
    let x = W / 2, y = (this.def.kbPos ? this.def.kbPos[1] : H - 132) - 128;
    if (m && !this.def.ownCompare) { const at = m.at || [W / 2, (this.def.kbPos ? this.def.kbPos[1] : H - 132) - 230]; x = at[0]; y = at[1] + 136; if (y > H - 40) y = at[1] - 136; }
    const pulse = Settings.reduceMotion ? 1 : 1 + 0.04 * Math.sin(this.haltT * 5);
    ctx.save(); ctx.globalAlpha *= a;
    ctx.font = `800 24px ${FONT_T}`; const l1 = L_("Prem"), l2 = L_("per continuar"), w1 = ctx.measureText(l1).width, w2 = ctx.measureText(l2).width, kw = 110, w = 30 + w1 + 14 + kw + 14 + w2 + 30;
    x = clamp(x, w / 2 + 16, W - w / 2 - 16); ctx.translate(x, y); ctx.scale(pulse, pulse); ctx.font = `800 24px ${FONT_T}`;
    ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; rr(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = BRAND.tinta; ctx.fill(); ctx.shadowColor = "transparent";
    let xx = -w / 2 + 30; ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.textBaseline = "middle"; ctx.fillText(l1, xx, 1); xx += w1 + 14;
    drawKeycap(ctx, xx, -21, kw, 40, L_("espai"), { theme: "menta", size: 20, weight: 800 }); xx += kw + 14;
    ctx.fillStyle = "#fff"; ctx.fillText(l2, xx, 1);
    ctx.restore();
  }
  drawIntro(ctx) {
    const t = this.st, a = clamp(t * 3, 0, 1);
    ctx.save(); ctx.globalAlpha = a;
    // franja inferior amb el nom, l'objectiu i com saltar la demo
    const y = H - 116;
    ctx.fillStyle = "rgba(32,62,66,0.9)"; ctx.fillRect(0, y - 10, W, 126);
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(0, y - 10, W, 6);
    text(ctx, L_("Demostració"), 40, y + 26, { size: 22, weight: 800, font: FONT_T, color: "#9FE3CC", align: "left" });
    text(ctx, this.def.name, 40, y + 66, { size: 40, weight: 900, font: FONT_T, color: "#fff", align: "left" });
    const gl = this.def.goal(this.level); ctx.font = `700 24px ${FONT_L}`;
    wrapText(ctx, gl, 470, ctx.measureText(gl).width > 760 ? y + 34 : y + 50, 760, 32, { size: 24, weight: 700, color: "#E3EFEB" });
    drawButton(ctx, W - 40, y + 50, L_("Jugar"), { align: "right", fs: 30, style: "primary", click: () => this.startPlay() });
    // indicador de la tecla que la demo acaba de prémer
    if (this.demoKey && this.demoKey.t < 0.8) {
      const k = this.demoKey, s = Ease.outBack(clamp(k.t / 0.2, 0, 1));
      ctx.globalAlpha = a * clamp((0.8 - k.t) * 3, 0, 1);
      const kl = k.k === " " ? "␣" : k.k === "Enter" ? L_("Retorn") : disp(k.k), kw = kl.length > 1 ? Math.max(84, measure(ctx, kl, 34, 800, FONT_T) + 40) : 84;
      drawKeycap(ctx, W - 118 - kw / 2, y - 110, kw * s, 84 * s, kl, { theme: "white", font: kl.length > 1 ? FONT_T : FONT_L, weight: kl.length > 1 ? 800 : 700, size: (kl.length > 1 ? 34 : 46) * s, pressed: k.t < 0.15 });
    }
    ctx.restore();
  }
  drawCount(ctx) {
    const c = this.countdown, n = Math.floor(c / 0.75), f = (c % 0.75) / 0.75;
    if (n > 3) return;
    const label = n < 3 ? String(3 - n) : L_("Som-hi!");
    ctx.save();
    ctx.fillStyle = `rgba(32,62,66,${n < 3 ? 0.35 : 0.35 * (1 - f)})`; ctx.fillRect(0, 0, W, H);
    const s = Ease.outBack(clamp(f * 2.2, 0, 1)) * (n < 3 ? 1 : 1.1), alpha = f > 0.75 ? 1 - (f - 0.75) * 4 : 1;
    ctx.globalAlpha = alpha; ctx.translate(W / 2, H / 2); ctx.scale(s, s);
    const w = n < 3 ? 190 : 420;
    drawKeycap(ctx, -w / 2, -95, w, 190, label, { theme: n < 3 ? "white" : "petroli", size: n < 3 ? 130 : 96 });
    ctx.restore();
  }
  onKey(k, e) {
    if (e && e.repeat) return; // mantenir una tecla no ha de crear errors nous
    if (this.halt && this.state === "play") {
      if (k === " ") { this.halt = false; this.haltT = 0; if (this.missFx) this.missFx.t = Math.max(this.missFx.t, 1.5); this.kbShow = Math.min(this.kbShow, 0.4); this.api.freeze = 0.12; Sfx.play("tick"); }
      else if (k === "Escape") { this.state = "pause"; this.pauseSel = 0; Voice.stop(); }
      return;
    }
    if (this.state === "intro") {
      if (k === " " || k === "Enter") { this.startPlay(); return; }
      if (k === "Escape") { this.quit(); return; }
      return;
    }
    if (this.state === "pause") return this.pauseKey(k);
    if (this.state === "end") return this.endKey(k);
    if (k === "Escape") { this.state = "pause"; this.pauseSel = 0; Voice.stop(); return; }
    if (this.state === "count" && this.countdown >= 2.25 && this.g.expected?.() != null) this.state = "play";
    if (this.state !== "play") return;
    if (this.api.freeze > 0) return;
    if (k.length === 1 && this.g.expected && this.g.expected() == null) return;
    if (this.g.onKey) this.g.onKey(k, e);
  }
  onKeyUp(k, e) { if (this.state === "play" && this.g.onKeyUp) this.g.onKeyUp(k, e); }
  pauseItems() { return [[L_("Continuar"), () => { this.state = "play"; }], [L_("Tornar a començar"), () => { this.startPlay(); }], [L_("Música: {v}", { v: Settings.music ? L_("sí") : L_("no") }), () => { Settings.music = !Settings.music; saveSettings(); if (Settings.music) Music.refresh(); else { const n = Music.styleName; Music.stop(); Music.styleName = null; Music.wanted = n; } }], [L_("Tornar a l'illa"), () => this.quit()]]; }
  pauseKey(k) {
    const it = this.pauseItems();
    if (k === "Escape") { this.state = "play"; return; }
    if (k === "ArrowDown") { this.pauseSel = (this.pauseSel + 1) % it.length; Sfx.play("tick"); }
    if (k === "ArrowUp") { this.pauseSel = (this.pauseSel + it.length - 1) % it.length; Sfx.play("tick"); }
    if (k === "Enter") { Sfx.play("clack"); it[this.pauseSel][1](); }
  }
  drawPause(ctx) {
    ctx.save(); ctx.fillStyle = "rgba(20,38,42,0.6)"; ctx.fillRect(0, 0, W, H);
    const it = this.pauseItems(), pw = 560, ph = 150 + it.length * 78, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
    drawPanel(ctx, px, py, pw, ph);
    text(ctx, L_("Pausa"), W / 2, py + 62, { size: 52, weight: 900, font: FONT_T, color: BRAND.tinta });
    it.forEach(([label], i) => {
      const y = py + 130 + i * 78, sel = i === this.pauseSel;
      Mouse.add(px + 40, y - 30, pw - 80, 64, { hover: () => { if (this.pauseSel !== i) { this.pauseSel = i; Sfx.play("tick"); } }, click: () => { this.pauseSel = i; this.pauseKey("Enter"); } });
      rr(ctx, px + 40, y - 30, pw - 80, 64, 32); ctx.fillStyle = sel ? BRAND.petroli : BRAND.menta; ctx.fill();
      text(ctx, label, W / 2, y + 2, { size: 30, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.tinta });
    });
    ctx.restore();
  }
  endItems() {
    const items = [[L_("Tornar a l'illa"), () => this.quit(true), "light"], [L_("Tornar a jugar"), () => this.restart(), "light"]];
    if (this.level < 6 && this.result.success) items.push([L_("Nivell {n}", { n: this.level + 1 }), () => this.restart(this.level + 1), "primary"]);
    return items;
  }
  endKey(k) {
    if (this.result.t < 0.9) return;
    if (k === "Enter") this.quit(true);
    else if (k === " ") this.restart();
    else if (k === "ArrowRight" && this.level < 6 && this.result.success) this.restart(this.level + 1);
    else if (k === "Escape") this.quit(true);
  }
  restart(level) {
    const sc = new GameScene(this.def, level || this.level, this.profile, { skipDemo: true, preview: this.o.preview });
    App.go(sc);
  }
  quit(fromEnd) {
    const back = this.o.back ? this.o.back() : (typeof IslandScene !== "undefined" ? new IslandScene(this.profile, { focus: this.def.id, celebrate: fromEnd && this.result && this.result.stars > this.result.prev }) : null);
    if (back) App.go(back);
  }
  drawEnd(ctx) {
    const R = this.result, t = R.t, k = Ease.outBack(clamp(t / 0.5, 0, 1));
    ctx.save(); ctx.fillStyle = `rgba(20,38,42,${0.55 * clamp(t * 3, 0, 1)})`; ctx.fillRect(0, 0, W, H);
    const pw = 940, ph = 600, px = W / 2 - pw / 2, py = H / 2 - ph / 2 - 10;
    ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
    drawPanel(ctx, px, py, pw, ph, { r: 36 });
    // capçalera petroli amb el logo
    ctx.save(); rr(ctx, px, py, pw, 120, 36); ctx.clip(); ctx.fillStyle = BRAND.petroli; ctx.fillRect(px, py, pw, 120); ctx.restore();
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(px, py + 84, pw, 36);
    text(ctx, R.success ? (this.profile ? L_("Molt bé, {nom}!", { nom: this.profile.name }) : L_("Molt bé!")) : L_("Gairebé!"), W / 2, py + 64, { size: 50, weight: 900, font: FONT_T, color: "#fff" });
    // estrelles
    for (let i = 0; i < 3; i++) {
      const st = clamp((t - 0.5 - i * 0.35) / 0.35, 0, 1), on = i < R.stars && st > 0;
      if (on && !R["s" + i]) { R["s" + i] = 1; Sfx.play("star", { i }); this.particles.emit(W / 2 + (i - 1) * 150, py + 220, { count: 18, color: [UI.gold, "#fff", "#FFE08A"], shape: "star", size: 16, speed: 380, gravity: 600 }); }
      const s = on ? Ease.outBack(st) : 1;
      drawStar(ctx, W / 2 + (i - 1) * 150, py + 220 - (i === 1 ? 18 : 0), 58 * (on ? s : 0.9), on, { rot: on ? (1 - st) * 1.2 : 0 });
    }
    const pct = Math.round(R.acc * 100);
    text(ctx, L_("{n}% d'encerts", { n: pct }), W / 2, py + 318, { size: 34, weight: 800, font: FONT_T, color: BRAND.tinta });
    text(ctx, R.success ? (R.stars === 3 ? L_("Perfecte: 3 estrelles amb més d'un 95%.") : R.stars === 2 ? L_("Amb un 95% d'encerts tindràs 3 estrelles.") : L_("Amb un 80% d'encerts tindràs 2 estrelles.")) : L_("Aquesta vegada no has arribat a l'objectiu."), W / 2, py + 362, { size: 24, weight: 700, color: "#4B6366" });
    // col·leccionable
    if (R.collect) {
      const cy = py + 430, ca = clamp((t - 1.6) / 0.4, 0, 1);
      ctx.save(); ctx.globalAlpha *= ca;
      rr(ctx, px + 120, cy - 34, pw - 240, 72, 20); ctx.fillStyle = BRAND.menta; ctx.fill();
      const tw = 92, th = 56; ctx.save(); rr(ctx, px + 136, cy - 28, tw, th, 12); ctx.clip(); try { this.def.thumb(ctx, px + 136, cy - 28, tw, th, App.t); } catch (e) { } ctx.restore();
      const cl = L_("Nou per al museu: {x}", { x: R.extra.collectName || "1 " + this.def.collect.one }), cmax = pw - 400;
      const cfs = Math.max(16, Math.min(26, 26 * cmax / Math.max(1, measure(ctx, cl, 26, 800, FONT_T))));
      text(ctx, cl, px + 250, cy + 2, { size: cfs, weight: 800, font: FONT_T, color: BRAND.tinta, align: "left" });
      ctx.restore();
    }
    const ia = clamp((t - 0.9) / 0.3, 0, 1); ctx.globalAlpha *= ia;
    const items = this.endItems(), y = py + ph - 62; let total = 0; const gaps = 40;
    const widths = items.map(([l]) => measure(ctx, l, 26, 800, FONT_T) + 26 * 1.6);
    total = widths.reduce((a, b) => a + b, 0) + gaps * (items.length - 1);
    let x = W / 2 - total / 2;
    items.forEach(([l, fn, st], i) => { drawButton(ctx, x, y, l, { align: "left", fs: 26, style: st, click: this.result.t >= 0.9 ? fn : null }); x += widths[i] + gaps; });
    ctx.restore();
  }
}

/* utilitat per als jocs: cel i fons sovint usats */
function skyGrad(ctx, top, bottom, y0 = 0, y1 = H) { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0); }
