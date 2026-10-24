"use strict";
/* ============================================================
   So: efectes sintetitzats amb WebAudio, música generativa
   senzilla per joc i veu amb speechSynthesis (en l'idioma triat).
   ============================================================ */
const Audio2 = {
  ctx: null, master: null, sfxBus: null, musBus: null, unlocked: false, verb: null,
  ducks: new Set(),
  duck(source, active) {
    if (active) this.ducks.add(source); else this.ducks.delete(source);
    if (!this.musBus || !this.ctx) return;
    const g = this.musBus.gain, now = this.ctx.currentTime;
    g.cancelScheduledValues(now); g.setTargetAtTime(this.ducks.size ? 0.055 : 0.22, now, this.ducks.size ? 0.035 : 0.18);
  },
  ensure() {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0.55; this.sfxBus.connect(this.master);
      this.musBus = this.ctx.createGain(); this.musBus.gain.value = this.ducks.size ? 0.055 : 0.22; this.musBus.connect(this.master);
      // reverberació curta sintètica (per a cova, campanes…)
      const len = this.ctx.sampleRate * 1.6, buf = this.ctx.createBuffer(2, len, this.ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
      this.verb = this.ctx.createConvolver(); this.verb.buffer = buf;
      this.verbGain = this.ctx.createGain(); this.verbGain.gain.value = 0.25; this.verb.connect(this.verbGain); this.verbGain.connect(this.master);
    } catch (e) { this.ctx = null; }
    return this.ctx;
  },
  unlock() { const c = this.ensure(); if (c && c.state === "suspended") c.resume(); this.unlocked = true; },
  now() { return this.ctx ? this.ctx.currentTime : 0; },
  noiseBuf: null,
  noise() {
    if (this.noiseBuf) return this.noiseBuf;
    const c = this.ctx, len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return this.noiseBuf = b;
  },
};

/* sintetitzador mínim */
function tone(o) {
  const c = Audio2.ctx; if (!c) return;
  const t0 = (o.at != null ? o.at : c.currentTime) + (o.delay || 0);
  const osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || "sine";
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + (o.slide || o.d));
  if (o.detune) osc.detune.value = o.detune;
  const a = o.a != null ? o.a : 0.005, d = o.d || 0.2, v = o.v != null ? o.v : 0.3;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  let node = osc, filter = null;
  if (o.lp) { const f = c.createBiquadFilter(); filter = f; f.type = "lowpass"; f.frequency.value = o.lp; f.Q.value = o.q || 0.7; node.connect(f); node = f; }
  node.connect(g); g.connect(o.bus || Audio2.sfxBus);
  if (o.verb) g.connect(Audio2.verb);
  osc.onended = () => { osc.disconnect(); g.disconnect(); if (filter) filter.disconnect(); };
  osc.start(t0); osc.stop(t0 + a + d + 0.05);
}
function noise(o) {
  const c = Audio2.ctx; if (!c) return;
  const t0 = (o.at != null ? o.at : c.currentTime) + (o.delay || 0);
  const s = c.createBufferSource(); s.buffer = Audio2.noise();
  const f = c.createBiquadFilter(); f.type = o.ft || "bandpass"; f.frequency.setValueAtTime(o.f || 1200, t0); f.Q.value = o.q || 1;
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t0 + (o.d || 0.2));
  const g = c.createGain(), a = o.a || 0.003, d = o.d || 0.2;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(o.v || 0.3, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  s.connect(f); f.connect(g); g.connect(o.bus || Audio2.sfxBus); if (o.verb) g.connect(Audio2.verb);
  s.onended = () => { s.disconnect(); f.disconnect(); g.disconnect(); };
  s.start(t0, Math.random()); s.stop(t0 + a + d + 0.05);
}
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

