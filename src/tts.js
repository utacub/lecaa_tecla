"use strict";
/* ============================================================
   Motors de veu (portats de LECAA Docs) i locucions dels fonemes
   - "web:"    veus del navegador (speechSynthesis)
   - "neural:" veus Piper que funcionen dins l'app (ONNX Runtime + piper_phonemize);
               es descarreguen una sola vegada i es desen a IndexedDB
   El motor "native:" de LECAA Docs només existeix a l'app d'escriptori (Tauri) i aquí no s'activa.
   ============================================================ */

const VOICE_DEF = { id: null, rate: 0.95, pitch: 1, volume: 1, showAll: false };
function voiceCfg() { if (!Settings.voiceCfg) Settings.voiceCfg = Object.assign({}, VOICE_DEF); return Object.assign({}, VOICE_DEF, Settings.voiceCfg); }
function setVoiceCfg(k, v) { Settings.voiceCfg = Object.assign(voiceCfg(), { [k]: v }); saveSettings(); }
const isCa = l => /^ca($|-)/.test(String(l || "").trim().replace("_", "-").toLowerCase());

/* ---------- veus Piper disponibles (només les catalanes de LECAA Docs) ---------- */
const PIPER_HOSTS = ["https://huggingface.co/rhasspy/piper-voices/resolve/main/", "https://huggingface.co/diffusionstudio/piper-voices/resolve/main/"];
const piperUrls = p => ({ model: PIPER_HOSTS.map(h => h + p), config: PIPER_HOSTS.map(h => h + p + ".json") });
const NEURAL_VOICES = [
  { key: "ona-medium", family: "piper", title: "Ona", description: "Veu femenina, català central.", bytes: 63201294, ...piperUrls("ca/ca_ES/upc_ona/medium/ca_ES-upc_ona-medium.onnx"),
    licence: "Dades de veu de la UPC (Festcat), llicència CC BY-SA 3.0 ES.", licenceUrl: "https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES",
    voices: [{ id: "ona-medium", name: "Ona", dialect: "central" }] },
];
const neuralFor = id => NEURAL_VOICES.find(v => v.voices.some(x => x.id === id));
const PIPER_WASM = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/";
const ORT_WASM = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/";
const SIMD = (() => { try { return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])); } catch (e) { return false; } })();
const ORT_FILE = SIMD ? "ort-wasm-simd.wasm" : "ort-wasm.wasm";
const rtUrls = (f, base) => [...(/^https?:$/.test(location.protocol) ? [new URL("piper/" + f, document.baseURI).href] : []), base + f];
const RUNTIME = [
  { key: "runtime:piper_phonemize.wasm", urls: rtUrls("piper_phonemize.wasm", PIPER_WASM), bytes: 635212 },
  { key: "runtime:piper_phonemize.data", urls: rtUrls("piper_phonemize.data", PIPER_WASM), bytes: 18077249 },
  { key: "runtime:" + ORT_FILE, urls: rtUrls(ORT_FILE, ORT_WASM), bytes: SIMD ? 10595041 : 9758086 },
];

