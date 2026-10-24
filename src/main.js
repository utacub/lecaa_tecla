"use strict";
/* ============================================================
   Arrencada i encaminament per a proves (#play=7&lvl=3…)
   ============================================================ */
function hashParams() { const o = {}; (location.hash || "").replace(/^#/, "").split("&").forEach(kv => { const [k, v] = kv.split("="); if (k) o[k] = v == null ? "1" : decodeURIComponent(v); }); return o; }
async function boot() {
  Img.svg("logoP", LOGO_SVG_P); Img.svg("logoW", LOGO_SVG_W);
  Voice.init();
  await Art.init(); // Embedded assets resolve on load or error before any cached scene is built.
  try { await Promise.race([Promise.all(["700 64px Andika", "400 24px Andika", "900 40px Nunito", "800 40px Nunito"].map(f => document.fonts.load(f))), wait(2)]); } catch (e) { }
  await Promise.race([new Promise(r => { const im = Img.get("logoP"); if (im.complete) r(); else im.onload = r; }), wait(1)]);
  App.init();
  const q = hashParams();
  if (q.reduce) Settings.reduceMotion = true;
  if (q.voice === "0") Settings.voice = false;
  let prof = Profiles.list[0];
  const lastId = Store.get("lastProfile", null); if (lastId) prof = Profiles.list.find(p => p.id === lastId) || prof;
  if ((q.play || q.scene) && !prof) prof = Profiles.add(L_("Prova"), 0, 1);
  Profiles.cur = prof;
  if (q.play && Games.byId[q.play]) App.setScene(new GameScene(Games.byId[q.play], +(q.lvl || 1), prof, { skipDemo: q.demo !== "1" }));
  else if (q.scene === "island") App.setScene(new IslandScene(prof, { focus: +(q.focus || 1), intro: q.intro === "1" }));
  else if (q.scene === "voyage") App.setScene(new VoyageScene(prof));
  else if (q.scene === "profiles") App.setScene(new ProfileScene());
  else if (q.scene === "museum") App.setScene(new MuseumScene(prof));
  else if (q.scene === "teacher") App.setScene(new TeacherScene());
  else if (q.scene === "bsn" || Store.get("bsn", {}).locked) App.setScene(new BlackWhiteScene()); // si es va tancar bloquejada, torna a obrir-se bloquejada
  else App.setScene(new TitleScene());
  if (q.auto) { // joc automàtic per a proves: tecla bona amb un 90% d'encerts
    const acc = +(q.acc || 0.9), every = +(q.every || 350);
    setInterval(() => { const s = App.scene; if (s instanceof GameScene && s.state === "play" && s.halt) { s.onKey(" "); return; } if (s instanceof GameScene && s.state === "play" && s.api.freeze <= 0) { const e = s.g.expected && s.g.expected(); if (!e && s.def.autoKey) { const k = s.def.autoKey(s.g); if (k) s.onKey(k); return; } if (e) s.onKey(Math.random() < acc ? e : pick("qwxzjk".split("").filter(c => c !== e))); } }, every);
  }
  window.LT = { App, Games, GameScene, Settings, Profiles, Voice, Sfx, ShellArt, TitleScene, ProfileScene, IslandScene, VoyageScene, PLACES, Mouse, Store, ANIMALS, PLUSH, drawAvatar, NativeIsland, SHELL_MAP };
}
addEventListener("load", boot);