/* Ressonadors modals: atac i parcials propis del material, sense mostres externes. */
const Timbre = {
  modes: {
    wood: [[1, 1, 1], [2.76, 0.22, 0.35], [5.4, 0.08, 0.16]],
    marimba: [[1, 1, 1], [4, 0.17, 0.23], [9.2, 0.035, 0.07]],
    guitar: [[1, 0.72, 1], [2, 0.28, 0.65], [3, 0.13, 0.38], [4, 0.055, 0.2]],
    metal: [[1, 0.7, 1], [2.71, 0.25, 0.52], [4.13, 0.11, 0.32]],
    ceramic: [[1, 0.8, 1], [2.41, 0.2, 0.65], [4.6, 0.06, 0.3]],
    electric: [[1, 0.8, 1], [2, 0.25, 0.4], [3, 0.1, 0.2]],
  },
  play(material, o) {
    const modes = this.modes[material] || this.modes.wood;
    for (const [ratio, amp, decay] of modes) {
      const f = o.f * ratio;
      if (Audio2.ctx && f >= Audio2.ctx.sampleRate * 0.45) continue;
      tone({ ...o, f, f2: undefined, type: "sine", a: 0.003, v: (o.v || 0.2) * amp, d: (o.d || 0.4) * decay });
    }
  },
};

