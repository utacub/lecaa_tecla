"use strict";
/* ============================================================
   Idiomes: els mateixos de Mira i Juga (ca, es, eu, gl, en, fr).
   El català és l'idioma font: L_("text en català") torna la traducció de l'idioma actiu
   (diccionaris a src/lang/*.js) o el mateix text si no n'hi ha.
   Canviar d'idioma desa la tria i recarrega l'app, de manera que totes les llistes,
   textos i dibuixos es tornen a construir en el nou idioma.
   ============================================================ */
const LANGS = [
  { id: "ca", label: "Català", locale: "ca-ES", layout: "es" },
  { id: "es", label: "Castellano", locale: "es-ES", layout: "es" },
  { id: "eu", label: "Euskara", locale: "eu-ES", layout: "es" },
  { id: "gl", label: "Galego", locale: "gl-ES", layout: "es" },
  { id: "en", label: "English", locale: "en-GB", layout: "uk" },
  { id: "fr", label: "Français", locale: "fr-FR", layout: "fr" },
];
const I18N = {};   // I18N.es = { "text en català": "texto en castellano", … }
const LANG_DATA = {}; // continguts per idioma (lletres, paraules, freqüències…): src/lang/*.js
const LANG = (() => {
  const ok = l => LANGS.some(x => x.id === l);
  const h = /(?:^|[#&])lang=([a-z]{2})/.exec(location.hash || "");
  if (h && ok(h[1])) return h[1];
  const saved = Store.get("lang", null); if (ok(saved)) return saved;
  // qui ja feia servir l'app abans de ser multilingüe continua en català
  if (Store.get("settings", null) || Store.get("profiles", null)) return "ca";
  // la primera vegada, l'idioma del navegador si és un dels sis (com a Mira i Juga)
  const l = String(navigator.language || "ca").slice(0, 2).toLowerCase();
  return ok(l) ? l : "ca";
})();
if (Store.get("lang", null) !== LANG && !/(?:^|[#&])lang=/.test(location.hash || "")) Store.set("lang", LANG);
const LANG_INFO = LANGS.find(l => l.id === LANG);
const LOCALE = LANG_INFO.locale;
try { document.documentElement.lang = LANG; } catch (e) { }
if (!Settings.layoutFixed) Settings.layout = LANG_INFO.layout;
function L_(s, p) {
  let r = (LANG !== "ca" && I18N[LANG] && I18N[LANG][s]) || s;
  if (p) r = r.replace(/\{(\w+)\}/g, (m, k) => p[k] != null ? p[k] : m);
  return r;
}
function setLang(l) {
  if (l === LANG || !LANGS.some(x => x.id === l)) return;
  Store.set("lang", l);
  // la disposició del teclat segueix l'idioma, si l'adult no n'ha triat cap altra
  if (!Settings.layoutFixed) { Settings.layout = LANGS.find(x => x.id === l).layout; saveSettings(); }
  try { location.hash = (location.hash || "").replace(/(^#|&)lang=[a-z]{2}/, "$1").replace(/^#&/, "#"); } catch (e) { }
  location.reload();
}
/* continguts propis d'un joc que depenen de l'idioma (paraules per escriure, ordres, cançons…):
   LX("g02.giant5", [... en català]) torna la llista de l'idioma actiu (LANG_DATA.xx.games) o la catalana.
   LXM fa el mateix amb un objecte de fitxes i només substitueix els camps que l'idioma redefineix. */
function LX(key, ca) { const g = LANG !== "ca" && LANG_DATA[LANG] && LANG_DATA[LANG].games; return g && g[key] != null ? g[key] : ca; }
function LXM(key, ca) {
  const o = LX(key, null); if (!o) return ca;
  const r = {}; for (const k in ca) r[k] = Object.assign({}, ca[k], o[k] || {}); return r;
}
// paraula escrita en l'idioma → clau del dibuix (en català), comuna a tots els jocs: LANG_DATA.xx.games.kind = { "manzana": "poma", … }
function LK(key) { const m = LX(key, null) || {}; return w => m[w] || w; }
const lower = s => String(s).toLocaleLowerCase(LOCALE);
const upper = s => String(s).toLocaleUpperCase(LOCALE);
const capFirst = s => s ? upper(s.charAt(0)) + s.slice(1) : s;