/* ---------- magatzem IndexedDB ---------- */
const VDB = (() => {
  let dbp = null;
  const open = () => dbp = dbp || new Promise((res, rej) => { const r = indexedDB.open("lecaa-tecla-veus", 1); r.onupgradeneeded = () => r.result.createObjectStore("files"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const run = (mode, fn) => open().then(db => new Promise((res, rej) => { const q = fn(db.transaction("files", mode).objectStore("files")); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }));
  return {
    get: k => run("readonly", s => s.get(k)).catch(() => undefined),
    put: (k, v) => run("readwrite", s => s.put(v, k)),
    del: k => run("readwrite", s => s.delete(k)).catch(() => undefined),
    keys: () => run("readonly", s => s.getAllKeys()).then(a => a.map(String)).catch(() => []),
  };
})();
async function fetchFirst(urls, onProgress) {
  let err = null;
  for (const u of urls) {
    try {
      const r = await fetch(u); if (!r.ok) throw Error(r.status + " " + u);
      if (!r.body || !onProgress) return await r.blob();
      const rd = r.body.getReader(), parts = []; let n = 0;
      for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); n += value.length; onProgress(n); }
      return new Blob(parts);
    } catch (e) { err = e; }
  }
  throw err || Error("download failed");
}
async function cached(key, urls, onProgress) { const b = await VDB.get(key); if (b) return b; const nb = await fetchFirst(urls, onProgress); await VDB.put(key, nb).catch(() => { }); return nb; }

/* ---------- motor del navegador ---------- */
const WebTTS = {
  kind: "web", cur: null, finish: null,
  available() { return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; },
  raw() { try { return speechSynthesis.getVoices(); } catch (e) { return []; } },
  async listVoices() {
    if (!this.available()) return [];
    let v = this.raw();
    if (!v.length) { await new Promise(r => { const t = setTimeout(r, 1500); speechSynthesis.addEventListener("voiceschanged", () => { clearTimeout(t); r(); }, { once: true }); }); v = this.raw(); }
    return v.map(x => ({ id: "web:" + x.voiceURI + "|" + x.name, name: x.name, lang: x.lang, engine: "Navegador", offline: x.localService }));
  },
  onVoicesChanged(f) { if (this.available()) speechSynthesis.addEventListener("voiceschanged", f); },
  speak(id, txt, o) {
    this.stop();
    return new Promise(res => {
      const u = new SpeechSynthesisUtterance(txt), v = this.raw().find(x => "web:" + x.voiceURI + "|" + x.name === id);
      try { if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "ca-ES"; } catch (e) { }
      u.rate = o.rate; u.pitch = o.pitch; u.volume = o.volume;
      let done = false; const fin = () => { if (done) return; done = true; if (this.cur === u) { this.cur = null; this.finish = null; } res(); };
      u.onend = fin; u.onerror = fin; this.cur = u; this.finish = fin;
      try { speechSynthesis.speak(u); } catch (e) { fin(); }
    });
  },
  stop() { const f = this.finish; this.cur = null; this.finish = null; try { speechSynthesis.cancel(); } catch (e) { } if (f) f(); },
};

/* ---------- motor Piper (dins l'app) ---------- */
const NeuralTTS = {
  kind: "neural", installed: new Set(), downloads: new Map(), listeners: new Set(), worker: null, seq: 0, pending: new Map(),
  loaded: null, loading: null, ctx: null, source: null, finish: null, token: 0, cache: new Map(), scanned: null, loadErrors: new Map(), queue: [], running: false,
  available() { return typeof Worker !== "undefined" && typeof indexedDB !== "undefined" && typeof WebAssembly !== "undefined" && "AudioContext" in window; },
  scan() {
    return this.scanned = this.scanned || VDB.keys().then(keys => { this.installed = new Set(NEURAL_VOICES.filter(v => keys.includes("model:" + v.key)).map(v => v.key)); });
  },
  async listVoices() {
    if (!this.available()) return [];
    await this.scan();
    return NEURAL_VOICES.filter(v => this.installed.has(v.key)).flatMap(v => v.voices.map(x => ({ id: "neural:" + x.id, name: x.name + " · " + x.dialect, lang: "ca-ES", engine: "Veus Piper (dins l'app)", offline: true })));
  },
  onChange(f) { this.listeners.add(f); },
  changed() { for (const f of this.listeners) try { f(); } catch (e) { } },
  async state(key) { await this.scan(); const d = this.downloads.get(key); return d ? { state: "downloading", ...d } : { state: this.installed.has(key) ? "installed" : "none" }; },
  async downloadSize(v) { const keys = await VDB.keys(); return v.bytes + RUNTIME.filter(r => !keys.includes(r.key)).reduce((s, r) => s + r.bytes, 0); },
  async install(key) {
    const v = NEURAL_VOICES.find(x => x.key === key); if (!v || this.downloads.has(key)) return;
    const total = await this.downloadSize(v), got = new Map(), prog = k => n => { got.set(k, n); this.downloads.set(key, { loaded: [...got.values()].reduce((a, b) => a + b, 0), total }); this.changed(); };
    this.downloads.set(key, { loaded: 0, total }); this.changed();
    try {
      for (const r of RUNTIME) await cached(r.key, r.urls, prog(r.key));
      await cached("config:" + v.key, v.config);
      await cached("model:" + v.key, v.model, prog("model"));
      this.installed.add(key); this.loadErrors.delete(key);
    } finally { this.downloads.delete(key); this.changed(); }
  },
  async uninstall(key) {
    if (this.loaded === key) { if (this.worker) this.worker.terminate(); this.worker = null; this.loaded = null; this.loading = null; }
    await VDB.del("model:" + key); await VDB.del("config:" + key); this.installed.delete(key); this.loadErrors.delete(key); this.cache.clear(); this.changed();
  },
  makeWorker() {
    try { const url = URL.createObjectURL(new Blob([PIPER_WORKER_SRC], { type: "text/javascript" })); return new Worker(url); }
    catch (e) { return new Worker("data:text/javascript;charset=utf-8," + encodeURIComponent(PIPER_WORKER_SRC)); }
  },
  call(msg, transfer = [], low = false) {
    return new Promise(res => { const it = { msg, transfer, low, res }; if (low) this.queue.push(it); else this.queue.splice(this.queue.findIndex(q => q.low) >>> 0, 0, it); this.pump(); });
  },
  async pump() {
    if (this.running) return; this.running = true;
    try { for (let it = this.queue.shift(); it; it = this.queue.shift()) { const id = ++this.seq; const r = await new Promise(res => { this.pending.set(id, res); this.worker.postMessage({ ...it.msg, id }, it.transfer); }); it.res(r); } }
    finally { this.running = false; }
  },
  async runtime() {
    const g = k => VDB.get(k), ort = await g("runtime:" + ORT_FILE); if (!ort) throw Error("runtime missing");
    return { phonemizeWasm: await g("runtime:piper_phonemize.wasm"), phonemizeData: await g("runtime:piper_phonemize.data"), ortWasm: { [ORT_FILE]: ort } };
  },
  ensureLoaded(v) {
    if (this.loaded === v.key) return Promise.resolve();
    const le = this.loadErrors.get(v.key); if (le) return Promise.reject(Error(le));
    if (this.loading) return this.loading.then(() => this.ensureLoaded(v));
    this.loading = (async () => {
      if (!this.worker) {
        const w = this.makeWorker();
        w.onmessage = e => { const f = this.pending.get(e.data.id); this.pending.delete(e.data.id); if (f) f(e.data); };
        w.onerror = e => { e.preventDefault(); this.failWorker(e.message || "worker error"); };
        this.worker = w;
      }
      const m = await VDB.get("model:" + v.key); if (!m) throw Error("voice not downloaded");
      const c = await VDB.get("config:" + v.key), cfg = c ? JSON.parse(await c.text()) : undefined, buf = await m.arrayBuffer();
      const r = await this.call({ type: "load", runtime: await this.runtime(), key: v.key, family: v.family, model: buf, config: cfg }, [buf]);
      if (!r.ok) throw Error(r.error);
      this.loaded = v.key; this.cache.clear();
    })().catch(e => { this.loadErrors.set(v.key, String(e && e.message || e)); throw e; }).finally(() => { this.loading = null; });
    return this.loading;
  },
  failWorker(msg) { if (this.worker) this.worker.terminate(); this.worker = null; this.loaded = null; const p = [...this.pending.values()]; this.pending.clear(); for (const f of p) f({ id: 0, ok: false, error: msg }); },
  async buffer(id, txt, rate) {
    const v = neuralFor(id); if (!v) return null;
    const ck = id + "|" + rate + "|" + txt, hit = this.cache.get(ck); if (hit) return hit;
    await this.ensureLoaded(v);
    const spk = v.voices.find(x => x.id === id).speaker;
    const r = await this.call({ type: "synth", text: txt, rate, speaker: spk }); if (!r.ok) throw Error(r.error);
    if (!r.audio || !r.audio.length) return null;
    this.ctx = this.ctx || new AudioContext();
    const b = this.ctx.createBuffer(1, r.audio.length, r.sampleRate); b.copyToChannel(r.audio, 0);
    if (txt.length <= 30) { if (this.cache.size > 300) this.cache.delete(this.cache.keys().next().value); this.cache.set(ck, b); }
    return b;
  },
  async speak(id, txt, o) {
    this.stop(); const tk = ++this.token; let b;
    try { b = await this.buffer(id.slice(7), txt, o.rate); } catch (e) { console.warn("[neural]", e); return WebTTS.speak("", txt, o); } // si falla, la veu del navegador
    if (!b || tk !== this.token) return;
    const ctx = this.ctx; if (ctx.state === "suspended") await ctx.resume().catch(() => { });
    return new Promise(res => {
      const s = ctx.createBufferSource(), g = ctx.createGain(); g.gain.value = o.volume; s.buffer = b; s.connect(g).connect(ctx.destination);
      let done = false; const fin = () => { if (done) return; done = true; if (this.source === s) { this.source = null; this.finish = null; } res(); };
      s.onended = fin; this.source = s; this.finish = fin; s.start();
    });
  },
  stop() { this.token++; const s = this.source, f = this.finish; this.source = null; this.finish = null; try { if (s) s.stop(); } catch (e) { } if (f) f(); },
};

/* ---------- gestor: llista de veus i veu actual ---------- */
const TTS = {
  engines: [NeuralTTS, WebTTS], voices: [], listeners: new Set(),
  init() { for (const e of this.engines) if (e.available()) { if (e.onVoicesChanged) e.onVoicesChanged(() => this.refresh()); } NeuralTTS.onChange(() => this.refresh()); this.refresh(); },
  async refresh() {
    const all = await Promise.all(this.engines.filter(e => e.available()).map(e => e.listVoices().catch(() => [])));
    this.voices = all.flat(); for (const f of this.listeners) try { f(); } catch (e) { } return this.voices;
  },
  caVoices() { return this.voices.filter(v => isCa(v.lang)); },
  current() {
    const id = voiceCfg().id, v = id && this.voices.find(x => x.id === id); if (v) return v;
    const ca = this.caVoices();
    return ca.find(x => x.id.startsWith("neural:")) || ca.find(x => x.offline !== false) || ca[0] || null;
  },
  engineFor(v) { return this.engines.find(e => v && v.id.startsWith(e.kind + ":")) || WebTTS; },
  say(txt) {
    const c = voiceCfg(), v = this.current(), o = { rate: c.rate, pitch: c.pitch, volume: c.volume };
    this.stop();
    const token = this.token;
    Audio2.duck("voice", true);
    return Promise.resolve().then(() => token === this.token ? this.engineFor(v).speak(v ? v.id : "", txt, o) : undefined)
      .catch(() => {})
      .finally(() => { if (token === this.token) Audio2.duck("voice", false); });
  },
  stop() { this.token = (this.token || 0) + 1; Audio2.duck("voice", false); for (const e of this.engines) if (e.available()) e.stop(); },
};

/* ---------- so de les lletres: locucions enregistrades (veu de l'Anna, LECAA Docs) ---------- */
// lletra → fonema → fitxer, igual que a LECAA Docs (català central)
const LETTER_PHON = { a: "a", "à": "a", e: "e", "é": "e", "è": "ɛ", i: "i", "í": "i", "ï": "i", o: "o", "ó": "o", "ò": "ɔ", u: "u", "ú": "u", "ü": "u", b: "b", v: "b", c: "k", k: "k", q: "k", "ç": "s", d: "d", f: "f", g: "ɡ", j: "ʒ", l: "l", m: "m", n: "n", "ñ": "ɲ", p: "p", r: "r", s: "s", t: "t", x: "ʃ", z: "z", w: "w", y: "j", h: null };
const PHON_FILE = { a: "a", e: "e", "ɛ": "eo", i: "i", o: "o", "ɔ": "oo", u: "u", "ə": "schwa", s: "s", z: "z", l: "l", m: "m", r: "rr", "ɾ": "r", p: "p", t: "t", n: "n", k: "k", "ɡ": "g", d: "d", f: "f", b: "b", "ʒ": "zh", "ʎ": "ll", "ɲ": "ny", "ʃ": "sh", "t͡ʃ": "tsh", "d͡ʒ": "dzh", j: "j", w: "w", "lː": "lgem", v: "v" };
const Phon = {
  audio: null,
  url(letter) { const ph = LETTER_PHON[String(letter).toLowerCase()]; const f = ph && PHON_FILE[ph]; return f && typeof PHON_ANNA !== "undefined" ? PHON_ANNA[f] || null : null; },
  has(letter) { return !!this.url(letter); },
  play(letter) {
    const u = this.url(letter); if (!u) return false;
    this.stop(); try { const a = new Audio(u); a.volume = voiceCfg().volume; this.audio = a;
      Audio2.duck("phoneme", true);
      const finish = () => { if (this.audio === a) { this.audio = null; Audio2.duck("phoneme", false); } };
      a.onended = finish; a.onerror = finish; a.play().catch(finish);
    } catch (e) { Audio2.duck("phoneme", false); return false; }
    return true;
  },
  stop() { if (this.audio) { try { this.audio.pause(); } catch (e) { } this.audio = null; } Audio2.duck("phoneme", false); },
};

/* ---------- finestra d'ajustos de la veu (HTML per sobre del llenç) ---------- */
const VoicePanel = {
  el: null,
  get isOpen() { return !!this.el; },
  h(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v); else if (k === "class") e.className = v; else if (v === true) e.setAttribute(k, ""); else e.setAttribute(k, String(v)); }
    for (const c of kids) if (c != null && c !== false) e.append(c);
    return e;
  },
  css() {
    if (document.getElementById("vp-css")) return;
    const s = document.createElement("style"); s.id = "vp-css";
    s.textContent = `
.vp-back{position:fixed;inset:0;background:rgba(20,38,42,.55);z-index:50;display:flex;align-items:center;justify-content:center;font-family:${FONT_L};color:${BRAND.tinta}}
.vp{background:#fff;border:3px solid ${BRAND.petroli};border-radius:28px;width:min(760px,94vw);max-height:92vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.3);position:relative}
.vp header{display:flex;align-items:center;justify-content:space-between;padding:22px 30px 14px;border-bottom:2px solid #DDE7E4;position:sticky;top:0;background:#fff;z-index:1}
.vp h2{margin:0;font:900 30px ${FONT_T};color:${BRAND.tinta}}
.vp .x{width:48px;height:48px;border-radius:50%;border:3px solid ${BRAND.petroli};background:#fff;color:${BRAND.tinta};font:900 26px ${FONT_T};cursor:pointer;line-height:1}
.vp .x:hover{background:${BRAND.petroli};color:#fff}
.vp .body{padding:10px 30px 28px}
.vp fieldset{border:0;margin:14px 0 0;padding:0}
.vp legend{font:900 21px ${FONT_T};color:${BRAND.petroli};margin-bottom:10px}
.vp label{font-weight:700;font-size:19px}
.vp select{width:100%;font:700 19px ${FONT_L};padding:10px 12px;border-radius:12px;border:2px solid #C4D2CF;background:#F4F8F6;color:${BRAND.tinta};margin-top:6px}
.vp .row{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:10px 0}
.vp .btn{font:800 18px ${FONT_T};padding:9px 18px;border-radius:999px;border:2px solid #C4D2CF;background:${BRAND.menta};color:${BRAND.tinta};cursor:pointer}
.vp .btn:hover{border-color:${BRAND.petroli}}
.vp .btn.primary{background:${BRAND.petroli};border-color:${BRAND.petroli};color:#fff}
.vp .hint{font-size:16px;color:#4B6366;margin:6px 0;line-height:1.35}
.vp .hint a{color:${BRAND.petroli}}
.vp .item{background:#F4F8F6;border-radius:16px;padding:14px 18px;margin-top:8px}
.vp .item .t{font:900 20px ${FONT_T}}
.vp .ok{color:${BRAND.petroli};font-weight:800}
.vp progress{width:100%;height:14px;accent-color:${BRAND.petroli}}
.vp .slider{display:grid;grid-template-columns:150px 1fr 70px;align-items:center;gap:12px;margin:8px 0}
.vp input[type=range]{accent-color:${BRAND.petroli};width:100%}
.vp .chk{display:flex;gap:10px;align-items:center;margin:10px 0;font-weight:700;font-size:18px}
.vp .chk input{width:22px;height:22px;accent-color:${BRAND.petroli}}
.vp .msg{min-height:22px;font-weight:800;color:${BRAND.petroli};margin-top:6px}`;
    document.head.append(s);
  },
  open() {
    if (this.el) return; this.css();
    const H = this.h.bind(this), close = () => this.close();
    const voiceBox = H("div"), neuralBox = H("div"), msg = H("div", { class: "msg", role: "status" });
    const say = t => { msg.textContent = t; clearTimeout(this.mt); this.mt = setTimeout(() => { msg.textContent = ""; }, 4000); };
    const drawVoices = () => {
      const c = voiceCfg(), list = c.showAll ? TTS.voices : TTS.caVoices(), cur = TTS.current(), sel = H("select", { id: "vp-voice" }), groups = new Map();
      for (const v of list) groups.set(v.engine, [...(groups.get(v.engine) || []), v]);
      for (const [eng, vs] of groups) { const g = H("optgroup", { label: eng }); for (const v of vs) { const o = H("option", { value: v.id }, `${v.name} (${v.lang})${v.offline === false ? " · necessita connexió" : ""}`); o.selected = cur && cur.id === v.id; g.append(o); } sel.append(g); }
      sel.addEventListener("change", () => setVoiceCfg("id", sel.value));
      const n = TTS.caVoices().length;
      voiceBox.replaceChildren(
        list.length ? H("div", {}, H("label", { for: "vp-voice" }, `Veu (${n} en català)`), sel)
          : H("p", { class: "hint" }, "Aquest navegador no té cap veu en català. Pots descarregar-ne una de gratuïta aquí sota, o instal·lar una veu catalana al sistema i tornar a buscar veus."),
        H("div", { class: "row" },
          H("button", { class: "btn primary", type: "button", onclick: () => TTS.say("Hola! Aquesta és la veu de LECAA Tecla.") }, "Prova la veu"),
          H("button", { class: "btn", type: "button", onclick: async () => { await TTS.refresh(); drawVoices(); say("Llista de veus actualitzada"); } }, "Torna a buscar veus")),
        H("p", { class: "hint" }, "Només es mostren les veus que el navegador permet fer servir. Les marcades “necessita connexió” (per exemple les veus naturals de Microsoft Edge) són gratuïtes però funcionen en línia."));
    };
    const mb = b => Math.round(b / 1e6) + " MB";
    const drawNeural = async () => {
      if (!NeuralTTS.available()) { neuralBox.replaceChildren(H("p", { class: "hint" }, "Aquest navegador no pot fer servir les veus descarregables.")); return; }
      const items = await Promise.all(NEURAL_VOICES.map(async v => {
        const st = await NeuralTTS.state(v.key);
        const ctl = st.state === "downloading" ? H("div", {}, H("progress", { max: st.total || 1, value: st.loaded }), H("div", { class: "hint" }, `${mb(st.loaded)} de ${mb(st.total)}`))
          : st.state === "installed" ? H("div", { class: "row" }, H("span", { class: "ok" }, "Descarregada · funciona sense connexió"),
              H("button", { class: "btn", type: "button", onclick: async () => { if (confirm(`Vols esborrar ${v.title} d'aquest dispositiu?`)) { await NeuralTTS.uninstall(v.key); } } }, "Esborra"))
          : H("button", { class: "btn primary", type: "button", onclick: async () => {
              if (!navigator.onLine) { say("Cal connexió a internet per descarregar la veu"); return; }
              try { await NeuralTTS.install(v.key); await TTS.refresh(); setVoiceCfg("id", "neural:" + v.voices[0].id); drawVoices(); say(`${v.title} ja és a punt`); }
              catch (e) { say("No s'ha pogut descarregar la veu. Torna-ho a provar més tard."); }
            } }, `Descarrega (${mb(await NeuralTTS.downloadSize(v))})`);
        return H("div", { class: "item" }, H("div", { class: "t" }, v.title), H("p", { class: "hint" }, v.description, " ", H("a", { href: v.licenceUrl, target: "_blank", rel: "noopener" }, "Llicència"), ": ", v.licence), ctl);
      }));
      neuralBox.replaceChildren(...items);
    };
    const slider = (label, min, max, step, key) => {
      const out = H("span", { class: "ok" }), inp = H("input", { type: "range", min, max, step, value: voiceCfg()[key] });
      const show = () => { out.textContent = Math.round(inp.value * 100) + " %"; };
      inp.addEventListener("input", () => { setVoiceCfg(key, Number(inp.value)); show(); }); show();
      return H("div", { class: "slider" }, H("label", {}, label), inp, out);
    };
    const all = H("input", { type: "checkbox" }); all.checked = !!voiceCfg().showAll;
    all.addEventListener("change", () => { setVoiceCfg("showAll", all.checked); drawVoices(); });
    const panel = H("div", { class: "vp", role: "dialog", "aria-modal": "true", "aria-labelledby": "vp-title" },
      H("header", {}, H("h2", { id: "vp-title" }, "Ajustos de la veu"), H("button", { class: "x", type: "button", "aria-label": "Tanca", onclick: close }, "×")),
      H("div", { class: "body" },
        H("fieldset", {}, H("legend", {}, "Veu sintètica"), voiceBox,
          H("details", { open: TTS.caVoices().length === 0 }, H("summary", { class: "btn", style: "display:inline-block;margin:6px 0" }, "Veus catalanes gratuïtes per descarregar"),
            H("p", { class: "hint" }, "Es descarreguen una sola vegada i després funcionen dins l'app, sense connexió."), neuralBox),
          H("label", { class: "chk" }, all, "Mostra també veus d'altres llengües"),
          slider("Velocitat", 0.5, 1.6, 0.05, "rate"), slider("To", 0.6, 1.4, 0.05, "pitch"), slider("Volum", 0.1, 1, 0.05, "volume")),
        H("fieldset", {}, H("legend", {}, "So de les lletres"),
          H("p", { class: "hint" }, "Els sons de les lletres són locucions enregistrades amb la veu de l'Anna (les mateixes de LECAA Docs). Es fan servir a Blanc sobre negre."),
          H("div", { class: "row" }, ...["a", "m", "s", "l"].map(l => H("button", { class: "btn", type: "button", onclick: () => Phon.play(l) }, "So de la " + l)))),
        msg));
    const back = H("div", { class: "vp-back", onclick: e => { if (e.target === back) close(); } }, panel);
    this.onKey = e => { e.stopPropagation(); if (e.key === "Escape") close(); };
    window.addEventListener("keydown", this.onKey, true);
    document.body.append(back); this.el = back;
    this.redraw = () => { if (this.el) { drawVoices(); drawNeural(); } };
    TTS.listeners.add(this.redraw); NeuralTTS.onChange(() => this.el && drawNeural());
    drawVoices(); drawNeural(); TTS.refresh();
  },
  close() {
    if (!this.el) return; this.el.remove(); this.el = null;
    window.removeEventListener("keydown", this.onKey, true); TTS.listeners.delete(this.redraw); Sfx.play && Sfx.play("whoosh");
  },
};