const Sfx = {
  play(name, opt = {}) {
    if (!Settings.sfx || !Audio2.ensure() || !Audio2.unlocked) return;
    const f = this.lib[name]; if (f) try { f(opt); } catch (e) { }
  },
  lib: {
    nope: () => { tone({ f: 196, d: 0.22, type: "sine", v: 0.14 }); },
    ding: () => { tone({ f: 1567.98, d: 0.32, type: "sine", v: 0.16 }); tone({ f: 3135.96, d: 0.16, type: "sine", v: 0.03 }); },
    hit: () => { tone({ f: 880, d: 0.12, type: "triangle", v: 0.22 }); tone({ f: 1320, d: 0.18, type: "sine", v: 0.15, delay: 0.05 }); },
    miss: () => { tone({ f: 220, f2: 160, d: 0.22, type: "triangle", v: 0.22, lp: 900 }); },
    key: () => noise({ f: 3000, q: 2, d: 0.03, v: 0.12 }),
    tick: () => tone({ f: 1200, d: 0.04, type: "square", v: 0.06, lp: 3000 }),
    go: () => { tone({ f: 660, d: 0.3, type: "triangle", v: 0.25 }); tone({ f: 990, d: 0.4, type: "sine", v: 0.18, delay: 0.02 }); },
    count: () => tone({ f: 520, d: 0.16, type: "triangle", v: 0.22 }),
    iris: () => noise({ f: 600, f2: 2400, d: 0.35, v: 0.07, ft: "bandpass", q: 0.8 }),
    whoosh: () => noise({ f: 400, f2: 2200, d: 0.25, v: 0.12, q: 0.7 }),
    plof: () => { tone({ f: 180, f2: 90, d: 0.12, type: "sine", v: 0.35 }); noise({ f: 800, d: 0.06, v: 0.12 }); },
    pop: () => { noise({ f: 1800, q: 0.6, d: 0.08, v: 0.4 }); tone({ f: 300, f2: 80, d: 0.08, v: 0.25 }); },
    boing: () => tone({ f: 200, f2: 600, slide: 0.12, d: 0.3, type: "sine", v: 0.25 }),
    clack: () => { noise({ f: 2500, q: 3, d: 0.04, v: 0.35 }); tone({ f: 700, d: 0.05, type: "square", v: 0.06, lp: 2000 }); },
    wood: () => { Timbre.play("wood", { f: 430 + rand(-12, 12), d: 0.16, v: 0.24 }); noise({ f: 1100, q: 2, d: 0.025, v: 0.07 }); },
    ceramic: () => Timbre.play("ceramic", { f: 870, d: 0.45, v: 0.18 }),
    metal: () => Timbre.play("metal", { f: 620 + rand(-8, 8), d: 0.24, v: 0.14 }),
    paper: () => { noise({ f: 2400, f2: 900, q: 0.45, d: 0.18, v: 0.075 }); noise({ f: 4100, f2: 1600, q: 0.6, d: 0.09, v: 0.035, delay: 0.07 }); },
    tile: o => { Timbre.play("ceramic", { f: NOTE(o.note || 76), d: 0.62, v: 0.19 }); noise({ f: 3100, q: 1.4, d: 0.023, v: 0.035 }); },
    fabric: () => noise({ f: 1800, f2: 700, d: 0.12, v: 0.07, q: 0.5 }),
    glass: () => { for (let i = 0; i < 5; i++) tone({ f: rand(2000, 4200), d: rand(0.1, 0.4), v: 0.06, delay: i * 0.02, verb: true }); noise({ f: 5000, q: 1, d: 0.15, v: 0.15 }); },
    chime: (o) => { const n = o.note || 84; tone({ f: NOTE(n), d: 0.9, type: "sine", v: 0.16, verb: true }); tone({ f: NOTE(n + 12), d: 0.5, type: "sine", v: 0.05, verb: true }); },
    bell: (o) => { const n = o.note || 79; tone({ f: NOTE(n), d: 1.2, v: 0.12, verb: true }); tone({ f: NOTE(n) * 2.76, d: 0.5, v: 0.04 }); tone({ f: NOTE(n) * 5.4, d: 0.25, v: 0.02 }); },
    laser: () => { tone({ f: 1800, f2: 200, d: 0.18, type: "square", v: 0.08, lp: 4000 }); },
    boom: () => { noise({ f: 300, f2: 60, d: 0.5, v: 0.4, ft: "lowpass" }); tone({ f: 90, f2: 40, d: 0.4, v: 0.3 }); },
    thud: () => { tone({ f: 110, f2: 60, d: 0.15, v: 0.35 }); noise({ f: 400, d: 0.08, v: 0.15, ft: "lowpass" }); },
    cut: () => { noise({ f: 6000, f2: 1500, d: 0.12, v: 0.25, q: 0.8 }); },
    splash: () => { noise({ f: 1600, f2: 450, d: 0.36, v: 0.17, q: 0.5 }); [0, 0.07, 0.14].forEach((delay, i) => tone({ f: 440 + i * 170, f2: 900 + i * 180, d: 0.08, v: 0.05, delay })); },
    bite: () => { noise({ f: 1400, q: 1.5, d: 0.07, v: 0.4 }); noise({ f: 900, q: 1.5, d: 0.07, v: 0.3, delay: 0.09 }); },
    burp: () => { tone({ f: 90, f2: 70, d: 0.45, type: "sawtooth", v: 0.18, lp: 500 }); },
    sprout: () => { tone({ f: 400, f2: 900, slide: 0.15, d: 0.2, type: "sine", v: 0.2 }); },
    click0: () => tone({ f: 160, d: 0.03, type: "square", v: 0.06, lp: 900 }),
    engine: () => tone({ f: 90, f2: 180, d: 0.3, type: "sawtooth", v: 0.08, lp: 700 }),
    whistle: () => { tone({ f: 1500, d: 0.5, type: "sine", v: 0.12, a: 0.05 }); tone({ f: 1800, d: 0.5, type: "sine", v: 0.08, a: 0.05 }); },
    crowd: () => { noise({ f: 900, q: 0.3, d: 1.4, a: 0.2, v: 0.2 }); },
    star: (o) => { const n = 76 + (o.i || 0) * 4; tone({ f: NOTE(n), d: 0.5, type: "triangle", v: 0.2, verb: true }); tone({ f: NOTE(n + 7), d: 0.6, v: 0.1, delay: 0.06, verb: true }); },
    win: () => { [72, 76, 79, 84].forEach((n, i) => tone({ f: NOTE(n), d: 0.5, type: "triangle", v: 0.18, delay: i * 0.1, verb: true })); },
    page: () => noise({ f: 2500, f2: 800, d: 0.3, v: 0.12, q: 0.6 }),
    note: (o) => { tone({ f: NOTE(o.note || 72), d: o.d || 0.35, type: o.type || "triangle", v: o.v || 0.2, verb: o.verb }); },
    sour: (o) => { tone({ f: NOTE(o.note || 72) * 1.06, d: 0.3, type: "sawtooth", v: 0.08, lp: 1200 }); tone({ f: NOTE(o.note || 72) * 0.97, d: 0.3, type: "sawtooth", v: 0.08, lp: 1200 }); },
    bike: () => { tone({ f: 2400, d: 0.25, v: 0.1 }); tone({ f: 2400, d: 0.25, v: 0.1, delay: 0.14 }); },
    gear: () => { for (let i = 0; i < 4; i++) noise({ f: 2000, q: 6, d: 0.02, v: 0.15, delay: i * 0.04 }); },
  },
};

