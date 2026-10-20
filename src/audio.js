"use strict";
/* ============================================================
   So: efectes sintetitzats amb WebAudio, música generativa
   senzilla per joc i veu amb speechSynthesis (ca-ES).
   ============================================================ */
const Audio2 = {
  ctx: null, master: null, sfxBus: null, musBus: null, unlocked: false, verb: null,
  ensure() {
    if (this.ctx) return this.ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.gain.value = 0.55; this.sfxBus.connect(this.master);
      this.musBus = this.ctx.createGain(); this.musBus.gain.value = 0.22; this.musBus.connect(this.master);
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
  let node = osc;
  if (o.lp) { const f = c.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; f.Q.value = o.q || 0.7; node.connect(f); node = f; }
  node.connect(g); g.connect(o.bus || Audio2.sfxBus);
  if (o.verb) g.connect(Audio2.verb);
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
  s.start(t0, Math.random()); s.stop(t0 + a + d + 0.05);
}
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12); // MIDI → Hz

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
    wood: () => { tone({ f: 520, d: 0.09, type: "sine", v: 0.3 }); noise({ f: 1200, q: 4, d: 0.05, v: 0.2 }); },
    glass: () => { for (let i = 0; i < 5; i++) tone({ f: rand(2000, 4200), d: rand(0.1, 0.4), v: 0.06, delay: i * 0.02, verb: true }); noise({ f: 5000, q: 1, d: 0.15, v: 0.15 }); },
    chime: (o) => { const n = o.note || 84; tone({ f: NOTE(n), d: 0.9, type: "sine", v: 0.16, verb: true }); tone({ f: NOTE(n + 12), d: 0.5, type: "sine", v: 0.05, verb: true }); },
    bell: (o) => { const n = o.note || 79; tone({ f: NOTE(n), d: 1.2, v: 0.12, verb: true }); tone({ f: NOTE(n) * 2.76, d: 0.5, v: 0.04 }); tone({ f: NOTE(n) * 5.4, d: 0.25, v: 0.02 }); },
    laser: () => { tone({ f: 1800, f2: 200, d: 0.18, type: "square", v: 0.08, lp: 4000 }); },
    boom: () => { noise({ f: 300, f2: 60, d: 0.5, v: 0.4, ft: "lowpass" }); tone({ f: 90, f2: 40, d: 0.4, v: 0.3 }); },
    thud: () => { tone({ f: 110, f2: 60, d: 0.15, v: 0.35 }); noise({ f: 400, d: 0.08, v: 0.15, ft: "lowpass" }); },
    cut: () => { noise({ f: 6000, f2: 1500, d: 0.12, v: 0.25, q: 0.8 }); },
    splash: () => { noise({ f: 900, f2: 300, d: 0.45, v: 0.3, q: 0.5 }); noise({ f: 3000, d: 0.2, v: 0.1, delay: 0.05 }); },
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
    menu:    { bpm: 92,  root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "triangle", bass: "sine", pat: "arp", vol: 1 },
    piano:   { bpm: 72,  root: 60, scale: [0, 2, 4, 7, 9], prog: [0, 3, 5, 4], lead: "sine", bass: "sine", pat: "slow", vol: 0.8 },
    chip:    { bpm: 132, root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 0, 5, 3], lead: "square", bass: "square", pat: "chip", vol: 0.55 },
    synth:   { bpm: 100, root: 57, scale: [0, 3, 5, 7, 10], prog: [0, 5, 3, 4], lead: "sawtooth", bass: "sawtooth", pat: "pad", vol: 0.5 },
    rock:    { bpm: 138, root: 52, scale: [0, 3, 5, 7, 10], prog: [0, 0, 3, 5], lead: "sawtooth", bass: "square", pat: "drive", vol: 0.5 },
    guitar:  { bpm: 84,  root: 57, scale: [0, 2, 3, 7, 8], prog: [0, 3, 4, 0], lead: "triangle", bass: "triangle", pat: "arp", vol: 0.8 },
    waltz:   { bpm: 150, root: 62, scale: [0, 2, 4, 7, 9], prog: [0, 4, 0, 5], lead: "triangle", bass: "sine", pat: "waltz", vol: 0.8 },
    marimba: { bpm: 112, root: 64, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], lead: "sine", bass: "triangle", pat: "bounce", vol: 1 },
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
    funk:    { bpm: 108, root: 52, scale: [0, 3, 5, 7, 10], prog: [0, 0, 3, 0], lead: "square", bass: "sawtooth", pat: "funk", vol: 0.5 },
    musicbox:{ bpm: 132, root: 72, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 0], lead: "sine", bass: "sine", pat: "arp", vol: 0.7 },
  },
  play(name) {
    if (this.styleName === name) return;
    this.stop(); this.styleName = name; this.style = this.STYLES[name] || this.STYLES.menu;
    if (!Settings.music) return;
    if (!Audio2.ensure()) return;
    this.step = 0; this.next = Audio2.now() + 0.1; this.intensity = 0;
    this.timer = setInterval(() => this.tick(), 60);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.styleName = null; },
  refresh() { const n = this.styleName; this.stop(); if (n) this.play(n); },
  tick() {
    if (!Audio2.unlocked || !Audio2.ctx) { this.next = Audio2.now() + 0.1; return; }
    const S = this.style, sp = 60 / S.bpm / 2; // corxeres
    while (this.next < Audio2.now() + 0.25) { this.sched(this.step, this.next, S, sp); this.step++; this.next += sp * (S.pat === "swing" && this.step % 2 ? 1.33 : (S.pat === "swing" ? 0.67 : 1)); }
  },
  sched(i, at, S, sp) {
    const bar = Math.floor(i / 8) % S.prog.length, beat = i % 8;
    const deg = S.prog[bar], sc = S.scale;
    const chord = [0, 2, 4].map(k => { const idx = deg + k; return S.root + sc[idx % sc.length] + 12 * Math.floor(idx / sc.length); });
    const bus = Audio2.musBus, v = 0.18 * S.vol;
    const B = n => tone({ at, f: NOTE(n - 24), d: sp * 1.6, type: S.bass, v: v * 1.1, lp: 600, bus });
    const L = (n, d = sp * 0.9, vv = v) => tone({ at, f: NOTE(n), d, type: S.lead, v: vv, lp: 2600, bus });
    const K = () => tone({ at, f: 120, f2: 45, d: 0.14, v: v * 1.4, bus });
    const Hh = () => noise({ at, f: 8000, ft: "highpass", d: 0.03, v: v * 0.5, bus });
    const Sn = () => noise({ at, f: 1800, d: 0.09, v: v * 0.8, bus });
    switch (S.pat) {
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
      case "funk": if (beat === 0 || beat === 3 || beat === 5) B(chord[0] + (beat === 5 ? 12 : 0)); if (beat % 4 === 0) K(); if (beat % 4 === 2) Sn(); Hh(); if (beat === 1 || beat === 6) L(chord[2] + 12, sp * .3, v * .35); break;
    }
  },
};

/* veu: passa pel gestor de motors (tts.js: veus del navegador o Piper); subtítol sempre */
const Voice = {
  last: "", caption: "", capT: 0, ready: false,
  init() { try { TTS.init(); this.ready = true; } catch (e) { } },
  say(txt, o = {}) {
    this.caption = o.caption || txt; this.capT = Math.max(2.2, txt.length * 0.09);
    if (!Settings.voice) return;
    try { TTS.say(txt); } catch (e) { }
  },
  stop() { try { TTS.stop(); } catch (e) { } },
};
