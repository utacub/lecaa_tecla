"use strict";
/* ============================================================
   LECAA Tecla · motor comú
   Llenç lògic de 1600×900, escalat a la finestra amb nitidesa
   (backing store a la resolució física de la pantalla).
   ============================================================ */
const W = 1600, H = 900;
const BRAND = { petroli: "#17676B", tinta: "#203E42", menta: "#E3EFEB", blanc: "#FFFFFF", crema: "#FFFDF6", ink: "#14262A" };
const FONT_L = "Andika, 'Atkinson Hyperlegible', Verdana, sans-serif"; // lletres per aprendre
const FONT_T = "Nunito, Andika, Verdana, sans-serif";                // títols de marca

/* ---------- utilitats ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
function mulberry32(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const Ease = {
  linear: t => t,
  inQuad: t => t * t, outQuad: t => 1 - (1 - t) * (1 - t), inOutQuad: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3), inCubic: t => t * t * t, inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI) / 3) + 1,
  outBounce: t => { const n1 = 7.5625, d1 = 2.75; if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + .75; if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + .9375; return n1 * (t -= 2.625 / d1) * t + .984375; },
};
function hexToRgb(hex) { const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }
function shade(hex, amt) { const [r, g, b] = hexToRgb(hex); const f = v => clamp(Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt), 0, 255); return `rgb(${f(r)},${f(g)},${f(b)})`; }
function mix(h1, h2, t) { const a = hexToRgb(h1), b = hexToRgb(h2); return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(lerp(a[2], b[2], t))})`; }

/* ---------- emmagatzematge segur ---------- */
const Store = {
  get(k, def) { try { const v = localStorage.getItem("lecaa-tecla." + k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } },
  set(k, v) { try { localStorage.setItem("lecaa-tecla." + k, JSON.stringify(v)); } catch (e) { } },
};

/* ---------- configuració (panell del docent) ---------- */
const Settings = Object.assign({
  intro: "sempre",     // explicació del minijoc: sempre, primer (només el primer cop) o mai
  upper: true,        // mostrar les lletres en majúscula
  voice: true,         // veu
  sfx: true,           // efectes
  music: true,         // música
  errorSupport: true, // missatge de suport i pausa després dels errors
  hints: true,         // il·luminar la tecla quan l'alumne triga
  reduceMotion: false, // moviment reduït
  fullscreen: false,   // pantalla completa en clicar Començar
  calibN: 20,          // lletres del viatge de calibratge
  layout: "es",        // disposició del teclat en pantalla: es (català/espanyol)
}, Store.get("settings", {}));
function saveSettings() { Store.set("settings", Settings); }
const disp = s => Settings.upper ? s.toLocaleUpperCase("ca") : s;

/* ---------- llenç i bucle ---------- */
const App = {
  canvas: null, ctx: null, scale: 1, dpr: 1, ox: 0, oy: 0,
  scene: null, next: null, t: 0, iris: null, fadeHint: 0,
  init() {
    this.canvas = document.getElementById("c");
    this.ctx = this.canvas.getContext("2d");
    addEventListener("resize", () => this.resize());
    this.resize();
    addEventListener("keydown", e => Input.down(e));
    addEventListener("keyup", e => Input.up(e));
    Mouse.init(this.canvas);
    let last = performance.now();
    const loop = now => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      this.t += dt;
      try { this.frame(dt); } catch (err) { console.error(err); }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },
  resize() {
    const cw = innerWidth, ch = innerHeight;
    this.dpr = Math.min(2.5, devicePixelRatio || 1);
    this.scale = Math.min(cw / W, ch / H);
    this.ox = (cw - W * this.scale) / 2; this.oy = (ch - H * this.scale) / 2;
    this.canvas.width = Math.round(cw * this.dpr); this.canvas.height = Math.round(ch * this.dpr);
    this.canvas.style.width = cw + "px"; this.canvas.style.height = ch + "px";
  },
  go(scene, opts = {}) {
    // Transició d'iris: es tanca cap a un punt i s'obre a la nova escena.
    if (opts.instant || !this.scene) { this.setScene(scene); return; }
    if (this.iris) return;
    const from = opts.from || [W / 2, H / 2], to = opts.to || [W / 2, H / 2];
    this.iris = { phase: "close", t: 0, from, to, scene, dur: Settings.reduceMotion ? 0.25 : 0.55 };
    Sfx.play("iris");
  },
  setScene(scene) { if (this.scene && this.scene.exit) this.scene.exit(); this.scene = scene; if (scene.enter) scene.enter(); },
  frame(dt) {
    const ctx = this.ctx;
    Tween.update(dt);
    if (this.scene && !(this.iris && this.iris.phase === "close" && this.iris.t > 0.98)) this.scene.update && this.scene.update(dt);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BRAND.tinta; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.setTransform(this.scale * this.dpr, 0, 0, this.scale * this.dpr, this.ox * this.dpr, this.oy * this.dpr);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
    Mouse.begin();
    if (this.scene) this.scene.draw(ctx);
    Mouse.end();
    if (this.iris) this.drawIris(ctx, dt);
    ctx.restore();
  },
  drawIris(ctx, dt) {
    const ir = this.iris; ir.t += dt / ir.dur;
    const maxR = Math.hypot(W, H);
    let r, c;
    if (ir.phase === "close") {
      const k = Ease.inCubic(clamp(ir.t, 0, 1)); r = lerp(maxR, 0, k); c = ir.from;
      if (ir.t >= 1) { ir.phase = "hold"; ir.t = 0; this.setScene(ir.scene); }
    } else if (ir.phase === "hold") {
      r = 0; c = ir.to; if (ir.t >= 0.25) { ir.phase = "open"; ir.t = 0; }
    } else {
      const k = Ease.outCubic(clamp(ir.t, 0, 1)); r = lerp(0, maxR, k); c = ir.to;
      if (ir.t >= 1) { this.iris = null; return; }
    }
    ctx.save();
    ctx.fillStyle = BRAND.tinta;
    ctx.beginPath(); ctx.rect(-10, -10, W + 20, H + 20); ctx.arc(c[0], c[1], Math.max(0.01, r), 0, Math.PI * 2, true); ctx.fill("evenodd");
    // vora suau i un anell petroli, com un diafragma
    if (r > 2) { ctx.strokeStyle = rgba(BRAND.petroli, 0.9); ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(c[0], c[1], r + 5, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  },
};

/* ---------- entrada de teclat ---------- */
const Input = {
  held: {},
  down(e) {
    if (e.ctrlKey || e.metaKey) return;
    let k = e.key;
    if (k === "Dead" || k === "Shift" || k === "Alt" || k === "AltGraph" || k === "CapsLock" || k === "Control" || k === "Meta") return;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Backspace", "Tab", "Enter", "Escape"].includes(k)) e.preventDefault();
    if (k.length === 1) { e.preventDefault(); k = k.toLocaleLowerCase("ca"); }
    this.held[k] = true;
    Audio2.unlock();
    if (App.iris) return;
    if (App.scene && App.scene.onKey) App.scene.onKey(k, e);
  },
  up(e) { let k = e.key; if (k.length === 1) k = k.toLocaleLowerCase("ca"); this.held[k] = false; if (App.scene && App.scene.onKeyUp) App.scene.onKeyUp(k, e); },
};

/* ---------- ratolí: només per als menús (dins dels jocs, tot és amb el teclat) ----------
   Cada escena declara zones clicables mentre es dibuixa: Mouse.add(x, y, w, h, { click, hover }).
   Les zones es refan a cada fotograma; la darrera declarada és la de sobre. */
const Mouse = {
  x: -1, y: -1, moved: false, regions: [], over: null, inside: false,
  init(cv) {
    const pos = e => { this.x = (e.clientX - App.ox) / App.scale; this.y = (e.clientY - App.oy) / App.scale; };
    cv.addEventListener("pointermove", e => {
      const px = this.x, py = this.y; pos(e); this.moved = true; this.inside = true;
      // arrossegar (només a les escenes que ho admeten, com l'illa)
      if (this.press && App.scene && App.scene.onDrag && !App.iris) {
        if (!this.dragging && Math.hypot(this.x - this.press.x, this.y - this.press.y) > 8) this.dragging = true;
        if (this.dragging) App.scene.onDrag(this.x - px, this.y - py);
      }
    });
    cv.addEventListener("pointerleave", () => { this.inside = false; this.x = this.y = -1; this.press = null; this.dragging = false; });
    cv.addEventListener("pointerdown", e => {
      pos(e); this.inside = true; Audio2.unlock();
      if (App.iris || e.button !== 0) return;
      try { cv.setPointerCapture(e.pointerId); } catch (_) { }
      this.press = { x: this.x, y: this.y }; this.dragging = false;
    });
    cv.addEventListener("pointerup", e => {
      pos(e); const pr = this.press, dragged = this.dragging; this.press = null; this.dragging = false;
      if (!pr || dragged || App.iris) return;
      const r = this.find(); if (r && r.click) { e.preventDefault(); r.click(); }
    });
    cv.addEventListener("wheel", e => { if (App.iris || !App.scene || !App.scene.onWheel) return; e.preventDefault(); pos(e); App.scene.onWheel(Math.sign(e.deltaY), this.x, this.y); }, { passive: false });
    cv.addEventListener("contextmenu", e => e.preventDefault());
  },
  find() { for (let i = this.regions.length - 1; i >= 0; i--) { const r = this.regions[i]; if (this.x >= r.x && this.x <= r.x + r.w && this.y >= r.y && this.y <= r.y + r.h) return r; } return null; },
  begin() { this.prev = this.regions; this.regions = []; },
  end() {
    const r = this.inside && !App.iris ? this.find() : null;
    if (r && r.hover && this.moved) r.hover();
    this.moved = false; this.over = r;
    const cur = this.dragging ? "grabbing" : r && r.click ? "pointer" : App.scene && App.scene.onDrag ? "grab" : "default"; if (App.canvas.style.cursor !== cur) App.canvas.style.cursor = cur;
  },
  // declara una zona i diu si el ratolí hi és a sobre ara mateix (per dibuixar-la ressaltada)
  add(x, y, w, h, o = {}) {
    if (w < 0) { x += w; w = -w; }
    this.regions.push({ x, y, w, h, click: o.click, hover: o.hover });
    return this.inside && !App.iris && this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h;
  },
  isOver(x, y, w, h) { return this.inside && this.x >= x && this.x <= x + w && this.y >= y && this.y <= y + h; },
};

/* ---------- tweens ---------- */
const Tween = {
  list: [],
  to(obj, props, dur, ease = Ease.outCubic, delay = 0) {
    return new Promise(res => {
      const from = {}; for (const k in props) from[k] = obj[k];
      this.list.push({ obj, props, from, dur: Math.max(0.0001, dur), ease, t: -delay, res });
    });
  },
  update(dt) {
    for (let i = this.list.length - 1; i >= 0; i--) {
      const tw = this.list[i]; tw.t += dt; if (tw.t < 0) continue;
      const k = clamp(tw.t / tw.dur, 0, 1), e = tw.ease(k);
      for (const p in tw.props) tw.obj[p] = lerp(tw.from[p], tw.props[p], e);
      if (k >= 1) { this.list.splice(i, 1); tw.res(); }
    }
  },
  kill(obj) { this.list = this.list.filter(t => t.obj !== obj); },
};
const wait = s => new Promise(r => setTimeout(r, s * 1000));

/* ---------- partícules ---------- */
class Particles {
  constructor() { this.p = []; }
  emit(x, y, o = {}) {
    const n = o.count || 12;
    for (let i = 0; i < n; i++) {
      const a = o.angle != null ? o.angle + rand(-(o.spread || Math.PI), o.spread || Math.PI) : rand(0, Math.PI * 2);
      const s = rand(o.speed ? o.speed * 0.4 : 80, o.speed || 260);
      this.p.push({
        x: x + rand(-(o.jitter || 0), o.jitter || 0), y: y + rand(-(o.jitter || 0), o.jitter || 0),
        vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand((o.life || 0.9) * 0.6, o.life || 0.9),
        size: rand((o.size || 8) * 0.5, o.size || 8), color: Array.isArray(o.color) ? pick(o.color) : (o.color || "#fff"),
        g: o.gravity != null ? o.gravity : 500, drag: o.drag != null ? o.drag : 0.98, shape: o.shape || "circle",
        rot: rand(0, 6.28), vr: rand(-8, 8), glow: o.glow || false, fade: o.fade !== false,
      });
    }
  }
  update(dt) {
    for (let i = this.p.length - 1; i >= 0; i--) {
      const q = this.p[i]; q.life += dt; if (q.life >= q.max) { this.p.splice(i, 1); continue; }
      q.vx *= Math.pow(q.drag, dt * 60); q.vy = q.vy * Math.pow(q.drag, dt * 60) + q.g * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    }
  }
  draw(ctx) {
    for (const q of this.p) {
      const k = 1 - q.life / q.max;
      ctx.save(); ctx.globalAlpha = q.fade ? Math.min(1, k * 1.6) : 1;
      if (q.glow) ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = q.color; ctx.translate(q.x, q.y); ctx.rotate(q.rot);
      const s = q.size * (q.shape === "spark" ? 1 : (0.5 + 0.5 * k));
      if (q.shape === "rect" || q.shape === "confetti") ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      else if (q.shape === "square") ctx.fillRect(-s / 2, -s / 2, s, s);
      else if (q.shape === "star") { starPath(ctx, 0, 0, s, s * 0.45, 5); ctx.fill(); }
      else if (q.shape === "spark") { ctx.fillRect(-s, -1.5, s * 2, 3); }
      else { ctx.beginPath(); ctx.arc(0, 0, s / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }
}

/* ---------- formes ---------- */
function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function starPath(ctx, x, y, R, r, n) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rad = i % 2 ? r : R; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
  ctx.closePath();
}
function blobPath(ctx, x, y, r, seed, wob = 0.18, n = 9) {
  const R = mulberry32(seed); const pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const rr2 = r * (1 + (R() - 0.5) * 2 * wob); pts.push([x + Math.cos(a) * rr2, y + Math.sin(a) * rr2]); }
  ctx.beginPath();
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; if (i === 0) ctx.moveTo(mx, my); else ctx.quadraticCurveTo(p[0], p[1], mx, my); }
  const p = pts[0], q = pts[1]; ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2); ctx.closePath();
}
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  ctx.font = `${o.weight || 700} ${o.size || 32}px ${o.font || FONT_L}`;
  ctx.textAlign = o.align || "center"; ctx.textBaseline = o.base || "middle";
  if (o.shadow) { ctx.shadowColor = o.shadow; ctx.shadowBlur = o.blur || 0; ctx.shadowOffsetY = o.sy != null ? o.sy : 3; }
  if (o.stroke) { ctx.lineJoin = "round"; ctx.lineWidth = o.lw || 6; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
  ctx.fillStyle = o.color || BRAND.ink; ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(ctx, s, size, weight = 700, font = FONT_L) { ctx.save(); ctx.font = `${weight} ${size}px ${font}`; const w = ctx.measureText(s).width; ctx.restore(); return w; }

/* ---------- imatges incrustades ---------- */
const Img = {
  cache: {},
  svg(name, src) { const im = new Image(); im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src); this.cache[name] = im; return im; },
  get(name) { return this.cache[name]; },
};