/* música generativa: una progressió i un patró per estil */
const Music = {
  style: null, timer: null, step: 0, next: 0,
  STYLES: {
    album:   { bpm: 80, root: 60, scale: [0,2,4,5,7,9,11], prog: [0,3,5,4], lead: "triangle", voice: "guitar", bass: "sine", pat: "album", vol: 0.75 },
    arcade:  { bpm: 120, root: 57, scale: [0,3,5,7,10], prog: [0,0,3,2], lead: "square", bass: "triangle", pat: "arcade", vol: 0.48 },
    orbital: { bpm: 76, root: 57, scale: [0,2,3,5,7,8,10], prog: [0,5,3,4], lead: "triangle", bass: "sine", pat: "orbital", vol: 0.65 },
    rally:   { bpm: 116, root: 52, scale: [0,2,3,5,7,9,10], prog: [0,0,3,4], lead: "triangle", voice: "electric", bass: "triangle", pat: "rally", vol: 0.6 },
    atelier: { bpm: 86, root: 60, scale: [0,2,4,5,7,9,11], prog: [0,3,1,4], lead: "sine", voice: "ceramic", bass: "sine", pat: "atelier", vol: 0.7 },
    menu:    { bpm: 92,  root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "triangle", bass: "sine", pat: "arp", vol: 1 },
    piano:   { bpm: 72,  root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 3, 5, 4], lead: "sine", bass: "sine", pat: "slow", vol: 0.8 },
    chip:    { bpm: 132, root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 0, 5, 3], lead: "square", bass: "square", pat: "chip", vol: 0.55 },
    synth:   { bpm: 100, root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 5, 3, 4], lead: "sawtooth", bass: "sawtooth", pat: "pad", vol: 0.5 },
    rock:    { bpm: 138, root: 52, scale: [0, 3, 5, 7, 10], prog: [0, 0, 3, 5], lead: "sawtooth", bass: "square", pat: "drive", vol: 0.5 },
    guitar:  { bpm: 78,  root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], lead: "triangle", voice: "guitar", bass: "sine", pat: "water", vol: 0.8 },
    waltz:   { bpm: 150, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 4, 0, 5], lead: "triangle", bass: "sine", pat: "waltz", vol: 0.8 },
    marimba: { bpm: 104, root: 60, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 3, 5, 4], lead: "sine", voice: "marimba", bass: "sine", pat: "clay", vol: 0.85 },
    perc:    { bpm: 140, root: 55, scale: [0, 3, 5, 7, 10], prog: [0, 0, 3, 4], lead: "square", bass: "sine", pat: "perc", vol: 0.55 },
    harp:    { bpm: 76,  root: 65, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "sine", bass: "sine", pat: "arp", vol: 0.8 },
    party:   { bpm: 120, root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 4], lead: "square", bass: "triangle", pat: "bounce", vol: 0.5 },
    ragtime: { bpm: 108, root: 60, scale: [0, 2, 4, 5, 7, 9], prog: [0, 3, 0, 4], lead: "triangle", bass: "sine", pat: "stride", vol: 0.8 },
    build:   { bpm: 96,  root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 4, 5, 3], lead: "triangle", bass: "sine", pat: "arp", vol: 0.8 },
    celesta: { bpm: 66,  root: 72, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "sine", bass: "sine", pat: "slow", vol: 0.8 },
    adventure:{ bpm: 104, root: 57, scale: [0, 2, 3, 5, 7, 10], prog: [0, 6, 5, 6], lead: "triangle", bass: "triangle", pat: "drive", vol: 0.6 },
    jazz:    { bpm: 92,  root: 58, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 5, 1, 4], lead: "sine", bass: "triangle", pat: "swing", vol: 0.8 },
    swing:   { bpm: 150, root: 58, scale: [0, 2, 4, 7, 9, 10], prog: [0, 3, 0, 4], lead: "triangle", bass: "triangle", pat: "swing", vol: 0.7 },
    band:    { bpm: 116, root: 60, scale: [0, 2, 4, 5, 7, 9], prog: [0, 4, 0, 4], lead: "square", bass: "triangle", pat: "march", vol: 0.5 },
    cave:    { bpm: 60,  root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 5, 3, 0], lead: "sine", bass: "sine", pat: "pad", vol: 0.6 },
    country: { bpm: 124, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], lead: "triangle", bass: "triangle", pat: "bounce", vol: 0.7 },
    stadium: { bpm: 120, root: 57, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "sawtooth", bass: "square", pat: "drive", vol: 0.4 },
    funk:    { bpm: 106, root: 52, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 0, 3, 0], lead: "triangle", voice: "electric", bass: "triangle", pat: "funk", vol: 0.75 },
    musicbox:{ bpm: 132, root: 72, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], lead: "sine", bass: "sine", pat: "arp", vol: 0.7 },
  },
  play(name) {
    if (this.styleName === name) return;
    this.stop(); this.styleName = name; this.wanted = name; this.style = this.STYLES[name] || this.STYLES.menu;
    if (!Settings.music) return;
    if (!Audio2.ensure()) return;
    this.bus = Audio2.ctx.createGain(); this.bus.gain.value = 0.0001;
    this.bus.gain.exponentialRampToValueAtTime(1, Audio2.now() + 0.18); this.bus.connect(Audio2.musBus);
    this.step = 0; this.next = Audio2.now() + 0.1; this.intensity = 0;
    this.timer = setInterval(() => this.tick(), 60);
  },
  stop() {
    if (this.timer) clearInterval(this.timer); this.timer = null; this.styleName = null;
    const bus = this.bus; this.bus = null;
    if (bus && Audio2.ctx) { const now = Audio2.now(); bus.gain.cancelScheduledValues(now); bus.gain.setTargetAtTime(0, now, 0.025); setTimeout(() => bus.disconnect(), 180); }
  },
  refresh() { const n = this.styleName || this.wanted; this.stop(); if (n) this.play(n); },
  tick() {
    if (!Audio2.unlocked || !Audio2.ctx || document.hidden) { this.next = Audio2.now() + 0.1; return; }
    if (this.next < Audio2.now() - 0.25) this.next = Audio2.now() + 0.02;
    const S = this.style, sp = 60 / S.bpm / 2; // corxeres
    while (this.next < Audio2.now() + 0.25) { this.sched(this.step, this.next, S, sp); this.step++; this.next += sp * (S.pat === "swing" && this.step % 2 ? 1.33 : (S.pat === "swing" ? 0.67 : 1)); }
  },
  sched(i, at, S, sp) {
    const bar = Math.floor(i / 8) % S.prog.length, beat = i % 8;
    const deg = S.prog[bar], sc = S.scale;
    const chord = [0, 2, 4].map(k => { const idx = deg + k; return S.root + sc[idx % sc.length] + 12 * Math.floor(idx / sc.length); });
    const bus = this.bus || Audio2.musBus, v = 0.18 * S.vol;
    const B = n => tone({ at, f: NOTE(n - 24), d: sp * 1.6, type: S.bass, v: v * 1.1, lp: 600, bus });
    const L = (n, d = sp * 0.9, vv = v) => S.voice
      ? Timbre.play(S.voice, { at, f: NOTE(n), d, v: vv, lp: 4600, bus })
      : tone({ at, f: NOTE(n), d, type: S.lead, v: vv, lp: 2600, bus });
    const K = () => tone({ at, f: 120, f2: 45, d: 0.14, v: v * 1.4, bus });
    const Hh = () => noise({ at, f: 8000, ft: "highpass", d: 0.03, v: v * 0.5, bus });
    const Sn = () => noise({ at, f: 1800, d: 0.09, v: v * 0.8, bus });
    switch (S.pat) {
      case "album": {
        const phrase = [[0,-1,2,1,-1,0,1,-1],[1,-1,2,-1,0,1,-1,2],[0,2,-1,1,0,-1,2,-1],[2,1,0,-1,1,-1,0,-1]][bar];
        if (beat === 0) B(chord[0]); if (phrase[beat] >= 0) L(chord[phrase[beat]] + 12, sp * 2.4, v * 0.55);
        if (beat === 4) Timbre.play('wood', {at, f:NOTE(chord[2]), d:0.18, v:v*0.15, bus}); break;
      }
      case "arcade": {
        const phrase = [[0,2,1,-1,0,1,2,-1],[2,1,0,-1,1,-1,0,2],[0,-1,1,2,1,0,-1,1],[2,1,0,-1,0,-1,2,-1]][bar];
        if (beat % 2 === 0) B(chord[beat === 4 ? 2 : 0]); if (beat===0 || beat===4) K();
        if (beat===2 || beat===6) noise({at,f:1700,d:0.045,v:v*0.3,bus});
        if (phrase[beat]>=0) L(chord[phrase[beat]]+12,sp*0.55,v*0.4); break;
      }
      case "orbital": {
        if (beat===0) { chord.forEach(n => tone({at,f:NOTE(n),d:sp*7.5,a:sp*1.4,type:'triangle',v:v*0.16,lp:800,bus})); B(chord[0]); }
        if ([1,4,6].includes(beat)) { const f=NOTE(chord[[0,2,1][[1,4,6].indexOf(beat)]]+12); tone({at,f,d:sp*1.6,a:0.04,type:'sine',v:v*0.32,bus}); tone({at:at+sp*0.75,f,d:sp*1.8,a:0.05,type:'sine',v:v*0.09,bus}); } break;
      }
      case "rally": {
        if ([0,3,4,6].includes(beat)) B(chord[beat===6?2:0]); if (beat===0 || beat===4) K();
        if (beat===2 || beat===6) noise({at,f:1400,d:0.065,v:v*0.4,bus}); if (beat%2) noise({at,f:6500,ft:'highpass',d:0.025,v:v*0.17,bus});
        if ([1,3,6].includes(beat)) L(chord[(bar+beat)%3]+12,sp*0.85,v*0.43); break;
      }
      case "atelier": {
        if (beat===0) B(chord[0]); const phrase=[0,-1,2,-1,1,-1,2,-1];
        if (phrase[beat]>=0) L(chord[phrase[beat]]+12,sp*2.4,v*(beat===0?0.48:0.34));
        if (beat===3 || beat===7) Timbre.play('wood',{at,f:NOTE(chord[beat===3?1:2]),d:sp*0.5,v:v*0.12,bus}); break;
      }
      case "clay": {
        // Frase de quatre compassos amb respiracions i resposta a l'octava.
        const phrase = [[0, -1, 1, 2, -1, 1, 0, -1], [1, 2, -1, 1, 0, -1, 2, -1], [0, -1, 2, 1, -1, 0, 1, -1], [2, 1, 0, -1, 1, -1, 0, -1]][bar];
        if (beat === 0 || beat === 4) B(chord[beat === 0 ? 0 : 2]);
        if (phrase[beat] >= 0) L(chord[phrase[beat]] + 12, sp * 1.8, v * (beat % 2 ? 0.48 : 0.62));
        if (beat === 2 || beat === 6) noise({ at, f: 1400, d: 0.045, q: 0.5, v: v * 0.12, bus });
        break;
      }
      case "water": {
        if (beat === 0) B(chord[0]);
        if (beat !== 7) L(chord[[0, 2, 1, 2, 0, 1, 2, 0][beat]] + (beat === 4 ? 12 : 0), sp * 2.3, v * (beat % 2 ? 0.32 : 0.46));
        if (bar === 3 && beat === 6) Timbre.play("ceramic", { at: at + sp * 0.3, f: NOTE(chord[0] + 24), d: sp * 2, v: v * 0.11, bus });
        break;
      }
      case "slow": if (beat === 0) B(chord[0]); if (beat % 4 === 0) L(chord[(beat / 4 + bar) % 3] + 12, sp * 3, v * 0.7); if (beat === 6 && Math.random() < .5) L(chord[2] + 12, sp * 1.5, v * .4); break;
      case "arp": if (beat === 0 || beat === 4) B(chord[0]); L(chord[[0, 1, 2, 1, 0, 2, 1, 2][beat]] + 12, sp * 1.2, v * 0.6); break;
      case "chip": if (beat % 2 === 0) B(chord[0] + (beat % 4 ? 12 : 0)); if (beat % 4 === 0) K(); if (beat % 4 === 2) Sn(); if (beat % 2 === 1 || Math.random() < 0.4) L(chord[(beat >> 1) % 3] + 12, sp * 0.6, v * 0.5); break;
      case "pad": if (beat === 0) { chord.forEach(n => tone({ at, f: NOTE(n), d: sp * 8, a: sp * 2, type: S.lead, v: v * 0.25, lp: 900, bus })); B(chord[0]); } if (beat % 2 === 0) Hh(); if (beat === 3 || beat === 7) L(chord[2] + 12, sp, v * 0.25); break;
      case "drive": B(chord[0] + (beat % 2 ? 12 : 0)); if (beat % 4 === 0) K(); if (beat % 4 === 2) Sn(); Hh(); if (beat === 0 || beat === 3 || beat === 6) L(chord[beat % 3] + 12, sp * 1.4, v * 0.35); break;
      case "waltz": { const b3 = i % 6; if (b3 === 0) B(chord[0]); if (b3 === 2 || b3 === 4) { tone({ at, f: NOTE(chord[1]), d: sp, type: S.lead, v: v * .35, bus }); tone({ at, f: NOTE(chord[2]), d: sp, type: S.lead, v: v * .35, bus }); } if (b3 === 0 && Math.random() < .7) L(chord[randi(0, 2)] + 12, sp * 2, v * .5); break; }
      case "bounce": if (beat % 4 === 0) B(chord[0]); if (beat % 4 === 2) B(chord[2]); if (beat !== 3 && beat !== 7) L(chord[[0, 1, 2, 0, 2, 1, 0, 1][beat]] + 12, sp * .5, v * .55); break;
      case "perc": if (beat % 2 === 0) K(); Hh(); if (beat === 3 || beat === 6) Sn(); if (beat === 0) B(chord[0]); if (beat % 3 === 0) L(chord[beat % 3] + 12, sp * .4, v * .3); break;
      case "stride": if (beat % 2 === 0) B(beat % 4 === 0 ? chord[0] : chord[2]); else { tone({ at, f: NOTE(chord[0] + 12), d: sp * .6, type: S.lead, v: v * .3, bus }); tone({ at, f: NOTE(chord[1] + 12), d: sp * .6, type: S.lead, v: v * .3, bus }); } if (Math.random() < .5) L(chord[randi(0, 2)] + 24, sp * .5, v * .4); break;
      case "swing": if (beat % 2 === 0) B(chord[beat % 3]); if (beat % 2 === 0) Hh(); if (beat === 2 || beat === 6) Sn(); if (Math.random() < .55) L(chord[randi(0, 2)] + 12 + (Math.random() < .3 ? 2 : 0), sp * .8, v * .45); break;
      case "march": if (beat % 2 === 0) B(beat % 4 === 0 ? chord[0] : chord[2]); if (beat % 4 === 0) K(); if (beat % 2 === 1) Sn(); L(chord[[0, 1, 2, 1, 2, 1, 0, 2][beat]] + 12, sp * .7, v * .4); break;
      case "funk": if (beat === 0 || beat === 3 || beat === 5) B(chord[0] + (beat === 5 ? 12 : 0)); if (beat % 4 === 0) K(); if (beat % 4 === 2) Sn(); if (beat % 2 || beat === 4) Hh(); if (beat === 1 || beat === 6) { L(chord[1] + 12, sp * .5, v * .3); L(chord[2] + 12, sp * .5, v * .24); } if (bar === 3 && beat === 7) L(chord[0] + 24, sp * .4, v * .25); break;
    }
  },
};

/* veu: passa pel gestor de motors (tts.js: veus del navegador o Piper); subtítol sempre */
const Voice = {
  last: "", caption: "", capT: 0, ready: false, token: 0,
  init() { try { TTS.init(); this.ready = true; } catch (e) { } },
  isShort(txt) { return /^\p{L}{1,2}$/u.test(String(txt).normalize("NFC").trim()); },
  say(txt, o = {}) {
    txt = String(txt);
    if (this.isShort(txt)) return this.sayItem(txt, o);
    txt = L_(txt); // les frases dels jocs, en català, es diuen en l'idioma triat
    return this.sequence([{ text: txt }], { ...o, caption: o.caption || txt });
  },
  sayItem(item, o = {}) {
    const raw = String(item).normalize("NFC").trim(), chars = Array.from(lower(raw));
    // sense locucions enregistrades en aquest idioma (basc, gallec, anglès, francès), sempre el nom de la lletra
    const names = voiceCfg().shortMode === "names" || !Phon.hasBank();
    const parts = this.isShort(raw) ? chars.map(letter => names
      // Naming a letter is explicit prose, never a bare two-letter synthesis request.
      ? { text: L_("La lletra {x}.", { x: LETTER_NAME[letter] || letter }) }
      : { letter }) : [{ text: raw }];
    const tpl = L_(o.template || "{x}"), index = tpl.indexOf("{x}");
    if (index >= 0) {
      const before = tpl.slice(0, index).trim(), after = tpl.slice(index + 3).trim();
      if (before) parts.unshift({ text: before }); if (after) parts.push({ text: after });
    }
    return this.sequence(parts, { ...o, caption: o.caption || tpl.replace("{x}", disp(raw)) });
  },
  async sequence(parts, o = {}) {
    this.stop(); const token = this.token;
    this.caption = o.caption || ""; this.capT = Math.max(2.2, this.caption.length * 0.09);
    if (!Settings.voice && !o.force) return;
    for (const part of parts) {
      if (token !== this.token) return;
      try { if (part.letter != null) await Phon.playAsync(part.letter); else if (part.text.trim()) await TTS.say(part.text); } catch (e) {}
      if (token !== this.token) return;
    }
  },
  stop() { this.token++; this.caption = ""; this.capT = 0; try { TTS.stop(); Phon.stop(); } catch (e) {} },
};
